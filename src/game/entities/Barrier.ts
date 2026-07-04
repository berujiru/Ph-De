import Phaser from 'phaser';

export class Barrier extends Phaser.GameObjects.Container {
  public hp: number;
  public maxHp: number;
  private sceneRef: Phaser.Scene;
  private bgBox: Phaser.GameObjects.Rectangle;
  public width: number;
  public height: number;

  constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number, maxHp: number) {
    super(scene, x, y);
    this.sceneRef = scene;
    this.maxHp = maxHp;
    this.hp = maxHp;
    this.width = width;
    this.height = height;

    this.bgBox = scene.add.rectangle(0, 0, width, height, 0x1e293b);
    this.bgBox.setStrokeStyle(4, 0x38bdf8);
    this.add(this.bgBox);

    const graphics = scene.add.graphics();
    graphics.fillStyle(0xfacc15, 1);
    for (let sy = -height/2 - width; sy < height/2 + width; sy += 40) {
      graphics.beginPath();
      graphics.moveTo(-width/2, sy);
      graphics.lineTo(width/2, sy + width);
      graphics.lineTo(width/2, sy + width + 20);
      graphics.lineTo(-width/2, sy + 20);
      graphics.fillPath();
    }
    const maskShape = scene.make.graphics();
    maskShape.fillRect(x - width/2, y - height/2, width, height);
    const mask = maskShape.createGeometryMask();
    graphics.setMask(mask);
    
    this.add(graphics);

    this.sceneRef.add.existing(this);
  }

  takeDamage(amount: number) {
    if (this.hp <= 0) return; // already dead
    this.hp = Math.max(0, this.hp - amount);
    
    if (this.hp <= 0) {
      try { this.sceneRef.sound.play('sfx-barrier-break'); } catch (e) {}
    } else {
      try { this.sceneRef.sound.play('sfx-barrier-hit'); } catch (e) {}
    }
    
    // Visual feedback
    this.sceneRef.tweens.add({
      targets: this,
      alpha: 0.5,
      yoyo: true,
      duration: 100,
    });
  }

  get isDead() {
    return this.hp <= 0;
  }
}
