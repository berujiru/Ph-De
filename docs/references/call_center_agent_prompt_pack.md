# Call Center Agent — Character Art Prompt Pack

Ready-to-paste prompts for generating **Call Center Agent**, a Lightning chain
hero. Follows the two-phase workflow in
`docs/CHARACTER_VISUAL_PROMPT_GUIDE.md`: **Phase 1** locks a consistent base +
all camera angles; **Phase 2/3** reuse that base image as a reference so every
sheet stays on-model.

> Run these in an image-capable Claude/Gemini (not the coding CLI). Always
> **attach the previous phase's output** as reference before generating the next.

---

## Call Center Agent Visual Bible (locked — keep identical across every phase)

Synthesized from her/his profession + weapon (no portrait exists yet). An
everyday hardworking Filipino BPO worker — a **communal parody archetype**, never
a specific real person's likeness, name, or voice. Do not drift:

- **Who:** a sharp, sleep-deprived adult Filipino **BPO / call-center agent** on
  the graveyard shift. Fueled by coffee and deadpan wit, wired-in and relentless.
  *Not* a shiny fantasy warrior, *not* any specific real person.
- **Signature gear (their #1 read-at-a-glance silhouette cue):** a **headset with
  a boom mic** crackling with electricity, a **lanyard company ID**, and a
  **coiled headset cord that arcs like a live wire**. That glowing-headset read
  must survive every angle.
- **Prop / weapon:** the **headset itself** — they fire **arcs of "headset
  feedback" (Lightning)** that leap from the boom mic and chain between enemies;
  a coffee tumbler / smart-lanyard on the belt.
- **Outfit:** smart-casual office wear — collared polo or hoodie over a company
  shirt, jeans, sneakers, a lanyard with an access card.
- **Expression:** deadpan, unbothered, faint exhausted smirk.
- **Style:** High-contrast anime cel-shaded art, flat colors, bold clean outer
  strokes, 2D mobile game asset (Persona 5 UI pop × Hades silhouette), plain
  solid/white background, isolated character.
- **Palette:** anchored on **`#fef08a` (electric pale-yellow)** for the crackling
  headset glow, arcs, and screen-light accents; cool office blues and grays, a
  graveyard-shift dark backdrop feel on the character, warm tan skin. (The engine
  tint `#fef08a` is only a fallback for missing sprites — the real sheet uses
  these true colors, no flat wash.)

---

## Phase 1 — Base Concept + Camera Angles (do this first)

**Prompt:**
> Generate a comprehensive 2D character turnaround reference sheet for a mobile
> game character named Call Center Agent.
>
> **Character:** A sharp, sleep-deprived adult Filipino BPO / call-center agent on
> the graveyard shift. They wear a **headset with a boom mic crackling with faint
> electricity**, a **lanyard company ID**, and a coiled headset cord that arcs
> like a live wire. Smart-casual office wear — collared polo or hoodie over a
> company shirt, jeans, sneakers; a coffee tumbler on the belt. Deadpan,
> unbothered, faintly exhausted expression. An everyday hardworking Filipino BPO
> worker, not a fantasy warrior.
>
> **Style:** High-contrast anime cel-shaded art, flat colors, bold clean outer
> strokes, 2D mobile game asset (Persona 5 UI pop crossed with Hades
> silhouettes). Plain solid background, isolated character.
>
> **Required Layout:** Show the exact same character in a row from these angles.
> Clothing, proportions, the glowing headset + boom mic, and the lanyard must
> remain identical in every view:
> 1. **Front View:** looking directly at the camera.
> 2. **Side Profile:** 90-degree turn (the boom mic and headset cord read
>    clearly).
> 3. **Rear View (straight back):** looking completely away from the camera — we
>    see the back of the head, the headset band, and the coiled cord.
> 4. **TOP-BEHIND (high-angle rear 3/4) — THE GAMEPLAY VIEW:** camera high above
>    and behind them, tilted (NOT flat zenith). We see the top of the head, the
>    headset band and boom mic from above, shoulders and back as they face away
>    into the distance. This is the angle their in-game sprites are drawn from —
>    make it clean and clear.
> 5. **TOP-FRONT (high-angle front 3/4):** camera high above and in front,
>    tilted. We see the top of the head plus the face, the boom mic, and the
>    lanyard.
>
> Ensure the crackling headset with boom mic and the lanyard ID are clearly
> readable in all five views.

*Save the result as `docs/references/call_center_agent_base_turnaround.png`. This
is the base reference for every following phase.*

---

## Phase 2 — Animated Hero Sprite Sheet (TOP-BEHIND)

**Attach `call_center_agent_base_turnaround.png` first**, then:

> Attached is the base turnaround sheet for Call Center Agent. Generate a strictly
> formatted 2D sprite sheet for a top-down auto-battler.
>
> **Crucial Perspective:** Call Center Agent is a Hero. The camera is a high
> top-down oblique above and BEHIND our front line, so they face AWAY from us into
> the enemy. **ALL frames must be drawn from a HIGH-ANGLE REAR VIEW (top-behind,
> rear 3/4)** — top of head, the headset band and boom mic from above, shoulders,
> and back. Not a flat zenith, no side profiles, no low angles.
>
> **Style & Formatting:** Match the anime cel-shaded style of the reference
> exactly (glowing electric-yellow headset arcs, office blues/grays). Lay out as horizontal rows, one animation per row, each frame in its own evenly-spaced cell, non-overlapping, with consistent size and centering.
>
> **OUTPUT RULES (critical — the last generation drew these by mistake):** Fully **transparent** background — NO white fill. Do NOT draw any grid lines, cell borders, boxes, guide lines, or separators. Do NOT render any text, row names, labels, numbers, or captions anywhere in the image. Output ONLY the character art, arranged in evenly-spaced **invisible** cells.
>
> **MANDATORY LAYOUT — exactly 6 rows, in this exact top-to-bottom order:**
> 1. **`idle`** — EXACTLY 3 frames: standing, gentle breathing/bounce, one hand
>    resting on the headset ear-cup, faint electric flicker (rear view).
> 2. **`march`** — EXACTLY 4 frames: a full walk cycle advancing forward, brisk
>    caffeinated stride (rear view).
> 3. **`attack`** — EXACTLY 3 frames: pressing the boom mic and **firing a bolt of
>    crackling "headset feedback" (Lightning) forward that forks/chains** toward
>    the enemy. Frame 2 is the clear release/impact frame, arm forward, a jagged
>    arc leaping away and branching (rear view).
> 4. **`cast`** — EXACTLY 3 frames: their signature skill **Escalate to Manager**
>    — squaring up and **pointing forward as a heavy targeted lightning strike
>    charges down the lane**, building energy (rear view, dramatic).
> 5. **`celebrate`** — EXACTLY 2 frames: victory cheer, **raised fist**, a small
>    hop, head turned slightly so we catch the smirk (rear-3/4 view).
> 6. **`defeat`** — EXACTLY 2 frames: morale broken — the headset drooping and
>    **taking a knee**, slumped and exhausted (rear view). They are tired, NOT
>    dead.
>
> Verify every frame in every row is present in the final grid.

*Export from Aseprite as `call_center_agent.png` + `call_center_agent.json` (JSON
Hash or Array), with the tag names above spelled exactly:
`idle march attack cast celebrate defeat`.*

---

## Phase 3 — Escalate to Manager Skill Cut-In (anime-style)

**Attach `call_center_agent_base_turnaround.png` (or the front view) first**,
then:

> Using the attached Call Center Agent reference, generate a large high-resolution
> 2D portrait sequence for their dramatic "Ultimate Skill" cut-in. Skill name:
> **ESCALATE TO MANAGER** (they route a devastating single-target strike straight
> to the top). Voice line: *"Let me escalate this to my manager."* (deadpan
> Taglish).
>
> **Style:** Dramatic anime action shot, intense lighting, comic-book halftone
> overlays, dynamic speed lines. Close-up on upper body and face. Keep the
> glowing headset with boom mic, lanyard ID, and office wear on-model.
>
> Generate 3 separate poses:
> 1. **Anticipation:** deadpan, calmly tapping the boom mic, electricity gathering
>    at the ear-cup, dramatic shadow and coiled energy.
> 2. **Action/Shout:** the climax — snapping a finger-point forward as a massive
>    branching lightning bolt erupts from the headset toward the camera in
>    dramatic foreshortening, screen-glare arcs.
> 3. **Resolution:** a cool unbothered pose, sipping the coffee tumbler, faint
>    tired smirk.

*Export as `call_center_agent_cutin.png` + `call_center_agent_cutin.json`
(texture atlas). The in-game `cast` body pose (Phase 2, row 4) plays underneath
while this panel slides.*

---

## Export & QA reminders

- Transparent background, consistent frame size, no clipped limbs/headset/boom
  mic.
- Tag names MUST match the engine states 1:1 — see the checklist in
  `docs/CHARACTER_VISUAL_PROMPT_GUIDE.md` (Phase 4).
- Drop finished files in `public/assets/heroes/`:
  `call_center_agent.png`, `call_center_agent.json`,
  `call_center_agent_cutin.png`, `call_center_agent_cutin.json`.

## Integration status

**The engine side is already done** — the model layer is `Sprite`-based, every
state routes through the sprite-sheet path with a tween fallback, Call Center
Agent's `spriteKey` is `call_center_agent`, and
`GameScene.createHeroAnimations()` auto-wires any hero atlas that loads. Until the
art exists Call Center Agent renders the tinted `hero-base` placeholder (no broken
texture) and still animates all six states via tweens.

**To light up the real art, once you've generated the sheets:**
1. Drop `call_center_agent.png` + `call_center_agent.json` (and
   `call_center_agent_cutin.png` + `call_center_agent_cutin.json`) into
   `public/assets/heroes/`.
2. In `GameScene.preload()`, uncomment:
   `this.load.aseprite('call_center_agent', '/assets/heroes/call_center_agent.png', '/assets/heroes/call_center_agent.json');`
   (atlas key === `spriteKey` === `call_center_agent`). That's it — the six states
   play from real frames automatically.

**Still on the backlog (I do this when you're ready):** feed
`call_center_agent_cutin` into `SkillCutIn` so the Escalate to Manager cut-in
plays real frames instead of the tinted silhouette. The `cast` body pose already
plays underneath.
