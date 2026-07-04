import Phaser from 'phaser';
import type { Enemy } from './Enemy';
import type { HeroDefinition } from '../data/balance';
import { applyHeroPassive, type ISkillHero } from '../core/Skills';

export class Hero extends Phaser.GameObjects.Container implements ISkillHero {
  public id: string;
  public definition: HeroDefinition;
  public rangeX: number; // The X coordinate to stop marching
  private attackCooldown = 0;
  public attackRateMs: number;
  public damage: number;
  public range: number;
  private onAttack: (hero: Hero, target: Enemy) => void;
  
  public skillCooldownMs = 5000;
  public currentSkillCooldown = 5000; // start on cooldown
  public isSkillReady = false;
  
  public passiveOverride?: string;

  private bodyShape: Phaser.GameObjects.Rectangle;
  private skillHighlight: Phaser.GameObjects.Text;
  private attackBarBg: Phaser.GameObjects.Rectangle;
  private attackBarFill: Phaser.GameObjects.Rectangle;
  private skillBarBg: Phaser.GameObjects.Rectangle;
  private skillBarFill: Phaser.GameObjects.Rectangle;
  private rangeIndicator: Phaser.GameObjects.Arc;

  constructor(scene: Phaser.Scene, x: number, y: number, def: HeroDefinition, rangeX: number, onAttack: (hero: Hero, target: Enemy) => void) {
    super(scene, x, y);
    this.id = def.id;
    this.definition = def;
    
    // Set actual range based on attackKind and range stat
    // RangeX is the spot they stop on the field.
    // If ranged, they stop further back. If melee, they stop right at the barrier.
    if (def.attackKind === 'melee') {
      this.rangeX = rangeX + 20;
    } else {
      this.rangeX = Math.max(50, rangeX - 100 + (Math.random() * 20)); // somewhat behind
    }
    
    this.damage = def.damage;
    this.attackRateMs = def.attackRateMs;
    this.range = def.range;
    this.onAttack = onAttack;

    // Range indicator (added first so it's behind the body shape)
    this.rangeIndicator = scene.add.circle(0, 0, def.range, def.color, 0.1);
    this.rangeIndicator.setStrokeStyle(1, def.color, 0.5);
    this.rangeIndicator.setVisible(false);
    this.add(this.rangeIndicator);

    this.bodyShape = scene.add.rectangle(0, 0, 30, 40, def.color);
    this.add(this.bodyShape);
    
    const labelText = `${def.name}\nAtk: ${def.attackStyle}\nSkill: ${def.signatureSkill.name}`;
    const nameLabel = scene.add.text(0, 25, labelText, { 
      fontSize: '10px', 
      color: '#ffffff', 
      align: 'center',
      wordWrap: { width: 90, useAdvancedWrap: true }
    }).setOrigin(0.5, 0);
    this.add(nameLabel);
    
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

  update(delta: number, enemies: Enemy[]) {

    // Auto-attack
    this.attackCooldown = Math.max(0, this.attackCooldown - delta);
    if (this.attackCooldown === 0) {
      // Find lowest-X enemy (closest to barrier), prioritizing tauntAura
      let target: Enemy | null = null;
      let minEnemyX = 9999;
      let foundTaunt = false;
      
      for (const enemy of enemies) {
        if (!enemy.isDead && enemy.x > this.x) {
          // Ignore stealthed enemies unless hero has canSeeStealth
          if (enemy.isStealthed && !this.definition.canSeeStealth) continue;
          
          if (enemy.definition.tauntAura && enemy.x - this.x <= this.range) {
            // Found a taunting enemy in range. Prioritize it immediately.
            // If multiple taunt, attack the closest one.
            if (!foundTaunt || enemy.x < minEnemyX) {
              minEnemyX = enemy.x;
              target = enemy;
              foundTaunt = true;
            }
          } else if (!foundTaunt && enemy.x < minEnemyX) {
            minEnemyX = enemy.x;
            target = enemy;
          }
        }
      }

      if (target && target.x - this.x <= this.range) {
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
        // Simple attack visual
        this.scene.tweens.add({ targets: this.bodyShape, x: 10, yoyo: true, duration: 100 });
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
    
    // Visually show skill used
    this.scene.tweens.add({ targets: this.bodyShape, angle: 360, duration: 300 });

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
