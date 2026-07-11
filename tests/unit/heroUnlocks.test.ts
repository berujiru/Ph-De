import { describe, expect, it } from 'vitest';
import {
  HERO_UNLOCK_STAGE,
  RECRUITABLE_HERO_IDS,
  recruitableHeroIdsForStage,
} from '../../src/game/data/heroUnlocks';
import { FINALE_STAGE, globalStageNumber } from '../../src/game/data/campaign';
import { HERO_DEFINITIONS, type HeroId } from '../../src/game/data/heroes';
import { MAX_ACTIVE_HEROES } from '../../src/game/data/drops';

/** Every recruitable id in the roster: all heroes minus Eden and sandbox testers. */
const rosterRecruitIds = (Object.keys(HERO_DEFINITIONS) as HeroId[]).filter(
  (id) => id !== 'eden' && !id.startsWith('sandbox_'),
);

describe('HERO_UNLOCK_STAGE — table integrity', () => {
  it('covers exactly the recruitable roster (no Eden, no sandbox testers)', () => {
    expect(new Set(RECRUITABLE_HERO_IDS)).toEqual(new Set(rosterRecruitIds));
  });

  it('every unlock stage is a real campaign stage (1..40)', () => {
    for (const stage of Object.values(HERO_UNLOCK_STAGE)) {
      expect(stage).toBeGreaterThanOrEqual(1);
      expect(stage).toBeLessThan(FINALE_STAGE);
    }
  });

  it('stage 1 offers only the starter pool, not the full roster', () => {
    const starters = recruitableHeroIdsForStage(1, 0);
    expect(starters.length).toBeLessThan(rosterRecruitIds.length);
    // Enough starters to fill Eden's open squad slots on the very first stage.
    expect(starters.length).toBeGreaterThanOrEqual(MAX_ACTIVE_HEROES - 1);
  });
});

describe('recruitableHeroIdsForStage', () => {
  it('the pool only ever grows as the campaign advances', () => {
    let previous = new Set<string>();
    for (let act = 1; act <= 4; act++) {
      for (let stageIdx = 0; stageIdx < 10; stageIdx++) {
        const pool = new Set(recruitableHeroIdsForStage(act, stageIdx));
        for (const id of previous) expect(pool.has(id as never)).toBe(true);
        previous = pool;
      }
    }
  });

  it('the full roster is unlocked by the last act-4 stage and the finale', () => {
    expect(new Set(recruitableHeroIdsForStage(4, 9))).toEqual(new Set(rosterRecruitIds));
    expect(new Set(recruitableHeroIdsForStage(5, 0))).toEqual(new Set(rosterRecruitIds));
  });

  it('non-campaign battles (sandbox quick-start) get the full roster', () => {
    expect(new Set(recruitableHeroIdsForStage(null, null))).toEqual(new Set(rosterRecruitIds));
  });

  it('each hero first appears exactly at its authored unlock stage', () => {
    for (const id of RECRUITABLE_HERO_IDS) {
      const unlockStage = HERO_UNLOCK_STAGE[id];
      const act = Math.ceil(unlockStage / 10);
      const stageIdx = (unlockStage - 1) % 10;
      expect(globalStageNumber(act, stageIdx)).toBe(unlockStage);
      expect(recruitableHeroIdsForStage(act, stageIdx)).toContain(id);
      if (unlockStage > 1) {
        const prevAct = Math.ceil((unlockStage - 1) / 10);
        const prevIdx = (unlockStage - 2) % 10;
        expect(recruitableHeroIdsForStage(prevAct, prevIdx)).not.toContain(id);
      }
    }
  });
});
