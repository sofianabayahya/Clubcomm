// Oefenvorm kiezen (Besluit 138 en 139): regressietests. Ze leggen het gedrag vast dat bij het samenvoegen tot één kiezer
// moet blijven: gereedschap, vaardigheden, leerniveau en aantal spelers bij een profiel met methodiek (DCG), en dezelfde kiezer zonder profiel (zoals Swift).
const { test, expect } = require('@playwright/test');
const fs = require('fs'); const path = require('path');
const { volgFouten, controleer, nepDatabase, inloggen } = require('./hulp');

const DCG = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'supabase', 'profielen', 'dcg.json'), 'utf8'));
const VORMEN = [
  { id: 'v-rondo', naam: 'Rondo vooruit', ld: 'll-passen', vh: ['vh-vooruit-inspelen'], min: 8, max: 12, duur: 12 },
  { id: 'v-kaats', naam: 'Kaatsvorm', ld: 'll-passen', vh: ['vh-kaatsen'], min: 10, max: 14, duur: 8 },
  { id: 'v-groot', naam: 'Groot positiespel', ld: 'll-passen', vh: ['vh-vooruit-inspelen'], min: 16, max: 20, duur: 15 },
  { id: 'v-pass', naam: 'Passeren 1 tegen 1', ld: 'll-1v1-aanvallend', vh: ['vh-passeren'], min: 2, max: 12, duur: 10 },
];

// Trainer met vier eigen vormen en een training van vandaag met 12 spelers; met profiel: sjabloon DCG 75, A = Passen, A1 op leerniveau Kiezen
async function klaarzetten(page, metProfiel) {
  await nepDatabase(page);
  await page.evaluate((data) => { const db = JSON.parse(sessionStorage.getItem('fake-sb-db'));
    if (data) db.rows['dcg|profiel|dcg'] = { club_id: 'dcg', soort: 'profiel', id: 'dcg', scope: 'hjo', data };
    db.rows['dcg|club|club'].data.modules = { ...(db.rows['dcg|club|club'].data.modules || {}), training: true };
    sessionStorage.setItem('fake-sb-db', JSON.stringify(db)); }, metProfiel ? DCG : null);
  await inloggen(page, 'admin@test.nl');
  await page.evaluate(({ vormen, metProfiel }) => { const S = CC.S(); CC.wisselRol(CC.me().rollen.findIndex((r) => r.rol === 'trainer')); const ik = CC.me().id;
    S.acts.push({ id: 'tKies', teamId: 'O12-1', soort: 'training', datum: CC.date.vandaag(), tijd: '23:58', eind: '23:59' });
    S.vormen = vormen.map((v) => ({ id: v.id, eigenaar: ik, naam: v.naam, type: 'positie', koppelingen: metProfiel ? { dcg: { primair: v.ld, ook: [] } } : {}, leerdoelen: metProfiel ? [v.ld] : [],
      vaardigheden: metProfiel ? v.vh : [], spelersMin: v.min, spelersMax: v.max, duur: v.duur }));
    CC.save(); CC.render(); }, { vormen: VORMEN, metProfiel });
  await page.locator('nav.nav button[data-tab="aanwezigheid"]').click();
  await page.locator('.weekstrook [data-val="tKies"]').click();
  if (await page.locator('[data-act="seg"][data-val="plannen"]').count()) await page.locator('[data-act="seg"][data-val="plannen"]').click();
  await page.locator('[data-act="tpNieuw"]').first().click();
  if (metProfiel) {
    await page.locator('[data-act="tpSjabloon"][data-s="dcg-75"]').click();
    await page.evaluate(() => { const S = CC.S(); const p = S.trainingsplannen.find((x) => x.actId === 'tKies'); p.spelers = 12; p.blokDoel = { A: 'll-passen' };
      p.onderdelen.find((o) => o.blok === 'A1').niveau = 'ln-kiezen'; CC.save(); CC.render(); });
  } else await page.evaluate(() => { const S = CC.S(); S.trainingsplannen.find((x) => x.actId === 'tKies').spelers = 12; CC.save(); CC.render(); });
}
const plan = (page) => page.evaluate(() => JSON.parse(JSON.stringify(CC.S().trainingsplannen.find((x) => x.actId === 'tKies'))));
// Volgorde van de vormen in de kiezer (eerste knop per vorm)
const volgorde = (page) => page.evaluate(() => [...new Set([...document.querySelectorAll('#sheet [data-act="tpVormErbij"]')].map((b) => b.dataset.v))]);
// Een lege plek openen; lukt dat via het onderdeelvenster (zonder methodiek, vóór Besluit 139), dan daar "Kies een vorm"
async function plekKiezen(page, code) {
  await page.locator('.tr-midden .tr-rij', { hasText: code }).first().click();
  const via = page.locator('#sheet [data-act="tpVormKiezen"]'); if (await via.count()) await via.click();
  await expect(page.locator('#sheet [data-act="tpVormErbij"]').first()).toBeAttached();
}
// Een vorm kiezen, ook als hij in een ingeklapt deel staat ("Andere vormen")
async function kies(page, id) {
  const knop = page.locator(`#sheet [data-act="tpVormErbij"][data-v="${id}"]`).first();
  await knop.evaluate((b) => { const d = b.closest('details'); if (d) d.open = true; });
  await knop.click();
}
async function anderGereedschap(page, id) {
  const knop = page.locator(`#sheet [data-act="vkZet"][data-k="gs"][data-w="${id}"]`);
  if (!(await knop.isVisible())) await page.locator('#sheet summary', { hasText: 'Ander gereedschap' }).click();
  await knop.click();
}

