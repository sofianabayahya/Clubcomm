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

test('nummering: opstelling en nummerbalk gebruiken dezelfde nummers; bestaand nummer tikken kiest de speler', TAG, async ({ page }) => {
  const fouten = volgFouten(page);
  await open(page);
  await opstelling(page, '331|');
  const na = await spelers(page);
  expect(na.sort()).toEqual(['10', '2', '3', '5', '6', '8', '9', 'K']); // keeper = 1 (zoals de 1-4-3-3 van de balk)
  // Wie welk nummer heeft (liggend veld: eigen team verdedigt links): spits = 9 vooraan, 6 centraal middenveld, 3 centraal achter
  const plek = await page.evaluate(() => Object.fromEntries([...document.querySelectorAll('#drawSvg g[data-i]')].map((g) => [g.querySelector('text').textContent, +/translate\(([-\d.]+)/.exec(g.getAttribute('transform'))[1]])));
  expect(Math.max(...Object.values(plek))).toBe(plek['9']);
  expect(plek['3']).toBeLessThan(plek['6']); expect(plek['6']).toBeLessThan(plek['9']);
  await menuSpelers(page);
  await expect(page.locator('[data-nr="rood|1"]')).toHaveAttribute('aria-pressed', 'true'); // de keeper van het team telt als 1
  await expect(page.locator('[data-nr="rood|9"]')).toHaveAttribute('aria-pressed', 'true');
  await page.locator('[data-nr="rood|9"]').click();
  expect((await spelers(page)).length).toBe(8); // niets erbij, niets weg
  expect(await gekozenLabel(page)).toBe('9');
  await expect(page.locator('#drawSelBar')).toBeVisible();
  // Gekozen met de knop: de balk blijft "kiezen of neerzetten" (5 blijft gevuld = staat op het veld)
  await expect(page.locator('[data-nr="rood|5"]')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('[data-nr-ander]')).toBeVisible();
  // Op het veld gekozen: het getikte nummer gaat naar deze speler; andere bezette nummers zijn omrand
  await kiesSpeler(page, '9');
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
  // Speler 1 op het veld kiezen en bewust ook nummer 3 geven: geen ruil meer
  await kiesSpeler(page, '1');
  expect(await gekozenLabel(page)).toBe('1');
  await page.locator('[data-nr="rood|3"]').click();
  expect((await spelers(page)).sort()).toEqual(['2', '3', '3']);
  await page.keyboard.press('Escape'); await page.keyboard.press('Escape'); await page.keyboard.press('Escape'); // menu dicht, gereedschap uit, keuze weg
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

// Besluit 148, controle 1: bewust dubbel nummer. De nummerknop kiest eerst de speler die het eerst is neergezet;
// nog een keer tikken kiest de volgende met dat nummer, daarna weer de eerste. Kiezen verandert niets aan de gegevens.
const gekozenPlek = (page) => page.evaluate(() => { const g = document.querySelector('#drawSvg g[filter]'); return g ? g.getAttribute('transform') : null; });
const laadOud = async (page, oud) => {
  await page.setViewportSize({ width: 1366, height: 820 });
  await page.goto('/tekenen');
  await page.evaluate((d) => localStorage.setItem('cc-tekentool-test', JSON.stringify([{ data: d, tijd: new Date().toISOString() }])), oud);
  await page.goto('/tekenen');
  await page.locator('.tegel .beeld').click();
  await expect(page.locator('#drawOverlay')).toBeVisible();
};
test('nummering: bij een dubbel nummer kiest de knop voorspelbaar de eerste, dan de volgende', TAG, async ({ page }) => {
  const fouten = volgFouten(page);
  const oud = { field: 'vak', zoom: true, items: [
    { t: 'p', c: 'rood', n: 5, x: 100, y: 100 }, { t: 'p', c: 'geel', n: 5, x: 500, y: 100 }, { t: 'p', c: 'rood', n: 5, x: 140, y: 300 }, { t: 'p', c: 'rood', n: 7, x: 200, y: 200 } ] };
  await laadOud(page, oud);
  await menuSpelers(page);
  await expect(page.locator('[data-nr="rood|5"]')).toHaveAttribute('aria-label', /staat er 2 keer/);
  await page.locator('[data-nr="rood|5"]').click();
  expect(await gekozenPlek(page)).toBe('translate(100 100)'); // eerst neergezet
  await page.locator('[data-nr="rood|5"]').click();
  expect(await gekozenPlek(page)).toBe('translate(140 300)'); // de volgende, niet de 5 van de tegenstander
  await page.locator('[data-nr="rood|5"]').click();
  expect(await gekozenPlek(page)).toBe('translate(100 100)'); // weer de eerste
  // Vanaf een andere gekozen speler begint het weer bij de eerste
  await page.locator('[data-nr="rood|7"]').click();
  await page.locator('[data-nr="rood|7"]').click(); // enkel nummer: blijft gekozen, er verandert niets
  expect(await gekozenPlek(page)).toBe('translate(200 200)');
  expect((await spelers(page)).sort()).toEqual(['5', '5', '5', '7']);
  const d = await opslaan(page);
  expect(d.items).toEqual(oud.items); // alleen gekozen, niets gewijzigd
  expect(fouten).toEqual([]);
});

// Besluit 148, controle 2: de keeper uit Opstelling hoort bij zijn team en is nummer 1; een oude keeper zonder team telt
// nergens mee en blijft ongewijzigd.
test('nummering: keeper van het team telt als 1; oude keeper zonder team blijft gelijk', TAG, async ({ page }) => {
  const fouten = volgFouten(page);
  await open(page);
  await opstelling(page, '212|');   // eigen team: keeper (1) en 3, 4, 6, 8, 10
  await opstelling(page, '212|t');  // tegenstander: eigen keeper, telt niet voor rood
  await menuSpelers(page);
  await expect(page.locator('[data-nr="rood|1"]')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('[data-nr="geel|1"]')).toHaveAttribute('aria-pressed', 'true');
  await page.locator('[data-nr="rood|1"]').click();
  expect(await gekozenLabel(page)).toBe('K'); // nummer 1 kiest de keeper van het eigen team
  expect(await gekozenPlek(page)).not.toBe(null);
  await page.locator('.draw-fly-x').click();
  const veld = await page.locator('#drawSvg').boundingBox();
  await page.keyboard.press('1');
  await page.mouse.click(veld.x + veld.width * 0.5, veld.y + veld.height * 0.1);
  await page.mouse.click(veld.x + veld.width * 0.6, veld.y + veld.height * 0.1);
  const d = await opslaan(page);
  const rood = d.items.filter((x) => x.t === 'p' && x.c === 'rood').map((x) => x.n).sort((a, b) => a - b);
  expect(rood).toEqual([2, 3, 4, 5, 6, 8, 10]); // niet nog een 1: de keeper is 1
  expect(d.items.filter((x) => x.c === 'keeper').map((x) => x.team).sort()).toEqual(['geel', 'rood']);

  // Oude tekening: keeper zonder team. Telt niet mee, krijgt geen team en blijft precies gelijk.
  const oud = { field: 'liggend', zoom: true, items: [{ t: 'p', c: 'keeper', x: 60, y: 340 }, { t: 'p', c: 'rood', n: 2, x: 200, y: 340 }] };
  await laadOud(page, oud);
  await menuSpelers(page);
  await expect(page.locator('[data-nr="rood|1"]')).toHaveAttribute('aria-pressed', 'false');
  await page.locator('.draw-fly-x').click();
  await page.locator('[data-draw-select]').click(); // het menu Spelers zet het gereedschap aan; eerst uit
  const v2 = await page.locator('#drawSvg').boundingBox();
  await page.keyboard.press('1');
  await page.mouse.click(v2.x + v2.width * 0.5, v2.y + v2.height * 0.2);
  const d2 = await opslaan(page);
  expect(d2.items.slice(0, 2)).toEqual(oud.items); // oude keeper en speler ongewijzigd (geen team erbij)
  expect(d2.items[2]).toMatchObject({ t: 'p', c: 'rood', n: 1 });
  expect(fouten).toEqual([]);
});

// Besluit 148, controle 3: de nummering verandert niets aan aantikken op het veld. Op de telefoon zet een nummerknop nooit
// iets neer of haalt iets weg wanneer het nummer al bestaat, en Ongedaan maken herstelt een hernummering in één stap.
test('nummering: telefoon, nummerknoppen geven geen onbedoelde plaatsing of verwijdering', TAG, async ({ page }) => {
  const fouten = volgFouten(page);
  await open(page, false); // Pixel 5
  await opstelling(page, '331|');
  await menuSpelers(page);
  const voor = (await spelers(page)).sort();
  for (const n of [2, 9, 9, 1, 1]) await page.locator(`[data-nr="rood|${n}"]`).tap();
  expect((await spelers(page)).sort()).toEqual(voor); // vijf tikken op bestaande nummers: niets erbij, niets weg
  expect(await gekozenLabel(page)).toBe('K');
  // Met de knop gekozen (9), dan een vrij nummer (11): er komt een speler 11 bij, 9 houdt zijn nummer
  await page.locator('[data-nr="rood|9"]').tap();
  await expect(page.locator('.draw-nummers small').last()).toContainText('Gekozen: nummer 9');
  await page.locator('[data-nr="rood|11"]').tap();
  expect((await spelers(page)).sort()).toEqual([...voor, '11'].sort());
  await page.locator('#drawUndo').tap();
  expect((await spelers(page)).sort()).toEqual(voor);
  // Nummer wijzigen zonder het kleine rondje te raken: knop 9, dan Ander nummer… (7); Ongedaan maken in één stap
  await page.locator('[data-nr="rood|9"]').tap();
  page.once('dialog', (dl) => dl.accept('7'));
  await page.locator('[data-nr-ander]').tap();
  expect((await spelers(page)).sort()).toEqual(['10', '2', '3', '5', '6', '7', '8', 'K']);
  await page.locator('#drawUndo').tap();
  expect((await spelers(page)).sort()).toEqual(voor);
  expect(fouten).toEqual([]);
});

// Controles 2 (na bespreking met ChatGPT): invoer van Ander nummer…, meerdere keepers van één team, en een reeks
// wisselingen tussen kiezen met de knop, kiezen op het veld en een ander team.
test('nummering: Ander nummer… accepteert alleen hele getallen 1 tot en met 99; leeg = zonder nummer', TAG, async ({ page }) => {
  const fouten = volgFouten(page);
  await open(page);
  await menuSpelers(page);
  await page.locator('[data-nr="rood|4"]').click(); // speler 4 neerzetten
  await page.locator('[data-nr="rood|4"]').click(); // en kiezen
  const geef = async (tekst) => { page.once('dialog', (dl) => dl.accept(tekst)); await page.locator('[data-nr-ander]').click(); return page.evaluate(() => { const g = document.querySelector('#drawSvg g[filter]'); return g ? (g.querySelector('text') || { textContent: '' }).textContent : null; }); };
  for (const fout of ['12abc', '3.5', '0', '100', '-5', '1e1', 'abc', '7 8']) expect(await geef(fout), `invoer "${fout}"`).toBe('4'); // geweigerd, nummer blijft 4
  expect(await geef(' 14 ')).toBe('14'); // spaties eromheen mogen
  expect(await geef('99')).toBe('99');
  expect(await geef('1')).toBe('1');
  expect(await geef('')).toBe(''); // leeg = zonder nummer
  const d = await opslaan(page);
  expect(d.items.filter((x) => x.t === 'p').map((x) => x.n || 0)).toEqual([0]);
  expect(fouten).toEqual([]);
});

test('nummering: twee keepers van hetzelfde team (telling, kiezen, weergave)', TAG, async ({ page }) => {
  const fouten = volgFouten(page);
  await laadOud(page, { field: 'liggend', zoom: true, items: [
    { t: 'p', c: 'keeper', team: 'rood', x: 60, y: 300 }, { t: 'p', c: 'keeper', team: 'rood', x: 60, y: 400 }, { t: 'p', c: 'rood', n: 2, x: 200, y: 340 } ] });
  await menuSpelers(page);
  await expect(page.locator('[data-nr="rood|1"]')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('[data-nr="rood|1"]')).toHaveAttribute('aria-label', /staat er 2 keer/);
  await page.locator('[data-nr="rood|1"]').click();
  expect(await gekozenPlek(page)).toBe('translate(60 300)');
  await page.locator('[data-nr="rood|1"]').click();
  expect(await gekozenPlek(page)).toBe('translate(60 400)');
  await page.locator('[data-nr="rood|1"]').click();
  expect(await gekozenPlek(page)).toBe('translate(60 300)');
  // Met een keeper gekozen: een vrij nummer tikken zet een veldspeler neer, de keeper verandert niet
  await page.locator('[data-nr="rood|5"]').click();
  await page.locator('.draw-fly-x').click(); await page.locator('[data-draw-select]').click();
  const veld = await page.locator('#drawSvg').boundingBox();
  await page.keyboard.press('1');
  await page.mouse.click(veld.x + veld.width * 0.5, veld.y + veld.height * 0.15);
  const d = await opslaan(page);
  expect(d.items.filter((x) => x.c === 'keeper')).toEqual([{ t: 'p', c: 'keeper', team: 'rood', x: 60, y: 300 }, { t: 'p', c: 'keeper', team: 'rood', x: 60, y: 400 }]);
  expect(d.items.filter((x) => x.c === 'rood').map((x) => x.n).sort((a, b) => a - b)).toEqual([2, 3, 5]); // nieuw = 3, geen tweede 1
  expect(fouten).toEqual([]);
});

test('nummering: kiezen met de knop, op het veld, ander team, opnieuw een nummer: geen onbedoelde wijziging', TAG, async ({ page }) => {
  const fouten = volgFouten(page);
  await open(page);
  await menuSpelers(page);
  for (const n of [2, 3, 5]) await page.locator(`[data-nr="rood|${n}"]`).click();
  for (const n of [4, 9]) await page.locator(`[data-nr="geel|${n}"]`).click();
  const start = ['geel4', 'geel9', 'rood2', 'rood3', 'rood5'];
  const stand = () => page.evaluate(() => [...document.querySelectorAll('#drawSvg g[data-i]')].map((g) => ({ '#E53935': 'rood', '#F2D100': 'geel' }[g.querySelector('circle,path').getAttribute('fill')] + g.querySelector('text').textContent)).sort());
  // 1. kiezen met de knop (3), dan andere knoppen van hetzelfde team: kiezen, nooit hernummeren
  await page.locator('[data-nr="rood|3"]').click();
  await page.locator('[data-nr="rood|5"]').click();
  expect(await gekozenLabel(page)).toBe('5'); expect(await stand()).toEqual(start);
  // 2. knop van het andere team terwijl rood 5 met de knop gekozen is: kiest geel 9
  await page.locator('[data-nr="geel|9"]').click();
  expect(await gekozenLabel(page)).toBe('9'); expect(await stand()).toEqual(start);
  // 3. op het veld rood 2 kiezen, dan een knop van het andere team (geel 4): rood 2 blijft 2, geel 4 wordt gekozen
  await kiesSpeler(page, '2');
  await page.locator('[data-nr="geel|4"]').click();
  expect(await gekozenLabel(page)).toBe('4'); expect(await stand()).toEqual(start);
  // 4. weer met de knop (rood 2), dan een vrij nummer (rood 7): er komt een speler 7 bij, 2 blijft 2
  await page.locator('[data-nr="rood|2"]').click();
  await page.locator('[data-nr="rood|7"]').click();
  expect(await stand()).toEqual([...start, 'rood7'].sort());
  // 5. op het veld rood 7 kiezen en bewust nummer 8 geven: alleen dat is een hernummering
  await kiesSpeler(page, '7');
  await page.locator('[data-nr="rood|8"]').click();
  expect(await stand()).toEqual([...start, 'rood8'].sort());
  // 6. daarna met de knop rood 3 kiezen en geel 9: geen wijziging
  await page.locator('[data-nr="rood|3"]').click();
  await page.locator('[data-nr="geel|9"]').click();
  expect(await stand()).toEqual([...start, 'rood8'].sort());
  // 7. teamkleur van een gekozen speler wisselen (rood 3 → geel): eerste vrije geel nummer, daarna een rode knop wijzigt hem niet
  await page.locator('.draw-fly-x').click();
  await kiesOpVeld(page, '3');
  await page.locator('#drawKleur [data-kleur="geel"]').click();
  await page.locator('[data-rail="spelers"]').click();
  await page.locator('[data-nr="rood|5"]').click();
  expect(await stand()).toEqual(['geel1', 'geel4', 'geel9', 'rood2', 'rood5', 'rood8']);
  expect(await gekozenLabel(page)).toBe('5');
  expect(fouten).toEqual([]);
});
