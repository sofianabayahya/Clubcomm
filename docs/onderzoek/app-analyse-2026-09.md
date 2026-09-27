# ClubComm — App-analyse (26 september 2026)

Een volledige doorlichting zoals een app-ontwikkelaar die zou doen, na de eerste pilotdag bij RKSV DCG.
Gemeten, niet geschat: alle schermen van alle rollen doorgelopen (demo en de echte club), contrast berekend,
tikdoelen en tekstgroottes gemeten, de database-adviezen van Supabase opgevraagd en de code nagelopen.
Dit is een **analyse met voorstellen**, geen besluit. Wat we oppakken, gaat als besluit naar `besluiten.md`.

**Stand van de pilot (26-09):** 17 volwassenen gekoppeld, 15 spelers, 4 telefoons met pushmeldingen, 24 berichten, geen open aanmeldingen.

## Samenvatting: rapportcijfers

| Onderdeel | Cijfer | In één zin |
|---|---|---|
| Functie (doet het wat het moet doen?) | 8 | Afmelden, aanwezigheid, berichten, push en speeltijd werken; wedstrijden nog niet in het echt gebruikt. |
| Gebruiksgemak ouder | 8 | Kort en duidelijk; Home, afmelden en berichten zijn sterk. |
| Gebruiksgemak trainer/teamleider | 7,5 | Goed op de dag zelf; spelerspagina en berichten net verbeterd. |
| Gebruiksgemak HJO/beheerder | 6 | Veel instellingen op lange pagina's (Regels 4,4 schermen, Rollen 80 knoppen). |
| Overzichtelijkheid / samenhang tussen rollen | 7 | Zelfde gegevens overal gelijk, maar tabbladen heten en staan per rol anders. |
| Toegankelijkheid (lezen, tikken, contrast) | 5,5 | Te kleine tekst en te weinig contrast voor blauw/groen/oranje tekst. |
| Betrouwbaarheid en opslag | 7 | Opslaan en berichten nu veilig; nog geen foutregistratie en geen automatische tests. |
| Beveiliging en privacy | 7,5 | Rechten per rol in de database goed; wel een gevaarlijke knop en open privacytaken. |
| Snelheid en groei naar meer clubs | 6 | Voor één team prima; bij een hele club te zwaar (alles elke 30 s opnieuw laden). |
| Onderhoudbaarheid van de code | 5,5 | Werkt, maar veel "over elkaar heen geschreven" onderdelen; twee keer al naamsbotsingen. |

## 1. Functie
**Sterk:** afmelden met reden, kaarten en signalen, aanwezigheid, gesprekken, pushmeldingen (getest op een echte iPhone), wisselschema met KNVB-speelduur, scorebord, aanmelden met dubbele-check.

**Nog niet echt gebruikt (grootste risico):** wedstrijden, vervoer, taken (timekeeper, trainer-coach), wisselschema en scorebord. Die zijn alleen in de demo getest.
- **Voorstel:** een **generale repetitie** vóór de eerste oefenwedstrijd: één wedstrijd in de echte club, met jij als trainer, een teamleider en twee ouders (vervoer + timekeeper), van oproep tot uitslag.

**Ontbreekt nog (bekend, staat op Openstaand):** automatische berichten vanaf de server, account verwijderen automatisch, zoeken, geboortejaar/kwartaal, Sportlink-import.

## 2. Gebruiksgemak en overzichtelijkheid
Gemeten per scherm (telefoon 390 × 844):

| Scherm | Lengte (schermen) | Knoppen | Opmerking |
|---|---|---|---|
| Ouder: Home, Berichten, Vervoer | 1–1,1 | 5–12 | Goed: alles in één scherm. |
| Trainer: Aanwezigheid | 1,4 | 26 | Goed; wel 20 stukjes tekst kleiner dan 12 px. |
| Teamleider: Team | 1,8 | 33 | Druk; kleine knop "Nu vernieuwen". |
| HJO: Inzicht | 4,6 | 35 | Lang; 7 blokken onder elkaar. |
| Beheerder: Regels | 4,4 | 38 | Lang; 11 blokken instellingen op één pagina. |
| Beheerder: Rollen | 4,1 | 80 | Zeer veel schakelaars op één pagina. |

**Voorstellen**
1. **Regels en Rollen opdelen** in onderwerpen die je openklikt (Afmelden · Kaarten · Speeltijd · Berichten · Privacy). Standaard dicht, met een samenvatting ("Afmelden: 24 uur vooraf").
2. **Inzicht** (HJO): bovenaan 3 cijfers en "wat vraagt aandacht"; de rest ingeklapt.
3. **Tabbladen gelijk trekken tussen rollen:** Home altijd eerst, Berichten altijd op dezelfde plek (nu 3e, 4e of 5e). "Spelers" (trainer) en "Team" (teamleider) zijn bijna hetzelfde: één naam kiezen.
4. **Eén manier van "terug" en "opslaan"**: sommige instellingen slaan meteen op, andere met een knop. Kiezen: overal meteen, met een melding "Opgeslagen".

