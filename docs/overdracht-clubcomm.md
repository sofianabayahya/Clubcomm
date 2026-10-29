# Overdracht Spoor 3 — ClubComm (product)

*Alleen Spoor 3 schrijft hier. Kort houden (hoogstens ongeveer 30 regels); aan het eind van elke ronde overschrijven. Spoor 1 en 2 hebben hun eigen overdracht (`docs/methodiek/persoonlijk/overdracht.md`, `docs/methodiek/swift/overdracht.md`).*

**Bijgewerkt:** 29-10-2026

## Stand
- `main` = `b78b9d8` (#102, Besluit 142, tijdsbalk). Productie draait die commit (Vercel READY, nagegaan 29-10). Hoogste besluit: **142**; het eerstvolgende vrije nummer is **143**.

## Open pull requests
Geen.

## Wacht op akkoord van de gebruiker
- De gebruiker test zelf week 45 (Lijn → do in Plannen → Week → Lijn). Pas daarna stap 2 (weekevaluatie) en stap 3 (herinnering).
- Rechtenvoorstel 032 (begeleider kijkt mee, clubbank): lokaal getest met `npm run test:veilig -- 032` (56/56).
- Twee bevindingen uit de beveiligingstest (maat L): uitvoerrecht van drie `priv`-functies intrekken; `priv.cc_club()` bij een account in twee clubs.
- Idee (L): bij een trainer zien of hij al heeft ingelogd.

## Volgende technische stap
- Klein (S): de kaart omzetten naar testlabels; `npm run check` en `npm run test:veilig` in `CLAUDE.md`.
- Voorstel (L): het opleidingsprofiel veilig leesbaar maken voor trainers (er is een onderzoeksbranch `onderzoek/profiel-leesrechten`).
