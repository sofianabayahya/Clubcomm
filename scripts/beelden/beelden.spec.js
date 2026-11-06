// ClubComm — schermafbeeldingen voor de functiekaarten (docs/handleiding) en de snelstart-pdf's.
// Draaien: npm run beelden (daarna maakt scripts/beelden/pdfs.mjs de pdf's opnieuw). Alleen de demo (VV De Voorbeeldclub)
// en verzonnen tekeningen; de bestandsnamen blijven gelijk, zodat de kaarten er gewoon naar blijven wijzen.
const { test, expect, devices } = require('@playwright/test');

const B = 'docs/presentaties/beelden/';
const jpg = (page, naam, clip) => page.screenshot({ path: B + naam, type: 'jpeg', quality: 88, ...(clip ? { clip } : {}) });
const toestel = (naam) => { const { defaultBrowserType, ...d } = devices[naam]; return d; };
const p = (c, n, x, y, extra) => ({ t: 'p', c, n, x, y, ...extra });

// ---------- Training: Voorbereiden, Kies oefenvorm, Vormen (functiekaarten training-voorbereiden.md en vormenbank.md) ----------
const VORMEN = {
  kaats: [{ t: 'goal', x: 150, y: 30 }, p('geel', 1, 150, 40), p('rood', 9, 150, 130), p('rood', 10, 120, 160), { t: 'ball', x: 115, y: 168 }, { t: 'arrow', x1: 120, y1: 160, x2: 150, y2: 130 }, { t: 'arrow', x1: 150, y1: 130, x2: 150, y2: 50 }],
  partij: [{ t: 'cone', c: 'oranje', x: 40, y: 40 }, { t: 'cone', c: 'oranje', x: 260, y: 40 }, { t: 'cone', c: 'oranje', x: 40, y: 200 }, { t: 'cone', c: 'oranje', x: 260, y: 200 }, p('rood', 2, 100, 70), p('rood', 9, 150, 120), p('blauw', 3, 200, 80), p('blauw', 10, 160, 160), { t: 'ball', x: 158, y: 128 }],
  driehoek: [p('rood', 1, 150, 50), p('rood', 2, 100, 150), p('rood', 3, 200, 150), { t: 'cone', c: 'geel', x: 150, y: 70 }, { t: 'ball', x: 108, y: 158 }],
  rondo: [{ t: 'cone', c: 'oranje', x: 100, y: 60 }, { t: 'cone', c: 'oranje', x: 200, y: 60 }, { t: 'cone', c: 'oranje', x: 100, y: 160 }, { t: 'cone', c: 'oranje', x: 200, y: 160 }, p('rood', 6, 150, 60), p('rood', 2, 100, 110), p('rood', 4, 200, 110), p('rood', 8, 150, 160), p('geel', 9, 150, 110), { t: 'ball', x: 110, y: 120 }],
};
// Demo als trainer Mark (O10-1), trainingsmodule aan, vier vormen en een training met drie vormen
const demo = async (page, hoogte) => {
  await page.setViewportSize({ width: 390, height: hoogte });
  await page.goto('/?demo'); await page.evaluate(() => localStorage.clear()); await page.goto('/?demo');
  await page.locator('[data-act="demoLogin"][data-pid]').nth(1).click();
  await page.locator('[data-act="magischeLink"]').click();
  await expect(page.locator('nav.nav')).toBeVisible();
  await page.evaluate((items) => { const S = CC.S(); const ik = CC.me().id; S.club.modules.training = true;
    CC.wisselRol(CC.me().rollen.findIndex((r) => r.rol === 'trainer'));
    const v = (id, naam, extra) => ({ id, eigenaar: ik, aantallen: [], varianten: [], ...extra, naam });
    S.vormen = [
      v('v1', 'Afwerken na een kaats', { type: 'afwerk', spelersMin: 6, spelersMax: 12, duur: 12, tekening: { field: 'vak', items: items.kaats } }),
      v('v2', 'Partij 5 tegen 5', { type: 'partij', spelersMin: 8, spelersMax: 12, duur: 20, tekening: { field: 'vak', items: items.partij } }),
      v('v3', 'Passen in driehoek', { type: 'droog', spelersMin: 6, spelersMax: 12, duur: 8, tekening: { field: 'vak', items: items.driehoek } }),
      v('v4', 'Rondo 4 tegen 1', { type: 'rondo', spelersMin: 5, spelersMax: 10, duur: 10, afmeting: '10 × 10 m', doel: 'De bal rond houden met korte passes.', organisatie: 'Vier spelers aan de buitenkant, één in het midden\nNa een onderschepping wisselen', coach: 'Open staan voor de bal\nPass naar de verre voet', tekening: { field: 'vak', items: items.rondo } }),
    ];
    const tid = CC.teamId(); const a = S.acts.filter((x) => x.teamId === tid && x.soort === 'training' && x.datum >= CC.date.vandaag()).sort((x, y) => x.datum.localeCompare(y.datum))[0];
    S.trainingsplannen = [{ id: 'tp1', actId: a.id, teamId: tid, datum: a.datum, eigenaar: ik, thema: '', leerdoelen: [], onderdelen: [{ id: 'o1', vormId: 'v3', min: 8 }, { id: 'o2', vormId: 'v4', min: 10 }, { id: 'o3', vormId: 'v2', min: 20 }] }];
    (CC.ui.seg = CC.ui.seg || {}).aanwAct = a.id;
    CC.save(); CC.render(); }, VORMEN);
  await page.locator('nav.nav button[data-tab="aanwezigheid"]').click();
};
const rustig = async (page) => { await page.mouse.move(2, 2); await page.evaluate(() => document.activeElement && document.activeElement.blur()); await page.waitForTimeout(300); };

