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

  // Besluit 95: organisatie bij de coördinator, trainers bij de HO; zonder coördinator doet de HO het (terugval)
  test('taken: coördinator organiseert, HO volgt trainers, terugval zonder coördinator', async ({ page }) => {
    await page.goto('/?demo');
    await page.evaluate(() => localStorage.clear());
    await page.goto('/?demo');
    await page.locator('[data-act="demoLogin"][data-pid]').nth(3).click();
    await page.locator('[data-act="magischeLink"]').click();
    const r = await page.evaluate(() => {
      const S = CC.S(); const met = S.teams.find((t) => CC.coordinatorVoor(S, t.id)).id; const zonder = S.teams.find((t) => !CC.coordinatorVoor(S, t.id)).id;
      return {
        coordClub: CC.mag('clubbericht', 'coordinator'), coordStaf: CC.mag('staf', 'coordinator'), coordTrainers: CC.mag('trainersVolgen', 'coordinator'),
        hoTrainers: CC.mag('trainersVolgen', 'hjo', met), hoAfdoenMet: CC.mag('afdoen', 'hjo', met), hoAfdoenZonder: CC.mag('afdoen', 'hjo', zonder),
        hoToelMet: CC.mag('toelichting', 'hjo', met), tlTrainerNiet: CC.PROFIELEN.teamleider.some((p) => p.taken.includes('trainerNiet')),
      };
    });
    expect(r).toEqual({ coordClub: true, coordStaf: true, coordTrainers: false, hoTrainers: true, hoAfdoenMet: false, hoAfdoenZonder: true, hoToelMet: false, tlTrainerNiet: false });
  });

  // Besluit 95 stap 2: Home van de HO = trainers, deze week, rapporten; organisatie alleen voor teams zonder coördinator
  test('HO-Home: trainers eerst, rapport per lichting, coördinator houdt zijn eigen Home', async ({ page }) => {
    const fouten = volgFouten(page);
    await page.goto('/?demo');
    await page.evaluate(() => localStorage.clear());
    await page.goto('/?demo');
    await page.locator('[data-act="demoLogin"][data-pid]').nth(3).click();
    await page.locator('[data-act="magischeLink"]').click();
    await page.evaluate(() => CC.wisselRol(CC.me().rollen.findIndex((r) => r.rol === 'hjo')));
    const koppen = await page.locator('#app h3').allInnerTexts();
    const k = koppen.join(' | ');
    expect(k).toMatch(/Te doen/i); expect(k).toMatch(/Deze week/i); expect(k).toMatch(/Rapporten/i); expect(k).toMatch(/Organisatie/i);
    expect(k).not.toMatch(/Ter informatie/i);
    await page.locator('#app [data-view="trainersRapport"]').first().click();
    await expect(page.locator('details.uitklap').first()).toBeVisible();
    await page.locator('[data-act="seg"][data-key="trRap"][data-val="aandacht"]').click();
    expect(await page.locator('details.uitklap[open]').count()).toBeGreaterThan(0);
    await controleer(page, fouten, 'HO rapport');
    // De coördinator houdt zijn eigen Home: "Ter informatie", geen blok Rapporten
    await page.evaluate(() => CC.logout());
    await page.locator('[data-act="demoLogin"][data-pid="p-esther"]').click();
    await page.locator('[data-act="magischeLink"]').click();
    const k2 = (await page.locator('#app h3').allInnerTexts()).join(' | ');
    expect(k2).toMatch(/Ter informatie/i); expect(k2).not.toMatch(/Rapporten/i);
    await controleer(page, fouten, 'coördinator Home');
  });

  // Besluit 97: focus per bouw (signalen buiten je focus blijven zichtbaar als één regel) en bouwen instellen door de clubbeheerder
  test('bouwen: focus voor de HO en indeling door de clubbeheerder', async ({ page }) => {
    const fouten = volgFouten(page);
    await page.goto('/?demo');
    await page.evaluate(() => localStorage.clear());
    await page.goto('/?demo');
    await page.locator('[data-act="demoLogin"][data-pid]').nth(3).click();
    await page.locator('[data-act="magischeLink"]').click();
    await page.evaluate(() => CC.wisselRol(CC.me().rollen.findIndex((r) => r.rol === 'hjo')));
    await page.locator('#app [data-act="seg"][data-key="hoFocus"][data-val="Mini\'s"]').click();
    await expect(page.locator('#app')).toContainText('buiten je focus');
    expect(await page.evaluate(() => localStorage.getItem('clubcomm-focus'))).toBe("Mini's");
    await page.locator('#app [data-view="trainersRapport"]').first().click();
    expect(await page.locator('details.uitklap').count()).toBe(1);
    await controleer(page, fouten, 'HO focus');
    // Clubbeheerder: onderbouw splitsen in O8–O10 en O11–O12
    await page.evaluate(() => CC.wisselRol(CC.me().rollen.findIndex((r) => r.rol === 'beheerder')));
    await page.locator('nav.nav button[data-tab="rollen"]').click();
    await page.locator('[data-act="bouwErbij"]').click();
    await page.locator('#bw-t1').selectOption('10');
    await page.locator('#bw-n4').fill('Onderbouw 2'); await page.locator('#bw-v4').selectOption('11'); await page.locator('#bw-t4').selectOption('12');
    await page.locator('form[data-submit="bouwenOk"] button.knop').first().click();
    const bw = await page.evaluate(() => CC.S().club.bouwen.map((b) => `${b.naam}:${b.van}-${b.tot}`).join(','));
    expect(bw).toBe("Mini's:6-7,Onderbouw:8-10,Onderbouw 2:11-12,Middenbouw:13-15,Bovenbouw:16-19");
    // Overlap wordt geweigerd
    await page.locator('#bw-t1').selectOption('11');
    await page.locator('form[data-submit="bouwenOk"] button.knop').first().click();
    expect(await page.evaluate(() => CC.S().club.bouwen[1].tot)).toBe(10);
    await controleer(page, fouten, 'bouwen instellen');
  });

  // Besluit 97 stap 3: geen aanwezigheid opgenomen → coördinator bevestigt → telt mee + pushmelding aan de HO
  test('trainer niet gekomen: signaal, bevestigen, melding aan de HO', async ({ page }) => {
    const fouten = volgFouten(page);
    await page.goto('/?demo');
    await page.evaluate(() => localStorage.clear());
    await page.goto('/?demo');
    await page.locator('[data-act="demoLogin"][data-pid="p-esther"]').click();
    await page.locator('[data-act="magischeLink"]').click();
    const actId = await page.evaluate(() => { const S = CC.S(); const gisteren = CC.date.addDays(CC.date.vandaag(), -2);
      const a = { id: 'a-test-niet', teamId: 'O11-2', soort: 'training', datum: gisteren, tijd: '17:00', eind: '18:15', veld: 'Veld 1', afgelast: false };
      S.acts.push(a); delete S.pres[a.id]; S.trainerLog = (S.trainerLog || []).filter((x) => x.actId !== a.id); CC.render(); return a.id; });
    await expect(page.locator('#app [data-act="aanwCheck"]')).toHaveCount(1);
    await page.locator('#app [data-act="aanwCheck"]').click();
    await page.locator('#sheet [data-act="aanwKies"][data-w="niet"]').click();
    const r = await page.evaluate((id) => { const S = CC.S(); return { log: S.trainerLog.filter((x) => x.actId === id && x.soort === 'niet').length,
      m: S.msgs.filter((m) => /Trainer niet gekomen/.test(m.onderwerp) && m.push).map((m) => m.ontvangers.includes(S.demo.peter)) }; }, actId);
    expect(r.log).toBe(1); expect(r.m).toEqual([true]);
    await expect(page.locator('#app [data-act="aanwCheck"]')).toHaveCount(0);
    await controleer(page, fouten, 'trainer niet gekomen');
  });

  // Training afgelasten met een eigen toelichting: één bericht aan de ouders
  test('trainer gelast een training af met toelichting', async ({ page }) => {
    const fouten = volgFouten(page);
    await page.goto('/?demo');
    await page.evaluate(() => localStorage.clear());
    await page.goto('/?demo');
    await page.locator('[data-act="demoLogin"][data-pid]').nth(1).click();
    await page.locator('[data-act="magischeLink"]').click();
    await page.evaluate(() => { CC.wisselRol(CC.me().rollen.findIndex((r) => r.rol === 'trainer')); CC.wijzigingSheet(); });
    await expect(page.locator('#w-at')).toBeHidden();
    await page.locator('#w-wat').selectOption('afgelast');
    await expect(page.locator('#w-at')).toBeVisible();
    const actId = await page.locator('#w-act').inputValue();
    await page.locator('#w-at').fill('Door blessures en ziekte. Fijn weekend!');
    await page.locator('#sheet form[data-submit="wijzigPlanning"] button.knop').click();
    const uit = await page.evaluate((id) => ({ afgelast: CC.S().acts.find((a) => a.id === id).afgelast, m: CC.S().msgs.filter((m) => /gaat niet door/.test(m.onderwerp)) }), actId);
    expect(uit.afgelast).toBe(true);
    expect(uit.m).toHaveLength(1);
    expect(uit.m[0].tekst).toMatch(/gaat niet door\.\n\nDoor blessures en ziekte\. Fijn weekend!$/);
    expect(uit.m[0].urgent).toBe(true);
    await controleer(page, fouten, 'na afgelasten');
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

  // Besluit 92: oefenwedstrijd uit, met verzamelen, verzamelpunt en adres; ouder ziet het op het kaartje, in het bericht en bij Vervoer
  test('trainer plant een oefenwedstrijd uit; ouder ziet adres en vervoer', async ({ page }) => {
    const fouten = volgFouten(page);
    await nepDatabase(page);
    await inloggen(page, 'admin@test.nl');
    await page.evaluate(() => { CC.wisselRol(CC.me().rollen.findIndex((r) => r.rol === 'trainer')); CC.wijzigingSheet(); });
    await page.locator('#w-wat').selectOption('oefen');
    const datum = await page.evaluate(() => CC.date.addDays(CC.date.vandaag(), 7));
    await page.locator('#w-dat').fill(datum); await page.locator('#w-tijd').fill('10:00'); await page.locator('#w-t').fill('SCPB');
    await page.locator('#sheet input[name="oefThuis"][value="0"]').check();
    await expect(page.locator('#w-oad')).toBeVisible();
    await page.locator('#w-ovz').fill('09:00'); await page.locator('#w-ovp').fill('bij de kantine'); await page.locator('#w-oad').fill('Teststraat 1, Amsterdam');
    await page.locator('#sheet form[data-submit="wijzigPlanning"] button.knop').click();
    await expect.poll(async () => Object.values((await nepDb(page)).rows).filter((r) => r.soort === 'acts' && r.data.soort === 'oefen' && r.data.thuis === false && r.data.adres === 'Teststraat 1, Amsterdam').length, { message: 'oefenwedstrijd uit opgeslagen' }).toBe(1);
    const bericht = await page.evaluate(() => CC.S().msgs.find((m) => /Oefenwedstrijd/.test(m.onderwerp)));
    expect(bericht.tekst).toContain('Verzamelen om 09:00 bij de kantine.'); // ook als iemand zelf "bij …" typt
    expect(bericht.tekst).toContain('Adres: Teststraat 1, Amsterdam');
    expect(bericht.urgent).toBe(false);
    await page.evaluate(() => CC.logout());
    await inloggen(page, 'amin@test.nl');
    await page.evaluate(() => CC.wisselRol(0));
    await expect(page.locator('#app .act:has-text("uit bij SCPB") .act-adres')).toContainText('Teststraat 1');
    await page.locator('nav.nav button[data-tab="vervoer"]').click();
    await expect(page.locator('#app')).toContainText('uit bij SCPB');
    await controleer(page, fouten, 'oefenwedstrijd uit');
  });
});

