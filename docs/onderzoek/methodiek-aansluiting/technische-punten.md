# Technische punten bij de begrippenlijst (Spoor 3, analyse, 04-11-2026)

*Hoort bij `voorstel-spoor1-begrippenlijst.md` (versie 2). Alleen analyse: er is niets veranderd aan code, profielen, database of productie. De database is alleen gelezen.*

Per punt staat het **belang**:
- **noodzakelijk** — zonder dit klopt iets niet, of werkt een afspraak niet;
- **optioneel** — het helpt, maar het kan ook zonder;
- **later** — eerst iets anders.

En de **maat** volgens CLAUDE.md:
- **S** — kleine aanpassing zonder gevolgen voor wat iemand kan of ziet;
- **M** — nieuwe of gewijzigde functie of scherm;
- **L** — gevolgen voor database, rechten of gegevens.

---

## T1. Een koppeling aanpassen verandert achteraf de minuten — **noodzakelijk** · M, plus een eenmalig script (L-controle)

> **Uitgewerkt in `t1-bouwvoorstel-gereedschap-vastleggen.md` (04-11).** Dat document vervangt het voorstel hieronder.

### Wat ik heb gecontroleerd
- **De afspraak (Besluit 121):** *"Vorm ≠ uitvoering. Een vorm in de bank heeft versies die niet meer wijzigen; een uitvoering op een training is een momentopname met een verwijzing naar de bron."*
- **Hoe het werkelijk werkt:**
  - Een plek op een training bewaart alleen `vormId`, minuten, variant, notitie, niveau, fase en spacing (`MEE` in `training.js`). **Het gereedschap wordt niet bewaard.**
  - De minuten per gereedschap worden **elke keer opnieuw** uitgerekend uit de **huidige** koppeling van de vorm. Dat gebeurt in `CC.trMinuten` (`training.js:440–447`), de maandtelling (`training.js:430`), Lijn (`training.js:623`) en de week (`periodisering.js:67`, `349` en verder).
  - Ook het gereedschap van blok A en B komt uit de eerste vorm, als de trainer zelf niets koos (`training.js:138`).
  - In de Vormenbank wordt de koppeling **direct overschreven** (`vormKies`, `training.js:803–805`). Er is geen versie en geen waarschuwing.
- **Gevolg:** stel dat iemand de vorm "Druk volgen – vrijkomen en opendraaien" omzet van *Aannemen* naar *Vrijkomen*. Dan verschuiven de minuten van de training van **30-10** (al gegeven) ongemerkt naar Vrijkomen. Het gaat om 13 vormen die in de 3 gegeven trainingen staan. Een andere indeling van **vaardigheden** (zoals de derde man) verandert de minuten **niet**.

