import type { WaveDefinition } from '../core/WaveManager';

export type TowerId = 'archer' | 'cannon' | 'frost';

export interface TowerDefinition {
  id: TowerId;
  name: string;
  cost: number;
  range: number;
  damage: number;
  fireRateMs: number;
  projectileSpeed: number;
  color: number;
}

export const TOWER_DEFINITIONS: Record<TowerId, TowerDefinition> = {
  archer: {
    id: 'archer',
    name: 'Archer',
    cost: 50,
    range: 150,
    damage: 8,
    fireRateMs: 500,
    projectileSpeed: 400,
    color: 0x4ade80,
  },
  cannon: {
    id: 'cannon',
    name: 'Cannon',
    cost: 100,
    range: 120,
    damage: 25,
    fireRateMs: 1200,
    projectileSpeed: 300,
    color: 0xf97316,
  },
  frost: {
    id: 'frost',
    name: 'Frost',
    cost: 75,
    range: 130,
    damage: 4,
    fireRateMs: 600,
    projectileSpeed: 500,
    color: 0x38bdf8,
  },
};

export type EnemyId = 'grunt' | 'runner' | 'brute';

/**
 * Per-enemy stats — every enemy type has its own value for each of these.
 * See docs/ADDING_ENEMIES.md before adding a new type.
 */
export interface EnemyDefinition {
  id: EnemyId;
  name: string;
  /** Movement speed along the path, in px/sec. */
  speed: number;
  maxHp: number;
  /** Gold awarded to the player on kill. */
  reward: number;
  /** Player lives lost if this enemy reaches the end of the path. */
  livesLost: number;
  /** Body tint, 0xRRGGBB. */
  color: number;
}

/**
 * Rendering constants shared by every enemy type, regardless of stats.
 * Change these to restyle all enemies uniformly; per-type appearance is
 * limited to `color` on EnemyDefinition (see docs/DESIGN_GUIDELINES.md).
 */
export const ENEMY_VISUALS = {
  bodyRadius: 12,
  hpBarWidth: 24,
  hpBarHeight: 4,
  hpBarOffsetY: -20,
  hpBarBackgroundColor: 0x000000,
  hpBarBackgroundAlpha: 0.5,
  hpBarFillColor: 0x22c55e,
} as const;

export const ENEMY_DEFINITIONS: Record<EnemyId, EnemyDefinition> = {
  grunt: {
    id: 'grunt',
    name: 'Grunt',
    speed: 60,
    maxHp: 40,
    reward: 5,
    livesLost: 1,
    color: 0xef4444,
  },
  runner: {
    id: 'runner',
    name: 'Runner',
    speed: 110,
    maxHp: 20,
    reward: 4,
    livesLost: 1,
    color: 0xeab308,
  },
  brute: {
    id: 'brute',
    name: 'Brute',
    speed: 40,
    maxHp: 150,
    reward: 15,
    livesLost: 1,
    color: 0x7c3aed,
  },
};

export const WAVES: WaveDefinition[] = [
  { groups: [{ enemyId: 'grunt', count: 6, spawnIntervalMs: 800 }] },
  {
    groups: [
      { enemyId: 'grunt', count: 8, spawnIntervalMs: 700 },
      { enemyId: 'runner', count: 4, spawnIntervalMs: 500 },
    ],
  },
  {
    groups: [
      { enemyId: 'runner', count: 8, spawnIntervalMs: 450 },
      { enemyId: 'brute', count: 2, spawnIntervalMs: 2000 },
    ],
  },
  {
    groups: [
      { enemyId: 'grunt', count: 10, spawnIntervalMs: 500 },
      { enemyId: 'brute', count: 4, spawnIntervalMs: 1500 },
    ],
  },
  {
    groups: [
      { enemyId: 'brute', count: 6, spawnIntervalMs: 1200 },
      { enemyId: 'runner', count: 12, spawnIntervalMs: 300 },
    ],
  },
];

export const STARTING_GOLD = 150;
export const STARTING_LIVES = 20;
