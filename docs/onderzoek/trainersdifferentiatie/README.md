# ClubComm voor verschillende trainers: kritische analyse

*4-11-2026. Spoor 2 (inhoud, Swift) + Spoor 3 (software). **Onderzoek, geen besluit en geen bouwopdracht.** Niets gewijzigd aan code, database, rechten of productie. Namen in de scenario's zijn verzonnen.*

**Centrale vraag:** is ClubComm geschikt voor trainers met verschillende kennis, ervaring, ambitie en tijd, of is het vooral ontworpen vanuit de ervaren trainer en de Hoofd Opleiding?

**Kort antwoord:** de **trainingsmodule** is ontworpen vanuit de **ervaren, methodisch werkende trainer**, met de DCG-methodiek als model. De **begeleidingsmodule** is ontworpen vanuit de **HJO**. De beginnende vrijwilliger wordt goed beschermd tegen verplichtingen: niets is verplicht, en een trainer die "voor zijn plezier" traint krijgt geen traject. Maar met de **inhoud** helpt de app hem niet: hij begint altijd met een lege vormenbank en een lege training. *Mag leeg blijven* betekent nog niet *wordt geholpen*.

---

## Bronnen, werkwijze en beperkingen

| Bron | Wat | Betrouwbaarheid |
|---|---|---|
| Code `main` (`eb4dcd0`) | `training.js`, `periodisering.js`, `trainers.js`, `begeleiding.js`, `trainer.js`, opleidingsprofielen in `supabase/profielen/` | gelezen; de routes zijn **uit de code geteld, niet met gebruikers getest** |
| Besluiten | 68, 75, 100, 121, 128–144, Afgewezen ideeën | `docs/besluiten.md` |
| Productie, alleen gelezen | alleen **aantallen** per club en soort, en de clubinstellingen (modules, pakket, profiel); geen persoonsgegevens | 4-11 |
| KNVB Rinus | de schermopname die de initiatiefnemer bekeek (Besluit 132, `docs/onderzoek/training-laptop/README.md`); de marktanalyse van 27-10 (`docs/trainingsmodule-markt.md`); openbare KNVB-pagina's via zoekresultaten | **`rinus.knvb.nl` en `knvb.nl` waren vanuit deze sessie niet bereikbaar** (netwerkinstelling). Wat hieronder over Rinus staat, is dus niet opnieuw op de site gecontroleerd. Waar het onzeker is, staat het erbij |

**Statuslabels in dit stuk:** ✅ bestaat · ◐ gedeeltelijk · ✏️ alleen ontworpen (document of demo) · ✖ ontbreekt.

**Wat er in productie staat** (aantallen, 4-11):
| Club | Modules | Opleidingsprofiel | Vormen (alle `eigen`) | Trainingen (alle `eigen`) |
|---|---|---|---|---|
| DCG | training aan | DCG (in de app, uit `dcg.json`) | 17 | 32 |
| Swift | training aan, pakket Trainers begeleiden | **geen** (geen profielrij; het KNVB-bestand staat niet in de database) | 6 | 3 |

Swift heeft dus de trainingsmodule **zonder** leerdoelen, sjabloon of methodiek. Alle vormen en trainingen zijn privé (`eigen`): niemand kan ze met een ander delen.

---

## 1. Wat ClubComm nu per doelgroep ondersteunt

### 1a. Voor wie is het ontworpen? (vraag 1)
**Aanwijzingen dat het voor de ervaren, methodische trainer is ontworpen:**
- **Leeg begin.** Een trainer ziet alleen zijn eigen vormen (`mijnVormen` = eigenaar is ik). Er is geen bibliotheek van de club of de KNVB. Starten kan op drie manieren: met het sjabloon van de club (alleen als het profiel er een heeft: DCG wel, Swift niet), met een eigen eerdere training, of vanuit niets.
- **Vaktaal in het algemene scherm**, ook voor clubs zonder methodiek:
  - *spacing* staat 47 keer in `training.js`, onder meer in de lege training: *"Zet vormen en spacing in de volgorde van de training"*;
  - blokcodes Start · A · S · B · Partij;
  - *Vormenbank*, *Lijn*, *minuten per leerdoel*;
  - *echte minuten: leeg = nog niet gecontroleerd*;
  - *veldtijd − organisatie = oefentijd*.
