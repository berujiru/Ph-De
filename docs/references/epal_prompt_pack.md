# Epal — Enemy Art Prompt Pack (minion template)

Ready-to-paste prompts for generating **Epal**, a morale-aura "credit-grabber"
anomaly. This pack mirrors the **enemy template**
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
person. **Every tarpaulin/poster face on this creature must be blank, anonymous,
or a generic scribble — never a real candidate, party, or likeness**
(`docs/WORLD_AND_HEROES.md`).

---

## Epal Visual Bible (locked — keep identical across every phase)

No portrait exists — this bible is **synthesized** from its role (the hulking
credit-grabber that plasters its face over everything and buffs nearby minions —
`balance.ts` `moraleAura: true` with `auraRange` `150`, a beefy `maxHp` of `150`,
speed `40`) and its `balance.ts` color anchor `#f97316` (campaign-tarp orange). Its
design weakness in the codex is **Wind (tarps rip)** — lean into flappable
tarpaulin. Do not drift:

- **What:** Epal — a hulking **credit-grabbing anomaly**: the shameless
  "epal" who slaps their branding onto every public project and takes credit for
  work they never did, made flesh. Grotesque, exaggerated, slightly comedic — a
  concept-creature, not a human.
- **Body:** a broad, self-important mobster-sized figure completely **shingled in
  overlapping campaign tarpaulins and streamers**, layered like flapping scales.
  Chunky arms rolling out **more banners**. A sash and oversized ribbon like a
  perpetual ribbon-cutting. Reads *loud, boastful, plastered-over*.
- **Signature read-at-a-glance cue:** the **body wallpapered in loud orange
  campaign tarpaulins/streamers with big blank grinning poster-faces on them**,
  banners flapping — this is its #1 silhouette read and must survive every angle.
  **All poster faces are blank / anonymous / generic — never a real person.**
- **Face:** its own head is a smug, chest-puffed grin — but interchangeable with
  the blank poster-faces, as if it *is* just another tarp.
- **Style:** High-contrast cel-shaded vector art, flat colors, bold clean outer
  strokes, 2D mobile game asset (Persona 5 UI pop × Hades silhouette), plain
  solid/white background, isolated character. Reads clearly at small size.
- **Palette:** campaign-tarp orange (anchor `#f97316`), loud yellow-and-white
  banner stripes, glossy ribbon red, cheap vinyl sheen. (Any engine tint is only a
  fallback for missing sprites — the real sheet uses its true colors, no flat
  wash.)

---

## Phase 1 — Base Concept + Camera Angles (do this first)

**Prompt:**
> Generate a comprehensive 2D character turnaround reference sheet for a mobile
> game enemy creature named Epal.
>
> **Creature:** A hulking credit-grabbing anomaly minion — a broad, self-important
> figure completely **shingled in overlapping loud-orange campaign tarpaulins and
> streamers** layered like flapping scales, with chunky arms rolling out more
> banners and a giant ribbon-cutting sash. The tarpaulins carry **big blank,
> grinning generic poster-faces — all anonymous, never a real person**. Its own
> head is a smug chest-puffed grin. It reads as loud, boastful, and plastered-over.
> Grotesque and slightly comedic — a concept-creature, not a human, and not any
> real person.
>
> **Style:** High-contrast cel-shaded vector art, flat colors, bold clean outer
> strokes, 2D mobile game asset (Persona 5 UI pop crossed with Hades
> silhouettes). Plain solid background, isolated creature.
>
> **Required Layout:** Show the exact same creature in a row from these angles.
> Proportions, the tarpaulin-shingled body, and the ribbon sash must remain
> identical in every view:
> 1. **Front View:** looking directly at the camera.
> 2. **Side Profile:** 90-degree turn.
> 3. **Rear View (straight back):** facing away — we see its back plastered with
>    even more tarps and streamers trailing off it.
> 4. **TOP-FRONT (high-angle front view) — THE GAMEPLAY VIEW:** camera high above
>    and in front, tilted (NOT flat zenith). We see the top of its head plus its
>    face, the tarp-shingled chest, and the flapping banners as it struts toward
>    the viewer. This is the angle its in-game sprites are drawn from — make it
>    clean and clear.
> 5. **TOP-BEHIND (high-angle back view):** camera high above and behind, tilted;
>    top of head, shoulders, and the tarp-covered back.
>
> Ensure the overlapping campaign tarpaulins, the blank generic poster-faces, and
> the ribbon sash are clearly readable in all five views.

*Save the result as `docs/references/epal_base_turnaround.png`. This is the base
reference for the next phase.*

---

## Phase 2 — Animated Enemy Sprite Sheet (TOP-FRONT)