// De demo rekent vanaf "vandaag": de rondleiding moet op elke dag van de week kloppen (fout gevonden op een woensdag)
test.describe('Rondleiding op elke dag van de week', () => {
  for (const dag of ['2026-10-05T16:00', '2026-10-06T16:00', '2026-10-07T16:00', '2026-10-08T16:00', '2026-10-09T20:00', '2026-10-10T09:45', '2026-10-10T16:00', '2026-10-11T12:00']) {
    test(`elke stap vindt zijn onderdeel · ${dag}`, async ({ page }) => {
      const fouten = volgFouten(page);
      await page.clock.install({ time: new Date(`${dag}:00+02:00`) });
      await page.setViewportSize({ width: 1366, height: 768 });
      await page.route('**/app/vendor/supabase.js', (r) => r.fulfill({ contentType: 'application/javascript', body: NEP_SUPABASE }));
      await page.goto('/demo'); await page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); }); await page.goto('/demo');
      await page.fill('#dm', 'admin@test.nl'); await page.locator('#dm').press('Enter');
      await page.fill('#dc', '123456'); await page.locator('#dc').press('Enter');
      await expect(page.locator('#rondleiding .rl-titel')).toBeVisible();
      const stappen = await page.evaluate(() => CC.demoStappen.map((s) => !!s.doel));
      for (let i = 0; i < stappen.length; i++) {
        await page.locator(`#rondleiding [data-act="rlGa"][data-i="${i}"]`).click();
        if (stappen[i]) await expect(page.locator('#rl-rand'), `${dag} stap ${i + 1}: gele rand`).toBeVisible();
      }
      expect(fouten, dag).toEqual([]);
    });
  }
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

