import Phaser from 'phaser';
import { MoraleShield } from '../entities/MoraleShield';
import { Hero } from '../entities/Hero';
import { Enemy } from '../entities/Enemy';
import { Summon } from '../entities/Summon';
import { Attack } from '../entities/Attacks';
import { gameToUiEvents, type GameStateSnapshot } from '../core/GameEvents';
import { BARRICADE_DEFAULTS } from '../data/constants';
import { enemySizeClass } from '../data/enemies';
import { computeKillPool, voiceDropCost } from '../data/drops';
import { type HeroId, HERO_DEFINITIONS } from '../data/heroes';
import { allAttackArtStems, attackArtKey, attackArtPath } from '../data/attackArt';
import { GAME_HEIGHT, GAME_WIDTH, WORLD_HEIGHT, RALLY, PARALLAX } from '../data/level';
import { getMapSkinForStage, type MapSkin } from '../data/mapSkins';
import { WaveManager } from '../core/WaveManager';
import { TOTAL_WAVES, INTER_WAVE_DELAY_MS, buildWaveTable, bossForStage } from '../data/waves';
import { nextShieldY } from '../core/RallyMarch';
import { SkillCutIn } from '../entities/fx/SkillCutIn';
import { ParallaxBackground } from '../entities/fx/ParallaxBackground';

// Helper imports
import { setupGameAnimations } from './GameSceneAnimations';
import { setupUIEvents, setupInternalEvents } from './GameSceneEvents';
import { spawnEnemy, spawnHero, spawnSandboxTarget } from './GameSceneSpawners';
import { addVoices } from './GameSceneDrops';
import { getSelectedSkin } from '../data/skinSelection';

export class GameScene extends Phaser.Scene {
  public shield!: MoraleShield;
  public parallax!: ParallaxBackground;
  public activeMapSkin: MapSkin | null = null;
  public currentAct: number | null = null;
  public currentStageIdx: number | null = null;
  public enemies: Enemy[] = [];
  public seenEnemies: Set<string> = new Set();
  
  public get isBudgetCutActive(): boolean {
    return this.enemies.some(e => !e.isDead && e.definition.budgetCut);
  }
  public heroes: Hero[] = [];
  public attacks: Attack[] = [];
  public summons: Summon[] = [];
  public barriers: Phaser.GameObjects.GameObject[] = [];
  public traps: Phaser.GameObjects.GameObject[] = [];
  public persistentAoe: Phaser.GameObjects.GameObject[] = [];
  
  public voicesCount = 0;
  public maxVoicesCount = 5; 
  public dropIndex = 0;
  public dropRollSeed = 0;

  public waveActive = false;
  public currentWave = 1;
  public totalWaves = TOTAL_WAVES;
  public waveManager!: WaveManager;
  public isPaused = false; 
  public gameSpeed = 1; 
  public status: 'playing' | 'won' | 'lost' = 'playing';
  public lastSnapshot = '';
  public isSandbox = false;
  public sandboxRespawnTimer = 0;

  public propertyRouletteTimer = 0;
  public propertyRouletteActive = false;
  public currentRouletteIndex = 0;
  public rouletteHighlighter!: Phaser.GameObjects.Graphics;
  public skillCutIn!: SkillCutIn;
  public comboQueue: Hero[] = [];
  public isProcessingCombo = false;
  public comboCount = 0;

  private cleanupUIEvents?: () => void;

  constructor() {
    super('GameScene');
  }

  init(data: any) {
    if (data?.act != null && data?.stageIdx != null) {
      this.currentAct = data.act;
      this.currentStageIdx = data.stageIdx;
      this.activeMapSkin = getMapSkinForStage(data.act, data.stageIdx);
    } else {
      this.currentAct = null;
      this.currentStageIdx = null;
      this.activeMapSkin = null;
    }
  }

