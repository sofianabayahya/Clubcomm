// Besluit 150 (onder Besluit 149, vrijwilligersprincipe): eerste keuzes bij een lege training en in de oefenvormkiezer.
// Demo en nep-database met verzonnen gegevens; nooit tegen de productiedatabase.
const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');
const { volgFouten, controleer, nepDatabase, inloggen } = require('./hulp');

const PROFIEL = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'supabase', 'profielen', 'dcg.json'), 'utf8'));

// Demo als trainer Mark (O10-1), met de trainingsmodule aan. eerder = een eerdere eigen training met inhoud; vormen = een gevulde Vormenbank.
const demo = async (page, { breed = false, eerder = false, vormen = false } = {}) => {
  await page.setViewportSize(breed ? { width: 1366, height: 900 } : { width: 390, height: 844 });
  await page.goto('/?demo'); await page.evaluate(() => localStorage.clear()); await page.goto('/?demo');
  await page.locator('[data-act="demoLogin"][data-pid]').nth(1).click();
  await page.locator('[data-act="magischeLink"]').click();
  await expect(page.locator('nav.nav')).toBeVisible();
  await page.evaluate(({ eerder, vormen }) => { const S = CC.S(); const ik = CC.me().id; S.club.modules.training = true;
    CC.wisselRol(CC.me().rollen.findIndex((r) => r.rol === 'trainer'));
    S.vormen = vormen ? [{ id: 'va', eigenaar: ik, naam: 'Rondo 4 tegen 1', duur: 8, aantallen: [], varianten: [] }, { id: 'vb', eigenaar: ik, naam: 'Partij 5 tegen 5', duur: 15, aantallen: [], varianten: [] }] : [];
    S.trainingsplannen = eerder ? [{ id: 'tp-eerder', actId: 'tp-eerder', los: true, datum: CC.date.addDays(CC.date.vandaag(), -5), eigenaar: ik, thema: 'Vrijlopen', leerdoelen: [],
      onderdelen: [{ id: 'o1', vormId: 'va', min: 8 }, { id: 'o2', spacing: true, naam: 'Hooghouden', min: 2 }, { id: 'o3', vormId: 'vb', min: 15 }] }] : [];
    CC.save(); CC.render(); }, { eerder, vormen });
  await page.locator('nav.nav button[data-tab="aanwezigheid"]').click();
  if (!breed) await page.locator('[data-act="seg"][data-val="plannen"]').click();
};
const plan = (page) => page.evaluate(() => JSON.parse(JSON.stringify(CC.S().trainingsplannen.find((p) => p.eigenaar === CC.me().id && p.id !== 'tp-eerder') || null)));

test('eerste keuzes: beginner zonder eerdere training en zonder vormen (390 px)', { tag: ['@training', '@schermen'] }, async ({ page }) => {
  const fouten = volgFouten(page);
  await demo(page);
  await page.locator('[data-act="tpNieuw"]').first().click(); // tik 1
  const mid = page.locator('.tr-pmid');
  await expect(mid.locator('.tr-start')).toContainText('Hoe wil je beginnen?');
  await expect(mid.locator('.tr-startkaart')).toHaveCount(1); // alleen Zelf samenstellen: geen eerdere training
  await expect(mid.locator('.tr-startkaart')).toContainText('Zelf samenstellen');
  await expect(mid.locator('.tr-start')).toContainText('Spacing = een kort ander oefeningetje');
  // Geen niet-relevante of uitgeschakelde knoppen bij een lege training
  await expect(mid.locator('[data-act="tpPrint"], [data-act="tpKopieNaar"], [data-act="tpMeer"], button[disabled]')).toHaveCount(0);
  await expect(mid.locator('button', { hasText: /^\s*Vorm\s*$/ })).toHaveCount(0); // overal 'oefenvorm'
  await expect(page.locator('#planBank')).toHaveCount(0); // lege Vormenbank: geen bankstrook met 'Geen oefenvorm gevonden' en geen tweede ingang
  // Oefenvormkiezer met lege bank: één kaart met uitleg, geen lege groepen
  await mid.locator('.tr-startkaart [data-act="tpVormKiezen"]').click(); // tik 2
  await expect(page.locator('#sheet .kv-groep')).toHaveCount(0);
  await expect(page.locator('#sheet .kv-nieuw')).toContainText('Je Vormenbank is nog leeg');
  await expect(page.locator('#sheet .kv-nieuw')).toContainText('Wat gebeurt er?');
  await expect(page.locator('#sheet .kv-nieuw')).not.toContainText('Alles wordt vanzelf bewaard');
  await controleer(page, fouten, 'lege kiezer');
  await page.locator('#sheet .kv-nieuw [data-act="vormNieuw"]').click(); // tik 3: het scherm voor de eerste oefenvorm
  await expect(page.locator('form[data-autosave="vormBewerk"], [name="naam"]').first()).toBeVisible();
  expect(fouten).toEqual([]);
});

