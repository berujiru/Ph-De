import Phaser from 'phaser';
import type { Enemy } from './Enemy';
import type { AttackModifiers } from './Attacks';
import { ATTACK_STYLE_BADGES, type HeroDefinition, type UpgradeKind } from '../data/balance';
import { RALLY } from '../data/level';
import { formationTargetY, stepTowardFormation } from '../core/RallyMarch';
import { applyHeroPassive, type ISkillHero } from '../core/Skills';
import { HeroModel } from './models/HeroModel';

export class Hero extends Phaser.GameObjects.Container implements ISkillHero {
  public id: string;
  public definition: HeroDefinition;
  private attackCooldown = 0;
  public attackRateMs: number;
  public damage: number;
  public range: number;
  private onAttack: (hero: Hero, target: Enemy) => void;

  /**
   * Persistent behavior mods from Voice-drop upgrades (bonusPierce/bonusChain/
   * bonusRadius). Passed into every Attack this hero spawns so pierce/chain/
   * radius upgrades reach future shots. Starts at zero. See docs/VOICE_DROPS.md.
   */
  public modifiers: AttackModifiers = { bonusDamage: 0, bonusPierce: 0, bonusRadius: 0, bonusChain: 0 };

  /** How many times each upgrade kind has been applied — feeds the "no dead
   *  drops" / maxStacks filter in core/Drops.ts. */
  public upgradeStacks: Partial<Record<UpgradeKind, number>> = {};

  public skillCooldownMs = 5000;
  public currentSkillCooldown = 5000; // start on cooldown
  public isSkillReady = false;

  public passiveOverride?: string;

  /** Small per-hero stagger (along the march axis) so ranged heroes don't stack on one pixel. */
  private formationJitterY: number;

  private model: HeroModel;
  private skillHighlight: Phaser.GameObjects.Text;
  private attackBarBg: Phaser.GameObjects.Rectangle;
  private attackBarFill: Phaser.GameObjects.Rectangle;
  private skillBarBg: Phaser.GameObjects.Rectangle;
  private skillBarFill: Phaser.GameObjects.Rectangle;
  private rangeIndicator: Phaser.GameObjects.Arc;

  constructor(scene: Phaser.Scene, x: number, y: number, def: HeroDefinition, onAttack: (hero: Hero, target: Enemy) => void) {
    super(scene, x, y);
    this.id = def.id;
    this.definition = def;

    this.damage = def.damage;
    this.attackRateMs = def.attackRateMs;
    this.range = def.range;
    this.onAttack = onAttack;
    this.formationJitterY = def.attackKind === 'ranged' ? (Math.random() - 0.5) * RALLY.formation.rangedJitterPx : 0;

    // Range indicator (added first so it's behind the body)
    this.rangeIndicator = scene.add.circle(0, 0, def.range, def.color, 0.1);
    this.rangeIndicator.setStrokeStyle(1, def.color, 0.5);
    this.rangeIndicator.setVisible(false);
    this.add(this.rangeIndicator);

    this.model = new HeroModel(scene, 0, 0, def.color, def.spriteKey ?? def.id);
    this.add(this.model);

    const nameLabel = scene.add.text(0, 25, def.name, {
      fontSize: '10px',
      color: '#ffffff',
      align: 'center',
    }).setOrigin(0.5, 0);
    this.add(nameLabel);

    // Attack-type hint chip — quick read on what this hero's basic attack does.
    const badge = ATTACK_STYLE_BADGES[def.attackStyle];
    const badgeChip = scene.add.text(0, 38, badge.label, {
      fontSize: '9px',
      fontStyle: 'bold',
      color: '#0f172a',
      backgroundColor: badge.background,
      padding: { x: 4, y: 1 },
    }).setOrigin(0.5, 0);
    this.add(badgeChip);

    this.skillHighlight = scene.add.text(0, -45, '★ SKILL', { fontSize: '12px', color: '#facc15', fontStyle: 'bold' }).setOrigin(0.5);
    this.skillHighlight.setVisible(false);
    this.add(this.skillHighlight);

    // Cooldown bars
    this.attackBarBg = scene.add.rectangle(0, -25, 30, 4, 0x000000);
    this.add(this.attackBarBg);
    this.attackBarFill = scene.add.rectangle(-15, -25, 30, 4, 0x00ff00);
    this.attackBarFill.setOrigin(0, 0.5);
    this.add(this.attackBarFill);

    this.skillBarBg = scene.add.rectangle(0, -32, 30, 4, 0x000000);
    this.add(this.skillBarBg);
    this.skillBarFill = scene.add.rectangle(-15, -32, 30, 4, 0xffff00);
    this.skillBarFill.setOrigin(0, 0.5);
    this.add(this.skillBarFill);

    // Make interactive
    this.setSize(40, 60);
    this.setInteractive({ useHandCursor: true });
    this.on('pointerdown', () => {
      this.useSkill();
      this.showRange();
    });

    scene.add.existing(this);
  }

  /** World-space point projectiles visually launch from (the model's muzzle). */
  get muzzleX(): number {
    return this.x + this.model.muzzleOffset.x;
  }

  get muzzleY(): number {
    return this.y + this.model.muzzleOffset.y;
  }

  /** Muzzle-flash hook for projectile-style attacks. */
  playProjectileLaunch(): void {
    this.model.playProjectileLaunch();
  }

