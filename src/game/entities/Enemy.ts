import Phaser from 'phaser';
import { type EnemyDefinition } from '../data/enemies';
import { ENEMY_VISUALS, UNIT_RENDER_SIZES, enemySizeClass } from '../data/enemies';
import type { MoraleShield } from './MoraleShield';
import type { Summon } from './Summon';
import type { ISkillEnemy } from '../core/Skills';
import { EnemyModel } from './models/EnemyModel';
import { spawnDamageNumber } from './fx/FloatingText';
import { spawnHitSpark, spawnDeathBurst } from './fx/ImpactFx';
import { spawnShockwaveRing } from './fx/ShockwaveRing';
import { cameraPunch } from './fx/CameraPunch';
import { SpriteAura } from './fx/SpriteAura';
import { FX } from '../data/level';
import { EnemyAI } from '../core/EnemyAI';

export type AilmentType = 'burn' | 'slow' | 'wet' | 'freeze' | 'stun' | 'poison' | 'bleed' | 'rot' | 'sleep' | 'curse' | 'knockback' | 'armorShred' | 'muted' | 'root' | 'dragged';

const AILMENT_ICONS: Record<AilmentType, string> = {
  burn: '🔥',
  slow: '🐌',
  wet: '💧',
  freeze: '❄️',
  stun: '⛔',
  poison: '🧪',
  bleed: '🩸',
  rot: '🦠',
  sleep: '💤',
  curse: '👁️',
  knockback: '💨',
  armorShred: '🛡️',
  muted: '😶',
  root: '🌱',
  dragged: '' // hidden
};

const AILMENT_OVERLAYS: Record<AilmentType, string> = {
  burn: '☄️',
  slow: '⏳',
  wet: '💦',
  freeze: '🧊',
  stun: '⛔',
  poison: '🫧',
  bleed: '🩸',
  rot: '🪰',
  sleep: '💭',
  curse: '💀',
  knockback: '🌬️',
  armorShred: '🔨',
  muted: '🔇',
  root: '🌿',
  dragged: '' // hidden
};

export class Enemy extends Phaser.GameObjects.Container implements ISkillEnemy {
  public id: string;
  public definition: EnemyDefinition;
  public hp: number;
  private model: EnemyModel;
  private hpBarBg: Phaser.GameObjects.Rectangle;
  private hpBarFill: Phaser.GameObjects.Rectangle;
  public isDead = false;
  private attackCooldown = 0;
  /** Render height (px) from the unit's size tier — offsets hang off this. */
  private readonly sizePx: number;
  private botAi?: EnemyAI;

  // Passives
  public isStealthed = false;
  public fakeHp = 0;
  public hitImmunityCount = 0;

  // Timers for passives
  private stealVoicesTimer = 0;
  private knockbackPulseTimer = 0;
  private auraTimer = 0;
  public silenceTimer = 0;
  private mutedIcon: Phaser.GameObjects.Text | null = null;

  // Ailment Tracking
  private ailmentBuildups: Record<string, number> = {};
  public activeAilments: Record<string, number> = {}; // Remaining ms
  private ailmentIcons: Record<string, Phaser.GameObjects.Text> = {};

  // Overlay tracking (to spawn particles on update)
  private overlayTimer = 0;

  // DoT Tracking
  private tickTimer = 0;

  // Buff Tracking
  public hasSpeedBuff = false;
  public hasAttackSpeedBuff = false;
  private spriteAura: SpriteAura;
  private buffIcon: Phaser.GameObjects.Text | null = null;
  private attackSpeedBuffIcon: Phaser.GameObjects.Text | null = null;

