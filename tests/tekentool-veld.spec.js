// Tekentool, Besluit 153: penaltystip, halve maan, hoekschopboogjes en middenstip op 11x11 (liggend en staand) en Half veld.
// 8x8, 6x6 en Vak krijgen ze (nog) niet. Oude tekeningen krijgen de lijnen vanzelf; de gegevens veranderen niet.
const { test, expect } = require('@playwright/test');
const { volgFouten } = require('./hulp');

const TAG = { tag: ['@tekentool', '@training'] };
// [veld, stippen (incl. middenstip), bogen, hoekjes]
const VERWACHT = [['liggend', 3, 2, 4], ['staand', 3, 2, 4], ['half', 2, 1, 2], ['f8', 0, 0, 0], ['f6', 0, 0, 0], ['vak', 0, 0, 0]];
const tel = (page, sel) => page.evaluate((s) => [...document.querySelectorAll(s)].map((n) => n.getAttribute('class')).reduce((t, c) => { t[c] = (t[c] || 0) + 1; return t; }, {}), sel);

test('veld: stip, halve maan en hoekjes op de juiste velden (editor)', TAG, async ({ page }) => {
  const fouten = volgFouten(page);
  await page.setViewportSize({ width: 1366, height: 820 });
  await page.goto('/tekenen'); await page.evaluate(() => localStorage.clear()); await page.goto('/tekenen');
  await page.locator('#nieuw').click();
  for (const [veld, stip, boog, hoek] of VERWACHT) {
    await page.locator('#drawVeldMenu summary').click();
    await page.locator(`[data-draw-field="${veld}"]`).click();
    const t = await tel(page, '#drawSvg .veld-stip, #drawSvg .veld-boog, #drawSvg .veld-hoek');
    expect([t['veld-stip'] || 0, t['veld-boog'] || 0, t['veld-hoek'] || 0], veld).toEqual([stip, boog, hoek]);
  }
  // Penaltystip op 11 m van de doellijn (liggend: doellijn op x = 20), middenstip in het midden
  await page.locator('#drawVeldMenu summary').click(); await page.locator('[data-draw-field="liggend"]').click();
  const stippen = await page.evaluate(() => [...document.querySelectorAll('#drawSvg .veld-stip')].map((c) => `${c.getAttribute('cx')},${c.getAttribute('cy')}`).sort());
  expect(stippen).toEqual(['130,340', '525,340', '920,340']);
  expect(fouten).toEqual([]);
});

test('veld: een oude tekening krijgt de lijnen op de tegel, de gegevens blijven gelijk', TAG, async ({ page }) => {
  const fouten = volgFouten(page);
  const oud = { field: 'half', zoom: false, items: [{ t: 'p', c: 'rood', n: 9, x: 340, y: 260 }, { t: 'goal', s: 'M', x: 340, y: 22 }] };
  await page.setViewportSize({ width: 1366, height: 820 });
  await page.goto('/tekenen');
  await page.evaluate((d) => localStorage.setItem('cc-tekentool-test', JSON.stringify([{ data: d, tijd: new Date().toISOString() }])), oud);
  await page.goto('/tekenen');
  const t = await tel(page, '.tegel svg .veld-stip, .tegel svg .veld-boog, .tegel svg .veld-hoek');
  expect(t).toEqual({ 'veld-stip': 2, 'veld-boog': 1, 'veld-hoek': 2 });
  await page.locator('.tegel .beeld').click();
  await page.locator('#drawSave').click();
  await expect(page.locator('#drawOverlay')).toBeHidden({ timeout: 20000 });
  const d = await page.evaluate(() => JSON.parse(localStorage.getItem('cc-tekentool-test'))[0].data);
  expect(d.items).toEqual(oud.items); expect(d.field).toBe('half');
  expect(fouten).toEqual([]);
});
