# Wat er in productie verandert (ronde 29-10), ter controle

*Gebouwd en getest op de werkbranch `dcg-methodiek` (ook Besluit 138: Mijn lijn, vaststellen, afgelaste training, vorm kiezen vanuit de vaardigheid): **alle 66 automatische tests groen**, waaronder een nieuwe test die jouw eigen periodiseringsbestand laadt op een nagebootste kalender die gelijk is aan de echte. Er is **nog niets** online gezet en **niets** in de database gewijzigd. Elke stap hieronder krijgt een eigen akkoord.*

## 1. Profiel v3: de definitieve wijzigingslijst (v1 → v3)
Nagekeken: het profiel in de database is nog **exact v1** (controlesom `c550bf9a…`, gelijk aan de reservekopie). Het script werkt alleen in die situatie.

| Soort | Onderdelen |
|---|---|
| **Nieuw (7)** | technische onderbouw, voetbalproblemen (8), leerniveaus (5), leeromgevingen (5), mengpaneel (9 knoppen), handelingsketens (4 voorbeelden), ontwerpprincipes (15) |
| **Aangevuld (10)** | visie (+ cyclus), doelgroep (+ leeftijdsfase), leerlijnen (+ principe, spelersvraag, kant; de 6e leerlijn krijgt de naam *Afwerken*; **nieuw 29-10: 37 vaardigheden als concept**, zie `profiel-v3-controle.md`), spelprincipes (8 lege plekken), leerdoelen per leeftijd (opbouw), methodiek (+ noot over de fasen), trainingsopbouw (2 sjablonen), periodisering (model en weekformat), evaluatie (kaart), termen (*lokken*) |
| **Ongewijzigd (2)** | teamfuncties, themalessen |
| **Verwijderd** | niets |

**Controle wat behouden blijft:**
- **Leerlijnen:** alle 6 ids blijven gelijk (`ll-1v1-aanvallend`, `ll-aannemen`, `ll-passen`, `ll-vrijkomen`, `ll-1v1-verdedigen`, `ll-6`). Jouw bestaande vormen en de training van 27-10 blijven dus gekoppeld.
- **Acht voetbalproblemen en vijf leerniveaus:** staan volledig in v3 (in v1 bestonden ze nog niet).
- **DCG 75-sjabloon:** let op, dit stond **niet** in v1 (*trainingsopbouw* was daar nog leeg). Het komt er in v3 bij: *DCG 75 – spacing* (start 8 · A1 6 · S 3 · A2 10 · B1 6 · S 3 · B2 10 · partij 22) en *DCG 75 – afwisselend*. Je bestaande trainingen (27-10 en een losse training) gebruiken geen sjabloon en veranderen niet.

## 2. Wat de import in de database schrijft (pas na *Toevoegen* in de app, door jou)
Gemeten in de nagebootste club met jouw bestand `periodisering-o13-import-CONCEPT.csv`:

| Wat | Aantal | Soort / scope | Voorbeeld-id |
|---|---|---|---|
| Conceptraining (methodiek + lege plekken volgens DCG 75) | **23** | `trainingsplannen`, scope `eigen` (alleen jij) | `tp-a-o12-20261105` |
| Weekplan (weekprobleem; bij een wedstrijdweek de 3 observatiepunten) | **8** | `trainingsplannen` (week), scope `eigen` | `wk-O12-1-2026-11-02` |
| Kalenderactiviteiten, tijden, tegenstanders | **0 gewijzigd** | — | — |
| Oefenvormen, tekeningen, varianten | **0** | — | — |
| Bestaande trainingen (27-10, losse training) | **0 gewijzigd** | — | — |

Terugdraaien kan in de app (*Terugdraaien…*). Dat verwijdert alleen concepten die je niet hebt aangepast en die niet gegeven zijn.

**Belangrijk (scope `eigen`):** de concepten zijn van wie ze laadt. Laad jij ze, dan zie alleen jij ze. Een andere trainer of de HO ziet ze niet. Zie de vragen over delen in `docs/onderzoek/trainingstab-2026-10-29.md`.

