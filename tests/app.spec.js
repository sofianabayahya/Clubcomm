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
    // Besluit 103: Persoon toevoegen staat bovenaan; de indeling staat in een ingeklapt blok dat open blijft na een tik
    await expect(page.locator('#app main > button[data-act="stafNieuw"]').first()).toBeVisible();
    await page.locator('#app summary', { hasText: 'Indeling in bouwen' }).click();
    await page.locator('[data-act="bouwErbij"]').click();
    await expect(page.locator('#app details[open] > summary', { hasText: 'Indeling in bouwen' })).toHaveCount(1);
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
    await page.locator('#app [data-act="trainerKaart"]', { hasText: 'Mark Jansen' }).first().click(); // Besluit 113: eerst het venster
    await page.locator('#sheet [data-view="trainerDetail"]').click();
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
    // Trainers → Traject: per trainer leerdoel en afvinklijst; Traject toevoegen kiest een trainer zonder traject
    await page.locator('nav.nav button[data-tab="trainers"]').click();
    await expect(page.locator('#app .kaartje.traject', { hasText: 'Dennis Peters' }).locator('li.ok')).toContainText('Training');
    await page.locator('#app [data-act="trajectKies"]').click();
    await expect(page.locator('#sheet [data-act="trajectSheet"]', { hasText: 'Dennis Peters' })).toHaveCount(0);
    await page.locator('#sheet [data-act="trajectSheet"]').first().click();
    await expect(page.locator('#sheet form[data-submit="trajectOk"]')).toBeVisible();
    await page.locator('#sheet form[data-submit="trajectOk"] button.knop').click();
    // Op de nieuwe kaart: grijs "Training · plannen" → kies een training → moment gepland en de vragenlijst is verstuurd
    const voor = await page.evaluate(() => CC.S().msgs.length);
    await page.locator('#app [data-act="begelInplannen"][data-soort="training"]').first().click();
    await page.locator('#sheet [data-act="begelInplannenOk"]').first().click();
    const gepland = await page.evaluate(() => CC.S().begeleidMomenten.at(-1));
    expect(gepland.actId).toBeTruthy(); expect(gepland.gevraagd).toBeTruthy();
    expect(await page.evaluate((n) => CC.S().msgs.slice(n).map((m) => m.onderwerp), voor)).toEqual([expect.stringMatching(/^Bereid je begeleidingsmoment voor/)]);
    await expect(page.locator('#app li.half', { hasText: 'Training' }).first()).toBeVisible();
    // Besluit 101: een training heeft eigen vragen (opbouw), geen reflectievraag vooraf
    await page.evaluate((id) => CC.open('begelMoment', { id }), gepland.id);
    await page.locator('#app [data-act="begelVragenPrint"]').click();
    await expect(page.locator('#printvak')).toContainText('Hoe heb je de training opgebouwd?');
    await expect(page.locator('#printvak')).not.toContainText('meenemen');
    await page.locator('nav.nav button[data-tab="trainers"]').click();
    // Deze week op de Home: het geplande moment is er nog niet (over 8 dagen); wel na verplaatsen naar morgen
    await page.evaluate(() => { CC.S().begeleidMomenten.find((m) => m.id === 'bm-demo2').datum = CC.date.addDays(CC.date.vandaag(), 1); });
    await page.locator('nav.nav button[data-tab="home"]').click();
    await expect(page.locator('#app [data-view="begelMoment"]', { hasText: 'Dennis Peters' })).toContainText('Morgen: begeleiding Dennis Peters');
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
    // Vóór het delen: de drie reflectievragen staan er, en de begeleider kan bekijken wat de trainer ziet
    await expect(page.locator('#app')).toContainText('In welke situatie ga ik mijn ontwikkelpunt de volgende keer toepassen?');
    await page.locator('#app [data-act="begelVoorbeeld"]').click();
    await expect(page.locator('#app')).toContainText('Voorbeeld: dit ziet de trainer');
    await expect(page.locator('#app form[data-submit="begelReflectieOk"]')).toHaveCount(0);
    await page.locator('[data-act="terug"]').click();
    await page.locator('#app textarea[name="hoVerslag"]').fill('Ik gaf te snel mijn eigen oplossing');
    await page.locator('#app [data-act="begelDeel"]').click();
    await page.locator('#app form[data-submit="begelKlaarOk"] button.knop').click();
    const dennis = await page.evaluate(() => CC.S().people.find((x) => x.naam === 'Dennis Peters').id);
    expect(await page.evaluate((d) => CC.S().trainerDossier[d].traject.ontwikkelpunt, dennis)).toBe('Rust gebruiken voor één punt');
    expect(await page.evaluate((i) => CC.S().begeleidMomenten.find((m) => m.id === i).klaar, id)).toBe(true);
    // De eigen terugblik staat apart (niet in het moment dat de trainer kan lezen)
    expect(await page.evaluate((i) => CC.S().begelHoVerslag[i].tekst, id)).toBe('Ik gaf te snel mijn eigen oplossing');
    expect(await page.evaluate((i) => CC.S().begeleidMomenten.find((m) => m.id === i).hoVerslag, id)).toBeUndefined();
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
    await page.locator('details:has(form[data-submit="pakketOk"]) > summary').click(); // 27-10: Regels is ingeklapt
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
    // Clubbeheerder → Rollen: de TC staat bij de rollen in gebruik en in de lijst met mensen
    await page.locator('nav.nav button[data-tab="rollen"]').click();
    await expect(page.locator('#app .rij', { hasText: 'Technisch coördinator' }).first()).toBeVisible();
    await expect(page.locator('#app [data-act="rollenPersoon"]', { hasText: 'Technisch coördinator (Onderbouw)' })).toHaveCount(1);
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

  // Verbeterplan 17-10, snelle winsten: geen dubbele knopnamen, dringend bovenaan, Observeren op de dag zelf
  test('snelle winsten: unieke knopnamen, dringend bovenaan, knop Observeren', async ({ page }) => {
    const fouten = volgFouten(page);
    await page.goto('/?demo');
    await page.evaluate(() => localStorage.clear());
    await page.goto('/?demo');
    expect(await page.evaluate(() => CC.dubbeleActies)).toEqual([]);
    await page.locator('[data-act="demoLogin"][data-pid]').nth(3).click();
    await page.locator('[data-act="magischeLink"]').click();
    await page.evaluate(() => { CC.wisselRol(CC.me().rollen.findIndex((r) => r.rol === 'hjo')); CC.S().begeleidMomenten.find((m) => m.id === 'bm-demo2').datum = CC.date.vandaag(); });
    await page.locator('nav.nav button[data-tab="home"]').click();
    // Vandaag: één tik naar het A4
    await expect(page.locator('#app [data-view="begelObs"]')).toContainText('Observeren: Dennis Peters');
    // Een training zonder trainer staat als eerste bij Te doen, niet meer onder Organisatie
    const eerste = page.locator('#app .sectie-kop:has-text("Te doen") + .lijst > .rij').first();
    await expect(eerste).toContainText('Trainer kan niet');
    await page.locator('#app [data-view="begelObs"]').click();
    await expect(page.locator('#app')).toContainText('Turven');
    await controleer(page, fouten, 'snelle winsten');
  });

  // Besluit 103: automatisch bewaren; tekst gaat niet verloren bij een andere tik of bij het sluiten van een venster
  test('automatisch bewaren in formulieren', async ({ page }) => {
    const fouten = volgFouten(page);
    await page.goto('/?demo');
    await page.evaluate(() => localStorage.clear());
    await page.goto('/?demo');
    await page.locator('[data-act="demoLogin"][data-pid]').nth(3).click();
    await page.locator('[data-act="magischeLink"]').click();
    await page.evaluate(() => { CC.wisselRol(CC.me().rollen.findIndex((r) => r.rol === 'hjo')); CC.open('begelMoment', { id: 'bm-demo2' }); });
    await page.locator('#app summary', { hasText: 'Reflectiegesprek' }).click();
    const veld = page.locator('#app form[data-submit="begelVakkenOk"] textarea[name="sterk"]');
    await veld.fill('Rustige toon langs de lijn'); await veld.press('Tab');
    await expect(page.locator('#app small.bewaard', { hasText: 'Bewaard ✓' })).toBeVisible();
    // Een andere knop aantikken (zonder Klaar): de tekst staat in het moment en is er na opnieuw tekenen nog
    await page.locator('#app summary', { hasText: 'Nazorg' }).click();
    await page.locator('#app [data-act="begelVoorbeeld"]').click();
    await page.locator('[data-act="terug"]').click();
    await expect(page.locator('#app form[data-submit="begelVakkenOk"] textarea[name="sterk"]')).toHaveValue('Rustige toon langs de lijn');
    expect(await page.evaluate(() => CC.S().begeleidMomenten.find((m) => m.id === 'bm-demo2').vakken.sterk)).toBe('Rustige toon langs de lijn');
    // Venster sluiten door ernaast te tikken: de kennismaking is bewaard, maar nog niet "ingevuld"
    await page.evaluate(() => { CC.zetSessie(CC.S().demo.mark); CC.wisselRol(CC.me().rollen.findIndex((r) => r.rol === 'trainer')); document.body.insertAdjacentHTML('beforeend', '<button id="t-ken" data-act="kennisForm" hidden></button>'); document.getElementById('t-ken').click(); });
    const beter = page.locator('#sheet textarea[name="beter"]');
    await beter.fill('Vragen stellen'); await beter.press('Tab');
    await page.locator('#sheet .sheet-bg').click({ position: { x: 5, y: 5 } });
    const k = await page.evaluate(() => CC.S().trainerKennis[CC.me().id]);
    expect(k.a.beter).toBe('Vragen stellen'); expect(k.ingevuld).toBeFalsy();
    await controleer(page, fouten, 'automatisch bewaren');
  });

  // Besluit 104: rol wisselen met één tik in de kop, met per rol wat er wacht
  test('rol wisselen in de kop', async ({ page }) => {
    const fouten = volgFouten(page);
    await page.goto('/?demo');
    await page.evaluate(() => localStorage.clear());
    await page.goto('/?demo');
    await page.locator('[data-act="demoLogin"][data-pid]').nth(1).click(); // Mark: trainer en ouder
    await page.locator('[data-act="magischeLink"]').click();
    await page.evaluate(() => CC.wisselRol(CC.me().rollen.findIndex((r) => r.rol === 'trainer')));
    await expect(page.locator('.kop [data-act="rolMenu"]')).toContainText('Trainer');
    await page.locator('.kop [data-act="rolMenu"]').click();
    await expect(page.locator('.rolmenu button')).toHaveCount(2);
    await expect(page.locator('.rolmenu button.aan')).toContainText('nu');
    // Buiten het menu tikken sluit het
    await page.locator('main').click({ position: { x: 10, y: 300 } });
    await expect(page.locator('.rolmenu')).toHaveCount(0);
    await page.waitForTimeout(400); // een tweede tik op dezelfde knop binnen 0,35 s telt niet (dubbel tikken voorkomen)
    await page.locator('.kop [data-act="rolMenu"]').click();
    await page.locator('.rolmenu button', { hasText: 'Ouder' }).click();
    expect(await page.evaluate(() => CC.rol().rol)).toBe('ouder');
    await expect(page.locator('.kop [data-act="rolMenu"]')).toContainText('Ouder');
    // Iemand met één rol ziet geen rolknop
    await page.evaluate(() => { CC.zetSessie(CC.S().demo.sanne); CC.wisselRol(0); });
    await expect(page.locator('.kop [data-act="rolMenu"]')).toHaveCount(0);
    await controleer(page, fouten, 'rol wisselen');
  });

  // Besluit 105: aan het begin van een fase (minder dan 6 keer gemeten) geen kleur en geen signaal, wel het percentage
  test('nieuwe fase: pas een kleur vanaf 6 keer gemeten', async ({ page }) => {
    const fouten = volgFouten(page);
    await page.goto('/?demo');
    await page.evaluate(() => localStorage.clear());
    await page.goto('/?demo');
    await page.locator('[data-act="demoLogin"][data-pid]').nth(1).click(); // Mark: trainer
    await page.locator('[data-act="magischeLink"]').click();
    const voor = await page.evaluate(() => { const S = CC.S(); return CC.m.signalen(S, S.teams.map((t) => t.id), true).filter((s) => ['speler', 'team'].includes(s.soort)).length; });
    expect(voor).toBeGreaterThan(0); // in de demo staan genoeg metingen: wel signalen
    const na = await page.evaluate(() => {
      const S = CC.S(); const M = CC.m; const D = CC.date;
      // Een nieuwe fase die begon bij de op twee na laatste gemeten activiteit: 3 metingen
      const gemeten = M.acts(S, S.teams[0].id, S.club.seizoen.start, D.vandaag()).filter((a) => !a.afgelast && S.pres[a.id]).map((a) => a.datum).sort();
      const van = gemeten[gemeten.length - 3];
      S.club.fasen.push({ van });
      const per = M.periode(S, 'blok'); const ts = M.teamStats(S, S.teams[0].id, per);
      return { totaal: ts.totaal, zone: M.zone(S, ts, S.teams[0].id), seizoen: M.zone(S, M.teamStats(S, S.teams[0].id, M.periode(S, 'seizoen')), S.teams[0].id), signalen: M.signalen(S, S.teams.map((t) => t.id), true).filter((s) => ['speler', 'team'].includes(s.soort)).length };
    });
    expect(na.totaal).toBeGreaterThan(0); expect(na.totaal).toBeLessThan(6);
    expect(na.zone).toBe('grijs');
    expect(na.seizoen).not.toBe('grijs'); // Heel seizoen telt alles op en heeft wel een kleur
    expect(na.signalen).toBe(0);
    await page.evaluate(() => { CC.wisselRol(CC.me().rollen.findIndex((r) => r.rol === 'trainer')); });
    await page.locator('nav >> text=Planning').click();
    await page.evaluate(() => { CC.ui.seg.aanwModus = 'overzicht'; CC.render(); });
    await expect(page.locator('#app')).toContainText('keer gemeten deze fase');
    await controleer(page, fouten, 'nieuwe fase');
  });

  // Besluit 106: selectieteam in de O13-competitie (11 tegen 11); de trainer maakt het schema zelf
  test('eigen wisselschema: opstelling, wissel, minuten en posities', async ({ page }) => {
    const fouten = volgFouten(page);
    await page.goto('/?demo');
    await page.evaluate(() => localStorage.clear());
    await page.goto('/?demo');
    await page.locator('[data-act="demoLogin"][data-pid]').nth(1).click(); // Mark: trainer
    await page.locator('[data-act="magischeLink"]').click();
    const wed = await page.evaluate(() => {
      const S = CC.S(), M = CC.m, D = CC.date; CC.wisselRol(CC.me().rollen.findIndex((r) => r.rol === 'trainer'));
      const t = M.team(S, CC.teamId()); t.type = 'selectie'; t.speelCat = 'O13';
      ['Bank1', 'Bank2'].forEach((n) => S.players.push({ id: `sp-${n}`, voornaam: n, achternaam: 'Test', teamId: t.id, ouders: [] }));
      // Een wedstrijd vandaag, zodat de klok en de wissels te zien zijn
      const a = { id: 'a-test-zelf', teamId: t.id, soort: 'wedstrijd', datum: D.vandaag(), tijd: '10:00', eind: '11:15', thuis: true, tegen: 'Testclub O13-1', veld: '', adres: '', verzamel: '09:30', tenue: '', begeleiderId: null, uitslag: null, afgelast: false };
      S.acts.push(a); CC.ui.seg.stWed = a.id; CC.save(); return { id: a.id, team: t.id };
    });
    await page.locator('nav >> text=Wedstrijd').click();
    await page.locator('[data-act="zetWisselwijze"][data-val="zelf"]').click();
    await expect(page.locator('#app')).toContainText('11 tegen 11');
    await page.locator('[data-act="zelfNieuw"]').click();
    // Basiself: elke plek met een tik, steeds de eerste speler die nog vrij is
    for (const pos of ['1', '2', '3', '4', '5', '6', '8', '10', '7', '9', '11']) {
      await page.locator(`.plek[data-pos="${pos}"]`).click();
      await page.locator('#sheet [data-act="zelfKies"]').first().click();
    }
    await expect(page.locator('.plek.leeg')).toHaveCount(0);
    // Gevonden 18-10 bij DCG (iPhone): de onderste spelers in de keuzelijst vielen van het scherm. De lijst moet tot onderaan scrollen.
    await page.setViewportSize({ width: 390, height: 560 });
    await page.locator('.plek[data-pos="9"]').click();
    // Geen lijst in het venster mag afgeknipt zijn (alles past, of het venster scrollt)
    expect(await page.evaluate(() => [...document.querySelectorAll('#sheet .sheet-body > *')].filter((x) => x.scrollHeight > x.clientHeight + 1).length)).toBe(0);
    const laatste = page.locator('#sheet [data-act="zelfKies"]').last();
    await laatste.scrollIntoViewIfNeeded();
    const box = await laatste.boundingBox(); expect(box.y + box.height).toBeLessThanOrEqual(560);
    await page.locator('#sheet .sheet-bg').click({ position: { x: 5, y: 5 } }).catch(() => page.evaluate(() => CC.closeSheet()));
    await page.evaluate(() => CC.closeSheet()); await page.setViewportSize({ width: 1280, height: 720 });
    // Wissel plannen op minuut 20 (nog geen aftrap): de rechtsback eruit, iemand van de bank erin
    const rb = await page.evaluate((id) => CC.S().speeltijd.schema[id].opstelling['2'], wed.id);
    await page.locator('[data-act="zelfWissel"]').click();
    await page.locator('#zw-m').fill('20');
    await page.locator('#zw-u').selectOption(rb);
    await page.locator('#zw-i').selectOption({ index: 1 });
    await page.locator('#sheet form[data-submit="zelfWisselOk"] button.knop').click();
    const uit = await page.evaluate(({ id, rb }) => { const sch = CC.S().speeltijd.schema[id]; const m = CC.m.schemaMinuten(sch); const inval = sch.wissels[0].in; return { rb: m[rb], inval: m[inval], pos: sch.pos[1][inval], wed: sch.wedMin }; }, { id: wed.id, rb });
    expect(uit).toEqual({ rb: 20, inval: 40, pos: '2', wed: 60 });
    // Aftrap, dan vastleggen: minuten en posities tellen mee voor het seizoen
    await page.locator('[data-act="zelfKlok"][data-k="aftrap"]').click();
    await expect(page.locator('#app')).toContainText('Minuut 0');
    const na = await page.evaluate(({ id, rb }) => { const S = CC.S(); const voor = S.speeltijd.min[rb] || 0; const a = CC.m.act(S, id); CC.wedstrijdVastleggen(S, a, CC.me().id); return { erbij: (S.speeltijd.min[rb] || 0) - voor, pos: CC.m.posMinuten(S, rb) }; }, { id: wed.id, rb });
    expect(na.erbij).toBe(20);
    expect(na.pos['2']).toBe(20);
    expect(await page.evaluate((rb) => CC.m.posVerdeling(CC.S(), rb), rb)).toEqual([{ pos: '2', min: 20, pct: 100 }]);
    // Vaste taken bij 11 tegen 11: vlagger en scheidsrechter (thuis), geen spelbegeleider
    const taken = await page.evaluate((tid) => CC.vasteTakenVoor(CC.S(), CC.m.team(CC.S(), tid)), wed.team);
    expect(taken).toContain('Vlagger'); expect(taken).not.toContain('Spelbegeleider');
    await controleer(page, fouten, 'eigen wisselschema');
  });

  // Besluit 107: de teamleider zet zelf een oefenwedstrijd in; de ouders krijgen een bericht, de trainer een melding
  test('teamleider zet een oefenwedstrijd in', async ({ page }) => {
    const fouten = volgFouten(page);
    await page.goto('/?demo');
    await page.evaluate(() => localStorage.clear());
    await page.goto('/?demo');
    await page.locator('[data-act="demoLogin"][data-pid]').nth(2).click(); // Linda: teamleider
    await page.locator('[data-act="magischeLink"]').click();
    await page.evaluate(() => CC.wisselRol(CC.me().rollen.findIndex((r) => r.rol === 'teamleider')));
    await page.locator('nav >> text=Wedstrijd').click();
    await page.locator('[data-act="tlOefen"]').click();
    await expect(page.locator('#sheet')).toContainText('Oefenwedstrijd toevoegen');
    await expect(page.locator('#w-wat')).toBeHidden();
    await page.locator('#w-t').fill('Testclub O10-3');
    await page.locator('#sheet input[name="oefThuis"][value="0"]').check();
    await page.locator('#w-oad').fill('Sportpark Test 1, Teststad');
    await page.locator('#sheet form[data-submit="wijzigPlanning"] button.knop').click();
    const r = await page.evaluate(() => { const S = CC.S(); const a = S.acts.find((x) => x.tegen === 'Testclub O10-3');
      return { soort: a && a.soort, thuis: a && a.thuis, adres: a && a.adres, trainer: S.msgs.some((m) => m.soort === 'melding' && m.ontvangers.includes(CC.m.team(S, a.teamId).trainerId)) }; });
    expect(r).toEqual({ soort: 'oefen', thuis: false, adres: 'Sportpark Test 1, Teststad', trainer: true });
    await controleer(page, fouten, 'oefenwedstrijd teamleider');
  });

  // Besluit 110: verzamelen is clubbeleid per leeftijd (de speelvorm telt); trainer of teamleider past per wedstrijd aan
  test('verzameltijd volgens de clubregel per leeftijd', async ({ page }) => {
    await page.goto('/?demo');
    await page.evaluate(() => localStorage.clear());
    await page.goto('/?demo');
    await page.locator('[data-act="demoLogin"][data-pid]').nth(2).click(); // Linda: teamleider
    await page.locator('[data-act="magischeLink"]').click();
    const r = await page.evaluate(() => { const S = CC.S(); CC.wisselRol(CC.me().rollen.findIndex((x) => x.rol === 'teamleider')); const t = CC.m.team(S, CC.teamId());
      const voor = [CC.m.verzamelMin(S, t.id, true), CC.m.verzamelMin(S, t.id, false)];
      t.speelCat = 'O13'; const o13 = [CC.m.verzamelMin(S, t.id, true), CC.m.verzamelMin(S, t.id, false)];
      delete t.speelCat; S.club.inst.verzamel = { onder: { thuis: 45, uit: 60 } }; const club = [CC.m.verzamelMin(S, t.id, true), CC.m.verzamelMin(S, t.id, false)];
      return { voor, o13, club }; });
    expect(r).toEqual({ voor: [30, 60], o13: [60, 60], club: [45, 60] });
    await page.locator('nav >> text=Wedstrijd').click();
    await page.locator('[data-act="tlOefen"]').click();
    await expect(page.locator('#sheet')).toContainText('45 minuten voor de aftrap (thuis)');
    await page.locator('#w-t').fill('Thuisclub O10-1'); await page.locator('#w-tijd').fill('10:00');
    await page.locator('#sheet form[data-submit="wijzigPlanning"] button.knop').click();
    expect(await page.evaluate(() => CC.S().acts.find((a) => a.tegen === 'Thuisclub O10-1').verzamel)).toBe('09:15');
  });

  // Gevonden 20-10 bij DCG: een verlopen urgent bericht (afgelaste training van 9 okt) bleef bovenaan Actie nodig bij ouders,
  // ook bij de trainer zelf in zijn ouderrol. Nu: verlopen en eigen berichten staan er niet meer.
  test('ouder: verlopen of eigen urgent bericht niet meer bij Actie nodig', async ({ page }) => {
    await page.goto('/?demo');
    await page.evaluate(() => localStorage.clear());
    await page.goto('/?demo');
    await page.locator('[data-act="demoLogin"][data-pid]').nth(1).click(); // Mark: trainer en ouder
    await page.locator('[data-act="magischeLink"]').click();
    await page.evaluate(() => { const S = CC.S(); const D = CC.date; const me = CC.me(); const kind = CC.kinderen()[0]; const o = [...new Set([...CC.m.oudersVan(S, kind.teamId), me.id])];
      const oud = new Date(Date.now() - 5 * 864e5).toISOString(); const gisteren = D.addDays(D.vandaag(), -1);
      S.msgs.push({ id: 'b-verlopen', van: 'systeem', soort: 'nieuws', bereik: kind.teamId, onderwerp: 'Verlopen afgelasting', tekst: 'x', tijd: oud, verloopt: gisteren, ontvangers: o, gelezen: [], antw: [], urgent: true, gepland: null });
      S.msgs.push({ id: 'b-eigen', van: me.id, vanRol: 'trainer', soort: 'nieuws', bereik: kind.teamId, onderwerp: 'Mijn eigen urgent bericht', tekst: 'x', tijd: new Date().toISOString(), ontvangers: o, gelezen: [], antw: [], urgent: true, gepland: null });
      S.msgs.push({ id: 'b-nieuw', van: 'systeem', soort: 'nieuws', bereik: kind.teamId, onderwerp: 'Nieuwe urgente melding', tekst: 'x', tijd: new Date().toISOString(), ontvangers: o, gelezen: [], antw: [], urgent: true, gepland: null });
      CC.wisselRol(me.rollen.findIndex((r) => r.rol === 'ouder')); });
    await expect(page.locator('#app')).toContainText('Nieuwe urgente melding');
    await expect(page.locator('#app')).not.toContainText('Verlopen afgelasting');
    await expect(page.locator('#app')).not.toContainText('Mijn eigen urgent bericht');
  });

  // App-controle 23-10: een dubbele tik op Versturen of Volgend blok doet maar één keer iets
  test('dubbel tikken telt één keer', async ({ page }) => {
    await page.goto('/?demo');
    await page.evaluate(() => localStorage.clear());
    await page.goto('/?demo');
    await page.locator('[data-act="demoLogin"][data-pid]').nth(1).click(); // Mark: trainer
    await page.locator('[data-act="magischeLink"]').click();
    const voor = await page.evaluate(() => { CC.wisselRol(CC.me().rollen.findIndex((r) => r.rol === 'trainer')); return CC.S().msgs.length; });
    await page.evaluate(() => CC.berichtForm ? CC.berichtForm('team') : null);
    await page.locator('#m-ond').fill('Dubbel getest'); await page.locator('#m-tekst').fill('Hallo');
    await page.evaluate(() => { const f = document.querySelector('#sheet form[data-submit="verstuurBericht"]'); f.requestSubmit(); f.requestSubmit(); });
    expect(await page.evaluate(() => CC.S().msgs.filter((m) => m.onderwerp === 'Dubbel getest').length)).toBe(1);
    expect(await page.evaluate(() => CC.S().msgs.length)).toBeGreaterThan(voor);
    // Snel na elkaar op verschillende knoppen tikken blijft gewoon werken
    expect(await page.evaluate(() => [CC.alGetikt('a', 350), CC.alGetikt('b', 350), CC.alGetikt('b', 350)])).toEqual([false, false, true]);
  });

  // Besluit 112: anoniem schermgebruik tellen (per rol en scherm), overzicht voor de clubbeheerder
  test('schermgebruik: tellen en overzicht', async ({ page }) => {
    const fouten = volgFouten(page);
    await page.goto('/?demo');
    await page.evaluate(() => localStorage.clear());
    await page.goto('/?demo');
    await page.locator('[data-act="demoLogin"][data-pid]').nth(3).click(); // Peter: HJO en clubbeheerder
    await page.locator('[data-act="magischeLink"]').click();
    await page.evaluate(() => { window.__tel = []; CC.telScherm = (rol, scherm) => window.__tel.push(`${rol}|${scherm}`);
      CC.haalGebruik = async () => [{ rol: 'ouder', scherm: 'planning', aantal: 23, dagen: 6 }, { rol: 'trainer', scherm: 'speler', aantal: 4, dagen: 2 }]; });
    await page.locator('nav >> text=Inzicht').click();
    await page.evaluate(() => CC.render()); // opnieuw tekenen op hetzelfde scherm telt niet nog een keer
    expect(await page.evaluate(() => window.__tel.filter((x) => x === 'hjo|inzicht').length)).toBe(1);
    await page.evaluate(() => CC.wisselRol(CC.me().rollen.findIndex((r) => r.rol === 'beheerder')));
    await page.locator('#gebruik summary').click();
    await expect(page.locator('#gebruik')).toContainText('Planning');
    await expect(page.locator('#gebruik')).toContainText('23×');
    await expect(page.locator('#gebruik')).toContainText('Spelerpagina');
    await controleer(page, fouten, 'schermgebruik');
  });

  // Besluit 113: tik op een speler → venster (spelerskaart); "Alles over …" opent de pagina; vegen sluit het venster
  test('spelerskaart als venster en vegen om te sluiten', async ({ page }) => {
    const fouten = volgFouten(page);
    await page.goto('/?demo');
    await page.evaluate(() => localStorage.clear());
    await page.goto('/?demo');
    await page.locator('[data-act="demoLogin"][data-pid]').nth(1).click(); // Mark: trainer
    await page.locator('[data-act="magischeLink"]').click();
    await page.evaluate(() => { CC.wisselRol(CC.me().rollen.findIndex((r) => r.rol === 'trainer')); CC.go('spelers'); });
    await page.locator('#app [data-act="spelerKaart"]').first().click();
    await expect(page.locator('#sheet .sheet')).toBeVisible();
    await expect(page.locator('#sheet')).toContainText('aanwezig');
    await expect(page.locator('#sheet [data-act="gesprekVastleggen"]')).toBeVisible();
    expect(await page.evaluate(() => CC.ui.view)).toBeNull(); // je blijft op het tabblad
    // Vegen naar beneden vanaf de greep sluit het venster
    const box = await page.locator('#sheet .greep').boundingBox();
    const cdp = await page.context().newCDPSession(page);
    const punt = (y) => [{ x: box.x + 20, y }];
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: punt(box.y + 2) });
    for (const d of [20, 60, 120, 180]) await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: punt(box.y + 2 + d) });
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await expect(page.locator('#sheet')).toBeHidden();
    await page.waitForTimeout(400); // dubbel-tik-bewaking (Besluit 111)
    // Opnieuw openen en door naar de volledige pagina
    await page.locator('#app [data-act="spelerKaart"]').first().click();
    await page.locator('#sheet [data-act="open"][data-view="speler"]').click();
    await expect(page.locator('#sheet')).toBeHidden();
    expect(await page.evaluate(() => CC.ui.view.naam)).toBe('speler');
    await controleer(page, fouten, 'spelerskaart');
  });

  test('trainerkaart als venster (HO, Rapport trainers)', async ({ page }) => {
    const fouten = volgFouten(page);
    await page.goto('/?demo');
    await page.evaluate(() => localStorage.clear());
    await page.goto('/?demo');
    await page.locator('[data-act="demoLogin"][data-pid]').nth(3).click(); // Peter: HJO
    await page.locator('[data-act="magischeLink"]').click();
    await page.evaluate(() => { CC.wisselRol(CC.me().rollen.findIndex((r) => r.rol === 'hjo')); CC.open('trainersRapport', { alle: 1 }); });
    await page.locator('#app [data-act="trainerKaart"]', { hasText: 'Dennis Peters' }).first().click();
    await expect(page.locator('#sheet')).toContainText('Dennis Peters');
    await expect(page.locator('#sheet')).toContainText('momenten');
    await expect(page.locator('#sheet [data-act="trainerContact"]')).toBeVisible();
    expect(await page.evaluate(() => CC.ui.view.naam)).toBe('trainersRapport');
    // Volgen wisselen houdt het venster open
    await page.locator('#sheet [data-act="trainerKaartVolg"]').click();
    await expect(page.locator('#sheet [data-act="trainerKaartVolg"]')).toBeVisible();
    await page.waitForTimeout(400);
    await page.locator('#sheet [data-act="open"][data-view="trainerDetail"]').click();
    await expect(page.locator('#sheet')).toBeHidden();
    expect(await page.evaluate(() => CC.ui.view.naam)).toBe('trainerDetail');
    await controleer(page, fouten, 'trainerkaart');
  });

  test('venster: telefoon onderaan, laptop in het midden', async ({ page }) => {
    await page.goto('/?demo');
    await page.evaluate(() => localStorage.clear());
    await page.goto('/?demo');
    await page.locator('[data-act="demoLogin"][data-pid]').nth(1).click(); // Mark: trainer
    await page.locator('[data-act="magischeLink"]').click();
    await page.evaluate(() => { CC.wisselRol(CC.me().rollen.findIndex((r) => r.rol === 'trainer')); CC.go('spelers'); });
    const meet = async () => page.evaluate(() => { const r = document.querySelector('#sheet .sheet').getBoundingClientRect(); return { onder: Math.round(innerHeight - r.bottom), midden: Math.round((r.top + r.bottom) / 2 - innerHeight / 2), greep: getComputedStyle(document.querySelector('#sheet .greep')).display }; });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.locator('#app [data-act="spelerKaart"]').first().click();
    await page.waitForTimeout(400);
    let m = await meet(); expect(m.onder).toBe(0); expect(m.greep).not.toBe('none');
    await page.evaluate(() => CC.closeSheet());
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.waitForTimeout(400);
    await page.locator('#app [data-act="spelerKaart"]').first().click();
    await page.waitForTimeout(400);
    m = await meet(); expect(Math.abs(m.midden)).toBeLessThan(3); expect(m.greep).toBe('none');
    await page.keyboard.press('Escape');
    await expect(page.locator('#sheet')).toBeHidden();
  });

  // Gevonden bij Besluit 114: een chauffeur die alleen ouder is, zag "X rijdt niet mee" niet (persoonlijk bericht van een andere ouder)
  test('chauffeur (ouder) ziet dat een kind niet meerijdt', async ({ page }) => {
    await page.goto('/?demo');
    await page.evaluate(() => localStorage.clear());
    await page.goto('/?demo');
    await page.locator('[data-act="demoLogin"][data-pid]').nth(2).click(); // Linda: ouder van Noah
    await page.locator('[data-act="magischeLink"]').click();
    await page.evaluate(() => { const S = CC.S(), M = CC.m; CC.wisselRol(CC.me().rollen.findIndex((r) => r.rol === 'ouder'));
      const noah = S.players.find((p) => p.voornaam === 'Noah'); const a = M.komend(S, noah.teamId).find(M.isWed);
      M.neemMee(S, a, noah, S.demo.sanne); CC.ritVervalt(S, a, noah, 'Noah is afgemeld'); CC.save();
      CC.zetSessie(S.demo.sanne); CC.wisselRol(Math.max(0, CC.me().rollen.findIndex((r) => r.rol === 'ouder'))); CC.go('berichten'); });
    await expect(page.locator('#app')).toContainText('Noah rijdt');
  });

  // Besluit 115: trainer kan niet → teamleider en coördinator krijgen bericht; zonder coördinator de HO (terugval)
  test('trainer kan niet: bericht naar coördinator, anders HO', async ({ page }) => {
    await page.goto('/?demo');
    await page.evaluate(() => localStorage.clear());
    await page.goto('/?demo');
    await page.locator('[data-act="demoLogin"][data-pid]').nth(1).click(); // Mark: trainer O10-1
    await page.locator('[data-act="magischeLink"]').click();
    const vraag = async () => page.evaluate(() => { const S = CC.S(), M = CC.m; CC.wisselRol(CC.me().rollen.findIndex((r) => r.rol === 'trainer'));
      const a = M.komend(S, 'O10-1').find((x) => x.soort === 'training' && !x.afgelast && !x.trainerAfwezig);
      const b = document.createElement('button'); b.dataset.act = 'kanNiet'; b.dataset.id = a.id; document.body.appendChild(b); b.click(); b.remove();
      const f = document.querySelector('#sheet form[data-submit="kanNietOk"]'); f.r.value = 'werk'; f.requestSubmit();
      const m = S.msgs.filter((x) => /Vervanger nodig/.test(x.onderwerp)).pop();
      return { esther: m.ontvangers.includes(S.demo.esther), peter: m.ontvangers.includes(S.demo.peter), linda: m.ontvangers.includes(S.demo.linda) }; });
    expect(await vraag()).toEqual({ esther: true, peter: false, linda: true });
    await expect(page.locator('#toast')).toContainText('teamleider en coördinator');
    await page.waitForTimeout(1600);
    await page.evaluate(() => { CC.S().club.coordinatorAan = false; CC.save(); });
    expect(await vraag()).toEqual({ esther: false, peter: true, linda: true });
  });

  // Besluit 116: minuten en speeltijd ziet alleen de trainer (niet de teamleider of de timekeeper)
  test('speeltijd: alleen de trainer ziet minuten', async ({ page }) => {
    const fouten = volgFouten(page);
    await page.goto('/?demo');
    await page.evaluate(() => localStorage.clear());
    await page.goto('/?demo');
    await page.locator('[data-act="demoLogin"][data-pid]').nth(2).click(); // Linda: teamleider (en ouder)
    await page.locator('[data-act="magischeLink"]').click();
    await page.evaluate(() => { CC.wisselRol(CC.me().rollen.findIndex((r) => r.rol === 'teamleider')); CC.open('speeltijd', { team: CC.teamId() }); });
    await expect(page.locator('#app')).not.toContainText('Speeltijd dit seizoen');
    await page.evaluate(() => CC.go('team'));
    await page.locator('#app [data-act="spelerKaart"]').first().click();
    await expect(page.locator('#sheet')).not.toContainText('% speeltijd');
    await page.evaluate(() => { CC.closeSheet(); CC.zetSessie(CC.S().demo.mark); CC.wisselRol(CC.me().rollen.findIndex((r) => r.rol === 'trainer')); CC.go('speeltijd'); });
    await expect(page.locator('#app')).toContainText('Speeltijd dit seizoen');
    await controleer(page, fouten, 'speeltijd alleen trainer');
  });

  // Besluit 117: mocht de timekeeper niet opslaan, dan gaat het als voorstel naar de trainer, die het met één tik overneemt
  test('voorstel timekeeper: doorsturen en overnemen', async ({ page }) => {
    const fouten = volgFouten(page);
    await page.goto('/?demo');
    await page.evaluate(() => localStorage.clear());
    await page.goto('/?demo');
    await page.locator('[data-act="demoLogin"][data-pid]').nth(0).click(); // Sanne: ouder
    await page.locator('[data-act="magischeLink"]').click();
    const aid = await page.evaluate(() => { const S = CC.S(), M = CC.m; const a = M.komend(S, 'O10-1').find((x) => M.isWed(x) && !x.afgelast);
      const goals = [{ id: 'g1', wij: true, spelerId: S.players.find((p) => p.voornaam === 'Jesse').id }, { id: 'g2', wij: true }, { id: 'g3', wij: false }];
      const n = CC.wedVoorstel(S, [{ soort: 'acts', id: a.id, data: { ...a, goals, uitslag: a.thuis ? '2-1' : '1-2', uitslagKlaar: true } }, { soort: 'pres', id: a.id + '|_', data: {} }], CC.me().id);
      CC.save(); window.__n = n; return a.id; });
    expect(await page.evaluate(() => window.__n)).toBe(1);
    expect(await page.evaluate((id) => { const S = CC.S(), M = CC.m; const a = M.act(S, id); return CC.scorebord(S, a, M.team(S, a.teamId)); }, aid)).toContain('Doorgestuurd naar');
    // De trainer ziet het op Home en neemt het over
    await page.evaluate(() => { CC.zetSessie(CC.S().demo.mark); CC.wisselRol(CC.me().rollen.findIndex((r) => r.rol === 'trainer')); CC.go('home'); });
    await page.locator('#app [data-act="voorstelZien"]').first().click();
    await expect(page.locator('#sheet .groot-cijfer')).toBeVisible();
    await page.locator('#sheet [data-act="voorstelOver"]').click();
    const na = await page.evaluate((id) => { const S = CC.S(); const a = CC.m.act(S, id); return { goals: (a.goals || []).length, klaar: !!a.uitslagKlaar, voorstel: !!S.wedVoorstel[id], pres: !!S.pres[id] }; }, aid);
    expect(na).toEqual({ goals: 3, klaar: true, voorstel: false, pres: true });
    await expect(page.locator('#app [data-act="voorstelZien"]')).toHaveCount(0);
    await controleer(page, fouten, 'voorstel timekeeper');
  });

  // Besluit 118: keuze- en filterknoppen, balkjes en de rolwissel minimaal 44 pt tikvlak
  test('tikvlakken minimaal 44 pt', async ({ page }) => {
    await page.goto('/?demo');
    await page.evaluate(() => localStorage.clear());
    await page.goto('/?demo');
    await page.locator('[data-act="demoLogin"][data-pid]').nth(3).click(); // Peter: HJO
    await page.locator('[data-act="magischeLink"]').click();
    for (const tab of ['teams', 'inzicht']) {
      await page.evaluate((t) => { CC.wisselRol(CC.me().rollen.findIndex((r) => r.rol === 'hjo')); CC.go(t); }, tab);
      const klein = await page.evaluate(() => [...document.querySelectorAll('#app .seg button, #app .chipknop, #app button.staaf')].filter((e) => e.getBoundingClientRect().height < 44).length);
      expect(klein, tab).toBe(0);
    }
    // De rolwissel: ook een tik net eronder is raak
    expect(await page.evaluate(() => { const r = document.querySelector('.rolknop').getBoundingClientRect(); const e = document.elementFromPoint(r.left + 8, r.bottom + 12); return !!(e && e.closest('.rolknop')); })).toBe(true);
  });

  test('spelerskaart: teamleider', async ({ page }) => {
    const fouten = volgFouten(page);
    await page.goto('/?demo');
    await page.evaluate(() => localStorage.clear());
    await page.goto('/?demo');
    await page.locator('[data-act="demoLogin"][data-pid]').nth(2).click(); // Linda: teamleider
    await page.locator('[data-act="magischeLink"]').click();
    await page.evaluate(() => CC.wisselRol(CC.me().rollen.findIndex((r) => r.rol === 'teamleider')));
    await page.evaluate(() => CC.go('team'));
    await page.locator('#app [data-act="spelerKaart"]').first().click();
    await expect(page.locator('#sheet')).toContainText('Alles over');
    await controleer(page, fouten, 'spelerskaart teamleider');
  });

  // Besluit 107: bij je eigen bericht zie je hoe het aankwam (pushmelding, e-mail of gelezen in de app)
  test('berichten: zien hoe het aankwam', async ({ page }) => {
    const fouten = volgFouten(page);
    await page.goto('/?demo');
    await page.evaluate(() => localStorage.clear());
    await page.goto('/?demo');
    await page.locator('[data-act="demoLogin"][data-pid]').nth(1).click(); // Mark
    await page.locator('[data-act="magischeLink"]').click();
    const id = await page.evaluate(() => { const S = CC.S(); const me = CC.me(); const tid = CC.teamId(); const o = CC.m.oudersVan(S, tid); const o2 = o.filter((x) => x !== me.id); // de afzender telt niet mee
      const m = { id: 'b-test-aank', van: me.id, soort: 'nieuws', bereik: tid, onderwerp: 'Testbericht aankomst', tekst: 'Hallo', tijd: new Date().toISOString(), ontvangers: o, gelezen: [o2[0]], antw: [], urgent: false, gepland: null, mail: true };
      S.msgs.push(m); S.bezorgd = { [m.id]: { van: me.id, ontvangers: o, push: [o2[1]], mail: o2.slice(2), antw: {} } };
      // Gesprek: het antwoord van Mark kwam per e-mail aan bij de ander
      const ander = o[0]; S.msgs.push({ id: 'b-test-gesp', van: ander, soort: 'persoonlijk', bereik: 'x', onderwerp: 'Vraag', tekst: 'Kan het?', tijd: new Date(Date.now() - 6e4).toISOString(), ontvangers: [me.id], gelezen: [me.id], antw: [{ van: me.id, tekst: 'Ja hoor', tijd: new Date().toISOString() }], urgent: false, gepland: null });
      S.bezorgd['b-test-gesp'] = { van: ander, ontvangers: [me.id], push: [me.id], mail: [], antw: { 1: { push: [], mail: [ander] } } };
      CC.save(); return { n: o2.length, app: 1, push: 1, mail: o2.length - 2 };
    });
    await page.evaluate(() => CC.open('bericht', { id: 'b-test-aank' }));
    await expect(page.locator('#app [data-act="aankomstVenster"]')).toContainText(`Aangekomen bij ${id.n} van ${id.n}`);
    // Besluit 113: het venster groepeert wie het kreeg (app, pushmelding, e-mail)
    await page.locator('#app [data-act="aankomstVenster"]').click();
    await expect(page.locator('#sheet')).toContainText(`Gelezen in de app (${id.app})`);
    await expect(page.locator('#sheet')).toContainText(`Pushmelding (${id.push})`);
    await expect(page.locator('#sheet')).toContainText(`E-mail (${id.mail})`);
    await expect(page.locator('#sheet')).not.toContainText('Nog niet aangekomen');
    await page.evaluate(() => { const S = CC.S(); const b = S.bezorgd['b-test-aank']; b.mail = b.mail.slice(1); CC.closeSheet(); CC.render(); });
    await page.waitForTimeout(400);
    await page.locator('#app [data-act="aankomstVenster"]').click();
    await expect(page.locator('#sheet')).toContainText('Nog niet aangekomen (1)');
    await expect(page.locator('#sheet .contactknoppen')).toHaveCount(1);
    await page.evaluate(() => CC.closeSheet());
    await page.evaluate(() => CC.open('bericht', { id: 'b-test-gesp' }));
    await expect(page.locator('#app')).toContainText('✉ Gemaild naar');
    await controleer(page, fouten, 'aankomst berichten');
  });

  // Gevonden 17-10 bij DCG: een lange teamnaam ("O12 talententeam") liep over het balkje heen
  test('inzicht: lange teamnaam overlapt het balkje niet', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 800 });
    await page.goto('/?demo');
    await page.evaluate(() => localStorage.clear());
    await page.goto('/?demo');
    await page.locator('[data-act="demoLogin"][data-pid]').nth(3).click(); // Peter: HJO
    await page.locator('[data-act="magischeLink"]').click();
    await page.evaluate(() => { CC.S().teams.forEach((t) => { t.naam = `${t.naam} talententeam`; }); CC.render(); });
    await page.locator('nav >> text=Inzicht').click();
    const overlap = await page.evaluate(() => [...document.querySelectorAll('.staaf')].filter((s) => {
      const naam = s.children[0].getBoundingClientRect(); const balk = s.children[1].getBoundingClientRect();
      return naam.right > balk.left + 1 || s.children[0].scrollWidth > s.children[0].clientWidth + 1;
    }).length);
    expect(overlap).toBe(0);
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

  // Besluit 117: in de echte versie weigert de database de uitslag van een ouder → voorstel in de database → trainer neemt over
  test('timekeeper mag niet opslaan: voorstel naar de trainer', async ({ page }) => {
    const fouten = volgFouten(page);
    await nepDatabase(page);
    await page.evaluate(() => { const db = JSON.parse(sessionStorage.getItem('fake-sb-db')); const d = CC.date.vandaag();
      const a = { id: 'w-test', teamId: 'O12-1', soort: 'wedstrijd', datum: d, tijd: '00:01', eind: '00:02', thuis: true, tegen: 'Testclub O12-2', afgelast: false };
      db.rows['dcg|acts|w-test'] = { club_id: 'dcg', soort: 'acts', id: 'w-test', scope: 'team', team_id: 'O12-1', speler_id: null, persoon_id: null, act_id: 'w-test', data: a };
      sessionStorage.setItem('fake-sb-db', JSON.stringify(db)); });
    await inloggen(page, 'amin@test.nl');
    await page.evaluate(() => { sessionStorage.setItem('fake-sb-weiger', JSON.stringify(['acts'])); const S = CC.S(); const a = CC.m.act(S, 'w-test');
      a.goals = [{ id: 'g1', wij: true, spelerId: 's2' }, { id: 'g2', wij: false }, { id: 'g3', wij: true, spelerId: null }]; a.uitslag = '2-1'; a.uitslagKlaar = true; CC.save(); });
    await expect.poll(async () => Object.values((await nepDb(page)).rows).filter((r) => r.soort === 'wedVoorstel').length, { message: 'voorstel in de database' }).toBe(1);
    await expect(page.locator('#toast')).toContainText('Doorgestuurd');
    // Trainer (beheerder is ook trainer van O12-1) neemt over
    await page.evaluate(() => { sessionStorage.removeItem('fake-sb-weiger'); CC.logout(); });
    await inloggen(page, 'admin@test.nl');
    await page.evaluate(() => { CC.wisselRol(CC.me().rollen.findIndex((r) => r.rol === 'trainer')); CC.go('home'); });
    await page.locator('#app [data-act="voorstelOver"]').first().click();
    await expect.poll(async () => { const db = await nepDb(page); return [db.rows['dcg|acts|w-test'].data.uitslag, Object.values(db.rows).filter((r) => r.soort === 'wedVoorstel').length]; }, { message: 'overgenomen en voorstel weg' }).toEqual(['2-1', 0]);
    await controleer(page, fouten, 'voorstel overnemen');
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
    await page.locator('#app form[data-submit="hoNotitieOk"] textarea').press('Tab');
    // Besluit 103: in de echte versie pas "Bewaard ✓" als de database het heeft
    await expect(page.locator('#app small.bewaard', { hasText: 'Bewaard ✓' })).toBeVisible();
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
// Besluit 114: de rondleiding als één verhaal; het bestuur kiest de hoofdstukken; afmelden gebeurt echt en springt over
test('rondleiding: kiezen, afmelden springt over, opnieuw beginnen', async ({ page }) => {
  const fouten = volgFouten(page);
  await page.setViewportSize({ width: 1366, height: 768 });
  await page.route('**/app/vendor/supabase.js', (r) => r.fulfill({ contentType: 'application/javascript', body: NEP_SUPABASE }));
  await page.goto('/demo'); await page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); }); await page.goto('/demo');
  await page.fill('#dm', 'admin@test.nl'); await page.locator('#dm').press('Enter');
  await page.fill('#dc', '123456'); await page.locator('#dc').press('Enter');
  await expect(page.locator('#rondleiding .rl-titel')).toHaveText('Een week bij VV De Voorbeeldclub');
  // Alleen Ouder en Trainer
  for (const h of ['Teamleider', 'Wedstrijddag', 'De club']) await page.locator(`#rondleiding input[value="${h}"]`).uncheck();
  await page.locator('#rondleiding [data-submit="rlBegin"] button').click();
  expect(await page.evaluate(() => [...new Set(CC.demoStappen.map((s) => s.hfd))])).toEqual(['Proloog', 'Ouder', 'Trainer', 'Slot']);
  // Stap 2: Sanne meldt Jesse af; Volgende = op Afmelden tikken
  await page.locator('#rondleiding [data-act="rlVolgende"]').click();
  await expect(page.locator('#rondleiding .rl-titel')).toHaveText('Jesse is ziek');
  await expect(page.locator('#sheet form[data-submit="bevestigAfmelden"]')).toBeVisible();
  await page.waitForTimeout(400);
  await page.locator('#rondleiding [data-act="rlVolgende"]').click();
  await expect(page.locator('#rondleiding .rl-titel')).toHaveText('De chauffeur hoort het vanzelf');
  const st = await page.evaluate(() => { const S = CC.S(); const j = S.players.find((p) => p.voornaam === 'Jesse');
    return { afm: S.afm.filter((x) => x.spelerId === j.id && x.reden === 'Ziek').length, rit: S.msgs.filter((m) => m.rit && m.onderwerp.startsWith('Jesse')).length }; });
  expect(st.afm).toBeGreaterThan(0); expect(st.rit).toBe(1);
  await expect(page.locator('#app')).toContainText('Jesse rijdt');
  await page.waitForTimeout(400);
  await page.locator('#rondleiding [data-act="rlVolgende"]').click();
  await expect(page.locator('#rondleiding .rl-titel')).toHaveText('Het springt over');
  await expect(page.locator('#rondleiding .rl-spoor')).toContainText('Sanne meldt Jesse af');
  await expect(page.locator('#rl-rand')).toBeVisible();
  // Opnieuw beginnen: de afmelding is weer weg en je kiest opnieuw
  await page.locator('#rondleiding [data-act="rlOpnieuw"]').click();
  await expect(page.locator('#rondleiding [data-submit="rlBegin"]')).toBeVisible();
  expect(await page.evaluate(() => { const S = CC.S(); const j = S.players.find((p) => p.voornaam === 'Jesse'); return S.afm.filter((x) => x.spelerId === j.id && x.reden === 'Ziek' && Date.now() - new Date(x.tijd).getTime() < 6e5).length; })).toBe(0);
  expect(fouten).toEqual([]);
});

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
      await page.locator('#rondleiding [data-submit="rlBegin"] button').click();
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
    await page.locator('#rondleiding [data-submit="rlBegin"] button').click(); // Besluit 114: eerst kiezen wat je wilt zien (alles staat aan)
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

