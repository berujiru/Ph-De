# Jeepney Driver — Skill VFX Prompt Pack (standalone store asset)

The in-world **skill effect animation** for Jeepney Driver's signature skill,
authored as a **standalone, individually customizable asset** — a future **store**
item that can be swapped independently of his base sprite sheet and cut-in.

This is the **VFX that plays in the battlefield** when the skill fires (a world
overlay at/around the caster), NOT the character and NOT the cut-in panel. It is
drawn to sit under the **high top-down oblique** gameplay camera.

> Run in an image-capable Claude/Gemini. No character reference needed — this is a
> pure effect, but keep it in the game's **anime cel-shaded** language.

## The skill

- **Barya Lang Po** — a **coin-shrapnel shotgun blast for massive AoE damage**
  (`balance.ts` → Jeepney Driver `signatureSkill`). Fantasy: a fistful of loose
  change hurled like a shotgun into the crowd. Palette anchor: the Driver's
  emerald energy (`#10b981` emerald) with **brassy coin gold** (`#fcd34d`) accents.

---

## Prompt — Barya Lang Po VFX (effect animation)

> Generate a 2D **anime-style cel-shaded visual effect** sprite sheet for a mobile
> game skill called **Barya Lang Po** — a coin-shrapnel shotgun blast. No character
> in frame, effect only, on a transparent background.
>
> **Concept:** a wide **shotgun cone of spinning brass coins** fanning outward —
> a muzzle-flash burst of loose change with a smog/exhaust puff, motion streaks,
> and bright impact sparks where the coins land. Emerald (`#10b981`) blast core
> with **brassy gold coins** (`#fcd34d`). Bold, clean, readable at small size —
> a punchy spray, not clutter. Drawn to read under a high top-down oblique camera
> (a fanning cone across the ground plus a low burst flourish).
>
> **MANDATORY LAYOUT — one animation, EXACTLY 5 frames left to right:**
> 1. spark / wind-up glow forming at the center (coins gathering in a fist, emerald
>    charge).
> 2. shotgun burst firing outward, coins fanning into a spreading cone, smog puff.
> 3. cone at full spread, coins mid-flight + impact sparks at peak.
> 4. coins scattering and settling, a lingering emerald muzzle glow.
> 5. fading out.
>
> Consistent frame size and centering; transparent background.

---

## Export & QA

- Export as a texture atlas: `jeepney_driver_skill.png` + `jeepney_driver_skill.json` (5 frames).
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
