# World, Story & Hero System

Design spec for the game's setting, characters, and battle systems.
Simplified per owner decisions (2026-07-03, superseding the earlier
meme-hero/two-arm-machine design):

- The base defended is **the Barrier of the Philippines**. "Lives" =
  barrier integrity.
  - **Despair & Rally (Morale System)**: In addition to HP, the Barrier has "Morale." Taking heavy hits breaks Morale, temporarily disabling a hero's passive. Using a Bayanihan Act instantly rallies the Barrier, restoring Morale and swinging momentum back to the player.
- **Heroes are citizen workers only** — the meme-hero tier is removed.
  Every hero is an ordinary Filipino worker with a real job, a real
  attack, and a signature skill.
- **There are no volunteer/generic towers.** The only units are Eden and
  her squad.
- **Player units can never be hit.** Enemies attack exactly one thing:
  the Barrier.
- **The enemy is a horde, not an empire.** There is no boss machine and
  no mastermind — each minion and boss is a **bad-governance anomaly
  personified** (ghost projects, kickbacks, red tape…). Cleansing the
  country of the horde *is* the campaign.
- **Eden + 4 ally slots**; heroes are unique (one instance each).
- Bosses are named after **real categories of PH governance anomalies**
  (Ghost Flood Control, Pork Barrel, Vote Buying…) — issues, never
  persons.

Numbers are tuning placeholders; rules are the design.

## Premise

Anomalies of bad governance have taken monstrous form and march on the
Barrier of the Philippines — ghost projects shamble half-built, kickbacks
scurry off with the people's gold, red tape shields the rest. Eden, one
concerned citizen, gathers no chosen ones and no celebrities: she gathers
**workers** — a nurse, a teacher, a jeepney driver, an auditor — because
the people who hold the country up every ordinary day are the ones who
can hold the Barrier now. From a single voice to many.

Framing rules, binding (full legal detail in the character-design
section and `docs/PROGRESSION.md` agency conditions):

- **Fight the anomaly, never a person.** Enemies personify *behaviors
  and scandals as categories* — no real officials, parties, contractors,
  or lookalikes, ever.
- **Institutions are victims, not villains.** Agencies get cleansed;
  their honest workers cheer the player on and join the roster.

## The battle (core loop)

1. **Pre-battle**: read the stage's enemy cards (telegraphed weaknesses)
   and pick a squad — Eden + 4 workers whose damage types counter the
   stage. Choose one **Bayanihan Act** (barrier ultimate).
2. **Deploy**: Eden takes the field at wave 1. The other four arrive via
   **hero drops** (below). Lineup order matters — adjacent heroes buff
   each other (**Bayanihan adjacency**).
3. **Fight**: enemies walk the path toward the Barrier. Heroes attack
   automatically (targeting per `core/Targeting.ts`); each hero also has
   a **skill** — manually triggered, on cooldown, with a voiced bark and
   cut-in.
4. **Drops & Voices**: Kills fill the **Voices meter**. When the meter fills, it triggers an **RNG drop** and the required charge scales up (e.g., requires 2 kills, then 4, etc.).
5. **RNG Rewards**: The drop can be a new **unlocked Hero** (player selects which of the 4 empty slots to station them in), a Hero Upgrade, or a General Upgrade (e.g., adding ailments or boosting damage types).
6. **Bayanihan Acts**: The equipped Bayanihan Act is a configurable ultimate skill chosen during the pre-battle preparation screen.
7. **Win/lose**: clear all waves before the Barrier falls. Enhancements
   are per-battle only — permanent growth is mastery
   (`docs/PROGRESSION.md`).

### RNG rules (Voices and Drops)

1. **Voice Meter Scaling** — Drops are no longer random per kill. Kills fill the Voices meter, which drops an RNG reward when full. The meter requirement scales up after each drop.
2. **Hero Drops are finite and gated** — The RNG will only drop **unlocked heroes**, and only while there are empty slots. The player chooses which of the 4 empty slots to station the hero in.
3. **No dead drops** — An enhancement that can't apply (stack cap reached, no eligible hero) is excluded from the roll before it happens.
4. **Rarity scales with waves** — Later waves weight toward rarer enhancements, so late-battle drops stay exciting.
5. **"Buhis-Buhay" (Desperate Measures) Drops** — To introduce tension, the RNG can occasionally offer high-risk, high-reward drops. These grant massive buffs (e.g., +200% attack speed) but inflict a temporary penalty (e.g., increased cooldowns or pausing Barrier healing) reflecting the toll of overworking to secure the nation.
6. **Deterministic under the hood** — Seeded RNG in a pure `core/Drops.ts` state machine; all weights and caps are `balance.ts` data.