  /**
   * Lock this hero into a terminal battle-outcome pose. Called by GameScene
   * when the rally is decided: 'celebrate' on victory (raised fist), 'defeat'
   * on loss (morale broken — heroes take a knee, they don't die).
   */
  playOutcome(outcome: 'celebrate' | 'defeat') {
    this.model.setState(outcome);
  }

  update(delta: number, enemies: Enemy[], shieldY: number) {
    // Hold formation relative to the advancing morale shield.
    const targetY = formationTargetY(shieldY, { attackKind: this.definition.attackKind, rangePx: this.range }, RALLY.formation) + this.formationJitterY;
    const step = stepTowardFormation(this.y, targetY, delta, {
      marchSpeedPxPerSec: RALLY.marchSpeedPxPerSec,
      catchUpSpeedMultiplier: RALLY.formation.catchUpSpeedMultiplier,
      runDistancePx: RALLY.formation.runDistancePx,
      settleDistancePx: RALLY.formation.settleDistancePx,
    });
    this.y = step.y;
    this.model.setState(step.locomotion);

    // Auto-attack
    this.attackCooldown = Math.max(0, this.attackCooldown - delta);
    if (this.attackCooldown === 0) {
      // Find the most-advanced enemy (largest y, closest to the shield below),
      // among those ahead of (above) the hero. Prioritize tauntAura.
      let target: Enemy | null = null;
      let maxEnemyY = -Infinity;
      let foundTaunt = false;

      for (const enemy of enemies) {
        if (!enemy.isDead && enemy.y < this.y) {
          // Ignore stealthed enemies unless hero has canSeeStealth
          if (enemy.isStealthed && !this.definition.canSeeStealth) continue;

          if (enemy.definition.tauntAura && this.y - enemy.y <= this.range) {
            // Found a taunting enemy in range. Prioritize it immediately.
            // If multiple taunt, attack the most-advanced one.
            if (!foundTaunt || enemy.y > maxEnemyY) {
              maxEnemyY = enemy.y;
              target = enemy;
              foundTaunt = true;
            }
          } else if (!foundTaunt && enemy.y > maxEnemyY) {
            maxEnemyY = enemy.y;
            target = enemy;
          }
        }
      }

      if (target && this.y - target.y <= this.range) {
        this.onAttack(this, target);

        // Passives applied on attack
        const activePassive = this.passiveOverride || this.id;
        applyHeroPassive(activePassive, this, target, {
          GAME_WIDTH: Number(this.scene.game.config.width),
          GAME_HEIGHT: Number(this.scene.game.config.height),
          heroes: [], // Passive doesn't currently read other heroes
          enemies: [], // or other enemies
          onVisual: (evt) => {
            if (evt.type === 'text') {
              const txt = this.scene.add.text(evt.x || 0, evt.y || 0, evt.text || '', { color: evt.color || '#fff', fontStyle: 'bold' }).setOrigin(0.5);
              this.scene.tweens.add({ targets: txt, y: (evt.y || 0) - 30, alpha: 0, duration: 1000, onComplete: () => txt.destroy() });
            }
          }
        });

        this.attackCooldown = this.attackRateMs;
        this.model.setState('attack');
      }
    }

    // Skill cooldown logic
    if (!this.isSkillReady) {
      this.currentSkillCooldown -= delta;
      if (this.currentSkillCooldown <= 0) {
        this.currentSkillCooldown = 0;
        this.isSkillReady = true;
        this.skillHighlight.setVisible(true);
        // Simple pulsing animation
        this.scene.tweens.add({ targets: this.skillHighlight, scale: 1.2, yoyo: true, repeat: -1, duration: 500 });
      }
    }

    // Update visuals
    const attackProgress = Math.max(0, 1 - (this.attackCooldown / this.attackRateMs));
    this.attackBarFill.scaleX = attackProgress;

    const skillProgress = Math.max(0, 1 - (this.currentSkillCooldown / this.skillCooldownMs));
    this.skillBarFill.scaleX = skillProgress;
  }

  useSkill(skillOverride?: string) {
    if (!this.isSkillReady) return;
    this.isSkillReady = false;
    this.currentSkillCooldown = this.skillCooldownMs;
    this.skillHighlight.setVisible(false);
    this.scene.tweens.killTweensOf(this.skillHighlight);
    this.skillHighlight.setScale(1);

    // Cast animation plays through the model.
    this.model.setState('cast');

    const skillId = skillOverride || this.id;
    this.scene.events.emit('heroSkillTriggered', { hero: this, skillId });

    // Bark
    const skillName = this.definition.signatureSkill.name;
    const txt = this.scene.add.text(this.x, this.y - 60, `${skillName}!`, { color: '#facc15', fontStyle: 'bold' }).setOrigin(0.5);
    this.scene.tweens.add({ targets: txt, y: this.y - 100, alpha: 0, duration: 1500, onComplete: () => txt.destroy() });
  }

  private showRange() {
    this.rangeIndicator.setVisible(true);
    this.rangeIndicator.setAlpha(1);
    this.scene.tweens.killTweensOf(this.rangeIndicator);
    this.scene.tweens.add({
      targets: this.rangeIndicator,
      alpha: 0,
      delay: 1500,
      duration: 500,
      onComplete: () => {
        this.rangeIndicator.setVisible(false);
      }
    });
  }
}
