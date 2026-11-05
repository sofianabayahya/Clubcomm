// ClubComm — Besluit 29: de mijlpaal noemt de echte stand ("Al 14 trainingen gegeven dit seizoen! Je passeerde de 10.").
// Verzonnen gegevens, nep-database. Nooit tegen de productiedatabase.
const { test, expect } = require('@playwright/test');
const { volgFouten, controleer, nepDatabase, inloggen } = require('./hulp');

const metTrainingen = async (page, n) => page.evaluate((n) => { const S = CC.S(); const D = CC.date; CC.wisselRol(CC.me().rollen.findIndex((r) => r.rol === 'trainer'));
  const tid = CC.me().rollen.find((r) => r.rol === 'trainer').teamId; S.club.seizoen.start = D.addDays(D.vandaag(), -120);
  S.acts = S.acts.filter((a) => !(a.teamId === tid && a.soort === 'training'));
  for (let i = 1; i <= n; i++) S.acts.push({ id: `t-m${i}`, teamId: tid, soort: 'training', datum: D.addDays(D.vandaag(), -i * 3), tijd: '17:15', eind: '18:30' });
  S.mijlpaalGezien = {}; CC.save(); CC.go('home'); CC.render(); }, n);

test('mijlpaal: de felicitatie noemt de echte stand', { tag: ['@home'] }, async ({ page }) => {
  const fouten = volgFouten(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await nepDatabase(page);
  await inloggen(page, 'admin@test.nl');
  await metTrainingen(page, 14);
  await expect(page.locator('.mijlpaal')).toContainText('Al 14 trainingen gegeven dit seizoen! Je passeerde de 10.');
  await metTrainingen(page, 10);
  await expect(page.locator('.mijlpaal')).toContainText('10 trainingen gegeven dit seizoen!');
  await expect(page.locator('.mijlpaal')).not.toContainText('passeerde');
  // Dank je! = felicitatie weg
  await page.locator('.mijlpaal [data-act="mijlpaalGezien"]').click();
  await expect(page.locator('.mijlpaal')).toHaveCount(0);
  await controleer(page, fouten);
});
