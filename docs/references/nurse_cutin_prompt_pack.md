# Nurse — Skill Cut-In Prompt Pack (standalone store asset)

The anime **cut-in ("cut-out") animation** for the Nurse's signature skill,
authored as a **standalone, individually customizable asset** — a future
**store** item that can be swapped independently of her base sprite sheet and
skill VFX.

This is the dramatic full-screen overlay that slides across during a signature
skill (rendered by `src/game/entities/fx/SkillCutIn.ts`), NOT a gameplay sprite.
It is a **front-facing dramatic anime close-up** — the top-behind gameplay rule
does **not** apply here.

> Run in an image-capable Claude/Gemini. **Attach the Nurse base turnaround /
> front view** (or her HUD portrait) first so she stays on-model.

Character reference: see the locked **Visual Bible** in
[`nurse_prompt_pack.md`](nurse_prompt_pack.md) — crisp white scrubs, nurse cap
with a small red cross, stethoscope, first-aid belt-pouch, alcohol spray bottle.

Binding rule: an everyday **communal parody archetype** — a generic Filipino
public health nurse, never a specific real person's likeness, name, or voice.

---

## Prompt — Vaccine Drive Cut-In (3-pose anime sequence)

> Using the attached Nurse reference, generate a large, high-resolution 2D anime
> portrait sequence for her dramatic "Ultimate Skill" cut-in. Skill name:
> **VACCINE DRIVE** (she inoculates the whole squad, granting debuff immunity).
> Voice line: *"Pila nang maayos! Parang kagat lang ng langgam 'to!"*
>
> **Style:** Dramatic **anime action shot** — bold anime linework, expressive
> anime face, intense rim lighting, comic-book halftone overlays, dynamic speed
> lines, saturated punch. Close-up on upper body and face. Keep her white scrubs,
> red-cross nurse cap, stethoscope, first-aid belt-pouch, and syringe/spray
> exactly on-model. Transparent or solid background so it can be composited.
>
> Generate **3 separate poses** (evenly framed, consistent scale):
> 1. **Anticipation:** raising a syringe, flicking out an air bubble, calm focused
>    resolve, dramatic shadow.
> 2. **Action/Shout:** the climax — thrusting the syringe forward with a
>    reassuring shout, the **syringe foreshortened dramatically toward the
>    camera**, a burst of healing sparkles and cross-glyphs exploding outward.
> 3. **Resolution:** a warm confident post-jab pose, capping the syringe or hand
>    on hip, exhaling with a gentle smile.

---

## Export & QA

- Export as a texture atlas: `nurse_cutin.png` + `nurse_cutin.json`.
- 3 frames (anticipation → shout → resolution), consistent scale, on-model.
- Drop into `public/assets/heroes/`.
- QA: scrubs/red-cross-cap/stethoscope/syringe on-model in every pose; face
  clearly anime-expressive; reads at a glance when it flashes across screen (~1s).

## Integration status

`SkillCutIn` (`src/game/entities/fx/SkillCutIn.ts`) currently renders a **tinted
silhouette + speed-line panel** placeholder. Wiring `nurse_cutin` so it plays the
real 3-frame sequence is an **engine task on the backlog** (I do it when the art
exists): pass the `nurse_cutin` texture into the cut-in panel and step the frames
during the hold. The in-game `cast` body pose (base sprite sheet, `cast` row)
already plays underneath while the panel slides.
