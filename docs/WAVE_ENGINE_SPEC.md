# Wave Engine & Warning System Spec

This document provides the technical blueprint for the `gameplay-engineer` or `ui-engineer` Claude subagents to overhaul the mob generation system.

## 1. The Goal
Currently, `GameScene.ts` uses a mathematical prototype loop (`enemiesToSpawn = currentWave * 5`), spawning enemies exactly every 2 seconds. This must be replaced with a robust, data-driven `WaveManager` that allows designers to hand-craft waves, control exact timing, and inject dramatic UI warnings before Bosses or Swarms appear.

## 2. Data Structures (`src/game/data/level.ts`)
The new Wave Engine must support explicit timing, delays, and UI warning events before significant spawns.

```typescript
export type WaveEvent = 
  // Spawn an anomaly
  | { type: 'spawn'; enemyId: EnemyId; count: number; intervalMs: number; }
  // Pause the spawning queue
  | { type: 'delay'; durationMs: number; }
  // Trigger a UI warning
  | { type: 'warning'; alertType: 'boss' | 'swarm' | 'mini-boss'; text: string; durationMs: number; };

export interface WaveDefinition {
  waveNumber: number;
  events: WaveEvent[];
}
```

## 3. Implementation Steps for Agents

### Step A: Replace Prototype Logic
In `src/game/scenes/GameScene.ts`, completely remove the mathematical `spawnTimer` logic inside the `update()` loop.

### Step B: Implement Wave Queue
Build a `WaveManager` class or system that reads the current `WaveEvent` from an array:
- If `type: 'spawn'`, instantiate the `Enemy` object and delay the next read by `intervalMs`.
- If `type: 'delay'`, pause the spawner reading for `durationMs`.
- If `type: 'warning'`, trigger the UI alert and pause the spawner reading for `durationMs` to build tension.

### Step C: UI Warning System
Implement a `showWarning(text, alertType)` method in `GameScene.ts` (or the active UI scene).
- **Style**: Large, flashing text across the center of the screen (e.g., `⚠️ SWARM INCOMING ⚠️`).
- **Color Coding**: 
  - `boss`: Red (`#ef4444`)
  - `swarm`: Orange (`#f97316`)
  - `mini-boss`: Yellow (`#facc15`)
- **Juice**: Add a brief camera shake (`this.cameras.main.shake(200, 0.01)`) and screen dimming to emphasize the incoming threat before they spawn.

## 4. Verification Checklist
Before the `gameplay-engineer` considers this complete:
- [ ] Test wave successfully spawns basic minions, pauses for a warning, and then spawns a Mini-boss.
- [ ] Warning UI flashes with the correct color coding and text.
- [ ] Camera shake and delay respect the exact `durationMs` defined in the data.
