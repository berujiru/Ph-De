# Adding Heroes

This is the worked, step-by-step guide for AI agents and developers adding a new Hero to the game.

## 1. Asset Pipeline & View Angle

*First Ripple* is an auto-battler rally: the hero line holds the rear, a morale
shield pushes the front forward, and anomalies stream in from ahead. The battle
runs under a **fixed high top-down oblique camera** sitting above and behind the
hero line — see `docs/CHARACTER_VISUAL_PROMPT_GUIDE.md` → *Camera & Perspective
Model* for the canonical rules and the AI generation workflow.
- **Hero Perspective**: **TOP-BEHIND** — high-angle back view. The camera is
  behind the heroes, so gameplay sprites show the tops of heads, shoulders, and
  backs. Never a flat zenith or a side profile.
- **Enemy Perspective** (for contrast): **TOP-FRONT** — high-angle front view,
  facing the camera. Covered fully in `docs/ADDING_ENEMIES.md` /
  `ART_AND_AUDIO_GUIDELINES.md`.
- **HUD Portrait exception**: front-facing headshot (see the face).

### Required Art Assets

For every new hero, two assets must be created and placed in `public/assets/heroes/`:

1. **Animated Skill Cut-In (`[hero_id]_cutin.png`)**
   - **Specs**: A large, animated sheet for their Ultimate Skill, played during the time-stop. High-contrast, dynamic angle, anime-style action. Isolated from skins — every skin shares the hero's one cut-in.
   - **Required Animation Flow**: Must show the momentum of the action (e.g., Anticipation/inhaling -> Action/shouting into megaphone -> Resolution) to feel like a short, punchy video.
2. **Combined Skin Sheet (`[hero_id].png` — one per skin; variants e.g. `[hero_id]_streetwear.png`)**
   - **Specs**: ONE transparent spritesheet (uniform square cells, row-major,
     ≤ 4096 px per side) holding every gameplay state **plus a front-facing
     portrait cell**. Frame ranges are declared per state in
     `src/game/data/skins.ts` (`HeroSkin.states`, linear `{ from, frames }`),
     so states may span rows freely. Reference layout: see
     `docs/CHARACTER_VISUAL_PROMPT_GUIDE.md` → *Animation Standards → Heroes*.
   - **Required States** — all TOP-BEHIND (back view) except the portrait cell:
     - `idle`: Bouncing/breathing while standing still (held while engaging an
       enemy in range).
     - `march`: Walk cycle advancing toward the enemy line (plays only when no
       enemy is in range; `run` reuses it faster).
     - `attack`: Swinging weapon / throwing projectile; clear impact frame.
     - `cast`: Signature-skill wind-up pose (plays after the anime cut-in clears).
     - **portrait**: one FRONT-FACING head/bust cell (`portraitFrame` in the
       config) — the UI crops it for Archive cards, drop cards, and previews.
       No separate `_portrait.png` file is needed.
   - `celebrate`, `defeat`, and `stunned` are **not drawn** — the engine plays a
     tween placeholder for those, so heroes still react without dedicated frames.
   - **Idle is optional if `attack` exists:** with no `idle` range the engine
     rests on the first frame of `attack` (a neutral ready pose). Ship `idle`
     anyway for the best look.
   - Eden's `default` skin (`/assets/heroes/eden.png` + its `HERO_SKINS.eden[0]`
     entry) is the reference config.

---

## 2. Technical Integration (Code)

Once the assets exist, follow these steps to wire the hero into the game engine.

