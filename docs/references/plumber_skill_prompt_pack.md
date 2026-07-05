# Plumber — Skill VFX Prompt Pack (standalone store asset)

The in-world **skill effect animation** for Plumber's signature skill, authored as
a **standalone, individually customizable asset** — a future **store** item that
can be swapped independently of his base sprite sheet and cut-in.

This is the **VFX that plays in the battlefield** when the skill fires (a world
overlay at/around the caster), NOT the character and NOT the cut-in panel. It is
drawn to sit under the **high top-down oblique** gameplay camera.

> Run in an image-capable Claude/Gemini. No character reference needed — this is a
> pure effect, but keep it in the game's **anime cel-shaded** language.

## The skill

- **Flush** — a **massive wave that instantly washes away all enemy Summons**
  (`balance.ts` → Plumber `signatureSkill`). Fantasy: a roaring flood-flush that
  surges down the lane and sweeps the small fry off the board. Palette anchor:
  Plumber's blue `#2563eb` water with cyan-white foam highlights.

---

## Prompt — Flush VFX (effect animation)

> Generate a 2D **anime-style cel-shaded visual effect** sprite sheet for a mobile
> game skill called **Flush** — a massive sweeping water wave. No character in
> frame, effect only, on a transparent background.
>
> **Concept:** a huge **surging flood wave** rushes forward and crashes into a
> swirling **flush vortex**, foamy whitecaps and spray flying, water rushing off
> down the lane, anime "tidal sweep" energy. Blue (`#2563eb`) core with cyan-white
> foam accents. Bold, clean, readable at small size — rushing force, not clutter.
> Drawn to read under a high top-down oblique camera (the wave sweeping flat across
> the ground plus a vertical crest-and-spray flourish).
>
> **MANDATORY LAYOUT — one animation, EXACTLY 5 frames left to right:**
> 1. water gathering / pressure building at the center, a low swell forming.
> 2. the wave surging up and rushing outward, foam igniting.
> 3. wave at full crest — flush vortex spinning, whitecaps + spray at peak.
> 4. the flood settling into a steady rushing sheet, foam simmering.
> 5. draining/fading out.
>
> Consistent frame size and centering; transparent background.

---

## Export & QA

- Export as a texture atlas: `plumber_skill.png` + `plumber_skill.json` (5 frames).
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
