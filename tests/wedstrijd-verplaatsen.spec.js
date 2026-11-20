// Besluit 184: wedstrijd verplaatsen of afgelasten, één wedstrijd met drie standen. Zelfde dag: afmeldingen en taken blijven;
// andere dag of "verplaatst, datum volgt": ze vervallen (bewaard, niet gewist) en de ouders krijgen een bericht.
// Verzonnen namen, nep-database (die net als de echte database de rijen van het team bewaart).
const { test, expect } = require('@playwright/test');
const { volgFouten, controleer, nepDatabase, inloggen, nepDb } = require('./hulp');
const TAG = { tag: ['@wedstrijd'] };

// Wedstrijd over 3 dagen, met een afmelding, een bezette taak en vervoer
const opbouw = (page, dagen = 3) => page.evaluate((dagen) => { const S = CC.S(), M = CC.m, D = CC.date;
  const pl = M.spelers(S, 'O12-1'); const datum = D.addDays(D.vandaag(), dagen);
  const a = { id: 'w-verpl', teamId: 'O12-1', soort: 'wedstrijd', datum, tijd: '12:45', eind: '14:00', verzamel: '11:45', thuis: false, tegen: 'Testclub O13-4', adres: 'Sportpark Proef 1, Testdorp', afgelast: false };
  S.acts.push(a); S.afm.push({ id: 'f-verpl', spelerId: pl[0].id, actId: a.id, reden: 'Ziek', opm: '', tijd: new Date().toISOString(), door: pl[0].ouders[0] });
  S.taken.push({ id: 'tk-verpl', actId: a.id, soort: 'Vlagger', personId: pl[1].ouders[0] });
  S.vervoer[a.id] = { aanbod: [{ personId: pl[2].ouders[0], plekken: 3 }], plek: {}, vraag: {} };
  CC.save(); return { datum, speler: pl[0].id }; }, dagen);
const naarWedstrijd = async (page) => { await page.evaluate(() => { CC.wisselRol(CC.me().rollen.findIndex((r) => r.rol === 'teamleider')); CC.ui.seg.tlWed = 'w-verpl'; CC.go('wedstrijd'); }); };
const berichten = (page) => page.evaluate(() => CC.S().msgs.filter((m) => m.actId === 'w-verpl' && m.soort === 'nieuws').map((m) => m.onderwerp + ' | ' + m.tekst));

