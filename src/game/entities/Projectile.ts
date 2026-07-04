import Phaser from 'phaser';
import type { Enemy } from './Enemy';

export class Projectile extends Phaser.GameObjects.Arc {
  private target: Enemy | null;
  private speed = 500;
  private damage: number;
  public isDead = false;
  private vx = 0;
  private vy = 0;

  constructor(scene: Phaser.Scene, x: number, y: number, target: Enemy, damage: number, color: number) {
    super(scene, x, y, 6, 0, 360, false, color);
    this.target = target;
    this.damage = damage;
    scene.add.existing(this);
    
    const dx = target.x - x;
    const dy = target.y - y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > 0) {
      this.vx = (dx / dist) * this.speed;
      this.vy = (dy / dist) * this.speed;
    }
  }

  update(delta: number) {
    if (this.isDead) return;

    if (this.target && this.target.isDead) {
      this.target = null;
    }

    if (this.target) {
      const dx = this.target.x - this.x;
      const dy = this.target.y - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > 0) {
        this.vx = (dx / dist) * this.speed;
        this.vy = (dy / dist) * this.speed;
      }
    }

    const dt = delta / 1000;
    this.x += this.vx * dt;
    this.y += this.vy * dt;

    const enemies = (this.scene as any).enemies as Enemy[];
    if (enemies) {
      for (const enemy of enemies) {
        if (!enemy.isDead) {
          const dx = enemy.x - this.x;
          const dy = enemy.y - this.y;
          if (dx * dx + dy * dy < 400) { // 20 radius collision
            enemy.takeDamage(this.damage);
            this.isDead = true;
            return;
          }
        }
      }
    }

    if (this.x > 1000 || this.x < -100 || this.y > 1500 || this.y < -100) {
      this.isDead = true;
    }
  }
}
