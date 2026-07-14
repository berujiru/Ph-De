import anomaliesLore from './anomalies_lore.json';

export type EnemyId = 'grunt' | 'runner' | 'brute' | 'sandbox_target' | 'ghost_employee' | 'bribery' | 'epal' | 'the_overpriced' | 'kickback_courier' | 'shell_company' | 'crony_bodyguard' | 'hoarder' | 'land_grabber' | 'tender_rigger' | 'red_tape' | 'boss_flood_control' | 'boss_pork_barrel' | 'boss_troll_farm' | 'boss_vote_buying' | 'boss_nepotism' | 'boss_wang_wang' | 'boss_budget_insertion' | 'boss_smuggling' | 'boss_dynasty_1' | 'boss_dynasty_2' | 'boss_dynasty_3' | 'boss_ang_sistema' | 'minion_nepotism';

/**
 * Per-enemy stats — every enemy type has its own value for each of these.
 * See docs/ADDING_ENEMIES.md before adding a new type.
 */
export interface EnemyDefinition {
  id: EnemyId;
  name: string;
  /** Narrative flavor text for the Codex. */
  lore?: string;
  /** Movement speed along the path, in px/sec. */
  speed: number;
  maxHp: number;
  /** Gold awarded to the player on kill. */
  reward: number;
  /** Damage dealt to the Barrier per attack. */
  damage: number;
  /** How often the enemy attacks the barrier (ms). */
  attackRateMs: number;
  /**
   * Fixed attack range (px): the enemy halts and attacks once the barrier's
   * front edge is within this distance. 0 / omitted = melee contact.
   */
  attackRangePx?: number;
  /** Body tint, 0xRRGGBB. */
  color: number;
  /** Aseprite atlas key for this enemy's sprite sheet. Defaults to `id` when
   *  omitted; the atlas is auto-wired in GameScene once loaded (top-front view,
   *  states march/attack/stunned/celebrate/death — see CHARACTER_VISUAL_PROMPT_GUIDE). */
  spriteKey?: string;
  /**
   * Render size tier (see UNIT_RENDER_SIZES). Defaults to 'boss' for `boss_*`
   * ids and 'minion' otherwise — set 'miniboss' explicitly on elite non-boss
   * enemies so they read bigger than the swarm.
   */
  sizeClass?: 'minion' | 'miniboss' | 'boss';
  
  /**
   * Optional visual scale multiplier. Applies only to the model's sprite rendering,
   * keeping the logical sizePx (and thus aura sizes, collision) unchanged.
   */
  visualScale?: number;

  // Passive & Skill properties
  stealth?: boolean;
  barrierDamageMultiplier?: number;
  auraRange?: number;
  moraleAura?: boolean;
  fakeHpPadding?: number;
  stealVoicesPerSecond?: number;
  splitOnDeathCount?: number;
  tauntAura?: boolean;
  selfDestructOnBarrier?: boolean;
  selfDestructDamage?: number;
  dropObstacleOnDeath?: boolean;
  knockbackPulseCooldown?: number;
  hitImmunityCount?: number;
  budgetCut?: boolean;
  privatePropertyStun?: boolean;
  isRanged?: boolean;
  splitOnDeathEnemyId?: EnemyId;
  evasionChance?: number;
  
  nextPhaseEnemyId?: EnemyId;
  
  activeSkill?: {
    name: string;
    description?: string;
    effect: 'flood' | 'devour' | 'summonSwarm' | 'summonShieldbearer' | 'sirenBurst' | 'smuggleHp' | 'economyHeist' | 'scatterFakeGold' | 'resurrectAll' | 'fakeNewsBroadcast';
  };
  ai?: {
    skillCooldownMs?: number;
    initialSkillDelayMs?: number;
    castCondition?: 'always' | 'halfHp';
  };
}

/**
 * Rendering constants shared by every enemy type, regardless of stats.
 * Change these to restyle all enemies uniformly; per-type appearance is
 * limited to `color` on EnemyDefinition (see docs/DESIGN_GUIDELINES.md).
 */
