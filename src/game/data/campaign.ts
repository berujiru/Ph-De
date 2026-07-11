// ============================================================================
// CAMPAIGN STAGE MATH — shared by the unlock schedules (heroUnlocks.ts,
// enemyUnlocks.ts). Shape mirrored from CampaignMap.tsx: acts 1-4 × 10
// stages (global ids 1..40), act 5 = the finale (41).
// ============================================================================

export const STAGES_PER_ACT = 10;
export const FINALE_STAGE = 41;

/** Global 1-based stage number (1..41) from campaign coordinates. */
export function globalStageNumber(act: number, stageIdx: number): number {
  if (act >= 5) return FINALE_STAGE;
  return (act - 1) * STAGES_PER_ACT + stageIdx + 1;
}
