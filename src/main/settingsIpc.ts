import { globalShortcut, ipcMain, shell } from 'electron';
import { SETTINGS_CH, type About, type AppStatus, type SetSettingsResult } from '../shared/ipc';
import { hotkeyLabel, hotkeyToAccelerator, type Hotkey } from '../shared/keys';
import { pingById, type PingId } from '../shared/pings';
import type { Settings } from '../shared/settings';
import type { SettingsStore } from './settingsStore';

export interface SettingsIpcDeps {
  store: SettingsStore;
  getStatus(): AppStatus;
  setEnabled(on: boolean): void;
  preview(id: PingId): void;
  about(): About;
  retryHelper(): void;
  setCapturing(on: boolean): void;
}

/** Returns an error message when another app already owns this shortcut. */
function hotkeyConflict(next: Hotkey, current: Hotkey): string | null {
  if (next.mods === current.mods && next.vk === current.vk) return null;
  const accelerator = hotkeyToAccelerator(next);
  if (!accelerator) return null;
  try {
    const free = globalShortcut.register(accelerator, () => undefined);
    if (free) globalShortcut.unregister(accelerator);
    return free ? null : `${hotkeyLabel(next)} is already used by another app.`;
  } catch {
    return null;
  }
}

export function registerSettingsIpc(d: SettingsIpcDeps): void {
  ipcMain.handle(SETTINGS_CH.get, () => d.store.get());
  ipcMain.handle(SETTINGS_CH.set, (_e, patch: Partial<Settings>): SetSettingsResult => {
    if (patch.toggleHotkey) {
      const error = hotkeyConflict(patch.toggleHotkey, d.store.get().toggleHotkey);
      if (error) return { ok: false, error, settings: d.store.get() };
    }
    return { ok: true, settings: d.store.update(patch) };
  });
  ipcMain.handle(SETTINGS_CH.status, () => d.getStatus());
  ipcMain.handle(SETTINGS_CH.setEnabled, (_e, on: unknown) => d.setEnabled(on === true));
  ipcMain.handle(SETTINGS_CH.preview, (_e, id: unknown) => {
    const p = typeof id === 'string' ? pingById(id) : undefined;
    if (p) d.preview(p.id);
  });
  ipcMain.handle(SETTINGS_CH.about, () => d.about());
  ipcMain.handle(SETTINGS_CH.openFolder, async () => {
    await shell.openPath(d.store.dir);
  });
  ipcMain.handle(SETTINGS_CH.retryHelper, () => d.retryHelper());
  ipcMain.handle(SETTINGS_CH.capture, (_e, on: unknown) => d.setCapturing(on === true));
}
