# Troll Farm — Boss Art Prompt Pack

Ready-to-paste prompts for generating **Troll Farm** (`boss_troll_farm`), an Act
boss anomaly. This pack **mirrors the enemy template**
(`docs/references/grunt_prompt_pack.md`) with the **boss differences**:

- Drawn **larger, more detailed, and more grotesque** than a minion.
- Phase 2 has **6 rows** — a 6th **`cast`** row (EXACTLY 3 frames) is inserted
  between `attack` and `stunned`, showing the boss channelling its `activeSkill`
  **Deploy Trolls** (`summonSwarm`).
- Still **TOP-FRONT** (high-angle front 3/4), still **no anime skill cut-in**
  (that's a hero-only feature — see `docs/CHARACTER_VISUAL_PROMPT_GUIDE.md`).

> Run these in an image-capable Claude/Gemini (not the coding CLI). Always
> **attach the previous phase's output** as reference before generating the next.

**Binding rule:** bosses personify a *category of PH governance anomaly* — never
a real official, party, or contractor. This one is **paid disinformation (a troll
farm)**. Design a grotesque concept-creature, not a person
(`docs/WORLD_AND_HEROES.md`).

---

## Troll Farm Visual Bible (locked — keep identical across every phase)

No portrait exists — this bible is **synthesized** from its role (a ranged
summoner boss that **spawns endless cracked-phone Troll Bot swarms until the farm
falls**) and its `balance.ts` color anchor `#3f3f46` (server-rack graphite/zinc).
Do not drift:

- **What:** Troll Farm — a hulking, humming **server-rack-and-screen creature**: a
  mound of stacked glowing smartphones and blade servers wired into one grotesque
  body, endlessly hatching little gremlin **Troll Bots** (each a fist-sized imp
  with a cracked-phone head). Paid disinformation given a shape. Grotesque,
  buzzing, cold — a concept-creature, not a human.
- **Body:** a bloated tower-torso of **stacked cracked smartphone screens and
  server blades** bound by tangled charging cables, cooling-fan vents wheezing
  steam, many spidery cable-arms, screens flashing troll-face emojis and thumbs.
- **Signature read-at-a-glance cue:** the **wall of glowing cracked-phone screens
  for a body, spawning tiny troll-bot gremlins** — its #1 silhouette read, and it
  must survive every angle.
- **Face:** a central cracked jumbo-screen "face" showing a sneering troll grin
  made of pixels, glitching, with a scrolling ticker for a mouth.
- **Style:** High-contrast cel-shaded vector art, flat colors, bold clean outer
  strokes, 2D mobile game asset (Persona 5 UI pop × Hades silhouette), plain
  solid/white background, isolated character. Reads clearly at small size even
  though it is boss-scale.
- **Palette:** server-rack graphite/zinc (anchor `#3f3f46`), toxic screen-glow
  green and blue, cracked-glass white, warning-red glitch, tangled-cable black.
  (Any engine tint is only a fallback for missing sprites — the real sheet uses
  its true colors, no flat wash.)

---

## Phase 1 — Base Concept + Camera Angles (do this first)

**Prompt:**
> Generate a comprehensive 2D character turnaround reference sheet for a mobile
> game BOSS enemy creature named Troll Farm.
>
> **Creature:** A hulking humming server-rack-and-screen creature — a bloated
> tower-body made of **stacked cracked smartphone screens and blade servers**
> bound by tangled charging cables, wheezing cooling-fan vents, many spidery
> cable-arms, and a central cracked jumbo-screen "face" showing a glitching,
> pixelated troll grin with a scrolling-ticker mouth. Little gremlin troll-bots
> (imps with cracked-phone heads) hatch from its screens. Grotesque, cold,
> BOSS-SCALE (much larger and more detailed than a minion) — a concept-creature,
> not a human, and not any real person.
>
> **Style:** High-contrast cel-shaded vector art, flat colors, bold clean outer
> strokes, 2D mobile game asset (Persona 5 UI pop crossed with Hades
> silhouettes). Plain solid background, isolated creature.
>
> **Required Layout:** Show the exact same creature in a row from these angles.
> Proportions, the stacked-screen tower body, the cable-arms, and the jumbo-screen
> face must remain identical in every view:
> 1. **Front View:** looking directly at the camera.
> 2. **Side Profile:** 90-degree turn.
> 3. **Rear View (straight back):** facing away — we see its back, the server
>    blades, and the tangle of cables trailing off it.
> 4. **TOP-FRONT (high-angle front 3/4) — THE GAMEPLAY VIEW:** camera high above
>    and in front, tilted (NOT flat zenith). We see the top of its rack plus the
>    jumbo-screen face, the wall of phone screens, and its cable-arms as it
>    advances toward the viewer. This is the angle its in-game sprites are drawn
>    from — make it clean and clear.
> 5. **TOP-BEHIND (high-angle rear 3/4):** camera high above and behind, tilted;
>    top of the rack, shoulders, and cabled back.
>
> Ensure the stacked cracked-phone screens, the cable-arms, the cooling vents, and
> the glitching troll-grin face are clearly readable in all five views.

*Save the result as `docs/references/boss_troll_farm_base_turnaround.png`. This is
the base reference for the next phase.*

---

## Phase 2 — Animated Boss Sprite Sheet (TOP-FRONT, 6 rows)

**Attach `boss_troll_farm_base_turnaround.png` first**, then:

> Attached is the base turnaround sheet for the Troll Farm BOSS anomaly. Generate
> a strictly formatted 2D sprite sheet for a top-down auto-battler.
>
> **Crucial Perspective:** Troll Farm is an Enemy boss. The camera is a high
> top-down oblique above and behind the player's line, so it faces TOWARD the
> camera as it bears down on the barrier. **ALL frames must be drawn from a
> HIGH-ANGLE FRONT VIEW (top-front, front 3/4)** — top of the rack, plus the
> jumbo-screen face, the wall of phone screens, and its cable-arms. Not a flat
> zenith, no side profiles, no low angles. Draw it BOSS-SCALE: larger, more
> detailed, and more menacing than a minion.
>
> **Style & Formatting:** Match the cel-shaded vector style of the reference
> exactly (stacked cracked screens, cable-arms, cooling vents, glitching troll
> face). Lay out as horizontal rows, one animation per row, each frame in its own evenly-spaced cell, non-overlapping, with consistent size and centering.
>
> **OUTPUT RULES (critical — the last generation drew these by mistake):** Fully **transparent** background — NO white fill. Do NOT draw any grid lines, cell borders, boxes, guide lines, or separators. Do NOT render any text, row names, labels, numbers, or captions anywhere in the image. Output ONLY the character art, arranged in evenly-spaced **invisible** cells.
>
> **MANDATORY LAYOUT — exactly 6 rows, in this exact top-to-bottom order:**
> 1. **`march`** — EXACTLY 4 frames: a lurching, cable-dragging crawl advancing
>    toward the viewer, screens flickering (front view).
> 2. **`attack`** — EXACTLY 3 frames: **whipping its cable-arms to lash the
>    barrier**, sparks flying. Frame 2 is the clear impact frame (front view).
> 3. **`cast`** — EXACTLY 3 frames: channelling its signature skill **Deploy
>    Trolls** — its screens flaring and its cracked panels **hatching a swarm of
>    tiny cracked-phone troll-bot gremlins** that spill out toward the barrier.
>    This is the telegraphed boss summon; make it dramatic (front view).
> 4. **`stunned`** — EXACTLY 2 frames: dazed, screens glitching to static,
>    **spinning stars / error icons** circling its top, mid-stumble (front view).
> 5. **`celebrate`** — EXACTLY 2 frames: it overran the line — every screen
>    flashing a mocking laughing troll-face in triumph, cable-arms thrown up
>    (front view). Plays when the player loses.
> 6. **`death`** — EXACTLY 3 frames: **screens shattering and shorting out in a
>    cascade of sparks and dead-pixel glitch** as the tower topples and goes dark
>    (front view).
>
> **SELF-CHECK — before returning the image, verify each item; if any FAILS, fix it and regenerate:**
> 1. **Consistent view** — every frame in every row uses the SAME camera angle stated above (heroes: rear / top-behind — we see the back; enemies: front / top-front — we see the face). No side profiles, no switching between front and back between frames.
> 2. **Frame counts** — each row has EXACTLY the number of frames listed for that row above.
> 3. **Clean output** — fully transparent background; NO grid lines, borders, boxes, text, labels, numbers, or captions anywhere.
> 4. **On-model & separated** — outfit / hair / props identical in every frame; poses do not touch or overlap.

*Export from Aseprite as `boss_troll_farm.png` + `boss_troll_farm.json` (JSON Hash
or Array), with the tag names above spelled exactly: `march attack cast stunned
celebrate death`.*

---

## Export & QA reminders

- Transparent background, consistent frame size, no clipped cable-arms.
- Tag names MUST match the engine states 1:1 (`march attack cast stunned
  celebrate death`) — see the checklist in
  `docs/CHARACTER_VISUAL_PROMPT_GUIDE.md` (Phase 4).
- Confirm the `cast` row is EXACTLY 3 frames and clearly depicts **Deploy Trolls**
  (the swarm summon).
- Drop finished files in `public/assets/enemies/`: `boss_troll_farm.png`,
  `boss_troll_farm.json`.
- Audio pairing (`docs/ART_AND_AUDIO_GUIDELINES.md`): buzzing server hum and
  glitchy notification pings, with a chittering swarm burst on the `cast`.

## Integration status

**The engine side is already done** — `EnemyModel` is `Sprite`-based, every state
routes through the sprite-sheet path with a tween fallback, an enemy's atlas key
defaults to its `id`, and `GameScene.createEnemyAnimations()` auto-wires any enemy
atlas that loads. Until the art exists Troll Farm renders the tinted `enemy-base`
placeholder (no broken texture) and still animates all states via tweens.

**To light up the real art, once you've generated the sheet:**
1. Drop `boss_troll_farm.png` + `boss_troll_farm.json` into
   `public/assets/enemies/`.
2. In `GameScene.preload()`, uncomment:
   `this.load.aseprite('boss_troll_farm', '/assets/enemies/boss_troll_farm.png', '/assets/enemies/boss_troll_farm.json');`
   (atlas key defaults to the enemy `id` = `boss_troll_farm`). That's it — the
   states, including the boss `cast`, play from real frames automatically.
