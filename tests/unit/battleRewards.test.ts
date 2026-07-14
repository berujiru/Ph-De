import { beforeEach, describe, expect, it } from 'vitest';
import {
  HOPE_LOSS_BASE,
  HOPE_LOSS_PER_WAVE,
  HOPE_WIN_BASE,
  HOPE_WIN_PER_WAVE,
  applyBattleRewards,
  computeBattleRewards,
  rollCardDrops,
} from '../../src/game/data/battleRewards';
import { makeRng } from '../../src/game/core/Drops';
import { globalStageNumber } from '../../src/game/data/campaign';
import {
  getHeroCardCount,
  getHighestClearedStage,
  getHope,
  resetMetaStateForTests,
} from '../../src/game/data/metaState';
import type { HeroId } from '../../src/game/data/heroes';

const ROSTER: HeroId[] = ['eden', 'student', 'baker'];

beforeEach(() => {
  localStorage.clear();
  resetMetaStateForTests();
});

describe('computeBattleRewards — hope', () => {
  it('uses the win formula on victory', () => {
    const r = computeBattleRewards({ won: true, wavesCleared: 3 }, ROSTER, makeRng(1));
    expect(r.hope).toBe(HOPE_WIN_BASE + HOPE_WIN_PER_WAVE * 3);
  });

  it('uses the smaller loss formula on defeat', () => {
    const r = computeBattleRewards({ won: false, wavesCleared: 2 }, ROSTER, makeRng(1));
    expect(r.hope).toBe(HOPE_LOSS_BASE + HOPE_LOSS_PER_WAVE * 2);
  });
});

describe('computeBattleRewards — card drops', () => {
  it('drops 2 cards on a win, 1 on a loss', () => {
    expect(computeBattleRewards({ won: true, wavesCleared: 0 }, ROSTER, makeRng(7)).cardDrops).toHaveLength(2);
    expect(computeBattleRewards({ won: false, wavesCleared: 0 }, ROSTER, makeRng(7)).cardDrops).toHaveLength(1);
  });

  it('only drops heroes from the provided roster', () => {
    const { cardDrops } = computeBattleRewards({ won: true, wavesCleared: 0 }, ROSTER, makeRng(99));
    for (const id of cardDrops) expect(ROSTER).toContain(id);
  });

  it('is deterministic for a given seed', () => {
    const a = computeBattleRewards({ won: true, wavesCleared: 5 }, ROSTER, makeRng(42));
    const b = computeBattleRewards({ won: true, wavesCleared: 5 }, ROSTER, makeRng(42));
    expect(a.cardDrops).toEqual(b.cardDrops);
  });
});

describe('rollCardDrops', () => {
  it('returns an empty array for an empty roster', () => {
    expect(rollCardDrops(3, [], makeRng(1))).toEqual([]);
  });
});

describe('applyBattleRewards', () => {
  it('persists hope + cards and records the stage clear on a win', () => {
    const rewards = { hope: 200, cardDrops: ['student', 'student'] as HeroId[] };
    applyBattleRewards(rewards, { won: true, starsEarned: 2, stage: { act: 1, stageIdx: 2 } });

    expect(getHope()).toBe(200);
    expect(getHeroCardCount('student')).toBe(2);
    expect(getHighestClearedStage()).toBe(globalStageNumber(1, 2));
  });

  it('grants spoils but does NOT record a clear on a loss', () => {
    const rewards = { hope: 50, cardDrops: ['baker'] as HeroId[] };
    applyBattleRewards(rewards, { won: false, starsEarned: 0, stage: { act: 1, stageIdx: 2 } });

    expect(getHope()).toBe(50);
    expect(getHeroCardCount('baker')).toBe(1);
    expect(getHighestClearedStage()).toBe(0);
  });
});
