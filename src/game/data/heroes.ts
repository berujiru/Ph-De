import type { DamageType } from '../core/Damage';
import { GLOBAL_RANGE_PX } from './constants';

export type HeroId = 'eden' | 'teacher' | 'student' | 'jeepney_driver' | 'fisherfolk' | 'street_sweeper' | 'taho_vendor' | 'nurse' | 'construction_worker' | 'call_center_agent' | 'security_guard' | 'farmer' | 'fishball_vendor' | 'sales_lady' | 'sorbetes_vendor' | 'electrician' | 'baker' | 'traffic_enforcer' | 'plumber' | 'delivery_rider' | 'sandbox_projectile' | 'sandbox_melee_cleave' | 'sandbox_beam' | 'sandbox_lobbed' | 'sandbox_pierce' | 'sandbox_chain' | 'sandbox_trap' | 'sandbox_vortex' | 'sandbox_linear_wave' | 'sandbox_summoner' | 'sandbox_boomerang';

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
  /**
   * SVG stem for this hero's basic-attack visual —
   * `public/assets/attacks/<stem>.svg`. Authored white/grayscale, pointing
   * +X; the engine tints it with DAMAGE_TYPE_COLORS[damageType] at runtime
   * (see src/game/data/attackArt.ts). Omit to use the attack style's default
   * art (sandbox testers do this).
   */
  attackArt?: string;
  /**
   * Chain heroes only: how the arc between strike points is drawn.
   * 'crackle' (default) is the jagged electric zigzag (Electrician);
   * 'vine' is a smooth bowed tendril with leaves (Farmer's root lash).
   */
  chainArt?: 'crackle' | 'vine';
  /**
   * Flight speed of this hero's basic-attack projectile in px/s (flight
   * styles only: projectile/pierce/boomerang/lobbed/linear-wave). Omit to use
   * the style default in src/game/data/attackSpeed.ts. Heavy projectiles
   * fly slow (~400), light sharp ones fast (~850).
   */
  projectileSpeed?: number;
  /**
   * In-flight sprite length in px (along the art's +X). Omit to use the
   * style default in STYLE_DEFAULT_SIZE (attackArt.ts). Override for
   * naturally long silhouettes (skewer, pencil) or compact ones.
   */
  projectileSizePx?: number;
  canSeeStealth?: boolean;
  /** Cooldown in milliseconds for the signature skill. Defaults to 40000ms (40s) if omitted. */
  skillCooldownMs?: number;
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
    attackArt: 'megaphone',
    projectileSpeed: 550,
    portraitKey: 'eden_cutin', // 8x5 sheet, 40 frames. Master: docs/references/eden_cutin.png
    // (1024px/frame); shipped sheet is downscaled to 512px/frame (4096x2560) to
    // stay within mobile WebGL texture/VRAM limits under Capacitor.
    spriteKey: 'eden', // Aseprite atlas key — loaded in GameScene.preload once eden.png/.json exist.
    cutInDurationMs: 1500, // Full 40-frame cut-in playthrough
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
    range: 1350,
    damage: 8, // per-hit; boomerang double-taps on the return
    attackRateMs: 1500,
    color: 0x8b5cf6,
    purpose: 'Two-hit boomerang ruler (out and back) that marks anomalies for bonus damage — strong against single tough targets.',
    signatureSkill: { name: 'Silence', shortName: 'Silence', description: 'Silences all enemy auras globally for 10 seconds.' },
    passive: { name: 'Fact Check', description: 'Instantly pops and destroys Fake HP padding.' },
    attackArt: 'ruler',
    projectileSpeed: 450,
    projectileSizePx: 84, // rulers are long by nature
  },
  student: {
    id: 'student',
    name: 'Student',
    profession: 'Working Student',
    damageType: 'Physical',
    attackKind: 'ranged',
    attackStyle: 'pierce',
    range: 1200,
    damage: 8, // retuned 2026-07: collision fix (was 7) — hits only bodies the dart traverses now
    // per-hit; lands on up to basePierce+1 enemies in a line
    attackRateMs: 1100,
    basePierce: 2,
    color: 0xf59e0b,
    purpose: 'Slingshot pebbles punch through a line of 2 enemies — and every enhancement you feed the squad lands at 1.5x on his picks.',
    signatureSkill: { name: 'Cramming', shortName: 'Cramming', description: 'Self-buffs Attack Speed for 10s and instantly hurls a rapid burst of randomized elemental projectiles.' },
    passive: { name: 'Overachiever', description: 'Enhancement drops apply at 1.5x potency.' },
    attackArt: 'pencil',
    projectileSpeed: 850,
    projectileSizePx: 88, // slim dart, not a jousting lance
  },
  jeepney_driver: {
    id: 'jeepney_driver',
    name: 'Jeepney Driver',
    profession: 'Driver',
    damageType: 'Wind',
    attackKind: 'melee',
    attackStyle: 'melee-cleave',
    range: 550,
    damage: 22, // top melee DPS — frontline risk pays
    attackRateMs: 1400, // slowed 2026-07: 17.6 DPS busted the bruiser band
    color: 0x10b981,
    purpose: 'Frontline cleaver — revs into clustered enemies and hits Bosses extra hard. A durable bruiser, not a sniper.',
    signatureSkill: { name: 'Barya Lang Po', shortName: 'Barya', description: 'Blasts his coin dispenser like a shotgun — a cone of peso shrapnel deals massive AoE damage and the muzzle gust knocks enemies back.' },
    passive: { name: 'Hari ng Kalsada', description: 'Deals bonus damage to Bosses.' },
    attackArt: 'wrench',
  },
  fisherfolk: {
    id: 'fisherfolk',
    name: 'Fisherfolk',
    profession: 'Fisher',
    damageType: 'Water',
    attackKind: 'ranged',
    attackStyle: 'vortex',
    range: 950,
    damage: 8,
    attackRateMs: 3500,
    color: 0x0ea5e9,
    purpose: 'Support net — clumps enemies and soaks them Wet, setting up Lightning and Freeze combos. Low direct damage by design.',
    signatureSkill: { name: 'Lambat', shortName: 'Lambat', description: 'Casts a net dragging enemies from off-lanes into the center.' },
    passive: { name: 'Deep Water', description: 'Attacks apply Wet (amplifies lightning damage).' },
    attackArt: 'net',
  },
  street_sweeper: {
    id: 'street_sweeper',
    name: 'Street Sweeper',
    profession: 'Barangay Sweeper',
    damageType: 'Earth',
    attackKind: 'ranged',
    attackStyle: 'pierce',
    range: 1150,
    basePierce: 2, // retuned 2026-07: collision fix (was 1) — "pierce 1 additional" never worked (max(1,1+0)=1)
    damage: 16,
    attackRateMs: 2200,
    color: 0xa8a29e,
    attackArt: 'debris',
    projectileSpeed: 450,
    projectileSizePx: 92, // loose clump reads better a touch wide
    purpose: 'Throws gathered debris at enemies from a distance.',
    signatureSkill: { name: 'Dust Storm', shortName: 'Dust', description: 'Spawns a moving leaf tornado that chases enemies, pulling them in and dealing DoT. Size and damage scale with voice drops.' },
    passive: { name: 'Recycled Waste', description: 'Attacks pierce through 1 additional enemy.' },
  },
  taho_vendor: {
    id: 'taho_vendor',
    name: 'Taho Vendor',
    profession: 'Street Vendor',
    damageType: 'Fire',
    attackKind: 'ranged',
    attackStyle: 'lobbed',
    range: 1050,
    damage: 9, // retuned 2026-07: collision fix (was 11) — splash grew ~50px->122px vs minions & stopped whiffing
    attackRateMs: 1700,
    skillCooldownMs: 50000,
    color: 0xe2e8f0,
    purpose: 'Lobs scalding syrup that slows and splashes a small area; strips enemy speed buffs off whatever it hits.',
    signatureSkill: { name: 'Hot Syrup', shortName: 'Syrup', description: 'Throws a Molotov creating a 20s AoE fire patch that deals DoT.' },
    passive: { name: 'Sweet Tooth', description: 'Drops 1 extra Voice when killing an Elite/Boss.' },
    attackArt: 'taho-cup',
    projectileSpeed: 450,
  },
  nurse: {
    id: 'nurse',
    name: 'Nurse',
    profession: 'Public Health Nurse',
    damageType: 'Holy',
    attackKind: 'ranged',
    attackStyle: 'projectile',
    range: 1200,
    damage: 8,
    attackRateMs: 1500,
    color: 0xfca5a5,
    purpose: 'Support striker — alcohol sprays heal any ally summon they pass through, and hit undead anomalies for +50%.',
    signatureSkill: { name: 'Heal', shortName: 'Heal', description: 'Restores 150 HP to the barricade.' },
    passive: { name: 'Triage', description: 'Heals the barrier continuously 1 HP per second.' },
    attackArt: 'syringe',
    projectileSpeed: 600,
    projectileSizePx: 56, // syringe dart stays needle-thin
  },
  construction_worker: {
    id: 'construction_worker',
    name: 'Construction Worker',
    profession: 'Laborer',
    damageType: 'Physical',
    attackKind: 'ranged',
    attackStyle: 'summoner',
    range: GLOBAL_RANGE_PX * 0.75, // 75% of Eden's global reach — throws panels far up the lane
    damage: 18, // summoner damage = wall HP knob, not DPS
    attackRateMs: 5000,
    color: 0xd97706,
    purpose: 'Builds Yero barricades that body-block the path (wall HP scales with his damage). Buys time, not damage.',
    signatureSkill: { name: 'Barrier', description: 'Builds a wide destructible wall ahead of the shield that blocks enemies until it breaks. Voice Drop enhancements make it longer and tougher.' },
    passive: { name: 'Heavy Stance', description: 'Completely immune to knockback effects.' },
    attackArt: 'yero-panel',
  },
  call_center_agent: {
    id: 'call_center_agent',
    name: 'Call Center Agent',
    profession: 'BPO Graveyard shift',
    damageType: 'Lightning',
    attackKind: 'ranged',
    attackStyle: 'projectile',
    range: 1500, // longest non-global reach — sniper tier taxes the DPS
    damage: 13,
    attackRateMs: 1600,
    color: 0xfef08a,
    attackArt: 'headset-wave',
    projectileSpeed: 800,
    purpose: 'Headset feedback shoots projectile attacks at distant enemies and can target Stealth.',
    signatureSkill: { name: 'Put-on-hold', description: 'Deals damage and applies a 5s Root in a small AoE.' },
    passive: { name: 'Graveyard Shift', description: 'Can see and directly target Stealthed enemies.' },
  },
  security_guard: {
    id: 'security_guard',
    name: 'Security Guard',
    profession: 'Sikyu',
    damageType: 'Physical',
    attackKind: 'melee',
    attackStyle: 'melee-cleave',
    range: 420,
    damage: 16,
    attackRateMs: 1450, // slowed 2026-07: melee AoE sat above the multi-hit band
    color: 0x1e3a8a,
    purpose: 'Batuta bruiser who holds the frontline and cleaves enemies in front; deals double damage to Stealth anomalies.',
    canSeeStealth: true,
    signatureSkill: { name: 'Flash', description: 'Casts a wide cone that heavily slows all enemies.' },
    passive: { name: 'Night Watch', description: 'Deals double damage to Stealthed enemies.' },
    attackArt: 'batuta',
  },
  farmer: {
    id: 'farmer',
    name: 'Farmer',
    profession: 'Magsasaka',
    damageType: 'Earth',
    attackKind: 'ranged',
    attackStyle: 'chain',
    range: 1050,
    damage: 19,
    attackRateMs: 1800, // slowed 2026-07: 13.6/hit on a multi-hit chain was OP
    skillCooldownMs: 60000,
    color: 0x15803d,
    purpose: 'Chain-lightning ranged attacker whose Tree of Life periodically roots and lightly damages enemies in a large AoE.',
    signatureSkill: { name: 'Tree of Life', description: 'Summons a Golden Tree that periodically Roots and damages nearby enemies.' },
    passive: { name: 'Deep Roots', description: 'Attacks have a 20% chance to Root (freeze) enemies.' },
    attackArt: 'root-burst',
    chainArt: 'vine', // root tendril lash, not electric crackle
  },
  fishball_vendor: {
    id: 'fishball_vendor',
    name: 'Fishball Vendor',
    profession: 'Street Vendor',
    damageType: 'Physical',
    attackKind: 'ranged',
    attackStyle: 'pierce',
    range: 1250,
    damage: 10, // retuned 2026-07: collision fix (was 9) — 5 instant line-hits became real pass-throughs; rate already slowed, so only a small bump
    // per-hit across up to 5 pierced enemies — group DPS is the payoff
    attackRateMs: 1600, // slowed 2026-07: 5-pierce line clear was OP at 1300
    skillCooldownMs: 45000,
    basePierce: 5,
    color: 0xf43f5e,
    purpose: 'Skewers a whole line — one Tuhog throw pierces up to 5 anomalies. The squad\'s premier line-clearer.',
    signatureSkill: { name: 'Spicy Sauce', description: 'Ignites all pierced enemies, causing panic.' },
    passive: { name: 'Tuhog', description: 'Attacks pierce up to 5 enemies in a line.' },
    attackArt: 'skewer',
    projectileSpeed: 750,
    projectileSizePx: 120, // the Tuhog skewer is the long one on purpose
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
    range: 1250,
    damage: 4,
    attackRateMs: 600, // Still the fastest attacker in the game by ~2x
    color: 0xec4899,
    purpose: 'Machine-gun sales pitch — the fastest attack in the game, chipping the whole line and executing low-HP stragglers.',
    signatureSkill: { name: 'Closing Sale', description: 'Instantly executes any enemy below 15% HP.' },
    passive: { name: 'Relentless Pitch', description: 'Fastest base attack speed in the game.' },
    attackArt: 'pricetag-flash',
  },
  sorbetes_vendor: {
    id: 'sorbetes_vendor',
    name: 'Sorbetes Vendor',
    profession: 'Dirty Ice Cream Vendor',
    damageType: 'Frost',
    attackKind: 'ranged',
    attackStyle: 'trap',
    range: 900,
    damage: 12,
    attackRateMs: 3000,
    color: 0xf472b6,
    purpose: 'Drops sticky ice puddles that freeze whatever steps on them — zone control that punishes tight lanes.',
    signatureSkill: { name: 'Dirty Ice Cream', description: 'Drops 3 explosive ice cream traps on the path.' },
    passive: { name: 'Brain Freeze', description: 'Attacks apply stacking Freeze.' },
    attackArt: 'ice-trap',
  },
  electrician: {
    id: 'electrician',
    name: 'Electrician',
    profession: 'Lineman',
    damageType: 'Lightning',
    attackKind: 'ranged',
    attackStyle: 'chain',
    range: 1250,
    damage: 14,
    attackRateMs: 2000, // slowed 2026-07: guaranteed 5-bounce group clear was OP
    baseChain: 5,
    color: 0x38bdf8,
    purpose: 'Jumper cables that always bounce to 5 nearby targets — reliable, steady horde clear.',
    signatureSkill: { name: 'Rolling Blackout', shortName: 'Zap', description: 'Unleashes a massive electric wave from the barrier to the top of the screen, dealing immense damage.' },
    passive: { name: 'Live Wire', description: 'Attacks automatically bounce to 5 nearby targets.' },
    attackArt: 'plug-spark',
  },
  baker: {
    id: 'baker',
    name: 'Baker',
    profession: 'Panadero',
    damageType: 'Fire',
    attackKind: 'ranged',
    attackStyle: 'lobbed',
    range: 1100,
    damage: 11, // retuned 2026-07: collision fix (was 13) — bigger splash + burn-zone passive, so slightly larger trim than Taho
    attackRateMs: 1800,
    skillCooldownMs: 45000,
    color: 0xef4444,
    purpose: 'Lobs hot pandesal that explodes in fire splash and leaves a burning zone — sustained AoE against packed waves.',
    signatureSkill: { name: 'Dough Knead', description: 'Flattens enemies, reducing their armor and damage by 50%.' },
    passive: { name: 'Fresh out the Oven', description: 'Attacks leave a burning zone on the ground.' },
    attackArt: 'pandesal',
    projectileSpeed: 400,
  },
  traffic_enforcer: {
    id: 'traffic_enforcer',
    name: 'Traffic Enforcer',
    profession: 'MMDA',
    damageType: 'Physical',
    attackKind: 'ranged',
    attackStyle: 'vortex',
    range: 900,
    damage: 8,
    attackRateMs: 6500,
    color: 0x475569,
    purpose: 'Whistle-and-STOP crowd control — magnetically pulls enemies into a tight clump for the squad to blast. Low damage, high setup.',
    signatureSkill: { name: 'STOP!', description: 'Hard stuns a wide radius and cancels channeling Boss Skills.' },
    passive: { name: 'Right of Way', description: 'Magnetically pulls enemies into tight clumps.' },
    attackArt: 'whistle-swirl',
  },
  plumber: {
    id: 'plumber',
    name: 'Plumber',
    profession: 'Tubero',
    damageType: 'Water',
    attackKind: 'ranged',
    attackStyle: 'linear-wave',
    range: 1200,
    damage: 10,
    attackRateMs: 2400,
    color: 0x2563eb,
    purpose: 'High-pressure wave that hits the whole line, nudges enemies back, and soaks them Wet for combo setups.',
    signatureSkill: { name: 'Flush', description: 'Sends 3 water waves sweeping up the lane, dealing damage, knocking enemies back, and leaving a lingering slow.' },
    passive: { name: 'High Pressure', description: 'Normal attacks push enemies backward slightly.' },
    attackArt: 'wave-crest',
  },
  delivery_rider: {
    id: 'delivery_rider',
    name: 'Delivery Rider',
    profession: 'Motorcycle Courier',
    damageType: 'Wind',
    attackKind: 'ranged',
    attackStyle: 'boomerang',
    range: 1400,
    damage: 9, // per-hit; two-tap plus Rush Hour ramp is the real DPS
    attackRateMs: 1500,
    color: 0x22c55e,
    purpose: 'Returning parcels hit twice and ramp up the longer they focus one target — a single-target melter that grows mid-fight.',
    signatureSkill: { name: 'Dine & Dash', description: 'Summons 3 riders that rev up before sweeping the lane, leaving a trail, dealing heavy damage, and knocking enemies back.' },
    passive: { name: 'Rush Hour', description: 'Attack speed ramps up the longer they attack the same target.' },
    attackArt: 'parcel',
    projectileSpeed: 400,
    projectileSizePx: 64, // boxy parcel, compact
  }
};
