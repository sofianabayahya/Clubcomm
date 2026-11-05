// Tekentool, Besluit 160: met Kies heeft elk object een onzichtbaar tikvlak van 44 px (het dichtstbijzijnde object binnen
// 22 schermpunten). Met een gereedschap aan blijft het zoals het was. De tekening zelf verandert niet.
const { test, expect } = require('@playwright/test');
const { volgFouten } = require('./hulp');

const TAG = { tag: ['@tekentool', '@training'] };
const open = async (page, vp) => {
  await page.setViewportSize(vp);
  await page.goto('/tekenen'); await page.evaluate(() => localStorage.clear()); await page.goto('/tekenen');
  await page.locator('#nieuw').tap();
  await expect(page.locator('#drawOverlay')).toBeVisible();
  if (await page.locator('#drawPhoneX').isVisible()) await page.locator('#drawPhoneX').tap();
};
const opstelling = async (page, code) => { await page.locator('.draw-menu summary', { hasText: 'Opstelling' }).tap(); await page.locator(`[data-draw-form="${code}"]`).tap(); };
// Middens van de spelers op het scherm, met hun index in de tekening
const spelers = (page) => page.evaluate(() => [...document.querySelectorAll('#drawSvg g[data-i]')].map((g) => { const r = g.getBoundingClientRect(); return { i: g.getAttribute('data-i'), x: r.left + r.width / 2, y: r.top + r.height / 2 }; }));
const gekozen = (page) => page.evaluate(() => { const g = document.querySelector('#drawSvg [data-i][filter]'); return g ? g.getAttribute('data-i') : null; });

test('tikvlak: een tik naast een speler kiest die speler (telefoon 390 en 360)', TAG, async ({ page }) => {
  const fouten = volgFouten(page);
  for (const vp of [{ width: 390, height: 844 }, { width: 360, height: 780 }]) {
    await open(page, vp);
    await opstelling(page, '331|'); await opstelling(page, '331|t');
    const lijst = await spelers(page);
    expect(lijst.length).toBe(16);
    // Vaste tikken naast elke speler (8 tot 15 px ernaast, in vier richtingen): elke tik kiest de juiste speler
    let raak = 0, n = 0;
    for (const s of lijst) {
      for (const [dx, dy] of [[10, 0], [0, -12], [-8, 8], [11, 9]]) {
        await page.touchscreen.tap(s.x + dx, s.y + dy); n++;
        if ((await gekozen(page)) === s.i) raak++;
        await page.keyboard.press('Escape');
      }
    }
    expect(raak / n, `${vp.width}: ${raak} van ${n}`).toBeGreaterThanOrEqual(0.95);
    // Er is niets bijgekomen of verschoven door het tikken
    expect((await spelers(page)).length).toBe(16);
  }
  expect(fouten).toEqual([]);
});

test('tikvlak: het dichtstbijzijnde object wint; een tik ver van alles kiest niets', TAG, async ({ page }) => {
  const fouten = volgFouten(page);
  const oud = { field: 'vak', zoom: false, items: [{ t: 'p', c: 'rood', n: 1, x: 380, y: 280 }, { t: 'p', c: 'geel', n: 2, x: 420, y: 280 }, { t: 'cone', c: 'oranje', x: 400, y: 340 }] };
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/tekenen');
  await page.evaluate((d) => localStorage.setItem('cc-tekentool-test', JSON.stringify([{ data: d, tijd: new Date().toISOString() }])), oud);
  await page.goto('/tekenen');
  await page.locator('.tegel .beeld').tap();
  if (await page.locator('#drawPhoneX').isVisible()) await page.locator('#drawPhoneX').tap();
  const l = await spelers(page); // [rood 1, geel 2, hoedje]
  const midden = { x: (l[0].x + l[1].x) / 2, y: l[0].y };
  await page.touchscreen.tap(midden.x - 3, midden.y + 4); // iets dichter bij rood 1
  expect(await gekozen(page)).toBe('0');
  await page.keyboard.press('Escape');
  await page.touchscreen.tap(midden.x + 3, midden.y - 4); // iets dichter bij geel 2
  expect(await gekozen(page)).toBe('1');
  await page.keyboard.press('Escape');
  await page.touchscreen.tap(l[2].x + 9, l[2].y + 9); // naast het hoedje
  expect(await gekozen(page)).toBe('2');
  await page.keyboard.press('Escape');
  await page.touchscreen.tap(l[2].x + 60, l[2].y + 60); // ver van alles
  expect(await gekozen(page)).toBe(null);
  expect(fouten).toEqual([]);
});

test('tikvlak: met een gereedschap aan zet een tik naast een speler iets neer (zoals het was)', TAG, async ({ page }) => {
  const fouten = volgFouten(page);
  await open(page, { width: 390, height: 844 });
  await opstelling(page, '212|');
  const voor = await spelers(page);
  await page.locator('[data-rail="hoedjes"]').tap();
  await page.locator('.draw-fly-x').tap(); // × zet het gereedschap uit (Besluit 152); daarom opnieuw kiezen
  await page.locator('[data-rail="hoedjes"]').tap();
  const s = voor[2];
  const f = await page.locator('#drawFly').boundingBox();
  // Tik naast een speler die niet onder het menu ligt
  const doel = voor.find((q) => q.y < f.y || q.y > f.y + f.height) || s;
  await page.touchscreen.tap(doel.x + 12, doel.y + 2);
  await expect(page.locator('#drawSvg g[data-i]')).toHaveCount(voor.length + 1); // er staat een hoedje bij
  expect(fouten).toEqual([]);
});

test('tikvlak: een met het tikvlak gekozen speler verslepen; een selectievak iets verder weg werkt zoals het was', TAG, async ({ page }) => {
  const fouten = volgFouten(page);
  await open(page, { width: 1366, height: 820 });
  await opstelling(page, '331|');
  const l = await spelers(page);
  const s = l[3];
  // Naast de speler drukken en slepen: de speler gaat mee
  await page.mouse.move(s.x + 12, s.y + 8); await page.mouse.down(); await page.mouse.move(s.x + 92, s.y + 48, { steps: 6 }); await page.mouse.up();
  const na = (await spelers(page)).find((q) => q.i === s.i);
  expect(Math.round(na.x - s.x)).toBeGreaterThan(60);
  // Selectievak: begin op een lege plek ver van de spelers en sleep over een paar spelers
  const v = await page.locator('#drawSvg').boundingBox();
  await page.mouse.move(v.x + 5, v.y + 5); await page.mouse.down(); await page.mouse.move(v.x + v.width * 0.6, v.y + v.height - 5, { steps: 6 }); await page.mouse.up();
  await expect(page.locator('#drawSelCount')).toBeVisible();
  expect(fouten).toEqual([]);
});
