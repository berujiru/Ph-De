# Voice Drops, Hero Stat Bands & the Upgrade Matrix

Design spec for the in-battle economy that replaces the old tower economy:
kills fill the **Voices meter**, a full meter triggers an **RNG drop**, and
the run's power grows through **hero-targeted upgrades** and **new recruits**.

Companion to `docs/WORLD_AND_HEROES.md` ("Drops & Voices" rules — the design
law) and `docs/DAMAGE_AND_AILMENTS.md` (ailments are a *separate* future drop
category). This doc is the **numbers and data shapes**; all tunables live in
`src/game/data/balance.ts`. Numbers are starting values for tuning — the
bands, the pierce rule, the pool formula, and the matrix structure are the
design.

This round is **data + spec only**. Where a mechanic needs engine work beyond
data, it's flagged `ENGINEER:` — those are the gameplay-engineer's next tasks,
not shortcuts to route around in `balance.ts`.

---

## 1. Hero stat bands

Every hero's `damage` / `attackRateMs` / `range` is calibrated to a band set
by its **role**, not tuned in isolation. The reference unit is a **1.0 DPS
worker ≈ 12 single-target DPS** at base (`DPS = damage × 1000 / attackRateMs`).
Support-leaning heroes sit at ~0.5x per the "no pure support, but ~50–60% of a
DPS worker" rule in `docs/PROGRESSION.md`.

### Single-target DPS bands (base, before upgrades)

| Band | Target DPS | Who | Why |
|---|---|---|---|
| **Frontline bruiser** | 15–17 | jeepney_driver, security_guard | Melee-range risk (holds at the shield front) is paid back in raw DPS |
| **Standard ranged DPS** | 9–13 | eden, teacher, call_center_agent, electrician, delivery_rider, fishball_vendor, sales_lady, farmer | The workhorse band; safe positioning, honest numbers |
| **AoE / multi-hit** | 7–11 *per hit* | street_sweeper, taho_vendor, baker, plumber, student | Lower per-hit because they hit many; effective DPS climbs with enemy count |
| **Control / enabler** | 2–6 | fisherfolk, traffic_enforcer, sorbetes_vendor | Damage is not the job — Wet/pull/freeze setup is. Deliberately weak stat sticks |
| **Support striker** | ~5 (0.5x) | nurse | Heals/buffs carry the kit; still deals real damage (never zero) |
| **Utility / summoner** | ~0 direct | construction_worker | `damage` is repurposed as wall HP (`summonHp = damage × 10`); value is blocking, not DPS |

### Per-attackStyle expectations

Each `attackStyle` has a lane for **DPS shape**, **range**, and **attack rate**.
These are the guardrails a new hero of that style should land inside.

| attackStyle | Range band (px) | Rate band (ms) | DPS shape | Notes |
|---|---|---|---|---|
| `projectile` | 220–320 | 1300–1600 | single-target, reliable | Eden anchors the top of the range band at 320 |
| `pierce` | 220–260 | 1100–1300 | line, multi-hit | Per-hit low; see the pierce spec below |
| `boomerang` | 250–280 | 1400–1600 | two hits (out + back) | Effective DPS ~1.8x the single-hit figure |
| `beam` | 230–250 | 400–600 | fast, low per-hit, hits a line | sales_lady owns "fastest attack in the game" |
| `chain` | 240–320 | 1400–1700 | primary + arcs | Longest ranged band; shines on grouped/Wet enemies |
| `melee-cleave` | 90–110 | 1200–1500 | frontline arc | `range` **is the cleave radius** — keep it melee-band, never 200+ |
| `lobbed` | 170–200 | 1700–1900 | splash on impact | Moderate single, splash bonus |
| `vortex` | 160–200 | 3500–4000 | area DoT + pull | Control band — low DPS by design |
| `trap` | 150–180 | 3000 | placed, delayed area | Zone denial |
| `linear-wave` | 110–220 | 2200–2500 | horizontal line sweep | Melee sweepers use the low range band; ranged (plumber) the high |
| `summoner` | 100–110 | 5000 | no direct DPS | `damage` = wall HP |

### Outliers fixed this pass

- **Eden `range: 1000` → `320`.** 1000 let her hit clear across the 960-wide
  viewport before enemies engaged, trivializing positioning. 320 lets her
  strike enemies shortly before they reach the shield without sniping the
  whole field. (The formation math in `core/RallyMarch.ts` self-corrects hold
  position from range, so this only changes reach, not where she stands.)
- **security_guard / farmer `range: 200` → `100`.** Melee-cleave uses `range`
  as the swing radius; 200 was a ranged-sized swing on a melee unit. Now they
  read as frontline bruisers.
- **jeepney_driver `range: 50` → `90`, street_sweeper `range: 50` → `110`.**
  Nudged into the melee/short cleave band so their arcs actually catch a clump.

All other changes are DPS-band normalizations (see the table above). Passives
and signature skills were left as-authored — they're already role-differentiated
and their text matches the calibrated numbers.

---

## 2. Pierce spec (ENGINEER)

