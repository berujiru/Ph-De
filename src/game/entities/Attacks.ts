import Phaser from 'phaser';
import type { Enemy } from './Enemy';
import { Summon } from './Summon';
import { GAME_WIDTH, WORLD_HEIGHT } from '../data/level';
import { MotionTrail } from './fx/MotionTrail';
import { spawnHitSpark } from './fx/ImpactFx';
import { spawnShockwaveRing } from './fx/ShockwaveRing';
import { AreaOverlay } from './fx/AreaOverlay';
import { LaneWave } from './fx/LaneWave';
import { AttackSprite, popAttackIcon } from './fx/AttackSprite';

/**
 * Per-hero attack art + resolved damage-type tint, passed in by the spawner
 * (GameSceneSpawners resolves DAMAGE_TYPE_COLORS[damageType] and the hero's
 * attackArt registry key). Basic-attack classes render with this instead of
 * hard-coded procedural shapes.
 */
export interface AttackVisual {
  artKey: string;
  tint: number;
  /** In-flight sprite length px (resolveAttackSize); 0 for styles that size by gameplay. */
  sizePx: number;
}

export interface AttackModifiers {
  bonusDamage: number;
  bonusPierce: number;
  bonusRadius: number;
  bonusChain: number;
  bonusProjectiles?: number;
  onHitAilment?: { type: string, duration: number };
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
  private speed: number;
  private vx = 0;
  private vy = 0;
  private visual: AttackSprite;
  private trail: MotionTrail;
  private baseLength: number;
  private hitCount = 0;
  private maxHits: number;
  private hitEnemies = new Set<Enemy>();

