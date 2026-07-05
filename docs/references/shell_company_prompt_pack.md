# Shell Company — Enemy Art Prompt Pack (minion template)

Ready-to-paste prompts for generating **Shell Company**, a splitter-anomaly
minion. This pack mirrors the **enemy template** in
`docs/references/grunt_prompt_pack.md`. Enemies differ from heroes in two ways
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

## Shell Company Visual Bible (locked — keep identical across every phase)

No portrait exists — this bible is **synthesized** from its role (the corporate
splitter anomaly that looks solid but shatters into three smaller Dummy Corps when
killed) and its `balance.ts` color anchor `#64748b` (slate) plus its
`fakeHpPadding` / `splitOnDeathCount: 3` behavior. Do not drift:

- **What:** Shell Company — a suited **corporate blob anomaly**, a hollow front
  company made flesh: puffed-up and important-looking on the outside, empty and
  gelatinous inside. Grotesque, exaggerated, slightly comedic — a
  concept-creature, not a human.
- **Body:** a bloated translucent grey blob crammed into a too-tight **pinstripe
  business suit** with a crooked tie; faint smaller blob-faces float suspended
  inside its gel body (the future spawn). Stubby arms, no real legs — it oozes
  forward.
- **Signature read-at-a-glance cue:** the **suit stretched over a see-through
  blob with ghost-blobs nested inside** — you can tell it will split. This is its
  #1 silhouette read and must survive every angle.
- **Face:** a smug, hollow executive smile — dead shark eyes, an over-confident
  boardroom smirk stretched across the gel.
- **Style:** High-contrast cel-shaded vector art, flat colors, bold clean outer
  strokes, 2D mobile game asset (Persona 5 UI pop × Hades silhouette), plain
  solid/white background, isolated character. Reads clearly at small size.
- **Palette:** shell slate-grey (anchor `#64748b`), pinstripe charcoal, translucent
  blue-grey gel, paper-white letterhead, red crooked tie accent. (Any engine tint
  is only a fallback for missing sprites — the real sheet uses its true colors, no
  flat wash.)

---

## Phase 1 — Base Concept + Camera Angles (do this first)

**Prompt:**
> Generate a comprehensive 2D character turnaround reference sheet for a mobile
> game enemy creature named Shell Company.
>
> **Creature:** A suited corporate blob-anomaly — a bloated **translucent grey
> blob** crammed into a too-tight **pinstripe business suit** with a crooked tie,
> with **faint smaller blob-faces nested and floating inside its see-through gel
> body**. Stubby arms, no legs, oozing forward, wearing a smug hollow executive
> smirk. Grotesque and slightly comedic — a concept-creature, not a human, and not
> any real person.
>
> **Style:** High-contrast cel-shaded vector art, flat colors, bold clean outer
> strokes, 2D mobile game asset (Persona 5 UI pop crossed with Hades
> silhouettes). Plain solid background, isolated creature.
>
> **Required Layout:** Show the exact same creature in a row from these angles.
> Proportions, the pinstripe suit, and the nested ghost-blobs must remain
> identical in every view:
> 1. **Front View:** looking directly at the camera.
> 2. **Side Profile:** 90-degree turn.
> 3. **Rear View (straight back):** facing away — we see the back of its suit and
>    the gel body wobbling behind it.
> 4. **TOP-FRONT (high-angle front view) — THE GAMEPLAY VIEW:** camera high above
>    and in front, tilted (NOT flat zenith). We see the top of its blobby head plus
>    its face, suited chest, and the ghost-blobs inside as it oozes toward the
>    viewer. This is the angle its in-game sprites are drawn from — make it clean
>    and clear.
> 5. **TOP-BEHIND (high-angle back view):** camera high above and behind, tilted;
>    top of head, suited shoulders, and back.
>
> Ensure the pinstripe suit, translucent gel body, and the nested smaller
> blob-faces are clearly readable in all five views.

*Save the result as `docs/references/shell_company_base_turnaround.png`. This is
the base reference for the next phase.*

---

## Phase 2 — Animated Enemy Sprite Sheet (TOP-FRONT)

**Attach `shell_company_base_turnaround.png` first**, then:

