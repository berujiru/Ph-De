import type { TowerId } from '../data/balance';

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
  gold: number;
  lives: number;
  waveNumber: number;
  totalWaves: number;
  waveActive: boolean;
  status: 'playing' | 'won' | 'lost';
}

export interface GameToUiEvents extends Record<string, unknown> {
  stateChanged: GameStateSnapshot;
}

export interface UiToGameEvents extends Record<string, unknown> {
  selectTowerType: TowerId | null;
  startWave: undefined;
  restart: undefined;
}

/** Emits game -> UI (React listens). */
export const gameToUiEvents = new TypedEmitter<GameToUiEvents>();

/** Emits UI -> game (Phaser scene listens). */
export const uiToGameEvents = new TypedEmitter<UiToGameEvents>();
