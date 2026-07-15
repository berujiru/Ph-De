import { ENEMY_DEFINITIONS, enemySizeClass, type EnemyId } from './enemies';
import { gateEnemyForStage } from './enemyUnlocks';
import { globalStageNumber } from './campaign';

// ============================================================================
// WAVE TABLE  (spec: docs/WAVE_ENGINE_SPEC.md)
// ----------------------------------------------------------------------------
// Designer-authored 20-wave battle script consumed by core/WaveManager.ts.
// Every battle runs this table; per stage it varies by (a) which enemies are
// already introduced (data/enemyUnlocks.ts gating) and (b) whether wave 20
// fields the act boss (isBossStage — every BOSS_STAGE_INTERVAL-th stage) or a
// mini-boss final push. Difficulty grows two ways:
//   1. Composition — later waves mix tougher enemy types from the roster.
//   2. Stats — waveStatMultipliers scales non-boss HP/damage/speed per wave.
// ============================================================================

export type WaveEvent =
  // Spawn `count` enemies of one type, spaced `intervalMs` apart.
  | { type: 'spawn'; enemyId: EnemyId; count: number; intervalMs: number }
  // Pause the spawning queue.
  | { type: 'delay'; durationMs: number }
  // Flash a UI warning and pause the queue for `durationMs` to build tension.
  | { type: 'warning'; alertType: 'boss' | 'swarm' | 'mini-boss'; text: string; durationMs: number };

export interface WaveDefinition {
  waveNumber: number;
  events: WaveEvent[];
}

export const TOTAL_WAVES = 15;

/**
 * Opening-stage (Act 1 / Stage 1) enemy-COUNT scale. HP is already eased by the
 * stage baseline (1.0×); this thins the crowd on the tutorial stage only so new
 * players aren't swarmed. Applied per-spawn in buildWaveTable, min 1.
 */
export const OPENING_STAGE_COUNT_SCALE = 0.6;

/** Breather between clearing one wave and the next one starting. */
export const INTER_WAVE_DELAY_MS = 3500;

/**
 * Per-wave stat growth applied to every non-boss spawn (bosses are authored
 * at wave-20 power and exempt). Wave 1 is the balance.ts baseline (1.0x).
 */
export const WAVE_SCALING = {
  hpGrowthPerWave: 0.10,      // wave-20 minions: 2.9x HP
  damageGrowthPerWave: 0.05,  // wave-20 minions: 1.95x damage
  speedGrowthPerWave: 0.01,
  speedMultCap: 1.15,
} as const;

/**
 * Per-stage (campaign-wide) stat growth — the knob that makes later stages
 * harder regardless of which enemies the gating schedule introduces. Stage 1
 * is the baseline (1.0×); every subsequent stage adds a fraction on top.
 * Combined with waveStatMultipliers (which scales within a single battle),
 * this produces smooth difficulty across the full 91-stage campaign:
 *
 *   Stage  1: 1.0× HP / 1.0× dmg      (tutorial)
 *   Stage 10: 1.45× HP / 1.27× dmg     (act 1 boss)
 *   Stage 45: 3.2× HP / 2.32× dmg      (mid-campaign)
 *   Stage 91: 5.5× HP / 3.7× dmg       (finale)
 */
export const STAGE_SCALING = {
  hpGrowthPerStage: 0.05,
  damageGrowthPerStage: 0.03,
  speedGrowthPerStage: 0.003,
  speedMultCap: 1.25,
} as const;

/** Stat multipliers for a spawn on the given wave (1-based). */
export function waveStatMultipliers(wave: number): { hp: number; damage: number; speed: number } {
  const n = Math.max(0, wave - 1);
  return {
    hp: 1 + WAVE_SCALING.hpGrowthPerWave * n,
    damage: 1 + WAVE_SCALING.damageGrowthPerWave * n,
    speed: Math.min(WAVE_SCALING.speedMultCap, 1 + WAVE_SCALING.speedGrowthPerWave * n),
  };
}

/**
 * Stat multipliers for the given campaign stage (1-based global stage number).
 * Non-campaign battles (null coordinates → stage 1) return 1.0× across the board.
 */
