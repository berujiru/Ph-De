# World, Story & Hero System

Design spec for the game's setting, characters, and meta-game systems.
Decisions locked with the project owner (2026-07-03):

- The base being defended is **the Philippines**.
- Damage dealers are not generic towers but **heroes** — original parody
  characters inspired by Filipino celebrity/meme archetypes (see the
  character-design rules below; this is a legal lane, not a style choice).
- **Eden**, a concerned citizen, is the protagonist and permanent field
  leader. She has **4 ally slots** beside her. Leader-swap is a future
  feature.
- Heroes are **unique units** (one instance on the field), unlocked by
  defeating them, and deployed mid-battle via a **kill-drop system**.
- Hero bosses are **path-walkers** (melee or ranged) that advance on the
  base alongside their minions and **cast their skills** while advancing.

Numbers below are starting values for tuning; the rules are the design.

## Premise

Eden, an ordinary concerned citizen, watches an invasion no one else takes
seriously: a faceless **misinformation empire** — troll-bot swarms,
scam-text goblins, fake-news blimps, deepfake mimics, engagement-farming
warlords — marching across the archipelago. She sets out to form an
alliance of the nation's beloved "heroes": larger-than-life showbiz and
meme archetypes, sugar-coated and glorious. Each has been deceived by the
invaders' fake news (or is simply too proud to follow a nobody), so each
first stands against her: *"beat me on my home turf and I'll believe you."*
Defeat them, wake them up, and they join the alliance.

Satire stays aimed at the faceless machine, never at real individuals or
groups — that's both the comedic tone and the legal posture.

## Field roster

- **Eden** — always deployed, the leader unit. Baseline physical kit,
  modest stats, always available: she (plus generic volunteers) must be a
  viable floor for every battle, so hero drops are accelerants, never hard
  requirements. Future: swap the leader slot for another unlocked hero.
- **4 ally slots** — filled during battle by heroes arriving via drops
  (below). A hero is unique: one instance on the field, ever.
- **Volunteers** — the existing archer/cannon/frost prototype towers,
  reflavored (sling brigade, barricade cannon, water-bucket line). Bought
  with gold, multi-placeable, the coverage backbone.

### Two-track battle economy

| Resource | Source | Spends on |
|---|---|---|
| Gold | Passive trickle + kills (as today) | Volunteers, upgrades, Eden's abilities |
| Hero drops | Enemy kills (chance-based) | Deploying squad heroes into ally slots |

## Hero deployment: the drop / rally system

1. Before battle the player picks a **squad of 4** from their unlocked
   roster (plus Eden, who is automatic). Domain enemy cards telegraph
   weaknesses (see `docs/DAMAGE_AND_AILMENTS.md`), so squad selection is
   the strategic layer: bring the types this domain fears.
2. Enemy kills have a chance to produce a **drop**. A drop makes one squad
   hero available; the player places them in an open ally slot (placement
   is a choice, timing is luck).
3. **"Adjusts accordingly" — bad-luck protection**, all data-driven:
   - Every kill without a drop increases the next drop's chance
     (pity increment).
   - Heroes not yet dropped this battle are weighted up.
   - Elite/boss kills guarantee a drop.
   - Early waves carry a slightly boosted rate so squads come online
     before pressure peaks.
4. A visible **rally meter** on the HUD shows drop buildup — progress must
   read as "almost there!", never "the game is ignoring me."

Implementation home: `src/game/core/Drops.ts` — deterministic, seeded-RNG
state machine advanced by kill events, same testable pattern as
`WaveManager`. All knobs (base rate, pity increment, early-wave boost,
elite guarantees) in `balance.ts`.

## Domains & campaign map

The campaign map is the **Philippine archipelago** (Luzon → Visayas →
Mindanao arc). Each hero rules a **domain**:

```
DomainDefinition:
  region       — position on the archipelago map
  level        — path layout + build slots, regionally themed
  waves        — hand-authored; minion roster themed to the hero
  minions      — enemies with resistances matching the hero's element
  bossHero     — the hero as a boss (see below)
  unlock       — the hero's playable HeroDefinition
```

2–3 domains are open at any time. The damage-type matrix creates a
*recommended* order (the hero you just unlocked counters a neighboring
domain) without forcing one — any order is beatable, smart order is
smoother.

## Hero bosses

A domain's final wave is its hero, fighting with **the exact kit the
player will receive** — the boss fight is the tutorial for the unit.

- Bosses **walk the path** toward the base alongside minion waves.
- **Melee bosses**: high HP, must close distance; strike deployed units
  they pass.
- **Ranged bosses**: attack deployed units from distance while advancing.
- Bosses **cast their signature skills** on cooldown while walking — the
  same skills the hero will have when unlocked (buff minions, AoE stun
  your units, burn a lane, etc.).
- Per `docs/DAMAGE_AND_AILMENTS.md`: bosses are immune to hard CC
  (stun/freeze/sleep/knockback) and carry telegraphed
  resistances/weaknesses on their enemy card.

### Consequence: unit durability

Bosses attacking units means deployed units can be hit. Rule: **units are
knocked out, never destroyed** — a unit that takes a boss hit/skill is
KO'd for a recovery timer (or until re-rallied), then returns at its post.
A boss push should feel dangerous without permanently deleting the
player's setup. Volunteers may be cheaper to KO, heroes sturdier. Timers
and thresholds are `balance.ts` data.

## Unlock flow

- **Defeat = join.** Beat the domain's boss hero → recruitment scene →
  hero joins the roster. One hero per domain; the spine of progression.
