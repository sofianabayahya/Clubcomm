// Besluit 150 (onder Besluit 149, regel 9): een melding veroorzaakt nooit een onbedoelde handeling. Hij vangt een tik zelf op
// (tik = sluiten, de knop doet zijn werk), vervaagt 0,25 s zichtbaar terwijl hij de tik nog opvangt, en blokkeert daarna niets meer.
// Een proefknop ligt precies onder de melding: die mag alleen reageren als er geen melding (meer) is.
const { test, expect } = require('@playwright/test');
const { volgFouten } = require('./hulp');

const start = async (page, breed = false) => {
  await page.setViewportSize(breed ? { width: 1366, height: 900 } : { width: 390, height: 844 });
  await page.goto('/?demo'); await page.evaluate(() => localStorage.clear()); await page.goto('/?demo');
  await page.locator('[data-act="demoLogin"][data-pid]').nth(1).click();
  await page.locator('[data-act="magischeLink"]').click();
  await expect(page.locator('nav.nav')).toBeVisible();
};
// Proefknop onder de plek van de melding, en twee proefacties voor Ongedaan maken
const proef = (page) => page.evaluate(() => {
  window.tel = { onder: 0, a: 0, b: 0 };
  CC.on('proefA', () => { window.tel.a++; }); CC.on('proefB', () => { window.tel.b++; });
  CC.toast('meten'); const r = document.getElementById('toast').getBoundingClientRect();
  const k = document.createElement('button'); k.id = 'onder'; k.textContent = 'onder';
  Object.assign(k.style, { position: 'fixed', left: `${r.left - 20}px`, top: `${r.top - 10}px`, width: `${r.width + 40}px`, height: `${r.height + 20}px`, zIndex: 50 });
  k.addEventListener('click', () => { window.tel.onder++; }); document.body.appendChild(k);
  return { x: r.left + 12, y: r.top + r.height / 2 };
});
const tel = (page) => page.evaluate(() => window.tel);
const zichtbaar = (page) => page.evaluate(() => document.getElementById('toast').classList.contains('show'));
const wacht = (page, ms) => page.waitForTimeout(ms);

test('melding: geen welkomstmelding na het inloggen', { tag: ['@schermen'] }, async ({ page }) => {
  await start(page);
  await wacht(page, 300);
  expect(await zichtbaar(page)).toBe(false);
  await expect(page.locator('#toast')).not.toContainText('Welkom');
});

for (const breed of [false, true]) {
  test(`melding: tik op of vlak na een melding bedient niets eronder (${breed ? '1366' : '390'} px)`, { tag: ['@schermen'] }, async ({ page }) => {
    const fouten = volgFouten(page);
    await start(page, breed);
    const p = await proef(page);
    await wacht(page, 3000); // meet-melding weg
    // S6: tik op het moment dat een melding verschijnt
    await page.evaluate(() => CC.toast('Opgeslagen'));
    await page.mouse.click(p.x, p.y);
    expect((await tel(page)).onder).toBe(0);
    // S1: tik op een zichtbare melding = sluiten, niets eronder
    await page.evaluate(() => CC.toast('Opgeslagen'));
    await page.mouse.click(p.x, p.y);
    expect((await tel(page)).onder).toBe(0);
    // S5: meteen nog een tik tijdens het vervagen (vinger was onderweg) = opgevangen
    await page.mouse.click(p.x, p.y);
    expect((await tel(page)).onder).toBe(0);
    // Daarna (na 0,25 s) gaat een gewone tik naar de inhoud: geen onzichtbare blokkade
    await wacht(page, 400);
    await page.mouse.click(p.x, p.y);
    expect((await tel(page)).onder).toBe(1);
    expect(fouten).toEqual([]);
  });
}

test('melding: Ongedaan maken, snel na elkaar en vanzelf verdwijnen (390 px)', { tag: ['@schermen'] }, async ({ page }) => {
  const fouten = volgFouten(page);
  await start(page);
  const p = await proef(page);
  await wacht(page, 3000);
  // S4: Ongedaan maken doet zijn werk en sluit de melding; niets eronder
  await page.evaluate(() => CC.toast('In A1 gezet', '', { knop: 'Ongedaan maken', act: 'proefA' }));
  await page.locator('#toast .toast-knop').click();
  expect(await tel(page)).toEqual({ onder: 0, a: 1, b: 0 });
  await wacht(page, 400);
  expect(await zichtbaar(page)).toBe(false);
  // Snel na elkaar: de tweede melding vervangt de eerste; Ongedaan maken hoort bij de laatste handeling
  await page.evaluate(() => { CC.toast('In A1 gezet', '', { knop: 'Ongedaan maken', act: 'proefA' }); CC.toast('In B1 gezet', '', { knop: 'Ongedaan maken', act: 'proefB' }); });
  await expect(page.locator('#toast')).toContainText('In B1 gezet');
  await page.locator('#toast .toast-knop').click();
  expect(await tel(page)).toEqual({ onder: 0, a: 1, b: 1 });
  // Een nieuwe melding tijdens het vervagen staat meteen weer helemaal (geen half verdwenen melding)
  await page.evaluate(() => CC.toast('Opgeslagen'));
  expect(await zichtbaar(page)).toBe(true);
  // Vanzelf verdwijnen na 2,6 s; daarna gaat een tik naar de inhoud
  await wacht(page, 3000);
  expect(await zichtbaar(page)).toBe(false);
  await page.mouse.click(p.x, p.y);
  expect((await tel(page)).onder).toBe(1);
  expect(fouten).toEqual([]);
});

test('melding: tabbalk en kop blijven bereikbaar terwijl er een melding staat (390 px)', { tag: ['@schermen'] }, async ({ page }) => {
  const fouten = volgFouten(page);
  await start(page);
  await page.evaluate(() => CC.toast('In A1 gezet', '', { knop: 'Ongedaan maken', act: 'x' }));
  await page.locator('nav.nav button[data-tab="berichten"]').click();
  await expect(page.locator('nav.nav button[data-tab="berichten"]')).toHaveAttribute('aria-current', 'page');
  await page.evaluate(() => CC.toast('Opgeslagen'));
  await page.locator('.rolknop').click();
  await expect(page.locator('.rolmenu')).toBeVisible();
  expect(fouten).toEqual([]);
});

test('melding: met Beperk beweging blijft hij zichtbaar zolang hij de tik opvangt', { tag: ['@schermen'] }, async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await start(page);
  await page.evaluate(() => CC.toast('Opgeslagen'));
  const r = await page.evaluate(() => { const b = document.getElementById('toast').getBoundingClientRect(); return { x: b.left + 12, y: b.top + b.height / 2 }; });
  await page.mouse.click(r.x, r.y); // sluiten: vervaagt
  // Elk moment tijdens het opvangen (klasse 'weg') is hij volledig zichtbaar
  const metingen = await page.evaluate(async () => { const t = document.getElementById('toast'); const o = [];
    for (let k = 0; k < 6; k++) { if (t.classList.contains('weg')) o.push(getComputedStyle(t).opacity); await new Promise((r) => requestAnimationFrame(r)); } return o; });
  expect(metingen.length).toBeGreaterThan(0);
  expect(metingen.every((x) => x === '1')).toBe(true);
});
