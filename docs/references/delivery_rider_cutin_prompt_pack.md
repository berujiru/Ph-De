# Delivery Rider — Skill Cut-In Prompt Pack (standalone store asset)

The anime **cut-in ("cut-out") animation** for Delivery Rider's signature skill,
authored as a **standalone, individually customizable asset** — a future **store**
item that can be swapped independently of his base sprite sheet and skill VFX.

This is the dramatic full-screen overlay that slides across during a signature
skill (rendered by `src/game/entities/fx/SkillCutIn.ts`), NOT a gameplay sprite.
It is a **front-facing dramatic anime close-up** — the top-behind gameplay rule
does **not** apply here.

> Run in an image-capable Claude/Gemini. **Attach
> `delivery_rider_base_turnaround.png`** (or his front view / HUD portrait) first so
> he stays on-model.

Character reference: see the locked **Visual Bible** in
[`delivery_rider_prompt_pack.md`](delivery_rider_prompt_pack.md) — full-face
motorcycle helmet with the visor flipped up, big insulated square delivery backpack,
green rider jacket, fingerless riding gloves, eager cheeky grin.

---

## Prompt — Kamote Riders Cut-In (3-pose anime sequence)

> Using the attached Delivery Rider reference, generate a large, high-resolution 2D
> anime portrait sequence for his dramatic "Ultimate Skill" cut-in. Skill name:
> **KAMOTE RIDERS** (he revs his engine and calls in a trio of reckless riders to
> zoom into the horde and explode). Voice line: *"Pa-deliver po! OTW na bossing!"*
>
> **Style:** Dramatic **anime action shot** — bold anime linework, expressive
> anime face, intense rim lighting, comic-book halftone overlays, dynamic speed
> lines, saturated punch. Close-up on upper body and face. Keep his full-face
> helmet (visor up), green rider jacket, and insulated square delivery backpack
> exactly on-model. Transparent or solid background so it can be composited.
>
> Generate **3 separate poses** (evenly framed, consistent scale):
> 1. **Anticipation:** gripping and twisting the throttle, leaning low over the
>    handlebars, dramatic shadow, coiled energy, exhaust starting to puff.
> 2. **Action/Shout:** the climax — throwing a "GO!" point forward, the **revving
>    handlebar/front wheel foreshortened dramatically toward the camera**, green
>    speed-lines and three roaring rider silhouettes blasting past behind him.
> 3. **Resolution:** a cool cheeky post-rev pose, thumbs-up "delivered", visor
>    flicked, exhaling.

---

## Export & QA

- Export as a texture atlas: `delivery_rider_cutin.png` +
  `delivery_rider_cutin.json`.
- 3 frames (anticipation → shout → resolution), consistent scale, on-model.
- Drop into `public/assets/heroes/`.
- QA: helmet/jacket/backpack on-model in every pose; face clearly anime-expressive;
  reads at a glance when it flashes across screen (~1s).

## Integration status

`SkillCutIn` (`src/game/entities/fx/SkillCutIn.ts`) currently renders a **tinted
silhouette + speed-line panel** placeholder. Wiring `delivery_rider_cutin` so it
plays the real 3-frame sequence is an **engine task on the backlog** (I do it when
the art exists): pass the `delivery_rider_cutin` texture into the cut-in panel and
step the frames during the hold. The in-game `cast` body pose (base sprite sheet,
`cast` row) already plays underneath while the panel slides.
