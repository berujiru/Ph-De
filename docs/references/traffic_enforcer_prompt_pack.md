# Traffic Enforcer — Character Art Prompt Pack

Ready-to-paste prompts for generating **Traffic Enforcer (MMDA)**, a Physical
vortex crowd-control hero. Follows the two-phase workflow in
`docs/CHARACTER_VISUAL_PROMPT_GUIDE.md`: **Phase 1** locks a consistent base +
all camera angles; **Phase 2/3** reuse that base image as a reference so every
sheet stays on-model.

> Run these in an image-capable Claude/Gemini (not the coding CLI). Always
> **attach the previous phase's output** as reference before generating the next.

---

## Traffic Enforcer Visual Bible (locked — keep identical across every phase)

No portrait exists yet, so this bible is synthesized from the profession (MMDA
traffic enforcer), archetype, and weapon in `balance.ts` +
`WORLD_AND_HEROES.md`. Do not drift:

- **Who:** Traffic Enforcer — a weathered Filipino **street traffic enforcer**
  (generic MMDA-style *tanod ng kalsada*), the person who stands in the noon sun
  waving cars and whistling at the *kanto*. An everyday hardworking Filipino,
  authoritative and sun-baked — a communal parody of a traffic aide, *not* a
  fantasy soldier, *not* a specific real agency or person.
- **Build:** lean and wiry, planted stance, always mid-gesture.
- **Signature headwear:** a **hard peaked patrol cap** plus a **bright neon-yellow
  reflective safety vest** (his #1 read-at-a-glance silhouette cue — the vest must
  glow and survive every angle).
- **Outfit:** a plain khaki/slate short-sleeve uniform shirt under the reflective
  vest, dark trousers, sturdy boots; a lanyard **whistle** at his chest.
- **Prop / weapon:** a **handheld red-and-white "STOP" / "SLOW" traffic paddle
  (batuta baton)** and the **whistle**. His "attack" is a commanding whistle-blast
  + raised STOP paddle that magnetically drags enemies into a clump — draw faint
  swirling magnetic/vortex lines around the paddle.
- **Expression:** stern, no-nonsense authority — furrowed brow, mouth set to blow
  the whistle.
- **Style:** High-contrast anime cel-shaded art, flat colors, bold clean outer
  strokes, 2D mobile game asset (Persona 5 UI pop × Hades silhouette), plain
  solid/white background, isolated character.
- **Palette:** anchored on his engine color **slate `#475569`** (cap + uniform),
  offset by a **hi-vis neon-yellow vest**, red/white STOP paddle, silver whistle.
  Faint cyan swirl lines for the magnetic pull. (The engine tint is only a
  fallback for missing sprites — the real sheet uses these true colors, no flat
  slate wash.)

---

## Phase 1 — Base Concept + Camera Angles (do this first)

**Prompt:**
> Generate a comprehensive 2D character turnaround reference sheet for a mobile
> game character named Traffic Enforcer.
>
> **Character:** A weathered, sun-baked Filipino street traffic enforcer. Lean and
> wiry, planted authoritative stance. A **peaked patrol cap** and a **bright
> neon-yellow reflective safety vest** over a slate/khaki short-sleeve uniform
> shirt; dark trousers; boots; a **whistle on a lanyard** at his chest. Holding a
> **red-and-white "STOP" traffic paddle baton**. Stern, no-nonsense expression. An
> everyday hardworking Filipino traffic aide, not a fantasy soldier.
>
> **Style:** High-contrast anime cel-shaded art, flat colors, bold clean outer
> strokes, 2D mobile game asset (Persona 5 UI pop crossed with Hades
> silhouettes). Plain solid background, isolated character.
>
> **Required Layout:** Show the exact same character in a row from these angles.
> Clothing, proportions, cap, hi-vis vest, whistle, and the STOP paddle must
> remain identical in every view:
> 1. **Front View:** looking directly at the camera.
> 2. **Side Profile:** 90-degree turn.
> 3. **Rear View (straight back):** looking completely away from the camera — we
>    see the back of his cap and the reflective vest straps across his back.
> 4. **TOP-BEHIND (high-angle rear 3/4) — THE GAMEPLAY VIEW:** camera high above
>    and behind him, tilted (NOT flat zenith). We see the top of his cap, his
>    shoulders, the hi-vis vest and the raised STOP paddle, as he faces away into
>    the distance. This is the angle his in-game sprites are drawn from — make it
>    clean and clear.
> 5. **TOP-FRONT (high-angle front 3/4):** camera high above and in front, tilted.
>    We see the top of his cap plus his stern face, the whistle and the paddle.
>
> Ensure the neon-yellow reflective vest, the whistle, and the red-and-white STOP
> paddle are clearly readable in all five views.

