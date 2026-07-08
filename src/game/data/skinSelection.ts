import type { HeroId } from './balance';
import { defaultSkin, heroSkins, type HeroSkin } from './skins';

/**
 * Which skin each hero has equipped — the app's one piece of persisted player
 * state. A module singleton (same pattern as core/GameEvents) shared by React
 * (Archive picker, portraits) and Phaser (GameScene reads it at battle load,
 * so a change applies on the NEXT battle — no mid-battle reskin).
 *
 * Backed by localStorage so the choice survives reloads; storage access is
 * guarded so tests / non-browser environments degrade to in-memory only.
 */

const STORAGE_KEY = 'firstripple.skins';

type SkinMap = Partial<Record<HeroId, string>>;

function readStorage(): SkinMap {
  try {
    const raw = globalThis.localStorage?.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? (parsed as SkinMap) : {};
  } catch {
    return {};
  }
}

function writeStorage(map: SkinMap): void {
  try {
    globalThis.localStorage?.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    // Storage unavailable (private mode, tests) — selection stays in-memory.
  }
}

let selected: SkinMap = readStorage();
const listeners = new Set<() => void>();

/**
 * The skin this hero should render with: the equipped one if it's still a
 * valid skin of theirs, else the default. Undefined = no art (placeholder).
 */
export function getSelectedSkin(heroId: HeroId): HeroSkin | undefined {
  const skinId = selected[heroId];
  if (skinId) {
    const skin = heroSkins(heroId).find((s) => s.id === skinId);
    if (skin) return skin;
  }
  return defaultSkin(heroId);
}

/** Equip a skin (must belong to the hero), persist it, and notify the UI. */
export function setSelectedSkin(heroId: HeroId, skinId: string): void {
  if (!heroSkins(heroId).some((s) => s.id === skinId)) return;
  if (selected[heroId] === skinId) return;
  selected = { ...selected, [heroId]: skinId };
  writeStorage(selected);
  for (const cb of listeners) cb();
}

/** Subscribe React components to selection changes; returns unsubscribe. */
export function subscribeSkins(cb: () => void): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

/** Test hook — reset in-memory state (and re-read storage). */
export function resetSkinSelectionForTests(): void {
  selected = readStorage();
  listeners.clear();
}
