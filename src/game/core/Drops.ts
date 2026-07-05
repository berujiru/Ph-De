import type { DropOption } from './GameEvents';
import {
  DROP_RARITY_WEIGHTS,
  GLOBAL_DROP_DEFS,
  UPGRADE_DEFS,
  UPGRADE_MATRIX,
  type DropRarity,
  type HeroDefinition,
  type UpgradeKind,
} from '../data/balance';

/**
 * Pure, seedable Voice-drop RNG (docs/VOICE_DROPS.md section 4).
 *
 * Given the live battle state — active heroes with their per-hero upgrade
 * stacks, the recruitable roster, an open-slot flag, and barrier HP — it builds
 * the legal candidate pool from `UPGRADE_MATRIX` + `GLOBAL_DROP_DEFS`, filters
 * out anything that can't apply ("no dead drops": maxed upgrades, styles that
 * don't consume a mod, recruiting with no slot/roster, healing at full HP),
 * weights by `DROP_RARITY_WEIGHTS`, and rolls `count` distinct options.
 *
 * Deterministic under a given `rng`, so it unit-tests without Phaser or DOM.
 * GameScene supplies the live state, provides the rng, and applies the choice.
 */

/** One active (deployed) hero, as far as the drop roller cares. */
export interface ActiveHeroState {
  id: string;
  name: string;
  attackStyle: HeroDefinition['attackStyle'];
  /** Per-kind applied-count; absent keys count as 0. */
  stacks: Partial<Record<UpgradeKind, number>>;
}

/** A recruitable-but-not-yet-active hero (for the newHero drop). */
export interface RecruitState {
  id: string;
  name: string;
  purpose?: string;
}

export interface DropContext {
  activeHeroes: ActiveHeroState[];
  availableRecruits: RecruitState[];
  /** True when the squad has room for another hero (below the active cap). */
  hasOpenSlot: boolean;
  barrierHp: number;
  barrierMaxHp: number;
}

interface Candidate {
  option: DropOption;
  weight: number;
}

/** Deterministic mulberry32 PRNG — returns a `() => number` in [0, 1). */
export function makeRng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function weightFor(rarity: DropRarity): number {
  return DROP_RARITY_WEIGHTS[rarity];
}

/** Build the full legal candidate pool (before weighting/sampling). */
export function buildCandidatePool(ctx: DropContext, rng: () => number): Candidate[] {
  const candidates: Candidate[] = [];

  // --- Global drops ---------------------------------------------------------
  // newHero: only while a slot is open AND the roster has someone to recruit.
  if (ctx.hasOpenSlot && ctx.availableRecruits.length > 0) {
    // Pre-resolve which recruit this drop offers so the card can name them and
    // show their purpose ("display the purpose of the summon").
    const pick = ctx.availableRecruits[Math.floor(rng() * ctx.availableRecruits.length)];
    const spec = GLOBAL_DROP_DEFS.newHero;
    candidates.push({
      weight: weightFor(spec.rarity),
      option: {
        id: `hero:${pick.id}`,
        title: pick.name,
        description: pick.purpose ?? `Deploy ${pick.name} to the barricade.`,
        type: 'spawn',
        rarity: spec.rarity,
        kind: 'hero',
      },
    });
  }

  // moraleHeal: only when the barrier is actually damaged.
  if (ctx.barrierHp < ctx.barrierMaxHp) {
    const spec = GLOBAL_DROP_DEFS.moraleHeal;
    candidates.push({
      weight: weightFor(spec.rarity),
      option: {
        id: 'global:moraleHeal',
        title: spec.title,
        description: spec.purpose,
        type: 'spawn',
        rarity: spec.rarity,
        kind: 'generalUpgrade',
      },
    });
  }

  // --- Hero-targeted upgrades ----------------------------------------------
  for (const hero of ctx.activeHeroes) {
    const eligibleKinds = UPGRADE_MATRIX[hero.attackStyle] ?? [];
    for (const kind of eligibleKinds) {
      const spec = UPGRADE_DEFS[kind];
      const applied = hero.stacks[kind] ?? 0;
      // "No dead drops": never offer a maxed upgrade.
      if (applied >= spec.maxStacks) continue;
      candidates.push({
        weight: weightFor(spec.rarity),
        option: {
          id: `upgrade:${hero.id}:${kind}`,
          title: `${hero.name} — ${spec.title}`,
          description: spec.purpose,
          type: kind === 'attackSpeed' ? 'speed' : 'damage',
          rarity: spec.rarity,
          kind: 'heroUpgrade',
        },
      });
    }
  }

  return candidates;
}

/** Pick one candidate by weight from `pool`; returns undefined if empty. */
function pickWeighted(pool: Candidate[], rng: () => number): Candidate | undefined {
  const total = pool.reduce((sum, c) => sum + c.weight, 0);
  if (total <= 0) return undefined;
  let r = rng() * total;
  for (const c of pool) {
    r -= c.weight;
    if (r < 0) return c;
  }
  return pool[pool.length - 1];
}

/**
 * Roll up to `count` distinct drop options for the current battle state.
 * Returns fewer than `count` only when the legal pool is smaller than that.
 */
export function rollDrops(ctx: DropContext, rng: () => number, count = 3): DropOption[] {
  const remaining = buildCandidatePool(ctx, rng);
  const chosen: DropOption[] = [];

  while (chosen.length < count && remaining.length > 0) {
    const pick = pickWeighted(remaining, rng);
    if (!pick) break;
    chosen.push(pick.option);
    remaining.splice(remaining.indexOf(pick), 1);
  }

  return chosen;
}
