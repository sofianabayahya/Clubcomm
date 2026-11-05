// ClubComm — Besluit NNN: een vorm weghalen zonder de plek kwijt te raken, een plek terugzetten, altijd Ongedaan maken.
// Verzonnen gegevens, nep-database. Nooit tegen de productiedatabase.
const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');
const { volgFouten, controleer, nepDatabase, inloggen } = require('./hulp');

const PROFIEL = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'supabase', 'profielen', 'dcg.json'), 'utf8'));

// opbouw: 'vol' = DCG-sjabloon met een vorm op Start en A1 · 'zonderA1' = A1 weggehaald, de vorm staat zonder plek · 'swift' = geen plekcodes
const start = async (page, { opbouw = 'vol', breedte = 390, gegeven = false } = {}) => {
  await page.setViewportSize({ width: breedte, height: 844 });
  await nepDatabase(page);
  await page.evaluate((d) => { const db = JSON.parse(sessionStorage.getItem('fake-sb-db'));
    db.rows['dcg|profiel|dcg'] = { club_id: 'dcg', soort: 'profiel', id: 'dcg', scope: 'hjo', data: d };
    db.rows['dcg|club|club'].data.modules = { ...(db.rows['dcg|club|club'].data.modules || {}), training: true };
    sessionStorage.setItem('fake-sb-db', JSON.stringify(db)); }, PROFIEL);
  await inloggen(page, 'admin@test.nl');
  await page.evaluate(({ opbouw, gegeven }) => { const S = CC.S(); const D = CC.date; CC.wisselRol(CC.me().rollen.findIndex((r) => r.rol === 'trainer'));
    const g = D.addDays(D.vandaag(), gegeven ? -1 : 1); const ik = CC.me().id;
    S.acts.push({ id: 't-x', teamId: 'O12-1', soort: 'training', datum: g, tijd: '17:15', eind: '18:30' });
    S.vormen = [{ id: 'v-a', naam: 'Vrije speler vinden in een rondo', eigenaar: ik, koppelingen: { dcg: { primair: 'll-vrijkomen', ook: [] } }, leerdoelen: ['ll-vrijkomen'], vaardigheden: [] },
      { id: 'v-s', naam: 'Hooghouden in tweetallen', eigenaar: ik, koppelingen: {}, leerdoelen: [], vaardigheden: [] }];
    const o = (id, blok, min, extra) => ({ id, blok, min, spacing: blok === 'S', naam: blok === 'start' ? 'Start' : blok === 'P' ? 'Partij' : '', ...extra });
    const ond = opbouw === 'swift' ? [{ id: 'o1', vormId: 'v-s', min: 10, spacing: false }, { id: 'o2', vormId: 'v-a', min: 15, spacing: false }]
      : opbouw === 'zonderA1' ? [o('o1', 'start', 8, { vormId: 'v-s' }), o('o3', 'S', 3), { id: 'o-los', vormId: 'v-a', min: 6, spacing: false, notitie: 'herhaling' }, o('o4', 'A2', 10), o('o5', 'B1', 6), o('o6', 'S', 3), o('o7', 'B2', 10), o('o8', 'P', 22)]
        : [o('o1', 'start', 8, { vormId: 'v-s' }), o('o2', 'A1', 6, { vormId: 'v-a', notitie: 'herhaling', niveau: 'ln-uitvoeren' }), o('o3', 'S', 3), o('o4', 'A2', 10), o('o5', 'B1', 6), o('o6', 'S', 3), o('o7', 'B2', 10), o('o8', 'P', 22)];
    S.trainingsplannen = [{ id: 'tp-x', actId: 't-x', teamId: 'O12-1', datum: g, eigenaar: ik, thema: 'Vrije speler herkennen', sjabloon: opbouw === 'swift' ? undefined : 'dcg-75', leerdoelen: [], onderdelen: ond }];
    CC.save(); CC.render(); }, { opbouw, gegeven });
  await page.locator('nav.nav button[data-tab="aanwezigheid"]').click();
  await page.evaluate(() => { const g = (CC.ui.seg = CC.ui.seg || {}); g.trSeg = 'plannen'; g.aanwAct = 't-x'; CC.render(); });
};
const opbouw = (page) => page.evaluate(() => CC.S().trainingsplannen.find((p) => p.id === 'tp-x').onderdelen.map((o) => `${o.blok || '-'}${o.vormId ? `:${o.vormId}` : ''}`).join(' '));
const plekA1 = (page) => page.evaluate(() => JSON.parse(JSON.stringify(CC.S().trainingsplannen.find((p) => p.id === 'tp-x').onderdelen.find((o) => o.blok === 'A1') || null)));
const openVorm = async (page) => { await page.locator('.tr-rij', { hasText: 'Vrije speler vinden in een rondo' }).first().click(); await expect(page.locator('.sheet')).toBeVisible(); };
const melding = (page) => page.locator('#toast');

