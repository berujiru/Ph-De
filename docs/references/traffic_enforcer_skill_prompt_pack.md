# Traffic Enforcer — Skill VFX Prompt Pack (standalone store asset)

The in-world **skill effect animation** for Traffic Enforcer's signature skill,
authored as a **standalone, individually customizable asset** — a future **store**
item that can be swapped independently of his base sprite sheet and cut-in.

This is the **VFX that plays in the battlefield** when the skill fires (a world
overlay at/around the caster), NOT the character and NOT the cut-in panel. It is
drawn to sit under the **high top-down oblique** gameplay camera.

> Run in an image-capable Claude/Gemini. No character reference needed — this is a
> pure effect, but keep it in the game's **anime cel-shaded** language.

## The skill

- **STOP!** — a commanding whistle-blast that **hard-stuns a wide radius and
  cancels channeling Boss Skills** (`balance.ts` → Traffic Enforcer
  `signatureSkill`). Fantasy: a giant "STOP" traffic sign slams down and a
  piercing whistle shockwave freezes the whole road cold. Palette anchor: Traffic
  Enforcer's slate `#475569` with a **hi-vis neon-yellow** flash and red/white STOP
  sign accents.

---

## Prompt — STOP! VFX (effect animation)

> Generate a 2D **anime-style cel-shaded visual effect** sprite sheet for a mobile
> game skill called **STOP!** — a hard, wide crowd-freeze. No character in frame,
> effect only, on a transparent background.
>
> **Concept:** a giant red-and-white **octagonal "STOP" sign** stamps down onto the
> ground and a piercing **whistle shockwave ring** blasts outward in hi-vis
> neon-yellow, with bold halt-lines and freeze crystals snapping into place, anime
> "hard stop" energy. Slate (`#475569`) base with neon-yellow (`#facc15`-bright)
> and red/white STOP accents. Bold, clean, readable at small size — authority and
> impact, not clutter. Drawn to read under a high top-down oblique camera (the STOP
> sign flat-stamped on the ground plus a vertical whistle-blast flourish).
>
> **MANDATORY LAYOUT — one animation, EXACTLY 5 frames left to right:**
> 1. whistle spark / wind-up glow gathering at the center.
> 2. the STOP sign slamming down, whistle shockwave ring bursting outward.
> 3. ring at full expansion, neon-yellow halt-lines + freeze crystals at peak.
> 4. everything locking into a steady frozen "held" glow, sign planted.
> 5. fading out.
>
> Consistent frame size and centering; transparent background.

---

## Export & QA

- Export as a texture atlas: `traffic_enforcer_skill.png` +
  `traffic_enforcer_skill.json` (5 frames).
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