for (const breed of [390, 1366]) test(`oefenvorm kiezen met profiel (DCG): gereedschap, vaardigheid, leerniveau, aantal (${breed} px)`, { tag: ['@training', '@profiel'] }, async ({ page }) => {
  const fouten = volgFouten(page);
  await page.setViewportSize({ width: breed, height: 900 });
  await klaarzetten(page, true);
  await plekKiezen(page, 'A1');
  // Het gereedschap van het blok staat aan, met zijn vaardigheden; het leerniveau en het aantal spelers staan erbij
  await expect(page.locator('#sheet [data-act="vkZet"][data-k="gs"][data-w="ll-passen"]')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('#sheet .tr-vh')).toContainText('Vooruit inspelen');
  await expect(page.locator('#sheet')).toContainText('Kiezen');
  if (process.env.SHOTS && breed > 900) { await page.waitForTimeout(400); await page.screenshot({ path: `${process.env.SHOTS}/k5-dcg-laptop.png` }); }
  await expect(page.locator('#sheet')).toContainText('12 spelers');
  // Wat past bij het gereedschap en het aantal komt eerst; een ander gereedschap of te veel spelers komt later (of niet)
  let v = await volgorde(page);
  expect(v.slice(0, 2).sort()).toEqual(['v-kaats', 'v-rondo']);
  expect(v.indexOf('v-groot')).toBeGreaterThan(1);
  expect(v.indexOf('v-pass') === -1 || v.indexOf('v-pass') > 1).toBeTruthy();
  // Vaardigheid kiezen: die vorm bovenaan
  await page.locator('#sheet [data-act="vkZet"][data-k="vh"][data-w="vh-kaatsen"]').click();
  v = await volgorde(page); expect(v[0]).toBe('v-kaats');
  // Ander gereedschap: andere vaardigheden, andere vormen bovenaan
  await anderGereedschap(page, 'll-1v1-aanvallend');
  await expect(page.locator('#sheet .tr-vh')).toContainText('Passeren');
  v = await volgorde(page); expect(v[0]).toBe('v-pass');
  // Kiezen: de vorm staat op de plek, de minuten van de plek blijven
  await kies(page, 'v-pass');
  await expect(page.locator('#sheet')).toBeHidden();
  let p = await plan(page); let a1 = p.onderdelen.find((o) => o.blok === 'A1');
  expect(`${a1.vormId}|${a1.min}|${p.onderdelen.length}`).toBe('v-pass|6|8');
  // Nieuwe vorm vanuit de kiezer: gereedschap en vaardigheid gaan mee, de vorm komt op de plek
  await plekKiezen(page, 'A2');
  await anderGereedschap(page, 'll-1v1-aanvallend');
  await page.locator('#sheet [data-act="vkZet"][data-k="vh"][data-w="vh-dreigen"]').click();
  await page.locator('#sheet [data-act="vormNieuw"]').click();
  await expect(page.locator('.tr-vh button[data-w="vh-dreigen"]')).toHaveAttribute('aria-pressed', 'true');
  await page.locator('[data-act="terug"]').click();
  p = await plan(page); const nieuw = await page.evaluate(() => CC.S().vormen.find((x) => !x.id.startsWith('v-')));
  expect(`${nieuw.koppelingen.dcg.primair}|${nieuw.vaardigheden}|${p.onderdelen.find((o) => o.blok === 'A2').vormId === nieuw.id}`).toBe('ll-1v1-aanvallend|vh-dreigen|true');
  await controleer(page, fouten, 'kiezer DCG');
});

