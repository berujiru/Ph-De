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

## Meta-Economy: Hope, Cards, and Rally Permits

The game's progression revolves around a tightly integrated meta-economy, accessible via the main menu's **Inventory / Archive** screen and the **Sari-Sari Store**.

### The Energy System: Rally Permits
- **Rally Permits** are required to start any campaign stage. This is the game's energy/stamina system.
- The UI for the campaign map must explicitly display the **cost per campaign run** in Permits.
- Permits regenerate naturally over time, but players can also purchase extra Rally Permits in the Sari-Sari Store.
- **No storage cap** (owner decision, 2026-07-04): permits accumulate
  without an upper limit — the UI shows the current count only, never an
  `X / max`. (A run is still gated on holding *enough* permits for its
  cost; there is simply no ceiling on how many you can bank.)

### The Store Currency: Hope Points
- Every run pays out **Hope Points** — the persistent meta-currency (gold coin for the store) — **win or lose**. A failed defense still wakes people up and earns Hope.
- **Earn rules**: Base Hope payout per wave cleared, win bonuses, no-leak bonuses, and daily first-run bonuses (all defined in `balance.ts`).

### Progression: Hero Cards
- Leveling up heroes uses **Cards**. 
- Cards are acquired as RNG drops at the end of runs, or directly purchased in the Sari-Sari Store using Hope Points.
- The **Inventory** screen (accessible via a main menu button) holds all collected drops, cards, and unlocked heroes.

### The Sari-Sari Store (Data-driven catalog)

| Purchase | Cost | Notes |
|---|---|---|
| **Hero Cards** | Hope Points | Used to permanently level up unlocked heroes. |
| **Hero unlocks** | Hope Points | New workers not tied to a story milestone. |
| **Rally Permits** | Hope Points/IAP | Refills energy to continue playing campaign runs. |
| **Bayanihan Acts** | Hope Points | Additional barrier ultimates beyond milestone unlocks. |
| **Cosmetics** | Hope Points/IAP | Festival costumes, map skins, voice-line packs. |

**Binding rule (pending owner confirmation): heroes are never sold directly for real money.** They're earned — by story milestone or by Hope Points in-game only. Real-money IAP maps to cosmetics and Rally Permit / Hope top-ups.

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
- **The Truth Codex** — a collection book, surfaced as the **Enemies** tab
  of the Archive/Inventory screen. Every enemy type is **sealed by default
  and unlocks on first encounter in the field** (owner decision,
  2026-07-04) — a faced anomaly becomes a "lie debunked" entry (its
  mechanic + a one-line satirical debrief), while unfaced ones show a
  redacted silhouette. Every hero recruited adds a bio; every Act, a
  chronicle page. Completionists get a second full progression track for
  free, and the codex doubles as the game's soft media-literacy message.
- **Streaks**: Balita daily streak with growing (but capped, never
  punishing) bonuses.
- **First-clear vs. repeat rewards** already split in `StageDefinition` —
  first-clears are the big hits; repeats stay worthwhile via mastery.

Design rule: at any moment, the player should be able to answer "what am
I working toward *right now*, *this week*, and *overall*" — session goal,
arc meter, golden map. If a screen can't answer one of those, it's
missing a progress affordance.

## Session → mid → long loops

- **The Core Gameplay Loop**:
  1. **Preparation Screen (Main UI)**: The player selects their progress on the map and clicks **Defend** to start a run.
  2. **The Run (Session, 3–5 min)**: Eden deploys at wave 1 → kills fill the **Voices Meter** → a full meter triggers **RNG drops** (heroes until the squad is full, then enhancements).
  3. **Spoils of War**: The run ends in either Victory or Defeat. Regardless, the player earns persistent meta-currency (Hope points or Gold).
  4. **Repeat**: The player returns to the Preparation screen to upgrade and repeat.

- **Mid (Meta-Progression)**:
  - **Unlockable Heroes**: Heroes are unlocked either naturally based on campaign progress, or can be directly bought using the Spoils of War (Hope points / Gold).
  - Hope/Gold purchases and new hero unlocks compound into new squad options; the next arc opens.
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
- Companion hint in the Briefing Room: since there is **no squad
  pre-selection** (owner decision, 2026-07-04 — companions come from
  in-battle drops), the pre-battle screen instead shows a soft, non-blocking
  hint of which *recruited* workers counter the stage's telegraphed enemy
  types (reuses enemy-card data), plus an "organizer's note" when a
  telegraphed weakness has no recruited counter yet.
- Eden is always deployed and always deals real damage — the guaranteed
  floor. Support-leaning squads compensate through drops (economy
  passives buy more rerolls and instant summons, and enhancement mods
  multiply harder on a wide squad) — a legitimate playstyle, not a trap.

## Proposed and pending owner confirmation

- **Portrait barrier-defense field layout** (enemies descend to a bottom
  barrier; heroes on fixed pedestals behind it) — **Locked and confirmed**. Detailed
  in `WORLD_AND_HEROES.md`
- ~~In-battle upgrade tiers~~ — superseded (2026-07-03): the owner
  restored and refined the drop system. **Locked**: kills fill the Voices meter, which drops an RNG reward when full (heroes from your unlocked pool while squad slots remain, then enhancements only). The meter cost scales up per drop. No dead drops. Full rules in `WORLD_AND_HEROES.md` "Drops & enhancements"
- **Ang Sistema** as the finale (horde-convergence gauntlet, The Dynasty
  at its heart) — replaces the trashed "Algorithm" machine finale
- **Heroes never sold for real money** as a binding monetization rule
  (recommended strongly above)

Resolved: heroes = citizen workers only (meme tier removed); no
volunteer units; enemies = horde of bad-governance anomalies with bosses
named after real issue categories; recruitment = inspiration milestones
+ Hope unlocks; Bayanihan Acts as the barrier-skill system; agency
naming = real names under the binding help-the-agency conditions above.
