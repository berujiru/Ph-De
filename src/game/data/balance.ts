export type EnemyId = 'grunt' | 'runner' | 'brute' | 'sandbox_target' | 'ghost_employee' | 'illegal_logger' | 'epal' | 'the_overpriced' | 'kickback_courier' | 'shell_company' | 'crony_bodyguard' | 'hoarder' | 'land_grabber' | 'tender_rigger' | 'boss_flood_control' | 'boss_pork_barrel' | 'boss_troll_farm' | 'boss_vote_buying' | 'boss_nepotism' | 'boss_wang_wang' | 'boss_budget_insertion' | 'boss_smuggling' | 'boss_dynasty_1' | 'boss_dynasty_2' | 'boss_dynasty_3' | 'boss_ang_sistema';
export type HeroId = 'eden' | 'teacher' | 'student' | 'jeepney_driver' | 'fisherfolk' | 'street_sweeper' | 'taho_vendor' | 'nurse' | 'construction_worker' | 'call_center_agent' | 'security_guard' | 'farmer' | 'fishball_vendor' | 'sales_lady' | 'sorbetes_vendor' | 'electrician' | 'baker' | 'traffic_enforcer' | 'plumber' | 'delivery_rider' | 'sandbox_projectile' | 'sandbox_melee_cleave' | 'sandbox_beam' | 'sandbox_lobbed' | 'sandbox_pierce' | 'sandbox_chain' | 'sandbox_trap' | 'sandbox_vortex' | 'sandbox_linear_wave' | 'sandbox_summoner' | 'sandbox_boomerang';

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
  
  // Passive & Skill properties
  stealth?: boolean;
  barrierDamageMultiplier?: number;
  auraRange?: number;
  moraleAura?: boolean;
  fakeHpPadding?: number;
  stealVoicesPerSecond?: number;
  splitOnDeathCount?: number;
  tauntAura?: boolean;
  dropObstacleOnDeath?: boolean;
  knockbackPulseCooldown?: number;
  hitImmunityCount?: number;
  
  nextPhaseEnemyId?: EnemyId;
  
  activeSkill?: {
    name: string;
    effect: 'flood' | 'devour' | 'summonSwarm' | 'summonShieldbearer' | 'sirenBurst' | 'smuggleHp' | 'economyHeist' | 'scatterFakeGold' | 'resurrectAll';
  };
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
  sandbox_target: {
    id: 'sandbox_target',
    name: 'Punching Bag',
    speed: 0,
    maxHp: 999999,
    reward: 0,
    damage: 0,
    attackRateMs: 999999,
    color: 0x475569,
  },
  ghost_employee: {
    id: 'ghost_employee',
    name: 'Ghost Employee',
    speed: 50,
    maxHp: 60,
    reward: 8,
    damage: 8,
    attackRateMs: 1500,
    color: 0xffffff,
    stealth: true,
  },
  illegal_logger: {
    id: 'illegal_logger',
    name: 'Illegal Logger',
    speed: 30,
    maxHp: 200,
    reward: 20,
    damage: 15,
    attackRateMs: 2500,
    color: 0x8b4513,
    barrierDamageMultiplier: 10,
  },
  epal: {
    id: 'epal',
    name: 'Epal',
    speed: 40,
    maxHp: 150,
    reward: 15,
    damage: 10,
    attackRateMs: 2000,
    color: 0xf97316,
    moraleAura: true,
    auraRange: 150,
  },
  the_overpriced: {
    id: 'the_overpriced',
    name: 'The Overpriced',
    speed: 25,
    maxHp: 50,
    reward: 10,
    damage: 8,
    attackRateMs: 3000,
    color: 0x818cf8,
    fakeHpPadding: 150,
  },
  kickback_courier: {
    id: 'kickback_courier',
    name: 'Kickback Courier',
    speed: 90,
    maxHp: 80,
    reward: 5, // drops extra on death in code
    damage: 5,
    attackRateMs: 1500,
    color: 0x10b981,
    stealVoicesPerSecond: 1,
  },
  shell_company: {
    id: 'shell_company',
    name: 'Shell Company',
    speed: 35,
    maxHp: 120,
    reward: 12,
    damage: 8,
    attackRateMs: 2000,
    color: 0x64748b,
    splitOnDeathCount: 3,
  },
  crony_bodyguard: {
    id: 'crony_bodyguard',
    name: 'Crony',
    speed: 40,
    maxHp: 250,
    reward: 20,
    damage: 5,
    attackRateMs: 2500,
    color: 0x0f172a,
    tauntAura: true,
  },
  hoarder: {
    id: 'hoarder',
    name: 'Hoarder',
    speed: 20,
    maxHp: 300,
    reward: 25,
    damage: 20,
    attackRateMs: 4000,
    color: 0xca8a04,
    dropObstacleOnDeath: true,
  },
  land_grabber: {
    id: 'land_grabber',
    name: 'Land Grabber',
    speed: 30,
    maxHp: 200,
    reward: 18,
    damage: 15,
    attackRateMs: 3000,
    color: 0x4d7c0f,
    knockbackPulseCooldown: 5000,
  },
  tender_rigger: {
    id: 'tender_rigger',
    name: 'Tender Rigger',
    speed: 40,
    maxHp: 100,
    reward: 15,
    damage: 12,
    attackRateMs: 2000,
    color: 0xd946ef,
    hitImmunityCount: 5,
  },
  boss_flood_control: {
    id: 'boss_flood_control',
    name: 'Ghost Flood Control',
    speed: 15,
    maxHp: 800,
    reward: 50,
    damage: 30,
    attackRateMs: 5000,
    color: 0x0ea5e9,
    activeSkill: { name: 'Flash Flood', effect: 'flood' }
  },
  boss_pork_barrel: {
    id: 'boss_pork_barrel',
    name: 'Pork Barrel',
    speed: 10,
    maxHp: 1200,
    reward: 100,
    damage: 50,
    attackRateMs: 6000,
    color: 0xdb2777,
    activeSkill: { name: 'Devour Funds', effect: 'devour' }
  },
  boss_troll_farm: {
    id: 'boss_troll_farm',
    name: 'Troll Farm',
    speed: 10,
    maxHp: 700,
    reward: 50,
    damage: 15,
    attackRateMs: 4000,
    color: 0x3f3f46,
    activeSkill: { name: 'Deploy Trolls', effect: 'summonSwarm' }
  },
  boss_vote_buying: {
    id: 'boss_vote_buying',
    name: 'Vote Buying',
    speed: 20,
    maxHp: 600,
    reward: 75,
    damage: 20,
    attackRateMs: 3500,
    color: 0xeab308,
    activeSkill: { name: 'Bribe', effect: 'scatterFakeGold' }
  },
  boss_nepotism: {
    id: 'boss_nepotism',
    name: 'Nepotism',
    speed: 15,
    maxHp: 900,
    reward: 80,
    damage: 25,
    attackRateMs: 4500,
    color: 0x9333ea,
    activeSkill: { name: 'Appoint Shieldbearer', effect: 'summonShieldbearer' }
  },
  boss_wang_wang: {
    id: 'boss_wang_wang',
    name: 'Wang-Wang',
    speed: 35,
    maxHp: 500,
    reward: 60,
    damage: 35,
    attackRateMs: 2500,
    color: 0xef4444,
    activeSkill: { name: 'VIP Convoy', effect: 'sirenBurst' }
  },
  boss_budget_insertion: {
    id: 'boss_budget_insertion',
    name: 'Budget Insertion',
    speed: 12,
    maxHp: 1000,
    reward: 100,
    damage: 40,
    attackRateMs: 5000,
    color: 0x14b8a6,
    activeSkill: { name: 'Smuggle Funds', effect: 'smuggleHp' }
  },
  boss_smuggling: {
    id: 'boss_smuggling',
    name: 'Smuggling',
    speed: 25,
    maxHp: 750,
    reward: 80,
    damage: 25,
    attackRateMs: 3000,
    color: 0xf59e0b,
    activeSkill: { name: 'Economy Heist', effect: 'economyHeist' }
  },
  boss_dynasty_3: {
    id: 'boss_dynasty_3',
    name: 'The Dynasty (Heir)',
    speed: 40,
    maxHp: 400,
    reward: 200,
    damage: 20,
    attackRateMs: 1500,
    color: 0xd946ef,
  },
  boss_dynasty_2: {
    id: 'boss_dynasty_2',
    name: 'The Dynasty (Schemer)',
    speed: 25,
    maxHp: 600,
    reward: 0,
    damage: 30,
    attackRateMs: 3000,
    color: 0xa21caf,
    nextPhaseEnemyId: 'boss_dynasty_3',
  },
  boss_dynasty_1: {
    id: 'boss_dynasty_1',
    name: 'The Dynasty (Bruiser)',
    speed: 15,
    maxHp: 800,
    reward: 0,
    damage: 50,
    attackRateMs: 5000,
    color: 0x701a75,
    nextPhaseEnemyId: 'boss_dynasty_2',
  },
  boss_ang_sistema: {
    id: 'boss_ang_sistema',
    name: 'Ang Sistema',
    speed: 10,
    maxHp: 2500,
    reward: 500,
    damage: 80,
    attackRateMs: 6000,
    color: 0x000000,
    activeSkill: { name: 'Horde Convergence', effect: 'resurrectAll' }
  },
};

