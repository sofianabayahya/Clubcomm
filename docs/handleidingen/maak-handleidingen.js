// Maakt de vier handleidingen (Ouder, Trainer, Teamleider, HJO) als A4-PowerPoint.
// Inhoud volgt docs/besluiten.md. Opnieuw maken na een wijziging:
//   npm install pptxgenjs react-icons react react-dom sharp
//   node docs/handleidingen/maak-handleidingen.js
const path = require('path');
const pptxgen = require('pptxgenjs');
const React = require('react');
const ReactDOMServer = require('react-dom/server');
const sharp = require('sharp');
const fa = require('react-icons/fa6');

const OUT = __dirname;
const LOGO = path.join(__dirname, '..', '..', 'public', 'assets', 'clubcomm-icon.png');

// Kleuren: logo-blauw als hoofdkleur, verder rustig
const BLUE = '0D88F9';
const NAVY = '0B2545';
const TINT = 'EAF4FE';
const NOTE = 'F2F5F9';
const MUTED = '5B6B7F';
const FONT = 'Calibri';

// A4 staand
const W = 8.27, H = 11.69, M = 0.6;

async function icon(name, color) {
  const svg = ReactDOMServer.renderToStaticMarkup(React.createElement(fa[name], { color: '#' + color, size: 256 }));
  const png = await sharp(Buffer.from(svg)).resize(256, 256).png().toBuffer();
  return 'image/png;base64,' + png.toString('base64');
}

