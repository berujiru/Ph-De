# Street Sweeper — Character Art Prompt Pack

Ready-to-paste prompts for generating **Street Sweeper**, a fully-animated hero.
Follows the two-phase workflow in `docs/CHARACTER_VISUAL_PROMPT_GUIDE.md`:
**Phase 1** locks a consistent base + all camera angles; **Phase 2/3** reuse
that base image as a reference so every sheet stays on-model.

> Run these in an image-capable Claude/Gemini (not the coding CLI). Always
> **attach the previous phase's output** as reference before generating the next.

---

## Street Sweeper Visual Bible (locked — keep identical across every phase)

No portrait exists yet — this bible is **synthesized** from the profession
(barangay street sweeper), the weapon (a **stick broom / *Walis Tingting*** swept
to send a linear debris wave), and the `balance.ts` color anchor `#a8a29e` (warm
taupe/dust grey). Do not drift:

- **Who:** Street Sweeper — a proud, tireless Filipina/o **barangay street
  sweeper**, keeper of the block. An everyday hardworking Filipino, humble and
  relentless — *not* a shiny fantasy warrior, *not* a specific real person. A
  communal parody archetype only.
- **Face/hair:** hair tied back under a wide **straw sun hat**, a **cloth
  face-bandana/mask** pulled up against the dust.
- **Signature read-at-a-glance cue:** the tall bristly **stick broom (Walis
  Tingting)** held like a staff **and** the wide **sun hat + face bandana** — this
  cluster is the #1 silhouette read and must survive every angle.
- **Outfit:** a dusty **taupe-grey barangay work shirt** (anchor `#a8a29e`) with
  a **thin reflective safety band** across the chest, long sleeves and gloves
  against grit, sturdy boots, a small **dustpan tucked at the belt**.
- **Prop / weapon:** a long **Walis Tingting (coconut-midrib stick broom)** swept
  in a big two-handed arc to launch a **linear wave of dust and debris** across
  the frontline.
- **Expression:** determined, no-nonsense — "not on my street" glare over the
  bandana.
- **Style:** High-contrast anime cel-shaded art, flat colors, bold clean outer
  strokes, 2D mobile game asset (Persona 5 UI pop × Hades silhouette), plain
  solid/white background, isolated character.
- **Palette:** taupe-grey work shirt (anchor `#a8a29e`), straw hat, warm-brown
  broom bristles, muted safety-band accent, dusty tan debris puffs. (Any engine
  tint is only a fallback for missing sprites — the real sheet uses the true
  colors, no flat wash.)

---

## Phase 1 — Base Concept + Camera Angles (do this first)

**Prompt:**
> Generate a comprehensive 2D character turnaround reference sheet for a mobile
> game character named Street Sweeper.
>
> **Character:** A proud, tireless Filipino barangay street sweeper. Hair tied
> back under a wide **straw sun hat**, a **cloth face-bandana** pulled up; a dusty
> **taupe-grey work shirt** with a thin reflective safety band, long sleeves,
> gloves, sturdy boots, and a small **dustpan tucked at the belt**; holding a tall
> bristly **stick broom (Walis Tingting)** like a staff. Determined, no-nonsense
> expression. An everyday hardworking Filipino, not a fantasy warrior.
>
> **Style:** High-contrast anime cel-shaded art, flat colors, bold clean outer
> strokes, 2D mobile game asset (Persona 5 UI pop crossed with Hades
> silhouettes). Plain solid background, isolated character.
>
> **Required Layout:** Show the exact same character in a row from these angles.
> Clothing, proportions, the straw hat, bandana, and the stick broom must remain
> identical in every view:
> 1. **Front View:** looking directly at the camera.
> 2. **Side Profile:** 90-degree turn.
> 3. **Rear View (straight back):** looking completely away from the camera — we
>    see the back of the straw hat and the work shirt, broom held to one side.
> 4. **TOP-BEHIND (high-angle rear 3/4) — THE GAMEPLAY VIEW:** camera high above
>    and behind them, tilted (NOT flat zenith). We see the top of the straw hat,
>    shoulders and back from above, and the tall broom as they face away into the
>    distance. This is the angle their in-game sprites are drawn from — make it
>    clean and clear.
> 5. **TOP-FRONT (high-angle front 3/4):** camera high above and in front, tilted.
>    We see the top of the straw hat plus the bandana-covered face and chest, broom
>    held ready.
>
> Ensure the wide straw hat, the taupe-grey work shirt, and the stick broom are
> clearly readable in all five views.

*Save the result as `docs/references/street_sweeper_base_turnaround.png`. This is
the base reference for every following phase.*

---

## Phase 2 — Animated Hero Sprite Sheet (TOP-BEHIND)

**Attach `street_sweeper_base_turnaround.png` first**, then:

> Attached is the base turnaround sheet for Street Sweeper. Generate a strictly
> formatted 2D sprite sheet for a top-down auto-battler.
>
> **Crucial Perspective:** Street Sweeper is a Hero. The camera is a high top-down
> oblique above and BEHIND our front line, so they face AWAY from us into the
> enemy. **ALL frames must be drawn from a HIGH-ANGLE REAR VIEW (top-behind, rear
> 3/4)** — top of the straw hat, shoulders and back from above. Not a flat zenith,
> no side profiles, no low angles.
>
> **Style & Formatting:** Match the anime cel-shaded style of the reference
> exactly (taupe-grey work shirt, straw hat, face bandana, stick broom). Lay out as horizontal rows, one animation per row, each frame in its own evenly-spaced cell, non-overlapping, with consistent size and centering.
>
> **OUTPUT RULES (critical — the last generation drew these by mistake):** Fully **transparent** background — NO white fill. Do NOT draw any grid lines, cell borders, boxes, guide lines, or separators. Do NOT render any text, row names, labels, numbers, or captions anywhere in the image. Output ONLY the character art, arranged in evenly-spaced **invisible** cells.
>
> **MANDATORY LAYOUT — exactly 6 rows, in this exact top-to-bottom order:**
> 1. **`idle`** — EXACTLY 3 frames: standing, gentle breathing/bounce, broom
>    resting upright at their side (rear view).
> 2. **`march`** — EXACTLY 4 frames: a full walk cycle advancing forward, a steady
>    purposeful stride, broom shouldered (rear view).
> 3. **`attack`** — EXACTLY 3 frames: their basic attack — **a big two-handed sweep
>    of the Walis Tingting sending a linear wave of dust and debris forward across
>    the frontline**. Frame 2 is the clear impact frame, broom at full extension
>    with the dust-wave launching away (rear view).
> 4. **`cast`** — EXACTLY 3 frames: their signature skill **Dust Storm** —
>    whirling the broom in rapid strokes to **kick up a blinding cloud of dust**
>    that billows out ahead, energy building (rear view, dramatic).
> 5. **`celebrate`** — EXACTLY 2 frames: victory cheer, **raised fist**, broom
>    hoisted overhead, head turned slightly so we catch the grin over the bandana
>    (rear-3/4 view).
> 6. **`defeat`** — EXACTLY 2 frames: morale broken — leaning the broom down and
>    **taking a knee**, slumped and exhausted, hat tipping (rear view). They are
>    tired, NOT dead.
>
> **SELF-CHECK — before returning the image, verify each item; if any FAILS, fix it and regenerate:**
> 1. **Consistent view** — every frame in every row uses the SAME camera angle stated above (heroes: rear / top-behind — we see the back; enemies: front / top-front — we see the face). No side profiles, no switching between front and back between frames.
> 2. **Frame counts** — each row has EXACTLY the number of frames listed for that row above.
> 3. **Clean output** — fully transparent background; NO grid lines, borders, boxes, text, labels, numbers, or captions anywhere.
> 4. **On-model & separated** — outfit / hair / props identical in every frame; poses do not touch or overlap.

*Export from Aseprite as `street_sweeper.png` + `street_sweeper.json` (JSON Hash
or Array), with the tag names above spelled exactly: `idle march attack cast
celebrate defeat`.*

---

## Phase 3 — Dust Storm Skill Cut-In (anime-style)

**Attach `street_sweeper_base_turnaround.png` (or the front view) first**, then:

> Using the attached Street Sweeper reference, generate a large high-resolution 2D
> portrait sequence for their dramatic "Ultimate Skill" cut-in. Skill name: **DUST
> STORM** (a blinding dust cloud that slows enemies and cuts their damage). Voice
> line: *"Ang dumi niyo! Walang kalat!"*
>
> **Style:** Dramatic anime action shot, intense lighting, comic-book halftone
> overlays, dynamic speed lines. Close-up on upper body and face. Keep the straw
> hat, face bandana, taupe-grey work shirt, and stick broom on-model.
>
> Generate 3 separate poses:
> 1. **Anticipation:** gripping the broom low with both hands, a deep breath,
>    dramatic shadow, first wisps of dust curling up.
> 2. **Action/Shout:** the climax — eyes blazing over the bandana shouting "Walang
>    kalat!", the **broom swept hard and foreshortened toward the camera**, a huge
>    billowing dust cloud and gritty speed lines filling the frame.
> 3. **Resolution:** a cool post-sweep pose, broom planted upright like a staff,
>    dust settling, a proud nod, exhaling.

*Export as `street_sweeper_cutin.png` + `street_sweeper_cutin.json` (texture
atlas). The in-game `cast` body pose (Phase 2, row 4) plays underneath while this
panel slides.*

---

## Export & QA reminders

- Transparent background, consistent frame size, no clipped limbs/broom.
- Tag names MUST match the engine states 1:1 — see the checklist in
  `docs/CHARACTER_VISUAL_PROMPT_GUIDE.md` (Phase 4).
- Drop finished files in `public/assets/heroes/`:
  `street_sweeper.png`, `street_sweeper.json`, `street_sweeper_cutin.png`,
  `street_sweeper_cutin.json`.

## Integration status

**The engine side is already done** — the model layer is `Sprite`-based, every
state routes through the sprite-sheet path with a tween fallback, Street
Sweeper's `spriteKey` resolves to `street_sweeper`, and
`GameScene.createHeroAnimations()` auto-wires any hero atlas that loads. Until the
art exists Street Sweeper renders the tinted `hero-base` placeholder (no broken
texture) and still animates all six states via tweens.

**To light up the real art, once you've generated the sheets:**
1. Drop `street_sweeper.png` + `street_sweeper.json` (and
   `street_sweeper_cutin.png` + `street_sweeper_cutin.json`) into
   `public/assets/heroes/`.
2. In `GameScene.preload()`, uncomment:
   `this.load.aseprite('street_sweeper', '/assets/heroes/street_sweeper.png', '/assets/heroes/street_sweeper.json');`
   (atlas key === `spriteKey` === `street_sweeper`). That's it — the six states
   play from real frames automatically.

**Still on the backlog (done when you're ready):** feed `street_sweeper_cutin`
into `SkillCutIn` so the Dust Storm cut-in plays real frames instead of the
tinted silhouette. The `cast` body pose already plays underneath.
