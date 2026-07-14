import type { HeroId } from './heroes';
import { cardsForNextLevel, HERO_LEVEL_CAP } from './heroProgression';

/**
 * Meta-progression state, backed by localStorage.
 * Manages Hope points, Rally Permits, Store Unlocks, Campaign Progress, and
 * the permanent Hero Card inventory + hero levels.
 */

const STORAGE_KEY = 'firstripple.meta';

export interface MetaStateData {
  hope: number;
  permits: number;
  highestClearedStage: number;
  stageStars: Record<number, number>;
  storeUnlockedHeroes: HeroId[];
  /** Owned Hero Cards per hero (absent key = 0). Spent to level heroes up. */
  heroCards: Partial<Record<HeroId, number>>;
  /** Permanent hero level per hero (absent key = level 1). */
  heroLevels: Partial<Record<HeroId, number>>;
}

const DEFAULT_STATE: MetaStateData = {
  hope: 0,
  permits: 25,
  highestClearedStage: 0,
  stageStars: {},
  storeUnlockedHeroes: [],
  heroCards: {},
  heroLevels: {},
};

function readStorage(): MetaStateData {
  try {
    const raw = globalThis.localStorage?.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_STATE };
    const parsed = JSON.parse(raw) as Partial<MetaStateData>;
    return {
      hope: typeof parsed.hope === 'number' ? parsed.hope : DEFAULT_STATE.hope,
      permits: typeof parsed.permits === 'number' ? parsed.permits : DEFAULT_STATE.permits,
      highestClearedStage: typeof parsed.highestClearedStage === 'number' ? parsed.highestClearedStage : DEFAULT_STATE.highestClearedStage,
      stageStars: parsed.stageStars && typeof parsed.stageStars === 'object' ? parsed.stageStars : DEFAULT_STATE.stageStars,
      storeUnlockedHeroes: Array.isArray(parsed.storeUnlockedHeroes) ? parsed.storeUnlockedHeroes : DEFAULT_STATE.storeUnlockedHeroes,
      // Migration: saves written before Hero Cards existed lack these keys and
      // silently default (new keys are additive; old code ignores them too).
      heroCards: parsed.heroCards && typeof parsed.heroCards === 'object' ? parsed.heroCards : { ...DEFAULT_STATE.heroCards },
      heroLevels: parsed.heroLevels && typeof parsed.heroLevels === 'object' ? parsed.heroLevels : { ...DEFAULT_STATE.heroLevels },
    };
  } catch {
    return { ...DEFAULT_STATE };
  }
}

function writeStorage(state: MetaStateData): void {
  try {
    globalThis.localStorage?.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage unavailable
  }
}

let state: MetaStateData = readStorage();
const listeners = new Set<() => void>();

function notify() {
  writeStorage(state);
  for (const cb of listeners) cb();
}

// Subscribe
export function subscribeMetaState(cb: () => void): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

// Getters
export function getMetaState(): MetaStateData {
  return state;
}

export function getHope(): number {
  return state.hope;
}

export function getPermits(): number {
  return state.permits;
}

export function getHighestClearedStage(): number {
  return state.highestClearedStage;
}

export function getStageStars(): Record<number, number> {
  return state.stageStars;
}

export function getStoreUnlockedHeroes(): HeroId[] {
  return state.storeUnlockedHeroes;
}

export function getHeroCards(): Partial<Record<HeroId, number>> {
  return state.heroCards;
}

export function getHeroCardCount(heroId: HeroId): number {
  return state.heroCards[heroId] ?? 0;
}

export function getHeroLevels(): Partial<Record<HeroId, number>> {
  return state.heroLevels;
}

export function getHeroLevel(heroId: HeroId): number {
  return state.heroLevels[heroId] ?? 1;
}

// Setters / Actions
export function addHope(amount: number) {
  if (amount <= 0) return;
  state = { ...state, hope: state.hope + amount };
  notify();
}

export function spendHope(amount: number): boolean {
  if (state.hope < amount || amount <= 0) return false;
  state = { ...state, hope: state.hope - amount };
  notify();
  return true;
}

export function addPermits(amount: number) {
  if (amount <= 0) return;
  state = { ...state, permits: state.permits + amount };
  notify();
}

export function spendPermit(): boolean {
  if (state.permits <= 0) return false;
  state = { ...state, permits: state.permits - 1 };
  notify();
  return true;
}

export function unlockHeroInStore(heroId: HeroId) {
  if (state.storeUnlockedHeroes.includes(heroId)) return;
  state = { ...state, storeUnlockedHeroes: [...state.storeUnlockedHeroes, heroId] };
  notify();
}

export function addHeroCards(heroId: HeroId, amount: number) {
  if (amount <= 0) return;
  state = {
    ...state,
    heroCards: { ...state.heroCards, [heroId]: (state.heroCards[heroId] ?? 0) + amount },
  };
  notify();
}

/** Spend cards to raise a hero one level. Returns false if at cap or short on cards. */
export function levelUpHero(heroId: HeroId): boolean {
  const level = state.heroLevels[heroId] ?? 1;
  if (level >= HERO_LEVEL_CAP) return false;
  const cost = cardsForNextLevel(level);
  if ((state.heroCards[heroId] ?? 0) < cost) return false;
  state = {
    ...state,
    heroCards: { ...state.heroCards, [heroId]: (state.heroCards[heroId] ?? 0) - cost },
    heroLevels: { ...state.heroLevels, [heroId]: level + 1 },
  };
  notify();
  return true;
}

export function setHighestClearedStage(stageId: number) {
  if (stageId <= state.highestClearedStage) return;
  state = { ...state, highestClearedStage: stageId };
  notify();
}

export function recordStageClear(stageId: number, stars: number) {
  const currentStars = state.stageStars[stageId] || 0;
  let changed = false;
  let newState = { ...state };
  
  if (stars > currentStars) {
    newState.stageStars = { ...newState.stageStars, [stageId]: stars };
    changed = true;
  }
  if (stageId > newState.highestClearedStage) {
    newState.highestClearedStage = stageId;
    changed = true;
  }
  
  if (changed) {
    state = newState;
    notify();
  }
}

/** Test hook — reset in-memory state (and re-read storage). */
export function resetMetaStateForTests(): void {
  state = readStorage();
  listeners.clear();
}
