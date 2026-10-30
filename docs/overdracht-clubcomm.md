# Overdracht Spoor 3 — ClubComm (product)

*Alleen Spoor 3 schrijft hier. Kort houden (hoogstens ongeveer 30 regels); aan het eind van elke ronde overschrijven. Spoor 1 en 2 hebben hun eigen overdracht (`docs/methodiek/persoonlijk/overdracht.md`, `docs/methodiek/swift/overdracht.md`).*

**Bijgewerkt:** 30-10-2026

## Stand
- `main` = `1277583` (#104). Besluit **143** zit in #103, Besluit **144** in de pull request van `bouw/trainingskaart`; het eerstvolgende vrije nummer is **145**.

## Open pull requests
| PR | Wat | Stand |
|---|---|---|
| #103 | Besluit 143: de trainer is eigenaar van zijn eigen teksten (migratie 033, nog niet toegepast), branch `bouw/eigen-reflectie-033` | `main` samengevoegd; tests groen; wacht op akkoord. Migratie 033 en de registratie van 027–030 zijn aparte akkoorden |
| nieuw | Besluit 144: trainingskaart (vijf regels, herkomst, weekvoorstel apart, oorspronkelijke planning), branch `bouw/trainingskaart` | Tests groen (DCG en Swift); wacht op akkoord. Raakt bij samenvoegen met #103 deze overdracht en het register |

## Wacht op akkoord van de gebruiker
- Correctie van de acht DCG-weekplannen (dagvelden eruit, `dagen` en `wedstrijd.context` erin): `supabase/scripts/2026-10-30_dcg_weekplannen_correctie.sql.voorstel`, gecontroleerd tegen de CSV, **niet uitgevoerd**.
- Rechtenvoorstel 032 (begeleider kijkt mee, clubbank): lokaal getest met `npm run test:veilig -- 032` (56/56).
- Twee bevindingen uit de beveiligingstest (maat L): uitvoerrecht van drie `priv`-functies intrekken; `priv.cc_club()` bij een account in twee clubs.

## Volgende technische stap
- Vaardigheidsaccenten per trainingsplek (eigen besluit, nieuw veld per onderdeel); zie de PR van `bouw/trainingskaart` voor wat er nog ontbreekt.
- Voorstel (L): het opleidingsprofiel veilig leesbaar maken voor trainers (onderzoeksbranch `onderzoek/profiel-leesrechten`).
