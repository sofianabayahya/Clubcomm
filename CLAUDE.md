# ClubComm

Communicatie en organisatie voor jeugdvoetbal: afmelden, planning, taken, vervoer, berichten, kaarten, speeltijd.
**Pilot:** RKSV DCG (Amsterdam, Sportpark Ookmeer), team **O13 talententeam** (sinds 27-10; interne code `O12-1`, leeftijd O12 / geboortejaar 2015, speelt O13, selectie), 16 spelers (een 17e twijfelt nog). Database sinds 25-09 leeg op dit team na (Besluit 38). **Tweede club (10-10): AVV Swift** (club-id `swift`), alleen het pakket Trainers begeleiden. **Inhoudelijke functie van de gebruiker bij Swift: HJO bovenbouw** (O14–O19). Zijn technische rollen in ClubComm daar (HO en clubbeheerder, eigen e-mailadres) zijn iets anders: die bepalen wat hij in de app mag, niet wat zijn functie in de club is. Verder een TC en trainers. De gebruiker (Sofian) is trainer, ouder (zijn kind speelt in het team) en clubbeheerder, met twee teamleiders. Wedstrijden vanaf fase 2 (za 31 okt 2026).

## Drie sporen (afspraak 29-10, routekaart: `docs/sporen.md`)
- **Spoor 1 — Persoonlijk:** de eigen voetbalmethodiek van de gebruiker (oefenomgeving DCG O13). Lees `docs/methodiek/persoonlijk/` (begin bij `overdracht.md`). Technisch via het DCG-clubprofiel; gaat **nooit vanzelf** naar een andere club.
- **Spoor 2 — Swift:** jeugdmethodiek van AVV Swift (KNVB + jeugdbeleidsplan, O14–O19). Lees `docs/methodiek/swift/`. Geen inhoud uit Spoor 1 zonder uitdrukkelijke toestemming.
- **Spoor 3 — ClubComm:** het platform voor alle clubs. Lees dit bestand, `docs/besluiten.md` en `docs/architectuur.md`.
- **Herkennen:** het bericht begint met `SPOOR 1 — PERSOONLIJK`, `SPOOR 2 — SWIFT` of `SPOOR 3 — CLUBCOMM`. Lees alleen de documenten van dat spoor, plus `docs/sporen.md`. Geen spoor genoemd en je gaat iets wijzigen: eerst vragen.
- **Inhoud en software apart:** raakt iets meer sporen, beschrijf dan apart (a) wat het inhoudelijk betekent voor dit profiel en (b) welke algemene functie ervoor nodig is (altijd Spoor 3).
- **Besluiten:** alleen Spoor 3 geeft definitieve besluitnummers en houdt het register bij. Spoor 1 en 2 schrijven *"Voorstel Spoor X — …"* (in hun eigen map) en leggen dat voor aan Spoor 3.
- **Samenvoegen en publiceren:** alleen Spoor 3 voegt samen met `main`, lost conflicten op, draait de integratietests en publiceert. Spoor 1 en 2 werken op een eigen branch en publiceren **nooit** zelf, ook niet "even" een werkbranch.

## Controle vóór elke wijziging (code, centrale documenten, besluitnummers, publicatie)
Een eerdere chatinstructie is nooit genoeg bewijs dat een branch nog actueel is. Controleer elke keer:
1. de nieuwste `main` (`git fetch origin main`);
2. de open pull requests;
3. of andere sessies dezelfde bestanden of functies hebben veranderd;
4. het hoogste definitieve besluitnummer in `docs/besluiten.md` (vrij nummer pas vlak voor het opslaan kiezen);
5. het verschil tussen de werkbranch en `main`;
6. of de branch achterloopt of conflicten heeft;
7. de branch veilig bijwerken vanaf `main` (samenvoegen, geen eigen werk kwijt);
8. pas verder als er geen nieuwere functionaliteit wordt overschreven.

**Tweede controle vlak vóór samenvoegen en vóór publiceren:** dezelfde punten opnieuw.
- Bij een conflict: stoppen, beschrijven en een voorstel doen. Niet zelf kiezen.
- Publiceren gebeurt alleen vanaf een gecontroleerde commit op `main`: **samenvoegen met `main` publiceert vanzelf** (Vercel), dus samenvoegen alleen met akkoord van de gebruiker. Daarna controleren dat productie (Vercel) precies die commit draait.

