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

## 8. Definitief voorstel: de trainingskaart (ronde 2, 30-10)

*Na je reactie van 30-10. **Alleen een voorbeeld:** geen wijziging aan app, database of productie.*

**Schermen** (werkelijke gegevens DCG O13):
- `kaart-vr30.jpg`, `kaart-do29.jpg`, `kaart-di27.jpg` (telefoon, 390 px);
- `kaart-laptop.jpg`;
- `kaart-zonder-profiel.jpg` (club zonder opleidingsprofiel, zoals Swift; verzonnen voorbeeld).

### 8.1 De vijf regels en waar ze vandaan komen (alleen bestaande gegevens)

| Regel | Betekenis | Bestaande gegevens |
|---|---|---|
| **Wat** | het voetbalprobleem | `methodiek.probleem` (naam uit het profiel, met het woord *Voetbalprobleem* en het nummer) + teamfunctie + contrathema |
| **Waar** | de wedstrijdcontext of het dagthema | dagthema = `methodiek.hoofdthema` uit de periodisering, of bij een eigen training de **titel**; relevante informatie; de wedstrijd van de week (observatiepunten) |
| **Welke** | gereedschappen en vaardigheidsaccenten | A/B (`blokDoel` of methodiek), ondersteunend; **accenten in je vormen** = `vaardigheden` van de gekozen oefenvormen (bestaat sinds Besluit 138) |
| **Niveau** | de beoogde leerroute | `methodiek.niveaus` + `route`; bij een eigen training zonder keuze: de leerniveaus die je per vorm koos (*Uitvoeren 3× · Herkennen 3×*) |
| **Mee uit vorige** | de concrete afspraak | uit *wat ging anders* (`anders`) van de **vorige training van het team** (zie 8.4) |

Een regel zonder gegevens verdwijnt (club zonder profiel: alleen *Wat*, *Welke* en *Mee uit vorige*).

### 8.2 Herkomst altijd zichtbaar (geen kleur alleen: elk label heeft een woord)

| Label | Betekent | Voorbeeld |
|---|---|---|
| **eigen** | jouw voorbereiding | do 29: accenten in je vormen |
| **periodisering** | geladen voor **deze dag** (concepttraining) | vr 30 |
| **weekvoorstel** (stippellijn, apart vak) | hoort bij de week; **niet** door jou gekozen; wordt **nooit** in de training gezet | do 29 en di 27 |

Bovenaan elke kaart één regel met de stand:
- *Concept uit de periodisering · nog niet aangepast*
- *Eigen voorbereiding – periodisering niet toegepast*
- *Eigen voorbereiding – gegeven vóór de periodisering (geladen 29 okt)*

### 8.3 Trainingen zonder eigen methodiek en historische trainingen
- **Niets automatisch invullen.** De huidige code vult een training zonder eigen methodiek stil aan met het weekplan (`methodiek()` in `periodisering.js`). Voorstel: dat alleen nog tonen als **weekvoorstel**, apart.
- **di 27** (gegeven vóór het laden): het weekvoorstel staat er alleen als context (*later geladen*). Er wordt niets aan de training toegevoegd en niets overschreven.
- **Voorstel van vorige trainingen** gaat niet meer via *hetzelfde probleem* (dat kwam ook stil uit het weekplan). Het wordt gewoon de vorige training van het team.

### 8.4 Mee uit vorige: alleen een herkende afspraak, nooit iets verzonnen
1. Staat in *wat ging anders* een zin die begint met **Afspraak** of **Concrete afspraak** (zoals bij do 29), dan toont de kaart **die zin letterlijk**.
2. Heeft de evaluatie een gekozen antwoord bij *volgende keer* (`ev-volgende`, bijv. *één variabele aanpassen*), dan staat dat eronder. Dat is een keuze die je zelf maakte.
3. Niets herkend: *Geen afspraak herkend in de evaluatie van di 27* + een link *Wat anders ging op di 27*.
4. De hele evaluatie staat er nooit meer standaard in; alleen via *Hele evaluatie lezen*.

Tip voor jezelf: begin de laatste alinea van *wat ging anders* met **Afspraak:**. Dan pakt de kaart hem altijd.

