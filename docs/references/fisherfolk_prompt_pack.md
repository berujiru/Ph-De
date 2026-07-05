# Fisherfolk — Character Art Prompt Pack

Ready-to-paste prompts for generating **Fisherfolk**, a fully-animated hero.
Follows the two-phase workflow in `docs/CHARACTER_VISUAL_PROMPT_GUIDE.md`:
**Phase 1** locks a consistent base + all camera angles; **Phase 2/3** reuse
that base image as a reference so every sheet stays on-model.

> Run these in an image-capable Claude/Gemini (not the coding CLI). Always
> **attach the previous phase's output** as reference before generating the next.

---

## Fisherfolk Visual Bible (locked — keep identical across every phase)

No portrait exists yet — this bible is **synthesized** from the profession
(coastal fisher), the weapon (a **throwing net / *Lambat*** cast as a swirling
vortex), and the `balance.ts` color anchor `#0ea5e9` (sky/sea blue). Do not
drift:

- **Who:** Fisherfolk — a lean, weather-hardened Filipino **coastal fisher**,
  sun-browned and salt-crusted. An everyday hardworking Filipino, calm and
  patient with a sudden fierce cast — *not* a shiny fantasy warrior, *not* a
  specific real person. A communal parody archetype only.
- **Hair:** dark hair mostly hidden under a wide woven **salakot (conical sun
  hat)**.
- **Signature read-at-a-glance cue:** the wide **salakot hat** overhead **and** a
  bundled **fishing net (Lambat)** with a weighted rim gathered in the arms —
  this pairing is the #1 silhouette read and must survive every angle.
- **Outfit:** a rolled-up light shirt (or bare-shouldered with a **sea-blue
  sando**, `#0ea5e9`), **rolled trousers / shorts**, bare feet or rubber sandals,
  a small **buoy/float and a fish line** at the belt; damp, dripping sea look.
- **Prop / weapon:** a circular **cast net (Lambat)** with a beaded weighted
  edge that he **whirls and throws in a spreading vortex**, dragging enemies
  inward and leaving them Wet.
- **Expression:** quiet, watchful — reading the water, then a sharp focused snap
  on the cast.
- **Style:** High-contrast anime cel-shaded art, flat colors, bold clean outer
  strokes, 2D mobile game asset (Persona 5 UI pop × Hades silhouette), plain
  solid/white background, isolated character.
- **Palette:** sea-blue sando (anchor `#0ea5e9`), tan woven salakot, off-white
  net with pale-cyan sheen (`#7dd3fc`), sandy browns, cool water highlights. (Any
  engine tint is only a fallback for missing sprites — the real sheet uses the
  true colors, no flat wash.)

---

## Phase 1 — Base Concept + Camera Angles (do this first)

**Prompt:**
> Generate a comprehensive 2D character turnaround reference sheet for a mobile
> game character named Fisherfolk.
>
> **Character:** A lean, weather-hardened Filipino coastal fisher, sun-browned. A
> wide woven **salakot (conical sun hat)**; a **sea-blue sando/undershirt** with
> rolled trousers, bare feet or rubber sandals, a small buoy-float and fishing
> line at the belt, damp and salt-crusted; holding a circular **cast net (Lambat)**
> with a beaded weighted rim gathered in his arms. Quiet, watchful expression. An
> everyday hardworking Filipino, not a fantasy warrior.
>
> **Style:** High-contrast anime cel-shaded art, flat colors, bold clean outer
> strokes, 2D mobile game asset (Persona 5 UI pop crossed with Hades
> silhouettes). Plain solid background, isolated character.
>
> **Required Layout:** Show the exact same character in a row from these angles.
> Clothing, proportions, the salakot hat, and the fishing net must remain
> identical in every view:
> 1. **Front View:** looking directly at the camera.
> 2. **Side Profile:** 90-degree turn.
> 3. **Rear View (straight back):** looking completely away from the camera — we
>    see the underside brim/back of the salakot and his back with the net gathered.
> 4. **TOP-BEHIND (high-angle back view) — THE GAMEPLAY VIEW:** camera high above
>    and behind him, tilted (NOT flat zenith). We see the top of the woven salakot,
>    his shoulders and back and the bundled net as he faces away into the distance.
>    This is the angle his in-game sprites are drawn from — make it clean and clear.
> 5. **TOP-FRONT (high-angle front view):** camera high above and in front, tilted.
>    We see the top of the salakot plus his face and chest, net held ready.
>
> Ensure the wide salakot hat, the sea-blue sando, and the weighted cast net are
> clearly readable in all five views.

*Save the result as `docs/references/fisherfolk_base_turnaround.png`. This is the
base reference for every following phase.*

---

## Phase 2 — Animated Hero Sprite Sheet (TOP-BEHIND)

**Attach `fisherfolk_base_turnaround.png` first**, then:

> Attached is the base turnaround sheet for Fisherfolk. Generate a strictly
> formatted 2D sprite sheet for a top-down auto-battler.
>
> **Crucial Perspective:** Fisherfolk is a Hero. The camera is a high top-down
> oblique above and BEHIND our front line, so he faces AWAY from us into the enemy.
> **ALL frames must be drawn from a HIGH-ANGLE REAR VIEW (top-behind, back view)** —
> top of the salakot, shoulders and back from above. Not a flat zenith, no side
> profiles, no low angles.
>
> **Style & Formatting:** Match the anime cel-shaded style of the reference
> exactly (sea-blue sando, woven salakot, weighted cast net). Lay out as horizontal rows, one animation per row, each frame in its own evenly-spaced cell, non-overlapping, with consistent size and centering.
>
> **OUTPUT RULES (critical — the last generation drew these by mistake):** Fully **transparent** background — NO white fill. Do NOT draw any grid lines, cell borders, boxes, guide lines, or separators. Do NOT render any text, row names, labels, numbers, or captions anywhere in the image. Output ONLY the character art, arranged in evenly-spaced **invisible** cells.
>
> **MANDATORY LAYOUT — exactly 3 rows, in this exact top-to-bottom order:**
> 1. **`idle`** — EXACTLY 3 frames: standing, gentle breathing/bounce, the net
>    gathered loosely in his arms (rear view).
> 2. **`attack`** — EXACTLY 3 frames: his basic attack — **whirling and casting the
>    net forward in a spreading circular throw (vortex)**. Frame 2 is the clear
>    release frame, the net fanned wide open mid-air with a splash (rear view).
> 3. **`cast`** — EXACTLY 3 frames: his signature skill **Lambat** — planting his
>    feet, **spinning the big net overhead and hurling it wide** to drag enemies
>    from off-lanes into the center, a swirling water-vortex building (rear view,
>    dramatic).
>
> **SELF-CHECK — before returning the image, verify each item; if any FAILS, fix it and regenerate:**
> 1. **Consistent view** — every frame in every row uses the SAME camera angle stated above (heroes: rear / top-behind — we see the back; enemies: front / top-front — we see the face). No side profiles, no switching between front and back between frames.
> 2. **Frame counts** — each row has EXACTLY the number of frames listed for that row above.
> 3. **Clean output** — fully transparent background; NO grid lines, borders, boxes, text, labels, numbers, or captions anywhere.
> 4. **On-model & separated** — outfit / hair / props identical in every frame; poses do not touch or overlap.

*Export from Aseprite as `fisherfolk.png` + `fisherfolk.json` (JSON Hash or
Array), with the tag names above spelled exactly: `idle attack cast`.*

---

## Phase 3 — Lambat Skill Cut-In (anime-style)

**Attach `fisherfolk_base_turnaround.png` (or the front view) first**, then:

> Using the attached Fisherfolk reference, generate a large high-resolution 2D
> portrait sequence for his dramatic "Ultimate Skill" cut-in. Skill name:
> **LAMBAT** (a huge net cast that drags scattered enemies into one clump and soaks
> them Wet). Voice line: *"Huli ka, balbon!"*
>
> **Style:** Dramatic anime action shot, intense lighting, comic-book halftone
> overlays, dynamic speed lines. Close-up on upper body and face. Keep his salakot
> hat, sea-blue sando, and weighted cast net on-model.
>
> Generate 3 separate poses:
> 1. **Anticipation:** gathering the heavy net, winding it up overhead, dramatic
>    shadow, water dripping from the mesh.
> 2. **Action/Shout:** the climax — mouth wide open shouting "Huli ka!", the **net
>    fanned wide and foreshortened flying toward the camera**, a burst of spray and
>    swirling water speed lines.
> 3. **Resolution:** a cool post-cast pose, arms lowered, water still dripping, a
>    satisfied grin under the salakot, exhaling.

*Export as `fisherfolk_cutin.png` + `fisherfolk_cutin.json` (texture atlas). The
in-game `cast` body pose (Phase 2, row 4) plays underneath while this panel
slides.*

---

## Export & QA reminders

- Transparent background, consistent frame size, no clipped limbs/net.
- Tag names MUST match the engine states 1:1 — see the checklist in
  `docs/CHARACTER_VISUAL_PROMPT_GUIDE.md` (Phase 4).
- Drop finished files in `public/assets/heroes/`:
  `fisherfolk.png`, `fisherfolk.json`, `fisherfolk_cutin.png`,
  `fisherfolk_cutin.json`.

## Integration status

**The engine side is already done** — the model layer is `Sprite`-based, every
state routes through the sprite-sheet path with a tween fallback, Fisherfolk's
`spriteKey` resolves to `fisherfolk`, and `GameScene.createHeroAnimations()`
auto-wires any hero atlas that loads. Until the art exists Fisherfolk renders the
tinted `hero-base` placeholder (no broken texture) and still animates all six
states via tweens.

**To light up the real art, once you've generated the sheets:**
1. Drop `fisherfolk.png` + `fisherfolk.json` (and `fisherfolk_cutin.png` +
   `fisherfolk_cutin.json`) into `public/assets/heroes/`.
2. In `GameScene.preload()`, uncomment:
   `this.load.aseprite('fisherfolk', '/assets/heroes/fisherfolk.png', '/assets/heroes/fisherfolk.json');`
   (atlas key === `spriteKey` === `fisherfolk`). That's it — the six states play
   from real frames automatically.

**Still on the backlog (done when you're ready):** feed `fisherfolk_cutin` into
`SkillCutIn` so the Lambat cut-in plays real frames instead of the tinted
silhouette. The `cast` body pose already plays underneath.
