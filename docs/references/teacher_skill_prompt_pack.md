# Teacher — Skill VFX Prompt Pack (standalone store asset)

The in-world **skill effect animation** for Teacher's signature skill, authored as
a **standalone, individually customizable asset** — a future **store** item that
can be swapped independently of her base sprite sheet and cut-in.

This is the **VFX that plays in the battlefield** when the skill fires (a world
overlay at/around the caster), NOT the character and NOT the cut-in panel. It is
drawn to sit under the **high top-down oblique** gameplay camera.

> Run in an image-capable Claude/Gemini. No character reference needed — this is a
> pure effect, but keep it in the game's **anime cel-shaded** language.

## The skill

- **Recess** — a radial pulse that **silences enemy auras in a radius**
  (`balance.ts` → Teacher `signatureSkill`). Fantasy: a schoolyard "settle down,
  QUIET" bell that snaps every buzzing enemy buff into silence. Palette anchor:
  Teacher's violet study energy (`#8b5cf6` violet, `#ddd6fe` pale-violet accents).

---

## Prompt — Recess VFX (effect animation)

> Generate a 2D **anime-style cel-shaded visual effect** sprite sheet for a mobile
> game skill called **Recess** — a silencing "quiet down" pulse. No character in
> frame, effect only, on a transparent background.
>
> **Concept:** an expanding **silence shockwave** — a ruler-slap ripple ringing
> out like a schoolbell, carrying a big translucent **"SHHH" / mute motif** and a
> ring of small silence marks ("×" over little aura wisps) that dim and snuff out
> the enemy auras it passes over. Violet (`#8b5cf6`) core with pale-violet
> (`#ddd6fe`) accents. Bold, clean, readable at small size — a crisp muting pulse,
> not clutter. Drawn to read under a high top-down oblique camera (a ring flat on
> the ground plus a vertical bell-ripple flourish).
>
> **MANDATORY LAYOUT — one animation, EXACTLY 5 frames left to right:**
> 1. spark / wind-up glow forming at the center (a ruler-tap point of light).
> 2. silence shockwave ring bursting outward, bell ripple igniting.
> 3. ring at full expansion, "SHHH" mute motif + silence marks at peak.
> 4. pulse settling as the passed-over aura wisps dim to a quiet violet glow.
> 5. fading out.
>
> Consistent frame size and centering; transparent background.

---

## Export & QA

- Export as a texture atlas: `teacher_skill.png` + `teacher_skill.json` (5 frames).
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
