// ClubComm — maakt de vier PowerPoints (bestuur, teamleider, ouders, trainer).
// Elk bestand is tegelijk handleiding (doorsturen) en presentatie (voor een bijeenkomst).
// Teksten kun je daarna gewoon in PowerPoint aanpassen; dit script is alleen om ze opnieuw te maken
// als de app verandert. Schermafbeeldingen: shots*.js (demo op http://localhost:5070), bijgesneden in beelden/.
//   npm install pptxgenjs react-icons react react-dom sharp
//   node docs/presentaties/maak.js
const path = require('path');
const pptxgen = require('pptxgenjs');
const React = require('react');
const ReactDOMServer = require('react-dom/server');
const sharp = require('sharp');
const fa = require('react-icons/fa6');

const OUT = __dirname;
const BEELD = (n) => path.join(__dirname, 'beelden', n + '.jpg');
const LOGO = path.join(__dirname, '..', '..', 'public', 'assets', 'clubcomm-icon.png');

// Kleuren: donkerblauw als basis, het blauw van de app als accent, oranje alleen voor aandacht
const NAVY = '0B2545', BLUE = '0D88F9', TINT = 'EAF4FE', INK = '1F2937', MUTED = '5B6B7F', ORANGE = 'D97706', WHITE = 'FFFFFF', SOFT = 'F5F7FA';
const FONT = 'Calibri';
const W = 13.333, H = 7.5;
const CLUB = 'RKSV DCG';

const iconCache = {};
async function icon(name, color) {
  const k = name + color; if (iconCache[k]) return iconCache[k];
  const svg = ReactDOMServer.renderToStaticMarkup(React.createElement(fa[name], { color: '#' + color, size: 256 }));
  const png = await sharp(Buffer.from(svg)).resize(256, 256).png().toBuffer();
  return (iconCache[k] = 'image/png;base64,' + png.toString('base64'));
}

function nieuw(titel) {
  const pres = new pptxgen(); pres.layout = 'LAYOUT_WIDE'; pres.title = titel; pres.company = 'ClubComm';
  pres.theme = { headFontFace: FONT, bodyFontFace: FONT };
  return pres;
}
const voet = (s, tekst) => s.addText(tekst, { x: 0.7, y: H - 0.45, w: 7, h: 0.3, fontSize: 10, color: MUTED, fontFace: FONT, margin: 0, isTextBox: true });

// Telefoon met schermafbeelding (rechts)
function telefoon(s, beeld, x = 9.05, y = 0.45, rand = NAVY) {
  s.addShape('roundRect', { x, y, w: 3.42, h: 6.6, rectRadius: 0.35, fill: { color: rand }, shadow: { type: 'outer', color: '000000', opacity: 0.18, blur: 12, offset: 3, angle: 90 } });
  s.addImage({ path: BEELD(beeld), x: x + 0.12, y: y + 0.12, w: 3.18, h: 6.36 });
}

// Kop links: klein label, titel, inleiding
function kop(s, { label, titel, intro }, w = 7.7) {
  if (label) s.addText(label.toUpperCase(), { x: 0.7, y: 0.55, w, h: 0.35, fontSize: 13, bold: true, color: BLUE, charSpacing: 1, fontFace: FONT, margin: 0, isTextBox: true });
  // één regel titel bij ± 0,19" per teken (34pt); anders kleiner zodat hij op één regel past
  const past = Math.floor(w / 0.2); const grootte = titel.length <= past ? 34 : Math.max(26, Math.floor(34 * past / titel.length));
  s.addText(titel, { x: 0.7, y: 0.9, w, h: 0.85, fontSize: grootte, bold: true, color: NAVY, fontFace: FONT, margin: 0, valign: 'top', fit: 'shrink', isTextBox: true });
  if (intro) s.addText(intro, { x: 0.7, y: 1.85, w, h: 0.75, fontSize: 16, color: MUTED, fontFace: FONT, margin: 0, valign: 'top', isTextBox: true });
}

// Stap-voor-stap dia met telefoon
async function stappen(pres, voetTekst, { label, titel, intro, stappen: st, beeld, tip }) {
  const s = pres.addSlide(); s.background = { color: WHITE };
  kop(s, { label, titel, intro });
  let y = intro ? 2.75 : 2.05; const hStap = tip ? Math.min(0.95, (6.0 - y) / st.length) : Math.min(1.0, (6.75 - y) / st.length);
  st.forEach(([vet, tekst], i) => {
    s.addShape('ellipse', { x: 0.7, y: y + 0.02, w: 0.46, h: 0.46, fill: { color: BLUE } });
    s.addText(String(i + 1), { x: 0.7, y: y + 0.02, w: 0.46, h: 0.46, fontSize: 16, bold: true, color: WHITE, align: 'center', valign: 'middle', fontFace: FONT, margin: 0, isTextBox: true });
    s.addText([{ text: vet, options: { bold: true, color: INK, breakLine: !!tekst } }, ...(tekst ? [{ text: tekst, options: { color: MUTED } }] : [])],
      { x: 1.4, y, w: 7.0, h: hStap - 0.08, fontSize: 17, fontFace: FONT, margin: 0, valign: 'top', isTextBox: true });
    y += hStap;
  });
  if (tip) {
    s.addShape('roundRect', { x: 0.7, y: 6.05, w: 7.7, h: 0.85, rectRadius: 0.12, fill: { color: TINT } });
    s.addImage({ data: await icon('FaLightbulb', BLUE), x: 0.9, y: 6.29, w: 0.36, h: 0.36 });
    s.addText(tip, { x: 1.45, y: 6.1, w: 6.8, h: 0.75, fontSize: 13, color: NAVY, fontFace: FONT, margin: 0, valign: 'middle', isTextBox: true });
  }
  if (beeld) telefoon(s, beeld);
  voet(s, voetTekst);
  return s;
}

