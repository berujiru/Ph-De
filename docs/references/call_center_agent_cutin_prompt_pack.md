# Call Center Agent — Skill Cut-In Prompt Pack (standalone store asset)

The anime **cut-in ("cut-out") animation** for the Call Center Agent's signature
skill, authored as a **standalone, individually customizable asset** — a future
**store** item that can be swapped independently of their base sprite sheet and
skill VFX.

This is the dramatic full-screen overlay that slides across during a signature
skill (rendered by `src/game/entities/fx/SkillCutIn.ts`), NOT a gameplay sprite.
It is a **front-facing dramatic anime close-up** — the top-behind gameplay rule
does **not** apply here.

> Run in an image-capable Claude/Gemini. **Attach the Call Center Agent base
> turnaround / front view** (or their HUD portrait) first so they stay on-model.

Character reference: see the locked **Visual Bible** in
[`call_center_agent_prompt_pack.md`](call_center_agent_prompt_pack.md) — headset
with a crackling boom mic, lanyard company ID, coiled cord arcing like a live
wire, smart-casual office wear.

Binding rule: an everyday **communal parody archetype** — a generic Filipino BPO
call-center agent, never a specific real person's likeness, name, or voice.

---

## Prompt — Escalate to Manager Cut-In (3-pose anime sequence)

> Using the attached Call Center Agent reference, generate a large,
> high-resolution 2D anime portrait sequence for their dramatic "Ultimate Skill"
> cut-in. Skill name: **ESCALATE TO MANAGER** (they call down an overwhelming
> feedback bolt on one enemy). Voice line, delivered in **deadpan Taglish**: *"Let
> me escalate this to my manager."*
>
> **Style:** Dramatic **anime action shot** — bold anime linework, expressive
> anime face, intense rim lighting, comic-book halftone overlays, dynamic speed
> lines, saturated punch. Close-up on upper body and face. Keep their crackling
> headset + boom mic, lanyard ID, live-wire cord, and office wear exactly
> on-model. Transparent or solid background so it can be composited.
>
> Generate **3 separate poses** (evenly framed, consistent scale):
> 1. **Anticipation:** a tired smirk, one finger raised to the boom mic, static
>    gathering, dramatic shadow.
> 2. **Action/Shout:** the climax — pressing the headset and pointing forward with
>    deadpan menace, the **boom mic / pointing hand foreshortened dramatically
>    toward the camera**, a burst of electric feedback arcs exploding outward.
> 3. **Resolution:** an unbothered post-escalation pose, sipping a coffee tumbler,
>    exhaling.

---

## Export & QA

- Export as a texture atlas: `call_center_agent_cutin.png` +
  `call_center_agent_cutin.json`.
- 3 frames (anticipation → shout → resolution), consistent scale, on-model.
- Drop into `public/assets/heroes/`.
- QA: headset/lanyard/cord/office-wear on-model in every pose; face clearly
  anime-expressive; reads at a glance when it flashes across screen (~1s).

## Integration status

`SkillCutIn` (`src/game/entities/fx/SkillCutIn.ts`) currently renders a **tinted
silhouette + speed-line panel** placeholder. Wiring `call_center_agent_cutin` so
it plays the real 3-frame sequence is an **engine task on the backlog** (I do it
when the art exists): pass the `call_center_agent_cutin` texture into the cut-in
panel and step the frames during the hold. The in-game `cast` body pose (base
sprite sheet, `cast` row) already plays underneath while the panel slides.
