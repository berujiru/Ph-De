import Phaser from 'phaser';
import type { GameScene } from './GameScene';
import { uiToGameEvents } from '../core/GameEvents';
import { type HeroId, HERO_DEFINITIONS } from '../data/heroes';
import { type EnemyId, ENEMY_DEFINITIONS } from '../data/enemies';
import { applyDrop } from './GameSceneDrops';
import { spawnHero, spawnSandboxTarget } from './GameSceneSpawners';
import { Enemy } from '../entities/Enemy';
import { Summon } from '../entities/Summon';
import { type Hero } from '../entities/Hero';
import { cameraPunch } from '../entities/fx/CameraPunch';
import { FX, GAME_WIDTH, GAME_HEIGHT, RALLY, ENEMY_SPAWN_Y_OFFSET } from '../data/level';
import { applyHeroSkill, type SkillVisualEvent } from '../core/Skills';
import { DAMAGE_TYPE_COLORS, type DamageType } from '../core/Damage';
import { attackArtKey, resolveAttackArt, resolveAttackSize } from '../data/attackArt';
import { resolveAttackSpeed } from '../data/attackSpeed';
import {
  Attack,
  ProjectileAttack,
  PierceAttack,
  RollingBlackoutWaveAttack,
  FlushWaveAttack,
  AoeRootFieldAttack,
  AoeFirePatchAttack,
  TornadoAttack,
  TreeOfLifeFieldAttack
} from '../entities/Attacks';
import { TrafficLight } from '../entities/fx/TrafficLight';
import { spawnShockwaveRing } from '../entities/fx/ShockwaveRing';
import { spawnConeFlash } from '../entities/fx/ConeFlash';
import { AreaOverlay } from '../entities/fx/AreaOverlay';

export function setupUIEvents(scene: GameScene): () => void {
  const unsubStart = uiToGameEvents.on('startWave', () => {
    if (!scene.sys) return;
    scene.waveActive = true;
  });

  const unsubSelectDrop = uiToGameEvents.on('selectDrop', ({ dropId }) => {
    if (!scene.sys) return;
    applyDrop(scene, dropId);
    scene.isPaused = false;
    scene.syncVisualPauseState();
    scene.emitState(true);
  });

  const unsubSetSpeed = uiToGameEvents.on('setSpeed', ({ speed }) => {
    if (!scene.sys) return;
    scene.gameSpeed = speed;
    scene.syncVisualPauseState();
    scene.emitState(true);
  });

  const unsubSurrender = uiToGameEvents.on('surrender', () => {
    if (!scene.sys) return;
    scene.endBattle('lost');
    scene.emitState(true);
  });

  const unsubRestart = uiToGameEvents.on('restart', (data) => {
    if (!scene.sys) return;
    scene.isSandbox = data?.mode === 'sandbox';
    if (data?.act != null && data?.stageIdx != null) {
      scene.scene.restart(data);
      return;
    }
    scene.resetGame();
  });

  const unsubDebugSpawn = uiToGameEvents.on('debugSpawn', ({ heroId, passive, skill } = {}) => {
    if (!scene.sys) return;
    for (const h of scene.heroes) {
      if (h.id !== 'eden') {
        h.destroy();
      }
    }
    scene.heroes = scene.heroes.filter(h => h.id === 'eden');

    if (heroId) {
      spawnHero(scene, heroId as HeroId, passive, skill);
    } else {
      const availableIds = Object.keys(HERO_DEFINITIONS) as HeroId[];
      if (availableIds.length > 0) {
        const randomId = Phaser.Math.RND.pick(availableIds);
        spawnHero(scene, randomId);
      }
    }
  });

  const unsubTriggerHeroSkill = uiToGameEvents.on('triggerHeroSkill', ({ skill } = {}) => {
    if (!scene.sys || scene.isBudgetCutActive) return;
    for (const h of scene.heroes) {
      h.isSkillReady = true; 
      h.useSkill(skill);
    }
  });

  const unsubQueueHeroSkill = uiToGameEvents.on('queueHeroSkill', ({ heroId }) => {
    if (!scene.sys || scene.isBudgetCutActive) return;
    const hero = scene.heroes.find(h => h.id === heroId);
    if (hero && hero.isSkillReady && !scene.comboQueue.includes(hero)) {
      scene.comboQueue.push(hero);
      scene.emitState(true);
      if (!scene.isProcessingCombo) {
        scene.comboCount = 0;
        scene.processComboQueue();
      }
    }
  });

  const unsubSpawnSandboxTarget = uiToGameEvents.on('spawnSandboxTarget', () => {
    spawnSandboxTarget(scene);
  });

  const unsubSpawnSpecificEnemy = uiToGameEvents.on('spawnSpecificEnemy', ({ enemyId, passive, skill }) => {
    if (!scene.sys) return;
    const x = Phaser.Math.Between(100, GAME_WIDTH - 100);
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

    const y = scene.cameras.main.scrollY - ENEMY_SPAWN_Y_OFFSET;
    const enemy = new Enemy(scene, x, y, def);
    scene.enemies.push(enemy);
  });

  const unsubTriggerEnemySkill = uiToGameEvents.on('triggerEnemySkill', () => {
    if (!scene.sys) return;
    for (const enemy of scene.enemies) {
      if (!enemy.isDead && enemy.definition.activeSkill) {
        enemy.triggerSkill();
        break; 
      }
    }
  });

  const unsubPlaySound = uiToGameEvents.on('playSound', ({ key }) => {
    if (!scene.sys) return;
    try { scene.sound.play(key); } catch(e) {}
  });

  const unsubApplyAilment = uiToGameEvents.on('applySandboxAilment', ({ ailment, amount }) => {
    if (!scene.sys || scene.enemies.length === 0) return;
    const target = scene.enemies[0];
    target.applyAilmentBuildup(ailment as any, amount);
  });

  return () => {
    unsubStart();
    unsubSelectDrop();
    unsubSetSpeed();
    unsubSurrender();
    unsubRestart();
    unsubDebugSpawn();
    unsubSpawnSandboxTarget();
    unsubSpawnSpecificEnemy();
    unsubTriggerHeroSkill();
    unsubQueueHeroSkill();
    unsubTriggerEnemySkill();
    unsubPlaySound();
    unsubApplyAilment();
  };
}

