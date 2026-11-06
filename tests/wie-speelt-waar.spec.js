// ClubComm — Besluit 173, 175 en NNN: opstelling per training. Indelen via de tekening of de lijst per kleur (ook spelers zonder nummer), wisselen in twee tikken; geen namen in de tekening. Per training, bij de vorm waar je het wilt (meestal de partij): de nummers uit de tekening,
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
  v.tekening = { field: 'vak', items: [{ t: 'p', c: 'keeper', team: 'rood', x: 20, y: 100 }, { t: 'p', c: 'rood', n: 2, x: 60, y: 40 }, { t: 'p', c: 'rood', n: 7, x: 120, y: 40 }, { t: 'p', c: 'geel', n: 2, x: 200, y: 60 }, { t: 'p', c: 'geel', x: 160, y: 90 }, { t: 'ball', x: 100, y: 100 }] };
  CC.save(); CC.render(); });
const plek = (page) => page.evaluate(() => JSON.parse(JSON.stringify(CC.S().trainingsplannen.find((p) => p.actId === 't-vr').onderdelen.find((o) => o.blok === 'P'))));
const namen = (page) => page.evaluate(() => CC.m.spelers(CC.S(), 'O12-1').map((p) => ({ id: p.id, naam: p.voornaam })));

const kijkTekst = (page) => page.evaluate(() => (document.querySelector('#sheet .tr-rv-l .tr-groot') || {}).textContent || '');
const tik = (page, k) => page.evaluate((k) => { const c = document.querySelector(`#sheet .tr-wieveld [data-k="${k}"]`); c.dispatchEvent(new MouseEvent('click', { bubbles: true })); }, k);
const kies = (page, id) => page.locator(`#sheet [data-act="tpWieZet"][data-sp="${id}"]`).click();

const rijen = (page) => page.locator('#sheet .tr-wierijen .tr-rij');
const kleur = async (page, k) => { await page.waitForTimeout(1600); await page.locator(`#sheet [data-act="tpWieKleur"][data-kleur="${k}"]`).click(); }; // de app negeert een tweede tik binnen korte tijd

