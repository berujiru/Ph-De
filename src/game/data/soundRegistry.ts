import type Phaser from 'phaser';
import type { HeroId } from './heroes';
import type { EnemyId } from './enemies';

/**
 * The single source of truth for every sound in the game — the "tracking spine"
 * called out in docs/AUDIO_PROGRESS.md. It maps semantic keys to asset files and
 * keys each hero / enemy to its clips, so adding audio is a data edit (new file
 * + manifest line) rather than a code change.
 *
 * Two layers:
 *   1. AUDIO_MANIFEST — files that physically exist and get preloaded. Only add
 *      a line here once the real asset is in public/assets. This keeps the
 *      console free of 404s while sounds are still being produced.
 *   2. HERO_SFX / ENEMY_SFX / MUSIC — the intended catalog keyed per entity.
 *      Resolvers fall back to a generic, always-loaded key so the game is never
 *      silent for an entity whose bespoke clip hasn't been made yet.
 */

// --- Core SFX keys (bespoke files land in public/assets/sounds/) ---------------

export const SFX = {
  btnPress: 'sfx-btn-press',
  shoot: 'sfx-shoot',
  enemyHit: 'sfx-enemy-hit',
  enemyDie: 'sfx-enemy-die',
  barrierHit: 'sfx-barrier-hit',
  barrierBreak: 'sfx-barrier-break',
  /** Default signature-skill activation cue; per-hero foley overrides via HERO_SFX. */
  skill: 'sfx-skill',
  heal: 'sfx-heal',
  victory: 'sfx-victory',
  defeat: 'sfx-defeat',
} as const;

// --- Music keys (files land in public/assets/music/, wired up in Milestone 2) --

export const MUSIC = {
  prep: 'music-prep',
  battle: 'music-battle',
  victory: 'music-victory',
  defeat: 'music-defeat',
  /** Out-of-combat in-game bed — loops under gameplay, ducks out for boss themes. */
  ambience: 'music-ambience',
  /** Per-act boss themes; bossThemeForAct() falls back to bossDefault. */
  bossThemes: {
    1: 'music-boss-act1',
    2: 'music-boss-act2',
    3: 'music-boss-act3',
    4: 'music-boss-act4',
    5: 'music-boss-finale', // boss_ang_sistema — the signature track
  } as Record<number, string>,
  /** Plays for any boss whose act has no dedicated theme yet. */
  bossDefault: 'music-boss-default',
} as const;

// --- Per-hero / per-enemy catalog ---------------------------------------------

interface HeroSound {
  /** Basic-attack SFX; falls back to SFX.shoot. */
  attack?: string;
  /** Signature-skill SFX (foley), distinct from the Tagalog voice line. */
  skill?: string;
  /** Tagalog voice line played on the skill cut-in (Milestone 3). */
  voice?: string;
}

interface EnemySound {
  attack?: string;
  death?: string;
  /** Boss channel/skill SFX (devour, siren, resurrect, …). */
  skill?: string;
}

/**
 * Intended per-hero clips. Keys map into AUDIO_MANIFEST once the file exists.
 * Only the 20 recruitable heroes are listed; sandbox testers use the generic
 * fallback. Voice lines are authored in docs/ART_AND_AUDIO_GUIDELINES.md §5.
 */
export const HERO_SFX: Partial<Record<HeroId, HeroSound>> = {
  eden: { voice: 'voice-eden-rally' },
  teacher: { voice: 'voice-teacher-recess' },
  student: { voice: 'voice-student-cramming' },
  // NOTE: the coin-shotgun blast foley (sfx-jeepney-barya) is intentionally NOT wired
  // as `skill` here — `skill` is the cut-in cue and fires when the cut-in STARTS, but
  // the coins don't erupt until the cut-in finishes. The blast sound is played from the
  // coinShrapnelCone visual handler instead, so it lands with the actual eruption.
  jeepney_driver: { attack: 'sfx-jeepney-wrench', voice: 'voice-jeepney-barya' },
  fisherfolk: { voice: 'voice-fisherfolk-lambat' },
  street_sweeper: { voice: 'voice-sweeper-duststorm' },
  taho_vendor: { voice: 'voice-taho-hotsyrup' },
  nurse: { voice: 'voice-nurse-vaccine' },
  construction_worker: { voice: 'voice-construction-barricade' },
  call_center_agent: { voice: 'voice-callcenter-escalate' },
  security_guard: { voice: 'voice-security-flashlight' },
  // Tree of Life foley (sfx-farmer-tree-grow / -pulse) is played at the actual
  // moments (seed landing, each root tick) — not via `skill`, which is the
  // cut-in cue and would fire before the tree exists (see the jeepney note).
  farmer: { attack: 'sfx-farmer-vine', voice: 'voice-farmer-harvest' },
  fishball_vendor: { voice: 'voice-fishball-spicy' },
  sales_lady: { voice: 'voice-saleslady-closing' },
  sorbetes_vendor: { voice: 'voice-sorbetes-dirty' },
  electrician: { voice: 'voice-electrician-blackout' },
  baker: { voice: 'voice-baker-dough' },
  traffic_enforcer: { voice: 'voice-traffic-stop' },
  plumber: { voice: 'voice-plumber-flush' },
  delivery_rider: { voice: 'voice-rider-deliver' },
};