  constructor(scene: Phaser.Scene, x: number, y: number, target: Enemy, damage: number, visual: AttackVisual, speed: number, modifiers?: Partial<AttackModifiers>, damageType: string = 'Physical') {
    super(scene, 'ProjectileAttack', damage, modifiers, damageType);
    this.speed = speed;
    this.target = target;
    this.maxHits = 1 + this.modifiers.bonusPierce;
    this.trail = new MotionTrail(scene, visual.tint);
    this.baseLength = visual.sizePx;
    this.visual = new AttackSprite(scene, { x, y, artKey: visual.artKey, tint: visual.tint, lengthPx: this.baseLength });
    const dx = target.x - x;
    const dy = target.y - y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > 0) {
      this.vx = (dx / dist) * this.speed;
      this.vy = (dy / dist) * this.speed;
    }
    this.visual.pointAlong(this.vx, this.vy);
  }

  public upgrade(newMods: Partial<AttackModifiers>) {
    super.upgrade(newMods);
    this.maxHits = 1 + this.modifiers.bonusPierce;
    if (newMods.bonusRadius) {
      this.visual.setLength(this.baseLength + this.modifiers.bonusRadius * 2);
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
    this.visual.setPosition(this.visual.x + this.vx * dt, this.visual.y + this.vy * dt);
    this.visual.pointAlong(this.vx, this.vy);
    this.trail.update(this.visual.x, this.visual.y, this.vx, this.vy);

    const summons = (this.scene as any).summons as any[];
    if (summons) {
      for (const summon of summons) {
        if (summon.isEnemyTeam && !summon.isDead && !this.hitEnemies.has(summon)) {
          const dx = summon.x - this.visual.x;
          const dy = summon.y - this.visual.y;
          const collisionRadius = 50 + this.modifiers.bonusRadius;
          if (dx * dx + dy * dy < collisionRadius * collisionRadius) {
            summon.takeDamage(this.totalDamage);
            this.hitEnemies.add(summon);
            this.hitCount++;
            if (this.hitCount >= this.maxHits) {
              this.die();
              return;
            }
          }
        }
      }
    }

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
  private speed: number;
  private vx = 0;
  private vy = 0;
  private visual: AttackSprite;
  private hitCount = 0;
  private maxHits: number;
  private hitEnemies = new Set<any>();

  constructor(scene: Phaser.Scene, x: number, y: number, target: Enemy | { x: number, y: number }, damage: number, visual: AttackVisual, speed: number, basePierce: number, modifiers?: Partial<AttackModifiers>, damageType: string = 'Physical') {
    super(scene, 'PierceAttack', damage, modifiers, damageType);
    this.speed = speed;
    // Total pass-throughs = basePierce + bonusPierce (guard against bad data).
    this.maxHits = Math.max(1, basePierce + this.modifiers.bonusPierce);
    // One long oriented lance so pierce reads as a spear, not a dot.
    this.visual = new AttackSprite(scene, { x, y, artKey: visual.artKey, tint: visual.tint, lengthPx: visual.sizePx });

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
    this.visual.pointAlong(this.vx, this.vy);
  }

  update(_time: number, delta: number) {
    if (this.isDead) return;
    const dt = delta / 1000;
    this.visual.setPosition(this.visual.x + this.vx * dt, this.visual.y + this.vy * dt);

    const nx = -this.vy;
    const ny = this.vx;
    const len = Math.sqrt(nx * nx + ny * ny) || 1;

    const summons = (this.scene as any).summons as any[];
    if (summons) {
      for (const summon of summons) {
        if (summon.isEnemyTeam && !summon.isDead && !this.hitEnemies.has(summon)) {
          const dx = summon.x - this.visual.x;
          const dy = summon.y - this.visual.y;
          const cross = Math.abs(dx * (ny / len) - dy * (nx / len));
          if (cross < 40 + this.modifiers.bonusRadius) {
            summon.takeDamage(this.totalDamage);
            this.hitEnemies.add(summon);
            this.hitCount++;
            if (this.hitCount >= this.maxHits) {
              this.die();
              return;
            }
          }
        }
      }
    }

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
    this.visual.destroy();
    this.destroy();
  }
}

// Alternate melee swing direction each cleave so back-to-back swings read as
// combo strokes instead of a stamped loop.
let cleaveSwingFlip = false;

export class MeleeCleaveAttack extends Attack {
  private lifeTimeMs = 320;
  private ageMs = 0;
  private maxRadius: number;
  // Afterimage trail: fading snapshots of the swipe left behind as it sweeps.
  // Spawned on a fixed cadence (not per-frame — see MotionTrail's perf notes),
  // ~8 ghosts over the 280ms sweep. Each ghost's fade tween self-destroys, so
  // early attack death needs no cleanup pass.
  private swipe: AttackSprite;
  private swipeTint: number;
  private ghostTimerMs = 0;
  private static readonly GHOST_INTERVAL_MS = 35;

  constructor(scene: Phaser.Scene, x: number, y: number, target: Enemy, damage: number, range: number, visual: AttackVisual, modifiers?: Partial<AttackModifiers>, damageType: string = 'Physical') {
    super(scene, 'MeleeCleaveAttack', damage, modifiers, damageType);
    this.maxRadius = range + this.modifiers.bonusRadius;
    const dx = target.x - x;
    const dy = target.y - y;
    const angleRad = Math.atan2(dy, dx);

    // Weapon swing: the sprite is rooted at the hero and SWEEPS through the
    // ±45° damage arc like a wiper (matching the hit test below), alternating
    // direction per swing. Raw radians are safe — up-lane aim never crosses ±π.
    cleaveSwingFlip = !cleaveSwingFlip;
    const dir = cleaveSwingFlip ? 1 : -1;
    const swipe = new AttackSprite(scene, { x, y, artKey: visual.artKey, tint: visual.tint, lengthPx: this.maxRadius, alpha: 0.9 });
    this.swipe = swipe;
    this.swipeTint = visual.tint;
    swipe.image.setOrigin(0, 0.5); // pivot at the hero's hands
    const fullScale = swipe.image.scale;
    swipe.image.setScale(fullScale * 0.85);
    swipe.image.setRotation(angleRad - dir * Math.PI / 4);
    scene.tweens.add({
      targets: swipe.image,
      rotation: angleRad + dir * Math.PI / 4,
      scale: fullScale,
      duration: 280,
      ease: 'Cubic.easeOut',
    });
    scene.tweens.add({
      targets: swipe.image,
      alpha: 0,
      delay: 180,
      duration: 120,
      onComplete: () => swipe.destroy(),
    });

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
              enemy.takeDamage(this.totalDamage, this.damageType);
            }
          }
        }
      }
    }
  }

  update(_time: number, delta: number) {
    if (this.isDead) return;
    this.ageMs += delta;

    // Trail: drop a ghost of the swipe at its current pose every ~35ms while
    // the swipe is still alive (its alpha tween destroys it before we do).
    if (this.swipe.image.active) {
      this.ghostTimerMs += delta;
      while (this.ghostTimerMs >= MeleeCleaveAttack.GHOST_INTERVAL_MS) {
        this.ghostTimerMs -= MeleeCleaveAttack.GHOST_INTERVAL_MS;
        this.spawnGhost();
      }
    }

    if (this.ageMs >= this.lifeTimeMs) {
      this.isDead = true;
      this.destroy();
    }
  }

  /** Fading copy of the swipe frozen at its current rotation/scale. */
  private spawnGhost() {
    const src = this.swipe.image;
    const ghost = this.scene.add.image(src.x, src.y, src.texture.key);
    ghost.setOrigin(0, 0.5);
    ghost.setRotation(src.rotation);
    ghost.setScale(src.scaleX, src.scaleY);
    ghost.setTint(this.swipeTint);
    ghost.setAlpha(0.3);
    ghost.setDepth(src.depth - 1); // read behind the live swipe
    this.scene.tweens.add({
      targets: ghost,
      alpha: 0,
      duration: 180,
      ease: 'Quad.easeOut',
      onComplete: () => ghost.destroy(),
    });
  }
}

