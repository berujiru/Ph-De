# Plumber — Character Art Prompt Pack

Ready-to-paste prompts for generating **Plumber (Tubero)**, a Water linear-wave
hero. Follows the two-phase workflow in
`docs/CHARACTER_VISUAL_PROMPT_GUIDE.md`: **Phase 1** locks a consistent base +
all camera angles; **Phase 2/3** reuse that base image as a reference so every
sheet stays on-model.

> Run these in an image-capable Claude/Gemini (not the coding CLI). Always
> **attach the previous phase's output** as reference before generating the next.

---

## Plumber Visual Bible (locked — keep identical across every phase)

No portrait exists yet, so this bible is synthesized from the profession
(Tubero / water worker), archetype, and weapon in `balance.ts` +
`WORLD_AND_HEROES.md`. Do not drift:

- **Who:** Plumber — a burly Filipino **tubero (neighborhood plumber / water
  worker)**, the guy you call when the pipe bursts under the *kusina*. An everyday
  hardworking Filipino, soaked to the elbows and unbothered — *not* a fantasy
  water-mage, *not* a specific real person.
- **Build:** big-armed and sturdy, water-slicked forearms, sleeves rolled up.
- **Signature headwear:** a **backwards navy cap** and a **coil of pipe / rubber
  hose slung across his chest** like a bandolier (his #1 read-at-a-glance
  silhouette cue — the hose coil must survive every angle).
- **Outfit:** a soaked **blue work coverall / jumpsuit** rolled to the waist over a
  white sando, a tool belt of **pipe wrenches**, rubber boots.
- **Prop / weapon:** a **big chrome pipe wrench** in one hand and the **open
  high-pressure pipe / hose nozzle** in the other. His attack is a horizontal
  **high-pressure water blast wave** down the lane — draw a fan of pressurized
  water streaming from the pipe.
- **Expression:** easygoing, confident smirk — the "kaya ko 'to" tradesman look.
- **Style:** High-contrast anime cel-shaded art, flat colors, bold clean outer
  strokes, 2D mobile game asset (Persona 5 UI pop × Hades silhouette), plain
  solid/white background, isolated character.
- **Palette:** anchored on his engine color **blue `#2563eb`** (coverall + cap +
  the water jet), white sando, chrome/silver wrench and pipe, cyan-white foam
  highlights on the water. (The engine tint is only a fallback for missing
  sprites — the real sheet uses these true colors, no flat blue wash.)

---

## Phase 1 — Base Concept + Camera Angles (do this first)

**Prompt:**
> Generate a comprehensive 2D character turnaround reference sheet for a mobile
> game character named Plumber.
>
> **Character:** A burly Filipino neighborhood plumber (tubero). Big-armed and
> sturdy with water-slicked forearms. A **backwards navy cap** and a **coil of
> rubber pipe/hose slung across his chest** like a bandolier; a soaked **blue work
> coverall rolled to the waist over a white sando**; a **tool belt of pipe
> wrenches**; rubber boots. Holding a **big chrome pipe wrench** and an **open
> high-pressure pipe nozzle** gushing water. Easygoing confident smirk. An
> everyday hardworking Filipino tradesman, not a fantasy water-mage.
>
> **Style:** High-contrast anime cel-shaded art, flat colors, bold clean outer
> strokes, 2D mobile game asset (Persona 5 UI pop crossed with Hades
> silhouettes). Plain solid background, isolated character.
>
> **Required Layout:** Show the exact same character in a row from these angles.
> Clothing, proportions, cap, hose coil, wrench, and the pipe nozzle must remain
> identical in every view:
> 1. **Front View:** looking directly at the camera.
> 2. **Side Profile:** 90-degree turn.
> 3. **Rear View (straight back):** looking completely away from the camera — we
>    see the backwards cap from behind, the hose coil, and the coverall tied at
>    his back.
> 4. **TOP-BEHIND (high-angle rear 3/4) — THE GAMEPLAY VIEW:** camera high above
>    and behind him, tilted (NOT flat zenith). We see the top of his cap, his
>    shoulders and back, the hose coil, and the pipe nozzle, as he faces away into
>    the distance. This is the angle his in-game sprites are drawn from — make it
>    clean and clear.
> 5. **TOP-FRONT (high-angle front 3/4):** camera high above and in front, tilted.
>    We see the top of his cap plus his smirking face, the wrench and gushing pipe.
>
> Ensure the coiled hose bandolier, the chrome wrench, and the high-pressure water
> from the pipe are clearly readable in all five views.

*Save the result as `docs/references/plumber_base_turnaround.png`. This is the
base reference for every following phase.*

---

## Phase 2 — Animated Hero Sprite Sheet (TOP-BEHIND)

**Attach `plumber_base_turnaround.png` first**, then:

