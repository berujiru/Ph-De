import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AdsManager } from '../../src/game/core/AdsManager';

/**
 * AdsManager's contract: on web it *simulates* a rewarded ad (delay → reward),
 * and on native it never throws even if the AdMob plugin is missing or fails —
 * it degrades to 'unavailable' and showRewarded() resolves false.
 */

// Mutable platform + a controllable initialize, referenced from the hoisted mocks.
const h = vi.hoisted(() => ({
  platform: 'web',
  initialize: vi.fn(async () => {}),
}));

vi.mock('@capacitor/core', () => ({
  Capacitor: { getPlatform: () => h.platform },
}));

vi.mock('@capacitor-community/admob', () => ({
  AdMob: {
    initialize: h.initialize,
    prepareRewardVideoAd: vi.fn(async () => {}),
    showRewardVideoAd: vi.fn(async () => {}),
    addListener: vi.fn(async () => {}),
  },
  RewardAdPluginEvents: {},
}));

beforeEach(() => {
  h.platform = 'web';
  h.initialize.mockReset();
  h.initialize.mockResolvedValue(undefined);
});

afterEach(() => {
  AdsManager.resetForTests();
  vi.useRealTimers();
});

describe('web / simulated path', () => {
  it('initializes to ready and reports simulated', async () => {
    await AdsManager.init();
    expect(AdsManager.isSimulated()).toBe(true);
    expect(AdsManager.getStatus()).toBe('ready');
  });

  it('resolves true after the simulated ad plays, cycling showing → ready', async () => {
    vi.useFakeTimers();
    await AdsManager.init();

    const seen: string[] = [];
    const unsub = AdsManager.subscribe(() => seen.push(AdsManager.getStatus()));

    const p = AdsManager.showRewarded();
    expect(AdsManager.getStatus()).toBe('showing');

    await vi.advanceTimersByTimeAsync(2000);
    await expect(p).resolves.toBe(true);
    expect(AdsManager.getStatus()).toBe('ready');
    expect(seen).toEqual(['showing', 'ready']);
    unsub();
  });

  it('refuses a concurrent show while one is in flight', async () => {
    vi.useFakeTimers();
    await AdsManager.init();

    const first = AdsManager.showRewarded();
    expect(AdsManager.getStatus()).toBe('showing');
    await expect(AdsManager.showRewarded()).resolves.toBe(false);

    await vi.advanceTimersByTimeAsync(2000);
    await expect(first).resolves.toBe(true);
  });
});

describe('native failure path', () => {
  it('degrades to unavailable without throwing when initialize rejects', async () => {
    h.platform = 'android';
    h.initialize.mockRejectedValueOnce(new Error('no play services'));

    await expect(AdsManager.init()).resolves.toBeUndefined();
    expect(AdsManager.getStatus()).toBe('unavailable');
    // With no live plugin, showing an ad simply yields no reward.
    await expect(AdsManager.showRewarded()).resolves.toBe(false);
  });
});
