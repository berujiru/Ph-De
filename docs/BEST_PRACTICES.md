# Implementation Best Practices

These apply to every change in this repo, human or agent-authored. They're
deliberately short — the point is to actually follow them, not to have a long
document.

## Core principles

- **KISS** — write the obvious, boring solution first. Clever code is a
  liability in a codebase multiple agents will touch.
- **DRY, but not prematurely** — three near-identical lines are fine. Extract
  a shared function/module only once a third real use case shows up, or the
  duplication is a correctness risk (e.g. the same magic number in two
  places). Don't build an abstraction for a single caller "in case we need it
  later."
- **YAGNI** — don't add config flags, generic plugin systems, or extensibility
  hooks for features that aren't in `docs/FEATURES.md` yet. Add them when the
  feature lands.
- **Single Responsibility** — a Phaser entity class handles its own rendering
  and per-frame behavior; it does not also know about economy rules or UI
  state. A pure logic module (`src/game/core/`) does not touch Phaser or the
  DOM.
- **Composition over inheritance** — prefer small entities + systems that
  operate on them over deep class hierarchies (no `BaseEnemy` → `FastEnemy` →
  `FastArmoredEnemy` chains). Data-driven variation (see below) covers most
  "new enemy/tower type" needs without new classes.

## Data-driven over hardcoded

Game balance (tower stats, enemy stats, wave composition, level layout) lives
in `src/game/data/*.ts` as plain data, not scattered through scene/entity
code. Adding a new tower or enemy type should mean adding one entry to a
`Record`, not touching `GameScene.ts`. If you find yourself writing
`if (towerId === 'cannon')` branches in scene/entity code, that's a sign the
behavior belongs in data (a field on `TowerDefinition`) instead. See
`docs/ADDING_ENEMIES.md` for the applied, step-by-step version of this rule.

## Pure logic vs. Phaser glue

Anything that's a rule of the game (targeting priority, wave pacing, economy
math, win/lose conditions) belongs in `src/game/core/` as plain TypeScript
functions/classes with **no Phaser import**. This is what makes
`tests/unit/*` possible without a canvas or DOM. `src/game/entities/` and
`src/game/scenes/` are the thin glue that calls into `core/` and renders the
result — keep them thin on purpose. When adding a feature, ask "is this a
rule, or is this rendering?" and put it in the matching layer.

## TypeScript

- `strict` mode stays on. Don't add `any` to make an error go away — fix the
  type, or if the type genuinely can't be known, use `unknown` and narrow it.
- Prefer `interface` for object shapes, `type` for unions/aliases.
- No default exports for anything except React components where the file is
  the component (`HUD.tsx`). Named exports everywhere else — makes refactors
  and greps predictable.
- Avoid `enum`; prefer string union types (`type TowerId = 'archer' | ...`) —
  simpler interop with data objects and no runtime footgun.

## React

- Function components + hooks only.
- Components that talk to the game do so through `src/game/core/GameEvents.ts`,
  never by reaching into the `Phaser.Game` instance directly.
- Keep components presentational where possible; state that's really "game
  state" (gold, lives, wave) is owned by `GameScene` and mirrored into React
  via events, not duplicated as independent React state that could drift.

## Error handling

- Validate at boundaries only: user input (tower placement, clicks), not
  internal calls between trusted modules. `Economy.spend` throwing on
  insufficient gold is fine because it's a programmer error to call it
  without checking `canAfford` first — callers are expected to check, not to
  catch.
- No silent `catch {}` blocks. If an error is truly ignorable, say why in a
  one-line comment.

## Naming

- Files: `PascalCase.ts(x)` for classes/components, `camelCase.ts` for plain
  modules/data (`balance.ts`, `level.ts`).
- No abbreviations that aren't immediately obvious (`dtMs` for delta-time in
  milliseconds is fine and used consistently; `def` for definition is not —
  spell it out).

## Comments

Default to none. Add a comment only when the code can't explain itself: a
non-obvious invariant, a workaround for a specific engine quirk, a formula
that isn't self-evident from variable names. Never comment *what* the code
does when the code already says it.

## Commit hygiene

- One logical change per commit.
- Run `npm run typecheck && npm run test && npm run lint` before committing.
  All three are cheap and catch most regressions before they reach CI.

## Before adding a dependency

Ask: does Phaser, React, or the standard library already do this? Tower
defense games historically accrete dependencies (a tweening lib, a state
machine lib, a UI kit) that duplicate what's already available. Justify new
dependencies in the PR description.