## Werkafspraken met de gebruiker
- De gebruiker is beginner: altijd **eenvoudig Nederlands**, één stap tegelijk, uitleg waar je klikt.
- Nieuwe keuze → vastleggen als **besluit** in `docs/besluiten.md` → bouwen → testen → committen en pushen → pull request → akkoord van de gebruiker → samenvoegen met `main` (tests groen; dit zet het meteen online) → controleren dat productie die commit draait (Spoor 3, na de controles hierboven).
- **Hoofdversie (main) altijd bijwerken:** na elke afgeronde ronde de werkbranch via een pull request samenvoegen met `main` (de gebruiker wil dat `main` op GitHub altijd de actuele stand is). Daarna de werkbranch opnieuw laten beginnen vanaf `main`. Vraagt de gebruiker om eerst te kijken, dan het pull request tonen en wachten op akkoord.
- Vraagt de gebruiker **"wat zijn de volgende stappen?"**: kijk in `docs/productie-en-groei.md` → blok **Openstaand** en houd dat blok bij.
- **Eigenaarschap:** zoek zelf actief naar verouderde teksten, gaten en fouten (zoals een tekst die niet meer klopt met een nieuwer besluit). Leg ze eerst voor aan de gebruiker en bouw pas na akkoord; kleine, duidelijke fouten mag je in dezelfde ronde meenemen en melden.
- **Borgen (bij elk besluit):** (1) nieuw besluit bovenaan in `docs/besluiten.md`; (2) elk ouder besluit dat het raakt krijgt de regel *"◐ Deels herzien door Besluit X"* of *"✖ Vervangen door …"* en het **Register** bovenaan wordt bijgewerkt; (3) wat bewust niet doorgaat komt bij **Afgewezen ideeën** (met reden); (4) *Later / ideeën* en *Nog te bespreken* bijwerken; (5) **Openstaand** bijwerken. **Vóór je een idee voorstelt:** kijk bij Afgewezen ideeën en in het Register; stel nooit een afgewezen idee voor zonder dat te zeggen.
- Vraag nooit om geheime sleutels in de chat (Brevo, Supabase service key); de gebruiker zet ze zelf in het dashboard.
- **Eerst een voorbeeld:** bij een nieuw of gewijzigd scherm eerst een schermafbeelding op telefoonformaat (390 px), met voordelen, nadelen en een eerlijk advies ("zou ik doen" / "zou ik niet doen"). Bouwen na zijn ja.
- **Zelf meedenken:** stel na elke opdracht minstens één verbetering voor die niet gevraagd is, met een keuze voor de gebruiker. Loop bij schermwerk de normen en technieken uit `docs/app-controle.md` zelf na (tikvlak 44 pt, contrast 4,5:1, leestekst 16 px, safe area, Beperk beweging, dubbel tikken), voordat de gebruiker het ziet.
- **Principe 10: overzichtelijk en precies, nooit een overkill.** Redeneer altijd vanuit hier: alleen informeren en signaleren wat iemand nodig heeft, op het juiste moment, één keer.
- Vuistregels voor elk scherm (Besluit 30 en 34): actie eerst, wat bij elkaar hoort in één blok, elke actie één vaste plek, kleur alleen voor aandacht, **informatie is geen taak**, "ClubComm signaleert, mensen beslissen".