export const STARTING_GOLD = 150;
export const STARTING_LIVES = 20;

export const BARRICADE_DEFAULTS = {
  maxHp: 500,
  width: 30,
};

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
  canSeeStealth?: boolean;
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
    signatureSkill: { name: 'Rally', description: 'Massive attack speed buff to all deployed heroes.' },
    passive: { name: 'Voice of the People', description: 'Generates 1 Voice every 10 seconds.' },
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
    signatureSkill: { name: 'Recess', description: 'Silences enemy auras in a radius.' },
    passive: { name: 'Fact Check', description: 'Instantly pops and destroys Fake HP padding.' },
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
    signatureSkill: { name: 'Cramming', description: 'Instantly resets the active skill cooldown of 1 random adjacent hero.' },
    passive: { name: 'Overachiever', description: 'Enhancement drops apply at 1.5x potency.' },
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
    signatureSkill: { name: 'Barya Lang Po', description: 'Tosses coin shrapnel for massive shotgun AoE damage.' },
    passive: { name: 'Hari ng Kalsada', description: 'Deals bonus damage to Bosses.' },
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
    attackRateMs: 4000,
    color: 0x0ea5e9,
    signatureSkill: { name: 'Lambat', description: 'Casts a net dragging enemies from off-lanes into the center.' },
    passive: { name: 'Deep Water', description: 'Attacks apply Wet (amplifies lightning damage).' },
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
    attackRateMs: 2500,
    color: 0xa8a29e,
    signatureSkill: { name: 'Dust Storm', description: 'Blinds enemies, reducing speed and damage by 50%.' },
    passive: { name: 'Clean Sweep', description: 'Deals 10x damage to Obstacles and Traps.' },
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
    signatureSkill: { name: 'Hot Syrup', description: 'Sticky puddle that permanently strips enemy speed buffs.' },
    passive: { name: 'Sweet Tooth', description: 'Drops 1 extra Voice when killing an Elite/Boss.' },
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
    signatureSkill: { name: 'Vaccine Drive', description: 'Grants all heroes immunity to debuffs for 5 seconds.' },
    passive: { name: 'Triage', description: 'Projectiles passing through ally summons heal them.' },
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
    attackRateMs: 5000,
    color: 0xd97706,
    signatureSkill: { name: 'Yero Barricade', description: 'Summons an indestructible wall blocking enemies for 5 seconds.' },
    passive: { name: 'Heavy Stance', description: 'Completely immune to knockback effects.' },
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
    signatureSkill: { name: 'Escalate to Manager', description: 'Deals massive single-target damage (15% Max HP).' },
    passive: { name: 'Graveyard Shift', description: 'Can see and directly target Stealthed enemies.' },
  },
  security_guard: {
    id: 'security_guard',
    name: 'Security Guard',
    profession: 'Sikyu',
    damageType: 'Physical',
    attackKind: 'melee',
    attackStyle: 'melee-cleave',
    range: 200,
    damage: 22,
    attackRateMs: 1300,
    color: 0x1e3a8a,
    signatureSkill: { name: 'Shining Flashlight', description: 'Casts a wide cone that heavily slows all enemies.' },
    passive: { name: 'Night Watch', description: 'Deals double damage to Stealthed enemies.' },
  },
  farmer: {
    id: 'farmer',
    name: 'Farmer',
    profession: 'Magsasaka',
    damageType: 'Earth',
    attackKind: 'melee',
    attackStyle: 'melee-cleave',
    range: 200,
    damage: 18,
    attackRateMs: 1600,
    color: 0x15803d,
    signatureSkill: { name: 'Harvest', description: 'Deals massive burst damage based on enemy ailments.' },
    passive: { name: 'Deep Roots', description: 'Attacks have a 20% chance to Root (freeze) enemies.' },
  },
  fishball_vendor: {
    id: 'fishball_vendor',
    name: 'Fishball Vendor',
    profession: 'Street Vendor',
    damageType: 'Physical',
    attackKind: 'ranged',
    attackStyle: 'pierce',
    range: 200,
    damage: 15,
    attackRateMs: 1400,
    color: 0xf43f5e,
    signatureSkill: { name: 'Spicy Sauce', description: 'Ignites all pierced enemies, causing panic.' },
    passive: { name: 'Tuhog', description: 'Attacks pierce up to 5 enemies in a line.' },
    projectileColor: 0xfca5a5,
  },
  sandbox_projectile: { id: 'sandbox_projectile', name: 'Test: Projectile', profession: 'Tester', damageType: 'Physical', attackKind: 'ranged', attackStyle: 'projectile', range: 500, damage: 20, attackRateMs: 1000, color: 0x9ca3af, signatureSkill: { name: 'None', description: '' } },
  sandbox_melee_cleave: { id: 'sandbox_melee_cleave', name: 'Test: Melee Cleave', profession: 'Tester', damageType: 'Physical', attackKind: 'melee', attackStyle: 'melee-cleave', range: 200, damage: 20, attackRateMs: 1000, color: 0x9ca3af, signatureSkill: { name: 'None', description: '' } },
  sandbox_beam: { id: 'sandbox_beam', name: 'Test: Beam', profession: 'Tester', damageType: 'Physical', attackKind: 'ranged', attackStyle: 'beam', range: 500, damage: 20, attackRateMs: 3000, color: 0x9ca3af, signatureSkill: { name: 'None', description: '' } },
  sandbox_lobbed: { id: 'sandbox_lobbed', name: 'Test: Lobbed', profession: 'Tester', damageType: 'Physical', attackKind: 'ranged', attackStyle: 'lobbed', range: 500, damage: 20, attackRateMs: 1000, color: 0x9ca3af, signatureSkill: { name: 'None', description: '' } },
  sandbox_pierce: { id: 'sandbox_pierce', name: 'Test: Pierce', profession: 'Tester', damageType: 'Physical', attackKind: 'ranged', attackStyle: 'pierce', range: 500, damage: 20, attackRateMs: 1000, color: 0x9ca3af, signatureSkill: { name: 'None', description: '' } },
  sandbox_chain: { id: 'sandbox_chain', name: 'Test: Chain', profession: 'Tester', damageType: 'Physical', attackKind: 'ranged', attackStyle: 'chain', range: 500, damage: 20, attackRateMs: 1000, color: 0x9ca3af, signatureSkill: { name: 'None', description: '' } },
  sandbox_trap: { id: 'sandbox_trap', name: 'Test: Trap', profession: 'Tester', damageType: 'Physical', attackKind: 'ranged', attackStyle: 'trap', range: 500, damage: 20, attackRateMs: 3000, color: 0x9ca3af, signatureSkill: { name: 'None', description: '' } },
  sandbox_vortex: { id: 'sandbox_vortex', name: 'Test: Vortex', profession: 'Tester', damageType: 'Physical', attackKind: 'ranged', attackStyle: 'vortex', range: 500, damage: 20, attackRateMs: 4000, color: 0x9ca3af, signatureSkill: { name: 'None', description: '' } },
  sandbox_linear_wave: { id: 'sandbox_linear_wave', name: 'Test: Linear Wave', profession: 'Tester', damageType: 'Physical', attackKind: 'ranged', attackStyle: 'linear-wave', range: 500, damage: 20, attackRateMs: 2500, color: 0x9ca3af, signatureSkill: { name: 'None', description: '' } },
  sandbox_summoner: { id: 'sandbox_summoner', name: 'Test: Summoner', profession: 'Tester', damageType: 'Physical', attackKind: 'ranged', attackStyle: 'summoner', range: 500, damage: 20, attackRateMs: 5000, color: 0x9ca3af, signatureSkill: { name: 'None', description: '' } },
  sandbox_boomerang: { id: 'sandbox_boomerang', name: 'Test: Boomerang', profession: 'Tester', damageType: 'Physical', attackKind: 'ranged', attackStyle: 'boomerang', range: 500, damage: 20, attackRateMs: 1000, color: 0x9ca3af, signatureSkill: { name: 'None', description: '' } },
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
    signatureSkill: { name: 'Closing Sale', description: 'Instantly executes any enemy below 15% HP.' },
    passive: { name: 'Relentless Pitch', description: 'Fastest base attack speed in the game.' },
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
    attackRateMs: 3000,
    color: 0xf472b6,
    signatureSkill: { name: 'Dirty Ice Cream', description: 'Drops 3 explosive ice cream traps on the path.' },
    passive: { name: 'Brain Freeze', description: 'Attacks apply stacking Freeze.' },
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
    signatureSkill: { name: 'Rolling Blackout', description: 'Stuns the entire screen for 3 seconds.' },
    passive: { name: 'Live Wire', description: 'Attacks automatically bounce to 3 nearby targets.' },
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
    signatureSkill: { name: 'Dough Knead', description: 'Flattens enemies, reducing their armor and damage by 50%.' },
    passive: { name: 'Fresh out the Oven', description: 'Attacks leave a burning zone on the ground.' },
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
    attackRateMs: 4000,
    color: 0x475569,
    signatureSkill: { name: 'STOP!', description: 'Hard stuns a wide radius and cancels channeling Boss Skills.' },
    passive: { name: 'Right of Way', description: 'Magnetically pulls enemies into tight clumps.' },
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
    attackRateMs: 2500,
    color: 0x2563eb,
    signatureSkill: { name: 'Flush', description: 'Sends a massive wave that instantly washes away all enemy Summons.' },
    passive: { name: 'High Pressure', description: 'Normal attacks push enemies backward slightly.' },
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
    signatureSkill: { name: 'Kamote Riders', description: 'Summons 3 AI riders that crash into the horde and explode.' },
    passive: { name: 'Rush Hour', description: 'Attack speed ramps up the longer they attack the same target.' },
    projectileColor: 0x86efac,
  }
};
