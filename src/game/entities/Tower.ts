import Phaser from 'phaser';
import type { TowerDefinition } from '../data/balance';
import { findTarget } from '../core/Targeting';
import type { Enemy } from './Enemy';

export class Tower extends Phaser.GameObjects.Container {
  readonly definition: TowerDefinition;
  onFire?: (tower: Tower, target: Enemy) => void;

  private cooldownMs = 0;
  private readonly rangeCircle: Phaser.GameObjects.Arc;

  constructor(scene: Phaser.Scene, x: number, y: number, definition: TowerDefinition) {
    super(scene, x, y);
    this.definition = definition;

    this.rangeCircle = scene.add.circle(0, 0, definition.range, definition.color, 0.08);
    this.rangeCircle.setVisible(false);
    const base = scene.add.rectangle(0, 0, 28, 28, definition.color).setStrokeStyle(2, 0x0f172a);

    this.add([this.rangeCircle, base]);
    scene.add.existing(this);
  }

  setRangeVisible(visible: boolean): void {
    this.rangeCircle.setVisible(visible);
  }

  update(dtMs: number, enemies: readonly Enemy[]): void {
    this.cooldownMs = Math.max(0, this.cooldownMs - dtMs);
    if (this.cooldownMs > 0) return;

    const liveEnemies = enemies.filter((enemy) => !enemy.isDead && !enemy.reachedEnd);
    const target = findTarget(this.x, this.y, this.definition.range, liveEnemies);
    if (!target) return;

    this.onFire?.(this, target);
    this.cooldownMs = this.definition.fireRateMs;
  }
}
