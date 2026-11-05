// ClubComm — Besluit 151: een PDF maken uit één functiekaart (de kaart is de enige bron; de PDF nooit los bewerken).
// Neemt de titel, het blok "Kort" en het blok "Let op" van de kaart, met de afbeeldingen uit Kort, op A4.
//   node docs/handleiding/pdf.js docs/handleiding/tekentool.md docs/presentaties/pdf/ClubComm-snelstart-tekenen.pdf "Snelstart: een oefenvorm tekenen" Gepubliceerd
// Bundel van meer kaarten (bundels.md): eerst het PDF-bestand, dan titel, status en per kaart een blok:
//   node docs/handleiding/pdf.js uit.pdf "Titel" Gepubliceerd "inloggen.md#Kort" "inloggen.md#Let op:3" "tekentool.md#Kort@tel"
//   ":3" = alleen de eerste 3 punten; "@tel" = alleen afbeeldingen waarvan het bestand "tel" bevat;
//   "~naast" = compact: het eerste beeld naast de stappen (bovenste deel), zodat meer kaarten op 2 A4 passen;
//   "= tekst" = een losse regel uit de bundel (bijvoorbeeld Wat je hieraan hebt, een noot of de slotregel);
//   "^ tekst" = een andere regel onder de titel (standaard: ClubComm · voor trainers · je oefenvormen zijn van jou).
// Gepubliceerd kan alleen als elke genoemde kaart de status In productie heeft (anders stopt het script).
// Gebruikt de Chromium van de tests (Playwright); er komt geen nieuwe software bij. Onderaan elke pagina de versieregel:
// datum · app-commit (uit de kaart; bij een bundel de commit van de repository) · status.
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const args = process.argv.slice(2);
const bundel = /\.pdf$/i.test(args[0] || '');
const [bron, doel, titel, status = 'Concept'] = bundel ? [null, args[0], args[1], args[2]] : args;
const delen = bundel ? args.slice(3) : null;
if (!doel || (!bundel && !bron) || (bundel && !delen.length)) { console.error('Gebruik: node docs/handleiding/pdf.js <kaart.md> <uit.pdf> ["Titel"] [status]  of  <uit.pdf> "Titel" <status> "kaart.md#Blok[:n][@filter]" …'); process.exit(2); }
const map = bundel ? __dirname : path.dirname(bron);
const lees = (f) => fs.readFileSync(path.resolve(map, f), 'utf8');
const md = bundel ? '' : fs.readFileSync(bron, 'utf8');
const blokVan = (tekst, naam) => { const m = tekst.match(new RegExp(`^## ${naam}\\n([\\s\\S]*?)(?=^## |$(?![\\s\\S]))`, 'm')); return m ? m[1].trim() : ''; };
const blok = (naam) => blokVan(md, naam);
const commit = bundel ? require('child_process').execSync('git rev-parse --short HEAD').toString().trim() : ((md.match(/commit `([0-9a-f]{7,})`/) || [])[1] || 'onbekend');
const esc = (t) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const inline = (t) => esc(t).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/\*(.+?)\*/g, '<i>$1</i>').replace(/`(.+?)`/g, '$1')
  .replace(/\s*\((Besluit|Besluiten) [^)]*\)/g, ''); // besluitnummers zijn voor ons, niet voor de trainer
const beeld = (rel, alt) => { const f = path.resolve(map, rel); const b64 = fs.readFileSync(f).toString('base64'); return `<figure><img src="data:image/jpeg;base64,${b64}" alt="${esc(alt)}"><figcaption>${esc(alt)}</figcaption></figure>`; };

const naarHtml = (tekst, filter) => {
  const uit = []; let lijst = null;
  const sluit = () => { if (lijst) { uit.push(`</${lijst}>`); lijst = null; } };
  for (const r of tekst.split('\n')) {
    const regel = r.trimEnd();
    const beelden = [...regel.matchAll(/!\[([^\]]*)\]\(([^)]+)\)/g)].filter((b) => !filter || b[2].includes(filter));
    if (/!\[/.test(regel) && !beelden.length) continue;
    if (beelden.length) { sluit(); uit.push(`<div class="beelden">${beelden.map((b) => beeld(b[2], b[1])).join('')}</div>`); continue; }
    let m;
    if ((m = regel.match(/^\d+\.\s+(.*)/))) { if (lijst !== 'ol') { sluit(); uit.push('<ol>'); lijst = 'ol'; } uit.push(`<li>${inline(m[1])}</li>`); continue; }
    if ((m = regel.match(/^\s*-\s+(.*)/))) { if (lijst !== 'ul') { sluit(); uit.push('<ul>'); lijst = 'ul'; } uit.push(`<li>${inline(m[1])}</li>`); continue; }
    sluit(); if (regel.trim()) uit.push(`<p>${inline(regel)}</p>`);
  }
  sluit(); return uit.join('\n');
};