export function setupInternalEvents(scene: GameScene) {
  scene.events.on('enemyFlood', () => {
    for (const enemy of scene.enemies) {
      enemy.definition.speed *= 2; 
      const flash = scene.add.rectangle(enemy.x, enemy.y, 40, 40, 0x0ea5e9, 0.5);
      scene.tweens.add({
        targets: flash,
        scale: 3,
        alpha: 0,
        duration: 500,
        onComplete: () => flash.destroy()
      });
    }
  });

  scene.events.on('enemyDeathSplit', ({ source, count }: { source: Enemy, count: number }) => {
    for (let i = 0; i < count; i++) {
      const offsetX = (Math.random() - 0.5) * 40;
      const offsetY = (Math.random() - 0.5) * 40;
      const def = { ...ENEMY_DEFINITIONS['grunt'] }; 
      def.name = 'Dummy Corp';
      def.color = source.definition.color;
      const enemy = new Enemy(scene, source.x + offsetX, source.y + offsetY, def);
      scene.enemies.push(enemy);
    }
  });

  scene.events.on('enemyDeathDropObstacle', ({ source }: { source: Enemy }) => {
    const barricadeDef = { name: 'Hoarder Junk', hp: 150, color: 0xca8a04 };
    const summon = new Summon(scene, source.x, source.y, barricadeDef.hp, barricadeDef.color);
    scene.summons.push(summon);
  });

  scene.events.on('stealVoices', ({ amount }: { amount: number }) => {
    scene.voicesCount = Math.max(0, scene.voicesCount - amount);
    scene.emitState();
  });

  scene.events.on('heroKnockback', ({ source, force }: { source: Enemy, force: number }) => {
    for (const hero of scene.heroes) {
      if (Phaser.Math.Distance.Between(source.x, source.y, hero.x, hero.y) < 200) {
        hero.x -= force;
        scene.tweens.add({ targets: hero, x: hero.x - 20, yoyo: true, duration: 150 });
      }
    }
  });

  scene.events.on('moraleAura', ({ source, range }: { source: Enemy, range: number }) => {
    for (const enemy of scene.enemies) {
      if (enemy !== source && !enemy.isDead) {
        if (Phaser.Math.Distance.Between(source.x, source.y, enemy.x, enemy.y) < range) {
          enemy.definition.speed *= 1.2;
          const flash = scene.add.rectangle(enemy.x, enemy.y, 20, 20, 0xf97316, 0.5);
          scene.tweens.add({ targets: flash, scale: 2, alpha: 0, duration: 200, onComplete: () => flash.destroy() });
          
          scene.time.delayedCall(1000, () => {
            enemy.definition.speed /= 1.2;
          });
        }
      }
    }
  });

  scene.events.on('enemySummonSwarm', ({ source }: { source: Enemy }) => {
    for (let i = 0; i < 3; i++) {
      const y = source.y + (Math.random() - 0.5) * 60;
      const enemy = new Enemy(scene, source.x + 30, y, ENEMY_DEFINITIONS['grunt']);
      scene.enemies.push(enemy);
    }
  });

  scene.events.on('enemySummonShieldbearer', ({ source }: { source: Enemy }) => {
    const enemy = new Enemy(scene, source.x + 40, source.y, ENEMY_DEFINITIONS['the_overpriced']);
    scene.enemies.push(enemy);
  });

  scene.events.on('enemyScatterFakeGold', ({ source }: { source: Enemy }) => {
    for (let i = 0; i < 3; i++) {
      const x = source.x - 50 - Math.random() * 100;
      const y = source.y + (Math.random() - 0.5) * 100;
      
      const coin = scene.add.circle(x, y, 10, 0xeab308).setInteractive();
      const text = scene.add.text(x, y, '$', { color: '#000', fontSize: '10px' }).setOrigin(0.5);
      
      scene.add.group([coin, text]);
      
      coin.on('pointerdown', () => {
        scene.voicesCount = Math.max(0, scene.voicesCount - 2);
        scene.emitState();
        
        const txt = scene.add.text(x, y - 20, '-2 VOICES!', { color: '#ef4444', fontStyle: 'bold' }).setOrigin(0.5);
        scene.tweens.add({ targets: txt, y: y - 50, alpha: 0, duration: 1000, onComplete: () => txt.destroy() });
        
        coin.destroy();
        text.destroy();
      });
      
      scene.time.delayedCall(5000, () => {
        if (coin.active) {
          coin.destroy();
          text.destroy();
        }
      });
    }
  });

  scene.events.on('enemySmuggleHp', ({ source }: { source: Enemy }) => {
    const def = { ...ENEMY_DEFINITIONS['the_overpriced'] };
    def.fakeHpPadding = 1000;
    def.maxHp = 10; 
    def.name = 'Smuggled Budget';
    def.color = 0x14b8a6;
    
    const x = Math.random() > 0.5 ? 50 : GAME_WIDTH - 50; 
    const enemy = new Enemy(scene, x, source.y, def);
    scene.enemies.push(enemy);
  });

  scene.events.on('enemyEconomyHeist', () => {
    scene.voicesCount = Math.max(0, scene.voicesCount - 5);
    scene.emitState();
    const txt = scene.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'HEIST! -5 VOICES', { color: '#ef4444', fontStyle: 'bold', fontSize: '24px' }).setOrigin(0.5).setScrollFactor(0);
    scene.tweens.add({ targets: txt, y: GAME_HEIGHT / 2 - 100, alpha: 0, duration: 2000, onComplete: () => txt.destroy() });
  });

  scene.events.on('bossPhaseShift', ({ source, nextPhaseId }: { source: Enemy, nextPhaseId: EnemyId }) => {
    const def = ENEMY_DEFINITIONS[nextPhaseId];
    if (def) {
      const enemy = new Enemy(scene, source.x, source.y, def);
      scene.enemies.push(enemy);
      const txt = scene.add.text(source.x, source.y - 40, 'PHASE SHIFT!', { color: '#d946ef', fontStyle: 'bold' }).setOrigin(0.5);
      scene.tweens.add({ targets: txt, y: source.y - 80, alpha: 0, duration: 1500, onComplete: () => txt.destroy() });
    }
  });

  scene.events.on('resurrectAll', ({ source }: { source: Enemy }) => {
    const bosses: EnemyId[] = ['boss_pork_barrel', 'boss_dynasty_3', 'boss_troll_farm'];
    bosses.forEach((id, idx) => {
      const def = { ...ENEMY_DEFINITIONS[id] };
      def.maxHp = Math.floor(def.maxHp * 0.25); 
      def.name = def.name + ' (Resurrected)';
      const y = source.y + (idx - 1) * 60;
      const enemy = new Enemy(scene, source.x + 50, y, def);
      scene.enemies.push(enemy);
    });
  });

  scene.events.on('heroSkillTriggered', ({ hero, skillId }: { hero: Hero, skillId: HeroId }) => {
    cameraPunch(scene, FX.cameraShake.skillCast, true);

    scene.comboCount++;
    const isCombo = scene.comboCount > 1;

    scene.skillCutIn.play({
      skillName: isCombo ? `${hero.definition.signatureSkill.name}\nCOMBO x${scene.comboCount}!` : hero.definition.signatureSkill.name,
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
        if (!scene.sys) return;
        hero.playCast();
        
        applyHeroSkill(skillId, hero, {
          GAME_WIDTH,
          GAME_HEIGHT: scene.cameras.main.scrollY + GAME_HEIGHT,
          heroes: scene.heroes,
          enemies: scene.enemies,
          onVisual: (evt: SkillVisualEvent) => {
            handleSkillVisualEffect(scene, evt);
          }
        });
        
        scene.processComboQueue();
      },
    });
  });
}

