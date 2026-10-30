// ClubComm — Besluit 144: de trainingskaart met vijf vaste regels en de herkomst van elke waarde (Eigen, Periodisering, Weekvoorstel).
// Dezelfde situatie als DCG O13 week 44 (verzonnen namen): di eigen training (gegeven vóór het laden), do eigen voorbereiding
// (wordt overgeslagen), vr concept uit de periodisering, za wedstrijd. Plus een club zonder opleidingsprofiel (zoals Swift).
const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');
const { volgFouten, controleer, nepDatabase, inloggen, nepDb } = require('./hulp');

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
const plannen = async (page, act) => { await page.evaluate((a) => { const g = (CC.ui.seg = CC.ui.seg || {}); g.trSeg = 'plannen'; g.aanwAct = a; CC.render(); }, act); };
const kaart = (page) => page.locator('.tr-tkaart').first();
const plan = (page, id) => page.evaluate((x) => JSON.parse(JSON.stringify(CC.S().trainingsplannen.find((p) => p.id === x || p.actId === x) || null)), id);

for (const breed of [false, true]) {
  test(`trainingskaart: vijf regels met herkomst, weekvoorstel apart, niets ingevuld (${breed ? 'laptop' : 'telefoon'})`, { tag: ['@training', '@profiel'] }, async ({ page }) => {
    const fouten = volgFouten(page);
    const d = await metProfiel(page, breed);
    await laden(page, d);
    // Weekplan: alleen weekvelden; dagwaarden van de eerste dag niet als weekthema; do (eigen voorbereiding) alleen ter informatie
    const wk = await page.evaluate(() => JSON.parse(JSON.stringify(CC.S().trainingsplannen.find((p) => p.week))));
    expect(wk.methodiek.probleem).toBe('vp-2');
    expect(wk.methodiek.hoofdthema).toBeUndefined(); expect(wk.methodiek.niveaus).toBeUndefined(); expect(wk.methodiek.route).toBeUndefined();
    expect(wk.dagen[d.do]).toMatchObject({ hoofdthema: 'Technische onderbouw opbouwen' });
    expect(wk.wedstrijd).toMatchObject({ actId: 'w-za', context: 'Opbouwen achteruit: eerste druklijn uitspelen' });
    expect(wk.wedstrijd.punten.map((x) => x.tekst)).toEqual(['Komt de bal voorbij de eerste druklijn?', 'Wat gebeurt er na balverlies?']);
    // Eigen trainingen blijven precies zoals ze waren (geen methodiek, geen thema erbij)
    expect((await plan(page, 'tp-do')).methodiek).toBeUndefined(); expect((await plan(page, 'tp-do')).thema).toBe('');
    expect((await plan(page, 'tp-di')).methodiek).toBeUndefined();

    // vr: concept uit de periodisering
    await plannen(page, 't-vr');
    await expect(kaart(page).locator('.tr-stand')).toHaveText('Concept uit de periodisering · nog niet aangepast');
    await expect(kaart(page).locator('.tr-kn')).toHaveText(['Wat', 'Waar', 'Welke', 'Niveau', 'Mee uit vorige']);
    await expect(kaart(page)).toContainText('Voetbalprobleem 2 · Vooruitgang creëren');
    await expect(kaart(page)).toContainText('Dagthema: Opbouwen tegen twee/drie jagers');
    await expect(kaart(page)).toContainText('Wedstrijdsituatie');
    await expect(kaart(page)).toContainText('Opbouwen achteruit: eerste druklijn uitspelen');
    await expect(kaart(page).locator('.tr-niv')).toHaveText('Herkennen → Kiezen');
    await expect(kaart(page).locator('.tr-her.p').first()).toHaveText('Periodisering');
    await expect(kaart(page).locator('.tr-her.w')).toHaveCount(0); // een concept heeft zijn eigen waarden; geen weekvoorstel nodig
    // Mee uit vorige: de afspraak van do letterlijk, plus het gekozen antwoord; niet de hele tekst
    await expect(kaart(page).locator('.tr-mee')).toContainText('ik houd maximaal twee coachaccenten centraal.');
    await expect(kaart(page).locator('.tr-mee')).toContainText('volgende training: één variabele aanpassen');
    await expect(kaart(page).locator('.tr-mee')).not.toContainText('A2 duurde langer');
    await expect(page.locator('.tr-stap .tr-niv')).toHaveText('Herkennen → Kiezen');
    await controleer(page, fouten, 'kaart vr');

    // do: eigen voorbereiding, periodisering niet toegepast; weekvoorstel apart; niets ingevuld; accenten in gekozen vormen
    await plannen(page, 't-do');
    await expect(kaart(page).locator('.tr-stand')).toHaveText('Eigen voorbereiding – periodisering niet toegepast');
    await expect(kaart(page)).toContainText('Niet vastgelegd');
    await expect(kaart(page).locator('.tr-wv').first()).toContainText('Weekvoorstel');
    await expect(kaart(page).locator('.tr-wv').first()).toContainText('Vooruitgang creëren');
    await expect(kaart(page)).toContainText('Accenten in gekozen vormen: Eerste contact van druk af · Vooruit inspelen');
    await expect(kaart(page)).toContainText('In gekozen vormen: Uitvoeren 1× · Herkennen 2×');
    await expect(kaart(page)).toContainText('Niet gekozen voor de training');
    await expect(kaart(page)).toContainText('Periodisering voor deze dag (niet toegepast): Technische onderbouw opbouwen · Uitvoeren → Herkennen');
    await expect(kaart(page).locator('.tr-mee')).toContainText('Geen afspraak herkend bij');
    await expect(page.locator('.tr-stap .tr-niv')).toHaveCount(0); // geen leerniveau dat de trainer niet koos
    await controleer(page, fouten, 'kaart do');
    expect((await plan(page, 'tp-do')).methodiek).toBeUndefined(); // alleen bekijken schrijft niets

    // Weekvoorstel alleen met een bewuste tik overnemen (lege velden)
    await page.locator('.tr-tkaart [data-act="tpMethodiek"]').click();
    await expect(page.locator('#sheet .tr-wv')).toContainText('Weekvoorstel');
    await page.locator('#sheet [data-act="tpWeekOver"]').click();
    const do2 = await plan(page, 'tp-do');
    expect(do2.methodiek).toMatchObject({ probleem: 'vp-2', gedrag: 'Kijkt vóór ontvangst' }); expect(do2.methodiek.hoofdthema).toBeUndefined();
    expect(do2.blokDoel).toMatchObject({ A: 'll-aannemen', B: 'll-passen' });
    await expect(kaart(page).locator('.tr-stand')).toHaveText('Eigen voorbereiding');
    await expect(kaart(page).locator('.tr-her.e').first()).toHaveText('Eigen');

    // Lijn: geen leerniveau uit het weekplan bij di
    await page.locator('[data-act="seg"][data-val="lijn"]').click();
    const ma = await page.evaluate((di) => CC.date.addDays(di, -1), d.di);
    if (!(await page.locator('.tr-wdet').count())) await page.locator(`[data-act="perWeekOpen"][data-w="${ma}"]`).click();
    await expect(page.locator('.tr-wdet .tr-stapknop').first()).toContainText(`${await page.evaluate((di) => CC.date.parse(di).getDate(), d.di)}`);
    await expect(page.locator('.tr-wdet .tr-stapknop').first()).not.toContainText('→');
    await controleer(page, fouten, 'lijn');

    // Blokkop: een weekvoorstel staat er als voorstel, niet als keuze van de trainer; een vorm als 'uit gekozen vorm'
    await page.evaluate(() => { const p = CC.S().trainingsplannen.find((x) => x.id === 'tp-di'); p.onderdelen = [{ id: 'x1', blok: 'A1', min: 10 }, { id: 'x2', blok: 'B1', min: 10 }]; CC.save(); });
    await plannen(page, 't-di');
    await expect(page.locator('.tr-gkop.tr-A').first()).toHaveText('A · weekvoorstel: Aannemen en meenemen ▾');
    await expect(page.locator('.tr-gkop.tr-B').first()).toHaveText('B · weekvoorstel: Passen ▾');
    await page.locator('.tr-gkop.tr-A').first().click();
    await expect(page.locator('#sheet .chipknop.aan')).toHaveCount(0);
    await expect(page.locator('#sheet')).toContainText('Weekvoorstel: Aannemen en meenemen (niet gekozen)');
    await page.evaluate(() => CC.closeSheet());
    expect((await plan(page, 'tp-di')).blokDoel).toBeUndefined(); // bekijken schrijft niets
    await page.evaluate(() => { const p = CC.S().trainingsplannen.find((x) => x.id === 'tp-di'); p.onderdelen[0].vormId = 'v-a2'; CC.save(); CC.render(); });
    await expect(page.locator('.tr-gkop.tr-A').first()).toHaveText('A · Aannemen en meenemen · uit gekozen vorm ▾');
    await expect(kaart(page)).toContainText('Accenten in gekozen vormen: Eerste contact van druk af');
    await controleer(page, fouten, 'blokkop');
  });
}

