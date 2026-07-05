# Budget Insertion — Boss Art Prompt Pack

Ready-to-paste prompts for generating **Budget Insertion**, an Act-flagship boss
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

## Budget Insertion Visual Bible (locked — keep identical across every phase)

No portrait exists — this bible is **synthesized** from its role (the "midnight
insertion" stealth-elite boss that smuggles bloated funds down a side lane) and
its `balance.ts` color anchor `#14b8a6` (teal). Do not drift:

- **What:** Budget Insertion — a bloated, hunched **ledger-parasite anomaly**:
  the anomaly of secret line-items slipped into a national budget at midnight.
  Grotesque, oversized, and predatory — a concept-creature, not a human.
- **Body:** a swollen, pale torso that looks like a **split-open appropriations
  ledger**, its "belly" a stuffed budget document bursting with extra pages
  jammed in edgewise (the illicit insertions). Long spidery arms end in
  **fountain-pen fingers** dripping teal ink. It moves half-crouched, sneaking.
- **Signature read-at-a-glance cue:** the **ledger-belly crammed with extra
  wedged-in pages** plus a single **glowing teal "midnight" line-item** slotted
  into its chest — this is its #1 silhouette read and must survive every angle.
- **Face:** a sly, sidelong smirk half-hidden behind a raised finger (a "shh"
  gesture); heavy-lidded conspiratorial eyes, teal ink stains at the mouth.
- **Boss scale:** noticeably larger and heavier than a minion — reads as an
  Act boss at a glance. More rendered detail, more grotesque bulk.
- **Style:** High-contrast cel-shaded vector art, flat colors, bold clean outer
  strokes, 2D mobile game asset (Persona 5 UI pop × Hades silhouette), plain
  solid/white background, isolated character. Reads clearly at small size.
- **Palette:** midnight-insertion teal (anchor `#14b8a6`), pale ledger-paper
  cream, ink-stain dark teal, dull gold coin-glints in the wedged pages. (Any
  engine tint is only a fallback for missing sprites — the real sheet uses its
  true colors, no flat wash.)
- **Soundscape (for reference, not drawn):** sluggish heavy footsteps, hushed
  conspiratorial whispering, riffling paper, a low arrogant chuckle.

**Signature `activeSkill` — Smuggle Funds (`smuggleHp`):** it splits off a
bloated packet of HP down a side lane to divide the player's focus. The `cast`
row depicts this channel: it tears a stuffed budget-packet out of its own belly
and shoves it sideways/off-lane.

---

## Phase 1 — Base Concept + Camera Angles (do this first)

**Prompt:**
> Generate a comprehensive 2D character turnaround reference sheet for a mobile
> game boss creature named Budget Insertion.
>
> **Creature:** A large, bloated, hunched **ledger-parasite anomaly** — a swollen
> pale torso shaped like a split-open appropriations ledger, its belly a stuffed
> budget document bursting with extra pages jammed in edgewise, a single glowing
> teal "midnight" line-item slotted into its chest. Long spidery arms end in
> **fountain-pen fingers** dripping teal ink. A sly sidelong smirk, one finger
> raised in a "shh" gesture. Grotesque, oversized, predatory — a
> concept-creature, not a human, and not any real person.
>
> **Style:** High-contrast cel-shaded vector art, flat colors, bold clean outer
> strokes, 2D mobile game asset (Persona 5 UI pop crossed with Hades
> silhouettes). Plain solid background, isolated creature. Boss-scale: larger and
> more detailed than a minion.
>
> **Required Layout:** Show the exact same creature in a row from these angles.
> Proportions, the ledger-belly with wedged-in pages, the teal chest line-item,
> and the pen-fingers must remain identical in every view:
> 1. **Front View:** looking directly at the camera.
> 2. **Side Profile:** 90-degree turn.
> 3. **Rear View (straight back):** facing away — we see its back and the loose
>    pages spilling out of the ledger-belly behind it.
> 4. **TOP-FRONT (high-angle front 3/4) — THE GAMEPLAY VIEW:** camera high above
>    and in front, tilted (NOT flat zenith). We see the top of its head plus its
>    face, the ledger-belly, the glowing teal chest line-item, and the pen-fingers
>    as it sneaks toward the viewer. This is the angle its in-game sprites are
>    drawn from — make it clean and clear.
> 5. **TOP-BEHIND (high-angle rear 3/4):** camera high above and behind, tilted;
>    top of head, hunched shoulders, and the spilling back pages.
>
> Ensure the ledger-belly, wedged-in insertion pages, teal chest line-item, and
> pen-fingers are clearly readable in all five views.

*Save the result as `docs/references/boss_budget_insertion_base_turnaround.png`.
This is the base reference for the next phase.*

---

## Phase 2 — Animated Boss Sprite Sheet (TOP-FRONT)

**Attach `boss_budget_insertion_base_turnaround.png` first**, then:

> Attached is the base turnaround sheet for the Budget Insertion boss anomaly.
> Generate a strictly formatted 2D sprite sheet for a top-down auto-battler.
>
> **Crucial Perspective:** Budget Insertion is an Enemy boss. The camera is a
> high top-down oblique above and behind the player's line, so it faces TOWARD
> the camera as it bears down on the barrier. **ALL frames must be drawn from a
> HIGH-ANGLE FRONT VIEW (top-front, front 3/4)** — top of head, plus face, the
> ledger-belly, and the pen-fingers. Not a flat zenith, no side profiles, no low
> angles.
>
> **Style & Formatting:** Match the cel-shaded vector style of the reference
> exactly (ledger-belly with wedged-in pages, glowing teal chest line-item,
> ink-dripping pen-fingers). Lay out as horizontal rows, one animation per row, each frame in its own evenly-spaced cell, non-overlapping, with consistent size and centering.
>
> **OUTPUT RULES (critical — the last generation drew these by mistake):** Fully **transparent** background — NO white fill. Do NOT draw any grid lines, cell borders, boxes, guide lines, or separators. Do NOT render any text, row names, labels, numbers, or captions anywhere in the image. Output ONLY the character art, arranged in evenly-spaced **invisible** cells.
>
> **MANDATORY LAYOUT — exactly 6 rows, in this exact top-to-bottom order:**
> 1. **`march`** — EXACTLY 4 frames: a slow, heavy, sneaking advance toward the
>    viewer, hunched low, pages riffling (front view).
> 2. **`attack`** — EXACTLY 3 frames: **stabbing its ink-dripping pen-fingers
>    down** onto the barrier like signing off a fraudulent line. Frame 2 is the
>    clear impact frame, teal ink splattering (front view).
> 3. **`cast`** — EXACTLY 3 frames: channelling **Smuggle Funds** — it tears a
>    bloated, glowing-teal budget packet out of its own ledger-belly and shoves it
>    off to the side lane. Frame 2 is the peak channel, teal energy bleeding off
>    the packet (front view, dramatic and menacing).
> 4. **`stunned`** — EXACTLY 2 frames: dazed, wobbling, **spinning stars / loose
>    pages** whirling around its head, mid-stumble (front view).
> 5. **`celebrate`** — EXACTLY 2 frames: it overran the line — cackling and
>    **stuffing fistfuls of pages into its belly** in triumph (front view). Plays
>    when the player loses.
> 6. **`death`** — EXACTLY 3 frames: **bursting apart into a blizzard of shredded
>    budget pages and spraying teal ink**, the ledger-belly collapsing empty
>    (front view).
>
> **SELF-CHECK — before returning the image, verify each item; if any FAILS, fix it and regenerate:**
> 1. **Consistent view** — every frame in every row uses the SAME camera angle stated above (heroes: rear / top-behind — we see the back; enemies: front / top-front — we see the face). No side profiles, no switching between front and back between frames.
> 2. **Frame counts** — each row has EXACTLY the number of frames listed for that row above.
> 3. **Clean output** — fully transparent background; NO grid lines, borders, boxes, text, labels, numbers, or captions anywhere.
> 4. **On-model & separated** — outfit / hair / props identical in every frame; poses do not touch or overlap.

*Export from Aseprite as `boss_budget_insertion.png` + `boss_budget_insertion.json`
(JSON Hash or Array), with the tag names above spelled exactly:
`march attack cast stunned celebrate death`.*

---

## Export & QA reminders

- Transparent background, consistent frame size, no clipped limbs.
- Tag names MUST match the engine states 1:1 — see the checklist in
  `docs/CHARACTER_VISUAL_PROMPT_GUIDE.md` (Phase 4). This boss uses 6 rows
  (`cast` included).
- Confirm boss scale: it should read as clearly larger/grander than a minion.
- Drop finished files in `public/assets/enemies/`: `boss_budget_insertion.png`,
  `boss_budget_insertion.json`.

## Integration status

**The engine side is already done** — `EnemyModel` is `Sprite`-based, every state
routes through the sprite-sheet path with a tween fallback, an enemy's atlas key
defaults to its `id`, and `GameScene.createEnemyAnimations()` auto-wires any enemy
atlas that loads. Until the art exists Budget Insertion renders the tinted
`enemy-base` placeholder (no broken texture) and still animates all states via
tweens.

**To light up the real art, once you've generated the sheet:**
1. Drop `boss_budget_insertion.png` + `boss_budget_insertion.json` into
   `public/assets/enemies/`.
2. In `GameScene.preload()`, uncomment:
   `this.load.aseprite('boss_budget_insertion', '/assets/enemies/boss_budget_insertion.png', '/assets/enemies/boss_budget_insertion.json');`
   (atlas key defaults to the enemy `id` = `boss_budget_insertion`). That's it —
   the states play from real frames automatically.
