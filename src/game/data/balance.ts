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

export interface EnemyDefinition {
  id: EnemyId;
  name: string;
  speed: number;
  maxHp: number;
  reward: number;
  color: number;
}

export const ENEMY_DEFINITIONS: Record<EnemyId, EnemyDefinition> = {
  grunt: { id: 'grunt', name: 'Grunt', speed: 60, maxHp: 40, reward: 5, color: 0xef4444 },
  runner: { id: 'runner', name: 'Runner', speed: 110, maxHp: 20, reward: 4, color: 0xeab308 },
  brute: { id: 'brute', name: 'Brute', speed: 40, maxHp: 150, reward: 15, color: 0x7c3aed },
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
