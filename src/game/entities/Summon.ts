import Phaser from 'phaser';

export class Summon extends Phaser.GameObjects.Container {
  public isDead = false;
  public isEnemyTeam = false;
  public maxHp: number;
  public hp: number;
  private shape: Phaser.GameObjects.Rectangle | Phaser.GameObjects.Image | Phaser.GameObjects.Sprite;
  private color: number;
  private hpBarBg: Phaser.GameObjects.Rectangle;
  private hpBarFill: Phaser.GameObjects.Rectangle;

  constructor(scene: Phaser.Scene, x: number, y: number, maxHp: number, color: number, art?: { artKey: string; tint: number; frame?: number; size?: number }) {
    super(scene, x, y);
    this.maxHp = maxHp;
    this.hp = maxHp;
    this.color = art?.tint ?? color;

    // The barricade shape (wider than tall, blocking the vertical lane)
    if (art && scene.textures.exists(art.artKey)) {
      const img = scene.add.sprite(0, 0, art.artKey, art.frame);
      if (art.frame !== undefined) {
        const renderSize = art.size ?? 96;
        img.setDisplaySize(renderSize, renderSize);
      } else {
        img.setDisplaySize(48, 20);
      }
      if (art.tint !== 0xffffff) {
        img.setTint(art.tint);
      }
      this.shape = img;
    } else {
      this.shape = scene.add.rectangle(0, 0, 40, 16, color);
    }
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

    // Flash white on hit, then restore the summon's own color
    this.flashShape(0xffffff);
    this.scene.time.delayedCall(100, () => {
      if (!this.isDead) this.flashShape(this.color);
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

  private flashShape(color: number) {
    if (this.shape instanceof Phaser.GameObjects.Image) {
      this.shape.setTint(color);
      // Flash reads as a solid fill, not a multiply, on the white flash frame.
      if (color === 0xffffff) this.shape.setTintFill();
    } else {
      this.shape.setFillStyle(color);
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
