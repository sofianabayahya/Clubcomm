# Fase 1: methodologisch fundament en periodisering O13 (voorstel 28-10-2026)

*Technisch voorstel ter goedkeuring. Er is nog **niets** gewijzigd in de database. Bronnen: de opdracht van de initiatiefnemer (fasering, kerndocument v1.0 van 26-09-2026, spacing-modellen). **Let op:** het kerndocument zelf, het HO-spoor en het Trainersspoor staan niet in de repository. Dit voorstel gebruikt de lijsten uit de opdracht (6 gereedschappen, 8 voetbalproblemen, 5 leerniveaus). Wil je dat de gedragsbeschrijvingen letterlijk uit het kerndocument komen, voeg het document dan toe (bijv. als PDF of markdown in `docs/methodiek/`).*

Voorbeelden: `voorbeeld-training-laptop.png` en `voorbeeld-training-telefoon.png`.

---

## 1. Wat werkt al (in de app)

| Onderdeel | Status in de app |
|---|---|
| 5 gereedschappen als leerlijnen met een kern (manipuleren, voorbereiden, helpen, timen, controleren) | ✅ werkt |
| Kant per gereedschap (aanval/verdediging) voor het weerstand-perspectief | ✅ code klaar; **niet actief**, want de database heeft v1 |
| Sjabloon DCG 75 (A1 · S · A2 · B1 · S · B2 · partij) | ✅ code klaar; **niet actief** (database v1) |
| Leerdoel per blok (A = …, B = …), afwijken mogelijk | ✅ werkt |
| Methodische fasen (oriëntatie, oefenleer, toepassing) als voorstel | ✅ werkt (staan al in v1) |
| Gepland ≠ uitgevoerd, minuten per hoofdleerdoel, Lijn | ✅ werkt |
| Terugblik (gegeven, echte minuten, wat anders) | ✅ werkt |
| Dupliceren, varianten, ↑ ↓ verplaatsen | ✅ werkt (het venster sluit nog per stap → fase 2) |
| Spacing als vrije activiteit die niet meetelt voor een leerdoel | ✅ werkt |

## 2. Wat ontbreekt nog in de database

Het DCG-profiel in Supabase is **versie 1**: ongewijzigd sinds de invoer van 27-10, gecontroleerd op 28-10. Daaruit volgt:
- **v2 is nooit actief geworden:** geen kant per leerlijn, geen sjabloon, geen plekken voor spelprincipes.
- **6e gereedschap:** staat als `ll-6`, zonder naam en met status *controleren*. Het moet worden: *Afwerken – Benutten*.
- **De 8 universele voetbalproblemen** ontbreken.
- **De 5 methodologische leerniveaus** ontbreken.
- **Evaluatievragen** zijn leeg.
- **Periodisering:** alleen de principes staan erin; er is geen planning per week of training.
- **Model 2 (afwisselend oefenen)** heeft nog geen sjabloon.

**Wat er al is:**
- 23 trainingen (di/do/vr 17:15–18:30) tussen 29-10 en 18-12;
- 6 wedstrijden op 31-10, 7-11, 14-11, 21-11, 28-11 en 5-12 (12-12 en 19-12 geen wedstrijd);
- 7 eigen vormen;
- 1 training (27-10).

Geen van de vormen verwijst naar `ll-6`. Er hangt dus niets aan dat id.

## 3. Welke gegevens moeten worden aangepast (profiel v3, in één keer)
Alleen onderdelen erbij of aangevuld. **Geen id verandert**, niets wordt weggehaald.

