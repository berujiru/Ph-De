# Damage Types & Ailments

Design spec for the damage/ailment system. Decisions locked with the project
owner (2026-07-03):

- **Per-ailment proc rules** — each ailment defines its own application
  logic (chance-on-hit, every-hit-refresh, stack counters). There is no
  shared universal buildup meter.
- **Telegraphed weaknesses** — the player can open an enemy info card that
  shows weaknesses, resistances, and ailment immunities. Discovering
  resistances is NOT meant to be hidden gameplay.

All numbers below are starting values for tuning, not commitments. The
*jobs* and *rules* are the design; the numbers belong to `balance.ts` once
implemented.

## Design rules

1. **Every damage type must have a distinct job.** If a proposed type would
   play the same as an existing one, it's a color, not a type — don't add it.
2. **Every type needs a carrier.** A damage type ships only alongside at
   least one hero that deals it and at least one enemy that resists or is
   weak to it. No orphan types in data. (Carriers were "towers" in the
   original draft; heroes are the only damage dealers now — see
   `docs/WORLD_AND_HEROES.md` for the type-to-hero mapping.)
3. **Hard crowd control always has an immunity window.** Stun, Freeze,
   Sleep, and Knockback stop or reverse path progress, which is equivalent
   to free DPS. Every proc grants the enemy temporary immunity to that
   effect, and bosses are outright immune (via `ailmentImmunities`).
4. **Resistances are multipliers**: `0` = immune, `0.5` = resistant,
   `1` = neutral (default, omitted from data), `1.5+` = weak. Damage taken =
   `baseDamage × resistances[type]`, after armor where armor applies.

## Damage types

| Type | Job | Rider / special rule | Countered by |
|---|---|---|---|
| `physical` | Baseline, most common | None — reliable | Armor (flat reduction per hit) |
| `magic` | Anti-armor | Ignores armor entirely | Magic-resistant elites |
| `fire` | Damage over time | Applies **Burn** on every hit | **Wet** enemies (burn doused) |
| `frost` | Control | Applies **Slow**; chance to **Freeze** wet enemies | Frost-immune fire-themed enemies |
| `lightning` | Burst + interrupt | Chance to **Stun**; vs **Wet**: +50% damage and double stun chance | Grounded/insulated enemies |
| `water` | Enabler/utility | Applies **Wet**; modest damage by design | — (its weakness is low raw DPS) |
| `wind` | Time-buyer | **Knockback** along the path; full value vs `flying` | Heavy/boss enemies (knockback-immune) |
| `earth` | Anti-armor, physical flavor | Applies **Armor Shred**; splash affinity; cannot target `flying` | Flying enemies |
| `holy` | Anti-undead | ×1.5 damage vs `undead`-tagged enemies | Neutral vs everything else |
| `dark` | Force multiplier | Applies **Curse** (amplifies all incoming damage) | Weak alone — requires squad mixing |

### Elemental interplay (Wet as the hub)

`water` deals little damage itself; its job is enabling combos:

- **Wet + fire** → Burn cannot be applied; applying Wet removes an active
  Burn ("doused").
- **Wet + lightning** → +50% lightning damage, stun chance doubled.
- **Wet + frost** → 20% chance per frost hit to **Freeze** (consumes Wet).

This makes the water hero (Fisherfolk) a deliberate support pick rather
than a stat stick.

## Ailments

Each ailment has its **own proc rule** — implementation must not force them
through a shared mechanism.

| Ailment | Source | Proc rule | Effect | Stacking / immunity |
|---|---|---|---|---|
| `burn` | fire | Every hit applies/refreshes | 5 dmg/sec for 3s | No stack; refresh only |
| `slow` | frost | Every hit applies/refreshes | −40% speed for 2s | No stack; refresh only |
| `wet` | water | Every hit applies/refreshes | No damage; douses Burn, enables Freeze, amplifies lightning | 4s duration |
| `freeze` | frost hit on Wet enemy | 20% chance | Full stop 1s | Consumes Wet; shares Stun's immunity window |
| `stun` | lightning | 10% chance per hit | Full stop 0.5s | 3s immunity after proc |
| `poison` | future carrier hero (deferred) | 30% chance per hit | 2 dmg/sec for 8s | Stacks ×3 with independent timers |
| `bleed` | future carrier hero (deferred) | +1 stack per hit (max 5) | At 5 stacks: burst 10% max HP, stacks reset | 2s no-stack window after proc; flat cap vs bosses (tune later) |
| `rot` | future carrier hero (deferred) | Every hit adds a stack | 1 dmg/sec **permanently** (never expires) | Stacks ×5 |
| `sleep` | future carrier hero (deferred) | Always applies on hit | Full stop up to 3s; **any damage wakes it** | Shares hard-CC immunity window |
| `curse` | dark | Every hit applies/refreshes | +25% damage taken from all sources, 4s | No stack |
| `knockback` | wind | 25% chance per hit | Pushed 40px back along path | 3s immunity; bosses immune |
| `armorShred` | earth | Every hit | −1 armor (min 0) for 5s | Stacks until armor reaches 0 |

