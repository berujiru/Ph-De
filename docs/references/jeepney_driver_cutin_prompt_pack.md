# Jeepney Driver — Skill Cut-In Prompt Pack (standalone store asset)

The anime **cut-in ("cut-out") animation** for Jeepney Driver's signature skill,
authored as a **standalone, individually customizable asset** — a future **store**
item that can be swapped independently of his base sprite sheet and skill VFX.

This is the dramatic full-screen overlay that slides across during a signature
skill (rendered by `src/game/entities/fx/SkillCutIn.ts`), NOT a gameplay sprite.
It is a **front-facing dramatic anime close-up** — the top-behind gameplay rule
does **not** apply here.

> Run in an image-capable Claude/Gemini. **Attach the Jeepney Driver base
> turnaround** (or his front view / HUD portrait) first so he stays on-model.

Character reference: see the locked **Visual Bible** in
[`jeepney_driver_prompt_pack.md`](jeepney_driver_prompt_pack.md) — flat driver's
cap, stubble, white face towel over one shoulder, emerald sando, coin-change pouch
at the waist, chrome exhaust pipe (Tambutso). A communal parody archetype only —
never a specific real person.

---

## Prompt — Barya Lang Po Cut-In (3-pose anime sequence)

> Using the attached Jeepney Driver reference, generate a large, high-resolution 2D
> anime portrait sequence for his dramatic "Ultimate Skill" cut-in. Skill name:
> **BARYA LANG PO** (he flings a fistful of coin shrapnel like a shotgun blast).
> Voice line: *"Barya lang sa umaga! Para po!"*
>
> **Style:** Dramatic **anime action shot** — bold anime linework, expressive
> anime face, intense rim lighting, comic-book halftone overlays, dynamic speed
> lines, saturated punch. Close-up on upper body and face. Keep his driver's cap,
> stubble, white face towel, emerald sando, coin pouch, and chrome exhaust pipe
> exactly on-model. Transparent or solid background so it can be composited.
>
> Generate **3 separate poses** (evenly framed, consistent scale):
> 1. **Anticipation:** grabbing a fistful of coins from the pouch, cocky squint,
>    winding his throwing arm back, dramatic shadow, coiled energy.
> 2. **Action/Shout:** the climax — mouth open shouting, hurling the coins
>    **toward the camera in dramatic foreshortening**, a fanning shotgun-cone of
>    brassy coins and smog exploding outward.
> 3. **Resolution:** a cool unbothered-veteran post-throw pose, wiping his hands on
>    the face towel or flicking a last coin, exhaling.

---

## Export & QA

- Export as a texture atlas: `jeepney_driver_cutin.png` + `jeepney_driver_cutin.json`.
- 3 frames (anticipation → shout → resolution), consistent scale, on-model.
- Drop into `public/assets/heroes/`.
- QA: cap/face towel/coin pouch/exhaust pipe on-model in every pose; face clearly
  anime-expressive; reads at a glance when it flashes across screen (~1s).

## Integration status

`SkillCutIn` (`src/game/entities/fx/SkillCutIn.ts`) currently renders a **tinted
silhouette + speed-line panel** placeholder. Wiring `jeepney_driver_cutin` so it
plays the real 3-frame sequence is an **engine task on the backlog** (I do it when
the art exists): pass the `jeepney_driver_cutin` texture into the cut-in panel and
step the frames during the hold. The in-game `cast` body pose (base sprite sheet,
`cast` row) already plays underneath while the panel slides.
