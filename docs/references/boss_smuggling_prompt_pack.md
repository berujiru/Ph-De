# Smuggling — Boss Art Prompt Pack

Ready-to-paste prompts for generating **Smuggling**, an Act-flagship boss
anomaly. This pack mirrors the enemy template `grunt_prompt_pack.md`; the
**boss differences** apply (see the template's "Bosses only" note): draw it
**larger, more detailed and more grotesque** than a minion, and add a 6th
**`cast`** row (EXACTLY 3 frames) between `attack` and `stunned` showing the boss
channelling its signature `activeSkill`.

- **Perspective is TOP-FRONT** (high-angle front 3/4) — the anomaly faces the
  camera as it bears down on the barrier. Never a flat zenith, never a side
  profile (`docs/CHARACTER_VISUAL_PROMPT_GUIDE.md`).
- **State set is `march / attack / cast / stunned / celebrate / death`** (6 rows
  for this boss — it has an `activeSkill`). There is **no anime skill cut-in** for
  enemies; the `cast` row is the in-world channel pose, not a portrait.

> Run these in an image-capable Claude/Gemini (not the coding CLI). Always
> **attach the previous phase's output** as reference before generating the next.

**Binding rule:** bosses personify a *category of PH governance anomaly* (an
issue, never a real official, family, party, or contractor). Design a grotesque
concept-creature, not a person (`docs/WORLD_AND_HEROES.md`).

---

## Smuggling Visual Bible (locked — keep identical across every phase)

No portrait exists — this bible is **synthesized** from its role (the "customs
leakage" melee boss that drains the player's ongoing economy/Hope while alive)
and its `balance.ts` color anchor `#f59e0b` (amber). Do not drift:

- **What:** Smuggling — a hulking, greasy **contraband-hauler anomaly**: the
  anomaly of goods slipping untaxed through the ports. Grotesque, hoarding, and
  greedy — a concept-creature, not a human.
- **Body:** a broad, muscular smuggler-beast whose back is a **teetering stack of
  unmarked shipping crates and burst cargo containers** lashed on with cargo
  netting; contraband (amber liquor bottles, cigarette cartons, gold bricks)
  bulges out of torn crate seams. A heavy **rusted container-door slab** strapped
  to one forearm as a shield/bludgeon.
- **Signature read-at-a-glance cue:** the **container-stack "backpack" spilling
  contraband** plus the amber-glowing **"UNINSPECTED" customs seal** slapped
  across its chest (broken/peeled) — this is its #1 silhouette read and must
  survive every angle.
- **Face:** a greasy grin with a bribe-stuffed cheek, shifty darting eyes, a
  toothpick; a lowered ballcap-brim shadow. Sweaty, furtive.
- **Boss scale:** noticeably larger and heavier than a minion — reads as an
  Act boss at a glance. More rendered detail, more grotesque bulk.
- **Style:** High-contrast cel-shaded vector art, flat colors, bold clean outer
  strokes, 2D mobile game asset (Persona 5 UI pop × Hades silhouette), plain
  solid/white background, isolated character. Reads clearly at small size.
- **Palette:** contraband amber (anchor `#f59e0b`), rust-brown crates, oily
  dark grey skin, dull smuggled-gold glints, peeled red seal-tape. (Any engine
  tint is only a fallback for missing sprites — the real sheet uses its true
  colors, no flat wash.)
- **Soundscape (for reference, not drawn):** sluggish heavy footsteps, crates
  creaking and clattering, coins jangling, greedy snickering.

**Signature `activeSkill` — Economy Heist (`economyHeist`):** while alive it
siphons the player's ongoing economy/Hope generation. The `cast` row depicts this
channel: it cranks open a container and an amber suction vortex drags glowing
coin/Hope motes out of the air toward its cargo hoard.

---

## Phase 1 — Base Concept + Camera Angles (do this first)

**Prompt:**
> Generate a comprehensive 2D character turnaround reference sheet for a mobile
> game boss creature named Smuggling.
>
> **Creature:** A hulking, greasy **contraband-hauler anomaly** — a broad
> muscular smuggler-beast whose back is a teetering stack of unmarked shipping
> crates and burst cargo containers lashed on with cargo netting, contraband
> (amber bottles, cartons, gold bricks) bulging from torn seams. A rusted
> container-door slab strapped to one forearm as a shield-bludgeon, a
> peeled amber "UNINSPECTED" customs seal across its chest. A greasy furtive
> grin with a bribe-stuffed cheek. Grotesque, greedy, oversized — a
> concept-creature, not a human, and not any real person.
>
> **Style:** High-contrast cel-shaded vector art, flat colors, bold clean outer
> strokes, 2D mobile game asset (Persona 5 UI pop crossed with Hades
> silhouettes). Plain solid background, isolated creature. Boss-scale: larger and
> more detailed than a minion.
>
> **Required Layout:** Show the exact same creature in a row from these angles.
> Proportions, the container-stack backpack, the peeled chest seal, and the
> forearm container-door slab must remain identical in every view:
> 1. **Front View:** looking directly at the camera.
> 2. **Side Profile:** 90-degree turn — the container-stack backpack reads clearly.
> 3. **Rear View (straight back):** facing away — we see the full lashed-on
>    container stack and cargo netting.
> 4. **TOP-FRONT (high-angle front 3/4) — THE GAMEPLAY VIEW:** camera high above
>    and in front, tilted (NOT flat zenith). We see the top of its head plus its
>    face, chest seal, forearm slab, and the crates cresting over its shoulders as
>    it lurches toward the viewer. This is the angle its in-game sprites are drawn
>    from — make it clean and clear.
> 5. **TOP-BEHIND (high-angle rear 3/4):** camera high above and behind, tilted;
>    top of head, shoulders, and the towering container stack.
>
> Ensure the container-stack backpack, spilling contraband, peeled chest seal,
> and forearm container-door slab are clearly readable in all five views.

*Save the result as `docs/references/boss_smuggling_base_turnaround.png`. This is
the base reference for the next phase.*

---

## Phase 2 — Animated Boss Sprite Sheet (TOP-FRONT)

**Attach `boss_smuggling_base_turnaround.png` first**, then:

> Attached is the base turnaround sheet for the Smuggling boss anomaly. Generate a
> strictly formatted 2D sprite sheet for a top-down auto-battler.
>
> **Crucial Perspective:** Smuggling is an Enemy boss. The camera is a high
> top-down oblique above and behind the player's line, so it faces TOWARD the
> camera as it bears down on the barrier. **ALL frames must be drawn from a
> HIGH-ANGLE FRONT VIEW (top-front, front 3/4)** — top of head, plus face, chest
> seal, forearm slab, and cresting crates. Not a flat zenith, no side profiles, no
> low angles.
>
> **Style & Formatting:** Match the cel-shaded vector style of the reference
> exactly (container-stack backpack, spilling contraband, peeled amber chest seal,
> forearm container-door slab). Lay out as horizontal rows, one animation per row, each frame in its own evenly-spaced cell, non-overlapping, with consistent size and centering.
>
> **OUTPUT RULES (critical — the last generation drew these by mistake):** Fully **transparent** background — NO white fill. Do NOT draw any grid lines, cell borders, boxes, guide lines, or separators. Do NOT render any text, row names, labels, numbers, or captions anywhere in the image. Output ONLY the character art, arranged in evenly-spaced **invisible** cells.
>
> **MANDATORY LAYOUT — exactly 6 rows, in this exact top-to-bottom order:**
> 1. **`march`** — EXACTLY 4 frames: a heavy, lumbering advance toward the viewer,
>    the container-stack swaying, crates rattling (front view).
> 2. **`attack`** — EXACTLY 3 frames: **swinging the rusted container-door slab
>    down** onto the barrier. Frame 2 is the clear impact frame, splinters and a
>    dust burst (front view).
> 3. **`cast`** — EXACTLY 3 frames: channelling **Economy Heist** — it cranks open
>    a container and an amber suction vortex drags glowing coin/Hope motes out of
>    the air into its cargo hoard. Frame 2 is the peak channel, amber vortex at
>    full pull (front view, dramatic and menacing).
> 4. **`stunned`** — EXACTLY 2 frames: dazed, wobbling, **spinning stars / loose
>    crates** tumbling off its stack, mid-stumble (front view).
> 5. **`celebrate`** — EXACTLY 2 frames: it overran the line — laughing and
>    **hoisting a spilling crate overhead** in triumph, gold raining out (front
>    view). Plays when the player loses.
> 6. **`death`** — EXACTLY 3 frames: **its container-stack topples and bursts**,
>    scattering contraband and amber liquid as the smuggler collapses (front view).
>
> **SELF-CHECK — before returning the image, verify each item; if any FAILS, fix it and regenerate:**
> 1. **Consistent view** — every frame in every row uses the SAME camera angle stated above (heroes: rear / top-behind — we see the back; enemies: front / top-front — we see the face). No side profiles, no switching between front and back between frames.
> 2. **Frame counts** — each row has EXACTLY the number of frames listed for that row above.
> 3. **Clean output** — fully transparent background; NO grid lines, borders, boxes, text, labels, numbers, or captions anywhere.
> 4. **On-model & separated** — outfit / hair / props identical in every frame; poses do not touch or overlap.

*Export from Aseprite as `boss_smuggling.png` + `boss_smuggling.json` (JSON Hash
or Array), with the tag names above spelled exactly:
`march attack cast stunned celebrate death`.*

---

## Export & QA reminders

- Transparent background, consistent frame size, no clipped limbs.
- Tag names MUST match the engine states 1:1 — see the checklist in
  `docs/CHARACTER_VISUAL_PROMPT_GUIDE.md` (Phase 4). This boss uses 6 rows
  (`cast` included).
- Confirm boss scale: it should read as clearly larger/grander than a minion.
- Drop finished files in `public/assets/enemies/`: `boss_smuggling.png`,
  `boss_smuggling.json`.

## Integration status

**The engine side is already done** — `EnemyModel` is `Sprite`-based, every state
routes through the sprite-sheet path with a tween fallback, an enemy's atlas key
defaults to its `id`, and `GameScene.createEnemyAnimations()` auto-wires any enemy
atlas that loads. Until the art exists Smuggling renders the tinted `enemy-base`
placeholder (no broken texture) and still animates all states via tweens.

**To light up the real art, once you've generated the sheet:**
1. Drop `boss_smuggling.png` + `boss_smuggling.json` into `public/assets/enemies/`.
2. In `GameScene.preload()`, uncomment:
   `this.load.aseprite('boss_smuggling', '/assets/enemies/boss_smuggling.png', '/assets/enemies/boss_smuggling.json');`
   (atlas key defaults to the enemy `id` = `boss_smuggling`). That's it — the
   states play from real frames automatically.
