/**
 * In-app purchase catalog for First Ripple — the two real-money consumables
 * (currency top-ups) sold through Google Play / the App Store. Kept as a pure
 * module (no Capacitor import) so it unit-tests cleanly and is safe to load in
 * the web bundle; the actual billing plugin lives behind IapManager's
 * native-only global (CdvPurchase).
 *
 * Grant amounts live here so a game-designer can tune the pack sizes in one
 * place. The `id`s must match the product identifiers created in the store
 * consoles exactly (both consoles accept snake_case, so the same id works on
 * both platforms — if that ever diverges, add a resolveIapProductId(platform)
 * helper here, mirroring adsConfig's resolveRewardedAdConfig).
 *
 * Design rule (docs/PROGRESSION.md, rendered in-store): real money buys
 * *supplies* only — heroes are never sold for money. Only currency/cosmetic
 * products belong in this catalog.
 */

export type IapProductId = 'hope_500' | 'permits_40';
export type IapCurrency = 'hope' | 'permits';

export interface IapProductDef {
  /** Must match the Play Console / App Store Connect product identifier. */
  id: IapProductId;
  /** Which meta-currency this pack grants. */
  currency: IapCurrency;
  /** How much of that currency to grant on a successful purchase. */
  amount: number;
  /** Store-tile display name. */
  title: string;
  /** Store-tile flavor line. */
  description: string;
  /** Price shown on the web/dev simulated path (no store to quote a real one). */
  simulatedPrice: string;
}

/** Placeholder price for the web/dev simulated flow. On native the store
 *  reports the real, locale-formatted price (see IapManager.getPrice). */
export const IAP_SIMULATED_PRICE = '₱50.00';

export const IAP_PRODUCTS: readonly IapProductDef[] = [
  {
    id: 'hope_500',
    currency: 'hope',
    amount: 500,
    title: 'Jar of Hope',
    description: '500 Hope Points to stock up the movement.',
    simulatedPrice: IAP_SIMULATED_PRICE,
  },
  {
    id: 'permits_40',
    currency: 'permits',
    amount: 40,
    title: 'Permit Envelope',
    description: '40 Rally Permits — a month of marches, pre-approved.',
    simulatedPrice: IAP_SIMULATED_PRICE,
  },
];

/** Look up a product definition by id. Returns undefined for unknown ids
 *  (e.g. a stale store transaction for a product we no longer sell). */
export function getIapProduct(id: string): IapProductDef | undefined {
  return IAP_PRODUCTS.find((p) => p.id === id);
}
