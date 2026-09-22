# ClubComm (voorheen BTV Connect)

Communicatie- en managementplatform voor jeugdvoetbal (pilotclub: SC Buitenveldert).
Gemigreerd uit Replit op 2026-09-22. Taal van de UI: Nederlands.

## Huidige staat (prototype)
- 23 statische HTML-pagina's in de root, gedeelde `script.js`, `style.css`, `api-client.js`.
- `server.js` (Express) heeft alleen mock-endpoints: `/api/health`, `/api/auth/login`, `/api/auth/register`, `/api/attendance/absence`.
- Geen database: alle data staat in `localStorage` en is hardcoded demo-data.
- Login in `index.html`/`script.js` is fake: rol wordt afgeleid uit het e-mailadres.
- Pagina-overzicht en rollen: zie `APP_BLUEPRINT.md`.

## Bekende problemen
- JS-fouten: `ouderportaal.html` (syntax `}`), `overzicht.html` (`twoWeekPlanningData` dubbel gedeclareerd), `hjo-dashboard.html` (invalid token), `analytics-hub.html` (script error).
- `express.static('.')` serveert de hele projectmap, inclusief `server.js`.
- Naamgeving wisselt tussen "BTV Connect" en "ClubComm"; doel is ClubComm.

## Lokaal draaien
- Statisch: `python3 -m http.server 5050` (werkt zonder Node).
- Volledig: `npm install && npm start` (poort 5000, vereist Node.js).

## Richting V2
Specificaties staan in `~/Desktop/Platform Clubcomm/` (Parent Portal V2, HJO Dashboard V2, Registratie/Auth/Rollen brief).
Kernprincipes:
- Eén account per persoon, rollen zijn toewijzingen; meerdere rollen per account met rolwisselaar.
- Passwordless login (e-mailcode/magic link).
- Rechten server-side afdwingen (ouder ziet alleen gekoppelde kinderen, trainer alleen eigen teams).
- Drempels (aanwezigheid, te laat, gele kaarten, afmelddeadline) configureerbaar door HJO per team/teamtype — nooit hardcoden.
- "ClubComm detecteert, communiceert en documenteert. Mensen beslissen." Geen automatische straffen.
- `club_id` op alle data (multi-club later).
- Voorgestelde stack: Next.js + Supabase (Auth + Postgres/RLS), hosting op Vercel.
