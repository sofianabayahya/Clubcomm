# ClubComm — Controlelijst productie en groei

> **Openstaand — hier kijken bij de vraag "wat zijn de volgende stappen?"**
> *Vóór de ouders erbij komen:* ~~database leegmaken en O12 talententeam inrichten~~ ✅ 25-09 (Besluit 38) → ~~wisselschema instelbaar en zelf aan te passen~~ ✅ 25-09 (Besluit 39) → ~~domein mijnclubcomm.nl koppelen~~ ✅ 25-09 (links in e-mails en inlogmail op mijnclubcomm.nl) → ~~kind van de initiatiefnemer in het team zetten~~ ✅ 25-09 → ~~e-mail vanaf eigen domein~~ ✅ 25-09 (noreply@mijnclubcomm.nl via Brevo, DKIM/DMARC; nog: inlogcode op 6 cijfers zetten in Supabase; let op: Brevo zet een afmeldknop in elke mail, wie tikt komt op de blokkeerlijst en krijgt ook geen inlogcode meer → in Brevo deblokkeren; in handleidingen noemen) → eerste teamleider: appbericht + handleiding teamleider, aanmelden via teamuitnodiging, rol teamleider geven (Teams → Staf) · trainers/teamleiders zonder kind: Teams → Staf → Staflid toevoegen (Besluit 42) → privacycontact invullen (Regels → Privacy) → toestemming bestuur (presentatie klaar: `docs/presentaties/ClubComm-bestuur.pptx`) → teksten voor teamleiders en ouders (handleidingen klaar: `docs/presentaties/`, nog: appbericht aan de eerste teamleider) → testen op echte telefoons.
> *Uit de app-analyse van 26-09 (`docs/onderzoek/app-analyse-2026-09.md`), eerst:* ~~"Club leegmaken"/"Voorbeelddata laden" weg~~ ✅ · ~~contrast en tekstgrootte~~ ✅ · ~~app ververst zelf~~ ✅ · ~~foutregistratie~~ ✅ (26-09, Besluit 63) · generale repetitie wedstrijddag vóór de eerste oefenwedstrijd · testscripts in het project · Regels/Rollen/Inzicht opdelen · tabbladen gelijk trekken tussen rollen.
> *Ontwikkelgesprekken (Besluit 67–68):* startgesprekken plannen (periode t/m 10 okt; 16 × 15 min ≈ 4 gesprekken na 4 trainingen; trainer vult vooraf niets in) · vóór het voorjaar per kind wapen en werkpunt · handleiding ouders en trainer aanvullen met de opdracht voor het kind en de gesprekspagina.
> *Privacy:* ~~bewaartermijn ontwikkelverslagen~~ ✅ zolang het kind lid is (Besluit 72; nog opnemen in de privacyverklaring) · later eigen account voor kinderen vanaf O13 (speler zelf centraal).
> *Later in de pilot:* ~~nieuwe handleidingen per rol~~ ✅ 25-09 (bestuur, teamleider, ouders, trainer; eerst als handleiding sturen, presenteren als dat niet werkt) · fouten automatisch vastleggen · Content-Security-Policy · gebruikerstest met 3–5 ouders · welkomstuitleg bij eerste keer inloggen · agenda-koppeling (heeft domein nodig).
> *Vóór een tweede club:* merknaam checken (clubcomm.nl/.com/.app zijn bezet; mijnclubcomm.nl ✅) · inlogmail via een dienst zonder afmeldknop (of Brevo Enterprise) · testomgeving, automatische tests (GitHub Actions), uptime-bewaking · Supabase Pro, Vercel Pro · automatische berichten vanaf de server (pg_cron, = pushmeldingen stap 2) · ~~pushmeldingen stap 1~~ ✅ 25-09 (Besluit 53) · live verversen met Supabase Realtime en alleen wijzigingen ophalen (Besluit 48; nu elke 30 s) · club-wizard, meerdere clubs per persoon, Sportlink/voetbal.nl-import · verwerkersovereenkomsten, DPIA, bewaartermijnen automatisch, account verwijderen automatisch vanaf de server (nu verzoek aan beheerder, Besluit 54) · toegankelijkheid (WCAG) · twee beheerders per club, logboek, rate limiting.
> *Later:* store-app (Capacitor), huiswerk en filmpjes, fondsenwerving, weekbericht.

