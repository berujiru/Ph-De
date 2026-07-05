# Student — Skill Cut-In Prompt Pack (standalone store asset)

The anime **cut-in ("cut-out") animation** for Student's signature skill, authored
as a **standalone, individually customizable asset** — a future **store** item that
can be swapped independently of his base sprite sheet and skill VFX.

This is the dramatic full-screen overlay that slides across during a signature
skill (rendered by `src/game/entities/fx/SkillCutIn.ts`), NOT a gameplay sprite.
It is a **front-facing dramatic anime close-up** — the top-behind gameplay rule
does **not** apply here.

> Run in an image-capable Claude/Gemini. **Attach the Student base turnaround** (or
> his front view / HUD portrait) first so he stays on-model.

Character reference: see the locked **Visual Bible** in
[`student_prompt_pack.md`](student_prompt_pack.md) — short messy black hair, faint
under-eye circles, white school polo with rolled sleeves, amber ID lanyard, bulky
backpack, Y-frame slingshot (tirador). A communal parody archetype only — never a
specific real person.

---

## Prompt — Cramming Cut-In (3-pose anime sequence)

> Using the attached Student reference, generate a large, high-resolution 2D anime
> portrait sequence for his dramatic "Ultimate Skill" cut-in. Skill name:
> **CRAMMING** (he channels frantic deadline energy to refresh a teammate's move).
> Voice line: *"Hala, deadline na bukas! Ipasa na 'to!"*
>
> **Style:** Dramatic **anime action shot** — bold anime linework, expressive
> anime face, intense rim lighting, comic-book halftone overlays, dynamic speed
> lines, saturated punch. Close-up on upper body and face. Keep his messy black
> hair, tired-but-focused eyes, white rolled-sleeve polo, amber lanyard, backpack,
> and slingshot exactly on-model. Transparent or solid background so it can be
> composited.
>
> Generate **3 separate poses** (evenly framed, consistent scale):
> 1. **Anticipation:** hunched forward gripping a fistful of papers/pencil, jaw
>    set, sweat drop, dramatic shadow, coiled last-minute energy.
> 2. **Action/Shout:** the climax — mouth wide open shouting, thrusting the papers
>    (or slingshot) **toward the camera in dramatic foreshortening**, refresh-arrow
>    rings and flying scribbled pages exploding outward.
> 3. **Resolution:** a cool exhausted-but-triumphant post-cram pose, thumbs-up or
>    slinging the backpack over one shoulder, exhaling.

---

## Export & QA

- Export as a texture atlas: `student_cutin.png` + `student_cutin.json`.
- 3 frames (anticipation → shout → resolution), consistent scale, on-model.
- Drop into `public/assets/heroes/`.
- QA: hair/lanyard/backpack/slingshot on-model in every pose; face clearly
  anime-expressive; reads at a glance when it flashes across screen (~1s).

## Integration status

`SkillCutIn` (`src/game/entities/fx/SkillCutIn.ts`) currently renders a **tinted
silhouette + speed-line panel** placeholder. Wiring `student_cutin` so it plays the
real 3-frame sequence is an **engine task on the backlog** (I do it when the art
exists): pass the `student_cutin` texture into the cut-in panel and step the frames
during the hold. The in-game `cast` body pose (base sprite sheet, `cast` row)
already plays underneath while the panel slides.
