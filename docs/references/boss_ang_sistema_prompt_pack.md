# Ang Sistema — Boss Art Prompt Pack (FINALE)

Ready-to-paste prompts for generating **Ang Sistema** — the **final boss of the
campaign**, "the system itself" that lets every other anomaly thrive. This pack
mirrors the enemy template `grunt_prompt_pack.md`; the **boss differences** apply,
maxed out: draw it **the largest, most detailed and most grotesque of all**, and
add a 6th **`cast`** row (EXACTLY 3 frames) between `attack` and `stunned` showing
it channelling its signature `activeSkill`.

- **Perspective is TOP-FRONT** (high-angle front view) — the anomaly faces the
  camera as it bears down on the barrier. Never a flat zenith, never a side
  profile (`docs/CHARACTER_VISUAL_PROMPT_GUIDE.md`).
- **State set is `march / attack / cast / stunned / celebrate / death`** (6 rows —
  it has an `activeSkill`). There is **no anime skill cut-in** for enemies; the
  `cast` row is the in-world channel pose, not a portrait.

> Run these in an image-capable Claude/Gemini (not the coding CLI). Always
> **attach the previous phase's output** as reference before generating the next.

**Binding rule:** bosses personify a *category of PH governance anomaly* (an
issue, never a real official, family, party, or person). Ang Sistema is the
**"the system itself"** finale — the abstract machinery of bad governance, not a
person (`docs/WORLD_AND_HEROES.md`).

---

## Ang Sistema Visual Bible (locked — keep identical across every phase)

No portrait exists — this bible is **synthesized** from its role (the campaign
**finale**: the systemic machinery that resurrects lesser versions of every
defeated boss) and its `balance.ts` color anchor `#000000` (black). Do not drift:

- **What:** Ang Sistema — a towering, **abstract machine-idol anomaly**: not a
  creature or a person but "the system" made monstrous — a colossal apparatus of
  entangled bureaucracy and power that keeps every other anomaly alive. The
  ultimate concept-creature.
- **Body:** a vast, looming **obsidian-black bureaucratic engine** — a fused
  tangle of gears, rubber-stamp pistons, red-tape cabling, cctv-eyes, ballot
  slots, and grinding filing-cabinet plates, all congealed into a hunched idol
  form. Faint **ghost-faces of the defeated bosses** churn inside its dark mass
  like cogs. It is architectural in scale — a walking institution.
- **Signature read-at-a-glance cue:** the **black machine-idol silhouette with a
  ring of glowing cctv/ballot "eyes"** and boss ghost-faces embedded in its gears
  — its #1 silhouette read; must survive every angle.
- **Face:** no single face — instead a cluster of **glowing institutional eyes**
  (cctv lenses, official seals) arranged into a cold, all-seeing "expression."
- **Boss scale:** the **largest and grandest boss in the game** — dwarfs every
  other anomaly, most rendered detail, most grotesque. It should feel oppressive.
- **Style:** High-contrast cel-shaded vector art, flat colors, bold clean outer
  strokes, 2D mobile game asset (Persona 5 UI pop × Hades silhouette), plain
  solid/white background, isolated character. Reads clearly at small size despite
  the mass — keep the silhouette bold and the glowing eyes/accents legible.
- **Palette:** system-black (anchor `#000000`) as the dominant mass, with cold
  institutional accent glows — bureaucratic green cctv light, red-tape crimson
  cabling, dull tarnished gold seals. The black must stay readable against a solid
  background (use rim-light / accent edges so it never becomes a flat blob). (Any
  engine tint is only a fallback for missing sprites — the real sheet uses its
  true colors.)
- **Soundscape (for reference, not drawn):** deep grinding machinery, layered
  overlapping whispers of every prior boss, a low institutional drone, cold
  arrogant laughter echoing.

