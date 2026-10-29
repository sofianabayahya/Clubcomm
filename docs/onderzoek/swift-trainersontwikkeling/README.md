# Trainersontwikkeling AVV Swift: gap-analyse en ontwerp

*Onderzoek en ontwerp, 29-10-2026. **Geen besluit, geen bouwopdracht.** Inhoudelijke keuzes voor Swift = **Voorstel Spoor 2**; algemene softwareveranderingen = **Voorstel Spoor 3** (elk apart te besluiten). Er is niets gewijzigd aan code, database, rechten of productie. Voorbeeldschermen in deze map (`1-…` t/m `10-…`, telefoon 390 px en laptop 1280 px; verzonnen trainer "Daan", team JO15-1 ZO).*

## 0. Bronnen: wat er was en wat ontbreekt
| Bron | Status |
|---|---|
| Jeugdbeleidsplan AVV Swift | **Niet aanwezig** in het project of deze sessie. Nodig voor: leeftijdsdoelen, spelprincipes, teamtaken in Swift-woorden. |
| Ontwikkelplan Voetbaltechnische Opleiding Bovenbouw 2026–2027 | **Niet aanwezig.** Gebruikt: alleen de vijf punten van de trainersscan die in de opdracht staan (opleiding, bekwaamheid, ambitie, ontwikkelbereidheid, beschikbaarheid). Schalen in het voorbeeld zijn verzonnen. |
| Trainingsschema Swift 2026–2027 (pdf) | Aanwezig: teams trainen 2 tot 3 keer per week (bijv. JO15-1 ZO di en vr). |
| KNVB-visie goede training, vier trainingsprincipes | knvb.nl was **niet bereikbaar** vanuit deze sessie (netwerk). Uit zoekresultaten van knvb.nl (kennisbank *Wat is een goede voetbalvorm*): (1) lijkt op de wedstrijd / voetbalecht, (2) veel herhalingen, (3) afgestemd op de spelers, het moet kunnen lukken, (4) situatie zo inrichten en bijsturen (veld, doelen, aantallen) dat het doel vaak terugkomt. **Werkhypothese: te controleren tegen de bron in jouw ontwikkelplan** voordat het in het Swift-profiel komt. |

## 1. Wat ClubComm nu ondersteunt
| Vraag | Stand | Toelichting |
|---|---|---|
| Wat kan een trainer voorbereiden en opslaan? | **Bestaand** | Training per activiteit of op datum (`S.trainingsplannen`), blokken met vormen, thema, aantal spelers, gepland en uitgevoerd, evaluatie (Besluit 128–141). Bij Swift: module Trainingen aan, tabblad Training. |
| Meerdere trainingen zelfstandig aanmaken? | **Bestaand** | Per activiteit in de week, of los op datum. |
| Trainingsdagen en frequentie gekoppeld aan het team? | **Bestaand** | Teamrooster (Besluit 136/87): trainingen staan in de kalender zodra er een trainer is; Week toont ze. Trainingsschema laden uit Excel. |
| Tekentool en Vormenbank voor trainers? | **Bestaand** | Eigen vormen met tekening, classificatie, varianten, aantallen; één oefenvormkiezer (Besluit 139). Vormen zijn alleen van de trainer zelf (scope `eigen`). |
| Welke voorbereidingen mag een HJO/TJC zien? | **Ontbreekt** | Trainingen en vormen hebben scope `eigen`: alleen de trainer. Het rechtenvoorstel 032 (*begeleider kijkt mee*, scope `trainerplan`) ligt klaar, lokaal getest (56/56), **niet uitgevoerd**. |
| Feedback van HJO/TJC op een training of vorm? | **Ontbreekt** | In 032 voorzien als veld *Feedback* bij een training (alleen lezen voor de trainer). Op een losse vorm: niet. |
| Begeleidingsmomenten, reflectie, ontwikkelafspraken | **Bestaand** | Vijf fasen (KNVB-cyclus), vragenlijst vooraf (kort/uitgebreid), A4-observatie met ✓ / ~ / – en leertijd-klok, vier vakken met één ontwikkelpunt, delen, reflectie van de trainer (3 vragen, pas na delen), afronden. Ontwikkelpunt gaat naar het traject. |
| Begeleiding koppelen aan een concrete training? | **Gedeeltelijk** | Een moment hangt aan een activiteit (`actId`), **niet** aan de trainingsvoorbereiding van de trainer. De observatie weet dus niet welk doel en welke vormen de trainer koos. |
| Afspraak komt terug bij het volgende moment? | **Gedeeltelijk** | Het ontwikkelpunt staat in het traject en dossier; het volgende moment toont het niet vanzelf bij voorbereiding en gesprek. |
| Ondersteuningsniveaus | **Gedeeltelijk** | Traject heeft *kort/uitgebreid* (vragenlijst). Geen trainersscan, geen niveau dat de begeleiding stuurt. Kennismaking vraagt diploma en ervaring. |
| Observatievragen volgens KNVB-principes | **Gedeeltelijk** | Vaste vragen staan in de code (`CC.OBS`: trainingsdoel, organisatie, leersituatie creëren/beïnvloeden, pedagogisch). Niet per club in te stellen; geen *methodische samenhang*. |
| Trainingsvoorbereiding met teamfunctie, teamtaak, probleem, gedrag, hoofdrolspelers, 5 W's | **Ontbreekt** | Er is een thema en (bij DCG) een methodiekblok uit het profiel. Swift heeft geen opleidingsprofiel. |
| Dashboard HJO/TJC per trainer | **Gedeeltelijk** | Traject-lijst en dossier per trainer. Ontbreekt: voorbereide trainingen (rechten), open afspraken in één overzicht, *wat vraagt aandacht* (zie ook de Swift-analyse van 29-10: geen *Te doen* in het pakket). |

