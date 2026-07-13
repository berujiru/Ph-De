import Phaser from 'phaser';

export class Summon extends Phaser.GameObjects.Container {
  public isDead = false;
  public isEnemyTeam = false;
  public maxHp: number;
  public hp: number;
  /**
   * Body-block half-extents for Enemy's summon AABB check — derived from the
   * body's display size, floored at the historical 30×20 half-box so small
   * summons behave exactly as before while wide walls block their full span.
   */
  public blockHalfWidth: number;
  public blockHalfHeight: number;
  private shape: Phaser.GameObjects.Rectangle | Phaser.GameObjects.Image | Phaser.GameObjects.Sprite;
  private color: number;
  private hpBarBg: Phaser.GameObjects.Rectangle;
  private hpBarFill: Phaser.GameObjects.Rectangle;
  private barWidth: number;

  constructor(scene: Phaser.Scene, x: number, y: number, maxHp: number, color: number, art?: { artKey: string; tint: number; frame?: number; size?: number; displayWidth?: number; displayHeight?: number }) {
    super(scene, x, y);
    this.maxHp = maxHp;
    this.hp = maxHp;
    this.color = art?.tint ?? color;

    // The barricade shape (wider than tall, blocking the vertical lane)
    if (art && scene.textures.exists(art.artKey)) {
      const img = scene.add.sprite(0, 0, art.artKey, art.frame);
      if (art.displayWidth !== undefined) {
        // Explicit footprint (skill barrier): height defaults to the art's
        // native aspect when not given.
        img.setDisplaySize(art.displayWidth, art.displayHeight ?? art.displayWidth * (img.height / img.width));
      } else if (art.frame !== undefined) {
        const renderSize = art.size ?? 96;
        img.setDisplaySize(renderSize, renderSize);
      } else {
        // Hero-built barricade (yero panel): wall-sized, spanning the lane.
        img.setDisplaySize(96, 40);
      }
      if (art.tint !== 0xffffff) {
        img.setTint(art.tint);
      }
      this.shape = img;
    } else {
      // No texture: still honor an explicit footprint so a wide wall doesn't
      // collapse into the tiny default block while its art is missing.
      this.shape = scene.add.rectangle(0, 0, art?.displayWidth ?? 40, art?.displayHeight ?? 16, color);
    }
    this.add(this.shape);

    this.blockHalfWidth = Math.max(30, this.shape.displayWidth / 2);
    this.blockHalfHeight = Math.max(20, this.shape.displayHeight / 2);

    // HP Bar — sized to the body so a wide wall doesn't wear a toothpick bar.
    this.barWidth = Math.max(30, Math.round(this.shape.displayWidth * 0.625));
    const barY = -(this.shape.displayHeight / 2 + 20);
    this.hpBarBg = scene.add.rectangle(0, barY, this.barWidth, 4, 0x000000, 0.5);
    this.hpBarFill = scene.add.rectangle(-this.barWidth / 2, barY, this.barWidth, 4, 0x22c55e).setOrigin(0, 0.5);
    this.add(this.hpBarBg);
    this.add(this.hpBarFill);

    scene.add.existing(this);
  }

  public takeDamage(amount: number) {
    if (this.isDead) return;
    this.hp -= amount;

    // Flash white on hit, then restore the summon's own color
    this.flashShape(0xffffff, true);
    this.scene.time.delayedCall(100, () => {
      if (!this.isDead) this.flashShape(this.color, false);
    });

    if (this.hp <= 0) {
      this.die();
    } else {
      this.hpBarFill.width = this.barWidth * (this.hp / this.maxHp);
      if (this.hp < this.maxHp * 0.3) {
        this.hpBarFill.setFillStyle(0xef4444); // Red
      } else if (this.hp < this.maxHp * 0.6) {
        this.hpBarFill.setFillStyle(0xeab308); // Yellow
      }
    }
  }

  private flashShape(color: number, isFlash: boolean = false) {
    // Narrow on Rectangle: Sprite is NOT an instanceof Image in Phaser, so
    // checking for Image here sent sprite-art summons into setFillStyle().
    if (this.shape instanceof Phaser.GameObjects.Rectangle) {
      this.shape.setFillStyle(color);
    } else {
      if (color === 0xffffff && !isFlash) {
        this.shape.clearTint();
      } else {
        this.shape.setTint(color);
        // Flash reads as a solid fill, not a multiply, on the white flash frame.
        this.shape.setTintMode(isFlash ? Phaser.TintModes.FILL : Phaser.TintModes.MULTIPLY);
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
