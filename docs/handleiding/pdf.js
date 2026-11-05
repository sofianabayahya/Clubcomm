// ClubComm — Besluit 151: een PDF maken uit één functiekaart (de kaart is de enige bron; de PDF nooit los bewerken).
// Neemt de titel, het blok "Kort" en het blok "Let op" van de kaart, met de afbeeldingen uit Kort, op A4.
//   node docs/handleiding/pdf.js docs/handleiding/tekentool.md docs/presentaties/pdf/ClubComm-snelstart-tekenen.pdf "Snelstart: een oefenvorm tekenen" Gepubliceerd
// Gebruikt de Chromium van de tests (Playwright); er komt geen nieuwe software bij. Onderaan elke pagina de versieregel:
// datum · app-commit (uit de kaart) · status.
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const [bron, doel, titel, status = 'Concept'] = process.argv.slice(2);
if (!bron || !doel) { console.error('Gebruik: node docs/handleiding/pdf.js <kaart.md> <uit.pdf> ["Titel"] [Concept|Gereed|Gepubliceerd]'); process.exit(2); }
const md = fs.readFileSync(bron, 'utf8');
const map = path.dirname(bron);
const blok = (naam) => { const m = md.match(new RegExp(`^## ${naam}\\n([\\s\\S]*?)(?=^## |$(?![\\s\\S]))`, 'm')); return m ? m[1].trim() : ''; };
const commit = (md.match(/commit `([0-9a-f]{7,})`/) || [])[1] || 'onbekend';
const esc = (t) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const inline = (t) => esc(t).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/\*(.+?)\*/g, '<i>$1</i>').replace(/`(.+?)`/g, '$1')
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
const html = `<!doctype html><html lang="nl"><head><meta charset="utf-8"><style>
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

(async () => {
  const browser = await chromium.launch(); const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'load' });
  fs.mkdirSync(path.dirname(doel), { recursive: true });
  await page.pdf({ path: doel, format: 'A4', printBackground: true, displayHeaderFooter: true, headerTemplate: '<span></span>',
    footerTemplate: `<div style="font-size:8pt;color:#5b6b7f;width:100%;padding:0 16mm;display:flex;justify-content:space-between"><span>${esc(versie)}</span><span>Pagina <span class="pageNumber"></span> van <span class="totalPages"></span></span></div>` });
  await browser.close();
  console.log(`${doel} gemaakt (${versie})`);
})();
