import Phaser from 'phaser';
import { MoraleShield } from '../entities/MoraleShield';
import { Hero } from '../entities/Hero';
import { Enemy } from '../entities/Enemy';
import { Summon } from '../entities/Summon';
import { Attack, ProjectileAttack, PierceAttack, MeleeCleaveAttack, VortexAttack, BoomerangAttack, ChainAttack, SummonAttack, BeamAttack, LobbedAttack, LinearWaveAttack, TrapAttack } from '../entities/Attacks';
import { gameToUiEvents, uiToGameEvents, type GameStateSnapshot, type DropOption } from '../core/GameEvents';
import { BARRICADE_DEFAULTS, ENEMY_DEFINITIONS, HERO_DEFINITIONS, MAX_ACTIVE_HEROES, UPGRADE_DEFS, GLOBAL_DROP_DEFS, computeKillPool, voiceDropCost, type EnemyId, type HeroId, type UpgradeKind } from '../data/balance';
import { rollDrops, makeRng, type DropContext } from '../core/Drops';
import { GAME_HEIGHT, GAME_WIDTH, WORLD_HEIGHT, RALLY, ENEMY_SPAWN_Y_OFFSET, FX, PARALLAX } from '../data/level';
import { formationTargetY, nextShieldY } from '../core/RallyMarch';
import { applyHeroSkill, type SkillVisualEvent } from '../core/Skills';
import { getSelectedSkin } from '../data/skinSelection';
import { SkillCutIn } from '../entities/fx/SkillCutIn';
import { ParallaxBackground } from '../entities/fx/ParallaxBackground';
import { cameraPunch } from '../entities/fx/CameraPunch';

export class GameScene extends Phaser.Scene {
  private shield!: MoraleShield;
  private parallax!: ParallaxBackground;
  private enemies: Enemy[] = [];
  private heroes: Hero[] = [];
  private attacks: Attack[] = [];
  public summons: Summon[] = [];
  
  private voicesCount = 0;
  private maxVoicesCount = 5; // Drops a hero when full
  /** 0-based count of drops taken this run — drives the voices threshold cadence. */
  private dropIndex = 0;
  /** Monotonic counter so each drop roll gets a fresh deterministic seed. */
  private dropRollSeed = 0;

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
  private skillCutIn!: SkillCutIn;

  constructor() {
    super('GameScene');
  }