export class VortexAttack extends Attack {
  // Two phases: the hero throws the net (tumbling flight sprite homing on the
  // target, cf. ProjectileAttack), then the vortex opens where it LANDS — so a
  // dodging enemy drags the trap with it. The 3000ms lifetime starts at landing.
  private phase: 'flight' | 'vortex' = 'flight';
  private flight: AttackSprite;
  private trail: MotionTrail;
  private target: Enemy | null;
  private speed: number;
  private destX: number;
  private destY: number;
  private visualCfg: AttackVisual;
  private overlay: AreaOverlay | null = null;
  private xPos = 0;
  private yPos = 0;
  private lifeTimeMs = 3000;
  private ageMs = 0;
  private tickRateMs = 500;
  private timeSinceLastTick = 0;
  // Vortex-style sizePx is 0 (the overlay sizes by gameplay radius), so the
  // thrown net gets its own in-flight length.
  private static readonly FLIGHT_LENGTH_PX = 64;

  constructor(scene: Phaser.Scene, x: number, y: number, target: Enemy, damage: number, visual: AttackVisual, speed: number, modifiers?: Partial<AttackModifiers>, damageType: string = 'Physical') {
    super(scene, 'VortexAttack', damage, modifiers, damageType);
    this.speed = speed;
    this.target = target;
    this.destX = target.x;
    this.destY = target.y;
    this.visualCfg = visual;
    this.trail = new MotionTrail(scene, visual.tint);
    // Thrown net tumbles as it flies (gentler than BoomerangAttack's whirl).
    this.flight = new AttackSprite(scene, {
      x, y, artKey: visual.artKey, tint: visual.tint,
      lengthPx: VortexAttack.FLIGHT_LENGTH_PX,
      spinDegPerSec: 450,
    });
  }

  update(_time: number, delta: number) {
    if (this.isDead) return;
    if (this.phase === 'flight') {
      this.updateFlight(delta);
      return;
    }
    this.ageMs += delta;
    this.timeSinceLastTick += delta;

    const radius = 100 + this.modifiers.bonusRadius;

    const enemies = (this.scene as any).enemies as Enemy[];
    if (enemies) {
      for (const enemy of enemies) {
        if (enemy.isDead) continue;
        const dx = this.xPos - enemy.x;
        const dy = this.yPos - enemy.y;
        const distSq = dx * dx + dy * dy;
        
        if (distSq <= radius * radius) {
          // Pull enemy (reduced force so it doesn't instantly snap them, acts like a mini gravity well)
          enemy.x += dx * 0.015;
          enemy.y += dy * 0.015;
          
          if (this.timeSinceLastTick >= this.tickRateMs) {
            enemy.takeDamage(this.totalDamage * 0.5, this.damageType);
            if (this.damageType === 'Water') {
              enemy.applyAilment('wet', 1, 4000);
            }
            if (this.modifiers.onHitAilment) {
              enemy.applyAilment(this.modifiers.onHitAilment.type, 1, this.modifiers.onHitAilment.duration);
            }
          }
        }
      }
    }
    
    if (this.timeSinceLastTick >= this.tickRateMs) {
      this.timeSinceLastTick -= this.tickRateMs;
    }

    if (this.ageMs >= this.lifeTimeMs) {
      this.isDead = true;
      this.overlay?.fadeOutAndDestroy(200);
      this.destroy();
    }
  }

