import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH } from '../../data/level';

export interface SkillCutInOptions {
  /** Skill name shown big and bold. */
  skillName: string;
  /** Hero tint applied to the silhouette. */
  tint: number;
  /**
   * Texture key for the hero silhouette. Defaults to the shared hero-base
   * cut-out; swap in a per-hero portrait texture here once art exists.
   */
  portraitKey?: string;
  /** Fired once the panel has fully slid back off-screen. */
  onComplete?: () => void;
}

/**
 * Anime-style signature-skill cut-in (docs/ART_AND_AUDIO_GUIDELINES.md 2C).
 *
 * A viewport-pinned diagonal panel slides across the screen with a speed-line
 * background and the hero's tinted silhouette, holds on the skill name, then
 * slides out — roughly one second end to end. Purely cosmetic: it renders
 * above the world (high depth) and pins to the camera with setScrollFactor(0),
 * so it does not care where the rally has scrolled to. The caller pauses and
 * resumes gameplay around it via onComplete.
 *
 * Reusable and portrait-ready: pass any hero's tint (and later a real portrait
 * texture) into play().
 */
export class SkillCutIn {
  private static readonly SLIDE_MS = 240;
  private static readonly HOLD_MS = 420;
  private static readonly PANEL_TILT = -0.18; // radians; slight diagonal slash

  private readonly scene: Phaser.Scene;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  play(options: SkillCutInOptions): void {
    const { scene } = this;
    const centerY = GAME_HEIGHT / 2;
    const panelWidth = GAME_WIDTH * 1.4;
    const panelHeight = 190;

    const container = scene.add.container(0, centerY);
    container.setScrollFactor(0);
    container.setDepth(10_000);
    container.setRotation(SkillCutIn.PANEL_TILT);

    // Solid backing slab so the world doesn't bleed through the panel.
    const slab = scene.add.rectangle(0, 0, panelWidth, panelHeight, 0x0f172a, 0.96);
    slab.setStrokeStyle(6, options.tint, 1);
    container.add(slab);

    // Speed lines streaking across the panel behind the figure.
    for (let i = 0; i < 14; i++) {
      const y = -panelHeight / 2 + (i + 0.5) * (panelHeight / 14);
      const line = scene.add.rectangle(
        Phaser.Math.Between(-panelWidth / 2, panelWidth / 2),
        y,
        Phaser.Math.Between(80, 260),
        Phaser.Math.Between(2, 5),
        i % 2 === 0 ? options.tint : 0xffffff,
        i % 2 === 0 ? 0.5 : 0.18,
      );
      container.add(line);
    }

    // Hero silhouette — big, tinted, leaning into the slash.
    const portrait = scene.add.image(-GAME_WIDTH * 0.28, 0, options.portraitKey ?? 'hero-base');
    portrait.setDisplaySize(150, 200);
    portrait.setTint(options.tint);
    portrait.setRotation(-SkillCutIn.PANEL_TILT);
    container.add(portrait);

    const label = scene.add.text(GAME_WIDTH * 0.05, 0, options.skillName.toUpperCase(), {
      fontSize: '52px',
      fontStyle: 'bold',
      color: '#ffffff',
      stroke: '#0f172a',
      strokeThickness: 8,
      align: 'left',
    }).setOrigin(0.5);
    label.setRotation(-SkillCutIn.PANEL_TILT);
    container.add(label);

    // Start off-screen to the right, slide in, hold, slide out to the left.
    const restX = GAME_WIDTH / 2;
    container.x = GAME_WIDTH + panelWidth / 2;

    scene.tweens.add({
      targets: container,
      x: restX,
      duration: SkillCutIn.SLIDE_MS,
      ease: 'Back.easeOut',
      onComplete: () => {
        scene.tweens.add({
          targets: container,
          x: -panelWidth,
          delay: SkillCutIn.HOLD_MS,
          duration: SkillCutIn.SLIDE_MS,
          ease: 'Back.easeIn',
          onComplete: () => {
            container.destroy();
            options.onComplete?.();
          },
        });
      },
    });
  }
}
