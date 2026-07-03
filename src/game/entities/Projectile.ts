import Phaser from 'phaser';
import type { Enemy } from './Enemy';

export class Projectile extends Phaser.GameObjects.Arc {
  onHit?: (target: Enemy, damage: number) => void;

  private readonly target: Enemy;
  private readonly speed: number;
  private readonly damage: number;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    target: Enemy,
    speed: number,
    damage: number,
    color: number,
  ) {
    super(scene, x, y, 4, 0, 360, false, color);
    this.target = target;
    this.speed = speed;
    this.damage = damage;
    scene.add.existing(this);
  }

  /** Advances the projectile; returns true once it has hit or its target is gone (and destroyed itself). */
  update(dtMs: number): boolean {
    if (this.target.isDead || this.target.reachedEnd) {
      this.destroy();
      return true;
    }

    const dx = this.target.x - this.x;
    const dy = this.target.y - this.y;
    const distance = Math.hypot(dx, dy);
    const step = (this.speed * dtMs) / 1000;

    if (distance <= step) {
      this.onHit?.(this.target, this.damage);
      this.destroy();
      return true;
    }

    this.x += (dx / distance) * step;
    this.y += (dy / distance) * step;
    return false;
  }
}
