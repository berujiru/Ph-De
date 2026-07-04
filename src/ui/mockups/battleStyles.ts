/**
 * Shared battle-overlay style helpers (BattleHUD / SandboxHUD / EnemyInfoCard).
 *
 * `glass.surface` / `glass.border` are the semi-transparent glassmorphism
 * forms of the `surface` / `border` tokens exactly as documented in
 * docs/DESIGN_GUIDELINES.md (the doc table is the source of truth for these
 * rgba values; `theme.ts` keeps the opaque bases). No new colors here —
 * everything derives from documented tokens.
 */
import type { CSSProperties } from 'react';
import { theme } from '../theme';

export const glass = {
  /** docs/DESIGN_GUIDELINES.md `surface` token — HUD panels, glass backdrops. */
  surface: 'rgba(30, 41, 59, 0.7)',
  /** docs/DESIGN_GUIDELINES.md `border` token — 1px 10% white frosted edge. */
  border: 'rgba(255, 255, 255, 0.1)',
} as const;

/** rgba() form of a `#rrggbb` theme token — for glows/tints of existing tokens. */
export function withAlpha(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/** Frosted-glass panel base (docs/DESIGN_GUIDELINES.md "Glassmorphism"). */
export const glassPanel: CSSProperties = {
  backgroundColor: glass.surface,
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  border: `1px solid ${glass.border}`,
  borderRadius: 12,
};

/** 44px circular floating action button base (zero-footprint HUD). */
export const fab: CSSProperties = {
  ...glassPanel,
  borderRadius: '50%',
  width: 44,
  height: 44,
  minWidth: 44,
  minHeight: 44,
  padding: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: theme.colors.textPrimary,
  cursor: 'pointer',
};

/** Glassy <select> base — 44px touch target. */
export const glassSelect: CSSProperties = {
  backgroundColor: glass.surface,
  border: `1px solid ${glass.border}`,
  borderRadius: 10,
  color: theme.colors.textPrimary,
  minHeight: 44,
  padding: '0 10px',
  fontSize: 12,
  cursor: 'pointer',
};

/**
 * Caution-tape stripe background (rally motif — dividers and risk framing).
 * `color` should be a theme token mapped by meaning (danger = risk, etc.).
 */
export function cautionTape(color: string): string {
  return `repeating-linear-gradient(45deg, ${color} 0px, ${color} 10px, ${theme.colors.background} 10px, ${theme.colors.background} 20px)`;
}

/**
 * Shared micro-animation / state CSS for the battle overlays.
 * `.hud-btn` gives every interactive control a punchy press feel and a real
 * dimmed disabled state (never color-only — controls are also `disabled`).
 */
export const battleCss = `
.hud-btn { transition: transform 0.1s ease, opacity 0.15s ease, box-shadow 0.15s ease; }
.hud-btn:not(:disabled):hover { transform: scale(1.05); }
.hud-btn:not(:disabled):active { transform: scale(0.92); }
.hud-btn:disabled { opacity: 0.4; cursor: not-allowed; }
@keyframes overlay-fade { from { opacity: 0; } to { opacity: 1; } }
@keyframes placard-drop {
  from { opacity: 0; transform: translateY(-24px) rotate(-3deg); }
  to { opacity: 1; transform: translateY(0) rotate(-1deg); }
}
@keyframes card-rise {
  from { opacity: 0; transform: translateY(18px) scale(0.96); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}
@keyframes star-pop {
  0% { transform: scale(0); }
  70% { transform: scale(1.3); }
  100% { transform: scale(1); }
}
@keyframes voices-pulse {
  0%, 100% { box-shadow: 0 0 8px ${withAlpha(theme.colors.accent, 0.35)}; }
  50% { box-shadow: 0 0 22px ${withAlpha(theme.colors.accent, 0.75)}; }
}
.drop-card { transition: transform 0.12s ease, box-shadow 0.12s ease; animation: card-rise 0.25s ease both; }
.drop-card:not(:disabled):hover, .drop-card:focus-visible { transform: scale(1.05); }
.drop-card:not(:disabled):active { transform: scale(0.97); }
`;