export function handleSkillVisualEffect(scene: GameScene, evt: SkillVisualEvent) {
  if (evt.type === 'text') {
    const fx = scene.add.text(evt.x || 0, evt.y || 0, evt.text || '', { color: evt.color || '#fff', fontStyle: 'bold' }).setOrigin(0.5);
    scene.tweens.add({ targets: fx, y: (evt.y || 0) - 30, alpha: 0, duration: 1000, onComplete: () => fx.destroy() });
  } else if (evt.type === 'dragTo') {
    const tweenProps: any = { targets: evt.target, x: evt.x, duration: evt.duration || 500, delay: evt.delay || 0 };
    if (evt.y !== undefined) tweenProps.y = evt.y;
    scene.tweens.add(tweenProps);
  } else if (evt.type === 'spawnObstacle') {
    const block = scene.add.rectangle(evt.x, evt.y, evt.width, evt.height, parseInt((evt.color || '#000').replace('#', '0x')));
    scene.time.delayedCall(evt.duration || 5000, () => block.destroy());
  } else if (evt.type === 'spawnTrap') {
    const trap = scene.add.circle(evt.x, evt.y, evt.radius, parseInt((evt.color || '#000').replace('#', '0x')));
    scene.time.delayedCall(evt.duration || 3000, () => trap.destroy());
  } else if (evt.type === 'screenFlash') {
    const blackout = scene.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, parseInt((evt.color || '#000').replace('#', '0x')), evt.alpha || 0.5).setScrollFactor(0);
    scene.time.delayedCall(evt.duration || 3000, () => blackout.destroy());
  } else if (evt.type === 'spawnRider') {
    // 1. Create a bike model using the loaded SVG asset
    const rider = scene.add.image(evt.x, evt.y, 'kamote_rider');
    rider.setScale(1);

    const hitEnemies = new Set();
    const hitRadius = evt.hitRadius || 40;
    const knockback = evt.knockback || 200;

    // 2. Play delay then charge
    scene.time.delayedCall(evt.delay || 500, () => {
      scene.tweens.add({
        targets: rider,
        y: evt.targetY,
        duration: evt.duration || 1000,
        ease: 'Linear',
        onUpdate: () => {
          // Trail effect: spawn a fading exhaust rectangle at current position
          const trail = scene.add.rectangle(rider.x, rider.y + 15, 8, 8, 0x94a3b8, 0.6);
          scene.tweens.add({
            targets: trail,
            alpha: 0,
            scale: 2,
            duration: 400,
            onComplete: () => trail.destroy()
          });

          // Collision detection during the sweep
          for (const e of scene.enemies) {
            if (!e.isDead && !hitEnemies.has(e)) {
              if (Math.abs(e.x - rider.x) < hitRadius && Math.abs(e.y - rider.y) < hitRadius) {
                hitEnemies.add(e);
                e.takeDamage(evt.damage || 10);
                
                // Knockback effect
                if (!e.isDead) {
                  scene.tweens.add({
                    targets: e,
                    // Push up (lower Y value)
                    y: e.y - knockback,
                    duration: 200,
                    ease: 'Cubic.easeOut'
                  });
                }
              }
            }
          }
        },
        onComplete: () => {
          rider.destroy();
        }
      });
    });
  } else if (evt.type === 'projectileVolley') {
    const h = evt.hero as Hero;
    // Same art as the hero's basic attack; tint follows the per-shot random type.
    const visual = {
      artKey: attackArtKey(resolveAttackArt(h.definition)),
      tint: DAMAGE_TYPE_COLORS[evt.damageType as DamageType] || 0xffffff,
      sizePx: resolveAttackSize(h.definition),
    };

    const volleySpeed = resolveAttackSpeed(h.definition);

    let attack: Attack;
    if (h.definition.attackStyle === 'pierce') {
      attack = new PierceAttack(scene, h.muzzleX, h.muzzleY, evt.target, h.damage, visual, volleySpeed, h.definition.basePierce ?? 1, h.modifiers, evt.damageType as any);
    } else {
      attack = new ProjectileAttack(scene, h.muzzleX, h.muzzleY, evt.target, h.damage, visual, volleySpeed, h.modifiers, evt.damageType as any);
    }
    
    scene.attacks.push(attack);
  } else if (evt.type === 'healShield') {
    scene.healShield(evt.amount);
    if (scene.shield) {
        scene.shield.playHealVisual();
    }
  } else if (evt.type === 'rollingBlackoutWave') {
    const attack = new RollingBlackoutWaveAttack(scene, scene.shield.y, evt.damage, 0x38bdf8);
    scene.attacks.push(attack);
  } else if (evt.type === 'flushWave') {
    const attack = new FlushWaveAttack(scene, scene.shield.y, evt.damage, evt.numWaves, evt.knockback);
    scene.attacks.push(attack);
  } else if (evt.type === 'expandingCircle') {
    const baseColor = Phaser.Display.Color.HexStringToColor(evt.color).color;
    spawnShockwaveRing(scene, {
      x: evt.x, y: evt.y,
      color: baseColor,
      startRadius: 10,
      endRadius: evt.maxRadius,
      rings: 4,
      ringDelayMs: 150,
      durationMs: evt.duration * 1.2,
      fillAlpha: 0.15,
      strokeWidth: 8,
      strokeWidthStep: 1.5,
      strokeAlpha: 0.8,
      blendMode: Phaser.BlendModes.ADD,
      ease: 'Sine.easeOut',
    });
  } else if (evt.type === 'trafficLights') {
    const startY = RALLY.shieldStartY - 20;
    const endY = scene.cameras.main.scrollY + 100;
    const numRows = 8;
    const stepY = (startY - endY) / (numRows - 1);
    
    for (let i = 0; i < numRows; i++) {
      const y = startY - (i * stepY);
      new TrafficLight(scene, 30, y, evt.duration);
      new TrafficLight(scene, GAME_WIDTH - 30, y, evt.duration);
    }
  } else if (evt.type === 'coinShrapnelCone') {
    const hero = evt.hero;
    const length = evt.length;
    const angle = evt.angle;
    const spreadAngle = Math.PI / 6;

    spawnConeFlash(scene, {
      x: hero.x, y: hero.y,
      angle, length,
      color: 0x10b981, alpha: 0.1,
      fadeMs: 300, ease: 'Power2',
    });

    // Coin shrapnel scattering inside the cone — unique to this skill.
    const startX = hero.x + Math.cos(angle) * 20;
    const startY = hero.y + Math.sin(angle) * 20;
    for (let i = 0; i < 12; i++) {
      const pAngle = angle + (Math.random() * spreadAngle * 2) - spreadAngle;
      const travelDuration = 250 + Math.random() * 150; 
      const lingerDuration = 2000 + Math.random() * 1000;
      const distanceMultiplier = 0.4 + Math.random() * 0.6; 
      const isGold = Math.random() > 0.5;
      
      const coin = scene.add.circle(startX, startY, 6, isGold ? 0xfacc15 : 0x94a3b8);
      
      scene.tweens.add({
        targets: coin,
        x: startX + Math.cos(pAngle) * (length * distanceMultiplier),
        y: startY + Math.sin(pAngle) * (length * distanceMultiplier),
        duration: travelDuration,
        ease: 'Cubic.easeOut',
        onComplete: () => {
          scene.tweens.add({
            targets: coin,
            alpha: 0,
            duration: 500,
            delay: lingerDuration,
            onComplete: () => coin.destroy()
          });
        }
      });
    }
  } else if (evt.type === 'flashlightCone') {
    spawnConeFlash(scene, {
      x: evt.hero.x, y: evt.hero.y,
      angle: evt.angle, length: evt.length,
      color: 0xfffbeb, alpha: 0.4,
      fadeMs: evt.duration, ease: 'Quad.easeIn',
    });
  } else if (evt.type === 'aoeRoot') {
    const attack = new AoeRootFieldAttack(scene, evt.x, evt.y, evt.radius, evt.duration, evt.damage);
    scene.attacks.push(attack);
  } else if (evt.type === 'spawnMolotovPatch') {
    // 1. Arc animation
    const molotov = scene.add.image(evt.startX, evt.startY, 'molotov');
    molotov.setOrigin(0.5, 0.5);
    molotov.setScale(0.8); // Scale up visual as requested

    const dx = evt.targetX - evt.startX;
    const controlX = evt.startX + dx / 2;
    const controlY = Math.min(evt.startY, evt.targetY) - 150; // arc height

    const curve = new Phaser.Curves.QuadraticBezier(
      new Phaser.Math.Vector2(evt.startX, evt.startY),
      new Phaser.Math.Vector2(controlX, controlY),
      new Phaser.Math.Vector2(evt.targetX, evt.targetY)
    );

    const pathData = { t: 0 };
    scene.tweens.add({
      targets: pathData,
      t: 1,
      duration: 600,
      ease: 'Sine.easeIn',
      onUpdate: () => {
        const p = curve.getPoint(pathData.t);
        molotov.setPosition(p.x, p.y);
        molotov.rotation += 0.1;
      },
      onComplete: () => {
        molotov.destroy();
        
        // 2. Splash visual
        spawnShockwaveRing(scene, {
          x: evt.targetX, y: evt.targetY,
          color: 0xff4500,
          startRadius: evt.radius * 0.3,
          endRadius: evt.radius * 0.6,
          fillAlpha: 0.8,
          strokeWidth: 0,
          durationMs: 300,
          ease: 'Linear',
        });

        // 3. Spawn actual DoT patch
        const attack = new AoeFirePatchAttack(scene, evt.targetX, evt.targetY, evt.radius, evt.duration, evt.damage);
        scene.attacks.push(attack);
      }
    });
  } else if (evt.type === 'spawnTornado') {
    const attack = new TornadoAttack(scene, evt.x, evt.y, evt.damage, evt.pullRadius, evt.duration, evt.speed);
    scene.attacks.push(attack);
  } else if (evt.type === 'spawnTreeOfLife') {
    const attack = new TreeOfLifeFieldAttack(scene, evt.x, evt.y, evt.radius, evt.duration, evt.damage);
    scene.attacks.push(attack);
  } else if (evt.type === 'spawnLambatVortex') {
    // Hold size for pullDelay, then shrink to 0 over pullDuration.
    new AreaOverlay(scene, {
      x: evt.x, y: evt.y,
      radius: 0, // pure SVG overlay, no disc
      svgKey: 'lambat_vortex',
      svgScale: evt.scale || 2.5,
      exit: { mode: 'shrink', durationMs: evt.pullDuration, delayMs: evt.pullDelay, ease: 'Sine.easeIn' },
    });
  } else if (evt.type === 'spawnDoughBarrier') {
    scene.shield.doughBarrierActive = true;
    scene.time.delayedCall(evt.duration, () => {
      scene.shield.doughBarrierActive = false;
    });
  } else if (evt.type === 'applyAilment') {
    if (evt.delay) {
      scene.time.delayedCall(evt.delay, () => {
        if (evt.target && !evt.target.isDead && typeof evt.target.applyAilment === 'function') {
          evt.target.applyAilment(evt.ailment, evt.amount, evt.duration);
        }
      });
    } else {
      if (evt.target && !evt.target.isDead && typeof evt.target.applyAilment === 'function') {
        evt.target.applyAilment(evt.ailment, evt.amount, evt.duration);
      }
    }
  }
}
