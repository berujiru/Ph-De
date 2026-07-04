export type EnemyId = 'grunt' | 'runner' | 'brute';
export type HeroId = 'eden' | 'teacher' | 'student' | 'jeepney_driver' | 'fisherfolk' | 'street_sweeper' | 'taho_vendor' | 'nurse' | 'construction_worker' | 'call_center_agent' | 'security_guard' | 'farmer' | 'fishball_vendor' | 'sales_lady' | 'sorbetes_vendor' | 'electrician' | 'baker' | 'traffic_enforcer' | 'plumber' | 'delivery_rider';

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
  attackStyle: 'projectile' | 'melee-cleave' | 'beam' | 'lobbed' | 'pierce' | 'chain' | 'trap' | 'vortex' | 'linear-wave' | 'summoner' | 'boomerang';
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
    attackStyle: 'projectile',
    range: 1000,
    damage: 15,
    attackRateMs: 1500,
    color: 0x3b82f6,
    signatureSkill: { name: 'Rally', description: 'Brief squad-wide buff.' },
    passive: { name: 'Anchor', description: 'Provides adjacency bonuses to allies.' },
    projectileColor: 0x60a5fa,
  },
  teacher: {
    id: 'teacher',
    name: 'Teacher',
    profession: 'Public School Teacher',
    damageType: 'Physical',
    attackKind: 'ranged',
    attackStyle: 'boomerang',
    range: 250,
    damage: 15,
    attackRateMs: 1500,
    color: 0x8b5cf6,
    signatureSkill: { name: 'Pamalo (Wooden Ruler)', description: 'Marks enemies; marked take bonus damage.' },
    projectileColor: 0xddd6fe,
  },
  student: {
    id: 'student',
    name: 'Student',
    profession: 'Working Student',
    damageType: 'Physical',
    attackKind: 'ranged',
    attackStyle: 'pierce',
    range: 250,
    damage: 10,
    attackRateMs: 1200,
    color: 0xf59e0b,
    signatureSkill: { name: 'Slingshot', description: 'Fires a high-speed pebble.' },
    passive: { name: 'Grows', description: 'Enhancement drops apply at increased potency.' },
    projectileColor: 0xfcd34d,
  },
  jeepney_driver: {
    id: 'jeepney_driver',
    name: 'Jeepney Driver',
    profession: 'Driver',
    damageType: 'Wind',
    attackKind: 'melee',
    attackStyle: 'melee-cleave',
    range: 50,
    damage: 25,
    attackRateMs: 1200,
    color: 0x10b981,
    signatureSkill: { name: 'Barya (Loose change)', description: 'Tosses coins like shrapnel for AoE damage.' },
  },
  fisherfolk: {
    id: 'fisherfolk',
    name: 'Fisherfolk',
    profession: 'Fisher',
    damageType: 'Water',
    attackKind: 'ranged',
    attackStyle: 'vortex',
    range: 200,
    damage: 10,
    attackRateMs: 2000,
    color: 0x0ea5e9,
    signatureSkill: { name: 'Lambat', description: 'Wide net, mass Wet setup causing Slow.' },
    projectileColor: 0x7dd3fc,
  },
  street_sweeper: {
    id: 'street_sweeper',
    name: 'Street Sweeper',
    profession: 'Barangay Sweeper',
    damageType: 'Earth',
    attackKind: 'melee',
    attackStyle: 'linear-wave',
    range: 50,
    damage: 20,
    attackRateMs: 1500,
    color: 0xa8a29e,
    signatureSkill: { name: 'Dustpan Toss', description: 'Tosses a dustpan of debris to blind/stun enemies.' },
  },
  taho_vendor: {
    id: 'taho_vendor',
    name: 'Taho Vendor',
    profession: 'Street Vendor',
    damageType: 'Frost',
    attackKind: 'ranged',
    attackStyle: 'lobbed',
    range: 150,
    damage: 12,
    attackRateMs: 1800,
    color: 0xe2e8f0,
    signatureSkill: { name: 'Taho Bucket Bash', description: 'Heavy melee hit with high Slow chance.' },
    projectileColor: 0xffffff,
  },
  nurse: {
    id: 'nurse',
    name: 'Nurse',
    profession: 'Public Health Nurse',
    damageType: 'Holy',
    attackKind: 'ranged',
    attackStyle: 'projectile',
    range: 200,
    damage: 8,
    attackRateMs: 1600,
    color: 0xfca5a5,
    signatureSkill: { name: 'First-Aid Kit', description: 'Barrier regeneration.' },
    projectileColor: 0xfecaca,
  },
  construction_worker: {
    id: 'construction_worker',
    name: 'Construction Worker',
    profession: 'Laborer',
    damageType: 'Physical',
    attackKind: 'ranged',
    attackStyle: 'summoner',
    range: 100,
    damage: 15,
    attackRateMs: 2500,
    color: 0xd97706,
    signatureSkill: { name: 'Yero Barricade', description: 'Drops corrugated iron in front of barrier.' },
  },
  call_center_agent: {
    id: 'call_center_agent',
    name: 'Call Center Agent',
    profession: 'BPO Graveyard shift',
    damageType: 'Lightning',
    attackKind: 'ranged',
    attackStyle: 'chain',
    range: 300,
    damage: 18,
    attackRateMs: 1400,
    color: 0xfef08a,
    signatureSkill: { name: 'Escalate', description: 'Mass stun.' },
  },
  security_guard: {
    id: 'security_guard',
    name: 'Security Guard',
    profession: 'Sikyu',
    damageType: 'Physical',
    attackKind: 'melee',
    attackStyle: 'melee-cleave',
    range: 60,
    damage: 22,
    attackRateMs: 1300,
    color: 0x1e3a8a,
    signatureSkill: { name: 'Shining Flashlight', description: 'Blinds/slows a cone of enemies.' },
  },
  farmer: {
    id: 'farmer',
    name: 'Farmer',
    profession: 'Magsasaka',
    damageType: 'Earth',
    attackKind: 'melee',
    attackStyle: 'melee-cleave',
    range: 70,
    damage: 18,
    attackRateMs: 1600,
    color: 0x15803d,
    signatureSkill: { name: 'Harvest', description: 'Wide sweep that roots enemies.' },
  },
  fishball_vendor: {
    id: 'fishball_vendor',
    name: 'Fishball Vendor',
    profession: 'Street Vendor',
    damageType: 'Physical',
    attackKind: 'ranged',
    attackStyle: 'pierce',
    range: 200,
    damage: 12,
    attackRateMs: 1100,
    color: 0xf97316,
    signatureSkill: { name: 'Tuhog Master', description: 'Throws a giant skewer that pierces all enemies in a line.' },
    projectileColor: 0xfcd34d,
  },
  sales_lady: {
    id: 'sales_lady',
    name: 'Sales Lady',
    profession: 'Department Store Worker',
    damageType: 'Wind',
    attackKind: 'ranged',
    attackStyle: 'beam',
    range: 250,
    damage: 5,
    attackRateMs: 500, // Very fast
    color: 0xec4899,
    signatureSkill: { name: 'Ma\'am/Sir!', description: 'Sonic blast that pushes enemies back.' },
  },
  sorbetes_vendor: {
    id: 'sorbetes_vendor',
    name: 'Sorbetes Vendor',
    profession: 'Dirty Ice Cream Vendor',
    damageType: 'Frost',
    attackKind: 'ranged',
    attackStyle: 'trap',
    range: 150,
    damage: 10,
    attackRateMs: 2000,
    color: 0xf472b6,
    signatureSkill: { name: 'Kalembang', description: 'Rings bell to shatter frozen enemies.' },
  },
  electrician: {
    id: 'electrician',
    name: 'Electrician',
    profession: 'Lineman',
    damageType: 'Lightning',
    attackKind: 'ranged',
    attackStyle: 'chain',
    range: 220,
    damage: 16,
    attackRateMs: 1700,
    color: 0x38bdf8,
    signatureSkill: { name: 'Brownout', description: 'Plunges screen into darkness, stunning all anomalies.' },
  },
  baker: {
    id: 'baker',
    name: 'Baker',
    profession: 'Panadero',
    damageType: 'Fire',
    attackKind: 'ranged',
    attackStyle: 'lobbed',
    range: 180,
    damage: 14,
    attackRateMs: 1900,
    color: 0xef4444,
    signatureSkill: { name: 'Mainit-init pa!', description: 'Boosts attack speed of adjacent allies.' },
  },
  traffic_enforcer: {
    id: 'traffic_enforcer',
    name: 'Traffic Enforcer',
    profession: 'MMDA',
    damageType: 'Physical',
    attackKind: 'ranged',
    attackStyle: 'vortex',
    range: 150,
    damage: 8,
    attackRateMs: 2200,
    color: 0x475569,
    signatureSkill: { name: 'Counterflow', description: 'Forces enemies to walk backwards briefly.' },
  },
  plumber: {
    id: 'plumber',
    name: 'Plumber',
    profession: 'Tubero',
    damageType: 'Water',
    attackKind: 'ranged',
    attackStyle: 'linear-wave',
    range: 200,
    damage: 12,
    attackRateMs: 1800,
    color: 0x2563eb,
    signatureSkill: { name: 'Water Interruption', description: 'Consumes Wet stacks on enemies for burst damage.' },
  },
  delivery_rider: {
    id: 'delivery_rider',
    name: 'Delivery Rider',
    profession: 'Motorcycle Courier',
    damageType: 'Wind',
    attackKind: 'ranged',
    attackStyle: 'boomerang',
    range: 250,
    damage: 15,
    attackRateMs: 1600,
    color: 0x22c55e,
    signatureSkill: { name: 'Rush Hour', description: 'Summons riders to crash into the horde.' },
    projectileColor: 0x86efac,
  }
};
