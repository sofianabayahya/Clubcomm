// Controle: elk besluitnummer in docs/besluiten.md komt één keer voor, als kop én als regel in het Register (4-11-2026).
// Op GitHub draaien de tests van een pull request op de stand ná samenvoegen met main. Kiest een pull request
// een nummer dat al op main staat, dan staat het hier dus twee keer en faalt deze test vóór het samenvoegen.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const tekst = fs.readFileSync(path.join(root, 'docs', 'besluiten.md'), 'utf8');

const koppen = [...tekst.matchAll(/^## Besluit (\d+)\b/gm)].map((m) => Number(m[1]));
const register = (() => {
  const start = tekst.indexOf('\n## Register');
  assert.ok(start >= 0, 'het kopje "## Register" ontbreekt');
  const eind = tekst.indexOf('\n## ', start + 1);
  return [...tekst.slice(start, eind).matchAll(/^\| (\d+) \|/gm)].map((m) => Number(m[1]));
})();
const dubbel = (lijst) => [...new Set(lijst.filter((n, i) => lijst.indexOf(n) !== i))].sort((a, b) => a - b);

test('elk besluitnummer heeft één kop', () => {
  assert.ok(koppen.length > 100, `te weinig besluiten gevonden (${koppen.length}): klopt het kopformaat "## Besluit N — …" nog?`);
  assert.deepEqual(dubbel(koppen), [], 'dubbel besluitnummer als kop: kies het eerstvolgende vrije nummer (kijk ook naar open pull requests)');
});

test('elk besluitnummer staat één keer in het Register', () => {
  assert.deepEqual(dubbel(register), [], 'dubbel besluitnummer in het Register');
});

test('Register en koppen horen bij elkaar', () => {
  const k = new Set(koppen), r = new Set(register);
  assert.deepEqual([...k].filter((n) => !r.has(n)).sort((a, b) => a - b), [], 'besluit met kop maar zonder regel in het Register');
  assert.deepEqual([...r].filter((n) => !k.has(n)).sort((a, b) => a - b), [], 'regel in het Register zonder besluit eronder');
});
