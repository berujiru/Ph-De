import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  addHeroCards,
  adsRemainingToday,
  AD_PERMIT_REWARD,
  canClaimDaily,
  claimDailyPermits,
  DAILY_CLAIM_PERMITS,
  getClearedStages,
  getEncounteredEnemies,
  getHeroCardCount,
  getHeroCards,
  getHeroLevel,
  getHighestClearedStage,
  getHope,
  getPermits,
  getStoreUnlockedHeroes,
  grantAdReward,
  hasEncounteredEnemy,
  hasProcessedIapTx,
  isStageCleared,
  levelUpHero,
  markEnemyEncountered,
  MAX_AD_WATCHES_PER_DAY,
  MAX_IAP_TX_HISTORY,
  recordIapGrant,
  recordStageClear,
  resetMetaStateForTests,
  subscribeMetaState,
} from '../../src/game/data/metaState';
import { HERO_LEVEL_CAP } from '../../src/game/data/heroProgression';

const STORAGE_KEY = 'firstripple.meta';

beforeEach(() => {
  localStorage.clear();
  resetMetaStateForTests();
});

describe('defaults', () => {
  it('starts with an empty card/level inventory', () => {
    expect(getHeroCards()).toEqual({});
    expect(getHeroCardCount('student')).toBe(0);
    expect(getHeroLevel('student')).toBe(1);
  });
});

describe('migration from a pre-cards save', () => {
  it('defaults the new fields while preserving old ones', () => {
    // A save written before Hero Cards existed (only the original five fields).
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        hope: 320,
        permits: 4,
        highestClearedStage: 7,
        stageStars: { 3: 2 },
        storeUnlockedHeroes: ['baker'],
      }),
    );
    resetMetaStateForTests();

    expect(getHope()).toBe(320);
    expect(getPermits()).toBe(4);
    expect(getStoreUnlockedHeroes()).toEqual(['baker']);
    // New fields silently default.
    expect(getHeroCards()).toEqual({});
    expect(getHeroLevel('baker')).toBe(1);
    // clearedStages back-fills from the old linear high-water mark (1..7).
    expect(getClearedStages()).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });
});

describe('recordStageClear', () => {
  it('tracks each beaten stage and can hold gaps (skipped bosses)', () => {
    recordStageClear(9, 3);
    // Skip the Act 1 boss (10), beat the Act 2 opener (11).
    recordStageClear(11, 1);

    expect(isStageCleared(9)).toBe(true);
    expect(isStageCleared(11)).toBe(true);
    expect(isStageCleared(10)).toBe(false); // boss stays unbeaten
    expect(getClearedStages()).toEqual([9, 11]);
    // Highest cleared still tracks the furthest reached (hero-unlock signal).
    expect(getHighestClearedStage()).toBe(11);
  });

  it('does not double-record a re-cleared stage', () => {
    recordStageClear(3, 1);
    recordStageClear(3, 2); // replay for more stars
    expect(getClearedStages()).toEqual([3]);
  });
});

describe('addHeroCards', () => {
  it('accumulates and persists to localStorage', () => {
    addHeroCards('student', 3);
    addHeroCards('student', 2);
    expect(getHeroCardCount('student')).toBe(5);

    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
    expect(saved.heroCards.student).toBe(5);
  });

  it('ignores non-positive amounts', () => {
    addHeroCards('student', 0);
    addHeroCards('student', -4);
    expect(getHeroCardCount('student')).toBe(0);
  });
});

describe('levelUpHero', () => {
  it('fails when short on cards', () => {
    addHeroCards('student', 4); // needs 5 for L1 -> L2
    expect(levelUpHero('student')).toBe(false);
    expect(getHeroLevel('student')).toBe(1);
    expect(getHeroCardCount('student')).toBe(4);
  });

  it('succeeds, deducting 5 * level and bumping the level', () => {
    addHeroCards('student', 5);
    expect(levelUpHero('student')).toBe(true);
    expect(getHeroLevel('student')).toBe(2);
    expect(getHeroCardCount('student')).toBe(0);
  });

  it('caps at HERO_LEVEL_CAP and refuses further promotion', () => {
    // Total cards to climb from L1 to the cap: sum of 5*level for level 1..cap-1.
    let total = 0;
    for (let lv = 1; lv < HERO_LEVEL_CAP; lv++) total += 5 * lv;
    addHeroCards('student', total + 100); // plenty
    while (levelUpHero('student')) { /* climb */ }

    expect(getHeroLevel('student')).toBe(HERO_LEVEL_CAP);
    expect(levelUpHero('student')).toBe(false);
  });

  it('notifies subscribers on mutation', () => {
    const spy = vi.fn();
    const unsub = subscribeMetaState(spy);
    addHeroCards('student', 5);
    expect(spy).toHaveBeenCalledTimes(1);
    levelUpHero('student');
    expect(spy).toHaveBeenCalledTimes(2);
    unsub();
  });
});

