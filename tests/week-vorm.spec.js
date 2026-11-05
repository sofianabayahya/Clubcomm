// ClubComm — Besluit 165: Week rustiger (afspraak bovenaan, tijd alleen als waarschuwing, onderbouwing ingeklapt),
// Bewerken korter (Opzet ingeklapt, hulpvraag in het vak, varianten en groepsgroottes ingeklapt) en overnemen uit de tekening.
// Verzonnen namen, nep-database. Nooit tegen de productiedatabase.
const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');
const { volgFouten, controleer, nepDatabase, inloggen } = require('./hulp');

const PROFIEL = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'supabase', 'profielen', 'dcg.json'), 'utf8'));

const metProfiel = async (page, breed) => {
  await page.setViewportSize(breed ? { width: 1366, height: 900 } : { width: 390, height: 844 });
  await nepDatabase(page);
  await page.evaluate((data) => { const db = JSON.parse(sessionStorage.getItem('fake-sb-db'));
    db.rows['dcg|profiel|dcg'] = { club_id: 'dcg', soort: 'profiel', id: 'dcg', scope: 'hjo', data };
    db.rows['dcg|club|club'].data.modules = { ...(db.rows['dcg|club|club'].data.modules || {}), training: true };
    sessionStorage.setItem('fake-sb-db', JSON.stringify(db)); }, PROFIEL);
  await inloggen(page, 'admin@test.nl');
  // Week van volgende week: di, do, vr training en za wedstrijd
  return page.evaluate(() => { const S = CC.S(); const D = CC.date; CC.wisselRol(CC.me().rollen.findIndex((r) => r.rol === 'trainer'));
    const v = D.vandaag(); const x = D.parse(v); const ma = D.addDays(v, 7 - ((x.getDay() + 6) % 7));
    const d = { di: D.addDays(ma, 1), do: D.addDays(ma, 3), vr: D.addDays(ma, 4), za: D.addDays(ma, 5) };
    const t = (id, datum) => ({ id, teamId: 'O12-1', soort: 'training', datum, tijd: '17:15', eind: '18:30' });
    S.acts.push(t('t-di', d.di), t('t-do', d.do), t('t-vr', d.vr), { id: 'w-za', teamId: 'O12-1', soort: 'wedstrijd', datum: d.za, tijd: '11:00', eind: '12:00', thuis: false, tegen: 'Testclub O13-5' });
    const ik = CC.me().id;
    S.vormen = [{ id: 'v-a2', naam: 'A2 – Eerste contact van de druk af', eigenaar: ik, koppelingen: { dcg: { primair: 'll-aannemen' } }, leerdoelen: ['ll-aannemen'], vaardigheden: ['vh-eerste-contact-van-druk-af'] },
      { id: 'v-b2', naam: 'B2 – Slootspel', eigenaar: ik, koppelingen: { dcg: { primair: 'll-passen' } }, leerdoelen: ['ll-passen'], vaardigheden: ['vh-vooruit-inspelen'] }];
    S.trainingsplannen = [
      { id: 'tp-di', actId: 't-di', teamId: 'O12-1', datum: d.di, eigenaar: ik, thema: 'Passeren (dreigen)', leerdoelen: ['ll-1v1-aanvallend'], onderdelen: [], gegeven: true, anders: 'Partijvorm: de 10 neutraal bij de aanvallende partij.' },
      { id: 'tp-do', actId: 't-do', teamId: 'O12-1', datum: d.do, eigenaar: ik, thema: '', leerdoelen: [], gegeven: true,
        anders: 'A2 duurde langer dan gepland.\n\nConcrete afspraak voor de volgende training: ik houd maximaal twee coachaccenten centraal.',
        evaluatie: { 'ev-volgende': 'één variabele aanpassen' },
        onderdelen: [{ id: 'o1', vormId: 'v-a2', min: 10, niveau: 'ln-uitvoeren' }, { id: 'o2', vormId: 'v-a2', min: 10, niveau: 'ln-herkennen' }, { id: 'o3', vormId: 'v-b2', min: 10, niveau: 'ln-herkennen' }] }];
    CC.save(); CC.render(); return d; });
};
// Periodisering: do en vr training (verschillende dagthema's en leerniveaus), za wedstrijd met wedstrijdsituatie en observatiepunten
const csvVan = (d) => ['datum;soort;fase;week;hoofdthema;teamfunctie;probleem;contrathema;gereedschapA;gereedschapB;leerniveau;gedrag;informatie;leerroute;observatie',
  `${d.do};training;Fase 1;44;Technische onderbouw opbouwen;Aanvallen;2;6;Aannemen en meenemen;Passen;Uitvoeren → Herkennen;Kijkt vóór ontvangst;Drukrichting;Gerichte vorm;`,
  `${d.vr};training;Fase 1;44;Opbouwen tegen twee/drie jagers;Aanvallen;2;6;Aannemen en meenemen;Passen;Herkennen → Kiezen;Kijkt vóór ontvangst;Drukrichting;Korte positiesituaties;`,
  `${d.za};wedstrijd;Fase 1;44;Opbouwen achteruit: eerste druklijn uitspelen;Aanvallen;2;6;;;;;;;Komt de bal voorbij de eerste druklijn? | Wat gebeurt er na balverlies?`].join('\n');
