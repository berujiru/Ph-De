import Phaser from 'phaser';

/**
 * A reusable glowing aura component that floats upward across a character's sprite.
 * Visualized as "reverse tear drops" or small energy particles to indicate active buffs.
 */
export class SpriteAura extends Phaser.GameObjects.Container {
  private particles: Phaser.GameObjects.Particles.ParticleEmitter;
  private isPlaying = false;
  private color: number;

  constructor(scene: Phaser.Scene, color: number = 0xfacc15, emitWidth: number = 60) {
    super(scene, 0, 0);
    this.color = color;

    // Create a generic particle emitter for the "reverse tear drops"
    // Note: We assume 'white-circle' exists or we can just use a tiny rectangle/circle texture.
    // If 'white-circle' isn't loaded, Phaser particles might fail. Let's make sure we have a fallback or draw one.
    // Using an empty string for texture in particles sometimes defaults to a white square, but it's safer to use graphics.
    
    // Instead of relying on an image, we can use a graphics generated texture.
    const textureKey = 'aura-drop-32';
    if (!scene.textures.exists(textureKey)) {
        const g = scene.add.graphics();
        g.fillStyle(0xffffff, 1);
        g.fillCircle(16, 16, 16); // 32x32 circle
        g.generateTexture(textureKey, 32, 32);
        g.destroy();
    }

    this.particles = scene.add.particles(0, 0, textureKey, {
      tint: this.color,
      alpha: { start: 0.8, end: 0 },
      scale: { start: 0.6, end: 0.1 },
      speedY: { min: -40, max: -80 },
      speedX: { min: -10, max: 10 },
      lifespan: 1000,
      frequency: 100,
      blendMode: 'SCREEN',
      // @ts-ignore: Phaser types are strict here
      emitZone: {
        type: 'random' as const,
        source: new Phaser.Geom.Rectangle(-emitWidth / 2, -50, emitWidth, 50),
      }
    });
    
    this.setDepth(10);

    this.add(this.particles);
    this.particles.stop();
  }

  play(color?: number) {
    if (color !== undefined) {
      this.color = color;
      this.particles.setParticleTint(this.color);
    }
    
    if (this.isPlaying) return;
    this.isPlaying = true;
    this.particles.start();
  }

  stop() {
    if (!this.isPlaying) return;
    this.isPlaying = false;
    this.particles.stop();
  }
}
