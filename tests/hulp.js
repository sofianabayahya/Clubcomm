// ClubComm tests — gedeelde hulp voor de browsertests (Besluit 88).
const { expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

// Fouten tijdens de test verzamelen (JavaScript-fouten en console.error). Netwerkfouten van losse bestanden tellen niet mee.
const volgFouten = (page) => {
  const fouten = [];
  page.on('pageerror', (e) => fouten.push(`JS-fout: ${e.message}`));
  page.on('console', (m) => { if (m.type() === 'error' && !/Failed to load resource|versie\.json/.test(m.text())) fouten.push(`console: ${m.text()}`); });
  return fouten;
};

// Wat nooit op een scherm mag staan
const RAAR = /Er ging iets mis|\bundefined\b|\bNaN\b|\[object Object\]|\bnull\b(?! ?%)|Invalid Date/;
const controleer = async (page, fouten, waar) => {
  const tekst = await page.evaluate(() => [document.getElementById('app'), document.getElementById('sheet')].filter((x) => x && !x.hidden).map((x) => x.innerText).join('\n'));
  const m = tekst.match(RAAR);
  expect(m, `${waar}: "${m && tekst.slice(Math.max(0, m.index - 60), m.index + 40).replace(/\s+/g, ' ')}"`).toBeNull();
  expect(fouten, waar).toEqual([]);
};

// Elke rol, elk tabblad, elke keuzeknop (seg) van de ingelogde persoon aanklikken en controleren
const doorklik = async (page, fouten, wie) => {
  const rollen = await page.evaluate(() => CC.me().rollen.map((r) => CC.rolNaam(r)));
  for (let i = 0; i < rollen.length; i++) {
    await page.evaluate((idx) => CC.wisselRol(idx), i);
    const tabs = await page.locator('nav.nav button[data-tab]').evaluateAll((els) => els.map((e) => e.dataset.tab));
    expect(tabs.length, `${wie} · ${rollen[i]}: geen tabbladen`).toBeGreaterThan(0);
    for (const tab of tabs) {
      await page.locator(`nav.nav button[data-tab="${tab}"]`).click();
      const waar = `${wie} · ${rollen[i]} · ${tab}`;
      await controleer(page, fouten, waar);
      const n = Math.min(await page.locator('#app [data-act="seg"]').count(), 30);
      for (let s = 0; s < n; s++) {
        const knop = page.locator('#app [data-act="seg"]').nth(s);
        if (!(await knop.isVisible().catch(() => false))) continue;
        const naam = (await knop.innerText()).trim();
        await knop.click();
        await controleer(page, fouten, `${waar} · ${naam}`);
      }
    }
  }
  return rollen;
};

// Echte versie met een nagebootste database (supabase/tests/fake-supabase.js, code 123456)
const NEP_SUPABASE = fs.readFileSync(path.join(__dirname, '..', 'supabase', 'tests', 'fake-supabase.js'), 'utf8');
const KLEINE_CLUB = fs.readFileSync(path.join(__dirname, 'kleine-club.js'), 'utf8');
const nepDatabase = async (page) => {
  await page.route('**/app/vendor/supabase.js', (r) => r.fulfill({ contentType: 'application/javascript', body: NEP_SUPABASE }));
  // De kleine club opbouwen met de rekenregels van de app zelf, dan als databaserijen klaarzetten
  await page.goto('/?demo');
  await page.addScriptTag({ content: KLEINE_CLUB });
  await page.evaluate(() => {
    const rows = {}; CC.naarRijen(kleineClub(CC), 'dcg').forEach((r) => { rows[`dcg|${r.soort}|${r.id}`] = r; });
    sessionStorage.setItem('fake-sb-db', JSON.stringify({ rows, lid: {}, user: null })); localStorage.clear();
  });
};
const inloggen = async (page, email) => {
  await page.goto('/');
  await page.fill('#lm', email);
  await page.locator('#lm').press('Enter');
  await page.fill('#lc', '123456');
  await page.locator('#lc').press('Enter');
  await expect(page.locator('nav.nav')).toBeVisible();
};
const nepDb = (page) => page.evaluate(() => JSON.parse(sessionStorage.getItem('fake-sb-db')));

module.exports = { volgFouten, controleer, doorklik, nepDatabase, inloggen, nepDb };
