# Trainingsmodule ClubComm: hoe hij nu is opgebouwd (stand 28-10-2026)

*Beschrijving van wat er nu gebouwd is (Besluit 121 t/m 132), om te analyseren. Geen voorstel. Waar iets nog niet werkt of nog leeg is, staat dat erbij.*

---

## 1. Waarvoor en voor wie

**Doel:** de trainer bereidt een training voor op de laptop, controleert hem op de telefoon, neemt aanwezigheid op, en kijkt achteraf terug.

**Leidende afspraken:**
- **Methodiek als gegevens:** het opleidingsprofiel van de club bepaalt leerlijnen, fasen en sjablonen. Niets is vast in de code (Besluit 121, 123).
- **ClubComm stelt voor, de trainer beslist.** Een voorstel staat gestippeld; de trainer zet het vast (Besluit 131).
- **Alles is optioneel bij eigen vormen:** een concept mag onvolledig zijn (Besluit 131).
- **Op het juiste moment:** de terugblik verschijnt pas na afloop van de training (Besluit 132).

**Wie heeft hem:**

| Club | Aan? | Tabbladen trainer |
|---|---|---|
| DCG (O13 talententeam) | Ja (module *Trainingen (proef)*) | Home · **Training** · Wedstrijd · Spelers · Berichten |
| AVV Swift (pakket Trainers begeleiden) | Ja | Home · **Training** · Berichten (geen planning: trainingen op datum) |
| Clubs zonder de module | Nee | Home · Planning · Wedstrijd · Spelers · Berichten |

De clubbeheerder zet de module aan of uit bij **Regels → Modules**.

---

## 2. Zichtbaarheid (wie ziet wat)

| Gegevens | Wie ziet het | Hoe geregeld |
|---|---|---|
| Eigen vormen (`vormen`) | Alleen de trainer die ze maakte | Scope `eigen` in de database |
| Trainingen (`trainingsplannen`) | Alleen de trainer die ze maakte | Scope `eigen` |
| Opleidingsprofiel | Iedereen van de club leest het; alleen ClubComm/HO wijzigt het (de app schrijft het nooit terug) | Soort `profiel` |
| Catalogus vormtypes | Alle clubs, hetzelfde | Bestand in de app (`vormtypes.js`) |

**Gevolgen om mee te wegen:**
- De **teamleider en de HO zien de trainingen niet**. De rechtentest controleert dat elke nacht.
- Er is **geen gedeelde vormenbank** van de club of het team. Twee trainers van hetzelfde team zien elkaars vormen niet.
- De HO ziet bij een begeleidingsmoment nog niet de training van die dag. Dat staat bij *Later* en vraagt een rechtenwijziging.

---

## 3. Indeling van het tabblad Training

Bovenaan staan vier knoppen: **Week · Plannen · Vormen · Lijn**.
- Op de **telefoon** opent Training op *Week*.
- Op de **laptop** (scherm vanaf 900 px breed) opent Training op *Plannen*.

### 3.1 Week (telefoon: controleren)
Van boven naar beneden:
1. **Weekstrook:** de dagen met een T (training) of W (wedstrijd); vandaag is gemarkeerd.
2. De kop van de gekozen dag: datum, soort, tijd, veld.
3. Knop **Aanwezigheid · 10 van 12 verwacht ▾**. Die opent een venster met de namen. Tik op een naam: aanwezig → te laat → afwezig. *Opslaan* sluit het venster. Daarna staat er *x van y aanwezig · aanpassen*.
4. **De training als lijst:**
   - thema · totaal aantal minuten;
   - *A = leerdoel · B = leerdoel*;
   - een gekleurde balk met de verdeling van de minuten;
   - per regel: code (A1, S, A2 …), een kleine tekening, de naam (+ variant) en de minuten.
   - Tik op een vorm → de vorm groot (venster).
   - Knoppen **Aanpassen** (opent de trainingspagina) en **Printen**.
5. **Na afloop:** de terugblik (zie 3.2).
6. *Kun je zelf echt niet?* (de trainer meldt zich af) en **Planning aanpassen** (alleen met dat recht).

Is het een wedstrijd, dan staat er **Naar de wedstrijd**. Is de training nog niet voorbereid, dan staat er **Training voorbereiden of vastleggen**.

### 3.2 Plannen (laptop: maken)
Bovenaan staat de weekstrook, met alleen de trainingen. Daaronder drie kolommen; bij een smaller scherm staan ze onder elkaar.

