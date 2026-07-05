# Eden — Skill VFX Prompt Pack (standalone store asset)

The in-world **skill effect animation** for Eden's signature skill, authored as a
**standalone, individually customizable asset** — a future **store** item that can
be swapped independently of her base sprite sheet and cut-in.

This is the **VFX that plays in the battlefield** when the skill fires (a world
overlay at/around the caster), NOT the character and NOT the cut-in panel. It is
drawn to sit under the **high top-down oblique** gameplay camera.

> Run in an image-capable Claude/Gemini. No character reference needed — this is a
> pure effect, but keep it in the game's **anime cel-shaded** language.

## The skill

- **Rally** — a brief **squad-wide attack-speed buff** to all deployed heroes
  (`balance.ts` → Eden `signatureSkill`). Fantasy: a defiant rallying roar that
  lifts the whole line. Palette anchor: Eden's gold/red rally energy (`#facc15`
  gold, `#ef4444` red accents).

---

## Prompt — Rally VFX (effect animation)

> Generate a 2D **anime-style cel-shaded visual effect** sprite sheet for a mobile
> game skill called **Rally** — a rousing squad-wide battle-cry buff. No character
> in frame, effect only, on a transparent background.
>
> **Concept:** a burst of golden rallying energy — an expanding **shockwave ring**
> and rising **uplift aura** with speed lines and a few tiny waving-banner / sound
> motifs, anime "fighting-spirit" energy. Gold (`#facc15`) core with red
> (`#ef4444`) accents. Bold, clean, readable at small size — energy, not clutter.
> Drawn to read under a high top-down oblique camera (a ring flat on the ground
> plus a vertical uplift flourish).
>
> **MANDATORY LAYOUT — one animation, EXACTLY 5 frames left to right:**
> 1. spark / wind-up glow forming at the center.
> 2. shockwave ring bursting outward, aura igniting.
> 3. ring at full expansion, uplift beams + banners at peak.
> 4. aura settling into a steady rallying glow.
> 5. fading out.
>
> Consistent frame size and centering; transparent background.

---

## Export & QA

- Export as a texture atlas: `eden_skill.png` + `eden_skill.json` (5 frames).
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
