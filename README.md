# Ph-De

A mobile tower defense game. React (UI) + Phaser (game engine) + Capacitor
(iOS/Android wrapper). See `docs/ARCHITECTURE.md` for why.

## Quick start

```bash
npm install
npm run dev
```

Open the printed localhost URL — the game runs in any modern browser during
development. No native tooling required until you're ready to build a mobile
binary (see below).

## Scripts

```bash
npm run dev             # dev server with HMR
npm run build            # typecheck + production build
npm run typecheck        # tsc only
npm run test              # unit + component tests (vitest)
npm run test:watch        # vitest, watch mode
npm run test:e2e          # playwright e2e smoke tests
npm run lint               # oxlint
npm run cap:sync           # sync web build into native projects
npm run cap:add:ios        # generate ios/ (needs Xcode)
npm run cap:add:android    # generate android/ (needs Android Studio/SDK)
```

## Docs

- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — tech stack decision (React
  + Capacitor + Phaser vs. React Native) and system boundaries
- [`docs/BEST_PRACTICES.md`](docs/BEST_PRACTICES.md) — code conventions
- [`docs/DESIGN_GUIDELINES.md`](docs/DESIGN_GUIDELINES.md) — color, layout,
  game design patterns
- [`docs/FEATURES.md`](docs/FEATURES.md) — roadmap / what's built vs. planned
- [`docs/TESTING.md`](docs/TESTING.md) — testing strategy

Guidance for AI coding agents lives in [`AGENTS.md`](AGENTS.md) (canonical,
tool-agnostic); [`CLAUDE.md`](CLAUDE.md) and [`GEMINI.md`](GEMINI.md) are
thin pointers to it plus any tool-specific notes (e.g. Claude Code's
subagents in `.claude/agents/`).

## Building for mobile

This repo ships the web app + `capacitor.config.ts`, but does not commit
generated `ios/`/`android/` native projects (they're large, platform-specific,
and regenerable). To build a native app:

```bash
npm run build
npm run cap:add:ios       # or cap:add:android
npm run cap:sync
npx cap open ios          # or: npx cap open android
```

Then build/run from Xcode or Android Studio as usual.
