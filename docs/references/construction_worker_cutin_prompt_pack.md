# Construction Worker — Skill Cut-In Prompt Pack (standalone store asset)

The anime **cut-in ("cut-out") animation** for the Construction Worker's signature
skill, authored as a **standalone, individually customizable asset** — a future
**store** item that can be swapped independently of his base sprite sheet and
skill VFX.

This is the dramatic full-screen overlay that slides across during a signature
skill (rendered by `src/game/entities/fx/SkillCutIn.ts`), NOT a gameplay sprite.
It is a **front-facing dramatic anime close-up** — the top-behind gameplay rule
does **not** apply here.

> Run in an image-capable Claude/Gemini. **Attach the Construction Worker base
> turnaround / front view** (or his HUD portrait) first so he stays on-model.

Character reference: see the locked **Visual Bible** in
[`construction_worker_prompt_pack.md`](construction_worker_prompt_pack.md) —
yellow hard hat, tool belt with hammer, rolled yero sheets slung on his back,
work gloves, dirt-smudged tank top.

Binding rule: an everyday **communal parody archetype** — a generic Filipino
construction laborer, never a specific real person's likeness, name, or voice.

---

## Prompt — Yero Barricade Cut-In (3-pose anime sequence)

> Using the attached Construction Worker reference, generate a large,
> high-resolution 2D anime portrait sequence for his dramatic "Ultimate Skill"
> cut-in. Skill name: **YERO BARRICADE** (he slams down an indestructible
> galvanized-iron wall to block the path). Voice line: *"Bawal dumaan, may
> ginagawa!"*
>
> **Style:** Dramatic **anime action shot** — bold anime linework, expressive
> anime face, intense rim lighting, comic-book halftone overlays, dynamic speed
> lines, saturated punch. Close-up on upper body and face. Keep his yellow hard
> hat, tool belt, hammer, slung yero sheets, and work gloves exactly on-model.
> Transparent or solid background so it can be composited.
>
> Generate **3 separate poses** (evenly framed, consistent scale):
> 1. **Anticipation:** hoisting a folded corrugated yero sheet overhead, hammer
>    ready, coiled muscle, dramatic shadow.
> 2. **Action/Shout:** the climax — slamming the yero wall down with a booming
>    shout, the **hammer/sheet foreshortened dramatically toward the camera**, a
>    dust burst and hazard-spark exploding outward.
> 3. **Resolution:** an immovable arms-crossed post-slam pose, unbothered, giving
>    a firm nod.

---

## Export & QA

- Export as a texture atlas: `construction_worker_cutin.png` +
  `construction_worker_cutin.json`.
- 3 frames (anticipation → shout → resolution), consistent scale, on-model.
- Drop into `public/assets/heroes/`.
- QA: hard-hat/hammer/yero/gloves on-model in every pose; face clearly
  anime-expressive; reads at a glance when it flashes across screen (~1s).

## Integration status

`SkillCutIn` (`src/game/entities/fx/SkillCutIn.ts`) currently renders a **tinted
silhouette + speed-line panel** placeholder. Wiring `construction_worker_cutin` so
it plays the real 3-frame sequence is an **engine task on the backlog** (I do it
when the art exists): pass the `construction_worker_cutin` texture into the cut-in
panel and step the frames during the hold. The in-game `cast` body pose (base
sprite sheet, `cast` row) already plays underneath while the panel slides.
