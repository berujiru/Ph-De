# AGENTS.md

Guidance for any AI coding agent (Claude Code, Gemini CLI, Codex, or others)
working in this repository. This is the canonical, tool-agnostic version —
tool-specific files (`CLAUDE.md`, `GEMINI.md`) point back here rather than
duplicating it, per the DRY guidance in `docs/BEST_PRACTICES.md`.

## What this is

**First Ripple** is a mobile tower defense game. Stack: React + Phaser (game
engine) + Capacitor (native iOS/Android wrapper). See
`docs/ARCHITECTURE.md` for the full reasoning, including why this was chosen
over React Native.

## Read these before making non-trivial changes

- `docs/ARCHITECTURE.md` — tech stack decision and the React/Phaser boundary
- `docs/BEST_PRACTICES.md` — DRY/KISS/YAGNI, data-driven design, TS/React
  conventions
- `docs/DESIGN_GUIDELINES.md` — color tokens, layout/UI patterns, game design
  conventions (targeting, wave structure, economy tuning)
- `docs/ART_AND_AUDIO_GUIDELINES.md` — visual style, anime-style skill cut-ins,
  animations, and comedic Tagalog sound/foley mappings for heroes and enemies.
- `docs/FEATURES.md` — what's built, what's next, what's explicitly out of
  scope. Check before proposing something that might already be
  planned/rejected.
- `docs/TESTING.md` — what belongs in unit vs. component vs. e2e tests
- `docs/ADDING_ENEMIES.md` — worked, step-by-step guide for adding a new
  enemy type: which stats are common vs. per-enemy, which files to touch,
  when a stats-only data edit is enough vs. when it needs real code
- `docs/DAMAGE_AND_AILMENTS.md` — design spec for damage types and ailments
  (jobs, per-ailment proc rules, enemy info card, data model, rollout
  phases). Read before implementing or extending anything combat-related
- `docs/WORLD_AND_HEROES.md` — setting (defend the Philippines), story
  (Eden's alliance), two-tier roster (dignified citizens + comedic memes),
  hero/squad/drop systems, enemy factions and minion chassis, hero bosses,
  and the **binding character-design rules** (communal archetypes only —
  never real persons, officials, or parties). Read before creating or
  touching any character, story, or enemy content
- `docs/PROGRESSION.md` — campaign ladder (barangay → LGU → national
  agencies), reusable stage/wave/chassis content engine, per-run Hope
  currency and the Sari-Sari Store, squad-building rules (every hero
  attacks). Read before touching campaign, economy, or meta-game systems
- `docs/DESIGN_CHECKLIST.md` — audit of what's mapped vs. missing across
  all specs, including open owner decisions. Check it before starting
  design or implementation work; update it when items move columns

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

## Tool-specific notes

Claude Code additionally has specialized subagents defined in
`.claude/agents/` (game-designer, gameplay-engineer, ui-engineer,
qa-engineer) — see `CLAUDE.md` for how those are used. Other tools without an
equivalent subagent mechanism should still follow the role boundaries those
files describe (e.g. balance/content changes vs. engine code vs. UI vs.
tests) even without dedicated agent routing.
