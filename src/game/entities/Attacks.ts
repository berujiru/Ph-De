import Phaser from 'phaser';
import type { Enemy } from './Enemy';
import { Summon } from './Summon';
import { GAME_WIDTH, WORLD_HEIGHT } from '../data/level';
import { MotionTrail } from './fx/MotionTrail';
import { spawnHitSpark } from './fx/ImpactFx';

/** Bold cel-shaded outline every attack shape wears against the dark field. */
const OUTLINE_COLOR = 0x0f172a;

export interface AttackModifiers {
  bonusDamage: number;
  bonusPierce: number;
  bonusRadius: number;
  bonusChain: number;
}

export abstract class Attack extends Phaser.GameObjects.GameObject {
  public isDead = false;
  protected damage: number;
  protected modifiers: AttackModifiers;
  public damageType: string;

  constructor(scene: Phaser.Scene, type: string, damage: number, modifiers?: Partial<AttackModifiers>, damageType: string = 'Physical') {
    super(scene, type);
    this.damage = damage;
    this.damageType = damageType;
    this.modifiers = {
      bonusDamage: modifiers?.bonusDamage || 0,
      bonusPierce: modifiers?.bonusPierce || 0,
      bonusRadius: modifiers?.bonusRadius || 0,
      bonusChain: modifiers?.bonusChain || 0,
    };
    scene.add.existing(this);
    try { scene.sound.play('sfx-shoot'); } catch(e) {}
  }

  public upgrade(newMods: Partial<AttackModifiers>) {
    if (newMods.bonusDamage) this.modifiers.bonusDamage += newMods.bonusDamage;
    if (newMods.bonusPierce) this.modifiers.bonusPierce += newMods.bonusPierce;
    if (newMods.bonusRadius) this.modifiers.bonusRadius += newMods.bonusRadius;
    if (newMods.bonusChain) this.modifiers.bonusChain += newMods.bonusChain;
  }

  public get totalDamage() {
    return this.damage + this.modifiers.bonusDamage;
  }

  abstract update(time: number, delta: number): void;
}

export class ProjectileAttack extends Attack {
  private target: Enemy | null;
  private speed = 500;
  private vx = 0;
  private vy = 0;
  private visual: Phaser.GameObjects.Arc;
  private trail: MotionTrail;
  private hitCount = 0;
  private maxHits: number;
  private hitEnemies = new Set<Enemy>();

  constructor(scene: Phaser.Scene, x: number, y: number, target: Enemy, damage: number, color: number, modifiers?: Partial<AttackModifiers>, damageType: string = 'Physical') {
    super(scene, 'ProjectileAttack', damage, modifiers, damageType);
    this.target = target;
    this.maxHits = 1 + this.modifiers.bonusPierce;
    this.trail = new MotionTrail(scene, color);
    this.visual = scene.add.circle(x, y, 30, color);
    this.visual.setStrokeStyle(4, OUTLINE_COLOR, 1);
    const dx = target.x - x;
    const dy = target.y - y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > 0) {
      this.vx = (dx / dist) * this.speed;
      this.vy = (dy / dist) * this.speed;
    }
  }

  public upgrade(newMods: Partial<AttackModifiers>) {
    super.upgrade(newMods);
    this.maxHits = 1 + this.modifiers.bonusPierce;
    if (newMods.bonusRadius) {
      this.visual.setRadius(30 + this.modifiers.bonusRadius);
    }
  }

  update(_time: number, delta: number) {
    if (this.isDead) return;
    if (this.target && this.target.isDead) this.target = null;
    if (this.target) {
      const dx = this.target.x - this.visual.x;
      const dy = this.target.y - this.visual.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > 0) {
        this.vx = (dx / dist) * this.speed;
        this.vy = (dy / dist) * this.speed;
      }
    }
    const dt = delta / 1000;
    this.visual.x += this.vx * dt;
    this.visual.y += this.vy * dt;
    this.trail.update(this.visual.x, this.visual.y, this.vx, this.vy);

    const enemies = (this.scene as any).enemies as Enemy[];
    if (enemies) {
      for (const enemy of enemies) {
        if (!enemy.isDead && !this.hitEnemies.has(enemy)) {
          const dx = enemy.x - this.visual.x;
          const dy = enemy.y - this.visual.y;
          const collisionRadius = 50 + this.modifiers.bonusRadius;
          if (dx * dx + dy * dy < collisionRadius * collisionRadius) {
            enemy.takeDamage(this.totalDamage, this.damageType);
            this.hitEnemies.add(enemy);
            this.hitCount++;
            if (this.hitCount >= this.maxHits) {
              this.die();
              return;
            }
          }
        }
      }
    }
    if (this.visual.x > GAME_WIDTH + 100 || this.visual.x < -100 || this.visual.y > WORLD_HEIGHT + 100 || this.visual.y < -100) {
      this.die();
    }
  }

  private die() {
    this.isDead = true;
    this.trail.destroy();
    this.visual.destroy();
    this.destroy();
  }
}