  preload() {
    for (const layer of PARALLAX.layers) {
      this.load.image(layer.key, `/assets/backgrounds/${layer.key}.svg`);
    }

    if (this.activeMapSkin) {
      const s = this.activeMapSkin;
      const entries: [string, string][] = [
        [`${s.id}-sky`, s.layers.sky],
        [`${s.id}-skyline`, s.layers.skyline],
        [`${s.id}-street`, s.layers.street],
        [`${s.id}-foreground`, s.layers.foreground],
      ];
      for (const [key, path] of entries) {
        if (!this.textures.exists(key)) {
          this.load.image(key, path);
        }
      }
    }
    this.load.image('hero-base', '/assets/heroes/hero-base.svg');
    this.load.image('enemy-base', '/assets/enemies/enemy-base.svg');
    this.load.spritesheet('grunt', '/assets/enemies/minion_grunt.png', {
      frameWidth: 256,
      frameHeight: 256,
    });
    this.load.aseprite('boss_troll_farm', '/assets/enemies/boss_troll_farm.png', '/assets/enemies/boss_troll_farm.json');
    this.load.image('kamote_rider', '/assets/fx/kamote_rider.svg');
    this.load.image('water_wave', '/assets/fx/water_wave.svg');
    this.load.image('tornado', '/assets/fx/tornado.svg');
    this.load.image('molotov', '/assets/fx/molotov.svg');
    this.load.image('dough-barrier', '/assets/fx/dough-barrier.svg');
    this.load.image('lambat_vortex', '/assets/fx/lambat_vortex.svg');
    this.load.image('tree_of_life', '/assets/fx/tree_of_life.svg');
    this.load.image('boss_aura', '/assets/fx/boss_aura.svg');

    // Basic-attack art: white/grayscale SVGs tinted by damage type at runtime.
    // The list is derived from hero data + style defaults (attackArt.ts).
    for (const stem of allAttackArtStems(HERO_DEFINITIONS)) {
      this.load.image(attackArtKey(stem), attackArtPath(stem));
    }

    for (const heroId of Object.keys(HERO_DEFINITIONS) as HeroId[]) {
      const skin = getSelectedSkin(heroId);
      if (skin && !this.textures.exists(skin.id)) {
        this.load.spritesheet(skin.id, skin.sheet, {
          frameWidth: skin.frameWidth,
          frameHeight: skin.frameHeight,
        });
      }
    }

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
  }

  create(): void {
    this.skillCutIn = new SkillCutIn(this);
    setupGameAnimations(this);
    this.buildGame();

    const cleanup = () => {
      if (this.cleanupUIEvents) this.cleanupUIEvents();
      this.events.removeAllListeners();
    };

    this.cleanupUIEvents = setupUIEvents(this);
    setupInternalEvents(this);

    this.events.on('shutdown', cleanup);
    this.events.on('destroy', cleanup);
  }

  public resetGame(): void {
    for (const e of this.enemies) e.destroy();
    for (const h of this.heroes) h.destroy();
    for (const a of this.attacks) a.destroy();
    for (const s of this.summons) s.destroy();
    for (const b of this.barriers) b.destroy();
    for (const t of this.traps) t.destroy();
    for (const aoe of this.persistentAoe) aoe.destroy();
    if (this.parallax) this.parallax.destroy();
    if (this.shield) this.shield.destroy();
    if (this.rouletteHighlighter) this.rouletteHighlighter.destroy();

    this.buildGame();
  }

  public healShield(amount: number): void {
    if (this.shield) {
      this.shield.heal(amount);
    }
  }

  private buildGame(): void {
    this.heroes = [];
    this.enemies = [];
    this.attacks = [];
    this.summons = [];
    this.barriers = [];
    this.traps = [];
    this.persistentAoe = [];
    this.voicesCount = 0;
    this.waveActive = false;
    this.currentWave = 1;
    this.totalWaves = TOTAL_WAVES;
    
    this.waveManager = new WaveManager(buildWaveTable(bossForStage(this.currentAct, this.currentStageIdx)), INTER_WAVE_DELAY_MS);
    this.dropIndex = 0;
    this.dropRollSeed = 0;
    this.maxVoicesCount = voiceDropCost(0, computeKillPool(this.totalWaves));
    this.isPaused = false;
    this.syncVisualPauseState();
    this.gameSpeed = 1;
    this.status = 'playing';
    this.lastSnapshot = '';
    this.comboQueue = [];
    this.isProcessingCombo = false;
    this.comboCount = 0;

    const skinKeys = this.activeMapSkin
      ? [
          `${this.activeMapSkin.id}-sky`,
          `${this.activeMapSkin.id}-skyline`,
          `${this.activeMapSkin.id}-street`,
          `${this.activeMapSkin.id}-foreground`,
        ]
      : undefined;
    this.parallax = new ParallaxBackground(this, GAME_WIDTH, GAME_HEIGHT, skinKeys);

    this.cameras.main.setBounds(0, 0, GAME_WIDTH, WORLD_HEIGHT);
    this.cameras.main.scrollX = 0;

    this.shield = new MoraleShield(this, GAME_WIDTH / 2, RALLY.shieldStartY, GAME_WIDTH, BARRICADE_DEFAULTS.height, BARRICADE_DEFAULTS.maxHp);

    this.cameras.main.scrollY = Phaser.Math.Clamp(
      this.shield.y - GAME_HEIGHT * RALLY.cameraAnchorRatio,
      0,
      WORLD_HEIGHT - GAME_HEIGHT,
    );

    spawnHero(this, 'eden');

    this.rouletteHighlighter = this.add.graphics();
    this.rouletteHighlighter.lineStyle(4, 0xef4444);
    // Draw a square roughly the size of a hero slot
    this.rouletteHighlighter.strokeRect(-40, -40, 80, 80);
    this.rouletteHighlighter.setVisible(false);
    // Put above heroes
    this.rouletteHighlighter.setDepth(100);

    this.emitState(true);
  }

