import Phaser from 'phaser';
import { MoraleShield } from '../entities/MoraleShield';
import { Hero } from '../entities/Hero';
import { Enemy } from '../entities/Enemy';
import { Summon } from '../entities/Summon';
import { Attack } from '../entities/Attacks';
import { gameToUiEvents, markRallyReady, setRallyLoadProgress, type GameStateSnapshot } from '../core/GameEvents';
import { BARRICADE_DEFAULTS } from '../data/constants';
import { enemySizeClass } from '../data/enemies';
import { voiceDropCost } from '../data/drops';
import { type HeroId, HERO_DEFINITIONS } from '../data/heroes';
import { allAttackArtStems, attackArtKey, attackArtPath } from '../data/attackArt';
import { preloadAudio, SFX, MUSIC, bossThemeForAct } from '../data/soundRegistry';
import { AudioManager } from '../core/AudioManager';
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
  private rallyStage?: Phaser.GameObjects.Image;
  public activeMapSkin: MapSkin | null = null;
  public currentAct: number | null = null;
  public currentStageIdx: number | null = null;
  public enemies: Enemy[] = [];
  public seenEnemies: Set<string> = new Set();
  
  public budgetCutTargetHero: Hero | null = null;
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

  /** True while a boss theme is playing — flips the boss-only BGM on/off. */
  private bossMusicActive = false;

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
    // Relay Phaser loader progress to the rally loading overlay. Registered
    // BEFORE any file is queued so no early progress tick is missed. On a warm
    // restart every asset is cached and the loader may process 0 files (and
    // thus never emit 'progress'), so 'complete' force-fills the bar — the
    // actual reveal is gated on the build finishing (markRallyReady in create).
    this.load.on('progress', (value: number) => setRallyLoadProgress(value));
    this.load.once('complete', () => setRallyLoadProgress(1));

    // Audio: register every available sound file (data-driven, same pattern as
    // the art loops below). Keys not yet backed by a real file are simply skipped.
    preloadAudio(this);

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
    this.load.spritesheet('grunt', '/assets/enemies/minion_grunt_sprite.png', {
      frameWidth: 256,
      frameHeight: 256,
    });
    this.load.spritesheet('runner', '/assets/enemies/minion_runner_sprite.png', {
      frameWidth: 256,
      frameHeight: 256,
    });
    this.load.spritesheet('brute', '/assets/enemies/brute_sheet.png', {
      frameWidth: 256,
      frameHeight: 256,
    });
    this.load.spritesheet('bribery', '/assets/enemies/bribery_sprite.png', {
      frameWidth: 256,
      frameHeight: 256,
    });
    this.load.spritesheet('crony_bodyguard', '/assets/enemies/crony_sprite.png', {
      frameWidth: 256,
      frameHeight: 256,
    });
    this.load.spritesheet('epal', '/assets/enemies/epal_sprite.png', {
      frameWidth: 256,
      frameHeight: 256,
    });
    this.load.spritesheet('ghost_employee', '/assets/enemies/ghost_employee_sprite.png', {
      frameWidth: 256,
      frameHeight: 256,
    });
    this.load.spritesheet('hoarder', '/assets/enemies/hoarder_sprite.png', {
      frameWidth: 256,
      frameHeight: 256,
    });
    this.load.spritesheet('land_grabber', '/assets/enemies/land_grabber_sprite.png', {
      frameWidth: 256,
      frameHeight: 256,
    });
    this.load.spritesheet('red_tape', '/assets/enemies/red_tape_sprite.png', {
      frameWidth: 256,
      frameHeight: 256,
    });
    this.load.spritesheet('boss_flood_control', '/assets/enemies/ghost_flood_control.png', {
      frameWidth: 256,
      frameHeight: 256,
    });
    this.load.spritesheet('boss_budget_insertion', '/assets/enemies/budget_insertion_sprite.png', {
      frameWidth: 720,
      frameHeight: 1280,
    });
    this.load.spritesheet('boss_smuggling', '/assets/enemies/smuggling_sprite.png', {
      frameWidth: 256,
      frameHeight: 256,
    });
    this.load.spritesheet('boss_ang_sistema', '/assets/enemies/sistema_sprite.png', {
      frameWidth: 256,
      frameHeight: 256,
    });
    this.load.spritesheet('boss_troll_farm', '/assets/enemies/boss_troll_farm.png', {
      frameWidth: 256,
      frameHeight: 256,
    });
    this.load.spritesheet('boss_wang_wang', '/assets/enemies/wang_wang_sprite.png', {
      frameWidth: 256,
      frameHeight: 256,
    });
    this.load.spritesheet('boss_dynasty', '/assets/enemies/dynasty_sprite.png', {
      frameWidth: 256,
      frameHeight: 256,
    });
    this.load.spritesheet('boss_pork_barrel', '/assets/enemies/pork_barrel_sprite.png', {
      frameWidth: 256,
      frameHeight: 256,
    });
    this.load.spritesheet('boss_vote_buying', '/assets/enemies/vote_buying_sprite.png', {
      frameWidth: 256,
      frameHeight: 256,
    });
    this.load.spritesheet('boss_nepotism', '/assets/enemies/nepotism_sprite.png', {
      frameWidth: 256,
      frameHeight: 256,
    });
    this.load.image('rally-stage', '/assets/fx/rally_stage.svg');
    this.load.image('kamote_rider', '/assets/fx/kamote_rider.svg');
    this.load.image('water_wave', '/assets/fx/water_wave.svg');
    this.load.image('tornado', '/assets/fx/tornado.svg');
    this.load.image('molotov', '/assets/fx/molotov.svg');
    this.load.image('dough-barrier', '/assets/fx/dough-barrier.svg');
    this.load.image('lambat_vortex', '/assets/fx/lambat_vortex.svg');
    this.load.image('tree_of_life', '/assets/fx/tree_of_life.svg');
    this.load.image('boss_aura', '/assets/fx/boss_aura.svg');
    this.load.image('barrier_wall', '/assets/fx/barrier_wall.svg');

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
      
      // Load UI portrait for mini-card (fallback handled if missing). Sandbox
      // test units ship no portrait art, so skip them — otherwise Phaser's
      // loader logs a "Failed to process file" 404 for each on every rally.
      if (!heroId.startsWith('sandbox_')) {
        const uiPortraitKey = `${heroId}_ui_portrait`;
        this.load.image(uiPortraitKey, `/assets/heroes/${heroId}_portrait.png`);
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

    this.cleanupUIEvents = setupUIEvents(this);
    const cleanupInternalEvents = setupInternalEvents(this);

    const cleanup = () => {
      if (this.cleanupUIEvents) {
        this.cleanupUIEvents();
        this.cleanupUIEvents = undefined;
      }
      cleanupInternalEvents();
    };

    this.events.once('shutdown', cleanup);
    this.events.once('destroy', cleanup);
  }

  /** Destroy every battlefield entity + visual. Safe to call twice (empties the
   *  arrays and Phaser's destroy() no-ops on already-destroyed objects). */
  private teardownRally(): void {
    for (const e of this.enemies) e.destroy();
    for (const h of this.heroes) h.destroy();
    for (const a of this.attacks) a.destroy();
    for (const s of this.summons) s.destroy();
    for (const b of this.barriers) b.destroy();
    for (const t of this.traps) t.destroy();
    for (const aoe of this.persistentAoe) aoe.destroy();
    if (this.parallax) this.parallax.destroy();
    if (this.rallyStage) this.rallyStage.destroy();
    if (this.shield) this.shield.destroy();
    if (this.rouletteHighlighter) this.rouletteHighlighter.destroy();
    this.enemies = [];
    this.heroes = [];
    this.attacks = [];
    this.summons = [];
    this.barriers = [];
    this.traps = [];
    this.persistentAoe = [];
  }

  public resetGame(): void {
    this.teardownRally();

    // Clear the boss flag so it re-arms; the incoming rally music (started in
    // the restart handler) crossfades out any lingering boss theme.
    this.bossMusicActive = false;

    this.buildGame();
  }

  /**
   * Wipe the current rally and leave the battlefield empty — called when the
   * player surrenders or exits to a menu. Nothing lingers behind the UI, and
   * the rally can't be resumed: the only way back into a fight is a fresh
   * deploy (restart → buildGame). Idempotent, so repeated menu navigation is
   * safe.
   */
  public clearGame(): void {
    // Freeze the update loop FIRST (its very first line bails on isPaused) so it
    // can never touch the objects we're about to destroy. status guards too.
    this.isPaused = true;
    this.status = 'lost';
    this.waveActive = false;
    // Boss theme (if any) is crossfaded to the menu ambience by the caller
    // (App's currentView effect), so no explicit stopMusic here — that would
    // restart the ambience on every menu-to-menu navigation.
    this.bossMusicActive = false;
    this.teardownRally();
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
    
    this.waveManager = new WaveManager(buildWaveTable(bossForStage(this.currentAct, this.currentStageIdx), this.currentAct, this.currentStageIdx), INTER_WAVE_DELAY_MS);
    this.dropIndex = 0;
    this.dropRollSeed = 0;
    this.maxVoicesCount = voiceDropCost(0, this.totalWaves);
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

    // Rally stage the heroes stand on — spans the formation band just behind
    // (below) the shield front. Above the parallax, below every unit.
    this.rallyStage = this.add.image(GAME_WIDTH / 2, RALLY.shieldStartY + 150, 'rally-stage');
    this.rallyStage.setDepth(-5);

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

    // The rally is fully built and every asset it touched is decoded (on the
    // scene.restart path create() — and thus this — runs only after the preload
    // loader completes). Latch readiness so the loading overlay can reveal.
    // Covers both build paths: fresh create() AND the sandbox resetGame().
    markRallyReady();
  }

  update(_time: number, delta: number): void {
    if (this.isPaused) return;

    const hasBudgetCut = this.enemies.some(e => !e.isDead && e.definition.budgetCut);
    if (hasBudgetCut) {
      if (!this.budgetCutTargetHero || !this.heroes.includes(this.budgetCutTargetHero)) {
        if (this.heroes.length > 0) {
          const randomIndex = Math.floor(Math.random() * this.heroes.length);
          this.budgetCutTargetHero = this.heroes[randomIndex];
        } else {
          this.budgetCutTargetHero = null;
        }
      }
    } else {
      this.budgetCutTargetHero = null;
    }

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
          AudioManager.playSfx(SFX.victory);
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

    // Boss-only BGM: fade the boss theme in while any boss is alive, out when
    // the last one falls. (Only bosses get background music by design.)
    this.updateBossMusic();

    for (const hero of this.heroes) {
      hero.update(delta, this.enemies, this.shield.y);
    }
    
    for (const atk of this.attacks) {
      atk.update(_time, delta);
    }
    
    this.attacks = this.attacks.filter(a => !a.isDead);
    this.summons = this.summons.filter(s => !s.isDead);

    if (this.shield.isDead && !this.isSandbox) {
      AudioManager.playSfx(SFX.defeat);
      this.endBattle('lost');
    }

    this.emitState();
  }

  /**
   * Starts the boss theme when a boss enters and stops it when none remain
   * alive. `this.enemies` holds only living enemies here (dead ones are already
   * filtered out), so a simple presence check drives the fade both ways.
   */
  private updateBossMusic(): void {
    const hasBoss = this.enemies.some((e) => e.definition.id.startsWith('boss_'));
    if (hasBoss && !this.bossMusicActive) {
      this.bossMusicActive = true;
      AudioManager.playMusic(bossThemeForAct(this.currentAct), { loop: true, fadeMs: 1200 });
    } else if (!hasBoss && this.bossMusicActive) {
      this.bossMusicActive = false;
      // Boss down — fall back to the default rally bed rather than going silent.
      AudioManager.playMusic(MUSIC.battle, { loop: true, fadeMs: 1500 });
    }
  }

  public endBattle(status: 'won' | 'lost'): void {
    if (this.status !== 'playing') return;
    this.status = status;
    // No more fight — let any boss theme fade out.
    this.bossMusicActive = false;
    AudioManager.stopMusic(1000);
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
        isSkillReady: h.isSkillReady && !this.comboQueue.includes(h),
        isSkillLocked: this.budgetCutTargetHero === h
      })),
      activeEnemies: activeEnemies,
      shieldScreenYRatio: (this.shield.y - this.cameras.main.scrollY) / this.cameras.main.height
    };
    const serialized = JSON.stringify(snapshot);
    if (!force && serialized === this.lastSnapshot) return;
    this.lastSnapshot = serialized;
    gameToUiEvents.emit('stateChanged', snapshot);
  }
}
