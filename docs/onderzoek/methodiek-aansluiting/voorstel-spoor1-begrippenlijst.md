# Voorstel Spoor 1 — Begrippenlijst (oplevering 1, 04-11-2026)

*Dit is een **voorstel**, geen vastgestelde inhoud. Het staat met opzet **niet** in `docs/methodiek/persoonlijk/`: Spoor 1 stelt de begrippen eerst inhoudelijk vast. Opgesteld vanuit Spoor 3, met de gevolgen voor ClubComm. Er is **niets** veranderd aan code, profielen, database, trainingen of productie. De database is alleen gelezen.*

**Bronnen:**
- het kerndocument v1.0 (26-09);
- het DCG-profiel v3 (`supabase/profielen/dcg.json`; in de database ook versie 3, bijgewerkt 28-10);
- de besluiten 123, 137, 138, 141 en 144, en de Afgewezen ideeën;
- de vier werkdocumenten: Leerlijn v2, Matrix v3 (KNVB-geijkt), Compacte structuur v1, Stap 2 (verfijning zes gereedschappen);
- jouw correcties van 04-11.

## Hoe je dit leest

| Teken | Betekenis |
|---|---|
| ✔ **Vastgesteld** | Staat in het kerndocument of in een besluit, **of** je hebt het op 04-11 uitdrukkelijk zo gezegd. Bij elk punt staat de bron. |
| ◇ **Voorstel** | Mijn voorstel. Pas geldig na jouw keuze in Spoor 1. |
| ? **Open vraag** | Spoor 1 moet hier eerst inhoudelijk over beslissen. |

Per begrip staan zes punten: **(1)** definitie, **(2)** hoe het nu in het DCG-profiel staat, **(3)** overlap of tegenstrijdigheid, **(4)** welke gegevens geraakt worden, **(5)** hoe de oude betekenis behouden blijft, **(6)** of er een inhoudelijk besluit nodig is.

---

## 0. Wat er nu in de DCG-gegevens staat (gemeten 04-11, alleen gelezen)

| Gegevens | Aantal | Wat erin staat |
|---|---|---|
| Weekplannen | 8 (26-10 t/m 14-12) | Teamfunctie: alleen `tf-aanvallen` en `tf-verdedigen`. Voetbalproblemen `vp-1` t/m `vp-7`. Handelingsketen `hk-vrij-aannemen-passen`. |
| Trainingen | 24 (27-10 t/m 18-12), waarvan 3 gegeven | Dezelfde codes. Leerniveau per plek op 9 plekken (29-10 en 30-10). |
| Evaluaties | 2 trainingen (29-10: 10 vragen, 30-10: 11 vragen) | Alle `ev-*`-vragen uit het profiel. Op 27-10 geen evaluatie. |
| Oefenvormen | 17, waarvan 13 ooit in een training gebruikt | Vaardigheden op 6 vormen. Een gereedschap op 12 vormen: 8 via de koppeling (`primair`), 4 via de oude lijst met leerdoelen. |
| Omschakelcodes `tf-omsch-va` / `tf-omsch-av` | **0 keer gebruikt** | Alleen in het profiel. |
| `vp-8` (nieuwe situatie na balwinst of balverlies) | **0 keer gebruikt** | Alleen in het profiel. |
| `vh-beschermen`, `vh-vrijmaken-uit-de-dekkingsschaduw`, `vh-overlap-en-underlap`, `vh-vertragen` | **0 vormen** | Alleen in het profiel. |
| `vh-derde-man` | 1 vorm ("Derde man – Inspelen, kaatsen en doorbewegen") | Gereedschap Passen. Eén keer gegeven, op 30-10. |
| Themalessen | 0 keer gebruikt in de app | Volgens Besluit 137 blijven ze in het Excel-spoorboekje. |

**Belangrijk voor de minuten:** Lijn rekent minuten toe via de **koppeling van een vorm aan een gereedschap** (`koppelingen.dcg.primair`, `training.js:49`). De vaardigheden op een vorm tellen **niet** mee. Die zijn een zoeklabel (Besluit 138).

Gevolg: een vaardigheid anders indelen (bijvoorbeeld de derde man als gezamenlijke oplossing) verandert **geen** minuten. Minuten veranderen alleen als iemand de koppeling van een vorm verandert, of de code van een gereedschap.

> **Rechtzetting van mijn ontwikkelvoorstel van 04-11:**
> - Daar schreef ik dat 8 weekplannen de omschakelcodes gebruiken. Dat klopt niet: ze worden nergens gebruikt.
> - Ook schreef ik dat de minuten verschuiven als de derde man anders wordt ingedeeld. Ook dat klopt niet, zie hierboven.

---

## A. Structuur van het spel

