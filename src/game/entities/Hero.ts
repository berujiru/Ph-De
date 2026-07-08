import Phaser from 'phaser';
import type { Enemy } from './Enemy';
import type { AttackModifiers } from './Attacks';
import { UNIT_RENDER_SIZES, type HeroDefinition, type UpgradeKind } from '../data/balance';
import { RALLY } from '../data/level';
import { formationTargetY, stepTowardFormation } from '../core/RallyMarch';
import { applyHeroPassive, type ISkillHero } from '../core/Skills';
import { HeroModel } from './models/HeroModel';
import { SkillAura } from './fx/SkillAura';

export class Hero extends Phaser.GameObjects.Container implements ISkillHero {
  public id: string;
  public definition: HeroDefinition;
  public isSkillReady = false;
  private attackCooldown = 0;
  private pendingAttacks: { delayMs: number, originalTarget: Enemy }[] = [];
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

  public passiveOverride?: string;

  /** Small per-hero stagger (along the march axis) so ranged heroes don't stack on one pixel. */
  private formationJitterY: number;

  private model: HeroModel;
  private skillAura: SkillAura;
  private rangeIndicator: Phaser.GameObjects.Arc;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    def: HeroDefinition,
    onAttack: (hero: Hero, target: Enemy) => void,
    /** Selected-skin texture key; falls back to def.spriteKey / def.id. */
    spriteKey?: string,
  ) {
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

    // Heroes render at the 'hero' size tier; labels/bars hang off its half-height.
    const sizePx = UNIT_RENDER_SIZES.hero;
    this.model = new HeroModel(scene, 0, 0, def.color, spriteKey ?? def.spriteKey ?? def.id, sizePx);
    this.add(this.model);

    // Make interactive — hit area tracks the size tier.
    this.setSize(Math.round(sizePx * 0.7), sizePx + 30);
    this.setInteractive({ useHandCursor: true });
    this.on('pointerdown', () => {
      const gs = this.scene as any;
      if (gs.isPaused || gs.gameSpeed === 0) return;
      this.showRange();
    });

    // Skill Aura (below the hero)
    this.skillAura = new SkillAura(scene, def.color);
    this.skillAura.setPosition(0, 35); // Approx foot position for 64px tier
    // Put aura below the model (index 1, as range indicator is 0)
    this.addAt(this.skillAura, 1);

    this.updateSkillButtonVisuals();

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
   * Replay the cast animation. GameScene calls this when a skill cut-in
   * finishes so the cast reads *after* the full-screen cut-in clears, rather
   * than playing hidden behind it.
   */
  playCast(): void {
    this.model.setState('cast');
  }

  /**
   * Lock this hero into a terminal battle-outcome pose. Called by GameScene
   * when the rally is decided: 'celebrate' on victory (raised fist), 'defeat'
   * on loss (morale broken — heroes take a knee, they don't die).
   */
  playOutcome(outcome: 'celebrate' | 'defeat') {
    this.model.setState(outcome);
  }

  /**
   * The frontmost enemy this hero should shoot AND is within range of, or null.
   * Taunting enemies in range take priority; otherwise the most-advanced enemy
   * ahead is chosen and only returned if it's actually within range. Called
   * every frame so an engaged hero holds a ready idle rather than walking.
   */
  private findTargetInRange(enemies: Enemy[]): Enemy | null {
    let target: Enemy | null = null;
    let maxEnemyY = -Infinity;
    let foundTaunt = false;

    for (const enemy of enemies) {
      if (enemy.isDead || enemy.y >= this.y) continue;
      // Ignore stealthed enemies unless this hero can see stealth.
      if (enemy.isStealthed && !this.definition.canSeeStealth) continue;

      if (enemy.definition.tauntAura && this.y - enemy.y <= this.range) {
        // A taunting enemy in range is prioritized; pick the most-advanced one.
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

    return target && this.y - target.y <= this.range ? target : null;
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

    this.attackCooldown = Math.max(0, this.attackCooldown - delta);

    // The enemy this hero is engaging (frontmost, in range) — computed every
    // frame so it drives both locomotion and attacking.
    const target = this.findTargetInRange(enemies);

    // Smoothly rotate the HeroModel to face the target, or face forward (up) if no target
    if (target) {
      // Instead of raw 2D rotation (which breaks the oblique perspective and makes them 
      // look like they are lying flat on the ground), we simply flip them horizontally 
      // to "face" left or right depending on where the enemy is.
      this.model.setFlipX(target.x > this.x);
    } else {
      // Default to facing right (or neutral) when marching
      this.model.setFlipX(false);
    }

    // While an enemy is in range, hold a ready idle between shots instead of
    // flickering back to walk each time an attack finishes. Only march
    // (walk / run) when there's nothing in range to shoot.
    this.model.setState(target ? 'idle' : step.locomotion);

    // Skill cooldown logic
    if (!this.isSkillReady) {
      this.currentSkillCooldown -= delta;
      if (this.currentSkillCooldown <= 0) {
        this.currentSkillCooldown = 0;
        this.isSkillReady = true;

        this.updateSkillButtonVisuals();
      }
    }

    // Auto-attack — fire when the cadence is ready and a target is in range.
    if (target && this.attackCooldown === 0) {
      // Cooldown starts now (attack cadence is unchanged). We decouple the 
      // actual projectile launch from the animation frames using a delayed timer 
      // so the mechanical attack fires reliably even at extremely fast speeds.
      this.attackCooldown = this.attackRateMs;
      
      this.model.setState('attack', { attackIntervalMs: this.attackRateMs });

      // Fire projectile roughly halfway through the attack interval to sync with the visual swing.
      this.pendingAttacks.push({
        delayMs: this.attackRateMs * 0.45,
        originalTarget: target,
      });
    }

    // Process pending attacks (mechanical projectile launch)
    for (let i = this.pendingAttacks.length - 1; i >= 0; i--) {
      const pending = this.pendingAttacks[i];
      pending.delayMs -= delta;
      
      if (pending.delayMs <= 0) {
        let finalTarget = pending.originalTarget;
        
        // If the original target died while the hero was swinging, try to seamlessly 
        // redirect the attack to a new valid target so the attack isn't wasted.
        if (finalTarget.isDead || !finalTarget.active) {
            const allEnemies = (this.scene as any).enemies as Enemy[];
            finalTarget = this.findTargetInRange(allEnemies) || finalTarget;
        }

        if (finalTarget && finalTarget.active && !finalTarget.isDead) {
          this.onAttack(this, finalTarget);

          // Passives applied on attack
          const activePassive = this.passiveOverride || this.id;
          applyHeroPassive(activePassive, this, finalTarget, {
            GAME_WIDTH: Number(this.scene.game.config.width),
            GAME_HEIGHT: Number(this.scene.game.config.height),
            heroes: [],
            enemies: [],
            onVisual: (evt) => {
              if (evt.type === 'text') {
                const txt = this.scene.add.text(evt.x || 0, evt.y || 0, evt.text || '', { color: evt.color || '#fff', fontStyle: 'bold' }).setOrigin(0.5);
                this.scene.tweens.add({ targets: txt, y: (evt.y || 0) - 30, alpha: 0, duration: 1000, onComplete: () => txt.destroy() });
              }
            }
          });
        }
        
        this.pendingAttacks.splice(i, 1);
      }
    }
  }

  pauseVisuals(): void {
    this.model.pause();
    if (this.isSkillReady && this.skillAura) {
      this.skillAura.pause();
    }
  }

  resumeVisuals(): void {
    this.model.resume();
    if (this.isSkillReady && this.skillAura) {
      this.skillAura.resume();
    }
  }

  useSkill(skillOverride?: string) {
    if (!this.isSkillReady) return;
    this.isSkillReady = false;
    this.currentSkillCooldown = this.skillCooldownMs;

    this.updateSkillButtonVisuals();

    // Cast animation plays through the model.
    this.model.setState('cast');

    const skillId = skillOverride || this.id;
    this.scene.events.emit('heroSkillTriggered', { hero: this, skillId });

    // Bark
    const skillName = this.definition.signatureSkill.name;
    const txt = this.scene.add.text(this.x, this.y - 120, `${skillName}!`, { fontSize: '48px', color: '#facc15', fontStyle: 'bold', stroke: '#000000', strokeThickness: 8 }).setOrigin(0.5);
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

  private updateSkillButtonVisuals() {
    if (this.isSkillReady) {
      this.skillAura.play();
    } else {
      this.skillAura.stop();
    }
  }
}