*Opgesteld 25 september 2026, na de beveiligingscontrole. Denk als appontwikkelaar: wat moet er nog gebeuren voor de pilot, voor een tweede club, en voor de lange termijn?*

Legenda: ✅ gedaan · ⚠️ nodig vóór of tijdens de pilot · 🔜 nodig vóór een tweede club · 💡 later

## 1. Stand van zaken
- **Techniek:** webapp (HTML/JavaScript, geen build) op **Vercel**; database, inloggen en serverfuncties op **Supabase** (regio **Frankfurt, EU**); e-mail via **Brevo** (Frankrijk, EU).
- **Beveiliging:** rechten per rol in de database (RLS) ✅, getest per rol ✅, beveiligingscontrole Supabase ✅, inloggen zonder wachtwoord ✅, beveiligingsheaders ✅.
- **Werking:** alle schermen per rol getest in de demo (Playwright) ✅, e-mail getest ✅.

## 2. Controlepunten van een appontwikkelaar

### Werkt alles?
| Punt | Status | Toelichting |
|---|---|---|
| Automatische tests voor alle rollen | ⚠️ | De testscripts bestaan, maar staan nog niet in het project. Opnemen en vóór elke publicatie draaien. |
| Testen op echte telefoons (iPhone/Safari en Android/Chrome) | ⚠️ | In week 1 met jou en de teamleiders; ook op een trage verbinding. |
| Een lege club (zonder voorbeelddata) | ✅ 25-09 | Alle schermen van alle rollen doorgelopen met de echte, lege club; drie fouten gevonden en opgelost (Besluit 38). |
| Twee mensen tegelijk (bijv. twee teamleiders) | ⚠️ | Opslaan per rij voorkomt de meeste botsingen; in de pilot extra op letten. |
| Foutmeldingen opvangen | 🔜 (later in de pilot) | Nu zie je een fout alleen op het scherm van de gebruiker. Fouten automatisch laten vastleggen (tabel in Supabase of een dienst als Sentry). |
| Feedbackknop in de app | ✅ 25-09 | "Er klopt iets niet / idee" → komt bij jou binnen. Belangrijk om van de pilot te leren. |

### Gebruiksvriendelijkheid
| Punt | Status | Toelichting |
|---|---|---|
| Vaste ontwerpregels (Besluit 30, 34) | ✅ | Actie eerst, één blok per onderwerp, informatie is geen taak. |
| Gebruikerstest | ⚠️ | Kijk mee met 3–5 ouders bij de eerste keer inloggen en afmelden (zonder te helpen). Wat gaat mis? |
| Eerste keer inloggen (uitleg) | ⚠️ | Korte welkomst met 3 tips (afmelden, vervoer, taken). |
| "App op je beginscherm" | ✅ 25-09 | Manifest, app-icoon en service worker; op Android een knop "ClubComm installeren". |

### Design en toegankelijkheid
| Punt | Status | Toelichting |
|---|---|---|
| Eén set icoontjes, kleuren met betekenis, donkere modus | ✅ | |
| Contrast en lettergrootte (WCAG AA) | 🔜 | Eén keer laten doormeten met een toegankelijkheidstool. |
| Grote tikvlakken, schermlezer-labels | 🔜 | Grotendeels aanwezig; controleren. |
| Logo-kleur en app-kleur gelijk trekken | 💡 | Het logo-blauw is lichter dan de app-kleur. |

### Snelheid
| Punt | Status | Toelichting |
|---|---|---|
| Laadtijd | ✅ voor de pilot | ± 400 kB JavaScript, geen verkleining. Prima voor één team. |
| Alle clubgegevens in één keer laden | 🔜 | Wat je mag zien, wordt in één keer geladen. Bij een grote club (500+ spelers) per team/seizoen laden. |

### Beveiliging (aanvullend)
| Punt | Status | Toelichting |
|---|---|---|
| Content-Security-Policy (welke scripts mogen draaien) | 🔜 (later in de pilot) | Extra bescherming tegen misbruik; kleine aanpassing in `vercel.json`. |
| Misbruik van aanmelden (spam) | 🔜 | Maximaal aantal aanmeldingen per uur. |
| Twee beheerders per club | 🔜 | Als jij er niet bent, moet iemand anders kunnen beheren. |
| Wie heeft wat gewijzigd (logboek) | 🔜 | Elke rij heeft al een veld "door"; een echt logboek voor gevoelige zaken (kaarten, gesprekken). |

