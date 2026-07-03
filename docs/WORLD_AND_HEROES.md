# World, Story & Hero System

Design spec for the game's setting, characters, and battle systems.
Simplified per owner decisions (2026-07-03, superseding the earlier
meme-hero/two-arm-machine design):

- The base defended is **the Barrier of the Philippines**. "Lives" =
  barrier integrity.
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
2. **Deploy**: the full squad takes the field from wave 1 on fixed
   positions. Lineup order matters — adjacent heroes buff each other
   (**Bayanihan adjacency**).
3. **Fight**: enemies walk the path toward the Barrier. Heroes attack
   automatically (targeting per `core/Targeting.ts`); each hero also has
   a **skill** — manually triggered, on cooldown, with a voiced bark and
   cut-in.
4. **Grow mid-battle**: kills earn **gold**; gold buys **hero upgrade
   tiers during the battle** (Lv1→Lv2→Lv3: stronger attack, wider range,
   upgraded skill). Upgrade order is the in-battle strategy. This
   replaces both the volunteer economy and the earlier kill-drop
   arrival system — kills still convert directly into visible power.
5. **Rally**: kills also fill the **Voices meter**, which charges the
   equipped Bayanihan Act (People Power pushback, Batingaw stun, Baha ng
   Tulong barrier heal, Boses ng Bayan attack-speed surge…). Fire it at
   the right moment.
6. **Win/lose**: clear all waves before the Barrier falls.

### Field layout — portrait barrier defense (recommended, pending owner confirmation)

Enemies descend from the top along a path template toward the **Barrier
spanning the bottom**; the squad stands on **fixed pedestals behind the
Barrier**, firing projectiles over it. A hero's `range` = how far
up-screen they reach; "melee" workers are short-range wall-guards with
the heaviest hits. Portrait, one-handed, thumb-friendly; sessions 3–5
minutes. The current landscape winding-path prototype remains the test
bed until this is confirmed — waves, economy, targeting, and damage
systems are layout-agnostic.

## The heroes — workers with skills

All heroes follow the **every-hero-attacks** rule (no pure supports; a
support-leaning worker still deals ~50–60% of a DPS worker's damage —
squad math stays healthy in 5 slots). Damage types per
`docs/DAMAGE_AND_AILMENTS.md`; every type's carrier is a hero now.

| Hero | Worker | Type | Attack | Signature skill / passive |
|---|---|---|---|---|
| **Eden** | Community organizer (protagonist, permanent leader) | Physical | Rallying sling | Skill: Rally — brief squad-wide buff. Passive: adjacency bonuses she anchors |
| **Auditor** | Government auditor (honest insider) | Magic | Stamp slam — **ignores armor** | Reveals ghosts; pops inflated HP padding ("audited!") |
| **Journalist** | Field reporter | Lightning | Camera-flash burst | Reveal aura; skill: Breaking News — chain-lightning + stun chance |
| **Nurse** | Public health nurse | Holy | Syringe darts | Skill: **Barrier regeneration** — the only healing in the game |
| **Teacher** | Public school teacher | Physical | Chalk throw | Passive: **marks** enemies — marked take bonus damage from everyone |
| **Fisherfolk** | Fisher | Water | Net throw — damage + group slow + **Wet** | Skill: Lambat — wide net, mass Wet setup |
| **Farmer** | Rice farmer | Earth | Scythe sweep (splash) | Armor shred; passive: harvest — kills nearby yield bonus gold |
| **Jeepney Driver** | Driver | Wind | Horn blast — knockback | Passive: his **route** — a lane/path corridor where allies attack faster |
| **Sorbetero** | Dirty-ice-cream vendor | Frost | Ice scoop shots — **Slow** | Skill: Deep freeze scoop — Freeze chance on Wet enemies |
| **Grill Vendor** | Street BBQ vendor | Fire | Ember skewers — **Burn** | Skill: Ihaw Rain — burn cone across a lane |
| **OFW** | Overseas worker | Physical | Balikbayan-box lob (splash) | Passive: remittance — steady bonus gold trickle |
| **Student** | Working student | Physical | Slingshot | Passive: **grows** — upgrade tiers cost less and stack higher for them |
| **Whistleblower** | The one who spoke up (late unlock) | Dark | Dossier throw — **Curse** | Skill: Exposé — mass curse, everything takes amplified damage |

All 10 damage types have a carrier. Kits, numbers, and skill cooldowns
are `balance.ts` data.

## The horde — anomalies of bad governance

Enemies reuse the **chassis × skin** engine (`docs/PROGRESSION.md`):
behavior defined once per chassis, anomalies as skins.

### Minion anomalies

| Anomaly | Chassis | Behavior → mechanic |
|---|---|---|
| Troll Bot | Swarmling | Fake-news spam in packs |
| Fixer | Runner | Rushes paperwork past you |
| Ghost Employee | Stealther | Invisible until revealed by truth heroes (Auditor/Journalist) |
| Kickback Courier | Runner | **Steals gold** as it walks; kill before it exits to recover with interest |
| Red Tape | Brute | Stacking paperwork armor (earth/shred counters); slows gold income while alive |
| Epal Tarp | Elite | Billboard mini-boss; morale aura buffs nearby anomalies |
| Fake News Blimp | Flyer | Immune to earth, weak to wind |
| The Overpriced | Shieldbearer | Hugely inflated HP bar; an audit pops the padding |

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
  range: number;
  upgradeTiers: HeroTierDefinition[]; // in-battle Lv1..Lv3 costs/stats
  skill: HeroSkillDefinition;         // cooldown, effect, cut-in, bark
  passive?: HeroPassiveDefinition;
  voiceLines: VoiceLineRef[];
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
