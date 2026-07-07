import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH } from '../../data/level';

/** Which side a cut-in belongs to — drives the frame accent color. */
export type CutInFaction = 'hero' | 'enemy';

export interface SkillCutInOptions {
  /** Skill name shown big and bold. */
  skillName: string;
  /**
   * Which side this cut-in belongs to. Sets the reusable frame accent:
   * green for heroes, red for enemies. Defaults to 'hero'.
   */
  faction?: CutInFaction;
  /**
   * Accent color override for the frame + label. Defaults to the faction
   * color, so most callers can leave this unset.
   */
  tint?: number;
  /**
   * Texture key for the hero silhouette. Defaults to the shared hero-base
   * cut-out; swap in a per-hero portrait texture here once art exists.
   */
  portraitKey?: string;
  /** Optional custom hold duration in ms (defaults to 420) */
  durationMs?: number;
  /** Optional top and bottom margin to prevent hugging the exact screen edges (0 = fullscreen). */
  marginY?: number;
  /** Optional left and right margin (0 = fullscreen width). */
  marginX?: number;
  /**
   * Zoom the art inside the fixed frame. 1 = cover-fit (fills the box). The
   * art is clipped to the frame, so this only affects how much shows. Only
   * this and the offsets should need tuning per character.
   */
  artScale?: number;
  /** Nudge the art horizontally inside the frame, in px (post-scale). */
  artOffsetX?: number;
  /** Nudge the art vertically inside the frame, in px (post-scale). */
  artOffsetY?: number;
  /** Side of the screen to slide the cut-in from ('left' or 'right') */
  position?: 'left' | 'right';
  /** Fired once the panel has fully slid back off-screen. */
  onComplete?: () => void;
}

/**
 * Anime-style signature-skill cut-in (docs/ART_AND_AUDIO_GUIDELINES.md 2C).
 *
 * Units with real cut-in art get the fullscreen diagonal cutout: a
 * screen-filling parallelogram (green for heroes, red for enemies) with
 * yellow/black hazard stripes on its slanted edges, the art clipped inside
 * the cutout, and the skill name sprayed across it graffiti-style. Units
 * without art fall back to the legacy sliding silhouette panel.
 *
 * Purely cosmetic: it renders above the world (high depth) and pins to the
 * camera with setScrollFactor(0), so it does not care where the rally has
 * scrolled to. The caller pauses and resumes gameplay around it via
 * onComplete.
 */
export class SkillCutIn {
  private static readonly SLIDE_MS = 240;
  private static readonly HOLD_MS = 420;
  private static readonly PANEL_TILT = -0.18; // radians; slight diagonal slash

  /** Cutout accent per faction: bright green heroes, bright red enemies. */
  private static readonly FACTION_ACCENT: Record<CutInFaction, number> = {
    hero: 0x2fff6a,
    enemy: 0xff2d2d,
  };

  // Fullscreen diagonal-cutout tuning.
  private static readonly CUT_SLANT_PX = 220;      // vertical drop of each diagonal edge across the screen
  private static readonly STRIPE_THICKNESS = 36;   // hazard band depth along each diagonal edge
  private static readonly STRIPE_LENGTH = 80;      // length of each yellow/black hazard segment
  private static readonly HAZARD_YELLOW = 0xffd60a;

