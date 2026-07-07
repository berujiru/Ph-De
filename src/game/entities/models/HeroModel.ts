import Phaser from 'phaser';
import { UnitModel } from './UnitModel';

/**
 * The hero model. Renders through a `Phaser.Sprite` so a real Aseprite sheet can
 * drive every state: when animations `${spriteKey}-${state}` are registered the
 * frame animation plays; until then each `play*` method falls back to the tween
 * placeholder below. A hero with no art (or a missing texture) renders the
 * shared tinted `hero-base` cut-out — never a broken green box.
 *
 * See docs/CHARACTER_VISUAL_PROMPT_GUIDE.md (top-behind view + state set) and
 * docs/ADDING_HEROES.md for the asset/integration pipeline.
 */
export class HeroModel extends UnitModel {
  /** Fraction into the attack animation at which the projectile is released. */
  private static readonly ATTACK_RELEASE_FRAC = 0.45;
  /** Longest a single attack swing plays; faster attackers shrink to fit. */
  private static readonly NATURAL_ATTACK_MS = 800;

  private bodySprite: Phaser.GameObjects.Sprite;
  private readonly baseW: number;
  private readonly baseH: number;
  /** True when the body is a real sprite sheet (drives the resting-frame reset). */
  private readonly artBacked: boolean;

  constructor(scene: Phaser.Scene, x: number, y: number, tint: number, spriteKey?: string, sizePx = 64) {
    super(scene, x, y);
    // Only treat spriteKey as real art if its texture actually loaded; otherwise
    // fall back to the shared placeholder so a missing sheet can't green-box.
    const hasArt = !!spriteKey && scene.textures.exists(spriteKey);
    this.artBacked = hasArt;
    const key = hasArt ? spriteKey! : 'hero-base';
    // For a sprite sheet, start on frame 0 — NOT the default `__BASE` frame,
    // which is the whole sheet (e.g. 2048x512). Reading width/height off __BASE
    // gives a bogus aspect and shrinks the rendered hero to ~half size.
    this.bodySprite = scene.add.sprite(0, 0, key, hasArt ? 0 : undefined);
    if (hasArt) {
      // Scale the real sheet to the size-class height (UNIT_RENDER_SIZES),
      // preserving the frame's aspect ratio so non-square frames (e.g.
      // 256x170) aren't squished into a box.
      const targetH = sizePx;
      const frameW = this.bodySprite.width || targetH;
      const frameH = this.bodySprite.height || targetH;
      this.baseH = targetH;
      this.baseW = targetH * (frameW / frameH);
    } else {
      // Placeholder keeps its original 40:54 proportions, scaled to the tier.
      this.baseH = Math.round(sizePx * 0.85);
      this.baseW = Math.round(this.baseH * (40 / 54));
      this.bodySprite.setTint(tint);
    }
    this.bodySprite.setDisplaySize(this.baseW, this.baseH);

    // Wire the sprite-sheet animation path. hasStateAnim() gates every play*
    // call, so this is a no-op (tweens run) until an atlas keyed `key` is loaded.
    this.animatedBody = this.bodySprite;
    this.spriteBaseKey = key;

    this.add(this.bodySprite);
    this.setState('idle');
  }

  override get muzzleOffset(): { x: number; y: number } {
    // In front of the hero: heroes face UP toward the enemies, so "front" is the
    // top edge of the sprite (centered horizontally), not off to the side.
    return { x: 0, y: -this.baseH * 0.5 };
  }

  protected bodyTarget(): Phaser.GameObjects.GameObject {
    return this.bodySprite;
  }

  protected resetPose(): void {
    this.bodySprite.setPosition(0, 0);
    this.bodySprite.setAngle(0);
    // Art-backed heroes: halt any running frame animation and snap back to the
    // resting frame. Otherwise a state with no sheet (idle) keeps playing the
    // previous march loop, or freezes on the last attack/cast frame. States
    // that DO have a sheet immediately restart their own anim after this.
    if (this.artBacked) {
      this.bodySprite.anims.stop();
      this.applyRestingFrame();
    }
    this.bodySprite.setDisplaySize(this.baseW, this.baseH);
    this.bodySprite.setAlpha(1);
  }

  /**
   * Snap the body to its resting frame. Prefers a real `idle` animation's first
   * frame; if the hero ships no idle sheet, uses the first frame of the `attack`
   * swing (a neutral ready pose) rather than a walk frame; else the base
   * texture's frame 0.
   */
  private applyRestingFrame(): void {
    const useFirstFrame = (animKey: string): boolean => {
      if (!this.scene.anims.exists(animKey)) return false;
      const frame = this.scene.anims.get(animKey).frames[0]?.frame;
      if (!frame) return false;
      this.bodySprite.setTexture(frame.texture.key, frame.name);
      return true;
    };
    if (useFirstFrame(`${this.spriteBaseKey}-idle`)) return;
    if (useFirstFrame(`${this.spriteBaseKey}-attack`)) return;
    this.bodySprite.setTexture(this.spriteBaseKey!, 0);
  }

  protected playIdle(): Phaser.Tweens.Tween[] {
    if (this.playLoopAnim('idle')) return [];
    // Gentle breathing.
    return [
      this.scene.tweens.add({
        targets: this.bodySprite,
        scaleY: this.bodySprite.scaleY * 1.04,
        yoyo: true,
        repeat: -1,
        duration: 700,
        ease: 'Sine.easeInOut',
      }),
    ];
  }

