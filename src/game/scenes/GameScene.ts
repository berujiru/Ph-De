import Phaser from 'phaser';
import { Barrier } from '../entities/Barrier';
import { Hero } from '../entities/Hero';
import { Enemy } from '../entities/Enemy';
import { Summon } from '../entities/Summon';
import { Attack, ProjectileAttack, MeleeCleaveAttack, VortexAttack, BoomerangAttack, ChainAttack, SummonAttack, BeamAttack, LobbedAttack, LinearWaveAttack, TrapAttack } from '../entities/Attacks';
import { gameToUiEvents, uiToGameEvents, type GameStateSnapshot, type DropOption } from '../core/GameEvents';
import { ENEMY_DEFINITIONS, HERO_DEFINITIONS, BARRICADE_DEFAULTS, type HeroId } from '../data/balance';
import { GAME_WIDTH, GAME_HEIGHT } from '../data/level';

export class GameScene extends Phaser.Scene {
  private barrier!: Barrier;
  private enemies: Enemy[] = [];
  private heroes: Hero[] = [];
  private attacks: Attack[] = [];
  public summons: Summon[] = [];
  
  private voicesCount = 0;
  private maxVoicesCount = 5; // Drops a hero when full
  
  private spawnTimer = 0;
  private waveActive = false;
  private currentWave = 1;
  private totalWaves = 3;
  private enemiesToSpawn = 5;
  private isPaused = false; // System pause (drops, etc)
  private gameSpeed = 1; // User speed control (0 = stop, 1 = normal, 2 = fast)
  private status: 'playing' | 'won' | 'lost' = 'playing';
  private lastSnapshot = '';
  private isSandbox = false;
  private sandboxRespawnTimer = 0;

  constructor() {
    super('GameScene');
  }

  preload() {
    // this.load.audio('sfx-btn-press', 'assets/sounds/btn-press.mp3');
    // this.load.audio('sfx-victory', 'assets/sounds/victory.mp3');
    // this.load.audio('sfx-defeat', 'assets/sounds/defeat.mp3');
    // this.load.audio('sfx-shoot', 'assets/sounds/shoot.mp3');
    // this.load.audio('sfx-enemy-hit', 'assets/sounds/enemy-hit.mp3');
    // this.load.audio('sfx-enemy-die', 'assets/sounds/enemy-die.mp3');
    // this.load.audio('sfx-barrier-hit', 'assets/sounds/barrier-hit.mp3');
    // this.load.audio('sfx-barrier-break', 'assets/sounds/barrier-break.mp3');
  }

  create(): void {
    this.buildGame();

    // Shared cleanup — called on both shutdown (scene.restart) and destroy (game.destroy)
    const cleanup = () => {
      unsubStart();
      unsubSelectDrop();
      unsubSetSpeed();
      unsubSurrender();
      unsubRestart();
      unsubDebugSpawn();
      unsubSpawnSandboxTarget();
      unsubPlaySound();
    };

    // UI event binding — every handler guards against a destroyed scene
    const unsubStart = uiToGameEvents.on('startWave', () => {
      if (!this.sys) return;
      this.waveActive = true;
    });

    const unsubSelectDrop = uiToGameEvents.on('selectDrop', ({ dropId }) => {
      if (!this.sys) return;
      this.applyDrop(dropId);
      this.isPaused = false;
      this.emitState(true);
    });

    const unsubSetSpeed = uiToGameEvents.on('setSpeed', ({ speed }) => {
      if (!this.sys) return;
      this.gameSpeed = speed;
      this.emitState(true);
    });

    const unsubSurrender = uiToGameEvents.on('surrender', () => {
      if (!this.sys) return;
      this.status = 'lost';
      this.emitState(true);
    });

    const unsubRestart = uiToGameEvents.on('restart', (data: any) => {
      if (!this.sys) return;
      this.isSandbox = data?.mode === 'sandbox';
      this.resetGame();
    });

    const unsubDebugSpawn = uiToGameEvents.on('debugSpawn', ({ heroId } = {}) => {
      if (!this.sys) return;
      
      // Clear existing heroes for clean testing
      this.heroes.forEach(h => h.destroy());
      this.heroes = [];

      if (heroId) {
        this.spawnHero(heroId as HeroId);
      } else {
        const availableIds = Object.keys(HERO_DEFINITIONS) as HeroId[];
        if (availableIds.length > 0) {
          const randomId = Phaser.Math.RND.pick(availableIds);
          this.spawnHero(randomId);
        }
      }
    });

    const unsubSpawnSandboxTarget = uiToGameEvents.on('spawnSandboxTarget', () => {
      this.spawnSandboxTarget();
    });

    const unsubPlaySound = uiToGameEvents.on('playSound', ({ key }) => {
      if (!this.sys) return;
      try { this.sound.play(key); } catch(e) {}
    });

    // Clean up on both shutdown (restart) AND destroy (game.destroy / React unmount)
    this.events.on('shutdown', cleanup);
    this.events.on('destroy', cleanup);
  }

