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
  /**
   * Render-time alpha for the SVG layer (the file itself stays opaque) so
   * ground fx never hide enemies standing inside the area.
   */
  svgAlpha?: number;
  /**
   * Instead of one centered instance, plant `count` smaller copies scattered
   * at random spots across the disc — from the top-down camera a wide AOE
   * reads as "the whole area burns", not one column at its center. Per-copy
   * scale is random between `minScale`..`maxScale` (fractions of `svgScale`).
   * With `roam` each copy lives a short cycle instead of standing still:
   * fade in (~200ms) at a random spot → hold → fade out → reappear elsewhere
   * inside the disc, staggered per copy so the area flickers organically.
   */
  svgScatter?: { count: number; minScale?: number; maxScale?: number; roam?: boolean };
  centerIcon?: { text: string; fontSize?: string };
  blendMode?: Phaser.BlendModes;
  depth?: number;
  /** Fade/pop in on spawn. */
  enter?: { durationMs: number; ease?: string; fromScale?: number };
  /** Self-expiring teardown; omit when an owning Attack manages the lifetime. */
  exit?: { mode: 'fade' | 'shrink'; durationMs: number; delayMs?: number; ease?: string };
  onExpire?: () => void;
}

/** One random spot inside the disc, uniform over its area, with a random scale. */
function randomDiscPlacement(
  radius: number,
  squash: number,
  minFrac: number,
  maxFrac: number,
  baseScale: number,
): { x: number; y: number; scale: number } {
  const a = Math.random() * Math.PI * 2;
  // sqrt() = uniform coverage over the disc area; 0.72 keeps bases inside the rim.
  const d = radius * 0.72 * Math.sqrt(Math.random());
  return {
    x: Math.cos(a) * d,
    y: Math.sin(a) * d * squash,
    scale: baseScale * (minFrac + Math.random() * (maxFrac - minFrac)),
  };
}

/** Fully random static layout inside the disc — organic, no repeating pattern. */
function scatterPlacements(
  radius: number,
  squash: number,
  count: number,
  minFrac: number,
  maxFrac: number,
  baseScale: number,
): { x: number; y: number; scale: number }[] {
  const pts: { x: number; y: number; scale: number }[] = [];
  for (let i = 0; i < count; i++) {
    pts.push(randomDiscPlacement(radius, squash, minFrac, maxFrac, baseScale));
  }
  // Painter's order: farther (smaller y) copies first so near ones overlap them.
  pts.sort((p, q) => p.y - q.y);
  return pts;
}

export class AreaOverlay extends Phaser.GameObjects.Container {
  private disc?: Phaser.GameObjects.Arc;
  private rings?: Phaser.GameObjects.Graphics;
  private svgs: Phaser.GameObjects.Image[] = [];
  private svgBaseScales: number[] = [];
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
      const svgAlpha = cfg.svgAlpha ?? 1;
      const scatter = cfg.svgScatter;
      const placements = scatter
        ? scatterPlacements(
            cfg.radius,
            squash,
            scatter.count,
            scatter.minScale ?? 0.4,
            scatter.maxScale ?? 0.65,
            this.baseSvgScale,
          )
        : [{ x: 0, y: 0, scale: this.baseSvgScale }];
      placements.forEach((p, i) => {
        const img = scene.add.image(p.x, p.y, cfg.svgKey!);
        img.setOrigin(0.5, cfg.svgOriginY ?? 0.5);
        img.setScale(p.scale);
        if (svgAlpha < 1) img.setAlpha(svgAlpha);
        if (cfg.svgTint !== undefined) img.setTint(cfg.svgTint);
        this.add(img);
        this.svgs.push(img);
        this.svgBaseScales.push(p.scale);
        if (cfg.svgSpin) {
          scene.tweens.add({
            targets: img,
            angle: 360,
            duration: (360 / cfg.svgSpin) * 1000,
            repeat: -1,
          });
        }
        if (scatter?.roam) {
          // Living copy: starts invisible, then cycles fade-in → hold →
          // fade-out → reappear at a new random spot. Staggered per copy.
          img.setAlpha(0);
          this.startRoam(img, cfg, squash, svgAlpha, i);
        }
      });
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

  /**
   * Roam cycle for one scattered copy: jump to a random spot in the disc,
   * fade in (~200ms), hold a beat, fade out (~200ms), repeat elsewhere.
   * Guards on `img.active` end the chain once the overlay is destroyed.
   */
  private startRoam(
    img: Phaser.GameObjects.Image,
    cfg: AreaOverlayConfig,
    squash: number,
    targetAlpha: number,
    index: number,
  ): void {
    const FADE_MS = 200;
    const cycle = () => {
      if (!this.scene || !img.active) return;
      const p = randomDiscPlacement(
        cfg.radius,
        squash,
        cfg.svgScatter?.minScale ?? 0.4,
        cfg.svgScatter?.maxScale ?? 0.65,
        this.baseSvgScale,
      );
      img.setPosition(p.x, p.y);
      img.setScale(p.scale);
      this.scene.tweens.add({
        targets: img,
        alpha: targetAlpha,
        duration: FADE_MS,
        onComplete: () => {
          if (!this.scene || !img.active) return;
          this.scene.tweens.add({
            targets: img,
            alpha: 0,
            duration: FADE_MS,
            delay: 300 + Math.random() * 400, // hold at the spot for a beat
            onComplete: cycle,
          });
        },
      });
    };
    // Stagger starts so the copies flicker out of sync from the first frame.
    this.scene.time.delayedCall(index * 150 + Math.random() * 200, cycle);
  }

  /** One-shot pulse for tick-based fields (tree of life root pulse). */
  pulseOnce(): void {
    this.svgs.forEach((img, i) => {
      this.scene.tweens.add({
        targets: img,
        scale: this.svgBaseScales[i] * 1.1,
        duration: 200,
        yoyo: true,
        // Slight stagger so scattered copies flare organically, not in lockstep.
        delay: i * 50,
      });
    });
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
      targets.push(...this.svgs);
      if (this.icon) targets.push(this.icon);
      for (const t of targets) this.scene.tweens.killTweensOf(t);
    }
    super.destroy(fromScene);
  }
}
