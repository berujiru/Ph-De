# Runner — Enemy Art Prompt Pack (minion template)

Ready-to-paste prompts for generating **Runner**, a fast-rush anomaly minion.
This pack mirrors the **enemy template** (`docs/references/grunt_prompt_pack.md`).
Enemies differ from heroes in two ways (see
`docs/CHARACTER_VISUAL_PROMPT_GUIDE.md`):

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

## Runner Visual Bible (locked — keep identical across every phase)

No portrait exists — this bible is **synthesized** from its role (the frail,
extremely fast "fixer" rusher that scuttles past defenses — `balance.ts` speed
`110`, the highest of the minions, and a tiny `maxHp` of `20`) and its `balance.ts`
color anchor `#eab308` (amber-yellow). Do not drift:

- **What:** Runner — a lean, twitchy **fixer anomaly**: the greasy expediter who
  rushes paperwork past every checkpoint made flesh. Grotesque, exaggerated,
  slightly comedic — a concept-creature, not a human.
- **Body:** a spindly, hunched sprinter with **too many scrabbling arms**, each
  clutching a fistful of **manila folders and rush-order slips**. Skinny legs
  built for speed, a body that reads *frail and fast*, never bulky.
- **Signature read-at-a-glance cue:** the **cluster of scuttling arms fanning out
  fistfuls of folders** as it sprints, with **motion-blur streaks / speed lines**
  trailing it — this is its #1 silhouette read and must survive every angle.
- **Face:** a sweaty, darting-eyed grin — always looking over its shoulder,
  in-a-hurry, shifty.
- **Style:** High-contrast cel-shaded vector art, flat colors, bold clean outer
  strokes, 2D mobile game asset (Persona 5 UI pop × Hades silhouette), plain
  solid/white background, isolated character. Reads clearly at small size.
- **Palette:** rush-slip amber (anchor `#eab308`), pale sweaty skin, manila-folder
  tan, smudged grey ink. (Any engine tint is only a fallback for missing
  sprites — the real sheet uses its true colors, no flat wash.)

---

## Phase 1 — Base Concept + Camera Angles (do this first)

**Prompt:**
> Generate a comprehensive 2D character turnaround reference sheet for a mobile
> game enemy creature named Runner.
>
> **Creature:** A lean, twitchy fixer-anomaly minion built entirely for speed — a
> spindly hunched sprinter with **several extra scrabbling arms**, each clutching
> fistfuls of **manila folders and amber rush-order slips**. Skinny sprinter legs,
> a sweaty darting-eyed grin, always glancing over its shoulder. It reads as frail
> and fast, never bulky. Grotesque and slightly comedic — a concept-creature, not
> a human, and not any real person.
>
> **Style:** High-contrast cel-shaded vector art, flat colors, bold clean outer
> strokes, 2D mobile game asset (Persona 5 UI pop crossed with Hades
> silhouettes). Plain solid background, isolated creature.
>
> **Required Layout:** Show the exact same creature in a row from these angles.
> Proportions, the cluster of folder-clutching arms, and the sprinter build must
> remain identical in every view:
> 1. **Front View:** looking directly at the camera.
> 2. **Side Profile:** 90-degree turn, mid-stride.
> 3. **Rear View (straight back):** facing away — we see its back and the folders
>    trailing off it.
> 4. **TOP-FRONT (high-angle front 3/4) — THE GAMEPLAY VIEW:** camera high above
>    and in front, tilted (NOT flat zenith). We see the top of its head plus its
>    face, chest, and the fan of scuttling arms as it sprints toward the viewer.
>    This is the angle its in-game sprites are drawn from — make it clean and
>    clear.
> 5. **TOP-BEHIND (high-angle rear 3/4):** camera high above and behind, tilted;
>    top of head, shoulders, and back.
>
> Ensure the extra scuttling arms, the fistfuls of folders/rush-slips, and the
> frail sprinter build are clearly readable in all five views.

*Save the result as `docs/references/runner_base_turnaround.png`. This is the base
reference for the next phase.*

---

## Phase 2 — Animated Enemy Sprite Sheet (TOP-FRONT)

**Attach `runner_base_turnaround.png` first**, then:

