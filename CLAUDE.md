# CLAUDE.md

See [`AGENTS.md`](AGENTS.md) for full project guidance (stack, docs to read,
commands, architecture) — that file is the canonical source, shared across
AI coding tools. Read it before making non-trivial changes.

This file only covers what's specific to Claude Code.

## Subagents

Specialized agents live in `.claude/agents/`:

- **game-designer** — balance, mechanics, level/wave content
  (`src/game/data/`)
- **gameplay-engineer** — game logic (`src/game/core/`, `entities/`,
  `scenes/`)
- **ui-engineer** — React UI (`src/ui/`, `App.tsx`, styling)
- **character-art** — sprite pipeline: prompt packs, atlas wiring,
  placeholders, sprite-sheet QA (`docs/references/`, `public/assets/`,
  the thin preload/atlas glue). Cannot generate raster art itself.
- **qa-engineer** — tests and verification

Use them proactively for work matching their description rather than doing
cross-cutting work as the default agent.
