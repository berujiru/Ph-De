# Pork Barrel — Boss Art Prompt Pack

Ready-to-paste prompts for generating **Pork Barrel** (`boss_pork_barrel`), an
Act boss anomaly. This pack **mirrors the enemy template**
(`docs/references/grunt_prompt_pack.md`) with the **boss differences**:

- Drawn **larger, more detailed, and more grotesque** than a minion.
- Phase 2 has **6 rows** — a 6th **`cast`** row (EXACTLY 3 frames) is inserted
  between `attack` and `stunned`, showing the boss channelling its `activeSkill`
  **Devour Funds** (`devour`).
- Still **TOP-FRONT** (high-angle front 3/4), still **no anime skill cut-in**
  (that's a hero-only feature — see `docs/CHARACTER_VISUAL_PROMPT_GUIDE.md`).

> Run these in an image-capable Claude/Gemini (not the coding CLI). Always
> **attach the previous phase's output** as reference before generating the next.

**Binding rule:** bosses personify a *category of PH governance anomaly* — never
a real official, party, or contractor. This one is **discretionary-fund abuse
(pork-barrel spending)**. Design a grotesque concept-creature, not a person
(`docs/WORLD_AND_HEROES.md`).

---

## Pork Barrel Visual Bible (locked — keep identical across every phase)

No portrait exists — this bible is **synthesized** from its role (a melee tank
boss — a **bloated hog of funds** whose skill **devours gold pickups to grow max
HP**) and its `balance.ts` color anchor `#db2777` (gorged pork pink/magenta). Do
not drift:

- **What:** Pork Barrel — an enormous, gluttonous **hog-and-barrel hybrid**: a
  monstrous swine whose belly is a splitting **wooden money barrel** stuffed to
  bursting with cash and coins. The greed of discretionary funds made flesh.
  Grotesque, obese, comedic-menacing — a concept-creature, not a human.
- **Body:** a colossal bloated hog torso whose midsection **is** a bound wooden
  barrel (iron hoops straining), banknotes and gold coins bulging out of the
  seams, tiny overstuffed limbs, a curly tail, a fat spilling snout.
- **Signature read-at-a-glance cue:** the **hog head + wooden money-barrel belly
  overflowing with cash** — its #1 silhouette read, and it must survive every
  angle.
- **Face:** a piggish, greedy leer — tiny gleaming eyes, drooling tusked snout,
  cheeks stuffed with banknotes.
- **Style:** High-contrast cel-shaded vector art, flat colors, bold clean outer
  strokes, 2D mobile game asset (Persona 5 UI pop × Hades silhouette), plain
  solid/white background, isolated character. Reads clearly at small size even
  though it is boss-scale.
- **Palette:** gorged pork pink/magenta (anchor `#db2777`), aged-barrel wood
  brown, iron-hoop grey, gold-coin yellow, greasy banknote green. (Any engine
  tint is only a fallback for missing sprites — the real sheet uses its true
  colors, no flat wash.)

---

## Phase 1 — Base Concept + Camera Angles (do this first)

**Prompt:**
> Generate a comprehensive 2D character turnaround reference sheet for a mobile
> game BOSS enemy creature named Pork Barrel.
>
> **Creature:** An enormous gluttonous hog-and-barrel hybrid — a monstrous
> bloated swine whose belly **is** a bound **wooden money barrel** (iron hoops
> straining) stuffed to bursting with **banknotes and gold coins** spilling from
> the seams, tiny overstuffed limbs, a curly tail, and a greedy tusked snout with
> cheeks packed with cash. Grotesque, obese, BOSS-SCALE (much larger and more
> detailed than a minion) — a concept-creature, not a human, and not any real
> person.
>
> **Style:** High-contrast cel-shaded vector art, flat colors, bold clean outer
> strokes, 2D mobile game asset (Persona 5 UI pop crossed with Hades
> silhouettes). Plain solid background, isolated creature.
>
> **Required Layout:** Show the exact same creature in a row from these angles.
> Proportions, the barrel belly, the iron hoops, and the spilling cash must
> remain identical in every view:
> 1. **Front View:** looking directly at the camera.
> 2. **Side Profile:** 90-degree turn.
> 3. **Rear View (straight back):** facing away — we see its back, curly tail, and
>    the barrel hoops from behind.
> 4. **TOP-FRONT (high-angle front 3/4) — THE GAMEPLAY VIEW:** camera high above
>    and in front, tilted (NOT flat zenith). We see the top of its head plus its
>    piggish face, the money-barrel belly, and its stubby forelimbs as it lumbers
>    toward the viewer. This is the angle its in-game sprites are drawn from —
>    make it clean and clear.
> 5. **TOP-BEHIND (high-angle rear 3/4):** camera high above and behind, tilted;
>    top of head, shoulders, and the barrel back.
>
> Ensure the hog head, the wooden money-barrel belly, the iron hoops, and the
> overflowing cash are clearly readable in all five views.

*Save the result as `docs/references/boss_pork_barrel_base_turnaround.png`. This
is the base reference for the next phase.*

---

## Phase 2 — Animated Boss Sprite Sheet (TOP-FRONT, 6 rows)

**Attach `boss_pork_barrel_base_turnaround.png` first**, then:

> Attached is the base turnaround sheet for the Pork Barrel BOSS anomaly. Generate
> a strictly formatted 2D sprite sheet for a top-down auto-battler.
>
> **Crucial Perspective:** Pork Barrel is an Enemy boss. The camera is a high
> top-down oblique above and behind the player's line, so it faces TOWARD the
> camera as it bears down on the barrier. **ALL frames must be drawn from a
> HIGH-ANGLE FRONT VIEW (top-front, front 3/4)** — top of head, plus the piggish
> face, the money-barrel belly, and its forelimbs. Not a flat zenith, no side
> profiles, no low angles. Draw it BOSS-SCALE: larger, more detailed, and more
> menacing than a minion.
>
> **Style & Formatting:** Match the cel-shaded vector style of the reference
> exactly (hog head, wooden barrel belly, iron hoops, overflowing cash). Lay out as horizontal rows, one animation per row, each frame in its own evenly-spaced cell, non-overlapping, with consistent size and centering.
>
> **OUTPUT RULES (critical — the last generation drew these by mistake):** Fully **transparent** background — NO white fill. Do NOT draw any grid lines, cell borders, boxes, guide lines, or separators. Do NOT render any text, row names, labels, numbers, or captions anywhere in the image. Output ONLY the character art, arranged in evenly-spaced **invisible** cells.
>
> **MANDATORY LAYOUT — exactly 6 rows, in this exact top-to-bottom order:**
> 1. **`march`** — EXACTLY 4 frames: a heavy, waddling walk cycle lumbering toward
>    the viewer, the barrel belly sloshing, coins jangling (front view).
> 2. **`attack`** — EXACTLY 3 frames: **body-slamming its barrel belly into the
>    barrier**, coins spraying on impact. Frame 2 is the clear impact frame (front
>    view).
> 3. **`cast`** — EXACTLY 3 frames: channelling its signature skill **Devour
>    Funds** — rearing back and **greedily gulping down a swirl of gold coins**,
>    its barrel belly bloating even bigger and glowing as its max HP swells. This
>    is the telegraphed boss skill; make it grotesque and dramatic (front view).
> 4. **`stunned`** — EXACTLY 2 frames: dazed, wobbling, **spinning stars / floating
>    coins** circling its head, mid-stumble (front view).
> 5. **`celebrate`** — EXACTLY 2 frames: it overran the line — snorting in triumph
>    and **rolling its barrel belly forward**, cash flying (front view). Plays
>    when the player loses.
> 6. **`death`** — EXACTLY 3 frames: **the barrel belly bursting apart, coins and
>    banknotes exploding out** as the hog deflates and collapses (front view).
>
> **SELF-CHECK — before returning the image, verify each item; if any FAILS, fix it and regenerate:**
> 1. **Consistent view** — every frame in every row uses the SAME camera angle stated above (heroes: rear / top-behind — we see the back; enemies: front / top-front — we see the face). No side profiles, no switching between front and back between frames.
> 2. **Frame counts** — each row has EXACTLY the number of frames listed for that row above.
> 3. **Clean output** — fully transparent background; NO grid lines, borders, boxes, text, labels, numbers, or captions anywhere.
> 4. **On-model & separated** — outfit / hair / props identical in every frame; poses do not touch or overlap.

*Export from Aseprite as `boss_pork_barrel.png` + `boss_pork_barrel.json` (JSON
Hash or Array), with the tag names above spelled exactly: `march attack cast
stunned celebrate death`.*

---

## Export & QA reminders

- Transparent background, consistent frame size, no clipped limbs.
- Tag names MUST match the engine states 1:1 (`march attack cast stunned
  celebrate death`) — see the checklist in
  `docs/CHARACTER_VISUAL_PROMPT_GUIDE.md` (Phase 4).
- Confirm the `cast` row is EXACTLY 3 frames and clearly depicts **Devour Funds**.
- Drop finished files in `public/assets/enemies/`: `boss_pork_barrel.png`,
  `boss_pork_barrel.json`.
- Audio pairing (`docs/ART_AND_AUDIO_GUIDELINES.md`): heavy sluggish footsteps and
  **pig squeals**, with a greedy gulp/coin-slurp on the `cast`.

## Integration status

**The engine side is already done** — `EnemyModel` is `Sprite`-based, every state
routes through the sprite-sheet path with a tween fallback, an enemy's atlas key
defaults to its `id`, and `GameScene.createEnemyAnimations()` auto-wires any enemy
atlas that loads. Until the art exists Pork Barrel renders the tinted `enemy-base`
placeholder (no broken texture) and still animates all states via tweens.

**To light up the real art, once you've generated the sheet:**
1. Drop `boss_pork_barrel.png` + `boss_pork_barrel.json` into
   `public/assets/enemies/`.
2. In `GameScene.preload()`, uncomment:
   `this.load.aseprite('boss_pork_barrel', '/assets/enemies/boss_pork_barrel.png', '/assets/enemies/boss_pork_barrel.json');`
   (atlas key defaults to the enemy `id` = `boss_pork_barrel`). That's it — the
   states, including the boss `cast`, play from real frames automatically.
