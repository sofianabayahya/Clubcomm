// ClubComm — Besluit 177: de stappen van de HO per trainer op één plek (toegevoegd → kennismaking → traject → eerste moment),
// Traject starten volgens de HO-A met een voorstel kort/uitgebreid en meteen het eerste moment; kennismaking in de welkomstmail.
const { test, expect } = require('@playwright/test');
const { volgFouten, controleer } = require('./hulp');
const TAG = { tag: ['@begeleiden'] };
const ho = async (page, extra) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/?demo'); await page.evaluate(() => localStorage.clear()); await page.reload();
  await page.evaluate((x) => { const S = CC.S(); S.club.pakket = 'trainers'; if (x) eval(x); CC.login(S.demo.peter); CC.wisselRol(CC.me().rollen.findIndex((r) => r.rol === 'hjo')); CC.go('trainers'); }, extra || '');
};
const snel = (page, naam) => page.locator('#app [data-act="hoTrainerSnel"]', { hasText: naam }).click();
const id = (page, naam) => page.evaluate((n) => CC.S().people.find((p) => p.naam === n).id, naam);

test('stappen: kennismaking sturen, dan traject starten met het eerste moment; daarna is het blok weg', TAG, async ({ page }) => {
  const fouten = volgFouten(page);
  await ho(page);
  await snel(page, 'Mark Jansen');
  const stappen = page.locator('#sheet .st-stappen');
  await expect(stappen).toContainText('nog niet gestuurd');
  await page.locator('#sheet [data-act="kennisUitnodigen"]').click();
  const mid = await id(page, 'Mark Jansen');
  expect(await page.evaluate((i) => !!CC.S().trainerKennis[i].gevraagd, mid)).toBe(true);
  await snel(page, 'Mark Jansen');
  await expect(stappen).toContainText('wacht op Mark');
  await page.locator('#sheet [data-act="trajectSheet"]').click();
  await expect(page.locator('#sheet')).toContainText('voorbereiding → planningsgesprek → praktijk → reflectiegesprek → nazorg');
  await expect(page.locator('#tj-n option[value="uitgebreid"]')).toHaveText('Uitgebreid · 8 (training) of 9 (wedstrijd) vragen · ervaren of in opleiding');
  await expect(page.locator('#tj-m option').first()).toContainText('wedstrijd');
  await page.locator('#sheet form[data-submit="trajectOk"] button.knop').click();
  const m = await page.evaluate((i) => { const S = CC.S(); const x = S.begeleidMomenten.find((y) => y.trainerId === i); return x && { act: !!x.actId, niveau: x.niveau, gevraagd: !!x.gevraagd }; }, mid);
  expect(m).toEqual({ act: true, niveau: 'kort', gevraagd: true });
  await snel(page, 'Mark Jansen');
  await expect(page.locator('#sheet .st-stappen')).toHaveCount(0);
  await controleer(page, fouten, 'stappen');
});

test('voorstel uitgebreid bij een KNVB-diploma; Later kiezen = geen moment, stap 4 blijft staan', TAG, async ({ page }) => {
  const fouten = volgFouten(page);
  await ho(page, "const a = S.people.find((p) => p.naam === 'Hasan van Dijk'); S.trainerKennis[a.id] = { gevraagd: '2026-11-01T10:00:00.000Z', ingevuld: '2026-11-02T10:00:00.000Z', a: { diploma: 'UEFA C', ambitie: 'Ik wil me verder ontwikkelen' } };");
  await snel(page, 'Hasan van Dijk');
  await expect(page.locator('#sheet .st-stappen')).toContainText('KNVB: UEFA C');
  await page.locator('#sheet [data-act="trajectSheet"]').click();
  await expect(page.locator('#tj-n')).toHaveValue('uitgebreid');
  await expect(page.locator('#sheet')).toContainText('Voorstel uit de kennismaking: uitgebreid');
  await page.locator('#tj-m').selectOption('');
  await page.locator('#sheet form[data-submit="trajectOk"] button.knop').click();
  const hid = await id(page, 'Hasan van Dijk');
  expect(await page.evaluate((i) => (CC.S().begeleidMomenten || []).filter((x) => x.trainerId === i).length, hid)).toBe(0);
  await snel(page, 'Hasan van Dijk');
  await expect(page.locator('#sheet [data-act="begelNieuw"]')).toContainText('Eerste moment plannen');
  await controleer(page, fouten, 'voorstel en later');
});

