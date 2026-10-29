# Overdracht Spoor 3 — ClubComm (product)

*Alleen Spoor 3 schrijft hier. Kort houden (hoogstens ongeveer 30 regels); aan het eind van elke ronde overschrijven. Spoor 1 en 2 hebben hun eigen overdracht (`docs/methodiek/persoonlijk/overdracht.md`, `docs/methodiek/swift/overdracht.md`).*

**Bijgewerkt:** 29-10-2026

## Stand
- `main` = `5d140fb` (#100, Besluit 140). Hoogste besluit in `main`: **140**. Besluit **141** zit in de pull request hieronder; het eerstvolgende vrije nummer daarna is **142**.

## Open pull requests
| PR | Wat | Stand |
|---|---|---|
| #101 | Besluit 141: trainingsmodule stap 1 (branch `bouw/trainingsmodule-stap1`): Lijn met weekdetail en *Beheer* (*Periodeplanning vastleggen*), Plannen *Stap x van y* en *Toepassing · partij*, Week met vier minutengetallen, leeg = *nog niet gecontroleerd*, *Klopt zoals gepland*, Transfer bij Toepassing; Vormenbank | Tests groen; wacht op akkoord. Niet samenvoegen of publiceren zonder akkoord |

## Wacht op akkoord van de gebruiker
- Stap 1 trainingsmodule beoordelen. Pas daarna stap 2 (weekevaluatie in Lijn, één nieuw veld op het weekplan) en stap 3 (herinnering na de training).
- Oude trainingen: ingevulde echte minuten van vóór Besluit 141 zijn mogelijk vooraf ingevuld en niet echt gecontroleerd (bijv. DCG 29-10). Niets aan veranderd; zo nodig samen bekijken.
- Rechtenvoorstel 032 (begeleider kijkt mee, clubbank): lokaal getest met `npm run test:veilig -- 032` (56/56).
- Twee bevindingen uit de beveiligingstest (maat L): uitvoerrecht van drie `priv`-functies intrekken; `priv.cc_club()` bij een account in twee clubs.
- Idee (L): bij een trainer zien of hij al heeft ingelogd.

## Volgende technische stap
- Klein (S): de kaart omzetten naar testlabels; `npm run check` en `npm run test:veilig` in `CLAUDE.md`.
- Voorstel (L): het opleidingsprofiel veilig leesbaar maken voor trainers (er is een onderzoeksbranch `onderzoek/profiel-leesrechten`).
