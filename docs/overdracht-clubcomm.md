# Overdracht Spoor 3 — ClubComm (product)

*Alleen Spoor 3 schrijft hier. Kort houden (hoogstens ongeveer 30 regels); aan het eind van elke ronde overschrijven. Spoor 1 en 2 hebben hun eigen overdracht (`docs/methodiek/persoonlijk/overdracht.md`, `docs/methodiek/swift/overdracht.md`).*

**Bijgewerkt:** 30-10-2026

## Stand
- `main` = `1277583` (#104, wedstrijd zonder verzameltijd). Besluit **143** zit in #103; het eerstvolgende vrije nummer daarna is **144**.
- Productiedatabase (29/30-10, alleen gelezen): functioneel gelijk aan `main` (de md5 van alle `priv`-functies is gelijk, zonder commentaarregels). Het migratielogboek mist 027–030 (via losse SQL toegepast; alle objecten bestaan). Niet aanpassen zonder apart akkoord.

## Open pull requests
| PR | Wat | Stand |
|---|---|---|
| #103 | Besluit 143: de trainer is eigenaar van zijn eigen teksten (migratie 033, nog niet toegepast), branch `bouw/eigen-reflectie-033` | `main` samengevoegd; tests groen; **niet samenvoegen en 033 niet toepassen zonder akkoord** |

## Wacht op akkoord van de gebruiker
- PR Besluit 143, en daarna apart: 033 toepassen in productie (volgorde: eerst samenvoegen/publiceren, dan 033, dan controleren).
- Rechtenvoorstel 032 (begeleider kijkt mee, clubbank): lokaal getest; samen met 033 in beide volgordes goed (56/56).
- Bevinding: uitvoerrecht van drie `priv`-functies intrekken (onbereikbaar voor anon). De zorg over `priv.cc_club()` bij twee clubs klopte niet: een account hoort bij precies één club (getest 10/10).
- Idee (L): bij een trainer zien of hij al heeft ingelogd.

## Volgende technische stap
- Na Besluit 143: de bestaande observatie- en reflectiemodule verder (Spoor 2-route, stap 3), eerst bespreken.
- Klein (S): de kaart omzetten naar testlabels; `npm run check` en `npm run test:veilig` in `CLAUDE.md`.
- Voorstel (L): het opleidingsprofiel veilig leesbaar maken voor trainers (er is een onderzoeksbranch `onderzoek/profiel-leesrechten`).
