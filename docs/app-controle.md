# App-controle (techniek en normen)

Versie 1, 23 oktober 2026. Gemaakt in het project mijnrijlesplanner. Deze lijst groeit: wat we daar bedenken, komt hier bij.

Gebruik: plak de prompt onderaan in een andere app-thread en voeg dit bestand toe.

---

## 1. Werkwijze bij de controle

1. Bekijk elk scherm op een telefoon van 390 px breed (touch) en op een laptop vanaf 1100 px.
2. Loop per scherm de technieken (deel 2) en de normen (deel 3) na.
3. Geef per punt aan of het er al is, er nog niet is, of hier niet past. Leg uit waarom.
4. Voor elk voorstel: eerst een voorbeeld (een screenshot), met voordelen, nadelen en je advies. Pas bouwen na een ja.
5. Los breed op: zit hetzelfde probleem op een ander scherm, neem dat mee.

## 2. Technieken (vakterm, wat het is, wanneer wel en niet)

| Techniek | Wat het is | Gebruiken als | Niet gebruiken als |
| --- | --- | --- | --- |
| Edge-to-edge statusbalk | De kleur van de app loopt door achter de klok, de batterij en de notch | Altijd. De balk eronder moet dicht zijn en precies dezelfde kleur hebben, anders zie je een naad | – |
| Safe area | Niets valt onder de notch, de klok of de thuisbalk | Altijd, op elke pagina (ook inloggen, foutpagina's) | – |
| Krimpende titel (large title / collapsing header) | De grote titel schuift weg en staat dan klein in de bovenbalk. Tik erop en je gaat terug naar boven | Op schermen waar je scrolt. Op de telefoon. Op een detailpagina toont de balk de naam van het onderwerp | Op de laptop als de tabs al bovenin staan |
| Titel als keuzemenu (pull-down menu) | "Week 43 ▾": tik op de titel en je kiest wat je ziet | Als je vaak wisselt tussen een paar varianten van hetzelfde scherm | Als een filter met zichtbare knoppen sneller is (dan liever knoppen) |
| Zwevende tabbalk (floating tab bar, "Liquid Glass") | Een losse, afgeronde pil van glas onderin, die niet tegen de randen zit | Hoofdnavigatie met 3 tot 5 tabs. Houd onderaan wat extra ruimte vrij voor vaste knoppen | Meer dan 5 tabs |
| Waas (blur / backdrop) | Een halfdoorzichtige balk waar de inhoud zacht onder doorschuift | Tabbalk en vaste rijen | De bovenbalk met de statuskleur (zie edge-to-edge) |
| Venster van onder (bottom sheet) | Een actie opent in een venster dat van onderen opschuift. Op de laptop staat het in het midden | "Kijken op het scherm, doen in een venster" | Lange formulieren met meerdere stappen |
| Filterknoppen (segmented control / chips) | Een paar knoppen met aantallen, bijvoorbeeld Alle 11 / AVB 7 | Een lijst met 2 tot 4 vaste groepen | Veel filters (gebruik dan een filtervenster) |
| Vaste filterrij (sticky toolbar) | Zoeken en filters blijven onder de balk staan bij het scrollen, compact in één rij | Lange lijsten (40 of meer items) | Korte schermen |
| Opstartanimatie (splash) | Een logo-animatie bij het openen | Eenmalig voor een nieuwe gebruiker, ongeveer 1 seconde | Een app die je vaak per dag opent |
| Micro-animatie | Kleine beweging die iets uitlegt, zoals een vinkje na het opslaan of een venster dat opschuift | Om te laten zien dat iets gelukt is | Als versiering |
| Hero banner / reclamevlak | Een groot vlak bovenaan met beeld of reclame | Winkel- en reisapps | Werk-apps: het kost ruimte zonder functie |
| Transparante header over een foto | Ronde knoppen zweven over een grote foto | Apps met sterk beeld | Apps zonder foto's of met een krimpende titel |

## 3. Vaste normen voor elke app

- Tikvlak minimaal 44 × 44 pt (Apple) of 48 dp (Google).
- Contrast minimaal 4,5 : 1, grote tekst 3 : 1 (WCAG 2.2 AA). Gebruik kleur nooit als enige signaal.
- Leestekst minimaal 16 px. Als de tekst op de iPhone groter is ingesteld, mag er niets breken.
- Gebruik echte knoppen en velden. Een icoonknop zonder woord krijgt een label voor voorleessoftware.
- Respecteer de instelling "Beperk beweging" bij animaties.
- Snelheid: binnen 2,5 seconde geladen, binnen 0,2 seconde reactie op een tik, en niets verspringt (Core Web Vitals).
- Elke tik geeft meteen antwoord ("Bezig…", daarna "Opgeslagen"). Een knop kan niet twee keer ingedrukt worden.
- Fouten krijgen een vriendelijke tekst met een knop "Opnieuw", ook als er geen internet is.
- Verwijderen: eerst bevestigen, of ongedaan kunnen maken.
- Gebruik vertrouwde patronen: tabbalk onderin, terug linksboven, venster van onder, swipe om te sluiten.
- Privacy (AVG): alleen de nodige gegevens, een bewaartermijn, een wisknop en verwerkersovereenkomsten.
- Beveiliging: ga per pagina na wie hem mag zien. Persoonlijke links zijn lang en willekeurig.
- Laptop: de app werkt ook goed vanaf 1100 px, met twee kolommen waar dat zinnig is.

## 4. Ontwerpregels (sofians denkwijze, voor elke app)

- Functie eerst. Wat doet de gebruiker ermee? Is daar geen antwoord op, dan gaat het weg.
- Geen dubbele info of dubbele acties. Elk gegeven staat op één plek.
- Toon niets wat je al ziet. Labels alleen voor uitzonderingen.
- Een status zonder knop is ruis. Toon iets alleen als er iets te doen is, en laat het vanzelf verdwijnen als het gedaan is.
- Nodig tegen druk: weeg hoe hard iets nodig is tegen hoeveel drukker het scherm ervan wordt.
- De plek volgt hoe vaak je iets gebruikt: dagelijks op het eerste tabblad, eenmalig bij de instellingen.
- Het moet ook werken met 100 items. Lange lijsten krijgen zoeken of een filter.

---

## Prompt voor een andere app

Kopieer dit en plak het in de thread van de andere app, samen met dit bestand:

> Controleer deze app aan de hand van het bijgevoegde bestand "App-controle".
> 1. Lees het hele bestand en volg de werkwijze in deel 1.
> 2. Loop elk scherm na op de technieken (deel 2), de normen (deel 3) en de ontwerpregels (deel 4).
> 3. Maak een overzicht per scherm: wat is al goed, wat ontbreekt, en wat past hier bewust niet. Zet bij elk punt de vakterm erbij.
> 4. Zet de verbeteringen op volgorde: eerst wat de gebruiker het meest merkt, daarna de normen, daarna de mooie extra's.
> 5. Maak voor de 3 belangrijkste verbeteringen een voorbeeld (een screenshot op telefoonformaat), met voordelen, nadelen en je advies.
> 6. Bouw niets voordat ik ja zeg.
> 7. Kom je een goede techniek tegen die nog niet in het bestand staat? Noem hem apart, zodat ik hem kan toevoegen.
> Schrijf in het Nederlands, kort en gewoon.
