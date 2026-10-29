# Tests van ClubComm

| Opdracht | Wat | Duur (29-10, 4 cores) | Wanneer |
|---|---|---|---|
| `npm run test:snel -- @training` | Paden in de documenten + alleen de tests met dat label | 8–13 s | Tijdens het bouwen (alle maten) |
| `npm run test:server` | Servermotor (`tests/automaat.test.mjs`) | 7 s | Als je regels voor berichten of automatisch werk wijzigt |
| `npm test` | Alles: node-tests + alle Playwright-tests | 44 s (was 71 s) | **Altijd vóór samenvoegen**, daarna ook groen op GitHub (*Tests*) |
| `npm run test:veilig` | Zware controle op een tijdelijke lokale database: rechten per rol, clubscheiding, vaste regels | 3 s | **Maat L**, vóór samenvoegen; ook vanzelf op GitHub (*Beveiliging*) bij database- of gegevenswijzigingen |
| `npm run test:veilig -- 032` | Hetzelfde, met een voorstel (`supabase/migrations/032_*.sql.voorstel`) erbij | 3 s | Een rechtenvoorstel beoordelen vóór het akkoord |
| `npm run check` | Branch actueel? Conflict met main? Ander open werk in dezelfde bestanden? Eerstvolgende vrije besluitnummer | 1 s | Begin van een opdracht en vlak vóór samenvoegen |

## Labels
Elke test in `tests/app.spec.js` heeft een of meer labels: `@afmelden` `@rooster` `@wedstrijd` `@berichten` `@taken` `@gesprekken` `@begeleiden` `@training` `@profiel` `@tekentool` `@demo` `@schermen` `@clubbeheer` `@kleineclub` (echte versie met nagebootste database) `@doorklik` (elke rol klikt door). Meer labels tegelijk: `npm run test:snel -- "@training|@profiel"`. Een nieuwe test krijgt altijd een label: `test('naam', { tag: ['@training'] }, async ({ page }) => …)`.

## Veiligheid van `test:veilig`
- Bouwt een tijdelijke Postgres-database in een map onder `/tmp` (`initdb`), zonder netwerk (`listen_addresses=''`, alleen een socket in die map), en gooit hem na afloop weg.
- Wist alle `PG*`-variabelen en databaseadressen vóór de start en controleert dat de verbinding lokaal is; anders stopt het.
- Gebruikt geen geheimen of Supabase-koppeling. Lezen en schrijven gebeurt alleen in die tijdelijke database.
- Nagebootst (`supabase/tests/lokaal/supabase-nabootsing.sql`): de rollen, `auth.uid()`/`auth.email()` uit de JWT-claims, en lege versies van `pg_net`, `pg_cron` en `vault` (geen netwerk, geen planning). De regels `create/drop extension pg_net|pg_cron` uit de migraties worden lokaal overgeslagen; verder draaien de migraties ongewijzigd.
- **Wat het niet controleert:** de echte Supabase-omgeving (eigen standaardrechten van Supabase, Edge Functions, inloggen, opslag van bestanden) en privacy. Privacy blijft een handmatige stap bij maat L: welke persoonsgegevens, wie ziet ze, hoe lang bewaard (Besluit 72), staat het in de privacyverklaring.
