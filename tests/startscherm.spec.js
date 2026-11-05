// ClubComm — Besluit 166: de Home van de begeleider (actie eerst) en van de trainer (mijn volgende stap) bij het pakket Trainers begeleiden.
const { test, expect } = require('@playwright/test');
const { volgFouten, controleer } = require('./hulp');

const TAG = { tag: ['@begeleiden', '@schermen'] };
// Demo met het pakket, meekijken aan, de module Training; Dennis heeft een uitgewerkte komende training en een vorige met feedback
const demo = async (page, { feedbackDagen = 0, meekijken = true } = {}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/?demo'); await page.evaluate(() => localStorage.clear()); await page.reload();
  return page.evaluate(({ feedbackDagen, meekijken }) => { const S = CC.S(); const D = CC.date; S.club.pakket = 'trainers'; S.club.begeleiderKijktMee = meekijken; S.club.modules = { ...(S.club.modules || {}), training: true };
    const tr = S.people.find((x) => x.naam === 'Dennis Peters'); const teamId = tr.rollen.find((r) => r.rol === 'trainer').teamId;
    const tr2 = S.acts.filter((x) => x.teamId === teamId && x.soort === 'training' && !x.afgelast && x.datum >= D.vandaag()).sort((x, y) => (x.datum + x.tijd).localeCompare(y.datum + y.tijd));
    const vorig = S.acts.filter((x) => x.teamId === teamId && x.soort === 'training' && x.datum < D.vandaag()).sort((x, y) => y.datum.localeCompare(x.datum))[0];
    S.vormen = S.vormen || []; S.trainingsplannen = S.trainingsplannen || []; S.trainingFeedback = S.trainingFeedback || [];
    S.vormen.push({ id: 'v1', eigenaar: tr.id, naam: 'Rondo 4 tegen 2', tekening: null });
    const pl = (id, a, thema) => ({ id, actId: a.id, teamId, datum: a.datum, eigenaar: tr.id, thema, onderdelen: [{ id: 'o1', blok: 'A', vormId: 'v1', min: 15 }] });
    S.trainingsplannen.push(pl('tp1', tr2[1], 'Opbouwen onder druk'), pl('tp0', vorig, 'Aannemen'));
    S.trainingFeedback.push({ id: 'fb0', trainerId: tr.id, planId: 'tp0', actId: vorig.id, door: S.demo.peter, op: D.addDays(D.vandaag(), -feedbackDagen) + 'T20:00:00.000Z', tekst: 'Mooie opbouw. Maak het vak in de partij groter.' });
    CC.save(); return { tr: tr.id, ho: S.demo.peter, eerste: tr2[0].id, tweede: tr2[1].id }; }, { feedbackDagen, meekijken });
};
const als = (page, pid, rol) => page.evaluate(([p, r]) => { CC.login(p); CC.wisselRol(CC.me().rollen.findIndex((x) => x.rol === r)); CC.go('home'); }, [pid, rol]);