### 8.5 Weekthema, voetbalprobleem, wedstrijdcontext, dagaccent en oefenvormen

Analyse van het periodiseringsbestand van DCG O13 (alle 8 weken met 2 trainingen):

| Soort | In het bestand | Gelijk per week? | Waar op de kaart |
|---|---|---|---|
| **Weekthema** | bestaat **niet** als eigen kolom; de week wordt gedragen door fase + voetbalprobleem | – | strook *Week 44 · Fase 1 · Voetbalprobleem 2* |
| **Voetbalprobleem** | `centraal_voetbalprobleem` | ja, 8/8 | **Wat** |
| **Wedstrijdcontext** | `hoofdthema` van de **wedstrijdregel** (bijv. *Opbouwen achteruit: eerste druklijn uitspelen*) | – | **wordt nu niet geladen** (alleen de 3 observatiepunten); zie keuze 3 |
| **Dagaccent / dagthema** | `hoofdthema`, `beoogd_leerniveau`, `leerroute` | nee, **0/8** (per dag anders) | **Waar** en **Niveau** |
| **Gekozen oefenvormen** | – (eigen keuze) | – | de opbouw + *accenten in je vormen* |

**Ontdekt:** het weekplan bevat nu ook de **dagwaarden van de eerste trainingsdag** (hoofdthema, leerniveau, leerroute). Bij week 44 zijn dat die van do 29.

Voorstel:
- **Weergave (zonder gegevenswijziging):** het weekvoorstel toont alleen de velden die echt per week gelden (probleem, teamfunctie, contrathema, A/B, ondersteunend, gedrag, relevante informatie). De dagwaarden in het weekplan worden niet als weekthema getoond.
- **Laden (later, eigen besluit):** het weekplan krijgt alleen de weekvelden. De dagwaarden van een overgeslagen training (zoals do 29) komen als *periodisering voor deze dag (niet toegepast)* bij die dag.

Voor de 8 bestaande weekplannen zou dat een eenmalige correctie uit het CSV-bestand zijn. Dat is een databasewijziging, dus alleen na akkoord. Zonder die correctie toont do 29 *periodisering niet toegepast*, zonder de dagwaarden.

### 8.6 Oorspronkelijke planning terugvinden
- **Nu:** alle 22 concepttrainingen en 8 weekplannen zijn nog precies zoals geladen (de bestaande controlecode `stempel` nagerekend op 30-10).
- **Bestaande bron:** `docs/methodiek/persoonlijk/periodisering-o13-import-CONCEPT.csv` (in de repository, niet in de app).
- **Eenvoudigste oplossing (geen versiebeheer):** op het moment dat je een concept voor het **eerst** aanpast, en de controlecode dus nog klopt, bewaart de app één momentopname in de training (`origineel`: titel, methodiek, A/B; ongeveer 1 kB). Op de kaart staat dan *Oorspronkelijke planning ›*.
  - Niets eenmaligs in de database nodig.
  - Er komen geen nieuwe velden op het scherm.
  - Werkt ook voor de al geladen concepten.

### 8.7 Te beslissen
1. Akkoord op de kaart zoals in de schermen (5 regels, 3 herkomstlabels, weekvoorstel apart)?
2. *Mee uit vorige*: de regels uit 8.4 (*Afspraak* of *Concrete afspraak*, plus de keuze bij *volgende keer*)?
3. Wedstrijdcontext: alleen de observatiepunten (nu), of bij het laden ook het hoofdthema van de wedstrijdregel bewaren (later, eigen besluit)?
4. Momentopname bij de eerste aanpassing (8.6): bouwen met de kaart, of later?
5. Weekplan alleen weekvelden + eenmalige correctie van de 8 weekplannen (8.5): later, eigen besluit met databaseakkoord?

**Maat:** de kaart is M (scherm, geen database). 8.5 (correctie) is een gegevenswijziging, alleen na akkoord.

**Testen bij het bouwen:**
- DCG week 44 (di 27, do 29, vr 30);
- een club zonder profiel;
- telefoon en laptop;
- 44 pt tikvlak;
- herkomst niet alleen met kleur.
