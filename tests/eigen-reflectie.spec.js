// ClubComm — Besluit 143: de trainer is eigenaar van zijn eigen teksten. Deze test doet de handelingen in de app en legt
// vast welke rijen de app naar de database stuurt (precies zoals live.js: de rijen uit CC.naarRijen die veranderd zijn).
// Die rijen staan in supabase/tests/lokaal/app-opslag.json; app-opslag.sql speelt ze in `npm run test:veilig` af tegen de
// echte rechten (met migratie 033). Verandert de app wat hij opslaat, dan faalt deze test tot het bestand is bijgewerkt:
//   APP_OPSLAG_BIJWERKEN=1 npx playwright test tests/eigen-reflectie.spec.js
const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');
const { volgFouten, controleer } = require('./hulp');

const BESTAND = path.join(__dirname, '..', 'supabase', 'tests', 'lokaal', 'app-opslag.json');
const SOORTEN = ['begeleidMomenten', 'begeleidZelf', 'trainerKennis'];

// Tijden en datums vastzetten, zodat het bestand niet bij elke run verandert (de waarden zelf doen er voor de rechten niet toe)
const vast = (x) => JSON.parse(JSON.stringify(x)
  .replace(/"\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z"/g, '"2026-11-01T20:00:00.000Z"')
  .replace(/"\d{4}-\d{2}-\d{2}"/g, '"2026-11-01"'));

const rijen = (page) => page.evaluate((soorten) => Object.fromEntries([...CC.naarRijen(CC.S(), 'dcg').entries()]
  .filter(([, r]) => soorten.includes(r.soort)).map(([k, r]) => [k, JSON.parse(JSON.stringify(r))])), SOORTEN);
// Wat live.js zou versturen: nieuwe of gewijzigde rijen, en sleutels die verdwenen zijn
const verschil = (voor, na) => ({
  rijen: Object.entries(na).filter(([k, r]) => JSON.stringify(voor[k]) !== JSON.stringify(r)).map(([, r]) => r),
  weg: Object.keys(voor).filter((k) => !(k in na)),
});

