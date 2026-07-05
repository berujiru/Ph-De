import Phaser from 'phaser';
import type { Enemy } from './Enemy';
import { Summon } from './Summon';
import { WORLD_WIDTH } from '../data/level';

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

  constructor(scene: Phaser.Scene, type: string, damage: number, modifiers?: Partial<AttackModifiers>) {
    super(scene, type);
    this.damage = damage;
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
  private hitCount = 0;
  private maxHits: number;
  private hitEnemies = new Set<Enemy>();

  constructor(scene: Phaser.Scene, x: number, y: number, target: Enemy, damage: number, color: number, modifiers?: Partial<AttackModifiers>) {
    super(scene, 'ProjectileAttack', damage, modifiers);
    this.target = target;
    this.maxHits = 1 + this.modifiers.bonusPierce;
    this.visual = scene.add.circle(x, y, 6, color);
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
      this.visual.setRadius(6 + this.modifiers.bonusRadius);
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

    const enemies = (this.scene as any).enemies as Enemy[];
    if (enemies) {
      for (const enemy of enemies) {
        if (!enemy.isDead && !this.hitEnemies.has(enemy)) {
          const dx = enemy.x - this.visual.x;
          const dy = enemy.y - this.visual.y;
          const collisionRadius = 20 + this.modifiers.bonusRadius;
          if (dx * dx + dy * dy < collisionRadius * collisionRadius) {
            enemy.takeDamage(this.totalDamage);
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
    if (this.visual.x > WORLD_WIDTH + 100 || this.visual.x < -100 || this.visual.y > 1500 || this.visual.y < -100) {
      this.die();
    }
  }

  private die() {
    this.isDead = true;
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
  private hitCount = 0;
  private maxHits: number;
  private hitEnemies = new Set<Enemy>();

  constructor(scene: Phaser.Scene, x: number, y: number, target: Enemy, damage: number, color: number, basePierce: number, modifiers?: Partial<AttackModifiers>) {
    super(scene, 'PierceAttack', damage, modifiers);
    // Total pass-throughs = basePierce + bonusPierce (guard against bad data).
    this.maxHits = Math.max(1, basePierce + this.modifiers.bonusPierce);
    this.visual = scene.add.circle(x, y, 6, color);

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
  }

  update(_time: number, delta: number) {
    if (this.isDead) return;
    const dt = delta / 1000;
    this.visual.x += this.vx * dt;
    this.visual.y += this.vy * dt;

    const enemies = (this.scene as any).enemies as Enemy[];
    if (enemies) {
      for (const enemy of enemies) {
        if (!enemy.isDead && !this.hitEnemies.has(enemy)) {
          const dx = enemy.x - this.visual.x;
          const dy = enemy.y - this.visual.y;
          const collisionRadius = 20;
          if (dx * dx + dy * dy < collisionRadius * collisionRadius) {
            enemy.takeDamage(this.totalDamage);
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
    if (this.visual.x > WORLD_WIDTH + 100 || this.visual.x < -100 || this.visual.y > 1500 || this.visual.y < -100) {
      this.die();
    }
  }

  private die() {
    this.isDead = true;
    this.visual.destroy();
    this.destroy();
  }
}

export class MeleeCleaveAttack extends Attack {
  private visual: Phaser.GameObjects.Arc;
  private lifeTimeMs = 150;
  private ageMs = 0;
  private maxRadius: number;

  constructor(scene: Phaser.Scene, x: number, y: number, target: Enemy, damage: number, range: number, color: number, modifiers?: Partial<AttackModifiers>) {
    super(scene, 'MeleeCleaveAttack', damage, modifiers);
    this.maxRadius = range + this.modifiers.bonusRadius;
    const dx = target.x - x;
    const dy = target.y - y;
    const angleRad = Math.atan2(dy, dx);
    const angleDeg = Phaser.Math.RadToDeg(angleRad);
    // Start small and expand
    this.visual = scene.add.arc(x, y, 10, angleDeg - 45, angleDeg + 45, false, color, 0.8);
    
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
    const progress = Math.min(1, this.ageMs / this.lifeTimeMs);
    this.visual.setRadius(10 + (this.maxRadius - 10) * progress);
    this.visual.setAlpha(0.8 * (1 - progress));
    if (this.ageMs >= this.lifeTimeMs) {
      this.isDead = true;
      this.visual.destroy();
      this.destroy();
    }
  }
}

export class VortexAttack extends Attack {
  private visual: Phaser.GameObjects.Arc;
  private lifeTimeMs = 3000;
  private ageMs = 0;
  private tickRateMs = 500;
  private timeSinceLastTick = 0;
  
  constructor(scene: Phaser.Scene, _x: number, _y: number, target: Enemy, damage: number, color: number, modifiers?: Partial<AttackModifiers>) {
    super(scene, 'VortexAttack', damage, modifiers);
    const radius = 100 + this.modifiers.bonusRadius;
    // Spawn at target location so it traps enemies there
    this.visual = scene.add.circle(target.x, target.y, radius, color, 0.3);
  }
  
  update(_time: number, delta: number) {
    if (this.isDead) return;
    this.ageMs += delta;
    this.timeSinceLastTick += delta;
    
    this.visual.setAlpha(0.3 + 0.1 * Math.sin(this.ageMs / 100));
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
      this.destroy();
    }
  }
}

export class BoomerangAttack extends Attack {
  private speed = 400;
  private visual: Phaser.GameObjects.Arc;
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
    this.visual = scene.add.circle(hero.x, hero.y, 8 + this.modifiers.bonusRadius, color);
    
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
    
    const enemies = (this.scene as any).enemies as Enemy[];
    if (enemies) {
      for (const enemy of enemies) {
        if (enemy.isDead) continue;
        const hitSet = this.flightState === 'outward' ? this.hitEnemiesOutward : this.hitEnemiesReturning;
        if (!hitSet.has(enemy)) {
          const edx = enemy.x - this.visual.x;
          const edy = enemy.y - this.visual.y;
          const collisionRadius = 20 + this.modifiers.bonusRadius;
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
    
    while (currentTarget && jumps < maxJumps) {
      currentTarget.takeDamage(this.totalDamage);
      hitEnemies.add(currentTarget);
      
      const line = scene.add.line(0, 0, currentX, currentY, currentTarget.x, currentTarget.y, color).setOrigin(0, 0);
      line.setLineWidth(3);
      this.lines.push(line);
      
      currentX = currentTarget.x;
      currentY = currentTarget.y;
      jumps++;
      
      let nextTarget: Enemy | null = null;
      let minDist = 150 * 150;
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
    
    this.visual = scene.add.line(0, 0, startX, startY, endX, endY, color).setOrigin(0, 0);
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
    this.visual.setAlpha(1 - this.ageMs / this.lifeTimeMs);
    if (this.ageMs >= this.lifeTimeMs) {
      this.isDead = true;
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
  
  constructor(scene: Phaser.Scene, startX: number, startY: number, target: Enemy, damage: number, color: number, modifiers?: Partial<AttackModifiers>) {
    super(scene, 'LobbedAttack', damage, modifiers);
    this.startX = startX;
    this.startY = startY;
    this.targetX = target.x;
    this.targetY = target.y;
    
    this.visual = scene.add.circle(startX, startY, 6, color);
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
    
    const flash = this.scene.add.circle(this.targetX, this.targetY, radius, 0xffaa00, 0.5);
    this.scene.tweens.add({
      targets: flash,
      alpha: 0,
      duration: 200,
      onComplete: () => flash.destroy()
    });
    
    this.isDead = true;
    this.visual.destroy();
    this.destroy();
  }
}

export class LinearWaveAttack extends Attack {
  private speed = 300;
  private maxTravelPx = 900;
  private startX: number;
  private visual: Phaser.GameObjects.Rectangle;
  private hitEnemies = new Set<Enemy>();

  constructor(scene: Phaser.Scene, x: number, y: number, damage: number, color: number, modifiers?: Partial<AttackModifiers>) {
    super(scene, 'LinearWaveAttack', damage, modifiers);
    const waveWidth = 40;
    const waveHeight = 150 + this.modifiers.bonusRadius * 2;
    this.startX = x;
    this.visual = scene.add.rectangle(x, y, waveWidth, waveHeight, color, 0.6);
  }
  
  update(_time: number, delta: number) {
    if (this.isDead) return;
    this.visual.x += this.speed * (delta / 1000);
    
    const enemies = (this.scene as any).enemies as Enemy[];
    if (enemies) {
      for (const enemy of enemies) {
        if (!enemy.isDead && !this.hitEnemies.has(enemy)) {
          if (Math.abs(enemy.x - this.visual.x) < this.visual.width / 2 + 15 &&
              Math.abs(enemy.y - this.visual.y) < this.visual.height / 2 + 15) {
            enemy.takeDamage(this.totalDamage);
            this.hitEnemies.add(enemy);
          }
        }
      }
    }
    
    if (this.visual.x - this.startX > this.maxTravelPx) {
      this.isDead = true;
      this.visual.destroy();
      this.destroy();
    }
  }
}

export class TrapAttack extends Attack {
  private visual: Phaser.GameObjects.Arc;
  
  constructor(scene: Phaser.Scene, _x: number, _y: number, target: Enemy, damage: number, color: number, modifiers?: Partial<AttackModifiers>) {
    super(scene, 'TrapAttack', damage, modifiers);
    const trapX = target.x - 50;
    const trapY = target.y;
    this.visual = scene.add.circle(trapX, trapY, 10, color, 0.4);
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
    
    this.isDead = true;
    this.visual.destroy();
    this.destroy();
  }
}