Enhancements land as tappable pickups where the enemy died (auto-collect
after a few seconds — tap for juice, never punished for missing it).
Targeted enhancements are applied to a hero the player picks; global
ones apply instantly.

### Enhancement catalog (initial set)

| Category | Enhancement | Effect |
|---|---|---|
| Stat mods | Damage Up | +% attack damage (stacks, capped) |
| | Attack Speed Up | +% fire rate |
| | Range Up | +reach up-screen |
| | AoE Up | +splash radius (splash heroes only) |
| Projectile behaviors | **Split Shot** | Projectile splits into two on hit (max 1 stack) |
| | **Bounce** | Projectile ricochets to a nearby enemy (up to 3 bounces) |
| | Pierce | Projectile passes through the first enemy |
| | Multishot | +1 projectile per volley |
| Elemental / ailment | Potency Up | Stronger rider (burn dmg, slow %, curse amp…) |
| | Proc Up | Higher ailment application chance |
| | **Infusion** | Adds a second damage type at 30% power — live type-matrix play |
| Skill mods | Cooldown Down | −% skill cooldown |
| | **Skill Echo** | Skill casts a second time at 50% power |
| Combat riders | Executioner | Bonus damage to low-HP enemies (finish leakers) |
| | Giant Slayer | Bonus vs elites/bosses (capped % max HP) |
| | **Chain Reaction** | Killed enemies explode for a % of their HP — horde clear |
| Squad / meta | Bayanihan Amp | Adjacency bonuses +% |
| | Voice Amp | Kills charge the Act +% faster |
| | Lucky | Future drop chance/rarity up (a drop that improves drops) |
| Instants (global) | Barrier Patch | Immediate barrier heal |
| | Salu-Salo Crumbs | Immediate gold burst |

Stack caps, weights, and rarity tiers per enhancement are data. Rule for
adding new ones: an enhancement must either *change how a hero plays*
(behaviors, infusions) or *change what the player watches* (instants,
meta) — flat stat sticks are filler and stay rare.

### Field layout — portrait rally march (confirmed)

The game is a **Vertical Auto-Battler**. Enemies descend from the top. Players summon heroes at the bottom of the screen. Summoned heroes automatically march upwards to form the "Rally Frontline". The player does not place static towers; they manage the economy and the timing of summoning workers. "Melee" workers walk directly up to enemies to brawl, while ranged workers stop behind the melee line to fire projectiles. Portrait, one-handed, thumb-friendly; sessions 3–5 minutes.

## The heroes — workers with skills

All heroes follow the **every-hero-attacks** rule (no pure supports; a
support-leaning worker still deals ~50–60% of a DPS worker's damage —
squad math stays healthy in 5 slots). Damage types per
`docs/DAMAGE_AND_AILMENTS.md`; every type's carrier is a hero now.

