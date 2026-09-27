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
  assert.ok(u.opslaan.every((r) => ['msgs', 'acts', 'ontwGesprek', 'ontwVerslag', 'autoVerstuurd', 'pres', 'speeltijdMin', 'speeltijdMogelijk', 'speeltijdKeeper', 'speeltijdSchema'].includes(r.soort)));
});

test('automaat draait zonder fouten op een kleine, bijna lege club', () => {
  geenFouten(draai(kleineClub(maakMotor(bron)), 'dcg'));
});

test('automaat draait zonder fouten op verschillende momenten van de dag en de week', () => {
  const S = maakMotor(bron).generate();
  const nu = Date.now();
  for (const uren of [2, 9, 26, 50, 74, 100, 150]) geenFouten(draai(S, 'scb', () => nu + uren * 3600e3));
});
