import Phaser from 'phaser';
import { FX } from '../../data/level';

export type UnitModelState =
  // Persistent locomotion / crowd-control loops — hold until told otherwise.
  | 'idle' | 'walk' | 'run' | 'stunned'
  // One-shot overlays on top of locomotion — revert when done.
  | 'attack' | 'cast'
  // Terminal battle-outcome loops — lock the model, play until the scene ends.
  | 'celebrate' | 'defeat'
  // Terminal — plays once, then the owner destroys itself.
  | 'death';

/** States a unit stays in until told otherwise (loop forever). */
const PERSISTENT_STATES: ReadonlySet<UnitModelState> = new Set(['idle', 'walk', 'run', 'stunned']);

/**
 * Maps a model state to its sprite-sheet animation tag where they differ.
 * `walk` and `run` share the one `march` cycle (run just plays it faster). Every
 * other state's tag equals its own name (see docs/CHARACTER_VISUAL_PROMPT_GUIDE.md).
 */
const STATE_ANIM_TAG: Partial<Record<UnitModelState, string>> = {
  walk: 'march',
  run: 'march',
};

/**
 * Terminal battle-outcome loops. Once set (on win/lose) they lock the model:
 * further setState calls are ignored so a marching/attacking tween can't stomp
 * the celebration or the morale-broken slump.
 */
const OUTCOME_STATES: ReadonlySet<UnitModelState> = new Set(['celebrate', 'defeat']);

export interface UnitModelStateOptions {
  /** Fired when a one-shot state (attack / cast / death) finishes playing. */
  onComplete?: () => void;
  /**
   * For 'attack': fired at the animation's *release* frame (the throw/strike
   * moment), not frame 0. Lets the owner spawn its projectile in sync with the
   * swing instead of the instant the attack starts.
   */
  onRelease?: () => void;
  /**
   * For 'attack': the attack cadence in ms (attackRateMs). The model fits the
   * swing within this so a fast attacker's animation speeds up and a slow one
   * doesn't drag — keeping the release frame in sync with the actual rate.
   */
  attackIntervalMs?: number;
}

/**
 * The single placeholder base model every unit renders through.
 *
 * Owns the unit's visual and exposes an explicit animation-state API so that
 * real sprite-sheet animations can later replace each state inside a subclass
 * without touching Hero.ts / Enemy.ts logic:
 *
 * - `setState('idle' | 'walk' | 'run' | 'stunned')` — persistent locomotion /
 *   crowd-control; loops until changed.
 * - `setState('attack' | 'cast')` — one-shot overlay; reverts to the current
 *   locomotion state when done.
 * - `setState('celebrate' | 'defeat')` — terminal battle-outcome loop; locks
 *   the model so nothing else animates it until the scene tears down.
 * - `setState('death')` — terminal; plays once, then fires onComplete (the
 *   owner destroys itself there).
 * - `playProjectileLaunch()` — muzzle-flash hook fired the moment a projectile
 *   leaves the model; projectiles should spawn at `muzzleOffset`.
 *
 * See docs/CHARACTER_VISUAL_PROMPT_GUIDE.md for how each state maps to a
 * sprite-sheet row (idle / march / attack / cast / celebrate / defeat /
 * stunned / death) and the top-behind (hero) vs top-front (enemy) camera view.
 */
export abstract class UnitModel extends Phaser.GameObjects.Container {
  private currentState: UnitModelState = 'idle';
  private locomotionState: UnitModelState = 'idle';
  private locomotionTweens: Phaser.Tweens.Tween[] = [];
  private dead = false;
  /** Set once a terminal outcome (celebrate/defeat) locks the model. */
  private outcomeLocked = false;

  /**
   * Set by a subclass whose body is a real Aseprite `Sprite`. When an animation
   * `${spriteBaseKey}-${tag}` exists for a state, that frame animation plays and
   * the tween placeholder is skipped; otherwise the placeholder tween runs. This
   * is how a generated sprite sheet takes over each state with zero changes to
   * Hero.ts / Enemy.ts / GameScene.ts.
   */
  protected animatedBody?: Phaser.GameObjects.Sprite;
  protected spriteBaseKey?: string;

  constructor(scene: Phaser.Scene, x = 0, y = 0) {
    super(scene, x, y);
  }

  /** True when a real frame animation is registered for this state. */
  protected hasStateAnim(state: UnitModelState): boolean {
    if (!this.animatedBody || !this.spriteBaseKey) return false;
    return this.scene.anims.exists(`${this.spriteBaseKey}-${STATE_ANIM_TAG[state] ?? state}`);
  }

