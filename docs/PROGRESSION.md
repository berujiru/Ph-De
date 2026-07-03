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
| Finale | **Ang Sistema** *(proposed)* | Horde convergence gauntlet | Every defeated anomaly returns at once, The Dynasty at the horde's heart — fought with the full alliance |

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

### Recruitment lives inside the ladder

Heroes join by **inspiration at story milestones** placed along the
ladder (per `WORLD_AND_HEROES.md`) — save the barangay and the Teacher
joins, the Jeepney Driver signs on at the Act 2 terminal, the honest
Auditor after the first agency cleanse — so the roster grows at the
journey's pace. Heroes not tied to a milestone unlock at the Sari-Sari
Store with Hope, in player-chosen order.

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
| **Hero unlocks** | Workers not tied to a story milestone — unlockable in player-chosen order |
| **Hero mastery upgrades** | Permanent per-hero stat/skill tiers, alongside arc-replay mastery |
| **Bayanihan Acts** | Additional barrier ultimates beyond milestone unlocks |
| **Cosmetics** | Festival costumes, map skins, voice-line packs |

**Binding rule (proposed, pending owner confirmation): heroes are never
sold for real money.** They're earned — by story milestone or by Hope,
both in-game only. Real-money IAP, when it comes, maps to cosmetics (and
possibly Hope top-ups — decide later, but never exclusive hero access).

## The goal layer — what players actually pursue

Currency and unlocks are **fuel, not destinations** — "cleanse → points →
heroes → cleanse" is circular and won't retain anyone by itself. Players
need visible destinations at every distance. Each of these serves a
different player motivation, and the game needs all of them:

| Distance | Destination | Motivation served |
|---|---|---|
| This session | **Clear the stage; then 3-star it** — stars for no-leak, no Bayanihan Act used, speed/wave thresholds (exact criteria tunable). Stars gate optional bonus stages | Mastery |
| This week | **Finish the current arc** — every arc shows a progress meter (4/5 stages); almost-done bars pull harder than fresh ones | Completion |
| Teased ahead | **Recruit *that* hero** — locked heroes appear as silhouettes with hints ("a nurse in Cebu is waiting for the movement to reach her…") | Collection |
| Campaign | **The golden map** — every cleansed region turns gold on the home-screen archipelago; the map IS the progress bar. Endgame: the full alliance vs. The Algorithm | Narrative + completion |
| Infinite | **Leaderboards** (endless siege, weekly Balita rankings), **mastery caps**, **festival-exclusive cosmetics** on the real PH calendar | Status + expression |
| Emotional | **The fantasy itself**: *"I united the Philippines against the lies."* The crowd behind the barrier visibly grows across the campaign; citizens thank Eden by name; the finale is won by everyone you gathered | Meaning — this is the game's differentiator; no generic TD can offer it |

Supporting systems for the goal layer:

- **Stage star ratings** (1–3) with star-gated bonus content — the
  cheapest replayability multiplier in the genre.
- **The Truth Codex** — a collection book: every enemy type defeated adds
  a "lie debunked" entry (its mechanic + a one-line satirical debrief);
  every hero recruited adds a bio; every Act, a chronicle page.
  Completionists get a second full progression track for free, and the
  codex doubles as the game's soft media-literacy message.
- **Streaks**: Balita daily streak with growing (but capped, never
  punishing) bonuses.
- **First-clear vs. repeat rewards** already split in `StageDefinition` —
  first-clears are the big hits; repeats stay worthwhile via mastery.

Design rule: at any moment, the player should be able to answer "what am
I working toward *right now*, *this week*, and *overall*" — session goal,
arc meter, golden map. If a screen can't answer one of those, it's
missing a progress affordance.

## Session → mid → long loops

- **Session (3–5 min)**: Eden deploys at wave 1 → kills roll drops
  (heroes until the squad is full, then enhancements), earn gold
  (rerolls / instant summons), and fill Voices (Act charge) → clear
  waves → Hope payout. Enhancements reset each battle; mastery is the
  permanent track.
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
("all supports, can't kill anything"). Worker heroes are hybrids: a real
(if modest, ~50–60% of a DPS worker) basic attack, with their *identity*
carried by a passive/skill. The full roster with attacks, types, and
skills lives in `docs/WORLD_AND_HEROES.md` — that table is the single
source of truth.

Guardrails:
- Squad-power hint at squad select: soft warning (never a block) if the
  squad lacks damage or lacks coverage vs. the stage's telegraphed enemy
  types (reuses enemy-card data).
- Eden is always deployed and always deals real damage — the guaranteed
  floor. Support-leaning squads compensate through drops (economy
  passives buy more rerolls and instant summons, and enhancement mods
  multiply harder on a wide squad) — a legitimate playstyle, not a trap.

## Proposed and pending owner confirmation

- **Portrait barrier-defense field layout** (enemies descend to a bottom
  barrier; heroes on fixed pedestals behind it) — recommended, detailed
  in `WORLD_AND_HEROES.md`
- ~~In-battle upgrade tiers~~ — superseded (2026-07-03): the owner
  restored and refined the drop system. **Locked**: kills roll drops —
  heroes while squad slots remain (guaranteed first drop, pity cadence),
  then enhancements only (damage/AoE mods, split/bounce projectiles,
  infusions…); no dead drops; gold is the RNG control valve (rerolls,
  instant summons). Full rules in `WORLD_AND_HEROES.md` "Drops &
  enhancements"
- **Ang Sistema** as the finale (horde-convergence gauntlet, The Dynasty
  at its heart) — replaces the trashed "Algorithm" machine finale
- **Heroes never sold for real money** as a binding monetization rule
  (recommended strongly above)

Resolved: heroes = citizen workers only (meme tier removed); no
volunteer units; enemies = horde of bad-governance anomalies with bosses
named after real issue categories; recruitment = inspiration milestones
+ Hope unlocks; Bayanihan Acts as the barrier-skill system; agency
naming = real names under the binding help-the-agency conditions above.
