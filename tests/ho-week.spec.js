// ClubComm — Besluit 146: de begeleider bij het pakket Trainers begeleiden. Home = de week van zijn trainers (dag, bouw,
// wedstrijden/trainingen, alleen thuis) met Begeleiden in 2 tikken; Trainers compact met snelvenster; Teams eigen tabblad.
const { test, expect } = require('@playwright/test');
const { volgFouten, controleer, nepDatabase, inloggen, nepDb } = require('./hulp');

const club = async (page) => {
  await page.clock.setFixedTime(new Date('2026-11-04T10:00:00+01:00')); // woensdag; zaterdag = 7 november
  await page.setViewportSize({ width: 390, height: 844 });
  await nepDatabase(page);
  await page.evaluate(() => {
    const S = kleineClub(CC); S.club.pakket = 'trainers'; S.players = [];
    S.teams = [['O13-1', 'JO13-1', 'O13', 'p-c'], ['O14-1', 'JO14-1', 'O14', 'p-a'], ['O15-1', 'JO15-1', 'O15', 'p-b'], ['O17-1', 'JO17-1', 'O17', 'p-d'], ['O16-1', 'JO16-1', 'O16', null]]
      .map(([id, naam, cat, tr]) => ({ id, naam, cat, type: 'selectie', rooster: [], afwijking: {}, trainerId: tr, teamleiderId: null }));
    const p = (id, naam, email, rollen) => ({ id, naam, email, tel: '', rollen });
    S.people = [p('p-ho', 'Hanna Oost', 'ho@test.nl', [{ rol: 'hjo' }, { rol: 'beheerder' }]), p('p-tc', 'Tom Cramer', 'tc@test.nl', [{ rol: 'tc', bouwen: ['Bovenbouw'] }]),
      p('p-a', 'Arie Aal', 'a@test.nl', [{ rol: 'trainer', teamId: 'O14-1' }]), p('p-b', 'Bea Boom', 'b@test.nl', [{ rol: 'trainer', teamId: 'O15-1' }]),
      p('p-c', 'Cor Cas', 'c@test.nl', [{ rol: 'trainer', teamId: 'O13-1' }]), p('p-d', 'Dirk Duin', 'd@test.nl', [{ rol: 'trainer', teamId: 'O17-1' }])];
    const w = (id, team, tijd, thuis, tegen, extra) => ({ id, teamId: team, soort: 'wedstrijd', datum: '2026-11-07', tijd, eind: tijd, thuis, tegen, veld: '', afgelast: false, uitslag: null, ...extra });
    S.acts = [w('w1', 'O14-1', '09:00', true, 'Testclub JO14-3', { veld: 'veld 2' }), w('w2', 'O15-1', '10:30', false, 'Testclub JO15-1'), w('w3', 'O17-1', '12:15', true, 'Testclub JO17-2'),
      w('w4', 'O13-1', '08:30', true, 'Testclub JO13-1', { afgelast: true }), w('w5', 'O16-1', '11:00', true, 'Testclub JO16-4'), // O16 heeft geen trainer in ClubComm
      { id: 't1', teamId: 'O14-1', soort: 'training', datum: '2026-11-05', tijd: '18:30', eind: '19:45' }];
    S.trainerDossier = { 'p-b': { traject: { actief: true, sinds: '2026-10-01', door: 'p-ho', plan: { wedstrijd: 2, training: 2 }, leerdoel: 'Vaste coachmomenten', niveau: 'kort', ontwikkelpunt: '' } } };
    const rows = {}; CC.naarRijen(S, 'dcg').forEach((r) => { rows[`dcg|${r.soort}|${r.id}`] = r; }); sessionStorage.setItem('fake-sb-db', JSON.stringify({ rows, lid: {}, user: null }));
  });
};