| Onderdeel | Wijziging |
|---|---|
| `leerlijnen` | kant per gereedschap (zoals v2); **`ll-6` krijgt naam *Afwerken*, kern *benutten*, status *eigen*** (zelfde id, dus geen kapotte koppelingen); noot: *Ball Mastery is technische onderbouw, geen 7e gereedschap* |
| `voetbalproblemen` (nieuw) | 8 items `vp-1` … `vp-8` met naam en teamfunctie: 1–5 aanvallen, 6–7 verdedigen, 8 omschakelen (beide richtingen) |
| `leerniveaus` (nieuw) | 5 items `ln-uitvoeren`, `ln-herkennen`, `ln-kiezen`, `ln-afstemmen`, `ln-aanpassen`; noot: *los van de methodische fasen; geen verplichte volgorde; het beoogde leerproces, geen bewezen beheersing* |
| `spelprincipes` | 8 lege plekken (zoals v2) |
| `leerdoelenPerLeeftijd` | structuur voor observeerbaar gedrag (zoals v2) |
| `trainingsopbouw` | twee sjablonen: **DCG 75 – spacing** (model 1, zoals v2) en **DCG 75 – afwisselend** (model 2, zie §6) |
| `evaluatie` | 6 vragen (zie §8), status *eigen* |
| `versie` | 3 |

**De app** leest de nieuwe onderdelen. Ontbreken ze, dan werkt alles zoals nu. De Swift-standaard (KNVB) wordt niet aangeraakt.

## 4. Hoe voorkomen we gegevensverlies
1. **Reservekopie vooraf:** het huidige profiel (v1) staat in `supabase/backups/2026-10-28_dcg_profiel_v1.json` (in git). De database-backups van Supabase blijven daarnaast bestaan.
2. **Alleen gerichte wijzigingen:** `jsonb_set` per onderdeel, alleen `where versie < 3`. Twee keer uitvoeren doet niets extra.
3. **Geen id's wijzigen of verwijderen:** `ll-6` blijft `ll-6`; bestaande vormen, koppelingen en de training van 27-10 blijven ongemoeid.
4. **Concept-trainingen:** `insert … on conflict do nothing`, en alleen voor een training zonder bestaande voorbereiding (`not exists`). Bestaat er al iets, dan blijft dat staan.
5. **Eerst testen:** alles eerst in de nagebootste database (`npm test`), met een test die controleert dat een bestaande training niet wordt overschreven. Vóór het echte uitvoeren een **telquery** (hoeveel rijen worden het?) en die aan jou laten zien.
6. **Terugdraaien kan:** de concept-trainingen krijgen `bron: "periodisering-2026-10"`. Een terugdraai-script verwijdert alleen concepten die nog niet zijn aangepast (`bijgewerkt` = invoermoment), en zet het profiel terug uit de reservekopie.
7. **Rechten blijven gelijk:** geen nieuwe soort gegevens, scope `eigen` (alleen jij). De rechtentest hoeft niet te veranderen.

## 5. Periodisering in ClubComm (technisch)
- **Per training:** een blok *Periodisering* in de bestaande training (soort `trainingsplannen`, scope `eigen`). Het bevat:
  - hoofdthema, teamfunctie, primair voetbalprobleem, contra-thema;
  - gereedschap A en B (= het leerdoel van blok A en B, afwijken kan), ondersteunende gereedschappen;
  - beoogd leerniveau (instelbaar);
  - gewenst observeerbaar gedrag en de wedstrijdgerichte toepassing.
- **Per week:** een weekplan (ook `trainingsplannen`, met `soort: "week"`, zonder activiteit):
  - weekthema, teamfunctie, probleem, contra-thema;
  - de wedstrijd van die week met 2–3 **observatiepunten (concept)**;
  - *na de wedstrijd*: wat je zag en wat je de volgende week aanpast.
  - Zichtbaar in **Lijn** (per week) en rechts in **Plannen**.
- **Status wordt berekend, nooit ingevuld:**
  - **Gepland:** er is een periodisering, maar niet alle plekken zijn ingevuld;
  - **Uitgewerkt:** elke plek (behalve ombouw) heeft een vorm, of bij spacing een naam, en elke vorm heeft een tekening of organisatie;
  - **Gegeven:** *Training is gegeven* staat aan.

  Een lege, methodisch voorbereide training kan dus **nooit** als *Uitgewerkt* verschijnen.
- **Op de telefoon** is het blok ingeklapt tot één regel (*Vooruitgang creëren · probleem 2 · A Aannemen · B Passen · Herkennen*). In het voorbeeld staat het nog open; dan is het te lang.

## 6. Spacing en afwisselend oefenen (jouw vraag)

