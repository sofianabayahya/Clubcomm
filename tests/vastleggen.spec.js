// ClubComm — Besluit 147: bij een gegeven training ligt per plek vast welk gereedschap de vorm toen had (o.vast).
// Verzonnen gegevens (DCG-profiel uit de repository, nep-database). Nooit tegen de productiedatabase.
const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');
const { volgFouten, controleer, nepDatabase, inloggen, nepDb } = require('./hulp');

const PROFIEL = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'supabase', 'profielen', 'dcg.json'), 'utf8'));
const kopie = (x) => JSON.parse(JSON.stringify(x));

// Gisteren een training (nog niet gegeven), een oude gegeven training zonder vastlegging (zoals de drie van DCG) en morgen een geplande.
const start = async (page, { metProfiel = true, breed = false } = {}) => {
  await page.setViewportSize(breed ? { width: 1366, height: 900 } : { width: 390, height: 844 });
  await nepDatabase(page);
  await page.evaluate(({ data, metProfiel }) => { const db = JSON.parse(sessionStorage.getItem('fake-sb-db'));
    if (metProfiel) db.rows['dcg|profiel|dcg'] = { club_id: 'dcg', soort: 'profiel', id: 'dcg', scope: 'hjo', data };
    db.rows['dcg|club|club'].data.modules = { ...(db.rows['dcg|club|club'].data.modules || {}), training: true };
    sessionStorage.setItem('fake-sb-db', JSON.stringify(db)); }, { data: PROFIEL, metProfiel });
  await inloggen(page, 'admin@test.nl');
  return page.evaluate(() => { const S = CC.S(); const D = CC.date; CC.wisselRol(CC.me().rollen.findIndex((r) => r.rol === 'trainer'));
    const v = D.vandaag(); const d = { gister: D.addDays(v, -1), eerder: D.addDays(v, -1), morgen: D.addDays(v, 1) }; // zelfde week: Week toont de week van de training
    const t = (id, datum) => ({ id, teamId: 'O12-1', soort: 'training', datum, tijd: '17:15', eind: '18:30' });
    S.acts.push(t('t-x', d.gister), { ...t('t-oud', d.eerder), tijd: '09:00', eind: '10:00' }, t('t-plan', d.morgen));
    const ik = CC.me().id;
    S.vormen = [
      { id: 'v-a2', naam: 'Eerste contact van de druk af', eigenaar: ik, koppelingen: { dcg: { primair: 'll-aannemen', ook: [] } }, leerdoelen: ['ll-aannemen'], vaardigheden: ['vh-eerste-contact-van-druk-af'] },
      { id: 'v-b2', naam: 'Slootspel', eigenaar: ik, koppelingen: { dcg: { primair: 'll-passen', ook: ['ll-vrijkomen'] } }, leerdoelen: ['ll-passen', 'll-vrijkomen'], vaardigheden: ['vh-vooruit-inspelen'] },
      { id: 'v-c', naam: 'Dreigen tegenover elkaar', eigenaar: ik, koppelingen: { dcg: { primair: 'll-1v1-aanvallend', ook: [] } }, leerdoelen: ['ll-1v1-aanvallend'], vaardigheden: [] }];
    S.trainingsplannen = [
      { id: 'tp-x', actId: 't-x', teamId: 'O12-1', datum: d.gister, eigenaar: ik, thema: 'Test', leerdoelen: [], gegeven: false,
        onderdelen: [{ id: 'o1', blok: 'A1', vormId: 'v-a2', min: 10 }, { id: 'o2', blok: 'B1', vormId: 'v-b2', min: 10 }, { id: 'o3', blok: 'P', min: 20 }] },
      { id: 'tp-oud', actId: 't-oud', teamId: 'O12-1', datum: d.eerder, eigenaar: ik, thema: 'Oud', leerdoelen: [], gegeven: true,
        onderdelen: [{ id: 'q1', vormId: 'v-a2', min: 8, minUit: 8 }] },
      { id: 'tp-plan', actId: 't-plan', teamId: 'O12-1', datum: d.morgen, eigenaar: ik, thema: 'Gepland', leerdoelen: [], gegeven: false,
        onderdelen: [{ id: 'r1', blok: 'A1', vormId: 'v-a2', min: 12 }] }];
    CC.save(); CC.render(); return d; });
};
const pl = (page, id) => page.evaluate((x) => JSON.parse(JSON.stringify(CC.S().trainingsplannen.find((p) => p.id === x) || null)), id);
const minuten = (page, id) => page.evaluate((x) => { const S = CC.S(); const p = S.trainingsplannen.find((q) => q.id === x); const m = CC.trMinuten(S, p); return { gs: m.gs, ongeldig: m.ongeldig, gsTotaal: m.gsTotaal }; }, id);
const blok = (page, id, b) => page.evaluate(({ x, b }) => { const S = CC.S(); return CC.tr.blokDoel(S, S.trainingsplannen.find((q) => q.id === x), b); }, { x: id, b });
// Een knop met data-act aanklikken via de echte handler (zoals de app hem tekent)
const doe = (page, data) => page.evaluate((d) => { const b = document.createElement('button'); Object.entries(d).forEach(([k, v]) => { b.dataset[k] = v; }); b.hidden = true; document.body.append(b); b.click(); b.remove(); }, data);
const naarWeek = async (page, act) => { await page.locator('nav.nav button[data-tab="aanwezigheid"]').click(); await doe(page, { act: 'trNaarWeek', id: act }); };
const gegeven = async (page) => { await page.locator('form[data-autosave="tpTerug"] label.schakel').click(); };
// Koppeling van v-a2 in de Vormenbank wijzigen: Aannemen eraf, Vrijkomen als hoofdgereedschap
const koppelingWijzigen = async (page) => {
  await page.evaluate(() => CC.open('vorm', { id: 'v-a2' }));
  await page.locator('[data-act="vormKies"][data-veld="ld"][data-w="ll-aannemen"]').click();
  await page.locator('[data-act="vormKies"][data-veld="ld"][data-w="ll-vrijkomen"]').click();
  expect(await page.evaluate(() => CC.S().vormen.find((v) => v.id === 'v-a2').koppelingen.dcg.primair)).toBe('ll-vrijkomen');
};

