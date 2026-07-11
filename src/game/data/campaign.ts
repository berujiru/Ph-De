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