- **Meme sidekicks** (minor units) unlock via side objectives (no-leak
  clear, mono-type clear, etc.).
- **Mastery**: replaying a joined hero's domain against remixed waves
  upgrades that hero (ties into the tower-upgrade roadmap item).
- Unlock state persists via the meta-progression system
  (`docs/FEATURES.md`: local storage first).

## Character design rules — the legal lane

This section is binding for all character content. Real celebrities'
names, photographs, recorded audio, and unmistakable likenesses are
**not** used without a license. Short clip length does not make audio
safe; illustration does not make a likeness safe; parody framing does not
make merchandising safe. Risk concentrates exactly when the game succeeds
(visibility) and monetizes (IAP) — and app stores act on complaints
without a court.

### The identifiability dial

The test for every character, visual and vocal: *would a Filipino player
say "that IS [specific person]" or "that reminds me of characters like
[archetype]"?* The first is exposure; the second is the safe lane.

**Visuals** — capture the archetype's silhouette, not one person's face:

- ✅ Era, fashion style, body language, comedic energy, hair *style*
- ✅ **Composite characters**: blend traits from 2–3+ references of the
  same archetype so no single individual is "the" source
- ❌ Face structure, signature look, or styling that points to exactly one
  real person — drawn art included; identifiability is the test, not the
  medium

**Voice** — capture the register, not the voice:

- ✅ Original catchphrases in the same comedic *genre* (bubbly showbiz
  hype, gossip-whisper, action-star gravel), performed by voice actors
- ✅ Few-second skill barks, chants, victory lines — original writing
- ❌ Real recorded clips (copyright of the network/studio + performer
  rights)
- ❌ Directing a VA to imitate a specific person's voice — deliberate
  sound-alikes of distinctive voices are exactly what courts have
  punished. Direct the *archetype* ("energetic showbiz hype-woman"),
  never the *person*.

Worked example: the "Go go go!" energy → **Gogogirl**, a bubbly showbiz
commander whose skill cut-in flashes her portrait while she chants an
original rally line ("Sige sige sige, GO!") that buffs ally attack speed.
Same laugh, zero exposure. Meme archetypes with no single source person
(Marites the gossip, Sana Ol, budots, jeepney culture) are fully safe.

### Built to license later

All character assets are **data**, not code: `HeroDefinition` references
sprite sheets, skill cut-in art, and `voiceLines[]` by asset path. If a
real celebrity deal is ever struck, their licensed face and voice drop in
as an asset swap — no engineering. Build parody-first, license-later.

Before commercial release, have a PH entertainment/IP lawyer review the
roster. This doc is design guidance, not legal advice.

## Provisional roster (parody archetypes)

Names/kits are placeholders to be developed per the rules above; each
hero's element obeys `docs/DAMAGE_AND_AILMENTS.md` design rules (distinct
job, carrier pairing).

| Hero | Archetype | Type | Kit identity |
|---|---|---|---|
| Eden | Concerned citizen (protagonist) | Physical | Leader; modest all-rounder, rally abilities |
| Kamao | Boxer-turned-politician | Physical | Highest single-target DPS |
| Gogogirl | Bubbly showbiz commander | Lightning | Attack-speed chant, burst |
| Marites | Neighborhood gossip (meme) | Dark | Curse aura — "spreads the tea" |
| Reyna | Pageant queen | Holy | Anti-undead beam, confidence buff |
| Toktok | Dance-craze street kid | Frost | Slow — enemies stop to watch |
| Bossing | Teleserye action star | Fire | Burn cone, unwatched explosions |
| DiliVery | Delivery-rider folk hero | Wind | Knockback — "return to sender" |
| Apo Baket | Terraces mystic grandmother | Earth | Splash + armor shred |
| Sana Ol | Lovestruck streamer | Water | Wet applier, squad enabler |

## Data model (target shape)

```ts
interface HeroDefinition {
  id: HeroId;
  name: string;
  archetype: string;            // design-bible reference, not shipped UI
  damageType: DamageType;
  attackKind: 'melee' | 'ranged';
  deployCost?: number;          // if drops alone don't gate deployment
  skill: HeroSkillDefinition;   // cooldown, effect, cut-in art ref
  voiceLines: VoiceLineRef[];   // asset paths — swappable, see above
  bossProfile: BossDefinition;  // stats/skills when fought as a domain boss
}

interface BossDefinition {
  maxHp: number;
  speed: number;
  attackKind: 'melee' | 'ranged';
  resistances: Partial<Record<DamageType, number>>;
  skills: BossSkillDefinition[]; // cast on cooldown while walking
  // hard-CC immunity is implied for all bosses (DAMAGE_AND_AILMENTS.md)
}
```

`DropTable` config and KO/recovery tuning live in `balance.ts`.

## Rollout dependencies

This system builds on, in order:

1. Damage/ailment phases 1–2 (`docs/DAMAGE_AND_AILMENTS.md`) — heroes are
   typed damage dealers; bosses need resistances.
2. Multiple levels / level registry (`docs/FEATURES.md`) — domains are
   levels.
3. Enemy info card — squad selection depends on telegraphed weaknesses.
4. Unit durability (KO/recovery) — required before the first boss ships.
5. Meta-progression (persistent unlocks) — required for the roster to
   mean anything across sessions.

The current prototype's towers remain valid throughout: they become
volunteers with a reskin, and Eden's kit can start as a reskinned archer.
Nothing already built is discarded.
