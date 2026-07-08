import Phaser from 'phaser';
import { PARALLAX } from '../../data/level';

/**
 * The layered, scrolling backdrop for the rally battlefield.
 *
 * Each PARALLAX layer is a viewport-pinned TileSprite (setScrollFactor(0)) that
 * always covers the whole viewport. Depth comes from scrolling each layer's
 * texture at a different fraction of the camera's scrollY via tilePositionY —
 * far layers barely move, near layers nearly track the world. Because
 * TileSprites tile infinitely there are never seams or gaps regardless of how
 * far the camera has scrolled, and at scrollY 0 (sandbox's static camera) every
 * layer simply sits at tilePositionY 0, which still reads correctly.
 *
 * When a `skinTextureKeys` array is provided (one key per PARALLAX layer, same
 * order), those keys are used instead of the default `bg-*` keys — letting each
 * stage render a different map backdrop. The keys must already be loaded in the
 * scene's texture cache (GameScene.preload does this).
 */
export class ParallaxBackground {
  private readonly layers: { sprite: Phaser.GameObjects.TileSprite; factor: number }[] = [];

  /**
   * @param skinTextureKeys Optional per-layer texture keys matching
   *   `PARALLAX.layers` order (sky, skyline, street, foreground). When omitted
   *   the default `bg-*` keys are used (backward-compatible with sandbox and
   *   any stage that hasn't been assigned a skin yet).
   */
  constructor(
    scene: Phaser.Scene,
    viewportWidth: number,
    viewportHeight: number,
    skinTextureKeys?: string[],
  ) {
    for (let i = 0; i < PARALLAX.layers.length; i++) {
      const def = PARALLAX.layers[i];
      const textureKey = skinTextureKeys?.[i] ?? def.key;
      const sprite = scene.add
        .tileSprite(0, 0, viewportWidth, viewportHeight, textureKey)
        .setOrigin(0, 0)
        .setScrollFactor(0)
        .setDepth(def.depth);
      this.layers.push({ sprite, factor: def.factor });
    }
  }

  /** Call every frame with the camera's current scrollY (world px). */
  update(scrollY: number): void {
    for (const layer of this.layers) {
      layer.sprite.tilePositionY = scrollY * layer.factor;
    }
  }

  destroy(): void {
    for (const layer of this.layers) layer.sprite.destroy();
    this.layers.length = 0;
  }
}
