import { describe, expect, it } from 'vitest';
import {
  formationTargetX,
  isFieldClear,
  nextShieldX,
  stepTowardFormation,
  type FormationSlotConfig,
  type RallyMarchConfig,
} from '../../src/game/core/RallyMarch';
import { RALLY } from '../../src/game/data/level';
import { HERO_DEFINITIONS } from '../../src/game/data/balance';

const config: RallyMarchConfig = {
  marchSpeedPxPerSec: 50,
  engageRangePx: 200,
  shieldMaxX: 3000,
};

describe('isFieldClear', () => {
  it('is clear with no enemies', () => {
    expect(isFieldClear(500, [], 200)).toBe(true);
  });

  it('is clear when all enemies are beyond engage range', () => {
    expect(isFieldClear(500, [701, 1200], 200)).toBe(true);
  });

  it('is contested when an enemy is within engage range ahead', () => {
    expect(isFieldClear(500, [700], 200)).toBe(false);
  });

  it('is contested when an enemy has leaked behind the shield', () => {
    expect(isFieldClear(500, [400], 200)).toBe(false);
  });

  it('treats an enemy exactly at the engage boundary as engaged', () => {
    expect(isFieldClear(500, [700], 200)).toBe(false);
    expect(isFieldClear(500, [700.001], 200)).toBe(true);
  });

  it('is contested by an enemy exactly on the shield line', () => {
    expect(isFieldClear(500, [500], 200)).toBe(false);
  });
});

describe('nextShieldX', () => {
  it('advances at march speed while the field is clear', () => {
    expect(nextShieldX(500, 1000, [], config)).toBe(550);
  });

  it('is frame-rate independent (two half-steps equal one full step)', () => {
    const oneStep = nextShieldX(500, 1000, [], config);
    const twoSteps = nextShieldX(nextShieldX(500, 500, [], config), 500, [], config);
    expect(twoSteps).toBeCloseTo(oneStep);
  });

  it('halts while an enemy is engaged', () => {
    expect(nextShieldX(500, 1000, [650], config)).toBe(500);
  });

  it('resumes once the engaged enemy is gone', () => {
    const halted = nextShieldX(500, 1000, [650], config);
    expect(nextShieldX(halted, 1000, [], config)).toBe(550);
  });

  it('clamps at shieldMaxX', () => {
    expect(nextShieldX(2999, 60_000, [], config)).toBe(3000);
  });

  it('stays put when already at shieldMaxX', () => {
    expect(nextShieldX(3000, 1000, [], config)).toBe(3000);
  });

  it('does not move when dtMs is 0 (paused / speed-0 frame)', () => {
    expect(nextShieldX(500, 0, [], config)).toBe(500);
  });
});

