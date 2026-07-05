# The Dynasty (Heir) — Boss Art Prompt Pack — Phase 3 of 3 (final form)

Ready-to-paste prompts for generating **The Dynasty (Heir)** — the **final phase**
of the Dynasty apex boss, the young inheritor who takes over when the Schemer
falls. This pack mirrors the enemy template `grunt_prompt_pack.md`; the **boss
differences** apply: draw it **larger, more detailed and more grotesque** than a
minion, and add a 6th **`cast`** row (EXACTLY 3 frames) between `attack` and
`stunned`.

- **Perspective is TOP-FRONT** (high-angle front view) — the anomaly faces the
  camera as it bears down on the barrier. Never a flat zenith, never a side
  profile (`docs/CHARACTER_VISUAL_PROMPT_GUIDE.md`).
- **State set is `march / attack / cast / stunned / celebrate / death`** (6 rows).
  As the **final heir form**, this phase includes a **`cast`** row. There is **no
  anime skill cut-in** for enemies; the `cast` row is the in-world channel pose.

> **Note on `cast`:** `balance.ts` lists **no explicit `activeSkill`** for
> `boss_dynasty_3` (the earlier phases transition on death, and this is the last
> phase — nothing to transition into). Per this task the Heir, as the culminating
> form, still gets a `cast` row. Its channel is a **synthesized signature**:
> **"Claim the Inheritance"** — the Heir summons the spectral echoes of the fallen
> Bruiser and Schemer to wreath and empower itself. If a named `activeSkill` is
> later added to `balance.ts`, re-theme this row to match.

> Run these in an image-capable Claude/Gemini (not the coding CLI). Always
> **attach the previous phase's output** as reference before generating the next,
> and **attach `boss_dynasty_2_base_turnaround.png`** for family resemblance.

**Binding rule:** bosses personify a *category of PH governance anomaly* (an
issue — **political dynasties as a phenomenon**, never a real family, name,
party, or person). Design a grotesque concept-creature, not a likeness
(`docs/WORLD_AND_HEROES.md`).

---

## Dynasty lineage — shared bible (spans all 3 phases)

The Dynasty is a **3-phase boss**: **Bruiser (`boss_dynasty_1`) → Schemer
(`boss_dynasty_2`) → Heir (`boss_dynasty_3`)**. Kill one phase and a relative
takes over. All three must share an unmistakable **family resemblance** and a
**common regalia set**, while **escalating in menace** to this final form. Keep
these dynastic constants identical across every phase (full shared bible in
`boss_dynasty_1_prompt_pack.md`):

- **The Family Crest:** the same gaudy gilded **coat-of-arms medallion**
  (intertwined initials over crossed ceremonial batons, ringed by laurel) — on
  the Heir it is the largest and most ostentatious, worn like a chest-plate, but
  clearly the same crest.
- **Regalia:** oversized gold **signet rings**, a house-purple **ceremonial
  sash**, a corrupted formal silhouette — here bejewelled and gaudier than ever.
- **Shared features:** heavy entitled brow, hooked patrician nose, born-to-rule
  sneer — the same face lineage, youngest and most arrogant here.
- **Palette escalation climax:** the Heir glows the hottest — **vivid
  fuchsia/orchid** (`#d946ef`), brighter and more unnatural than Bruiser or
  Schemer.

---

## The Dynasty (Heir) Visual Bible (locked — keep identical across this phase)

This bible is **synthesized** from its role (the **fast, final inheritor** — low
HP but quick, wreathed in the accumulated power of the whole dynasty) and its
`balance.ts` color anchor `#d946ef` (fuchsia/orchid). Do not drift:

- **What:** The Dynasty (Heir) — a pampered, glowing **inheritor-prince
  anomaly**: the youngest of the bloodline, crowned by generations of accumulated
  entitlement made monstrous. Grotesque, radiant, spoiled — a concept-creature,
  not a human likeness.
- **Body:** a slighter, quicker figure than its forebears, but wreathed in a
  **fuchsia aura of hereditary power**; a gaudy bejewelled formal outfit, an
  oversized crest chest-plate, a floating gilded **coronet** above the family
  face. Faint spectral silhouettes of the fallen Bruiser and Schemer shimmer at
  its shoulders like inherited ghosts.
- **Signature read-at-a-glance cue:** the **floating coronet + fuchsia aura + the
  oversized crest chest-plate**, with the two ghostly ancestor-silhouettes — its
  #1 silhouette read; must survive every angle and clearly match the prior phases.