export function stageStatMultipliers(globalStage: number): { hp: number; damage: number; speed: number } {
  const n = Math.max(0, globalStage - 1);
  return {
    hp: 1 + STAGE_SCALING.hpGrowthPerStage * n,
    damage: 1 + STAGE_SCALING.damageGrowthPerStage * n,
    speed: Math.min(STAGE_SCALING.speedMultCap, 1 + STAGE_SCALING.speedGrowthPerStage * n),
  };
}

/**
 * Which boss anchors wave 20, themed to the campaign act (CampaignMap.tsx:
 * acts 1-4 × 10 stages, act 5 = finale). Stages within an act rotate through
 * the act's boss list. Non-campaign battles (sandbox quick-start) fall back
 * to the act-1 rotation.
 */
export function bossForStage(act: number | null, stageIdx: number | null): EnemyId {
  const rotations: Record<number, EnemyId[]> = {
    1: ['boss_flood_control', 'boss_wang_wang', 'boss_vote_buying'],
    2: ['boss_troll_farm', 'boss_nepotism', 'boss_smuggling'],
    3: ['boss_pork_barrel', 'boss_budget_insertion', 'boss_flood_control'],
    // boss_dynasty_1 chains phases 1 -> 2 -> 3 via nextPhaseEnemyId.
    4: ['boss_dynasty_1', 'boss_budget_insertion', 'boss_pork_barrel'],
  };
  if (act === 5) return 'boss_ang_sistema';
  const list = rotations[act ?? 1] ?? rotations[1];
  return list[(stageIdx ?? 0) % list.length];
}

/**
 * A boss only anchors wave 20 every Nth stage.
 */
export const BOSS_STAGE_INTERVAL = 10;

/** Whether this campaign stage's wave 20 fields the act boss. Non-campaign
 *  battles (sandbox quick-start, null coordinates) keep the boss finale. */
export function isBossStage(act: number | null, stageIdx: number | null): boolean {
  if (act == null || stageIdx == null) return true;
  if (act >= 5) return true; // the finale is always Ang Sistema
  return globalStageNumber(act, stageIdx) % BOSS_STAGE_INTERVAL === 0;
}

/** Whether this campaign stage is one of the 3 mini-boss checkpoint stages in an act. */
export function isMiniBossStage(act: number | null, stageIdx: number | null): boolean {
  if (act == null || stageIdx == null) return false;
  if (isBossStage(act, stageIdx)) return false;
  // Stages 3, 6, 9 (1-based global stage numbers relative to their act)
  const actStage = globalStageNumber(act, stageIdx) % BOSS_STAGE_INTERVAL;
  return actStage === 3 || actStage === 6 || actStage === 9;
}

/**
 * Drop warning events whose threat never actually spawns after gating: a
 * 'mini-boss' alert needs a miniboss-class spawn in the wave, a 'boss' alert
 * needs a boss. Keeps early stages from crying wolf over a pack of grunts.
 */
function honestWarnings(waves: WaveDefinition[]): WaveDefinition[] {
  return waves.map((wave) => {
    const spawnedIds = wave.events.flatMap((evt) => (evt.type === 'spawn' ? [evt.enemyId] : []));
    const hasBoss = spawnedIds.some((id) => id.startsWith('boss_'));
    const hasMiniboss = spawnedIds.some((id) => enemySizeClass(ENEMY_DEFINITIONS[id]) === 'miniboss');
    const events = wave.events.filter((evt) =>
      evt.type !== 'warning' ||
      (evt.alertType === 'boss' ? hasBoss : evt.alertType === 'mini-boss' ? hasMiniboss : true));
    return { ...wave, events };
  });
}

/** Shorthands keeping the table readable (`spawn` lives inside buildWaveTable — it gates per stage). */
const delay = (durationMs: number): WaveEvent => ({ type: 'delay', durationMs });
const warning = (alertType: 'boss' | 'swarm' | 'mini-boss', text: string, durationMs = 1500): WaveEvent => ({ type: 'warning', alertType, text, durationMs });

/**
 * The 15-wave battle script (~101 authored kills for the null-coord table).
 * Wave 15 injects the stage's boss. Split/summon spawns are bonus kills on top
 * of the authored count — excluded from the drop pool on purpose (see balance.ts
 * kill-pool doctrine).
 *
 * Pass the campaign coordinates to gate the roster: enemies that haven't
 * reached their debut stage (data/enemyUnlocks.ts) are substituted 1:1 with a
 * same-role basic enemy, so early stages stay simple without changing the
 * kill pool. The boss itself only appears on boss stages (isBossStage);
 * other stages close on a mini-boss final push of the same spawn count.
 * Null coordinates (sandbox quick-start) run the full boss script.
 *
 * The opening stage (Act 1 / Stage 1) additionally thins every spawn count by
 * OPENING_STAGE_COUNT_SCALE so newcomers aren't swarmed.
 */
