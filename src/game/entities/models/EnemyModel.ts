import Phaser from 'phaser';
import { UnitModel } from './UnitModel';

/**
 * The enemy model. Renders through a `Phaser.Sprite` (blob body + shadow) so a
 * real Aseprite sheet can drive every state later: when animations
 * `${spriteKey}-${state}` are registered they play; until then each `play*`
 * method falls back to the tween placeholder. Per-enemy identity is the tint
 * (from EnemyDefinition.color) while no art exists.
 *
 * See docs/CHARACTER_VISUAL_PROMPT_GUIDE.md — anomalies are drawn TOP-FRONT.
 */
export class EnemyModel extends UnitModel {
  private bodySprite: Phaser.GameObjects.Sprite;
  private shadow: Phaser.GameObjects.Ellipse;
  /** Ring behind the body used for passive telegraphs (fake HP / immunity). */
  private outline: Phaser.GameObjects.Arc;
  /** Size-tier factor relative to the original 38px blob — scales offsets. */
  private readonly f: number;
  /** Sprite scale that renders the body at its size-tier height. */
  private baseScaleX = 1;
  private baseScaleY = 1;

  constructor(scene: Phaser.Scene, x: number, y: number, tint: number, spriteKey?: string, sizePx = 38) {
    super(scene, x, y);
    const f = sizePx / 38;
    this.f = f;
    this.shadow = scene.add.ellipse(0, 16 * f, 28 * f, 9 * f, 0x000000, 0.35);
    this.add(this.shadow);
    this.outline = scene.add.circle(0, 0, 18 * f, 0x000000, 0);
    this.outline.setVisible(false);
    this.add(this.outline);
    const key = spriteKey && scene.textures.exists(spriteKey) ? spriteKey : 'enemy-base';
    this.bodySprite = scene.add.sprite(0, 0, key);
    this.bodySprite.setDisplaySize(sizePx, sizePx);
    this.baseScaleX = this.bodySprite.scaleX;
    this.baseScaleY = this.bodySprite.scaleY;
    // Tint is the placeholder's per-enemy identity; a real sheet ships its own colors.
    if (key === 'enemy-base') this.bodySprite.setTint(tint);

    // Wire the sprite-sheet animation path — a no-op (tweens run) until an atlas
    // keyed `key` is loaded with `${key}-<state>` tags.
    this.animatedBody = this.bodySprite;
    this.spriteBaseKey = key;

    this.add(this.bodySprite);
    this.setState('idle');
  }

  override get muzzleOffset(): { x: number; y: number } {
    // Enemies face left (toward the rally).
    return { x: -14 * this.f, y: 0 };
  }

  /** Passive telegraphs (fake HP shield, hit immunity) render as a ring. */
  setOutline(width: number, color: number): void {
    this.outline.setStrokeStyle(width, color, 0.95);
    this.outline.setVisible(true);
  }

  clearOutline(): void {
    this.outline.setStrokeStyle(0);
    this.outline.setVisible(false);
  }

  protected bodyTarget(): Phaser.GameObjects.GameObject {
    return this.bodySprite;
  }

  protected resetPose(): void {
    this.bodySprite.setPosition(0, 0);
    this.bodySprite.setScale(this.baseScaleX, this.baseScaleY);
    this.bodySprite.setAlpha(1);
    this.shadow.setScale(1);
  }

  protected playIdle(): Phaser.Tweens.Tween[] {
    if (this.playLoopAnim('idle')) return [];
    // Menacing pulse in place.
    return [
      this.scene.tweens.add({
        targets: this.bodySprite,
        scaleX: this.baseScaleX * 1.06,
        scaleY: this.baseScaleY * 1.06,
        yoyo: true,
        repeat: -1,
        duration: 600,
        ease: 'Sine.easeInOut',
      }),
    ];
  }

