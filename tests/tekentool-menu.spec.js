// Tekentool, Besluit 152: een menu sluiten zet niets onbedoeld neer. × = klaar (gereedschap uit); het menu Spelers zet bij
// openen geen gereedschap aan. De snelle route uit Besluit 126 (Hoedjes, dan het veld = hoedje) blijft.
const { test, expect } = require('@playwright/test');
const { volgFouten } = require('./hulp');

const TAG = { tag: ['@tekentool', '@training'] };
const MENUS = ['spelers', 'hoedjes', 'schijfjes', 'doelen', 'pijlen', 'markeren'];
const open = async (page, breed = true) => {
  if (breed) await page.setViewportSize({ width: 1366, height: 820 });
  await page.goto('/tekenen'); await page.evaluate(() => localStorage.clear()); await page.goto('/tekenen');
  await page.locator('#nieuw').click();
  await expect(page.locator('#drawOverlay')).toBeVisible();
  if (await page.locator('#drawPhoneX').isVisible()) await page.locator('#drawPhoneX').click();
};
const aantal = (page) => page.locator('#drawSvg [data-i]').count();
// Een lege plek op het veld die niet onder het menu ligt
const legePlek = async (page) => {
  const s = await page.locator('#drawSvg').boundingBox();
  const f = (await page.locator('#drawFly').isVisible()) ? await page.locator('#drawFly').boundingBox() : null;
  return [[0.85, 0.85], [0.5, 0.92], [0.92, 0.5]].map(([fx, fy]) => [s.x + s.width * fx, s.y + s.height * fy])
    .find(([x, y]) => !f || x < f.x || x > f.x + f.width || y < f.y || y > f.y + f.height);
};

test('menu: sluiten met × en dan op het veld tikken zet niets neer (laptop, elk menu)', TAG, async ({ page }) => {
  const fouten = volgFouten(page);
  page.on('dialog', (d) => d.dismiss());
  await open(page);
  for (const m of MENUS) {
    await page.locator(`[data-rail="${m}"]`).click();
    await page.locator('.draw-fly-x').click();
    const [x, y] = await legePlek(page);
    await page.mouse.click(x, y);
    expect(await aantal(page), `menu ${m}`).toBe(0);
  }
  expect(fouten).toEqual([]);
});

test('menu: telefoon, sluiten met × en dan tikken zet niets neer (elk menu)', TAG, async ({ page }) => {
  const fouten = volgFouten(page);
  page.on('dialog', (d) => d.dismiss());
  await open(page, false); // Pixel 5
  for (const m of MENUS) {
    await page.locator(`[data-rail="${m}"]`).tap();
    await page.locator('.draw-fly-x').tap();
    const [x, y] = await legePlek(page);
    await page.touchscreen.tap(x, y);
    expect(await aantal(page), `menu ${m}`).toBe(0);
  }
  expect(fouten).toEqual([]);
});

test('menu Spelers: op het veld tikken sluit het menu en zet niets neer; kleur kiezen en dan het veld wel', TAG, async ({ page }) => {
  const fouten = volgFouten(page);
  await open(page);
  await page.locator('[data-rail="spelers"]').click();
  await expect(page.locator('[data-draw-tool="0"]')).not.toHaveClass(/active/); // niets aan bij openen
  let [x, y] = await legePlek(page);
  await page.mouse.click(x, y);
  await expect(page.locator('#drawFly')).toBeHidden();
  expect(await aantal(page)).toBe(0);
  // Bewust een losse speler: kleur tikken, dan het veld
  await page.locator('[data-rail="spelers"]').click();
  await page.locator('[data-draw-tool="0"]').click();
  await expect(page.locator('[data-draw-tool="0"]')).toHaveClass(/active/);
  [x, y] = await legePlek(page);
  await page.mouse.click(x, y);
  expect(await aantal(page)).toBe(1);
  await expect(page.locator('#drawSvg g[data-i] text')).toHaveText('1'); // eerste vrije nummer (Besluit 148)
  // Sneltoets 1 werkt zoals voorheen
  await page.keyboard.press('Escape');
  await page.keyboard.press('1');
  await page.mouse.click(x - 60, y);
  expect(await aantal(page)).toBe(2);
  expect(fouten).toEqual([]);
});

test('menu: snelle route blijft (Hoedjes, dan het veld = hoedje); Spelers daarna zet het hoedjesgereedschap uit', TAG, async ({ page }) => {
  const fouten = volgFouten(page);
  await open(page);
  await page.locator('[data-rail="hoedjes"]').click();
  let [x, y] = await legePlek(page);
  await page.mouse.click(x, y); // sluit het menu én zet een hoedje neer (Besluit 126)
  expect(await aantal(page)).toBe(1);
  await page.mouse.click(x - 40, y); // gereedschap blijft aan: nog een hoedje
  expect(await aantal(page)).toBe(2);
  // Nu Spelers openen en op het veld tikken: geen hoedje en geen speler erbij
  await page.locator('[data-rail="spelers"]').click();
  [x, y] = await legePlek(page);
  await page.mouse.click(x - 80, y);
  expect(await aantal(page)).toBe(2);
  expect(fouten).toEqual([]);
});
