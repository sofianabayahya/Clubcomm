// ClubComm — de snelstart-pdf's opnieuw maken uit de functiekaarten (na npm run beelden). Zelfde opdrachten als in docs/handleiding/bundels.md.
import { execFileSync } from 'node:child_process';

const pdf = (...a) => execFileSync('node', ['docs/handleiding/pdf.js', ...a], { stdio: 'inherit' });
pdf('docs/presentaties/pdf/ClubComm-snelstart-trainer.pdf', 'Snelstart vrijwillige trainer', 'Gepubliceerd', '^ ClubComm · voor trainers · je eerste training',
  '= In tien minuten kun je inloggen, zien wie er komt, de aanwezigheid opnemen en weet je wat je doet als je zelf niet kunt.',
  'inloggen.md#Kort~naast', 'aanwezigheid.md#Kort~naast', 'zelf-afmelden.md#Kort~naast', '= *Alleen als je club de trainingsmodule gebruikt:*', 'training-voorbereiden.md#Kort~naast',
  '= Wil je meer? Bewaar je eigen oefenvormen bij Vormen en teken ze met de tekentool. Vragen: Profiel → Feedback, of vraag het je coördinator of HJO.');
pdf('docs/presentaties/pdf/ClubComm-snelstart-trainersbijeenkomst.pdf', 'Snelstart trainersbijeenkomst', 'Gepubliceerd', 'inloggen.md#Kort', 'inloggen.md#Let op:3', 'tekentool.md#Kort@tel', 'tekentool.md#Let op:4');
pdf('docs/presentaties/pdf/ClubComm-snelstart-tekenen.pdf', 'Snelstart: een oefenvorm tekenen', 'Gepubliceerd', 'tekentool.md#Kort', 'tekentool.md#Let op');
