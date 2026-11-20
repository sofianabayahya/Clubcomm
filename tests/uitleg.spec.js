// ClubComm — Besluit NNN (I3): ⓘ opent de uitleg uit het opleidingsprofiel (voetbalprobleem, gereedschap, leerniveaus).
const { test, expect } = require('@playwright/test');
const fs = require('fs');
const { volgFouten, controleer } = require('./hulp');
const PROFIEL = JSON.parse(fs.readFileSync('supabase/profielen/dcg.json', 'utf8'));

// Demo (verzonnen namen) met het DCG-profiel als voorbeeldprofiel; wijzig(profiel) past het profiel aan of haalt het weg
const opzet = async (page, wijzig) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/?demo'); await page.evaluate(() => localStorage.clear()); await page.goto('/?demo');
  await page.locator('[data-act="demoLogin"][data-pid]').nth(1).click(); await page.locator('[data-act="magischeLink"]').click();
  await expect(page.locator('nav.nav')).toBeVisible();
  await page.evaluate(({ PROFIEL, wijzig }) => { const S = CC.S(); const ik = CC.me().id; S.club.modules.training = true;
    const pf = JSON.parse(JSON.stringify(PROFIEL)); if (wijzig === 'zonderPassen') pf.onderdelen.leerlijnen.items.find((x) => x.id === 'll-passen').omschrijving = '';
    S.profielen = wijzig === 'geen' ? {} : { [S.club.id]: { ...pf, naam: 'Opleidingsprofiel (test)' } };
    CC.wisselRol(CC.me().rollen.findIndex((r) => r.rol === 'trainer'));
    S.vormen = [{ id: 'v1', eigenaar: ik, naam: 'Rondo 3 tegen 1', type: 'rondo', spelersMin: 4, spelersMax: 8, duur: 10, aantal: { aanval: 3, verdediging: 1 }, koppelingen: {}, varianten: [], aantallen: [] }];
    const tid = CC.teamId(); const a = S.acts.filter((x) => x.teamId === tid && x.soort === 'training' && x.datum >= CC.date.vandaag()).sort((x, y) => x.datum.localeCompare(y.datum))[0];
    S.trainingsplannen = [{ id: 'tp1', actId: a.id, teamId: tid, datum: a.datum, eigenaar: ik, thema: 'Bal behouden onder druk', leerdoelen: [], blokDoel: { A: 'll-aannemen', B: 'll-passen' },
      methodiek: { probleem: 'vp-1', niveaus: ['ln-herkennen', 'ln-kiezen'], gedrag: 'Kijkt vóór de aanname over de schouder' },
      onderdelen: [{ id: 'o1', blok: 'A1', vormId: 'v1', min: 10, niveau: 'ln-herkennen' }] }];
    (CC.ui.seg = CC.ui.seg || {}).aanwAct = a.id; CC.save(); CC.render(); }, { PROFIEL, wijzig });
  await page.locator('nav.nav button[data-tab="aanwezigheid"]').click(); await page.evaluate(() => { CC.ui.seg.trSeg = 'plannen'; CC.render(); });
  const waarom = page.locator('details:has(> summary:text-matches("^Waarom deze training"))').first();
  if (await waarom.count()) await waarom.locator('> summary').click();
  return waarom;
};
const tekst = (sleutel, id) => PROFIEL.onderdelen[sleutel].items.find((x) => x.id === id);

test('ⓘ bij voetbalprobleem, gereedschap en leerniveaus opent de tekst uit het profiel', { tag: ['@training', '@schermen'] }, async ({ page }) => {
  const fouten = volgFouten(page);
  const waarom = await opzet(page);
  await expect(waarom.locator('.tr-uitleg')).toHaveCount(4); // Wat, A, B, Niveau
  const vp = tekst('voetbalproblemen', 'vp-1');
  await waarom.locator('.tr-uitleg[data-s="pr"]').click();
  await expect(page.locator('#sheet h2')).toHaveText(vp.naam);
  await expect(page.locator('#sheet')).toContainText(vp.centraleVraag);
  await expect(page.locator('#sheet')).toContainText(vp.waarnemen[0]);
  await expect(page.locator('#sheet details.uitklap')).not.toHaveAttribute('open', '');
  await page.evaluate(() => CC.closeSheet());
  const ll = tekst('leerlijnen', 'll-passen');
  await waarom.locator('.tr-uitleg[data-s="gs"][data-id="ll-passen"]').click();
  await expect(page.locator('#sheet h2')).toHaveText(ll.naam);
  await expect(page.locator('#sheet')).toContainText(ll.spelersvraag);
  await page.evaluate(() => CC.closeSheet());
  await waarom.locator('.tr-uitleg[data-s="niveaus"]').click();
  for (const n of PROFIEL.onderdelen.leerniveaus.items) await expect(page.locator('#sheet')).toContainText(n.naam);
  await page.evaluate(() => CC.closeSheet());
  // Tikvlak 44 × 44 en geen horizontaal scrollen
  const box = await waarom.locator('.tr-uitleg').first().boundingBox();
  expect([Math.round(box.width), Math.round(box.height)]).toEqual([44, 44]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  await controleer(page, fouten, 'uitleg trainingskaart');
});

test('In het venster van een plek klapt de uitleg ter plekke open; ingevulde minuten blijven staan', { tag: ['@training'] }, async ({ page }) => {
  const fouten = volgFouten(page);
  await opzet(page);
  await page.locator('.tr-rij', { hasText: 'Rondo' }).first().click();
  await expect(page.locator('#sheet h2')).toHaveText('Rondo 3 tegen 1');
  await page.fill('#on-m', '12');
  const knop = page.locator('#sheet legend .tr-uitleg'); const blok = page.locator('#sheet .tr-uitleg-hier');
  await expect(blok).toBeHidden(); await knop.click();
  await expect(blok).toBeVisible(); await expect(knop).toHaveAttribute('aria-expanded', 'true');
  await expect(blok).toContainText(tekst('leerniveaus', 'ln-kiezen').omschrijving.slice(0, 40));
  await expect(page.locator('#sheet h2')).toHaveText('Rondo 3 tegen 1');
  await expect(page.locator('#on-m')).toHaveValue('12');
  await page.waitForTimeout(1600); await knop.click(); await expect(blok).toBeHidden();
  await controleer(page, fouten, 'uitleg plek');
});

test('Geen ⓘ zonder tekst in het profiel, en niets nieuws zonder profiel', { tag: ['@training'] }, async ({ page }) => {
  const fouten = volgFouten(page);
  let waarom = await opzet(page, 'zonderPassen');
  await expect(waarom.locator('.tr-uitleg')).toHaveCount(3);
  await expect(waarom.locator('.tr-uitleg[data-id="ll-passen"]')).toHaveCount(0);
  waarom = await opzet(page, 'geen');
  await expect(page.locator('.tr-uitleg')).toHaveCount(0);
  await controleer(page, fouten, 'uitleg zonder profiel');
});
