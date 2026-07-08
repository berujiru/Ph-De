import Phaser from 'phaser';
import { PARALLAX } from '../../data/level';

/**
 * The layered, scrolling backdrop for the rally battlefield.
 *
 * Each PARALLAX layer is a viewport-pinned TileSprite (setScrollFactor(0)) that
 * always covers the whole viewport. The tile is SCALED so exactly one copy of
 * the source texture fills the portrait viewport — the art is authored at the
 * viewport's 9:16 aspect and must never visibly repeat within a single screen.
 * Depth comes from scrolling each layer's texture at a different fraction of
 * the camera's scrollY via tilePositionY — far layers barely move, near layers
 * nearly track the world. TileSprites wrap the texture as it scrolls, so the
 * art is authored to be vertically seamless (continuous road, props clear of
 * the tile's top/bottom edges); the wrap period is a full screen height. At
 * scrollY 0 (sandbox's static camera) every layer sits at tilePositionY 0.
 *
 * When a `skinTextureKeys` array is provided (one key per PARALLAX layer, same
 * order), those keys are used instead of the default `bg-*` keys — letting each
 * stage render a different map backdrop. The keys must already be loaded in the
 * scene's texture cache (GameScene.preload does this).
 */
export class ParallaxBackground {
  private readonly layers: {
    sprite: Phaser.GameObjects.TileSprite;
    factor: number;
    /** Viewport px → texture px conversion for tilePositionY. */
    tileScaleY: number;
  }[] = [];

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
      // Stretch the tile so ONE copy of the texture covers the whole viewport
      // (art is authored at the same 9:16 aspect, so this is a uniform scale).
      const source = sprite.texture.getSourceImage();
      const tileScaleX = viewportWidth / source.width;
      const tileScaleY = viewportHeight / source.height;
      sprite.setTileScale(tileScaleX, tileScaleY);
      this.layers.push({ sprite, factor: def.factor, tileScaleY });
    }
  }

  /** Call every frame with the camera's current scrollY (world px). */
  update(scrollY: number): void {
    for (const layer of this.layers) {
      // tilePositionY is in TEXTURE pixels; divide by the tile scale so the
      // layer moves at `factor` of the camera in SCREEN pixels.
      layer.sprite.tilePositionY = (scrollY * layer.factor) / layer.tileScaleY;
    }
  }

  destroy(): void {
    for (const layer of this.layers) layer.sprite.destroy();
    this.layers.length = 0;
  }
}
