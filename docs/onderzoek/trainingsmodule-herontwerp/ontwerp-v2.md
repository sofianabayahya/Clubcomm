# Herontwerp Lijn · Plannen · Week · Vormenbank — definitief ontwerp v2 (Spoor 3, 29-10-2026)

*Ontwerp na de besluiten van de initiatiefnemer van 29-10. **Niets gebouwd**: geen app-code, berekening, database of productie gewijzigd. Versie 1 staat ernaast (`ontwerp.md`, `1-` t/m `3-`).*

**Voorbeelden** (`.png`, bron `.html` met `ontwerp.css`):

| # | Scherm | Toestel |
|---|---|---|
| v2-1 | Lijn, week 45 met de opbouw di → do → vr en de weekevaluatie | 390 px |
| v2-2 | Plannen, do 5 nov, geopend vanuit Lijn | 390 px |
| v2-3 | Week, do 5 nov, minuten **optie A (de huidige berekening)** | 390 px |
| v2-4 | Week, minuten **voorstel C** (duidelijk gemarkeerd, niet de werking) | 390 px |
| v2-5 | Beheer periodisering | 390 px |
| v2-6 | Herinnering na de training | 390 px |
| v2-7 | Weekevaluatie beoordelen en bevestigen | 390 px |
| v2-8 | Lijn | laptop |
| v2-9 | Plannen, do 5 nov | laptop |

## 1. De vastgelegde keuzes (29-10)
- **Minuten:** optie A nu (alleen de presentatie). Optie C uitwerken. De partij apart als **Toepassing**, niet dubbel bij A en B. Minuten zijn een registratie van oefentijd en belasting, **geen bewijs van leren**.
- **Vastleggen:** naam **Periodeplanning vastleggen**, status **Vastgelegd**. Trainingen blijven aan te passen. Nog geen wijzigingenoverzicht bouwen (§5).
- **Weekevaluatie:** in Lijn, met de status *Nog te beoordelen* of *Bevestigd*. ClubComm stelt voor, de trainer beoordeelt. Geen melding aan het eind van de week.
- **Vormenbank:** nieuwe naam voor alle clubs; de functies blijven gelijk.
- **Herinnering na de training:** één keer, met drie keuzes. Niets wordt vanzelf bevestigd (§6).

## 2. De route in de voorbeelden
1. **v2-1 / v2-8 Lijn:**
   - week 45 staat open, met bovenaan het voetbalprobleem;
   - daaronder **Opbouw van de week** in drie stappen (di Uitvoeren → Herkennen · do Herkennen → Kiezen · vr Kiezen → Afstemmen), dan de trainingen en de wedstrijd;
   - tik op donderdag.
2. **v2-2 / v2-9 Plannen:**
   - bovenaan *‹ Lijn · week 45* (terug);
   - de trainingsopdracht met **Stap 2 van 3**;
   - de blokken A · Passen, B · Vrijkomen en **Toepassing · partij** (*kijk of A en B terugkomen*).
3. **v2-3 Week:** na afloop de minuten en de bestaande evaluatiekaart.
4. **v2-1 Lijn:** de **weekevaluatie** (*Nog te beoordelen*) zet de evaluaties van di en do naast elkaar.
5. **v2-7:** *Beoordelen en bevestigen*. Daarna staat *Bevestigd* in Lijn (zie week 44 in v2-1).

## 3. Minuten — optie A: de huidige berekening, eerlijk benoemd (v2-3)
Gecontroleerd tegen de code van `main` (`training.js`: `totaal`, `CC.minutenPerLeerdoel`; `periodisering.js`: `uitMin`).

| Label in het ontwerp | Wat de code werkelijk telt | Voorbeeld do 5 nov |
|---|---|---|
| **Gepland** | Alle onderdelen + ombouw, ook lege plekken (`totaal`) | 75 |
| **Uitgevoerd in oefenvormen** | Gegeven training; onderdelen **met een oefenvorm**, zonder start en spacing; echt ingevuld, anders gepland (`uitMin`). De partij telt mee als het een oefenvorm is. | 6+12+6+8+18 = **50** |
| **Bij een gereedschap** | Dezelfde onderdelen, maar alleen als de **vorm** een hoofdgereedschap heeft, en dan bij **het gereedschap van de vorm** (regel van `CC.minutenPerLeerdoel`, hier per week) | Passen 26 · Vrijkomen 6 = **32** (de partijvorm heeft geen gereedschap) |

