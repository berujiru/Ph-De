# Sorbetes Vendor — Character Art Prompt Pack

Ready-to-paste prompts for generating **Sorbetes Vendor** (dirty-ice-cream
vendor), a fully-animated hero. Follows the two-phase workflow in
`docs/CHARACTER_VISUAL_PROMPT_GUIDE.md`: **Phase 1** locks a consistent base +
all camera angles; **Phase 2/3** reuse that base image as a reference so every
sheet stays on-model.

> Run these in an image-capable Claude/Gemini (not the coding CLI). Always
> **attach the previous phase's output** as reference before generating the next.

---

## Sorbetes Vendor Visual Bible (locked — keep identical across every phase)

Synthesized from his profession + attack (no portrait exists yet). Do not drift:

- **Who:** Sorbetes Vendor — a genial adult Filipino **dirty-ice-cream vendor
  (sorbetero)** working the classic painted pushcart. An everyday citizen worker,
  warm and neighborly — *not* a fantasy warrior, *not* a specific real person.
- **Signature gear:** the iconic brightly-painted **sorbetes pushcart** with a
  round domed lid and a **brass bell**, plus his **scoop** — the #1
  read-at-a-glance silhouette cue; the colorful domed cart must survive every
  angle.
- **Outfit:** a light **short-sleeve shirt with an apron**, a **bucket hat or
  cap**, rubber slippers. Casual, sun-worn street streetwear.
- **Prop / weapon:** a metal **ice-cream scoop**; his attack **drops sticky
  ice-cream puddles/traps** on the ground that freeze whatever steps on them. He
  can hold a stack of **sugar cones** for the read.
- **Expression:** easygoing, cheerful, a little mischievous.
- **Style:** High-contrast anime cel-shaded art, flat colors, bold clean outer
  strokes, 2D mobile game asset (Persona 5 UI pop × Hades silhouette), plain
  solid/white background, isolated character.
- **Palette:** candy **rose-pink** cart/apron anchored on `#f472b6` (his team
  tint), pastel ube-purple / mango-yellow / cheese ice-cream scoops, brass bell,
  tan sugar cones, icy-blue frost highlights on the puddle traps.

---

## Phase 1 — Base Concept + Camera Angles (do this first)

**Prompt:**
> Generate a comprehensive 2D character turnaround reference sheet for a mobile
> game character named Sorbetes Vendor.
>
> **Character:** A genial adult Filipino dirty-ice-cream vendor (sorbetero) with a
> brightly-painted **sorbetes pushcart** (round domed lid, brass bell) beside him.
> Wearing a light short-sleeve shirt with an apron, a bucket hat or cap, and
> rubber slippers. Holding a metal **ice-cream scoop** and a stack of sugar cones.
> Easygoing, cheerful, slightly mischievous expression. An everyday hardworking
> Filipino worker, not a fantasy warrior.
>
> **Style:** High-contrast anime cel-shaded art, flat colors, bold clean outer
> strokes, 2D mobile game asset (Persona 5 UI pop crossed with Hades
> silhouettes). Plain solid background, isolated character.
>
> **Color palette:** candy rose-pink cart/apron (anchor `#f472b6`), pastel
> ube-purple / mango-yellow / cheese ice-cream scoops, brass bell, tan sugar
> cones, icy-blue frost highlights.
>
> **Required Layout:** Show the exact same character in a row from these angles.
> Clothing, proportions, cart, scoop, and cones must remain identical in every
> view:
> 1. **Front View:** looking directly at the camera.
> 2. **Side Profile:** 90-degree turn.
> 3. **Rear View (straight back):** looking completely away from the camera — we
>    see the back of his cap/apron and his back, cart just behind.
> 4. **TOP-BEHIND (high-angle back view) — THE GAMEPLAY VIEW:** camera high above
>    and behind him, tilted (NOT flat zenith). We see the top of his head/cap from
>    above, the domed cart lid, his shoulders and back as he faces away into the
>    distance. This is the angle his in-game sprites are drawn from — make it clean
>    and clear.
> 5. **TOP-FRONT (high-angle front view):** camera high above and in front,
>    tilted. We see the top of his head plus his face and chest.
>
> Ensure the painted domed sorbetes cart with brass bell and the scoop are clearly
> readable in all five views.

*Save the result as `docs/references/sorbetes_vendor_base_turnaround.png`. This
is the base reference for every following phase.*

---

## Phase 2 — Animated Hero Sprite Sheet (TOP-BEHIND)

**Attach `sorbetes_vendor_base_turnaround.png` first**, then:

