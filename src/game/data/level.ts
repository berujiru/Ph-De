import { BARRICADE_DEFAULTS } from './balance';

export const GAME_WIDTH = 960;
export const GAME_HEIGHT = 540;

/** Scrolling rally world — the viewport stays 960x540, the battlefield is wider. */
export const WORLD_WIDTH = GAME_WIDTH * 4;

// Constants for horizontal Rally layout
export const ENEMY_SPAWN_X_OFFSET = 50; // Sandbox spawns at GAME_WIDTH + ENEMY_SPAWN_X_OFFSET

/**
 * The marching-rally formation. The morale shield is the FRONT of the crowd;
 * everything else (heroes, camera, enemy spawns) is positioned relative to it.
 * All distances in px, speeds in px/sec.
 */
export const RALLY = {
  /** Where the shield front starts the battle. */
  shieldStartX: 200,
  /** The shield never advances past this point (leaves room for spawns ahead). */
  shieldMaxX: WORLD_WIDTH - 700,
  /** Formation advance speed while the field ahead is clear. */
  marchSpeedPxPerSec: 55,
  /** A living enemy within this distance ahead of the shield halts the march. */
  engageRangePx: 240,
  /** Enemies spawn this far ahead of the shield (off-camera to the right). */
  enemySpawnAheadPx: 750,
  /**
   * Horizontal screen position the camera keeps the shield at (0..1 of viewport).
   * Kept at or below shieldStartX / GAME_WIDTH (~0.208) so the start-of-battle
   * target scroll clamps to 0 and the camera picks up the formation without a pop.
   */
  cameraAnchorRatio: 0.22,
  /** Camera scroll smoothing — higher catches up faster (per-second lerp rate). */
  cameraLerpPerSec: 4,
  formation: {
    /**
     * Preferred hold offsets relative to the shield front. formationTargetX
     * pulls a hero forward past its preferred offset whenever its attack
     * range demands it — see enemyContactAheadPx / rangeSlackPx below.
     */
    /** Melee heroes hold just behind the shield front. */
    meleeOffsetX: -45,
    /** Ranged heroes hold further back in the crowd. */
    rangedOffsetX: -150,
    /**
     * Enemies halt and attack this far ahead of the shield's center x
     * (the wall's front edge — must match the stop rule in Enemy.update).
     */
    enemyContactAheadPx: BARRICADE_DEFAULTS.width / 2,
    /** Safety margin kept between a hero's slot and the edge of its range. */
    rangeSlackPx: 20,
    /** Ranged heroes scatter up to ±half this so they don't stack on one pixel. */
    rangedJitterPx: 24,
    /** Vertical spacing between heroes in the column. */
    rowSpacingPx: 55,
    /** Heroes out of position catch up faster than the march itself. */
    catchUpSpeedMultiplier: 2.2,
    /** Distance from formation slot beyond which a hero runs instead of walks. */
    runDistancePx: 60,
    /** Close enough to the slot to stop walking. */
    settleDistancePx: 2,
  },
} as const;

/**
 * Layered parallax backdrop for the marching rally. Each layer is a
 * viewport-pinned TileSprite whose texture scrolls at `factor` of the camera's
 * scrollX — smaller = farther away. All layers stay BEHIND the units (negative
 * depth) so gameplay reads cleanly on the dark background. Textures live under
 * public/assets/backgrounds/ and are 540px tall (no vertical tiling) with
 * seam-safe horizontal repeats. Factor 0 (sandbox, static camera) still looks
 * right because tilePositionX is just 0.
 */
export const PARALLAX = {
  layers: [
    { key: 'bg-sky',        factor: 0.05, depth: -40 },
    { key: 'bg-skyline',    factor: 0.25, depth: -30 },
    { key: 'bg-street',     factor: 0.55, depth: -20 },
    { key: 'bg-foreground', factor: 0.85, depth: -10 },
  ],
} as const;

/**
 * Combat-juice tunables (Phaser-side only — no gameplay math here). Kept as
 * data so the visual feel is tweaked in one place, not buried as magic numbers
 * in entity/scene code. Shake intensity is Phaser's fraction-of-viewport value,
 * deliberately subtle so it layers on top of the follow-camera without nausea.
 */
export const FX = {
  damageNumber: {
    risePx: 34,
    driftPx: 22,
    durationMs: 650,
    fontSizePx: 15,
    critFontSizePx: 20,
    normalColor: '#f8fafc',
    critColor: '#facc15',
  },
  hitSpark: {
    shardCount: 4,
    spreadPx: 18,
    durationMs: 220,
  },
  deathBurst: {
    shardCount: 8,
    spreadPx: 40,
    ringRadiusPx: 34,
    durationMs: 360,
  },
  muzzleFlash: {
    streaks: 3,
    durationMs: 130,
  },
  cameraShake: {
    enemyDeath: { durationMs: 90,  intensity: 0.0028 },
    shieldHit:  { durationMs: 130, intensity: 0.006 },
    skillCast:  { durationMs: 220, intensity: 0.009 },
  },
} as const;

export type CameraShakeConfig = { durationMs: number; intensity: number };