### Step A: The Data Definition (`src/game/data/heroes.ts`)
Add the new hero to the `HeroId` type and the `HERO_DEFINITIONS` record.
```typescript
  [hero_id]: {
    id: '[hero_id]',
    name: 'Hero Name',
    profession: 'Job Title',
    damageType: 'Physical', // Or Wind, Water, etc.
    attackKind: 'ranged',   // Or 'melee'
    attackStyle: 'projectile', // Matches the ATTACK_STYLE_BADGES
    range: 300,
    damage: 15,
    attackRateMs: 1200,
    color: 0xffffff, // Fallback color
    attackArt: '[stem]', // Basic-attack SVG stem — see "Attack art" below
    portraitKey: '[hero_id]_portrait',
    spriteKey: '[hero_id]',
    purpose: 'What this hero does best.',
    signatureSkill: { name: 'Skill Name', description: 'Effect.' },
    passive: { name: 'Passive Name', description: 'Effect.' }
  },
```

### Step A2: Attack art (`public/assets/attacks/[stem].svg`)
Every hero's basic attack renders a reusable SVG, tinted at runtime with
`DAMAGE_TYPE_COLORS[damageType]` (`src/game/core/Damage.ts`) — one file works
for any damage type. The registry is `src/game/data/attackArt.ts`:
- Set `attackArt: '[stem]'` in the hero definition and drop
  `public/assets/attacks/[stem].svg`. Preload is derived automatically
  (`allAttackArtStems()` in `GameScene.preload()`) — nothing to hand-register.
- Omit `attackArt` and the hero uses its attack style's default from
  `STYLE_DEFAULT_ART` (this is what the sandbox testers do); a missing texture
  also falls back softly at runtime with a console warning.
- **Authoring contract** (enforced by `tests/unit/attackArt.test.ts`): 128×128
  viewBox, art pointing **+X**, fills/strokes white or pure grayscale
  (`r == g == b`) plus the near-black outline `#0f172a` — `setTint` multiplies
  RGB, so any baked-in hue corrupts the damage-type color. Full spec:
  `docs/ART_AND_AUDIO_GUIDELINES.md` → *Basic-Attack SVGs*.
- How each style uses the art: projectile/pierce/boomerang/lobbed/trap fly it
  as the body (`AttackSprite`), melee-cleave sweeps it, vortex spins it inside
  an `AreaOverlay`, linear-wave stretches it via `LaneWave`, summoner shows it
  as the barricade, and chain/beam pop it as strike/muzzle icons
  (`popAttackIcon`).

### Step B: Register the Skin (`src/game/data/skins.ts`)
No `GameScene` code is needed — hero sheets load data-driven. Add one
`HeroSkin` entry (index 0 = the default skin) declaring the sheet URL, grid,
portrait cell, and per-state frame ranges:
```typescript
[hero_id]: [
  {
    id: '[hero_id]', heroId: '[hero_id]', name: 'Default',
    sheet: '/assets/heroes/[hero_id].png',
    frameWidth: 256, frameHeight: 256,
    columns: 8, totalFrames: 73, portraitFrame: 72,
    states: {
      idle:   { from: 0,  frames: 8 },
      march:  { from: 8,  frames: 16 },
      attack: { from: 24, frames: 24, frameRate: 30 },
      cast:   { from: 48, frames: 24, frameRate: 20 },
    },
  },
],
```
`GameScene.preload()` loads each hero's *selected* skin under `skin.id`, and
`createHeroAnimations()` builds `${skin.id}-<state>` from those ranges. Until
the sheet exists the hero renders the tinted `hero-base` placeholder (no broken
texture), so you can wire data before art arrives. Extra skins are more entries
in the same array — players equip them in the Archive (persisted, applies next
battle), and the UI portrait comes from each skin's `portraitFrame`
automatically.

### Step C: The Unique Logic (`src/game/core/Skills.ts`)
Implement the hero's signature Active Skill and/or Passive.
- Locate the `applyHeroSkill()` function and add an `if (skillId === '[hero_id]')` block.
- Locate the `applyHeroPassive()` function and implement the passive triggers.
- Ensure any visual side effects use the `onVisual` event callback (e.g., floating text, screen flashes) to maintain strict separation of concerns.
- Cone hit-tests use `isPointInCone` from `src/game/core/Geometry.ts` with
  `SKILL_CONE_HALF_ANGLE` — never inline the angle math.

