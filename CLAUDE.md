# ClubComm

Communicatie en organisatie voor jeugdvoetbal: afmelden, planning, taken, vervoer, berichten, kaarten, speeltijd.
**Pilot:** RKSV DCG (Amsterdam, Sportpark Ookmeer), team **O12 talententeam** (code `O12-1`, selectie), 16 spelers (een 17e twijfelt nog). Database sinds 25-09 leeg op dit team na (Besluit 38). De gebruiker (Sofian) is trainer, ouder (zijn kind speelt in het team) en clubbeheerder, met twee teamleiders. Wedstrijden vanaf fase 2 (za 31 okt 2026).

## Werkafspraken met de gebruiker
- De gebruiker is beginner: altijd **eenvoudig Nederlands**, één stap tegelijk, uitleg waar je klikt.
- Nieuwe keuze → vastleggen als **besluit** in `docs/besluiten.md` → bouwen → testen → committen en pushen → online zetten.
- **Hoofdversie (main) altijd bijwerken:** na elke afgeronde ronde de werkbranch via een pull request samenvoegen met `main` (de gebruiker wil dat `main` op GitHub altijd de actuele stand is). Daarna de werkbranch opnieuw laten beginnen vanaf `main`.
- Vraagt de gebruiker **"wat zijn de volgende stappen?"**: kijk in `docs/productie-en-groei.md` → blok **Openstaand** en houd dat blok bij.
- **Eigenaarschap:** zoek zelf actief naar verouderde teksten, gaten en fouten (zoals een tekst die niet meer klopt met een nieuwer besluit). Leg ze eerst voor aan de gebruiker en bouw pas na akkoord; kleine, duidelijke fouten mag je in dezelfde ronde meenemen en melden.
- **Borgen (bij elk besluit):** (1) nieuw besluit bovenaan in `docs/besluiten.md`; (2) elk ouder besluit dat het raakt krijgt de regel *"◐ Deels herzien door Besluit X"* of *"✖ Vervangen door …"* en het **Register** bovenaan wordt bijgewerkt; (3) wat bewust niet doorgaat komt bij **Afgewezen ideeën** (met reden); (4) *Later / ideeën* en *Nog te bespreken* bijwerken; (5) **Openstaand** bijwerken. **Vóór je een idee voorstelt:** kijk bij Afgewezen ideeën en in het Register; stel nooit een afgewezen idee voor zonder dat te zeggen.
- Vraag nooit om geheime sleutels in de chat (Brevo, Supabase service key); de gebruiker zet ze zelf in het dashboard.
- **Principe 10: overzichtelijk en precies, nooit een overkill.** Redeneer altijd vanuit hier: alleen informeren en signaleren wat iemand nodig heeft, op het juiste moment, één keer.
- Vuistregels voor elk scherm (Besluit 30 en 34): actie eerst, wat bij elkaar hoort in één blok, elke actie één vaste plek, kleur alleen voor aandacht, **informatie is geen taak**, "ClubComm signaleert, mensen beslissen".

## Waar staat wat
| Bestand | Inhoud |
|---|---|
| `docs/besluiten.md` | **Alle afspraken (bron van waarheid).** Bovenaan het **Register** (status per besluit), onderaan **Afgewezen ideeën**. Bij tegenstrijdigheid geldt het nieuwste besluit (nu t/m Besluit 96). |
| `docs/pilotlog.md` | **Fouten uit de pilot met oorzaak en patroon** (momentopname, opslaan, demo verbergt het, één persoon per rol, buiten de app, rommelige gegevens). Bij elke wijziging langs deze patronen lopen. |
| `docs/plan-van-aanpak.md` | **Van pilot naar product:** A product af (ook op schaal: 50 teams) → B beschrijven (handboek) → C prijs en groei → D verkopen → E invoeren. Met planning t/m januari 2027. |
| `docs/productie-en-groei.md` | Controlelijst, **Openstaand**, meerdere clubs, app of website, kosten. |
| `docs/techniek.md` | Opbouw van de echte versie (Supabase, Vercel, Brevo, migraties, e-mail, back-up). |
| `docs/presentaties/` | **Productoverzicht** "Wat kan ClubComm" (`maak.js product`, de bron voor pitch, demo en handleidingen) en PowerPoints per rol (bestuur, teamleider, ouders, trainer): handleiding én presentatie. Opnieuw maken: `shots*.js` (schermafbeeldingen uit de demo) en `maak.js`. Kennismaking voor een andere club: `shots-clubs.js`, dan `CONTACT_NAAM=… CONTACT_MAIL=… node docs/presentaties/maak.js clubs "Clubnaam"` → `uit/` (niet in git); PDF met `soffice --headless --convert-to pdf` (lettertype Carlito nodig). |
| `docs/onderzoek/` | Achtergrond: analyse clubproblemen, vergelijking Teamy en VeldPlanner, **app-analyse 26-09** (rapportcijfers en prioriteiten) , **beoordeling 27-09** (19 onderwerpen, advies op volgorde), **verdienmodel** (voorstel prijzen) en **taken per rol** (HO tegenover coördinator, stappenplan eerste gesprek met een club). Voorstellen, geen besluiten. |