### A1. Teamfunctie — ✔ Vastgesteld (04-11; Matrix v3 en Compact v1)
1. **Definitie:** er zijn twee hoofdteamfuncties: **Aanvallen** (balbezit) en **Verdedigen** (balbezit tegenstander).
2. **Profiel nu:** 4 teamfuncties: `tf-aanvallen`, `tf-verdedigen`, `tf-omsch-va` ("Omschakelen van verdedigen naar aanvallen"), `tf-omsch-av`.
3. **Tegenstrijdig:** het profiel noemt omschakelen een teamfunctie; de vastgestelde keuze niet. Het kerndocument zegt al "geen apart omschakelgereedschap" (regel 135), maar noemt geen aantal teamfuncties.
4. **Geraakt:** niets in de gegevens. De omschakelcodes zijn nooit gebruikt.
5. **Historische betekenis:** `tf-aanvallen` en `tf-verdedigen` blijven ongewijzigd. Voor de omschakelcodes, zie A2.
6. **Besluit nodig:** ja, een klein besluit in Spoor 1: het profiel krijgt 2 teamfuncties.

### A2. Overgangsmoment (balverlies, balverovering) — ✔ Vastgesteld (04-11)
1. **Definitie:** het moment waarop het balbezit wisselt.
   - **Balverlies:** van aanvallen naar verdedigen.
   - **Balverovering:** van verdedigen naar aanvallen.

   Het is geen derde teamfunctie, maar wordt **uitdrukkelijk** meegenomen in situaties en oefeningen.
2. **Profiel nu:** op twee plekken:
   - als teamfunctie (`tf-omsch-va` = balverovering, `tf-omsch-av` = balverlies);
   - als achtste probleemcategorie (`vp-8` "De nieuwe situatie na balwinst of balverlies oplossen", met `context: true` en zonder teamfunctie).
3. **Overlap:**
   - Hetzelfde idee staat twee keer in het profiel.
   - De documenten gebruiken drie woorden: *balwinst*, *balverovering* en *omschakelen*.
4. **Geraakt:** niets. Geen van de drie codes is gebruikt.
5. **Historische betekenis:** ◇ de omschakelcodes **niet weggooien en niet hergebruiken**. Ze krijgen de status *vervallen*: niet meer te kiezen, wel leesbaar. Omdat ze nooit gebruikt zijn, is dit zonder risico.
6. **Besluit nodig:** ? wordt het overgangsmoment een **eigen kenmerk** (bijvoorbeeld "met overgang: balverlies / balverovering" bij een situatie of vorm)? Of blijft het alleen categorie `vp-8`? ◇ Mijn advies: `vp-8` blijft de categorie. Het overgangsmoment wordt een optioneel kenmerk, want Compact v1 wil het "in elke relevante situatie als apart moment toevoegen". En ? kies één woord: *balverovering* (jouw woord) of *balwinst* (de documenten).

### A3. Teamtaak (4, KNVB) — ✔ Vastgesteld (04-11) · ? de precieze namen zijn open
1. **Definitie (Matrix v3 en Compact v1, "letterlijk volgens de KNVB-sheet"):**

   | Teamfunctie | Teamtaak | Teamtaakintentie |
   |---|---|---|
   | Aanvallen | Opbouwen | Scoringskans creëren |
   | Aanvallen | Scoren | Scoringskans benutten |
   | Verdedigen | Verstoren van het opbouwen | Scoringskans voorkomen |
   | Verdedigen | Voorkomen van scoren | Benutten van scoringskans voorkomen |

2. **Profiel nu:** ontbreekt. Er is geen laag teamtaak.
3. **Tegenstrijdig:**
   - Leerlijn v2 gebruikt andere namen (*Opbouw verstoren*, *Doelpunten voorkomen*) en andere intenties.
   - In het KNVB-bestand van ClubComm (`knvb-2026.1.json`) staan teamtaken en teamfuncties door elkaar (*Opbouwen, Scoren, Storen, Doelpunten voorkomen, Omschakelen*).
4. **Geraakt:** niets. Het is een nieuw veld. De 8 weekplannen en 24 trainingen hebben geen teamtaak en houden er geen.
5. **Historische betekenis:** oude weken hebben "geen teamtaak". ◇ Er wordt niets achteraf ingevuld (ook niet afgeleid uit het voetbalprobleem).
6. **Besluit nodig:** ? welke namen: de KNVB-sheet (Matrix v3) of Leerlijn v2? ◇ Mijn advies: de KNVB-sheet. Dan is dezelfde lijst ook bruikbaar voor de KNVB-standaard (oplevering 2).

