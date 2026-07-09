import Phaser from 'phaser';
import { cameraPunch } from './fx/CameraPunch';
import { FX } from '../data/level';
import { SpriteAura } from './fx/SpriteAura';

const MORALE_TIERS = [
  { min: 0.6, core: 0x38bdf8, bright: 0x7dd3fc },
  { min: 0.3, core: 0xf59e0b, bright: 0xfcd34d },
  { min: 0, core: 0xef4444, bright: 0xfca5a5 },
] as const;

export class MoraleShield extends Phaser.GameObjects.Container {
  public hp: number;
  public maxHp: number;
  get isDead() { return this.hp <= 0; }
  public width: number;
  public height: number;
  
  private _doughBarrierActive = false;
  get doughBarrierActive() { return this._doughBarrierActive; }
  set doughBarrierActive(val: boolean) {
    this._doughBarrierActive = val;
    this.visualsContainer.setVisible(!val);
    this.doughImage.setVisible(val);
  }
  
  private visualsContainer: Phaser.GameObjects.Container;
  private bloom: Phaser.GameObjects.Rectangle;
  private coreLayer1: Phaser.GameObjects.Rectangle;
  private coreLayer2: Phaser.GameObjects.Rectangle;
  private scanningLine: Phaser.GameObjects.Rectangle;
  private edgeGlow1: Phaser.GameObjects.Rectangle;
  private edgeGlow2: Phaser.GameObjects.Rectangle;
  private edgeCore: Phaser.GameObjects.Rectangle;
  