const roles = [
  {
    file: 'ClubComm-handleiding-ouders.pptx',
    sub: 'voor ouders',
    intro: 'Met ClubComm meld je je kind af, zie je de planning en blijf je op de hoogte van het team. Gewoon op je telefoon, zonder wachtwoord.',
    hero: {
      icon: 'FaCalendarXmark',
      title: 'Het belangrijkste: afmelden',
      lines: [
        'Je kind wordt bij elke training en wedstrijd verwacht, tenzij je afmeldt.',
        'Open de app, tik bij de activiteit op Afmelden en kies een reden. Klaar.',
        'Meld zo vroeg mogelijk af. Bij elke activiteit zie je tot wanneer het op tijd is.',
      ],
    },
    cards: [
      { icon: 'FaUserPlus', title: 'Aanmelden', text: 'Scan de QR-code of open de link van je teamleider. Vul je e-mailadres en de naam van je kind in. Na goedkeuring door de teamleider kun je beginnen.' },
      { icon: 'FaKey', title: 'Inloggen zonder wachtwoord', text: 'Vul je e-mailadres in en tik op de link in de mail, of typ de code van 6 cijfers over. Daarna blijf je ingelogd. Tip: zet ClubComm op je beginscherm.' },
      { icon: 'FaTriangleExclamation', title: 'Kaarten', text: 'Te laat of niet afgemeld? De eerste keer krijg je een vriendelijke herinnering, daarna een gele kaart. Komt je kind te laat op de training, dan volgt een oranje kaart.' },
      { icon: 'FaBandage', title: 'Langer geblesseerd of ziek?', text: 'Meld het één keer, met de verwachte terugkeerdatum. Dan hoef je niet elke training apart af te melden, en weten trainer en teamleider ervan.' },
      { icon: 'FaCarSide', title: 'Vervoer en taken', text: 'Bied bij uitwedstrijden plekken in je auto aan of vraag een plek. Help mee als spelbegeleider, coach of bij de bar: aanmelden met één tik.' },
      { icon: 'FaComments', title: 'Berichten', text: 'Persoonlijke berichten van trainer en teamleider, en nieuws van team en club. Zet meldingen aan, dan mis je niets.' },
    ],
    note: { icon: 'FaLock', text: 'Je ziet alleen de gegevens van je eigen kind. Andere ouders zien de gegevens van jouw kind niet.' },
    ask: 'Vragen? Stel ze aan de teamleider van je team.',
  },
  {
    file: 'ClubComm-handleiding-trainers.pptx',
    sub: 'voor trainers',
    intro: 'ClubComm neemt het regelwerk rond je team over. Jij ziet wie er komt, houdt de aanwezigheid bij en communiceert met ouders.',
    hero: {
      icon: 'FaClipboardCheck',
      title: 'Het belangrijkste: aanwezigheid opnemen',
      lines: [
        'Op de trainingsdag staat op Home de knop Aanwezigheid opnemen.',
        'Iedereen staat op aanwezig. Tik op een naam om te wisselen en tik op Opslaan.',
        'Kaarten en percentages volgen vanzelf. Vergist? Corrigeren kan tot 48 uur later.',
      ],
    },
    cards: [
      { icon: 'FaHouse', title: 'Home', text: 'Je eerstvolgende training, hoeveel spelers je verwacht en wie zich heeft afgemeld, met de reden erbij.' },
      { icon: 'FaCalendarDays', title: 'Planning aanpassen', text: 'Training verplaatsen, extra training of oefenwedstrijd? Dat mag je zelf doen. Ouders krijgen direct bericht, HJO en teamleider een melding.' },
      { icon: 'FaComments', title: 'Berichten', text: 'Tik op + Nieuw bericht en kies: groep, individueel, trainingswijziging of herinnering. Je ziet wie het gelezen heeft.' },
      { icon: 'FaStar', title: 'Spelers beoordelen', text: 'Per seizoensfase, passend bij de leeftijd. Snel: beoordeel één vaardigheid voor het hele team tegelijk. Ouders zien alleen hun eigen kind.' },
      { icon: 'FaTriangleExclamation', title: 'Signalen', text: 'Komt een speler in de oranje of rode zone, of vaak te laat? Dan krijg je een signaal. Jij en de teamleider beslissen of een gesprek nodig is.' },
      { icon: 'FaStopwatch', title: 'Wedstrijden en speeltijd', text: 'Ga je niet mee naar wedstrijden? Dan doet de teamleider of een ouder-coach de aanwezigheid. Met de module Speeltijd maakt de app een eerlijk wisselschema.' },
    ],
    note: { icon: 'FaUserPlus', text: 'Geen teamleider in je team? Dan nodig jij ouders uit en keur je aanmeldingen goed, via Ouders uitnodigen.' },
    ask: 'Vragen? Neem contact op met de HJO.',
  },
  {
    file: 'ClubComm-handleiding-teamleiders.pptx',
    sub: 'voor teamleiders',
    intro: 'Jij bent de regelaar van het team: genoeg spelers, vervoer, taken en begeleiding bij wedstrijden. ClubComm geeft je één overzicht.',
    hero: {
      icon: 'FaHouse',
      title: 'Het belangrijkste: Home in één oogopslag',
      lines: [
        'Voor de eerstvolgende wedstrijd zie je: spelers (bijv. 10 van 12), vervoer, taken en wie de begeleider is.',
        'Ontbreekt er iets, dan kleurt de regel oranje. Tik erop en je komt direct op de juiste plek.',
      ],
    },
    cards: [
      { icon: 'FaQrcode', title: 'Ouders uitnodigen', text: 'Via Team: Delen (WhatsApp, mail), QR tonen (langs de lijn) of QR printen (kantine). De uitnodiging verloopt na 14 dagen en is te vernieuwen.' },
      { icon: 'FaUserCheck', title: 'Aanmeldingen goedkeuren', text: 'Een ouder meldt zich aan met de naam van het kind, jij tikt op Goedkeuren. Graag binnen 48 uur; daarna gaat de melding door naar trainer en HJO.' },
      { icon: 'FaCarSide', title: 'Regelen: vervoer en taken', text: 'Zie welke kinderen nog geen vervoer hebben en welke taken openstaan. Oproepen aan ouders gaan automatisch; jij hoeft niet te herinneren.' },
      { icon: 'FaFutbol', title: 'Wedstrijd', text: 'Vul verzameltijd, adres en tenue aan. Wijs de wedstrijdbegeleider aan: jij, de trainer of een ouder-coach. Na afloop vul je de uitslag in.' },
      { icon: 'FaWhatsapp', title: 'WhatsApp', text: 'ClubComm is de bron, WhatsApp de megafoon. Met Delen plak je een net bericht met link in de teamgroep. Met WhatsApp ouder open je direct een chat.' },
      { icon: 'FaTriangleExclamation', title: 'Signalen en gesprekken', text: 'Bereikt een speler de kaartendrempel of de rode zone, dan krijg je een signaal. Samen met de trainer beslis je over een gesprek.' },
    ],
    note: { icon: 'FaStopwatch', text: 'Speeltijd (als de module aan staat): de app maakt een eerlijk wisselschema. Tijdens de wedstrijd tik je op Volgend blok.' },
    ask: 'Vragen? Neem contact op met de HJO.',
  },
  {
    file: 'ClubComm-handleiding-HJO.pptx',
    sub: 'voor de HJO',
    intro: 'Als HJO bewaak en stuur je de jeugd. Teamleiders en trainers doen het dagelijkse werk; jij ziet de signalen en maakt de clubbrede keuzes.',
    hero: {
      icon: 'FaBell',
      title: 'Het belangrijkste: Aandacht nodig',
      lines: [
        'Home toont alleen wat jouw aandacht vraagt: teams of spelers in de rode zone, voorgestelde gesprekken, teams zonder staf en aanmeldingen die blijven liggen.',
        'Twee snelle acties: Bericht aan club en Afgelasten. Alle betrokken teams krijgen direct een pushmelding.',
      ],
    },
    cards: [
      { icon: 'FaCalendarDays', title: 'Begin van het seizoen', text: 'Voer één keer het weekrooster en de veldindeling in, voor meerdere teams tegelijk of via Excel. Schoolvakanties komen er vanzelf in; jij kiest of er getraind wordt.' },
      { icon: 'FaUsers', title: 'Teams', text: 'Per team: staf toewijzen, spelers, rooster, teamtype (breedte of selectie) en statistieken. Via Alle spelers: zoeken, van team wisselen, handmatig toevoegen.' },
      { icon: 'FaUserGear', title: 'Rollen', text: 'Koppel rollen aan een bestaand account, bijvoorbeeld ouder én trainer. Eén persoon, één account, met een rolwisselaar.' },
      { icon: 'FaChartLine', title: 'Inzicht', text: 'Waar gaat het mis, waarom, en hoe ontwikkelt het zich? Van club naar team naar speler. Exporteer naar PDF voor een gesprek of het bestuur.' },
      { icon: 'FaBullhorn', title: 'Clubberichten', text: 'Berichten aan de hele club of aan groepen teams. Plan berichten vooruit, bijvoorbeeld het aftellen naar de zomervakantie.' },
      { icon: 'FaScaleBalanced', title: 'Mensen beslissen', text: 'ClubComm signaleert, communiceert en legt vast. Gesprekken en gevolgen zijn altijd een beslissing van mensen, nooit automatisch.' },
    ],
    note: { icon: 'FaGear', text: 'Clubinstellingen (deadlines, drempels, blokken, modules) regelt de clubbeheerder. Bij een kleine club is dat vaak ook de HJO.' },
    ask: 'Vragen over ClubComm? Mail support@clubcomm.nl.',
  },
];

