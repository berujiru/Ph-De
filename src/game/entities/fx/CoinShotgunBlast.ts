import Phaser from 'phaser';
import { spawnConeFlash } from './ConeFlash';
import { spawnShockwaveRing } from './ShockwaveRing';
import { SKILL_CONE_HALF_ANGLE } from '../../core/Skills';

/**
 * "Barya Lang Po" — the Jeepney Driver racks his coin dispenser like a sawed-off
 * shotgun and unloads a cone of peso shrapnel on a blast of wind. Fire-and-forget,
 * like spawnShockwaveRing: every element is a short-lived tween that self-destroys,
 * so the caller just spawns it and forgets it.
 *
 * The geometry (apex at x/y, `angle`, `length`, ±30° spread) mirrors the damage
 * hit-test in core/Skills.ts (isPointInCone with SKILL_CONE_HALF_ANGLE) so the
 * visual covers exactly what the skill hits.
 */
export interface CoinShotgunBlastConfig {
  /** Blast apex — the casting hero's position. */
  x: number;
  y: number;
  /** Aim direction in radians. */
  angle: number;
  /** Cone length px (matches the skill's coneLength). */
  length: number;
}

const HALF_ANGLE = SKILL_CONE_HALF_ANGLE;
const COIN_TINTS = [0xfacc15, 0xfde047, 0xeab308, 0xcbd5e1]; // gold shades + silver

export function spawnCoinShotgunBlast(scene: Phaser.Scene, cfg: CoinShotgunBlastConfig): void {
  const { x, y, angle, length } = cfg;
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);

  // Muzzle point: a little ahead of the hero, where the dispenser mouths sit.
  const muzzleX = x + cos * 60;
  const muzzleY = y + sin * 60;

  // --- Dispenser: draw it into the hero's hands, kick it back on fire, fade out ---
  const dispenser = scene.add.image(x, y, 'coin_dispenser');
  dispenser.setOrigin(0, 0.5);
  dispenser.setRotation(angle);
  dispenser.setDepth(44);
  // Size the dispenser so its barrel reaches a fraction of the way down the cone.
  const dispLen = Math.min(160, length * 0.4);
  dispenser.setScale(dispLen / dispenser.width);
  const baseScale = dispenser.scaleX;
  // The weapon is already raised: it recoils on the same frame the coins erupt (and the
  // blast SFX fires), so the kick, crack and shrapnel all land together. A tiny scale
  // overshoot on the recoil sells the punch without delaying the blast.
  scene.tweens.add({
    targets: dispenser,
    x: x - cos * 18,
    y: y - sin * 18,
    rotation: angle - 0.12,
    scaleX: baseScale * 1.06,
    scaleY: baseScale * 1.06,
    duration: 70,
    yoyo: true,
    ease: 'Quad.easeOut',
  });
  scene.tweens.add({
    targets: dispenser,
    alpha: 0,
    delay: 260,
    duration: 220,
    onComplete: () => dispenser.destroy(),
  });

  // --- Ground cone flash: warm gold fill under the wind, matches the hit cone ---
  spawnConeFlash(scene, {
    x, y, angle, length,
    color: 0xfacc15, alpha: 0.14,
    fadeMs: 320, ease: 'Power2',
  });

  // --- Muzzle flash: quick warm-white pop at the barrel ---
  spawnShockwaveRing(scene, {
    x: muzzleX, y: muzzleY,
    color: 0xfef9c3,
    startRadius: 6, endRadius: 46,
    durationMs: 140,
    fillAlpha: 0.85, strokeWidth: 0,
    blendMode: Phaser.BlendModes.ADD,
    depth: 43,
  });

  // --- Pressure rings: displaced air blowing out of the muzzle ---
  spawnShockwaveRing(scene, {
    x: muzzleX, y: muzzleY,
    color: 0xffffff,
    startRadius: 12, endRadius: 120,
    rings: 2, ringDelayMs: 80,
    durationMs: 380,
    strokeWidth: 4, strokeAlpha: 0.6, strokeWidthStep: 1.5,
    blendMode: Phaser.BlendModes.ADD,
    depth: 31,
  });

  // --- Wind gust: the cone-shaped air blast sweeping downrange ---
  const gust = scene.add.image(muzzleX, muzzleY, 'wind_gust');
  gust.setOrigin(0, 0.5);
  gust.setRotation(angle);
  gust.setDepth(32);
  gust.setBlendMode(Phaser.BlendModes.ADD);
  const gustFullScale = length / gust.width;
  gust.setScale(gustFullScale * 0.35, gustFullScale * 0.7);
  gust.setAlpha(0.9);
  scene.tweens.add({
    targets: gust,
    scaleX: gustFullScale,
    scaleY: gustFullScale,
    alpha: 0,
    duration: 360,
    ease: 'Cubic.easeOut',
    onComplete: () => gust.destroy(),
  });

  // --- Coin shrapnel: peso coins fired into the cone, spinning, landing, glinting ---
  const coinCount = 16;
  for (let i = 0; i < coinCount; i++) {
    const pAngle = angle + (Math.random() * 2 - 1) * HALF_ANGLE;
    const dist = length * (0.4 + Math.random() * 0.6);
    const travelMs = 250 + Math.random() * 150;
    const lingerMs = 1800 + Math.random() * 1000;
    const tint = COIN_TINTS[Math.floor(Math.random() * COIN_TINTS.length)];

    const coin = scene.add.image(muzzleX, muzzleY, 'coin');
    coin.setDepth(42);
    coin.setTint(tint);
    const coinScale = 0.4 + Math.random() * 0.3;
    coin.setScale(coinScale);
    coin.setRotation(Math.random() * Math.PI);

    const landX = muzzleX + Math.cos(pAngle) * dist;
    const landY = muzzleY + Math.sin(pAngle) * dist;

    // Flight: arc out with a fast spin.
    scene.tweens.add({
      targets: coin,
      x: landX,
      y: landY,
      rotation: coin.rotation + (Math.random() > 0.5 ? 1 : -1) * (6 + Math.random() * 6),
      duration: travelMs,
      ease: 'Cubic.easeOut',
      onComplete: () => {
        // Settle: a small squash on landing, then a brief glint, then fade out.
        scene.tweens.add({
          targets: coin,
          scaleY: coinScale * 0.7,
          duration: 90,
          yoyo: true,
          ease: 'Quad.easeOut',
        });
        scene.tweens.add({
          targets: coin,
          alpha: { from: 1, to: 0.55 },
          duration: 160,
          yoyo: true,
          repeat: 1,
          delay: 120,
        });
        scene.tweens.add({
          targets: coin,
          alpha: 0,
          delay: lingerMs,
          duration: 500,
          onComplete: () => coin.destroy(),
        });
      },
    });
  }

  // --- Impact feedback: a short recoil shake ---
  scene.cameras.main.shake(120, 0.004);
}