*Save the result as `docs/references/traffic_enforcer_base_turnaround.png`. This is
the base reference for every following phase.*

---

## Phase 2 — Animated Hero Sprite Sheet (TOP-BEHIND)

**Attach `traffic_enforcer_base_turnaround.png` first**, then:

> Attached is the base turnaround sheet for Traffic Enforcer. Generate a strictly
> formatted 2D sprite sheet for a top-down auto-battler.
>
> **Crucial Perspective:** Traffic Enforcer is a Hero. The camera is a high
> top-down oblique above and BEHIND our front line, so he faces AWAY from us into
> the enemy. **ALL frames must be drawn from a HIGH-ANGLE REAR VIEW (top-behind,
> rear 3/4)** — top of the cap, shoulders, hi-vis vest straps, and back. Not a
> flat zenith, no side profiles, no low angles.
>
> **Style & Formatting:** Match the anime cel-shaded style of the reference
> exactly (slate uniform, neon-yellow vest, red/white STOP paddle, silver
> whistle). Lay out as horizontal rows, one animation per row, each frame in its own evenly-spaced cell, non-overlapping, with consistent size and centering.
>
> **OUTPUT RULES (critical — the last generation drew these by mistake):** Fully **transparent** background — NO white fill. Do NOT draw any grid lines, cell borders, boxes, guide lines, or separators. Do NOT render any text, row names, labels, numbers, or captions anywhere in the image. Output ONLY the character art, arranged in evenly-spaced **invisible** cells.
>
> **MANDATORY LAYOUT — exactly 6 rows, in this exact top-to-bottom order:**
> 1. **`idle`** — EXACTLY 3 frames: standing at attention, gentle breathing/bounce,
>    paddle held ready at his side (rear view).
> 2. **`march`** — EXACTLY 4 frames: a full walk cycle advancing forward with brisk
>    authority (rear view).
> 3. **`attack`** — EXACTLY 3 frames: **blowing the whistle and thrusting the STOP
>    paddle forward**, magnetic vortex lines swirling out to drag enemies into a
>    clump. Frame 2 is the clear impact frame — paddle fully extended, whistle
>    puff and swirl at its peak (rear view).
> 4. **`cast`** — EXACTLY 3 frames: his signature skill **STOP!** — planting his
>    feet, raising the STOP paddle high overhead with both hands and screaming a
>    whistle-blast, a hard commanding shockwave building (rear view, dramatic).
> 5. **`celebrate`** — EXACTLY 2 frames: victory cheer, **raised fist** (paddle
>    thrust up), jumping, head turned slightly so we catch his stern grin (rear-3/4
>    view).
> 6. **`defeat`** — EXACTLY 2 frames: morale broken — lowering the paddle and
>    **taking a knee**, slumped and exhausted, cap tilting (rear view). He is
>    tired, NOT dead.
>
> **SELF-CHECK — before returning the image, verify each item; if any FAILS, fix it and regenerate:**
> 1. **Consistent view** — every frame in every row uses the SAME camera angle stated above (heroes: rear / top-behind — we see the back; enemies: front / top-front — we see the face). No side profiles, no switching between front and back between frames.
> 2. **Frame counts** — each row has EXACTLY the number of frames listed for that row above.
> 3. **Clean output** — fully transparent background; NO grid lines, borders, boxes, text, labels, numbers, or captions anywhere.
> 4. **On-model & separated** — outfit / hair / props identical in every frame; poses do not touch or overlap.

