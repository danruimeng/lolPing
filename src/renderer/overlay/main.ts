import {
  GENERIC_PING, TICK_SOUND, allSoundNames, allTextureNames, pingById, textureUrl, type PingDef,
} from '../../shared/pings';
import { DEFAULT_SETTINGS, overlaySettings, type OverlaySettings } from '../../shared/settings';
import { spawnPing } from './pingFx';
import { SoundBank } from './soundBank';
import { showToast } from './toast';
import { Wheel } from './wheel';

const pingLayer = document.getElementById('pings') as HTMLElement;
const toastLayer = document.getElementById('toasts') as HTMLElement;
const svg = document.getElementById('wheel') as unknown as SVGSVGElement;

const sounds = new SoundBank();
let settings: OverlaySettings = overlaySettings(DEFAULT_SETTINGS);
const volume = (): number => (settings.muted ? 0 : settings.volume / 100);

const wheel = new Wheel(svg, () => {
  if (settings.tickSound) sounds.play(TICK_SOUND, volume() * 0.5);
});

function ping(def: PingDef, x: number, y: number): void {
  spawnPing(pingLayer, def, x, y, { sizePx: settings.pingSizePx, durationS: settings.pingDurationS });
  sounds.play(def.sound, volume());
}

window.overlay.on('overlay:settings', (s) => {
  settings = s;
});
window.overlay.on('wheel:open', (p) => wheel.open(p.x, p.y));
window.overlay.on('wheel:move', (p) => wheel.move(p.x, p.y));
window.overlay.on('wheel:release', (p) => {
  const chosen = wheel.release(p.x, p.y);
  if (chosen) ping(chosen.def, chosen.x, chosen.y);
});
window.overlay.on('wheel:cancel', () => wheel.cancel());
window.overlay.on('ping:spawn', (p) => ping(pingById(p.id) ?? GENERIC_PING, p.x, p.y));
window.overlay.on('toast:show', (t) => showToast(toastLayer, t.title, t.body));

function checkTextures(): Promise<string[]> {
  return Promise.all(
    allTextureNames().map(
      (name) =>
        new Promise<string | null>((resolve) => {
          const probe = new Image();
          probe.onload = () => resolve(null);
          probe.onerror = () => resolve(`textures/${name}.png`);
          probe.src = textureUrl(name);
        }),
    ),
  ).then((r) => r.filter((x): x is string => x !== null));
}

void Promise.all([sounds.load(allSoundNames()), checkTextures()]).then(([missingSounds, missingTextures]) => {
  const missing = [...missingSounds, ...missingTextures];
  if (missing.length > 0) window.overlay.reportMissingAssets(missing);
});