test('vastleggen: gereedschap ligt vast bij gegeven, koppeling later wijzigen verandert de minuten niet (390 px)', { tag: ['@training', '@profiel'] }, async ({ page }) => {
  const fouten = volgFouten(page);
  await start(page);
  await naarWeek(page, 't-x');
  await gegeven(page);
  let p = await pl(page, 'tp-x');
  expect(p.gegeven).toBe(true); expect(p.vastOp).toBe(await page.evaluate(() => CC.date.vandaag()));
  expect(p.onderdelen[0].vast).toMatchObject({ v: 1, vormId: 'v-a2', pid: 'dcg', pv: '3', gs: 'll-aannemen', ook: [], bron: 'gegeven', vh: [{ id: 'vh-eerste-contact-van-druk-af', ll: 'll-aannemen' }] });
  expect(p.onderdelen[1].vast).toMatchObject({ vormId: 'v-b2', gs: 'll-passen', ook: ['ll-vrijkomen'], vh: [{ id: 'vh-vooruit-inspelen', ll: 'll-passen' }] });
  expect(p.onderdelen[2].vast).toBeUndefined(); // lege plek
  const vast0 = kopie(p.onderdelen.map((o) => o.vast || null));
  // Opgeslagen in de (nep)database
  await expect.poll(async () => { const r = Object.values((await nepDb(page)).rows).find((x) => x.soort === 'trainingsplannen' && x.data.id === 'tp-x'); return r && r.data.onderdelen[0].vast ? r.data.onderdelen[0].vast.gs : ''; }).toBe('ll-aannemen');
  expect(await minuten(page, 'tp-x')).toEqual({ gs: { 'll-aannemen': 10, 'll-passen': 10 }, ongeldig: 0, gsTotaal: 20 });

  // Koppeling wijzigen in de Vormenbank: melding (informatie), op 390 px zonder horizontaal scrollen
  await koppelingWijzigen(page);
  await expect(page.locator('.tr-vastm')).toHaveText('Staat in 1 gegeven training. Die houdt het gereedschap van toen; een wijziging geldt voor nieuwe en geplande trainingen. 1 gegeven training van vóór deze regel volgt de vorm nog wel.');
  await expect(page.locator('.tr-vastm')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  expect(await page.evaluate(() => parseFloat(getComputedStyle(document.querySelector('.tr-vastm')).fontSize))).toBeGreaterThanOrEqual(16);
  await page.evaluate(() => document.querySelector('.tr-vastm').scrollIntoView({ block: 'center' }));
  await page.screenshot({ path: test.info().outputPath('vormenbank-melding-390.png') });
  await controleer(page, fouten, 'vormenbank');

  // Gegeven training: zelfde minuten en zelfde blokgereedschap. Geplande training en de oude training zonder vastlegging volgen de vorm.
  expect(await minuten(page, 'tp-x')).toEqual({ gs: { 'll-aannemen': 10, 'll-passen': 10 }, ongeldig: 0, gsTotaal: 20 });
  expect(await blok(page, 'tp-x', 'A')).toBe('ll-aannemen');
  expect(await blok(page, 'tp-plan', 'A')).toBe('ll-vrijkomen');
  expect(await minuten(page, 'tp-oud')).toEqual({ gs: { 'll-vrijkomen': 8 }, ongeldig: 0, gsTotaal: 8 });
  // Maandtelling (Lijn): tp-x bij Aannemen, tp-oud bij Vrijkomen (als ze in dezelfde maand vallen)
  const maand = await page.evaluate(() => { const S = CC.S(); const D = CC.date; const m = (id) => String(CC.tr.actVan(S, S.trainingsplannen.find((p) => p.id === id)).datum).slice(0, 7);
    const r = {}; [...new Set([m('tp-x'), m('tp-oud')])].forEach((k) => { const x = CC.minutenPerLeerdoel(S, k); Object.entries(x.min).forEach(([g, n]) => { r[g] = (r[g] || 0) + n; }); }); return r; });
  expect(maand['ll-aannemen']).toBe(10); expect(maand['ll-passen']).toBe(10); expect(maand['ll-vrijkomen']).toBe(8);
  expect((await pl(page, 'tp-x')).onderdelen.map((o) => o.vast || null)).toEqual(vast0); // niets herschreven

  // Week en Lijn tonen het gereedschap van toen
  await naarWeek(page, 't-x');
  await expect(page.locator('.tr-minuten')).toContainText('Aannemen en meenemen 10');
  await expect(page.locator('.tr-minuten')).not.toContainText('Vrijkomen 10');
  await expect(page.locator('.tr-minuten')).not.toContainText('niet toegerekend');
  await controleer(page, fouten, 'week na wijziging');
});

test('vastleggen: terugzetten bewaart, opnieuw aanvinken legt niets nieuws vast; oude training blijft zonder vastlegging', { tag: ['@training', '@profiel'] }, async ({ page }) => {
  const fouten = volgFouten(page);
  await start(page);
  await naarWeek(page, 't-x');
  await gegeven(page);
  const eerst = kopie(await pl(page, 'tp-x'));
  // Uit: momentopname blijft, telt niet mee (alleen gegeven trainingen tellen)
  await gegeven(page);
  let p = await pl(page, 'tp-x');
  expect(p.gegeven).toBe(false); expect(p.vastOp).toBe(eerst.vastOp); expect(p.onderdelen.map((o) => o.vast || null)).toEqual(eerst.onderdelen.map((o) => o.vast || null));
  expect((await minuten(page, 'tp-x')).gsTotaal).toBe(0);
  // Tussendoor de koppeling wijzigen en een vorm toevoegen aan de teruggezette training
  await koppelingWijzigen(page);
  await doe(page, { act: 'tpVormErbij', id: 't-x', v: 'v-c', i: '2' });
  expect((await pl(page, 'tp-x')).onderdelen[2].vast).toBeUndefined(); // niet gegeven: geen vastlegging
  // Weer aan: dezelfde momentopnames, geen nieuwe classificatie (ook niet voor de toegevoegde vorm)
  await naarWeek(page, 't-x');
  await gegeven(page);
  p = await pl(page, 'tp-x');
  expect(p.gegeven).toBe(true); expect(p.vastOp).toBe(eerst.vastOp);
  expect(p.onderdelen[0].vast).toEqual(eerst.onderdelen[0].vast); expect(p.onderdelen[1].vast).toEqual(eerst.onderdelen[1].vast);
  expect(p.onderdelen[2].vast).toBeUndefined();
  expect((await minuten(page, 'tp-x')).gs).toEqual({ 'll-aannemen': 10, 'll-passen': 10, 'll-1v1-aanvallend': 20 }); // A1 van toen; de nieuwe plek volgt de vorm

  // Oude gegeven training (van vóór deze regel): uit en weer aan legt niets vast; de koppeling van nu geldt niet als 'toen'
  await naarWeek(page, 't-oud');
  await gegeven(page); expect((await pl(page, 'tp-oud')).vastOp).toBe('oud');
  await gegeven(page);
  p = await pl(page, 'tp-oud'); expect(p.gegeven).toBe(true); expect(p.vastOp).toBe('oud'); expect(p.onderdelen[0].vast).toBeUndefined();
  await controleer(page, fouten, 'terugzetten');
});

test('vastleggen: corrigeren, vervangen, ongedaan maken, toevoegen, verwijderen, kopiëren en dupliceren bij een gegeven training', { tag: ['@training', '@profiel'] }, async ({ page }) => {
  const fouten = volgFouten(page);
  await start(page);
  await naarWeek(page, 't-x');
  await gegeven(page);
  const v1 = kopie((await pl(page, 'tp-x')).onderdelen[0].vast);
  // Corrigeren: echte minuten aanpassen raakt de momentopname niet
  await page.locator('.tr-uit input').first().fill('14'); await page.locator('.tr-uit input').first().press('Tab');
  let p = await pl(page, 'tp-x'); expect(p.onderdelen[0].minUit).toBe(14); expect(p.onderdelen[0].vast).toEqual(v1);
  expect((await minuten(page, 'tp-x')).gs['ll-aannemen']).toBe(14);
  // Vervangen: andere vorm op A1 = correctie; nieuwe vorm wordt meteen vastgelegd
  await doe(page, { act: 'tpVormErbij', id: 't-x', v: 'v-c', i: '0' });
  p = await pl(page, 'tp-x');
  expect(p.onderdelen[0].vormId).toBe('v-c'); expect(p.onderdelen[0].vast).toMatchObject({ vormId: 'v-c', gs: 'll-1v1-aanvallend', bron: 'correctie' });
  expect((await minuten(page, 'tp-x')).gs).toEqual({ 'll-1v1-aanvallend': 14, 'll-passen': 10 });
  // Ongedaan maken: de oorspronkelijke momentopname komt terug
  await doe(page, { act: 'tpOngedaan' });
  p = await pl(page, 'tp-x'); expect(p.onderdelen[0].vormId).toBe('v-a2'); expect(p.onderdelen[0].vast).toEqual(v1);
  // Toevoegen achteraf op de lege partijplek = correctie
  await doe(page, { act: 'tpVormErbij', id: 't-x', v: 'v-b2', i: '2' });
  p = await pl(page, 'tp-x'); expect(p.onderdelen[2].vast).toMatchObject({ vormId: 'v-b2', gs: 'll-passen', bron: 'correctie' });
  // Dupliceren: dezelfde vorm op een extra regel, met dezelfde momentopname (zelfde vorm, zelfde moment)
  const b1 = kopie(p.onderdelen[1].vast);
  await doe(page, { act: 'tpDupliceer', id: 't-x', i: '1' });
  p = await pl(page, 'tp-x'); expect(p.onderdelen).toHaveLength(4); expect(p.onderdelen[2].vormId).toBe('v-b2'); expect(p.onderdelen[2].vast).toEqual(b1);
  // Verwijderen: de momentopname gaat mee weg (de partijplek staat nu op 3)
  expect(p.onderdelen[3]).toMatchObject({ blok: 'P', vormId: 'v-b2' });
  await doe(page, { act: 'tpOnderdeelWeg', id: 't-x', i: '3' });
  p = await pl(page, 'tp-x'); expect(p.onderdelen).toHaveLength(3); expect(p.onderdelen.some((o) => o.blok === 'P')).toBe(false);
  expect((await minuten(page, 'tp-x')).gs).toEqual({ 'll-aannemen': 14, 'll-passen': 10 + (p.onderdelen[2].minUit != null ? Number(p.onderdelen[2].minUit) : 10) });
  // Kopiëren naar een andere training: geen momentopname en geen vastlegdatum mee
  await page.evaluate(() => { CC.S().trainingsplannen.find((x) => x.id === 'tp-plan').onderdelen = []; CC.save(); });
  await doe(page, { act: 'tpKopieOk', id: 't-plan', van: 'tp-x' });
  const k = await pl(page, 'tp-plan');
  expect(k.onderdelen.length).toBeGreaterThan(0); expect(k.onderdelen.every((o) => o.vast === undefined)).toBe(true); expect(k.vastOp).toBeUndefined();
  await controleer(page, fouten, 'correcties');
});

test('vastleggen: ongeldige momentopname wordt nooit stil vervangen; classificatie van toen blijft', { tag: ['@training', '@profiel'] }, async ({ page }) => {
  const fouten = volgFouten(page);
  await start(page);
  await naarWeek(page, 't-x');
  await gegeven(page);
  // Een oudere app-versie zette een andere vorm op A1 zonder de momentopname aan te passen
  await page.evaluate(() => { const p = CC.S().trainingsplannen.find((x) => x.id === 'tp-x'); p.onderdelen[0].vormId = 'v-c'; p.onderdelen[1].vast = { kapot: true }; CC.save(); CC.render(); });
  const voor = kopie((await pl(page, 'tp-x')).onderdelen.map((o) => o.vast || null));
  expect(await minuten(page, 'tp-x')).toEqual({ gs: {}, ongeldig: 20, gsTotaal: 0 });
  expect(await blok(page, 'tp-x', 'A')).toBeNull(); // niet terugvallen op de koppeling van nu
  await naarWeek(page, 't-x');
  await expect(page.locator('.tr-minuten')).toContainText('20 min niet toegerekend: het vastgelegde gereedschap past niet bij de vorm op die plek. ClubComm vult dit niet zelf in.');
  // Uit en weer aan, en de koppeling wijzigen: de ongeldige momentopnames blijven precies zoals ze waren
  await gegeven(page); await gegeven(page); await koppelingWijzigen(page);
  expect((await pl(page, 'tp-x')).onderdelen.map((o) => o.vast || null)).toEqual(voor);
  expect((await minuten(page, 'tp-x')).ongeldig).toBe(20);
  // Andere indeling van een vaardigheid in een nieuwe profielversie: de momentopname houdt de leerlijn van toen
  await page.evaluate(() => { const S = CC.S(); const p = S.trainingsplannen.find((x) => x.id === 'tp-x'); p.onderdelen[0].vormId = 'v-a2'; delete p.onderdelen[1].vast; CC.save(); });
  await page.evaluate(() => { const S = CC.S(); const pr = S.profielen.dcg; const ll = pr.onderdelen.leerlijnen.items;
    const a = ll.find((l) => l.id === 'll-aannemen'); const vh = a.vaardigheden.find((x) => x.id === 'vh-eerste-contact-van-druk-af');
    a.vaardigheden = a.vaardigheden.filter((x) => x !== vh); ll.find((l) => l.id === 'll-1v1-aanvallend').vaardigheden.push(vh); pr.versie = 4; });
  const o = (await pl(page, 'tp-x')).onderdelen[0];
  expect(o.vast.vh).toEqual([{ id: 'vh-eerste-contact-van-druk-af', ll: 'll-aannemen' }]); expect(o.vast.pv).toBe('3');
  expect(await minuten(page, 'tp-x')).toEqual({ gs: { 'll-aannemen': 10, 'll-passen': 10 }, ongeldig: 0, gsTotaal: 20 }); // A1: leerlijn van toen; plek 2 zonder momentopname volgt de vorm (zoals een oude training)
  await controleer(page, fouten, 'ongeldig');
});

test('vastleggen: club zonder profiel (zoals Swift) schrijft niets vast en werkt zoals voorheen', { tag: ['@training', '@kleineclub'] }, async ({ page }) => {
  const fouten = volgFouten(page);
  await start(page, { metProfiel: false });
  await naarWeek(page, 't-x');
  await gegeven(page);
  const p = await pl(page, 'tp-x');
  expect(p.gegeven).toBe(true); expect(p.vastOp).toBeUndefined(); expect(p.onderdelen.every((o) => o.vast === undefined)).toBe(true);
  await gegeven(page); await gegeven(page); // uit en weer aan: ook dan geen extra velden
  const q = await pl(page, 'tp-x'); expect(q.vastOp).toBeUndefined(); expect(q.onderdelen.every((o) => o.vast === undefined)).toBe(true);
  expect(await minuten(page, 'tp-x')).toEqual({ gs: { 'll-aannemen': 10, 'll-passen': 10 }, ongeldig: 0, gsTotaal: 20 }); // zoals voorheen: via de oude lijst leerdoelen van de vorm
  await controleer(page, fouten, 'zonder profiel');
});

test('vastleggen: bestaande gegeven trainingen (zoals de drie van DCG) blijven ongewijzigd na bekijken', { tag: ['@training', '@profiel'] }, async ({ page }) => {
  const fouten = volgFouten(page);
  await start(page, { breed: true });
  const voor = kopie(await pl(page, 'tp-oud'));
  await expect.poll(async () => { const r = Object.values((await nepDb(page)).rows).find((x) => x.soort === 'trainingsplannen' && x.data.id === 'tp-oud'); return !!r; }).toBe(true);
  const dbVoor = kopie(Object.values((await nepDb(page)).rows).find((x) => x.soort === 'trainingsplannen' && x.data.id === 'tp-oud').data);
  // Bekijken in Week, Lijn en de Vormenbank, minuten invullen bij een ándere training
  await naarWeek(page, 't-oud');
  await expect(page.locator('.tr-minuten')).toContainText('Aannemen en meenemen 8');
  await page.locator('[data-act="seg"][data-val="lijn"]').click();
  await page.evaluate(() => CC.open('vorm', { id: 'v-a2' }));
  await expect(page.locator('.tr-vastm')).toHaveText('1 gegeven training van vóór deze regel volgt de vorm nog wel.');
  expect(await pl(page, 'tp-oud')).toEqual(voor);
  const dbNa = Object.values((await nepDb(page)).rows).find((x) => x.soort === 'trainingsplannen' && x.data.id === 'tp-oud').data;
  expect(dbNa).toEqual(dbVoor);
  expect(dbNa.vastOp).toBeUndefined(); expect(dbNa.onderdelen[0].vast).toBeUndefined();
  await controleer(page, fouten, 'bestaand');
});

// PR #107 (verplaatsen) staat los ter beoordeling. Deze test draait alleen als die functie in de app zit (compatibiliteitscontrole).
test('vastleggen + verplaatsen (PR #107): de momentopname gaat mee met de vorm, ook bij wisselen en ongedaan maken', { tag: ['@training', '@profiel'] }, async ({ page }) => {
  const fouten = volgFouten(page);
  await start(page);
  await naarWeek(page, 't-x');
  await gegeven(page);
  test.skip(!(await page.evaluate(async () => (await (await fetch('/app/training.js')).text()).includes("CC.on('tpVerplaats'"))), 'PR #107 zit niet in deze versie');
  const voor = kopie(await pl(page, 'tp-x'));
  await doe(page, { act: 'tpVerplaats', id: 't-x', i: '0', naar: '2' }); // A1 naar de lege partijplek
  let p = await pl(page, 'tp-x');
  expect(p.onderdelen[2].vormId).toBe('v-a2'); expect(p.onderdelen[2].vast).toEqual(voor.onderdelen[0].vast); expect(p.onderdelen[0].vast).toBeUndefined();
  await doe(page, { act: 'tpVerplaats', id: 't-x', i: '2', naar: '1' }); // wisselen met B1
  p = await pl(page, 'tp-x');
  expect(p.onderdelen[1].vast).toEqual(voor.onderdelen[0].vast); expect(p.onderdelen[2].vast).toEqual(voor.onderdelen[1].vast);
  expect(await minuten(page, 'tp-x')).toEqual({ gs: { 'll-aannemen': 10, 'll-passen': 10 }, ongeldig: 0, gsTotaal: 20 });
  await doe(page, { act: 'tpVerplaatsTerug' });
  p = await pl(page, 'tp-x'); expect(p.onderdelen[2].vast).toEqual(voor.onderdelen[0].vast);
  await controleer(page, fouten, 'verplaatsen');
});