### A4. Kansen creëren — ◇ Voorstel (Leerlijn v2, Matrix v3 en Compact v1 zijn het eens)
1. **Definitie:** een onderdeel of ontwikkelaccent **binnen Opbouwen**, geen vijfde teamtaak.
2. **Profiel nu:** alleen als probleemcategorie (`vp-3` *Voordeel uitspelen*, `vp-4` *Een scoringskans creëren*).
3. **Overlap:** geen tegenstrijdigheid. De categorieën blijven, de teamtaak blijft Opbouwen.
4. **Geraakt:** niets.
5. **Historische betekenis:** n.v.t.
6. **Besluit nodig:** nee. Ter bevestiging.

---

## B. Wat de trainer oplost

### B1. Probleemcategorie / voetbalprobleem (8) — ✔ Vastgesteld als **voorlopige ordening** (04-11)
1. **Definitie:** acht **terugkerende soorten** voetbalproblemen. Ze ordenen, ze zijn zelf geen concrete situatie.
2. **Profiel nu:** `vp-1` … `vp-8`, onder de naam *voetbalproblemen*. Elk heeft een definitie, een centrale vraag, waarnemen, keuze wat en hoe, gereedschappen (primair/ondersteunend), oplossingen, complexiteit en een eindbeeld O12. `vp-1`–`vp-5` horen bij `tf-aanvallen`, `vp-6`–`vp-7` bij `tf-verdedigen`, `vp-8` heeft geen teamfunctie.
3. **Tegenstrijdig (alleen het woord):** kerndocument en profiel zeggen *voetbalproblemen*; Matrix v3 zegt *probleemcategorie*; Compact v1 zegt *ontwikkelgebied*.
4. **Geraakt:** 8 weekplannen en 24 trainingen gebruiken `vp-1`–`vp-7` (als probleem en als contraprobleem).
5. **Historische betekenis:** de codes blijven. Een nieuwe **naam** (label) verandert niets aan de gegevens.
6. **Besluit nodig:** ? welk woord gebruikt de app? ◇ Mijn advies: *probleemcategorie*. Dan is het duidelijk anders dan de concrete *voetbaluitdaging* (B2).

### B2. Voetbaluitdaging (concreet) — ✔ Vastgesteld (04-11): komt uit de analyse
1. **Definitie:** een **concrete, waargenomen situatie** van het eigen team, geformuleerd vanuit de analyse van wedstrijd of training.
   Voorbeeld: *"Bij druk van twee spitsen speelt onze 6 de bal steeds terug."*
   Ze valt onder een probleemcategorie, maar is er niet hetzelfde als.
2. **Profiel en gegevens nu:** er is geen eigen begrip. Het staat verspreid over:
   - de titel (`thema`), bijvoorbeeld *"Opbouwen tegen twee/drie jagers"*;
   - het dagthema (`hoofdthema`);
   - `probleemTekst`, het gewenste `gedrag` en de `informatie` in het weekplan.

   Compact v1 stelt **20 hoofdcases** voor (O01, S02, V04 …).
3. **Overlap:** de 20 hoofdcases zijn een **voorbeeldlijst**. ◇ Ze zijn geen vaste keuzelijst. Anders formuleer je de uitdaging niet meer zelf vanuit de analyse.
4. **Geraakt:** niets. De bestaande titels en teksten blijven.
5. **Historische betekenis:** n.v.t.
6. **Besluit nodig:** ? zijn de 20 hoofdcases alleen inspiratie (◇ mijn advies), of een lijst waaruit je kunt kiezen?

---

## C. Handelingen (de drie soorten)

✔ Vastgesteld (04-11): onderscheid tussen **individuele handelingen**, **ondersteunende vaardigheden** en **gezamenlijke oplossingen**.

### C1. Gereedschap (6) — ✔ Vastgesteld (kerndocument; 04-11 "blijven bestaan")
1. **Definitie:**

   | Gereedschap | Kern |
   |---|---|
   | 1v1 aanvallend | Manipuleren |
   | Aannemen en meenemen | Voorbereiden |
   | Passen | Helpen |
   | Vrijkomen | Timen |
   | 1v1 verdedigen en bal veroveren | Controleren |
   | Afwerken | Benutten |

2. **Profiel nu:** `ll-1v1-aanvallend`, `ll-aannemen`, `ll-passen`, `ll-vrijkomen`, `ll-1v1-verdedigen`, `ll-6` (Afwerken).
3. **Overlap:** geen. Alleen de code `ll-6` is een rare naam. ◇ Laat hem zo: een code is geen tekst voor de trainer.
4. **Geraakt:** alle minuten in Lijn, het gereedschap van 12 vormen, A/B per training en de weekplannen.
5. **Historische betekenis:** codes nooit hernoemen. Dan blijven alle minuten gelijk.
6. **Besluit nodig:** nee.

