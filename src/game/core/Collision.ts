// Pure collision helpers shared by attack hit-tests. No Phaser imports.
//
// Convention across the attack classes: the effective hit distance is always
// `attack radius/half-width (+ bonusRadius where noted) + target.hitRadius`.
// Enemy body size lives in UNIT_HIT_RADIUS (data/enemies.ts), never here.

/** True if two circles overlap (inclusive of touching edges). */
export function circlesOverlap(
  ax: number, ay: number, ar: number,
  bx: number, by: number, br: number
): boolean {
  const dx = ax - bx;
  const dy = ay - by;
  const r = ar + br;
  return dx * dx + dy * dy <= r * r;
}

/**
 * Squared distance from point P to segment AB, with the projection clamped to
 * the segment (so points past an endpoint measure to that endpoint, not to the
 * infinite line). Degenerate A==B falls back to point-to-point distance.
 */
export function pointToSegmentDistSq(
  px: number, py: number,
  ax: number, ay: number,
  bx: number, by: number
): number {
  const abx = bx - ax;
  const aby = by - ay;
  const lenSq = abx * abx + aby * aby;
  let t = 0;
  if (lenSq > 0) {
    t = ((px - ax) * abx + (py - ay) * aby) / lenSq;
    if (t < 0) t = 0;
    else if (t > 1) t = 1;
  }
  const cx = ax + abx * t;
  const cy = ay + aby * t;
  const dx = px - cx;
  const dy = py - cy;
  return dx * dx + dy * dy;
}

/**
 * Capsule test: does circle (cx,cy,r) overlap segment AB? True when the
 * closest point on AB to the circle centre is within r. Degenerate A==B
 * behaves as a point-vs-circle test via pointToSegmentDistSq.
 */
export function segmentCircleOverlap(
  ax: number, ay: number,
  bx: number, by: number,
  cx: number, cy: number,
  r: number
): boolean {
  return pointToSegmentDistSq(cx, cy, ax, ay, bx, by) <= r * r;
}

/**
 * Swept lance vs circle. The lance is a segment of length 2*halfLengthPx,
 * oriented along (dirX,dirY), that moved from (prevX,prevY) to (curX,curY) this
 * frame. Because a pierce shot translates strictly along its own axis, the
 * swept shape collapses to a single segment: tail(prev - u*halfLen) ->
 * tip(cur + u*halfLen). This is what prevents fast shots (600-850 px/s) from
 * tunnelling past a body between frames. Combined radius = targetRadius +
 * halfWidthPx (the lance's lateral fatness).
 */
export function sweptLanceHitsCircle(
  prevX: number, prevY: number,
  curX: number, curY: number,
  dirX: number, dirY: number,
  halfLengthPx: number, halfWidthPx: number,
  cx: number, cy: number, targetRadius: number
): boolean {
  const dlen = Math.sqrt(dirX * dirX + dirY * dirY) || 1;
  const ux = dirX / dlen;
  const uy = dirY / dlen;
  const tailX = prevX - ux * halfLengthPx;
  const tailY = prevY - uy * halfLengthPx;
  const tipX = curX + ux * halfLengthPx;
  const tipY = curY + uy * halfLengthPx;
  return segmentCircleOverlap(tailX, tailY, tipX, tipY, cx, cy, targetRadius + halfWidthPx);
}