### Deliberate distinctions (don't collapse these)

- **Sleep ≠ Stun**: sleep is longer but any damage wakes the target, so it
  fights the default "first" targeting — your own heroes can waste it.
  That interaction is the mechanic. It only becomes worth shipping once
  per-hero targeting strategies exist (see `docs/FEATURES.md`).
- **Rot ≠ Poison**: poison is a stronger, expiring DoT; rot is weak but
  permanent — guaranteed eventual value on tanks and long paths, useless
  as burst.
- **Curse and Armor Shred are force multipliers**, not damage dealers: they
  exist to reward mixing damage types in the squad, which is the strategic
  heart of the whole system.

## Enemy info card (telegraph UI)

Tapping an enemy on the field, or an enemy row in the (planned) wave
preview, opens a card showing:

- Name, max HP, speed, gold reward, lives cost
- **Weak to** — damage types with multiplier > 1
- **Resists** — damage types with multiplier < 1 (0 shown as "immune")
- **Immune to** — ailments in `ailmentImmunities`
- Tags where relevant to the player (`flying`, `undead`, `boss`)

Owned by ui-engineer; content comes straight from `EnemyDefinition` so the
card can never drift from actual behavior.

## Data model (target shape)

```ts
type DamageType =
  | 'physical' | 'magic' | 'fire' | 'frost' | 'lightning'
  | 'water' | 'wind' | 'earth' | 'holy' | 'dark';

type AilmentId =
  | 'burn' | 'slow' | 'wet' | 'freeze' | 'stun' | 'poison'
  | 'bleed' | 'rot' | 'sleep' | 'curse' | 'knockback' | 'armorShred';

type EnemyTag = 'flying' | 'undead' | 'boss';

// HeroDefinition (see docs/WORLD_AND_HEROES.md) carries:
//   damageType: DamageType
//   (ailment application follows from damageType's rider, or an explicit
//    ailment field for future dedicated poison/bleed/rot/sleep carriers)

// EnemyDefinition additions:
//   armor?: number                                   // flat phys reduction
//   resistances?: Partial<Record<DamageType, number>> // omitted = 1 (neutral)
//   ailmentImmunities?: AilmentId[]
//   tags?: EnemyTag[]
```

Damage math lives in a new pure module `src/game/core/Damage.ts`; ailment
state (per-enemy active effects, timers, immunity windows, stack counts)
lives in `src/game/core/Ailments.ts`. Both are `core/` modules: no Phaser
imports, unit tests required (`docs/TESTING.md`). Entities only render the
results (tints, icons above the HP bar — cap visible icons, screen space is
tight per `docs/DESIGN_GUIDELINES.md`).

When the new `EnemyDefinition` fields land in code, update
`docs/ADDING_ENEMIES.md` (it documents real code only) and extend
`tests/unit/balance.test.ts` invariants: resistance values ≥ 0, immunity
lists reference known ailments, every shipped damage type has ≥1 carrier
hero, `earth` heroes never target `flying`, etc.

## Rollout phases

Carriers are heroes (`docs/WORLD_AND_HEROES.md` roster); the prototype's
three towers stand in for heroes during testing until hero kits land.

1. **Neutral plumbing** — add `DamageType` to unit definitions,
   `resistances` on enemies, `core/Damage.ts`, all values neutral (1.0).
   Zero gameplay change; verifies nothing regressed.
2. **First riders** — `core/Ailments.ts` with Slow (Sorbetero), Burn
   (Grill Vendor), Stun (Journalist). Types live: physical, frost, fire,
   lightning.
3. **Water & synergies** — Fisherfolk's Wet, Freeze, douse/amplify rules.
   Enemy info card ships here at the latest (the matrix is now deep enough
   to need telegraphing).
4. **Remaining types as content demands** — wind (Jeepney Driver), earth
   (Farmer), holy (Nurse), magic (Auditor), dark (Whistleblower), and
   poison/bleed/rot/sleep with future carrier heroes, each arriving *with*
   at least one enemy that makes it matter (design rule 2). Sleep waits
   for per-hero targeting strategies.

Nothing outside phase 1–2 should be implemented speculatively (YAGNI, per
`docs/BEST_PRACTICES.md`) — this spec exists so later phases are designed
once, not so they're built early.
