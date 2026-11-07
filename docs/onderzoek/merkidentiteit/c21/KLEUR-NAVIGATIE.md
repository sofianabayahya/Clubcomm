# Kleuronderzoek navigatie C2.1 — Spoor 3

> 7 november 2026, branch `onderzoek/merkidentiteit`. Alleen visueel onderzoek: geen productiecode, geen nieuwe functies, geen samenvoeging, geen besluit.
> Eén prototype, vier kleuren voor menu en kop: `c21.html?nav=navy|blauw|licht|wit`. In de browser kun je bovenaan wisselen. Inhoud en werking zijn in alle vier exact hetzelfde.
> Het **logo is ongewijzigd**: het originele icoon uit `public/assets/clubcomm-logo.jpg`, gemeten kleur **#0089FD**.

## Beelden (C2.1-navy naast de drie alternatieven)
| Wat | Bestand |
|---|---|
| HJO Home, laptop | `beelden/navvgl-home-lap.jpg` |
| Trainer Home met menu, telefoon | `beelden/navvgl-trainerhome-tel.jpg` |
| Ouder Home met menu, telefoon | `beelden/navvgl-ouder-tel.jpg` |
| Menu op de laptop, uitvergroot | `beelden/navvgl-rail.jpg` |
| Logo op 24, 32 en 48 px en het verschil met het clubembleem | `beelden/navvgl-merk-lap.jpg` |
| A zonder wit logovlak | `beelden/nav-blauw-zondervlak-merk-lap.jpg` |

## De varianten
- **Navy** (C2.1): navy menu en kop, witte menubalk op de telefoon.
- **A · ClubComm-blauw**: menu, kop en menubalk in #0869C2. Het logo staat op een **wit vlak**: zonder dat vlak valt het weg (zie de meting).
- **B · lichtblauw**: menu, kop en menubalk in #E7F2FE (het bestaande `--blauw-l`). Navy voor tekst; het gekozen item is wit met blauwe tekst.
- **C · wit**: menu, kop en menubalk wit met een dunne lijn. Het logo is het sterkste kleurvlak; blauw alleen voor het gekozen item, links en knoppen. Dit lijkt het meest op de huidige app.

## Metingen (contrast, `contrast-navigatie.txt`)
Norm: tekst 4,5:1, grafische vormen (logo, embleem, pion) 3:1.

| | Menutekst | Gekozen item | Telefoonmenu | Logo tegen menu | Clubrood | Blauwe club | Pion (oranje) |
|---|---|---|---|---|---|---|---|
| Navy | 10,4 | 12,0 | 7,0 | **4,4** | 2,2* | 1,9* | 5,5 |
| A blauw | 4,7 | 7,2 | 4,7 | **1,6** ✗ (met wit vlak 3,5) | 1,3* | 1,5* | **2,0** ✗ |
| B licht | 8,6 | 7,2 | 8,6 | **3,1** | 6,1 | 7,1 | **2,5** ✗ |
| C wit | 7,0 | 6,4 | 7,0 | **3,5** | 6,9 | 8,0 | **2,8** ✗ |

\* Het clubembleem heeft een witte rand van 2 px. Op navy en blauw is het daardoor toch zichtbaar (wit tegen blauw 5,5:1), maar het embleem zelf valt weg.

