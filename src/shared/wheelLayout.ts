import { WHEEL_SLOTS, isPingId, type PingId } from './pings';

/** A wheel is exactly WHEEL_SLOTS known pings, each at most once. */
export function isValidWheel(v: unknown): v is PingId[] {
  return Array.isArray(v) && v.length === WHEEL_SLOTS && v.every(isPingId) && new Set(v).size === v.length;
}

/** Puts `id` in `slot`. If it is already elsewhere on the wheel, the two slots swap so no ping appears twice. */
export function placeOnSlot(wheel: readonly PingId[], id: PingId, slot: number): PingId[] {
  const from = wheel.indexOf(id);
  if (from >= 0) return swapSlots(wheel, from, slot);
  const next = [...wheel];
  next[slot] = id;
  return next;
}

export function swapSlots(wheel: readonly PingId[], a: number, b: number): PingId[] {
  const next = [...wheel];
  [next[a], next[b]] = [next[b], next[a]];
  return next;
}

/** Where a dragged or click-selected ping in the wheel editor came from. */
export type WheelSource =
  | { from: 'pool'; id: PingId }
  | { from: 'slot'; id: PingId; slot: number }
  | { from: 'center'; id: PingId };
/** A wheel slot index, or the centre (the trigger + click ping). */
export type WheelTarget = number | 'center';
export type WheelPatch = { wheel?: PingId[]; clickPingId?: PingId };

/** The settings change for dropping `src` on `target`, or null when nothing changes. */
export function dropPatch(wheel: readonly PingId[], clickPingId: PingId, src: WheelSource, target: WheelTarget): WheelPatch | null {
  if (target === 'center') return src.id === clickPingId ? null : { clickPingId: src.id };
  if (src.from === 'slot') return src.slot === target ? null : { wheel: swapSlots(wheel, src.slot, target) };
  return wheel[target] === src.id ? null : { wheel: placeOnSlot(wheel, src.id, target) };
}
