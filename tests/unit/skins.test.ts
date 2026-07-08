import { beforeEach, describe, expect, it, vi } from 'vitest';
import { HERO_SKINS, defaultSkin, heroSkins, skinById } from '../../src/game/data/skins';
import {
  getSelectedSkin,
  resetSkinSelectionForTests,
  setSelectedSkin,
  subscribeSkins,
} from '../../src/game/data/skinSelection';

/**
 * Hero skins: each skin is ONE combined sheet (idle/march/attack/cast + a
 * portrait cell); selection persists to localStorage and resolves to the
 * default skin when nothing is equipped. Eden ships the reference skin.
 */

const STORAGE_KEY = 'firstripple.skins';

beforeEach(() => {
  localStorage.clear();
  resetSkinSelectionForTests();
});

describe('skins catalog', () => {
  it('ships Eden a default skin whose id doubles as texture key', () => {
    const eden = defaultSkin('eden');
    expect(eden).toBeDefined();
    expect(eden!.id).toBe('eden');
    expect(eden!.heroId).toBe('eden');
    expect(heroSkins('eden')[0]).toBe(eden);
  });

  it('returns no skins for heroes without art (placeholder path)', () => {
    expect(heroSkins('teacher')).toEqual([]);
    expect(defaultSkin('teacher')).toBeUndefined();
  });

  it('resolves skins by unique id across heroes', () => {
    expect(skinById('eden')?.heroId).toBe('eden');
    expect(skinById('nope')).toBeUndefined();
  });

  it('keeps every skin state range inside the sheet grid', () => {
    for (const skins of Object.values(HERO_SKINS)) {
      for (const skin of skins ?? []) {
        for (const cfg of Object.values(skin.states)) {
          if (!cfg) continue;
          expect(cfg.from).toBeGreaterThanOrEqual(0);
          expect(cfg.from + cfg.frames).toBeLessThanOrEqual(skin.totalFrames);
        }
        expect(skin.portraitFrame).toBeLessThan(skin.totalFrames);
      }
    }
  });
});

describe('skin selection store', () => {
  it('falls back to the default skin when nothing is equipped', () => {
    expect(getSelectedSkin('eden')?.id).toBe('eden');
    expect(getSelectedSkin('teacher')).toBeUndefined();
  });

  it('equips a valid skin and notifies subscribers', () => {
    const cb = vi.fn();
    const unsub = subscribeSkins(cb);
    setSelectedSkin('eden', 'eden');
    // Equipping the already-effective default is a no-op only when it was
    // already stored; first explicit set still notifies.
    expect(getSelectedSkin('eden')?.id).toBe('eden');
    expect(cb).toHaveBeenCalledTimes(1);
    setSelectedSkin('eden', 'eden'); // same value again -> no re-notify
    expect(cb).toHaveBeenCalledTimes(1);
    unsub();
  });

  it("rejects a skin id that isn't the hero's", () => {
    const cb = vi.fn();
    subscribeSkins(cb);
    setSelectedSkin('eden', 'not-a-skin');
    expect(cb).not.toHaveBeenCalled();
    expect(getSelectedSkin('eden')?.id).toBe('eden'); // still default
  });

  it('persists the selection to localStorage and reads it back', () => {
    setSelectedSkin('eden', 'eden');
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!)).toEqual({ eden: 'eden' });

    // A fresh store (new session) resolves from storage.
    resetSkinSelectionForTests();
    expect(getSelectedSkin('eden')?.id).toBe('eden');
  });

  it('ignores a stale stored skin id and falls back to default', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ eden: 'eden_removed_skin' }));
    resetSkinSelectionForTests();
    expect(getSelectedSkin('eden')?.id).toBe('eden');
  });

  it('survives corrupt storage', () => {
    localStorage.setItem(STORAGE_KEY, '{not json');
    resetSkinSelectionForTests();
    expect(getSelectedSkin('eden')?.id).toBe('eden');
  });
});
