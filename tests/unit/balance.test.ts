import { describe, expect, it } from 'vitest';
import { ENEMY_DEFINITIONS, TOWER_DEFINITIONS, WAVES } from '../../src/game/data/balance';

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

  it('every enemy has positive speed, HP, and lives-lost, and non-negative reward', () => {
    for (const definition of Object.values(ENEMY_DEFINITIONS)) {
      expect(definition.speed).toBeGreaterThan(0);
      expect(definition.maxHp).toBeGreaterThan(0);
      expect(definition.livesLost).toBeGreaterThan(0);
      expect(definition.reward).toBeGreaterThanOrEqual(0);
    }
  });

  it('every tower definition is keyed by its own id', () => {
    for (const [key, definition] of Object.entries(TOWER_DEFINITIONS)) {
      expect(definition.id).toBe(key);
    }
  });

  it('every tower has positive cost, range, damage, and fire rate', () => {
    for (const definition of Object.values(TOWER_DEFINITIONS)) {
      expect(definition.cost).toBeGreaterThan(0);
      expect(definition.range).toBeGreaterThan(0);
      expect(definition.damage).toBeGreaterThan(0);
      expect(definition.fireRateMs).toBeGreaterThan(0);
    }
  });

  it('every wave only references enemy ids that exist in ENEMY_DEFINITIONS', () => {
    const knownIds = new Set(Object.keys(ENEMY_DEFINITIONS));
    for (const [waveIndex, wave] of WAVES.entries()) {
      for (const group of wave.groups) {
        expect(
          knownIds.has(group.enemyId),
          `wave ${waveIndex + 1} references unknown enemyId "${group.enemyId}"`,
        ).toBe(true);
      }
    }
  });

  it('every defined enemy is used by at least one wave', () => {
    const referencedIds = new Set(WAVES.flatMap((wave) => wave.groups.map((group) => group.enemyId)));
    for (const id of Object.keys(ENEMY_DEFINITIONS)) {
      expect(referencedIds.has(id), `enemy "${id}" is defined but never spawned by a wave`).toBe(true);
    }
  });
});