// Kaarten met icoon (2 of 3 kolommen)
async function kaarten(pres, voetTekst, { label, titel, intro, items, kol = 2, noot }) {
  const s = pres.addSlide(); s.background = { color: WHITE };
  kop(s, { label, titel, intro }, 11.9);
  const top = intro ? 2.8 : 2.1; const gap = 0.3; const cw = (11.93 - gap * (kol - 1)) / kol;
  const rijen = Math.ceil(items.length / kol); const beschikbaar = (noot ? 6.0 : 6.85) - top; const ch = Math.min(1.7, (beschikbaar - gap * (rijen - 1)) / rijen);
  for (let i = 0; i < items.length; i++) {
    const [ic, kopje, tekst, kleur] = items[i]; const x = 0.7 + (i % kol) * (cw + gap); const y = top + Math.floor(i / kol) * (ch + gap);
    s.addShape('roundRect', { x, y, w: cw, h: ch, rectRadius: 0.12, fill: { color: SOFT } });
    s.addShape('ellipse', { x: x + 0.25, y: y + 0.25, w: 0.62, h: 0.62, fill: { color: kleur || BLUE } });
    s.addImage({ data: await icon(ic, WHITE), x: x + 0.41, y: y + 0.41, w: 0.3, h: 0.3 });
    s.addText([{ text: kopje, options: { bold: true, color: NAVY, fontSize: 17, breakLine: true } }, { text: tekst, options: { color: MUTED, fontSize: 15 } }],
      { x: x + 1.05, y: y + 0.2, w: cw - 1.25, h: ch - 0.35, fontFace: FONT, margin: 0, valign: 'top', isTextBox: true });
  }
  if (noot) {
    s.addShape('roundRect', { x: 0.7, y: 6.15, w: 11.93, h: 0.75, rectRadius: 0.12, fill: { color: TINT } });
    s.addText(noot, { x: 0.95, y: 6.15, w: 11.5, h: 0.75, fontSize: 14, color: NAVY, fontFace: FONT, margin: 0, valign: 'middle', isTextBox: true });
  }
  voet(s, voetTekst);
  return s;
}

// Donkere titeldia (begin) met telefoon
async function titelDia(pres, { titel, sub, regel, beeld, punten, oproep }) {
  const s = pres.addSlide(); s.background = { color: NAVY };
  s.addImage({ path: LOGO, x: 0.8, y: 0.8, w: 0.9, h: 0.9 });
  s.addText('ClubComm', { x: 1.9, y: 0.95, w: 5, h: 0.6, fontSize: 24, bold: true, color: WHITE, fontFace: FONT, margin: 0, isTextBox: true });
  if (!punten) {
    s.addText(titel, { x: 0.8, y: 2.3, w: 7.8, h: 1.9, fontSize: 44, bold: true, color: WHITE, fontFace: FONT, margin: 0, valign: 'top', isTextBox: true });
    s.addText(sub, { x: 0.8, y: 4.3, w: 7.6, h: 1.0, fontSize: 20, color: 'CADCFC', fontFace: FONT, margin: 0, valign: 'top', isTextBox: true });
  } else {
    // Wervend voorblad: wat het de lezer oplevert, in drie punten, en één oproep
    s.addText(titel, { x: 0.8, y: 1.95, w: 8.0, h: 0.85, fontSize: 40, bold: true, color: WHITE, fontFace: FONT, margin: 0, valign: 'top', isTextBox: true });
    s.addText(sub, { x: 0.8, y: 2.85, w: 7.8, h: 0.5, fontSize: 19, color: 'CADCFC', fontFace: FONT, margin: 0, valign: 'top', isTextBox: true });
    let y = 3.75;
    for (const [ic, tekst] of punten) {
      s.addShape('ellipse', { x: 0.8, y, w: 0.5, h: 0.5, fill: { color: BLUE } });
      s.addImage({ data: await icon(ic, WHITE), x: 0.93, y: y + 0.13, w: 0.24, h: 0.24 });
      s.addText(tekst, { x: 1.5, y, w: 7.0, h: 0.5, fontSize: 18, color: WHITE, fontFace: FONT, margin: 0, valign: 'middle', isTextBox: true });
      y += 0.6;
    }
    if (oproep) {
      s.addShape('roundRect', { x: 0.8, y: 5.75, w: 4.6, h: 0.6, rectRadius: 0.3, fill: { color: 'F5A623' } });
      s.addText(oproep, { x: 0.8, y: 5.75, w: 4.6, h: 0.6, fontSize: 16, bold: true, color: NAVY, align: 'center', valign: 'middle', fontFace: FONT, margin: 0, isTextBox: true });
    }
  }
  if (regel) s.addText(regel, { x: punten ? 5.7 : 0.8, y: punten ? 6.3 : 6.3, w: punten ? 3.2 : 7.6, h: 0.4, fontSize: 14, color: '9FB3D1', fontFace: FONT, margin: 0, isTextBox: true });
  if (beeld) telefoon(s, beeld, 9.3, 0.45, '2A4A7A');
  return s;
}

// Donkere slotdia
async function slotDia(pres, { titel, regels }) {
  const s = pres.addSlide(); s.background = { color: NAVY };
  s.addImage({ path: LOGO, x: 0.8, y: 0.8, w: 0.9, h: 0.9 });
  s.addText(titel, { x: 0.8, y: 2.1, w: 11.5, h: 1.0, fontSize: 40, bold: true, color: WHITE, fontFace: FONT, margin: 0, isTextBox: true });
  let y = 3.4;
  for (const [ic, tekst] of regels) {
    s.addShape('ellipse', { x: 0.8, y, w: 0.6, h: 0.6, fill: { color: BLUE } });
    s.addImage({ data: await icon(ic, WHITE), x: 0.95, y: y + 0.15, w: 0.3, h: 0.3 });
    s.addText(tekst, { x: 1.65, y, w: 10.5, h: 0.6, fontSize: 18, color: WHITE, fontFace: FONT, margin: 0, valign: 'middle', isTextBox: true });
    y += 0.85;
  }
  return s;
}

