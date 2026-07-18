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
  /** Furthest stage reached — kept as the max cleared id (hero-unlock signal). */
  highestClearedStage: number;
  /** Every stage id actually beaten. Bosses are optional, so this can have gaps. */
  clearedStages: number[];
  stageStars: Record<number, number>;
  storeUnlockedHeroes: HeroId[];
  /** Owned Hero Cards per hero (absent key = 0). Spent to level heroes up. */
  heroCards: Partial<Record<HeroId, number>>;
  /** Permanent hero level per hero (absent key = level 1). */
  heroLevels: Partial<Record<HeroId, number>>;
  /**
   * Enemy ids the player has ever faced in a campaign battle. Drives the
   * one-time "new anomaly" TCG reveal in the rally screen (pops only on the
   * very first encounter, ever) and the Truth Codex unlock-on-encounter.
   */
  encounteredEnemies: string[];
  /** Local calendar day ('YYYY-MM-DD') the free daily permits were last claimed. */
  lastDailyClaimDate: string | null;
  /** Local calendar day the rewarded-ad counter below belongs to. */
  adWatchDate: string | null;
  /** Rewarded ads completed on `adWatchDate` (resets when the day rolls over). */
  adWatchCount: number;
  /**
   * Store transaction ids for IAP grants already applied. With no backend this
   * is the dedup ledger that turns the store's at-least-once delivery (an
   * approved purchase can be replayed on every launch until finished) into
   * exactly-once currency grants. Capped to the most recent entries.
   */
  iapProcessedTxIds: string[];
}

/** Free permits granted by the once-a-day store claim. */
export const DAILY_CLAIM_PERMITS = 5;
/** Permits granted per completed rewarded ad. */
export const AD_PERMIT_REWARD = 10;
/** Max rewarded ads that can be redeemed for permits per local day. */
export const MAX_AD_WATCHES_PER_DAY = 5;
/**
 * How many recent IAP transaction ids to retain for dedup. A transaction stops
 * being replayed by the store once it's finished, so the ledger only needs to
 * cover the short finished-but-replayed race window — not all purchases ever.
 */
export const MAX_IAP_TX_HISTORY = 50;

