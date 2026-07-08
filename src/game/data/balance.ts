export type EnemyId = 'grunt' | 'runner' | 'brute' | 'sandbox_target' | 'ghost_employee' | 'illegal_logger' | 'epal' | 'the_overpriced' | 'kickback_courier' | 'shell_company' | 'crony_bodyguard' | 'hoarder' | 'land_grabber' | 'tender_rigger' | 'boss_flood_control' | 'boss_pork_barrel' | 'boss_troll_farm' | 'boss_vote_buying' | 'boss_nepotism' | 'boss_wang_wang' | 'boss_budget_insertion' | 'boss_smuggling' | 'boss_dynasty_1' | 'boss_dynasty_2' | 'boss_dynasty_3' | 'boss_ang_sistema';
import type { DamageType } from '../core/Damage';

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
  boss: 333,
};

/** Resolve an enemy's size tier: explicit sizeClass, else boss ids, else minion. */
export function enemySizeClass(def: EnemyDefinition): UnitSizeClass {
  return def.sizeClass ?? (def.id.startsWith('boss_') ? 'boss' : 'minion');
}

/**
 * "Global" range for the portrait battlefield — covers the full 1080×1920
 * viewport, so a hero with this range can hit anything on screen. Eden's
 * anchor value; other heroes ladder below it (melee ≈180-220, short ≈550-700,
 * long ≈780-1100). Mirrors GAME_HEIGHT (level.ts imports balance, so the
 * literal lives here to avoid a circular import).
 */
export const GLOBAL_RANGE_PX = 1920;

/**
 * Display scale: gameplay positions, ranges (px) and speeds (px/sec) live in
 * the internal 960×540 Phaser field. Player-facing UI renders distances in
 * "meters" and speeds in "m/s" so the numbers read like a real street rally.
 * Purely presentational — all gameplay math stays in pixels.
 */
export const PIXELS_PER_METER = 20;

/** Format an internal px distance as a compact meters label (e.g. "7.5 m"). */
export function metersLabel(px: number): string {
  const m = px / PIXELS_PER_METER;
  return `${Number.isInteger(m) ? m : m.toFixed(1)} m`;
}

/** Format an internal px/sec speed as a compact m/s label (e.g. "3 m/s"). */
export function metersPerSecondLabel(pxPerSec: number): string {
  const mps = pxPerSec / PIXELS_PER_METER;
  return `${Number.isInteger(mps) ? mps : mps.toFixed(1)} m/s`;
}

