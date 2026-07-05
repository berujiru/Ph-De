# Street Sweeper — Skill Cut-In Prompt Pack (standalone store asset)

The anime **cut-in ("cut-out") animation** for Street Sweeper's signature skill,
authored as a **standalone, individually customizable asset** — a future **store**
item that can be swapped independently of their base sprite sheet and skill VFX.

This is the dramatic full-screen overlay that slides across during a signature
skill (rendered by `src/game/entities/fx/SkillCutIn.ts`), NOT a gameplay sprite.
It is a **front-facing dramatic anime close-up** — the top-behind gameplay rule
does **not** apply here.

> Run in an image-capable Claude/Gemini. **Attach the Street Sweeper base
> turnaround** (or their front view / HUD portrait) first so they stay on-model.

Character reference: see the locked **Visual Bible** in
[`street_sweeper_prompt_pack.md`](street_sweeper_prompt_pack.md) — wide straw sun
hat, cloth face-bandana, taupe-grey barangay work shirt with a thin reflective
safety band, gloves, a dustpan at the belt, tall stick broom (Walis Tingting). A
communal parody archetype only — never a specific real person.

---

## Prompt — Dust Storm Cut-In (3-pose anime sequence)

> Using the attached Street Sweeper reference, generate a large, high-resolution 2D
> anime portrait sequence for their dramatic "Ultimate Skill" cut-in. Skill name:
> **DUST STORM** (they whip the stick broom to kick a blinding wall of dust into
> the enemies). Voice line: *"Ang dumi niyo! Walang kalat!"*
>
> **Style:** Dramatic **anime action shot** — bold anime linework, expressive
> anime eyes (over the bandana), intense rim lighting, comic-book halftone
> overlays, dynamic speed lines, saturated punch. Close-up on upper body and face.
> Keep the straw hat, face bandana, taupe-grey work shirt with reflective band, and
> stick broom exactly on-model. Transparent or solid background so it can be
> composited.
>
> Generate **3 separate poses** (evenly framed, consistent scale):
> 1. **Anticipation:** a determined "not on my street" glare over the bandana,
>    winding the broom back low across the body, dramatic shadow, coiled energy.
> 2. **Action/Shout:** the climax — a fierce shout, sweeping the broom **arcing
>    toward the camera in dramatic foreshortening**, a billowing wall of dust and
>    litter exploding outward.
> 3. **Resolution:** a cool proud post-sweep pose, broom planted like a staff,
>    a satisfied glance over a spotless lane, exhaling.

---

## Export & QA

- Export as a texture atlas: `street_sweeper_cutin.png` + `street_sweeper_cutin.json`.
- 3 frames (anticipation → shout → resolution), consistent scale, on-model.
- Drop into `public/assets/heroes/`.
- QA: straw hat/bandana/safety band/broom on-model in every pose; eyes clearly
  anime-expressive; reads at a glance when it flashes across screen (~1s).

## Integration status

`SkillCutIn` (`src/game/entities/fx/SkillCutIn.ts`) currently renders a **tinted
silhouette + speed-line panel** placeholder. Wiring `street_sweeper_cutin` so it
plays the real 3-frame sequence is an **engine task on the backlog** (I do it when
the art exists): pass the `street_sweeper_cutin` texture into the cut-in panel and
step the frames during the hold. The in-game `cast` body pose (base sprite sheet,
`cast` row) already plays underneath while the panel slides.
