import { Capacitor } from '@capacitor/core';
import { IAP_PRODUCTS, getIapProduct, type IapProductDef, type IapProductId } from '../../iapConfig';
import { recordIapGrant } from '../data/metaState';

/**
 * In-app purchase engine for First Ripple. A module singleton (same shape as
 * core/AdsManager) so the React store can request a purchase through one path.
 *
 * Platform split (mirrors AdsManager):
 *   - Web / dev: there is no store SDK in a browser, so purchase() *simulates*
 *     the flow (a short delay, then the currency is granted) to keep the whole
 *     store flow testable in `npm run dev` and in jsdom tests.
 *   - Native (Capacitor android/ios): cordova-plugin-purchase injects a global
 *     `CdvPurchase` object. We read it behind a platform check (there is no ESM
 *     to dynamically import — it's a Cordova plugin), with a minimal local
 *     interface so the plugin's types are never a hard dependency of the web
 *     build. A missing/failed plugin degrades to status 'unavailable' and
 *     purchase() resolves false — nothing here ever throws to the caller.
 *
 * Grant model (no backend, so no server receipt validation): we grant currency
 * at the `approved` lifecycle point and then `finish()` the transaction. That is
 * at-least-once delivery — if the app dies before finish(), the store replays
 * `approved` on the next launch. metaState.recordIapGrant dedups by transaction
 * id, turning at-least-once into exactly-once. We deliberately do NOT call
 * verify(): with no `store.validator` configured, verify() would stall the flow.
 *
 * The product catalog (ids, grant amounts) lives in ../../iapConfig; this module
 * only maps a purchased product id → its currency/amount for the grant.
 */

export type IapStatus =
  | 'uninitialized'
  | 'initializing'
  | 'ready'
  | 'purchasing'
  | 'unavailable';

/** How long the web/dev simulated purchase "processes" before granting. */
const SIMULATED_PURCHASE_MS = 1500;

// --- Minimal shape of the cordova-plugin-purchase (v13) surface we use --------
// Kept local to avoid a hard type dependency on the native-only global in the
// web build (same approach as AdsManager's AdMobLike).

interface CdvOfferLike {
  order(): Promise<{ code?: number; message?: string } | undefined>;
}
interface CdvProductLike {
  id: string;
  pricing?: { price?: string };
  getOffer(): CdvOfferLike | undefined;
}
interface CdvTransactionLike {
  transactionId: string;
  products: { id: string }[];
  finish(): Promise<void> | void;
}
interface CdvWhenLike {
  productUpdated(cb: (product: CdvProductLike) => void): CdvWhenLike;
  approved(cb: (tx: CdvTransactionLike) => void): CdvWhenLike;
  finished(cb: (tx: CdvTransactionLike) => void): CdvWhenLike;
}
interface CdvStoreLike {
  register(products: { id: string; type: string; platform: string }[]): void;
  when(): CdvWhenLike;
  error(cb: (err: { code: number; message: string }) => void): void;
  initialize(platforms: string[]): Promise<unknown>;
  get(id: string, platform?: string): CdvProductLike | undefined;
}
interface CdvPurchaseLike {
  store: CdvStoreLike;
  ProductType: { CONSUMABLE: string };
  Platform: { GOOGLE_PLAY: string; APPLE_APPSTORE: string };
}

class IapManagerImpl {
  private status: IapStatus = 'uninitialized';
  private listeners = new Set<() => void>();

  private cdv: CdvPurchaseLike | null = null;
  private platformId = '';
  private initPromise: Promise<void> | null = null;

  /** Store-reported, locale-formatted prices, keyed by product id (native). */
  private prices = new Map<string, string>();

  /** The product currently being purchased + its promise resolver (native). */
  private pendingProductId: IapProductId | null = null;
  private purchaseResolver: ((granted: boolean) => void) | null = null;

  /** True on web / dev, where purchases are simulated rather than billed. */
  isSimulated(): boolean {
    return this.getPlatform() === 'web';
  }

  getStatus(): IapStatus {
    return this.status;
  }

  /**
   * Display price for a product. Web returns the config's simulated price;
   * native returns the store's locale-formatted price once loaded, or null
   * until the `productUpdated` event has arrived (UI shows a placeholder).
   */
  getPrice(id: IapProductId): string | null {
    if (this.isSimulated()) {
      return getIapProduct(id)?.simulatedPrice ?? null;
    }
    return this.prices.get(id) ?? null;
  }

  subscribe(cb: () => void): () => void {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }

  private notify(): void {
    for (const cb of this.listeners) cb();
  }

