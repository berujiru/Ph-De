# Security Guard — Skill VFX Prompt Pack (standalone store asset)

The in-world **skill effect animation** for the Security Guard's signature skill,
authored as a **standalone, individually customizable asset** — a future
**store** item that can be swapped independently of his base sprite sheet and
cut-in.

This is the **VFX that plays in the battlefield** when the skill fires (a world
overlay at/around the caster), NOT the character and NOT the cut-in panel. It is
drawn to sit under the **high top-down oblique** gameplay camera.

> Run in an image-capable Claude/Gemini. No character reference needed — this is a
> pure effect, but keep it in the game's **anime cel-shaded** language.

## The skill

- **Shining Flashlight** — a wide **blinding cone** that heavily slows all enemies
  caught in it (`balance.ts` → Security Guard `signatureSkill`). Fantasy: he clicks
  his heavy duty flashlight and sweeps a glaring beam down the lane. Palette
  anchor: the Security Guard's deep navy guard-blue (`#1e3a8a`) with a bright
  flashlight-beam white/gold glare.

---

## Prompt — Shining Flashlight VFX (effect animation)

> Generate a 2D **anime-style cel-shaded visual effect** sprite sheet for a mobile
> game skill called **Shining Flashlight** — a wide blinding beam cone that slows
> enemies. No character in frame, effect only, on a transparent background.
>
> **Concept:** a wide **fan-shaped flashlight beam cone** flaring forward with a
> hot glare hotspot, floating dust motes and lens-flare glints in the light, and a
> faint slow-motion shimmer at its edges, anime "blinding glare" energy. Bright
> flashlight white/gold beam over a deep navy (`#1e3a8a`) surround. Bold, clean,
> readable at small size — one glaring sweep, not clutter. Drawn to read under a
> high top-down oblique camera (the beam cone fanning flat across the ground plus
> a bright glare bloom at the source).
>
> **MANDATORY LAYOUT — one animation, EXACTLY 5 frames left to right:**
> 1. a click-spark and narrow glow forming at the source.
> 2. the beam cone flaring open, glare bursting forward.
> 3. cone at full width, brightest glare + dust motes at peak.
> 4. beam settling into a steady blinding wash.
> 5. fading out.
>
> Consistent frame size and centering; transparent background.

---

## Export & QA

- Export as a texture atlas: `security_guard_skill.png` +
  `security_guard_skill.json` (5 frames).
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
