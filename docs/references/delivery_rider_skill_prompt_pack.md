# Delivery Rider — Skill VFX Prompt Pack (standalone store asset)

The in-world **skill effect animation** for Delivery Rider's signature skill,
authored as a **standalone, individually customizable asset** — a future **store**
item that can be swapped independently of his base sprite sheet and cut-in.

This is the **VFX that plays in the battlefield** when the skill fires (a world
overlay at/around the caster), NOT the character and NOT the cut-in panel. It is
drawn to sit under the **high top-down oblique** gameplay camera.

> Run in an image-capable Claude/Gemini. No character reference needed — this is a
> pure effect, but keep it in the game's **anime cel-shaded** language.

## The skill

- **Kamote Riders** — **summons 3 AI riders that crash into the horde and explode**
  (`balance.ts` → Delivery Rider `signatureSkill`). Fantasy: a trio of reckless
  "kamote" motorcycle riders zoom in at full throttle and detonate on impact.
  Palette anchor: Delivery Rider's green `#22c55e` with light-green `#86efac` speed
  accents and orange blast highlights.

---

## Prompt — Kamote Riders VFX (effect animation)

> Generate a 2D **anime-style cel-shaded visual effect** sprite sheet for a mobile
> game skill called **Kamote Riders** — a trio of reckless motorcycle riders that
> zoom in and explode. No character in frame, effect only, on a transparent
> background.
>
> **Concept:** three motion-blurred **motorcycle dash streaks** rip across the frame
> at full throttle — long green speed-line trails, headlight glints, exhaust puffs —
> and slam together into a bright **crash explosion**, anime "reckless zoom" energy.
> Green (`#22c55e`) core with light-green (`#86efac`) speed accents and an orange
> blast flash at the impact. Bold, clean, readable at small size — velocity then
> impact, not clutter. Drawn to read under a high top-down oblique camera (the dash
> streaks raking flat across the ground plus a vertical blast flourish at the
> crash).
>
> **MANDATORY LAYOUT — one animation, EXACTLY 5 frames left to right:**
> 1. three headlight sparks / rev-glows forming at the edge, dust kicking up.
> 2. the riders' dash streaks tearing inward, green speed-lines igniting.
> 3. crash impact — streaks converge, bright orange blast + shockwave ring at peak.
> 4. the explosion settling into rolling smoke and green afterglow.
> 5. fading out.
>
> Consistent frame size and centering; transparent background.

---

## Export & QA

- Export as a texture atlas: `delivery_rider_skill.png` +
  `delivery_rider_skill.json` (5 frames).
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
