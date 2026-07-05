import Phaser from 'phaser';

/**
 * A cheap motion streak for a moving projectile: ONE stretched, tinted ellipse
 * that is repositioned behind the projectile each frame and stretched along its
 * heading. Fixed object count (no per-frame allocation), so a screen full of
 * projectiles costs one extra draw each — much cheaper than spawning fading
 * ghost sprites every frame. Rides just behind the projectile core to read as a
 * bold cel-shaded trail on the dark background.
 */
export class MotionTrail {
  private readonly streak: Phaser.GameObjects.Ellipse;

  constructor(scene: Phaser.Scene, color: number, length = 22, thickness = 8) {
    this.streak = scene.add.ellipse(0, 0, length, thickness, color, 0.45);
    this.streak.setDepth(9);
  }

  /** Point the streak opposite the velocity, trailing behind (x, y). */
  update(x: number, y: number, vx: number, vy: number): void {
    const angle = Math.atan2(vy, vx);
    // Sit the streak's midpoint a little behind the projectile.
    this.streak.setPosition(x - Math.cos(angle) * 8, y - Math.sin(angle) * 8);
    this.streak.setRotation(angle);
  }

  destroy(): void {
    this.streak.destroy();
  }
}
