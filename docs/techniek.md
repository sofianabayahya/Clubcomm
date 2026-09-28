# ClubComm — techniek van de echte versie (sinds 24 september 2026)

## Onderdelen
- **App**: `public/` (dezelfde schermen als de demo). Online via Vercel: https://mijnclubcomm.nl (project `clubcomm`, map `public`; domein bij Hostnet: A-record @ → 76.76.21.21, CNAME www → cname.vercel-dns.com; www stuurt door). Het oude adres https://clubcomm-nine.vercel.app werkt ook.
- **Database en inloggen**: Supabase-project `ClubComm` (regio Frankfurt, EU). Club-id `dcg` (club DCG).
- **Demo**: blijft bestaan. Met `?demo` achter het adres draait de app met voorbeelddata op het eigen apparaat.

## Hoe de gegevens zijn opgeslagen
- Eén tabel `rij`: per regel een soort (bijv. `afm`, `players`, `msgs`), een id, de gegevens (`data`) en koppelvelden (team, speler, persoon, activiteit).
- Elke regel heeft een **scope** die bepaalt wie hem mag zien en wijzigen. De database controleert dat zelf (Row Level Security), niet alleen het scherm:
  - ouders: alleen hun eigen kind (afmeldingen, aanwezigheid, beoordeling); namen van teamgenoten voor vervoer en taken;
  - trainer/teamleider: hun eigen team; beoordelingen en gespreksnotities volgens de takenlijst van de club (Besluit 25);
  - coördinator: de teams van de eigen groep; HJO/beheerder: de hele club;
  - contactgegevens (e-mail, telefoon) apart: staf ziet alleen die van ouders uit de eigen teams.
- Extra bewaking: niemand kan zichzelf rollen geven; berichten van een ander kun je alleen als gelezen markeren of beantwoorden; ouders kunnen trainingen niet verplaatsen.
- Test: `supabase/tests/rls_test.sql` (draait per rol wat iemand ziet en wat geweigerd wordt).
- Migraties: `supabase/migrations/001…021` (009: vastgezet nieuws leesbaar voor nieuwe ouders van het team; 010: telefoonnummer bij aanmelden; 011: geen dubbele aanmelding voor hetzelfde kind; 012: pushmeldingen; 013: berichten als gesprekken, archief; 014: leegmaken alleen bij nieuwe club; 015: foutregistratie; 016: kijk van de trainer (beoordeling) alleen voor de staf; 017: ontwikkelgegevens verhuizen mee met de speler; 018: en verdwijnen bij uitschrijven; 019: automatisch werk vanaf de server; 020: onthouden wanneer iemand een bericht las; 021: wie pushmeldingen aan heeft, voor de staf).

## Inloggen
- Met een e-mailcode van 6 cijfers (geen wachtwoord, geen knop in de mail: Besluit 52). Na inloggen koppelt de database het account aan de persoon met hetzelfde e-mailadres.
- Nieuwe ouder: via de team-uitnodiging (QR/link) aanmelden → de teamleider keurt goed → daarna koppelt het account vanzelf.

## Nog in te stellen in Supabase (dashboard, door de eigenaar)
1. **Authentication → URL Configuration**: Site URL `https://mijnclubcomm.nl`; bij Redirect URLs `https://mijnclubcomm.nl/**` en `https://clubcomm-nine.vercel.app/**`.
2. **Authentication → Emails → Magic Link én Confirm signup**: tekst uit `supabase/templates/inlogcode.html` (alleen de code, geen knop; Besluit 52). Onderwerp: `Je inlogcode voor ClubComm: {{ .Token }}`.
3. **Voor de pilot: eigen e-mailverzender (SMTP)**, bijv. Resend of Brevo. De ingebouwde verzender stuurt maar een paar mails per uur.

## Beheer
- Clubbeheerder → Home → "Voorbeelddata laden" (om te testen) en "Club leegmaken" (voor de start met echte gegevens).
- Teams maken kan nog niet in de app: het O12 talententeam is met SQL ingericht (`supabase/scripts/2026-09-25_pilot_o12_inrichten.sql`, Besluit 38). Een vaste kopie van de club daarvoor staat in `backup.rij_voor_pilot` en `backup.lid_voor_pilot`.
- Het gratis Supabase-plan pauzeert een project na een week zonder gebruik; tijdens de pilot wordt het dagelijks gebruikt.

