import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  addHeroCards,
  getClearedStages,
  getEncounteredEnemies,
  getHeroCardCount,
  getHeroCards,
  getHeroLevel,
  getHighestClearedStage,
  getHope,
  getPermits,
  getStoreUnlockedHeroes,
  hasEncounteredEnemy,
  isStageCleared,
  levelUpHero,
  markEnemyEncountered,
  recordStageClear,
  resetMetaStateForTests,
  subscribeMetaState,
} from '../../src/game/data/metaState';
import { HERO_LEVEL_CAP } from '../../src/game/data/heroProgression';

const STORAGE_KEY = 'firstripple.meta';

beforeEach(() => {
  localStorage.clear();
  resetMetaStateForTests();
});

describe('defaults', () => {
  it('starts with an empty card/level inventory', () => {
    expect(getHeroCards()).toEqual({});
    expect(getHeroCardCount('student')).toBe(0);
    expect(getHeroLevel('student')).toBe(1);
  });
});

describe('migration from a pre-cards save', () => {
  it('defaults the new fields while preserving old ones', () => {
    // A save written before Hero Cards existed (only the original five fields).
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        hope: 320,
        permits: 4,
        highestClearedStage: 7,
        stageStars: { 3: 2 },
        storeUnlockedHeroes: ['baker'],
      }),
    );
    resetMetaStateForTests();

    expect(getHope()).toBe(320);
    expect(getPermits()).toBe(4);
    expect(getStoreUnlockedHeroes()).toEqual(['baker']);
    // New fields silently default.
    expect(getHeroCards()).toEqual({});
    expect(getHeroLevel('baker')).toBe(1);
    // clearedStages back-fills from the old linear high-water mark (1..7).
    expect(getClearedStages()).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });
});

describe('recordStageClear', () => {
  it('tracks each beaten stage and can hold gaps (skipped bosses)', () => {
    recordStageClear(9, 3);
    // Skip the Act 1 boss (10), beat the Act 2 opener (11).
    recordStageClear(11, 1);

    expect(isStageCleared(9)).toBe(true);
    expect(isStageCleared(11)).toBe(true);
    expect(isStageCleared(10)).toBe(false); // boss stays unbeaten
    expect(getClearedStages()).toEqual([9, 11]);
    // Highest cleared still tracks the furthest reached (hero-unlock signal).
    expect(getHighestClearedStage()).toBe(11);
  });

  it('does not double-record a re-cleared stage', () => {
    recordStageClear(3, 1);
    recordStageClear(3, 2); // replay for more stars
    expect(getClearedStages()).toEqual([3]);
  });
});

describe('addHeroCards', () => {
  it('accumulates and persists to localStorage', () => {
    addHeroCards('student', 3);
    addHeroCards('student', 2);
    expect(getHeroCardCount('student')).toBe(5);

    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
    expect(saved.heroCards.student).toBe(5);
  });

  it('ignores non-positive amounts', () => {
    addHeroCards('student', 0);
    addHeroCards('student', -4);
    expect(getHeroCardCount('student')).toBe(0);
  });
});

describe('levelUpHero', () => {
  it('fails when short on cards', () => {
    addHeroCards('student', 4); // needs 5 for L1 -> L2
    expect(levelUpHero('student')).toBe(false);
    expect(getHeroLevel('student')).toBe(1);
    expect(getHeroCardCount('student')).toBe(4);
  });

  it('succeeds, deducting 5 * level and bumping the level', () => {
    addHeroCards('student', 5);
    expect(levelUpHero('student')).toBe(true);
    expect(getHeroLevel('student')).toBe(2);
    expect(getHeroCardCount('student')).toBe(0);
  });

  it('caps at HERO_LEVEL_CAP and refuses further promotion', () => {
    // Total cards to climb from L1 to the cap: sum of 5*level for level 1..cap-1.
    let total = 0;
    for (let lv = 1; lv < HERO_LEVEL_CAP; lv++) total += 5 * lv;
    addHeroCards('student', total + 100); // plenty
    while (levelUpHero('student')) { /* climb */ }

    expect(getHeroLevel('student')).toBe(HERO_LEVEL_CAP);
    expect(levelUpHero('student')).toBe(false);
  });

  it('notifies subscribers on mutation', () => {
    const spy = vi.fn();
    const unsub = subscribeMetaState(spy);
    addHeroCards('student', 5);
    expect(spy).toHaveBeenCalledTimes(1);
    levelUpHero('student');
    expect(spy).toHaveBeenCalledTimes(2);
    unsub();
  });
});

describe('markEnemyEncountered', () => {
  it('records only the first-ever encounter and persists it', () => {
    expect(hasEncounteredEnemy('grunt')).toBe(false);
    // First sighting is new — drives the one-time rally TCG reveal.
    expect(markEnemyEncountered('grunt')).toBe(true);
    expect(hasEncounteredEnemy('grunt')).toBe(true);
    // Every subsequent sighting (same battle or a later game) is a no-op.
    expect(markEnemyEncountered('grunt')).toBe(false);
    expect(getEncounteredEnemies()).toEqual(['grunt']);

    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
    expect(saved.encounteredEnemies).toEqual(['grunt']);
  });

  it('remembers encounters across a reload (persistent, not per-game)', () => {
    markEnemyEncountered('runner');
    resetMetaStateForTests(); // simulate a fresh app load reading storage
    expect(hasEncounteredEnemy('runner')).toBe(true);
    expect(markEnemyEncountered('runner')).toBe(false);
  });

  it('notifies subscribers only when a new enemy is recorded', () => {
    const spy = vi.fn();
    const unsub = subscribeMetaState(spy);
    markEnemyEncountered('brute');
    expect(spy).toHaveBeenCalledTimes(1);
    markEnemyEncountered('brute'); // already known — no state change, no notify
    expect(spy).toHaveBeenCalledTimes(1);
    unsub();
  });
});

describe('corrupt storage', () => {
  it('falls back to defaults on invalid JSON', () => {
    localStorage.setItem(STORAGE_KEY, '{not valid json');
    resetMetaStateForTests();
    expect(getHope()).toBe(0);
    expect(getHeroCards()).toEqual({});
  });
});
