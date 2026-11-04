// Tekentool, Besluit 156: paneel Spelers met één team tegelijk (zes teamkleuren, rondje of driehoek), op de telefoon vast
// onderaan zodat het veld zichtbaar blijft, compacte bovenbalk en een tip die weggetikt blijft.
const { test, expect } = require('@playwright/test');
const { volgFouten } = require('./hulp');

const TAG = { tag: ['@tekentool', '@training'] };
const open = async (page, breed = true) => {
  if (breed) await page.setViewportSize({ width: 1366, height: 820 });
  await page.goto('/tekenen'); await page.evaluate(() => localStorage.clear()); await page.goto('/tekenen');
  await page.locator('#nieuw').click();
  await expect(page.locator('#drawOverlay')).toBeVisible();
};
const opslaan = async (page) => { await page.locator('#drawSave').click(); await expect(page.locator('#drawOverlay')).toBeHidden({ timeout: 20000 }); return page.evaluate(() => JSON.parse(localStorage.getItem('cc-tekentool-test'))[0].data); };
// Waar staat het veld en waar begint het paneel (in schermpunten)
const plaats = (page) => page.evaluate(() => {
  const svg = document.querySelector('#drawSvg'), vb = svg.viewBox.baseVal, m = svg.getScreenCTM(), f = document.querySelector('#drawFly').getBoundingClientRect();
  return { veldBoven: m.f, veldOnder: m.f + vb.height * m.d, paneelBoven: f.top, paneelOnder: f.bottom, scherm: innerHeight };
});

test('paneel: zes teams, nummers voor elk team, rondje of driehoek per team (laptop)', TAG, async ({ page }) => {
  const fouten = volgFouten(page);
  await open(page);
  await page.locator('[data-rail="spelers"]').click();
  await expect(page.locator('[data-team]')).toHaveCount(6);
  await expect(page.locator('[data-vorm-kies]')).toHaveCount(2); // alleen rondje en driehoek
  await expect(page.locator('[data-team="rood"]')).toHaveAttribute('aria-pressed', 'true');
  // Oranje: standaard rondje; nummer 3 op het veld
  await page.locator('[data-team="oranje"]').click();
  await expect(page.locator('.draw-team-kop b')).toHaveText('Oranje');
  await expect(page.locator('[data-vorm-kies="c"]')).toHaveAttribute('aria-pressed', 'true');
  await page.locator('[data-nr="oranje|3"]').click();
  await expect(page.locator('#drawSvg g[data-i] circle[fill="#FFA000"]')).toHaveCount(1);
  // Roze: standaard driehoek; wisselen naar rondje wordt bewaard
  await page.locator('[data-team="roze"]').click();
  await expect(page.locator('[data-vorm-kies="t"]')).toHaveAttribute('aria-pressed', 'true');
  await page.locator('[data-nr="roze|0"]').click();
  await expect(page.locator('#drawSvg g[data-i] path[fill="#F06292"]')).toHaveCount(1);
  await page.locator('[data-vorm-kies="c"]').click();
  await expect(page.locator('#drawSvg g[data-i] circle[fill="#F06292"]')).toHaveCount(1);
  // Losse speler in het gekozen team: knop, dan het veld
  await page.locator('[data-team="oranje"]').click();
  await page.locator('.draw-los-knop').click();
  await expect(page.locator('.draw-los-knop')).toHaveClass(/active/);
  const s = await page.locator('#drawSvg').boundingBox();
  await page.mouse.click(s.x + s.width * 0.85, s.y + s.height * 0.85);
  const d = await opslaan(page);
  expect(d.items.filter((x) => x.t === 'p').map((x) => `${x.c}${x.n || ''}`).sort()).toEqual(['oranje1', 'oranje3', 'roze']);
  expect(d.vormen).toEqual({ roze: 'c' });
  expect(fouten).toEqual([]);
});

