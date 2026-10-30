// ClubComm — DEMO Swift (branch demo/swift-trainer, nooit naar main). Bewijst:
// 1. isolatie: geen enkel verzoek buiten de eigen site, de productiedatabase is in de code niet te vinden, CSP blokkeert het;
// 2. simulatie altijd herkenbaar (banner, rand, titel) en eerlijk over e-mail;
// 3. de route van de trainer (voorbereiden, vorm maken en tekenen, opslaan, wijzigen, reflectie) en wat de HJO ziet;
// 4. veilig bij verversen, uitloggen, wisselen van identiteit en stand; 'Alles wissen' laat niets achter.
// De vergelijking van de demo-rechten met de echte database staat in supabase/tests/demo-rechten.sh.
const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const PROD = ['pkvacwbdgumkffxnxnqk', 'supabase.co', 'supabase.in', 'sb_publishable_', 'clubcomm.vercel.app', 'clubcomm-sofian8', 'api.brevo.com', 'sendinblue.com', 'onesignal.com'];
const ISOLATIE = async (page) => {
  const buiten = []; const alle = [];
  await page.route('**/*', (r) => { const u = new URL(r.request().url()); alle.push(u.host); if (!['localhost:5055'].includes(u.host)) { buiten.push(r.request().url()); return r.abort(); } return r.continue(); });
  page.on('websocket', (ws) => buiten.push('websocket ' + ws.url()));
  return { buiten, alle };
};
const fouten = (page) => { const f = []; page.on('pageerror', (e) => f.push(e.message)); page.on('console', (m) => { if (m.type() === 'error' && !/versie\.json/.test(m.location().url || '')) f.push(m.text()); }); return f; };
const inloggen = async (page, email) => {
  await page.fill('#lm', email); await page.locator('#lm').press('Enter');
  await expect(page.locator('#app')).toContainText('Simulatie: er is geen mail verstuurd');
  await page.fill('#lc', '123456'); await page.locator('#lc').press('Enter');
  await expect(page.locator('nav.nav')).toBeVisible();
};
const uitloggen = async (page) => { await page.evaluate(() => CC.logout()); await expect(page.locator('#lm')).toBeVisible(); };
const herkenbaar = async (page) => {
  await expect(page.locator('#demo-banner')).toContainText('SIMULATIE');
  await expect(page.locator('#demo-rand')).toBeVisible();
  await expect(page).toHaveTitle(/SIMULATIE/);
};
const db = (page) => page.evaluate(() => JSON.parse(JSON.stringify(window.DEMO_SWIFT.db.rows)));

