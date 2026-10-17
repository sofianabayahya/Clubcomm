# Verbeterplan gebruiksgemak, werkstromen en vormgeving (17 oktober 2026)

**Status: alleen analyse; geen code aangepast.** Voorstel, geen besluit.

*Gemaakt met de skills **App Design Architect** (UX-audit, scores, P0–P3, ontwerpbesluit) en **App Workflow Optimizer** (taakstromen, huidige en nieuwe flow, impact × frequentie × inspanning × risico). Beide staan in `.claude/skills/`. Getoetst aan principe 10 en de vuistregels van Besluit 30 en 34, de Afgewezen ideeën (niets afgewezens opnieuw voorgesteld) en de pilotlog. Bouwt voort op de app-analyse van 26-09 en de beoordeling van 27-09.*

**Bewijslabels:** **Gezien** = in de demo gemeten of op een schermafbeelding gezien · **Afgeleid** = uit de code gehaald · **Nog te valideren** = verwachting; pas zeker na gebruik door echte mensen. Aantallen handelingen zijn geteld in de demo. Tijdwinst is niet gemeten; doelen zijn doelen, geen gemeten resultaten. Dit is een expert-review, geen gebruikerstest.

---

## 1. Kernobservatie
**De gebruiker verliest geen tijd bij de dagelijkse taken (afmelden, aanwezigheid, vervoer, begeleiding plannen), maar wel bij drie dingen:**
1. **Werk kan verloren gaan.** Lange formulieren slaan per blok op met een eigen knop. Een tik op een andere knop of naast een venster wist wat je typte. Dat is het patroon "opslaan" uit de pilotlog. *(Afgeleid, P0)*
2. **Het dringendste staat niet altijd bovenaan.** Op de Home van de HO staat *"Trainer kan niet: O9-1 morgen 17:00 · nog geen vervanger"* onderaan, ná de rapporten. *(Gezien, P1)*
3. **Beheerschermen zijn te lang en te klein om op te tikken.** Clubbeheerder → Rollen: 7,2 schermhoogtes, 131 knoppen en velden, 71 tikvakken kleiner dan 40 px. Juist daar voeg je bij Swift trainers toe. *(Gezien, P1)*

## 2. Context en aannames
- **Branche:** jeugdvoetbal, vrijwilligers. **Apparaat:** vooral de telefoon, deels langs het veld (buiten, haast, één hand). Clubbeheer soms op een laptop. *(Aanname, past bij de pilot)*
- **Rollen en kerntaken** ("Wanneer …, wil ik …, zodat …"):

| Rol | Kerntaak 1 | Kerntaak 2 | Kerntaak 3 |
|---|---|---|---|
| Ouder | Wanneer mijn kind niet kan, wil ik snel afmelden, zodat de trainer het weet | Wanneer er een uitwedstrijd is, wil ik vervoer regelen | Wanneer er een bericht is, wil ik het lezen en reageren |
| Trainer | Wanneer de training begint, wil ik zien wie komt en aanwezigheid opnemen | Wanneer iemand aandacht vraagt, wil ik contact leggen en vastleggen | Wanneer ik begeleid word, wil ik de vragenlijst invullen en reflecteren |
| Teamleider | Wanneer een ouder zich aanmeldt, wil ik goedkeuren | Wanneer er een wedstrijd is, wil ik taken en vervoer rond hebben | Wanneer ouders ontbreken, wil ik ze uitnodigen |
| HO / TC | Wanneer ik een trainer begeleid, wil ik een moment plannen en observeren | Wanneer iets misgaat (trainer kan niet), wil ik het meteen zien en oplossen | Wanneer ik overzicht wil, wil ik zien welke trainers aandacht vragen |
| Clubbeheerder | Wanneer er een nieuwe trainer is, wil ik die toevoegen met de juiste rol | Wanneer het seizoen begint, wil ik vakanties en regels instellen | Wanneer iemand vertrekt, wil ik de rol weghalen |

