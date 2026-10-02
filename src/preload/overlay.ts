import { contextBridge, ipcRenderer } from 'electron';
import { OVERLAY_ASSETS, OVERLAY_CHANNELS, type OverlayChannel, type OverlayEvents } from '../shared/ipc';

const api = {
  on<C extends OverlayChannel>(channel: C, cb: (payload: OverlayEvents[C]) => void): void {
    if (!OVERLAY_CHANNELS.includes(channel)) throw new Error(`unknown overlay channel: ${channel}`);
    ipcRenderer.on(channel, (_event, payload: OverlayEvents[C]) => cb(payload));
  },
  reportMissingAssets(names: string[]): void {
    ipcRenderer.send(OVERLAY_ASSETS, names);
  },
};

contextBridge.exposeInMainWorld('overlay', api);

export type OverlayApi = typeof api;
