# Electrician — Skill VFX Prompt Pack (standalone store asset)

The in-world **skill effect animation** for Electrician's signature skill,
authored as a **standalone, individually customizable asset** — a future **store**
item that can be swapped independently of his base sprite sheet and cut-in.

This is the **VFX that plays in the battlefield** when the skill fires (a world
overlay at/around the caster), NOT the character and NOT the cut-in panel. It is
drawn to sit under the **high top-down oblique** gameplay camera.

> Run in an image-capable Claude/Gemini. No character reference needed — this is a
> pure effect, but keep it in the game's **anime cel-shaded** language.

## The skill

- **Rolling Blackout** — **stuns the entire screen for 3 seconds**
  (`balance.ts` → Electrician `signatureSkill`). Fantasy: he overloads the grid so
  a screen-wide electric surge and darkness freeze every anomaly mid-step. Palette
  anchor: Electrician's electric sky-blue energy (`#38bdf8` core, blinding
  white-blue arcs, with a dark blackout wash).

---

## Prompt — Rolling Blackout VFX (effect animation)

> Generate a 2D **anime-style cel-shaded visual effect** sprite sheet for a mobile
> game skill called **Rolling Blackout** — a screen-wide electric stun burst that
> plunges the field into darkness. No character in frame, effect only, on a
> transparent background.
>
> **Concept:** a **screen-wide electric shockwave** — an expanding ring of forked
> lightning with a surging dark blackout wash and small spinning-stun star motifs.
> Sky-blue (`#38bdf8`) core with blinding white-blue arcs and a dark blackout
> vignette, anime "grid overload" energy. Bold, clean, readable at small size —
> one hard electric pulse, not clutter. Drawn to read under a high top-down oblique
> camera (a forked-lightning ring flat on the ground plus a vertical arc flourish).
>
> **MANDATORY LAYOUT — one animation, EXACTLY 5 frames left to right:**
> 1. a bright spark forming at the center, air crackling.
> 2. the electric shockwave bursting outward, forked lightning + darkness surging.
> 3. ring at full expansion, blackout wash + spinning-stun stars at peak.
> 4. energy settling into a steady flickering electric glow.
> 5. fading out.
>
> Consistent frame size and centering; transparent background.

---

## Export & QA

- Export as a texture atlas: `electrician_skill.png` + `electrician_skill.json`
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
