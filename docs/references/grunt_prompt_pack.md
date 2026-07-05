# Grunt — Enemy Art Prompt Pack (minion template)

Ready-to-paste prompts for generating **Grunt**, a basic anomaly minion. This is
the **template all enemy packs mirror**. Enemies differ from heroes in two ways
(see `docs/CHARACTER_VISUAL_PROMPT_GUIDE.md`):

- **Perspective is TOP-FRONT** (high-angle front 3/4) — anomalies face the camera
  as they bear down on the barrier.
- **State set is `march / attack / stunned / celebrate / death`** (5 rows). There
  is **no anime skill cut-in** for enemies. **Bosses** add a 6th **`cast`** row
  for their `activeSkill` and are drawn larger and more grotesque.

> Run these in an image-capable Claude/Gemini (not the coding CLI). Always
> **attach the previous phase's output** as reference before generating the next.

**Binding rule:** enemies personify a *behavior or scandal as a category* — never
a real official, party, or contractor. Design a grotesque concept-creature, not a
person (`docs/WORLD_AND_HEROES.md`).

---

## Grunt Visual Bible (locked — keep identical across every phase)

No portrait exists — this bible is **synthesized** from its role (the basic
frontline bureaucratic-anomaly swarmer) and its `balance.ts` color anchor
`#ef4444` (red). Do not drift:

- **What:** Grunt — a squat, shambling **red-tape bureaucrat anomaly**: the
  everyday obstruction made flesh. Grotesque, exaggerated, slightly comedic —
  a concept-creature, not a human.
- **Body:** a lumpy torso wrapped in coils of **red bureaucratic tape**, stray
  **rubber stamps** and crumpled **manila forms** stuck to it, stubby limbs.
- **Signature read-at-a-glance cue:** the red-tape wrapping + a **rubber stamp**
  for a hand (it stamps the barrier) — this is its #1 silhouette read and must
  survive every angle.
- **Face:** a blank, officious scowl — droopy eyes, a permanent bored sneer.
- **Style:** High-contrast cel-shaded vector art, flat colors, bold clean outer
  strokes, 2D mobile game asset (Persona 5 UI pop × Hades silhouette), plain
  solid/white background, isolated character. Reads clearly at small size.
- **Palette:** red-tape red (anchor `#ef4444`), manila-folder tan, grimy grey
  skin, black stamp ink. (Any engine tint is only a fallback for missing
  sprites — the real sheet uses its true colors, no flat wash.)

---

## Phase 1 — Base Concept + Camera Angles (do this first)

**Prompt:**
> Generate a comprehensive 2D character turnaround reference sheet for a mobile
> game enemy creature named Grunt.
>
> **Creature:** A squat, shambling bureaucratic-anomaly minion — a lumpy grey
> body wrapped in coils of **red bureaucratic tape**, crumpled **manila forms**
> and **rubber stamps** stuck all over it, one hand a big **rubber stamp**. A
> blank officious scowl. Grotesque and slightly comedic — a concept-creature, not
> a human, and not any real person.
>
> **Style:** High-contrast cel-shaded vector art, flat colors, bold clean outer
> strokes, 2D mobile game asset (Persona 5 UI pop crossed with Hades
> silhouettes). Plain solid background, isolated creature.
>
> **Required Layout:** Show the exact same creature in a row from these angles.
> Proportions, red-tape wrapping, and the stamp-hand must remain identical in
> every view:
> 1. **Front View:** looking directly at the camera.
> 2. **Side Profile:** 90-degree turn.
> 3. **Rear View (straight back):** facing away — we see its back and the tape
>    trailing off it.
> 4. **TOP-FRONT (high-angle front 3/4) — THE GAMEPLAY VIEW:** camera high above
>    and in front, tilted (NOT flat zenith). We see the top of its head plus its
>    face, chest, and the stamp-hand as it lurches toward the viewer. This is the
>    angle its in-game sprites are drawn from — make it clean and clear.
> 5. **TOP-BEHIND (high-angle rear 3/4):** camera high above and behind, tilted;
>    top of head, shoulders, and back.
>
> Ensure the red-tape wrapping, manila forms, and the rubber-stamp hand are
> clearly readable in all five views.