## Bekende beperkingen (pilot)
- De toelichting bij een afmelding staat in dezelfde regel als de afmelding; het scherm verbergt hem voor de teamleider, maar de database zou hem technisch kunnen geven.
- Pushmeldingen en e-mail bij nieuwe berichten zijn er nog niet (alleen binnen de app).
- Gelijktijdig wijzigen van dezelfde regel: de laatste wint (vervoer, aanwezigheid en berichten zijn zo opgesplitst dat dit zelden gebeurt).

## E-mailmeldingen (Besluit 35)
- Migratie `supabase/migrations/005_meldingen.sql`: trigger `cc_mail` op `public.rij` (soort `msgs`, na insert) roept via `pg_net` de Edge Function `melding` aan met `{ club, id }`. Tabel `public.mail_log` (alleen service role) zorgt dat elk bericht hooguit één keer wordt gemaild.
- Edge Function `supabase/functions/melding/index.ts` (verify_jwt uit; doet zelf de controles): leest het bericht en de contactgegevens met de service role en verstuurt per ontvanger een e-mail via de Brevo API.
- Secrets (Supabase → Edge Functions → Secrets): `BREVO_API_KEY`, `AFZENDER_EMAIL` (een in Brevo geverifieerde afzender), optioneel `APP_URL`. Zonder secrets gebeurt er niets.
- Overgeslagen: berichten ouder dan 15 minuten (voorbeelddata), ingeplande berichten, niet-urgente meldingen aan staf, adressen op `.invalid`.
- Migratie `006_meldingen_antwoord.sql`: trigger `cc_mail_antw` bij een nieuw antwoord (lijst `antw` groeit) → e-mail naar de afzender (en bij persoonlijke berichten de andere deelnemers). Berichten met `mail: false` krijgen geen e-mail, tenzij urgent (Besluit 36).

## Privacy, installeren en back-up (Besluit 37)
- Migratie `008_privacy_en_backup.sql`: `aanmelden(..., p_akkoord)` weigert zonder akkoord en legt `privacyAkkoord` vast; schema `backup` (tabellen `rij`, `lid`, functie `backup.maak()`), pg_cron-taak `clubcomm-backup` elke zondag 02:00 UTC, 8 weken bewaard. Terugzetten: met SQL uit `backup.rij` (per datum `gemaakt`).
- `public/manifest.webmanifest`, `public/sw.js` (netwerk eerst, cache alleen als reserve, alleen eigen domein), iconen `assets/icon-192.png`, `icon-512.png`, `icon-maskable-512.png`.

## E-mail vanaf eigen domein (25 september 2026)
- Afzender `ClubComm <noreply@mijnclubcomm.nl>` (Brevo, domein geverifieerd met brevo-code, DKIM `brevo1/2._domainkey` en DMARC `p=none` bij Hostnet). Ingesteld in Supabase: Authentication → SMTP Settings en Edge Function-secret `AFZENDER_EMAIL`.
- Er is geen mailbox op noreply@: antwoorden per mail komen nergens aan (de mails zeggen: reageren doe je in de app).
- Brevo zet in elke mail een afmeldknop (List-Unsubscribe; uitzetten kan alleen bij Brevo Enterprise). Wie erop tikt, komt op de blokkeerlijst en krijgt ook geen inlogcode meer. Deblokkeren: Brevo → Transactional → Contacts/Blocked (of API `DELETE /smtp/blockedContacts/{email}`).

## Pushmeldingen (Besluit 53)
- App: Profiel → Meldingen (`public/app/push.js`) vraagt toestemming en meldt de telefoon aan met `push_aan` (tabel `push_abonnement`, per telefoon, met keuzes per soort). `sw.js` toont de melding en opent bij een tik `/?bericht=<id>`.
- Server: Edge Function `melding` stuurt bij elk nieuw bericht/antwoord (triggers `cc_mail`, `cc_mail_antw`) e-mail én push; bij een nieuwe afmelding of aanmelding (trigger `cc_push`) alleen push naar de staf.
- Sleutelpaar (VAPID): één keer gemaakt door de functie (`{ "sleutel": true }`), staat in `push_sleutel` (RLS zonder policies); de app krijgt alleen de publieke helft via `push_sleutel()`.
- Nachtrust 21:00–07:30: niet-urgente push in `push_wachtrij`; pg_cron-taak `clubcomm-push-ochtend` (elke 15 min 05:00–07:59 UTC) verstuurt vanaf 07:30 Nederlandse tijd.
- Verlopen telefoons (404/410 van de pushdienst) worden automatisch opgeruimd.