  private doughImage: Phaser.GameObjects.Image;
  private scoreLabel: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number, maxHp: number) {
    super(scene, x, y);
    this.maxHp = maxHp;
    this.hp = maxHp;
    this.width = width;
    this.height = height;

    this.visualsContainer = scene.add.container(0, 0);

    // Highly detailed shield primitives to replace the SVG approach, allowing full dynamic color tinting!
    // 1. Massive ambient bloom
    this.bloom = scene.add.rectangle(0, 0, width + 40, height + 60, 0xffffff, 0.08);
    // 2. Thick translucent core base
    this.coreLayer1 = scene.add.rectangle(0, 0, width, height, 0xffffff, 0.15);
    // 3. Brighter inner core that pulsates
    this.coreLayer2 = scene.add.rectangle(0, 0, width - 20, height - 10, 0xffffff, 0.2);
    // 4. Scanning laser line (simulates a high-tech field)
    this.scanningLine = scene.add.rectangle(-width / 2 + 10, 0, width / 4, height, 0xffffff, 0.15);
    // 5. Very wide, soft leading edge glow
    this.edgeGlow1 = scene.add.rectangle(0, -height / 2, width + 20, 20, 0xffffff, 0.2);
    // 6. Tighter, brighter leading edge glow
    this.edgeGlow2 = scene.add.rectangle(0, -height / 2, width, 8, 0xffffff, 0.5);
    // 7. Searing bright core of the leading edge
    this.edgeCore = scene.add.rectangle(0, -height / 2, width, 3, 0xffffff, 1);

    this.visualsContainer.add([
      this.bloom, 
      this.coreLayer1, 
      this.coreLayer2, 
      this.scanningLine, 
      this.edgeGlow1, 
      this.edgeGlow2, 
      this.edgeCore
    ]);

    // Dough image fallback
    this.doughImage = scene.add.image(0, 0, 'dough-barrier').setVisible(false);
    this.doughImage.setDisplaySize(width + 40, height + 40);

    // Morale score lives ON the barrier
    this.scoreLabel = scene.add.text(0, 0, `${maxHp}`, {
      fontSize: '32px',
      fontStyle: 'bold',
      color: '#ffffff',
      stroke: '#0f172a',
      strokeThickness: 6,
    }).setOrigin(0.5);
    this.scoreLabel.setShadow(0, 4, '#000000', 4, true, true);
    
    this.add([this.visualsContainer, this.doughImage, this.scoreLabel]);
    
    this.refreshMoraleVisual();
    
    // Ambient animations
    scene.tweens.add({
      targets: [this.coreLayer2, this.edgeGlow1],
      alpha: '+=0.1',
      yoyo: true,
      repeat: -1,
      duration: 1200,
      ease: 'Sine.easeInOut',
    });

    scene.tweens.add({
      targets: this.scanningLine,
      x: width / 2 - 10,
      alpha: 0.3,
      yoyo: true,
      repeat: -1,
      duration: 1800,
      ease: 'Sine.easeInOut',
    });

    scene.add.existing(this);
  }

  playHealVisual() {
    const aura = new SpriteAura(this.scene, 0x10b981, this.width);
    this.add(aura);
    aura.play();
    
    // Green flash over the whole barrier
    const flash = this.scene.add.rectangle(0, 0, this.width, this.height, 0x10b981, 0.6);
    this.add(flash);
    this.scene.tweens.add({
      targets: flash,
      alpha: 0,
      duration: 800,
      onComplete: () => flash.destroy()
    });
    
    // Auto-remove after 3 seconds
    this.scene.time.delayedCall(3000, () => {
      aura.destroy();
    });
  }

  heal(amount: number) {
    if (this.isDead) return;
    this.hp = Math.min(this.maxHp, this.hp + amount);
    this.refreshMoraleVisual();
    this.playHealVisual();
    try { this.scene.sound.play('sfx-heal'); } catch (e) {}
  }

  takeDamage(amount: number) {
    if (this.hp <= 0 || this.doughBarrierActive) return; // already dead or protected
    this.hp = Math.max(0, this.hp - amount);

    if (this.hp <= 0) {
      try { this.scene.sound.play('sfx-barrier-break'); } catch (e) {}
    } else {
      try { this.scene.sound.play('sfx-barrier-hit'); } catch (e) {}
    }

    this.refreshMoraleVisual();
    this.spawnCrack();
    
    // Hard flash white on damage
    this.edgeCore.setFillStyle(0xffffff, 1);
    this.edgeGlow2.setFillStyle(0xffffff, 1);
    this.scene.tweens.add({
      targets: [this.edgeCore, this.edgeGlow2],
      alpha: 1,
      yoyo: true,
      duration: 100,
      onComplete: () => this.refreshMoraleVisual()
    });

    cameraPunch(this.scene, FX.cameraShake.shieldHit);

    // Shield flickers slightly
    this.scene.tweens.add({
      targets: this.visualsContainer,
      alpha: 0.3,
      yoyo: true,
      duration: 100,
    });
  }

  private moraleTier() {
    const ratio = this.maxHp > 0 ? this.hp / this.maxHp : 0;
    return MORALE_TIERS.find((t) => ratio >= t.min) ?? MORALE_TIERS[MORALE_TIERS.length - 1];
  }

  private refreshMoraleVisual(): void {
    const ratio = this.maxHp > 0 ? this.hp / this.maxHp : 0;
    const tier = this.moraleTier();
    
    // Dynamically colorize the detailed shield
    this.bloom.setFillStyle(tier.core, 0.08);
    this.coreLayer1.setFillStyle(tier.core, 0.15 + (0.1 * ratio));
    this.coreLayer2.setFillStyle(tier.bright, 0.2 + (0.1 * ratio));
    this.scanningLine.setFillStyle(tier.bright, 0.15);
    
    this.edgeGlow1.setFillStyle(tier.core, 0.2);
    this.edgeGlow2.setFillStyle(tier.bright, 0.5);
    this.edgeCore.setFillStyle(tier.bright, 1);

    this.scoreLabel.setText(`${this.hp}`);
    this.scoreLabel.setColor(ratio > 0.6 ? '#e0f2fe' : ratio > 0.3 ? '#fef3c7' : '#fee2e2');
  }

  private spawnCrack(): void {
    const xOffset = Phaser.Math.Between(-this.width / 2, this.width / 2);
    const crack = this.scene.add.graphics();
    crack.lineStyle(2, 0xffffff, 0.9);
    crack.beginPath();
    crack.moveTo(xOffset, -this.height / 2);
    
    let currentY = -this.height / 2;
    let currentX = xOffset;
    
    for (let i = 0; i < 4; i++) {
      currentY += Phaser.Math.Between(5, 15);
      currentX += Phaser.Math.Between(-10, 10);
      crack.lineTo(currentX, currentY);
    }
    crack.strokePath();
    this.add(crack);
    
    this.scene.tweens.add({
      targets: crack,
      alpha: 0,
      duration: 300,
      onComplete: () => crack.destroy()
    });
  }
}