  protected playWalk(running: boolean): Phaser.Tweens.Tween[] {
    if (this.playLoopAnim(running ? 'run' : 'walk', running ? 1.5 : 1)) return [];
    // March bob; running leans into the advance and bobs faster.
    const duration = running ? 130 : 220;
    const tweens = [
      this.scene.tweens.add({
        targets: this.bodySprite,
        y: -4,
        yoyo: true,
        repeat: -1,
        duration,
        ease: 'Sine.easeInOut',
      }),
    ];
    if (running) {
      tweens.push(
        this.scene.tweens.add({ targets: this.bodySprite, angle: 8, duration: 100 }),
      );
    }
    return tweens;
  }

  protected playStunned(): Phaser.Tweens.Tween[] {
    if (this.playLoopAnim('stunned')) return [];
    // Dazed wobble — knocked off the march (seen from top-behind).
    return [
      this.scene.tweens.add({
        targets: this.bodySprite,
        angle: { from: -10, to: 10 },
        yoyo: true,
        repeat: -1,
        duration: 180,
        ease: 'Sine.easeInOut',
      }),
    ];
  }

  protected playCelebrate(): Phaser.Tweens.Tween[] {
    if (this.playLoopAnim('celebrate')) return [];
    // Victory — bouncing cheer, raised-fist energy (rear view).
    return [
      this.scene.tweens.add({
        targets: this.bodySprite,
        y: -8,
        scaleX: this.bodySprite.scaleX * 1.06,
        scaleY: this.bodySprite.scaleY * 1.06,
        yoyo: true,
        repeat: -1,
        duration: 260,
        ease: 'Quad.easeOut',
      }),
    ];
  }

  protected playDefeat(): Phaser.Tweens.Tween[] {
    if (this.playLoopAnim('defeat')) return [];
    // Morale broken — heroes don't die, they take a knee and slump (rear view).
    return [
      this.scene.tweens.add({
        targets: this.bodySprite,
        y: 8,
        angle: -12,
        scaleY: this.bodySprite.scaleY * 0.85,
        duration: 500,
        ease: 'Quad.easeIn',
      }),
    ];
  }

  protected playAttack(onComplete: () => void, onRelease?: () => void, attackIntervalMs?: number): void {
    if (this.hasStateAnim('attack')) {
      // Fit the swing to the attack cadence: a fast attacker's clip speeds up so
      // it finishes within the interval; a slow one caps at the natural length
      // (then idles). Keeps the release frame in sync at any attack speed.
      const duration = Math.max(120, Math.min(attackIntervalMs ?? HeroModel.NATURAL_ATTACK_MS, HeroModel.NATURAL_ATTACK_MS));
      // Release the projectile at the throw frame, not the start of the swing.
      if (onRelease) this.scheduleAttackRelease(`${this.spriteBaseKey}-attack`, onRelease);
      this.playOneShotAnim('attack', onComplete, duration);
      return;
    }
    // Placeholder throw lunge toward the enemy side (right); release at the apex.
    if (onRelease) this.scene.time.delayedCall(60, () => { if (this.scene) onRelease(); });
    this.scene.tweens.add({
      targets: this.bodySprite,
      x: 10,
      angle: 12,
      yoyo: true,
      duration: 90,
      onComplete,
    });
  }

  /**
   * Fire `onRelease` once when the attack animation reaches its release frame
   * (~mid-swing). Falls back to firing on animation-complete if the swing is
   * interrupted before that frame, so a projectile is never silently dropped.
   */
  private scheduleAttackRelease(key: string, onRelease: () => void): void {
    const anim = this.scene.anims.get(key);
    const frameCount = anim?.frames.length ?? 1;
    const releaseFrame = Math.max(1, Math.round(frameCount * HeroModel.ATTACK_RELEASE_FRAC));
    let released = false;
    const fire = () => {
      if (released) return;
      released = true;
      this.bodySprite.off(Phaser.Animations.Events.ANIMATION_UPDATE, onUpdate);
      onRelease();
    };
    const onUpdate = (a: Phaser.Animations.Animation, frame: Phaser.Animations.AnimationFrame) => {
      if (a.key === key && frame.index >= releaseFrame) fire();
    };
    this.bodySprite.on(Phaser.Animations.Events.ANIMATION_UPDATE, onUpdate);
    this.bodySprite.once(`${Phaser.Animations.Events.ANIMATION_COMPLETE_KEY}${key}`, fire);
  }

  protected playCast(onComplete: () => void): void {
    if (this.playOneShotAnim('cast', onComplete)) return;
    // Skill flash — glow ring + white pop, the placeholder for a cut-in.
    const ring = this.scene.add.circle(0, 0, 20, 0xfacc15, 0.35);
    ring.setStrokeStyle(2, 0xfacc15, 0.9);
    this.add(ring);
    this.scene.tweens.add({
      targets: ring,
      scale: 2.4,
      alpha: 0,
      duration: 350,
      onComplete: () => ring.destroy(),
    });
    this.scene.tweens.add({
      targets: this.bodySprite,
      scaleX: this.bodySprite.scaleX * 1.25,
      scaleY: this.bodySprite.scaleY * 1.25,
      yoyo: true,
      duration: 175,
      onComplete,
    });
  }

  protected playDeath(onComplete?: () => void): void {
    if (this.playOneShotAnim('death', () => onComplete?.())) return;
    // Heroes don't die in the design — "morale broken" collapse, kept for API parity.
    this.scene.tweens.add({
      targets: this.bodySprite,
      angle: -80,
      y: 12,
      alpha: 0,
      duration: 400,
      onComplete: () => onComplete?.(),
    });
  }
}
