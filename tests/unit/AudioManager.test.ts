import { afterEach, describe, expect, it } from 'vitest';
import {
  AudioManager,
  effectiveGain,
  type AudioSettings,
} from '../../src/game/core/AudioManager';

/**
 * The audio mixer's job is one number: the gain a clip on a given bus should
 * play at. These tests lock that math (master × bus × mute) and the settings
 * mutation/clamp behaviour, which drive every play call and the settings UI.
 */

function settings(overrides: Partial<Record<keyof AudioSettings, { volume: number; muted: boolean }>> = {}): AudioSettings {
  return {
    master: { volume: 1, muted: false },
    sfx: { volume: 1, muted: false },
    music: { volume: 1, muted: false },
    voice: { volume: 1, muted: false },
    ...overrides,
  };
}

afterEach(() => {
  AudioManager.resetForTests();
});

describe('effectiveGain', () => {
  it('multiplies master × bus × clip', () => {
    const s = settings({ master: { volume: 0.5, muted: false }, sfx: { volume: 0.8, muted: false } });
    expect(effectiveGain(s, 'sfx', 0.5)).toBeCloseTo(0.5 * 0.8 * 0.5);
  });

  it('returns 0 when the bus is muted', () => {
    const s = settings({ music: { volume: 1, muted: true } });
    expect(effectiveGain(s, 'music')).toBe(0);
  });

  it('returns 0 when master is muted, regardless of the bus', () => {
    const s = settings({ master: { volume: 1, muted: true }, voice: { volume: 1, muted: false } });
    expect(effectiveGain(s, 'voice')).toBe(0);
  });

  it('clamps the result to [0, 1]', () => {
    const s = settings({ master: { volume: 1, muted: false }, sfx: { volume: 1, muted: false } });
    expect(effectiveGain(s, 'sfx', 5)).toBe(1);
    expect(effectiveGain(s, 'sfx', -2)).toBe(0);
  });

  it('treats the master bus itself without a bus factor', () => {
    const s = settings({ master: { volume: 0.7, muted: false } });
    expect(effectiveGain(s, 'master')).toBeCloseTo(0.7);
  });
});

describe('AudioManager settings', () => {
  it('exposes sane defaults', () => {
    const s = AudioManager.getSettings();
    expect(s.master.volume).toBeGreaterThan(0);
    expect(s.master.muted).toBe(false);
  });

  it('updates and clamps volume, notifying subscribers', () => {
    let notified = 0;
    const unsub = AudioManager.subscribe(() => { notified++; });

    AudioManager.setVolume('sfx', 1.5);
    expect(AudioManager.getSettings().sfx.volume).toBe(1);

    AudioManager.setVolume('sfx', -0.5);
    expect(AudioManager.getSettings().sfx.volume).toBe(0);

    expect(notified).toBe(2);
    unsub();
  });

  it('mutes and unmutes a bus', () => {
    AudioManager.setMuted('music', true);
    expect(AudioManager.getSettings().music.muted).toBe(true);
    AudioManager.toggleMuted('music');
    expect(AudioManager.getSettings().music.muted).toBe(false);
  });

  it('never throws when playing before a sound manager is registered', () => {
    expect(() => AudioManager.playSfx('anything')).not.toThrow();
    expect(() => AudioManager.playMusic('music-battle')).not.toThrow();
    expect(() => AudioManager.stopMusic(0)).not.toThrow();
  });
});