> Attached is the base turnaround sheet for the Shell Company anomaly. Generate a
> strictly formatted 2D sprite sheet for a top-down auto-battler.
>
> **Crucial Perspective:** Shell Company is an Enemy. The camera is a high
> top-down oblique above and behind the player's line, so it faces TOWARD the
> camera as it bears down on the barrier. **ALL frames must be drawn from a
> HIGH-ANGLE FRONT VIEW (top-front, front view)** — top of head, plus face, suited
> chest, and the nested gel-blobs. Not a flat zenith, no side profiles, no low
> angles.
>
> **Style & Formatting:** Match the cel-shaded vector style of the reference
> exactly (pinstripe suit, translucent gel, nested blob-faces). Lay out as horizontal rows, one animation per row, each frame in its own evenly-spaced cell, non-overlapping, with consistent size and centering.
>
> **OUTPUT RULES (critical — the last generation drew these by mistake):** Fully **transparent** background — NO white fill. Do NOT draw any grid lines, cell borders, boxes, guide lines, or separators. Do NOT render any text, row names, labels, numbers, or captions anywhere in the image. Output ONLY the character art, arranged in evenly-spaced **invisible** cells.
>
> **MANDATORY LAYOUT — exactly 5 rows, in this exact top-to-bottom order:**
> 1. **`march`** — EXACTLY 4 frames: a slow, self-important wobbling ooze toward
>    the viewer, gel jiggling with each surge (front view).
> 2. **`attack`** — EXACTLY 3 frames: **body-slamming its bloated gel bulk** into
>    the barrier, the suit rippling. Frame 2 is the clear impact frame, gel
>    splattering (front view).
> 3. **`stunned`** — EXACTLY 2 frames: dazed, the blob quivering and lopsided,
>    **spinning stars** circling its head, tie askew (front view).
> 4. **`celebrate`** — EXACTLY 2 frames: it overran the line — puffing up huge and
>    **shaking its stubby fists in smug triumph**, gel bouncing (front view). Plays
>    when the player loses.
> 5. **`death`** — EXACTLY 3 frames: **splitting apart — the suit bursts and the
>    gel body shatters into three smaller squealing blob-corps** that scatter,
>    collapsing (front view).
>
> **SELF-CHECK — before returning the image, verify each item; if any FAILS, fix it and regenerate:**
> 1. **Consistent view** — every frame in every row uses the SAME camera angle stated above (heroes: rear / top-behind — we see the back; enemies: front / top-front — we see the face). No side profiles, no switching between front and back between frames.
> 2. **Frame counts** — each row has EXACTLY the number of frames listed for that row above.
> 3. **Clean output** — fully transparent background; NO grid lines, borders, boxes, text, labels, numbers, or captions anywhere.
> 4. **On-model & separated** — outfit / hair / props identical in every frame; poses do not touch or overlap.

*Export from Aseprite as `shell_company.png` + `shell_company.json` (JSON Hash or
Array), with the tag names above spelled exactly:
`march attack stunned celebrate death`.*

---

## Export & QA reminders

- Transparent background, consistent frame size, no clipped limbs.
- Tag names MUST match the engine states 1:1 — see the checklist in
  `docs/CHARACTER_VISUAL_PROMPT_GUIDE.md` (Phase 4).
- Drop finished files in `public/assets/enemies/`: `shell_company.png`,
  `shell_company.json`.

## Integration status

**The engine side is already done** — `EnemyModel` is `Sprite`-based, every state
routes through the sprite-sheet path with a tween fallback, an enemy's atlas key
defaults to its `id`, and `GameScene.createEnemyAnimations()` auto-wires any enemy
atlas that loads. Until the art exists Shell Company renders the tinted
`enemy-base` placeholder (no broken texture) and still animates all states via
tweens.

**To light up the real art, once you've generated the sheet:**
1. Drop `shell_company.png` + `shell_company.json` into `public/assets/enemies/`.
2. In `GameScene.preload()`, uncomment:
   `this.load.aseprite('shell_company', '/assets/enemies/shell_company.png', '/assets/enemies/shell_company.json');`
   (atlas key defaults to the enemy `id` = `shell_company`). That's it — the
   states play from real frames automatically.
