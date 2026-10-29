# Vaardigheidsaccent per trainingsplek en de vormpagina — analyse (29-10-2026)

*Onderzoek, geen besluit. Raakt twee sporen: de **inhoud** (accenten, doelzinnen, voorstellen per blok) is Spoor 1, de **software** (plek met accent, vormpagina, varianten, print, rechten) is Spoor 3. Er is niets veranderd aan code, database of productie. Voorbeelden: `voorbeeld-telefoon.png` en `voorbeeld-laptop.png` in deze map (bron `voorbeeld.html`).*

## 1. Uitgangspunten (reactie van de initiatiefnemer, 29-10)
- **Drie lagen, niet door elkaar:**
  - *vaardigheidsaccent*: wat wil ik ontwikkelen?
  - *technische uitvoering*: hoe voert de speler het uit?
  - *contextvariatie*: vanuit welke situatie?

  Ze worden niet alle drie een verplicht veld.
- **Het accent hoort bij de trainingsplek**, als voorstel uit de periodisering en daar aan te passen. A1 en A2 mogen hetzelfde accent hebben; het hoeft niet.
- **Het leerniveau staat los van de plek.** A1 is niet vanzelf *Uitvoeren*, A2 niet vanzelf *Herkennen*. De periodisering mag een progressie voorstellen.
- **Doelzin:** alleen uit het profiel bij het gekozen accent. Het teamgedrag van de week verschijnt alleen als context en wordt nooit in het oefendoel gezet.
- **Voorstellen per blok** zijn nooit verplicht. A2/B2 moet ook zonder weerstand en op *Uitvoeren* kunnen.

## 2. Vergelijking: de 37 vaardigheden tegenover de accenten (eerst 2 gereedschappen)
Soort: **A** = vaardigheidsaccent · **U** = technische uitvoering · **C** = contextvariatie. *Bron* zegt waar het woord vandaan komt.

### Aannemen en meenemen
| Nu in het profiel (startlijst) | Soort | Nieuw accent van de initiatiefnemer | Toelichting |
|---|---|---|---|
| Eerste contact vooruit | A? | *Gericht eerste contact* of *Vooruit meenemen* | Vooruit is een **richting** van het gerichte eerste contact. **Vraag:** samenvoegen met *Gericht eerste contact*, of als *Vooruit meenemen*? |
| Eerste contact van druk af | A | **Eerste contact van de druk af** | Zelfde betekenis, id kan blijven. |
| Open draaien | A | **Opendraaien** | Zelfde betekenis, id kan blijven. |
| Meenemen uit druk | C (of A) | — | In het kerndocument een *keuze* bij probleem 1. Is eerder de context "onder druk" bij *Eerste contact van de druk af* of *Vooruit meenemen*. **Vraag:** schrappen als accent? |
| — | A | **Gericht eerste contact** | Nieuw. |
| — | A | **Vooruit meenemen** | Nieuw. |
| — | A | **Kiezen tussen meenemen en passen** | Nieuw. Let op: overlapt met leerniveau *Kiezen*. Als accent beschrijft het *waartussen* gekozen wordt; het leerniveau zegt *hoeveel* keuze er is. Kan samen bestaan. |

**Uitvoering (U), uit het kerndocument en de keuzes "HOE":** binnenkant · buitenkant · zool · wreef · met de verre voet · lichaam openen · passende voet.
**Context (C), uit "waarnemen" en de complexiteit:**
- pass recht, schuin of van achteren;
- bal over de grond of halfhoog;
- tempo van de pass;
- zonder, passieve of echte druk;
- drukrichting;
- ruimte.

### 1v1 aanvallend
| Nu in het profiel (startlijst) | Soort | Voorstel | Toelichting |
|---|---|---|---|
| Passeren | A | **Passeren** | |
| Dreigen | U (of A) | — | In de training van 27-10 *"Passeren (dreigen)"*: een **middel** om te passeren (schijnbeweging, dreiging). **Vraag:** uitvoering van *Passeren*, of een eigen accent? |
| Beschermen | A | **Beschermen (afschermen)** | |
| Wegdraaien | A | **Wegdraaien** | |
| Indribbelen | A | **Indribbelen** | Ruimte vóór je in dribbelen (probleem 2). |
| Uit druk dribbelen | C | — | Context "onder druk" bij *Beschermen* of *Wegdraaien*. **Vraag:** schrappen als accent? |
| Tegenstander binden | A? | **Binden en uitspelen (lokken)** | Het kerndocument noemt *lokken* (verklarende woordenlijst) en *binden en spelen*. Raakt ook Passen. **Vraag:** accent bij 1v1 of bij Passen? |

**Uitvoering (U), uit het kerndocument** (technische onderbouw 1v1): binnenkant/buitenkant · zool · richtingswisseling · tempowisseling · schijnbeweging · stop-start · versnellen · lichaam tussen bal en tegenstander.
**Context (C):**
- tegenstander van voren, van opzij of van achteren;
- 1v1 naar een lijn of naar een doel;
- met keeper;
- na de aanname;
- ruimte groot of klein.

