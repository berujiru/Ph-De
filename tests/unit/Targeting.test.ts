import { describe, expect, it } from 'vitest';
import { selectRallyTarget, type TargetCandidate } from '../../src/game/core/Targeting';

// Battle axis: enemies march DOWN (larger y = more advanced); the hero sits
// below at heroY and only shoots enemies ahead of it (smaller y). Range is
// measured along the y axis only.
const HERO_Y = 1000;
const RANGE = 500;

function enemy(overrides: Partial<TargetCandidate>): TargetCandidate {
  return {
    x: 540,
    y: 700,
    hp: 10,
    isDead: false,
    isStealthed: false,
    silenceTimer: 0,
    hasTauntAura: false,
    ...overrides,
  };
}

function select(candidates: TargetCandidate[], canSeeStealth = false) {
  return selectRallyTarget(HERO_Y, RANGE, canSeeStealth, candidates);
}

describe('selectRallyTarget', () => {
  it('returns null when no candidates are in range', () => {
    expect(select([enemy({ y: HERO_Y - RANGE - 1 })])).toBeNull();
  });

  it('treats range as inclusive at the boundary', () => {
    expect(select([enemy({ y: HERO_Y - RANGE })])).not.toBeNull();
  });

  it('ignores dead, zero-hp, and behind-the-hero candidates', () => {
    expect(
      select([
        enemy({ isDead: true }),
        enemy({ hp: 0 }),
        enemy({ y: HERO_Y + 10 }),
        enemy({ y: HERO_Y }),
      ]),
    ).toBeNull();
  });

  it('picks the most-advanced (frontmost) enemy', () => {
    const rear = enemy({ y: 600 });
    const front = enemy({ y: 900 });
    expect(select([rear, front])).toBe(front);
  });

  it('ignores stealthed enemies unless the hero sees stealth', () => {
    const stealthed = enemy({ y: 900, isStealthed: true });
    const visible = enemy({ y: 600 });
    expect(select([stealthed, visible])).toBe(visible);
    expect(select([stealthed, visible], true)).toBe(stealthed);
  });

  it('prioritizes an un-silenced taunter over a more-advanced enemy', () => {
    const taunter = enemy({ y: 600, hasTauntAura: true });
    const front = enemy({ y: 900 });
    expect(select([taunter, front])).toBe(taunter);
  });

  it('picks the most-advanced taunter when several taunt', () => {
    const rearTaunter = enemy({ y: 600, hasTauntAura: true });
    const frontTaunter = enemy({ y: 850, hasTauntAura: true });
    expect(select([rearTaunter, frontTaunter])).toBe(frontTaunter);
  });

  it('drops taunt priority while the taunter is silenced', () => {
    const taunter = enemy({ y: 600, hasTauntAura: true, silenceTimer: 1000 });
    const front = enemy({ y: 900 });
    expect(select([taunter, front])).toBe(front);
  });
});
