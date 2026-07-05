# Farmer — Skill VFX Prompt Pack (standalone store asset)

The in-world **skill effect animation** for Farmer's signature skill, authored as
a **standalone, individually customizable asset** — a future **store** item that
can be swapped independently of his base sprite sheet and cut-in.

This is the **VFX that plays in the battlefield** when the skill fires (a world
overlay at/around the caster), NOT the character and NOT the cut-in panel. It is
drawn to sit under the **high top-down oblique** gameplay camera.

> Run in an image-capable Claude/Gemini. No character reference needed — this is a
> pure effect, but keep it in the game's **anime cel-shaded** language.

## The skill

- **Harvest** — a **massive burst of damage based on the enemies' stacked
  ailments** (`balance.ts` → Farmer `signatureSkill`). Fantasy: one great reaping
  sweep across the field that detonates every ailment it has been feeding.
  Palette anchor: Farmer's field-green reaping energy (`#15803d` deep green, with
  straw-gold and earthy-brown accents).

---

## Prompt — Harvest VFX (effect animation)

> Generate a 2D **anime-style cel-shaded visual effect** sprite sheet for a mobile
> game skill called **Harvest** — a massive reaping detonation of stacked enemy
> ailments. No character in frame, effect only, on a transparent background.
>
> **Concept:** a sweeping **crescent of green reaping energy** — a wide scythe-arc
> shockwave low across the ground that kicks up slashed grass, dust, and bursting
> ailment motes as it detonates. Deep field-green (`#15803d`) core with straw-gold
> and earthy-brown accents, anime "harvest surge" energy. Bold, clean, readable at
> small size — a single decisive sweep, not clutter. Drawn to read under a high
> top-down oblique camera (a crescent arc flat on the ground plus a rising dust
> flourish).
>
> **MANDATORY LAYOUT — one animation, EXACTLY 5 frames left to right:**
> 1. earth energy gathering — a low green glow and gathering dust at the center.
> 2. the reaping crescent sweeping outward, ailment motes igniting.
> 3. crescent at full expansion, slashed-grass + dust ring at peak, ailment bursts.
> 4. energy settling into a steady green reaping glow.
> 5. fading out.
>
> Consistent frame size and centering; transparent background.

---

## Export & QA

- Export as a texture atlas: `farmer_skill.png` + `farmer_skill.json` (5 frames).
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
