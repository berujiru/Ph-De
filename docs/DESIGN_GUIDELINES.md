# Design Guidelines

Covers visual design (color, layout, UI patterns) and game design patterns
(the mechanics conventions this project follows). Source of truth for color
is `src/ui/theme.ts` — this doc explains the *why*; the code is the *what*.
Keep them in sync when either changes.

## Color palette

Dark, high-contrast, slate-based — reads well outdoors on a phone screen and
keeps enemies/projectiles/UI legible against the game canvas.

| Token | Hex | Use |
|---|---|---|
| `background` | `#0f172a` | App/canvas background |
| `surface` | `#1e293b` | HUD panels, cards, tower buttons |
| `border` | `#475569` | Panel borders, build-slot outlines |
| `textPrimary` | `#f8fafc` | Primary text |
| `textMuted` | `#94a3b8` | Secondary/disabled text |
| `gold` | `#facc15` | Currency only — never used for anything else, so a gold-colored number always means "money" at a glance |
| `danger` | `#ef4444` | Lives/HP loss, defeat state, low-health warnings |
| `success` | `#22c55e` | HP bars (full), victory state, affordable/valid actions |
| `accent` | `#38bdf8` | Primary interactive actions (Start Wave), selected state |

Rules:
- Don't introduce new colors ad hoc. If a new UI element needs a color, map
  it to an existing token's *meaning* (gold = currency, danger = loss/threat,
  success = positive/valid, accent = primary action) rather than picking a
  new hex value.
- Enemy/tower colors (defined per-entity in `src/game/data/balance.ts`) are a
  separate palette from UI chrome — gameplay colors can be saturated and
  varied (need to be tell-apart-able at a glance mid-combat); UI chrome stays
  restrained so it doesn't compete with the game canvas for attention.
- Maintain WCAG AA contrast for text on `background`/`surface` (both already
  verified: `#f8fafc` on `#0f172a` and `#1e293b` comfortably exceed 4.5:1).

## Layout patterns

- **Canvas + HUD stack**, not overlay-on-top-of-canvas, except for modal
  states (game over). The HUD lives below the canvas so it never obscures
  gameplay and so touch targets aren't fighting with tower placement taps.
- Game canvas is a fixed 960×540 (16:9) internal resolution, scaled with
  Phaser's `FIT` mode — this keeps gameplay math (ranges, speeds, positions)
  independent of the player's actual screen size. Never hardcode pixel
  positions against `window.innerWidth`; use the internal game coordinate
  space.
- Touch targets are minimum 44×44px (Apple HIG / Material baseline) — see
  `.tower-btn`, `.start-wave-btn` in `App.css`. This is non-negotiable for
  mobile since the whole point of the Capacitor wrapper is a real mobile app.

## UI/UX patterns

- **Selection-then-placement**, not drag-and-drop, for tower placement: tap a
  tower type, then tap a build slot. Simpler to implement correctly, and
  more reliable on touch than drag gestures, especially on small screens.
- Disabled state (insufficient gold, wave in progress, game over) is always
  communicated by both **disabling the control** and **dimming it** — never
  rely on color alone (accessibility, and color can be hard to read in
  bright sunlight on a phone).
- Range indicators show on hover/focus for placed towers (desktop) and are a
  planned tap-and-hold interaction for touch (see `docs/FEATURES.md`) — never
  show all tower ranges at once by default, it clutters the board.
- Game-over/victory is a modal overlay with one clear action (Restart) — no
  secondary options competing for attention in that moment.

## Game design patterns (tower defense conventions this project follows)

- **Portrait Barrier Defense Layout**: The game uses a vertical portrait layout. Enemies spawn at the top and move downwards (swarming or along specific straight/fanning paths) toward the "People Power Shield" at the bottom. Heroes stand on fixed pedestals behind the shield and fire upwards. This replaces the old winding/snaking path layout.
- **"First" targeting by default**: towers target the enemy furthest down the screen (closest to the barrier) within range (`src/game/core/Targeting.ts`). This is the genre-standard default because it minimizes leaked damage — other strategies (closest, strongest, weakest) are future per-tower options, not a replacement for this default.
- **Data-driven balance**: all tower/enemy/wave numbers live in
  `src/game/data/balance.ts`, not scattered magic numbers. This is a design
  guideline as much as a code guideline — balancing the game should mean
  editing numbers in one file, not hunting through scene code.
- **Wave-based, player-triggered start**: waves don't auto-start on a timer
  in the base prototype — the player presses "Start Wave." Auto-start-after-
  countdown is a common QoL addition (tracked in FEATURES.md) but manual
  start keeps the prototype's core loop simple to reason about and test.
- **Economy loop**: gold in (kill rewards) must stay roughly proportional to
  gold out (tower costs) per wave, tuned so the player is never fully unable
  to afford at least one relevant tower by the wave where a given enemy type
  first appears. When adding enemies/towers to `balance.ts`, sanity-check
  this ratio rather than picking numbers that feel right in isolation.
