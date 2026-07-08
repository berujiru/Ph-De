/**
 * Campaign battle-map skins — data-driven parallax backdrops.
 *
 * Each skin is a set of 4 SVG layers (sky, skyline, street, foreground) that
 * replace the default `bg-*` textures in ParallaxBackground. Skins are grouped
 * by act; stages within an act cycle through their act's skins so every 3
 * stages the player sees a fresh backdrop.
 *
 * The `season` field accommodates festival/seasonal variants (Sinulog,
 * Buwan ng Wika, Ber-months) — skins with a season tag are only active during
 * that event window, falling back to the base skin otherwise.
 *
 * Design principle: the CENTER of each layer is a clear pathway/road (where
 * units march), with decorative elements on the LEFT and RIGHT sides.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type MapSkinId =
  // Act 1 — Barangay (night)
  | 'brgy-eskenita'
  | 'brgy-court'
  | 'brgy-plaza'
  // Act 2 — Bayan (pre-dawn)
  | 'bayan-palengke'
  | 'bayan-terminal'
  | 'bayan-cityhall'
  // Act 3 — Province (golden hour / dusk)
  | 'prov-highway'
  | 'prov-port'
  | 'prov-capitol'
  // Act 4 — National (midnight city)
  | 'natl-avenue'
  | 'natl-govt'
  | 'natl-palace';

/** Optional season tag for festival/event map re-dresses. */
export type MapSeason =
  | 'sinulog'      // January
  | 'independence'  // June
  | 'buwan-ng-wika' // August
  | 'ber-months'    // Sept-Dec
  | 'default';

export interface MapSkin {
  id: MapSkinId;
  /** Human-readable name for debug / future UI skin-picker. */
  name: string;
  /** Which act this skin belongs to (1-4). */
  act: number;
  /** Time-of-day mood applied via the sky layer. */
  timeOfDay: 'night' | 'pre-dawn' | 'golden-hour' | 'midnight-city';
  /** Festival/event season. Defaults to 'default' (always active). */
  season: MapSeason;
  /**
   * Paths to the 4 parallax-layer SVGs. These map 1:1 to the PARALLAX.layers
   * array in level.ts (index 0=sky, 1=skyline, 2=street, 3=foreground).
   */
  layers: {
    sky: string;
    skyline: string;
    street: string;
    foreground: string;
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const BASE = '/assets/backgrounds/skins';

function skin(
  id: MapSkinId,
  name: string,
  act: number,
  timeOfDay: MapSkin['timeOfDay'],
  season: MapSeason = 'default',
): MapSkin {
  return {
    id,
    name,
    act,
    timeOfDay,
    season,
    layers: {
      sky: `${BASE}/${id}/sky.svg`,
      skyline: `${BASE}/${id}/skyline.svg`,
      street: `${BASE}/${id}/street.svg`,
      foreground: `${BASE}/${id}/foreground.svg`,
    },
  };
}

// ---------------------------------------------------------------------------
// Skin Registry
// ---------------------------------------------------------------------------

export const MAP_SKINS: MapSkin[] = [
  // Act 1 — Barangay (night)
  skin('brgy-eskenita', 'Narrow Alley (Eskenita)',    1, 'night'),
  skin('brgy-court',    'Basketball Court',            1, 'night'),
  skin('brgy-plaza',    'Barangay Plaza',              1, 'night'),

  // Act 2 — Bayan / LGU (pre-dawn)
  skin('bayan-palengke',  'Public Market (Palengke)',  2, 'pre-dawn'),
  skin('bayan-terminal',  'Jeepney Terminal',          2, 'pre-dawn'),
  skin('bayan-cityhall',  'City Hall Road',            2, 'pre-dawn'),

  // Act 3 — Province (golden hour / dusk)
  skin('prov-highway', 'Provincial Highway',           3, 'golden-hour'),
  skin('prov-port',    'Coastal Port',                 3, 'golden-hour'),
  skin('prov-capitol', 'Capitol Grounds',              3, 'golden-hour'),

  // Act 4 — National (midnight city lights)
  skin('natl-avenue', 'National Avenue',               4, 'midnight-city'),
  skin('natl-govt',   'Government District',           4, 'midnight-city'),
  skin('natl-palace', 'Palace Gates',                  4, 'midnight-city'),
];

/** All skins for a given act. */
export function skinsForAct(act: number): MapSkin[] {
  return MAP_SKINS.filter((s) => s.act === act && s.season === 'default');
}

/**
 * Resolve which map skin a stage should use. Stages within an act cycle
 * through that act's skins: stageIndex 0 → skin 0, 1 → skin 1, 2 → skin 2,
 * 3 → skin 0, etc.
 *
 * @param act     The act number (1-based).
 * @param stageIdx  Zero-based index of the stage within its act.
 */
export function getMapSkinForStage(act: number, stageIdx: number): MapSkin {
  const actSkins = skinsForAct(act);
  if (actSkins.length === 0) {
    // Fallback: return the first skin if act has no skins (e.g. Finale)
    return MAP_SKINS[0];
  }
  return actSkins[stageIdx % actSkins.length];
}

/** Resolve a skin by its id. */
export function mapSkinById(id: MapSkinId): MapSkin | undefined {
  return MAP_SKINS.find((s) => s.id === id);
}

/**
 * The first skin for each act, suitable as the act's thumbnail in the
 * campaign map UI.
 */
export function actThumbnailSkin(act: number): MapSkin | undefined {
  return skinsForAct(act)[0];
}
