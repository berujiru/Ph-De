# Eden — Character Art Prompt Pack

Ready-to-paste prompts for generating **Eden**, the first fully-animated hero.
Follows the two-phase workflow in `docs/CHARACTER_VISUAL_PROMPT_GUIDE.md`:
**Phase 1** locks a consistent base + all camera angles; **Phase 2/3** reuse
that base image as a reference so every sheet stays on-model.

> Run these in an image-capable Claude/Gemini (not the coding CLI). Always
> **attach the previous phase's output** as reference before generating the next.

---

## Eden Visual Bible (locked — keep identical across every phase)

Derived from her canonical HUD portrait (`eden_portrait.png`). Do not drift:

- **Who:** Eden — a young adult Filipina **community organizer**, leader of the
  alliance. An everyday hardworking Filipina, warm and defiant — *not* a shiny
  fantasy warrior, *not* a specific real person.
- **Hair:** long, straight, glossy black hair past the shoulders.
- **Signature headwear:** a large **pink bow headband with light-blue polka
  dots** (her #1 read-at-a-glance silhouette cue — must survive every angle).
- **Outfit:** short-sleeve **pink t-shirt** with a subtle heart/graphic on the
  chest; simple, casual, streetwear.
- **Prop / weapon:** a handheld **red-and-white megaphone (bullhorn)**. She
  *throws* megaphones as her attack, so she can carry a spare/holster read.
- **Expression:** determined but optimistic — a slight confident smile, with
  **expressive anime eyes** (large, bright, bold highlights).
- **Style:** **High-contrast anime-style cel-shading** (canonical hero look) —
  expressive anime face and proportions, dynamic anime key-art energy, flat cel
  colors, bold clean outer strokes, 2D mobile game asset (anime × Persona 5 UI
  pop × Hades silhouette), plain solid/white background, isolated character.
  Bold and readable at small mobile size — anime *energy*, not busy detail.
- **Palette:** pink top, black hair, pink+blue bow, red/white megaphone. (The
  engine tint `#3b82f6` is only a fallback for missing sprites — the real sheet
  uses her true colors, no blue wash.)

---

## Phase 1 — Base Concept + Camera Angles (do this first)

**Prompt:**
> Generate a comprehensive 2D character turnaround reference sheet for a mobile
> game character named Eden.
>
> **Character:** A young adult Filipina community organizer. Long straight glossy
> black hair past the shoulders; a large **pink bow headband with light-blue
> polka dots**; a casual **pink short-sleeve t-shirt** with a small heart graphic
> on the chest; holding a **red-and-white handheld megaphone**. Warm, determined
> expression with a slight confident smile. An everyday hardworking Filipina, not
> a fantasy warrior.
>
> **Style:** High-contrast anime-style cel-shading — expressive anime face and
> proportions, dynamic anime key-art energy, flat colors, bold clean outer
> strokes, 2D mobile game asset (anime crossed with Persona 5 UI pop and Hades
> silhouettes). Plain solid background, isolated character.
>
> **Required Layout:** Show the exact same character in a row from these angles.
> Clothing, proportions, hair, bow, and the megaphone must remain identical in
> every view:
> 1. **Front View:** looking directly at the camera (matches the HUD portrait).
> 2. **Side Profile:** 90-degree turn.
> 3. **Rear View (straight back):** looking completely away from the camera — we
>    see the back of her head, the bow, and her back.
> 4. **TOP-BEHIND (high-angle back view) — THE GAMEPLAY VIEW:** camera high above
>    and behind her, tilted (NOT flat zenith). We see the top of her head, the
>    bow from above, her shoulders and back as she faces away into the distance.
>    This is the angle her in-game sprites are drawn from — make it clean and
>    clear.
> 5. **TOP-FRONT (high-angle front view):** camera high above and in front,
>    tilted. We see the top of her head plus her face and chest.
>
> Ensure the pink polka-dot bow and the red-and-white megaphone are clearly
> readable in all five views.

*Save the result as `docs/references/eden_base_turnaround.png`. This is the base
reference for every following phase.*

---

## Phase 2 — Animated Hero Sprite Sheet (TOP-BEHIND)

**Attach `eden_base_turnaround.png` first**, then:

> Attached is the base turnaround sheet for Eden. Generate a strictly formatted
> 2D sprite sheet for a top-down auto-battler.
>
> **Crucial Perspective:** Eden is a Hero. The camera is a high top-down oblique
> above and BEHIND our front line, so Eden faces AWAY from us into the enemy.
> **ALL frames must be drawn from a HIGH-ANGLE REAR VIEW (top-behind, back view)**
> — top of head, the pink bow from above, shoulders, and back. Not a flat
> zenith, no side profiles, no low angles.
> **This applies to EVERY row, no exceptions** — idle stands facing away; attack
> throws the megaphone forward *still seen from behind*; cast raises the megaphone
> overhead, seen from behind. **If her face or a side silhouette is visible in any
> frame, that frame is WRONG — redraw it from behind.**
>
> **Style & Formatting:** Match the anime cel-shaded style of the reference
> exactly (pink tee, black hair, pink+blue polka-dot bow, red/white megaphone). Lay out as horizontal rows, one animation per row, each frame in its own evenly-spaced cell, non-overlapping, with consistent size and centering.
>
> **OUTPUT RULES (critical — the last generation drew these by mistake):** Fully **transparent** background — NO white fill. Do NOT draw any grid lines, cell borders, boxes, guide lines, or separators. Do NOT render any text, row names, labels, numbers, or captions anywhere in the image. Output ONLY the character art, arranged in evenly-spaced **invisible** cells.
>
> **MANDATORY LAYOUT — exactly 3 rows, in this exact top-to-bottom order:**
> 1. **`idle`** — EXACTLY 3 frames: standing, gentle breathing/bounce, megaphone
>    at her side (rear view).
> 2. **`attack`** — EXACTLY 3 frames: winding up and **hurling a megaphone
>    forward** like a throw. Frame 2 is the clear release/impact frame, arm
>    extended (rear view).
> 3. **`cast`** — EXACTLY 3 frames: her signature skill **Rally** — planting her
>    feet, **raising the megaphone high** and shouting, building energy (rear
>    view, dramatic).
>
> **SELF-CHECK — before returning the image, verify each item; if any FAILS, fix it and regenerate:**
> 1. **Consistent view** — every frame in every row uses the SAME camera angle stated above (heroes: rear / top-behind — we see the back; enemies: front / top-front — we see the face). No side profiles, no switching between front and back between frames.
> 2. **Frame counts** — each row has EXACTLY the number of frames listed for that row above.
> 3. **Clean output** — fully transparent background; NO grid lines, borders, boxes, text, labels, numbers, or captions anywhere.
> 4. **On-model & separated** — outfit / hair / props identical in every frame; poses do not touch or overlap.

*Export from Aseprite as `eden.png` + `eden.json` (JSON Hash or Array), with the
tag names above spelled exactly: `idle attack cast`.*

---

## Separate store assets — skill & cut-in (own packs)

The signature **skill effect** and the anime **cut-in ("cut-out") animation** are
authored as **standalone, individually customizable store assets** — each has its
own pack so they can be swapped/sold independently of the base sprite sheet:

- **Skill VFX** → [`eden_skill_prompt_pack.md`](eden_skill_prompt_pack.md) — the
  in-world Rally effect (buff aura / shockwave) that plays when the skill fires.
- **Cut-in animation** → [`eden_cutin_prompt_pack.md`](eden_cutin_prompt_pack.md)
  — the dramatic anime "Ultimate Skill" cut-out that slides across screen.

This base pack now covers **only the character sprite sheet** (Phase 1 + Phase 2).

---

## Export & QA reminders

- Transparent background, consistent frame size, no clipped limbs/megaphone.
- Tag names MUST match the engine states 1:1 — see the checklist in
  `docs/CHARACTER_VISUAL_PROMPT_GUIDE.md` (Phase 4).
- Drop finished sprite-sheet files in `public/assets/heroes/`:
  `eden.png`, `eden.json`. (The `eden_cutin.*` files are covered by the cut-in
  pack; the skill VFX by the skill pack.)

## Integration status

**The engine side is already done** — the model layer is `Sprite`-based, every
state routes through the sprite-sheet path with a tween fallback, Eden's
`spriteKey` is `eden`, and `GameScene.createHeroAnimations()` auto-wires any
hero atlas that loads. Until the art exists Eden renders the tinted `hero-base`
placeholder (no broken texture) and still animates all six states via tweens.

**To light up the real art, once you've generated the sprite sheet:**
1. Drop `eden.png` + `eden.json` into `public/assets/heroes/`.
2. In `GameScene.preload()`, uncomment:
   `this.load.aseprite('eden', '/assets/heroes/eden.png', '/assets/heroes/eden.json');`
   That's it — the six states play from real frames automatically.

The **cut-in** and **skill VFX** wiring lives in their own packs
(`eden_cutin_prompt_pack.md`, `eden_skill_prompt_pack.md`).