## De app
- `public/index.html` + `public/app/*.js`: één webapp voor de telefoon (vanilla JS, geen build), installeerbaar (manifest + `sw.js`).
  - `data.js`: demodata + rekenregels (aanwezigheid, kaarten per seizoen, zones, signalen, speeltijd, vaste taken). `opslag.js`: app-gegevens ↔ databaserijen. `core.js`: inloggen, kop, profiel, berichten, afmelden, planning aanpassen, privacy, feedback.
  - Schermen per rol: `ouder.js`, `trainer.js`, `teamleider.js`, `hjo.js` (ook clubbeheerder), `hjohome.js`; coördinator via `taken.js` (ook taken per rol en profielen).
  - `adres.js`: adres aanvullen via PDOK (velden met `data-adres`). `push.js`: pushmeldingen aanzetten en keuzes (Besluit 53); tonen in `sw.js`. `onderhoud.js`: foutregistratie en zelf verversen bij een nieuwe versie (`versie.json`, gemaakt door `versie-maken.js` bij elke publicatie; Besluit 63).
  - Modules: `autoberichten.js` (Communicatieplan, noodberichten, herinneringen activiteiten), `afwezig.js`, `trainerafw.js`, `beoordeling.js` (+ `gesprek.js`: voorbereiding en gesprekspagina ontwikkelgesprek), `materiaal.js`, `meehelpen.js`, `waardering.js`, `hjofilter.js`, `agenda.js`.
  - `evaluatie.html` (los, `/evaluatie`): evaluatieformulier praktijkbegeleiding coach, gegevens alleen op het toestel, PDF via printen (Besluit 93).
  - `live.js`: echte versie (Supabase: inloggen met e-mailcode, laden, automatisch opslaan, beheer).
- **Demo:** online alleen `mijnclubcomm.nl/demo` met rondleiding voor besturen, **alleen op uitnodiging** (`demo.js`, tabel `demo_toegang`, Besluit 89). `?demo` werkt alleen nog lokaal (tests, schermafbeeldingen). Accounts: Sanne (ouder), Mark (trainer + ouder), Linda (teamleider + ouder), Peter (HJO + beheerder), Esther (coördinator). Democlub "VV De Voorbeeldclub", alleen verzonnen namen (geen echte clubs of adressen gebruiken!); staat in localStorage. Nieuwe of gewijzigde schermen: kijk of de rondleiding (`STAPPEN` in `demo.js`) nog klopt.

## Online
- App: https://mijnclubcomm.nl (domein bij Hostnet, DNS naar Vercel; oud adres clubcomm-nine.vercel.app werkt ook) — Vercel-project `clubcomm` (map `public`). Online zetten: Vercel `create_deployment` (project `clubcomm`, target production, gitSource github `sofianabayahya/Clubcomm`, ref = de werkbranch, zonder teamId).
- Supabase-project `pkvacwbdgumkffxnxnqk` (Frankfurt). Club-id `dcg`; account van de gebruiker: persoon `p-beheer`. Migraties: bestand in `supabase/migrations/` **en** toepassen met `apply_migration`. Eenmalige datawijzigingen: bestand in `supabase/scripts/` en uitvoeren met `execute_sql`. Edge Functions `melding` (e-mail via Brevo én pushmeldingen) en `automaat` (elk kwartier het automatische werk; `supabase/functions/automaat`, secrets `BREVO_API_KEY`, `AFZENDER_EMAIL`; push-sleutelpaar staat in tabel `push_sleutel`, alleen voor de server).
- E-mail: Brevo (inlogmail via SMTP, meldingen via API; gratis plan, 300 mails per dag). Afzender `noreply@mijnclubcomm.nl` ("ClubComm"). Claude kan via de Brevo-koppeling contacten en afzenders nakijken (o.a. of een adres op de blokkeerlijst staat), maar niet de bezorging van losse mails.

## Testen
- Lokaal: `npm install && npm start` → http://localhost:5000/?demo (of `cd public && python3 -m http.server 5050`).
- Zonder netwerk naar Supabase: `supabase/tests/fake-supabase.js` (nagebootste client, code 123456); rechten per rol: `supabase/tests/rls_test.sql`.
- **Altijd ook de echte, bijna lege club testen** (teamnaam ≠ teamcode, weinig spelers, geen telefoonnummers), niet alleen de demo.
- **Automatische tests (Besluit 88):** `npm test` (map `tests/`: servermotor + elke rol doorklikken in demo én kleine nagebootste club + afmelden/rooster). Draaien ook vanzelf op GitHub (Actions "Tests"); **rood = niet samenvoegen met main**. Nieuwe functie of gevonden fout → test erbij. Lokaal met Chromium uit `/opt/pw-browsers` (niet `playwright install`).
- **Bewaking:** UptimeRobot op mijnclubcomm.nl en op `rpc/gezondheid` (automaat laatste 35 min gedraaid; migratie 022).

## Bekende beperkingen
- Automatisch werk (berichten, uitslag, gesprekken) doet de server elk kwartier (Edge Function `automaat`, Besluit 77) met dezelfde regels als de app; nachtrust 21:00–07:30. Wijzig je regels in `public/app/*.js`, dan draait de server na publicatie mee. Logboek: tabel `automaat_log`.
- Agenda-abonnement werkt pas met een eigen domein (in de echte versie verborgen).
- Het logo-blauw (#0d88f9) is lichter dan de app-kleur (#0869c2, gekozen voor contrast).
