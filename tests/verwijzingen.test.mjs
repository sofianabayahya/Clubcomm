// Controle: verwijzingen naar bestanden en mappen in de documentatie en tests bestaan echt (na het hernoemen van een map, 29-10).
// Telt ook nieuwe bestanden die nog niet in git staan (anders mist een lokale run wat GitHub wel ziet).
// Telt alleen paden tussen `backticks` die beginnen met docs/, supabase/, public/, tests/ of .claude/, plus vaste paden met path.join(__dirname, …) in scripts en tests.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const bestanden = execSync('git ls-files --cached --others --exclude-standard', { cwd: root }).toString().split('\n').filter((f) => /\.(md|js|mjs|sql)$/.test(f) && !f.startsWith('node_modules/'));
// Bewust geen controle: paden met een patroon of opvulling, uitvoer die niet in git staat, en verwijzingen naar wat er vroeger was (historisch)
const overslaan = (p) => /[*…{}<>$]|\.\.\.|\bX\b/.test(p) || p.startsWith('docs/presentaties/uit');
const historisch = (regel) => /tot 29-10|heette tot|Hernoemd naar|vroeger|vervallen|verwijderd|niet gemaakt|gebouwd als/i.test(regel);

test('verwijzingen naar bestanden en mappen bestaan', () => {
  const fout = [];
  for (const f of bestanden) {
    const tekst = fs.readFileSync(path.join(root, f), 'utf8');
    tekst.split('\n').forEach((regel, n) => {
      if (historisch(regel)) return;
      for (const m of regel.matchAll(/`((?:docs|supabase|public|tests|\.claude)\/[^`\s]*)`/g)) {
        const p = m[1].replace(/[),.;:]+$/, '').split('#')[0];
        if (overslaan(p)) continue;
        if (!fs.existsSync(path.join(root, p))) fout.push(`${f}:${n + 1} → ${p}`);
      }
      // Bestanden die een script zelf maakt (schrijven, of het doel van een kopie) bestaan nog niet en tellen niet mee
      const joins = [...regel.matchAll(/path\.join\(__dirname,\s*((?:'[^']+',?\s*)+)\)/g)];
      const te = /writeFileSync|mkdirSync/.test(regel) ? [] : /copyFileSync/.test(regel) ? joins.slice(0, 1) : joins;
      for (const m of te) {
        const p = path.join(path.dirname(f), ...[...m[1].matchAll(/'([^']+)'/g)].map((x) => x[1]));
        if (!fs.existsSync(path.join(root, p))) fout.push(`${f}:${n + 1} → ${p}`);
      }
    });
  }
  assert.deepEqual(fout, [], `Verwijzing naar een bestand of map die niet bestaat:\n${fout.join('\n')}`);
});
