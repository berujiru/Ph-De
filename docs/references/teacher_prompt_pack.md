# Teacher — Character Art Prompt Pack

Ready-to-paste prompts for generating **Teacher**, a fully-animated hero.
Follows the two-phase workflow in `docs/CHARACTER_VISUAL_PROMPT_GUIDE.md`:
**Phase 1** locks a consistent base + all camera angles; **Phase 2/3** reuse
that base image as a reference so every sheet stays on-model.

> Run these in an image-capable Claude/Gemini (not the coding CLI). Always
> **attach the previous phase's output** as reference before generating the next.

---

## Teacher Visual Bible (locked — keep identical across every phase)

No portrait exists yet — this bible is **synthesized** from her profession
(public school teacher), her weapon (a wooden *Pamalo* ruler she throws like a
boomerang), and her `balance.ts` color anchor `#8b5cf6` (violet). Do not drift:

- **Who:** Teacher — a dedicated, slightly frazzled Filipina **public school
  teacher**, mid-career. An everyday hardworking Filipina, warm and patient but
  fed up with nonsense — *not* a shiny fantasy warrior, *not* a specific real
  person. A communal parody archetype only.
- **Hair:** dark hair pinned up in a **neat practical bun**, a pen tucked
  behind one ear.
- **Signature read-at-a-glance cue:** a laminated **name-tag lanyard / school ID**
  swinging at her chest **and** the long wooden **ruler (Pamalo)** in hand — this
  pairing is her #1 silhouette read and must survive every angle.
- **Outfit:** a modest **violet button-down blouse / teacher's polo** (`#8b5cf6`)
  over a plain skirt or slacks, simple flat shoes; a faint dusting of chalk on the
  sleeves. Reading glasses.
- **Prop / weapon:** a long wooden **ruler (Pamalo)** she *tosses like a
  boomerang* — it spins out and returns, so she can read as holding one primed to
  throw.
- **Expression:** stern-but-caring — the "settle down, class" look, one eyebrow
  raised.
- **Style:** High-contrast anime cel-shaded art, flat colors, bold clean outer
  strokes, 2D mobile game asset (Persona 5 UI pop × Hades silhouette), plain
  solid/white background, isolated character.
- **Palette:** violet blouse (anchor `#8b5cf6`), dark hair, cream/pale-violet
  ruler highlights (`#ddd6fe`), brass lanyard clip, chalk-white accents. (Any
  engine tint is only a fallback for missing sprites — the real sheet uses her
  true colors, no flat wash.)

---

## Phase 1 — Base Concept + Camera Angles (do this first)

**Prompt:**
> Generate a comprehensive 2D character turnaround reference sheet for a mobile
> game character named Teacher.
>
> **Character:** A dedicated Filipina public school teacher, mid-career. Dark hair
> in a **neat bun** with a pen behind one ear, reading glasses; a modest **violet
> button-down teacher's polo** with a faint chalk dusting, plain skirt/slacks; a
> laminated **name-tag lanyard / school ID** at her chest; holding a long **wooden
> ruler (Pamalo)** she can throw. Stern-but-caring "settle down, class"
> expression. An everyday hardworking Filipina, not a fantasy warrior.
>
> **Style:** High-contrast anime cel-shaded art, flat colors, bold clean outer
> strokes, 2D mobile game asset (Persona 5 UI pop crossed with Hades
> silhouettes). Plain solid background, isolated character.
>
> **Required Layout:** Show the exact same character in a row from these angles.
> Clothing, proportions, hair bun, lanyard, and the wooden ruler must remain
> identical in every view:
> 1. **Front View:** looking directly at the camera.
> 2. **Side Profile:** 90-degree turn.
> 3. **Rear View (straight back):** looking completely away from the camera — we
>    see the back of her head, the bun, the lanyard strap, and her back.
> 4. **TOP-BEHIND (high-angle back view) — THE GAMEPLAY VIEW:** camera high above
>    and behind her, tilted (NOT flat zenith). We see the top of her head, the bun
>    from above, her shoulders and back as she faces away into the distance. This
>    is the angle her in-game sprites are drawn from — make it clean and clear.
> 5. **TOP-FRONT (high-angle front view):** camera high above and in front, tilted.
>    We see the top of her head plus her face, glasses, lanyard, and chest.
>
> Ensure the violet polo, the name-tag lanyard, and the wooden ruler are clearly
> readable in all five views.

*Save the result as `docs/references/teacher_base_turnaround.png`. This is the
base reference for every following phase.*

---

## Phase 2 — Animated Hero Sprite Sheet (TOP-BEHIND)

**Attach `teacher_base_turnaround.png` first**, then:

