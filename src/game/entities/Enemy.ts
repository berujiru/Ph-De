import Phaser from 'phaser';
import type { EnemyDefinition } from '../data/balance';
import type { Barrier } from './Barrier';

export class Enemy extends Phaser.GameObjects.Container {
  public definition: EnemyDefinition;
  public hp: number;
  private bodyShape: Phaser.GameObjects.Arc;
  private hpBarBg: Phaser.GameObjects.Rectangle;
  private hpBarFill: Phaser.GameObjects.Rectangle;
  public isDead = false;
  private attackCooldown = 0;

  constructor(scene: Phaser.Scene, x: number, y: number, definition: EnemyDefinition) {
    super(scene, x, y);
    this.definition = definition;
    this.hp = definition.maxHp;

    this.bodyShape = scene.add.circle(0, 0, 15, definition.color);
    this.add(this.bodyShape);

    this.hpBarBg = scene.add.rectangle(0, -25, 30, 6, 0x000000, 0.5);
    this.hpBarFill = scene.add.rectangle(0, -25, 30, 6, 0x22c55e);
    this.add([this.hpBarBg, this.hpBarFill]);

    scene.add.existing(this);
  }

  takeDamage(amount: number) {
    this.hp -= amount;
    const pct = Math.max(0, this.hp / this.definition.maxHp);
    this.hpBarFill.scaleX = pct;

    if (this.hp <= 0 && !this.isDead) {
      this.isDead = true;
      this.hpBarBg.setVisible(false);
      this.hpBarFill.setVisible(false);
      
      // Death animation
      this.scene.tweens.add({
        targets: this,
        scaleX: 0,
        scaleY: 0,
        alpha: 0,
        angle: 180,
        duration: 300,
        onComplete: () => {
          this.destroy();
        }
      });
    }
  }

  update(delta: number, barrier: Barrier) {
    if (this.isDead) return;

    // Check if in range of barrier
    if (this.x <= barrier.x + barrier.width / 2 + this.definition.speed * 0.1) {
      // Reached the barrier, stop moving and start attacking
      this.x = barrier.x + barrier.width / 2 + this.definition.speed * 0.1;
      
      this.attackCooldown -= delta;
      if (this.attackCooldown <= 0) {
        barrier.takeDamage(this.definition.damage);
        this.attackCooldown = this.definition.attackRateMs;
        // Visual attack cue
        this.scene.tweens.add({ targets: this.bodyShape, x: -10, yoyo: true, duration: 100 });
      }
    } else {
      // Move left
      this.x -= this.definition.speed * (delta / 1000);
    }
  }
}
