export type PingId =
  | 'danger' | 'push' | 'omw' | 'allin' | 'assist' | 'needvision' | 'missing' | 'enemyvision' | 'generic';

export interface PingDef {
  id: PingId;
  name: string;
  /** Texture on the wheel slice: file in assets/textures without ".png". */
  icon: string;
  /** Textures drawn at the ping location. Two entries = All In's clashing halves. */
  art: string[];
  /** File in assets/sounds without ".wav". */
  sound: string;
  /** Ring and glow colour. */
  color: string;
}

/** Wheel slices, top (N) then clockwise. Array index = slice index from pickSlice(). */
export const WHEEL_PINGS: readonly PingDef[] = [
  { id: 'danger', name: 'Danger', icon: 'pingwheel_retreatrender', art: ['pingwheel_retreatrender'], sound: 'SRP_12', color: '#ff3b55' },
  { id: 'push', name: 'Push', icon: 'push', art: ['pingwheel_pushrender'], sound: 'SRP_9', color: '#35d27a' },
  { id: 'omw', name: 'On My Way', icon: 'omw', art: ['omw'], sound: 'OnMyWay', color: '#2e8bff' },
  { id: 'allin', name: 'All In', icon: 'all_in', art: ['pingwheel_allin_render_01', 'pingwheel_allin_render_02'], sound: 'SRP_4', color: '#f2b320' },
  { id: 'assist', name: 'Assist Me', icon: 'assist_me', art: ['assist_me'], sound: 'ComeHere', color: '#56d43c' },
  { id: 'needvision', name: 'Need Vision', icon: 'need_vision', art: ['need_vision'], sound: 'SRP_7', color: '#56d43c' },
  { id: 'missing', name: 'Enemy Missing', icon: 'enemy_missing', art: ['enemy_missing'], sound: 'MIA', color: '#f2c518' },
  { id: 'enemyvision', name: 'Enemy Vision', icon: 'enemy_vision', art: ['pingwheel_enemyvisionrender'], sound: 'AreaIsWarded', color: '#ff3b55' },
];

export const GENERIC_PING: PingDef = {
  id: 'generic', name: 'Generic', icon: 'generic_ping', art: ['pingwheel_basicpingrender'], sound: 'Base', color: '#2e8bff',
};

export const ALL_PINGS: readonly PingDef[] = [...WHEEL_PINGS, GENERIC_PING];
export const TICK_SOUND = 'button';
export const FALLBACK_TEXTURE = 'generic_ping';

export function pingById(id: string): PingDef | undefined {
  return ALL_PINGS.find((p) => p.id === id);
}

/** Relative to a renderer page at <root>/<page>/index.html; assets/ is served at <root>/. */
export const textureUrl = (name: string): string => `../textures/${name}.png`;
export const soundUrl = (name: string): string => `../sounds/${name}.wav`;

export function allSoundNames(): string[] {
  return [...new Set([...ALL_PINGS.map((p) => p.sound), TICK_SOUND])];
}

export function allTextureNames(): string[] {
  return [...new Set([...ALL_PINGS.flatMap((p) => [p.icon, ...p.art]), FALLBACK_TEXTURE])];
}
