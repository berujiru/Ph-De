import Phaser from 'phaser';
import { cameraPunch } from './fx/CameraPunch';
import { FX } from '../data/level';

/**
 * The crowd's morale, made visible: a glowing shield-WALL of light that travels
 * at the FRONT of the rally formation. In portrait it is a HORIZONTAL bar
 * spanning the lane, its bright leading edge facing UP toward the enemies. Built
 * as layered energy — a soft outer bloom, a translucent core fill with a
 * drifting shimmer, and a bright leading edge — so it reads as a rallying
 * crowd's barrier rather than a flat rectangle. Gameplay-wise it keeps the old
 * Barrier semantics: it is the single thing enemies attack, and its hp/maxHp are
 * reported as barrierHp/maxBarrierHp in the snapshot ("Morale" in the HUD). The
 * scene moves it via `y` as the formation advances up.
 */
/**
 * Morale color ramp — healthy sky-blue, worried amber, critical red. The wall,
 * edges and score all shift together so the barrier itself reads as the HP bar.
 */
const MORALE_TIERS = [
  { min: 0.6, core: 0x38bdf8, bright: 0x7dd3fc },
  { min: 0.3, core: 0xf59e0b, bright: 0xfcd34d },
  { min: 0, core: 0xef4444, bright: 0xfca5a5 },
] as const;