- **Face:** the shared dynasty face at its youngest and most arrogant — a
  petulant sneer, upturned hooked nose, glowing fuchsia eyes.
- **Boss scale:** smaller and sleeker than the hulking Bruiser but grander in
  presence — the aura, coronet, and ancestor-ghosts make it read as the biggest
  threat. Still clearly larger and more detailed than any minion.
- **Style:** High-contrast cel-shaded vector art, flat colors, bold clean outer
  strokes, 2D mobile game asset (Persona 5 UI pop × Hades silhouette), plain
  solid/white background, isolated character. Reads clearly at small size.
- **Palette:** climax fuchsia/orchid (anchor `#d946ef`), bright polished gold
  regalia, pale pampered skin, ghost-purple ancestor silhouettes. (Any engine
  tint is only a fallback for missing sprites — the real sheet uses its true
  colors.)

---

## Phase 1 — Base Concept + Camera Angles (do this first)

**Prompt (attach `boss_dynasty_2_base_turnaround.png` for family resemblance):**
> Generate a comprehensive 2D character turnaround reference sheet for a mobile
> game boss creature named The Dynasty (Heir). This is the FINAL, third phase of a
> three-phase family-lineage boss — it must share an obvious family resemblance
> and the exact same gilded crest as the attached earlier phases, but be the
> youngest, sleekest, and most radiant, wreathed in inherited power.
>
> **Creature:** A pampered, glowing **inheritor-prince anomaly** — a slight, quick
> figure wreathed in a fuchsia aura of hereditary power, a gaudy bejewelled formal
> outfit, an oversized family-crest chest-plate, a floating gilded coronet above a
> petulant patrician face (upturned hooked nose, heavy brow, glowing fuchsia
> eyes) clearly of the same bloodline. Faint spectral silhouettes of two fallen
> ancestors (a hulking brute and a lean schemer) shimmer at its shoulders.
> Grotesque, radiant, spoiled — a concept-creature, NOT a real family, name, or
> person.
>
> **Style:** High-contrast cel-shaded vector art, flat colors, bold clean outer
> strokes, 2D mobile game asset (Persona 5 UI pop crossed with Hades
> silhouettes). Plain solid background, isolated creature. Boss-scale: sleeker but
> grander than its forebears, more detailed than a minion.
>
> **Required Layout:** Show the exact same creature in a row from these angles.
> Proportions, the fuchsia aura, floating coronet, crest chest-plate, and
> ancestor-ghost silhouettes must remain identical in every view:
> 1. **Front View:** looking directly at the camera.
> 2. **Side Profile:** 90-degree turn.
> 3. **Rear View (straight back):** facing away — we see the back, sash, and aura
>    trailing.
> 4. **TOP-FRONT (high-angle front view) — THE GAMEPLAY VIEW:** camera high above
>    and in front, tilted (NOT flat zenith). We see the top of its coroneted head
>    plus its face, crest chest-plate, and the fuchsia aura as it strides toward
>    the viewer. This is the angle its in-game sprites are drawn from — make it
>    clean and clear.
> 5. **TOP-BEHIND (high-angle back view):** camera high above and behind, tilted;
>    top of coronet, shoulders, and the ancestor-ghosts behind it.
>
> Ensure the crest chest-plate, floating coronet, fuchsia aura, and ancestor-ghost
> silhouettes are clearly readable in all five views.

*Save the result as `docs/references/boss_dynasty_3_base_turnaround.png`. This is
the base reference for the next phase.*

---

## Phase 2 — Animated Boss Sprite Sheet (TOP-FRONT)

**Attach `boss_dynasty_3_base_turnaround.png` first**, then:

