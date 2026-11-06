// ClubComm — trainerspilot (5-11-2026): kan een vrijwillige trainer zelfstandig een oefenvorm tekenen en bewaren?
// Loopt de vijf punten van de pilot door in de echte app (nep-database, zoals productie): spelers met nummers, materiaal,
// verplaatsen en verwijderen, bewaren en na opnieuw laden weer openen. Op de telefoon (Pixel 5, aanraken) en op de laptop.
const { test, expect } = require('@playwright/test');
const { volgFouten, controleer, nepDatabase, inloggen, nepDb } = require('./hulp');

const TAG = { tag: ['@tekentool', '@training', '@pilot'] };
const items = (page) => page.evaluate(() => [...document.querySelectorAll('#drawSvg [data-i]')].length);
const soorten = (page) => page.evaluate(() => [...document.querySelectorAll('#drawSvg [data-i]')].map((g) => g.getAttribute('data-t') || g.tagName));
// Een punt op het veld als fractie van het tekenvlak (boven in het veld: daar ligt op de telefoon geen menu)
const punt = async (page, fx, fy) => { const s = await page.locator('#drawSvg').boundingBox(); return [s.x + s.width * fx, s.y + s.height * fy]; };
const tik = async (page, telefoon, fx, fy) => { const [x, y] = await punt(page, fx, fy); if (telefoon) await page.touchscreen.tap(x, y); else await page.mouse.click(x, y); };
const knop = async (page, telefoon, loc) => (telefoon ? loc.tap() : loc.click());
const sluitMenu = async (page, telefoon) => { const x = page.locator('#drawFly .draw-fly-x'); if (await x.isVisible()) await knop(page, telefoon, x); };

