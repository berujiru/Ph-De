import { describe, expect, it } from 'vitest';
import { findTarget, type Targetable } from '../../src/game/core/Targeting';

function enemy(overrides: Partial<Targetable>): Targetable {
  return { x: 0, y: 0, hp: 10, distanceTraveled: 0, ...overrides };
}

describe('findTarget', () => {
  it('returns null when no candidates are in range', () => {
    const result = findTarget(0, 0, 50, [enemy({ x: 100, y: 0 })]);
    expect(result).toBeNull();
  });

  it('ignores dead candidates', () => {
    const result = findTarget(0, 0, 50, [enemy({ x: 10, y: 0, hp: 0 })]);
    expect(result).toBeNull();
  });

  it('picks the in-range enemy furthest along the path', () => {
    const laggard = enemy({ x: 10, y: 0, distanceTraveled: 5 });
    const leader = enemy({ x: 20, y: 0, distanceTraveled: 40 });
    const result = findTarget(0, 0, 50, [laggard, leader]);
    expect(result).toBe(leader);
  });

  it('excludes out-of-range enemies even if they lead on the path', () => {
    const inRange = enemy({ x: 10, y: 0, distanceTraveled: 5 });
    const outOfRangeLeader = enemy({ x: 1000, y: 0, distanceTraveled: 999 });
    const result = findTarget(0, 0, 50, [inRange, outOfRangeLeader]);
    expect(result).toBe(inRange);
  });

  it('treats range as inclusive at the boundary', () => {
    const result = findTarget(0, 0, 50, [enemy({ x: 50, y: 0 })]);
    expect(result).not.toBeNull();
  });
});