for (const breed of [false, true]) {
  test(`opstelling: per kleur indelen en wisselen, Op het veld lezen, print (${breed ? 'laptop' : 'telefoon'})`, { tag: ['@training', '@profiel'] }, async ({ page }) => {
    const fouten = volgFouten(page);
    const d = await metProfiel(page, breed);
    await laden(page, d);
    await opbouw(page, d);
    await tekenPartij(page);
    const sp = await namen(page);
    await page.evaluate((id) => { const S = CC.S(); const all = CC.m.spelers(S, 'O12-1'); S.pres['t-vr'] = { s: Object.fromEntries(all.map((p) => [p.id, p.id === id ? 'x' : 'a'])) }; CC.save(); }, sp[3].id);
    await page.evaluate(() => { const g = (CC.ui.seg = CC.ui.seg || {}); g.trSeg = 'plannen'; g.aanwAct = 't-vr'; CC.render(); });
    await page.locator('.tr-midden .tr-rij', { hasText: 'Partij acht tegen acht' }).click();
    const sh = page.locator('#sheet');
    // Zonder namen ingeklapt (vaardigheidsvormen mix je); één tik opent het
    await expect(sh.locator('.tr-wie > summary')).toHaveText('Opstelling · namen erbij');
    await expect(sh.locator('.tr-wie')).not.toHaveAttribute('open', '');
    await sh.locator('.tr-wie > summary').click();
    // Geen namen in de tekening; wel een tikvlak per speler (5, ook de gele zonder nummer)
    await expect(sh.locator('.tr-wieveld svg [data-act="tpWieKies"]')).toHaveCount(5);
    await expect(sh.locator('.tr-wieveld svg text')).not.toContainText(['+ naam']);
    // Kleuren met de telling; rood eerst: keeper eerst, dan op nummer
    await expect(sh.locator('[data-act="tpWieKleur"]')).toHaveText(['Rood 0/3', 'Geel 0/2']);
    await expect(rijen(page)).toHaveCount(3);
    await expect(rijen(page).locator('.tr-wbol')).toHaveText(['K', '2', '7']);
    // Rood 7 via de lijst
    await rijen(page).nth(2).click();
    await expect(sh).toContainText('Rood 7 · rechtsbuiten');
    await expect(sh.locator(`[data-act="tpWieZet"][data-sp="${sp[3].id}"]`)).toHaveCount(0); // afgemeld
    await kies(page, sp[0].id);
    await expect(rijen(page).nth(2)).toContainText(sp[0].naam);
    await expect(sh.locator('.tr-wieveld svg')).not.toContainText(sp[0].naam); // niet in de tekening
    // Geel: de speler zonder nummer via de tekening
    await kleur(page, 'geel');
    await expect(rijen(page).locator('.tr-wbol')).toHaveText(['2', '–']);
    await tik(page, 'geel|#1');
    await expect(sh).toContainText('Geel · speler zonder nummer');
    await kies(page, sp[1].id);
    expect((await plek(page)).indeling).toEqual({ 'rood|7': sp[0].id, 'geel|#1': sp[1].id });
    await expect(sh.locator('.tr-wie > summary')).toHaveText('Opstelling · 2 van 5 ingedeeld');
    await expect(sh.locator('[data-act="tpWieKleur"]')).toHaveText(['Rood 1/3', 'Geel 1/2']);
    // Wisselen in twee tikken: rood 7 krijgt de gele speler, en andersom
    await tik(page, 'rood|7');
    await expect(sh.locator(`[data-sp="${sp[1].id}"]`)).toContainText('nu geel · wisselt');
    await kies(page, sp[1].id);
    await expect(sh.locator('[data-act="tpWieKleur"][aria-selected="true"]')).toContainText('Rood'); // de lijst springt naar de kleur van de getikte speler
    expect((await plek(page)).indeling).toEqual({ 'rood|7': sp[1].id, 'geel|#1': sp[0].id });
    // Naar een lege plek: de speler verhuist
    await tik(page, 'rood|2'); await kies(page, sp[0].id);
    expect((await plek(page)).indeling).toEqual({ 'rood|7': sp[1].id, 'rood|2': sp[0].id });
    // Leeg laten
    await tik(page, 'rood|2'); await page.locator('#sheet [data-act="tpWieZet"][data-sp=""]').click();
    expect((await plek(page)).indeling).toEqual({ 'rood|7': sp[1].id });
    await page.evaluate(() => { CC.closeSheet(); CC.ui.wieKleur = null; });
    // Op het veld: tekening zonder namen, de lijst per kleur alleen om te lezen
    await page.evaluate(() => { CC.ui.seg.trSeg = 'week'; CC.render(); });
    await page.locator('.tr-weekkaart .tr-wrij', { hasText: 'Partij acht tegen acht' }).click();
    await expect(sh.locator('.tr-wierijen')).toContainText(sp[1].naam);
    await expect.poll(() => kijkTekst(page)).not.toContain(sp[1].naam);
    await expect(sh.locator('.tr-wierijen button')).toHaveCount(0);
    await kleur(page, 'geel');
    await expect(sh.locator('.tr-wierijen .tr-rij')).toHaveCount(2);
    await expect(sh.locator('.tr-wierijen')).not.toContainText(sp[1].naam);
    // Opstelling aanpassen opent het venster van de plek
    await sh.locator('.tr-namenknop [data-act="tpOnderdeel"]').click();
    await expect(sh.locator('.tr-wie > summary')).toHaveText('Opstelling · 1 van 5 ingedeeld');
    await page.evaluate(() => CC.closeSheet());
    // De tekening van de vorm zelf is niet veranderd
    expect(await page.evaluate(() => JSON.stringify(CC.S().vormen.find((v) => v.id === 'v-3').tekening))).not.toContain(sp[1].naam);
    // Print: tekening zonder namen, lijst met alleen de ingevulde namen
    const html = await page.evaluate(() => { let uit = ''; const o = CC.printDoc; CC.printDoc = (t, h) => { uit = h; }; const b = document.createElement('button'); b.dataset.act = 'tpPrint'; b.dataset.id = 't-vr'; document.body.append(b); b.click(); b.remove(); CC.printDoc = o; return uit; });
    expect(html).not.toContain(`>${sp[1].naam}</text>`);
    expect(html).toContain(`<b>Rood:</b> <span class="tr-wiep">7 ${sp[1].naam}</span></p>`);
    expect(html).not.toContain('…</span>');
    await controleer(page, fouten);
  });
}
