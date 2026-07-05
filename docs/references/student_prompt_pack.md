# Student — Character Art Prompt Pack

Ready-to-paste prompts for generating **Student**, a fully-animated hero.
Follows the two-phase workflow in `docs/CHARACTER_VISUAL_PROMPT_GUIDE.md`:
**Phase 1** locks a consistent base + all camera angles; **Phase 2/3** reuse
that base image as a reference so every sheet stays on-model.

> Run these in an image-capable Claude/Gemini (not the coding CLI). Always
> **attach the previous phase's output** as reference before generating the next.

---

## Student Visual Bible (locked — keep identical across every phase)

No portrait exists yet — this bible is **synthesized** from his profession
(working student), his weapon (a **slingshot / tirador** firing pebbles in a
piercing line), and his `balance.ts` color anchor `#f59e0b` (amber). Do not
drift:

- **Who:** Student — a scrappy, sleep-deprived Filipino **working student**, a
  teenager/young adult who juggles class and a part-time job. An everyday
  hardworking Filipino, determined and resourceful — *not* a shiny fantasy
  warrior, *not* a specific real person. A communal parody archetype only.
- **Hair:** short black hair, a little messy; faint dark circles under the eyes
  (the working-student badge of honor).
- **Signature read-at-a-glance cue:** a bulky **school backpack** on his back
  (pens, rolled papers, an energy-drink can poking out) **and** a **slingshot
  (tirador)** in hand — this pairing is his #1 silhouette read and must survive
  every angle.
- **Outfit:** a **white school polo/uniform shirt** with sleeves rolled up (the
  "working" tell), an **amber ID lanyard** (`#f59e0b`), plain slacks, worn
  sneakers.
- **Prop / weapon:** a Y-frame **slingshot (tirador)** loaded with a **pebble**;
  he fires straight, piercing shots.
- **Expression:** tired but fiercely focused — cramming energy, jaw set.
- **Style:** High-contrast anime cel-shaded art, flat colors, bold clean outer
  strokes, 2D mobile game asset (Persona 5 UI pop × Hades silhouette), plain
  solid/white background, isolated character.
- **Palette:** white polo, black hair, **amber lanyard/backpack accents**
  (anchor `#f59e0b`), golden-yellow pebble glint (`#fcd34d`), navy slacks. (Any
  engine tint is only a fallback for missing sprites — the real sheet uses his
  true colors, no flat wash.)

---

## Phase 1 — Base Concept + Camera Angles (do this first)

**Prompt:**
> Generate a comprehensive 2D character turnaround reference sheet for a mobile
> game character named Student.
>
> **Character:** A scrappy Filipino working student, teenager/young adult. Short
> messy black hair, faint tired eye-circles; a **white school polo** with sleeves
> rolled up, an **amber ID lanyard**, plain slacks and worn sneakers; a bulky
> **school backpack** on his back with pens and an energy-drink can poking out;
> holding a Y-frame **slingshot (tirador)** loaded with a pebble. Tired but
> fiercely focused expression. An everyday hardworking Filipino, not a fantasy
> warrior.
>
> **Style:** High-contrast anime cel-shaded art, flat colors, bold clean outer
> strokes, 2D mobile game asset (Persona 5 UI pop crossed with Hades
> silhouettes). Plain solid background, isolated character.
>
> **Required Layout:** Show the exact same character in a row from these angles.
> Clothing, proportions, hair, backpack, lanyard, and the slingshot must remain
> identical in every view:
> 1. **Front View:** looking directly at the camera.
> 2. **Side Profile:** 90-degree turn.
> 3. **Rear View (straight back):** looking completely away from the camera — we
>    see the back of his head and the **backpack** filling his back.
> 4. **TOP-BEHIND (high-angle rear 3/4) — THE GAMEPLAY VIEW:** camera high above
>    and behind him, tilted (NOT flat zenith). We see the top of his head, the
>    backpack from above, his shoulders and back as he faces away into the
>    distance. This is the angle his in-game sprites are drawn from — make it clean
>    and clear.
> 5. **TOP-FRONT (high-angle front 3/4):** camera high above and in front, tilted.
>    We see the top of his head plus his face, lanyard, and chest, slingshot
>    raised.
>
> Ensure the white polo, the amber lanyard, the backpack, and the slingshot are
> clearly readable in all five views.

*Save the result as `docs/references/student_base_turnaround.png`. This is the
base reference for every following phase.*

---

## Phase 2 — Animated Hero Sprite Sheet (TOP-BEHIND)

**Attach `student_base_turnaround.png` first**, then:

> Attached is the base turnaround sheet for Student. Generate a strictly formatted
> 2D sprite sheet for a top-down auto-battler.
>
> **Crucial Perspective:** Student is a Hero. The camera is a high top-down
> oblique above and BEHIND our front line, so Student faces AWAY from us into the
> enemy. **ALL frames must be drawn from a HIGH-ANGLE REAR VIEW (top-behind, rear
> 3/4)** — top of head, the backpack from above, shoulders, and back. Not a flat
> zenith, no side profiles, no low angles.
>
> **Style & Formatting:** Match the anime cel-shaded style of the reference
> exactly (white polo, black hair, amber lanyard, school backpack, slingshot).
> Clean grid, one animation per row, evenly spaced, non-overlapping poses, on a
> transparent or solid white background. Consistent frame size and centering.
>
> **MANDATORY LAYOUT — exactly 6 labelled rows:**
> 1. **`idle`** — EXACTLY 3 frames: standing, gentle breathing/bounce, slingshot
>    held low at his side (rear view).
> 2. **`march`** — EXACTLY 4 frames: a full walk cycle advancing forward, the
>    backpack bouncing as he marches with purpose (rear view).
> 3. **`attack`** — EXACTLY 3 frames: his basic attack — **drawing back the
>    slingshot and firing a pebble in a straight piercing line** forward. Frame 2
>    is the clear release frame, the band snapping straight and the pebble
>    streaking off (rear view).
> 4. **`cast`** — EXACTLY 3 frames: his signature skill **Cramming** — frantically
>    yanking out crumpled notes and a phone, papers whirling around him, channeling
>    a burst of study-energy toward an adjacent ally (rear view, dramatic).
> 5. **`celebrate`** — EXACTLY 2 frames: victory cheer, **raised fist** pumping,
>    slingshot held high, head turned slightly so we catch his tired grin
>    (rear-3/4 view).
> 6. **`defeat`** — EXACTLY 2 frames: morale broken — dropping the slingshot and
>    **taking a knee**, slumped over the backpack, exhausted (rear view). He is
>    tired, NOT dead.
>
> Verify every frame in every row is present in the final grid.

*Export from Aseprite as `student.png` + `student.json` (JSON Hash or Array),
with the tag names above spelled exactly: `idle march attack cast celebrate
defeat`.*

---

## Phase 3 — Cramming Skill Cut-In (anime-style)

**Attach `student_base_turnaround.png` (or the front view) first**, then:

> Using the attached Student reference, generate a large high-resolution 2D
> portrait sequence for his dramatic "Ultimate Skill" cut-in. Skill name:
> **CRAMMING** (a desperate last-minute burst that instantly resets an adjacent
> hero's skill cooldown). Voice line: *"Hala, deadline na bukas! Ipasa na 'to!"*
>
> **Style:** Dramatic anime action shot, intense lighting, comic-book halftone
> overlays, dynamic speed lines. Close-up on upper body and face. Keep his white
> polo, black hair, amber lanyard, backpack, and slingshot on-model.
>
> Generate 3 separate poses:
> 1. **Anticipation:** eyes going wide with panic, snatching a stack of notes and a
>    phone, dramatic shadow, papers starting to lift.
> 2. **Action/Shout:** the climax — mouth wide open yelling "Ipasa na 'to!", a
>    **storm of papers and a phone screen foreshortened toward the camera**,
>    frantic speed lines and a blaze of amber study-energy.
> 3. **Resolution:** a cool spent post-cram pose, wiping his brow with a relieved
>    smirk, slingshot slung back over his shoulder, exhaling.

*Export as `student_cutin.png` + `student_cutin.json` (texture atlas). The in-game
`cast` body pose (Phase 2, row 4) plays underneath while this panel slides.*

---

## Export & QA reminders

- Transparent background, consistent frame size, no clipped limbs/slingshot.
- Tag names MUST match the engine states 1:1 — see the checklist in
  `docs/CHARACTER_VISUAL_PROMPT_GUIDE.md` (Phase 4).
- Drop finished files in `public/assets/heroes/`:
  `student.png`, `student.json`, `student_cutin.png`, `student_cutin.json`.

## Integration status

**The engine side is already done** — the model layer is `Sprite`-based, every
state routes through the sprite-sheet path with a tween fallback, Student's
`spriteKey` resolves to `student`, and `GameScene.createHeroAnimations()`
auto-wires any hero atlas that loads. Until the art exists Student renders the
tinted `hero-base` placeholder (no broken texture) and still animates all six
states via tweens.

**To light up the real art, once you've generated the sheets:**
1. Drop `student.png` + `student.json` (and `student_cutin.png` +
   `student_cutin.json`) into `public/assets/heroes/`.
2. In `GameScene.preload()`, uncomment:
   `this.load.aseprite('student', '/assets/heroes/student.png', '/assets/heroes/student.json');`
   (atlas key === `spriteKey` === `student`). That's it — the six states play
   from real frames automatically.

**Still on the backlog (done when you're ready):** feed `student_cutin` into
`SkillCutIn` so the Cramming cut-in plays real frames instead of the tinted
silhouette. The `cast` body pose already plays underneath.
