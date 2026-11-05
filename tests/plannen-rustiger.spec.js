// ClubComm — Besluit 167: Plannen minder dubbel (afspraak los, onderbouwing en tijd ingeklapt, één regel voor vormen die niet passen,
// Vormenbank op de telefoon ingeklapt). Verzonnen namen, nep-database. Nooit tegen de productiedatabase.
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

for (const breed of [false, true]) {
  test(`plannen: minder dubbel (${breed ? 'laptop' : 'telefoon'})`, { tag: ['@training', '@profiel'] }, async ({ page }) => {
    const fouten = volgFouten(page);
    const d = await metProfiel(page, breed);
    await laden(page, d);
    await opbouw(page, d);
    await page.evaluate(() => { CC.S().vormen.forEach((v) => { if (/^v-\d$/.test(v.id)) { v.spelersMin = 8; v.spelersMax = 12; } }); CC.save(); });
    await naarPlannen(page);
    const m = page.locator('.tr-midden');
    if (breed) { // Besluit NNN: op de laptop staan afspraak, onderbouwing en tijd rechts, open (gesplitst scherm)
      const z = page.locator('.tr-pzij .tr-zijwaarom');
      await expect(z.locator(':scope > .tr-mee')).toContainText('maximaal twee coachaccenten');
      await expect(z.locator('.tr-kn', { hasText: 'Wat' })).toBeVisible();
      await expect(z.locator('.tr-kn', { hasText: 'Mee uit vorige' })).toHaveCount(0);
      await expect(z.locator('.tr-tijd-r')).toContainText('68');
      await expect(z.locator('.tr-orgknop')).toBeVisible();
      await expect(m.locator(':scope > .tr-mee, :scope > details.tr-waarom, :scope > details.tr-tijdkort')).toHaveCount(0);
      await expect(m.locator('.tr-pastniet')).toContainText('3 vormen zijn gemaakt voor 8–12 spelers');
      await expect(page.locator('#planZoek')).toBeVisible();
      await opbouw(page, d, { teVeel: true });
      await expect(page.locator('.tr-zijwaarom .tr-twaarsch')).toContainText('te veel');
      await controleer(page, fouten);
      return;
    }
    // Afspraak los zichtbaar, onderbouwing ingeklapt met het voetbalprobleem
    await expect(m.locator(':scope > .tr-mee')).toContainText('maximaal twee coachaccenten');
    const w = m.locator(':scope > details.tr-waarom');
    await expect(w).not.toHaveAttribute('open', '');
    await expect(w.locator('> summary')).toHaveText('Waarom deze training · Vooruitgang creëren');
    await expect(w.locator('.tr-kn', { hasText: 'Mee uit vorige' })).toHaveCount(0);
    // Tijd in één regel
    const t = m.locator(':scope > details.tr-tijdkort');
    await expect(t).not.toHaveAttribute('open', '');
    await expect(t.locator('> summary')).toHaveText('✓ 68 van 68 min ingepland');
    // Vormen die niet passen: één regel, per plek alleen 'past niet'
    await expect(m.locator('.tr-pastniet')).toContainText('3 vormen zijn gemaakt voor 8–12 spelers');
    await expect(m.locator('.tr-rij', { hasText: 'gemaakt voor' })).toHaveCount(0);
    await expect(m.locator('.tr-rij .st.o').first()).toHaveText('past niet');
    await expect(m).not.toContainText('plekken ingevuld');
    // Vormenbank: telefoon ingeklapt, laptop kolom
    if (breed) { await expect(page.locator('.tr-bankklap')).toHaveCount(0); await expect(page.locator('#planZoek')).toBeVisible(); }
    else { await expect(page.locator('.tr-bankklap > summary')).toContainText('Vormenbank · '); await expect(page.locator('#planZoek')).toBeHidden();
      await page.locator('.tr-bankklap > summary').click(); await page.fill('#planZoek', 'rondo'); await expect(page.locator('.tr-bankklap')).toHaveAttribute('open', ''); }
    // Open blijft open; de organisatie is aan te passen
    await t.locator('> summary').click();
    await page.evaluate(() => CC.render());
    await expect(page.locator('.tr-midden > details.tr-tijdkort')).toHaveAttribute('open', '');
    await expect(page.locator('.tr-midden .tr-orgknop')).toBeVisible();
    // Te veel ingepland: de regel staat vanzelf open met de waarschuwing
    await page.evaluate(() => { CC.ui.uitklap = {}; });
    await opbouw(page, d, { teVeel: true });
    await expect(page.locator('.tr-midden > details.tr-tijdkort')).toHaveAttribute('open', '');
    await expect(page.locator('.tr-midden > details.tr-tijdkort > summary')).toContainText('te veel');
    await expect(page.locator('.tr-midden .tr-twaarsch', { hasText: 'te veel' })).toBeVisible();
    const bw = await page.evaluate(() => document.documentElement.scrollWidth); expect(bw).toBeLessThanOrEqual(breed ? 1366 : 390);
    await controleer(page, fouten);
  });
}
