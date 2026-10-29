# Herontwerp Lijn · Plannen · Week · Vormenbank — analyse en ontwerp (Spoor 3, 29-10-2026)

*Ontwerp en analyse, nog geen besluit. **Niets gebouwd**: geen app-code, database of productie gewijzigd. Voorbeelden in deze map:*
- *`1-lijn.png`: telefoon, 390 px;*
- *`2-week.png`: telefoon, 390 px;*
- *`3-plannen-laptop.png`: laptop, 1366 px.*

*De bronnen staan als `.html` met `ontwerp.css` ernaast.*

## 0. Praktijkvoorbeeld: week 45 (correctie)
De drie trainingsopdrachten uit de vraag horen in de periodisering van DCG O13 bij **week 45 (3–7 nov)**, niet bij week 44:

| Dag | Trainingsopdracht (hoofdthema) | Leerniveau (voorstel) |
|---|---|---|
| di 3 | Passkwaliteit en timing van vrijlopen | Uitvoeren → Herkennen |
| do 5 | Vrije speler herkennen onder druk | Herkennen → Kiezen |
| vr 6 | Opbouw tegenover variabele druk | Kiezen → Afstemmen |
| za 7 | vv Zwanenburg (thuis) | 3 observatiepunten |

- Het **voetbalprobleem** is *Vooruitgang creëren*.
- **A = Passen, B = Vrijkomen**, met Aannemen en meenemen als ondersteunend gereedschap.
- Week 44 (29–30 okt) had A = Aannemen, B = Passen, met andere opdrachten.

**Wat de week laat zien:** drie verschillende opdrachten bij hetzelfde probleem, met een oplopend leerniveau. Dat moet het scherm laten zien.

