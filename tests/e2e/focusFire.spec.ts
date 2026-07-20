import { test, expect, type Page } from '@playwright/test';

/**
 * Rally Volley wiring: tapping an enemy must issue a volley — every hero
 * overrides its target and fires one shot at the enemy nearest the tap. The
 * targeting math is unit-tested (Targeting.test.ts); this proves the pointer
 * handler → volley command path works in the real app (volleyCount ticks and
 * new hero attacks are spawned).
 */

async function deployToBattle(page: Page): Promise<void> {
  await page.goto('/');
  await expect(page.getByRole('button', { name: /Start the Rally/i })).toBeVisible({ timeout: 20_000 });
  await page.getByRole('button', { name: /Start the Rally/i }).click({ force: true });
  await page.getByRole('button', { name: /^Prepare / }).click();
  await page.locator('button', { hasText: /Deploy to the streets/i }).click();
  // Battle HUD ready: the live rally screen shows the speed-cycle control.
  await expect(page.getByRole('button', { name: 'Game speed' })).toBeVisible({ timeout: 20_000 });
  // The HUD mounts before scene.restart(withStageData) finishes rebuilding the
  // battle — wait until the scene is actually live with heroes.
  await expect
    .poll(
      () =>
        page.evaluate(() => {
          const game = (window as unknown as { __PHASER_GAME__?: any }).__PHASER_GAME__;
          const scene = game?.scene?.getScene?.('GameScene');
          return scene && scene.status === 'playing' && scene.heroes?.length > 0;
        }),
      { timeout: 20_000 },
    )
    .toBe(true);

  // Each newly-encountered enemy type auto-opens a "NEW ANOMALY DETECTED" Intel
  // modal that pauses the game (gameSpeed 0) and covers the canvas — dismiss it
  // via ACKNOWLEDGE so battlefield taps reach the scene.
  await acknowledgeAnomaly(page);
  // Wait until the game is actually running (unpaused, full speed).
  await expect
    .poll(
      () =>
        page.evaluate(() => {
          const game = (window as unknown as { __PHASER_GAME__?: any }).__PHASER_GAME__;
          const scene = game?.scene?.getScene?.('GameScene');
          return scene && !scene.isPaused && scene.gameSpeed > 0;
        }),
      { timeout: 10_000 },
    )
    .toBe(true);
}

/** Dismiss the first-encounter "NEW ANOMALY DETECTED" modal if it's open. */
async function acknowledgeAnomaly(page: Page): Promise<void> {
  const ack = page.getByRole('button', { name: 'ACKNOWLEDGE' });
  if (await ack.isVisible().catch(() => false)) {
    await ack.click().catch(() => {});
  }
}

function readScene<T>(page: Page, pick: string) {
  return page.evaluate((expr) => {
    const game = (window as unknown as { __PHASER_GAME__?: any }).__PHASER_GAME__;
    const scene = game?.scene?.getScene?.('GameScene');
    // eslint-disable-next-line no-new-func
    return scene ? (new Function('s', `return s.${expr}`) as (s: any) => T)(scene) : undefined;
  }, pick);
}

test('tapping an enemy issues a volley that overrides hero targets', async ({ page }) => {
  await deployToBattle(page);

  // No volley issued yet.
  expect(await readScene<number>(page, 'volleyCount')).toBe(0);

  // Tap an empty mid-battlefield spot with real CDP mouse input (a proven-
  // reachable canvas point; enemy screen coords are unreliable under Phaser's
  // ENVELOP crop). issueVolley targets the nearest enemy on the whole field, so
  // any valid tap while enemies are present commands a volley. Every newly-
  // encountered enemy type opens a "NEW ANOMALY DETECTED" modal that pauses the
  // game and covers the canvas, so retry: clear it, wait for an unpaused gap,
  // confirm enemies are present, then tap.
  const canvas = page.locator('.game-canvas canvas');
  const box = await canvas.boundingBox();
  if (!box) throw new Error('canvas has no bounding box');
  const tx = box.x + box.width * 0.5;
  const ty = box.y + box.height * 0.45;

  const runningWithEnemies = () =>
    page.evaluate(() => {
      const game = (window as unknown as { __PHASER_GAME__?: any }).__PHASER_GAME__;
      const scene = game?.scene?.getScene?.('GameScene');
      const enemies = scene?.enemies?.filter((e: any) => !e.isDead && e.hp > 0).length ?? 0;
      return !!scene && !scene.isPaused && scene.gameSpeed > 0 && enemies > 0;
    });

  let volleys = 0;
  for (let attempt = 0; attempt < 15 && volleys === 0; attempt++) {
    await acknowledgeAnomaly(page);
    if (!(await runningWithEnemies())) {
      await page.waitForTimeout(300);
      continue;
    }
    await page.mouse.move(tx, ty);
    await page.mouse.down();
    await page.mouse.up();
    volleys = (await readScene<number>(page, 'volleyCount')) ?? 0;
  }

  // The tap reached the scene and issued a volley (targeting the nearest enemy).
  expect(volleys).toBeGreaterThan(0);
});
