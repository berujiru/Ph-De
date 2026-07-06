import Phaser from 'phaser';

export class Summon extends Phaser.GameObjects.Container {
  public isDead = false;
  public maxHp: number;
  public hp: number;
  private shape: Phaser.GameObjects.Rectangle;
  private hpBarBg: Phaser.GameObjects.Rectangle;
  private hpBarFill: Phaser.GameObjects.Rectangle;

  constructor(scene: Phaser.Scene, x: number, y: number, maxHp: number, color: number) {
    super(scene, x, y);
    this.maxHp = maxHp;
    this.hp = maxHp;

    // The barricade shape (wider than tall, blocking the vertical lane)
    this.shape = scene.add.rectangle(0, 0, 40, 16, color);
    this.add(this.shape);

    // HP Bar
    this.hpBarBg = scene.add.rectangle(0, -30, 30, 4, 0x000000, 0.5);
    this.hpBarFill = scene.add.rectangle(-15, -30, 30, 4, 0x22c55e).setOrigin(0, 0.5);
    this.add(this.hpBarBg);
    this.add(this.hpBarFill);

    scene.add.existing(this);
  }

  public takeDamage(amount: number) {
    if (this.isDead) return;
    this.hp -= amount;

    // Flash white on hit
    this.shape.setFillStyle(0xffffff);
    this.scene.time.delayedCall(100, () => {
      if (!this.isDead) this.shape.setFillStyle(0xd97706); // Default orange/brown color for Yero
    });

    if (this.hp <= 0) {
      this.die();
    } else {
      this.hpBarFill.width = 30 * (this.hp / this.maxHp);
      if (this.hp < this.maxHp * 0.3) {
        this.hpBarFill.setFillStyle(0xef4444); // Red
      } else if (this.hp < this.maxHp * 0.6) {
        this.hpBarFill.setFillStyle(0xeab308); // Yellow
      }
    }
  }

  private die() {
    this.isDead = true;
    
    // Fall over animation
    this.scene.tweens.add({
      targets: this,
      angle: 90,
      alpha: 0,
      duration: 300,
      onComplete: () => {
        this.destroy();
      }
    });
  }
}
