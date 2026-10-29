# Onderzoek: begrijpelijkheid van de trainingsplanning (DCG O13, 27–30 oktober)

*Spoor 3 · onderzoek, 29-10-2026. **Er is niets aangepast** aan app, database of productie.*

**Hoe onderzocht:**
- De werkelijke gegevens van DCG O13 zijn alleen gelezen uit productie: club, profiel, team, kalender, de 32 trainingen en 13 vormen van de trainer, zonder spelers.
- De schermen zijn daarmee lokaal nagebouwd met de huidige app (`main` = `b78b9d8`), op 30-10 om 09:00, op telefoon (390 px) en laptop (1280 px).
- De kopie van de gegevens staat niet in de repository.

**Methodiek:** dit gaat alleen over hoe ClubComm het DCG-profiel toont (Spoor 1-inhoud, technisch via het DCG-clubprofiel). Voor Swift verandert hier niets.

## 1. Wat er in de database staat

| | di 27 okt | do 29 okt | vr 30 okt | Weekplan wk 44 |
|---|---|---|---|---|
| Rij | `tp-dcg-20261027` | `tpmvt9wca6215` | `tp-a-o12-20261030` | `wk-O12-1-2026-10-26` |
| Ontstaan | eerder (script 27-10) | **door de trainer, 29-10 08:20 (UTC)**, titel leeg | periodisering geladen 29-10 ±11:40, concept | periodisering 29-10 ±11:40 |
| Titel (`thema`) | *Passeren (dreigen)* | **leeg** | *Opbouwen tegen twee/drie jagers* | – |
| Eigen methodiek | geen | geen | probleem 2, A Aannemen en meenemen, B Passen, **Herkennen → Kiezen**, hoofdthema = titel | probleem 2 (*Vooruitgang creëren*), **hoofdthema *Technische onderbouw opbouwen***, A/B, **Uitvoeren → Herkennen**, teamfunctie Aanvallen, relevante informatie, leerroute, contra 6 |
| Leerniveau per vorm | – | 3× Uitvoeren, 3× Herkennen | voorstellen | – |
| Wat anders ging (`anders`) | ja (partijvorm, passeren) | ja (lange evaluatie, ±330 woorden) | – | – |
| Gegeven | ja | ja | nee | – |

**Hoe het weekplan ontstond.** Het script van 29-10 (`supabase/scripts/2026-10-29_dcg_periodisering_o13.sql`) laadt het bestand `periodisering-o13-import-CONCEPT.csv`:
- Het **weekplan** krijgt de waarden van de **eerste regel van de week**. Dat is de regel van **do 29**: *Technische onderbouw opbouwen*, Uitvoeren → Herkennen.
- De **training** van do 29 is overgeslagen, omdat er al een eigen voorbereiding was ("overschrijft nooit iets").
- De regel van **vr 30** werd een concepttraining.

## 2. Waar elk label vandaan komt (vraag 1)

| Wat je ziet | Waar | Bron |
|---|---|---|
| *Vooruitgang creëren* | kop van het methodiekblok (*2 · Vooruitgang creëren*), "Je zit in", Lijn | **Naam van voetbalprobleem 2 in het profiel** (`methodiek.probleem = vp-2`). Bij vr 30 uit de training zelf, bij di 27 en do 29 **uit het weekplan**. |
| *Opbouwen tegen twee/drie jagers* | titel van vr 30, Lijn | **Hoofdthema** van de regel van vr 30 (periodisering). Bij het laden ook als titel gezet (`thema` = `importThema`). |
| *Uitvoeren → Herkennen* / *Herkennen → Kiezen* | paarse chip bij *Stap x van y*, het methodiekblok, Lijn | **Beoogd leerniveau** (`methodiek.niveaus`), van training of weekplan. |
| *Passeren (dreigen)* | Lijn, onder di 27 | **Titel van de training** (door de trainer). |
| *Gegeven* | Lijn en Plannen | **Status, berekend** (`gegeven`), geen periodisering. |
| *Voorstel van di 27 / do 29* | het methodiekblok | **Wat anders ging** (`anders`) bij de vorige training met hetzelfde probleem (evaluatie). |
| *Week 44 · Fase 1 – concept · …* | balk "Je zit in" | **Weekplan** (fase, probleem, A/B). |

**De kern:**
- Het scherm zegt nergens of iets een **voetbalprobleem**, een **hoofdthema** of een **titel** is, en ook niet of het **van de training** of **van de week** komt.
- *Vooruitgang creëren* (probleem) en *Opbouwen tegen twee/drie jagers* (hoofdthema) staan los van elkaar. De relatie (het thema is een uitwerking van het probleem) staat er niet.
- Het hoofdthema staat alleen ingeklapt onder *Onderbouwing*.

## 3. Het cijfer 5 (vraag 2)