export const ENEMY_DEFINITIONS: Record<EnemyId, EnemyDefinition> = {
  grunt: {
    id: 'grunt',
    name: 'Grunt',
    speed: 70,
    maxHp: 45,
    reward: 5,
    damage: 6,
    attackRateMs: 1500,
    color: 0xef4444,
  },
  runner: {
    id: 'runner',
    name: 'Runner',
    speed: 130,
    maxHp: 25,
    reward: 4,
    damage: 4,
    attackRateMs: 900,
    color: 0xeab308,
  },
  brute: {
    id: 'brute',
    name: 'Brute',
    speed: 45,
    maxHp: 180,
    reward: 15,
    damage: 16,
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
    maxHp: 70,
    reward: 8,
    damage: 8,
    attackRateMs: 1500,
    color: 0xffffff,
    stealth: true,
  },
  illegal_logger: {
    id: 'illegal_logger',
    name: 'Illegal Logger',
    speed: 40,
    maxHp: 240,
    reward: 20,
    damage: 10,
    attackRateMs: 2800,
    color: 0x8b4513,
    barrierDamageMultiplier: 5,
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
    name: 'Crony',
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
    knockbackPulseCooldown: 5000,
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
    hitImmunityCount: 5,
  },
  boss_flood_control: {
    id: 'boss_flood_control',
    name: 'Ghost Flood Control',
    speed: 30,
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
    speed: 30,
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
    speed: 30,
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
    speed: 35,
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
    speed: 30,
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
    speed: 30,
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
    speed: 35,
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
    speed: 35,
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
    speed: 30,
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
    speed: 30,
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
  // Sized for the 20-wave battle: wave-scaled minions chew through anything
  // smaller before the finale (see WAVE_SCALING in data/waves.ts).
  maxHp: 750,
  height: 80,
};


export interface HeroDefinition {
  id: HeroId;
  name: string;
  profession: string;
  damageType: DamageType;
  attackKind: 'melee' | 'ranged';
  attackStyle: 'projectile' | 'melee-cleave' | 'beam' | 'lobbed' | 'pierce' | 'chain' | 'trap' | 'vortex' | 'linear-wave' | 'summoner' | 'boomerang';
  range: number;
  damage: number;
  attackRateMs: number;
  color: number; // Hex color for the character placeholder
  portraitKey?: string; // Key for the character's portrait asset
  spriteKey?: string; // Key for the in-game character sprite
  /**
   * One-line "what this hero DOES", shown on the summon drop card so the
   * player can judge a recruit at a glance (docs/VOICE_DROPS.md). Present on
   * every recruitable hero; omitted on sandbox testers (UI falls back to
   * profession).
   */
  purpose?: string;
  /**
   * Pierce heroes only: how many enemies a single straight-line shot passes
   * THROUGH before expiring, before +pierce upgrades. Total hits =
   * basePierce + bonusPierce (AttackModifiers). See the pierce spec in
   * docs/VOICE_DROPS.md — engineer replaces the current homing-projectile
   * stand-in with a non-homing line shot that reads this field.
   */
  basePierce?: number;
  /**
   * Chain heroes only: how many targets a bolt arcs to, before +chain
   * upgrades. Engineer: ChainAttack maxJumps = baseChain + bonusChain
   * (replaces the hardcoded 3 in Attacks.ts).
   */
  baseChain?: number;
  signatureSkill: {
    name: string;
    shortName?: string;
    description: string;
  };
  passive?: {
    name: string;
    description: string;
  };
  projectileColor?: number;
  canSeeStealth?: boolean;
  cutInDurationMs?: number;
  /** Top/bottom inset for the framed cut-in. 0 = fullscreen height. */
  cutInMarginY?: number;
  /** Left/right inset for the framed cut-in. 0 = fullscreen width. */
  cutInMarginX?: number;
  /** Zoom the art inside the frame (1 = cover-fit). Use when art has padding. */
  cutInArtScale?: number;
  /** Nudge the art inside the frame, in px. */
  cutInArtOffsetX?: number;
  cutInArtOffsetY?: number;
  cutInPosition?: 'left' | 'right';
  /** If the portrait is an animated spritesheet, define its geometry here. */
  cutInAnim?: {
    frameWidth: number;
    frameHeight: number;
    frames: number;
  };
}

/**
 * Compact attack-type hint rendered as a chip under each hero in battle, so
 * the player can tell attack styles apart at a glance (playtest feedback).
 * Purely presentational — glyph + short word on a colored chip.
 */
export const ATTACK_STYLE_BADGES: Record<HeroDefinition['attackStyle'], { label: string; background: string }> = {
  projectile: { label: '➤ shot', background: '#38bdf8' },
  'melee-cleave': { label: '⚔ cleave', background: '#f87171' },
  beam: { label: '☄ beam', background: '#f472b6' },
  lobbed: { label: '➶ lobbed', background: '#facc15' },
  pierce: { label: '⇶ pierce', background: '#fb923c' },
  chain: { label: '⚡ chain', background: '#fde047' },
  trap: { label: '✹ trap', background: '#a78bfa' },
  vortex: { label: '◎ vortex', background: '#22d3ee' },
  'linear-wave': { label: '≋ wave', background: '#60a5fa' },
  summoner: { label: '⛨ summon', background: '#fbbf24' },
  boomerang: { label: '↩ rang', background: '#4ade80' },
};

export const HERO_DEFINITIONS: Record<HeroId, HeroDefinition> = {
  eden: {
    id: 'eden',
    name: 'Eden',
    profession: 'Community Organizer',
    damageType: 'Physical',
    attackKind: 'ranged',
    attackStyle: 'projectile',
    range: GLOBAL_RANGE_PX, // Eden — global, hits anywhere on screen
    damage: 12, // global range taxes DPS — Eden is the floor, not the carry
    attackRateMs: 1300,
    color: 0x3b82f6,
    purpose: 'Reliable all-rounder — hurls megaphones at the frontmost anomaly. Always deployed, she is your steady damage floor.',
    signatureSkill: { name: 'Rally', shortName: 'Rally', description: 'Massive attack speed buff to all deployed heroes.' },
    passive: { name: 'Voice of the People', description: 'Generates 1 Voice every 10 seconds.' },
    projectileColor: 0x60a5fa,
    portraitKey: 'eden_cutin', // 8x5 sheet, 40 frames. Master: docs/references/eden_cutin.png
    // (1024px/frame); shipped sheet is downscaled to 512px/frame (4096x2560) to
    // stay within mobile WebGL texture/VRAM limits under Capacitor.
    spriteKey: 'eden', // Aseprite atlas key — loaded in GameScene.preload once eden.png/.json exist.
    cutInDurationMs: 3500, // Full 40-frame cut-in playthrough
    cutInMarginY: 0, // Fullscreen cut-in
    cutInMarginX: 0,
    cutInArtScale: 1,
    cutInPosition: 'left',
    cutInAnim: {
      frameWidth: 512,
      frameHeight: 512,
      frames: 40,
    },
  },
  teacher: {
    id: 'teacher',
    name: 'Teacher',
    profession: 'Public School Teacher',
    damageType: 'Physical',
    attackKind: 'ranged',
    attackStyle: 'boomerang',
    range: 1250,
    damage: 8, // per-hit; boomerang double-taps on the return
    attackRateMs: 1500,
    color: 0x8b5cf6,
    purpose: 'Two-hit boomerang ruler (out and back) that marks anomalies for bonus damage — strong against single tough targets.',
    signatureSkill: { name: 'Silence', shortName: 'Silence', description: 'Silences all enemy auras globally for 10 seconds.' },
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
    range: 1000,
    damage: 7, // per-hit; lands on up to basePierce+1 enemies in a line
    attackRateMs: 1100,
    basePierce: 2,
    color: 0xf59e0b,
    purpose: 'Slingshot pebbles punch through a line of 2 enemies — and every enhancement you feed the squad lands at 1.5x on his picks.',
    signatureSkill: { name: 'Cramming', shortName: 'Cramming', description: 'Self-buffs Attack Speed for 10s and instantly hurls a rapid burst of randomized elemental projectiles.' },
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
    range: 275,
    damage: 22, // top melee DPS — frontline risk pays
    attackRateMs: 1250,
    color: 0x10b981,
    purpose: 'Frontline cleaver — revs into clustered enemies and hits Bosses extra hard. A durable bruiser, not a sniper.',
    signatureSkill: { name: 'Barya Lang Po', shortName: 'Barya', description: 'Tosses coin shrapnel for massive shotgun AoE damage.' },
    passive: { name: 'Hari ng Kalsada', description: 'Deals bonus damage to Bosses.' },
  },
  fisherfolk: {
    id: 'fisherfolk',
    name: 'Fisherfolk',
    profession: 'Fisher',
    damageType: 'Water',
    attackKind: 'ranged',
    attackStyle: 'vortex',
    range: 700,
    damage: 8,
    attackRateMs: 3500,
    color: 0x0ea5e9,
    purpose: 'Support net — clumps enemies and soaks them Wet, setting up Lightning and Freeze combos. Low direct damage by design.',
    signatureSkill: { name: 'Lambat', shortName: 'Lambat', description: 'Casts a net dragging enemies from off-lanes into the center.' },
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
    range: 300,
    damage: 16,
    attackRateMs: 2200,
    color: 0xa8a29e,
    purpose: 'Sweeps a debris wave across the whole frontline, hitting everything in the lane; shreds Obstacles and Traps.',
    signatureSkill: { name: 'Dust Storm', shortName: 'Dust', description: 'Blinds enemies, reducing speed and damage by 50%.' },
    passive: { name: 'Clean Sweep', description: 'Deals 10x damage to Obstacles and Traps.' },
  },
  taho_vendor: {
    id: 'taho_vendor',
    name: 'Taho Vendor',
    profession: 'Street Vendor',
    damageType: 'Frost',
    attackKind: 'ranged',
    attackStyle: 'lobbed',
    range: 725,
    damage: 11,
    attackRateMs: 1700,
    color: 0xe2e8f0,
    purpose: 'Lobs scalding syrup that slows and splashes a small area; strips enemy speed buffs off whatever it hits.',
    signatureSkill: { name: 'Hot Syrup', shortName: 'Syrup', description: 'Sticky puddle that permanently strips enemy speed buffs.' },
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
    range: 950,
    damage: 8,
    attackRateMs: 1500,
    color: 0xfca5a5,
    purpose: 'Support striker — alcohol sprays heal any ally summon they pass through, and hit undead anomalies for +50%.',
    signatureSkill: { name: 'Heal', shortName: 'Heal', description: 'Restores 150 HP to the barricade.' },
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
    range: 325,
    damage: 18, // summoner damage = wall HP knob, not DPS
    attackRateMs: 5000,
    color: 0xd97706,
    purpose: 'Builds Yero barricades that body-block the path (wall HP scales with his damage). Buys time, not damage.',
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
    range: 1400, // longest non-global reach — sniper tier taxes the DPS
    damage: 13,
    attackRateMs: 1600,
    baseChain: 3,
    color: 0xfef08a,
    purpose: 'Headset feedback arcs to 3 enemies at once and can target Stealth; excellent against Wet clumps.',
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
    range: 250,
    damage: 21,
    attackRateMs: 1300,
    color: 0x1e3a8a,
    purpose: 'Batuta bruiser who holds the frontline and cleaves enemies in front; deals double damage to Stealth anomalies.',
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
    range: 250,
    damage: 19,
    attackRateMs: 1400,
    color: 0x15803d,
    purpose: 'Scythe cleaver that periodically Roots enemies in place; his Harvest skill detonates their stacked ailments.',
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
    range: 1025,
    damage: 9, // per-hit across up to 5 pierced enemies — group DPS is the payoff
    attackRateMs: 1300,
    basePierce: 5,
    color: 0xf43f5e,
    purpose: 'Skewers a whole line — one Tuhog throw pierces up to 5 anomalies. The squad\'s premier line-clearer.',
    signatureSkill: { name: 'Spicy Sauce', description: 'Ignites all pierced enemies, causing panic.' },
    passive: { name: 'Tuhog', description: 'Attacks pierce up to 5 enemies in a line.' },
    projectileColor: 0xfca5a5,
  },
  sandbox_projectile: { id: 'sandbox_projectile', name: 'Test: Projectile', profession: 'Tester', damageType: 'Physical', attackKind: 'ranged', attackStyle: 'projectile', range: 500, damage: 20, attackRateMs: 1000, color: 0x9ca3af, signatureSkill: { name: 'None', description: '' } },
  sandbox_melee_cleave: { id: 'sandbox_melee_cleave', name: 'Test: Melee Cleave', profession: 'Tester', damageType: 'Physical', attackKind: 'melee', attackStyle: 'melee-cleave', range: 700, damage: 20, attackRateMs: 1000, color: 0x9ca3af, signatureSkill: { name: 'None', description: '' } },
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
    range: 1000,
    damage: 4,
    attackRateMs: 500, // Very fast — fastest attacker in the game
    color: 0xec4899,
    purpose: 'Machine-gun sales pitch — the fastest attack in the game, chipping the whole line and executing low-HP stragglers.',
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
    range: 625,
    damage: 12,
    attackRateMs: 3000,
    color: 0xf472b6,
    purpose: 'Drops sticky ice puddles that freeze whatever steps on them — zone control that punishes tight lanes.',
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
    range: 1125,
    damage: 14,
    attackRateMs: 1600,
    baseChain: 3,
    color: 0x38bdf8,
    purpose: 'Jumper cables that always bounce to 3 nearby targets — reliable, steady horde clear.',
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
    range: 775,
    damage: 13,
    attackRateMs: 1800,
    color: 0xef4444,
    purpose: 'Lobs hot pandesal that explodes in fire splash and leaves a burning zone — sustained AoE against packed waves.',
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
    range: 650,
    damage: 8,
    attackRateMs: 3800,
    color: 0x475569,
    purpose: 'Whistle-and-STOP crowd control — magnetically pulls enemies into a tight clump for the squad to blast. Low damage, high setup.',
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
    range: 900,
    damage: 10,
    attackRateMs: 2400,
    color: 0x2563eb,
    purpose: 'High-pressure wave that hits the whole line, nudges enemies back, and soaks them Wet for combo setups.',
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
    range: 1300,
    damage: 9, // per-hit; two-tap plus Rush Hour ramp is the real DPS
    attackRateMs: 1500,
    color: 0x22c55e,
    purpose: 'Returning parcels hit twice and ramp up the longer they focus one target — a single-target melter that grows mid-fight.',
    signatureSkill: { name: 'Kamote Riders', description: 'Summons 3 AI riders that crash into the horde and explode.' },
    passive: { name: 'Rush Hour', description: 'Attack speed ramps up the longer they attack the same target.' },
    projectileColor: 0x86efac,
  }
};

