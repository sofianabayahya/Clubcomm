const { chromium } = require('playwright'); const OUT = __dirname + '/shots/'; const URL = 'http://localhost:5070/';
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const demo = async (k, i) => { const ctx = await b.newContext({ viewport: { width: 390, height: 780 }, deviceScaleFactor: 2 }); const p = await ctx.newPage();
    await p.goto(URL + '?demo'); await p.waitForTimeout(600); await p.evaluate(() => { const S = CC.S(); S.club.naam = 'RKSV DCG'; CC.save(); });
    const id = await p.evaluate((k) => CC.S().demo[k], k); await p.click(`[data-pid="${id}"]`); await p.click('[data-act="magischeLink"]'); await p.waitForSelector('nav.nav'); await p.waitForTimeout(2600);
    await p.evaluate((i) => CC.wisselRol(i), i); await p.waitForTimeout(200); return [ctx, p]; };
  { const [c, p] = await demo('sanne', 0);
    await p.evaluate(() => { const bt = document.createElement('button'); bt.dataset.act = 'uitlegKaarten'; bt.id = 'xk'; document.body.appendChild(bt); }); await p.$eval('#xk', (e) => e.click()); await p.waitForTimeout(400);
    await p.screenshot({ path: OUT + 'ou-kaarten.png' }); await c.close(); }
  { const [c, p] = await demo('mark', 0); await p.click('nav.nav button[data-tab="spelers"]'); await p.waitForTimeout(200);
    await p.click('[data-view="speler"]'); await p.waitForTimeout(400);
    await p.evaluate(() => { const el = [...document.querySelectorAll('h2,h3,.sectie,.klein-kop')].find((e) => /ouders/i.test(e.textContent)); if (el) window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - 80); });
    await p.waitForTimeout(300); await p.screenshot({ path: OUT + 'tr-speler.png' }); await c.close(); }
  await b.close();
})();
