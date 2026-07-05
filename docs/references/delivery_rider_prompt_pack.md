# Delivery Rider — Character Art Prompt Pack

Ready-to-paste prompts for generating **Delivery Rider (Motorcycle Courier)**, a
Wind boomerang single-target hero. Follows the two-phase workflow in
`docs/CHARACTER_VISUAL_PROMPT_GUIDE.md`: **Phase 1** locks a consistent base +
all camera angles; **Phase 2/3** reuse that base image as a reference so every
sheet stays on-model.

> Run these in an image-capable Claude/Gemini (not the coding CLI). Always
> **attach the previous phase's output** as reference before generating the next.

---

## Delivery Rider Visual Bible (locked — keep identical across every phase)

No portrait exists yet, so this bible is synthesized from the profession
(motorcycle courier / delivery rider), archetype, and weapon in `balance.ts` +
`WORLD_AND_HEROES.md`. Do not drift:

- **Who:** Delivery Rider — a young Filipino **motorcycle food-delivery courier**,
  the *rider* weaving through EDSA traffic to get your order there while it's hot.
  An everyday hardworking Filipino, quick and eager, "OTW na bossing" energy —
  *not* a fantasy biker, *not* a specific real brand or person (generic team
  colors only, no real logo).
- **Build:** lean and athletic, always leaning forward like he's mid-throttle.
- **Signature headwear:** a **full-face motorcycle helmet with the visor flipped
  up** and a **big insulated square delivery backpack** on his back (his #1
  read-at-a-glance silhouette cue — the boxy backpack must survive every angle).
- **Outfit:** a generic **green rider jacket** and jeans, fingerless riding
  gloves, sneakers; a phone mount clipped to his chest strap.
- **Prop / weapon:** **wrapped parcels / food boxes** that he **throws so they
  fly out and return like a boomerang** (his attack), plus his **motorcycle**,
  which he revs and summons for the skill. Draw a returning parcel arc with a
  motion trail.
- **Expression:** eager, cheeky grin — the rider who's always in a rush.
- **Style:** High-contrast anime cel-shaded art, flat colors, bold clean outer
  strokes, 2D mobile game asset (Persona 5 UI pop × Hades silhouette), plain
  solid/white background, isolated character.
- **Palette:** anchored on his engine color **green `#22c55e`** (jacket + delivery
  backpack + the returning-parcel trail), dark helmet and jeans, light-green
  `#86efac` accents on the flying parcels. (The engine tint is only a fallback for
  missing sprites — the real sheet uses these true colors, no flat green wash.)

---

## Phase 1 — Base Concept + Camera Angles (do this first)

**Prompt:**
> Generate a comprehensive 2D character turnaround reference sheet for a mobile
> game character named Delivery Rider.
>
> **Character:** A young Filipino motorcycle food-delivery courier. Lean and
> athletic, leaning forward eagerly. A **full-face motorcycle helmet with the
> visor flipped up** and a **big square insulated delivery backpack** on his back;
> a generic **green rider jacket** and jeans; fingerless riding gloves; sneakers; a
> phone mounted on his chest strap. Holding a **wrapped parcel / food box** ready
> to throw. Eager, cheeky grin. An everyday hardworking Filipino rider, not a
> fantasy biker; use plain generic team colors, no real brand logos.
>
> **Style:** High-contrast anime cel-shaded art, flat colors, bold clean outer
> strokes, 2D mobile game asset (Persona 5 UI pop crossed with Hades
> silhouettes). Plain solid background, isolated character.
>
> **Required Layout:** Show the exact same character in a row from these angles.
> Clothing, proportions, helmet, the square delivery backpack, and the parcel must
> remain identical in every view:
> 1. **Front View:** looking directly at the camera.
> 2. **Side Profile:** 90-degree turn.
> 3. **Rear View (straight back):** looking completely away from the camera — we
>    see the back of his helmet and the big square delivery backpack filling his
>    back.
> 4. **TOP-BEHIND (high-angle rear 3/4) — THE GAMEPLAY VIEW:** camera high above
>    and behind him, tilted (NOT flat zenith). We see the top of his helmet, his
>    shoulders, and the top of the square delivery backpack, as he faces away into
>    the distance. This is the angle his in-game sprites are drawn from — make it
>    clean and clear.
> 5. **TOP-FRONT (high-angle front 3/4):** camera high above and in front, tilted.
>    We see the top of his helmet plus his grinning face, the jacket and the parcel.
>
> Ensure the flipped-up helmet visor, the big square delivery backpack, and the
> wrapped parcel are clearly readable in all five views.

*Save the result as `docs/references/delivery_rider_base_turnaround.png`. This is
the base reference for every following phase.*

---

## Phase 2 — Animated Hero Sprite Sheet (TOP-BEHIND)

**Attach `delivery_rider_base_turnaround.png` first**, then:

> Attached is the base turnaround sheet for Delivery Rider. Generate a strictly
> formatted 2D sprite sheet for a top-down auto-battler.
>
> **Crucial Perspective:** Delivery Rider is a Hero. The camera is a high top-down
> oblique above and BEHIND our front line, so he faces AWAY from us into the
> enemy. **ALL frames must be drawn from a HIGH-ANGLE REAR VIEW (top-behind, rear
> 3/4)** — top of the helmet, shoulders, the square delivery backpack, and back.
> Not a flat zenith, no side profiles, no low angles.
>
> **Style & Formatting:** Match the anime cel-shaded style of the reference
> exactly (green jacket, green delivery backpack, dark helmet, light-green
> parcels). Lay out as horizontal rows, one animation per row, each frame in its own evenly-spaced cell, non-overlapping, with consistent size and centering.
>
> **OUTPUT RULES (critical — the last generation drew these by mistake):** Fully **transparent** background — NO white fill. Do NOT draw any grid lines, cell borders, boxes, guide lines, or separators. Do NOT render any text, row names, labels, numbers, or captions anywhere in the image. Output ONLY the character art, arranged in evenly-spaced **invisible** cells.
>
> **MANDATORY LAYOUT — exactly 6 rows, in this exact top-to-bottom order:**
> 1. **`idle`** — EXACTLY 3 frames: standing, gentle breathing/bounce, checking his
>    chest-mounted phone, a parcel tucked under his arm (rear view).
> 2. **`march`** — EXACTLY 4 frames: a full walk cycle advancing forward, eager and
>    quick, the square backpack bobbing (rear view).
> 3. **`attack`** — EXACTLY 3 frames: **hurling a wrapped parcel forward so it
>    zooms out and boomerangs back**. Frame 2 is the clear release frame — arm
>    fully extended, the parcel leaving his hand with a motion trail (rear view).
> 4. **`cast`** — EXACTLY 3 frames: his signature skill **Kamote Riders** —
>    planting a foot, throwing an arm up and **revving/whistling in a wave of AI
>    motorcycle riders**, engine smoke and speed lines building behind him (rear
>    view, dramatic).
> 5. **`celebrate`** — EXACTLY 2 frames: victory cheer, **raised fist** (parcel or
>    phone thrust up, thumbs-up "5 stars"), jumping, head turned slightly so we
>    catch his grin (rear-3/4 view).
> 6. **`defeat`** — EXACTLY 2 frames: morale broken — dropping the parcel and
>    **taking a knee**, slumped and exhausted, helmet hanging (rear view). He is
>    tired, NOT dead.
>
> Verify every frame in every row is present in the final grid.

*Export from Aseprite as `delivery_rider.png` + `delivery_rider.json` (JSON Hash
or Array), with the tag names above spelled exactly:
`idle march attack cast celebrate defeat`.*

---

## Phase 3 — Kamote Riders Skill Cut-In (anime-style)

**Attach `delivery_rider_base_turnaround.png` (or the front view) first**, then:

> Using the attached Delivery Rider reference, generate a large high-resolution 2D
> portrait sequence for his dramatic "Ultimate Skill" cut-in. Skill name:
> **KAMOTE RIDERS** (he calls in a swarm of reckless AI motorcycle riders that
> crash into the horde and explode). Voice line: *"Pa-deliver po! OTW na bossing!"*
>
> **Style:** Dramatic anime action shot, intense lighting, comic-book halftone
> overlays, dynamic speed lines. Close-up on upper body and face. Keep his
> flipped-visor helmet, green rider jacket, square delivery backpack, and the
> parcels on-model.
>
> Generate 3 separate poses:
> 1. **Anticipation:** gripping an imaginary throttle, leaning forward, dramatic
>    shadow, engine smoke curling, coiled energy.
> 2. **Action/Rev:** the climax — throttle CRANKED, front wheel of his motorcycle
>    rearing toward the camera in hard foreshortening, a wave of AI riders and
>    speed lines exploding out behind him.
> 3. **Resolution:** a cool cheeky post-rev pose, flashing a thumbs-up "5 stars",
>    exhaling, engine settling.

*Export as `delivery_rider_cutin.png` + `delivery_rider_cutin.json` (texture
atlas). The in-game `cast` body pose (Phase 2, row 4) plays underneath while this
panel slides.*

---

## Export & QA reminders

- Transparent background, consistent frame size, no clipped limbs/parcel/backpack.
- Tag names MUST match the engine states 1:1 — see the checklist in
  `docs/CHARACTER_VISUAL_PROMPT_GUIDE.md` (Phase 4).
- Drop finished files in `public/assets/heroes/`:
  `delivery_rider.png`, `delivery_rider.json`, `delivery_rider_cutin.png`,
  `delivery_rider_cutin.json`.

## Integration status

**The engine side is already done** — the model layer is `Sprite`-based, every
state routes through the sprite-sheet path with a tween fallback, Delivery Rider's
`spriteKey` is `delivery_rider`, and `GameScene.createHeroAnimations()` auto-wires
any hero atlas that loads. Until the art exists Delivery Rider renders the tinted
`hero-base` placeholder (no broken texture) and still animates all six states via
tweens.

**To light up the real art, once you've generated the sheets:**
1. Drop `delivery_rider.png` + `delivery_rider.json` (and
   `delivery_rider_cutin.png` + `delivery_rider_cutin.json`) into
   `public/assets/heroes/`.
2. In `GameScene.preload()`, uncomment:
   `this.load.aseprite('delivery_rider', '/assets/heroes/delivery_rider.png', '/assets/heroes/delivery_rider.json');`
   That's it — the six states play from real frames automatically (atlas key ===
   the hero's `spriteKey`, `delivery_rider`).

**Still on the backlog (I do this when you're ready):** feed `delivery_rider_cutin`
into `SkillCutIn` so the Kamote Riders cut-in plays real frames instead of the
tinted silhouette. The `cast` body pose already plays underneath.
