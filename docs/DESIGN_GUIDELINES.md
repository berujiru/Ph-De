# Design Guidelines

Covers visual design (color, layout, UI patterns) and game design patterns
(the mechanics conventions this project follows). Source of truth for color
is `src/ui/theme.ts` — this doc explains the *why*; the code is the *what*.
Keep them in sync when either changes.

**Note**: For specific asset production requirements (animations, voice lines, cut-ins), see `docs/ART_AND_AUDIO_GUIDELINES.md`.

## Color palette

Dark, high-contrast, slate-based — reads well outdoors on a phone screen and
keeps enemies/projectiles/UI legible against the game canvas.

| Token | Hex | Use |
|---|---|---|
| `background` | `#0f172a` | App/canvas background (Night sky / deep slate) |
| `surface` | `#1e293b` | Solid panel fills where blur is unavailable/undesired |
| `surfaceGlass` | `rgba(30, 41, 59, 0.7)` | HUD panels, glassmorphism backdrops (`backdrop-filter: blur(12px)`) |
| `border` | `#475569` | Solid panel borders |
| `borderGlass` | `rgba(255, 255, 255, 0.1)` | Glass edges, subtle dividers |
| `textPrimary` | `#f8fafc` | Primary text |
| `textMuted` | `#94a3b8` | Secondary/disabled text |
| `gold` | `#facc15` | Currency only — never used for anything else. |
| `danger` | `#ef4444` | Lives/HP loss, defeat state, low-health warnings |
| `success` | `#22c55e` | HP bars (full), victory state, affordable/valid actions |
| `accent` | `#38bdf8` | Primary interactive actions, glowing elements, selected state |

The rally set dressing (wooden storefronts, corkboard, cardboard tags,
caution tape) draws from `theme.materials` in `src/ui/theme.ts` — scenery
paint only, never interactive state. Note `materials.cautionYellow`
(`#eab308`) exists so hazard stripes and star ratings don't borrow the
currency-only `gold` hex.

Rules:
- **Glassmorphism**: UI panels should utilize semi-transparent surfaces with background blurs (`backdrop-filter: blur(12px)`). Add a subtle, 1px white border with 10% opacity to emulate frosted glass edges.
- **Glowing Elements**: Use `box-shadow` to create soft, colored glows around primary interactive elements (like the 'Start Wave' button or ready skills).
- Don't introduce new colors ad hoc. If a new UI element needs a color, map
  it to an existing token's *meaning* rather than picking a new hex value.
- Maintain WCAG AA contrast for text on backgrounds.

## Visual Aesthetics & Art Direction

- **Sprites**: Use flat, modern, minimalist vector-style graphics. Avoid heavy outlines or excessive gradients. Characters should be easily identifiable by their silhouette.
- **Animations**:
  - **Skills**: Skill activations should feature fast, punchy CSS transitions. Use micro-animations (e.g., slight scaling `scale: 1.05`, quick rotations, flashes) to make the UI feel responsive.
  - **Projectiles**: Projectiles should leave brief, fading particle trails (if implemented) or use simple scaling effects on impact.
  - **Enemies**: Enemy movement should be smooth. Ailments (Burn, Slow, Stun) should apply vibrant tints or small status icons above the enemy HP bar.
- **Icons**: Use modern, clean, line-art or flat-filled icons (e.g., Material Symbols or Lucide style). Avoid complex multi-colored icons in the UI chrome.

## UI Thematic Design: The Rally / Protest Motif

The primary aesthetic of the game's UI and menus must visually communicate a grassroots rally or street protest. UI components should feel like objects you'd find in the streets during a mobilization.

- **Main Menu / Screens**: The background or framing of full-screen UI should incorporate visuals of protests, crowds, city streets, and makeshift stages. The **Main Menu** specifically represents the active street rally.
- **Sari-Sari Store**: The meta-store takes the form of an authentic neighborhood store (Sari-Sari store) featuring a wooden storefront, metal security grilles, hanging goods on wires, and handwritten cardboard price tags.
- **Inventory (Roster & Codex)**: Represented as a **Meeting Board / Archive**, taking the visual form of a corkboard with heroes pinned as Polaroid photos and ID lanyards.
- **Preparation Screen**: Represented as a **Briefing / Meeting Room** before deployment, featuring a dimly lit command table with blueprints and silhouettes of movement leaders.
- **Barricades & Fences**: Use visual motifs of metal barricades, corrugated iron, or chain-link fences as dividers, panel borders, or headers.
- **Tarps & Placards**: Modals, dialogue boxes, and information cards should mimic the look of painted tarpaulins (tarps), cardboard placards, or hastily printed manifestos. 
- **Cable Wires & Street Elements**: Use hanging electrical wires, caution tape, and street poles to visually separate UI elements or direct the user's eye between sections.
- **Megaphones & Audio**: Use megaphone icons for announcements, notifications, and primary calls to action (like "Start Wave" or "Summon"). 
- **Reusable Components**: Buttons and panels should consistently reuse these thematic elements rather than generic UI shapes (e.g. a button styled as a protest sign or a slider styled like a megaphone volume knob).

## Layout patterns: The Immersive Full-Screen Canvas

- **Zero-Footprint HUD**: The Phaser game canvas must own 100% of the screen area (16:9 ratio, scaling with `FIT`). The React UI acts strictly as a transparent, floating overlay. Do not use opaque backgrounds, gradients, or heavy container panels that block the bottom or top of the screen.
- **Floating Action Buttons (FABs)**: UI elements (hero skills, waves, Voices) should float near the edges of the screen as minimal circular or pill-shaped buttons, allowing the game environment to be fully visible beneath them.
- **Phaser-First Visuals**: Animations, combat text, hero avatars, and status effects belong in the game engine (Phaser) as animated entities. HTML is reserved *only* for menus, floating HUD buttons, and state logic.
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

## Game design patterns (Rally Auto-Battler conventions this project follows)

- **Landscape Rally March Layout**: The game uses a horizontal landscape layout (e.g., 16:9). You do not place static towers. Instead, you "summon" heroes who spawn at the left side of the screen and automatically march rightwards to form the rally frontline against the barricade. Enemies (Anomalies) spawn at the right and move leftwards to stop the rally. The environment may eventually feature a parallax background scrolling from right to left to emphasize forward momentum.
- **"Frontline" targeting by default**: Heroes target the enemy closest to them in the X-axis (closest to the barricade) as they march. If a hero is a melee unit, they stop moving when they meet an enemy to attack. Ranged heroes stop at their maximum attack range behind the barricade.
- **Data-driven balance**: all hero/enemy/wave numbers live in
  `src/game/data/balance.ts`, not scattered magic numbers. This is a design
  guideline as much as a code guideline — balancing the game should mean
  editing numbers in one file, not hunting through scene code.
- **Wave-based, player-triggered start**: waves don't auto-start on a timer
  in the base prototype — the player presses "Start Wave." Auto-start-after-
  countdown is a common QoL addition (tracked in FEATURES.md) but manual
  start keeps the prototype's core loop simple to reason about and test.
- **Economy loop**: gold in (kill rewards) must stay roughly proportional to
  gold out (hero summon costs) per wave, tuned so the player is never fully unable
  to afford at least one relevant hero summon by the wave where a given enemy type
  first appears. When adding enemies/heroes to `balance.ts`, sanity-check
  this ratio rather than picking numbers that feel right in isolation.
