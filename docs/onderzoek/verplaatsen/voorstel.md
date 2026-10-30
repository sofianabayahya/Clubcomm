# Een geplaatste vorm naar een andere plek verplaatsen — voorstel (Spoor 3, 30-10-2026)

*Alleen onderzoek, niets gebouwd. Gecontroleerd tegen `main` = `eb4dcd0`. Voorbeelden op 390 px: `v1-verplaatsen.png` (venster van de vorm) en `v2-na.png` (na één tik).*

## Probleem
Een training bestaat uit **plekken** met een vaste code (Start, A1, S, A2, B1, S, B2, P) uit het sjabloon. De vorm zit óp de plek.
- **↑ Omhoog / ↓ Omlaag** (in het venster van de vorm) verwisselen hele regels, **inclusief de code**. De vorm van Start wordt daardoor geen A1: de regel *Start* schuift alleen naar beneden en A1 blijft leeg.
- De enige weg is nu: de vorm weghalen en op A1 opnieuw kiezen. Minuten, variant, leerniveau en notitie ben je dan kwijt.
- **Gevolg:** een technische vorm voor *Aannemen en meenemen* die op Start staat, telt niet voor de leerlijn (Start telt niet mee, Besluit 141) en bepaalt het gereedschap van blok A niet.

## Voorstel: één regel *Verplaatsen naar* in het bestaande venster
- In het venster van een geplaatste vorm (`tpOnderdeel`) staat bovenaan een rij plekken: **Start · A1 · A2 · B1 · B2 · Partij**.
  - Bij elke plek staat wat er nu op staat (*leeg · 6 min* of de naam van de vorm). De huidige plek is grijs.
  - Spacing-plekken (S) staan er niet bij; die verplaats je zelden, en ↑/↓ blijft bestaan.
- **Eén tik, daarna ongedaan maken:**
  - **Lege plek:** de vorm gaat erheen, en de oude plek wordt leeg.
  - **Bezette plek:** de twee vormen wisselen van plek.
  - Daarna staat 8 seconden *Naar A1 verplaatst · Ongedaan maken* in beeld (zelfde melding als bij de oefenvormkiezer, Besluit 139).
- **Wat meegaat met de vorm:** de vorm zelf, de minuten (gepland en echt), de variant, de notitie, het vastgezette leerniveau en de vastgezette fase.
- **Wat bij de plek blijft:** de code, het leerniveauvoorstel uit de periodisering en het fasevoorstel uit het sjabloon. Een vorm op A1 krijgt dus het voorstel van A1, tenzij je zelf een leerniveau had vastgezet.
- **De minuten wisselen mee.** Na het verplaatsen heeft de lege plek de minuten van de plek waar de vorm heen ging (Start 8 → A1 met 8 min; Start wordt *leeg · 6 min*). Het totaal en de tijdsbalk (Besluit 142) blijven precies gelijk.
- **Start is niet verplicht.** Een lege plek kun je weghalen met de bestaande knop *Weghalen*; dan gaan die minuten eraf. In de lege Start-regel staat *leeg · niet verplicht: weghalen mag*.
  - Let op: zolang er een lege plek is, blijft de status *Gepland* in plaats van *Uitgewerkt*. Dat is de bestaande regel en blijft zo; weghalen lost het op.
- **Zonder plekcodes** (een vrije training, bijv. Swift zonder sjabloon) is er geen rij plekken. Daar blijft ↑/↓ de manier om de volgorde te veranderen.

## Gegevens, gevolgen en grenzen
- **Gegevens:** geen nieuw veld en geen migratie. De velden van twee regels in dezelfde training worden omgewisseld.
- **Wat niet verandert:**
  - de Vormenbank (de vorm zelf);
  - de evaluatie;
  - andere trainingen.
- **Gevolgen die gewenst zijn:**
  - het gereedschap van een blok kan veranderen als het uit de eerste vorm komt; Besluit 144 laat dat zien als *uit gekozen vorm*;
  - de minuten voor de leerlijn volgen de nieuwe plek;
  - een concept telt als *aangepast* (stempel).
- **Laptop:**
  - In de eerste stap komt hetzelfde venster, één tik.
  - **Later en apart** kan slepen van een geplaatste regel naar een andere plek erbij. Slepen vanuit de Vormenbank bestaat al en blijft gelijk.
- **Niet doen:**
  - een aparte planner;
  - vrij hernoemen van plekcodes;
  - automatisch herschikken of het sjabloon aanpassen;
  - een waarschuwing dat een technische vorm niet op A1 hoort. Dat hoort hij wel; ClubComm signaleert, de trainer beslist.

## Maat en volgorde
- **Maat M:** de functie verandert, er is geen gegevensrisico. Na akkoord: besluit, bouwen, gerichte tests (DCG op 390 px en de laptop, met plekken; club zonder sjabloon, zonder plekken; ongedaan maken; tijdsbalk gelijk), dan de volledige test.
- **Ongeveer 40 regels** in `training.js` en een paar regels opmaak.
