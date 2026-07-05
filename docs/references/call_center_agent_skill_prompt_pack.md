# Call Center Agent — Skill VFX Prompt Pack (standalone store asset)

The in-world **skill effect animation** for the Call Center Agent's signature
skill, authored as a **standalone, individually customizable asset** — a future
**store** item that can be swapped independently of their base sprite sheet and
cut-in.

This is the **VFX that plays in the battlefield** when the skill fires (a world
overlay at/around the caster), NOT the character and NOT the cut-in panel. It is
drawn to sit under the **high top-down oblique** gameplay camera.

> Run in an image-capable Claude/Gemini. No character reference needed — this is a
> pure effect, but keep it in the game's **anime cel-shaded** language.

## The skill

- **Escalate to Manager** — a **massive single-target strike** dealing 15% of the
  target's Max HP (`balance.ts` → Call Center Agent `signatureSkill`). Fantasy: a
  deadpan "let me escalate this" that calls down an overwhelming feedback bolt on
  one enemy. Palette anchor: the Call Center Agent's electric pale-yellow
  (`#fef08a`) crackle with cool office-blue glitch accents.

---

## Prompt — Escalate to Manager VFX (effect animation)

> Generate a 2D **anime-style cel-shaded visual effect** sprite sheet for a mobile
> game skill called **Escalate to Manager** — a devastating single-target feedback
> bolt. No character in frame, effect only, on a transparent background.
>
> **Concept:** a targeting reticle snapping onto one spot, then a **column of
> crackling headset-feedback lightning** crashing straight down with jagged arcs,
> a small "TRANSFERRING…" screen-glitch card and static motes, anime "overwhelming
> escalation" energy. Electric pale-yellow (`#fef08a`) bolt core with cool
> office-blue glitch accents. Bold, clean, readable at small size — one hard
> strike, not clutter. Drawn to read under a high top-down oblique camera (a
> ground scorch/reticle flat plus a tall vertical lightning column).
>
> **MANDATORY LAYOUT — one animation, EXACTLY 5 frames left to right:**
> 1. a targeting reticle and gathering static forming over the mark.
> 2. the feedback bolt column crashing down, arcs bursting outward.
> 3. bolt at full strike, brightest flash + glitch card at peak.
> 4. residual arcs settling into a fading scorch and static crackle.
> 5. fading out.
>
> Consistent frame size and centering; transparent background.

---

## Export & QA

- Export as a texture atlas: `call_center_agent_skill.png` +
  `call_center_agent_skill.json` (5 frames).
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