test('paneel: het team volgt de gekozen speler; kleur wijzigen kan ook naar oranje en roze', TAG, async ({ page }) => {
  const fouten = volgFouten(page);
  await open(page);
  await page.locator('[data-rail="spelers"]').click();
  await page.locator('[data-team="geel"]').click();
  await page.locator('[data-nr="geel|9"]').click(); // neerzetten
  await page.locator('[data-team="rood"]').click();
  await page.locator('[data-nr="geel|9"]').count().then((n) => expect(n).toBe(0)); // één team tegelijk
  // Geel 9 op het veld aantikken: het paneel springt naar Tegenstander
  await page.locator('.draw-fly-x').click();
  await page.locator('#drawSvg g[data-i]').click();
  await page.locator('[data-rail="spelers"]').click();
  await expect(page.locator('[data-team="geel"]')).toHaveAttribute('aria-pressed', 'true');
  // Kleur wijzigen onder het veld: ook oranje en roze
  await expect(page.locator('#drawKleur [data-kleur="oranje"]')).toHaveCount(1);
  await expect(page.locator('#drawKleur [data-kleur="roze"]')).toHaveCount(1);
  await page.locator('#drawKleur [data-kleur="roze"]').click();
  await expect(page.locator('[data-team="roze"]')).toHaveAttribute('aria-pressed', 'true');
  expect(fouten).toEqual([]);
});

test('paneel: telefoon 390 px, paneel onderaan, veld volledig zichtbaar, compacte bovenbalk', TAG, async ({ page }) => {
  const fouten = volgFouten(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await open(page, false);
  await page.locator('#drawPhoneX').tap();
  const balk = await page.locator('.draw-top').boundingBox();
  expect(balk.height).toBeLessThanOrEqual(120); // twee regels
  await expect(page.locator('#drawUndo')).toHaveAccessibleName(/Ongedaan maken/);
  await page.locator('[data-rail="spelers"]').tap();
  const p = await plaats(page);
  expect(Math.round(p.paneelOnder)).toBe(p.scherm); // vast onderaan
  expect(p.veldOnder).toBeLessThanOrEqual(p.paneelBoven + 1); // het hele veld boven het paneel
  expect(p.veldBoven).toBeGreaterThan(balk.height);
  // Een nummer tikken: de speler is meteen zichtbaar op het veld (niet onder het paneel)
  await page.locator('[data-nr="rood|9"]').tap();
  const sp = await page.locator('#drawSvg g[data-i]').boundingBox();
  expect(sp.y + sp.height).toBeLessThan(p.paneelBoven);
  // Menu dicht: geen ruimte meer gereserveerd
  await page.locator('.draw-fly-x').tap();
  await expect(page.locator('#drawOverlay .draw-stage')).not.toHaveClass(/paneel-open/);
  expect(fouten).toEqual([]);
});

test('paneel: kleine telefoon (360 px) en gekanteld, elke knop bereikbaar', TAG, async ({ page }) => {
  const fouten = volgFouten(page);
  for (const vp of [{ width: 360, height: 780 }, { width: 844, height: 390 }]) {
    await page.setViewportSize(vp);
    await open(page, false);
    await page.locator('[data-rail="spelers"]').tap();
    await page.locator('[data-team="geel"]').tap();
    await page.locator('[data-nr="geel|11"]').tap();
    await page.locator('[data-draw-tool][aria-label="Keeper"]').tap(); // onderste regel van het paneel
    await expect(page.locator('#drawSvg g[data-i]')).toHaveCount(1);
  }
  expect(fouten).toEqual([]);
});

test('paneel: de tip op de telefoon blijft weg na wegtikken', TAG, async ({ page }) => {
  const fouten = volgFouten(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await open(page, false);
  await expect(page.locator('#drawPhone')).toBeVisible();
  await page.locator('#drawPhoneX').tap();
  await page.locator('#drawCancel').tap();
  await page.locator('#nieuw').tap();
  await expect(page.locator('#drawOverlay')).toBeVisible();
  await expect(page.locator('#drawPhone')).toBeHidden();
  expect(fouten).toEqual([]);
});
