# Eden — Skill Cut-In Prompt Pack (standalone store asset)

The anime **cut-in ("cut-out") animation** for Eden's signature skill, authored as
a **standalone, individually customizable asset** — a future **store** item that
can be swapped independently of her base sprite sheet and skill VFX.

This is the dramatic full-screen overlay that slides across during a signature
skill (rendered by `src/game/entities/fx/SkillCutIn.ts`), NOT a gameplay sprite.
It is a **front-facing dramatic anime close-up** — the top-behind gameplay rule
does **not** apply here.

> Run in an image-capable Claude/Gemini. **Attach `eden_base_turnaround.png`** (or
> her front view / HUD portrait) first so she stays on-model.

Character reference: see the locked **Visual Bible** in
[`eden_prompt_pack.md`](eden_prompt_pack.md) — pink polka-dot bow, long black
hair, pink tee, red/white megaphone, expressive anime eyes.

---

## Prompt — Rally Cut-In (3-pose anime sequence)

> Using the attached Eden reference, generate a large, high-resolution 2D anime
> portrait sequence for her dramatic "Ultimate Skill" cut-in. Skill name:
> **RALLY** (she screams into her megaphone to fire up the whole squad). Voice
> line: *"Sugod, mga kababayan! Walang aatras!"*
>
> **Style:** Dramatic **anime action shot** — bold anime linework, expressive
> anime face, intense rim lighting, comic-book halftone overlays, dynamic speed
> lines, saturated punch. Close-up on upper body and face. Keep her pink polka-dot
> bow, black hair, pink tee, and red/white megaphone exactly on-model. Transparent
> or solid background so it can be composited.
>
> Generate **3 separate poses** (evenly framed, consistent scale):
> 1. **Anticipation:** inhaling, raising the megaphone toward her mouth, dramatic
>    shadow, coiled energy.
> 2. **Action/Shout:** the climax — mouth wide open screaming into the megaphone,
>    the bullhorn **foreshortened dramatically toward the camera**, sound-blast
>    rings exploding outward.
> 3. **Resolution:** a cool defiant post-shout pose, fist up or megaphone lowered,
>    exhaling.

---

## Export & QA

- Export as a texture atlas: `eden_cutin.png` + `eden_cutin.json`.
- 3 frames (anticipation → shout → resolution), consistent scale, on-model.
- Drop into `public/assets/heroes/`.
- QA: bow/megaphone/hair on-model in every pose; face clearly anime-expressive;
  reads at a glance when it flashes across screen (~1s).

## Integration status

`SkillCutIn` (`src/game/entities/fx/SkillCutIn.ts`) currently renders a **tinted
silhouette + speed-line panel** placeholder. Wiring `eden_cutin` so it plays the
real 3-frame sequence is an **engine task on the backlog** (I do it when the art
exists): pass the `eden_cutin` texture into the cut-in panel and step the frames
during the hold. The in-game `cast` body pose (base sprite sheet, `cast` row)
already plays underneath while the panel slides.