/** Intended per-enemy clips. Bosses add a `skill` channel cue. */
export const ENEMY_SFX: Partial<Record<EnemyId, EnemySound>> = {
  // Minions & mid-tier lean on the generic hit/death fallbacks for now.
  boss_pork_barrel: { skill: 'sfx-boss-devour' },
  boss_wang_wang: { skill: 'sfx-boss-siren' },
  boss_ang_sistema: { skill: 'sfx-boss-resurrect' },
  boss_troll_farm: { skill: 'sfx-boss-fakenews' },
  boss_vote_buying: { skill: 'sfx-boss-scattergold' },
};

// --- Resolvers (always return a key; callers get a sensible fallback) ----------

export function heroAttackSfx(id: HeroId): string {
  return HERO_SFX[id]?.attack ?? SFX.shoot;
}

export function heroSkillSfx(id: HeroId): string {
  return HERO_SFX[id]?.skill ?? SFX.skill;
}

export function heroVoice(id: HeroId): string | undefined {
  return HERO_SFX[id]?.voice;
}

export function enemyHitSfx(id: EnemyId): string {
  return ENEMY_SFX[id]?.attack ?? SFX.enemyHit;
}

export function enemyDeathSfx(id: EnemyId): string {
  return ENEMY_SFX[id]?.death ?? SFX.enemyDie;
}

export function enemySkillSfx(id: EnemyId): string | undefined {
  return ENEMY_SFX[id]?.skill;
}

// --- Preload manifest ----------------------------------------------------------

/**
 * Files that currently exist on disk and should be preloaded. Add a line here
 * the moment a real asset lands so the key "lights up"; keys not listed here
 * simply no-op at play time (AudioManager swallows undecoded keys).
 *
 * NOTE: the .mp3s below start as silent placeholders — replacing the file with a
 * real recording needs no code change (Milestone 1, step 5).
 */
export const AUDIO_MANIFEST: Record<string, string> = {
  [SFX.btnPress]: '/assets/sounds/btn-press.wav',
  [SFX.shoot]: '/assets/sounds/shoot.wav',
  [SFX.enemyHit]: '/assets/sounds/enemy-hit.wav',
  [SFX.enemyDie]: '/assets/sounds/enemy-die.wav',
  [SFX.barrierHit]: '/assets/sounds/barrier-hit.wav',
  [SFX.barrierBreak]: '/assets/sounds/barrier-break.wav',
  [SFX.skill]: '/assets/sounds/skill.wav',
  // Jeepney Driver foley: wrench-swing whoosh (basic attack) + coin-shotgun blast (Barya).
  'sfx-jeepney-wrench': '/assets/sounds/jeepney-wrench.wav',
  'sfx-jeepney-barya': '/assets/sounds/jeepney-barya-blast.wav',
  // Farmer foley: vine-whip lash (basic attack), tree growth (seed landing),
  // soft root-pulse chime (every 2s tick of the field).
  'sfx-farmer-vine': '/assets/sounds/farmer-vine.wav',
  'sfx-farmer-tree-grow': '/assets/sounds/farmer-tree-grow.wav',
  'sfx-farmer-tree-pulse': '/assets/sounds/farmer-tree-pulse.wav',
  [SFX.victory]: '/assets/sounds/victory.wav',
  [SFX.defeat]: '/assets/sounds/defeat.wav',
  // --- Pending real files: drop the .mp3 in the path shown, then uncomment. ---
  // [SFX.heal]: '/assets/sounds/heal.mp3',
  //
  // Music (put files in public/assets/music/):
  // The out-of-combat ambience bed.
  [MUSIC.ambience]: '/assets/music/default-ambience.mp3',
  // Default rally/battle bed — plays through a fight until a boss appears.
  [MUSIC.battle]: '/assets/music/Only_the_Waning_Light.mp3',
  [MUSIC.bossDefault]: '/assets/music/boss-default.mp3',   // boss theme, overrides battle
  // [MUSIC.prep]: '/assets/music/prep.mp3',
  // [MUSIC.victory]: '/assets/music/victory.mp3',
  // [MUSIC.defeat]: '/assets/music/defeat.mp3',
  // [MUSIC.bossThemes[1]]: '/assets/music/boss-act1.mp3',
  // [MUSIC.bossThemes[2]]: '/assets/music/boss-act2.mp3',
  // [MUSIC.bossThemes[3]]: '/assets/music/boss-act3.mp3',
  // [MUSIC.bossThemes[4]]: '/assets/music/boss-act4.mp3',
  // [MUSIC.bossThemes[5]]: '/assets/music/boss-finale.mp3',  // boss_ang_sistema
};

/**
 * Register every available audio file with the scene loader. Called from
 * GameScene.preload(), mirroring the data-driven load loops already there
 * (allAttackArtStems, HERO_DEFINITIONS).
 */
export function preloadAudio(scene: Phaser.Scene): void {
  for (const [key, path] of Object.entries(AUDIO_MANIFEST)) {
    if (!scene.cache.audio.exists(key)) {
      scene.load.audio(key, path);
    }
  }
}

export function bossThemeForAct(act: number | null): string {
  if (act && MUSIC.bossThemes[act]) {
    const key = MUSIC.bossThemes[act];
    if (AUDIO_MANIFEST[key]) return key;
  }
  return MUSIC.bossDefault;
}
