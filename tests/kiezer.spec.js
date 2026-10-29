// Oefenvorm kiezen (Besluit 138 en 139): regressietests. Ze leggen het gedrag vast dat bij het samenvoegen tot één kiezer
// moet blijven: gereedschap, vaardigheden, leerniveau en aantal spelers bij een profiel met methodiek (DCG), en dezelfde kiezer zonder profiel (zoals Swift).
const { test, expect } = require('@playwright/test');
const fs = require('fs'); const path = require('path');
const { volgFouten, controleer, nepDatabase, inloggen } = require('./hulp');

const DCG = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'supabase', 'profielen', 'dcg.json'), 'utf8'));
const VORMEN = [
  { id: 'v-rondo', naam: 'Rondo vooruit', ld: 'll-passen', vh: ['vh-vooruit-inspelen'], min: 8, max: 12, duur: 12 },
  { id: 'v-kaats', naam: 'Kaatsvorm', ld: 'll-passen', vh: ['vh-kaatsen'], min: 10, max: 14, duur: 8 },
  { id: 'v-groot', naam: 'Groot positiespel', ld: 'll-passen', vh: ['vh-vooruit-inspelen'], min: 16, max: 20, duur: 15 },
  { id: 'v-pass', naam: 'Passeren 1 tegen 1', ld: 'll-1v1-aanvallend', vh: ['vh-passeren'], min: 2, max: 12, duur: 10 },
];

// Trainer met vier eigen vormen en een training van vandaag met 12 spelers; met profiel: sjabloon DCG 75, A = Passen, A1 op leerniveau Kiezen
async function klaarzetten(page, metProfiel) {
  await nepDatabase(page);
  await page.evaluate((data) => { const db = JSON.parse(sessionStorage.getItem('fake-sb-db'));
    if (data) db.rows['dcg|profiel|dcg'] = { club_id: 'dcg', soort: 'profiel', id: 'dcg', scope: 'hjo', data };
    db.rows['dcg|club|club'].data.modules = { ...(db.rows['dcg|club|club'].data.modules || {}), training: true };
    sessionStorage.setItem('fake-sb-db', JSON.stringify(db)); }, metProfiel ? DCG : null);
  await inloggen(page, 'admin@test.nl');
  await page.evaluate(({ vormen, metProfiel }) => { const S = CC.S(); CC.wisselRol(CC.me().rollen.findIndex((r) => r.rol === 'trainer')); const ik = CC.me().id;
    S.acts.push({ id: 'tKies', teamId: 'O12-1', soort: 'training', datum: CC.date.vandaag(), tijd: '23:58', eind: '23:59' });
    S.vormen = vormen.map((v) => ({ id: v.id, eigenaar: ik, naam: v.naam, type: 'positie', koppelingen: metProfiel ? { dcg: { primair: v.ld, ook: [] } } : {}, leerdoelen: metProfiel ? [v.ld] : [],
      vaardigheden: metProfiel ? v.vh : [], spelersMin: v.min, spelersMax: v.max, duur: v.duur }));
    CC.save(); CC.render(); }, { vormen: VORMEN, metProfiel });
  await page.locator('nav.nav button[data-tab="aanwezigheid"]').click();
  await page.locator('.weekstrook [data-val="tKies"]').click();
  if (await page.locator('[data-act="seg"][data-val="plannen"]').count()) await page.locator('[data-act="seg"][data-val="plannen"]').click();
  await page.locator('[data-act="tpNieuw"]').first().click();
  if (metProfiel) {
    await page.locator('[data-act="tpSjabloon"][data-s="dcg-75"]').click();
    await page.evaluate(() => { const S = CC.S(); const p = S.trainingsplannen.find((x) => x.actId === 'tKies'); p.spelers = 12; p.blokDoel = { A: 'll-passen' };
      p.onderdelen.find((o) => o.blok === 'A1').niveau = 'ln-kiezen'; CC.save(); CC.render(); });
  } else await page.evaluate(() => { const S = CC.S(); S.trainingsplannen.find((x) => x.actId === 'tKies').spelers = 12; CC.save(); CC.render(); });
}
const plan = (page) => page.evaluate(() => JSON.parse(JSON.stringify(CC.S().trainingsplannen.find((x) => x.actId === 'tKies'))));
// Volgorde van de vormen in de kiezer (eerste knop per vorm)
const volgorde = (page) => page.evaluate(() => [...new Set([...document.querySelectorAll('#sheet [data-act="tpVormErbij"]')].map((b) => b.dataset.v))]);
// Een lege plek openen; lukt dat via het onderdeelvenster (zonder methodiek, vóór Besluit 139), dan daar "Kies een vorm"
async function plekKiezen(page, code) {
  await page.locator('.tr-midden .tr-rij', { hasText: code }).first().click();
  const via = page.locator('#sheet [data-act="tpVormKiezen"]'); if (await via.count()) await via.click();
  await expect(page.locator('#sheet [data-act="tpVormErbij"]').first()).toBeAttached();
}
// Een vorm kiezen, ook als hij in een ingeklapt deel staat ("Andere vormen")
async function kies(page, id) {
  const knop = page.locator(`#sheet [data-act="tpVormErbij"][data-v="${id}"]`).first();
  await knop.evaluate((b) => { const d = b.closest('details'); if (d) d.open = true; });
  await knop.click();
}
async function anderGereedschap(page, id) {
  const knop = page.locator(`#sheet [data-act="vkZet"][data-k="gs"][data-w="${id}"]`);
  if (!(await knop.isVisible())) await page.locator('#sheet summary', { hasText: 'Ander gereedschap' }).click();
  await knop.click();
}