test('trainingskaart: oorspronkelijke planning bij de eerste aanpassing van een concept, niets dubbel bij opnieuw laden', { tag: ['@training', '@profiel'] }, async ({ page }) => {
  const fouten = volgFouten(page);
  const d = await metProfiel(page, true);
  await laden(page, d);
  // Een bestaand, ongewijzigd concept: de app opnieuw openen, zodat alles uit de database komt (zoals de 22 concepten van DCG)
  await expect.poll(async () => Object.values((await nepDb(page)).rows).filter((x) => x.soort === 'trainingsplannen' && x.data.concept).length).toBe(1);
  await page.reload(); await expect(page.locator('nav.nav')).toBeVisible();
  await page.evaluate(() => CC.wisselRol(CC.me().rollen.findIndex((r) => r.rol === 'trainer')));
  await page.locator('nav.nav button[data-tab="aanwezigheid"]').click();
  await plannen(page, 't-vr');
  expect((await plan(page, 't-vr')).origineel).toBeUndefined(); // ongewijzigd: geen kopie in de database
  await page.locator('.tr-tkaart [data-act="tpMethodiek"]').click();
  await page.fill('#pm-g', 'Eerste contact weg van de druk'); await page.locator('#pm-g').press('Tab');
  await page.locator('#sheet [data-act="sluitRender"]').click();
  const vr = await plan(page, 't-vr');
  expect(vr.origineel).toMatchObject({ thema: 'Opbouwen tegen twee/drie jagers', methodiek: { gedrag: 'Kijkt vóór ontvangst', hoofdthema: 'Opbouwen tegen twee/drie jagers' }, blokDoel: { A: 'll-aannemen', B: 'll-passen' } });
  expect(vr.methodiek.gedrag).toBe('Eerste contact weg van de druk');
  await expect(kaart(page).locator('.tr-stand')).toHaveText('Concept uit de periodisering · door jou aangepast');
  await expect(kaart(page).locator('.tr-gedrag .tr-her')).toHaveText('Eigen'); // aangepast
  await expect(kaart(page).locator('.tr-niv + .tr-her')).toHaveText('Periodisering'); // niet aangepast
  await page.locator('.tr-tkaart [data-act="trOrigineel"]').click();
  await expect(page.locator('#sheet')).toContainText('Kijkt vóór ontvangst');
  await page.evaluate(() => CC.closeSheet());
  // Tweede aanpassing: de oorspronkelijke kopie blijft dezelfde (één momentopname)
  await page.evaluate(() => { const p = CC.tr.plan(CC.S(), 't-vr'); p.methodiek.gedrag = 'Nog iets anders'; CC.save(); CC.render(); });
  expect((await plan(page, 't-vr')).origineel.methodiek.gedrag).toBe('Kijkt vóór ontvangst');
  // De database krijgt de kopie mee
  await expect.poll(async () => { const r = Object.values((await nepDb(page)).rows).find((x) => x.soort === 'trainingsplannen' && x.data.actId === 't-vr'); return r && r.data.origineel ? r.data.origineel.methodiek.gedrag : ''; }).toBe('Kijkt vóór ontvangst');
  // Opnieuw laden: wedstrijd en observatiepunten blijven zoals ze zijn, een eigen uitkomst ook
  await page.evaluate(() => { const w = CC.S().trainingsplannen.find((p) => p.week); w.wedstrijd.punten[0].uitkomst = 'Deels'; CC.save(); });
  await laden(page, d, false);
  await expect(page.locator('.tr-pv tr.concept, .tr-pv tr.observatie')).toHaveCount(0); // niets nieuws: alles overgeslagen
  await expect(page.locator('#sheet')).toContainText('heeft al observatiepunten (blijven zoals ze zijn)');
  await page.evaluate(() => CC.closeSheet());
  const wk = await page.evaluate(() => JSON.parse(JSON.stringify(CC.S().trainingsplannen.filter((p) => p.week))));
  expect(wk).toHaveLength(1); expect(wk[0].wedstrijd.punten.map((x) => x.uitkomst)).toEqual(['Deels', null]);
  await controleer(page, fouten, 'oorspronkelijke planning');
});

