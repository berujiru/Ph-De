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
  | { type: 'spawnTreeOfLife', x: number, y: number, radius: number, duration: number, damage: number }
  | { type: 'spawnDoughBarrier', duration: number };

export interface UiToGameEvents extends Record<string, unknown> {
  startWave: undefined;
  setSpeed: { speed: number };
  surrender: undefined;
  restart: { mode?: 'sandbox'; act?: number; stageIdx?: number } | undefined;
  selectDrop: { dropId: string };
  debugSpawn: { heroId?: string; passive?: string; skill?: string };
  triggerHeroSkill: { skill?: string };
  queueHeroSkill: { heroId: string };
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
