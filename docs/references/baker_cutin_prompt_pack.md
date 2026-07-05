# Baker — Skill Cut-In Prompt Pack (standalone store asset)

The anime **cut-in ("cut-out") animation** for Baker's signature skill, authored as
a **standalone, individually customizable asset** — a future **store** item that
can be swapped independently of his base sprite sheet and skill VFX.

This is the dramatic full-screen overlay that slides across during a signature
skill (rendered by `src/game/entities/fx/SkillCutIn.ts`), NOT a gameplay sprite.
It is a **front-facing dramatic anime close-up** — the top-behind gameplay rule
does **not** apply here.

> Run in an image-capable Claude/Gemini. **Attach `baker_base_turnaround.png`** (or
> his front view / HUD portrait) first so he stays on-model.

Character reference: see the locked **Visual Bible** in
[`baker_prompt_pack.md`](baker_prompt_pack.md) — white bakery cap with red bandana,
flour-dusted white apron, white sando, hot metal bread tray, ember-glowing pandesal
sack, cheerful sweaty grin.

---

## Prompt — Dough Knead Cut-In (3-pose anime sequence)

> Using the attached Baker reference, generate a large, high-resolution 2D anime
> portrait sequence for his dramatic "Ultimate Skill" cut-in. Skill name:
> **DOUGH KNEAD** (he slams and kneads a molten mass of dough, flattening the
> enemy's armor and spite out of them). Voice line:
> *"Masa-masahin ko mukha niyo! Init pa!"*
>
> **Style:** Dramatic **anime action shot** — bold anime linework, expressive
> anime face, intense rim lighting, comic-book halftone overlays, dynamic speed
> lines, saturated punch. Close-up on upper body and face. Keep his red bandana,
> white bakery cap, flour-dusted apron, and the ember-glowing dough exactly
> on-model. Transparent or solid background so it can be composited.
>
> Generate **3 separate poses** (evenly framed, consistent scale):
> 1. **Anticipation:** rearing back, both fists raised over a glowing hot mass of
>    dough, dramatic shadow, coiled energy, flour rising.
> 2. **Action/Slam:** the climax — both fists SLAMMING down into the dough,
>    kneading it flat, a burst of flour and heat **foreshortened dramatically
>    toward the camera**, impact rings exploding outward.
> 3. **Resolution:** a cool defiant post-slam pose, dusting flour off his hands,
>    grinning, exhaling steam.

---

## Export & QA

- Export as a texture atlas: `baker_cutin.png` + `baker_cutin.json`.
- 3 frames (anticipation → slam → resolution), consistent scale, on-model.
- Drop into `public/assets/heroes/`.
- QA: cap/bandana/apron/dough on-model in every pose; face clearly anime-expressive;
  reads at a glance when it flashes across screen (~1s).

## Integration status

`SkillCutIn` (`src/game/entities/fx/SkillCutIn.ts`) currently renders a **tinted
silhouette + speed-line panel** placeholder. Wiring `baker_cutin` so it plays the
real 3-frame sequence is an **engine task on the backlog** (I do it when the art
exists): pass the `baker_cutin` texture into the cut-in panel and step the frames
during the hold. The in-game `cast` body pose (base sprite sheet, `cast` row)
already plays underneath while the panel slides.
