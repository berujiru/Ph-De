import Phaser from 'phaser';

/**
 * Shared expanding-ring / impact-flash effect: a circle that grows from
 * startRadius to endRadius while fading out, then destroys itself. Covers the
 * "shockwave" cue used by skill blasts, explosions, and enemy pulses.
 * Fire-and-forget, like spawnHitSpark.
 */
export interface ShockwaveRingConfig {
  x: number;
  y: number;
  /** Fill tint (visible when fillAlpha > 0) and default stroke color. */
  color: number;
  endRadius: number;
  startRadius?: number;
  /** Number of staggered rings (default 1). */
  rings?: number;
  /** Delay between successive rings (default 150ms). */
  ringDelayMs?: number;
  durationMs?: number;
  /** 0 (default) = stroke-only ring; > 0 = filled flash. */
  fillAlpha?: number;
  /** 0 disables the stroke (pure filled flash). */
  strokeWidth?: number;
  strokeColor?: number;
  strokeAlpha?: number;
  /** Per-ring stroke width decrement for multi-ring bursts. */
  strokeWidthStep?: number;
  blendMode?: Phaser.BlendModes;
  ease?: string;
  depth?: number;
}

export function spawnShockwaveRing(scene: Phaser.Scene, cfg: ShockwaveRingConfig): void {
  const {
    x, y, color, endRadius,
    startRadius = 10,
    rings = 1,
    ringDelayMs = 150,
    durationMs = 500,
    fillAlpha = 0,
    strokeWidth = 3,
    strokeColor = color,
    strokeAlpha = 0.9,
    strokeWidthStep = 0,
    blendMode,
    ease = 'Quad.easeOut',
    depth,
  } = cfg;

  for (let i = 0; i < rings; i++) {
    const ring = scene.add.circle(x, y, startRadius, color, fillAlpha);
    const width = strokeWidth - i * strokeWidthStep;
    if (width > 0) ring.setStrokeStyle(width, strokeColor, strokeAlpha);
    if (blendMode !== undefined) ring.setBlendMode(blendMode);
    if (depth !== undefined) ring.setDepth(depth);
    scene.tweens.add({
      targets: ring,
      radius: endRadius,
      alpha: 0,
      duration: durationMs,
      delay: i * ringDelayMs,
      ease,
      onComplete: () => ring.destroy(),
    });
  }
}
