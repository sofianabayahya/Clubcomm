const { chromium } = require('playwright'); const fs = require('fs');
const OUT = __dirname + '/shots/'; const URL = 'http://localhost:5070/';
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const nieuw = async () => { const ctx = await b.newContext({ viewport: { width: 390, height: 780 }, deviceScaleFactor: 2 }); return [ctx, await ctx.newPage()]; };
  const shot = async (p, n, full) => { await p.waitForTimeout(350); await p.screenshot({ path: OUT + n + '.png', fullPage: !!full }); };
  const klik = async (p, sel) => { await p.click(sel); await p.waitForTimeout(250); };
  const sluit = async (p) => { await p.evaluate(() => CC.closeSheet()); await p.waitForTimeout(200); };
  const demo = async (k, rolIdx) => {
    const [ctx, p] = await nieuw(); await p.goto(URL + '?demo'); await p.waitForTimeout(600);
    await p.evaluate(() => { const S = CC.S(); S.club.naam = 'RKSV DCG'; CC.save(); });
    const id = await p.evaluate((k) => CC.S().demo[k], k);
    await p.click(`[data-pid="${id}"]`); await p.click('[data-act="magischeLink"]'); await p.waitForSelector('nav.nav'); await p.waitForTimeout(2600);
    await p.evaluate((i) => CC.wisselRol(i), rolIdx); await p.waitForTimeout(200); return [ctx, p];
  };
  const tab = (p, t) => klik(p, `nav.nav button[data-tab="${t}"]`);
  // --- echte (live) schermen met de nagebootste database: inloggen en aanmelden bij DCG
  { const [ctx, p] = await nieuw(); const rows = JSON.parse(fs.readFileSync(__dirname + '/rows.json')); const db = { rows: {}, lid: {}, user: null }; rows.forEach((r) => { db.rows[`dcg|${r.soort}|${r.id}`] = r; });
    await p.route('**/app/vendor/supabase.js', (r) => r.fulfill({ contentType: 'application/javascript', body: fs.readFileSync('/home/user/Clubcomm/supabase/tests/fake-supabase.js', 'utf8') }));
    await p.addInitScript((d) => { if (!sessionStorage.getItem('fake-sb-db')) sessionStorage.setItem('fake-sb-db', JSON.stringify(d)); }, db);
    await p.goto(URL + '#uitnodiging-O12-1'); await shot(p, 'live-aanmelden', true);
    await p.goto(URL); await p.evaluate(() => { location.hash = ''; }); await p.reload(); await p.waitForTimeout(500); await shot(p, 'live-login');
    await p.fill('#lm', 'sanne@voorbeeld.nl'); await klik(p, 'form[data-submit=liveMail] button'); await shot(p, 'live-code');
    await ctx.close(); }
  // --- teamleider
  { const [ctx, p] = await demo('linda', 0);
    await shot(p, 'tl-home'); await tab(p, 'wedstrijd'); await shot(p, 'tl-wedstrijd-vol', true);
    await klik(p, '[data-act="wedstrijdToevoegen"]'); await shot(p, 'tl-wedstrijd-toevoegen'); await sluit(p);
    await klik(p, '[data-act="wedstrijdAfgelast"]'); await shot(p, 'tl-afgelast'); await sluit(p);
    await klik(p, '[data-act="taakToevoegen"]').catch(() => {}); await shot(p, 'tl-taak-toevoegen'); await sluit(p);
    await tab(p, 'team'); await shot(p, 'tl-team-vol', true);
    await p.$eval('details.uitklap', (d) => { d.open = true; }).catch(() => {}); await shot(p, 'tl-team-vol-open', true);
    await klik(p, '[data-view="speler"]'); await shot(p, 'tl-contactkaart', true); await p.evaluate(() => CC.terug()); await p.waitForTimeout(200);
    await tab(p, 'berichten'); await klik(p, '[data-act="nieuwBericht"]'); await shot(p, 'tl-nieuw-bericht'); await sluit(p);
    await klik(p, '[data-act="profiel"]'); await shot(p, 'tl-profiel', true); await sluit(p);
    await ctx.close(); }
  // --- ouder
  { const [ctx, p] = await demo('sanne', 0);
    await shot(p, 'ou-home'); await klik(p, '[data-act="afmelden"]'); await shot(p, 'ou-afmelden'); await sluit(p);
    await klik(p, '[data-act="uitlegKaarten"]').catch(() => {}); await shot(p, 'ou-kaarten', true); await sluit(p);
    await klik(p, '[data-act="profiel"]'); await shot(p, 'ou-profiel', true); await sluit(p);
    await tab(p, 'berichten'); await klik(p, '[data-act="vraagStaf"]'); await shot(p, 'ou-vraag'); await sluit(p);
    await ctx.close(); }
  // --- trainer
  { const [ctx, p] = await demo('mark', 0);
    await shot(p, 'tr-home-vol', true); await tab(p, 'aanwezigheid'); await shot(p, 'tr-aanwezigheid-vol', true);
    await klik(p, '[data-act="planningAanpassen"]').catch(async () => { await tab(p, 'home'); await klik(p, '[data-act="planningAanpassen"]'); }); await shot(p, 'tr-planning'); await sluit(p);
    await tab(p, 'spelers'); await shot(p, 'tr-spelers'); await klik(p, '[data-act="uitnodigSheet"]').catch(() => {}); await shot(p, 'tr-uitnodigen'); await sluit(p);
    await klik(p, '[data-view="speler"]'); await shot(p, 'tr-speler', true); await p.evaluate(() => CC.terug()); await p.waitForTimeout(200);
    await tab(p, 'speeltijd'); await shot(p, 'tr-speeltijd-start'); await klik(p, '[data-act="maakSchema"]'); await shot(p, 'tr-speeltijd-schema', true);
    await ctx.close(); }
  await b.close();
})();
