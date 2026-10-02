import { FALLBACK_TEXTURE, textureUrl, type PingDef } from '../../shared/pings';

export interface PingFxOptions {
  sizePx: number;
  durationS: number;
}

function img(name: string, cls = ''): HTMLImageElement {
  const el = document.createElement('img');
  if (cls) el.className = cls;
  el.src = textureUrl(name);
  el.onerror = () => {
    el.onerror = null;
    el.src = textureUrl(FALLBACK_TEXTURE);
  };
  return el;
}

const div = (cls: string): HTMLDivElement => {
  const d = document.createElement('div');
  d.className = cls;
  return d;
};

/** Adds one animated ping at (x, y) and removes it when its animation ends. */
export function spawnPing(layer: HTMLElement, def: PingDef, x: number, y: number, opts: PingFxOptions): void {
  const root = div('ping');
  root.style.left = `${x}px`;
  root.style.top = `${y}px`;
  root.style.setProperty('--c', def.color);
  root.style.setProperty('--size', `${opts.sizePx}px`);
  root.style.setProperty('--dur', `${opts.durationS}s`);
  root.append(div('ground'), div('ring'), div('ring r2'), div('ring r3'));

  const art = div('art');
  if (def.art.length === 2) {
    const clash = div('clash');
    clash.append(img(def.art[0], 'a1'), img(def.art[1], 'a2'));
    art.append(clash, div('flash'));
  } else {
    const pop = div('pop');
    pop.append(img(def.art[0]));
    art.append(pop);
  }
  root.append(art);
  layer.append(root);
  setTimeout(() => root.remove(), opts.durationS * 1000 + 150);
}
