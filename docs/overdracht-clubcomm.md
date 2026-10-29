# Overdracht Spoor 3 — ClubComm (product)

*Alleen Spoor 3 schrijft hier. Kort houden (hoogstens ongeveer 30 regels); aan het eind van elke ronde overschrijven. Spoor 1 en 2 hebben hun eigen overdracht (`docs/methodiek/persoonlijk/overdracht.md`, `docs/methodiek/swift/overdracht.md`).*

**Bijgewerkt:** 29-10-2026

## Stand
- `main` = `1e6a2f2` (pull request #97, Besluit 139 oefenvormkiezer). Productie draait die commit (gecontroleerd in Vercel). PR #92 gesloten (vervangen door #97).
- Hoogste besluit: **139**; het eerstvolgende vrije nummer is **140** (`npm run check` laat het zien zodra deel 2 is samengevoegd).

## Open pull requests
| PR | Wat | Stand |
|---|---|---|
| #98 | Werkwijze sneller, deel 1: compacte `CLAUDE.md`, kaart, overdracht per spoor, maat S/M/L | Akkoord; wordt samengevoegd |
| #99 | Werkwijze sneller, deel 2: testlabels, snelle test, branchcontrole, lokale beveiligingstest | Akkoord; na #98 |

## Wacht op akkoord van de gebruiker
- Rechtenvoorstel 032 (begeleider kijkt mee, clubbank): `supabase/migrations/032_begeleider_kijkt_mee.sql.voorstel` (lokaal getest met `npm run test:veilig -- 032`: 56/56).
- Twee bevindingen uit de beveiligingstest (maat L): uitvoerrecht van drie `priv`-functies netjes intrekken; `priv.cc_club()` bij een account in twee clubs.

## Volgende technische stap
- Klein (S): de kaart omzetten naar testlabels, `npm run check` en `npm run test:veilig` in `CLAUDE.md`, label voor `tests/kiezer.spec.js`.
- Voorstel (L): het opleidingsprofiel veilig leesbaar maken voor trainers (rechtenvoorstel en rechtentest eerst).
