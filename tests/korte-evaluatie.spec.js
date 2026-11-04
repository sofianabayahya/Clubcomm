// ClubComm — Besluit 154: korte evaluatie uit het profiel (evaluatie.kort) en nieuwe labels (DCG-profiel v4).
// Verzonnen gegevens, nep-database. Nooit tegen de productiedatabase.
const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');
const { volgFouten, controleer, nepDatabase, inloggen } = require('./hulp');

const PROFIEL = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'supabase', 'profielen', 'dcg.json'), 'utf8'));

const start = async (page, { zonderKort = false } = {}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await nepDatabase(page);
  const data = JSON.parse(JSON.stringify(PROFIEL)); if (zonderKort) delete data.onderdelen.evaluatie.kort;
  await page.evaluate((d) => { const db = JSON.parse(sessionStorage.getItem('fake-sb-db'));
    db.rows['dcg|profiel|dcg'] = { club_id: 'dcg', soort: 'profiel', id: 'dcg', scope: 'hjo', data: d };
    db.rows['dcg|club|club'].data.modules = { ...(db.rows['dcg|club|club'].data.modules || {}), training: true };
    sessionStorage.setItem('fake-sb-db', JSON.stringify(db)); }, data);
  await inloggen(page, 'admin@test.nl');
  await page.evaluate(() => { const S = CC.S(); const D = CC.date; CC.wisselRol(CC.me().rollen.findIndex((r) => r.rol === 'trainer'));
    const g = D.addDays(D.vandaag(), -1); const ik = CC.me().id;
    S.acts.push({ id: 't-x', teamId: 'O12-1', soort: 'training', datum: g, tijd: '17:15', eind: '18:30' });
    S.vormen = [{ id: 'v-a', naam: 'Eerste contact van de druk af', eigenaar: ik, koppelingen: { dcg: { primair: 'll-aannemen', ook: [] } }, leerdoelen: ['ll-aannemen'], vaardigheden: ['vh-eerste-contact-van-druk-af'] },
      { id: 'v-b', naam: 'Vrije speler vinden', eigenaar: ik, koppelingen: { dcg: { primair: 'll-vrijkomen', ook: ['ll-1v1-verdedigen'] } }, leerdoelen: ['ll-vrijkomen', 'll-1v1-verdedigen'], vaardigheden: ['vh-vrijmaken-uit-de-dekkingsschaduw', 'vh-vertragen'] },
      { id: 'v-p', naam: 'Partij 5 tegen 5', eigenaar: ik, koppelingen: { dcg: { primair: 'll-passen', ook: [] } }, leerdoelen: ['ll-passen'], vaardigheden: [] }];
    // Een oude training zoals 29/30-10: Weerstand was toen een open vraag en is beantwoord
    S.trainingsplannen = [{ id: 'tp-x', actId: 't-x', teamId: 'O12-1', datum: g, eigenaar: ik, thema: 'Vrije speler vinden onder druk', leerdoelen: [], gegeven: true,
      evaluatie: { 'ev-probleem': 'ja', 'ev-weerstand': 'passend' },
      onderdelen: [{ id: 'o1', blok: 'A1', vormId: 'v-a', min: 12, minUit: 12 }, { id: 'o2', blok: 'B1', vormId: 'v-b', min: 12, minUit: 12 }, { id: 'o3', blok: 'P', vormId: 'v-p', min: 20, minUit: 20 }] }];
    CC.save(); CC.render(); });
  await page.locator('nav.nav button[data-tab="aanwezigheid"]').click();
  await page.evaluate(() => { const g = (CC.ui.seg = CC.ui.seg || {}); g.trSeg = 'week'; g.aanwAct = 't-x'; CC.render(); });
};
// De open vragen in de volgorde van het scherm (Toepassing = het blok Transfer)
const openVolgorde = (page) => page.locator('form[data-autosave="tpTerug"] > .tr-ev > b, form[data-autosave="tpTerug"] > .tr-toep > b').allTextContents();
const evaluatie = (page) => page.evaluate(() => JSON.parse(JSON.stringify(CC.S().trainingsplannen.find((p) => p.id === 'tp-x').evaluatie)));

