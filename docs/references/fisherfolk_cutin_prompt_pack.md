# Fisherfolk — Skill Cut-In Prompt Pack (standalone store asset)

The anime **cut-in ("cut-out") animation** for Fisherfolk's signature skill,
authored as a **standalone, individually customizable asset** — a future **store**
item that can be swapped independently of his base sprite sheet and skill VFX.

This is the dramatic full-screen overlay that slides across during a signature
skill (rendered by `src/game/entities/fx/SkillCutIn.ts`), NOT a gameplay sprite.
It is a **front-facing dramatic anime close-up** — the top-behind gameplay rule
does **not** apply here.

> Run in an image-capable Claude/Gemini. **Attach the Fisherfolk base turnaround**
> (or his front view / HUD portrait) first so he stays on-model.

Character reference: see the locked **Visual Bible** in
[`fisherfolk_prompt_pack.md`](fisherfolk_prompt_pack.md) — wide woven salakot sun
hat, sun-browned salt-crusted look, sea-blue sando, rolled trousers, a buoy/float
at the belt, circular cast net (Lambat) with a weighted beaded rim. A communal
parody archetype only — never a specific real person.

---

## Prompt — Lambat Cut-In (3-pose anime sequence)

> Using the attached Fisherfolk reference, generate a large, high-resolution 2D
> anime portrait sequence for his dramatic "Ultimate Skill" cut-in. Skill name:
> **LAMBAT** (he whirls and hurls his cast net to haul the enemies in). Voice
> line: *"Huli ka, balbon!"*
>
> **Style:** Dramatic **anime action shot** — bold anime linework, expressive
> anime face, intense rim lighting, comic-book halftone overlays, dynamic speed
> lines, saturated punch. Close-up on upper body and face. Keep his woven salakot,
> sea-blue sando, weathered face, and beaded cast net exactly on-model. Transparent
> or solid background so it can be composited.
>
> Generate **3 separate poses** (evenly framed, consistent scale):
> 1. **Anticipation:** quiet watchful focus, net gathered and coiled over one
>    shoulder, winding up the whirl, dramatic shadow, coiled energy.
> 2. **Action/Shout:** the climax — mouth open with a sharp shout, casting the net
>    **spreading wide toward the camera in dramatic foreshortening**, water splash
>    and droplet spray exploding outward.
> 3. **Resolution:** a cool calm post-cast pose, hauling the net line taut with a
>    slight smirk, exhaling.

---

## Export & QA

- Export as a texture atlas: `fisherfolk_cutin.png` + `fisherfolk_cutin.json`.
- 3 frames (anticipation → shout → resolution), consistent scale, on-model.
- Drop into `public/assets/heroes/`.
- QA: salakot/sando/cast net on-model in every pose; face clearly anime-expressive;
  reads at a glance when it flashes across screen (~1s).

## Integration status

`SkillCutIn` (`src/game/entities/fx/SkillCutIn.ts`) currently renders a **tinted
silhouette + speed-line panel** placeholder. Wiring `fisherfolk_cutin` so it plays
the real 3-frame sequence is an **engine task on the backlog** (I do it when the
art exists): pass the `fisherfolk_cutin` texture into the cut-in panel and step the
frames during the hold. The in-game `cast` body pose (base sprite sheet, `cast`
row) already plays underneath while the panel slides.
