// ClubComm — Besluit 151: een PDF maken uit één functiekaart (de kaart is de enige bron; de PDF nooit los bewerken).
// Neemt de titel, het blok "Kort" en het blok "Let op" van de kaart, met de afbeeldingen uit Kort, op A4.
//   node docs/handleiding/pdf.js docs/handleiding/tekentool.md docs/presentaties/pdf/ClubComm-snelstart-tekenen.pdf "Snelstart: een oefenvorm tekenen" Gepubliceerd
// Gebruikt de Chromium van de tests (Playwright); er komt geen nieuwe software bij. Onderaan elke pagina de versieregel:
// datum · app-commit (uit de kaart) · status.
//
// Bundel (Besluit 151): een uitgave uit meer kaarten, zoals beschreven in docs/handleiding/bundels.md.
//   node docs/handleiding/pdf.js --bundel "Snelstart vrijwillige trainer" docs/presentaties/pdf/ClubComm-snelstart-trainer.pdf [Concept|Gereed|Gepubliceerd]
// Per kaart: de titel en het blok "Kort" met het eerste beeld; bovenaan "Wat je hieraan hebt", onderaan de slotregel.
// De versieregel noemt de commit van de repository. Gepubliceerd kan alleen als elke kaart de status In productie heeft.
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { chromium } = require('playwright');

const BUNDEL = process.argv[2] === '--bundel';
const [bron, doel, titel, status = 'Concept'] = BUNDEL ? [process.argv[3], process.argv[4], null, process.argv[5]] : process.argv.slice(2);
if (!bron || !doel) { console.error('Gebruik: node docs/handleiding/pdf.js <kaart.md> <uit.pdf> ["Titel"] [Concept|Gereed|Gepubliceerd]\n   of: node docs/handleiding/pdf.js --bundel "<naam uit bundels.md>" <uit.pdf> [status]'); process.exit(2); }
const map = BUNDEL ? __dirname : path.dirname(bron);
const md = BUNDEL ? '' : fs.readFileSync(bron, 'utf8');
const blokVan = (tekst, naam) => { const m = tekst.match(new RegExp(`^## ${naam}\\n([\\s\\S]*?)(?=^## |$(?![\\s\\S]))`, 'm')); return m ? m[1].trim() : ''; };
const blok = (naam) => blokVan(md, naam);
const commit = BUNDEL ? execSync('git rev-parse --short HEAD', { cwd: __dirname }).toString().trim() : (md.match(/commit `([0-9a-f]{7,})`/) || [])[1] || 'onbekend';
const esc = (t) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const inline = (t) => esc(t).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/\*(.+?)\*/g, '<i>$1</i>').replace(/`(.+?)`/g, '$1').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
  .replace(/\s*\((Besluit|Besluiten) [^)]*\)/g, ''); // besluitnummers zijn voor ons, niet voor de trainer
const beeld = (rel, alt) => { const f = path.resolve(map, rel); const b64 = fs.readFileSync(f).toString('base64'); return `<figure><img src="data:image/jpeg;base64,${b64}" alt="${esc(alt)}"><figcaption>${esc(alt)}</figcaption></figure>`; };

const naarHtml = (tekst) => {
  const uit = []; let lijst = null;
  const sluit = () => { if (lijst) { uit.push(`</${lijst}>`); lijst = null; } };
  for (const r of tekst.split('\n')) {
    const regel = r.trimEnd();
    const beelden = [...regel.matchAll(/!\[([^\]]*)\]\(([^)]+)\)/g)];
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
const kaartHtml = () => `<!doctype html><html lang="nl"><head><meta charset="utf-8"><style>
  @page { size: A4; margin: 16mm 16mm 18mm; }
  body { font-family: Arial, Helvetica, sans-serif; color: #0b2545; font-size: 12pt; line-height: 1.4; }
  h1 { font-size: 22pt; margin: 0 0 4pt; } .sub { color: #5b6b7f; margin: 0 0 12pt; }
  h2 { font-size: 15pt; margin: 14pt 0 6pt; color: #0869c2; }
  ol, ul { padding-left: 18pt; margin: 4pt 0; } li { margin: 0 0 5pt; } p { margin: 4pt 0; }
  .beelden { display: flex; gap: 8pt; margin: 8pt 0; break-inside: avoid; }
  figure { margin: 0; flex: 1; } img { width: 100%; border: 1px solid #e3e9f1; border-radius: 6pt; } figcaption { font-size: 9pt; color: #5b6b7f; margin-top: 2pt; }
</style></head><body>
  <h1>${esc(kop)}</h1><p class="sub">ClubComm · voor trainers · je oefenvormen zijn van jou</p>
  <h2>In zes stappen</h2>${naarHtml(blok('Kort').replace(/^\*Voor elke trainer[^\n]*\n/, ''))}
  <h2>Goed om te weten</h2>${naarHtml(blok('Let op'))}
</body></html>`;

