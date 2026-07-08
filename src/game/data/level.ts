import { BARRICADE_DEFAULTS } from './balance';

// Portrait (9:16) internal resolution. The battle now runs on a VERTICAL axis:
// enemies march DOWN from the top, the rally pushes UP from the bottom.
export const GAME_WIDTH = 1080;
export const GAME_HEIGHT = 1920;

/**
 * Scrolling rally world — the viewport stays 1080x1920, the battlefield is
 * TALLER. The scroll axis is Y (the march axis); X is a static lane the width
 * of the viewport.
 */
export const WORLD_HEIGHT = GAME_HEIGHT * 4;

// Constant for the vertical Rally layout. Sandbox spawns just above the top of
// the visible viewport (scrollY - ENEMY_SPAWN_Y_OFFSET) so enemies walk in.
export const ENEMY_SPAWN_Y_OFFSET = 50;

/**
 * The marching-rally formation. The morale shield is the FRONT of the crowd;
 * everything else (heroes, camera, enemy spawns) is positioned relative to it.
 * The rally advances UP the world (toward smaller y / the enemy spawns at the
 * top); enemies march DOWN (toward larger y) to meet it near the bottom.
 * All distances in px, speeds in px/sec.
 */
export const RALLY = {
  /**
   * Where the shield front starts the battle. Decrease the number (e.g., 300) 
   * to move heroes LOWER on screen, or increase it (e.g., 600) to move them HIGHER.
   */
  shieldStartY: WORLD_HEIGHT - 200,
  /**
   * The shield never advances past this point. Keep this matching shieldStartY
   * to freeze the march.
   */
  shieldMaxY: WORLD_HEIGHT - 350,
  /** Formation advance speed while the field ahead is clear. */
  marchSpeedPxPerSec: 55,
  /** A living enemy within this distance ahead of (above) the shield halts the march. */
  engageRangePx: 240,
  /** Enemies spawn this far ahead of (above) the shield. Now closer for immediate action! */
  enemySpawnAheadPx: 400,
  /**
   * Vertical screen position the camera keeps the shield at (0..1 of viewport,
   * measured from the top). 0.70 holds the shield in the lower half of the view
   * without being right at the bottom edge.
   */
  cameraAnchorRatio: 0.70,
  /** Camera scroll smoothing — higher catches up faster (per-second lerp rate). */
  cameraLerpPerSec: 4,
  formation: {
    /**
     * Preferred hold offsets relative to the shield front. formationTargetY
     * pulls a hero forward (up, toward the enemies) past its preferred offset
     * whenever its attack range demands it — see enemyContactAheadPx /
     * rangeSlackPx below. Positive = behind the shield (below, toward the crowd).
     */
    /** Melee heroes hold just behind (below) the shield front. */
    meleeOffsetY: 45,
    /** Ranged heroes hold further back in the crowd (further below). */
    rangedOffsetY: 150,
    /**
     * Enemies halt and attack this far ahead of (above) the shield's center y
     * (the wall's front edge — must match the stop rule in Enemy.update).
     */
    enemyContactAheadPx: BARRICADE_DEFAULTS.width / 2,
    /** Safety margin kept between a hero's slot and the edge of its range. */
    rangeSlackPx: 20,
    /** Ranged heroes scatter up to ±half this (along the march axis) so they don't stack on one pixel. */
    rangedJitterPx: 24,
    /** Horizontal spacing between heroes across the lane. */
    rowSpacingPx: 180,
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
 * scrollY — smaller = farther away. All layers stay BEHIND the units (negative
 * depth) so gameplay reads cleanly on the dark background. Textures live under
 * public/assets/backgrounds/ as portrait 9:16 art (one copy covers the whole
 * viewport — see ParallaxBackground) and wrap seam-free vertically as the
 * camera scrolls. The sky is factor 0: it is infinitely far, so it stays
 * pinned — which also means its vertical gradient never wraps into a seam.
 */
export const PARALLAX = {
  layers: [
    { key: 'bg-sky',        factor: 0,    depth: -40 },
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
    risePx: 60,
    driftPx: 40,
    durationMs: 650,
    fontSizePx: 30,
    critFontSizePx: 44,
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
