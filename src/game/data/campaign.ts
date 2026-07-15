// ============================================================================
// CAMPAIGN STAGE MATH — shared by the unlock schedules (heroUnlocks.ts,
// enemyUnlocks.ts) and the wave builder (waves.ts). Shape mirrored from
// CampaignMap.tsx: 9 boss-anchored acts × 10 stages (global ids 1..90) — each
// act ends on its boss, with 3 mini-boss checkpoint stages along the way —
// then act 10 is the single-stage finale (91).
// ============================================================================

export const STAGES_PER_ACT = 10;
/** Boss-anchored acts; the finale act sits after them. */
export const TOTAL_ACTS = 9;
export const FINALE_ACT = TOTAL_ACTS + 1;
export const FINALE_STAGE = TOTAL_ACTS * STAGES_PER_ACT + 1; // 91

/** Global 1-based stage number (1..91) from campaign coordinates. */
export function globalStageNumber(act: number, stageIdx: number): number {
  if (act >= FINALE_ACT) return FINALE_STAGE;
  return (act - 1) * STAGES_PER_ACT + stageIdx + 1;
}

/** Which act (1..10) a global stage number belongs to. */
export function actForStage(stage: number): number {
  return stage >= FINALE_STAGE ? FINALE_ACT : Math.ceil(stage / STAGES_PER_ACT);
}

/**
 * Progression prerequisite: which already-cleared stage a stage needs to become
 * playable. Boss stages (each act's LAST stage) are OPTIONAL — clearing an act's
 * pre-boss stage opens BOTH the boss (replayable, non-blocking) and the next
 * act's first stage, so a boss never gates campaign progress.
 *   - Stage 1: none (campaign start) → 0.
 *   - First stage of an act (G % STAGES_PER_ACT === 1): the previous act's
 *     pre-boss stage (G − 2); the boss between them (G − 1) is skippable.
 *   - Any other stage, including a boss: the stage right before it (G − 1).
 */
export function stagePrerequisite(globalStage: number): number {
  if (globalStage <= 1) return 0;
  const isActFirst = (globalStage - 1) % STAGES_PER_ACT === 0;
  return isActFirst ? globalStage - 2 : globalStage - 1;
}

/** Whether a stage is playable, given the set of already-cleared stage ids. */
export function isStageUnlocked(globalStage: number, cleared: ReadonlySet<number>): boolean {
  if (globalStage <= 1) return true;
  if (cleared.has(globalStage)) return true; // a beaten stage stays replayable
  return cleared.has(stagePrerequisite(globalStage));
}
