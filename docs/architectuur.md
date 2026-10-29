# Architectuur van ClubComm

*Vastgelegd 29-10-2026 (documentatieronde drie sporen). Dit beschrijft hoe ClubComm is opgebouwd en waar het beter moet. Het is **geen besluit en geen bouwopdracht**: afspraken staan in `docs/besluiten.md`; wat in welk spoor gebeurt, staat in `docs/sporen.md`.*

## 1. Vier lagen

| Laag | Wat | Wie bepaalt | Waar het nu staat |
|---|---|---|---|
| **1. Platform** | Schermen, rechten, opslag, automatische berichten, publicatie. Werkt voor iedereen gelijk. | Spoor 3 | `public/app/*.js`, `supabase/migrations/`, `supabase/functions/` |
| **2. Vereniging** | Welke onderdelen een club gebruikt, haar teams, seizoen, regels en rollen. | Clubbeheerder (binnen wat het platform toelaat) | `S.club` (o.a. `pakket`, `modules`, `labels`, `regels`), `S.teams`, rollen |
| **3. Opleidingsprofiel** | De voetbalinhoud: visie, leerlijnen, voetbalproblemen, leerniveaus, sjablonen, weekformat. | De eigenaar van de methodiek (Spoor 1, Spoor 2 of de KNVB-standaard) | Database, soort `profiel`; bron en opbouw in `supabase/profielen/` |
| **4. Trainer** | Eigen vormen, trainingen, evaluaties, traject en ontwikkeling. | De trainer zelf (de begeleider kijkt mee volgens de rechten) | `S.vormen`, `S.trainingsplannen` (scope `eigen`), traject en dossier (scopes `trainerzelf`, `trainerdossier`) |

Een club kiest in laag 3 uit drie mogelijkheden (`modus` in het profiel, Besluit 123): de **KNVB-standaard** (`standaard`), de **KNVB met clubspecifieke aanvullingen** (`afgeleid`) of een **volledig eigen opleidingsmethodiek** (`eigen`). De persoonlijke methodiek (Spoor 1) wordt nooit automatisch overgenomen.

Elke laag gebruikt alleen de laag erboven, nooit andersom:
- het profiel kent geen schermen;
- de code kent geen methodiek;
- de trainer verandert het profiel niet.

## 2. Drie aparte voorwaarden om iets te tonen

Een functie verschijnt alleen als **alle drie** kloppen. Elke voorwaarde wordt apart gecontroleerd, en geen enkele mag de andere vervangen.

| Voorwaarde | Vraag | Bestaande code |
|---|---|---|
| **1. Beschikbaarheid** | Heeft de club dit pakket of deze module? | `CC.pakketTrainers` (`trainers.js`), `S.club.modules` (taken, vervoer, speeltijd, beoordeling, beloningen, materiaal, training), `CC.trainingAan` (`training.js`) |
| **2. Methodologische inhoud** | Staat in het actieve profiel wat deze functie nodig heeft? | `actief(S)` / `CC.trMethodiekActief` (`periodisering.js`: het profiel heeft voetbalproblemen en leerniveaus), `methodiekActief(S)` en `ond(S, …)` (`training.js`) |
| **3. Bevoegdheid** | Mag deze persoon dit zien of doen? | Database: scopes en `priv.cc_mag` (rechten per rij), getest met `priv.rechtentest()`. App: `CC.rol()`, `CC.werkgebied` (`hjo.js`) |

**Wat beter moet**
- **Voorwaarde 1 en 3 lopen door elkaar.** `CC.trainingAan` controleert de module én de rol `trainer` in één regel. Beter: twee aparte vragen.
- **Voorwaarde 2 is per scherm anders geregeld.** Er zijn twee varianten van "methodiek actief" (`periodisering.js` en `training.js`). Beter: één vraag per onderdeel van het profiel, bijvoorbeeld "heeft dit profiel leerniveaus?".
- **Het profiel is niet leesbaar voor trainers.** Profielen hebben scope `hjo`: alleen de HJO, clubbeheerder en coördinator lezen ze. Een trainer ziet de methodiek nu alleen in de demo of als hij ook beheerder is. Dit vraagt een rechtenvoorstel met een controle in de rechtentest (Spoor 3, na akkoord).
- **Het actieve profiel wordt geraden.** `profiel(S)` in `training.js` neemt het profiel met de club-id, anders `club.profiel`, anders **het eerste profiel dat er is**. Dat laatste kan bij meer profielen het verkeerde zijn. Beter: alleen `club.profiel` (of de club-id); geen profiel = de functie is uit.
- **De KNVB-standaard wordt niet geladen.** `opslag.js` leest alleen profielen uit de database; `knvb-2026.1.json` is alleen een bestand. Een club zonder eigen profiel (zoals Swift) heeft dus geen methodiek.