  /** Home on the live target; if it dies mid-flight, finish at its last-known spot. */
  private updateFlight(delta: number) {
    if (this.target && this.target.isDead) this.target = null;
    if (this.target) {
      this.destX = this.target.x;
      this.destY = this.target.y;
    }
    const dx = this.destX - this.flight.x;
    const dy = this.destY - this.flight.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const step = this.speed * (delta / 1000);
    // Arrive when within touchdown range — or when this frame's step would
    // overshoot it (large delta), so the net never orbits its landing point.
    if (dist <= Math.max(12, step)) {
      this.land();
      return;
    }
    this.flight.setPosition(this.flight.x + (dx / dist) * step, this.flight.y + (dy / dist) * step);
    this.flight.update(delta); // advance the tumble
    this.trail.update(this.flight.x, this.flight.y, (dx / dist) * this.speed, (dy / dist) * this.speed);
  }

  /** Touchdown: swap the flight sprite for the vortex overlay at the landing point. */
  private land() {
    this.phase = 'vortex';
    this.trail.destroy();
    this.flight.destroy();
    this.xPos = this.destX;
    this.yPos = this.destY;
    const radius = 100 + this.modifiers.bonusRadius;
    this.overlay = new AreaOverlay(this.scene, {
      x: this.xPos, y: this.yPos, radius,
      fillColor: this.visualCfg.tint, fillAlpha: 0.25,
      strokeColor: this.visualCfg.tint, strokeWidth: 3, strokeAlpha: 0.9,
      svgKey: this.visualCfg.artKey, svgTint: this.visualCfg.tint,
      svgScale: (radius * 2) / 128, // art is authored at 128px, cover the disc
      svgSpin: 90,
      enter: { durationMs: 200 },
    });
  }
}

export class BoomerangAttack extends Attack {
  private speed: number;
  private visual: AttackSprite;
  private trail: MotionTrail;
  private flightState: 'outward' | 'returning' = 'outward';
  private startX: number;
  private startY: number;
  private targetX: number;
  private targetY: number;
  private hero: import('./Hero').Hero;
  private hitEnemiesOutward = new Set<Enemy>();
  private hitEnemiesReturning = new Set<Enemy>();

  constructor(scene: Phaser.Scene, hero: import('./Hero').Hero, target: Enemy, damage: number, visual: AttackVisual, speed: number, modifiers?: Partial<AttackModifiers>, damageType: string = 'Physical') {
    super(scene, 'BoomerangAttack', damage, modifiers, damageType);
    this.speed = speed;
    this.hero = hero;
    this.trail = new MotionTrail(scene, visual.tint);
    // Tumbling sprite (spin rate ≈ the old 18 rad/s crossbar).
    this.visual = new AttackSprite(scene, {
      x: hero.x, y: hero.y,
      artKey: visual.artKey, tint: visual.tint,
      lengthPx: visual.sizePx + this.modifiers.bonusRadius * 2,
      spinDegPerSec: 1030,
    });

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
      this.visual.setPosition(this.visual.x + (dx / dist) * this.speed * dt, this.visual.y + (dy / dist) * this.speed * dt);
    }

    // Tumble the art and stream a trail behind the flight.
    this.visual.update(delta);
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
            enemy.takeDamage(this.totalDamage, this.damageType);
            hitSet.add(enemy);
          }
        }
      }
    }
  }
  
  private die() {
    this.isDead = true;
    this.trail.destroy();
    this.visual.destroy();
    this.destroy();
  }
}

/** How far a chain bolt can jump between targets (follows the range ladder). */
const CHAIN_BOUNCE_RANGE_PX = 420;

export class ChainAttack extends Attack {
  private ageMs = 0;
  private lines: Phaser.GameObjects.Line[] = [];

