# Overdracht Spoor 3 — ClubComm (product)

*Alleen Spoor 3 schrijft hier. Kort houden (hoogstens ongeveer 30 regels); aan het eind van elke ronde overschrijven. Spoor 1 en 2 hebben hun eigen overdracht (`docs/methodiek/persoonlijk/overdracht.md`, `docs/methodiek/swift/overdracht.md`).*

**Bijgewerkt:** 29-10-2026

## Stand
- `main` = `ceed9c5` (#99). Productie draait die commit. Werkwijze sneller deel 1 en 2 staan erin (`npm run check`, `npm run test:snel -- @label`, `npm run test:veilig`).
- Hoogste besluit in `main`: **139**. Besluit **140** zit in de pull request hieronder; het eerstvolgende vrije nummer daarna is **141**.

## Open pull requests
| PR | Wat | Stand |
|---|---|---|
| (nieuw) | Besluit 140: trainer uitnodigen bij pakket Trainers begeleiden (welkomstmail met de bedoeling, functie van de HO, WhatsApp nu en later) | Tests groen; wacht op akkoord |

## Wacht op akkoord van de gebruiker
- Rechtenvoorstel 032 (begeleider kijkt mee, clubbank): lokaal getest met `npm run test:veilig -- 032` (56/56).
- Twee bevindingen uit de beveiligingstest (maat L): uitvoerrecht van drie `priv`-functies intrekken; `priv.cc_club()` bij een account in twee clubs.
- Idee (L): bij een trainer zien of hij al heeft ingelogd.

## Volgende technische stap
- Klein (S): de kaart omzetten naar testlabels; `npm run check` en `npm run test:veilig` in `CLAUDE.md`.
- Voorstel (L): het opleidingsprofiel veilig leesbaar maken voor trainers (er is een onderzoeksbranch `onderzoek/profiel-leesrechten`).
