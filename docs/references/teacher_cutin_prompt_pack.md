# Teacher — Skill Cut-In Prompt Pack (standalone store asset)

The anime **cut-in ("cut-out") animation** for Teacher's signature skill, authored
as a **standalone, individually customizable asset** — a future **store** item that
can be swapped independently of her base sprite sheet and skill VFX.

This is the dramatic full-screen overlay that slides across during a signature
skill (rendered by `src/game/entities/fx/SkillCutIn.ts`), NOT a gameplay sprite.
It is a **front-facing dramatic anime close-up** — the top-behind gameplay rule
does **not** apply here.

> Run in an image-capable Claude/Gemini. **Attach the Teacher base turnaround** (or
> her front view / HUD portrait) first so she stays on-model.

Character reference: see the locked **Visual Bible** in
[`teacher_prompt_pack.md`](teacher_prompt_pack.md) — dark hair in a neat bun, pen
behind the ear, violet teacher's blouse, laminated ID lanyard, reading glasses,
long wooden ruler (Pamalo). A communal parody archetype only — never a specific
real person.

---

## Prompt — Recess Cut-In (3-pose anime sequence)

> Using the attached Teacher reference, generate a large, high-resolution 2D anime
> portrait sequence for her dramatic "Ultimate Skill" cut-in. Skill name:
> **RECESS** (she cracks her ruler and calls the whole class to order, silencing
> the noise). Voice line: *"Class, QUIET! Makinig kayo!"*
>
> **Style:** Dramatic **anime action shot** — bold anime linework, expressive
> anime face, intense rim lighting, comic-book halftone overlays, dynamic speed
> lines, saturated punch. Close-up on upper body and face. Keep her dark bun, pen
> behind the ear, violet blouse, ID lanyard, glasses, and wooden ruler exactly
> on-model. Transparent or solid background so it can be composited.
>
> Generate **3 separate poses** (evenly framed, consistent scale):
> 1. **Anticipation:** drawing a sharp breath, raising the ruler high overhead,
>    stern glare over her glasses, dramatic shadow, coiled energy.
> 2. **Action/Shout:** the climax — mouth wide open shouting "QUIET!", the ruler
>    **cracking down toward the camera in dramatic foreshortening**, silence-pulse
>    rings and a "SHHH" burst exploding outward.
> 3. **Resolution:** a cool composed post-order pose, ruler lowered across the
>    chest, one eyebrow still raised, exhaling.

---

## Export & QA

- Export as a texture atlas: `teacher_cutin.png` + `teacher_cutin.json`.
- 3 frames (anticipation → shout → resolution), consistent scale, on-model.
- Drop into `public/assets/heroes/`.
- QA: bun/lanyard/glasses/ruler on-model in every pose; face clearly
  anime-expressive; reads at a glance when it flashes across screen (~1s).

## Integration status

`SkillCutIn` (`src/game/entities/fx/SkillCutIn.ts`) currently renders a **tinted
silhouette + speed-line panel** placeholder. Wiring `teacher_cutin` so it plays the
real 3-frame sequence is an **engine task on the backlog** (I do it when the art
exists): pass the `teacher_cutin` texture into the cut-in panel and step the frames
during the hold. The in-game `cast` body pose (base sprite sheet, `cast` row)
already plays underneath while the panel slides.
