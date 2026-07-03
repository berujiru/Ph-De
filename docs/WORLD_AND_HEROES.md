# World, Story & Hero System

Design spec for the game's setting, characters, and meta-game systems.
Decisions locked with the project owner (2026-07-03):

- The base being defended is **the Barrier of the Philippines** — the
  nation's shield. "Lives" in the prototype = barrier integrity.
- Damage dealers are not generic towers but **heroes** — original
  characters built from **communal Filipino meme culture** (see the
  character-design rules below; this is a legal lane, not a style choice).
- **Heroes cannot be hit.** They only deal damage. Enemies attack exactly
  one thing: the barrier. There is no unit durability/KO system.
- **Eden**, a concerned citizen, is the protagonist and permanent field
  leader. She has **4 ally slots** beside her. Leader-swap is a future
  feature.
- Heroes are **unique units** (one instance on the field), unlocked by
  defeating them, and deployed mid-battle via a **kill-drop system**.
- Hero bosses are **path-walkers** (melee or ranged) that advance on the
  barrier alongside their minions and **cast their skills** while
  advancing. Their skills affect their own side or the barrier — never
  the player's units directly.

Numbers below are starting values for tuning; the rules are the design.

## Premise

Eden, an ordinary concerned citizen, watches an invasion no one else takes
seriously: one machine with **two arms** marching across the archipelago.
The **Troll arm** — troll-bot swarms, scam-text goblins, fake-news blimps,
deepfake mimics — spreads the lies; the **Corruption arm** — ghost
projects, red tape, kickback couriers, dynasties — is what the lies
protect. Eden sets out to form an alliance: beloved meme heroes and
ordinary citizen workers, one voice becoming many, cleansing the country
from her own barangay street up through the halls of national agencies
(campaign structure in `docs/PROGRESSION.md`).

Two framing rules, both binding:

- **Fight the sin, never the sinner.** Corruption enemies personify
  *behaviors* (Ghost Project, Red Tape, The Dynasty), never real persons,
  parties, or officials — libel is criminal in the Philippines, and the
  satire is sharper aimed at the behavior anyway.
- **Institutions are victims, not villains.** Agencies get *cleansed*, not
  destroyed; their honest workers cheer the player on and join as
  sidekicks. Government isn't the enemy — the infestation is.

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

Player units are untouchable (locked rule above), so bosses pressure the
**barrier**, and melee vs. ranged is about *how*:

- Bosses **walk the path** toward the barrier alongside minion waves.
- **Melee bosses**: high HP; damage the barrier only on arrival, but hit
  it hard. The threat is a slow, huge health bar grinding forward.
- **Ranged bosses**: begin **bombarding the barrier from partway down the
  path** once within their attack range of the path's end — chip damage
  on an interval while they advance. The threat is a timer: every second
  they're alive near the end, the barrier bleeds. Burst them down.
- Bosses **cast their signature skills** on cooldown while walking — the
  same skills the hero grants when unlocked, expressed on their own side:
  buff or heal minions, summon reinforcements mid-path, shield
  themselves, or slam the barrier. Boss skills never damage or disable
  the player's units.
- Per `docs/DAMAGE_AND_AILMENTS.md`: bosses are immune to hard CC
  (stun/freeze/sleep/knockback) and carry telegraphed
  resistances/weaknesses on their enemy card.

Bombardment interval/damage, arrival damage, and skill cooldowns are all
`balance.ts` data.

## Enemy factions & minion chassis

Enemies are built for reuse (see `docs/PROGRESSION.md`): a small set of
**chassis** define stats/behavior once; **faction skins** re-dress them
per act and arc. Adding an act's worth of enemies should mostly mean new
skins, not new code.

### Basic chassis (behavior archetypes)

| Chassis | Behavior | Exists today as |
|---|---|---|
| Grunt | Baseline walker | `grunt` |
| Runner | Fast, fragile | `runner` |
| Brute | Slow tank | `brute` |
| Swarmling | Very weak, arrives in packs | (planned — `ADDING_ENEMIES.md` example) |
| Shieldbearer | Shield must break before HP | (planned) |
| Flyer | Immune to `earth`, weak to `wind` | (planned) |
| Healer | Heals nearby minions | (planned) |
| Drummer | Speeds nearby minions | (planned) |
| Splitter | Splits on death | (planned) |
| Stealther | Invisible until revealed | (planned) |
| Elite | Mini-boss, aura, guaranteed drop | (planned) |

### Faction skins

**Troll arm (misinformation):** Troll (grunt), Bot (swarmling), Fake News
Blimp (flyer), Influencer-for-Hire (drummer), Deepfake Mimic (stealther),
Troll Farm Overseer (elite).

**Corruption arm (behaviors personified — never persons):**

| Enemy | Chassis | The behavior → the mechanic |
|---|---|---|
| Fixer | Runner | Rushes paperwork past you |
| Red Tape | Brute | Layers of paperwork armor (stacking armor; `earth`/shred counters); slows your gold income while alive |
| Ghost Project | Stealther | Ghost bridges/dikes — untargetable until revealed by truth units (Auditor, Journalist, Resibo) |
| The Overpriced | Shieldbearer | Hugely inflated HP bar; an audit hit pops the padding to reveal true HP |
| Kickback Courier | Runner | Steals gold as it walks; kill it before it exits to recover with interest |
| Epal Tarp | Elite | Billboard mini-boss; morale aura buffs nearby enemies |
| The Dynasty | Boss | Phase boss — kill it and a relative takes over (three generations, three phases) |

**Corrupted folk creatures (public-domain mythology):** Manananggal
(splitter), Tiyanak (bait/stealth — clickbait made flesh), Kapre
(stealth-aura elite — hides others in smoke until killed), Tikbalang
(scrambles targeting — design TBD).

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

