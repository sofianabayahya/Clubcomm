// ClubComm — Besluit 175: de stappen van de HO per trainer op één plek (toegevoegd → kennismaking → traject → eerste moment),
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
