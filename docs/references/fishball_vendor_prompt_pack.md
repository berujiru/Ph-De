# Fishball Vendor — Character Art Prompt Pack

Ready-to-paste prompts for generating **Fishball Vendor**, a fully-animated
hero. Follows the two-phase workflow in
`docs/CHARACTER_VISUAL_PROMPT_GUIDE.md`: **Phase 1** locks a consistent base +
all camera angles; **Phase 2/3** reuse that base image as a reference so every
sheet stays on-model.

> Run these in an image-capable Claude/Gemini (not the coding CLI). Always
> **attach the previous phase's output** as reference before generating the next.

---

## Fishball Vendor Visual Bible (locked — keep identical across every phase)

Synthesized from his profession + attack (no portrait exists yet). Do not drift:

- **Who:** Fishball Vendor — a cheerful, quick-handed adult Filipino **street
  food vendor**, pushing the classic fried-street-food cart. An everyday citizen
  worker, friendly and fast — *not* a fantasy warrior, *not* a specific real
  person.
- **Signature gear:** a small **fishball push-cart** at his side/behind him
  (deep fryer vat, sauce squeeze-bottles) plus a **clear apron** — his #1
  read-at-a-glance silhouette cue; the cart profile must survive every angle.
- **Outfit:** a plain **t-shirt with a waist apron**, a **bandana or cap**, arm
  sleeves against the frying heat, rubber slippers. Casual street streetwear.
- **Prop / weapon:** long bamboo **tuhog (barbecue skewers)** loaded with
  fishballs/squidballs, which he *throws like darts* — a skewer pierces a whole
  line of enemies. He can carry a fan of spare skewers for the read.
- **Expression:** grinning, salesman-friendly, unbothered.
- **Style:** High-contrast anime cel-shaded art, flat colors, bold clean outer
  strokes, 2D mobile game asset (Persona 5 UI pop × Hades silhouette), plain
  solid/white background, isolated character.
- **Palette:** warm **rose-red** apron/shirt accents anchored on `#f43f5e` (his
  team tint), golden-fried fishballs, a light-red/pink sauce (`#fca5a5`, matches
  his projectile), bamboo-tan skewers, stainless cart.

---

## Phase 1 — Base Concept + Camera Angles (do this first)

**Prompt:**
> Generate a comprehensive 2D character turnaround reference sheet for a mobile
> game character named Fishball Vendor.
>
> **Character:** A cheerful, quick-handed adult Filipino street food vendor with a
> small **fishball push-cart** (deep fryer vat, sauce squeeze-bottles) beside him.
> Wearing a plain t-shirt with a waist apron, a bandana or cap, and arm sleeves.
> Holding a fan of long bamboo **barbecue skewers (tuhog)** loaded with
> golden-fried fishballs, which he throws like darts. Grinning, salesman-friendly
> expression. An everyday hardworking Filipino worker, not a fantasy warrior.
>
> **Style:** High-contrast anime cel-shaded art, flat colors, bold clean outer
> strokes, 2D mobile game asset (Persona 5 UI pop crossed with Hades
> silhouettes). Plain solid background, isolated character.
>
> **Color palette:** warm rose-red apron/shirt accents (anchor `#f43f5e`),
> golden-fried fishballs, light-red/pink sauce, bamboo-tan skewers, stainless
> steel cart.
>
> **Required Layout:** Show the exact same character in a row from these angles.
> Clothing, proportions, cart, apron, and the skewers must remain identical in
> every view:
> 1. **Front View:** looking directly at the camera.
> 2. **Side Profile:** 90-degree turn.
> 3. **Rear View (straight back):** looking completely away from the camera — we
>    see the back of his cap/apron and his back, cart just behind.
> 4. **TOP-BEHIND (high-angle back view) — THE GAMEPLAY VIEW:** camera high above
>    and behind him, tilted (NOT flat zenith). We see the top of his head/cap from
>    above, his shoulders and back, cart at his side, as he faces away into the
>    distance. This is the angle his in-game sprites are drawn from — make it clean
>    and clear.
> 5. **TOP-FRONT (high-angle front view):** camera high above and in front,
>    tilted. We see the top of his head plus his face and chest.
>
> Ensure the fishball cart and the loaded bamboo skewers are clearly readable in
> all five views.

*Save the result as `docs/references/fishball_vendor_base_turnaround.png`. This
is the base reference for every following phase.*

---

## Phase 2 — Animated Hero Sprite Sheet (TOP-BEHIND)

**Attach `fishball_vendor_base_turnaround.png` first**, then:

