/**
 * Rules for the marching rally formation (docs/WORLD_AND_HEROES.md).
 *
 * The morale shield is the front of the crowd. The rally advances UP the world
 * (toward smaller y — the direction the enemies come from) while no living enemy
 * is "engaged" (within engage range ahead of the shield); when enemies close in
 * it halts, fights, and resumes once the field ahead is clear. Pure math — the
 * scene feeds positions in and renders the result.
 *
 * Axis convention (portrait): smaller y = FORWARD (toward the enemy spawns at
 * the top), larger y = BEHIND (toward the crowd at the bottom).
 */

export interface RallyMarchConfig {
  /** Formation advance speed, px/sec. */
  marchSpeedPxPerSec: number;
  /** A living enemy within this many px ahead of (above) the shield halts the march. */
  engageRangePx: number;
  /** The shield never advances past this y (the smallest/topmost y it can reach). */
  shieldMaxY: number;
}

/**
 * True when no living enemy is engaged with the formation. An enemy counts
 * as engaged from `engageRangePx` ahead of (above) the shield all the way down
 * to (and behind) the shield line itself — leaked enemies still halt the march.
 */
export function isFieldClear(
  shieldY: number,
  livingEnemyYs: readonly number[],
  engageRangePx: number,
): boolean {
  for (const y of livingEnemyYs) {
    if (y >= shieldY - engageRangePx) return false;
  }
  return true;
}

/**
 * Advances the shield by one frame. Frame-rate independent: pass any dtMs
 * and the shield moves marchSpeed * dt UPWARD (decreasing y), clamped to
 * shieldMaxY. Returns the unchanged y while the field ahead is contested.
 */
export function nextShieldY(
  shieldY: number,
  dtMs: number,
  livingEnemyYs: readonly number[],
  config: RallyMarchConfig,
): number {
  if (!isFieldClear(shieldY, livingEnemyYs, config.engageRangePx)) return shieldY;
  return Math.max(config.shieldMaxY, shieldY - config.marchSpeedPxPerSec * (dtMs / 1000));
}

export interface FormationSlotConfig {
  /** Preferred hold offset for melee heroes, relative to the shield's y (positive = behind/below). */
  meleeOffsetY: number;
  /** Preferred hold offset for ranged heroes (deeper in the crowd, further below). */
  rangedOffsetY: number;
  /** Enemies halt and attack this far ahead of (above) the shield's y (the wall front edge). */
  enemyContactAheadPx: number;
  /** Safety margin kept between a hero's slot and the edge of its range. */
  rangeSlackPx: number;
}

/**
 * Where a hero should hold formation, relative to the shield front.
 *
 * Range-aware: a hero never holds so far back (below) that an enemy stopped at
 * the shield front would be outside its basic-attack range — the range
 * requirement (minus a slack margin) overrides the preferred crowd depth by
 * pulling the hero forward (up).
 */
export function formationTargetY(
  shieldY: number,
  hero: { attackKind: 'melee' | 'ranged'; rangePx: number },
  formation: FormationSlotConfig,
): number {
  const preferredOffset = hero.attackKind === 'melee' ? formation.meleeOffsetY : formation.rangedOffsetY;
  // Largest offset (furthest behind) that still keeps a contact-point enemy in range.
  const maxOffsetForRange = hero.rangePx - formation.enemyContactAheadPx - formation.rangeSlackPx;
  return shieldY + Math.min(preferredOffset, maxOffsetForRange);
}

/**
 * Moves a unit one frame toward its formation slot.
 * Returns the new position plus which locomotion state the move implies, so the
 * visual layer can pick walk vs run without re-deriving the math. Axis-agnostic
 * (operates on a single scalar coordinate — now the march axis, y).
 */
export function stepTowardFormation(
  currentY: number,
  targetY: number,
  dtMs: number,
  options: {
    marchSpeedPxPerSec: number;
    catchUpSpeedMultiplier: number;
    runDistancePx: number;
    settleDistancePx: number;
  },
): { y: number; locomotion: 'idle' | 'walk' | 'run' } {
  const dy = targetY - currentY;
  const distance = Math.abs(dy);
  if (distance <= options.settleDistancePx) {
    return { y: targetY, locomotion: 'idle' };
  }
  const running = distance > options.runDistancePx;
  const speed = options.marchSpeedPxPerSec * (running ? options.catchUpSpeedMultiplier : 1);
  const step = Math.min(distance, speed * (dtMs / 1000));
  return { y: currentY + Math.sign(dy) * step, locomotion: running ? 'run' : 'walk' };
}
