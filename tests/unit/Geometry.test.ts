import { describe, expect, it } from 'vitest';
import { isPointInCone, normalizeAngleDiff } from '../../src/game/core/Geometry';

const HALF_ANGLE = Math.PI / 6; // the standard 60° skill cone

describe('normalizeAngleDiff', () => {
  it('returns the plain difference for nearby angles', () => {
    expect(normalizeAngleDiff(0.5, 0.2)).toBeCloseTo(0.3);
    expect(normalizeAngleDiff(-0.2, 0.2)).toBeCloseTo(-0.4);
  });

  it('wraps differences across the ±PI boundary', () => {
    // 170° vs -170° are only 20° apart, not 340°
    const a = (170 * Math.PI) / 180;
    const b = (-170 * Math.PI) / 180;
    expect(normalizeAngleDiff(a, b)).toBeCloseTo((-20 * Math.PI) / 180);
    expect(normalizeAngleDiff(b, a)).toBeCloseTo((20 * Math.PI) / 180);
  });
});

describe('isPointInCone', () => {
  it('accepts a point straight along the cone direction', () => {
    // Cone aimed straight up (-PI/2), point directly above the apex
    expect(isPointInCone(0, -100, 0, 0, -Math.PI / 2, HALF_ANGLE, 200)).toBe(true);
  });

  it('accepts a point just inside the half-angle and rejects one just outside', () => {
    const length = 200;
    const inside = -Math.PI / 2 + HALF_ANGLE * 0.95;
    const outside = -Math.PI / 2 + HALF_ANGLE * 1.05;
    expect(
      isPointInCone(Math.cos(inside) * 100, Math.sin(inside) * 100, 0, 0, -Math.PI / 2, HALF_ANGLE, length)
    ).toBe(true);
    expect(
      isPointInCone(Math.cos(outside) * 100, Math.sin(outside) * 100, 0, 0, -Math.PI / 2, HALF_ANGLE, length)
    ).toBe(false);
  });

  it('rejects a point beyond the cone length even when aligned', () => {
    expect(isPointInCone(0, -201, 0, 0, -Math.PI / 2, HALF_ANGLE, 200)).toBe(false);
  });

  it('accepts a point at the apex regardless of direction', () => {
    expect(isPointInCone(0, 0, 0, 0, 1.234, HALF_ANGLE, 200)).toBe(true);
  });

  it('handles cones aimed across the ±PI wraparound', () => {
    // Cone aimed at PI (straight left); a point up-left at ~170° is inside a 30° half-angle
    expect(isPointInCone(-100, -10, 0, 0, Math.PI, HALF_ANGLE, 200)).toBe(true);
    // A point down-left at ~-170° is also inside
    expect(isPointInCone(-100, 10, 0, 0, Math.PI, HALF_ANGLE, 200)).toBe(true);
    // A point at ~135° is outside
    expect(isPointInCone(-100, -100, 0, 0, Math.PI, HALF_ANGLE, 200)).toBe(false);
  });
});