### Back-ups en betrouwbaarheid
| Punt | Status | Toelichting |
|---|---|---|
| Back-ups | ✅ 25-09 | Supabase Pro (sinds 25-09): elke dag een back-up buiten de database, 7 dagen terug te zetten; het project pauzeert niet meer. Daarnaast elke zondag 02:00 een kopie in het schema `backup` (8 weken) + knop "Back-up downloaden". |
| Supabase pauzeert na 7 dagen zonder gebruik | ✅ 25-09 | Opgelost met Supabase Pro. |
| Bewaking of de site werkt (uptime) | 🔜 | Gratis dienst (bijv. UptimeRobot) die je mailt als de app plat ligt. |
| Aparte testomgeving (niet in de echte database testen) | 🔜 | Tweede Supabase-project + Vercel-preview. Nu testen we in de echte database. |
| Automatische berichten vanaf de server | 🔜 | Nu gaan ze uit zodra een beheerder of staflid de app opent; later elke ochtend vanzelf (pg_cron). |

### Privacy (AVG) — extra belangrijk omdat het om kinderen gaat
| Punt | Status | Toelichting |
|---|---|---|
| Gegevens in de EU | ✅ | Supabase Frankfurt, Brevo Frankrijk. Vercel levert alleen de pagina (geen persoonsgegevens). |
| Account verwijderen / uitschrijven | ✅ | Besluit 14. |
| Privacytekst in de app + akkoord bij aanmelden | ✅ 25-09 | Privacyverklaring in de app; aanmelden kan alleen met akkoord, het moment wordt vastgelegd. Contactadres instellen bij Regels → Privacy. |
| Toestemming van het bestuur voor de pilot | ⚠️ | De club is verantwoordelijk voor de gegevens. |
| Bewaartermijnen (automatisch opschonen) | 🔜 | Besluit 32: details na de teamindeling van het volgende seizoen verwijderen. |
| Verwerkersovereenkomsten | 🔜 | Met Supabase, Vercel en Brevo (standaard online te accepteren) én tussen jou (ClubComm) en elke club. |
| DPIA (risicoanalyse) | 🔜 | Aan te raden: gegevens over kinderen en over gedrag (kaarten). |

### Onderhoud en code
| Punt | Status | Toelichting |
|---|---|---|
| Versiebeheer (GitHub) en documentatie (besluiten, techniek) | ✅ | |
| Automatisch testen bij elke wijziging (GitHub Actions) | 🔜 | |
| Codebasis voor de lange termijn | 🔜 | De prototype-opzet (losse scripts, één tabel met JSON) is prima voor de pilot. Voor meerdere clubs: overstappen naar een opzet met TypeScript en losse tabellen (bijv. Next.js, zoals gepland). |

## 3. Zijn Vercel, Supabase en Brevo genoeg?
**Voor de pilot: ja.** Samen doen ze alles: website, database, inloggen, serverfuncties en e-mail. Kosten nu: € 0.

**Let op de voorwaarden zodra het groter of betaald wordt:**
| Dienst | Gratis | Wanneer overstappen | Kosten |
|---|---|---|---|
| Vercel | alleen niet-commercieel gebruik | zodra clubs gaan betalen | Pro ± $20/maand |
| Supabase | pauzeert na 7 dagen zonder gebruik; geen back-ups | bij de tweede club (of eerder voor back-ups) | Pro ± $25/maand |
| Brevo | 300 e-mails per dag | bij meerdere clubs | ± €9–19/maand |
| Domeinnaam | – | vóór de tweede club | ± €10/jaar |
| Foutmeldingen (Sentry) en bewaking (UptimeRobot) | gratis varianten volstaan | – | €0 |
| App Store / Play Store | – | alleen als je een store-app wilt | €99/jaar + $25 eenmalig |

## 4. App of website?
| Optie | Wat | Voordelen | Nadelen |
|---|---|---|---|
| **A. Web-app (PWA)** — nu | De huidige site, te installeren op het beginscherm, met pushmeldingen | Eén versie, direct bijwerken, geen store, geen kosten | Ouders kennen "download de app"; pushmeldingen op iPhone alleen als de app op het beginscherm staat |
| **B. Dezelfde app in de App Store en Play Store** (Capacitor) | De web-app verpakt als echte app | Vindbaar, vertrouwd, betrouwbare pushmeldingen | Kosten, keuring door Apple/Google, elke update via de store |
| **C. Volledig eigen app** (React Native/Flutter) | Opnieuw bouwen | Maximale mogelijkheden | Duur en niet nodig |

