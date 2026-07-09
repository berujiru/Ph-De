import type { HeroDefinition } from './heroes';

/**
 * Registry for basic-attack SVG art. Every hero attack visual is a
 * white/grayscale SVG in `public/assets/attacks/<stem>.svg`, tinted at
 * runtime with DAMAGE_TYPE_COLORS[damageType] — one file works for any
 * damage type (Student's Cramming randomizes the type per shot).
 *
 * Heroes pick their art via `HeroDefinition.attackArt`; heroes without one
 * (the sandbox testers) fall back to their attack style's default below.
 * GameScene.preload() derives its load list from allAttackArtStems(), so
 * adding a stem here or on a hero is all it takes to ship a new visual.
 */

export type AttackStyle = HeroDefinition['attackStyle'];

/** Per-style default SVG stem — sandbox testers and missing-art fallback. */
export const STYLE_DEFAULT_ART: Record<AttackStyle, string> = {
  projectile: 'default-projectile',
  pierce: 'default-pierce',
  boomerang: 'default-boomerang',
  lobbed: 'default-lobbed',
  'melee-cleave': 'default-melee-cleave',
  chain: 'default-chain',
  beam: 'default-beam',
  vortex: 'default-vortex',
  trap: 'default-trap',
  'linear-wave': 'default-linear-wave',
  summoner: 'default-summoner',
};

/** Texture key for a stem; namespaced so it can't collide with fx/hero keys. */
export function attackArtKey(stem: string): string {
  return `atk-${stem}`;
}

/** URL path the stem is loaded from. */
export function attackArtPath(stem: string): string {
  return `/assets/attacks/${stem}.svg`;
}

/** The stem a hero's basic attack renders with: its own art or the style default. */
export function resolveAttackArt(def: Pick<HeroDefinition, 'attackArt' | 'attackStyle'>): string {
  return def.attackArt ?? STYLE_DEFAULT_ART[def.attackStyle];
}

/** Every stem the game can render — the preload source of truth (deduped). */
export function allAttackArtStems(defs: Record<string, HeroDefinition>): string[] {
  const stems = new Set<string>(Object.values(STYLE_DEFAULT_ART));
  for (const def of Object.values(defs)) {
    stems.add(resolveAttackArt(def));
  }
  return [...stems];
}
