import Phaser from 'phaser';

/**
 * Visual half of a linear/rectangular wave sweeping along the lane: a
 * translucent body with a bright leading edge, optional width pulse, fade
 * ramp, and trailing droplet particles. The owning Attack keeps movement and
 * hit logic and drives this via setY()/setFade()/emitTrailParticle().
 */
export interface LaneWaveConfig {
  x: number;
  y: number;
  width: number;
  height: number;
  color: number;
  bodyAlpha?: number;
  /** Leading-edge bar height (default 6px, white). */
  edgeHeight?: number;
  edgeAlpha?: number;
  /** Cel-shaded outline on the body (default on). */
  outline?: boolean;
  /** Repeating width pulse as the wave travels. */
  pulse?: { scaleX: number; durationMs: number };
  /** Trailing droplets spawned by emitTrailParticle(). */
  particles?: { minRadius: number; maxRadius: number; alpha: number; fallPx: number; durationMs: number; depth?: number };
  depth?: { body: number; edge: number };
  /** Attack-art texture for the body instead of the flat rectangle. */
  svgKey?: string;
  /** Tint for white/grayscale attack-art SVGs (damage-type color). */
  svgTint?: number;
}

/** Matches OUTLINE_COLOR in entities/Attacks.ts (kept local to avoid a cycle). */
const OUTLINE_COLOR = 0x0f172a;

export class LaneWave {
  private scene: Phaser.Scene;
  private cfg: LaneWaveConfig;
  private body: Phaser.GameObjects.Rectangle | Phaser.GameObjects.Image;
  private edge: Phaser.GameObjects.Rectangle;
  private baseBodyAlpha: number;
  private baseEdgeAlpha: number;

  constructor(scene: Phaser.Scene, cfg: LaneWaveConfig) {
    this.scene = scene;
    this.cfg = cfg;
    this.baseBodyAlpha = cfg.bodyAlpha ?? 0.6;
    this.baseEdgeAlpha = cfg.edgeAlpha ?? 0.9;

    if (cfg.svgKey) {
      const img = scene.add.image(cfg.x, cfg.y, cfg.svgKey);
      img.setDisplaySize(cfg.width, cfg.height);
      if (cfg.svgTint !== undefined) img.setTint(cfg.svgTint);
      img.setAlpha(this.baseBodyAlpha);
      this.body = img;
    } else {
      const rect = scene.add.rectangle(cfg.x, cfg.y, cfg.width, cfg.height, cfg.color, this.baseBodyAlpha);
      if (cfg.outline !== false) rect.setStrokeStyle(2, OUTLINE_COLOR, 0.8);
      this.body = rect;
    }
    this.edge = scene.add.rectangle(cfg.x, cfg.y - cfg.height / 2, cfg.width, cfg.edgeHeight ?? 6, 0xffffff, this.baseEdgeAlpha);
    if (cfg.depth) {
      this.body.setDepth(cfg.depth.body);
      this.edge.setDepth(cfg.depth.edge);
    }

    if (cfg.pulse) {
      // Relative to each target's base scale — the SVG body's scale is not 1.
      for (const target of [this.body, this.edge]) {
        scene.tweens.add({
          targets: target,
          scaleX: target.scaleX * cfg.pulse.scaleX,
          yoyo: true,
          repeat: -1,
          duration: cfg.pulse.durationMs,
          ease: 'Sine.easeInOut',
        });
      }
    }
  }

  get x(): number { return this.body.x; }
  get y(): number { return this.body.y; }
  get width(): number { return this.cfg.width; }
  get height(): number { return this.cfg.height; }

  setY(y: number): void {
    this.body.y = y;
    this.edge.setPosition(this.body.x, y - this.cfg.height / 2);
  }

  /** 1 = fully visible, 0 = invisible; used for end-of-travel fade ramps. */
  setFade(ratio: number): void {
    this.body.setAlpha(this.baseBodyAlpha * ratio);
    this.edge.setAlpha(this.baseEdgeAlpha * ratio);
  }

  /** Spawn one trailing droplet behind the wave; call from the Attack's update. */
  emitTrailParticle(alphaScale = 1): void {
    const p = this.cfg.particles;
    if (!p) return;
    const particle = this.scene.add.circle(
      this.body.x + Phaser.Math.Between(-this.cfg.width / 2, this.cfg.width / 2),
      this.body.y + this.cfg.height / 2,
      Phaser.Math.Between(p.minRadius, p.maxRadius),
      0xffffff,
      p.alpha * alphaScale
    );
    if (p.depth !== undefined) particle.setDepth(p.depth);
    this.scene.tweens.add({
      targets: particle,
      y: particle.y + p.fallPx,
      alpha: 0,
      scale: 0,
      duration: p.durationMs,
      onComplete: () => particle.destroy(),
    });
  }

  destroy(): void {
    this.scene.tweens.killTweensOf([this.body, this.edge]);
    this.body.destroy();
    this.edge.destroy();
  }
}
