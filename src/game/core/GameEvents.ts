type Listener<T> = (payload: T) => void;

/** Minimal typed pub/sub used to bridge the Phaser game and the React UI. */
export class TypedEmitter<Events extends Record<string, unknown>> {
  private listeners: { [K in keyof Events]?: Set<Listener<Events[K]>> } = {};

  on<K extends keyof Events>(event: K, listener: Listener<Events[K]>): () => void {
    const set = this.listeners[event] ?? new Set<Listener<Events[K]>>();
    set.add(listener);
    this.listeners[event] = set;
    return () => this.off(event, listener);
  }

  off<K extends keyof Events>(event: K, listener: Listener<Events[K]>): void {
    this.listeners[event]?.delete(listener);
  }

  emit<K extends keyof Events>(event: K, payload: Events[K]): void {
    this.listeners[event]?.forEach((listener) => listener(payload));
  }
}

export interface ActiveHeroInfo {
  id: string;
  passiveOverride?: string;
  isSkillReady: boolean;
  isSkillLocked?: boolean;
}

export interface ActiveEnemyInfo {
  id: string;
  count: number;
}

export interface GameStateSnapshot {
  barrierHp: number;
  maxBarrierHp: number;
  voicesCount: number;
  maxVoicesCount: number;
  waveActive: boolean;
  currentWave: number;
  totalWaves: number;
  isPaused: boolean;
  gameSpeed: number;
  status: 'playing' | 'won' | 'lost';
  activeHeroes: ActiveHeroInfo[];
  activeEnemies: ActiveEnemyInfo[];
  doughBarrierActive?: boolean;
  shieldScreenYRatio?: number;
}

/** Rarity tiers for RNG drops (docs/WORLD_AND_HEROES.md "RNG rules"). */
export type DropRarity = 'common' | 'rare' | 'epic';

/** Semantic drop category — richer than `type`, used for card art in the HUD. */
export type DropKind = 'hero' | 'heroUpgrade' | 'generalUpgrade' | 'buhisBuhay';

export interface DropOption {
  id: string;
  title: string;
  description: string;
  type: 'spawn' | 'damage' | 'speed';
  /** Rarity tier for UI framing. UI treats absence as 'common'. */
  rarity?: DropRarity;
  /** Drop category for card rendering. UI infers from `type` when omitted. */
  kind?: DropKind;
  /** Damage type id (a `damageTypeIcons` key, e.g. 'Fire') for hero/upgrade drops. */
  damageType?: string;
  /** Penalty description shown on high-risk "Buhis-Buhay" drops. */
  risk?: string;
}

export interface GameToUiEvents extends Record<string, unknown> {
  stateChanged: GameStateSnapshot;
  voicesFull: { options: DropOption[] };
  enemyEncountered: { enemyId: string };
  showHeroTcgCutIn: { heroId: string, durationMs: number };
  /** Phaser loader progress — value is 0‒1. */
  loadProgress: { progress: number };
  /** Fired once at the end of create() when all game objects are built. */
  sceneReady: undefined;
  /**
   * Manual skill-targeting mode drives the HUD banner. `active:false` closes it.
   * While active the sim is frozen; `placed` gates the Confirm button (a target
   * must be placed/selected before it commits).
   */
  skillTargeting: {
    active: boolean;
    targetType?: 'area' | 'unit' | 'summon' | 'aim' | 'line';
    heroName?: string;
    placed?: boolean;
  };
  /**
   * A once-in-a-lifetime achievement was just earned. Drives the non-blocking
   * unlock toast. Fired once per achievement, ever (the metaState ledger dedups).
   */
  achievementUnlocked: {
    id: string;
    title: string;
    description: string;
    /** Emoji emblem for the toast. */
    icon: string;
    reward: { permits?: number; hope?: number };
  };
}

