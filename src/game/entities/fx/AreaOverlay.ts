import Phaser from 'phaser';

/**
 * Reusable ground overlay for circular AoE skills: an optional flat disc
 * (fill and/or stroke, sized to the skill's gameplay radius), optional inner
 * telegraph rings, an optional SVG ground image (vortex/tornado/tree), and an
 * optional center icon — with shared enter/pulse/exit animation options.
 *
 * Purely visual: it never ticks gameplay. Persistent damaging fields own one
 * of these from an Attack subclass and call destroy()/fadeOutAndDestroy() on
 * teardown; one-shot overlays pass `exit` and self-destroy.
 */
export interface AreaOverlayConfig {
  x: number;
  y: number;
  /** The skill's gameplay radius — the disc is drawn at exactly this size. */
  radius: number;
  /** Omit both fillColor and strokeColor for a pure-SVG overlay (no disc). */
  fillColor?: number;
  fillAlpha?: number;
  strokeColor?: number;
  strokeWidth?: number;
  strokeAlpha?: number;
  /** Concentric telegraph rings at fractions of the radius (e.g. [0.4, 0.8]). */
  innerRings?: { fractions: number[]; color: number; width?: number; alpha?: number };
  /**
   * Repeating yoyo pulse. Targets the inner rings when present, otherwise the
   * disc. `alphaTo` tweens the target's object alpha (1 = fully drawn).
   */
  pulse?: { scale?: number; alphaTo?: number; durationMs?: number };
  /** Y-scale on the disc/rings for the oblique camera (SkillAura uses 0.5). */
  squash?: number;
  /** Preloaded texture key for an SVG ground image layered above the disc. */
  svgKey?: string;
  svgScale?: number;
  /** Tint for white/grayscale attack-art SVGs; omit for baked-color FX art. */
  svgTint?: number;
  /** 1 = "standing" flourish rooted at (x,y) (tree); 0.5 = flat (vortex). */
  svgOriginY?: number;
  /** Continuous rotation of the SVG in degrees per second (tornado). */
  svgSpin?: number;
  /** Scale-bump the SVG on each pulseOnce() call (tree). */
  svgPulse?: boolean;
  centerIcon?: { text: string; fontSize?: string };
  blendMode?: Phaser.BlendModes;
  depth?: number;
  /** Fade/pop in on spawn. */
  enter?: { durationMs: number; ease?: string; fromScale?: number };
  /** Self-expiring teardown; omit when an owning Attack manages the lifetime. */
  exit?: { mode: 'fade' | 'shrink'; durationMs: number; delayMs?: number; ease?: string };
  onExpire?: () => void;
}

export class AreaOverlay extends Phaser.GameObjects.Container {
  private disc?: Phaser.GameObjects.Arc;
  private rings?: Phaser.GameObjects.Graphics;
  private svg?: Phaser.GameObjects.Image;
  private icon?: Phaser.GameObjects.Text;
  private baseFillAlpha = 0;
  private baseSvgScale = 1;

