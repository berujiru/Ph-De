import Phaser from 'phaser';
import type { Enemy } from './Enemy';
import type { AttackModifiers } from './Attacks';
import { UNIT_RENDER_SIZES } from '../data/enemies';
import { type HeroDefinition } from '../data/heroes';
import { type UpgradeKind } from '../data/drops';
import { RALLY } from '../data/level';
import { formationTargetY, stepTowardFormation } from '../core/RallyMarch';
import { applyHeroPassive, type ISkillHero } from '../core/Skills';
import { uiToGameEvents } from '../core/GameEvents';
import { HeroModel } from './models/HeroModel';
import { SpriteAura } from './fx/SpriteAura';

export class Hero extends Phaser.GameObjects.Container implements ISkillHero {
  public id: string;
  public definition: HeroDefinition;
  public isSkillReady = false;
  public isEvicted = false;
  private stunTimer = 0;
  private evictionSign: Phaser.GameObjects.Container;
  private attackCooldown = 0;
  private pendingAttacks: { delayMs: number, originalTarget: Enemy }[] = [];
  public attackRateMs: number;
  public damage: number;
  public range: number;
  private onAttack: (hero: Hero, target: Enemy) => void;

  public activeBuffs: Record<string, number> = {};
  public hasRallyBuff?: boolean;

  /**
   * Persistent behavior mods from Voice-drop upgrades (bonusPierce/bonusChain/
   * bonusRadius). Passed into every Attack this hero spawns so pierce/chain/
   * radius upgrades reach future shots. Starts at zero. See docs/VOICE_DROPS.md.
   */
  public modifiers: AttackModifiers = { bonusDamage: 0, bonusPierce: 0, bonusRadius: 0, bonusChain: 0, bonusProjectiles: 0 };

  /** How many times each upgrade kind has been applied — feeds the "no dead
   *  drops" / maxStacks filter in core/Drops.ts. */
  public upgradeStacks: Partial<Record<UpgradeKind, number>> = {};

  public skillCooldownMs = 5000;
  public currentSkillCooldown = 5000; // start on cooldown

  public passiveOverride?: string;

  /** Small per-hero stagger (along the march axis) so ranged heroes don't stack on one pixel. */
  private formationJitterY: number;

  private passiveTimer = 0;
  public blindTimer = 0;

  private model: HeroModel;
  private spriteAura: SpriteAura;
  private buffIcons: Record<string, Phaser.GameObjects.Text> = {};
  private rangeIndicator: Phaser.GameObjects.Arc;

  /** Mini TCG-card standee behind the hero; the sprite stands in front of it. */
  private standee: Phaser.GameObjects.Container;
  /** Glow halo behind the standee that pulses while the signature skill is ready. */
  private standeeGlow?: Phaser.GameObjects.Rectangle;
  private standeeGlowTween?: Phaser.Tweens.Tween;
  private skillGlowActive = false;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    def: HeroDefinition,
    onAttack: (hero: Hero, target: Enemy, overrideDamageType?: string, overrideColor?: number) => void,
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

    // TCG-card standee — added BEFORE the model so the hero sprite draws in
    // front of it (visually standing before their own card).
    this.standee = this.createStandee(scene, this.model.footOffset, sizePx);
    this.add(this.standee);
    this.add(this.model);

    // Make interactive — hit area tracks the size tier.
    this.setSize(Math.round(sizePx * 0.7), sizePx + 30);
    this.setInteractive({ useHandCursor: true });
    this.on('pointerdown', () => {
      const gs = this.scene as any;
      if (gs.isPaused || gs.gameSpeed === 0) return;
      // A lit portrait (skill ready) casts via the combo queue — same path the
      // old HUD skill button used; otherwise a tap just shows the range ring.
      if (this.isSkillReady && !this.isEvicted) {
        uiToGameEvents.emit('queueHeroSkill', { heroId: this.id });
      } else {
        this.showRange();
      }
    });

    // Buff Sprite Aura (reverse tear drops)
    this.spriteAura = new SpriteAura(scene, 0xfacc15); // Default yellow
    // Add above the model
    this.add(this.spriteAura);

    // Private property sign (eviction)
    this.evictionSign = new Phaser.GameObjects.Container(scene, 0, 0);
    const signRect = scene.add.rectangle(0, -20, 60, 40, 0xef4444).setStrokeStyle(2, 0xffffff);
    const signText = scene.add.text(0, -20, 'PRIVATE\nPROPERTY', {
      fontFamily: 'Inter, sans-serif',
      fontSize: '9px',
      color: '#ffffff',
      fontStyle: 'bold',
      align: 'center'
    }).setOrigin(0.5);
    this.evictionSign.add([signRect, signText]);
    this.evictionSign.setVisible(false);
    this.add(this.evictionSign);

