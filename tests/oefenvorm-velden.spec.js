// ClubComm — Besluit 164: oefenvorm invoeren met een compacte basis (organisatie, spelverloop, spelregels, coachpunten apart),
// kenmerken en eigen notities ingeklapt, schakelvorm als kenmerk (ook wisselende rollen of richtingen), speelrichting "meer".
// Bestaande tekst wordt nooit vanzelf gesplitst. Verzonnen gegevens, nep-database. Nooit tegen de productiedatabase.
const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');
const { volgFouten, controleer, nepDatabase, inloggen } = require('./hulp');

const PROFIEL = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'supabase', 'profielen', 'dcg.json'), 'utf8'));
const OUD = { id: 'v-oud', naam: 'Rondo 4 tegen 2', eigenaar: null, koppelingen: { dcg: { primair: 'll-vrijkomen', ook: [] } }, leerdoelen: ['ll-vrijkomen'], vaardigheden: [],
  organisatie: 'Vak 12 × 12 m\nVier aanvallers aan de buitenkant\nNa 5 passes een punt\nBij balverlies wisselen de twee die fout maakten\nMaximaal twee keer raken', coach: 'Kijk voor je de bal krijgt' };

const start = async (page, { breedte = 390, profiel = true } = {}) => {
  await page.setViewportSize({ width: breedte, height: 844 });
  await nepDatabase(page);
  await page.evaluate(({ d, profiel }) => { const db = JSON.parse(sessionStorage.getItem('fake-sb-db'));
    if (profiel) db.rows['dcg|profiel|dcg'] = { club_id: 'dcg', soort: 'profiel', id: 'dcg', scope: 'hjo', data: d };
    db.rows['dcg|club|club'].data.modules = { ...(db.rows['dcg|club|club'].data.modules || {}), training: true };
    sessionStorage.setItem('fake-sb-db', JSON.stringify(db)); }, { d: PROFIEL, profiel });
  await inloggen(page, 'admin@test.nl');
  await page.evaluate((oud) => { const S = CC.S(); CC.wisselRol(CC.me().rollen.findIndex((r) => r.rol === 'trainer'));
    S.vormen = [{ ...oud, eigenaar: CC.me().id }, { id: 'v-nieuw', naam: 'Vorm', eigenaar: CC.me().id, koppelingen: {}, leerdoelen: [], vaardigheden: [] }];
    CC.save(); CC.render(); }, OUD);
};
const bewerk = async (page, id) => { await page.evaluate((x) => CC.open('vorm', { id: x }), id); await expect(page.locator('form[data-autosave="vorm"]')).toBeVisible(); };
// Kaart openen via de bestaande knop-actie (zoals een tik op een vorm in de Vormenbank)
const kijk = async (page, id) => { await page.evaluate((x) => { const b = document.createElement('button'); b.dataset.act = 'vormOpen'; b.dataset.id = x; document.body.appendChild(b); b.click(); b.remove(); }, id);
  await expect(page.locator('#sheet .sectie-kop').first()).toBeVisible(); };
// Print: de HTML die naar CC.printDoc gaat
const printHtml = (page, id) => page.evaluate((x) => { let uit = ''; const oud = CC.printDoc; CC.printDoc = (t, h) => { uit = h; }; const b = document.createElement('button'); b.dataset.act = 'vormPrint'; b.dataset.id = x; document.body.appendChild(b); b.click(); b.remove(); CC.printDoc = oud; return uit; }, id);
// Zoeken in de Vormenbank: namen van de vormen die overblijven
const zoek = (page, q) => page.evaluate((t) => { CC.ui.vf = { q: t }; const d = document.createElement('div'); d.innerHTML = CC.vormenLijst(CC.S()); return [...d.querySelectorAll('.tr-kaart')].map((k) => (k.querySelector('b, strong, .tr-naam') || k).textContent.trim()); }, q);
const vormData = (page, id) => page.evaluate((x) => JSON.parse(JSON.stringify(CC.S().vormen.find((v) => v.id === x))), id);