## 3. UX-scores (1 = zwak, 5 = sterk)
| Onderdeel | Score | Waarom | Bewijs |
|---|---|---|---|
| Vindbaarheid | 4 | Vaste tabbladen per rol; Actie nodig bovenaan. Minpunt: *Persoon toevoegen* zit diep in Rollen. | Gezien |
| Taakefficiëntie | 4 | Afmelden 3 tikken, plannen 2 tikken. Minpunt: rol wisselen kost 2 tikken en je verliest je plek. | Gezien |
| Informatiestructuur | 3 | HJO en HO door elkaar; Inzicht en Regels hebben 8 tot 13 blokken onder elkaar. | Gezien |
| Visuele hiërarchie | 3 | Meestal goed. Dringende zaken van de HO staan onderaan; bij de trainer staat rood tussen oranje. | Gezien |
| Consistentie | 3 | Tot 6 knopstijlen op één scherm; elk blok een eigen *Opslaan*. | Gezien |
| Formulieren | 2 | Invoer gaat verloren bij een andere tik of bij sluiten; geen "bewaard"-melding. | Afgeleid |
| Toegankelijkheid | 3 | Contrast en tekstgrootte goed (bijna geen tekst < 12 px). Veel kleine tikvakken op beheerschermen. | Gezien |
| Responsiviteit | 4 | Gemaakt voor de telefoon; print-A4 apart. Laptop niet bekeken. | Gezien (telefoon) |
| Foutpreventie | 4 | Bevestigen bij rollen en uitschrijven; serverrechten (RLS). Minpunt: geen controle op dubbele interne knopnamen (fout van 10-10). | Afgeleid |
| Snelheid en feedback | 4 | Toasts, automatisch verversen dat pauzeert tijdens typen. Minpunt: geen "bewaard"-status bij lange velden. | Afgeleid |

## 4. Flow-audit: huidige flow → probleem → nieuwe flow → voordeel
| Taak (rol) | Huidige flow | Probleem | Nieuwe flow | Voordeel |
|---|---|---|---|---|
| Afmelden (ouder) | Home → Afmelden → reden → bevestigen (3) | Geen | Zo laten | — |
| Aanwezigheid (trainer) | Tab Aanwezigheid → per speler tikken | Geen; bovenaan staat uitleg als het nog niet kan | Zo laten | — |
| Vervoer (ouder) | Tab Vervoer → *Kan met mij mee* (1) | Geen | Zo laten | — |
| Begeleiding plannen (HO/TC) | Trainers → *Training · plannen* → training kiezen (2) | Geen | Zo laten | — |
| Observeren op het veld (HO/TC) | Trainers → kaart → moment → *Observeren* (3) | Op het veld met haast: drie schermen | Op de dag zelf staat bovenaan Home **"Observeren: Acevit · 17:00 · veld 2"** (1) | 2 tikken minder, op het moment dat het telt |
| Reflectiegesprek en nazorg (HO/TC) | Fase openen → typen → *Opslaan*, per fase | Tik je eerst op een andere knop, dan is de tekst weg | Elk veld **bewaart zelf** bij verlaten, met "Bewaard ✓"; *Opslaan* wordt *Klaar* | Geen verlies van werk |
| Vragenlijst invullen (trainer) | Home → regel → venster met 4–9 vragen → *Opslaan* | Naast het venster tikken sluit alles; de tekst is weg | Concept bewaart zelf; bij sluiten met tekst: *"Bewaard. Later verder?"*; voortgang *"3 van 8"* | Minder afhakers, geen dubbel werk |
| Trainer toevoegen (clubbeheerder) | Profiel → rol Clubbeheerder → Rollen → scrollen → *Persoon toevoegen* (4 + scrollen) | Ver weg en tussen 131 knoppen | *Persoon toevoegen* bovenaan Rollen; *Mensen* open, de rest ingeklapt (2–3) | Sneller, minder kans op een fout vakje |
| Dringende zaak oplossen (HO) | Home → scrollen voorbij Rapporten → *Ik neem over* | Kans dat je het mist | Alles van vandaag of morgen bovenaan *Te doen* (1) | Niets gemist |
| Wisselen van rol (iemand met meer rollen) | Profiel → rol kiezen (2); je komt op Home | Je weet niet in welke rol iets wacht | Eén tik op de rolnaam in de kop; per rol het aantal open acties | Gericht wisselen |

**Randgevallen bij de nieuwe flows** (Workflow Optimizer, fase B5):
- **Automatisch bewaren:** bij een slechte verbinding blijft het concept op de telefoon staan en gaat het mee bij de volgende verbinding (dat doet de app nu al bij gewone opslag). De melding "Bewaard ✓" verschijnt pas als het echt is opgeslagen. Bij twee mensen tegelijk (HO en TC in hetzelfde moment) wint de laatste; dat is zeldzaam, dus voorlopig goed genoeg.
- **Observeren-knop:** alleen voor de begeleider die het moment heeft gepland of het werkgebied heeft. Bij een afgelaste training verdwijnt de knop.
- **Persoon toevoegen:** blijft alleen voor de clubbeheerder. De database controleert het ook (rechten op de server, niet alleen een verborgen knop).

