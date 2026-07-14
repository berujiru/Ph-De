// Permanent hero-level progression — SEPARATE from the in-battle Voice-drop
// upgrade system (Hero.modifiers). Levels are bought with Hero Cards (metaState)
// and permanently scale a hero's damage, which in turn scales every basic attack
// and signature skill (all of core/Skills.ts derives from hero.damage).
//
// This module is the single tuning point for the curve — pure, no imports.

/** Max hero level. Level 1 is the floor (multiplier 1.0). */
export const HERO_LEVEL_CAP = 10;

/** Base-damage growth per level past 1. Deliberately small so leveling is a
 *  steady edge, not an instant power spike (+45% at the level-10 cap). */
export const DAMAGE_PER_LEVEL = 0.05;

/** Hero Cards needed to go from `currentLevel` to the next: 5, 10, 15, ... */
export function cardsForNextLevel(currentLevel: number): number {
  return 5 * currentLevel;
}

/** Damage multiplier for a given level, clamped to [1, HERO_LEVEL_CAP]. */
export function damageMultiplier(level: number): number {
  const lv = Math.max(1, Math.min(level, HERO_LEVEL_CAP));
  return 1 + DAMAGE_PER_LEVEL * (lv - 1);
}

/** Base damage scaled by the hero's level, rounded to a whole number. */
export function leveledDamage(baseDamage: number, level: number): number {
  return Math.round(baseDamage * damageMultiplier(level));
}