## 3. Toegankelijkheid (lezen en tikken)
- **Contrast** (norm WCAG: 4,5 voor gewone tekst):
  - grijze tekst 5,1 ✅ · rode tekst 4,5 ✅ · donkere tekst 14 ✅
  - **blauwe tekst 3,3–3,6 ❌**, **groene 3,1 ❌**, **oranje 3,0 ❌**. Ook **witte tekst op de blauwe knoppen: 3,6 ❌**.
  - **Voorstel:** voor tekst en knoppen een iets donkerder blauw (#0a6fcc, staat al klaar als `--blauw-d`), groen en oranje. Het logo-blauw blijft voor vlakken en iconen. Dit lost meteen "het logo-blauw is lichter dan de app-kleur" op.
- **Tekst kleiner dan 12 px:** 20× bij Aanwezigheid, 22× bij HJO Teams, 12× bij Planning (ouder). **Voorstel:** minimaal 12 px, liever 13.
- **Kleine tikdoelen (< 32 px):** "Dank je!", "Nu vernieuwen", "Toch niet", invulvelden bij beheer. **Voorstel:** minimaal 44 px hoog (richtlijn Apple).
- Ouders lezen op het veld, in de zon en met haast: contrast en grootte tellen daar dubbel.

## 4. Samenhang tussen de dashboards
**Goed:** alle rollen lezen uit één bron; een afmelding van een ouder staat binnen 30 s bij trainer, teamleider en HJO; berichten, aanmeldingen en "wacht op jou" zijn nu gelijk voor iedereen.
**Aandachtspunten:**
- **Dubbele plekken voor dezelfde actie:** aanmeldingen goedkeuren kan bij trainer Home, trainer Spelers en teamleider. Dat is bewust (Besluit 47), maar zet overal dezelfde tekst en knop.
- **Wie heeft wat gedaan?** Bij twee teamleiders ziet de één niet altijd dat de ander iets al deed (bijv. vervoer ingedeeld). **Voorstel:** "door Dorothee, 14:02" bij acties, zoals nu al bij berichten ("beantwoord door").
- **Rolwissel:** jij hebt 4 rollen. Wisselen gaat via het profiel. **Voorstel:** op Home van de ouder-rol een kleine regel "Je bent ook trainer: naar trainer" als daar iets openstaat.

## 5. Betrouwbaarheid
- **Goed:** opslaan meteen bij wegvegen, berichten via veilige databasefunctie, dubbele aanmeldingen tegengehouden, back-up elke zondag.
- **Ontbreekt:**
  1. **Foutregistratie:** gaat er bij een ouder iets mis, dan weten we dat alleen als die het meldt. **Voorstel:** fouten automatisch in een tabel in Supabase zetten (klein werk, groot nut).
  2. **Automatische tests in het project:** de testscripts (39 schermen, lege club, gesprek, scorebord) staan nu alleen in mijn werkmap. **Voorstel:** opnemen in het project en draaien vóór elke publicatie.
  3. **Nieuwe versie zonder app te sluiten:** ouders zien pas een verbetering als ze de app helemaal afsluiten. **Voorstel:** de app controleert zelf op een nieuwe versie en ververst bij openen.
  4. **Tegelijk wijzigen:** voor berichten opgelost; voor planning, vervoer en taken wint nog de laatste.

## 6. Beveiliging en privacy
- **Goed:** rechten per rol in de database (RLS), getest; database-functies controleren zelf wie iets mag; geheime sleutels alleen op de server; pushsleutel verlaat de server niet.
- **Supabase-adviezen:** geen echte problemen (tabellen zonder regels zijn bewust alleen voor de server; de functies zijn beveiligd). Klein: een ongebruikte index, back-uptabellen zonder sleutel.
- **Risico nu:** **"Club leegmaken" en "Voorbeelddata laden"** staan nog op de Home van de beheerder in de echte versie. Eén verkeerde tik wist alle ouders, spelers en berichten (terug kan alleen met de back-up van zondag). **Voorstel: direct weghalen** of achter een extra slot (typ "DCG LEEGMAKEN").
- **Privacy open:** verwerkersovereenkomsten (Supabase, Vercel, Brevo), DPIA, bewaartermijnen automatisch, privacycontactpersoon invullen, account verwijderen automatisch.

## 7. Snelheid en groei
- **Nu:** app ± 820 kB code (gecomprimeerd veel minder), 206 regels data (± 40 kB). Laadt snel.
- **Bij een hele club (± 30 teams):** ± 6.000+ regels, elke 30 s helemaal opnieuw laden → traag en duur. **Voorstel (vóór een tweede club):** alleen wijzigingen ophalen + Supabase Realtime (staat op Openstaand).
- **QR-code-bibliotheek (57 kB)** laadt voor iedereen, terwijl alleen de teamleider hem gebruikt. **Voorstel:** alleen laden als het nodig is.

## 8. Onderhoudbaarheid (voor later, onzichtbaar voor gebruikers)
- `core.js` is 99 kB; 20 plekken waar een module een functie van een ander "overschrijft". Twee keer ging dat al mis (knopnaam "intrekken", filterbalk op twee plekken).
- **Voorstel:** een lijst met alle knopnamen die bij het starten controleert op dubbele namen (waarschuwing in de console), en bij groei de grote bestanden opsplitsen.

## Prioriteiten

**Nu (deze week, klein werk, groot effect)**
1. "Club leegmaken" en "Voorbeelddata laden" weg uit de echte versie.
2. Contrast en tekstgrootte: donkerder blauw/groen/oranje voor tekst en knoppen, minimaal 12 px, tikdoelen 44 px.
3. App ververst zelf bij een nieuwe versie.
4. Foutregistratie in Supabase.

**Vóór de eerste oefenwedstrijd**
5. Generale repetitie wedstrijddag (oproep, vervoer, taken, wisselschema, scorebord, uitslag).
6. Testscripts in het project, draaien vóór elke publicatie.

**Tijdens de pilot**
7. Regels, Rollen en Inzicht opdelen in openklikbare onderwerpen.
8. Tabbladen gelijk trekken tussen rollen; "door wie" bij acties.
9. Automatische berichten vanaf de server.

**Vóór een tweede club**
10. Alleen wijzigingen ophalen + Realtime; privacydocumenten; code opsplitsen.
