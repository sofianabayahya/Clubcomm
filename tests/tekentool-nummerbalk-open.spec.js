// ClubComm — Besluit NNN: met het paneel Spelers open een speler op het veld tikken houdt het paneel open en kiest die speler,
// zodat het volgende nummer meteen naar hem gaat (eerder ging het paneel dicht). Een leeg stuk veld sluit het paneel (Besluit 152).
const { test, expect } = require('@playwright/test');
const { volgFouten } = require('./hulp');

const TAG = { tag: ['@tekentool', '@training'] };
// Besluit 156: het paneel toont één team tegelijk. Eerst het team kiezen (als het nog niet aan staat), dan het nummer.
const nr = async (page, kleur, n, hoe = 'click') => {
  const t = page.locator(`[data-team="${kleur}"]`);
  if ((await t.getAttribute('aria-pressed')) !== 'true') await t[hoe]();
  await page.locator(`[data-nr="${kleur}|${n}"]`)[hoe]();
};
const open = async (page, breed = true) => {
  if (breed) await page.setViewportSize({ width: 1366, height: 820 });
  await page.goto('/tekenen'); await page.evaluate(() => localStorage.clear()); await page.goto('/tekenen');
  await page.locator('#nieuw').click();
  await expect(page.locator('#drawOverlay')).toBeVisible();
};
// Spelers op het veld als "kleur+nummer" (keeper: "keeper:team"), gesorteerd
const spelers = (page) => page.evaluate(() => [...document.querySelectorAll('#drawSvg g[data-i]')].map((g) => (g.querySelector('text') || {}).textContent).filter(Boolean));
const gekozenLabel = (page) => page.evaluate(() => { const g = document.querySelector('#drawSvg g[filter]'); return g && g.querySelector('text') ? g.querySelector('text').textContent : null; });
const opstelling = async (page, code) => { await page.locator('summary', { hasText: 'Opstelling' }).click(); await page.locator(`[data-draw-form="${code}"]`).click(); };
const menuSpelers = async (page) => { if (!(await page.locator('#drawFly.draw-fly-spelers').isVisible())) await page.locator('[data-rail="spelers"]').click(); };
const opslaan = async (page) => { await page.locator('#drawSave').click(); await expect(page.locator('#drawOverlay')).toBeHidden({ timeout: 20000 }); return page.evaluate(() => JSON.parse(localStorage.getItem('cc-tekentool-test'))[0].data); };
// Speler op het veld aanklikken. Het menu Spelers ligt deels over het veld: eerst dicht, daarna weer open.
const kiesSpeler = async (page, label) => {
  const menuOpen = await page.locator('#drawFly').isVisible();
  if (menuOpen) await page.locator('.draw-fly-x').click();
  await kiesOpVeld(page, label);
  if (menuOpen) await page.locator('[data-rail="spelers"]').click();
};
const kiesOpVeld = async (page, label) => {
  const xy = await page.evaluate((l) => { const g = [...document.querySelectorAll('#drawSvg g[data-i]')].find((x) => x.querySelector('text') && x.querySelector('text').textContent === l); const r = g.getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2]; }, label);
  await page.mouse.click(xy[0], xy[1]);
};


for (const [w, h] of [[390, 844], [1366, 820]]) {
  test(`nummerbalk blijft open bij een andere speler (${w} px)`, TAG, async ({ page }) => {
    const fouten = volgFouten(page);
    await page.setViewportSize({ width: w, height: h });
    await open(page, false);
    await menuSpelers(page);
    await nr(page, 'rood', 9); await nr(page, 'rood', 7); // aanvallers: rechts op het veld, niet onder het paneel op de laptop
    expect((await spelers(page)).sort()).toEqual(['7', '9']);
    // Speler 9 op het veld tikken: het paneel blijft open, 9 is gekozen
    await kiesOpVeld(page, '9');
    await expect(page.locator('#drawFly.draw-fly-spelers')).toBeVisible();
    expect(await gekozenLabel(page)).toBe('9');
    // Meteen een nummer: speler 9 wordt 10 (zonder eerst Spelers te tikken)
    await nr(page, 'rood', 10);
    expect((await spelers(page)).sort()).toEqual(['10', '7']);
    // Nog een speler tikken en een nummer: ook zonder het paneel opnieuw te openen
    await kiesOpVeld(page, '7');
    await expect(page.locator('#drawFly.draw-fly-spelers')).toBeVisible();
    await nr(page, 'rood', 11);
    expect((await spelers(page)).sort()).toEqual(['10', '11']);
    // Een leeg stuk veld sluit het paneel en zet niets neer (Besluit 152)
    const box = await page.locator('#drawSvg').boundingBox();
    await page.mouse.click(box.x + 12, box.y + 12);
    await expect(page.locator('#drawFly')).toBeHidden();
    expect((await spelers(page)).sort()).toEqual(['10', '11']);
    expect(fouten).toEqual([]);
  });
}