**Ground/area visuals MUST use the shared FX components in
`src/game/entities/fx/`** — this is the canonical rule; the agent docs point
here:

| Component | Use for |
|---|---|
| `AreaOverlay` | Circular AoE fields: flat disc sized to the gameplay radius, optional inner telegraph rings, optional SVG ground image via `svgKey` (vortex, tornado, tree; add `svgTint` for white/grayscale attack art), pulse/enter/exit options, center icon. |
| `spawnConeFlash` | Cone-shaped skill flashes (flashlight, coin shotgun). Geometry mirrors `isPointInCone`. |
| `spawnShockwaveRing` | Expanding rings and impact flashes (skill blasts, explosions, enemy pulses). Fire-and-forget. |
| `LaneWave` | Linear/rectangular waves sweeping the lane (body + leading edge + trail particles; pass `svgKey`/`svgTint` to render the body as tinted attack art). The owning `Attack` keeps movement and hit logic. |
| `AttackSprite` | The visual body of a moving basic attack: one tinted attack-art image with rotation-to-velocity, length scaling, tumble spin, and flight scale. The owning `Attack` keeps movement and hit logic. `popAttackIcon` (same file) is the one-shot strike/muzzle icon for chain/beam. |

- Emit an `onVisual` event from `Skills.ts` carrying the per-skill size /
  color / duration; the matching `handleSkillVisualEffect` branch in
  `GameSceneEvents.ts` must be a thin adapter (a few lines) into one of these
  components — never inline `scene.add.graphics()` / `scene.add.circle()`
  ground drawing in `scenes/`.
- Persistent fields that tick gameplay (damage / root / heal over time) are
  `Attack` subclasses in `entities/Attacks.ts` driven by `update(delta)` (see
  `AoeFirePatchAttack`, `TornadoAttack`, `TreeOfLifeFieldAttack`) — **never**
  `scene.time.addEvent` loops, which run on wall-clock and ignore pause and
  game speed. The Attack owns an `AreaOverlay` for its visuals and destroys it
  on expiry.
- Skill SVG ground images live in `public/assets/fx/` and are preloaded in
  `GameScene.preload()`; pass the key as `svgKey`. (`water_wave` is preloaded
  and currently unused — a ready-made candidate for water/wave skills.)

### Step D: Animation states (already wired — no code needed)
The model layer is `Phaser.GameObjects.Sprite`-based. `HeroModel` already routes
every state (`idle/march/attack/cast/celebrate/defeat`) through the sprite-sheet
path: if an animation `${skin.id}-<state>` exists it plays those frames,
otherwise it falls back to the tween placeholder (and `idle` specifically rests
on the first frame of `attack` when no idle range exists). So once your skin is
registered (Step B) and its sheet is in place, the hero animates with **no
`HeroModel` changes**. Only touch `HeroModel` if you need a genuinely new state
(add it to `UnitModel`'s state machine first).

---

## Checklist for Agents

Before considering a hero "done", verify:
- [ ] Added to `HeroId` union and `HERO_DEFINITIONS` in `heroes.ts`.
- [ ] Base stats, `attackStyle`, and `damageType` match the design guidelines.
- [ ] `attackArt` set and `public/assets/attacks/[stem].svg` exists, authored
      white/grayscale per the tint contract (`tests/unit/attackArt.test.ts`
      passes).
- [ ] Default skin registered in `HERO_SKINS` (`src/game/data/skins.ts`) with
      correct frame ranges + `portraitFrame`, and the combined sheet is in
      `public/assets/heroes/`.
- [ ] Cut-in sheet wired via `portraitKey`/`cutInAnim` in `heroes.ts`.
- [ ] Active skill is implemented in `Skills.ts` and unit tested in `Skills.test.ts`.
- [ ] Passive skill (if any) is implemented in `Skills.ts`.
