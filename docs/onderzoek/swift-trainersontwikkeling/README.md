# Trainersontwikkeling AVV Swift: aangescherpt voorstel (ronde 3)

*Onderzoek, 29-10-2026. **Voorstel Spoor 2** (inhoud Swift) en **Voorstel Spoor 3** (algemene software). Dit is **geen besluit en geen bouwopdracht**. Er is niets gewijzigd aan code, database, rechten of productie. Eerdere rondes: `archief-ronde-1-en-2.md`. De schermen in deze map horen nog bij die rondes; nieuwe voorbeelden volgen in fase 2 (zie §7).*

## 1. Bronnen

Dit voorstel gebruikt alleen de bronnen hieronder. Wat er niet in staat, heet **open** en wordt niet als Swift-beleid vastgelegd.

| Afkorting | Bron | Wat erin staat |
|---|---|---|
| **BD** | *AVV Swift Beleidsdocument Jeugd & Technische vorming* (versie 4 juni 2025) | Missie, drie pijlers, kernwaarden, visie, spelprincipes onderbouw en bovenbouw, leerlijn in vijf fasen, taken van de HO en de trainer |
| **OP** | *Ontwikkelplan Voetbaltechnische Opleiding Bovenbouw 2026-2027* (HJO bovenbouw, 19 pagina's) | Hoofdstuk 01–05: opdracht, eerste observaties, trainerskader, trainersscan, vier ontwikkelopgaven, opleidingsketen. **Hoofdstuk 06–12 staan alleen in de inhoudsopgave en zijn nog niet geschreven**: 06 Kwaliteitsstandaard trainingen, 07 Ontwikkeling trainerskader, 08 Periodisering & opleidingslijn, 09 Organisatie, 10 Meerjarenplan, 11 Actieplan, 12 Randvoorwaarden. |
| **KNVB** | [knvb.nl, kennisbank 107 *Wat is een goede voetbalvorm*](https://www.knvb.nl/assist/trainersdashboard/kennisbank/107/wat-is-een-goede-voetbalvorm), door de gebruiker bevestigd | Vier gouden trainingsprincipes: Voetbalecht trainen · Veel prikkels en plezier · Organisatie en coaching · Afstemming op leeftijd, niveau en beleving |

De documenten zelf staan **niet** in de repository: ze bevatten namen van echte personen. Hier staan alleen verwijzingen (bron + paragraaf).

## 2. Wat de documenten zeggen over dit onderwerp

**Opdracht (OP 01).** De bovenbouw (O14 t/m O23, jongens en meiden) bouwt voort op het bestaande jeugdbeleid. Er komt geen nieuwe visie. Er zijn vier onderdelen:
- een opleidingslijn vanaf O14;
- de visie vertalen naar leeftijdsdoelen, periodisering en trainingen;
- trainers structureel begeleiden;
- kwaliteitsstandaarden en een gezamenlijke voetbaltaal.

Centrale vraag: *"Hoe vertalen we de bestaande voetbalvisie van AVV Swift naar herkenbaar en kwalitatief opleidingsgedrag op ieder trainingsveld?"*

**Eerste observaties (OP 02).** Wat opviel:
- grote verschillen in trainingsopbouw;
- geen gezamenlijk thema of periodisering;
- de koppeling tussen een oefenvorm en een voetbalprobleem, teamfunctie, teamtaak of trainingsdoel was niet altijd herkenbaar;
- verschillen in intensiteit, organisatie, coaching en effectieve trainingstijd.

Volgens OP 02 moet een goede training deze **zes vragen** kunnen beantwoorden:
1. Welk voetbalprobleem staat centraal?
2. Welke teamfunctie en teamtaak horen daarbij?
3. Wat is het trainingsdoel?
4. Welk gedrag en welke voetbalhandelingen willen we verbeteren?
5. Waarom past deze oefenvorm daarbij?
6. Welke coachaccenten worden gebruikt?

**Trainerskader (OP 03).**
- **Bezetting:**
  - VC3: 3×;
  - VC2: 3×;
  - VC1: 7×;
  - VC4: 0×;
  - zonder diploma: 12 trainers.
- **Diploma:** *"Dit betekent niet automatisch dat een trainer zonder diploma geen goede trainer is, of dat een gediplomeerde trainer automatisch aan alle gewenste kwaliteitscriteria voldoet."*
- **Trainersprofiel, vijf onderdelen:** Opleiding · Bekwaamheid · Ambitie · Ontwikkelbereidheid · Beschikbaarheid.
- **Trainersscan in vijf stappen:**
  1. korte vragenlijst;
  2. persoonlijk profielgesprek;
  3. veldobservatie;
  4. trainersprofiel;
  5. ontwikkelafspraak.
- **Niet iedere trainer hoeft hetzelfde profiel te hebben** (ambitie verschilt).

**Ontwikkelopgaven (OP 04).**
1. Van visie naar opleidingslijn.
2. Van losse trainingen naar periodisering.
3. Van individuele trainer naar trainersontwikkeling (*"op basis van niveau, ambitie en ontwikkelbehoefte"*).
4. Van afspraken naar kwaliteitsborging: *"een gezamenlijke kwaliteitsstandaard … waarmee trainingen structureel kunnen worden voorbereid, geobserveerd en geëvalueerd"*.

**Opleidingsketen (OP 05).** Voetbalvisie → Spelprincipes → Leeftijdsdoelen → Periodisering → Trainingsdoel → Trainingsvorm + Coaching → Wedstrijd → Evaluatie.

**Beleidsdocument.**
- **Missie en pijlers (BD 1.1):** met plezier beter leren voetballen in een veilige omgeving. Drie pijlers:
  1. gelijke kansen;
  2. een veilig pedagogisch klimaat;
  3. spelen volgens de Swift-spelprincipes.
- **Pedagogisch klimaat (BD 1.3):** veiligheid is topprioriteit; de "Gouden Driehoek" van trainer, speler en ouders.
- **Kernwaarden (BD 2.1), zes:**
  1. genieten van het spel;
  2. altijd vooruit denken;
  3. altijd beter worden;
  4. leiderschap;
  5. elkaar versterken;
  6. respect.
- **Visie (BD 2.2):**
  - aanvallend en dominant voetbal met hoge intensiteit;
  - spelprincipes leidend, niet het systeem;
  - "spelerparadigma boven teamparadigma, opleiden gaat voor winnen";
  - TIPS (Techniek, Inzicht, Persoonlijkheid, Snelheid);
  - cognitieve en motorische vaardigheden.
  - Over trainers: zij moeten *"zich gewaardeerd voelen"* en *"zichzelf ontwikkelen door opleiding"*.
- **Spelprincipes bovenbouw (BD 2.4, "explicieter leren").**
  - **Algemeen:**
    - coach het team, niet de speler;
    - train bewustwording (zone 14);
    - geef spelers kaders in plaats van oplossingen;
    - geen automatismen;
    - vernieuw met mate;
    - speel in zones;
    - ontwikkel cognitieve snelheid.
  - **Per teamfunctie: Aanvallen · Omschakelen** (verdedigen→aanvallen en aanvallen→verdedigen) **· Verdedigen.** Voorbeelden:
    - elke 4e pass een dieptepass;
    - de 3e man benutten;
    - vijfsecondenregel;
    - onderlinge afstand 15–25 m;
    - ruimtes verdedigen.
- **Leerlijn (BD 2.5):**

  | Fase | Leeftijd | Kern |
  |---|---|---|
  | 3 | O13–O14 | 11:11 leren en ervaren, vanuit positie en linie |
  | 4 | O14–O16 | Voetballen vanuit linies, naar vaste posities, 2–3 posities |
  | 5 | O17–senioren | Een speelwijze perfectioneren, specialist |

  Veldbezetting junioren: 1-4-3-3.
- **Taken HO (BD 3.2.1):**
  - trainersstaf samenstellen en begeleiden;
  - trainers maken hun trainingsplanning *"in samenwerking met / onder toezicht van de HO"*;
  - *"Evaluatie-/beoordelingsgesprekken met trainers en rapportage"*.
- **Taken trainer bovenbouw (BD 3.2.2):** trainingen voorbereiden en leiden; *"het creëren van een optimaal leerklimaat [is] de belangrijkste taak"*.
- **Technisch coördinatoren (BD 3.1):** alleen in de **onderbouw** (O8–O11), als *"spil tussen de trainers, coaches en de Hoofd Opleiding"*. Een **TJC bovenbouw komt in geen van beide documenten voor.**

## 3. Definitieve inhoudelijke keuzes voor Swift (Voorstel Spoor 2)

"Definitief" betekent: vastgesteld door Swift. Dit zijn de keuzes die **uit de bronnen volgen**, met de jouwe van 29-10. Wat de bronnen open laten, staat in §3.7.

### 3.1 Zes observatiecriteria (de kwaliteitsstandaard, inhoud voor OP hoofdstuk 06)

Trainer en begeleider gebruiken dezelfde zes criteria. Er is geen totaalcijfer.

| # | Naam | Bron | Wat je ziet (omschrijving, voorstel) | Toets aan de documenten |
|---|---|---|---|---|
| 1 | **Voetbalechtheid** | KNVB *Voetbalecht trainen* | Richting, doelen, tegenstander en beslissingen; het gekozen voetbalprobleem komt vaak terug. | Past bij BD 2.2 (aanvallend, spelprincipes leidend). |
| 2 | **Veel herhalingen en plezier** | KNVB *Veel prikkels en plezier* | Veel balcontacten en beslissingen, weinig wachten, hoge intensiteit, spelers genieten. | BD 2.1 kernwaarde 1 (*genieten van het spel*), BD 2.2 (*hoogste intensiteit*). **Let op:** de KNVB zegt *prikkels*, jouw naam zegt *herhalingen*. Advies: **"Veel prikkels en plezier"** (KNVB-woord, breder: ook beslissingen en weerstand). |
| 3 | **Organisatie en coaching** | KNVB, zelfde naam | Snel opgezet, effectieve trainingstijd, bijsturen (veld, aantallen, regels). Coaching volgens de Swift-afspraken: *coach het team, niet de speler*, *kaders in plaats van oplossingen*, vragen stellen. | BD 2.4 algemene spelprincipes; OP 02 (*organisatie, coaching, effectieve trainingstijd*). |
| 4 | **Afstemming op de spelers** | KNVB *Afstemming op leeftijd, niveau en beleving* | Moeilijkheid past bij fase en niveau; het lukt vaak genoeg; uitdaging voor de beteren. | BD 2.5 leerlijn (fase 3–5), BD 1.2 (biologische leeftijd). Advies: de **KNVB-naam** gebruiken. |
| 5 | **Methodische samenhang** | Swift | De zes vragen van OP 02 hangen samen: probleem → teamfunctie/teamtaak → doel → gedrag → vorm → coachaccenten. De opbouw loopt naar de partijvorm toe. | OP 02 (letterlijk), OP 04 opgave 2 en 4, OP 05 opleidingsketen. Sterk onderbouwd. |
| 6 | **Veilig en positief leerklimaat** | Swift | Iedereen doet mee, positieve toon, fouten mogen, respect. | BD 1.1 pijler 2, BD 1.3, BD 3.2.2 (*optimaal leerklimaat de belangrijkste taak*), BD 2.1 kernwaarde 6. Sterk onderbouwd. |

**Schaal:** Zichtbaar · Gedeeltelijk zichtbaar · Niet zichtbaar · Niet beoordeeld. "Niet beoordeeld" is een echte keuze, geen leeg vak. Zo kun je eerlijk zeggen dat je iets niet hebt gezien.

### 3.2 Voorbereiding
- **Voorbereiden is altijd vrijwillig en onbeperkt.** Vormenbank en tekentool zijn altijd vrij te gebruiken.
- **Alleen bij een geplande observatie** is een basis nodig:
  - voetbalprobleem;
  - concrete doelstelling;
  - gekozen oefenvormen.
- **Keuzelijsten (uit het profiel):**
  - **Teamfuncties:** Aanvallen · Omschakelen · Verdedigen (BD 2.4; dit is ook de KNVB-indeling).
  - **Teamtaken:** in KNVB-termen. De lijst moet eerst tegen de KNVB-bron worden gecontroleerd. Let op: het bestand `supabase/profielen/knvb-2026.1.json` noemt de teamtaken nu *teamfuncties* en heeft status *controleren*.
  - **Bij elke teamfunctie:** de Swift-spelprincipes van BD 2.4 als hulp ("waar let ik op").
- **De 5 W's** (Wie, Wat, Waar, Wanneer, Waarom) zijn een denksteun. **Hoofdrolspelers** zijn optioneel.
- De zes vragen van OP 02 zijn de vaste volgorde van de voorbereiding.

### 3.3 Trainersscan: twee delen (past op OP 03)

| Deel | Wie vult in | Onderdelen | OP 03-onderdeel |
|---|---|---|---|
| **A. Zelf** | de trainer | opleiding en ervaring · ambitie · sterk in · begeleiding nodig bij · beschikbaarheid · ontwikkelbereidheid | Opleiding, Ambitie, Beschikbaarheid, Ontwikkelbereidheid (korte vragenlijst) |
| **B. Begeleider** | de HJO (of een aangewezen begeleider, zie §3.7) | waargenomen bekwaamheid · ontwikkelpunten uit de observatie · passende ondersteuning · gezamenlijke ontwikkelafspraak | Bekwaamheid (veldobservatie), trainersprofiel, ontwikkelafspraak |

De stappen in de app volgen OP 03:
1. vragenlijst (deel A);
2. profielgesprek;
3. veldobservatie (de zes criteria);
4. trainersprofiel (deel B);
5. ontwikkelafspraak.

### 3.4 Ondersteuningsniveau
- **De namen:** Startend · Ontwikkelend · Zelfstandig/verdiepend.
- **Zichtbaar voor de trainer.**
- **Wat het is:** een ondersteuningsniveau, **geen beoordeling of rangorde**.
- **Hoe het ontstaat:** het diploma bepaalt het niveau niet vanzelf (OP 03). Het niveau wordt in het profielgesprek besproken en kan later worden aangepast.
- **Wat het stuurt:** alleen de hulp (voorbeelden, vragen, hoe vaak begeleiding), nooit welke functies iemand mag gebruiken.
- De niveaus staan niet in OP. Ze zijn een Swift-aanvulling bij opgave 3 (*"op basis van niveau, ambitie en ontwikkelbehoefte"*).

### 3.5 Delen en feedback
1. De trainer deelt **één training**, niet het hele seizoen.
2. **Voorfeedback** op de doelstelling en de oefenvormen, ook op de getekende vorm.
3. Na de training: **zelfreflectie van de trainer** en **observatie van de begeleider**, op dezelfde zes criteria.
4. Daarna **één ontwikkelafspraak**. Die komt bij het volgende moment terug.

### 3.6 Geen verplichte periodisering
OP 08 is nog niet geschreven. De opleidingsketen (OP 05) noemt periodisering wel, maar ClubComm maakt die **niet verplicht**. De bestaande weekfunctie (een thema per week, vrij te kiezen) is genoeg.

### 3.7 Open: niet in de documenten, door Swift te beslissen
1. **Formele vaststelling.** Wie stelt de zes criteria en de niveaus vast?
   - BD 3.2.1: de HO ontwikkelt het beleid *"samen met de jeugdcommissie en voorzitter technische commissie"*.
   - Advies: vaststellen in OP hoofdstuk 06 (kwaliteitsstandaard) en 07 (trainerskader).
2. **TJC bovenbouw.** Deze functie staat niet in BD of OP; BD kent technisch coördinatoren alleen voor O8–O11. Wat mag een TJC: zelf observeren, voorfeedback geven, de trainersscan zien?
3. **Beoordeling tegenover ontwikkeling.** BD 3.2.1 geeft de HO *"evaluatie-/beoordelingsgesprekken met trainers en rapportage"*. Dit voorstel houdt de begeleiding in ClubComm bewust **ontwikkelgericht** (geen cijfer, geen rangorde).
   - Advies: het formele beoordelingsgesprek blijft **buiten** deze route. Anders durft een trainer minder eerlijk te reflecteren.
4. **Leeftijdsdoelen O14–O19.** BD 2.5 geeft per fase alleen een korte kern (zie §2). Concrete leeftijdsdoelen zijn opgave 1 van OP 04 en zijn nog niet geschreven. Tot dan toont de app alleen de fasetekst.
5. **Teamtaken in Swift-woorden.** BD noemt spelprincipes per teamfunctie, geen teamtaken. Voorstel: de KNVB-teamtaken gebruiken, met de Swift-spelprincipes ernaast.
6. **Hoe vaak begeleiding per niveau.** Dat staat niet in OP en hoort in hoofdstuk 07.
7. **Bewaartermijn** van scan, observaties en reflecties (privacy, zie §6).

## 4. De gebruikersroute

### 4.1 Trainer
1. **Kennismaking en scan, deel A** (eenmalig, ongeveer 5 minuten): opleiding en ervaring, ambitie, sterk in, hulp nodig bij, beschikbaarheid, ontwikkelbereidheid.
2. **Profielgesprek** met de HJO (buiten de app). Daarna ziet de trainer zijn **ondersteuningsniveau** en de eerste **ontwikkelafspraak** op Home.
3. **Gewoon trainen.** In Week staan de echte trainingsdagen. Voorbereiden mag altijd, maar hoeft niet; Vormenbank en tekentool zijn altijd vrij.
4. **Er is een observatie gepland.** Op Home verschijnt: *"Observatie di 12-11: bereid deze training voor"*. De training vraagt drie dingen:
   - voetbalprobleem;
   - doelstelling (met de 5 W's als hulp);
   - oefenvormen.
   Teamfunctie en teamtaak kies je uit een lijst. Hoofdrolspelers zijn optioneel.
5. **Delen met [begeleider]:** één tik, alleen deze training. Daarna staat er *"Gedeeld"*. Delen intrekken kan altijd.
6. **Voorfeedback lezen:** een korte reactie op het doel en de vormen. De trainer kan nog aanpassen.
7. **De training geven.**
8. **Zelfreflectie** direct na de training (op Home, één herinnering na 24 uur): de zes criteria op de vierpuntsschaal en een korte notitie.
9. **Gesprek:** de twee perspectieven naast elkaar. Samen maken jullie één **ontwikkelafspraak** en kiezen jullie het **volgende moment** uit het rooster.
10. **De afspraak komt terug:**
    - op Home;
    - bij de volgende voorbereiding;
    - bovenaan het volgende moment.

### 4.2 Begeleider (HJO, of TJC als Swift dat beslist)
1. **Overzicht van trainers.** Ingedeeld op *wat aandacht vraagt*, nooit op prestatie. Per trainer:
   - niveau;
   - laatste moment;
   - open afspraak;
   - volgende moment;
   - of de voorbereiding is gedeeld.
2. **Scan, deel B** na het profielgesprek: waargenomen bekwaamheid, ontwikkelpunten, passende ondersteuning, ontwikkelafspraak en niveau.
3. **Observatie plannen**: kies een training uit het rooster van het team. De trainer krijgt een melding.
4. **Voorfeedback**: alleen lezen (de training, de vormen en de tekening). Eén korte reactie, met de vorige afspraak erbij.
5. **Observatie op het veld** (telefoon): de zes criteria, notities en de leertijd-klok.
6. **Gesprek** (laptop of telefoon):
   - de vorige afspraak bovenaan;
   - de twee perspectieven per criterium naast elkaar, met het verschil gemarkeerd;
   - één ontwikkelafspraak;
   - het volgende moment.
7. **Niveau bijstellen** als dat nodig is: altijd in overleg en zichtbaar voor de trainer.

## 5. Wat al bestaat en wat ontbreekt

### 5.1 Bestaande ClubComm-functies die we hergebruiken

| Onderdeel | Bestaand in ClubComm | Wat het hergebruik vraagt |
|---|---|---|
| Trainingen op echte trainingsdagen, voorbereiden, vrij | Planner, Week, teamrooster (Besluit 128–141, 136) | niets |
| Vormenbank, tekentool, één kiezer | Besluit 139 | niets |
| Begeleidingsmoment: vijf fasen, plannen, verplaatsen, niet doorgegaan | `begeleiding.js` | koppeling aan een training (nieuw veld) |
| Observatie op het veld | A4-observatie, leertijd-klok, ✓ / ~ / – | vragen uit het profiel in plaats van `CC.OBS` in de code; vierpuntsschaal |
| Feedback na afloop | vier vakken (sterk, ontwikkelpunt verplicht, effect, afspraak) | per criterium tonen |
| Zelfreflectie | `REFLECTIE` (3 vragen, pas na delen) | eerder beschikbaar (keuze B), zes criteria |
| Ontwikkelpunt naar traject en dossier | traject per trainer | tonen bij het volgende moment |
| Kennismaking (diploma, ervaring) | traject-kennismaking | uitbreiden tot scan deel A |
| Traject *kort/uitgebreid* | vragenlijst vooraf | vervangen door het ondersteuningsniveau |
| Trainerkaart en dossier | `trainers.js` | dashboardregel per trainer |
| Uitnodigen, functie "HJO bovenbouw" | Besluit 140 | niets |
| Rechten trainer-gegevens | scopes `trainerzelf` (trainer schrijft) en `trainerdossier` (begeleider schrijft, trainer leest) | geschikt voor scan A en B; wel inperken, zie §6 |
| Rechtenvoorstel meekijken | 032 (`.voorstel`, lokaal 56/56) | ombouwen naar *delen per training* |

### 5.2 Wat ontbreekt
1. **Swift-opleidingsprofiel** (gegevens): criteria, schaal, teamfuncties en teamtaken, spelprincipes, leerlijnfases, reflectievragen, niveaus. Swift heeft nu geen profiel.
2. **Profiel leesbaar voor trainers**: nu leest alleen de HO het (scope `hjo`). Dit is een rechtenwijziging.
3. **Velden in de voorbereiding**: voetbalprobleem, teamfunctie, teamtaak, doelstelling, gedrag, coachaccenten en hoofdrolspelers (optioneel).
4. **5W-assistent**: een voorbeeldzin met een vaste regel, die de trainer altijd zelf aanpast. Geen AI.
5. **Koppeling moment ↔ training**: `planId` bij het moment, en *basis nodig* bij een geplande observatie.
6. **Delen per training, intrekken, voorfeedback**: een rechtenwijziging (§6).
7. **Observatie en reflectie op dezelfde zes criteria** met de vierpuntsschaal, en de weergave naast elkaar.
8. **Afspraak komt terug**: op Home, in de voorbereiding en bij het volgende moment.
9. **Trainersscan A en B** en het **ondersteuningsniveau** dat de hulp stuurt.
10. **Dashboard** met *wat aandacht vraagt* (ook *Te doen* in het pakket Trainers, zie de Swift-analyse van 29-10).

## 6. Rechtenvoorstel (concreet, zonder implementatie; maat L)

**Wat er nu is** (gecontroleerd in de migraties):
- Trainingen en vormen hebben scope `eigen`: alleen de trainer ziet ze.
- `trainerzelf`: trainer, clubbeheerder en elke HO/TC lezen **én schrijven**.
- `trainerdossier`: de trainer leest; clubbeheerder en elke HO/TC lezen en schrijven.
- `priv.cc_begeleider()` = iedere HO/TC van de club, **niet per trainer en niet per bouw**.

**Voorstel**

| # | Onderwerp | Regel | Waarom |
|---|---|---|---|
| R1 | **Training delen** | Nieuwe scope `gedeeld` (vervangt `trainerplan` uit 032). De trainer schrijft. De begeleider **leest alleen** als: (a) zijn persoon-id in `data.gedeeldMet` van die training staat, (b) hij in **deze club** de rol HO of TC heeft, en (c) de trainer nog trainer in de club is. | Alleen wat de trainer zelf deelt. Niet het hele seizoen. |
| R2 | **Vormen in een gedeelde training** | Bij delen zet de app een **kopie** van de gebruikte vormen (met tekening) in de gedeelde training. De vormen zelf blijven `eigen`. | Geen tweede rechtenregel op vormen. De begeleider ziet precies wat gedeeld is. Nadeel: de kopie loopt achter tot de trainer opnieuw opslaat (de app doet dat bij elke opslag van een gedeelde training). |
| R3 | **Intrekken** | De trainer haalt de naam uit `gedeeldMet`. De training valt dan terug naar alleen-eigen. Niets wordt verwijderd. | De trainer houdt de regie. |
| R4 | **Koppeling aan een moment** | Het moment (in `trainerdossier`) krijgt `planId`. Het moment geeft **geen** leesrecht: zonder delen ziet de begeleider *"nog niet gedeeld"*. | Plannen is niet hetzelfde als inzage. |
| R5 | **Voorfeedback en feedback** | Een eigen rij per moment in `trainerdossier`. De begeleider schrijft, de trainer leest. De begeleider wijzigt de training **nooit**. | Bestaande scope; er is geen nieuwe nodig. |
| R6 | **Scan deel A** | Scope `trainerzelf` (de trainer schrijft; de begeleider leest na R8). | Bestaande scope. |
| R7 | **Scan deel B en niveau** | Scope `trainerdossier` (de begeleider schrijft, de trainer leest). De trainer ziet zijn niveau, zoals jij wilt. | Bestaand; transparant. |
| R8 | **Inperken wie meeleest** | In `trainerzelf` en `trainerdossier` vervalt *clubbeheerder*. In `trainerzelf` mag de begeleider **alleen lezen**, zodat de reflectie en scan A echt van de trainer blijven. Daarna, als Swift het wil: TC alleen voor de eigen bouw. | Nu leest een clubbeheerder zonder begeleidersrol reflecties en scans, en kan een begeleider de zelfreflectie van een trainer wijzigen. |
| R9 | **HJO/TJC-bevoegdheid** | HJO = rol `hjo` (bestaat). TJC = rol `tc` met `bouwen` (bestaat, maar wordt nog niet afgedwongen). Bij Swift staat de TC nu als HO met een bouw; dat moet rol `tc` worden. Hoeveel een TJC mag, beslist Swift (§3.7). | Geen nieuwe rollen nodig. |
| R10 | **Clubscheiding** | Elke regel controleert `club_id = priv.cc_club()`. *Correctie 29-10 (ronde 4):* de eerdere zorg over `limit 1` klopte niet. `auth_uid` is de primaire sleutel van `public.lid`, dus één account hoort bij precies één club (getest, 10/10 goed). Zie `docs/onderzoek/beveiliging-begeleiding.md`. | Blijft vaste controle. |

**Privacy (welke gegevens, wie, hoe lang)**
- **Gegevens:**
  - scan A en B;
  - niveau;
  - observaties;
  - reflecties;
  - feedback;
  - gedeelde trainingen.
- **Wie ziet ze:**
  - de trainer alles over zichzelf;
  - HO en TC (na R8);
  - nooit ouders, spelers of andere trainers.
- **Hoe lang (voorstel):** het lopende seizoen plus één seizoen. Daarna verwijderen, of alleen de afspraken bewaren als de trainer dat wil. Vastleggen in de privacyverklaring vóór het bouwen.

**Tests (vóór akkoord, lokaal):** `npm run test:veilig` met nieuwe controles:
- niet gedeeld = niet zichtbaar;
- gedeeld met A = niet zichtbaar voor B;
- andere club = niet zichtbaar;
- ingetrokken = niet meer zichtbaar;
- de begeleider kan de training niet wijzigen;
- de clubbeheerder zonder begeleidersrol ziet geen reflectie (R8);
- een account in twee clubs ziet alleen de gekozen club (R10).

Wat lokaal getest is, heet nog niet *gecontroleerd op productie*.

## 7. Gefaseerde bouwvolgorde met afhankelijkheden

| Fase | Wat | Spoor, maat | Hangt af van |
|---|---|---|---|
| **0** | Voorwaarden: herstel eigenaarschap zelfreflectie (zie ronde 4); het profiel veilig leesbaar voor trainers | 3, L | – |
| **1** | **Swift-profiel v1** uit de documenten: de zes criteria met omschrijving, schaal, teamfuncties, spelprincipes BD 2.4, leerlijnfases 3–5, reflectievragen, niveaus. De open punten uit §3.7 blijven gemarkeerd. | 2 (inhoud), 3 (laden) | vaststelling door Swift (§3.7.1) |
| **2** | **Ontwerp van de hele begeleidingsroute**: voorbeeldschermen op 390 px en laptop, met de nieuwe criteria en schaal | 3, M (alleen ontwerp) | 1 (woorden) |
| **3** | **Koppeling training ↔ moment**, delen per training, intrekken, voorfeedback (R1–R5, R8) | 3, L | 0, 2, jouw akkoord op de rechten |
| **4** | **Observatie, reflectie (keuze B), gesprek naast elkaar, één afspraak die terugkomt** | 3, M | 1, 2. Hangt **niet** af van 3: dit kan ook eerst, met het bestaande `actId` |
| **5** | **5W-assistent en de voorbereidingsvelden**; daarna **scan A/B en het niveau** dat de hulp stuurt (R6, R7, privacy) | 3, M en L | 1, 3 (velden bij de gedeelde training), privacytekst |
| **6** | **Pilot** met 3 trainers (startend, ontwikkelend, zelfstandig), een periode van 6 weken, twee momenten per trainer, daarna evalueren | 2 | 3, 4 (5 mag gedeeltelijk) |

**Advies:** fase 4 vóór fase 3. Dan levert het meteen iets op: betere observatie en reflectie, en de afspraak komt terug. Pas daarna komt de rechtenwijziging met alle tests. Dit wijkt af van jouw volgorde, dus jij kiest.

**Bestaande gegevens:** oude observaties met de vragen uit de code blijven zoals ze zijn. Nieuwe momenten gebruiken de zes criteria. Er is geen omzetting van gegevens nodig.
