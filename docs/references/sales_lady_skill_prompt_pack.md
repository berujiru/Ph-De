# Sales Lady — Skill VFX Prompt Pack (standalone store asset)

The in-world **skill effect animation** for Sales Lady's signature skill, authored
as a **standalone, individually customizable asset** — a future **store** item
that can be swapped independently of her base sprite sheet and cut-in.

This is the **VFX that plays in the battlefield** when the skill fires (a world
overlay at/around the caster), NOT the character and NOT the cut-in panel. It is
drawn to sit under the **high top-down oblique** gameplay camera.

> Run in an image-capable Claude/Gemini. No character reference needed — this is a
> pure effect, but keep it in the game's **anime cel-shaded** language.

## The skill

- **Closing Sale** — **instantly executes any enemy below 15% HP**
  (`balance.ts` → Sales Lady `signatureSkill`). Fantasy: a final blaring sales
  pitch that snaps every low-HP straggler shut like a closed register. Palette
  anchor: Sales Lady's magenta-pink pitch energy (`#ec4899` magenta core, white
  sound-word pops, with a bright yellow "SALE!" accent).

---

## Prompt — Closing Sale VFX (effect animation)

> Generate a 2D **anime-style cel-shaded visual effect** sprite sheet for a mobile
> game skill called **Closing Sale** — a screen-wide broadcast pitch that executes
> low-HP stragglers. No character in frame, effect only, on a transparent
> background.
>
> **Concept:** an expanding **broadcast sound-blast** — concentric pitch rings with
> comic "SALE!" sound-word pops, price-tag confetti, and a cash-register CHA-CHING
> sparkle. Magenta-pink (`#ec4899`) core with white sound pops and a bright yellow
> "SALE!" accent, anime "hype announcement" energy. Bold, clean, readable at small
> size — a punchy broadcast, not clutter. Drawn to read under a high top-down
> oblique camera (rings flat on the ground plus a vertical sound-pop flourish).
>
> **MANDATORY LAYOUT — one animation, EXACTLY 5 frames left to right:**
> 1. a sound spark / pitch glow forming at the center.
> 2. sound-blast rings bursting outward, "SALE!" pops igniting.
> 3. rings at full expansion, price-tag confetti + CHA-CHING sparkle at peak.
> 4. blast settling into a steady magenta pitch glow.
> 5. fading out.
>
> Consistent frame size and centering; transparent background.

---

## Export & QA

- Export as a texture atlas: `sales_lady_skill.png` + `sales_lady_skill.json`
  (5 frames).
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