export const ENEMY_VISUALS = {
  // Deprecated: never read. Collision uses UNIT_HIT_RADIUS (by size tier) below.
  bodyRadius: 12,
  hpBarWidth: 24,
  hpBarHeight: 4,
  hpBarOffsetY: -20,
  hpBarBackgroundColor: 0x000000,
  hpBarBackgroundAlpha: 0.5,
  hpBarFillColor: 0x22c55e,
  /** At or above this speed (px/sec) a unit's model plays 'run' instead of 'walk'. */
  runSpeedThresholdPxPerSec: 80,
} as const;

/** Render size tiers for battle units. */
export type UnitSizeClass = 'minion' | 'miniboss' | 'hero' | 'boss';

/**
 * Render heights (px) per size tier — the single knob for how big units draw
 * on the battlefield. Visual hierarchy: minion < miniboss < hero < boss.
 * Models cover-fit their art to this height (aspect preserved) and scale
 * their shadows/bars/labels from it.
 */
export const UNIT_RENDER_SIZES: Record<UnitSizeClass, number> = {
  minion: 128,
  miniboss: 180,
  hero: 200,
  boss: 800,
};

/** Resolve an enemy's size tier: explicit sizeClass, else boss ids, else minion. */
export function enemySizeClass(def: EnemyDefinition): UnitSizeClass {
  return def.sizeClass ?? (def.id.startsWith('boss_') ? 'boss' : 'minion');
}

/**
 * Collision body radius (px) per size tier — attacks add this to their own
 * radius/half-width so every hit-test respects how big the target actually is.
 * Deliberately NOT derived from UNIT_RENDER_SIZES: render heights include art
 * whitespace and the boss's 800px spectacle scale, so a boss with a ~400px hit
 * radius would be clipped by anything on its half of the screen. These are
 * gameplay bodies — roughly the unit's torso. If bosses melt after this change,
 * lower `boss` toward 110 before touching anything else.
 */
export const UNIT_HIT_RADIUS: Record<UnitSizeClass, number> = {
  minion: 32, // 128px-tall art, body ~64px wide; keeps old flat hit numbers
  miniboss: 50, // 180px art
  hero: 50, // parity entry; enemy attacks on heroes are out of scope here
  boss: 140, // 800px art, clamped hard vs the render height
};

/** Resolve an enemy's collision body radius from its size tier. */
export function enemyHitRadius(def: EnemyDefinition): number {
  return UNIT_HIT_RADIUS[enemySizeClass(def)];
}

