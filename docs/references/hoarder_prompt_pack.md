# Hoarder — Enemy Art Prompt Pack (minion template)

Ready-to-paste prompts for generating **Hoarder**, a cartel-anomaly minion. This
pack mirrors the **enemy template** in `docs/references/grunt_prompt_pack.md`.
Enemies differ from heroes in two ways (see
`docs/CHARACTER_VISUAL_PROMPT_GUIDE.md`):

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

## Hoarder Visual Bible (locked — keep identical across every phase)

No portrait exists — this bible is **synthesized** from its role (the slow, tanky
cartel anomaly that sits on hoarded supply and drops a massive barricade of it
when killed) and its `balance.ts` color anchor `#ca8a04` (mustard-gold) plus its
`dropObstacleOnDeath` behavior and huge HP. Do not drift:

- **What:** Hoarder — a bloated **merchant-cartel anomaly**, artificial scarcity
  made flesh: a glutton sitting on a mountain of supply it refuses to release.
  Grotesque, exaggerated, slightly comedic — a concept-creature, not a human.
- **Body:** an enormous sagging belly of a creature perched atop a **heaped mound
  of bulging sacks and stacked crates** roped shut; short greedy arms hug the pile,
  padlocks and hoard-tags dangle everywhere. It shoves the whole mound forward as
  it advances.
- **Signature read-at-a-glance cue:** the **mountain of roped sacks and padlocked
  crates it rides/hugs** — clearly the barricade it will dump on death. This is its
  #1 silhouette read and must survive every angle.
- **Face:** a jowly, gluttonous scowl — puffed cheeks, tiny suspicious eyes, a
  possessive "mine, all mine" sneer clutching a sack to its chin.
- **Style:** High-contrast cel-shaded vector art, flat colors, bold clean outer
  strokes, 2D mobile game asset (Persona 5 UI pop × Hades silhouette), plain
  solid/white background, isolated character. Reads clearly at small size.
- **Palette:** hoarder mustard-gold (anchor `#ca8a04`), burlap-sack tan, crate-wood
  brown, rusty padlock iron, greasy warm skin. (Any engine tint is only a fallback
  for missing sprites — the real sheet uses its true colors, no flat wash.)

---

## Phase 1 — Base Concept + Camera Angles (do this first)

**Prompt:**
> Generate a comprehensive 2D character turnaround reference sheet for a mobile
> game enemy creature named Hoarder.
>
> **Creature:** A bloated merchant-cartel anomaly — an enormous sagging belly of a
> creature perched atop a **heaped mound of bulging burlap sacks and roped-shut
> crates**, short greedy arms hugging the pile, **padlocks and hoard-tags dangling
> everywhere**. A jowly gluttonous scowl with tiny suspicious eyes, clutching a
> sack to its chin. Grotesque and slightly comedic — a concept-creature, not a
> human, and not any real person.
>
> **Style:** High-contrast cel-shaded vector art, flat colors, bold clean outer
> strokes, 2D mobile game asset (Persona 5 UI pop crossed with Hades
> silhouettes). Plain solid background, isolated creature.
>
> **Required Layout:** Show the exact same creature in a row from these angles.
> Proportions, the mound of sacks and crates, and the padlocks must remain
> identical in every view:
> 1. **Front View:** looking directly at the camera.
> 2. **Side Profile:** 90-degree turn.
> 3. **Rear View (straight back):** facing away — we see its broad back and the
>    heaped mound of sacks piled behind it.
> 4. **TOP-FRONT (high-angle front 3/4) — THE GAMEPLAY VIEW:** camera high above
>    and in front, tilted (NOT flat zenith). We see the top of its head plus its
>    jowly face, huge belly, and the mound of sacks it shoves forward toward the
>    viewer. This is the angle its in-game sprites are drawn from — make it clean
>    and clear.
> 5. **TOP-BEHIND (high-angle rear 3/4):** camera high above and behind, tilted;
>    top of head, hunched shoulders, and the piled hoard from behind.
>
> Ensure the mound of roped sacks and crates, the dangling padlocks, and the
> gluttonous grip are clearly readable in all five views.

