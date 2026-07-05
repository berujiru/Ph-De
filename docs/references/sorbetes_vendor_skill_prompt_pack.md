# Sorbetes Vendor — Skill VFX Prompt Pack (standalone store asset)

The in-world **skill effect animation** for Sorbetes Vendor's signature skill,
authored as a **standalone, individually customizable asset** — a future **store**
item that can be swapped independently of his base sprite sheet and cut-in.

This is the **VFX that plays in the battlefield** when the skill fires (a world
overlay at/around the caster), NOT the character and NOT the cut-in panel. It is
drawn to sit under the **high top-down oblique** gameplay camera.

> Run in an image-capable Claude/Gemini. No character reference needed — this is a
> pure effect, but keep it in the game's **anime cel-shaded** language.

## The skill

- **Dirty Ice Cream** — **drops 3 explosive ice-cream traps on the path**
  (`balance.ts` → Sorbetes Vendor `signatureSkill`). Fantasy: three sticky
  ice-cream globs that splat down and burst into freezing puddles. Palette anchor:
  Sorbetes Vendor's rose-pink cart energy (`#f472b6` candy-pink core, with
  icy-blue frost and pastel ube/mango scoop accents).

---

## Prompt — Dirty Ice Cream VFX (effect animation)

> Generate a 2D **anime-style cel-shaded visual effect** sprite sheet for a mobile
> game skill called **Dirty Ice Cream** — three explosive ice-cream traps that
> splat down and freeze the path. No character in frame, effect only, on a
> transparent background.
>
> **Concept:** **three ice-cream globs splatting into frozen puddle-bursts** —
> spreading icy-blue frost sheets, flying frost crystals, and pastel scoop-and-cone
> confetti. Candy rose-pink (`#f472b6`) core with icy-blue frost and pastel
> ube-purple / mango-yellow accents, anime "sweet frost" energy. Bold, clean,
> readable at small size — three crisp splats, not clutter. Drawn to read under a
> high top-down oblique camera (frost puddles flat on the ground plus rising frost
> mist).
>
> **MANDATORY LAYOUT — one animation, EXACTLY 5 frames left to right:**
> 1. frost mist gathering above three drop points at the center.
> 2. three ice-cream globs landing, frost puddles bursting outward.
> 3. puddles at full spread, frost crystals + cone confetti at peak.
> 4. frost settling into a steady frozen icy-blue sheen.
> 5. fading out.
>
> Consistent frame size and centering; transparent background.

---

## Export & QA

- Export as a texture atlas: `sorbetes_vendor_skill.png` +
  `sorbetes_vendor_skill.json` (5 frames).
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
