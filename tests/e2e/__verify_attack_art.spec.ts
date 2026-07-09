import { test, expect, type Page } from '@playwright/test';

/**
 * TEMPORARY verification driver for the combat-feel patch — deleted after the
 * verification report. Boots into the Attack Sandbox and screenshots live
 * battles: projectile speed contrast, syringe orientation, melee swing.
 */

const SHOTS = 'C:/Users/EDENCU~1/AppData/Local/Temp/claude/c--Users-Eden-Cutara-Documents-Ph-De/36a4514e-bd9a-4009-bf82-1806a6d1f2e2/scratchpad';

async function bootToSandbox(page: Page): Promise<string[]> {
  const warnings: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'warning' || msg.type() === 'error') warnings.push(msg.text());
  });
  await page.goto('/');
  await expect(page.getByRole('button', { name: /Start the Rally/i })).toBeVisible({ timeout: 15_000 });
  await page.getByRole('button', { name: /Start the Rally/i }).click({ force: true });
  await page.getByRole('button', { name: /ENTER SANDBOX/i }).click({ force: true });
  await expect(page.getByRole('button', { name: /Open sandbox rig/i })).toBeVisible({ timeout: 10_000 });
  return warnings;
}

async function openRig(page: Page) {
  await page.getByRole('button', { name: /Open sandbox rig/i }).click({ force: true });
}
async function closeRig(page: Page) {
  await page.getByRole('button', { name: /Close sandbox rig/i }).click({ force: true });
}
async function spawnHero(page: Page, heroId: string) {
  await page.getByLabel('Hero to spawn').selectOption(heroId);
  // Two "Spawn" buttons exist (Hero Rig + Anomaly Rig); the hero one is first.
  await page.getByRole('button', { name: 'Spawn', exact: true }).first().click({ force: true });
}
async function dropBag(page: Page) {
  await page.getByRole('button', { name: /Punching Bag/i }).click({ force: true });
}
async function spawnGrunt(page: Page) {
  await page.getByLabel('Anomaly to spawn').selectOption('grunt');
  await page.getByRole('button', { name: 'Spawn', exact: true }).nth(1).click({ force: true });
}

test('A: projectile speed contrast + syringe orientation', async ({ page }) => {
  test.setTimeout(120_000);
  const warnings = await bootToSandbox(page);

  await openRig(page);
  await spawnHero(page, 'student'); // pencil pierce @850 px/s
  await spawnHero(page, 'baker');   // pandesal lob @400 px/s
  await spawnHero(page, 'nurse');   // syringe @600 px/s — needle must lead
  await dropBag(page);
  await dropBag(page);
  await closeRig(page);

  for (let i = 0; i < 6; i++) {
    await page.waitForTimeout(450);
    await page.screenshot({ path: `${SHOTS}/speed-${i}.png` });
  }

  const missingArt = warnings.filter((w) => w.includes('AttackSprite: missing texture'));
  expect(missingArt, missingArt.join('; ')).toHaveLength(0);
});

test('B: melee weapon swing (rotation sweep)', async ({ page }) => {
  test.setTimeout(120_000);
  const warnings = await bootToSandbox(page);

  await openRig(page);
  await spawnHero(page, 'jeepney_driver');
  await spawnHero(page, 'security_guard');
  // Grunts march down into melee reach (the static bag sits outside it).
  await spawnGrunt(page);
  await spawnGrunt(page);
  await spawnGrunt(page);
  await closeRig(page);

  // Wait for the march to close the distance, then rapid-fire shots to catch
  // the crescent mid-sweep.
  await page.waitForTimeout(4000);
  for (let i = 0; i < 10; i++) {
    await page.waitForTimeout(160);
    await page.screenshot({ path: `${SHOTS}/melee-${i}.png` });
  }

  const missingArt = warnings.filter((w) => w.includes('AttackSprite: missing texture'));
  expect(missingArt, missingArt.join('; ')).toHaveLength(0);
});

test('C: field styles + default art tester', async ({ page }) => {
  test.setTimeout(120_000);
  const warnings = await bootToSandbox(page);

  await openRig(page);
  await spawnHero(page, 'plumber');       // linear-wave, wave-crest, range-driven travel
  await spawnHero(page, 'fisherfolk');    // vortex net
  await spawnHero(page, 'electrician');   // chain + plug-spark pops
  await spawnHero(page, 'sales_lady');    // beam + pricetag pops, range now real
  await spawnHero(page, 'sandbox_boomerang'); // style-default art fallback
  await dropBag(page);
  await dropBag(page);
  await closeRig(page);

  for (let i = 0; i < 6; i++) {
    await page.waitForTimeout(600);
    await page.screenshot({ path: `${SHOTS}/field-${i}.png` });
  }

  const missingArt = warnings.filter((w) => w.includes('AttackSprite: missing texture'));
  expect(missingArt, missingArt.join('; ')).toHaveLength(0);
  console.log('console warnings/errors:', JSON.stringify(warnings.slice(0, 15)));
});
