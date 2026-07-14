/**
 * Design tokens — keep in sync with docs/DESIGN_GUIDELINES.md.
 *
 * THEME: Souls-inspired post-apocalyptic.  The anomalies of corruption
 * have scorched the land; the UI reflects charred wood, rusted metal,
 * drifting embers, and the faint warmth of hope-fire pushing back the
 * miasma.  Accent shifts from sky-blue to ember-orange; backgrounds
 * deepen to near-black ash.
 */
export const theme = {
  colors: {
    background: '#09090b',
    surface: '#18181b',
    /** Glassmorphism panel backdrop — pair with `backdrop-filter: blur(12px)`. */
    surfaceGlass: 'rgba(24, 24, 27, 0.75)',
    border: '#3f3f46',
    /** Frosted-glass edge for glass panels. */
    borderGlass: 'rgba(255, 255, 255, 0.07)',
    textPrimary: '#fafaf9',
    textSecondary: '#a8a29e',
    textMuted: '#78716c',
    primary: '#ea580c',
    gold: '#facc15',
    danger: '#dc2626',
    success: '#16a34a',
    accent: '#ea580c',
  },
  /**
   * Rally / protest scenery materials, re-dressed for the post-apocalypse.
   * Wooden storefronts are now charred husks; corkboards are
   * ash-stained; the caution tape is burnt.  New `corruption*` tokens
   * paint the anomaly miasma creeping across the UI.
   * `cautionYellow` is deliberately NOT `gold`: #facc15 is currency-only.
   */
  materials: {
    wood: '#292018',
    woodDark: '#1a1410',
    woodLight: '#6b4423',
    cork: '#4a3728',
    corkDark: '#362518',
    cardboard: '#92400e',
    cardboardEdge: '#5c2d0e',
    paper: '#e7e5e4',
    paperAged: '#c2b5a0',
    ink: '#0c0a09',
    tape: 'rgba(200, 180, 150, 0.45)',
    metal: '#71717a',
    metalDark: '#3f3f46',
    cautionYellow: '#ca8a04',
    tarpRed: '#7f1d1d',
    /** Anomaly miasma — dark fog creeping from the corruption. */
    corruptionFog: 'rgba(55, 20, 60, 0.35)',
    /** Anomaly ember glow — faint warm light pushing back the dark. */
    corruptionEmber: 'rgba(234, 88, 12, 0.18)',
  },
} as const;
