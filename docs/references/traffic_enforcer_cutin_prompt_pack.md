# Traffic Enforcer — Skill Cut-In Prompt Pack (standalone store asset)

The anime **cut-in ("cut-out") animation** for Traffic Enforcer's signature skill,
authored as a **standalone, individually customizable asset** — a future **store**
item that can be swapped independently of his base sprite sheet and skill VFX.

This is the dramatic full-screen overlay that slides across during a signature
skill (rendered by `src/game/entities/fx/SkillCutIn.ts`), NOT a gameplay sprite.
It is a **front-facing dramatic anime close-up** — the top-behind gameplay rule
does **not** apply here.

> Run in an image-capable Claude/Gemini. **Attach
> `traffic_enforcer_base_turnaround.png`** (or his front view / HUD portrait) first
> so he stays on-model.

Character reference: see the locked **Visual Bible** in
[`traffic_enforcer_prompt_pack.md`](traffic_enforcer_prompt_pack.md) — peaked
patrol cap, hi-vis neon-yellow reflective vest, lanyard whistle, red-and-white STOP
paddle baton, stern no-nonsense face.

---

## Prompt — STOP! Cut-In (3-pose anime sequence)

> Using the attached Traffic Enforcer reference, generate a large, high-resolution
> 2D anime portrait sequence for his dramatic "Ultimate Skill" cut-in. Skill name:
> **STOP!** (he throws up the STOP paddle and blows a piercing whistle that hard-
> stuns the whole road and cancels boss channels). Voice line:
> *"Tumabi ka! Huli ka! Nasaan lisensya mo?!"*
>
> **Style:** Dramatic **anime action shot** — bold anime linework, expressive
> anime face, intense rim lighting, comic-book halftone overlays, dynamic speed
> lines, saturated punch. Close-up on upper body and face. Keep his peaked patrol
> cap, neon-yellow reflective vest, whistle, and red/white STOP paddle exactly
> on-model. Transparent or solid background so it can be composited.
>
> Generate **3 separate poses** (evenly framed, consistent scale):
> 1. **Anticipation:** rearing back, drawing the whistle to his lips, paddle
>    lowered, dramatic shadow, coiled energy.
> 2. **Action/Blast:** the climax — the STOP paddle **thrust dramatically toward
>    the camera in hard foreshortening**, whistle screaming, a giant "STOP"
>    shockwave and speed lines exploding outward.
> 3. **Resolution:** a cool authoritative post-blast pose, paddle lowered, arms
>    crossed, exhaling, waving traffic off.

---

## Export & QA

- Export as a texture atlas: `traffic_enforcer_cutin.png` +
  `traffic_enforcer_cutin.json`.
- 3 frames (anticipation → blast → resolution), consistent scale, on-model.
- Drop into `public/assets/heroes/`.
- QA: cap/vest/whistle/paddle on-model in every pose; face clearly anime-expressive;
  reads at a glance when it flashes across screen (~1s).

## Integration status

`SkillCutIn` (`src/game/entities/fx/SkillCutIn.ts`) currently renders a **tinted
silhouette + speed-line panel** placeholder. Wiring `traffic_enforcer_cutin` so it
plays the real 3-frame sequence is an **engine task on the backlog** (I do it when
the art exists): pass the `traffic_enforcer_cutin` texture into the cut-in panel and
step the frames during the hold. The in-game `cast` body pose (base sprite sheet,
`cast` row) already plays underneath while the panel slides.