  constructor(scene: Phaser.Scene, startX: number, startY: number, target: Enemy, damage: number, visual: AttackVisual, baseChain: number, modifiers?: Partial<AttackModifiers>, damageType: string = 'Physical') {
    super(scene, 'ChainAttack', damage, modifiers, damageType);

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
      currentTarget.takeDamage(currentDamage, this.damageType);
      hitEnemies.add(currentTarget);

      // Crackling multi-segment arc between the two points, with a wider soft
      // glow underneath and a bright white core over it. The per-hero art pops
      // at each strike point (procedural lightning stays — it reads better in
      // motion than any static texture).
      this.drawCrackle(scene, currentX, currentY, currentTarget.x, currentTarget.y, visual.tint, 14, 0.4);
      this.drawCrackle(scene, currentX, currentY, currentTarget.x, currentTarget.y, 0xffffff, 5, 1);
      popAttackIcon(scene, currentTarget.x, currentTarget.y, visual.artKey, visual.tint, 48, 150);

      currentX = currentTarget.x;
      currentY = currentTarget.y;
      jumps++;
      
      currentDamage = Math.max(1, currentDamage * 0.8); // 20% damage drop per bounce
      
      let nextTarget: Enemy | null = null;
      let minDist = CHAIN_BOUNCE_RANGE_PX * CHAIN_BOUNCE_RANGE_PX;
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
  constructor(scene: Phaser.Scene, _x: number, _y: number, target: Enemy, damage: number, visual: AttackVisual, modifiers?: Partial<AttackModifiers>) {
    super(scene, 'SummonAttack', damage, modifiers);

    // Total damage stat is repurposed as maxHP for summons
    const summonHp = this.totalDamage * 10;
    const summon = new Summon(scene, target.x, target.y, summonHp, visual.tint, { artKey: visual.artKey, tint: visual.tint });
    
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

  constructor(scene: Phaser.Scene, startX: number, startY: number, target: Enemy, damage: number, visual: AttackVisual, range: number, modifiers?: Partial<AttackModifiers>, damageType: string = 'Physical') {
    super(scene, 'BeamAttack', damage, modifiers, damageType);
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
    // The beam is a 150ms flash — stroke + per-hero icons reads better than a
    // stretched texture, so the art pops at the muzzle and at each enemy hit.
    this.glow = scene.add.line(0, 0, startX, startY, endX, endY, visual.tint, 0.35).setOrigin(0, 0);
    this.glow.setLineWidth(12 + this.modifiers.bonusRadius * 2);
    this.visual = scene.add.line(0, 0, startX, startY, endX, endY, 0xffffff).setOrigin(0, 0);
    this.visual.setLineWidth(4 + this.modifiers.bonusRadius);
    popAttackIcon(scene, startX, startY, visual.artKey, visual.tint, 40, 150);

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
            enemy.takeDamage(this.totalDamage, this.damageType);
            popAttackIcon(scene, enemy.x, enemy.y, visual.artKey, visual.tint, 36, 150);
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
  private travelTimeMs: number;
  private visual: AttackSprite;
  private shadow: Phaser.GameObjects.Ellipse;

  constructor(scene: Phaser.Scene, startX: number, startY: number, target: Enemy, damage: number, visual: AttackVisual, speed: number, modifiers?: Partial<AttackModifiers>, damageType: string = 'Physical') {
    super(scene, 'LobbedAttack', damage, modifiers, damageType);
    this.startX = startX;
    this.startY = startY;
    this.targetX = target.x;
    this.targetY = target.y;
    // Time-based arc: convert flight speed to travel time over the snapshot
    // distance, clamped so close lobs still arc and long ones still land.
    const dist = Math.sqrt((target.x - startX) ** 2 + (target.y - startY) ** 2);
    this.travelTimeMs = Phaser.Math.Clamp((dist / speed) * 1000, 300, 1100);

    // Ground shadow that tracks the landing spot — sells the arc height.
    this.shadow = scene.add.ellipse(startX, startY, 60, 20, 0x000000, 0.35);
    // Slow tumble so the thrown object reads as airborne.
    this.visual = new AttackSprite(scene, { x: startX, y: startY, artKey: visual.artKey, tint: visual.tint, lengthPx: visual.sizePx, spinDegPerSec: 240 });
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

      this.visual.setPosition(baseX, baseY - arc);
      // Scale up mid-arc so the throw reads as gaining height; tumble as it flies.
      this.visual.flightScale(1 + Math.sin(this.progress * Math.PI) * 0.35);
      this.visual.update(delta);
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
            enemy.takeDamage(this.totalDamage, this.damageType);
          }
        }
      }
    }

    // Crater flash: a filled pop plus an expanding shockwave ring and sparks.
    spawnShockwaveRing(this.scene, {
      x: this.targetX, y: this.targetY,
      color: 0xffaa00,
      startRadius: radius, endRadius: radius,
      fillAlpha: 0.5, strokeWidth: 0,
      durationMs: 200, ease: 'Linear',
    });
    spawnShockwaveRing(this.scene, {
      x: this.targetX, y: this.targetY,
      color: 0xffaa00,
      startRadius: radius * 0.5, endRadius: radius,
      strokeWidth: 3, strokeColor: 0xffd27f, strokeAlpha: 0.9,
      durationMs: 260,
    });
    spawnHitSpark(this.scene, this.targetX, this.targetY, 0xffd27f);

    this.isDead = true;
    this.shadow.destroy();
    this.visual.destroy();
    this.destroy();
  }
}