*Export from Aseprite as `traffic_enforcer.png` + `traffic_enforcer.json` (JSON
Hash or Array), with the tag names above spelled exactly:
`idle march attack cast celebrate defeat`.*

---

## Phase 3 — STOP! Skill Cut-In (anime-style)

**Attach `traffic_enforcer_base_turnaround.png` (or the front view) first**, then:

> Using the attached Traffic Enforcer reference, generate a large high-resolution
> 2D portrait sequence for his dramatic "Ultimate Skill" cut-in. Skill name:
> **STOP!** (he throws up the STOP paddle and blows a piercing whistle that hard-
> stuns the whole road and cancels boss channels). Voice line:
> *"Tumabi ka! Huli ka! Nasaan lisensya mo?!"*
>
> **Style:** Dramatic anime action shot, intense lighting, comic-book halftone
> overlays, dynamic speed lines. Close-up on upper body and face. Keep his peaked
> cap, neon-yellow reflective vest, whistle, and red/white STOP paddle on-model.
>
> Generate 3 separate poses:
> 1. **Anticipation:** rearing back, drawing the whistle to his lips, paddle
>    lowered, dramatic shadow, coiled energy.
> 2. **Action/Blast:** the climax — the STOP paddle THRUST toward the camera in
>    hard foreshortening, whistle screaming, a giant "STOP" shockwave and speed
>    lines exploding outward.
> 3. **Resolution:** a cool authoritative post-blast pose, paddle lowered, arms
>    crossed, exhaling, waving traffic off.

*Export as `traffic_enforcer_cutin.png` + `traffic_enforcer_cutin.json` (texture
atlas). The in-game `cast` body pose (Phase 2, row 4) plays underneath while this
panel slides.*

---

## Export & QA reminders

- Transparent background, consistent frame size, no clipped limbs/paddle/whistle.
- Tag names MUST match the engine states 1:1 — see the checklist in
  `docs/CHARACTER_VISUAL_PROMPT_GUIDE.md` (Phase 4).
- Drop finished files in `public/assets/heroes/`:
  `traffic_enforcer.png`, `traffic_enforcer.json`, `traffic_enforcer_cutin.png`,
  `traffic_enforcer_cutin.json`.

## Integration status

**The engine side is already done** — the model layer is `Sprite`-based, every
state routes through the sprite-sheet path with a tween fallback, Traffic
Enforcer's `spriteKey` is `traffic_enforcer`, and
`GameScene.createHeroAnimations()` auto-wires any hero atlas that loads. Until the
art exists Traffic Enforcer renders the tinted `hero-base` placeholder (no broken
texture) and still animates all six states via tweens.

**To light up the real art, once you've generated the sheets:**
1. Drop `traffic_enforcer.png` + `traffic_enforcer.json` (and
   `traffic_enforcer_cutin.png` + `traffic_enforcer_cutin.json`) into
   `public/assets/heroes/`.
2. In `GameScene.preload()`, uncomment:
   `this.load.aseprite('traffic_enforcer', '/assets/heroes/traffic_enforcer.png', '/assets/heroes/traffic_enforcer.json');`
   That's it — the six states play from real frames automatically (atlas key ===
   the hero's `spriteKey`, `traffic_enforcer`).

**Still on the backlog (I do this when you're ready):** feed
`traffic_enforcer_cutin` into `SkillCutIn` so the STOP! cut-in plays real frames
instead of the tinted silhouette. The `cast` body pose already plays underneath.
