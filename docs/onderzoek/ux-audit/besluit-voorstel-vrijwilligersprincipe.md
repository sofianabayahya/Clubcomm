# Voorstel algemeen besluit: het vrijwilligersprincipe en de drie lagen

*4-11-2026. Spoor 3. **Voorstel, nog geen besluit.** Het besluitnummer kiezen we pas vlak voor het opslaan. Nu gereserveerd in open werk: 145 (#107), 146 (#108), 148 (#110). Het eerstvolgende vrije nummer is waarschijnlijk **149**. Verwerkt de aanscherpingen van de initiatiefnemer op de audit (`README.md`, §0).*

---

## Besluit [nr] — Vrijwilligersprincipe: ClubComm biedt aan en verplicht niets onnodigs (Spoor 3, algemene ontwerpstandaard)

*Besloten [datum], na de integrale UX-audit (`docs/onderzoek/ux-audit/`) en het akkoord van de initiatiefnemer op de richting. Geldt voor elke club, elke rol en elk toekomstig voorstel. Vult Besluit 30 en 34 aan (vuistregels) en Principe 10.*

**Uitgangspunt:** trainers, teamleiders en begeleiders zijn vrijwilligers, ook als ze een diploma hebben. Hoeveel tijd en ambitie iemand heeft, verschilt. ClubComm werkt daarom zonder extra trainingsadministratie. Wie meer doet, krijgt er meer voor terug.

### 1. De drie lagen zijn gebruiksmogelijkheden
| Laag | Wat de gebruiker kan doen | Ontwerpdoel voor eenvoudige digitale taken |
|---|---|---|
| **Draaien** | niets extra: rooster, afmelden, berichten, vervoer en taken werken vanzelf | 0 min extra |
| **Trainen** | een training voorbereiden, een oefenvorm kiezen of tekenen, printen | een eenvoudige taak (een eerdere training kiezen, printen) in ± 2 min |
| **Ontwikkelen** | begeleiding, reflectie, ontwikkelafspraak, periodisering, Lijn, publiceren in de clubbibliotheek | korte invoer (3 reflectievragen) in ± 5 min |

- Het zijn **geen rollen en geen niveaus**. Een trainer kiest zelf hoeveel hij gebruikt, en kan dat per week anders doen.
- De tijden zijn **ontwerpdoelen voor eenvoudige digitale taken**, geen limiet voor een volledige voorbereiding of een begeleidingsgesprek.
- Laag, diploma, ambitie en ondersteuningsniveau veranderen **nooit rechten** en zetten nooit functies uit.

### 2. Vrijwillig, met drie uitzonderingen
**Vrijwillig** blijven onder andere:
- normale trainingen voorbereiden;
- een oefenvorm tekenen;
- periodiseren en de Lijn gebruiken;
- reflecteren buiten een afgesproken begeleiding;
- echte minuten invullen (Besluit 141);
- publiceren in de clubbibliotheek.

**Wel nodig**, en alleen dit:
1. **Beveiliging en privacy:** inloggen, rechten, clubscheiding en wat een trainer privé houdt. "Niets blokkeert" geldt hier nooit.
2. **Gegevensintegriteit:** geen opslag die gegevens beschadigt; vastgelegde gegevens blijven gelijk (bijvoorbeeld Besluit 147); bevestiging bij verwijderen, met *Ongedaan maken*.
3. **Afspraken tussen mensen:** wat een ander nodig heeft om zijn werk te doen.
   - **Bij een aangekondigde observatie** mag de vereniging een minimale voorbereiding afspreken. **Voor Swift:** voetbalprobleem, doelstelling en de gekozen oefenvormen.
   - De app **vraagt** daar op het moment zelf om (*Je begeleider komt kijken*), legt uit waarom en toont wat ontbreekt.
   - Een gesprek of observatie **blokkeert** hij daar niet om.

### 3. Ontwerpregels (gelden voor elk scherm)
1. **Aanbieden op het moment zelf.** Een functie verschijnt waar de gebruiker al is (bijvoorbeeld bij een lege training), niet als taak op Home.
2. **Leeg is goed.** Een lege toestand = één zin uitleg en hoogstens één knop. Geen *"(0)"*, geen *"x van y ingevuld"*, geen herinnering om iets te vullen.
3. **Eén primaire knop per toestand.** Geen dubbele actie op hetzelfde scherm. Geen uitgeschakelde knop zonder uitleg; verberg hem liever tot hij zin heeft.
4. **Zelfde handeling = zelfde woord.** *Oefenvorm* in knoppen en vensters; de bank heet *Vormenbank*.
5. **Vaktaal met uitleg.** Woorden uit een opleidingsprofiel alleen met één zin uitleg waar de gebruiker ze moet gebruiken. Zonder profiel gewone woorden.
6. **Navigatie blijft gelijk.** Tabbladen verdwijnen niet per club of laag (Besluit 122 en 141). Een onderdeel zonder inhoud toont een begrijpelijke lege toestand.
7. **Eén hoofdstatus per regel** (besluit 4-11); details staan in het venster.
8. **De begeleider beoordeelt niet op invoer.** Geen overzicht met aantallen ingevoerde trainingen per trainer. Wat de trainer zelf aangeeft (ambitie, tijd, gewenste hulp) is leidend.
9. **Meldingen bedekken geen knop** en geven een tik niet door aan een knop die je niet ziet.
10. **Normen** (`docs/app-controle.md`):
    - tikvlak 44 pt (WCAG 2.2 AA: minimaal 24 px);
    - leestekst 16 px;
    - contrast 4,5 : 1;
    - *Ongedaan maken* bij verwijderen of vervangen.

### 4. Toetsing
Elk nieuw voorstel (maat M of L) beantwoordt in één regel per vraag:
1. In welke laag valt het?
2. Wordt er iets verplicht? Zo ja: welke van de drie uitzonderingen geldt?
3. Hoeveel tikken kost de eenvoudigste route op 390 px?
4. Verandert het rechten, gegevens of de navigatie?

**Niet in dit besluit:**
- de clubbibliotheek zelf (rechten, maat L);
- de drie startroutes (wacht op de bibliotheek);
- Lijn verbergen (afgewezen voor nu: eerst een lege toestand, zie `voorstel-drie-kleine-verbeteringen.md`).

---

**Borgen bij akkoord:**
- nieuw besluit bovenaan `docs/besluiten.md` en in het Register;
- Besluit 30 en 34 krijgen *"◐ Aangevuld door Besluit [nr]"*;
- `docs/kaart.md` (algemeen);
- in CLAUDE.md een verwijzing bij *Principe 10*. Dat laatste is een kleine tekstwijziging en alleen met jouw akkoord.