**Problem today:** "pierce" heroes route through `ProjectileAttack` with
`{ bonusPierce: 2 }`. That projectile **homes** on its target, so it curves and
does not fly through a line — it behaves like a projectile that happens to be
able to hit twice.

**Intended behavior — a straight-line, non-homing shot:**

1. On fire, snapshot the hero→target unit vector. The shot travels along that
   fixed vector; it **never re-homes**, even if the original target dies.
2. It passes **through** every enemy whose body it overlaps, dealing full
   damage to each, until it has hit `basePierce + bonusPierce` enemies or
   leaves the world bounds.
3. Each enemy is hit at most once (track a hit-set, as `ProjectileAttack`
   already does).

**Data (already in `balance.ts`):** `HeroDefinition.basePierce`.
- `student.basePierce = 2` — Slingshot, "punch through a line of 2."
- `fishball_vendor.basePierce = 5` — Tuhog, "pierces up to 5" (matches the
  passive text and `docs/WORLD_AND_HEROES.md`).

Total pass-through targets = `basePierce + AttackModifiers.bonusPierce`.

**Difference from `projectile`:** projectile homes and expires on its first
hit (`maxHits = 1 + bonusPierce`); pierce flies straight and expires after
`basePierce + bonusPierce` hits. They are different entities, not the same
entity with a flag.

`ENGINEER:` add a `PierceAttack` (or a non-homing branch) that reads
`basePierce`; remove the `{ bonusPierce: 2 }` stand-in in `GameScene.spawnHero`.
Its `Visual` and impact FX are Phaser sprites/particles like every other
attack — **no DOM** (`docs/DESIGN_GUIDELINES.md`, Phaser-First Visuals).

---

## 3. Voice-drop pool progression

**The problem with today's rule:** the meter starts at 3 and does `+1` forever.
That's decoupled from how many kills a run actually offers, so the drop count
per run is accidental and doesn't re-scale when wave counts change.

**The model — derive the cadence from the run's total kill pool.**

- **Kill pool `P`** = the authored kill count of the run. Wave `N` spawns
  `N × baseWaveSize` enemies, so `P = baseWaveSize × T(T+1)/2`. Base prototype
  (`T = 3`, `baseWaveSize = 5`) → **P = 30**. (Split/summon spawns are bonus on
  top; the pool is intentionally the *authored* count.)
  → `computeKillPool(totalWaves, baseWaveSize)` in `balance.ts`.
- **Target: `targetDropsPerRun = 6` drops per full clear.** Rationale: 4 drops
  fill Eden's squad (Eden + 4 slots), the remaining ~2 are enhancement rolls.
  The first drop is cheap (`firstDropCost = 2`) so a companion arrives fast;
  later drops cost more so the cadence slows as the squad's power climbs.
- **Threshold formula** — linear-growth incremental costs sized so exactly
  `D` drops land across `P`:

  ```
  step    = 2 × (P − D × firstDropCost) / (D × (D − 1))
  cost(k) = round(firstDropCost + k × step)        // k = 0-based drop index
  ```

  → `voiceDropCost(dropIndex, killPool)` in `balance.ts`.

**Worked numbers (P = 30, D = 6, firstDropCost = 2):** `step = 1.2`.
Incremental costs `2, 3, 4, 6, 7, 8` → cumulative kills `2, 5, 9, 15, 22, 30`.
Six drops, the last landing on the final kill of a full clear.

**Scales for free:** double the waves (P = 60) → `step = 3.2`, costs
`2, 5, 8, 12, 15, 18`, still **6 drops** spread across 60 kills. Change the wave
table and the drop cadence re-derives itself — no re-tuning.

Tunables live in `VOICE_DROP_TUNING` (`firstDropCost`, `targetDropsPerRun`,
`minIncrement`).

`ENGINEER:` in `GameScene`, track a `dropIndex` counter and set the next
`maxVoicesCount = voiceDropCost(dropIndex, computeKillPool(this.totalWaves))`
after each drop, instead of `maxVoicesCount += 1`. Seed the first meter from
`voiceDropCost(0, …)` in `buildGame` (replaces the hardcoded `= 3`). Keep the
meter/drop *presentation* in Phaser (the pickup lands where the enemy died,
per `docs/WORLD_AND_HEROES.md`) — the React layer only renders the choice
cards.

---

## 4. The upgrade matrix

What the Voices RNG is allowed to offer once the squad has drops to spend on.
Encoded in `balance.ts` as data the RNG reads directly. Two buckets:

### Bucket A — hero-targeted upgrades

