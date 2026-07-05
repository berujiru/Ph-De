# Security Guard — Skill Cut-In Prompt Pack (standalone store asset)

The anime **cut-in ("cut-out") animation** for the Security Guard's signature
skill, authored as a **standalone, individually customizable asset** — a future
**store** item that can be swapped independently of his base sprite sheet and
skill VFX.

This is the dramatic full-screen overlay that slides across during a signature
skill (rendered by `src/game/entities/fx/SkillCutIn.ts`), NOT a gameplay sprite.
It is a **front-facing dramatic anime close-up** — the top-behind gameplay rule
does **not** apply here.

> Run in an image-capable Claude/Gemini. **Attach the Security Guard base
> turnaround / front view** (or his HUD portrait) first so he stays on-model.

Character reference: see the locked **Visual Bible** in
[`security_guard_prompt_pack.md`](security_guard_prompt_pack.md) — navy-blue guard
uniform with peaked cap and shiny "SECURITY" badge, duty belt with a long metal
flashlight, wooden baton (batuta), whistle on a lanyard.

Binding rule: an everyday **communal parody archetype** — a generic Filipino
security guard ("sikyu"), never a specific real person's likeness, name, or voice.

---

## Prompt — Shining Flashlight Cut-In (3-pose anime sequence)

> Using the attached Security Guard reference, generate a large, high-resolution
> 2D anime portrait sequence for his dramatic "Ultimate Skill" cut-in. Skill name:
> **SHINING FLASHLIGHT** (he sweeps a wide blinding beam that heavily slows all
> enemies). Voice line: *"Hoy! Anong ginagawa mo diyan?! Bawal tambay!"*
>
> **Style:** Dramatic **anime action shot** — bold anime linework, expressive
> anime face, intense rim lighting, comic-book halftone overlays, dynamic speed
> lines, saturated punch. Close-up on upper body and face. Keep his navy uniform,
> peaked cap, "SECURITY" badge, baton, and heavy metal flashlight exactly
> on-model. Transparent or solid background so it can be composited.
>
> Generate **3 separate poses** (evenly framed, consistent scale):
> 1. **Anticipation:** thumbing the flashlight switch, stern glare, coiled
>    authority, dramatic shadow.
> 2. **Action/Shout:** the climax — thrusting the flashlight forward with a barking
>    shout, the **flashlight lens foreshortened dramatically toward the camera**, a
>    blinding beam-cone and lens-glare exploding outward.
> 3. **Resolution:** a firm at-attention post-sweep pose, flashlight lowered to his
>    side, jaw set.

---

## Export & QA

- Export as a texture atlas: `security_guard_cutin.png` +
  `security_guard_cutin.json`.
- 3 frames (anticipation → shout → resolution), consistent scale, on-model.
- Drop into `public/assets/heroes/`.
- QA: navy-uniform/cap/badge/baton/flashlight on-model in every pose; face clearly
  anime-expressive; reads at a glance when it flashes across screen (~1s).

## Integration status

`SkillCutIn` (`src/game/entities/fx/SkillCutIn.ts`) currently renders a **tinted
silhouette + speed-line panel** placeholder. Wiring `security_guard_cutin` so it
plays the real 3-frame sequence is an **engine task on the backlog** (I do it when
the art exists): pass the `security_guard_cutin` texture into the cut-in panel and
step the frames during the hold. The in-game `cast` body pose (base sprite sheet,
`cast` row) already plays underneath while the panel slides.