> Attached is the base turnaround sheet for Sorbetes Vendor. Generate a strictly
> formatted 2D sprite sheet for a top-down auto-battler.
>
> **Crucial Perspective:** Sorbetes Vendor is a Hero. The camera is a high
> top-down oblique above and BEHIND our front line, so he faces AWAY from us into
> the enemy. **ALL frames must be drawn from a HIGH-ANGLE REAR VIEW (top-behind,
> back view)** — top of head/cap and cart lid from above, shoulders, and back. Not
> a flat zenith, no side profiles, no low angles.
>
> **Style & Formatting:** Match the anime cel-shaded style of the reference
> exactly (rose-pink cart/apron, pastel ice-cream scoops, brass bell, scoop, sugar
> cones). Lay out as horizontal rows, one animation per row, each frame in its own evenly-spaced cell, non-overlapping, with consistent size and centering.
>
> **OUTPUT RULES (critical — the last generation drew these by mistake):** Fully **transparent** background — NO white fill. Do NOT draw any grid lines, cell borders, boxes, guide lines, or separators. Do NOT render any text, row names, labels, numbers, or captions anywhere in the image. Output ONLY the character art, arranged in evenly-spaced **invisible** cells.
>
> **MANDATORY LAYOUT — exactly 3 rows, in this exact top-to-bottom order:**
> 1. **`idle`** — EXACTLY 3 frames: standing, gentle breathing/bounce, scoop in
>    hand, cart beside him (rear view).
> 2. **`attack`** — EXACTLY 3 frames: scooping and **flinging a sticky ice-cream
>    glob forward** to drop a frozen puddle-trap on the ground. Frame 2 is the
>    clear impact frame as the glob lands and an icy-blue puddle spreads (rear
>    view).
> 3. **`cast`** — EXACTLY 3 frames: his signature skill **Dirty Ice Cream** —
>    planting his feet and **broadly sweeping the scoop to scatter three big
>    ice-cream traps across the path**, ringing the brass bell, building energy
>    (rear view, dramatic).
>
> **SELF-CHECK — before returning the image, verify each item; if any FAILS, fix it and regenerate:**
> 1. **Consistent view** — every frame in every row uses the SAME camera angle stated above (heroes: rear / top-behind — we see the back; enemies: front / top-front — we see the face). No side profiles, no switching between front and back between frames.
> 2. **Frame counts** — each row has EXACTLY the number of frames listed for that row above.
> 3. **Clean output** — fully transparent background; NO grid lines, borders, boxes, text, labels, numbers, or captions anywhere.
> 4. **On-model & separated** — outfit / hair / props identical in every frame; poses do not touch or overlap.

*Export from Aseprite as `sorbetes_vendor.png` + `sorbetes_vendor.json` (JSON
Hash or Array), with the tag names above spelled exactly:
`idle attack cast`.*

---

## Phase 3 — Dirty Ice Cream Skill Cut-In (anime-style)

**Attach `sorbetes_vendor_base_turnaround.png` (or the front view) first**, then:

> Using the attached Sorbetes Vendor reference, generate a large high-resolution
> 2D portrait sequence for his dramatic "Ultimate Skill" cut-in. Skill name:
> **DIRTY ICE CREAM** (he scatters three explosive ice-cream traps that freeze the
> path). Voice line: *"Sorbetes! Walang halong kemikal!"*
>
> **Style:** Dramatic anime action shot, intense lighting, comic-book halftone
> overlays, dynamic speed lines. Close-up on upper body and face. Keep his
> rose-pink cart/apron, cap, brass bell, and scoop on-model.
>
> Generate 3 separate poses:
> 1. **Anticipation:** ringing the brass bell high, cocking the loaded scoop back
>    with a mischievous grin, dramatic shadow, frost mist gathering.
> 2. **Action/Shout:** the climax — a wide swing flinging three glowing icy-blue
>    ice-cream globs toward the camera, the scoop foreshortened dramatically,
>    frost crystals and cone confetti flying, mouth wide open shouting.
> 3. **Resolution:** a cool relaxed post-scoop pose, resting the scoop on his
>    shoulder, satisfied wink.

*Export as `sorbetes_vendor_cutin.png` + `sorbetes_vendor_cutin.json` (texture
atlas). The in-game `cast` body pose (Phase 2, row 4) plays underneath while this
panel slides.*

---

## Export & QA reminders

- Transparent background, consistent frame size, no clipped limbs/scoop/cart.
- Tag names MUST match the engine states 1:1 — see the checklist in
  `docs/CHARACTER_VISUAL_PROMPT_GUIDE.md` (Phase 4).
- Drop finished files in `public/assets/heroes/`:
  `sorbetes_vendor.png`, `sorbetes_vendor.json`, `sorbetes_vendor_cutin.png`,
  `sorbetes_vendor_cutin.json`.

## Integration status

**The engine side is already done** — the model layer is `Sprite`-based, every
state routes through the sprite-sheet path with a tween fallback, Sorbetes
Vendor's `spriteKey` is `sorbetes_vendor`, and
`GameScene.createHeroAnimations()` auto-wires any hero atlas that loads. Until
the art exists Sorbetes Vendor renders the tinted `hero-base` placeholder (no
broken texture) and still animates all six states via tweens.

**To light up the real art, once you've generated the sheets:**
1. Drop `sorbetes_vendor.png` + `sorbetes_vendor.json` (and
   `sorbetes_vendor_cutin.png` + `sorbetes_vendor_cutin.json`) into
   `public/assets/heroes/`.
2. In `GameScene.preload()`, uncomment:
   `this.load.aseprite('sorbetes_vendor', '/assets/heroes/sorbetes_vendor.png', '/assets/heroes/sorbetes_vendor.json');`
   That's it — the six states play from real frames automatically (atlas key ===
   `spriteKey` === `sorbetes_vendor`).

**Still on the backlog (done when you're ready):** feed `sorbetes_vendor_cutin`
into `SkillCutIn` so the Dirty Ice Cream cut-in plays real frames instead of the
tinted silhouette. The `cast` body pose already plays underneath.
