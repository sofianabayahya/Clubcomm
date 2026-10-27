# Tekentool: clean houden — analyse en drie ontwerpen

*27 oktober 2026. Voorstel, geen besluit. Voorbeelden (laptop): `c-a.png`, `c-b.png`, `c-c.png` in deze map.*

## Analyse (huidige tekentool, laptop)
- **Linkerpaneel met ± 45 knoppen en instellingen door elkaar:** 6 spelers, 15 spullen (6 hoedjes en 5 schijfjes elk als losse knop), 5 pijlen, 3 markeringen, 6 veldvormen, 4 opstellingen, 2 vinkjes en *Alles wissen*. Je moet scrollen en zoeken (wet van Hick: meer keuzes = langer kiezen).
- **Altijd zichtbare uitleg:** de tip-balk en de hulptekst boven het veld nemen ruimte in, ook als je ze al kent.
- **Het veld krijgt maar ± 55% van het scherm**, terwijl de tekening het belangrijkste is.
- **Instellingen (veldvorm, opstelling, magneet, inzoomen) staan tussen het gereedschap**, terwijl je ze één keer per tekening kiest.
- Goed: sneltoetsen, magneet, ongedaan maken, de knoppenbalk bij een keuze, de nummerbalk.

## Technieken (vaktermen)
| Techniek | Wat het betekent | Hier |
|---|---|---|
| **Canvas eerst** | Het werkvlak krijgt de meeste ruimte | Veld zo groot mogelijk, paneel smal |
| **Progressive disclosure** | Alleen tonen wat nu nodig is; de rest één tik verder | Kleuren pas als je *Hoedjes* kiest |
| **Flyout / gegroepeerde gereedschappen** | Eén knop per soort, varianten in een uitklapmenu (zoals Figma, Photoshop) | 6 hoedjes → 1 knop *Hoedjes* met kleuren |
| **Laatst gebruikt onthouden (sticky defaults)** | De knop toont de laatst gekozen variant | Knop *Hoedjes* is rood als je rood koos |
| **Contextuele werkbalk** | Opties verschijnen bij wat je aanklikt | Kleur, nummer, draaien, verwijderen bij de gekozen speler |
| **Modes scheiden** | Instellingen apart van gereedschap | Veld en opstelling in de bovenbalk |
| **Herkennen boven onthouden** | Iconen met een woord eronder | *Spelers*, *Hoedjes*, *Pijlen* |
| **Wet van Fitts** | Veelgebruikte knoppen groot en dichtbij | 56 px knoppen in de rail, 44 px minimaal |
| **Uitleg alleen de eerste keer** | Hulptekst verdwijnt na gebruik | Tip en hint één keer, daarna via ? |

## Ontwerp A — Smalle rail met uitklapmenu's (advies)
- Links een smalle rail met 9 knoppen: *Kies · Spelers · Bal · Hoedjes · Schijfjes · Doelen · Pijlen · Vak · Tekst*. Elke knop opent een klein menu met kleuren of varianten; de knop onthoudt je laatste keuze.
- *Spelers* bevat ook de nummerbalk (eigen team, tegenstander, zonder nummer, rondje ⇄ driehoek).
- Bovenbalk: *Veld ▾*, *Opstelling ▾*, ⚙ (magneet, inzoomen, alles wissen).
- **Voordelen:** het veld wordt ± 35% groter; alles nog één tik weg; sneltoetsen blijven.
- **Nadelen:** een kleur kiezen kost één tik extra (alleen als je wisselt van kleur).
- **Advies: zou ik doen.** Grootste winst, vertrouwd voor wie al tekent.

## Ontwerp B — Alleen het veld, met een dock en een contextbalk
- Geen paneel: onderaan een dock met 5 knoppen (*Kies, Spelers, Spullen, Pijlen, Markeren*); klik je iets aan, dan zweeft er een balk bij (kleur, nummer, dupliceren, draaien, verwijderen).
- **Voordelen:** maximaal veld, heel rustig; werkt ook goed op de tablet.
- **Nadelen:** minder overzicht van alle spullen; meer tikken voor wie veel verschillende spullen neerzet.
- **Advies:** zou ik niet als eerste doen; wel de contextbalk uit B overnemen in A.

## Ontwerp C — In stappen
- Bovenin vier stappen: *1 Veld en opstelling → 2 Spelers → 3 Spullen → 4 Pijlen en uitleg*. Per stap ziet het paneel alleen wat bij die stap hoort.
- **Voordelen:** heel duidelijk voor beginnende trainers; volgorde zoals je een vorm opbouwt.
- **Nadelen:** trager voor wie snel wil wisselen (een pijl tekenen terwijl je spelers neerzet).
- **Advies:** zou ik niet doen als hoofdindeling; eventueel later als *Hulpmodus* voor nieuwe trainers.