/**
 * Straight-line, non-homing pass-through shot (docs/VOICE_DROPS.md pierce spec).
 * Unlike ProjectileAttack it snapshots the hero->target vector at spawn and
 * never re-homes: it flies that fixed heading, damaging each enemy body it
 * overlaps once, until it has hit `basePierce + bonusPierce` enemies or leaves
 * the world bounds.
 */
export class PierceAttack extends Attack {
  private speed = 500;
  private vx = 0;
  private vy = 0;
  private visual: Phaser.GameObjects.Arc;
  private lance: Phaser.GameObjects.Rectangle;
  private hitCount = 0;
  private maxHits: number;
  private hitEnemies = new Set<Enemy>();

  constructor(scene: Phaser.Scene, x: number, y: number, target: Enemy | { x: number, y: number }, damage: number, color: number, basePierce: number, modifiers?: Partial<AttackModifiers>, damageType: string = 'Physical') {
    super(scene, 'PierceAttack', damage, modifiers, damageType);
    // Total pass-throughs = basePierce + bonusPierce (guard against bad data).
    this.maxHits = Math.max(1, basePierce + this.modifiers.bonusPierce);
    // A long lance/streak behind a bright tip so pierce reads as a spear, not a dot.
    this.lance = scene.add.rectangle(x, y, 160, 20, color, 0.85);
    this.lance.setStrokeStyle(4, OUTLINE_COLOR, 1);
    this.visual = scene.add.circle(x, y, 20, color);
    this.visual.setStrokeStyle(4, OUTLINE_COLOR, 1);

    // Snapshot the firing vector ONCE; the shot never curves after this.
    const dx = target.x - x;
    const dy = target.y - y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > 0) {
      this.vx = (dx / dist) * this.speed;
      this.vy = (dy / dist) * this.speed;
    } else {
      this.vx = this.speed; // degenerate case: fire straight up-lane
    }
    this.lance.setRotation(Math.atan2(this.vy, this.vx));
  }

  update(_time: number, delta: number) {
    if (this.isDead) return;
    const dt = delta / 1000;
    this.visual.x += this.vx * dt;
    this.visual.y += this.vy * dt;
    // Trail the lance body a little behind the tip.
    this.lance.setPosition(this.visual.x - this.vx / this.speed * 18, this.visual.y - this.vy / this.speed * 18);

    const nx = -this.vy;
    const ny = this.vx;
    const len = Math.sqrt(nx * nx + ny * ny) || 1;

    const enemies = (this.scene as any).enemies as Enemy[];
    if (enemies) {
      for (const enemy of enemies) {
        if (!enemy.isDead && !this.hitEnemies.has(enemy)) {
          const dx = enemy.x - this.visual.x;
          const dy = enemy.y - this.visual.y;
          const cross = Math.abs(dx * (ny / len) - dy * (nx / len));
          if (cross < 40 + this.modifiers.bonusRadius) {
            enemy.takeDamage(this.totalDamage, this.damageType);
            this.hitEnemies.add(enemy);
            this.hitCount++;
            if (this.hitCount >= this.maxHits) {
              this.die();
              return;
            }
          }
        }
      }
    }
    if (this.visual.x > GAME_WIDTH + 100 || this.visual.x < -100 || this.visual.y > WORLD_HEIGHT + 100 || this.visual.y < -100) {
      this.die();
    }
  }

  private die() {
    this.isDead = true;
    this.lance.destroy();
    this.visual.destroy();
    this.destroy();
  }
}

export class MeleeCleaveAttack extends Attack {
  private lifeTimeMs = 250;
  private ageMs = 0;
  private maxRadius: number;

  constructor(scene: Phaser.Scene, x: number, y: number, target: Enemy, damage: number, range: number, color: number, modifiers?: Partial<AttackModifiers>) {
    super(scene, 'MeleeCleaveAttack', damage, modifiers);
    this.maxRadius = range + this.modifiers.bonusRadius;
    const dx = target.x - x;
    const dy = target.y - y;
    const angleRad = Math.atan2(dy, dx);
    const angleDeg = Phaser.Math.RadToDeg(angleRad);
    
    // Multiple ripple visual
    for (let i = 0; i < 3; i++) {
      const arc = scene.add.arc(x, y, 10, angleDeg - 45, angleDeg + 45, false, color, 0.8);
      arc.setStrokeStyle(3, 0xffffff, 0.9);
      
      scene.tweens.add({
        targets: arc,
        radius: this.maxRadius,
        alpha: 0,
        duration: 200,
        delay: i * 40,
        ease: 'Quad.easeOut',
        onComplete: () => arc.destroy()
      });
    }

    const enemies = (scene as any).enemies as Enemy[];
    if (enemies) {
      for (const enemy of enemies) {
        if (!enemy.isDead) {
          const edx = enemy.x - x;
          const edy = enemy.y - y;
          const distSq = edx * edx + edy * edy;
          if (distSq <= this.maxRadius * this.maxRadius) {
            const eAngle = Math.atan2(edy, edx);
            let diff = eAngle - angleRad;
            while (diff < -Math.PI) diff += Math.PI * 2;
            while (diff > Math.PI) diff -= Math.PI * 2;
            if (Math.abs(diff) <= Math.PI / 4) {
              enemy.takeDamage(this.totalDamage);
            }
          }
        }
      }
    }
  }

