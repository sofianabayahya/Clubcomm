// ClubComm — Besluit 134 en Besluit 159: de begeleider kijkt mee met de trainingen van een trainer (alleen lezen) en geeft feedback.
// De rechten zelf (wie de rijen mag lezen) staan in de database (migratie 032 en 034) en worden getest in npm run test:veilig.
const { test, expect } = require('@playwright/test');
const { volgFouten, controleer, nepDatabase, inloggen, nepDb } = require('./hulp');

test.describe('Besluit 134: meekijken met trainingen', () => {
  test('HO ziet de training met tekening, geeft feedback; trainer ziet het bij zijn training', { tag: ['@begeleiden'] }, async ({ page }) => {
    const fouten = volgFouten(page);
    await page.goto('/?demo');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    const ids = await page.evaluate(() => {
      const S = CC.S(); const tr = S.people.find((x) => x.naam === 'Dennis Peters'); const ho = S.people.find((x) => x.id === S.demo.peter);
      const teamId = tr.rollen.find((r) => r.rol === 'trainer').teamId;
      const a = S.acts.filter((x) => x.teamId === teamId && x.soort === 'training').sort((x, y) => x.datum.localeCompare(y.datum))[0];
      S.vormen = S.vormen || []; S.trainingsplannen = S.trainingsplannen || [];
      const bron = { tekening: { field: 'liggend', items: [{ t: 'p', c: 'rood', n: 1, x: 300, y: 300 }, { t: 'p', c: 'blauw', n: 2, x: 400, y: 340 }] } };
      S.vormen.push({ ...bron, id: 'v-mk', eigenaar: tr.id, naam: 'Rondo 4 tegen 2', organisatie: 'Vak 15 bij 15 meter', coach: 'Eerst kijken, dan passen' });
      S.vormen.push({ id: 'v-prive', eigenaar: tr.id, naam: 'Nog een idee', tekening: null });
      S.trainingsplannen.push({ id: 'tp-mk', actId: a.id, teamId, datum: a.datum, eigenaar: tr.id, thema: 'Opbouwen onder druk', leerdoelen: [], spelers: null, keepers: null,
        onderdelen: [{ id: 'o1', blok: 'A', vormId: 'v-mk', min: 15 }, { id: 'o2', blok: 'P', naam: 'Partij', min: 20 }] });
      S.club.begeleiderKijktMee = true;
      CC.save();
      return { tr: tr.id, ho: ho.id, act: a.id, metTekening: !!window.DrawTool.staticSvg(bron.tekening) };
    });
    expect(ids.metTekening).toBe(true);
    // Opslag: de training en de vorm erin worden 'trainerplan'; de losse vorm blijft 'eigen' (alleen tekeningen in een training)
    const scopes = await page.evaluate(() => Object.fromEntries([...CC.naarRijen(CC.S(), 'dcg').values()].filter((r) => ['tp-mk', 'v-mk', 'v-prive'].includes(r.id)).map((r) => [r.id, r.scope])));
    expect(scopes).toEqual({ 'tp-mk': 'trainerplan', 'v-mk': 'trainerplan', 'v-prive': 'eigen' });

    // De HO opent het dossier van de trainer: blok Trainingen
    await page.evaluate((pid) => { CC.login(pid); const i = CC.me().rollen.findIndex((r) => r.rol === 'hjo'); CC.wisselRol(i); }, ids.ho);
    await page.evaluate((id) => CC.open('trainerDetail', { id }), ids.tr);
    const rij = page.locator('#app [data-act="mkTraining"]', { hasText: 'Opbouwen onder druk' });
    await expect(rij).toContainText('Rondo 4 tegen 2');
    await rij.click();
    await expect(page.locator('#sheet .mk-tekening svg')).toHaveCount(1);
    await expect(page.locator('#sheet')).toContainText('Vak 15 bij 15 meter');
    await expect(page.locator('#sheet')).toContainText('Partij');
    await page.locator('#mk-fb').fill('Mooie opbouw. Maak het vak in de partij groter.');
    await page.locator('#sheet form[data-submit="mkFeedback"] button.knop').click();
    const opgeslagen = await page.evaluate(() => { const S = CC.S(); return { fb: S.trainingFeedback.map((f) => `${f.trainerId}|${f.planId}|${f.tekst}`), msg: S.msgs[S.msgs.length - 1] }; });
    expect(opgeslagen.fb).toEqual([`${ids.tr}|tp-mk|Mooie opbouw. Maak het vak in de partij groter.`]);
    expect(opgeslagen.msg.ontvangers).toEqual([ids.tr]);
    expect(opgeslagen.msg.onderwerp).toMatch(/^Feedback op je training/);
    // Feedback hoort bij het dossier: scope trainerdossier op naam van de trainer
    expect(await page.evaluate(() => [...CC.naarRijen(CC.S(), 'dcg').values()].filter((r) => r.soort === 'trainingFeedback').map((r) => `${r.scope}|${r.persoon_id}`))).toEqual([`trainerdossier|${ids.tr}`]);
    await expect(rij).toContainText('1 feedback');

    // Meekijken uit: de HO ziet geen trainingen meer (en de database geeft ze dan ook niet)
    await page.evaluate(() => { CC.S().club.begeleiderKijktMee = false; CC.render(); });
    await expect(page.locator('#app [data-act="mkTraining"]')).toHaveCount(0);
    await expect(page.locator('#app')).toContainText('Meekijken met trainingen staat uit');
    await page.evaluate(() => { CC.S().club.begeleiderKijktMee = true; CC.render(); });

    // De trainer ziet de feedback bij zijn training, en dat zijn begeleider meekijkt
    await page.evaluate((pid) => { CC.login(pid); const i = CC.me().rollen.findIndex((r) => r.rol === 'trainer'); CC.wisselRol(i); }, ids.tr);
    await page.evaluate((id) => CC.open('trainingsplan', { id }), ids.act);
    await expect(page.locator('#app .mk-fb')).toContainText('Maak het vak in de partij groter');
    await expect(page.locator('#app')).toContainText('Je begeleider kan deze training lezen');
    await controleer(page, fouten, 'meekijken: HO en trainer');
  });

  test('Regels: de clubbeheerder zet meekijken aan', { tag: ['@begeleiden'] }, async ({ page }) => {
    const fouten = volgFouten(page);
    await page.goto('/?demo');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.evaluate(() => { const S = CC.S(); CC.login(S.demo.peter); const i = CC.me().rollen.findIndex((r) => r.rol === 'beheerder'); CC.wisselRol(i); });
    await page.locator('nav.nav button[data-tab="regels"]').click();
    const vink = page.locator('form[data-submit="mkRegel"] input[name="aan"]');
    await page.locator('#app summary', { hasText: 'Meekijken' }).click();
    await expect(vink).not.toBeChecked();
    await vink.check();
    await page.locator('form[data-submit="mkRegel"] button.knop').click();
    expect(await page.evaluate(() => CC.S().club.begeleiderKijktMee)).toBe(true);
    await controleer(page, fouten, 'meekijken: Regels');
  });

  test('bestaande eigen trainingen worden na inloggen één keer omgezet; andermans rijen nooit', { tag: ['@begeleiden', '@veilig'] }, async ({ page }) => {
    const fouten = volgFouten(page);
    await nepDatabase(page);
    await page.evaluate(() => { const db = JSON.parse(sessionStorage.getItem('fake-sb-db'));
      const rij = (soort, id, persoon, data) => { db.rows[`dcg|${soort}|${id}`] = { club_id: 'dcg', soort, id, scope: 'eigen', team_id: 'O12-1', speler_id: null, persoon_id: persoon, act_id: null, data: { id, eigenaar: persoon, ...data } }; };
      rij('vormen', 'v-oud', 'p-beheer', { naam: 'Rondo', teamId: 'O12-1' });
      rij('vormen', 'v-los', 'p-beheer', { naam: 'Los idee', teamId: 'O12-1' });
      rij('trainingsplannen', 'tp-oud', 'p-beheer', { actId: 'x1', teamId: 'O12-1', datum: '2026-10-28', onderdelen: [{ id: 'o1', vormId: 'v-oud', min: 15 }] });
      rij('trainingsplannen', 'wk-oud', 'p-beheer', { week: true, teamId: 'O12-1', datum: '2026-10-26', onderdelen: [] });
      rij('trainingsplannen', 'tp-ander', 'p-ander', { actId: 'x2', teamId: 'O12-1', datum: '2026-10-28', onderdelen: [] });
      sessionStorage.setItem('fake-sb-db', JSON.stringify(db)); });
    await inloggen(page, 'admin@test.nl');
    const scopes = async () => Object.fromEntries(Object.values((await nepDb(page)).rows).filter((r) => ['v-oud', 'v-los', 'tp-oud', 'wk-oud', 'tp-ander'].includes(r.id)).map((r) => [r.id, r.scope]));
    await expect.poll(scopes, { message: 'eigen trainingen omgezet' }).toEqual({ 'v-oud': 'trainerplan', 'v-los': 'eigen', 'tp-oud': 'trainerplan', 'wk-oud': 'eigen', 'tp-ander': 'eigen' });
    await controleer(page, fouten, 'meekijken: omzetten');
  });
});