**Wat kan al:**
- Volgorde A1 → B1 → A2 → B2 met ↑ ↓.
- Spacing weghalen.
- Spacing als korte activiteit die niet meetelt voor een leerdoel.
- Dezelfde vorm of een variant opnieuw gebruiken (Dupliceren + variant).
- Het totaal van de minuten tonen.

**Wat ontbreekt:**
- Een sjabloon voor model 2 (nu moet je slepen of schuiven, en spacing weghalen).
- Een duidelijke kop bij een terugkerend blok (nu staat er twee keer *A ·*).
- De vraag *was het gedrag bij terugkeer weer zichtbaar?*

**Voorstel (zo min mogelijk nieuw):**
- **Twee sjablonen in het profiel** (alleen gegevens):
  - **DCG 75 – spacing:** start 8 · A1 6 · S 3 · A2 10 · B1 6 · S 3 · B2 10 · partij 22 · ombouw 7 = 75;
  - **DCG 75 – afwisselend:** start 8 · A1 7 · B1 7 · A2 12 · B2 12 · partij 22 · ombouw 7 = 75. *De 6 minuten spacing gaan naar de vormen; keuze aan jou.*
- **In de training:** bij een lege training staan twee knoppen. Het totaal toont *75 van 75*, en geel bij een afwijking.
- **Terugkerend blok:** de tweede keer staat er *A · terugkeer*.
- **Evaluatie:** komt een gereedschap terug (A1 → A2), dan staat in de terugblik de vraag *Gedrag bij terugkeer opnieuw zichtbaar? ja · deels · nee*.
- **Swift:** de sjablonen staan in het DCG-profiel. Swift (KNVB) ziet ze niet.

## 7. Conceptperiodisering 29-10 t/m 18-12 (methodologisch: eerst met ChatGPT bespreken)
*Cyclisch: problemen en gereedschappen komen terug op andere leerniveaus. Per week één hoofdprobleem en een contra-thema. Per dag een ander accent: di = uitvoeren/herkennen, do = kiezen/afstemmen, vr = afstemmen/aanpassen richting zaterdag. De leerniveaus zijn beoogd, niet lineair.*

| Week | Wedstrijd | Teamfunctie · hoofdprobleem | Contra | Di | Do | Vr |
|---|---|---|---|---|---|---|
| 44 | za 31-10 Atletico CA O13-5 | Aanvallen · 2 Vooruitgang creëren | 6 | — | A Aannemen · B Passen · *Herkennen* | A Passen · B Vrijkomen · *Kiezen* |
| 45 | za 7-11 Zwanenburg O13-1 | Aanvallen · 1 Bal behouden onder druk | 7 | A Vrijkomen · B Aannemen · *Uitvoeren* | A Passen · B Vrijkomen · *Kiezen* | A Aannemen · B Passen · *Afstemmen* |
| 46 | za 14-11 Sporting Martinus O13-4 | Verdedigen · 6 Vooruitgang voorkomen | 2 | A 1v1 verdedigen · B Passen · *Uitvoeren* | A 1v1 verdedigen · B Vrijkomen · *Afstemmen* | A 1v1 verdedigen · B Aannemen · *Aanpassen* |
| 47 | za 21-11 AGB O13-1 | Aanvallen · 3 Voordeel uitspelen | 8 | A 1v1 aanvallend · B Passen · *Herkennen* | A Passen · B 1v1 aanvallend · *Kiezen* | A Vrijkomen · B Passen · *Afstemmen* |
| 48 | za 28-11 Buitenveldert O13-2 | Omschakelen · 8 Nieuwe situatie na balwinst/-verlies | 1 | A 1v1 verdedigen · B Passen · *Herkennen* | A Passen · B Vrijkomen · *Kiezen* | A 1v1 verdedigen · B 1v1 aanvallend · *Aanpassen* |
| 49 | za 5-12 SCPB'22 O13-5 | Aanvallen · 4 Scoringskans creëren (+5) | 6 | A 1v1 aanvallend · B Afwerken · *Uitvoeren* | A Passen · B Afwerken · *Kiezen* | A Vrijkomen · B Afwerken · *Afstemmen* |
| 50 | geen | Verdedigen · 7 De bal veroveren | 2 | A 1v1 verdedigen · B Aannemen · *Herkennen* | A 1v1 verdedigen · B Passen · *Afstemmen* | A 1v1 verdedigen · B Vrijkomen · *Aanpassen* |
| 51 | geen | Herhaling · 5 Scoringskans benutten + 1 | 7 | A Afwerken · B Aannemen · *Kiezen* | A 1v1 aanvallend · B Afwerken · *Aanpassen* | A Passen · B Afwerken · *Aanpassen* |

