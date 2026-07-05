# Farmer — Skill Cut-In Prompt Pack (standalone store asset)

The anime **cut-in ("cut-out") animation** for Farmer's signature skill, authored
as a **standalone, individually customizable asset** — a future **store** item
that can be swapped independently of his base sprite sheet and skill VFX.

This is the dramatic full-screen overlay that slides across during a signature
skill (rendered by `src/game/entities/fx/SkillCutIn.ts`), NOT a gameplay sprite.
It is a **front-facing dramatic anime close-up** — the top-behind gameplay rule
does **not** apply here.

> Run in an image-capable Claude/Gemini. **Attach `farmer_base_turnaround.png`**
> (or his front view / HUD portrait) first so he stays on-model.

Character reference: see the locked **Visual Bible** in
[`farmer_prompt_pack.md`](farmer_prompt_pack.md) — wide-brimmed woven salakot,
faded work shirt with plaid waist cloth, curved steel karit (sickle), weathered
sun-tanned face. A communal magsasaka archetype, never a specific real person.

---

## Prompt — Harvest Cut-In (3-pose anime sequence)

> Using the attached Farmer reference, generate a large, high-resolution 2D anime
> portrait sequence for his dramatic "Ultimate Skill" cut-in. Skill name:
> **HARVEST** (he reaps the field in one massive sweep, detonating the enemies'
> stacked ailments). Voice line: *"Oras na para mag-ani!"*
>
> **Style:** Dramatic **anime action shot** — bold anime linework, expressive
> anime face, intense rim lighting, comic-book halftone overlays, dynamic speed
> lines, saturated punch. Close-up on upper body and face. Keep his straw salakot,
> green work shirt, plaid waist cloth, and steel karit exactly on-model.
> Transparent or solid background so it can be composited.
>
> Generate **3 separate poses** (evenly framed, consistent scale):
> 1. **Anticipation:** shoulders coiled, raising the karit back and up, dramatic
>    shadow under the salakot brim, earth energy gathering.
> 2. **Action/Shout:** the climax — a full-body horizontal reaping sweep, the
>    crescent karit blade **foreshortened dramatically toward the camera**, a wide
>    arc of slashed grass and dust, mouth open with a shout.
> 3. **Resolution:** a cool grounded post-sweep pose, karit lowered to his side,
>    salakot brim shadowing a steady stare, exhaling.

---

## Export & QA

- Export as a texture atlas: `farmer_cutin.png` + `farmer_cutin.json`.
- 3 frames (anticipation → sweep → resolution), consistent scale, on-model.
- Drop into `public/assets/heroes/`.
- QA: salakot/karit/plaid cloth on-model in every pose; face clearly
  anime-expressive; reads at a glance when it flashes across screen (~1s).

## Integration status

`SkillCutIn` (`src/game/entities/fx/SkillCutIn.ts`) currently renders a **tinted
silhouette + speed-line panel** placeholder. Wiring `farmer_cutin` so it plays the
real 3-frame sequence is an **engine task on the backlog** (I do it when the art
exists): pass the `farmer_cutin` texture into the cut-in panel and step the frames
during the hold. The in-game `cast` body pose (base sprite sheet, `cast` row)
already plays underneath while the panel slides.