// Trainingsmodule, stap 3: testscherm van de tekentool (/tekenen), alleen op het toestel
test('tekentool: tekenen, opslaan en opnieuw tonen', async ({ page }) => {
  const fouten = volgFouten(page);
  await page.setViewportSize({ width: 1366, height: 820 });
  await page.goto('/tekenen'); await page.evaluate(() => localStorage.clear()); await page.goto('/tekenen');
  await page.locator('#nieuw').click();
  await expect(page.locator('#drawOverlay')).toBeVisible();
  const veld = await page.locator('#drawSvg').boundingBox();
  await page.keyboard.press('1');
  await page.mouse.click(veld.x + veld.width * 0.3, veld.y + veld.height * 0.4);
  await page.mouse.click(veld.x + veld.width * 0.5, veld.y + veld.height * 0.5);
  await page.keyboard.press('H');
  await page.mouse.click(veld.x + veld.width * 0.7, veld.y + veld.height * 0.3);
  await page.locator('#drawSave').click();
  await expect(page.locator('#drawOverlay')).toBeHidden();
  await expect(page.locator('.tegel svg')).toHaveCount(1);
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('cc-tekentool-test'))[0].data.items.length)).toBe(3);
  expect(fouten).toEqual([]);
});

// 27-10: de kop noemt de clubnaam niet twee keer (HJO en clubbeheerder hebben de club al als titel)
test('kop: clubnaam niet dubbel bij de HJO', async ({ page }) => {
  await page.goto('/?demo');
  await page.evaluate(() => localStorage.clear());
  await page.goto('/?demo');
  await page.locator('[data-act="demoLogin"][data-pid]').nth(3).click();
  await page.locator('[data-act="magischeLink"]').click();
  const kop = await page.locator('header.kop .kop-tekst').innerText();
  const club = await page.evaluate(() => CC.S().club.naam);
  expect(kop.split(club).length - 1).toBe(1);
});

