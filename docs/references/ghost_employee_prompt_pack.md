# Ghost Employee — Enemy Art Prompt Pack (minion template)

Ready-to-paste prompts for generating **Ghost Employee**, a translucent stealth
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
person (`docs/WORLD_AND_HEROES.md`).

---

## Ghost Employee Visual Bible (locked — keep identical across every phase)

No portrait exists — this bible is **synthesized** from its role (the translucent
"no-show payroll" specter that stays half-invisible until revealed — `balance.ts`
`stealth: true`, a modest `maxHp` of `60`, speed `50`) and its `balance.ts` color
anchor `#ffffff` (spectral white). Its thematic Foley (per
`docs/ART_AND_AUDIO_GUIDELINES.md`) is **keyboard clicking, muffled whispering, and
ghostly wails** — lean the visuals into that office-phantom mood. Do not drift:

- **What:** Ghost Employee — a translucent **payroll-phantom anomaly**: the
  no-show worker who draws a salary that was never earned, made flesh (barely).
  Grotesque, exaggerated, slightly comedic — a concept-creature, not a human.
- **Body:** a semi-transparent, faintly glowing office specter with a wispy
  smoke-tail instead of legs, drifting rather than walking. Dressed in a
  translucent **ghostly barong / office polo** with a blank hanging **company ID
  lanyard**, clutching a spectral **time card** it never actually punches.
- **Signature read-at-a-glance cue:** its **see-through glowing body + the dangling
  blank ID lanyard and phantom time card**, trailing a smoke-tail — this is its #1
  silhouette read and must survive every angle. It should always read as *barely
  there*.
- **Face:** a hollow, absent stare — empty eye-sockets glowing faintly, an
  unbothered slack mouth. Vacant, not evil.
- **Style:** High-contrast cel-shaded vector art, flat colors, bold clean outer
  strokes, 2D mobile game asset (Persona 5 UI pop × Hades silhouette), plain
  solid/white background, isolated character. Reads clearly at small size even
  when translucent — keep a crisp glowing outline so the silhouette survives.
- **Palette:** spectral white / pale ghost-blue glow (anchor `#ffffff`), faint
  cyan rim-light, washed-out grey barong, dim lanyard. (Any engine tint is only a
  fallback for missing sprites — the real sheet uses its true colors, no flat
  wash.)

---

## Phase 1 — Base Concept + Camera Angles (do this first)

**Prompt:**
> Generate a comprehensive 2D character turnaround reference sheet for a mobile
> game enemy creature named Ghost Employee.
>
> **Creature:** A translucent payroll-phantom anomaly minion — a semi-transparent,
> faintly glowing office specter with a wispy **smoke-tail instead of legs** that
> drifts rather than walks. It wears a ghostly translucent **barong / office polo**
> with a blank hanging **company ID lanyard**, and clutches a spectral **time
> card** it never punches. Hollow glowing eye-sockets, a vacant slack stare. Keep a
> crisp glowing outline so the see-through body still reads. Grotesque and slightly
> comedic — a concept-creature, not a human, and not any real person.
>
> **Style:** High-contrast cel-shaded vector art, flat colors, bold clean outer
> strokes, 2D mobile game asset (Persona 5 UI pop crossed with Hades
> silhouettes). Plain solid background, isolated creature.
>
> **Required Layout:** Show the exact same creature in a row from these angles.
> Proportions, the translucency, the smoke-tail, and the dangling blank lanyard
> must remain identical in every view:
> 1. **Front View:** looking directly at the camera.
> 2. **Side Profile:** 90-degree turn.
> 3. **Rear View (straight back):** facing away — we see its back and the
>    smoke-tail trailing off it.
> 4. **TOP-FRONT (high-angle front view) — THE GAMEPLAY VIEW:** camera high above
>    and in front, tilted (NOT flat zenith). We see the top of its head plus its
>    face, chest, blank lanyard, and time card as it drifts toward the viewer.
>    This is the angle its in-game sprites are drawn from — make it clean and
>    clear.
> 5. **TOP-BEHIND (high-angle back view):** camera high above and behind, tilted;
>    top of head, shoulders, and the smoke-tail back.
>
> Ensure the translucent glowing body, the smoke-tail, the blank ID lanyard, and
> the phantom time card are clearly readable in all five views.

*Save the result as `docs/references/ghost_employee_base_turnaround.png`. This is
the base reference for the next phase.*

---

## Phase 2 — Animated Enemy Sprite Sheet (TOP-FRONT)

**Attach `ghost_employee_base_turnaround.png` first**, then:

> Attached is the base turnaround sheet for the Ghost Employee anomaly. Generate a
> strictly formatted 2D sprite sheet for a top-down auto-battler.
>
> **Crucial Perspective:** Ghost Employee is an Enemy. The camera is a high
> top-down oblique above and behind the player's line, so it faces TOWARD the
> camera as it bears down on the barrier. **ALL frames must be drawn from a
> HIGH-ANGLE FRONT VIEW (top-front, front view)** — top of head, plus face, chest,
> and the blank lanyard. Not a flat zenith, no side profiles, no low angles.
>
> **Style & Formatting:** Match the cel-shaded vector style of the reference
> exactly (translucent glowing body, smoke-tail, blank ID lanyard, phantom time
> card). Lay out as horizontal rows, one animation per row, each frame in its own evenly-spaced cell, non-overlapping, with consistent size and centering.
>
> **OUTPUT RULES (critical — the last generation drew these by mistake):** Fully **transparent** background — NO white fill. Do NOT draw any grid lines, cell borders, boxes, guide lines, or separators. Do NOT render any text, row names, labels, numbers, or captions anywhere in the image. Output ONLY the character art, arranged in evenly-spaced **invisible** cells.
>
> **MANDATORY LAYOUT — exactly 5 rows, in this exact top-to-bottom order:**
> 1. **`march`** — EXACTLY 4 frames: a slow, eerie **drifting float** toward the
>    viewer, smoke-tail undulating, body bobbing weightlessly (front view).
> 2. **`attack`** — EXACTLY 3 frames: **thrusting the phantom time card / a cold
>    spectral hand through the barrier** with a ghostly reach. Frame 2 is the clear
>    impact frame, a chilling glow-burst where it passes through (front view).
> 3. **`stunned`** — EXACTLY 2 frames: flickering and dazed, half-solidified,
>    **spinning stars** circling its head as it wobbles (front view). This is when
>    it has been revealed / hit out of stealth.
> 4. **`celebrate`** — EXACTLY 2 frames: it overran the line — a wide hollow grin,
>    **surging forward in triumph** with arms raised, glow flaring (front view).
>    Plays when the player loses.
> 5. **`death`** — EXACTLY 3 frames: **dissolving into a puff of pale smoke and
>    scattered payslips**, glow fading out to nothing (front view).
>
> **SELF-CHECK — before returning the image, verify each item; if any FAILS, fix it and regenerate:**
> 1. **Consistent view** — every frame in every row uses the SAME camera angle stated above (heroes: rear / top-behind — we see the back; enemies: front / top-front — we see the face). No side profiles, no switching between front and back between frames.
> 2. **Frame counts** — each row has EXACTLY the number of frames listed for that row above.
> 3. **Clean output** — fully transparent background; NO grid lines, borders, boxes, text, labels, numbers, or captions anywhere.
> 4. **On-model & separated** — outfit / hair / props identical in every frame; poses do not touch or overlap.

*Export from Aseprite as `ghost_employee.png` + `ghost_employee.json` (JSON Hash or
Array), with the tag names above spelled exactly:
`march attack stunned celebrate death`.*

> **Bosses only:** insert a **`cast`** row (EXACTLY 3 frames) between `attack` and
> `stunned` showing the boss channelling its signature `activeSkill`, and draw the
> boss larger, more detailed, and more menacing than a minion. Ghost Employee is a
> minion — it does **not** get this row.

---

## Export & QA reminders

- Transparent background, consistent frame size, no clipped limbs.
- Tag names MUST match the engine states 1:1 — see the checklist in
  `docs/CHARACTER_VISUAL_PROMPT_GUIDE.md` (Phase 4).
- Drop finished files in `public/assets/enemies/`: `ghost_employee.png`,
  `ghost_employee.json`.

## Integration status

**The engine side is already done** — `EnemyModel` is `Sprite`-based, every state
routes through the sprite-sheet path with a tween fallback, an enemy's atlas key
defaults to its `id`, and `GameScene.createEnemyAnimations()` auto-wires any enemy
atlas that loads. Until the art exists Ghost Employee renders the tinted
`enemy-base` placeholder (no broken texture) and still animates all states via
tweens.

**To light up the real art, once you've generated the sheet:**
1. Drop `ghost_employee.png` + `ghost_employee.json` into
   `public/assets/enemies/`.
2. In `GameScene.preload()`, uncomment:
   `this.load.aseprite('ghost_employee', '/assets/enemies/ghost_employee.png', '/assets/enemies/ghost_employee.json');`
   (atlas key defaults to the enemy `id` = `ghost_employee`). That's it — the
   states play from real frames automatically.