for (const breedte of [390, 1366]) {
  test(`nieuwe vorm: verloop en regels apart, kaart en print met eigen koppen (${breedte} px)`, { tag: ['@training'] }, async ({ page }) => {
    const fouten = volgFouten(page);
    await start(page, { breedte });
    await bewerk(page, 'v-nieuw');
    const f = page.locator('form[data-autosave="vorm"]');
    // Volgorde van de basis: organisatie, spelverloop, spelregels, coachpunten; kenmerken en eigen notities daarna
    const namen = await f.locator('input[name], textarea[name]').evaluateAll((l) => l.map((x) => x.name));
    for (const [a, b] of [['naam', 'afmeting'], ['afmeting', 'doel'], ['doel', 'organisatie'], ['organisatie', 'verloop'], ['verloop', 'regels'], ['regels', 'coach'], ['coach', 'anders'], ['anders', 'tags']]) expect(namen.indexOf(a)).toBeLessThan(namen.indexOf(b));
    // Club met leerdoelen, nog geen hoofdleerdoel: kenmerken staan open; eigen notities dicht
    await expect(f.locator('details.tr-kenmerk')).toHaveAttribute('open', '');
    await expect(f.locator('details.tr-notities')).not.toHaveAttribute('open', '');
    await f.locator('[name="naam"]').fill('Schakelen 3 tegen 3');
    await f.locator('[name="organisatie"]').fill('Veld 30 × 20 m\nTwee doeltjes');
    await f.locator('[name="verloop"]').fill('Trainer speelt in\nNa een doelpunt begint de volgende groep');
    await f.locator('[name="regels"]').fill('Doelpunt = 1 punt');
    await f.locator('[name="coach"]').fill('Direct omschakelen');
    // Kenmerken: schakelen met wisselende rollen, speelrichting meer
    await f.locator('[data-act="vormKies"][data-veld="omschakeling"][data-w="rollen"]').click();
    await f.locator('[data-act="vormKies"][data-veld="richting"][data-w="3"]').click();
    await expect.poll(async () => { const v = await vormData(page, 'v-nieuw'); return [v.verloop, v.regels, v.omschakeling, v.richting].join('|'); })
      .toBe('Trainer speelt in\nNa een doelpunt begint de volgende groep|Doelpunt = 1 punt|rollen|3');
    await expect(page.locator('details.tr-kenmerk > summary')).toContainText('schakelvorm');
    await expect(page.locator('details.tr-kenmerk > summary')).toContainText('meer richtingen');
    // Kaart (bekijken): eigen koppen in deze volgorde, soortregel noemt schakelvorm
    await kijk(page, 'v-nieuw');
    const sheet = page.locator('#sheet');
    await expect(sheet.locator('.tr-soort')).toContainText('schakelvorm');
    const k = (await sheet.locator('.sectie-kop h3').allTextContents()).map((x) => x.trim());
    expect(k).not.toContain('Organisatie en spelregels');
    expect(k.indexOf('Organisatie')).toBeGreaterThan(-1);
    expect(k.indexOf('Organisatie')).toBeLessThan(k.indexOf('Spelverloop')); expect(k.indexOf('Spelverloop')).toBeLessThan(k.indexOf('Spelregels')); expect(k.indexOf('Spelregels')).toBeLessThan(k.indexOf('Coachpunten'));
    // Print: dezelfde koppen en schakelvorm in de soortregel
    const pr = await printHtml(page, 'v-nieuw');
    expect(pr).toContain('<b>Organisatie</b>'); expect(pr).toContain('<b>Spelverloop</b>'); expect(pr).toContain('<b>Spelregels</b>'); expect(pr).toContain('schakelvorm');
    // Zoeken op "schakelvorm" en op tekst uit spelverloop
    expect(await zoek(page, 'schakelvorm')).toEqual(['Schakelen 3 tegen 3']);
    expect(await zoek(page, 'volgende groep')).toEqual(['Schakelen 3 tegen 3']);
    await controleer(page, fouten);
  });
}

test('bestaande vorm: tekst blijft staan, oude kop, hint bij meer dan 3 regels, openen verandert niets', { tag: ['@training'] }, async ({ page }) => {
  const fouten = volgFouten(page);
  await start(page);
  const voor = await vormData(page, 'v-oud');
  await bewerk(page, 'v-oud');
  const f = page.locator('form[data-autosave="vorm"]');
  await expect(f.locator('.tr-splits')).toContainText('ClubComm verplaatst niets vanzelf');
  await expect(f.locator('[name="verloop"]')).toHaveValue('');
  await expect(f.locator('[name="organisatie"]')).toHaveValue(OUD.organisatie);
  // Hoofdleerdoel bekend: kenmerken ingeklapt, met samenvatting
  await expect(f.locator('details.tr-kenmerk')).not.toHaveAttribute('open', '');
  await expect(f.locator('details.tr-kenmerk > summary')).toContainText('★');
  expect(await vormData(page, 'v-oud')).toEqual(voor);
  // Kaart en print houden de oude kop zolang verloop en regels leeg zijn
  await kijk(page, 'v-oud');
  await expect(page.locator('#sheet .sectie-kop h3', { hasText: 'Organisatie en spelregels' })).toHaveCount(1);
  expect(await printHtml(page, 'v-oud')).toContain('<b>Organisatie en spelregels</b>');
  // Na invullen van spelregels verdwijnt de hint en heet het blok Organisatie
  await bewerk(page, 'v-oud');
  await page.locator('form[data-autosave="vorm"] [name="regels"]').fill('Na 5 passes een punt');
  await page.locator('form[data-autosave="vorm"] [name="regels"]').blur();
  await expect.poll(async () => (await vormData(page, 'v-oud')).regels).toBe('Na 5 passes een punt');
  await bewerk(page, 'v-oud');
  await expect(page.locator('form[data-autosave="vorm"] .tr-splits')).toHaveCount(0);
  expect((await vormData(page, 'v-oud')).organisatie).toBe(OUD.organisatie);
  await controleer(page, fouten);
});

test('club zonder opleidingsprofiel: kenmerken ingeklapt, zoeken vindt schakelvorm en spelregels', { tag: ['@training'] }, async ({ page }) => {
  const fouten = volgFouten(page);
  await start(page, { profiel: false });
  await page.evaluate(() => { const v = CC.S().vormen.find((x) => x.id === 'v-nieuw'); Object.assign(v, { naam: 'Wisselspel', omschakeling: 'av', regels: 'Kopbal telt dubbel' }); CC.save(); });
  await bewerk(page, 'v-nieuw');
  await expect(page.locator('details.tr-kenmerk')).not.toHaveAttribute('open', '');
  await expect(page.locator('details.tr-kenmerk > summary')).toContainText('schakelvorm');
  expect(await zoek(page, 'schakelvorm')).toEqual(['Wisselspel']);
  expect(await zoek(page, 'kopbal')).toEqual(['Wisselspel']);
  await controleer(page, fouten);
});