test('trainingskaart zonder opleidingsprofiel (zoals Swift): alleen een weekvoorstel, geen DCG-methodiek', { tag: ['@training', '@kleineclub'] }, async ({ page }) => {
  const fouten = volgFouten(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await nepDatabase(page);
  await page.evaluate(() => { const db = JSON.parse(sessionStorage.getItem('fake-sb-db')); db.rows['dcg|club|club'].data.modules = { ...(db.rows['dcg|club|club'].data.modules || {}), training: true }; sessionStorage.setItem('fake-sb-db', JSON.stringify(db)); });
  await inloggen(page, 'admin@test.nl');
  await page.evaluate(() => { const S = CC.S(); const D = CC.date; CC.wisselRol(CC.me().rollen.findIndex((r) => r.rol === 'trainer'));
    const v = D.vandaag(); const x = D.parse(v); const ma = D.addDays(v, 7 - ((x.getDay() + 6) % 7));
    S.acts.push({ id: 's-di', teamId: 'O12-1', soort: 'training', datum: D.addDays(ma, 1), tijd: '18:00', eind: '19:00' });
    S.trainingsplannen = [{ id: 'wk-O12-1-' + ma, week: true, teamId: 'O12-1', datum: ma, eigenaar: CC.me().id, methodiek: { thema: 'Opbouwen onder druk', hg1: null, hg2: null } },
      { id: 'tp-s', actId: 's-di', teamId: 'O12-1', datum: D.addDays(ma, 1), eigenaar: CC.me().id, thema: '', leerdoelen: [], onderdelen: [] }];
    CC.save(); CC.render(); });
  await page.locator('nav.nav button[data-tab="aanwezigheid"]').click();
  await plannen(page, 's-di');
  await expect(page.locator('.tr-tkaart-los')).toContainText('Weekvoorstel');
  await expect(page.locator('.tr-tkaart-los')).toContainText('Weekthema: Opbouwen onder druk');
  await expect(page.locator('.tr-meth, .tr-niv, .tr-contra, .tr-methknop')).toHaveCount(0);
  expect(await page.evaluate(() => CC.S().trainingsplannen.find((p) => p.id === 'tp-s').thema)).toBe(''); // niet ingevuld
  // Blokkop zonder profiel: wat er staat, staat er nooit als keuze van de trainer zonder dat hij koos
  await page.evaluate(() => { const S = CC.S(); const w = S.trainingsplannen.find((p) => p.week); w.methodiek.hg1 = 'Passen en trappen'; S.trainingsplannen.find((p) => p.id === 'tp-s').onderdelen = [{ id: 's1', blok: 'A1', min: 10 }]; CC.save(); CC.render(); });
  await expect(page.locator('.tr-gkop.tr-A')).toHaveText('A · kies een leerdoel ▾');
  await controleer(page, fouten, 'zonder profiel');
});