> Attached is the base turnaround sheet for Teacher. Generate a strictly
> formatted 2D sprite sheet for a top-down auto-battler.
>
> **Crucial Perspective:** Teacher is a Hero. The camera is a high top-down
> oblique above and BEHIND our front line, so Teacher faces AWAY from us into the
> enemy. **ALL frames must be drawn from a HIGH-ANGLE REAR VIEW (top-behind, back view)** — top of head, the bun and lanyard strap from above, shoulders, and back.
> Not a flat zenith, no side profiles, no low angles.
>
> **Style & Formatting:** Match the anime cel-shaded style of the reference
> exactly (violet polo, dark bun, name-tag lanyard, wooden ruler). Lay out as horizontal rows, one animation per row, each frame in its own evenly-spaced cell, non-overlapping, with consistent size and centering.
>
> **OUTPUT RULES (critical — the last generation drew these by mistake):** Fully **transparent** background — NO white fill. Do NOT draw any grid lines, cell borders, boxes, guide lines, or separators. Do NOT render any text, row names, labels, numbers, or captions anywhere in the image. Output ONLY the character art, arranged in evenly-spaced **invisible** cells.
>
> **MANDATORY LAYOUT — exactly 3 rows, in this exact top-to-bottom order:**
> 1. **`idle`** — EXACTLY 3 frames: standing, gentle breathing/bounce, the ruler
>    resting against her shoulder (rear view).
> 2. **`attack`** — EXACTLY 3 frames: her basic attack — **hurling the wooden
>    ruler (Pamalo) forward like a spinning boomerang**. Frame 2 is the clear
>    release frame, arm extended and the ruler spinning off into the distance
>    (rear view).
> 3. **`cast`** — EXACTLY 3 frames: her signature skill **Recess** — planting her
>    feet, **raising the ruler high and rapping it down / blowing a whistle** to
>    call class to order, a silencing ring of energy building around her (rear
>    view, dramatic).
>
> **SELF-CHECK — before returning the image, verify each item; if any FAILS, fix it and regenerate:**
> 1. **Consistent view** — every frame in every row uses the SAME camera angle stated above (heroes: rear / top-behind — we see the back; enemies: front / top-front — we see the face). No side profiles, no switching between front and back between frames.
> 2. **Frame counts** — each row has EXACTLY the number of frames listed for that row above.
> 3. **Clean output** — fully transparent background; NO grid lines, borders, boxes, text, labels, numbers, or captions anywhere.
> 4. **On-model & separated** — outfit / hair / props identical in every frame; poses do not touch or overlap.

*Export from Aseprite as `teacher.png` + `teacher.json` (JSON Hash or Array),
with the tag names above spelled exactly: `idle attack cast`.*

---

## Phase 3 — Recess Skill Cut-In (anime-style)

**Attach `teacher_base_turnaround.png` (or the front view) first**, then:

> Using the attached Teacher reference, generate a large high-resolution 2D
> portrait sequence for her dramatic "Ultimate Skill" cut-in. Skill name:
> **RECESS** (she snaps the whole class to attention, silencing enemy auras).
> Voice line: *"Class, QUIET! Makinig kayo!"*
>
> **Style:** Dramatic anime action shot, intense lighting, comic-book halftone
> overlays, dynamic speed lines. Close-up on upper body and face. Keep her violet
> polo, dark bun, reading glasses, name-tag lanyard, and wooden ruler on-model.
>
> Generate 3 separate poses:
> 1. **Anticipation:** drawing a sharp breath, raising the wooden ruler overhead,
>    dramatic shadow, coiled authority.
> 2. **Action/Shout:** the climax — mouth wide open commanding "QUIET!", the ruler
>    **cracking down toward the camera** with a foreshortened swing, impact
>    starburst and shockwave rings silencing the noise.
> 3. **Resolution:** a cool composed post-command pose, ruler tucked back under her
>    arm, glasses glinting, exhaling.

*Export as `teacher_cutin.png` + `teacher_cutin.json` (texture atlas). The in-game
`cast` body pose (Phase 2, row 4) plays underneath while this panel slides.*

---

## Export & QA reminders

- Transparent background, consistent frame size, no clipped limbs/ruler.
- Tag names MUST match the engine states 1:1 — see the checklist in
  `docs/CHARACTER_VISUAL_PROMPT_GUIDE.md` (Phase 4).
- Drop finished files in `public/assets/heroes/`:
  `teacher.png`, `teacher.json`, `teacher_cutin.png`, `teacher_cutin.json`.

## Integration status

**The engine side is already done** — the model layer is `Sprite`-based, every
state routes through the sprite-sheet path with a tween fallback, Teacher's
`spriteKey` resolves to `teacher`, and `GameScene.createHeroAnimations()`
auto-wires any hero atlas that loads. Until the art exists Teacher renders the
tinted `hero-base` placeholder (no broken texture) and still animates all six
states via tweens.

**To light up the real art, once you've generated the sheets:**
1. Drop `teacher.png` + `teacher.json` (and `teacher_cutin.png` +
   `teacher_cutin.json`) into `public/assets/heroes/`.
2. In `GameScene.preload()`, uncomment:
   `this.load.aseprite('teacher', '/assets/heroes/teacher.png', '/assets/heroes/teacher.json');`
   (atlas key === `spriteKey` === `teacher`). That's it — the six states play
   from real frames automatically.

**Still on the backlog (done when you're ready):** feed `teacher_cutin` into
`SkillCutIn` so the Recess cut-in plays real frames instead of the tinted
silhouette. The `cast` body pose already plays underneath.
