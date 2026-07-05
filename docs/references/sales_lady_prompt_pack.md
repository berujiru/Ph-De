# Sales Lady — Character Art Prompt Pack

Ready-to-paste prompts for generating **Sales Lady**, a fully-animated hero.
Follows the two-phase workflow in `docs/CHARACTER_VISUAL_PROMPT_GUIDE.md`:
**Phase 1** locks a consistent base + all camera angles; **Phase 2/3** reuse
that base image as a reference so every sheet stays on-model.

> Run these in an image-capable Claude/Gemini (not the coding CLI). Always
> **attach the previous phase's output** as reference before generating the next.

---

## Sales Lady Visual Bible (locked — keep identical across every phase)

Synthesized from her profession + attack (no portrait exists yet). Do not drift:

- **Who:** Sales Lady — a poised, relentlessly energetic adult Filipina
  **department-store sales clerk (tindera)**. An everyday citizen worker,
  polished and tireless — *not* a fantasy warrior, *not* a specific real person.
- **Signature gear:** a crisp **retail uniform blazer/vest with a name tag /
  lanyard ID**, hair in a neat clip or ponytail — her #1 read-at-a-glance
  silhouette cue; the tidy uniform-and-lanyard read must survive every angle.
- **Outfit:** a fitted **uniform blazer or polo** over a blouse, a knee-length
  skirt or slacks, low heels/flats. Clean, corporate-retail, presentable.
- **Prop / weapon:** a small **handheld megaphone / clip-on headset mic**; her
  attack is a rapid-fire verbal **"Ma'am/Sir!" sales pitch** — a fast hitscan of
  shouted sale words. She can also wave a **"SALE" flyer/tag** for the read.
- **Expression:** bright customer-service smile, sharp eyes, unstoppable poise.
- **Style:** High-contrast anime cel-shaded art, flat colors, bold clean outer
  strokes, 2D mobile game asset (Persona 5 UI pop × Hades silhouette), plain
  solid/white background, isolated character.
- **Palette:** vivid **magenta-pink** uniform anchored on `#ec4899` (her team
  tint), white blouse, dark skirt/slacks, a bright yellow "SALE" tag/flyer accent,
  chrome megaphone. Sound-word pops read as pink-and-white.

---

## Phase 1 — Base Concept + Camera Angles (do this first)

**Prompt:**
> Generate a comprehensive 2D character turnaround reference sheet for a mobile
> game character named Sales Lady.
>
> **Character:** A poised, energetic adult Filipina department-store sales clerk.
> Wearing a crisp **retail uniform blazer/vest with a name tag and lanyard ID**,
> a white blouse, a knee-length skirt or slacks, and low flats; hair in a neat
> clip or ponytail. Holding a small **handheld megaphone** and a bright yellow
> **"SALE" flyer/tag**. Bright customer-service smile with sharp, confident eyes.
> An everyday hardworking Filipina worker, not a fantasy warrior.
>
> **Style:** High-contrast anime cel-shaded art, flat colors, bold clean outer
> strokes, 2D mobile game asset (Persona 5 UI pop crossed with Hades
> silhouettes). Plain solid background, isolated character.
>
> **Color palette:** vivid magenta-pink uniform (anchor `#ec4899`), white blouse,
> dark skirt/slacks, bright yellow "SALE" tag accent, chrome megaphone.
>
> **Required Layout:** Show the exact same character in a row from these angles.
> Clothing, proportions, lanyard/name tag, and the megaphone must remain identical
> in every view:
> 1. **Front View:** looking directly at the camera.
> 2. **Side Profile:** 90-degree turn.
> 3. **Rear View (straight back):** looking completely away from the camera — we
>    see the back of her uniform, ponytail/clip, and her back.
> 4. **TOP-BEHIND (high-angle rear 3/4) — THE GAMEPLAY VIEW:** camera high above
>    and behind her, tilted (NOT flat zenith). We see the top of her head from
>    above, her shoulders and back as she faces away into the distance. This is
>    the angle her in-game sprites are drawn from — make it clean and clear.
> 5. **TOP-FRONT (high-angle front 3/4):** camera high above and in front,
>    tilted. We see the top of her head plus her face and chest.
>
> Ensure the magenta uniform with lanyard/name tag and the megaphone are clearly
> readable in all five views.

*Save the result as `docs/references/sales_lady_base_turnaround.png`. This is the
base reference for every following phase.*

---

## Phase 2 — Animated Hero Sprite Sheet (TOP-BEHIND)

**Attach `sales_lady_base_turnaround.png` first**, then:

> Attached is the base turnaround sheet for Sales Lady. Generate a strictly
> formatted 2D sprite sheet for a top-down auto-battler.
>
> **Crucial Perspective:** Sales Lady is a Hero. The camera is a high top-down
> oblique above and BEHIND our front line, so she faces AWAY from us into the
> enemy. **ALL frames must be drawn from a HIGH-ANGLE REAR VIEW (top-behind, rear
> 3/4)** — top of head from above, shoulders, and back. Not a flat zenith, no side
> profiles, no low angles.
>
> **Style & Formatting:** Match the anime cel-shaded style of the reference
> exactly (magenta uniform, white blouse, lanyard/name tag, chrome megaphone). Lay out as horizontal rows, one animation per row, each frame in its own evenly-spaced cell, non-overlapping, with consistent size and centering.
>
> **OUTPUT RULES (critical — the last generation drew these by mistake):** Fully **transparent** background — NO white fill. Do NOT draw any grid lines, cell borders, boxes, guide lines, or separators. Do NOT render any text, row names, labels, numbers, or captions anywhere in the image. Output ONLY the character art, arranged in evenly-spaced **invisible** cells.
>
> **MANDATORY LAYOUT — exactly 6 rows, in this exact top-to-bottom order:**
> 1. **`idle`** — EXACTLY 3 frames: standing, gentle breathing/bounce, megaphone
>    held ready at her side (rear view).
> 2. **`march`** — EXACTLY 4 frames: a full walk cycle advancing forward, brisk
>    and purposeful (rear view).
> 3. **`attack`** — EXACTLY 3 frames: a **rapid-fire "Ma'am/Sir!" sales pitch** —
>    snapping the megaphone up and shouting a burst of pink-white sound-word pops
>    forward. Frame 2 is the clear impact frame with the sound blast at full
>    projection (rear view). Fast, machine-gun energy.
> 4. **`cast`** — EXACTLY 3 frames: her signature skill **Closing Sale** —
>    planting her feet, **thrusting the megaphone and "SALE" tag high** and
>    projecting a huge broadcast, building energy (rear view, dramatic).
> 5. **`celebrate`** — EXACTLY 2 frames: victory cheer, **raised fist** with the
>    megaphone, head turned slightly so we catch her bright grin (rear-3/4 view).
> 6. **`defeat`** — EXACTLY 2 frames: morale broken — lowering the megaphone and
>    **taking a knee**, slumped and exhausted (rear view). She is tired, NOT dead.
>
> Verify every frame in every row is present in the final grid.

*Export from Aseprite as `sales_lady.png` + `sales_lady.json` (JSON Hash or
Array), with the tag names above spelled exactly:
`idle march attack cast celebrate defeat`.*

---

## Phase 3 — Closing Sale Skill Cut-In (anime-style)

**Attach `sales_lady_base_turnaround.png` (or the front view) first**, then:

> Using the attached Sales Lady reference, generate a large high-resolution 2D
> portrait sequence for her dramatic "Ultimate Skill" cut-in. Skill name:
> **CLOSING SALE** (she blasts a final sales pitch that instantly executes any
> low-HP straggler). Voice line: *"Ubusan na 'to! Sir, Ma'am, sale po tayo!"*
>
> **Style:** Dramatic anime action shot, intense lighting, comic-book halftone
> overlays, dynamic speed lines. Close-up on upper body and face. Keep her
> magenta uniform, lanyard/name tag, and megaphone on-model.
>
> Generate 3 separate poses:
> 1. **Anticipation:** inhaling, snapping the megaphone up toward her mouth,
>    holding up a bright "SALE" tag, dramatic shadow, coiled energy.
> 2. **Action/Shout:** the climax — mouth wide open shouting the pitch into the
>    megaphone, the bullhorn foreshortened dramatically toward the camera, a
>    burst of "SALE!" sound-blast rings and a cash-register CHA-CHING sparkle.
> 3. **Resolution:** a cool confident post-pitch pose, flipping her hair or
>    tucking the megaphone under an arm, satisfied smile.

*Export as `sales_lady_cutin.png` + `sales_lady_cutin.json` (texture atlas). The
in-game `cast` body pose (Phase 2, row 4) plays underneath while this panel
slides.*

---

## Export & QA reminders

- Transparent background, consistent frame size, no clipped limbs/megaphone.
- Tag names MUST match the engine states 1:1 — see the checklist in
  `docs/CHARACTER_VISUAL_PROMPT_GUIDE.md` (Phase 4).
- Drop finished files in `public/assets/heroes/`:
  `sales_lady.png`, `sales_lady.json`, `sales_lady_cutin.png`,
  `sales_lady_cutin.json`.

## Integration status

**The engine side is already done** — the model layer is `Sprite`-based, every
state routes through the sprite-sheet path with a tween fallback, Sales Lady's
`spriteKey` is `sales_lady`, and `GameScene.createHeroAnimations()` auto-wires
any hero atlas that loads. Until the art exists Sales Lady renders the tinted
`hero-base` placeholder (no broken texture) and still animates all six states via
tweens.

**To light up the real art, once you've generated the sheets:**
1. Drop `sales_lady.png` + `sales_lady.json` (and `sales_lady_cutin.png` +
   `sales_lady_cutin.json`) into `public/assets/heroes/`.
2. In `GameScene.preload()`, uncomment:
   `this.load.aseprite('sales_lady', '/assets/heroes/sales_lady.png', '/assets/heroes/sales_lady.json');`
   That's it — the six states play from real frames automatically (atlas key ===
   `spriteKey` === `sales_lady`).

**Still on the backlog (done when you're ready):** feed `sales_lady_cutin` into
`SkillCutIn` so the Closing Sale cut-in plays real frames instead of the tinted
silhouette. The `cast` body pose already plays underneath.