  constructor(scene: Phaser.Scene, x: number, y: number, definition: EnemyDefinition) {
    super(scene, x, y);
    this.id = definition.id;
    this.definition = definition;
    this.hp = definition.maxHp;

    // Size tier drives the model height and how far the HP bar sits above it:
    // minion < miniboss < boss (bosses tower over heroes).
    const sizePx = UNIT_RENDER_SIZES[enemySizeClass(definition)];
    this.sizePx = sizePx;
    this.model = new EnemyModel(scene, 0, 0, definition.color, definition.spriteKey ?? definition.id, sizePx);
    this.add(this.model);

    const barY = -(sizePx / 2 + 8);
    const barW = Math.max(30, Math.round(sizePx * 0.75));
    this.hpBarBg = scene.add.rectangle(0, barY, barW, 6, 0x000000, 0.5);
    this.hpBarFill = scene.add.rectangle(0, barY, barW, 6, 0x22c55e);
    this.add([this.hpBarBg, this.hpBarFill]);

    // Buff Sprite Aura (reverse tear drops)
    this.spriteAura = new SpriteAura(scene, 0xffffff); // Default white
    this.add(this.spriteAura);

    scene.add.existing(this);

    if (definition.stealth) {
      this.isStealthed = true;
      this.setAlpha(0.3); // translucent
    }

    if (definition.fakeHpPadding) {
      this.fakeHp = definition.fakeHpPadding;
      // Blue outline represents the fake HP shield
      this.model.setOutline(3, 0x60a5fa);
    }

    if (definition.hitImmunityCount) {
      this.hitImmunityCount = definition.hitImmunityCount;
      // White outline represents immunity charges
      this.model.setOutline(4, 0xffffff);
    }

    if (definition.id === 'sandbox_target') {
      this.setSize(sizePx, sizePx);
      this.setInteractive({ draggable: true });
      this.on('drag', (_pointer: Phaser.Input.Pointer, dragX: number, dragY: number) => {
        this.x = dragX;
        this.y = dragY;
      });

      const dragLabel = scene.add.text(0, 15, 'DRAG ME', { fontSize: '24px', color: '#ffffff', stroke: '#000000', strokeThickness: 3 }).setOrigin(0.5);
      this.add(dragLabel);
    }
    
    if (definition.ai) {
      this.botAi = new EnemyAI(this, definition.ai);
    }
  }

  pauseVisuals(): void {
    this.model.pause();
  }

  resumeVisuals(): void {
    this.model.resume();
  }

  revealStealth(): void {
    if (this.isStealthed) {
      this.isStealthed = false;
      this.setAlpha(1); // Restore opacity
    }
  }

  applySpeedBuff(_durationMs: number = 4000) {
    if (this.isDead) return;
    
    this.hasSpeedBuff = true;

    // We can use a custom property for duration if we want, 
    // or just rely on the GameScene logic to clear it when duration ends.
    // For now, setting the visual state:

    if (!this.buffIcon) {
      const iconY = -(this.sizePx / 2 + 40); // above ailment icons
      this.buffIcon = this.scene.add.text(0, iconY, '💨', { fontSize: '24px' }).setOrigin(0.5);
      this.add(this.buffIcon);
      
      this.scene.tweens.add({
        targets: this.buffIcon,
        y: iconY - 5,
        yoyo: true,
        repeat: -1,
        duration: 1000,
        ease: 'Sine.easeInOut'
      });
    }

    this.buffIcon.setVisible(true);
    this.spriteAura.play(0x60a5fa); // Light blue aura
  }

  removeSpeedBuff() {
    this.hasSpeedBuff = false;
    if (this.buffIcon) {
      this.buffIcon.setVisible(false);
    }
    if (!this.hasAttackSpeedBuff) this.spriteAura.stop();
  }

  applyAttackSpeedBuff(_durationMs: number = 4000) {
    if (this.isDead) return;
    
    this.hasAttackSpeedBuff = true;

    if (!this.attackSpeedBuffIcon) {
      const iconY = -(this.sizePx / 2 + 40); // above ailment icons
      // Offset slightly to the side if they already have a speed buff
      const iconX = this.buffIcon ? 20 : 0;
      this.attackSpeedBuffIcon = this.scene.add.text(iconX, iconY, '⚔️', { fontSize: '24px' }).setOrigin(0.5);
      this.add(this.attackSpeedBuffIcon);
      
      this.scene.tweens.add({
        targets: this.attackSpeedBuffIcon,
        y: iconY - 5,
        yoyo: true,
        repeat: -1,
        duration: 1000,
        ease: 'Sine.easeInOut'
      });
    }

    this.attackSpeedBuffIcon.setVisible(true);
    this.spriteAura.play(0xef4444); // Red aura
  }