test.describe('training', () => {
  test.use({ deviceScaleFactor: 2 });
  test('Voorbereiden en Kies oefenvorm', async ({ page }) => {
    await demo(page, 1100);
    await page.locator('[data-act="seg"][data-val="plannen"]').click(); await page.waitForTimeout(4000); // meldingen weg
    await rustig(page); await jpg(page, 'training-plannen.jpg');
    await page.setViewportSize({ width: 390, height: 844 });
    await page.locator('[data-act="tpVormKiezen"]').first().click(); await page.waitForTimeout(500);
    await rustig(page); await jpg(page, 'training-kies-oefenvorm.jpg');
  });
  test('Vormen: lijst en een vorm', async ({ page }) => {
    await demo(page, 844);
    await page.locator('[data-act="seg"][data-val="vormen"]').click(); await page.waitForTimeout(4000);
    await rustig(page); await jpg(page, 'vormenbank-lijst.jpg');
    await page.evaluate(() => [...document.querySelectorAll('#app [data-act="vormOpen"]')].find((b) => b.textContent.includes('Rondo 4 tegen 1')).click());
    await page.waitForTimeout(600); await rustig(page); await jpg(page, 'vormenbank-vorm.jpg');
  });
});

// ---------- Tekentool (functiekaart tekentool.md) ----------
const VOL = [p('keeper', undefined, 60, 340, { team: 'rood' }), p('rood', 3, 170, 340), p('rood', 5, 190, 160), p('rood', 2, 190, 520), p('rood', 6, 300, 340), p('rood', 10, 300, 190), p('rood', 8, 300, 490), p('rood', 9, 420, 340),
  p('geel', 9, 560, 340), p('geel', 6, 680, 340), p('geel', 3, 800, 340), p('keeper', undefined, 915, 340, { team: 'geel' }), p('geel', 10, 670, 190), p('geel', 5, 770, 160), p('geel', 8, 670, 490), p('geel', 2, 770, 520)];
const VIER = [p('rood', 1, 60, 340), p('rood', 4, 150, 270), p('rood', 3, 150, 390), p('rood', 2, 165, 500)];
const HOED = [{ t: 'cone', c: 'oranje', x: 250, y: 18 }, { t: 'cone', c: 'oranje', x: 750, y: 18 }, { t: 'cone', c: 'oranje', x: 250, y: 662 }, { t: 'cone', c: 'oranje', x: 750, y: 662 }];
const teken = async (page, items) => {
  await page.goto('/?demo'); await page.waitForFunction(() => window.DrawTool);
  await page.evaluate((items) => window.DrawTool.open({ field: 'liggend', items }, () => {}), items);
  await page.waitForTimeout(400);
  if (await page.locator('#drawPhoneX').isVisible().catch(() => false)) await page.locator('#drawPhoneX').click();
};
const tikItem = async (page, i) => { const b = await page.evaluate((i) => { const r = document.querySelectorAll('#drawSvg [data-i]')[i].getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; }, i); await page.touchscreen.tap(b.x, b.y); };

test.describe('tekentool telefoon (Pixel 5)', () => {
  test.use(toestel('Pixel 5'));
  test('Spelers, Hoedjes en Kies', async ({ page }) => {
    const clip = { x: 0, y: 0, width: 393, height: 727 };
    await teken(page, VIER);
    await page.locator('[data-rail="spelers"]').tap(); await page.waitForTimeout(300);
    await jpg(page, 'tekentool-tel-spelers.jpg', clip);
    await page.locator('#drawFly .draw-fly-x').tap().catch(() => {});
    await page.locator('[data-rail="hoedjes"]').tap(); await page.waitForTimeout(300);
    await jpg(page, 'tekentool-tel-hoedjes.jpg', clip);
    await teken(page, [...VIER, ...HOED]);
    await page.locator('[data-rail="kies"]').tap().catch(() => {}); await page.waitForTimeout(200);
    await tikItem(page, 5); await page.waitForTimeout(300);
    await jpg(page, 'tekentool-tel-kies.jpg', clip);
  });
});
test.describe('tekentool telefoon staand', () => {
  test.use({ ...toestel('iPhone 12'), viewport: { width: 390, height: 844 } });
  test('speler 9 gekozen', async ({ page }) => {
    await teken(page, VOL);
    await tikItem(page, 7); await page.waitForTimeout(300);
    await page.locator('[data-rail="spelers"]').tap(); await page.waitForTimeout(300);
    await tikItem(page, 7); await page.waitForTimeout(300);
    await jpg(page, 'tekentool-telefoon.jpg');
  });
});
test.describe('tekentool telefoon gekanteld', () => {
  test.use({ ...toestel('iPhone 12 landscape'), viewport: { width: 844, height: 390 } });
  test('paneel rechts', async ({ page }) => {
    await teken(page, VOL);
    await page.locator('[data-rail="spelers"]').tap(); await page.waitForTimeout(300);
    await jpg(page, 'tekentool-gekanteld.jpg');
  });
});
test.describe('tekentool laptop', () => {
  test.use({ viewport: { width: 1366, height: 820 }, deviceScaleFactor: 2, isMobile: false, hasTouch: false });
  test('paneel Spelers', async ({ page }) => {
    await teken(page, VOL);
    await page.locator('[data-rail="spelers"]').click(); await page.waitForTimeout(300);
    await page.mouse.move(1300, 800);
    await jpg(page, 'tekentool-laptop.jpg');
  });
});
