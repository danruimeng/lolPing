import { Menu, Tray, nativeImage, type MenuItemConstructorOptions, type NativeImage } from 'electron';

export type TrayMode = 'on' | 'off' | 'failed';

export interface TrayHandlers {
  openSettings(): void;
  setEnabled(on: boolean): void;
  retryHelper(): void;
  quit(): void;
}

/** Re-colours a premultiplied BGRA bitmap pixel by pixel. */
function recolor(base: NativeImage, fn: (r: number, g: number, b: number, a: number) => [number, number, number, number]): NativeImage {
  const { width, height } = base.getSize();
  const bmp = Buffer.from(base.toBitmap());
  for (let i = 0; i < bmp.length; i += 4) {
    const [r, g, b, a] = fn(bmp[i + 2], bmp[i + 1], bmp[i], bmp[i + 3]);
    bmp[i] = b;
    bmp[i + 1] = g;
    bmp[i + 2] = r;
    bmp[i + 3] = a;
  }
  return nativeImage.createFromBitmap(bmp, { width, height });
}

export class AppTray {
  private readonly tray: Tray;
  private readonly icons: Record<TrayMode, NativeImage>;
  private mode: TrayMode = 'on';
  private enabled = true;
  private destroyed = false;

  constructor(iconPath: string, private readonly handlers: TrayHandlers) {
    const base = nativeImage.createFromPath(iconPath).resize({ width: 32, height: 32, quality: 'best' });
    this.icons = {
      on: base,
      // grey and half transparent (scale every channel: the bitmap is premultiplied)
      off: recolor(base, (r, g, b, a) => {
        const l = Math.round((0.3 * r + 0.59 * g + 0.11 * b) * 0.5);
        return [l, l, l, Math.round(a * 0.5)];
      }),
      // solid orange silhouette = warning
      failed: recolor(base, (_r, _g, _b, a) => [a, Math.round(a * 0.55), Math.round(a * 0.15), a]),
    };
    this.tray = new Tray(this.icons.on);
    this.tray.on('click', () => handlers.openSettings());
    this.render();
  }

  /** A no-op once destroyed: helper events can still arrive while the app is quitting. */
  set(mode: TrayMode, enabled: boolean): void {
    if (this.destroyed) return;
    this.mode = mode;
    this.enabled = enabled;
    this.render();
  }

  /** Idempotent. */
  destroy(): void {
    if (this.destroyed) return;
    this.destroyed = true;
    this.tray.destroy();
  }

  private render(): void {
    const failed = this.mode === 'failed';
    this.tray.setImage(this.icons[this.mode]);
    this.tray.setToolTip(failed ? 'lolPing: input helper stopped' : `lolPing: pings ${this.enabled ? 'on' : 'off'}`);
    const items: MenuItemConstructorOptions[] = [
      { label: 'Enabled', type: 'checkbox', checked: this.enabled, enabled: !failed, click: (item) => this.handlers.setEnabled(item.checked) },
    ];
    if (failed) items.push({ label: 'Restart input helper', click: () => this.handlers.retryHelper() });
    items.push(
      { type: 'separator' },
      { label: 'Settings…', click: () => this.handlers.openSettings() },
      { label: 'Quit lolPing', click: () => this.handlers.quit() },
    );
    this.tray.setContextMenu(Menu.buildFromTemplate(items));
  }
}