  /** Tear down all game objects and rebuild from scratch, without
   *  touching Phaser's scene lifecycle (avoids null-sys crashes). */
  private resetGame(): void {
    // Destroy existing game objects
    for (const e of this.enemies) e.destroy();
    for (const h of this.heroes) h.destroy();
    for (const a of this.attacks) a.destroy();
    for (const s of this.summons) s.destroy();
    if (this.barrier) this.barrier.destroy();

    this.buildGame();
  }

  /** Create barrier + initial hero and reset all state counters. */
  private buildGame(): void {
    this.heroes = [];
    this.enemies = [];
    this.attacks = [];
    this.summons = [];
    this.voicesCount = 0;
    this.maxVoicesCount = 3;
    this.waveActive = false;
    this.currentWave = 1;
    this.totalWaves = 3;
    this.enemiesToSpawn = 5;
    this.isPaused = false;
    this.gameSpeed = 1;
    this.status = 'playing';
    this.spawnTimer = 2000;
    this.lastSnapshot = '';

    // Create the Barrier at x=120
    this.barrier = new Barrier(this, 120, GAME_HEIGHT / 2, BARRICADE_DEFAULTS.width, GAME_HEIGHT, BARRICADE_DEFAULTS.maxHp);

    // Initial fixed hero (Eden)
    this.spawnHero('eden');

    this.emitState(true);
  }

  update(_time: number, delta: number): void {
    if (this.status !== 'playing' || this.isPaused || this.gameSpeed === 0) return;

    // Apply time scaling
    delta *= this.gameSpeed;

    if (!this.waveActive && _time > 1000) {
      this.waveActive = true;
      this.emitState();
    }

    if (this.isSandbox) {
      if (this.enemies.length === 0) {
        this.sandboxRespawnTimer += delta;
        if (this.sandboxRespawnTimer > 2000) {
          this.spawnSandboxTarget();
          this.sandboxRespawnTimer = 0;
        }
      }
    } else if (this.waveActive) {
      if (this.enemiesToSpawn > 0) {
        this.spawnTimer -= delta;
        if (this.spawnTimer <= 0) {
          this.spawnEnemy();
          this.enemiesToSpawn--;
          this.spawnTimer = 2000; // spawn every 2s for prototype
        }
      } else if (this.enemies.length === 0) {
        if (this.currentWave < this.totalWaves) {
          this.currentWave++;
          this.enemiesToSpawn = this.currentWave * 5;
          this.spawnTimer = 3000; // wait 3s before next wave starts
        } else {
          if (this.status !== 'won') {
            try { this.sound.play('sfx-victory'); } catch (e) {}
          }
          this.status = 'won';
        }
      }
    }

    // Update entities
    for (const enemy of this.enemies) {
      enemy.update(delta, this.barrier, this.summons);
      if (enemy.isDead && enemy.hp <= 0) {
        // Was killed by hero, not by hitting barrier
        this.addVoices(1);
      }
    }
    
    this.enemies = this.enemies.filter(e => {
      // e.destroy() is now handled by Enemy.ts death animation
      return !e.isDead;
    });

    for (const hero of this.heroes) {
      hero.update(delta, this.enemies);
    }
    
    for (const atk of this.attacks) {
      atk.update(_time, delta);
    }
    
    this.attacks = this.attacks.filter(a => {
      // Attacks clean up their own visuals when they die.
      return !a.isDead;
    });

    this.summons = this.summons.filter(s => {
      return !s.isDead;
    });

    // Game over conditions
    if (this.barrier.isDead && !this.isSandbox) {
      if (this.status !== 'lost') {
        try { this.sound.play('sfx-defeat'); } catch (e) {}
      }
      this.status = 'lost';
    }

    this.emitState();
  }

  private spawnEnemy() {
    const y = Phaser.Math.Between(50, GAME_HEIGHT - 50);
    const enemy = new Enemy(this, GAME_WIDTH + 50, y, ENEMY_DEFINITIONS['grunt']);
    this.enemies.push(enemy);
  }

  public spawnSandboxTarget() {
    if (!this.sys) return;
    const y = 300 + (Math.random() - 0.5) * 100;
    const dummy = new Enemy(this, 700, y, ENEMY_DEFINITIONS['sandbox_target']);
    this.enemies.push(dummy);
  }

