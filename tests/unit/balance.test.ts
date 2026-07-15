import { describe, expect, it } from 'vitest';
import { ENEMY_DEFINITIONS } from '../../src/game/data/enemies';
import { HERO_DEFINITIONS } from '../../src/game/data/heroes';
import { resolveAttackSpeed } from '../../src/game/data/attackSpeed';
import { VOICE_DROP_TUNING, computeKillPool, voiceDropCost } from '../../src/game/data/drops';

/**
 * Guards the invariants docs/ADDING_ENEMIES.md and docs/TESTING.md promise:
 * balance data stays internally consistent even as content is added.
 */
describe('balance data invariants', () => {
  it('every enemy definition is keyed by its own id', () => {
    for (const [key, definition] of Object.entries(ENEMY_DEFINITIONS)) {
      expect(definition.id).toBe(key);
    }
  });

  it('every enemy has non-negative speed, HP, and non-negative reward', () => {
    for (const definition of Object.values(ENEMY_DEFINITIONS)) {
      expect(definition.speed).toBeGreaterThanOrEqual(0);
      expect(definition.maxHp).toBeGreaterThan(0);
      expect(definition.reward).toBeGreaterThanOrEqual(0);
    }
  });

  it('every hero definition is keyed by its own id', () => {
    for (const [key, definition] of Object.entries(HERO_DEFINITIONS)) {
      expect(definition.id).toBe(key);
    }
  });

  it('every hero has positive damage and attack rate', () => {
    for (const definition of Object.values(HERO_DEFINITIONS)) {
      expect(definition.damage).toBeGreaterThan(0);
      expect(definition.attackRateMs).toBeGreaterThan(0);
    }
  });

  it('every flight-style hero resolves a projectile speed within [250, 900] px/s', () => {
    // vortex/summoner count: the net/panel flies as a homing projectile
    // before the vortex opens / the barricade is built.
    const flightStyles = new Set(['projectile', 'pierce', 'boomerang', 'lobbed', 'linear-wave', 'vortex', 'summoner']);
    for (const definition of Object.values(HERO_DEFINITIONS)) {
      if (definition.id.startsWith('sandbox_') || !flightStyles.has(definition.attackStyle)) continue;
      const speed = resolveAttackSpeed(definition);
      expect(speed, `${definition.id} projectile speed`).toBeGreaterThanOrEqual(250);
      expect(speed, `${definition.id} projectile speed`).toBeLessThanOrEqual(900);
    }
  });

});

describe('voice-drop cadence (docs/VOICE_DROPS.md)', () => {
  it('computeKillPool follows baseWaveSize * T(T+1)/2', () => {
    // T=3, baseWaveSize=5 -> 5*3*4/2 = 30 (base prototype).
    expect(computeKillPool(3)).toBe(30);
    expect(computeKillPool(3, 5)).toBe(30);
    // Doubling waves scales the pool.
    expect(computeKillPool(6)).toBe(105);
    // baseWaveSize is a lever.
    expect(computeKillPool(3, 10)).toBe(60);
  });

  it('the first drop costs firstDropCost', () => {
    expect(voiceDropCost(0, 15)).toBe(VOICE_DROP_TUNING.firstDropCost);
    expect(voiceDropCost(0, 20)).toBe(VOICE_DROP_TUNING.firstDropCost);
  });

  it('per-drop cost doubles, then holds at the wave count', () => {
    // 15 waves: 2, 4, 8, then min(16,15)=15 and steady after.
    expect([0, 1, 2, 3, 4, 5].map((k) => voiceDropCost(k, 15))).toEqual([2, 4, 8, 15, 15, 15]);
  });

  it('cumulative kills to each drop follow 2, 6, 14, 29, 44 (15 waves)', () => {
    const cumulative: number[] = [];
    let total = 0;
    for (let k = 0; k < 5; k++) {
      total += voiceDropCost(k, 15);
      cumulative.push(total);
    }
    expect(cumulative).toEqual([2, 6, 14, 29, 44]);
  });

  it('thresholds are monotonically non-decreasing', () => {
    for (const waves of [10, 15, 20]) {
      for (let k = 1; k < 12; k++) {
        expect(voiceDropCost(k, waves)).toBeGreaterThanOrEqual(voiceDropCost(k - 1, waves));
      }
    }
  });

  it('never returns a non-positive threshold, even for a tiny wave count', () => {
    for (let k = 0; k < 8; k++) {
      expect(voiceDropCost(k, 3)).toBeGreaterThanOrEqual(1);
    }
  });
});
