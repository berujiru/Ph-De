# Wang-Wang — Boss Art Prompt Pack

Ready-to-paste prompts for generating **Wang-Wang** (`boss_wang_wang`), an Act
boss anomaly. This pack **mirrors the enemy template**
(`docs/references/grunt_prompt_pack.md`) with the **boss differences**:

- Drawn **larger, more detailed, and more grotesque** than a minion.
- Phase 2 has **6 rows** — a 6th **`cast`** row (EXACTLY 3 frames) is inserted
  between `attack` and `stunned`, showing the boss channelling its `activeSkill`
  **VIP Convoy** (`sirenBurst`).
- Still **TOP-FRONT** (high-angle front 3/4), still **no anime skill cut-in**
  (that's a hero-only feature — see `docs/CHARACTER_VISUAL_PROMPT_GUIDE.md`).

> Run these in an image-capable Claude/Gemini (not the coding CLI). Always
> **attach the previous phase's output** as reference before generating the next.

**Binding rule:** bosses personify a *category of PH governance anomaly* — never
a real official, party, or contractor. This one is **VIP entitlement (the
"wang-wang" siren that forces everyone off the road)**. Design a grotesque
concept-creature, not a person (`docs/WORLD_AND_HEROES.md`).

---

## Wang-Wang Visual Bible (locked — keep identical across every phase)

No portrait exists — this bible is **synthesized** from its role (a melee rusher
boss whose skill grants **massive speed bursts from convoy sirens, ignoring
slows**) and its `balance.ts` color anchor `#ef4444` (siren-emergency red). Do not
drift:

- **What:** Wang-Wang — a hurtling, arrogant **convoy-creature**: a blacked-out
  armored SUV grille fused to a swollen bureaucrat torso, a screaming
  **emergency-siren light for a head**, forever barreling forward as if the road
  belongs only to it. VIP entitlement made monstrous. Grotesque, brash, loud — a
  concept-creature, not a human, and no real person.
- **Body:** a broad torso built from a **blacked-out armored SUV front end** —
  chrome bull-bar grille as a chest, tinted-glass shoulders, exhaust-pipe arms
  belching smoke, spinning red-and-blue **siren dome for a head** blaring, a
  fluttering fake "official convoy" pennant.
- **Signature read-at-a-glance cue:** the **blaring red-blue siren-dome head atop
  a blacked-out SUV-grille body** — its #1 silhouette read, and it must survive
  every angle.
- **Face:** the siren dome itself is the "face" — a spinning cyclopean light,
  mouth a chrome grille bared like gritted teeth, arrogant and blinding.
- **Style:** High-contrast cel-shaded vector art, flat colors, bold clean outer
  strokes, 2D mobile game asset (Persona 5 UI pop × Hades silhouette), plain
  solid/white background, isolated character. Reads clearly at small size even
  though it is boss-scale.
- **Palette:** siren-emergency red (anchor `#ef4444`), warning blue, blacked-out
  tint black, chrome grille silver, exhaust-smoke grey. (Any engine tint is only
  a fallback for missing sprites — the real sheet uses its true colors, no flat
  wash.)

---

## Phase 1 — Base Concept + Camera Angles (do this first)

**Prompt:**
> Generate a comprehensive 2D character turnaround reference sheet for a mobile
> game BOSS enemy creature named Wang-Wang.
>
> **Creature:** A hurtling arrogant convoy-creature — a broad torso built from a
> **blacked-out armored SUV front end** (chrome bull-bar grille as a chest,
> tinted-glass shoulders), **exhaust-pipe arms belching smoke**, a spinning
> red-and-blue **emergency-siren dome for a head** blaring light, and a fluttering
> fake "official convoy" pennant. It barrels forward as if the road belongs only
> to it. Grotesque, brash, BOSS-SCALE (much larger and more detailed than a
> minion) — a concept-creature, not a human, and not any real person.
>
> **Style:** High-contrast cel-shaded vector art, flat colors, bold clean outer
> strokes, 2D mobile game asset (Persona 5 UI pop crossed with Hades
> silhouettes). Plain solid background, isolated creature.
>
> **Required Layout:** Show the exact same creature in a row from these angles.
> Proportions, the SUV-grille body, the siren-dome head, and the exhaust-pipe arms
> must remain identical in every view:
> 1. **Front View:** looking directly at the camera.
> 2. **Side Profile:** 90-degree turn.
> 3. **Rear View (straight back):** facing away — we see its back, exhaust pipes,
>    and the convoy pennant trailing.
> 4. **TOP-FRONT (high-angle front 3/4) — THE GAMEPLAY VIEW:** camera high above
>    and in front, tilted (NOT flat zenith). We see the top of the siren dome plus
>    the grille "face," the SUV chest, and its exhaust-pipe arms as it barrels
>    toward the viewer. This is the angle its in-game sprites are drawn from —
>    make it clean and clear.
> 5. **TOP-BEHIND (high-angle rear 3/4):** camera high above and behind, tilted;
>    top of the siren dome, shoulders, and exhaust-pipe back.
>
> Ensure the blaring siren-dome head, the chrome SUV-grille chest, the
> exhaust-pipe arms, and the convoy pennant are clearly readable in all five
> views.

*Save the result as `docs/references/boss_wang_wang_base_turnaround.png`. This is
the base reference for the next phase.*

---

## Phase 2 — Animated Boss Sprite Sheet (TOP-FRONT, 6 rows)

**Attach `boss_wang_wang_base_turnaround.png` first**, then:

> Attached is the base turnaround sheet for the Wang-Wang BOSS anomaly. Generate a
> strictly formatted 2D sprite sheet for a top-down auto-battler.
>
> **Crucial Perspective:** Wang-Wang is an Enemy boss. The camera is a high
> top-down oblique above and behind the player's line, so it faces TOWARD the
> camera as it bears down on the barrier. **ALL frames must be drawn from a
> HIGH-ANGLE FRONT VIEW (top-front, front 3/4)** — top of the siren dome, plus the
> grille "face," the SUV chest, and its exhaust-pipe arms. Not a flat zenith, no
> side profiles, no low angles. Draw it BOSS-SCALE: larger, more detailed, and
> more menacing than a minion.
>
> **Style & Formatting:** Match the cel-shaded vector style of the reference
> exactly (SUV-grille body, blaring siren-dome head, exhaust-pipe arms, convoy
> pennant). Lay out as horizontal rows, one animation per row, each frame in its own evenly-spaced cell, non-overlapping, with consistent size and centering.
>
> **OUTPUT RULES (critical — the last generation drew these by mistake):** Fully **transparent** background — NO white fill. Do NOT draw any grid lines, cell borders, boxes, guide lines, or separators. Do NOT render any text, row names, labels, numbers, or captions anywhere in the image. Output ONLY the character art, arranged in evenly-spaced **invisible** cells.
>
> **MANDATORY LAYOUT — exactly 6 rows, in this exact top-to-bottom order:**
> 1. **`march`** — EXACTLY 4 frames: a fast, aggressive charge cycle barreling
>    toward the viewer, exhaust pipes belching smoke (front view).
> 2. **`attack`** — EXACTLY 3 frames: **ramming its chrome grille chest into the
>    barrier**, sparks and smoke bursting. Frame 2 is the clear impact frame
>    (front view).
> 3. **`cast`** — EXACTLY 3 frames: channelling its signature skill **VIP Convoy**
>    — the siren-dome head **flaring blinding red-and-blue and blasting sound
>    rings** as it revs up a massive speed burst (radiating siren waves, wheels
>    spinning). This is the telegraphed boss skill; make it loud and dramatic
>    (front view).
> 4. **`stunned`** — EXACTLY 2 frames: dazed, siren sputtering and dimming,
>    **spinning stars / flickering warning icons** circling its dome, mid-stumble
>    (front view).
> 5. **`celebrate`** — EXACTLY 2 frames: it overran the line — siren blazing in
>    triumph and **peeling forward with a smoke burnout** (front view). Plays when
>    the player loses.
> 6. **`death`** — EXACTLY 3 frames: **the siren shattering and the SUV body
>    crumpling apart in a burst of smoke and sparks**, pennant fluttering down
>    (front view).
>
> **SELF-CHECK — before returning the image, verify each item; if any FAILS, fix it and regenerate:**
> 1. **Consistent view** — every frame in every row uses the SAME camera angle stated above (heroes: rear / top-behind — we see the back; enemies: front / top-front — we see the face). No side profiles, no switching between front and back between frames.
> 2. **Frame counts** — each row has EXACTLY the number of frames listed for that row above.
> 3. **Clean output** — fully transparent background; NO grid lines, borders, boxes, text, labels, numbers, or captions anywhere.
> 4. **On-model & separated** — outfit / hair / props identical in every frame; poses do not touch or overlap.

*Export from Aseprite as `boss_wang_wang.png` + `boss_wang_wang.json` (JSON Hash or
Array), with the tag names above spelled exactly: `march attack cast stunned
celebrate death`.*

---

## Export & QA reminders

- Transparent background, consistent frame size, no clipped arms/pennant.
- Tag names MUST match the engine states 1:1 (`march attack cast stunned
  celebrate death`) — see the checklist in
  `docs/CHARACTER_VISUAL_PROMPT_GUIDE.md` (Phase 4).
- Confirm the `cast` row is EXACTLY 3 frames and clearly depicts **VIP Convoy**
  (the siren burst).
- Drop finished files in `public/assets/enemies/`: `boss_wang_wang.png`,
  `boss_wang_wang.json`.
- Audio pairing (`docs/ART_AND_AUDIO_GUIDELINES.md`): roaring engine and blaring
  "wang-wang" siren, with a piercing siren-and-horn blast on the `cast`.

## Integration status

**The engine side is already done** — `EnemyModel` is `Sprite`-based, every state
routes through the sprite-sheet path with a tween fallback, an enemy's atlas key
defaults to its `id`, and `GameScene.createEnemyAnimations()` auto-wires any enemy
atlas that loads. Until the art exists Wang-Wang renders the tinted `enemy-base`
placeholder (no broken texture) and still animates all states via tweens.

**To light up the real art, once you've generated the sheet:**
1. Drop `boss_wang_wang.png` + `boss_wang_wang.json` into `public/assets/enemies/`.
2. In `GameScene.preload()`, uncomment:
   `this.load.aseprite('boss_wang_wang', '/assets/enemies/boss_wang_wang.png', '/assets/enemies/boss_wang_wang.json');`
   (atlas key defaults to the enemy `id` = `boss_wang_wang`). That's it — the
   states, including the boss `cast`, play from real frames automatically.
