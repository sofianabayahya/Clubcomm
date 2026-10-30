# Overdracht Spoor 3 — ClubComm (product)

*Alleen Spoor 3 schrijft hier. Kort houden (hoogstens ongeveer 30 regels); aan het eind van elke ronde overschrijven. Spoor 1 en 2 hebben hun eigen overdracht (`docs/methodiek/persoonlijk/overdracht.md`, `docs/methodiek/swift/overdracht.md`).*

**Bijgewerkt:** 30-10-2026

## Stand
- `main` = `eb4dcd0` (#106, na #105 Besluit 144). **Migratie 033 is niet toegepast.** Besluit **145** zit in de pull request hieronder; het eerstvolgende vrije nummer daarna is **146**.
- Productiedatabase (29/30-10, alleen gelezen): functioneel gelijk aan `main` (de md5 van alle `priv`-functies is gelijk, zonder commentaarregels). Het migratielogboek mist 027–030 (via losse SQL toegepast; alle objecten bestaan). Niet aanpassen zonder apart akkoord.

## Open pull requests
| PR | Wat | Stand |
|---|---|---|
| #107 | Besluit 145: een geplaatste vorm verplaatsen (*Verplaatsen naar* Start · A1 · A2 · B1 · B2 · Partij, wisselen, ongedaan maken), branch `bouw/verplaatsen` | Tests groen; wacht op akkoord |

## Wacht op akkoord van de gebruiker (in deze volgorde)
1. Correctie van de acht DCG-weekplannen, `supabase/scripts/2026-10-30_dcg_weekplannen_correctie.sql.voorstel` (gecontroleerd tegen de CSV, **niet uitgevoerd**).
2. Apart: 033 toepassen in productie (dan controleren met `priv.rechtentest()` en de app).
- Rechtenvoorstel 032 (begeleider kijkt mee, clubbank): lokaal getest; samen met 033 in beide volgordes goed (56/56).
- Bevinding: uitvoerrecht van drie `priv`-functies intrekken (onbereikbaar voor anon). Een account hoort bij precies één club (getest 10/10).

## Volgende technische stap
- Later, eigen besluit: vaardigheidsaccenten per trainingsplek (de vorm blijft herbruikbaar; de trainer kiest per training het accent). Wat ontbreekt: `docs/onderzoek/trainingskaart/README.md`. Nu niet bouwen.
- Voorstel (L): het opleidingsprofiel veilig leesbaar maken voor trainers (onderzoeksbranch `onderzoek/profiel-leesrechten`).
