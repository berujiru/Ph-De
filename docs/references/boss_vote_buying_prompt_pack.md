# Vote Buying — Boss Art Prompt Pack

Ready-to-paste prompts for generating **Vote Buying** (`boss_vote_buying`), an Act
boss anomaly. This pack **mirrors the enemy template**
(`docs/references/grunt_prompt_pack.md`) with the **boss differences**:

- Drawn **larger, more detailed, and more grotesque** than a minion.
- Phase 2 has **6 rows** — a 6th **`cast`** row (EXACTLY 3 frames) is inserted
  between `attack` and `stunned`, showing the boss channelling its `activeSkill`
  **Bribe** (`scatterFakeGold`).
- Still **TOP-FRONT** (high-angle front 3/4), still **no anime skill cut-in**
  (that's a hero-only feature — see `docs/CHARACTER_VISUAL_PROMPT_GUIDE.md`).

> Run these in an image-capable Claude/Gemini (not the coding CLI). Always
> **attach the previous phase's output** as reference before generating the next.

**Binding rule:** bosses personify a *category of PH governance anomaly* — never
a real official, party, or contractor. This one is **election money (vote
buying)**. Design a grotesque concept-creature, not a person
(`docs/WORLD_AND_HEROES.md`).

---

## Vote Buying Visual Bible (locked — keep identical across every phase)

No portrait exists — this bible is **synthesized** from its role (a ranged boss
that **scatters fake gold** which subtracts from the player's total if tapped) and
its `balance.ts` color anchor `#eab308` (dirty-money gold). Do not drift:

- **What:** Vote Buying — a bloated, many-handed **envelope-and-cash creature**:
  a lurching mound of stuffed pay-off envelopes, sample ballots, and grubby
  banknotes fused into a body that flings coins to buy its way forward. The
  transaction of an election made monstrous. Grotesque, oozing, sleazy — a
  concept-creature, not a human.
- **Body:** a fat torso of **overstuffed manila cash-envelopes and folded sample
  ballots** bound together, many grasping hands sprouting from the sides — each
  fist crammed with bills — a bulging money-sack for a gut leaking coins.
- **Signature read-at-a-glance cue:** the **body of stuffed pay-off envelopes with
  many cash-filled grasping hands flinging coins** — its #1 silhouette read, and
  it must survive every angle.
- **Face:** a slick, smirking con-artist grin — one eyebrow raised, gold teeth,
  a folded ballot cocked over its brow like a paper hat, eyes replaced by coin
  slots.
- **Style:** High-contrast cel-shaded vector art, flat colors, bold clean outer
  strokes, 2D mobile game asset (Persona 5 UI pop × Hades silhouette), plain
  solid/white background, isolated character. Reads clearly at small size even
  though it is boss-scale.
- **Palette:** dirty-money gold (anchor `#eab308`), manila-envelope tan, grubby
  banknote green, ballot-paper cream, ink black. (Any engine tint is only a
  fallback for missing sprites — the real sheet uses its true colors, no flat
  wash.)

---

## Phase 1 — Base Concept + Camera Angles (do this first)

**Prompt:**
> Generate a comprehensive 2D character turnaround reference sheet for a mobile
> game BOSS enemy creature named Vote Buying.
>
> **Creature:** A bloated many-handed envelope-and-cash creature — a lurching
> mound of **overstuffed manila pay-off envelopes and folded sample ballots**
> fused into a torso, with many grasping hands sprouting from its sides (each fist
> crammed with banknotes), a leaking money-sack gut spilling coins, and a slick
> smirking con-artist face with gold teeth, coin-slot eyes, and a folded ballot
> cocked over its brow like a paper hat. Grotesque, sleazy, BOSS-SCALE (much
> larger and more detailed than a minion) — a concept-creature, not a human, and
> not any real person.
>
> **Style:** High-contrast cel-shaded vector art, flat colors, bold clean outer
> strokes, 2D mobile game asset (Persona 5 UI pop crossed with Hades
> silhouettes). Plain solid background, isolated creature.
>
> **Required Layout:** Show the exact same creature in a row from these angles.
> Proportions, the envelope body, the many cash-hands, and the coin-slot face must
> remain identical in every view:
> 1. **Front View:** looking directly at the camera.
> 2. **Side Profile:** 90-degree turn.
> 3. **Rear View (straight back):** facing away — we see its back, the bulging
>    money-sack gut, and envelopes stuck to it.
> 4. **TOP-FRONT (high-angle front 3/4) — THE GAMEPLAY VIEW:** camera high above
>    and in front, tilted (NOT flat zenith). We see the top of its head plus its
>    smirking face, the envelope torso, and its coin-flinging hands as it advances
>    toward the viewer. This is the angle its in-game sprites are drawn from —
>    make it clean and clear.
> 5. **TOP-BEHIND (high-angle rear 3/4):** camera high above and behind, tilted;
>    top of head, shoulders, and the envelope-stuffed back.
>
> Ensure the pay-off envelopes, the many cash-filled grasping hands, the leaking
> coins, and the coin-slot face are clearly readable in all five views.

*Save the result as `docs/references/boss_vote_buying_base_turnaround.png`. This
is the base reference for the next phase.*

---

## Phase 2 — Animated Boss Sprite Sheet (TOP-FRONT, 6 rows)

**Attach `boss_vote_buying_base_turnaround.png` first**, then:

> Attached is the base turnaround sheet for the Vote Buying BOSS anomaly. Generate
> a strictly formatted 2D sprite sheet for a top-down auto-battler.
>
> **Crucial Perspective:** Vote Buying is an Enemy boss. The camera is a high
> top-down oblique above and behind the player's line, so it faces TOWARD the
> camera as it bears down on the barrier. **ALL frames must be drawn from a
> HIGH-ANGLE FRONT VIEW (top-front, front 3/4)** — top of head, plus the smirking
> face, the envelope torso, and its cash-hands. Not a flat zenith, no side
> profiles, no low angles. Draw it BOSS-SCALE: larger, more detailed, and more
> menacing than a minion.
>
> **Style & Formatting:** Match the cel-shaded vector style of the reference
> exactly (envelope body, many cash-hands, leaking coins, coin-slot face). Lay out as horizontal rows, one animation per row, each frame in its own evenly-spaced cell, non-overlapping, with consistent size and centering.
>
> **OUTPUT RULES (critical — the last generation drew these by mistake):** Fully **transparent** background — NO white fill. Do NOT draw any grid lines, cell borders, boxes, guide lines, or separators. Do NOT render any text, row names, labels, numbers, or captions anywhere in the image. Output ONLY the character art, arranged in evenly-spaced **invisible** cells.
>
> **MANDATORY LAYOUT — exactly 6 rows, in this exact top-to-bottom order:**
> 1. **`march`** — EXACTLY 4 frames: a smug, swaggering walk cycle advancing
>    toward the viewer, envelopes flapping, coins dribbling (front view).
> 2. **`attack`** — EXACTLY 3 frames: **hurling a fistful of rolled banknotes to
>    pistol-whip the barrier**, coins scattering. Frame 2 is the clear impact
>    frame (front view).
> 3. **`cast`** — EXACTLY 3 frames: channelling its signature skill **Bribe** —
>    flinging both arms wide and **showering the ground ahead with a spray of fake
>    gold coins** (glinting, subtly counterfeit) as a lure. This is the
>    telegraphed boss skill; make it flashy and dramatic (front view).
> 4. **`stunned`** — EXACTLY 2 frames: dazed, envelopes drooping, **spinning stars
>    / fluttering bills** circling its head, mid-stumble (front view).
> 5. **`celebrate`** — EXACTLY 2 frames: it overran the line — cackling in triumph
>    and **throwing cash into the air** with every hand (front view). Plays when
>    the player loses.
> 6. **`death`** — EXACTLY 3 frames: **bursting apart into a flurry of torn
>    envelopes, scattered ballots, and worthless coins** as it deflates and
>    collapses (front view).
>
> Verify every frame in every row is present in the final grid.

*Export from Aseprite as `boss_vote_buying.png` + `boss_vote_buying.json` (JSON
Hash or Array), with the tag names above spelled exactly: `march attack cast
stunned celebrate death`.*

---

## Export & QA reminders

- Transparent background, consistent frame size, no clipped hands.
- Tag names MUST match the engine states 1:1 (`march attack cast stunned
  celebrate death`) — see the checklist in
  `docs/CHARACTER_VISUAL_PROMPT_GUIDE.md` (Phase 4).
- Confirm the `cast` row is EXACTLY 3 frames and clearly depicts **Bribe** (the
  fake-gold scatter).
- Drop finished files in `public/assets/enemies/`: `boss_vote_buying.png`,
  `boss_vote_buying.json`.
- Audio pairing (`docs/ART_AND_AUDIO_GUIDELINES.md`): sleazy coin-jingles and
  paper rustling, with a cascading coin-shower on the `cast`.

## Integration status

**The engine side is already done** — `EnemyModel` is `Sprite`-based, every state
routes through the sprite-sheet path with a tween fallback, an enemy's atlas key
defaults to its `id`, and `GameScene.createEnemyAnimations()` auto-wires any enemy
atlas that loads. Until the art exists Vote Buying renders the tinted `enemy-base`
placeholder (no broken texture) and still animates all states via tweens.

**To light up the real art, once you've generated the sheet:**
1. Drop `boss_vote_buying.png` + `boss_vote_buying.json` into
   `public/assets/enemies/`.
2. In `GameScene.preload()`, uncomment:
   `this.load.aseprite('boss_vote_buying', '/assets/enemies/boss_vote_buying.png', '/assets/enemies/boss_vote_buying.json');`
   (atlas key defaults to the enemy `id` = `boss_vote_buying`). That's it — the
   states, including the boss `cast`, play from real frames automatically.
