# Sorbetes Vendor — Skill Cut-In Prompt Pack (standalone store asset)

The anime **cut-in ("cut-out") animation** for Sorbetes Vendor's signature skill,
authored as a **standalone, individually customizable asset** — a future **store**
item that can be swapped independently of his base sprite sheet and skill VFX.

This is the dramatic full-screen overlay that slides across during a signature
skill (rendered by `src/game/entities/fx/SkillCutIn.ts`), NOT a gameplay sprite.
It is a **front-facing dramatic anime close-up** — the top-behind gameplay rule
does **not** apply here.

> Run in an image-capable Claude/Gemini. **Attach
> `sorbetes_vendor_base_turnaround.png`** (or his front view / HUD portrait) first
> so he stays on-model.

Character reference: see the locked **Visual Bible** in
[`sorbetes_vendor_prompt_pack.md`](sorbetes_vendor_prompt_pack.md) — rose-pink
painted sorbetes pushcart with domed lid and brass bell, apron and bucket
hat/cap, metal ice-cream scoop, pastel cones. A communal sorbetero archetype,
never a specific real person.

---

## Prompt — Dirty Ice Cream Cut-In (3-pose anime sequence)

> Using the attached Sorbetes Vendor reference, generate a large, high-resolution
> 2D anime portrait sequence for his dramatic "Ultimate Skill" cut-in. Skill name:
> **DIRTY ICE CREAM** (he scatters three explosive ice-cream traps that freeze the
> path). Voice line: *"Sorbetes! Walang halong kemikal!"*
>
> **Style:** Dramatic **anime action shot** — bold anime linework, expressive
> anime face, intense rim lighting, comic-book halftone overlays, dynamic speed
> lines, saturated punch. Close-up on upper body and face. Keep his rose-pink
> cart/apron, cap, brass bell, and scoop exactly on-model. Transparent or solid
> background so it can be composited.
>
> Generate **3 separate poses** (evenly framed, consistent scale):
> 1. **Anticipation:** ringing the brass bell high, cocking the loaded scoop back
>    with a mischievous grin, dramatic shadow, frost mist gathering.
> 2. **Action/Shout:** the climax — a wide swing flinging three glowing icy-blue
>    ice-cream globs **toward the camera**, the scoop foreshortened dramatically,
>    frost crystals and cone confetti flying, mouth wide open shouting.
> 3. **Resolution:** a cool relaxed post-scoop pose, resting the scoop on his
>    shoulder, satisfied wink.

---

## Export & QA

- Export as a texture atlas: `sorbetes_vendor_cutin.png` +
  `sorbetes_vendor_cutin.json`.
- 3 frames (anticipation → scoop-fling → resolution), consistent scale, on-model.
- Drop into `public/assets/heroes/`.
- QA: cart/apron/bell/scoop on-model in every pose; face clearly anime-expressive;
  reads at a glance when it flashes across screen (~1s).

## Integration status

`SkillCutIn` (`src/game/entities/fx/SkillCutIn.ts`) currently renders a **tinted
silhouette + speed-line panel** placeholder. Wiring `sorbetes_vendor_cutin` so it
plays the real 3-frame sequence is an **engine task on the backlog** (I do it when
the art exists): pass the `sorbetes_vendor_cutin` texture into the cut-in panel and
step the frames during the hold. The in-game `cast` body pose (base sprite sheet,
`cast` row) already plays underneath while the panel slides.