test.describe('Demo Swift (simulatie)', () => {
  test.beforeEach(async ({ page }) => { await page.setViewportSize({ width: 390, height: 844 }); });

  test('isolatie: de code bevat geen productiedatabase, sleutel of server', () => {
    const lijst = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? lijst(path.join(d, e.name)) : [path.join(d, e.name)]));
    const public_ = path.join(__dirname, '..', 'public');
    const treffers = lijst(public_).filter((f) => /\.(js|html|json|webmanifest|css)$/.test(f)).flatMap((f) => { const t = fs.readFileSync(f, 'utf8').toLowerCase(); return PROD.filter((p) => t.includes(p.toLowerCase())).map((p) => `${path.relative(public_, f)}: ${p}`); });
    expect(treffers).toEqual([]);
    const cfg = fs.readFileSync(path.join(public_, 'app', 'config.js'), 'utf8');
    expect(cfg).toMatch(/url: 'https:\/\/demo\.invalid'/);
    const vercel = JSON.parse(fs.readFileSync(path.join(public_, 'vercel.json'), 'utf8'));
    // Preview toegestaan (akkoord 30-10); de isolatie hangt niet van Vercel af maar van config, bibliotheek en CSP
    expect(JSON.stringify(vercel.headers)).toContain("connect-src 'self'");
    expect(fs.readFileSync(path.join(public_, 'index.html'), 'utf8')).toContain('<meta http-equiv="Content-Security-Policy" content="connect-src \'self\'');
  });

  test('isolatie: de browser kan de productie-API niet bereiken (CSP), ook niet met een eigen verzoek', async ({ page }) => {
    const iso = await ISOLATIE(page);
    await page.goto('/');
    const uit = await page.evaluate(async () => { const r = []; for (const u of ['https://pkvacwbdgumkffxnxnqk.supabase.co/rest/v1/rij', 'https://mijnclubcomm.nl/versie.json', 'https://example.com/']) { try { await fetch(u); r.push('bereikt ' + u); } catch (e) { r.push('geblokkeerd'); } } return r; });
    expect(uit).toEqual(['geblokkeerd', 'geblokkeerd', 'geblokkeerd']);
    expect(iso.buiten).toEqual([]); // CSP houdt het al in de browser tegen: het verzoek komt niet eens bij het netwerk
  });

  test('route trainer en HJO: alleen de eigen site, herkenbaar, veilig bij verversen, uitloggen en wisselen', async ({ page }) => {
    test.setTimeout(90000);
    const iso = await ISOLATIE(page); const f = fouten(page);
    page.on('dialog', (d) => d.accept());
    await page.goto('/'); await herkenbaar(page);

    // --- Demo Trainer: alleen de rol trainer ---
    await inloggen(page, 'trainer@demo.invalid'); await herkenbaar(page);
    expect(await page.evaluate(() => CC.me().rollen.map((r) => r.rol))).toEqual(['trainer']);
    await expect(page.locator('nav.nav button[data-tab]')).toHaveText(['Home', 'Training', 'Berichten']);
    // Trainingsdagen: twee trainingen en een wedstrijd per week
    await page.locator('nav.nav button[data-tab="aanwezigheid"]').click(); await herkenbaar(page);
    const dagen = await page.locator('#app .tr-dagknop, #app [data-act="seg"][data-val^="demo-"]').allInnerTexts();
    expect(dagen.join(' ')).toMatch(/DI.*DO.*ZA/s);
    // Training voorbereiden: vorm kiezen → nieuwe vorm → tekenen → opslaan
    await page.locator('[data-act="seg"][data-val="plannen"]').click();
    await page.locator('[data-act="tpNieuw"]').first().click();
    await page.locator('[data-act="tpVormKiezen"]').first().click();
    await page.locator('#sheet [data-act="vormNieuw"]').click();
    await page.fill('#v-n', 'Demo: rondo 4 tegen 2'); await page.locator('#v-n').press('Tab');
    await page.locator('[data-act="vormTeken"]').click();
    await expect(page.locator('#drawOverlay')).toBeVisible();
    await page.locator('[data-rail="spelers"]').click(); await page.locator('[data-nr="rood|6"]').click();
    await page.locator('#drawSave').click(); await expect(page.locator('#drawOverlay')).toBeHidden({ timeout: 20000 });
    await page.locator('[data-act="terug"]').click();
    await expect(page.locator('#app')).toContainText('Demo: rondo 4 tegen 2');
    await expect.poll(async () => Object.values(await db(page)).filter((r) => r.soort === 'vormen').map((r) => `${r.scope}|${r.persoon_id}|${(r.data.tekening || { items: [] }).items.length}`).join()).toBe('eigen|demo-trainer|1');
    await expect.poll(async () => Object.values(await db(page)).filter((r) => r.soort === 'trainingsplannen').map((r) => `${r.scope}|${r.persoon_id}`).join()).toBe('eigen|demo-trainer');
    // Verversen: alles staat er nog, de trainer blijft ingelogd
    await page.reload(); await expect(page.locator('nav.nav')).toBeVisible(); await herkenbaar(page);
    expect(await page.evaluate(() => CC.me().naam)).toBe('Demo Trainer');
    await page.locator('nav.nav button[data-tab="aanwezigheid"]').click(); await page.locator('[data-act="seg"][data-val="vormen"]').click();
    await expect(page.locator('#app')).toContainText('Demo: rondo 4 tegen 2');
    // Wijzigen: de naam van de vorm aanpassen
    await page.locator('.tr-kaart', { hasText: 'Demo: rondo' }).click(); await page.locator('#sheet [data-act="vormBewerk"]').click();
    await page.fill('#v-n', 'Demo: rondo 4 tegen 2 (aangepast)'); await page.locator('#v-n').press('Tab'); await page.locator('[data-act="terug"]').click();
    await expect.poll(async () => Object.values(await db(page)).filter((r) => r.soort === 'vormen').map((r) => r.data.naam).join()).toBe('Demo: rondo 4 tegen 2 (aangepast)');
    // Reflectie: het verslag van de HJO lezen en de reflectie invullen
    await page.locator('nav.nav button[data-tab="home"]').click();
    await page.locator('#app [data-view="begelVerslag"]').first().click();
    await expect(page.locator('#app')).toContainText('Eerst kijken, dan coachen');
    await page.locator('#app textarea[name="r1"]').fill('Demo-reflectie: ik stop het spel te vaak');
    await page.locator('#app form[data-submit="begelReflectieOk"] button.knop').click();
    await expect.poll(async () => { const r = (await db(page))['begeleidZelf|demo-bm1']; return r ? `${r.scope}|${r.persoon_id}|${r.data.r.r1}` : ''; }).toBe('trainerzelf|demo-trainer|Demo-reflectie: ik stop het spel te vaak');
    // De trainer ziet geen werkaantekeningen van de HJO en geen gegevens van de HJO zelf
    const zichtT = await page.evaluate(() => window.DEMO_SWIFT.zicht('demo-trainer'));
    expect(zichtT.some((k) => k.startsWith('trainerNotities|'))).toBe(false);
    await uitloggen(page); await herkenbaar(page);

    // --- Demo HJO: HO + trainer (rolwisselaar) ---
    await inloggen(page, 'hjo@demo.invalid');
    expect(await page.evaluate(() => CC.me().rollen.map((r) => CC.rolNaam(r)))).toEqual(['HO', 'Trainer']);
    await page.evaluate(() => CC.wisselRol(0)); await herkenbaar(page);
    await page.evaluate(() => CC.open('trainerDetail', { id: 'demo-trainer' }));
    await expect(page.locator('#app')).toContainText('Vaste coachmomenten');
    // De HJO ziet de reflectie van de trainer (begeleider), maar niet zijn trainingen en vormen (alleen de maker)
    const zichtH = await page.evaluate(() => window.DEMO_SWIFT.zicht('demo-hjo'));
    expect(zichtH).toContain('begeleidZelf|demo-bm1');
    expect(zichtH.some((k) => k.startsWith('vormen|') || k.startsWith('trainingsplannen|'))).toBe(false);
    expect(await page.evaluate(() => CC.S().vormen.length)).toBe(0);
    // Wisselen naar Trainer: zelfde account, dus dezelfde databaserechten als HO (zie demo-rechten.sh)
    await page.evaluate(() => CC.wisselRol(1)); await herkenbaar(page);
    await expect(page.locator('nav.nav button[data-tab]')).toHaveText(['Home', 'Training', 'Berichten']);
    await expect(page.locator('#app')).not.toContainText('Demo: rondo'); // de vormen van Demo Trainer zijn van hem
    await uitloggen(page);

    // --- Andere stand: eigen opslag, raakt 'Swift nu' niet ---
    await page.goto('/?stand=knvb'); await expect(page.locator('#demo-banner')).toContainText('Swift KNVB — concept');
    await inloggen(page, 'trainer@demo.invalid');
    expect(Object.values(await db(page)).filter((r) => r.soort === 'vormen')).toHaveLength(0);
    await uitloggen(page);
    await page.goto('/?stand=nu');
    await inloggen(page, 'trainer@demo.invalid');
    expect(Object.values(await db(page)).filter((r) => r.soort === 'vormen')).toHaveLength(1);

    // --- Alles wissen: niets blijft achter ---
    await page.locator('#demo-wis').click();
    await expect(page.locator('#lm')).toBeVisible();
    // De app zet bij het opstarten zelf weer een lege sessie en cache neer; daarin mag niets van de demo-inhoud staan
    const rest = await page.evaluate(() => ({ sleutels: Object.keys(localStorage).filter((k) => k.startsWith('demo-swift-db')), alles: Object.values(localStorage).join(' ') + Object.values(sessionStorage).join(' ') }));
    expect(rest.sleutels).toEqual([]);
    for (const spoor of ['rondo', 'Demo-reflectie', 'demo-trainer', 'Demo Trainer', 'Demo HJO']) expect(rest.alles).not.toContain(spoor);

    expect(iso.buiten, 'verzoeken buiten de eigen site').toEqual([]);
    expect([...new Set(iso.alle)]).toEqual(['localhost:5055']);
    expect(f).toEqual([]);
  });

  test('stand KNVB — concept: elk onderdeel heet concept; de stand Swift nu heeft geen profiel', async ({ page }) => {
    const iso = await ISOLATIE(page);
    await page.goto('/?stand=nu'); await inloggen(page, 'hjo@demo.invalid');
    expect(await page.evaluate(() => Object.keys(CC.S().profielen || {}))).toEqual([]);
    await uitloggen(page);
    await page.goto('/?stand=knvb'); await inloggen(page, 'trainer@demo.invalid');
    const pr = await page.evaluate(() => Object.values(CC.S().profielen || {})[0]);
    expect(pr.naam).toMatch(/CONCEPT/);
    const namen = [...pr.onderdelen.teamfuncties.items, ...pr.onderdelen.leerlijnen.items].map((x) => x.naam);
    expect(namen.every((n) => /concept/.test(n))).toBe(true);
    expect(pr.onderdelen.evaluatie.vragen.every((n) => /concept/.test(n))).toBe(true);
    expect(pr.onderdelen.spelprincipes.status).toBe('leeg'); expect(pr.onderdelen.leerdoelenPerLeeftijd.status).toBe('leeg');
    expect(iso.buiten).toEqual([]);
  });

  test('bouwindeling: Bovenbouw vanaf O14 kan met de bestaande instelling (alleen de clubbeheerder ziet dat scherm)', async ({ page }) => {
    await ISOLATIE(page);
    await page.goto('/?stand=nu'); await inloggen(page, 'hjo@demo.invalid');
    const r = await page.evaluate(() => { const S = CC.S(); const t = S.teams.find((x) => x.id === 'demo-o15'); const voor = CC.bouwVan(S, t).naam;
      S.club.bouwen = [{ naam: 'Onderbouw', van: 6, tot: 9 }, { naam: 'Middenbouw', van: 10, tot: 13 }, { naam: 'Bovenbouw', van: 14, tot: 19 }];
      const na = CC.bouwVan(S, t).naam; const o14 = CC.bouwVan(S, { cat: 'O14' }).naam; const o13 = CC.bouwVan(S, { cat: 'O13' }).naam;
      const ho = { rollen: [{ rol: 'hjo', bouwen: ['Bovenbouw'] }] }; const inGebied = CC.inWerkgebied(S, 'demo-o15', ho);
      return { voor, na, o14, o13, inGebied }; });
    expect(r).toEqual({ voor: 'Middenbouw', na: 'Bovenbouw', o14: 'Bovenbouw', o13: 'Middenbouw', inGebied: true });
  });

  // Gegevens voor de vergelijking met de echte database (supabase/tests/demo-rechten.sh): alle rijen na de route + het oordeel
  // van de demo per identiteit per rij (lezen en schrijven).
  test('rechten: uitvoer voor de vergelijking met de echte regels', async ({ page }) => {
    const uit = process.env.DEMO_RECHTEN_UIT; test.skip(!uit, 'alleen via supabase/tests/demo-rechten.sh');
    await page.goto('/?stand=knvb'); await inloggen(page, 'trainer@demo.invalid');
    const r = await page.evaluate(() => { const D = window.DEMO_SWIFT;
      // Ook rijen die in de route ontstaan: een vorm en training van de trainer, een werkaantekening van de HJO, een reflectie
      const zet = (x) => { D.db.rows[`${x.soort}|${x.id}`] = { club_id: D.club, team_id: null, speler_id: null, persoon_id: null, act_id: null, ...x }; };
      zet({ soort: 'vormen', id: 'demo-v1', scope: 'eigen', persoon_id: 'demo-trainer', team_id: 'demo-o15', data: { id: 'demo-v1', naam: 'Demo-vorm' } });
      zet({ soort: 'vormen', id: 'demo-v2', scope: 'eigen', persoon_id: 'demo-hjo', team_id: 'demo-o15', data: { id: 'demo-v2', naam: 'Vorm van de HJO' } });
      zet({ soort: 'trainingsplannen', id: 'demo-tp1', scope: 'eigen', persoon_id: 'demo-trainer', team_id: 'demo-o15', data: { id: 'demo-tp1', onderdelen: [] } });
      zet({ soort: 'trainerNotities', id: 'demo-trainer', scope: 'hoprive', persoon_id: 'demo-trainer', data: { bouwen: [], tekst: 'Werkaantekening (fictief)' } });
      zet({ soort: 'begeleidZelf', id: 'demo-bm1', scope: 'trainerzelf', persoon_id: 'demo-trainer', data: { trainerId: 'demo-trainer', r: { r1: 'Fictief' } } });
      const rijen = Object.values(D.db.rows);
      const oordeel = {}; for (const pid of ['demo-trainer', 'demo-hjo']) { const z = new Set(D.zicht(pid)); oordeel[pid] = rijen.map((x) => ({ k: `${x.soort}|${x.id}`, lezen: z.has(`${x.soort}|${x.id}`), schrijven: D.magSchrijven(pid, x) })); }
      return { rijen, oordeel }; });
    fs.writeFileSync(uit, JSON.stringify(r));
  });
});