test('HO: Actie nodig, Mijn trajecten en de week achter één regel', TAG, async ({ page }) => {
  const fouten = volgFouten(page);
  const ids = await demo(page); await als(page, ids.ho, 'hjo');
  const actie = page.locator('#app [data-act="mkTraining"]');
  // Alleen de training zonder feedback; de vorige (met feedback) staat er niet
  await expect(actie).toHaveCount(1); await expect(actie).toContainText('Training van Dennis Peters bekijken'); await expect(actie).toContainText('Opbouwen onder druk');
  await expect(page.locator('#app [data-act="hoKennisVraag"]')).toContainText('zonder kennismaking');
  await expect(page.locator('#app [data-view="trainerDetail"]', { hasText: 'Dennis Peters' })).toContainText('1 van 2');
  await expect(page.locator('#app [data-act="hoBegeleid"]')).toHaveCount(0); // de week staat niet meer op Home
  // De Home past op één scherm (het oude scherm was 2,4 schermen lang)
  expect(await page.evaluate(() => document.documentElement.scrollHeight)).toBeLessThan(844 * 1.3);
  // 1 tik: de training, feedback geven → de regel verdwijnt (één keer signaleren)
  await actie.click(); await expect(page.locator('#sheet')).toContainText('Rondo 4 tegen 2');
  await page.locator('#mk-fb').fill('Goed gekozen vorm.'); await page.locator('#sheet form[data-submit="mkFeedback"] button.knop').click();
  await expect(actie).toHaveCount(0);
  // Kennismaking: eerst een venster met de namen, pas daarna uitnodigen
  await page.locator('#app [data-act="hoKennisVraag"]').click();
  await expect(page.locator('#sheet [data-act="kennisUitnodigen"]')).toBeVisible();
  const voor = await page.evaluate(() => CC.S().msgs.length);
  await page.locator('#sheet [data-act="kennisUitnodigen"]').click();
  expect(await page.evaluate(() => CC.S().msgs.length)).toBeGreaterThan(voor);
  await expect(page.locator('#app [data-act="hoKennisVraag"]')).toHaveCount(0);
  // Deze week → de week van Besluit 146 met Begeleiden
  await page.locator('#app [data-view="hoWeek"]').click();
  await expect(page.locator('#app [data-key="hoDag"]').first()).toBeVisible();
  // Een traject → dossier in 1 tik
  await page.locator('nav.nav button[data-tab="home"]').click();
  await page.locator('#app [data-view="trainerDetail"]', { hasText: 'Dennis Peters' }).click();
  await expect(page.locator('#app')).toContainText('Spelers vaker zelf laten oplossen');
  await controleer(page, fouten, 'HO-Home');
});

test('HO: meekijken uit = geen trainingen bij Actie nodig', TAG, async ({ page }) => {
  const fouten = volgFouten(page);
  const ids = await demo(page, { meekijken: false }); await als(page, ids.ho, 'hjo');
  await expect(page.locator('#app')).toContainText('Mijn trajecten');
  await expect(page.locator('#app [data-act="mkTraining"]')).toHaveCount(0);
  await controleer(page, fouten, 'HO-Home zonder meekijken');
});

test('Trainer: volgende training, feedback van de begeleider en mijn traject', TAG, async ({ page }) => {
  const fouten = volgFouten(page);
  const ids = await demo(page); await als(page, ids.tr, 'trainer');
  const app = page.locator('#app');
  await expect(app).toContainText('Mijn volgende training');
  // De eerstvolgende training is nog leeg: Training maken maakt hem en opent hem (1 tik)
  await expect(page.locator('#app [data-act="tpNieuw"]')).toBeVisible();
  await expect(app).toContainText('je begeleider kan meekijken als je hem uitwerkt');
  await expect(page.locator('#app .mk-fb')).toContainText('Maak het vak in de partij groter');
  await expect(app).toContainText('1 van 2 momenten');
  await expect(page.locator('#app [data-act="vormNieuw"]')).toBeVisible();
  await page.locator('#app [data-act="tpNieuw"]').click();
  await expect.poll(() => page.evaluate((a) => CC.S().trainingsplannen.some((p) => p.actId === a), ids.eerste)).toBe(true);
  await page.locator('nav.nav button[data-tab="home"]').click();
  await expect(page.locator('#app button.knop[data-view="trainingsplan"]')).toBeVisible();
  // Alles over mijn begeleiding: de hele lijst met kennismaking
  await page.locator('#app [data-view="mijnOntw"]').click(); await expect(app).toContainText('Kennismaking');
  await controleer(page, fouten, 'trainer-Home');
});

test('Trainer: feedback ouder dan 14 dagen staat niet meer op Home (wel bij de training)', TAG, async ({ page }) => {
  const fouten = volgFouten(page);
  const ids = await demo(page, { feedbackDagen: 15 }); await als(page, ids.tr, 'trainer');
  await expect(page.locator('#app')).toContainText('Mijn volgende training');
  await expect(page.locator('#app .mk-fb')).toHaveCount(0);
  await controleer(page, fouten, 'trainer-Home oude feedback');
});
