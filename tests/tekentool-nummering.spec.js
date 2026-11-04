// Tekentool: rugnummers (reparatie 4-11, deels herziening van Besluit 124). Een speler is een object (zijn plek in de lijst),
// het rugnummer is een label dat je mag aanpassen en dat bewust dubbel mag, de teamkleur is apart, en het voorgestelde nummer
// is het eerste vrije nummer in het team. Een nummerknop verwijdert nooit; verwijderen gaat met Verwijderen en kan ongedaan.
const { test, expect } = require('@playwright/test');
const { volgFouten } = require('./hulp');

const TAG = { tag: ['@tekentool', '@training'] };
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
const menuSpelers = async (page) => { if (!(await page.locator('[data-nr="rood|1"]').isVisible())) await page.locator('[data-rail="spelers"]').click(); };
const opslaan = async (page) => { await page.locator('#drawSave').click(); await expect(page.locator('#drawOverlay')).toBeHidden({ timeout: 20000 }); return page.evaluate(() => JSON.parse(localStorage.getItem('cc-tekentool-test'))[0].data); };
const kiesSpeler = async (page, label) => {
  const xy = await page.evaluate((l) => { const g = [...document.querySelectorAll('#drawSvg g[data-i]')].find((x) => x.querySelector('text') && x.querySelector('text').textContent === l); const r = g.getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2]; }, label);
  await page.mouse.click(xy[0], xy[1]);
};

test('nummering: opstelling en nummerbalk gebruiken dezelfde nummers; bestaand nummer tikken kiest de speler', TAG, async ({ page }) => {
  const fouten = volgFouten(page);
  await open(page);
  await opstelling(page, '331|');
  const na = await spelers(page);
  expect(na.sort()).toEqual(['10', '2', '3', '5', '6', '8', '9', 'K']); // keeper = 1, spits = 9 (zoals de 1-4-3-3 van de balk)
  await menuSpelers(page);
  await expect(page.locator('[data-nr="rood|1"]')).toHaveAttribute('aria-pressed', 'true'); // de keeper van het team telt als 1
  await expect(page.locator('[data-nr="rood|9"]')).toHaveAttribute('aria-pressed', 'true');
  await page.locator('[data-nr="rood|9"]').click();
  expect((await spelers(page)).length).toBe(8); // niets erbij, niets weg
  expect(await gekozenLabel(page)).toBe('9');
  await expect(page.locator('#drawSelBar')).toBeVisible();
  // Met een gekozen speler: andere bezette nummers blijven zichtbaar (omrand)
  await expect(page.locator('[data-nr="rood|5"]')).toHaveClass(/bezet/);
  // Tegenstander erbij: zelfde nummers, eigen team
  await page.keyboard.press('Escape');
  await opstelling(page, '331|t');
  const d = await opslaan(page);
  const geel = d.items.filter((x) => x.t === 'p' && x.c === 'geel').map((x) => x.n).sort((a, b) => a - b);
  expect(geel).toEqual([2, 3, 5, 6, 8, 9, 10]);
  expect(d.items.filter((x) => x.c === 'keeper').map((x) => x.team).sort()).toEqual(['geel', 'rood']);
  expect(fouten).toEqual([]);
});

test('nummering: nieuwe speler krijgt het eerste vrije nummer, ook na verwijderen', TAG, async ({ page }) => {
  const fouten = volgFouten(page);
  await open(page);
  const veld = await page.locator('#drawSvg').boundingBox();
  await page.keyboard.press('1'); // speler rood, doorlopend plaatsen
  for (const fx of [0.3, 0.4, 0.5]) await page.mouse.click(veld.x + veld.width * fx, veld.y + veld.height * 0.5);
  expect(await spelers(page)).toEqual(['1', '2', '3']);
  await page.keyboard.press('Escape');
  await kiesSpeler(page, '2');
  await page.locator('#drawDelete').click(); // expliciet verwijderen
  expect(await spelers(page)).toEqual(['1', '3']);
  await page.keyboard.press('1');
  await page.mouse.click(veld.x + veld.width * 0.6, veld.y + veld.height * 0.5);
  expect((await spelers(page)).sort()).toEqual(['1', '2', '3']); // het gat wordt gevuld, niet 4
  // Dupliceren en een ander team kiezen geven ook het eerste vrije nummer
  await page.keyboard.press('Escape');
  await kiesSpeler(page, '3');
  await page.locator('#drawDup').click();
  expect((await spelers(page)).sort()).toEqual(['1', '2', '3', '4']);
  expect(fouten).toEqual([]);
});