// ======================================================================
// TEAMLEIDER
// ======================================================================
async function teamleider() {
  const pres = nieuw('ClubComm voor teamleiders'); const v = `ClubComm voor teamleiders · ${CLUB}`;
  await titelDia(pres, { titel: 'ClubComm voor teamleiders', sub: 'Zo regel je het team: wedstrijden, taken, ouders en berichten.', regel: `O12 talententeam · ${CLUB} · pilot najaar 2026`, beeld: 'tl-home' });
  await kaarten(pres, v, {
    label: 'Jouw rol', titel: 'Wat doe je als teamleider?', intro: 'Je regelt alles rond het team, zodat de trainer zich op het voetbal kan richten.',
    items: [
      ['FaTrophy', 'Wedstrijden regelen', 'Verzameltijd, adres en wie er komen. Delen in de teamgroep met één tik.'],
      ['FaListCheck', 'Taken verdelen', 'Timekeeper, spelbegeleider, wastas: zie wat nog open staat en vraag ouders.'],
      ['FaUserPlus', 'Ouders erbij halen', 'Ouders uitnodigen met een link of QR-code en hun aanmelding goedkeuren.'],
      ['FaComments', 'Berichten en contact', 'Berichten aan het team of één ouder. Bellen of appen vanuit de app.'],
    ],
    noot: 'Wat je niet hoeft: afmeldingen doorgeven (dat doen ouders zelf) en aanwezigheid of kaarten bijhouden (dat doet de trainer).',
  });
  await stappen(pres, v, {
    label: 'Stap 1', titel: 'Aanmelden', intro: 'Je meldt je aan als ouder van je kind. Daarna krijg je de rol teamleider erbij.', beeld: 'aanmelden',
    stappen: [
      ['Open de uitnodiging', 'Je krijgt een link van de trainer. Tik erop.'],
      ['Vul je gegevens in', 'Je e-mailadres, je naam en de naam van je kind. Vink de privacyverklaring aan.'],
      ['Wacht op goedkeuring', 'De trainer keurt je aanmelding goed en geeft je de rol teamleider.'],
    ],
    tip: 'Gebruik het e-mailadres dat je dagelijks leest: daar komt de inlogcode binnen.',
  });
  await stappen(pres, v, {
    label: 'Stap 2', titel: 'Inloggen zonder wachtwoord', intro: 'ClubComm werkt met een code per e-mail. Een wachtwoord onthouden is niet nodig.', beeld: 'inloggen',
    stappen: [
      ['Ga naar mijnclubcomm.nl', 'Vul je e-mailadres in en tik op Stuur mij een inlogcode.'],
      ['Typ de code over', 'Je krijgt een mail met een code van 6 cijfers. Typ die over in de app.'],
      ['Klaar', 'Je blijft ingelogd op je telefoon.'],
    ],
    tip: 'Zet ClubComm op je beginscherm (iPhone: Delen, of ••• → Deel → Zet op beginscherm). Log daarna in via het icoon en typ de code van 6 cijfers uit de mail over.',
  });
  await stappen(pres, v, {
    label: 'Stap 3', titel: 'Wisselen tussen teamleider en ouder', intro: 'Je hebt één account met twee rollen. Bovenaan zie je altijd in welke rol je zit.', beeld: 'tl-profiel',
    stappen: [
      ['Tik rechtsboven op je initialen', 'Het profiel gaat open.'],
      ['Kies bij Wissel van rol', 'Teamleider om te regelen, Ouder om je eigen kind af te melden.'],
    ],
    tip: 'Hier vind je ook Feedback of een probleem melden. Gebruik die knop in de pilot vooral!',
  });
  await stappen(pres, v, {
    label: 'Home', titel: 'In één oogopslag', intro: 'Op Home staat de eerstvolgende wedstrijd en alles wat jij moet doen.', beeld: 'tl-home',
    stappen: [
      ['De volgende wedstrijd', 'Hoeveel spelers komen en welke taken nog open staan.'],
      ['Actie nodig', 'Alleen wat bij jou ligt: aanmeldingen goedkeuren, open taken, nieuwe berichten.'],
      ['Leeg? Dan hoef je niets te doen', 'ClubComm maakt geen werk van informatie.'],
    ],
  });
  await stappen(pres, v, {
    label: 'Team', titel: 'Ouders uitnodigen en goedkeuren', intro: 'Elk kind heeft minstens één ouder in de app nodig, anders kan niemand afmelden.', beeld: 'tl-team',
    stappen: [
      ['Deel de uitnodiging', 'Ga naar Team → Ouders uitnodigen. Delen (bijv. in de teamgroep), QR tonen op het veld, of QR printen.'],
      ['Ouders melden zich aan', 'Met hun e-mailadres en de naam van hun kind.'],
      ['Jij keurt goed', 'Tik op Goedkeuren. Ken je iemand niet? Tik op het kruisje.'],
    ],
    tip: 'De uitnodiging verloopt na 14 dagen. Met Nu vernieuwen maak je een nieuwe link.',
  });
  await stappen(pres, v, {
    label: 'Wedstrijd', titel: 'Een wedstrijd toevoegen', intro: 'In de pilot voer je de wedstrijden zelf in. Later komen ze automatisch uit Sportlink.', beeld: 'tl-wedstrijd-toevoegen',
    stappen: [
      ['Ga naar Wedstrijd', 'Tik op Wedstrijd toevoegen.'],
      ['Vul de gegevens in', 'Tegenstander, datum, aftrap, en of het een thuiswedstrijd is.'],
      ['Tik op Toevoegen', 'De ouders zien de wedstrijd meteen in hun planning.'],
    ],
  });
  await stappen(pres, v, {
    label: 'Wedstrijd', titel: 'De wedstrijd regelen', intro: 'Alles over de wedstrijd staat op één plek, in de volgorde van de dag.', beeld: 'tl-wedstrijd',
    stappen: [
      ['Verzameltijd en adres', 'Pas ze aan en tik op Opslaan. Route opent de navigatie.'],
      ['Delen', 'Stuur de gegevens met één tik naar de teamgroep.'],
      ['Wie komen er?', 'Je ziet wie afgemeld is. Afmelden doen ouders zelf.'],
    ],
  });
  await stappen(pres, v, {
    label: 'Wedstrijd', titel: 'Taken verdelen', intro: 'Bij elke wedstrijd staan vaste taken klaar. Ouders melden zich zelf aan.', beeld: 'tl-taken',
    stappen: [
      ['Vaste taken', 'Trainer-coach, timekeeper en (thuis) spelbegeleider staan er al.'],
      ['Extra taak nodig?', 'Tik op + Taak, bijv. fotograaf, bardienst of wastas. Met het kruisje haal je een taak weg.'],
      ['Nog open?', 'Tik op Oproep delen. Twee dagen van tevoren krijgen de ouders ook vanzelf een oproep.'],
    ],
    tip: 'Onder Team → Wie helpt er mee? zie je per gezin hoe vaak ze hielpen. Alleen jij ziet dat, zodat je eerlijk kunt vragen.',
  });
  await stappen(pres, v, {
    label: 'Wedstrijddag', titel: 'Op de dag zelf', intro: 'Op de wedstrijddag verschijnen extra knoppen bij de wedstrijd.', beeld: 'tl-afgelast',
    stappen: [
      ['Aanwezigheid', 'De trainer-coach vult in wie er is.'],
      ['Wisselschema', 'De timekeeper tikt op Volgend blok en ziet wie erin en eruit gaat.'],
      ['Uitslag', 'Vul na afloop de uitslag in.'],
      ['Afgelast?', 'Tik op Afgelast en kies waarom. Alle ouders krijgen direct een bericht.'],
    ],
  });
  await stappen(pres, v, {
    label: 'Berichten', titel: 'Berichten sturen', intro: 'Geen losse appjes meer: berichten staan bij elkaar en je ziet wie ze gelezen heeft.', beeld: 'tl-bericht',
    stappen: [
      ['Tik op Nieuw bericht', 'Kies Groepsbericht (hele team) of Persoonlijk (één ouder).'],
      ['Herinnering', 'Een kant-en-klaar bericht dat je nog kunt aanpassen.'],
      ['Belangrijk of urgent?', 'Dan krijgen ouders het ook per e-mail.'],
    ],
  });
  await stappen(pres, v, {
    label: 'Contact', titel: 'Contact met een ouder', intro: 'Tik op een speler en je hebt de ouders direct te pakken.', beeld: 'tl-contact',
    stappen: [
      ['Ga naar Team', 'Tik op de naam van een speler.'],
      ['Bel, app of mail', 'Met de knoppen naast de naam van de ouder.'],
    ],
    tip: 'Het groene appje naast elke speler in de lijst opent meteen WhatsApp met de ouder.',
  });
  await slotDia(pres, { titel: 'Vragen of iets werkt niet?', regels: [
    ['FaComment', 'In de app: Profiel → Feedback of een probleem melden'],
    ['FaUser', 'Of vraag het de trainer van het O12 talententeam'],
    ['FaSeedling', 'Het is een pilot: alles wat je opvalt, helpt ons de app beter te maken'],
  ] });
  await pres.writeFile({ fileName: path.join(OUT, 'ClubComm-teamleider.pptx') });
}