test('HO: de week van zijn trainers, filters en begeleiden in 2 tikken', { tag: ['@begeleiden', '@kleineclub'] }, async ({ page }) => {
  const fouten = volgFouten(page);
  await club(page); await inloggen(page, 'ho@test.nl');
  await page.evaluate(() => CC.wisselRol(CC.me().rollen.findIndex((r) => r.rol === 'hjo')));
  await expect(page.locator('nav.nav button[data-tab]')).toHaveText(['Home', 'Trainers', 'Teams', /^Berichten/]);
  // Besluit 166: de week staat achter één regel Deze week op Home
  await page.locator('#app [data-view="hoWeek"]').click();
  // Woensdag: vandaag geen wedstrijd, dus de eerstvolgende dag met wedstrijden (za 7) staat open
  await expect(page.locator('[data-key="hoDag"].aan')).toContainText('za 7');
  const rijen = page.locator('#app .lijst .rij');
  await expect(rijen).toHaveCount(4); // JO13 afgelast, JO14, JO15, JO17; JO16 heeft geen trainer
  await expect(rijen.nth(0)).toContainText('afgelast');
  await expect(rijen.nth(1)).toContainText('09:00 · JO14-1 · Arie Aal'); await expect(rijen.nth(1)).toContainText('Thuis · tegen Testclub JO14-3 · veld 2');
  await expect(rijen.nth(2)).toContainText('Uit · tegen Testclub JO15-1');
  await expect(page.locator('#app')).not.toContainText('JO16-1');
  // Alleen thuis
  await page.locator('[data-key="hoThuis"]').click();
  await expect(rijen).toHaveCount(3); await expect(page.locator('#app')).not.toContainText('JO15-1');
  await page.locator('[data-key="hoThuis"]').click();
  // Bouw: alleen Bovenbouw (standaard 16–19 jaar) = JO17
  await page.locator('[data-key="hoFocus"][data-val="Bovenbouw"]').click();
  await expect(rijen).toHaveCount(1); await expect(rijen.first()).toContainText('JO17-1');
  await page.locator('[data-key="hoFocus"][data-val="alle"]').click();
  // Trainingen: do 5
  await page.locator('[data-key="hoSoort"][data-val="tr"]').click(); await page.locator('[data-key="hoDag"][data-val="2026-11-05"]').click();
  await expect(rijen).toHaveCount(1); await expect(rijen.first()).toContainText('18:30 · JO14-1 · Arie Aal');
  await page.locator('[data-key="hoSoort"][data-val="wed"]').click(); await page.locator('[data-key="hoDag"][data-val="2026-11-07"]').click();
  // Begeleiden: tik op de regel, bevestig; het moment staat op die wedstrijd en de trainer krijgt de vragenlijst
  await rijen.nth(1).click(); await expect(page.locator('#sheet')).toContainText('Wedstrijd JO14-1'); await expect(page.locator('#sheet')).toContainText('thuis tegen Testclub JO14-3');
  await page.locator('#sheet [data-act="hoBegeleidOk"]').click();
  await expect(rijen.nth(1)).toContainText('begeleidingsmoment gepland');
  await expect.poll(async () => Object.values((await nepDb(page)).rows).filter((r) => r.soort === 'begeleidMomenten').map((r) => `${r.data.trainerId}|${r.data.actId}|${r.data.soort}|${r.data.datum}`).join()).toBe('p-a|w1|wedstrijd|2026-11-07');
  // Volgende week (pijl) en terug
  await page.locator('[data-key="hoWk"][aria-label="Volgende week"]').click(); await expect(page.locator('#app')).toContainText('Volgende week');
  await page.locator('[data-key="hoWk"][aria-label="Vorige week"]').click(); await expect(page.locator('#app')).toContainText('Deze week');
  await controleer(page, fouten, 'HO week');

  // Trainers: compact, één regel per trainer, snelvenster
  await page.locator('nav.nav button[data-tab="trainers"]').click();
  await expect(page.locator('[data-key="trDeel"]')).toHaveText(['Alle (4)', 'Traject (1)']);
  await expect(page.locator('#app [data-act="hoTrainerSnel"]')).toHaveCount(4);
  await expect(page.locator('#app [data-act="hoTrainerSnel"]', { hasText: 'Bea Boom' })).toContainText('④ eerste moment plannen'); // Besluit NNN: de volgende stap (traject zonder moment)
  await expect(page.locator('#app .clubregel')).toHaveCount(0); // de grote trajectkaart is weg
  await page.locator('#app [data-act="hoTrainerSnel"]', { hasText: 'Bea Boom' }).click();
  await expect(page.locator('#sheet [data-act="begelNieuw"]')).toBeVisible(); await expect(page.locator('#sheet [data-view="trainerDetail"]')).toBeVisible();
  await page.locator('#sheet [data-view="trainerDetail"]').click(); await expect(page.locator('#app')).toContainText('Vaste coachmomenten');
  await page.locator('nav.nav button[data-tab="trainers"]').click();
  await page.locator('[data-key="trDeel"][data-val="traject"]').click();
  await expect(page.locator('#app [data-act="hoTrainerSnel"]')).toHaveCount(1); await expect(page.locator('#app')).toContainText('Traject: 0 van 4 momenten gedaan');
  // Teams: eigen tabblad
  await page.locator('nav.nav button[data-tab="teams"]').click(); await expect(page.locator('.tb-teams')).toBeVisible();
  await controleer(page, fouten, 'HO trainers en teams');
});

test('TC met werkgebied Bovenbouw: Home · Trainers · Berichten en alleen zijn bouw', { tag: ['@begeleiden', '@kleineclub'] }, async ({ page }) => {
  const fouten = volgFouten(page);
  await club(page); await inloggen(page, 'tc@test.nl');
  await expect(page.locator('nav.nav button[data-tab]')).toHaveText(['Home', 'Trainers', /^Berichten/]);
  await page.locator('#app [data-view="hoWeek"]').click();
  await expect(page.locator('#app .lijst .rij')).toHaveCount(1); await expect(page.locator('#app .lijst .rij').first()).toContainText('JO17-1 · Dirk Duin');
  await page.locator('nav.nav button[data-tab="trainers"]').click();
  await expect(page.locator('#app [data-act="hoTrainerSnel"]')).toHaveCount(1);
  await controleer(page, fouten, 'TC');
});