/** Local (not UTC) zero-padded calendar day stamp — drives midnight resets. */
function localDateStamp(now: Date = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

const DEFAULT_STATE: MetaStateData = {
  hope: 0,
  permits: 25,
  highestClearedStage: 0,
  clearedStages: [],
  stageStars: {},
  storeUnlockedHeroes: [],
  heroCards: {},
  heroLevels: {},
  encounteredEnemies: [],
  lastDailyClaimDate: null,
  adWatchDate: null,
  adWatchCount: 0,
  iapProcessedTxIds: [],
};

function readStorage(): MetaStateData {
  try {
    const raw = globalThis.localStorage?.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_STATE };
    const parsed = JSON.parse(raw) as Partial<MetaStateData>;
    const highestClearedStage = typeof parsed.highestClearedStage === 'number' ? parsed.highestClearedStage : DEFAULT_STATE.highestClearedStage;
    return {
      hope: typeof parsed.hope === 'number' ? parsed.hope : DEFAULT_STATE.hope,
      permits: typeof parsed.permits === 'number' ? parsed.permits : DEFAULT_STATE.permits,
      highestClearedStage,
      // Migration: pre-set-tracking saves only had highestClearedStage; back then
      // progression was strictly linear, so every stage 1..N was cleared.
      clearedStages: Array.isArray(parsed.clearedStages)
        ? parsed.clearedStages.filter((n): n is number => typeof n === 'number')
        : Array.from({ length: Math.max(0, highestClearedStage) }, (_, i) => i + 1),
      stageStars: parsed.stageStars && typeof parsed.stageStars === 'object' ? parsed.stageStars : DEFAULT_STATE.stageStars,
      storeUnlockedHeroes: Array.isArray(parsed.storeUnlockedHeroes) ? parsed.storeUnlockedHeroes : DEFAULT_STATE.storeUnlockedHeroes,
      // Migration: saves written before Hero Cards existed lack these keys and
      // silently default (new keys are additive; old code ignores them too).
      heroCards: parsed.heroCards && typeof parsed.heroCards === 'object' ? parsed.heroCards : { ...DEFAULT_STATE.heroCards },
      heroLevels: parsed.heroLevels && typeof parsed.heroLevels === 'object' ? parsed.heroLevels : { ...DEFAULT_STATE.heroLevels },
      // Migration: saves before encounter-tracking lack this — default to empty
      // so the first anomaly seen after updating still gets its reveal.
      encounteredEnemies: Array.isArray(parsed.encounteredEnemies)
        ? parsed.encounteredEnemies.filter((id): id is string => typeof id === 'string')
        : [...DEFAULT_STATE.encounteredEnemies],
      // Migration: saves before daily-claim / rewarded-ads lack these — default so
      // the first claim after updating is available and the ad counter starts fresh.
      lastDailyClaimDate: typeof parsed.lastDailyClaimDate === 'string' ? parsed.lastDailyClaimDate : DEFAULT_STATE.lastDailyClaimDate,
      adWatchDate: typeof parsed.adWatchDate === 'string' ? parsed.adWatchDate : DEFAULT_STATE.adWatchDate,
      adWatchCount: typeof parsed.adWatchCount === 'number' ? parsed.adWatchCount : DEFAULT_STATE.adWatchCount,
      // Migration: saves before IAP lack this — default to empty so a fresh
      // grant ledger starts clean (old saves never had unfinished IAP txns).
      iapProcessedTxIds: Array.isArray(parsed.iapProcessedTxIds)
        ? parsed.iapProcessedTxIds.filter((id): id is string => typeof id === 'string')
        : [...DEFAULT_STATE.iapProcessedTxIds],
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

export function getClearedStages(): number[] {
  return state.clearedStages;
}

export function isStageCleared(stageId: number): boolean {
  return state.clearedStages.includes(stageId);
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

export function getEncounteredEnemies(): string[] {
  return state.encounteredEnemies;
}

export function hasEncounteredEnemy(enemyId: string): boolean {
  return state.encounteredEnemies.includes(enemyId);
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

// --- Daily free claim + rewarded-ad permits -----------------------------------
// The date is re-checked at call time (not cached in the UI), so a stale screen
// left open across local midnight can never over-grant — the guard re-evaluates
// "today" on every claim/watch.

/** Whether the free daily permits can be claimed right now (once per local day). */
export function canClaimDaily(): boolean {
  return state.lastDailyClaimDate !== localDateStamp();
}

/** Claim the daily free permits. Returns false if already claimed today. */
export function claimDailyPermits(): boolean {
  const today = localDateStamp();
  if (state.lastDailyClaimDate === today) return false;
  state = { ...state, permits: state.permits + DAILY_CLAIM_PERMITS, lastDailyClaimDate: today };
  notify();
  return true;
}

/** Rewarded ads still redeemable for permits today (resets at local midnight). */
export function adsRemainingToday(): number {
  const today = localDateStamp();
  if (state.adWatchDate !== today) return MAX_AD_WATCHES_PER_DAY;
  return Math.max(0, MAX_AD_WATCHES_PER_DAY - state.adWatchCount);
}

/**
 * Grant the reward for one completed rewarded ad: permits += AD_PERMIT_REWARD and
 * the daily ad counter is recorded, atomically (single notify()). Returns false
 * if the daily cap is already reached.
 */
export function grantAdReward(): boolean {
  const today = localDateStamp();
  const watchedToday = state.adWatchDate === today ? state.adWatchCount : 0;
  if (watchedToday >= MAX_AD_WATCHES_PER_DAY) return false;
  state = {
    ...state,
    permits: state.permits + AD_PERMIT_REWARD,
    adWatchDate: today,
    adWatchCount: watchedToday + 1,
  };
  notify();
  return true;
}

/** Whether an IAP store transaction has already been granted. */
export function hasProcessedIapTx(txId: string): boolean {
  return state.iapProcessedTxIds.includes(txId);
}

/**
 * Grant a paid currency pack exactly once per store transaction id. The grant
 * and the "processed" record are one atomic state write (single notify()), so a
 * crash can't leave currency added without the txId recorded (or vice versa).
 * Returns false (no-op) when the amount is invalid or the txId was already
 * processed — making it safe to call on every replayed `approved` event, this
 * session or on a later app launch.
 */
export function recordIapGrant(txId: string, currency: 'hope' | 'permits', amount: number): boolean {
  if (!txId || amount <= 0 || state.iapProcessedTxIds.includes(txId)) return false;
  state = {
    ...state,
    hope: currency === 'hope' ? state.hope + amount : state.hope,
    permits: currency === 'permits' ? state.permits + amount : state.permits,
    iapProcessedTxIds: [...state.iapProcessedTxIds, txId].slice(-MAX_IAP_TX_HISTORY),
  };
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

/** Record a first-ever enemy encounter. Returns true only if it was new. */
export function markEnemyEncountered(enemyId: string): boolean {
  if (state.encounteredEnemies.includes(enemyId)) return false;
  state = { ...state, encounteredEnemies: [...state.encounteredEnemies, enemyId] };
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
  if (!state.clearedStages.includes(stageId)) {
    newState.clearedStages = [...state.clearedStages, stageId];
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
