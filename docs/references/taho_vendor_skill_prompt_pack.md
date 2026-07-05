# Taho Vendor — Skill VFX Prompt Pack (standalone store asset)

The in-world **skill effect animation** for Taho Vendor's signature skill,
authored as a **standalone, individually customizable asset** — a future
**store** item that can be swapped independently of his base sprite sheet and
cut-in.

This is the **VFX that plays in the battlefield** when the skill fires (a world
overlay at/around the caster), NOT the character and NOT the cut-in panel. It is
drawn to sit under the **high top-down oblique** gameplay camera.

> Run in an image-capable Claude/Gemini. No character reference needed — this is a
> pure effect, but keep it in the game's **anime cel-shaded** language.

## The skill

- **Hot Syrup** — a scalding **arnibal puddle** that lands on the ground and
  **permanently strips enemy speed buffs** while slowing whatever it touches
  (`balance.ts` → Taho Vendor `signatureSkill`). Fantasy: a sticky, sizzling
  brown-sugar syrup slick that pins the anomalies in place. Palette anchor: Taho
  Vendor's brushed-aluminum / steam whites (`#e2e8f0`) with warm caramel-brown
  arnibal accents.

---

## Prompt — Hot Syrup VFX (effect animation)

> Generate a 2D **anime-style cel-shaded visual effect** sprite sheet for a mobile
> game skill called **Hot Syrup** — a scalding sticky-syrup puddle that pins
> enemies. No character in frame, effect only, on a transparent background.
>
> **Concept:** a splashing arc of **hot caramel-brown arnibal** slapping down into
> a spreading **sticky ground puddle** with rising curls of **sizzling steam** and
> a few glinting sago-pearl specks, anime "gooey heat" energy. Caramel-brown syrup
> body with brushed-aluminum / steam-white (`#e2e8f0`) highlights and glints.
> Bold, clean, readable at small size — sticky heat, not clutter. Drawn to read
> under a high top-down oblique camera (the puddle flat on the ground plus a
> vertical splash-and-steam flourish).
>
> **MANDATORY LAYOUT — one animation, EXACTLY 5 frames left to right:**
> 1. syrup gathering into a rising lob-splash at the center.
> 2. the arnibal wave slapping down, puddle bursting outward, steam igniting.
> 3. puddle at full spread, thickest sticky sheen + steam curls at peak.
> 4. syrup settling into a slow, glinting sticky slick.
> 5. fading out.
>
> Consistent frame size and centering; transparent background.

---

## Export & QA

- Export as a texture atlas: `taho_vendor_skill.png` + `taho_vendor_skill.json`
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
