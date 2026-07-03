import Phaser from 'phaser';
import type { EnemyDefinition } from '../data/balance';
import type { Vector2 } from '../core/types';

export class Enemy extends Phaser.GameObjects.Container {
  readonly definition: EnemyDefinition;
  hp: number;
  distanceTraveled = 0;
  reachedEnd = false;

  private readonly path: readonly Vector2[];
  private segmentIndex = 0;
  private readonly hpBarFill: Phaser.GameObjects.Rectangle;

  constructor(scene: Phaser.Scene, definition: EnemyDefinition, path: readonly Vector2[]) {
    const start = path[0];
    super(scene, start.x, start.y);
    this.definition = definition;
    this.hp = definition.maxHp;
    this.path = path;

    const body = scene.add.circle(0, 0, 12, definition.color);
    const hpBarBg = scene.add.rectangle(0, -20, 24, 4, 0x000000, 0.5);
    this.hpBarFill = scene.add.rectangle(-12, -20, 24, 4, 0x22c55e).setOrigin(0, 0.5);

    this.add([body, hpBarBg, this.hpBarFill]);
    scene.add.existing(this);
  }

  get isDead(): boolean {
    return this.hp <= 0;
  }

  takeDamage(amount: number): void {
    this.hp = Math.max(0, this.hp - amount);
    const pct = this.hp / this.definition.maxHp;
    this.hpBarFill.width = 24 * pct;
  }

  update(dtMs: number): void {
    if (this.reachedEnd || this.isDead) return;

    let remaining = (this.definition.speed * dtMs) / 1000;
    while (remaining > 0 && this.segmentIndex < this.path.length - 1) {
      const from = this.path[this.segmentIndex];
      const to = this.path[this.segmentIndex + 1];
      const dx = to.x - from.x;
      const dy = to.y - from.y;
      const segmentLength = Math.hypot(dx, dy);
      const traveledInSegment = Phaser.Math.Distance.Between(from.x, from.y, this.x, this.y);
      const segmentRemaining = segmentLength - traveledInSegment;

      if (remaining < segmentRemaining) {
        const t = (traveledInSegment + remaining) / segmentLength;
        this.setPosition(from.x + dx * t, from.y + dy * t);
        this.distanceTraveled += remaining;
        remaining = 0;
      } else {
        this.setPosition(to.x, to.y);
        this.distanceTraveled += segmentRemaining;
        remaining -= segmentRemaining;
        this.segmentIndex += 1;
      }
    }

    if (this.segmentIndex >= this.path.length - 1) {
      this.reachedEnd = true;
    }
  }
}
