import { test, expect, type Page } from '@playwright/test';

/**
 * Smoke net for the real user-visible flow:
 * loading screen -> main menu -> campaign map -> briefing -> live rally battle.
 * It exists to catch "the app doesn't boot" and "the HUD and Phaser scene
 * stopped talking" — not to exhaustively test gameplay.
 */

// The app boots through a simulated loading screen (~2-3s) before the menu.
async function bootToMainMenu(page: Page): Promise<void> {
  await page.goto('/');
  await expect(
    page.getByRole('button', { name: /Start the Rally/i }),
  ).toBeVisible({ timeout: 15_000 });
}

test('boots to the main menu with the Phaser canvas running underneath', async ({ page }) => {
  await bootToMainMenu(page);

  await expect(page.locator('.game-canvas canvas')).toBeVisible();
});

test('deploys into a battle and the HUD reflects the live Phaser scene', async ({ page }) => {
  await bootToMainMenu(page);
  // The CTA pulses forever (CSS animation), so it never passes Playwright's
  // stability check — force the click.
  await page.getByRole('button', { name: /Start the Rally/i }).click({ force: true });

  // Campaign map — exactly one stage (the next uncleared one) offers "Prepare".
  await page.getByRole('button', { name: /^Prepare / }).click();

  // Briefing room -> deploy to the streets.
  await page.locator('button', { hasText: /Deploy to the streets/i }).click();

  // Battle HUD renders and is wired to the scene: the morale pill shows the
  // shield's hp, and the scene auto-starts wave 1 shortly after deploy —
  // seeing "Wave 1/3" proves stateChanged events flow from Phaser to React.
  await expect(page.getByRole('button', { name: 'Pause' })).toBeEnabled();
  await expect(page.getByLabel(/^Morale /)).toBeVisible();
  await expect(page.getByText('Wave 1/3')).toBeVisible({ timeout: 10_000 });
});
