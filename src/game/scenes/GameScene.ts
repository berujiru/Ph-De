import Phaser from 'phaser';
import { Barrier } from '../entities/Barrier';
import { Hero } from '../entities/Hero';
import { Enemy } from '../entities/Enemy';
import { Summon } from '../entities/Summon';
import { Attack, ProjectileAttack, MeleeCleaveAttack, VortexAttack, BoomerangAttack, ChainAttack, SummonAttack, BeamAttack, LobbedAttack, LinearWaveAttack, TrapAttack } from '../entities/Attacks';
import { gameToUiEvents, uiToGameEvents, type GameStateSnapshot, type DropOption } from '../core/GameEvents';
import { BARRICADE_DEFAULTS, ENEMY_DEFINITIONS, HERO_DEFINITIONS, type EnemyId, type HeroId } from '../data/balance';
import { GAME_HEIGHT, GAME_WIDTH } from '../data/level';
import { applyHeroSkill, type SkillVisualEvent } from '../core/Skills';

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
      unsubSpawnSpecificEnemy();
      unsubTriggerHeroSkill();
      unsubTriggerEnemySkill();
      unsubPlaySound();
      unsubApplyAilment();
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

    const unsubRestart = uiToGameEvents.on('restart', (data) => {
      if (!this.sys) return;
      this.isSandbox = data?.mode === 'sandbox';
      this.resetGame();
    });

    const unsubDebugSpawn = uiToGameEvents.on('debugSpawn', ({ heroId, passive, skill } = {}) => {
      if (!this.sys) return;
      
      // Clear existing heroes for clean testing
      this.heroes.forEach(h => h.destroy());
      this.heroes = [];

      if (heroId) {
        this.spawnHero(heroId as HeroId, passive, skill);
      } else {
        const availableIds = Object.keys(HERO_DEFINITIONS) as HeroId[];
        if (availableIds.length > 0) {
          const randomId = Phaser.Math.RND.pick(availableIds);
          this.spawnHero(randomId);
        }
      }
    });

    const unsubTriggerHeroSkill = uiToGameEvents.on('triggerHeroSkill', ({ skill } = {}) => {
      if (!this.sys) return;
      for (const h of this.heroes) {
        h.useSkill(skill);
      }
    });

    const unsubSpawnSandboxTarget = uiToGameEvents.on('spawnSandboxTarget', () => {
      this.spawnSandboxTarget();
    });

    const unsubSpawnSpecificEnemy = uiToGameEvents.on('spawnSpecificEnemy', ({ enemyId, passive, skill }) => {
      if (!this.sys) return;
      const y = Phaser.Math.Between(100, GAME_HEIGHT - 100);
      
      // Clone definition to avoid polluting base definitions
      const def = { ...ENEMY_DEFINITIONS[enemyId as EnemyId] };
      
      if (passive === 'stealth') {
        def.stealth = true;
      } else if (passive === 'barrierShred') {
        def.barrierDamageMultiplier = 10;
      } else if (passive === 'moraleAura') {
        def.moraleAura = true;
        def.auraRange = 150;
      } else if (passive === 'fakeHp') {
        def.fakeHpPadding = 150;
      } else if (passive === 'stealVoices') {
        def.stealVoicesPerSecond = 1;
      } else if (passive === 'splitOnDeath') {
        def.splitOnDeathCount = 3;
      } else if (passive === 'taunt') {
        def.tauntAura = true;
      } else if (passive === 'dropObstacle') {
        def.dropObstacleOnDeath = true;
      } else if (passive === 'knockback') {
        def.knockbackPulseCooldown = 5000;
      } else if (passive === 'hitImmunity') {
        def.hitImmunityCount = 5;
      }

      if (skill === 'flood') {
        def.activeSkill = { name: 'Sandbox Flood', effect: 'flood' };
      } else if (skill === 'devour') {
        def.activeSkill = { name: 'Sandbox Devour', effect: 'devour' };
      } else if (skill === 'summonSwarm') {
        def.activeSkill = { name: 'Sandbox Trolls', effect: 'summonSwarm' };
      } else if (skill === 'summonShieldbearer') {
        def.activeSkill = { name: 'Sandbox Shieldbearer', effect: 'summonShieldbearer' };
      } else if (skill === 'scatterFakeGold') {
        def.activeSkill = { name: 'Sandbox Bribe', effect: 'scatterFakeGold' };
      } else if (skill === 'smuggleHp') {
        def.activeSkill = { name: 'Sandbox Smuggle', effect: 'smuggleHp' };
      } else if (skill === 'economyHeist') {
        def.activeSkill = { name: 'Sandbox Heist', effect: 'economyHeist' };
      } else if (skill === 'sirenBurst') {
        def.activeSkill = { name: 'Sandbox VIP Convoy', effect: 'sirenBurst' };
      } else if (skill === 'resurrectAll') {
        def.activeSkill = { name: 'Sandbox Horde', effect: 'resurrectAll' };
      }

      const enemy = new Enemy(this, GAME_WIDTH + 50, y, def);
      this.enemies.push(enemy);
    });

    const unsubTriggerEnemySkill = uiToGameEvents.on('triggerEnemySkill', () => {
      if (!this.sys) return;
      // Find the first boss (enemy with activeSkill) and trigger it
      for (const enemy of this.enemies) {
        if (!enemy.isDead && enemy.definition.activeSkill) {
          enemy.triggerSkill();
          break; // Only trigger one boss for now
        }
      }
    });

    const unsubPlaySound = uiToGameEvents.on('playSound', ({ key }) => {
      if (!this.sys) return;
      try { this.sound.play(key); } catch(e) {}
    });

    const unsubApplyAilment = uiToGameEvents.on('applySandboxAilment', ({ ailment, amount }) => {
      if (!this.sys || this.enemies.length === 0) return;
      // apply to the first enemy (sandbox target)
      const target = this.enemies[0];
      target.applyAilmentBuildup(ailment as any, amount);
    });

    // Internal GameScene events
    this.events.on('enemyFlood', () => {
      // Speed up all enemies temporarily
      for (const enemy of this.enemies) {
        enemy.definition.speed *= 2; // massive speed buff
        const flash = this.add.rectangle(enemy.x, enemy.y, 40, 40, 0x0ea5e9, 0.5);
        this.tweens.add({
          targets: flash,
          scale: 3,
          alpha: 0,
          duration: 500,
          onComplete: () => flash.destroy()
        });
      }
    });

    this.events.on('enemyDeathSplit', ({ source, count }: { source: Enemy, count: number }) => {
      for (let i = 0; i < count; i++) {
        // Spawn slightly offset from death location
        const offsetX = (Math.random() - 0.5) * 40;
        const offsetY = (Math.random() - 0.5) * 40;
        const def = { ...ENEMY_DEFINITIONS['grunt'] }; // Split into grunts for now
        def.name = 'Dummy Corp';
        def.color = source.definition.color;
        const enemy = new Enemy(this, source.x + offsetX, source.y + offsetY, def);
        this.enemies.push(enemy);
      }
    });

    this.events.on('enemyDeathDropObstacle', ({ source }: { source: Enemy }) => {
      // For now, spawn a Barricade Summon at the location
      const barricadeDef = {
        name: 'Hoarder Junk',
        hp: 150,
        color: 0xca8a04
      };
      const summon = new Summon(this, source.x, source.y, barricadeDef.hp, barricadeDef.color);
      this.summons.push(summon);
    });

    this.events.on('stealVoices', ({ amount }: { amount: number }) => {
      this.voicesCount = Math.max(0, this.voicesCount - amount);
      this.emitState();
    });

    this.events.on('heroKnockback', ({ source, force }: { source: Enemy, force: number }) => {
      // Push back any heroes in range of the pulse (e.g. 200px)
      for (const hero of this.heroes) {
        if (Phaser.Math.Distance.Between(source.x, source.y, hero.x, hero.y) < 200) {
          hero.x -= force;
          // Simple visual
          this.tweens.add({ targets: hero, x: hero.x - 20, yoyo: true, duration: 150 });
        }
      }
    });

    this.events.on('moraleAura', ({ source, range }: { source: Enemy, range: number }) => {
      // Speed buff to nearby enemies
      for (const enemy of this.enemies) {
        if (enemy !== source && !enemy.isDead) {
          if (Phaser.Math.Distance.Between(source.x, source.y, enemy.x, enemy.y) < range) {
            // Very brief speed buff
            enemy.definition.speed *= 1.2;
            const flash = this.add.rectangle(enemy.x, enemy.y, 20, 20, 0xf97316, 0.5);
            this.tweens.add({ targets: flash, scale: 2, alpha: 0, duration: 200, onComplete: () => flash.destroy() });
            
            // Revert speed after 1s (simple hack for now)
            this.time.delayedCall(1000, () => {
              enemy.definition.speed /= 1.2;
            });
          }
        }
      }
    });

    // Boss Skills
    this.events.on('enemySummonSwarm', ({ source }: { source: Enemy }) => {
      for (let i = 0; i < 3; i++) {
        const y = source.y + (Math.random() - 0.5) * 60;
        const enemy = new Enemy(this, source.x + 30, y, ENEMY_DEFINITIONS['grunt']);
        this.enemies.push(enemy);
      }
    });

    this.events.on('enemySummonShieldbearer', ({ source }: { source: Enemy }) => {
      const enemy = new Enemy(this, source.x + 40, source.y, ENEMY_DEFINITIONS['the_overpriced']);
      this.enemies.push(enemy);
    });

    this.events.on('enemyScatterFakeGold', ({ source }: { source: Enemy }) => {
      for (let i = 0; i < 3; i++) {
        const x = source.x - 50 - Math.random() * 100;
        const y = source.y + (Math.random() - 0.5) * 100;
        
        const coin = this.add.circle(x, y, 10, 0xeab308).setInteractive();
        const text = this.add.text(x, y, '$', { color: '#000', fontSize: '10px' }).setOrigin(0.5);
        
        this.add.group([coin, text]);
        
        // Trap! Drains voices when clicked
        coin.on('pointerdown', () => {
          this.voicesCount = Math.max(0, this.voicesCount - 2);
          this.emitState();
          
          const txt = this.add.text(x, y - 20, '-2 VOICES!', { color: '#ef4444', fontStyle: 'bold' }).setOrigin(0.5);
          this.tweens.add({ targets: txt, y: y - 50, alpha: 0, duration: 1000, onComplete: () => txt.destroy() });
          
          coin.destroy();
          text.destroy();
        });
        
        // Auto-cleanup after 5s
        this.time.delayedCall(5000, () => {
          if (coin.active) {
            coin.destroy();
            text.destroy();
          }
        });
      }
    });

    this.events.on('enemySmuggleHp', ({ source }: { source: Enemy }) => {
      const def = { ...ENEMY_DEFINITIONS['the_overpriced'] };
      def.fakeHpPadding = 1000;
      def.maxHp = 10; // easy to kill once padded HP is gone
      def.name = 'Smuggled Budget';
      def.color = 0x14b8a6;
      
      const y = Math.random() > 0.5 ? 50 : GAME_HEIGHT - 50; // Top or bottom edge
      const enemy = new Enemy(this, source.x, y, def);
      this.enemies.push(enemy);
    });

    this.events.on('enemyEconomyHeist', () => {
      this.voicesCount = Math.max(0, this.voicesCount - 5);
      this.emitState();
      
      const txt = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'HEIST! -5 VOICES', { color: '#ef4444', fontStyle: 'bold', fontSize: '24px' }).setOrigin(0.5);
      this.tweens.add({ targets: txt, y: GAME_HEIGHT / 2 - 100, alpha: 0, duration: 2000, onComplete: () => txt.destroy() });
    });

    this.events.on('bossPhaseShift', ({ source, nextPhaseId }: { source: Enemy, nextPhaseId: EnemyId }) => {
      const def = ENEMY_DEFINITIONS[nextPhaseId];
      if (def) {
        const enemy = new Enemy(this, source.x, source.y, def);
        this.enemies.push(enemy);
        
        const txt = this.add.text(source.x, source.y - 40, 'PHASE SHIFT!', { color: '#d946ef', fontStyle: 'bold' }).setOrigin(0.5);
        this.tweens.add({ targets: txt, y: source.y - 80, alpha: 0, duration: 1500, onComplete: () => txt.destroy() });
      }
    });

    this.events.on('resurrectAll', ({ source }: { source: Enemy }) => {
      // Spawn 3 scaled down bosses
      const bosses: EnemyId[] = ['boss_pork_barrel', 'boss_dynasty_3', 'boss_troll_farm'];
      bosses.forEach((id, idx) => {
        const def = { ...ENEMY_DEFINITIONS[id] };
        def.maxHp = Math.floor(def.maxHp * 0.25); // 25% HP
        def.name = def.name + ' (Resurrected)';
        const y = source.y + (idx - 1) * 60;
        const enemy = new Enemy(this, source.x + 50, y, def);
        this.enemies.push(enemy);
      });
    });

    // --- HERO SKILLS ---
    this.events.on('heroSkillTriggered', ({ hero, skillId }: { hero: Hero, skillId: HeroId }) => {
      applyHeroSkill(skillId, hero, {
        GAME_WIDTH,
        GAME_HEIGHT,
        heroes: this.heroes,
        enemies: this.enemies,
        onVisual: (evt: SkillVisualEvent) => {
          if (evt.type === 'text') {
            const fx = this.add.text(evt.x || 0, evt.y || 0, evt.text || '', { color: evt.color || '#fff', fontStyle: 'bold' }).setOrigin(0.5);
            this.tweens.add({ targets: fx, y: (evt.y || 0) - 30, alpha: 0, duration: 1000, onComplete: () => fx.destroy() });
          } else if (evt.type === 'delayedRevertAttackRate') {
            this.time.delayedCall(evt.delay || 5000, () => {
              if (evt.target) evt.target.attackRateMs = evt.amount;
            });
          } else if (evt.type === 'dragTo') {
            this.tweens.add({ targets: evt.target, y: evt.y, duration: evt.duration || 500 });
          } else if (evt.type === 'spawnObstacle') {
            const block = this.add.rectangle(evt.x, evt.y, evt.width, evt.height, parseInt((evt.color || '#000').replace('#', '0x')));
            this.time.delayedCall(evt.duration || 5000, () => block.destroy());
          } else if (evt.type === 'spawnTrap') {
            const trap = this.add.circle(evt.x, evt.y, evt.radius, parseInt((evt.color || '#000').replace('#', '0x')));
            this.time.delayedCall(evt.duration || 3000, () => trap.destroy());
          } else if (evt.type === 'screenFlash') {
            const blackout = this.add.rectangle(0, 0, GAME_WIDTH * 2, GAME_HEIGHT * 2, parseInt((evt.color || '#000').replace('#', '0x')), evt.alpha || 0.5);
            this.time.delayedCall(evt.duration || 3000, () => blackout.destroy());
          } else if (evt.type === 'spawnRider') {
            const rider = this.add.circle(evt.x, evt.y, 8, 0x22c55e);
            this.tweens.add({
              targets: rider,
              x: evt.targetX,
              duration: evt.duration || 1000,
              onComplete: () => {
                rider.destroy();
                for (const e of this.enemies) {
                  if (!e.isDead && Phaser.Math.Distance.Between(rider.x, rider.y, e.x, e.y) < 100) {
                    e.takeDamage(evt.damage || 10);
                  }
                }
              }
            });
          }
        }
      });
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
          // status is guaranteed 'playing' here (update returns early otherwise),
          // so this transition — and the victory sound — fires exactly once.
          try { this.sound.play('sfx-victory'); } catch (e) {}
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
      // status can only be 'playing' or 'won' here, so the defeat sound
      // fires at most once — next frame update returns early on 'lost'.
      try { this.sound.play('sfx-defeat'); } catch (e) {}
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

  private spawnHero(id: HeroId, passiveOverride?: string, _skillOverride?: string) {
    const y = GAME_HEIGHT / 2 + (this.heroes.length * 60) - 60;
    const def = HERO_DEFINITIONS[id];
    
    // Create hero
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
    
    if (passiveOverride) hero.passiveOverride = passiveOverride;
    // We don't override the signature skill completely, but we can pass it to useSkill
    
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
