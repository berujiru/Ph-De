# Brute — Enemy Art Prompt Pack (minion template)

Ready-to-paste prompts for generating **Brute**, a slow-and-heavy anomaly minion.
This pack mirrors the **enemy template** (`docs/references/grunt_prompt_pack.md`).
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

## Brute Visual Bible (locked — keep identical across every phase)

No portrait exists — this bible is **synthesized** from its role (the slow, hugely
tanky wall of muscle that soaks hits and hammers the barrier — `balance.ts` speed
`40` (slow), the biggest minion `maxHp` of `150`, and heavy `damage` `15`) and its
`balance.ts` color anchor `#7c3aed` (violet). Do not drift:

- **What:** Brute — a massive, lumbering **enforcer anomaly**: raw
  strong-arm intimidation made flesh, the goon that muscles obstacles out of the
  way. Grotesque, exaggerated, slightly comedic — a concept-creature, not a human.
- **Body:** an enormous top-heavy slab of muscle, tiny head sunk between colossal
  hunched shoulders, gigantic **knuckle-dragging fists**. Bulky, armored with
  scraps of **riot padding and duct-taped plating**. Reads *huge and slow*, never
  nimble.
- **Signature read-at-a-glance cue:** the **grotesquely oversized fists and
  mountainous hunched shoulders dwarfing a tiny head** — this is its #1 silhouette
  read and must survive every angle. It is unmistakably the biggest body on the
  field.
- **Face:** a dim, snarling under-bite, heavy brow, small mean eyes — brainless
  menace.
- **Style:** High-contrast cel-shaded vector art, flat colors, bold clean outer
  strokes, 2D mobile game asset (Persona 5 UI pop × Hades silhouette), plain
  solid/white background, isolated character. Reads clearly at small size.
- **Palette:** bruise-violet hide (anchor `#7c3aed`), dark grey padding, dull
  metal plating, black straps. (Any engine tint is only a fallback for missing
  sprites — the real sheet uses its true colors, no flat wash.)

---

## Phase 1 — Base Concept + Camera Angles (do this first)

**Prompt:**
> Generate a comprehensive 2D character turnaround reference sheet for a mobile
> game enemy creature named Brute.
>
> **Creature:** A massive, lumbering enforcer-anomaly minion — an enormous
> top-heavy slab of violet muscle with a tiny head sunk between colossal hunched
> shoulders and grotesquely oversized **knuckle-dragging fists**. Strapped with
> scraps of **riot padding and duct-taped metal plating**. A dim snarling
> under-bite and small mean eyes. It reads as huge and slow, never nimble.
> Grotesque and slightly comedic — a concept-creature, not a human, and not any
> real person.
>
> **Style:** High-contrast cel-shaded vector art, flat colors, bold clean outer
> strokes, 2D mobile game asset (Persona 5 UI pop crossed with Hades
> silhouettes). Plain solid background, isolated creature.
>
> **Required Layout:** Show the exact same creature in a row from these angles.
> Proportions, the oversized fists, and the mountainous hunched build must remain
> identical in every view:
> 1. **Front View:** looking directly at the camera.
> 2. **Side Profile:** 90-degree turn.
> 3. **Rear View (straight back):** facing away — we see its massive back and the
>    duct-taped plating across its shoulders.
> 4. **TOP-FRONT (high-angle front 3/4) — THE GAMEPLAY VIEW:** camera high above
>    and in front, tilted (NOT flat zenith). We see the top of its tiny head plus
>    its face, the mountainous shoulders, and the huge fists as it lumbers toward
>    the viewer. This is the angle its in-game sprites are drawn from — make it
>    clean and clear.
> 5. **TOP-BEHIND (high-angle rear 3/4):** camera high above and behind, tilted;
>    top of head, the enormous shoulders, and back.
>
> Ensure the oversized fists, the hunched mountainous shoulders, and the strapped
> padding/plating are clearly readable in all five views.

*Save the result as `docs/references/brute_base_turnaround.png`. This is the base
reference for the next phase.*

---

## Phase 2 — Animated Enemy Sprite Sheet (TOP-FRONT)

**Attach `brute_base_turnaround.png` first**, then:

> Attached is the base turnaround sheet for the Brute anomaly. Generate a strictly
> formatted 2D sprite sheet for a top-down auto-battler.
>
> **Crucial Perspective:** Brute is an Enemy. The camera is a high top-down
> oblique above and behind the player's line, so Brute faces TOWARD the camera as
> it bears down on the barrier. **ALL frames must be drawn from a HIGH-ANGLE FRONT
> VIEW (top-front, front 3/4)** — top of head, plus face, mountainous shoulders,
> and the oversized fists. Not a flat zenith, no side profiles, no low angles.
>
> **Style & Formatting:** Match the cel-shaded vector style of the reference
> exactly (oversized fists, hunched shoulders, duct-taped padding). Clean grid,
> one animation per row, evenly spaced, non-overlapping poses, on a transparent or
> solid white background. Consistent frame size and centering.
>
> **MANDATORY LAYOUT — exactly 5 labelled rows:**
> 1. **`march`** — EXACTLY 4 frames: a slow, heavy, ground-shaking lumber toward
>    the viewer, shoulders rolling and fists swinging low (front view).
> 2. **`attack`** — EXACTLY 3 frames: **winding back and hammering both huge fists
>    down** onto the barrier. Frame 2 is the clear impact frame, shockwave and
>    debris bursting on contact (front view).
> 3. **`stunned`** — EXACTLY 2 frames: rocked back and dazed, wobbling on its
>    heels, **spinning stars** circling its tiny head, mid-stumble (front view).
> 4. **`celebrate`** — EXACTLY 2 frames: it overran the line — roaring and
>    **pounding its chest / smashing forward in triumph** (front view). Plays when
>    the player loses.
> 5. **`death`** — EXACTLY 3 frames: **toppling like a felled wall, plating
>    snapping off and crashing to the ground** in a heap of dust (front view).
>
> Verify every frame in every row is present in the final grid.

*Export from Aseprite as `brute.png` + `brute.json` (JSON Hash or Array), with
the tag names above spelled exactly: `march attack stunned celebrate death`.*

> **Bosses only:** insert a **`cast`** row (EXACTLY 3 frames) between `attack` and
> `stunned` showing the boss channelling its signature `activeSkill`, and draw the
> boss larger, more detailed, and more menacing than a minion. Brute is a minion —
> it does **not** get this row.

---

## Export & QA reminders

- Transparent background, consistent frame size, no clipped limbs.
- Tag names MUST match the engine states 1:1 — see the checklist in
  `docs/CHARACTER_VISUAL_PROMPT_GUIDE.md` (Phase 4).
- Drop finished files in `public/assets/enemies/`: `brute.png`, `brute.json`.

## Integration status

**The engine side is already done** — `EnemyModel` is `Sprite`-based, every state
routes through the sprite-sheet path with a tween fallback, an enemy's atlas key
defaults to its `id`, and `GameScene.createEnemyAnimations()` auto-wires any enemy
atlas that loads. Until the art exists Brute renders the tinted `enemy-base`
placeholder (no broken texture) and still animates all states via tweens.

**To light up the real art, once you've generated the sheet:**
1. Drop `brute.png` + `brute.json` into `public/assets/enemies/`.
2. In `GameScene.preload()`, uncomment:
   `this.load.aseprite('brute', '/assets/enemies/brute.png', '/assets/enemies/brute.json');`
   (atlas key defaults to the enemy `id` = `brute`). That's it — the states play
   from real frames automatically.