// ======================================================================
// OUDERS
// ======================================================================
async function ouders() {
  const pres = nieuw('ClubComm voor ouders'); const v = `ClubComm voor ouders · ${CLUB}`;
  await titelDia(pres, {
    titel: 'Alles van het team op één plek', sub: `ClubComm voor ouders · O12 talententeam · ${CLUB}`, beeld: 'ou-home',
    punten: [['FaCalendarXmark', 'Afmelden in 10 seconden'], ['FaCalendarDays', 'Tijden, velden en adressen altijd bij de hand'], ['FaCarSide', 'Samen rijden en meehelpen, zonder appgedoe']],
    oproep: 'Aanmelden duurt 1 minuut',
  });
  await stappen(pres, v, {
    label: 'Stap 1', titel: 'Aanmelden', intro: 'Je meldt je één keer aan via de uitnodiging van het team.', beeld: 'aanmelden',
    stappen: [
      ['Open de uitnodiging', 'Via de link in de teamgroep of de QR-code bij de training.'],
      ['Vul je gegevens in', 'Je e-mailadres, je naam en de naam van je kind. Vink de privacyverklaring aan.'],
      ['De teamleider keurt goed', 'Daarna kun je inloggen.'],
    ],
    tip: 'Twee ouders? Meld je allebei aan met je eigen e-mailadres. Dan krijgen jullie allebei de berichten.',
  });
  await stappen(pres, v, {
    label: 'Stap 2', titel: 'Inloggen zonder wachtwoord', intro: 'Je krijgt een code per e-mail. Daarna blijf je ingelogd.', beeld: 'inloggen',
    stappen: [
      ['Ga naar mijnclubcomm.nl', 'Vul je e-mailadres in en tik op Stuur mij een inlogcode.'],
      ['Typ de code over', 'Je krijgt een mail met een code van 6 cijfers. Typ die over in de app.'],
    ],
    tip: 'Zet ClubComm op je beginscherm (iPhone: Delen, of ••• → Deel → Zet op beginscherm). Log daarna in via het icoon en typ de code van 6 cijfers uit de mail over.',
  });
  await stappen(pres, v, {
    label: 'Home', titel: 'Alles voor jouw kind', intro: 'Bovenaan wat jouw aandacht vraagt, daaronder het programma.', beeld: 'ou-home',
    stappen: [
      ['Actie nodig', 'Een bericht van de trainer, een open taak of een kind dat vervoer zoekt.'],
      ['Programma', 'Trainingen en wedstrijden van de komende tijd, met tot wanneer je kunt afmelden.'],
    ],
  });
  await stappen(pres, v, {
    label: 'Het belangrijkste', titel: 'Afmelden', intro: 'Je kind wordt bij elke training en wedstrijd verwacht, tenzij je afmeldt.', beeld: 'ou-afmelden',
    stappen: [
      ['Tik op Afmelden', 'Bij de training of wedstrijd op Home of in de Planning.'],
      ['Kies een reden', 'Bijvoorbeeld ziek, blessure of familie. De trainer ziet het direct.'],
      ['Op tijd', 'Training: uiterlijk 3 uur van tevoren. Wedstrijd: uiterlijk 24 uur van tevoren.'],
    ],
    tip: 'Langer weg door een blessure of vakantie? Meld een periode af, dan hoeft het niet per training.',
  });
  await stappen(pres, v, {
    label: 'Afspraken', titel: 'Zo werken de kaarten', intro: 'Net als op het veld. De trainer beslist altijd zelf wat hij ermee doet.', beeld: 'ou-kaarten',
    stappen: [
      ['Eerst een herinnering', 'Vergeten af te melden? De eerste keer krijg je een vriendelijke herinnering.'],
      ['Te laat afgemeld: geel', 'Twee keer geel is rood. Ziek geworden op de dag zelf telt niet.'],
      ['Niet afgemeld: rood', 'Bij rood neemt de trainer even contact met je op.'],
    ],
  });
  await stappen(pres, v, {
    label: 'Planning', titel: 'Het programma', intro: 'Alle trainingen en wedstrijden per week.', beeld: 'ou-planning',
    stappen: [
      ['Tik op een activiteit', 'Je ziet tijd, veld of adres, en je kunt afmelden.'],
      ['Uitwedstrijd?', 'Met Route open je de navigatie naar het sportpark.'],
    ],
  });
  await stappen(pres, v, {
    label: 'Vervoer', titel: 'Samen rijden', intro: 'Bij uitwedstrijden regel je samen wie rijdt.', beeld: 'ou-vervoer',
    stappen: [
      ['Plek over?', 'Tik bij een kind dat vervoer zoekt op Kan met mij mee.'],
      ['Zelf geen vervoer?', 'Tik op Ik zoek vervoer. De andere ouders zien je vraag.'],
    ],
  });
  await stappen(pres, v, {
    label: 'Taken', titel: 'Meehelpen', intro: 'Bij elke wedstrijd zijn er een paar taken, zoals timekeeper of spelbegeleider.', beeld: 'ou-taken',
    stappen: [
      ['Ik doe het', 'Neem een taak met één tik.'],
      ['Kan niet', 'Mag ook. Dan weet de teamleider dat hij iemand anders moet vragen.'],
    ],
  });
  await stappen(pres, v, {
    label: 'Berichten', titel: 'Berichten', intro: 'Nieuws van het team en de club, en persoonlijke berichten.', beeld: 'ou-bericht',
    stappen: [
      ['Persoonlijk en Nieuws', 'Twee tabbladen, zodat je belangrijke berichten niet mist.'],
      ['Vraag aan trainer of teamleider', 'Stel je vraag in de app; zij zien hem meteen.'],
      ['E-mail', 'Belangrijke en urgente berichten krijg je ook per e-mail.'],
    ],
  });
  await kaarten(pres, v, {
    label: 'Privacy', titel: 'Veilig en alleen wat nodig is', kol: 2,
    items: [
      ['FaLock', 'Alleen je eigen kind', 'Je ziet de aanwezigheid en kaarten van je eigen kind. Nooit die van andere kinderen, nooit een ranglijst.'],
      ['FaShieldHalved', 'De club is verantwoordelijk', 'De gegevens staan veilig in Europa. Lees de privacyverklaring in de app (Profiel).'],
      ['FaBandage', 'Geen medische gegevens', 'Bij een afmelding kies je alleen een reden, zoals ziek of blessure. Details zijn niet nodig.'],
      ['FaTrashCan', 'Zelf stoppen', 'Je kunt je kind uitschrijven en je account verwijderen in het profiel.'],
    ],
  });
  await slotDia(pres, { titel: 'Vragen?', regels: [
    ['FaComments', 'Stel je vraag aan de teamleider of trainer, in de app'],
    ['FaComment', 'Iets werkt niet? Profiel → Feedback of een probleem melden'],
  ] });
  await pres.writeFile({ fileName: path.join(OUT, 'ClubComm-ouders.pptx') });
}

