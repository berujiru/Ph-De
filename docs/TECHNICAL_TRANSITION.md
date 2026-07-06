# Technical Transition: Tower Defense to Rally Auto-Battler

This document outlines the required architectural shifts for the gameplay and UI engineers to pivot the game from a static Tower Defense to a "Battle Cats" style **landscape** Auto-Battler where units march across the lane. The camera sits above and behind the rally, so heroes are drawn from behind (backs to the camera, facing into the enemies) while enemies face the camera as they advance.

## 1. Core Logic Changes (`src/game/core/`)

### Moving from `Towers` to `Marching Heroes`
*   **Remove Grid/Slot Placement**: Remove the logic for `buildSlots` in `level.ts`. Players no longer tap a pedestal to place a tower.
*   **Summoning Mechanics**: Introduce a `summonHero(heroId)` function in the economy/gameplay core. This deducts cost (Gold/Hope) and spawns the hero at `(nearEdgeX, randomY_in_lane)` on the near (left) side of the lane.
*   **Hero State Machine**: Heroes need a simple state machine:
    *   `MARCHING`: Move X forward (rightwards, toward the enemies) at `speed`.
    *   `ATTACKING`: An enemy is within `range`. Stop moving and fire.
*   **Collision/Blocking**: (Optional but recommended) Melee heroes should physically block anomalies from passing them, creating a solid "frontline". 

### Targeting System Update
*   The `Targeting.ts` system changes from "find furthest along path" to "find closest enemy in X-axis distance" or standard auto-battler collision boxes.
*   Ranged heroes look for the first enemy within their X-range box.

### The Win/Loss Condition
*   **Old**: Enemies leak past the barrier, Lives drop to 0.
*   **New**: If anomalies push the frontline all the way to the near (left) edge of the screen, the rally is broken (Game Over).
*   **Win**: Destroy the enemy "System Base" at the far (right) end of the lane, or survive all waves (if retaining wave-based survival).

## 2. Entities (`src/game/entities/`)

*   Rename `Tower.ts` to `HeroEntity.ts` (or simply `Hero.ts`).
*   Add `update(dtMs)` logic to `Hero.ts` to handle marching forward (rightwards) when no enemies are in range.
*   Enemies (`Enemy.ts`) no longer need strict path-following curves. They just march the other way (leftwards, toward the rally) with slight vertical wandering/lanes.

## 3. UI Layer (`src/ui/`)

*   **Action Bar**: Replace the "pedestal selection" UI with a row of "Summon Buttons" along the bottom of the screen. 
*   **Cooldown/Cost**: Each summon button displays the Gold cost and has a radial cooldown sweep after being pressed to prevent instant spamming.
*   **Bayanihan Acts**: Move the ultimate skills to a distinct floating button above the summon bar.
*   **Remove Tower Upgrade Modals**: Since heroes are auto-marching, tapping them to upgrade in combat is too chaotic. Upgrades should come from "Drops" or global buffs.