## 2. Ontwerp in het kort (zie de schermen)
1. **Week met echte trainingsdagen** (`1-trainer-week`): de trainer kiest zelf een probleem van de week; per training *voorbereid / nog leeg*; een **voorstel** voor samenhang (herhalen met meer weerstand, contra-thema, iets uit de wedstrijd). Niets verplicht, geen maandthema.
2. **Voorbereiding in zes keuzes** (`2-trainer-voorbereiden`): teamfunctie (Aanvallen/Verdedigen) → teamtaak → voetbalprobleem (eigen woorden) → gewenst gedrag → hoofdrolspelers → vormen, weerstand, coaching. **Alle lijsten komen uit het Swift-profiel** (gegevens), niet uit de code.
3. **Doelstellingassistent** (`3-trainer-doelstelling`): Wie · Wat · Waar · Wanneer · Waarom uit zijn keuzes, een voorbeeldzin die hij altijd zelf aanpast (*Korter*, *Andere woorden*, *Zelf schrijven*). Het leeftijdsdoel uit het profiel staat ernaast. Opbouw van de zin met een vaste regel (geen AI nodig, geen automatische inhoud); later eventueel een taalassistent als apart besluit.
4. **Vormen en delen** (`4-trainer-vormen-delen`): bestaande kiezer en tekentool. Voor een **aangekondigde observatie** een minimale voorbereiding: doelstelling + 2 vormen. Daarna *Delen met [begeleider]*.
5. **Feedback vooraf** (`5-tjc-feedback-vooraf`): de begeleider leest (kan niet wijzigen) en geeft kort feedback; één bericht bij de training.
6. **Observatie** (`6-observatie`): het bestaande A4, met de vragen per club uit het profiel: de vier KNVB-principes + **Swift: methodische samenhang**. ✓ / ~ / –, notities, leertijd. Geen cijfer.
7. **Zelfreflectie** (`7-trainer-reflectie`): 3 korte vragen direct na de training, op Home, één herinnering na 24 uur (keuze B van 29-10). Niet bij elke training verplicht: alleen bij een begeleidingsmoment; bij andere trainingen optioneel.
8. **Begeleidingsgesprek** (`8-gesprek-laptop`): trainer en begeleider **naast elkaar**, de vorige afspraak bovenaan (*zichtbaar?*), **één ontwikkelpunt**, afspraak en vervolgmoment. Geen dubbele invoer: de zelfreflectie en observatie worden getoond, niet opnieuw ingevuld.
9. **Dashboard** (`9-dashboard-laptop`): per trainer momenten, voorbereid, laatste observatie en reflectie, open afspraak, volgende. Gesorteerd op **wat aandacht vraagt**, nooit op prestatie; geen totaalcijfer of ranglijst. Ontwikkeling = tijdlijn van ontwikkelpunten en ✓ / ~ / – per principe.
10. **Trainersscan → ondersteuningsniveau** (`10-trainersscan`): vijf punten, een voorstel, **de HJO kiest**. Niveau stuurt de begeleiding (voorbeelden, vragen, frequentie), **niet de toegang**: iedere trainer houdt dezelfde functies.

**Drie niveaus (Voorstel Spoor 2):**
| | Startend | Ontwikkelend | Zelfstandig |
|---|---|---|---|
| Voorbereiding | zes keuzes met voorbeelden per stap, voorbeeldzin | keuzes zonder voorbeelden, methodische vragen (*waarom deze weerstand?*) | vrij, alleen doelstelling verplicht bij observatie |
| Vormen | voorgestelde vormen bij het probleem (clubbank, na 032) | zelf kiezen, tip bij weerstand | zelf, delen met de club |
| Begeleiding | vaker, korte cyclus (bijv. 1× per 3 weken) | per periode | op verzoek, verdieping |

