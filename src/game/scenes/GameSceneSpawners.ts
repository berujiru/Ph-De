import Phaser from 'phaser';
import type { GameScene } from './GameScene';
import { Enemy } from '../entities/Enemy';
import { Hero } from '../entities/Hero';
import { ENEMY_DEFINITIONS, type EnemyId } from '../data/enemies';
import { HERO_DEFINITIONS, type HeroId } from '../data/heroes';
import { waveStatMultipliers } from '../data/waves';
import { formationTargetY } from '../core/RallyMarch';
import { getSelectedSkin } from '../data/skinSelection';
import { GAME_WIDTH, ENEMY_SPAWN_Y_OFFSET, RALLY } from '../data/level';
import {
  Attack,
  ProjectileAttack,
  PierceAttack,
  MeleeCleaveAttack,
  VortexAttack,
  BoomerangAttack,
  ChainAttack,
  SummonAttack,
  BeamAttack,
  LobbedAttack,
  LinearWaveAttack,
  TrapAttack
} from '../entities/Attacks';
import { DAMAGE_TYPE_COLORS, type DamageType } from '../core/Damage';
import { attackArtKey, resolveAttackArt, resolveAttackSize } from '../data/attackArt';
import { resolveAttackSpeed } from '../data/attackSpeed';
import { gameToUiEvents } from '../core/GameEvents';

export function spawnEnemy(scene: GameScene, enemyId: EnemyId = 'grunt', wave: number = 1) {
  // Scatter across the lane (X); spawn just above the visible top of the
  // screen so enemies enter from the top edge of what the player sees.
  const x = Phaser.Math.Between(50, GAME_WIDTH - 50);
  const y = scene.cameras.main.scrollY - ENEMY_SPAWN_Y_OFFSET;
  
  const def = { ...ENEMY_DEFINITIONS[enemyId] };
  const mult = waveStatMultipliers(wave);
  
  // Bosses are authored at wave-20 power, minion stats scale up.
  if (!def.id.startsWith('boss_')) {
    def.maxHp = Math.round(def.maxHp * mult.hp);
    def.damage = Math.round(def.damage * mult.damage);
    def.speed = def.speed * mult.speed;
  }
  
  const enemy = new Enemy(scene, x, y, def);
  scene.enemies.push(enemy);

  if (!scene.isSandbox && !scene.seenEnemies.has(enemyId)) {
    scene.seenEnemies.add(enemyId);
    gameToUiEvents.emit('enemyEncountered', { enemyId });
  }
}

export function spawnSandboxTarget(scene: GameScene) {
  if (!scene.sys) return;
  const x = GAME_WIDTH / 2 + (Math.random() - 0.5) * 100;
  // Above the shield so heroes can shoot up at it, within the static sandbox view.
  const dummy = new Enemy(scene, x, scene.shield.y - 450, ENEMY_DEFINITIONS['sandbox_target']);
  scene.enemies.push(dummy);
}

export function spawnHero(scene: GameScene, id: HeroId, passiveOverride?: string, _skillOverride?: string) {
  // Spread heroes horizontally across the lane to prevent overlapping (center out)
  const offset = scene.heroes.length === 0 ? 0 : (scene.heroes.length % 2 === 0 ? 1 : -1) * Math.ceil(scene.heroes.length / 2) * RALLY.formation.rowSpacingPx;
  const x = GAME_WIDTH / 2 + offset;
  const def = HERO_DEFINITIONS[id];

  // Heroes join directly at their formation slot behind (below) the shield.
  const y = formationTargetY(scene.shield.y, { attackKind: def.attackKind, rangePx: def.range }, RALLY.formation);

  const hero = new Hero(scene, x, y, def, (h, target, overrideDamageType, overrideColor) => {
    let attack: Attack;
    let damageType = overrideDamageType ?? h.definition.damageType;

    // During Cramming (indicated by student having cramming buff), attacks become randomized elemental!
    if (h.id === 'student' && h.activeBuffs['cramming']) {
      const elements: DamageType[] = ['Physical', 'Magic', 'Fire', 'Frost', 'Lightning', 'Water', 'Wind', 'Earth', 'Holy', 'Dark'];
      damageType = elements[Math.floor(Math.random() * elements.length)];
    }

    // Tint = damage-type color; art = the hero's attackArt (or style default),
    // authored white/grayscale so the tint colors it cleanly.
    const tint = overrideColor ?? DAMAGE_TYPE_COLORS[damageType as DamageType];
    const visual = { artKey: attackArtKey(resolveAttackArt(h.definition)), tint, sizePx: resolveAttackSize(h.definition) };
    // Per-hero projectile flight speed (style default when unset).
    const speed = resolveAttackSpeed(h.definition);
    // Persisted per-hero upgrade mods land on every Attack this hero spawns.
    const mods = h.modifiers;

    if (h.definition.attackStyle === 'melee-cleave') {
      attack = new MeleeCleaveAttack(scene, h.x, h.y, target, h.damage, h.range, visual, mods, damageType);
    } else if (h.definition.attackStyle === 'vortex') {
      attack = new VortexAttack(scene, h.x, h.y, target, h.damage, visual, mods, damageType);
    } else if (h.definition.attackStyle === 'boomerang') {
      attack = new BoomerangAttack(scene, h, target, h.damage, visual, speed, mods, damageType);
      h.playProjectileLaunch();
    } else if (h.definition.attackStyle === 'chain') {
      attack = new ChainAttack(scene, h.muzzleX, h.muzzleY, target, h.damage, visual, h.definition.baseChain ?? 1, mods, damageType);
    } else if (h.definition.attackStyle === 'summoner') {
      attack = new SummonAttack(scene, h.x, h.y, target, h.damage, visual, mods);
    } else if (h.definition.attackStyle === 'beam') {
      attack = new BeamAttack(scene, h.muzzleX, h.muzzleY, target, h.damage, visual, h.range, mods, damageType);
    } else if (h.definition.attackStyle === 'lobbed') {
      attack = new LobbedAttack(scene, h.muzzleX, h.muzzleY, target, h.damage, visual, speed, mods, damageType);
      h.playProjectileLaunch();
    } else if (h.definition.attackStyle === 'linear-wave') {
      attack = new LinearWaveAttack(scene, target.x, h.muzzleY, h.damage, visual, speed, h.range, mods, damageType);
    } else if (h.definition.attackStyle === 'trap') {
      attack = new TrapAttack(scene, h.x, h.y, target, h.damage, visual, mods, damageType);
    } else if (h.definition.attackStyle === 'pierce') {
      // Non-homing straight-line shot; pass-throughs = basePierce + bonusPierce.
      attack = new PierceAttack(scene, h.muzzleX, h.muzzleY, target, h.damage, visual, speed, h.definition.basePierce ?? 1, mods, damageType);
      h.playProjectileLaunch();
    } else {
      // Plain projectile — homes, expires on first hit (+bonusPierce).
      attack = new ProjectileAttack(scene, h.muzzleX, h.muzzleY, target, h.damage, visual, speed, mods, damageType);
      h.playProjectileLaunch();
    }

    scene.attacks.push(attack);
  }, getSelectedSkin(id)?.id); // equipped skin drives which sheet the model renders

  if (passiveOverride) {
    hero.passiveOverride = passiveOverride;
  }

  if (scene.isSandbox) {
    hero.isSkillReady = true;
  }

  scene.heroes.push(hero);
}