  constructor(scene: Phaser.Scene, cfg: AreaOverlayConfig) {
    super(scene, cfg.x, cfg.y);
    scene.add.existing(this);
    if (cfg.depth !== undefined) this.setDepth(cfg.depth);

    const squash = cfg.squash ?? 1;

    if (cfg.fillColor !== undefined || cfg.strokeColor !== undefined) {
      this.baseFillAlpha = cfg.fillColor !== undefined ? (cfg.fillAlpha ?? 0.15) : 0;
      this.disc = scene.add.circle(0, 0, cfg.radius, cfg.fillColor ?? 0x000000, this.baseFillAlpha);
      if (cfg.strokeColor !== undefined) {
        this.disc.setStrokeStyle(cfg.strokeWidth ?? 2, cfg.strokeColor, cfg.strokeAlpha ?? 0.5);
      }
      this.disc.scaleY = squash;
      if (cfg.blendMode !== undefined) this.disc.setBlendMode(cfg.blendMode);
      this.add(this.disc);
    }

    if (cfg.innerRings) {
      this.rings = scene.add.graphics();
      this.rings.lineStyle(cfg.innerRings.width ?? 2, cfg.innerRings.color, cfg.innerRings.alpha ?? 0.6);
      for (const fraction of cfg.innerRings.fractions) {
        this.rings.strokeCircle(0, 0, cfg.radius * fraction);
      }
      this.rings.scaleY = squash;
      this.add(this.rings);
    }

    if (cfg.svgKey) {
      this.baseSvgScale = cfg.svgScale ?? 1;
      this.svg = scene.add.image(0, 0, cfg.svgKey);
      this.svg.setOrigin(0.5, cfg.svgOriginY ?? 0.5);
      this.svg.setScale(this.baseSvgScale);
      if (cfg.svgTint !== undefined) this.svg.setTint(cfg.svgTint);
      this.add(this.svg);
      if (cfg.svgSpin) {
        scene.tweens.add({
          targets: this.svg,
          angle: 360,
          duration: (360 / cfg.svgSpin) * 1000,
          repeat: -1,
        });
      }
    }

    if (cfg.centerIcon) {
      this.icon = scene.add.text(0, 0, cfg.centerIcon.text, { fontSize: cfg.centerIcon.fontSize ?? '42px' }).setOrigin(0.5);
      this.add(this.icon);
      scene.tweens.add({
        targets: this.icon,
        scaleX: 1.15,
        scaleY: 1.15,
        duration: 500,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    }

    if (cfg.pulse) {
      const target = this.rings ?? this.disc;
      if (target) {
        scene.tweens.add({
          targets: target,
          scaleX: cfg.pulse.scale ?? 1.1,
          scaleY: (cfg.pulse.scale ?? 1.1) * squash,
          alpha: cfg.pulse.alphaTo ?? 0.5,
          duration: cfg.pulse.durationMs ?? 800,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut',
        });
      }
    }

    if (cfg.enter) {
      this.setAlpha(0);
      if (cfg.enter.fromScale !== undefined) this.setScale(cfg.enter.fromScale);
      scene.tweens.add({
        targets: this,
        alpha: 1,
        scale: 1,
        duration: cfg.enter.durationMs,
        ease: cfg.enter.ease ?? 'Linear',
      });
    }

    if (cfg.exit) {
      const props: Record<string, number> = cfg.exit.mode === 'shrink' ? { scale: 0, alpha: 0 } : { alpha: 0 };
      scene.tweens.add({
        targets: this,
        ...props,
        delay: cfg.exit.delayMs ?? 0,
        duration: cfg.exit.durationMs,
        ease: cfg.exit.ease ?? 'Linear',
        onComplete: () => {
          cfg.onExpire?.();
          this.destroy();
        },
      });
    }
  }

  /** One-shot pulse for tick-based fields (tree of life root pulse). */
  pulseOnce(): void {
    if (this.svg) {
      this.scene.tweens.add({
        targets: this.svg,
        scale: this.baseSvgScale * 1.1,
        duration: 200,
        yoyo: true,
      });
    }
    if (this.disc && this.baseFillAlpha > 0) {
      this.scene.tweens.add({
        targets: this.disc,
        fillAlpha: Math.min(1, this.baseFillAlpha * 2),
        duration: 200,
        yoyo: true,
      });
    }
  }

  /** Owner-managed teardown for Attack-driven fields. */
  fadeOutAndDestroy(durationMs = 300, shrink = false): void {
    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      ...(shrink ? { scale: 0 } : {}),
      duration: durationMs,
      onComplete: () => this.destroy(),
    });
  }

  destroy(fromScene?: boolean): void {
    if (this.scene) {
      const targets: Phaser.GameObjects.GameObject[] = [this];
      if (this.disc) targets.push(this.disc);
      if (this.rings) targets.push(this.rings);
      if (this.svg) targets.push(this.svg);
      if (this.icon) targets.push(this.icon);
      for (const t of targets) this.scene.tweens.killTweensOf(t);
    }
    super.destroy(fromScene);
  }
}