### Memes and viral lines (the roster's foundation)

The roster is built from **communal PH internet/street culture** rather
than celebrity parodies — richer material and legally cleaner. The test
for any meme or line: ***does this belong to everyone, or to someone?***

- ✅ **Communal memes and slang** — no single owner: Marites, sana all,
  edi wow, charot, awit, lodi/petmalu, dasurv, resibo culture, budots,
  "walang pasok" rain-day hopes, videoke culture, jeepney "bayad po,"
  the taho vendor's call, the flying tsinelas. These are folk culture;
  use freely.
- ✅ **Viral lines that have become generic slang** — if a phrase has
  detached from its originator and everyone says it, an original
  character can say it too. Short phrases aren't copyrightable; lines
  are the safest asset class *when spoken by an original character*.
- ⚠️ **Lines still owned by an identifiable influencer** — if the
  audience hears the line and pictures one specific living person, treat
  it exactly like a celebrity catchphrase: don't pair it with a
  character that resembles them (the line + lookalike + name-alike combo
  is what creates an identifiable persona). Either wait for the phrase
  to go generic, or write an original line in the same spirit.
- ❌ **Influencer personas** — a TikTok/YouTube comedian is a real
  person with the same publicity rights as a TV star. "Internet famous"
  is not a legal category difference.
- Songs are copyrighted even when the meme is the *performance* (e.g.
  videoke "My Way" culture): reference the culture, commission original
  soundalike-free music.

### Built to license later

All character assets are **data**, not code: `HeroDefinition` references
sprite sheets, skill cut-in art, and `voiceLines[]` by asset path. If a
real celebrity deal is ever struck, their licensed face and voice drop in
as an asset swap — no engineering. Build parody-first, license-later.

Before commercial release, have a PH entertainment/IP lawyer review the
roster. This doc is design guidance, not legal advice.

## The two-tier roster

The roster has two tiers with different tone rules:

- **Citizen heroes — dignified tier, played completely straight.** Ordinary
  Filipino workers whose everyday labor becomes heroism: Teacher, Nurse,
  OFW, Jeepney Driver, Journalist, Auditor, Farmer, Fisherfolk, Student.
  Warm, heroic portrayals; **zero comedy at their expense** — these are
  the "unmockable" characters, and they carry the story's heart ("from a
  single voice to many"). Their kits are hybrid attacker/supports — see
  the support-hero table and the "every hero attacks" rule in
  `docs/PROGRESSION.md`.
- **Meme heroes — comedy tier.** Communal-culture characters below;
  comedy is welcome here because the subject is shared culture, never a
  person and never the dignified tier.

Eden belongs to the citizen tier — the first voice.

## Provisional roster (communal meme archetypes)

Names/kits are placeholders to be developed per the rules above — every
entry sourced from communal culture, none from an identifiable person.
Each hero's element obeys `docs/DAMAGE_AND_AILMENTS.md` design rules
(distinct job, carrier pairing).

| Hero | Communal source | Type | Kit identity |
|---|---|---|---|
| Eden | Concerned citizen (protagonist) | Physical | Leader; modest all-rounder, rally abilities |
| Lola Tsinelas | The flying-slipper discipline grandma | Physical | Ranged sniper — highest single-target DPS, never misses |
| Resibo | Receipts/"may resibo ako" culture | Magic | Truth pierces all defenses — ignores armor (thematic match: magic's anti-armor job) |
| Marites | Neighborhood gossip | Dark | Curse aura — "spreads the tea," everything cursed takes more damage |
| Manang Dasal | Prayer-warrior auntie (warm, never mocking) | Holy | Anti-undead radiance, blessing buff |
| Toktok | Budots street dancer | Frost | Slow — enemies can't help stopping to watch |
| Mang Ihaw | Street BBQ grill master | Fire | Burn cone — "isaw for everyone" |
| DiliVery | Delivery-rider folk hero | Wind | Knockback — "your order has been returned to sender" |
| Apo Baket | Mountain albularyo (folk healer) | Earth | Splash + armor shred |
| Sana Ol | "Sana all" longing poster | Water | Wet applier, the enabler every squad wants |

**Meme sidekicks** (side-objective unlocks, support kits): the **Jeepney
Barker** ("bayad po!" — collects extra gold from kills along his lane),
the **Taho Vendor** (morning-call rally that speeds up drop buildup), the
**Videoke King** (original power ballad, brief sonic stun — original
music only, never a real song).

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
  // melee: barrierDamage applied on arrival
  // ranged: bombardDamage + bombardIntervalMs, active once within
  //         bombardRange of the path's end
  resistances: Partial<Record<DamageType, number>>;
  skills: BossSkillDefinition[]; // own-side buffs/heals/summons/shields
                                 // or barrier slams — never target units
  // hard-CC immunity is implied for all bosses (DAMAGE_AND_AILMENTS.md)
}
```

`DropTable` config and boss barrier-attack tuning live in `balance.ts`.

## Rollout dependencies

This system builds on, in order:

1. Damage/ailment phases 1–2 (`docs/DAMAGE_AND_AILMENTS.md`) — heroes are
   typed damage dealers; bosses need resistances.
2. Multiple levels / level registry (`docs/FEATURES.md`) — domains are
   levels.
3. Enemy info card — squad selection depends on telegraphed weaknesses.
4. Meta-progression (persistent unlocks) — required for the roster to
   mean anything across sessions.

The current prototype's towers remain valid throughout: they become
volunteers with a reskin, and Eden's kit can start as a reskinned archer.
Nothing already built is discarded.
