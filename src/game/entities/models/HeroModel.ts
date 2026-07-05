import Phaser from 'phaser';
import { UnitModel } from './UnitModel';

/**
 * The one placeholder hero model. Every hero renders through this class —
 * per-hero identity is just the tint (from HeroDefinition.color). Each state
 * is a simple tween on the shared hero-placeholder image; swapping in a real
 * sprite sheet later means reimplementing the play* methods here only.
 */
export class HeroModel extends UnitModel {
  private bodySprite: Phaser.GameObjects.Image;

  constructor(scene: Phaser.Scene, x: number, y: number, tint: number, spriteKey?: string) {
    super(scene, x, y);
    this.bodySprite = scene.add.image(0, 0, spriteKey || 'hero-base');
    if (!spriteKey) {
      this.bodySprite.setDisplaySize(40, 54);
      this.bodySprite.setTint(tint);
    } else {
      this.bodySprite.setDisplaySize(60, 60);
    }
    this.add(this.bodySprite);
    this.setState('idle');
  }

  override get muzzleOffset(): { x: number; y: number } {
    return { x: 16, y: -8 };
  }

  protected bodyTarget(): Phaser.GameObjects.GameObject {
    return this.bodySprite;
  }

  protected resetPose(): void {
    this.bodySprite.setPosition(0, 0);
    this.bodySprite.setAngle(0);
    if (this.bodySprite.texture.key === 'hero-base') {
      this.bodySprite.setDisplaySize(40, 54);
    } else {
      this.bodySprite.setDisplaySize(60, 60);
    }
    this.bodySprite.setAlpha(1);
  }

  protected playIdle(): Phaser.Tweens.Tween[] {
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

  protected playAttack(onComplete: () => void): void {
    // Throw lunge toward the enemy side (right).
    this.scene.tweens.add({
      targets: this.bodySprite,
      x: 10,
      angle: 12,
      yoyo: true,
      duration: 90,
      onComplete,
    });
  }

  protected playCast(onComplete: () => void): void {
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
