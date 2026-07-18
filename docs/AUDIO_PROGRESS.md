# Audio Progress Tracker

Living checklist + per-entity sound inventory for the audio system. The **creative
spec** (tone, Tagalog voice lines, enemy foley, BGM direction) lives in
`ART_AND_AUDIO_GUIDELINES.md §5`; **this** file tracks *what's built and what's
still missing an asset*. Update the tables as files land.

Status legend: ✅ done · 🟡 wired, placeholder/needs real asset · ⬜ not started.

---

## System overview (how it fits together)

| Piece | File | Role |
|---|---|---|
| Engine | `src/game/core/AudioManager.ts` | Singleton wrapping Phaser's WebAudio sound manager. Buses (master/sfx/music/voice), mute, localStorage persistence, music crossfade. |
| Catalog | `src/game/data/soundRegistry.ts` | Semantic keys → files; per-hero/enemy maps; `preloadAudio()`; `AUDIO_MANIFEST` (files that exist). |
| React hook | `src/ui/hooks/useAudio.ts` | Reactive settings + `playUi()`. The reusable "use component". |
| Settings UI | `src/ui/components/AudioSettings.tsx` | Mixer overlay (sliders + mute), opened from the 🔊 button in `App.tsx`. |
| Boot wiring | `src/ui/GameCanvas.tsx` | `AudioManager.registerSoundManager(game.sound)` after the game boots. |
| Preload | `src/game/scenes/GameScene.ts` | `preloadAudio(this)` in `preload()`. |

**Adding a sound = a data edit:** drop the file in `public/assets/...`, add a line to
`AUDIO_MANIFEST` (and, for a hero/enemy clip, fill its map entry). No engine changes.

---

## Milestones

### Milestone 1 — Foundation + in-game SFX
- [x] `AudioManager` engine (buses, mute, persistence, crossfade)
- [x] `soundRegistry` catalog + `preloadAudio`
- [x] `useAudio` hook
- [x] `AudioSettings` panel + global 🔊 entry point
- [x] Register sound manager on boot; preload wired
- [x] All combat/UI SFX routed through the mixer (per-hero attack, per-enemy hit/death, barrier, victory/defeat, UI)
- [x] Unit tests (mixer math, settings, manifest/resolvers)
- [ ] **Replace the 8 silent placeholder `.mp3`s with real recordings** (see *SFX sourcing* below)
- [ ] Add a `heal.mp3` and uncomment `SFX.heal` in the manifest

### Milestone 2 — Boss soundtrack (Souls-like, theatrical)
**Design decision: only bosses have background music** (no battle/prep beds).
- [x] Boss trigger wired in `GameScene.updateBossMusic()` — fades `bossThemeForAct(act)`
      in while any `boss_` enemy is alive, out when the last one dies; also stops on
      `endBattle` / `resetGame`. Plays silence until the file is added.
- [ ] **Add `public/assets/music/boss-default.mp3`** and uncomment `[MUSIC.bossDefault]`
      in `AUDIO_MANIFEST` — that's all that's needed for a default boss theme.
- [ ] (Optional) Per-act themes: add `boss-act1..4.mp3` / `boss-finale.mp3` + uncomment.
- [ ] Generate themes via MusicFX/Lyria (prompts below).

### Milestone 3 — Voice lines (later)
- [ ] Fill `HERO_SFX[*].voice` files; trigger on skill cut-in
- [ ] Generate 20 Tagalog lines (AI TTS, e.g. ElevenLabs); add to manifest

---

## Core SFX inventory

| Key | File | Fires when | Status |
|---|---|---|---|
| `sfx-btn-press` | `sounds/btn-press.mp3` | UI button press | 🟡 |
| `sfx-shoot` | `sounds/shoot.mp3` | Any hero basic attack (fallback) | 🟡 |
| `sfx-enemy-hit` | `sounds/enemy-hit.mp3` | Enemy takes damage (fallback) | 🟡 |
| `sfx-enemy-die` | `sounds/enemy-die.mp3` | Enemy dies (fallback) | 🟡 |
| `sfx-barrier-hit` | `sounds/barrier-hit.mp3` | Morale shield damaged | 🟡 |
| `sfx-barrier-break` | `sounds/barrier-break.mp3` | Morale shield broken | 🟡 |
| `sfx-victory` | `sounds/victory.mp3` | Stage cleared | 🟡 |
| `sfx-defeat` | `sounds/defeat.mp3` | Barrier lost | 🟡 |
| `sfx-heal` | *(pending)* | Shield healed (Nurse etc.) | ⬜ |

> The 🟡 files currently exist but are **silent 44-byte placeholders** from
> `create_sounds.cjs`. Replacing a file needs no code change. `create_sounds.cjs`
> is kept only to regenerate placeholders; delete it once real SFX are in.

---

## Per-hero sounds

Voice keys are pre-registered (`HERO_SFX[*].voice`) for Milestone 3. `attack`/`skill`
are blank = using the generic `sfx-shoot` fallback until a bespoke clip is authored.
Tagalog lines are canonical in `ART_AND_AUDIO_GUIDELINES.md §5`.

