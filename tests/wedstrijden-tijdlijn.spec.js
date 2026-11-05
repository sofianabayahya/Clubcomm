// ClubComm — Besluit 167: wedstrijden aanpassen (HO, tabblad Teams; ook opnieuw plakken) en Mijn traject als tijdlijn (trainer).
const { test, expect } = require('@playwright/test');
const { volgFouten, controleer, nepDatabase, inloggen, nepDb } = require('./hulp');

const club = async (page) => {
  await page.clock.setFixedTime(new Date('2026-11-04T10:00:00+01:00'));
  await page.setViewportSize({ width: 390, height: 844 });
  await nepDatabase(page);
  await page.evaluate(() => {
    const S = kleineClub(CC); S.club.pakket = 'trainers'; S.players = [];
    S.teams = [['O14-1', 'JO14-1', 'O14', 'p-a']].map(([id, naam, cat, tr]) => ({ id, naam, cat, type: 'selectie', rooster: [], afwijking: {}, trainerId: tr, teamleiderId: null }));
    const p = (id, naam, email, rollen) => ({ id, naam, email, tel: '', rollen });
    S.people = [p('p-ho', 'Hanna Oost', 'ho@test.nl', [{ rol: 'hjo' }, { rol: 'beheerder' }]), p('p-a', 'Arie Aal', 'a@test.nl', [{ rol: 'trainer', teamId: 'O14-1' }])];
    const w = (id, datum, tijd, thuis, tegen) => ({ id, teamId: 'O14-1', soort: 'wedstrijd', datum, tijd, eind: tijd, thuis, tegen, veld: '', afgelast: false, uitslag: null });
    S.acts = [w('w1', '2026-11-07', '09:00', true, 'Testclub JO14-3'), w('w2', '2026-11-14', '10:30', false, 'Testclub JO14-1')];
    S.trainerDossier = { 'p-a': { traject: { actief: true, sinds: '2026-10-01', door: 'p-ho', plan: { wedstrijd: 1, training: 0 }, leerdoel: 'Vaste coachmomenten', ontwikkelpunt: '' } } };
    S.begeleidMomenten = [{ id: 'bm1', trainerId: 'p-a', teamId: 'O14-1', actId: 'w1', soort: 'wedstrijd', datum: '2026-11-07', door: 'p-ho', klaar: false, gevraagd: '2026-11-01T10:00:00.000Z', voor: {}, plan: {}, obs: { punten: {}, notities: {}, klok: null, turf: {} }, vakken: {} }];
    const rows = {}; CC.naarRijen(S, 'dcg').forEach((r) => { rows[`dcg|${r.soort}|${r.id}`] = r; }); sessionStorage.setItem('fake-sb-db', JSON.stringify({ rows, lid: {}, user: null }));
  });
};
const teamVenster = async (page) => { await page.locator('nav.nav button[data-tab="teams"]').click(); await page.locator('#app [data-act="teamBeheer"]', { hasText: 'JO14-1' }).click(); };

test('HO past een wedstrijd aan: het moment schuift mee en de trainer krijgt één bericht', { tag: ['@begeleiden', '@kleineclub', '@rooster'] }, async ({ page }) => {
  const fouten = volgFouten(page);
  await club(page); await inloggen(page, 'ho@test.nl');
  await page.evaluate(() => CC.wisselRol(CC.me().rollen.findIndex((r) => r.rol === 'hjo')));
  await teamVenster(page);
  const rij = page.locator('#sheet [data-act="wedBewerk"][data-id="w1"]');
  await expect(rij).toContainText('begeleidingsmoment');
  await rij.click();
  await expect(page.locator('#sheet')).toContainText('krijgt Arie een bericht');
  await page.fill('#wb-d', '2026-11-08'); await page.fill('#wb-a', '10:15'); await page.fill('#wb-v', 'Veld 3');
  await page.locator('#sheet form[data-submit="wedBewerkOk"] button.knop').click();
  const na = await page.evaluate(() => { const S = CC.S(); const a = S.acts.find((x) => x.id === 'w1'); const m = S.begeleidMomenten.find((x) => x.id === 'bm1');
    return { a: `${a.datum}|${a.tijd}|${a.veld}`, eind: a.eind !== '10:15', m: m.datum, berichten: S.msgs.filter((x) => (x.ontvangers || []).includes('p-a') && /verplaatst/.test(x.onderwerp)).length }; });
  expect(na).toEqual({ a: '2026-11-08|10:15|Veld 3', eind: true, m: '2026-11-08', berichten: 1 });
  await expect.poll(async () => { const r = (await nepDb(page)).rows['dcg|acts|w1'] || Object.values((await nepDb(page)).rows).find((x) => x.id === 'w1'); return r && `${r.data.datum}|${r.data.tijd}`; }, { message: 'opgeslagen in de database' }).toBe('2026-11-08|10:15');
  // Alleen de veldnaam wijzigen: geen nieuw bericht
  await page.locator('#sheet [data-act="wedBewerk"][data-id="w1"]').click(); await page.fill('#wb-v', 'Veld 4');
  await page.locator('#sheet form[data-submit="wedBewerkOk"] button.knop').click();
  expect(await page.evaluate(() => CC.S().msgs.filter((x) => /verplaatst/.test(x.onderwerp || '')).length)).toBe(1);
  // Verwijderen kan niet zolang er een moment op staat; afgelast wel (en terug)
  await page.locator('#sheet [data-act="wedBewerk"][data-id="w1"]').click();
  await page.locator('#sheet [data-act="wedWeg"]').click();
  expect(await page.evaluate(() => CC.S().acts.some((x) => x.id === 'w1'))).toBe(true);
  await page.locator('#sheet [data-act="wedAfgelast"]').click();
  await expect(page.locator('#sheet [data-act="wedBewerk"][data-id="w1"]')).toContainText('afgelast');
  await page.locator('#sheet [data-act="wedBewerk"][data-id="w1"]').click(); await page.locator('#sheet [data-act="wedAfgelast"]').click();
  await expect(page.locator('#sheet [data-act="wedBewerk"][data-id="w1"]')).not.toContainText('afgelast');
  // Een wedstrijd zonder moment kan weg (na bevestigen)
  page.once('dialog', (d) => d.accept());
  await page.locator('#sheet [data-act="wedBewerk"][data-id="w2"]').click(); await page.locator('#sheet [data-act="wedWeg"]').click();
  expect(await page.evaluate(() => CC.S().acts.some((x) => x.id === 'w2'))).toBe(false);
  await controleer(page, fouten, 'wedstrijd aanpassen');
});

