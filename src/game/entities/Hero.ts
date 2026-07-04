import Phaser from 'phaser';
import type { Enemy } from './Enemy';
import type { HeroDefinition } from '../data/balance';

export class Hero extends Phaser.GameObjects.Container {
  public id: string;
  public definition: HeroDefinition;
  private rangeX: number; // The X coordinate to stop marching
  private speed = 80;
  private attackCooldown = 0;
  public attackRateMs: number;
  public damage: number;
  public range: number;
  private projectileColor: number;
  private onAttack: (hero: Hero, target: Enemy) => void;
  
  public skillCooldownMs = 5000;
  public currentSkillCooldown = 5000; // start on cooldown
  public isSkillReady = false;

  private bodyShape: Phaser.GameObjects.Rectangle;
  private skillHighlight: Phaser.GameObjects.Text;

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
    this.projectileColor = def.projectileColor || def.color;
    this.onAttack = onAttack;

    this.bodyShape = scene.add.rectangle(0, 0, 30, 40, def.color);
    this.add(this.bodyShape);
    
    const nameLabel = scene.add.text(0, 25, `${def.name}\n[${def.attackStyle}]`, { 
      fontSize: '10px', 
      color: '#ffffff', 
      align: 'center' 
    }).setOrigin(0.5, 0);
    this.add(nameLabel);
    
    this.skillHighlight = scene.add.text(0, -35, '★ SKILL', { fontSize: '12px', color: '#facc15', fontStyle: 'bold' }).setOrigin(0.5);
    this.skillHighlight.setVisible(false);
    this.add(this.skillHighlight);

    // Make interactive
    this.setSize(30, 40);
    this.setInteractive({ useHandCursor: true });
    this.on('pointerdown', () => {
      this.useSkill();
    });

    scene.add.existing(this);
  }

  update(delta: number, enemies: Enemy[]) {
    // Marching
    if (this.x < this.rangeX) {
      this.x += this.speed * (delta / 1000);
    } else {
      this.x = this.rangeX;
    }

    // Auto-attack
    this.attackCooldown -= delta;
    if (this.attackCooldown <= 0) {
      // Find lowest-X enemy (closest to barrier)
      let target: Enemy | null = null;
      let minEnemyX = 9999;
      for (const enemy of enemies) {
        if (!enemy.isDead && enemy.x < minEnemyX && enemy.x > this.x) {
          minEnemyX = enemy.x;
          target = enemy;
        }
      }

      if (target && target.x - this.x <= this.range) {
        this.onAttack(this, target);
        this.attackCooldown = this.attackRateMs;
        // Simple attack visual
        this.scene.tweens.add({ targets: this.bodyShape, x: 10, yoyo: true, duration: 100 });
      }
    }

    // Skill cooldown logic
    if (!this.isSkillReady) {
      this.currentSkillCooldown -= delta;
      if (this.currentSkillCooldown <= 0) {
        this.isSkillReady = true;
        this.skillHighlight.setVisible(true);
        // Simple pulsing animation
        this.scene.tweens.add({ targets: this.skillHighlight, scale: 1.2, yoyo: true, repeat: -1, duration: 500 });
      }
    }
  }

  useSkill() {
    if (!this.isSkillReady) return;
    this.isSkillReady = false;
    this.currentSkillCooldown = this.skillCooldownMs;
    this.skillHighlight.setVisible(false);
    this.scene.tweens.killTweensOf(this.skillHighlight);
    this.skillHighlight.setScale(1);
    
    // Visually show skill used
    this.scene.tweens.add({ targets: this.bodyShape, angle: 360, duration: 300 });
  }
}
