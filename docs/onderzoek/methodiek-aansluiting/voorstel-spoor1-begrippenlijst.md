# Voorstel Spoor 1 — Begrippenlijst (versie 2, ter vaststelling, 04-11-2026)

*Verwerkt de keuzes uit jouw beoordeling van 04-11. Dit is een **voorstel ter vaststelling** in Spoor 1. Het staat met opzet nog niet in `docs/methodiek/persoonlijk/`. Er is **niets** veranderd aan code, profielen, database of productie.*

- De uitgebreide analyse (versie 1) staat in de geschiedenis van deze branch (commit `0752cfc`).
- Technische punten voor ClubComm staan apart in `technische-punten.md` (Spoor 3).

**Leeswijzer:**
- *In ClubComm* = hoe het nu in het DCG-profiel of de app staat.
- *Behoud* = wat er met oude gegevens gebeurt.
- Alle codes (`tf-…`, `vp-…`, `ll-…`, `vh-…`, `ev-…`) blijven altijd bestaan.

---

## 1. Spelstructuur

| Begrip | Afspraak | In ClubComm | Behoud |
|---|---|---|---|
| **Teamfunctie** | Er zijn er twee: **Aanvallen** en **Verdedigen**. | `tf-aanvallen`, `tf-verdedigen` | Ongewijzigd. Gebruikt in 8 weekplannen en 24 trainingen. |
| **Teamtaak** | Vier KNVB-teamtaken. Aanvallen: **Opbouwen** (intentie: scoringskans creëren) en **Scoren** (scoringskans benutten). Verdedigen: **Verstoren van het opbouwen** (scoringskans voorkomen) en **Voorkomen van scoren** (benutten van een scoringskans voorkomen). | Ontbreekt nog. | Oude weken krijgen geen teamtaak; er wordt niets achteraf ingevuld. |
| **Kansen creëren** | Een deel van Opbouwen, geen vijfde teamtaak. | Via `vp-3` en `vp-4`. | n.v.t. |
| **Overgangsmoment** | **Balverlies** en **balverovering**: het moment waarop het balbezit wisselt. Ze zijn geen teamfunctie, maar je neemt ze uitdrukkelijk mee in situaties en oefeningen. | Staat nu als `tf-omsch-va` en `tf-omsch-av` (nooit gebruikt) en als `vp-8`. | De twee omschakelcodes worden *vervallen*: niet meer te kiezen, wel leesbaar. `vp-8` blijft. |

## 2. Probleem en uitdaging

| Begrip | Afspraak | In ClubComm | Behoud |
|---|---|---|---|
| **Voetbalprobleemcategorie** | Acht terugkerende soorten voetbalproblemen. Ze **ordenen**; ze zijn zelf geen concrete situatie. | `vp-1` … `vp-8`, nu met de naam *voetbalproblemen* | Alleen de getoonde naam verandert. `vp-1`–`vp-7` zitten in de weekplannen. |
| **Voetbaluitdaging** | Een **concrete** situatie waar het team mee bezig is. Ze valt onder een categorie. Ze kan op **twee manieren** ontstaan: (a) uit een **wedstrijd- of trainingsanalyse**, of (b) uit de **geplande opleidingslijn**. | Verspreid: titel, dagthema, `probleemTekst`, gedrag, informatie | Bestaande teksten blijven. Zonder herkomst = "onbekend". |
| **Voorbeeldsituatie** | Een **uitbreidbare bibliotheek** (te beginnen met de 20 hoofdcases). De trainer mag een voorbeeld kiezen **en** zelf een uitdaging formuleren. **Een voorbeeld is nooit vanzelf een vastgestelde diagnose.** | Ontbreekt nog. | n.v.t. |

## 3. Handelingen

