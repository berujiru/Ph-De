# The Dynasty (Bruiser) — Boss Art Prompt Pack — Phase 1 of 3

Ready-to-paste prompts for generating **The Dynasty (Bruiser)** — the **first of
three phases** of the Dynasty apex boss. This pack mirrors the enemy template
`grunt_prompt_pack.md`; the **boss differences** apply: draw it **larger, more
detailed and more grotesque** than a minion.

- **Perspective is TOP-FRONT** (high-angle front view) — the anomaly faces the
  camera as it bears down on the barrier. Never a flat zenith, never a side
  profile (`docs/CHARACTER_VISUAL_PROMPT_GUIDE.md`).
- **State set is `march / attack / stunned / celebrate / death`** (5 rows — **NO
  `cast` row**). This phase has **no `activeSkill`**; instead of a skill, killing
  it triggers a **phase transition** (`nextPhaseEnemyId: boss_dynasty_2`), which
  the engine handles — so there is nothing to channel and no `cast` state. There
  is **no anime skill cut-in** for enemies.

> Run these in an image-capable Claude/Gemini (not the coding CLI). Always
> **attach the previous phase's output** as reference before generating the next.

**Binding rule:** bosses personify a *category of PH governance anomaly* (an
issue — here **political dynasties as a phenomenon**, never a real family, name,
party, or person). Design a grotesque concept-creature, not a likeness
(`docs/WORLD_AND_HEROES.md`).

---

## Dynasty lineage — shared bible (spans all 3 phases)

The Dynasty is a **3-phase boss**: **Bruiser (`boss_dynasty_1`) → Schemer
(`boss_dynasty_2`) → Heir (`boss_dynasty_3`)**. Kill one phase and a relative
takes over. All three must share an unmistakable **family resemblance** and a
**common regalia set**, while **escalating in menace**. Keep these dynastic
constants identical across every phase:

- **The Family Crest:** a gaudy gilded **coat-of-arms medallion** — intertwined
  ornamental initials over a pair of crossed ceremonial batons, ringed by a
  laurel. Worn on the chest by every phase. This medallion is the through-line
  cue that tells players "same dynasty, new face."
- **Regalia:** oversized gold **signet rings**, a heavy **ceremonial sash** in
  house purple, a barong/formal-jacket silhouette gone corrupt and grotesque.
- **Shared features:** a heavy entitled brow, a hooked patrician nose, and a
  born-to-rule sneer — the same face lineage sculpted differently per phase.
- **Escalation of palette across phases:** deep royal purple (Bruiser `#701a75`)
  → brighter scheming magenta-purple (Schemer `#a21caf`) → vivid fuchsia/orchid
  (Heir `#d946ef`). Each phase glows a shade hotter and more unnatural.
- **Soundscape (for reference, not drawn):** heavy sluggish footsteps, loud
  arrogant laughing, the clink of gold, echoing hereditary menace.

---

## The Dynasty (Bruiser) Visual Bible (locked — keep identical across this phase)

This bible is **synthesized** from its role (the **melee-tank patriarch** who
opens the fight, high HP, slow, hits like a truck) and its `balance.ts` color
anchor `#701a75` (deep royal purple). Do not drift:

- **What:** The Dynasty (Bruiser) — a hulking, brutish **patriarch-enforcer
  anomaly**: raw hereditary muscle, the founding strongman of the dynasty made
  monstrous. Grotesque, swollen with entitlement — a concept-creature, not a
  human likeness.
- **Body:** an enormous barrel-chested brute, a purple **barong/formal jacket
  bursting at the seams** over slabs of muscle, forearms like tree trunks, both
  fists clenched into **gavel-shaped mallets** wrapped in gold rings. The family
  crest medallion sits on the swollen chest.
- **Signature read-at-a-glance cue:** the **gavel-fists + the crest medallion on
  a bursting purple barong** — this is its #1 silhouette read and must survive
  every angle (and its crest must clearly match the later phases).
