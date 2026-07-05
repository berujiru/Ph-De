# Plumber — Skill Cut-In Prompt Pack (standalone store asset)

The anime **cut-in ("cut-out") animation** for Plumber's signature skill, authored
as a **standalone, individually customizable asset** — a future **store** item that
can be swapped independently of his base sprite sheet and skill VFX.

This is the dramatic full-screen overlay that slides across during a signature
skill (rendered by `src/game/entities/fx/SkillCutIn.ts`), NOT a gameplay sprite.
It is a **front-facing dramatic anime close-up** — the top-behind gameplay rule
does **not** apply here.

> Run in an image-capable Claude/Gemini. **Attach `plumber_base_turnaround.png`**
> (or his front view / HUD portrait) first so he stays on-model.

Character reference: see the locked **Visual Bible** in
[`plumber_prompt_pack.md`](plumber_prompt_pack.md) — backwards navy cap, rubber
hose coil slung across the chest, soaked blue coverall over a white sando, chrome
pipe wrench, high-pressure nozzle, easygoing confident smirk.

---

## Prompt — Flush Cut-In (3-pose anime sequence)

> Using the attached Plumber reference, generate a large, high-resolution 2D anime
> portrait sequence for his dramatic "Ultimate Skill" cut-in. Skill name:
> **FLUSH** (he cranks the valve and unleashes a massive wave that washes all the
> enemy summons off the board). Voice line: *"I-flush ang mga sagabal!"*
>
> **Style:** Dramatic **anime action shot** — bold anime linework, expressive
> anime face, intense rim lighting, comic-book halftone overlays, dynamic speed
> lines, saturated punch. Close-up on upper body and face. Keep his backwards navy
> cap, hose coil, blue coverall, and chrome pipe wrench exactly on-model.
> Transparent or solid background so it can be composited.
>
> Generate **3 separate poses** (evenly framed, consistent scale):
> 1. **Anticipation:** gripping the valve/wrench, bracing back as pressure builds,
>    dramatic shadow, coiled energy, water beading up.
> 2. **Action/Blast:** the climax — cranking the valve open and the **high-pressure
>    nozzle/hose foreshortened dramatically toward the camera**, a wall of water and
>    foam blasting outward, spray rings exploding.
> 3. **Resolution:** a cool confident post-flush pose, wrench slung over the
>    shoulder, smirking, flicking water off his hand.

---

## Export & QA

- Export as a texture atlas: `plumber_cutin.png` + `plumber_cutin.json`.
- 3 frames (anticipation → blast → resolution), consistent scale, on-model.
- Drop into `public/assets/heroes/`.
- QA: cap/hose/coverall/wrench on-model in every pose; face clearly
  anime-expressive; reads at a glance when it flashes across screen (~1s).

## Integration status

`SkillCutIn` (`src/game/entities/fx/SkillCutIn.ts`) currently renders a **tinted
silhouette + speed-line panel** placeholder. Wiring `plumber_cutin` so it plays the
real 3-frame sequence is an **engine task on the backlog** (I do it when the art
exists): pass the `plumber_cutin` texture into the cut-in panel and step the frames
during the hold. The in-game `cast` body pose (base sprite sheet, `cast` row)
already plays underneath while the panel slides.
