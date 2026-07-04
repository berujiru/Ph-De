import Phaser from 'phaser';
import type { EnemyDefinition } from '../data/balance';
import { ENEMY_VISUALS } from '../data/balance';
import type { MoraleShield } from './MoraleShield';
import type { Summon } from './Summon';
import type { ISkillEnemy } from '../core/Skills';
import { EnemyModel } from './models/EnemyModel';

export type AilmentType = 'burn' | 'slow' | 'wet' | 'freeze' | 'stun' | 'poison' | 'bleed' | 'rot' | 'sleep' | 'curse' | 'knockback' | 'armorShred';

const AILMENT_ICONS: Record<AilmentType, string> = {
  burn: '🔥',
  slow: '🐌',
  wet: '💧',
  freeze: '❄️',
  stun: '💫',
  poison: '🧪',
  bleed: '🩸',
  rot: '🦠',
  sleep: '💤',
  curse: '👁️',
  knockback: '💨',
  armorShred: '🛡️'
};

const AILMENT_OVERLAYS: Record<AilmentType, string> = {
  burn: '☄️',
  slow: '⏳',
  wet: '💦',
  freeze: '🧊',
  stun: '⚡',
  poison: '🫧',
  bleed: '🩸',
  rot: '🪰',
  sleep: '💭',
  curse: '💀',
  knockback: '🌬️',
  armorShred: '🔨'
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

  // Passives
  public isStealthed = false;
  public fakeHp = 0;
  public hitImmunityCount = 0;

  // Timers for passives
  private stealVoicesTimer = 0;
  private knockbackPulseTimer = 0;
  private auraTimer = 0;

  // Ailment Tracking
  private ailmentBuildups: Record<string, number> = {};
  public activeAilments: Record<string, number> = {}; // Remaining ms
  private ailmentIcons: Record<string, Phaser.GameObjects.Text> = {};

  // Overlay tracking (to spawn particles on update)
  private overlayTimer = 0;

  // DoT Tracking
  private tickTimer = 0;

  constructor(scene: Phaser.Scene, x: number, y: number, definition: EnemyDefinition) {
    super(scene, x, y);
    this.id = definition.id;
    this.definition = definition;
    this.hp = definition.maxHp;

    this.model = new EnemyModel(scene, 0, 0, definition.color);
    this.add(this.model);

    this.hpBarBg = scene.add.rectangle(0, -25, 30, 6, 0x000000, 0.5);
    this.hpBarFill = scene.add.rectangle(0, -25, 30, 6, 0x22c55e);
    this.add([this.hpBarBg, this.hpBarFill]);

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
      this.setSize(30, 30);
      this.setInteractive({ draggable: true });
      this.on('drag', (_pointer: Phaser.Input.Pointer, dragX: number, dragY: number) => {
        this.x = dragX;
        this.y = dragY;
      });

      const dragLabel = scene.add.text(0, 15, 'DRAG ME', { fontSize: '10px', color: '#ffffff' }).setOrigin(0.5);
      this.add(dragLabel);
    }
  }

  takeDamage(amount: number) {
    if (this.isDead) return;

    // Hit immunity completely blocks the hit
    if (this.hitImmunityCount > 0) {
      this.hitImmunityCount--;

      const blockText = this.scene.add.text(this.x, this.y - 30, 'BLOCKED', { fontSize: '12px', color: '#fff', fontStyle: 'bold' }).setOrigin(0.5);
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
    }

    const pct = Math.max(0, this.hp / this.definition.maxHp);
    this.hpBarFill.scaleX = pct;

    if (this.hp <= 0) {
      this.isDead = true;
      try { this.scene.sound.play('sfx-enemy-die'); } catch (e) {}
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
      this.scene.tweens.add({ targets: this, alpha: 0, duration: 300 });
      this.model.setState('death', { onComplete: () => this.destroy() });
    }
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
      const icon = this.scene.add.text(-15 + (idx * 15), -45, AILMENT_ICONS[type], { fontSize: '12px' }).setOrigin(0.5);
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
      fontSize: '14px',
      color: '#fff',
      backgroundColor: '#000',
      padding: { x: 4, y: 2 }
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
      const flash = this.scene.add.circle(this.x, this.y, 30, 0xef4444, 0.5);
      this.scene.tweens.add({
        targets: flash,
        scale: 4,
        alpha: 0,
        duration: 1000,
        onComplete: () => flash.destroy()
      });

      // Reset after 3 seconds
      this.scene.time.delayedCall(3000, () => {
        this.definition.speed /= 3;
      });
    }
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
        const txt = this.scene.add.text(this.x, this.y - 30, '-VOICE', { fontSize: '10px', color: '#10b981', fontStyle: 'bold' }).setOrigin(0.5);
        this.scene.tweens.add({ targets: txt, y: this.y - 60, alpha: 0, duration: 1000, onComplete: () => txt.destroy() });
      }
    }

    if (this.definition.knockbackPulseCooldown) {
      this.knockbackPulseTimer += delta;
      if (this.knockbackPulseTimer >= this.definition.knockbackPulseCooldown) {
        this.knockbackPulseTimer = 0;
        this.scene.events.emit('heroKnockback', { source: this, force: 100 });

        // Visual pulse
        const wave = this.scene.add.circle(this.x, this.y, 15, this.definition.color, 0.5);
        this.scene.tweens.add({
          targets: wave,
          scale: 4,
          alpha: 0,
          duration: 500,
          onComplete: () => wave.destroy()
        });
      }
    }

    if (this.definition.moraleAura) {
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
          if (type === 'freeze' || type === 'stun') {
            isStunnedOrFrozen = true;
          } else if (type === 'slow') {
            speedMult = 0.6; // −40% speed per docs/DAMAGE_AND_AILMENTS.md (no stack)
          }
        }
      }
    }

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
              { fontSize: '12px' }
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
      // Cannot move or attack
      this.model.setState('idle');
      return;
    }

    // Check if in range of any summon
    let targetSummon: Summon | null = null;
    for (const summon of summons) {
      if (!summon.isDead && Math.abs(this.x - summon.x) < 20 && Math.abs(this.y - summon.y) < 30) {
        targetSummon = summon;
        break;
      }
    }

    const moveSpeed = this.definition.speed * speedMult;

    if (targetSummon) {
      // Reached a summon, stop moving and start attacking
      this.model.setState('idle');
      this.attackCooldown -= delta;
      if (this.attackCooldown <= 0) {
        targetSummon.takeDamage(this.definition.damage);
        this.attackCooldown = this.definition.attackRateMs;
        this.model.setState('attack');
      }
    } else if (this.x <= shield.x + shield.width / 2 + moveSpeed * 0.1) {
      // Reached the morale shield, stop moving and start attacking
      this.x = shield.x + shield.width / 2 + moveSpeed * 0.1;

      this.model.setState('idle');
      this.attackCooldown -= delta;
      if (this.attackCooldown <= 0) {
        const dmg = this.definition.damage * (this.definition.barrierDamageMultiplier || 1);
        shield.takeDamage(dmg);
        this.attackCooldown = this.definition.attackRateMs;
        this.model.setState('attack');
      }
    } else if (moveSpeed > 0) {
      // Move left toward the rally
      this.x -= moveSpeed * (delta / 1000);
      this.model.setState(moveSpeed >= ENEMY_VISUALS.runSpeedThresholdPxPerSec ? 'run' : 'walk');
    } else {
      this.model.setState('idle');
    }
  }
}
