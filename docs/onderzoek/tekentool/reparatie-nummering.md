# Voorstel A — Reparatie rugnummering tekentool

*4-11-2026. Spoor 3, maat M (gedrag van een bestaande functie verandert; herziet Besluit 124 deels). **Voorbereid op branch `bouw/tekentool-nummering`, niet samengevoegd en niet gepubliceerd.** Geen database- of productiewijziging. Vervolg in de aparte chat *ClubComm — Ontwikkeling Tekentool*.*

## Begrippen, uit elkaar gehouden
| Begrip | In de gegevens | Betekenis |
|---|---|---|
| Technisch object | de plek van het item in `items` (geen apart id; voor deze reparatie niet nodig) | welke speler het is |
| Rugnummer | `n` (0 = zonder nummer) | alleen een label; je mag het aanpassen; mag bewust dubbel |
| Teamkleur | `c` (rood, lichtblauw, geel, blauw; keeper en trainer apart) | bij welk team de speler hoort |
| Keeper van een team | **nieuw, optioneel** `team` bij een keeper uit *Opstelling* | telt als nummer 1 van dat team |
| Voorgesteld nummer | wordt berekend, niet bewaard | het **eerste vrije** nummer in dat team |

## Exacte oorzaak (code op `main`, `public/app/tekentool.js`)
1. **Verwijderen met een nummerknop.** `tikNummer()`: staat het nummer al op het veld, dan `st.items.splice(i, 1)`. Dat is het gedrag uit Besluit 124: *"nog een keer tikken = weg"*.
2. **Hoogste + 1.** Bij het neerzetten van een speler, bij dupliceren en bij een andere teamkleur: `1 + max(n)`. Een gat (bijvoorbeeld een verwijderde 3) wordt nooit opnieuw gebruikt.
3. **Twee nummersystemen.** `zetOpstelling()` nummert 1, 2, 3… in de volgorde van de lijst, met een keeper *K* zonder team. De nummerbalk zet nummer n op de plek van n in de 1-4-3-3 (1 = keeper). Daardoor is na *8 tegen 8* speler 1 een verdediger, en zet de knop 9 een **tweede** speler op de spitsplek.
4. **Ruilen.** Een gekozen speler een bezet nummer geven ruilt altijd met de teamgenoot. Bewust dubbel kan dus niet.
5. **Ander team.** Is er een speler van het eigen team gekozen en tik je *Zonder nummer* bij de tegenstander, dan verliest de gekozen speler zijn nummer.
6. Er is geen invoer voor 12–99.

## Gewijzigde bediening
| Handeling | Vóór | Na |
|---|---|---|
| Nummerknop van een nummer dat **er nog niet is** | speler op zijn plek | gelijk |
| Nummerknop van een nummer dat **er al is** | speler **verwijderd** | die speler wordt **gekozen** (verplaatsen, hernummeren, bewust verwijderen) |
| Speler verwijderen | ook via de nummerknop | **alleen** met *Verwijderen* (of Delete); *Ongedaan maken* werkt |
| Nieuwe speler (gereedschap, dupliceren, ander team) | hoogste + 1 | **eerste vrije** nummer |
| Gekozen speler, bezet nummer tikken | ruilen | **dubbel**; de knop toont *2×*, de schermlezer *"staat er 2 keer"* |
| Gekozen speler, nummer 14 | kan niet | **Ander nummer…** (1–99, leeg = zonder nummer) |
| Gekozen speler, knop van het andere team | wijzigt de gekozen speler | geldt niet voor de gekozen speler |
| Gekozen speler: welke nummers zijn bezet? | niet te zien | bezette nummers **omrand** |
| *Opstelling* 2-1-2 en 3-3-1 | 1, 2, 3… in lijstvolgorde; keeper zonder team | nummer van de dichtstbijzijnde plek in de 1-4-3-3: **keeper 1**, 3-3-1 = 2, 3, 5, 6, 8, 9, 10; 2-1-2 = 3, 4, 6, 8, 10 |

![Vóór: 390 px](nummering-voor-390.jpg) ![Na: 390 px](nummering-na-390.jpg)

*Links vóór, rechts na: 8×8, opstelling 3-3-1, daarna knop 9.*
- **Vóór:** er komt een tweede speler bij op de spitsplek.
- **Na:** de spits (9) wordt gekozen, en de bezette nummers zijn omrand.

## Meting: mislukte handelingen en correcties
*Script in de browser, op `/tekenen`, laptop 1366 px en mobiel 390 px. "Correcties" = extra handelingen om het bedoelde resultaat alsnog te krijgen.*


### Vóór (main eb4dcd0)
| Scherm | Taak | Tikken | Uitkomst | Correcties |
|---|---|---|---|---|
| laptop | T1 een bestaand nummer aantikken om die speler te kiezen | 2 | MISLUKT (speler 2 verwijderd) | 2 |
| laptop | T3 laagste veldspeler (1) verwijderen, nieuwe speler krijgt 1 | 6 | MISLUKT (kreeg 8) | 2 |
| laptop | T4 speler 1 bewust ook nummer 2 (dubbel) | 3 | MISLUKT (geruild: 2 komt 1× voor, 1 1×) | kan niet |
| laptop | T5 na 3-3-1 nummer 9 (spits) aantikken | 3 | MISLUKT (tweede speler op de spitsplek) | 2 |
| laptop | T6 speler nummer 14 geven | 4 | MISLUKT (kan niet) | kan niet |
| laptop | T7 speler verwijderen (expliciet) en ongedaan maken | 3 | gelukt | 0 |
| mobiel | T1 een bestaand nummer aantikken om die speler te kiezen | 2 | MISLUKT (speler 2 verwijderd) | 2 |
| mobiel | T3 laagste veldspeler (1) verwijderen, nieuwe speler krijgt 1 | 6 | MISLUKT (kreeg 7) | 2 |
| mobiel | T4 speler 1 bewust ook nummer 2 (dubbel) | 3 | MISLUKT (geruild: 2 komt 1× voor, 1 1×) | kan niet |
| mobiel | T5 na 3-3-1 nummer 9 (spits) aantikken | 3 | MISLUKT (tweede speler op de spitsplek) | 2 |
| mobiel | T6 speler nummer 14 geven | 4 | MISLUKT (kan niet) | kan niet |
| mobiel | T7 speler verwijderen (expliciet) en ongedaan maken | 3 | gelukt | 0 |


