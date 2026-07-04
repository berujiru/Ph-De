export type EnemyId = 'grunt' | 'runner' | 'brute';
export type HeroId = 'eden' | 'teacher' | 'student' | 'jeepney_driver' | 'fisherfolk' | 'street_sweeper';

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
  /** Damage dealt to the Barrier per attack. */
  damage: number;
  /** How often the enemy attacks the barrier (ms). */
  attackRateMs: number;
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
    damage: 5,
    attackRateMs: 1500,
    color: 0xef4444,
  },
  runner: {
    id: 'runner',
    name: 'Runner',
    speed: 110,
    maxHp: 20,
    reward: 4,
    damage: 3,
    attackRateMs: 800,
    color: 0xeab308,
  },
  brute: {
    id: 'brute',
    name: 'Brute',
    speed: 40,
    maxHp: 150,
    reward: 15,
    damage: 15,
    attackRateMs: 2500,
    color: 0x7c3aed,
  },
};

export const STARTING_GOLD = 150;
export const STARTING_LIVES = 20;

export interface HeroDefinition {
  id: HeroId;
  name: string;
  profession: string;
  damageType: 'Physical' | 'Wind' | 'Water' | 'Earth' | 'Frost' | 'Fire' | 'Holy' | 'Lightning' | 'Dark';
  attackKind: 'melee' | 'ranged';
  range: number;
  damage: number;
  attackRateMs: number;
  color: number; // Hex color for the character placeholder
  signatureSkill: {
    name: string;
    description: string;
  };
  passive?: {
    name: string;
    description: string;
  };
  projectileColor?: number;
}

export const HERO_DEFINITIONS: Record<HeroId, HeroDefinition> = {
  eden: {
    id: 'eden',
    name: 'Eden',
    profession: 'Community Organizer',
    damageType: 'Physical',
    attackKind: 'ranged',
    range: 1000, // Global ranger
    damage: 15,
    attackRateMs: 1500,
    color: 0x3b82f6, // Blue
    signatureSkill: {
      name: 'Rally',
      description: 'Brief squad-wide buff.'
    },
    passive: {
      name: 'Anchor',
      description: 'Provides adjacency bonuses to allies.'
    },
    projectileColor: 0x60a5fa,
  },
  teacher: {
    id: 'teacher',
    name: 'Teacher',
    profession: 'Public School Teacher',
    damageType: 'Physical',
    attackKind: 'ranged',
    range: 250,
    damage: 15,
    attackRateMs: 1500,
    color: 0x8b5cf6, // Purple
    signatureSkill: {
      name: 'Pamalo (Wooden Ruler)',
      description: 'Marks enemies; marked take bonus damage.'
    },
    projectileColor: 0xddd6fe,
  },
  student: {
    id: 'student',
    name: 'Student',
    profession: 'Working Student',
    damageType: 'Physical',
    attackKind: 'ranged',
    range: 250,
    damage: 10,
    attackRateMs: 1200,
    color: 0xf59e0b, // Amber
    signatureSkill: {
      name: 'Slingshot',
      description: 'Fires a high-speed pebble.'
    },
    passive: {
      name: 'Grows',
      description: 'Enhancement drops apply at increased potency.'
    },
    projectileColor: 0xfcd34d,
  },
  jeepney_driver: {
    id: 'jeepney_driver',
    name: 'Jeepney Driver',
    profession: 'Driver',
    damageType: 'Wind',
    attackKind: 'melee',
    range: 50,
    damage: 25,
    attackRateMs: 1200,
    color: 0x10b981, // Emerald
    signatureSkill: {
      name: 'Barya (Loose change)',
      description: 'Tosses coins like shrapnel for AoE damage.'
    },
  },
  fisherfolk: {
    id: 'fisherfolk',
    name: 'Fisherfolk',
    profession: 'Fisher',
    damageType: 'Water',
    attackKind: 'ranged',
    range: 200,
    damage: 10,
    attackRateMs: 2000,
    color: 0x0ea5e9, // Sky Blue
    signatureSkill: {
      name: 'Lambat',
      description: 'Wide net, mass Wet setup causing Slow.'
    },
    projectileColor: 0x7dd3fc,
  },
  street_sweeper: {
    id: 'street_sweeper',
    name: 'Street Sweeper',
    profession: 'Barangay Sweeper',
    damageType: 'Earth',
    attackKind: 'melee',
    range: 50,
    damage: 20,
    attackRateMs: 1500,
    color: 0xa8a29e, // Stone
    signatureSkill: {
      name: 'Dustpan Toss',
      description: 'Tosses a dustpan of debris to blind/stun enemies.'
    },
  }
};
