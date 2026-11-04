# Ontwikkelvoorstel: trainingsmodule en periodisering laten aansluiten op de methodiek (Spoor 3, 04-11-2026)

*Alleen analyse. Er is **niets** veranderd aan code, profielen, database, migraties of productie. Dit is een voorstel ter bespreking; elke stap heeft eerst jouw akkoord nodig (en een besluit, bij maat M of L).*

**Gelezen:** CLAUDE.md, `docs/kaart.md`, `docs/besluiten.md` (121–145, Afgewezen ideeën), `docs/architectuur.md`, `docs/sporen.md`, `docs/productie-en-groei.md`, kerndocument v1.0, `supabase/profielen/dcg.json` en `knvb-2026.1.json`, `public/app/training.js` en `periodisering.js`, de gebruiksgegevens van DCG en Swift (alleen gelezen), en de vier documenten: Leerlijn v2, Matrix v3 (KNVB-geijkt), Compacte structuur v1, Stap 2 (verfijning zes gereedschappen).

**Rechtzetting:** in mijn feedback op Leerlijn v2 schreef ik dat de themalessen in het DCG-profiel leeg waren. Dat klopt niet. Er staan **6 onderwerpen** in, met status *eigen*: opbouwen tegen twee of drie drukzettende spelers, de rol van de nummer 6, vrijlopen en aanspeelbaar worden, passlijnen herkennen, jagen en de bal terugveroveren, en positiewisselingen. De documenten noemen een andere route van **11 lessen** (Samen op reis … Teamtactiek). Dat verschil staat in B.

**Rechtzetting 2 (04-11, na het meten voor oplevering 1):**
- De omschakelcodes `tf-omsch-*` worden in **geen** weekplan of training gebruikt; ze staan alleen in het profiel.
- De minuten in Lijn volgen de **koppeling van een vorm aan een gereedschap**, niet de vaardigheden. Een vaardigheid anders indelen (bijvoorbeeld de derde man) verandert dus geen minuten.
- *Beschermen en vrijmaken* valt volgens jouw correctie helemaal binnen 1v1 aanvallend.

Zie `voorstel-spoor1-begrippenlijst.md`. Waar dit document iets anders zegt (B2, E), geldt de begrippenlijst.

---

## Kern in vijf zinnen

1. De **bediening** van ClubComm (Lijn, Plannen, Week, Vormenbank, trainingskaart, evaluatie) is goed genoeg voor alle drie de situaties. Wat ontbreekt, is vooral **inhoud in het profiel** en een paar **velden die al in de documenten staan, maar nog niet in de app** (teamtaak, accent per plek).
2. **Situatie A (club zonder methodiek) werkt vandaag niet methodisch:** de KNVB-standaard staat wel in de repository, maar wordt niet geladen. Daarom ziet Swift alleen een vrij weekthema.
3. De vier DCG-documenten **zijn het onderling nog niet eens** over namen, blokletters, teamtaken en de evaluatievragen. Bouw daarom eerst een **mal** (welk soort veld) en zet pas daarna de **inhoud** (welke woorden) in het DCG-profiel, als Spoor 1 de keuze heeft gemaakt.
4. Er is **geen nieuwe generator of invoerpagina** nodig. Een periode aanmaken kan met wat er al is: teams en trainingsdagen (Besluit 136), de CSV-import en het weekvoorstel op de trainingskaart (Besluit 144). Er moet één ding bij: een **korte start met vijf keuzes** die een bewerkbaar concept maakt.
5. **Volgorde:** eerst de KNVB-standaard laden (A gaat werken), dan teamtaak en accent per plek als optionele profielvelden, dan de korte start, en pas daarna de weekevaluatie.

---

## A. Huidige situatie (onderbouwd)

Legenda: ✅ werkt · ◐ deels · ✖ ontbreekt.