> Attached is the base turnaround sheet for Plumber. Generate a strictly formatted
> 2D sprite sheet for a top-down auto-battler.
>
> **Crucial Perspective:** Plumber is a Hero. The camera is a high top-down
> oblique above and BEHIND our front line, so Plumber faces AWAY from us into the
> enemy. **ALL frames must be drawn from a HIGH-ANGLE REAR VIEW (top-behind, rear
> 3/4)** — top of the cap, hose coil, shoulders, and back. Not a flat zenith, no
> side profiles, no low angles.
>
> **Style & Formatting:** Match the anime cel-shaded style of the reference
> exactly (blue coverall, white sando, chrome wrench, cyan-white water). Clean
> grid, one animation per row, evenly spaced, non-overlapping poses, on a
> transparent or solid white background. Consistent frame size and centering.
>
> **MANDATORY LAYOUT — exactly 6 labelled rows:**
> 1. **`idle`** — EXACTLY 3 frames: standing, gentle breathing/bounce, wrench
>    resting on his shoulder, pipe at his hip (rear view).
> 2. **`march`** — EXACTLY 4 frames: a full walk cycle advancing forward, hose coil
>    and tool belt swaying (rear view).
> 3. **`attack`** — EXACTLY 3 frames: **bracing the pipe and unleashing a
>    horizontal high-pressure water blast wave** down the lane. Frame 2 is the
>    clear impact frame — the pressurized water fan at full spread, his stance
>    braced against the recoil (rear view).
> 4. **`cast`** — EXACTLY 3 frames: his signature skill **Flush** — planting his
>    feet, hoisting the pipe overhead and cranking the valve to build a **massive
>    surging wave of water** behind him (rear view, dramatic).
> 5. **`celebrate`** — EXACTLY 2 frames: victory cheer, **raised fist** (wrench
>    thrust up), jumping, head turned slightly so we catch his grin (rear-3/4
>    view).
> 6. **`defeat`** — EXACTLY 2 frames: morale broken — dropping the pipe and
>    **taking a knee**, slumped and exhausted, water pooling at his feet (rear
>    view). He is tired, NOT dead.
>
> Verify every frame in every row is present in the final grid.

*Export from Aseprite as `plumber.png` + `plumber.json` (JSON Hash or Array), with
the tag names above spelled exactly: `idle march attack cast celebrate defeat`.*

---

## Phase 3 — Flush Skill Cut-In (anime-style)

**Attach `plumber_base_turnaround.png` (or the front view) first**, then:

> Using the attached Plumber reference, generate a large high-resolution 2D
> portrait sequence for his dramatic "Ultimate Skill" cut-in. Skill name:
> **FLUSH** (he cranks the pipe wide open and sends a massive wave that washes
> every enemy summon away). Voice line: *"I-flush ang mga sagabal!"*
>
> **Style:** Dramatic anime action shot, intense lighting, comic-book halftone
> overlays, dynamic speed lines. Close-up on upper body and face. Keep his
> backwards navy cap, hose coil bandolier, blue coverall, and chrome pipe/wrench
> on-model.
>
> Generate 3 separate poses:
> 1. **Anticipation:** gripping the pipe valve with both hands, bracing, dramatic
>    shadow, a rumble of water building, coiled energy.
> 2. **Action/Blast:** the climax — the pipe nozzle THRUST toward the camera in
>    hard foreshortening, a colossal wall of water erupting outward with foam and
>    speed lines.
> 3. **Resolution:** a cool satisfied post-blast pose, wrench slung on his
>    shoulder, water dripping, exhaling with a smirk.

*Export as `plumber_cutin.png` + `plumber_cutin.json` (texture atlas). The in-game
`cast` body pose (Phase 2, row 4) plays underneath while this panel slides.*

---

## Export & QA reminders

- Transparent background, consistent frame size, no clipped limbs/wrench/pipe.
- Tag names MUST match the engine states 1:1 — see the checklist in
  `docs/CHARACTER_VISUAL_PROMPT_GUIDE.md` (Phase 4).
- Drop finished files in `public/assets/heroes/`:
  `plumber.png`, `plumber.json`, `plumber_cutin.png`, `plumber_cutin.json`.

## Integration status

**The engine side is already done** — the model layer is `Sprite`-based, every
state routes through the sprite-sheet path with a tween fallback, Plumber's
`spriteKey` is `plumber`, and `GameScene.createHeroAnimations()` auto-wires any
hero atlas that loads. Until the art exists Plumber renders the tinted `hero-base`
placeholder (no broken texture) and still animates all six states via tweens.

**To light up the real art, once you've generated the sheets:**
1. Drop `plumber.png` + `plumber.json` (and `plumber_cutin.png` +
   `plumber_cutin.json`) into `public/assets/heroes/`.
2. In `GameScene.preload()`, uncomment:
   `this.load.aseprite('plumber', '/assets/heroes/plumber.png', '/assets/heroes/plumber.json');`
   That's it — the six states play from real frames automatically (atlas key ===
   the hero's `spriteKey`, `plumber`).

**Still on the backlog (I do this when you're ready):** feed `plumber_cutin` into
`SkillCutIn` so the Flush cut-in plays real frames instead of the tinted
silhouette. The `cast` body pose already plays underneath.
