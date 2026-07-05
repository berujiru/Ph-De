# Electrician — Character Art Prompt Pack

Ready-to-paste prompts for generating **Electrician**, a fully-animated hero.
Follows the two-phase workflow in `docs/CHARACTER_VISUAL_PROMPT_GUIDE.md`:
**Phase 1** locks a consistent base + all camera angles; **Phase 2/3** reuse
that base image as a reference so every sheet stays on-model.

> Run these in an image-capable Claude/Gemini (not the coding CLI). Always
> **attach the previous phase's output** as reference before generating the next.

---

## Electrician Visual Bible (locked — keep identical across every phase)

No portrait exists yet — this bible is **synthesized** from his profession
(lineman), his weapon (arcing jumper cables that chain-bounce to 3 targets), and
his `balance.ts` color anchor `#38bdf8` (electric sky-blue). Do not drift:

- **Who:** Electrician — a wiry, unflappable Filipino **lineman** (Meralco-style
  power worker). An everyday hardworking Filipino, calm and competent — *not* a
  shiny fantasy warrior, *not* a specific real person or company. A communal
  parody archetype only.
- **Headwear:** a scuffed **yellow hard hat** with a small headlamp.
- **Signature read-at-a-glance cue:** a **climbing/utility harness with a tool
  belt** and a pair of **jumper cables arcing blue electricity** in hand — this
  pairing is his #1 silhouette read and must survive every angle.
- **Outfit:** a **sky-blue lineman's work shirt** (`#38bdf8`) with reflective
  strips, rolled sleeves, heavy rubber-insulated gloves, sturdy boots.
- **Prop / weapon:** insulated **jumper cables / clamps** he snaps together so a
  crackling electric arc leaps out and bounces between targets (his chain attack).
- **Expression:** focused and dry — the "I've fixed worse than this" look.
- **Style:** High-contrast anime cel-shaded art, flat colors, bold clean outer
  strokes, 2D mobile game asset (Persona 5 UI pop × Hades silhouette), plain
  solid/white background, isolated character.
- **Palette:** sky-blue work shirt (anchor `#38bdf8`), yellow hard hat, black
  rubber gloves, bright white-blue electric arcs, orange reflective strips. (Any
  engine tint is only a fallback for missing sprites — the real sheet uses his
  true colors, no flat wash.)

---

## Phase 1 — Base Concept + Camera Angles (do this first)

**Prompt:**
> Generate a comprehensive 2D character turnaround reference sheet for a mobile
> game character named Electrician.
>
> **Character:** A wiry Filipino lineman / power worker. A scuffed **yellow hard
> hat** with a small headlamp; a **sky-blue lineman's work shirt** with reflective
> strips and rolled sleeves; a **climbing/utility harness with a tool belt**;
> heavy rubber-insulated gloves; holding a pair of **insulated jumper cables /
> clamps** with a crackling blue electric arc between them. Focused, dry
> expression. An everyday hardworking Filipino, not a fantasy warrior.
>
> **Style:** High-contrast anime cel-shaded art, flat colors, bold clean outer
> strokes, 2D mobile game asset (Persona 5 UI pop crossed with Hades
> silhouettes). Plain solid background, isolated character.
>
> **Required Layout:** Show the exact same character in a row from these angles.
> Clothing, proportions, hard hat, harness/tool belt, and the jumper cables must
> remain identical in every view:
> 1. **Front View:** looking directly at the camera.
> 2. **Side Profile:** 90-degree turn.
> 3. **Rear View (straight back):** looking completely away from the camera — we
>    see the back of the hard hat, the harness straps, the tool belt, and his back.
> 4. **TOP-BEHIND (high-angle back view) — THE GAMEPLAY VIEW:** camera high above
>    and behind him, tilted (NOT flat zenith). We see the top of the hard hat, the
>    harness and tool belt from above, his shoulders and back as he faces away
>    into the distance. This is the angle his in-game sprites are drawn from —
>    make it clean and clear.
> 5. **TOP-FRONT (high-angle front view):** camera high above and in front, tilted.
>    We see the top of the hard hat plus his face, the work shirt, and the sparking
>    cables.
>
> Ensure the yellow hard hat, the sky-blue work shirt, the tool belt, and the
> arcing jumper cables are clearly readable in all five views.

*Save the result as `docs/references/electrician_base_turnaround.png`. This is
the base reference for every following phase.*

---

## Phase 2 — Animated Hero Sprite Sheet (TOP-BEHIND)

**Attach `electrician_base_turnaround.png` first**, then:

> Attached is the base turnaround sheet for Electrician. Generate a strictly
> formatted 2D sprite sheet for a top-down auto-battler.
>
> **Crucial Perspective:** Electrician is a Hero. The camera is a high top-down
> oblique above and BEHIND our front line, so Electrician faces AWAY from us into
> the enemy. **ALL frames must be drawn from a HIGH-ANGLE REAR VIEW (top-behind,
> back view)** — top of the hard hat, the harness/tool belt from above, shoulders,
> and back. Not a flat zenith, no side profiles, no low angles.
>
> **Style & Formatting:** Match the anime cel-shaded style of the reference
> exactly (sky-blue shirt, yellow hard hat, rubber gloves, arcing jumper cables). Lay out as horizontal rows, one animation per row, each frame in its own evenly-spaced cell, non-overlapping, with consistent size and centering.
>
> **OUTPUT RULES (critical — the last generation drew these by mistake):** Fully **transparent** background — NO white fill. Do NOT draw any grid lines, cell borders, boxes, guide lines, or separators. Do NOT render any text, row names, labels, numbers, or captions anywhere in the image. Output ONLY the character art, arranged in evenly-spaced **invisible** cells.
>
> **MANDATORY LAYOUT — exactly 3 rows, in this exact top-to-bottom order:**
> 1. **`idle`** — EXACTLY 3 frames: standing, gentle breathing/bounce, jumper
>    cables held ready with a faint spark (rear view).
> 2. **`attack`** — EXACTLY 3 frames: his basic attack — **snapping the jumper
>    cables together so a crackling electric arc leaps forward and forks toward
>    several targets** (his chain / Live Wire attack). Frame 2 is the clear
>    discharge frame, arc branching off into the distance (rear view).
> 3. **`cast`** — EXACTLY 3 frames: his signature skill **Rolling Blackout** —
>    planting his feet, **jamming the cables down and overloading**, a wide ring of
>    electricity and darkness surging outward across the whole screen (rear view,
>    dramatic).
>
> **SELF-CHECK — before returning the image, verify each item; if any FAILS, fix it and regenerate:**
> 1. **Consistent view** — every frame in every row uses the SAME camera angle stated above (heroes: rear / top-behind — we see the back; enemies: front / top-front — we see the face). No side profiles, no switching between front and back between frames.
> 2. **Frame counts** — each row has EXACTLY the number of frames listed for that row above.
> 3. **Clean output** — fully transparent background; NO grid lines, borders, boxes, text, labels, numbers, or captions anywhere.
> 4. **On-model & separated** — outfit / hair / props identical in every frame; poses do not touch or overlap.

*Export from Aseprite as `electrician.png` + `electrician.json` (JSON Hash or
Array), with the tag names above spelled exactly: `idle attack cast`.*

---

## Phase 3 — Rolling Blackout Skill Cut-In (anime-style)

**Attach `electrician_base_turnaround.png` (or the front view) first**, then:

> Using the attached Electrician reference, generate a large high-resolution 2D
> portrait sequence for his dramatic "Ultimate Skill" cut-in. Skill name:
> **ROLLING BLACKOUT** (he overloads the grid, stunning the entire screen).
> Voice line: *"Brownout muna! Hintay kayo sa Meralco!"*
>
> **Style:** Dramatic anime action shot, intense lighting, comic-book halftone
> overlays, dynamic speed lines. Close-up on upper body and face. Keep his yellow
> hard hat, sky-blue work shirt, rubber gloves, and arcing jumper cables on-model.
>
> Generate 3 separate poses:
> 1. **Anticipation:** gripping both cable clamps, electricity gathering and
>    crackling up his arms, dramatic shadow, coiled power.
> 2. **Action/Shout:** the climax — mouth wide open shouting, **slamming the clamps
>    together toward the camera** with a blinding short-circuit flash, forked
>    lightning and a blackout shockwave rippling out.
> 3. **Resolution:** a cool composed post-overload pose, cables lowered and smoking
>    faintly, hard hat glinting, exhaling.

*Export as `electrician_cutin.png` + `electrician_cutin.json` (texture atlas). The
in-game `cast` body pose (Phase 2, row 4) plays underneath while this panel
slides.*

---

## Export & QA reminders

- Transparent background, consistent frame size, no clipped limbs/cables.
- Tag names MUST match the engine states 1:1 — see the checklist in
  `docs/CHARACTER_VISUAL_PROMPT_GUIDE.md` (Phase 4).
- Drop finished files in `public/assets/heroes/`:
  `electrician.png`, `electrician.json`, `electrician_cutin.png`,
  `electrician_cutin.json`.

## Integration status

**The engine side is already done** — the model layer is `Sprite`-based, every
state routes through the sprite-sheet path with a tween fallback, Electrician's
`spriteKey` resolves to `electrician`, and `GameScene.createHeroAnimations()`
auto-wires any hero atlas that loads. Until the art exists Electrician renders the
tinted `hero-base` placeholder (no broken texture) and still animates all six
states via tweens.

**To light up the real art, once you've generated the sheets:**
1. Drop `electrician.png` + `electrician.json` (and `electrician_cutin.png` +
   `electrician_cutin.json`) into `public/assets/heroes/`.
2. In `GameScene.preload()`, uncomment:
   `this.load.aseprite('electrician', '/assets/heroes/electrician.png', '/assets/heroes/electrician.json');`
   (atlas key === `spriteKey` === `electrician`). That's it — the six states play
   from real frames automatically.

**Still on the backlog (done when you're ready):** feed `electrician_cutin` into
`SkillCutIn` so the Rolling Blackout cut-in plays real frames instead of the
tinted silhouette. The `cast` body pose already plays underneath.
