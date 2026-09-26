# ClubComm

Communicatie en organisatie voor jeugdvoetbal: afmelden, planning, taken, vervoer, berichten, kaarten, speeltijd.
**Pilot:** RKSV DCG (Amsterdam, Sportpark Ookmeer), team **O12 talententeam** (code `O12-1`, selectie), 17 spelers. Database sinds 25-09 leeg op dit team na (Besluit 38). De gebruiker (Sofian) is trainer, ouder (zijn kind speelt in het team) en clubbeheerder, met twee teamleiders. Wedstrijden vanaf fase 2 (za 31 okt 2026).

## Werkafspraken met de gebruiker
- De gebruiker is beginner: altijd **eenvoudig Nederlands**, één stap tegelijk, uitleg waar je klikt.
- Nieuwe keuze → vastleggen als **besluit** in `docs/besluiten.md` → bouwen → testen → committen en pushen → online zetten.
- Vraagt de gebruiker **"wat zijn de volgende stappen?"**: kijk in `docs/productie-en-groei.md` → blok **Openstaand** en houd dat blok bij.
- Vraag nooit om geheime sleutels in de chat (Brevo, Supabase service key); de gebruiker zet ze zelf in het dashboard.
- Vuistregels voor elk scherm (Besluit 30 en 34): actie eerst, wat bij elkaar hoort in één blok, elke actie één vaste plek, kleur alleen voor aandacht, **informatie is geen taak**, "ClubComm signaleert, mensen beslissen".

## Waar staat wat
| Bestand | Inhoud |
|---|---|
| `docs/besluiten.md` | **Alle afspraken (bron van waarheid).** Bij tegenstrijdigheid geldt het nieuwste besluit (nu t/m Besluit 62). |
| `docs/pilotlog.md` | **Fouten uit de pilot met oorzaak en patroon** (momentopname, opslaan, demo verbergt het, één persoon per rol, buiten de app, rommelige gegevens). Bij elke wijziging langs deze patronen lopen. |
| `docs/productie-en-groei.md` | Controlelijst, **Openstaand**, meerdere clubs, app of website, kosten. |
| `docs/techniek.md` | Opbouw van de echte versie (Supabase, Vercel, Brevo, migraties, e-mail, back-up). |
| `docs/presentaties/` | PowerPoints per rol (bestuur, teamleider, ouders, trainer): handleiding én presentatie. Opnieuw maken: `shots*.js` (schermafbeeldingen uit de demo) en `maak.js`. |
| `docs/onderzoek/` | Achtergrond: analyse clubproblemen, vergelijking Teamy en VeldPlanner, **app-analyse 26-09** (rapportcijfers en prioriteiten). Voorstellen, geen besluiten. |

## De app
- `public/index.html` + `public/app/*.js`: één webapp voor de telefoon (vanilla JS, geen build), installeerbaar (manifest + `sw.js`).
  - `data.js`: demodata + rekenregels (aanwezigheid, kaarten per seizoen, zones, signalen, speeltijd, vaste taken). `opslag.js`: app-gegevens ↔ databaserijen. `core.js`: inloggen, kop, profiel, berichten, afmelden, planning aanpassen, privacy, feedback.
  - Schermen per rol: `ouder.js`, `trainer.js`, `teamleider.js`, `hjo.js` (ook clubbeheerder), `hjohome.js`; coördinator via `taken.js` (ook taken per rol en profielen).
  - `adres.js`: adres aanvullen via PDOK (velden met `data-adres`). `push.js`: pushmeldingen aanzetten en keuzes (Besluit 53); tonen in `sw.js`.
  - Modules: `autoberichten.js` (Communicatieplan, noodberichten, herinneringen activiteiten), `afwezig.js`, `trainerafw.js`, `beoordeling.js`, `materiaal.js`, `meehelpen.js`, `waardering.js`, `hjofilter.js`, `agenda.js`.
  - `live.js`: echte versie (Supabase: inloggen met e-mailcode, laden, automatisch opslaan, beheer).
- **Demo:** `/?demo` (of zonder `config.js`). Accounts: Sanne (ouder), Mark (trainer + ouder), Linda (teamleider + ouder), Peter (HJO + beheerder), Esther (coördinator). Demodata heet nog "SC Buitenveldert" en staat in localStorage.

## Online
- App: https://mijnclubcomm.nl (domein bij Hostnet, DNS naar Vercel; oud adres clubcomm-nine.vercel.app werkt ook) — Vercel-project `clubcomm` (map `public`). Online zetten: Vercel `create_deployment` (project `clubcomm`, target production, gitSource github `sofianabayahya/Clubcomm`, ref = de werkbranch, zonder teamId).
- Supabase-project `pkvacwbdgumkffxnxnqk` (Frankfurt). Club-id `dcg`; account van de gebruiker: persoon `p-beheer`. Migraties: bestand in `supabase/migrations/` **en** toepassen met `apply_migration`. Eenmalige datawijzigingen: bestand in `supabase/scripts/` en uitvoeren met `execute_sql`. Edge Function `melding` (e-mail via Brevo én pushmeldingen; secrets `BREVO_API_KEY`, `AFZENDER_EMAIL`; push-sleutelpaar staat in tabel `push_sleutel`, alleen voor de server).
- E-mail: Brevo (inlogmail via SMTP, meldingen via API). Afzender nu een Gmail-adres; eigen domein staat op Openstaand.

## Testen
- Lokaal: `npm install && npm start` → http://localhost:5000/?demo (of `cd public && python3 -m http.server 5050`).
- Zonder netwerk naar Supabase: `supabase/tests/fake-supabase.js` (nagebootste client, code 123456); rechten per rol: `supabase/tests/rls_test.sql`.
- **Altijd ook de echte, bijna lege club testen** (teamnaam ≠ teamcode, weinig spelers, geen telefoonnummers), niet alleen de demo.
- Playwright staat klaar (Chromium in `/opt/pw-browsers`); testscripts per rol opnemen in het project staat op Openstaand.

## Bekende beperkingen
- Automatische berichten gaan uit zodra een beheerder/HJO of staflid de app opent (nog niet vanaf de server).
- Agenda-abonnement werkt pas met een eigen domein (in de echte versie verborgen).
- Het logo-blauw is lichter dan de app-kleur.
