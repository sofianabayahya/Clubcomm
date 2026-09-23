# ClubComm (voorheen BTV Connect)

Communicatie- en managementplatform voor jeugdvoetbal (pilotclub: SC Buitenveldert).
Gemigreerd uit Replit op 2026-09-22. Taal van de UI: Nederlands.

## Huidige staat (prototype versie 2, sinds 2026-09-23)
- `public/index.html` + `public/app/`: één app voor de telefoon (vanilla JS, geen build), volgens `docs/besluiten.md`.
  - `data.js`: demodata (20 teams, O10-1 uitgewerkt) + rekenregels (aanwezigheid, kaarten per blok, zones, signalen, speeltijd).
  - `core.js`: inloggen (link/code, demo), kop, 5 knoppen onderaan, profiel/rolwisselaar, berichten, afmelden, uitnodigen (QR via `vendor/qrcode.js`).
  - `ouder.js`, `trainer.js`, `teamleider.js`, `hjo.js` (ook clubbeheerder): schermen per rol.
  - `materiaal.js`: module Materiaal (checklist per team, mail naar secretaris).
  - `afwezig.js`: periode afmelden (ouder) en "trainer kan niet" (vervanger of afgelasten).
  - `trainerafw.js`: afwezigheid van trainers signaleren (punten per fase, signaal naar HJO).
  - `beoordeling.js`: twee beoordelingsmomenten (winter, einde seizoen) met ontwikkelgesprekken, tijdsloten en agenda (Besluit 23).
  - `taken.js`: taken per rol (trainer, teamleider, coördinator, HJO), aan te vinken door de clubbeheerder; rol coördinator met groep teams (Besluit 25).
  - `hjohome.js`: Home van HJO/coördinator met Te doen en Ter informatie, spelerzaken eerst via de coördinator, afgedane signalen akkoord/oppakken (Besluit 26).
  - `autoberichten.js`: vaste berichten bij de jaarplanning (vakanties, fases, beoordeling, seizoen), klaarzetten of automatisch (Besluit 26).
  - `meehelpen.js`: wie helpt er mee (taken en rijden): ouder eigen bijdrage, teamleider per gezin, coördinator/HJO per team met signaal "scheef" (Besluit 28).
  - `agenda.js`: agenda-abonnement (iCalendar-link; `CC.icsTekst` maakt de echte .ics-inhoud voor versie 2).
  - Icoontjes: één set (Lucide) in `vendor/icons.js`. Kleuren als tokens in `app.css`, met donkere modus.
- Pilot = onderbouw (O6–O12); de demo heeft alleen onderbouwteams.
- Demo-accounts: Sanne (ouder), Mark (trainer + ouder), Linda (teamleider + ouder), Peter (HJO + clubbeheerder), Esther (coördinator O10–O12). Data in localStorage, wordt elke dag opnieuw gemaakt.
- Oude Replit-pagina's staan in `public/oud/` (alleen ter referentie).
- `server.js` (Express) serveert alleen `public/`; mock-endpoints `/api/*` worden niet gebruikt.
- Pagina-overzicht en rollen van het oude prototype: `APP_BLUEPRINT.md` (verouderd; `docs/besluiten.md` gaat voor).

## Bekende problemen
- Logo: `public/assets/clubcomm-logo.jpg` (volledig), `clubcomm-icon.png` (icoon, login/QR) en `favicon.png` (alle pagina's). Het logo-blauw is lichter dan de app-kleur `#1e5ba8`.
- Demo-trainers gebruiken nog fictieve `@btv.nl`-adressen (trainers-beheren, trainer-instellingen).

## Fase 2 (afgerond 2026-09-23)
- JS-fouten opgelost in ouderportaal, overzicht, hjo-dashboard en analytics-hub (Chart.js v4: `horizontalBar` → `bar` + `indexAxis: 'y'`).
- Frontend verplaatst naar `public/`; onbekende bestanden geven 404 i.p.v. index.html.
- Naam overal ClubComm; club heet SC Buitenveldert.
- CDN-versies vastgezet: Chart.js `@4`; qrcodejs via cdnjs (cdn.rawgit.com bestaat niet meer).

## Lokaal draaien
- Statisch: `cd public && python3 -m http.server 5050` (werkt zonder Node).
- Volledig: `npm install && npm start` (poort 5000, vereist Node.js).

## Richting V2
**Besluiten (bouwlijst) staan in `docs/besluiten.md`** — lees die eerst; bij tegenstrijdigheid gaat dat document voor.

Specificaties staan in `~/Desktop/Platform Clubcomm/` (Parent Portal V2, HJO Dashboard V2, Registratie/Auth/Rollen brief).
Kernprincipes:
- Eén account per persoon, rollen zijn toewijzingen; meerdere rollen per account met rolwisselaar.
- Passwordless login (e-mailcode/magic link).
- Rechten server-side afdwingen (ouder ziet alleen gekoppelde kinderen, trainer alleen eigen teams).
- Drempels (aanwezigheid, te laat, gele kaarten, afmelddeadline) configureerbaar door HJO per team/teamtype — nooit hardcoden.
- "ClubComm detecteert, communiceert en documenteert. Mensen beslissen." Geen automatische straffen.
- `club_id` op alle data (multi-club later).
- Voorgestelde stack: Next.js + Supabase (Auth + Postgres/RLS), hosting op Vercel.
