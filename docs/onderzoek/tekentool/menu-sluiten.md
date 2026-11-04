# Tekentool: onbedoeld plaatsen bij het sluiten van een menu

*4-11-2026. Spoor 3. **Onderzoek; gekozen: A + B = Besluit 152.** Gemeten op `main` (`33d9ebb`, met Besluit 148) op `/tekenen`, laptop 1366 px en telefoon 390 px, met een script dat objecten op het veld telt.*

## 1. Wat er gebeurt (bevestigd)
Openen van een menu in de rail zet **meteen het gereedschap aan**: de laatst gekozen variant (bij *Spelers*: speler rood). Sluiten van het menu zet het gereedschap **niet** uit. Een tik op het veld zet daarom iets neer, ook als je alleen het menu wilde sluiten.

| Menu | Laptop: tik op het veld om te sluiten | Laptop: eerst ×, dan tik op het veld | Telefoon: tik op het veld om te sluiten | Telefoon: eerst ×, dan tik op het veld | Telefoon: deel van het veld onder het menu |
|---|---|---|---|---|---|
| Spelers | **+1 speler** | **+1 speler** | kan niet (menu bedekt het veld) | **+1 speler** | **99%** |
| Hoedjes | +1 hoedje | **+1 hoedje** | +1 hoedje | **+1 hoedje** | 26% |
| Schijfjes | +1 schijfje | **+1 schijfje** | +1 schijfje | **+1 schijfje** | 15% |
| Doelen | +1 doel | **+1 doel** | +1 doel | **+1 doel** | 15% |
| Pijlen | niets (een tik is geen sleep) | niets | niets | niets | 26% |
| Markeren | +1 volgordenummer | **+1 volgordenummer** | +1 | **+1** | 15% |

- **Wél goed:** staat er een speler **gekozen** als je *Spelers* opent (om zijn nummer te wijzigen), dan wordt het gereedschap niet aangezet. Een tik op het veld zet dan niets neer.
- **Ook gemeten:** na *Opstelling 2-1-2* → *Spelers* → × → een tik op een lege plek (bedoeld: niets meer gekozen) komt er een 7e speler bij.

**Oorzaak in de code** (`public/app/tekentool.js`):
- `openRail()` zet `st.tool = laatste(r)` als er niets gekozen is. Dat is bewust zo, uit Besluit 126: *"één tik op Hoedjes = verder met dezelfde kleur"*.
- `sluitMenus()` sluit alleen het paneel en laat `st.tool` staan.
- `onDown()` sluit eerst het menu en plaatst daarna met het actieve gereedschap.

Besluit 126 zegt ook *"Esc of klikken op het veld sluit het menu"*, maar zegt niet dat die klik ook iets neerzet.

**Waarom het vooral bij *Spelers* misgaat:** je opent *Spelers* meestal voor de **nummerknoppen**, niet om losse spelers te tikken. Het menu toont boven het veld de tekst *"Klik op het veld om neer te zetten"*, en de rode knop is omrand. Dat valt naast de nummerknoppen niet op, en op de telefoon ligt die tekst onder het menu. Bij *Hoedjes* is *"tik op Hoedjes, tik op het veld = hoedje"* juist de bedoelde snelle route. De **×** voelt overal als *"klaar"*, maar het gereedschap blijft aan.

## 2. Wat er **niet** fout gaat
- Esc op de laptop sluit eerst het menu; een tweede Esc zet het gereedschap uit. Dat is bedoeld.
- Een tik **op een bestaand object** kiest dat object, ook als er gereedschap aan staat. Er komt dan niets bij.
- *Ongedaan maken* haalt een onbedoeld object weg. Het gaat dus niet om verlies van gegevens, maar wel om een fout die je moet zien en herstellen.

## 3. Mogelijke oplossingen
| | Wat | Voordeel | Nadeel |
|---|---|---|---|
| **A** | **× = stoppen:** sluiten met × zet ook het gereedschap uit (net als *Kies*) | De × doet wat hij lijkt te doen; de snelle route voor Hoedjes blijft | Lost *"tik op het veld om te sluiten"* bij *Spelers* op de laptop niet op |
| **B** | ***Spelers* zet bij openen geen gereedschap aan.** Losse spelers plaatsen: tik op een kleur in het menu, dan op het veld (toetsen 1–4, T en K blijven werken) | De nummerknoppen, het hoofddoel van het menu, kunnen nooit meer een losse speler laten neerzetten | Eén tik extra voor wie losse spelers zonder nummerknop plaatst |
| **C** | **Een tik op het veld terwijl een menu open is, sluit alleen** (voor alle menu's) | Eén regel voor alles; nooit een verrassing | De snelle route uit Besluit 126 (*Hoedjes → tik op het veld*) kost altijd een tik extra; geldt ook voor wie dat bewust doet |
| **D** | Niets aan het gedrag veranderen; alleen een duidelijkere melding (bijv. *"Tik op het veld = speler rood neerzetten"* in het menu) | Geen gedragswijziging | Lost de verrassing niet op; op de telefoon zie je de melding niet |

**Advies: A + B.**
- **A** maakt de × eerlijk, en dat geldt voor alle menu's.
- **B** haalt de oorzaak bij *Spelers* weg zonder de snelle route voor hoedjes, schijfjes en doelen aan te tasten.
- **C** is eenvoudiger uit te leggen, maar maakt de snelste route van ervaren trainers trager. Daarnaast vraagt C om het herzien van een besloten regel (Besluit 126).

*In Afgewezen ideeën staat niets over menu's of gereedschap in de tekentool (gezocht 4-11).*

**Gevolgen:**
- Geen gevolgen voor opgeslagen tekeningen: alleen de bediening verandert, de gegevens niet.
- Het herziet Besluit 126 deels: *"de knop onthoudt de laatst gekozen variant"* blijft, maar geldt niet meer voor *Spelers* bij het openen.
- Maat **M** (gedrag van een bestaande functie). Een voorbeeldscherm is nauwelijks nodig, want het scherm verandert niet. Bij B is alleen de rode knop bij het openen niet meer omrand.

**Apart, niet in dit voorstel (prioriteit 6, mobiel):** op de telefoon bedekt het menu *Spelers* 99% van het veld. Je ziet dus niet waar een speler met een nummerknop terechtkomt. Dat hoort bij het ontwerp voor mobiele bediening.

## 4. Doelgroepen
- **Beginner:** heeft het meeste last. Hij tikt op het veld om *"weg te klikken"* en krijgt een speler of hoedje erbij. A + B voorkomen dat bij Spelers en bij ×.
- **Ervaren trainer:** gebruikt *Hoedjes → tik op het veld* als snelle route. Bij A + B blijft die route, bij C niet.
- **Selectietrainer:** werkt vooral met nummerknoppen en *Opstelling*. Met B zet het menu nooit meer een losse speler neer.

## 5. Tests die bij bouwen nodig zijn
1. Per menu (Spelers, Hoedjes, Schijfjes, Doelen, Pijlen, Markeren): openen, sluiten met ×, tik op een lege plek → **niets erbij**, op laptop en telefoon.
2. *Spelers* openen, tik op een lege plek van het veld → **niets erbij** (laptop).
3. *Hoedjes* openen, tik op het veld → **wel een hoedje**. Dat is de snelle route uit Besluit 126 en die moet blijven.
4. *Spelers* openen, rode knop tikken, dan het veld → speler met het eerste vrije nummer (Besluit 148).
5. Sneltoetsen 1–4, T, K, H en Esc ongewijzigd; bestaande `@tekentool`-tests groen.