  update(_time: number, delta: number) {
    if (this.isDead) return;
    this.ageMs += delta;
    if (this.ageMs >= this.lifeTimeMs) {
      this.isDead = true;
      this.destroy();
    }
  }
}

export class VortexAttack extends Attack {
  private visual: Phaser.GameObjects.Arc;
  private swirls: Phaser.GameObjects.Arc[] = [];
  private lifeTimeMs = 3000;
  private ageMs = 0;
  private tickRateMs = 500;
  private timeSinceLastTick = 0;

  constructor(scene: Phaser.Scene, _x: number, _y: number, target: Enemy, damage: number, color: number, modifiers?: Partial<AttackModifiers>) {
    super(scene, 'VortexAttack', damage, modifiers);
    const radius = 100 + this.modifiers.bonusRadius;
    // Spawn at target location so it traps enemies there
    this.visual = scene.add.circle(target.x, target.y, radius, color, 0.3);
    this.visual.setStrokeStyle(3, color, 0.9);
    // Two open arcs that spin to sell the suction.
    for (let i = 0; i < 2; i++) {
      const arc = scene.add.arc(target.x, target.y, radius * (0.55 + i * 0.3), 0, 200, false, 0xffffff, 0);
      arc.setStrokeStyle(3, 0xffffff, 0.5);
      arc.setRotation(i * Math.PI);
      this.swirls.push(arc);
    }
  }

  update(_time: number, delta: number) {
    if (this.isDead) return;
    this.ageMs += delta;
    this.timeSinceLastTick += delta;

    this.visual.setAlpha(0.3 + 0.1 * Math.sin(this.ageMs / 100));
    for (let i = 0; i < this.swirls.length; i++) {
      this.swirls[i].rotation += (delta / 1000) * (i === 0 ? 5 : -3.5);
    }
    const radius = 100 + this.modifiers.bonusRadius;
    
    const enemies = (this.scene as any).enemies as Enemy[];
    if (enemies) {
      for (const enemy of enemies) {
        if (enemy.isDead) continue;
        const dx = this.visual.x - enemy.x;
        const dy = this.visual.y - enemy.y;
        const distSq = dx * dx + dy * dy;
        
        if (distSq <= radius * radius) {
          // Pull enemy
          enemy.x += dx * 0.05;
          enemy.y += dy * 0.05;
          
          if (this.timeSinceLastTick >= this.tickRateMs) {
            enemy.takeDamage(this.totalDamage * 0.5);
          }
        }
      }
    }
    
    if (this.timeSinceLastTick >= this.tickRateMs) {
      this.timeSinceLastTick -= this.tickRateMs;
    }
    
    if (this.ageMs >= this.lifeTimeMs) {
      this.isDead = true;
      this.visual.destroy();
      for (const swirl of this.swirls) swirl.destroy();
      this.destroy();
    }
  }
}

export class BoomerangAttack extends Attack {
  private speed = 400;
  private visual: Phaser.GameObjects.Arc;
  private blade: Phaser.GameObjects.Rectangle;
  private trail: MotionTrail;
  private flightState: 'outward' | 'returning' = 'outward';
  private startX: number;
  private startY: number;
  private targetX: number;
  private targetY: number;
  private hero: import('./Hero').Hero;
  private hitEnemiesOutward = new Set<Enemy>();
  private hitEnemiesReturning = new Set<Enemy>();

  constructor(scene: Phaser.Scene, hero: import('./Hero').Hero, target: Enemy, damage: number, color: number, modifiers?: Partial<AttackModifiers>) {
    super(scene, 'BoomerangAttack', damage, modifiers);
    this.hero = hero;
    this.trail = new MotionTrail(scene, color);
    this.visual = scene.add.circle(hero.x, hero.y, 35 + this.modifiers.bonusRadius, color);
    this.visual.setStrokeStyle(4, OUTLINE_COLOR, 1);
    // A spinning crossbar so the boomerang visibly tumbles as it flies.
    this.blade = scene.add.rectangle(hero.x, hero.y, 100 + this.modifiers.bonusRadius * 2, 20, color, 0.9);
    this.blade.setStrokeStyle(4, OUTLINE_COLOR, 1);

    this.startX = hero.x;
    this.startY = hero.y;
    
    const range = hero.range;
    const dx = target.x - hero.x;
    const dy = target.y - hero.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    if (dist > 0) {
      this.targetX = this.startX + (dx / dist) * range;
      this.targetY = this.startY + (dy / dist) * range;
    } else {
      this.targetX = this.startX + range;
      this.targetY = this.startY;
    }
  }
  
