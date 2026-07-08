# Character Visual Prompt Guide: The AI Workflow

This guide details the specialized workflow for creating character assets in **Project Ph-De (First Ripple)** using two AI agents in tandem. 

**The Workflow:**
1. **Phase 1 (Gemini):** Generate a foundational "Complete Angle Concept Sheet" for the character.
2. **Phase 2 (Claude):** Use the concept sheet as reference to generate the specific, animated sprite sheets required for the game engine.

---

## Camera & Perspective Model (READ FIRST — canonical)

This section is the **single source of truth** for how every gameplay sprite is
framed. All other docs (`ART_AND_AUDIO_GUIDELINES.md`, `ADDING_HEROES.md`) and
the Phaser model layer (`src/game/entities/models/`) defer to it.

> **THE RULE (owner decision — keep it simple):**
> **Heroes are drawn from BEHIND (back view). Enemies are drawn from the FRONT
> (front view).** Both at a high angle (tilted slightly from above so we see
> the top of the head — *not* a flat, stiff, eye-level elevation), on a
> transparent background. That's the whole convention.

> **Prompt-pack status (2026-07):** the per-character and per-enemy prompt packs
> that previously lived in `docs/references/` have been removed and are being
> **re-authored for the landscape pivot** in a future iteration. This guide
> remains the authoritative workflow; regenerate packs from it when that work
> begins.

**The battlefield is landscape (16:9).** The rally holds the near (left) end of a
horizontal lane; anomalies stream in from the far (right) end and bear down on
the barrier.

**The camera.** The battle runs under a **fixed high top-down oblique camera**.
It sits **above and behind the hero rally** and looks down the landscape advance
lane toward the incoming anomaly (enemy) horde. It is tilted — *not* a flat,
straight-down zenith — so you always read bodies, shoulders, weapons, and
silhouettes. Think "drone hovering just behind your own front line."

Because of where that camera sits, the two sides are drawn from **opposite
facings**, and this is what makes the battlefield instantly readable — you are
*behind* your heroes, looking into the *faces* of the enemies bearing down:

| Side | Faces… | Drawn as | You see |
|---|---|---|---|
| **Heroes** | *away* from camera, into the enemies | **TOP-BEHIND** (high-angle back view) | tops of heads, shoulders, backs |
| **Enemies** | *toward* the camera, at the heroes | **TOP-FRONT** (high-angle front view) | faces, chests, front of the body |

> **Axis note:** the build is a **landscape** horizontal-scrolling rally — heroes
> hold the rear (left) while the morale shield pushes forward (right) and
> anomalies stream in from ahead. The **rear-hero / front-enemy** rule is
> *facing-relative* and holds no matter which screen axis the march runs along.
> Draw to the facing, not to a screen direction.

**HUD portraits are the exception:** portraits (`*_portrait.png`) are always a
tight **front-facing** headshot/bust (see the face), because they live in the UI,
not on the battlefield.

---

## Animation Standards (READ SECOND — canonical frame counts, timing & sizing)

This is the **single source of truth for how many frames each animation gets**,
how fast it plays, and how the sheet must be laid out. The Phase 2 prompt
templates below simply apply these numbers — if you ever change a count, change
it here first and keep the templates in sync.

### How the engine plays a sheet (don't fight these rules)

- **Fixed 10 FPS.** Every sheet animation is created at `frameRate: 10`
  (`GameScene.createAtlasAnimations`). Aseprite's own per-frame durations are
  **ignored** — a row's on-screen length is purely `frameCount ÷ 10` seconds.
  So an 8-frame walk = 0.8 s per loop; a 10-frame cast = 1.0 s.
- **Frame count is per-motion, never below 6 (smoothness floor).** Don't ship
  2–4-frame rows — at 10 FPS they pop and read choppy. Pick the count the motion
  needs: **6** for simple repetitive loops (stunned, celebrate), **8** for full
  locomotion and anticipation→impact→recovery actions (idle, march, attack,
  death), **10** for dramatic build-ups (hero/boss `cast`, skill VFX). Use the
  per-row counts in the tables below; err smoother, not snappier.
