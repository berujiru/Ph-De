import { describe, expect, it } from 'vitest';
import { ENEMY_DEFINITIONS, HERO_DEFINITIONS } from '../../src/game/data/balance';

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

});
