# The Overpriced — Enemy Art Prompt Pack (minion template)

Ready-to-paste prompts for generating **The Overpriced**, a fake-HP "padded
budget" anomaly. This pack mirrors the **enemy template**
(`docs/references/grunt_prompt_pack.md`). Enemies differ from heroes in two ways
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

## The Overpriced Visual Bible (locked — keep identical across every phase)

No portrait exists — this bible is **synthesized** from its role (the bloated
parade-balloon shieldbearer whose bulk is almost all *fake* padding — `balance.ts`
`fakeHpPadding` of `150` over a tiny real `maxHp` of `50`, the slowest minion at
speed `25`) and its `balance.ts` color anchor `#818cf8` (inflated periwinkle). Its
codex weakness is **Magic (Truth) / Audit** popping the padding — the design should
scream "mostly hot air." Do not drift:

- **What:** The Overpriced — a grotesquely **inflated parade-balloon anomaly**: an
  overpriced procurement made flesh, a 10-peso item invoiced at 10,000, blown up
  huge on nothing but padding. Grotesque, exaggerated, slightly comedic — a
  concept-creature, not a human.
- **Body:** an enormous, wobbling **inflated balloon-creature**, taut and glossy,
  bobbing on stubby dangling legs, held down by fraying tethers. Its bloated hide
  is stamped all over with **giant price tags, extra zeroes, and inflated
  receipts**. Reads *huge but hollow* — clearly mostly air.
- **Signature read-at-a-glance cue:** the **overinflated glossy balloon body
  plastered with oversized price tags dripping extra zeroes**, tethers straining —
  this is its #1 silhouette read and must survive every angle. The body should look
  one pinprick from popping.
- **Face:** a smug, over-stuffed grin with puffed cheeks, tiny beady eyes lost in
  the bloat — pleased with its own inflated worth.
- **Style:** High-contrast cel-shaded vector art, flat colors, bold clean outer
  strokes, 2D mobile game asset (Persona 5 UI pop × Hades silhouette), plain
  solid/white background, isolated character. Reads clearly at small size.
- **Palette:** inflated periwinkle-indigo (anchor `#818cf8`), glossy balloon
  highlight, manila price-tag tan, red-ink zeroes. (Any engine tint is only a
  fallback for missing sprites — the real sheet uses its true colors, no flat
  wash.)

---

## Phase 1 — Base Concept + Camera Angles (do this first)

**Prompt:**
> Generate a comprehensive 2D character turnaround reference sheet for a mobile
> game enemy creature named The Overpriced.
>
> **Creature:** A grotesquely inflated parade-balloon anomaly minion — an enormous,
> wobbling, taut and glossy **balloon-creature** bobbing on stubby dangling legs,
> held down by fraying tethers. Its bloated periwinkle hide is stamped all over
> with **giant price tags, extra zeroes, and inflated receipts**. A smug
> over-stuffed grin with puffed cheeks and tiny beady eyes. It reads as huge but
> hollow — clearly mostly air, one pinprick from popping. Grotesque and slightly
> comedic — a concept-creature, not a human, and not any real person.
>
> **Style:** High-contrast cel-shaded vector art, flat colors, bold clean outer
> strokes, 2D mobile game asset (Persona 5 UI pop crossed with Hades
> silhouettes). Plain solid background, isolated creature.
>
> **Required Layout:** Show the exact same creature in a row from these angles.
> Proportions, the inflated balloon body, and the price-tag stamps must remain
> identical in every view:
> 1. **Front View:** looking directly at the camera.
> 2. **Side Profile:** 90-degree turn.
> 3. **Rear View (straight back):** facing away — we see its ballooning back and
>    the tethers trailing off it.
> 4. **TOP-FRONT (high-angle front 3/4) — THE GAMEPLAY VIEW:** camera high above
>    and in front, tilted (NOT flat zenith). We see the top of its bulging head
>    plus its face, the price-tag-stamped balloon chest, and the stubby legs as it
>    wobbles toward the viewer. This is the angle its in-game sprites are drawn
>    from — make it clean and clear.
> 5. **TOP-BEHIND (high-angle rear 3/4):** camera high above and behind, tilted;
>    top of head, the ballooning shoulders, and the tethered back.
>
> Ensure the overinflated glossy body, the oversized price tags with extra zeroes,
> and the straining tethers are clearly readable in all five views.

