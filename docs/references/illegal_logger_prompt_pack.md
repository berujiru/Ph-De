# Illegal Logger — Enemy Art Prompt Pack (minion template)

Ready-to-paste prompts for generating **Illegal Logger**, a barrier-shredding
destructor anomaly. This pack mirrors the **enemy template**
(`docs/references/grunt_prompt_pack.md`). Enemies differ from heroes in two ways
(see `docs/CHARACTER_VISUAL_PROMPT_GUIDE.md`):

- **Perspective is TOP-FRONT** (high-angle front view) — anomalies face the camera
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

## Illegal Logger Visual Bible (locked — keep identical across every phase)

No portrait exists — this bible is **synthesized** from its role (the slow, heavily
armored chainsaw destructor that tears through barricades — `balance.ts` speed `30`
(very slow), a huge `maxHp` of `200`, and a `barrierDamageMultiplier` of `10` that
lets it chew the barrier apart) and its `balance.ts` color anchor `#8b4513`
(logged-timber brown). Do not drift:

- **What:** Illegal Logger — a hulking **deforestation anomaly**: the poacher who
  strips protected forest for profit, made flesh. Grotesque, exaggerated, slightly
  comedic — a concept-creature, not a human.
- **Body:** a broad, thick-limbed brute whose torso is built from **stolen logs and
  raw stump-wood**, bark-plated shoulders, sap oozing from cracks, a belt of
  **chainsaw chains and cut branches**. Reads *heavy and destructive*.
- **Signature read-at-a-glance cue:** the **roaring chainsaw for a right hand /
  arm** paired with the **log-stacked lumber body** — this is its #1 silhouette
  read and must survive every angle. The chainsaw is always visible and always the
  focal point.
- **Face:** a greedy, snaggle-toothed leer under a filthy hard-hat, sawdust caked
  in its beard, mean squinting eyes.
- **Style:** High-contrast cel-shaded vector art, flat colors, bold clean outer
  strokes, 2D mobile game asset (Persona 5 UI pop × Hades silhouette), plain
  solid/white background, isolated character. Reads clearly at small size.
- **Palette:** timber brown (anchor `#8b4513`), pale raw-cut wood, oozing amber
  sap, grimy steel chainsaw, dull orange hard-hat. (Any engine tint is only a
  fallback for missing sprites — the real sheet uses its true colors, no flat
  wash.)

---

## Phase 1 — Base Concept + Camera Angles (do this first)

**Prompt:**
> Generate a comprehensive 2D character turnaround reference sheet for a mobile
> game enemy creature named Illegal Logger.
>
> **Creature:** A hulking deforestation-anomaly minion — a broad, thick-limbed
> brute whose torso is built from **stolen logs and raw stump-wood**, with
> bark-plated shoulders, amber sap oozing from the cracks, and a belt of chainsaw
> chains and cut branches. Its right arm ends in a **roaring chainsaw**. A greedy
> snaggle-toothed leer under a filthy hard-hat, sawdust caked in its beard. It
> reads as heavy and destructive. Grotesque and slightly comedic — a
> concept-creature, not a human, and not any real person.
>
> **Style:** High-contrast cel-shaded vector art, flat colors, bold clean outer
> strokes, 2D mobile game asset (Persona 5 UI pop crossed with Hades
> silhouettes). Plain solid background, isolated creature.
>
> **Required Layout:** Show the exact same creature in a row from these angles.
> Proportions, the log-body, and the chainsaw arm must remain identical in every
> view:
> 1. **Front View:** looking directly at the camera.
> 2. **Side Profile:** 90-degree turn.
> 3. **Rear View (straight back):** facing away — we see its back, the stacked
>    logs, and the chainsaw held at its side.
> 4. **TOP-FRONT (high-angle front view) — THE GAMEPLAY VIEW:** camera high above
>    and in front, tilted (NOT flat zenith). We see the top of its hard-hat plus
>    its face, log-torso, and the chainsaw arm as it lumbers toward the viewer.
>    This is the angle its in-game sprites are drawn from — make it clean and
>    clear.
> 5. **TOP-BEHIND (high-angle back view):** camera high above and behind, tilted;
>    top of hard-hat, shoulders, and the log-stacked back.
>
> Ensure the chainsaw arm, the stolen-log body, and the oozing sap are clearly
> readable in all five views.

*Save the result as `docs/references/illegal_logger_base_turnaround.png`. This is
the base reference for the next phase.*

---

## Phase 2 — Animated Enemy Sprite Sheet (TOP-FRONT)

**Attach `illegal_logger_base_turnaround.png` first**, then:

> Attached is the base turnaround sheet for the Illegal Logger anomaly. Generate a
> strictly formatted 2D sprite sheet for a top-down auto-battler.
>
> **Crucial Perspective:** Illegal Logger is an Enemy. The camera is a high
> top-down oblique above and behind the player's line, so it faces TOWARD the
> camera as it bears down on the barrier. **ALL frames must be drawn from a
> HIGH-ANGLE FRONT VIEW (top-front, front view)** — top of hard-hat, plus face,
> log-torso, and chainsaw arm. Not a flat zenith, no side profiles, no low angles.
>
> **Style & Formatting:** Match the cel-shaded vector style of the reference
> exactly (chainsaw arm, stolen-log body, oozing sap, filthy hard-hat). Lay out as horizontal rows, one animation per row, each frame in its own evenly-spaced cell, non-overlapping, with consistent size and centering.
>
> **OUTPUT RULES (critical — the last generation drew these by mistake):** Fully **transparent** background — NO white fill. Do NOT draw any grid lines, cell borders, boxes, guide lines, or separators. Do NOT render any text, row names, labels, numbers, or captions anywhere in the image. Output ONLY the character art, arranged in evenly-spaced **invisible** cells.
>
> **MANDATORY LAYOUT — exactly 5 rows, in this exact top-to-bottom order:**
> 1. **`march`** — EXACTLY 4 frames: a slow, heavy plod toward the viewer,
>    log-body swaying, chainsaw idling with a puff of exhaust (front view).
> 2. **`attack`** — EXACTLY 3 frames: **revving the chainsaw and sawing it hard
>    into the barrier**, wood chips and sparks flying. Frame 2 is the clear impact
>    frame, the blade biting deep (front view).
> 3. **`stunned`** — EXACTLY 2 frames: chainsaw sputtering and stalled, the logger
>    dazed and wobbling, **spinning stars** circling its hard-hat (front view).
> 4. **`celebrate`** — EXACTLY 2 frames: it overran the line — hoisting the roaring
>    chainsaw overhead and **lurching forward in triumph** (front view). Plays when
>    the player loses.
> 5. **`death`** — EXACTLY 3 frames: **splitting apart and collapsing into a pile
>    of loose logs, sawdust, and a sputtering-out chainsaw** (front view).
>
> **SELF-CHECK — before returning the image, verify each item; if any FAILS, fix it and regenerate:**
> 1. **Consistent view** — every frame in every row uses the SAME camera angle stated above (heroes: rear / top-behind — we see the back; enemies: front / top-front — we see the face). No side profiles, no switching between front and back between frames.
> 2. **Frame counts** — each row has EXACTLY the number of frames listed for that row above.
> 3. **Clean output** — fully transparent background; NO grid lines, borders, boxes, text, labels, numbers, or captions anywhere.
> 4. **On-model & separated** — outfit / hair / props identical in every frame; poses do not touch or overlap.

*Export from Aseprite as `illegal_logger.png` + `illegal_logger.json` (JSON Hash or
Array), with the tag names above spelled exactly:
`march attack stunned celebrate death`.*

> **Bosses only:** insert a **`cast`** row (EXACTLY 3 frames) between `attack` and
> `stunned` showing the boss channelling its signature `activeSkill`, and draw the
> boss larger, more detailed, and more menacing than a minion. Illegal Logger is a
> minion — it does **not** get this row.

---

## Export & QA reminders

- Transparent background, consistent frame size, no clipped limbs.
- Tag names MUST match the engine states 1:1 — see the checklist in
  `docs/CHARACTER_VISUAL_PROMPT_GUIDE.md` (Phase 4).
- Drop finished files in `public/assets/enemies/`: `illegal_logger.png`,
  `illegal_logger.json`.

## Integration status

**The engine side is already done** — `EnemyModel` is `Sprite`-based, every state
routes through the sprite-sheet path with a tween fallback, an enemy's atlas key
defaults to its `id`, and `GameScene.createEnemyAnimations()` auto-wires any enemy
atlas that loads. Until the art exists Illegal Logger renders the tinted
`enemy-base` placeholder (no broken texture) and still animates all states via
tweens.

**To light up the real art, once you've generated the sheet:**
1. Drop `illegal_logger.png` + `illegal_logger.json` into
   `public/assets/enemies/`.
2. In `GameScene.preload()`, uncomment:
   `this.load.aseprite('illegal_logger', '/assets/enemies/illegal_logger.png', '/assets/enemies/illegal_logger.json');`
   (atlas key defaults to the enemy `id` = `illegal_logger`). That's it — the
   states play from real frames automatically.
