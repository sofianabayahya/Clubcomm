# Bruto veldtijd, organisatie en oefentijd — analyse en voorstel (Spoor 3, 29-10-2026)

*Alleen onderzoek. Er is **niets gebouwd**: geen app-code, database, migratie, profiel of productie gewijzigd. Gecontroleerd tegen `main` = `2946205` (Besluit 141). Voorbeelden: `t1`–`t5` (`.png`, bron `.html` met `ontwerp.css`).*

| # | Scherm | Toestel |
|---|---|---|
| t1 | Plannen DCG O13: 75 veldtijd − 10 organisatie = 65 oefentijd; 68 ingepland, waarschuwing | 390 px |
| t2 | Plannen Swift (verzonnen O15-2): 60 veldtijd − 8 organisatie = 52; 45 ingepland; en zonder organisatie | 390 px |
| t3 | Venster *Organisatie* (het bestaande venster *Ombouw*, herschreven) | 390 px |
| t4 | Week na de training: uitloop volgt uit de echte minuten, reden optioneel | 390 px |
| t5 | Plannen | laptop |

## 1. De huidige werking (code van `main`)

| Onderwerp | Wat er al is | Waar |
|---|---|---|
| **Bruto veldtijd** | Uit de kalender: begin- en eindtijd van de training (17:15–18:30 = 75). Alleen getoond als *75 van 75 min gepland* onderaan Plannen. Geen kleur, geen waarschuwing. Een losse training (zonder kalender) heeft geen veldtijd. | `planMidden` (`duur`) |
| **Organisatie** | Bestaat al als **`overig`** = *Ombouw, wissels, afsluiting*. Komt uit het sjabloon (DCG 75: **7 min**), staat als losse regel onder de opbouw, aan te passen in een venster. **Zonder sjabloon (Swift) is er geen regel en kan hij ook niet worden toegevoegd.** | `p.overig`, `tpOverig` |
| **Minuten per vorm of blok** | Elke plek heeft geplande minuten (`min`). Een vorm neemt bij het plaatsen zijn standaardduur mee. Per blok staat de som in de kop. | `onderdelen[].min`, `groepen` |
| **Automatische optelling** | `totaal` = alle plekken + organisatie. Er is een gekleurde balk (`tr-balk`) met alle plekken naar verhouding. | `totaal`, `balk` |
| **Controle** | Geen. *68 + 7 = 75* klopt toevallig met het sjabloon. Te veel plannen geeft geen signaal. | — |
| **Sjabloon DCG 75** | Start 8 · A1 6 · S 3 · A2 10 · B1 6 · S 3 · B2 10 · partij 22 = **68 oefentijd + 7 organisatie**. KNVB-standaard (Swift): geen sjabloon. | profiel `trainingsopbouw` |
| **Periodisering en CSV** | Geen tijden in het bestand; een concept krijgt het sjabloon, dus ook de 7 min organisatie. | `periodisering.js` |
| **Status** | Gepland / Uitgewerkt / Gegeven gaat over vormen en tekeningen, **niet over tijd**. | `CC.trStatusVan` |
| **Na de training** | *Training is gegeven*. Echte minuten per oefenvorm: 18 bij een geplande 10 = uitgelopen, 0 = niet gedaan. Ook *Klopt zoals gepland*, vier minutengetallen (Besluit 141), de evaluatievragen en *Wat doen we de volgende keer anders?*. | `terugblik`, `minutenKaart` |
| **Vormenbank** | De echte minuten staan bij de training, **niet** bij de vorm. De standaardduur van een vorm verandert nooit door een evaluatie. | `minUit` op het plan |
| **Telefoon / laptop** | Dezelfde opbouw. Op de laptop drie kolommen; de balk en *75 van 75* staan in het midden. | `planDrie` |

