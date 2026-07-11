import type { EnemyId } from './enemies';
import { globalStageNumber } from './campaign';

// ============================================================================
// ENEMY INTRODUCTION SCHEDULE
// ----------------------------------------------------------------------------
// Every battle runs the same authored 20-wave script (data/waves.ts), but the
// full anomaly roster must NOT all appear on stage 1 — each special enemy
// debuts at an authored campaign stage, pairing with the hero unlock that
// counters it (data/heroUnlocks.ts) and feeding the Truth Codex's
// unlock-on-first-encounter pacing. Before its debut stage, a spawn is
// substituted with a same-role basic enemy (ENEMY_INTRO_FALLBACK), so wave
// counts — and therefore the voice-drop kill pool — stay identical.
// Bosses are exempt: wave 20's anchor is already act-themed (bossForStage).
// ============================================================================

/** Minion/mini-boss ids that appear in the authored wave table (+ red_tape, sandbox-only today). */
export type GatedEnemyId =
  | 'grunt' | 'runner' | 'brute'
  | 'ghost_employee' | 'the_overpriced' | 'tender_rigger' | 'epal'
  | 'shell_company' | 'kickback_courier' | 'crony_bodyguard' | 'bribery'
  | 'land_grabber' | 'hoarder' | 'red_tape';

/**
 * First global stage (CampaignMap.tsx stage ids) where each anomaly may spawn.
 * One new threat at a time, debuting alongside its counter:
 *
 *   1  Street Corner    — grunts only, the pure tutorial stage
 *   2  Alleyway Ambush  — Runner (speed pressure)
 *   3  Sari-Sari        — Brute (the first mini-boss checkpoint)
 *   4  Basketball Court — Ghost Employee (stealth; the Sikyu starter counters)
 *   5  Barangay Outpost — Tender Rigger
 *   6  Act 1 back half  — The Overpriced (the second mini-boss checkpoint)
 *   Act 2 (11+)         — Crony Bodyguard, Bribery
 *   Act 3 (21+)         — Red Tape (reserved; not in the authored table yet)
 */
export const ENEMY_INTRO_STAGE: Record<GatedEnemyId, number> = {
  grunt: 1,
  runner: 2,
  brute: 3,
  ghost_employee: 4,
  tender_rigger: 5,
  the_overpriced: 6,
  epal: 7,
  shell_company: 8,
  crony_bodyguard: 9,
  kickback_courier: 10,
  land_grabber: 11,
  bribery: 12,
  hoarder: 15,
  red_tape: 18,
};

/**
 * What spawns instead while an enemy is still locked — the basic chassis with
 * the same battlefield role, so early stages keep the authored pacing:
 * walkers → grunt, fast movers → runner, mini-boss tanks → brute. Fallbacks
 * CHAIN: if the fallback itself is still locked (e.g. brute before stage 5),
 * gating keeps collapsing until it reaches an unlocked enemy — so stage 1 is
 * pure grunts.
 */
export const ENEMY_INTRO_FALLBACK: Record<GatedEnemyId, EnemyId> = {
  grunt: 'grunt',
  runner: 'grunt',
  ghost_employee: 'grunt',
  the_overpriced: 'grunt',
  brute: 'grunt',
  tender_rigger: 'grunt',
  epal: 'grunt',
  shell_company: 'grunt',
  kickback_courier: 'runner',
  bribery: 'runner',
  crony_bodyguard: 'brute',
  land_grabber: 'brute',
  hoarder: 'brute',
  red_tape: 'brute',
};

function isGated(enemyId: EnemyId): enemyId is GatedEnemyId {
  return enemyId in ENEMY_INTRO_STAGE;
}

/**
 * Resolve what actually spawns for `enemyId` in the given campaign battle.
 * Bosses and anything outside the schedule pass through untouched, as do
 * non-campaign battles (sandbox quick-start passes null coordinates).
 */
export function gateEnemyForStage(
  enemyId: EnemyId,
  act: number | null,
  stageIdx: number | null,
): EnemyId {
  if (act == null || stageIdx == null) return enemyId;
  const stage = globalStageNumber(act, stageIdx);
  let resolved = enemyId;
  while (isGated(resolved) && ENEMY_INTRO_STAGE[resolved] > stage) {
    const fallback = ENEMY_INTRO_FALLBACK[resolved];
    if (fallback === resolved) break; // grunt is the floor
    resolved = fallback;
  }
  return resolved;
}
