export interface WaveEnemyGroup {
  enemyId: string;
  count: number;
  spawnIntervalMs: number;
}

export interface WaveDefinition {
  groups: WaveEnemyGroup[];
}

export interface SpawnEvent {
  enemyId: string;
}

/**
 * Deterministic, frame-rate-independent wave spawner. Pure state machine
 * advanced by `update(dtMs)` so it can be unit tested without Phaser.
 */
export class WaveManager {
  private readonly waves: readonly WaveDefinition[];
  private waveIndex = -1;
  private active = false;
  private groupIndex = 0;
  private spawnedInGroup = 0;
  private elapsedSinceLastSpawnMs = 0;

  constructor(waves: readonly WaveDefinition[]) {
    this.waves = waves;
  }

  get currentWaveNumber(): number {
    return this.waveIndex + 1;
  }

  get totalWaves(): number {
    return this.waves.length;
  }

  get isWaveActive(): boolean {
    return this.active;
  }

  hasMoreWaves(): boolean {
    return this.waveIndex < this.waves.length - 1;
  }

  startNextWave(): boolean {
    if (this.active || !this.hasMoreWaves()) return false;
    this.waveIndex += 1;
    this.groupIndex = 0;
    this.spawnedInGroup = 0;
    this.elapsedSinceLastSpawnMs = 0;
    this.active = true;
    return true;
  }

  update(dtMs: number): SpawnEvent[] {
    if (!this.active) return [];

    const wave = this.waves[this.waveIndex];
    const events: SpawnEvent[] = [];
    this.elapsedSinceLastSpawnMs += dtMs;

    while (this.groupIndex < wave.groups.length) {
      const group = wave.groups[this.groupIndex];

      if (this.spawnedInGroup >= group.count) {
        this.groupIndex += 1;
        this.spawnedInGroup = 0;
        this.elapsedSinceLastSpawnMs = 0;
        continue;
      }

      const isFirstInGroup = this.spawnedInGroup === 0;
      if (isFirstInGroup || this.elapsedSinceLastSpawnMs >= group.spawnIntervalMs) {
        events.push({ enemyId: group.enemyId });
        this.spawnedInGroup += 1;
        this.elapsedSinceLastSpawnMs = 0;

        if (this.spawnedInGroup >= group.count) {
          this.groupIndex += 1;
          this.spawnedInGroup = 0;
          this.elapsedSinceLastSpawnMs = 0;
        }
      }
      break;
    }

    if (this.groupIndex >= wave.groups.length) {
      this.active = false;
    }

    return events;
  }
}
