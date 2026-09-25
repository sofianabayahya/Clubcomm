# ClubComm — Pilotlog (fouten en lessen)

Wat we tijdens de pilot vinden, met de oorzaak en het patroon erachter. Doel: dezelfde soort fout niet twee keer maken.
Besluiten staan in `besluiten.md`; dit is het logboek van fouten. Nieuwste bovenaan.

## 25 september 2026 (eerste dag met echte ouders)

| Wat de gebruiker zag | Oorzaak | Opgelost | Patroon |
|---|---|---|---|
| Lange reactie verdween achter de knoppenbalk onderin | Reactievak rekende niet met de hogere balk op iPhones met streep onderin | In een gesprek geen knoppenbalk; vak onderaan en schuift mee (Besluit 58) | **E. Buiten de app** (toestel) |
| (zelf gevonden) Afzender kon een net binnengekomen antwoord overschrijven bij opslaan | Afzender schreef het hele bericht opnieuw weg | Antwoorden/gelezen/archief altijd via `bericht_bij` (Besluit 57) | **B. Opslaan niet zeker** |
| Bij elk antwoord in een gesprek een nieuwe e-mail | E-mail per bericht én per antwoord | Eén e-mail per onderwerp, alleen zonder push (Besluit 57) | — |
| Demo-knoppen (ander demo-account, demo opnieuw, account verwijderen) stonden in het echte profiel | Profiel was gebouwd voor de demo; "account verwijderen" werkte in het echt maar half | Alleen in de demo; echt: verzoek aan beheerder (Besluit 54) | **C. Demo verbergt het** |
| (zelf gevonden) Trainer zonder geplande activiteit zag ook geen acties (bijv. aanmeldingen) | Home stopte meteen bij "Geen activiteiten gepland" | Acties worden altijd getoond | **C. Demo verbergt het** |
| Ouder meldde hetzelfde kind twee keer aan (Tahsin, 15 min ertussen) | Aanmelden controleerde niet of er al een aanvraag was | Database voegt dubbele samen (Besluit 51); duplicaat verwijderd | **A. Momentopname / F. Echt gedrag** |
| Materiaalbericht stond in de inbox van de trainer zelf | Bericht kwam van 'systeem' naar alle HJO's, en de trainer is ook HJO | Bericht is van de trainer (Verstuurd), niet naar jezelf (Besluit 50) | **D. Eén persoon, meer rollen** |
| Nieuw goedgekeurde speler stond op "afwezig" in Aanwezigheid (Jack) | Het concept van de aanwezigheidslijst werd één keer gemaakt en niet bijgewerkt | Lijst werkt zich bij; alleen eigen tikken blijven | **A. Momentopname** |
| (zelf gevonden) Wisselschema blijft staan als een kind na het maken afmeldt | Schema bevat de spelers van het moment van maken | Waarschuwing + knop "Maak het schema opnieuw" | **A. Momentopname** |
| Afmelding van een ouder kwam nooit aan | Opslaan wachtte 0,4 s; iPhone stopt de app bij wegvegen | Meteen opslaan als de app naar de achtergrond gaat | **B. Opslaan niet zeker** |
| Nep-telefoonnummer 0612345678 bij goedgekeurde ouders | Voorbeeldwaarde uit de demo bleef in de echte versie | Leeg; ouder vult zelf in (ook bij aanmelden) | **C. Demo-waarden in echt gebruik** |
| Trainer zag aanmeldingen niet meer | Met teamleider gingen ze alleen naar de teamleider | Altijd zichtbaar onder Spelers (Besluit 47) | **D. Eén persoon per rol aangenomen** |
| Tweede teamleider zou de eerste uit de berichten duwen | Team kende maar één trainer/teamleider | Alle staf van het team krijgt de berichten (Besluit 44) | **D. Eén persoon per rol aangenomen** |
| Overal "O12-1" in plaats van "O12 talententeam" (zelf gevonden, ± 40 plekken) | Teamcode en teamnaam waren in de demo gelijk | Overal de naam; code alleen intern (`M.tn`) | **C. Demo verbergt het** |
| Oude berichten niet zichtbaar voor nieuwe ouders | Ontvangers liggen vast bij versturen | Vastgezet nieuws ook voor nieuwkomers (Besluit 41) | **A. Momentopname** |
| Code niet ontvangen (Hotmail) | Nieuwe afzender → map Ongewenste e-mail | Tip op het codescherm | **E. Buiten de app** |
| Na inloggen via de mail knop: app op beginscherm niet ingelogd | iPhone: beginscherm-app en Safari delen geen inlog | Vanaf beginscherm alleen de code overtypen; later knop helemaal uit de mail (Besluit 52) | **E. Buiten de app** |
| Knop over e-mailadres heen | Lange woorden zonder spatie breken niet af | Afbreken toegestaan | **F. Echte gegevens zijn langer/rommeliger** |
| Voornaam "Amin " met spatie; e-mail met hoofdletters | Invoer niet opgeschoond | Trimmen, e-mail kleine letters | **F. Echte gegevens zijn rommeliger** |
| Rol meteen opgeslagen zonder bevestiging | Geen controle-stap | Eerst "Klopt dit?" (Besluit 44) | — |
| Lege club: HJO-Home liep vast, "undefined%", verkeerd startbericht | Schermen alleen getest met volle demo | Lege-club-test toegevoegd | **C. Demo verbergt het** |

## De patronen (waar we bij elke wijziging op letten)
- **A. Momentopname:** iets wordt één keer gemaakt (lijst, schema, ontvangers) terwijl de werkelijkheid doorloopt. Vraag: *wat als er intussen iets verandert?*
- **B. Opslaan niet zeker:** telefoon sluit apps hard. Belangrijke acties meteen versturen en laten zien dat het gelukt is.
- **C. Demo verbergt het:** de demo is vol, netjes en heeft code = naam. Altijd ook testen met de echte, (bijna) lege club.
- **D. Eén persoon per rol:** een team kan meer trainers, teamleiders, ouders per kind hebben. Nooit "de" trainer aannemen.
- **E. Buiten de app:** e-mail, spamfilters, iPhone-gedrag. Uitleg op het scherm waar het misgaat.
- **F. Echte gegevens:** lange e-mailadressen, spaties, hoofdletters, geen telefoonnummer.

## Bekende risico's (nog niet opgelost)
- **Verversen:** nu elke 30 seconden en bij terugkomen in de app (Besluit 48). Echt direct (binnen 1 s) kan later met Supabase Realtime.
- **Automatische berichten** gaan uit als een beheerder/staflid de app opent, niet vanzelf vanaf de server.
- **Tegelijk wijzigen** van dezelfde regel: de laatste wint (zelden, maar mogelijk bij twee teamleiders). Voor berichten opgelost (Besluit 57).
- **Brevo-afmeldknop** in elke mail: wie tikt, krijgt geen inlogcode meer (deblokkeren in Brevo).
- **Wedstrijden** staan er nog niet in; vaste taken en wisselschema pas testen bij de eerste (oefen)wedstrijd.
