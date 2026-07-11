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
      frames: scene.anims.generateFrameNumbers('grunt', { start: 0, end: 17 }),
      frameRate: 10,
      repeat: -1,
    });
    scene.anims.create({
      key: 'grunt-attack',
      frames: scene.anims.generateFrameNumbers('grunt', { start: 26, end: 34 }),
      frameRate: 10,
      repeat: 0,
    });
    scene.anims.create({
      key: 'grunt-death',
      frames: scene.anims.generateFrameNumbers('grunt', { start: 57, end: 70 }),
      frameRate: 10,
      repeat: 0,
    });
  }

  // Custom manual sprite sheet configuration for Runner
  if (scene.textures.exists('runner') && !scene.anims.exists('runner-march')) {
    scene.anims.create({
      key: 'runner-march',
      frames: scene.anims.generateFrameNumbers('runner', { start: 0, end: 22 }),
      frameRate: 10,
      repeat: -1,
    });
    scene.anims.create({
      key: 'runner-attack',
      frames: scene.anims.generateFrameNumbers('runner', { start: 24, end: 31 }),
      frameRate: 10,
      repeat: 0,
    });
    scene.anims.create({
      key: 'runner-death',
      frames: scene.anims.generateFrameNumbers('runner', { start: 45, end: 66 }),
      frameRate: 10,
      repeat: 0,
    });
  }

  // Custom manual sprite sheet configuration for Brute
  if (scene.textures.exists('brute') && !scene.anims.exists('brute-march')) {
    scene.anims.create({
      key: 'brute-march',
      frames: scene.anims.generateFrameNumbers('brute', { start: 0, end: 18 }),
      frameRate: 10,
      repeat: -1,
    });
    scene.anims.create({
      key: 'brute-attack',
      frames: scene.anims.generateFrameNumbers('brute', { start: 24, end: 37 }),
      frameRate: 10,
      repeat: 0,
    });
    scene.anims.create({
      key: 'brute-death',
      frames: scene.anims.generateFrameNumbers('brute', { start: 40, end: 57 }),
      frameRate: 10,
      repeat: 0,
    });
  }

  // Custom manual sprite sheet configuration for Bribery
  if (scene.textures.exists('bribery') && !scene.anims.exists('bribery-march')) {
    scene.anims.create({
      key: 'bribery-march',
      frames: scene.anims.generateFrameNumbers('bribery', { start: 1, end: 18 }),
      frameRate: 10,
      repeat: -1,
    });
    scene.anims.create({
      key: 'bribery-attack',
      frames: scene.anims.generateFrameNumbers('bribery', { start: 24, end: 46 }),
      frameRate: 10,
      repeat: 0,
    });
    scene.anims.create({
      key: 'bribery-death',
      frames: scene.anims.generateFrameNumbers('bribery', { start: 58, end: 74 }),
      frameRate: 10,
      repeat: 0,
    });
  }

  // Custom manual sprite sheet configuration for Crony
  if (scene.textures.exists('crony_bodyguard') && !scene.anims.exists('crony_bodyguard-march')) {
    scene.anims.create({
      key: 'crony_bodyguard-march',
      frames: scene.anims.generateFrameNumbers('crony_bodyguard', { start: 0, end: 23 }),
      frameRate: 10,
      repeat: -1,
    });
    scene.anims.create({
      key: 'crony_bodyguard-attack',
      frames: scene.anims.generateFrameNumbers('crony_bodyguard', { start: 24, end: 31 }),
      frameRate: 10,
      repeat: 0,
    });
    scene.anims.create({
      key: 'crony_bodyguard-death',
      frames: scene.anims.generateFrameNumbers('crony_bodyguard', { start: 57, end: 69 }),
      frameRate: 10,
      repeat: 0,
    });
  }

  // Custom manual sprite sheet configuration for Epal
  if (scene.textures.exists('epal') && !scene.anims.exists('epal-march')) {
    scene.anims.create({
      key: 'epal-march',
      frames: scene.anims.generateFrameNumbers('epal', { start: 1, end: 12 }),
      frameRate: 10,
      repeat: -1,
    });
    scene.anims.create({
      key: 'epal-attack',
      frames: scene.anims.generateFrameNumbers('epal', { start: 19, end: 30 }),
      frameRate: 10,
      repeat: 0,
    });
    scene.anims.create({
      key: 'epal-death',
      frames: scene.anims.generateFrameNumbers('epal', { start: 57, end: 74 }),
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
      repeat: -1,
    });
    scene.anims.create({
      key: 'boss_flood_control-cast',
      frames: scene.anims.generateFrameNumbers('boss_flood_control', { start: 31, end: 41 }),
      frameRate: 10,
      repeat: -1,
    });
    scene.anims.create({
      key: 'boss_flood_control-death',
      frames: scene.anims.generateFrameNumbers('boss_flood_control', { start: 61, end: 71 }),
      frameRate: 10,
      repeat: 0,
    });
  }

  // Custom manual sprite sheet configuration for Budget Insertion
  if (scene.textures.exists('boss_budget_insertion') && !scene.anims.exists('boss_budget_insertion-march')) {
    scene.anims.create({
      key: 'boss_budget_insertion-march',
      frames: scene.anims.generateFrameNumbers('boss_budget_insertion', { start: 0, end: 23 }),
      frameRate: 10,
      repeat: -1,
    });
    scene.anims.create({
      key: 'boss_budget_insertion-attack',
      frames: scene.anims.generateFrameNumbers('boss_budget_insertion', { start: 24, end: 49 }),
      frameRate: 10,
      repeat: -1,
    });
    scene.anims.create({
      key: 'boss_budget_insertion-cast',
      frames: scene.anims.generateFrameNumbers('boss_budget_insertion', { start: 24, end: 49 }),
      frameRate: 10,
      repeat: -1,
    });
    scene.anims.create({
      key: 'boss_budget_insertion-death',
      frames: scene.anims.generateFrameNumbers('boss_budget_insertion', { start: 49, end: 61 }),
      frameRate: 10,
      repeat: 0,
    });
  }

  // Custom manual sprite sheet configuration for Smuggling
  if (scene.textures.exists('boss_smuggling') && !scene.anims.exists('boss_smuggling-march')) {
    scene.anims.create({
      key: 'boss_smuggling-march',
      frames: scene.anims.generateFrameNumbers('boss_smuggling', { start: 0, end: 26 }),
      frameRate: 10,
      repeat: -1,
    });
    scene.anims.create({
      key: 'boss_smuggling-attack',
      frames: scene.anims.generateFrameNumbers('boss_smuggling', { start: 27, end: 51 }),
      frameRate: 10,
      repeat: -1,
    });
    scene.anims.create({
      key: 'boss_smuggling-cast',
      frames: scene.anims.generateFrameNumbers('boss_smuggling', { start: 27, end: 51 }),
      frameRate: 10,
      repeat: -1,
    });
    scene.anims.create({
      key: 'boss_smuggling-death',
      frames: scene.anims.generateFrameNumbers('boss_smuggling', { start: 52, end: 65 }),
      frameRate: 10,
      repeat: 0,
    });
  }

  // Custom manual sprite sheet configuration for Ang Sistema
  if (scene.textures.exists('boss_ang_sistema') && !scene.anims.exists('boss_ang_sistema-march')) {
    scene.anims.create({
      key: 'boss_ang_sistema-march',
      frames: scene.anims.generateFrameNumbers('boss_ang_sistema', { start: 0, end: 25 }),
      frameRate: 10,
      repeat: -1,
    });
    scene.anims.create({
      key: 'boss_ang_sistema-attack',
      frames: scene.anims.generateFrameNumbers('boss_ang_sistema', { start: 26, end: 52 }),
      frameRate: 20,
      repeat: -1,
    });
    scene.anims.create({
      key: 'boss_ang_sistema-cast',
      frames: scene.anims.generateFrameNumbers('boss_ang_sistema', { start: 26, end: 52 }),
      frameRate: 20,
      repeat: -1,
    });
    scene.anims.create({
      key: 'boss_ang_sistema-death',
      frames: scene.anims.generateFrameNumbers('boss_ang_sistema', { start: 53, end: 74 }),
      frameRate: 10,
      repeat: 0,
    });
  }

  // Custom manual sprite sheet configuration for Troll Farm
  if (scene.textures.exists('boss_troll_farm') && !scene.anims.exists('boss_troll_farm-march')) {
    scene.anims.create({
      key: 'boss_troll_farm-march',
      frames: scene.anims.generateFrameNumbers('boss_troll_farm', { start: 0, end: 26 }),
      frameRate: 10,
      repeat: -1,
    });
    scene.anims.create({
      key: 'boss_troll_farm-attack',
      frames: scene.anims.generateFrameNumbers('boss_troll_farm', { start: 27, end: 51 }),
      frameRate: 10,
      repeat: -1,
    });
    scene.anims.create({
      key: 'boss_troll_farm-cast',
      frames: scene.anims.generateFrameNumbers('boss_troll_farm', { start: 27, end: 51 }),
      frameRate: 10,
      repeat: -1,
    });
    scene.anims.create({
      key: 'boss_troll_farm-death',
      frames: scene.anims.generateFrameNumbers('boss_troll_farm', { start: 52, end: 74 }),
      frameRate: 10,
      repeat: 0,
    });
  }

  // Custom manual sprite sheet configuration for Wang-Wang
  if (scene.textures.exists('boss_wang_wang') && !scene.anims.exists('boss_wang_wang-march')) {
    scene.anims.create({
      key: 'boss_wang_wang-march',
      frames: scene.anims.generateFrameNumbers('boss_wang_wang', { start: 0, end: 26 }),
      frameRate: 10,
      repeat: -1,
    });
    scene.anims.create({
      key: 'boss_wang_wang-attack',
      frames: scene.anims.generateFrameNumbers('boss_wang_wang', { start: 27, end: 51 }),
      frameRate: 10,
      repeat: -1,
    });
    scene.anims.create({
      key: 'boss_wang_wang-cast',
      frames: scene.anims.generateFrameNumbers('boss_wang_wang', { start: 27, end: 51 }),
      frameRate: 10,
      repeat: -1,
    });
    scene.anims.create({
      key: 'boss_wang_wang-death',
      frames: scene.anims.generateFrameNumbers('boss_wang_wang', { start: 52, end: 72 }),
      frameRate: 10,
      repeat: 0,
    });
  }

  // Custom manual sprite sheet configuration for Dynasty Bosses
  if (scene.textures.exists('boss_dynasty') && !scene.anims.exists('boss_dynasty-march')) {
    scene.anims.create({
      key: 'boss_dynasty-march',
      frames: scene.anims.generateFrameNumbers('boss_dynasty', { start: 0, end: 25 }),
      frameRate: 10,
      repeat: -1,
    });
    scene.anims.create({
      key: 'boss_dynasty-attack',
      frames: scene.anims.generateFrameNumbers('boss_dynasty', { start: 27, end: 52 }),
      frameRate: 10,
      repeat: -1,
    });
    scene.anims.create({
      key: 'boss_dynasty-cast',
      frames: scene.anims.generateFrameNumbers('boss_dynasty', { start: 27, end: 52 }),
      frameRate: 10,
      repeat: -1,
    });
    scene.anims.create({
      key: 'boss_dynasty-death',
      frames: scene.anims.generateFrameNumbers('boss_dynasty', { start: 53, end: 64 }),
      frameRate: 10,
      repeat: 0,
    });
  }

  // Custom manual sprite sheet configuration for Pork Barrel
  if (scene.textures.exists('boss_pork_barrel') && !scene.anims.exists('boss_pork_barrel-march')) {
    scene.anims.create({
      key: 'boss_pork_barrel-march',
      frames: scene.anims.generateFrameNumbers('boss_pork_barrel', { start: 0, end: 27 }),
      frameRate: 10,
      repeat: -1,
    });
    scene.anims.create({
      key: 'boss_pork_barrel-attack',
      frames: scene.anims.generateFrameNumbers('boss_pork_barrel', { start: 32, end: 40 }),
      frameRate: 10,
      repeat: -1,
    });
    scene.anims.create({
      key: 'boss_pork_barrel-cast',
      frames: scene.anims.generateFrameNumbers('boss_pork_barrel', { start: 32, end: 40 }),
      frameRate: 10,
      repeat: -1,
    });
    scene.anims.create({
      key: 'boss_pork_barrel-death',
      frames: scene.anims.generateFrameNumbers('boss_pork_barrel', { start: 56, end: 79 }),
      frameRate: 10,
      repeat: 0,
    });
  }

  // Custom manual sprite sheet configuration for Vote Buying
  if (scene.textures.exists('boss_vote_buying') && !scene.anims.exists('boss_vote_buying-march')) {
    scene.anims.create({
      key: 'boss_vote_buying-march',
      frames: scene.anims.generateFrameNumbers('boss_vote_buying', { start: 0, end: 25 }),
      frameRate: 10,
      repeat: -1,
    });
    scene.anims.create({
      key: 'boss_vote_buying-attack',
      frames: scene.anims.generateFrameNumbers('boss_vote_buying', { start: 26, end: 55 }),
      frameRate: 10,
      repeat: -1,
    });
    scene.anims.create({
      key: 'boss_vote_buying-cast',
      frames: scene.anims.generateFrameNumbers('boss_vote_buying', { start: 26, end: 55 }),
      frameRate: 10,
      repeat: -1,
    });
    scene.anims.create({
      key: 'boss_vote_buying-death',
      frames: scene.anims.generateFrameNumbers('boss_vote_buying', { start: 59, end: 73 }),
      frameRate: 10,
      repeat: 0,
    });
  }

  // Custom manual sprite sheet configuration for Nepotism
  if (scene.textures.exists('boss_nepotism') && !scene.anims.exists('boss_nepotism-march')) {
    scene.anims.create({
      key: 'boss_nepotism-march',
      frames: scene.anims.generateFrameNumbers('boss_nepotism', { start: 0, end: 26 }),
      frameRate: 10,
      repeat: -1,
    });
    scene.anims.create({
      key: 'boss_nepotism-attack',
      frames: scene.anims.generateFrameNumbers('boss_nepotism', { start: 26, end: 52 }),
      frameRate: 10,
      repeat: -1,
    });
    scene.anims.create({
      key: 'boss_nepotism-cast',
      frames: scene.anims.generateFrameNumbers('boss_nepotism', { start: 26, end: 52 }),
      frameRate: 10,
      repeat: -1,
    });
    scene.anims.create({
      key: 'boss_nepotism-death',
      frames: scene.anims.generateFrameNumbers('boss_nepotism', { start: 53, end: 71 }),
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
