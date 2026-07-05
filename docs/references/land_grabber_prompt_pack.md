# Land Grabber — Enemy Art Prompt Pack (minion template)

Ready-to-paste prompts for generating **Land Grabber**, a displacer-anomaly
minion. This pack mirrors the **enemy template** in
`docs/references/grunt_prompt_pack.md`. Enemies differ from heroes in two ways
(see `docs/CHARACTER_VISUAL_PROMPT_GUIDE.md`):

- **Perspective is TOP-FRONT** (high-angle front 3/4) — anomalies face the camera
  as they bear down on the barrier.
- **State set is `march / attack / stunned / celebrate / death`** (5 rows). There
  is **no anime skill cut-in** for enemies. **Bosses** add a 6th **`cast`** row
  for their `activeSkill` and are drawn larger and more grotesque.

> Run these in an image-capable Claude/Gemini (not the coding CLI). Always
> **attach the previous phase's output** as reference before generating the next.

**Binding rule:** enemies personify a *behavior or scandal as a category* — never
a real official, party, or contractor. Design a grotesque concept-creature, not a
person (`docs/WORLD_AND_HEROES.md`).

---

## Land Grabber Visual Bible (locked — keep identical across every phase)

No portrait exists — this bible is **synthesized** from its role (the displacer
anomaly that bulldozes and passively knocks your frontline back) and its
`balance.ts` color anchor `#4d7c0f` (olive) plus its `knockbackPulseCooldown`
shove behavior. Do not drift:

- **What:** Land Grabber — a lumbering **earth-moving machine-monster anomaly**,
  illegal seizure and displacement made flesh: part bulldozer, part beast, that
  simply pushes everything off its "claimed" ground. Grotesque, exaggerated,
  slightly comedic — a concept-creature, not a human.
- **Body:** a hulking half-organic bulldozer creature — a scarred hide grafted onto
  a rusted **dozer chassis**, a massive scraping **blade/plow for a lower jaw or
  chest**, tank-tread limbs churning mud. Crooked **survey stakes and torn
  "PRIVATE PROPERTY / fenced-off" tape** jut from its back like trophies.
- **Signature read-at-a-glance cue:** the **big earth-mover blade/plow across its
  front + survey stakes and claim-fence flags on its back** — clearly the thing
  that shoves you off the line. This is its #1 silhouette read and must survive
  every angle.
- **Face:** a bullish, dead-eyed glower — low-set eyes over the plow, snorting,
  utterly indifferent as it flattens everything ahead.
- **Style:** High-contrast cel-shaded vector art, flat colors, bold clean outer
  strokes, 2D mobile game asset (Persona 5 UI pop × Hades silhouette), plain
  solid/white background, isolated character. Reads clearly at small size.
- **Palette:** land-grabber olive-green (anchor `#4d7c0f`), rusted-dozer orange-
  brown, mud-brown treads, warning-tape yellow, dull steel blade. (Any engine tint
  is only a fallback for missing sprites — the real sheet uses its true colors, no
  flat wash.)

---

## Phase 1 — Base Concept + Camera Angles (do this first)

**Prompt:**
> Generate a comprehensive 2D character turnaround reference sheet for a mobile
> game enemy creature named Land Grabber.
>
> **Creature:** A lumbering earth-moving machine-monster anomaly — a hulking
> half-organic bulldozer beast, a scarred hide grafted onto a **rusted dozer
> chassis**, a massive scraping **blade/plow across its front**, churning
> **tank-tread limbs**, with crooked **survey stakes and torn "PRIVATE PROPERTY"
> claim-tape** jutting from its back like trophies. A bullish dead-eyed glower over
> the plow. Grotesque and slightly comedic — a concept-creature, not a human, and
> not any real person.
>
> **Style:** High-contrast cel-shaded vector art, flat colors, bold clean outer
> strokes, 2D mobile game asset (Persona 5 UI pop crossed with Hades
> silhouettes). Plain solid background, isolated creature.
>
> **Required Layout:** Show the exact same creature in a row from these angles.
> Proportions, the front blade/plow, and the survey-stake trophies must remain
> identical in every view:
> 1. **Front View:** looking directly at the camera.
> 2. **Side Profile:** 90-degree turn.
> 3. **Rear View (straight back):** facing away — we see its treaded back and the
>    survey stakes and claim-tape bristling behind it.
> 4. **TOP-FRONT (high-angle front 3/4) — THE GAMEPLAY VIEW:** camera high above
>    and in front, tilted (NOT flat zenith). We see the top of its head plus its
>    bullish face, the big front blade/plow, and its churning treads as it bears
>    down on the viewer. This is the angle its in-game sprites are drawn from —
>    make it clean and clear.
> 5. **TOP-BEHIND (high-angle rear 3/4):** camera high above and behind, tilted;
>    top of head, treaded shoulders, and the staked-out back.
>
> Ensure the earth-mover blade/plow, the tank-tread limbs, and the survey-stake
> and claim-tape trophies are clearly readable in all five views.

