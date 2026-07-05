# Nepotism — Boss Art Prompt Pack

Ready-to-paste prompts for generating **Nepotism** (`boss_nepotism`), an Act boss
anomaly. This pack **mirrors the enemy template**
(`docs/references/grunt_prompt_pack.md`) with the **boss differences**:

- Drawn **larger, more detailed, and more grotesque** than a minion.
- Phase 2 has **6 rows** — a 6th **`cast`** row (EXACTLY 3 frames) is inserted
  between `attack` and `stunned`, showing the boss channelling its `activeSkill`
  **Appoint Shieldbearer** (`summonShieldbearer`).
- Still **TOP-FRONT** (high-angle front 3/4), still **no anime skill cut-in**
  (that's a hero-only feature — see `docs/CHARACTER_VISUAL_PROMPT_GUIDE.md`).

> Run these in an image-capable Claude/Gemini (not the coding CLI). Always
> **attach the previous phase's output** as reference before generating the next.

**Binding rule:** bosses personify a *category of PH governance anomaly* — never
a real official, party, or contractor. This one is **appointed relatives
(nepotism)**. Design a grotesque concept-creature, not a person
(`docs/WORLD_AND_HEROES.md`).

---

## Nepotism Visual Bible (locked — keep identical across every phase)

No portrait exists — this bible is **synthesized** from its role (a summoner boss
that **continuously summons respawning appointee Shieldbearers**) and its
`balance.ts` color anchor `#9333ea` (dynastic royal purple). Do not drift:

- **What:** Nepotism — a bloated, throne-bound **patriarch-tree creature**: a
  robed dynastic figure whose lower body has fused into a grasping **family-tree
  of appointment**, endlessly budding faceless relative-puppets it hands official
  sashes and shields to. The appointment of unearned kin made monstrous.
  Grotesque, smug, many-armed — a concept-creature, not a human, and no real
  person.
- **Body:** a swollen robed torso atop a gnarled **tree-trunk lower half** whose
  roots and branches sprout half-formed **appointee puppets** on strings, many
  ringed hands clutching rubber-stamps and sashes, an oversized medallion chain.
- **Signature read-at-a-glance cue:** the **family-tree lower body budding
  faceless sash-wearing appointee puppets** + the ringed grasping hands — its #1
  silhouette read, and it must survive every angle.
- **Face:** a jowly, entitled sneer — half-lidded eyes, a smug up-tilted chin, a
  gaudy crown-of-office slipping over one brow.
- **Style:** High-contrast cel-shaded vector art, flat colors, bold clean outer
  strokes, 2D mobile game asset (Persona 5 UI pop × Hades silhouette), plain
  solid/white background, isolated character. Reads clearly at small size even
  though it is boss-scale.
- **Palette:** dynastic royal purple (anchor `#9333ea`), gold medallion trim,
  aged-wood trunk brown, official-sash red, puppet-cloth grey. (Any engine tint
  is only a fallback for missing sprites — the real sheet uses its true colors,
  no flat wash.)

---

## Phase 1 — Base Concept + Camera Angles (do this first)

**Prompt:**
> Generate a comprehensive 2D character turnaround reference sheet for a mobile
> game BOSS enemy creature named Nepotism.
>
> **Creature:** A bloated throne-bound patriarch-tree creature — a swollen robed
> torso atop a gnarled **tree-trunk lower half** whose roots and branches sprout
> half-formed faceless **appointee puppets on strings** (each draped in an
> official sash and clutching a small shield), many ringed hands holding
> rubber-stamps and sashes, a gaudy medallion chain, and a jowly entitled sneer
> under a slipping crown-of-office. Grotesque, smug, many-armed, BOSS-SCALE (much
> larger and more detailed than a minion) — a concept-creature, not a human, and
> not any real person.
>
> **Style:** High-contrast cel-shaded vector art, flat colors, bold clean outer
> strokes, 2D mobile game asset (Persona 5 UI pop crossed with Hades
> silhouettes). Plain solid background, isolated creature.
>
> **Required Layout:** Show the exact same creature in a row from these angles.
> Proportions, the tree-trunk lower body, the budding appointee puppets, and the
> ringed hands must remain identical in every view:
> 1. **Front View:** looking directly at the camera.
> 2. **Side Profile:** 90-degree turn.
> 3. **Rear View (straight back):** facing away — we see its robed back, the
>    trunk, and branches with puppets hanging behind it.
> 4. **TOP-FRONT (high-angle front 3/4) — THE GAMEPLAY VIEW:** camera high above
>    and in front, tilted (NOT flat zenith). We see the top of its head plus its
>    sneering face, the robed torso, the budding puppets, and its ringed hands as
>    it advances toward the viewer. This is the angle its in-game sprites are
>    drawn from — make it clean and clear.
> 5. **TOP-BEHIND (high-angle rear 3/4):** camera high above and behind, tilted;
>    top of head, shoulders, and the branching back.
>
> Ensure the tree-trunk lower body, the faceless sash-wearing appointee puppets,
> the ringed grasping hands, and the crown-of-office are clearly readable in all
> five views.

*Save the result as `docs/references/boss_nepotism_base_turnaround.png`. This is
the base reference for the next phase.*

---

## Phase 2 — Animated Boss Sprite Sheet (TOP-FRONT, 6 rows)

**Attach `boss_nepotism_base_turnaround.png` first**, then:

> Attached is the base turnaround sheet for the Nepotism BOSS anomaly. Generate a
> strictly formatted 2D sprite sheet for a top-down auto-battler.
>
> **Crucial Perspective:** Nepotism is an Enemy boss. The camera is a high
> top-down oblique above and behind the player's line, so it faces TOWARD the
> camera as it bears down on the barrier. **ALL frames must be drawn from a
> HIGH-ANGLE FRONT VIEW (top-front, front 3/4)** — top of head, plus the sneering
> face, the robed torso, the tree-trunk body, and its ringed hands. Not a flat
> zenith, no side profiles, no low angles. Draw it BOSS-SCALE: larger, more
> detailed, and more menacing than a minion.
>
> **Style & Formatting:** Match the cel-shaded vector style of the reference
> exactly (tree-trunk lower body, appointee puppets, ringed hands, crown-of-
> office). Lay out as horizontal rows, one animation per row, each frame in its own evenly-spaced cell, non-overlapping, with consistent size and centering.
>
> **OUTPUT RULES (critical — the last generation drew these by mistake):** Fully **transparent** background — NO white fill. Do NOT draw any grid lines, cell borders, boxes, guide lines, or separators. Do NOT render any text, row names, labels, numbers, or captions anywhere in the image. Output ONLY the character art, arranged in evenly-spaced **invisible** cells.
>
> **MANDATORY LAYOUT — exactly 6 rows, in this exact top-to-bottom order:**
> 1. **`march`** — EXACTLY 4 frames: a slow, imperious advance toward the viewer,
>    the trunk-body dragging, puppets swaying (front view).
> 2. **`attack`** — EXACTLY 3 frames: **slamming a ringed fist / rubber-stamp down
>    on the barrier** to "appoint" it away. Frame 2 is the clear impact frame
>    (front view).
> 3. **`cast`** — EXACTLY 3 frames: channelling its signature skill **Appoint
>    Shieldbearer** — raising a stamp and sash high as its branches **bud and
>    birth a new faceless shield-carrying appointee puppet** that steps forward to
>    guard it. This is the telegraphed boss summon; make it grand and dramatic
>    (front view).
> 4. **`stunned`** — EXACTLY 2 frames: dazed, crown askew, **spinning stars /
>    dangling cut puppet-strings** circling its head, mid-stumble (front view).
> 5. **`celebrate`** — EXACTLY 2 frames: it overran the line — raising both ringed
>    hands in gloating triumph as puppets cheer around it (front view). Plays when
>    the player loses.
> 6. **`death`** — EXACTLY 3 frames: **the trunk splitting and the puppets
>    collapsing off their strings** as the robed figure crumbles into wood-splinter
>    and torn sashes (front view).
>
> Verify every frame in every row is present in the final grid.

*Export from Aseprite as `boss_nepotism.png` + `boss_nepotism.json` (JSON Hash or
Array), with the tag names above spelled exactly: `march attack cast stunned
celebrate death`.*

---

## Export & QA reminders

- Transparent background, consistent frame size, no clipped hands/puppets.
- Tag names MUST match the engine states 1:1 (`march attack cast stunned
  celebrate death`) — see the checklist in
  `docs/CHARACTER_VISUAL_PROMPT_GUIDE.md` (Phase 4).
- Confirm the `cast` row is EXACTLY 3 frames and clearly depicts **Appoint
  Shieldbearer** (the puppet summon).
- Drop finished files in `public/assets/enemies/`: `boss_nepotism.png`,
  `boss_nepotism.json`.
- Audio pairing (`docs/ART_AND_AUDIO_GUIDELINES.md`): heavy robed footsteps and a
  smug arrogant laugh, with a creaking wood-and-string birth on the `cast`.

## Integration status

**The engine side is already done** — `EnemyModel` is `Sprite`-based, every state
routes through the sprite-sheet path with a tween fallback, an enemy's atlas key
defaults to its `id`, and `GameScene.createEnemyAnimations()` auto-wires any enemy
atlas that loads. Until the art exists Nepotism renders the tinted `enemy-base`
placeholder (no broken texture) and still animates all states via tweens.

**To light up the real art, once you've generated the sheet:**
1. Drop `boss_nepotism.png` + `boss_nepotism.json` into `public/assets/enemies/`.
2. In `GameScene.preload()`, uncomment:
   `this.load.aseprite('boss_nepotism', '/assets/enemies/boss_nepotism.png', '/assets/enemies/boss_nepotism.json');`
   (atlas key defaults to the enemy `id` = `boss_nepotism`). That's it — the
   states, including the boss `cast`, play from real frames automatically.
