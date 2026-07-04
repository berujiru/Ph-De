# Art & Audio Production Guidelines

This document serves as the master specification for creating visual and audio assets for **Project Ph-De (First Ripple)**. Any AI agent, animator, or sound designer should use this guide to ensure strict adherence to the game's aesthetic and thematic goals.

---

## 1. Global Visual Direction & Theme

**Theme**: A Modern, Grassroots Street Protest. 
**Style**: **High-Contrast, Cel-Shaded Vector Art** (Inspired by the UI pop of *Persona 5* crossed with the bold silhouettes of *Hades*).

- **Colors**: Rely heavily on the game's palette (`#0f172a` deep slate background, `#facc15` gold, `#ef4444` red, `#38bdf8` accent blue). Assets should pop against a dark background.
- **Line Art**: Clean, bold outer strokes with flat cel-shading. Avoid messy textures. Readability on a small mobile screen is the highest priority.
- **Motifs**: Megaphones, placards, barricades, caution tape, and DIY signage. The heroes should look like everyday, hardworking Filipinos, not shiny fantasy warriors.

---

## 2. Hero Asset Requirements

For each of the 20 Heroes, the following visual assets are required:

### A. HUD Portrait
- **Specs**: 256x256px, Transparent PNG. 
- **Guideline**: A tight headshot/bust. The hero should look determined, stressed, or angry. Framed like a polaroid or a lanyard ID.

### B. In-Game Base Model (Sprite Sheet)
- **Specs**: Isometric or slight top-down angle, designed for a vertical auto-battler march.
- **Animations Required**:
  1. **Idle/Marching**: The default walk cycle moving upward.
  2. **Attack (Looping)**: The primary attack motion (e.g., throwing a fishball, waving a broom, shouting into a headset). Must have a clear "impact" frame.
  3. **Defeated/Broken**: Since heroes don't die, they take a knee, drop their equipment, or look exhausted (Morale broken).
  4. **Winning**: Cheering, raising a fist, or wiping sweat off their brow.

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
- **Specs**: Top-down/Isometric angle, marching downward.
- **Animations Required**:
  1. **Walking**: Plodding, sneaking, or confidently strutting downward.
  2. **Stunned (CC'd)**: Dazed, spinning stars, or frozen mid-step.
  3. **Death**: Shattering into piles of paperwork, dissolving into mud, or exploding into gold coins.
  4. **Winning**: Reaching the bottom barrier and violently tearing at it.

---

## 4. Audio & Sound Mapping (Tagalog First, Comedic Tone)

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