  /**
   * Play a looping frame animation for a persistent state. Returns true if a
   * real animation existed and started (the caller then skips its tween).
   */
  protected playLoopAnim(state: UnitModelState, timeScale = 1): boolean {
    if (!this.hasStateAnim(state)) return false;
    const key = `${this.spriteBaseKey}-${STATE_ANIM_TAG[state] ?? state}`;
    this.animatedBody!.play({ key, repeat: -1 });
    this.animatedBody!.anims.timeScale = timeScale;
    return true;
  }

  /**
   * Play a one-shot frame animation, firing onComplete when it finishes.
   * Returns true if a real animation existed (the caller then skips its tween).
   */
  protected playOneShotAnim(state: UnitModelState, onComplete: () => void, durationMs?: number): boolean {
    if (!this.hasStateAnim(state)) return false;
    const key = `${this.spriteBaseKey}-${STATE_ANIM_TAG[state] ?? state}`;
    const sprite = this.animatedBody!;
    sprite.anims.timeScale = 1;
    sprite.once(`${Phaser.Animations.Events.ANIMATION_COMPLETE_KEY}${key}`, onComplete);
    
    // Respect the animation's configured repeat value (e.g. -1 for looping bosses)
    // otherwise default to 0 so it fires onComplete even if accidentally exported looping.
    const anim = this.scene?.anims?.get(key);
    const repeat = anim && anim.repeat === -1 ? -1 : 0;
    
    // An explicit duration overrides the sheet's frameRate so the clip fits the
    // requested time window (e.g. the attack cadence).
    sprite.play({ key, repeat, ignoreIfPlaying: true, ...(durationMs !== undefined ? { duration: durationMs } : {}) });
    return true;
  }

  get modelState(): UnitModelState {
    return this.currentState;
  }

  /** Pause the current animation/tweens visually */
  pause(): void {
    if (this.animatedBody) {
      if (this.animatedBody.anims) {
        this.animatedBody.anims.pause();
      }
      if (this.scene && this.scene.tweens) {
        this.scene.tweens.getTweensOf(this.animatedBody).forEach(t => t.pause());
      }
    }
  }

  /**
   * Adjusts the playback speed of both sprite animations and fallback tweens.
   * Useful for applying slow/chill debuffs.
   */
  public setTimeScale(scale: number): void {
    if (this.animatedBody && this.animatedBody.anims) {
      this.animatedBody.anims.timeScale = scale;
    }
    for (const tween of this.locomotionTweens) {
      tween.timeScale = scale;
    }
  }

  /** Resume the current animation/tweens visually */
  resume(): void {
    if (this.animatedBody) {
      if (this.animatedBody.anims) {
        this.animatedBody.anims.resume();
      }
      if (this.scene && this.scene.tweens) {
        this.scene.tweens.getTweensOf(this.animatedBody).forEach(t => t.resume());
      }
    }
  }

  setFlipX(flip: boolean): this {
    if (this.animatedBody) this.animatedBody.setFlipX(flip);
    return this;
  }
  
  getFlipX(): boolean {
    return this.animatedBody ? this.animatedBody.flipX : false;
  }

  /** Local-space point projectiles visually launch from. */
  get muzzleOffset(): { x: number; y: number } {
    return { x: 12, y: -4 };
  }

  // Narrows Phaser's GameObject.setState(string | number) into the model-state API.
  override setState(state: UnitModelState, options?: UnitModelStateOptions): this {
    if (this.dead || this.outcomeLocked || !this.scene) return this;
    if (state === 'death') {
      this.dead = true;
      this.stopLocomotion();
      this.currentState = 'death';
      this.playDeath(options?.onComplete);
      return this;
    }

    if (OUTCOME_STATES.has(state)) {
      // Terminal battle-outcome loop — lock the model and hold it.
      this.outcomeLocked = true;
      this.stopLocomotion();
      this.currentState = state;
      this.locomotionTweens = state === 'celebrate' ? this.playCelebrate() : this.playDefeat();
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
    if (state === 'attack') this.playAttack(revert, options?.onRelease, options?.attackIntervalMs);
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
    else if (state === 'stunned') this.locomotionTweens = this.playStunned();
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
  /** Crowd-controlled loop (dazed / spinning stars). */
  protected abstract playStunned(): Phaser.Tweens.Tween[];
  /** Terminal battle-outcome loops — held until the scene tears down. */
  protected abstract playCelebrate(): Phaser.Tweens.Tween[];
  protected abstract playDefeat(): Phaser.Tweens.Tween[];
  /**
   * One-shot attack — MUST call onComplete exactly once. If `onRelease` is
   * given, fire it once at the swing's release point (not frame 0).
   * `attackIntervalMs` (the attack cadence) lets the swing scale to the rate.
   */
  protected abstract playAttack(onComplete: () => void, onRelease?: () => void, attackIntervalMs?: number): void;
  protected abstract playCast(onComplete: () => void): void;
  protected abstract playDeath(onComplete?: () => void): void;
}