> Attached is the base turnaround sheet for the Runner anomaly. Generate a strictly
> formatted 2D sprite sheet for a top-down auto-battler.
>
> **Crucial Perspective:** Runner is an Enemy. The camera is a high top-down
> oblique above and behind the player's line, so Runner faces TOWARD the camera as
> it bears down on the barrier. **ALL frames must be drawn from a HIGH-ANGLE FRONT
> VIEW (top-front, front 3/4)** — top of head, plus face, chest, and scuttling
> arms. Not a flat zenith, no side profiles, no low angles.
>
> **Style & Formatting:** Match the cel-shaded vector style of the reference
> exactly (extra folder-clutching arms, amber rush-slips, frail sprinter build). Lay out as horizontal rows, one animation per row, each frame in its own evenly-spaced cell, non-overlapping, with consistent size and centering.
>
> **OUTPUT RULES (critical — the last generation drew these by mistake):** Fully **transparent** background — NO white fill. Do NOT draw any grid lines, cell borders, boxes, guide lines, or separators. Do NOT render any text, row names, labels, numbers, or captions anywhere in the image. Output ONLY the character art, arranged in evenly-spaced **invisible** cells.
>
> **MANDATORY LAYOUT — exactly 5 rows, in this exact top-to-bottom order:**
> 1. **`march`** — EXACTLY 4 frames: a frantic, over-fast sprint cycle barreling
>    toward the viewer, folders flapping and speed-line streaks trailing behind
>    (front view).
> 2. **`attack`** — EXACTLY 3 frames: **shoving a fistful of rush-slips into the
>    barrier**, ramming through with its scuttling arms. Frame 2 is the clear
>    impact frame, papers crumpling on contact (front view).
> 3. **`stunned`** — EXACTLY 2 frames: skidded to a halt, dazed and wobbling,
>    **spinning stars / fluttering loose slips** circling its head, mid-stumble
>    (front view).
> 4. **`celebrate`** — EXACTLY 2 frames: it overran the line — grinning and
>    **darting forward in triumph**, flinging folders overhead (front view).
>    Plays when the player loses.
> 5. **`death`** — EXACTLY 3 frames: **tripping and scattering into a flurry of
>    loose folders and fluttering rush-slips**, collapsing in a heap (front view).
>
> **SELF-CHECK — before returning the image, verify each item; if any FAILS, fix it and regenerate:**
> 1. **Consistent view** — every frame in every row uses the SAME camera angle stated above (heroes: rear / top-behind — we see the back; enemies: front / top-front — we see the face). No side profiles, no switching between front and back between frames.
> 2. **Frame counts** — each row has EXACTLY the number of frames listed for that row above.
> 3. **Clean output** — fully transparent background; NO grid lines, borders, boxes, text, labels, numbers, or captions anywhere.
> 4. **On-model & separated** — outfit / hair / props identical in every frame; poses do not touch or overlap.

*Export from Aseprite as `runner.png` + `runner.json` (JSON Hash or Array), with
the tag names above spelled exactly: `march attack stunned celebrate death`.*

> **Bosses only:** insert a **`cast`** row (EXACTLY 3 frames) between `attack` and
> `stunned` showing the boss channelling its signature `activeSkill`, and draw the
> boss larger, more detailed, and more menacing than a minion. Runner is a minion —
> it does **not** get this row.

---

## Export & QA reminders

- Transparent background, consistent frame size, no clipped limbs.
- Tag names MUST match the engine states 1:1 — see the checklist in
  `docs/CHARACTER_VISUAL_PROMPT_GUIDE.md` (Phase 4).
- Drop finished files in `public/assets/enemies/`: `runner.png`, `runner.json`.

## Integration status

**The engine side is already done** — `EnemyModel` is `Sprite`-based, every state
routes through the sprite-sheet path with a tween fallback, an enemy's atlas key
defaults to its `id`, and `GameScene.createEnemyAnimations()` auto-wires any enemy
atlas that loads. Until the art exists Runner renders the tinted `enemy-base`
placeholder (no broken texture) and still animates all states via tweens.

**To light up the real art, once you've generated the sheet:**
1. Drop `runner.png` + `runner.json` into `public/assets/enemies/`.
2. In `GameScene.preload()`, uncomment:
   `this.load.aseprite('runner', '/assets/enemies/runner.png', '/assets/enemies/runner.json');`
   (atlas key defaults to the enemy `id` = `runner`). That's it — the states play
   from real frames automatically.
