import type { HeroId } from './heroes';
import { globalStageNumber } from './campaign';
import { addHope, addHeroCards, recordStageClear } from './metaState';

// End-of-run spoils: Hope Points + RNG Hero Card drops, awarded on BOTH victory
// and defeat ("a failed defense still wakes people up"). Pure compute is split
// from the metaState mutation so it can be unit-tested with an injected RNG.

export const HOPE_WIN_BASE = 150;
export const HOPE_WIN_PER_WAVE = 25;
export const HOPE_LOSS_BASE = 40;
export const HOPE_LOSS_PER_WAVE = 10;
export const CARD_DROPS_WIN = 2;
export const CARD_DROPS_LOSS = 1;

/** Roll `count` Hero Card drops, each a random hero from the owned roster. */
export function rollCardDrops(count: number, rosterIds: HeroId[], rng: () => number): HeroId[] {
  if (rosterIds.length === 0) return [];
  const drops: HeroId[] = [];
  for (let i = 0; i < count; i++) {
    drops.push(rosterIds[Math.floor(rng() * rosterIds.length)]);
  }
  return drops;
}

export interface BattleRewards {
  hope: number;
  cardDrops: HeroId[];
}

/** Pure spoils calculation from a battle outcome + the player's owned roster. */
export function computeBattleRewards(
  outcome: { won: boolean; wavesCleared: number },
  rosterIds: HeroId[],
  rng: () => number,
): BattleRewards {
  const { won, wavesCleared } = outcome;
  const hope = won
    ? HOPE_WIN_BASE + HOPE_WIN_PER_WAVE * wavesCleared
    : HOPE_LOSS_BASE + HOPE_LOSS_PER_WAVE * wavesCleared;
  const cardDrops = rollCardDrops(won ? CARD_DROPS_WIN : CARD_DROPS_LOSS, rosterIds, rng);
  return { hope, cardDrops };
}

/** Persist computed rewards to metaState. On victory, also record the stage clear. */
export function applyBattleRewards(
  rewards: BattleRewards,
  ctx: { won: boolean; starsEarned: number; stage: { act: number; stageIdx: number } | null },
): void {
  addHope(rewards.hope);
  for (const heroId of rewards.cardDrops) addHeroCards(heroId, 1);
  if (ctx.won && ctx.stage) {
    recordStageClear(globalStageNumber(ctx.stage.act, ctx.stage.stageIdx), ctx.starsEarned);
  }
}