**Midden: de training**
- **Kop op één regel:** *dag · thema* met een ✎ (venster voor thema, spelers, keepers). Daaronder: tijd · aantal spelers · sjabloon.
  - Het aantal spelers komt vanzelf uit de aanwezigheid (opgenomen, anders verwacht), tenzij je zelf iets invult.
- **Knoppen:** **Kopiëren naar…** · **Printen** · **⋯** (eerdere training overnemen, training leegmaken).
- **Balk** met de verdeling van de minuten (kleur per blok).
- **Opbouw in blokken:**
  - **Start** (warming-up);
  - **A · leerdoel ▾** (A1, spacing, A2);
  - **B · leerdoel ▾** (B1, spacing, B2);
  - **Partij**;
  - een losse regel *Ombouw, wissels, afsluiting*.
  - Het leerdoel per blok kies je zelf. Doe je dat niet, dan neemt ClubComm het hoofdleerdoel van de eerste vorm in het blok.
- **Elke regel:** code · tekening (of een gestippeld **+** voor een lege plek, of *spacing*) · naam · soort en weerstand · **fase-label** · minuten.
  - Het fase-label is gestippeld (*oefenleer · voorstel*) of vast.
  - Een oranje label *aantal* verschijnt als de vorm niet past bij het aantal spelers.
- **Tik op een regel** → een venster met:
  - minuten (gepland) en een notitie;
  - de **variant** (context vorm);
  - de **fase** (voorstel, oriëntatie, oefenleer, toepassing);
  - *Gebruiken als spacing*;
  - de knoppen ↑ Omhoog · ↓ Omlaag · Vorm bekijken · **Dupliceren** · Weghalen.
  - Bij een lege plek staat bovenaan **Kies een vorm**.
- Onderaan: **+ Vorm** · **+ Spacing** · het totaal (*75 van 75 min*).
- Is de training leeg: **Sjabloon DCG 75 (75 min)** en **Eerdere training overnemen**.

**Rechts**
- **Deze week:** de trainingen met hun status (voorbereid, gegeven ✓). Tik = die training openen.
- **Na de training:** vóór afloop staat hier een korte uitleg. Na afloop:
  - de schakelaar *Training is gegeven*;
  - **Hoeveel minuten echt?** per vorm, ingevuld met de geplande minuten (0 = niet gedaan);
  - *Wat doe je de volgende keer anders?*
- **Maand: minuten per hoofdleerdoel** (een balk per leerdoel; 0 minuten is rood).

**Links: Mijn vormen**
- Een zoekvak, en de knoppen *past bij 11* en *A = leerdoel* / *B = leerdoel*.
- Elke vorm is een kaartje: tekening, naam, minuten, spelers, leerdoel.
  - Tik op het kaartje = de vorm bekijken.
  - **+** = op de eerste passende lege plek zetten: in het blok met hetzelfde leerdoel, anders de eerste lege plek.
  - **Slepen** (alleen met een muis): op een lege plek = invullen; op een gevulde regel = erna; elders = achteraan.
- **+ Nieuwe vorm**.

### 3.3 Vormen (de vormenbank, eigen vormen)
- Een **zoekvak**. Het zoekt in naam, organisatie, coachpunten, type, tags en leerdoel, en kent synoniemen (bijv. *ssg* → Partijvorm).
- **Filterknoppen** (te combineren): **+ Filter** opent een venster.
  - Te kiezen: vormtype, weerstand (zonder / ondertal / gelijk / overtal), leerdoel, *past bij x spelers*, *≤ 10 min*, *met keepers*.
  - Onder *Meer*: aanbevolen fase, speelrichting, omschakeling.
  - Gekozen filters staan als knop met ✕. **Wis** maakt alles leeg. De knop onderaan zegt *Toon x vormen*.
- **+ Nieuwe vorm**.
- **Raster van kaarten:** grote tekening, naam, soort · weerstand · spelers · minuten, en het leerdoel. Tik = de vorm bekijken.

### 3.4 Lijn (de opleidingslijn)
- **Tabel:** de leerdoelen (rijen) × 8 weken (kolommen), met minuten per hoofdleerdoel.
  - **vet** = uitgevoerd (training gegeven), grijs = alleen gepland;
  - de huidige week is gekleurd;
  - **rode leerdoelnaam** = de afgelopen 4 weken niet aan bod gekomen.
- **Per week:** de trainingen met thema, *A = … · B = …* en ✓ als ze gegeven zijn.
- De maandtelling (zoals bij Plannen).

