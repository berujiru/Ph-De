import { describe, expect, it } from 'vitest';
import { ENEMY_DEFINITIONS, type EnemyId } from '../../src/game/data/enemies';
import {
  INTER_WAVE_DELAY_MS,
  TOTAL_WAVES,
  WAVE_SCALING,
  authoredKillCount,
  bossForStage,
  buildWaveTable,
  waveStatMultipliers,
} from '../../src/game/data/waves';

/**
 * Guards the wave-table invariants (docs/WAVE_ENGINE_SPEC.md,
 * docs/TESTING.md): structure and data consistency, not "fun".
 */
describe('wave table invariants', () => {
  const table = buildWaveTable(bossForStage(1, 0));

  it(`has exactly TOTAL_WAVES (${TOTAL_WAVES}) waves numbered 1..${TOTAL_WAVES}`, () => {
    expect(table).toHaveLength(TOTAL_WAVES);
    table.forEach((wave, idx) => expect(wave.waveNumber).toBe(idx + 1));
  });

  it('every spawned enemy id exists in ENEMY_DEFINITIONS', () => {
    for (const wave of table) {
      for (const evt of wave.events) {
        if (evt.type === 'spawn') {
          expect(ENEMY_DEFINITIONS[evt.enemyId], `wave ${wave.waveNumber} spawns unknown '${evt.enemyId}'`).toBeDefined();
        }
      }
    }
  });

  it('no boss or sandbox enemy spawns before the final wave', () => {
    for (const wave of table.slice(0, -1)) {
      for (const evt of wave.events) {
        if (evt.type === 'spawn') {
          expect(evt.enemyId.startsWith('boss_'), `boss on wave ${wave.waveNumber}`).toBe(false);
          expect(evt.enemyId.startsWith('sandbox_'), `sandbox unit on wave ${wave.waveNumber}`).toBe(false);
        }
      }
    }
  });

  it('the final wave spawns exactly one boss, for every stage mapping', () => {
    for (let act = 1; act <= 5; act++) {
      for (let stageIdx = 0; stageIdx < 10; stageIdx++) {
        const bossId = bossForStage(act, stageIdx);
        expect(bossId.startsWith('boss_')).toBe(true);
        const finalWave = buildWaveTable(bossId)[TOTAL_WAVES - 1];
        const bossSpawns = finalWave.events.filter(
          (e) => e.type === 'spawn' && e.enemyId.startsWith('boss_'),
        );
        expect(bossSpawns).toHaveLength(1);
        expect(bossSpawns[0].type === 'spawn' && bossSpawns[0].count).toBe(1);
      }
    }
  });

  it('non-campaign battles (null act/stage) still resolve a boss', () => {
    expect(bossForStage(null, null).startsWith('boss_')).toBe(true);
  });

  it('the finale act always fields Ang Sistema', () => {
    expect(bossForStage(5, 0)).toBe('boss_ang_sistema');
  });

  it('authored kill pool stays inside the tuned mobile-session band', () => {
    // 15-wave script → ~101 authored kills (down from the old 20-wave ~155).
    const pool = authoredKillCount(table);
    expect(pool).toBeGreaterThanOrEqual(85);
    expect(pool).toBeLessThanOrEqual(120);
  });

  it('spawn intervals and warning/delay durations are positive', () => {
    for (const wave of table) {
      for (const evt of wave.events) {
        if (evt.type === 'spawn') {
          expect(evt.count).toBeGreaterThan(0);
          expect(evt.intervalMs).toBeGreaterThan(0);
        } else {
          expect(evt.durationMs).toBeGreaterThan(0);
        }
      }
    }
    expect(INTER_WAVE_DELAY_MS).toBeGreaterThan(0);
  });
});

describe('wave stat scaling', () => {
  it('wave 1 is the balance.ts baseline (all 1.0x)', () => {
    expect(waveStatMultipliers(1)).toEqual({ hp: 1, damage: 1, speed: 1 });
  });

  it('multipliers grow monotonically with the wave number', () => {
    for (let wave = 2; wave <= TOTAL_WAVES; wave++) {
      const prev = waveStatMultipliers(wave - 1);
      const cur = waveStatMultipliers(wave);
      expect(cur.hp).toBeGreaterThan(prev.hp);
      expect(cur.damage).toBeGreaterThan(prev.damage);
      expect(cur.speed).toBeGreaterThanOrEqual(prev.speed);
    }
  });

  it('speed is capped at speedMultCap', () => {
    expect(waveStatMultipliers(TOTAL_WAVES).speed).toBeLessThanOrEqual(WAVE_SCALING.speedMultCap);
    expect(waveStatMultipliers(999).speed).toBe(WAVE_SCALING.speedMultCap);
  });

  it('matches the documented final-wave (15) endpoints', () => {
    const w15 = waveStatMultipliers(TOTAL_WAVES);
    expect(w15.hp).toBeCloseTo(2.4);
    expect(w15.damage).toBeCloseTo(1.7);
  });
});

describe('bossForStage', () => {
  it('rotates bosses within an act by stage index', () => {
    const first = bossForStage(1, 0);
    const second = bossForStage(1, 1);
    const wrapped = bossForStage(1, 3);
    expect(first).not.toBe(second);
    expect(wrapped).toBe(first);
  });

  it('only ever returns ids present in ENEMY_DEFINITIONS', () => {
    for (let act = 1; act <= 5; act++) {
      for (let stageIdx = 0; stageIdx < 10; stageIdx++) {
        const id: EnemyId = bossForStage(act, stageIdx);
        expect(ENEMY_DEFINITIONS[id]).toBeDefined();
      }
    }
  });
});