test.describe('Besluit 143: eigen reflectie', () => {
  test('overnemen uit het evaluatieformulier, trainer neemt over, opnieuw uitnodigen', { tag: ['@begeleiden', '@veilig'] }, async ({ page }) => {
    const fouten = volgFouten(page);
    await page.goto('/?demo');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    const HO = 'p4', TR = 'p15', MOMENT = 'bm-demo2';
    const ho = await page.evaluate((id) => CC.S().people.find((p) => p.id === id), HO);
    expect(ho.rollen.some((r) => r.rol === 'hjo')).toBe(true);
    // In de database staat al een ingevulde kennismaking van de trainer (hij vulde in na een eerdere uitnodiging)
    const kennisInDb = { club_id: 'dcg', soort: 'trainerKennis', id: TR, scope: 'trainerzelf', team_id: null, speler_id: null, persoon_id: TR, act_id: null,
      data: { gevraagd: '2026-10-01T10:00:00.000Z', ingevuld: '2026-10-02T10:00:00.000Z', a: { ervaring: '3 jaar', ambitie: 'Selectieteam' } } };
    const peopleRij = (id) => page.evaluate((pid) => [...CC.naarRijen(CC.S(), 'dcg').values()].find((r) => r.soort === 'people' && r.id === pid), id);
    const stappen = [];

    // 1. De HO neemt de reflectie over uit het evaluatieformulier en deelt het verslag
    await page.evaluate((h) => { CC.zetSessie(h); CC.wisselRol(CC.me().rollen.findIndex((r) => r.rol === 'hjo')); }, HO);
    const begin = await rijen(page);
    await page.evaluate(() => localStorage.setItem('clubcomm-evaluaties-v1', JSON.stringify({ huidig: 'e9', lijst: [{ id: 'e9', coach: 'Dennis Peters', team: 'O9', datum: '2026-10-08', leerdoel: 'Rustig coachen', punt: 'Vaste coachmomenten', r1: 'Ik riep minder', r2: 'Spelers keken vaker op', r3: 'In de partijvorm' }] })));
    await page.evaluate((i) => CC.open('begelMoment', { id: i }), MOMENT);
    await page.locator('#app summary', { hasText: 'Praktijk' }).click();
    await page.locator('#app [data-act="begelImport"]').click();
    await page.locator('#sheet [data-act="begelImportOk"]').click();
    const m = await page.evaluate((i) => CC.S().begeleidMomenten.find((x) => x.id === i), MOMENT);
    expect(m.reflectieBegeleider).toMatchObject({ r: { r1: 'Ik riep minder' }, door: HO });
    expect(await page.evaluate((i) => (CC.S().begeleidZelf[i] || {}).r, MOMENT)).toBeUndefined();
    await page.locator('#app summary', { hasText: 'Nazorg' }).click();
    await expect(page.locator('#app')).toContainText('Genoteerd door');
    await page.locator('#app [data-act="begelDeel"]').click();
    const naHo = await rijen(page);
    stappen.push({ wie: HO, wat: 'HO neemt over uit het evaluatieformulier en deelt', verwacht: 'mag', ...verschil(begin, naHo) });
    expect(stappen[0].rijen.map((r) => r.soort)).toEqual(['begeleidMomenten']);

    // 2. De trainer ziet de tekst van de begeleider, neemt hem over, past hem aan en slaat op (zijn eigen rij)
    await page.evaluate((t) => { CC.zetSessie(t); CC.wisselRol(CC.me().rollen.findIndex((r) => r.rol === 'trainer')); }, TR);
    await page.evaluate((i) => CC.open('begelVerslag', { id: i }), MOMENT);
    await expect(page.locator('#app')).toContainText('Genoteerd door');
    await page.locator('#app [data-act="begelNeemOver"]').click();
    await expect(page.locator('#app form[data-submit="begelReflectieOk"] textarea[name="r1"]')).toHaveValue('Ik riep minder');
    await page.locator('#app form[data-submit="begelReflectieOk"] textarea[name="r1"]').fill('Ik riep minder, en vroeg vaker wat ze zagen');
    await page.locator('#app form[data-submit="begelReflectieOk"] button.knop').click();
    const z = await page.evaluate((i) => CC.S().begeleidZelf[i], MOMENT);
    expect(z).toMatchObject({ trainerId: TR, r: { r1: 'Ik riep minder, en vroeg vaker wat ze zagen', r2: 'Spelers keken vaker op' } });
    expect(z.reflectieOp).toBeTruthy();
    await expect(page.locator('#app')).not.toContainText('Genoteerd door'); // na Klaar is het zijn eigen reflectie
    await controleer(page, fouten, 'trainer: verslag na overnemen');
    const naTr = await rijen(page);
    stappen.push({ wie: TR, wat: 'trainer neemt de tekst over, past aan en slaat op', verwacht: 'mag', ...verschil(naHo, naTr) });
    expect(stappen[1].rijen.map((r) => r.soort)).toEqual(['begeleidZelf']);

    // 3. De HO heeft een verouderde kopie (ziet de kennismaking als nog niet gevraagd) en nodigt opnieuw uit
    await page.evaluate((h) => { CC.zetSessie(h); CC.wisselRol(CC.me().rollen.findIndex((r) => r.rol === 'hjo')); }, HO);
    await page.evaluate((t) => { delete CC.S().trainerKennis[t]; }, TR);
    const voorUitn = await rijen(page);
    await page.evaluate((t) => CC.open('trainerDetail', { id: t }), TR);
    await page.locator('#app [data-act="kennisUitnodigen"][data-id]').click();
    const naUitn = await rijen(page);
    stappen.push({ wie: HO, wat: 'HO nodigt opnieuw uit met een verouderde kopie', verwacht: 'weigert', ...verschil(voorUitn, naUitn) });
    expect(stappen[2].rijen.map((r) => [r.soort, Object.keys(r.data)])).toEqual([['trainerKennis', ['gevraagd']]]);
    await controleer(page, fouten, 'HO: opnieuw uitnodigen');

    // Vastleggen en vergelijken met het bestand dat de databasetest gebruikt
    const uit = vast({ club: 'dcg', personen: [HO, TR], begin: [await peopleRij(HO), await peopleRij(TR), Object.values(begin).find((r) => r.soort === 'begeleidMomenten' && r.id === MOMENT), kennisInDb].filter(Boolean), stappen });
    if (process.env.APP_OPSLAG_BIJWERKEN) fs.writeFileSync(BESTAND, `${JSON.stringify(uit, null, 1)}\n`);
    expect(uit, 'de app slaat iets anders op dan app-opslag.json: bijwerken met APP_OPSLAG_BIJWERKEN=1 en daarna npm run test:veilig').toEqual(JSON.parse(fs.readFileSync(BESTAND, 'utf8')));
  });
});
