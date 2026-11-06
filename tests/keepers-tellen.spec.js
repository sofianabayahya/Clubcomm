// ClubComm — Besluit NNN: keepers tellen mee. Uit de aanwezigheid (anders: niet afgemeld) telt ClubComm veldspelers en keepers apart;
// een vorm past als het totaal klopt, een extra keeper speelt mee in het veld. Verzonnen namen, nep-database.
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
const naarPlannen = (page) => page.evaluate(() => { const g = (CC.ui.seg = CC.ui.seg || {}); g.trSeg = 'plannen'; g.aanwAct = 't-vr'; CC.render(); });


const zetVorm = (page, extra) => page.evaluate((x) => { const S = CC.S(); S.vormen.filter((v) => /^v-\d$/.test(v.id)).forEach((v) => Object.assign(v, x)); CC.save(); CC.render(); }, extra);
const keepers = (page, n) => page.evaluate((n) => { const S = CC.S(); const sp = CC.m.spelers(S, 'O12-1'); sp.forEach((pl, i) => { if (i < n) pl.positie = 'keeper'; else delete pl.positie; }); CC.save(); CC.render(); return sp.length; }, n);

test('keepers tellen mee: kop, past en "speelt mee in het veld"', { tag: ['@training', '@profiel'] }, async ({ page }) => {
  const fouten = volgFouten(page);
  const d = await metProfiel(page, false);
  await laden(page, d);
  await opbouw(page, d);
  const n = await keepers(page, 2);
  expect(n).toBe(4); // 4 spelers in het team, 2 daarvan keeper
  await naarPlannen(page);
  const kop = page.locator('.tr-plankop small.zacht').first();
  await expect(kop).toContainText('2 spelers + 2 keepers verwacht');
  // Vorm voor 3 spelers + 1 keeper: past bij 4 (2 veld + 2 keepers): geen waarschuwing, wel "speelt mee in het veld"
  await zetVorm(page, { spelersMin: 3, spelersMax: 3, keepersMin: 1, keepersMax: 1 });
  await expect(page.locator('.tr-pastniet')).toHaveCount(0);
  await expect(page.locator('.tr-midden .tr-rij .st.o')).toHaveCount(0);
  await expect(page.locator('.tr-midden .tr-rij', { hasText: '1 keeper speelt mee in het veld' }).first()).toBeVisible();
  // Vorm voor 4 spelers + 1 keeper (5): past niet bij 4, en de melding noemt de keepers
  await zetVorm(page, { spelersMin: 4, spelersMax: 4, keepersMin: 1, keepersMax: 1 });
  await expect(page.locator('.tr-pastniet')).toContainText('gemaakt voor 4 spelers + 1 keeper');
  await expect(page.locator('.tr-pastniet')).toContainText('2 spelers + 2 keepers verwacht');
  // Vroeger: 4 tegen een vorm voor 3 veldspelers + 1 keeper = "past niet". Nu past dat (zie hierboven).
  // Aanwezigheid opgenomen: wie er niet was, telt niet
  await page.evaluate(() => { const S = CC.S(); const sp = CC.m.spelers(S, 'O12-1'); S.pres['t-vr'] = { s: { [sp[0].id]: 'a', [sp[2].id]: 'a', [sp[3].id]: 'a', [sp[1].id]: 'x' } }; CC.save(); CC.render(); });
  await expect(kop).toContainText('2 spelers + 1 keeper aanwezig');
  await zetVorm(page, { spelersMin: 2, spelersMax: 2, keepersMin: 1, keepersMax: 1 });
  await expect(page.locator('.tr-pastniet')).toHaveCount(0);
  await controleer(page, fouten);
});