### C2. Individuele handeling (vaardigheid) — ✔ Vastgesteld als soort · ◇ indeling per vaardigheid
1. **Definitie:** wat **één speler** met of zonder bal doet. Ze hoort bij één gereedschap.
2. **Profiel nu:** 38 vaardigheden (`vh-*`), alleen met een naam en zonder definitie. Volgens Besluit 138 is het een "startlijst, schrap of vul aan", bedoeld om vormen te zoeken. Op de trainingskaart heet het *"accenten in gekozen vormen"* (Besluit 144).
3. **Tegenstrijdig:**
   - Twee vaardigheden zijn eigenlijk **gezamenlijke oplossingen** (zie C5).
   - Het woord **"accent"** wordt op de trainingskaart al gebruikt voor de vaardigheden van vormen. Dat botst met het **trainingsaccent** (D1). ◇ Op de kaart wordt dat dan *"handelingen in gekozen vormen"*.
4. **Geraakt:** vaardigheden op 6 vormen. Ze tellen niet mee in de minuten.
5. **Historische betekenis:** een vaardigheid die anders wordt ingedeeld, **houdt haar code** en blijft op de vormen staan. Alleen de soort (C2, C4 of C5) of het label verandert.
6. **Besluit nodig:** ? wil Spoor 1 de lijst van 38 vaardigheden nu aanpassen aan Stap 2? Of eerst alleen de afwijkingen (C5, D1, D2)? ◇ Mijn advies: eerst alleen de afwijkingen.

### C3. Kaatsen — ✔ Vastgesteld als individuele handeling (Compact v1, Leerlijn v2)
1. **Definitie:** een passhandeling: de bal direct terugspelen.
2. **Profiel nu:** `vh-kaatsen` onder Passen.
3. **Overlap:** kaatsen is een **onderdeel** van de derde man en de één-twee, maar zelf individueel.
4. **Geraakt:** 0 vormen.
5. **Historische betekenis:** n.v.t.
6. **Besluit nodig:** nee.

### C4. Ondersteunende vaardigheid: scannen — ✔ Vastgesteld (04-11; Compact v1: "géén zevende gereedschap")
1. **Definitie:** informatie verzamelen en gebruiken: druk, ruimte, medespeler, tegenstander en balbaan.

   **Observatie:** *wat* de speler opmerkt én *welke handeling daarop volgt*. Niet het aantal keer over de schouder kijken.
2. **Profiel nu:** er is geen begrip *scannen*. Het idee staat wel op drie plekken:
   - in het veld **informatie** in het weekplan;
   - in het leerniveau **Herkennen**;
   - in **waarnemen** per probleemcategorie.

   Het kerndocument noemt waarnemen een **kwaliteit door alle zes gereedschappen heen**, geen extra vaardigheid.
3. **Overlap:** ondersteunende vaardigheid tegenover kwaliteitsdimensie. ◇ Dat is in de kern hetzelfde. Mijn voorstel: *ondersteunende vaardigheid* is de naam van de soort; *scannen* is het voorbeeld. Zo blijft de lijn van het kerndocument intact.
4. **Geraakt:** niets. Het veld *informatie* blijft.
5. **Historische betekenis:** n.v.t.
6. **Besluit nodig:** ? zijn er naast scannen nog andere ondersteunende vaardigheden (bijvoorbeeld communiceren of coachen)? ? Moet een trainer scannen als accent kunnen kiezen, of blijft het een observatiepunt?

### C5. Gezamenlijke oplossing — ✔ Vastgesteld als soort (04-11)
1. **Definitie:** handelingen van **meerdere spelers die op elkaar afgestemd zijn**. Voorbeelden: derde man, één-twee, overlap/underlap, druk met rugdekking, samen kantelen.
2. **Profiel nu:**
   - `vh-derde-man` staat als **individuele vaardigheid** onder Passen;
   - `vh-overlap-en-underlap` staat onder Vrijkomen;
   - "druk en rugdekking" en "kantelen" ontbreken.
3. **Tegenstrijdig, en een tweede begrip dat erop lijkt:**
   - De twee vaardigheden zijn volgens de vaststelling geen individuele handelingen.
   - Het profiel heeft ook **handelingsketens** (`hk-*`), bijvoorbeeld *Timen → Voorbereiden → Helpen*. Een keten is een **volgorde van gereedschappen**; die kan door één speler worden uitgevoerd. Een gezamenlijke oplossing gaat over **meerdere spelers**. ◇ Dat zijn twee verschillende begrippen; voeg ze niet samen.
4. **Geraakt:**
   - 1 vorm met `vh-derde-man`, gekoppeld aan Passen en gegeven op 30-10. De minuten blijven bij Passen, zie §0.
   - `hk-vrij-aannemen-passen` in weekplannen en trainingen.
