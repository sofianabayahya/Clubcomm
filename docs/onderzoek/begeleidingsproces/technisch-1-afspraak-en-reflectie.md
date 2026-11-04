# Technisch voorstel 1 — Vorige-afspraaklus en reflectievolgorde

*4-11-2026. Spoor 3 (software) op basis van de besluiten in `README.md` (§ Besluiten 4-11). **Voorstel, niet gebouwd.** Maat **M**: nieuwe velden in bestaande rijen, **geen nieuw recht, geen migratie**. Hangt af van migratie 033 (zie Afhankelijkheden).*

## Doel
1. Bij elk nieuw begeleidingsmoment staat de **vorige ontwikkelafspraak** klaar; de HJO legt vast of die is **teruggezien**, en na het gesprek of de afspraak is **afgerond, voortgezet of aangepast**. De oorspronkelijke afspraak en de historie blijven bewaard.
2. De trainer **reflecteert direct na de training** (drie vragen), vóór het reflectiegesprek. Een **mondelinge** terugblik kan de HJO als status vastleggen, **zonder** antwoorden namens de trainer op te slaan.

## Hergebruik (bestaat al)
| Wat | Waar |
|---|---|
| Begeleidingsmoment met vijf fasen, `actId`, `vakken.afspraak`, `klaar`, `gedeeld` | `public/app/begeleiding.js`, soort `begeleidMomenten`, scope `trainerdossier` (begeleider schrijft, trainer leest) |
| Reflectie van de trainer (3 vragen, automatisch bewaren, *Klaar* = `reflectieOp`) | `begeleidZelf` (scope `trainerzelf`, eigenaar = trainer; beschermd door 033) |
| Acties op Home van de trainer | `CC.begelActies` (nu: *Je verslag staat klaar* als `gedeeld && !reflectieOp`) |
| Volgend moment plannen, ontwikkelpunt naar het traject | `begelNieuw`, `begelInplannen`, traject `ontwikkelpunt` |
| Weergave voor de trainer | `CC.views.begelVerslag`, `CC.views.mijnOntw` |

## Nieuwe gegevens (alleen nieuwe velden in bestaande rijen)
**In het nieuwe begeleidingsmoment** (`begeleidMomenten`, `trainerdossier`; alleen de begeleider schrijft):
```
opvolging: {
  vanMoment: 'bm…',            // het vorige moment van deze trainer met een afspraak (expliciet, zie "Welke afspraak")
  afspraak: '…',               // kopie van de tekst zoals die toen was afgesproken (momentopname: blijft gelijk)
  teruggezien: 'ja' | 'deels' | 'nee' | 'nb',   // nb = niet beoordeeld
  toelichting: '…',            // één zin: welk gedrag was waarneembaar
  door: 'persoon-id', op: 'ISO-tijd'
}
afspraakUitkomst: {            // na het reflectiegesprek
  status: 'afgerond' | 'voortgezet' | 'aangepast',
  nieuw: '…',                  // alleen bij 'aangepast' of 'voortgezet' met nieuwe woorden; wordt ook vakken.afspraak van dit moment
  door, op
}
reflectieMondeling: { op, door }   // status: in het gesprek mondeling teruggekeken; GEEN antwoorden
```
**Historie** = de keten van momenten. Elk moment bewaart zijn eigen `vakken.afspraak` (de afspraak van toen) en de `opvolging` van de vorige (met een kopie van de tekst). Wijzigt iemand later het oude moment, dan blijft de kopie in `opvolging.afspraak` gelijk; de weergave toont dan *"tekst is later aangepast"*.

**In de eigen opslag van de trainer** (`begeleidZelf[momentId]`, `trainerzelf`; alleen de trainer schrijft, na 033):
```
tussentijds: [{ tekst: 'Hoe ik eraan werkte…', op }]   // eigen inschatting, nooit gemengd met de HJO-observatie
g: { g1, g2, g3 }, vragenVersie: 2                      // de nieuwe drie vragen (Spoor 2); oude antwoorden r1–r3 blijven bij hun vragen
```

## Welke afspraak hoort bij het nieuwe moment? (geen gok)
- Kandidaat: het **laatste afgeronde moment van dezelfde trainer** (`trainerId`) met een afspraak, ongeacht welke begeleider.
- ClubComm **stelt die voor**; de HJO bevestigt met één tik (*Dit is de afspraak die openstaat*) of kiest *Geen open afspraak*. Pas dan wordt `opvolging.vanMoment` gevuld.
- Een afspraak met status *afgerond* is geen kandidaat meer; *voortgezet* of *aangepast* wel (de nieuwste tekst).

