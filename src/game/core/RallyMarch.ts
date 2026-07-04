/**
 * Rules for the marching rally formation (docs/WORLD_AND_HEROES.md).
 *
 * The morale shield is the front of the crowd. While no living enemy is
 * "engaged" (within engage range ahead of the shield), the whole formation
 * advances; when enemies close in it halts, fights, and resumes once the
 * field ahead is clear. Pure math — the scene feeds positions in and renders
 * the result.
 */

export interface RallyMarchConfig {
  /** Formation advance speed, px/sec. */
  marchSpeedPxPerSec: number;
  /** A living enemy within this many px ahead of the shield halts the march. */
  engageRangePx: number;
  /** The shield never advances past this x. */
  shieldMaxX: number;
}

/**
 * True when no living enemy is engaged with the formation. An enemy counts
 * as engaged from `engageRangePx` ahead of the shield all the way down to
 * (and behind) the shield line itself — leaked enemies still halt the march.
 */
export function isFieldClear(
  shieldX: number,
  livingEnemyXs: readonly number[],
  engageRangePx: number,
): boolean {
  for (const x of livingEnemyXs) {
    if (x <= shieldX + engageRangePx) return false;
  }
  return true;
}

/**
 * Advances the shield by one frame. Frame-rate independent: pass any dtMs
 * and the shield moves marchSpeed * dt, clamped to shieldMaxX. Returns the
 * unchanged x while the field ahead is contested.
 */
export function nextShieldX(
  shieldX: number,
  dtMs: number,
  livingEnemyXs: readonly number[],
  config: RallyMarchConfig,
): number {
  if (!isFieldClear(shieldX, livingEnemyXs, config.engageRangePx)) return shieldX;
  return Math.min(config.shieldMaxX, shieldX + config.marchSpeedPxPerSec * (dtMs / 1000));
}

export interface FormationSlotConfig {
  /** Preferred hold offset for melee heroes, relative to the shield's x. */
  meleeOffsetX: number;
  /** Preferred hold offset for ranged heroes (deeper in the crowd). */
  rangedOffsetX: number;
  /** Enemies halt and attack this far ahead of the shield's x (the wall front edge). */
  enemyContactAheadPx: number;
  /** Safety margin kept between a hero's slot and the edge of its range. */
  rangeSlackPx: number;
}

/**
 * Where a hero should hold formation, relative to the shield front.
 *
 * Range-aware: a hero never holds so far back that an enemy stopped at the
 * shield front would be outside its basic-attack range — the range
 * requirement (plus a slack margin) overrides the preferred crowd depth.
 */
export function formationTargetX(
  shieldX: number,
  hero: { attackKind: 'melee' | 'ranged'; rangePx: number },
  formation: FormationSlotConfig,
): number {
  const preferredOffset = hero.attackKind === 'melee' ? formation.meleeOffsetX : formation.rangedOffsetX;
  const minOffsetForRange = formation.enemyContactAheadPx + formation.rangeSlackPx - hero.rangePx;
  return shieldX + Math.max(preferredOffset, minOffsetForRange);
}

/**
 * Moves a unit one frame toward its formation slot.
 * Returns the new x plus which locomotion state the move implies, so the
 * visual layer can pick walk vs run without re-deriving the math.
 */
export function stepTowardFormation(
  currentX: number,
  targetX: number,
  dtMs: number,
  options: {
    marchSpeedPxPerSec: number;
    catchUpSpeedMultiplier: number;
    runDistancePx: number;
    settleDistancePx: number;
  },
): { x: number; locomotion: 'idle' | 'walk' | 'run' } {
  const dx = targetX - currentX;
  const distance = Math.abs(dx);
  if (distance <= options.settleDistancePx) {
    return { x: targetX, locomotion: 'idle' };
  }
  const running = distance > options.runDistancePx;
  const speed = options.marchSpeedPxPerSec * (running ? options.catchUpSpeedMultiplier : 1);
  const step = Math.min(distance, speed * (dtMs / 1000));
  return { x: currentX + Math.sign(dx) * step, locomotion: running ? 'run' : 'walk' };
}