  update(_time: number, delta: number) {
    if (this.isDead) return;
    const dt = delta / 1000;
    
    const destX = this.flightState === 'outward' ? this.targetX : this.hero.x;
    const destY = this.flightState === 'outward' ? this.targetY : this.hero.y;
    
    const dx = destX - this.visual.x;
    const dy = destY - this.visual.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    if (dist < 10) {
      if (this.flightState === 'outward') {
        this.flightState = 'returning';
      } else {
        this.die();
        return;
      }
    } else {
      this.visual.x += (dx / dist) * this.speed * dt;
      this.visual.y += (dy / dist) * this.speed * dt;
    }

    // Spin the blade, keep it on the core, and stream a trail behind the flight.
    this.blade.setPosition(this.visual.x, this.visual.y);
    this.blade.rotation += dt * 18;
    this.trail.update(this.visual.x, this.visual.y, dx, dy);

    const enemies = (this.scene as any).enemies as Enemy[];
    if (enemies) {
      for (const enemy of enemies) {
        if (enemy.isDead) continue;
        const hitSet = this.flightState === 'outward' ? this.hitEnemiesOutward : this.hitEnemiesReturning;
        if (!hitSet.has(enemy)) {
          const edx = enemy.x - this.visual.x;
          const edy = enemy.y - this.visual.y;
          const collisionRadius = 50 + this.modifiers.bonusRadius;
          if (edx * edx + edy * edy < collisionRadius * collisionRadius) {
            enemy.takeDamage(this.totalDamage);
            hitSet.add(enemy);
          }
        }
      }
    }
  }
  
  private die() {
    this.isDead = true;
    this.trail.destroy();
    this.blade.destroy();
    this.visual.destroy();
    this.destroy();
  }
}

export class ChainAttack extends Attack {
  private ageMs = 0;
  private lines: Phaser.GameObjects.Line[] = [];
  
  constructor(scene: Phaser.Scene, startX: number, startY: number, target: Enemy, damage: number, color: number, baseChain: number, modifiers?: Partial<AttackModifiers>) {
    super(scene, 'ChainAttack', damage, modifiers);

    let currentTarget = target;
    let currentX = startX;
    let currentY = startY;

    // Arc count comes from the hero's baseChain + any bonusChain upgrades.
    const maxJumps = Math.max(1, baseChain + this.modifiers.bonusChain);
    let jumps = 0;
    const hitEnemies = new Set<Enemy>();
    const enemies = (scene as any).enemies as Enemy[];
    let currentDamage = this.totalDamage;
    
    while (currentTarget && jumps < maxJumps) {
      currentTarget.takeDamage(currentDamage);
      hitEnemies.add(currentTarget);

      // Crackling multi-segment arc between the two points, with a wider soft
      // glow underneath and a bright white core over it.
      this.drawCrackle(scene, currentX, currentY, currentTarget.x, currentTarget.y, color, 14, 0.4);
      this.drawCrackle(scene, currentX, currentY, currentTarget.x, currentTarget.y, 0xffffff, 5, 1);

      currentX = currentTarget.x;
      currentY = currentTarget.y;
      jumps++;
      
      currentDamage = Math.max(1, currentDamage * 0.8); // 20% damage drop per bounce
      
      let nextTarget: Enemy | null = null;
      let minDist = 350 * 350; // Increased chain bounce range to 350 (smaller than hero's 1400 range)
      if (enemies) {
        for (const e of enemies) {
          if (!e.isDead && !hitEnemies.has(e)) {
            const dx = e.x - currentX;
            const dy = e.y - currentY;
            const distSq = dx * dx + dy * dy;
            if (distSq < minDist) {
              minDist = distSq;
              nextTarget = e;
            }
          }
        }
      }
      if (!nextTarget) break;
      currentTarget = nextTarget;
    }
  }

  /** Draw a jagged lightning arc from (x1,y1) to (x2,y2) as chained segments. */
  private drawCrackle(scene: Phaser.Scene, x1: number, y1: number, x2: number, y2: number, color: number, width: number, alpha: number) {
    const segments = 5;
    const dx = x2 - x1;
    const dy = y2 - y1;
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    // Unit perpendicular for the zigzag offset.
    const px = -dy / len;
    const py = dx / len;
    let prevX = x1;
    let prevY = y1;
    for (let i = 1; i <= segments; i++) {
      const t = i / segments;
      const jitter = i === segments ? 0 : (Math.random() - 0.5) * 22;
      const nx = x1 + dx * t + px * jitter;
      const ny = y1 + dy * t + py * jitter;
      const line = scene.add.line(0, 0, prevX, prevY, nx, ny, color, alpha).setOrigin(0, 0);
      line.setLineWidth(width);
      this.lines.push(line);
      prevX = nx;
      prevY = ny;
    }
  }

  update(_time: number, delta: number) {
    if (this.isDead) return;
    this.ageMs += delta;
    for (const line of this.lines) {
      line.setAlpha(1 - this.ageMs / 150);
    }
    if (this.ageMs >= 150) {
      this.isDead = true;
      for (const line of this.lines) line.destroy();
      this.destroy();
    }
  }
}

export class SummonAttack extends Attack {
  constructor(scene: Phaser.Scene, _x: number, _y: number, target: Enemy, damage: number, color: number, modifiers?: Partial<AttackModifiers>) {
    super(scene, 'SummonAttack', damage, modifiers);
    
    // Total damage stat is repurposed as maxHP for summons
    const summonHp = this.totalDamage * 10;
    const summon = new Summon(scene, target.x, target.y, summonHp, color);
    
    if ((scene as any).summons) {
      (scene as any).summons.push(summon);
    }
    
    this.isDead = true;
  }
  
  update() {}
}