**Niet teruggevonden.** Ik heb gezocht in:
- de huidige schermen van 27, 29 en 30 (Plannen, Week, Lijn; telefoon en laptop);
- de gegevens;
- de versie van Lijn van vóór Besluit 141 (gepubliceerd 29-10 ±20:35).

Er staat nergens "Herkennen 5". Twee dingen komen in de buurt:
- **De strook met dagen** bovenaan (DO 29 · VR 30 · DI 3 · **DO 5** · VR 6). Op de telefoon staan *DO* en *5* onder elkaar, vlak boven de balk met het leerniveau.
- **Het nummer van het voetbalprobleem** (*2 · Vooruitgang creëren*), zonder het woord "probleem".

**Gevraagd:** een schermafbeelding van waar je de 5 zag, of de precieze plek (tabblad en blok). Dan kan ik het zeker zeggen.

**Algemeen:** een getal zonder woord (probleem 2, DO 5) is niet duidelijk. Het voorstel zet er altijd een woord bij.

## 4. Waarom dinsdag en donderdag verschillen (vraag 3)

Lijn toont per training: datum · leerniveau, met daaronder titel · status.
- **di 27:** *Uitvoeren → Herkennen* + *Passeren (dreigen)* + *gegeven*. Het leerniveau komt uit het **weekplan**, de titel uit de training.
- **do 29:** *Uitvoeren → Herkennen* + *gegeven*. Het leerniveau komt uit het **weekplan**, en de titel is **leeg**.

**Probleem:** de training van di 27 werd gegeven **vóór** het weekplan bestond, en ging over passeren. Toch krijgt hij achteraf het leerniveau en voetbalprobleem van week 44. De code vult een training zonder eigen methodiek namelijk altijd aan met het weekplan (`methodiek()`, `periodisering.js`). Daardoor toont ClubComm iets als keuze van de trainer dat hij nooit heeft gekozen. Ook het *Voorstel van di 27* verschijnt bij do 29 omdat di 27 via het weekplan "hetzelfde probleem" kreeg.

## 5. Het thema van donderdag (vraag 4)

**Geen dataverlies en niet overschreven.** Het is een weergaveprobleem:
- De training van do 29 is om 08:20 gemaakt **met een lege titel**. Een nieuwe voorbereiding begint altijd leeg (`training.js`).
- Het thema voor donderdag uit de periodisering (*Technische onderbouw opbouwen*) staat in de database, **in het weekplan** (zie §1). Het is alleen te zien onder *Onderbouwing (weekformat)*, ingeklapt.
- In de titel staat dan *Training*, en in Lijn niets.

**Wat ik niet kan uitsluiten:** dat je zelf ooit een titel typte en die later leegmaakte. Het titelveld slaat op wat er staat, ook leeg. De database bewaart geen geschiedenis van trainingen; de wekelijkse back-up neemt trainingen niet mee. Er is geen enkele aanwijzing voor overschrijven door de app.

## 6. Kan uitwerken of afronden de periodisering veranderen? (vraag 5)

| Handeling | Weekplan (periodisering) | Training zelf |
|---|---|---|
| Training gegeven, minuten, *wat ging anders*, evaluatie | **nee** | alleen `gegeven`, `minUit`, `anders`, `evaluatie` |
| Vorm kiezen, minuten, leerniveau per plek | **nee** | alleen de plekken |
| Titel wijzigen (potlood) | nee | `thema`: ook leeg opslaan kan |
| *Methodiek van deze training* (potlood bij het blok) | **nee** | Zet **alle** waarden die je ziet (ook die uit het weekplan) vast in de training. Is de titel leeg of nog gelijk aan het geladen thema, dan wordt hij het hoofdthema. |
| *Eerdere training overnemen* | nee | vult een lege titel met die van de andere training |
| Afgelaste training *Doorschuiven* | nee | verschuift titel, methodiek en A/B door volgende **onaangepaste** concepten; het laatste doel valt weg (zo bedoeld, Besluit 137) |
| Observatiepunten wedstrijd, *Periodeplanning vastleggen* | ja: alleen punten of de datum | – |

**Conclusie:** uitwerken of afronden verandert **nooit** het weekplan.

**Wel een risico:** de oorspronkelijke waarden van een **concepttraining** (zoals vr 30) staan alleen in die training zelf. Pas je ze aan, dan is het origineel in ClubComm weg. Het staat dan alleen nog in het CSV-bestand in de repository. Het weekplan bevat alleen de regel van de eerste dag van de week.

## 7. Ziet de trainer direct wat hij nodig heeft? (vragen 6 en 7)

