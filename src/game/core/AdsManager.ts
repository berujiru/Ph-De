import { Capacitor } from '@capacitor/core';
import { resolveRewardedAdConfig } from '../../adsConfig';

/**
 * Rewarded-ads engine for First Ripple. A module singleton (same shape as
 * core/AudioManager) so the React store can request an ad through one path.
 *
 * Platform split:
 *   - Web / dev: there is no AdMob SDK in a browser, so showRewarded() simulates
 *     an ad (a short delay, then "reward earned") to keep the whole store flow
 *     testable in `npm run dev` and in jsdom tests.
 *   - Native (Capacitor android/ios): the @capacitor-community/admob plugin is
 *     loaded via a *dynamic* import so it never evaluates in the web bundle or
 *     tests. A missing/failed plugin degrades to status 'unavailable' and
 *     showRewarded() resolves false — nothing here ever throws to the caller
 *     (the AudioManager degradation contract).
 *
 * This module knows nothing about permits or daily caps; the store owns that
 * (metaState.grantAdReward / adsRemainingToday) and only calls showRewarded().
 */

export type AdsStatus =
  | 'uninitialized'
  | 'initializing'
  | 'ready'
  | 'loading'
  | 'showing'
  | 'unavailable';

/** How long the web/dev simulated ad "plays" before granting the reward. */
const SIMULATED_AD_MS = 1500;
/** Delay before retrying a failed native preload, once. */
const RELOAD_RETRY_MS = 30_000;

/** Minimal shape of the plugin surface we use — kept local to avoid a hard
 *  type dependency on the native-only module in the web build. */
interface AdMobLike {
  initialize(options?: { initializeForTesting?: boolean }): Promise<void>;
  prepareRewardVideoAd(options: { adId: string; isTesting?: boolean }): Promise<unknown>;
  showRewardVideoAd(): Promise<unknown>;
  addListener(event: string, cb: (info?: unknown) => void): Promise<unknown> | unknown;
}

class AdsManagerImpl {
  private status: AdsStatus = 'uninitialized';
  private listeners = new Set<() => void>();

  private admob: AdMobLike | null = null;
  private initPromise: Promise<void> | null = null;
  private retryHandle: ReturnType<typeof setTimeout> | null = null;

  /** Set true by the persistent Rewarded listener, read on Dismissed. */
  private rewardEarnedThisShow = false;
  /** Resolver for the in-flight showRewarded() promise (native path). */
  private showResolver: ((earned: boolean) => void) | null = null;

  /** True on web / dev, where ads are simulated rather than served by AdMob. */
  isSimulated(): boolean {
    return this.getPlatform() === 'web';
  }

  getStatus(): AdsStatus {
    return this.status;
  }

  subscribe(cb: () => void): () => void {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }

  private notify(): void {
    for (const cb of this.listeners) cb();
  }

  private setStatus(status: AdsStatus): void {
    if (this.status === status) return;
    this.status = status;
    this.notify();
  }

  private getPlatform(): string {
    try {
      return Capacitor.getPlatform();
    } catch {
      return 'web';
    }
  }

  /**
   * Idempotent. Web resolves instantly to 'ready' (simulated). Native loads the
   * plugin, initializes AdMob, attaches listeners, and preloads the first ad.
   */
  init(): Promise<void> {
    if (this.initPromise) return this.initPromise;
    this.initPromise = this.doInit();
    return this.initPromise;
  }

  private async doInit(): Promise<void> {
    if (this.isSimulated()) {
      this.setStatus('ready');
      return;
    }
    this.setStatus('initializing');
    try {
      const mod = await import('@capacitor-community/admob');
      const admob = mod.AdMob as unknown as AdMobLike;
      this.admob = admob;

      const cfg = resolveRewardedAdConfig(this.getPlatform());
      await admob.initialize({ initializeForTesting: cfg.isTesting });

      // Persistent listeners (attached once). Reward flips the per-show flag;
      // Dismissed / FailedToShow resolve the in-flight showRewarded() promise.
      admob.addListener('onRewardedVideoAdReward', () => {
        this.rewardEarnedThisShow = true;
      });
      admob.addListener('onRewardedVideoAdDismissed', () => {
        this.resolveShow();
        void this.preload();
      });
      admob.addListener('onRewardedVideoAdFailedToShow', () => {
        this.resolveShow();
        void this.preload();
      });
      admob.addListener('onRewardedVideoAdLoaded', () => {
        this.setStatus('ready');
      });
      admob.addListener('onRewardedVideoAdFailedToLoad', () => {
        // One retry, then leave it 'unavailable' until the next init/show.
        this.scheduleRetry();
      });

      await this.preload();
    } catch {
      // Plugin absent (web build accidentally on native, install failure) or
      // AdMob.initialize rejected — degrade quietly, ads simply unavailable.
      this.admob = null;
      this.setStatus('unavailable');
    }
  }

  private async preload(): Promise<void> {
    if (!this.admob) return;
    this.setStatus('loading');
    try {
      const cfg = resolveRewardedAdConfig(this.getPlatform());
      await this.admob.prepareRewardVideoAd({ adId: cfg.adId, isTesting: cfg.isTesting });
      // The Loaded listener flips to 'ready'; set it here too in case the
      // promise resolves without the event on some plugin versions.
      this.setStatus('ready');
    } catch {
      this.scheduleRetry();
    }
  }

  private scheduleRetry(): void {
    this.setStatus('unavailable');
    if (this.retryHandle != null) return;
    this.retryHandle = setTimeout(() => {
      this.retryHandle = null;
      void this.preload();
    }, RELOAD_RETRY_MS);
  }

  private resolveShow(): void {
    const resolver = this.showResolver;
    if (!resolver) return;
    this.showResolver = null;
    const earned = this.rewardEarnedThisShow;
    this.rewardEarnedThisShow = false;
    resolver(earned);
  }

  /**
   * Show a rewarded ad. Resolves true only if the reward was actually earned
   * (full watch); early dismissal, failure, or an unavailable SDK → false.
   * Never rejects.
   */
  async showRewarded(): Promise<boolean> {
    // Guard re-entrancy — a show already in flight (belt-and-suspenders with the
    // store's own busy flag).
    if (this.status === 'showing') return false;

    if (this.isSimulated()) {
      this.setStatus('showing');
      await new Promise((r) => setTimeout(r, SIMULATED_AD_MS));
      this.setStatus('ready');
      return true;
    }

    if (!this.admob) {
      // init() may not have run yet, or the plugin is unavailable.
      await this.init();
      if (!this.admob) return false;
    }

    this.rewardEarnedThisShow = false;
    this.setStatus('showing');
    const done = new Promise<boolean>((resolve) => {
      this.showResolver = resolve;
    });
    try {
      await this.admob.showRewardVideoAd();
    } catch {
      // Failed to present — resolve false and move on.
      this.resolveShow();
    }
    const earned = await done;
    return earned;
  }

  /** Test hook — reset in-memory state. */
  resetForTests(): void {
    if (this.retryHandle != null) {
      clearTimeout(this.retryHandle);
      this.retryHandle = null;
    }
    this.status = 'uninitialized';
    this.admob = null;
    this.initPromise = null;
    this.rewardEarnedThisShow = false;
    this.showResolver = null;
    this.listeners.clear();
  }
}

/** The shared rewarded-ads singleton — import and use directly. */
export const AdsManager = new AdsManagerImpl();
