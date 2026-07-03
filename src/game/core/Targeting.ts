export interface Targetable {
  x: number;
  y: number;
  hp: number;
  distanceTraveled: number;
}

/**
 * Picks the in-range enemy furthest along the path ("first" targeting,
 * the standard default strategy in tower defense games).
 */
export function findTarget<T extends Targetable>(
  originX: number,
  originY: number,
  range: number,
  candidates: readonly T[],
): T | null {
  let best: T | null = null;
  let bestDistanceTraveled = -Infinity;

  for (const candidate of candidates) {
    if (candidate.hp <= 0) continue;

    const dx = candidate.x - originX;
    const dy = candidate.y - originY;
    const distanceSq = dx * dx + dy * dy;
    if (distanceSq > range * range) continue;

    if (candidate.distanceTraveled > bestDistanceTraveled) {
      bestDistanceTraveled = candidate.distanceTraveled;
      best = candidate;
    }
  }

  return best;
}
