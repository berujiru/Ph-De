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

**The camera.** The battle runs under a **fixed high top-down oblique camera**.
It sits **above and behind the hero rally** and looks down the advance lane
toward the incoming anomaly (enemy) horde. It is tilted — *not* a flat, straight-
down zenith — so you always read bodies, shoulders, weapons, and silhouettes.
Think "drone hovering just behind your own front line."

Because of where that camera sits, the two sides are drawn from **opposite
facings**, and this is what makes the battlefield instantly readable — you are
*behind* your heroes, looking into the *faces* of the enemies bearing down:

| Side | Faces… | Drawn as | You see |
|---|---|---|---|
| **Heroes** | *away* from camera, into the enemies | **TOP-BEHIND** (rear 3/4 high angle) | tops of heads, shoulders, backs |
| **Enemies** | *toward* the camera, at the heroes | **TOP-FRONT** (front 3/4 high angle) | faces, chests, front of the body |

> **Axis note:** the current build is a horizontal scrolling rally — heroes hold
> the rear (left) while the morale shield pushes forward (right) and anomalies
> stream in from ahead. The **rear-hero / front-enemy** rule is *facing-relative*
> and holds no matter which screen axis the march runs along. Draw to the facing,
> not to a screen direction.

**HUD portraits are the exception:** portraits (`*_portrait.png`) are always a
tight **front-facing** headshot/bust (see the face), because they live in the UI,
not on the battlefield.

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

**Example Outcome (Eden):**
![Eden Turnaround Reference](references/eden_base_turnaround.png)

---

## Phase 2: Claude Sprite Generation (The Animation Frames)

Once you have the Base Concept Sheet from Gemini, feed that image into Claude to generate the actual game-ready sprite sheets.

### Important Perspective Rules
Per the **Camera & Perspective Model** above:
- **Heroes** face into the enemy line → drawn **TOP-BEHIND (rear 3/4 high angle)**. We see their heads-from-above, shoulders, and backs.
- **Enemies** face the heroes / the camera → drawn **TOP-FRONT (front 3/4 high angle)**. We see their faces and chests.
- The camera tilt is oblique, never a flat zenith. Never draw flat side profiles or low/ground-level angles.

### State ↔ sprite-sheet mapping (must match the engine)
Each row below is one animation the Phaser model plays via
`setState(...)` (see `src/game/entities/models/UnitModel.ts`). Aseprite tag
names must match these exactly so `createFromAseprite` wires them up:

| Tag | Who | When it plays |
|---|---|---|
| `idle` | both | standing, breathing/menacing in place |
| `march` | both | walk cycle advancing (heroes forward, enemies toward barrier) |
| `attack` | both | basic attack; frame 2 is the clear impact frame |
| `cast` | heroes | signature-skill wind-up pose (pairs with the anime cut-in) |
| `stunned` | enemies | dazed / spinning-stars during freeze or stun CC |
| `celebrate` | both | win pose — heroes raise a fist; anomalies tear at the barrier |
| `defeat` | heroes | morale broken — take a knee (heroes never die) |
| `death` | enemies | one-shot dissolve, then the entity is destroyed |

> Heroes get `idle / march / attack / cast / celebrate / defeat`.
> Enemies get `idle / march / attack / stunned / celebrate / death`.

### The Sprite Sheet Prompt Template (For Claude)

Provide the Base Concept Sheet to Claude and use the following prompt, adjusting whether it is a Hero or an Enemy.

