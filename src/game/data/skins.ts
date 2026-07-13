import type { HeroId } from './heroes';

/**
 * Hero skins — data-driven battle sprites.
 *
 * Each skin is ONE combined spritesheet holding every gameplay state
 * (`idle / march / attack / cast`) **plus a dedicated front-face portrait
 * cell** used by the DOM UI (Archive cards, drop cards, briefing). The skill
 * cut-in stays a separate isolated sheet per hero (`portraitKey`/`cutInAnim`
 * in balance.ts) — skins do not change it.
 *
 * How it flows:
 * - `GameScene.preload()` loads the *selected* skin sheet per hero under the
 *   texture key `skin.id`.
 * - `GameScene.createHeroAnimations()` builds `${skin.id}-${state}` from
 *   `states` below (linear frame ranges — `from` + `frames`).
 * - `Hero`/`HeroModel` render via that key, so swapping a skin only swaps
 *   which texture/anims the model plays. Selection lives in
 *   `skinSelection.ts` (localStorage) and applies on the next battle.
 * - The UI crops `portraitFrame` out of the same sheet with CSS
 *   (`SkinPortrait` in src/ui/components/ArchiveCards.tsx).
 */

/** One state's frame range within the combined sheet (linear frame indices). */
export interface SkinStateAnim {
  /** First frame index in the sheet (row-major: index = row * columns + col). */
  from: number;
  /** How many frames the state plays. */
  frames: number;
  /** Playback rate; defaults to 10 fps (the project-wide loop standard). */
  frameRate?: number;
}

export interface HeroSkin {
  /**
   * Unique key — used as the Phaser texture key AND the animation prefix
   * (`${id}-idle`, `${id}-march`, …). The default skin conventionally uses the
   * hero id; variants append a suffix (e.g. `eden_streetwear`).
   */
  id: string;
  heroId: HeroId;
  /** Display name shown in the Archive skin picker. */
  name: string;
  /** Public URL of the combined sheet, e.g. '/assets/heroes/eden.png'. */
  sheet: string;
  frameWidth: number;
  frameHeight: number;
  /** Frames per row — needed for the CSS portrait crop. */
  columns: number;
  /** Total cells in the grid (rows = ceil(totalFrames / columns)). */
  totalFrames: number;
  /** Cell index of the FRONT-FACING portrait used for DOM previews. */
  portraitFrame: number;
  /**
   * Gameplay states. `idle` is optional — the engine rests on `attack`'s
   * first frame when missing (see HeroModel.applyRestingFrame). `march`
   * covers walk AND run (run plays it ~1.5× faster).
   */
  states: {
    idle?: SkinStateAnim;
    march: SkinStateAnim;
    attack: SkinStateAnim;
    cast: SkinStateAnim;
  };
}

/**
 * All shipped skins, keyed by hero. Index 0 is the default skin. Heroes with
 * no entry render the tinted `hero-base` placeholder exactly as before.
 */
