# Farmer — Character Art Prompt Pack

Ready-to-paste prompts for generating **Farmer (Magsasaka)**, a fully-animated
hero. Follows the two-phase workflow in
`docs/CHARACTER_VISUAL_PROMPT_GUIDE.md`: **Phase 1** locks a consistent base +
all camera angles; **Phase 2/3** reuse that base image as a reference so every
sheet stays on-model.

> Run these in an image-capable Claude/Gemini (not the coding CLI). Always
> **attach the previous phase's output** as reference before generating the next.

---

## Farmer Visual Bible (locked — keep identical across every phase)

Synthesized from his profession + attack (no portrait exists yet). Do not drift:

- **Who:** Farmer — a weathered but sturdy adult Filipino **farmer
  (magsasaka)**, sun-tanned and hardworking. An everyday citizen worker, proud
  and grounded — *not* a fantasy warrior, *not* a specific real person.
- **Signature headwear:** a wide-brimmed woven **salakot** (rice hat) — his #1
  read-at-a-glance silhouette cue; the low round dome must survive every angle.
- **Outfit:** a rolled-sleeve **kamiseta / faded work shirt** and rough work
  trousers, a **kundiman/plaid** cloth slung at the waist or over one shoulder;
  mud-scuffed boots. Simple, rural, hardwearing.
- **Prop / weapon:** a curved single-handed **karit (harvest sickle/scythe)**
  with a worn wooden handle and a bright steel crescent blade. He *cleaves* the
  grass and enemies in a short arc.
- **Expression:** quietly determined, weather-lined, unshakeable.
- **Style:** High-contrast anime cel-shaded art, flat colors, bold clean outer
  strokes, 2D mobile game asset (Persona 5 UI pop × Hades silhouette), plain
  solid/white background, isolated character.
- **Palette:** deep field-green shirt anchored on `#15803d` (his team tint),
  tan/straw salakot, brown trousers, silver-steel karit blade with a warm wood
  handle. Earthy greens and browns dominate.

---

## Phase 1 — Base Concept + Camera Angles (do this first)

**Prompt:**
> Generate a comprehensive 2D character turnaround reference sheet for a mobile
> game character named Farmer.
>
> **Character:** A weathered, sturdy adult Filipino farmer (magsasaka),
> sun-tanned and hardworking. Wearing a wide-brimmed woven **salakot rice hat**;
> a rolled-sleeve faded work shirt and rough trousers with a plaid cloth at the
> waist; mud-scuffed boots. Holding a curved single-handed **karit (harvest
> sickle)** with a worn wooden handle and a bright steel crescent blade. Quietly
> determined, weather-lined expression. An everyday hardworking Filipino worker,
> not a fantasy warrior.
>
> **Style:** High-contrast anime cel-shaded art, flat colors, bold clean outer
> strokes, 2D mobile game asset (Persona 5 UI pop crossed with Hades
> silhouettes). Plain solid background, isolated character.
>
> **Color palette:** deep field-green shirt (anchor `#15803d`), tan/straw
> salakot, brown trousers, silver-steel sickle blade with warm wood handle.
>
> **Required Layout:** Show the exact same character in a row from these angles.
> Clothing, proportions, salakot, and the karit must remain identical in every
> view:
> 1. **Front View:** looking directly at the camera.
> 2. **Side Profile:** 90-degree turn.
> 3. **Rear View (straight back):** looking completely away from the camera — we
>    see the back of the salakot and his back.
> 4. **TOP-BEHIND (high-angle rear 3/4) — THE GAMEPLAY VIEW:** camera high above
>    and behind him, tilted (NOT flat zenith). We see the top of the salakot from
>    above, his shoulders and back as he faces away into the distance. This is the
>    angle his in-game sprites are drawn from — make it clean and clear.
> 5. **TOP-FRONT (high-angle front 3/4):** camera high above and in front,
>    tilted. We see the top of the salakot plus his face and chest.
>
> Ensure the woven salakot and the steel karit are clearly readable in all five
> views.

*Save the result as `docs/references/farmer_base_turnaround.png`. This is the
base reference for every following phase.*

---

## Phase 2 — Animated Hero Sprite Sheet (TOP-BEHIND)

**Attach `farmer_base_turnaround.png` first**, then:

