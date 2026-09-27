# ClubComm — Beoordeling en advies (27 september 2026)

Beoordeling op 19 onderwerpen, zoals een ervaren app-ontwikkelaar die zou doen. Bouwt voort op de app-analyse van 26-09
(`app-analyse-2026-09.md`); wat daaruit al is opgelost, staat erbij.
**Gemeten, niet geschat:** alle 5 rollen (ouder, trainer, teamleider, HJO, clubbeheerder) en hun 24 schermen doorgemeten op een telefoonscherm (390 × 844), vier schermbreedtes,
toetsenbord, dubbel tikken, verkeerde invoer, laadtijd en grootte, de adviezen van Supabase en het gebruik in de echte club (alleen aantallen).
Dit is een **advies**, geen besluit. Wat we oppakken, gaat als besluit naar `besluiten.md`.

**Stand van de echte club (27-09):** 21 accounts, 16 spelers, 10 mensen met pushmeldingen, 91 activiteiten (trainingen), 26 berichten,
nog **0 wedstrijden** in de planning, 3 technische fouten geregistreerd (alle drie "Script error." bij een ouder op Home, 26-09).

## Rapportcijfers

| # | Onderwerp | Cijfer | In één zin |
|---|---|---|---|
| 1 | Doel | 8,5 | Scherp doel (afmelden en organiseren zonder WhatsApp-chaos); de kern is af. |
| 2 | Gebruikerservaring (UX) | 7,5 | Ouder 8, trainer/teamleider 7,5, beheerder 6: lange instellingspagina's. |
| 3 | Interface (UI) | 7,5 | Rustig en consequent; beheerschermen druk. |
| 4 | Navigatie | 7 | 4–5 tabbladen per rol is goed; Berichten staat per rol op een andere plek. |
| 5 | Efficiëntie | 8,5 | De app doet veel zelf (server elk kwartier, herinneringen, uitslag). |
| 6 | Functionaliteit | 8 | Alles wat de pilot nodig heeft is er; wedstrijden nog niet in het echt gebruikt. |
| 7 | Informatiearchitectuur | 7 | Eén bron voor alle rollen; Inzicht, Regels en Rollen nog te lang. |
| 8 | Technische architectuur | 7,5 | Eenvoudig en goed passend bij de pilot; bewust geen app-store. |
| 9 | Snelheid | 8 nu / 5 bij groei | Opent in ± 0,25 s; laadt elke 30 s alles opnieuw. |
| 10 | Schaalbaarheid | 5,5 | Prima tot een paar teams; vóór een hele club aanpassen. |
| 11 | Onderhoudbaarheid | 6,5 | Nu met automatische tests; grote bestanden, alles in één map. |
| 12 | Beveiliging en privacy | 7,5 | Rechten per rol goed afgedwongen; papierwerk (AVG) en sessieduur open. |
| 13 | Toegankelijkheid | 7 | Sinds 26-09 veel beter (contrast, 12 px); tikvlakken nog deels te klein. |
| 14 | Responsive | 6,5 | Telefoon uitstekend; op laptop een smalle telefoonkolom. |
| 15 | Feedback aan de gebruiker | 8 | Na elke actie een melding; bevestiging bij verwijderen. |
| 16 | Foutafhandeling | 7 | Geen verbinding wordt opgevangen; één "doorval-tik" gevonden. |
| 17 | Data en rapportages | 6,5 | Goede cijfers per kind en team; weinig export, geen trends over tijd. |
| 18 | Analytics | 3 | We weten nu niet welke functies gebruikt worden. |
| 19 | Testen | 7 | Sinds vandaag automatische tests; nog niet op echte iPhones of in Safari getest. |

**Gemiddeld ± 7.** Voor een pilot na één week met echte ouders is dat sterk. De zwakke plekken zitten niet in wat ouders zien,
maar in *meten* (analytics), *groeien* (schaalbaarheid) en *de beheerder* (lange instellingen).

---