| Jouw vraag | Nu (telefoon en laptop) | Zichtbaar? |
|---|---|---|
| **WAT** trainen we? | Titel (vr 30: hoofdthema; do 29: *Training*) + kop *2 · Vooruitgang creëren* zonder uitleg | deels; de relatie ontbreekt |
| **WAAR** ontstaat het probleem? | Teamfunctie en relevante informatie staan **ingeklapt** onder *Onderbouwing* | nee |
| **WELKE** vaardigheden? | A en B zichtbaar; ondersteunend ingeklapt; gedrag zichtbaar; vaardigheidsaccenten per vorm alleen in de vormen | deels |
| **OP WELK** niveau? | Paarse chip, twee keer (bij *Stap* en in het blok); niet zichtbaar of het van de week of van de training komt | ja, maar dubbel en zonder herkomst |
| **WAT nemen we mee?** | *Voorstel van …*: de **hele** tekst van *wat ging anders* (bij vr 30 ±330 woorden in het blok) | ja, maar veel te lang |
| **Telefoon** | Methodiekblok + voorstel ± 1,5 scherm vóór de opbouw | rommelig |
| **Laptop** | Zelfde blok in de middenkolom, de lange tekst duwt de opbouw ver naar beneden | rommelig |

**Schermen nu:**
- `nu-tel-plannen-vr30.jpg`, `nu-tel-plannen-do29.jpg`, `nu-tel-week-do29.jpg`, `nu-tel-lijn.jpg` (telefoon);
- `nu-lap-plannen-vr30.jpg` (laptop).

## 8. Voorstel: één trainingskaart met vijf vaste regels (geen nieuwe velden)

**Schermen:**
- `voorstel-vr30.jpg`, `voorstel-do29.jpg`, `voorstel-di27.jpg` (390 px);
- `voorstel-laptop.jpg`.

Het methodiekblok wordt één kaart met vijf regels, elk met een **vast woord** ervoor. Alles komt uit de **bestaande** gegevens:

| Regel | Inhoud (bestaand) | Herkomst zichtbaar |
|---|---|---|
| **Titel** | eigen titel; is die leeg: het hoofdthema van de week, met het label *weekthema* | label *weekthema* |
| **WAT** | *Hoofdthema van deze training* + *Voetbalprobleem 2 · Vooruitgang creëren* (nummer mét woord) | – |
| **WAAR** | teamfunctie + relevante informatie (nu ingeklapt) | label *week* als het uit het weekplan komt |
| **WELKE** | A · B, ondersteunend, gedrag; bij een gegeven training *in je vormen: Uitvoeren 3× · Herkennen 3×* | label *week* |
| **NIVEAU** | één chip + de plek in de week (*di 27 → do 29 → vr 30*); geen tweede chip meer bij *Stap x van y* | *uit het weekplan*, en of het klopt met de vormen |
| **MEE UIT VORIGE** | uit *wat ging anders* van de vorige training: de zin met *afspraak*, anders de eerste zin, plus *Hele evaluatie lezen* | dag van de vorige training |

**Verder:**
- **di 27 (gegeven vóór het weekplan):** het weekplan wordt **niet** getoond alsof het de keuze van de trainer was. Er staat een rustige regel *Andere inhoud dan het weekplan*.
- **Onderbouwing (weekformat)** blijft één tik verder, voor handelingsketen, leerroute, transfer en observatie.
- **Telefoon:** de kaart is ongeveer één scherm hoog. **Laptop:** de kaart links naast de opbouw, alles open.
- **Optioneel**, apart te beslissen: *Weekthema als titel gebruiken* bij een lege titel (één tik, het schrijft `thema`).

**Wat dit niet doet:**
- geen nieuwe velden;
- geen automatische samenvatting (vergelijk het afgewezen idee *automatische uitloopsamenvatting*: hier tonen we alleen een stuk van je eigen tekst);
- het weekplan of de trainingen worden niet veranderd;
- geen Swift-inhoud.

**Te beslissen:**
1. Akkoord op de vijf regels (WAT, WAAR, WELKE, NIVEAU, MEE UIT VORIGE)?
2. Training **zonder eigen methodiek**: het weekplan tonen **met het label *week*** (voorstel), of niet tonen?
3. Training die **vóór** het weekplan is gegeven (zoals di 27): *Andere inhoud dan het weekplan* tonen (voorstel), of niets?
4. *Mee uit vorige*: de zin met *afspraak* (voorstel), of de eerste zin?
5. Apart, klein: het origineel van een concepttraining bewaren, zodat aanpassen het origineel niet wist (alleen als je dat wilt; dat is wel een gegevenswijziging, maat M).

**Maat:** M (gewijzigd scherm, geen database), Spoor 3. Een eigen besluit na akkoord.

**Testen:**
- DCG O13 week 44 (deze drie trainingen);
- een club zonder profiel, zoals Swift: daar verschijnt de kaart niet, omdat de methodiek niet actief is;
- telefoon en laptop.