// ============================================================================
// VOICE-DROP PROGRESSION  (design: docs/VOICE_DROPS.md)
// ----------------------------------------------------------------------------
// Kills fill the Voices meter; a full meter triggers one RNG drop, then the
// requirement scales up. The cadence is derived from the run's TOTAL kill pool
// so a full clear always yields ~targetDropsPerRun drops, and it re-scales for
// free if wave counts change. Replaces the old "start at 3, +1 forever" rule,
// which was decoupled from how many kills a run actually offers.
// ============================================================================

/**
 * Max heroes deployed at once (Eden + 4 recruited slots). Gates the `newHero`
 * drop: once full, recruit drops stop being offered (docs/VOICE_DROPS.md).
 */
export const MAX_ACTIVE_HEROES = 5;

export const VOICE_DROP_TUNING = {
  /** Kills required for the very first drop. Small, so a companion arrives fast. */
  firstDropCost: 2,
  /**
   * How many drop EVENTS a full clear should yield (4 fill Eden's squad, the
   * rest are enhancements). Must stay <= TOTAL_WAVES (data/waves.ts) — at most
   * one drop per wave on average; tests/unit/balance.test.ts enforces it.
   */
  targetDropsPerRun: 20,
  /** Floor on the per-drop increment so late drops never get cheaper than this. */
  minIncrement: 1,
} as const;

