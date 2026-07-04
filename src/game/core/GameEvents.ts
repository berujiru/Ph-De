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
}

export interface DropOption {
  id: string;
  title: string;
  description: string;
  type: 'spawn' | 'damage' | 'speed';
}

export interface GameToUiEvents extends Record<string, unknown> {
  stateChanged: GameStateSnapshot;
  voicesFull: { options: DropOption[] };
}

export interface UiToGameEvents extends Record<string, unknown> {
  startWave: undefined;
  setSpeed: { speed: number };
  surrender: undefined;
  restart: undefined;
  selectDrop: { dropId: string };
  debugSpawn: undefined;
  playSound: { key: string };
}

/** Emits game -> UI (React listens). */
export const gameToUiEvents = new TypedEmitter<GameToUiEvents>();

/** Emits UI -> game (Phaser scene listens). */
export const uiToGameEvents = new TypedEmitter<UiToGameEvents>();
