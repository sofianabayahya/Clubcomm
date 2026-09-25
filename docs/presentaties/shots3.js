const { chromium } = require('playwright'); const OUT = __dirname + '/shots/'; const URL = 'http://localhost:5070/';
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const demo = async (k, i) => { const ctx = await b.newContext({ viewport: { width: 390, height: 780 }, deviceScaleFactor: 2 }); const p = await ctx.newPage();
    await p.goto(URL + '?demo'); await p.waitForTimeout(600); await p.evaluate(() => { const S = CC.S(); S.club.naam = 'RKSV DCG'; CC.save(); });
    const id = await p.evaluate((k) => CC.S().demo[k], k); await p.click(`[data-pid="${id}"]`); await p.click('[data-act="magischeLink"]'); await p.waitForSelector('nav.nav'); await p.waitForTimeout(2600);
    await p.evaluate((i) => CC.wisselRol(i), i); await p.waitForTimeout(200); return [ctx, p]; };
  const weg = (p) => p.evaluate(() => [...document.querySelectorAll('[data-act]')].filter((e) => /Zet in mijn agenda|Taal/.test(e.textContent) && e.textContent.length < 160).forEach((e) => e.remove()));
  const shot = async (p, n) => { await weg(p); await p.waitForTimeout(250); await p.screenshot({ path: OUT + n + '.png' }); };
  { const [c, p] = await demo('linda', 0); await p.click('[data-act="profiel"]'); await p.waitForTimeout(300); await shot(p, 'tl-profiel'); await c.close(); }
  { const [c, p] = await demo('sanne', 0); await p.click('[data-act="profiel"]'); await p.waitForTimeout(300); await shot(p, 'ou-profiel');
    await p.evaluate(() => CC.closeSheet()); await p.click('nav.nav button[data-tab="planning"]'); await shot(p, 'ou-planning'); await c.close(); }
  { const [c, p] = await demo('mark', 0); await p.click('nav.nav button[data-tab="speeltijd"]'); await p.waitForTimeout(200); await p.click('[data-act="maakSchema"]'); await p.waitForTimeout(300);
    await p.evaluate(() => { const d = document.querySelector('details.uitklap'); window.scrollTo(0, d.getBoundingClientRect().top + window.scrollY - 70); }); await shot(p, 'tr-schema-tabel');
    await p.evaluate(() => window.scrollTo(0, 0)); await shot(p, 'tr-schema-live'); await c.close(); }
  await b.close();
})();