## Automatisch werk vanaf de server (Besluit 77)
- Edge Function `automaat` (`supabase/functions/automaat`: `index.ts` + `motor.mjs`), verify_jwt uit; alleen te starten met het geheim uit `automaat_geheim` (header `x-cc-geheim`).
- Mag schrijven (Besluit 85): nieuwe berichten, activiteiten, ontwikkelgesprekken, `autoVerstuurd`, en na een wedstrijd `pres` en `speeltijd*`. Na een wijziging in `motor.mjs` de functie opnieuw publiceren (met `deno.json` en import_map_path `deno.json`).
- pg_cron `clubcomm-automaat` elk kwartier. Nachtrust 21:00–07:30 (Nederlandse tijd) in de functie zelf.
- `motor.mjs` laadt `public/app/*.js` (van https://mijnclubcomm.nl/app/) in een omgeving zonder scherm en met een Nederlandse klok, zet de gegevens van de club klaar (`CC.uitRijen`), draait `CC.automaatClub` (als beheerder) en per team `CC.automaatTeam` (als trainer), en schrijft alleen de verschillen weg (berichten, activiteiten, gesprekstijden, verslagen, verstuurd-lijst).
- De app vraagt bij het laden `automaat_laatst` op; gelukte run < 2 uur geleden → `CC.opServer` en de app doet het niet zelf.
- Testen zonder op te slaan: `select net.http_post(url := '.../functions/v1/automaat', body := '{"proef": true, "altijd": true}', headers := jsonb_build_object('x-cc-geheim', (select geheim from automaat_geheim)))` en het antwoord in `net._http_response`.
- Lokaal testen: `TZ=UTC node` met `motor.mjs` en de bestanden uit `public/app`.

## Tests en bewaking (Besluit 88)
- **Tests:** `npm test` = `tests/automaat.test.mjs` (servermotor op demo en kleine club, verschillende tijden) + Playwright `tests/app.spec.js` (elk demo-account en de kleine club met nagebootste database: elke rol, elk tabblad, elke keuzeknop; rooster instellen; afmelden en opslaan). De kleine club staat in `tests/kleine-club.js`. GitHub Actions (`.github/workflows/tests.yml`) draait dit bij elke push naar `main` en `claude/**` en bij elke pull request.
- Een test faalt bij een JavaScript-fout, een console-fout, "Er ging iets mis", of "undefined", "NaN", "null", "[object Object]", "Invalid Date" op het scherm.
- **Bewaking:** `GET https://pkvacwbdgumkffxnxnqk.supabase.co/rest/v1/rpc/gezondheid?apikey=<publishable key uit public/app/config.js>` geeft `"ok"` (of `"ok (nachtrust)"`), anders HTTP 400 met de reden (automaat > 35 min niet gedraaid of laatste ronde met fout). UptimeRobot: monitor 1 = https://mijnclubcomm.nl, monitor 2 = dit adres, elke 5 minuten, mail naar de beheerder.

## Demo voor besturen (Besluit 89)
- `mijnclubcomm.nl/demo` (Vercel: rewrite naar `index.html`, `noindex`). `live.js` start op `/demo` (of lokaal met `?demo`) de demo in plaats van de echte versie; `demo.js` doet de toegang en de rondleiding.
- Toegang: `rpc/demo_uitgenodigd(p_email)` (vóór het versturen van de code) en `rpc/demo_toegang()` (na inloggen), tabel `demo_toegang` (migratie 023). Beheer van de lijst met `execute_sql`, zie `supabase/scripts/2026-09-28_demo_toegang_beheerder.sql`.
- Wie in de demo inlogt, heeft een gewoon Supabase-account zonder club; in de echte app ziet die "Nog niet gekoppeld".