  private spawnHero(id: HeroId) {
    const y = GAME_HEIGHT / 2 + (this.heroes.length * 60) - 60;
    const def = HERO_DEFINITIONS[id];
    const hero = new Hero(this, 50, y, def, 150, (h, target) => {
      let attack: Attack;
      const color = h.definition.projectileColor || h.definition.color;
      
      if (h.definition.attackStyle === 'melee-cleave') {
        attack = new MeleeCleaveAttack(this, h.x, h.y, target, h.damage, h.range, color);
      } else if (h.definition.attackStyle === 'vortex') {
        attack = new VortexAttack(this, h.x, h.y, target, h.damage, color);
      } else if (h.definition.attackStyle === 'boomerang') {
        attack = new BoomerangAttack(this, h, target, h.damage, color);
      } else if (h.definition.attackStyle === 'chain') {
        attack = new ChainAttack(this, h.x, h.y, target, h.damage, color);
      } else if (h.definition.attackStyle === 'summoner') {
        attack = new SummonAttack(this, h.x, h.y, target, h.damage, color);
      } else if (h.definition.attackStyle === 'beam') {
        attack = new BeamAttack(this, h.x, h.y, target, h.damage, color);
      } else if (h.definition.attackStyle === 'lobbed') {
        attack = new LobbedAttack(this, h.x, h.y, target, h.damage, color);
      } else if (h.definition.attackStyle === 'linear-wave') {
        attack = new LinearWaveAttack(this, h.x, h.y, h.damage, color);
      } else if (h.definition.attackStyle === 'trap') {
        attack = new TrapAttack(this, h.x, h.y, target, h.damage, color);
      } else {
        // Fallback to projectile (or pierce)
        const mods = h.definition.attackStyle === 'pierce' ? { bonusPierce: 2 } : undefined;
        attack = new ProjectileAttack(this, h.x, h.y, target, h.damage, color, mods);
      }
      
      this.attacks.push(attack);
    });
    this.heroes.push(hero);
  }

  private addVoices(amount: number) {
    if (this.isSandbox) return;
    
    this.voicesCount += amount;
    if (this.voicesCount >= this.maxVoicesCount) {
      this.voicesCount = 0;
      
      // Pause game
      this.isPaused = true;
      this.emitState(true);
      
      // Generate options
      const options: DropOption[] = [
        { id: 'spawn', title: 'New Worker', description: 'Deploy a new hero to the barricade', type: 'spawn' },
        { id: 'damage', title: 'Damage Up', description: 'Global +5 hero damage', type: 'damage' },
        { id: 'speed', title: 'Attack Speed Up', description: 'Global 20% attack speed boost', type: 'speed' }
      ];
      
      // If hero cap reached, remove spawn option
      if (this.heroes.length >= 5) {
        options[0] = { id: 'heal', title: 'Barrier Patch', description: 'Restore 50 Barrier HP', type: 'spawn' };
      }

      gameToUiEvents.emit('voicesFull', { options });
    }
  }

  private applyDrop(dropId: string) {
    this.maxVoicesCount += 1; // scale up requirement (was 2)

    if (dropId === 'spawn') {
      const availableIds = Object.keys(HERO_DEFINITIONS).filter(
        id => !this.heroes.some(h => h.id === id)
      ) as HeroId[];
      if (availableIds.length > 0) {
        const randomId = Phaser.Math.RND.pick(availableIds);
        this.spawnHero(randomId);
      }
    } else if (dropId === 'heal') {
      this.barrier.hp = Math.min(this.barrier.maxHp, this.barrier.hp + 50);
    } else if (dropId === 'damage') {
      for (const hero of this.heroes) {
        hero.damage += 5;
      }
    } else if (dropId === 'speed') {
      for (const hero of this.heroes) {
        hero.attackRateMs = Math.max(200, hero.attackRateMs * 0.8);
      }
    }
  }

  private emitState(force = false): void {
    const snapshot: GameStateSnapshot = {
      barrierHp: this.barrier.hp,
      maxBarrierHp: this.barrier.maxHp,
      voicesCount: this.voicesCount,
      maxVoicesCount: this.maxVoicesCount,
      waveActive: this.waveActive,
      currentWave: this.currentWave,
      totalWaves: this.totalWaves,
      isPaused: this.isPaused,
      gameSpeed: this.gameSpeed,
      status: this.status,
    };
    const serialized = JSON.stringify(snapshot);
    if (!force && serialized === this.lastSnapshot) return;
    this.lastSnapshot = serialized;
    gameToUiEvents.emit('stateChanged', snapshot);
  }
}