export class LinearWaveAttack extends Attack {
  private speed: number;
  private maxTravelPx: number;
  private startY: number;
  private wave: LaneWave;
  private hitEnemies = new Set<Enemy>();

  constructor(scene: Phaser.Scene, x: number, y: number, damage: number, visual: AttackVisual, speed: number, maxTravelPx: number, modifiers?: Partial<AttackModifiers>, damageType: string = 'Physical') {
    super(scene, 'LinearWaveAttack', damage, modifiers, damageType);
    this.speed = speed;
    this.maxTravelPx = maxTravelPx;
    this.startY = y;

    this.wave = new LaneWave(scene, {
      x, y,
      width: 150 + this.modifiers.bonusRadius * 2,
      height: 40,
      color: visual.tint,
      svgKey: visual.artKey,
      svgTint: visual.tint,
      bodyAlpha: 0.9,
      pulse: { scaleX: 1.15, durationMs: 200 },
      particles: { minRadius: 2, maxRadius: 6, alpha: 0.6, fallPx: 30, durationMs: 500 },
    });
  }

  update(_time: number, delta: number) {
    if (this.isDead) return;

    this.wave.setY(this.wave.y - this.speed * (delta / 1000));
    this.wave.emitTrailParticle();

    const enemies = (this.scene as any).enemies as Enemy[];
    if (enemies) {
      for (const enemy of enemies) {
        if (!enemy.isDead && !this.hitEnemies.has(enemy)) {
          // Expanded hit box to account for visual scale pulse
          if (Math.abs(enemy.x - this.wave.x) < (this.wave.width * 1.15) / 2 + 15 &&
              Math.abs(enemy.y - this.wave.y) < this.wave.height / 2 + 15) {
            enemy.takeDamage(this.totalDamage, this.damageType);
            this.hitEnemies.add(enemy);
          }
        }
      }
    }

    if (this.startY - this.wave.y > this.maxTravelPx) {
      this.isDead = true;
      this.wave.destroy();
      this.destroy();
    }
  }
}

export class TrapAttack extends Attack {
  private visual: AttackSprite;
  private telegraph: Phaser.GameObjects.Arc;