test('trainer toevoegen: kennismaking in dezelfde mail (standaard aan), of uit', TAG, async ({ page }) => {
  const fouten = volgFouten(page);
  await ho(page);
  for (const [naam, mail, aan] of [['Ties Toets', 'ties@voorbeeld.nl', true], ['Uma Uit', 'uma@voorbeeld.nl', false]]) {
    await page.evaluate(() => { CC.closeSheet(); CC.go('teams'); });
    await page.locator('[data-act="stafNieuw"]').first().click();
    await page.fill('#sn-n', naam); await page.fill('#sn-e', mail);
    await expect(page.locator('#sheet input[name="km"]')).toBeChecked();
    if (!aan) await page.locator('#sheet input[name="km"]').uncheck();
    await page.locator('#sheet form[data-submit="stafNieuwOk"] button.knop').click();
    const r = await page.evaluate((e) => { const S = CC.S(); const p = S.people.find((x) => x.email === e); const msg = S.msgs.filter((m) => (m.ontvangers || []).includes(p.id));
      return { gevraagd: !!((S.trainerKennis || {})[p.id] || {}).gevraagd, mails: msg.length, kennis: msg.some((m) => /kennismaking/.test(m.tekst)) }; }, mail);
    expect(r).toEqual({ gevraagd: aan, mails: 1, kennis: aan });
  }
  await controleer(page, fouten, 'toevoegen');
});

test('zonder het pakket: geen stappenblok', TAG, async ({ page }) => {
  const fouten = volgFouten(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/?demo'); await page.evaluate(() => localStorage.clear()); await page.reload();
  const html = await page.evaluate(() => { const S = CC.S(); return CC.trStappen(S, S.people.find((p) => p.naam === 'Mark Jansen')); });
  expect(html).toBe('');
  await controleer(page, fouten, 'zonder pakket');
});

test('lijst Trainers: de volgende stap achter elke naam; alleen ③ en ④ in kleur; kennismaking bovenaan in één regel', TAG, async ({ page }) => {
  const fouten = volgFouten(page);
  await ho(page, "const p = (n) => S.people.find((x) => x.naam === n); S.trainerKennis[p('Mark Jansen').id] = { gevraagd: '2026-11-01T10:00:00.000Z', ingevuld: '2026-11-03T10:00:00.000Z', a: {} }; S.trainerKennis[p('Hasan van Dijk').id] = { gevraagd: '2026-11-02T10:00:00.000Z' }; S.trainerDossier[p('Iris Peters').id] = { traject: { actief: true, sinds: '2026-11-01', plan: { wedstrijd: 1, training: 1 }, niveau: 'kort' } };");
  const rij = (n) => page.locator('#app [data-act="hoTrainerSnel"]', { hasText: n });
  await expect(rij('Mark Jansen').locator('.st-volg')).toHaveText('③ traject starten');
  await expect(rij('Iris Peters').locator('.st-volg')).toHaveText('④ eerste moment plannen');
  await expect(rij('Hasan van Dijk')).toContainText('wacht op kennismaking'); await expect(rij('Hasan van Dijk').locator('.st-volg')).toHaveCount(0);
  await expect(rij('Linda Peters')).toContainText('kennismaking nog niet gestuurd');
  await expect(rij('Dennis Peters')).toContainText('traject 1/2'); // heeft al een moment: zoals eerder
  await expect(page.locator('#app')).toContainText('2 trainers wachten op een stap van jou (③ of ④)');
  // Niet gesorteerd: de lijst blijft op naam
  const ids = await page.locator('#app [data-act="hoTrainerSnel"]').evaluateAll((r) => r.map((x) => x.dataset.id));
  expect(await page.evaluate((l) => { const S = CC.S(); const n = l.map((i) => S.people.find((p) => p.id === i).naam); return n.join() === [...n].sort((a, b) => a.localeCompare(b)).join(); }, ids)).toBe(true);
  // De kennismaking voor iedereen in één regel bovenaan
  await page.locator('#app [data-act="hoKennisVraag"]').click();
  await expect(page.locator('#sheet [data-act="kennisUitnodigen"]')).toBeVisible();
  await controleer(page, fouten, 'volgende stap');
});

test('Home van de HO: één regel bij Actie nodig met hoeveel trainers op een stap wachten; tik = de lijst Trainers', TAG, async ({ page }) => {
  const fouten = volgFouten(page);
  await ho(page, "const p = (n) => S.people.find((x) => x.naam === n); S.trainerKennis[p('Mark Jansen').id] = { gevraagd: '2026-11-01T10:00:00.000Z', ingevuld: '2026-11-03T10:00:00.000Z', a: {} }; S.trainerDossier[p('Iris Peters').id] = { traject: { actief: true, sinds: '2026-11-01', plan: { wedstrijd: 1, training: 1 }, niveau: 'kort' } };");
  await page.evaluate(() => CC.go('home'));
  const regel = page.locator('#app [data-act="hoNaarTrainers"]');
  await expect(regel).toContainText('2 trainers wachten op een stap van jou');
  await regel.click();
  await expect(page.locator('#app')).toContainText('2 trainers wachten op een stap van jou (③ of ④)');
  expect(await page.evaluate(() => CC.ui.tab)).toBe('trainers');
  // Niemand wacht: geen regel
  await page.evaluate(() => { const S = CC.S(); S.people.forEach((p) => { (S.trainerKennis[p.id] || {}).ingevuld = null; }); delete S.trainerDossier[S.people.find((x) => x.naam === 'Iris Peters').id]; CC.go('home'); });
  await expect(page.locator('#app [data-act="hoNaarTrainers"]')).toHaveCount(0);
  await controleer(page, fouten, 'home telling');
});