5. **Historische betekenis:** ◇ `vh-derde-man` en `vh-overlap-en-underlap` **behouden hun code** en blijven vindbaar als label op vormen (Matrix v3 en Stap 2 zeggen hetzelfde). Alleen hun **soort** wordt *gezamenlijke oplossing*. De vorm blijft gekoppeld aan Passen.
6. **Besluit nodig:**
   - ? Stap 2 keuze B: alleen labels bij oefeningen, of ook zichtbaar in een overzicht per teamtaak? (Stap 2 adviseert: wel per teamtaak zichtbaar.)
   - ? Blijven de handelingsketens naast de gezamenlijke oplossingen bestaan? ◇ Mijn advies: ja.

### C6. Positiegebonden handeling — ? Open vraag
1. **Definitie (documenten):** een handeling die hoort bij een positie of linie, bijvoorbeeld de rol van de nummer 6 of de laatste linie.
2. **Profiel nu:** ontbreekt. Wel staat "de rol van de nummer 6" als onderwerp bij de themalessen.
3. **Overlap:** het kerndocument noemt bij O13+ "teamtaak + positie + samenwerking" als ontwikkelstap.
4. **Geraakt:** niets.
5. **Historische betekenis:** n.v.t.
6. **Besluit nodig:** ? nu al een begrip, of later? ◇ Mijn advies: later. Eerst de teamtaken en de gezamenlijke oplossingen.

---

## D. Accenten binnen een gereedschap

### D1. Trainingsaccent — ✔ Vastgesteld als begrip (04-11; Besluit 144: "komt later")
1. **Definitie:** een **keuze van de trainer** voor één trainingsplek. Het accent geeft binnen een gereedschap aan waar de nadruk op ligt.
   - Het accent is **geen optelsom** van de vaardigheden in de vormen (Afgewezen ideeën bij Besluit 144).
   - Het is **geen extra gereedschap**.
2. **Profiel nu:** ontbreekt. Er is geen lijst met accenten.
3. **Overlap:** het woord "accent" wordt al gebruikt voor de vaardigheden van vormen, zie C2.
4. **Geraakt:** niets. Het is nieuw.
5. **Historische betekenis:** oude plekken hebben "geen accent". Er wordt niets achteraf afgeleid.
6. **Besluit nodig:** ? welke accenten komen er, behalve *Beschermen en vrijmaken*? ◇ Mijn advies: begin met dat ene accent en voeg pas iets toe als het in trainingen echt terugkomt.

### D2. Beschermen en vrijmaken — ✔ Vastgesteld (04-11)
1. **Definitie:** **één trainingsaccent binnen 1v1 aanvallend – Manipuleren**, met twee observeerbare deelhandelingen:
   - **Beschermen:** de bal onder druk behouden.
   - **Vrijmaken:** de bal of ruimte vrijmaken, zodat een vervolgactie mogelijk wordt.

   Druk van voren, opzij of in de rug zijn **varianten van de situatie**, geen nieuwe gereedschappen (Compact v1).
2. **Profiel nu:** `vh-beschermen` (onder 1v1 aanvallend) bestaat, zonder definitie en op 0 vormen. "Vrijmaken" in deze betekenis bestaat **niet** onder 1v1 aanvallend.
3. **Overlap:** zie D3. Stap 2 noemt nog een derde onderdeel: (c) de functionele vervolgkeuze. ? Hoort dat bij het accent, of is het het effect dat je observeert?
4. **Geraakt:** niets (0 vormen).
5. **Historische betekenis:** `vh-beschermen` blijft een vaardigheid (zoeklabel). Het accent wordt een **nieuw** begrip met een eigen code. Dat maakt van de oude code geen accent, zodat er niets van betekenis verandert.
6. **Besluit nodig:**
   - ? Wordt "vrijmaken (bal)" ook een eigen vaardigheid onder 1v1 aanvallend?
   - ? Hoort de vervolgkeuze uit Stap 2 bij het accent?

### D3. Drie keer "vrijmaken": niet samenvoegen — ✔ Vastgesteld (04-11)

| Woord | Gereedschap | Wie | Betekenis | Nu in het profiel |
|---|---|---|---|---|
| **Vrijmaken (bal)** | 1v1 aanvallend – Manipuleren | de speler **met** bal | de bal of ruimte vrijmaken voor een vervolgactie | ontbreekt (alleen als deelhandeling van D2) |
| **Vrijmaken uit de dekkingsschaduw** | Vrijkomen – Timen | de speler **zonder** bal | uit de schaduw van een tegenstander bewegen, zodat de speler aanspeelbaar wordt (= zichzelf vrijmaken) | `vh-vrijmaken-uit-de-dekkingsschaduw`, 0 vormen |
| **Ruimte voor een ander vrijmaken** | Vrijkomen – Timen | de speler **zonder** bal | een tegenstander meenemen, zodat een medespeler ruimte krijgt | ontbreekt (Matrix v3 en Stap 2 noemen het) |

