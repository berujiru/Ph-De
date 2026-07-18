import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { IapManager } from '../../src/game/core/IapManager';
import { getHope, getPermits, resetMetaStateForTests } from '../../src/game/data/metaState';

/**
 * IapManager's contract: on web it *simulates* a purchase (delay → grant), and
 * on native it never throws even if the billing plugin is missing or fails — it
 * degrades to 'unavailable' and purchase() resolves false. Grants are exactly
 * once per store transaction id, even when the store replays `approved`.
 */

// Mutable platform, referenced from the hoisted @capacitor/core mock.
const h = vi.hoisted(() => ({ platform: 'web' }));

vi.mock('@capacitor/core', () => ({
  Capacitor: { getPlatform: () => h.platform },
}));

// --- A hand-rolled cordova-plugin-purchase fake, installed as globalThis.CdvPurchase.
type Handler<T> = (arg: T) => void;
interface FakeTx {
  transactionId: string;
  products: { id: string }[];
  finish: ReturnType<typeof vi.fn>;
}
function installCdvFake(opts: { initialize?: () => Promise<unknown>; hasOffer?: boolean } = {}) {
  const handlers: {
    productUpdated: Handler<{ id: string; pricing?: { price?: string } }>[];
    approved: Handler<FakeTx>[];
    finished: Handler<FakeTx>[];
    error: Handler<{ code: number; message: string }>[];
  } = { productUpdated: [], approved: [], finished: [], error: [] };

  const when = {
    productUpdated(cb: Handler<{ id: string; pricing?: { price?: string } }>) { handlers.productUpdated.push(cb); return when; },
    approved(cb: Handler<FakeTx>) { handlers.approved.push(cb); return when; },
    finished(cb: Handler<FakeTx>) { handlers.finished.push(cb); return when; },
  };

  const order = vi.fn(async () => undefined);
  const store = {
    register: vi.fn(),
    when: () => when,
    error: (cb: Handler<{ code: number; message: string }>) => { handlers.error.push(cb); },
    initialize: vi.fn(opts.initialize ?? (async () => {})),
    get: vi.fn((id: string) =>
      opts.hasOffer === false ? undefined : { id, getOffer: () => ({ order }) },
    ),
  };

  const cdv = {
    store,
    ProductType: { CONSUMABLE: 'consumable' },
    Platform: { GOOGLE_PLAY: 'android-playstore', APPLE_APPSTORE: 'ios-appstore' },
  };
  (globalThis as Record<string, unknown>).CdvPurchase = cdv;
  return { handlers, store, order };
}

beforeEach(() => {
  h.platform = 'web';
  localStorage.clear();
  resetMetaStateForTests();
});

afterEach(() => {
  IapManager.resetForTests();
  delete (globalThis as Record<string, unknown>).CdvPurchase;
  vi.useRealTimers();
});

describe('web / simulated path', () => {
  it('initializes to ready and reports simulated', async () => {
    await IapManager.init();
    expect(IapManager.isSimulated()).toBe(true);
    expect(IapManager.getStatus()).toBe('ready');
    expect(IapManager.getPrice('hope_500')).toBe('₱50.00');
  });

  it('grants exactly the pack amount after the simulated purchase', async () => {
    vi.useFakeTimers();
    await IapManager.init();

    const p = IapManager.purchase('hope_500');
    expect(IapManager.getStatus()).toBe('purchasing');

    await vi.advanceTimersByTimeAsync(2000);
    await expect(p).resolves.toBe(true);
    expect(IapManager.getStatus()).toBe('ready');
    expect(getHope()).toBe(500);
  });

  it('refuses a concurrent purchase while one is in flight', async () => {
    vi.useFakeTimers();
    await IapManager.init();

    const first = IapManager.purchase('permits_40');
    expect(IapManager.getStatus()).toBe('purchasing');
    await expect(IapManager.purchase('permits_40')).resolves.toBe(false);

    await vi.advanceTimersByTimeAsync(2000);
    await expect(first).resolves.toBe(true);
    expect(getPermits()).toBe(25 + 40); // one grant only
  });
});

describe('native — plugin missing', () => {
  it('degrades to unavailable without throwing', async () => {
    h.platform = 'android';
    // No globalThis.CdvPurchase installed.
    await expect(IapManager.init()).resolves.toBeUndefined();
    expect(IapManager.getStatus()).toBe('unavailable');
    await expect(IapManager.purchase('hope_500')).resolves.toBe(false);
    expect(getHope()).toBe(0);
  });
});

describe('native — plugin present', () => {
  it('registers products, caches prices, and reaches ready', async () => {
    h.platform = 'android';
    const { handlers, store } = installCdvFake();

    await IapManager.init();
    expect(store.register).toHaveBeenCalledOnce();
    expect(store.initialize).toHaveBeenCalledOnce();
    expect(IapManager.getStatus()).toBe('ready');

    // A price update from the store is exposed via getPrice().
    handlers.productUpdated.forEach((cb) => cb({ id: 'hope_500', pricing: { price: '₱49.99' } }));
    expect(IapManager.getPrice('hope_500')).toBe('₱49.99');
  });

  it('grants once even when the store replays `approved` for the same tx', async () => {
    h.platform = 'android';
    const { handlers } = installCdvFake();
    await IapManager.init();

    const tx: FakeTx = { transactionId: 'GPA.123', products: [{ id: 'hope_500' }], finish: vi.fn(async () => {}) };

    handlers.approved.forEach((cb) => cb(tx)); // first delivery
    handlers.approved.forEach((cb) => cb(tx)); // replay on next launch

    expect(getHope()).toBe(500); // granted exactly once
    expect(tx.finish).toHaveBeenCalledTimes(2); // but finished both times
  });

  it('degrades to unavailable when initialize rejects', async () => {
    h.platform = 'ios';
    installCdvFake({ initialize: async () => { throw new Error('no store'); } });

    await expect(IapManager.init()).resolves.toBeUndefined();
    expect(IapManager.getStatus()).toBe('unavailable');
    await expect(IapManager.purchase('hope_500')).resolves.toBe(false);
  });

  it('completes a purchase when the finished event fires', async () => {
    h.platform = 'android';
    const { handlers } = installCdvFake();
    await IapManager.init();

    const p = IapManager.purchase('permits_40');
    // Simulate the store approving then finishing the transaction.
    const tx: FakeTx = { transactionId: 'GPA.456', products: [{ id: 'permits_40' }], finish: vi.fn(async () => {}) };
    handlers.approved.forEach((cb) => cb(tx));
    handlers.finished.forEach((cb) => cb(tx));

    await expect(p).resolves.toBe(true);
    expect(getPermits()).toBe(25 + 40);
    expect(IapManager.getStatus()).toBe('ready');
  });
});