**Advies:** pilot als **web-app (A)** en die nu installeerbaar maken (manifest, app-icoon, service worker; daarna pushmeldingen). Overstappen naar **B** als ouders het echt missen of bij de eerste betalende clubs. Spond en Teamy zijn store-apps; vroeg of laat verwachten clubs dat ook.

## 5. Meerdere clubs
**Wat er al is:** elke rij in de database heeft een `club_id`, en de rechten zijn per club gescheiden ✅. Clubnaam, sportpark, seizoen, vakanties, regels, profielen en het communicatieplan zijn per club in te stellen ✅.

**Wat er nog moet komen:**
1. **Een club aanmelden:** een wizard (clubnaam, logo en kleur, sportpark, regio voor de vakanties, seizoen, eerste beheerder). De eerste clubs kun je ook met de hand inrichten.
2. **Eén persoon bij meerdere clubs:** bijv. een ouder met kinderen bij twee clubs, of een trainer die ook bij een andere club zit. Nu hoort een account bij één club; nodig: meerdere koppelingen en een clubwisselaar.
3. **Teams en spelers importeren uit Sportlink** (de ledenadministratie van de KNVB) en het wedstrijdprogramma uit voetbal.nl. Scheelt clubs enorm veel werk.
   *Uitwerking (voorstel 25-09, nog geen besluit):* de club uploadt een Excel-export uit Sportlink (HJO → Teams → Spelers importeren, met voorbeeld vóór opslaan en kolommen kiezen bij de eerste keer). Alleen naam, team, bondsnummer (vast kenmerk), geboortekwartaal en e-mail van de ouder. Koppelen: (1) ouder logt in met het e-mailadres uit Sportlink → direct gekoppeld, geen goedkeuring; (2) ander adres → teamlink, de app herkent het kind en de teamleider bevestigt alleen "is dit de ouder van …?"; (3) geen e-mail → teamlink zoals nu. Opnieuw uploaden vergelijkt op bondsnummer: nieuw erbij, teamwissel met geschiedenis, gestopt uit het team. Voordeel: het team is vanaf dag één compleet en "kinderen zonder ouder in de app" is zichtbaar. Vereist verwerkersovereenkomst club–ClubComm. Nodig om te bouwen: de kolomnamen van een Sportlink-export (zonder echte gegevens).
4. **Eigen uitstraling per club:** logo, kleur en afzendernaam in de e-mails ("RKSV DCG via ClubComm").
5. **Beheeromgeving voor jou:** overzicht van clubs, gebruik, support.
6. **Zaken:** prijs per club per jaar, betalen (bijv. Mollie), contract en verwerkersovereenkomst.

## 6. Stappenplan
**Deze week (vóór de ouders erbij komen)**
1. ✅ App installeerbaar maken (manifest + icoon + service worker).
2. ✅ Feedbackknop in de app.
3. ✅ Privacytekst + akkoord bij aanmelden. Nog: toestemming van het bestuur en het privacycontact invullen.
4. ✅ Wekelijkse back-up + downloadknop.
5. ✅ Club leeggemaakt en O12 talententeam ingericht, lege-club-check gedaan. Nog: testen op echte telefoons (jij + teamleiders).

**Later in de pilot:** foutmeldingen automatisch vastleggen · Content-Security-Policy.

**Tijdens de pilot (8 weken)**
- Gebruikerstest met 3–5 ouders; elke week de feedback doorlopen; bijhouden hoeveel afmeldingen via de app gaan.

**Na de pilot, vóór de tweede club**
- Domeinnaam (naam eerst checken bij het merkenregister) + e-mail vanaf het eigen domein.
- Testomgeving, automatische tests, uptime-bewaking.
- Supabase Pro en Vercel Pro; automatische berichten vanaf de server; pushmeldingen.
- Club-wizard, meerdere clubs per persoon, Sportlink-import.
- Verwerkersovereenkomst, DPIA, bewaartermijnen.

**Later**
- Store-app, huiswerk en filmpjes, fondsenwerving, weekbericht.
