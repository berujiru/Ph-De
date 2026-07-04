/** Design tokens — keep in sync with docs/DESIGN_GUIDELINES.md. */
export const theme = {
  colors: {
    background: '#0f172a',
    surface: '#1e293b',
    /** Glassmorphism panel backdrop — pair with `backdrop-filter: blur(12px)`. */
    surfaceGlass: 'rgba(30, 41, 59, 0.7)',
    border: '#475569',
    /** Frosted-glass edge for glass panels. */
    borderGlass: 'rgba(255, 255, 255, 0.1)',
    textPrimary: '#f8fafc',
    textSecondary: '#94a3b8',
    textMuted: '#94a3b8',
    primary: '#38bdf8',
    gold: '#facc15',
    danger: '#ef4444',
    success: '#22c55e',
    accent: '#38bdf8',
  },
  /**
   * Rally / protest scenery materials (docs/DESIGN_GUIDELINES.md, "UI
   * Thematic Design"). These paint the meta-screen set dressing — wooden
   * storefronts, corkboards, cardboard placards, caution tape — and are
   * never used to communicate interactive state (that stays on `colors`).
   * `cautionYellow` is deliberately NOT `gold`: #facc15 is currency-only.
   */
  materials: {
    wood: '#3f2a1d',
    woodDark: '#291b12',
    woodLight: '#8a5a36',
    cork: '#785b46',
    corkDark: '#5a4231',
    cardboard: '#d97706',
    cardboardEdge: '#78350f',
    paper: '#f8fafc',
    paperAged: '#e5d5b5',
    ink: '#1c1917',
    tape: 'rgba(255, 255, 255, 0.65)',
    metal: '#94a3b8',
    metalDark: '#475569',
    cautionYellow: '#eab308',
    tarpRed: '#b91c1c',
  },
} as const;
