// Besluit NNN: wedstrijdarchief. Onder Wedstrijd → Gespeeld per wedstrijd de uitslag, de basis, de wissels (▲ erin, ▼ eruit)
// en (alleen de trainer) de minuten. Achteraf aanpassen rekent de seizoensminuten opnieuw uit, zonder dubbel tellen.
// Verzonnen namen, nep-database.
const { test, expect } = require('@playwright/test');
const { volgFouten, controleer, nepDatabase, inloggen } = require('./hulp');
const TAG = { tag: ['@wedstrijd'] };

// Een gespeelde wedstrijd van 4 dagen terug met een eigen schema (11 in de basis, 2 wissels), uitslag 3-1, vastgelegd
const opbouw = (page) => page.evaluate(() => { const S = CC.S(), M = CC.m, D = CC.date;
  CC.wisselRol(CC.me().rollen.findIndex((r) => r.rol === 'trainer')); const tid = CC.teamId(); const t = M.team(S, tid); t.speelCat = 'O13';
  ['Aron', 'Bram', 'Cas', 'Daan', 'Eli', 'Finn', 'Gijs', 'Hugo', 'Ivo', 'Joep', 'Kai', 'Lars', 'Mees'].forEach((n, i) => S.players.push({ id: `ar-${i}`, voornaam: n, achternaam: 'Test', teamId: tid, ouders: [] }));
  const a = { id: 'w-arch', teamId: tid, soort: 'wedstrijd', datum: D.addDays(D.vandaag(), -4), tijd: '10:00', eind: '11:15', thuis: true, tegen: 'Testclub O13-2', afgelast: false,
    goals: [{ id: 'g1', wij: true, spelerId: 'ar-8', min: 5 }, { id: 'g2', wij: false, min: 12 }, { id: 'g3', wij: true, spelerId: 'ar-9', min: 40 }, { id: 'g4', wij: true, min: 55 }], uitslag: '3-1', uitslagKlaar: true };
  S.acts.push(a);
  const pos = ['1', '2', '3', '4', '5', '6', '8', '10', '7', '9', '11']; const opstelling = Object.fromEntries(pos.map((p, i) => [p, `ar-${i}`]));
  S.speeltijd.schema[a.id] = { zelf: true, systeem: '1-4-3-3', opstelling, wissels: [{ id: 'x1', min: 30, uit: 'ar-3', in: 'ar-11' }, { id: 'x2', min: 45, uit: 'ar-6', in: 'ar-12' }],
    klok: {}, wedMin: 60, helft: 30, vorm: '11 tegen 11', opVeld: 11, bevestigd: false };
  CC.wedstrijdVastleggen(S, a, CC.me().id); CC.save(); CC.render(); return tid; });
const totaal = (page) => page.evaluate(() => { const m = CC.S().speeltijd.min; return { daan: m['ar-3'] || 0, lars: m['ar-11'] || 0, som: Object.keys(m).filter((k) => k.startsWith('ar-')).reduce((s, k) => s + m[k], 0),
  mog: CC.S().speeltijd.mogelijk['ar-11'] || 0 }; });

test('gespeeld: de wedstrijd met basis en wissels; achteraf een wissel aanpassen telt niet dubbel', TAG, async ({ page }) => {
  const fouten = volgFouten(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await nepDatabase(page); await inloggen(page, 'admin@test.nl'); await opbouw(page);
  const voor = await totaal(page);
  expect(voor).toEqual({ daan: 30, lars: 30, som: 660, mog: 60 });
  await page.evaluate(() => CC.go('speeltijd'));
  await page.locator('#app [data-act="seg"][data-key="wedDeel"][data-val="gespeeld"]').click();
  const rij = page.locator('#app [data-view="wedArchief"][data-id="w-arch"]');
  await expect(rij).toContainText('11 in de basis · 2 wissels'); await expect(rij).toContainText('3-1');
  await page.screenshot({ path: 'test-results/archief-lijst.png' });
  await rij.click();
  await expect(page.locator('#app')).toContainText('Basis'); await expect(page.locator('#app')).toContainText('Aron (keeper)');
  await expect(page.locator('#app')).toContainText("5' 1-0 Ivo");
  await expect(page.locator('#app')).toContainText('▲ Lars erin');
  await expect(page.locator('#app')).toContainText('rust');
  await page.screenshot({ path: 'test-results/archief-detail.png', fullPage: true });
  // Aanpassen: de eerste wissel (rust) blijkt op minuut 40 te zijn
  await page.locator('#app [data-act="wedAanpassen"]').click();
  await expect(page.locator('#sheet')).toContainText('Wedstrijd aanpassen');
  await page.locator('#sheet select[data-change="wedEdWisMin"][data-i="0"]').selectOption('40');
  await page.waitForTimeout(600); await page.screenshot({ path: 'test-results/archief-aanpassen.png' });
  await page.locator('#sheet [data-act="wedEdOpslaan"]').click();
  await expect(page.locator('#toast')).toContainText('Minuten opnieuw uitgerekend');
  const na = await totaal(page);
  expect(na).toEqual({ daan: 40, lars: 20, som: 660, mog: 60 }); // niet dubbel: som en mogelijke minuten gelijk
  // Een doelpunt erbij: de uitslag wordt 4-1
  await page.locator('#app [data-act="wedAanpassen"]').click();
  await page.locator('#sheet [data-act="seg"][data-key="wedEdDeel"][data-val="goals"]').click();
  await page.locator('#sheet [data-act="wedEdBij"][data-soort="goals"]').click();
  await page.locator('#sheet [data-act="wedEdOpslaan"]').click();
  expect(await page.evaluate(() => CC.m.act(CC.S(), 'w-arch').uitslag)).toBe('4-1');
  expect(await totaal(page)).toEqual(na);
  await controleer(page, fouten, 'wedstrijdarchief');
});

test('aanpassen controleert de wissels: wie niet in het veld staat kan er niet uit', TAG, async ({ page }) => {
  const fouten = volgFouten(page);
  await nepDatabase(page); await inloggen(page, 'admin@test.nl'); await opbouw(page);
  await page.evaluate(() => { CC.open('wedArchief', { id: 'w-arch' }); });
  await page.locator('#app [data-act="wedAanpassen"]').click();
  // Tweede wissel: Daan eruit, maar Daan ging er al uit
  await page.locator('#sheet select[data-change="wedEdWisUit"][data-i="1"]').selectOption('ar-3');
  await page.locator('#sheet [data-act="wedEdOpslaan"]').click();
  await expect(page.locator('#toast')).toContainText('niet in het veld');
  expect(await totaal(page)).toEqual({ daan: 30, lars: 30, som: 660, mog: 60 });
  await controleer(page, fouten, 'archief controle');
});

test('geen trainer: geen minuten en geen Aanpassen', TAG, async ({ page }) => {
  const fouten = volgFouten(page);
  await nepDatabase(page); await inloggen(page, 'admin@test.nl'); await opbouw(page);
  const kan = await page.evaluate(() => { const i = CC.me().rollen.findIndex((r) => r.rol === 'ouder'); if (i < 0) return false; CC.wisselRol(i); CC.open('wedArchief', { id: 'w-arch' }); return true; });
  test.skip(!kan, 'geen ouderrol in de nep-database');
  await expect(page.locator('#app')).toContainText('Aron (keeper)');
  await expect(page.locator('#app [data-act="wedAanpassen"]')).toHaveCount(0);
  await expect(page.locator('#app')).not.toContainText("60'");
  await controleer(page, fouten, 'archief zonder minuten');
});
