import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  ALL_PINGS, GENERIC_PING, WHEEL_PINGS, allSoundNames, allTextureNames, pingById, soundUrl, textureUrl,
} from '../../src/shared/pings';

const assets = resolve(__dirname, '../../assets');

describe('ping table', () => {
  it('lists the 8 wheel slices top then clockwise', () => {
    expect(WHEEL_PINGS.map((p) => p.id)).toEqual([
      'danger', 'push', 'omw', 'allin', 'assist', 'needvision', 'missing', 'enemyvision',
    ]);
  });

  it('keeps the generic ping off the wheel', () => {
    expect(WHEEL_PINGS).not.toContain(GENERIC_PING);
    expect(ALL_PINGS.at(-1)).toBe(GENERIC_PING);
  });

  it('has unique ids', () => {
    expect(new Set(ALL_PINGS.map((p) => p.id)).size).toBe(ALL_PINGS.length);
  });

  it('references only textures that exist', () => {
    for (const name of allTextureNames()) {
      expect(existsSync(resolve(assets, 'textures', `${name}.png`)), name).toBe(true);
    }
  });

  it('references only sounds that exist', () => {
    for (const name of allSoundNames()) {
      expect(existsSync(resolve(assets, 'sounds', `${name}.wav`)), name).toBe(true);
    }
  });

  it('never uses colourblind textures', () => {
    for (const name of allTextureNames()) expect(name).not.toMatch(/_cb/);
  });

  it('gives All In two clashing halves and every other ping one art image', () => {
    for (const p of ALL_PINGS) expect(p.art.length).toBe(p.id === 'allin' ? 2 : 1);
  });

  it('looks pings up by id', () => {
    expect(pingById('omw')?.sound).toBe('OnMyWay');
    expect(pingById('nope')).toBeUndefined();
  });

  it('builds page-relative asset URLs', () => {
    expect(textureUrl('omw')).toBe('../textures/omw.png');
    expect(soundUrl('MIA')).toBe('../sounds/MIA.wav');
  });
});