for (const breedte of [390, 1366]) {
  test(`vorm uit A1 halen: de plek blijft, ongedaan maken zet hem terug (${breedte} px)`, { tag: ['@training'] }, async ({ page }) => {
    const fouten = volgFouten(page);
    await start(page, { breedte });
    await openVorm(page);
    // Geen knop meer die de plek ongemerkt weghaalt; wel één zin uitleg
    await expect(page.locator('.sheet [data-act="tpOnderdeelWeg"]')).toHaveCount(0);
    await expect(page.locator('.sheet [data-act="tpVormEruit"]')).toHaveText('Vorm uit A1 halen');
    await expect(page.locator('.sheet')).toContainText('A1 blijft in de training staan, leeg (6 min)');
    const knop = await page.locator('.sheet [data-act="tpVormEruit"]').boundingBox(); expect(knop.height).toBeGreaterThanOrEqual(44);
    await page.locator('.sheet [data-act="tpVormEruit"]').click();
    expect(await opbouw(page)).toBe('start:v-s A1 S A2 B1 S B2 P');
    expect(await plekA1(page)).toMatchObject({ id: 'o2', blok: 'A1', min: 6 });
    expect((await plekA1(page)).notitie).toBeUndefined(); expect((await plekA1(page)).niveau).toBeUndefined();
    await expect(page.locator('.tr-rij', { hasText: 'Kies een vorm' }).first()).toBeVisible();
    await expect(melding(page)).toContainText('A1 is weer leeg');
    await melding(page).getByRole('button', { name: 'Ongedaan maken' }).click();
    expect(await opbouw(page)).toBe('start:v-s A1:v-a S A2 B1 S B2 P');
    expect(await plekA1(page)).toMatchObject({ vormId: 'v-a', notitie: 'herhaling', niveau: 'ln-uitvoeren' });
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(breedte);
    await controleer(page, fouten, 'vorm eruit');
  });
}

test('lege plek verwijderen met ongedaan maken; Start blijft niet verplicht', { tag: ['@training'] }, async ({ page }) => {
  const fouten = volgFouten(page);
  await start(page);
  await page.evaluate(() => CC.closeSheet && CC.closeSheet());
  // Een lege plek: via de kiezer naar "Minuten en leerniveau van A2", daar staat "Plek A2 verwijderen"
  await page.locator('.tr-rij[data-act="tpVormKiezen"]', { hasText: 'Kies een vorm' }).first().click();
  await page.locator('.sheet [data-act="tpOnderdeel"]').click();
  await expect(page.locator('.sheet [data-act="tpOnderdeelWeg"]')).toHaveText('Plek A2 verwijderen');
  await page.locator('.sheet [data-act="tpOnderdeelWeg"]').click();
  expect(await opbouw(page)).toBe('start:v-s A1:v-a S B1 S B2 P');
  await expect(melding(page)).toContainText('Plek A2 verwijderd');
  await melding(page).getByRole('button', { name: 'Ongedaan maken' }).click();
  expect(await opbouw(page)).toBe('start:v-s A1:v-a S A2 B1 S B2 P');
  await controleer(page, fouten, 'plek verwijderen');
});