### Voorstel
1. **Vastleggen bij het geven.** Zodra een training de status *gegeven* krijgt, bewaart elke plek het gereedschap van dat moment: `gs: { primair, ook }`.
   - Is de training nog niet gegeven, dan volgt de plek de vorm. Een verbetering in de Vormenbank werkt dan gewoon door in de planning.
   - `trMinuten` en de andere tellingen gebruiken `gs` als dat er is. Anders gebruiken ze de vorm, zoals nu.
   - `gs` gaat mee bij het verplaatsen (lijst `MEE`, PR #107).
2. **Ook het A/B-gereedschap van een blok** wordt bij het geven vastgelegd, als het uit de vorm kwam.
3. **Melding in de Vormenbank** bij het aanpassen van een koppeling: *"Geldt voor nieuwe en geplande trainingen. Gegeven trainingen houden hun gereedschap."* De melding geeft informatie en vraagt niets.
4. **De 3 gegeven trainingen (27, 29 en 30 okt):** een eenmalig script schrijft daar de **huidige** koppeling als `gs` weg.
   - **Eerlijke kanttekening:** ik kan niet bewijzen dat de koppelingen sinds die dagen niet zijn veranderd. Er wordt geen geschiedenis bijgehouden. Het script legt dus de stand van de dag vast, met in de training de opmerking `gsBron: 'vastgelegd-achteraf'`.
   - Dit script raakt de database, dus het gebeurt **alleen na jouw akkoord**. Zonder script blijven die 3 trainingen de vorm volgen.

**Afgewogen en niet gekozen:** echte versies van vormen. Dat volledig uitwerken van Besluit 121 is veel zwaarder werk, en voor de minuten is het niet nodig. Het blijft in de route van Besluit 121 (fase 2).

**Toetsing:**
- Een koppeling wijzigen na *gegeven* laat de minuten gelijk.
- Vóór *gegeven* volgen de minuten de vorm.
- Verplaatsen houdt `gs`.
- Swift (zonder profiel) werkt precies zoals nu.

## T2. Trainers die geen beheerder zijn, kunnen het clubprofiel niet lezen — **noodzakelijk** voor clubs met een tweede trainer · L

- Profielen hebben de scope `hjo`. Lezen mag dan alleen voor de **clubbeheerder of de coördinator** (`supabase/migrations/025_technisch_coordinator.sql`).
- Bij DCG gaat het nu goed, omdat jij beheerder bent. Een tweede DCG-trainer ziet de methodiek **niet**.
- **Voorstel:** een eigen leesrecht voor de trainersstaf. Lezen mag iedereen met een stafrol in de club; schrijven blijft bij HO/TC en de clubbeheerder.
- Hiervoor is een migratie en een rechtentest nodig. Het wordt een apart L-voorstel. Er staan geen persoonsgegevens in een profiel.

## T3. Andere labels in het DCG-profiel — **noodzakelijk** zodra Spoor 1 vaststelt · S (alleen profielinhoud)

| Code | Nu | Wordt |
|---|---|---|
| `vh-vrijmaken-uit-de-dekkingsschaduw` | Vrijmaken uit de dekkingsschaduw | Loskomen uit de dekkingsschaduw |
| `vh-vertragen` | Vertragen | Afremmen (akkoord 04-11) |
| onderdeel `voetbalproblemen` | getoond als "voetbalprobleem" | "voetbalprobleemcategorie" in de app |
| `tf-omsch-va`, `tf-omsch-av` | teamfunctie | status *vervallen* |

- Werkwijze: profielversie 3 → 4, met een back-up van versie 3 in `supabase/backups/` (zoals op 28-10).
- Er verandert **geen code**. Er hangt niets aan in de trainingen, behalve de **naam** die getoond wordt.
- Akkoord nodig, want dit is een profielwijziging.

## T4. Twee woorden in de app — S

- Op de trainingskaart staat *"accenten in gekozen vormen"* (`training.js:221`). Dat botst met **trainingsaccent**. Het wordt *"handelingen in gekozen vormen"*. **Noodzakelijk** vóór T6.
- De naam van de categorieën komt uit het profiel. Daarvoor is geen code nodig, mits de app overal de naam uit het profiel gebruikt. Dat moet ik nog nalopen.

## T5. Korte evaluatie uit het profiel — **noodzakelijk** · S/M

- Nu staat in de code vast welke vragen open staan: `EV_OPEN = ['ev-probleem', 'ev-gedrag', 'ev-weerstand']` (`training.js:229`).
- **Voorstel:**
  - een lijst `evaluatie.kort` in het profiel: `['ev-probleem', 'ev-gedrag', 'ev-transfer', 'ev-volgende']`;
  - zonder lijst blijft het zoals nu;
  - de vraagtekst van `ev-probleem` blijft **ongewijzigd**: antwoorden bewaren alleen de code en niet de tekst, dus een nieuwe tekst zou de betekenis van oude antwoorden veranderen (zie de begrippenlijst §7).
- De bestaande antwoorden blijven geldig.

## T6. Nieuwe, optionele profielvelden — **noodzakelijk** voor de afspraken in Spoor 1 · M

Allemaal optioneel. Een profiel zonder deze velden laat de app precies zoals nu.

| Veld | Waarvoor | Belang |
|---|---|---|
| `teamtaken` (4, met `teamfunctie` en `intentie`) | keuze in het weekplan en op de kaart | noodzakelijk |
| `overgangsmomenten` (balverlies, balverovering) | optioneel kenmerk bij een situatie of vorm | optioneel |
| `soort` per vaardigheid (`individueel` / `ondersteunend` / `gezamenlijk`) | derde man en overlap als gezamenlijke oplossing | noodzakelijk |
| `trainingsaccenten` (met gereedschap, deelhandelingen en het resultaat dat je waarneemt) | accent per plek | noodzakelijk |
| `observatieaccenten` (scannen) | waar de trainer op let | optioneel |
| `voorbeeldsituaties` (bibliotheek) | kiezen of zelf formuleren | optioneel |
| `herkomst` van een uitdaging (analyse / opleidingslijn) | in het weekplan | optioneel |

- Er is **geen** databasemigratie nodig: het profiel staat als JSON in `rij.data`.
- Wel een nieuwe profielversie, en daarvoor jouw akkoord.

## T7. Accent per plek op de trainingskaart — **noodzakelijk** (Besluit 144 "later") · M

- Een veld `accent` per plek, plus het observatieaccent per training.
- Het gaat mee bij het verplaatsen.
- Eerst een voorbeeld op 390 px.

## T8. Naam van het onderdeel "themalessen" — later · S

- In het profiel staan de 6 tactische onderwerpen onder `themalessen`. Met de afspraak (route en onderwerpen apart) is die naam verwarrend.
- **Voorstel:** later een eigen onderdeel `tactischeOnderwerpen`. Daarnaast komt `themalessen` voor de route, met status *leeg* tot de draaiboeken er zijn.
- In de app hangt hier niets aan, dus er is geen haast.

## T9. Positiegebonden handelingen — later

Nog niets bouwen (afspraak 12).

---

**Volgorde als je akkoord geeft:**
1. T1, omdat het al bestaande gegevens beschermt.
2. T3 + T5 + T4, klein.
3. T6 + T7, samen met oplevering 2.
4. T2, als apart L-voorstel.