const laden = async (page, d, toevoegen = true) => {
  await page.locator('nav.nav button[data-tab="aanwezigheid"]').click();
  await page.locator('[data-act="seg"][data-val="lijn"]').click();
  await page.locator('[data-act="perBeheer"]').click(); await page.locator('#sheet [data-act="perLaden"]').click();
  await page.locator('#perBestand').setInputFiles({ name: 'o13-wk44.csv', mimeType: 'text/csv', buffer: Buffer.from(csvVan(d), 'utf8') });
  if (toevoegen) await page.locator('[data-act="perToevoegen"]').click();
};

// Training op vr met acht plekken (DCG-sjabloon) en organisatietijd; do heeft een afspraak (uit metProfiel)
const opbouw = async (page, d, { teVeel = false } = {}) => page.evaluate(({ d, teVeel }) => { const S = CC.S(); const ik = CC.me().id;
  const v = (id, naam) => ({ id, naam, eigenaar: ik, koppelingen: { dcg: { primair: 'll-passen' } }, leerdoelen: ['ll-passen'], vaardigheden: [] });
  S.vormen.push(v('v-1', 'Passen in driehoek'), v('v-2', 'Rondo vier tegen twee'), v('v-3', 'Partij acht tegen acht'));
  let pl = S.trainingsplannen.find((p) => p.actId === 't-vr'); if (!pl) { pl = { id: 'tp-vr', actId: 't-vr', teamId: 'O12-1', datum: d.vr, eigenaar: ik, leerdoelen: [] }; S.trainingsplannen.push(pl); }
  const o = (id, blok, min, vormId) => ({ id, blok, min, spacing: blok === 'S', naam: blok === 'start' ? 'Start' : blok === 'P' ? 'Partij' : '', vormId });
  Object.assign(pl, { thema: 'Opbouwen tegen twee jagers', sjabloon: 'dcg-75', overig: { min: 7 }, blokDoel: { A: 'll-aannemen', B: 'll-passen' },
    onderdelen: [o('o1', 'start', 8, 'v-1'), o('o2', 'A1', 6, 'v-1'), o('o3', 'S', 3), o('o4', 'A2', 10, 'v-2'), o('o5', 'B1', 6, 'v-2'), o('o6', 'S', 3), o('o7', 'B2', 10, 'v-2'), o('o8', 'P', teVeel ? 30 : 22, 'v-3')] });
  CC.save(); CC.render(); }, { d, teVeel });
const naarWeek = (page) => page.evaluate(() => { const g = (CC.ui.seg = CC.ui.seg || {}); g.trSeg = 'week'; g.aanwAct = 't-vr'; CC.render(); });