> Attached is the base turnaround sheet for Fishball Vendor. Generate a strictly
> formatted 2D sprite sheet for a top-down auto-battler.
>
> **Crucial Perspective:** Fishball Vendor is a Hero. The camera is a high
> top-down oblique above and BEHIND our front line, so he faces AWAY from us into
> the enemy. **ALL frames must be drawn from a HIGH-ANGLE REAR VIEW (top-behind,
> back view)** — top of head/cap from above, shoulders, and back. Not a flat
> zenith, no side profiles, no low angles.
>
> **Style & Formatting:** Match the anime cel-shaded style of the reference
> exactly (rose-red apron, bandana/cap, bamboo skewers, stainless cart). Lay out as horizontal rows, one animation per row, each frame in its own evenly-spaced cell, non-overlapping, with consistent size and centering.
>
> **OUTPUT RULES (critical — the last generation drew these by mistake):** Fully **transparent** background — NO white fill. Do NOT draw any grid lines, cell borders, boxes, guide lines, or separators. Do NOT render any text, row names, labels, numbers, or captions anywhere in the image. Output ONLY the character art, arranged in evenly-spaced **invisible** cells.
>
> **MANDATORY LAYOUT — exactly 3 rows, in this exact top-to-bottom order:**
> 1. **`idle`** — EXACTLY 3 frames: standing, gentle breathing/bounce, a skewer
>    held ready at his side, cart beside him (rear view).
> 2. **`attack`** — EXACTLY 3 frames: winding up and **hurling a bamboo skewer
>    forward** like a dart/spear so it pierces the line. Frame 2 is the clear
>    release/impact frame, arm fully extended (rear view).
> 3. **`cast`** — EXACTLY 3 frames: his signature skill **Spicy Sauce** —
>    grabbing a sauce squeeze-bottle and **flinging a wide arc of spicy red sauce
>    forward**, igniting the skewered line, building energy (rear view, dramatic).
>
> **SELF-CHECK — before returning the image, verify each item; if any FAILS, fix it and regenerate:**
> 1. **Consistent view** — every frame in every row uses the SAME camera angle stated above (heroes: rear / top-behind — we see the back; enemies: front / top-front — we see the face). No side profiles, no switching between front and back between frames.
> 2. **Frame counts** — each row has EXACTLY the number of frames listed for that row above.
> 3. **Clean output** — fully transparent background; NO grid lines, borders, boxes, text, labels, numbers, or captions anywhere.
> 4. **On-model & separated** — outfit / hair / props identical in every frame; poses do not touch or overlap.

*Export from Aseprite as `fishball_vendor.png` + `fishball_vendor.json` (JSON
Hash or Array), with the tag names above spelled exactly:
`idle attack cast`.*

---

## Phase 3 — Spicy Sauce Skill Cut-In (anime-style)

**Attach `fishball_vendor_base_turnaround.png` (or the front view) first**, then:

> Using the attached Fishball Vendor reference, generate a large high-resolution
> 2D portrait sequence for his dramatic "Ultimate Skill" cut-in. Skill name:
> **SPICY SAUCE** (he drenches the whole skewered line in fiery sauce, causing
> panic). Voice line: *"Gusto mo ng maanghang?! O, eto!"*
>
> **Style:** Dramatic anime action shot, intense lighting, comic-book halftone
> overlays, dynamic speed lines. Close-up on upper body and face. Keep his
> rose-red apron, cap/bandana, and skewers on-model.
>
> Generate 3 separate poses:
> 1. **Anticipation:** gripping a red sauce squeeze-bottle, cocking it back with a
>    mischievous grin, dramatic shadow, heat shimmer building.
> 2. **Action/Shout:** the climax — squeezing a huge fan of blazing red-orange
>    spicy sauce toward the camera, the bottle foreshortened dramatically, sauce
>    droplets and flames flying, mouth wide open shouting.
> 3. **Resolution:** a cool confident post-splash pose, wiping his hands or
>    twirling a skewer, satisfied smirk.

*Export as `fishball_vendor_cutin.png` + `fishball_vendor_cutin.json` (texture
atlas). The in-game `cast` body pose (Phase 2, row 4) plays underneath while this
panel slides.*

---

## Export & QA reminders

- Transparent background, consistent frame size, no clipped limbs/skewers/cart.
- Tag names MUST match the engine states 1:1 — see the checklist in
  `docs/CHARACTER_VISUAL_PROMPT_GUIDE.md` (Phase 4).
- Drop finished files in `public/assets/heroes/`:
  `fishball_vendor.png`, `fishball_vendor.json`, `fishball_vendor_cutin.png`,
  `fishball_vendor_cutin.json`.

## Integration status

**The engine side is already done** — the model layer is `Sprite`-based, every
state routes through the sprite-sheet path with a tween fallback, Fishball
Vendor's `spriteKey` is `fishball_vendor`, and
`GameScene.createHeroAnimations()` auto-wires any hero atlas that loads. Until
the art exists Fishball Vendor renders the tinted `hero-base` placeholder (no
broken texture) and still animates all six states via tweens.

**To light up the real art, once you've generated the sheets:**
1. Drop `fishball_vendor.png` + `fishball_vendor.json` (and
   `fishball_vendor_cutin.png` + `fishball_vendor_cutin.json`) into
   `public/assets/heroes/`.
2. In `GameScene.preload()`, uncomment:
   `this.load.aseprite('fishball_vendor', '/assets/heroes/fishball_vendor.png', '/assets/heroes/fishball_vendor.json');`
   That's it — the six states play from real frames automatically (atlas key ===
   `spriteKey` === `fishball_vendor`).

**Still on the backlog (done when you're ready):** feed `fishball_vendor_cutin`
into `SkillCutIn` so the Spicy Sauce cut-in plays real frames instead of the
tinted silhouette. The `cast` body pose already plays underneath.