  removeAttackSpeedBuff() {
    this.hasAttackSpeedBuff = false;
    if (this.attackSpeedBuffIcon) {
      this.attackSpeedBuffIcon.setVisible(false);
    }
    if (!this.hasSpeedBuff) this.spriteAura.stop();
  }

  getEffectiveAttackRateMs(): number {
    let rate = this.definition.attackRateMs;
    if (this.hasAttackSpeedBuff) {
      rate /= 2; // 100% attack speed boost
    }
    return Math.max(100, rate); // Floor at 100ms
  }

  takeDamage(amount: number, _damageType: string = 'Physical') {
    if (this.isDead) return;

    // Hit immunity completely blocks the hit
    if (this.hitImmunityCount > 0) {
      this.hitImmunityCount--;

      const blockText = this.scene.add.text(this.x, this.y - 30, 'BLOCKED', { fontSize: '24px', color: '#fff', fontStyle: 'bold', stroke: '#000000', strokeThickness: 4 }).setOrigin(0.5);
      this.scene.tweens.add({ targets: blockText, y: this.y - 50, alpha: 0, duration: 800, onComplete: () => blockText.destroy() });
      this.model.playHitFlash();

      if (this.hitImmunityCount === 0) {
        this.model.clearOutline();
      }
      return;
    }

    // Breaking stealth on hit
    if (this.isStealthed) {
      this.isStealthed = false;
      this.setAlpha(1);
      // Small pop animation
      this.scene.tweens.add({ targets: this, scale: 1.2, yoyo: true, duration: 150 });
    }

    // Process Fake HP first
    if (this.fakeHp > 0) {
      this.fakeHp -= amount;
      if (this.fakeHp <= 0) {
        // Any rollover damage applies to real HP
        amount = -this.fakeHp;
        this.fakeHp = 0;
        this.model.clearOutline();
      } else {
        amount = 0; // all absorbed
        this.model.playHitFlash();
      }
    }

    if (amount > 0) {
      this.hp -= amount;
      try { this.scene.sound.play('sfx-enemy-hit'); } catch (e) {}
      // Combat juice: floating damage number + spark burst at the impact point.
      spawnDamageNumber(this.scene, this.x, this.y - 18, amount);
      spawnHitSpark(this.scene, this.x, this.y, 0xffffff);
    }

    const pct = Math.max(0, this.hp / this.definition.maxHp);
    this.hpBarFill.scaleX = pct;

    if (this.hp <= 0) {
      this.isDead = true;
      try { this.scene.sound.play('sfx-enemy-die'); } catch (e) {}
      // Death pop on top of the model collapse + a subtle camera punch.
      spawnDeathBurst(this.scene, this.x, this.y, this.definition.color);
      cameraPunch(this.scene, FX.cameraShake.enemyDeath);
      this.hpBarBg.setVisible(false);
      this.hpBarFill.setVisible(false);

      // Hook death events
      if (this.definition.nextPhaseEnemyId) {
        this.scene.events.emit('bossPhaseShift', { source: this, nextPhaseId: this.definition.nextPhaseEnemyId });
      } else {
        if (this.definition.splitOnDeathCount) {
          this.scene.events.emit('enemyDeathSplit', { source: this, count: this.definition.splitOnDeathCount });
        }
        if (this.definition.dropObstacleOnDeath) {
          this.scene.events.emit('enemyDeathDropObstacle', { source: this });
        }
      }

      // Death plays through the model; fade the rest (ailment icons, etc.) with it.
      if (this.mutedIcon) {
        this.scene.tweens.add({ targets: this.mutedIcon, alpha: 0, duration: 400 });
      }
      const toFade = this.list.filter(c => c !== this.model);
      if (toFade.length > 0) {
        this.scene.tweens.add({ targets: toFade, alpha: 0, duration: 300 });
      }
      this.model.setState('death', { onComplete: () => this.destroy() });
    }
  }

