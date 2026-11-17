// ClubComm — Besluit NNN (H3 en H4): een variant heeft een vaste code; weghalen verschuift geen trainingen; Op het veld en de print
// tonen de gekozen variant (tekening en wat anders is), de basis ingeklapt. Demo met verzonnen gegevens.
const { test, expect } = require('@playwright/test');
const { volgFouten, controleer } = require('./hulp');

const B = 'docs/onderzoek/varianten-h3-h4/';
const p = (c, n, x, y) => ({ t: 'p', c, n, x, y });
const basisT = { field: 'vak', items: [p('rood', 6, 150, 60), p('rood', 2, 100, 110), p('rood', 4, 200, 110), p('rood', 8, 150, 160), p('geel', 9, 150, 110), { t: 'ball', x: 110, y: 120 }] };
const tweeT = { field: 'vak', items: [p('rood', 6, 150, 60), p('rood', 2, 100, 110), p('rood', 4, 200, 110), p('rood', 8, 150, 160), p('geel', 9, 135, 100), p('geel', 7, 165, 125), { t: 'ball', x: 110, y: 120 }] };

const demo = async (page, { oud = false } = {}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/?demo'); await page.evaluate(() => localStorage.clear()); await page.goto('/?demo');
  await page.locator('[data-act="demoLogin"][data-pid]').nth(1).click(); await page.locator('[data-act="magischeLink"]').click();
  await expect(page.locator('nav.nav')).toBeVisible();
  return page.evaluate(({ basisT, tweeT, oud }) => { const S = CC.S(); const ik = CC.me().id; S.club.modules.training = true;
    CC.wisselRol(CC.me().rollen.findIndex((r) => r.rol === 'trainer'));
    // Variant A zonder eigen tekening, B met eigen tekening. 'oud' = varianten zonder code en een plek met een volgnummer (zoals vóór H3)
    const A = { naam: 'A: twee keer raken', tekst: 'Maximaal twee keer raken', richting: 'moeilijker' }; const Bv = { naam: 'B: twee verdedigers', tekst: '4 tegen 2: de tweede verdediger start op de lijn', richting: 'moeilijker', tekening: tweeT };
    if (!oud) { A.id = 'var-a'; Bv.id = 'var-b'; }
    S.vormen = [{ id: 'v1', eigenaar: ik, naam: 'Rondo 4 tegen 1', type: 'rondo', spelersMin: 5, spelersMax: 10, duur: 10, aantal: { aanval: 4, verdediging: 1 }, organisatie: 'Vier spelers aan de buitenkant, één in het midden', coach: 'Open staan voor de bal', tekening: basisT, varianten: [A, Bv], aantallen: [] }];
    const tid = CC.teamId(); const acts = S.acts.filter((x) => x.teamId === tid && x.soort === 'training').sort((x, y) => x.datum.localeCompare(y.datum));
    const nu = acts.find((x) => x.datum >= CC.date.vandaag()); const toen = [...acts].reverse().find((x) => x.datum < CC.date.vandaag());
    S.trainingsplannen = [
      { id: 'tp-nu', actId: nu.id, teamId: tid, datum: nu.datum, eigenaar: ik, thema: 'Rondo', leerdoelen: [], onderdelen: [{ id: 'o1', vormId: 'v1', min: 10, variant: oud ? 1 : 'var-b' }] },
      { id: 'tp-toen', actId: toen.id, teamId: tid, datum: toen.datum, eigenaar: ik, thema: 'Rondo', leerdoelen: [], gegeven: true, onderdelen: [{ id: 'o1', vormId: 'v1', min: 10, variant: oud ? 1 : 'var-b' }] }];
    (CC.ui.seg = CC.ui.seg || {}).aanwAct = nu.id; CC.save(); CC.render(); return { nu: nu.id, toen: toen.id }; }, { basisT, tweeT, oud });
};
const regel = (page) => page.locator('.tr-weekkaart .tr-wrij', { hasText: 'Rondo' });
const printHtml = (page, id) => page.evaluate((id) => { let uit = ''; const o = CC.printDoc; CC.printDoc = (t, h) => { uit = h; }; const b = document.createElement('button'); b.dataset.act = 'tpPrint'; b.dataset.id = id; document.body.append(b); b.click(); b.remove(); CC.printDoc = o; return uit; }, id);