**Huidige betekenis van `vh-vrijmaken-uit-de-dekkingsschaduw`:**
- Het profiel geeft alleen de naam, zonder definitie.
- Hij staat onder **Vrijkomen – Timen** (kern: "Wanneer en waar moet ik bewegen?").
- Hij komt uit de startlijst van Besluit 138.

Volgens die plaats betekent hij dus: **zichzelf zonder bal aanspeelbaar maken**. Dat is iets anders dan D2.

◇ **Voorstel (alleen het label, de code blijft):** toon hem als *"Loskomen uit de dekkingsschaduw"*. Matrix v3 en Stap 2 gebruiken *loskomen* bij Vrijkomen. Dan staat het woord "vrijmaken" in de app alleen nog bij het accent onder 1v1 aanvallend.

**Besluit nodig:** ? akkoord met dit andere label?

### D4. Afremmen of Vertragen — ? Open vraag (Stap 2 keuze C)
1. **Definitie:** de aanvaller vertragen zonder meteen in te stappen (1v1 verdedigen – Controleren).
2. **Profiel nu:** `vh-vertragen` (0 vormen).
3. **Tegenstrijdig:** Matrix v3, Compact v1 en Stap 2 zeggen *afremmen*; Leerlijn v2 en het profiel zeggen *vertragen*. Stap 2 adviseert: "Vertragen behouden als synoniem van Afremmen".
4. **Geraakt:** niets.
5. **Historische betekenis:** de code blijft. Alleen het label kan veranderen.
6. **Besluit nodig:** ? één woord kiezen.

---

## E. Hoe er geleerd wordt

### E1. Leerniveau (5) — ✔ Vastgesteld (kerndocument, profiel)
1. **Definitie:** Uitvoeren · Herkennen · Kiezen · Afstemmen · Aanpassen. Het is een **denkkader, geen trap**. Het beschrijft het beoogde leerproces, niet bewezen beheersing (zie de noot in het profiel).
2. **Profiel nu:** `ln-uitvoeren` … `ln-aanpassen`, met een omschrijving.
3. **Botsing:** de voorgestelde trainerscyclus "Herkennen → Kiezen → Ontwikkelen → Beoordelen" gebruikt twee van deze woorden voor iets anders. ◇ Gebruik die cyclus niet als woorden in de app (zie het ontwikkelvoorstel, beslispunt 3).
4. **Geraakt:** 9 plekken op 29-10 en 30-10 hebben een leerniveau.
5. **Historische betekenis:** de codes blijven.
6. **Besluit nodig:** nee, alleen de keuze over de cyclus.

### E2. Trainingsblok (Start · A · B · S · P/C) — ? Open vraag (alleen de naam)
1. **Definitie:** de opbouw van een training volgens het sjabloon `dcg-75`: Start, A1, S, A2, B1, S, B2, partij, overig.
2. **App nu:** de blokcode `P` met de naam "Toepassing · partij" staat **in de code** (`GROEPNAAM`), niet in het profiel.
3. **Tegenstrijdig:** Leerlijn v2, Matrix v3 en Compact v1 zeggen "C".
4. **Geraakt:** alle trainingen met blok `P`.
5. **Historische betekenis:** de code `P` blijft altijd. Alleen de **getoonde naam** zou uit het profiel moeten komen. Dat is technisch werk (Spoor 3, het ontwikkelvoorstel, stap 3).
6. **Besluit nodig:** ? moet DCG "C" zien, of blijft het "Toepassing · partij"?

---

## F. Evaluatie en periodisering

### F1. Gepland · aangeboden · toegepast — ✔ Vastgesteld als drie lagen (Leerlijn v2 §10; jouw opdracht)
1. **Definitie:**
   - **Gepland:** wat in de week of training staat.
   - **Aangeboden:** wat echt gegeven is, en of de bedoelde situatie ontstond.
   - **Toegepast:** of spelers het gedrag laten zien in vrij spel of in de wedstrijd (transfer).

   "In de training geweest" is **niet** hetzelfde als "geleerd".
2. **App nu:**

   | Laag | Waar het nu staat |
   |---|---|
   | Gepland | weekplan en trainingskaart, met een momentopname (`origineel`, Besluit 144) |
   | Aangeboden | status gegeven, echte minuten, `ev-probleem` |
   | Toegepast | `ev-transfer`, `ev-terugkeer` en de wedstrijdobservaties (18 observatiepunten, 0 beoordeeld) |