// 27-10: Home links en Berichten rechts bij elke rol; ouder: alleen Berichten heeft een getal; Regels en Inzicht ingeklapt; laptop: menu links
test('tabbladen gelijk, één keer signaleren, lange schermen ingeklapt, laptop-menu', async ({ page }) => {
  const fouten = volgFouten(page);
  await page.goto('/?demo');
  await page.evaluate(() => localStorage.clear());
  await page.goto('/?demo');
  await page.locator('[data-act="demoLogin"]').first().click();
  await page.locator('[data-act="magischeLink"]').click();
  const r = await page.evaluate(() => {
    const S = CC.S(); const uit = {};
    S.people.forEach((p) => p.rollen.forEach((rol, i) => { if (uit[rol.rol]) return; CC.zetSessie(p.id); CC.wisselRol(i); const t = CC.rollen[rol.rol].tabs(S).filter(Boolean); uit[rol.rol] = { eerste: t[0][0], laatste: t[t.length - 1][0], namen: t.map((x) => x[1]) }; }));
    return uit;
  });
  for (const [rol, t] of Object.entries(r)) { expect(t.eerste, rol).toBe('home'); expect(t.laatste, rol).toBe('berichten'); }
  expect(r.trainer.namen).toEqual(['Home', 'Planning', 'Wedstrijd', 'Spelers', 'Berichten']);
  // ouder: geen getal op Vervoer en Taken
  await page.evaluate(() => { const S = CC.S(); const p = S.people.find((x) => x.rollen.some((r) => r.rol === 'ouder')); CC.zetSessie(p.id); CC.wisselRol(p.rollen.findIndex((r) => r.rol === 'ouder')); });
  expect(await page.locator('nav.nav button[data-tab="vervoer"] .badge, nav.nav button[data-tab="taken"] .badge').count()).toBe(0);
  // clubbeheerder: Regels ingeklapt, Modules staat erin
  await page.evaluate(() => { const S = CC.S(); const p = S.people.find((x) => x.rollen.some((r) => r.rol === 'beheerder')); CC.zetSessie(p.id); CC.wisselRol(p.rollen.findIndex((r) => r.rol === 'beheerder')); });
  await page.locator('nav.nav button[data-tab="regels"]').click();
  expect(await page.locator('#app details.onderwerp').count()).toBeGreaterThan(5);
  expect(await page.locator('#app details.onderwerp[open]').count()).toBe(0);
  await page.locator('#app details.onderwerp > summary', { hasText: 'Modules' }).click();
  await expect(page.locator('#app input[data-change="module"]').first()).toBeVisible();
  // laptop: menu als kolom links
  await page.setViewportSize({ width: 1366, height: 860 });
  const nav = await page.locator('nav.nav').boundingBox();
  expect(nav.x).toBe(0); expect(nav.height).toBeGreaterThan(800);
  await controleer(page, fouten, 'tabbladen');
});

