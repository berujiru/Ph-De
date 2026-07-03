# Design Checklist — what's mapped vs. what's missing

Audit of design completeness (last updated 2026-07-03). Update this when
an item moves columns. "Mapped" = the design decision exists in a spec
doc; it does not mean numbers are tuned or code exists.

## Mapped ✅

| Area | Where |
|---|---|
| Tech stack + architecture (React/Phaser/Capacitor, core/entities/scenes layering) | `ARCHITECTURE.md` |
| World, story, framing rules (barrier, Eden, anomaly horde, fight-the-sin) | `WORLD_AND_HEROES.md` |
| Hero roster — 13 workers, each with type, melee/ranged kind, attack, skill/passive, unlock path | `WORLD_AND_HEROES.md` |
| Damage types (10) with jobs, riders, carrier heroes | `DAMAGE_AND_AILMENTS.md` |
| Ailments (12) with per-ailment proc rules; poison/bleed/rot/sleep carriers explicitly deferred | `DAMAGE_AND_AILMENTS.md` |
| Enemy chassis (11) × anomaly skins, monster forms, weak/resist intent per minion | `WORLD_AND_HEROES.md` |
| Boss roster (9 arc bosses + proposed finale) with signature mechanics | `WORLD_AND_HEROES.md` |
| Battle loop: Eden start, hero/enhancement drops, gold control valve, Voices, Acts | `WORLD_AND_HEROES.md` |
| Drop RNG rules + enhancement catalog (~22 entries with categories/caps) | `WORLD_AND_HEROES.md` |
| Bayanihan Acts (6, selectable barrier skills) | `WORLD_AND_HEROES.md` |
| Campaign ladder (barangay → LGU → province → agencies → finale) + reusable stage/wave engine | `PROGRESSION.md` |
| Hope currency, Sari-Sari Store, recruitment split | `PROGRESSION.md` |
| Goal layer (stars, arc meters, silhouettes, golden map, Truth Codex, streaks, dailies, festivals) | `PROGRESSION.md` |
| Legal guardrails (no real persons; agency-name conditions; asset-swap architecture) | `WORLD_AND_HEROES.md`, `PROGRESSION.md` |
| Testing strategy, code conventions, enemy-authoring guide | `TESTING.md`, `BEST_PRACTICES.md`, `ADDING_ENEMIES.md` |

## Missing — needs a decision (owner) ⚠️

1. **Portrait barrier-defense layout** — recommended, blocks `level.ts`
   templates, pedestal design, and `DESIGN_GUIDELINES.md` layout update.
2. **Ang Sistema finale** (horde-convergence gauntlet) — proposed.
3. **Heroes never sold for real money** — proposed binding rule.

## Missing — needs design/authoring work (not blocked) 📝

- **Hero balance sheet** — actual numbers per hero (damage, range, fire
  rate, skill cooldowns/values). Author at implementation start; tune
  against the build, not on paper.
- **Boss balance sheets** — HP/speed/skill numbers + resistance spreads.
- **Act 1 content sheet** — the first real stage list: 5–6 stages with
  map templates, wave tables, milestone placements (Teacher unlock,
  People Power unlock, Overseer boss stage).
- **Chassis stat definitions** — swarmling/shieldbearer/flyer/etc. base
  stats (only grunt/runner/brute exist in `balance.ts` today).
- **Numbers for systems** — drop weights/pity increments, enhancement
  stack caps/rarity weights, Act charge rates, gold reroll/summon costs,
  Hope payouts, star criteria. All flagged as `balance.ts` data; defaults
  authored with their systems.
- **Eden's full kit** — Rally skill numbers and adjacency anchor rules.
- **UI screen inventory** — squad select, enemy card, Sari-Sari, campaign
  map, codex: rough wireframes/flows (ui-engineer, after layout confirm).
- **`DESIGN_GUIDELINES.md` refresh** — layout section still describes the
  landscape prototype; update after the portrait decision.
- **Audio direction** — barks/music style guide (original compositions
  only, per content rules).

## Code gap (design far ahead of build) 🔧

The implemented game is still the foundation prototype (3 towers, 3
enemies, 5 waves, landscape path). Implementation ladder once layout is
confirmed: portrait pivot → damage plumbing phase 1 → `core/Drops.ts` +
enhancements → Acts/Voices → Act 1 content. Waves, economy, targeting,
and test infrastructure all carry forward.