| Hero | Worker | Type | Attack Style | Attack / Weapon | Signature skill / passive |
|---|---|---|---|---|---|
| **Eden** | Community organizer | Physical | Projectile | Throwing megaphones | Skill: Rally — brief squad-wide buff |
| **Teacher** | Public school teacher | Physical | Boomerang | Tossing a wooden *Pamalo* (ruler) | Marks enemies for bonus damage |
| **Student** | Working student | Physical | Pierce | Slingshot with pebbles | Passive: Enhancement drops apply at increased potency |
| **Jeepney Driver** | Driver | Wind | Cone | Revving smog-spewing *Tambutso* | Skill: *Barya* — tosses coins like shrapnel for AoE damage |
| **Fisherfolk** | Fisher | Water | Vortex | Net throw (*Lambat*) | Clumps enemies and applies Wet |
| **Street Sweeper** | Barangay sweeper | Earth | Linear-Wave | Sweeping *Walis Tingting* | Sends a wave of dust/debris that hits the frontline |
| **Taho Vendor** | Street vendor | Frost | Splash | Lobs scalding *Arnibal* (Syrup) | Sticky syrup slows and damages in a circle |
| **Nurse** | Public health nurse | Holy | Projectile | Throwing Alcohol sprays | Attacks buff allies they pass through |
| **Construction Worker** | Laborer / Carpenter | Physical | Summoner | Building *Yero* Fences | Summons barricades on the path to block enemies |
| **Call Center Agent** | BPO Graveyard shift | Lightning | Chain | Headset Feedback | Instantly hits and arcs to nearby enemies |
| **Security Guard (Sikyu)** | Security Guard | Physical | Melee-Cleave | Swinging a *Batuta* | Skill: *Shining Flashlight* - Blinds/slows a cone of enemies |
| **Farmer (Magsasaka)** | Farmer | Earth | Melee-Cleave | Swings a *Karit* (Scythe) | Passive: Roots enemies to the ground periodically |
| **Fishball Vendor** | Street Vendor | Physical | Pierce | Throws *Tuhog* (Barbecue Skewers) | Skewers pierce through multiple enemies |
| **Sales Lady** | Department Store Worker | Wind | Hitscan | "Ma'am/Sir!" Megaphone Pitch | Relentless, high-speed verbal pitching |
| **Sorbetes Vendor** | Ice Cream Vendor | Frost | Trap | Drops sticky ice cream puddles | Freezes enemies that step on the trap |
| **Electrician** | Lineman | Lightning | Chain | Jumper Cables | Zaps enemies and arcs electricity |
| **Baker (Panadero)** | Local Baker | Fire | Splash | Lobs hot *Pandesal* bags | Bags explode for fire splash damage |
| **Traffic Enforcer** | Traffic Enforcer | Physical | Vortex | Blows a whistle and raises "STOP" | Magnetically pulls enemies into a clump |
| **Plumber (Tubero)** | Water Worker | Water | Linear-Wave | Opens high-pressure pipe | Washes enemies away with a horizontal wave |
| **Delivery Rider** | Motorcycle Courier | Wind | Boomerang | Throws parcels that return | Skill: Summons AI riders to crash into the horde |

All 10 damage types have carriers; the roster of 20 heroes ensures immense variety in attack styles and synergies. Kits, numbers, and skill cooldowns are `balance.ts` data (the **hero balance sheet** — actual numbers — is authored when implementation starts, tuned against the build).

## The horde — anomalies of bad governance

Enemies reuse the **chassis × skin** engine (`docs/PROGRESSION.md`):
behavior defined once per chassis, anomalies as skins.

### Minion anomalies — the bestiary

Each anomaly is a **monster whose body telegraphs its mechanic**. The
design rule for every entry: a player who has never read a tooltip should
guess what it does from its silhouette and animation. (And per the
binding content rules: any face, poster, or name on a monster is
fictional and generic — e.g. the Epal's candidate face is an invented
grinning politician, never a real one.)

**Horde Synergy (Combat Puzzles)**: Enemies should organically form synergies as they march. For example, *Red Tape* acting as a physical shield that intercepts projectiles meant for the *Kickback Courier* hiding behind it, or *Ghost Employees* only becoming targetable after being hit by splash damage or a specific reveal skill.

