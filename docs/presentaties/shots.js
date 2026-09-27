const { chromium } = require('playwright');
const OUT = __dirname + '/shots/';
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const who = process.argv[2] ? process.argv[2].split(',') : ['sanne', 'mark', 'linda', 'peter'];
  for (const k of who) {
    const ctx = await b.newContext({ viewport: { width: 390, height: 780 }, deviceScaleFactor: 2 });
    const p = await ctx.newPage();
    await p.goto('http://localhost:5070/?demo'); await p.waitForTimeout(600);
    await p.evaluate(() => { const S = CC.S(); S.club.naam = 'RKSV DCG'; CC.save(); });
    const id = await p.evaluate((k) => CC.S().demo[k], k);
    await p.click(`[data-pid="${id}"]`); await p.click('[data-act="magischeLink"]'); await p.waitForSelector('nav.nav'); await p.waitForTimeout(2500);
    const n = await p.evaluate(() => CC.me().rollen.length);
    for (let i = 0; i < n; i++) {
      await p.evaluate((i) => CC.wisselRol(i), i); await p.waitForTimeout(200);
      const rol = await p.evaluate(() => CC.rol().rol);
      for (const t of await p.$$eval('nav.nav button', (bs) => bs.map((x) => x.dataset.tab))) {
        await p.click(`nav.nav button[data-tab="${t}"]`); await p.waitForTimeout(200);
        await p.screenshot({ path: `${OUT}${k}-${rol}-${t}.png` });
      }
    }
    await ctx.close();
  }
  await b.close();
})();
