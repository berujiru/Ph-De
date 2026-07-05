# Student — Skill VFX Prompt Pack (standalone store asset)

The in-world **skill effect animation** for Student's signature skill, authored as
a **standalone, individually customizable asset** — a future **store** item that
can be swapped independently of his base sprite sheet and cut-in.

This is the **VFX that plays in the battlefield** when the skill fires (a world
overlay at/around the caster), NOT the character and NOT the cut-in panel. It is
drawn to sit under the **high top-down oblique** gameplay camera.

> Run in an image-capable Claude/Gemini. No character reference needed — this is a
> pure effect, but keep it in the game's **anime cel-shaded** language.

## The skill

- **Cramming** — a caffeinated burst that **instantly resets an adjacent hero's
  active skill cooldown** (`balance.ts` → Student `signatureSkill`). Fantasy: a
  last-minute deadline sprint that refreshes a teammate's move. Palette anchor:
  Student's amber study energy (`#f59e0b` amber, `#fcd34d` golden accents).

---

## Prompt — Cramming VFX (effect animation)

> Generate a 2D **anime-style cel-shaded visual effect** sprite sheet for a mobile
> game skill called **Cramming** — a cooldown-refresh study burst. No character in
> frame, effect only, on a transparent background.
>
> **Concept:** a burst of frantic study energy — a spinning **circular
> "cooldown-ready" refresh-arrow ring**, a spray of flying scribbled papers,
> coffee/energy-drink steam speed lines, and bright exclamation "!" study sparks.
> Amber (`#f59e0b`) core with golden-yellow (`#fcd34d`) accents. Bold, clean,
> readable at small size — snappy refresh energy, not clutter. Drawn to read under
> a high top-down oblique camera (a flat refresh ring on the ground plus a
> vertical spark-and-paper flourish).
>
> **MANDATORY LAYOUT — one animation, EXACTLY 5 frames left to right:**
> 1. spark / wind-up glow forming at the center (a nib of light, papers gathering).
> 2. refresh-arrow ring bursting outward, papers scattering, steam igniting.
> 3. ring at full spin, "cooldown ready" arrows + "!" sparks at peak.
> 4. energy settling into a steady golden "recharged" glow.
> 5. fading out.
>
> Consistent frame size and centering; transparent background.

---

## Export & QA

- Export as a texture atlas: `student_skill.png` + `student_skill.json` (5 frames).
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