// Besluit 123: het opleidingsprofiel van de club wordt gelezen, maar nooit door de app overschreven of weggehaald
test('opleidingsprofiel: de app leest het en laat het staan', async ({ page }) => {
  const fouten = volgFouten(page);
  await nepDatabase(page);
  const profiel = JSON.parse(require('fs').readFileSync(require('path').join(__dirname, '..', 'supabase', 'profielen', 'dcg.json'), 'utf8'));
  await page.evaluate((data) => { const db = JSON.parse(sessionStorage.getItem('fake-sb-db')); db.rows['dcg|profiel|dcg'] = { club_id: 'dcg', soort: 'profiel', id: 'dcg', scope: 'hjo', data }; sessionStorage.setItem('fake-sb-db', JSON.stringify(db)); }, profiel);
  await inloggen(page, 'admin@test.nl');
  expect(await page.evaluate(() => CC.S().profielen.dcg.onderdelen.leerlijnen.items.length)).toBe(6);
  // iets opslaan: het profiel blijft in de database
  await page.evaluate(() => { CC.S().club.privacyContact = 'test@test.nl'; CC.save(); });
  await expect.poll(async () => Object.values((await nepDb(page)).rows).find((r) => r.soort === 'club').data.privacyContact).toBe('test@test.nl');
  expect((await nepDb(page)).rows['dcg|profiel|dcg']).toBeTruthy();
  await controleer(page, fouten, 'profiel');
});