/**
 * @deprecated The prototype's triangular wave structure (wave N = N * 5
 * grunts) is gone — battles now run the authored 20-wave table, so the pool
 * comes from `authoredKillCount(buildWaveTable(...))` in data/waves.ts.
 * Split/summon spawns remain bonus on top — the pool is intentionally the
 * *authored* kill count, not the runtime maximum.
 */
export function computeKillPool(totalWaves: number, baseWaveSize = 5): number {
  return (baseWaveSize * totalWaves * (totalWaves + 1)) / 2;
}

/**
 * Incremental voices required before drop #dropIndex (0-based) fires, given
 * the run's kill pool. Linear-growth thresholds tuned so exactly
 * targetDropsPerRun drops land across the pool.
 *
 *   step = 2 * (pool - D * firstDropCost) / (D * (D - 1))
 *   cost(k) = round(firstDropCost + k * step)
 *
 * Engineer: track a `dropIndex` counter in GameScene; set the next
 * `maxVoicesCount` to `voiceDropCost(dropIndex, computeKillPool(totalWaves))`
 * after each drop instead of the current `maxVoicesCount += 1`.
 */
export function voiceDropCost(dropIndex: number, killPool: number): number {
  const { firstDropCost, targetDropsPerRun: drops, minIncrement } = VOICE_DROP_TUNING;
  const step = Math.max(minIncrement, (2 * (killPool - drops * firstDropCost)) / (drops * (drops - 1)));
  return Math.max(1, Math.round(firstDropCost + dropIndex * step));
}