- **Methodiek op DCG-maat.** Voetbalproblemen, gereedschap, vaardigheden, leerniveaus, handelingsketens, periodisering uit een CSV en de trainingskaart met herkomst (Besluiten 131, 133, 137, 138, 144) zijn gegroeid in de DCG O13-pilot van de initiatiefnemer. Ze tonen alleen als het profiel ze heeft. De **structuur** van het scherm (blokken, spacing, minuten) geldt wel voor iedereen.
- **De Lijn bij Swift** toont: *"Er staan nog geen leerdoelen in het opleidingsprofiel van de club…"*. Voor een trainer is dat een melding over iets wat hij niet kan oplossen.
- **Begeleiding** (Besluiten 99, 100, 134, 143) gaat uit van de HJO: traject, plan per seizoen, vijf KNVB-fasen, observatie in 5 categorieën. De trainer vult in: kennismaking, vragenlijst vooraf en reflectie.

**Aanwijzingen voor de vrijwilliger** (die zijn er ook):
- Principes *zo min mogelijk handelingen voor vrijwilligers* (Besluit 75) en *minder werk* (Besluiten 65 en 68).
- Niets is verplicht. Bij de classificatie van een vorm staat *"Alles mag leeg blijven"*. ClubComm adviseert en blokkeert nooit (Besluit 139).
- In de kennismaking kan een trainer kiezen voor *"Ik train vooral voor mijn plezier"*. Dan staat bij de HJO: *"Dat is prima: geen traject, geen signalen"*.
- Er is een korte vragenlijst met 4 vragen voor starters (Besluit 100).
- Er is een vorm in Rinus-stijl, met *Makkelijker/Moeilijker*, materiaal dat uit de tekening wordt geteld, en printen (Besluit 132).

**Conclusie:** de vrijwilliger wordt **ontzien** (geen plicht, geen signalen), maar niet **geholpen** (geen inhoud). Het platform is gebouwd door en voor iemand die al weet wat een goede training is.

