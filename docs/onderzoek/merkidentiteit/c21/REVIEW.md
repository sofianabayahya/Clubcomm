# Review C2 → C2.1 (Krijtbord-blauw) — Spoor 3

> Onderzoek, 6–7 november 2026, branch `onderzoek/merkidentiteit`. Geen productiecode, database, rechten of publicatie. **Geen designbesluit**: dat neemt de gebruiker na het bekijken van C2.1.
> Prototype: `c21/c21.html` (open in de browser; onderdelen bovenaan). Beelden: `c21/beelden/` (`vgl-*` = C2 naast C2.1). Metingen: `c21/meting.txt`.
> Dit is een **expertbeoordeling**. Er is **geen** gebruikerstest gedaan; het testvoorstel staat in §7.

## 1. Kort

C2 had een sterke beeldtaal, maar was **op een paar plekken stiller fout dan het leek**:
1. het veranderde betekenissen en functies zonder dat te zeggen (menu, trainingsbalk, knoppen);
2. het was alleen getest met de mooie situatie en vaste pixelmaten;
3. het logo viel weg op het blauwe menu.

C2.1 houdt de beeldtaal (krijtlijnen, pion, haltes, één lettertype), zet het **bestaande logo** terug en volgt de app **exact** in menu's, blokken en de trainingsbalk. Alle maten zijn in `rem`, dus grotere tekst werkt. **Advies: optie B, C2.1** (§8).

## 2. Wat er mis was met C2 (eigen werk, kritisch)

