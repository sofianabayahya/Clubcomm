# Trainerspilot: is de tekentool klaar voor een bijeenkomst met trainers? (5 november 2026)

*Spoor 3 — ClubComm. Alleen onderzoek: er is niets veranderd aan de app, de database of productie.*

**Afbakening (besluit van de initiatiefnemer, zie Besluit NNN):**
- Trainers gebruiken ClubComm voorlopig om **zelf oefenvormen te tekenen en te bewaren**.
- Hoe ze daarmee een training ontwerpen, legt de HJO uit op een trainersbijeenkomst.
- Geen plicht om trainingen digitaal uit te werken.
- Geen gedeelde clubbibliotheek in gebruik, en geen automatische publicatie.

## Kort antwoord

**Ja, de tekentool is klaar voor de bijeenkomst.** Alle vijf de punten werken op de telefoon en op de laptop. Dat is getest met een nieuwe praktijktest die de handelingen echt uitvoert in de app (`tests/trainerspilot.spec.js`, 2 van 2 groen). Bewaren is getest via de nep-database, die werkt zoals productie.

Er zijn **vier dingen die een beginner op de telefoon kunnen laten struikelen**. Die vang je op met de snelstartgids en een korte uitleg; er hoeft daarvoor niets gebouwd te worden.

## De vijf punten

| # | Punt | Telefoon (390 px, aanraken) | Laptop | Hoe getest |
|---|---|---|---|---|
| 1 | Spelers en rugnummers plaatsen | ✅ Spelers → teamkleur → nummer tikken: de speler staat op zijn plek met nummer | ✅ | praktijktest; 12 tests nummering, 5 paneel |
| 2 | Pionnen, doelen en ander materiaal | ✅ **eerst de soort kiezen** in het menu (het menu gaat dan dicht), dan op het veld tikken | ✅ menu openen en meteen op het veld tikken | praktijktest; 4 menutests |
| 3 | Verplaatsen en verwijderen | ✅ **eerst op Kies tikken**, dan het voorwerp aantikken en slepen, of *Verwijderen*; *ongedaan maken* werkt | ✅ | praktijktest; 4 tikvlaktests (97–98% raak, Besluit 160) |
| 4 | Bewaren en opnieuw openen | ✅ *Opslaan* → staat in de database → na opnieuw laden dezelfde tekening, ook de verplaatste speler | ✅ | praktijktest (nep-database) |
| 5 | Bediening telefoon en laptop | ✅ werkbaar, met de vier aandachtspunten hieronder | ✅ het prettigst | praktijktest; 3 tests gekanteld |

## Vier aandachtspunten op de telefoon (gezien in de test en op de schermafbeeldingen)

1. **Het menu ligt over de bovenkant van het veld.** Wie het menu Hoedjes opent en dan bovenin het veld tikt, raakt het menu en niet het veld.
   → **In de gids:** "Kies eerst de kleur. Het menu gaat dicht. Tik dan op het veld."
2. **Het gereedschap blijft aan.** Na het neerzetten van een hoedje of bal plaats je bij elke tik er nog een. Dat is bewust zo (Besluit 126). Om te verplaatsen of te verwijderen tik je eerst op **Kies**.
   → **In de gids:** "Klaar met neerzetten? Tik op Kies."
3. **In het menu Hoedjes is de eerste knop "Vak met hoedjes"**, en die werkt met slepen, niet met tikken. Een beginner die die knop pakt en tikt, ziet niets gebeuren.
   → **In de gids:** "Neem een gewoon hoedje (tweede knop)."
4. **Op een groot veld (11×11) zijn de spelers op de telefoon klein** (schermafbeelding 5).
   → **In de gids:** "Kies bij **Veld** een kleiner veld voor een kleine oefenvorm."

**Kleinere punten, nu niet bouwen:**
- De rij knoppen (Kies, Spelers, Bal, Hoedjes, Schijfjes, Doelen, Pijlen, Markeren) past niet op het scherm: veeg naar links voor Pijlen en Markeren.
- De hulptekst noemt op de telefoon ook "Shift+klik" en "Cmd/Ctrl+A"; dat werkt alleen op een laptop.
- Tikt een trainer op *Nieuwe oefenvorm* en gaat hij terug zonder iets in te vullen, dan blijft er een lege *Nieuwe vorm* staan. Die kan hij zelf weggooien. Een voorstel om dit op te lossen bestaat al.

## Privacy en de clubbibliotheek: klopt het met de afbakening? (gecontroleerd in de code)

- **Persoonlijk:** een oefenvorm is van de trainer (scope `eigen`). Niemand anders kan hem lezen.
- **Geen clubbibliotheek in de app:** er is geen knop om iets met de club te delen. Er wordt dus niets gepubliceerd, ook niet vanzelf. De database heeft wel al een scope `clubbank` (Besluit 134), maar de app gebruikt die niet.
- **Uitzondering, bewust en per club ingesteld:** zet een trainer een oefenvorm in een training, dan kan **zijn eigen begeleider** (HO of TC van zijn bouw) hem lezen. Dat gebeurt alleen als de club *meekijken* aanzet en de trainer een traject heeft (Besluit 159). Dat is geen publicatie; de trainer ziet dat er wordt meegekeken.
- **Later:** wat de HJO later geschikt vindt voor de clubbibliotheek, gaat alleen met toestemming van de trainer of een deelafspraak. Dat ontwerpen we pas als de bibliotheek weer prioriteit krijgt.

## Checklist vóór de bijeenkomst

- [ ] **Account:** elke trainer is uitgenodigd en kan inloggen (e-mail + code). Test bij één trainer vooraf.
- [ ] **Training aan:** de module Training staat aan voor de club (bij Swift aan).
- [ ] **Laptop of tablet erbij:** zo kun je ook op een groter scherm laten zien hoe het werkt. Op de telefoon werkt het ook, met de gids.
- [ ] **Voorbeeldoefening:** neem één eenvoudige oefening die iedereen samen natekent, bijvoorbeeld een rondo 4 tegen 2: 4 spelers, 2 verdedigers, 4 hoedjes, 1 bal.
- [ ] **Na afloop:** trainers kunnen hun tekening thuis opnieuw openen. Vraag daar één week later naar.

## Schermafbeeldingen (telefoon, 390 px, verzonnen gegevens)

`1-vormen.jpg` Vormenbank · `2-oefenvorm.jpg` naam en *Tekening maken* · `3-spelers.jpg` spelers met nummers · `4-hoedjes-menu.jpg` het menu ligt over het veld · `5-kies-en-weg.jpg` Kies, Dupliceren, kleur, Verwijderen.