// ======================================================================
// TRAINER
// ======================================================================
async function trainer() {
  const pres = nieuw('ClubComm voor trainers'); const v = `ClubComm voor trainers · ${CLUB}`;
  await titelDia(pres, { titel: 'ClubComm voor trainers', sub: 'Weten wie er komt, aanwezigheid bijhouden, eerlijk wisselen en contact met ouders.', regel: CLUB, beeld: 'tr-home' });
  await kaarten(pres, v, {
    label: 'Jouw rol', titel: 'Wat doe je als trainer in ClubComm?', intro: 'ClubComm neemt het regelwerk over. Jij houdt de aanwezigheid bij en beslist.',
    items: [
      ['FaClipboardCheck', 'Aanwezigheid', 'Op het veld aftikken wie er is. De app telt en rekent zelf.'],
      ['FaTriangleExclamation', 'Spelers opvolgen', 'Vaak afwezig of niet afgemeld? Je krijgt een signaal en belt of appt de ouder.', ORANGE],
      ['FaCalendarDays', 'Planning', 'Training verplaatsen, extra training of oefenwedstrijd. Ouders krijgen direct bericht.'],
      ['FaStopwatch', 'Eerlijk wisselen', 'De app maakt een wisselschema; jij past het aan.'],
      ['FaComments', 'Berichten', 'Aan het team of één ouder, met zien wie het gelezen heeft.'],
      ['FaStar', 'Ontwikkeling', 'Beoordelen en ontwikkelgesprekken op vaste momenten in het seizoen.'],
    ], kol: 3,
  });
  await stappen(pres, v, {
    label: 'Home', titel: 'Wie komt er vandaag?', intro: 'Op Home staat je eerstvolgende training met het aantal spelers.', beeld: 'tr-home',
    stappen: [
      ['Verwacht', 'Hoeveel spelers komen, en wie is afgemeld met welke reden.'],
      ['Actie nodig', 'Alleen wat jij moet doen: aanwezigheid opnemen, een ouder bellen, materiaal controleren.'],
    ],
  });
  await stappen(pres, v, {
    label: 'Op het veld', titel: 'Aanwezigheid opnemen', intro: 'Iedereen die niet is afgemeld, staat al op aanwezig.', beeld: 'tr-aanwezigheid',
    stappen: [
      ['Tik op een naam om te wisselen', 'Aanwezig → te laat → afwezig.'],
      ['Tik op Opslaan', 'Kaarten en percentages volgen vanzelf. Ouders krijgen zo nodig een herinnering.'],
      ['Vergist?', 'Corrigeren kan tot 48 uur na de start.'],
    ],
  });
  await stappen(pres, v, {
    label: 'Spelers', titel: 'Spelers opvolgen', intro: 'Per speler zie je de aanwezigheid van dit seizoen, apart voor trainingen en wedstrijden.', beeld: 'tr-spelers',
    stappen: [
      ['Kleur', 'Groen gaat goed, oranje let op, rood: even contact met de ouder.'],
      ['Signaal op Home', 'Bij rood of een patroon (bijv. vaak op dezelfde dag weg) krijg je een signaal.'],
      ['Jij beslist', 'Bel of app de ouder, of tik op Geen actie nodig. ClubComm straft niet automatisch.'],
    ],
  });
  await stappen(pres, v, {
    label: 'Contact', titel: 'Een ouder bellen of appen', intro: 'Tik op een speler voor de contactkaart.', beeld: 'tr-speler',
    stappen: [
      ['Bel, app of mail', 'Met de knoppen naast de ouder.'],
      ['Leg het vast', 'Tik op Contact vastleggen, met een korte notitie. Zo weet de club wat er is afgesproken.'],
    ],
  });
  await stappen(pres, v, {
    label: 'Planning', titel: 'Planning aanpassen', intro: 'Wijzigingen doe je zelf. Ouders krijgen direct een bericht.', beeld: 'tr-planning',
    stappen: [
      ['Kies wat je wilt doen', 'Training verplaatsen of veld wijzigen, afgelasten, extra training, oefenwedstrijd of activiteit.'],
      ['Vul de gegevens in', 'Datum, tijd en veld (of tegenstander).'],
      ['Opslaan en ouders informeren', 'Teamleider en HJO krijgen een melding ter informatie.'],
    ],
    tip: 'Een oefenwedstrijd telt mee voor het wisselschema en de eerlijke speeltijd.',
  });
  await stappen(pres, v, {
    label: 'Speeltijd', titel: 'Het wisselschema maken', intro: 'Vóór de wedstrijd maakt de app een eerlijk voorstel.', beeld: 'tr-speeltijd',
    stappen: [
      ['Om de hoeveel minuten wissel je?', 'De club stelt het advies in (O12: per blok van 15 minuten). Jij mag per wedstrijd afwijken.'],
      ['Tik op Maak wisselschema', 'Wie minder speelde, krijgt voorrang. De keeper wisselt per week.'],
      ['Selectie', 'Je mag iemand bewust een blok minder geven, bijv. na weinig trainen.'],
    ],
  });
  await stappen(pres, v, {
    label: 'Speeltijd', titel: 'Zelf aanpassen en wisselen', intro: 'Het voorstel is een begin: jij beslist.', beeld: 'tr-schema',
    stappen: [
      ['Tik op een vakje', 'Zet een speler in of uit dat blok. Rechts zie je de minuten per speler.'],
      ['Let op de telling', 'Onderaan staat per blok hoeveel spelers in het veld staan; rood als het niet klopt.'],
      ['Tijdens de wedstrijd', 'Jij of de timekeeper tikt op Volgend blok. Na afloop: Wedstrijd klaar: bevestigen.'],
    ],
  });
  await stappen(pres, v, {
    label: 'Ouders', titel: 'Ouders uitnodigen', intro: 'Heeft je team (nog) geen teamleider? Dan doe jij dit.', beeld: 'tr-uitnodigen',
    stappen: [
      ['Spelers → Ouders uitnodigen', 'Deel de link in de teamgroep of laat de QR-code zien op het veld.'],
      ['Aanmeldingen goedkeuren', 'Ze verschijnen op Home. Tik op Goedkeuren.'],
    ],
  });
  await stappen(pres, v, {
    label: 'Berichten', titel: 'Berichten', intro: 'Alles op één plek, met zien wie het gelezen heeft.', beeld: 'tr-berichten',
    stappen: [
      ['Nieuw bericht', 'Groep, persoonlijk, trainingswijziging of herinnering.'],
      ['Urgent', 'Alleen voor iets van vandaag of morgen: staat bovenaan en gaat altijd ook per e-mail.'],
    ],
  });
  await kaarten(pres, v, {
    label: 'Door het seizoen', titel: 'Wat komt er nog?', kol: 2,
    items: [
      ['FaStar', 'Beoordelen', 'Twee keer per seizoen, passend bij de leeftijd. Ouders zien alleen hun eigen kind.'],
      ['FaHandshake', 'Ontwikkelgesprek', 'Na het beoordelen plan je een gesprek met ouder en kind. Ouders kiezen zelf een tijd.'],
      ['FaBoxOpen', 'Materiaal', 'Bij de start controleer en teken je voor ballen, hesjes en de EHBO-tas.'],
      ['FaUserClock', 'Zelf afwezig?', 'Meld het in de app. Dan kan de club op tijd een vervanger regelen.'],
    ],
  });
  await slotDia(pres, { titel: 'Vragen of iets werkt niet?', regels: [
    ['FaComment', 'In de app: Profiel → Feedback of een probleem melden'],
    ['FaUser', 'Of vraag het de HJO'],
  ] });
  await pres.writeFile({ fileName: path.join(OUT, 'ClubComm-trainer.pptx') });
}