| Anomaly | Chassis | Monster form | Behavior → mechanic | Weak to / resists |
|---|---|---|---|---|
| **Troll Bot** | Swarmling | Gremlin with a cracked phone for a head, blue-glow face, keyboard-claw fingers; chitters in speech bubbles | Fake-news spam in packs | Weak: fire (burn spreads through the pack) · Resists: dark |
| **Fixer** | Runner | Many-armed scuttler sheathed in rush-stamped folders, a lanyard of too many IDs, grease-slick trail | Darts in bursts, rushing paperwork past you | Weak: frost (speed is its whole trick) · Resists: wind (low, slippery) |
| **Ghost Employee** | Stealther | Translucent barong-clad office specter, blank ID on a lanyard, clutching a bundy time card — only its floating pay envelope is fully solid | Invisible until revealed by truth heroes (Auditor/Journalist) | Weak: holy (spectral) · Resists: physical (incorporeal) |
| **Kickback Courier** | Runner | Hunched imp lugging a bulging duffel that leaks coins; **visibly fattens as it steals** | Steals gold as it walks; kill it before it exits to recover with interest | Weak: lightning (caught in the flash) · Resists: physical (slippery) |
| **Red Tape** | Brute | Mummy wrapped in red ribbon and "RECEIVED" tape; **each armor layer is a visible wrap that shreds off** as armor breaks | Stacking paperwork armor (earth/shred counters); slows gold income while alive | Weak: earth (shred), fire (paper burns) · Resists: water (laminated) |
| **Epal** | Elite | Hulking mobster whose real face is hidden behind a smiling **fictional candidate's tarpaulin face**, sash and rosette; the poster smile never changes, even when it roars; the tarp tears as it takes damage | Elite minion; "name recall" morale aura buffs nearby anomalies | Weak: wind (tarps rip in the wind) · Resists: physical (thick hide) |
| **Fake News Blimp** | Flyer | Tabloid-skinned balloon beast with a megaphone snout, raining screaming-headline leaflets | Flying: immune to earth, weak to wind | Weak: wind, lightning · Immune: earth |
| **The Overpriced** | Shieldbearer | Parade-balloon creature puffed to bursting, wearing a price tag with too many zeros; **an audit pops it, deflating it to a scrawny true form** | Hugely inflated HP bar; audit removes the padding | Weak: magic (truth pierces the padding) · Resists: physical (absorbed by padding) |

Exact multipliers are `balance.ts` data; this column is the design
intent the enemy info card telegraphs. Boss resistances get the same
treatment in their balance pass.

(Corrupted folk creatures — manananggal splitter, tiyanak bait, kapre
smoke — remain available as regional skin variants of the same chassis.)

### Boss anomalies — named after the real issues

Each campaign arc's boss is its **flagship anomaly**, named after a
recognizable category of PH governance scandal (the category, never a
person or case participant):

| Boss | The anomaly | Kind | Signature mechanic |
|---|---|---|---|
| **Troll Farm** | Paid disinformation | Ranged summoner | Endless Troll Bot swarms until the farm falls |
| **Ghost Flood Control** | Ghost flood-control projects | Ranged stealth | **Floods the path in surges** — enemies ride the water faster; itself a ghost, untargetable until revealed |
| **Pork Barrel** | Discretionary-fund abuse | Melee tank | Bloated hog of funds — **devours gold pickups on the field**, growing tougher with each one eaten |
| **Vote Buying** | Election money | Ranged | Scatters **fake gold that subtracts when collected** — distrust the freebies |
| **Nepotism** | Appointed relatives | Summoner | Continuously surrounds itself with respawning appointee Shieldbearers — kill the source |
| **Wang-Wang** | VIP entitlement | Melee rusher | Convoy sirens: speed aura, escorts rush the Barrier in bursts |
| **Budget Insertion** | Midnight insertions | Stealth elite | Massive HP smuggled quietly down a side lane — catch it before it slips through |
| **Smuggling** | Customs leakage | Melee | Drains your economy while alive; killing it returns everything with interest |
| **The Dynasty** | Political dynasties | 3-phase apex | Kill it and a relative takes over — bruiser → schemer → heir, three generations |
| **Ang Sistema** *(finale — proposed)* | The system that lets them all thrive | Horde convergence | Not a creature — the final gauntlet: **every defeated anomaly returns at once**, with The Dynasty at the horde's heart. The full alliance and every unlocked Act against everything you've already beaten |

Boss rules unchanged: path-walkers, melee hit the Barrier on arrival /
ranged bombard from partway, hard-CC immune, telegraphed weaknesses,
skills only affect their own side or the Barrier.

## Recruitment — inspiration only

Defeat-to-recruit retired along with the meme tier. The roster grows two
ways:

- **Story milestones (free)**: save the barangay → the Teacher joins;
  cleanse an agency arc → its honest worker (Auditor, and future agency
  heroes) joins. Recruitment scenes are story beats.
