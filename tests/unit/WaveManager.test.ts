import { describe, expect, it } from 'vitest';
import { WaveManager, type WaveDefinition } from '../../src/game/core/WaveManager';

const waves: WaveDefinition[] = [
  { groups: [{ enemyId: 'grunt', count: 3, spawnIntervalMs: 100 }] },
  {
    groups: [
      { enemyId: 'grunt', count: 2, spawnIntervalMs: 100 },
      { enemyId: 'runner', count: 2, spawnIntervalMs: 50 },
    ],
  },
];

describe('WaveManager', () => {
  it('does nothing until a wave is started', () => {
    const manager = new WaveManager(waves);
    expect(manager.update(1000)).toEqual([]);
    expect(manager.isWaveActive).toBe(false);
  });

  it('spawns the first enemy of a group immediately, then on interval', () => {
    const manager = new WaveManager(waves);
    manager.startNextWave();

    expect(manager.update(0)).toEqual([{ enemyId: 'grunt' }]);
    expect(manager.update(50)).toEqual([]);
    expect(manager.update(50)).toEqual([{ enemyId: 'grunt' }]);
    expect(manager.update(100)).toEqual([{ enemyId: 'grunt' }]);
  });

  it('deactivates once all groups in the wave have spawned', () => {
    const manager = new WaveManager(waves);
    manager.startNextWave();
    for (let i = 0; i < 3; i += 1) manager.update(100);
    expect(manager.isWaveActive).toBe(false);
  });

  it('will not start a new wave while one is active', () => {
    const manager = new WaveManager(waves);
    manager.startNextWave();
    expect(manager.startNextWave()).toBe(false);
  });

  it('will not start a wave beyond the last one', () => {
    const manager = new WaveManager(waves);
    manager.startNextWave();
    for (let i = 0; i < 3; i += 1) manager.update(100);

    manager.startNextWave();
    for (let i = 0; i < 10; i += 1) manager.update(100);

    expect(manager.hasMoreWaves()).toBe(false);
    expect(manager.startNextWave()).toBe(false);
    expect(manager.currentWaveNumber).toBe(2);
    expect(manager.totalWaves).toBe(2);
  });

  it('spawns groups sequentially within a wave', () => {
    const manager = new WaveManager(waves);
    manager.startNextWave();
    for (let i = 0; i < 3; i += 1) manager.update(100); // drain wave 1 (grunt-only)

    manager.startNextWave(); // wave 2: grunt x2 then runner x2
    const spawned: string[] = [];
    for (let i = 0; i < 10; i += 1) {
      spawned.push(...manager.update(100).map((event) => event.enemyId));
    }

    expect(spawned.filter((id) => id === 'grunt')).toHaveLength(2);
    expect(spawned.filter((id) => id === 'runner')).toHaveLength(2);
    expect(spawned.lastIndexOf('grunt')).toBeLessThan(spawned.indexOf('runner'));
  });
});