  preload() {
    for (const layer of PARALLAX.layers) {
      this.load.image(layer.key, `/assets/backgrounds/${layer.key}.svg`);
    }
    this.load.image('hero-base', '/assets/heroes/hero-base.svg');
    this.load.image('enemy-base', '/assets/enemies/enemy-base.svg');
    // Enemy sprite sheets (Aseprite atlas). Uncomment each as its art lands;
    // the model falls back to the tinted base cut-out until then, and
    // createEnemyAnimations() below wires whatever loaded. The atlas key
    // defaults to the unit's id (override via `spriteKey` in balance.ts).

    // Hero battle sprites are data-driven SKINS: each hero's selected skin is
    // ONE combined sheet (idle/march/attack/cast + a portrait cell) loaded
    // under the skin's id. Heroes with no skin keep the tinted placeholder.
    // Selection is read here at load time, so an Archive skin change applies
    // on the next battle. See src/game/data/skins.ts.
    for (const heroId of Object.keys(HERO_DEFINITIONS) as HeroId[]) {
      const skin = getSelectedSkin(heroId);
      if (skin && !this.textures.exists(skin.id)) {
        this.load.spritesheet(skin.id, skin.sheet, {
          frameWidth: skin.frameWidth,
          frameHeight: skin.frameHeight,
        });
      }
    }


    // Dynamically load all hero portraits (static or animated)
    Object.values(HERO_DEFINITIONS).forEach((hero) => {
      if (hero.portraitKey) {
        if (hero.cutInAnim) {
          this.load.spritesheet(hero.portraitKey, `/assets/heroes/${hero.portraitKey}.png`, {
            frameWidth: hero.cutInAnim.frameWidth,
            frameHeight: hero.cutInAnim.frameHeight,
          });
        } else {
          this.load.image(hero.portraitKey, `/assets/heroes/${hero.portraitKey}.png`);
        }
      }
    });
    // this.load.aseprite('grunt', '/assets/enemies/grunt.png', '/assets/enemies/grunt.json');
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
    this.skillCutIn = new SkillCutIn(this);
    this.createHeroAnimations();
    this.createEnemyAnimations();
    this.createCutInAnimations();
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
      this.endBattle('lost');
      this.emitState(true);
    });

    const unsubRestart = uiToGameEvents.on('restart', (data) => {
      if (!this.sys) return;
      this.isSandbox = data?.mode === 'sandbox';
      this.resetGame();
    });

    const unsubDebugSpawn = uiToGameEvents.on('debugSpawn', ({ heroId, passive, skill } = {}) => {
      if (!this.sys) return;
      
      // Preserve Eden for ally interaction tests, but clear the previous test hero
      for (const h of this.heroes) {
        if (h.id !== 'eden') {
          h.destroy();
        }
      }
      this.heroes = this.heroes.filter(h => h.id === 'eden');

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
        h.isSkillReady = true; // Force ready for sandbox
        h.useSkill(skill);
      }
    });

    const unsubSpawnSandboxTarget = uiToGameEvents.on('spawnSandboxTarget', () => {
      this.spawnSandboxTarget();
    });

    const unsubSpawnSpecificEnemy = uiToGameEvents.on('spawnSpecificEnemy', ({ enemyId, passive, skill }) => {
      if (!this.sys) return;
      // Scatter across the lane (X); the spawn line is on the march axis (Y).
      const x = Phaser.Math.Between(100, GAME_WIDTH - 100);

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

      // Spawn just above the visible top of the screen so enemies always walk
      // in from the top edge (the camera tracks the shield in live battles).
      const y = this.cameras.main.scrollY - ENEMY_SPAWN_Y_OFFSET;
      const enemy = new Enemy(this, x, y, def);
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
      
      const x = Math.random() > 0.5 ? 50 : GAME_WIDTH - 50; // Left or right lane edge
      const enemy = new Enemy(this, x, source.y, def);
      this.enemies.push(enemy);
    });

    this.events.on('enemyEconomyHeist', () => {
      this.voicesCount = Math.max(0, this.voicesCount - 5);
      this.emitState();

      // Screen-space announcement — pinned to the viewport, not the world.
      const txt = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'HEIST! -5 VOICES', { color: '#ef4444', fontStyle: 'bold', fontSize: '24px' }).setOrigin(0.5).setScrollFactor(0);
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
      // Camera punch on the cast — layered on the follow camera via the shake
      // effect (render-only, no scroll drift). It decays during the cut-in
      // freeze that follows, reading as an impact.
      cameraPunch(this, FX.cameraShake.skillCast, true);

      // Anime-style cut-in for every hero (Eden is the reference). Pauses
      // gameplay while it plays, reusing the system-pause pattern (no UI
      // events — the GameEvents contract stays unchanged). Skipped in sandbox
      // so rapid skill-testing isn't interrupted.
      if (!this.isSandbox && !this.isPaused) {
        this.isPaused = true;
        this.pauseVisuals();

        this.skillCutIn.play({
          skillName: hero.definition.signatureSkill.name,
          faction: 'hero',
          portraitKey: hero.definition.portraitKey,
          durationMs: hero.definition.cutInDurationMs,
          marginY: hero.definition.cutInMarginY,
          marginX: hero.definition.cutInMarginX,
          artScale: hero.definition.cutInArtScale,
          artOffsetX: hero.definition.cutInArtOffsetX,
          artOffsetY: hero.definition.cutInArtOffsetY,
          position: hero.definition.cutInPosition,
          onComplete: () => {
            if (!this.sys) return;
            this.isPaused = false;
            this.resumeVisuals();
            
            // Show the cast animation now the cut-in has cleared (it would
            // otherwise finish hidden behind the full-screen cut-in).
            hero.playCast();
          },
        });
      }

      applyHeroSkill(skillId, hero, {
        // Lane width is static (no horizontal scroll). Skills treat GAME_HEIGHT
        // as "the bottom edge of what the player sees" — the front line — which
        // with a scrolling camera is scrollY + viewport height in world coords.
        GAME_WIDTH,
        GAME_HEIGHT: this.cameras.main.scrollY + GAME_HEIGHT,
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
            this.tweens.add({ targets: evt.target, x: evt.x, duration: evt.duration || 500 });
          } else if (evt.type === 'spawnObstacle') {
            const block = this.add.rectangle(evt.x, evt.y, evt.width, evt.height, parseInt((evt.color || '#000').replace('#', '0x')));
            this.time.delayedCall(evt.duration || 5000, () => block.destroy());
          } else if (evt.type === 'spawnTrap') {
            const trap = this.add.circle(evt.x, evt.y, evt.radius, parseInt((evt.color || '#000').replace('#', '0x')));
            this.time.delayedCall(evt.duration || 3000, () => trap.destroy());
          } else if (evt.type === 'screenFlash') {
            const blackout = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, parseInt((evt.color || '#000').replace('#', '0x')), evt.alpha || 0.5).setScrollFactor(0);
            this.time.delayedCall(evt.duration || 3000, () => blackout.destroy());
          } else if (evt.type === 'spawnRider') {
            const rider = this.add.circle(evt.x, evt.y, 8, 0x22c55e);
            this.tweens.add({
              targets: rider,
              y: evt.targetY,
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
    if (this.parallax) this.parallax.destroy();
    if (this.shield) this.shield.destroy();

    this.buildGame();
  }

  /** Create the morale shield + initial hero and reset all state counters. */
  private buildGame(): void {
    this.heroes = [];
    this.enemies = [];
    this.attacks = [];
    this.summons = [];
    this.voicesCount = 0;
    this.waveActive = false;
    this.currentWave = 1;
    this.totalWaves = 3;
    this.enemiesToSpawn = 5;
    // First drop threshold is derived from the run's kill pool, not hard-coded.
    this.dropIndex = 0;
    this.dropRollSeed = 0;
    this.maxVoicesCount = voiceDropCost(0, computeKillPool(this.totalWaves));
    this.isPaused = false;
    this.gameSpeed = 1;
    this.status = 'playing';
    this.spawnTimer = 2000;
    this.lastSnapshot = '';

    // Layered parallax backdrop — sells forward motion as the rally marches.
    this.parallax = new ParallaxBackground(this, GAME_WIDTH, GAME_HEIGHT);

    // Scrolling camera over the tall world (scrolls vertically along the march
    // axis; X is pinned since bounds width == viewport width).
    this.cameras.main.setBounds(0, 0, GAME_WIDTH, WORLD_HEIGHT);
    this.cameras.main.scrollX = 0;

    // The morale shield — the crowd's front line, a horizontal bar spanning the
    // lane near the bottom. Advances UP (decreasing y) as the rally marches.
    this.shield = new MoraleShield(this, GAME_WIDTH / 2, RALLY.shieldStartY, GAME_WIDTH, BARRICADE_DEFAULTS.width, BARRICADE_DEFAULTS.maxHp);

    // Start the camera trailing the shield near the bottom of the view (clamps
    // to the world bottom at battle start, so both modes show the formation).
    this.cameras.main.scrollY = Phaser.Math.Clamp(
      this.shield.y - GAME_HEIGHT * RALLY.cameraAnchorRatio,
      0,
      WORLD_HEIGHT - GAME_HEIGHT,
    );

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
          this.endBattle('won');
        }
      }
    }

    // The rally marches forward (up) while the field ahead is clear; halts to fight.
    if (!this.isSandbox) {
      const livingEnemyYs = this.enemies.filter(e => !e.isDead).map(e => e.y);
      this.shield.y = nextShieldY(this.shield.y, delta, livingEnemyYs, {
        marchSpeedPxPerSec: RALLY.marchSpeedPxPerSec,
        engageRangePx: RALLY.engageRangePx,
        shieldMaxY: RALLY.shieldMaxY,
      });

      // Camera keeps the shield at a fixed screen position, easing toward it.
      const cam = this.cameras.main;
      const targetScroll = Phaser.Math.Clamp(
        this.shield.y - GAME_HEIGHT * RALLY.cameraAnchorRatio,
        0,
        WORLD_HEIGHT - GAME_HEIGHT,
      );
      cam.scrollY += (targetScroll - cam.scrollY) * Math.min(1, RALLY.cameraLerpPerSec * (delta / 1000));
    }

    // Slide the parallax layers to match wherever the camera ended up (fixed in
    // sandbox's static camera, which still reads correctly).
    this.parallax.update(this.cameras.main.scrollY);

    // Update entities
    for (const enemy of this.enemies) {
      enemy.update(delta, this.shield, this.summons);
      if (enemy.isDead && enemy.hp <= 0) {
        // Was killed by hero, not by hitting the shield
        this.addVoices(1);
      }
    }

    this.enemies = this.enemies.filter(e => {
      // e.destroy() is now handled by Enemy.ts death animation
      return !e.isDead;
    });

    for (const hero of this.heroes) {
      hero.update(delta, this.enemies, this.shield.y);
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
    if (this.shield.isDead && !this.isSandbox) {
      // status can only be 'playing' or 'won' here, so the defeat sound
      // fires at most once — next frame update returns early on 'lost'.
      try { this.sound.play('sfx-defeat'); } catch (e) {}
      this.endBattle('lost');
    }

    this.emitState();
  }

  /**
   * Lock in the battle result exactly once and play everyone's outcome pose:
   * heroes celebrate / take a knee, and on a loss the anomalies celebrate
   * overrunning the barrier. Guards on 'playing' so it can't fire twice.
   */
  private endBattle(status: 'won' | 'lost'): void {
    if (this.status !== 'playing') return;
    this.status = status;
    for (const hero of this.heroes) hero.playOutcome(status === 'won' ? 'celebrate' : 'defeat');
    if (status === 'lost') {
      for (const enemy of this.enemies) enemy.playOutcome('celebrate');
    }
  }

  private pauseVisuals(): void {
    for (const hero of this.heroes) hero.model.pause();
    for (const enemy of this.enemies) enemy.model.pause();
  }

  private resumeVisuals(): void {
    for (const hero of this.heroes) hero.model.resume();
    for (const enemy of this.enemies) enemy.model.resume();
  }

  /**
   * Build `${skin.id}-<state>` animations for every hero whose selected skin
   * sheet actually loaded, from the skin's declared frame ranges
   * (src/game/data/skins.ts). Heroes without a skin (or whose sheet failed to
   * load) simply have no animations, so HeroModel keeps its tween placeholders.
   * Loops (idle/march) repeat; one-shots (attack/cast) play once — attack is
   * additionally time-scaled to attackRateMs at play time by HeroModel.
   */
  private createHeroAnimations(): void {
    for (const heroId of Object.keys(HERO_DEFINITIONS) as HeroId[]) {
      const skin = getSelectedSkin(heroId);
      if (!skin || !this.textures.exists(skin.id)) continue;
      for (const [state, cfg] of Object.entries(skin.states)) {
        if (!cfg) continue;
        const animKey = `${skin.id}-${state}`;
        if (this.anims.exists(animKey)) continue;
        this.anims.create({
          key: animKey,
          frames: this.anims.generateFrameNumbers(skin.id, {
            start: cfg.from,
            end: cfg.from + cfg.frames - 1,
          }),
          frameRate: cfg.frameRate ?? 10,
          repeat: state === 'idle' || state === 'march' ? -1 : 0,
        });
      }
    }
  }

  /** Same as createHeroAnimations(), for enemies (top-front sprite sheets). */
  private createEnemyAnimations(): void {
    this.createAtlasAnimations(Object.values(ENEMY_DEFINITIONS).map(d => d.spriteKey ?? d.id));
  }

  /** Manually generate animations for sprite sheets without a JSON atlas. */
  private createCutInAnimations(): void {
    Object.values(HERO_DEFINITIONS).forEach((hero) => {
      if (hero.portraitKey && hero.cutInAnim) {
        const animKey = `${hero.portraitKey}-anim`;
        if (this.textures.exists(hero.portraitKey) && !this.anims.exists(animKey)) {
          this.anims.create({
            key: animKey,
            frames: this.anims.generateFrameNumbers(hero.portraitKey, { start: 0, end: hero.cutInAnim.frames - 1 }),
          });
        }
      }
    });
  }

  /**
   * Build **namespaced** tag animations (`${key}-<tag>`) for any of these atlas
   * keys that loaded. We can't use `createFromAseprite`, which names animations
   * by bare tag (`idle`, `march`…) — every character shares the tags `idle`,
   * `attack`, etc., so those would collide, and the model plays `${key}-<tag>`.
   * So we read the Aseprite JSON's frameTags and create one prefixed animation
   * per tag from the atlas frames (named by their `filename`, e.g. `idle 0`).
   */
  private createAtlasAnimations(keys: string[]): void {
    for (const key of keys) {
      if (!this.textures.exists(key)) continue;
      const data = this.cache.json.get(key) as {
        frames?: { filename: string }[];
        meta?: { frameTags?: { name: string; from: number; to: number }[] };
      } | undefined;
      const tags = data?.meta?.frameTags;
      const frameList = data?.frames;
      if (!tags || !frameList) continue; // plain image, not an Aseprite atlas

      for (const tag of tags) {
        const animKey = `${key}-${tag.name}`;
        if (this.anims.exists(animKey)) continue;
        const frames: Phaser.Types.Animations.AnimationFrame[] = [];
        for (let i = tag.from; i <= tag.to; i++) {
          const name = frameList[i]?.filename;
          if (name !== undefined) frames.push({ key, frame: name });
        }
        if (frames.length === 0) continue;
        // Loop by default; one-shot states (attack/cast/death) override repeat at play time.
        this.anims.create({ key: animKey, frames, frameRate: 10, repeat: -1 });
      }
    }
  }

  private spawnEnemy() {
    // Scatter across the lane (X); spawn just above the visible top of the
    // screen so enemies enter from the top edge of what the player sees.
    const x = Phaser.Math.Between(50, GAME_WIDTH - 50);
    const y = this.cameras.main.scrollY - ENEMY_SPAWN_Y_OFFSET;
    const enemy = new Enemy(this, x, y, ENEMY_DEFINITIONS['grunt']);
    this.enemies.push(enemy);
  }

  public spawnSandboxTarget() {
    if (!this.sys) return;
    const x = GAME_WIDTH / 2 + (Math.random() - 0.5) * 100;
    // Above the shield so heroes can shoot up at it, within the static sandbox view.
    const dummy = new Enemy(this, x, this.shield.y - 450, ENEMY_DEFINITIONS['sandbox_target']);
    this.enemies.push(dummy);
  }

  private spawnHero(id: HeroId, passiveOverride?: string, _skillOverride?: string) {
    // Spread heroes horizontally across the lane to prevent overlapping (center out)
    const offset = this.heroes.length === 0 ? 0 : (this.heroes.length % 2 === 0 ? 1 : -1) * Math.ceil(this.heroes.length / 2) * RALLY.formation.rowSpacingPx;
    const x = GAME_WIDTH / 2 + offset;
    const def = HERO_DEFINITIONS[id];

    // Heroes join directly at their formation slot behind (below) the shield.
    const y = formationTargetY(this.shield.y, { attackKind: def.attackKind, rangePx: def.range }, RALLY.formation);

    const hero = new Hero(this, x, y, def, (h, target) => {
      let attack: Attack;
      const color = h.definition.projectileColor || h.definition.color;
      // Persisted per-hero upgrade mods land on every Attack this hero spawns.
      const mods = h.modifiers;

      if (h.definition.attackStyle === 'melee-cleave') {
        attack = new MeleeCleaveAttack(this, h.x, h.y, target, h.damage, h.range, color, mods);
      } else if (h.definition.attackStyle === 'vortex') {
        attack = new VortexAttack(this, h.x, h.y, target, h.damage, color, mods);
      } else if (h.definition.attackStyle === 'boomerang') {
        attack = new BoomerangAttack(this, h, target, h.damage, color, mods);
        h.playProjectileLaunch();
      } else if (h.definition.attackStyle === 'chain') {
        attack = new ChainAttack(this, h.muzzleX, h.muzzleY, target, h.damage, color, h.definition.baseChain ?? 1, mods);
      } else if (h.definition.attackStyle === 'summoner') {
        attack = new SummonAttack(this, h.x, h.y, target, h.damage, color, mods);
      } else if (h.definition.attackStyle === 'beam') {
        attack = new BeamAttack(this, h.muzzleX, h.muzzleY, target, h.damage, color, mods);
      } else if (h.definition.attackStyle === 'lobbed') {
        attack = new LobbedAttack(this, h.muzzleX, h.muzzleY, target, h.damage, color, mods);
        h.playProjectileLaunch();
      } else if (h.definition.attackStyle === 'linear-wave') {
        attack = new LinearWaveAttack(this, h.muzzleX, h.muzzleY, h.damage, color, mods);
      } else if (h.definition.attackStyle === 'trap') {
        attack = new TrapAttack(this, h.x, h.y, target, h.damage, color, mods);
      } else if (h.definition.attackStyle === 'pierce') {
        // Non-homing straight-line shot; pass-throughs = basePierce + bonusPierce.
        attack = new PierceAttack(this, h.muzzleX, h.muzzleY, target, h.damage, color, h.definition.basePierce ?? 1, mods);
        h.playProjectileLaunch();
      } else {
        // Plain projectile — homes, expires on first hit (+bonusPierce).
        attack = new ProjectileAttack(this, h.muzzleX, h.muzzleY, target, h.damage, color, mods);
        h.playProjectileLaunch();
      }

      this.attacks.push(attack);
    }, getSelectedSkin(id)?.id); // equipped skin drives which sheet the model renders

    if (passiveOverride) {
      hero.passiveOverride = passiveOverride;
    }

    if (this.isSandbox) {
      hero.isSkillReady = true;
    }

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

      const options = this.rollDropOptions();
      gameToUiEvents.emit('voicesFull', { options });
    }
  }

  /** Assemble live battle state and roll 3 drop options via the pure roller. */
  private rollDropOptions(): DropOption[] {
    const activeIds = new Set(this.heroes.map(h => h.id));
    const availableRecruits = (Object.keys(HERO_DEFINITIONS) as HeroId[])
      .filter(id => !id.startsWith('sandbox_') && !activeIds.has(id))
      .map(id => ({ id, name: HERO_DEFINITIONS[id].name, purpose: HERO_DEFINITIONS[id].purpose }));

    const ctx: DropContext = {
      activeHeroes: this.heroes
        .filter(h => !h.id.startsWith('sandbox_'))
        .map(h => ({
          id: h.id,
          name: h.definition.name,
          attackStyle: h.definition.attackStyle,
          stacks: h.upgradeStacks,
        })),
      availableRecruits,
      hasOpenSlot: this.heroes.length < MAX_ACTIVE_HEROES,
      barrierHp: this.shield.hp,
      barrierMaxHp: this.shield.maxHp,
    };

    const rng = makeRng((Date.now() ^ (this.dropRollSeed++ * 0x9e3779b1)) >>> 0);
    return rollDrops(ctx, rng, 3);
  }

  private applyDrop(dropId: string) {
    // Advance the drop cadence: next threshold derives from the run's kill pool.
    this.dropIndex += 1;
    this.maxVoicesCount = voiceDropCost(this.dropIndex, computeKillPool(this.totalWaves));

    if (dropId.startsWith('hero:')) {
      const heroId = dropId.slice('hero:'.length) as HeroId;
      this.spawnHero(heroId);
    } else if (dropId === 'global:moraleHeal') {
      this.shield.heal(GLOBAL_DROP_DEFS.moraleHeal.magnitude);
    } else if (dropId.startsWith('upgrade:')) {
      const [, heroId, kind] = dropId.split(':');
      this.applyHeroUpgrade(heroId, kind as UpgradeKind);
    }
  }

  /** Apply one hero-targeted upgrade pick per UpgradeSpec.apply, and track the
   *  stack count so the roller stops offering it once maxed. */
  private applyHeroUpgrade(heroId: string, kind: UpgradeKind) {
    const hero = this.heroes.find(h => h.id === heroId);
    const spec = UPGRADE_DEFS[kind];
    if (!hero || !spec) return;

    switch (spec.apply) {
      case 'flatDamage':
        hero.damage += spec.magnitude;
        break;
      case 'attackSpeedMult':
        hero.attackRateMs = Math.max(200, hero.attackRateMs * spec.magnitude);
        break;
      case 'flatRange':
        hero.range += spec.magnitude;
        break;
      case 'bonusPierce':
        hero.modifiers.bonusPierce += spec.magnitude;
        break;
      case 'bonusChain':
        hero.modifiers.bonusChain += spec.magnitude;
        break;
      case 'bonusRadius':
        hero.modifiers.bonusRadius += spec.magnitude;
        break;
    }

    hero.upgradeStacks[kind] = (hero.upgradeStacks[kind] ?? 0) + 1;
  }

  private emitState(force = false): void {
    const activeEnemies = Object.values(
      this.enemies.reduce((acc, enemy) => {
        if (!enemy.isDead) {
          acc[enemy.definition.id] = { 
            id: enemy.definition.id, 
            count: (acc[enemy.definition.id]?.count || 0) + 1 
          };
        }
        return acc;
      }, {} as Record<string, { id: string, count: number }>)
    );

    const snapshot: GameStateSnapshot = {
      barrierHp: this.shield.hp,
      maxBarrierHp: this.shield.maxHp,
      voicesCount: this.voicesCount,
      maxVoicesCount: this.maxVoicesCount,
      waveActive: this.waveActive,
      currentWave: this.currentWave,
      totalWaves: this.totalWaves,
      isPaused: this.isPaused,
      gameSpeed: this.gameSpeed,
      status: this.status,
      activeHeroes: this.heroes.map(h => ({ id: h.id, passiveOverride: h.passiveOverride })),
      activeEnemies: activeEnemies
    };
    const serialized = JSON.stringify(snapshot);
    if (!force && serialized === this.lastSnapshot) return;
    this.lastSnapshot = serialized;
    gameToUiEvents.emit('stateChanged', snapshot);
  }
}
