import Phaser from 'phaser';
import { attackArtKey, STYLE_DEFAULT_ART } from '../../data/attackArt';

/**
 * Visual half of a moving basic attack: one tinted image from the attack-art
 * registry (public/assets/attacks/), sized along +X and rotated to the flight
 * vector. The owning Attack keeps all movement and hit logic and drives this
 * via setPosition()/pointAlong()/update() — same contract as LaneWave.
 *
 * Art contract (docs/ART_AND_AUDIO_GUIDELINES.md): SVGs are authored
 * white/grayscale pointing +X, so `tint` (the resolved damage-type color)
 * multiplies cleanly into the final look.
 */
export interface AttackSpriteConfig {
  x: number;
  y: number;
  /** Registry texture key (`atk-<stem>`, see attackArtKey). */
  artKey: string;
  /** Resolved damage-type color — multiplies the white/grayscale art. */
  tint: number;
  /** Display width along the art's +X axis; height preserves aspect ratio. */
  lengthPx: number;
  /** Continuous tumble in degrees per second (boomerang/lobbed). */
  spinDegPerSec?: number;
  depth?: number;
  alpha?: number;
}

const warnedKeys = new Set<string>();

/** Resolve a possibly-missing texture key to one that exists (warn once). */
function safeArtKey(scene: Phaser.Scene, artKey: string): string {
  if (scene.textures.exists(artKey)) return artKey;
  if (!warnedKeys.has(artKey)) {
    warnedKeys.add(artKey);
    console.warn(`AttackSprite: missing texture "${artKey}", using style default`);
  }
  return attackArtKey(STYLE_DEFAULT_ART.projectile);
}

export class AttackSprite {
  readonly image: Phaser.GameObjects.Image;
  private spinDegPerSec: number;
  private baseScale = 1;

  constructor(scene: Phaser.Scene, cfg: AttackSpriteConfig) {
    this.image = scene.add.image(cfg.x, cfg.y, safeArtKey(scene, cfg.artKey));
    this.image.setTint(cfg.tint);
    this.setLength(cfg.lengthPx);
    if (cfg.depth !== undefined) this.image.setDepth(cfg.depth);
    if (cfg.alpha !== undefined) this.image.setAlpha(cfg.alpha);
    this.spinDegPerSec = cfg.spinDegPerSec ?? 0;
  }

  get x(): number { return this.image.x; }
  get y(): number { return this.image.y; }

  setPosition(x: number, y: number): void {
    this.image.setPosition(x, y);
  }

  /** Rotate the art's +X nose along the flight vector. */
  pointAlong(vx: number, vy: number): void {
    if (vx !== 0 || vy !== 0) this.image.setRotation(Math.atan2(vy, vx));
  }

  /** Resize along +X, preserving the source aspect ratio (radius upgrades). */
  setLength(px: number): void {
    this.baseScale = px / this.image.width;
    this.image.setScale(this.baseScale);
  }

  /** Uniform scale bump on top of the length scale (lobbed arc "height"). */
  flightScale(s: number): void {
    this.image.setScale(this.baseScale * s);
  }

  /** Advance the tumble; call from the owning Attack's update. */
  update(delta: number): void {
    if (this.spinDegPerSec !== 0) {
      this.image.angle += this.spinDegPerSec * (delta / 1000);
    }
  }

  destroy(): void {
    this.image.destroy();
  }
}

/**
 * One-shot impact/muzzle icon: spawns the tinted art at (x,y), pops the scale
 * up while fading out, then self-destroys. Used by chain strikes and beam
 * muzzle/impact flashes, where the per-hero art is an accent, not the body.
 */
export function popAttackIcon(
  scene: Phaser.Scene,
  x: number,
  y: number,
  artKey: string,
  tint: number,
  sizePx = 48,
  durationMs = 150,
): void {
  const icon = scene.add.image(x, y, safeArtKey(scene, artKey));
  icon.setTint(tint);
  const scale = sizePx / icon.width;
  icon.setScale(scale * 0.6);
  scene.tweens.add({
    targets: icon,
    scale: scale * 1.15,
    alpha: 0,
    duration: durationMs,
    ease: 'Quad.easeOut',
    onComplete: () => icon.destroy(),
  });
}