## 1. Hoe het nu werkt (gelezen in de code van `main`, c5a2697)
| Tabblad | Wat er nu staat | Wat er schuurt |
|---|---|---|
| **Lijn** (DCG) | *Mijn lijn*: één regel per week (probleem, A/B, leerniveau begin → eind, bolletjes, wedstrijd, minuten). Knoppen *Periodisering laden…*, *Vaststellen*/*Weer concept*, *Terugdraaien…*. | De **trainingsopdrachten** per dag zijn niet te zien: de week toont alleen het weekprobleem. Beheerknoppen staan tussen het werk. *x min* zegt niet welke minuten. |
| **Lijn** (zonder methodiek, zoals Swift) | Weekthema per week, tabel *minuten per hoofdleerdoel*, lijst *Per week*. | Andere opbouw dan bij DCG; de bediening verschilt. |
| **Plannen** | Weekstrook, regel *Je zit in*, de training in blokken (kop, methodiekblok, plekken, minuten), *Mijn vormen* links, rechts terugblik of evalueren. | Het methodiekblok is lang. De **plaats van deze training in de week** ontbreekt. |
| **Week** | Dag, aanwezigheid, de training als lijst, na afloop *Training is gegeven*, echte minuten per vorm, evaluatiekaart, *wat anders*. | Gepland en echt staan niet naast elkaar. Niet te zien welke minuten meetellen voor de leerlijn. Geen weekbeeld. |
| **Vormen** | Bibliotheek: zoeken, filters, nieuwe vorm, vormvenster. | Naam *Vormen* zegt weinig. |

## 2. Ontwerp per tabblad (één navigatie voor elke club)
| Tabblad | Doel (één zin) | DCG ziet extra | Een club zonder methodiek ziet |
|---|---|---|---|
| **Lijn** | Waar staan we in de opleiding, en wat leverde de week op? | Voetbalprobleem, A/B, leerniveau per training, contrathema, observatiepunten | Weekthema, trainingen met status, minuten |
| **Plannen** | Deze ene training ontwerpen | Leerniveau per plek, methodiekblok, *Van dinsdag*-voorstel | Blokken, vormen, minuten |
| **Week** | Vandaag uitvoeren, daarna evalueren | De evaluatiekaart uit het profiel | Gegeven, echte minuten, *wat anders* |
| **Vormenbank** | Vormen maken, tekenen, bewaren, terugvinden | Classificatie uit het profiel | Zelfde bank |

### Lijn (voorbeeld `1-lijn.png`)
- **Behouden:**
  - één regel per week met bolletjes;
  - leerniveau begin → eind;
  - tik op een week;
  - een week in het verleden blijft ingeklapt.
- **Nieuw:**
  - **weekdetail om uit te klappen** (de huidige week staat open): het voetbalprobleem en het gedrag bovenaan;
  - daaronder **"Drie trainingsopdrachten, één probleem"**, met per training de opdracht, het leerniveau en de status;
  - tik op een training = naar **Plannen** van die dag;
  - daaronder de **weekevaluatie** (§5).
- **Verplaatsen:** laden, vastleggen en terugdraaien gaan naar het menu **Beheer ▾** (§3).
- **Minuten:** één regel *Leerlijn deze week (uitgevoerd): Passen 30 · Vrijkomen 22 min*, volgens de keuze in §4.

### Plannen (voorbeeld `3-plannen-laptop.png`)
- **Behouden:**
  - de blokken met plekken;
  - de Vormenbank links (slepen, tikken);
  - Printen en Kopiëren;
  - *Kies oefenvorm* (PR #97).
- **Nieuw:**
  - **trainingsopdracht bovenaan**, met *Bijdrage aan de week*: welk leerniveau en welke stap deze dag zet;
  - per plek: **vorm, leerniveau, weerstand en geplande minuten** op één regel;
  - rechts **de week in één oogopslag**: de drie trainingen met deze dag gemarkeerd, en het voorstel *Van dinsdag* uit de evaluatie (bestaat al als *Voorstel van …*, nu op een vaste plek).
- **Verplaatsen:** het lange methodiekblok gaat naar *Onderbouwing*, achter het potlood bij de trainingsopdracht. De mobiele samenvatting blijft kort.

### Week (voorbeeld `2-week.png`)
- **Behouden:**
  - weekstrook, aanwezigheid;
  - *Training is gegeven*;
  - echte minuten per onderdeel;
  - de evaluatiekaart (3 open vragen + verdiepend), *wat anders*.
- **Nieuw:**
  - **gepland en echt naast elkaar** in één tabel;
  - drie getallen onderaan: **gepland · uitgevoerd · telt voor leerlijn**;
  - de regels die meetellen staan vet.
- **Geen dubbel invoerwerk.** De evaluatie gaat vanzelf naar de weekevaluatie in Lijn.

### Vormenbank
- **Alleen de naam** verandert (*Vormen* → *Vormenbank*). Functies blijven gelijk.
- Dit geldt voor alle clubs. Tests en handleidingen die *Vormen* noemen, moeten mee.

## 3. Beheer periodisering (menu **Beheer ▾** in Lijn)
| Functie | Wat het **echt** doet (code `periodisering.js`) | Voorgestelde naam en uitleg |
|---|---|---|
| Periodisering laden… | Leest een CSV. Toont eerst per regel wat er gebeurt. Na *Toevoegen*: een concept bij elke training **zonder** voorbereiding, een weekplan per week, en observatiepunten bij wedstrijden. **Overschrijft nooit**. Tijden en kalender veranderen niet. | **Periodisering laden** — *"Vult alleen lege trainingen. Bestaande trainingen blijven zoals ze zijn."* |
| Vaststellen | Zet bij alle weekplannen van het team een datum (*Vastgesteld 2 nov*). Gevolg: de knop Terugdraaien verdwijnt. **Trainingen worden niet vergrendeld**: alles blijft aan te passen, en laden kan nog steeds (alleen lege trainingen). | **Vastleggen als plan** — *"Het weekplan wordt je uitgangspunt. Trainingen blijven aan te passen. Terugdraaien kan dan niet meer."* *Weer concept* maakt het ongedaan. |
| Terugdraaien… | Verwijdert alleen concepten uit een geladen bestand die **niet aangepast** (stempel gelijk) en **niet gegeven** zijn. Ook weekplannen zonder beoordeelde observatiepunten. Aangepaste of gegeven trainingen blijven. Toont eerst hoeveel er weg gaan en hoeveel blijven. | **Geladen concepten verwijderen** — *"Alleen wat je nog niet hebt aangepast of gegeven."* |

**Waarom een menu:** het zijn handelingen van een paar keer per seizoen. In het menu staat het werk van elke week (de lijn) voorop. *Beheer* toont alleen wat kan: zonder geladen periodisering alleen *laden*.

## 4. Minuten: hoe het nu telt (precies) en wat de vraag is
| Getal | Waar | Wat telt mee (nu) | Wat telt niet mee |
|---|---|---|---|
| **Gepland** (`totaal`) | Plannen (*75 van 75 min*), Week (*· 75 min*) | **Alle** onderdelen (ook lege plekken, start, spacing, partij) + ombouw | — |
| **Echt invullen** | Week, na *gegeven* | Elk onderdeel **met een vorm** dat geen spacing is (ook de start) | Spacing, lege plekken, ombouw |
| **Uitgevoerd** | Mijn lijn (*x min* per week) | Gegeven trainingen: vormen, geen spacing, **geen start**; echt of anders gepland | Start, spacing, ombouw, lege plekken, niet gegeven |
| **Leerlijn** (`minutenPerLeerdoel`, maand) | Lijn ingeklapt, tabel bij clubs zonder methodiek | Gegeven trainingen: vormen, geen spacing, geen start; **naar het hoofdgereedschap van de vorm** | Vormen zonder hoofdgereedschap, start, spacing, ombouw; ook-gereedschappen (alleen geteld als *ook geraakt*) |

**Wat niet klopt of onduidelijk is (niets aan veranderd):**
1. **Gepland telt lege plekken mee.** Een leeg concept staat op *75 min*. Voorstel: *gepland 75 · ingevuld 32*.
2. **Echt invullen vraagt ook de start, maar de start telt nergens mee.** Verwarrend.
3. **De leerlijn kijkt naar de vorm, niet naar de training.** Een vorm met hoofdgereedschap *Passen* in blok A = *Aannemen* telt voor Passen. Methodisch hoort het **gereedschap van het blok** (de opdracht van die dag) te tellen, en kan dezelfde vorm in een andere training iets anders trainen (zie het vaardigheidsaccent).
4. **Partij telt mee** als de partijvorm een hoofdgereedschap heeft, anders niet. Methodische vraag: telt de partij voor A en B (transfer), voor geen enkel gereedschap, of apart als *toepassing*?
5. **Uitgevoerd in Mijn lijn** telt ook vormen zonder gereedschap mee. Dat getal is dus groter dan de leerlijn, maar heet allebei *min*.
6. **Een gegeven training waarvan *gegeven* niet is aangevinkt**, telt 0. Signaleren na de training (één keer)?

**Voorstel ter keuze (pas na akkoord):**
- **A, alleen duidelijker maken:**
  - de drie getallen naast elkaar (*gepland · uitgevoerd · telt voor leerlijn*) met uitleg;
  - de start niet meer vragen.
- **B, ook de telling volgens de opdracht:**
  - de leerlijnminuten van een plek gaan naar het **gereedschap van het blok** (A of B), anders naar het hoofdgereedschap van de vorm;
  - de partij telt apart als *toepassing* (of voor A en B, dat kiest u).

  Het voorbeeld `2-week.png` laat B zien (*het gereedschap komt van het blok*).

## 5. Weekevaluatie (nieuw, zonder dubbel invoerwerk)
- **Bron (bestaat al):**
  - per training de evaluatiekaart (`evaluatie`: probleem ontstaan, gedrag zichtbaar, weerstand, verdiepend);
  - *wat anders*;
  - per wedstrijd de observatiepunten met *gezien / deels / niet gezien*.
- **Het voorstel** (`1-lijn.png`) zet dat per vraag naast elkaar, met daaronder de notities. Het geeft een **voorstel voor volgende week**: *behouden · één variabele aanpassen · ander complexiteitsniveau*. Bron is de verdiepende vraag *Volgende training*; is die er niet, dan het meest genoemde antwoord.
- **Pas na *Bevestigen*** staat het vast, op het weekplan. Dat is **nieuw: één veld op het weekplan**. *Aanpassen* = de tekst zelf wijzigen. Niets gaat vanzelf naar de volgende week.
- **Zonder evaluatiekaart in het profiel** (zoals Swift): alleen de *wat anders*-notities en de aantallen gegeven en afgelast.

## 6. Overzicht: behouden · verplaatsen · nieuw
| | Onderdeel |
|---|---|
| **Behouden** | Navigatie Lijn · Plannen · Week · (Vormen)bank voor alle clubs; weekregel met bolletjes; blokken en plekken; *Kies oefenvorm*; slepen; printen en kopiëren; aanwezigheid; *Training is gegeven*; echte minuten; evaluatiekaart; observatiepunten; *Voorstel van …*; de importregels (nooit overschrijven) |
| **Verplaatsen** | Laden, vastleggen en terugdraaien → menu *Beheer*; het lange methodiekblok → *Onderbouwing* achter het potlood; *Per week* en de minutentabel (clubs zonder methodiek) → in het weekdetail |
| **Nieuw** | Weekdetail met *trainingsopdrachten, één probleem*; *Bijdrage aan de week* in Plannen; *de week in één oogopslag* rechts in Plannen; drie minutengetallen in Week; weekevaluatie met bevestigen (één nieuw veld op het weekplan); naam *Vormenbank* |

## 7. De route in het voorbeeld
1. **Lijn**: week 45 staat open. Tik op *do 5 · Vrije speler herkennen onder druk*.
2. **Plannen**: de training van donderdag. Pas B2 aan (*Kies oefenvorm*). Rechts staan de week en het voorstel *van dinsdag*.
3. **Week**, na afloop:
   - *Training is gegeven*;
   - de echte minuten naast de geplande;
   - drie keer tikken op de evaluatiekaart;
   - één zin *wat anders*.
4. **Lijn**: in de weekevaluatie staat donderdag erbij (*gedrag zichtbaar: ja*). Tik op *Bevestigen* aan het eind van de week.

## 8. Voorwaarden (gecontroleerd in het ontwerp)
- **Navigatie:** dezelfde voor alle clubs. DCG toont meer, Swift minder (§2).
- **Geen DCG-voetbalinhoud in de code:** probleem, opdrachten, leerniveaus en evaluatievragen komen uit het profiel en de periodisering.
- **Niets aan bestaande gegevens veranderd:** periodisering, trainingen, evaluaties en vormen zijn niet aangeraakt.
- **Normen:**
  - tikvlakken van minstens 44 px;
  - leestekst 16 px (tweede regels 14 px, zoals nu in de app);
  - geen horizontale scroll op 390 px (gemeten).

## 9. Vragen aan de initiatiefnemer
1. **Minuten:** A (alleen duidelijker) of B (ook telling volgens het gereedschap van het blok)? En hoe telt de **partij**?
2. **Vastleggen als plan:** is de naam goed? Moet er ook een **wijzigingslog** komen na het vastleggen?
3. **Weekevaluatie:** mag *Bevestigen* aan het eind van de week één keer worden gesignaleerd, of alleen zichtbaar in Lijn?
4. **Vormenbank:** de naam geldt voor alle clubs. Akkoord?
