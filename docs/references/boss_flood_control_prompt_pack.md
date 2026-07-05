# Ghost Flood Control — Boss Art Prompt Pack

Ready-to-paste prompts for generating **Ghost Flood Control** (`boss_flood_control`),
an Act boss anomaly. This pack **mirrors the enemy template**
(`docs/references/grunt_prompt_pack.md`) with the **boss differences**:

- Drawn **larger, more detailed, and more grotesque** than a minion.
- Phase 2 has **6 rows** — a 6th **`cast`** row (EXACTLY 3 frames) is inserted
  between `attack` and `stunned`, showing the boss channelling its `activeSkill`
  **Flash Flood** (`flood`).
- Still **TOP-FRONT** (high-angle front 3/4), still **no anime skill cut-in**
  (that's a hero-only feature — see `docs/CHARACTER_VISUAL_PROMPT_GUIDE.md`).

> Run these in an image-capable Claude/Gemini (not the coding CLI). Always
> **attach the previous phase's output** as reference before generating the next.

**Binding rule:** bosses personify a *category of PH governance anomaly* — never
a real official, party, or contractor. This one is **ghost flood-control
projects** (infrastructure paid for but never built). Design a grotesque
concept-creature, not a person (`docs/WORLD_AND_HEROES.md`).

---

## Ghost Flood Control Visual Bible (locked — keep identical across every phase)

No portrait exists — this bible is **synthesized** from its role (a ranged
stealth boss whose skill **floods the path in surges** so anomalies ride the
water faster) and its `balance.ts` color anchor `#0ea5e9` (flood-water sky blue).
Do not drift:

- **What:** Ghost Flood Control — a towering, **half-translucent phantom of
  unbuilt infrastructure**: the flood-control project that was funded but never
  poured, come back as a bloated water-ghost. Grotesque, eerie, dripping — a
  concept-creature, not a human.
- **Body:** a huge hunched torso built from **hollow ghost-concrete culverts and
  drainage pipes**, half of it see-through and glowing faintly, murky floodwater
  sloshing *inside* the transparent sections. Skeletal rebar juts from cracked
  "unfinished" edges. Great gushing pipe-stubs for arms.
- **Signature read-at-a-glance cue:** the **hollow flood-control pipe/culvert
  torso pouring dirty water** + the translucent ghost sheen — its #1 silhouette
  read, and it must survive every angle.
- **Face:** a hollow, drowned scowl — waterlogged eyes glowing pale cyan, mouth a
  dark culvert mouth spilling water, a mock "official signboard" tilted over one
  brow like a crooked crown.
- **Style:** High-contrast cel-shaded vector art, flat colors, bold clean outer
  strokes, 2D mobile game asset (Persona 5 UI pop × Hades silhouette), plain
  solid/white background, isolated character. Reads clearly at small size even
  though it is boss-scale.
- **Palette:** flood-water sky blue (anchor `#0ea5e9`), murky brown floodwater,
  wet ghost-concrete grey, pale-cyan spectral glow, rusted-rebar orange. (Any
  engine tint is only a fallback for missing sprites — the real sheet uses its
  true colors, no flat wash.)

---

## Phase 1 — Base Concept + Camera Angles (do this first)

**Prompt:**
> Generate a comprehensive 2D character turnaround reference sheet for a mobile
> game BOSS enemy creature named Ghost Flood Control.
>
> **Creature:** A towering, half-translucent phantom of unbuilt flood-control
> infrastructure — a bloated water-ghost whose torso is built from **hollow
> ghost-concrete culverts and drainage pipes**, half see-through with murky
> floodwater sloshing inside, skeletal **rebar** jutting from cracked unfinished
> edges, gushing pipe-stub arms, and a hollow drowned face with pale-cyan glowing
> eyes and a crooked official signboard tilted over one brow. Grotesque, eerie,
> BOSS-SCALE (much larger and more detailed than a minion) — a concept-creature,
> not a human, and not any real person.
>
> **Style:** High-contrast cel-shaded vector art, flat colors, bold clean outer
> strokes, 2D mobile game asset (Persona 5 UI pop crossed with Hades
> silhouettes). Plain solid background, isolated creature.
>
> **Required Layout:** Show the exact same creature in a row from these angles.
> Proportions, the pipe/culvert torso, the ghost translucency, and the rebar must
> remain identical in every view:
> 1. **Front View:** looking directly at the camera.
> 2. **Side Profile:** 90-degree turn.
> 3. **Rear View (straight back):** facing away — we see its back and water
>    draining off the culvert torso.
> 4. **TOP-FRONT (high-angle front 3/4) — THE GAMEPLAY VIEW:** camera high above
>    and in front, tilted (NOT flat zenith). We see the top of its head plus its
>    face, the pipe torso, and the gushing pipe-arms as it looms toward the
>    viewer. This is the angle its in-game sprites are drawn from — make it clean
>    and clear.
> 5. **TOP-BEHIND (high-angle rear 3/4):** camera high above and behind, tilted;
>    top of head, shoulders, and back.
>
> Ensure the hollow pipe/culvert torso, the floodwater inside the translucent
> sections, the rebar, and the ghostly glow are clearly readable in all five
> views.

*Save the result as `docs/references/boss_flood_control_base_turnaround.png`.
This is the base reference for the next phase.*

---

## Phase 2 — Animated Boss Sprite Sheet (TOP-FRONT, 6 rows)

**Attach `boss_flood_control_base_turnaround.png` first**, then:

> Attached is the base turnaround sheet for the Ghost Flood Control BOSS anomaly.
> Generate a strictly formatted 2D sprite sheet for a top-down auto-battler.
>
> **Crucial Perspective:** Ghost Flood Control is an Enemy boss. The camera is a
> high top-down oblique above and behind the player's line, so it faces TOWARD
> the camera as it bears down on the barrier. **ALL frames must be drawn from a
> HIGH-ANGLE FRONT VIEW (top-front, front 3/4)** — top of head, plus face, the
> pipe/culvert torso, and the pipe-arms. Not a flat zenith, no side profiles, no
> low angles. Draw it BOSS-SCALE: larger, more detailed, and more menacing than a
> minion.
>
> **Style & Formatting:** Match the cel-shaded vector style of the reference
> exactly (hollow pipe torso, floodwater inside translucent sections, rebar,
> ghost glow). Lay out as horizontal rows, one animation per row, each frame in its own evenly-spaced cell, non-overlapping, with consistent size and centering.
>
> **OUTPUT RULES (critical — the last generation drew these by mistake):** Fully **transparent** background — NO white fill. Do NOT draw any grid lines, cell borders, boxes, guide lines, or separators. Do NOT render any text, row names, labels, numbers, or captions anywhere in the image. Output ONLY the character art, arranged in evenly-spaced **invisible** cells.
>
> **MANDATORY LAYOUT — exactly 6 rows, in this exact top-to-bottom order:**
> 1. **`march`** — EXACTLY 4 frames: a heavy, sloshing walk cycle wading toward
>    the viewer, water dragging off its torso (front view).
> 2. **`attack`** — EXACTLY 3 frames: **swinging a gushing pipe-arm to smash the
>    barrier**, blasting a jet of dirty water. Frame 2 is the clear impact frame,
>    water bursting (front view).
> 3. **`cast`** — EXACTLY 3 frames: channelling its signature skill **Flash
>    Flood** — rearing back, culvert-mouth and torso pipes swelling and glowing
>    as it **summons a surge of floodwater to flood the path** (a rising wall of
>    water building at its feet). This is the telegraphed boss skill; make it
>    dramatic (front view).
> 4. **`stunned`** — EXACTLY 2 frames: dazed, the ghost body flickering and
>    sagging, **spinning stars / water droplets** circling its head, mid-stumble
>    (front view).
> 5. **`celebrate`** — EXACTLY 2 frames: it overran the line — rearing up in
>    triumph and **flooding forward**, water gushing (front view). Plays when the
>    player loses.
> 6. **`death`** — EXACTLY 3 frames: **collapsing and draining away into a puddle
>    of murky floodwater and crumbling ghost-concrete**, the glow guttering out
>    (front view).
>
> Verify every frame in every row is present in the final grid.

*Export from Aseprite as `boss_flood_control.png` + `boss_flood_control.json`
(JSON Hash or Array), with the tag names above spelled exactly:
`march attack cast stunned celebrate death`.*

---

## Export & QA reminders

- Transparent background, consistent frame size, no clipped limbs/pipes.
- Tag names MUST match the engine states 1:1 (`march attack cast stunned
  celebrate death`) — see the checklist in
  `docs/CHARACTER_VISUAL_PROMPT_GUIDE.md` (Phase 4).
- Confirm the `cast` row is EXACTLY 3 frames and clearly depicts **Flash Flood**.
- Drop finished files in `public/assets/enemies/`: `boss_flood_control.png`,
  `boss_flood_control.json`.
- Audio pairing (`docs/ART_AND_AUDIO_GUIDELINES.md`): heavy sluggish footsteps
  plus rushing/sloshing water for the `cast` surge.

## Integration status

**The engine side is already done** — `EnemyModel` is `Sprite`-based, every state
routes through the sprite-sheet path with a tween fallback, an enemy's atlas key
defaults to its `id`, and `GameScene.createEnemyAnimations()` auto-wires any enemy
atlas that loads. Until the art exists Ghost Flood Control renders the tinted
`enemy-base` placeholder (no broken texture) and still animates all states via
tweens.

**To light up the real art, once you've generated the sheet:**
1. Drop `boss_flood_control.png` + `boss_flood_control.json` into
   `public/assets/enemies/`.
2. In `GameScene.preload()`, uncomment:
   `this.load.aseprite('boss_flood_control', '/assets/enemies/boss_flood_control.png', '/assets/enemies/boss_flood_control.json');`
   (atlas key defaults to the enemy `id` = `boss_flood_control`). That's it — the
   states, including the boss `cast`, play from real frames automatically.
