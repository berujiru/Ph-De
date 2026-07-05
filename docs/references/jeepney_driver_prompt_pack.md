# Jeepney Driver — Character Art Prompt Pack

Ready-to-paste prompts for generating **Jeepney Driver**, a fully-animated hero.
Follows the two-phase workflow in `docs/CHARACTER_VISUAL_PROMPT_GUIDE.md`:
**Phase 1** locks a consistent base + all camera angles; **Phase 2/3** reuse
that base image as a reference so every sheet stays on-model.

> Run these in an image-capable Claude/Gemini (not the coding CLI). Always
> **attach the previous phase's output** as reference before generating the next.

---

## Jeepney Driver Visual Bible (locked — keep identical across every phase)

No portrait exists yet — this bible is **synthesized** from his profession
(jeepney driver), his weapon (a **revving, smog-spewing exhaust pipe /
*Tambutso*** swung as a melee cleave), and his `balance.ts` color anchor
`#10b981` (emerald). Do not drift:

- **Who:** Jeepney Driver — a sturdy, sun-weathered Filipino **jeepney driver**,
  middle-aged, king of his route. An everyday hardworking Filipino, gruff but
  big-hearted — *not* a shiny fantasy warrior, *not* a specific real person. A
  communal parody archetype only.
- **Hair:** short dark hair under a well-worn **flat driver's cap** (or bandana),
  a bit of stubble.
- **Signature read-at-a-glance cue:** a **face towel (bimpo) slung over one
  shoulder / around the neck** and a bulging **coin-change pouch** at his waist,
  **plus** the chrome **exhaust pipe (Tambutso)** hefted in both hands — this
  cluster is his #1 silhouette read and must survive every angle.
- **Outfit:** a sleeveless **emerald sando / undershirt** (`#10b981`) or worn
  green polo, tsinelas/sandals, grease-smudged forearms, a chunky wristwatch.
- **Prop / weapon:** a battered chrome **exhaust pipe (Tambutso)** that he
  **revs and swings in wide melee cleaves**, belching bursts of smog with each
  hit.
- **Expression:** unbothered veteran cool — squinting, jaw working a toothpick.
- **Style:** High-contrast cel-shaded vector art, flat colors, bold clean outer
  strokes, 2D mobile game asset (Persona 5 UI pop × Hades silhouette), plain
  solid/white background, isolated character.
- **Palette:** emerald sando (anchor `#10b981`), dark cap, white face towel,
  chrome/grey exhaust pipe, brassy coins, grey-white smog puffs. (Any engine tint
  is only a fallback for missing sprites — the real sheet uses his true colors, no
  flat wash.)

---

## Phase 1 — Base Concept + Camera Angles (do this first)

**Prompt:**
> Generate a comprehensive 2D character turnaround reference sheet for a mobile
> game character named Jeepney Driver.
>
> **Character:** A sturdy, sun-weathered Filipino jeepney driver, middle-aged.
> Short dark hair under a worn **flat driver's cap**, light stubble; a sleeveless
> **emerald green sando/undershirt**, a **white face towel over one shoulder**, a
> bulging **coin-change pouch** at his waist, sandals and a chunky wristwatch;
> hefting a battered chrome **exhaust pipe (Tambutso)** in both hands with a puff
> of smog. Unbothered veteran-cool expression, squinting. An everyday hardworking
> Filipino, not a fantasy warrior.
>
> **Style:** High-contrast cel-shaded vector art, flat colors, bold clean outer
> strokes, 2D mobile game asset (Persona 5 UI pop crossed with Hades
> silhouettes). Plain solid background, isolated character.
>
> **Required Layout:** Show the exact same character in a row from these angles.
> Clothing, proportions, cap, face towel, coin pouch, and the exhaust pipe must
> remain identical in every view:
> 1. **Front View:** looking directly at the camera.
> 2. **Side Profile:** 90-degree turn.
> 3. **Rear View (straight back):** looking completely away from the camera — we
>    see the back of his head, the cap, the towel draped over his shoulder, and his
>    back.
> 4. **TOP-BEHIND (high-angle rear 3/4) — THE GAMEPLAY VIEW:** camera high above
>    and behind him, tilted (NOT flat zenith). We see the top of his cap, the towel
>    and broad shoulders from above, his back and the exhaust pipe as he faces away
>    into the distance. This is the angle his in-game sprites are drawn from — make
>    it clean and clear.
> 5. **TOP-FRONT (high-angle front 3/4):** camera high above and in front, tilted.
>    We see the top of his cap plus his face, the coin pouch, and chest.
>
> Ensure the emerald sando, the face towel, the coin pouch, and the chrome exhaust
> pipe are clearly readable in all five views.

*Save the result as `docs/references/jeepney_driver_base_turnaround.png`. This is
the base reference for every following phase.*

---

## Phase 2 — Animated Hero Sprite Sheet (TOP-BEHIND)

**Attach `jeepney_driver_base_turnaround.png` first**, then:

> Attached is the base turnaround sheet for Jeepney Driver. Generate a strictly
> formatted 2D sprite sheet for a top-down auto-battler.
>
> **Crucial Perspective:** Jeepney Driver is a Hero. The camera is a high top-down
> oblique above and BEHIND our front line, so he faces AWAY from us into the enemy.
> **ALL frames must be drawn from a HIGH-ANGLE REAR VIEW (top-behind, rear 3/4)** —
> top of the cap, the towel and shoulders from above, his back. Not a flat zenith,
> no side profiles, no low angles.
>
> **Style & Formatting:** Match the cel-shaded vector style of the reference
> exactly (emerald sando, driver's cap, face towel, coin pouch, chrome exhaust
> pipe). Clean grid, one animation per row, evenly spaced, non-overlapping poses,
> on a transparent or solid white background. Consistent frame size and centering.
>
> **MANDATORY LAYOUT — exactly 6 labelled rows:**
> 1. **`idle`** — EXACTLY 3 frames: standing, gentle breathing/bounce, exhaust pipe
>    resting on one shoulder (rear view).
> 2. **`march`** — EXACTLY 4 frames: a full walk cycle advancing forward, a heavy
>    confident swagger (rear view).
> 3. **`attack`** — EXACTLY 3 frames: his basic melee-cleave attack — **revving and
>    swinging the exhaust pipe in a wide horizontal arc**, belching smog. Frame 2 is
>    the clear impact frame at the bottom of the swing with a smog-burst (rear
>    view).
> 4. **`cast`** — EXACTLY 3 frames: his signature skill **Barya Lang Po** — digging
>    into the coin pouch and **hurling a fistful of coin shrapnel forward like a
>    shotgun blast**, a spreading cone of coins (rear view, dramatic).
> 5. **`celebrate`** — EXACTLY 2 frames: victory cheer, **raised fist**, exhaust
>    pipe thrust up, head turned slightly so we catch his grin (rear-3/4 view).
> 6. **`defeat`** — EXACTLY 2 frames: morale broken — lowering the exhaust pipe and
>    **taking a knee**, slumped and winded, wiping his brow with the towel (rear
>    view). He is tired, NOT dead.
>
> Verify every frame in every row is present in the final grid.

*Export from Aseprite as `jeepney_driver.png` + `jeepney_driver.json` (JSON Hash
or Array), with the tag names above spelled exactly: `idle march attack cast
celebrate defeat`.*

---

## Phase 3 — Barya Lang Po Skill Cut-In (anime-style)

**Attach `jeepney_driver_base_turnaround.png` (or the front view) first**, then:

> Using the attached Jeepney Driver reference, generate a large high-resolution 2D
> portrait sequence for his dramatic "Ultimate Skill" cut-in. Skill name: **BARYA
> LANG PO** (he flings a fistful of coins like shotgun shrapnel for a wide AoE
> blast). Voice line: *"Barya lang sa umaga! Para po!"*
>
> **Style:** Dramatic anime action shot, intense lighting, comic-book halftone
> overlays, dynamic speed lines. Close-up on upper body and face. Keep his emerald
> sando, driver's cap, face towel, coin pouch, and chrome exhaust pipe on-model.
>
> Generate 3 separate poses:
> 1. **Anticipation:** grabbing a heaping fistful of coins from the pouch, drawing
>    his arm back, dramatic shadow, coins glinting.
> 2. **Action/Shout:** the climax — mouth wide open barking "Para po!", a **spray
>    of coins foreshortened exploding toward the camera** like a shotgun blast,
>    brassy speed lines and motion streaks.
> 3. **Resolution:** a cool post-throw pose, empty hand shaking off the last coins,
>    towel swiped across his neck, exhaling with a smirk.

*Export as `jeepney_driver_cutin.png` + `jeepney_driver_cutin.json` (texture
atlas). The in-game `cast` body pose (Phase 2, row 4) plays underneath while this
panel slides.*

---

## Export & QA reminders

- Transparent background, consistent frame size, no clipped limbs/exhaust pipe.
- Tag names MUST match the engine states 1:1 — see the checklist in
  `docs/CHARACTER_VISUAL_PROMPT_GUIDE.md` (Phase 4).
- Drop finished files in `public/assets/heroes/`:
  `jeepney_driver.png`, `jeepney_driver.json`, `jeepney_driver_cutin.png`,
  `jeepney_driver_cutin.json`.

## Integration status

**The engine side is already done** — the model layer is `Sprite`-based, every
state routes through the sprite-sheet path with a tween fallback, Jeepney
Driver's `spriteKey` resolves to `jeepney_driver`, and
`GameScene.createHeroAnimations()` auto-wires any hero atlas that loads. Until the
art exists Jeepney Driver renders the tinted `hero-base` placeholder (no broken
texture) and still animates all six states via tweens.

**To light up the real art, once you've generated the sheets:**
1. Drop `jeepney_driver.png` + `jeepney_driver.json` (and
   `jeepney_driver_cutin.png` + `jeepney_driver_cutin.json`) into
   `public/assets/heroes/`.
2. In `GameScene.preload()`, uncomment:
   `this.load.aseprite('jeepney_driver', '/assets/heroes/jeepney_driver.png', '/assets/heroes/jeepney_driver.json');`
   (atlas key === `spriteKey` === `jeepney_driver`). That's it — the six states
   play from real frames automatically.

**Still on the backlog (done when you're ready):** feed `jeepney_driver_cutin`
into `SkillCutIn` so the Barya Lang Po cut-in plays real frames instead of the
tinted silhouette. The `cast` body pose already plays underneath.
