# Oefenvormtypes en classificatie: voorstel (27-10-2026)

*Dit is een voorstel, geen besluit. De voorbeelden staan in deze map (`mk-*.png`, telefoon 390 px). Aanleiding: de aanvraag "Uitbreiding databank met oefenvormtypes". Er verandert niets in productie zonder akkoord.*

## Advies in het kort
- **Overnemen:**
  - vaste ID's met een losse weergavenaam;
  - één hoofdtype plus extra typen en vrije tags;
  - weerstand, speelrichting, doelen en omschakeling als aparte eigenschappen;
  - leerdoelen per opleidingsprofiel;
  - JSON-import;
  - oude vormen blijven geldig.
- **Anders doen:**
  1. Op het scherm **8 hoofdtypes** in plaats van 16. De 16 blijven bestaan als *meer precies*.
  2. **Weerstand rekent ClubComm uit de aantallen** (2 tegen 1 = overtal). Je kiest het niet apart.
  3. **De methodische fase hoort bij het onderdeel in de training, niet bij de vorm.** Dezelfde rondo is in de ene training oefenleer en in de andere toepassing.
  4. Teamtaak, spelprobleem en spelprincipe verschijnen pas als het profiel van de club ze heeft (DCG: nog leeg).
  5. Favoriete zoekopdrachten nog niet: met minder dan 50 eigen vormen is dat overkill. Wel bij een clubbank.
- **Volgorde in het venster (zoals een trainer denkt):** leerdoel → aantallen (weerstand) → type → speelrichting, doelen en omschakeling → afmeting. Alles mag leeg blijven.

## Overlap: 16 categorieën → 8 hoofdtypes
| Hoofdtype (op het scherm) | Valt eronder (*meer precies*) | Waarom samen |
|---|---|---|
| Droog / techniek | droge vorm, technische oefenvorm, loop- en combinatievorm, bewegingsscholing | Allemaal zonder directe tegenstander. *Droog* is eigenlijk een weerstand: dat volgt al uit "0 verdedigers". |
| Passeer- en duelvorm | 1 tegen 1, 2 tegen 1, 3 tegen 2 | Kleine aantallen met een duel |
| Rondo | rondo | Eigen herkenbare vorm |
| Positiespel | positiespel | Balbezit met zones en rollen |
| Partijvorm | partijvorm, small-sided game, spel- en wedstrijdvorm | Een 4 tegen 4 is alle drie: één type, de aantallen zeggen de rest |
| Afwerkvorm | afwerkvorm | Doel = scoren |
| Patroon | opbouw- en aanvalspatroon, linie- en teamtactisch, stroom- en golfvorm | Ingestudeerde looplijnen en linies |
| Keeper | keepersvorm | Eigen doelgroep |
| *(geen type)* | **schakelvorm** | Dit is een **kenmerk** (*met omschakeling*) dat bij een duel, rondo, positiespel of partij kan horen |
| *(geen type)* | **spacing** | Dit is een **plek in de training** (tussen twee onderdelen), geen soort vorm |

## Datamodel (in de bestaande rij `vormen`, scope `eigen`: geen nieuwe tabel en geen rechtenwijziging)
```json
{
  "type": "duel",
  "precies": ["schakel"],
  "tags": ["dreigen"],
  "aantal": { "aanval": 2, "verdediging": 1, "neutraal": 0, "keepers": 0 },
  "weerstandExtra": null,
  "richting": 1, "doelen": true, "omschakeling": false,
  "afmeting": "20 × 15 m",
  "koppelingen": { "dcg": { "primair": "ll-1v1-aanvallend", "ook": ["ll-passen"] } }
}
```
- **Catalogus van de types:** `supabase/catalogus/vormtypes.json` (schema `clubcomm-vormtypes` v1). Elk type heeft een vaste ID, een naam, een hoofdtype en synoniemen (zoeken op "SSG" vindt Partijvorm). Gelijk voor alle clubs, alleen lezen, net als de profielen (Besluit 123). Een nieuw type = een regel erbij, geen nieuwe code.
- **Onbekende ID** (bijvoorbeeld uit een import): de vorm blijft geldig en toont *overig*.
- **Weerstand** wordt berekend, niet opgeslagen:
  - 0 verdedigers = zonder;
  - minder verdedigers dan aanvallers = overtal (vanuit de aanvallers, het trainingsdoel);
  - gelijk = gelijk;
  - meer verdedigers = ondertal.

  *Passief*, *met afleiding* en *wisselend* kies je zelf.
- **Methodieken niet vermengen:** leerdoelen staan per profiel-ID in `koppelingen`. DCG toont alleen `dcg`, Swift alleen `knvb`. Een vorm kan in beide gebruikt worden, elk met eigen koppelingen.
- **Huidige gegevens:**
  - `soort` wordt omgezet naar `type`: droog → Droog, positie → Positiespel, partij → Partijvorm. *Spacing* blijft een plek in de training.
  - `leerdoelen` wordt omgezet naar `koppelingen.dcg`. De oude velden blijven gelezen worden, zodat er niets ongeldig wordt.
- **Import uit ChatGPT of Claude:** hetzelfde JSON-formaat (`clubcomm-vorm` v1). ClubComm controleert de ID's tegen de catalogus en het profiel en toont eerst een voorbeeld vóór het opslaan.

## Koppeling met trainingsdagen
- Een onderdeel in een training krijgt:
  - `blok` (A · B · partij; de code A1, A2 of S ontstaat vanzelf);
  - `fase` (uit het profiel: oriëntatie, oefenleer, toepassing);
  - `variant` (de context vorm).
- **Wat het oplevert:** ClubComm telt per maand **minuten per leerdoel** (bijvoorbeeld *passeren 48 min, verdedigen 0 min*) en signaleert een leerdoel dat lang niet terugkwam. Dat past bij *cyclisch werken* in het DCG-profiel.

## Filters in Mijn vormen
- Zoekbalk, plus filterchips voor wat je het meest gebruikt: **past bij X spelers** (staat vanzelf aan bij de training), type, weerstand, leerdoel en ≤ minuten.
- *Meer:* fase, speelrichting, omschakeling. Combineerbaar, met de knop *Wis*. Wat niet past, staat ingeklapt onderaan.
- Leeftijd volgt vanzelf uit het team.
- Materiaal en favoriete zoekopdrachten: later, bij de clubbank.
