import type { EnemyId } from '../data/balance';
import type { WaveDefinition } from '../data/waves';

/**
 * Pure, Phaser-free wave queue (spec: docs/WAVE_ENGINE_SPEC.md). Consumes the
 * designer-authored wave table (data/waves.ts) and turns elapsed time into a
 * stream of outputs; GameScene renders them (spawns enemies, flashes warnings,
 * ticks the HUD counter). Deterministic and clockless, so it unit-tests
 * without a scene — see docs/TESTING.md.
 *
 * Semantics:
 *  - Events run in order. A `spawn` emits its first spawn immediately, then
 *    one every `intervalMs`. `delay` and `warning` hold the queue for
 *    `durationMs` (the warning output itself fires when the event begins).
 *  - Wave N+1 starts only after wave N's events are exhausted AND the field
 *    is clear (livingEnemyCount === 0), then an inter-wave breather.
 *  - The caller pre-scales dtMs (GameScene multiplies by gameSpeed), so the
 *    2x toggle needs no handling here.
 */

export type WaveManagerOutput =
  | { kind: 'spawn'; enemyId: EnemyId; wave: number }
  | { kind: 'warning'; alertType: 'boss' | 'swarm' | 'mini-boss'; text: string; durationMs: number }
  | { kind: 'waveStarted'; wave: number };

type Phase = 'events' | 'clearWait' | 'interDelay' | 'done';

export class WaveManager {
  private waveIdx = 0;
  private eventIdx = 0;
  private spawnedInEvent = 0;
  /** Time (ms) until the current phase's next action. */
  private waitMs = 0;
  private phase: Phase = 'events';
  private started = false;

  private readonly waves: WaveDefinition[];
  private readonly interWaveDelayMs: number;

  constructor(
    waves: WaveDefinition[],
    interWaveDelayMs: number,
  ) {
    this.waves = waves;
    this.interWaveDelayMs = interWaveDelayMs;
  }

  /** 1-based wave the queue is currently on (clamped to the last wave). */
  get currentWave(): number {
    return Math.min(this.waveIdx + 1, this.waves.length);
  }

  get totalWaves(): number {
    return this.waves.length;
  }

  /** True once every authored spawn of every wave has been emitted. */
  get allSpawnsDone(): boolean {
    return this.phase === 'done';
  }

  /**
   * Advance by `dtMs` (already speed-scaled). Waves now advance immediately
   * upon finishing their spawns, without waiting for livingEnemyCount to hit 0.
   */
  update(dtMs: number, _livingEnemyCount: number): WaveManagerOutput[] {
    const out: WaveManagerOutput[] = [];
    if (this.phase === 'done') return out;

    if (!this.started) {
      this.started = true;
      out.push({ kind: 'waveStarted', wave: 1 });
      this.enterEvent(out);
    }

    let budget = dtMs;

    // Bounded: every iteration either consumes budget, emits an event from the
    // finite table, or breaks.
    for (;;) {
      if (this.phase === 'events') {
        if (this.waitMs > budget) {
          this.waitMs -= budget;
          break;
        }
        budget -= this.waitMs;
        this.waitMs = 0;

        const evt = this.waves[this.waveIdx].events[this.eventIdx];
        if (evt.type === 'spawn') {
          out.push({ kind: 'spawn', enemyId: evt.enemyId, wave: this.waveIdx + 1 });
          this.spawnedInEvent++;
          if (this.spawnedInEvent >= evt.count) {
            this.advanceEvent(out);
          } else {
            this.waitMs = evt.intervalMs;
          }
        } else {
          // delay/warning hold time was just consumed — move on.
          this.advanceEvent(out);
        }
      } else if (this.phase === 'clearWait') {
        // Obsolete phase: fall through to interDelay instantly.
        this.phase = 'interDelay';
        this.waitMs = this.interWaveDelayMs;
      } else if (this.phase === 'interDelay') {
        if (this.waitMs > budget) {
          this.waitMs -= budget;
          break;
        }
        budget -= this.waitMs;
        this.waitMs = 0;
        this.waveIdx++;
        this.eventIdx = 0;
        this.spawnedInEvent = 0;
        this.phase = 'events'; // enterEvent may immediately override (empty wave)
        out.push({ kind: 'waveStarted', wave: this.waveIdx + 1 });
        this.enterEvent(out);
      } else {
        break; // done
      }
    }

    return out;
  }

  /** Begin the event at eventIdx: emit warnings, arm hold timers. */
  private enterEvent(out: WaveManagerOutput[]): void {
    const events = this.waves[this.waveIdx].events;
    if (this.eventIdx >= events.length) {
      this.finishWave();
      return;
    }
    const evt = events[this.eventIdx];
    this.spawnedInEvent = 0;
    if (evt.type === 'spawn') {
      this.waitMs = 0; // first spawn fires immediately
    } else {
      if (evt.type === 'warning') {
        out.push({ kind: 'warning', alertType: evt.alertType, text: evt.text, durationMs: evt.durationMs });
      }
      this.waitMs = evt.durationMs;
    }
  }

  private advanceEvent(out: WaveManagerOutput[]): void {
    this.eventIdx++;
    this.enterEvent(out);
  }

  private finishWave(): void {
    if (this.waveIdx >= this.waves.length - 1) {
      this.phase = 'done';
    } else {
      this.phase = 'clearWait';
    }
  }
}
