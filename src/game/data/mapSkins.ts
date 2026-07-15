/**
 * Campaign battle-map skins — data-driven parallax backdrops.
 *
 * Each skin is a set of 4 SVG layers (sky, skyline, street, foreground) that
 * replace the default `bg-*` textures in ParallaxBackground. The art direction
 * is a souls-like ruined battlefield seen top-down — scorched ground, cracked
 * pavement, collapsed buildings and burning wreckage flanking the marching
 * lane. Skins are grouped by act; stages within an act cycle through their
 * act's skins so every 3 stages the player sees a fresh backdrop, and the ruin
 * escalates from act to act (ashen dawn → smoldering → blood dusk → blackout).
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
  // Act 1 — Barangay (ashen dawn)
  | 'brgy-eskenita'
  | 'brgy-court'
  | 'brgy-plaza'
  // Act 2 — Bayan (smoldering)
  | 'bayan-palengke'
  | 'bayan-terminal'
  | 'bayan-cityhall'
  // Act 3 — Province (blood dusk)
  | 'prov-highway'
  | 'prov-port'
  | 'prov-capitol'
  // Act 4 — National (blackened inferno)
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
  /** Ruin mood applied via the palette; escalates across acts. */
  ruinMood: 'ashen-dawn' | 'smolder' | 'blood-dusk' | 'blackout';
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
  ruinMood: MapSkin['ruinMood'],
  season: MapSeason = 'default',
): MapSkin {
  return {
    id,
    name,
    act,
    ruinMood,
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
  // Act 1 — Barangay (ashen dawn)
  skin('brgy-eskenita', 'Narrow Alley (Eskenita)',    1, 'ashen-dawn'),
  skin('brgy-court',    'Basketball Court',            1, 'ashen-dawn'),
  skin('brgy-plaza',    'Barangay Plaza',              1, 'ashen-dawn'),

  // Act 2 — Bayan / LGU (smoldering)
  skin('bayan-palengke',  'Public Market (Palengke)',  2, 'smolder'),
  skin('bayan-terminal',  'Jeepney Terminal',          2, 'smolder'),
  skin('bayan-cityhall',  'City Hall Road',            2, 'smolder'),

  // Act 3 — Province (blood dusk)
  skin('prov-highway', 'Provincial Highway',           3, 'blood-dusk'),
  skin('prov-port',    'Coastal Port',                 3, 'blood-dusk'),
  skin('prov-capitol', 'Capitol Grounds',              3, 'blood-dusk'),

  // Act 4 — National (blackened inferno)
  skin('natl-avenue', 'National Avenue',               4, 'blackout'),
  skin('natl-govt',   'Government District',           4, 'blackout'),
  skin('natl-palace', 'Palace Gates',                  4, 'blackout'),
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