## Waar staat wat
| Bestand | Inhoud |
|---|---|
| `docs/besluiten.md` | **Alle afspraken (bron van waarheid).** Bovenaan het **Register** (status per besluit), onderaan **Afgewezen ideeën**. Bij tegenstrijdigheid geldt het nieuwste besluit (nu t/m Besluit 138). |
| `docs/sporen.md` | **Routekaart van de drie sporen:** per spoor doel, leidende documenten, wat vastligt, wat gebouwd is, open vragen, volgende stap. Geen tweede register. |
| `docs/architectuur.md` | **Opbouw:** vier lagen (platform · vereniging · opleidingsprofiel · trainer), drie aparte voorwaarden (beschikbaarheid · methodologische inhoud · bevoegdheid), methodiek die nog in de code staat, weinig instellingen, Lijn · Plannen · Week · Vormen overal gelijk. |
| `docs/methodiek/` | `persoonlijk/` (Spoor 1, tot 29-10 `dcg/`) en `swift/` (Spoor 2, nog leeg). |
| `docs/app-controle.md` | **Controlelijst voor schermen** (uit het starterspakket van de gebruiker, mijnrijlesplanner): technieken met vakterm, vaste normen en ontwerpregels. Gebruiken bij elke controle of nieuw scherm. |
| `docs/pilotlog.md` | **Fouten uit de pilot met oorzaak en patroon** (momentopname, opslaan, demo verbergt het, één persoon per rol, buiten de app, rommelige gegevens). Bij elke wijziging langs deze patronen lopen. |
| `docs/plan-van-aanpak.md` | **Van pilot naar product:** A product af (ook op schaal: 50 teams) → B beschrijven (handboek) → C prijs en groei → D verkopen → E invoeren. Met planning t/m januari 2027. |
| `docs/productie-en-groei.md` | Controlelijst, **Openstaand**, meerdere clubs, app of website, kosten. |
| `docs/techniek.md` | Opbouw van de echte versie (Supabase, Vercel, Brevo, migraties, e-mail, back-up). |
| `docs/presentaties/` | **Productoverzicht** "Wat kan ClubComm" (`maak.js product`, de bron voor pitch, demo en handleidingen) en PowerPoints per rol (bestuur, teamleider, ouders, trainer): handleiding én presentatie. Opnieuw maken: `shots*.js` (schermafbeeldingen uit de demo) en `maak.js`. Kennismaking voor een andere club: `shots-clubs.js`, dan `CONTACT_NAAM=… CONTACT_MAIL=… node docs/presentaties/maak.js clubs "Clubnaam"` → `uit/` (niet in git); PDF met `soffice --headless --convert-to pdf` (lettertype Carlito nodig). |
| `docs/onderzoek/` | Achtergrond: analyse clubproblemen, vergelijking Teamy en VeldPlanner, **app-analyse 26-09** (rapportcijfers en prioriteiten) , **beoordeling 27-09** (19 onderwerpen, advies op volgorde), **verdienmodel** (voorstel prijzen), **taken per rol** (HO tegenover coördinator, stappenplan eerste gesprek met een club) het **verbeterplan gebruik 17-10** (UX-audit en werkstromen, P0–P3) en het **amuletten-concept 19-10** (beloning DCG). Voorstellen, geen besluiten. Oudere onderzoeksstukken dragen de regel *Historisch onderzoeksdocument* (ook `docs/trainingsmodule*.md`). |
| `.claude/skills/` | Projectskills **app-design-architect** (UX-audit, ontwerp) en **app-workflow-optimizer** (taakstromen): gebruik ze bij elke analyse of herontwerp van schermen; analyse eerst, bouwen pas na akkoord. |