**Wat werkelijk ontbreekt:**
- De organisatietijd heeft geen begrip. Hij staat als losse regel onderaan, wordt niet van de veldtijd afgetrokken, en is er bij clubs zonder sjabloon niet.
- Er is geen vergelijking *ingepland ↔ beschikbare oefentijd* en dus ook geen waarschuwing.
- De balk laat niet zien waar de grens ligt.
- Een losse training zonder tijden heeft geen veldtijd.
- Na de training is een uitloop wel af te lezen (echte minuten), maar nergens samengevat. Een reden kun je alleen als vrije tekst kwijt.

## 2. Voorstel: één tijdsbalk, geen tweede planner

**Vier getallen, drie bestaan al:**

| | Begrip | Bron | Nieuw? |
|---|---|---|---|
| A | **Veldtijd** (bruto) | kalender: eind − begin | nee |
| B | **Organisatie** (uitleg, wissels, drinken, ombouw) | `p.overig.min`, de bestaande regel | alleen de naam en de plek |
| C | **Oefentijd** = A − B | berekend | berekening |
| D | **Ingepland** = som van alle plekken (start, vormen, spacing, partij) | berekend uit `min` | berekening |

**Wat de trainer ziet (t1, t5):**
- Bovenaan het midden van Plannen: *75 veldtijd − 10 organisatie ✎ = 65 oefentijd*.
- Daaronder de **bestaande** gekleurde balk, nu over de veldtijd en met een streep op de grens van de oefentijd. Organisatie is gearceerd grijs, wat over de grens gaat oranje gearceerd.
- **Past:** *✓ 45 van 52 min ingepland · nog 7 min vrij* (groen, klein).
- **Te veel:** *⚠ 68 van 65 min ingepland: 3 te veel. De partij (laatste 3 min) valt in de organisatietijd. Je kunt zo doorgaan.*
  - Dit is **nooit een blokkade**. ClubComm signaleert, de trainer beslist.
  - Omdat de partij achteraan staat, ziet de trainer meteen dat **de afsluitende partij in de knel komt**. Dat is het "reserveren" van de partij, zonder extra instelling.
- De regel *75 van 75 min gepland* onderaan vervalt; de organisatieregel onderaan ook (zit nu in de balk). **Elke actie op één vaste plek.**
- Week: dezelfde balk klein in de weekkaart, alleen lezen.

**Organisatie instellen (t3), zonder vaste norm:**
- Tik op *10 organisatie ✎* = het bestaande venster, herschreven. Je vult de minuten in. Er staan twee knoppen met **echte eigen waarden**: *vorige training* (de laatste eigen training van deze trainer) en *sjabloon van de club* (als het profiel er een heeft).
- **ClubComm vult nooit zelf iets in en kent geen standaard van 10.** Zonder sjabloon (Swift) staat er *+ organisatie*, en vergelijkt ClubComm alleen met de veldtijd (t2 onderaan).
- Bij **Kopiëren naar** en **Eerdere training overnemen** gaat de organisatie mee (dat gebeurt nu al met `overig`).

**DCG 75 / 10 / 65:**
- Dit **kan per training meteen**: vul 10 in bij organisatie.
- Het sjabloon zelf blijft 68 + 7. Wil je dat elke nieuwe training met 10 start, dan moet het **profiel** worden aangepast (organisatie 10 en drie minuten minder in de blokken). Dat is een **inhoudelijke keuze van Spoor 1 en een profielwijziging**, met apart akkoord.
- **Gevolg voor bestaande gegevens:** de 23 concepttrainingen uit de periodisering houden 68 + 7. Ze passen dus binnen de balk. Zet de trainer daar 10 organisatie, dan ziet hij *3 te veel*. Dat is precies het bedoelde signaal; er verandert niets vanzelf.

**Swift (t2):** dezelfde balk en bediening.
- De veldtijd komt uit de eigen kalender (bijv. 60 min).
- De organisatie stelt de trainer zelf in; zonder sjabloon begint hij leeg.
- Geen methodiek, gereedschappen of leerniveaus nodig: de tijdsplanning leest **alleen** de minuten.