export type SkillVisualEvent = 
  | { type: 'text', x: number, y: number, text: string, color: string }
  | { type: 'dragTo', target: { x: number, y: number }, x: number, y?: number, duration: number, delay?: number, ease?: string }
  | { type: 'projectileVolley', hero: any, target: any, damageType: string }
  | { type: 'healShield', amount: number }
  | { type: 'expandingCircle', x: number, y: number, color: string, maxRadius: number, duration: number }
  | { type: 'trafficLights', duration: number }
  | { type: 'flashlightCone', hero: any, length: number, duration: number, angle: number }
  | { type: 'spawnTornado', x: number, y: number, damage: number, pullRadius: number, duration: number, speed: number }
  | { type: 'spawnLambatVortex', x: number, y: number, pullDelay: number, pullDuration: number, scale?: number }
  | { type: 'applyAilment', target: any, ailment: string, amount: number, duration: number, delay?: number }
  | { type: 'aoeRoot', x: number, y: number, radius: number, duration: number, damage: number }
  | { type: 'spawnTreeOfLife', x: number, y: number, radius: number, duration: number, damage: number, startX?: number, startY?: number }
  | { type: 'spawnDoughBarrier', duration: number }
  | { type: 'fireColumn', x: number, y: number, width: number, height: number, duration: number };

export interface UiToGameEvents extends Record<string, unknown> {
  startWave: undefined;
  setSpeed: { speed: number };
  surrender: undefined;
  /** Leave the current rally (surrender-return / menu exit) — wipes it, no resume. */
  exitRally: undefined;
  restart: { mode?: 'sandbox'; act?: number; stageIdx?: number } | undefined;
  selectDrop: { dropId: string };
  debugSpawn: { heroId?: string; passive?: string; skill?: string };
  triggerHeroSkill: { skill?: string };
  queueHeroSkill: { heroId: string };
  /** Commit the currently-placed target and cast the armed skill. */
  confirmSkillTarget: undefined;
  /** Abort targeting mode without casting (skill stays ready). */
  cancelSkillTarget: undefined;
  spawnSandboxTarget: undefined;
  spawnSpecificEnemy: { enemyId: string, passive?: string, skill?: string };
  triggerEnemySkill: undefined;
  playSound: { key: string };
  applySandboxAilment: { ailment: string, amount: number };
}

/** Emits game -> UI (React listens). */
export const gameToUiEvents = new TypedEmitter<GameToUiEvents>();

/** Emits UI -> game (Phaser scene listens). */
export const uiToGameEvents = new TypedEmitter<UiToGameEvents>();

/**
 * Latched rally-load state. The `loadProgress`/`sceneReady` events above are
 * transient — a React overlay that subscribes in a `useEffect` (which runs
 * after paint) can miss an emit that happened between render and subscribe,
 * and warm/cached restarts may emit no `progress` at all. The overlay reads
 * this snapshot on mount so it can never miss or hang on a readiness signal.
 */
export interface RallyLoadState {
  /** Phaser loader progress for the pending rally build, 0‒1. */
  progress: number;
  /** True once the scene has finished building the rally (assets decoded + objects created). */
  ready: boolean;
}

const rallyLoadState: RallyLoadState = { progress: 1, ready: true };

/** Snapshot the rally-load latch. Read on overlay mount to defeat the subscribe race. */
export function getRallyLoadState(): RallyLoadState {
  return { ...rallyLoadState };
}

/** A rally build has started — reset the latch so the overlay shows loading. */
export function beginRallyLoad(): void {
  rallyLoadState.progress = 0;
  rallyLoadState.ready = false;
  gameToUiEvents.emit('loadProgress', { progress: 0 });
}

/** Update loader progress (0‒1) for the pending rally build. */
export function setRallyLoadProgress(progress: number): void {
  rallyLoadState.progress = progress;
  gameToUiEvents.emit('loadProgress', { progress });
}

/**
 * The rally scene is fully built and safe to reveal. Only call this once every
 * asset the build touched is decoded (i.e. from create()/buildGame(), which
 * Phaser runs *after* the preload loader completes).
 */
export function markRallyReady(): void {
  rallyLoadState.progress = 1;
  rallyLoadState.ready = true;
  gameToUiEvents.emit('loadProgress', { progress: 1 });
  gameToUiEvents.emit('sceneReady', undefined);
}
