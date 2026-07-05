# Crony — Enemy Art Prompt Pack (minion template)

Ready-to-paste prompts for generating **Crony** (`crony_bodyguard`), a
bodyguard-anomaly minion. This pack mirrors the **enemy template** in
`docs/references/grunt_prompt_pack.md`. Enemies differ from heroes in two ways
(see `docs/CHARACTER_VISUAL_PROMPT_GUIDE.md`):

- **Perspective is TOP-FRONT** (high-angle front view) — anomalies face the camera
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

## Crony Visual Bible (locked — keep identical across every phase)

No portrait exists — this bible is **synthesized** from its role (the tanky
bodyguard anomaly whose Taunt Aura forces your fire onto itself) and its
`balance.ts` color anchor `#0f172a` (near-black navy) plus its `tauntAura`
behavior and huge HP. Do not drift:

- **What:** Crony — a hulking **inflated-suit bodyguard anomaly**, favoritism-made-
  muscle: a nobody puffed up into a wall of protection for the corrupt. Grotesque,
  exaggerated, slightly comedic — a concept-creature, not a human.
- **Body:** an over-inflated slab of a torso bursting out of a **too-small black
  bodyguard suit**, seams straining, tiny head sunk between mountainous shoulders.
  It hauls a battered **riot/bunker shield** in one fist and taps a coiled
  earpiece with the other.
- **Signature read-at-a-glance cue:** the **giant slab body behind a big body
  shield + coiled earpiece** — clearly the thing that soaks and redirects your
  hits. This is its #1 silhouette read and must survive every angle.
- **Face:** a stony, blank-eyed enforcer's stare behind dark shades — jaw set, no
  expression, pure "you're not getting past me."
- **Style:** High-contrast cel-shaded vector art, flat colors, bold clean outer
  strokes, 2D mobile game asset (Persona 5 UI pop × Hades silhouette), plain
  solid/white background, isolated character. Reads clearly at small size.
- **Palette:** crony deep-navy-black (anchor `#0f172a`), gunmetal shield grey,
  strained-suit charcoal, cold blue shade highlights, coiled-wire black. (Any
  engine tint is only a fallback for missing sprites — the real sheet uses its
  true colors, no flat wash.)

---

## Phase 1 — Base Concept + Camera Angles (do this first)

**Prompt:**
> Generate a comprehensive 2D character turnaround reference sheet for a mobile
> game enemy creature named Crony.
>
> **Creature:** A hulking inflated-suit bodyguard-anomaly — an over-inflated slab
> of a torso bursting out of a **too-small black bodyguard suit** with straining
> seams and a tiny head sunk between mountainous shoulders, hauling a battered
> **riot/bunker shield** in one fist and tapping a **coiled earpiece** with the
> other. Dark shades, a stony blank enforcer stare. Grotesque and slightly
> comedic — a concept-creature, not a human, and not any real person.
>
> **Style:** High-contrast cel-shaded vector art, flat colors, bold clean outer
> strokes, 2D mobile game asset (Persona 5 UI pop crossed with Hades
> silhouettes). Plain solid background, isolated creature.
>
> **Required Layout:** Show the exact same creature in a row from these angles.
> Proportions, the straining black suit, and the big shield must remain identical
> in every view:
> 1. **Front View:** looking directly at the camera.
> 2. **Side Profile:** 90-degree turn.
> 3. **Rear View (straight back):** facing away — we see the broad suited back and
>    the shield edge behind its shoulder.
> 4. **TOP-FRONT (high-angle front view) — THE GAMEPLAY VIEW:** camera high above
>    and in front, tilted (NOT flat zenith). We see the top of its tiny head plus
>    its face, massive suited chest, and the raised shield as it lumbers toward the
>    viewer. This is the angle its in-game sprites are drawn from — make it clean
>    and clear.
> 5. **TOP-BEHIND (high-angle back view):** camera high above and behind, tilted;
>    top of head, mountainous shoulders, and back.
>
> Ensure the straining black bodyguard suit, the riot shield, and the coiled
> earpiece are clearly readable in all five views.

*Save the result as `docs/references/crony_bodyguard_base_turnaround.png`. This is
the base reference for the next phase.*

---

## Phase 2 — Animated Enemy Sprite Sheet (TOP-FRONT)