*Save the result as `docs/references/land_grabber_base_turnaround.png`. This is
the base reference for the next phase.*

---

## Phase 2 — Animated Enemy Sprite Sheet (TOP-FRONT)

**Attach `land_grabber_base_turnaround.png` first**, then:

> Attached is the base turnaround sheet for the Land Grabber anomaly. Generate a
> strictly formatted 2D sprite sheet for a top-down auto-battler.
>
> **Crucial Perspective:** Land Grabber is an Enemy. The camera is a high top-down
> oblique above and behind the player's line, so it faces TOWARD the camera as it
> bears down on the barrier. **ALL frames must be drawn from a HIGH-ANGLE FRONT
> VIEW (top-front, front 3/4)** — top of head, plus bullish face, front blade/plow,
> and churning treads. Not a flat zenith, no side profiles, no low angles.
>
> **Style & Formatting:** Match the cel-shaded vector style of the reference
> exactly (dozer blade, tank treads, survey-stake trophies). Clean grid, one
> animation per row, evenly spaced, non-overlapping poses, on a transparent or
> solid white background. Consistent frame size and centering.
>
> **MANDATORY LAYOUT — exactly 5 labelled rows:**
> 1. **`march`** — EXACTLY 4 frames: a grinding tread-driven advance toward the
>    viewer, blade scraping, throwing up mud (front view).
> 2. **`attack`** — EXACTLY 3 frames: **ramming the barrier with its front
>    blade/plow and heaving upward to shove**. Frame 2 is the clear impact frame,
>    debris and a knockback shockwave bursting out (front view).
> 3. **`stunned`** — EXACTLY 2 frames: dazed, engine sputtering, blade drooped,
>    **spinning stars** circling its head, treads stalled (front view).
> 4. **`celebrate`** — EXACTLY 2 frames: it overran the line — rearing up and
>    **slamming a fresh claim-stake into the ground in triumph** (front view).
>    Plays when the player loses.
> 5. **`death`** — EXACTLY 3 frames: **grinding to a halt and falling apart — the
>    chassis buckles, treads fly off and it crumbles into rust, mud, and toppled
>    survey stakes** (front view).
>
> Verify every frame in every row is present in the final grid.

*Export from Aseprite as `land_grabber.png` + `land_grabber.json` (JSON Hash or
Array), with the tag names above spelled exactly:
`march attack stunned celebrate death`.*

---

## Export & QA reminders

- Transparent background, consistent frame size, no clipped limbs.
- Tag names MUST match the engine states 1:1 — see the checklist in
  `docs/CHARACTER_VISUAL_PROMPT_GUIDE.md` (Phase 4).
- Drop finished files in `public/assets/enemies/`: `land_grabber.png`,
  `land_grabber.json`.

## Integration status

**The engine side is already done** — `EnemyModel` is `Sprite`-based, every state
routes through the sprite-sheet path with a tween fallback, an enemy's atlas key
defaults to its `id`, and `GameScene.createEnemyAnimations()` auto-wires any enemy
atlas that loads. Until the art exists Land Grabber renders the tinted
`enemy-base` placeholder (no broken texture) and still animates all states via
tweens.

**To light up the real art, once you've generated the sheet:**
1. Drop `land_grabber.png` + `land_grabber.json` into `public/assets/enemies/`.
2. In `GameScene.preload()`, uncomment:
   `this.load.aseprite('land_grabber', '/assets/enemies/land_grabber.png', '/assets/enemies/land_grabber.json');`
   (atlas key defaults to the enemy `id` = `land_grabber`). That's it — the states
   play from real frames automatically.
