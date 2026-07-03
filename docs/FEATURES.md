# Features Roadmap

Status of the base prototype, plus the backlog for what comes next. Keep
this updated as things ship — it's the source of truth for "what's actually
built" vs. "what's planned," not the commit history.

## Done (base prototype)

- [x] Fixed-path map with fixed build slots
- [x] Three tower types (Archer, Cannon, Frost — Frost currently deals damage
      only, no slow effect yet, see below)
- [x] Three enemy types (Grunt, Runner, Brute) with distinct speed/HP/reward
- [x] Five hand-authored waves, player-triggered start
- [x] "First" targeting (furthest along path, in range)
- [x] Gold economy: earn on kill, spend on towers
- [x] Lives: lose a life per leaked enemy, game over at 0
- [x] Win condition: all waves cleared and board empty
- [x] React HUD: gold/lives/wave display, tower selection, start wave, restart
- [x] Responsive canvas (Phaser `FIT` scale mode), mobile-sized touch targets
- [x] Capacitor config in place (native projects not yet generated)

## Near-term (fleshes out the core loop)

- [ ] **Damage types & ailments, phases 1–2** — full design in
      `docs/DAMAGE_AND_AILMENTS.md` (10 damage types, 12 ailments with
      per-ailment proc rules, decided 2026-07-03). Phase 1 is neutral
      plumbing (`damageType` on units, `resistances` on enemies,
      `core/Damage.ts`); phase 2 ships the first riders (Slow, Burn, Stun)
      and `core/Ailments.ts`. Carriers are heroes per
      `docs/WORLD_AND_HEROES.md` (Sorbetero, Grill Vendor, Journalist)
- [ ] **Enemy info card** — tap an enemy (or wave-preview row) to see stats,
      weaknesses, resistances, and ailment immunities; required by phase 3
      of the damage-type system at the latest
- [ ] **In-battle hero upgrades** — kills earn gold; gold buys per-battle
      hero tiers (Lv1→Lv3), the core session economy per
      `docs/PROGRESSION.md` (replaces tower placement/upgrade/sell)
- [ ] **Range indicator on tap/hold** (touch) and hover (desktop) for
      deployed heroes, per `docs/DESIGN_GUIDELINES.md`
- [ ] **Wave preview** — show upcoming wave composition before the player
      commits to Start Wave
- [ ] **Sound effects & music** — currently silent
- [ ] **Real art** — currently placeholder circles/rectangles; swap in
      sprites once art direction is settled without changing entity logic
      (this is why rendering is a thin layer over `core/` data)

## Mid-term (depth)

- [ ] **Multiple levels** — `src/game/data/level.ts` currently hardcodes one
      path/slot layout; needs a level registry + level-select screen
- [ ] **More targeting strategies** — closest, strongest, weakest, selectable
      per hero
- [ ] **Damage types & ailments, phases 3–4** — water/Wet synergies, then
      wind/earth/holy/dark and the remaining ailments (poison, bleed, rot,
      sleep, curse, knockback, armor shred), each arriving with its carrier
      hero and a matching enemy — see `docs/DAMAGE_AND_AILMENTS.md`
- [ ] **Enemy special abilities** — armor and flying are specified in
      `docs/DAMAGE_AND_AILMENTS.md` (data model: `armor`, `tags`); shields
      (must be broken before HP damage applies) and split-on-death remain
      to be designed
- [ ] **World & hero system** — Eden + 4 ally slots, worker heroes with
      skills (no volunteers, no meme tier), horde of bad-governance
      anomaly enemies with issue-named bosses, inspiration-based
      recruitment, Bayanihan Acts, archipelago campaign map. Full design
      in `docs/WORLD_AND_HEROES.md`; bosses are anomaly path-walkers that
      pressure the barrier — player units can never be hit
- [ ] **Campaign & economy systems** — institutional-ladder campaign
      (barangay → LGU → national agencies), reusable stage
      templates/skins/wave budgets, per-run Hope currency + Sari-Sari
      Store, hybrid support heroes. Full design in `docs/PROGRESSION.md`
- [ ] **Persistent meta-progression** — unlock heroes/levels across sessions,
      local storage first, then account-based sync
- [ ] **Pause / speed-up controls** (1x/2x/3x) — common QoL for the genre once
      the core loop is validated

## Later (native/platform features — why we chose Capacitor)

- [ ] Generate `ios/`/`android/` native projects, real app icons/splash
- [ ] Haptic feedback on hero skills / enemy kills (`@capacitor/haptics`)
- [ ] Push notifications for re-engagement (`@capacitor/push-notifications`)
- [ ] In-app purchases for cosmetics/currency
- [ ] Cloud save sync
- [ ] Leaderboards / daily challenge mode

## Explicitly out of scope for now

- PvP / multiplayer — nothing in the architecture blocks it later, but it's
  a different networking model and shouldn't shape early decisions
- 3D rendering — genre and stack are committed to 2D (see `ARCHITECTURE.md`)
- Steam/desktop release — technically possible via Electron since the core
  is a web app, but not a current goal
