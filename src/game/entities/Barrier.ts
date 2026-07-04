import Phaser from 'phaser';

export class Barrier extends Phaser.GameObjects.Rectangle {
  public hp: number;
  public maxHp: number;
  private sceneRef: Phaser.Scene;

  constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number, maxHp: number) {
    super(scene, x, y, width, height, 0x1e293b);
    this.sceneRef = scene;
    this.maxHp = maxHp;
    this.hp = maxHp;

    this.sceneRef.add.existing(this);
    this.setStrokeStyle(4, 0x38bdf8);
  }

  takeDamage(amount: number) {
    if (this.hp <= 0) return; // already dead
    this.hp = Math.max(0, this.hp - amount);
    
    if (this.hp <= 0) {
      this.sceneRef.sound.play('sfx-barrier-break');
    } else {
      this.sceneRef.sound.play('sfx-barrier-hit');
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