describe('formationTargetX', () => {
  // enemyContactAheadPx is small (shield half-width) so short-range heroes
  // get pulled forward; slack keeps a comfortable margin inside range.
  const formation: FormationSlotConfig = {
    meleeOffsetX: -45,
    rangedOffsetX: -150,
    enemyContactAheadPx: 15,
    rangeSlackPx: 20,
  };

  it('holds a long-range hero at its preferred crowd depth', () => {
    // range 1000 easily reaches the front, so the preferred offset wins.
    expect(formationTargetX(500, { attackKind: 'ranged', rangePx: 1000 }, formation)).toBe(350);
    expect(formationTargetX(500, { attackKind: 'melee', rangePx: 1000 }, formation)).toBe(455);
  });

  it('pulls a short-range melee hero forward so it can reach the shield front', () => {
    // Preferred -45 would leave a range-50 melee hero 60px from the contact
    // point (out of range); range-awareness clamps the slot forward to -15.
    expect(formationTargetX(500, { attackKind: 'melee', rangePx: 50 }, formation)).toBe(485);
  });

  it('pulls a mid-range ranged hero forward past its preferred depth', () => {
    // range 150 can't reach from -150; clamps to -115.
    expect(formationTargetX(500, { attackKind: 'ranged', rangePx: 150 }, formation)).toBe(385);
  });

  // The load-bearing invariant: whatever slot a hero holds, an enemy stopped
  // at the shield's front edge must be inside its basic-attack range.
  const shieldX = 500;
  const enemyAtFrontX = shieldX + formation.enemyContactAheadPx;

  it('lands a range-50 melee hero on an enemy at the shield front', () => {
    const heroX = formationTargetX(shieldX, { attackKind: 'melee', rangePx: 50 }, formation);
    expect(enemyAtFrontX - heroX).toBeLessThanOrEqual(50);
  });

  it('lands a range-150 ranged hero on an enemy at the shield front', () => {
    const heroX = formationTargetX(shieldX, { attackKind: 'ranged', rangePx: 150 }, formation);
    expect(enemyAtFrontX - heroX).toBeLessThanOrEqual(150);
  });

  it('keeps every shipped hero definition in range of an enemy at the shield front', () => {
    const contactX = RALLY.shieldStartX + RALLY.formation.enemyContactAheadPx;
    for (const hero of Object.values(HERO_DEFINITIONS)) {
      const heroX = formationTargetX(
        RALLY.shieldStartX,
        { attackKind: hero.attackKind, rangePx: hero.range },
        RALLY.formation,
      );
      const distance = contactX - heroX;
      expect(distance, `${hero.id} slot is out of range`).toBeLessThanOrEqual(hero.range);
    }
  });
});

describe('stepTowardFormation', () => {
  const options = {
    marchSpeedPxPerSec: 50,
    catchUpSpeedMultiplier: 2,
    runDistancePx: 60,
    settleDistancePx: 2,
  };

  it('snaps to the slot and idles when already close enough', () => {
    expect(stepTowardFormation(499, 500, 16, options)).toEqual({ x: 500, locomotion: 'idle' });
  });

  it('walks at march speed when slightly out of position', () => {
    const result = stepTowardFormation(480, 500, 1000, options);
    expect(result.locomotion).toBe('walk');
    expect(result.x).toBe(500); // step clamped to the remaining distance
  });

  it('runs at catch-up speed when far from the slot', () => {
    const result = stepTowardFormation(300, 500, 1000, options);
    expect(result.locomotion).toBe('run');
    expect(result.x).toBe(400); // 50 * 2 px/sec for 1s
  });

  it('moves backward toward a slot behind it', () => {
    const result = stepTowardFormation(700, 500, 1000, options);
    expect(result.locomotion).toBe('run');
    expect(result.x).toBe(600);
  });

  it('never overshoots the slot', () => {
    const result = stepTowardFormation(495, 500, 1000, options);
    expect(result.x).toBe(500);
  });

  it('does not move when dtMs is 0, but still reports its locomotion', () => {
    expect(stepTowardFormation(300, 500, 0, options)).toEqual({ x: 300, locomotion: 'run' });
    expect(stepTowardFormation(480, 500, 0, options)).toEqual({ x: 480, locomotion: 'walk' });
  });

  it('walks (not runs) at exactly the run threshold distance', () => {
    const result = stepTowardFormation(440, 500, 16, options);
    expect(result.locomotion).toBe('walk');
    expect(result.x).toBeCloseTo(440.8);
  });

  it('snaps and idles at exactly the settle distance', () => {
    expect(stepTowardFormation(498, 500, 16, options)).toEqual({ x: 500, locomotion: 'idle' });
  });

  it('is frame-rate independent while catching up (two half-steps equal one full step)', () => {
    const oneStep = stepTowardFormation(200, 500, 1000, options).x;
    const halfStep = stepTowardFormation(200, 500, 500, options).x;
    const twoSteps = stepTowardFormation(halfStep, 500, 500, options).x;
    expect(twoSteps).toBeCloseTo(oneStep);
  });
});
