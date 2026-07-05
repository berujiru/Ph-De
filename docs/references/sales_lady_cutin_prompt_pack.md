# Sales Lady — Skill Cut-In Prompt Pack (standalone store asset)

The anime **cut-in ("cut-out") animation** for Sales Lady's signature skill,
authored as a **standalone, individually customizable asset** — a future **store**
item that can be swapped independently of her base sprite sheet and skill VFX.

This is the dramatic full-screen overlay that slides across during a signature
skill (rendered by `src/game/entities/fx/SkillCutIn.ts`), NOT a gameplay sprite.
It is a **front-facing dramatic anime close-up** — the top-behind gameplay rule
does **not** apply here.

> Run in an image-capable Claude/Gemini. **Attach `sales_lady_base_turnaround.png`**
> (or her front view / HUD portrait) first so she stays on-model.

Character reference: see the locked **Visual Bible** in
[`sales_lady_prompt_pack.md`](sales_lady_prompt_pack.md) — magenta-pink retail
uniform with lanyard/name tag, neat clip/ponytail, chrome handheld megaphone,
bright yellow "SALE" tag. A communal tindera archetype, never a specific real
person.

---

## Prompt — Closing Sale Cut-In (3-pose anime sequence)

> Using the attached Sales Lady reference, generate a large, high-resolution 2D
> anime portrait sequence for her dramatic "Ultimate Skill" cut-in. Skill name:
> **CLOSING SALE** (she blasts a final sales pitch that instantly executes any
> low-HP straggler). Voice line: *"Ubusan na 'to! Sir, Ma'am, sale po tayo!"*
>
> **Style:** Dramatic **anime action shot** — bold anime linework, expressive
> anime face, intense rim lighting, comic-book halftone overlays, dynamic speed
> lines, saturated punch. Close-up on upper body and face. Keep her magenta
> uniform, lanyard/name tag, and megaphone exactly on-model. Transparent or solid
> background so it can be composited.
>
> Generate **3 separate poses** (evenly framed, consistent scale):
> 1. **Anticipation:** inhaling, snapping the megaphone up toward her mouth,
>    holding up a bright "SALE" tag, dramatic shadow, coiled energy.
> 2. **Action/Shout:** the climax — mouth wide open shouting the pitch into the
>    megaphone, the bullhorn **foreshortened dramatically toward the camera**, a
>    burst of "SALE!" sound-blast rings and a cash-register CHA-CHING sparkle.
> 3. **Resolution:** a cool confident post-pitch pose, flipping her hair or
>    tucking the megaphone under an arm, satisfied smile.

---

## Export & QA

- Export as a texture atlas: `sales_lady_cutin.png` + `sales_lady_cutin.json`.
- 3 frames (anticipation → shout → resolution), consistent scale, on-model.
- Drop into `public/assets/heroes/`.
- QA: uniform/lanyard/megaphone on-model in every pose; face clearly
  anime-expressive; reads at a glance when it flashes across screen (~1s).

## Integration status

`SkillCutIn` (`src/game/entities/fx/SkillCutIn.ts`) currently renders a **tinted
silhouette + speed-line panel** placeholder. Wiring `sales_lady_cutin` so it plays
the real 3-frame sequence is an **engine task on the backlog** (I do it when the
art exists): pass the `sales_lady_cutin` texture into the cut-in panel and step the
frames during the hold. The in-game `cast` body pose (base sprite sheet, `cast`
row) already plays underneath while the panel slides.
