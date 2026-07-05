# Kickback Courier — Enemy Art Prompt Pack (minion template)

Ready-to-paste prompts for generating **Kickback Courier**, a fast thief-anomaly
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

## Kickback Courier Visual Bible (locked — keep identical across every phase)

No portrait exists — this bible is **synthesized** from its role (the fast thief
anomaly that skims gold off every transaction and pays out "with interest" when
slain) and its `balance.ts` color anchor `#10b981` (emerald) plus its
`stealVoicesPerSecond` steal behavior. Do not drift:

- **What:** Kickback Courier — a scrawny, twitchy **imp anomaly** built for speed,
  the under-the-table payoff made flesh. Grotesque, exaggerated, slightly comedic
  — a concept-creature, not a human.
- **Body:** a wiry hunched imp sprinting low, hugging a bulging **leaking money
  duffel** to its chest; coins and rolled bills spill from a torn seam and leave a
  glinting trail. Long grabby fingers, splayed running feet.
- **Signature read-at-a-glance cue:** the **overstuffed leaking duffel + coin
  trail** clutched against its chest — this is its #1 silhouette read and must
  survive every angle. Cash physically leaks out of it wherever it goes.
- **Face:** a greedy, darting smirk — shifty slit eyes, tongue out one corner, a
  furtive "you didn't see anything" grin.
- **Style:** High-contrast cel-shaded vector art, flat colors, bold clean outer
  strokes, 2D mobile game asset (Persona 5 UI pop × Hades silhouette), plain
  solid/white background, isolated character. Reads clearly at small size.
- **Palette:** kickback emerald (anchor `#10b981`), dirty envelope-manila, greasy
  grey imp skin, gold-coin yellow, black seam shadows. (Any engine tint is only a
  fallback for missing sprites — the real sheet uses its true colors, no flat
  wash.)

---

## Phase 1 — Base Concept + Camera Angles (do this first)

**Prompt:**
> Generate a comprehensive 2D character turnaround reference sheet for a mobile
> game enemy creature named Kickback Courier.
>
> **Creature:** A scrawny, twitchy imp-anomaly built for speed — a wiry hunched
> body sprinting low, clutching a bulging **leaking money duffel** to its chest
> with **coins and rolled bills spilling from a torn seam** in a glinting trail.
> Long grabby fingers, a greedy darting smirk with shifty slit eyes. Grotesque and
> slightly comedic — a concept-creature, not a human, and not any real person.
>
> **Style:** High-contrast cel-shaded vector art, flat colors, bold clean outer
> strokes, 2D mobile game asset (Persona 5 UI pop crossed with Hades
> silhouettes). Plain solid background, isolated creature.
>
> **Required Layout:** Show the exact same creature in a row from these angles.
> Proportions, the leaking duffel, and the spilling coins must remain identical in
> every view:
> 1. **Front View:** looking directly at the camera.
> 2. **Side Profile:** 90-degree turn.
> 3. **Rear View (straight back):** facing away — we see its back and the coin
>    trail dribbling off the duffel behind it.
> 4. **TOP-FRONT (high-angle front 3/4) — THE GAMEPLAY VIEW:** camera high above
>    and in front, tilted (NOT flat zenith). We see the top of its head plus its
>    face, the clutched duffel, and its grabby hands as it darts toward the viewer.
>    This is the angle its in-game sprites are drawn from — make it clean and
>    clear.
> 5. **TOP-BEHIND (high-angle rear 3/4):** camera high above and behind, tilted;
>    top of head, hunched shoulders, and the leaking duffel from behind.
>
> Ensure the leaking money duffel, spilling coins, and grabby imp hands are
> clearly readable in all five views.

*Save the result as `docs/references/kickback_courier_base_turnaround.png`. This
is the base reference for the next phase.*

---

## Phase 2 — Animated Enemy Sprite Sheet (TOP-FRONT)

**Attach `kickback_courier_base_turnaround.png` first**, then:

> Attached is the base turnaround sheet for the Kickback Courier anomaly. Generate
> a strictly formatted 2D sprite sheet for a top-down auto-battler.
>
> **Crucial Perspective:** Kickback Courier is an Enemy. The camera is a high
> top-down oblique above and behind the player's line, so it faces TOWARD the
> camera as it bears down on the barrier. **ALL frames must be drawn from a
> HIGH-ANGLE FRONT VIEW (top-front, front 3/4)** — top of head, plus face, chest,
> the clutched duffel, and grabby hands. Not a flat zenith, no side profiles, no
> low angles.
>
> **Style & Formatting:** Match the cel-shaded vector style of the reference
> exactly (leaking money duffel, spilling coins, greedy smirk). Clean grid, one
> animation per row, evenly spaced, non-overlapping poses, on a transparent or
> solid white background. Consistent frame size and centering.
>
> **MANDATORY LAYOUT — exactly 5 labelled rows:**
> 1. **`march`** — EXACTLY 4 frames: a fast, low, scurrying run toward the viewer,
>    coins bouncing out of the duffel each stride (front view).
> 2. **`attack`** — EXACTLY 3 frames: **swinging the heavy duffel like a
>    wrecking-bag** to bash the barrier, coins flying. Frame 2 is the clear impact
>    frame, cash bursting out (front view).
> 3. **`stunned`** — EXACTLY 2 frames: dazed, wobbling, **spinning stars / dizzy
>    coins** circling its head, duffel slipping from its grip (front view).
> 4. **`celebrate`** — EXACTLY 2 frames: it overran the line — cackling and
>    **flinging fistfuls of stolen cash overhead in triumph** (front view). Plays
>    when the player loses.
> 5. **`death`** — EXACTLY 3 frames: **bursting apart in a shower of spilled
>    coins, torn envelopes, and fluttering bills** ("paying out with interest"),
>    collapsing (front view).
>
> Verify every frame in every row is present in the final grid.

*Export from Aseprite as `kickback_courier.png` + `kickback_courier.json` (JSON
Hash or Array), with the tag names above spelled exactly:
`march attack stunned celebrate death`.*

---

## Export & QA reminders

- Transparent background, consistent frame size, no clipped limbs.
- Tag names MUST match the engine states 1:1 — see the checklist in
  `docs/CHARACTER_VISUAL_PROMPT_GUIDE.md` (Phase 4).
- Drop finished files in `public/assets/enemies/`: `kickback_courier.png`,
  `kickback_courier.json`.

## Integration status

**The engine side is already done** — `EnemyModel` is `Sprite`-based, every state
routes through the sprite-sheet path with a tween fallback, an enemy's atlas key
defaults to its `id`, and `GameScene.createEnemyAnimations()` auto-wires any enemy
atlas that loads. Until the art exists Kickback Courier renders the tinted
`enemy-base` placeholder (no broken texture) and still animates all states via
tweens.

**To light up the real art, once you've generated the sheet:**
1. Drop `kickback_courier.png` + `kickback_courier.json` into
   `public/assets/enemies/`.
2. In `GameScene.preload()`, uncomment:
   `this.load.aseprite('kickback_courier', '/assets/enemies/kickback_courier.png', '/assets/enemies/kickback_courier.json');`
   (atlas key defaults to the enemy `id` = `kickback_courier`). That's it — the
   states play from real frames automatically.