| Hero | Skill | Attack SFX | Skill SFX | Voice line | Status |
|---|---|---|---|---|---|
| Eden | Rally | fallback | ⬜ | `voice-eden-rally` | 🟡 |
| Teacher | Recess! | fallback | ⬜ | `voice-teacher-recess` | 🟡 |
| Student | Cramming | fallback | ⬜ | `voice-student-cramming` | 🟡 |
| Jeepney Driver | Barya Lang Po | `sfx-jeepney-wrench` ✅ | `sfx-jeepney-barya` ✅ | `voice-jeepney-barya` | 🟡 |
| Fisherfolk | Lambat | fallback | ⬜ | `voice-fisherfolk-lambat` | 🟡 |
| Street Sweeper | Dust Storm | fallback | ⬜ | `voice-sweeper-duststorm` | 🟡 |
| Taho Vendor | Hot Syrup | fallback | ⬜ | `voice-taho-hotsyrup` | 🟡 |
| Nurse | Vaccine Drive | fallback | ⬜ | `voice-nurse-vaccine` | 🟡 |
| Construction Worker | Yero Barricade | fallback | ⬜ | `voice-construction-barricade` | 🟡 |
| Call Center Agent | Escalate | fallback | ⬜ | `voice-callcenter-escalate` | 🟡 |
| Security Guard | Flashlight | fallback | ⬜ | `voice-security-flashlight` | 🟡 |
| Farmer | Harvest | `sfx-farmer-vine` ✅ | `sfx-farmer-tree-grow` + `sfx-farmer-tree-pulse` ✅ | `voice-farmer-harvest` | 🟡 |
| Fishball Vendor | Spicy Sauce | fallback | ⬜ | `voice-fishball-spicy` | 🟡 |
| Sales Lady | Closing Sale | fallback | ⬜ | `voice-saleslady-closing` | 🟡 |
| Sorbetes Vendor | Dirty Ice Cream | `sfx-sorbetes-throw` ✅ | `sfx-sorbetes-plant/-beep/-burst` ✅ | `voice-sorbetes-dirty` | 🟡 |
| Electrician | Rolling Blackout | fallback | ⬜ | `voice-electrician-blackout` | 🟡 |
| Baker | Dough Knead | fallback | ⬜ | `voice-baker-dough` | 🟡 |
| Traffic Enforcer | STOP! | fallback | ⬜ | `voice-traffic-stop` | 🟡 |
| Plumber | Flush | fallback | ⬜ | `voice-plumber-flush` | 🟡 |
| Delivery Rider | Kamote Riders | fallback | ⬜ | `voice-rider-deliver` | 🟡 |

## Per-enemy sounds

Minions/mid-tier use the generic hit/death fallbacks. Bosses have a `skill` cue key
reserved for their channel/wind-up.

| Enemy | Hit | Death | Skill cue | Status |
|---|---|---|---|---|
| grunt / runner / brute | fallback | fallback | — | 🟡 |
| ghost_employee, bribery, epal, the_overpriced, kickback_courier | fallback | fallback | — | 🟡 |
| shell_company, crony_bodyguard, hoarder, land_grabber, tender_rigger, red_tape | fallback | fallback | — | 🟡 |
| boss_pork_barrel | fallback | fallback | `sfx-boss-devour` | ⬜ |
| boss_wang_wang | fallback | fallback | `sfx-boss-siren` | ⬜ |
| boss_troll_farm | fallback | fallback | `sfx-boss-fakenews` | ⬜ |
| boss_vote_buying | fallback | fallback | `sfx-boss-scattergold` | ⬜ |
| boss_ang_sistema (final) | fallback | fallback | `sfx-boss-resurrect` | ⬜ |
| other bosses (flood_control, nepotism, budget_insertion, smuggling, dynasty_1-3) | fallback | fallback | — | ⬜ |

## Music

| Key | File | Used for | Status |
|---|---|---|---|
| `music-boss-default` | `music/and ` | **Default boss theme** (trigger wired) | 🟡 needs file |
| `music-boss-act1..4` | `music/boss-act1..4.mp3` | Per-act boss themes (optional) | ⬜ |
| `music-boss-finale` | `music/boss-finale.mp3` | `boss_ang_sistema` signature theme | ⬜ |

> Battle/prep beds and victory/defeat music tracks are **out of scope** — only bosses
> get background music per the design decision.

---

## SFX sourcing (Milestone 1 finish)

No audio can be generated by the coding agent. Source CC0/royalty-free clips or
synthesize, then drop them in `public/assets/sounds/` under the exact filenames above:
- **freesound.org** (filter CC0), **mixkit.co**, **kenney.nl/assets** (game SFX packs).
- Keep clips short (< 400 ms for hits, < 1 s for stingers), normalized, mono, `.mp3`.
- Match the comedic Metro-Manila-street tone in `ART_AND_AUDIO_GUIDELINES.md §5`
  (e.g. `sfx-btn-press` = heavy tape-recorder button / document stamp).

## Boss music generation (Milestone 2) — MusicFX / Lyria prompt specs

Author each as a **seamless loop** (60–120 s), export `.mp3`, place in
`public/assets/music/`, add to `AUDIO_MANIFEST`. Aim for the Elden Ring / Dark Souls
"a whole theater erupts" feel — grand, dread-laden, choral.

- **Act 1–4 boss (generic dread):** *"Slow, ominous 85–95 BPM orchestral boss battle
  theme. Massive layered choir 'oohs', pounding taiko + timpani, low brass swells,
  tremolo strings, sense of dread and grandeur. Seamless loop, cinematic, no vocals in
  a real language."*
- **Filipino flavor (weave into any act):** add *"...with kulintang gongs and
  agung woven into the percussion for a Filipino epic feel."*
- **Final boss `boss_ang_sistema`:** *"Climactic, terrifying final-boss theme, full
  orchestra + operatic choir chanting, organ, relentless double-timpani, key change
  into a triumphant-yet-menacing chorus. Elden Ring scale. Seamless loop."*
- **Battle bed (non-boss):** *"Upbeat fast-paced street-protest percussion, Ati-Atihan
  drumming energy + electric guitar, defiant and hopeful, loopable game background
  music, instrumental."*
- **Prep bed:** *"Tension-building lo-fi beat with distant Metro Manila traffic
  ambience, low-key, loopable."*