export class MoraleShield extends Phaser.GameObjects.Container {
  public hp: number;
  public maxHp: number;
  public width: number;
  public height: number;
  private bloom: Phaser.GameObjects.Rectangle;
  private wall: Phaser.GameObjects.Rectangle;
  private shimmer: Phaser.GameObjects.Rectangle;
  private edgeGlow: Phaser.GameObjects.Rectangle;
  private edge: Phaser.GameObjects.Rectangle;
  /** The morale score, rendered on the barrier itself (no HUD pill). */
  private scoreLabel: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number, maxHp: number) {
    super(scene, x, y);
    this.maxHp = maxHp;
    this.hp = maxHp;
    this.width = width;
    this.height = height;

    // Soft outer bloom — the light bleeding past the wall (vertically).
    this.bloom = scene.add.rectangle(0, 0, width, height + 18, 0x38bdf8, 0.08);
    // Translucent energy core.
    this.wall = scene.add.rectangle(0, 0, width, height, 0x38bdf8, 0.18);
    // A bright horizontal shimmer band that drifts across the wall, suggesting
    // flowing energy without a texture asset.
    this.shimmer = scene.add.rectangle(-width / 4, 0, width / 3, height - 4, 0x7dd3fc, 0.12);
    // Leading edge (top, facing the enemies), brightened in place rather than
    // drawn ahead of the wall (playtesters read a detached arc as a second shield).
    this.edgeGlow = scene.add.rectangle(0, -height / 2 + 5, width, 10, 0x38bdf8, 0.3);
    this.edge = scene.add.rectangle(0, -height / 2 + 2, width, 4, 0x7dd3fc, 0.9);
    // Morale score lives ON the barrier (replaces the HUD pill).
    this.scoreLabel = scene.add.text(0, 0, `${maxHp}`, {
      fontSize: '30px',
      fontStyle: 'bold',
      color: '#e0f2fe',
      stroke: '#0f172a',
      strokeThickness: 5,
    }).setOrigin(0.5);
    this.add([this.bloom, this.wall, this.shimmer, this.edgeGlow, this.edge, this.scoreLabel]);
    this.refreshMoraleVisual();

    // Idle morale pulse.
    scene.tweens.add({
      targets: [this.wall, this.edgeGlow, this.edge, this.bloom],
      alpha: '+=0.12',
      yoyo: true,
      repeat: -1,
      duration: 900,
      ease: 'Sine.easeInOut',
    });

    // Slow shimmer drift across the wall.
    scene.tweens.add({
      targets: this.shimmer,
      x: width / 4,
      alpha: 0.2,
      yoyo: true,
      repeat: -1,
      duration: 1600,
      ease: 'Sine.easeInOut',
    });

    scene.add.existing(this);
  }

  takeDamage(amount: number) {
    if (this.hp <= 0) return; // already dead
    this.hp = Math.max(0, this.hp - amount);

    if (this.hp <= 0) {
      try { this.scene.sound.play('sfx-barrier-break'); } catch (e) {}
    } else {
      try { this.scene.sound.play('sfx-barrier-hit'); } catch (e) {}
    }

    // Barrier IS the HP readout — retint + update the on-wall score.
    this.refreshMoraleVisual();

    // Reactive flash: the leading edge flares white and a crack skitters down it.
    this.flashEdge();
    this.spawnCrack();
    cameraPunch(this.scene, FX.cameraShake.shieldHit);

    // Morale flicker on hit.
    this.scene.tweens.add({
      targets: this,
      alpha: 0.4,
      yoyo: true,
      duration: 100,
    });
  }

  /** Current color tier for the hp ratio — drives every layer + the score. */
  private moraleTier() {
    const ratio = this.maxHp > 0 ? this.hp / this.maxHp : 0;
    return MORALE_TIERS.find((t) => ratio >= t.min) ?? MORALE_TIERS[MORALE_TIERS.length - 1];
  }

  /**
   * Make the barrier itself read as the morale meter: color shifts
   * blue → amber → red as hp drops, the energy core thins out, and the
   * on-wall score updates.
   */
  private refreshMoraleVisual(): void {
    const ratio = this.maxHp > 0 ? this.hp / this.maxHp : 0;
    const tier = this.moraleTier();
    this.bloom.setFillStyle(tier.core, 0.08);
    // Core thins as morale drains — a nearly-broken wall looks nearly gone.
    this.wall.setFillStyle(tier.core, 0.08 + 0.14 * ratio);
    this.shimmer.setFillStyle(tier.bright, 0.12);
    this.edgeGlow.setFillStyle(tier.core, 0.3);
    this.edge.setFillStyle(tier.bright, 0.9);
    this.scoreLabel.setText(`${this.hp}`);
    this.scoreLabel.setColor(ratio > 0.6 ? '#e0f2fe' : ratio > 0.3 ? '#fef3c7' : '#fee2e2');
  }

  private flashEdge(): void {
    this.edge.setFillStyle(0xffffff);
    this.edgeGlow.setFillStyle(0xffffff);
    this.scene.tweens.add({
      targets: [this.edge, this.edgeGlow],
      alpha: 1,
      yoyo: true,
      duration: 90,
      onComplete: () => {
        const tier = this.moraleTier();
        this.edge.setFillStyle(tier.bright, 0.9);
        this.edgeGlow.setFillStyle(tier.core, 0.3);
      },
    });
  }

  /** A short jagged crack of light at the impacted point on the leading (top) edge. */
  private spawnCrack(): void {
    const edgeY = -this.height / 2 + 2;
    const cx = Phaser.Math.Between(-this.width / 2 + 20, this.width / 2 - 20);
    let px = cx;
    let py = edgeY;
    const crackLines: Phaser.GameObjects.Line[] = [];
    for (let i = 0; i < 3; i++) {
      const nx = px + Phaser.Math.Between(-16, 16);
      const ny = py + Phaser.Math.Between(6, 14);
      const line = this.scene.add.line(0, 0, px, py, nx, ny, 0xffffff, 0.9).setOrigin(0, 0);
      line.setLineWidth(2);
      this.add(line);
      crackLines.push(line);
      px = nx;
      py = ny;
    }
    this.scene.tweens.add({
      targets: crackLines,
      alpha: 0,
      duration: 220,
      onComplete: () => crackLines.forEach(l => l.destroy()),
    });
  }

  /** Restore morale (e.g. the Barrier Patch drop) and re-sync the visual. */
  heal(amount: number): void {
    this.hp = Math.min(this.maxHp, this.hp + amount);
    this.refreshMoraleVisual();
  }

  get isDead() {
    return this.hp <= 0;
  }
}
