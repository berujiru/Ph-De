# Fisherfolk — Skill VFX Prompt Pack (standalone store asset)

The in-world **skill effect animation** for Fisherfolk's signature skill, authored
as a **standalone, individually customizable asset** — a future **store** item that
can be swapped independently of his base sprite sheet and cut-in.

This is the **VFX that plays in the battlefield** when the skill fires (a world
overlay at/around the caster), NOT the character and NOT the cut-in panel. It is
drawn to sit under the **high top-down oblique** gameplay camera.

> Run in an image-capable Claude/Gemini. No character reference needed — this is a
> pure effect, but keep it in the game's **anime cel-shaded** language.

## The skill

- **Lambat** — a thrown net that **drags enemies from off-lanes into the center**
  (`balance.ts` → Fisherfolk `signatureSkill`). Fantasy: a cast net whirls out
  wide then cinches inward, hauling foes together and leaving them Wet. Palette
  anchor: Fisherfolk's sea energy (`#0ea5e9` sea-blue, `#7dd3fc` pale-cyan accents).

---

## Prompt — Lambat VFX (effect animation)

> Generate a 2D **anime-style cel-shaded visual effect** sprite sheet for a mobile
> game skill called **Lambat** — a cast-net drag-in vortex. No character in frame,
> effect only, on a transparent background.
>
> **Concept:** a circular **cast-net mesh** that whirls open wide, then contracts —
> a weighted-rim net spreading outward over a water-splash ring, then **inward-
> pulling swirl arrows** cinching it back to center with a spray of droplets.
> Sea-blue (`#0ea5e9`) core with pale-cyan (`#7dd3fc`) accents. Bold, clean,
> readable at small size — a clear cast-and-cinch motion, not clutter. Drawn to
> read under a high top-down oblique camera (a net-mesh disc flat on the ground
> plus a low water-splash flourish).
>
> **MANDATORY LAYOUT — one animation, EXACTLY 5 frames left to right:**
> 1. spark / wind-up glow forming at the center (net gathered, water charge).
> 2. net flinging outward, mesh spreading over a splash ring.
> 3. net at full expansion, weighted rim + inward swirl arrows at peak.
> 4. net cinching inward, dragging toward center with droplet spray.
> 5. fading out.
>
> Consistent frame size and centering; transparent background.

---

## Export & QA

- Export as a texture atlas: `fisherfolk_skill.png` + `fisherfolk_skill.json` (5 frames).
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