*Save the result as `docs/references/grunt_base_turnaround.png`. This is the base
reference for the next phase.*

---

## Phase 2 — Animated Enemy Sprite Sheet (TOP-FRONT)

**Attach `grunt_base_turnaround.png` first**, then:

> Attached is the base turnaround sheet for the Grunt anomaly. Generate a strictly
> formatted 2D sprite sheet for a top-down auto-battler.
>
> **Crucial Perspective:** Grunt is an Enemy. The camera is a high top-down
> oblique above and behind the player's line, so Grunt faces TOWARD the camera as
> it bears down on the barrier. **ALL frames must be drawn from a HIGH-ANGLE FRONT
> VIEW (top-front, front 3/4)** — top of head, plus face, chest, and stamp-hand.
> Not a flat zenith, no side profiles, no low angles.
>
> **Style & Formatting:** Match the cel-shaded vector style of the reference
> exactly (red-tape wrapping, manila forms, rubber-stamp hand). Lay out as horizontal rows, one animation per row, each frame in its own evenly-spaced cell, non-overlapping, with consistent size and centering.
>
> **OUTPUT RULES (critical — the last generation drew these by mistake):** Fully **transparent** background — NO white fill. Do NOT draw any grid lines, cell borders, boxes, guide lines, or separators. Do NOT render any text, row names, labels, numbers, or captions anywhere in the image. Output ONLY the character art, arranged in evenly-spaced **invisible** cells.
>
> **MANDATORY LAYOUT — exactly 5 rows, in this exact top-to-bottom order:**
> 1. **`march`** — EXACTLY 4 frames: a plodding walk cycle shambling toward the
>    viewer, tape dragging (front view).
> 2. **`attack`** — EXACTLY 3 frames: **slamming its rubber-stamp hand down** on
>    the barrier. Frame 2 is the clear impact frame, ink splatting (front view).
> 3. **`stunned`** — EXACTLY 2 frames: dazed, wobbling, **spinning stars / dizzy
>    forms** circling its head, mid-stumble (front view).
> 4. **`celebrate`** — EXACTLY 2 frames: it overran the line — snarling and
>    **tearing forward in triumph**, stamping wildly (front view). Plays when the
>    player loses.
> 5. **`death`** — EXACTLY 3 frames: **dissolving into a burst of shredded red
>    tape and scattered paperwork**, collapsing (front view).
>
> Verify every frame in every row is present in the final grid.

*Export from Aseprite as `grunt.png` + `grunt.json` (JSON Hash or Array), with the
tag names above spelled exactly: `march attack stunned celebrate death`.*

> **Bosses only:** insert a **`cast`** row (EXACTLY 3 frames) between `attack` and
> `stunned` showing the boss channelling its signature `activeSkill`, and draw the
> boss larger, more detailed, and more menacing than a minion.

---

## Export & QA reminders

- Transparent background, consistent frame size, no clipped limbs.
- Tag names MUST match the engine states 1:1 — see the checklist in
  `docs/CHARACTER_VISUAL_PROMPT_GUIDE.md` (Phase 4).
- Drop finished files in `public/assets/enemies/`: `grunt.png`, `grunt.json`.

## Integration status

**The engine side is already done** — `EnemyModel` is `Sprite`-based, every state
routes through the sprite-sheet path with a tween fallback, an enemy's atlas key
defaults to its `id`, and `GameScene.createEnemyAnimations()` auto-wires any enemy
atlas that loads. Until the art exists Grunt renders the tinted `enemy-base`
placeholder (no broken texture) and still animates all states via tweens.

**To light up the real art, once you've generated the sheet:**
1. Drop `grunt.png` + `grunt.json` into `public/assets/enemies/`.
2. In `GameScene.preload()`, uncomment:
   `this.load.aseprite('grunt', '/assets/enemies/grunt.png', '/assets/enemies/grunt.json');`
   (atlas key defaults to the enemy `id` = `grunt`). That's it — the states play
   from real frames automatically.
