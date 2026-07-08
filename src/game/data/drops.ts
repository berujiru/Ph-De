import type { HeroDefinition } from './heroes';

// ============================================================================
// VOICE-DROP PROGRESSION  (design: docs/VOICE_DROPS.md)
// ----------------------------------------------------------------------------
// Kills fill the Voices meter; a full meter triggers one RNG drop, then the
// requirement scales up. The cadence is derived from the run's TOTAL kill pool
// so a full clear always yields ~targetDropsPerRun drops, and it re-scales for
// free if wave counts change. Replaces the old "start at 3, +1 forever" rule,
// which was decoupled from how many kills a run actually offers.
// ============================================================================

/**
 * Max heroes deployed at once (Eden + 4 recruited slots). Gates the `newHero`
 * drop: once full, recruit drops stop being offered (docs/VOICE_DROPS.md).
 */
export const MAX_ACTIVE_HEROES = 5;

export const VOICE_DROP_TUNING = {
  /** Kills required for the very first drop. Small, so a companion arrives fast. */
  firstDropCost: 2,
  /**
   * How many drop EVENTS a full clear should yield (4 fill Eden's squad, the
   * rest are enhancements). Must stay <= TOTAL_WAVES (data/waves.ts) — at most
   * one drop per wave on average; tests/unit/balance.test.ts enforces it.
   */
  targetDropsPerRun: 20,
  /** Floor on the per-drop increment so late drops never get cheaper than this. */
  minIncrement: 1,
} as const;

/**
 * @deprecated The prototype's triangular wave structure (wave N = N * 5
 * grunts) is gone — battles now run the authored 20-wave table, so the pool
 * comes from `authoredKillCount(buildWaveTable(...))` in data/waves.ts.
 * Split/summon spawns remain bonus on top — the pool is intentionally the
 * *authored* kill count, not the runtime maximum.
 */
export function computeKillPool(totalWaves: number, baseWaveSize = 5): number {
  return (baseWaveSize * totalWaves * (totalWaves + 1)) / 2;
}

/**
 * Incremental voices required before drop #dropIndex (0-based) fires, given
 * the run's kill pool. Linear-growth thresholds tuned so exactly
 * targetDropsPerRun drops land across the pool.
 *
 *   step = 2 * (pool - D * firstDropCost) / (D * (D - 1))
 *   cost(k) = round(firstDropCost + k * step)
 *
 * Engineer: track a `dropIndex` counter in GameScene; set the next
 * `maxVoicesCount` to `voiceDropCost(dropIndex, computeKillPool(totalWaves))`
 * after each drop instead of the current `maxVoicesCount += 1`.
 */
export function voiceDropCost(dropIndex: number, killPool: number): number {
  const { firstDropCost, targetDropsPerRun: drops, minIncrement } = VOICE_DROP_TUNING;
  const step = Math.max(minIncrement, (2 * (killPool - drops * firstDropCost)) / (drops * (drops - 1)));
  return Math.max(1, Math.round(firstDropCost + dropIndex * step));
}

// ============================================================================
// UPGRADE MATRIX  (design: docs/VOICE_DROPS.md)
// ----------------------------------------------------------------------------
// What the Voices RNG is allowed to offer. Two buckets:
//   1. Hero-targeted upgrades — applied to ONE active hero. Which kinds are
//      eligible depends on that hero's attackStyle (UPGRADE_MATRIX).
//   2. Global drops — recruit a new hero, or patch the Barrier.
// Magnitudes/rarity/copy live here; the RNG (core/Drops.ts, engineer) reads
// this, filters out anything that can't apply ("no dead drops"), weights by
// rarity, and applies via `apply`.
// ============================================================================

/** DropRarity mirrors the union in core/GameEvents.ts (kept in sync deliberately). */
export type DropRarity = 'common' | 'rare' | 'epic';

export type UpgradeKind =
  // universal — every attackStyle can roll these (hero-targeted stat sticks)
  | 'damage' | 'attackSpeed' | 'range'
  // behavior — style-specific; map onto the AttackModifiers already in Attacks.ts
  | 'pierce' | 'chain' | 'radius';

export interface UpgradeSpec {
  kind: UpgradeKind;
  /** Card title shown to the player. */
  title: string;
  /** "what this improves and by how much" — the drop card body copy. */
  purpose: string;
  rarity: DropRarity;
  /** Per-pick magnitude. Interpretation depends on `apply`. */
  magnitude: number;
  /**
   * How the engineer applies one pick:
   *  - 'flatDamage'      -> hero.damage += magnitude
   *  - 'attackSpeedMult' -> hero.attackRateMs = max(200, hero.attackRateMs * magnitude)
   *  - 'flatRange'       -> hero.range += magnitude
   *  - 'bonusPierce'     -> hero AttackModifiers.bonusPierce += magnitude
   *  - 'bonusChain'      -> hero AttackModifiers.bonusChain += magnitude
   *  - 'bonusRadius'     -> hero AttackModifiers.bonusRadius += magnitude
   * NOTE (engineer): behavior mods must be stored ON the Hero and passed into
   * every Attack it spawns. Today GameScene builds Attacks with no persisted
   * modifiers, so pierce/chain/radius upgrades have nowhere to land yet.
   */
  apply: 'flatDamage' | 'attackSpeedMult' | 'flatRange' | 'bonusPierce' | 'bonusChain' | 'bonusRadius';
  /** Cap on how many times this can stack on a single hero (feeds "no dead drops"). */
  maxStacks: number;
}