## 3. Methodiek die nog in de code staat

Volgens Besluit 123 hoort methodiek in het profiel. Deze stukken staan nog in de code:

| Waar | Wat | Gevolg |
|---|---|---|
| `training.js` (`blokSoort`, `code`, `GROEPNAAM`, `BLOKKLEUR`) | Vaste blokcodes Start · A · B · S (spacing) · P (partij) | Een profiel met een andere opbouw past er niet in |
| `periodisering.js` (`KOLOMMEN`, `ALIAS`) | Vaste CSV-kolommen, met namen uit het Excel-spoorboekje van Spoor 1 | Een andere club met een eigen periodisering moet dezelfde kolommen gebruiken |
| ~~`training.js` (`vkHtml`, Besluit 138) en PR #92 (`kiezen`, `aanbevolen`)~~ | ~~Twee manieren om een oefenvorm te kiezen~~ | Opgelost in Besluit 139: één kiezer (`advies`, `kvHtml`); de vormtypes per blok (`TYPE_BLOK`: Start = droog, rondo, duel; Partij = partij) staan nog in de code, net als de blokcodes |
| `periodisering.js` (`CC.trMijnLijn`) tegenover het weekthema met tabel (Besluit 135) | Twee verschillende Lijn-schermen | Andere bediening per profiel |

Dit wordt opgelost per onderwerp, met een eigen besluit en de test *Zoals Swift* groen. Niet alles tegelijk.

## 4. Stabiele basis, weinig instellingen

ClubComm werkt meteen goed met de standaard. Een club stelt alleen in wat echt verschil maakt.

**Instellingen die er nu zijn**
- **Club:**
  - `pakket`;
  - `modules` (7 aan/uit);
  - `labels` (eigen woorden);
  - `coordinatorAan`;
  - `bouwen` en `groepen`;
  - `seizoen` en `vakanties`;
  - `regels`;
  - `schemaVanaf`;
  - `ingericht`.
- **Per trainer:** traject (niveau kort/uitgebreid, leerdoel, plan wedstrijd of training) en kennismaking.

**Regels voor nieuwe instellingen**
- Alleen een instelling als clubs echt verschillend werken, niet omdat het kan.
- Een instelling heeft altijd een goede standaardwaarde. Wie niets instelt, krijgt een werkende app.
- Methodiek is **geen instelling** maar profielinhoud (laag 3).
- Een functie die alleen voor één profiel bestaat, krijgt geen eigen knop of instelling. Ze verschijnt vanzelf als het profiel de inhoud heeft (voorwaarde 2).

## 5. Consistente bediening, profielafhankelijke inhoud

Het tabblad Training heeft overal dezelfde vier onderdelen, met dezelfde betekenis (Besluit 135):

| Onderdeel | Betekenis | Altijd gelijk | Hangt af van het profiel |
|---|---|---|---|
| **Lijn** | Ontwikkeling en opleidingsplanning | Plaats, naam, periode-overzicht per week | Wat er per week staat (thema, voetbalprobleem, leerniveau) |
| **Plannen** | Voorbereiden | Een training opbouwen uit blokken, vormen kiezen, slepen op de laptop | Welke blokken, welk sjabloon, welke redenen bij een voorstel |
| **Week** | Uitvoeren, terugkijken, evalueren | De training van vandaag bovenaan, aanwezigheid, evaluatie na afloop | Welke evaluatievragen en observatiepunten |
| **Vormen** | Zoeken, maken, hergebruiken | Zoeken, filters, vorm openen en in een training zetten | Welke classificatie en filters (gereedschap, vaardigheid, leerniveau) |

**Regel:**
- Een trainer die van club of profiel wisselt, vindt alles op dezelfde plek en bedient het op dezelfde manier.
- Alleen de woorden en keuzes binnen een scherm komen uit het profiel.
- Een nieuw scherm voor één profiel is niet de bedoeling. Breid het bestaande scherm uit met gegevens uit het profiel.

## 6. Zo gebruik je dit document

Vóór elke wijziging aan de trainingsmodule of een profielfunctie:
- Bij welke **laag** hoort dit?
- Welke van de **drie voorwaarden** bepaalt of het zichtbaar is? Staan ze apart?
- Staat er **methodiek in de code**? Hoort die in het profiel?
- Blijft de **bediening** van Lijn · Plannen · Week · Vormen gelijk?
