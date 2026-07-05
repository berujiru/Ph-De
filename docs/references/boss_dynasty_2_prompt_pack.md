# The Dynasty (Schemer) — Boss Art Prompt Pack — Phase 2 of 3

Ready-to-paste prompts for generating **The Dynasty (Schemer)** — the **second of
three phases** of the Dynasty apex boss (it takes over when the Bruiser falls).
This pack mirrors the enemy template `grunt_prompt_pack.md`; the **boss
differences** apply: draw it **larger, more detailed and more grotesque** than a
minion.

- **Perspective is TOP-FRONT** (high-angle front 3/4) — the anomaly faces the
  camera as it bears down on the barrier. Never a flat zenith, never a side
  profile (`docs/CHARACTER_VISUAL_PROMPT_GUIDE.md`).
- **State set is `march / attack / stunned / celebrate / death`** (5 rows — **NO
  `cast` row**). This phase has **no `activeSkill`**; killing it triggers a
  **phase transition** (`nextPhaseEnemyId: boss_dynasty_3`) handled by the engine
  — so there is nothing to channel and no `cast` state. There is **no anime skill
  cut-in** for enemies.

> Run these in an image-capable Claude/Gemini (not the coding CLI). Always
> **attach the previous phase's output** as reference before generating the next.
> **Also attach `boss_dynasty_1_base_turnaround.png`** so the family resemblance
> and crest carry over.

**Binding rule:** bosses personify a *category of PH governance anomaly* (an
issue — **political dynasties as a phenomenon**, never a real family, name,
party, or person). Design a grotesque concept-creature, not a likeness
(`docs/WORLD_AND_HEROES.md`).

---

## Dynasty lineage — shared bible (spans all 3 phases)

The Dynasty is a **3-phase boss**: **Bruiser (`boss_dynasty_1`) → Schemer
(`boss_dynasty_2`) → Heir (`boss_dynasty_3`)**. Kill one phase and a relative
takes over. All three must share an unmistakable **family resemblance** and a
**common regalia set**, while **escalating in menace**. Keep these dynastic
constants identical across every phase (see `boss_dynasty_1_prompt_pack.md` for
the full shared bible):

- **The Family Crest:** the same gaudy gilded **coat-of-arms medallion**
  (intertwined initials over crossed ceremonial batons, ringed by laurel) worn on
  the chest — identical to the Bruiser's, so players read "same dynasty."
- **Regalia:** oversized gold **signet rings**, a house-purple **ceremonial
  sash**, a corrupted barong/formal-suit silhouette.
- **Shared features:** heavy entitled brow, hooked patrician nose, born-to-rule
  sneer — the same face lineage, sculpted leaner and slyer here.
- **Palette escalation:** the Schemer glows a **hotter magenta-purple** than the
  Bruiser (see color anchor below).

---

## The Dynasty (Schemer) Visual Bible (locked — keep identical across this phase)

This bible is **synthesized** from its role (the **cunning mid-phase
manipulator** — faster than the Bruiser, a schemer who pulls strings) and its
`balance.ts` color anchor `#a21caf` (magenta-purple). Do not drift:

- **What:** The Dynasty (Schemer) — a lean, tall, silver-tongued **manipulator
  anomaly**: the dynasty's operator who wins by pulling strings and cutting deals.
  Grotesque, oily, sinister — a concept-creature, not a human likeness.
- **Body:** a slim, elongated figure in a sharp corrupt **magenta-purple suit**,
  unnaturally long fingers trailing **puppeteer's strings** that dangle rolled
  contracts, ballots, and gold envelopes. A high collar frames the family face.
  The crest medallion glints on the lapel.
- **Signature read-at-a-glance cue:** the **puppet-strings of contracts and
  envelopes fanning from its long fingers** + the crest medallion — its #1
  silhouette read; must survive every angle and clearly match the other phases.
- **Face:** the shared dynasty face gone sly — a thin knowing smirk, half-lidded
  scheming eyes, slicked hair, hooked nose. Colder and smarter than the Bruiser.
- **Boss scale:** taller but leaner than the Bruiser — reads as the same family,
  a phase more agile and menacing than a minion.
- **Style:** High-contrast cel-shaded vector art, flat colors, bold clean outer
  strokes, 2D mobile game asset (Persona 5 UI pop × Hades silhouette), plain
  solid/white background, isolated character. Reads clearly at small size.
- **Palette:** scheming magenta-purple (anchor `#a21caf`), tarnished gold
  regalia and envelopes, pale sallow skin, glowing string-white contracts. (Any
  engine tint is only a fallback for missing sprites — the real sheet uses its
  true colors.)

---

## Phase 1 — Base Concept + Camera Angles (do this first)