export const HERO_SKINS: Partial<Record<HeroId, HeroSkin[]>> = {
  eden: [
    {
      id: 'eden',
      heroId: 'eden',
      name: 'Default',
      // Combined sheet (replaces the old separate eden_walk/attack/cast.png).
      // Layout (256px cells, 8 per row, 19 rows total = 152 frames):
      // attack: rows 1-5 (frames 0-37, 38 frames)
      // idle: rows 6-14 (frames 40-107, 68 frames)
      // march: rows 15-16 (frames 112-127, 16 frames)
      // cast: rows 17-19 (frames 128-149, 22 frames)
      sheet: '/assets/heroes/eden_spritesheet.png',
      frameWidth: 256,
      frameHeight: 256,
      columns: 8,
      totalFrames: 152,
      portraitFrame: 40,
      states: {
        idle: { from: 40, frames: 68 },
        march: { from: 112, frames: 16 },
        attack: { from: 0, frames: 38, frameRate: 30 },
        cast: { from: 128, frames: 22, frameRate: 20 },
      },
    },
  ],
  baker: [
    {
      id: 'baker',
      heroId: 'baker',
      name: 'Default',
      sheet: '/assets/heroes/baker_sprite.png',
      frameWidth: 256,
      frameHeight: 256,
      columns: 8,
      totalFrames: 23,
      portraitFrame: 0,
      states: {
        march: { from: 0, frames: 1 },
        attack: { from: 0, frames: 23, frameRate: 30 },
        cast: { from: 0, frames: 1 },
      },
    },
  ],
  call_center_agent: [
    {
      id: 'call_center_agent',
      heroId: 'call_center_agent',
      name: 'Default',
      sheet: '/assets/heroes/call_center_agent_sprite.png',
      frameWidth: 256,
      frameHeight: 256,
      columns: 8,
      totalFrames: 34,
      portraitFrame: 0,
      states: {
        march: { from: 0, frames: 1 },
        attack: { from: 0, frames: 34, frameRate: 30 },
        cast: { from: 0, frames: 1 },
      },
    },
  ],
  delivery_rider: [
    {
      id: 'delivery_rider',
      heroId: 'delivery_rider',
      name: 'Default',
      sheet: '/assets/heroes/delivery_rider_sprite.png',
      frameWidth: 256,
      frameHeight: 256,
      columns: 8,
      totalFrames: 37,
      portraitFrame: 0,
      states: {
        march: { from: 0, frames: 1 },
        attack: { from: 0, frames: 37, frameRate: 30 },
        cast: { from: 0, frames: 1 },
      },
    },
  ],
  electrician: [
    {
      id: 'electrician',
      heroId: 'electrician',
      name: 'Default',
      sheet: '/assets/heroes/electrician_sprite.png',
      frameWidth: 256,
      frameHeight: 256,
      columns: 8,
      totalFrames: 40,
      portraitFrame: 0,
      states: {
        march: { from: 0, frames: 1 },
        attack: { from: 0, frames: 40, frameRate: 30 },
        cast: { from: 0, frames: 1 },
      },
    },
  ],
  farmer: [
    {
      id: 'farmer',
      heroId: 'farmer',
      name: 'Default',
      sheet: '/assets/heroes/farmer_sprite.png',
      frameWidth: 256,
      frameHeight: 256,
      columns: 8,
      totalFrames: 35,
      portraitFrame: 0,
      states: {
        march: { from: 0, frames: 1 },
        attack: { from: 0, frames: 35, frameRate: 30 },
        cast: { from: 0, frames: 1 },
      },
    },
  ],
  plumber: [
    {
      id: 'plumber',
      heroId: 'plumber',
      name: 'Default',
      sheet: '/assets/heroes/plumber_sprite.png',
      frameWidth: 256,
      frameHeight: 256,
      columns: 8,
      totalFrames: 34,
      portraitFrame: 0,
      states: {
        march: { from: 0, frames: 1 },
        attack: { from: 0, frames: 34, frameRate: 30 },
        cast: { from: 0, frames: 1 },
      },
    },
  ],
  sorbetes_vendor: [
    {
      id: 'sorbetes_vendor',
      heroId: 'sorbetes_vendor',
      name: 'Default',
      sheet: '/assets/heroes/sorbetes_vendor_sprite.png',
      frameWidth: 256,
      frameHeight: 256,
      columns: 8,
      totalFrames: 30,
      portraitFrame: 0,
      states: {
        march: { from: 0, frames: 1 },
        attack: { from: 0, frames: 30, frameRate: 30 },
        cast: { from: 0, frames: 1 },
      },
    },
  ],
  traffic_enforcer: [
    {
      id: 'traffic_enforcer',
      heroId: 'traffic_enforcer',
      name: 'Default',
      sheet: '/assets/heroes/traffic_enforcer_sprite.png',
      frameWidth: 256,
      frameHeight: 256,
      columns: 8,
      totalFrames: 21,
      portraitFrame: 0,
      states: {
        march: { from: 0, frames: 1 },
        attack: { from: 0, frames: 21, frameRate: 30 },
        cast: { from: 0, frames: 1 },
      },
    },
  ],
  fisherfolk: [
    {
      id: 'fisherfolk',
      heroId: 'fisherfolk',
      name: 'Default',
      sheet: '/assets/heroes/fisher_folk_sprite.png',
      frameWidth: 256,
      frameHeight: 256,
      columns: 8,
      totalFrames: 28,
      portraitFrame: 0,
      states: {
        march: { from: 0, frames: 1 },
        attack: { from: 0, frames: 28, frameRate: 15 },
        cast: { from: 0, frames: 1 },
      },
    },
  ],
  fishball_vendor: [
    {
      id: 'fishball_vendor',
      heroId: 'fishball_vendor',
      name: 'Default',
      sheet: '/assets/heroes/fishball_vendor_sprite.png',
      frameWidth: 256,
      frameHeight: 256,
      columns: 8,
      totalFrames: 34,
      portraitFrame: 0,
      states: {
        march: { from: 0, frames: 1 },
        attack: { from: 0, frames: 34, frameRate: 30 },
        cast: { from: 0, frames: 1 },
      },
    },
  ],
  construction_worker: [
    {
      id: 'construction_worker',
      heroId: 'construction_worker',
      name: 'Default',
      sheet: '/assets/heroes/construction_worker_sprite.png',
      frameWidth: 256,
      frameHeight: 256,
      columns: 8,
      totalFrames: 34,
      portraitFrame: 0,
      states: {
        march: { from: 0, frames: 1 },
        attack: { from: 0, frames: 34, frameRate: 10 },
        cast: { from: 0, frames: 1 },
      },
    },
  ],
  jeepney_driver: [
    {
      id: 'jeepney_driver',
      heroId: 'jeepney_driver',
      name: 'Default',
      sheet: '/assets/heroes/jeepney_driver_sprite.png',
      frameWidth: 256,
      frameHeight: 256,
      columns: 8,
      totalFrames: 56,
      portraitFrame: 0,
      states: {
        march: { from: 0, frames: 1 },
        attack: { from: 10, frames: 55, frameRate: 30 },
        cast: { from: 0, frames: 1 },
      },
    },
  ],
  sales_lady: [
    {
      id: 'sales_lady',
      heroId: 'sales_lady',
      name: 'Default',
      sheet: '/assets/heroes/sales_lady_sprite.png',
      frameWidth: 256,
      frameHeight: 256,
      columns: 8,
      totalFrames: 48,
      portraitFrame: 0,
      states: {
        march: { from: 0, frames: 1 },
        attack: { from: 0, frames: 48, frameRate: 30 },
        cast: { from: 0, frames: 1 },
      },
    },
  ],
  nurse: [
    {
      id: 'nurse',
      heroId: 'nurse',
      name: 'Default',
      sheet: '/assets/heroes/nurse_sprite.png',
      frameWidth: 256,
      frameHeight: 256,
      columns: 8,
      totalFrames: 56,
      portraitFrame: 0,
      states: {
        march: { from: 0, frames: 1 },
        attack: { from: 0, frames: 56, frameRate: 30 },
        cast: { from: 0, frames: 1 },
      },
    },
  ],
  taho_vendor: [
    {
      id: 'taho_vendor',
      heroId: 'taho_vendor',
      name: 'Default',
      sheet: '/assets/heroes/taho_vendor_sprite.png',
      frameWidth: 256,
      frameHeight: 256,
      columns: 8,
      totalFrames: 27,
      portraitFrame: 0,
      states: {
        march: { from: 0, frames: 1 },
        attack: { from: 0, frames: 27, frameRate: 30 },
        cast: { from: 0, frames: 1 },
      },
    },
  ],
  street_sweeper: [
    {
      id: 'street_sweeper',
      heroId: 'street_sweeper',
      name: 'Default',
      sheet: '/assets/heroes/street_sweeper_sprite.png',
      frameWidth: 256,
      frameHeight: 256,
      columns: 8,
      totalFrames: 27,
      portraitFrame: 0,
      states: {
        march: { from: 0, frames: 1 },
        attack: { from: 0, frames: 27, frameRate: 15 },
        cast: { from: 0, frames: 1 },
      },
    },
  ],
  security_guard: [
    {
      id: 'security_guard',
      heroId: 'security_guard',
      name: 'Default',
      sheet: '/assets/heroes/security_guard_sprite.png',
      frameWidth: 256,
      frameHeight: 256,
      columns: 8,
      totalFrames: 24,
      portraitFrame: 0,
      states: {
        march: { from: 0, frames: 1 },
        attack: { from: 0, frames: 24, frameRate: 30 },
        cast: { from: 0, frames: 1 },
      },
    },
  ],
  student: [
    {
      id: 'student',
      heroId: 'student',
      name: 'Default',
      sheet: '/assets/heroes/student_sprite.png',
      frameWidth: 256,
      frameHeight: 256,
      columns: 8,
      totalFrames: 29,
      portraitFrame: 0,
      states: {
        march: { from: 0, frames: 1 },
        attack: { from: 0, frames: 29, frameRate: 30 },
        cast: { from: 0, frames: 1 },
      },
    },
  ],
  teacher: [
    {
      id: 'teacher',
      heroId: 'teacher',
      name: 'Default',
      sheet: '/assets/heroes/teacher_sprite.png',
      frameWidth: 256,
      frameHeight: 256,
      columns: 8,
      totalFrames: 51,
      portraitFrame: 0,
      states: {
        march: { from: 0, frames: 1 },
        attack: { from: 0, frames: 51, frameRate: 30 },
        cast: { from: 0, frames: 1 },
      },
    },
  ],
};

/** Every skin a hero owns ([] when none shipped yet). */
export function heroSkins(heroId: HeroId): HeroSkin[] {
  return HERO_SKINS[heroId] ?? [];
}

/** The hero's default skin (first entry), or undefined when no art exists. */
export function defaultSkin(heroId: HeroId): HeroSkin | undefined {
  return HERO_SKINS[heroId]?.[0];
}

/** Resolve a skin by its unique id across all heroes. */
export function skinById(skinId: string): HeroSkin | undefined {
  for (const skins of Object.values(HERO_SKINS)) {
    const hit = skins?.find((s) => s.id === skinId);
    if (hit) return hit;
  }
  return undefined;
}