**Losse training zonder kalendertijden** (pakket Trainers begeleiden zonder rooster): één optioneel vak **Veldtijd** in het bestaande venster *Thema en aantallen*, alleen als er geen kalendertijd is. Zonder veldtijd toont de balk alleen de som, zonder grens.

## 3. Efficiëntie: wel helpen, geen rekenmachine voor ombouw

- **Voorstel:** alleen het **handmatige organisatiebudget**, met één tip in het venster. Een variant van dezelfde vorm of spacing op hetzelfde veld kost weinig ombouw; een nieuwe vorm met ander materiaal of andere aantallen meestal meer.
- **Varianten bestaan al** (`variant` per plek). In de regel staat dan *variant B*, zodat zichtbaar is dat het dezelfde organisatie is (t1, A2).
- **Spacing** blijft wat het is: een plek met minuten, meestal op hetzelfde veld. Er komt geen apart ombouwveld.
- **Later, alleen als je dat wilt:** een stil getal *4 wisselingen van vorm* (opeenvolgende plekken met een andere vorm; spacing en een variant van dezelfde vorm tellen niet). Informatie, geen oordeel en geen minuten. **Niet in de eerste stap:** het raakt de oefenvormkiezer (Besluit 139) en levert misschien weinig op.

## 4. Na de training: uitloop zonder extra administratie (t4)

**Wat er al is en blijft (geen dubbele registratie):**
- de echte minuten per vorm: *18* bij gepland 10 = uitgelopen, *0* = vervallen, minder = ingekort;
- *Klopt zoals gepland* als alles volgens plan ging;
- *Wat doen we de volgende keer anders?*.

**Nieuw, klein:**
1. **Samenvatting** in de bestaande minutenkaart van Week (Besluit 141), geen nieuwe kaart. Bijvoorbeeld: *Uitgelopen: A2 +8 · ingekort: B2 −2 · vervallen: Partij*. Dit volgt uit de echte minuten; de trainer vult niets extra in.
2. **Waardoor? (niet verplicht)**, alleen zichtbaar als iets uitliep of verviel. Keuzes: *uitleg · ombouw / materiaal · drinken · vorm liep niet · vertraging*, meer dan één mag.
   - Opslag: één nieuwe sleutel bij de training, bijvoorbeeld `uitloop: ['uitleg', …]`.
   - Dit is **geen databasemigratie** (het staat in dezelfde rij), wel een nieuw gegeven, dus een besluit.
3. **Werkelijke totale duur:** **niet** vragen. De veldtijd staat vast in de kalender, en organisatieminuten achteraf schatten is administratie zonder waarde. De echte oefenminuten vertellen genoeg.

**De Vormenbank blijft onaangeraakt.** Uitloop en reden horen bij die ene training. Een signaal in de Vormenbank (*liep 2× uit*) kan later, als informatie; het verandert de standaardduur nooit.

## 5. Meerdere clubs, rechten en gegevens

- **Generiek:** één code voor elke club. De tijdsplanning gebruikt alleen veldtijd (kalender), organisatie (training) en minuten (plekken).
- **Uit het profiel:** alleen het optionele sjabloon (DCG). Geen DCG-inhoud in de code; Swift werkt zonder profiel.
- **Rechten en privacy:** trainingen blijven *eigen* (scope `eigen`, zelfde RLS). Er komen geen persoonsgegevens bij: tijd en een reden bij een training. Geen nieuwe tabel en geen migratie.
- **Nieuwe sleutels in de training** (optioneel, alleen als ze worden gebruikt):
  - `uitloop` (reden);
  - `veldtijd` (alleen bij een losse training zonder kalendertijd).

  `overig` blijft de organisatie: geen hernoeming in de gegevens, alleen in beeld.
