# Tender Rigger — Enemy Art Prompt Pack (minion template)

Ready-to-paste prompts for generating **Tender Rigger**, a rigged-bidding anomaly
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

## Tender Rigger Visual Bible (locked — keep identical across every phase)

No portrait exists — this bible is **synthesized** from its role (the rigged-
bidding anomaly sealed inside "won" contracts, immune to your first 5 hits) and
its `balance.ts` color anchor `#d946ef` (fuchsia) plus its `hitImmunityCount: 5`
behavior. Do not drift:

- **What:** Tender Rigger — a shifty **anomaly cocooned in sealed bid-envelopes**,
  the fixed public tender made flesh: a body wrapped in official-looking paper so
  the first strikes just bounce off the seals. Grotesque, exaggerated, slightly
  comedic — a concept-creature, not a human.
- **Body:** a lean, sneaky creature swaddled head-to-toe in **overlapping sealed
  manila bid-envelopes** like layered armor plates, each stamped with wax seals and
  "AWARDED / SEALED BID" marks. It clutches a fat rubber-stamped **winning tender
  scroll**; a couple of loose envelopes flap where hits have peeled them.
- **Signature read-at-a-glance cue:** the **overlapping wax-sealed envelope armor +
  clutched "AWARDED" tender scroll** — clearly the thing shrugging off your first
  hits. This is its #1 silhouette read and must survive every angle.
- **Face:** a sly, conspiratorial smirk peeking between envelope flaps — one raised
  brow, a finger to its lips, "the bid's already decided."
- **Style:** High-contrast cel-shaded vector art, flat colors, bold clean outer
  strokes, 2D mobile game asset (Persona 5 UI pop × Hades silhouette), plain
  solid/white background, isolated character. Reads clearly at small size.
- **Palette:** rigged-bid fuchsia (anchor `#d946ef`), manila-envelope tan, red wax-
  seal crimson, official-ink violet, cream paper. (Any engine tint is only a
  fallback for missing sprites — the real sheet uses its true colors, no flat
  wash.)

---

## Phase 1 — Base Concept + Camera Angles (do this first)

**Prompt:**
> Generate a comprehensive 2D character turnaround reference sheet for a mobile
> game enemy creature named Tender Rigger.
>
> **Creature:** A shifty anomaly cocooned in sealed bid-envelopes — a lean sneaky
> body swaddled head-to-toe in **overlapping sealed manila envelopes** like layered
> armor plates, each marked with **red wax seals and "AWARDED / SEALED BID"
> stamps**, clutching a fat rubber-stamped **winning tender scroll**, with a couple
> of loose envelopes flapping loose. A sly conspiratorial smirk with a finger to
> its lips. Grotesque and slightly comedic — a concept-creature, not a human, and
> not any real person.
>
> **Style:** High-contrast cel-shaded vector art, flat colors, bold clean outer
> strokes, 2D mobile game asset (Persona 5 UI pop crossed with Hades
> silhouettes). Plain solid background, isolated creature.
>
> **Required Layout:** Show the exact same creature in a row from these angles.
> Proportions, the sealed-envelope armor, and the clutched tender scroll must
> remain identical in every view:
> 1. **Front View:** looking directly at the camera.
> 2. **Side Profile:** 90-degree turn.
> 3. **Rear View (straight back):** facing away — we see the envelope plates layered
>    down its back and loose flaps trailing.
> 4. **TOP-FRONT (high-angle front 3/4) — THE GAMEPLAY VIEW:** camera high above
>    and in front, tilted (NOT flat zenith). We see the top of its head plus its
>    sly face, the sealed-envelope armored chest, and the clutched tender scroll as
>    it sidles toward the viewer. This is the angle its in-game sprites are drawn
>    from — make it clean and clear.
> 5. **TOP-BEHIND (high-angle rear 3/4):** camera high above and behind, tilted;
>    top of head, envelope-plated shoulders, and back.
>
> Ensure the overlapping wax-sealed envelope armor, the "AWARDED" stamps, and the
> clutched tender scroll are clearly readable in all five views.