  update(_time: number, delta: number): void {
    if (this.status !== 'playing' || this.isPaused || this.gameSpeed === 0) return;

    delta *= this.gameSpeed;

    // Private property roulette logic
    const hasLandGrabber = this.enemies.some(e => !e.isDead && e.definition.privatePropertyStun);
    if (hasLandGrabber) {
      const anyEvicted = this.heroes.some(h => h.isEvicted);
      if (!anyEvicted && this.heroes.length > 0) {
        if (!this.propertyRouletteActive) {
          this.propertyRouletteActive = true;
          this.propertyRouletteTimer = 2000;
          this.currentRouletteIndex = 0;
          this.rouletteHighlighter.setVisible(true);
        }

        if (this.propertyRouletteActive) {
          this.propertyRouletteTimer -= delta;
          if (_time % 200 < 50) { 
             this.currentRouletteIndex = Math.floor(Math.random() * this.heroes.length);
          }
          const targetHero = this.heroes[this.currentRouletteIndex];
          if (targetHero) {
            this.rouletteHighlighter.setPosition(targetHero.x, targetHero.y);
          }

          if (this.propertyRouletteTimer <= 0) {
             this.propertyRouletteActive = false;
             this.rouletteHighlighter.setVisible(false);
             if (targetHero) {
                targetHero.setEvicted(true);
             }
          }
        }
      }
    } else {
      this.propertyRouletteActive = false;
      this.rouletteHighlighter.setVisible(false);
      for (const h of this.heroes) {
         if (h.isEvicted) h.setEvicted(false);
      }
    }

    if (!this.waveActive && _time > 1000) {
      this.waveActive = true;
      this.emitState();
    }

    if (this.isSandbox) {
      if (this.enemies.length === 0) {
        this.sandboxRespawnTimer += delta;
        if (this.sandboxRespawnTimer > 2000) {
          spawnSandboxTarget(this);
          this.sandboxRespawnTimer = 0;
        }
      }
    } else if (this.waveActive) {
      const livingEnemiesCount = this.enemies.filter(e => !e.isDead).length;
      const outputs = this.waveManager.update(delta, livingEnemiesCount);
      
      for (const out of outputs) {
        if (out.kind === 'spawn') {
          spawnEnemy(this, out.enemyId, out.wave);
        } else if (out.kind === 'warning') {
          const txt = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, out.text, { color: '#ef4444', fontStyle: 'bold', fontSize: '32px' }).setOrigin(0.5).setScrollFactor(0);
          this.tweens.add({ targets: txt, scale: 1.2, yoyo: true, duration: 250, repeat: -1 });
          this.time.delayedCall(out.durationMs, () => { if (txt.active) txt.destroy(); });
        } else if (out.kind === 'waveStarted') {
          this.currentWave = out.wave;
        }
      }

      if (this.waveManager.allSpawnsDone && livingEnemiesCount === 0) {
        if (this.status === 'playing') {
          try { this.sound.play('sfx-victory'); } catch (e) {}
          this.endBattle('won');
        }
      }
    }