for (const [naam, telefoon] of [['telefoon', true], ['laptop', false]]) {
  test(`trainerspilot (${naam}): tekenen, materiaal, verplaatsen, verwijderen, bewaren en opnieuw openen`, TAG, async ({ page }) => {
    const fouten = volgFouten(page);
    if (!telefoon) await page.setViewportSize({ width: 1366, height: 820 });
    await nepDatabase(page);
    await page.evaluate(() => { const db = JSON.parse(sessionStorage.getItem('fake-sb-db'));
      db.rows['dcg|club|club'].data.modules = { ...(db.rows['dcg|club|club'].data.modules || {}), training: true };
      sessionStorage.setItem('fake-sb-db', JSON.stringify(db)); });
    await inloggen(page, 'admin@test.nl');
    await page.evaluate(() => CC.wisselRol(CC.me().rollen.findIndex((r) => r.rol === 'trainer')));
    // Training → Vormen → Nieuwe oefenvorm → Tekening maken
    await page.locator('nav.nav button[data-tab="aanwezigheid"], nav button[data-tab="aanwezigheid"]').first().click();
    await page.locator('[data-act="seg"][data-val="vormen"]').click();
    await page.locator('#app [data-act="vormNieuw"]').first().click();
    await page.fill('#v-n', 'Rondo 4 tegen 2'); await page.locator('#v-n').press('Tab');
    await page.locator('[data-act="vormTeken"]').click();
    await expect(page.locator('#drawOverlay')).toBeVisible();
    if (await page.locator('#drawPhoneX').isVisible()) await knop(page, telefoon, page.locator('#drawPhoneX'));

    // 1. Spelers met rugnummers (nummerknoppen) en een losse speler
    await knop(page, telefoon, page.locator('[data-rail="spelers"]'));
    for (const n of [1, 2, 3, 4]) await knop(page, telefoon, page.locator(`[data-nr="rood|${n}"]`));
    await sluitMenu(page, telefoon);
    expect(await items(page), 'vier spelers met nummer').toBe(4);
    const nummers = await page.evaluate(() => [...document.querySelectorAll('#drawSvg [data-i] text')].map((t) => t.textContent).filter(Boolean).sort());
    expect(nummers, 'rugnummers zichtbaar').toEqual(['1', '2', '3', '4']);

    // 2. Materiaal: hoedjes, een doel en een bal. Laptop: menu openen en op het veld tikken (snelle route, Besluit 126).
    // Telefoon: het menu ligt over de bovenkant van het veld, dus eerst een soort kiezen (het menu gaat dan dicht), dan tikken.
    for (const [rail, soort, plekken] of [['hoedjes', 'Hoedje oranje', [[0.3, 0.15], [0.7, 0.15]]], ['doelen', 'Pupillendoel (5x2 m)', [[0.5, 0.1]]], ['bal', 'Bal', [[0.45, 0.3]]]]) {
      await knop(page, telefoon, page.locator(`[data-rail="${rail}"]`));
      const keuze = page.locator(`#drawFly [aria-label="${soort}"]`);
      if (telefoon && await keuze.isVisible()) await keuze.tap();
      for (const [fx, fy] of plekken) await tik(page, telefoon, fx, fy);
      await sluitMenu(page, telefoon);
    }
    expect(await items(page), 'vier spelers, twee hoedjes, een doel, een bal').toBe(8);

    // Na het plaatsen blijft het laatste gereedschap aan (Besluit 126); om te kiezen en te verplaatsen eerst op Kies tikken
    await knop(page, telefoon, page.locator('[data-draw-select]').first());
    // 3a. Verplaatsen: een speler slepen (muis; op de telefoon via aanwijzer)
    const voor = await page.evaluate(() => { const g = document.querySelector('#drawSvg [data-i="0"]'); const b = g.getBoundingClientRect(); return { x: b.x + b.width / 2, y: b.y + b.height / 2 }; });
    await page.mouse.move(voor.x, voor.y); await page.mouse.down(); await page.mouse.move(voor.x + 40, voor.y + 30, { steps: 8 }); await page.mouse.up();
    const na = await page.evaluate(() => { const g = document.querySelector('#drawSvg [data-i="0"]'); const b = g.getBoundingClientRect(); return { x: b.x + b.width / 2, y: b.y + b.height / 2 }; });
    expect(Math.round(na.x - voor.x), 'speler is verplaatst').toBeGreaterThan(20);
    const relNa = await page.evaluate(() => { const c = (i) => { const b = document.querySelector(`#drawSvg [data-i="${i}"]`).getBoundingClientRect(); return [b.x + b.width / 2, b.y + b.height / 2]; }; const w = document.querySelector('#drawSvg').getBoundingClientRect().width; const a = c(0), b = c(2); return [(a[0] - b[0]) / w, (a[1] - b[1]) / w]; });

    // 3b. Verwijderen: een hoedje kiezen en weghalen; daarna ongedaan maken en opnieuw weghalen
    const hoedje = await page.evaluate(() => { const g = document.querySelectorAll('#drawSvg [data-i]')[4]; const b = g.getBoundingClientRect(); return { x: b.x + b.width / 2, y: b.y + b.height / 2 }; });
    if (telefoon) await page.touchscreen.tap(hoedje.x, hoedje.y); else await page.mouse.click(hoedje.x, hoedje.y);
    const weg = page.locator('#drawDelete:visible, [data-paneel-weg]:visible').first();
    await knop(page, telefoon, weg);
    expect(await items(page), 'hoedje weg').toBe(7);
    await knop(page, telefoon, page.locator('#drawUndo'));
    expect(await items(page), 'ongedaan gemaakt').toBe(8);
    const terug = await page.evaluate(() => { const g = document.querySelectorAll('#drawSvg [data-i]')[4]; const b = g.getBoundingClientRect(); return { x: b.x + b.width / 2, y: b.y + b.height / 2 }; });
    if (telefoon) await page.touchscreen.tap(terug.x, terug.y); else await page.mouse.click(terug.x, terug.y);
    await knop(page, telefoon, page.locator('#drawDelete:visible, [data-paneel-weg]:visible').first());
    expect(await items(page), 'hoedje opnieuw weg').toBe(7);

    // 4. Bewaren en na opnieuw laden weer openen
    await knop(page, telefoon, page.locator('#drawSave'));
    await expect(page.locator('#drawOverlay')).toBeHidden({ timeout: 20000 });
    await expect.poll(async () => { const r = Object.values((await nepDb(page)).rows).find((x) => x.soort === 'vormen'); return r && r.data.tekening ? r.data.tekening.items.length : 0; }, { message: 'tekening in de database' }).toBe(7);
    await page.reload();
    await expect(page.locator('nav.nav')).toBeVisible();
    await page.evaluate(() => CC.wisselRol(CC.me().rollen.findIndex((r) => r.rol === 'trainer')));
    await page.locator('nav.nav button[data-tab="aanwezigheid"]').first().click();
    await page.locator('[data-act="seg"][data-val="vormen"]').click();
    await page.locator('.tr-kaart', { hasText: 'Rondo 4 tegen 2' }).click();
    await page.locator(':is(#sheet, .vb-naast .ld-r) [data-act="vormBewerk"]').click(); // Besluit NNN: op de laptop staat de vorm rechts
    await page.locator('[data-act="vormTeken"]').click();
    await expect(page.locator('#drawOverlay')).toBeVisible();
    expect(await items(page), 'na opnieuw openen dezelfde tekening').toBe(7);
    // Het veld kan na openen anders ingezoomd zijn; daarom de plek ten opzichte van een andere speler vergelijken
    const relOpen = await page.evaluate(() => { const c = (i) => { const b = document.querySelector(`#drawSvg [data-i="${i}"]`).getBoundingClientRect(); return [b.x + b.width / 2, b.y + b.height / 2]; }; const w = document.querySelector('#drawSvg').getBoundingClientRect().width; const a = c(0), b = c(2); return [(a[0] - b[0]) / w, (a[1] - b[1]) / w]; });
    expect(Math.abs(relOpen[0] - relNa[0]) < 0.02 && Math.abs(relOpen[1] - relNa[1]) < 0.02, `verplaatste speler staat nog op zijn nieuwe plek (${relNa} → ${relOpen})`).toBe(true);
    await controleer(page, fouten, `trainerspilot ${naam}`);
  });
}