// ============================================================================
// UPGRADE MATRIX  (design: docs/VOICE_DROPS.md)
// ----------------------------------------------------------------------------
// What the Voices RNG is allowed to offer. Two buckets:
//   1. Hero-targeted upgrades — applied to ONE active hero. Which kinds are
//      eligible depends on that hero's attackStyle (UPGRADE_MATRIX).
//   2. Global drops — recruit a new hero, or patch the Barrier.
// Magnitudes/rarity/copy live here; the RNG (core/Drops.ts, engineer) reads
// this, filters out anything that can't apply ("no dead drops"), weights by
// rarity, and applies via `apply`.
// ============================================================================

/** DropRarity mirrors the union in core/GameEvents.ts (kept in sync deliberately). */
export type DropRarity = 'common' | 'rare' | 'epic';

export type UpgradeKind =
  // universal — every attackStyle can roll these (hero-targeted stat sticks)
  | 'damage' | 'attackSpeed' | 'range'
  // behavior — style-specific; map onto the AttackModifiers already in Attacks.ts
  | 'pierce' | 'chain' | 'radius';

export interface UpgradeSpec {
  kind: UpgradeKind;
  /** Card title shown to the player. */
  title: string;
  /** "what this improves and by how much" — the drop card body copy. */
  purpose: string;
  rarity: DropRarity;
  /** Per-pick magnitude. Interpretation depends on `apply`. */
  magnitude: number;
  /**
   * How the engineer applies one pick:
   *  - 'flatDamage'      -> hero.damage += magnitude
   *  - 'attackSpeedMult' -> hero.attackRateMs = max(200, hero.attackRateMs * magnitude)
   *  - 'flatRange'       -> hero.range += magnitude
   *  - 'bonusPierce'     -> hero AttackModifiers.bonusPierce += magnitude
   *  - 'bonusChain'      -> hero AttackModifiers.bonusChain += magnitude
   *  - 'bonusRadius'     -> hero AttackModifiers.bonusRadius += magnitude
   * NOTE (engineer): behavior mods must be stored ON the Hero and passed into
   * every Attack it spawns. Today GameScene builds Attacks with no persisted
   * modifiers, so pierce/chain/radius upgrades have nowhere to land yet.
   */
  apply: 'flatDamage' | 'attackSpeedMult' | 'flatRange' | 'bonusPierce' | 'bonusChain' | 'bonusRadius';
  /** Cap on how many times this can stack on a single hero (feeds "no dead drops"). */
  maxStacks: number;
}