    if (!this.isSandbox) {
      const livingEnemyYs = this.enemies.filter(e => !e.isDead).map(e => e.y);
      this.shield.y = nextShieldY(this.shield.y, delta, livingEnemyYs, {
        marchSpeedPxPerSec: RALLY.marchSpeedPxPerSec,
        engageRangePx: RALLY.engageRangePx,
        shieldMaxY: RALLY.shieldMaxY,
      });

      const cam = this.cameras.main;
      const targetScroll = Phaser.Math.Clamp(
        this.shield.y - GAME_HEIGHT * RALLY.cameraAnchorRatio,
        0,
        WORLD_HEIGHT - GAME_HEIGHT,
      );
      cam.scrollY += (targetScroll - cam.scrollY) * Math.min(1, RALLY.cameraLerpPerSec * (delta / 1000));
    }

    this.parallax.update(this.cameras.main.scrollY);

    for (const enemy of this.enemies) {
      enemy.update(delta, this.shield, this.summons);
      if (enemy.isDead && enemy.hp <= 0) {
        const sizeClass = enemySizeClass(enemy.definition);
        const dropAmount = sizeClass === 'boss' ? 10 : (sizeClass === 'miniboss' ? 3 : 1);
        addVoices(this, dropAmount);
      }
    }

    this.enemies = this.enemies.filter(e => !e.isDead);

    for (const hero of this.heroes) {
      hero.update(delta, this.enemies, this.shield.y);
    }
    
    for (const atk of this.attacks) {
      atk.update(_time, delta);
    }
    
    this.attacks = this.attacks.filter(a => !a.isDead);
    this.summons = this.summons.filter(s => !s.isDead);

    if (this.shield.isDead && !this.isSandbox) {
      try { this.sound.play('sfx-defeat'); } catch (e) {}
      this.endBattle('lost');
    }

    this.emitState();
  }

  public endBattle(status: 'won' | 'lost'): void {
    if (this.status !== 'playing') return;
    this.status = status;
    for (const hero of this.heroes) hero.playOutcome(status === 'won' ? 'celebrate' : 'defeat');
    if (status === 'lost') {
      for (const enemy of this.enemies) enemy.playOutcome('celebrate');
    }
  }

  private pauseVisuals(): void {
    if (!this.sys) return;
    const audioCtx = (this.sys.game.sound as any).context;
    if (!audioCtx || audioCtx.state !== 'closed') {
      this.sys.game.sound.pauseAll();
    }
    for (const hero of this.heroes) hero.pauseVisuals();
    for (const enemy of this.enemies) enemy.pauseVisuals();
  }

  private resumeVisuals(): void {
    if (!this.sys) return;
    const audioCtx = (this.sys.game.sound as any).context;
    if (!audioCtx || audioCtx.state !== 'closed') {
      this.sys.game.sound.resumeAll();
    }
    for (const hero of this.heroes) hero.resumeVisuals();
    for (const enemy of this.enemies) enemy.resumeVisuals();
  }

  public syncVisualPauseState(): void {
    if (this.isPaused || this.gameSpeed === 0) {
      this.pauseVisuals();
    } else {
      this.resumeVisuals();
    }
  }

  public processComboQueue() {
    if (this.comboQueue.length === 0) {
      this.isProcessingCombo = false;
      this.comboCount = 0;
      if (this.isPaused) {
        this.isPaused = false;
        this.syncVisualPauseState();
        this.emitState(true);
      }
      return;
    }

    this.isProcessingCombo = true;
    if (!this.isPaused) {
      this.isPaused = true;
      this.syncVisualPauseState();
      this.emitState(true);
    }

    const hero = this.comboQueue.shift()!;
    hero.useSkill();
  }

  public emitState(force = false): void {
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
      doughBarrierActive: this.shield.doughBarrierActive,
      voicesCount: this.voicesCount,
      maxVoicesCount: this.maxVoicesCount,
      waveActive: this.waveActive,
      currentWave: this.currentWave,
      totalWaves: this.totalWaves,
      isPaused: this.isPaused,
      gameSpeed: this.gameSpeed,
      status: this.status,
      activeHeroes: this.heroes.map(h => ({ 
        id: h.id, 
        passiveOverride: h.passiveOverride,
        isSkillReady: h.isSkillReady && !this.comboQueue.includes(h)
      })),
      activeEnemies: activeEnemies,
      skillsLocked: this.isBudgetCutActive,
      shieldScreenYRatio: (this.shield.y - this.cameras.main.scrollY) / this.cameras.main.height
    };
    const serialized = JSON.stringify(snapshot);
    if (!force && serialized === this.lastSnapshot) return;
    this.lastSnapshot = serialized;
    gameToUiEvents.emit('stateChanged', snapshot);
  }
}