## 5. Top verbeteringen
Score: **impact** (1–5) × **frequentie** (1–5), **inspanning** S/M/L, **risico** laag/middel/hoog, **vertrouwen** in het bewijs.

| # | Verbetering | P | Impact | Frequentie | Inspanning | Risico | Vertrouwen | Groep |
|---|---|---|---|---|---|---|---|---|
| 1 | **Automatisch bewaren** van lange velden + vragen bij sluiten van een venster met tekst | **P0** | 5 | 4 | M | laag | hoog | Middellang |
| 2 | **Dringend bovenaan:** vandaag/morgen bovenaan *Te doen* van de HO; rood vóór oranje bij de trainer | **P1** | 4 | 4 | S | laag | hoog | **Quick win** |
| 3 | **Rollen opdelen:** *Persoon toevoegen* bovenaan, *Mensen* open, Bouwen/Profielen/Taken ingeklapt, tikvakken ≥ 44 px | **P1** | 4 | 2 | M | laag | hoog | Middellang |
| 4 | **Controle op dubbele interne knopnamen** in de tests | **P1** | 3 | 5* | S | laag | hoog | **Quick win** |
| 5 | **Observeren-knop** op de dag zelf bovenaan Home HO/TC | **P2** | 3 | 3 | S | laag | middel | **Quick win** |
| 6 | **Rol wisselen met één tik** in de kop, met open acties per rol | P2 | 3 | 3 | M | middel (rechten) | middel | Middellang |
| 7 | **Regels en Inzicht inklappen**, kerncijfers bovenaan (staat al in Openstaand, Besluit 81) | P2 | 3 | 2 | M | laag | hoog | Middellang |
| 8 | **Eén knopregel** (één hoofdknop per scherm) en **standaardnaam HO** | P3 | 2 | 5 | S | laag | hoog | Quick win |
| 9 | **Onderregels inkorten** tot één zin (taalniveau B1) | P3 | 3 | 4 | M | laag | middel | Structureel |
| 10 | **Ongedaan maken** in plaats van een extra vraag bij kleine acties (observatieteken, turf) | P3 | 2 | 3 | M | laag | laag | Structureel |
| 11 | **Voortgang en *Later verder*** bij lange vragenlijsten | P3 | 2 | 2 | S | laag | middel | Quick win |

\* Frequentie van de fout bij elke nieuwe functie, niet van de gebruiker.

**Haalbaarheid** (Workflow Optimizer, regel 6): 1, 2, 3, 5, 7, 8, 9, 10 en 11 zijn alleen werk aan de app. 4 is alleen werk aan de tests. 6 heeft geen databasewijziging nodig, maar wel een rechtencontrole: de rolwissel mag nooit meer tonen dan de rol mag.