| Begrip | Afspraak | In ClubComm | Behoud |
|---|---|---|---|
| **Gereedschap** (6) | 1v1 aanvallend – Manipuleren · Aannemen en meenemen – Voorbereiden · Passen – Helpen · Vrijkomen – Timen · 1v1 verdedigen en bal veroveren – Controleren · Afwerken – Benutten | `ll-1v1-aanvallend`, `ll-aannemen`, `ll-passen`, `ll-vrijkomen`, `ll-1v1-verdedigen`, `ll-6` | Ongewijzigd. Hierop rust Lijn. |
| **Individuele handeling** | Wat **één speler** doet, met of zonder bal. Hoort bij één gereedschap. | 38 vaardigheden (`vh-*`) | Ongewijzigd. |
| **Ondersteunende waarnemingsvaardigheid** | **Scannen**: informatie verzamelen en gebruiken. Je observeert *wat* de speler ziet én *wat hij daarna doet*. Het is geen zevende gereedschap. Scannen kan terugkomen als **observatieaccent**. | Via het veld *informatie*, het leerniveau Herkennen en "waarnemen" per categorie | Het veld *informatie* blijft. |
| **Gezamenlijke oplossing** | Op elkaar afgestemde handelingen van **meerdere spelers**: derde man, overlap/underlap, één-twee, druk met rugdekking, samen kantelen. | `vh-derde-man` (Passen) en `vh-overlap-en-underlap` (Vrijkomen) | De codes en labels op vormen blijven. Alleen de **soort** wordt *gezamenlijke oplossing*. De vorm "Derde man" blijft bij Passen tellen. |
| **Handelingsketen** | Blijft bestaan. Een **volgorde van gereedschappen** (bijvoorbeeld Timen → Voorbereiden → Helpen). Dat is iets anders dan een gezamenlijke oplossing. | `hk-*` (4) | Ongewijzigd. `hk-vrij-aannemen-passen` is in gebruik. |
| **Positiegebonden handeling** | Wordt eerst inhoudelijk uitgewerkt in Spoor 1. Er wordt **nog niets gebouwd**. | Ontbreekt. | n.v.t. |

## 4. Accenten

| Begrip | Afspraak | In ClubComm | Behoud |
|---|---|---|---|
| **Trainingsaccent** | Een keuze van de trainer **per trainingsplek**: waar binnen een gereedschap de nadruk ligt. Het is geen optelsom van vormen en geen extra gereedschap. | Ontbreekt (Besluit 144: "komt later"). | Oude plekken: "geen accent". |
| **Beschermen en vrijmaken** | **Eén** trainingsaccent binnen **1v1 aanvallend – Manipuleren**, met twee deelhandelingen die je kunt waarnemen: **Beschermen** (de bal onder druk behouden) en **Vrijmaken** (de bal of ruimte vrijmaken, zodat een vervolgactie mogelijk wordt). De **functionele vervolgactie** hoort bij het **resultaat dat je waarneemt**; het is geen derde deelhandeling. Druk van voren, opzij of in de rug zijn varianten van de situatie. | Alleen `vh-beschermen` (0 vormen). | `vh-beschermen` blijft een vaardigheid. Het accent wordt een nieuw begrip met een eigen code. |
| **Observatieaccent** | Waar de trainer **op let**, los van wat er geoefend wordt. Eerste voorbeeld: scannen. | Ontbreekt. | n.v.t. |

## 5. Termen die we nauwkeurig onderscheiden

| Term | Afspraak | In ClubComm | Behoud |
|---|---|---|---|
| **Loskomen uit de dekkingsschaduw** | Nieuwe naam voor de bestaande vaardigheid onder **Vrijkomen – Timen**: de speler zonder bal maakt zichzelf aanspeelbaar. Dit is **niet** hetzelfde als *vrijmaken* bij 1v1 aanvallend. | `vh-vrijmaken-uit-de-dekkingsschaduw` (0 vormen) | De **code blijft**; alleen het label verandert. |
| **Afremmen** | **Handeling** van de verdediger (onder 1v1 verdedigen – Controleren), bijvoorbeeld afstand houden en meebewegen in plaats van instappen. | Er is nu alleen `vh-vertragen` (0 vormen). Zie het open punt hieronder. | De code blijft. |
| **Vertragen** | **Beoogd effect**: de aanval komt minder snel vooruit, zodat medespelers kunnen herstellen. Je beschrijft en observeert het als effect, niet als handeling. | Geen eigen veld. Het past bij gedrag en effect in het weekplan. | — |
| **Kaatsen** | Een individuele passhandeling. Ze is wel een onderdeel van de derde man en de één-twee. | `vh-kaatsen` | Ongewijzigd. |

