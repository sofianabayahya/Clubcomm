// ClubComm tests — de servermotor (Besluit 77) laadt dezelfde app-bestanden en draait zonder fouten (Besluit 88).
// Draaien: npm test (of node --test tests/)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { maakMotor, draaiClub, BESTANDEN } from '../supabase/functions/automaat/motor.mjs';

const require = createRequire(import.meta.url);
const { kleineClub } = require('./kleine-club.js');
const bron = Object.fromEntries(BESTANDEN.map((b) => [b, readFileSync(new URL(`../public/app/${b}`, import.meta.url), 'utf8')]));

const draai = (S, club, nu) => {
  const rijen = [...maakMotor(bron).naarRijen(S, club).values()];
  return draaiClub(maakMotor(bron, nu), rijen, club);
};
const geenFouten = (u) => assert.deepEqual(u.verslag.filter((v) => v.startsWith('fout')), []);

test('motor laadt alle app-bestanden', () => {
  const CC = maakMotor(bron);
  for (const f of ['generate', 'naarRijen', 'uitRijen', 'automaatClub', 'automaatTeam']) assert.equal(typeof CC[f], 'function', `CC.${f} ontbreekt`);
});

test('automaat draait zonder fouten op de demo', () => {
  const u = draai(maakMotor(bron).generate(), 'scb');
  geenFouten(u);
  // de server schrijft nooit een bestaand bericht opnieuw weg
  assert.ok(u.opslaan.every((r) => ['msgs', 'acts', 'begeleidMomenten', 'ontwGesprek', 'ontwVerslag', 'autoVerstuurd', 'pres', 'speeltijdMin', 'speeltijdMogelijk', 'speeltijdKeeper', 'speeltijdSchema'].includes(r.soort)));
});

test('automaat draait zonder fouten op een kleine, bijna lege club', () => {
  geenFouten(draai(kleineClub(maakMotor(bron)), 'dcg'));
});

test('automaat draait zonder fouten op verschillende momenten van de dag en de week', () => {
  const S = maakMotor(bron).generate();
  const nu = Date.now();
  for (const uren of [2, 9, 26, 50, 74, 100, 150]) geenFouten(draai(S, 'scb', () => nu + uren * 3600e3));
});

// Besluit 100: één herinnering aan de trainer, de dag vóór het begeleidingsmoment vanaf 17:00, als de vragenlijst nog open is
test('herinnering vragenlijst begeleidingsmoment: één keer, de dag ervoor', () => {
  const nu = () => Date.UTC(2026, 9, 13, 16, 30); // di 13 okt 18:30 in Nederland
  const C = maakMotor(bron, nu); const S = kleineClub(C);
  S.people.push({ id: 'p-tr', naam: 'Ties Ruiter', email: 'tr@test.nl', tel: '', rollen: [{ rol: 'trainer', teamId: 'O12-1' }] });
  S.begeleidMomenten = [{ id: 'bm1', trainerId: 'p-tr', teamId: 'O12-1', actId: null, soort: 'training', datum: '2026-10-14', door: 'p-beheer', niveau: 'kort', klaar: false, gevraagd: '2026-10-10T10:00:00.000Z', voor: {}, plan: {}, obs: { punten: {}, notities: {}, klok: null, turf: {} }, vakken: {} }];
  const rijen = [...C.naarRijen(S, 'dcg').values()];
  const u = draaiClub(maakMotor(bron, nu), rijen, 'dcg'); geenFouten(u);
  const msg = u.opslaan.filter((r) => r.soort === 'msgs' && /^Herinnering: bereid je begeleidingsmoment/.test(r.data.onderwerp));
  assert.equal(msg.length, 1); assert.deepEqual(msg[0].data.ontvangers, ['p-tr']);
  assert.ok(u.opslaan.some((r) => r.soort === 'begeleidMomenten' && r.data.herinnerd));
  // Tweede ronde (het moment staat nu op herinnerd): geen nieuw bericht
  const rijen2 = rijen.map((r) => (r.soort === 'begeleidMomenten' ? { ...r, data: { ...r.data, herinnerd: '2026-10-13T16:30:00.000Z' } } : r));
  const u2 = draaiClub(maakMotor(bron, nu), rijen2, 'dcg');
  assert.equal(u2.opslaan.filter((r) => r.soort === 'msgs' && /^Herinnering: bereid/.test(r.data.onderwerp)).length, 0);
  // Vóór 17:00 nog niet
  const vroeg = () => Date.UTC(2026, 9, 13, 12, 0);
  assert.equal(draaiClub(maakMotor(bron, vroeg), rijen, 'dcg').opslaan.filter((r) => r.soort === 'msgs' && /^Herinnering: bereid/.test(r.data.onderwerp)).length, 0);
});