---

## 4. De vorm

### 4.1 Bekijken (venster; op de laptop breed in Rinus-stijl)
- **Links:** de tekening op groen, met een **legenda** van de pijlen die erin staan.
- **Rechts:**
  - soort (bijv. *Passeer- en duelvorm · functioneel*);
  - een **meta-regel**: afmeting · spelers · minuten · weerstand · richting/doelen/omschakeling;
  - knoppen: **Zet in een training…** · Dupliceren · Printen · Bewerken.
- **Kopjes:**
  - **Doel:** ★ hoofdleerdoel, *ook:* extra leerdoelen, één zin doel, aanbevolen fase;
  - **Organisatie en spelregels** (één punt per regel);
  - **Coachpunten**;
  - **Makkelijker / Moeilijker** (varianten met een richting) en de overige varianten;
  - **Materiaal (uit de tekening):** ballen, hoedjes, schijfjes, doelen, kaatsborden, hesjes;
  - *Volgende keer anders*;
  - **Ook voor dit leerdoel** (tot 4 andere vormen).

**Zet in een training…** toont de komende trainingen (4 weken), of je trainingen op datum. Een lege training krijgt eerst het sjabloon; de vorm komt op de eerste passende plek.

### 4.2 Bewerken (pagina; op de laptop twee kolommen)
- **Links:** de tekening en **Tekening maken/aanpassen**.
  - **Varianten (context vorm):** naam, tekst, richting (variant / makkelijker / moeilijker) en een eigen tekening.
  - **Bij andere groepsgroottes:** per aantal spelers en keepers een korte opzet.
- **Rechts, automatisch bewaard:**
  - naam;
  - **Classificatie** (alles optioneel; elke tweede tik maakt weer leeg):
    1. **Leerdoel** uit het profiel: de eerste tik = ★ hoofdleerdoel, daarna = *ook*.
    2. **Aantallen per groepje:** aanval · verdediging · neutraal · keepers. ClubComm toont direct de weerstand, bijv. *vanuit verdedigers: 2 tegen 4 · ondertal*.
       - Het perspectief volgt uit de kant van het hoofdleerdoel. Zonder hoofdleerdoel staan er alleen de aantallen.
       - *Passief / met afleiding / wisselend* kies je zelf.
    3. **Vormtype:** 8 hoofdtypes, met **+ functioneel / linietactisch** en *Meer precies* (16 categorieën).
    4. **Speelrichting:** geen / één / twee, en *met doelen*.
    5. **Omschakeling:** geen / aanval → verdediging / verdediging → aanval / beide.
    6. **Aanbevolen fase** (optioneel).
    7. **Afmeting**.
  - spelers van–tot, minuten, keepers van–tot;
  - **Doel (één zin)**, organisatie en spelregels, coachpunten, *wat ik de volgende keer anders doe*, eigen woorden (tags);
  - **Dupliceren** · **Verwijderen** (zacht: trainingen houden de vorm).

### 4.3 De 8 hoofdtypes (catalogus)

| Hoofdtype | Valt eronder (*meer precies*) |
|---|---|
| Droog / techniek | droge vorm, technische oefenvorm, loop- en combinatievorm, bewegingsscholing |
| Passeer- en duelvorm | passeer- en duelvorm |
| Rondo | rondo |
| Positiespel | positiespel |
| Partijvorm | partijvorm, small-sided game, spel- en wedstrijdvorm |
| Afwerkvorm | afwerkvorm |
| Patroon / tactisch | opbouw- en aanvalspatroon, stroom- en golfvorm, linie- en teamtactisch |
| Keeper | keepersvorm |

- Aparte aanduiding: *functioneel / linietactisch*.
- Schakelvorm is geen type maar een kenmerk (omschakeling).
- Spacing is geen type maar een plek in de training.

---

## 5. De tekentool
Een volledig scherm, ook in de app zelf (overgenomen uit de ART-app, Besluit 126/127).
- **Bovenbalk:** Annuleren · **Veld ▾** · **Opstelling ▾** · ⚙ · Ongedaan maken · Opnieuw · **Opslaan**.
  - Velden: 11x11 liggend, 11x11, 8x8, 6x6, half veld, vak.