**Signature `activeSkill` — Horde Convergence (`resurrectAll`):** the finale
mechanic — it resurrects lesser echoes of all defeated bosses at once. The `cast`
row depicts this channel: the machine-idol wrenches open and disgorges the churning
ghost-faces of the fallen bosses, which pour out as reborn horde-echoes.

---

## Phase 1 — Base Concept + Camera Angles (do this first)

**Prompt:**
> Generate a comprehensive 2D character turnaround reference sheet for a mobile
> game FINAL BOSS named Ang Sistema — "the system itself."
>
> **Creature:** A towering, abstract **machine-idol anomaly** — NOT a person or an
> animal but the machinery of bad governance made monstrous: a colossal
> obsidian-black apparatus of fused gears, rubber-stamp pistons, red-tape cabling,
> cctv-lens eyes, ballot slots, and grinding filing-cabinet plates congealed into
> a hunched idol form. A ring of cold glowing institutional eyes for a "face."
> Faint ghost-faces of defeated bosses churn inside its gears. Architectural in
> scale, oppressive, the ultimate concept-creature — NOT a real official, family,
> or person.
>
> **Style:** High-contrast cel-shaded vector art, flat colors, bold clean outer
> strokes, 2D mobile game asset (Persona 5 UI pop crossed with Hades
> silhouettes). Plain solid background, isolated creature. Final-boss scale: the
> largest and most detailed of all, but keep the silhouette bold and the glowing
> accents legible so the black mass never reads as a flat blob (use rim-light /
> accent edges).
>
> **Required Layout:** Show the exact same machine-idol in a row from these angles.
> Proportions, the tangled gear-and-stamp mass, the ring of glowing eyes, and the
> embedded boss ghost-faces must remain identical in every view:
> 1. **Front View:** looking directly at the camera.
> 2. **Side Profile:** 90-degree turn.
> 3. **Rear View (straight back):** facing away — we see the back plating, cabling,
>    and exhaust of the engine.
> 4. **TOP-FRONT (high-angle front view) — THE GAMEPLAY VIEW:** camera high above
>    and in front, tilted (NOT flat zenith). We see the top of the idol's mass plus
>    its ring of glowing eyes, gear-front, and stamp-pistons as it looms toward the
>    viewer. This is the angle its in-game sprites are drawn from — make it clean
>    and clear.
> 5. **TOP-BEHIND (high-angle back view):** camera high above and behind, tilted;
>    top of the mass, shoulders of plating, and the cabling behind it.
>
> Ensure the ring of glowing institutional eyes, the tangled gear-and-stamp mass,
> and the embedded boss ghost-faces are clearly readable in all five views.

*Save the result as `docs/references/boss_ang_sistema_base_turnaround.png`. This is
the base reference for the next phase.*

---

## Phase 2 — Animated Boss Sprite Sheet (TOP-FRONT)

**Attach `boss_ang_sistema_base_turnaround.png` first**, then:

> Attached is the base turnaround sheet for the Ang Sistema final boss. Generate a
> strictly formatted 2D sprite sheet for a top-down auto-battler.
>
> **Crucial Perspective:** Ang Sistema is an Enemy final boss. The camera is a high
> top-down oblique above and behind the player's line, so it faces TOWARD the
> camera as it bears down on the barrier. **ALL frames must be drawn from a
> HIGH-ANGLE FRONT VIEW (top-front, front view)** — top of the mass, plus the ring
> of eyes, gear-front, and stamp-pistons. Not a flat zenith, no side profiles, no
> low angles.
>
> **Style & Formatting:** Match the cel-shaded vector style of the reference
> exactly (obsidian-black machine mass, ring of glowing institutional eyes, red-tape
> cabling, embedded boss ghost-faces). Lay out as horizontal rows, one animation per row, each frame in its own evenly-spaced cell, non-overlapping, with consistent size and centering.
>
> **OUTPUT RULES (critical — the last generation drew these by mistake):** Fully **transparent** background — NO white fill. Do NOT draw any grid lines, cell borders, boxes, guide lines, or separators. Do NOT render any text, row names, labels, numbers, or captions anywhere in the image. Output ONLY the character art, arranged in evenly-spaced **invisible** cells.
>
> **MANDATORY LAYOUT — exactly 6 rows, in this exact top-to-bottom order:**
> 1. **`march`** — EXACTLY 4 frames: a slow, grinding, ground-quaking advance toward
>    the viewer, gears turning, pistons pumping (front view).
> 2. **`attack`** — EXACTLY 3 frames: **slamming a giant stamp-piston / filing-plate
>    down** onto the barrier. Frame 2 is the clear impact frame, sparks and
>    shockwave (front view).
> 3. **`cast`** — EXACTLY 3 frames: channelling **Horde Convergence** — the
>    machine-idol wrenches open and disgorges the churning ghost-faces of the
>    defeated bosses, which pour out as reborn horde-echoes. Frame 2 is the peak
>    channel, the idol split wide with light and ghosts streaming out (front view,
>    dramatic and oppressive).
> 4. **`stunned`** — EXACTLY 2 frames: seized up, gears grinding to a halt,
>    **spinning stars / sputtering eyes** flickering, mid-jam (front view).
> 5. **`celebrate`** — EXACTLY 2 frames: it overran the line — the whole engine
>    flares triumphant, every eye blazing, ghost-faces laughing (front view). Plays
>    when the player loses.
> 6. **`death`** — EXACTLY 3 frames: the system finally breaks — the machine-idol
>    **cracks apart and implodes**, gears flying, every glowing eye going dark, the
>    trapped boss ghost-faces scattering free (front view). The campaign's climax.
>
> **SELF-CHECK — before returning the image, verify each item; if any FAILS, fix it and regenerate:**
> 1. **Consistent view** — every frame in every row uses the SAME camera angle stated above (heroes: rear / top-behind — we see the back; enemies: front / top-front — we see the face). No side profiles, no switching between front and back between frames.
> 2. **Frame counts** — each row has EXACTLY the number of frames listed for that row above.
> 3. **Clean output** — fully transparent background; NO grid lines, borders, boxes, text, labels, numbers, or captions anywhere.
> 4. **On-model & separated** — outfit / hair / props identical in every frame; poses do not touch or overlap.

*Export from Aseprite as `boss_ang_sistema.png` + `boss_ang_sistema.json` (JSON
Hash or Array), with the tag names above spelled exactly:
`march attack cast stunned celebrate death`.*

---

## Export & QA reminders

- Transparent background, consistent frame size, no clipped limbs/plating.
- Tag names MUST match the engine states 1:1 — see the checklist in
  `docs/CHARACTER_VISUAL_PROMPT_GUIDE.md` (Phase 4). This boss uses 6 rows
  (`cast` included).
- Confirm final-boss scale and that the **black mass stays legible** (rim-light /
  glowing accents) — it must never read as a flat black blob at small size.
- Drop finished files in `public/assets/enemies/`: `boss_ang_sistema.png`,
  `boss_ang_sistema.json`.

## Integration status

**The engine side is already done** — `EnemyModel` is `Sprite`-based, every state
routes through the sprite-sheet path with a tween fallback, an enemy's atlas key
defaults to its `id`, and `GameScene.createEnemyAnimations()` auto-wires any enemy
atlas that loads. Until the art exists Ang Sistema renders the tinted `enemy-base`
placeholder (no broken texture) and still animates all states via tweens.

**To light up the real art, once you've generated the sheet:**
1. Drop `boss_ang_sistema.png` + `boss_ang_sistema.json` into
   `public/assets/enemies/`.
2. In `GameScene.preload()`, uncomment:
   `this.load.aseprite('boss_ang_sistema', '/assets/enemies/boss_ang_sistema.png', '/assets/enemies/boss_ang_sistema.json');`
   (atlas key defaults to the enemy `id` = `boss_ang_sistema`). That's it — the
   states play from real frames automatically.