async function build(role) {
  const pres = new pptxgen();
  pres.defineLayout({ name: 'A4P', width: W, height: H });
  pres.layout = 'A4P';
  pres.title = `Zo werkt ClubComm ${role.sub}`;
  pres.company = 'SC Buitenveldert';
  const s = pres.addSlide();
  s.background = { color: 'FFFFFF' };

  // Kop: app-icoon + titel
  s.addImage({ path: LOGO, x: M, y: 0.55, w: 0.8, h: 0.8 });
  s.addText('Zo werkt ClubComm', { x: M + 1.0, y: 0.5, w: 5.2, h: 0.5, fontFace: FONT, fontSize: 28, bold: true, color: NAVY, margin: 0, isTextBox: true });
  s.addText(role.sub, { x: M + 1.0, y: 1.0, w: 5.2, h: 0.38, fontFace: FONT, fontSize: 18, color: BLUE, margin: 0, isTextBox: true });
  s.addText('SC Buitenveldert\nPilot 2026/2027', { x: W - M - 1.8, y: 0.62, w: 1.8, h: 0.5, fontFace: FONT, fontSize: 10, color: MUTED, align: 'right', margin: 0, isTextBox: true });

  s.addText(role.intro, { x: M, y: 1.55, w: W - 2 * M, h: 0.5, fontFace: FONT, fontSize: 12, color: NAVY, margin: 0, valign: 'top', isTextBox: true });

  // Het belangrijkste: blauw vlak
  const hy = 2.15, hh = 1.8;
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: M, y: hy, w: W - 2 * M, h: hh, fill: { color: BLUE }, line: { color: BLUE }, rectRadius: 0.15 });
  s.addImage({ data: await icon(role.hero.icon, 'FFFFFF'), x: M + 0.3, y: hy + 0.28, w: 0.42, h: 0.42 });
  s.addText(role.hero.title, { x: M + 0.9, y: hy + 0.24, w: W - 2 * M - 1.2, h: 0.5, fontFace: FONT, fontSize: 17, bold: true, color: 'FFFFFF', margin: 0, valign: 'middle', isTextBox: true });
  s.addText(role.hero.lines.map((t, i) => ({ text: t, options: { bullet: { indent: 12 }, breakLine: i < role.hero.lines.length - 1 } })), {
    x: M + 0.9, y: hy + 0.78, w: W - 2 * M - 1.2, h: hh - 0.92, fontFace: FONT, fontSize: 11.5, color: 'FFFFFF', margin: 0, valign: 'top', paraSpaceAfter: 4, isTextBox: true,
  });

  // Kaarten: 2 kolommen x 3 rijen
  const gx = 0.3, gy = 0.2, cw = (W - 2 * M - gx) / 2, ch = 1.75, top = hy + hh + 0.3;
  for (let i = 0; i < role.cards.length; i++) {
    const c = role.cards[i];
    const x = M + (i % 2) * (cw + gx), y = top + Math.floor(i / 2) * (ch + gy);
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w: cw, h: ch, fill: { color: TINT }, line: { color: TINT }, rectRadius: 0.12 });
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: x + 0.22, y: y + 0.22, w: 0.5, h: 0.5, fill: { color: BLUE }, line: { color: BLUE }, rectRadius: 0.1 });
    s.addImage({ data: await icon(c.icon, 'FFFFFF'), x: x + 0.34, y: y + 0.34, w: 0.26, h: 0.26 });
    s.addText(c.title, { x: x + 0.86, y: y + 0.22, w: cw - 1.02, h: 0.5, fontFace: FONT, fontSize: 13, bold: true, color: NAVY, margin: 0, valign: 'middle', isTextBox: true });
    s.addText(c.text, { x: x + 0.22, y: y + 0.82, w: cw - 0.44, h: ch - 0.92, fontFace: FONT, fontSize: 11, color: NAVY, margin: 0, valign: 'top', isTextBox: true });
  }

  // Goed om te weten
  const ny = top + 3 * ch + 2 * gy + 0.2;
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: M, y: ny, w: W - 2 * M, h: 0.55, fill: { color: NOTE }, line: { color: NOTE }, rectRadius: 0.1 });
  s.addImage({ data: await icon(role.note.icon, BLUE), x: M + 0.22, y: ny + 0.14, w: 0.27, h: 0.27 });
  s.addText(role.note.text, { x: M + 0.65, y: ny, w: W - 2 * M - 0.85, h: 0.55, fontFace: FONT, fontSize: 10.5, color: NAVY, margin: 0, valign: 'middle', isTextBox: true });

  // Voet
  s.addText(role.ask, { x: M, y: ny + 0.75, w: W - 2 * M, h: 0.3, fontFace: FONT, fontSize: 10, color: MUTED, margin: 0, isTextBox: true });

  await pres.writeFile({ fileName: path.join(OUT, role.file) });
  console.log('gemaakt:', role.file);
}

(async () => { for (const r of roles) await build(r); })();
