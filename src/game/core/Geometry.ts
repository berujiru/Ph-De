// Pure geometry helpers shared by skill/attack hit-tests. No Phaser imports.

/** Normalizes the difference between two angles (radians) into [-PI, PI]. */
export function normalizeAngleDiff(a: number, b: number): number {
  let diff = a - b;
  while (diff < -Math.PI) diff += Math.PI * 2;
  while (diff > Math.PI) diff -= Math.PI * 2;
  return diff;
}

/**
 * True if point (px, py) lies inside a cone with apex (ax, ay), central
 * direction `angleRad`, spread of `halfAngleRad` on either side, and
 * maximum reach `length`.
 */
export function isPointInCone(
  px: number,
  py: number,
  ax: number,
  ay: number,
  angleRad: number,
  halfAngleRad: number,
  length: number
): boolean {
  const dx = px - ax;
  const dy = py - ay;
  if (dx * dx + dy * dy > length * length) return false;
  if (dx === 0 && dy === 0) return true; // at the apex, direction is undefined
  const pointAngle = Math.atan2(dy, dx);
  return Math.abs(normalizeAngleDiff(pointAngle, angleRad)) <= halfAngleRad;
}
