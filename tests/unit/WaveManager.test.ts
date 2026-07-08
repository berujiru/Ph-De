import { describe, expect, it } from 'vitest';
import { WaveManager, type WaveManagerOutput } from '../../src/game/core/WaveManager';
import {
  INTER_WAVE_DELAY_MS,
  authoredKillCount,
  bossForStage,
  buildWaveTable,
  type WaveDefinition,
} from '../../src/game/data/waves';

/** Two tiny hand-authored waves for exact-timing assertions. */
function miniTable(): WaveDefinition[] {
  return [
    {
      waveNumber: 1,
      events: [
        { type: 'spawn', enemyId: 'grunt', count: 3, intervalMs: 1000 },
      ],
    },
    {
      waveNumber: 2,
      events: [
        { type: 'warning', alertType: 'boss', text: 'BOSS', durationMs: 2000 },
        { type: 'delay', durationMs: 500 },
        { type: 'spawn', enemyId: 'brute', count: 1, intervalMs: 1000 },
      ],
    },
  ];
}

const spawnsOf = (outs: WaveManagerOutput[]) => outs.filter((o) => o.kind === 'spawn');

describe('WaveManager', () => {
  it('starts wave 1 and fires the first spawn immediately', () => {
    const wm = new WaveManager(miniTable(), INTER_WAVE_DELAY_MS);
    const outs = wm.update(0, 0);
    expect(outs).toContainEqual({ kind: 'waveStarted', wave: 1 });
    expect(spawnsOf(outs)).toEqual([{ kind: 'spawn', enemyId: 'grunt', wave: 1 }]);
    expect(wm.currentWave).toBe(1);
  });

  it('spaces subsequent spawns by intervalMs', () => {
    const wm = new WaveManager(miniTable(), INTER_WAVE_DELAY_MS);
    wm.update(0, 0); // wave start + spawn #1
    expect(spawnsOf(wm.update(999, 1))).toHaveLength(0);
    expect(spawnsOf(wm.update(1, 1))).toHaveLength(1); // exactly 1000ms
    expect(spawnsOf(wm.update(1000, 2))).toHaveLength(1); // spawn #3
  });

  it('does not advance to the next wave while enemies are alive', () => {
    const wm = new WaveManager(miniTable(), INTER_WAVE_DELAY_MS);
    wm.update(0, 0);
    wm.update(2000, 1); // all 3 grunts out
    // Field never clears — no matter how much time passes, wave 2 never starts.
    const outs = wm.update(60_000, 3);
    expect(outs).toHaveLength(0);
    expect(wm.currentWave).toBe(1);
  });

  it('waits the inter-wave delay after the field clears, then starts the next wave', () => {
    const wm = new WaveManager(miniTable(), 3000);
    wm.update(0, 0);
    wm.update(2000, 1); // all spawns of wave 1 emitted

    // Field cleared: the breather starts ticking now.
    expect(wm.update(2999, 0)).toHaveLength(0);
    const outs = wm.update(1, 0);
    expect(outs).toContainEqual({ kind: 'waveStarted', wave: 2 });
    expect(wm.currentWave).toBe(2);
  });

  it('emits the warning immediately and holds the queue for its duration', () => {
    const wm = new WaveManager(miniTable(), 0);
    wm.update(0, 0);
    wm.update(2000, 1); // wave 1 spawns done
    const outs = wm.update(0, 0); // breather is 0 — wave 2 begins
    expect(outs).toContainEqual({ kind: 'waveStarted', wave: 2 });
    expect(outs).toContainEqual({ kind: 'warning', alertType: 'boss', text: 'BOSS', durationMs: 2000 });
    expect(spawnsOf(outs)).toHaveLength(0);

    // warning (2000) + delay (500) hold the queue; the spawn lands only after.
    expect(spawnsOf(wm.update(2499, 0))).toHaveLength(0);
    expect(spawnsOf(wm.update(1, 0))).toEqual([{ kind: 'spawn', enemyId: 'brute', wave: 2 }]);
  });

  it('never advances past a wave on the same frame its last spawn was emitted', () => {
    // Even with living=0 and a zero breather, a spawn emitted this update must
    // gate wave advancement — the caller hasn't registered it yet.
    const wm = new WaveManager(miniTable(), 0);
    const outs = wm.update(60_000, 0);
    const started = outs.filter((o) => o.kind === 'waveStarted');
    expect(started).toEqual([{ kind: 'waveStarted', wave: 1 }]);
  });

  it('flips allSpawnsDone only after the final authored spawn', () => {
    const wm = new WaveManager(miniTable(), 0);
    wm.update(0, 0);
    wm.update(2000, 1);
    expect(wm.allSpawnsDone).toBe(false);
    wm.update(0, 0); // wave 2 starts (warning)
    expect(wm.allSpawnsDone).toBe(false);
    wm.update(2500, 0); // warning + delay elapse, brute spawns (count 1)
    expect(wm.allSpawnsDone).toBe(true);
    // Done queue stays silent.
    expect(wm.update(60_000, 0)).toHaveLength(0);
  });

  it('emits exactly authoredKillCount spawns across the real 20-wave table', () => {
    const table = buildWaveTable(bossForStage(1, 0));
    const wm = new WaveManager(table, INTER_WAVE_DELAY_MS);
    let spawned = 0;
    // Alternate frames: enemies die instantly (living=0 after each frame).
    for (let i = 0; i < 10_000 && !wm.allSpawnsDone; i++) {
      spawned += spawnsOf(wm.update(500, 0)).length;
    }
    expect(wm.allSpawnsDone).toBe(true);
    expect(spawned).toBe(authoredKillCount(table));
    expect(wm.currentWave).toBe(wm.totalWaves);
  });

  it('reports totalWaves from the table', () => {
    expect(new WaveManager(miniTable(), 0).totalWaves).toBe(2);
    expect(new WaveManager(buildWaveTable(bossForStage(1, 0)), 0).totalWaves).toBe(20);
  });
});