**Daarna (na akkoord):** dezelfde vergelijking voor Passen, Vrijkomen, 1v1 verdedigen en Afwerken. Geen enkele vorm gebruikt al een vaardigheid (database 29-10: 6 vormen, 0 met vaardigheden). Vervangen of hernoemen geeft dus geen gegevensverlies.

## 3. Voorstel gegevensstructuur (zo min mogelijk nieuw)
| Waar | Veld | Nieuw? | Waarom |
|---|---|---|---|
| **Profiel**, per gereedschap | `vaardigheden: [{ id, naam, doel? }]` | `doel` nieuw | De doelzin per accent (Spoor 1 vult in). |
| **Profiel**, per gereedschap | `uitvoering: [..]`, `context: [..]` | nieuw, optioneel | Gedeelde keuzelijsten per gereedschap, niet per accent. Zo wordt niets dubbel opgeslagen. |
| **Profiel**, per sjabloonblok | `vormVoorstel: { leeromgeving, weerstand, type }` | nieuw, optioneel | Het voorstel bij een nieuwe vorm komt uit het profiel, niet uit de code. KNVB/Swift krijgen het niet vanzelf. |
| **Plek** (onderdeel van een training) | `vh` en `vhVoorstel` | nieuw | Zelfde patroon als het bestaande `niveau` en `niveauVoorstel`. |
| **Plek** | `doel` | nieuw | Alleen opgeslagen als de trainer het zelf schrijft of vastzet. Anders wordt het voorstel uit het profiel getoond, niet opgeslagen. |
| **Plek** | uitvoering en context | **niet nieuw** | Gaat via de gekozen **variant** (bestaand: `variant`) en de **notitie** (bestaand). |
| **Vorm** | `vaardigheden`, `koppelingen`, `doel`, `leeromgeving`, `weerstandNiveau`, `type` | bestaand | Vorm blijft herbruikbaar; het accent van vandaag zit op de plek. |
| **Vorm** | `niveauAdvies` | via PR #97 | Zie §6: als informatie, niet als oordeel. |
| **Variant** | `soort`: technisch, context of weerstand | nieuw, optioneel | Bestaand blijft: `naam`, `tekst`, `richting` (makkelijker/moeilijker) en eigen tekening (anders de hoofdtekening). |

**Dezelfde vorm, ander accent:**
- Een bestaande vorm kiezen verandert de vorm nooit.
- Mist de vorm het accent, dan zegt de kiezer *past deels: ander accent*, met de knop *accent ook aan deze vorm toevoegen*. Dat gebeurt alleen als de trainer erop tikt.

## 4. Rechten: kunnen gewone trainers het profiel lezen?
**Gecontroleerd in de database (29-10).**
- Het profiel staat als rij met scope `hjo`.
- De regel `priv.cc_mag` zegt bij `hjo`: *alleen beheerder of coördinator*.
- Een trainer zonder beheerdersrol leest het profiel dus **niet**. De app toont dan geen gereedschappen, vaardigheden of leerniveaus, en geen Mijn lijn.
- De initiatiefnemer merkt dit nu niet, omdat hij beheerder is.

**Waarom niet scope `club`?** Die kan iedereen in de club lezen, ook ouders. Dat is te ruim.

**Voorstel (Spoor 3, maat L, apart akkoord):**
- Een nieuwe scope **`staf`**.
- **Lezen:** iedereen met een staffunctie in de club (trainer of teamleider van minstens één team), plus beheerder, coördinator en HO/TC.
- **Schrijven:** alleen de beheerder. De app schrijft het profiel toch nooit; dat doen scripts.
- **Scheiding tussen clubs blijft:** de bestaande voorwaarde `club_id = priv.cc_club()` staat in de leesregel vóór de scope.
- **Werk:**
  1. een migratie (nieuwe tak in `cc_mag`);
  2. het profiel van DCG naar scope `staf`;
  3. de rechtentest uitbreiden:
     - trainer leest wel;
     - trainer schrijft niet;
     - ouder leest niet;
     - trainer van club X leest het profiel van club Y niet.

  De lokale beveiligingstest uit PR #99 kan dit vooraf controleren.