const datum = new Date().toLocaleDateString('nl-NL', { day: 'numeric', month: 'numeric', year: 'numeric' });
const versie = `Versie ${datum} · app ${commit} · ${status}`;
const kop = titel || (md.match(/^# (.*)/m) || [])[1] || 'ClubComm';
// Een deel van een bundel: kop = titel van de kaart (bij Kort) of "Goed om te weten" (bij Let op)
const nietInProductie = new Set();
const deel = (spec) => { if (/^=\s/.test(spec)) return `<p class="los">${inline(spec.replace(/^=\s+/, ''))}</p>`;
  const m = spec.match(/^([^#]+)#([^:@~]+)(?::(\d+))?(?:@([^~]+))?(~naast)?$/); if (!m) throw new Error(`Onbekend deel: ${spec}`);
  const tekst = lees(m[1]); let b = blokVan(tekst, m[2]).replace(/^\*[^\n]*\*\n/, '');
  if (!/\*\*Status in de app\*\* \| In productie/.test(tekst)) nietInProductie.add(m[1]);
  if (m[3]) { let n = 0; b = b.split('\n').filter((r) => !/^\s*-\s+/.test(r) || ++n <= Number(m[3])).join('\n'); }
  const kop = m[2] === 'Kort' ? (tekst.match(/^# (.*)/m) || [])[1] : 'Goed om te weten';
  if (m[5]) { // compact: tekst links, eerste beeld rechts
    const bl = [...b.matchAll(/!\[([^\]]*)\]\(([^)]+)\)/g)].filter((x) => !m[4] || x[2].includes(m[4]))[0];
    const img = bl ? `<img class="naast" src="data:image/jpeg;base64,${fs.readFileSync(path.resolve(map, bl[2])).toString('base64')}" alt="${esc(bl[1])}">` : '';
    return `<section class="naast"><div><h2>${esc(kop)}</h2>${naarHtml(b.replace(/^.*!\[.*$/gm, ''))}</div>${img}</section>`; }
  return `<h2${m[2] === 'Kort' ? '' : ' class="klein"'}>${esc(kop)}</h2>${naarHtml(b, m[4])}`; };
const SUB = 'ClubComm · voor trainers · je oefenvormen zijn van jou';
const sub = bundel && delen.find((d) => /^\^\s/.test(d)) ? delen.find((d) => /^\^\s/.test(d)).replace(/^\^\s+/, '') : SUB;
if (bundel) delen.splice(0, delen.length, ...delen.filter((d) => !/^\^\s/.test(d)));
const inhoud = bundel ? delen.map(deel).join('\n') : `<h2>In zes stappen</h2>${naarHtml(blok('Kort').replace(/^\*Voor elke trainer[^\n]*\n/, ''))}
  <h2>Goed om te weten</h2>${naarHtml(blok('Let op'))}`;
const html = `<!doctype html><html lang="nl"><head><meta charset="utf-8"><style>
  @page { size: A4; margin: 16mm 16mm 18mm; }
  body { font-family: Arial, Helvetica, sans-serif; color: #0b2545; font-size: 12pt; line-height: 1.4; }
  h1 { font-size: 22pt; margin: 0 0 4pt; } .sub { color: #5b6b7f; margin: 0 0 12pt; }
  h2 { font-size: 15pt; margin: 12pt 0 6pt; color: #0869c2; break-after: avoid; } h2.klein { font-size: 12.5pt; color: #0b2545; margin-top: 8pt; }
  ol, ul { padding-left: 18pt; margin: 4pt 0; } li { margin: 0 0 5pt; } p { margin: 4pt 0; }
  .beelden { display: flex; gap: 8pt; margin: 8pt 0; break-inside: avoid; }
  section.naast { display: flex; gap: 10pt; align-items: flex-start; break-inside: avoid; border-top: 1px solid #e3e9f1; padding-top: 4pt; } section.naast > div { flex: 1; }
  img.naast { width: 44mm; height: 62mm; object-fit: cover; object-position: top; border: 1px solid #e3e9f1; border-radius: 6pt; margin-top: 12pt; } .los { margin: 8pt 0; }
  figure { margin: 0; flex: 0 1 31%; } img { width: 100%; max-height: 72mm; object-fit: contain; border: 1px solid #e3e9f1; border-radius: 6pt; } figcaption { font-size: 9pt; color: #5b6b7f; margin-top: 2pt; }
</style></head><body>
  <h1>${esc(kop)}</h1><p class="sub">${esc(sub)}</p>
  ${inhoud}
</body></html>`;

if (status === 'Gepubliceerd' && nietInProductie.size) { console.error(`Niet te publiceren, niet In productie: ${[...nietInProductie].join(', ')}`); process.exit(1); }

(async () => {
  const browser = await chromium.launch(); const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'load' });
  fs.mkdirSync(path.dirname(doel), { recursive: true });
  await page.pdf({ path: doel, format: 'A4', printBackground: true, displayHeaderFooter: true, headerTemplate: '<span></span>',
    footerTemplate: `<div style="font-size:8pt;color:#5b6b7f;width:100%;padding:0 16mm;display:flex;justify-content:space-between"><span>${esc(versie)}</span><span>Pagina <span class="pageNumber"></span> van <span class="totalPages"></span></span></div>` });
  await browser.close();
  console.log(`${doel} gemaakt (${versie})`);
})();
