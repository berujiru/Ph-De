# Baker — Skill VFX Prompt Pack (standalone store asset)

The in-world **skill effect animation** for Baker's signature skill, authored as a
**standalone, individually customizable asset** — a future **store** item that can
be swapped independently of his base sprite sheet and cut-in.

This is the **VFX that plays in the battlefield** when the skill fires (a world
overlay at/around the caster), NOT the character and NOT the cut-in panel. It is
drawn to sit under the **high top-down oblique** gameplay camera.

> Run in an image-capable Claude/Gemini. No character reference needed — this is a
> pure effect, but keep it in the game's **anime cel-shaded** language.

## The skill

- **Dough Knead** — a heavy slam that **flattens enemies, reducing their armor and
  damage by 50%** (`balance.ts` → Baker `signatureSkill`). Fantasy: a molten mass
  of dough slammed and kneaded flat over the horde, crushing their spite out of
  them. Palette anchor: Baker's red/ember heat (`#ef4444` red core, orange ember
  highlights, flour-white bursts).

---

## Prompt — Dough Knead VFX (effect animation)

> Generate a 2D **anime-style cel-shaded visual effect** sprite sheet for a mobile
> game skill called **Dough Knead** — a heavy dough-slam that flattens enemies. No
> character in frame, effect only, on a transparent background.
>
> **Concept:** a huge glowing **mass of hot dough** slams down and spreads into a
> flattening **impact splat** — a shockwave of dough dented flat on the ground,
> flour puffing up, orange ember heat-shimmer rising off it. Red (`#ef4444`) core
> with orange ember accents and flour-white puffs, anime "heavy impact" energy.
> Bold, clean, readable at small size — weight and heat, not clutter. Drawn to read
> under a high top-down oblique camera (a flattened dough splat spread across the
> ground plus a vertical flour-and-heat flourish).
>
> **MANDATORY LAYOUT — one animation, EXACTLY 5 frames left to right:**
> 1. glowing dough mass forming/rising at the center, heat gathering.
> 2. the mass slamming down, impact flash igniting, flour beginning to burst.
> 3. full flatten — dough splat spread wide, flour cloud + ember ring at peak.
> 4. the splat settling into a steady flattened glow, embers simmering.
> 5. fading out.
>
> Consistent frame size and centering; transparent background.

---

## Export & QA

- Export as a texture atlas: `baker_skill.png` + `baker_skill.json` (5 frames).
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