describe('markEnemyEncountered', () => {
  it('records only the first-ever encounter and persists it', () => {
    expect(hasEncounteredEnemy('grunt')).toBe(false);
    // First sighting is new — drives the one-time rally TCG reveal.
    expect(markEnemyEncountered('grunt')).toBe(true);
    expect(hasEncounteredEnemy('grunt')).toBe(true);
    // Every subsequent sighting (same battle or a later game) is a no-op.
    expect(markEnemyEncountered('grunt')).toBe(false);
    expect(getEncounteredEnemies()).toEqual(['grunt']);

    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
    expect(saved.encounteredEnemies).toEqual(['grunt']);
  });

  it('remembers encounters across a reload (persistent, not per-game)', () => {
    markEnemyEncountered('runner');
    resetMetaStateForTests(); // simulate a fresh app load reading storage
    expect(hasEncounteredEnemy('runner')).toBe(true);
    expect(markEnemyEncountered('runner')).toBe(false);
  });

  it('notifies subscribers only when a new enemy is recorded', () => {
    const spy = vi.fn();
    const unsub = subscribeMetaState(spy);
    markEnemyEncountered('brute');
    expect(spy).toHaveBeenCalledTimes(1);
    markEnemyEncountered('brute'); // already known — no state change, no notify
    expect(spy).toHaveBeenCalledTimes(1);
    unsub();
  });
});

describe('corrupt storage', () => {
  it('falls back to defaults on invalid JSON', () => {
    localStorage.setItem(STORAGE_KEY, '{not valid json');
    resetMetaStateForTests();
    expect(getHope()).toBe(0);
    expect(getHeroCards()).toEqual({});
  });
});

describe('daily free permit claim', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('grants the daily permits once, then blocks until the next local day', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 6, 16, 9, 0, 0)); // local noon-ish

    const before = getPermits();
    expect(canClaimDaily()).toBe(true);
    expect(claimDailyPermits()).toBe(true);
    expect(getPermits()).toBe(before + DAILY_CLAIM_PERMITS);

    // Same day → refused, no further grant.
    expect(canClaimDaily()).toBe(false);
    expect(claimDailyPermits()).toBe(false);
    expect(getPermits()).toBe(before + DAILY_CLAIM_PERMITS);

    // Next local day → claimable again.
    vi.setSystemTime(new Date(2026, 6, 17, 0, 0, 1));
    expect(canClaimDaily()).toBe(true);
    expect(claimDailyPermits()).toBe(true);
    expect(getPermits()).toBe(before + DAILY_CLAIM_PERMITS * 2);
  });

  it('resets on the calendar day, not a rolling 24h window', () => {
    vi.useFakeTimers();
    // Claim at 23:59 local.
    vi.setSystemTime(new Date(2026, 6, 16, 23, 59, 0));
    expect(claimDailyPermits()).toBe(true);

    // Two minutes later it is a new calendar day (00:01) — claimable, even
    // though far less than 24h has elapsed.
    vi.setSystemTime(new Date(2026, 6, 17, 0, 1, 0));
    expect(canClaimDaily()).toBe(true);
  });

  it('persists the claim across a reload', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 6, 16, 12, 0, 0));
    claimDailyPermits();
    resetMetaStateForTests(); // re-read storage
    expect(canClaimDaily()).toBe(false);
  });
});

