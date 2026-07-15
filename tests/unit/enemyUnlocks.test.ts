import { describe, expect, it } from 'vitest';
import {
  ENEMY_INTRO_FALLBACK,
  ENEMY_INTRO_STAGE,
  gateEnemyForStage,
  type GatedEnemyId,
} from '../../src/game/data/enemyUnlocks';
import { FINALE_STAGE } from '../../src/game/data/campaign';
import {
  BOSS_STAGE_INTERVAL,
  TOTAL_WAVES,
  authoredKillCount,
  bossForStage,
  buildWaveTable,
  isBossStage,
} from '../../src/game/data/waves';

const gatedIds = Object.keys(ENEMY_INTRO_STAGE) as GatedEnemyId[];

/** Distinct non-boss enemy ids spawned by a stage's wave table. */
function minionRoster(act: number, stageIdx: number): Set<string> {
  const roster = new Set<string>();
  for (const wave of buildWaveTable(bossForStage(act, stageIdx), act, stageIdx)) {
    for (const evt of wave.events) {
      if (evt.type === 'spawn' && !evt.enemyId.startsWith('boss_')) roster.add(evt.enemyId);
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

  it('every fallback chain collapses to grunt on stage 1', () => {
    for (const id of gatedIds) {
      expect(gateEnemyForStage(id, 1, 0)).toBe('grunt');
    }
  });

  it('every fallback debuts no later than the enemy it stands in for', () => {
    for (const id of gatedIds) {
      const fallback = ENEMY_INTRO_FALLBACK[id] as GatedEnemyId;
      expect(ENEMY_INTRO_STAGE[fallback]).toBeLessThanOrEqual(ENEMY_INTRO_STAGE[id]);
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
  it('stage 1 is pure grunts, stage 2 adds only the runner', () => {
    expect(minionRoster(1, 0)).toEqual(new Set(['grunt']));
    expect(minionRoster(1, 1)).toEqual(new Set(['grunt', 'runner']));
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

  it('the last act-4 stage runs the full authored boss script', () => {
    const gated = buildWaveTable(bossForStage(4, 9), 4, 9);
    const authored = buildWaveTable(bossForStage(4, 9));
    expect(gated).toEqual(authored);
  });

  it('gating never changes the authored kill pool (except the eased opener)', () => {
    const baseline = authoredKillCount(buildWaveTable(bossForStage(1, 0)));
    for (let act = 1; act <= 4; act++) {
      for (let stageIdx = 0; stageIdx < 10; stageIdx++) {
        const table = buildWaveTable(bossForStage(act, stageIdx), act, stageIdx);
        expect(table).toHaveLength(TOTAL_WAVES);
        if (act === 1 && stageIdx === 0) {
          // Opening stage is intentionally thinned (OPENING_STAGE_COUNT_SCALE),
          // so its pool is lighter than the gating-only baseline.
          expect(authoredKillCount(table)).toBeLessThan(baseline);
        } else {
          expect(authoredKillCount(table)).toBe(baseline);
        }
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

describe('buildWaveTable — boss cadence', () => {
  it(`a boss anchors the final wave only every ${BOSS_STAGE_INTERVAL}th stage (and the finale)`, () => {
    for (let act = 1; act <= 4; act++) {
      for (let stageIdx = 0; stageIdx < 10; stageIdx++) {
        const globalStage = (act - 1) * 10 + stageIdx + 1;
        expect(isBossStage(act, stageIdx)).toBe(globalStage % BOSS_STAGE_INTERVAL === 0);
        const finalWave = buildWaveTable(bossForStage(act, stageIdx), act, stageIdx)[TOTAL_WAVES - 1];
        const bossSpawns = finalWave.events.filter(
          (e) => e.type === 'spawn' && e.enemyId.startsWith('boss_'),
        );
        expect(bossSpawns).toHaveLength(isBossStage(act, stageIdx) ? 1 : 0);
      }
    }
    expect(isBossStage(5, 0)).toBe(true);
    expect(isBossStage(null, null)).toBe(true); // sandbox quick-start keeps the boss finale
  });

  it('warnings stay honest: no boss/mini-boss alert without a matching spawn', () => {
    for (let act = 1; act <= 4; act++) {
      for (let stageIdx = 0; stageIdx < 10; stageIdx++) {
        for (const wave of buildWaveTable(bossForStage(act, stageIdx), act, stageIdx)) {
          const spawned = wave.events.flatMap((e) => (e.type === 'spawn' ? [e.enemyId] : []));
          for (const evt of wave.events) {
            if (evt.type !== 'warning') continue;
            if (evt.alertType === 'boss') {
              expect(spawned.some((id) => id.startsWith('boss_'))).toBe(true);
            }
          }
        }
      }
    }
    // Stage 1 concretely: no mini-boss/boss warnings at all — it's grunts only.
    const stage1Warnings = buildWaveTable(bossForStage(1, 0), 1, 0)
      .flatMap((w) => w.events)
      .filter((e) => e.type === 'warning' && e.alertType !== 'swarm');
    expect(stage1Warnings).toHaveLength(0);
  });
});