## De app
- `public/index.html` + `public/app/*.js`: één webapp voor de telefoon (vanilla JS, geen build), installeerbaar (manifest + `sw.js`).
  - `data.js`: demodata + rekenregels (aanwezigheid, kaarten per seizoen, zones, signalen, speeltijd, vaste taken). `opslag.js`: app-gegevens ↔ databaserijen. `core.js`: inloggen, kop, profiel, berichten, afmelden, planning aanpassen, privacy, feedback.
  - Schermen per rol: `ouder.js`, `trainer.js`, `teamleider.js`, `hjo.js` (ook clubbeheerder), `hjohome.js`; coördinator via `taken.js` (ook taken per rol en profielen).
  - `begeleiding.js`: het begeleidingsmoment (Besluit 99 deel 2): vijf fasen, A4-observatie (leertijd-klok, turven), vier vakken, delen en reflectie trainer, A4 leeg en ingevuld printen; Mijn ontwikkeling van de trainer staat in `trainers.js` (deel 3).
  - `trainers.js`: trainers begeleiden door de HO (Besluit 99): tabblad Trainers, traject, dossier, kennismaking trainer, VOG en diploma (coördinator), printen (`CC.printDoc`). Scopes `trainerzelf`, `trainerdossier`, `hoprive` (migratie 024; 025: ook de TC, notities per bouw). Besluit 100: rol `tc` (technisch coördinator), werkgebied `bouwen` bij de rol HO/TC (`CC.werkgebied`), pakket "Alleen Trainers begeleiden" (`club.pakket = 'trainers'`, `CC.pakketTrainers`).
  - **Formulieren (Besluit 103):** lange formulieren krijgen `data-autosave="naam"` en een functie `CC.autosave.naam(form)` die zonder opnieuw tekenen bewaart; de knop heet *Klaar*. Knopnamen zijn uniek (`CC.on`; bewuste vervanging met `{ vervangt: true }`, Besluit 102).
  - `opstelling.js`: eigen wisselschema (Besluit 106): opstelling 1-4-3-3, wissels, klok, minuten en posities; omgerekend naar blokken (`M.zelfAfleiden`). Speelvorm per team: `team.speelCat` (`M.wedCat`); keuze van de staf in `S.teamKeuze`.
  - `teamsbeheer.js`: teams, trainingsdagen en wedstrijden zelf beheren (Besluit 136): clubbeheerder (Seizoen) en HO (pakket Trainers begeleiden); trainingen pas bij een trainer (`CC.trainingenKlaarzetten`), wedstrijden plakken van voetbal.nl (`CC.wedLezen`), trainingsschema laden uit Excel/CSV (`CC.schemaLezen`); gebruikt het rooster uit `hjo.js` (`CC.rooster`).
  - `adres.js`: adres aanvullen via PDOK (velden met `data-adres`). `push.js`: pushmeldingen aanzetten en keuzes (Besluit 53); tonen in `sw.js`. `onderhoud.js`: foutregistratie en zelf verversen bij een nieuwe versie (`versie.json`, gemaakt door `versie-maken.js` bij elke publicatie; Besluit 63).
  - Modules: `autoberichten.js` (Communicatieplan, noodberichten, herinneringen activiteiten), `afwezig.js`, `trainerafw.js`, `beoordeling.js` (+ `gesprek.js`: voorbereiding en gesprekspagina ontwikkelgesprek), `materiaal.js`, `meehelpen.js`, `waardering.js`, `hjofilter.js`, `agenda.js`.
  - **Opleidingsprofielen (Besluit 123):** methodiek als gegevens, niet in de code. Opbouw en KNVB-standaard: `supabase/profielen/`; het DCG-profiel staat in de database (soort `profiel`); de app leest ze in `S.profielen` en schrijft ze nooit terug.
  - `training.js`: trainingsmodule (Besluit 128 t/m 138, module *Trainingen*): eigen vormen (`S.vormen`) en trainingen (`S.trainingsplannen`, scope `eigen`); tabblad *Training* van de trainer (`CC.trainingTab`) met Lijn · Plannen · Week · Vormen; **één oefenvormkiezer voor elke club** (Besluit 139: `advies`, `kvHtml`, *Ongedaan maken* via `CC.toast` met knop; regressietests in `tests/kiezer.spec.js`); catalogus oefenvormtypes in `app/vormtypes.js`; `periodisering.js`: methodiekblok, periodisering laden (CSV), observatiepunten en Mijn lijn (alleen als het profiel voetbalproblemen en leerniveaus heeft). Hoe lagen, voorwaarden en profielinhoud samenwerken: `docs/architectuur.md`. Tekentool zit in `index.html`.
  - `tekenen.html` (los, `/tekenen`): testscherm van de **tekentool** voor oefenvormen (`app/tekentool.js` + `.css`, overgenomen uit de ART-app); alleen op het toestel. Audit, voorstel en open vragen: `docs/trainingsmodule.md`.
  - `evaluatie.html` (los, `/evaluatie`): evaluatieformulier praktijkbegeleiding coach, gegevens alleen op het toestel, PDF via printen (Besluit 93).
  - `live.js`: echte versie (Supabase: inloggen met e-mailcode, laden, automatisch opslaan, beheer).
- **Demo:** online alleen `mijnclubcomm.nl/demo` met rondleiding voor besturen, **alleen op uitnodiging** (`demo.js`, tabel `demo_toegang`, Besluit 89). `?demo` werkt alleen nog lokaal (tests, schermafbeeldingen). Accounts: Sanne (ouder), Mark (trainer + ouder), Linda (teamleider + ouder), Peter (HJO + beheerder), Esther (coördinator). Democlub "VV De Voorbeeldclub", alleen verzonnen namen (geen echte clubs of adressen gebruiken!); staat in localStorage. De rondleiding is één verhaal met hoofdstukken die het bestuur kiest (Besluit 114); sommige stappen doen het echt (afmelden). Nieuwe of gewijzigde schermen: kijk of de rondleiding (`STAPPEN` in `demo.js`) nog klopt.

