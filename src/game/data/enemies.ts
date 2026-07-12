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

export const ENEMY_DEFINITIONS: Record<EnemyId, EnemyDefinition> = {
  grunt: {
    id: 'grunt',
    name: 'Petty Corruptor',
    lore: 'Brought to life by the thousands of discarded burner phones and the collective malice of coordinated troll farms. It manifests wherever the truth is too fragile to defend itself. Its sole purpose is to flood the streets with sheer volume, overwhelming defenses and eroding the public\'s ability to discern fact from fiction.',
    lore: 'Brought to life by the thousands of discarded burner phones and the collective malice of coordinated troll farms. It manifests wherever the truth is too fragile to defend itself. Its sole purpose is to flood the streets with sheer volume, overwhelming defenses and eroding the public\'s ability to discern fact from fiction.',
    
    speed: 70,
    maxHp: 45,
    reward: 5,
    damage: 6,
    attackRateMs: 1500,
    color: 0xef4444,
  },
  runner: {
    id: 'runner',
    name: 'Bribe Runner',
    lore: 'A scuttling amalgamation of stamped folders, bypassed queues, and forged signatures. It was willed into existence by the desperation of citizens forced to cut through intentionally broken systems. It moves with unnatural speed, bypassing the rules to deliver corruption directly to the frontline before anyone can stop it.',
    
    
    speed: 130,
    maxHp: 25,
    reward: 4,
    damage: 4,
    attackRateMs: 900,
    color: 0xeab308,
  },
  brute: {
    id: 'brute',
    name: 'Bureaucratic Thug',
    lore: 'Mummified in endless ribbons of bureaucratic red tape. It was formed by the agonizing, collective groans of people waiting months for permits that never come. Its heavy, lumbering presence physically stonewalls progress, forcing society to grind to a halt while it absorbs blows meant to dismantle the system.',
    
    
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
    lore: 'A bloated, translucent specter sustained entirely by payroll anomalies. Brought to reality by the greed of officials claiming salaries for people who don\'t exist. It drains resources without contributing any labor, serving only to siphon public funds and quietly bloat the ranks of the corrupt.',
    lore: 'A bloated, translucent specter sustained entirely by payroll anomalies. Brought to reality by the greed of officials claiming salaries for people who don\'t exist. It drains resources without contributing any labor, serving only to siphon public funds and quietly bloat the ranks of the corrupt.',
    
    speed: 60,
    maxHp: 70,
    reward: 8,
    damage: 8,
    attackRateMs: 1500,
    color: 0xffffff,
    stealth: true,
  },
  bribery: {
    id: 'bribery',
    name: 'Bribery',
    lore: 'Slimy suited creature tossing dirty money',
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
    lore: 'A hulking monstrosity wearing a politician\'s giant tarpaulin face. It draws power from shameless credit-grabbing during national calamities and taxpayer-funded public works. Its sheer arrogance and plastered smile boost the morale of the corrupt anomalies around it, making them fight harder for the false idol.',
    lore: 'A hulking monstrosity wearing a politician\'s giant tarpaulin face. It draws power from shameless credit-grabbing during national calamities and taxpayer-funded public works. Its sheer arrogance and plastered smile boost the morale of the corrupt anomalies around it, making them fight harder for the false idol.',
    
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
    lore: 'A bloated parade-balloon entity padded with fake receipts, rigged biddings, and vastly inflated costs. It manifested from the billions stolen through overpriced procurement. It looks massive and imposing, but its "health" is entirely fake padding that deflates rapidly when pierced by a hard audit.',
    
    
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
    lore: 'Born from the \'change\' that never makes it back to the public treasury after a project is finished. It is a slippery imp lugging leaking duffel bags of stolen funds. As it scurries across the nation, it steals what little hope the people have left, demanding a cut of their hard-earned progress.',
    lore: 'Born from the \'change\' that never makes it back to the public treasury after a project is finished. It is a slippery imp lugging leaking duffel bags of stolen funds. As it scurries across the nation, it steals what little hope the people have left, demanding a cut of their hard-earned progress.',
    
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
    lore: 'A corporate blob of empty promises and dummy directors. It was formed to launder money and hide the identities of the true masterminds. Strike it down, and its bad effect is realized: it simply shatters into a dozen smaller dummy corporations, making the money trail nearly impossible to destroy.',
    
    
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
    lore: 'Thugs sculpted from the arrogance and impunity of untouchable politicians. They exist only to shield the corrupt from the consequences of their actions. It taunts anyone who tries to attack the masterminds, forcing justice to go through them first.',
    
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
    lore: 'A massive cartel beast sitting comfortably on mountains of artificial scarcity. It was summoned by the greed of syndicates who starve the supply chain just to watch commodity prices soar. Upon death, its immense weight crashes down, dropping a massive barricade that physically blocks the people from reaching the truth.',
    
    
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
    lore: 'An earth-moving abomination forged from fake land titles, violent harassment, and forced evictions. It was willed into being by those who pave over communities for \'development\'. It violently evicts heroes from the field, replacing them with cold "Private Property" signs.',
    lore: 'An earth-moving abomination forged from fake land titles, violent harassment, and forced evictions. It was willed into being by those who pave over communities for \'development\'. It violently evicts heroes from the field, replacing them with cold "Private Property" signs.',
    
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
    lore: 'Wrapped tightly in pre-sealed bidding envelopes and insider information. It manifested from the rigged procurement processes that shut out honest competition. Because its victory is pre-decided, it is completely immune to all attacks until its rigged contracts are forcefully unsealed by sustained resistance.',
    
    
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
    lore: 'Mummified in endless ribbons of bureaucracy. It was formed by the collective groans of people waiting for permits that never come.',
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
    lore: 'Manifested from the billions of pesos completely washed away in non-existent dredging projects and substandard infrastructure. Every typhoon season feeds its power. It floods the entire path with its massive area-of-effect presence, letting corruption surge forward unchallenged while the defenders drown in the aftermath.',
    
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
    lore: 'A bloated, grotesque hog of discretionary funds. It was born from the insatiable appetite of politicians demanding unmonitored budgets. It is a black hole of public funds; it devours whatever resources it can find on the field, growing endlessly at the direct expense of the people\'s welfare.',
    lore: 'A bloated, grotesque hog of discretionary funds. It was born from the insatiable appetite of politicians demanding unmonitored budgets. It is a black hole of public funds; it devours whatever resources it can find on the field, growing endlessly at the direct expense of the people\'s welfare.',
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
    lore: 'A sprawling digital sweatshop of paid disinformation made flesh. It manifested from the weaponization of the internet by political elites. It constantly broadcasts a blinding barrage of fake news, shutting down the heroes\' vision and making it impossible to strike back, while hiding safely behind thousands of manufactured identities.',
    lore: 'A sprawling digital sweatshop of paid disinformation made flesh. It manifested from the weaponization of the internet by political elites. It constantly broadcasts a blinding barrage of fake news, shutting down the heroes\' vision and making it impossible to strike back, while hiding safely behind thousands of manufactured identities.',
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
    lore: 'The physical embodiment of election season desperation. It manifested from the systematic exploitation of poverty. It scatters fake, tainted gold to buy the loyalty—or at least the distraction—of those trying to defend the nation, proving that in a broken system, everything has a price.',
    
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
    lore: 'A monstrous matriarch or patriarch that bypasses all meritocracy. It was spawned by the endless political dynasties ensuring power never leaves the family. Its devastating effect is endless: it continuously bypasses the rules to appoint unqualified, shielded relatives into the lane to do its fighting.',
    
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
    lore: 'An entity forged from VIP entitlement, blaring sirens, and the belief that the law only applies to the poor. It ignores the rules of the road entirely. Its bad effect is simple and terrifying: it surges forward with absolute impunity, shoving aside anyone who dares stand in its way.',
    
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
    lore: 'A master of midnight maneuvers and hidden clauses. It was born in the dark hours of legislative sessions where funds are quietly reallocated. It bypasses all front-line defenses, smuggling massive amounts of stolen health and resources past the heroes while everyone else is distracted.',
    
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
    lore: 'The gaping, unchecked hole in the nation\'s borders. It manifested from the blind eyes turned at the customs gates. As long as it remains alive, it actively drains the economy, stealing the \'Hope\' currency generated by the defenders and starving the resistance of their ability to fight back.',
    lore: 'The gaping, unchecked hole in the nation\'s borders. It manifested from the blind eyes turned at the customs gates. As long as it remains alive, it actively drains the economy, stealing the \'Hope\' currency generated by the defenders and starving the resistance of their ability to fight back.',
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
    lore: 'The apex predator of regional politics. A multi-headed beast formed by decades of unchallenged, inherited political rule. Its effect is absolute despair: striking down one head merely allows a seemingly identical, pre-groomed heir to take its place, ensuring the cycle of corruption never actually ends.',
    lore: 'The apex predator of regional politics. A multi-headed beast formed by decades of unchallenged, inherited political rule. Its effect is absolute despair: striking down one head merely allows a seemingly identical, pre-groomed heir to take its place, ensuring the cycle of corruption never actually ends.',
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
    lore: 'The apex predator of regional politics. A multi-headed beast formed by decades of unchallenged, inherited political rule. Its effect is absolute despair: striking down one head merely allows a seemingly identical, pre-groomed heir to take its place, ensuring the cycle of corruption never actually ends.',
    lore: 'The apex predator of regional politics. A multi-headed beast formed by decades of unchallenged, inherited political rule. Its effect is absolute despair: striking down one head merely allows a seemingly identical, pre-groomed heir to take its place, ensuring the cycle of corruption never actually ends.',
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
    lore: 'The apex predator of regional politics. A multi-headed beast formed by decades of unchallenged, inherited political rule. Its effect is absolute despair: striking down one head merely allows a seemingly identical, pre-groomed heir to take its place, ensuring the cycle of corruption never actually ends.',
    lore: 'The apex predator of regional politics. A multi-headed beast formed by decades of unchallenged, inherited political rule. Its effect is absolute despair: striking down one head merely allows a seemingly identical, pre-groomed heir to take its place, ensuring the cycle of corruption never actually ends.',
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
    lore: 'The dark, beating heart of it all. It is the systemic, institutional rot that birthed every other anomaly. It is not just a monster; it is the environment itself. Its most devastating effect is that it ensures even if one corrupt official or anomaly is defeated, the system will simply resurrect them to fight again.',
    
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