**Per week vul ik (concept) in:**
- gewenst observeerbaar gedrag, bijv. wk 44: *kijkt vóór de aanname over de schouder en neemt open aan, weg van de druk*;
- de wedstrijdtoepassing;
- 2–3 observatiepunten voor de wedstrijd.

Dat zijn voorstellen om met ChatGPT te toetsen. **Geen oefenvormen, geen tekeningen.**

## 8. Evaluatie (in de bestaande terugblik, geen tweede systeem)
Onder *Training is gegeven* komen zes korte vragen, elk *ja · deels · nee* (één tik):
1. Ontstond het bedoelde voetbalprobleem?
2. Was het gewenste gedrag zichtbaar?
3. Was de weerstand passend?
4. Waren er echte keuzes?
5. Was er transfer naar vrijer spel?
6. (Alleen bij terugkeer A1 → A2) Gedrag bij terugkeer opnieuw zichtbaar?

De bestaande vraag *Wat doe je de volgende keer anders?* = **Welke aanpassing doen we de volgende keer?** Die staat bij de volgende training van hetzelfde gereedschap bovenaan als herinnering. In de Lijn komt per week een kolom *ja/deels/nee*.

## 9. Delen met de teamstaf en de HJO (alleen onderzoek, geen wijziging)

| Optie | Wat | Risico |
|---|---|---|
| A. **Lezen voor de teamstaf** (trainers + teamleiders van hetzelfde team) | nieuwe scope `teamstaf` voor trainingen die je *deelt*; schrijven blijft alleen bij de maker | klein; nieuwe rechtenregel + rechtentest |
| B. A + **HJO/HO lezen** | ook de HO van de club ziet gedeelde trainingen (begeleiding) | middel; HO ziet al de begeleidingsmomenten, dit past bij Besluit 99 |
| C. Samen bewerken | teamstaf kan ook wijzigen | groter; botsingen, wie is eigenaar |

**Advies:** A, en later B. Alleen trainingen die je zelf *deelt*, nooit vanzelf. Dit vraagt een migratie met rechtentest en dus **apart akkoord**. Niet in fase 1.

## 10. Wat veilig automatisch kan, en wat jouw akkoord vraagt

| Stap | Risico | Akkoord nodig? |
|---|---|---|
| Code: periodisering-blok, status, sjabloonkeuze, evaluatievragen, weekplan in Lijn (met tests) | geen gegevens | Ja: dit is een nieuw scherm (de voorbeelden hierboven) |
| Profiel v3 (§3) in de database | laag (gericht, reservekopie, terugdraaibaar) | **Ja** |
| 23 concept-trainingen + 8 weekplannen (§7), lege plekken, zonder vormen | laag (`on conflict do nothing`, niets overschreven, terugdraaibaar) | **Ja**, ná jouw akkoord op de inhoud van §7 (met ChatGPT) |
| Delen met teamstaf/HJO (§9) | rechtenwijziging | **Ja, apart** (later) |
| Swift KNVB-inhoud | apart traject | fase 3 |

## 11. Fase 2 en 3 (niet nu)
- **Fase 2:**
  - mobiele tekentool met één bovenbalk (meer ruimte voor het veld);
  - verplaatsen zonder dat het venster sluit (↑ ↓ bovenin, venster blijft open; slepen op de laptop).
- **Fase 3:**
  - KNVB voor Swift (apart);
  - definitie van spacing → regels;
  - themalessen en termen, na de periodisering.