  private setStatus(status: IapStatus): void {
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
   * Idempotent. Web resolves instantly to 'ready' (simulated). Native reads the
   * plugin global, registers the products, attaches lifecycle handlers, and
   * initializes the store — which also replays any unfinished consumable
   * purchase so a grant interrupted last session lands now.
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
      const cdv = (globalThis as { CdvPurchase?: CdvPurchaseLike }).CdvPurchase;
      if (!cdv) {
        // Web build accidentally on native, or the plugin failed to install —
        // degrade quietly; purchases are simply unavailable.
        this.setStatus('unavailable');
        return;
      }
      this.cdv = cdv;
      this.platformId =
        this.getPlatform() === 'ios' ? cdv.Platform.APPLE_APPSTORE : cdv.Platform.GOOGLE_PLAY;

      cdv.store.register(
        IAP_PRODUCTS.map((p) => ({
          id: p.id,
          type: cdv.ProductType.CONSUMABLE,
          platform: this.platformId,
        })),
      );

      // Attach handlers BEFORE initialize() so the initial replay of any
      // unfinished transaction is caught.
      cdv.store
        .when()
        .productUpdated((product) => {
          const price = product.pricing?.price;
          if (price) {
            this.prices.set(product.id, price);
            this.notify();
          }
        })
        .approved((tx) => {
          // Single grant point. Granting before finish() gives at-least-once
          // delivery; recordIapGrant's txId dedup makes it exactly-once.
          for (const p of tx.products) {
            const def = getIapProduct(p.id);
            if (def) recordIapGrant(`${tx.transactionId}:${p.id}`, def.currency, def.amount);
          }
          void tx.finish();
        })
        .finished((tx) => {
          if (this.pendingProductId && tx.products.some((p) => p.id === this.pendingProductId)) {
            this.resolvePurchase(true);
          }
        });

      cdv.store.error(() => {
        // A store-level error (present/cancel/network) — resolve any in-flight
        // purchase false and degrade quietly.
        this.resolvePurchase(false);
      });

      await cdv.store.initialize([this.platformId]);
      this.setStatus('ready');
    } catch {
      this.cdv = null;
      this.setStatus('unavailable');
    }
  }

  private resolvePurchase(granted: boolean): void {
    const resolver = this.purchaseResolver;
    if (!resolver) return;
    this.purchaseResolver = null;
    this.pendingProductId = null;
    resolver(granted);
  }

  /**
   * Buy a currency pack. Resolves true only once the grant has landed; a
   * cancel, error, or unavailable store resolves false. Never rejects.
   */
  async purchase(id: IapProductId): Promise<boolean> {
    // Guard re-entrancy — a purchase already in flight (belt-and-suspenders
    // with the store UI's own busy flag).
    if (this.status === 'purchasing') return false;

    const def = getIapProduct(id) as IapProductDef | undefined;
    if (!def) return false;

    if (this.isSimulated()) {
      this.setStatus('purchasing');
      await new Promise((r) => setTimeout(r, SIMULATED_PURCHASE_MS));
      recordIapGrant(`sim-${id}-${Date.now()}`, def.currency, def.amount);
      this.setStatus('ready');
      return true;
    }

    if (this.status !== 'ready') {
      await this.init();
    }
    // getStatus()'s declared return type intentionally sidesteps control-flow
    // narrowing here — init() may have just flipped the status across the await.
    if (this.getStatus() !== 'ready') return false;
    const cdv = this.cdv;
    if (!cdv) return false;

    const offer = cdv.store.get(id, this.platformId)?.getOffer();
    if (!offer) return false;

    this.setStatus('purchasing');
    const done = new Promise<boolean>((resolve) => {
      this.pendingProductId = id;
      this.purchaseResolver = resolve;
    });
    try {
      // v13 order() resolves an IError on failure/cancel, undefined on success;
      // the actual grant is awaited via the `finished` handler below.
      const err = await offer.order();
      if (err) this.resolvePurchase(false);
    } catch {
      this.resolvePurchase(false);
    }
    const granted = await done;
    this.setStatus('ready');
    return granted;
  }

  /** Test hook — reset in-memory state. */
  resetForTests(): void {
    this.status = 'uninitialized';
    this.cdv = null;
    this.platformId = '';
    this.initPromise = null;
    this.prices.clear();
    this.pendingProductId = null;
    this.purchaseResolver = null;
    this.listeners.clear();
  }
}

/** The shared IAP singleton — import and use directly. */
export const IapManager = new IapManagerImpl();