### Na (bouw/tekentool-nummering)
| Scherm | Taak | Tikken | Uitkomst | Correcties |
|---|---|---|---|---|
| laptop | T1 een bestaand nummer aantikken om die speler te kiezen | 2 | gelukt | 0 |
| laptop | T3 laagste veldspeler (2) verwijderen, nieuwe speler krijgt 2 | 6 | gelukt | 0 |
| laptop | T4 speler 5 bewust ook nummer 6 (dubbel) | 3 | gelukt | 0 |
| laptop | T5 na 3-3-1 nummer 9 (spits) aantikken | 3 | gelukt (spits is al 9, wordt gekozen) | 0 |
| laptop | T6 speler nummer 14 geven | 4 | gelukt | 0 |
| laptop | T7 speler verwijderen (expliciet) en ongedaan maken | 3 | gelukt | 0 |
| mobiel | T1 een bestaand nummer aantikken om die speler te kiezen | 2 | gelukt | 0 |
| mobiel | T3 laagste veldspeler (2) verwijderen, nieuwe speler krijgt 2 | 6 | MISLUKT (kreeg 3) | 2 |
| mobiel | T4 speler 5 bewust ook nummer 6 (dubbel) | 3 | gelukt | 0 |
| mobiel | T5 na 3-3-1 nummer 9 (spits) aantikken | 3 | gelukt (spits is al 9, wordt gekozen) | 0 |
| mobiel | T6 speler nummer 14 geven | 4 | gelukt | 0 |
| mobiel | T7 speler verwijderen (expliciet) en ongedaan maken | 3 | gelukt | 0 |

**De ene mislukking ná de reparatie (mobiel, T3) komt niet door de nummering.** Een speler is op de telefoon ± 9 px groot. Het script tikte daardoor een buurspeler aan en verwijderde die. De nieuwe speler kreeg toen terecht het vrijgekomen nummer. Dit is het probleem met de **mobiele bediening** (prioriteit 6), niet een nummerfout.

## Tests
- **Nieuw: `tests/tekentool-nummering.spec.js`** (5 tests):
  1. opstelling en balk geven dezelfde nummers; keeper = 1; een bestaand nummer tikken kiest de speler; bezette nummers omrand;
  2. eerste vrije nummer, ook na verwijderen en dupliceren;
  3. bewust dubbel, *Ander nummer… 14*, knop van het andere team, verwijderen + ongedaan maken;
  4. telefoon (Pixel 5): een bestaand nummer kiest de speler;
  5. **bestaande tekening** (dubbel nummer, nummer 12, keeper zonder team, spelers zonder nummer, doelen M en S): openen en opslaan → gegevens en tegel precies gelijk.
- **Aangepast:** `tekentool: nummerbalk en rood schijfje` in `tests/app.spec.js` (de stap *"nog een keer = weg"* wordt *"kiest de speler"*).
- **Groen:** alle 10 tests `@tekentool`, `tests/kiezer.spec.js` en `tests/trainingskaart.spec.js` (die tonen tekeningen). De volledige `npm test` volgt vóór een eventuele pull request.

## Bestaande tekeningen blijven ongewijzigd
- De tekencode (`itemSvg`, `fieldSvg`, `staticSvg`) en het opslagformaat zijn **niet** gewijzigd. Alleen bediening en nummerkeuze zijn veranderd.
- Een tekening openen en opslaan zonder iets te doen geeft **exact dezelfde gegevens** (test 5).
- Oude dubbele nummers, nummer 12 en keepers zonder team blijven zoals ze zijn. Nieuw gedrag geldt alleen voor wat je **na** de reparatie doet.
- Het enige nieuwe gegeven is `team` bij een keeper die je **nieuw** met *Opstelling* plaatst. Oude tekeningen zonder dat veld tonen precies hetzelfde.
- Geen migratie en geen script. De 19 tekeningen in productie zijn niet aangeraakt.

## Gevolgen voor Besluit 124 (tekst voor het besluit, na akkoord)
> **◐ Deels herzien door Besluit [nummer bij akkoord]:** een nummer dat al op het veld staat aantikken **kiest** die speler; verwijderen gebeurt alleen met *Verwijderen* (ongedaan te maken). Een gekozen speler krijgt het getikte nummer zonder te ruilen (dubbel mag bewust), en *Ander nummer…* geeft 1–99. Nieuwe spelers krijgen het eerste vrije nummer. *Opstelling* gebruikt dezelfde nummers als de balk; de keeper hoort bij een team en is nummer 1.

## Nog te doen vóór samenvoegen (na jouw akkoord)
1. Bespreken in de chat *Ontwikkeling Tekentool* (met ChatGPT).
2. Besluitnummer kiezen en vastleggen; Besluit 124 markeren.
3. Volledige `npm test`, pull request, CI groen.
4. Daarna pas samenvoegen, na je aparte akkoord.
