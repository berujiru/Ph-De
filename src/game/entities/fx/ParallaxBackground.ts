import Phaser from 'phaser';
import { PARALLAX } from '../../data/level';

/**
 * The layered, scrolling backdrop for the rally battlefield.
 *
 * Each PARALLAX layer is a viewport-pinned TileSprite (setScrollFactor(0)) that
 * always covers the whole viewport. Depth comes from scrolling each layer's
 * texture at a different fraction of the camera's scrollX via tilePositionX —
 * far layers barely move, near layers nearly track the world. Because
 * TileSprites tile infinitely there are never seams or gaps regardless of how
 * far the camera has scrolled, and at scrollX 0 (sandbox's static camera) every
 * layer simply sits at tilePositionX 0, which still reads correctly.
 */
export class ParallaxBackground {
  private readonly layers: { sprite: Phaser.GameObjects.TileSprite; factor: number }[] = [];

  constructor(scene: Phaser.Scene, viewportWidth: number, viewportHeight: number) {
    for (const def of PARALLAX.layers) {
      const sprite = scene.add
        .tileSprite(0, 0, viewportWidth, viewportHeight, def.key)
        .setOrigin(0, 0)
        .setScrollFactor(0)
        .setDepth(def.depth);
      this.layers.push({ sprite, factor: def.factor });
    }
  }

  /** Call every frame with the camera's current scrollX (world px). */
  update(scrollX: number): void {
    for (const layer of this.layers) {
      layer.sprite.tilePositionX = scrollX * layer.factor;
    }
  }

  destroy(): void {
    for (const layer of this.layers) layer.sprite.destroy();
    this.layers.length = 0;
  }
}
