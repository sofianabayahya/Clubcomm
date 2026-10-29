// ClubComm — snelle controle vóór een wijziging en vlak vóór samenvoegen: npm run check
// Alleen lezen (plus git fetch). Laat zien: is de werkbranch actueel, zijn er samenvoegconflicten met main, welk ander open werk
// (branches die nog niet in main zitten) raakt dezelfde bestanden, en het eerstvolgende vrije besluitnummer (ook gekeken in dat open werk).
// Open pull requests zelf: via GitHub (de koppeling); deze controle ziet alleen branches.
import { execSync } from 'node:child_process';
const git = (a) => { try { return execSync(`git ${a}`, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim(); } catch { return ''; } };
const regels = (t) => t.split('\n').filter(Boolean);
git('fetch -q --prune origin');
const tak = git('rev-parse --abbrev-ref HEAD'); const [achter, voor] = git('rev-list --left-right --count origin/main...HEAD').split(/\s+/).map(Number);
const vuil = regels(git('status --porcelain')).filter((l) => !l.endsWith('node_modules') && !l.includes('test-results'));
console.log(`Branch ${tak}: ${voor} commit(s) eigen werk, ${achter} achter op main${achter ? ' → eerst main binnenhalen (git merge origin/main)' : ' (actueel)'}`);
if (vuil.length) console.log(`Nog niet vastgelegd: ${vuil.length} bestand(en)`);
// Conflicten met main (zonder iets te veranderen): git merge-tree geeft bij een conflict de bestandsnamen na de eerste regel
const conflicten = (a, b) => { try { execSync(`git merge-tree --write-tree --name-only ${a} ${b}`, { stdio: 'ignore' }); return []; }
  catch { try { execSync(`git merge-tree --write-tree --name-only ${a} ${b}`, { encoding: 'utf8' }); } catch (f) { return regels(String(f.stdout).split('\n\n')[0]).slice(1); } return []; } };
const c = conflicten('origin/main', 'HEAD'); console.log(c.length ? `Conflict met main in: ${c.join(', ')}` : 'Geen conflict met main');
// Mijn gewijzigde bestanden en ander open werk
const mijn = new Set(regels(git('diff --name-only origin/main...HEAD')));
const open = regels(git("for-each-ref '--format=%(refname:short)' refs/remotes/origin")).filter((b) => !['origin/main', 'origin/HEAD', 'origin', `origin/${tak}`].includes(b) && git(`rev-list --count origin/main..${b}`) !== '0');
const hoogste = (ref) => Math.max(0, ...[...git(`show ${ref}:docs/besluiten.md`).matchAll(/^## Besluit (\d+)/gm)].map((m) => Number(m[1])));
let max = Math.max(hoogste('origin/main'), hoogste('HEAD')); const overlap = [];
for (const b of open) { max = Math.max(max, hoogste(b)); const zelfde = regels(git(`diff --name-only origin/main...${b}`)).filter((f) => mijn.has(f)); if (zelfde.length) { const k = conflicten(b, 'HEAD');
  overlap.push(`${b.replace('origin/', '')} (${git(`log -1 --format=%cr ${b}`)}): ${zelfde.join(', ')}${k.length ? ` → conflict in ${k.join(', ')}` : ' → samen te voegen zonder conflict'}`); } }
console.log(`Open werk (branches niet in main): ${open.length ? open.map((b) => b.replace('origin/', '')).join(', ') : 'geen'}`);
console.log(overlap.length ? `Zelfde bestanden als ander open werk:\n  ${overlap.join('\n  ')}` : 'Geen ander open werk raakt jouw bestanden');
console.log(`Hoogste besluit in main: ${hoogste('origin/main')} · eerstvolgende vrije nummer (ook gekeken in open werk): ${max + 1}`);