- **Bestaande trainingen, periodisering en CSV:** ongewijzigd.
  - Oude trainingen tonen de balk met hun eigen `overig` (DCG 7).
  - Een training zonder `overig` heeft geen organisatie, tot de trainer die invult.
  - **Stempel (Besluit 133):** organisatie invullen telt als *aangepast*. Zo'n concept wordt dan niet meer verwijderd bij *Geladen concepten verwijderen*. Dat is gewenst, want de trainer heeft het aangepast.
- **Bijvangst om te controleren (los van dit voorstel):** in het KNVB-standaardprofiel staan de evaluatievragen als losse tekst, terwijl de code vragen met een `id` en een `schaal` verwacht. Ze zijn nu niet zichtbaar (status *controleren*), maar ze zouden niet werken als ze worden aangezet.

## 6. Aanpassingen, risico's en gevolgen

| Aanpassing | Bestand | Maat | Risico |
|---|---|---|---|
| Tijdsbalk bovenaan Plannen (bestaande `balk` + grens + vier getallen + waarschuwing); onderste regel en organisatieregel weg | `training.js`, `app.css` | M | Test op *75 van 1 min* aanpassen |
| *+ organisatie* ook zonder sjabloon; venster met *vorige training* en *sjabloon* | `training.js` | M | Geen; `overig` bestaat |
| Kleine balk in de weekkaart (Week) | `training.js` | S | — |
| Veldtijd bij losse training zonder kalendertijd | `training.js` | M | Nieuwe sleutel `veldtijd` |
| Samenvatting uitloop in de minutenkaart | `training.js` | S | Geen invoer, alleen berekening |
| *Waardoor?* bij uitloop | `training.js` | M | Nieuwe sleutel `uitloop`; tellen in de stempel |
| DCG-sjabloon 75 = 65 + 10 | profiel DCG | Spoor 1 + profielwijziging | Raakt nieuwe trainingen, niet de bestaande |

**Botsingen:**
- Er staan geen open pull requests.
- De onderzoeksbranches *vaardigheidsaccent*, *accenten* en *profiel-leesrechten* raken alleen documenten.
- De oude branch `claude/exciting-curie-c7ldhg` raakt `training.js`, maar ligt stil.
- Oefenvormkiezer (139) en vormvenster: niet geraakt. De kiezer leest de minuten van de plek al.

## 7. Volgorde van bouwen (na een besluit)
1. **Tijdsbalk + organisatie** (Plannen en Week, ook zonder sjabloon). Daar zit het grootste nut: vóór de training zien dat de partij in de knel komt. Geen nieuw veld.
2. **Uitloop na de training:** eerst alleen de samenvatting (geen nieuw veld), daarna eventueel *Waardoor?* (nieuwe sleutel).
3. **Veldtijd bij losse trainingen** (alleen als Swift-trainers zonder rooster werken).
4. **Apart en later:**
   - DCG-sjabloon 65 + 10 (Spoor 1, profiel);
   - eventueel het stille getal *wisselingen*;
   - het signaal in de Vormenbank.

## 8. Bewust NIET bouwen (te veel administratie of schijnzekerheid)
- **Ombouwminuten per overgang**, of een berekende ombouwtijd op basis van materiaal of aantallen: fictief en bewerkelijk.
- **Een verplicht veld per oefenvorm** (organisatietijd, uitlegtijd, drinktijd).
- **De werkelijke organisatietijd of de totale duur achteraf vragen.** De veldtijd staat vast, en de echte oefenminuten zeggen genoeg.
- **Een standaard van 10 minuten** voor alle clubs of leeftijden, of een automatisch ingevuld budget.
- **Blokkeren** bij overschrijding, of de opbouw automatisch inkorten.
- **De standaardduur van een vorm in de Vormenbank automatisch aanpassen** na een uitloop.
- **Tijd als voorwaarde voor de status** *Uitgewerkt* (informatie is geen taak).
- **Een melding** bij te veel plannen; het staat in beeld zolang je plant.
- **Een aparte "tijdplanner"** of een extra tabblad.