export class BeamAttack extends Attack {
  private ageMs = 0;
  private lifeTimeMs = 150;
  private visual: Phaser.GameObjects.Line;
  private glow: Phaser.GameObjects.Line;

  constructor(scene: Phaser.Scene, startX: number, startY: number, target: Enemy, damage: number, color: number, modifiers?: Partial<AttackModifiers>) {
    super(scene, 'BeamAttack', damage, modifiers);

    const range = 1000;
    const dx = target.x - startX;
    const dy = target.y - startY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    let endX = startX + range;
    let endY = startY;
    if (dist > 0) {
      endX = startX + (dx / dist) * range;
      endY = startY + (dy / dist) * range;
    }

    // Layered look: a wide translucent glow with a bright white core over it.
    this.glow = scene.add.line(0, 0, startX, startY, endX, endY, color, 0.35).setOrigin(0, 0);
    this.glow.setLineWidth(12 + this.modifiers.bonusRadius * 2);
    this.visual = scene.add.line(0, 0, startX, startY, endX, endY, 0xffffff).setOrigin(0, 0);
    this.visual.setLineWidth(4 + this.modifiers.bonusRadius);

    // Hit half-width grows with bonusRadius so the `radius` upgrade actually
    // changes what the beam catches (not just its drawn thickness).
    const hitHalfWidth = 20 + this.modifiers.bonusRadius;
    const hitHalfWidthSq = hitHalfWidth * hitHalfWidth;

    const enemies = (scene as any).enemies as Enemy[];
    if (enemies) {
      for (const enemy of enemies) {
        if (!enemy.isDead) {
          const l2 = range * range;
          let t = ((enemy.x - startX) * (endX - startX) + (enemy.y - startY) * (endY - startY)) / l2;
          t = Math.max(0, Math.min(1, t));
          const projX = startX + t * (endX - startX);
          const projY = startY + t * (endY - startY);

          const edx = enemy.x - projX;
          const edy = enemy.y - projY;
          if (edx * edx + edy * edy < hitHalfWidthSq) {
            enemy.takeDamage(this.totalDamage);
          }
        }
      }
    }
  }
  
  update(_time: number, delta: number) {
    if (this.isDead) return;
    this.ageMs += delta;
    const fade = 1 - this.ageMs / this.lifeTimeMs;
    this.visual.setAlpha(fade);
    this.glow.setAlpha(fade * 0.35);
    if (this.ageMs >= this.lifeTimeMs) {
      this.isDead = true;
      this.glow.destroy();
      this.visual.destroy();
      this.destroy();
    }
  }
}

export class LobbedAttack extends Attack {
  private startX: number;
  private startY: number;
  private targetX: number;
  private targetY: number;
  private progress = 0;
  private travelTimeMs = 600;
  private visual: Phaser.GameObjects.Arc;
  private shadow: Phaser.GameObjects.Ellipse;

  constructor(scene: Phaser.Scene, startX: number, startY: number, target: Enemy, damage: number, color: number, modifiers?: Partial<AttackModifiers>) {
    super(scene, 'LobbedAttack', damage, modifiers);
    this.startX = startX;
    this.startY = startY;
    this.targetX = target.x;
    this.targetY = target.y;

    // Ground shadow that tracks the landing spot — sells the arc height.
    this.shadow = scene.add.ellipse(startX, startY, 60, 20, 0x000000, 0.35);
    this.visual = scene.add.circle(startX, startY, 30, color);
    this.visual.setStrokeStyle(4, OUTLINE_COLOR, 1);
  }

  update(_time: number, delta: number) {
    if (this.isDead) return;
    this.progress += delta / this.travelTimeMs;

    if (this.progress >= 1) {
      this.progress = 1;
      this.explode();
    } else {
      const baseX = this.startX + (this.targetX - this.startX) * this.progress;
      const baseY = this.startY + (this.targetY - this.startY) * this.progress;
      const arc = Math.sin(this.progress * Math.PI) * 100;

      this.visual.x = baseX;
      this.visual.y = baseY - arc;
      // Shadow stays on the ground line and tightens as the shot descends.
      this.shadow.setPosition(baseX, baseY);
      const tightness = 1 - Math.sin(this.progress * Math.PI) * 0.5;
      this.shadow.setScale(tightness, tightness);
    }
  }

  private explode() {
    const radius = 50 + this.modifiers.bonusRadius;
    const enemies = (this.scene as any).enemies as Enemy[];
    if (enemies) {
      for (const enemy of enemies) {
        if (!enemy.isDead) {
          const dx = enemy.x - this.targetX;
          const dy = enemy.y - this.targetY;
          if (dx * dx + dy * dy <= radius * radius) {
            enemy.takeDamage(this.totalDamage);
          }
        }
      }
    }

    // Crater flash: a filled pop plus an expanding shockwave ring and sparks.
    const flash = this.scene.add.circle(this.targetX, this.targetY, radius, 0xffaa00, 0.5);
    this.scene.tweens.add({
      targets: flash,
      alpha: 0,
      duration: 200,
      onComplete: () => flash.destroy()
    });
    const ring = this.scene.add.circle(this.targetX, this.targetY, radius * 0.5, 0xffaa00, 0);
    ring.setStrokeStyle(3, 0xffd27f, 0.9);
    this.scene.tweens.add({
      targets: ring,
      scale: 2,
      alpha: 0,
      duration: 260,
      ease: 'Quad.easeOut',
      onComplete: () => ring.destroy()
    });
    spawnHitSpark(this.scene, this.targetX, this.targetY, 0xffd27f);

    this.isDead = true;
    this.shadow.destroy();
    this.visual.destroy();
    this.destroy();
  }
}

