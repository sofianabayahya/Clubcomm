# Overdracht Spoor 3 — ClubComm (product)

*Alleen Spoor 3 schrijft hier. Kort houden (hoogstens ongeveer 30 regels); aan het eind van elke ronde overschrijven. Spoor 1 en 2 hebben hun eigen overdracht (`docs/methodiek/persoonlijk/overdracht.md`, `docs/methodiek/swift/overdracht.md`).*

**Bijgewerkt:** 04-11-2026

## Stand
- `main` = #109 (Besluit 147) + #111 (vaste datums in de tests). **Migratie 033 is niet toegepast.** Het eerstvolgende vrije besluitnummer is **152** (151 = documentatie, open PR) (145, 146, 148 en 149 zijn bezet door open PR's).
- Productiedatabase (29/30-10, alleen gelezen): functioneel gelijk aan `main` (de md5 van alle `priv`-functies is gelijk, zonder commentaarregels). Het migratielogboek mist 027–030 (via losse SQL toegepast; alle objecten bestaan). Niet aanpassen zonder apart akkoord.

## Open pull requests
| PR | Wat | Stand |
|---|---|---|
| #107, #108, #110, #112 | Besluiten 145, 146, 148, 149 (andere sessies) | open |

- Samengevoegd 04-11: #111, vaste datum in drie datumafhankelijke tests (nieuwe fase; twee roostertests die vanaf eind mei 2027 zouden falen). Proef op 7 datums t/m 20-09-2027. Idee *demoseizoen laten meeschuiven* staat in Openstaand.

## Wacht op akkoord van de gebruiker (in deze volgorde)
1. Correctie van de acht DCG-weekplannen, `supabase/scripts/2026-10-30_dcg_weekplannen_correctie.sql.voorstel` (gecontroleerd tegen de CSV, **niet uitgevoerd**).
2. Apart: 033 toepassen in productie (dan controleren met `priv.rechtentest()` en de app).
- Rechtenvoorstel 032 (begeleider kijkt mee, clubbank): lokaal getest; samen met 033 in beide volgordes goed (56/56).
- Bevinding: uitvoerrecht van drie `priv`-functies intrekken (onbereikbaar voor anon). Een account hoort bij precies één club (getest 10/10).

## Volgende technische stap
- Later, eigen besluit: vaardigheidsaccenten per trainingsplek (de vorm blijft herbruikbaar; de trainer kiest per training het accent). Wat ontbreekt: `docs/onderzoek/trainingskaart/README.md`. Nu niet bouwen.
- Gebied F (documentatie en presentatie): **Besluit 151** vastgelegd op branch `onderzoek/documentatie-borging` (pull request open, wacht op akkoord om samen te voegen). Volgende stap na akkoord: sjabloon voor pull requests, dan de eerste trainerskaarten + snelstart als Concept.
- Voorstel (L): het opleidingsprofiel veilig leesbaar maken voor trainers (onderzoeksbranch `onderzoek/profiel-leesrechten`).
