import { describe, expect, it } from 'vitest';
import {
  ENEMY_INTRO_FALLBACK,
  ENEMY_INTRO_STAGE,
  gateEnemyForStage,
  type GatedEnemyId,
} from '../../src/game/data/enemyUnlocks';
import { FINALE_STAGE } from '../../src/game/data/campaign';
import { TOTAL_WAVES, authoredKillCount, bossForStage, buildWaveTable } from '../../src/game/data/waves';

const gatedIds = Object.keys(ENEMY_INTRO_STAGE) as GatedEnemyId[];

/** Distinct non-boss enemy ids spawned by a stage's wave table. */
function minionRoster(act: number, stageIdx: number): Set<string> {
  const bossId = bossForStage(act, stageIdx);
  const roster = new Set<string>();
  for (const wave of buildWaveTable(bossId, act, stageIdx)) {
    for (const evt of wave.events) {
      if (evt.type === 'spawn' && evt.enemyId !== bossId) roster.add(evt.enemyId);
    }
  }
  return roster;
}

describe('ENEMY_INTRO_STAGE — table integrity', () => {
  it('every intro stage is a real campaign stage (1..40)', () => {
    for (const stage of Object.values(ENEMY_INTRO_STAGE)) {
      expect(stage).toBeGreaterThanOrEqual(1);
      expect(stage).toBeLessThan(FINALE_STAGE);
    }
  });

  it('every fallback is itself unlocked from stage 1', () => {
    for (const id of gatedIds) {
      const fallback = ENEMY_INTRO_FALLBACK[id] as GatedEnemyId;
      expect(ENEMY_INTRO_STAGE[fallback]).toBe(1);
    }
  });

  it('every enemy in the authored wave table has an intro stage', () => {
    for (const wave of buildWaveTable(bossForStage(1, 0))) {
      for (const evt of wave.events) {
        if (evt.type !== 'spawn' || evt.enemyId.startsWith('boss_')) continue;
        expect(gatedIds).toContain(evt.enemyId);
      }
    }
  });
});

describe('buildWaveTable — stage-gated roster', () => {
  it('stage 1 spawns only the tutorial trio (plus the boss)', () => {
    expect(minionRoster(1, 0)).toEqual(new Set(['grunt', 'runner', 'brute']));
  });

  it('the minion roster only ever grows as the campaign advances', () => {
    let previous = new Set<string>();
    for (let act = 1; act <= 4; act++) {
      for (let stageIdx = 0; stageIdx < 10; stageIdx++) {
        const roster = minionRoster(act, stageIdx);
        for (const id of previous) expect(roster.has(id)).toBe(true);
        previous = roster;
      }
    }
  });

  it('the last act-4 stage runs the full authored script', () => {
    const gated = buildWaveTable(bossForStage(4, 9), 4, 9);
    const authored = buildWaveTable(bossForStage(4, 9));
    expect(gated).toEqual(authored);
  });

  it('gating never changes the authored kill pool', () => {
    const baseline = authoredKillCount(buildWaveTable(bossForStage(1, 0)));
    for (let act = 1; act <= 4; act++) {
      for (let stageIdx = 0; stageIdx < 10; stageIdx++) {
        const table = buildWaveTable(bossForStage(act, stageIdx), act, stageIdx);
        expect(table).toHaveLength(TOTAL_WAVES);
        expect(authoredKillCount(table)).toBe(baseline);
      }
    }
  });

  it('non-campaign battles (null coordinates) run the full script', () => {
    for (const id of gatedIds) {
      expect(gateEnemyForStage(id, null, null)).toBe(id);
    }
  });

  it('bosses pass through the gate untouched', () => {
    expect(gateEnemyForStage('boss_flood_control', 1, 0)).toBe('boss_flood_control');
  });
});
