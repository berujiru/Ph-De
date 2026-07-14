import { describe, expect, it } from 'vitest';
import {
  circlesOverlap,
  pointToSegmentDistSq,
  segmentCircleOverlap,
  sweptLanceHitsCircle,
} from '../../src/game/core/Collision';
import { ATTACK_COLLISION, lobbedSplashRadius } from '../../src/game/data/collision';
import { UNIT_HIT_RADIUS, enemyHitRadius, ENEMY_DEFINITIONS } from '../../src/game/data/enemies';

// A minion body (grunt tier) is the reference size across these tests.
const MINION_R = UNIT_HIT_RADIUS.minion; // 32
const PIERCE_HALF = ATTACK_COLLISION.pierce.halfWidth; // 12
// Student's dart is 88px long -> half-length 44 (a representative lance body).
const HALF_LEN = 44;

/** Convenience wrapper: a lance heading +x, from prev to cur, vs a circle. */
function pierceHit(
  prevX: number, prevY: number, curX: number, curY: number,
  ex: number, ey: number, er = MINION_R
): boolean {
  return sweptLanceHitsCircle(
    prevX, prevY, curX, curY, 1, 0, HALF_LEN, PIERCE_HALF, ex, ey, er
  );
}

describe('circlesOverlap', () => {
  it('is true when circles overlap and false when they are apart', () => {
    expect(circlesOverlap(0, 0, 10, 15, 0, 10)).toBe(true); // gap 15 < 20
    expect(circlesOverlap(0, 0, 10, 25, 0, 10)).toBe(false); // gap 25 > 20
  });

  it('counts exactly-touching edges as overlapping (inclusive)', () => {
    expect(circlesOverlap(0, 0, 10, 20, 0, 10)).toBe(true); // gap 20 == r sum
  });
});

describe('pointToSegmentDistSq', () => {
  it('clamps to the near endpoint for points past the segment end', () => {
    // Segment (0,0)->(100,0); point far past B at (200,0) measures to B (dist 100).
    expect(pointToSegmentDistSq(200, 0, 0, 0, 100, 0)).toBeCloseTo(100 * 100);
    // Point before A measures to A, NOT to the infinite line.
    expect(pointToSegmentDistSq(-50, 0, 0, 0, 100, 0)).toBeCloseTo(50 * 50);
  });

  it('measures perpendicular distance for points beside the segment', () => {
    expect(pointToSegmentDistSq(50, 30, 0, 0, 100, 0)).toBeCloseTo(30 * 30);
  });

  it('falls back to point distance for a degenerate segment', () => {
    expect(pointToSegmentDistSq(3, 4, 10, 10, 10, 10)).toBeCloseTo(7 * 7 + 6 * 6);
  });
});

describe('segmentCircleOverlap', () => {
  it('is true when the segment passes through the circle', () => {
    expect(segmentCircleOverlap(-100, 0, 100, 0, 0, 20, 25)).toBe(true);
  });
  it('is false when the circle is beyond the segment endpoint', () => {
    // Circle centered at (200,0) r10; nearest segment point is B(100,0), gap 100.
    expect(segmentCircleOverlap(-100, 0, 100, 0, 200, 0, 10)).toBe(false);
  });
});

describe('PierceAttack lance-vs-circle (the reported bug)', () => {
  it('does NOT hit an enemy laterally off to the side', () => {
    // Stationary frame at origin; enemy 60px off the path. 12 + 32 = 44 < 60.
    expect(pierceHit(0, 0, 0, 0, 0, 60)).toBe(false);
  });

  it('does NOT hit an enemy far ahead of the lance tip', () => {
    // Lance body spans x in [-44, 44]; enemy at x=300 is well beyond the tip.
    expect(pierceHit(0, 0, 0, 0, 300, 0)).toBe(false);
  });

  it('does NOT hit an enemy far behind the lance tail (infinite-line regression)', () => {
    // The old cross-product check would have hit this; the segment check must not.
    expect(pierceHit(0, 0, 0, 0, -300, 0)).toBe(false);
  });

  it('DOES hit an enemy whose body the lance overlaps', () => {
    // Enemy just ahead and slightly off-axis, within body + half-width.
    expect(pierceHit(0, 0, 0, 0, 40, 10)).toBe(true);
  });

  it('DOES hit a body the lance sweeps past between frames (no tunneling)', () => {
    // Moved 0 -> 200 this frame; enemy sits at x=100, missed by both endpoints'
    // static bodies but caught by the swept tail->tip segment.
    expect(pierceHit(0, 0, 200, 0, 100, 0)).toBe(true);
  });

  it('widens laterally with bonusRadius', () => {
    const offside = 60;
    const base = sweptLanceHitsCircle(0, 0, 0, 0, 1, 0, HALF_LEN, PIERCE_HALF, 0, offside, MINION_R);
    const fattened = sweptLanceHitsCircle(0, 0, 0, 0, 1, 0, HALF_LEN, PIERCE_HALF + 30, 0, offside, MINION_R);
    expect(base).toBe(false);
    expect(fattened).toBe(true);
  });
});

describe('lobbedSplashRadius', () => {
  it('returns the base splash with no bonus', () => {
    expect(lobbedSplashRadius(0)).toBe(90);
  });
  it('adds voice-drop bonusRadius stacks (two +15 = +30)', () => {
    expect(lobbedSplashRadius(30)).toBe(120);
  });
  it('is meaningfully larger than a single-target projectile radius', () => {
    expect(lobbedSplashRadius(0)).toBeGreaterThan(ATTACK_COLLISION.projectile.radius + UNIT_HIT_RADIUS.minion);
  });
});

describe('enemy hit radius by size tier', () => {
  it('grows monotonically with the size tier', () => {
    expect(UNIT_HIT_RADIUS.minion).toBeLessThan(UNIT_HIT_RADIUS.miniboss);
    expect(UNIT_HIT_RADIUS.miniboss).toBeLessThanOrEqual(UNIT_HIT_RADIUS.boss);
    expect(UNIT_HIT_RADIUS.miniboss).toBeLessThan(UNIT_HIT_RADIUS.boss);
  });

  it('resolves the right radius per enemy definition', () => {
    expect(enemyHitRadius(ENEMY_DEFINITIONS.grunt)).toBe(UNIT_HIT_RADIUS.minion);
    expect(enemyHitRadius(ENEMY_DEFINITIONS.brute)).toBe(UNIT_HIT_RADIUS.miniboss);
    expect(enemyHitRadius(ENEMY_DEFINITIONS.boss_flood_control)).toBe(UNIT_HIT_RADIUS.boss);
  });

  it('keeps the boss body well under its render height (not the full sprite)', () => {
    // Boss render height is 800px; the hit body must stay a fraction of that.
    expect(UNIT_HIT_RADIUS.boss).toBeLessThan(800 / 2);
  });
});
