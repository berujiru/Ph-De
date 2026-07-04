import Phaser from 'phaser';
import { UnitModel } from './UnitModel';

/**
 * The one placeholder enemy model. Every anomaly renders through this class —
 * per-enemy identity is the tint (from EnemyDefinition.color). A shaped
 * placeholder (blob body + shadow) with tween states; real sprite sheets
 * later replace the play* methods here without touching Enemy.ts.
 */
export class EnemyModel extends UnitModel {
  private bodySprite: Phaser.GameObjects.Arc;
  private shadow: Phaser.GameObjects.Ellipse;

  constructor(scene: Phaser.Scene, x: number, y: number, tint: number) {
    super(scene, x, y);
    this.shadow = scene.add.ellipse(0, 14, 24, 8, 0x000000, 0.35);
    this.add(this.shadow);
    this.bodySprite = scene.add.circle(0, 0, 15, tint);
    this.add(this.bodySprite);
    this.setState('idle');
  }

  override get muzzleOffset(): { x: number; y: number } {
    // Enemies face left (toward the rally).
    return { x: -14, y: 0 };
  }

  /** Passive telegraphs (fake HP shield, hit immunity) render as outlines. */
  setOutline(width: number, color: number): void {
    this.bodySprite.setStrokeStyle(width, color);
  }

  clearOutline(): void {
    this.bodySprite.setStrokeStyle(0);
  }

  protected bodyTarget(): Phaser.GameObjects.GameObject {
    return this.bodySprite;
  }

  protected resetPose(): void {
    this.bodySprite.setPosition(0, 0);
    this.bodySprite.setScale(1);
    this.bodySprite.setAlpha(1);
    this.shadow.setScale(1);
  }

  protected playIdle(): Phaser.Tweens.Tween[] {
    // Menacing pulse in place.
    return [
      this.scene.tweens.add({
        targets: this.bodySprite,
        scale: 1.06,
        yoyo: true,
        repeat: -1,
        duration: 600,
        ease: 'Sine.easeInOut',
      }),
    ];
  }

  protected playWalk(running: boolean): Phaser.Tweens.Tween[] {
    // Plodding bob; runners skitter faster with a squash-and-stretch feel.
    const duration = running ? 110 : 260;
    return [
      this.scene.tweens.add({
        targets: this.bodySprite,
        y: -5,
        scaleX: 1.08,
        scaleY: 0.92,
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

  protected playAttack(onComplete: () => void): void {
    // Lunge toward the shield (left).
    this.scene.tweens.add({
      targets: this.bodySprite,
      x: -10,
      yoyo: true,
      duration: 100,
      onComplete,
    });
  }

  protected playCast(onComplete: () => void): void {
    // Boss skill telegraph — dark expanding ring.
    const ring = this.scene.add.circle(0, 0, 18, 0x000000, 0.25);
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
      scale: 1.3,
      yoyo: true,
      duration: 200,
      onComplete,
    });
  }

  protected playDeath(onComplete?: () => void): void {
    // Collapse and dissolve (replaces the old inline shrink/spin tween).
    this.scene.tweens.add({
      targets: this.shadow,
      alpha: 0,
      duration: 250,
    });
    this.scene.tweens.add({
      targets: this.bodySprite,
      scaleY: 0.2,
      scaleX: 1.4,
      y: 10,
      alpha: 0,
      duration: 300,
      ease: 'Quad.easeIn',
      onComplete: () => onComplete?.(),
    });
  }
}
