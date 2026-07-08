import type { EnemyId } from './enemies';

// ============================================================================
// WAVE TABLE  (spec: docs/WAVE_ENGINE_SPEC.md)
// ----------------------------------------------------------------------------
// Designer-authored 20-wave battle script consumed by core/WaveManager.ts.
// Every battle runs this table; the only per-stage variable is which boss
// anchors wave 20 (bossForStage). Difficulty grows two ways:
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

export const TOTAL_WAVES = 20;

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

/** Shorthands keeping the table readable. */
const spawn = (enemyId: EnemyId, count: number, intervalMs: number): WaveEvent => ({ type: 'spawn', enemyId, count, intervalMs });
const delay = (durationMs: number): WaveEvent => ({ type: 'delay', durationMs });
const warning = (alertType: 'boss' | 'swarm' | 'mini-boss', text: string, durationMs = 1500): WaveEvent => ({ type: 'warning', alertType, text, durationMs });

/**
 * The 20-wave battle script (155 authored kills). Wave 20 injects the stage's
 * boss. Split/summon spawns are bonus kills on top of the authored count —
 * excluded from the drop pool on purpose (see balance.ts kill-pool doctrine).
 */
export function buildWaveTable(bossId: EnemyId): WaveDefinition[] {
  return [
    { waveNumber: 1, events: [spawn('grunt', 4, 1600)] },
    { waveNumber: 2, events: [spawn('grunt', 5, 1500), spawn('runner', 2, 800)] },
    { waveNumber: 3, events: [spawn('grunt', 5, 1400), spawn('runner', 3, 800)] },
    { waveNumber: 4, events: [spawn('grunt', 5, 1300), spawn('ghost_employee', 2, 1200)] },
    { waveNumber: 5, events: [warning('mini-boss', '⚠ MINI-BOSS INCOMING ⚠'), spawn('grunt', 4, 1200), spawn('brute', 1, 1000)] },
    { waveNumber: 6, events: [spawn('runner', 4, 700), spawn('grunt', 4, 1200), spawn('tender_rigger', 1, 1000)] },
    { waveNumber: 7, events: [spawn('the_overpriced', 3, 1500), spawn('grunt', 4, 1200)] },
    { waveNumber: 8, events: [warning('swarm', '⚠ SWARM INCOMING ⚠'), spawn('runner', 10, 600)] },
    { waveNumber: 9, events: [spawn('shell_company', 3, 1400), spawn('grunt', 3, 1200), spawn('epal', 2, 1500)] },
    { waveNumber: 10, events: [warning('mini-boss', '⚠ MINI-BOSS INCOMING ⚠'), spawn('brute', 2, 2000), spawn('crony_bodyguard', 1, 1000), spawn('grunt', 4, 1100)] },
    { waveNumber: 11, events: [spawn('kickback_courier', 3, 900), spawn('ghost_employee', 4, 1100)] },
    { waveNumber: 12, events: [spawn('runner', 5, 700), spawn('tender_rigger', 3, 1300), spawn('epal', 1, 1000)] },
    { waveNumber: 13, events: [spawn('land_grabber', 2, 2000), spawn('grunt', 4, 1100), spawn('shell_company', 2, 1400)] },
    { waveNumber: 14, events: [spawn('illegal_logger', 2, 2200), spawn('runner', 5, 700)] },
    { waveNumber: 15, events: [warning('mini-boss', '⚠ MINI-BOSS INCOMING ⚠'), spawn('hoarder', 1, 1000), spawn('crony_bodyguard', 2, 2500), spawn('grunt', 4, 1100)] },
    { waveNumber: 16, events: [warning('swarm', '⚠ SWARM INCOMING ⚠'), spawn('runner', 12, 500), spawn('kickback_courier', 2, 900)] },
    { waveNumber: 17, events: [spawn('brute', 3, 1800), spawn('ghost_employee', 3, 1000), spawn('the_overpriced', 2, 1500)] },
    { waveNumber: 18, events: [spawn('land_grabber', 2, 2000), spawn('shell_company', 3, 1400), spawn('tender_rigger', 3, 1300)] },
    { waveNumber: 19, events: [warning('mini-boss', '⚠ MINI-BOSS INCOMING ⚠'), spawn('hoarder', 1, 1000), spawn('crony_bodyguard', 2, 2200), spawn('epal', 2, 1000), spawn('runner', 5, 700)] },
    { waveNumber: 20, events: [warning('boss', '⚠ BOSS INCOMING ⚠', 2000), delay(1500), spawn(bossId, 1, 1000), spawn('grunt', 4, 2000)] },
  ];
}

/**
 * Authored kill pool = sum of all spawn counts across the table. Feeds the
 * voice-drop cadence (voiceDropCost) so a full clear yields exactly
 * targetDropsPerRun drops.
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