export class LinearWaveAttack extends Attack {
  private speed = 300;
  private maxTravelPx = 900;
  private startY: number;
  private visual: Phaser.GameObjects.Rectangle;
  private edge: Phaser.GameObjects.Rectangle;
  private hitEnemies = new Set<Enemy>();

  constructor(scene: Phaser.Scene, x: number, y: number, damage: number, color: number, modifiers?: Partial<AttackModifiers>) {
    super(scene, 'LinearWaveAttack', damage, modifiers);
    const waveWidth = 150 + this.modifiers.bonusRadius * 2;
    const waveHeight = 40;
    this.startY = y;
    
    // Translucent body with a bright leading edge
    this.visual = scene.add.rectangle(x, y, waveWidth, waveHeight, color, 0.6);
    this.visual.setStrokeStyle(2, OUTLINE_COLOR, 0.8);
    this.edge = scene.add.rectangle(x, y - waveHeight / 2, waveWidth, 6, 0xffffff, 0.9);

    // Animation improvement: pulse width slightly as it travels
    scene.tweens.add({
      targets: [this.visual, this.edge],
      scaleX: 1.15,
      yoyo: true,
      repeat: -1,
      duration: 200,
      ease: 'Sine.easeInOut'
    });
  }

  update(_time: number, delta: number) {
    if (this.isDead) return;
    
    this.visual.y -= this.speed * (delta / 1000);
    this.edge.setPosition(this.visual.x, this.visual.y - this.visual.height / 2);

    // Improve animation: spawn trailing particles
    const particle = this.scene.add.circle(
      this.visual.x + Phaser.Math.Between(-this.visual.width/2, this.visual.width/2),
      this.visual.y + this.visual.height/2,
      Phaser.Math.Between(2, 6),
      0xffffff,
      0.6
    );
    this.scene.tweens.add({
      targets: particle,
      y: particle.y + 30,
      alpha: 0,
      scale: 0,
      duration: 500,
      onComplete: () => particle.destroy()
    });

    const enemies = (this.scene as any).enemies as Enemy[];
    if (enemies) {
      for (const enemy of enemies) {
        if (!enemy.isDead && !this.hitEnemies.has(enemy)) {
          // Expanded hit box to account for visual scale pulse
          if (Math.abs(enemy.x - this.visual.x) < (this.visual.width * 1.15) / 2 + 15 &&
              Math.abs(enemy.y - this.visual.y) < this.visual.height / 2 + 15) {
            enemy.takeDamage(this.totalDamage);
            this.hitEnemies.add(enemy);
          }
        }
      }
    }
    
    if (this.startY - this.visual.y > this.maxTravelPx) {
      this.isDead = true;
      this.edge.destroy();
      this.visual.destroy();
      this.destroy();
    }
  }
}

export class TrapAttack extends Attack {
  private visual: Phaser.GameObjects.Arc;
  private telegraph: Phaser.GameObjects.Arc;

  constructor(scene: Phaser.Scene, _x: number, _y: number, target: Enemy, damage: number, color: number, modifiers?: Partial<AttackModifiers>) {
    super(scene, 'TrapAttack', damage, modifiers);
    const trapX = target.x - 50;
    const trapY = target.y;
    this.visual = scene.add.circle(trapX, trapY, 10, color, 0.4);
    this.visual.setStrokeStyle(2, OUTLINE_COLOR, 0.9);
    // A pulsing hazard ring telegraphs the armed trap's footprint.
    const explosionRadius = 80 + this.modifiers.bonusRadius;
    this.telegraph = scene.add.circle(trapX, trapY, explosionRadius, color, 0);
    this.telegraph.setStrokeStyle(2, color, 0.5);
    scene.tweens.add({
      targets: this.telegraph,
      alpha: { from: 0.6, to: 0.15 },
      scale: { from: 0.9, to: 1 },
      yoyo: true,
      repeat: -1,
      duration: 600,
      ease: 'Sine.easeInOut',
    });
  }

  update(_time: number, _delta: number) {
    if (this.isDead) return;

    const triggerRadius = 20;
    const explosionRadius = 80 + this.modifiers.bonusRadius;
    
    const enemies = (this.scene as any).enemies as Enemy[];
    if (enemies) {
      for (const enemy of enemies) {
        if (!enemy.isDead) {
          const dx = enemy.x - this.visual.x;
          const dy = enemy.y - this.visual.y;
          if (dx * dx + dy * dy < triggerRadius * triggerRadius) {
            this.explode(explosionRadius);
            return;
          }
        }
      }
    }
  }
  