3. **Tegenstrijdig:** het aantal evaluatievragen verschilt per document: kerndocument en profiel 11, Leerlijn v2 4, Matrix v3 5, Compact v1 3, Stap 2 4.
4. **Geraakt:** 2 trainingen met 10 en 11 antwoorden.
5. **Historische betekenis:** ◇ een kortere set betekent dat de vragen die wegvallen de status *vervallen* krijgen. De antwoorden van 29-10 en 30-10 blijven leesbaar, met de oude vraag erbij.
6. **Besluit nodig:** ? welke 3 tot 5 vragen blijven standaard open? (Nu: probleem, gedrag, weerstand.)

### F2. Adaptieve periodisering — ✔ Vastgesteld (04-11)
1. **Definitie:** periodisering ondersteunt **twee dingen tegelijk**:
   - een **geplande ontwikkelroute**;
   - **bijsturing op basis van wat je ziet**.

   De volgende leerstap hangt af van het gedrag dat je bij spelers ziet, niet van de kalender. Een volgorde als *kennismaken → verdiepen → meer weerstand → toepassen* is een **voorbeeld**, geen verplichte ladder.
2. **Profiel nu:** past hier al goed bij:
   - de principes zeggen letterlijk: *"niet het verdelen van losse thema's over een kalender, maar het organiseren van herhaalde leerervaringen"* en *"herhaling hoeft niet dezelfde oefening te betekenen"*;
   - het model eindigt met *Praktijktest → Herhaling/aanpassing*;
   - de evaluatievraag `ev-volgende` heeft al de keuzes *behouden · één variabele aanpassen · ander complexiteitsniveau*. Dat is in feite al een **bijsturingsknop**.
3. **Overlap:** de documenten geven weekschema's met vaste dagen (bijvoorbeeld in Matrix v3: "Dinsdag: beschermen/vrijmaken bij zijwaartse druk"). ◇ Die zijn een voorbeeld, geen sjabloon.
4. **Geraakt:** niets. De 8 weekplannen blijven het geplande deel.
5. **Historische betekenis:** het geplande blijft bewaard (`origineel`). Bijsturing wordt een **nieuwe** aanpassing aan een latere week; eerdere weken worden niet herschreven.
6. **Besluit nodig:** ? moet een bijsturing de reden laten zien (bijvoorbeeld "aangepast omdat ev-gedrag = nee op 30-10")? ◇ Mijn advies: ja, als korte regel bij *Mee uit vorige* (die regel bestaat al, Besluit 144), zonder nieuw veld.

---

## G. Themalessen: 6 onderwerpen tegenover 11 lessen (alleen vergelijken)

*Niet samengevoegd, niets vervangen. Ik ga er niet van uit dat het dezelfde soort lessen zijn.*

| | **6 onderwerpen (profiel)** | **11 lessen (Leerlijn v2 §9.1, Matrix v3)** |
|---|---|---|
| Inhoud | Opbouwen tegen twee of drie drukzettende spelers · De rol van de nummer 6 · Vrijlopen en aanspeelbaar worden · Passlijnen herkennen · Jagen en de bal terugveroveren · Positiewisselingen en het bezetten van vrijgekomen ruimtes | Samen op reis → Iedereen draagt zijn rugzak → Durven ontdekken → De steile klim → Loeren → Jagen → Touwtjes breken → De prooi insluiten → Terugjagen → Aanvallen → Teamtactiek |
| Soort | **Tactische onderwerpen** over situaties in het spel | **Route met een vaste volgorde**: "parallelle pedagogische en tactische leerlijn" over teamidentiteit, plezier, vertrouwen, communicatie en spelinzicht |
| Volgorde | geen; "voorbeelden van onderwerpen, geen vaste lijst" | wel; "behoud de oorspronkelijke volgorde en betekenis" |
| Duur | 15 minuten | 15–20 minuten |
| Werkwijze | wedstrijdbeelden, vragen, tactische voorbeelden, actieve betrokkenheid | niet beschreven in de repository; "draaiboeken per les niet allemaal definitief" |
| Herkomst | profiel v1 (27-10), sindsdien niet veranderd | jouw werkdocumenten; de inhoud per les staat niet in de repository |
| Gebruik in de app | geen (Besluit 137: themalessen blijven in het Excel-spoorboekje) | geen |

**Wat lijkt op elkaar (alleen op grond van de woorden; niet bevestigd):**
- *Loeren* ↔ *Passlijnen herkennen*. De term *Loeren* staat in het profiel als "kansen en passlijnen herkennen en benutten".
- *Jagen* en *Terugjagen* ↔ *Jagen en de bal terugveroveren*. De termen *Jagen* ("actief drukzetten") en *Direct terugwinnen* staan in het profiel.
- *Samen op reis* is ook de **titel van de visie** in het profiel.

