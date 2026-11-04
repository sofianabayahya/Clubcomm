// Tekentool, Besluit NNN: kleur wijzigen met een tikvlak van 44 px, en de tip op de telefoon wijkt zolang het paneel
// Spelers open is (het veld blijft dan volledig zichtbaar, ook de eerste keer).
const { test, expect } = require('@playwright/test');
const { volgFouten } = require('./hulp');

const TAG = { tag: ['@tekentool', '@training'] };
const open = async (page, vp) => {
  await page.setViewportSize(vp);
  await page.goto('/tekenen'); await page.evaluate(() => localStorage.clear()); await page.goto('/tekenen');
  await page.locator('#nieuw').click();
  await expect(page.locator('#drawOverlay')).toBeVisible();
};

test('kleur wijzigen: elk kleurrondje heeft een tikvlak van 44 px en werkt', TAG, async ({ page }) => {
  const fouten = volgFouten(page);
  for (const vp of [{ width: 1366, height: 820 }, { width: 390, height: 844 }]) {
    await open(page, vp);
    if (await page.locator('#drawPhoneX').isVisible()) await page.locator('#drawPhoneX').click();
    await page.locator('[data-rail="spelers"]').click();
    await page.locator('[data-nr="rood|6"]').click();
    await page.locator('[data-nr="rood|6"]').click(); // kiezen
    await page.locator('.draw-fly-x').click(); // paneel dicht: de balk onder het veld (staand op de telefoon ligt die nu onder het paneel)
    const knoppen = page.locator('#drawKleur [data-kleur]');
    await expect(knoppen).toHaveCount(6);
    for (const b of await knoppen.all()) {
      const r = await b.boundingBox();
      expect(r.width, `breed ${vp.width}`).toBeGreaterThanOrEqual(44); expect(r.height, `hoog ${vp.width}`).toBeGreaterThanOrEqual(44);
    }
    await expect(page.locator('#drawKleur [data-kleur="rood"]')).toHaveAttribute('aria-pressed', 'true');
    await page.locator('#drawKleur [data-kleur="blauw"]').click();
    await expect(page.locator('#drawSvg g[data-i] path[fill="#1E88E5"]')).toHaveCount(1); // blauw = driehoek
    await expect(page.locator('#drawKleur [data-kleur="blauw"]')).toHaveAttribute('aria-pressed', 'true');
  }
  expect(fouten).toEqual([]);
});

test('telefoon: de tip wijkt voor het paneel Spelers en komt daarna terug (tot je hem wegtikt)', TAG, async ({ page }) => {
  const fouten = volgFouten(page);
  await open(page, { width: 390, height: 844 });
  await expect(page.locator('#drawPhone')).toBeVisible();
  await page.locator('[data-rail="spelers"]').click();
  await expect(page.locator('#drawPhone')).toBeHidden();
  const p = await page.evaluate(() => { const svg = document.querySelector('#drawSvg'), vb = svg.viewBox.baseVal, m = svg.getScreenCTM(); return { B: m.f + vb.height * m.d, P: document.querySelector('#drawFly').getBoundingClientRect().top }; });
  expect(p.B).toBeLessThanOrEqual(p.P + 1); // het hele veld boven het paneel, ook de eerste keer
  await page.locator('.draw-fly-x').click();
  await expect(page.locator('#drawPhone')).toBeVisible(); // niet weggetikt: de tip komt terug
  expect(await page.evaluate(() => localStorage.getItem('cc-draw-tip'))).toBe(null);
  expect(fouten).toEqual([]);
});

// Besluit NNN (B): op de telefoon staand staan Kopie en Weg in de kop van het paneel Spelers; de balk onder het veld lag daar
// achter het paneel. Het veld blijft helemaal boven het paneel. Laptop: de balk onder het veld zoals het was.
test('telefoon: Kopie en Weg in de kop van het paneel, het veld blijft zichtbaar', TAG, async ({ page }) => {
  const fouten = volgFouten(page);
  await open(page, { width: 390, height: 844 });
  await page.locator('#drawPhoneX').click();
  await page.locator('.draw-menu summary', { hasText: 'Opstelling' }).click(); await page.locator('[data-draw-form="331|"]').click();
  await page.locator('[data-rail="spelers"]').click();
  await expect(page.locator('#drawFlyH')).toHaveText('Spelers');
  await expect(page.locator('[data-paneel-weg]')).toHaveCount(0);
  await page.locator('[data-nr="rood|6"]').click(); // kiest speler 6
  await expect(page.locator('#drawFlyH')).toHaveText('Speler 6');
  await expect(page.locator('[data-paneel-dup]')).toBeVisible();
  await expect(page.locator('[data-paneel-weg]')).toHaveAccessibleName('Verwijderen');
  await expect(page.locator('#drawSelBar')).toBeHidden();
  const p = await page.evaluate(() => { const svg = document.querySelector('#drawSvg'), vb = svg.viewBox.baseVal, m = svg.getScreenCTM(); return { B: m.f + vb.height * m.d, P: document.querySelector('#drawFly').getBoundingClientRect().top }; });
  expect(p.B).toBeLessThanOrEqual(p.P + 1);
  const aantal = () => page.locator('#drawSvg g[data-i]').count();
  const voor = await aantal();
  await page.locator('[data-paneel-weg]').click();
  expect(await aantal()).toBe(voor - 1);
  await expect(page.locator('#drawFlyH')).toHaveText('Spelers');
  await page.locator('#drawUndo').click();
  expect(await aantal()).toBe(voor);
  await page.locator('[data-nr="rood|6"]').click();
  await page.locator('[data-paneel-dup]').click();
  expect(await aantal()).toBe(voor + 1);
  expect(fouten).toEqual([]);
});

test('laptop: geen Kopie en Weg in het paneel, de balk onder het veld blijft', TAG, async ({ page }) => {
  const fouten = volgFouten(page);
  await open(page, { width: 1366, height: 820 });
  await page.locator('[data-rail="spelers"]').click();
  await page.locator('[data-nr="rood|6"]').click(); await page.locator('[data-nr="rood|6"]').click();
  await expect(page.locator('#drawFlyH')).toHaveText('Speler 6');
  await expect(page.locator('[data-paneel-weg]')).toBeHidden();
  await expect(page.locator('#drawSelBar')).toBeVisible();
  await expect(page.locator('#drawDelete')).toBeVisible();
  expect(fouten).toEqual([]);
});
