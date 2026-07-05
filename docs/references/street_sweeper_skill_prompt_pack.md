# Street Sweeper — Skill VFX Prompt Pack (standalone store asset)

The in-world **skill effect animation** for Street Sweeper's signature skill,
authored as a **standalone, individually customizable asset** — a future **store**
item that can be swapped independently of their base sprite sheet and cut-in.

This is the **VFX that plays in the battlefield** when the skill fires (a world
overlay at/around the caster), NOT the character and NOT the cut-in panel. It is
drawn to sit under the **high top-down oblique** gameplay camera.

> Run in an image-capable Claude/Gemini. No character reference needed — this is a
> pure effect, but keep it in the game's **anime cel-shaded** language.

## The skill

- **Dust Storm** — a swept-up cloud that **blinds enemies, reducing their speed and
  damage by 50%** (`balance.ts` → Street Sweeper `signatureSkill`). Fantasy: a
  furious broom sweep kicks a choking wall of grit into the anomalies' eyes.
  Palette anchor: the Sweeper's dust energy (`#a8a29e` taupe/dust-grey with dusty
  tan accents).

---

## Prompt — Dust Storm VFX (effect animation)

> Generate a 2D **anime-style cel-shaded visual effect** sprite sheet for a mobile
> game skill called **Dust Storm** — a blinding swept-dust cloud. No character in
> frame, effect only, on a transparent background.
>
> **Concept:** a billowing **ground-hugging dust swirl** kicked up by a broom
> sweep — churning grit and litter spinning outward, with faint blinded "×" eye
> motes and swirling leaves caught in the gust. Taupe/dust-grey (`#a8a29e`) core
> with dusty tan accents. Bold, clean, readable at small size — a clear choking
> swirl, not clutter. Drawn to read under a high top-down oblique camera (a
> swirling cloud spreading flat across the lane plus a low billow flourish).
>
> **MANDATORY LAYOUT — one animation, EXACTLY 5 frames left to right:**
> 1. spark / wind-up glow forming at the center (a low scuff of grit gathering).
> 2. dust wall bursting outward, swirl igniting, litter flung up.
> 3. cloud at full expansion, churning grit + blinded "×" motes at peak.
> 4. dust settling into a low lingering haze.
> 5. fading out.
>
> Consistent frame size and centering; transparent background.

---

## Export & QA

- Export as a texture atlas: `street_sweeper_skill.png` + `street_sweeper_skill.json` (5 frames).
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
