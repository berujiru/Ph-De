/**
 * "Global" range for the portrait battlefield — covers the full 1080×1920
 * viewport, so a hero with this range can hit anything on screen. Eden's
 * anchor value; other heroes ladder below it (melee cleave radius ≈420–560,
 * short ≈900–1050, standard ≈1150–1300, sniper 1500). Mirrors GAME_HEIGHT
 * (level.ts imports balance, so the literal lives here to avoid a circular
 * import).
 */
export const GLOBAL_RANGE_PX = 1920;

/**
 * Display scale: gameplay positions, ranges (px) and speeds (px/sec) live in
 * the internal 960×540 Phaser field. Player-facing UI renders distances in
 * "meters" and speeds in "m/s" so the numbers read like a real street rally.
 * Purely presentational — all gameplay math stays in pixels.
 */
export const PIXELS_PER_METER = 20;

/** Format an internal px distance as a compact meters label (e.g. "7.5 m"). */
export function metersLabel(px: number): string {
  const m = px / PIXELS_PER_METER;
  return `${Number.isInteger(m) ? m : m.toFixed(1)} m`;
}

/** Format an internal px/sec speed as a compact m/s label (e.g. "3 m/s"). */
export function metersPerSecondLabel(pxPerSec: number): string {
  const mps = pxPerSec / PIXELS_PER_METER;
  return `${Number.isInteger(mps) ? mps : mps.toFixed(1)} m/s`;
}

export const STARTING_GOLD = 150;
export const STARTING_LIVES = 20;

export const BARRICADE_DEFAULTS = {
  // Sized for the 20-wave battle: wave-scaled minions chew through anything
  // smaller before the finale (see WAVE_SCALING in data/waves.ts).
  maxHp: 750,
  height: 80,
};