// ======================================================================
// BESTUUR
// ======================================================================
async function bestuur() {
  const pres = nieuw('ClubComm — pilot bij RKSV DCG'); const v = `ClubComm · voorstel aan het bestuur van ${CLUB}`;
  let s = await titelDia(pres, { titel: 'Pilot ClubComm bij RKSV DCG', sub: 'Afmelden, planning en communicatie rond het jeugdvoetbal op één plek.', regel: 'Voorstel aan het bestuur · oktober 2026', beeld: 'ou-home' });
  s.addNotes('Doel: toestemming voor een pilot van 8 weken met het O12 talententeam.');
  s = await kaarten(pres, v, {
    label: 'Waarom', titel: 'Wat we elke week zien', intro: 'Herkenbaar voor bijna elke amateurclub.',
    items: [
      ['FaUserXmark', 'Niet afgemeld', 'Kinderen komen niet, zonder bericht. De trainer weet pas op het veld wie er is.', ORANGE],
      ['FaComments', 'Alles via WhatsApp', 'Afmeldingen, vervoer en taken in drukke groepen. Informatie raakt zoek.', ORANGE],
      ['FaPeopleGroup', 'Steeds dezelfde ouders', 'Een paar gezinnen doen het meeste werk; anderen worden nooit gevraagd.', ORANGE],
      ['FaBrain', 'Opvolging zit in hoofden', 'Wie belt als een kind vaak ontbreekt? Afspraken worden nergens vastgelegd.', ORANGE],
    ],
  });
  s.addNotes('Herkenbare problemen; laat het bestuur eigen voorbeelden noemen.');
  s = await kaarten(pres, v, {
    label: 'Wat is ClubComm', titel: 'Eén app voor ouders, trainers en teamleiders', intro: 'Op de telefoon, zonder wachtwoord. ClubComm signaleert en communiceert; mensen beslissen.', kol: 3,
    items: [
      ['FaBell', 'Signaleren', 'Wie is vaak afwezig, wie meldt te laat af, welke taken blijven open.'],
      ['FaComments', 'Communiceren', 'Afmelden met één tik, berichten per team, vaste berichten bij vakanties.'],
      ['FaFolderOpen', 'Vastleggen', 'Gesprekken en afspraken op één plek, ook als een trainer wisselt.'],
    ],
    noot: 'Geen automatische straffen: de club stelt de regels in (afmeldtermijnen, kaarten, wisselen) en trainers beslissen.',
  });
  // Drie telefoons
  s = pres.addSlide(); s.background = { color: WHITE };
  kop(s, { label: 'Zo ziet het eruit', titel: 'Voor elke rol een eigen scherm' }, 11.9);
  [['ou-home', 'Ouder', 'Afmelden, vervoer, taken'], ['tr-aanwezigheid', 'Trainer', 'Aanwezigheid op het veld'], ['tl-wedstrijd', 'Teamleider', 'De wedstrijd regelen']].forEach(([b, rol, sub], i) => {
    const x = 0.7 + i * 4.15;
    s.addShape('roundRect', { x, y: 1.85, w: 2.4, h: 4.75, rectRadius: 0.28, fill: { color: NAVY } });
    s.addImage({ path: BEELD(b), x: x + 0.1, y: 1.95, w: 2.2, h: 4.4 });
    s.addText([{ text: rol, options: { bold: true, color: NAVY, fontSize: 18, breakLine: true } }, { text: sub, options: { color: MUTED, fontSize: 14 } }], { x: x + 2.55, y: 3.6, w: 1.5, h: 1.3, fontFace: FONT, margin: 0, valign: 'top', isTextBox: true });
  });
  voet(s, v);
  // De pilot: grote getallen
  s = pres.addSlide(); s.background = { color: WHITE };
  kop(s, { label: 'Het voorstel', titel: 'Klein beginnen: één team, acht weken' }, 11.9);
  [['1', 'team', 'O12 talententeam'], ['17', 'spelers', 'met hun ouders'], ['8', 'weken', 'oktober en november'], ['1', 'aanspreekpunt', 'trainer en initiatiefnemer']].forEach(([n, a, b], i) => {
    const x = 0.7 + i * 3.05;
    s.addShape('roundRect', { x, y: 1.95, w: 2.8, h: 2.2, rectRadius: 0.12, fill: { color: TINT } });
    s.addText(n, { x, y: 2.05, w: 2.8, h: 1.1, fontSize: 60, bold: true, color: BLUE, align: 'center', fontFace: FONT, margin: 0, isTextBox: true });
    s.addText([{ text: a, options: { bold: true, color: NAVY, breakLine: true } }, { text: b, options: { color: MUTED, fontSize: 13 } }], { x, y: 3.15, w: 2.8, h: 0.9, fontSize: 16, align: 'center', fontFace: FONT, margin: 0, isTextBox: true });
  });
  s.addText([
    { text: 'Start: ', options: { bold: true } }, { text: 'begin oktober. Ouders melden zich aan via een link of QR-code; per rol is er een korte handleiding.', options: { breakLine: true } },
    { text: 'Oefenwedstrijden en competitie: ', options: { bold: true } }, { text: 'wedstrijden vanaf 31 oktober (fase 2), oefenwedstrijden al eerder.', options: { breakLine: true } },
    { text: 'WhatsApp: ', options: { bold: true } }, { text: 'afmelden gaat alleen nog via ClubComm; de teamgroep blijft voor de gezelligheid.', options: { breakLine: true } },
    { text: 'Evaluatie: ', options: { bold: true } }, { text: 'eind november, met ouders, teamleiders en trainer. Daarna besluit het bestuur over meer teams.' },
  ], { x: 0.7, y: 4.5, w: 11.9, h: 2.3, fontSize: 15, color: INK, fontFace: FONT, margin: 0, valign: 'top', paraSpaceAfter: 8, isTextBox: true });
  voet(s, v);
  s.addNotes('De pilot draait in één team, zodat we snel leren en weinig risico lopen.');
  // Privacy: twee kolommen
  s = pres.addSlide(); s.background = { color: WHITE };
  kop(s, { label: 'Privacy en veiligheid', titel: 'Gegevens van kinderen: zorgvuldig en in Europa' }, 11.9);
  const kolom = async (x, kopje, ic, kleur, regels) => {
    s.addShape('roundRect', { x, y: 1.95, w: 5.8, h: 4.85, rectRadius: 0.12, fill: { color: SOFT } });
    s.addShape('ellipse', { x: x + 0.3, y: 2.2, w: 0.6, h: 0.6, fill: { color: kleur } });
    s.addImage({ data: await icon(ic, WHITE), x: x + 0.45, y: 2.35, w: 0.3, h: 0.3 });
    s.addText(kopje, { x: x + 1.1, y: 2.2, w: 4.5, h: 0.6, fontSize: 19, bold: true, color: NAVY, valign: 'middle', fontFace: FONT, margin: 0, isTextBox: true });
    s.addText(regels.map((r, i) => ({ text: r, options: { bullet: true, breakLine: i < regels.length - 1 } })), { x: x + 0.35, y: 3.0, w: 5.2, h: 3.65, fontSize: 14, color: INK, fontFace: FONT, margin: 0, valign: 'top', paraSpaceAfter: 6, isTextBox: true });
  };
  await kolom(0.7, 'Geregeld voor de pilot', 'FaCircleCheck', '16A34A', [
    'Opslag in de EU (Frankfurt); e-mail via een Europese dienst',
    'Wie wat mag zien, controleert de database zelf: ouders alleen hun eigen kind, staf alleen het eigen team',
    'Inloggen zonder wachtwoord, met een code per e-mail',
    'Privacyverklaring in de app; aanmelden alleen met akkoord van de ouder',
    'Geen medische gegevens: bij afmelden alleen een reden, zoals "ziek" of "blessure"',
    'Elke week een back-up; ouders kunnen hun account zelf verwijderen',
  ]);
  await kolom(6.8, 'Vóór uitbreiding naar meer teams', 'FaListCheck', ORANGE, [
    'Verwerkersovereenkomst tussen de club en ClubComm (en de gebruikte diensten)',
    'Risicoanalyse (DPIA), omdat het om kinderen gaat',
    'Bewaartermijnen: gegevens automatisch opruimen na het seizoen',
    'Dagelijkse back-ups buiten de database',
  ]);
  voet(s, v);
  s.addNotes('De club is verantwoordelijk voor de gegevens; ClubComm verwerkt ze in opdracht. Voor de pilot vragen we een contactpersoon voor privacyvragen.');
  // Kosten
  s = await kaarten(pres, v, {
    label: 'Kosten', titel: 'Voor de club kost de pilot niets', kol: 3,
    items: [
      ['FaEuroSign', '€ 0 voor de club', 'De pilot draait op gratis versies van de gebruikte diensten.', '16A34A'],
      ['FaGlobe', 'Eigen webadres', 'mijnclubcomm.nl: betaald door de initiatiefnemer (ongeveer € 10 per jaar).'],
      ['FaDatabase', 'Extra zekerheid', 'Eventueel dagelijkse back-ups (ongeveer $ 25 per maand), ook door de initiatiefnemer.'],
    ],
    noot: 'Bij uitbreiding naar meer teams of clubs bespreken we een vaste prijs per club per jaar.',
  });
  // Geslaagd?
  s = pres.addSlide(); s.background = { color: WHITE };
  kop(s, { label: 'Evaluatie', titel: 'Wanneer is de pilot geslaagd?', intro: 'Voorstel, samen vast te stellen voor de start.' }, 11.9);
  [['90%', 'van de spelers heeft een ouder in de app'], ['80%', 'van de afmeldingen gaat via ClubComm'], ['90%', 'van de trainingen heeft de aanwezigheid ingevuld'], ['75%', 'van de berichten is binnen 24 uur gelezen']].forEach(([n, t], i) => {
    const x = 0.7 + i * 3.05;
    s.addText(n, { x, y: 2.8, w: 2.8, h: 1.0, fontSize: 54, bold: true, color: BLUE, fontFace: FONT, margin: 0, isTextBox: true });
    s.addText(t, { x, y: 3.8, w: 2.7, h: 0.9, fontSize: 15, color: INK, fontFace: FONT, margin: 0, valign: 'top', isTextBox: true });
  });
  s.addShape('roundRect', { x: 0.7, y: 5.0, w: 11.93, h: 1.6, rectRadius: 0.12, fill: { color: TINT } });
  s.addText([{ text: 'En minstens zo belangrijk', options: { bold: true, color: NAVY, breakLine: true } },
    { text: 'Minder "niet afgemeld en niet gekomen" · minder open taken op wedstrijddagen · trainer en teamleiders zeggen: het scheelt me tijd.', options: { color: INK } }],
  { x: 1.0, y: 5.1, w: 11.4, h: 1.4, fontSize: 16, fontFace: FONT, margin: 0, valign: 'middle', isTextBox: true });
  voet(s, v);
  // Vraag aan het bestuur + tijdlijn
  s = pres.addSlide(); s.background = { color: WHITE };
  kop(s, { label: 'Besluit', titel: 'Wat vragen we van het bestuur?' }, 11.9);
  const vragen = ['Toestemming voor de pilot met het O12 talententeam', 'Een contactpersoon voor privacyvragen van ouders', 'Akkoord dat de club verantwoordelijk is voor de gegevens en ClubComm ze verwerkt', 'Een evaluatiemoment eind november'];
  vragen.forEach((t, i) => {
    const y = 1.95 + i * 0.75;
    s.addShape('ellipse', { x: 0.7, y, w: 0.5, h: 0.5, fill: { color: BLUE } });
    s.addText(String(i + 1), { x: 0.7, y, w: 0.5, h: 0.5, fontSize: 16, bold: true, color: WHITE, align: 'center', valign: 'middle', fontFace: FONT, margin: 0, isTextBox: true });
    s.addText(t, { x: 1.45, y, w: 10.8, h: 0.5, fontSize: 17, color: INK, valign: 'middle', fontFace: FONT, margin: 0, isTextBox: true });
  });
  const tl = [['Nu', 'toestemming'], ['Begin oktober', 'start pilot'], ['31 oktober', 'competitie (fase 2)'], ['Eind november', 'evaluatie'], ['Daarna', 'besluit over meer teams']];
  s.addShape('line', { x: 1.0, y: 5.45, w: 9.72, h: 0, line: { color: 'CADCFC', width: 3 } });
  tl.forEach(([a, b], i) => {
    const x = 0.7 + i * 2.43;
    s.addShape('ellipse', { x: x + 0.15, y: 5.3, w: 0.3, h: 0.3, fill: { color: i === 0 ? ORANGE : BLUE } });
    s.addText([{ text: a, options: { bold: true, color: NAVY, breakLine: true } }, { text: b, options: { color: MUTED } }], { x, y: 5.75, w: 2.25, h: 0.9, fontSize: 14, fontFace: FONT, margin: 0, valign: 'top', isTextBox: true });
  });
  voet(s, v);
  await slotDia(pres, { titel: 'Vragen? Probeer het zelf', regels: [
    ['FaMobileScreen', 'Demo met voorbeelddata: mijnclubcomm.nl/?demo'],
    ['FaUser', 'Log in als ouder, trainer, teamleider of HJO. Er staan geen echte gegevens in.'],
  ] });
  await pres.writeFile({ fileName: path.join(OUT, 'ClubComm-bestuur.pptx') });
}

(async () => {
  const welke = process.argv[2];
  for (const [n, f] of Object.entries({ bestuur, teamleider, ouders, trainer })) if (!welke || welke === n) { await f(); console.log('klaar:', n); }
})();
