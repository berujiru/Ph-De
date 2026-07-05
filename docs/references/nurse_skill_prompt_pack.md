# Nurse — Skill VFX Prompt Pack (standalone store asset)

The in-world **skill effect animation** for the Nurse's signature skill, authored
as a **standalone, individually customizable asset** — a future **store** item
that can be swapped independently of her base sprite sheet and cut-in.

This is the **VFX that plays in the battlefield** when the skill fires (a world
overlay at/around the caster), NOT the character and NOT the cut-in panel. It is
drawn to sit under the **high top-down oblique** gameplay camera.

> Run in an image-capable Claude/Gemini. No character reference needed — this is a
> pure effect, but keep it in the game's **anime cel-shaded** language.

## The skill

- **Vaccine Drive** — a squad-wide **debuff-immunity blessing** that grants all
  heroes immunity to debuffs for 5 seconds (`balance.ts` → Nurse
  `signatureSkill`). Fantasy: a warm healing chime and protective aura that washes
  over the whole line and inoculates them. Palette anchor: the Nurse's soft
  healing rose/salmon (`#fca5a5`) with a clinical-white and Holy glow.

---

## Prompt — Vaccine Drive VFX (effect animation)

> Generate a 2D **anime-style cel-shaded visual effect** sprite sheet for a mobile
> game skill called **Vaccine Drive** — a protective healing-immunity blessing.
> No character in frame, effect only, on a transparent background.
>
> **Concept:** an expanding **protective aura ring** and rising **healing shimmer**
> with soft twinkling **plus/cross sparkles**, a faint immunity-shield dome, and a
> gentle chime-glow, anime "warm blessing" energy. Soft rose/salmon (`#fca5a5`)
> core with clinical-white and Holy-gold highlights. Bold, clean, readable at
> small size — soothing radiance, not clutter. Drawn to read under a high top-down
> oblique camera (a ring flat on the ground plus a vertical shimmer-dome flourish).
>
> **MANDATORY LAYOUT — one animation, EXACTLY 5 frames left to right:**
> 1. a soft healing glow forming at the center.
> 2. shockwave ring blooming outward, aura igniting.
> 3. ring at full expansion, immunity dome + cross-sparkles at peak.
> 4. aura settling into a steady protective shimmer.
> 5. fading out.
>
> Consistent frame size and centering; transparent background.

---

## Export & QA

- Export as a texture atlas: `nurse_skill.png` + `nurse_skill.json` (5 frames).
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
