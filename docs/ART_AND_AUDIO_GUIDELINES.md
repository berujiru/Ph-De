# Art & Audio Production Guidelines

This document serves as the master specification for creating visual and audio assets for **Project Ph-De (First Ripple)**. Any AI agent, animator, or sound designer should use this guide to ensure strict adherence to the game's aesthetic and thematic goals.

---

## 1. Global Visual Direction & Theme

**Theme**: A Modern, Grassroots Street Protest. 
**Style**: **High-Contrast, Anime-Style Cel-Shading** (owner decision) — expressive
anime faces and proportions with dynamic anime key-art energy, kept bold and flat
for mobile readability (Persona 5 UI pop × Hades silhouettes). Heroes are
heroic-anime; enemies use the same anime cel-shaded language but grotesque.

- **Colors**: Rely heavily on the game's palette (`#0f172a` deep slate background, `#facc15` gold, `#ef4444` red, `#38bdf8` accent blue). Assets should pop against a dark background.
- **Line Art**: Clean, bold outer strokes with flat cel-shading. Avoid messy textures. Readability on a small mobile screen is the highest priority.
- **Motifs**: Megaphones, placards, barricades, caution tape, and DIY signage. The heroes should look like everyday, hardworking Filipinos, not shiny fantasy warriors.

**Camera & sprite perspective (canonical):** the battle uses a **fixed high
top-down oblique camera above and behind the hero line**. Heroes are drawn
**TOP-BEHIND** (back view — we see their backs); enemies are drawn **TOP-FRONT**
(front view — we see their faces bearing down). This is facing-relative and holds
on any screen axis. The full rules, the required animation-state set, and the
Gemini→Claude generation workflow live in
`docs/CHARACTER_VISUAL_PROMPT_GUIDE.md` — treat that file as authoritative and
keep the lists below in sync with it.

---

## 2. Hero Asset Requirements

For each of the 20 Heroes, the following visual assets are required:

### A. HUD Portrait
- **Specs**: 256x256px, Transparent PNG. 
- **Guideline**: A tight headshot/bust. The hero should look determined, stressed, or angry. Framed like a polaroid or a lanyard ID.

### B. In-Game Base Model (Sprite Sheet)
- **Specs**: TOP-BEHIND (high-angle back view). Tag names must match the
  `UnitModel` states exactly (`src/game/entities/models/UnitModel.ts`).
- **Frame counts & timing are canonical in
  `docs/CHARACTER_VISUAL_PROMPT_GUIDE.md` → *Animation Standards*** — the counts
  below are copied from there; if they ever disagree, that guide wins.
- **Animations Required** (heroes draw FOUR for smooth gameplay, plus the cut-in):
  1. **`idle`** — **8 frames**, looping. Breathing/bouncing in place (held while an enemy is in range).
  2. **`march`** — **8 frames**, looping. Walk cycle advancing toward the enemy line; plays only when no enemy is in range (`run` reuses it ~1.5× faster).
  3. **`attack`** — **8 frames**, one-shot. The primary attack motion (e.g., throwing a fishball, waving a broom, shouting into a headset). **Frame 4 is the clear impact frame.**
  4. **`cast`** — **10 frames**, one-shot. Signature-skill wind-up pose, energy building across the ramp, played after the anime cut-in clears.
  - If `idle` is omitted, the engine rests on the **first frame of `attack`** — so `idle` is recommended but optional when `attack` exists.
  - `celebrate`, `defeat`, `stunned` are **not drawn** — the engine plays a tween
    placeholder for those, so heroes still move and react without frames.

### C. Skill Cut-In Overlays (Anime-Style)
When a hero casts their signature skill, the game pauses, and a large 2D sprite slides across the screen (similar to an anime or fighting game super-move). The panel slides in, holds, and slides out in ~1.1 s (`src/game/entities/fx/SkillCutIn.ts`).
- **Style**: Dramatic front-facing perspective, intense lighting, comic-book halftone overlays, dynamic speed lines in the background. High-res (~1024 px tall). This is the one place we see the hero's face instead of their back.
- **Poses Required — exactly 3 variations per hero** (canonical in `docs/CHARACTER_VISUAL_PROMPT_GUIDE.md` → *Animation Standards → Skill cut-in*):
  1. **Anticipation**: Winding up the attack, deep breath, or preparing the tool.
  2. **Action/Shout**: The climax of the move, mouth wide open shouting their voice line, dynamic foreshortening of their weapon/tool toward the camera.
  3. **Resolution**: A cool post-action pose, exhaling, or resetting their stance.

### D. Skill VFX Effect Sheet (on-field)
The effect the skill spawns on the lane, separate from the character sheet. **Standard: one `fx` row, 10 frames, one-shot (~1.0 s)** — full spec in `docs/CHARACTER_VISUAL_PROMPT_GUIDE.md` → *Animation Standards → Skill VFX*. Compose as a **flat ground element** (ring/scorch/wave on the lane) **plus a vertical flourish** (uplift/column/spray) so it reads under the oblique camera; transparent background, sized to the skill's gameplay radius.

---

## 3. Enemy Asset Requirements

The enemies are personifications of bad governance (anomalies). They should look grotesque, exaggerated, greedy, or slimy, but remain within the cel-shaded vector style.

### A. Codex Portrait
- **Specs**: 256x256px, Transparent PNG. Used for pre-battle prep screens.

### B. In-Game Base Model (Sprite Sheet)
- **Specs**: TOP-FRONT (high-angle front view) — facing the camera as they bear
  down. Tag names must match the `UnitModel` states exactly. **Frame counts &
  timing are canonical in `docs/CHARACTER_VISUAL_PROMPT_GUIDE.md` → *Animation
  Standards*.**