test('zelfde dag, andere tijd: verzamelen schuift mee, afmeldingen en taken blijven, ouders krijgen bericht', TAG, async ({ page }) => {
  const fouten = volgFouten(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await nepDatabase(page); await inloggen(page, 'karim@test.nl'); await opbouw(page); await naarWedstrijd(page);
  await page.locator('#wi-t').fill('11:35');
  await expect(page.locator('#wi-v')).toHaveValue('10:35');
  await expect(page.locator('[data-wi-hint]')).toContainText('Zelfde dag');
  await page.screenshot({ path: 'test-results/verplaatsen-zelfde-dag.png' });
  await page.locator('[data-wi-knop]').click();
  await expect(page.locator('#toast')).toContainText('ouders zijn ingelicht');
  const a = await page.evaluate(() => { const S = CC.S(); const a = CC.m.act(S, 'w-verpl'); return { tijd: a.tijd, verzamel: a.verzamel, eind: a.eind, afm: S.afm.filter((f) => f.actId === 'w-verpl').length, taak: S.taken.find((t) => t.id === 'tk-verpl').personId, label: CC.wedLabel(a) }; });
  expect(a).toMatchObject({ tijd: '11:35', verzamel: '10:35', eind: '12:50', afm: 1 }); expect(a.taak).toBeTruthy(); expect(a.label).toContain('was 12:45');
  const b = await berichten(page); expect(b.length).toBe(1); expect(b[0]).toContain('aftrap 11:35 (was 12:45)');
  await controleer(page, fouten, 'zelfde dag');
});

test('alleen opslaan: geen bericht; meer dan 7 dagen vooraf: geen knop "Alleen opslaan" nodig', TAG, async ({ page }) => {
  const fouten = volgFouten(page);
  await nepDatabase(page); await inloggen(page, 'karim@test.nl'); await opbouw(page); await naarWedstrijd(page);
  await page.locator('#wi-t').fill('13:00'); await page.locator('[data-act="wedstrijdInfoStil"]').click();
  await expect(page.locator('#toast')).toContainText('Opgeslagen');
  expect(await berichten(page)).toEqual([]);
  expect(await page.evaluate(() => CC.m.act(CC.S(), 'w-verpl').verzamel)).toBe('12:00');
  await controleer(page, fouten, 'alleen opslaan');
});

test('andere dag: afmeldingen, taken en vervoer vervallen (bewaard) en de ouders krijgen altijd bericht; ook in de database', TAG, async ({ page }) => {
  const fouten = volgFouten(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await nepDatabase(page); await inloggen(page, 'karim@test.nl'); const { datum } = await opbouw(page, 10); await naarWedstrijd(page);
  const nieuw = await page.evaluate(() => CC.date.addDays(CC.date.vandaag(), 14));
  await page.locator('#wi-d').fill(nieuw); await page.locator('#wi-t').fill('18:30');
  await expect(page.locator('[data-wi-hint]')).toContainText(/vervalt: 1 afmelding, \d+ taken?, 1× vervoer/);
  await expect(page.locator('[data-wi-knop]')).toHaveText('Opslaan en ouders inlichten');
  await page.screenshot({ path: 'test-results/verplaatsen-andere-dag.png' });
  await page.locator('[data-wi-knop]').click();
  await expect(page.locator('#toast')).toContainText('Verplaatst naar');
  const r = await page.evaluate(() => { const S = CC.S(); const a = CC.m.act(S, 'w-verpl'); const f = S.afm.find((x) => x.id === 'f-verpl'); const t = S.taken.find((x) => x.id === 'tk-verpl');
    return { datum: a.datum, afmAct: f.actId, afmWas: f.vervallen && f.vervallen.datum, taak: t.personId, taakWas: !!(t.vervallen && t.vervallen.personId), vervoer: !!S.vervoer['w-verpl'], bewaard: (a.vervallenVervoer || []).length, label: CC.wedLabel(a) }; });
  expect(r).toMatchObject({ datum: nieuw, afmAct: null, afmWas: datum, taak: null, taakWas: true, vervoer: false, bewaard: 1 });
  expect(r.label).toContain('Verplaatst · was');
  expect((await berichten(page))[0]).toContain('Meld het opnieuw af');
  expect((await berichten(page))[0]).toContain('Open taken: vlagger');
  expect((await berichten(page))[0]).toContain('Ik doe het');
  // In de database: de afmelding is niet gewist, maar hoort niet meer bij de wedstrijd
  await expect.poll(async () => { const row = (await nepDb(page)).rows['dcg|afm|f-verpl']; return row ? `${row.act_id}|${!!row.data.vervallen}` : 'weg'; }, { message: 'afmelding bewaard als vervallen' }).toBe('null|true');
  await controleer(page, fouten, 'andere dag');
});

test('verplaatst, datum volgt: telt als niet gespeeld, ouder ziet "Verplaatst"; nieuwe datum maakt hem weer gewoon', TAG, async ({ page }) => {
  const fouten = volgFouten(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await nepDatabase(page); await inloggen(page, 'karim@test.nl'); const { speler } = await opbouw(page); await naarWedstrijd(page);
  await page.locator('#app [data-act="wedDatumVolgt"]').click();
  await expect(page.locator('#sheet')).toContainText(/1 afmelding, \d+ taken?/);
  await page.locator('#sheet [data-act="wedDatumVolgtOk"]').click();
  await expect(page.locator('#app')).toContainText('Verplaatst, nieuwe datum volgt');
  const st = await page.evaluate((sid) => { const S = CC.S(); const a = CC.m.act(S, 'w-verpl'); return { afg: a.afgelast, chip: CC.h.chip(CC.m.status(S, CC.m.speler(S, sid), a)), sub: CC.h.actSub(S, a) }; }, speler);
  expect(st.afg).toBe(true); expect(st.chip).toContain('Verplaatst'); expect(st.sub).toContain('nieuwe datum volgt');
  expect((await berichten(page))[0]).toContain('Je hoeft nu niets te doen');
  // De nieuwe datum is bekend
  const nieuw = await page.evaluate(() => CC.date.addDays(CC.date.vandaag(), 12));
  await page.locator('#wi-d').fill(nieuw); await page.locator('#wi-t').fill('10:00'); await page.locator('[data-wi-knop]').click();
  const na = await page.evaluate(() => { const a = CC.m.act(CC.S(), 'w-verpl'); return { afg: a.afgelast, v: !!a.verplaatst, datum: a.datum, verzamel: a.verzamel }; });
  expect(na).toEqual({ afg: false, v: false, datum: nieuw, verzamel: '09:00' });
  expect((await berichten(page)).length).toBe(2);
  await controleer(page, fouten, 'datum volgt');
});

test('Teams: afgelasten en "gaat toch door" lichten de ouders in; andere dag via Teams laat oude afmeldingen vervallen', TAG, async ({ page }) => {
  const fouten = volgFouten(page);
  await nepDatabase(page); await inloggen(page, 'admin@test.nl'); await opbouw(page);
  await page.evaluate(() => { const i = CC.me().rollen.findIndex((r) => ['hjo', 'beheerder'].includes(r.rol)); if (i >= 0) CC.wisselRol(i); });
  const kan = await page.evaluate(() => !!document.querySelector('nav.nav button[data-tab="teams"]'));
  test.skip(!kan, 'geen tabblad Teams voor dit account');
  await page.locator('nav.nav button[data-tab="teams"]').click();
  await page.evaluate(() => { const el = document.createElement('button'); el.dataset.act = 'wedBewerk'; el.dataset.id = 'w-verpl'; document.body.appendChild(el); el.click(); el.remove(); });
  await expect(page.locator('#sheet [data-act="wedstrijdAfgelast"]')).toBeVisible();
  const nieuw = await page.evaluate(() => CC.date.addDays(CC.date.vandaag(), 9));
  await page.locator('#wb-d').fill(nieuw); await page.locator('#sheet form[data-submit="wedBewerkOk"] button.knop').click();
  await expect(page.locator('#toast')).toContainText('ouders zijn ingelicht');
  expect(await page.evaluate(() => CC.S().afm.filter((f) => f.actId === 'w-verpl').length)).toBe(0);
  await page.evaluate(() => { const el = document.createElement('button'); el.dataset.act = 'wedstrijdAfgelast'; el.dataset.id = 'w-verpl'; document.body.appendChild(el); el.click(); el.remove(); });
  await page.locator('#sheet form[data-submit="wedstrijdAfgelastOk"] button').click();
  await page.evaluate(() => { const el = document.createElement('button'); el.dataset.act = 'wedAfgelast'; el.dataset.id = 'w-verpl'; document.body.appendChild(el); el.click(); el.remove(); });
  const b = await berichten(page);
  expect(b.some((x) => x.startsWith('Wedstrijd afgelast'))).toBe(true); expect(b.some((x) => x.startsWith('Wedstrijd gaat toch door'))).toBe(true);
  await controleer(page, fouten, 'teams');
});
