import Phaser from 'phaser';

/**
 * The crowd's morale, made visible: a glowing translucent shield wall that
 * travels at the FRONT of the rally formation. Gameplay-wise it keeps the
 * old Barrier semantics — it is the single thing enemies attack, and its
 * hp/maxHp are reported as barrierHp/maxBarrierHp in the snapshot ("Morale"
 * in the HUD). The scene moves it via `x` as the formation advances.
 */
export class MoraleShield extends Phaser.GameObjects.Container {
  public hp: number;
  public maxHp: number;
  public width: number;
  public height: number;
  private wall: Phaser.GameObjects.Rectangle;
  private front: Phaser.GameObjects.Arc;

  constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number, maxHp: number) {
    super(scene, x, y);
    this.maxHp = maxHp;
    this.hp = maxHp;
    this.width = width;
    this.height = height;

    // Translucent energy wall.
    this.wall = scene.add.rectangle(0, 0, width, height, 0x38bdf8, 0.18);
    this.add(this.wall);

    // Glowing leading edge — an arc bulging toward the enemies.
    this.front = scene.add.arc(width / 2, 0, height / 2, -80, 80, false);
    this.front.setStrokeStyle(4, 0x38bdf8, 0.9);
    this.front.setScale(0.35, 1);
    this.front.isFilled = false;
    this.add(this.front);

    // Idle morale pulse.
    scene.tweens.add({
      targets: [this.wall, this.front],
      alpha: 0.55,
      yoyo: true,
      repeat: -1,
      duration: 900,
      ease: 'Sine.easeInOut',
    });

    scene.add.existing(this);
  }

  takeDamage(amount: number) {
    if (this.hp <= 0) return; // already dead
    this.hp = Math.max(0, this.hp - amount);

    if (this.hp <= 0) {
      try { this.scene.sound.play('sfx-barrier-break'); } catch (e) {}
    } else {
      try { this.scene.sound.play('sfx-barrier-hit'); } catch (e) {}
    }

    // Morale flicker on hit.
    this.scene.tweens.add({
      targets: this,
      alpha: 0.4,
      yoyo: true,
      duration: 100,
    });
  }

  get isDead() {
    return this.hp <= 0;
  }
}