## 3. Gap-analyse
**3.1 Werkt nu al:** trainingen voorbereiden (meerdere, op de echte trainingsdagen), Vormenbank en tekentool, begeleidingsmoment in vijf fasen met observatie, reflectie en ontwikkelpunt, traject per trainer, uitnodigen.

**3.2 Met bestaande onderdelen op te lossen:**
- Week met echte trainingsdagen en een *probleem van de week*: het weekthema van Besluit 135 bestaat al voor clubs zonder periodisering.
- Observatievragen per club: `CC.OBS` verplaatsen naar het opleidingsprofiel (zelfde opbouw, gegevens).
- Afspraak terug bij het volgende moment: het ontwikkelpunt staat al in het traject; tonen bij voorbereiding en gesprek.
- Zelfreflectie direct na de training: keuze B (al voorgesteld).
- Gesprek naast elkaar: de gegevens bestaan al (observatie, vakken, reflectie); alleen een andere weergave.

**3.3 Echt nieuw:**
- Trainingsvoorbereiding met teamfunctie, teamtaak, probleem, gedrag, hoofdrolspelers (velden in de training, lijsten uit het profiel).
- Doelstellingassistent (5 W's, voorbeeldzin met een vaste regel).
- Koppeling begeleidingsmoment ↔ trainingsvoorbereiding (`planId` bij het moment) en *delen met de begeleider*.
- Feedback vooraf van de begeleider.
- Trainersscan en ondersteuningsniveau.
- Dashboard per trainer.

**3.4 Rollen en rechten (maat L, eerst voorstel en rechtentest):**
- **Begeleider leest trainingen en vormen in een training** → rechtenvoorstel 032 (`trainerplan`, alleen lezen, alleen met traject, vinkje van de club). Aanvulling nodig: *alleen gedeelde trainingen* (keuze van de trainer) of *alle trainingen in het seizoen* (zoals 032 nu). Advies: alleen gedeelde trainingen; minder zicht, meer vertrouwen.
- **Feedback van de begeleider** bij een training: in 032 voorzien.
- **Trainersscan** = gegevens over een persoon, alleen HJO/TJC (scope `hoprive` bestaat al), niet zichtbaar voor de trainer. Privacy: doel, bewaartermijn (einde seizoen + 1?), opnemen in de privacyverklaring.
- **TJC als eigen rol** (`tc`, bestaat al): bij Swift staat de TJC nu als HO met een bouw. Rechten per bouw: in 032 als *keuze voor later*.

**3.5 Hoort bij het Swift-opleidingsprofiel (Spoor 2, gegevens):** teamfuncties en teamtaken in Swift-woorden; leeftijdsdoelen O14–O19; spelprincipes; voorbeelden van gewenst gedrag per leeftijd; observatievragen (KNVB-principes + methodische samenhang, met formulering); de drie niveaus en de schalen van de trainersscan; begeleidingsfrequentie per niveau.

**3.6 Algemene ClubComm-functie (Spoor 3, voor elke club):** de zes keuzes als *structuur* (de inhoud uit het profiel), de doelstellingassistent, delen en feedback vooraf, koppeling moment ↔ training, observatievragen uit het profiel, ondersteuningsniveau en scan als *instrument*, het dashboard, de afspraak die terugkomt. Een club zonder deze profielonderdelen ziet de bestaande, eenvoudige voorbereiding (drie voorwaarden, `docs/architectuur.md`).

## 4. Open vragen
1. Jeugdbeleidsplan en Ontwikkelplan Bovenbouw aanleveren (pdf of tekst in `docs/methodiek/swift/`).
2. De vier KNVB-principes: welke formulering geldt bij Swift (bron)?
3. Mag de begeleider **alle** trainingen zien, of alleen wat de trainer deelt?
4. Trainersscan: wie vult in (HJO, TJC, samen met de trainer?) en ziet de trainer zijn niveau?
5. Omschakelen: alleen Aanvallen/Verdedigen, of later ook de omschakeling als teamfunctie?

## 5. Voorgestelde volgorde (elk een eigen besluit)
1. **Spoor 2:** Swift-profiel opstellen uit de twee documenten (lijsten, leeftijdsdoelen, observatievragen, niveaus).
2. **Spoor 3, M:** *Wat moet ik nu doen?* (analyse 29-10) + zelfreflectie direct na de training (B) + afspraak terug bij het volgende moment.
3. **Spoor 3, L:** rechtenvoorstel 032 bijwerken (*alleen gedeeld*) → akkoord → feedback vooraf en koppeling moment ↔ training.
4. **Spoor 3, M:** trainingsvoorbereiding in zes keuzes + doelstellingassistent (met het Swift-profiel).
5. **Spoor 3, M/L:** trainersscan en niveau (privacy), daarna het dashboard.