test('korte evaluatie: vier vragen uit het profiel in volgorde, oude antwoorden blijven zichtbaar (390 px)', { tag: ['@training', '@profiel'] }, async ({ page }) => {
  const fouten = volgFouten(page);
  expect(PROFIEL.versie).toBe(4);
  expect(PROFIEL.onderdelen.evaluatie.kort).toEqual(['ev-probleem', 'ev-gedrag', 'ev-transfer', 'ev-volgende']);
  await start(page);
  expect(await openVolgorde(page)).toEqual(['Probleem vaak genoeg ontstaan?', 'Gewenst gedrag zichtbaar?', 'Toepassing · Partij 5 tegen 5', 'Volgende training']);
  // De vraagteksten zijn niet veranderd (oude antwoorden houden hun betekenis)
  const vragen = Object.fromEntries(PROFIEL.onderdelen.evaluatie.vragen.map((q) => [q.id, q.vraag]));
  expect(vragen['ev-probleem']).toBe('Probleem vaak genoeg ontstaan?'); expect(vragen['ev-volgende']).toBe('Volgende training');
  // Weerstand staat niet meer open, maar het oude antwoord is zichtbaar: Verdiepende analyse klapt vanzelf open met het aantal
  await expect(page.locator('.tr-diep')).toHaveAttribute('open', '');
  await expect(page.locator('.tr-diep summary')).toHaveText('Verdiepende analyse (1)');
  await expect(page.locator('.tr-diep [data-q="ev-weerstand"][aria-pressed="true"]')).toHaveText('passend');
  // Transfer staat maar op één plek (Toepassing), dus niet nog eens onder Verdiepende analyse
  await expect(page.locator('.tr-diep')).not.toContainText('Transfer naar vrij spel');
  await expect(page.locator('.tr-diep [data-q="ev-volgende"]')).toHaveCount(0);
  // Bekijken schrijft niets
  expect(await evaluatie(page)).toEqual({ 'ev-probleem': 'ja', 'ev-weerstand': 'passend' });
  // Een antwoord geven werkt zoals voorheen
  await page.locator('[data-act="tpEval"][data-q="ev-volgende"][data-w="één variabele aanpassen"]').click();
  expect(await evaluatie(page)).toEqual({ 'ev-probleem': 'ja', 'ev-weerstand': 'passend', 'ev-volgende': 'één variabele aanpassen' });
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  await controleer(page, fouten, 'korte evaluatie');
});

test('korte evaluatie: een profiel zonder kort werkt precies zoals voorheen', { tag: ['@training', '@profiel'] }, async ({ page }) => {
  const fouten = volgFouten(page);
  await start(page, { zonderKort: true });
  expect(await openVolgorde(page)).toEqual(['Toepassing · Partij 5 tegen 5', 'Probleem vaak genoeg ontstaan?', 'Gewenst gedrag zichtbaar?', 'Weerstand']);
  await page.locator('.tr-diep summary').click();
  await expect(page.locator('.tr-diep')).toContainText('Niet beoordeeld · kies bij Toepassing');
  await expect(page.locator('.tr-diep [data-q="ev-volgende"]').first()).toBeVisible();
  await controleer(page, fouten, 'zonder kort');
});

test('labels: Loskomen uit de dekkingsschaduw, Afremmen en handelingen in gekozen vormen; codes ongewijzigd', { tag: ['@training', '@profiel'] }, async ({ page }) => {
  const fouten = volgFouten(page);
  await start(page);
  // Trainingskaart (Plannen): handelingen, geen accenten
  await page.evaluate(() => { const g = (CC.ui.seg = CC.ui.seg || {}); g.trSeg = 'plannen'; g.aanwAct = 't-x'; CC.render(); });
  await expect(page.locator('.tr-tkaart').first()).toContainText('Handelingen in gekozen vormen: Eerste contact van druk af · Loskomen uit de dekkingsschaduw · Afremmen');
  await expect(page.locator('.tr-tkaart').first()).not.toContainText('Accenten');
  // Vormenbank: de nieuwe namen bij dezelfde codes
  await page.evaluate(() => CC.open('vorm', { id: 'v-b' }));
  await expect(page.locator('[data-act="vormKies"][data-veld="vh"][data-w="vh-vrijmaken-uit-de-dekkingsschaduw"]')).toHaveText('Loskomen uit de dekkingsschaduw');
  await expect(page.locator('[data-act="vormKies"][data-veld="vh"][data-w="vh-vertragen"]')).toHaveText('Afremmen');
  await expect(page.locator('body')).not.toContainText('Vrijmaken uit de dekkingsschaduw');
  expect(await page.evaluate(() => CC.S().vormen.find((v) => v.id === 'v-b').vaardigheden)).toEqual(['vh-vrijmaken-uit-de-dekkingsschaduw', 'vh-vertragen']);
  await controleer(page, fouten, 'labels');
});