**Attach `crony_bodyguard_base_turnaround.png` first**, then:

> Attached is the base turnaround sheet for the Crony anomaly. Generate a strictly
> formatted 2D sprite sheet for a top-down auto-battler.
>
> **Crucial Perspective:** Crony is an Enemy. The camera is a high top-down
> oblique above and behind the player's line, so it faces TOWARD the camera as it
> bears down on the barrier. **ALL frames must be drawn from a HIGH-ANGLE FRONT
> VIEW (top-front, front view)** — top of head, plus face, massive suited chest,
> and the raised shield. Not a flat zenith, no side profiles, no low angles.
>
> **Style & Formatting:** Match the cel-shaded vector style of the reference
> exactly (straining black suit, riot shield, coiled earpiece). Lay out as horizontal rows, one animation per row, each frame in its own evenly-spaced cell, non-overlapping, with consistent size and centering.
>
> **OUTPUT RULES (critical — the last generation drew these by mistake):** Fully **transparent** background — NO white fill. Do NOT draw any grid lines, cell borders, boxes, guide lines, or separators. Do NOT render any text, row names, labels, numbers, or captions anywhere in the image. Output ONLY the character art, arranged in evenly-spaced **invisible** cells.
>
> **MANDATORY LAYOUT — exactly 5 rows, in this exact top-to-bottom order:**
> 1. **`march`** — EXACTLY 4 frames: a heavy, deliberate lumber toward the viewer,
>    shield held up, shoulders rolling (front view).
> 2. **`attack`** — EXACTLY 3 frames: **bashing the barrier with the shield edge**,
>    whole body behind it. Frame 2 is the clear impact frame, shockwave off the
>    shield (front view).
> 3. **`stunned`** — EXACTLY 2 frames: dazed, shield drooping, **spinning stars**
>    circling its tiny head, shades knocked crooked (front view).
> 4. **`celebrate`** — EXACTLY 2 frames: it overran the line — flexing its slab
>    torso and **pounding the shield against its chest in triumph** (front view).
>    Plays when the player loses.
> 5. **`death`** — EXACTLY 3 frames: **deflating like a punctured balloon — the
>    inflated suit hisses flat, the shield clatters down** and it crumples (front
>    view).
>
> **SELF-CHECK — before returning the image, verify each item; if any FAILS, fix it and regenerate:**
> 1. **Consistent view** — every frame in every row uses the SAME camera angle stated above (heroes: rear / top-behind — we see the back; enemies: front / top-front — we see the face). No side profiles, no switching between front and back between frames.
> 2. **Frame counts** — each row has EXACTLY the number of frames listed for that row above.
> 3. **Clean output** — fully transparent background; NO grid lines, borders, boxes, text, labels, numbers, or captions anywhere.
> 4. **On-model & separated** — outfit / hair / props identical in every frame; poses do not touch or overlap.

*Export from Aseprite as `crony_bodyguard.png` + `crony_bodyguard.json` (JSON Hash
or Array), with the tag names above spelled exactly:
`march attack stunned celebrate death`.*

---

## Export & QA reminders

- Transparent background, consistent frame size, no clipped limbs.
- Tag names MUST match the engine states 1:1 — see the checklist in
  `docs/CHARACTER_VISUAL_PROMPT_GUIDE.md` (Phase 4).
- Drop finished files in `public/assets/enemies/`: `crony_bodyguard.png`,
  `crony_bodyguard.json`.

## Integration status

**The engine side is already done** — `EnemyModel` is `Sprite`-based, every state
routes through the sprite-sheet path with a tween fallback, an enemy's atlas key
defaults to its `id`, and `GameScene.createEnemyAnimations()` auto-wires any enemy
atlas that loads. Until the art exists Crony renders the tinted `enemy-base`
placeholder (no broken texture) and still animates all states via tweens.

**To light up the real art, once you've generated the sheet:**
1. Drop `crony_bodyguard.png` + `crony_bodyguard.json` into
   `public/assets/enemies/`.
2. In `GameScene.preload()`, uncomment:
   `this.load.aseprite('crony_bodyguard', '/assets/enemies/crony_bodyguard.png', '/assets/enemies/crony_bodyguard.json');`
   (atlas key defaults to the enemy `id` = `crony_bodyguard`). That's it — the
   states play from real frames automatically.