for (const breed of [false, true]) {
  test(`eerste keuzes: ervaren trainer met eerdere training en vormen (${breed ? '1366' : '390'} px); gevulde training ongewijzigd`, { tag: ['@training', '@schermen'] }, async ({ page }) => {
    const fouten = volgFouten(page);
    await demo(page, { breed, eerder: true, vormen: true });
    await page.locator('[data-act="tpNieuw"]').first().click();
    const mid = page.locator('.tr-pmid');
    await expect(mid.locator('.tr-startkaart')).toHaveCount(2);
    await expect(mid.locator('.tr-startkaart').first()).toContainText('Laatst: Vrijlopen (2 oefenvormen)');
    // Kiezer met vormen: dezelfde groepen als voorheen (Besluit 139), plus de zin en de kaart onderaan
    await mid.locator('.tr-startkaart [data-act="tpVormKiezen"]').click();
    await expect(page.locator('#sheet .kv-aanbevolen')).toHaveText('Aanbevolen voor deze plek · geen verplichting');
    await expect(page.locator('#sheet .kv-groep').first()).toContainText('Past het best');
    await expect(page.locator('#sheet .kv-nieuw')).toContainText('Staat er niets bij dat past?');
    await page.evaluate(() => CC.closeSheet());
    // Eerdere training gebruiken (≤ 3 tikken): kaart → kiezen
    await mid.locator('.tr-startkaart [data-act="tpKopie"]').click();
    await page.locator('#sheet [data-act="tpKopieOk"]').first().click();
    const p = await plan(page);
    expect(p.onderdelen.map((o) => o.vormId || (o.spacing ? 'spacing' : ''))).toEqual(['va', 'spacing', 'vb']);
    // Gevulde training: het blok is weg, de bestaande knoppen staan er weer (ongewijzigde werking)
    await expect(mid.locator('.tr-start')).toHaveCount(0);
    await expect(mid.locator('[data-act="tpKopieNaar"]')).toBeEnabled();
    await expect(mid.locator('[data-act="tpPrint"]')).toBeEnabled();
    await mid.locator('[data-act="tpMeer"]').click();
    await expect(page.locator('#sheet')).toContainText('Eerdere training overnemen');
    await expect(page.locator('#sheet')).toContainText('Training leegmaken');
    await controleer(page, fouten, 'gevulde training');
  });
}

test('eerste keuzes: met een clubprofiel staat het sjabloon in Zelf samenstellen; een gevulde training blijft byte-gelijk', { tag: ['@training', '@profiel'] }, async ({ page }) => {
  const fouten = volgFouten(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await nepDatabase(page);
  await page.evaluate((data) => { const db = JSON.parse(sessionStorage.getItem('fake-sb-db'));
    db.rows['dcg|profiel|dcg'] = { club_id: 'dcg', soort: 'profiel', id: 'dcg', scope: 'hjo', data };
    db.rows['dcg|club|club'].data.modules = { ...(db.rows['dcg|club|club'].data.modules || {}), training: true };
    sessionStorage.setItem('fake-sb-db', JSON.stringify(db)); }, PROFIEL);
  await inloggen(page, 'admin@test.nl');
  await page.evaluate(() => { const S = CC.S(); const D = CC.date; CC.wisselRol(CC.me().rollen.findIndex((r) => r.rol === 'trainer')); const ik = CC.me().id;
    const t = (id, datum) => ({ id, teamId: 'O12-1', soort: 'training', datum, tijd: '17:15', eind: '18:30' });
    S.acts.push(t('t-leeg', D.addDays(D.vandaag(), 1)), t('t-vol', D.addDays(D.vandaag(), 2)));
    S.vormen = [{ id: 'v1', naam: 'Rondo', eigenaar: ik, duur: 8 }];
    S.trainingsplannen = [{ id: 'tp-vol', actId: 't-vol', teamId: 'O12-1', datum: D.addDays(D.vandaag(), 2), eigenaar: ik, thema: 'Gevuld', leerdoelen: [], onderdelen: [{ id: 'q1', blok: 'A1', vormId: 'v1', min: 8 }] }];
    CC.save(); CC.render(); });
  const voor = await page.evaluate(() => JSON.stringify(CC.S().trainingsplannen.find((p) => p.id === 'tp-vol')));
  await page.locator('nav.nav button[data-tab="aanwezigheid"]').click();
  await page.locator('[data-act="seg"][data-val="plannen"]').click();
  await page.evaluate(() => { CC.ui.seg = CC.ui.seg || {}; });
  await page.locator('.weekstrook button').nth(0).click();
  await page.locator('[data-act="tpNieuw"]').first().click();
  await expect(page.locator('.tr-pmid .tr-startkaart', { hasText: 'Zelf samenstellen' }).locator('[data-act="tpSjabloon"]').first()).toBeVisible();
  // De gevulde training bekijken verandert niets aan de gegevens
  await page.locator('.weekstrook button').nth(1).click();
  await expect(page.locator('.tr-pmid .tr-start')).toHaveCount(0);
  expect(await page.evaluate(() => JSON.stringify(CC.S().trainingsplannen.find((p) => p.id === 'tp-vol')))).toBe(voor);
  await controleer(page, fouten, 'sjabloon en gevulde training');
});