test('H4: Op het veld toont de gekozen variant bovenaan, de basis ingeklapt; ook op de print', { tag: ['@training'] }, async ({ page }) => {
  const fouten = volgFouten(page);
  const id = await demo(page);
  await page.locator('nav.nav button[data-tab="aanwezigheid"]').click(); await page.waitForTimeout(3500);
  await expect(regel(page)).toContainText('B: twee verdedigers');
  await regel(page).click();
  const sh = page.locator('#sheet');
  await expect(sh.locator('.tr-vandaag')).toContainText('Vandaag: B: twee verdedigers');
  await expect(sh.locator('.tr-vandaag')).toContainText('de tweede verdediger start op de lijn');
  // De grote tekening is die van variant B (twee gele spelers), de basis staat ingeklapt
  expect(await sh.locator('.tr-rv-l > .tr-groot svg [data-i]').count()).toBe(7);
  await expect(sh.locator('.tr-basis')).not.toHaveAttribute('open', '');
  await page.waitForTimeout(600); await page.screenshot({ path: B + '1-op-het-veld-variant.jpg', type: 'jpeg', quality: 80 });
  await sh.locator('.tr-basis > summary').click();
  expect(await sh.locator('.tr-basis svg [data-i]').count()).toBe(6);
  await sh.locator('.tr-basis').scrollIntoViewIfNeeded(); await page.screenshot({ path: B + '2-basis-uitgeklapt.jpg', type: 'jpeg', quality: 80 });
  // Print: variant B met eigen tekening en wat anders is
  const html = await printHtml(page, id.nu);
  expect(html).toContain('vandaag variant B: twee verdedigers'); expect(html).toContain('Anders bij deze variant:</b> 4 tegen 2');
  expect((html.match(/data-i=/g) || []).length).toBe(7);
  if (process.env.BEELD) { await page.evaluate(() => CC.closeSheet()); await page.evaluate((h) => { window.print = () => {}; CC.printDoc('Training', h); document.body.classList.add('print-doc'); }, html);
    await page.emulateMedia({ media: 'print' }); await page.setViewportSize({ width: 794, height: 1000 }); await page.screenshot({ path: B + '4-print.jpg', type: 'jpeg', quality: 80 });
    await page.emulateMedia({ media: 'screen' }); await page.setViewportSize({ width: 390, height: 844 }); await page.locator('.tr-weekkaart .tr-wrij', { hasText: 'Rondo' }).click(); }
  // Vanuit Vormen (zonder training) blijft de vorm zoals hij is: geen 'Vandaag'
  await page.evaluate(() => { CC.closeSheet(); CC.ui.seg.trSeg = 'vormen'; CC.render(); });
  await page.locator('#app [data-act="vormOpen"]').first().click();
  await expect(sh.locator('.tr-vandaag')).toHaveCount(0);
  await controleer(page, fouten);
});

test('H3: een variant weghalen verschuift geen geplande of gegeven training', { tag: ['@training'] }, async ({ page }) => {
  const fouten = volgFouten(page);
  const id = await demo(page);
  await page.evaluate(() => CC.open('vorm', { id: 'v1' }));
  await page.locator('.tr-varianten > summary').click();
  await page.locator('[data-act="vormVariant"][data-i="0"]').click();
  await page.locator('#sheet [data-act="vormVariantWeg"]').click();
  // A is verborgen, niet weg; de lijst schuift niet
  const v = await page.evaluate(() => JSON.parse(JSON.stringify(CC.S().vormen[0].varianten)));
  expect(v.map((x) => [x.id, !!x.weg])).toEqual([['var-a', true], ['var-b', false]]);
  await expect(page.locator('.tr-varianten > summary')).toContainText('· 1');
  // Geplande en gegeven training noemen nog steeds B
  for (const t of [id.nu, id.toen]) expect(await printHtml(page, t)).toContain('vandaag variant B: twee verdedigers');
  // In het venster van de plek staat A niet meer als keuze; B is gekozen
  await page.evaluate(() => { CC.ui.view = null; CC.ui.stack = []; CC.ui.tab = 'aanwezigheid'; CC.ui.seg.trSeg = 'plannen'; CC.render(); });
  await page.locator('.tr-rij', { hasText: 'Rondo' }).first().click();
  const keuzes = page.locator('#sheet fieldset', { hasText: 'Welke uitvoering vandaag?' }).locator('label');
  await expect(keuzes).toHaveText(['Basis', 'B: twee verdedigers']);
  await expect(page.locator('#sheet input[name="variant"]:checked')).toHaveValue('var-b');
  await page.locator('#sheet fieldset', { hasText: 'Welke uitvoering vandaag?' }).scrollIntoViewIfNeeded();
  await page.screenshot({ path: B + '3-welke-uitvoering-vandaag.jpg', type: 'jpeg', quality: 80 });
  await controleer(page, fouten);
});

test('H3: oude gegevens (varianten zonder code, plek met volgnummer) blijven leesbaar en krijgen bij opslaan een code', { tag: ['@training'] }, async ({ page }) => {
  const fouten = volgFouten(page);
  const id = await demo(page, { oud: true });
  expect(await printHtml(page, id.toen)).toContain('vandaag variant B: twee verdedigers');
  await page.locator('nav.nav button[data-tab="aanwezigheid"]').click();
  await page.evaluate(() => { CC.ui.seg.trSeg = 'plannen'; CC.render(); });
  await page.locator('.tr-rij', { hasText: 'Rondo' }).first().click();
  await expect(page.locator('#sheet input[name="variant"]:checked + span')).toHaveText('B: twee verdedigers');
  // Opslaan via het venster: de plek bewaart nu de code van B, niet het volgnummer
  await page.locator('#sheet form[data-submit="tpOnderdeelOk"] button.knop.vol, #sheet form[data-submit="tpOnderdeelOk"] [type="submit"]').first().click().catch(async () => { await page.evaluate(() => document.querySelector('#sheet form[data-submit="tpOnderdeelOk"]').requestSubmit()); });
  const r = await page.evaluate(() => { const S = CC.S(); const o = S.trainingsplannen.find((x) => x.id === 'tp-nu').onderdelen[0]; const vb = S.vormen[0].varianten[1]; return { variant: o.variant, code: vb.id }; });
  expect(typeof r.variant).toBe('string'); expect(r.variant).toBe(r.code);
  await controleer(page, fouten);
});
