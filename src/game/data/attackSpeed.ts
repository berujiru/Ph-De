import type { HeroDefinition } from './heroes';
import type { AttackStyle } from './attackArt';

/**
 * Flight speed for basic-attack projectiles, in px/s (mirrors the attackArt
 * registry pattern). Heroes override via `HeroDefinition.projectileSpeed`;
 * omitted heroes use their style default. Styles with no traveling body
 * (instant or field attacks) are 0 and never read the value.
 *
 * Feel guide: heavy/chunky projectiles fly slow (pandesal ~400), light sharp
 * ones fly fast (pencil ~850). Keep values within [250, 900] — enforced by
 * tests/unit/balance.test.ts.
 */
export const STYLE_DEFAULT_SPEED: Record<AttackStyle, number> = {
  projectile: 500,
  pierce: 600,
  boomerang: 400,
  lobbed: 500,
  'linear-wave': 300,
  'melee-cleave': 0,
  chain: 0,
  beam: 0,
  vortex: 420, // heavy lobbed net — slower than a plain projectile
  trap: 0,
  summoner: 400, // heavy thrown sheet — slower still than the vortex net
};

/** The flight speed (px/s) a hero's basic attack travels at. */
export function resolveAttackSpeed(def: Pick<HeroDefinition, 'projectileSpeed' | 'attackStyle'>): number {
  return def.projectileSpeed ?? STYLE_DEFAULT_SPEED[def.attackStyle];
}