- **Loop vs one-shot is decided by the engine, not the sheet.** Persistent
  states loop forever (`idle`, `march`, `stunned`, `celebrate`, `defeat`);
  one-shot states play once and then hand control back (`attack`, `cast`,
  `death`). Author every row as a clean, seamless cycle anyway.
- **Tag name = state name, exactly.** Aseprite frame-tag names must be the
  lowercase state (`idle`, `march`, `attack`, `cast`, `stunned`, `celebrate`,
  `defeat`, `death`). The model plays `${spriteKey}-${tag}`; a typo = no
  animation. `walk` and `run` are **not** separate rows — both play the single
  `march` cycle (run just runs it ~1.5× faster).
- **One row per state, one frame per cell**, evenly spaced, non-overlapping,
  transparent background, no baked grid/labels (see Phase 4).

### Heroes — ONE combined SKIN sheet (+ a separate cut-in)

Hero battle art is a **skin**: one combined spritesheet per skin holding every
gameplay state **`idle / march / attack / cast`** *plus one dedicated
front-facing portrait cell*, wired through a config in `src/game/data/skins.ts`
(`HeroSkin`: per-state `{ from, frames, frameRate? }` linear ranges, plus
`columns` / `totalFrames` / `portraitFrame` for the UI's CSS portrait crop).
The animated skill cut-in stays **its own isolated sheet** — never part of a
skin. Only `celebrate`, `defeat`, and `stunned` fall back to engine tween
placeholders, so **do not** put those in a skin sheet.

| Section (state) | Frames | Play | Notes |
|---|---|---|---|
| `idle`   | **8**  | loop     | Breathing/bounce in place. Seamless (frame 8 → frame 1). |
| `march`  | **8–16** | loop   | Walk cycle advancing toward the enemy line. Seamless. `run` reuses it ~1.5× faster. Plays only while there's no enemy in range (an engaged hero holds `idle`). |
| `attack` | **8–24** | one-shot | Basic attack. A clear impact/release frame ~45% in (wind-up → impact → follow-through). |
| `cast`   | **10–24** | one-shot | Signature-skill wind-up, energy building across the ramp (pairs with the cut-in, and plays *after* the cut-in clears). |
| portrait | **1**  | static   | Front-facing head/bust cell — the UI crops this for Archive cards, drop cards, and previews. The one front-view exception inside an otherwise top-behind sheet. |

Because ranges are declared in the skin config (`from` + `frames`), states can
span multiple rows and don't need to fill rows exactly — but keep the grid
row-major, uniform cells, and the sheet **≤ 4096 px per side** (mobile GL
texture limit). Reference layout (Eden default, 256px cells, 8 columns):
idle row 0, march rows 1–2, attack rows 3–5, cast rows 6–8, portrait = first
cell of row 9.

> **Idle fallback:** if a skin ships `attack` but no `idle` range, the engine
> uses the **first frame of `attack`** as the resting pose (a neutral ready
> stance) instead of a walk frame or the placeholder. So `idle` is strongly
> recommended but not strictly required as long as `attack` exists.
>
> **Timing note:** loops default to 10 FPS unless the skin config sets a
> `frameRate`; a hero's `attack` clip is additionally time-scaled to its
> `attackRateMs` (a fast attacker's swing speeds up), and the cut-in sheet is
> spread across `cutInDurationMs` — so author clean, evenly paced frames and
> let the engine set the rate.
>
> **Skins:** every skin is one such sheet + one config entry in
> `HERO_SKINS`; players equip them in the Archive and the choice (persisted in
> localStorage) applies on the next battle. The cut-in is shared across skins.

### Enemies — DRAWN sheet is 5 rows (+1 for casters)

| Row (tag) | Frames | Play | Who | Notes |
|---|---|---|---|---|
| `march`     | **8**  | loop     | all      | Walk cycle advancing toward the rally. Seamless. |
| `attack`    | **8**  | one-shot | all      | Clawing/lunging at the barrier. **Frame 4 = impact.** |
| `stunned`   | **6**  | loop     | all      | Simple dazed / spinning-stars loop during freeze or stun CC. |
| `celebrate` | **6**  | loop     | all      | Short triumph loop — overrunning the line (plays when the player loses). |
| `death`     | **8**  | one-shot | all      | Dissolve/shatter fading out, then the entity is destroyed. |
| `cast`      | **10** | one-shot | **bosses / casters only** | In-world channel pose for a boss skill — a wind-up, *not* a portrait. Minions never cast. |

### Skill VFX effect sheet (the thing the skill spawns on the field)

Separate from the character sheet. One row, plays **once** at 10 FPS.

| Row (tag) | Frames | Play | Beats |
|---|---|---|---|
| `fx` | **10** | one-shot (~1.0 s) | 1–3 anticipation/telegraph → 4–5 strike (**frame 4 = peak**) → 6–10 dissipate. |

Compose every skill VFX as **two readable parts under the oblique camera**: a
**flat ground element** (ring/scorch/wave lying on the lane) *plus* a **vertical
flourish** (uplift/column/spray) so it reads at a glance. Transparent
background, sized to the skill's gameplay radius, no character in the sheet.

### Skill cut-in (the anime super-move splash)

Large key-art, **not** a 10 FPS sprite row — the cut-in panel slides in, holds,
and slides out (~1.1 s total in `SkillCutIn.ts`). Author **exactly 3 poses**:

| Pose | Purpose |
|---|---|
| 1 — Anticipation | Winding up: deep breath, dramatic shadow. |
| 2 — Action/Shout | Climax: mouth wide, weapon/tool foreshortened toward camera. |
| 3 — Resolution   | Cool post-action beat, exhaling / resetting stance. |

Front-facing and dramatic (halftone + speed lines), high-res (~1024 px tall),
on a transparent or paneled background. These are the exception to the
top-behind rule — a cut-in is cinematic UI, so we see the hero's face.

### Frame sizing & layout (applies to every character/enemy sheet)

- **Square, uniform cells.** Use one consistent cell size for the whole sheet
  (e.g. **256×256**). The engine scales the body down (heroes to ~64 px tall,
  preserving aspect), so oversized square cells are safe and keep enemies from
  being squished.
- **Consistent anchor across a row.** Keep the character's centre/feet in the
  same spot every frame so it doesn't jitter when the loop plays; let the
  *pose*, not the *placement*, carry the motion.
- **Fill ~80–90% of the cell**, nothing clipped by the edge, poses fully
  separated so each cell slices cleanly.

---

## Phase 1: Gemini Concept Generation (The Base Model)

Before generating sprites, we need a consistent character reference that shows all angles. You will prompt Gemini (using its image generation capabilities) to create a turnaround sheet.

### Art Style Keywords
The canonical hero look is **anime-style cel-shading** (owner decision) — dynamic
anime key-art energy with the readability of bold, flat, mobile-first shapes.
Always include these keywords in the Gemini prompt to match the game's aesthetic:
> `High-contrast anime-style cel-shading, expressive anime faces and proportions, flat cel-shaded colors, bold clean outer strokes, 2D mobile game asset, plain white background, isolated character.`

**Heroes** are heroic-anime; **enemies** use the same anime cel-shaded language but
lean **grotesque/exaggerated**. Keep it bold and readable at small mobile sizes —
anime *energy*, not busy detail.

### The Complete Angle Prompt Template (For Gemini)
Use this prompt template to generate the base concept sheet. Fill in the bracketed information.

**Prompt for Gemini:**
> Generate a comprehensive 2D character turnaround reference sheet for a mobile game. 
> 
> **Character Details:** [Insert Archetype, e.g., A stressed Filipino Teacher holding a wooden ruler and a megaphone].
> **Color Palette:** [Insert Colors, e.g., Deep slate blue uniform, red accents, gold whistle].
> **Style:** High-contrast anime-style cel-shading, expressive anime faces and proportions, flat colors, bold clean outer strokes, dynamic anime key-art energy crossed with Persona 5 UI pop and Hades silhouettes. Plain solid background.
> 
> **Required Layout:** Show the exact same character standing in a row from four specific angles:
> 1. **Front View:** Looking directly at the camera.
> 2. **Side Profile:** 90-degree turn.
> 3. **Rear View (Straight Back):** Looking completely away from the camera.
> 4. **TOP-DOWN HIGH ANGLE (Tilted):** The camera is positioned high above but tilted slightly to show the body. You must be able to see the top of their head, shoulders, and their upper torso, rather than a completely flat straight-down angle.
> 
> Ensure the clothing, proportions, and props remain identical across all four views.

*Save the generated image. This is your "Base Concept Sheet."*

**Example Outcome (Eden):** _(worked example pending — the old reference art and
prompt packs were removed for the landscape pivot and will be re-authored next
iteration.)_

---

## Phase 2: Claude Sprite Generation (The Animation Frames)

Once you have the Base Concept Sheet from Gemini, feed that image into Claude to generate the actual game-ready sprite sheets.

### Important Perspective Rules
Per the **Camera & Perspective Model** above:
- **Heroes** face into the enemy line → drawn **TOP-BEHIND (high-angle back view)**. We see their heads-from-above, shoulders, and backs.
- **Enemies** face the heroes / the camera → drawn **TOP-FRONT (high-angle front view)**. We see their faces and chests.
- The camera tilt is oblique, never a flat zenith. Never draw flat side profiles or low/ground-level angles.

### State ↔ sprite-sheet mapping (must match the engine)
Each row below is one animation the Phaser model plays via
`setState(...)` (see `src/game/entities/models/UnitModel.ts`). Aseprite tag
names must match these exactly so the engine wires them up
(`GameScene.createAtlasAnimations` builds `${spriteKey}-${tag}`). **Frame counts
and timing for every row live in the [Animation Standards](#animation-standards-read-second--canonical-frame-counts-timing--sizing)
section above** — this table is just *what each tag is*.

| Tag | Who | When it plays |
|---|---|---|
| `idle` | both | standing, breathing/menacing in place |
| `march` | both | walk cycle advancing (heroes forward, enemies toward barrier) |
| `attack` | both | basic attack; frame 4 is the clear impact frame |
| `cast` | heroes + bosses | signature-skill wind-up (heroes: pairs with the anime cut-in; bosses: in-world channel pose) |
| `stunned` | enemies | dazed / spinning-stars during freeze or stun CC |
| `celebrate` | both | win pose — heroes raise a fist; anomalies tear at the barrier |
| `defeat` | heroes | morale broken — take a knee (heroes never die) |
| `death` | enemies | one-shot dissolve, then the entity is destroyed |

> **Heroes get ONE combined skin sheet of `idle / march / attack / cast` + a
> front-face portrait cell** (config in `src/game/data/skins.ts`), plus their
> skill cut-in as a separate sheet. `celebrate`, `defeat`, and `stunned` still
> use the built-in tween placeholder — they are **not drawn**, so don't put
> them in a skin sheet. If `idle` is omitted, the engine rests on the first
> frame of `attack`.
> **Enemies get `march / attack / stunned / celebrate / death`** (bosses/casters
> add `cast`). `idle` falls back to the tween/`march` placeholder, so it is not a
> required row on an enemy sheet.

### The Sprite Sheet Prompt Template (For Claude)

Provide the Base Concept Sheet to Claude and use the following prompt, adjusting whether it is a Hero or an Enemy.

**Prompt for Claude (For Heroes):**
> Attached is the base concept turnaround sheet for our character. I need you to generate a strictly formatted 2D sprite sheet for this character for a top-down auto-battler game.
> 
> **Crucial Perspective:** This character is a Hero. The camera is a high top-down oblique positioned above and BEHIND our own front line, so the hero faces AWAY from us into the enemy. Therefore, **ALL sprites in this sheet must be drawn from a HIGH-ANGLE REAR VIEW (Tilted Back / back view)**. You must be able to see the top of their head, their shoulders, and their back/body. Do not use a completely flat zenith angle, we need to see the body. (Do NOT draw flat side profiles or low/ground-level angles).
> 
> **Style & Formatting:** Match the reference's exact style. Lay the animations out as horizontal rows, one animation per row, each frame in its own evenly-spaced cell, non-overlapping poses.
> 
> **OUTPUT RULES (critical — image models will otherwise draw these):** Fully **transparent** background (no white fill). Do NOT draw any grid lines, cell borders, boxes, guide lines, or separators. Do NOT render any text, row names, labels, numbers, or captions anywhere. Output ONLY the character art in evenly-spaced **invisible** cells.
> 
> **MANDATORY LAYOUT (Exactly 4 rows, one animation per row, in this top-to-bottom order — do NOT write the row names into the image):**
> 1. **Row 1 — `idle`:** EXACTLY 8 frames, breathing/bouncing in place, a smooth seamless loop (Back View).
> 2. **Row 2 — `march`:** EXACTLY 8 frames, a seamless walk cycle advancing forward toward the enemy line (Back View).
> 3. **Row 3 — `attack`:** EXACTLY 8 frames of the basic attack [Insert attack, e.g. swinging the ruler] — wind-up (frames 1–3), impact (frame 4 MUST be a clear impact frame), follow-through (frames 5–8) (Back View).
> 4. **Row 4 — `cast`:** EXACTLY 10 frames winding up the signature skill [Insert skill, e.g. raising the megaphone], energy building steadily across the frames (Back View, dramatic).
> 
> You must verify that every single frame listed above is present in the final image grid.
> (Heroes don't draw `celebrate` / `defeat` / `stunned` — those use engine placeholders. The skill cut-in is a separate high-res sheet, not a row here.)

**Prompt for Claude (For Enemies):**
> Attached is the base concept turnaround sheet for our character. I need you to generate a strictly formatted 2D sprite sheet for this character for a top-down auto-battler game.
> 
> **Crucial Perspective:** This character is an Enemy (anomaly). The camera is a high top-down oblique above and behind the player's line, so this enemy faces TOWARD the camera as it bears down on the heroes. Therefore, **ALL sprites in this sheet must be drawn from a HIGH-ANGLE FRONT VIEW (Tilted Forward / front view)**. You must be able to see the top of their head, their shoulders, and their chest/front body. Do not use a completely flat zenith angle, we need to see the body. (Do NOT draw flat side profiles or low/ground-level angles).
> 
> **Style & Formatting:** Match the reference's exact style. Lay the animations out as horizontal rows, one animation per row, each frame in its own evenly-spaced cell, non-overlapping poses.
> 
> **OUTPUT RULES (critical — image models will otherwise draw these):** Fully **transparent** background (no white fill). Do NOT draw any grid lines, cell borders, boxes, guide lines, or separators. Do NOT render any text, row names, labels, numbers, or captions anywhere. Output ONLY the character art in evenly-spaced **invisible** cells.
> 
> **MANDATORY LAYOUT (Exactly 5 rows, one animation per row, in this top-to-bottom order — do NOT write the row names into the image):**
> 1. **Row 1 — `march`:** EXACTLY 8 frames of a confident walk cycle advancing toward the viewer, a smooth seamless loop (Front View).
> 2. **Row 2 — `attack`:** EXACTLY 8 frames clawing/lunging forward at the barrier — wind-up (1–3), impact (frame 4 MUST be a clear impact frame), recovery (5–8) (Front View).
> 3. **Row 3 — `stunned`:** EXACTLY 6 frames looking dazed with spinning stars above their head, a smooth loop (Front View).
> 4. **Row 4 — `celebrate`:** EXACTLY 6 frames of the anomaly overrunning the line — snarling and tearing forward in triumph, looping (Front View).
> 5. **Row 5 — `death`:** EXACTLY 8 frames dissolving into [Insert death effect, e.g. paperwork and mud] (Front View).
> (Bosses/casters add a 6th row — **`cast`: EXACTLY 10 frames** of the boss channelling its skill.)
> 
> You must verify that every single frame listed above is present in the final image grid.

---

## Phase 3: Anime-Style Skill Cut-Ins (Optional)

If generating the 2D Ultimate Skill cut-in for a Hero, you can use Claude to generate these using the Gemini concept sheet as reference.

**Prompt for Claude (Cut-In):**
> Using the attached character reference, generate a large, high-resolution 2D portrait sequence for a dramatic "Ultimate Skill" cut-in.
> 
> **Style:** Dramatic anime action shot, intense lighting, comic-book halftone overlays, dynamic speed lines in the background. Close up on the upper body and face.
> 
> Please generate 3 separate poses:
> 1. **Anticipation:** Winding up the attack, deep breath, dramatic shadow.
> 2. **Action/Shout:** The climax of the move, mouth wide open screaming, dynamic foreshortening of the weapon/tool toward the camera.
> 3. **Resolution:** A cool post-action pose, exhaling, or resetting stance.

---

## Phase 4: QA & Integration Checklist

Since AI image generators can sometimes hallucinate or skip frames, QA and developers MUST verify the generated sprite sheet against this checklist before slicing it in Aseprite:

- [ ] **Perspective Check:** Are Hero sprites strictly TOP-BEHIND (back view, facing *away* from camera)? Are Enemy sprites TOP-FRONT (front view, facing *toward* camera)? No flat zenith, no side profiles.
- [ ] **State Completeness:** Every required row present and correctly labelled — Heroes: `idle / march / attack / cast` (+ a separate skill cut-in sheet; `idle` may be dropped only if `attack` exists, since the engine rests on `attack`'s first frame). Enemies: `march / attack / stunned / celebrate / death` (bosses/casters add `cast`). Tag names must match `UnitModel` states exactly.
- [ ] **Animation Frame Count:** Count the individual frames. Does every row match its per-row count from the *Animation Standards* table (6/8/10 by motion — **never below 6**)? Under-frame rows look choppy — regenerate them.
- [ ] **Impact Frame:** Does the Attack row have a clear, distinct frame where the weapon hits the target or the projectile is released?
- [ ] **No baked-in grid/labels/background:** The sheet must be character art ONLY on a transparent background — **no drawn grid lines, cell borders, row-name text, numbers, or a white fill**. Image models love to draw these; if present, re-generate with the OUTPUT RULES (they can't be reliably erased). This is the single most common failure.
- [ ] **Clean Silhouettes:** Are the character poses overlapping? (If yes, it will be impossible to slice. Prompt the AI to space them out).
- [ ] **Consistency:** Did the character's colors or clothing randomly change in one of the frames?
- [ ] **Cropping:** Are any of the character's limbs or weapons cut off by the edge of the generated image bounds?

### Make the model QA itself (two layers)

Image models follow a checklist far better when you make them *self-verify*. Two
layers, both already built into the packs:

**1. Baked-in self-check (automatic).** Every Phase 2 prompt now ends with a
`SELF-CHECK` block telling the model to verify view-consistency, frame counts,
clean transparent output, and on-model separation *before returning the image,
and regenerate if any item fails*. You don't add anything — it's in the prompt.

**2. Review pass (do this after it generates).** Vision models like Gemini can
critique their own output. In a **new message, attach the generated sheet** and
paste:

> You are a strict sprite-sheet QA reviewer. Review the attached sheet against
> this checklist and reply with **PASS/FAIL for each item** plus a one-line
> reason. Then, if anything FAILED, **regenerate a corrected version** that fixes
> only those issues while keeping everything that passed.
>
> 1. **View consistency** — is EVERY frame the same camera angle? (heroes:
>    top-behind/rear, we see the back; enemies: top-front, we see the face). No
>    side profiles, no frames that flip to face the camera.
> 2. **Frame counts** — does each row have exactly the required number of frames?
> 3. **Clean output** — fully transparent background, and absolutely NO grid
>    lines, borders, boxes, text, labels, or numbers?
> 4. **On-model** — same outfit/hair/props/colors in every frame?
> 5. **No overlap / no cropping** — poses separated, nothing clipped by the edges?

This catches the two things models most often botch — **perspective drift** (a
side-view march, a front-facing attack) and **stray grids/labels** — and lets the
model fix them without you re-typing the whole prompt.
