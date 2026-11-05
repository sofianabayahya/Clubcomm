// Tekentool, Besluit NNN: een hoedje is ongeveer 70% van een speler (was even breed). Geldt voor alle kleuren, in de
// tekentool en in de vaste tekening (Vormenbank, training, printen). Plek en aantikken met Kies (tikvlak, Besluit 160) blijven.
const { test, expect } = require('@playwright/test');
const { volgFouten } = require('./hulp');

const TAG = { tag: ['@tekentool', '@training'] };
const KLEUREN = ['oranje', 'blauw', 'rood', 'geel', 'groen', 'roze'];
const TEKENING = { field: 'vak', zoom: false, items: [
  { t: 'p', c: 'rood', n: 6, x: 400, y: 280 },
  ...KLEUREN.map((c, i) => ({ t: 'cone', c, x: 250 + i * 60, y: 380 })),
] };
const openMet = async (page, vp) => {
  await page.setViewportSize(vp);
  await page.goto('/tekenen');
  await page.evaluate((d) => { localStorage.clear(); localStorage.setItem('cc-tekentool-test', JSON.stringify([{ data: d, tijd: new Date().toISOString() }])); }, TEKENING);
  await page.goto('/tekenen');
  await page.locator('.tegel .beeld').click();
  if (await page.locator('#drawPhoneX').isVisible()) await page.locator('#drawPhoneX').click();
};
// Breedte op het scherm van elk getekend object, in de volgorde van de tekening
const breedtes = (page, sel) => page.evaluate((sel) => [...document.querySelectorAll(sel)].map((g) => g.getBoundingClientRect()).map((r) => ({ b: r.width, x: r.left + r.width / 2, y: r.top + r.height / 2 })), sel);

test('hoedjes: ongeveer 70% van een speler, in elke kleur (laptop en telefoon)', TAG, async ({ page }) => {
  const fouten = volgFouten(page);
  for (const vp of [{ width: 1366, height: 820 }, { width: 390, height: 844 }]) {
    await openMet(page, vp);
    const [speler, ...hoedjes] = await breedtes(page, '#drawSvg g[data-i]');
    expect(hoedjes).toHaveLength(6);
    for (const h of hoedjes) {
      const v = h.b / speler.b;
      expect(v, `${vp.width}: hoedje ${h.b.toFixed(1)} px, speler ${speler.b.toFixed(1)} px`).toBeGreaterThan(0.6);
      expect(v).toBeLessThan(0.78); // was ± 0,95
    }
  }
  expect(fouten).toEqual([]);
});

test('hoedjes: de vaste tekening (Vormenbank, training) heeft dezelfde verhouding', TAG, async ({ page }) => {
  await page.goto('/tekenen');
  const v = await page.evaluate((d) => { const div = document.createElement('div'); div.style.width = '600px'; div.innerHTML = window.DrawTool.staticSvg(d); document.body.appendChild(div);
    const gs = [...div.querySelectorAll('g[transform^="translate"]')].map((g) => g.getBoundingClientRect().width).filter((b) => b > 0);
    div.remove(); return gs; }, TEKENING);
  expect(v.length).toBeGreaterThanOrEqual(7);
  const [speler, ...hoedjes] = v;
  for (const h of hoedjes.slice(0, 6)) { expect(h / speler).toBeGreaterThan(0.6); expect(h / speler).toBeLessThan(0.78); }
});

test('hoedjes: op de telefoon kiest een tik op of net naast een hoedje dat hoedje (Kies)', TAG, async ({ page }) => {
  const fouten = volgFouten(page);
  await openMet(page, { width: 390, height: 844 });
  const lijst = await breedtes(page, '#drawSvg g[data-i]');
  const gekozen = () => page.evaluate(() => { const g = document.querySelector('#drawSvg [data-i][filter]'); return g ? g.getAttribute('data-i') : null; });
  for (let i = 1; i <= 6; i++) {
    for (const [dx, dy] of [[0, 0], [0, -9]]) { // midden, en net erboven (weg van de buren ernaast)
      await page.mouse.click(lijst[i].x + dx, lijst[i].y + dy);
      expect(await gekozen(), `hoedje ${i} (${dx},${dy})`).toBe(String(i));
      await page.keyboard.press('Escape');
    }
  }
  await expect(page.locator('#drawSvg g[data-i]')).toHaveCount(7); // er is niets bijgekomen
  expect(fouten).toEqual([]);
});
