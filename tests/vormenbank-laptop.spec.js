// ClubComm — Besluit 174: de Vormenbank op de laptop (vanaf 1100 px) als compacte lijst links en de gekozen vorm rechts.
const { test, expect } = require('@playwright/test');
const { volgFouten, controleer } = require('./hulp');
const TAG = { tag: ['@training', '@schermen'] };
const opzet = async (page, breed) => {
  await page.setViewportSize({ width: breed, height: 820 });
  await page.goto('/?demo'); await page.evaluate(() => localStorage.clear()); await page.reload();
  await page.evaluate(() => { const S = CC.S(); S.club.modules = { ...(S.club.modules || {}), training: true }; CC.login(S.demo.mark); CC.wisselRol(CC.me().rollen.findIndex((r) => r.rol === 'trainer'));
    const me = CC.me().id; S.vormen = (S.vormen || []).filter((v) => v.eigenaar !== me); const p = (c, n, x, y) => ({ t: 'p', c, n, x, y });
    const add = (id, naam, org) => S.vormen.push({ id, eigenaar: me, naam, organisatie: org, coach: 'Eerst kijken', duur: 12, spelersMin: 6, spelersMax: 10, tekening: { field: 'liggend', items: [p('rood', 1, 300, 300)] }, status: 'klaar' });
    add('va', 'Aannemen en meenemen', 'Vak 20 bij 15'); add('vb', 'Rondo 4 tegen 2', 'Vak 12 bij 12'); add('vc', 'Partij 6 tegen 6', 'Kwart veld');
    CC.save(); CC.go('aanwezigheid'); });
  await page.locator('[data-act="seg"][data-val="vormen"]').click();
};

test('laptop: compacte lijst links, de eerste vorm staat rechts open, één tik per vorm', TAG, async ({ page }) => {
  const fouten = volgFouten(page);
  await opzet(page, 1366);
  const rechts = page.locator('#app .vb-naast .ld-r');
  await expect(rechts.locator('h2')).toHaveText('Aannemen en meenemen');
  await expect(page.locator('#app .vb-naast .ld-l [aria-current="true"]')).toContainText('Aannemen en meenemen');
  await page.locator('#app .ld-l .tr-kaart', { hasText: 'Rondo 4 tegen 2' }).click();
  await expect(page.locator('#sheet')).toBeHidden();
  await expect(rechts.locator('h2')).toHaveText('Rondo 4 tegen 2');
  await expect(rechts).toContainText('Vak 12 bij 12');
  await expect(rechts.locator('svg').first()).toBeVisible();
  // Compact: de kaarten staan onder elkaar en zijn laag
  const h = await page.locator('#app .ld-l .tr-kaart').first().boundingBox();
  expect(h.height).toBeLessThan(90);
  // Zoeken houdt de keuze; Bewerken opent de pagina van de vorm
  await page.fill('#vormZoek', 'rondo');
  await expect(page.locator('#app .ld-l .tr-kaart')).toHaveCount(1);
  await expect(page.locator('#app .ld-l .tr-kaart.gekozen')).toHaveCount(1);
  await rechts.locator('[data-act="vormBewerk"]').click();
  expect(await page.evaluate(() => (CC.ui.view || {}).naam)).toBe('vorm');
  await controleer(page, fouten, 'vormenbank laptop');
});

test('kleinere laptop (1000 px): kaarten en het venster zoals eerder', TAG, async ({ page }) => {
  const fouten = volgFouten(page);
  await opzet(page, 1000);
  await expect(page.locator('#app .vb-naast')).toHaveCount(0);
  await page.locator('#app .tr-kaart', { hasText: 'Rondo 4 tegen 2' }).click();
  await expect(page.locator('#sheet')).toContainText('Vak 12 bij 12');
  await controleer(page, fouten, 'vormenbank smal');
});