## Online
- App: https://mijnclubcomm.nl (domein bij Hostnet, DNS naar Vercel; oud adres clubcomm-nine.vercel.app werkt ook) — Vercel-project `clubcomm` (map `public`). Online zetten gaat vanzelf bij samenvoegen met `main` (zie hieronder).
- **Publiceren (vastgesteld 29-10, gecontroleerd in Vercel):** Vercel is gekoppeld aan GitHub. **Elke push naar `main` (dus elk samengevoegd pull request) gaat binnen een halve minuut vanzelf naar productie** (mijnclubcomm.nl), ook als alleen documenten veranderen (dan krijgt de app alleen een nieuw versienummer en ververst hij één keer). Een push naar een andere branch maakt alleen een voorbeeldversie (*preview*, achter de Vercel-login), nooit productie. Dus: **samenvoegen met `main` = publiceren**, en dat gebeurt alleen na akkoord van de gebruiker. Nooit `create_deployment` met target production voor een werkbranch; `create_deployment` alleen om `main` opnieuw te publiceren (bijvoorbeeld bij herstel). Na elke samenvoeging met `list_deployments` nagaan dat productie de commit van `main` draait. Opnieuw publiceren van `main`: Vercel `create_deployment` (project `clubcomm`, target production, gitSource github `sofianabayahya/Clubcomm`, ref `main`, zonder teamId).
- Supabase-project `pkvacwbdgumkffxnxnqk` (Frankfurt). Club-id `dcg`; account van de gebruiker: persoon `p-beheer`. Migraties: bestand in `supabase/migrations/` **en** toepassen met `apply_migration`. Eenmalige datawijzigingen: bestand in `supabase/scripts/` en uitvoeren met `execute_sql`. Edge Functions `melding` (e-mail via Brevo én pushmeldingen) en `automaat` (elk kwartier het automatische werk; `supabase/functions/automaat`, secrets `BREVO_API_KEY`, `AFZENDER_EMAIL`; push-sleutelpaar staat in tabel `push_sleutel`, alleen voor de server).
- E-mail: Brevo (inlogmail via SMTP, meldingen via API; gratis plan, 300 mails per dag). Afzender `noreply@mijnclubcomm.nl` ("ClubComm"). Claude kan via de Brevo-koppeling contacten en afzenders nakijken (o.a. of een adres op de blokkeerlijst staat), maar niet de bezorging van losse mails.

## Testen
- Lokaal: `npm install && npm start` → http://localhost:5000/?demo (of `cd public && python3 -m http.server 5050`).
- Zonder netwerk naar Supabase: `supabase/tests/fake-supabase.js` (nagebootste client, code 123456); rechten per rol: **`select * from priv.rechtentest() where not ok;`** (Besluit 119, migratie 030: 32 controles tegen de echte regels, alles wordt teruggedraaid; draait ook elke nacht, alarm via `rpc/gezondheid`). Wijzig je rechten of komt er een nieuwe soort gegevens bij: controle erbij en test draaien vóór het online gaat. (Het oude `rls_test.sql` is vervangen.)
- **Altijd ook de echte, bijna lege club testen** (teamnaam ≠ teamcode, weinig spelers, geen telefoonnummers), niet alleen de demo.
- **Automatische tests (Besluit 88):** `npm test` (map `tests/`: servermotor + elke rol doorklikken in demo én kleine nagebootste club + afmelden/rooster + **verwijzingen**: elk pad tussen backticks in de documenten en elk vast pad in scripts en tests moet bestaan, `tests/verwijzingen.test.mjs`; een bewust oud pad krijgt *tot 29-10*, *vervallen*, *niet gemaakt* of *gebouwd als* in dezelfde regel). Draaien ook vanzelf op GitHub (Actions "Tests"); **rood = niet samenvoegen met main**. Nieuwe functie of gevonden fout → test erbij. Lokaal met Chromium uit `/opt/pw-browsers` (niet `playwright install`).
- **Bewaking:** UptimeRobot op mijnclubcomm.nl en op `rpc/gezondheid` (automaat laatste 35 min gedraaid; migratie 022).

## Bekende beperkingen
- Automatisch werk (berichten, uitslag, gesprekken) doet de server elk kwartier (Edge Function `automaat`, Besluit 77) met dezelfde regels als de app; nachtrust 21:00–07:30. Wijzig je regels in `public/app/*.js`, dan draait de server na publicatie mee. Logboek: tabel `automaat_log`.
- Agenda-abonnement werkt pas met een eigen domein (in de echte versie verborgen).
- Het logo-blauw (#0d88f9) is lichter dan de app-kleur (#0869c2, gekozen voor contrast).
