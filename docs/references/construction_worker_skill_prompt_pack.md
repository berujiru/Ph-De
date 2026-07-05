# Construction Worker — Skill VFX Prompt Pack (standalone store asset)

The in-world **skill effect animation** for the Construction Worker's signature
skill, authored as a **standalone, individually customizable asset** — a future
**store** item that can be swapped independently of his base sprite sheet and
cut-in.

This is the **VFX that plays in the battlefield** when the skill fires (a world
overlay at/around the caster), NOT the character and NOT the cut-in panel. It is
drawn to sit under the **high top-down oblique** gameplay camera.

> Run in an image-capable Claude/Gemini. No character reference needed — this is a
> pure effect, but keep it in the game's **anime cel-shaded** language.

## The skill

- **Yero Barricade** — he slams down an **indestructible galvanized-iron wall**
  that blocks enemies for 5 seconds (`balance.ts` → Construction Worker
  `signatureSkill`). Fantasy: a corrugated yero sheet crashing into the ground as
  an immovable wall. Palette anchor: the Construction Worker's safety-amber /
  construction-orange (`#d97706`) with brushed corrugated steel.

---

## Prompt — Yero Barricade VFX (effect animation)

> Generate a 2D **anime-style cel-shaded visual effect** sprite sheet for a mobile
> game skill called **Yero Barricade** — a corrugated galvanized-iron wall
> slamming down to block the path. No character in frame, effect only, on a
> transparent background.
>
> **Concept:** a heavy **corrugated galvanized-iron (yero) sheet** crashing down
> into a standing wall, with an **impact dust burst**, flying grit, and a few
> hazard-tape / warning-stripe sparks, anime "heavy build" energy. Brushed
> steel-gray sheet with safety-amber (`#d97706`) hazard-stripe accents and a
> dust-cloud plume. Bold, clean, readable at small size — solid impact, not
> clutter. Drawn to read under a high top-down oblique camera (the wall standing
> up off the ground plus a low dust-burst flourish).
>
> **MANDATORY LAYOUT — one animation, EXACTLY 5 frames left to right:**
> 1. a warning-glow and ground marker forming where the wall will drop.
> 2. the yero sheet crashing down, dust bursting outward on impact.
> 3. wall at full height, thickest dust plume + hazard sparks at peak.
> 4. dust settling into a steady standing barricade.
> 5. fading out.
>
> Consistent frame size and centering; transparent background.

---

## Export & QA

- Export as a texture atlas: `construction_worker_skill.png` +
  `construction_worker_skill.json` (5 frames).
- Drop into `public/assets/fx/` (skill VFX live apart from character sheets).
- QA: transparent, centered, readable under the game camera; loops/one-shots
  cleanly; palette matches the skill.

## Integration status

**Not yet wired — this is a new asset type.** Skill visuals today are **drawn in
code** (rings/particles via the `onVisual` callback in `src/game/core/Skills.ts`
and `HeroModel.playCast`). Playing a generated VFX atlas needs a small engine hook
(spawn an animated effect sprite at the caster/target from the skill's `onVisual`
event), which is on the backlog — I add it when the first VFX asset exists. The
asset spec above makes the art ready ahead of that hook. The character's `cast`
body pose (base sprite sheet) and the cut-in (own pack) are separate from this.