- **Rail** (op de laptop links, op de telefoon een rij): **Kies · Spelers · Bal · Hoedjes · Schijfjes · Doelen · Pijlen · Markeren**.
  - Elke knop opent een klein menu met varianten, en onthoudt de laatst gekozen variant.
  - **Spelers:** 4 kleuren (rood, lichtblauw = rondje; geel, blauw = driehoek, per team om te wisselen), trainer en keeper. Plus een nummerbalk met de rugnummers 1–11 op hun plek in de 1-4-3-3.
  - **Hoedjes** in 6 kleuren, en *vak met hoedjes*; **schijfjes** in 5 kleuren.
  - **Doelen:** pupillendoel, minidoel, kaatsbord.
  - **Pijlen:** loopactie (stippel), pass, dribbel (golf), schot, plus loopactie en pass met boog. Bij gekozen pijlen kun je bolletjes verslepen voor lengte en boog.
  - **Markeren:** nummers, zones, tekst.
- **Selectiebalk** (als iets gekozen is): Dupliceren · Tekst wijzigen · Rugnummer +1 · Draaien · Maat verbergen · Kleur · Verwijderen.
- Op de telefoon staat de tip "uittekenen gaat het snelst op een laptop". Op de laptop zijn er sneltoetsen.
- Wat ClubComm met de tekening doet:
  - de miniatuur;
  - de **telling van het materiaal**;
  - de **legenda** van de pijlen;
  - het **printen**.

*Bekend (cijfer 28-10: telefoon 5,5):* op de telefoon krijgt het veld weinig ruimte (drie rijen knoppen, een tip, een uitleg). Een voorstel voor één bovenbalk ligt er, maar is nog niet gebouwd.

---

## 6. De training (gegevens en regels)
- **Bij een activiteit uit de planning**, of **los op een datum** (Swift: *Nieuwe training* → datum).
- **Sjabloon DCG 75** (pilot): start 8 · A1 6 · S 3 · A2 10 · B1 6 · S 3 · B2 10 · partij 22 · ombouw 7 = 75 min. Alle minuten zijn aanpasbaar.
- **Fase-voorstel:** de aanbevolen fase van de vorm, anders die van het sjabloon (A1/B1 = oefenleer, A2/B2/partij = toepassing).
- **Gepland ≠ uitgevoerd:** alleen het **hoofdleerdoel** van een vorm krijgt de minuten. Secundaire leerdoelen tellen als *ook geraakt, x keer*. Start, spacing en ombouw tellen niet mee.
- **Kopiëren naar…:**
  - naar een andere training (een gevulde training vraagt eerst *Vervangen?*), of naar een losse datum;
  - gegeven, terugblik en echte minuten gaan niet mee.
- **Eerdere training overnemen:** de opbouw komt erbij, plus het thema als dat leeg is.
- **Printen** (A4 via de printfunctie van de browser):
  - **per training:** kop, totaal materiaal (het meeste dat tegelijk nodig is), en per onderdeel de tekening met organisatie, coachpunten, variant en materiaal;
  - **per vorm:** hetzelfde, plus de varianten.

---

## 7. Het opleidingsprofiel (de thema's)

### 7.1 DCG-opleidingslijn

| Onderdeel | Inhoud | Status |
|---|---|---|
| Visie | *Samen op reis – De route naar jouw beste ik*. Teamkompas: elkaar helpen, luisteren, praten, vertrouwen, positief blijven, samen oplossen, iedereen doet mee | eigen |
| Doelgroep | O13 talententeam, geboortejaar 2015, overgang 8x8 → 11x11; aandacht: positie-inzicht, veldbezetting, handelingssnelheid, samenwerking; 3× per week 75 min | eigen |
| Teamfuncties | aanvallen, verdedigen, omschakelen V→A, omschakelen A→V | eigen |
| Spelprincipes | 8 plekken (2 per teamfunctie), nog zonder inhoud | **leeg** (trainers zien niets) |
| Leerlijnen | 1v1 aanvallend (manipuleren), aannemen en meenemen (voorbereiden), passen (helpen), vrijkomen (timen), 1v1 verdedigen en bal veroveren (controleren); elk met een kant (aanval of verdediging). 6e leerlijn: kandidaten *beschermen/vrijmaken* en *schieten/afronden* | eigen; 6e = **controleren** |
| Leerdoelen per leeftijd (observeerbaar gedrag) | Structuur staat klaar, nog geen inhoud | **leeg** |
| Methodiek | fasen: oriëntatie, oefenleer, toepassing; vier uitgangspunten | eigen |
| Trainingsopbouw | sjabloon DCG 75; spacing nog niet gedefinieerd | eigen |
| Periodisering | cyclisch, hoofd- en contrathema's, een leerdoel komt terug in verschillende contexten; open: weekprogramma, herhaling, verdeling | deels |
| Themalessen | 15 min. Onderwerpen: opbouwen tegen 2–3 drukzetters, de rol van de nummer 6, vrijlopen, passlijnen herkennen, jagen en terugveroveren, positiewisselingen | eigen (nog niet in de app gebruikt) |
| Evaluatie | nog vast te stellen | **leeg** |
| Termen | jagen, lokken, loeren, direct terugwinnen | eigen (nog niet in de app gebruikt) |

