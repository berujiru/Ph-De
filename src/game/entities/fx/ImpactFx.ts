import Phaser from 'phaser';
import { FX } from '../../data/level';

/**
 * Reusable impact/burst particle helpers. Everything here is built from a small,
 * FIXED number of lightweight vector shapes (rectangles/arcs) that tween out and
 * self-destroy — no Phaser ParticleEmitter, no per-frame allocation, so the cost
 * per hit/death is a handful of short-lived tweens. Shard counts live in FX
 * (data/level.ts) so the density is tunable in one place.
 */

/** A short spark burst at a hit point — a few outward-flying shard rectangles. */
export function spawnHitSpark(scene: Phaser.Scene, x: number, y: number, color: number): void {
  const cfg = FX.hitSpark;
  for (let i = 0; i < cfg.shardCount; i++) {
    const angle = (Math.PI * 2 * i) / cfg.shardCount + Math.random() * 0.5;
    const shard = scene.add
      .rectangle(x, y, 6, 2, color)
      .setDepth(40)
      .setRotation(angle);
    scene.tweens.add({
      targets: shard,
      x: x + Math.cos(angle) * cfg.spreadPx,
      y: y + Math.sin(angle) * cfg.spreadPx,
      alpha: 0,
      scaleX: 0.2,
      duration: cfg.durationMs,
      ease: 'Quad.easeOut',
      onComplete: () => shard.destroy(),
    });
  }
}

/**
 * A satisfying enemy-death pop layered on top of the model's collapse: a bright
 * expanding ring plus a spray of shards in the enemy's tint.
 */
export function spawnDeathBurst(scene: Phaser.Scene, x: number, y: number, color: number): void {
  const cfg = FX.deathBurst;

  const ring = scene.add.circle(x, y, 8, color, 0).setDepth(40);
  ring.setStrokeStyle(3, color, 0.9);
  scene.tweens.add({
    targets: ring,
    scale: cfg.ringRadiusPx / 8,
    alpha: 0,
    duration: cfg.durationMs,
    ease: 'Quad.easeOut',
    onComplete: () => ring.destroy(),
  });

  const flash = scene.add.circle(x, y, 14, 0xffffff, 0.85).setDepth(41);
  scene.tweens.add({
    targets: flash,
    scale: 2,
    alpha: 0,
    duration: 140,
    onComplete: () => flash.destroy(),
  });

  for (let i = 0; i < cfg.shardCount; i++) {
    const angle = (Math.PI * 2 * i) / cfg.shardCount + Math.random() * 0.4;
    const dist = cfg.spreadPx * (0.6 + Math.random() * 0.4);
    const shard = scene.add
      .rectangle(x, y, 7, 3, color)
      .setDepth(40)
      .setRotation(angle);
    scene.tweens.add({
      targets: shard,
      x: x + Math.cos(angle) * dist,
      y: y + Math.sin(angle) * dist,
      alpha: 0,
      angle: Phaser.Math.RadToDeg(angle) + 180,
      duration: cfg.durationMs,
      ease: 'Cubic.easeOut',
      onComplete: () => shard.destroy(),
    });
  }
}