export const ENEMY_DEFINITIONS: Record<EnemyId, EnemyDefinition> = {
  grunt: {
    id: 'grunt',
    name: 'Petty Corruptor',
    
    speed: 70,
    maxHp: 20,
    reward: 5,
    damage: 4,
    attackRateMs: 1500,
    color: 0xef4444,
  },
  runner: {
    id: 'runner',
    name: 'Bribe Runner',
    
    
    speed: 130,
    maxHp: 10,
    reward: 4,
    damage: 3,
    attackRateMs: 900,
    color: 0xeab308,
  },
  brute: {
    id: 'brute',
    name: 'Bureaucratic Thug',
    
    
    speed: 45,
    maxHp: 100,
    reward: 15,
    damage: 10,
    attackRateMs: 2500,
    color: 0x7c3aed,
    sizeClass: 'miniboss',
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
    
    speed: 60,
    maxHp: 40,
    reward: 8,
    damage: 5,
    attackRateMs: 1500,
    color: 0xffffff,
    stealth: true,
  },
  bribery: {
    id: 'bribery',
    name: 'Bribery',
    speed: 100,
    maxHp: 80,
    reward: 15,
    damage: 4,
    attackRateMs: 1500,
    color: 0x16a34a,
    budgetCut: true,
    sizeClass: 'miniboss',
  },
  epal: {
    id: 'epal',
    name: 'Epal',
    
    speed: 55,
    maxHp: 160,
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
    
    
    speed: 40,
    maxHp: 60,
    reward: 10,
    damage: 8,
    attackRateMs: 3000,
    color: 0x818cf8,
    fakeHpPadding: 150,
  },
  kickback_courier: {
    id: 'kickback_courier',
    name: 'Kickback Courier',
    
    speed: 110,
    maxHp: 90,
    reward: 5, // drops extra on death in code
    damage: 5,
    attackRateMs: 1500,
    color: 0x10b981,
    stealVoicesPerSecond: 1,
  },
  shell_company: {
    id: 'shell_company',
    name: 'Shell Company',
    
    
    speed: 45,
    maxHp: 130,
    reward: 12,
    damage: 8,
    attackRateMs: 2000,
    color: 0x64748b,
    splitOnDeathCount: 3,
  },
  crony_bodyguard: {
    id: 'crony_bodyguard',
    name: 'Crony Bodyguard',
    
    speed: 45,
    maxHp: 280,
    reward: 20,
    damage: 6,
    attackRateMs: 2500,
    color: 0x0f172a,
    tauntAura: true,
    sizeClass: 'miniboss',
  },
  hoarder: {
    id: 'hoarder',
    name: 'Hoarder',
    
    
    speed: 35,
    maxHp: 340,
    reward: 25,
    damage: 18,
    attackRateMs: 4000,
    color: 0xca8a04,
    dropObstacleOnDeath: true,
    sizeClass: 'miniboss',
  },
  land_grabber: {
    id: 'land_grabber',
    name: 'Land Grabber',
    
    speed: 40,
    maxHp: 220,
    reward: 18,
    damage: 14,
    attackRateMs: 3000,
    color: 0x4d7c0f,
    privatePropertyStun: true,
    sizeClass: 'miniboss',
  },
  tender_rigger: {
    id: 'tender_rigger',
    name: 'Tender Rigger',
    
    
    speed: 50,
    maxHp: 110,
    reward: 15,
    damage: 12,
    attackRateMs: 2000,
    color: 0xd946ef,
    hitImmunityCount: 20,
  },
  red_tape: {
    id: 'red_tape',
    name: 'Red Tape',
    speed: 30,
    maxHp: 300,
    reward: 20,
    damage: 10,
    attackRateMs: 3000,
    color: 0xef4444,
    sizeClass: 'miniboss',
    tauntAura: true,
  },
  boss_flood_control: {
    id: 'boss_flood_control',
    name: 'Ghost Flood Control',
    
    visualScale: 1.3,
    speed: 30,
    maxHp: 800,
    reward: 50,
    damage: 30,
    attackRateMs: 5000,
    color: 0x0ea5e9,
    fakeHpPadding: 200,
    isRanged: true,
    attackRangePx: 250,
    activeSkill: { name: 'Flash Flood', effect: 'flood' }
  },
  boss_pork_barrel: {
    id: 'boss_pork_barrel',
    name: 'Pork Barrel',
    speed: 30,
    maxHp: 1200,
    reward: 100,
    damage: 50,
    attackRateMs: 6000,
    color: 0xdb2777,
    tauntAura: true,
    isRanged: true,
    attackRangePx: 250,
    activeSkill: { name: 'Devour Funds', effect: 'devour' }
  },
  boss_troll_farm: {
    id: 'boss_troll_farm',
    name: 'Troll Farm',
    speed: 30,
    maxHp: 700,
    reward: 50,
    damage: 15,
    attackRateMs: 4000,
    color: 0x3f3f46,
    selfDestructOnBarrier: true,
    selfDestructDamage: 200,
    evasionChance: 0.3,
    isRanged: true,
    attackRangePx: 250,
    activeSkill: { name: 'Fake News Broadcast', effect: 'fakeNewsBroadcast' },
    ai: {
      skillCooldownMs: 8000,
      initialSkillDelayMs: 4000,
      castCondition: 'always'
    }
  },
  boss_vote_buying: {
    id: 'boss_vote_buying',
    name: 'Vote Buying',
    
    speed: 35,
    maxHp: 600,
    reward: 75,
    damage: 20,
    attackRateMs: 3500,
    color: 0xeab308,
    stealVoicesPerSecond: 1,
    isRanged: true,
    attackRangePx: 250,
    activeSkill: { name: 'Bribe', effect: 'scatterFakeGold' }
  },
  boss_nepotism: {
    id: 'boss_nepotism',
    name: 'Nepotism',
    
    speed: 30,
    maxHp: 900,
    reward: 80,
    damage: 25,
    attackRateMs: 4500,
    color: 0x9333ea,
    splitOnDeathCount: 3,
    splitOnDeathEnemyId: 'minion_nepotism',
    isRanged: true,
    attackRangePx: 250,
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
    isRanged: true,
    attackRangePx: 250,
    activeSkill: { name: 'VIP Convoy', effect: 'sirenBurst' }
  },
  boss_budget_insertion: {
    id: 'boss_budget_insertion',
    name: 'Budget Insertion',
    
    speed: 30,
    maxHp: 1000,
    reward: 100,
    damage: 40,
    attackRateMs: 5000,
    color: 0x14b8a6,
    fakeHpPadding: 1500,
    isRanged: true,
    attackRangePx: 250,
    visualScale: 1.8,
    activeSkill: { name: 'Smuggle Funds', effect: 'smuggleHp' }
  },
  boss_smuggling: {
    id: 'boss_smuggling',
    name: 'Smuggling',
    speed: 35,
    maxHp: 750,
    reward: 80,
    damage: 25,
    attackRateMs: 3000,
    color: 0xf59e0b,
    evasionChance: 0.25,
    isRanged: true,
    attackRangePx: 250,
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
    stealVoicesPerSecond: 2,
    isRanged: true,
    attackRangePx: 250,
    spriteKey: 'boss_dynasty',
  },
  boss_dynasty_2: {
    id: 'boss_dynasty_2',
    name: 'The Dynasty (Schemer)',
    speed: 35,
    maxHp: 600,
    reward: 0,
    damage: 30,
    attackRateMs: 3000,
    color: 0xa21caf,
    hitImmunityCount: 20,
    isRanged: true,
    attackRangePx: 250,
    nextPhaseEnemyId: 'boss_dynasty_3',
    spriteKey: 'boss_dynasty',
  },
  boss_dynasty_1: {
    id: 'boss_dynasty_1',
    name: 'The Dynasty (Bruiser)',
    speed: 30,
    maxHp: 800,
    reward: 0,
    damage: 50,
    attackRateMs: 5000,
    color: 0x701a75,
    tauntAura: true,
    isRanged: true,
    attackRangePx: 250,
    nextPhaseEnemyId: 'boss_dynasty_2',
    spriteKey: 'boss_dynasty',
  },
  boss_ang_sistema: {
    id: 'boss_ang_sistema',
    name: 'Ang Sistema',
    
    speed: 30,
    maxHp: 2500,
    reward: 500,
    damage: 80,
    attackRateMs: 6000,
    color: 0x000000,
    budgetCut: true,
    tauntAura: true,
    isRanged: true,
    attackRangePx: 250,
    activeSkill: { name: 'Horde Convergence', effect: 'resurrectAll' }
  },
  minion_nepotism: {
    id: 'minion_nepotism',
    name: 'Unqualified Relative',
    sizeClass: 'minion',
    speed: 30,
    maxHp: 100,
    reward: 5,
    damage: 5,
    attackRateMs: 2000,
    color: 0x9333ea,
    isRanged: true,
    attackRangePx: 250,
  }
};


// Map JSON lore and names directly onto definitions at runtime
for (const [id, def] of Object.entries(ENEMY_DEFINITIONS)) {
  const jsonDef = (anomaliesLore as any)[id];
  if (jsonDef) {
    if (jsonDef.name) def.name = jsonDef.name;
    if (jsonDef.lore) def.lore = jsonDef.lore;
  }
}
