# Taho Vendor — Skill Cut-In Prompt Pack (standalone store asset)

The anime **cut-in ("cut-out") animation** for the Taho Vendor's signature skill,
authored as a **standalone, individually customizable asset** — a future
**store** item that can be swapped independently of his base sprite sheet and
skill VFX.

This is the dramatic full-screen overlay that slides across during a signature
skill (rendered by `src/game/entities/fx/SkillCutIn.ts`), NOT a gameplay sprite.
It is a **front-facing dramatic anime close-up** — the top-behind gameplay rule
does **not** apply here.

> Run in an image-capable Claude/Gemini. **Attach the Taho Vendor base turnaround
> / front view** (or his HUD portrait) first so he stays on-model.

Character reference: see the locked **Visual Bible** in
[`taho_vendor_prompt_pack.md`](taho_vendor_prompt_pack.md) — twin aluminum taho
canisters on a shoulder yoke (pingga), metal ladle/scooper, plaid overshirt over
a sando, bucket hat, warm caramel arnibal.

Binding rule: an everyday **communal parody archetype** — a generic Filipino
street taho vendor, never a specific real person's likeness, name, or voice.

---

## Prompt — Hot Syrup Cut-In (3-pose anime sequence)

> Using the attached Taho Vendor reference, generate a large, high-resolution 2D
> anime portrait sequence for his dramatic "Ultimate Skill" cut-in. Skill name:
> **HOT SYRUP** (he flings a scalding wave of arnibal that pins enemies in a
> sticky puddle). Voice line: *"Tahooooo! Mainit pa!"*
>
> **Style:** Dramatic **anime action shot** — bold anime linework, expressive
> anime face, intense rim lighting, comic-book halftone overlays, dynamic speed
> lines, saturated punch. Close-up on upper body and face. Keep his twin aluminum
> canisters, shoulder yoke, plaid overshirt, bucket hat, and metal ladle exactly
> on-model. Transparent or solid background so it can be composited.
>
> Generate **3 separate poses** (evenly framed, consistent scale):
> 1. **Anticipation:** dipping the ladle into the canister, syrup dripping, coiled
>    energy, dramatic shadow.
> 2. **Action/Shout:** the climax — flinging a scalding arc of caramel arnibal,
>    the **ladle foreshortened dramatically toward the camera**, steam and syrup
>    droplets exploding outward as he calls out.
> 3. **Resolution:** a proud singsong-hawker pose, ladle shouldered, exhaling with
>    a satisfied grin.

---

## Export & QA

- Export as a texture atlas: `taho_vendor_cutin.png` + `taho_vendor_cutin.json`.
- 3 frames (anticipation → shout → resolution), consistent scale, on-model.
- Drop into `public/assets/heroes/`.
- QA: canisters/yoke/ladle/plaid on-model in every pose; face clearly
  anime-expressive; reads at a glance when it flashes across screen (~1s).

## Integration status

`SkillCutIn` (`src/game/entities/fx/SkillCutIn.ts`) currently renders a **tinted
silhouette + speed-line panel** placeholder. Wiring `taho_vendor_cutin` so it
plays the real 3-frame sequence is an **engine task on the backlog** (I do it when
the art exists): pass the `taho_vendor_cutin` texture into the cut-in panel and
step the frames during the hold. The in-game `cast` body pose (base sprite sheet,
`cast` row) already plays underneath while the panel slides.
