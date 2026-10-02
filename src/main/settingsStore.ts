import { EventEmitter } from 'node:events';
import { copyFileSync, existsSync, readFileSync } from 'node:fs';
import { mkdir, rename, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { mergeSettings, normalizeSettings, type Settings } from '../shared/settings';

/** Windows can briefly lock the target (antivirus, indexer), failing rename with one of these codes. */
const TRANSIENT_RENAME_CODES: ReadonlySet<string> = new Set(['EPERM', 'EBUSY', 'EACCES']);
/** Delay before each retry: 3 attempts in total. */
const RENAME_RETRY_DELAYS_MS: readonly number[] = [50, 100];

async function renameWithRetry(from: string, to: string): Promise<void> {
  for (let attempt = 0; ; attempt++) {
    try {
      await rename(from, to);
      return;
    } catch (err) {
      const code = (err as NodeJS.ErrnoException).code;
      if (attempt >= RENAME_RETRY_DELAYS_MS.length || !code || !TRANSIENT_RENAME_CODES.has(code)) throw err;
      await new Promise<void>((resolve) => setTimeout(resolve, RENAME_RETRY_DELAYS_MS[attempt]));
    }
  }
}

/** Loads, validates and persists settings.json. Emits 'change' (Settings) after every update. */
export class SettingsStore extends EventEmitter {
  readonly file: string;
  readonly problems: string[] = [];
  private current: Settings = normalizeSettings(undefined);
  private timer: NodeJS.Timeout | null = null;
  private writing: Promise<void> = Promise.resolve();

  constructor(readonly dir: string, private readonly debounceMs = 300) {
    super();
    this.file = join(dir, 'settings.json');
  }

  load(): Settings {
    if (!existsSync(this.file)) {
      this.current = normalizeSettings(undefined);
      return this.current;
    }
    try {
      this.current = normalizeSettings(JSON.parse(readFileSync(this.file, 'utf8')));
    } catch (err) {
      let backup = 'it was backed up to settings.bak.json';
      try {
        copyFileSync(this.file, join(this.dir, 'settings.bak.json'));
      } catch (copyErr) {
        backup = `it could not be backed up to settings.bak.json (${(copyErr as Error).message})`;
      }
      this.problems.push(`settings.json could not be read (${(err as Error).message}); ${backup} and defaults were restored.`);
      this.current = normalizeSettings(undefined);
    }
    return this.current;
  }

  get(): Settings {
    return this.current;
  }

  update(patch: Partial<Settings>): Settings {
    this.current = mergeSettings(this.current, patch);
    this.emit('change', this.current);
    this.scheduleSave();
    return this.current;
  }

  /** Writes now via temp file + rename. Safe to call repeatedly; writes are serialized. */
  flush(): Promise<void> {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    const data = JSON.stringify(this.current, null, 2);
    this.writing = this.writing
      .catch(() => undefined)
      .then(async () => {
        await mkdir(this.dir, { recursive: true });
        const tmp = `${this.file}.tmp`;
        try {
          await writeFile(tmp, data, 'utf8');
          await renameWithRetry(tmp, this.file);
        } catch (err) {
          await rm(tmp, { force: true }).catch(() => undefined);
          throw err;
        }
      })
      .catch((err: Error) => {
        this.problems.push(`Could not save settings: ${err.message}`);
      });
    return this.writing;
  }

  private scheduleSave(): void {
    if (this.timer) clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.timer = null;
      void this.flush();
    }, this.debounceMs);
  }
}
