import Phaser from 'phaser';
import { SKILL_CONE_HALF_ANGLE } from '../../core/Skills';

/**
 * Shared cone-shaped skill flash: a filled triangle fanning out from an apex
 * that fades and self-destroys. The geometry mirrors the hit-test in
 * core/Geometry.ts isPointInCone — keep halfAngle/length in sync with the
 * values the skill uses for damage/ailments.
 */
export interface ConeFlashConfig {
  /** Cone apex — usually the casting hero's position. */
  x: number;
  y: number;
  /** Central direction in radians. */
  angle: number;
  length: number;
  halfAngle?: number;
  /** Distance ahead of the apex where the fill starts (default 20px). */
  apexOffset?: number;
  color: number;
  alpha: number;
  fadeMs: number;
  ease?: string;
  blendMode?: Phaser.BlendModes;
}

export function spawnConeFlash(scene: Phaser.Scene, cfg: ConeFlashConfig): void {
  const {
    x, y, angle, length, color, alpha, fadeMs,
    halfAngle = SKILL_CONE_HALF_ANGLE,
    apexOffset = 20,
    ease = 'Power2',
    blendMode = Phaser.BlendModes.ADD,
  } = cfg;

  const graphics = scene.add.graphics();
  graphics.fillStyle(color, alpha);
  graphics.beginPath();

  const startX = x + Math.cos(angle) * apexOffset;
  const startY = y + Math.sin(angle) * apexOffset;
  graphics.moveTo(startX, startY);
  graphics.lineTo(startX + Math.cos(angle - halfAngle) * length, startY + Math.sin(angle - halfAngle) * length);
  graphics.lineTo(startX + Math.cos(angle + halfAngle) * length, startY + Math.sin(angle + halfAngle) * length);
  graphics.closePath();
  graphics.fillPath();
  graphics.setBlendMode(blendMode);

  scene.tweens.add({
    targets: graphics,
    alpha: 0,
    duration: fadeMs,
    ease,
    onComplete: () => graphics.destroy(),
  });
}
