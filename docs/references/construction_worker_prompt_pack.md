# Construction Worker — Character Art Prompt Pack

Ready-to-paste prompts for generating **Construction Worker**, a Physical
summoner hero. Follows the two-phase workflow in
`docs/CHARACTER_VISUAL_PROMPT_GUIDE.md`: **Phase 1** locks a consistent base +
all camera angles; **Phase 2/3** reuse that base image as a reference so every
sheet stays on-model.

> Run these in an image-capable Claude/Gemini (not the coding CLI). Always
> **attach the previous phase's output** as reference before generating the next.

---

## Construction Worker Visual Bible (locked — keep identical across every phase)

Synthesized from his profession + weapon (no portrait exists yet). An everyday
hardworking Filipino laborer — a **communal parody archetype**, never a specific
real person's likeness, name, or voice. Do not drift:

- **Who:** a broad, sturdy adult Filipino **construction laborer / carpenter** —
  the tireless "obrero." Sun-baked, dependable, immovable. *Not* a shiny fantasy
  warrior, *not* any specific real person.
- **Signature gear (his #1 read-at-a-glance silhouette cue):** a bright **yellow
  hard hat** and a **tool belt loaded with a hammer, and rolled corrugated
  galvanized-iron (yero) sheets slung on his back**. That hard-hat + slung-yero
  read must survive every angle.
- **Prop / weapon:** he doesn't shoot — he **plants yero fences/barricades**,
  hammering a folded galvanized sheet into a standing wall on the path.
- **Outfit:** dirt-smudged tank top or open work shirt over a sando, sturdy
  work gloves, worn cargo pants, heavy boots, a rag tucked in the belt.
- **Expression:** unbothered, focused, salt-of-the-earth grit.
- **Style:** High-contrast cel-shaded vector art, flat colors, bold clean outer
  strokes, 2D mobile game asset (Persona 5 UI pop × Hades silhouette), plain
  solid/white background, isolated character.
- **Palette:** anchored on **`#d97706` (safety amber / construction orange)** for
  the hard hat and hazard accents; brushed-steel corrugated yero, denim, dust and
  tan skin. (The engine tint `#d97706` is only a fallback for missing sprites —
  the real sheet uses these true colors, no flat wash.)

---

## Phase 1 — Base Concept + Camera Angles (do this first)

**Prompt:**
> Generate a comprehensive 2D character turnaround reference sheet for a mobile
> game character named Construction Worker.
>
> **Character:** A broad, sturdy adult Filipino construction laborer / carpenter.
> He wears a bright **yellow hard hat** and a **tool belt with a hammer**, with
> **rolled corrugated galvanized-iron (yero) sheets slung on his back**.
> Dirt-smudged work shirt over a sando, work gloves, cargo pants, heavy boots.
> Unbothered, focused, gritty expression. An everyday hardworking Filipino
> laborer, not a fantasy warrior.
>
> **Style:** High-contrast cel-shaded vector art, flat colors, bold clean outer
> strokes, 2D mobile game asset (Persona 5 UI pop crossed with Hades
> silhouettes). Plain solid background, isolated character.
>
> **Required Layout:** Show the exact same character in a row from these angles.
> Clothing, proportions, the hard hat, hammer, and slung yero sheets must remain
> identical in every view:
> 1. **Front View:** looking directly at the camera.
> 2. **Side Profile:** 90-degree turn.
> 3. **Rear View (straight back):** looking completely away from the camera — we
>    see the back of his head, the hard hat, and the corrugated yero sheets on his
>    back.
> 4. **TOP-BEHIND (high-angle rear 3/4) — THE GAMEPLAY VIEW:** camera high above
>    and behind him, tilted (NOT flat zenith). We see the top of the yellow hard
>    hat, the yero sheets from above, his broad shoulders and back as he faces
>    away into the distance. This is the angle his in-game sprites are drawn from
>    — make it clean and clear.
> 5. **TOP-FRONT (high-angle front 3/4):** camera high above and in front,
>    tilted. We see the top of the hard hat plus his face, chest, and tool belt.
>
> Ensure the yellow hard hat, the hammer, and the corrugated yero sheets are
> clearly readable in all five views.

*Save the result as `docs/references/construction_worker_base_turnaround.png`.
This is the base reference for every following phase.*

---

## Phase 2 — Animated Hero Sprite Sheet (TOP-BEHIND)

**Attach `construction_worker_base_turnaround.png` first**, then:

> Attached is the base turnaround sheet for Construction Worker. Generate a
> strictly formatted 2D sprite sheet for a top-down auto-battler.
>
> **Crucial Perspective:** Construction Worker is a Hero. The camera is a high
> top-down oblique above and BEHIND our front line, so he faces AWAY from us into
> the enemy. **ALL frames must be drawn from a HIGH-ANGLE REAR VIEW (top-behind,
> rear 3/4)** — top of the hard hat, the yero sheets from above, shoulders, and
> back. Not a flat zenith, no side profiles, no low angles.
>
> **Style & Formatting:** Match the cel-shaded vector style of the reference
> exactly (yellow hard hat, corrugated steel yero, denim, dust). Clean grid, one
> animation per row, evenly spaced, non-overlapping poses, on a transparent or
> solid white background. Consistent frame size and centering.
>
> **MANDATORY LAYOUT — exactly 6 labelled rows:**
> 1. **`idle`** — EXACTLY 3 frames: standing broad and steady, gentle
>    breathing/bounce, hammer resting on his shoulder (rear view).
> 2. **`march`** — EXACTLY 4 frames: a full heavy walk cycle advancing forward,
>    weighty labourer stomp (rear view).
> 3. **`attack`** — EXACTLY 3 frames: his basic build — **hammering a short yero
>    plate down into the ground ahead** to plant a small barricade. Frame 2 is the
>    clear impact frame, hammer striking with a spark (rear view).
> 4. **`cast`** — EXACTLY 3 frames: his signature skill **Yero Barricade** —
>    hoisting a large corrugated galvanized-iron sheet overhead and **slamming a
>    tall wall down across the path**, dust kicking up, building energy (rear
>    view, dramatic).
> 5. **`celebrate`** — EXACTLY 2 frames: victory cheer, **raised fist / hammer
>    pump**, a stomp, head turned slightly so we catch his grin (rear-3/4 view).
> 6. **`defeat`** — EXACTLY 2 frames: morale broken — dropping the hammer and
>    **taking a knee**, slumped and exhausted (rear view). He is tired, NOT dead.
>
> Verify every frame in every row is present in the final grid.

*Export from Aseprite as `construction_worker.png` + `construction_worker.json`
(JSON Hash or Array), with the tag names above spelled exactly:
`idle march attack cast celebrate defeat`.*

---

## Phase 3 — Yero Barricade Skill Cut-In (anime-style)

**Attach `construction_worker_base_turnaround.png` (or the front view) first**,
then:

> Using the attached Construction Worker reference, generate a large
> high-resolution 2D portrait sequence for his dramatic "Ultimate Skill" cut-in.
> Skill name: **YERO BARRICADE** (he slams down an indestructible galvanized wall
> that blocks the horde). Voice line: *"Bawal dumaan, may ginagawa!"*
>
> **Style:** Dramatic anime action shot, intense lighting, comic-book halftone
> overlays, dynamic speed lines. Close-up on upper body and face. Keep his yellow
> hard hat, hammer, corrugated yero sheets, and work gloves on-model.
>
> Generate 3 separate poses:
> 1. **Anticipation:** heaving a huge corrugated galvanized sheet up over his
>    shoulders, muscles straining, dramatic shadow and coiled energy.
> 2. **Action/Shout:** the climax — slamming the towering yero wall down, hammer
>    driving a spike, a shockwave of dust and sparks bursting toward the camera in
>    dramatic foreshortening.
> 3. **Resolution:** a cool immovable pose, arms crossed in front of the finished
>    wall, a satisfied nod.

*Export as `construction_worker_cutin.png` + `construction_worker_cutin.json`
(texture atlas). The in-game `cast` body pose (Phase 2, row 4) plays underneath
while this panel slides.*

---

## Export & QA reminders

- Transparent background, consistent frame size, no clipped limbs/hammer/yero.
- Tag names MUST match the engine states 1:1 — see the checklist in
  `docs/CHARACTER_VISUAL_PROMPT_GUIDE.md` (Phase 4).
- Drop finished files in `public/assets/heroes/`:
  `construction_worker.png`, `construction_worker.json`,
  `construction_worker_cutin.png`, `construction_worker_cutin.json`.

## Integration status

**The engine side is already done** — the model layer is `Sprite`-based, every
state routes through the sprite-sheet path with a tween fallback, Construction
Worker's `spriteKey` is `construction_worker`, and
`GameScene.createHeroAnimations()` auto-wires any hero atlas that loads. Until
the art exists Construction Worker renders the tinted `hero-base` placeholder (no
broken texture) and still animates all six states via tweens.

**To light up the real art, once you've generated the sheets:**
1. Drop `construction_worker.png` + `construction_worker.json` (and
   `construction_worker_cutin.png` + `construction_worker_cutin.json`) into
   `public/assets/heroes/`.
2. In `GameScene.preload()`, uncomment:
   `this.load.aseprite('construction_worker', '/assets/heroes/construction_worker.png', '/assets/heroes/construction_worker.json');`
   (atlas key === `spriteKey` === `construction_worker`). That's it — the six
   states play from real frames automatically.

**Still on the backlog (I do this when you're ready):** feed
`construction_worker_cutin` into `SkillCutIn` so the Yero Barricade cut-in plays
real frames instead of the tinted silhouette. The `cast` body pose already plays
underneath.
