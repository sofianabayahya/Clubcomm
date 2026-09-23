// Maakt de presentatie "ClubComm – voorstel pilot" voor het bestuur (16:9).
// Opnieuw maken: npm install pptxgenjs react-icons react react-dom sharp
//   node docs/bestuur/maak-bestuursvoorstel.js [map-met-schermafbeeldingen]
// Schermafbeeldingen (ouder.png, trainer.png, teamleider.png, hjo.png) komen uit de demo (390×780, 2×).
const path = require('path');
const pptxgen = require('pptxgenjs');
const React = require('react');
const ReactDOMServer = require('react-dom/server');
const sharp = require('sharp');
const fa = require('react-icons/fa6');

const OUT = path.join(__dirname, 'ClubComm-voorstel-pilot-bestuur.pptx');
const SHOTS = process.argv[2] || path.join(__dirname, 'shots');
const LOGO = path.join(__dirname, '..', '..', 'public', 'assets', 'clubcomm-icon.png');

const BLUE = '0D88F9', NAVY = '0B2545', TINT = 'EAF4FE', GREY = 'F3F6FA', MUTED = '5B6B7F', INK = '14213D';
const GREEN = '16A34A', ORANGE = 'EA8A0C', RED = 'DC2626', WHITE = 'FFFFFF';
const HEAD = 'Calibri', BODY = 'Calibri';
const W = 10, H = 5.625, M = 0.5;

async function icon(name, color) {
  const svg = ReactDOMServer.renderToStaticMarkup(React.createElement(fa[name], { color: '#' + color, size: 256 }));
  const png = await sharp(Buffer.from(svg)).resize(256, 256).png().toBuffer();
  return 'image/png;base64,' + png.toString('base64');
}
const shadow = () => ({ type: 'outer', color: '000000', opacity: 0.12, blur: 8, offset: 2, angle: 90 });