    scene.add.existing(this);
  }

  /**
   * Builds a small "TCG-card preview" standee behind the hero: the card FRAME
   * (rounded light panel + hero-colored border) with only the portrait art
   * inside. Card text is dropped — at in-battle scale it's illegible, so the
   * portrait alone carries the card. The sprite draws in front of it, so it
   * reads as the character standing before their own card. A hidden yellow halo
   * behind it pulses when the skill is ready. Reuses `${id}_ui_portrait`.
   */
  private createStandee(
    scene: Phaser.Scene,
    footOffset: number,
    sizePx: number,
  ): Phaser.GameObjects.Container {
    const color = this.definition.color;
    const container = new Phaser.GameObjects.Container(scene, 0, 0);

    // Scaled-down portrait card (3:4-ish). Kept narrower than the hero row
    // spacing so adjacent standees don't overlap. Base sits near the feet; the
    // top clears the head so the sprite overlaps the card's lower half.
    const cardW = Math.round(sizePx * 0.72);
    const cardH = Math.round(sizePx * 0.96);
    const pad = Math.round(cardW * 0.08);
    const cardBottom = Math.round(footOffset * 0.9);
    const cardTop = cardBottom - cardH;
    const left = -cardW / 2;

    // Ready-glow halo (behind everything) — a soft yellow slab, hidden by default.
    const glow = scene.add.rectangle(0, cardBottom - cardH / 2, cardW + pad * 2, cardH + pad * 2, 0xfacc15, 0.5);
    glow.setVisible(false);
    glow.setAlpha(0);
    this.standeeGlow = glow;
    container.add(glow);

    // Ground shadow so the standee reads as planted, not floating.
    container.add(scene.add.ellipse(0, cardBottom + pad * 0.4, cardW * 0.9, pad * 1.6, 0x000000, 0.35));

    // Card frame — light metallic panel with a hero-colored border.
    const body = scene.add.graphics();
    body.fillStyle(0xf1f5f9, 1);
    body.fillRoundedRect(left, cardTop, cardW, cardH, 12);
    body.lineStyle(3, color, 1);
    body.strokeRoundedRect(left, cardTop, cardW, cardH, 12);
    container.add(body);

    // Portrait window — hero-color wash filling the frame (minus a thin border);
    // the portrait art is contained bottom-aligned inside it (no Y-squash).
    const boxW = cardW - pad;
    const boxH = cardH - pad;
    const boxCY = cardTop + cardH / 2;
    const box = scene.add.rectangle(0, boxCY, boxW, boxH, color, 0.18);
    box.setStrokeStyle(2, 0x94a3b8, 1);
    container.add(box);

    const portraitKey = `${this.id}_ui_portrait`;
    if (scene.textures.exists(portraitKey)) {
      const img = scene.add.image(0, boxCY + boxH / 2 - 2, portraitKey).setOrigin(0.5, 1);
      // Contain within the window, bottom-aligned so it never overflows the frame.
      const fit = Math.min((boxW - 2) / (img.width || boxW), (boxH - 2) / (img.height || boxH));
      img.setScale(fit);
      container.add(img);
    }

    return container;
  }

  /** Pulse (or stop pulsing) the standee glow to signal skill readiness. */
  private setSkillGlow(on: boolean): void {
    if (on === this.skillGlowActive || !this.standeeGlow) return;
    this.skillGlowActive = on;
    if (on) {
      this.standeeGlow.setVisible(true);
      this.standeeGlowTween = this.scene.tweens.add({
        targets: this.standeeGlow,
        alpha: { from: 0.18, to: 0.5 },
        scaleX: { from: 1, to: 1.08 },
        scaleY: { from: 1, to: 1.05 },
        yoyo: true,
        repeat: -1,
        duration: 650,
        ease: 'Sine.easeInOut',
      });
    } else {
      this.standeeGlowTween?.remove();
      this.standeeGlowTween = undefined;
      this.standeeGlow.setVisible(false);
      this.standeeGlow.setAlpha(0).setScale(1);
    }
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

  applyBuff(type: string, durationMs: number = 4000, color: number = 0xfacc15, iconText: string = '⚡') {
    if (this.activeBuffs[type] > 0 || this.activeBuffs[type] === -1) {
      if (this.activeBuffs[type] !== -1) {
          this.activeBuffs[type] = durationMs; // refresh duration
      }
      return;
    }

    this.activeBuffs[type] = durationMs;
    
    // Support specific logic flags
    if (type === 'rally') this.hasRallyBuff = true;

    // Create icon if doesn't exist
    if (!this.buffIcons[type]) {
      const idx = Object.keys(this.buffIcons).length;
      const iconY = -120; // moved even higher
      // Stack horizontally (idx * 34) and start slightly left of center
      const icon = this.scene.add.text(-20 + (idx * 34), iconY, iconText, { 
        fontSize: '32px', // scaled up
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 6 // stronger outline
      }).setOrigin(0.5);
      
      this.add(icon);
      this.buffIcons[type] = icon;
      
      // Bob animation for the icon
      this.scene.tweens.add({
        targets: icon,
        emitZone: {
        type: 'edge' as const,
        source: new Phaser.Geom.Rectangle(-20, -120, 40, 40),
        quantity: 32,
      },  ease: 'Sine.easeInOut'
      });
    }

    this.buffIcons[type].setVisible(true);
    this.spriteAura.play(color);
  }

  removeBuff(type: string) {
    if (!this.activeBuffs[type]) return;
    delete this.activeBuffs[type];
    
    if (type === 'rally') this.hasRallyBuff = false;
    
    if (this.buffIcons[type]) {
      this.buffIcons[type].setVisible(false);
    }
    
    // If no active buffs remain, stop the aura
    if (Object.keys(this.activeBuffs).length === 0) {
      this.spriteAura.stop();
    }
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

      if (enemy.definition.tauntAura && enemy.silenceTimer <= 0 && this.y - enemy.y <= this.range) {
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

  getEffectiveAttackRateMs(): number {
    let rate = this.attackRateMs;
    if (this.hasRallyBuff || this.activeBuffs['attackSpeed'] || this.activeBuffs['cramming']) {
      rate /= 2; // 100% attack speed boost
    }
    return Math.max(100, rate); // Floor at 100ms
  }

  update(delta: number, enemies: Enemy[], shieldY: number) {
    if (this.isEvicted) return;

    if (this.stunTimer > 0) {
      this.stunTimer -= delta;
      if (this.stunTimer > 0) {
        if (this.model.modelState !== 'idle') {
          this.model.setState('idle');
        }
        return;
      }
    }
    
    // Process Buff Durations
    for (const [type, duration] of Object.entries(this.activeBuffs)) {
      if (duration === -1) continue; // Permanent buff
      this.activeBuffs[type] = duration - delta;
      if (this.activeBuffs[type] <= 0) {
        this.removeBuff(type);
      }
    }

    if (this.blindTimer > 0) {
      this.blindTimer -= delta;
      if (this.blindTimer < 0) this.blindTimer = 0;
    }

    // Process Continuous Passives (e.g. Nurse healing)
    this.passiveTimer += delta;
    if (this.passiveTimer >= 1000) {
      const ticks = Math.floor(this.passiveTimer / 1000);
      this.passiveTimer -= ticks * 1000;
      
      const activePassive = this.passiveOverride || this.id;
      if (activePassive === 'nurse') {
        const gs = this.scene as any;
        if (gs.healShield) {
          gs.healShield(1 * ticks);
        }
      }
    }

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
    const gameScene = this.scene as import('../scenes/GameScene').GameScene;
    const isBudgetCutActive = gameScene && gameScene.budgetCutTargetHero === this;
    if (!this.isSkillReady && !isBudgetCutActive) {
      this.currentSkillCooldown -= delta;
      if (this.currentSkillCooldown <= 0) {
        this.currentSkillCooldown = 0;
        this.isSkillReady = true;
      }
    }
    // Light up the ground portrait while the skill is castable (not mid-lock).
    this.setSkillGlow(this.isSkillReady && !isBudgetCutActive);

    // Auto-attack — fire when the cadence is ready and a target is in range.
    if (target && this.attackCooldown === 0) {
      const effectiveRate = this.getEffectiveAttackRateMs();
      
      // Cooldown starts now (attack cadence is unchanged). We decouple the 
      // actual projectile launch from the animation frames using a delayed timer 
      // so the mechanical attack fires reliably even at extremely fast speeds.
      this.attackCooldown = effectiveRate;
      
      this.model.setState('attack', { attackIntervalMs: effectiveRate });

      // Fire projectile roughly halfway through the attack interval to sync with the visual swing.
      this.pendingAttacks.push({
        delayMs: effectiveRate * 0.45,
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
          // Fake News Blindness check
          if (this.blindTimer > 0 && Math.random() < 0.5) {
            // Miss! Show visual text
            const missText = this.scene.add.text(this.x, this.y - 30, 'MISS', {
              fontFamily: 'Inter, sans-serif',
              fontSize: '12px',
              color: '#d1d5db',
              fontStyle: 'bold',
              stroke: '#000',
              strokeThickness: 3
            }).setOrigin(0.5);
            
            this.scene.tweens.add({
              targets: missText,
              y: missText.y - 20,
              alpha: 0,
              duration: 800,
              onComplete: () => missText.destroy()
            });
            
            // Skip the actual attack
          } else {
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
        }
        
        this.pendingAttacks.splice(i, 1);
      }
    }
  }

  pauseVisuals(): void {
    this.model.pause();
  }

  resumeVisuals(): void {
    this.model.resume();
  }

  public setEvicted(evicted: boolean) {
    if (this.isEvicted === evicted) return;
    this.isEvicted = evicted;
    if (evicted) {
      this.model.setVisible(false);
      this.standee.setVisible(false);
      this.setSkillGlow(false);
      this.evictionSign.setVisible(true);
      // interrupt any current attack
      this.attackCooldown = 0;
      this.pendingAttacks = [];
    } else {
      this.model.setVisible(true);
      this.standee.setVisible(true);
      this.evictionSign.setVisible(false);
      this.model.setState('idle');
    }
  }

  useSkill(skillOverride?: string) {
    if (!this.isSkillReady) return;
    this.isSkillReady = false;
    this.currentSkillCooldown = this.skillCooldownMs;
    this.setSkillGlow(false);

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

  stun(durationMs: number) {
    this.stunTimer = Math.max(this.stunTimer, durationMs);
  }
}
