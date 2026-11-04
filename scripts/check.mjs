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
// Alleen de weergave (nummers en overlap hierboven kijken naar alle branches): wat al in main staat apart, zodat echt open werk opvalt.
// Inhoud al in main = samenvoegen met main verandert niets. Waarschijnlijk af = alleen documenten (docs/) die ook in main staan, in een andere versie.
const boomMain = git('rev-parse origin/main^{tree}'); const soort = { inMain: [], af: [], oud: [], open: [] };
for (const b of open) { const n = b.replace('origin/', ''); let boom = ''; try { boom = execSync(`git merge-tree --write-tree ${b} origin/main`, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).split('\n')[0]; } catch { /* conflict */ }
  const bestanden = regels(git(`diff --name-only origin/main...${b}`));
  // Geen gemeenschappelijke basis: van vóór de herstart van main (19-10-2026); niet automatisch te vergelijken
  if (!git(`merge-base origin/main ${b}`)) soort.oud.push(n); else if (boom === boomMain) soort.inMain.push(n); else if (bestanden.length && bestanden.every((f) => f.startsWith('docs/') && git(`cat-file -t origin/main:${f}`) === 'blob')) soort.af.push(n); else soort.open.push(n); }
console.log(`Open werk (branches niet in main): ${soort.open.length ? soort.open.join(', ') : 'geen'}`);
if (soort.af.length) console.log(`Waarschijnlijk af (alleen documenten die ook in main staan, in een andere versie; eerst nakijken): ${soort.af.join(', ')}`);
if (soort.inMain.length) console.log(`Inhoud al in main (kan weg): ${soort.inMain.join(', ')}`);
if (soort.oud.length) console.log(`Van vóór 19-10 (geen gemeenschappelijke basis met main; niet te vergelijken): ${soort.oud.join(', ')}`);
console.log(overlap.length ? `Zelfde bestanden als ander open werk:\n  ${overlap.join('\n  ')}` : 'Geen ander open werk raakt jouw bestanden');
console.log(`Hoogste besluit in main: ${hoogste('origin/main')} · eerstvolgende vrije nummer (ook gekeken in open werk): ${max + 1}`);
// Besluitnummers (werkafspraak 04-11): tijdens het werk heet een nieuw besluit `Besluit NNN`; het nummer pas bij "overdracht bijwerken".
// (a) Waar staat in jouw branch nog NNN? (b) Staat een nummer dat niet in main zit in twee branches met een andere titel?
// Uitleg over de afspraak staat tussen `…` of *…* en telt niet mee
const nnn = [...new Set(regels(git('grep -n -w NNN -- "*.md" "*.js" "*.mjs" "*.json" "*.sql" "*.voorstel" "*.html" "*.css" ":(exclude)scripts/check.mjs" ":(exclude)docs/onderzoek/besluitnummers"'))
  .filter((l) => /\bNNN\b/.test(l.replace(/^[^:]*:\d+:/, '').replace(/`[^`]*`|\*[^*\s][^*]*\*/g, ''))).map((l) => l.split(':')[0]))];
console.log(nnn.length ? `Nog zonder besluitnummer (NNN) in: ${nnn.join(', ')} → vlak vóór samenvoegen nummeren met ${max + 1}` : 'Geen NNN meer in jouw branch');
const koppen = (ref) => new Map([...git(`show ${ref}:docs/besluiten.md`).matchAll(/^## Besluit (\d+)\s*[—-]\s*(.*)$/gm)].map((m) => [Number(m[1]), m[2].trim()]));
// Zelfde nummer en zelfde titel = hetzelfde besluit (een branch die een andere heeft binnengehaald); andere titel = dubbel
const inMain = koppen('origin/main'); const wie = new Map();
for (const b of [...open, 'HEAD']) for (const [n, titel] of koppen(b)) if (!inMain.has(n)) { const t = wie.get(n) || new Map(); t.set(titel, [...(t.get(titel) || []), b === 'HEAD' ? tak : b.replace('origin/', '')]); wie.set(n, t); }
const dubbel = [...wie].filter(([, t]) => t.size > 1);
console.log(dubbel.length ? `Besluitnummer dubbel in open werk: ${dubbel.map(([n, t]) => `${n} (${[...t.values()].map((bs) => bs[0]).join(' en ')})`).join(' · ')} → wie later samenvoegt, krijgt een nieuw nummer` : 'Geen dubbel besluitnummer in open werk');