| # | Bevinding in C2 | Soort | Ernst | In C2.1 |
|---|---|---|---|---|
| 1 | Eén **verzonnen menu** voor iedereen (Home, Trainers, Teams, Training, Berichten, op de telefoon "Meer"). In de app heeft elke rol een eigen menu: HJO *Home · Trainers · Teams · Inzicht · Berichten*, trainer *Home · Training · Wedstrijd · Spelers · Berichten*, ouder *Home · Planning · Vervoer · Taken · Berichten*. | betekenis/functie | hoog | Menu per rol, zoals in de code |
| 2 | De **trainingsstrook** liet veldtijd, organisatie, oefentijd, de grenslijn en "te veel" weg, en gebruikte één kleur voor alle blokken. De app heeft die al (`training.js` r. 161–176, bloksoortkleuren Start/A/B/S/P). | betekenis | hoog | Dezelfde rekenregel en kleuren, nieuwe vorm; 6 randgevallen doorgerekend |
| 3 | **Verzonnen knoppen en blokken**: *Trainer toevoegen* op Home, *Naar het veld*, *Aanwezig dinsdag* en een *Zaterdag*-blok op de trainer-Home, een weekband met 7 dagen. | functie | middel | Alleen de blokken van `CC.hoHome` en `CC.trainerStart`; Deze week is één regel zoals nu |
| 4 | De **focusknoppen** (Alles / Mini's / Onderbouw) op de HJO-Home ontbraken. | functie | middel | Terug |
| 5 | **Oranje had twee betekenissen**: "wacht op jou" én de knop *Naar het veld*; de grijze pion stond ook bij de *Afspraak*. | betekenis | middel | Oranje alleen nog voor "wacht op jou"; geen oranje knoppen |
| 6 | **Blauw betekende alles** (menu, knop, gekozen, link, trainer in traject). | visueel | middel | Navy = ClubComm (menu/kop), blauw = doen/kiezen |
| 7 | **De status zat in het rondje** van de trainer (blauw/oranje/open/grijs) én in de pion. | betekenis | middel | Rondje = persoon, altijd dezelfde kleur; status staat ernaast |
| 8 | **Nieuw logo** (middencirkel); op het blauwe menu zou het bestaande logo wegvallen. | merk | hoog | Bestaand icoon, ongewijzigd, op navy |
| 9 | **Vaste pixelmaten**: bij grotere tekst in de browser verandert er niets (gemeten: basistekst bleef 16 px bij 200 %). | toegankelijkheid | hoog | `rem`; bij 200 % geen enkel scherm te breed |
| 10 | Tikvlakken te klein: weekdagen 43 px, ↶ ↷ 37 px, losse tekstlinks 16–17 px hoog. | toegankelijkheid | middel | 0 te kleine tikvlakken op 360/390/430/liggend |
| 11 | Hulpteksten op 15 px en labels op 11–14 px. | toegankelijkheid | laag | Hulptekst 16 px; alleen labels (14 px) en menulabels (13 px) kleiner |
| 12 | Lettertype via **Google Fonts** (IP-adres naar Google). | privacy/techniek | middel | Lokaal: één bestand, 90 kB, licentie OFL meegeleverd |
| 13 | Tab-volgorde Training anders dan de app (telefoon: *Op het veld* eerst). | functie | laag | Volgorde zoals de app op de telefoon |

## 3. Terugkerende bevindingen (twintig disciplines, gebundeld)

Merk, visueel ontwerp, typografie, kleur, iconografie, UX, informatiearchitectuur, interactie, mobiel, toegankelijkheid, schrijven, beweging, trainingsdidactiek, sportpraktijk (op het veld), data/randgevallen, frontendarchitectuur, prestaties, privacy, QA en productstrategie. Wat zij samen zeggen:

1. **De beeldtaal is sterk en eigen** (merk, visueel, iconografie, sportpraktijk). Pion, haltes en krijtlijnen passen bij voetbal en dragen informatie. *Behouden.*
2. **Een merk mag geen betekenis veranderen** (UX, IA, didactiek, QA). C2 deed dat ongemerkt (bevindingen 1–5). *Regel: elk scherm volgt de blokken, menu's en woorden van de app; wat anders moet, is een apart functioneel voorstel.*
3. **Eén teken, één betekenis** (kleur, iconografie, toegankelijkheid). *Opgelost met de betekenistabel* (componentenblad).
4. **Schalen met de gebruiker** (toegankelijkheid, mobiel, frontend). `rem` en flexibele rijen in plaats van vaste maten.
5. **Het mooie geval is niet het echte geval** (data, QA, didactiek). Lange namen, 9 vormen in 60 minuten, te veel minuten, lege en foutstatussen zijn nu doorgerekend.
6. **Centraal invoeren** (frontend, onderhoud, productstrategie). `app.css` heeft al kleurvariabelen (`--blauw`, `--inkt`, `--grond`, …); C2.1 gebruikt dezelfde waarden. Invoeren kan dus via tokens en een handvol gedeelde onderdelen (`h.rij`, knoppen, chips, de trainingsbalk), niet per module.
7. **Rust** (beweging, schrijven). Eén beweegmoment (haltes lopen vol), korte zinnen, geen versiering.

## 4. Zes hoofdonderwerpen

### A. Merk en logo
- Het **bestaande logo blijft**, ongewijzigd (uitgeknipt uit `public/assets/clubcomm-logo.jpg`). Geen nieuwe varianten, op verzoek.
- Getoetst in gebruik: 16–64 px, op navy en op wit (componentenblad). Op navy (logo-blauw 4,9:1) en wit staat het goed; op het **blauwe menu van C2 viel het weg** (bijna dezelfde kleur). Daarom is het menu in C2.1 navy.
- Herkenning zonder woordmerk komt nu uit: logo-icoon + navy kop/menu + pion + haltes + krijtlijnen + Archivo.

### B. Kleur en betekenis
Zie de tabel *Eén betekenis per kleur en vorm* in het componentenblad (`c21-kit-lap.jpg`). Kern:

| Rol | Teken |
|---|---|
| Primaire actie | blauwe knop (één per scherm) |
| Selectie | ijsblauw vlak met blauwe rand (tab, filter, gekozen rij) |
| Waarschuwing / wacht op jou | oranje pion + woord |
| Wacht op een ander | grijze pion |
| Klaar | groen vinkje |
| Fout / afgelast / verwijderen | rood (met bevestiging) |
| Voortgang in stappen | haltes |
| Voortgang in minuten | trainingsbalk met bloksoortkleuren (bestaand) |
| Nu / volgende | logo-blauwe ring |
| Clubaccent | schildje en "thuis"-teken |

Blijft bewust dubbel, maar zonder verwarring: **groen** = klaar, B-blok in de balk en het veld in een tekening. De plek maakt het duidelijk, en het B-blok en het veld bestaan al zo.

### C. Mobiel (gemeten, `c21/meting.txt`)
- **Breedte:** 360, 390 en 430 px en liggend (844 × 390), plus 200 % tekst op 360/390/430. C2.1 had in alle 42 combinaties **geen horizontaal scrollen**. De tabs en de gereedschapsrij scrollen bewust zijwaarts.
- **Tikvlakken < 44 px:** C2 had er tot 7 op Home; C2.1 heeft er 0.
- **Afstand tot de eerste actie (390 px):** Home 259 px, trainer-Home 199 px, ouder 438 px. Alles staat op het eerste scherm. Bij 200 % staat de eerste actie op Home op 732 px, nog net zichtbaar; bij Training en Ouder moet je scrollen. Dat is normaal bij dubbele tekst.
- **Paginalengte:** de trainer-Home is korter dan in C2 (901 tegen 1358 px), omdat de verzonnen blokken weg zijn.

### D. Trainingsmodule (`c21-balk-lap.jpg`)
Gebruikt de bestaande rekenregel: veldtijd − organisatie = oefentijd; vakken naar minuten; grijs gestreept = organisatie; oranje gestreept = te veel; zwarte streep = einde oefentijd.

| Geval | Uitkomst |
|---|---|
| 75 min, 5 organisatie, 2 min vrij | klopt; "✓ 68 van 70 · nog 2 min vrij" |
| 60 min, **9 vormen** | klopt; codes alleen in vakken die breed genoeg zijn (≥ 7,5 %), het smalle drinkvak zonder code. De lijst eronder blijft volledig. |
| 75 min, 10 organisatie, **9 te veel** | oranje gestreept stuk na de grenslijn + de bestaande waarschuwing |
| **Leeg** | alleen de tijdregel + "Nog geen vormen gekozen" |
| **Geen kalendertijd** | alleen optellen, met de bestaande zin |
| **Verplaatst** (A2 ↔ B1) | balk volgt de nieuwe volgorde; bestaande melding *Gewisseld met … · Ongedaan maken* |
| **Complexe tekening** | 14 spelers, hoedjes, bal en looplijn blijven leesbaar op 390 px (`c21-tekentool-tel.jpg`) |

Niet in C2.1 en ook niet in de app: begintijden per blok (17:00, 17:10, …). Dat zou nieuwe informatie zijn; zie §6.

### E. Echte gegevens en uitzonderingen (`c21-staten-lap.jpg`, `c21-clubs-lap.jpg`)
- **Lange namen** (*Anne-Marie van den Heuvel-Bakker*, twee teams) breken netjes af; niets wordt afgekapt.
- **Staten:** leeg (met een knop naar de plek waar je iets kunt doen), laden (zachte glans, *Bezig met laden…*), fout (*Opnieuw*), klaar (vinkje + *Opgeslagen · Ongedaan maken*).
- **Clubkleuren:** rood, blauw (lijkt op ClubComm-blauw), zwart-geel en geel-zwart. Omdat de club alleen het schildje en het thuis-teken krijgt, botst geen enkele clubkleur met de betekenissen.

### F. Techniek
- **Tokens:** C2.1 gebruikt de waarden die al in `app.css` staan, en voegt toe: `--navy` (= de huidige `--inkt`), `--logo` (= `--blauw-logo`), de bloksoortkleuren als variabelen en `--pion`. Invoeren begint met de tokens, daarna de gedeelde onderdelen.
- **Gedeelde onderdelen die het meeste dragen:**
  - `h.rij` (pion of persoon links);
  - knoppen en chips;
  - de trainingsbalk (één functie, `training.js`);
  - kop en menu (`core.js`);
  - nieuw: `h.haltes(af, totaal)`.
- **Lettertype:** `fonts/archivo-latin.woff2` (90 kB, variabel, `font-display: swap`). De laadtijd is nog niet gemeten in de echte app. Te doen bij stap 1 van de invoering (doel: LCP < 2,5 s, geen verspringen).
- **Risico:** de 193 Playwright-tests zoeken op tekst en `data-act`, nauwelijks op kleur of vorm. Een visuele invoering breekt daarom weinig tests. Schermafbeeldingsvergelijkingen bestaan nog niet.

## 5. Toegevoegde onderwerpen
- **Ouders en spelers** (`c21-ouder-tel.jpg`): afmelden met deadline, verzamelen/aftrap, rijden (*Ik doe het / Kan niet*), het menu van de ouder. Dezelfde rij, pion en knoppen; geen nieuwe functies.
- **Op het veld** (`c21-veld-tel.jpg`): navy tekst ook voor hulpregels (≥ 7:1 in de zon), een grote tekening onder het gekozen blok en vakken van ≥ 56 px.
- **200 % tekst:** zie C. C2 schaalde niet mee; C2.1 wel, zonder dat iets buiten beeld valt (`vgl-home-200.jpg`).
- **Lettertype lokaal:** zie F.
- **E-mail** (`c21-mail-lap.jpg`): navy kop met logo en clubschildje, één blauwe knop, de systeemletter (mailprogramma's tonen eigen letters niet betrouwbaar). Dit is een voorbeeldtekst; de bestaande teksten blijven.
- **Print** (zwart-witproef): leesbaar zonder kleur, want codes, minuten en "te veel" staan als tekst of streep.

## 6. Functionele voorstellen (bewust níet in C2.1, elk een eigen besluit)
| # | Voorstel | Waarom apart |
|---|---|---|
| F1 | Weekband met 7 dagen op de HJO-Home (uit C2) | andere weergave van Deze week; nu één regel → week |
| F2 | Gereedschap van de tekentool in twee rijen | verandert de bediening |
| F3 | Uitleg in de tekentool zonder *Shift/Ctrl* op de telefoon | teksfout in de huidige app (maat S) |
| F4 | Begintijden per blok in Voorbereiden | nieuwe informatie |
| F5 | Kengetallen-tegels op de HJO-Home weglaten of anders tonen | inhoudskeuze, geen stijl |

## 7. Voorstel gebruikerstest (nog niet uitgevoerd)
- **Wie:** 5 mensen. 2 beginnende oudertrainers, 1 ervaren breedtetrainer, 1 HO/HJO of selectietrainer, 1 ouder. Niet betrokken bij het ontwerp.
- **Hoe:** 15 minuten per persoon, op hun eigen telefoon, met `c21/c21.html` en de herkenningstest (`herkenningstest/index.html`). Er wordt niets bewaard behalve de antwoorden op papier, zonder namen.
- **Vier vragen:**
  1. **Herkenning:** de herkenningstest met C2.1-tegels. Geslaagd als ≥ 4 van de 5 mensen ≥ 3 van de 4 tegels vinden.
  2. **Statussymbolen:** wijs de oranje pion, de grijze pion, het vinkje en de haltes aan en vraag "wat betekent dit?". Geslaagd als ≥ 4 van de 5 ze goed uitleggen zonder hulp.
  3. **Belangrijkste actie:** "Wat moet je nu doen?" op de eigen Home (HJO: Ik neem over; trainer: volgende training; ouder: afmelden). Meet de tijd tot de eerste tik; doel ≤ 5 s.
  4. **Duidelijker dan nu:** laat de huidige app en C2.1 naast elkaar zien in wisselende volgorde. Vraag welke duidelijker is en waarom.
- **Rapportage:** per vraag hoeveel van de 5, met letterlijke citaten. Pas dan mag het woord "getest".

## 8. Drie mogelijke besluiten

| | A. C2 zoals het is | B. C2.1 (aanbevolen) | C. Nog niet kiezen |
|---|---|---|---|
| **Voordelen** | direct beschikbaar | zelfde beeldtaal, maar volgt de app exact; toegankelijk (rem, 44 px, contrast); bestaand logo; randgevallen doorgerekend | ruimte voor een andere richting |
| **Nadelen** | verandert menu's, trainingsbalk en knoppen ongemerkt; logo valt weg; schaalt niet | iets minder "spectaculair" dan C2 (geen weekband, geen oranje knop) | uitstel; het huidige generieke uiterlijk blijft |
| **Risico's** | verwarring bij bestaande gebruikers; tests en besluiten botsen | herkenning alleen door mij beoordeeld, tot de test | dezelfde vragen komen terug bij elke richting |
| **Omvang** | groot (alles opnieuw, plus herstel) | middel: 5 stappen (tokens en letter → onderdelen → Home's → Trainers/Training/tekentool → overige, print, mail) | klein nu, groot later |
| **Afhankelijk van** | — | DESIGN.md + besluit; per stap een voorbeeld en de volledige tests; F1–F5 apart | een nieuwe opdracht |

**Aanbeveling: B, C2.1.** Het houdt wat C2 sterk maakte en haalt weg wat het fout deed. Elke afwijking van de app is zichtbaar gemaakt als apart voorstel (F1–F5). De test met 5 mensen raad ik aan vóór stap 3 (de Home-schermen): goedkoop, en het is de enige manier om "herkenbaar" en "duidelijker dan nu" echt te weten.

*Spoor 3 · onderzoek · geen besluit.*
