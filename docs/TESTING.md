# Testing Strategy

## Layers

1. **Unit tests (Vitest)** — `tests/unit/`. Cover everything in
   `src/game/core/` (`Economy`, `Targeting`, `WaveManager`, future systems).
   These are pure functions/classes with no Phaser or DOM dependency, so
   tests run in milliseconds with no browser. This is the layer to invest in
   most — it's where game *rules* live, and rules are exactly what regress
   silently when someone tweaks balance or refactors.
2. **Component tests (Vitest + Testing Library)** — for React components in
   `src/ui/` that have real logic (conditional rendering, disabled states).
   Not every component needs one; add them where a bug would be easy to
   introduce silently (e.g. HUD disabled-button logic).
3. **E2E smoke tests (Playwright)** — `tests/e2e/`. A small number of tests
   that click through the actual built app in a real browser: game loads,
   HUD renders, a tower can be selected, a wave can be started. This is a
   smoke net, not exhaustive coverage — it exists to catch "the app doesn't
   boot" or "the HUD and Phaser scene stopped talking to each other," which
   unit tests can't see since they don't wire the two together.

## What NOT to test

- Don't unit test Phaser itself (rendering, canvas output, physics internals)
  — that's the engine's job, not ours. If you're asserting on pixel output or
  Phaser internals, that test belongs in E2E (does the canvas element exist
  and respond to interaction?) or shouldn't exist.
- Don't write tests that assert on exact balance numbers being "fun" — that's
  playtesting, not testing. Do test that balance *invariants* hold (e.g. gold
  reward is never negative, wave definitions reference enemy IDs that exist
  in `ENEMY_DEFINITIONS`).

## Running tests

```bash
npm run test        # unit + component tests, single run
npm run test:watch  # unit + component tests, watch mode
npm run test:e2e    # Playwright, builds/serves the app first
npm run typecheck   # tsc, no emit
npm run lint         # oxlint
```

Run `typecheck`, `test`, and `lint` before every commit — see
`docs/BEST_PRACTICES.md`.

## Adding tests for new features

- New entry in `src/game/data/balance.ts` (tower/enemy/wave) → check
  existing invariant tests still pass; add a new one if the feature
  introduces a new invariant (e.g. a slow effect needs "speed never goes
  negative or to zero permanently").
- New pure logic in `src/game/core/` → unit tests are required, not
  optional. This layer exists specifically because it's cheap to test —
  skipping tests here defeats the point of the architecture split described
  in `ARCHITECTURE.md`.
- New Phaser entity/scene behavior → prefer extracting the decision-making
  part into `core/` (testable) and keeping the entity/scene as thin
  rendering glue (covered indirectly by E2E smoke tests).

## Running e2e in a sandbox with a pre-installed browser

If `npx playwright install` isn't available (e.g. a sandboxed CI/dev
container that ships its own Chromium instead), point Playwright at it
without editing the config:

```bash
PLAYWRIGHT_CHROMIUM_PATH=/path/to/chromium npm run test:e2e
```

`playwright.config.ts` only sets a custom `executablePath` when that env var
is present, so normal local/CI runs still use Playwright's own managed
browser via `npx playwright install`.

## CI

Not yet wired up (no CI config exists in this repo yet). When added, it
should run `typecheck`, `test`, and `lint` on every PR at minimum;
`test:e2e` is heavier (needs a browser + build) and can run less frequently
or only on `main`.
