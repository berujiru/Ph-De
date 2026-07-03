# CLAUDE.md

Guidance for Claude Code (and any subagent) working in this repository.

## What this is

**Ph-De** is a mobile tower defense game. Stack: React + Phaser (game
engine) + Capacitor (native iOS/Android wrapper). See
`docs/ARCHITECTURE.md` for the full reasoning, including why this was chosen
over React Native.

## Read these before making non-trivial changes

- `docs/ARCHITECTURE.md` — tech stack decision and the React/Phaser boundary
- `docs/BEST_PRACTICES.md` — DRY/KISS/YAGNI, data-driven design, TS/React
  conventions
- `docs/DESIGN_GUIDELINES.md` — color tokens, layout/UI patterns, game design
  conventions (targeting, wave structure, economy tuning)
- `docs/FEATURES.md` — what's built, what's next, what's explicitly out of
  scope. Check before proposing something that might already be
  planned/rejected.
- `docs/TESTING.md` — what belongs in unit vs. component vs. e2e tests

## Subagents

Specialized agents live in `.claude/agents/`:

- **game-designer** — balance, mechanics, level/wave content
  (`src/game/data/`)
- **gameplay-engineer** — game logic (`src/game/core/`, `entities/`,
  `scenes/`)
- **ui-engineer** — React UI (`src/ui/`, `App.tsx`, styling)
- **qa-engineer** — tests and verification

Use them proactively for work matching their description rather than doing
cross-cutting work as the default agent.

## Commands

```bash
npm run dev          # start dev server
npm run build         # typecheck + production build
npm run typecheck     # tsc only
npm run test           # unit + component tests (vitest)
npm run test:watch     # vitest, watch mode
npm run test:e2e       # playwright, builds/serves the app
npm run lint            # oxlint
npm run cap:sync        # sync web build into native projects (after cap:add)
npm run cap:add:ios     # generate ios/ (requires Xcode locally)
npm run cap:add:android # generate android/ (requires Android SDK locally)
```

Run `typecheck`, `test`, and `lint` before considering any change done.

## Architecture at a glance

```
src/
  game/
    core/       pure TS, no Phaser/DOM imports — game rules (unit tested)
    data/       balance.ts (towers/enemies/waves), level.ts (path/slots)
    entities/   Phaser GameObjects — Enemy, Tower, Projectile
    scenes/     GameScene — orchestration, wires core/ + entities together
    PhaserGame.ts  Phaser.Game factory
  ui/           React components (HUD, GameCanvas)
tests/
  unit/         vitest, targets src/game/core/
  e2e/          playwright smoke tests
docs/           the guideline docs listed above
```

The React tree and the Phaser `Game` instance are separate render worlds.
They communicate only through the typed event bus in
`src/game/core/GameEvents.ts` (`gameToUiEvents` game→UI, `uiToGameEvents`
UI→game) — never reach into Phaser internals from React or vice versa.

## Native projects

`ios/` and `android/` are intentionally not generated yet — this repo has no
Xcode/Android SDK to build them against. `capacitor.config.ts` is in place;
run `npm run cap:add:ios` / `npm run cap:add:android` locally when a native
build is actually needed.