*Save the result as `docs/references/the_overpriced_base_turnaround.png`. This is
the base reference for the next phase.*

---

## Phase 2 — Animated Enemy Sprite Sheet (TOP-FRONT)

**Attach `the_overpriced_base_turnaround.png` first**, then:

> Attached is the base turnaround sheet for The Overpriced anomaly. Generate a
> strictly formatted 2D sprite sheet for a top-down auto-battler.
>
> **Crucial Perspective:** The Overpriced is an Enemy. The camera is a high
> top-down oblique above and behind the player's line, so it faces TOWARD the
> camera as it bears down on the barrier. **ALL frames must be drawn from a
> HIGH-ANGLE FRONT VIEW (top-front, front 3/4)** — top of head, plus face,
> balloon chest, and stubby legs. Not a flat zenith, no side profiles, no low
> angles.
>
> **Style & Formatting:** Match the cel-shaded vector style of the reference
> exactly (inflated glossy balloon body, oversized price tags with extra zeroes,
> straining tethers). Lay out as horizontal rows, one animation per row, each frame in its own evenly-spaced cell, non-overlapping, with consistent size and centering.
>
> **OUTPUT RULES (critical — the last generation drew these by mistake):** Fully **transparent** background — NO white fill. Do NOT draw any grid lines, cell borders, boxes, guide lines, or separators. Do NOT render any text, row names, labels, numbers, or captions anywhere in the image. Output ONLY the character art, arranged in evenly-spaced **invisible** cells.
>
> **MANDATORY LAYOUT — exactly 5 rows, in this exact top-to-bottom order:**
> 1. **`march`** — EXACTLY 4 frames: a slow, ponderous wobble-bob toward the
>    viewer, the balloon body jiggling and tethers swaying (front view).
> 2. **`attack`** — EXACTLY 3 frames: **body-slamming its bloated balloon bulk
>    into the barrier**, squashing flat then rebounding. Frame 2 is the clear
>    impact frame, the taut hide deforming against the shield (front view).
> 3. **`stunned`** — EXACTLY 2 frames: hissing and lopsided as if leaking air,
>    dazed and wobbling, **spinning stars** circling its head (front view).
> 4. **`celebrate`** — EXACTLY 2 frames: it overran the line — puffing up even
>    bigger and **bouncing forward in triumph**, price tags flapping (front view).
>    Plays when the player loses.
> 5. **`death`** — EXACTLY 3 frames: **popping like an over-inflated balloon** —
>    bursting with a spray of shredded price tags and receipts, deflating into a
>    limp scrap of vinyl (front view).
>
> Verify every frame in every row is present in the final grid.

*Export from Aseprite as `the_overpriced.png` + `the_overpriced.json` (JSON Hash or
Array), with the tag names above spelled exactly:
`march attack stunned celebrate death`.*

> **Bosses only:** insert a **`cast`** row (EXACTLY 3 frames) between `attack` and
> `stunned` showing the boss channelling its signature `activeSkill`, and draw the
> boss larger, more detailed, and more menacing than a minion. The Overpriced is a
> minion — it does **not** get this row.

---

## Export & QA reminders

- Transparent background, consistent frame size, no clipped limbs.
- Tag names MUST match the engine states 1:1 — see the checklist in
  `docs/CHARACTER_VISUAL_PROMPT_GUIDE.md` (Phase 4).
- Drop finished files in `public/assets/enemies/`: `the_overpriced.png`,
  `the_overpriced.json`.

## Integration status

**The engine side is already done** — `EnemyModel` is `Sprite`-based, every state
routes through the sprite-sheet path with a tween fallback, an enemy's atlas key
defaults to its `id`, and `GameScene.createEnemyAnimations()` auto-wires any enemy
atlas that loads. Until the art exists The Overpriced renders the tinted
`enemy-base` placeholder (no broken texture) and still animates all states via
tweens.

**To light up the real art, once you've generated the sheet:**
1. Drop `the_overpriced.png` + `the_overpriced.json` into
   `public/assets/enemies/`.
2. In `GameScene.preload()`, uncomment:
   `this.load.aseprite('the_overpriced', '/assets/enemies/the_overpriced.png', '/assets/enemies/the_overpriced.json');`
   (atlas key defaults to the enemy `id` = `the_overpriced`). That's it — the
   states play from real frames automatically.