| Onderdeel | Status | Onderbouwing (waar in de app of het profiel) |
|---|---|---|
| **2 teamfuncties** (aanvallen, verdedigen) | ◐ | DCG-profiel heeft er **4**: `tf-aanvallen`, `tf-verdedigen`, `tf-omsch-va`, `tf-omsch-av`. Omschakelen is dus als functie opgenomen. In het KNVB-bestand staan 5 namen op status *controleren* (opbouwen, scoren, storen, doelpunten voorkomen, omschakelen). Daarin lopen teamtaken en teamfuncties door elkaar. |
| **4 teamtaken** (opbouwen, scoren / storen, voorkomen) | ✖ | Er is geen laag *teamtaak* in het profiel of in de code. De CSV heeft één kolom `teamfunctie`. |
| **Voetbaluitdaging** (vast of zelf geformuleerd) | ◐ | Hoofdthema en dagthema, `probleemTekst`, gedrag en informatie in het weekplan en op de trainingskaart. De 8 voetbalproblemen staan als keuzelijst in het profiel. Een vrij geformuleerde uitdaging kan als tekst. Er is geen bibliotheek met voorbeeldsituaties (en die is ook niet nodig, zie C). |
| **Zes gereedschappen** | ✅ | 6 leerlijnen met 38 vaardigheden in het DCG-profiel. Minuten per gereedschap in Lijn (Besluit 141). |
| **Verfijning Stap 2** (bijvoorbeeld *vrijmaken*, *beschermen* als accent) | ◐ | *Beschermen* bestaat als vaardigheid (`vh-beschermen`), *vrijmaken* niet (wel `vh-vrijmaken-uit-de-dekkingsschaduw`). Stap 2 verschuift enkele vaardigheden (zie B). |
| **Scannen** | ◐ | Alleen via het veld *informatie* (welke informatie neemt de speler op). Het is geen eigen accent en wordt niet geteld. |
| **Gezamenlijke handelingen** | ◐ | De 4 handelingsketens staan in het profiel en kunnen per training worden gekozen. Ze worden niet geteld in Lijn. |
| **Positiegebonden handelingen** | ✖ | Er is geen veld *positie* of *linie*, niet in het profiel en niet op de vorm. |
| **Leerniveaus** (5) | ✅ | Staan in het profiel en zijn te kiezen per plek (`niveau`). Ze worden bewaard bij het verplaatsen (PR #107). |
| **A/B/C-blokken** | ◐ | De app kent Start · A · B · S · P. *P* heet in de app "Toepassing · partij". De documenten noemen dat blok C. De blokcodes en `GROEPNAAM` staan **in de code**, niet in het profiel (architectuur §5). |
| **Spacing** | ✅ | Spacing-modellen in het profiel, sjablonen `dcg-75` en `dcg-75-afwisselend`, het veld `spacing` per plek. |
| **Trainingsaccent per plek** (zoals Beschermen, Vrijmaken) | ✖ | Besluit 144 zegt "komt later". Het accent volgt nu uit de vaardigheden van de gekozen vorm, en dat is volgens de Afgewezen ideeën bewust níet de bedoeling ("een accent is een keuze van de trainer"). |
| **Individuele doelen ↔ teamtaken ↔ periodisering** | ✖ | Ontwikkelgesprekken (Besluit 67–72) en de trainingsmodule zijn niet met elkaar verbonden. Er is geen teamtaak die beide kan koppelen. |
| **Evaluatie: gepland** | ✅ | Het weekplan en de trainingskaart, met `origineel` als momentopname. |
| **Evaluatie: aangeboden** | ✅ | De status per training, de echte minuten (zeker vanaf 30-10) en "wat anders". |
| **Evaluatie: toegepast** (transfer naar de partij of wedstrijd) | ◐ | Er is een vraag `ev-transfer`, en er zijn 18 observatiepunten, maar **0 zijn er beoordeeld**. De weekevaluatie (stap 2) is niet gebouwd. Van de 11 profielvragen staan er 3 open via de vaste lijst `EV_OPEN` in `training.js:229`. |
| **Periodisering jaar → fase → week → training** | ◐ | Werkt voor DCG via de CSV-import (vaste `KOLOMMEN`, `periodisering.js:230`) en het weekplan. Clubs zonder methodiek krijgen alleen het weekthema (`CC.trWeekthema`, `periodisering.js:215`): vrije tekst voor 7 weken. |
| **KNVB-standaard voor clubs zonder methodiek** | ✖ | `knvb-2026.1.json` wordt niet geladen (`opslag.js` leest alleen profielen uit de database). De inhoud staat bijna helemaal op *leeg* of *controleren*. De evaluatievragen zijn platte tekst, terwijl de code objecten met `id` en `schaal` verwacht. |

**Gebruik (alleen gelezen):**
- **DCG:** 3 echt ingevulde trainingen (27/29/30 okt), 23 concepten uit de CSV, 8 weekplannen, 12 actieve vormen met tekening (vaardigheden op 7 daarvan). Varianten zijn nooit gekozen.
- **Swift:** 215 activiteiten, 2 trainingsplannen, geen profiel.

## B. Verschillenanalyse

### B1. De vier documenten onderling, en ten opzichte van het kerndocument en de app

| Onderwerp | Leerlijn v2 | Matrix v3 | Compact v1 | Stap 2 | Kerndocument v1.0 / app |
|---|---|---|---|---|---|
| Lagen boven de gereedschappen | teamfunctie + teamtaak | 2 functies + 4 teamtaken (KNVB) | 2 + 4 (KNVB) | n.v.t. | geen teamtakenlaag; het profiel heeft 4 functies, waarvan 2 omschakelen |
| Namen en bedoeling van de teamtaken | eigen bewoording | KNVB-bewoording | KNVB-bewoording | — | — |
| De 8 categorieën heten | voetbalproblemen | **probleemcategorie** | **ontwikkelgebied** | — | **voetbalproblemen** |
| Laatste blok | C | C | "C = Toepassing · partij" | — | **P** "Toepassing · partij" |
| Afronding | apart blok | vervallen | vervallen | — | blok *overig* in het sjabloon (7 min.) |
| Evaluatievragen | 4 | 5 | 3 | 4 | **10–11** (kerndocument en profiel) |
| Verdedigend accent | Vertragen | Afremmen | Afremmen | Afremmen | `vh-vertragen` |
| Themalessen | — | route van 11 | route van 11 | — | **6 onderwerpen** in het profiel |
| Omschakelen | eigen teamfunctie | binnen de teamtaken | binnen de teamtaken | — | kerndocument regel 135: "geen apart omschakelgereedschap"; profiel: 2 omschakelfuncties |
| Scannen, positie, spacing | gedeeltelijk | ja | ja | scannen per gereedschap | geen scannen of positie; spacing wel |

**Botsingen in de termen (belangrijk voor de bediening):**
- De voorgestelde **trainerscyclus "Herkennen → Kiezen → Ontwikkelen → Beoordelen"** gebruikt dezelfde woorden als de **leerniveaus Herkennen en Kiezen**. Een trainer ziet dan twee keer *Herkennen* met een andere betekenis. Mijn advies: noem de cyclus in de app niet zo. Gebruik de **vier vragen** als koppen (*Waaraan werken we? Welk gedrag? Welke vormen en weerstand? Wat zagen we, en wat is de volgende stap?*).
- **C tegenover P:** dat is een kwestie van naam, niet van gegevens. Als de blokcode uit het profiel komt (architectuur §5), kan DCG "C" tonen en houdt een andere club "P".

### B2. Wat geraakt wordt als de woorden veranderen

| Wijziging | Geraakt (DCG) | Gevolg als je ids hernoemt | Advies |
|---|---|---|---|
| Omschakelfuncties eruit (`tf-omsch-va`, `tf-omsch-av`) | 8 weekplannen en trainingen die dit id dragen, en de CSV-kolom `teamfunctie` | Oude weken tonen een onbekend id | **Ids niet weghalen.** Zet ze op status *vervallen* (verborgen bij kiezen, leesbaar bij oud werk). |
| `vh-derde-man`, `vh-overlap-en-underlap` verschuiven | 1 vorm ("Derde man – Inspelen…") en de minuten in Lijn | Minuten verschuiven naar een ander gereedschap | Het id blijft. Alleen de **leerlijn waaronder het valt** verandert, en dat telt vanaf de profieldatum (zoals bij `ZEKER_VANAF`). |
| Vertragen → Afremmen | `vh-vertragen` op vormen | Geen, als alleen de naam verandert | Alleen het `label` aanpassen. |
| 8 problemen anders noemen | Keuzelijsten, het weekformat | Geen (de ids blijven) | Naam in het profiel. |
| Blok P → C | Sjabloon `dcg-75`, `GROEPNAAM` in de code | Oude trainingen hebben de code `P` | De code blijft `P`; de **getoonde naam** komt uit het profiel. |
| Evaluatievragen 11 → 3–5 | `ev-*`-antwoorden op de 3 echte trainingen | Antwoorden zonder vraag | Oude vragen op *vervallen*; `EV_OPEN` uit het profiel halen. |

**Regel die alles veilig houdt:** *ids zijn voor altijd, labels mogen veranderen, en weghalen = status vervallen.* Daarmee blijven bestaande oefeningen, trainingen en periodisering behouden. Er is dan geen migratie van trainingsgegevens nodig.

## C. Voorstel voor de algemene periodisering

**Uitgangspunt:** één bediening. Wat een club ziet, hangt af van wat er **in het profiel** staat, niet van de code. Rinus geeft de inspiratie (eerst de wedstrijd, dan het voetbalprobleem, dan oefenen, dan terug naar de wedstrijd). We bouwen Rinus niet na en we bieden geen cursussen (Afgewezen ideeën, Besluit 121).

### C1. Korte start: vijf keuzes, daarna een bewerkbaar concept

Plek: **Plannen → "Nieuwe periode"** (de knop bestaat nog niet; het venster gebruikt `CC.sheet`, dus er komt geen nieuw scherm).

| # | Keuze | Standaard | Bron |
|---|---|---|---|
| 1 | Team (leeftijd volgt daaruit) | het eigen team | Besluit 136 |
| 2 | Trainingsdagen en duur | uit het teamschema | Besluit 136 |
| 3 | Periodelengte | 6 weken (keuze 4 / 6 / 8) | nieuw, alleen in de korte start |
| 4 | Profiel | dat van de club, anders de KNVB-standaard | Besluit 123 |
| 5 | Waaraan werken we (teamtaak of thema) | eerste teamtaak uit het profiel, of vrije tekst | profiel / nieuw veld |

Het resultaat is een **concept van weekplannen** van hetzelfde soort als de CSV-import nu maakt. Alles is bewerkbaar in Week, en de trainingskaart toont het als **weekvoorstel** (dat vult nooit vanzelf in, Besluit 144). Observatie en evaluatie zitten al in de trainingskaart en de terugblik. Bijsturen = het volgende weekplan aanpassen.

### C2. Drie gebruikers, dezelfde schermen

| | Beginnende trainer | Ervaren trainer | HJO / technisch hart |
|---|---|---|---|
| Start | korte start, alles op standaard | korte start of CSV | maakt per leeftijd een **periodekader** (teamtaak + volgorde) |
| Per week | ziet het weekvoorstel, kiest vormen uit de vormenbank | past het weekplan aan, kiest het accent per plek | kijkt mee (Besluit 134/135) |
| Na de training | 3 open vragen + status | idem, meer vragen in te klappen | ziet gepland / aangeboden / toegepast per team |
| Ziet niet | leerniveaus, spacing (tenzij in het profiel) | — | geen individuele beoordeling (Besluit 99) |

### C3. De drie situaties

| | A. Geen methodiek | B. Eigen profiel | C. DCG O12/O13 |
|---|---|---|---|
| Profiel | KNVB-standaard (alleen-lezen) | afgeleid of eigen | eigen (Spoor 1-inhoud) |
| Waaraan werken we | 4 KNVB-teamtaken + vrije tekst | eigen lijst | teamtaken + 8 voetbalproblemen |
| Gereedschappen | KNVB-voetbalhandelingen (lijst nog vast te stellen) | eigen | 6 gereedschappen |
| Blokken | Start · A · B · P | eigen namen | Start · A · B · S · C, spacing |
| Accent per plek | uit (veld leeg) | aan als het profiel accenten heeft | aan (incl. Beschermen, Vrijmaken) |
| Evaluatie | 3 vragen | eigen set | eigen set (Spoor 1 kiest 3–5) |

### C4. De vier vragen van de trainer, en waar ze al staan

| Vraag | Trainingskaart (Besluit 144) | Extra invoer nodig? |
|---|---|---|
| Waaraan werken we? | regel *Wat* (+ herkomst Periodisering/Weekvoorstel) | nee; alleen de teamtaak toevoegen als keuze in dezelfde regel |
| Welk gedrag? | regel *Welke* (gedrag/informatie) | nee |
| Welke vormen en weerstand? | de blokken + *Niveau* | nee; het accent per plek komt in de plek, niet als nieuw veld bovenaan |
| Wat zagen we, wat is de volgende stap? | terugblik + *Mee uit vorige* | nee; de weekevaluatie (stap 2) bundelt dit per week |

**Conclusie:** de trainingskaart dekt de vier vragen al. Er is **geen** nieuw scherm, geen verplicht veld en geen dubbele invoer nodig.

## D. Gebruikersscenario (van een periode aanmaken tot evalueren)

*Verzonnen trainer "Joris", O13 van een club zonder methodiek (situatie A); daarna dezelfde stappen bij DCG.*

1. **Maandag, Plannen → Nieuwe periode.** Joris ziet zijn team, di/do 75 minuten en 6 weken al ingevuld. Bij *Waaraan werken we* kiest hij "Opbouwen" (KNVB-teamtaak). Hij tikt op **Maak concept**.
2. **Concept:** 6 weekplannen met als hoofdthema "Opbouwen" en als standaard voor elke week het voetbalprobleem *leeg*. In Week ziet hij per week "Concept · aanpasbaar".
3. **Dinsdag, de trainingskaart:** regel *Wat* toont "Opbouwen · Weekvoorstel". Hij neemt het over met één tik, kiest uit de vormenbank een rondo (A) en een positiespel (B) en speelt een partij (P).
4. **Na de training:** status *gegeven*, de echte minuten (de tijdsbalk), 3 open vragen: *Waar liep het vast? Zag je het gedrag? Wat neem je mee?*
5. **Donderdag:** *Mee uit vorige* toont zijn antwoord van dinsdag. Hij past het weekplan van week 2 aan ("meer druk").
6. **Einde van week 1, weekevaluatie (stap 2):** gepland (2 trainingen op Opbouwen) / aangeboden (2 gegeven, 118 van de 150 min.) / toegepast (de wedstrijd van zaterdag: "rustiger achterin, maar nog veel lange ballen"). → *Volgende stap* gaat naar het weekplan van week 2.
7. **Bij DCG (C)** gaat het precies zo. Het profiel voegt alleen keuzes toe: het voetbalprobleem, 2 gereedschappen, het leerniveau, het accent per plek (Beschermen) en spacing. Dezelfde knoppen, dezelfde volgorde.

## E. Technische gevolgen

| Soort | Wat | Afhankelijk van | Risico |
|---|---|---|---|
| **Profielinhoud** (geen code) | DCG: labels (Afremmen, C), omschakelfuncties op *vervallen*, de evaluatieset van 3–5, de teamtaken, de accentenlijst | Keuze van Spoor 1 (B1) | Laag, mits de id-regel wordt gevolgd. **Profielwijziging = akkoord nodig.** |
| **Profielinhoud** | KNVB-standaard: minimale set (4 teamtaken, voetbalhandelingen, 3 evaluatievragen als objecten, sjabloon Start·A·B·P) | Bronnen KNVB controleren | Middel: inhoud moet kloppen met de KNVB; anders blijft de status *concept* |
| **Bestaande functie aanpassen** | `opslag.js`: de KNVB-standaard laden als terugval voor clubs zonder profiel | — | **L**: wie mag het profiel lezen (nu scope `hjo`); trainers moeten een alleen-lezen versie zien. Rechtentest en clubscheiding nodig. |
| Bestaande functie aanpassen | `EV_OPEN`, `GROEPNAAM`, `TYPE_BLOK` uit het profiel lezen, met de huidige waarden als terugval | — | Laag; tests per club |
| Bestaande functie aanpassen | Lijn: één scherm in plaats van twee (`trMijnLijn` tegenover de weekthema-tabel) | profiel geladen voor A | Middel (M); voorbeeld op 390 px nodig |
| Bestaande functie aanpassen | CSV: kolom `teamtaak` optioneel, `KOLOMMEN` uit het profiel | teamtaakveld | Laag; oude CSV blijft werken |
| **Nieuw** | Optionele lijsten in het profiel: `teamtaken`, `accenten` (met `leerlijn` en `kant`) en `status: vervallen` | — | Laag (jsonb, geen databasemigratie) |
| **Nieuw** | Accent per plek op de trainingskaart (een veld in de plek; bewaard bij verplaatsen → toevoegen aan `MEE`) | `accenten` in het profiel | M; Besluit 144 wordt aangevuld |
| **Nieuw** | Korte start "Nieuwe periode" (`CC.sheet`, schrijft concept-weekplannen zoals de CSV) | teams/dagen (136), profiel | M; mag bestaande weekplannen **nooit** overschrijven (alleen lege weken vullen, of eerst vragen) |
| Nieuw (later) | Weekevaluatie (stap 2) | accent en teamtaak, zodat er iets te tellen is | M; wacht op jouw test van week 45 |

**Migratierisico's:** geen databasemigratie nodig (alles in `rij.data` jsonb). Het risico zit in **betekenis**: als een id van leerlijn wisselt, verschuiven de minuten in Lijn. Oplossing: de leerlijn van een vaardigheid onthouden per profielversie, of de wisseling pas laten gelden vanaf een datum. De 8 weekplannen en migratie 033 blijven buiten deze opdracht (eerder afgesproken).

## F. Ontwikkelvolgorde (kleine stappen)

| # | Wat | Waarom | Voor wie | Hergebruik | Risico | Toetsing | Maat |
|---|---|---|---|---|---|---|---|
| 0 | **Spoor 1 kiest de woorden** (B1): 2+4, de namen, C/P, Afremmen, evaluatie 3–5, themalessen 6 of 11 | Zonder keuze bouw je op zand | DCG | de documenten | geen (geen code) | jouw akkoord op een lijstje | — (Spoor 1) |
| 1 | **Profielmal uitbreiden:** `teamtaken`, `accenten`, `status: vervallen`, de getoonde bloknamen, de evaluatieset, alles optioneel | Eén mal voor A, B en C | alle clubs | `zichtbaar()`, `ond()` | laag | unit-tests: profiel zonder deze velden = de app precies zoals nu | M |
| 2 | **KNVB-standaard minimaal vullen en laden** als terugval (alleen lezen voor trainers) | Situatie A gaat werken; Swift krijgt structuur | Swift en nieuwe clubs | `profiel()`, Besluit 123 | **L** (rechten) | rechtentest (trainer leest wel, wijzigt niet), clubscheiding, Swift en DCG apart | L |
| 3 | **Code → profiel:** `EV_OPEN`, `GROEPNAAM`, `TYPE_BLOK` met terugval | DCG "C", andere club "P"; evaluatie per club | alle clubs | bestaande constanten als standaard | laag | snapshot-tests van de kaart: DCG, Swift, zonder profiel | S/M |
| 4 | **Teamtaak als keuze** in Week, op de trainingskaart (regel *Wat*) en in de CSV (optioneel) | Koppelt periode ↔ training ↔ later de individuele doelen | clubs met teamtaken in het profiel | weekplan, CSV, herkomstlabels | laag | oude CSV blijft werken; de oude `tf-omsch-*` weken blijven leesbaar | M |
| 5 | **Accent per plek** (Beschermen, Vrijmaken …) | "Komt later" uit Besluit 144; maakt de training stuurbaar | clubs met `accenten` | de plek, `MEE` (PR #107) | laag | verplaatsen houdt het accent; geen accent = niets te zien | M |
| 6 | **Korte start "Nieuwe periode"** (5 keuzes → concept) | Beginnende trainer heeft een periode in 1 minuut | alle clubs | CSV-schrijfpad, teams/dagen | middel (overschrijven) | test: bestaande weken blijven onaangeroerd | M |
| 7 | **Eén Lijn-scherm** voor alle clubs | Twee Lijn-schermen = verwarring | alle clubs | `trMijnLijn` | middel | voorbeeld op 390 px, DCG-cijfers gelijk aan nu | M |
| 8 | **Weekevaluatie** gepland / aangeboden / toegepast | Sluit de cyclus | alle clubs | terugblik, observatiepunten | middel | na jouw test van week 45 | M |

Stap 1 en 3 kunnen samen in één pull request. Stap 2 is de enige L-stap en krijgt een eigen voorstel met de privacy- en rechtencontrole.

## Beslispunten (maximaal 5)

1. **Teamfuncties en teamtaken:** wordt het model *2 teamfuncties + 4 teamtaken* (KNVB) de standaard in de profielmal? En gaan de omschakelfuncties van DCG naar status *vervallen* (blijven leesbaar, verdwijnen uit de keuzes)?
2. **KNVB-standaard laden voor clubs zonder profiel:** mag ik hiervoor een L-voorstel maken (trainers kunnen het alleen lezen), met als eerste gebruiker Swift?
3. **Woorden in de app:** de cyclus Herkennen/Kiezen niet als kop gebruiken (wel de vier vragen); bloknaam en de naam van de 8 categorieën uit het profiel (DCG kan "C" en "probleemcategorie" kiezen). Akkoord?
4. **Evaluatie:** de korte evaluatieset (welke vragen open staan) komt uit het profiel in plaats van uit de code. DCG kiest in Spoor 1 tussen 3 en 5 vragen. Akkoord?
5. **Volgorde:** eerst de mal + het accent per plek + de teamtaak (stap 1–5), en pas daarna de korte start (6) en de weekevaluatie (8)? Of wil je de korte start naar voren halen?
