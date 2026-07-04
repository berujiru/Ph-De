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
  private edgeGlow: Phaser.GameObjects.Rectangle;
  private edge: Phaser.GameObjects.Rectangle;

  constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number, maxHp: number) {
    super(scene, x, y);
    this.maxHp = maxHp;
    this.hp = maxHp;
    this.width = width;
    this.height = height;

    // Translucent energy wall — the single shield visual. Its leading edge is
    // brightened in place rather than drawn as a separate shape floating
    // ahead of it (playtesters read a detached arc as a second shield).
    this.wall = scene.add.rectangle(0, 0, width, height, 0x38bdf8, 0.18);
    this.edgeGlow = scene.add.rectangle(width / 2 - 5, 0, 10, height, 0x38bdf8, 0.3);
    this.edge = scene.add.rectangle(width / 2 - 2, 0, 4, height, 0x7dd3fc, 0.9);
    this.add([this.wall, this.edgeGlow, this.edge]);

    // Idle morale pulse.
    scene.tweens.add({
      targets: [this.wall, this.edgeGlow, this.edge],
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