**Wat optie A wel verandert (alleen presentatie):**
- de drie getallen met deze namen;
- *Wat betekenen deze getallen?* (uitklapbaar);
- de vette regels = *bij een gereedschap*;
- **geen invulvak meer bij start, spacing en ombouw**, omdat die nergens meetellen.

In Lijn heet het getal per week ook *uitgevoerd in oefenvormen* en *bij een gereedschap*, niet meer alleen *min*.

**Let op, en daarom staat het in het ontwerp:** B2 is een *Passen*-vorm in blok B (*Vrijkomen*). In optie A telt die voor **Passen**. Dat is de huidige werking, en precies het punt dat voorstel C oplost.

## 4. Minuten — voorstel C (v2-4, niet de huidige werking)
**Per plek worden vier dingen naast elkaar getoond:**
1. **Gepland:** de minuten van het blok (`min`, bestaat).
2. **Bedoeling:** het gereedschap van het blok A of B (`blokDoel`, bestaat), of **Toepassing** voor de partij (blok `P`, bestaat).
3. **Echt uitgevoerd:** `minUit` (bestaat).
4. **Classificatie van de vorm:** het hoofdgereedschap uit de Vormenbank (bestaat). Wijkt het af van de bedoeling, dan staat het verschil erbij, **zonder conclusie**.

**Optellen:** oefentijd **per bedoeling**: A · Passen 18 · B · Vrijkomen 14 · Toepassing 18. Samen 50, gelijk aan *uitgevoerd*: **niets dubbel**. De partij telt **niet** bij A of B.

**Toepassing:**
- Bij de partij staat de bestaande vraag **Transfer naar vrij spel** uit de evaluatiekaart van het profiel (*duidelijk · gedeeltelijk · niet zichtbaar*).
- Zo beoordeelt de trainer of het gedrag van A en B terugkwam. **Geen extra invulwerk.**
- Clubs zonder die vraag in hun profiel zien alleen de minuten.

**Gegevens:** **geen nieuwe velden.** Alles bestaat al. Alleen de rekenregel en de presentatie veranderen.

**Gevolgen bij invoeren:**
- De leerlijnminuten van oude trainingen veranderen, omdat ze voortaan per bedoeling tellen.
- Voorstel: alleen vanaf een datum, of beide tonen in een overgangsperiode.
- Hiervoor is een apart besluit nodig.

## 5. Periodeplanning vastleggen (v2-5) en het vergelijken van oorspronkelijk en actueel
**Wat de knoppen echt doen** (`periodisering.js`):
- **Laden:** vult alleen trainingen zonder voorbereiding. Overschrijft nooit iets.
- **Periodeplanning vastleggen:** zet een datum op elk weekplan van het team. Gevolg: *Geladen concepten verwijderen* verdwijnt. **Niets wordt vergrendeld.**
- **Geladen concepten verwijderen:** alleen concepten die niet zijn aangepast (stempel) en niet gegeven.
- **Weer op concept zetten:** haalt de datum weg.

**Kan de app oorspronkelijk en actueel vergelijken, zonder dubbele opslag?**
- **Wat er nu is:**
  - het **weekplan** bewaart de geïmporteerde weekinhoud;
  - elke conceptraining heeft een **stempel** (een korte controlecode van het concept bij het laden) en een **bron** (de bestandsnaam).
- **Wat dat al kan:** per training zeggen **óf** hij na het laden is veranderd.
- **Wat het niet kan:** zeggen **wát** er is veranderd.
- **Ook een beperking:** de stempel verandert ook als alleen een oefenvorm wordt ingevuld. *Aangepast* betekent dus nog niet *de planning is anders*.
- **Mogelijkheden, zonder de inhoud dubbel op te slaan:**
  1. **Tweede korte controlecode bij het laden**, alleen over de methodiek (probleem, accenten, leerniveau, doel). Dan kan de app zeggen *planning gewijzigd* in plaats van *alleen ingevuld*. Kosten: één korte code per training.
  2. **Vergelijken met het bestand:** de trainer kiest in *Beheer* het oorspronkelijke CSV-bestand opnieuw, en de app toont per training de verschillen. Er wordt niets opgeslagen; Excel blijft de bron.
- **Advies:** 1 en 2 samen. Bouwen pas na akkoord.

## 6. Herinnering na de training (v2-6)
**Past dit bij de bestaande meldingen?** Gecontroleerd in de code:
- er is **geen** bestaande herinnering voor trainers over een gegeven training;
- herinneringen bij activiteiten (`autoberichten.js`) zijn voor leden, met een vlag tegen dubbel versturen (`herinnerd`);
- signalen op Home hebben al een mechanisme *afgedaan* (`signaalAfgedaan`).

