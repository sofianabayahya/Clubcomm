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
- Migraties: `supabase/migrations/001…015` (009: vastgezet nieuws leesbaar voor nieuwe ouders van het team; 010: telefoonnummer bij aanmelden; 011: geen dubbele aanmelding voor hetzelfde kind; 012: pushmeldingen; 013: berichten als gesprekken, archief; 014: leegmaken alleen bij nieuwe club; 015: foutregistratie).

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
