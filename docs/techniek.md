# ClubComm — techniek van de echte versie (sinds 24 september 2026)

## Onderdelen
- **App**: `public/` (dezelfde schermen als de demo). Online via Vercel: https://clubcomm-nine.vercel.app (project `clubcomm`, map `public`).
- **Database en inloggen**: Supabase-project `ClubComm` (regio Frankfurt, EU). Club-id `dcg` (club DCG).
- **Demo**: blijft bestaan. Met `?demo` achter het adres, of via de artifact-link, draait de app met voorbeelddata op het eigen apparaat.

## Hoe de gegevens zijn opgeslagen
- Eén tabel `rij`: per regel een soort (bijv. `afm`, `players`, `msgs`), een id, de gegevens (`data`) en koppelvelden (team, speler, persoon, activiteit).
- Elke regel heeft een **scope** die bepaalt wie hem mag zien en wijzigen. De database controleert dat zelf (Row Level Security), niet alleen het scherm:
  - ouders: alleen hun eigen kind (afmeldingen, aanwezigheid, beoordeling); namen van teamgenoten voor vervoer en taken;
  - trainer/teamleider: hun eigen team; beoordelingen en gespreksnotities volgens de takenlijst van de club (Besluit 25);
  - coördinator: de teams van de eigen groep; HJO/beheerder: de hele club;
  - contactgegevens (e-mail, telefoon) apart: staf ziet alleen die van ouders uit de eigen teams.
- Extra bewaking: niemand kan zichzelf rollen geven; berichten van een ander kun je alleen als gelezen markeren of beantwoorden; ouders kunnen trainingen niet verplaatsen.
- Test: `supabase/tests/rls_test.sql` (draait per rol wat iemand ziet en wat geweigerd wordt).
- Migraties: `supabase/migrations/001…004`.

## Inloggen
- Met een e-mailcode of de link in de mail (geen wachtwoord). Na inloggen koppelt de database het account aan de persoon met hetzelfde e-mailadres.
- Nieuwe ouder: via de team-uitnodiging (QR/link) aanmelden → de teamleider keurt goed → daarna koppelt het account vanzelf.

## Nog in te stellen in Supabase (dashboard, door de eigenaar)
1. **Authentication → URL Configuration**: Site URL `https://clubcomm-nine.vercel.app` en dezelfde bij Redirect URLs.
2. **Authentication → Emails → Magic Link**: zet `{{ .Token }}` in de tekst, zodat de mail ook de code bevat.
3. **Voor de pilot: eigen e-mailverzender (SMTP)**, bijv. Resend of Brevo. De ingebouwde verzender stuurt maar een paar mails per uur.

## Beheer
- Clubbeheerder → Home → "Voorbeelddata laden" (om te testen) en "Club leegmaken" (voor de start met echte gegevens).
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
