# Fishball Vendor — Skill VFX Prompt Pack (standalone store asset)

The in-world **skill effect animation** for Fishball Vendor's signature skill,
authored as a **standalone, individually customizable asset** — a future **store**
item that can be swapped independently of his base sprite sheet and cut-in.

This is the **VFX that plays in the battlefield** when the skill fires (a world
overlay at/around the caster), NOT the character and NOT the cut-in panel. It is
drawn to sit under the **high top-down oblique** gameplay camera.

> Run in an image-capable Claude/Gemini. No character reference needed — this is a
> pure effect, but keep it in the game's **anime cel-shaded** language.

## The skill

- **Spicy Sauce** — **ignites all pierced enemies, causing panic**
  (`balance.ts` → Fishball Vendor `signatureSkill`). Fantasy: a whole skewered
  line drenched in blazing red sauce that bursts into fiery panic. Palette anchor:
  Fishball Vendor's rose-red sauce energy (`#f43f5e` rose-red core, `#fca5a5`
  light-red sauce, with fiery orange flame accents).

---

## Prompt — Spicy Sauce VFX (effect animation)

> Generate a 2D **anime-style cel-shaded visual effect** sprite sheet for a mobile
> game skill called **Spicy Sauce** — a fiery line of sauce that ignites a whole
> skewered row into panic. No character in frame, effect only, on a transparent
> background.
>
> **Concept:** a **line of blazing red-orange sauce splash** erupting into flame
> along a lane — flying sauce droplets, chili-heat shimmer, and small panic
> heat-lines. Rose-red (`#f43f5e`) core with light-red (`#fca5a5`) sauce and fiery
> orange flame accents, anime "spice burst" energy. Bold, clean, readable at small
> size — a hot streak of fire, not clutter. Drawn to read under a high top-down
> oblique camera (a splash streak flat along the ground plus rising flame flicker).
>
> **MANDATORY LAYOUT — one animation, EXACTLY 5 frames left to right:**
> 1. a sauce droplet / spark forming at the center.
> 2. the fiery sauce splashing outward along the line, flames igniting.
> 3. the line at full flare, flames + panic heat-lines and chili motes at peak.
> 4. flames settling into a steady simmering ember glow.
> 5. fading out.
>
> Consistent frame size and centering; transparent background.

---

## Export & QA

- Export as a texture atlas: `fishball_vendor_skill.png` +
  `fishball_vendor_skill.json` (5 frames).
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