*Save the result as `docs/references/tender_rigger_base_turnaround.png`. This is
the base reference for the next phase.*

---

## Phase 2 — Animated Enemy Sprite Sheet (TOP-FRONT)

**Attach `tender_rigger_base_turnaround.png` first**, then:

> Attached is the base turnaround sheet for the Tender Rigger anomaly. Generate a
> strictly formatted 2D sprite sheet for a top-down auto-battler.
>
> **Crucial Perspective:** Tender Rigger is an Enemy. The camera is a high
> top-down oblique above and behind the player's line, so it faces TOWARD the
> camera as it bears down on the barrier. **ALL frames must be drawn from a
> HIGH-ANGLE FRONT VIEW (top-front, front 3/4)** — top of head, plus sly face,
> envelope-armored chest, and the clutched tender scroll. Not a flat zenith, no
> side profiles, no low angles.
>
> **Style & Formatting:** Match the cel-shaded vector style of the reference
> exactly (sealed-envelope armor, wax seals, "AWARDED" tender scroll). Lay out as horizontal rows, one animation per row, each frame in its own evenly-spaced cell, non-overlapping, with consistent size and centering.
>
> **OUTPUT RULES (critical — the last generation drew these by mistake):** Fully **transparent** background — NO white fill. Do NOT draw any grid lines, cell borders, boxes, guide lines, or separators. Do NOT render any text, row names, labels, numbers, or captions anywhere in the image. Output ONLY the character art, arranged in evenly-spaced **invisible** cells.
>
> **MANDATORY LAYOUT — exactly 5 rows, in this exact top-to-bottom order:**
> 1. **`march`** — EXACTLY 4 frames: a sly, sidling creep toward the viewer,
>    envelope plates rustling, glancing side to side (front view).
> 2. **`attack`** — EXACTLY 3 frames: **whipping the rolled tender scroll across
>    the barrier like a baton**, wax seals cracking off. Frame 2 is the clear
>    impact frame, seal fragments and ink flying (front view).
> 3. **`stunned`** — EXACTLY 2 frames: dazed, envelope flaps peeling open,
>    **spinning stars** circling its head, scroll dangling (front view).
> 4. **`celebrate`** — EXACTLY 2 frames: it overran the line — brandishing the
>    tender scroll overhead and **cackling in triumph as fresh seals stamp
>    themselves on** (front view). Plays when the player loses.
> 5. **`death`** — EXACTLY 3 frames: **unravelling — the sealed envelope armor
>    tears open and it bursts into a flurry of shredded contracts, snapped wax
>    seals, and fluttering rejected bids** (front view).
>
> Verify every frame in every row is present in the final grid.

*Export from Aseprite as `tender_rigger.png` + `tender_rigger.json` (JSON Hash or
Array), with the tag names above spelled exactly:
`march attack stunned celebrate death`.*

---

## Export & QA reminders

- Transparent background, consistent frame size, no clipped limbs.
- Tag names MUST match the engine states 1:1 — see the checklist in
  `docs/CHARACTER_VISUAL_PROMPT_GUIDE.md` (Phase 4).
- Drop finished files in `public/assets/enemies/`: `tender_rigger.png`,
  `tender_rigger.json`.

## Integration status

**The engine side is already done** — `EnemyModel` is `Sprite`-based, every state
routes through the sprite-sheet path with a tween fallback, an enemy's atlas key
defaults to its `id`, and `GameScene.createEnemyAnimations()` auto-wires any enemy
atlas that loads. Until the art exists Tender Rigger renders the tinted
`enemy-base` placeholder (no broken texture) and still animates all states via
tweens.

**To light up the real art, once you've generated the sheet:**
1. Drop `tender_rigger.png` + `tender_rigger.json` into `public/assets/enemies/`.
2. In `GameScene.preload()`, uncomment:
   `this.load.aseprite('tender_rigger', '/assets/enemies/tender_rigger.png', '/assets/enemies/tender_rigger.json');`
   (atlas key defaults to the enemy `id` = `tender_rigger`). That's it — the states
   play from real frames automatically.