- **Animations Required**:
  1. **`march`** — **8 frames**, looping. Plodding, sneaking, or confidently strutting toward the line.
  2. **`attack`** — **8 frames**, one-shot. Clawing/lunging at the morale shield; **frame 4 is the impact frame.**
  3. **`stunned`** — **6 frames**, looping. Simple dazed / spinning-stars loop (freeze/stun CC).
  4. **`celebrate`** — **6 frames**, looping. Short triumph loop — overrunning the barrier and tearing at it (plays when the player loses).
  5. **`death`** — **8 frames**, one-shot. Shattering into piles of paperwork, dissolving into mud, or exploding into gold coins.
  - **Bosses / casters** additionally draw **`cast`** — **10 frames**, one-shot: an in-world channel/wind-up pose for a boss skill. Minions never cast.

---

## 4. Environment & Map Asset Requirements

The battlefields are **landscape** streets and paths — a horizontal lane that runs across the screen. To ensure the world geometry matches the characters:

- **Perspective**: The same high top-down oblique the characters use ("a little top view"). The ground plane recedes toward the enemy end, showing the tops and faces of buildings, barricades, and environmental props so the world matches the top-behind heroes and top-front enemies.
- **Orientation**: Landscape (16:9). The rally holds the near (left) end while anomalies stream in from the far (right) end of the lane; the lane scrolls horizontally, and props are authored to read correctly under the shared oblique camera.
- **Style**: High-contrast, cel-shaded vector art. The ground should use muted or darker tones (deep slate, dark asphalt) so the bright characters and UI elements pop clearly.

---

## 5. Audio & Sound Mapping (Tagalog First, Comedic Tone)

The audio landscape should feel like a busy Metro Manila street mixed with a loud protest rally.
**Hero Voice Lines**: Every signature skill trigger must play a Tagalog voice line. The tone is **comedic, stressed, but fiercely defiant**.

### Hero Voice Lines Map

| Hero | Signature Skill | Tagalog Voice Line (Skill Cast) | SFX / Foley |
|---|---|---|---|
| **Eden** (Leader) | Rally | *"Sugod, mga kababayan! Walang aatras!"* | Megaphone feedback, crowd roaring |
| **Teacher** | Recess! | *"Class, QUIET! Makinig kayo!"* | Ruler smacking a desk hard, whistle |
| **Student** | Cramming | *"Hala, deadline na bukas! Ipasa na 'to!"* | Furious typing, paper shuffling rapidly |
| **Jeepney Driver** | Barya Lang Po | *"Barya lang sa umaga! Para po!"* | Coins exploding like a shotgun blast |
| **Fisherfolk** | Lambat | *"Huli ka, balbon!"* | Splashing water, heavy net swoosh |
| **Street Sweeper** | Dust Storm | *"Ang dumi niyo! Walang kalat!"* | Gust of wind, furious sweeping scratches |
| **Taho Vendor** | Hot Syrup | *"Tahooooo! Mainit pa!"* | Syrupy splat, sizzling steam |
| **Nurse** | Vaccine Drive | *"Pila nang maayos! Parang kagat lang ng langgam 'to!"* | Syringe squirt, magical healing chime |
| **Construction Worker**| Yero Barricade | *"Bawal dumaan, may ginagawa!"* | Heavy metal sheet crashing down |
| **Call Center Agent** | Escalate | *"Let me escalate this to my manager."* (spoken in deadpan Taglish) | Headset beep, keyboard clacks |
| **Security Guard** | Flashlight | *"Hoy! Anong ginagawa mo diyan?! Bawal tambay!"* | Heavy flashlight click, blinding synth drone |
| **Farmer** | Harvest | *"Oras na para mag-ani!"* | Sharp scythe slash |
| **Fishball Vendor** | Spicy Sauce | *"Gusto mo ng maanghang?! O, eto!"* | Sizzling oil, liquid splash |
| **Sales Lady** | Closing Sale | *"Ubusan na 'to! Sir, Ma'am, sale po tayo!"* | Cash register CHA-CHING! |
| **Sorbetes Vendor** | Dirty Ice Cream | *"Sorbetes! Walang halong kemikal!"* | Brass bell ringing rapidly |
| **Electrician** | Rolling Blackout | *"Brownout muna! Hintay kayo sa Meralco!"* | Heavy electrical short-circuit spark |
| **Baker** | Dough Knead | *"Masa-masahin ko mukha niyo! Init pa!"* | Heavy dough thudding on a table |
| **Traffic Enforcer** | STOP! | *"Tumabi ka! Huli ka! Nasaan lisensya mo?!"* | Piercing whistle, tire screeching |
| **Plumber** | Flush | *"I-flush ang mga sagabal!"* | Toilet flushing loudly, rushing water |
| **Delivery Rider** | Kamote Riders | *"Pa-deliver po! OTW na bossing!"* | Loud motorcycle engine revving, zooming pass |

### Enemy Soundscapes

Enemies do not have spoken lines, but rather thematic Foley sounds:
- **Ghost Employees / Trolls**: Keyboard clicking, muffled whispering, ghostly wails.
- **The Overpriced / Kickbacks**: Coins jangling, paper rustling, greedy snickering.
- **Bosses (e.g., Boss Pork Barrel, Dynasty)**: Heavy, sluggish footsteps, pig squeals (for Pork Barrel), loud arrogant laughing.

### General Game Audio
- **UI Actions**: Clicks should sound like pressing a heavy tape recorder button or stamping a document.
- **Background Music (BGM)**:
  - *Prep Screen*: Tension-building lo-fi beats with distant traffic noise.
  - *Battle*: Upbeat, fast-paced street-drumming (Ati-Atihan style beats or modern percussive hype tracks) mixed with electric guitar.