export const UPGRADE_DEFS: Record<UpgradeKind, UpgradeSpec> = {
  damage: {
    kind: 'damage', title: 'Damage Up', purpose: '+6 damage to this hero\'s attacks.',
    rarity: 'common', magnitude: 6, apply: 'flatDamage', maxStacks: 5,
  },
  attackSpeed: {
    kind: 'attackSpeed', title: 'Attack Speed Up', purpose: 'This hero attacks 15% faster.',
    rarity: 'common', magnitude: 0.85, apply: 'attackSpeedMult', maxStacks: 5,
  },
  range: {
    kind: 'range', title: 'Range Up', purpose: '+40 reach up the lane for this hero.',
    rarity: 'rare', magnitude: 40, apply: 'flatRange', maxStacks: 3,
  },
  pierce: {
    kind: 'pierce', title: 'Piercing Shot', purpose: 'This hero\'s shots punch through 1 more enemy.',
    rarity: 'rare', magnitude: 1, apply: 'bonusPierce', maxStacks: 3,
  },
  chain: {
    kind: 'chain', title: 'Extra Arc', purpose: 'This hero\'s bolt jumps to 1 more target.',
    rarity: 'rare', magnitude: 1, apply: 'bonusChain', maxStacks: 3,
  },
  radius: {
    kind: 'radius', title: 'Wider Blast', purpose: '+15 area radius on this hero\'s attacks.',
    rarity: 'rare', magnitude: 15, apply: 'bonusRadius', maxStacks: 3,
  },
};

/**
 * Which upgrade kinds each attackStyle can be offered. Universal stats
 * (damage/attackSpeed/range) are on every list; behavior mods only where the
 * style actually consumes them in Attacks.ts.
 */
export const UPGRADE_MATRIX: Record<HeroDefinition['attackStyle'], UpgradeKind[]> = {
  projectile:    ['damage', 'attackSpeed', 'range', 'pierce'],
  pierce:        ['damage', 'attackSpeed', 'range', 'pierce'],
  chain:         ['damage', 'attackSpeed', 'range', 'chain'],
  boomerang:     ['damage', 'attackSpeed', 'range', 'radius'],
  beam:          ['damage', 'attackSpeed', 'range', 'radius'],
  'melee-cleave':['damage', 'attackSpeed', 'range', 'radius'],
  lobbed:        ['damage', 'attackSpeed', 'range', 'radius'],
  vortex:        ['damage', 'attackSpeed', 'range', 'radius'],
  trap:          ['damage', 'attackSpeed', 'range', 'radius'],
  'linear-wave': ['damage', 'attackSpeed', 'range', 'radius'],
  // Summoner damage = wall HP; no behavior mod, stats only.
  summoner:      ['damage', 'attackSpeed', 'range'],
};

export type GlobalDropKind = 'newHero' | 'moraleHeal';

export interface GlobalDropSpec {
  kind: GlobalDropKind;
  title: string;
  purpose: string;
  rarity: DropRarity;
  /** Barrier HP restored for 'moraleHeal'; unused otherwise. */
  magnitude: number;
}

export const GLOBAL_DROP_DEFS: Record<GlobalDropKind, GlobalDropSpec> = {
  newHero: {
    kind: 'newHero', title: 'New Worker',
    purpose: 'Recruit an unlocked worker into an open squad slot.',
    rarity: 'common', magnitude: 0,
  },
  moraleHeal: {
    kind: 'moraleHeal', title: 'Barrier Patch',
    purpose: 'Restore 150 Barrier integrity instantly.',
    rarity: 'common', magnitude: 150,
  },
};

/**
 * Base pull weight per rarity — the wave-1 baselines. Later waves multiply
 * rare/epic weights via `rarityWeightsForWave` (docs/WORLD_AND_HEROES.md
 * rule 6, "rarity scales with waves").
 */
export const DROP_RARITY_WEIGHTS: Record<DropRarity, number> = {
  common: 100,
  rare: 35,
  epic: 10,
};

/**
 * Rarity weights for a drop rolled on the given wave (1-based). Common stays
 * flat while rare/epic grow linearly, so late-battle drops skew exciting:
 * by wave 20 rare is ~2x and epic ~2.9x their baseline pull.
 */
export function rarityWeightsForWave(wave: number): Record<DropRarity, number> {
  const n = Math.max(0, wave - 1);
  return {
    common: DROP_RARITY_WEIGHTS.common,
    rare: DROP_RARITY_WEIGHTS.rare * (1 + 0.05 * n),
    epic: DROP_RARITY_WEIGHTS.epic * (1 + 0.10 * n),
  };
}