## Reflectievolgorde
| Nu | Voorstel |
|---|---|
| Home-actie pas als het verslag is gedeeld | Home-actie **na de training** (`datum ≤ vandaag`, `!reflectieOp`): *Kijk terug op je training (3 vragen)* |
| Het verslag toont alles tegelijk | Vóór het delen: alleen **doel + eigen reflectie**. Na delen: feedback en *Samen afgesproken* (ontwerp uit de demo) |
| De HJO ziet de reflectie in Nazorg | De HJO ziet de schriftelijke reflectie bovenaan het **Reflectiegesprek**, of de knop *Mondeling besproken* (status, geen tekst) |
| Herinnering: geen | Eén herinnering na 24 uur (ronde 5, keuze B), niet verplicht, geen vergrendeling |

*Geen vergrendeling:* de HJO kan het gesprek altijd starten. Ontbreekt de schriftelijke reflectie, dan staat er *"Nog niet schriftelijk teruggekeken"* met de keuze *Mondeling besproken*. De trainer kan daarna nog schriftelijk invullen; dat blijft zijn tekst.

## Schermen die veranderen
| Rol | Scherm | Verandering |
|---|---|---|
| HJO | Moment · Voorbereiding | blok *Vorige afspraak* (voorstel + bevestigen) |
| HJO | Moment · Praktijk (of direct erna) | *Teruggezien · Gedeeltelijk · Nog niet · Niet beoordeeld* + één zin |
| HJO | Moment · Reflectiegesprek | bovenaan de reflectie van de trainer, of *Mondeling besproken* |
| HJO | Moment · Nazorg | *Afgerond · Voortgezet · Aangepast* (+ nieuwe tekst) |
| Trainer | Home | actie *Kijk terug op je training* na de training; blok *Mijn ontwikkelafspraak* met de laatste stand |
| Trainer | Verslag | volgorde: doel → eigen reflectie → (na delen) feedback → samen afgesproken |
| Trainer | Mijn ontwikkeling | historie van de afspraak; *Hoe ik eraan werkte* (eigen, tussentijds) |
| HJO (optioneel, na #108) | Snelvenster trainer | één regel *vorige afspraak → teruggezien → volgende stap* |

## Regressietests
- **Nieuw `begeleiding-afspraak.spec.js` (nieuw, in `tests/`):** keten van drie momenten (afspraak → teruggezien *deels* → *voortgezet* met nieuwe tekst → *afgerond*); historie zichtbaar voor trainer en HJO; het oude moment later wijzigen laat de kopie gelijk; geen kandidaat na *afgerond*; twee begeleiders wisselen elkaar af.
- **Reflectievolgorde:** Home-actie na de training en niet ervoor; vóór delen geen feedback zichtbaar; *Mondeling besproken* slaat **geen** antwoorden op (`begeleidZelf` ongewijzigd); openen van het verslag schrijft niets; oude antwoorden (r1–r3) bij hun eigen vragen.
- **Bestaand, moet groen blijven:** `tests/app.spec.js` (begeleidingsmoment: observeren, reflectie, delen, printen), `tests/eigen-reflectie.spec.js` (Besluit 143), `ho-week.spec.js` (uit PR #108, als die is samengevoegd).
- **Database (lokaal):** `supabase/tests/lokaal/begeleiding-eigenaarschap.sql` uitbreiden: de trainer kan `opvolging`/`afspraakUitkomst` niet schrijven (trainerdossier); de HJO kan `tussentijds` niet schrijven (trainerzelf, na 033). `app-opslag.sql` met de nieuwe velden.

## Afhankelijkheden
| Afhankelijk van | Waarom |
|---|---|
| **Migratie 033** (eerst) | zonder 033 kan een HO de reflectie en `tussentijds` van de trainer wijzigen; dan is *"door jou"* niet waar |
| Spoor 2 | de drie nieuwe vragen en de volgorde (schriftelijk direct na de training) |
| **Niet** van PR #108 | alles zit in het moment, het verslag en Home van de trainer; alleen de regel in het snelvenster komt na #108 |
| Niet van het rechtenvoorstel (2) | geen nieuwe scope of soort |

**Omvang:** één pull request, alleen `begeleiding.js`, `trainers.js` (Home/Mijn ontwikkeling) en tests. Te splitsen in (a) afspraaklus en (b) reflectievolgorde als dat kleiner moet.