> Attached is the base turnaround sheet for Farmer. Generate a strictly formatted
> 2D sprite sheet for a top-down auto-battler.
>
> **Crucial Perspective:** Farmer is a Hero. The camera is a high top-down oblique
> above and BEHIND our front line, so Farmer faces AWAY from us into the enemy.
> **ALL frames must be drawn from a HIGH-ANGLE REAR VIEW (top-behind, rear 3/4)**
> — top of the salakot from above, shoulders, and back. Not a flat zenith, no side
> profiles, no low angles.
>
> **Style & Formatting:** Match the anime cel-shaded style of the reference
> exactly (green shirt, straw salakot, brown trousers, steel karit). Lay out as horizontal rows, one animation per row, each frame in its own evenly-spaced cell, non-overlapping, with consistent size and centering.
>
> **OUTPUT RULES (critical — the last generation drew these by mistake):** Fully **transparent** background — NO white fill. Do NOT draw any grid lines, cell borders, boxes, guide lines, or separators. Do NOT render any text, row names, labels, numbers, or captions anywhere in the image. Output ONLY the character art, arranged in evenly-spaced **invisible** cells.
>
> **MANDATORY LAYOUT — exactly 6 rows, in this exact top-to-bottom order:**
> 1. **`idle`** — EXACTLY 3 frames: standing, gentle breathing/bounce, karit
>    resting at his side (rear view).
> 2. **`march`** — EXACTLY 4 frames: a full walk cycle advancing forward,
>    trudging with purpose (rear view).
> 3. **`attack`** — EXACTLY 3 frames: a short horizontal **karit cleave** — a
>    scythe swing arcing across the enemies in front. Frame 2 is the clear impact
>    frame with the blade fully swept through the arc (rear view).
> 4. **`cast`** — EXACTLY 3 frames: his signature skill **Harvest** — planting his
>    feet and **raising the karit high overhead** as the ground/earth energy
>    gathers for a big reaping sweep (rear view, dramatic).
> 5. **`celebrate`** — EXACTLY 2 frames: victory cheer, **raised fist** and karit
>    lifted, head turned slightly so we catch his weathered grin (rear-3/4 view).
> 6. **`defeat`** — EXACTLY 2 frames: morale broken — lowering the karit and
>    **taking a knee**, slumped and exhausted (rear view). He is tired, NOT dead.
>
> **SELF-CHECK — before returning the image, verify each item; if any FAILS, fix it and regenerate:**
> 1. **Consistent view** — every frame in every row uses the SAME camera angle stated above (heroes: rear / top-behind — we see the back; enemies: front / top-front — we see the face). No side profiles, no switching between front and back between frames.
> 2. **Frame counts** — each row has EXACTLY the number of frames listed for that row above.
> 3. **Clean output** — fully transparent background; NO grid lines, borders, boxes, text, labels, numbers, or captions anywhere.
> 4. **On-model & separated** — outfit / hair / props identical in every frame; poses do not touch or overlap.

*Export from Aseprite as `farmer.png` + `farmer.json` (JSON Hash or Array), with
the tag names above spelled exactly: `idle march attack cast celebrate defeat`.*

---

## Phase 3 — Harvest Skill Cut-In (anime-style)

**Attach `farmer_base_turnaround.png` (or the front view) first**, then:

> Using the attached Farmer reference, generate a large high-resolution 2D
> portrait sequence for his dramatic "Ultimate Skill" cut-in. Skill name:
> **HARVEST** (he reaps the field in one massive sweep, detonating the enemies'
> stacked ailments). Voice line: *"Oras na para mag-ani!"*
>
> **Style:** Dramatic anime action shot, intense lighting, comic-book halftone
> overlays, dynamic speed lines. Close-up on upper body and face. Keep his straw
> salakot, green work shirt, and steel karit on-model.
>
> Generate 3 separate poses:
> 1. **Anticipation:** shoulders coiled, raising the karit back and up, dramatic
>    shadow under the salakot brim, earth energy gathering.
> 2. **Action/Shout:** the climax — a full-body horizontal reaping sweep, the
>    crescent karit blade foreshortened dramatically toward the camera, a wide arc
>    of slashed grass and dust, mouth open with a shout.
> 3. **Resolution:** a cool grounded post-sweep pose, karit lowered to his side,
>    salakot brim shadowing a steady stare.

*Export as `farmer_cutin.png` + `farmer_cutin.json` (texture atlas). The in-game
`cast` body pose (Phase 2, row 4) plays underneath while this panel slides.*

---

## Export & QA reminders

- Transparent background, consistent frame size, no clipped limbs/karit.
- Tag names MUST match the engine states 1:1 — see the checklist in
  `docs/CHARACTER_VISUAL_PROMPT_GUIDE.md` (Phase 4).
- Drop finished files in `public/assets/heroes/`:
  `farmer.png`, `farmer.json`, `farmer_cutin.png`, `farmer_cutin.json`.

## Integration status

**The engine side is already done** — the model layer is `Sprite`-based, every
state routes through the sprite-sheet path with a tween fallback, Farmer's
`spriteKey` is `farmer`, and `GameScene.createHeroAnimations()` auto-wires any
hero atlas that loads. Until the art exists Farmer renders the tinted `hero-base`
placeholder (no broken texture) and still animates all six states via tweens.

**To light up the real art, once you've generated the sheets:**
1. Drop `farmer.png` + `farmer.json` (and `farmer_cutin.png` +
   `farmer_cutin.json`) into `public/assets/heroes/`.
2. In `GameScene.preload()`, uncomment:
   `this.load.aseprite('farmer', '/assets/heroes/farmer.png', '/assets/heroes/farmer.json');`
   That's it — the six states play from real frames automatically (atlas key ===
   `spriteKey` === `farmer`).

**Still on the backlog (done when you're ready):** feed `farmer_cutin` into
`SkillCutIn` so the Harvest cut-in plays real frames instead of the tinted
silhouette. The `cast` body pose already plays underneath.