// Besluit 124: nummerbalk in de tekentool (nummer tikken = speler op zijn plek, nog een keer = weg, zonder nummer, nummer van een gekozen speler wijzigen)
test('tekentool: nummerbalk en rood schijfje', async ({ page }) => {
  const fouten = volgFouten(page);
  await page.setViewportSize({ width: 1366, height: 820 });
  await page.goto('/tekenen'); await page.evaluate(() => localStorage.clear()); await page.goto('/tekenen');
  await page.locator('#nieuw').click();
  await expect(page.locator('#drawSelBar')).toBeHidden();
  for (const n of [1, 3, 4, 6, 9, 10]) await page.locator(`[data-nr="rood|${n}"]`).click();
  await page.locator('[data-nr="rood|4"]').click(); // weg
  await page.locator('[data-nr="geel|0"]').click();
  await page.locator('[data-nr="geel|0"]').click();
  await expect(page.locator('[data-nr="rood|3"]')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('[data-nr="rood|4"]')).toHaveAttribute('aria-pressed', 'false');
  await expect(page.locator('[data-nr="geel|0"]')).toContainText('(2)');
  // speler 9 kiezen en nummer 11 geven
  await page.locator('#drawSvg g[data-i]', { has: page.locator('text', { hasText: /^9$/ }) }).click();
  await page.locator('[data-nr="rood|11"]').click();
  await expect(page.locator('#drawSelBar')).toBeVisible();
  // rood schijfje bestaat
  await expect(page.locator('[data-draw-tool][aria-label="Schijfje rood"]')).toHaveCount(1);
  await page.locator('#drawSave').click();
  await expect(page.locator('#drawOverlay')).toBeHidden();
  const items = await page.evaluate(() => JSON.parse(localStorage.getItem('cc-tekentool-test'))[0].data.items.filter((x) => x.t === 'p').map((x) => `${x.c}${x.n || ''}`).sort());
  expect(items).toEqual(['geel', 'geel', 'rood1', 'rood10', 'rood11', 'rood3', 'rood6']);
  expect(fouten).toEqual([]);
});
