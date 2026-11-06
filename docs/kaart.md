# Projectkaart ClubComm

*Routekaart van onderwerp naar code, besluiten en tests (Spoor 3, sinds 29-10-2026). In de tabel staat `\|` voor het teken `|` ("of") in de testopdracht. Gebruik: zoek je onderwerp, lees alleen die bestanden en besluiten (zoek in `docs/besluiten.md` op `## Besluit N`), draai die tests. De besluitnummers zijn een startpunt, geen volledige lijst: het nieuwste besluit geldt (Register bovenaan `docs/besluiten.md`).*

## Onderwerpen

| Onderwerp | Code (`public/app/`) | Besluiten | Snelle test (`npx playwright test -g "…"`) |
|---|---|---|---|
| **Afmelden, aanwezigheid, kaarten** | `core.js` (afmelden), `data.js` (aanwezigheid, zones, kaarten per seizoen), `afwezig.js`, `trainerafw.js` · functiekaarten `docs/handleiding/aanwezigheid.md` en `zelf-afmelden.md` | 5, 10, 20, 21, 32, 91, 94, 105 | `ouder meldt af\|trainer kan niet\|trainer niet gekomen\|afgelast\|nieuwe fase` |
| **Planning en rooster** | `hjo.js` (rooster: `CC.rooster`), `trainer.js`, `teamleider.js`, `agenda.js` | 13, 73, 87, 108, 110 | `rooster\|verzameltijd\|oefenwedstrijd` |
| **Teams en wedstrijden zelf beheren** | `teamsbeheer.js` (`CC.wedLezen`, `CC.wedWijzig`, `CC.schemaLezen`, `CC.trainingenKlaarzetten`) | 136, 168 | `teams en trainingsdagen` + `tests/wedstrijden-tijdlijn.spec.js` |
| **Wedstrijd, speeltijd, opstelling** | `opstelling.js` (`M.zelfAfleiden`, `M.wedCat`), `data.js` (speeltijd), `trainer.js` | 33, 39, 60, 62, 106, 109, 116, 117 | `wisselschema\|speeltijd\|timekeeper` |
| **Berichten en automatisch werk** | `autoberichten.js`, `core.js` (berichten), `lijstdetail.js` (laptop: gesprek naast de lijst, Besluit 171), `push.js`, `sw.js`; server: `supabase/functions/automaat`, `supabase/functions/melding` | 19, 36, 57, 75, 77, 79–82, 107 | `berichten\|ouder: verlopen` + `node --test tests/automaat.test.mjs` |
| **Taken, vervoer, meehelpen, materiaal** | `taken.js`, `meehelpen.js`, `materiaal.js`, `waardering.js` | 17, 25, 28, 31, 64, 95, 98 | `taken:\|chauffeur` |
| **Ontwikkelgesprekken en beoordeling** | `beoordeling.js`, `gesprek.js` | 23, 65–72, 101 | `spelerskaart` |
| **Trainers begeleiden (HO, TC)** | `trainers.js` (ook de stappen per trainer en *Traject starten*, Besluit 177), `begeleiding.js`, `howeek.js` (week achter **Week**, compacte lijst), `startscherm.js` (Home van begeleider en trainer, Besluit 166), `lijstdetail.js` (laptop: lijst en detail naast elkaar, Besluit 171), tijdlijn in `trainers.js` (Besluit 168), `hjohome.js`, `hjofilter.js` (`CC.werkgebied` in `hjo.js`), `meekijken.js` | 42, 97, 99, 100, 129, 134, 140, 143, 146, 154, 159, 166 | `trainers begeleiden\|begeleidingsmoment\|technisch coördinator\|HO-Home\|bouwen\|pakket Alleen\|eigen reflectie\|week van de begeleider` + `tests/ho-week.spec.js` + `tests/startscherm.spec.js` + `tests/ho-stappen.spec.js` + `npm run test:veilig` |
| **Trainingsmodule** | `training.js` (kiezer, Voorbereiden, Op het veld, Vormen; in de code `plannen`, `week`, `vormen`; Vormen op de laptop lijst links en de vorm rechts, Besluit 174), `periodisering.js` (methodiek, Seizoen; in de code `lijn`), `vormtypes.js` · functiekaarten `docs/handleiding/training-voorbereiden.md` en `vormenbank.md` | 121, 128, 130–135, 137, 138, 139, 141, 142, 144, 145, 147, 163, 164, 165, 167, 169, 172, 173, 174, 175, 176, NNN, 150, 155 | `trainingsmodule\|oefenvorm\|trainingskaart\|vastleggen\|korte evaluatie\|labels` + `tests/kiezer.spec.js`, `tests/trainingskaart.spec.js`, `tests/vastleggen.spec.js`, `tests/plek-weghalen.spec.js`, `tests/oefenvorm-velden.spec.js`, `tests/week-vorm.spec.js`, `tests/plannen-rustiger.spec.js`, `tests/wie-speelt-waar.spec.js`, `tests/keepers-tellen.spec.js`, `tests/korte-evaluatie.spec.js` |
| **Opleidingsprofielen** | `opslag.js` (leest `S.profielen`), `training.js` (`profiel`, `ond`); bron: `supabase/profielen/` | 121, 123, 133 | `opleidingsprofiel\|trainingsmodule` |
| **Tekentool** | `tekentool.js` + `.css`, `tekenen.html` · functiekaart `docs/handleiding/tekentool.md` | 124–127, 148 (rugnummers), 152 (menu sluiten), 153 (veldlijnen), 156 (paneel Spelers), 172 (paneel blijft open bij een andere speler), 157 (gekanteld), 158 (Kopie en Weg in het paneel, tikvlak kleuren, tip), 160 (tikvlak 44 px), 162 (hoedjes 70% van een speler), 161 (trainerspilot; PDF snelstart uit deze kaart) | `tekentool` (ook `tests/tekentool-nummering.spec.js`, `tests/trainerspilot.spec.js`, `tests/tekentool-hoedjes.spec.js`) |
| **Demo en rondleiding** | `demo.js` (`STAPPEN`), `data.js` (democlub) | 89, 114 | `rondleiding\|uitnodiging\|demo:\|elke stap` |
| **Schermen, tabbladen, vensters** | `core.js` (`CC.sheet`, `CC.toast`, `CC.on`), `index.html`, `app.css` | 30, 34, 102–104, 111, 113, 118, 122, 149, 150 | `tabbladen\|venster\|tikvlakken\|dubbel tikken\|rol wisselen\|automatisch bewaren` |
| **Inloggen, opslag, rechten** ⚠️ altijd maat L | `live.js`, `opslag.js` (scopes), `core.js` (inloggen, privacy); `supabase/migrations/` · functiekaart `docs/handleiding/inloggen.md` | 1, 14, 24, 45, 52, 72, 119, 143 | alle tests + rechtentest (zie onder) |
| **Inrichten en clubbeheer** | `hjo.js` (Regels, Rollen, Seizoen), `beheerlijsten.js` (Rollen en teams ingeklapt, zoeken), `onderhoud.js` | 6, 12, 96, 103, 112, 120, 170 | `schermgebruik\|kop:` + `tests/beheerlijsten.spec.js` |
| **Presentaties en handleidingen** | `docs/presentaties/` (`maak.js`, `shots*.js`); functiekaarten in `docs/handleiding/` (Besluit 151; overzicht in `README.md`, uitgaven in `bundels.md`); voorstel `docs/onderzoek/documentatie-borging/README.md` | 89, 114, 151 | geen (handmatig) |

