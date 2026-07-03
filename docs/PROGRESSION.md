# Progression, Campaign & Economy

Design spec for the campaign journey, per-run rewards, the store, and the
content-reuse engine that makes a long campaign cheap to build. Companion
to `docs/WORLD_AND_HEROES.md` (setting, heroes, factions) and
`docs/DAMAGE_AND_AILMENTS.md` (combat).

Owner decisions locked (2026-07-03): the campaign climbs the ladder of
Philippine institutions (barangay → LGU → national agencies, one by one);
every run earns a persistent currency spendable on unlocks; content scale
comes from reusable map templates and minion chassis, not hand-building
every stage.

## The campaign ladder: single voice to many, institution by institution

Eden's movement grows through the same ladder every Filipino knows:

| Act | Tier | Stage themes (map templates) | Arc |
|---|---|---|---|
| 1 | **Barangay** | Street, basketball court, plaza, barangay hall | Eden + tanod volunteers defend her own street; first sidekicks join |
| 2 | **Bayan / LGU** | Public market, transport terminal, city hall | The movement is town-sized; first big corruption cells |
| 3 | **Province** | Provincial road, port, capitol | Regional alliance; folk-creature corruption peaks |
| 4+ | **National gauntlet** | One government agency per arc | Cleanse agencies one by one; each arc has a unique gimmick + boss |
| Finale | **Capital Core** | The empire's heart | The Algorithm + The Dynasty, defended by every voice gathered |

### The national agency gauntlet

Each agency arc = 3–4 stages plus a boss, themed to that agency's
signature corruption *behavior* (never persons — see the binding rules in
`WORLD_AND_HEROES.md`):

- **Transport agency arc** — Red Tape armor enemies, queue-maze map
  gimmick ("your license is ready next window")
- **Social welfare arc** — ghost-beneficiary enemies (stealth chassis);
  honest social workers cheer you on and join as sidekicks
- **Public works arc** — the ghost-projects showcase: ghost bridges and
  phantom flood-control walkers; heavy reveal-mechanic stages
- **Customs arc** — Kickback Courier waves (gold thieves), smuggled-crate
  splitters

**Agency naming — resolved (2026-07-03)**: real agency names (LTO, DSWD,
DPWH) are acceptable *because of the game's frame* — the player helps the
agency, never fights it. Institutions aren't persons for libel purposes,
and a positive portrayal of the institution with corruption as an external
infestation is standard protected fiction. Binding conditions:

1. **Never use official seals, logos, or uniform insignia** — government
   insignia have separate legal protection; invent in-game visual
   identities.
2. **No real officials or lookalikes**, ever (same rule as celebrities).
3. **The agency is always portrayed as honorable** — its honest workers
   cheer the player on, join as sidekicks, and thank Eden on arc
   completion. The infestation is the enemy; the institution is the
   patient.
4. Ship an in-game disclaimer (fictional story; agencies depicted
   respectfully in a fictionalized form).
5. A PH lawyer pass on the final agency list before store release.

Legible fictionalizations remain the zero-risk fallback if any single
agency arc drifts toward sharper satire than the frame above.

The gauntlet is the long-tail content pipeline: every agency (and later,
every region variant of an agency) is a new arc built entirely from
reusable parts. The archipelago map stays the campaign's face — regions
turn **golden** as their arcs complete: *"Buong Pilipinas, protektado."*

### Hero domains live inside the ladder

Hero recruitment stages (defeat → join, per `WORLD_AND_HEROES.md`) are
placed *along* the ladder where they fit thematically — Toktok at the
Act 1 plaza, the Jeepney Driver at the Act 2 terminal, the Auditor in the
first agency arc — so the roster grows at the journey's pace instead of
living on a separate map layer.

## Reusable content engine

A stage is data, assembled from parts:

```ts
interface StageDefinition {
  id: string;
  act: number;
  template: MapTemplateId;   // one of ~6-8 path layouts per tier
  skin: MapSkinId;           // regional/festival re-dress of a template
  waves: WaveDefinition[] | WaveBudget;  // hand-authored OR generated
  modifiers?: StageModifier[];           // weather, gimmicks (queue maze)
  heroDomain?: HeroId;       // recruitment stage marker
  firstClearReward: RewardBundle;
  repeatReward: RewardBundle;
}
```

- **Map templates × skins**: ~6–8 path layouts per tier, re-dressed per
  region/festival. Dozens of distinct-feeling stages from single-digit
  layout count.
- **Wave budgets**: most stages use a generated wave table from a
  difficulty budget (deterministic, seeded — lives in `core/`, unit
  tested like `WaveManager`). Only boss/domain stages get fully
  hand-authored waves.
