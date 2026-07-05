import Phaser from 'phaser';
import { FX } from '../../data/level';

/**
 * Floating combat text — fire-and-forget world-space labels that pop, rise and
 * fade. Used for damage numbers on enemy hits (white normal, gold crit). One
 * Text object per call, self-destroying on tween complete; at this game's scale
 * that GC churn is fine (mirrors the existing bark/`-VOICE` text pattern), and
 * could be pooled later if hit volume grows.
 */
export function spawnDamageNumber(
  scene: Phaser.Scene,
  x: number,
  y: number,
  amount: number,
  isCrit = false,
): void {
  const cfg = FX.damageNumber;
  const rounded = Math.max(1, Math.round(amount));
  const drift = (Math.random() - 0.5) * cfg.driftPx;

  const label = scene.add
    .text(x, y - 12, String(rounded), {
      fontSize: `${isCrit ? cfg.critFontSizePx : cfg.fontSizePx}px`,
      fontStyle: 'bold',
      color: isCrit ? cfg.critColor : cfg.normalColor,
      stroke: '#0f172a',
      strokeThickness: 4,
    })
    .setOrigin(0.5)
    .setDepth(50);

  // Quick pop then rise + fade.
  label.setScale(isCrit ? 0.6 : 0.75);
  scene.tweens.add({ targets: label, scale: isCrit ? 1.25 : 1, duration: 120, ease: 'Back.easeOut' });
  scene.tweens.add({
    targets: label,
    x: x + drift,
    y: y - 12 - cfg.risePx,
    alpha: 0,
    duration: cfg.durationMs,
    ease: 'Quad.easeOut',
    onComplete: () => label.destroy(),
  });
}
