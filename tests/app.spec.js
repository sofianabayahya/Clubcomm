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

  // Demo: snel wisselen van account en rol vanuit het profiel, zonder inlogscherm
  test('demo: snel wisselen tussen accounts en rollen', async ({ page }) => {
    const fouten = volgFouten(page);
    await page.goto('/?demo');
    await page.evaluate(() => localStorage.clear());
    await page.goto('/?demo');
    await page.locator('[data-act="demoLogin"][data-pid]').first().click();
    await page.locator('[data-act="magischeLink"]').click();
    await page.locator('[data-act="profiel"]').click();
    await page.locator('#sheet [data-act="demoWissel"][data-pid="p-esther"]').click();
    expect(await page.evaluate(() => CC.rol().rol)).toBe('coordinator');
    await page.locator('[data-act="profiel"]').click();
    const peterBeheer = page.locator('#sheet [data-act="demoWissel"]', { hasText: 'Peter · Clubbeheerder' });
    await peterBeheer.click();
    expect(await page.evaluate(() => [CC.me().naam.split(' ')[0], CC.rol().rol].join(' '))).toBe('Peter beheerder');
    await controleer(page, fouten, 'snel wisselen');
  });

  // Besluit 99 deel 1: tabblad Trainers, traject, kennismaking (uitnodigen → invullen → zien), VOG bij de coördinator, printen
  test('trainers begeleiden: traject, kennismaking, VOG en printen', async ({ page }) => {
    const fouten = volgFouten(page);
    await page.goto('/?demo');
    await page.evaluate(() => localStorage.clear());
    await page.goto('/?demo');
    await page.evaluate(() => { window.print = () => { window.__geprint = (window.__geprint || 0) + 1; }; });
    await page.locator('[data-act="demoLogin"][data-pid]').nth(3).click();
    await page.locator('[data-act="magischeLink"]').click();
    await page.evaluate(() => CC.wisselRol(CC.me().rollen.findIndex((r) => r.rol === 'hjo')));
    await expect(page.locator('nav.nav button[data-tab="trainers"]')).toBeVisible();
    await expect(page.locator('nav.nav button[data-tab="planning"]')).toHaveCount(0);
    await page.locator('nav.nav button[data-tab="trainers"]').click();
    await expect(page.locator('#app')).toContainText('Dennis Peters');
    // Mark (trainer O10-1) in een traject zetten en uitnodigen voor de kennismaking
    await page.locator('[data-act="seg"][data-key="trDeel"][data-val="alle"]').click();
    await page.locator('#app [data-view="trainerDetail"]', { hasText: 'Mark Jansen' }).first().click();
    await page.locator('#app [data-act="trajectSheet"]').click();
    await page.locator('#sheet form[data-submit="trajectOk"] button.knop').click();
    await page.locator('#app [data-act="kennisUitnodigen"]').click();
    const mark = await page.evaluate(() => CC.S().demo.mark);
    expect(await page.evaluate((id) => !!(CC.S().trainerDossier[id].traject || {}).actief, mark)).toBe(true);
    await page.locator('#app [data-act="dossierPrint"]').click();
    await expect(page.locator('#printvak')).toContainText('Trainersdossier Mark Jansen');
    // Mark ziet de kennismaking op zijn Home en vult hem in
    await page.evaluate(() => document.querySelector('[data-act="profiel"]').click());
    await page.locator('#sheet [data-act="demoWissel"]', { hasText: 'Mark · Trainer' }).click();
    await page.locator('#app [data-act="kennisForm"]').click();
    await page.locator('#sheet input[name="ambitie"][value^="Ik wil me verder"]').check();
    await page.locator('#sheet textarea[name="beter"]').fill('Meer vragen stellen');
    await page.locator('#sheet form[data-submit="kennisOk"] button.knop:not([type="button"])').click();
    await expect(page.locator('#app [data-act="kennisForm"]')).toHaveCount(0);
    expect(await page.evaluate((id) => CC.S().trainerKennis[id].a.beter, mark)).toBe('Meer vragen stellen');
    // Esther (coördinator) houdt Planning en legt de VOG vast
    await page.evaluate(() => document.querySelector('[data-act="profiel"]').click());
    await page.locator('#sheet [data-act="demoWissel"][data-pid="p-esther"]').click();
    await expect(page.locator('nav.nav button[data-tab="planning"]')).toBeVisible();
    await page.evaluate((id) => { document.body.insertAdjacentHTML('beforeend', `<button id="t-adm" data-act="trainerAdminSheet" data-id="${id}" hidden></button>`); document.getElementById('t-adm').click(); }, mark);
    await page.locator('#ta-v').fill('2026-11-01');
    await page.locator('#sheet form[data-submit="trainerAdminOk"] button.knop').click();
    expect(await page.evaluate((id) => CC.S().trainerAdmin[id].vog, mark)).toBe('2026-11-01');
    await controleer(page, fouten, 'trainers begeleiden');
  });

  // Besluit 99 deel 2: begeleidingsmoment (vijf fasen, A4-observatie, delen, reflectie van de trainer)
  test('begeleidingsmoment: observeren, reflectie, delen en printen', async ({ page }) => {
    const fouten = volgFouten(page);
    await page.goto('/?demo');
    await page.evaluate(() => localStorage.clear());
    await page.goto('/?demo');
    await page.evaluate(() => { window.print = () => { window.__geprint = (window.__geprint || 0) + 1; }; });
    await page.locator('[data-act="demoLogin"][data-pid]').nth(3).click();
    await page.locator('[data-act="magischeLink"]').click();
    await page.evaluate(() => CC.wisselRol(CC.me().rollen.findIndex((r) => r.rol === 'hjo')));
    await page.locator('nav.nav button[data-tab="trainers"]').click();
    // Deze week op de Home: het geplande moment is er nog niet (over 8 dagen); wel na verplaatsen naar morgen
    await page.evaluate(() => { CC.S().begeleidMomenten.find((m) => m.id === 'bm-demo2').datum = CC.date.addDays(CC.date.vandaag(), 1); });
    await page.locator('nav.nav button[data-tab="home"]').click();
    await expect(page.locator('#app [data-view="begelMoment"]')).toContainText('Morgen: begeleiding Dennis Peters');
    await page.evaluate(() => CC.open('trainerDetail', { id: CC.S().people.find((x) => x.naam === 'Dennis Peters').id }));
    // Het afgeronde demomoment staat in het dossier en print als A4
    await page.locator('#app [data-view="begelMoment"]', { hasText: 'Training' }).first().click();
    await page.locator('#app [data-act="begelPrint"]:not([data-leeg])').click();
    await expect(page.locator('#printvak')).toContainText('Eerst kijken, dan coachen');
    await expect(page.locator('#printvak')).toContainText('Effectieve voetbaltijd');
    await page.evaluate(() => CC.open('trainerDetail', { id: CC.S().people.find((x) => x.naam === 'Dennis Peters').id }));
    // Nieuw moment: een wedstrijd op een andere datum
    await page.locator('#app [data-act="begelNieuw"]').click();
    await page.locator('#bn-a').selectOption('');
    await page.locator('#bn-s').selectOption('wedstrijd');
    await page.locator('#sheet form[data-submit="begelNieuwOk"] button.knop').click();
    await expect(page.locator('#app')).toContainText('Planningsgesprek');
    await page.locator('#app [data-act="begelPrint"][data-leeg]').click();
    await expect(page.locator('#printvak')).toContainText('Coachgedrag');
    await page.locator('#app [data-act="begelVragen"]').click();
    // Observeren: tekens en turven
    await page.locator('#app [data-act="open"][data-view="begelObs"]').click();
    await page.locator('#app [data-act="obsTeken"][data-sl="coach0"][data-c="d"]').click();
    await page.locator('#app [data-act="obsTurf"][data-d="h1"][data-t="Vraag"]').click();
    const id = await page.evaluate(() => CC.S().begeleidMomenten.at(-1).id);
    expect(await page.evaluate((i) => CC.S().begeleidMomenten.find((m) => m.id === i).obs, id)).toMatchObject({ punten: { coach0: 'd' }, turf: { h1: { Vraag: 1 } } });
    await page.evaluate((i) => CC.open('begelMoment', { id: i }), id);
    // Reflectiegesprek: ontwikkelpunt is verplicht en komt in het dossier
    await page.locator('#app summary', { hasText: 'Reflectiegesprek' }).click();
    await page.locator('#app form[data-submit="begelVakkenOk"] button').click();
    await expect(page.locator('#toast')).toContainText('ontwikkelpunt');
    await page.locator('#app form[data-submit="begelVakkenOk"] textarea[name="ontwikkelpunt"]').fill('Rust gebruiken voor één punt');
    await page.locator('#app form[data-submit="begelVakkenOk"] button').click();
    await page.locator('#app summary', { hasText: 'Nazorg' }).click();
    await page.locator('#app [data-act="begelDeel"]').click();
    await page.locator('#app form[data-submit="begelKlaarOk"] button.knop').click();
    const dennis = await page.evaluate(() => CC.S().people.find((x) => x.naam === 'Dennis Peters').id);
    expect(await page.evaluate((d) => CC.S().trainerDossier[d].traject.ontwikkelpunt, dennis)).toBe('Rust gebruiken voor één punt');
    expect(await page.evaluate((i) => CC.S().begeleidMomenten.find((m) => m.id === i).klaar, id)).toBe(true);
    // Dennis ziet zijn vragenlijst en het verslag op zijn Home
    await page.evaluate((d) => { CC.zetSessie(d); CC.wisselRol(CC.me().rollen.findIndex((r) => r.rol === 'trainer')); }, dennis);
    await page.locator('nav.nav button[data-tab="home"]').click();
    await page.locator('#app [data-act="begelZelf"]').first().click();
    await page.locator('#sheet textarea[name="leerdoel"]').fill('Vragen stellen');
    await page.locator('#sheet form[data-submit="begelZelfOk"] button.knop').click();
    await page.locator('#app [data-view="begelVerslag"]').first().click();
    await page.locator('#app textarea[name="r1"]').fill('Ik praat te snel');
    await page.locator('#app form[data-submit="begelReflectieOk"] button.knop').click();
    expect(await page.evaluate((i) => CC.S().begeleidZelf[i].r.r1, id)).toBe('Ik praat te snel');
    // Mijn ontwikkeling in het profiel: traject, momenten en printen
    await page.evaluate(() => document.querySelector('[data-act="profiel"]').click());
    await page.locator('#sheet [data-view="mijnOntw"]').click();
    await expect(page.locator('#app')).toContainText('Rust gebruiken voor één punt');
    await expect(page.locator('#app [data-view="begelVerslag"]')).toHaveCount(2);
    await page.locator('#app [data-act="mijnOntwPrint"]').click();
    await expect(page.locator('#printvak')).toContainText('Ik praat te snel');
    await controleer(page, fouten, 'begeleidingsmoment');
  });

  // Besluit 100: pakket "Alleen Trainers begeleiden", technisch coördinator met werkgebied, vragenlijst per niveau, evaluatie overnemen
  test('technisch coördinator, werkgebied en pakket Alleen Trainers begeleiden', async ({ page }) => {
    const fouten = volgFouten(page);
    await page.goto('/?demo');
    await page.evaluate(() => localStorage.clear());
    await page.goto('/?demo');
    await page.locator('[data-act="demoLogin"][data-pid]').nth(3).click();
    await page.locator('[data-act="magischeLink"]').click();
    // Clubbeheerder: pakket kiezen
    await page.evaluate(() => CC.wisselRol(CC.me().rollen.findIndex((r) => r.rol === 'beheerder')));
    await page.locator('nav.nav button[data-tab="regels"]').click();
    await page.locator('form[data-submit="pakketOk"] input[value="trainers"]').check();
    await page.locator('form[data-submit="pakketOk"] button').click();
    expect(await page.evaluate(() => CC.S().club.pakket)).toBe('trainers');
    // Esther wordt technisch coördinator voor de onderbouw
    const esther = 'p-esther';
    await page.evaluate((id) => { document.body.insertAdjacentHTML('beforeend', `<button id="t-rol" data-act="rollenPersoon" data-id="${id}" hidden></button>`); document.getElementById('t-rol').click(); }, esther);
    await expect(page.locator('#rb-r option[value="ouder"]')).toHaveCount(0);
    await page.locator('#rb-r').selectOption('tc');
    await page.locator('#rb-t').selectOption('bouw:Onderbouw');
    await page.locator('#sheet form[data-submit="rolErbij"] button.knop').click();
    await page.locator('#sheet [data-act="rolErbijOk"]').click();
    const rol = await page.evaluate((id) => CC.S().people.find((p) => p.id === id).rollen.find((r) => r.rol === 'tc'), esther);
    expect(rol).toEqual({ rol: 'tc', bouwen: ['Onderbouw'] });
    // Esther als TC: alleen Trainers en Berichten, alleen trainers uit de onderbouw
    await page.evaluate((id) => { CC.zetSessie(id); CC.wisselRol(CC.me().rollen.findIndex((r) => r.rol === 'tc')); }, esther);
    await page.locator('nav.nav button[data-tab="home"]').click();
    await expect(page.locator('nav.nav button')).toHaveCount(2);
    await page.locator('[data-act="seg"][data-key="trDeel"][data-val="alle"]').click();
    await expect(page.locator('#app')).toContainText('Dennis Peters');
    const buiten = await page.evaluate(() => CC.S().teams.filter((t) => CC.bouwVan(CC.S(), t).naam !== 'Onderbouw').flatMap((t) => CC.m.stafVan(CC.S(), t.id, ['trainer'])).map((id) => CC.m.persoon(CC.S(), id).naam).filter((n) => !CC.S().teams.some((t) => CC.bouwVan(CC.S(), t).naam === 'Onderbouw' && CC.m.stafVan(CC.S(), t.id, ['trainer']).some((x) => CC.m.persoon(CC.S(), x).naam === n))));
    for (const n of buiten.slice(0, 2)) await expect(page.locator('#app')).not.toContainText(n);
    // Notitie: gedeeld per bouw
    const dennis = await page.evaluate(() => CC.S().people.find((x) => x.naam === 'Dennis Peters').id);
    await page.evaluate((d) => CC.open('trainerDetail', { id: d }), dennis);
    await page.locator('#app form[data-submit="hoNotitieOk"] textarea').fill('Kan door, wel nog rustiger coachen');
    await page.locator('#app form[data-submit="hoNotitieOk"] button').click();
    expect(await page.evaluate((d) => CC.S().trainerNotities[d], dennis)).toEqual({ tekst: 'Kan door, wel nog rustiger coachen', bouwen: ['Onderbouw'] });
    // Nieuw moment: korte vragenlijst is standaard, uitgebreid kan
    await page.locator('#app [data-act="begelNieuw"]').click();
    await page.locator('#bn-a').selectOption('');
    await page.locator('#bn-s').selectOption('wedstrijd');
    await page.locator('#sheet form[data-submit="begelNieuwOk"] button.knop').click();
    await expect(page.locator('#app details[open] summary', { hasText: 'Planningsgesprek' })).toHaveCount(1);
    await expect(page.locator('#app [data-act="begelNiveau"].aan')).toHaveText('Kort (4 vragen)');
    await page.locator('#app [data-act="begelNiveau"][data-n="uitgebreid"]').click();
    const id = await page.evaluate(() => CC.S().begeleidMomenten.at(-1).id);
    expect(await page.evaluate((i) => CC.S().begeleidMomenten.find((m) => m.id === i).niveau, id)).toBe('uitgebreid');
    // Evaluatie van /evaluatie (op dit toestel) overnemen
    await page.evaluate(() => localStorage.setItem('clubcomm-evaluaties-v1', JSON.stringify({ huidig: 'e1', lijst: [{ id: 'e1', coach: 'Dennis Peters', team: 'O9', datum: '2026-10-08', tegenstander: 'Testclub', leerdoel: 'Rustig coachen', voetbalprobleem: 'Opbouwen onder druk', signalen: 'Elkaar coachen', focus: 'Momenten van ingrijpen', feedbackmoment: 'In de rust', notities: [{ fase: 'h1', min: '25', soort: 'Vraag', coach: 'Wat zie je?', spelers: 'Kijkt om' }, { fase: 'h1', min: '31', soort: 'Directief', coach: 'Schuiven!', spelers: '' }], s1: 'Goed gevoel', s3: 'Ze praatten meer', s6: 'Vaste momenten kiezen', punt: 'Vaste coachmomenten', r1: 'Ik riep minder' }] })));
    await page.evaluate((i) => CC.open('begelMoment', { id: i }), id);
    await page.locator('#app summary', { hasText: 'Praktijk' }).click();
    await page.locator('#app [data-act="begelImport"]').click();
    await page.locator('#sheet [data-act="begelImportOk"]').click();
    const m = await page.evaluate((i) => CC.S().begeleidMomenten.find((x) => x.id === i), id);
    expect(m.datum).toBe('2026-10-08');
    expect(m.vakken.ontwikkelpunt).toBe('Vaste coachmomenten');
    expect(m.obs.turf).toEqual({ h1: { Vraag: 1, Directief: 1 } });
    expect(await page.evaluate((i) => CC.S().begeleidZelf[i].r.r1, id)).toBe('Ik riep minder');
    // De trainer in het pakket: alleen Home en Berichten
    await page.evaluate((d) => { CC.zetSessie(d); CC.wisselRol(CC.me().rollen.findIndex((r) => r.rol === 'trainer')); }, dennis);
    await page.locator('nav.nav button[data-tab="home"]').click();
    await expect(page.locator('nav.nav button')).toHaveCount(2);
    await expect(page.locator('#app')).toContainText('Mijn ontwikkeling');
    await controleer(page, fouten, 'technisch coördinator');
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

  // Besluit 100: een club met alleen Trainers begeleiden (zoals de test bij een tweede club): HO, TC en één trainer, geen ouders
  test('pakket Alleen Trainers begeleiden: HO, TC en trainer klikken door', async ({ page }) => {
    const fouten = volgFouten(page);
    await nepDatabase(page);
    await page.evaluate(() => {
      const S = kleineClub(CC); S.club.pakket = 'trainers'; S.club.coordinatorAan = false; S.players = [];
      S.teams = [{ id: 'O15-1', naam: 'Test O15', cat: 'O15', type: 'selectie', rooster: [], afwijking: {}, trainerId: 'p-tr', teamleiderId: null }];
      const p = (id, naam, email, rollen) => ({ id, naam, email, tel: '', rollen });
      S.people = [p('p-ho', 'Hanna Oost', 'ho@test.nl', [{ rol: 'hjo' }, { rol: 'beheerder' }]), p('p-tc', 'Tom Cramer', 'tc@test.nl', [{ rol: 'tc' }]), p('p-tr', 'Ties Ruiter', 'tr@test.nl', [{ rol: 'trainer', teamId: 'O15-1' }])];
      S.trainerDossier = { 'p-tr': { traject: { actief: true, sinds: CC.date.vandaag(), door: 'p-ho', plan: { wedstrijd: 2, training: 2 }, leerdoel: 'Vaste coachmomenten', niveau: 'uitgebreid', ontwikkelpunt: '' } } };
      S.begeleidMomenten = [{ id: 'bm1', trainerId: 'p-tr', teamId: 'O15-1', actId: null, soort: 'wedstrijd', datum: CC.date.vandaag(), door: 'p-ho', niveau: 'uitgebreid', klaar: false, gevraagd: new Date().toISOString(), voor: { thema: '', doel: 'Opbouwen onder druk', leerdoel: 'Vaste coachmomenten', hoDoel: '' }, plan: {}, obs: { punten: {}, notities: {}, klok: null, turf: {} }, vakken: {} }];
      const rows = {}; CC.naarRijen(S, 'dcg').forEach((r) => { rows[`dcg|${r.soort}|${r.id}`] = r; });
      sessionStorage.setItem('fake-sb-db', JSON.stringify({ rows, lid: {}, user: null }));
    });
    await inloggen(page, 'ho@test.nl');
    await doorklik(page, fouten, 'HO (pakket)');
    await page.evaluate(() => CC.wisselRol(CC.me().rollen.findIndex((r) => r.rol === 'hjo')));
    await expect(page.locator('nav.nav button')).toHaveCount(2);
    await page.evaluate(() => CC.open('trainerDetail', { id: 'p-tr' }));
    await page.locator('#app form[data-submit="hoNotitieOk"] textarea').fill('Kan door');
    await page.locator('#app form[data-submit="hoNotitieOk"] button').click();
    await expect.poll(async () => ((await nepDb(page)).rows['dcg|trainerNotities|p-tr'] || {}).data, { message: 'notitie met bouw opgeslagen' }).toEqual({ tekst: 'Kan door', bouwen: ['Middenbouw'] });
    await page.evaluate(() => CC.open('begelMoment', { id: 'bm1' }));
    await controleer(page, fouten, 'HO begeleidingsmoment');
    for (const email of ['tc@test.nl', 'tr@test.nl']) {
      await page.evaluate(() => CC.logout());
      await inloggen(page, email);
      await doorklik(page, fouten, email);
      await expect(page.locator('nav.nav button')).toHaveCount(2);
    }
    await page.locator('nav.nav button[data-tab="home"]').click();
    await expect(page.locator('#app [data-act="begelZelf"]')).toHaveCount(1);
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
