import type { GameScene } from './GameScene';
import { MAX_ACTIVE_HEROES, GLOBAL_DROP_DEFS, UPGRADE_DEFS, computeKillPool, voiceDropCost, type UpgradeKind } from '../data/drops';
import { HERO_DEFINITIONS, type HeroId } from '../data/heroes';
import { rollDrops, makeRng, type DropContext } from '../core/Drops';
import { gameToUiEvents, type DropOption } from '../core/GameEvents';
import { spawnHero } from './GameSceneSpawners';

export function addVoices(scene: GameScene, amount: number) {
  if (scene.isSandbox || scene.status !== 'playing') return;
  
  scene.voicesCount += amount;
  if (scene.voicesCount >= scene.maxVoicesCount) {
    if (scene.dropIndex >= scene.totalWaves) {
      scene.voicesCount = scene.maxVoicesCount; // Cap it
      return;
    }
    scene.voicesCount = 0;
    
    // Pause game
    scene.isPaused = true;
    scene.syncVisualPauseState();
    scene.emitState(true);

    const options = rollDropOptions(scene);
    gameToUiEvents.emit('voicesFull', { options });
  }
}

/** Assemble live battle state and roll 3 drop options via the pure roller. */
export function rollDropOptions(scene: GameScene): DropOption[] {
  const activeIds = new Set(scene.heroes.map(h => h.id));
  const availableRecruits = (Object.keys(HERO_DEFINITIONS) as HeroId[])
    .filter(id => !id.startsWith('sandbox_') && !activeIds.has(id))
    .map(id => ({ id, name: HERO_DEFINITIONS[id].name, purpose: HERO_DEFINITIONS[id].purpose }));

  const ctx: DropContext = {
    activeHeroes: scene.heroes
      .filter(h => !h.id.startsWith('sandbox_'))
      .map(h => ({
        id: h.id,
        name: h.definition.name,
        attackStyle: h.definition.attackStyle,
        stacks: h.upgradeStacks,
      })),
    availableRecruits,
    hasOpenSlot: scene.heroes.length < MAX_ACTIVE_HEROES,
    barrierHp: scene.shield.hp,
    barrierMaxHp: scene.shield.maxHp,
    currentWave: scene.currentWave,
  };

  const rng = makeRng((Date.now() ^ (scene.dropRollSeed++ * 0x9e3779b1)) >>> 0);
  return rollDrops(ctx, rng, 3);
}

export function applyDrop(scene: GameScene, dropId: string) {
  // Advance the drop cadence: next threshold derives from the run's kill pool.
  scene.dropIndex += 1;
  scene.maxVoicesCount = voiceDropCost(scene.dropIndex, computeKillPool(scene.totalWaves));

  if (dropId.startsWith('hero:')) {
    const heroId = dropId.slice('hero:'.length) as HeroId;
    spawnHero(scene, heroId);
  } else if (dropId === 'global:moraleHeal') {
    scene.shield.heal(GLOBAL_DROP_DEFS.moraleHeal.magnitude);
  } else if (dropId.startsWith('upgrade:')) {
    const [, heroId, kind] = dropId.split(':');
    applyHeroUpgrade(scene, heroId, kind as UpgradeKind);
  }
}

/** Apply one hero-targeted upgrade pick per UpgradeSpec.apply, and track the
 *  stack count so the roller stops offering it once maxed. */
export function applyHeroUpgrade(scene: GameScene, heroId: string, kind: UpgradeKind) {
  const hero = scene.heroes.find(h => h.id === heroId);
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
