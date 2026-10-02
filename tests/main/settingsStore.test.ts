import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { SettingsStore } from '../../src/main/settingsStore';
import { DEFAULT_SETTINGS, type Settings } from '../../src/shared/settings';

const tempDir = () => mkdtempSync(join(tmpdir(), 'lolping-'));
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

describe('SettingsStore', () => {
  it('uses defaults when there is no file', () => {
    const store = new SettingsStore(tempDir());
    expect(store.load()).toEqual(DEFAULT_SETTINGS);
    expect(store.problems).toEqual([]);
  });

  it('backs up a corrupt file and falls back to defaults', () => {
    const dir = tempDir();
    writeFileSync(join(dir, 'settings.json'), '{ not json');
    const store = new SettingsStore(dir);
    expect(store.load()).toEqual(DEFAULT_SETTINGS);
    expect(readFileSync(join(dir, 'settings.bak.json'), 'utf8')).toBe('{ not json');
    expect(store.problems).toHaveLength(1);
  });

  it('normalizes values read from disk', () => {
    const dir = tempDir();
    writeFileSync(join(dir, 'settings.json'), JSON.stringify({ volume: 900, trigger: 'ctrl' }));
    const s = new SettingsStore(dir).load();
    expect(s.volume).toBe(100);
    expect(s.trigger).toBe('ctrl');
  });

  it('emits change with the normalized value', () => {
    const store = new SettingsStore(tempDir());
    store.load();
    let seen: Settings | null = null;
    store.on('change', (s: Settings) => {
      seen = s;
    });
    const result = store.update({ pingSizePx: 10 });
    expect(result.pingSizePx).toBe(60);
    expect(seen).toEqual(result);
    expect(store.get()).toEqual(result);
  });

  it('flushes atomically and round-trips', async () => {
    const dir = tempDir();
    const store = new SettingsStore(dir);
    store.load();
    store.update({ volume: 33, clickPing: true });
    await store.flush();
    expect(existsSync(join(dir, 'settings.json.tmp'))).toBe(false);
    const again = new SettingsStore(dir).load();
    expect(again.volume).toBe(33);
    expect(again.clickPing).toBe(true);
  });

  it('debounces writes and keeps the last value', async () => {
    const dir = tempDir();
    const store = new SettingsStore(dir, 60);
    store.load();
    store.update({ volume: 10 });
    store.update({ volume: 20 });
    // Well inside the debounce window: an immediate (or ignored-debounce) write would have landed by now.
    await sleep(25);
    expect(existsSync(join(dir, 'settings.json'))).toBe(false);
    await sleep(150);
    expect(JSON.parse(readFileSync(join(dir, 'settings.json'), 'utf8')).volume).toBe(20);
  });

  it('still falls back to defaults when the corrupt file cannot be backed up', () => {
    const dir = tempDir();
    writeFileSync(join(dir, 'settings.json'), '{ not json');
    mkdirSync(join(dir, 'settings.bak.json')); // a directory in the way makes copyFileSync fail
    const store = new SettingsStore(dir);
    let loaded: Settings | undefined;
    expect(() => {
      loaded = store.load();
    }).not.toThrow();
    expect(loaded).toEqual(DEFAULT_SETTINGS);
    expect(store.problems).toHaveLength(1);
    expect(store.problems[0]).toContain('could not be backed up');
  });

  it('records a failed save in problems and leaves no .tmp behind', async () => {
    const dir = tempDir();
    mkdirSync(join(dir, 'settings.json')); // rename onto a directory always fails
    const store = new SettingsStore(dir);
    store.update({ volume: 5 });
    await expect(store.flush()).resolves.toBeUndefined();
    expect(store.problems.some((p) => p.startsWith('Could not save settings'))).toBe(true);
    expect(existsSync(join(dir, 'settings.json.tmp'))).toBe(false);
  });

  it.skipIf(process.platform !== 'win32')('retries a transient rename failure (EPERM on Windows)', async () => {
    const dir = tempDir();
    const target = join(dir, 'settings.json');
    mkdirSync(target); // Windows reports EPERM for rename-onto-directory, a retryable code
    setTimeout(() => rmSync(target, { recursive: true }), 20); // the "antivirus lock" clears before the retry
    const store = new SettingsStore(dir);
    store.update({ volume: 44 });
    await store.flush();
    expect(store.problems).toEqual([]);
    expect(JSON.parse(readFileSync(target, 'utf8')).volume).toBe(44);
    expect(existsSync(`${target}.tmp`)).toBe(false);
  });
});