for (const breed of [390, 1366]) test(`oefenvorm kiezen met profiel (DCG): gereedschap, vaardigheid, leerniveau, aantal (${breed} px)`, async ({ page }) => {
  const fouten = volgFouten(page);
  await page.setViewportSize({ width: breed, height: 900 });
  await klaarzetten(page, true);
  await plekKiezen(page, 'A1');
  // Het gereedschap van het blok staat aan, met zijn vaardigheden; het leerniveau en het aantal spelers staan erbij
  await expect(page.locator('#sheet [data-act="vkZet"][data-k="gs"][data-w="ll-passen"]')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('#sheet .tr-vh')).toContainText('Vooruit inspelen');
  await expect(page.locator('#sheet')).toContainText('Kiezen');
  await expect(page.locator('#sheet')).toContainText('12 spelers');
  // Wat past bij het gereedschap en het aantal komt eerst; een ander gereedschap of te veel spelers komt later (of niet)
  let v = await volgorde(page);
  expect(v.slice(0, 2).sort()).toEqual(['v-kaats', 'v-rondo']);
  expect(v.indexOf('v-groot')).toBeGreaterThan(1);
  expect(v.indexOf('v-pass') === -1 || v.indexOf('v-pass') > 1).toBeTruthy();
  // Vaardigheid kiezen: die vorm bovenaan
  await page.locator('#sheet [data-act="vkZet"][data-k="vh"][data-w="vh-kaatsen"]').click();
  v = await volgorde(page); expect(v[0]).toBe('v-kaats');
  // Ander gereedschap: andere vaardigheden, andere vormen bovenaan
  await anderGereedschap(page, 'll-1v1-aanvallend');
  await expect(page.locator('#sheet .tr-vh')).toContainText('Passeren');
  v = await volgorde(page); expect(v[0]).toBe('v-pass');
  // Kiezen: de vorm staat op de plek, de minuten van de plek blijven
  await kies(page, 'v-pass');
  await expect(page.locator('#sheet')).toBeHidden();
  let p = await plan(page); let a1 = p.onderdelen.find((o) => o.blok === 'A1');
  expect(`${a1.vormId}|${a1.min}|${p.onderdelen.length}`).toBe('v-pass|6|8');
  // Nieuwe vorm vanuit de kiezer: gereedschap en vaardigheid gaan mee, de vorm komt op de plek
  await plekKiezen(page, 'A2');
  await anderGereedschap(page, 'll-1v1-aanvallend');
  await page.locator('#sheet [data-act="vkZet"][data-k="vh"][data-w="vh-dreigen"]').click();
  await page.locator('#sheet [data-act="vormNieuw"]').click();
  await expect(page.locator('.tr-vh button[data-w="vh-dreigen"]')).toHaveAttribute('aria-pressed', 'true');
  await page.locator('[data-act="terug"]').click();
  p = await plan(page); const nieuw = await page.evaluate(() => CC.S().vormen.find((x) => !x.id.startsWith('v-')));
  expect(`${nieuw.koppelingen.dcg.primair}|${nieuw.vaardigheden}|${p.onderdelen.find((o) => o.blok === 'A2').vormId === nieuw.id}`).toBe('ll-1v1-aanvallend|vh-dreigen|true');
  await controleer(page, fouten, 'kiezer DCG');
});

test('oefenvorm kiezen zonder profiel (zoals Swift): dezelfde kiezer, zonder methodiek', async ({ page }) => {
  const fouten = volgFouten(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await klaarzetten(page, false);
  await page.locator('.tr-midden [data-act="tpVormKiezen"]').click();
  await expect(page.locator('#sheet [data-act="tpVormErbij"]').first()).toBeAttached();
  // Geen gereedschap, vaardigheid of leerniveau als het profiel die niet heeft
  await expect(page.locator('#sheet [data-act="vkZet"][data-k="gs"]')).toHaveCount(0);
  await expect(page.locator('#sheet .tr-vh')).toHaveCount(0);
  await expect(page.locator('#sheet')).toContainText('12 spelers');
  // Passend bij 12 spelers eerst; de rest blijft te kiezen
  const v = await volgorde(page);
  expect(v.indexOf('v-groot')).toBe(3);
  await kies(page, 'v-groot');
  await expect(page.locator('#sheet')).toBeHidden();
  const p = await plan(page); expect(p.onderdelen.map((o) => o.vormId).join()).toBe('v-groot');
  await controleer(page, fouten, 'kiezer zonder profiel');
});
