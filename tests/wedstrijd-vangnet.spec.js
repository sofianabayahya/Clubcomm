// Besluit 181: wedstrijd bijhouden zonder iets kwijt te raken (gevonden 07-11: doelpunten verdwenen na elke verversing,
// en de ouders kregen 0-0). Met de nep-database die opslaan kan weigeren, zoals de echte database deed.
const { test, expect } = require('@playwright/test');
const { volgFouten, controleer, nepDatabase, inloggen, nepDb } = require('./hulp');
const TAG = { tag: ['@wedstrijd', '@kleineclub'] };

const zetWedstrijd = async (page, taak) => page.evaluate((taak) => { const db = JSON.parse(sessionStorage.getItem('fake-sb-db')); const d = CC.date.vandaag();
  const a = { id: 'w-vang', teamId: 'O12-1', soort: 'wedstrijd', datum: d, tijd: '00:01', eind: '23:58', thuis: true, tegen: 'Testclub O13-1', afgelast: false };
  db.rows['dcg|acts|w-vang'] = { club_id: 'dcg', soort: 'acts', id: 'w-vang', scope: 'team', team_id: 'O12-1', speler_id: null, persoon_id: null, act_id: 'w-vang', data: a };
  if (taak) db.rows['dcg|taken|tk-vang'] = { club_id: 'dcg', soort: 'taken', id: 'tk-vang', scope: 'team', team_id: 'O12-1', speler_id: null, persoon_id: null, act_id: 'w-vang', data: { id: 'tk-vang', actId: 'w-vang', soort: 'Timekeeper', personId: taak } };
  sessionStorage.setItem('fake-sb-db', JSON.stringify(db)); }, taak);

test('geweigerd en ververst: de doelpunten blijven en gaan met het voorstel naar de trainer', TAG, async ({ page }) => {
  const fouten = volgFouten(page);
  await nepDatabase(page); await zetWedstrijd(page, null);
  await inloggen(page, 'amin@test.nl');
  await page.evaluate(() => sessionStorage.setItem('fake-sb-weiger', JSON.stringify(['acts'])));
  // Drie doelpunten, één voor één, zoals op het veld
  for (const g of [{ id: 'g1', wij: false }, { id: 'g2', wij: true, spelerId: 's2' }, { id: 'g3', wij: true, spelerId: null }]) {
    await page.evaluate((g) => { const a = CC.m.act(CC.S(), 'w-vang'); (a.goals || (a.goals = [])).push(g); CC.save(); CC.render(); }, g);
    await page.waitForTimeout(700);
  }
  // Verversen zoals elke 30 seconden: de server heeft geen doelpunten → de app zet ze terug
  await page.evaluate(() => CC.ververs());
  await expect.poll(() => page.evaluate(() => { CC.render(); return (CC.m.act(CC.S(), 'w-vang').goals || []).length; }), { message: 'doelpunten terug na verversen' }).toBe(3);
  await expect.poll(async () => { const v = Object.values((await nepDb(page)).rows).find((r) => r.soort === 'wedVoorstel'); return v ? (v.data.act.goals || []).length : -1; },
    { message: 'alle doelpunten in het voorstel' }).toBe(3);
  await controleer(page, fouten, 'vangnet doelpunten');
});

test('mag niet opslaan: geen uitslagbericht naar de ouders; de trainer stuurt het bij overnemen', TAG, async ({ page }) => {
  const fouten = volgFouten(page);
  await nepDatabase(page); await zetWedstrijd(page, null);
  await inloggen(page, 'amin@test.nl');
  await page.evaluate(() => sessionStorage.setItem('fake-sb-weiger', JSON.stringify(['acts'])));
  await page.evaluate(() => { const a = CC.m.act(CC.S(), 'w-vang'); a.goals = [{ id: 'g1', wij: true, spelerId: 's2' }, { id: 'g2', wij: false }, { id: 'g3', wij: true }]; CC.save(); CC.render(); });
  // Einde wedstrijd: het formulier zoals in het venster, met "stuur naar de ouders" aan
  await page.evaluate(() => { const f = document.createElement('form'); f.dataset.submit = 'uitslagOk'; f.dataset.a = 'w-vang';
    f.innerHTML = '<input type="checkbox" name="stuur" checked><input type="checkbox" name="makers" checked><button>ok</button>'; document.body.appendChild(f); f.requestSubmit(); });
  await expect(page.locator('#toast')).toContainText('stuurt de trainer');
  await expect.poll(async () => Object.values((await nepDb(page)).rows).filter((r) => r.soort === 'wedVoorstel' && r.data.act && r.data.act.uitslagStuur).length, { message: 'voorstel met bericht' }).toBe(1);
  expect(Object.values((await nepDb(page)).rows).filter((r) => r.soort === 'msgs' && /Testclub O13-1/.test(r.data.tekst || '')).length).toBe(0);
  // De trainer neemt over: nu gaat het bericht, met de echte stand
  await page.evaluate(() => { sessionStorage.removeItem('fake-sb-weiger'); CC.logout(); });
  await inloggen(page, 'admin@test.nl');
  await page.evaluate(() => { CC.wisselRol(CC.me().rollen.findIndex((r) => r.rol === 'trainer')); CC.go('home'); });
  await page.locator('#app [data-act="voorstelOver"]').first().click();
  await expect.poll(async () => { const m = Object.values((await nepDb(page)).rows).find((r) => r.soort === 'msgs' && /Testclub O13-1/.test(r.data.tekst || '')); return m ? m.data.tekst : ''; },
    { message: 'uitslagbericht na overnemen' }).toContain('2-1');
  await controleer(page, fouten, 'uitslagbericht via trainer');
});

test('timekeeper die mag opslaan: scorebord toont Opgeslagen', TAG, async ({ page }) => {
  const fouten = volgFouten(page);
  await nepDatabase(page); await zetWedstrijd(page, 'p-amin');
  await inloggen(page, 'amin@test.nl');
  const pid = await page.evaluate(() => CC.me().id);
  await page.evaluate((pid) => { const S = CC.S(); const t = S.taken.find((x) => x.id === 'tk-vang'); if (t) t.personId = pid; const a = CC.m.act(S, 'w-vang'); a.goals = [{ id: 'g1', wij: true }]; CC.save(); }, pid);
  await expect.poll(() => page.evaluate(() => { const S = CC.S(); const a = CC.m.act(S, 'w-vang'); return CC.scorebord(S, a, CC.m.team(S, a.teamId)); }), { message: 'opgeslagen op het scorebord' }).toContain('Opgeslagen');
  expect(await page.evaluate(() => { const S = CC.S(); const a = CC.m.act(S, 'w-vang'); return CC.scorebord(S, a, CC.m.team(S, a.teamId)); })).toContain('data-live-scorebord');
  await controleer(page, fouten, 'scorebord opgeslagen');
});
