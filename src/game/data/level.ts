import type { Vector2 } from '../core/types';

export interface BuildSlot {
  id: string;
  x: number;
  y: number;
}

/** Waypoints enemies follow, start to end. Off-canvas start/end for a clean entry/exit. */
export const PATH_WAYPOINTS: Vector2[] = [
  { x: -20, y: 100 },
  { x: 200, y: 100 },
  { x: 200, y: 300 },
  { x: 500, y: 300 },
  { x: 500, y: 120 },
  { x: 760, y: 120 },
  { x: 760, y: 420 },
  { x: 980, y: 420 },
];

/** Fixed placement spots for the prototype. Free-grid placement is a future feature. */
export const BUILD_SLOTS: BuildSlot[] = [
  { id: 'slot-1', x: 120, y: 170 },
  { id: 'slot-2', x: 280, y: 170 },
  { id: 'slot-3', x: 350, y: 230 },
  { id: 'slot-4', x: 350, y: 370 },
  { id: 'slot-5', x: 580, y: 230 },
  { id: 'slot-6', x: 650, y: 120 },
  { id: 'slot-7', x: 650, y: 400 },
  { id: 'slot-8', x: 830, y: 300 },
  { id: 'slot-9', x: 830, y: 420 },
];

export const GAME_WIDTH = 960;
export const GAME_HEIGHT = 540;
