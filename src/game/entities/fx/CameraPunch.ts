import Phaser from 'phaser';
import type { CameraShakeConfig } from '../../data/level';

/**
 * A one-shot camera punch (screen shake) for impactful moments.
 *
 * IMPORTANT — this MUST layer on top of GameScene's manual follow-lerp without
 * fighting it. It uses Phaser's built-in `camera.shake()`, which applies its
 * offset as a render-phase matrix translate that is recomputed and zeroed every
 * frame; it never writes to `scrollX`/`scrollY`. So the scene's per-frame
 * `cam.scrollX += ...` follow logic and this shake compose cleanly and nothing
 * accumulates drift. `force = true` lets a stronger punch (e.g. a boss death)
 * override a weaker one already in progress rather than being ignored.
 */
export function cameraPunch(
  scene: Phaser.Scene,
  config: CameraShakeConfig,
  force = false,
): void {
  const cam = scene.cameras?.main;
  if (!cam) return;
  cam.shake(config.durationMs, config.intensity, force);
}
