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
 * Mechanics debut alongside their counters:
 *
 *   1  Street Corner    — grunt/runner/brute tutorial trio
 *   2  Alleyway Ambush  — Ghost Employee (stealth; the Sikyu starter counters)
 *   4  Basketball Court — The Overpriced (fake HP; Teacher joins here with Fact Check)
 *   5+ Act 1 back half  — hit-immunity, morale aura, split-on-death, voice theft
 *   Act 2 (11+)         — taunt, budget cut, stun, obstacle mini-bosses
 *   Act 3 (21+)         — Red Tape (reserved; not in the authored table yet)
 */
export const ENEMY_INTRO_STAGE: Record<GatedEnemyId, number> = {
  grunt: 1,
  runner: 1,
  brute: 1,
  ghost_employee: 2,
  the_overpriced: 4,
  tender_rigger: 5,
  epal: 6,
  shell_company: 7,
  kickback_courier: 9,
  crony_bodyguard: 11,
  bribery: 13,
  land_grabber: 15,
  hoarder: 17,
  red_tape: 21,
};

/**
 * What spawns instead while an enemy is still locked — the basic chassis with
 * the same battlefield role, so early stages keep the authored pacing:
 * walkers → grunt, fast movers → runner, mini-boss tanks → brute.
 */
export const ENEMY_INTRO_FALLBACK: Record<GatedEnemyId, EnemyId> = {
  grunt: 'grunt',
  runner: 'runner',
  brute: 'brute',
  ghost_employee: 'grunt',
  the_overpriced: 'grunt',
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
  if (act == null || stageIdx == null || !isGated(enemyId)) return enemyId;
  const stage = globalStageNumber(act, stageIdx);
  return ENEMY_INTRO_STAGE[enemyId] <= stage ? enemyId : ENEMY_INTRO_FALLBACK[enemyId];
}
