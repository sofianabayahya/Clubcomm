// ClubComm tests — elke rol doorklikken en de belangrijkste handelingen (Besluit 88).
// Demo (volle club) én een nagebootste echte, kleine club (teamnaam ≠ teamcode, weinig spelers, geen telefoonnummers).
const { test, expect } = require('@playwright/test');
const { volgFouten, controleer, doorklik, nepDatabase, inloggen, nepDb, NEP_SUPABASE } = require('./hulp');

test.describe('Demo', () => {
  for (const wie of ['sanne', 'mark', 'linda', 'peter']) {
    test(`doorklikken: ${wie}`, async ({ page }) => {
      const fouten = volgFouten(page);
      await page.goto('/?demo');
      await page.evaluate(() => localStorage.clear());
      await page.goto('/?demo');
      await page.locator(`[data-act="demoLogin"][data-pid]`).nth(['sanne', 'mark', 'linda', 'peter'].indexOf(wie)).click();
      await page.locator('[data-act="magischeLink"]').click();
      await expect(page.locator('nav.nav')).toBeVisible();
      await doorklik(page, fouten, wie);
    });
  }

  test('ouder meldt af', async ({ page }) => {
    const fouten = volgFouten(page);
    await page.goto('/?demo');
    await page.evaluate(() => localStorage.clear());
    await page.goto('/?demo');
    await page.locator('[data-act="demoLogin"]').first().click();
    await page.locator('[data-act="magischeLink"]').click();
    const voor = await page.evaluate(() => CC.S().afm.length);
    await page.locator('#app button[data-act="afmelden"]').first().click();
    await page.locator('#sheet label.reden').first().click();
    await page.locator('#sheet form[data-submit="bevestigAfmelden"] button.knop').first().click();
    await expect.poll(() => page.evaluate(() => CC.S().afm.length)).toBe(voor + 1);
    await controleer(page, fouten, 'na afmelden');
  });
});

test.describe('Kleine club (echte versie, nagebootste database)', () => {
  test('beheerder zet het rooster, iedereen klikt door, ouder meldt af', async ({ page }) => {
    const fouten = volgFouten(page);
    await nepDatabase(page);

    // 1. Beheerder: alles doorklikken met een lege planning
    await inloggen(page, 'admin@test.nl');
    await doorklik(page, fouten, 'beheerder (leeg)');

    // 2. Rooster instellen (Besluit 87): woensdag en vrijdag
    await page.evaluate(() => { CC.wisselRol(CC.me().rollen.findIndex((r) => r.rol === 'beheerder')); document.body.insertAdjacentHTML('beforeend', '<button id="t-rooster" data-act="roosterTeam" data-team="O12-1" hidden></button>'); document.getElementById('t-rooster').click(); });
    for (const d of [3, 5]) await page.locator(`#sheet input[name="aan-${d}"]`).check();
    await page.locator('#sheet form[data-submit="roosterTeamOk"] button.knop').click();
    await expect.poll(() => page.evaluate(() => CC.S().acts.filter((a) => a.teamId === 'O12-1').length)).toBeGreaterThan(10);
    await expect.poll(async () => Object.values((await nepDb(page)).rows).filter((r) => r.soort === 'acts').length, { message: 'trainingen opgeslagen in de database' }).toBeGreaterThan(10);
    await doorklik(page, fouten, 'beheerder (met rooster)');

    // 3. Teamleider en ouder
    for (const email of ['inge.vandenberg.oosterhuis@hotmail.com', 'karim@test.nl', 'amin@test.nl']) {
      await page.evaluate(() => CC.logout());
      await inloggen(page, email);
      await doorklik(page, fouten, email);
    }

    // 4. Ouder (Amin) meldt Tahsin af; de afmelding staat in de database
    await page.evaluate(() => CC.wisselRol(0));
    await page.locator('nav.nav button[data-tab="home"]').click();
    await page.locator('#app button[data-act="afmelden"]').first().click();
    await page.locator('#sheet label.reden').first().click();
    await page.locator('#sheet form[data-submit="bevestigAfmelden"] button.knop').first().click();
    await expect.poll(async () => Object.values((await nepDb(page)).rows).filter((r) => r.soort === 'afm' && r.data.spelerId === 's2').length, { message: 'afmelding opgeslagen in de database' }).toBe(1);
    await controleer(page, fouten, 'ouder na afmelden');
  });
});

test.describe('Demo voor besturen (/demo, Besluit 89)', () => {
  test('alleen op uitnodiging, en elke stap van de rondleiding klopt', async ({ page }) => {
    const fouten = volgFouten(page);
    await page.setViewportSize({ width: 1366, height: 768 });
    await page.route('**/app/vendor/supabase.js', (r) => r.fulfill({ contentType: 'application/javascript', body: NEP_SUPABASE }));
    await page.goto('/demo'); await page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); }); await page.goto('/demo');
    // Niet op de lijst: geen code, geen demo
    await page.fill('#dm', 'onbekend@test.nl'); await page.locator('#dm').press('Enter');
    await expect(page.locator('#app h1')).toHaveText('Alleen op uitnodiging');
    await expect(page.locator('#rondleiding')).toHaveCount(0);
    // Wel op de lijst: code, dan de rondleiding
    await page.locator('[data-act="demoPoortUit"]').click();
    await page.fill('#dm', 'admin@test.nl'); await page.locator('#dm').press('Enter');
    await page.fill('#dc', '123456'); await page.locator('#dc').press('Enter');
    await expect(page.locator('#rondleiding .rl-titel')).toBeVisible();
    const stappen = await page.evaluate(() => CC.demoStappen.map((s) => ({ titel: s.titel, doel: !!s.doel })));
    for (let i = 0; i < stappen.length; i++) {
      await page.locator(`#rondleiding [data-act="rlGa"][data-i="${i}"]`).click();
      await expect(page.locator('#rondleiding .rl-titel')).toHaveText(stappen[i].titel);
      if (stappen[i].doel) await expect(page.locator('#rl-rand'), `stap ${i + 1}: gele rand`).toBeVisible();
      await controleer(page, fouten, `rondleiding stap ${i + 1}`);
    }
    // Esc: vrij rondkijken; knop Rondleiding opent hem weer
    await page.keyboard.press('Escape');
    await expect(page.locator('#rondleiding')).toBeHidden();
    await page.locator('#rl-open').click();
    await expect(page.locator('#rondleiding')).toBeVisible();
  });
});