for (const breed of [false, true]) {
  test(`week: eerst de training, tijd alleen als waarschuwing, onderbouwing ingeklapt (${breed ? 'laptop' : 'telefoon'})`, { tag: ['@training', '@profiel'] }, async ({ page }) => {
    const fouten = volgFouten(page);
    const d = await metProfiel(page, breed);
    await laden(page, d);
    await opbouw(page, d);
    await naarWeek(page);
    const k = page.locator('.tr-weekkaart');
    await expect(k.locator('.tr-kop b')).toHaveText('Opbouwen tegen twee jagers');
    await expect(k).not.toContainText('min gepland');
    await expect(k.locator('.tr-tijd')).toHaveCount(0);
    await expect(k.locator('.tr-twaarsch')).toHaveCount(0);
    // De afspraak van de vorige training staat bovenaan, vóór de vormen
    await expect(k.locator(':scope > .tr-mee')).toContainText('maximaal twee coachaccenten');
    const volgorde = await k.evaluate((x) => [...x.children].map((c) => c.className));
    expect(volgorde.findIndex((c) => c.includes('tr-mee'))).toBeLessThan(volgorde.findIndex((c) => c.includes('tr-lijst')));
    expect(volgorde.findIndex((c) => c.includes('tr-lijst'))).toBeLessThan(volgorde.findIndex((c) => c.includes('tr-waarom')));
    // Onderbouwing ingeklapt met samenvatting; Mee uit vorige staat er niet nog een keer in
    const w = k.locator('details.tr-waarom');
    await expect(w).not.toHaveAttribute('open', '');
    await expect(w.locator('> summary')).toContainText('A Aannemen en meenemen');
    await expect(w.locator('> summary')).toContainText('B Passen');
    await expect(w.locator('.tr-kn', { hasText: 'Mee uit vorige' })).toHaveCount(0);
    await w.locator('> summary').click();
    await expect(w.locator('.tr-kn', { hasText: 'Wat' })).toBeVisible();
    // Open blijft open na opnieuw tekenen
    await page.evaluate(() => CC.render());
    await expect(page.locator('.tr-weekkaart details.tr-waarom')).toHaveAttribute('open', '');
    // Te veel ingepland: alleen de waarschuwing
    await opbouw(page, d, { teVeel: true });
    await expect(page.locator('.tr-weekkaart .tr-twaarsch')).toContainText('te veel');
    await expect(page.locator('.tr-weekkaart .tr-tijd')).toHaveCount(0);
    // Plannen houdt de tijdsbalk (Besluit 142)
    await page.evaluate(() => { CC.ui.seg.trSeg = 'plannen'; CC.render(); });
    await expect(page.locator('.tr-tijd').first()).toContainText('oefentijd');
    await controleer(page, fouten);
  });
}

const bank = async (page, breedte = 390) => {
  await page.setViewportSize({ width: breedte, height: 844 });
  await nepDatabase(page);
  await page.evaluate((d) => { const db = JSON.parse(sessionStorage.getItem('fake-sb-db'));
    db.rows['dcg|profiel|dcg'] = { club_id: 'dcg', soort: 'profiel', id: 'dcg', scope: 'hjo', data: d };
    db.rows['dcg|club|club'].data.modules = { ...(db.rows['dcg|club|club'].data.modules || {}), training: true };
    sessionStorage.setItem('fake-sb-db', JSON.stringify(db)); }, PROFIEL);
  await inloggen(page, 'admin@test.nl');
  await page.evaluate(() => { const S = CC.S(); CC.wisselRol(CC.me().rollen.findIndex((r) => r.rol === 'trainer')); const ik = CC.me().id;
    const p = (c, x, y) => ({ t: 'p', c, x, y });
    const tek = { items: [p('oranje', 100, 100), p('oranje', 200, 100), p('oranje', 100, 200), p('oranje', 200, 200), p('roze', 150, 140), p('roze', 160, 160), p('keeper', 20, 150), p('trainer', 300, 150), { t: 'ball', x: 110, y: 110 }, { t: 'cone', x: 90, y: 90 }] };
    S.vormen = [{ id: 'v-leeg', naam: 'Nieuwe vorm', eigenaar: ik, koppelingen: {}, leerdoelen: [], vaardigheden: [], tekening: tek },
      { id: 'v-vol', naam: 'Rondo', eigenaar: ik, koppelingen: { dcg: { primair: 'll-passen', ook: [] } }, leerdoelen: ['ll-passen'], vaardigheden: [], spelersMin: 8, spelersMax: 12, duur: 10, afmeting: '20 × 15 m', tekening: tek,
        varianten: [{ naam: 'Makkelijker', tekst: 'Groter vak', richting: 'makkelijker' }] }];
    CC.save(); CC.render(); });
};
const bewerk = async (page, id) => { await page.evaluate((x) => CC.open('vorm', { id: x }), id); await expect(page.locator('form[data-autosave="vorm"]')).toBeVisible(); };
const vd = (page, id) => page.evaluate((x) => JSON.parse(JSON.stringify(CC.S().vormen.find((v) => v.id === x))), id);