Applied to **one active hero** (the "Safe RNG" rule — never offered for a hero
that isn't deployed). Eligibility depends on that hero's `attackStyle` via
`UPGRADE_MATRIX`. Magnitudes/rarity/copy live in `UPGRADE_DEFS`.

| Kind | Magnitude | Applies to (`apply`) | Rarity | Max stacks | Eligible styles |
|---|---|---|---|---|---|
| `damage` | +6 damage | `hero.damage +=` | common | 5 | all |
| `attackSpeed` | ×0.85 rate (15% faster) | `hero.attackRateMs *=` | common | 5 | all |
| `range` | +40 range | `hero.range +=` | rare | 3 | all |
| `pierce` | +1 pass-through | `bonusPierce +=` | rare | 3 | projectile, pierce |
| `chain` | +1 arc | `bonusChain +=` | rare | 3 | chain |
| `radius` | +15 area | `bonusRadius +=` | rare | 3 | boomerang, beam, melee-cleave, lobbed, vortex, trap, linear-wave |

`UPGRADE_MATRIX: Record<attackStyle, UpgradeKind[]>` — the full per-style
eligibility lists. Universal stats are on every list; behavior mods only where
the style actually consumes that `AttackModifier` in `Attacks.ts`.

Flat stat sticks (`damage`, `attackSpeed`) stay **common** — they're the
always-safe filler. `range` and the behavior mods are **rare** because they
change how a hero plays, per the `docs/WORLD_AND_HEROES.md` "must change how a
hero plays or what the player watches" rule.

### Bucket B — global drops

`GLOBAL_DROP_DEFS`:

| Kind | Effect | Rarity |
|---|---|---|
| `newHero` | Recruit an unlocked worker into an open slot | common (offered only while a slot is open) |
| `moraleHeal` | Restore 50 Barrier integrity | common |

### Rarity weighting

`DROP_RARITY_WEIGHTS = { common: 100, rare: 35, epic: 10 }` — wave-1 baseline
pull weights. Later waves multiply rare/epic (the "rarity scales with waves"
rule); the RNG owns that scaling, `balance.ts` owns the baselines.

### No epic tier yet

No upgrade is `epic` in this first pass — epic is reserved for the behavior
*combos* and ailment infusions catalogued in `docs/WORLD_AND_HEROES.md`
(Split Shot, Bounce, Infusion, Chain Reaction, Buhis-Buhay), which arrive with
the ailment system (`docs/DAMAGE_AND_AILMENTS.md` phases). Don't add filler
epics to fill the slot — YAGNI (`docs/BEST_PRACTICES.md`).

`ENGINEER:` the RNG lives in a pure, seeded `core/Drops.ts` state machine
(`docs/WORLD_AND_HEROES.md` rule 8): read `UPGRADE_MATRIX` for the active
heroes, filter out capped/inapplicable options ("no dead drops"), weight by
`DROP_RARITY_WEIGHTS`, and roll. **Behavior mods have nowhere to land yet:**
each `Attack` is built fresh in `GameScene.spawnHero` with no persisted
modifiers. Store an `AttackModifiers` on the `Hero`, mutate it on drop, and
pass it into every `Attack` the hero spawns. Then `bonusPierce`/`bonusChain`/
`bonusRadius` (already supported by `Attacks.ts`) finally do something.

---

## 5. Drop card copy (data)

The player chose "display the purpose of the summon," so every drop carries a
one-line purpose string, surfaced through `DropOption.description` /
`DropOption.title`.

- **Hero summons** → `HeroDefinition.purpose` (added this pass to all 20
  recruitable heroes; e.g. fishball_vendor: *"Skewers a whole line — one Tuhog
  throw pierces up to 5 anomalies."*). Sandbox testers omit it (UI falls back
  to `profession`).
- **Upgrades** → `UpgradeSpec.title` + `UpgradeSpec.purpose`
  (e.g. *"Piercing Shot — This hero's shots punch through 1 more enemy."*).
- **Global drops** → `GlobalDropSpec.title` + `GlobalDropSpec.purpose`.

`ENGINEER:` when building `DropOption`s in `GameScene.addVoices`, populate
`title`/`description` from these fields and set `rarity`/`kind` so the HUD can
frame the card (`DropOption` already carries `rarity`, `kind`, `damageType`,
`risk`). The card itself is React chrome (a menu/overlay is the one place HTML
is allowed); the **pickup on the field** and any hero-power-up flash are Phaser.

---

## Handoff checklist (engineer)

- [ ] `PierceAttack`: non-homing, straight-line, `basePierce + bonusPierce`
      pass-throughs; drop the `{ bonusPierce: 2 }` stand-in.
- [ ] `ChainAttack.maxJumps = baseChain + bonusChain` (drop the hardcoded `3`).
- [ ] Persist `AttackModifiers` on `Hero`; pass into every spawned `Attack`.
- [ ] Voices cadence: `voiceDropCost` + `computeKillPool` + `dropIndex`
      counter; replace `maxVoicesCount += 1` and the hardcoded `= 3`.
- [ ] `core/Drops.ts` seeded RNG reading `UPGRADE_MATRIX` / `UPGRADE_DEFS` /
      `GLOBAL_DROP_DEFS` / `DROP_RARITY_WEIGHTS`, with "no dead drops" filtering.
- [ ] Populate `DropOption.title/description/rarity/kind` from the data fields.
- [ ] All drop feedback (pickups, power-up flashes, pierce/chain visuals) in
      Phaser, not the DOM.