**Eigen bevinding, geldt voor alle lichte varianten:** de oranje pion (#F97316, het huidige `--kaart-oranje`) haalt op wit maar **2,8:1**, net onder de 3:1 voor vormen. De pion staat altijd naast een woord, dus de betekenis gaat niet verloren, maar de vorm zelf is te licht. Een iets donkerder oranje lost dit op: **#EA580C** (3,6:1 op wit) of **#C2410C** (5,2:1). Dat is een kleine aanpassing van een token, geen nieuwe functie.

Alle varianten: 0 tikvlakken kleiner dan 44 px, hetzelfde lettertype en dezelfde maten (rem).

## Beoordeling (1–5, expertoordeel, niet getest met gebruikers)

| Vraag | Navy | A blauw | B licht | C wit |
|---|---|---|---|---|
| 1. Laat het originele logo het best spreken | 4 | 2 | 4 | **5** |
| 2. Meest toegankelijk en vriendelijk | 3 | 3 | 4 | **5** |
| 3. Sterkste eigen ClubComm-identiteit | 3 | **4** | **4** | 3 |
| 4. Werkt het best voor trainers én ouders | 3 | 3 | 4 | **5** |
| 5. Wijkt het minst af van het huidige designsysteem | 2 | 3 | 4 | **5** |
| **Totaal** | 15 | 15 | 20 | **23** |

Toelichting per variant:
- **Navy:** het beste contrast, maar ook jouw bezwaar: hard en zakelijk. Het logo staat er goed op (4,4:1), maar het is een kleur die ClubComm nu niet heeft.
- **A, ClubComm-blauw:** herkenbaar blauw, maar het **logo verdwijnt** (1,6:1). Het logo is zelf blauw. Met een wit vlak blijft het zichtbaar, maar dan krijgt het logo een witte rand die het nu niet heeft. Daarnaast:
  - het clubembleem en de pion vallen weg (1,3 en 2,0:1);
  - blauw wordt weer een versiering in plaats van "doen of kiezen". Dat was precies het probleem uit de review.
- **B, lichtblauw:** zacht en vriendelijk, en het logo staat er goed op (3,1:1, net boven de norm). Er is één wrijving: de menukleur is dezelfde ijskleur die elders in de app **"gekozen"** betekent (filterknoppen, gekozen rij). In het menu moet "gekozen" daarom wit worden, en dan betekent dezelfde kleur op twee plekken iets anders.
- **C, wit:** het logo is het enige kleurvlak in de navigatie en valt het meest op. De hoogste toegankelijkheid voor iedereen, en de kleinste verandering ten opzichte van nu: de huidige app heeft al een witte kop en menubalk. Het **risico**: met alleen wit kan het weer "generiek" voelen. De eigenheid moet dan komen uit het logo, de letter Archivo, de pion, de haltes en de krijtlijnen, niet uit de menukleur.

## Advies
**Kies C, wit, en verlaag het oranje van de pion naar #EA580C.**
- Het voldoet het best aan jouw eigen uitgangspunt: de herkenning zit in het **huidige blauw en het bestaande logo**. Op wit is het logo het blauwste en vriendelijkste element op het scherm.
- Het is het toegankelijkst en het minst afwijkend. Trainers en ouders hoeven aan niets te wennen behalve de nieuwe stijl van de inhoud.
- De keerzijde, een minder uitgesproken menu, is bewust: zware kleurvlakken passen niet bij "vriendelijk", en in A zou blauw weer versiering worden.

**Tweede keus: B.** Kies B als je meer "ClubComm-blauw" in beeld wilt dan alleen het logo. Leg dan vast dat het gekozen item in het menu wit is, en houd de ijskleur verder alleen voor "gekozen" in de inhoud.

**Niet doen:** A. Het logo heeft dan een extra vlak nodig om zichtbaar te blijven, en clubembleem en status verdwijnen tegen het blauw.

*Spoor 3 · visueel onderzoek · geen besluit.*

---

## Vervolg 7 november: C · wit gekozen (voorkeur, nog geen besluit)

Uitgewerkt in `c21.html?nav=wit` (volledig wit) en `c21.html?nav=witaccent` (wit met een subtiel lichtblauw accent).

**Scheiding tussen navigatie en werkgebied**, zonder zware vlakken:
- de navigatie is wit, het werkgebied krijtgrijs (#F5F7FA);
- er staat een dunne rand tussen, met een zachte schaduw naar het werkgebied (laptop) of onder de kop en boven de menubalk (telefoon).

**Navy** staat alleen nog in tekst en kleine informatievlakken, zoals de melding *Opgeslagen*. Niet meer als menu of kop, ook niet in de e-mailkop.

**Het verschil tussen de twee:**

| | Volledig wit | Wit met lichtblauw accent |
|---|---|---|
| Gekozen menu-item (laptop) | blauwe tekst + blauwe streep | één afgeronde rechthoek in lichtblauw om icoon en woord (aangepast 7-11, geen losse streep meer) |
| Gekozen tab (telefoon) | blauwe tekst + blauwe streep | één afgeronde rechthoek in lichtblauw om icoon en woord (was een pilletje alleen achter het icoon) |
| Randen | grijs (#D3DEEB) | lichtblauw (#C6DDF6) |

Vergelijking als twee schermafbeeldingen: `beelden/wit-vs-accent-desktop.jpg` en `beelden/wit-vs-accent-mobiel.jpg`.

**Oranje pion #EA580C, contrast op de gebruikte achtergronden** (norm voor vormen: 3:1; de pion staat altijd naast een woord):

| Achtergrond | Oud #F97316 | Nieuw #EA580C |
|---|---|---|
| Wit (vlakken, navigatie) | 2,80 | **3,56** |
| Krijt (werkgebied) | 2,61 | **3,32** |
| IJs (gekozen rij, accent) | 2,47 | **3,14** |
| Grijs label | 2,49 | **3,16** |
| Waarschuwing (#FFF4E5) | 2,58 | **3,28** |

Overal boven 3:1. Op ijs is de marge klein (3,14). Daarom staat de pion bij voorkeur niet op een gekozen (ijs)vlak, of altijd met het woord ernaast, zoals nu. De oranje tekst (#A84D08) verandert niet. De oranje hoedjes in tekeningen zijn tekenkleuren en blijven zoals ze zijn.

**Advies: volledig wit, met het lichtblauwe accent alleen voor het gekozen menu-item.**
- Het lichtblauwe vlak achter het gekozen item laat beter zien waar je bent dan alleen een streep, vooral op de telefoon en voor ouders.
- Het pakt geen aandacht weg van het logo.
- Lichtblauwe randen voegen weinig toe; die kunnen grijs blijven.
