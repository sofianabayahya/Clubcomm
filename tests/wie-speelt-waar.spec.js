// ClubComm — Besluit NNN: wie speelt waar. Per training, bij de vorm waar je het wilt (meestal de partij): de nummers uit de tekening,
// per nummer de speler die die rol vandaag speelt, uit wie er is. Ook in Week en op de print. Verzonnen namen, nep-database.
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


const tekenPartij = (page) => page.evaluate(() => { const S = CC.S(); const v = S.vormen.find((x) => x.id === 'v-3');
  v.tekening = { items: [{ t: 'p', c: 'keeper', team: 'rood', x: 20, y: 100 }, { t: 'p', c: 'rood', n: 2, x: 60, y: 40 }, { t: 'p', c: 'rood', n: 7, x: 120, y: 40 }, { t: 'p', c: 'geel', n: 2, x: 200, y: 60 }, { t: 'p', c: 'geel', n: 9, x: 160, y: 90 }, { t: 'ball', x: 100, y: 100 }] };
  CC.save(); CC.render(); });
const plek = (page) => page.evaluate(() => JSON.parse(JSON.stringify(CC.S().trainingsplannen.find((p) => p.actId === 't-vr').onderdelen.find((o) => o.blok === 'P'))));
const namen = (page) => page.evaluate(() => CC.m.spelers(CC.S(), 'O12-1').map((p) => ({ id: p.id, naam: p.voornaam })));

for (const breed of [false, true]) {
  test(`wie speelt waar: indelen bij de partij, zien in Plannen, Week en op de print (${breed ? 'laptop' : 'telefoon'})`, { tag: ['@training', '@profiel'] }, async ({ page }) => {
    const fouten = volgFouten(page);
    const d = await metProfiel(page, breed);
    await laden(page, d);
    await opbouw(page, d);
    await tekenPartij(page);
    const sp = await namen(page);
    // Eén speler meldt zich af via de aanwezigheid: die staat niet in de keuzelijst
    await page.evaluate((id) => { const S = CC.S(); const all = CC.m.spelers(S, 'O12-1'); S.pres['t-vr'] = { s: Object.fromEntries(all.map((p) => [p.id, p.id === id ? 'x' : 'a'])) }; CC.save(); }, sp[3].id);
    await page.evaluate(() => { const g = (CC.ui.seg = CC.ui.seg || {}); g.trSeg = 'plannen'; g.aanwAct = 't-vr'; CC.render(); });
    const rijP = page.locator('.tr-midden .tr-rij', { hasText: 'Partij acht tegen acht' });
    await expect(rijP).not.toContainText('wie speelt waar');
    await rijP.click();
    const sh = page.locator('#sheet');
    await expect(sh.locator('.tr-wie')).toContainText('Wie speelt waar · 0 van 5 ingedeeld');
    await expect(sh.locator('.tr-wteam')).toHaveText(['Rood · 3', 'Geel · 2']);
    await expect(sh.locator('.tr-wrij2').nth(2)).toContainText('rechtsbuiten');
    // Rood 7 kiezen: de afgemelde speler staat er niet bij
    await sh.locator('[data-act="tpWieKies"][data-k="rood|7"]').click();
    await expect(sh).toContainText('Rood 7 · rechtsbuiten');
    await expect(sh.locator('[data-act="tpWieZet"][data-sp="' + sp[3].id + '"]')).toHaveCount(0);
    await sh.locator('[data-act="tpWieZet"][data-sp="' + sp[0].id + '"]').click();
    await expect(sh.locator('.tr-wie')).toContainText('1 van 5 ingedeeld');
    await expect(sh.locator('[data-k="rood|7"]')).toContainText(sp[0].naam);
    expect((await plek(page)).indeling).toEqual({ 'rood|7': sp[0].id });
    // Dezelfde speler op rood 2: hij verhuist (één rol per speler in deze vorm)
    await sh.locator('[data-act="tpWieKies"][data-k="rood|2"]').click();
    await expect(sh.locator('.tr-wal')).toHaveCount(1); // al ingedeeld, onder 'Al ingedeeld'
    await sh.locator('details.uitklap > summary', { hasText: 'Al ingedeeld' }).click();
    await sh.locator('[data-act="tpWieZet"][data-sp="' + sp[0].id + '"]').click();
    expect((await plek(page)).indeling).toEqual({ 'rood|2': sp[0].id });
    // Keeper en geel 9 erbij
    await sh.locator('[data-act="tpWieKies"][data-k="keeper|rood"]').click(); await sh.locator('[data-act="tpWieZet"][data-sp="' + sp[1].id + '"]').click();
    await sh.locator('[data-act="tpWieKies"][data-k="geel|9"]').click(); await sh.locator('[data-act="tpWieZet"][data-sp="' + sp[2].id + '"]').click();
    await expect(sh.locator('.tr-wie')).toContainText('3 van 5 ingedeeld');
    // Leeg laten
    await sh.locator('[data-act="tpWieKies"][data-k="geel|9"]').click(); await sh.locator('[data-act="tpWieZet"][data-sp=""]').click();
    expect(Object.keys((await plek(page)).indeling).sort()).toEqual(['keeper|rood', 'rood|2']);
    await page.evaluate(() => CC.closeSheet());
    // Plannen: de regel noemt het; Week: een link naar het venster
    await expect(page.locator('.tr-midden .tr-rij', { hasText: 'Partij acht tegen acht' })).toContainText('wie speelt waar 2/5');
    await page.evaluate(() => { CC.ui.seg.trSeg = 'week'; CC.render(); });
    await expect(page.locator('.tr-weekkaart .tr-wielink')).toContainText('Wie speelt waar · P · 2/5 ingedeeld');
    await page.locator('.tr-weekkaart .tr-wielink').click();
    await expect(page.locator('#sheet .tr-wie')).toContainText('2 van 5 ingedeeld');
    await page.evaluate(() => CC.closeSheet());
    // Print: onder de partij de namen per team
    const html = await page.evaluate(() => { let uit = ''; const o = CC.printDoc; CC.printDoc = (t, h) => { uit = h; }; const b = document.createElement('button'); b.dataset.act = 'tpPrint'; b.dataset.id = 't-vr'; document.body.append(b); b.click(); b.remove(); CC.printDoc = o; return uit; });
    expect(html).toContain(`<b>Rood:</b> K ${sp[1].naam} · 2 ${sp[0].naam}`);
    expect(html).not.toContain('<b>Geel:</b>');
    await controleer(page, fouten);
  });
}
