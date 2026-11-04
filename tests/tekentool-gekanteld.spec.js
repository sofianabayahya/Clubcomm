// Tekentool, Besluit 157: telefoon gekanteld (breed, lager dan 500 px). Rail links, bovenbalk op één regel, het veld past
// in de hoogte en het paneel Spelers ligt rechts naast het veld. Staand en laptop blijven gelijk (Besluit 156).
const { test, expect } = require('@playwright/test');
const { volgFouten } = require('./hulp');

const TAG = { tag: ['@tekentool', '@training'] };
const GEKANTELD = [{ width: 667, height: 375 }, { width: 780, height: 360 }, { width: 844, height: 390 }];
const open = async (page, vp) => {
  await page.setViewportSize(vp);
  await page.goto('/tekenen'); await page.evaluate(() => localStorage.clear()); await page.goto('/tekenen');
  await page.locator('#nieuw').tap();
  await expect(page.locator('#drawOverlay')).toBeVisible();
};
// Waar staan veld, paneel, rail en bovenbalk (schermpunten)
const plaats = (page) => page.evaluate(() => {
  const svg = document.querySelector('#drawSvg'), vb = svg.viewBox.baseVal, m = svg.getScreenCTM(), f = document.querySelector('#drawFly');
  const fr = f && !f.hidden ? f.getBoundingClientRect() : null, rail = document.querySelector('#drawTools').getBoundingClientRect();
  return { L: m.e, R: m.e + vb.width * m.a, T: m.f, B: m.f + vb.height * m.d, W: innerWidth, H: innerHeight,
    paneel: fr && { L: fr.left, R: fr.right, T: fr.top, B: fr.bottom }, rail: { w: rail.width, h: rail.height, R: rail.right }, balk: document.querySelector('.draw-top').getBoundingClientRect().height };
});

test('gekanteld: het hele veld zichtbaar, rail links, bovenbalk op één regel', TAG, async ({ page }) => {
  const fouten = volgFouten(page);
  for (const vp of GEKANTELD) {
    await open(page, vp);
    for (const veld of ['liggend', 'staand', 'half', 'vak']) {
      await page.locator('#drawVeldMenu summary').tap(); await page.locator(`[data-draw-field="${veld}"]`).tap();
      const p = await plaats(page);
      expect(p.T, `${vp.width} ${veld} boven`).toBeGreaterThanOrEqual(p.balk - 1);
      expect(p.B, `${vp.width} ${veld} onder`).toBeLessThanOrEqual(p.H + 1);
      expect(p.L, `${vp.width} ${veld} links`).toBeGreaterThanOrEqual(p.rail.R - 1);
      expect(p.R, `${vp.width} ${veld} rechts`).toBeLessThanOrEqual(p.W + 1);
    }
    const p = await plaats(page);
    expect(p.balk).toBeLessThanOrEqual(60); // één regel
    expect(p.rail.w).toBeLessThan(100); expect(p.rail.h).toBeGreaterThan(p.rail.w); // rail staat links
    await expect(page.locator('#drawHint')).toBeHidden();
    await expect(page.locator('#drawPhone')).toBeHidden();
  }
  expect(fouten).toEqual([]);
});

test('gekanteld: paneel Spelers rechts naast het veld, elke knop bereikbaar', TAG, async ({ page }) => {
  const fouten = volgFouten(page);
  for (const vp of GEKANTELD) {
    await open(page, vp);
    await page.locator('[data-rail="spelers"]').tap();
    const p = await plaats(page);
    expect(Math.round(p.paneel.R)).toBe(p.W); // tegen de rechterrand
    expect(p.paneel.T).toBeGreaterThanOrEqual(p.balk - 1); // onder de bovenbalk
    expect(p.R).toBeLessThanOrEqual(p.paneel.L + 1); // het veld ligt ernaast, niet eronder
    expect(p.B).toBeLessThanOrEqual(p.H + 1);
    // Een nummer tikken: de speler is zichtbaar naast het paneel
    await page.locator('[data-nr="rood|9"]').tap();
    const sp = await page.locator('#drawSvg g[data-i]').boundingBox();
    expect(sp.x + sp.width).toBeLessThan(p.paneel.L);
    // De onderste knoppen van het paneel zijn bereikbaar (het paneel scrolt)
    await page.locator('[data-team="geel"]').tap();
    await page.locator('[data-nr="geel|11"]').tap();
    await page.locator('[data-draw-tool][aria-label="Keeper"]').tap();
    await expect(page.locator('[data-draw-tool][aria-label="Keeper"]')).toHaveClass(/active/);
  }
  expect(fouten).toEqual([]);
});

test('gekanteld: draaien met het paneel open, en staand blijft zoals in Besluit 156', TAG, async ({ page }) => {
  const fouten = volgFouten(page);
  await open(page, { width: 390, height: 844 });
  await page.locator('#drawPhoneX').tap(); // tip weg (zoals in de tests van Besluit 156)
  await page.locator('[data-rail="spelers"]').tap();
  let p = await plaats(page);
  expect(Math.round(p.paneel.B)).toBe(p.H); // staand: onderaan
  expect(p.B).toBeLessThanOrEqual(p.paneel.T + 1);
  // Kantelen
  await page.setViewportSize({ width: 844, height: 390 });
  await expect.poll(async () => (await plaats(page)).R <= (await plaats(page)).paneel.L + 1).toBe(true);
  p = await plaats(page);
  expect(p.B).toBeLessThanOrEqual(p.H + 1);
  // Terug naar staand
  await page.setViewportSize({ width: 390, height: 844 });
  await expect.poll(async () => { const q = await plaats(page); return q.B <= q.paneel.T + 1 && Math.round(q.paneel.B) === q.H; }).toBe(true);
  expect(fouten).toEqual([]);
});