  public applyAilment(type: any, _amount: number, duration: number) {
    if (this.isDead) return;
    this.activeAilments[type] = duration;
    
    // Create icon if doesn't exist
    if (!this.ailmentIcons[type]) {
      const idx = Object.keys(this.ailmentIcons).length;
      const iconY = -(this.sizePx / 2 + 24); // above the HP bar
      const icon = this.scene.add.text(-15 + (idx * 24), iconY, AILMENT_ICONS[type as AilmentType], { fontSize: '24px' }).setOrigin(0.5);
      this.add(icon);
      this.ailmentIcons[type] = icon;
    }
    
    this.ailmentIcons[type].setAlpha(1);
    
    // Play visual pop
    this.scene.tweens.add({
      targets: this.ailmentIcons[type],
      scale: 1.5,
      yoyo: true,
      duration: 150
    });
  }

  applyAilmentBuildup(type: AilmentType, amount: number) {
    if (this.isDead) return;

    // If already active, refresh duration
    if (this.activeAilments[type] > 0) {
      this.activeAilments[type] = 4000; // 4s duration
      return;
    }

    this.ailmentBuildups[type] = (this.ailmentBuildups[type] || 0) + amount;

    // Create icon if doesn't exist
    if (!this.ailmentIcons[type]) {
      const idx = Object.keys(this.ailmentIcons).length;
      const iconY = -(this.sizePx / 2 + 24); // above the HP bar
      const icon = this.scene.add.text(-15 + (idx * 24), iconY, AILMENT_ICONS[type], { fontSize: '24px' }).setOrigin(0.5);
      this.add(icon);
      this.ailmentIcons[type] = icon;
    }

    // Update icon transparency based on buildup
    const icon = this.ailmentIcons[type];
    const pct = Math.min(1, this.ailmentBuildups[type] / 100);
    icon.setAlpha(0.2 + (pct * 0.8)); // 20% to 100% opacity

    // Trigger activation
    if (this.ailmentBuildups[type] >= 100) {
      this.activeAilments[type] = 4000; // 4s active
      this.ailmentBuildups[type] = 0; // Reset buildup
      icon.setAlpha(1);

      // Activation pop animation
      this.scene.tweens.add({
        targets: icon,
        scale: 1.5,
        yoyo: true,
        duration: 150
      });
    }
  }

  triggerSkill() {
    if (this.isDead || !this.definition.activeSkill) return;

    const skill = this.definition.activeSkill;

    // Cast animation plays through the model.
    this.model.setState('cast');

    const castText = this.scene.add.text(this.x, this.y - 40, skill.name, {
      fontSize: '28px',
      color: '#fff',
      backgroundColor: '#000',
      padding: { x: 8, y: 4 }
    }).setOrigin(0.5);

    this.scene.tweens.add({
      targets: castText,
      y: this.y - 80,
      alpha: 0,
      duration: 1500,
      onComplete: () => castText.destroy()
    });

    if (skill.effect === 'devour') {
      this.definition.maxHp *= 1.5;
      this.hp = this.definition.maxHp;
      this.hpBarFill.scaleX = 1;
      this.scene.tweens.add({ targets: this, scale: 2, duration: 500 });
    } else if (skill.effect === 'flood') {
      this.scene.events.emit('enemyFlood');
    } else if (skill.effect === 'summonSwarm') {
      this.scene.events.emit('enemySummonSwarm', { source: this });
    } else if (skill.effect === 'summonShieldbearer') {
      this.scene.events.emit('enemySummonShieldbearer', { source: this });
    } else if (skill.effect === 'scatterFakeGold') {
      this.scene.events.emit('enemyScatterFakeGold', { source: this });
    } else if (skill.effect === 'smuggleHp') {
      this.scene.events.emit('enemySmuggleHp', { source: this });
    } else if (skill.effect === 'economyHeist') {
      this.scene.events.emit('enemyEconomyHeist', { source: this });
    } else if (skill.effect === 'resurrectAll') {
      this.scene.events.emit('resurrectAll', { source: this });
    } else if (skill.effect === 'sirenBurst') {
      // Clear ailments
      this.activeAilments['slow'] = 0;
      this.activeAilments['freeze'] = 0;
      this.definition.speed *= 3;

      // Visual cue
      spawnShockwaveRing(this.scene, {
        x: this.x, y: this.y,
        color: 0xef4444,
        startRadius: 30, endRadius: 120,
        fillAlpha: 0.5, strokeWidth: 0,
        durationMs: 1000, ease: 'Linear',
      });

      // Reset after 3 seconds
      this.scene.time.delayedCall(3000, () => {
        this.definition.speed /= 3;
      });
    }
  }