## 6. Leren en training

| Begrip | Afspraak | In ClubComm | Behoud |
|---|---|---|---|
| **Leerniveau** (5) | Uitvoeren · Herkennen · Kiezen · Afstemmen · Aanpassen. Een denkkader, geen trap. | `ln-*` | Ongewijzigd (9 plekken). |
| **Blok C** | DCG gebruikt **C** als methodische aanduiding voor het laatste blok. ClubComm toont **Toepassing · partij**. | Blokcode `P`, label "Toepassing · partij" | Er verandert niets in de app. "C" staat alleen in de DCG-methodiek. |

## 7. Evaluatie en periodisering

| Begrip | Afspraak | In ClubComm | Behoud |
|---|---|---|---|
| **Gepland · aangeboden · toegepast** | Drie lagen. "Het zat in de training" is niet hetzelfde als "het is geleerd". | Weekplan en `origineel` · status en minuten · `ev-transfer` en wedstrijdobservaties | Ongewijzigd. |
| **Korte evaluatie** (4 vragen) | 1. **Doel/situatie:** ontstond de bedoelde situatie vaak genoeg? 2. **Gedrag:** was het gewenste gedrag zichtbaar? 3. **Toepassing:** kwam het terug in vrij spel of in de partij? 4. **Volgende leerstap:** behouden, één ding aanpassen, of een ander niveau? | Bestaat al als `ev-probleem`, `ev-gedrag`, `ev-transfer` en `ev-volgende`. Nu staan standaard open: probleem, gedrag, weerstand. | De 4 bestaande codes worden hergebruikt **met dezelfde betekenis en schaal**. De andere 7 vragen blijven beschikbaar (ingeklapt). De antwoorden van 29-10 en 30-10 blijven leesbaar. |
| **Adaptieve periodisering** | Twee dingen tegelijk: een **geplande ontwikkelroute** en **bijsturing op wat je ziet**. De volgende leerstap hangt af van het gedrag van de spelers. Een volgorde als kennismaken → verdiepen → meer weerstand → toepassen is een **voorbeeld**, geen verplichte ladder. | Principes en model in het profiel. `ev-volgende` werkt al als bijsturingsknop. | De planning blijft bewaard (`origineel`). Een bijsturing verandert alleen latere weken. |

## 8. Themalessen

| Begrip | Afspraak | In ClubComm | Behoud |
|---|---|---|---|
| **Themalessenroute** (11) | Voorlopig een **aparte route** met een vaste volgorde, van *Samen op reis* tot *Teamtactiek*. Ze wordt niet samengevoegd met de onderwerpen. | Niet in het profiel. | n.v.t. |
| **Tactische onderwerpen** (6) | Een open lijst met onderwerpen voor korte besprekingen. Ze staan **naast** de route. | `themalessen.onderwerpen` (6), niet in gebruik in de app | Ongewijzigd. *Let op:* in het profiel hangen ze nu onder de naam "themalessen". Zie het technische punt T8. |

---

## Nog open in Spoor 1 (inhoud, geen bouwwerk)

1. **De code `vh-vertragen` en het onderscheid afremmen/vertragen.** De vaardigheid is een handeling, dus het label zou **Afremmen** worden. *Vertragen* blijft dan het woord voor het effect. Akkoord? (Er hangen 0 vormen aan, dus er gaat niets mis.)
2. **Welke trainingsaccenten komen er** naast *Beschermen en vrijmaken*? Advies: pas iets toevoegen als het in trainingen echt terugkomt.
3. **Wie vult de bibliotheek met voorbeeldsituaties aan:** alleen de HO, of ook de trainer (eigen uitdaging bewaren als voorbeeld)?
4. **Inhoud van de 11 themalessen** (draaiboeken). Pas daarna kunnen we de relatie met de 6 onderwerpen bepalen.
5. **Positiegebonden handelingen:** de uitwerking in Spoor 1.
