# Eden (Community Organizer) - Visual Prompt Pack

This document contains the canonical prompts for generating Eden's art assets using AI image generators, adhering strictly to the landscape oblique perspective rules for **Project Ph-De (First Ripple)**.

## Character Bible
- **Name:** Eden
- **Role:** Leader / Community Organizer
- **Attack:** Projectile (Throwing megaphones)
- **Signature Skill:** Rally (Brief squad-wide buff, "Sugod, mga kababayan! Walang aatras!")
- **Visual Description:** A determined, hardworking Filipina community organizer. Wearing practical, slightly worn street clothes suitable for a protest (e.g., a faded denim jacket over a plain shirt, a protest bandanna or armband, sturdy sneakers). She carries a weathered red-and-white megaphone.
- **Color Palette:** Deep slate blue (`#0f172a`), vibrant red accents (`#ef4444`) on her bandanna/megaphone, and warm gold (`#facc15`).
- **Style:** High-contrast anime-style cel-shading, expressive anime faces and proportions, flat colors, bold clean outer strokes, dynamic anime key-art energy.

---

## Phase 1: Base Concept Turnaround (For Gemini)

*Copy and paste this into Gemini to generate the foundational concept art. Save the best output.*

> Generate a comprehensive 2D character turnaround reference sheet for a mobile game. 
> 
> **Character Details:** A determined Filipina community organizer holding a red-and-white megaphone. Wearing practical street clothes for a rally: a faded denim jacket over a plain shirt, a red protest bandanna tied on her arm or neck, jeans, and sturdy sneakers. She looks brave and defiant.
> **Color Palette:** Deep slate blue clothing, striking red accents, and subtle gold highlights.
> **Style:** High-contrast anime-style cel-shading, expressive anime faces and proportions, flat colors, bold clean outer strokes, dynamic anime key-art energy crossed with Persona 5 UI pop and Hades silhouettes. Plain solid white background.
> 
> **Required Layout:** Show the exact same character standing in a row from four specific angles:
> 1. **Front View:** Looking directly at the camera.
> 2. **Side Profile:** 90-degree turn.
> 3. **Rear View (Straight Back):** Looking completely away from the camera.
> 4. **TOP-DOWN HIGH ANGLE (Tilted):** The camera is positioned high above but tilted slightly to show the body. You must be able to see the top of her head, shoulders, and her upper torso, rather than a completely flat straight-down angle.
> 
> Ensure the clothing, proportions, and props remain identical across all four views.

---

## Phase 2: Animated Sprite Sheet (For Claude / Image Generator)

*Provide the image generated from Phase 1, then copy and paste this prompt.*

> Attached is the base concept turnaround sheet for our character. I need you to generate a strictly formatted 2D sprite sheet for this character for a top-down auto-battler game.
> 
> **Crucial Perspective:** This character is a Hero. The camera is a high top-down oblique positioned above and BEHIND our own front line, so the hero faces AWAY from us into the enemy. Therefore, **ALL sprites in this sheet must be drawn from a HIGH-ANGLE REAR VIEW (Tilted Back / back view)**. You must be able to see the top of their head, their shoulders, and their back/body. Do not use a completely flat zenith angle, we need to see the body. (Do NOT draw flat side profiles or low/ground-level angles).
> 
> **Style & Formatting:** Match the reference's exact style. Lay the animations out as horizontal rows, one animation per row, each frame in its own evenly-spaced cell, non-overlapping poses.
> 
> **OUTPUT RULES (critical — image models will otherwise draw these):** Fully **transparent** background (no white fill). Do NOT draw any grid lines, cell borders, boxes, guide lines, or separators. Do NOT render any text, row names, labels, numbers, or captions anywhere. Output ONLY the character art in evenly-spaced **invisible** cells.
> 
> **MANDATORY LAYOUT (Exactly 3 rows, one animation per row, in this top-to-bottom order — do NOT write the row names into the image):**
> 1. **Row 1 — `idle`:** EXACTLY 8 frames, breathing/bouncing in place, a smooth seamless loop (Back View).
> 2. **Row 2 — `attack`:** EXACTLY 8 frames of the basic attack throwing a megaphone — wind-up (frames 1–3), impact (frame 4 MUST be a clear impact frame where she releases the megaphone), follow-through (frames 5–8) (Back View).
> 3. **Row 3 — `cast`:** EXACTLY 10 frames winding up her signature skill "Rally", raising her megaphone high, energy building steadily across the frames (Back View, dramatic).
> 
> You must verify that every single frame listed above is present in the final image grid.
> (Heroes no longer draw `march` / `celebrate` / `defeat` — those use engine placeholders.)
>
> **SELF-CHECK:** Before returning the image, verify: Are all poses Top-Behind (back view)? Are there exactly 8, 8, and 10 frames? Is the background completely transparent with NO grids or text? Regenerate if any fail.

---

## Phase 3: Anime-Style Skill Cut-In (For Claude / Image Generator)

*Provide the Phase 1 base concept again, and use this prompt.*

> Using the attached character reference, generate a large, high-resolution 2D portrait sequence for a dramatic "Ultimate Skill" cut-in.
> 
> **Style:** Dramatic anime action shot, intense lighting, comic-book halftone overlays, dynamic speed lines in the background. Close up on the upper body and face.
> 
> Please generate 3 separate poses:
> 1. **Anticipation:** Winding up the rally cry, deep breath, pulling the megaphone close, dramatic shadow over her eyes.
> 2. **Action/Shout:** The climax of the move, mouth wide open screaming "Sugod, mga kababayan!", megaphone foreshortened dramatically toward the camera.
> 3. **Resolution:** A cool post-action beat, exhaling, lowering the megaphone with a defiant stare.

---

## Phase 4: Self-Correction Review Prompt

*If the Phase 2 sprite sheet output has errors (like grid lines, white backgrounds, or wrong angles), reply with this prompt and the flawed image attached in a NEW message.*

> You are a strict sprite-sheet QA reviewer. Review the attached sheet against this checklist and reply with **PASS/FAIL for each item** plus a one-line reason. Then, if anything FAILED, **regenerate a corrected version** that fixes only those issues while keeping everything that passed.
>
> 1. **View consistency** — is EVERY frame the same camera angle? (heroes: top-behind/rear, we see the back). No side profiles, no frames that flip to face the camera.
> 2. **Frame counts** — does each row have exactly the required number of frames? (Row 1: 8, Row 2: 8, Row 3: 10).
> 3. **Clean output** — fully transparent background, and absolutely NO grid lines, borders, boxes, text, labels, or numbers?
> 4. **On-model** — same outfit/hair/props/colors in every frame?
> 5. **No overlap / no cropping** — poses separated, nothing clipped by the edges?
