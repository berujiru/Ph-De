import { describe, expect, it } from 'vitest';
import {
  HERO_LEVEL_CAP,
  cardsForNextLevel,
  damageMultiplier,
  leveledDamage,
} from '../../src/game/data/heroProgression';

describe('damageMultiplier', () => {
  it('is 1.0 at level 1 (the floor)', () => {
    expect(damageMultiplier(1)).toBe(1);
  });

  it('grows +5% per level up to the cap', () => {
    expect(damageMultiplier(2)).toBeCloseTo(1.05);
    expect(damageMultiplier(HERO_LEVEL_CAP)).toBeCloseTo(1.45); // 1 + 0.05*9
  });

  it('clamps below 1 and above the cap', () => {
    expect(damageMultiplier(0)).toBe(1);
    expect(damageMultiplier(-3)).toBe(1);
    expect(damageMultiplier(HERO_LEVEL_CAP + 5)).toBeCloseTo(damageMultiplier(HERO_LEVEL_CAP));
  });
});

describe('leveledDamage', () => {
  it('returns the base at level 1', () => {
    expect(leveledDamage(12, 1)).toBe(12);
  });

  it('rounds the scaled damage to a whole number', () => {
    expect(leveledDamage(10, 2)).toBe(11); // 10 * 1.05 = 10.5 -> 11
    expect(leveledDamage(7, 3)).toBe(8); // 7 * 1.10 = 7.7 -> 8
  });
});

describe('cardsForNextLevel', () => {
  it('follows the 5 * currentLevel curve', () => {
    expect(cardsForNextLevel(1)).toBe(5);
    expect(cardsForNextLevel(2)).toBe(10);
    expect(cardsForNextLevel(9)).toBe(45);
  });
});
