# Stap 1 — De acht DCG-weekplannen: oud en nieuw (05-11-2026)

*Spoor 1-inhoud (DCG O13), technisch via het DCG-clubprofiel; het script is Spoor 3. **Niets uitgevoerd.** De database is alleen gelezen.*

## Hoe dit is gecontroleerd

1. **Het script is niet uitgevoerd.** Ik heb dezelfde stappen als het script (`supabase/scripts/2026-10-30_dcg_weekplannen_correctie.sql.voorstel`) als **alleen-lezen vraag** aan de productiedatabase gesteld. De database rekende uit hoe elk weekplan er na het script uit zou zien, zonder iets op te slaan.
2. **Het script zou nu werken.** De controlesom (md5) van alle 8 weekplannen in productie is precies gelijk aan de versie die in het script staat. Het script controleert dat zelf ook en stopt anders zonder iets te veranderen.
3. **Wat buiten het script blijft, is gecontroleerd en verandert niet.** Voor alle 8 weekplannen geldt:
   - alles buiten `methodiek`, `wedstrijd`, `dagen` en `stempel` is gelijk;
   - in `methodiek` verdwijnen alleen de 3 dagvelden;
   - in `wedstrijd` komt alleen `context` erbij.
4. **De bronnen kloppen.**
   - De 6 wedstrijdteksten zijn precies het hoofdthema van de wedstrijdregels in `periodisering-o13-import-CONCEPT.csv`.
   - De weggehaalde dagwaarden van week 45 t/m 51 staan **al letterlijk** in de concepttraining van de eerste trainingsdag van die week (vergeleken: hoofdthema, leerniveaus en leerroute zijn gelijk).
5. **Trainingen raakt het script niet aan.** Dat geldt ook voor de gegeven trainingen van 27, 29 en 30 oktober en 3 november; die laatste heeft een vastlegging (Besluit 147).

## Wat er per weekplan verandert

**Er gaan drie dagvelden weg.** Die gelden maar voor één training, niet voor de hele week:
- *hoofdthema*;
- *leerniveaus*;
- *leerroute*.

**Wat er bij de wedstrijd bijkomt:** de *wedstrijdsituatie* (`context`).

| Week | Weekplan | Weggehaald (oude waarde) | Waar die waarde blijft | Erbij: wedstrijdsituatie |
|---|---|---|---|---|
| 44 | `wk-O12-1-2026-10-26` | **Technische onderbouw opbouwen** · Uitvoeren → Herkennen · *Gerichte vorm; eerste contact en passkwaliteit; laag tempo als nodig* | Bij **do 29-10** als *"periodisering voor deze dag (niet toegepast)"*. Op die dag was het jouw eigen training. | za 31-10: *Opbouwen achteruit: eerste druklijn uitspelen* |
| 45 | `wk-O12-1-2026-11-02` | **Passingkwaliteit en timing van vrijlopen** · Uitvoeren → Herkennen · *A1/B1 als techniek; A2/B2 met passende druk en spacing of interleaving* | in de training van **di 03-11** (gelijk) | za 07-11: *Vrije speler herkennen in de opbouw* |
| 46 | `wk-O12-1-2026-11-09` | **Vrijkomen en gerichte pass onder tempo** · Uitvoeren → Herkennen · *Veel herhalingen met varianten naar niveau* | in de training van **di 10-11** (gelijk) | za 14-11: *Van opbouwen naar middenveld: voordeel benutten* |
| 47 | `wk-O12-1-2026-11-16` | **1v1 richting doel en tijdig vrijlopen** · Uitvoeren → Kiezen · *Individueel 1v1 en simpele afwerkvervolgactie* | in de training van **di 17-11** (gelijk) | za 21-11: *Van voordeel naar scoringskans* |
| 48 | `wk-O12-1-2026-11-23` | **1v1 verdedigen: gecontroleerd benaderen** · Uitvoeren → Herkennen · *Houding en afstand met passende weerstand* | in de training van **di 24-11** (gelijk) | za 28-11: *Samen jagen: druk op bal en as beschermen* |
| 49 | `wk-O12-1-2026-11-30` | **Controle naar balverovering** · Uitvoeren → Herkennen · *Herken slechte aanname; 1v1 met drukmoment* | in de training van **di 01-12** (gelijk) | za 05-12: *Bal veroveren en eerste actie na winst* |
| 50 | `wk-O12-1-2026-12-07` | **Eerste contact en bal afschermen** · Uitvoeren → Herkennen · *Verschil technische beheersing; niveauvariaties* | in de training van **di 08-12** (gelijk) | geen wedstrijd in de periodisering |
| 51 | `wk-O12-1-2026-12-14` | **Afwerken: moment en uitvoering** · Uitvoeren → Herkennen · *Gericht afwerken met keuze in schotrichting* | in de training van **di 15-12** (gelijk) | geen wedstrijd in de periodisering |

## Wat behouden blijft (alle 8 weekplannen, ongewijzigd)

- **Week en fase:** *wk 44* … *wk 51*, *Fase 1 – concept*.
- **Wat de hele week geldt:**
  - voetbalprobleem (met naam);
  - teamfunctie;
  - gereedschap A en B;
  - ondersteunend (met tekst);
  - gewenst gedrag;
  - relevante informatie;
  - handelingsketen;
  - transfermoment;
  - contrathema;
  - onderbouwing en observatie (leeg).