  private explode(radius: number) {
    const enemies = (this.scene as any).enemies as Enemy[];
    if (enemies) {
      for (const enemy of enemies) {
        if (!enemy.isDead) {
          const dx = enemy.x - this.visual.x;
          const dy = enemy.y - this.visual.y;
          if (dx * dx + dy * dy <= radius * radius) {
            enemy.takeDamage(this.totalDamage);
          }
        }
      }
    }
    
    const flash = this.scene.add.circle(this.visual.x, this.visual.y, radius, 0xff0000, 0.5);
    this.scene.tweens.add({
      targets: flash,
      alpha: 0,
      duration: 200,
      onComplete: () => flash.destroy()
    });
    const ring = this.scene.add.circle(this.visual.x, this.visual.y, radius * 0.5, 0xff0000, 0);
    ring.setStrokeStyle(3, 0xfca5a5, 0.9);
    this.scene.tweens.add({
      targets: ring,
      scale: 2,
      alpha: 0,
      duration: 260,
      ease: 'Quad.easeOut',
      onComplete: () => ring.destroy()
    });
    spawnHitSpark(this.scene, this.visual.x, this.visual.y, 0xfca5a5);

    this.isDead = true;
    this.scene.tweens.killTweensOf(this.telegraph);
    this.telegraph.destroy();
    this.visual.destroy();
    this.destroy();
  }
}

export class AoeRootFieldAttack extends Attack {
  private durationMs: number;
  private ageMs = 0;
  private radius: number;
  private xPos: number;
  private yPos: number;
  private groundVisual: Phaser.GameObjects.Graphics;
  private lightningIcon: Phaser.GameObjects.Text;
  private pulsingCircles: Phaser.GameObjects.Graphics;