**Attach `epal_base_turnaround.png` first**, then:

> Attached is the base turnaround sheet for the Epal anomaly. Generate a strictly
> formatted 2D sprite sheet for a top-down auto-battler.
>
> **Crucial Perspective:** Epal is an Enemy. The camera is a high top-down oblique
> above and behind the player's line, so it faces TOWARD the camera as it bears
> down on the barrier. **ALL frames must be drawn from a HIGH-ANGLE FRONT VIEW
> (top-front, front view)** — top of head, plus face, tarp-shingled chest, and
> banner arms. Not a flat zenith, no side profiles, no low angles.
>
> **Style & Formatting:** Match the cel-shaded vector style of the reference
> exactly (overlapping orange tarpaulins, blank generic poster-faces, ribbon sash). Lay out as horizontal rows, one animation per row, each frame in its own evenly-spaced cell, non-overlapping, with consistent size and centering.
>
> **OUTPUT RULES (critical — the last generation drew these by mistake):** Fully **transparent** background — NO white fill. Do NOT draw any grid lines, cell borders, boxes, guide lines, or separators. Do NOT render any text, row names, labels, numbers, or captions anywhere in the image. Output ONLY the character art, arranged in evenly-spaced **invisible** cells.
>
> **MANDATORY LAYOUT — exactly 5 rows, in this exact top-to-bottom order:**
> 1. **`march`** — EXACTLY 4 frames: a proud, chest-out strut toward the viewer,
>    tarps and streamers flapping with each step (front view).
> 2. **`attack`** — EXACTLY 3 frames: **slapping / unfurling a giant tarpaulin
>    banner across the barrier** to claim credit for it. Frame 2 is the clear
>    impact frame, the banner smacking flat against the shield (front view).
> 3. **`stunned`** — EXACTLY 2 frames: dazed and tangled in its own flapping tarps,
>    wobbling, **spinning stars** circling its head (front view).
> 4. **`celebrate`** — EXACTLY 2 frames: it overran the line — flinging banners
>    overhead and **posing in triumph** at a mock ribbon-cutting (front view).
>    Plays when the player loses.
> 5. **`death`** — EXACTLY 3 frames: **its tarpaulins ripping and tearing away in
>    the wind**, the figure deflating and collapsing into a heap of shredded
>    banners and snapped bamboo poles (front view).
>
> **SELF-CHECK — before returning the image, verify each item; if any FAILS, fix it and regenerate:**
> 1. **Consistent view** — every frame in every row uses the SAME camera angle stated above (heroes: rear / top-behind — we see the back; enemies: front / top-front — we see the face). No side profiles, no switching between front and back between frames.
> 2. **Frame counts** — each row has EXACTLY the number of frames listed for that row above.
> 3. **Clean output** — fully transparent background; NO grid lines, borders, boxes, text, labels, numbers, or captions anywhere.
> 4. **On-model & separated** — outfit / hair / props identical in every frame; poses do not touch or overlap.

*Export from Aseprite as `epal.png` + `epal.json` (JSON Hash or Array), with the
tag names above spelled exactly: `march attack stunned celebrate death`.*

> **Bosses only:** insert a **`cast`** row (EXACTLY 3 frames) between `attack` and
> `stunned` showing the boss channelling its signature `activeSkill`, and draw the
> boss larger, more detailed, and more menacing than a minion. Epal is a minion —
> it does **not** get this row.

---

## Export & QA reminders

- Transparent background, consistent frame size, no clipped limbs.
- Tag names MUST match the engine states 1:1 — see the checklist in
  `docs/CHARACTER_VISUAL_PROMPT_GUIDE.md` (Phase 4).
- **Extra QA for Epal:** confirm every poster/tarpaulin face is blank, anonymous,
  or a generic scribble — no real candidate, party, seal, or likeness slipped in.
- Drop finished files in `public/assets/enemies/`: `epal.png`, `epal.json`.

## Integration status

**The engine side is already done** — `EnemyModel` is `Sprite`-based, every state
routes through the sprite-sheet path with a tween fallback, an enemy's atlas key
defaults to its `id`, and `GameScene.createEnemyAnimations()` auto-wires any enemy
atlas that loads. Until the art exists Epal renders the tinted `enemy-base`
placeholder (no broken texture) and still animates all states via tweens.

**To light up the real art, once you've generated the sheet:**
1. Drop `epal.png` + `epal.json` into `public/assets/enemies/`.
2. In `GameScene.preload()`, uncomment:
   `this.load.aseprite('epal', '/assets/enemies/epal.png', '/assets/enemies/epal.json');`
   (atlas key defaults to the enemy `id` = `epal`). That's it — the states play
   from real frames automatically.