### 1b. Per doelgroep
| Doelgroep | Wat werkt nu | Waar het ophoudt |
|---|---|---|
| **Ouder, geen diploma, breedte, weinig tijd** | rooster, aanwezigheid en het verwachte aantal spelers ✅; een eigen training op het veld printen ✅; geen verplichtingen ✅ | moet elke oefenvorm zelf bedenken en invoeren ✖; vaktaal (spacing, blokken) ◐; geen voorbeeld per leeftijd ✖ |
| **Ervaren breedtetrainer, eigen repertoire** | vormen met tekening, varianten en materiaal ✅; *Kopiëren naar…* en *Eerdere training overnemen* ✅; tijdsbalk ✅ | alles eerst één keer invoeren (de drempel); zijn repertoire blijft privé; collega's hebben er niets aan ✖ |
| **Gediplomeerde selectietrainer, methodisch** | bij DCG: methodiek, periodisering, Lijn, trainingskaart, evaluatie ✅; bij Swift: de planner zonder profiel ◐ | bij Swift geen KNVB-leerlijnen of sjabloon (het profiel is leeg of moet nog gecontroleerd worden) ◐; meerweekse planning alleen via een DCG-CSV ◐ |
| **HJO** | trainersoverzicht, kennismaking, traject, begeleidingsmoment ✅; week (PR #108) ◐ | ondersteuningsbehoefte niet als gegeven ✖; kan trainers geen voorbeeldtrainingen geven ✖ (032 `clubbank` vervalt, besluit 4-11) |

---

## 2. Trainersprofielen: losse kenmerken, geen rangorde (vraag 4)

De kenmerken staan los van elkaar. Een gediplomeerde selectietrainer kan weinig tijd hebben. Een ouder zonder diploma kan veel ambitie hebben. Een oud-speler zonder diploma kan een selectieteam trainen.

| Kenmerk | Opgeslagen? | Waar | Verandert het iets aan het scherm? |
|---|---|---|---|
| Selectie / breedte | ✅ per **team** (`team.type`) | teamgegevens | alleen het standaardplan van een traject (selectie 2 + 2, breedte 1 + 1) en waarschuwingen bij aanwezigheid; **niet** de training |
| KNVB-diploma | ✅ als tekst | `trainerAdmin` (gecontroleerd door de coördinator) en kennismaking (zelf opgegeven) | alleen getoond aan de HJO; geen invloed |
| Ervaring | ✅ als vrije tekst | kennismaking (*"Breedte of selectie?"*) | getoond aan de HJO |
| Ambitie | ✅ keuze uit 4 | kennismaking | alleen *plezier* → bij de HJO de tekst *geen traject, geen signalen* |
| Beschikbare tijd | ✅ keuze uit 3 | kennismaking | getoond aan de HJO; geen invloed |
| Ondersteuningsbehoefte | ◐ als vrije tekst (*"Wat heb je van de club nodig?"*) | kennismaking | getoond aan de HJO |
| Voorkeur voor manier van voorbereiden | ✖ | — | — |
| Niveau van de vragenlijst bij begeleiding | ✅ kort of uitgebreid | traject (gekozen door de HJO) | alleen de vragenlijst vooraf |

**Bevinding:** de kennismaking vraagt de juiste dingen. Maar **geen enkel kenmerk beïnvloedt de trainingsmodule**, en alles komt alleen bij de HJO terecht. De trainer zelf heeft er geen voordeel van.

**Rechten (vraag 11):** diploma, ambitie en ervaring komen in geen enkele migratie voor (gezocht in `supabase/migrations/`). Rechten volgen alleen uit rollen en de staf van een team (`priv.cc_mag`). Een trainer die zijn werkwijze verandert, verandert dus niets aan zijn rechten ✅. Dat moet zo blijven (zie §6).

---

## 3. Gebruiksgemak en tijd (vragen 2, 3 en 7)

### Route nu: een trainer van Swift voor het eerst, op de telefoon (geteld uit de code)
| # | Handeling | Wat hij moet weten |
|---|---|---|
| 1–2 | Inloggen: e-mail, dan de code uit de mail | — |
| 3 | Tabblad **Training** (opent op *Week*) | — |
| 4 | **Training voorbereiden of vastleggen** | — |
| — | Scherm: *"Nog leeg. Zet vormen en spacing in de volgorde van de training."* Geen sjabloon (Swift heeft geen profiel) | wat *spacing* is; welke opbouw past bij de leeftijd |
| 5 | Een plek of **+ Vorm** → de kiezer: *"Je hebt nog geen vorm…"* | — |
| 6 | **Nieuwe vorm** → het vormscherm (naam *Nieuwe vorm*, duur 6) | — |
| 7–10 | Naam, organisatie en coachpunten typen; eventueel een tekening (tekentool) en duur en aantallen | **alle inhoud uit het eigen hoofd**: oefening, afmeting, regels, coaching |
| ×3 | Herhalen voor een warming-up, een hoofdvorm en een partij | — |
| | Printen | — |

- **Ongeveer 25 tot 35 handelingen** plus veel typen. Realistisch kost dat een beginner **20 tot 40 minuten** de eerste keer, mits hij weet wat hij wil doen. Dit is een schatting, niet gemeten.
- **Verplicht:** niets (alleen een datum bij een losse training). Het probleem is niet de verplichting, maar het **lege begin**.
- **Kan hij direct een complete training kiezen?** ✖ Nee. Alleen een **eigen** eerdere training (*Eerdere training overnemen*, *Kopiëren naar…*). Vanaf de tweede week gaat het dus sneller: een eigen training kopiëren kost 3 tikken.
- **Bij DCG:** *Sjabloon DCG 75* geeft met één tik 9 plekken met minuten. Het weekvoorstel uit de periodisering geeft het probleem en het gereedschap. De kiezer rangschikt de eigen vormen per plek. Dat is sneller, maar vraagt **meer** kennis (gereedschap, vaardigheid, leerniveau, fase).

### Wat de eerste voorbereiding onnodig zwaar maakt (vraag 7)
| Onderdeel | Voor een beginner | Voorstel |
|---|---|---|
| Lege vormenbank | grootste drempel | voorbeeldinhoud (§4, route 1) |
| *Spacing*, blokcodes A·S·B, *Lijn* | onbekende taal | woorden uit het profiel (`termen` bestaat al in het DCG-profiel, maar de app gebruikt het nog niet); zonder profiel gewone woorden (*Warming-up · Oefening · Partij*) |
| Classificatie (8 typen, weerstand, omschakeling, leerniveau) | overbodig om te beginnen | staat al achter *Meer precies* en *mag leeg*; zo laten |
| Tijdsbalk (veldtijd, organisatie, oefentijd) | nuttig, maar het woord *organisatie* is abstract | standaard ingeklapt; later |
| Echte minuten na de training | administratie | blijft optioneel (Besluit 141); niet tonen aan wie het nooit gebruikt |
| Lijn zonder leerdoelen | melding zonder handeling | verbergen zolang het profiel geen leerdoelen heeft (informatie is geen taak) |

---

## 4. Wat we van Rinus kunnen leren (vraag 6)

### Vergelijking
| Functie | Rinus (bron) | ClubComm |
|---|---|---|
| Complete trainingen | ✅ volgens de KNVB ongeveer 160 per leeftijdscategorie (nieuwsbericht, zoekresultaat) | ✖ alleen eigen kopieën |
| Losse oefeningen | ✅ honderden; een eerdere KNVB-pagina noemt 220 | ◐ alleen de eigen bank (Swift: 6 in totaal) |
| Meerweekse programma's | ✅ programma's van meerdere weken; zelf samen te stellen uit KNVB- en eigen trainingen | ◐ DCG: periodisering uit een CSV, Lijn, weekvoorstel · Swift ✖ |
| Filters | ✅ leeftijd, doelstelling en aantal spelers; veldruimte en duur zijn kenmerken (infographic). Of je daarop kunt **filteren**, is niet bevestigd | ◐ zoeken; de kiezer weegt plek, vaardigheid en aantal spelers mee; **geen leeftijd** |
| Uitleg, materiaal, organisatie | ✅ vaste kopjes, meta-regel, materiaal geteld (schermopname) | ✅ vorm in Rinus-stijl, materiaal geteld uit de tekening, printen (Besluit 132) |
| Makkelijker / moeilijker | ✅ kopjes in de oefening (schermopname); de KNVB-webinar noemt aanpassen met het aantal spelers en de ruimte | ✅ varianten *Makkelijker/Moeilijker* bij een vorm |
| Eigen trainingen, kopiëren | ✅ eigen trainingen maken en KNVB-trainingen kopiëren en aanpassen | ✅ eigen trainingen; kopiëren alleen eigen |
| Teamkalender | ✅ training in de teamkalender zetten | ✅ en sterker: rooster, aanwezigheid, verwacht aantal, veldtijd |
| Club en begeleiding | — | ✅ HJO, begeleidingsmoment, clubmethodiek |

### Waarom Rinus laagdrempelig is: zeven ontwerpprincipes
1. **Inhoud eerst, gereedschap later.** Je begint nooit met een leeg scherm; je begint met kiezen.
2. **Kiezen gaat voor maken.** Zelf maken mag, maar het hoeft niet.
3. **Filteren op wat de trainer al weet:** leeftijd en aantal spelers. Niet op wat hij nog moet leren (voetbalprobleem, gereedschap).
4. **De methodiek zit in de inhoud, niet in de invoer.** Volgens de KNVB kiest Rinus zelf een logische opbouw per leeftijd. De trainer hoeft die niet in te voeren.
5. **Eén vaste, korte kaart per oefening:** doel, afmeting, regels, aandachtspunten, makkelijker en moeilijker.
6. **Aanpassen = een variant kiezen**, niet herschrijven.
7. **Kopiëren maakt het van jou.** Een KNVB-training wordt je eigen training, die je kunt aanpassen.

**ClubComm heeft 5 en 6 al.** Principe 7 is er half: kopiëren kan alleen van jezelf. **1 tot en met 4 ontbreken.**

**Niet kopiëren:**
- **de inhoud van Rinus**: dat is KNVB-materiaal, en ClubComm mag het niet overnemen. Verwijzen met een link mag (Besluit 121);
- de videobibliotheek;
- de sterren *Voetbal echt* en de shirtjes met cijfers (afgewezen, Besluit 132).

ClubComm hoeft niet dé bibliotheek te worden. Het verschil zit in de **koppeling aan het eigen team en de eigen club**.

---

## 5. Voorstel: drie manieren van voorbereiden op dezelfde planner (vraag 5 en 8)

**Uitgangspunt:** het zijn drie **startknoppen in dezelfde lege training**, geen drie systemen en geen instelling die functies verbergt. Elke route levert dezelfde rij `trainingsplannen` op, met `onderdelen` die naar `vormen` verwijzen. Week, printen, de kiezer, evaluatie, de trainingskaart en het delen met de HJO werken daarna precies hetzelfde.

| Route | Wat de trainer doet | Wat al bestaat | Wat nieuw is |
|---|---|---|---|
| **1. Snel starten** | *Kies een complete training* → gefilterd op de leeftijd van het team, het aantal spelers en de veldtijd → bekijken → **Gebruik deze training** (2–3 tikken) | kopiëren (`kopieer()`), printen, aantal uit de aanwezigheid, veldtijd (Besluit 142), varianten | ✖ een bron van **voorbeeldtrainingen**, door de club leesbaar; kopiëren naar eigen trainingen en vormen. Leeftijd uit de teamnaam of het team |
| **2. Met begeleiding** | *Help me kiezen* → één vraag in gewone taal (*"Waar wil je deze week aan werken?"*, met 4–6 keuzes per leeftijd uit het profiel) → het sjabloon wordt gezet en per plek stelt de kiezer passende vormen voor | kiezer met advies (Besluit 139), sjabloon, weekvoorstel (DCG) | ✏️ de startvraag; per profiel een korte lijst *werkpunten in gewone taal*, met verwijzing naar teamfuncties of voetbalproblemen. Voorbeeldvormen (uit route 1) als kandidaten |
| **3. Zelfstandig ontwerpen** | zoals nu: leeg, sjabloon, eigen vormen, methodiek, periodisering, Lijn | ✅ alles | — |

- **Vrij wisselen:** de knoppen staan bij elke lege training. Gebruikt een trainer route 1, dan kan hij daarna alles aanpassen, zoals in route 3. Er wordt nergens een *niveau* opgeslagen dat bepaalt wat hij mag.
- **Hulp, geen toegang:** een trainer kan een voorkeur opslaan in zijn eigen opslag (`eigen`): *"Laat uitleg zien"* en welke startknop bovenaan staat. Dat verandert alleen de **presentatie**: uitleg open of dicht, gewone woorden of vaktaal. Elke functie blijft bereikbaar.
- **Doorgroeien (vraag 8), zonder plicht:**
  - de gekozen voorbeeldtraining toont **waarom** hij zo is opgebouwd (één zin per blok, uit de inhoud);
  - na een paar keer verschijnt één keer *"Wil je een oefening aanpassen of zelf maken?"*; wegklikken is definitief;
  - een eigen aanpassing heet *"jouw versie"*;
  - de HJO kan in het traject een leerdoel koppelen aan route 2, en niet andersom.
- **Afgewezen ideeën gecontroleerd:**
  - een vorm verbergen omdat hij niet past is afgewezen (Besluit 139): route 2 **rangschikt** alleen en verbergt niets;
  - het weekvoorstel vanzelf invullen is afgewezen (Besluit 144): route 1 en 2 vullen pas in **na een keuze** van de trainer;
  - versiebeheer van trainingen is afgewezen (Besluit 144): een gekopieerde voorbeeldtraining krijgt alleen een herkomst (*uit voorbeeld X*), geen versies.

---

## 6. Koppeling met de trainer- en HJO-omgeving (vraag 9 en 11)

| Onderwerp | Nu | Voorstel |
|---|---|---|
| Hoe de trainer geholpen wil worden | ◐ vrije tekst *"Wat heb je van de club nodig?"* | één keuzevraag in de bestaande kennismaking: *Geef me complete trainingen · Help me kiezen · Ik ontwerp zelf, kijk graag mee*. Het is **zijn uitspraak** en hij kan die zelf wijzigen |
| Wat de HJO ziet | kennismaking (ambitie, tijd, diploma, nodig) in het trainersscherm ✅ | één regel in het snelvenster: ambitie · tijd · gewenste hulp. **Geen** telling van trainingen, geen gebruikte route per training, geen *activiteit* |
| Privé | trainingen en vormen `eigen` ✅ | blijft zo; zien kan alleen na **expliciet delen per training** (voorstel 2 van het begeleidingsproces, besluit 4-11) |
| Gericht aanbieden | traject starten ✅ | bij *Help me kiezen* of *complete trainingen* kan de HJO **voorbeeldtrainingen aanbieden** of het traject korter maken. Dat is een aanbod, geen plicht |
| Rechten | volgen uit de rol ✅; diploma en ambitie staan niet in de rechten ✅ | voorkeur en gewenste hulp zijn **gegevens** in `trainerzelf` of `eigen`. Geen RLS-functie leest ze. Een regressietest controleert dat wijzigen van de voorkeur, het diploma of de ambitie niets aan de toegang verandert |

**Let op:** de kennismaking staat in `trainerzelf`. Daar kan nu ook een clubbeheerder zonder begeleidersrol bij. Migratie 033 en de toewijzingen (voorstel 2) lossen dat op, en moeten er dus vóór komen.

**Voorbeeldtrainingen van de club** hebben een nieuwe, clubbreed leesbare plek nodig: alleen lezen voor trainers, schrijven voor de HJO of clubbeheerder. Dat is een **rechtenwijziging (maat L)**. Het lijkt op `clubbank` uit 032, die met het besluit van 4-11 vervalt. In voorstel 2 staat *"clubbank later apart, als de club dat wil"*. Dit onderzoek is die vraag. Een gekopieerde voorbeeldtraining wordt daarna gewoon `eigen` van de trainer: geen scope-wijziging, dus geen botsing met `cc_bewaak`.

---

## 7. Clubprofielen: één app, andere inhoud (vraag 10)

| Universeel (code, voor elke club gelijk) | Clubinhoud (gegevens in het profiel of de clubbank) |
|---|---|
| planner, blokken, kiezer, vormkaart, varianten, materiaal, printen, kopiëren | leerlijnen, voetbalproblemen, vaardigheden, leerniveaus (DCG) of KNVB-teamfuncties (Swift) |
| de drie startknoppen | sjablonen voor de opbouw (DCG 75; voor Swift nog leeg) |
| begeleidingsmoment, traject, kennismaking | voorbeeldtrainingen en -vormen per leeftijd |
| tijdsbalk, aanwezigheid | woorden (`termen`): *spacing* of *rust*, *gereedschap* of *doel* |
| | de lijst *werkpunten in gewone taal* per leeftijd (route 2) |

- **Goed nieuws:** er staan geen clubvoorwaarden in de code (gezocht op `'dcg'` en `'swift'`; alleen demogegevens). De methodiek komt al uit het profiel (Besluit 121).
- **Risico 1:** de **vaktaal en de structuur** van DCG zitten wel in de algemene code (spacing, blokcodes; dat stond in Besluit 139 al als *aparte ronde*).
- **Risico 2:** **Swift heeft geen profiel.** Het KNVB-bestand (`knvb-2026.1.json`) heeft alleen de teamfuncties gevuld (*controleren*); leerlijnen, sjablonen en leerdoelen per leeftijd zijn leeg. Zonder die inhoud lijkt Swift een kale versie van DCG. Dat is een **inhoudsvraag (Spoor 2)**, geen softwarevraag.

---

## 8. Drie praktijkscenario's (vraag 12, als testontwerp)

*De routes zijn uit de code gevolgd, niet met echte mensen getest. Elk scenario is ook een opdracht voor de gebruikerstest hieronder.*

### A. Peter, ouder en trainer van een breedteteam O9, geen diploma, 15 minuten op dinsdagavond, telefoon
| Stap | Nu | Gaat makkelijk | Verwarring |
|---|---|---|---|
| Welkomstmail → inloggen | e-mail en code (Besluit 140) | ✅ | — |
| Home | de volgende training en het rooster | ✅ | — |
| Training → *Training voorbereiden* | lege training | | *"vormen en spacing"*: wat is spacing? |
| + Vorm | *"Je hebt nog geen vorm"* → Nieuwe vorm | | moet een oefening **verzinnen** en beschrijven; zoekt op internet of in Rinus en typt over |
| ×3, printen | | printen ✅ | na 15 minuten één vorm en geen training → **stopt** of gebruikt Rinus naast ClubComm |

**Levert het meeste op:** route 1 (een complete O9-training kiezen) en gewone woorden. Met een voorbeeldtraining: ongeveer 6 handelingen en 3 minuten.

### B. Sanne, ervaren trainer van een breedteteam O13, oud-speler zonder diploma, eigen repertoire, soms laptop
| Stap | Nu | Gaat makkelijk | Verwarring |
|---|---|---|---|
| Inloggen → Training → Plannen (laptop) | drie kolommen | overzicht ✅ | Lijn zonder inhoud |
| Haar eigen 8 oefeningen invoeren | Nieuwe vorm, tekening, varianten | tekentool, makkelijker/moeilijker, materiaal ✅ | classificatie (8 typen, weerstand): overslaan mag, maar voelt als *niet af* |
| Training samenstellen, kopiëren naar volgende week | slepen, *Kopiëren naar…* | ✅ snel na de eerste keer | — |

**Levert het meeste op:** de **eerste invoer** lichter maken. Een snelle vorm met alleen naam, tekening en één zin uitleg, en de rest *later*. Daarnaast: oefeningen kunnen delen met de teamgenoot-trainer (nu ✖). Route 2 heeft ze niet nodig.

### C. Ruben, gediplomeerde selectietrainer O15, werkt cyclisch, laptop
| Stap | Nu bij DCG | Nu bij Swift |
|---|---|---|
| Periodisering | CSV laden, Lijn, weekvoorstel ✅ | ✖ geen profiel; Lijn leeg |
| Training ontwerpen | sjabloon DCG 75, kiezer per gereedschap en vaardigheid, trainingskaart ✅ | leeg begin; eigen vormen; geen leerlijnen |
| Evalueren | echte minuten, Lijn gepland en uitgevoerd ✅ | minuten ✅, geen koppeling aan leerdoelen |

**Levert het meeste op:**
- **voor Swift:** een gecontroleerd KNVB-profiel (leerlijnen, sjabloon, werkpunten per leeftijd; Spoor 2) en meerweekse planning zonder CSV;
- **voor DCG:** weinig; de module past hem.

### Gebruikerstest (vraag 12: bewijs ontbreekt nog)
- **Wie:** drie echte trainers, één per scenario.
- **Waar:** de demo met verzonnen gegevens (`demo/swift-trainer`, geïsoleerd).
- **Wat:** dezelfde opdracht: *"Zet de training van dinsdag klaar en print hem."*
- **Meten:**
  - tijd tot een printbare training;
  - aantal keer om hulp vragen;
  - waar ze stoppen;
  - wat ze hardop zeggen.
- **Succesgrens (voorstel):** de ouder heeft binnen 10 minuten zonder hulp een bruikbare training. De ervaren trainer voert binnen 15 minuten 3 eigen oefeningen in. De selectietrainer kan zijn bestaande cyclus volgen zonder een omweg.
- **Eerst testen, dan bouwen.** De test kost geen code en zegt of deze analyse klopt.

---

## 9. Welke algemene softwarewijzigingen nodig zijn

| # | Wijziging | Maat | Rechten | Hangt af van |
|---|---|---|---|---|
| a | Startkeuze in de lege training: drie knoppen (Snel · Help me kiezen · Zelf) | M | geen | b voor knop 1 |
| b | Voorbeeldtrainingen en -vormen van de club: leesbaar voor trainers, beheerd door HJO of clubbeheerder; kopiëren wordt `eigen` | **L** | nieuwe scope (opvolger `clubbank`) | 033, toewijzingen (voorstel 2), inhoud (Spoor 2) |
| c | Leeftijd van het team als filter (uit de teamnaam of een teamveld) en *past bij je veldtijd* | M | geen | — |
| d | Woorden uit het profiel (`termen`); zonder profiel gewone woorden; Lijn verborgen zonder leerdoelen | M | geen | — |
| e | Snelle vorm: naam, tekening en één zin; de rest *later* | M | geen | — |
| f | Voorkeur *uitleg tonen* en startknop (presentatie) in de eigen opslag | S–M | geen; regressietest *voorkeur ≠ recht* | — |
| g | Kennismaking: keuzevraag *gewenste hulp*; regel in het snelvenster van de HJO | M | bestaande scope `trainerzelf` | 033 |
| h | KNVB-profiel voor Swift vullen en controleren (leerlijnen, sjabloon, werkpunten per leeftijd) | inhoud | geen (profielrij) | Spoor 2 |

**Geen** aparte app per club, **geen** functievergrendeling per niveau, **geen** AI nodig (Besluit 121: de databank werkt zonder AI).

---

## 10. De drie belangrijkste verbeteringen voor de volgende fase

0. **Eerst de gebruikerstest** (§8) met drie echte trainers. Kost geen code en toetst of we vanuit de juiste doelgroep denken.
1. **Nooit een leeg begin: Snel starten met voorbeeldtrainingen van de club** (b + a + c). Dit maakt het grootste verschil voor de vrijwilliger. Het vraagt inhoud (Spoor 2: wie maakt de eerste 3–5 trainingen per leeftijd?) en een rechtenvoorstel (L), en kan aansluiten op voorstel 2 van het begeleidingsproces.
2. **Gewone taal in het algemene scherm** (d + e). Klein, zonder rechten, en meteen merkbaar voor elke club zonder methodiek: geen *spacing* en geen lege Lijn voor wie dat niet gebruikt, en een snelle vorm in één scherm.
3. **De trainer zegt zelf hoe hij geholpen wil worden** (g + f). De HJO ziet dat in één regel en biedt gericht aan. Het is presentatie en gegevens, nooit een recht. Na 033.

**Bewust niet voorgesteld:**
- trainers indelen in niveaus door de app;
- een HJO-overzicht met aantallen trainingen per trainer;
- inhoud van Rinus overnemen;
- een aparte *beginnersapp*.

---

## Antwoorden op de onderzoeksvragen (kort)
| # | Vraag | Antwoord |
|---|---|---|
| 1 | Doelgroep | Trainingsmodule: ervaren, methodische trainer (DCG-model). Begeleiding: de HJO. Vrijwilliger: ontzien, niet geholpen (§1) |
| 2 | Tijd | Nee, niet de eerste keer: hij loopt vast op het lege begin en moet elke oefening zelf maken (§3) |
| 3 | Starten | Geen complete training te kiezen; alleen een eigen eerdere training of het clubsjabloon (alleen DCG) (§3) |
| 4 | Differentiatie | Wel opgeslagen (teamtype, diploma, ervaring, ambitie, tijd), maar alleen zichtbaar bij de HJO; geen invloed op de trainingsmodule (§2) |
| 5 | Vrijheid | Ja: drie startknoppen op dezelfde planner en dezelfde gegevens; alleen route 1 vraagt een nieuwe leesscope (§5) |
| 6 | Rinus | Inhoud eerst, filteren op leeftijd en aantal, methodiek in de inhoud, kopiëren = eigen (§4) |
| 7 | Overbelasting | Leeg begin, vaktaal, lege Lijn; classificatie en minuten zijn al optioneel (§3) |
| 8 | Leren | Uitleg *waarom* bij een voorbeeld, één uitnodiging om aan te passen, nooit een plicht (§5) |
| 9 | HJO | De eigen uitspraak van de trainer over gewenste hulp; geen inzage in privé, geen tellingen (§6) |
| 10 | Clubprofielen | Code universeel; methodiek, sjablonen, woorden en voorbeelden zijn profielinhoud. Swift mist vooral inhoud (§7) |
| 11 | Rechten | Nu al los van diploma en ambitie; zo houden met een regressietest (§2, §6) |
| 12 | Bewijs | Ontbreekt; gebruikerstest met drie echte trainers op de demo (§8) |

**Bronnen Rinus** (zoekresultaten 4-11; de sites zelf waren vanuit de sessie niet bereikbaar):
- KNVB, *Hoe werkt het* (Rinus): https://www.knvb.nl/assist-trainers/training-wedstrijd-en-team/ondersteuning-rinus/de-basisprincipes-van-rinus/hoe-werkt-het
- KNVB, *Circuittrainingen, eigen trainingen maken*: https://www.knvb.nl/nieuws/assist-trainers/assist-trainers/50187/circuittrainingen-eigen-trainingen-maken-de-nieuwe
- KNVB, *Online assistent-trainer Rinus populair*: https://www.knvb.nl/nieuws/amateurvoetbal/uitgelicht/44931/online-assistent-trainer-rinus-populair-onder
- KNVB, infographic Rinus: https://redactie-4.knvb.nl/downloads/bestand/12615/infographic-rinus
- KNVB, webinar Rinus (naslagwerk): https://redactie-4.knvb.nl/downloads/bestand/22769/webinar-rinus-naslagwerk