**Prompt for Claude (For Heroes):**
> Attached is the base concept turnaround sheet for our character. I need you to generate a strictly formatted 2D sprite sheet for this character for a top-down auto-battler game.
> 
> **Crucial Perspective:** This character is a Hero. The camera is a high top-down oblique positioned above and BEHIND our own front line, so the hero faces AWAY from us into the enemy. Therefore, **ALL sprites in this sheet must be drawn from a HIGH-ANGLE REAR VIEW (Tilted Back / rear 3/4)**. You must be able to see the top of their head, their shoulders, and their back/body. Do not use a completely flat zenith angle, we need to see the body. (Do NOT draw flat side profiles or low/ground-level angles).
> 
> **Style & Formatting:** Match the reference's exact style. Lay the animations out as horizontal rows, one animation per row, each frame in its own evenly-spaced cell, non-overlapping poses.
> 
> **OUTPUT RULES (critical — image models will otherwise draw these):** Fully **transparent** background (no white fill). Do NOT draw any grid lines, cell borders, boxes, guide lines, or separators. Do NOT render any text, row names, labels, numbers, or captions anywhere. Output ONLY the character art in evenly-spaced **invisible** cells.
> 
> **MANDATORY LAYOUT (Exactly 6 rows, one animation per row, in this top-to-bottom order — do NOT write the row names into the image):**
> 1. **Row 1 — `idle`:** EXACTLY 3 frames, breathing/bouncing in place (Rear View).
> 2. **Row 2 — `march`:** EXACTLY 4 frames, a full walk cycle advancing forward (Rear View).
> 3. **Row 3 — `attack`:** EXACTLY 3 frames of the basic attack [Insert attack, e.g. swinging the ruler]. Frame 2 MUST be a clear impact frame (Rear View).
> 4. **Row 4 — `cast`:** EXACTLY 3 frames winding up the signature skill [Insert skill, e.g. raising the megaphone], building energy (Rear View, dramatic).
> 5. **Row 5 — `celebrate`:** EXACTLY 2 frames of a victory cheer, raised fist / jumping (Rear View, may turn head slightly toward camera).
> 6. **Row 6 — `defeat`:** EXACTLY 2 frames of morale breaking — dropping their tool and taking a knee, slumped (Rear View). Heroes never die; this is exhaustion, not death.
> 
> You must verify that every single frame listed above is present in the final image grid.

**Prompt for Claude (For Enemies):**
> Attached is the base concept turnaround sheet for our character. I need you to generate a strictly formatted 2D sprite sheet for this character for a top-down auto-battler game.
> 
> **Crucial Perspective:** This character is an Enemy (anomaly). The camera is a high top-down oblique above and behind the player's line, so this enemy faces TOWARD the camera as it bears down on the heroes. Therefore, **ALL sprites in this sheet must be drawn from a HIGH-ANGLE FRONT VIEW (Tilted Forward / front 3/4)**. You must be able to see the top of their head, their shoulders, and their chest/front body. Do not use a completely flat zenith angle, we need to see the body. (Do NOT draw flat side profiles or low/ground-level angles).
> 
> **Style & Formatting:** Match the reference's exact style. Lay the animations out as horizontal rows, one animation per row, each frame in its own evenly-spaced cell, non-overlapping poses.
> 
> **OUTPUT RULES (critical — image models will otherwise draw these):** Fully **transparent** background (no white fill). Do NOT draw any grid lines, cell borders, boxes, guide lines, or separators. Do NOT render any text, row names, labels, numbers, or captions anywhere. Output ONLY the character art in evenly-spaced **invisible** cells.
> 
> **MANDATORY LAYOUT (Exactly 5 rows, one animation per row, in this top-to-bottom order — do NOT write the row names into the image):**
> 1. **Row 1 — `march`:** EXACTLY 4 frames of a confident walk cycle advancing toward the viewer (Front View).
> 2. **Row 2 — `attack`:** EXACTLY 3 frames clawing/lunging forward at the barrier. Frame 2 MUST be a clear impact frame (Front View).
> 3. **Row 3 — `stunned`:** EXACTLY 2 frames looking dazed with spinning stars above their head (Front View).
> 4. **Row 4 — `celebrate`:** EXACTLY 2 frames of the anomaly overrunning the line — snarling and tearing forward in triumph (Front View).
> 5. **Row 5 — `death`:** EXACTLY 3 frames dissolving into [Insert death effect, e.g. paperwork and mud] (Front View).
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

- [ ] **Perspective Check:** Are Hero sprites strictly TOP-BEHIND (rear 3/4, facing *away* from camera)? Are Enemy sprites TOP-FRONT (front 3/4, facing *toward* camera)? No flat zenith, no side profiles.
- [ ] **State Completeness:** Every required row present and correctly labelled — Heroes: `idle / march / attack / cast / celebrate / defeat`. Enemies: `march / attack / stunned / celebrate / death`. Tag names must match `UnitModel` states exactly.
- [ ] **Animation Frame Count:** Count the individual frames. Does the sheet have the exact number of frames requested per row? (e.g., exactly 4 march frames, exactly 3 attack frames).
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