  /**
   * Lock this anomaly into a terminal battle-outcome pose. Called by GameScene
   * when the rally is decided: 'celebrate' when the player loses (anomalies
   * overrun the barrier), 'defeat' on the rare forced case.
   */
  playOutcome(outcome: 'celebrate' | 'defeat') {
    if (this.isDead) return;
    this.model.setState(outcome);
  }

  update(delta: number, shield: MoraleShield, summons: Summon[] = []) {
    if (this.isDead) return;

    // --- Periodic Passives ---
    if (this.definition.stealVoicesPerSecond) {
      this.stealVoicesTimer += delta;
      if (this.stealVoicesTimer >= 1000) {
        this.stealVoicesTimer = 0;
        this.scene.events.emit('stealVoices', { amount: this.definition.stealVoicesPerSecond });

        // Visual cue
        const txt = this.scene.add.text(this.x, this.y - 30, '-VOICE', { fontSize: '24px', color: '#10b981', fontStyle: 'bold', stroke: '#000000', strokeThickness: 4 }).setOrigin(0.5);
        this.scene.tweens.add({ targets: txt, y: this.y - 60, alpha: 0, duration: 1000, onComplete: () => txt.destroy() });
      }
    }

    if (this.definition.knockbackPulseCooldown) {
      this.knockbackPulseTimer += delta;
      if (this.knockbackPulseTimer >= this.definition.knockbackPulseCooldown) {
        this.knockbackPulseTimer = 0;
        this.scene.events.emit('heroKnockback', { source: this, force: 100 });

        // Visual pulse
        spawnShockwaveRing(this.scene, {
          x: this.x, y: this.y,
          color: this.definition.color,
          startRadius: 15, endRadius: 60,
          fillAlpha: 0.5, strokeWidth: 0,
          durationMs: 500, ease: 'Linear',
        });
      }
    }

    if (this.silenceTimer > 0) {
      this.silenceTimer -= delta;
      
      if (!this.mutedIcon) {
        const iconY = -(this.sizePx / 2 + 24); 
        this.mutedIcon = this.scene.add.text(0, iconY, '🔇', { fontSize: '24px' }).setOrigin(0.5);
        this.add(this.mutedIcon);
      }
      
      if (this.silenceTimer <= 0) {
        if (this.mutedIcon) {
          this.mutedIcon.destroy();
          this.mutedIcon = null;
        }
      }
    }

    if (this.definition.moraleAura && this.silenceTimer <= 0) {
      this.auraTimer += delta;
      if (this.auraTimer >= 500) { // check twice a second
        this.auraTimer = 0;
        this.scene.events.emit('moraleAura', { source: this, range: this.definition.auraRange || 150 });
      }
    }
    // -------------------------

    // Process Ailments
    let speedMult = 1;
    let isStunnedOrFrozen = false;

    for (const [type, timeLeft] of Object.entries(this.activeAilments)) {
      if (timeLeft > 0) {
        this.activeAilments[type] -= delta;
        if (this.activeAilments[type] <= 0) {
          // Ailment ended
          if (this.ailmentIcons[type]) {
            this.ailmentIcons[type].destroy();
            delete this.ailmentIcons[type];
          }
        } else {
          // Ailment active effects
          if (type === 'freeze' || type === 'stun' || type === 'dragged') {
            isStunnedOrFrozen = true;
          } else if (type === 'root') {
            speedMult = 0; // completely halted, but can still attack
          } else if (type === 'slow') {
            speedMult = 0.6; // −40% speed per docs/DAMAGE_AND_AILMENTS.md (no stack)
          }
        }
      }
    }
    
    // Apply calculated speed multiplier to the animation playback rate natively
    this.model.setTimeScale(speedMult);

    // Ailment Visual Overlays (Spawn particles every 500ms if active)
    this.overlayTimer -= delta;
    if (this.overlayTimer <= 0) {
      this.overlayTimer = 500;
      Object.keys(this.activeAilments).forEach(type => {
        if (this.activeAilments[type] > 0) {
          const overlayChar = AILMENT_OVERLAYS[type as AilmentType];
          if (overlayChar) {
            const particle = this.scene.add.text(
              Phaser.Math.Between(-10, 10),
              Phaser.Math.Between(-10, 10),
              overlayChar,
              { fontSize: '24px' }
            ).setOrigin(0.5);
            this.add(particle);

            this.scene.tweens.add({
              targets: particle,
              y: -20,
              alpha: 0,
              duration: 1000,
              onComplete: () => particle.destroy()
            });
          }
        }
      });
    }

    // DoT Ticks (Burn/Poison)
    this.tickTimer -= delta;
    if (this.tickTimer <= 0) {
      this.tickTimer = 1000; // 1s tick
      if (this.activeAilments['burn'] > 0) this.takeDamage(5); // 5 dmg per second
      if (this.activeAilments['poison'] > 0) this.takeDamage(2); // 2 dmg per second
    }

    if (isStunnedOrFrozen) {
      // Cannot move or attack — dazed in place.
      this.model.setState('stunned');
      return;
    }
    
    if (this.botAi) {
      this.botAi.update(delta);
    }
    
    if (this.model.modelState === 'cast') {
      // Cannot move or attack while casting a skill.
      return;
    }

    // Check if in range of any summon
    let targetSummon: Summon | null = null;
    for (const summon of summons) {
      if (!summon.isDead && Math.abs(this.x - summon.x) < 30 && Math.abs(this.y - summon.y) < 20) {
        targetSummon = summon;
        break;
      }
    }

    const moveSpeed = this.definition.speed * speedMult;

    if (targetSummon) {
      // Reached a summon, stop moving and start attacking
      if (this.definition.selfDestructOnBarrier) {
        const dmg = this.definition.selfDestructDamage ?? (this.definition.damage * (this.definition.barrierDamageMultiplier || 1));
        targetSummon.takeDamage(dmg);
        spawnShockwaveRing(this.scene, {
          x: this.x, y: this.y, color: 0xef4444, endRadius: 100, strokeWidth: 8, fillAlpha: 0.3, durationMs: 400
        });
        cameraPunch(this.scene, FX.cameraShake.shieldHit);
        this.hp = 0;
        this.takeDamage(0);
        return;
      }
      
      this.model.setState('idle');
      this.attackCooldown -= delta;
      if (this.attackCooldown <= 0) {
        targetSummon.takeDamage(this.definition.damage);
        this.attackCooldown = this.getEffectiveAttackRateMs();
        this.model.setState('attack');
      }
    } else if (this.y + this.sizePx / 2 >= shield.y - shield.height / 2 - (this.definition.attackRangePx ?? 0)) {
      // Within fixed attack range of the shield's front (top) edge — halt and
      // attack. attackRangePx 0 (default) = the old melee contact point, which
      // RALLY.formation.enemyContactAheadPx relies on.
      this.y = shield.y - shield.height / 2 - this.sizePx / 2 - (this.definition.attackRangePx ?? 0);

      if (this.definition.selfDestructOnBarrier) {
        const dmg = this.definition.selfDestructDamage ?? (this.definition.damage * (this.definition.barrierDamageMultiplier || 1));
        shield.takeDamage(dmg);
        spawnShockwaveRing(this.scene, {
          x: this.x, y: this.y, color: 0xef4444, endRadius: 100, strokeWidth: 8, fillAlpha: 0.3, durationMs: 400
        });
        cameraPunch(this.scene, FX.cameraShake.shieldHit);
        this.hp = 0;
        this.takeDamage(0);
        return;
      }

      this.model.setState('idle');
      this.attackCooldown -= delta;
      if (this.attackCooldown <= 0) {
        const dmg = this.definition.damage * (this.definition.barrierDamageMultiplier || 1);
        shield.takeDamage(dmg);
        this.attackCooldown = this.getEffectiveAttackRateMs();
        this.model.setState('attack');
      }
    } else if (moveSpeed > 0) {
      // Move down toward the rally
      this.y += moveSpeed * (delta / 1000);
      this.model.setState(moveSpeed >= ENEMY_VISUALS.runSpeedThresholdPxPerSec ? 'run' : 'walk');
    } else {
      this.model.setState('idle');
    }
  }
}