test('vorm zonder plek: A1 ontbreekt → terug op A1 vóór de spacing, of naar een lege plek; ongedaan maken', { tag: ['@training'] }, async ({ page }) => {
  const fouten = volgFouten(page);
  await start(page, { opbouw: 'zonderA1' });
  await expect(page.locator('.tr-groep, .kaartje', { hasText: 'Opbouw' }).first()).toBeVisible();
  await openVorm(page);
  await expect(page.locator('.sheet')).toContainText('Deze vorm heeft geen plek. Zet hem op');
  await expect(page.locator('.sheet [data-act="tpPlekGeven"][data-b="A1"]')).toContainText('ontbreekt');
  await expect(page.locator('.sheet [data-act="tpPlekGeven"][data-naar]')).toHaveCount(4); // lege plekken A2, B1, B2, Partij (Start is bezet, spacing telt niet)
  await page.locator('.sheet [data-act="tpPlekGeven"][data-b="A1"]').click();
  expect(await opbouw(page)).toBe('start:v-s A1:v-a S A2 B1 S B2 P');
  expect(await plekA1(page)).toMatchObject({ id: 'o-los', blok: 'A1', min: 6, notitie: 'herhaling' });
  await expect(melding(page)).toContainText('Op A1 gezet');
  await melding(page).getByRole('button', { name: 'Ongedaan maken' }).click();
  expect(await opbouw(page)).toBe('start:v-s S -:v-a A2 B1 S B2 P');
  // Naar een lege plek: de regel zonder plek verdwijnt, de vorm staat op B1 met zijn minuten en notitie
  await openVorm(page);
  await page.locator('.sheet [data-act="tpPlekGeven"][data-naar]', { hasText: 'B1' }).click();
  expect(await opbouw(page)).toBe('start:v-s S A2 B1:v-a S B2 P');
  expect(await page.evaluate(() => CC.S().trainingsplannen[0].onderdelen.find((o) => o.blok === 'B1'))).toMatchObject({ id: 'o5', vormId: 'v-a', min: 6, notitie: 'herhaling' });
  await controleer(page, fouten, 'plek terugzetten');
});

test('gegeven training: de vastlegging gaat met de vorm mee eruit en komt terug bij ongedaan maken', { tag: ['@training'] }, async ({ page }) => {
  const fouten = volgFouten(page);
  await start(page, { gegeven: true });
  // Gegeven zetten zoals de trainer dat doet (Week → Na de training), dan wordt het gereedschap vastgelegd (Besluit 147)
  await page.evaluate(() => { const g = (CC.ui.seg = CC.ui.seg || {}); g.trSeg = 'week'; CC.render(); });
  await page.locator('form[data-autosave="tpTerug"] label.schakel').click();
  const vast = await page.evaluate(() => JSON.parse(JSON.stringify(CC.S().trainingsplannen[0].onderdelen.find((o) => o.blok === 'A1').vast || null)));
  expect(vast).not.toBeNull();
  await page.evaluate(() => { const g = (CC.ui.seg = CC.ui.seg || {}); g.trSeg = 'plannen'; CC.render(); });
  await openVorm(page);
  await page.locator('.sheet [data-act="tpVormEruit"]').click();
  expect((await plekA1(page)).vast).toBeUndefined();
  await melding(page).getByRole('button', { name: 'Ongedaan maken' }).click();
  expect((await plekA1(page)).vast).toEqual(vast);
  await controleer(page, fouten, 'vastlegging');
});

test('training zonder plekcodes (Swift): Weghalen blijft, nu met ongedaan maken; ongedaan maken na een latere wijziging doet niets', { tag: ['@training'] }, async ({ page }) => {
  const fouten = volgFouten(page);
  await start(page, { opbouw: 'swift' });
  await openVorm(page);
  await expect(page.locator('.sheet [data-act="tpOnderdeelWeg"]')).toHaveText('Weghalen');
  await expect(page.locator('.sheet [data-act="tpVormEruit"]')).toHaveCount(0);
  await page.locator('.sheet [data-act="tpOnderdeelWeg"]').click();
  expect(await opbouw(page)).toBe('-:v-s');
  await expect(melding(page)).toContainText('Weggehaald');
  // Intussen iets anders veranderd: ongedaan maken overschrijft dat niet
  await page.evaluate(() => { CC.S().trainingsplannen[0].onderdelen[0].min = 12; CC.save(); });
  await melding(page).getByRole('button', { name: 'Ongedaan maken' }).click();
  expect(await opbouw(page)).toBe('-:v-s');
  expect(await page.evaluate(() => CC.S().trainingsplannen[0].onderdelen[0].min)).toBe(12);
  await controleer(page, fouten, 'swift');
});