## 1. Doel van de applicatie
- **Probleem:** afmelden, planning, vervoer, taken en berichten zitten nu verspreid over WhatsApp-groepen, mail en losse lijstjes. De trainer weet vaak pas op het veld wie er is.
- **Gebruikers:** ouders (grootste groep, weinig tijd, telefoon, soms langs de lijn), trainer, teamleiders, HJO/clubbeheerder, coördinator.
- **Wat een gebruiker moet bereiken:** ouder: "mijn kind is afgemeld en ik weet wat er komt". Trainer: "ik weet wie er is en kan mijn training of wedstrijd voorbereiden". Club: "ik zie waar het misgaat, zonder zelf te hoeven bellen".
- **Echt noodzakelijk:** inloggen, afmelden, planning, berichten, aanwezigheid, (vanaf 31 okt) wedstrijden met vervoer, taken en wisselschema/speeltijd.
- **Nice to have:** waardering, meehelpen, beoordelingen en ontwikkelgesprekken, materiaal, agenda-abonnement, excel-import. Die staan terecht als **module aan/uit** (Besluit 6).
- **Kortste route (gemeten):** afmelden = app openen → **Afmelden → reden → Bevestigen** = 3 tikken, zonder te scrollen. Dat is uitstekend.

**Advies:** voeg tot SCPB (januari) geen nieuwe modules toe. Laat de pilot de kern bewijzen: *gaan afmeldingen echt via de app?* (nu 2 afmeldingen in 2 dagen; te vroeg om te zeggen).

## 2. Gebruikerservaring (UX)
**Goed**
- Elke rol begint op **Home met "Actie nodig"**: je weet direct waar je moet beginnen (Besluit 30/34).
- Veelgebruikte acties zitten op één tik: afmelden bij de activiteit, aanwezigheid bij de training.
- Terug gaat altijd via de pijl linksboven of het tabblad; een paginawissel sluit een open venster (26-09).
- Fouten worden **voorkomen**: afmelden na de deadline zegt vooraf "telt als te laat"; dubbele aanmelding wordt samengevoegd; rooster wijzigen vraagt eerst als er afmeldingen op staan; "Club leegmaken" is weg.

**Beter kan**
- **Beheerder:** Regels = 4,4 schermen lang, Rollen = 4,1 schermen met **85 knoppen**, Inzicht (HJO) = 4,9 schermen. Te veel om te overzien.
- **Een nieuwe gebruiker krijgt geen welkomstuitleg** in de app (staat op Openstaand); ouders hebben nu de handleiding nodig.
- Wisselen van rol (jij hebt er 4) gaat via het profiel: 3 tikken, en je ziet niet dat er in een andere rol iets op je wacht.

**Advies:** (1) Regels, Rollen en Inzicht opdelen in onderwerpen die je openklikt, met een samenvatting (al op Openstaand). (2) Welkomstscherm met 3 tips bij de eerste keer inloggen. (3) Op Home een regel "Als trainer wacht er 1 ding op je" met één tik naar die rol.