**Let op:** de **database staat nog op versie 1** van het profiel. Het script voor versie 2 (kant per leerlijn, plekken voor de spelprincipes, sjabloon DCG 75) wacht nog op bevestiging in Supabase. Tot dan ontbreken in de echte app het sjabloon en het over- of ondertal.

### 7.2 KNVB-standaard (voor Swift)
Bestand `supabase/profielen/knvb-2026.1.json`: nog grotendeels *leeg* of *controleren*. Swift-trainers hebben dus nog **geen leerdoelen** om te kiezen: geen sjabloon, geen fase, geen weerstand met perspectief.

---

## 8. Gebruiksgemak: tikken per taak (huidige stand)

| Taak | Waar | Tikken |
|---|---|---|
| Aanwezigheid opnemen | Telefoon, Week | 1 (venster) + afwezigen aantikken + Opslaan |
| Nieuwe training met sjabloon | Laptop, Plannen | dag (1) → Training voorbereiden (1) → Sjabloon (1) = 3 |
| Een vorm in een plek zetten | Laptop | slepen of **+** = 1 |
| Vorm vanuit de bank in een training | Vormen | vorm (1) → Zet in een training (1) → dag (1) = 3 |
| Fase vastzetten | Laptop of telefoon | regel (1) → fase (1) → Klaar (1) = 3 |
| Onderdeel 2 plekken omhoog | Venster | regel → ↑ → regel → ↑ = 4 (het venster sluit na elke stap) |
| Training naar volgende week | Plannen | Kopiëren naar (1) → dag (1) (+ Vervangen) = 2–3 |
| Training printen | Plannen of Week | 1 |
| Terugblik na afloop | Plannen of Week | schakelaar (1) + minuten aanpassen + tekst |

---

## 9. Sterke punten en bekende zwakke plekken (om te analyseren)

**Sterk**
- Eén plek voor alles rond de training; de telefoon voor controleren, de laptop voor maken.
- Methodiek per club als gegevens; voorstellen in plaats van verplichtingen.
- Weerstand, materiaal en minuten rekent ClubComm zelf uit.
- Printen en kopiëren zijn één tik.

**Zwak of nog open**
1. **Profiel v2 nog niet in de database** (zie 7.1).
2. **Swift heeft nog geen KNVB-inhoud:** de module werkt daar, maar zonder leerdoelen.
3. **Geen gedeelde vormen** (club of team), en de HO ziet de training niet.
4. **Tekentool op de telefoon** (5,5): weinig ruimte voor het veld.
5. **Volgorde wijzigen** gaat met ↑ ↓ en het venster sluit telkens. Voorbeeld voor slepen en een vast venster ligt klaar (`docs/onderzoek/training-laptop/voorbeeld-*`).
6. **Spacing is nog niet gedefinieerd** (loslaten, herstel, contrast of spelend leren).
7. **Themalessen en termen** staan in het profiel, maar de app doet er nog niets mee.
8. **De terugblik is per training.** Er is nog geen koppeling met de wedstrijdobservatie (idee: spelprincipes als onderwerp, Besluit 131 *Later*).
9. **Veel lagen:** tabblad → knop (Week/Plannen/Vormen/Lijn) → venster → pagina (bewerken) → tekentool. Op de telefoon is *Plannen* bruikbaar, maar niet bedoeld.

---

## 10. Waar staat het in de code
- `public/app/training.js`: alle schermen en regels hierboven.
- `public/app/vormtypes.js`: de catalogus (types, aanduiding, omschakeling, synoniemen, eisen bij publiceren).
- `public/app/tekentool.js` + `.css`: de tekentool.
- `supabase/profielen/dcg.json` en `knvb-2026.1.json`: de profielen; `README.md` legt de opbouw uit.
- Besluiten: 121 (richting), 123 (profiel), 124–127 (tekentool), 128 (proef), 130 (tabblad), 131 (classificatie, sjabloon, minuten), 132 (laptop, Rinus-stijl, printen, kopiëren, Lijn).
