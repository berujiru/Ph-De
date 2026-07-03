# Architecture & Tech Stack Decision

## Decision

**React + Capacitor + Phaser**, deployed as a web app first, wrapped natively
for iOS and Android via Capacitor.

- **React** — menus, HUD, settings, meta-game screens (anything that's DOM-shaped UI).
- **Phaser** (v4) — the actual game: canvas rendering, game loop, sprites,
  physics-lite movement, input.
- **Capacitor** — wraps the built web app in a thin native shell so it can ship
  to the App Store / Play Store, and gives access to native APIs (haptics,
  push notifications, IAP, storage) when we need them.

This was chosen over **React Native (+ Skia)**. This document exists so that
decision isn't silently re-litigated later without someone reading the
reasoning first — flip it if the reasoning stops holding, but flip it on
purpose.

## Why not React Native

Tower defense is a 2D, sprite-heavy, canvas-native genre: dozens of enemies
on screen, particle effects, tilemaps, range indicators, projectile pooling,
path-following. The web has two mature, battle-tested engines purpose-built
for exactly this (Phaser, PixiJS) with 10+ years of examples, plugins, and
Stack Overflow answers for tower-defense-shaped problems specifically.

React Native has no equivalent. The realistic RN path is `react-native-skia`
(a raw 2D drawing API) plus hand-rolling everything an engine normally gives
you for free: sprite batching, animation state machines, tilemap rendering,
object pooling, a scene graph. That's not a foundation, that's a second
project. `react-native-game-engine` exists but is thin and far less mature
than Phaser/Pixi.

The native-performance argument doesn't apply strongly here — a 2D tower
defense game with a few hundred active game objects is not pushing hardware
limits. A WebView running Phaser will hold 60fps without difficulty. Where RN
does win (native feel, gesture handling, deep OS integration) doesn't move
the needle much for a game that lives almost entirely inside one canvas.

## Why Capacitor over a bare web app

- Ships to the App Store / Play Store as a real installable app (icon, splash
  screen, offline-capable).
- Native plugin access when needed: haptics on tower placement/hits, push
  notifications for "your base is under attack," IAP for cosmetics, local
  storage for save data.
- The web build stays fully playable as a website with zero extra work —
  useful for quick playtesting links, itch.io, or a marketing landing page.
  This also means anyone testing changes can just open a URL instead of
  building a native binary.

## Why Phaser over PixiJS

PixiJS is a renderer; Phaser is a full game framework (scenes, physics,
input, tweens, audio, tilemaps) built on top of a Pixi-like renderer. For
tower defense specifically — waves, timers, path-following, arcade-style
overlap checks — Phaser's built-ins save real time over assembling the same
things from Pixi + a physics library + a state machine library. If a future
need outgrows Phaser's opinions (e.g. a fully custom rendering pipeline),
PixiJS is the documented fallback — not a rewrite, since Phaser is Pixi-shaped
underneath.

## Consequences / what this locks in

- Game logic lives in plain TypeScript modules decoupled from Phaser where
  possible (see `src/game/core/`), specifically so it's unit-testable without
  spinning up a canvas — see `docs/BEST_PRACTICES.md`.
- The React tree and the Phaser `Game` instance are two separate render
  worlds that talk over a small typed event bus
  (`src/game/core/GameEvents.ts`), not shared React state. Don't reach into
  Phaser internals from React components or vice versa — go through events.
- `ios/` and `android/` native projects are **not** generated yet (`npx cap
  add ios` / `npx cap add android`) — this environment has no Xcode/Android
  SDK to build them, and committing empty native scaffolding before there's
  a reason to touch it just adds noise. Run those commands locally when
  native builds are actually needed; `capacitor.config.ts` is already in
  place.
- If a future feature needs true native performance (e.g. thousands of
  on-screen entities, complex physics), that's a signal to revisit this doc,
  not a signal to quietly bypass it.

## Alternatives considered and rejected

| Option | Rejected because |
|---|---|
| React Native + Skia | No mature TD-oriented engine; hand-rolling sprite/tilemap/particle systems is a project in itself |
| Flutter + Flame | Different language ecosystem (Dart) from the rest of the stack; team context is React |
| Unity exported to mobile | Massive overkill for 2D tower defense; heavy binary size, non-web-native, breaks the "playable in a browser" workflow |
| Pure PixiJS (no Phaser) | Would rebuild scene/timer/physics/tilemap conveniences Phaser already provides |