## 5. Gevolgen voor wat er al is
| Wat | Gevolg | Oplossing |
|---|---|---|
| **22 conceptrainingen O13** (database) | Nog geen accent. Ze blijven werken. | Accenten later laten **aanvullen** voor concepten die niet zijn aangepast: alleen lege velden, met voorbeeld vooraf. De gewone import slaat trainingen met een voorbereiding over. |
| **Stempel** (aangepast of niet) | Komt er `vhVoorstel` bij, dan verandert de stempel en ziet de app het concept als aangepast. | `vhVoorstel` net als het doelvoorstel **buiten** de stempel houden, of de stempel opnieuw zetten bij het aanvullen. |
| **6 vormen** | Geen vorm gebruikt vaardigheden. 2 hebben varianten; die krijgen geen label en blijven werken. | Niets nodig. |
| **Profiel** (`dcg.json` en de database) | Nieuwe accentenlijst en doelzinnen: een profielwijziging met controlesom en terugdraaiscript. | Na akkoord op de lijst (Spoor 1). |
| **Tests** | Testen gebruiken nu `vh-passeren` en `vh-vooruit-inspelen`. | Bijwerken met de nieuwe lijst. |
| **CSV-import** | Oude bestanden blijven werken. | Nieuwe **optionele** kolommen: `accent_A1`, `accent_A2`, `accent_B1`, `accent_B2` (of `accent_A` en `accent_B` voor beide plekken), `leerniveau_A1` … voor een eigen niveau per plek, en `doel_A1` …. Zonder `leerniveau_A1` blijft het huidige voorstel (eerste niveau naar A1/B1, tweede naar A2/B2), alleen als voorstel. |
| **Print** | Per blok accent, leerniveau en doel van vandaag. | Gegevens bestaan dan; alleen de printopmaak. |
| **Swift en KNVB** | Niets verandert. Zonder accenten in het profiel verschijnt er niets extra. | — |

## 6. PR #97 (één oefenvormkiezer): technisch veilig?
**Technisch: ja.**
- De branch staat op de actuele `main`. Er is geen conflict met `main` en geen conflict met PR #99.
- **Wel een conflict met PR #98**, alleen in `CLAUDE.md`. #98 beschrijft zelf hoe dat op te lossen is.
- **Tests:** lokaal 72 van 72 groen, en ook op GitHub.
- **Database en rechten:** de PR verandert daar niets aan.
- **Let op:** samenvoegen met `main` betekent dat het vanzelf online gaat.

**Inhoudelijk aandachtspunt (het aanbevolen leerniveau):**
- Een vorm krijgt `niveauAdvies`.
- Verschilt dat van het leerniveau van de plek, dan zet de kiezer de vorm **oranje en lager**.
- Dat botst met het uitgangspunt dat het leerniveau los staat van de vorm. Dezelfde vorm kan op een ander leerniveau worden gebruikt als de trainer weerstand, ruimte of regels aanpast (mengpaneel).

**Voorstel:**
- Het aanbevolen leerniveau alleen als **informatie** tonen ("meestal gebruikt bij: Uitvoeren"), zonder oranje en zonder de volgorde te veranderen.
- Wel oranje laten: een *ander accent* en een *ander aantal spelers*.
- Dat kan in #97 zelf (kleine aanpassing) of in de volgende ronde.

**Volgorde:**
1. #97 samenvoegen, na akkoord, met eventueel de aanpassing van het leerniveau.
2. De rechten (§4).
3. De accenten.

## 7. Voorbeeld van de werkstroom (A1 · Aannemen en meenemen · Gericht eerste contact · Uitvoeren)
1. **CSV:** `gereedschap_A` = Aannemen en meenemen, `accent_A1` = Gericht eerste contact, `leerniveau_A1` = Uitvoeren.
2. **Plannen:** `A1 · Gericht eerste contact · Uitvoeren · voorstel` (gestippeld). Eén tik op het accent of het leerniveau = vastzetten of wijzigen.
3. **Lege plek** → *Kies oefenvorm*, al gefilterd op Aannemen · Gericht eerste contact · aantal spelers.
4. **Nieuwe vorm** → de vormpagina (zie de voorbeelden):
   - bovenaan de **trainingsopdracht** met het doel van vandaag (doelzin uit het profiel, aan te passen);
   - het teamgedrag alleen als context;
   - het **voorstel A1** (*Geïsoleerd · Geen weerstand · Droog/techniek*): pas bewaard na *Overnemen*;
   - daaronder tekening en inhoud, de varianten met label, en de kenmerken ingeklapt.
5. **Later dezelfde vorm**, bijvoorbeeld bij A2 · *Opendraaien* · *Uitvoeren*: de plek krijgt dat accent en de vorm blijft gelijk. Een contextvariant kan de opstelling aanpassen.
6. **Print:** per blok accent, leerniveau en doel van vandaag.

## 8. Vragen aan de initiatiefnemer (Spoor 1)
1. **Aannemen:**
   - *Eerste contact vooruit*: samenvoegen met *Gericht eerste contact*, of wordt het *Vooruit meenemen*?
   - *Meenemen uit druk*: schrappen als accent (het wordt context)?
2. **1v1 aanvallend:**
   - *Dreigen*: uitvoering van *Passeren* of een eigen accent?
   - *Uit druk dribbelen*: context?
   - *Binden en uitspelen*: bij 1v1 of bij Passen?
3. **Doelzinnen** voor de accenten van deze twee gereedschappen: levert u die aan, of zal ik voorstellen schrijven op basis van het kerndocument (als concept, ter controle)?
4. **Uitvoering en context** als keuzelijst per gereedschap in het profiel, of alleen vrije tekst in varianten en notitie?