## Wie leest wat
- **Spoor 1 (persoonlijke methodiek):** `docs/methodiek/persoonlijk/overdracht.md` en het kerndocument; code via Spoor 3.
- **Spoor 2 (Swift):** `docs/methodiek/swift/overdracht.md` en `docs/methodiek/swift/README.md`.
- **Spoor 3 (ClubComm):** `docs/overdracht-clubcomm.md`, deze kaart, en bij twijfel `docs/architectuur.md` (lagen en voorwaarden).
- **Schermwerk:** ook `docs/app-controle.md` en de ontwerpregels en toetsvragen van Besluit 149 (vrijwilligersprincipe). **Gegevens of meerdere rollen:** ook `docs/pilotlog.md` (patronen van eerdere fouten).
- **Planning en volgende stappen:** `docs/productie-en-groei.md` → **Openstaand**.

## Documenten
| Bestand | Inhoud |
|---|---|
| `docs/besluiten.md` | **Alle afspraken (bron van waarheid).** Bovenaan het Register, onderaan Afgewezen ideeën, Later / ideeën en Nog te bespreken. |
| `docs/sporen.md`, `docs/architectuur.md` | De drie sporen; vier lagen en drie voorwaarden (beschikbaarheid, inhoud, bevoegdheid). |
| `docs/productie-en-groei.md` | **Openstaand** (planning en volgende stappen), controlelijst, meerdere clubs, kosten. |
| `docs/techniek.md` | Opbouw van de echte versie: Supabase, Vercel, Brevo, migraties, e-mail, back-up, publiceren. |
| `docs/app-controle.md` | Controlelijst voor schermen (normen en technieken). |
| `docs/pilotlog.md` | Fouten uit de pilot met oorzaak en patroon (momentopname, opslaan, demo verbergt het, één persoon per rol, buiten de app, rommelige gegevens). |
| `docs/plan-van-aanpak.md` | Van pilot naar product (A product af → B handboek → C prijs → D verkopen → E invoeren), planning t/m januari 2027. |
| `docs/methodiek/` | `persoonlijk/` (Spoor 1) en `swift/` (Spoor 2). |
| `docs/onderzoek/` | Voorstellen en analyses, geen besluiten (o.a. app-analyse, verdienmodel, taken per rol, verbeterplan gebruik). Oudere stukken dragen *Historisch onderzoeksdocument*, ook `docs/trainingsmodule*.md`. |
| `docs/presentaties/` | Productoverzicht *Wat kan ClubComm* en PowerPoints per rol (handleiding én presentatie). |
| `.claude/skills/` | Projectskills **app-design-architect** (UX-audit, ontwerp) en **app-workflow-optimizer** (taakstromen): bij analyse of herontwerp van schermen; analyse eerst, bouwen na akkoord. |