for (const breedte of [390, 1366]) {
  test(`bewerken: opzet ingeklapt, hulpvraag in het vak, varianten ingeklapt (${breedte} px)`, { tag: ['@training'] }, async ({ page }) => {
    const fouten = volgFouten(page);
    await bank(page, breedte);
    await bewerk(page, 'v-vol');
    const f = page.locator('form[data-autosave="vorm"]');
    const opzet = f.locator('details.tr-opzet');
    await expect(opzet).not.toHaveAttribute('open', '');
    await expect(opzet.locator('> summary')).toHaveText('Opzet · 8–12 spelers · 10 min · 20 × 15 m');
    for (const t of ['Hoe staat het klaar', 'Hoe begint', 'Wat mag', 'Welk gedrag']) await expect(f.locator('small.zacht', { hasText: t })).toHaveCount(0);
    await expect(f.locator('[name="organisatie"]')).toHaveAttribute('placeholder', /^Hoe staat het klaar\?/);
    await expect(f.locator('[name="coach"]')).toHaveAttribute('placeholder', /Eén per regel/);
    await expect(page.locator('details.tr-varianten > summary')).toHaveText('Makkelijker, moeilijker en varianten · 1');
    await expect(page.locator('details.tr-groottes > summary')).toHaveText('Bij andere groepsgroottes · 0');
    await expect(page.locator('details.tr-varianten')).not.toHaveAttribute('open', '');
    // Opzet openen en invullen: blijft open, autosave werkt
    await opzet.locator('> summary').click();
    await f.locator('[name="duur"]').fill('12'); await f.locator('[name="duur"]').blur();
    await expect.poll(async () => (await vd(page, 'v-vol')).duur).toBe(12);
    await f.locator('[data-act="vormKies"][data-veld="richting"][data-w="1"]').count().then(async (n) => { if (n) { await page.locator('details.tr-kenmerk > summary').click(); await page.locator('[data-act="vormKies"][data-veld="richting"][data-w="1"]').click(); } });
    await expect(page.locator('details.tr-opzet')).toHaveAttribute('open', '');
    // Nieuwe vorm: opzet staat open
    await bewerk(page, 'v-leeg');
    await expect(page.locator('details.tr-opzet')).toHaveAttribute('open', '');
    const w = await page.evaluate(() => document.documentElement.scrollWidth); expect(w).toBeLessThanOrEqual(breedte);
    await controleer(page, fouten);
  });
}

test('uit je tekening: overnemen vult alleen lege velden, niet nu verbergt', { tag: ['@training'] }, async ({ page }) => {
  const fouten = volgFouten(page);
  await bank(page);
  await bewerk(page, 'v-leeg');
  const kaart = page.locator('.tr-uittek');
  await expect(kaart).toContainText('6 spelers: 4 oranje, 2 roze');
  await expect(kaart).toContainText('4 tegen 2');
  await expect(kaart).toContainText('1 keeper');
  await expect(kaart).toContainText('1 bal');
  expect((await vd(page, 'v-leeg')).spelersMin).toBeUndefined(); // niets vanzelf
  await kaart.locator('[data-act="vormUitTekening"]').click();
  const v = await vd(page, 'v-leeg');
  expect([v.spelersMin, v.spelersMax, v.keepersMin, v.keepersMax]).toEqual([6, 6, 1, 1]);
  expect(v.aantal).toEqual({ aanval: 4, verdediging: 2, neutraal: null, keepers: 1 });
  await expect(page.locator('.tr-uittek')).toHaveCount(0); // alles ingevuld: geen kaart meer
  // Vorm met spelers al ingevuld: spelers blijven, alleen keepers en aantallen worden aangeboden
  await bewerk(page, 'v-vol');
  await page.locator('.tr-uittek [data-act="vormUitTekening"]').click();
  const w = await vd(page, 'v-vol');
  expect([w.spelersMin, w.spelersMax, w.keepersMin]).toEqual([8, 12, 1]);
  expect(w.aantal.aanval).toBe(4);
  // Niet nu: kaart weg, gegevens onveranderd
  await page.evaluate(() => { const x = CC.S().vormen.find((v) => v.id === 'v-leeg'); delete x.aantal; x.spelersMin = null; x.spelersMax = null; CC.save(); });
  await bewerk(page, 'v-leeg');
  const voor = await vd(page, 'v-leeg');
  await page.locator('.tr-uittek [data-act="vormNietNu"]').click();
  await expect(page.locator('.tr-uittek')).toHaveCount(0);
  expect(await vd(page, 'v-leeg')).toEqual(voor);
  await controleer(page, fouten);
});
