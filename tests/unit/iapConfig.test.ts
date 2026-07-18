import { describe, expect, it } from 'vitest';
import { IAP_PRODUCTS, IAP_SIMULATED_PRICE, getIapProduct } from '../../src/iapConfig';

/**
 * The IAP catalog is the single source of truth for what the two real-money
 * packs grant. These lock the ids (which must match the store consoles) and the
 * grant amounts so a stray edit can't silently change what players receive.
 */

describe('IAP catalog', () => {
  it('sells exactly the two currency packs with the expected grants', () => {
    expect(IAP_PRODUCTS).toHaveLength(2);

    const hope = getIapProduct('hope_500');
    expect(hope).toMatchObject({ id: 'hope_500', currency: 'hope', amount: 500 });

    const permits = getIapProduct('permits_40');
    expect(permits).toMatchObject({ id: 'permits_40', currency: 'permits', amount: 40 });
  });

  it('returns undefined for an unknown product id', () => {
    expect(getIapProduct('hero_eden')).toBeUndefined();
    expect(getIapProduct('')).toBeUndefined();
  });

  it('gives every product a non-empty simulated price', () => {
    for (const p of IAP_PRODUCTS) {
      expect(p.simulatedPrice).toBe(IAP_SIMULATED_PRICE);
      expect(p.simulatedPrice.length).toBeGreaterThan(0);
    }
  });
});