test('nummering: bewust dubbel, ander nummer typen, verwijderen alleen met Verwijderen en ongedaan maken', TAG, async ({ page }) => {
  const fouten = volgFouten(page);
  await open(page);
  await menuSpelers(page);
  for (const n of [1, 2, 3]) await page.locator(`[data-nr="rood|${n}"]`).click();
  // Speler 1 kiezen en bewust ook nummer 3 geven: geen ruil meer
  await page.locator('[data-nr="rood|1"]').click();
  expect(await gekozenLabel(page)).toBe('1');
  await page.locator('[data-nr="rood|3"]').click();
  expect((await spelers(page)).sort()).toEqual(['2', '3', '3']);
  await page.keyboard.press('Escape'); await page.keyboard.press('Escape'); // menu dicht, dan keuze weg
  await menuSpelers(page);
  await expect(page.locator('[data-nr="rood|3"]')).toHaveAttribute('aria-label', /staat er 2 keer/);
  // Ander nummer (14) voor de gekozen speler
  await page.locator('[data-nr="rood|2"]').click();
  page.once('dialog', (dl) => dl.accept('14'));
  await page.locator('[data-nr-ander]').click();
  expect((await spelers(page)).sort()).toEqual(['14', '3', '3']);
  // Een knop van het andere team verandert de gekozen speler niet
  await page.locator('[data-nr="geel|0"]').click();
  expect((await spelers(page)).sort()).toEqual(['14', '3', '3']);
  // Verwijderen is een aparte handeling en kan ongedaan worden gemaakt
  await kiesSpeler(page, '14');
  await page.locator('#drawDelete').click();
  expect((await spelers(page)).sort()).toEqual(['3', '3']);
  await page.locator('#drawUndo').click();
  expect((await spelers(page)).sort()).toEqual(['14', '3', '3']);
  expect(fouten).toEqual([]);
});

test('nummering: op de telefoon kiest een bestaand nummer de speler (niet weg)', TAG, async ({ page }) => {
  const fouten = volgFouten(page);
  await open(page, false); // Pixel 5 uit de testinstellingen
  await opstelling(page, '212|');
  await menuSpelers(page);
  const voor = await spelers(page);
  const nr = voor.find((x) => x !== 'K');
  await page.locator(`[data-nr="rood|${nr}"]`).click();
  expect((await spelers(page)).sort()).toEqual(voor.sort());
  expect(await gekozenLabel(page)).toBe(nr);
  expect(fouten).toEqual([]);
});

test('nummering: een bestaande tekening blijft na openen en opslaan precies gelijk', TAG, async ({ page }) => {
  const fouten = volgFouten(page);
  // Oude tekening met alles wat in productie voorkomt: dubbel nummer, nummer 12, keeper zonder team, spelers zonder nummer, doelen M en S
  const oud = { field: 'vak', zoom: true, vormen: { rood: 't' }, items: [
    { t: 'p', c: 'rood', n: 5, x: 100, y: 100 }, { t: 'p', c: 'rood', n: 5, x: 140, y: 100 }, { t: 'p', c: 'geel', n: 12, x: 300, y: 200 },
    { t: 'p', c: 'keeper', x: 50, y: 280 }, { t: 'p', c: 'lichtblauw', x: 400, y: 300 }, { t: 'goal', s: 'M', x: 400, y: 30, r: 90 },
    { t: 'goal', s: 'S', x: 600, y: 300 }, { t: 'cone', c: 'oranje', x: 200, y: 200 }, { t: 'arrow', k: 'pass', x1: 100, y1: 100, x2: 300, y2: 200 } ] };
  await page.setViewportSize({ width: 1366, height: 820 });
  await page.goto('/tekenen');
  await page.evaluate((d) => localStorage.setItem('cc-tekentool-test', JSON.stringify([{ data: d, tijd: new Date().toISOString() }])), oud);
  await page.goto('/tekenen');
  const svgVoor = await page.evaluate(() => document.querySelector('.tegel svg').outerHTML);
  await page.locator('.tegel .beeld').click();
  await expect(page.locator('#drawOverlay')).toBeVisible();
  await menuSpelers(page); // nummerbalk tonen raakt de gegevens niet
  const d = await opslaan(page);
  expect(d.items).toEqual(oud.items);
  expect(d.field).toBe('vak'); expect(d.vormen).toEqual(oud.vormen);
  const svgNa = await page.evaluate(() => document.querySelector('.tegel svg').outerHTML);
  expect(svgNa.replace(/drawNet\w+|drawHead\w+/g, '')).toBe(svgVoor.replace(/drawNet\w+|drawHead\w+/g, ''));
  expect(fouten).toEqual([]);
});