- **Face:** the shared dynasty face at its most brutish — a jowly, red-faced
  scowl, heavy brow, gold tooth, a cigar clamped in the sneer.
- **Boss scale:** the biggest, heaviest of the three phases — reads as a slow
  wall of a boss. More rendered detail, more grotesque bulk than any minion.
- **Style:** High-contrast cel-shaded vector art, flat colors, bold clean outer
  strokes, 2D mobile game asset (Persona 5 UI pop × Hades silhouette), plain
  solid/white background, isolated character. Reads clearly at small size.
- **Palette:** deep royal purple (anchor `#701a75`), tarnished gold regalia,
  flushed grey-purple skin, cigar-ember orange spark. (Any engine tint is only a
  fallback for missing sprites — the real sheet uses its true colors.)

---

## Phase 1 — Base Concept + Camera Angles (do this first)

**Prompt:**
> Generate a comprehensive 2D character turnaround reference sheet for a mobile
> game boss creature named The Dynasty (Bruiser). This is the first phase of a
> three-phase family-lineage boss, so its features and regalia will be reused on
> two escalating successors.
>
> **Creature:** An enormous barrel-chested brute **patriarch-enforcer anomaly** —
> a purple barong/formal jacket bursting at the seams over slabs of muscle,
> forearms like tree trunks, both fists clenched into gavel-shaped mallets wrapped
> in gold signet rings. A gaudy gilded family-crest medallion (intertwined
> initials over crossed batons, ringed by laurel) on the swollen chest. A jowly
> red-faced scowl, heavy brow, gold tooth, cigar in the sneer. Grotesque, swollen
> with entitlement — a concept-creature, NOT a real family, name, or person.
>
> **Style:** High-contrast cel-shaded vector art, flat colors, bold clean outer
> strokes, 2D mobile game asset (Persona 5 UI pop crossed with Hades
> silhouettes). Plain solid background, isolated creature. Boss-scale: the largest
> and heaviest, more detailed than a minion.
>
> **Required Layout:** Show the exact same creature in a row from these angles.
> Proportions, the bursting purple barong, gavel-fists, gold rings, and the crest
> medallion must remain identical in every view:
> 1. **Front View:** looking directly at the camera.
> 2. **Side Profile:** 90-degree turn.
> 3. **Rear View (straight back):** facing away — we see the broad back and the
>    ceremonial sash.
> 4. **TOP-FRONT (high-angle front view) — THE GAMEPLAY VIEW:** camera high above
>    and in front, tilted (NOT flat zenith). We see the top of its head plus its
>    face, chest crest medallion, and the gavel-fists as it lumbers toward the
>    viewer. This is the angle its in-game sprites are drawn from — make it clean
>    and clear.
> 5. **TOP-BEHIND (high-angle back view):** camera high above and behind, tilted;
>    top of head, massive shoulders, and back sash.
>
> Ensure the crest medallion, gavel-fists, gold rings, and bursting purple barong
> are clearly readable in all five views.

*Save the result as `docs/references/boss_dynasty_1_base_turnaround.png`. This is
the base reference for the next phase — and a family-resemblance reference to
attach when generating Phases 2 and 3.*

---

## Phase 2 — Animated Boss Sprite Sheet (TOP-FRONT)

**Attach `boss_dynasty_1_base_turnaround.png` first**, then:

> Attached is the base turnaround sheet for The Dynasty (Bruiser) boss anomaly.
> Generate a strictly formatted 2D sprite sheet for a top-down auto-battler.
>
> **Crucial Perspective:** The Dynasty (Bruiser) is an Enemy boss. The camera is a
> high top-down oblique above and behind the player's line, so it faces TOWARD the
> camera as it bears down on the barrier. **ALL frames must be drawn from a
> HIGH-ANGLE FRONT VIEW (top-front, front view)** — top of head, plus face, chest
> crest, and gavel-fists. Not a flat zenith, no side profiles, no low angles.
>
> **Style & Formatting:** Match the cel-shaded vector style of the reference
> exactly (bursting purple barong, gavel-fists, gold rings, family-crest
> medallion). Lay out as horizontal rows, one animation per row, each frame in its own evenly-spaced cell, non-overlapping, with consistent size and centering.
>
> **OUTPUT RULES (critical — the last generation drew these by mistake):** Fully **transparent** background — NO white fill. Do NOT draw any grid lines, cell borders, boxes, guide lines, or separators. Do NOT render any text, row names, labels, numbers, or captions anywhere in the image. Output ONLY the character art, arranged in evenly-spaced **invisible** cells.
>
> **MANDATORY LAYOUT — exactly 5 rows (NO cast row), in this exact top-to-bottom order:**
> 1. **`march`** — EXACTLY 4 frames: a slow, ground-shaking lumber toward the
>    viewer, shoulders rolling (front view).
> 2. **`attack`** — EXACTLY 3 frames: **smashing both gavel-fists down** onto the
>    barrier. Frame 2 is the clear impact frame, shockwave and dust (front view).
> 3. **`stunned`** — EXACTLY 2 frames: dazed, wobbling, **spinning stars** circling
>    its head, cigar dropping, mid-stumble (front view).
> 4. **`celebrate`** — EXACTLY 2 frames: it overran the line — bellowing and
>    **pounding its chest crest** in triumph (front view). Plays when the player
>    loses.
> 5. **`death`** — EXACTLY 3 frames: it staggers and **shatters apart** in a burst
>    of purple energy — but the crest medallion survives intact, hinting the next
>    relative will take over (front view).
>
> **SELF-CHECK — before returning the image, verify each item; if any FAILS, fix it and regenerate:**
> 1. **Consistent view** — every frame in every row uses the SAME camera angle stated above (heroes: rear / top-behind — we see the back; enemies: front / top-front — we see the face). No side profiles, no switching between front and back between frames.
> 2. **Frame counts** — each row has EXACTLY the number of frames listed for that row above.
> 3. **Clean output** — fully transparent background; NO grid lines, borders, boxes, text, labels, numbers, or captions anywhere.
> 4. **On-model & separated** — outfit / hair / props identical in every frame; poses do not touch or overlap.

*Export from Aseprite as `boss_dynasty_1.png` + `boss_dynasty_1.json` (JSON Hash
or Array), with the tag names above spelled exactly:
`march attack stunned celebrate death` (no `cast`).*

---

## Export & QA reminders

- Transparent background, consistent frame size, no clipped limbs.
- Tag names MUST match the engine states 1:1 — see the checklist in
  `docs/CHARACTER_VISUAL_PROMPT_GUIDE.md` (Phase 4). This phase uses **5 rows, no
  `cast`** (no `activeSkill`; it phase-transitions on death).
- Confirm the **family crest matches** the Schemer and Heir packs — the three
  must read as one dynasty.
- Drop finished files in `public/assets/enemies/`: `boss_dynasty_1.png`,
  `boss_dynasty_1.json`.

## Integration status

**The engine side is already done** — `EnemyModel` is `Sprite`-based, every state
routes through the sprite-sheet path with a tween fallback, an enemy's atlas key
defaults to its `id`, and `GameScene.createEnemyAnimations()` auto-wires any enemy
atlas that loads. Until the art exists The Dynasty (Bruiser) renders the tinted
`enemy-base` placeholder (no broken texture) and still animates all states via
tweens.

**To light up the real art, once you've generated the sheet:**
1. Drop `boss_dynasty_1.png` + `boss_dynasty_1.json` into `public/assets/enemies/`.
2. In `GameScene.preload()`, uncomment:
   `this.load.aseprite('boss_dynasty_1', '/assets/enemies/boss_dynasty_1.png', '/assets/enemies/boss_dynasty_1.json');`
   (atlas key defaults to the enemy `id` = `boss_dynasty_1`). That's it — the
   states play from real frames automatically.