- **Sari-Sari Store (Hope)**: some workers answer the call when the
  movement can support them — unlockable in player-chosen order with the
  per-run currency (`docs/PROGRESSION.md`). Earned in-game only; heroes
  are never sold for real money (rule pending owner confirmation).

Corruption anomalies are never recruitable. Mastery: replaying cleansed
arcs against remixed waves upgrades heroes permanently.

## Bayanihan Acts — selectable barrier skills

The Barrier has a skill slot (a second unlocks late-campaign). Equip one
Act pre-battle; it charges from Voices (kills) and fires manually:

| Act | Effect |
|---|---|
| **People Power** | Crowd surge — mass knockback down the path |
| **Batingaw** | Church bell tolls — mass stun (bosses resist) |
| **Baha ng Tulong** | Flood of aid — large Barrier heal |
| **Boses ng Bayan** | All heroes gain attack speed |
| **Salu-Salo** | Community feast — gold windfall |
| **Piyesta** | Voices surge — next Act charges much faster |

Acts unlock via campaign milestones and the Store. People Power is the
first, earned in Act 1 — it's the story's thesis.

## Character & content rules (binding)

- **No real persons**: no officials, celebrities, influencers,
  contractors, or lookalikes — visually, vocally, or by name. Anomalies
  are categories; heroes are archetypes of professions.
- **Workers are portrayed with warmth and dignity** — they're the
  heroes; comedy never comes at their expense. (Humor lives in enemy
  satire and hero personality, not mockery.)
- **Voice lines**: original writing performed by voice actors; no real
  recorded clips; no directed imitations of specific people. Short skill
  barks and chants are encouraged — they're original.
- **Agencies**: real names allowed under the binding help-the-agency
  conditions in `docs/PROGRESSION.md` (no seals/logos, institution
  always honorable, disclaimer, lawyer pass pre-release).
- All character assets (sprites, cut-ins, `voiceLines[]`) are **data**
  on definitions — swappable without code changes.

## Data model (target shape)

```ts
interface HeroDefinition {
  id: HeroId;
  name: string;
  profession: string;
  damageType: DamageType;
  attackKind: 'melee' | 'ranged';   // wall-guard vs long reach
  attackStyle: 'projectile' | 'melee-cleave' | 'beam' | 'lobbed' | 'pierce' | 'chain' | 'trap' | 'vortex' | 'linear-wave' | 'summoner' | 'boomerang';
  range: number;
  skill: HeroSkillDefinition;        // cooldown, effect, cut-in, bark
  passive?: HeroPassiveDefinition;
  voiceLines: VoiceLineRef[];
  // enhancements attach at runtime (per-battle), not on the definition
}

interface EnhancementDefinition {
  id: EnhancementId;
  category: 'stat' | 'projectile' | 'elemental' | 'skill' | 'combat'
          | 'squad' | 'instant';
  rarity: 'common' | 'rare' | 'epic';
  target: 'chosenHero' | 'global';
  maxStacks: number;
  effect: EnhancementEffect;        // discriminated union per category
}

interface AnomalyDefinition {          // extends the enemy chassis system
  id: AnomalyId;
  chassis: ChassisId;
  resistances?: Partial<Record<DamageType, number>>;
  armor?: number;
  tags?: EnemyTag[];
}

interface BossDefinition {
  maxHp: number;
  speed: number;
  attackKind: 'melee' | 'ranged';
  // melee: barrierDamage on arrival
  // ranged: bombardDamage + bombardIntervalMs within bombardRange of the end
  resistances: Partial<Record<DamageType, number>>;
  skills: BossSkillDefinition[];  // own-side/barrier only, never units
}
```

## Rollout dependencies

1. Damage/ailment phases 1–2 (`docs/DAMAGE_AND_AILMENTS.md`) — heroes
   are the type carriers now.
2. Portrait layout confirmation → `level.ts` templates + pedestal row.
3. In-battle upgrade economy (`core/` module, unit-tested) — replaces
   the tower-placement economy.
4. Enemy info card — squad selection depends on it.
5. Meta-progression (persistent unlocks, Hope, mastery).

The existing prototype's three towers serve as hero stand-ins for
testing until real hero kits land; its waves/economy/targeting code
carries forward unchanged.