**Geen duidelijke tegenhanger:**
- bij de 6: de nummer 6, positiewisselingen, opbouwen tegen 2–3 drukzetters, vrijlopen;
- bij de 11: Iedereen draagt zijn rugzak, Durven ontdekken, De steile klim, Touwtjes breken, De prooi insluiten.

Van die vijf lessen ken ik de inhoud niet; ik raad er niet naar.

**Voorlopige lezing (◇, te toetsen):** waarschijnlijk zijn het **twee verschillende dingen**:
- een **pedagogische route met een vaste volgorde** (11);
- een **open lijst met tactische onderwerpen** voor korte besprekingen (6).

Enkele lessen uit de route hebben een tactisch thema (Loeren, Jagen, Terugjagen) dat terugkomt in de onderwerpen.

**Open vragen voor Spoor 1:**
1. ? Wat is de inhoud (doel, gedrag, werkvorm) van de 11 lessen? Zonder draaiboek kan ik ze niet goed vergelijken.
2. ? Zijn de 6 onderwerpen bedoeld als **invulling** van lessen (bijvoorbeeld "Passlijnen herkennen" binnen *Loeren*), of als **losse** onderwerpen naast de route?
3. ? Hoort *Samen op reis* als les bij de route, als visie, of bij allebei?
4. ? Moet ClubComm de themalessen tonen? Volgens Besluit 137 blijven ze in het Excel-spoorboekje. ◇ Mijn advies: nog niet.

**Gevolg voor gegevens:** geen. Er hangt in de app niets aan.

---

## H. Samenvatting: wat Spoor 1 moet beslissen

| # | Vraag | Mijn advies |
|---|---|---|
| 1 | Overgangsmoment: een eigen kenmerk naast `vp-8`? En welk woord: balverovering of balwinst? | Kenmerk: ja; `vp-8` blijft |
| 2 | Namen van de teamtaken: KNVB-sheet of Leerlijn v2? | KNVB-sheet |
| 3 | Naam van de 8 in de app: voetbalprobleem of probleemcategorie? | Probleemcategorie |
| 4 | 20 hoofdcases: inspiratie of keuzelijst? | Inspiratie |
| 5 | Derde man en overlap: alleen label, of ook per teamtaak zichtbaar? Handelingsketens behouden? | Label + per teamtaak; ketens behouden |
| 6 | Andere ondersteunende vaardigheden naast scannen? Scannen als accent of als observatiepunt? | Observatiepunt |
| 7 | Meer trainingsaccenten dan *Beschermen en vrijmaken*? Hoort de vervolgkeuze erbij? | Eerst alleen dit accent |
| 8 | Label `vh-vrijmaken-uit-de-dekkingsschaduw` → *Loskomen uit de dekkingsschaduw*? | Ja |
| 9 | Afremmen of Vertragen? | Één woord kiezen |
| 10 | Blok C of P in de weergave? | Jouw keuze |
| 11 | Welke 3–5 evaluatievragen staan standaard open? | Probleem, gedrag, transfer, volgende |
| 12 | Themalessen: de inhoud van de 11 lessen aanleveren en de relatie met de 6 onderwerpen bepalen | Eerst de draaiboeken |
| 13 | Positiegebonden handelingen: nu of later? | Later |

## I. Vaste regels om de oude betekenis te behouden (Spoor 3, voor alle stappen)

1. **Een code is voor altijd.** Hij wordt nooit hernoemd, nooit hergebruikt voor iets anders en nooit gewist.
2. **Een label mag veranderen.** De gegevens blijven gelijk; alleen de tekst die de trainer ziet verandert.
3. **Weghalen = status *vervallen*.** Het begrip is niet meer te kiezen, maar blijft leesbaar bij oud werk.
4. **Een nieuwe soort is een nieuw kenmerk.** Teamtaak, accent, overgangsmoment en soort handeling worden nieuwe velden. Oude gegevens krijgen er **geen** waarde bij die achteraf is afgeleid.
5. **De minuten volgen de koppeling van de vorm.** Een indeling van vaardigheden verandert nooit minuten. Wie de koppeling van een vorm wil wijzigen, doet dat zelf in de Vormenbank, en dat geldt dan voor alle trainingen met die vorm. ◇ Die waarschuwing hoort daar te staan (Spoor 3, later).
6. **De planning van toen blijft staan.** De momentopname `origineel` (Besluit 144) blijft de bron voor "gepland".
7. **De profielversie gaat omhoog** bij elke wijziging, en de vorige versie komt als back-up in `supabase/backups/` (zoals op 28-10).

*Na de bespreking in Spoor 1 werk ik oplevering 2 (KNVB-basisprofiel) en 3 (één echte leerweek) uit op basis van de gekozen begrippen.*
