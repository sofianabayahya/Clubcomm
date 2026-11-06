// ClubComm — Besluit 171: lijst en detail naast elkaar op de laptop (vanaf 1100 px): Trainers (HO bij het pakket) en Berichten.
const { test, expect } = require('@playwright/test');
const { volgFouten, controleer } = require('./hulp');
const TAG = { tag: ['@begeleiden', '@berichten', '@schermen'] };
const demo = async (page, breed) => { await page.setViewportSize({ width: breed, height: 820 }); await page.goto('/?demo'); await page.evaluate(() => localStorage.clear()); await page.reload(); };
const ho = (page) => page.evaluate(() => { const S = CC.S(); S.club.pakket = 'trainers'; CC.login(S.demo.peter); CC.wisselRol(CC.me().rollen.findIndex((r) => r.rol === 'hjo')); CC.go('trainers'); });
const mark = (page) => page.evaluate(() => { const S = CC.S(); CC.login(S.demo.mark); CC.wisselRol(CC.me().rollen.findIndex((r) => r.rol === 'trainer')); CC.go('berichten'); });

test('laptop: Trainers met het dossier rechts, één tik per trainer, zonder venster', TAG, async ({ page }) => {
  const fouten = volgFouten(page);
  await demo(page, 1366); await ho(page);
  await expect(page.locator('#app .ld-r')).toContainText('Kies links een trainer');
  await page.locator('#app .ld-l [data-act="hoTrainerSnel"]', { hasText: 'Dennis Peters' }).click();
  await expect(page.locator('#sheet')).toBeHidden();
  await expect(page.locator('#app .ld-r h2')).toHaveText('Dennis Peters');
  await expect(page.locator('#app .ld-r')).toContainText('Spelers vaker zelf laten oplossen');
  await expect(page.locator('#app .ld-l [aria-current="true"]')).toContainText('Dennis Peters');
  await page.locator('#app .ld-l [data-act="hoTrainerSnel"]', { hasText: 'Anouk van Vliet' }).click();
  await expect(page.locator('#app .ld-r h2')).toHaveText('Anouk van Vliet');
  await expect(page.locator('nav.nav')).toBeVisible();
  // Een actie in het dossier werkt zoals eerder (venster) en de keuze blijft staan
  await page.locator('#app .ld-l [data-act="hoTrainerSnel"]', { hasText: 'Dennis Peters' }).click();
  await page.locator('#app .ld-r [data-act="begelNieuw"]').first().click();
  await expect(page.locator('#sheet')).toBeVisible();
  await controleer(page, fouten, 'laptop trainers');
});

test('kleinere laptop (1000 px) en telefoon: zoals eerder (snelvenster)', TAG, async ({ page }) => {
  const fouten = volgFouten(page);
  await demo(page, 1000); await ho(page);
  await expect(page.locator('#app .ld')).toHaveCount(0);
  await page.locator('#app [data-act="hoTrainerSnel"]', { hasText: 'Dennis Peters' }).click();
  await expect(page.locator('#sheet [data-view="trainerDetail"]')).toBeVisible();
  await controleer(page, fouten, 'smal trainers');
});

test('laptop: Berichten met het gesprek rechts; het eerste gesprek dat op je wacht staat open; reageren', TAG, async ({ page }) => {
  const fouten = volgFouten(page);
  await demo(page, 1366); await mark(page);
  const rechts = page.locator('#app .ld-r');
  await expect(rechts).toContainText('Re: training');
  await expect(page.locator('#app .ld-l [aria-current="true"]')).toContainText('Wacht op jou');
  await expect(page.locator('nav.nav')).toBeVisible();
  await page.locator('#app .ld-l [data-view="bericht"]', { hasText: 'Jesse en de tweede training' }).click();
  await expect(rechts).toContainText('Jesse en de tweede training');
  expect(await page.evaluate(() => CC.ui.view)).toBeNull();
  await rechts.locator('form.reageer textarea').fill('Dank je, tot zaterdag.');
  await rechts.locator('form.reageer button').click();
  await expect(rechts).toContainText('Dank je, tot zaterdag.');
  await expect(page.locator('#app .ld')).toHaveCount(1);
  await controleer(page, fouten, 'laptop berichten');
});

test('telefoon: Berichten opent het gesprek op een eigen pagina (ongewijzigd)', TAG, async ({ page }) => {
  const fouten = volgFouten(page);
  await demo(page, 390); await mark(page);
  await expect(page.locator('#app .ld')).toHaveCount(0);
  await page.locator('#app [data-view="bericht"]').first().click();
  expect(await page.evaluate(() => (CC.ui.view || {}).naam)).toBe('bericht');
  await controleer(page, fouten, 'telefoon berichten');
});