describe('rewarded-ad permits', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('grants AD_PERMIT_REWARD per watch up to the daily cap, then refuses', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 6, 16, 10, 0, 0));

    const before = getPermits();
    expect(adsRemainingToday()).toBe(MAX_AD_WATCHES_PER_DAY);

    for (let i = 1; i <= MAX_AD_WATCHES_PER_DAY; i++) {
      expect(grantAdReward()).toBe(true);
      expect(getPermits()).toBe(before + AD_PERMIT_REWARD * i);
      expect(adsRemainingToday()).toBe(MAX_AD_WATCHES_PER_DAY - i);
    }

    // Cap reached → refused, no more permits.
    expect(grantAdReward()).toBe(false);
    expect(getPermits()).toBe(before + AD_PERMIT_REWARD * MAX_AD_WATCHES_PER_DAY);
  });

  it('resets the ad counter at local midnight', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 6, 16, 10, 0, 0));
    for (let i = 0; i < MAX_AD_WATCHES_PER_DAY; i++) grantAdReward();
    expect(adsRemainingToday()).toBe(0);

    vi.setSystemTime(new Date(2026, 6, 17, 0, 0, 5));
    expect(adsRemainingToday()).toBe(MAX_AD_WATCHES_PER_DAY);
    expect(grantAdReward()).toBe(true);
    expect(adsRemainingToday()).toBe(MAX_AD_WATCHES_PER_DAY - 1);
  });
});

describe('migration from a pre-ads save', () => {
  it('defaults the daily/ad fields so the first claim is available', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ hope: 10, permits: 2, highestClearedStage: 1 }),
    );
    resetMetaStateForTests();
    expect(canClaimDaily()).toBe(true);
    expect(adsRemainingToday()).toBe(MAX_AD_WATCHES_PER_DAY);
  });
});

describe('recordIapGrant', () => {
  it('grants the currency and records the transaction once', () => {
    expect(getHope()).toBe(0);
    expect(recordIapGrant('txn-1', 'hope', 500)).toBe(true);
    expect(getHope()).toBe(500);
    expect(hasProcessedIapTx('txn-1')).toBe(true);

    expect(recordIapGrant('txn-2', 'permits', 40)).toBe(true);
    expect(getPermits()).toBe(25 + 40); // 25 = starting permits
  });

  it('is idempotent — a replayed transaction id never double-grants', () => {
    expect(recordIapGrant('txn-dup', 'hope', 500)).toBe(true);
    expect(getHope()).toBe(500);
    // Same id again (store replays `approved` until finished) → no-op.
    expect(recordIapGrant('txn-dup', 'hope', 500)).toBe(false);
    expect(getHope()).toBe(500);
  });

  it('rejects non-positive amounts and empty ids', () => {
    expect(recordIapGrant('txn-x', 'hope', 0)).toBe(false);
    expect(recordIapGrant('txn-x', 'hope', -100)).toBe(false);
    expect(recordIapGrant('', 'hope', 500)).toBe(false);
    expect(getHope()).toBe(0);
  });

  it('caps the retained transaction history but keeps granting', () => {
    for (let i = 0; i < MAX_IAP_TX_HISTORY + 10; i++) {
      expect(recordIapGrant(`txn-${i}`, 'hope', 1)).toBe(true);
    }
    expect(getHope()).toBe(MAX_IAP_TX_HISTORY + 10);
    // Oldest ids are evicted from the ledger; only the most recent are retained.
    expect(hasProcessedIapTx('txn-0')).toBe(false);
    expect(hasProcessedIapTx(`txn-${MAX_IAP_TX_HISTORY + 9}`)).toBe(true);
  });

  it('persists the grant + ledger across a reload', () => {
    recordIapGrant('txn-persist', 'permits', 40);
    resetMetaStateForTests(); // re-read storage
    expect(getPermits()).toBe(25 + 40);
    expect(hasProcessedIapTx('txn-persist')).toBe(true);
    // A replay after reload is still deduped.
    expect(recordIapGrant('txn-persist', 'permits', 40)).toBe(false);
  });

  it('defaults the ledger to empty for a pre-IAP save', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ hope: 10, permits: 2, highestClearedStage: 1 }),
    );
    resetMetaStateForTests();
    expect(hasProcessedIapTx('anything')).toBe(false);
    expect(recordIapGrant('txn-new', 'hope', 500)).toBe(true);
  });
});