**Prompt (attach `boss_dynasty_1_base_turnaround.png` for family resemblance):**
> Generate a comprehensive 2D character turnaround reference sheet for a mobile
> game boss creature named The Dynasty (Schemer). This is the SECOND phase of a
> three-phase family-lineage boss — it must share an obvious family resemblance
> and the exact same gilded crest medallion as the attached first-phase Bruiser,
> but be leaner, taller, and slyer.
>
> **Creature:** A lean, tall, silver-tongued **manipulator anomaly** in a sharp
> corrupt magenta-purple suit, unnaturally long fingers trailing puppeteer's
> strings that dangle rolled contracts, ballots, and gold envelopes. A high
> collar frames a sly patrician face — thin smirk, half-lidded scheming eyes,
> hooked nose, heavy brow — clearly the same bloodline as the Bruiser. The same
> gilded family-crest medallion (intertwined initials over crossed batons, ringed
> by laurel) glints on the lapel. Grotesque, oily, sinister — a concept-creature,
> NOT a real family, name, or person.
>
> **Style:** High-contrast cel-shaded vector art, flat colors, bold clean outer
> strokes, 2D mobile game asset (Persona 5 UI pop crossed with Hades
> silhouettes). Plain solid background, isolated creature. Boss-scale: taller and
> leaner than the Bruiser, more detailed than a minion.
>
> **Required Layout:** Show the exact same creature in a row from these angles.
> Proportions, the magenta-purple suit, the puppet-strings of contracts, and the
> crest medallion must remain identical in every view:
> 1. **Front View:** looking directly at the camera.
> 2. **Side Profile:** 90-degree turn.
> 3. **Rear View (straight back):** facing away — we see the back, sash, and
>    trailing strings.
> 4. **TOP-FRONT (high-angle front 3/4) — THE GAMEPLAY VIEW:** camera high above
>    and in front, tilted (NOT flat zenith). We see the top of its head plus its
>    face, lapel crest, and the string-fanned fingers reaching toward the viewer.
>    This is the angle its in-game sprites are drawn from — make it clean and
>    clear.
> 5. **TOP-BEHIND (high-angle rear 3/4):** camera high above and behind, tilted;
>    top of head, shoulders, and the dangling strings behind it.
>
> Ensure the crest medallion, puppet-strings of contracts/envelopes, and
> magenta-purple suit are clearly readable in all five views.

*Save the result as `docs/references/boss_dynasty_2_base_turnaround.png`. This is
the base reference for the next phase — and a family-resemblance reference to
attach when generating Phase 3 (Heir).*

---

## Phase 2 — Animated Boss Sprite Sheet (TOP-FRONT)

**Attach `boss_dynasty_2_base_turnaround.png` first**, then:

> Attached is the base turnaround sheet for The Dynasty (Schemer) boss anomaly.
> Generate a strictly formatted 2D sprite sheet for a top-down auto-battler.
>
> **Crucial Perspective:** The Dynasty (Schemer) is an Enemy boss. The camera is a
> high top-down oblique above and behind the player's line, so it faces TOWARD the
> camera as it bears down on the barrier. **ALL frames must be drawn from a
> HIGH-ANGLE FRONT VIEW (top-front, front 3/4)** — top of head, plus face, lapel
> crest, and reaching hands. Not a flat zenith, no side profiles, no low angles.
>
> **Style & Formatting:** Match the cel-shaded vector style of the reference
> exactly (magenta-purple suit, puppet-strings of contracts/envelopes, family
> crest medallion). Lay out as horizontal rows, one animation per row, each frame in its own evenly-spaced cell, non-overlapping, with consistent size and centering.
>
> **OUTPUT RULES (critical — the last generation drew these by mistake):** Fully **transparent** background — NO white fill. Do NOT draw any grid lines, cell borders, boxes, guide lines, or separators. Do NOT render any text, row names, labels, numbers, or captions anywhere in the image. Output ONLY the character art, arranged in evenly-spaced **invisible** cells.
>
> **MANDATORY LAYOUT — exactly 5 rows (NO cast row), in this exact top-to-bottom order:**
> 1. **`march`** — EXACTLY 4 frames: a smooth, gliding advance toward the viewer,
>    strings swaying, deliberate and unhurried (front view).
> 2. **`attack`** — EXACTLY 3 frames: **whipping its contract-strings forward** to
>    lash/bind the barrier like garrotes. Frame 2 is the clear impact frame,
>    strings snapping taut (front view).
> 3. **`stunned`** — EXACTLY 2 frames: dazed, wobbling, **spinning stars** circling
>    its head, strings tangling, mid-stumble (front view).
> 4. **`celebrate`** — EXACTLY 2 frames: it overran the line — a smug bow and a
>    **fan of contracts spread in triumph** (front view). Plays when the player
>    loses.
> 5. **`death`** — EXACTLY 3 frames: it recoils and **unravels into a spray of
>    torn contracts and magenta energy** — but the crest medallion survives intact,
>    hinting the Heir will take over (front view).
>
> Verify every frame in every row is present in the final grid.

*Export from Aseprite as `boss_dynasty_2.png` + `boss_dynasty_2.json` (JSON Hash
or Array), with the tag names above spelled exactly:
`march attack stunned celebrate death` (no `cast`).*

---

## Export & QA reminders

- Transparent background, consistent frame size, no clipped limbs.
- Tag names MUST match the engine states 1:1 — see the checklist in
  `docs/CHARACTER_VISUAL_PROMPT_GUIDE.md` (Phase 4). This phase uses **5 rows, no
  `cast`** (no `activeSkill`; it phase-transitions on death).
- Confirm the **family crest matches** the Bruiser and Heir packs — the three must
  read as one dynasty, escalating.
- Drop finished files in `public/assets/enemies/`: `boss_dynasty_2.png`,
  `boss_dynasty_2.json`.

## Integration status

**The engine side is already done** — `EnemyModel` is `Sprite`-based, every state
routes through the sprite-sheet path with a tween fallback, an enemy's atlas key
defaults to its `id`, and `GameScene.createEnemyAnimations()` auto-wires any enemy
atlas that loads. Until the art exists The Dynasty (Schemer) renders the tinted
`enemy-base` placeholder (no broken texture) and still animates all states via
tweens.

**To light up the real art, once you've generated the sheet:**
1. Drop `boss_dynasty_2.png` + `boss_dynasty_2.json` into `public/assets/enemies/`.
2. In `GameScene.preload()`, uncomment:
   `this.load.aseprite('boss_dynasty_2', '/assets/enemies/boss_dynasty_2.png', '/assets/enemies/boss_dynasty_2.json');`
   (atlas key defaults to the enemy `id` = `boss_dynasty_2`). That's it — the
   states play from real frames automatically.
