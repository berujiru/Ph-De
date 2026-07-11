import Phaser from 'phaser';
import { HERO_DEFINITIONS, type HeroId } from '../data/heroes';
import { ENEMY_DEFINITIONS } from '../data/enemies';
import { getSelectedSkin } from '../data/skinSelection';

/**
 * Build `${skin.id}-<state>` animations for every hero whose selected skin
 * sheet actually loaded, from the skin's declared frame ranges
 * (src/game/data/skins.ts). Heroes without a skin (or whose sheet failed to
 * load) simply have no animations, so HeroModel keeps its tween placeholders.
 * Loops (idle/march) repeat; one-shots (attack/cast) play once — attack is
 * additionally time-scaled to attackRateMs at play time by HeroModel.
 */
export function createHeroAnimations(scene: Phaser.Scene): void {
  for (const heroId of Object.keys(HERO_DEFINITIONS) as HeroId[]) {
    const skin = getSelectedSkin(heroId);
    if (!skin || !scene.textures.exists(skin.id)) continue;
    for (const [state, cfg] of Object.entries(skin.states)) {
      if (!cfg) continue;
      const animKey = `${skin.id}-${state}`;
      if (scene.anims.exists(animKey)) continue;
      scene.anims.create({
        key: animKey,
        frames: scene.anims.generateFrameNumbers(skin.id, {
          start: cfg.from,
          end: cfg.from + cfg.frames - 1,
        }),
        frameRate: cfg.frameRate ?? 10,
        repeat: state === 'idle' || state === 'march' ? -1 : 0,
      });
    }
  }
}

/** Same as createHeroAnimations(), for enemies (top-front sprite sheets). */
export function createEnemyAnimations(scene: Phaser.Scene): void {
  createAtlasAnimations(scene, Object.values(ENEMY_DEFINITIONS).map(d => d.spriteKey ?? d.id));

  // Custom manual sprite sheet configuration for Grunt
  if (scene.textures.exists('grunt') && !scene.anims.exists('grunt-march')) {
    scene.anims.create({
      key: 'grunt-march',
      frames: scene.anims.generateFrameNumbers('grunt', { start: 0, end: 23 }),
      frameRate: 10,
      repeat: -1,
    });
    scene.anims.create({
      key: 'grunt-attack',
      frames: scene.anims.generateFrameNumbers('grunt', { start: 24, end: 36 }),
      frameRate: 10,
      repeat: 0,
    });
    scene.anims.create({
      key: 'grunt-death',
      frames: scene.anims.generateFrameNumbers('grunt', { start: 54, end: 71 }),
      frameRate: 10,
      repeat: 0,
    });
  }

  // Custom manual sprite sheet configuration for Ghost Flood Control
  if (scene.textures.exists('boss_flood_control') && !scene.anims.exists('boss_flood_control-march')) {
    scene.anims.create({
      key: 'boss_flood_control-march',
      frames: scene.anims.generateFrameNumbers('boss_flood_control', { start: 0, end: 30 }),
      frameRate: 10,
      repeat: -1,
    });
    scene.anims.create({
      key: 'boss_flood_control-attack',
      frames: scene.anims.generateFrameNumbers('boss_flood_control', { start: 31, end: 41 }),
      frameRate: 10,
      repeat: 0,
    });
    scene.anims.create({
      key: 'boss_flood_control-cast',
      frames: scene.anims.generateFrameNumbers('boss_flood_control', { start: 31, end: 41 }),
      frameRate: 10,
      repeat: 0,
    });
    scene.anims.create({
      key: 'boss_flood_control-death',
      frames: scene.anims.generateFrameNumbers('boss_flood_control', { start: 61, end: 71 }),
      frameRate: 10,
      repeat: 0,
    });
  }
}

/** Manually generate animations for sprite sheets without a JSON atlas. */
export function createCutInAnimations(scene: Phaser.Scene): void {
  Object.values(HERO_DEFINITIONS).forEach((hero) => {
    if (hero.portraitKey && hero.cutInAnim) {
      const animKey = `${hero.portraitKey}-anim`;
      if (scene.textures.exists(hero.portraitKey) && !scene.anims.exists(animKey)) {
        scene.anims.create({
          key: animKey,
          frames: scene.anims.generateFrameNumbers(hero.portraitKey, { start: 0, end: hero.cutInAnim.frames - 1 }),
        });
      }
    }
  });
}

/**
 * Build **namespaced** tag animations (`${key}-<tag>`) for any of these atlas
 * keys that loaded. We can't use `createFromAseprite`, which names animations
 * by bare tag (`idle`, `march`…) — every character shares the tags `idle`,
 * `attack`, etc., so those would collide, and the model plays `${key}-<tag>`.
 * So we read the Aseprite JSON's frameTags and create one prefixed animation
 * per tag from the atlas frames (named by their `filename`, e.g. `idle 0`).
 */
function createAtlasAnimations(scene: Phaser.Scene, keys: string[]): void {
  for (const key of keys) {
    if (!scene.textures.exists(key)) continue;
    const data = scene.cache.json.get(key) as {
      frames?: { filename: string }[];
      meta?: { frameTags?: { name: string; from: number; to: number }[] };
    } | undefined;
    const tags = data?.meta?.frameTags;
    const frameList = data?.frames;
    if (!tags || !frameList) continue; // plain image, not an Aseprite atlas

    for (const tag of tags) {
      const animKey = `${key}-${tag.name}`;
      if (scene.anims.exists(animKey)) continue;
      const frames: Phaser.Types.Animations.AnimationFrame[] = [];
      for (let i = tag.from; i <= tag.to; i++) {
        const name = frameList[i]?.filename;
        if (name !== undefined) frames.push({ key, frame: name });
      }
      if (frames.length === 0) continue;
      // Loop by default; one-shot states (attack/cast/death) override repeat at play time.
      scene.anims.create({ key: animKey, frames, frameRate: 10, repeat: -1 });
    }
  }
}

export function setupGameAnimations(scene: Phaser.Scene): void {
  createHeroAnimations(scene);
  createEnemyAnimations(scene);
  createCutInAnimations(scene);
}
