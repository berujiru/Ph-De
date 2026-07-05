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
- **Animations Required** (heroes draw only THREE — owner decision):
  1. **`idle`**: Breathing/bouncing in place.
  2. **`attack`**: The primary attack motion (e.g., throwing a fishball, waving a broom, shouting into a headset). Must have a clear "impact" frame.
  3. **`cast`**: Signature-skill wind-up pose, played under the anime cut-in.
  - `march`, `celebrate`, `defeat` are **not drawn** — the engine plays a tween
    placeholder for those, so heroes still move and react without frames.
  5. **`celebrate`**: Victory — cheering, raising a fist, or wiping sweat off the brow.
  6. **`defeat`**: Morale broken — since heroes don't die, they take a knee, drop their equipment, or look exhausted.

### C. Skill Cut-In Overlays (Anime-Style)
When a hero casts their signature skill, the game pauses, and a large 2D sprite slides across the screen (similar to an anime or fighting game super-move).
- **Style**: Dramatic perspective, intense lighting, comic-book halftone overlays, dynamic speed lines in the background.
- **Poses Required (3 variations per hero)**:
  1. **Anticipation**: Winding up the attack, deep breath, or preparing the tool.
  2. **Action/Shout**: The climax of the move, mouth wide open shouting their voice line, dynamic foreshortening of their weapon/tool toward the camera.
  3. **Resolution**: A cool post-action pose, exhaling, or resetting their stance.

---

## 3. Enemy Asset Requirements

The enemies are personifications of bad governance (anomalies). They should look grotesque, exaggerated, greedy, or slimy, but remain within the cel-shaded vector style.

### A. Codex Portrait
- **Specs**: 256x256px, Transparent PNG. Used for pre-battle prep screens.

### B. In-Game Base Model (Sprite Sheet)
- **Specs**: TOP-FRONT (high-angle front view) — facing the camera as they bear
  down. Tag names must match the `UnitModel` states exactly.
- **Animations Required**:
  1. **`march`**: Plodding, sneaking, or confidently strutting toward the line.
  2. **`attack`**: Clawing/lunging at the morale shield; clear impact frame.
  3. **`stunned`**: Dazed, spinning stars, or frozen mid-step (freeze/stun CC).
  4. **`celebrate`**: Overrunning the barrier and violently tearing at it (plays when the player loses).
  5. **`death`**: Shattering into piles of paperwork, dissolving into mud, or exploding into gold coins.

---

## 4. Environment & Map Asset Requirements

The battlefields are vertically aligned streets and paths. To ensure the world geometry matches the characters:

- **Perspective**: The same high top-down oblique the characters use ("a little top view"). The ground plane recedes toward the enemy end, showing the tops and faces of buildings, barricades, and environmental props so the world matches the top-behind heroes and top-front enemies.
- **Orientation**: The rally advances down a lane toward the incoming anomalies while the morale shield holds the near end; the current build scrolls this lane horizontally, but props are authored to read correctly under the shared oblique camera regardless of march axis.
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
