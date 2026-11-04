# Overdracht Spoor 3 — ClubComm (product)

*Alleen Spoor 3 schrijft hier. Kort houden (hoogstens ongeveer 30 regels); aan het eind van elke ronde overschrijven. Spoor 1 en 2 hebben hun eigen overdracht (`docs/methodiek/persoonlijk/overdracht.md`, `docs/methodiek/swift/overdracht.md`).*

**Bijgewerkt:** 4-11-2026

## Stand
- `main` = `eb4dcd0` (#106). Productie draait #105 (Besluit 144) en later. **Migratie 033 is niet toegepast.** Eerstvolgende vrije besluitnummer: **147** (146 = PR #108).
- Productiedatabase: niet aangepast. Migratielogboek mist 027–030 (objecten bestaan). Niet aanpassen zonder apart akkoord.

## Open werk
| Wat | Branch / PR | Stand |
|---|---|---|
| Week van de begeleider (Besluit 146) | PR #108, `bouw/ho-week` | CI groen; **niet samenvoegen** zonder akkoord |
| Label *Herkomst onbekend* (trainingskaart) | `bouw/herkomst-onbekend` (lokaal) | wacht op akkoord voor push/PR |
| Demo Swift (nep-database) | `demo/swift-trainer` | alleen voorbeeldversie; **nooit samenvoegen** |
| Functioneel ontwerp begeleidingsproces + 2 technische voorstellen | `onderzoek/begeleidingsproces`, `docs/onderzoek/begeleidingsproces/` | besluiten 4-11 verwerkt; alleen documenten |
| Analyse: ClubComm voor verschillende trainers (vrijwilliger → selectietrainer, Rinus, drie startroutes) | `onderzoek/trainersdifferentiatie` | alleen documenten; wacht op beoordeling |
| Analyse: tekentool (nummers, verhoudingen, veldweergaven; 4 fouten nagespeeld) | `onderzoek/tekentool-gebruik` | alleen documenten; advies: eerst nummerlogica repareren |
| Reparatie rugnummering tekentool (voorstel A, herziet Besluit 124 deels) | `bouw/tekentool-nummering` | tests groen; geen PR; verder in de aparte chat *ClubComm — Ontwikkeling Tekentool* |

## Wacht op akkoord van de gebruiker
1. Correctie van de acht DCG-weekplannen (`supabase/scripts/2026-10-30_dcg_weekplannen_correctie.sql.voorstel`, **niet uitgevoerd**).
2. 033 toepassen in productie (dan `priv.rechtentest()` en de app controleren). Eerste stap van de bouwvolgorde begeleiding.
3. PR #108 apart beoordelen.

## Volgende technische stap (bouwvolgorde besluit 8, 4-11)
1. 033 afronden → 2. vorige-afspraaklus → 3. reflectie vóór gesprek (stap 2 en 3: technisch voorstel 1, los van #108) → 4. #108 → 5. rechtenvoorstel delen + toewijzingen (voorstel 2, migratie 034 als voorstel, vervangt 032) → 6. delen/versies/voorfeedback → 7. Swift-criteria na de pilot.
- Open beleid (Spoor 2 / club): bewaartermijn, inzage oudere verslagen bij een nieuwe begeleider, verwijderverzoek, de drie nieuwe reflectievragen.
- Later: vaardigheidsaccenten per trainingsplek; profiel leesbaar voor trainers (`onderzoek/profiel-leesrechten`).
