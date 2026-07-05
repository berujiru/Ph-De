# Baker — Character Art Prompt Pack

Ready-to-paste prompts for generating **Baker (Panadero)**, a Fire lobbed-splash
hero. Follows the two-phase workflow in
`docs/CHARACTER_VISUAL_PROMPT_GUIDE.md`: **Phase 1** locks a consistent base +
all camera angles; **Phase 2/3** reuse that base image as a reference so every
sheet stays on-model.

> Run these in an image-capable Claude/Gemini (not the coding CLI). Always
> **attach the previous phase's output** as reference before generating the next.

---

## Baker Visual Bible (locked — keep identical across every phase)

No portrait exists yet, so this bible is synthesized from the profession
(Panadero), archetype, and weapon in `balance.ts` + `WORLD_AND_HEROES.md`. Do not
drift:

- **Who:** Baker — a middle-aged Filipino **neighborhood panadero (local baker)**,
  the guy who mans the *pugon* before dawn so the *barangay* has fresh pandesal.
  An everyday hardworking Filipino, sweaty and cheerful, flour dusted on his arms
  — *not* a fantasy mage, *not* a specific real person.
- **Build:** stocky, warm, sturdy forearms from kneading; a little belly.
- **Signature headwear:** a **white bakery cap / hairnet** with a red bandana tied
  at the brow (his #1 read-at-a-glance silhouette cue — must survive every angle).
- **Outfit:** a **white cotton undershirt (sando)** under a **flour-dusted white
  apron** with red trim; rolled sleeves; simple slippers/*tsinelas*.
- **Prop / weapon:** a **hot metal bread tray / *bilao*** slung at his hip and a
  cloth bag of **fresh oven-hot pandesal**. He *lobs* the scalding bread bags as
  his attack, so keep a visible sack of glowing-hot rolls read at his side. A
  faint heat-shimmer / ember glow rises off the fresh bread.
- **Expression:** cheerful and defiant — a broad, sweaty grin, "init pa!" energy.
- **Style:** High-contrast anime cel-shaded art, flat colors, bold clean outer
  strokes, 2D mobile game asset (Persona 5 UI pop × Hades silhouette), plain
  solid/white background, isolated character.
- **Palette:** anchored on his engine color **red `#ef4444`** (bandana + apron
  trim + the fire glow), warm white apron/sando, brown bread, orange ember
  highlights on the hot pandesal. (The engine tint is only a fallback for missing
  sprites — the real sheet uses these true colors, no flat red wash.)

---

## Phase 1 — Base Concept + Camera Angles (do this first)

**Prompt:**
> Generate a comprehensive 2D character turnaround reference sheet for a mobile
> game character named Baker.
>
> **Character:** A middle-aged Filipino neighborhood baker (panadero). Stocky and
> warm with sturdy kneading forearms, flour dusted on his skin. A **white bakery
> cap / hairnet with a red bandana** tied at the brow; a **white cotton sando
> under a flour-dusted white apron with red trim**; rolled sleeves; slippers.
> Carrying a **hot metal bread tray at his hip and a cloth sack of oven-hot
> pandesal** that glows with faint orange embers. Cheerful, sweaty, broad grin.
> An everyday hardworking Filipino, not a fantasy mage.
>
> **Style:** High-contrast anime cel-shaded art, flat colors, bold clean outer
> strokes, 2D mobile game asset (Persona 5 UI pop crossed with Hades
> silhouettes). Plain solid background, isolated character.
>
> **Required Layout:** Show the exact same character in a row from these angles.
> Clothing, proportions, cap+bandana, apron, and the pandesal sack must remain
> identical in every view:
> 1. **Front View:** looking directly at the camera.
> 2. **Side Profile:** 90-degree turn.
> 3. **Rear View (straight back):** looking completely away from the camera — we
>    see the back of his cap, the bandana knot, and the apron ties across his back.
> 4. **TOP-BEHIND (high-angle rear 3/4) — THE GAMEPLAY VIEW:** camera high above
>    and behind him, tilted (NOT flat zenith). We see the top of his cap, his
>    shoulders and back, and the pandesal sack, as he faces away into the
>    distance. This is the angle his in-game sprites are drawn from — make it
>    clean and clear.
> 5. **TOP-FRONT (high-angle front 3/4):** camera high above and in front, tilted.
>    We see the top of his cap plus his grinning face, apron and the hot bread.
>
> Ensure the red bandana, flour-dusted apron, and the glowing-hot pandesal sack
> are clearly readable in all five views.

*Save the result as `docs/references/baker_base_turnaround.png`. This is the base
reference for every following phase.*

---

## Phase 2 — Animated Hero Sprite Sheet (TOP-BEHIND)

**Attach `baker_base_turnaround.png` first**, then:

> Attached is the base turnaround sheet for Baker. Generate a strictly formatted
> 2D sprite sheet for a top-down auto-battler.
>
> **Crucial Perspective:** Baker is a Hero. The camera is a high top-down oblique
> above and BEHIND our front line, so Baker faces AWAY from us into the enemy.
> **ALL frames must be drawn from a HIGH-ANGLE REAR VIEW (top-behind, rear 3/4)**
> — top of the cap, bandana knot, shoulders, and back. Not a flat zenith, no side
> profiles, no low angles.
>
> **Style & Formatting:** Match the anime cel-shaded style of the reference
> exactly (white apron, red bandana, brown pandesal with orange ember glow). Lay out as horizontal rows, one animation per row, each frame in its own evenly-spaced cell, non-overlapping, with consistent size and centering.
>
> **OUTPUT RULES (critical — the last generation drew these by mistake):** Fully **transparent** background — NO white fill. Do NOT draw any grid lines, cell borders, boxes, guide lines, or separators. Do NOT render any text, row names, labels, numbers, or captions anywhere in the image. Output ONLY the character art, arranged in evenly-spaced **invisible** cells.
>
> **MANDATORY LAYOUT — exactly 6 rows, in this exact top-to-bottom order:**
> 1. **`idle`** — EXACTLY 3 frames: standing, gentle breathing/bounce, wiping his
>    brow, the hot bread sack at his hip (rear view).
> 2. **`march`** — EXACTLY 4 frames: a full walk cycle advancing forward, tray and
>    bread sack bouncing at his hip (rear view).
> 3. **`attack`** — EXACTLY 3 frames: **lobbing a bag of oven-hot pandesal in a
>    high arc** at the enemy. Frame 2 is the clear release frame — arm extended
>    overhead, the glowing bread bag leaving his hand mid-lob (rear view).
> 4. **`cast`** — EXACTLY 3 frames: his signature skill **Dough Knead** — planting
>    his feet, raising both fists and slamming/**kneading a big glowing mass of
>    dough** downward, heat and flour bursting (rear view, dramatic).
> 5. **`celebrate`** — EXACTLY 2 frames: victory cheer, **raised fist** holding a
>    pandesal high, jumping, head turned slightly so we catch his grin (rear-3/4
>    view).
> 6. **`defeat`** — EXACTLY 2 frames: morale broken — lowering the tray and
>    **taking a knee**, slumped and exhausted, flour drifting down (rear view). He
>    is tired, NOT dead.
>
> Verify every frame in every row is present in the final grid.

*Export from Aseprite as `baker.png` + `baker.json` (JSON Hash or Array), with the
tag names above spelled exactly: `idle march attack cast celebrate defeat`.*

---

## Phase 3 — Dough Knead Skill Cut-In (anime-style)

**Attach `baker_base_turnaround.png` (or the front view) first**, then:

> Using the attached Baker reference, generate a large high-resolution 2D portrait
> sequence for his dramatic "Ultimate Skill" cut-in. Skill name: **DOUGH KNEAD**
> (he slams and kneads a molten mass of dough, flattening the enemy's armor and
> spite out of them). Voice line: *"Masa-masahin ko mukha niyo! Init pa!"*
>
> **Style:** Dramatic anime action shot, intense lighting, comic-book halftone
> overlays, dynamic speed lines. Close-up on upper body and face. Keep his red
> bandana, white bakery cap, flour-dusted apron, and the ember-glowing dough
> on-model.
>
> Generate 3 separate poses:
> 1. **Anticipation:** rearing back, both fists raised over a glowing hot mass of
>    dough, dramatic shadow, coiled energy, flour rising.
> 2. **Action/Slam:** the climax — both fists SLAMMING down into the dough,
>    kneading it flat, a burst of flour and heat foreshortened toward the camera,
>    impact rings.
> 3. **Resolution:** a cool defiant post-slam pose, dusting flour off his hands,
>    grinning, exhaling steam.

*Export as `baker_cutin.png` + `baker_cutin.json` (texture atlas). The in-game
`cast` body pose (Phase 2, row 4) plays underneath while this panel slides.*

---

## Export & QA reminders

- Transparent background, consistent frame size, no clipped limbs/tray/bread bag.
- Tag names MUST match the engine states 1:1 — see the checklist in
  `docs/CHARACTER_VISUAL_PROMPT_GUIDE.md` (Phase 4).
- Drop finished files in `public/assets/heroes/`:
  `baker.png`, `baker.json`, `baker_cutin.png`, `baker_cutin.json`.

## Integration status

**The engine side is already done** — the model layer is `Sprite`-based, every
state routes through the sprite-sheet path with a tween fallback, Baker's
`spriteKey` is `baker`, and `GameScene.createHeroAnimations()` auto-wires any
hero atlas that loads. Until the art exists Baker renders the tinted `hero-base`
placeholder (no broken texture) and still animates all six states via tweens.

**To light up the real art, once you've generated the sheets:**
1. Drop `baker.png` + `baker.json` (and `baker_cutin.png` + `baker_cutin.json`)
   into `public/assets/heroes/`.
2. In `GameScene.preload()`, uncomment:
   `this.load.aseprite('baker', '/assets/heroes/baker.png', '/assets/heroes/baker.json');`
   That's it — the six states play from real frames automatically (atlas key ===
   the hero's `spriteKey`, `baker`).

**Still on the backlog (I do this when you're ready):** feed `baker_cutin` into
`SkillCutIn` so the Dough Knead cut-in plays real frames instead of the tinted
silhouette. The `cast` body pose already plays underneath.