*Save the result as `docs/references/hoarder_base_turnaround.png`. This is the
base reference for the next phase.*

---

## Phase 2 — Animated Enemy Sprite Sheet (TOP-FRONT)

**Attach `hoarder_base_turnaround.png` first**, then:

> Attached is the base turnaround sheet for the Hoarder anomaly. Generate a
> strictly formatted 2D sprite sheet for a top-down auto-battler.
>
> **Crucial Perspective:** Hoarder is an Enemy. The camera is a high top-down
> oblique above and behind the player's line, so it faces TOWARD the camera as it
> bears down on the barrier. **ALL frames must be drawn from a HIGH-ANGLE FRONT
> VIEW (top-front, front 3/4)** — top of head, plus jowly face, huge belly, and the
> mound of sacks. Not a flat zenith, no side profiles, no low angles.
>
> **Style & Formatting:** Match the cel-shaded vector style of the reference
> exactly (roped sacks, padlocked crates, dangling hoard-tags). Lay out as horizontal rows, one animation per row, each frame in its own evenly-spaced cell, non-overlapping, with consistent size and centering.
>
> **OUTPUT RULES (critical — the last generation drew these by mistake):** Fully **transparent** background — NO white fill. Do NOT draw any grid lines, cell borders, boxes, guide lines, or separators. Do NOT render any text, row names, labels, numbers, or captions anywhere in the image. Output ONLY the character art, arranged in evenly-spaced **invisible** cells.
>
> **MANDATORY LAYOUT — exactly 5 rows, in this exact top-to-bottom order:**
> 1. **`march`** — EXACTLY 4 frames: a very slow, ponderous waddle toward the
>    viewer, shoving its heaped mound of sacks ahead of it (front view).
> 2. **`attack`** — EXACTLY 3 frames: **heaving a giant sack up and slamming it
>    down** on the barrier. Frame 2 is the clear impact frame, dust and spilled
>    goods bursting out (front view).
> 3. **`stunned`** — EXACTLY 2 frames: dazed, teetering on its mound, **spinning
>    stars** circling its head, a sack toppling off (front view).
> 4. **`celebrate`** — EXACTLY 2 frames: it overran the line — hugging its whole
>    hoard and **cackling greedily in triumph**, sacks bulging (front view). Plays
>    when the player loses.
> 5. **`death`** — EXACTLY 3 frames: **collapsing as its hoard bursts — sacks
>    split and the mound avalanches down into a heap of scattered goods and
>    padlocks** (leaving the barricade), slumping (front view).
>
> Verify every frame in every row is present in the final grid.

*Export from Aseprite as `hoarder.png` + `hoarder.json` (JSON Hash or Array), with
the tag names above spelled exactly: `march attack stunned celebrate death`.*

---

## Export & QA reminders

- Transparent background, consistent frame size, no clipped limbs.
- Tag names MUST match the engine states 1:1 — see the checklist in
  `docs/CHARACTER_VISUAL_PROMPT_GUIDE.md` (Phase 4).
- Drop finished files in `public/assets/enemies/`: `hoarder.png`, `hoarder.json`.

## Integration status

**The engine side is already done** — `EnemyModel` is `Sprite`-based, every state
routes through the sprite-sheet path with a tween fallback, an enemy's atlas key
defaults to its `id`, and `GameScene.createEnemyAnimations()` auto-wires any enemy
atlas that loads. Until the art exists Hoarder renders the tinted `enemy-base`
placeholder (no broken texture) and still animates all states via tweens.

**To light up the real art, once you've generated the sheet:**
1. Drop `hoarder.png` + `hoarder.json` into `public/assets/enemies/`.
2. In `GameScene.preload()`, uncomment:
   `this.load.aseprite('hoarder', '/assets/enemies/hoarder.png', '/assets/enemies/hoarder.json');`
   (atlas key defaults to the enemy `id` = `hoarder`). That's it — the states play
   from real frames automatically.
