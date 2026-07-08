import { describe, expect, it } from 'vitest';
import {
  formationTargetY,
  isFieldClear,
  nextShieldY,
  stepTowardFormation,
  type FormationSlotConfig,
  type RallyMarchConfig,
} from '../../src/game/core/RallyMarch';
import { RALLY } from '../../src/game/data/level';
import { HERO_DEFINITIONS } from '../../src/game/data/balance';

const config: RallyMarchConfig = {
  marchSpeedPxPerSec: 50,
  engageRangePx: 200,
  shieldMaxY: 200,
};

describe('isFieldClear', () => {
  it('is clear with no enemies', () => {
    expect(isFieldClear(500, [], 200)).toBe(true);
  });

  it('is clear when all enemies are beyond engage range', () => {
    expect(isFieldClear(500, [299, -100], 200)).toBe(true);
  });

  it('is contested when an enemy is within engage range ahead', () => {
    expect(isFieldClear(500, [400], 200)).toBe(false);
  });

  it('is contested when an enemy has leaked behind the shield', () => {
    expect(isFieldClear(500, [600], 200)).toBe(false);
  });

  it('treats an enemy exactly at the engage boundary as engaged', () => {
    expect(isFieldClear(500, [300], 200)).toBe(false);
    expect(isFieldClear(500, [299.999], 200)).toBe(true);
  });

  it('is contested by an enemy exactly on the shield line', () => {
    expect(isFieldClear(500, [500], 200)).toBe(false);
  });
});

describe('nextShieldY', () => {
  it('advances at march speed while the field is clear', () => {
    expect(nextShieldY(500, 1000, [], config)).toBe(450);
  });

  it('is frame-rate independent (two half-steps equal one full step)', () => {
    const oneStep = nextShieldY(500, 1000, [], config);
    const twoSteps = nextShieldY(nextShieldY(500, 500, [], config), 500, [], config);
    expect(twoSteps).toBeCloseTo(oneStep);
  });

  it('halts while an enemy is engaged', () => {
    expect(nextShieldY(500, 1000, [350], config)).toBe(500);
  });

  it('resumes once the engaged enemy is gone', () => {
    const halted = nextShieldY(500, 1000, [350], config);
    expect(nextShieldY(halted, 1000, [], config)).toBe(450);
  });

  it('clamps at shieldMaxY', () => {
    expect(nextShieldY(210, 60_000, [], config)).toBe(200);
  });

  it('stays put when already at shieldMaxY', () => {
    expect(nextShieldY(200, 1000, [], config)).toBe(200);
  });

  it('does not move when dtMs is 0 (paused / speed-0 frame)', () => {
    expect(nextShieldY(500, 0, [], config)).toBe(500);
  });
});

describe('formationTargetY', () => {
  // enemyContactAheadPx is small (shield half-width) so short-range heroes
  // get pulled forward; slack keeps a comfortable margin inside range.
  const formation: FormationSlotConfig = {
    meleeOffsetY: 45,
    rangedOffsetY: 150,
    enemyContactAheadPx: 15,
    rangeSlackPx: 20,
  };

  it('holds a long-range hero at its preferred crowd depth', () => {
    // range 1000 easily reaches the front, so the preferred offset wins.
    expect(formationTargetY(500, { attackKind: 'ranged', rangePx: 1000 }, formation)).toBe(650);
    expect(formationTargetY(500, { attackKind: 'melee', rangePx: 1000 }, formation)).toBe(545);
  });

  it('pulls a short-range melee hero forward so it can reach the shield front', () => {
    // Preferred 45 would leave a range-50 melee hero 60px from the contact
    // point (out of range); range-awareness clamps the slot forward to 15.
    // 50 (range) - 15 (ahead) - 20 (slack) = 15 offset from shield.
    expect(formationTargetY(500, { attackKind: 'melee', rangePx: 50 }, formation)).toBe(515);
  });

  it('pulls a mid-range ranged hero forward past its preferred depth', () => {
    // range 150 can't reach from 150 offset. Max offset is 150 - 15 - 20 = 115.
    // 500 + 115 = 615.
    expect(formationTargetY(500, { attackKind: 'ranged', rangePx: 150 }, formation)).toBe(615);
  });

  // The load-bearing invariant: whatever slot a hero holds, an enemy stopped
  // at the shield's front edge must be inside its basic-attack range.
  const shieldY = 500;
  const enemyAtFrontY = shieldY - formation.enemyContactAheadPx; // 485

  it('lands a range-50 melee hero on an enemy at the shield front', () => {
    const heroY = formationTargetY(shieldY, { attackKind: 'melee', rangePx: 50 }, formation); // 515
    expect(heroY - enemyAtFrontY).toBeLessThanOrEqual(50);
  });

  it('lands a range-150 ranged hero on an enemy at the shield front', () => {
    const heroY = formationTargetY(shieldY, { attackKind: 'ranged', rangePx: 150 }, formation); // 615
    expect(heroY - enemyAtFrontY).toBeLessThanOrEqual(150);
  });

  it('keeps every shipped hero definition in range of an enemy at the shield front', () => {
    const contactY = RALLY.shieldStartY - RALLY.formation.enemyContactAheadPx;
    for (const hero of Object.values(HERO_DEFINITIONS)) {
      const heroY = formationTargetY(
        RALLY.shieldStartY,
        { attackKind: hero.attackKind, rangePx: hero.range },
        RALLY.formation,
      );
      const distance = heroY - contactY;
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
    expect(stepTowardFormation(501, 500, 16, options)).toEqual({ y: 500, locomotion: 'idle' });
  });

  it('walks at march speed when slightly out of position', () => {
    const result = stepTowardFormation(520, 500, 1000, options);
    expect(result.locomotion).toBe('walk');
    expect(result.y).toBe(500); // step clamped to the remaining distance
  });

  it('runs at catch-up speed when far from the slot', () => {
    const result = stepTowardFormation(700, 500, 1000, options);
    expect(result.locomotion).toBe('run');
    expect(result.y).toBe(600); // 50 * 2 px/sec for 1s = 100px. 700 - 100 = 600.
  });

  it('moves backward toward a slot behind it', () => {
    const result = stepTowardFormation(300, 500, 1000, options);
    expect(result.locomotion).toBe('run');
    expect(result.y).toBe(400); // 300 + 100 = 400
  });

  it('never overshoots the slot', () => {
    const result = stepTowardFormation(505, 500, 1000, options);
    expect(result.y).toBe(500);
  });

  it('does not move when dtMs is 0, but still reports its locomotion', () => {
    expect(stepTowardFormation(300, 500, 0, options)).toEqual({ y: 300, locomotion: 'run' });
    expect(stepTowardFormation(520, 500, 0, options)).toEqual({ y: 520, locomotion: 'walk' });
  });

  it('walks (not runs) at exactly the run threshold distance', () => {
    const result = stepTowardFormation(560, 500, 16, options);
    expect(result.locomotion).toBe('walk');
    expect(result.y).toBeCloseTo(559.2); // 560 - (50 * 0.016)
  });

  it('snaps and idles at exactly the settle distance', () => {
    expect(stepTowardFormation(502, 500, 16, options)).toEqual({ y: 500, locomotion: 'idle' });
  });

  it('is frame-rate independent while catching up (two half-steps equal one full step)', () => {
    const oneStep = stepTowardFormation(800, 500, 1000, options).y;
    const halfStep = stepTowardFormation(800, 500, 500, options).y;
    const twoSteps = stepTowardFormation(halfStep, 500, 500, options).y;
    expect(twoSteps).toBeCloseTo(oneStep);
  });
});