// Bundel: de kaarten en teksten uit bundels.md; per kaart titel + Kort (stappen links, eerste beeld rechts)
const bundelHtml = () => {
  const deel = blokVan(fs.readFileSync(path.join(__dirname, 'bundels.md'), 'utf8'), bron);
  if (!deel) { console.error(`Bundel "${bron}" staat niet in bundels.md`); process.exit(2); }
  const veld = (naam) => ((deel.match(new RegExp(`\\*\\*${naam}\\*\\* \\| (.+?) \\|`)) || [])[1] || '').trim();
  const kaarten = [...deel.matchAll(/^\d+\. \[[^\]]+\]\(([^)]+)\): [^\n]*?(?:\*([^*\n]+)\*)?$/gm)].map((m) => ({ f: m[1], noot: m[2] }));
  const slot = (deel.match(/\*\*Slotregel[^*]*\*\* \*(.+)\*\s*$/m) || [])[1];
  const nietKlaar = [];
  const secties = kaarten.map(({ f, noot }) => {
    const k = fs.readFileSync(path.join(__dirname, f), 'utf8');
    if (!/\*\*Status in de app\*\* \| In productie/.test(k)) nietKlaar.push(f);
    const kort = blokVan(k, 'Kort'); const regels = kort.split('\n');
    const intro = (regels.find((r) => /^\*[^*].*\*$/.test(r.trim())) || '').trim().replace(/^\*|\*$/g, '');
    const stappen = naarHtml(regels.filter((r) => /^\d+\.\s/.test(r)).join('\n'));
    const b = kort.match(/!\[([^\]]*)\]\(([^)]+)\)/);
    return `<section><div class="tekst"><h2>${inline((k.match(/^# (.*)/m) || [])[1] || f)}</h2>${noot ? `<p class="noot">${inline(noot)}</p>` : ''}${intro ? `<p class="intro">${inline(intro)}</p>` : ''}${stappen}</div>${b ? `<img src="data:image/jpeg;base64,${fs.readFileSync(path.resolve(__dirname, b[2])).toString('base64')}" alt="${esc(b[1])}">` : ''}</section>`;
  });
  if (status === 'Gepubliceerd' && nietKlaar.length) { console.error(`Niet te publiceren: niet In productie: ${nietKlaar.join(', ')}`); process.exit(1); }
  return `<!doctype html><html lang="nl"><head><meta charset="utf-8"><style>
  @page { size: A4; margin: 14mm 16mm 18mm; }
  body { font-family: Arial, Helvetica, sans-serif; color: #0b2545; font-size: 11.5pt; line-height: 1.4; }
  h1 { font-size: 22pt; margin: 0 0 4pt; } .sub { color: #5b6b7f; margin: 0 0 6pt; } .wat { margin: 0 0 8pt; font-size: 12.5pt; }
  section { display: flex; gap: 10pt; align-items: flex-start; break-inside: avoid; border-top: 1px solid #e3e9f1; padding: 9pt 0; }
  .tekst { flex: 1; } h2 { font-size: 15pt; margin: 0 0 4pt; color: #0869c2; } .intro, .noot { margin: 0 0 4pt; color: #5b6b7f; } .noot { font-style: italic; }
  ol, ul { padding-left: 18pt; margin: 4pt 0; } li { margin: 0 0 4pt; } p { margin: 4pt 0; }
  img { width: 44mm; height: 64mm; object-fit: cover; object-position: top; border: 1px solid #e3e9f1; border-radius: 6pt; }
  .slot { border-top: 1px solid #e3e9f1; padding-top: 8pt; }
</style></head><body>
  <h1>${esc(bron)}</h1><p class="sub">ClubComm · snelstart</p>${veld('Wat je hieraan hebt') ? `<p class="wat">${inline(veld('Wat je hieraan hebt'))}</p>` : ''}
  ${secties.join('\n')}
  ${slot ? `<p class="slot">${inline(slot)}</p>` : ''}
</body></html>`;
};
const html = BUNDEL ? bundelHtml() : kaartHtml();

(async () => {
  const browser = await chromium.launch(); const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'load' });
  fs.mkdirSync(path.dirname(doel), { recursive: true });
  await page.pdf({ path: doel, format: 'A4', printBackground: true, displayHeaderFooter: true, headerTemplate: '<span></span>',
    footerTemplate: `<div style="font-size:8pt;color:#5b6b7f;width:100%;padding:0 16mm;display:flex;justify-content:space-between"><span>${esc(versie)}</span><span>Pagina <span class="pageNumber"></span> van <span class="totalPages"></span></span></div>` });
  await browser.close();
  console.log(`${doel} gemaakt (${versie})`);
})();