## 3. Contrathema: koppeling ter controle
| Jouw tekst (blijft staan) | Gekoppeld aan | Zeker? |
|---|---|---|
| Vooruitgang van tegenstander voorkomen: jagen en as sluiten (wk 44) | 6 Vooruitgang van de tegenstander voorkomen | ja |
| Vooruitgang voorkomen: passlijn door as sluiten (wk 45) | 6 | ja |
| Vooruitgang voorkomen: druk en rugdekking (wk 46) | 6 | ja |
| Vooruitgang voorkomen: verdedigen richting eigen doel (wk 47) | 6 | ja, maar kijk mee: het gaat om een kans voorkomen, en daar is geen eigen probleem voor |
| Vooruitgang creëren: onder druk uitspelen (wk 48) | 2 Vooruitgang creëren | ja |
| Bal behouden onder druk (wk 49) | 1 Bal behouden onder druk | ja |
| Vooruitgang voorkomen: gezamenlijk drukzetten (wk 50) | 6 | ja |
| **Vooruitgang tegenstander voorkomen en bal veroveren (wk 51)** | **leeg, jij kiest:** 6 primair + 7 ondersteunend, of 7 primair + 6 ondersteunend | **nee** |

## 4. Wedstrijdtijden
ClubComm heeft **nog geen directe koppeling met Sportlink** (de Club.Dataservice-sleutel staat bij Openstaand). De wedstrijden komen uit een **Sportlink-kalenderbestand dat op 17-10 om 23:39 is gemaakt** (dat staat in de code van elke wedstrijd). Daarna is er in ClubComm nog aan gewerkt:

| Wedstrijd | In ClubComm | Verzamelen | Laatst gewijzigd in ClubComm | In jouw bestand |
|---|---|---|---|---|
| za 31-10 Atletico (uit) | 11:00 | 10:00 | 27-10 08:34 | 11:00 ✓ |
| za 7-11 Zwanenburg (thuis) | 12:30 | 11:30 | 23-10 15:16 | 12:30 ✓ |
| **za 14-11 Sporting Martinus (uit)** | **12:45** | 11:45 | 17-10 20:15 (sinds de import niet gewijzigd) | 11:35 |
| **za 21-11 AGB (uit)** | **12:30** | 11:30 | 17-10 20:15 | 10:30 |
| **za 28-11 Buitenveldert (thuis)** | **14:30** | 13:30 | 23-10 15:16 | 10:30 |
| za 5-12 SCPB'22 (uit) | 09:00 | 08:00 | 17-10 20:15 | 09:00 ✓ |

**Ik kan Sportlink zelf niet inzien.** Kijk de drie vetgedrukte wedstrijden na in Sportlink of in de app Voetbal.nl. Klopt ClubComm niet, pas de tijd dan aan in ClubComm (Planning). De import verandert nooit een tijd.

## 5. Eén complete trainingsweek (week 45)
Schermafbeeldingen op telefoonformaat in `docs/onderzoek/periodisering-o13/stap3/`:
- `week45-telefoon.png`: di 3, do 5 en vr 6 nov (compact blok, leerniveau Uitvoeren → Herkennen → Kiezen → Afstemmen) en za 7 nov (drie observatiepunten).
- `aanpassen-telefoon.png`: het venster *Methodiek van deze training* met alle velden die je wilde kunnen aanpassen.
- `laden-voorbeeld-telefoon.png`: het voorbeeld vóór *Toevoegen*.

## 6. Volgorde van de akkoorden
1. **Publiceren** van de nieuwe app-versie (Vercel). Zolang het profiel v1 is, merkt niemand er iets van.
2. **Profielmigratie**: het script v1 → v3 uitvoeren, controleren dat versie 3 erin staat (terugzetten kan met het terugdraaiscript).
3. **Periodisering laden**: jij, in de app, met het voorbeeld vooraf.
