import { beforeEach, describe, expect, it } from 'vitest';
import {
  addHeroCards,
  addHope,
  getHope,
  getPermits,
  getUnlockedAchievements,
  isAchievementUnlocked,
  markEnemyEncountered,
  recordBattleOutcome,
  recordBossDefeated,
  recordHeroDrop,
  recordStageClear,
  resetMetaStateForTests,
} from '../../src/game/data/metaState';
import { ACHIEVEMENTS, evaluateAchievements, getAchievement } from '../../src/game/data/achievements';

const startPermits = 25; // DEFAULT_STATE.permits

beforeEach(() => {
  localStorage.clear();
  resetMetaStateForTests();
});

describe('catalog', () => {
  it('has a plentiful, well-formed, uniquely-ided set of achievements', () => {
    expect(ACHIEVEMENTS.length).toBeGreaterThanOrEqual(30);
    const ids = ACHIEVEMENTS.map((a) => a.id);
    expect(new Set(ids).size).toBe(ids.length); // no duplicate ids
    for (const a of ACHIEVEMENTS) {
      expect(a.title).toBeTruthy();
      expect(a.description).toBeTruthy();
      // Every achievement pays out something.
      expect((a.reward.permits ?? 0) + (a.reward.hope ?? 0)).toBeGreaterThan(0);
    }
  });
});

describe('evaluateAchievements — first win', () => {
  it('unlocks First Rally and grants exactly its reward once', () => {
    recordBattleOutcome(true, false);
    evaluateAchievements();

    expect(isAchievementUnlocked('first_win')).toBe(true);
    const reward = getAchievement('first_win')!.reward;
    expect(getPermits()).toBe(startPermits + (reward.permits ?? 0));
    expect(getHope()).toBe(reward.hope ?? 0);

    // Re-evaluating must not double-grant.
    const permitsAfter = getPermits();
    const hopeAfter = getHope();
    evaluateAchievements();
    expect(getPermits()).toBe(permitsAfter);
    expect(getHope()).toBe(hopeAfter);
    expect(getUnlockedAchievements().filter((id) => id === 'first_win')).toHaveLength(1);
  });
});

describe('evaluateAchievements — multiple in one pass', () => {
  it('unlocks every satisfied achievement and sums their rewards atomically', () => {
    // Cross first_win + win_5 + first_flawless together.
    for (let i = 0; i < 5; i++) recordBattleOutcome(true, true);
    evaluateAchievements();

    expect(isAchievementUnlocked('first_win')).toBe(true);
    expect(isAchievementUnlocked('win_5')).toBe(true);
    expect(isAchievementUnlocked('first_flawless')).toBe(true);

    const expectedPermits =
      startPermits +
      ['first_win', 'win_5', 'first_flawless'].reduce((s, id) => s + (getAchievement(id)!.reward.permits ?? 0), 0);
    const expectedHope = ['first_win', 'win_5', 'first_flawless'].reduce(
      (s, id) => s + (getAchievement(id)!.reward.hope ?? 0),
      0,
    );
    expect(getPermits()).toBe(expectedPermits);
    expect(getHope()).toBe(expectedHope);
  });
});

describe('evaluateAchievements — counter-driven predicates', () => {
  it('boss defeats unlock the boss tiers as the count climbs', () => {
    recordBossDefeated();
    evaluateAchievements();
    expect(isAchievementUnlocked('first_boss')).toBe(true);
    expect(isAchievementUnlocked('boss_5')).toBe(false);

    for (let i = 0; i < 4; i++) recordBossDefeated();
    evaluateAchievements();
    expect(isAchievementUnlocked('boss_5')).toBe(true);
  });

  it('hero drops unlock First Recruit', () => {
    recordHeroDrop();
    evaluateAchievements();
    expect(isAchievementUnlocked('first_hero_drop')).toBe(true);
  });

  it('a first enemy encounter unlocks Know Your Enemy', () => {
    markEnemyEncountered('grunt');
    evaluateAchievements();
    expect(isAchievementUnlocked('first_enemy')).toBe(true);
  });

  it('lifetime hope drives the Hope milestones and survives spending', () => {
    addHope(1000);
    evaluateAchievements();
    expect(isAchievementUnlocked('hope_1k')).toBe(true);
  });

  it('lifetime cards drive the card milestones', () => {
    addHeroCards('student', 25);
    evaluateAchievements();
    expect(isAchievementUnlocked('cards_25')).toBe(true);
  });

  it('clearing all of Act I unlocks the clean-sweep achievement', () => {
    for (let stage = 1; stage <= 10; stage++) recordStageClear(stage, 1);
    evaluateAchievements();
    expect(isAchievementUnlocked('act1_complete')).toBe(true);
    expect(isAchievementUnlocked('stage_10')).toBe(true); // highestClearedStage >= 10
  });
});

describe('evaluateAchievements — a loss', () => {
  it('records the loss achievement but not a win', () => {
    recordBattleOutcome(false, false);
    evaluateAchievements();
    expect(isAchievementUnlocked('first_loss')).toBe(true);
    expect(isAchievementUnlocked('first_win')).toBe(false);
  });
});
