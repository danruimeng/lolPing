import { app, type BrowserWindow } from 'electron';
import { join } from 'node:path';
import { APP_SCHEME } from './appProtocol';

export type Page = 'overlay' | 'settings';

export const helperExePath = (): string =>
  app.isPackaged
    ? join(process.resourcesPath, 'hook-helper.exe')
    : join(app.getAppPath(), 'native', 'hook-helper', 'build', 'hook-helper.exe');

export const preloadPath = (name: Page): string => join(__dirname, '../preload', `${name}.js`);

/** Files from assets/ (in production they are copied into out/renderer by Vite's publicDir). */
export const assetPath = (...parts: string[]): string =>
  app.isPackaged ? join(__dirname, '../renderer', ...parts) : join(app.getAppPath(), 'assets', ...parts);

export const settingsDir = (): string => join(app.getPath('appData'), 'lolPing');

export function loadPage(win: BrowserWindow, page: Page): Promise<void> {
  const devUrl = process.env.ELECTRON_RENDERER_URL;
  return devUrl ? win.loadURL(`${devUrl}/${page}/index.html`) : win.loadURL(`${APP_SCHEME}://app/${page}/index.html`);
}