test('Opnieuw plakken: gelijk, gewijzigd en nieuw; een wijziging neemt het moment mee', { tag: ['@begeleiden', '@kleineclub', '@rooster'] }, async ({ page }) => {
  const fouten = volgFouten(page);
  await club(page); await inloggen(page, 'ho@test.nl');
  await page.evaluate(() => CC.wisselRol(CC.me().rollen.findIndex((r) => r.rol === 'hjo')));
  await teamVenster(page);
  await page.locator('#sheet [data-act="wedPlak"]').click();
  await page.fill('#wedPlakTekst', ['Zaterdag 7 november 2026', 'JO14-1', '09:45', 'Testclub JO14-3', 'Zaterdag 14 november 2026', 'Testclub JO14-1', '10:30', 'JO14-1',
    'Zaterdag 21 november 2026', 'JO14-1', '11:00', 'Nieuwclub JO14-2'].join('\n'));
  const vb = page.locator('#wedPlakVb');
  await expect(vb.locator('tr', { hasText: '7 nov' })).toContainText('gewijzigd: was 09:00');
  await expect(vb.locator('tr', { hasText: '14 nov' })).toContainText('(gelijk)');
  await expect(vb.locator('tr', { hasText: '21 nov' })).toContainText('nieuw');
  await expect(vb).toContainText('niet vanzelf weg');
  await expect(page.locator('[data-act="wedPlakOk"]')).toHaveText('1 nieuw toevoegen · 1 wijzigen');
  await page.locator('[data-act="wedPlakOk"]').click();
  expect(await page.evaluate(() => { const S = CC.S(); return [S.acts.filter((a) => a.soort === 'wedstrijd').map((a) => `${a.datum}|${a.tijd}|${a.tegen}`), S.begeleidMomenten[0].datum, S.msgs.filter((x) => /verplaatst/.test(x.onderwerp || '')).length]; }))
    .toEqual([['2026-11-07|09:45|Testclub JO14-3', '2026-11-14|10:30|Testclub JO14-1', '2026-11-21|11:00|Nieuwclub JO14-2'], '2026-11-07', 1]);
  await controleer(page, fouten, 'opnieuw plakken');
});

test('Trainer: Mijn traject als tijdlijn van oud naar nieuw', { tag: ['@begeleiden', '@schermen'] }, async ({ page }) => {
  const fouten = volgFouten(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/?demo'); await page.evaluate(() => localStorage.clear()); await page.reload();
  await page.evaluate(() => { const S = CC.S(); const D = CC.date; S.club.pakket = 'trainers'; const tr = S.people.find((x) => x.naam === 'Dennis Peters');
    S.trainingFeedback = [{ id: 'fb1', trainerId: tr.id, planId: 'tp-x', actId: null, door: S.demo.peter, op: D.addDays(D.vandaag(), -2) + 'T20:00:00.000Z', tekst: 'Mooie opbouw. Maak het vak groter.' }];
    S.trainingsplannen = [...(S.trainingsplannen || []), { id: 'tp-x', actId: null, datum: D.addDays(D.vandaag(), -3), eigenaar: tr.id, thema: 'Opbouwen', onderdelen: [] }];
    CC.save(); CC.login(tr.id); CC.wisselRol(CC.me().rollen.findIndex((r) => r.rol === 'trainer')); CC.go('home'); });
  await page.locator('#app [data-view="mijnOntw"]').click();
  const stappen = page.locator('#app .tl > .tl-stap');
  await expect(stappen).toHaveCount(5); // kennismaking, training (moment), training (feedback), wedstrijd (nu), afronden
  await expect(stappen.first()).toContainText('Kennismaking'); await expect(stappen.first()).toHaveClass(/klaar/);
  await expect(stappen.nth(2)).toContainText('Maak het vak groter');
  await expect(stappen.nth(3)).toHaveClass(/nu/); await expect(stappen.nth(3)).toContainText('Wedstrijd');
  await expect(stappen.last()).toContainText('Afronden');
  await expect(page.locator('#app')).toContainText('Spelers vaker zelf laten oplossen');
  await controleer(page, fouten, 'tijdlijn');
});