## De app in het kort
- Pilot DCG: 16 spelers (een 17e twijfelt nog); wedstrijden vanaf fase 2 (za 31 okt 2026). De gebruiker heeft twee teamleiders naast zich.
- `public/index.html` + `public/app/*.js`: één webapp voor de telefoon (vanilla JS, geen build), installeerbaar (manifest + `sw.js`).
- `data.js`: demodata en rekenregels. `opslag.js`: app-gegevens ↔ databaserijen. `core.js`: inloggen, kop, profiel, berichten, afmelden, planning aanpassen, privacy, feedback. `live.js`: echte versie (Supabase: inloggen met e-mailcode, laden, automatisch opslaan, beheer).
- Schermen per rol: `ouder.js`, `trainer.js`, `teamleider.js`, `hjo.js` (ook clubbeheerder), `hjohome.js`; coördinator via `taken.js`.
- `trainers.js`: scopes `trainerzelf`, `trainerdossier`, `hoprive` (migratie 024; 025: ook de TC, notities per bouw). Besluit 143 (migratie 033): `trainerzelf` schrijft alleen de trainer zelf (HO/TC alleen *gevraagd*); `trainerzelf` en `trainerdossier` niet voor een beheerder zonder rol HO/TC; tests `begeleiding-eigenaarschap.sql` en `app-opslag.sql` (+ `tests/eigen-reflectie.spec.js`). Besluit 154 (migratie `supabase/migrations/034_begeleider_werkgebied.sql`, toegepast 4-11): werkgebied ook in de database, via de beperkende regel `rij_begeleiding`; test `supabase/tests/lokaal/begeleider-werkgebied.sql` (en `-032.sql` samen met 032). Rol `tc`, werkgebied `bouwen` (`CC.werkgebied`), pakket *Alleen Trainers begeleiden* (`club.pakket = 'trainers'`, `CC.pakketTrainers`).
- **Formulieren (Besluit 103):** lange formulieren krijgen `data-autosave="naam"` en `CC.autosave.naam(form)`; de knop heet *Klaar*. Knopnamen zijn uniek (`CC.on`; bewuste vervanging met `{ vervangt: true }`, Besluit 102).
- `opstelling.js`: speelvorm per team `team.speelCat` (`M.wedCat`); keuze van de staf in `S.teamKeuze`.
- `adres.js`: adres via PDOK (`data-adres`). `push.js`: pushmeldingen (Besluit 53). `onderhoud.js`: foutregistratie en zelf verversen (`versie.json` uit `versie-maken.js`, Besluit 63).
- **Opleidingsprofielen (Besluit 123):** methodiek als gegevens, niet in de code. Opbouw en KNVB-standaard: `supabase/profielen/`; het DCG-profiel staat in de database (soort `profiel`); de app leest ze in `S.profielen` en schrijft ze nooit terug.
- **Trainingsmodule:** eigen vormen (`S.vormen`) en trainingen (`S.trainingsplannen`, scope `eigen`); tabblad *Training* (`CC.trainingTab`) met Op het veld · Voorbereiden · Vormen · Seizoen (Besluit 141, namen 176; in de code `week`, `plannen`, `vormen`, `lijn`); opstelling per kleur onder de tekening, tikvlakken via `DrawTool.staticSvg(json, { tik })` (Besluit 175, NNN); `periodisering.js` alleen als het profiel voetbalproblemen en leerniveaus heeft. **Eén oefenvormkiezer voor elke club** (Besluit 139: `advies`, `kvHtml`; *Ongedaan maken* via `CC.toast` met knop; regressietests in `tests/kiezer.spec.js`). **Trainingskaart** (Besluit 144): `CC.trMethodiek` in `periodisering.js`, vijf regels met herkomst, weekvoorstel apart (`CC.trWeekVoorstel`), `CC.trAfspraak`, momentopname `origineel` via `CC.trBorgOrigineel` (aangeroepen in `live.js`). Tekentool zit in `index.html`; los testscherm `/tekenen`.
- `evaluatie.html` (`/evaluatie`): evaluatieformulier coach, alleen op het toestel (Besluit 93).
- **Demo:** online alleen `mijnclubcomm.nl/demo`, **alleen op uitnodiging** (`demo.js`, tabel `demo_toegang`, Besluit 89); `?demo` alleen lokaal. Accounts: Sanne (ouder), Mark (trainer + ouder), Linda (teamleider + ouder), Peter (HJO + beheerder), Esther (coördinator). Democlub "VV De Voorbeeldclub": **alleen verzonnen namen**. Nieuw of gewijzigd scherm: kijk of `STAPPEN` in `demo.js` nog klopt.