export const UPGRADE_DEFS: Record<UpgradeKind, UpgradeSpec> = {
  damage: {
    kind: 'damage', title: 'Damage Up', purpose: '+6 damage to this hero\'s attacks.',
    rarity: 'common', magnitude: 6, apply: 'flatDamage', maxStacks: 5,
  },
  attackSpeed: {
    kind: 'attackSpeed', title: 'Attack Speed Up', purpose: 'This hero attacks 15% faster.',
    rarity: 'common', magnitude: 0.85, apply: 'attackSpeedMult', maxStacks: 5,
  },
  range: {
    kind: 'range', title: 'Range Up', purpose: '+40 reach up the lane for this hero.',
    rarity: 'rare', magnitude: 40, apply: 'flatRange', maxStacks: 3,
  },
  pierce: {
    kind: 'pierce', title: 'Piercing Shot', purpose: 'This hero\'s shots punch through 1 more enemy.',
    rarity: 'rare', magnitude: 1, apply: 'bonusPierce', maxStacks: 3,
  },
  chain: {
    kind: 'chain', title: 'Extra Arc', purpose: 'This hero\'s bolt jumps to 1 more target.',
    rarity: 'rare', magnitude: 1, apply: 'bonusChain', maxStacks: 3,
  },
  radius: {
    kind: 'radius', title: 'Wider Blast', purpose: '+15 area radius on this hero\'s attacks.',
    rarity: 'rare', magnitude: 15, apply: 'bonusRadius', maxStacks: 3,
  },
};

