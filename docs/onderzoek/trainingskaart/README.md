# Trainingskaart — oud en nieuw (Besluit 144)

*30-10-2026, Spoor 3. Echte DCG O13-gegevens (kopie van productie, alleen gelezen; het bekijken veranderde 0 rijen). Drie standen: **oud** (`main`), **nieuw** (deze branch, weekplannen zoals ze nu in de database staan) en **gecorrigeerd** (deze branch, na de voorgestelde correctie van de weekplannen; nog niet uitgevoerd).*

## Vergelijking in het kort

| | Oud | Nieuw |
|---|---|---|
| Opbouw | Losse regels door elkaar (probleem, A/B, niveau, gedrag, contra, voorstel) | Stand bovenaan + vijf vaste regels: Wat · Waar · Welke · Niveau · Mee uit vorige |
| Waar komt het vandaan? | Niet te zien; weekplan en training liepen door elkaar | Label per regel: *Eigen*, *Periodisering*, *Weekvoorstel* |
| Weekplan | Vulde stil aan wat de training niet had (ook het niveau van de eerste dag) | Staat apart als *Weekvoorstel*; vult nooit vanzelf in |
| Vorige training | De hele evaluatietekst (vr 30: een alinea van ruim 260 woorden) | Alleen de *Concrete afspraak*-zin + *volgende training: één variabele aanpassen* + link |
| Wedstrijd | Niet in de kaart | Eigen regel onder Waar, los van het dagthema |
| Accenten | Niet te zien | *Accenten in gekozen vormen* (uitdrukkelijk geen trainingsaccent) |
| Concept gewijzigd? | Niet te zien | *nog niet aangepast* / *door jou aangepast*; *Oorspronkelijke planning ›* bij de eerste wijziging |
| Swift (geen profiel) | Geen kaart | Alleen weekvoorstel (als er geen eigen thema is) en *Mee uit vorige* |

## Per dag

- **di 27 (eigen training, periodisering niet toegepast).** Oud toonde het weekniveau *Uitvoeren → Herkennen* alsof het de training was. Nieuw: *Niveau: niet gekozen voor de training*, het dagthema *Passeren (dreigen)* als *Eigen*, het weekvoorstel apart.
- **do 29 (eigen training).** Oud: probleem en A/B van de week + de hele evaluatie van di 27. Nieuw: *Geen afspraak herkend bij di 27 okt* met de link, accenten en gereedschap uit de gekozen vormen (*Eigen*). Gecorrigeerd: ook *Periodisering voor deze dag (niet toegepast): Technische onderbouw opbouwen · Uitvoeren → Herkennen*.
- **vr 30 (concept, onveranderd).** Alles *Periodisering*; *Mee uit vorige* toont alleen de afspraak van do 29. Gecorrigeerd: *Wedstrijdsituatie za 31 okt: Opbouwen achteruit: eerste druklijn uitspelen · 3 observatiepunten*.

## Schermen (telefoon 390 px)

| | Oud | Nieuw | Gecorrigeerd |
|---|---|---|---|
| di 27 | ![](oud-tel-kaart-di27.jpg) | ![](nieuw-tel-kaart-di27.jpg) | ![](gecorrigeerd-tel-kaart-di27.jpg) |
| do 29 | ![](oud-tel-kaart-do29.jpg) | ![](nieuw-tel-kaart-do29.jpg) | ![](gecorrigeerd-tel-kaart-do29.jpg) |
| vr 30 | ![](oud-tel-kaart-vr30.jpg) | ![](nieuw-tel-kaart-vr30.jpg) | ![](gecorrigeerd-tel-kaart-vr30.jpg) |

Laptop, do 29: [oud](oud-lap-kaart-do29.jpg) · [nieuw](nieuw-lap-kaart-do29.jpg) · [gecorrigeerd](gecorrigeerd-lap-kaart-do29.jpg).

## Blokkop A/B (30-10)

Boven: geen eigen keuze, het gereedschap komt uit het weekplan (schuin, *weekvoorstel:*). Onder: uit de eerste gekozen vorm. Een eigen keuze staat er gewoon (*A · Passen*).

![](blokkop-herkomst.jpg)

## Correctie van de acht weekplannen (voorstel, niet uitgevoerd)

`supabase/scripts/2026-10-30_dcg_weekplannen_correctie.sql.voorstel`
- **Controle tegen de CSV** (`docs/methodiek/persoonlijk/periodisering-o13-import-CONCEPT.csv`): bij alle acht weekplannen zijn hoofdthema, leerniveaus en route gelijk aan de **eerste trainingsrij** van die week. Het zijn dus dagwaarden, geen weekwaarden.
- **Wat het doet, per weekplan:** hoofdthema, niveaus en route uit `methodiek` halen. Alleen wk 44: die dagwaarden bewaren bij `dagen['2026-10-29']`, omdat die eigen training bij het laden niet is overschreven. Bij zes weken het hoofdthema van de wedstrijd als `wedstrijd.context`. Daarna een nieuwe `stempel`.
- **Wat het niet aanraakt:** de trainingen zelf, observatiepunten en hun uitkomsten, *vastgelegd*, alle andere velden.
- **Alles of niets:** elk weekplan wordt in zijn geheel vergeleken met de gecontroleerde versie. Is er één intussen veranderd, dan stopt het script met *Gestopt: … is veranderd* en wordt er niets aangepast, ook niet bij de andere weken. (De controlecode `stempel` alleen was niet genoeg: die verandert niet als de trainer een weekplan aanpast.)
- **Lokaal getest (30-10, tijdelijke database met de leeskopie, niet productie):**
  - gewone uitvoering: 147 rijen, alleen de 8 weekplannen veranderd, uitkomst precies gelijk aan de verwachte stand; do 29-10 blijft een eigen training (geen concept, geen methodiek) en de dagwaarden staan bij `dagen['2026-10-29']`; wk 44 houdt zijn 3 observatiepunten;
  - bij de andere 7 weken staan de verwijderde dagwaarden al in de concepttraining van die dag; er gaat dus niets verloren;
  - tweede keer uitvoeren: stopt, niets veranderd;
  - één weekplan vooraf aangepast: stopt, niets veranderd.
- **Vóór uitvoeren:** productie opnieuw lezen. Is er sinds 30-10 iets veranderd aan een weekplan, dan stopt het script vanzelf; dan maak ik een nieuw voorstel.

## Wat nog ontbreekt voor vaardigheidsaccenten per trainingsplek

1. **Een veld per plek.** Accenten staan nu bij de vorm (`vh`), niet bij de plek in de training. Nodig: een eigen keuze per onderdeel, bijv. `onderdelen[i].accent`. Eigen besluit (M, geen migratie: JSON in een bestaande rij).
2. **De blokkop.** Opgelost in #105 (weergave): de kop toont *weekvoorstel:* of *uit gekozen vorm*. De oefenvormkiezer filtert nog wel op het weekvoorstel als er niets gekozen is; dat blijft zo tot het accent per plek bestaat.
3. **De kiezer.** Waar kiest de trainer het accent (in het blok of bij de vorm), en adviseert de oefenvormkiezer op dat accent? Nu adviseert hij op de vaardigheden van het profiel.
4. **Evaluatie en Lijn.** Evalueren per accent of per training, en of Lijn minuten per accent telt. Pas besluiten als de keuze per plek bestaat.
5. **De kaart.** *Accenten in gekozen vormen* wordt dan *Accenten per plek* (keuze van de trainer), met de vormaccenten als hulp.
6. **Swift.** Een club zonder vaardigheden in het profiel krijgt geen accentveld; controleren dat niets leeg zichtbaar wordt.