- **Minion chassis × faction skins**: see `WORLD_AND_HEROES.md` — enemy
  *stats/behavior* live once per chassis; factions reskin them. New act ≠
  new enemy code.

## Per-run rewards: Hope and the Sari-Sari Store

Every run pays out **Hope (Pag-asa)** — the persistent meta currency —
**win or lose**. A failed defense still wakes people up.

Earn rules (all `balance.ts` data):
- Base payout per wave cleared (so losses pay proportionally)
- Win bonus; first-clear bonus (the big one); no-leak bonus
- Daily first-run bonus (retention hook)

Spend at the **Sari-Sari Store** (the neighborhood store as the game's
shop — data-driven catalog):

| Purchase | Notes |
|---|---|
| **Sidekick unlocks** | Support cast (Jeepney Barker, Taho Vendor, honest agency workers…) — Hope-purchasable |
| **Hero mastery upgrades** | Per-hero stat/skill tiers, alongside domain-replay mastery |
| **Volunteer upgrades** | Permanent tier-ups for the gold-bought volunteer units |
| **Cosmetics** | Festival costumes, map skins, voice-line packs |

**Binding rule (proposed, pending owner confirmation): signature heroes
are never sold** — not for Hope, not for real money. Story heroes join
only by being defeated in their domain. Two acquisition tracks, clean
split: *defeat earns allies; Hope buys support.* Real-money IAP, when it
comes, maps to cosmetics (and possibly Hope top-ups — decide later, but
never hero access).

## Session → mid → long loops

- **Session (3–5 min)**: kills → Voices (drop meter) → deploy heroes →
  clear waves → Hope payout.
- **Mid**: Hope purchases + hero unlocks compound into new squad options;
  the next arc opens.
- **Long**: complete the alliance and the ladder → the finale unlocks →
  golden archipelago. Post-campaign: **Balita daily challenge** (one
  fake-news outbreak per day, remixed modifiers, mastery rewards),
  endless siege + leaderboards, festival live-ops on the real PH
  calendar (Sinulog Jan, Independence Jun, Buwan ng Wika Aug, Ber-months
  Sept–Dec).

## Squad building: the 4-slot rule and hybrid supports

**Every hero attacks. No hero is pure support.** With Eden + 4 slots, a
zero-damage unit creates degenerate squad math and a new-player trap
("all supports, can't kill anything"). Instead, worker heroes are
hybrids: a real (if modest, ~50–60% of a DPS hero) basic attack, with
their *identity* carried by a passive/skill:

| Hero | Basic attack | Support identity |
|---|---|---|
| Nurse | Syringe darts | Skill: **regenerates the Barrier** — the only "healing" that exists, since units can't be hit |
| OFW | Thrown balikbayan-box goods | Passive: steady bonus gold (remittance trickle) |
| Jeepney Driver | Horn blast | Passive: his **route** — a drawn corridor; allies along it get faster attack + drops arrive faster along the route (corridor aura, not circle aura) |
| Teacher | Chalk throw | Passive: **marks** enemies — marked take bonus damage from everyone |
| Farmer | Scythe sweep | Passive: kills near him yield bonus gold/Voices (harvest) |
| Fisherfolk | Net throw | The attack *is* the support: damage + group slow |
| Auditor | Stamp slam (true dmg vs corruption) | Reveals ghosts, pops inflated HP bars |
| Journalist | Camera flash | Damage + reveal; aura exposes stealth |

Guardrails:
- Squad-power hint at squad select: soft warning (never a block) if the
  squad lacks damage or lacks coverage vs. the stage's telegraphed enemy
  types (reuses enemy-card data).
- Volunteers (gold-bought, always available) are the DPS floor — an
  all-support squad leaning on upgraded volunteers is a legitimate
  economy playstyle, not a bug, once volunteer upgrades exist.

## Proposed and pending owner confirmation

Carried from design discussions, not yet locked:
- **Portrait barrier-defense field layout** (enemies descend to a bottom
  barrier; heroes on fixed pedestals behind it) — recommended, detailed
  in `WORLD_AND_HEROES.md`
- **The Algorithm + The Dynasty** as the finale bosses, gated on
  completing the alliance
- **Heroes never sold** as a binding monetization rule (recommended
  strongly above)

Resolved this session: Bayanihan/People Power → the selectable
**Bayanihan Acts** barrier-skill system (`WORLD_AND_HEROES.md`); agency
naming → real names allowed under the binding help-the-agency conditions
above; recruitment → defeat-to-recruit kept for meme heroes,
inspired-to-join for citizen heroes.
