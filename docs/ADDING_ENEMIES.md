# Adding a New Enemy

A concrete, step-by-step guide for adding a new enemy type. Read
`docs/ARCHITECTURE.md` (core/entity/scene layering) and
`docs/BEST_PRACTICES.md` (data-driven design) first if you haven't — this
doc is the applied version of both, specifically for enemies.

## The two kinds of enemy stats

Enemies have two categories of numbers, and they live in different places on
purpose:

### 1. Common stats — shared by every enemy, defined once

`ENEMY_VISUALS` in `src/game/data/enemies.ts`. These are rendering constants
that apply uniformly so every enemy reads visually consistent (per
`docs/DESIGN_GUIDELINES.md`) — you don't set these per enemy type.

| Field | Meaning |
|---|---|
| `bodyRadius` | Radius of the enemy's circle body, px |
| `hpBarWidth` / `hpBarHeight` | HP bar dimensions, px |
| `hpBarOffsetY` | HP bar vertical offset from the enemy's center, px |
| `hpBarBackgroundColor` / `hpBarBackgroundAlpha` | HP bar track color |
| `hpBarFillColor` | HP bar fill color (currently `success` green from the theme) |

Change one of these and every enemy in the game updates at once. If a
specific enemy needs to look different beyond its tint color, that's a sign
it needs its own sprite/shape in `src/game/entities/Enemy.ts`, not a new
common field — talk to `ui-engineer`/`game-designer` about whether that's
actually warranted before adding per-type rendering branches.

### 2. Per-enemy stats — one set of values per enemy type

`EnemyDefinition` in `src/game/data/enemies.ts`:

| Field | Type | Meaning |
|---|---|---|
| `id` | `EnemyId` (string union) | Unique key, also used as the dictionary key in `ENEMY_DEFINITIONS` — must match |
| `name` | `string` | Display name (not currently shown in UI, but used in debugging/future tooltips) |
| `speed` | `number` | Movement speed along the path, px/sec |
| `maxHp` | `number` | Health points |
| `reward` | `number` | Gold awarded to the player on kill |
| `livesLost` | `number` | Player lives lost if this enemy reaches the end of the path |
| `color` | `number` | Body tint, `0xRRGGBB` |

For reference, the three existing enemies:

| Enemy | speed | maxHp | reward | livesLost | Role |
|---|---|---|---|---|---|
| `grunt` | 60 | 40 | 5 | 1 | Baseline, appears from wave 1 |
| `runner` | 110 | 20 | 4 | 1 | Fast, low HP — pressure-tests range/fire-rate, not raw damage |
| `brute` | 40 | 150 | 15 | 1 | Slow, tanky — pressure-tests DPS, introduced wave 3+ |

## Files to touch

For a **stats-only** enemy (new combination of speed/HP/reward/color — no
new behavior), you only touch data + content:

1. **`src/game/data/enemies.ts`**
   - Add the new id to the `EnemyId` union type
   - Add an entry to `ENEMY_DEFINITIONS` (key must equal `id`, see invariant
     tests below)
2. **`src/game/data/waves.ts`** — reference the new `enemyId` in at least
   one entry in `WAVES`. An enemy definition that's never spawned is dead
   content (per `docs/BEST_PRACTICES.md`) and the invariant test below will
   fail on purpose to catch this.
3. Run `npm run test` — `tests/unit/balance.test.ts` will catch: id/key
   mismatches, non-positive speed/HP/livesLost, negative reward, and
   wave references to enemy ids that don't exist (typos). No new test is
   required for a stats-only addition; the invariant tests already cover it.
4. Playtest: `npm run dev`, place towers, start waves, confirm the new
   enemy appears when expected and the difficulty feels right relative to
   its wave (see the economy-loop rule in `docs/DESIGN_GUIDELINES.md`).
5. Update `docs/FEATURES.md` if this is a notable content addition worth
   tracking (most stat-only enemies aren't — use judgment).

**Nothing else needs to change.** `src/game/entities/Enemy.ts`,
`src/game/core/Targeting.ts`, and `src/game/scenes/GameScene.ts` all operate
generically on `EnemyDefinition` — that's the point of the data-driven
architecture.

### Worked example: adding a "Swarm" enemy (fast, very low HP, spawns in numbers)

```ts
// enemies.ts
export type EnemyId = 'grunt' | 'runner' | 'brute' | 'swarm';

export const ENEMY_DEFINITIONS: Record<EnemyId, EnemyDefinition> = {
  // ...existing entries...
  swarm: {
    id: 'swarm',
    name: 'Swarm',
    speed: 130,
    maxHp: 8,
    reward: 2,
    livesLost: 1,
    color: 0xf472b6,
  },
};

export const WAVES: WaveDefinition[] = [
  // ...existing waves...
  {
    groups: [
      { enemyId: 'swarm', count: 20, spawnIntervalMs: 150 },
      { enemyId: 'brute', count: 3, spawnIntervalMs: 2000 },
    ],
  },
];
```

Then `npm run test && npm run dev` to verify.

## When you need more than data

If the enemy needs genuinely new *behavior* — not just a new combination of
existing stats — that's a `gameplay-engineer` task, not just a data edit.
Examples and where they'd go:

- **Armor (flat damage reduction)** — new `armor: number` field on
  `EnemyDefinition`; apply it in `Enemy.takeDamage()`
  (`src/game/entities/Enemy.ts`)
- **Flying (some towers can't target it)** — new `flying: boolean` field;
  filter it in `Tower.update()`'s call into `findTarget`
  (`src/game/entities/Tower.ts`, `src/game/core/Targeting.ts`)
- **Shield (must be broken before HP damage applies)** — new state on the
  `Enemy` instance itself (not just the definition, since it changes at
  runtime) plus logic in `takeDamage()`
- **Split-on-death (spawns two weaker enemies when killed)** — needs
  `GameScene.damageEnemy()` to know how to spawn follow-up enemies; likely a
  new optional `splitInto: EnemyId | null` field on `EnemyDefinition`

For any of these: extend the `EnemyDefinition` type first (data model),
implement the behavior in the entity/core layer per
`docs/ARCHITECTURE.md`'s layering rule, and **add unit tests** in
`tests/unit/` for any new logic in `src/game/core/` — that's not optional,
see `docs/TESTING.md`. If the new field affects targeting decisions specifically,
it belongs in `src/game/core/Targeting.ts` so it stays unit-testable without
Phaser.

## Checklist

- [ ] `EnemyId` union updated
- [ ] `ENEMY_DEFINITIONS` entry added, key matches `id`
- [ ] Referenced in at least one `WAVES` entry
- [ ] New behavior (if any) implemented in the correct layer, with unit tests
- [ ] `npm run typecheck && npm run test && npm run lint` all pass
- [ ] Playtested via `npm run dev`
- [ ] `docs/FEATURES.md` updated if this is roadmap-worthy content
