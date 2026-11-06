# Bundels (Besluit 151)

*Een bundel zegt welke functiekaarten in welke uitgave komen, en welk blok (Kort, Meer, HJO, Beheerder). De tekst staat alleen op de kaarten: pas je een instructie aan, dan doe je dat op de kaart en maak je de uitgaven opnieuw. Een gepubliceerde uitgave bevat alleen kaarten met de status In productie.*

## Snelstart vrijwillige trainer

| | |
|---|---|
| **Status van de uitgave** | Concept |
| **Lezer** | vrijwillige trainer die net begint (laag *Draaien*, Besluit 149) |
| **Vorm** | PDF, hoogstens 2 A4, veel beeld |
| **Wat je hieraan hebt** | In tien minuten kun je inloggen, zien wie er komt, de aanwezigheid opnemen en weet je wat je doet als je zelf niet kunt. |
| **Bestand** | `docs/presentaties/pdf/ClubComm-snelstart-trainer.pdf` (2 A4, Concept; 6-11-2026 opnieuw met de nieuwe tabnamen en beelden) |

**Kaarten, in deze volgorde (blok Kort, met de schermafbeelding van dat blok):**
1. [inloggen.md](inloggen.md): Inloggen en de app op je beginscherm
2. [aanwezigheid.md](aanwezigheid.md): Wie komt er, en aanwezigheid opnemen
3. [zelf-afmelden.md](zelf-afmelden.md): Kun je zelf niet?
4. [training-voorbereiden.md](training-voorbereiden.md): Training voorbereiden. *Alleen als de club de trainingsmodule gebruikt.*

**Slotregel (mag, niet moet):** *Wil je meer? Bewaar je eigen oefenvormen bij Vormen en teken ze met de tekentool. Vragen: Profiel → Feedback, of vraag het je coördinator of HJO.*

**Opnieuw maken** (de losse regels hierboven gaan als `"= …"` mee; `~naast` zet het beeld naast de stappen):
```
node docs/handleiding/pdf.js docs/presentaties/pdf/ClubComm-snelstart-trainer.pdf "Snelstart vrijwillige trainer" Concept "^ ClubComm · voor trainers · je eerste training" "= In tien minuten kun je inloggen, zien wie er komt, de aanwezigheid opnemen en weet je wat je doet als je zelf niet kunt." "inloggen.md#Kort~naast" "aanwezigheid.md#Kort~naast" "zelf-afmelden.md#Kort~naast" "= *Alleen als je club de trainingsmodule gebruikt:*" "training-voorbereiden.md#Kort~naast" "= Wil je meer? Bewaar je eigen oefenvormen bij Vormen en teken ze met de tekentool. Vragen: Profiel → Feedback, of vraag het je coördinator of HJO."
```

**Bewust niet in de snelstart:** wisselschema en speeltijd, berichten, spelers opvolgen, ouders uitnodigen. Die komen in de *Handleiding trainer* (Kort + Meer), zodra die kaarten er zijn.

## Snelstart trainersbijeenkomst (trainerspilot, Besluit 161) — deze printen

| | |
|---|---|
| **Status van de uitgave** | Gepubliceerd (6-11-2026, app `7a44e84`; opnieuw met de tabnamen van Besluit 176) |
| **Lezer** | trainer op de bijeenkomst: inloggen en zelf een oefenvorm tekenen |
| **Vorm** | PDF, 2 A4 |
| **Kaarten, in deze volgorde** | [inloggen.md](inloggen.md): Kort + Let op (eerste 3) · [tekentool.md](tekentool.md): Kort (alleen de telefoonbeelden) + Let op (eerste 4) |
| **Bestand** | `docs/presentaties/pdf/ClubComm-snelstart-trainersbijeenkomst.pdf` |
| **Opnieuw maken** | `node docs/handleiding/pdf.js docs/presentaties/pdf/ClubComm-snelstart-trainersbijeenkomst.pdf "Snelstart trainersbijeenkomst" Gepubliceerd "inloggen.md#Kort" "inloggen.md#Let op:3" "tekentool.md#Kort@tel" "tekentool.md#Let op:4"` |

## Snelstart: een oefenvorm tekenen (trainerspilot, Besluit 161)

| | |
|---|---|
| **Status van de uitgave** | Gepubliceerd (6-11-2026, app `7a44e84`; opnieuw met de tabnamen van Besluit 176) |
| **Kaarten** | [tekentool.md](tekentool.md): blok Kort + Let op |
| **Bestand** | `docs/presentaties/pdf/ClubComm-snelstart-tekenen.pdf`, gemaakt met `docs/handleiding/pdf.js` (`node docs/handleiding/pdf.js docs/presentaties/pdf/ClubComm-snelstart-tekenen.pdf "Snelstart: een oefenvorm tekenen" Gepubliceerd "tekentool.md#Kort" "tekentool.md#Let op"`) |

## Nog te maken
- Handleiding trainer (Kort + Meer van alle trainerskaarten), handleiding HJO, handleiding clubbeheerder, ouders, teamleider, bestuursdemo: zie `docs/onderzoek/documentatie-borging/README.md` § 4.1.
- *Gepubliceerd* maken van de Snelstart vrijwillige trainer: na akkoord van de initiatiefnemer (`pdf.js` weigert *Gepubliceerd* als een kaart niet *In productie* is).
- De beelden van de tekentool (`tekentool-*.jpg`) tonen nog de grote hoedjes van vóór Besluit 162; daarna de twee tekenen-PDF's opnieuw (apart akkoord).
