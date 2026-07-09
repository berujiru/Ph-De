import { test, expect, type Page } from '@playwright/test';

/**
 * TEMPORARY verification driver for the attack-art refactor — deleted after
 * the verification report. Boots into the Attack Sandbox, spawns heroes
 * across attack styles, and screenshots the live battle so a human can see
 * the tinted SVG attack visuals in flight.
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

async function spawnHero(page: Page, heroId: string) {
  await page.getByLabel('Hero to spawn').selectOption(heroId);
  // Two "Spawn" buttons exist (Hero Rig + Anomaly Rig); the hero one is first.
  await page.getByRole('button', { name: 'Spawn', exact: true }).first().click({ force: true });
}

test('attack art renders across styles in the sandbox', async ({ page }) => {
  test.setTimeout(120_000);
  const warnings = await bootToSandbox(page);

  await page.getByRole('button', { name: /Open sandbox rig/i }).click({ force: true });

  // Wave 1: student (pierce/pencil), eden (projectile/megaphone Physical),
  // baker (lobbed/pandesal Fire), electrician (chain/plug-spark Lightning).
  await spawnHero(page, 'student');
  await spawnHero(page, 'eden');
  await spawnHero(page, 'baker');
  await spawnHero(page, 'electrician');
  // Targets to shoot at.
  const targetBtn = page.getByRole('button', { name: /Target/i }).first();
  await targetBtn.click({ force: true });
  await targetBtn.click({ force: true });
  // Close the rig so screenshots show the field.
  await page.getByRole('button', { name: /Close sandbox rig/i }).click({ force: true });

  for (let i = 0; i < 4; i++) {
    await page.waitForTimeout(650);
    await page.screenshot({ path: `${SHOTS}/wave1-${i}.png` });
  }

  // Wave 2: distinct field/motion styles — teacher (boomerang/ruler),
  // plumber (linear-wave/wave-crest Water), fisherfolk (vortex/net),
  // construction_worker (summoner/yero-panel), sorbetes (trap/ice-trap Frost).
  await page.getByRole('button', { name: /Open sandbox rig/i }).click({ force: true });
  await spawnHero(page, 'teacher');
  await spawnHero(page, 'plumber');
  await spawnHero(page, 'fisherfolk');
  await spawnHero(page, 'construction_worker');
  await spawnHero(page, 'sorbetes_vendor');
  await page.getByRole('button', { name: /Target/i }).first().click({ force: true });
  await page.getByRole('button', { name: /Close sandbox rig/i }).click({ force: true });

  for (let i = 0; i < 5; i++) {
    await page.waitForTimeout(700);
    await page.screenshot({ path: `${SHOTS}/wave2-${i}.png` });
  }

  // Wave 3: sandbox default-art tester (no attackArt -> style default).
  await page.getByRole('button', { name: /Open sandbox rig/i }).click({ force: true });
  await spawnHero(page, 'sandbox_boomerang');
  await page.getByRole('button', { name: /Target/i }).first().click({ force: true });
  await page.getByRole('button', { name: /Close sandbox rig/i }).click({ force: true });
  for (let i = 0; i < 3; i++) {
    await page.waitForTimeout(600);
    await page.screenshot({ path: `${SHOTS}/wave3-${i}.png` });
  }

  const missingArt = warnings.filter((w) => w.includes('AttackSprite: missing texture'));
  expect(missingArt, `missing attack art: ${missingArt.join('; ')}`).toHaveLength(0);
  const texErrors = warnings.filter((w) => /texture|Failed to load/i.test(w));
  console.log('console warnings/errors seen:', JSON.stringify(warnings.slice(0, 20), null, 2));
  expect(texErrors, texErrors.join('; ')).toHaveLength(0);
});