## Online en techniek
- App: https://mijnclubcomm.nl (Hostnet → Vercel; oud adres clubcomm-nine.vercel.app). Vercel-project `clubcomm` (map `public`). Hoe publiceren werkt: `CLAUDE.md` → *Publiceren*; details in `docs/techniek.md`.
- Supabase-project `pkvacwbdgumkffxnxnqk` (Frankfurt). Club-id `dcg` (en `swift`); account van de gebruiker: persoon `p-beheer`. Migraties: bestand in `supabase/migrations/` **en** `apply_migration` (alleen na akkoord). Eenmalige datawijzigingen: `supabase/scripts/` en `execute_sql` (alleen na akkoord).
- Edge Functions `melding` (e-mail via Brevo en push) en `automaat` (elk kwartier; secrets `BREVO_API_KEY`, `AFZENDER_EMAIL`; push-sleutels in tabel `push_sleutel`, alleen server). Logboek: tabel `automaat_log`. Wijzig je regels in `public/app/*.js`, dan draait de server na publicatie mee; nachtrust 21:00–07:30 (Besluit 77).
- E-mail: Brevo (gratis plan, 300 mails per dag), afzender `noreply@mijnclubcomm.nl`. Claude kan contacten en afzenders nakijken, niet de bezorging van losse mails.
- Bewaking: UptimeRobot op mijnclubcomm.nl en `rpc/gezondheid` (automaat laatste 35 min gedraaid; migratie 022). Agenda-abonnement werkt pas met een eigen domein. Logo-blauw #0d88f9, app-kleur #0869c2 (contrast).

## Testen
- Lokaal: `npm install && npm start` → http://localhost:5000/?demo. Chromium staat in `/opt/pw-browsers` (niet `playwright install`).
- `npm test` = node-tests (`tests/automaat.test.mjs`: servermotor, `tests/verwijzingen.test.mjs`: paden, `tests/besluitnummers.test.mjs`: elk besluitnummer één keer, als kop en in het Register) + Playwright (`tests/*.spec.js`: elke rol doorklikken in de demo én in de kleine nagebootste club, `supabase/tests/fake-supabase.js`, code 123456). Draait ook op GitHub (Actions *Tests*); **rood = niet samenvoegen**.
- **Altijd ook de echte, bijna lege club testen** (teamnaam ≠ teamcode, weinig spelers, geen telefoonnummers), niet alleen de demo. Nieuwe functie of gevonden fout → test erbij.
- Rechten per rol: `select * from priv.rechtentest() where not ok;` (Besluit 119, migratie 030; elke nacht, alarm via `rpc/gezondheid`). Nieuwe rechten of een nieuwe soort gegevens: controle erbij. (Het oude `rls_test.sql` is vervangen.)
- Presentaties opnieuw maken: `shots*.js`, dan `node docs/presentaties/maak.js product`; voor een andere club `CONTACT_NAAM=… CONTACT_MAIL=… node docs/presentaties/maak.js clubs "Clubnaam"` → `uit/` (niet in git); PDF met `soffice --headless --convert-to pdf` (lettertype Carlito).