- **De wedstrijd:** welke wedstrijd erbij hoort (`actId`), de bron en de **3 observatiepunten**, alle nog zonder uitkomst. De tekst en de code van elk punt blijven gelijk.
- **Alles buiten de methodiek:** eigenaar, team, datum, bron.
- **Het stempel** krijgt een nieuwe waarde. Zo ziet de app dat het weekplan bewust is bijgewerkt.

## Wat je daarna anders ziet in de app

**Eerlijke correctie op het verbeteroverzicht.** Daar schreef ik dat de fout *"elke week zichtbaar"* is. Dat klopt niet helemaal. Sinds Besluit 144 laat de trainingskaart de drie dagvelden van een weekplan al **links liggen**: ze tellen niet als weekvoorstel (`WEEKVELDEN` in `periodisering.js`). Lijn gebruikt ze ook niet. Het effect is dus kleiner dan ik schreef:

| Waar | Nu | Na de correctie |
|---|---|---|
| Trainingskaart, regel *Waar*, bij elke training in week 44 t/m 49 | *"Wedstrijdsituatie za: nog niet uit de periodisering geladen · 3 observatiepunten"* | *"Wedstrijdsituatie za: **[tekst uit de tabel]** · Periodisering · 3 observatiepunten"* |
| Trainingskaart van **do 29-10** (gegeven, jouw eigen training) | geen regel over de periodisering | *"Periodisering voor deze dag (niet toegepast): Technische onderbouw opbouwen · Uitvoeren → Herkennen"*, als informatie in grijs |
| Lijn, *Je zit in*, weekthema, A/B, minuten | — | **ongewijzigd** |
| Trainingskaarten van de concepttrainingen | dagthema uit de training zelf | **ongewijzigd** |

**Waarom het toch zinvol is:** de oude weekplannen zien er daarna precies zo uit als wat de **huidige** import zou maken (`periodisering.js`, regels 291–295). Code die later weekplannen leest, zoals een weekevaluatie of het KNVB-profiel, vindt dan geen dagwaarden meer die er als weekwaarde uitzien.

## Inhoudelijk akkoord (Spoor 1, 05-11)

- De 6 wedstrijdsituaties zijn akkoord als **geplande** wedstrijdsituaties. Het zijn **geen** vastgestelde wedstrijdevaluaties.
- De dagwaarden van week 44 blijven als *niet toegepast* bij do 29-10 staan. De werkelijk uitgevoerde training blijft leidend.

## Reservekopie en terugzetscript (voorbereid 05-11, niet uitgevoerd)

| Bestand | Inhoud |
|---|---|
| `supabase/backups/2026-11-05_dcg_weekplannen_voor_correctie.json` | **Alleen de 8 weekplannen**, met per rij de controlesom (md5). Gelijk aan productie op 05-11: alle 8 md5's komen overeen. Er staat geen andere rij in en het is geen volledige databaseback-up. |
| `supabase/scripts/2026-10-30_dcg_weekplannen_correctie_terug.sql.voorstel` | Zet de 8 weekplannen terug naar de reservekopie. |

**Waarom het terugzetscript geen later aangepast weekplan kan overschrijven:**
- Elk weekplan wordt alleen teruggezet als het **in zijn geheel precies gelijk** is aan de toestand direct na de correctie (vergelijking van de hele `data`, plus het nieuwe stempel). Een ingevuld observatiepunt, een ander weekthema of een andere wijziging maakt het weekplan anders. Dan stopt het script.
- **Alles of niets:** stopt het bij één weekplan, dan wordt er ook bij de andere niets teruggezet.
- **Gecontroleerd in productie (alleen gelezen):** geen databaseregel (trigger) verandert bij het opslaan de inhoud van een weekplan. `cc_bewaak` zet alleen de kolommen *bijgewerkt* en *door*. De toestand na de correctie is in productie dus precies dezelfde als in de test.

**Getest in een tijdelijke lokale database** (alleen een socket, geen netwerk; daarna weggegooid), gevuld met precies de 8 weekplannen uit productie (md5 gelijk) plus één andere rij:

| # | Situatie | Uitkomst |
|---|---|---|
| 0 | Correctiescript uitvoeren | *"klaar: 8 weekplannen"* |
| 1 | Daarna terugzetten | *"teruggezet: 8 weekplannen"*; alle 8 md5 weer gelijk aan de reservekopie; de andere rij onaangeroerd |
| 2 | Correctie, dan een observatiepunt van wk 46 ingevuld, dan terugzetten | **Gestopt** bij wk 46; niets veranderd, de ingevulde uitkomst blijft staan |
| 3 | Correctie, dan alleen het laatste weekplan (wk 51) aangepast, dan terugzetten | **Gestopt** bij wk 51; ook de eerste 7 zijn niet teruggezet (alles of niets) |
| 4 | Terugzetten zonder dat de correctie is uitgevoerd | **Gestopt**; niets veranderd |

**Risico:** laag. Beide scripts doen alles of niets en controleren eerst de volledige inhoud. Ze raken geen trainingen, uitkomsten of tekeningen.

## Wat ik van je nodig heb

1. ~~Inhoud~~ akkoord (Spoor 1, 05-11). ~~Reservekopie en terugzetscript~~ voorbereid en getest.
2. **Nog open:** een apart akkoord om het correctiescript in productie uit te voeren. Daarna controleer ik de 8 md5's en de trainingskaart van week 46.
