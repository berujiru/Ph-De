# Security Guard — Character Art Prompt Pack

Ready-to-paste prompts for generating **Security Guard (Sikyu)**, a Physical
melee-cleave hero. Follows the two-phase workflow in
`docs/CHARACTER_VISUAL_PROMPT_GUIDE.md`: **Phase 1** locks a consistent base +
all camera angles; **Phase 2/3** reuse that base image as a reference so every
sheet stays on-model.

> Run these in an image-capable Claude/Gemini (not the coding CLI). Always
> **attach the previous phase's output** as reference before generating the next.

---

## Security Guard Visual Bible (locked — keep identical across every phase)

Synthesized from his profession + weapon (no portrait exists yet). An everyday
hardworking Filipino guard — a **communal parody archetype**, never a specific
real person's likeness, name, or voice. Do not drift:

- **Who:** a stocky, no-nonsense adult Filipino **security guard ("sikyu")** —
  the mall/subdivision gate sentry. Vigilant, tired-but-firm, holds the line.
  *Not* a shiny fantasy warrior, *not* any specific real person.
- **Signature gear (his #1 read-at-a-glance silhouette cue):** a **navy-blue
  guard uniform with peaked cap and a big shiny "SECURITY" badge**, a duty belt
  carrying a **long metal flashlight** and holster. That navy-cap + badge read
  must survive every angle.
- **Prop / weapon:** a **wooden nightstick / baton (batuta)** he swings in a
  frontal cleave; the heavy flashlight rides on his belt for his skill.
- **Outfit:** buttoned navy uniform shirt with epaulettes, black slacks, black
  boots, a whistle on a lanyard.
- **Expression:** stern, watchful, jaw set.
- **Style:** High-contrast anime cel-shaded art, flat colors, bold clean outer
  strokes, 2D mobile game asset (Persona 5 UI pop × Hades silhouette), plain
  solid/white background, isolated character.
- **Palette:** anchored on **`#1e3a8a` (deep navy guard blue)** for the uniform
  and cap; a gold/silver badge and whistle, wood-brown baton, a bright flashlight
  beam accent, warm tan skin. (The engine tint `#1e3a8a` is only a fallback for
  missing sprites — the real sheet uses these true colors, no flat wash.)

---

## Phase 1 — Base Concept + Camera Angles (do this first)

**Prompt:**
> Generate a comprehensive 2D character turnaround reference sheet for a mobile
> game character named Security Guard.
>
> **Character:** A stocky, no-nonsense adult Filipino security guard ("sikyu"). He
> wears a **navy-blue guard uniform with epaulettes, a peaked cap, and a big shiny
> "SECURITY" badge**, a duty belt with a **long metal flashlight** and holster,
> and a whistle on a lanyard. He holds a **wooden nightstick / baton (batuta)**.
> Stern, watchful, jaw-set expression. An everyday hardworking Filipino guard, not
> a fantasy warrior.
>
> **Style:** High-contrast anime cel-shaded art, flat colors, bold clean outer
> strokes, 2D mobile game asset (Persona 5 UI pop crossed with Hades
> silhouettes). Plain solid background, isolated character.
>
> **Required Layout:** Show the exact same character in a row from these angles.
> Clothing, proportions, the navy cap + badge, the flashlight on the belt, and the
> baton must remain identical in every view:
> 1. **Front View:** looking directly at the camera.
> 2. **Side Profile:** 90-degree turn.
> 3. **Rear View (straight back):** looking completely away from the camera — we
>    see the back of the cap, the shoulders, and the duty belt with flashlight.
> 4. **TOP-BEHIND (high-angle rear 3/4) — THE GAMEPLAY VIEW:** camera high above
>    and behind him, tilted (NOT flat zenith). We see the top of the peaked cap,
>    the shoulders and back, the baton in hand as he faces away into the distance.
>    This is the angle his in-game sprites are drawn from — make it clean and
>    clear.
> 5. **TOP-FRONT (high-angle front 3/4):** camera high above and in front,
>    tilted. We see the top of the cap plus his face, the "SECURITY" badge, and
>    the duty belt.
>
> Ensure the navy peaked cap with badge, the belt flashlight, and the wooden baton
> are clearly readable in all five views.

*Save the result as `docs/references/security_guard_base_turnaround.png`. This is
the base reference for every following phase.*

---

## Phase 2 — Animated Hero Sprite Sheet (TOP-BEHIND)

**Attach `security_guard_base_turnaround.png` first**, then:

> Attached is the base turnaround sheet for Security Guard. Generate a strictly
> formatted 2D sprite sheet for a top-down auto-battler.
>
> **Crucial Perspective:** Security Guard is a Hero. The camera is a high top-down
> oblique above and BEHIND our front line, so he faces AWAY from us into the
> enemy. **ALL frames must be drawn from a HIGH-ANGLE REAR VIEW (top-behind, rear
> 3/4)** — top of the peaked cap, shoulders, and back. Not a flat zenith, no side
> profiles, no low angles.
>
> **Style & Formatting:** Match the anime cel-shaded style of the reference
> exactly (navy uniform, shiny badge, wooden baton, flashlight beam). Lay out as horizontal rows, one animation per row, each frame in its own evenly-spaced cell, non-overlapping, with consistent size and centering.
>
> **OUTPUT RULES (critical — the last generation drew these by mistake):** Fully **transparent** background — NO white fill. Do NOT draw any grid lines, cell borders, boxes, guide lines, or separators. Do NOT render any text, row names, labels, numbers, or captions anywhere in the image. Output ONLY the character art, arranged in evenly-spaced **invisible** cells.
>
> **MANDATORY LAYOUT — exactly 6 rows, in this exact top-to-bottom order:**
> 1. **`idle`** — EXACTLY 3 frames: standing at attention, gentle
>    breathing/bounce, baton held at his side (rear view).
> 2. **`march`** — EXACTLY 4 frames: a full walk cycle advancing forward, a firm
>    patrolling stride (rear view).
> 3. **`attack`** — EXACTLY 3 frames: a **wide horizontal baton (batuta) swing
>    that cleaves the enemies in front**. Frame 2 is the clear impact frame, baton
>    mid-arc with an impact flash (rear view).
> 4. **`cast`** — EXACTLY 3 frames: his signature skill **Shining Flashlight** —
>    unclipping the heavy flashlight and **sweeping a wide blinding cone of light
>    forward** across the lane, building energy (rear view, dramatic).
> 5. **`celebrate`** — EXACTLY 2 frames: victory cheer, **raised fist / baton
>    pump**, a stomp, head turned slightly so we catch his grin (rear-3/4 view).
> 6. **`defeat`** — EXACTLY 2 frames: morale broken — lowering the baton and
>    **taking a knee**, slumped and exhausted (rear view). He is tired, NOT dead.
>
> **SELF-CHECK — before returning the image, verify each item; if any FAILS, fix it and regenerate:**
> 1. **Consistent view** — every frame in every row uses the SAME camera angle stated above (heroes: rear / top-behind — we see the back; enemies: front / top-front — we see the face). No side profiles, no switching between front and back between frames.
> 2. **Frame counts** — each row has EXACTLY the number of frames listed for that row above.
> 3. **Clean output** — fully transparent background; NO grid lines, borders, boxes, text, labels, numbers, or captions anywhere.
> 4. **On-model & separated** — outfit / hair / props identical in every frame; poses do not touch or overlap.

*Export from Aseprite as `security_guard.png` + `security_guard.json` (JSON Hash
or Array), with the tag names above spelled exactly:
`idle march attack cast celebrate defeat`.*

---

## Phase 3 — Shining Flashlight Skill Cut-In (anime-style)

**Attach `security_guard_base_turnaround.png` (or the front view) first**, then:

> Using the attached Security Guard reference, generate a large high-resolution 2D
> portrait sequence for his dramatic "Ultimate Skill" cut-in. Skill name:
> **SHINING FLASHLIGHT** (he blasts a wide cone of blinding light that heavily
> slows the horde). Voice line: *"Hoy! Anong ginagawa mo diyan?! Bawal tambay!"*
>
> **Style:** Dramatic anime action shot, intense lighting, comic-book halftone
> overlays, dynamic speed lines. Close-up on upper body and face. Keep his navy
> peaked cap, "SECURITY" badge, uniform, baton, and metal flashlight on-model.
>
> Generate 3 separate poses:
> 1. **Anticipation:** thumbing the flashlight switch, a squint and a bark, the
>    lens glinting, dramatic shadow and coiled energy.
> 2. **Action/Shout:** the climax — thrusting the flashlight forward as a huge
>    blinding cone of white light blasts toward the camera in dramatic
>    foreshortening, lens flare and glare rings.
> 3. **Resolution:** a cool authoritative pose, flashlight lowered, arms folded,
>    a stern nod.

*Export as `security_guard_cutin.png` + `security_guard_cutin.json` (texture
atlas). The in-game `cast` body pose (Phase 2, row 4) plays underneath while this
panel slides.*

---

## Export & QA reminders

- Transparent background, consistent frame size, no clipped limbs/baton/flashlight.
- Tag names MUST match the engine states 1:1 — see the checklist in
  `docs/CHARACTER_VISUAL_PROMPT_GUIDE.md` (Phase 4).
- Drop finished files in `public/assets/heroes/`:
  `security_guard.png`, `security_guard.json`, `security_guard_cutin.png`,
  `security_guard_cutin.json`.

## Integration status

**The engine side is already done** — the model layer is `Sprite`-based, every
state routes through the sprite-sheet path with a tween fallback, Security Guard's
`spriteKey` is `security_guard`, and `GameScene.createHeroAnimations()` auto-wires
any hero atlas that loads. Until the art exists Security Guard renders the tinted
`hero-base` placeholder (no broken texture) and still animates all six states via
tweens.

**To light up the real art, once you've generated the sheets:**
1. Drop `security_guard.png` + `security_guard.json` (and
   `security_guard_cutin.png` + `security_guard_cutin.json`) into
   `public/assets/heroes/`.
2. In `GameScene.preload()`, uncomment:
   `this.load.aseprite('security_guard', '/assets/heroes/security_guard.png', '/assets/heroes/security_guard.json');`
   (atlas key === `spriteKey` === `security_guard`). That's it — the six states
   play from real frames automatically.

**Still on the backlog (I do this when you're ready):** feed
`security_guard_cutin` into `SkillCutIn` so the Shining Flashlight cut-in plays
real frames instead of the tinted silhouette. The `cast` body pose already plays
underneath.
