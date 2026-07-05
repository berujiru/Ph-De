# Character Visual Prompt Guide: The AI Workflow

This guide details the specialized workflow for creating character assets in **Project Ph-De (First Ripple)** using two AI agents in tandem. 

**The Workflow:**
1. **Phase 1 (Gemini):** Generate a foundational "Complete Angle Concept Sheet" for the character.
2. **Phase 2 (Claude):** Use the concept sheet as reference to generate the specific, animated sprite sheets required for the game engine.

---

## Phase 1: Gemini Concept Generation (The Base Model)

Before generating sprites, we need a consistent character reference that shows all angles. You will prompt Gemini (using its image generation capabilities) to create a turnaround sheet.

### Art Style Keywords
Always include these keywords in the Gemini prompt to match the game's aesthetic:
> `High-contrast cel-shaded vector art, flat colors, bold clean outer strokes, 2D mobile game asset, plain white background, isolated character.`

### The Complete Angle Prompt Template (For Gemini)
Use this prompt template to generate the base concept sheet. Fill in the bracketed information.

**Prompt for Gemini:**
> Generate a comprehensive 2D character turnaround reference sheet for a mobile game. 
> 
> **Character Details:** [Insert Archetype, e.g., A stressed Filipino Teacher holding a wooden ruler and a megaphone].
> **Color Palette:** [Insert Colors, e.g., Deep slate blue uniform, red accents, gold whistle].
> **Style:** High-contrast cel-shaded vector art, flat colors, bold clean outer strokes, similar to Persona 5 UI crossed with Hades silhouettes. Plain solid background.
> 
> **Required Layout:** Show the exact same character standing in a row from four specific angles:
> 1. **Front View:** Looking directly at the camera.
> 2. **Side Profile:** 90-degree turn.
> 3. **Rear View (Straight Back):** Looking completely away from the camera.
> 4. **Top-Down Oblique (3/4 Isometric):** Looking down at the character from a high angle, showing the top of their head and shoulders, standing on a ground plane that recedes upward.
> 
> Ensure the clothing, proportions, and props remain identical across all four views.

*Save the generated image. This is your "Base Concept Sheet."*

**Example Outcome (Eden):**
![Eden Turnaround Reference](references/eden_base_turnaround.png)

---

## Phase 2: Claude Sprite Generation (The Animation Frames)

Once you have the Base Concept Sheet from Gemini, feed that image into Claude to generate the actual game-ready sprite sheets.

### Important Perspective Rules
- **Heroes** always march UP. Their sprites must be drawn from the **Rear / 3/4 Back View**.
- **Enemies** always march DOWN. Their sprites must be drawn from the **Front / 3/4 Front View**.

### The Sprite Sheet Prompt Template (For Claude)

Provide the Base Concept Sheet to Claude and use the following prompt, adjusting whether it is a Hero or an Enemy.

**Prompt for Claude (For Heroes):**
> Attached is the base concept turnaround sheet for our character. I need you to generate a 2D sprite sheet for this character for a vertical auto-battler game.
> 
> **Crucial Perspective:** This character is a Hero, which means they march UP the screen. Therefore, **ALL sprites in this sheet must be drawn from the Rear / 3/4 Back View** (use the Rear and Top-Down Oblique views from the reference sheet).
> 
> **Style:** Match the cel-shaded vector art style of the reference exactly. Use a transparent background.
> 
> Generate a sprite sheet containing the following frames arranged in rows:
> 1. **Row 1 (Idle):** 3 frames of the character breathing/bouncing in place (Rear View).
> 2. **Row 2 (March):** 4 frames of a walk cycle moving upward (Rear View).
> 3. **Row 3 (Attack):** 3 frames showing the attack animation [Insert attack, e.g., winding up and swinging the ruler]. Must include a clear impact frame (Rear View).
> 4. **Row 4 (Defeat):** 1 frame of the character dropping their tool and taking a knee in exhaustion (Rear View).

**Prompt for Claude (For Enemies):**
> Attached is the base concept turnaround sheet for our character. I need you to generate a 2D sprite sheet for this character for a vertical auto-battler game.
> 
> **Crucial Perspective:** This character is an Enemy, which means they march DOWN the screen. Therefore, **ALL sprites in this sheet must be drawn from the Front / 3/4 Front View** (use the Front and Top-Down Oblique views from the reference sheet).
> 
> **Style:** Match the cel-shaded vector art style of the reference exactly. Use a transparent background.
> 
> Generate a sprite sheet containing the following frames arranged in rows:
> 1. **Row 1 (March):** 4 frames of a confident walk cycle moving downward (Front View).
> 2. **Row 2 (Stunned):** 2 frames of the character looking dazed with spinning stars above their head (Front View).
> 3. **Row 3 (Death):** 3 frames of the character dissolving into [Insert death effect, e.g., paperwork and mud] (Front View).

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
