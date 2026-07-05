import Phaser from 'phaser';
import { FX } from '../../data/level';

export type UnitModelState = 'idle' | 'walk' | 'run' | 'attack' | 'cast' | 'death';

/** States a unit stays in until told otherwise. */
const PERSISTENT_STATES: ReadonlySet<UnitModelState> = new Set(['idle', 'walk', 'run']);

export interface UnitModelStateOptions {
  /** Fired when a one-shot state (attack / cast / death) finishes playing. */
  onComplete?: () => void;
}

/**
 * The single placeholder base model every unit renders through.
 *
 * Owns the unit's visual and exposes an explicit animation-state API so that
 * real sprite-sheet animations can later replace each state inside a subclass
 * without touching Hero.ts / Enemy.ts logic:
 *
 * - `setState('idle' | 'walk' | 'run')` — persistent locomotion; loops until changed.
 * - `setState('attack' | 'cast')` — one-shot overlay; reverts to the current
 *   locomotion state when done.
 * - `setState('death')` — terminal; plays once, then fires onComplete (the
 *   owner destroys itself there).
 * - `playProjectileLaunch()` — muzzle-flash hook fired the moment a projectile
 *   leaves the model; projectiles should spawn at `muzzleOffset`.
 */
export abstract class UnitModel extends Phaser.GameObjects.Container {
  private currentState: UnitModelState = 'idle';
  private locomotionState: UnitModelState = 'idle';
  private locomotionTweens: Phaser.Tweens.Tween[] = [];
  private dead = false;

  constructor(scene: Phaser.Scene, x = 0, y = 0) {
    super(scene, x, y);
  }

  get modelState(): UnitModelState {
    return this.currentState;
  }

  /** Local-space point projectiles visually launch from. */
  get muzzleOffset(): { x: number; y: number } {
    return { x: 12, y: -4 };
  }

  // Narrows Phaser's GameObject.setState(string | number) into the model-state API.
  override setState(state: UnitModelState, options?: UnitModelStateOptions): this {
    if (this.dead || !this.scene) return this;
    if (state === 'death') {
      this.dead = true;
      this.stopLocomotion();
      this.currentState = 'death';
      this.playDeath(options?.onComplete);
      return this;
    }

    if (PERSISTENT_STATES.has(state)) {
      if (state === this.locomotionState && state === this.currentState) return this;
      this.locomotionState = state;
      // Don't interrupt a one-shot mid-swing; it reverts to locomotion itself.
      if (PERSISTENT_STATES.has(this.currentState)) {
        this.startLocomotion(state);
      }
      return this;
    }

    // One-shot overlay (attack / cast) on top of locomotion.
    this.currentState = state;
    const revert = () => {
      if (this.dead || !this.scene) return;
      options?.onComplete?.();
      this.startLocomotion(this.locomotionState);
    };
    if (state === 'attack') this.playAttack(revert);
    else this.playCast(revert);
    return this;
  }

  /** Muzzle-flash hook — projectiles visually leave the model here. */
  playProjectileLaunch(): void {
    if (this.dead || !this.scene) return;
    const muzzle = this.muzzleOffset;
    const dir = Math.sign(muzzle.x) || 1; // facing: +1 heroes (right), -1 enemies (left)

    // Bright core pop.
    const flash = this.scene.add.circle(muzzle.x, muzzle.y, 6, 0xffffff, 0.95);
    this.add(flash);
    this.scene.tweens.add({
      targets: flash,
      scale: 2.2,
      alpha: 0,
      duration: FX.muzzleFlash.durationMs,
      onComplete: () => flash.destroy(),
    });

    // A few forward streaks fanning out along the firing direction.
    for (let i = 0; i < FX.muzzleFlash.streaks; i++) {
      const spread = (i - (FX.muzzleFlash.streaks - 1) / 2) * 0.35;
      const streak = this.scene.add.rectangle(muzzle.x, muzzle.y, 12, 2, 0xfff2b0)
        .setRotation(spread);
      this.add(streak);
      this.scene.tweens.add({
        targets: streak,
        x: muzzle.x + dir * 16,
        scaleX: 0.2,
        alpha: 0,
        duration: FX.muzzleFlash.durationMs,
        ease: 'Quad.easeOut',
        onComplete: () => streak.destroy(),
      });
    }
  }

  /** Brief white blink used for absorbed / blocked hits. */
  playHitFlash(): void {
    if (this.dead || !this.scene) return;
    this.scene.tweens.add({ targets: this.bodyTarget(), alpha: 0.4, yoyo: true, duration: 90 });
  }

  private startLocomotion(state: UnitModelState): void {
    this.stopLocomotion();
    this.currentState = state;
    if (state === 'walk') this.locomotionTweens = this.playWalk(false);
    else if (state === 'run') this.locomotionTweens = this.playWalk(true);
    else this.locomotionTweens = this.playIdle();
  }

  private stopLocomotion(): void {
    for (const tween of this.locomotionTweens) tween.remove();
    this.locomotionTweens = [];
    this.resetPose();
  }

  destroy(fromScene?: boolean): void {
    this.stopLocomotion();
    super.destroy(fromScene);
  }

  /** The main display object hit-flashes and simple tweens should target. */
  protected abstract bodyTarget(): Phaser.GameObjects.GameObject;
  /** Reset any transforms a locomotion loop left behind. */
  protected abstract resetPose(): void;
  /** Looping placeholder animations — return the tweens so they can be stopped. */
  protected abstract playIdle(): Phaser.Tweens.Tween[];
  protected abstract playWalk(running: boolean): Phaser.Tweens.Tween[];
  /** One-shot placeholder animations — MUST call onComplete exactly once. */
  protected abstract playAttack(onComplete: () => void): void;
  protected abstract playCast(onComplete: () => void): void;
  protected abstract playDeath(onComplete?: () => void): void;
}