  private readonly scene: Phaser.Scene;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  play(options: SkillCutInOptions): void {
    const { scene } = this;
    const centerY = GAME_HEIGHT / 2;
    const faction = options.faction ?? 'hero';
    const accent = options.tint ?? SkillCutIn.FACTION_ACCENT[faction];
    const hasPortrait = !!options.portraitKey && scene.textures.exists(options.portraitKey);

    const container = scene.add.container(0, centerY);
    container.setScrollFactor(0);
    container.setDepth(10_000);

    if (hasPortrait) {
      // FULLSCREEN DIAGONAL CUTOUT
      // A screen-filling parallelogram (green heroes / red enemies) with
      // yellow hazard stripes on the slanted edges. The art is cover-fit and
      // clipped to the cutout, so per-character tuning is limited to
      // artScale / artOffset{X,Y}.
      this.playDiagonal(container, centerY, accent, options);
    } else {
      // LEGACY DIAGONAL SLIDING PANEL (For silhouettes)
      const panelWidth = GAME_WIDTH * 1.4;
      const panelHeight = 190;
      
      container.setRotation(SkillCutIn.PANEL_TILT);

      // Solid backing slab
      const slab = scene.add.rectangle(0, 0, panelWidth, panelHeight, 0x0f172a, 0.96);
      slab.setStrokeStyle(6, accent, 1);
      container.add(slab);

      // Speed lines
      for (let i = 0; i < 14; i++) {
        const y = -panelHeight / 2 + (i + 0.5) * (panelHeight / 14);
        const line = scene.add.rectangle(
          Phaser.Math.Between(-panelWidth / 2, panelWidth / 2),
          y,
          Phaser.Math.Between(80, 260),
          Phaser.Math.Between(2, 5),
          i % 2 === 0 ? accent : 0xffffff,
          i % 2 === 0 ? 0.5 : 0.18,
        );
        container.add(line);
      }

      // Static Portrait
      const portrait = scene.add.image(-GAME_WIDTH * 0.28, 0, options.portraitKey ?? 'hero-base');
      portrait.setDisplaySize(150, 200);
      portrait.setTint(accent);
      portrait.setRotation(-SkillCutIn.PANEL_TILT);
      container.add(portrait);

      // Standard Text
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

      // Start off-screen, slide in, hold, slide out
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
            delay: options.durationMs ?? SkillCutIn.HOLD_MS,
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

  /**
   * Fullscreen diagonal-cutout cut-in. A screen-filling parallelogram with
   * slanted top/bottom edges holds the art: green for heroes, red for enemies,
   * with yellow/black hazard stripes riding both diagonal edges. The art is
   * cover-fit and clipped to the cutout polygon — the sprite sheet can never
   * overflow outside the diagonal. The skill name sprays across the middle in
   * a graffiti hand, rotated to match the slash. Only artScale /
   * artOffset{X,Y} should need tuning per character.
   */
  private playDiagonal(
    container: Phaser.GameObjects.Container,
    centerY: number,
    accent: number,
    options: SkillCutInOptions,
  ): void {
    const { scene } = this;
    const key = options.portraitKey!;
    const animKey = `${key}-anim`;
    const totalMs = options.durationMs ?? 1500;

    // Cutout bounds — full viewport by default; margins shrink it in.
    const boxW = GAME_WIDTH - (options.marginX ?? 0) * 2;
    const boxH = GAME_HEIGHT - (options.marginY ?? 0) * 2;
    const halfW = boxW / 2;
    const halfH = boxH / 2;
    const slant = Math.min(SkillCutIn.CUT_SLANT_PX, boxH * 0.25);

    // Parallelogram corners (TL, TR, BR, BL), container-relative. `position`
    // flips which way the slash leans.
    const leanRight = options.position === 'right';
    const corners: [number, number][] = leanRight
      ? [
          [-halfW, -halfH],
          [halfW, -halfH + slant],
          [halfW, halfH],
          [-halfW, halfH - slant],
        ]
      : [
          [-halfW, -halfH + slant],
          [halfW, -halfH],
          [halfW, halfH - slant],
          [-halfW, halfH],
        ];
    const pts = corners.map(([x, y]) => new Phaser.Math.Vector2(x, y));

    // Dark backdrop, faded in with the container.
    const overlay = scene.add.rectangle(GAME_WIDTH / 2, centerY, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.85);
    overlay.setScrollFactor(0).setDepth(9_999).setAlpha(0);

    container.x = GAME_WIDTH / 2;
    container.setAlpha(0);

    // Faction-colored backing — shows through wherever the art is transparent,
    // so the cutout always reads green (hero) or red (enemy).
    const backing = scene.add.graphics();
    backing.fillStyle(accent, 1);
    backing.fillPoints(pts, true);
    container.add(backing);

    // Art: cover-fit to the cutout bounds so it always fills, then nudged.
    const sprite = scene.add.sprite(0, 0, key);
    const fit = Math.max(boxW / sprite.width, boxH / sprite.height);
    sprite.setScale(fit * (options.artScale ?? 1));
    sprite.x = options.artOffsetX ?? 0;
    sprite.y = options.artOffsetY ?? 0;
    if (scene.anims.exists(animKey)) sprite.play({ key: animKey, duration: totalMs });
    container.add(sprite);

    // Clip the art to the diagonal cutout so the sprite sheet never spills
    // past the slanted edges. Mask lives in screen space and pins to the
    // camera (scrollFactor 0) to stay aligned with the viewport-locked container.
    const maskShape = scene.make.graphics({}, false);
    maskShape.fillStyle(0xffffff);
    maskShape.fillPoints(pts.map((p) => new Phaser.Math.Vector2(p.x + GAME_WIDTH / 2, p.y + centerY)), true);
    maskShape.setScrollFactor(0);
    sprite.setMask(maskShape.createGeometryMask());

    // Yellow/black hazard stripes riding both diagonal edges, drawn inward so
    // they stay inside the cutout, then an accent stroke around the whole rim.
    const trim = scene.add.graphics();
    this.drawHazardEdge(trim, pts[0], pts[1], 1);  // top edge, stripes face down
    this.drawHazardEdge(trim, pts[3], pts[2], -1); // bottom edge, stripes face up
    trim.lineStyle(10, accent, 1);
    trim.strokePoints(pts, true, true);
    trim.lineStyle(3, 0xffffff, 0.85);
    trim.strokePoints(pts, true, true);
    container.add(trim);

    // Skill name as graffiti — marker hand, oversized, rotated to ride the
    // diagonal, heavy black outline + drop shadow like a spray tag.
    const tiltAngle = Math.atan2(leanRight ? slant : -slant, boxW);
    const label = scene.add.text(0, halfH * 0.45, options.skillName.toUpperCase(), {
      fontFamily: '"Permanent Marker", "Sedgwick Ave", Impact, cursive',
      fontSize: '128px',
      fontStyle: 'italic',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 18,
      align: 'center',
      shadow: { offsetX: 10, offsetY: 10, color: '#000000', blur: 0, stroke: true, fill: true },
    }).setOrigin(0.5);
    label.setRotation(tiltAngle);
    label.setTint(accent, accent, 0xffffff, 0xffffff);
    container.add(label);

    const fadeDuration = 200;
    scene.tweens.add({
      targets: [container, overlay],
      alpha: 1,
      duration: fadeDuration,
      onComplete: () => {
        scene.tweens.add({
          targets: [container, overlay],
          alpha: 0,
          delay: Math.max(0, totalMs - fadeDuration * 2),
          duration: fadeDuration,
          onComplete: () => {
            maskShape.destroy();
            container.destroy();
            overlay.destroy();
            options.onComplete?.();
          },
        });
      },
    });
  }

  /**
   * Paint alternating yellow/black hazard segments along one diagonal edge,
   * extending inward (`inwardY`: 1 = downward for the top edge, -1 = upward
   * for the bottom edge) so the stripes never poke outside the cutout.
   */
  private drawHazardEdge(
    g: Phaser.GameObjects.Graphics,
    a: Phaser.Math.Vector2,
    b: Phaser.Math.Vector2,
    inwardY: 1 | -1,
  ): void {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const len = Math.hypot(dx, dy);
    if (len === 0) return;
    const ux = dx / len;
    const uy = dy / len;
    // Edge normal flipped to point into the cutout.
    let nx = -uy;
    let ny = ux;
    if (Math.sign(ny) !== inwardY) {
      nx = -nx;
      ny = -ny;
    }
    const t = SkillCutIn.STRIPE_THICKNESS;
    const seg = SkillCutIn.STRIPE_LENGTH;
    for (let d = 0, i = 0; d < len; d += seg, i++) {
      const e = Math.min(d + seg, len);
      g.fillStyle(i % 2 === 0 ? SkillCutIn.HAZARD_YELLOW : 0x111111, 1);
      g.fillPoints(
        [
          new Phaser.Math.Vector2(a.x + ux * d, a.y + uy * d),
          new Phaser.Math.Vector2(a.x + ux * e, a.y + uy * e),
          new Phaser.Math.Vector2(a.x + ux * e + nx * t, a.y + uy * e + ny * t),
          new Phaser.Math.Vector2(a.x + ux * d + nx * t, a.y + uy * d + ny * t),
        ],
        true,
      );
    }
  }
}