## 3. Interface (UI)
**Goed:** één set iconen, kaarten met dezelfde opbouw, rood/oranje/groen alleen voor aandacht ("kleur alleen voor aandacht"), donkere modus, knoppen overal dezelfde vorm, termen consequent (afmelden, activiteit, teamnaam in plaats van teamcode). Oogt rustig en betrouwbaar.
**Beter kan**
- Beheerschermen zijn druk (zie 2).
- **Logo in de kop is een PNG van 90 kB**, de app-iconen 145–227 kB: verkleinen scheelt laadtijd op een trage verbinding langs het veld.
- Het logo-blauw (#0d88f9) en het app-blauw (#0869c2) verschillen (bewuste keuze voor contrast; bekend).

## 4. Navigatie
| Rol | Tabbladen |
|---|---|
| Ouder | Home · Planning · Vervoer · **Berichten** · Taken |
| Trainer | Home · Aanwezigheid · **Berichten** · Spelers · Speeltijd |
| Teamleider | Home · Wedstrijd · **Berichten** · Team |
| HJO | Home · Teams · Planning · Inzicht · **Berichten** |
| Clubbeheerder | Home · Seizoen · Regels · Rollen · Modules (geen Berichten) |

- **Aantal:** 4–5 per rol. Goed (maximum voor een telefoon is 5).
- **Waar ben je?** Actief tabblad is gekleurd en de kop noemt de pagina en het kind/team. Goed.
- **Punt:** *Berichten* staat op plek 3, 4 of 5. Wie meer rollen heeft (jij, Mark, Linda) zoekt steeds opnieuw. **Advies:** Berichten overal op dezelfde plek (bijv. altijd 2e of altijd rechts).
- **Zoeken:** is er waar het nodig is (archief, spelers, ouders bij de HJO). Voor ouders niet nodig.
- **Filters:** bij de HJO (per leeftijdsgroep) nodig en aanwezig; ouders niet.
- **Dashboard:** Home ís het dashboard ("Actie nodig" + wat er komt). Een apart dashboard is niet nodig.
- **Beginscherm:** hoort erop: wat nu moet en wat eraan komt. Hoort er níet op: cijfers en overzichten (die staan bij Aanwezigheid/Inzicht). Dat is nu al zo.

## 5. Efficiëntie voor de gebruiker
**Sterk punt van ClubComm.**
- Automatisch: berichten, herinneringen, uitslag, aanwezigheid na de wedstrijd, ontwikkelgesprekken indelen (server elk kwartier, Besluit 77).
- Onthouden: ingelogd blijven, gekozen kind en rol, adres aanvullen via postcode (PDOK).
- Geen dubbel werk: ouders voeren hun kind zelf in; de teamleider keurt alleen goed; de planning volgt uit het rooster.
- Meerdere acties tegelijk: rooster voor meerdere teams, excel-import, meerdere spelers tegelijk aanwezig.
- **Kansen:** Sportlink-koppeling (wedstrijdprogramma en spelers automatisch; staat op Openstaand) scheelt de teamleider het meeste werk vanaf fase 2.

## 6. Functionaliteit
- **Kern:** afmelden → aanwezigheid → kaarten/signalen; planning → herinneringen; wedstrijd → vervoer + taken + wisselschema → uitslag + speeltijd.
- **Afhankelijk van elkaar:** wisselschema hangt aan afmeldingen (waarschuwing bij een late afmelding, Besluit 85); vervoer hangt aan afmeldingen (chauffeur krijgt bericht); signalen hangen aan aanwezigheid.
- **Rollen en rechten:** ouder (alleen eigen kind), trainer en teamleider (eigen team), HJO (alles), clubbeheerder (instellingen), coördinator (groep). **Afgedwongen in de database** (RLS, getest per rol), niet alleen op het scherm.
- **Uitzonderingen die al zijn afgedekt:** gescheiden ouders (ieder een account), kind in twee teams, twee teamleiders, trainer die niet kan, vakantie, verplaatste of afgelaste training, afmelding na het wisselschema.
- **Grootste open risico:** wedstrijden zijn nog nooit in het echt gebruikt (0 in de planning). **Advies:** zet de eerste oefenwedstrijd zo snel mogelijk in de app en speel hem echt met de app.

## 7. Informatiearchitectuur
- **Eén bron:** alle rollen lezen dezelfde gegevens; een afmelding staat binnen 30 s bij iedereen. Geen dubbele informatie.
- **Leidend:** de planning (activiteiten) en de spelers; al het andere hangt daaraan.
- **Direct zichtbaar:** acties en de komende 3 activiteiten. **Een niveau dieper:** cijfers, geschiedenis, instellingen. Dat is goed ingedeeld (Besluit 81: lijsten tonen eerst wat nu speelt).
- **Menu's klein houden:** nieuwe functies als module in een bestaand tabblad, niet als nieuw tabblad. Tot nu toe goed volgehouden (max. 5).
- **Punt:** Inzicht, Regels en Rollen groeien (zie 2).

## 8. Technische architectuur
- **Webapp** die je op je beginscherm zet (PWA): één versie voor iPhone, Android en computer; geen app-store, updates meteen. Voor de pilot en de eerste clubs de juiste keuze. Een store-app (Capacitor) kan later over dezelfde code heen.
- **Database:** Supabase (Postgres, Frankfurt). Alles in één tabel `rij` met een soort en koppelvelden; rechten per rij. Flexibel en snel te bouwen; bij groei minder snel te doorzoeken (zie 10).
- **Verbindingen:** app ↔ Supabase (inloggen, gegevens), serverfuncties `melding` (Brevo e-mail + push) en `automaat` (elk kwartier), PDOK (adres). Geen andere API's nodig; **Sportlink** is de eerstvolgende.
- **Bestanden en afbeeldingen:** er worden geen foto's of bestanden van gebruikers opgeslagen. Goed voor de privacy; als het nodig wordt: Supabase Storage.
- **Back-ups:** dagelijks (Supabase Pro, 7 dagen) + elke zondag een eigen kopie (8 weken) + knop "Back-up downloaden".
- **Functies toevoegen:** makkelijk, omdat alles per module in een eigen bestand staat en de server dezelfde regels gebruikt als de app.

## 9. Performance
- **Openen:** ± 0,25 s (lokaal gemeten), 30 bestanden, 560 kB (± 270 kB ingepakt). Op 4G ± 1 s. Goed.
- **Pagina's:** direct (alles staat al in de app), geen wachttijd tussen tabbladen.
- **Gegevens DCG:** 52 kB in totaal. Elke 30 s wordt alles opnieuw opgehaald. Voor één team geen probleem.
- **Onnodig geladen:** QR-code-bibliotheek (57 kB) voor iedereen; logo en iconen zijn groot (zie 3).
- **Cachen:** de app zelf wordt al bewaard voor als er geen verbinding is; gegevens bewust niet (privacy).
- **Database-adviezen (Supabase):** alleen kleine punten (een ontbrekende index op pushabonnementen, twee ongebruikte indexen). Niets dringends.

## 10. Schaalbaarheid
| Aantal | Wat gebeurt er? |
|---|---|
| 100 gebruikers (± 1 club, 5 teams) | Werkt zoals nu. |
| 1.000 (± hele club, 30 teams) | HJO laadt elke 30 s ± 1,5 MB; te zwaar voor telefoon en abonnement. **Aanpassen vóór een hele club.** |
| 100.000 (± 100 clubs) | Nodig: alleen wijzigingen ophalen (Realtime), per team/seizoen laden, één server-run per club verdelen, betaald e-mailplan (300 mails/dag is dan te weinig). |
- **Nieuwe rollen:** makkelijk (rollen zijn een lijstje per persoon; rechten per rol in de database).
- **Twintig nieuwe functies:** kan zonder alles opnieuw te bouwen, zolang we modules blijven gebruiken en de grote bestanden opsplitsen.
- **Opnieuw bouwen nodig?** Nee. Wel twee verbouwingen vóór meerdere clubs: (1) alleen wijzigingen laden, (2) rol boven de clubs + één account bij meerdere clubs (staat gepland na december).

## 11. Onderhoudbaarheid
- **Goed:** modules per bestand, uitgebreide besluiten en pilotlog (waarom iets zo is), sinds vandaag **automatische tests** bij elke wijziging (Besluit 88), server en app delen dezelfde regels.
- **Beter kan:** `core.js` en `data.js` zijn groot; modules "overschrijven" soms elkaars functies (ging twee keer mis); alle code in een paar lange regels. Een andere ontwikkelaar kan ermee verder dankzij de documentatie, maar heeft een inwerkperiode nodig.
- **Advies:** bij elke nieuwe functie een test erbij; bij de verbouwing voor meerdere clubs de grote bestanden opsplitsen.

## 12. Beveiliging en privacy
- **Inloggen:** e-mail + code van 6 cijfers, **geen wachtwoorden** (dus ook geen "wachtwoord vergeten" en geen gelekte wachtwoorden). Supabase beperkt het aantal inlogmails per uur.
- **Wie ziet wat:** afgedwongen in de database per rol, getest (`rls_test.sql`). Supabase-controle: geen echte problemen.
- **Versleuteling:** verbindingen via https; Supabase versleutelt de opslag. Geheime sleutels alleen op de server.
- **Minimale gegevens:** naam, e-mail, (optioneel) telefoon, kind; geen geboortedatum, geen foto's. Goed.
- **Bewaren en verwijderen:** foutregistratie 60 dagen, logboek 14 dagen, archief tot eind seizoen, ontwikkelverslagen zolang het kind lid is; account verwijderen via een verzoek aan de beheerder.
- **Gat gevonden:** Besluit 1 zegt "HJO opnieuw inloggen na 30 dagen" en "iedereen na 6 maanden niets doen". Dat is **niet ingebouwd**: nu blijft iedereen ingelogd tot uitloggen. **Advies:** in Supabase (Authentication → Sessions, kan met Pro) een maximale duur instellen, of in de app regelen.
- **Nog open (AVG):** verwerkersovereenkomsten (Supabase, Vercel, Brevo), DPIA, privacycontact invullen, bewaartermijn ontwikkelverslagen in de privacyverklaring. Vóór SCPB afronden.
- **Verdachte inlogpogingen:** alleen de standaardbeperking van Supabase. Voor de pilot voldoende.

## 13. Toegankelijkheid
- **Opgelost sinds 26-09:** contrast (blauw, groen, oranje ≥ 4,5), tekst minimaal 12 px (gemeten: nog maar 1 stukje kleiner, bij Taken en HJO Teams).
- **Toetsenbord:** werkt; alle klikbare rijen zijn als knop bereikbaar (Tab + Enter), zichtbare focusrand. Geen knoppen zonder naam gevonden (schermlezer).
- **Kleur niet als enige signaal:** statussen hebben ook tekst ("te laat", "afgemeld"). Goed.
- **Tikvlakken nog te klein (< 40 px):** de profielknop rechtsboven (36 px, op elk scherm), de keuzeknoppen bovenin lijsten (bijv. "Persoonlijk / Nieuws", "Hele club / O6–O9": 22 stuks bij Inzicht), "Toch niet", "Dank je!", "Nu vernieuwen". **Advies:** minimaal 44 px hoog.

## 14. Responsive design
- **Telefoon (360–430 px):** uitstekend, nergens horizontaal scrollen, knoppenbalk onderin met ruimte voor de iPhone-streep.
- **Tablet, laptop, groot scherm:** de app blijft een kolom van 520 px in het midden. Voor ouders prima. Voor de **beheerder en HJO**, die instellingen en overzichten vaak op een laptop doen, is dat onhandig.
- **Advies (na de pilot):** op brede schermen voor beheer en Inzicht twee kolommen (lijst links, details rechts). Niet nu.

## 15. Feedback naar de gebruiker
- Na elke actie een melding onderin ("Jesse is afgemeld", "Rooster opgeslagen · 12 trainingen bijgewerkt", "Opgeslagen").
- Verwijderen en ingrijpende acties vragen eerst ("Klopt dit?", "Toch weghalen en opslaan").
- Geen verbinding: "Geen verbinding. We proberen het zo opnieuw." en de app probeert het na 15 s zelf opnieuw.
- **Beter kan:** geen laad-indicator bij het eerste laden van de gegevens in de echte versie op een trage verbinding; **advies:** een korte "Bezig met laden…" als het langer dan 1 s duurt.

## 16. Foutafhandeling
| Situatie | Wat gebeurt er? | Oordeel |
|---|---|---|
| Internet valt weg | App blijft werken, melding, opnieuw proberen na 15 s; opslaan bij wegvegen | Goed |
| Verkeerde invoer | Ongeldig e-mailadres tegengehouden; verkeerde code: "Deze code klopt niet"; tijden gecontroleerd ("tot" na "van"); namen en e-mail opgeschoond | Goed |
| Server reageert niet | Zelfde als geen internet; foutregistratie in Supabase; bewaking via UptimeRobot (nog instellen) | Goed na instellen |
| **Twee keer tikken** | Afmelding wordt maar één keer opgeslagen ✅, maar **de tweede tik valt door** en opent de training eronder | **Klein foutje** |
| Bestand te groot | Alleen bij excel/CSV-import (klein) | n.v.t. |
| Gegevens ontbreken | Lege club getest (geen activiteiten, geen telefoon, geen kind): geen fouten (automatische test) | Goed |
- **Advies:** na "Bevestigen" in een venster de knoppen eronder heel even (0,4 s) niet laten reageren. En de 3 "Script error."-meldingen van 26-09 uitzoeken (vermoedelijk iets buiten de app, zoals een browserextensie).

## 17. Data en rapportages
- **Verzameld en waarom:** afmeldingen met reden (om te tellen en te signaleren), aanwezigheid, te laat, kaarten, speeltijd, berichten. Alles heeft een doel (Besluit 4/5).
- **Weergave:** per kind (ouder, trainer), per team (trainer, teamleider), per club en leeftijdsgroep (HJO Inzicht), met de norm van het teamtype.
- **Export:** PDF bij de HJO, back-up downloaden (beheerder). **Geen export naar Excel** van aanwezigheid of speeltijd.
- **Trends:** er is geen verloop over tijd (bijv. aanwezigheid per maand, of afmeldingen die na de herfstvakantie oplopen).
- **Advies (na fase 2):** voor de HJO één grafiekje "aanwezigheid per maand per team" en een Excel-export; voor de pilot-evaluatie in december vooral de cijfers uit 18.

## 18. Analytics
- **Nu:** we weten niet welke schermen of functies gebruikt worden, waar mensen afhaken of hoeveel afmeldingen nog via WhatsApp gaan. Alleen de foutregistratie en de feedbackknop.
- **Waarom belangrijk:** in december beslissen we met teamleiders en ouders wat blijft en wat weg kan. Zonder cijfers is dat gevoel.
- **Advies (privacyvriendelijk, klein werk):** een telling per dag per rol van welk scherm geopend en welke actie gedaan is, **zonder** namen of personen (tabel in Supabase, bijv. `gebruik`). Plus 5 pilotcijfers op de Home van de beheerder:
  1. % gezinnen dat inlogde in de afgelopen 7 dagen;
  2. % gezinnen met pushmeldingen (nu 10 mensen);
  3. aantal afmeldingen via de app (en vraag de trainer: hoeveel nog via WhatsApp?);
  4. % afmeldingen op tijd;
  5. tijd tot een bericht gelezen is.
  Geen Google Analytics of cookies: past niet bij de gegevens van kinderen en ClubComm ("geen volgen zonder dat de ouder het merkt", Besluit 78).

## 19. Testen
- **Automatisch (sinds vandaag):** 10 tests bij elke wijziging: servermotor, elke rol en elk tabblad in demo én kleine club, rooster, afmelden en opslaan. Controleert zichzelf (ingebouwde fouten werden gevonden).
- **Nog niet:**
  - **Safari/iPhone:** de tests draaien alleen in Chrome. De meeste ouders hebben een iPhone. **Advies:** WebKit (de motor van Safari) toevoegen aan de automatische tests (klein werk).
  - **Echte telefoons:** staat op Openstaand; met jou en de teamleiders, ook op een trage verbinding.
  - **Echte gebruikers:** gebruikerstest met 3–5 ouders (meekijken zonder te helpen) staat op Openstaand.
  - **Wedstrijddag in het echt:** nog nooit (zie 6).
  - **Twee mensen tegelijk** (twee teamleiders): nog niet getest.

---

## Advies: wat eerst?

**Deze week (klein werk, vóór de ouders er massaal op zitten)**
1. Doorval-tik na "Bevestigen" oplossen (16).
2. Sessieduur instellen volgens Besluit 1 (12) — of het besluit aanpassen als 6 maanden/30 dagen niet meer gewenst is.
3. WebKit (Safari) toevoegen aan de automatische tests (19).
4. Tikvlakken ≥ 44 px: profielknop en keuzeknoppen (13).
5. UptimeRobot instellen en inlogcode op 6 cijfers controleren (al open, door jou).

**Vóór za 31 oktober (fase 2)**
6. Eerste oefenwedstrijd in de app zetten en echt spelen met de app (6, 19).
7. Eenvoudige gebruiksmeting + 5 pilotcijfers voor de beheerder (18).
8. Berichten op dezelfde plek in elke rol (4).
9. Welkomstscherm bij de eerste keer inloggen (2).
10. Gebruikerstest met 3–5 ouders en test op echte iPhones (19).

**Tijdens fase 2 (november)**
11. Regels, Rollen en Inzicht opdelen in openklikbare onderwerpen (2, 7).
12. "Als trainer wacht er iets op je" op Home bij meerdere rollen (2).
13. Logo en iconen verkleinen, QR-bibliotheek alleen laden als nodig (3, 9).
14. Sportlink-koppeling (5).

**Vóór SCPB (januari 2027)**
15. Alleen wijzigingen ophalen + Realtime (9, 10).
16. AVG-papierwerk: verwerkersovereenkomsten, DPIA, privacyverklaring (12).
17. Rol boven de clubs, één account bij meerdere clubs (10).
18. Beheer op laptop in twee kolommen; export en trends voor de HJO (14, 17).