## 6. Snelle winst (maximaal drie)
1. **Dringend bovenaan** (#2): alles wat vandaag of morgen speelt bovenaan *Te doen* van de HO; bij de trainer rood vóór oranje.
2. **Controle op dubbele knopnamen** (#4): een test die faalt als twee knoppen dezelfde interne naam hebben.
3. **Observeren-knop** (#5): op de dag van een begeleidingsmoment bovenaan Home *"Observeren: [trainer] · [tijd] · [veld]"*.

## 7. Uitgewerkte aanbevolen flow: automatisch bewaren (#1)
- **Probleem** *(Afgeleid)*: elke fase van het begeleidingsmoment, de kennismaking en de vragenlijst slaat pas op met *Opslaan*. Een tik op een andere knop tekent het scherm opnieuw: niet-opgeslagen tekst is weg. Tikken naast een venster sluit het meteen.
- **Huidige stappen:** typen → (vergeten op *Opslaan* te tikken) → andere knop → tekst weg.
- **Gewenste stappen:** typen → veld verlaten → klein *"Bewaard ✓"* naast het veld → verder.
- **Scherm:** naast elk lang veld een kleine status: *Bezig met bewaren…* / *Bewaard ✓* / *Niet bewaard, probeer opnieuw*. De knop onderaan heet *Klaar* (sluit en zet het blok op "klaar").
- **States:** leeg (placeholder met voorbeeld) · bezig · bewaard · fout (rode tekst, de invoer blijft staan) · offline (*"Bewaard op deze telefoon, gaat mee zodra je verbinding hebt"*).
- **Venster sluiten met tekst:** geen verlies. Het concept blijft staan; bij opnieuw openen staat je tekst er weer.
- **Toegankelijkheid:** de status wordt voorgelezen (`aria-live`); de focus blijft in het veld.
- **Afhankelijkheden:** alleen de app; de opslag en de rechten blijven gelijk.
- **Acceptatiecriteria:**
  - Gegeven een HO die in fase 4 tekst typt, wanneer hij daarna op *Delen met de trainer* tikt, dan staat zijn tekst er nog en is die opgeslagen.
  - Gegeven een trainer die 5 van de 8 vragen invult, wanneer hij naast het venster tikt, dan ziet hij bij opnieuw openen zijn 5 antwoorden.
  - Gegeven geen verbinding, wanneer iemand een veld verlaat, dan ziet hij *"Bewaard op deze telefoon"* en gaat het mee zodra er verbinding is.
  - Een gebruiker met alleen een toetsenbord kan alle velden invullen en de status horen.

## 8. Ontwerpbesluit (App Design Architect)
- **Ontwerpdoel:** *"Op het veld en langs de lijn: in één oogopslag zien wat nu moet, en het in zo min mogelijk tikken doen, zonder ooit werk kwijt te raken."*
- **Ontwerpprincipes voor ClubComm:**
  1. Vandaag eerst: wat nu of morgen speelt, staat bovenaan.
  2. Niets kwijt: elke invoer wordt bewaard zonder dat je eraan hoeft te denken.
  3. Eén hoofdknop per scherm.
  4. Kleur betekent iets: groen klaar, blauw bezig, oranje aandacht, rood probleem.
  5. Beheer mag lang zijn, maar ingeklapt; gebruik moet kort zijn.
- **Behouden:**
  - de ouderflows (afmelden, vervoer);
  - *Actie nodig* bovenaan;
  - de kaarten in Trainers → Traject en plannen in 2 tikken;
  - printen van A4 en vragenlijsten;
  - de kleurbetekenis;
  - de huidige techniek (geen nieuwe frameworks of bibliotheken).
- **Veranderen:** formulieren (bewaren), de volgorde op de Home van de HO, de beheerschermen (inklappen, grotere tikvakken), één knopregel.
- **Niet doen:** geen nieuw ontwerp om het nieuwe en geen nieuwe tabbladen. Geen extra meldingen: principe 10, en het weekbericht is afgewezen.

## 9. Doelen om het effect te toetsen (doelen, geen metingen)
1. **Geen verloren invoer:** 0 meldingen van "mijn tekst is weg" in de pilot bij DCG en Swift. Meet via de feedbackknop en de foutregistratie.
2. **Trainer toevoegen:** van 4 tikken + scrollen naar 2–3 tikken zonder scrollen. Laat Sofian het één keer doen en tel.
3. **Observeren openen op de dag zelf:** van 3 naar 1 tik. Laat Oussama het één keer doen en tel.

## 10. Beslispunten vóór de bouw
1. Mag een **TC** straks zelf trainers toevoegen, of blijft dat bij de clubbeheerder? (Mijn advies: bij de clubbeheerder.)
2. Akkoord met **automatisch bewaren** in plaats van *Opslaan*-knoppen? Dat verandert de werkwijze in alle formulieren.
3. **Volgorde:** eerst de drie snelle winsten in één ronde, dan #1 en #3 (omdat Swift ze nu gebruikt), daarna #6 tot en met #11 na de eerste ervaringen van Acevit en Oussama?

## Wat goed is en moet blijven
- **Ouder:** afmelden in 3 tikken, programma meteen op Home, rustig scherm (1 schermhoogte).
- **Trainer:** aanwezigheid opnemen met één lijst; duidelijke uitleg als het nog niet kan.
- **Teamleider:** aanmeldingen goedkeuren bovenaan *Team*, uitnodigen met delen, QR tonen of printen.
- **HO/TC:** schone kaarten in Traject, plannen in 2 tikken, A4 en vragenlijst altijd printbaar.
- **Overal:** *Actie nodig* bovenaan, informatie los van taken, kleur met betekenis.
