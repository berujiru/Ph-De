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
- **Expression:** determined but optimistic — a slight confident smile.
- **Style:** High-contrast cel-shaded vector art, flat colors, bold clean outer
  strokes, 2D mobile game asset (Persona 5 UI pop × Hades silhouette), plain
  solid/white background, isolated character.
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
> **Style:** High-contrast cel-shaded vector art, flat colors, bold clean outer
> strokes, 2D mobile game asset (Persona 5 UI pop crossed with Hades
> silhouettes). Plain solid background, isolated character.
>
> **Required Layout:** Show the exact same character in a row from these angles.
> Clothing, proportions, hair, bow, and the megaphone must remain identical in
> every view:
> 1. **Front View:** looking directly at the camera (matches the HUD portrait).
> 2. **Side Profile:** 90-degree turn.
> 3. **Rear View (straight back):** looking completely away from the camera — we
>    see the back of her head, the bow, and her back.
> 4. **TOP-BEHIND (high-angle rear 3/4) — THE GAMEPLAY VIEW:** camera high above
>    and behind her, tilted (NOT flat zenith). We see the top of her head, the
>    bow from above, her shoulders and back as she faces away into the distance.
>    This is the angle her in-game sprites are drawn from — make it clean and
>    clear.
> 5. **TOP-FRONT (high-angle front 3/4):** camera high above and in front,
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
> **ALL frames must be drawn from a HIGH-ANGLE REAR VIEW (top-behind, rear 3/4)**
> — top of head, the pink bow from above, shoulders, and back. Not a flat
> zenith, no side profiles, no low angles.
>
> **Style & Formatting:** Match the cel-shaded vector style of the reference
> exactly (pink tee, black hair, pink+blue polka-dot bow, red/white megaphone).
> Clean grid, one animation per row, evenly spaced, non-overlapping poses, on a
> transparent or solid white background. Consistent frame size and centering.
>
> **MANDATORY LAYOUT — exactly 6 labelled rows:**
> 1. **`idle`** — EXACTLY 3 frames: standing, gentle breathing/bounce, megaphone
>    at her side (rear view).
> 2. **`march`** — EXACTLY 4 frames: a full walk cycle advancing forward, marching
>    with purpose (rear view).
> 3. **`attack`** — EXACTLY 3 frames: winding up and **hurling a megaphone
>    forward** like a throw. Frame 2 is the clear release/impact frame, arm
>    extended (rear view).
> 4. **`cast`** — EXACTLY 3 frames: her signature skill **Rally** — planting her
>    feet, **raising the megaphone high** and shouting, building energy (rear
>    view, dramatic).
> 5. **`celebrate`** — EXACTLY 2 frames: victory cheer, **raised fist**, jumping,
>    head turned slightly so we catch her grin (rear-3/4 view).
> 6. **`defeat`** — EXACTLY 2 frames: morale broken — lowering the megaphone and
>    **taking a knee**, slumped and exhausted (rear view). She is tired, NOT dead.
>
> Verify every frame in every row is present in the final grid.

*Export from Aseprite as `eden.png` + `eden.json` (JSON Hash or Array), with the
tag names above spelled exactly: `idle march attack cast celebrate defeat`.*

---

## Phase 3 — Rally Skill Cut-In (anime-style)

**Attach `eden_base_turnaround.png` (or the front view) first**, then:

> Using the attached Eden reference, generate a large high-resolution 2D portrait
> sequence for her dramatic "Ultimate Skill" cut-in. Skill name: **RALLY**
> (she screams into her megaphone to fire up the whole squad). Voice line:
> *"Sugod, mga kababayan! Walang aatras!"*
>
> **Style:** Dramatic anime action shot, intense lighting, comic-book halftone
> overlays, dynamic speed lines. Close-up on upper body and face. Keep her pink
> polka-dot bow, black hair, pink tee, and red/white megaphone on-model.
>
> Generate 3 separate poses:
> 1. **Anticipation:** inhaling, raising the megaphone toward her mouth, dramatic
>    shadow, coiled energy.
> 2. **Action/Shout:** the climax — mouth wide open screaming into the megaphone,
>    the bullhorn foreshortened dramatically toward the camera, sound-blast rings.
> 3. **Resolution:** a cool defiant post-shout pose, fist up or megaphone lowered,
>    exhaling.

*Export as `eden_cutin.png` + `eden_cutin.json` (texture atlas). The in-game
`cast` body pose (Phase 2, row 4) plays underneath while this panel slides.*

---

## Export & QA reminders

- Transparent background, consistent frame size, no clipped limbs/megaphone.
- Tag names MUST match the engine states 1:1 — see the checklist in
  `docs/CHARACTER_VISUAL_PROMPT_GUIDE.md` (Phase 4).
- Drop finished files in `public/assets/heroes/`:
  `eden.png`, `eden.json`, `eden_cutin.png`, `eden_cutin.json`.

## Integration status

**The engine side is already done** — the model layer is `Sprite`-based, every
state routes through the sprite-sheet path with a tween fallback, Eden's
`spriteKey` is `eden`, and `GameScene.createHeroAnimations()` auto-wires any
hero atlas that loads. Until the art exists Eden renders the tinted `hero-base`
placeholder (no broken texture) and still animates all six states via tweens.

**To light up the real art, once you've generated the sheets:**
1. Drop `eden.png` + `eden.json` (and `eden_cutin.png` + `eden_cutin.json`) into
   `public/assets/heroes/`.
2. In `GameScene.preload()`, uncomment:
   `this.load.aseprite('eden', '/assets/heroes/eden.png', '/assets/heroes/eden.json');`
   That's it — the six states play from real frames automatically.

**Still on the backlog (I do this when you're ready):** feed `eden_cutin` into
`SkillCutIn` so the Rally cut-in plays real frames instead of the tinted
silhouette. The `cast` body pose already plays underneath.
