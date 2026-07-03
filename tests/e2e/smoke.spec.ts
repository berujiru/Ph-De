import { test, expect } from '@playwright/test';

test('loads the game and renders the HUD', async ({ page }) => {
  await page.goto('/');

  await expect(page.locator('.game-canvas canvas')).toBeVisible();
  await expect(page.getByText(/Gold:/)).toBeVisible();
  await expect(page.getByRole('button', { name: /Start Wave/i })).toBeVisible();
});

test('can select a tower and start a wave', async ({ page }) => {
  await page.goto('/');

  await page.getByRole('button', { name: /Archer/i }).click();
  await page.getByRole('button', { name: /Start Wave/i }).click();

  await expect(page.getByText(/Wave: 1/)).toBeVisible();
});