  protected playWalk(running: boolean): Phaser.Tweens.Tween[] {
    if (this.playLoopAnim(running ? 'run' : 'walk', running ? 1.5 : 1)) return [];
    // Plodding bob; runners skitter faster with a squash-and-stretch feel.
    const duration = running ? 110 : 260;
    return [
      this.scene.tweens.add({
        targets: this.bodySprite,
        y: -5 * this.f,
        scaleX: this.baseScaleX * 1.08,
        scaleY: this.baseScaleY * 0.92,
        yoyo: true,
        repeat: -1,
        duration,
        ease: 'Sine.easeInOut',
      }),
      this.scene.tweens.add({
        targets: this.shadow,
        scaleX: 0.8,
        yoyo: true,
        repeat: -1,
        duration,
        ease: 'Sine.easeInOut',
      }),
    ];
  }

  protected playStunned(): Phaser.Tweens.Tween[] {
    if (this.playLoopAnim('stunned')) return [];
    // Dazed spin-in-place — the "spinning stars" beat (seen from top-front).
    return [
      this.scene.tweens.add({
        targets: this.bodySprite,
        angle: { from: -12, to: 12 },
        yoyo: true,
        repeat: -1,
        duration: 200,
        ease: 'Sine.easeInOut',
      }),
    ];
  }

  protected playCelebrate(): Phaser.Tweens.Tween[] {
    if (this.playLoopAnim('celebrate')) return [];
    // Anomaly wins — lurching forward, tearing at the barrier (front view).
    return [
      this.scene.tweens.add({
        targets: this.bodySprite,
        x: -8 * this.f,
        scaleX: this.baseScaleX * 1.12,
        yoyo: true,
        repeat: -1,
        duration: 220,
        ease: 'Quad.easeInOut',
      }),
    ];
  }

  protected playDefeat(): Phaser.Tweens.Tween[] {
    if (this.playLoopAnim('defeat')) return [];
    // API parity — anomalies normally die outright; if forced into "defeat"
    // (e.g. rally victory), they cower and shrink back.
    return [
      this.scene.tweens.add({
        targets: this.bodySprite,
        scaleX: this.baseScaleX * 0.85,
        scaleY: this.baseScaleY * 0.85,
        y: 4 * this.f,
        duration: 400,
        ease: 'Quad.easeIn',
      }),
    ];
  }

  protected playAttack(onComplete: () => void): void {
    if (this.playOneShotAnim('attack', onComplete)) return;
    // Lunge toward the shield (left).
    this.scene.tweens.add({
      targets: this.bodySprite,
      x: -10 * this.f,
      yoyo: true,
      duration: 100,
      onComplete,
    });
  }

  protected playCast(onComplete: () => void): void {
    if (this.playOneShotAnim('cast', onComplete)) return;
    // Boss skill telegraph — dark expanding ring.
    const ring = this.scene.add.circle(0, 0, 18 * this.f, 0x000000, 0.25);
    ring.setStrokeStyle(2, 0xffffff, 0.8);
    this.add(ring);
    this.scene.tweens.add({
      targets: ring,
      scale: 2.5,
      alpha: 0,
      duration: 400,
      onComplete: () => ring.destroy(),
    });
    this.scene.tweens.add({
      targets: this.bodySprite,
      scaleX: this.baseScaleX * 1.3,
      scaleY: this.baseScaleY * 1.3,
      yoyo: true,
      duration: 200,
      onComplete,
    });
  }

  protected playDeath(onComplete?: () => void): void {
    // Shadow fades out with the body in either path.
    this.scene.tweens.add({ targets: this.shadow, alpha: 0, duration: 250 });
    if (this.playOneShotAnim('death', () => onComplete?.())) return;
    // Collapse and dissolve (placeholder).
    this.scene.tweens.add({
      targets: this.bodySprite,
      scaleY: this.baseScaleY * 0.2,
      scaleX: this.baseScaleX * 1.4,
      y: 10 * this.f,
      alpha: 0,
      duration: 300,
      ease: 'Quad.easeIn',
      onComplete: () => onComplete?.(),
    });
  }
}