(async () => {
  const pres = new pptxgen();
  pres.layout = 'LAYOUT_16x9';
  pres.title = 'ClubComm – voorstel pilot';
  pres.author = 'ClubComm';

  const title = (s, t, sub) => {
    s.addText(t, { x: M, y: 0.35, w: W - 2 * M, h: 0.6, fontFace: HEAD, fontSize: 28, bold: true, color: NAVY, margin: 0, isTextBox: true });
    if (sub) s.addText(sub, { x: M, y: 0.95, w: W - 2 * M, h: 0.4, fontFace: BODY, fontSize: 14, color: MUTED, margin: 0, isTextBox: true });
  };
  const footer = (s, n) => s.addText(`ClubComm · SC Buitenveldert   ${n}`, { x: M, y: H - 0.35, w: W - 2 * M, h: 0.25, fontFace: BODY, fontSize: 9, color: '9AA7B7', align: 'right', margin: 0, isTextBox: true });
  const iconCircle = async (s, name, x, y, d, bg, fg) => {
    s.addShape(pres.shapes.OVAL, { x, y, w: d, h: d, fill: { color: bg }, line: { color: bg } });
    s.addImage({ data: await icon(name, fg), x: x + d * 0.25, y: y + d * 0.25, w: d * 0.5, h: d * 0.5 });
  };
  const phone = (s, file, x, y, h) => {
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: x - 0.06, y: y - 0.06, w: h / 2 + 0.12, h: h + 0.12, fill: { color: WHITE }, line: { color: 'D5DDE8', width: 1 }, rectRadius: 0.12, shadow: shadow() });
    s.addImage({ path: path.join(SHOTS, file), x, y, w: h / 2, h });
  };
  let n = 1;

  // 1. Titel
  {
    const s = pres.addSlide(); s.background = { color: NAVY };
    s.addImage({ path: LOGO, x: M, y: 0.6, w: 0.9, h: 0.9 });
    s.addText('ClubComm', { x: M, y: 1.75, w: 8, h: 0.8, fontFace: HEAD, fontSize: 44, bold: true, color: WHITE, margin: 0, isTextBox: true });
    s.addText('Voorstel voor een pilot in de onderbouw', { x: M, y: 2.55, w: 8, h: 0.5, fontFace: BODY, fontSize: 22, color: 'CFE6FD', margin: 0, isTextBox: true });
    s.addText('SC Buitenveldert · bestuur · najaar 2026', { x: M, y: 4.6, w: 8, h: 0.35, fontFace: BODY, fontSize: 13, color: '8FA6C1', margin: 0, isTextBox: true });
    s.addNotes('Doel van deze presentatie: het bestuur laten zien wat ClubComm is en akkoord vragen voor een pilot met 3 à 4 onderbouwteams.');
    n++;
  }

  // 2. Het probleem
  {
    const s = pres.addSlide(); s.background = { color: WHITE };
    title(s, 'Wat we elke week zien', 'Herkenbaar voor bijna elke amateurclub');
    const items = [
      ['FaUserXmark', 'Niet afgemeld', 'Kinderen komen niet, zonder bericht. De trainer weet pas op het veld wie er is.'],
      ['FaComments', 'Alles via WhatsApp', 'Afmeldingen, vervoer en taken in drukke groepen. Informatie raakt zoek.'],
      ['FaHandshakeAngle', 'Steeds dezelfde ouders', 'Een paar gezinnen doen het meeste werk. Landelijk: 78% van de clubs heeft genoeg vrijwilligers, was 85% (Mulier, 2021–2023).'],
      ['FaEyeSlash', 'Opvolging zit in hoofden', 'Wie belt als een kind vaak ontbreekt? Wie weet dat een trainer vaak afzegt? Niets wordt vastgelegd.'],
    ];
    const cw = (W - 2 * M - 0.3 * 3) / 4;
    for (let i = 0; i < items.length; i++) {
      const [ic, t, d] = items[i]; const x = M + i * (cw + 0.3), y = 1.6;
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w: cw, h: 3.3, fill: { color: GREY }, line: { color: GREY }, rectRadius: 0.1 });
      await iconCircle(s, ic, x + 0.25, y + 0.3, 0.6, TINT, BLUE);
      s.addText(t, { x: x + 0.25, y: y + 1.05, w: cw - 0.5, h: 0.6, fontFace: HEAD, fontSize: 15, bold: true, color: NAVY, margin: 0, valign: 'top', isTextBox: true });
      s.addText(d, { x: x + 0.25, y: y + 1.7, w: cw - 0.5, h: 1.4, fontFace: BODY, fontSize: 11.5, color: INK, margin: 0, valign: 'top', isTextBox: true });
    }
    footer(s, n++);
  }

  // 3. Wat is ClubComm
  {
    const s = pres.addSlide(); s.background = { color: WHITE };
    title(s, 'Eén plek voor de jeugd', 'Op de telefoon, zonder wachtwoord, voor ouders, trainers, teamleiders, coördinatoren en de HJO');
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: M, y: 1.6, w: W - 2 * M, h: 1.0, fill: { color: TINT }, line: { color: TINT }, rectRadius: 0.1 });
    s.addText([{ text: 'ClubComm signaleert, communiceert en documenteert. ', options: { bold: true, color: NAVY } }, { text: 'Mensen beslissen. Geen automatische straffen.', options: { color: INK } }], { x: M + 0.3, y: 1.6, w: W - 2 * M - 0.6, h: 1.0, fontFace: BODY, fontSize: 18, valign: 'middle', margin: 0, isTextBox: true });
    const cols = [
      ['FaBell', 'Signaleren', 'Wie is vaak afwezig, wie meldt te laat af, welk team zakt weg, waar blijven taken open.'],
      ['FaPaperPlane', 'Communiceren', 'Afmelden met één tik, berichten per team, vaste berichten bij vakanties, trainingen in de eigen agenda.'],
      ['FaFolderOpen', 'Documenteren', 'Gesprekken, afspraken en beoordelingen staan op één plek, ook als een trainer wisselt.'],
    ];
    const cw = (W - 2 * M - 0.4 * 2) / 3;
    for (let i = 0; i < 3; i++) {
      const [ic, t, d] = cols[i]; const x = M + i * (cw + 0.4), y = 2.95;
      await iconCircle(s, ic, x, y, 0.55, BLUE, WHITE);
      s.addText(t, { x: x + 0.7, y, w: cw - 0.7, h: 0.55, fontFace: HEAD, fontSize: 16, bold: true, color: NAVY, valign: 'middle', margin: 0, isTextBox: true });
      s.addText(d, { x, y: y + 0.7, w: cw, h: 1.3, fontFace: BODY, fontSize: 12, color: INK, valign: 'top', margin: 0, isTextBox: true });
    }
    footer(s, n++);
  }

  // 4–7. Per rol
  const rollen = [
    ['ouder.png', 'Voor ouders', 'Afmelden in 10 seconden', [
      ['Afmelden', 'Bij elke training en wedstrijd, met reden. Zie tot wanneer het op tijd is. Ook voor een periode (vakantie) of langdurig (blessure).'],
      ['Vervoer en taken', 'Plek in de auto aanbieden of vragen. Helpen met één tik; "kan niet" mag ook.'],
      ['Eigen kind', 'Aanwezigheid, kaarten en beoordeling van alleen je eigen kind. Nooit een ranglijst.'],
    ]],
    ['trainer.png', 'Voor trainers', 'Weten wie er komt, en wie aandacht nodig heeft', [
      ['Aanwezigheid', 'Opnemen op het veld; ClubComm telt en rekent zelf.'],
      ['Signalen', 'Speler vaak afwezig of te laat? ClubComm zegt wanneer bellen verstandig is, met bel- en appknop.'],
      ['Ontwikkeling', 'Twee beoordelingsmomenten met een ontwikkelgesprek (ouder én kind erbij).'],
    ]],
    ['teamleider.png', 'Voor teamleiders', 'Regelen zonder rondbellen', [
      ['Wedstrijddag', 'Vervoer en taken per wedstrijd in één overzicht; open plekken en taken vallen op.'],
      ['Eerlijk verdelen', 'Zie welke gezinnen meehelpen en wie je persoonlijk kunt vragen.'],
      ['Nieuwe ouders', 'Aanmelden via QR-code; de teamleider keurt goed.'],
    ]],
    ['hjo.png', 'Voor coördinator en HJO', 'Overzicht zonder waslijst', [
      ['Te doen en ter informatie', 'Alleen wat bij jou ligt staat bij Te doen; de rest lees je en tik je weg.'],
      ['Eerst de coördinator', 'Spelerzaken lopen via trainer en coördinator. De HJO ziet ze als ze blijven liggen of ernstig zijn.'],
      ['Inzicht', 'Aanwezigheid per team en groep, redenen, trainers opvolgen en bedanken.'],
    ]],
  ];
  for (const [file, t, sub, punten] of rollen) {
    const s = pres.addSlide(); s.background = { color: WHITE };
    phone(s, file, W - M - 2.35, 0.45, 4.7);
    s.addText(t, { x: M, y: 0.45, w: 5.8, h: 0.6, fontFace: HEAD, fontSize: 28, bold: true, color: NAVY, margin: 0, isTextBox: true });
    s.addText(sub, { x: M, y: 1.05, w: 5.8, h: 0.4, fontFace: BODY, fontSize: 15, color: BLUE, margin: 0, isTextBox: true });
    punten.forEach(([k, d], i) => {
      const y = 1.75 + i * 1.12;
      s.addShape(pres.shapes.OVAL, { x: M, y: y + 0.04, w: 0.32, h: 0.32, fill: { color: TINT }, line: { color: TINT } });
      s.addText(String(i + 1), { x: M, y: y + 0.04, w: 0.32, h: 0.32, fontFace: HEAD, fontSize: 12, bold: true, color: BLUE, align: 'center', valign: 'middle', margin: 0, isTextBox: true });
      s.addText(k, { x: M + 0.5, y, w: 5.3, h: 0.38, fontFace: HEAD, fontSize: 15, bold: true, color: NAVY, valign: 'middle', margin: 0, isTextBox: true });
      s.addText(d, { x: M + 0.5, y: y + 0.38, w: 5.3, h: 0.65, fontFace: BODY, fontSize: 12, color: INK, valign: 'top', margin: 0, isTextBox: true });
    });
    footer(s, n++);
  }

  // 8. Opschaling
  {
    const s = pres.addSlide(); s.background = { color: WHITE };
    title(s, 'Van herinnering tot gesprek', 'Per fase van de competitie begint de teller opnieuw. Mensen beslissen elke stap.');
    const stappen = [['Herinneren', 'Eerste keer: een vriendelijke herinnering, geen punten', BLUE], ['Kaart', 'Te laat afgemeld: geel. Te laat gekomen: oranje', 'EAB308'], ['Bellen of appen', 'Bij de drempel: trainer of coördinator belt de ouder', ORANGE], ['Gesprek', 'Gaat het door: persoonlijk gesprek met ouders', RED], ['Clubbesluit', 'Alleen als het echt niet anders kan, met het bestuur', NAVY]];
    const bw = (W - 2 * M - 0.15 * 4) / 5;
    stappen.forEach(([t, d, c], i) => {
      const x = M + i * (bw + 0.15), y = 1.75;
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w: bw, h: 0.75, fill: { color: c }, line: { color: c }, rectRadius: 0.08 });
      s.addText(`${i + 1}. ${t}`, { x, y, w: bw, h: 0.75, fontFace: HEAD, fontSize: 14, bold: true, color: WHITE, align: 'center', valign: 'middle', margin: 0, isTextBox: true });
      s.addText(d, { x: x + 0.05, y: y + 0.9, w: bw - 0.1, h: 1.1, fontFace: BODY, fontSize: 11.5, color: INK, align: 'center', valign: 'top', margin: 0, isTextBox: true });
    });
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: M, y: 4.0, w: W - 2 * M, h: 0.85, fill: { color: GREY }, line: { color: GREY }, rectRadius: 0.08 });
    s.addText('Drempels (afmeldtermijn, aantal kaarten, zones) stelt de club zelf in. ClubComm legt vast wie wanneer contact had, zodat het niet afhangt van één persoon.', { x: M + 0.3, y: 4.0, w: W - 2 * M - 0.6, h: 0.85, fontFace: BODY, fontSize: 12.5, color: INK, valign: 'middle', margin: 0, isTextBox: true });
    footer(s, n++);
  }

  // 9. De club bepaalt
  {
    const s = pres.addSlide(); s.background = { color: WHITE };
    title(s, 'De club bepaalt hoe het werkt', 'Geen vaste werkwijze: ClubComm past zich aan de club aan');
    const items = [
      ['FaListCheck', 'Taken per rol', 'Het bestuur bepaalt wie wat doet: bellen, gesprekken, trainers begeleiden. De clubbeheerder vinkt het aan; altijd aan te passen.'],
      ['FaUsers', 'Coördinatoren', 'Optioneel een laag tussen trainer en HJO, per groep teams (bijv. O6–O9, O10–O12).'],
      ['FaLock', 'Wie ziet wat', 'Ouders zien alleen hun eigen kind. De teamleider (vaak ook ouder) ziet geen beoordelingen of gespreksnotities.'],
      ['FaHeart', 'Waardering', 'Trainers en teamleiders krijgen erkenning bij mijlpalen; de HJO kan ze met één tik bedanken.'],
    ];
    const cw = (W - 2 * M - 0.35) / 2;
    for (let i = 0; i < 4; i++) {
      const [ic, t, d] = items[i]; const x = M + (i % 2) * (cw + 0.35), y = 1.6 + Math.floor(i / 2) * 1.6;
      await iconCircle(s, ic, x, y, 0.55, TINT, BLUE);
      s.addText(t, { x: x + 0.75, y, w: cw - 0.75, h: 0.4, fontFace: HEAD, fontSize: 15, bold: true, color: NAVY, margin: 0, isTextBox: true });
      s.addText(d, { x: x + 0.75, y: y + 0.42, w: cw - 0.75, h: 1.0, fontFace: BODY, fontSize: 12, color: INK, valign: 'top', margin: 0, isTextBox: true });
    }
    footer(s, n++);
  }

  // 10. Voorstel pilot
  {
    const s = pres.addSlide(); s.background = { color: WHITE };
    title(s, 'Voorstel: klein beginnen', 'Een pilot in de onderbouw, met enthousiaste trainers en teamleiders');
    const tegels = [['3–4', 'teams', 'bijv. O8, 2× O10, O12'], ['1 fase', '8–10 weken', 'fase 3: vanaf 20 januari 2027'], ['1', 'aanspreekpunt', 'voor vragen van ouders en staf']];
    const tw = (W - 2 * M - 0.35 * 2) / 3;
    tegels.forEach(([g, l, d], i) => {
      const x = M + i * (tw + 0.35), y = 1.6;
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w: tw, h: 1.9, fill: { color: TINT }, line: { color: TINT }, rectRadius: 0.1 });
      s.addText(g, { x, y: y + 0.2, w: tw, h: 0.85, fontFace: HEAD, fontSize: 44, bold: true, color: BLUE, align: 'center', margin: 0, isTextBox: true });
      s.addText(l, { x, y: y + 1.05, w: tw, h: 0.35, fontFace: HEAD, fontSize: 15, bold: true, color: NAVY, align: 'center', margin: 0, isTextBox: true });
      s.addText(d, { x, y: y + 1.4, w: tw, h: 0.35, fontFace: BODY, fontSize: 11.5, color: MUTED, align: 'center', margin: 0, isTextBox: true });
    });
    s.addText([
      { text: 'Start: ', options: { bold: true, color: NAVY } }, { text: 'ouders melden zich aan via een QR-code bij de training; per rol is er een korte handleiding.', options: { breakLine: true } },
      { text: 'WhatsApp: ', options: { bold: true, color: NAVY } }, { text: 'afmelden gaat alleen nog via ClubComm; de teamgroep blijft voor de gezelligheid.', options: { breakLine: true } },
      { text: 'Evaluatie: ', options: { bold: true, color: NAVY } }, { text: 'halverwege en aan het einde, met ouders, trainers en teamleiders.' },
    ], { x: M, y: 3.75, w: W - 2 * M, h: 1.2, fontFace: BODY, fontSize: 12.5, color: INK, valign: 'top', margin: 0, paraSpaceAfter: 4, isTextBox: true });
    footer(s, n++);
  }

  // 11. Wanneer geslaagd
  {
    const s = pres.addSlide(); s.background = { color: WHITE };
    title(s, 'Wanneer is de pilot geslaagd?', 'Voorstel, samen vast te stellen voor de start');
    const doelen = [['90%', 'van de spelers heeft een gekoppelde ouder'], ['80%', 'van de afmeldingen gaat via ClubComm'], ['90%', 'van de trainingen heeft aanwezigheid opgenomen'], ['75%', 'van de berichten is binnen 24 uur gelezen']];
    const tw = (W - 2 * M - 0.3 * 3) / 4;
    doelen.forEach(([g, d], i) => {
      const x = M + i * (tw + 0.3), y = 1.6;
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w: tw, h: 1.75, fill: { color: GREY }, line: { color: GREY }, rectRadius: 0.1 });
      s.addText(g, { x, y: y + 0.15, w: tw, h: 0.8, fontFace: HEAD, fontSize: 36, bold: true, color: GREEN, align: 'center', margin: 0, isTextBox: true });
      s.addText(d, { x: x + 0.15, y: y + 0.95, w: tw - 0.3, h: 0.7, fontFace: BODY, fontSize: 11.5, color: INK, align: 'center', valign: 'top', margin: 0, isTextBox: true });
    });
    s.addText([
      { text: 'En minstens zo belangrijk:', options: { bold: true, color: NAVY, breakLine: true } },
      { text: '"Niet afgemeld en niet gekomen" daalt', options: { bullet: true, breakLine: true } },
      { text: 'Minder open taken op wedstrijddagen', options: { bullet: true, breakLine: true } },
      { text: 'Trainers en teamleiders zeggen: het scheelt me tijd', options: { bullet: true } },
    ], { x: M, y: 3.6, w: W - 2 * M, h: 1.35, fontFace: BODY, fontSize: 12.5, color: INK, valign: 'top', margin: 0, paraSpaceAfter: 3, isTextBox: true });
    footer(s, n++);
  }

  // 12. Wat is nog nodig
  {
    const s = pres.addSlide(); s.background = { color: WHITE };
    title(s, 'Wat is er nog nodig?', 'De demo laat zien hoe het werkt; voor echte gebruikers is dit nodig');
    const cw = (W - 2 * M - 0.4) / 2;
    const blok = async (x, ic, t, regels, kleur) => {
      await iconCircle(s, ic, x, 1.55, 0.5, kleur, WHITE);
      s.addText(t, { x: x + 0.65, y: 1.55, w: cw - 0.65, h: 0.5, fontFace: HEAD, fontSize: 16, bold: true, color: NAVY, valign: 'middle', margin: 0, isTextBox: true });
      s.addText(regels.map((r, i) => ({ text: r, options: { bullet: true, breakLine: i < regels.length - 1 } })), { x, y: 2.2, w: cw, h: 2.6, fontFace: BODY, fontSize: 12, color: INK, valign: 'top', margin: 0, paraSpaceAfter: 5, isTextBox: true });
    };
    await blok(M, 'FaGears', 'Techniek (± 4–6 weken bouwen)', ['Echte database en inloggen met een code per e-mail', 'Rechten afgedwongen door de server, niet alleen door het scherm', 'Meldingen (push en e-mail), bijv. bij afgelasting', 'Online op een eigen adres, te installeren op de telefoon', 'Teams, staf en speelschema van de pilotteams invoeren'], BLUE);
    await blok(M + cw + 0.4, 'FaShieldHalved', 'Privacy (AVG): vóór de start', ['Privacyverklaring voor ouders, toestemming bij aanmelden', 'Verwerkersovereenkomst; opslag in de EU', 'Bewaartermijnen: wat gebeurt er na het seizoen of bij stoppen', 'Geen medische gegevens; alleen "ziek" of "blessure"', 'Afstemmen met de privacyverantwoordelijke van de club'], GREEN);
    footer(s, n++);
  }

  // 13. Wat vragen we + planning
  {
    const s = pres.addSlide(); s.background = { color: WHITE };
    title(s, 'Wat vragen we van het bestuur?');
    const vragen = ['Akkoord op een pilot met 3–4 onderbouwteams in fase 3', 'De taakverdeling: welke rol doet wat (trainer, teamleider, coördinator, HJO)', 'Afspraken over privacy en een contactpersoon daarvoor', 'Welke teams meedoen, en één aanspreekpunt bij de club'];
    vragen.forEach((v, i) => {
      const y = 1.2 + i * 0.62;
      s.addShape(pres.shapes.OVAL, { x: M, y, w: 0.4, h: 0.4, fill: { color: BLUE }, line: { color: BLUE } });
      s.addText(String(i + 1), { x: M, y, w: 0.4, h: 0.4, fontFace: HEAD, fontSize: 14, bold: true, color: WHITE, align: 'center', valign: 'middle', margin: 0, isTextBox: true });
      s.addText(v, { x: M + 0.6, y, w: 8.4, h: 0.4, fontFace: BODY, fontSize: 14, color: INK, valign: 'middle', margin: 0, isTextBox: true });
    });
    // tijdlijn
    const stappen = [['Nu', 'demo bekijken, feedback'], ['Oktober', 'akkoord, taakverdeling, privacy'], ['Nov – dec', 'echte versie bouwen'], ['20 januari', 'start pilot (fase 3)'], ['April', 'evaluatie en besluit']];
    const y = 4.0, x0 = M, x1 = W - M; const stap = (x1 - x0) / (stappen.length - 1);
    s.addShape(pres.shapes.LINE, { x: x0, y: y + 0.12, w: x1 - x0, h: 0, line: { color: 'C9D6E6', width: 2 } });
    stappen.forEach(([t, d], i) => {
      const x = x0 + i * stap;
      s.addShape(pres.shapes.OVAL, { x: x - 0.12, y, w: 0.24, h: 0.24, fill: { color: i === 3 ? GREEN : BLUE }, line: { color: WHITE, width: 2 } });
      const tw = 1.7; const tx = Math.min(Math.max(x - tw / 2, M), W - M - tw); const al = i === 0 ? 'left' : i === stappen.length - 1 ? 'right' : 'center';
      s.addText(t, { x: tx, y: y + 0.32, w: tw, h: 0.3, fontFace: HEAD, fontSize: 12.5, bold: true, color: NAVY, align: al, margin: 0, isTextBox: true });
      s.addText(d, { x: tx, y: y + 0.6, w: tw, h: 0.45, fontFace: BODY, fontSize: 10.5, color: MUTED, align: al, valign: 'top', margin: 0, isTextBox: true });
    });
    footer(s, n++);
  }

  // 14. Afsluiting
  {
    const s = pres.addSlide(); s.background = { color: NAVY };
    s.addImage({ path: LOGO, x: M, y: 0.6, w: 0.8, h: 0.8 });
    s.addText('Probeer het zelf', { x: M, y: 1.7, w: 9, h: 0.7, fontFace: HEAD, fontSize: 36, bold: true, color: WHITE, margin: 0, isTextBox: true });
    s.addText('In de demo kun je inloggen als ouder, trainer, teamleider, coördinator of HJO. Alles is voorbeelddata; er staan geen echte gegevens in.', { x: M, y: 2.5, w: 8.5, h: 0.8, fontFace: BODY, fontSize: 16, color: 'CFE6FD', margin: 0, isTextBox: true });
    s.addText('De link naar de demo ontvang je via de pilotcoördinator.', { x: M, y: 3.5, w: 8.5, h: 0.4, fontFace: BODY, fontSize: 14, color: '8FA6C1', margin: 0, isTextBox: true });
    s.addText('Vragen? Graag!', { x: M, y: 4.5, w: 8, h: 0.45, fontFace: HEAD, fontSize: 20, bold: true, color: WHITE, margin: 0, isTextBox: true });
  }

  await pres.writeFile({ fileName: OUT });
  console.log('Klaar:', OUT);
})();