test('oefenvorm kiezen zonder profiel (zoals Swift): dezelfde kiezer, zonder methodiek', { tag: ['@training', '@profiel'] }, async ({ page }) => {
  const fouten = volgFouten(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await klaarzetten(page, false);
  await page.locator('.tr-midden [data-act="tpVormKiezen"]').click();
  await expect(page.locator('#sheet [data-act="tpVormErbij"]').first()).toBeAttached();
  // Geen gereedschap, vaardigheid of leerniveau als het profiel die niet heeft
  await expect(page.locator('#sheet [data-act="vkZet"][data-k="gs"]')).toHaveCount(0);
  await expect(page.locator('#sheet .tr-vh')).toHaveCount(0);
  await expect(page.locator('#sheet')).toContainText('12 spelers');
  // Passend bij 12 spelers eerst; de rest blijft te kiezen
  const v = await volgorde(page);
  expect(v.indexOf('v-groot')).toBe(3);
  await kies(page, 'v-groot');
  await expect(page.locator('#sheet')).toBeHidden();
  const p = await plan(page); expect(p.onderdelen.map((o) => o.vormId).join()).toBe('v-groot');
  await controleer(page, fouten, 'kiezer zonder profiel');
});

// Besluit 139: twee tikken, niets uitgesloten, waarom (oranje), meer achter ⓘ, en ongedaan maken zonder iets anders kwijt te raken
test('oefenvorm kiezen (Besluit 139): twee tikken, redenen, toch kiezen en ongedaan maken', { tag: ['@training', '@profiel'] }, async ({ page }) => {
  const fouten = volgFouten(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await klaarzetten(page, true);
  // Aanbevolen leerniveau bij een vorm en een training van vorige week met de rondo
  // Eerst de volgorde zonder aanbevolen leerniveau: die mag door het leerniveau niet veranderen
  await page.locator('.tr-midden .tr-rij', { hasText: 'A1' }).first().click();
  const zonderNiveau = await volgorde(page);
  await page.evaluate(() => CC.closeSheet());
  await page.waitForTimeout(1600); // dezelfde plek opnieuw: de beveiliging tegen dubbel tikken wacht 1,5 s
  await page.evaluate(() => { const S = CC.S(); S.vormen.find((v) => v.id === 'v-kaats').niveauAdvies = 'ln-kiezen'; S.vormen.find((v) => v.id === 'v-rondo').niveauAdvies = 'ln-uitvoeren';
    S.vormen.find((v) => v.id === 'v-groot').minVariant = '4 tegen 4 zonder keepers';
    S.trainingsplannen.push({ id: 'tp-vorig', actId: 'los-vorig', los: true, datum: CC.date.addDays(CC.date.vandaag(), -7), eigenaar: CC.me().id, onderdelen: [{ id: 'o-x', vormId: 'v-rondo', min: 10 }] });
    const p = S.trainingsplannen.find((x) => x.actId === 'tKies'); p.onderdelen.find((o) => o.blok === 'B1').vormId = 'v-pass'; CC.save(); CC.render(); });
  const voor = await plan(page);
  // Tik 1: de lege plek. Redenen staan in één regel; wat minder past is oranje en staat eerst in die regel
  await page.locator('.tr-midden .tr-rij', { hasText: 'A1' }).first().click();
  await expect(page.locator('#sheet .sheet-kop h2')).toContainText('Kies oefenvorm · A1');
  const rij = (id) => page.locator(`#sheet .kv-r:has([data-v="${id}"])`);
  // Het aanbevolen leerniveau is alleen informatie: niet oranje en geen invloed op de volgorde (de plek A1 staat op Kiezen)
  await expect(rij('v-kaats').locator('.kv-w')).toContainText('meestal Kiezen');
  await expect(rij('v-rondo').locator('.kv-w')).toContainText('meestal Uitvoeren');
  await expect(rij('v-rondo').locator('.kv-w .o')).toHaveCount(0);
  await expect(rij('v-rondo').locator('.kv-w')).toContainText('vorige week ook');
  expect(await volgorde(page)).toEqual(zonderNiveau);
  if (process.env.SHOTS) { await page.waitForTimeout(400); await page.screenshot({ path: `${process.env.SHOTS}/k1-dcg-tel.png` }); }
  // Niets uitgesloten: te groot staat bij Past deels, met de reden; een ander gereedschap staat ingeklapt bij Alle andere vormen
  await expect(page.locator('#sheet .kv-groep', { hasText: 'Past deels' })).toContainText('(1)');
  await expect(rij('v-groot').locator('.kv-w .o')).toContainText('voor 16–20 sp');
  await expect(page.locator('#sheet .kv-rest summary')).toContainText('Alle andere vormen (1)');
  await expect(rij('v-pass').locator('.kv-w .o')).toContainText('ander gereedschap: 1v1 aanvallend');
  // ⓘ = meer: de minimumvariant en bewust toch kiezen
  await rij('v-groot').locator('[data-act="kvMeer"]').click();
  await expect(rij('v-groot').locator('.kv-noot')).toContainText('Bij 12: 4 tegen 4 zonder keepers');
  if (process.env.SHOTS) { await rij('v-groot').scrollIntoViewIfNeeded(); await page.screenshot({ path: `${process.env.SHOTS}/k2-dcg-meer.png` }); }
  await rij('v-groot').locator('.kv-uit [data-act="tpVormErbij"]').click();
  await expect(page.locator('#sheet')).toBeHidden();
  await expect(page.locator('#toast')).toContainText('In A1 gezet');
  if (process.env.SHOTS) await page.screenshot({ path: `${process.env.SHOTS}/k3-gezet.png` });
  let p = await plan(page); expect(p.onderdelen.find((o) => o.blok === 'A1').vormId).toBe('v-groot');
  // Ongedaan maken: alleen A1 gaat terug, de rest (B1 met een vorm, minuten) blijft precies gelijk
  await page.locator('#toast [data-act="tpOngedaan"]').click();
  p = await plan(page); expect(JSON.stringify(p.onderdelen)).toBe(JSON.stringify(voor.onderdelen));
  // Twee tikken: plek, vorm
  await page.locator('.tr-midden .tr-rij', { hasText: 'A1' }).first().click();
  await rij('v-kaats').locator('[data-act="tpVormErbij"]').first().click();
  p = await plan(page); expect(p.onderdelen.find((o) => o.blok === 'A1').vormId).toBe('v-kaats');
  // Vormen: geen oproep om een leerniveau aan te vullen (informatie is geen taak); het leerniveau kan wel bij de vorm worden gezet
  await page.locator('[data-act="seg"][data-val="vormen"]').click();
  await expect(page.locator('.tr-aanvul')).toHaveCount(0);
  await page.locator('.tr-kaart', { hasText: 'Groot positiespel' }).click();
  await page.locator('#sheet [data-act="vormBewerk"]').click();
  await page.locator('[data-act="vormKies"][data-veld="niveauAdvies"][data-w="ln-afstemmen"]').click();
  expect(await page.evaluate(() => CC.S().vormen.find((v) => v.id === 'v-groot').niveauAdvies)).toBe('ln-afstemmen');
  await controleer(page, fouten, 'kiezer 139');
});

test('oefenvorm kiezen (Besluit 139) zonder profiel: achteraan toevoegen en ongedaan maken', { tag: ['@training', '@profiel'] }, async ({ page }) => {
  const fouten = volgFouten(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await klaarzetten(page, false);
  await page.evaluate(() => { const S = CC.S(); S.trainingsplannen.find((x) => x.actId === 'tKies').onderdelen.push({ id: 'o-eerst', vormId: 'v-kaats', min: 8 }); CC.save(); CC.render(); });
  await page.locator('.tr-midden [data-act="tpVormKiezen"]').click();
  await expect(page.locator('#sheet .kv-gs')).toHaveCount(0);
  await expect(page.locator('#sheet .kv-groep').first()).toContainText('Past het best (3)');
  if (process.env.SHOTS) { await page.waitForTimeout(400); await page.screenshot({ path: `${process.env.SHOTS}/k4-zonder-profiel-tel.png` }); }
  await page.locator('#sheet .kv-r:has([data-v="v-rondo"]) [data-act="tpVormErbij"]').first().click();
  await expect(page.locator('#toast')).toContainText('In de training gezet');
  expect((await plan(page)).onderdelen.map((o) => o.vormId).join()).toBe('v-kaats,v-rondo');
  await page.locator('#toast [data-act="tpOngedaan"]').click();
  expect((await plan(page)).onderdelen.map((o) => o.vormId).join()).toBe('v-kaats');
  await controleer(page, fouten, 'kiezer 139 zonder profiel');
});