> Attached is the base turnaround sheet for The Dynasty (Heir) boss anomaly.
> Generate a strictly formatted 2D sprite sheet for a top-down auto-battler.
>
> **Crucial Perspective:** The Dynasty (Heir) is an Enemy boss. The camera is a
> high top-down oblique above and behind the player's line, so it faces TOWARD the
> camera as it bears down on the barrier. **ALL frames must be drawn from a
> HIGH-ANGLE FRONT VIEW (top-front, front view)** — top of coroneted head, plus
> face, crest chest-plate, and aura. Not a flat zenith, no side profiles, no low
> angles.
>
> **Style & Formatting:** Match the cel-shaded vector style of the reference
> exactly (fuchsia aura, floating coronet, crest chest-plate, ancestor-ghosts). Lay out as horizontal rows, one animation per row, each frame in its own evenly-spaced cell, non-overlapping, with consistent size and centering.
>
> **OUTPUT RULES (critical — the last generation drew these by mistake):** Fully **transparent** background — NO white fill. Do NOT draw any grid lines, cell borders, boxes, guide lines, or separators. Do NOT render any text, row names, labels, numbers, or captions anywhere in the image. Output ONLY the character art, arranged in evenly-spaced **invisible** cells.
>
> **MANDATORY LAYOUT — exactly 6 rows, in this exact top-to-bottom order:**
> 1. **`march`** — EXACTLY 4 frames: a quick, entitled strut toward the viewer,
>    aura pulsing, coronet bobbing (front view).
> 2. **`attack`** — EXACTLY 3 frames: **lashing out with an aura-charged fuchsia
>    swipe** at the barrier, flaunting its power. Frame 2 is the clear impact
>    frame, fuchsia energy bursting (front view).
> 3. **`cast`** — EXACTLY 3 frames: channelling the synthesized signature **"Claim
>    the Inheritance"** — it raises both arms and the spectral Bruiser and Schemer
>    surge up around it, pouring their power into the Heir as the fuchsia aura
>    flares. Frame 2 is the peak channel, ancestors fully manifest (front view,
>    dramatic and menacing).
> 4. **`stunned`** — EXACTLY 2 frames: dazed, wobbling, **spinning stars** circling
>    the coronet, aura sputtering, mid-stumble (front view).
> 5. **`celebrate`** — EXACTLY 2 frames: it overran the line — a haughty pose,
>    coronet raised, **ancestor-ghosts cheering behind** in triumph (front view).
>    Plays when the player loses.
> 6. **`death`** — EXACTLY 3 frames: the whole dynasty ends here — the Heir and its
>    ancestor-ghosts **shatter together in a fuchsia burst**, and this time the
>    crest medallion **cracks and disintegrates** (front view — final phase, the
>    lineage is finished).
>
> **SELF-CHECK — before returning the image, verify each item; if any FAILS, fix it and regenerate:**
> 1. **Consistent view** — every frame in every row uses the SAME camera angle stated above (heroes: rear / top-behind — we see the back; enemies: front / top-front — we see the face). No side profiles, no switching between front and back between frames.
> 2. **Frame counts** — each row has EXACTLY the number of frames listed for that row above.
> 3. **Clean output** — fully transparent background; NO grid lines, borders, boxes, text, labels, numbers, or captions anywhere.
> 4. **On-model & separated** — outfit / hair / props identical in every frame; poses do not touch or overlap.

*Export from Aseprite as `boss_dynasty_3.png` + `boss_dynasty_3.json` (JSON Hash
or Array), with the tag names above spelled exactly:
`march attack cast stunned celebrate death`.*

---

## Export & QA reminders

- Transparent background, consistent frame size, no clipped limbs.
- Tag names MUST match the engine states 1:1 — see the checklist in
  `docs/CHARACTER_VISUAL_PROMPT_GUIDE.md` (Phase 4). This phase uses **6 rows**
  (`cast` included as the final heir form's signature channel).
- Confirm the **family crest matches** the Bruiser and Schemer packs — the three
  must read as one dynasty, escalating to this climax.
- Drop finished files in `public/assets/enemies/`: `boss_dynasty_3.png`,
  `boss_dynasty_3.json`.

## Integration status

**The engine side is already done** — `EnemyModel` is `Sprite`-based, every state
routes through the sprite-sheet path with a tween fallback, an enemy's atlas key
defaults to its `id`, and `GameScene.createEnemyAnimations()` auto-wires any enemy
atlas that loads. Until the art exists The Dynasty (Heir) renders the tinted
`enemy-base` placeholder (no broken texture) and still animates all states via
tweens.

**To light up the real art, once you've generated the sheet:**
1. Drop `boss_dynasty_3.png` + `boss_dynasty_3.json` into `public/assets/enemies/`.
2. In `GameScene.preload()`, uncomment:
   `this.load.aseprite('boss_dynasty_3', '/assets/enemies/boss_dynasty_3.png', '/assets/enemies/boss_dynasty_3.json');`
   (atlas key defaults to the enemy `id` = `boss_dynasty_3`). That's it — the
   states play from real frames automatically.
