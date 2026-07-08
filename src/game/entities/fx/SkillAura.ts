import Phaser from 'phaser';

/**
 * A reusable glowing aura component that pulses beneath a hero
 * to indicate their signature skill is ready.
 */
export class SkillAura extends Phaser.GameObjects.Container {
  private baseAura: Phaser.GameObjects.Arc;
  private pulseAura: Phaser.GameObjects.Arc;
  private isPlaying = false;
  private pulseTween: Phaser.Tweens.Tween | null = null;
  private color: number;
  private radius: number;

  constructor(scene: Phaser.Scene, color: number = 0xfacc15, radius: number = 30) {
    super(scene, 0, 0);
    this.color = color;
    this.radius = radius;

    // The inner static glow
    this.baseAura = scene.add.circle(0, 0, this.radius, this.color, 0.4);
    // The outer pulsing ring
    this.pulseAura = scene.add.circle(0, 0, this.radius, this.color, 0);
    this.pulseAura.setStrokeStyle(3, this.color, 1);

    // Flattens the circle to look like an oval cast on the ground due to the oblique camera
    this.setScale(1, 0.5);

    this.add([this.baseAura, this.pulseAura]);
    this.setAlpha(0);
    this.setVisible(false);
  }

  play() {
    if (this.isPlaying) return;
    this.isPlaying = true;
    this.setVisible(true);

    this.scene.tweens.killTweensOf(this);
    this.scene.tweens.add({
      targets: this,
      alpha: 1,
      duration: 300,
    });

    if (this.pulseTween) this.pulseTween.stop();
    
    // Reset pulse aura
    this.pulseAura.setScale(1);
    this.pulseAura.setAlpha(1);

    this.pulseTween = this.scene.tweens.add({
      targets: this.pulseAura,
      scale: 1.6,
      alpha: 0,
      duration: 1000,
      repeat: -1,
      ease: 'Sine.easeOut',
    });
  }

  stop() {
    if (!this.isPlaying) return;
    this.isPlaying = false;

    this.scene.tweens.killTweensOf(this);
    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      duration: 200,
      onComplete: () => {
        this.setVisible(false);
        if (this.pulseTween) {
          this.pulseTween.stop();
          this.pulseTween = null;
        }
      }
    });
  }

  pause() {
    if (this.pulseTween && this.pulseTween.isPlaying()) {
      this.pulseTween.pause();
    }
  }

  resume() {
    if (this.pulseTween && this.pulseTween.isPaused()) {
      this.pulseTween.resume();
    }
  }
}