/**
 * Which upgrade kinds each attackStyle can be offered. Universal stats
 * (damage/attackSpeed/range) are on every list; behavior mods only where the
 * style actually consumes them in Attacks.ts.
 */
export const UPGRADE_MATRIX: Record<HeroDefinition['attackStyle'], UpgradeKind[]> = {
  projectile:    ['damage', 'attackSpeed', 'range', 'pierce'],
  pierce:        ['damage', 'attackSpeed', 'range', 'pierce'],
  chain:         ['damage', 'attackSpeed', 'range', 'chain'],
  boomerang:     ['damage', 'attackSpeed', 'range', 'radius'],
  beam:          ['damage', 'attackSpeed', 'range', 'radius'],
  'melee-cleave':['damage', 'attackSpeed', 'range', 'radius'],
  lobbed:        ['damage', 'attackSpeed', 'range', 'radius'],
  vortex:        ['damage', 'attackSpeed', 'range', 'radius'],
  trap:          ['damage', 'attackSpeed', 'range', 'radius'],
  'linear-wave': ['damage', 'attackSpeed', 'range', 'radius'],
  // Summoner damage = wall HP; no behavior mod, stats only.
  summoner:      ['damage', 'attackSpeed', 'range'],
};

export type GlobalDropKind = 'newHero' | 'moraleHeal';

export interface GlobalDropSpec {
  kind: GlobalDropKind;
  title: string;
  purpose: string;
  rarity: DropRarity;
  /** Barrier HP restored for 'moraleHeal'; unused otherwise. */
  magnitude: number;
}

export const GLOBAL_DROP_DEFS: Record<GlobalDropKind, GlobalDropSpec> = {
  newHero: {
    kind: 'newHero', title: 'New Worker',
    purpose: 'Recruit an unlocked worker into an open squad slot.',
    rarity: 'common', magnitude: 0,
  },
  moraleHeal: {
    kind: 'moraleHeal', title: 'Barrier Patch',
    purpose: 'Restore 150 Barrier integrity instantly.',
    rarity: 'common', magnitude: 150,
  },
};

/**
 * Base pull weight per rarity — the wave-1 baselines. Later waves multiply
 * rare/epic weights via `rarityWeightsForWave` (docs/WORLD_AND_HEROES.md
 * rule 6, "rarity scales with waves").
 */
export const DROP_RARITY_WEIGHTS: Record<DropRarity, number> = {
  common: 100,
  rare: 35,
  epic: 10,
};

/**
 * Rarity weights for a drop rolled on the given wave (1-based). Common stays
 * flat while rare/epic grow linearly, so late-battle drops skew exciting:
 * by wave 20 rare is ~2x and epic ~2.9x their baseline pull.
 */
export function rarityWeightsForWave(wave: number): Record<DropRarity, number> {
  const n = Math.max(0, wave - 1);
  return {
    common: DROP_RARITY_WEIGHTS.common,
    rare: DROP_RARITY_WEIGHTS.rare * (1 + 0.05 * n),
    epic: DROP_RARITY_WEIGHTS.epic * (1 + 0.10 * n),
  };
}