// Besluit 93: evaluatieformulier coach (losse pagina, alleen op het toestel, PDF via printen)
test('evaluatie: notitie bij de juiste stap, ontwikkelpunt verplicht, bewaard op het toestel', async ({ page }) => {
  const fouten = volgFouten(page);
  const meldingen = []; page.on('dialog', async (d) => { meldingen.push(d.message()); await d.accept(); });
  await page.goto('/evaluatie');
  await page.locator('#v-leerdoel').fill('Bewust stil blijven');
  // Een moment: minuut, soort (objectief), wat de coach zegt, wat de spelers doen
  await page.locator('#n-min').fill('28');
  await page.locator('[data-act="soort"][data-w="Directief"]').click();
  await page.locator('#n-coach').fill('"Druk zetten, 6!"');
  await page.locator('#n-spelers').fill('6 sprint naar voren');
  await page.locator('form.noteer button.knop').click();
  await expect(page.locator('.telling')).toContainText('Directief 1');
  await expect(page.locator('.stap').nth(1).locator('.ref')).toContainText('Directief 1');
  await expect(page.locator('.stap').nth(2).locator('.ref')).toContainText('6 sprint naar voren');
  await page.evaluate(() => { window.print = () => { window.__geprint = true; }; });
  await page.locator('[data-act="pdf"]').click();
  expect(meldingen.pop()).toContain('ontwikkelpunt');
  await page.locator('#v-punt').fill('Eerst kijken, dan coachen.');
  await page.locator('[data-act="pdf"]').click();
  expect(await page.evaluate(() => window.__geprint)).toBe(true);
  await expect(page.locator('#afdruk')).toContainText('Eerst kijken, dan coachen.');
  await page.reload();
  await expect(page.locator('#v-punt')).toHaveValue('Eerst kijken, dan coachen.');
  await controleer(page, fouten, 'evaluatie');
});

// Observatieformulier op papier: leeg te printen (ook zonder ontwikkelpunt), signalen uit het voorgesprek als turfregels
test('evaluatie: leeg observatieformulier op papier', async ({ page }) => {
  const fouten = volgFouten(page);
  await page.goto('/evaluatie');
  await page.evaluate(() => { window.print = () => { window.__geprint = true; }; });
  await page.locator('[data-act="papier"]').click();
  expect(await page.evaluate(() => window.__geprint)).toBe(true);
  await expect(page.locator('#afdruk')).toContainText('Observatieformulier coach');
  await expect(page.locator('#afdruk table.obs.leeg')).toHaveCount(3);
  await page.locator('#v-signalen').fill('1. Spelers kijken voordat ze de bal ontvangen\n2. Middenvelders maken zich aanspeelbaar');
  await page.locator('[data-act="papier"]').click();
  await expect(page.locator('#afdruk table.turf').last()).toContainText('Middenvelders maken zich aanspeelbaar');
  await expect(page.locator('#afdruk table.turf').last()).not.toContainText('1.');
  await controleer(page, fouten, 'evaluatie papier');
});