export function buildWaveTable(
  bossId: EnemyId,
  act: number | null = null,
  stageIdx: number | null = null,
): WaveDefinition[] {
  const isOpener = act === 1 && stageIdx === 0;
  const spawn = (enemyId: EnemyId, count: number, intervalMs: number): WaveEvent =>
    ({
      type: 'spawn',
      enemyId: gateEnemyForStage(enemyId, act, stageIdx),
      count: isOpener ? Math.max(1, Math.round(count * OPENING_STAGE_COUNT_SCALE)) : count,
      intervalMs,
    });
  
  let finale: WaveEvent[];
  if (isBossStage(act, stageIdx)) {
    finale = [warning('boss', '⚠ BOSS INCOMING ⚠', 2000), delay(1500), spawn(bossId, 1, 1000), spawn('grunt', 4, 2000)];
  } else if (isMiniBossStage(act, stageIdx)) {
    finale = [warning('mini-boss', '⚠ FINAL PUSH ⚠', 2000), delay(1500), spawn('crony_bodyguard', 1, 1000), spawn('grunt', 4, 2000)];
  } else {
    finale = [warning('swarm', '⚠ FINAL WAVE ⚠', 2000), delay(1500), spawn('runner', 2, 800), spawn('grunt', 3, 1200)];
  }

  return honestWarnings([
    { waveNumber: 1, events: [spawn('grunt', 3, 2500)] },
    { waveNumber: 2, events: [spawn('grunt', 4, 2000), spawn('runner', 1, 1500)] },
    { waveNumber: 3, events: [spawn('grunt', 4, 1800), spawn('runner', 2, 1200)] },
    { waveNumber: 4, events: [spawn('grunt', 4, 1600), spawn('ghost_employee', 1, 1500)] },
    { waveNumber: 5, events: [warning('mini-boss', '⚠ MINI-BOSS INCOMING ⚠'), spawn('grunt', 4, 1200), spawn('brute', 1, 1000)] },
    { waveNumber: 6, events: [spawn('runner', 4, 700), spawn('grunt', 4, 1200), spawn('tender_rigger', 1, 1000)] },
    { waveNumber: 7, events: [spawn('the_overpriced', 3, 1500), spawn('grunt', 4, 1200)] },
    { waveNumber: 8, events: [warning('swarm', '⚠ SWARM INCOMING ⚠'), spawn('runner', 10, 600)] },
    { waveNumber: 9, events: [spawn('shell_company', 3, 1400), spawn('grunt', 3, 1200), spawn('epal', 2, 1500)] },
    { waveNumber: 10, events: [warning('mini-boss', '⚠ MINI-BOSS INCOMING ⚠'), spawn('brute', 2, 2000), spawn('crony_bodyguard', 1, 1000), spawn('grunt', 4, 1100)] },
    { waveNumber: 11, events: [spawn('kickback_courier', 3, 900), spawn('ghost_employee', 4, 1100)] },
    { waveNumber: 12, events: [spawn('runner', 5, 700), spawn('tender_rigger', 3, 1300), spawn('epal', 1, 1000)] },
    { waveNumber: 13, events: [spawn('land_grabber', 2, 2000), spawn('grunt', 4, 1100), spawn('shell_company', 2, 1400)] },
    { waveNumber: 14, events: [spawn('bribery', 2, 2200), spawn('runner', 5, 700)] },
    { waveNumber: 15, events: finale },
  ]);
}

/**
 * Authored kill pool = sum of all spawn counts across the table. A useful
 * balance signal for session length (the voice-drop cadence itself now derives
 * from the wave count, not this pool — see data/drops.ts voiceDropCost).
 */
export function authoredKillCount(waves: WaveDefinition[]): number {
  let total = 0;
  for (const wave of waves) {
    for (const evt of wave.events) {
      if (evt.type === 'spawn') total += evt.count;
    }
  }
  return total;
}
