# Nurse — Character Art Prompt Pack

Ready-to-paste prompts for generating **Nurse**, a Holy projectile support hero.
Follows the two-phase workflow in `docs/CHARACTER_VISUAL_PROMPT_GUIDE.md`:
**Phase 1** locks a consistent base + all camera angles; **Phase 2/3** reuse
that base image as a reference so every sheet stays on-model.

> Run these in an image-capable Claude/Gemini (not the coding CLI). Always
> **attach the previous phase's output** as reference before generating the next.

---

## Nurse Visual Bible (locked — keep identical across every phase)

Synthesized from her profession + weapon (no portrait exists yet). An everyday
hardworking Filipino frontline health worker — a **communal parody archetype**,
never a specific real person's likeness, name, or voice. Do not drift:

- **Who:** a caring, unflappable adult Filipino **public health nurse** — the
  barangay-clinic / RHU frontliner. Compassionate but steely under pressure.
  *Not* a shiny fantasy warrior, *not* any specific real person.
- **Signature gear (her #1 read-at-a-glance silhouette cue):** crisp **white
  nurse scrubs with a nurse cap bearing a small red cross**, a **stethoscope
  around the neck**, and a slung **first-aid / medicine belt-pouch**. That
  white-scrubs + red-cross-cap read must survive every angle.
- **Prop / weapon:** a handheld **alcohol/antiseptic spray bottle** (and spare
  syringes on the belt). She *sprays a mist of alcohol* forward as her attack — a
  fine ranged spritz that heals allies it passes through.
- **Outfit:** white scrubs, comfortable rubber shoes, a lanyard ID clip.
- **Expression:** calm, reassuring, quietly determined.
- **Style:** High-contrast anime cel-shaded art, flat colors, bold clean outer
  strokes, 2D mobile game asset (Persona 5 UI pop × Hades silhouette), plain
  solid/white background, isolated character.
- **Palette:** anchored on **`#fca5a5` (soft healing rose/salmon)** for the red
  cross, glowing spray, and accents; crisp clinical white scrubs, teal-mint
  lanyard, warm tan skin, a gentle Holy glow. (The engine tint `#fca5a5` is only
  a fallback for missing sprites — the real sheet uses these true colors, no flat
  wash.)

---

## Phase 1 — Base Concept + Camera Angles (do this first)

**Prompt:**
> Generate a comprehensive 2D character turnaround reference sheet for a mobile
> game character named Nurse.
>
> **Character:** A caring, steely adult Filipino public health nurse. She wears
> **crisp white nurse scrubs with a nurse cap bearing a small red cross**, a
> **stethoscope around her neck**, and a slung **first-aid medicine belt-pouch**.
> She holds an **alcohol / antiseptic spray bottle**, with spare syringes on the
> belt. Calm, reassuring, quietly determined expression. An everyday hardworking
> Filipino frontline health worker, not a fantasy warrior.
>
> **Style:** High-contrast anime cel-shaded art, flat colors, bold clean outer
> strokes, 2D mobile game asset (Persona 5 UI pop crossed with Hades
> silhouettes). Plain solid background, isolated character.
>
> **Required Layout:** Show the exact same character in a row from these angles.
> Clothing, proportions, the red-cross cap, stethoscope, and the spray bottle
> must remain identical in every view:
> 1. **Front View:** looking directly at the camera.
> 2. **Side Profile:** 90-degree turn.
> 3. **Rear View (straight back):** looking completely away from the camera — we
>    see the back of her head, the cap, the stethoscope loop, and the belt-pouch.
> 4. **TOP-BEHIND (high-angle rear 3/4) — THE GAMEPLAY VIEW:** camera high above
>    and behind her, tilted (NOT flat zenith). We see the top of her head, the
>    red-cross cap from above, her shoulders and back as she faces away into the
>    distance. This is the angle her in-game sprites are drawn from — make it
>    clean and clear.
> 5. **TOP-FRONT (high-angle front 3/4):** camera high above and in front,
>    tilted. We see the top of her head plus her face, the stethoscope, and the
>    spray bottle.
>
> Ensure the red-cross nurse cap, stethoscope, and alcohol spray bottle are
> clearly readable in all five views.

*Save the result as `docs/references/nurse_base_turnaround.png`. This is the base
reference for every following phase.*

---

## Phase 2 — Animated Hero Sprite Sheet (TOP-BEHIND)

**Attach `nurse_base_turnaround.png` first**, then:

> Attached is the base turnaround sheet for Nurse. Generate a strictly formatted
> 2D sprite sheet for a top-down auto-battler.
>
> **Crucial Perspective:** Nurse is a Hero. The camera is a high top-down oblique
> above and BEHIND our front line, so she faces AWAY from us into the enemy.
> **ALL frames must be drawn from a HIGH-ANGLE REAR VIEW (top-behind, rear 3/4)**
> — top of head, the red-cross cap from above, shoulders, and back. Not a flat
> zenith, no side profiles, no low angles.
>
> **Style & Formatting:** Match the anime cel-shaded style of the reference
> exactly (white scrubs, red-cross cap, stethoscope, rose Holy glow). Clean grid,
> one animation per row, evenly spaced, non-overlapping poses, on a transparent
> or solid white background. Consistent frame size and centering.
>
> **MANDATORY LAYOUT — exactly 6 labelled rows:**
> 1. **`idle`** — EXACTLY 3 frames: standing, gentle breathing/bounce, spray
>    bottle held ready at her side (rear view).
> 2. **`march`** — EXACTLY 4 frames: a full walk cycle advancing forward,
>    purposeful clinical stride (rear view).
> 3. **`attack`** — EXACTLY 3 frames: raising the **alcohol spray bottle and
>    spritzing a fine forward mist** at the enemy. Frame 2 is the clear
>    release/impact frame, arm extended, a cone of glowing droplets leaving the
>    nozzle (rear view).
> 4. **`cast`** — EXACTLY 3 frames: her signature skill **Vaccine Drive** —
>    planting her feet, **raising a glowing syringe high** so a Holy shield-pulse
>    radiates out to the squad, building energy (rear view, dramatic).
> 5. **`celebrate`** — EXACTLY 2 frames: victory cheer, **raised fist**, a small
>    hop, head turned slightly so we catch her relieved grin (rear-3/4 view).
> 6. **`defeat`** — EXACTLY 2 frames: morale broken — lowering the spray bottle
>    and **taking a knee**, slumped and exhausted (rear view). She is tired, NOT
>    dead.
>
> Verify every frame in every row is present in the final grid.

*Export from Aseprite as `nurse.png` + `nurse.json` (JSON Hash or Array), with
the tag names above spelled exactly: `idle march attack cast celebrate defeat`.*

---

## Phase 3 — Vaccine Drive Skill Cut-In (anime-style)

**Attach `nurse_base_turnaround.png` (or the front view) first**, then:

> Using the attached Nurse reference, generate a large high-resolution 2D
> portrait sequence for her dramatic "Ultimate Skill" cut-in. Skill name:
> **VACCINE DRIVE** (she inoculates the whole squad, granting brief immunity to
> all debuffs). Voice line:
> *"Pila nang maayos! Parang kagat lang ng langgam 'to!"*
>
> **Style:** Dramatic anime action shot, intense lighting, comic-book halftone
> overlays, dynamic speed lines. Close-up on upper body and face. Keep her
> red-cross nurse cap, white scrubs, stethoscope, and syringe on-model.
>
> Generate 3 separate poses:
> 1. **Anticipation:** priming a glowing syringe, flicking the barrel, a bead of
>    light at the needle tip, dramatic shadow and coiled energy.
> 2. **Action/Shout:** the climax — thrusting the glowing syringe forward/up, a
>    Holy healing shockwave and radiant plus-signs bursting outward, the needle
>    foreshortened dramatically toward the camera.
> 3. **Resolution:** a cool reassuring pose, syringe capped, a confident nod and
>    thumbs-up.

*Export as `nurse_cutin.png` + `nurse_cutin.json` (texture atlas). The in-game
`cast` body pose (Phase 2, row 4) plays underneath while this panel slides.*

---

## Export & QA reminders

- Transparent background, consistent frame size, no clipped limbs/spray bottle.
- Tag names MUST match the engine states 1:1 — see the checklist in
  `docs/CHARACTER_VISUAL_PROMPT_GUIDE.md` (Phase 4).
- Drop finished files in `public/assets/heroes/`:
  `nurse.png`, `nurse.json`, `nurse_cutin.png`, `nurse_cutin.json`.

## Integration status

**The engine side is already done** — the model layer is `Sprite`-based, every
state routes through the sprite-sheet path with a tween fallback, Nurse's
`spriteKey` is `nurse`, and `GameScene.createHeroAnimations()` auto-wires any
hero atlas that loads. Until the art exists Nurse renders the tinted `hero-base`
placeholder (no broken texture) and still animates all six states via tweens.

**To light up the real art, once you've generated the sheets:**
1. Drop `nurse.png` + `nurse.json` (and `nurse_cutin.png` + `nurse_cutin.json`)
   into `public/assets/heroes/`.
2. In `GameScene.preload()`, uncomment:
   `this.load.aseprite('nurse', '/assets/heroes/nurse.png', '/assets/heroes/nurse.json');`
   (atlas key === `spriteKey` === `nurse`). That's it — the six states play from
   real frames automatically.

**Still on the backlog (I do this when you're ready):** feed `nurse_cutin` into
`SkillCutIn` so the Vaccine Drive cut-in plays real frames instead of the tinted
silhouette. The `cast` body pose already plays underneath.