  constructor(scene: Phaser.Scene, _x: number, _y: number, target: Enemy, damage: number, visual: AttackVisual, modifiers?: Partial<AttackModifiers>, damageType: string = 'Physical') {
    super(scene, 'TrapAttack', damage, modifiers, damageType);
    const trapX = target.x - 50;
    const trapY = target.y;
    // Small static armed-trap marker in the hero's art.
    this.visual = new AttackSprite(scene, { x: trapX, y: trapY, artKey: visual.artKey, tint: visual.tint, lengthPx: visual.sizePx });
    // A pulsing hazard ring telegraphs the armed trap's footprint.
    const explosionRadius = 80 + this.modifiers.bonusRadius;
    this.telegraph = scene.add.circle(trapX, trapY, explosionRadius, visual.tint, 0);
    this.telegraph.setStrokeStyle(2, visual.tint, 0.5);
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
            enemy.takeDamage(this.totalDamage, this.damageType);
          }
        }
      }
    }
    
    spawnShockwaveRing(this.scene, {
      x: this.visual.x, y: this.visual.y,
      color: 0xff0000,
      startRadius: radius, endRadius: radius,
      fillAlpha: 0.5, strokeWidth: 0,
      durationMs: 200, ease: 'Linear',
    });
    spawnShockwaveRing(this.scene, {
      x: this.visual.x, y: this.visual.y,
      color: 0xff0000,
      startRadius: radius * 0.5, endRadius: radius,
      strokeWidth: 3, strokeColor: 0xfca5a5, strokeAlpha: 0.9,
      durationMs: 260,
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
  private overlay: AreaOverlay;

  constructor(scene: Phaser.Scene, x: number, y: number, radius: number, duration: number, damage: number) {
    super(scene, 'AoeRootFieldAttack', damage);
    this.xPos = x;
    this.yPos = y;
    this.radius = radius;
    this.durationMs = duration;

    this.overlay = new AreaOverlay(scene, {
      x, y, radius,
      strokeColor: 0xeab308, strokeWidth: 6, strokeAlpha: 0.8,
      innerRings: { fractions: [0.4, 0.8], color: 0xfef08a, width: 2, alpha: 0.6 },
      pulse: { scale: 1.15, alphaTo: 0.3, durationMs: 800 },
      centerIcon: { text: '⚡', fontSize: '42px' },
    });
  }

  update(_time: number, delta: number) {
    if (this.isDead) return;
    this.ageMs += delta;
    if (this.ageMs >= this.durationMs) {
      this.isDead = true;
      this.overlay.destroy();
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

export class AoeFirePatchAttack extends Attack {
  private durationMs: number;
  private ageMs = 0;
  private lastTickMs = 0;
  private radius: number;
  private xPos: number;
  private yPos: number;
  private overlay: AreaOverlay;

  constructor(scene: Phaser.Scene, x: number, y: number, radius: number, duration: number, damage: number) {
    super(scene, 'AoeFirePatchAttack', damage);
    this.xPos = x;
    this.yPos = y;
    this.radius = radius;
    this.durationMs = duration;

    // Very subtle border, mostly a glowing puddle
    this.overlay = new AreaOverlay(scene, {
      x, y, radius,
      fillColor: 0xff4500, fillAlpha: 0.25,
      strokeColor: 0xffa500, strokeWidth: 2, strokeAlpha: 0.15,
      pulse: { scale: 1.05, alphaTo: 0.6, durationMs: 1000 },
    });
  }

  update(_time: number, delta: number) {
    if (this.isDead) return;
    this.ageMs += delta;
    this.lastTickMs += delta;

    if (this.ageMs >= this.durationMs) {
      this.isDead = true;
      this.overlay.destroy();
      this.destroy();
      return;
    }

    // Apply DoT every 1 second
    if (this.lastTickMs >= 1000) {
      this.lastTickMs -= 1000;
      const enemies = (this.scene as any).enemies as Enemy[];
      if (enemies) {
        for (const enemy of enemies) {
          if (!enemy.isDead) {
            const dx = enemy.x - this.xPos;
            const dy = enemy.y - this.yPos;
            if (dx * dx + dy * dy <= this.radius * this.radius) {
              enemy.applyAilment('burn', 1, 1000);
              if (this.damage > 0) {
                enemy.takeDamage(this.damage);
              }
            }
          }
        }
      }
    }
  }
}

export class TornadoAttack extends Attack {
  private durationMs: number;
  private ageMs = 0;
  private tickMs = 0;
  private pullRadius: number;
  private speed: number;
  private xPos: number;
  private yPos: number;
  private overlay: AreaOverlay;

  constructor(scene: Phaser.Scene, x: number, y: number, damage: number, pullRadius: number, duration: number, speed: number) {
    super(scene, 'TornadoAttack', damage);
    this.xPos = x;
    this.yPos = y;
    this.pullRadius = pullRadius;
    this.durationMs = duration;
    this.speed = speed;

    this.overlay = new AreaOverlay(scene, {
      x, y,
      radius: pullRadius,
      svgKey: 'tornado',
      svgScale: Math.max(0.5, pullRadius / 50),
      svgSpin: 360,
      enter: { durationMs: 300 },
    });
  }

  update(_time: number, delta: number) {
    if (this.isDead) return;
    this.ageMs += delta;
    if (this.ageMs >= this.durationMs) {
      this.isDead = true;
      this.overlay.fadeOutAndDestroy(300, true);
      this.destroy();
      return;
    }

    const enemies = (this.scene as any).enemies as Enemy[];

    // Chase the nearest living enemy, smoothly per frame.
    let nearest: Enemy | null = null;
    let minDistSq = Infinity;
    if (enemies) {
      for (const e of enemies) {
        if (e.isDead) continue;
        const dx = e.x - this.xPos;
        const dy = e.y - this.yPos;
        const distSq = dx * dx + dy * dy;
        if (distSq < minDistSq) {
          minDistSq = distSq;
          nearest = e;
        }
      }
    }
    if (nearest) {
      const angle = Math.atan2(nearest.y - this.yPos, nearest.x - this.xPos);
      const step = this.speed * (delta / 1000);
      this.xPos += Math.cos(angle) * step;
      this.yPos += Math.sin(angle) * step;
      this.overlay.setPosition(this.xPos, this.yPos);
    }

    // Damage + pull tick every 100ms (damage is per second, so 1/10 per tick).
    this.tickMs += delta;
    if (this.tickMs >= 100) {
      this.tickMs -= 100;
      if (enemies) {
        const radiusSq = this.pullRadius * this.pullRadius;
        for (const e of enemies) {
          if (e.isDead) continue;
          const dx = e.x - this.xPos;
          const dy = e.y - this.yPos;
          if (dx * dx + dy * dy <= radiusSq) {
            e.takeDamage(this.damage / 10);
            if (!e.isDead) {
              const pullAngle = Math.atan2(this.yPos - e.y, this.xPos - e.x);
              e.x += Math.cos(pullAngle) * 5;
              e.y += Math.sin(pullAngle) * 5;
            }
          }
        }
      }
    }
  }
}

export class TreeOfLifeFieldAttack extends Attack {
  private durationMs: number;
  private ageMs = 0;
  private tickMs = 0;
  private radius: number;
  private xPos: number;
  private yPos: number;
  private overlay: AreaOverlay;

  constructor(scene: Phaser.Scene, x: number, y: number, radius: number, duration: number, damage: number) {
    super(scene, 'TreeOfLifeFieldAttack', damage);
    this.xPos = x;
    this.yPos = y;
    this.radius = radius;
    this.durationMs = duration;

    this.overlay = new AreaOverlay(scene, {
      x, y, radius,
      fillColor: 0xfef08a, fillAlpha: 0.15,
      strokeColor: 0xeab308, strokeWidth: 2, strokeAlpha: 0.5,
      svgKey: 'tree_of_life',
      svgOriginY: 1,
      svgPulse: true,
      enter: { durationMs: 500, ease: 'Back.out', fromScale: 0.5 },
    });
  }

  update(_time: number, delta: number) {
    if (this.isDead) return;
    this.ageMs += delta;
    if (this.ageMs >= this.durationMs) {
      this.isDead = true;
      this.overlay.fadeOutAndDestroy(1000);
      this.destroy();
      return;
    }

    // Root + damage pulse every 2 seconds.
    this.tickMs += delta;
    if (this.tickMs >= 2000) {
      this.tickMs -= 2000;
      this.overlay.pulseOnce();

      const enemies = (this.scene as any).enemies as Enemy[];
      if (enemies) {
        const radiusSq = this.radius * this.radius;
        for (const e of enemies) {
          if (e.isDead) continue;
          const dx = e.x - this.xPos;
          const dy = e.y - this.yPos;
          if (dx * dx + dy * dy <= radiusSq) {
            e.applyAilment('root', 100, 1000);
            e.takeDamage(this.damage);
            const txt = this.scene.add.text(e.x, e.y - 30, 'ROOTED!', { color: '#22c55e', fontStyle: 'bold' }).setOrigin(0.5);
            this.scene.tweens.add({ targets: txt, y: e.y - 60, alpha: 0, duration: 1000, onComplete: () => txt.destroy() });
          }
        }
      }
    }
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
  private wave: LaneWave;

  constructor(scene: Phaser.Scene, y: number, damage: number, numWaves: number, knockback: number) {
    super(scene, 'FlushWaveAttack', damage);
    this.knockbackDist = knockback;

    this.wave = new LaneWave(scene, {
      x: scene.scale.width / 2,
      y,
      width: scene.scale.width + 200, // Massive width to cover screen
      height: 80 + (numWaves * 15),   // Scale height based on drops
      color: 0x38bdf8,                // Plumber's color (water)
      bodyAlpha: 0.65,
      edgeHeight: 12,
      pulse: { scaleX: 1.05, durationMs: 300 },
      particles: { minRadius: 4, maxRadius: 12, alpha: 0.5, fallPx: 40, durationMs: 700, depth: 29 },
      depth: { body: 30, edge: 31 },
    });
  }

  update(_time: number, delta: number) {
    if (this.isDead) return;

    this.wave.setY(this.wave.y - this.speed * (delta / 1000));

    // Fade out only at the very end of its travel
    const deathY = this.scene.cameras.main.scrollY - 200;
    const distToDeath = this.wave.y - deathY;
    const fadeRatio = distToDeath < 250 ? Math.max(0, distToDeath / 250) : 1;
    this.wave.setFade(fadeRatio);

    if (fadeRatio > 0.1) {
      this.wave.emitTrailParticle(fadeRatio);
    }

    if (this.wave.y < this.scene.cameras.main.scrollY - 200) {
      this.isDead = true;
      this.wave.destroy();
      this.destroy();
      return;
    }

    const enemies = (this.scene as any).enemies as Enemy[];
    if (enemies) {
      for (const enemy of enemies) {
        if (!enemy.isDead && !this.hitEnemies.has(enemy)) {
          const distY = Math.abs(enemy.y - this.wave.y);

          if (distY < this.wave.height / 2 + 30) {
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