**Voorstel:**
- **Waar:** een **signaal op Home** van de trainer, **de dag na de training**. Geen push en geen e-mail, dus geen nieuw meldkanaal en geen dubbele berichten.
- **Wanneer:** alleen bij een training die afgelopen is, niet afgelast, met een voorbereiding of concept, en waar *gegeven* nog niet is gekozen. **Eén keer**: na een keuze komt het niet terug.
- **Training is gegeven:**
  - de training wordt als gegeven geregistreerd;
  - de registratie in Week gaat open;
  - de minuten staan op *gepland*, met de status **nog niet gecontroleerd**;
  - pas na *Klopt zo* (vult de echte minuten expliciet in) of een aanpassing zijn ze gecontroleerd;
  - nog niet gecontroleerd = er is nog geen echte waarde ingevuld (`minUit` leeg). Daarvoor is **geen nieuw veld** nodig.
- **Niet doorgegaan:** de bestaande functie *afgelasten met een reden*. Bij DCG volgt dan vanzelf de bestaande keuze *doorschuiven / laten vervallen*.
- **Later evalueren:** het signaal wordt *afgedaan* (bestaand mechanisme). In Week en Lijn blijft de training op *nog te registreren* staan.
- **Later aanpassen:** de echte minuten blijven in Week altijd te wijzigen, ook na het evalueren. Dat bestaat al.
- **Niets gebeurt vanzelf:** geen automatische bevestiging, en *gegeven* betekent niet *gecontroleerd*.

## 7. Weekevaluatie (v2-1, v2-7, v2-8)
- **Bron (bestaat):**
  - de evaluatiekaart per training (probleem, gedrag, weerstand, transfer, …);
  - *wat anders*;
  - de observatiepunten van de wedstrijd.
- **Tabel:** per vraag een kolom per trainingsdag. Niet gegeven = –.
- **Voorstel van ClubComm:** een korte samenvatting, met een keuze voor volgende week (*behouden · één variabele aanpassen · ander complexiteitsniveau*). Bron is de vraag *Volgende training* of het meest gekozen antwoord. **Nooit een uitspraak dat het leerdoel is bereikt.**
- **Beoordelen (v2-7):** de trainer past de conclusie aan, kiest of bevestigt de keuze en vult eventueel de variabele in, en tikt dan op **Bevestigen**.
- **Opslag:** **één nieuw veld op het weekplan** (conclusie, keuze, variabele, datum bevestigd).
- **Status:**
  - *Nog te beoordelen*: er is minstens één training van die week gegeven, en er is nog niet bevestigd;
  - daarna *Bevestigd*.
- **Volgende week:** de keuze verschijnt als voorstel bij de trainingen van volgende week (zoals het bestaande *Voorstel van …*). Nooit vanzelf doorgevoerd.
- **Geen melding.**

## 8. Wat verandert waar
| | Behouden | Verplaatsen | Nieuw |
|---|---|---|---|
| **Lijn** | weekregel, bolletjes, tik op training | Laden, vastleggen en verwijderen → *Beheer* | Weekdetail met **Opbouw van de week**; weekevaluatie met status; minuten met de juiste namen |
| **Plannen** | blokken, plekken, Kies oefenvorm, slepen, printen, kopiëren | lang methodiekblok → *Onderbouwing* (potlood) | *‹ Lijn · week 45*; **Stap x van y**; blok *Toepassing · partij*; *gepland · ingevuld* |
| **Week** | gegeven, echte minuten, evaluatiekaart | — | drie minutengetallen met uitleg; geen invulvak bij start, spacing en ombouw; *nog niet gecontroleerd* |
| **Vormenbank** | alles | — | de naam |
| **Home** | signalen | — | herinnering na de training (één keer) |

**Hetzelfde voor elke club:**
- **Swift (zonder methodiek):** dezelfde tabbladen en bediening. Lijn toont weekthema, trainingen en minuten, zonder probleem of leerniveau. De weekevaluatie bevat alleen de notities *wat anders*.
- **Geen DCG-inhoud in de code:** probleem, opdrachten, leerniveaus en vragen komen uit het profiel en de periodisering.

## 9. Wat bij bouwen een besluit vraagt (Spoor 3, het volgende vrije nummer kiezen vlak voor het opslaan)
1. Lijn, Plannen, Week en Vormenbank zoals in v2, met minuten **optie A**.
2. Weekevaluatie: één nieuw veld op het weekplan.
3. Herinnering na de training.
4. Later en apart:
   - **voorstel C** (nieuwe rekenregel);
   - de tweede controlecode en *vergelijken met het bestand*.
