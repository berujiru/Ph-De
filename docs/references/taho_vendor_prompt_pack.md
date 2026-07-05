# Taho Vendor — Character Art Prompt Pack

Ready-to-paste prompts for generating **Taho Vendor**, a Frost splash hero.
Follows the two-phase workflow in `docs/CHARACTER_VISUAL_PROMPT_GUIDE.md`:
**Phase 1** locks a consistent base + all camera angles; **Phase 2/3** reuse
that base image as a reference so every sheet stays on-model.

> Run these in an image-capable Claude/Gemini (not the coding CLI). Always
> **attach the previous phase's output** as reference before generating the next.

---

## Taho Vendor Visual Bible (locked — keep identical across every phase)

Synthesized from his profession + weapon (no portrait exists yet). An everyday
hardworking Filipino street vendor — a **communal parody archetype**, never a
specific real person's likeness, name, or voice. Do not drift:

- **Who:** a lean, weathered adult Filipino **street taho vendor** — the
  early-morning soy-pudding hawker. Cheerful, sweaty, tireless. *Not* a shiny
  fantasy warrior, *not* any specific real person.
- **Signature gear (his #1 read-at-a-glance silhouette cue):** the two tall
  **aluminum taho canisters slung on a shoulder yoke / balance pole (pingga)** —
  one holds the warm soy curd, one holds the syrup and sago. That twin-cannister
  yoke must survive every angle; it is how the player identifies him instantly.
- **Prop / weapon:** a metal **ladle/scooper** he uses to *lob a hot arc of
  arnibal (brown-sugar syrup)* at enemies — a high, splashing throw.
- **Outfit:** simple sando/undershirt, rolled-sleeve plaid overshirt, worn
  shorts, tsinelas (rubber slippers), a small sweat-rag or bucket hat.
- **Expression:** friendly, singsong-hawker warmth with a determined squint.
- **Style:** High-contrast anime cel-shaded art, flat colors, bold clean outer
  strokes, 2D mobile game asset (Persona 5 UI pop × Hades silhouette), plain
  solid/white background, isolated character.
- **Palette:** anchored on **`#e2e8f0` (cool off-white / brushed aluminum)** —
  the gleaming canisters and steam are the hero color; warm caramel-brown syrup
  accents, faded plaid, tan skin. (The engine tint `#e2e8f0` is only a fallback
  for missing sprites — the real sheet uses these true colors, no flat wash.)

---

## Phase 1 — Base Concept + Camera Angles (do this first)

**Prompt:**
> Generate a comprehensive 2D character turnaround reference sheet for a mobile
> game character named Taho Vendor.
>
> **Character:** A lean, weathered adult Filipino street taho (warm soy-pudding)
> vendor. His signature gear is **two tall polished aluminum canisters carried on
> a wooden shoulder yoke / balance pole (pingga)**. He holds a **metal ladle /
> scooper**. Simple sando with a rolled-sleeve plaid overshirt, worn shorts,
> rubber slippers, a sweat-rag. Friendly singsong-hawker expression with a
> determined squint. An everyday hardworking Filipino vendor, not a fantasy
> warrior.
>
> **Style:** High-contrast anime cel-shaded art, flat colors, bold clean outer
> strokes, 2D mobile game asset (Persona 5 UI pop crossed with Hades
> silhouettes). Plain solid background, isolated character.
>
> **Required Layout:** Show the exact same character in a row from these angles.
> Clothing, proportions, the aluminum canisters, the shoulder yoke, and the
> ladle must remain identical in every view:
> 1. **Front View:** looking directly at the camera.
> 2. **Side Profile:** 90-degree turn (the yoke and twin canisters read clearly).
> 3. **Rear View (straight back):** looking completely away from the camera — we
>    see the back of his head, the yoke across his shoulders, and both canisters.
> 4. **TOP-BEHIND (high-angle rear 3/4) — THE GAMEPLAY VIEW:** camera high above
>    and behind him, tilted (NOT flat zenith). We see the top of his head, the
>    yoke and canister lids from above, his shoulders and back as he faces away
>    into the distance. This is the angle his in-game sprites are drawn from —
>    make it clean and clear.
> 5. **TOP-FRONT (high-angle front 3/4):** camera high above and in front,
>    tilted. We see the top of his head plus his face, chest, and the canisters.
>
> Ensure the twin aluminum canisters on the shoulder yoke and the metal ladle are
> clearly readable in all five views.

*Save the result as `docs/references/taho_vendor_base_turnaround.png`. This is the
base reference for every following phase.*

---

## Phase 2 — Animated Hero Sprite Sheet (TOP-BEHIND)

**Attach `taho_vendor_base_turnaround.png` first**, then:

> Attached is the base turnaround sheet for Taho Vendor. Generate a strictly
> formatted 2D sprite sheet for a top-down auto-battler.
>
> **Crucial Perspective:** Taho Vendor is a Hero. The camera is a high top-down
> oblique above and BEHIND our front line, so he faces AWAY from us into the
> enemy. **ALL frames must be drawn from a HIGH-ANGLE REAR VIEW (top-behind, rear
> 3/4)** — top of head, the shoulder yoke and canister lids from above,
> shoulders, and back. Not a flat zenith, no side profiles, no low angles.
>
> **Style & Formatting:** Match the anime cel-shaded style of the reference
> exactly (brushed-aluminum canisters, plaid overshirt, caramel syrup, tan skin). Lay out as horizontal rows, one animation per row, each frame in its own evenly-spaced cell, non-overlapping, with consistent size and centering.
>
> **OUTPUT RULES (critical — the last generation drew these by mistake):** Fully **transparent** background — NO white fill. Do NOT draw any grid lines, cell borders, boxes, guide lines, or separators. Do NOT render any text, row names, labels, numbers, or captions anywhere in the image. Output ONLY the character art, arranged in evenly-spaced **invisible** cells.
>
> **MANDATORY LAYOUT — exactly 6 rows, in this exact top-to-bottom order:**
> 1. **`idle`** — EXACTLY 3 frames: standing, gentle breathing/bounce, canisters
>    settling on the yoke, ladle in hand (rear view).
> 2. **`march`** — EXACTLY 4 frames: a full walk cycle advancing forward, the yoke
>    and heavy canisters swaying with each step (rear view).
> 3. **`attack`** — EXACTLY 3 frames: scooping from a canister and **lobbing a
>    high, splashing arc of hot arnibal (brown-sugar syrup) forward** with the
>    ladle. Frame 2 is the clear release/impact frame, arm extended overhead, a
>    glob of syrup launching away (rear view).
> 4. **`cast`** — EXACTLY 3 frames: his signature skill **Hot Syrup** — planting
>    his feet and **upending a canister to pour a wide, sizzling steaming puddle
>    of syrup out ahead**, steam rising (rear view, dramatic).
> 5. **`celebrate`** — EXACTLY 2 frames: victory cheer, **raised ladle/fist**,
>    a little hop, head turned slightly so we catch his grin (rear-3/4 view).
> 6. **`defeat`** — EXACTLY 2 frames: morale broken — the yoke slipping, **taking
>    a knee** exhausted and slumped (rear view). He is tired, NOT dead.
>
> **SELF-CHECK — before returning the image, verify each item; if any FAILS, fix it and regenerate:**
> 1. **Consistent view** — every frame in every row uses the SAME camera angle stated above (heroes: rear / top-behind — we see the back; enemies: front / top-front — we see the face). No side profiles, no switching between front and back between frames.
> 2. **Frame counts** — each row has EXACTLY the number of frames listed for that row above.
> 3. **Clean output** — fully transparent background; NO grid lines, borders, boxes, text, labels, numbers, or captions anywhere.
> 4. **On-model & separated** — outfit / hair / props identical in every frame; poses do not touch or overlap.

*Export from Aseprite as `taho_vendor.png` + `taho_vendor.json` (JSON Hash or
Array), with the tag names above spelled exactly:
`idle march attack cast celebrate defeat`.*

---

## Phase 3 — Hot Syrup Skill Cut-In (anime-style)

**Attach `taho_vendor_base_turnaround.png` (or the front view) first**, then:

> Using the attached Taho Vendor reference, generate a large high-resolution 2D
> portrait sequence for his dramatic "Ultimate Skill" cut-in. Skill name:
> **HOT SYRUP** (he flings a scalding wave of arnibal that pins enemies in a
> sticky puddle). Voice line: *"Tahooooo! Mainit pa!"*
>
> **Style:** Dramatic anime action shot, intense lighting, comic-book halftone
> overlays, dynamic speed lines. Close-up on upper body and face. Keep his
> aluminum canisters, shoulder yoke, plaid overshirt, and metal ladle on-model.
>
> Generate 3 separate poses:
> 1. **Anticipation:** hoisting a canister high, syrup swirling at the lip,
>    steam curling up, dramatic shadow and coiled energy.
> 2. **Action/Shout:** the climax — flinging a huge scalding wave of caramel
>    syrup forward, the ladle foreshortened dramatically toward the camera, steam
>    bursts and sticky splatter rings.
> 3. **Resolution:** a cool satisfied hawker pose, ladle resting on the canister,
>    wiping his brow with a grin.

*Export as `taho_vendor_cutin.png` + `taho_vendor_cutin.json` (texture atlas).
The in-game `cast` body pose (Phase 2, row 4) plays underneath while this panel
slides.*

---

## Export & QA reminders

- Transparent background, consistent frame size, no clipped limbs/canisters/yoke.
- Tag names MUST match the engine states 1:1 — see the checklist in
  `docs/CHARACTER_VISUAL_PROMPT_GUIDE.md` (Phase 4).
- Drop finished files in `public/assets/heroes/`:
  `taho_vendor.png`, `taho_vendor.json`, `taho_vendor_cutin.png`,
  `taho_vendor_cutin.json`.

## Integration status

**The engine side is already done** — the model layer is `Sprite`-based, every
state routes through the sprite-sheet path with a tween fallback, Taho Vendor's
`spriteKey` is `taho_vendor`, and `GameScene.createHeroAnimations()` auto-wires
any hero atlas that loads. Until the art exists Taho Vendor renders the tinted
`hero-base` placeholder (no broken texture) and still animates all six states
via tweens.

**To light up the real art, once you've generated the sheets:**
1. Drop `taho_vendor.png` + `taho_vendor.json` (and `taho_vendor_cutin.png` +
   `taho_vendor_cutin.json`) into `public/assets/heroes/`.
2. In `GameScene.preload()`, uncomment:
   `this.load.aseprite('taho_vendor', '/assets/heroes/taho_vendor.png', '/assets/heroes/taho_vendor.json');`
   (atlas key === `spriteKey` === `taho_vendor`). That's it — the six states
   play from real frames automatically.

**Still on the backlog (I do this when you're ready):** feed `taho_vendor_cutin`
into `SkillCutIn` so the Hot Syrup cut-in plays real frames instead of the tinted
silhouette. The `cast` body pose already plays underneath.