  constructor(scene: Phaser.Scene, x: number, y: number, radius: number, duration: number, damage: number) {
    super(scene, 'AoeRootFieldAttack', damage);
    this.xPos = x;
    this.yPos = y;
    this.radius = radius;
    this.durationMs = duration;
    
    // Outer glowing ring (STATIC)
    this.groundVisual = scene.add.graphics();
    this.groundVisual.setPosition(x, y);
    this.groundVisual.lineStyle(6, 0xeab308, 0.8);
    this.groundVisual.strokeCircle(0, 0, radius);

    // Pulsing circle lines within the AoE
    this.pulsingCircles = scene.add.graphics();
    this.pulsingCircles.setPosition(x, y);
    this.pulsingCircles.lineStyle(2, 0xfef08a, 0.6);
    this.pulsingCircles.strokeCircle(0, 0, radius * 0.4);
    this.pulsingCircles.strokeCircle(0, 0, radius * 0.8);
    
    scene.tweens.add({
      targets: this.pulsingCircles,
      scaleX: 1.15,
      scaleY: 1.15,
      alpha: 0.3,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // 1 big lightning icon in the middle
    this.lightningIcon = scene.add.text(x, y, '⚡', { fontSize: '42px' }).setOrigin(0.5);
    scene.tweens.add({
      targets: this.lightningIcon,
      scaleX: 1.15,
      scaleY: 1.15,
      duration: 500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  update(_time: number, delta: number) {
    if (this.isDead) return;
    this.ageMs += delta;
    if (this.ageMs >= this.durationMs) {
      this.isDead = true;
      this.groundVisual.destroy();
      this.pulsingCircles.destroy();
      this.lightningIcon.destroy();
      this.destroy();
      return;
    }

    const enemies = (this.scene as any).enemies as Enemy[];
    if (enemies) {
      for (const enemy of enemies) {
        if (!enemy.isDead) {
          const dx = enemy.x - this.xPos;
          const dy = enemy.y - this.yPos;
          if (dx * dx + dy * dy <= this.radius * this.radius) {
            enemy.applyAilment('root', 1, 500); // rooted icon
            enemy.applyAilment('stun', 1, 500); // completely stunned
            if (this.damage > 0) {
                enemy.takeDamage(this.damage);
            }
          }
        }
      }
    }
    // Set damage to 0 after first frame so it only bursts once upon cast
    this.damage = 0;
  }
}

export class RollingBlackoutWaveAttack extends Attack {
  private speed = 1200;
  private hitEnemies = new Set<Enemy>();
  private waveGraphic: Phaser.GameObjects.Graphics;
  private waveWidth = 1200; // Larger than GAME_WIDTH to cover screen during shake
  private lastFlicker = 0;

  constructor(scene: Phaser.Scene, y: number, damage: number, _color: number) {
    super(scene, 'RollingBlackoutWaveAttack', damage);
    
    this.waveGraphic = scene.add.graphics();
    this.waveGraphic.setPosition(scene.scale.width / 2, y);
    this.waveGraphic.setDepth(30);
    
    this.drawLightning();
  }

  private drawLightning() {
    this.waveGraphic.clear();

    // Outer glow (Yellow)
    this.waveGraphic.lineStyle(16, 0xfacc15, 0.6);
    this.waveGraphic.beginPath();
    let currX = -this.waveWidth / 2;
    this.waveGraphic.moveTo(currX, 0);
    while (currX < this.waveWidth / 2) {
      currX += Phaser.Math.Between(40, 90);
      if (currX > this.waveWidth / 2) currX = this.waveWidth / 2;
      const jY = Phaser.Math.Between(-40, 40);
      this.waveGraphic.lineTo(currX, jY);
    }
    this.waveGraphic.strokePath();

    // Inner core (White)
    this.waveGraphic.lineStyle(6, 0xffffff, 1);
    this.waveGraphic.beginPath();
    currX = -this.waveWidth / 2;
    this.waveGraphic.moveTo(currX, 0);
    while (currX < this.waveWidth / 2) {
      currX += Phaser.Math.Between(40, 90);
      if (currX > this.waveWidth / 2) currX = this.waveWidth / 2;
      const jY = Phaser.Math.Between(-20, 20);
      this.waveGraphic.lineTo(currX, jY);
    }
    this.waveGraphic.strokePath();
  }
  
  update(time: number, delta: number) {
    if (this.isDead) return;
    
    // Redraw every 50ms to create a flowing current effect
    if (time - this.lastFlicker > 50) {
      this.lastFlicker = time;
      this.drawLightning();
    }
    
    this.waveGraphic.y -= this.speed * (delta / 1000);
    
    // Destroy when it has scrolled completely off the top of the visible screen
    if (this.waveGraphic.y < this.scene.cameras.main.scrollY - 100) {
      this.isDead = true;
      this.waveGraphic.destroy();
      this.destroy();
      return;
    }

    const enemies = (this.scene as any).enemies as Enemy[];
    if (enemies) {
      for (const enemy of enemies) {
        if (!enemy.isDead && !this.hitEnemies.has(enemy)) {
          // If enemy's y is close to the wave's y
          if (Math.abs(enemy.y - this.waveGraphic.y) < 60) {
            enemy.takeDamage(this.totalDamage);
            this.hitEnemies.add(enemy);
          }
        }
      }
    }
  }
}

export class FlushWaveAttack extends Attack {
  private speed = 300;
  private hitEnemies = new Set<Enemy>();
  private knockbackDist: number;
  private startY: number;
  private visual: Phaser.GameObjects.Rectangle;
  private edge: Phaser.GameObjects.Rectangle;

  constructor(scene: Phaser.Scene, y: number, damage: number, numWaves: number, knockback: number) {
    super(scene, 'FlushWaveAttack', damage);
    this.knockbackDist = knockback;
    this.startY = y;

    // Plumber's color (water)
    const color = 0x38bdf8;
    const waveWidth = scene.scale.width + 200; // Massive width to cover screen
    const waveHeight = 80 + (numWaves * 15);   // Scale height based on drops

    this.visual = scene.add.rectangle(scene.scale.width / 2, y, waveWidth, waveHeight, color, 0.65);
    this.visual.setStrokeStyle(2, OUTLINE_COLOR, 0.8);
    this.visual.setDepth(30);

    this.edge = scene.add.rectangle(scene.scale.width / 2, y - waveHeight / 2, waveWidth, 12, 0xffffff, 0.9);
    this.edge.setDepth(31);

    // Pulse width animation
    scene.tweens.add({
      targets: [this.visual, this.edge],
      scaleX: 1.05,
      yoyo: true,
      repeat: -1,
      duration: 300,
      ease: 'Sine.easeInOut'
    });
  }

  update(_time: number, delta: number) {
    if (this.isDead) return;

    this.visual.y -= this.speed * (delta / 1000);
    this.edge.setPosition(this.visual.x, this.visual.y - this.visual.height / 2);

    // Fade out only at the very end of its travel
    const deathY = this.scene.cameras.main.scrollY - 200;
    const distToDeath = this.visual.y - deathY;
    const fadeRatio = distToDeath < 250 ? Math.max(0, distToDeath / 250) : 1;
    
    this.visual.setAlpha(0.65 * fadeRatio);
    this.edge.setAlpha(0.9 * fadeRatio);

    // Trail particles
    if (fadeRatio > 0.1) {
      const particle = this.scene.add.circle(
        this.visual.x + Phaser.Math.Between(-this.visual.width/2, this.visual.width/2),
        this.visual.y + this.visual.height/2,
        Phaser.Math.Between(4, 12),
        0xffffff,
        0.5 * fadeRatio
      );
      particle.setDepth(29);
      this.scene.tweens.add({
        targets: particle,
        y: particle.y + 40,
        alpha: 0,
        scale: 0,
        duration: 700,
        onComplete: () => particle.destroy()
      });
    }

    if (this.visual.y < this.scene.cameras.main.scrollY - 200) {
      this.isDead = true;
      this.edge.destroy();
      this.visual.destroy();
      this.destroy();
      return;
    }

    const enemies = (this.scene as any).enemies as Enemy[];
    if (enemies) {
      for (const enemy of enemies) {
        if (!enemy.isDead && !this.hitEnemies.has(enemy)) {
          const distY = Math.abs(enemy.y - this.visual.y);
          
          if (distY < this.visual.height / 2 + 30) {
            enemy.takeDamage(this.totalDamage);
            enemy.applyAilment('slow', 100, 4000);
            
            this.scene.tweens.add({
              targets: enemy,
              y: enemy.y - this.knockbackDist,
              duration: 300,
              ease: 'Power2'
            });

            this.hitEnemies.add(enemy);
          }
        }
      }
    }
  }
}
