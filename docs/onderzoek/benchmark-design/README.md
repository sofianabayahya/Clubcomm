# Benchmark en design system: controle van het rapport (4 november 2026)

*Spoor 3 — ClubComm. Alleen onderzoek: er is niets veranderd aan de app, de database, de rechten of productie. Uitgangspunt is het rapport van de andere ontwikkelaar (in de chat aangeleverd, punten 1–8). Elk advies is hier nagelopen tegen de code op `main` (d5c6dbc).*

**Labels**
- **Gecontroleerd:** zelf in de code of met een meting nagegaan.
- **Publieke claim:** wat een aanbieder zelf zegt (appwinkel, eigen site, nieuws). Niet zelf getest.
- **Interpretatie:** een ontwerpkeuze of advies; geen feit.

**Beperking.** De drie sites (`www.feeton.eu`, `voetbalplanner.nl`, `rinus.knvb.nl`) zijn vanuit deze omgeving geblokkeerd. Daarom heb ik over de concurrenten **niets zelf gecontroleerd**. Alles hieronder over hen is een publieke claim. Huisstijl, typografie, navigatie en de ingelogde schermen van de concurrenten zijn niet beoordeeld. Niets is overgenomen uit hun oefenstof of ontwerpen.

---

## 1. Concurrenten (alleen publieke claims)

| | Wat de aanbieder zegt | Bron | Wat dit voor ClubComm betekent (interpretatie) |
|---|---|---|---|
| **Feeton** | Leerplan per leeftijd (5–19 jaar). Meer dan 1.000 oefeningen en 900+ trainingen. Eigen trainingsplannen in een kalender. **Offline beschikbaar** in de coach-app. Een aparte spelersapp met huiswerk. Onlangs een nieuw ontwerp. | App Store-beschrijvingen | Starten vanuit bestaande inhoud werkt. Het rapport noemt 1.200 vormen; de appwinkel noemt er "meer dan 1.000". Het getal is dus niet hard. |
| **KNVB Rinus** | Losse oefeningen, complete trainingen en programma's van meerdere weken. Printen op één A4, volgens één KNVB-bron alleen via de website. Over een echte offline modus in de app vond ik geen bron. | knvb.nl (nieuws en veelgestelde vragen) | Printen is bij Rinus de offline route. ClubComm heeft al *Printen* (Besluit 132). |
| **VoetbalPlanner** | **Niet gevonden.** Ook een zoekopdracht vond geen appwinkelbeschrijving met deze naam. | — | Het rapport baseert zich op een appwinkelbeschrijving die ik niet kon terugvinden. Vóór we hierop bouwen, is de exacte app of aanbieder nodig. |

---

## 2. De adviezen naast de code

| # | Advies uit het rapport | Wat de code nu doet (gecontroleerd) | Oordeel |
|---|---|---|---|
| 3 | Kleuren: #0869C2, #0B2545, #F5F7FA, #FFFFFF, #137333, #A84D08, #DC2626, #E3E9F1 | **Klopt precies.** Dit zijn de variabelen bovenaan `public/app/app.css`. Er bestaat ook een logoblauw #0D88F9. | Blauw behouden: eens |
| 1 | Eén design system | Er zijn al variabelen (552 keer gebruikt) en één `.knop`-reeks, alle met een tikvlak van 44 px. Maar in de CSS staan ook **137 losse kleurcodes** buiten de variabelen. Verder **18 verschillende lettergroottes** en **17 verschillende afrondingen** (meestal 12, 10 en 8 px). In de JavaScript staat 25 keer een losse stijl. | **Terecht**, en nu met meetbare cijfers |
| — | Leestekst 16 px (onze eigen norm, `docs/app-controle.md`) | **146 regels** gebruiken 12–14 px, en maar 13 regels 16 px. Een deel daarvan is bijschrift, en dat mag kleiner. Welke regels echte leestekst zijn, is **nog niet nagegaan**. | Nieuw punt: nalopen |
| — | Contrast 4,5:1 | De meeste paren halen het: blauw op wit 5,5; grijs op achtergrond 5,1; oranje 5,05; groen 5,3. **Twee missen het:** het rode label (`.chip.rood`, rood op lichtrood) haalt **4,17**, en het logoblauw op wit 3,56. Het logoblauw wordt niet als tekstkleur gebruikt. | Klein, duidelijk probleem: het rode label |
| 6 | Overal "oefenvorm" | Op `main` staat nog 3 keer *Nieuwe vorm*. Dat wordt al opgelost in de open pull request #113 (Besluit 150). | Al onderweg |
| 2 | Starten vanuit complete voorbeeldtrainingen | Er zijn sjablonen (DCG 75, Besluit 131). *Eerdere training gebruiken* staat in #113. **Complete voorbeeldtrainingen zijn er niet.** Die inhoud moet per clubprofiel komen (Spoor 1 en 2), zonder materiaal van derden. | Terecht, maar het is vooral een **inhoudsvraag** |
| 3 | Slim zoeken in de vormenbank | **Bestaat al grotendeels:** zoeken (ook op synoniemen), filters op type, weerstand, leerdoel, *past bij X spelers*, ≤ 10 min en keepers (Besluit 131). Wat er niet is: zoeken op leeftijd en op duur als bereik. | Deels gedaan; klein restpunt |
| 5 | Eén doorgaande trainingsroute | De route bestaat al (Lijn, Plannen, Week, Vormenbank; Besluit 141). Er zijn nog overgangen tussen schermen; zie het UX-onderzoek op `onderzoek/ux-audit`. | Al in onderzoek |
| 6 | Tekentool: object-id los van het rugnummer | Is per Besluit 148 (nu op `main`) een begrip: het rugnummer is alleen een label. | Gedaan |
| 9 | Autosave, herstel | Er is autosave en *ongedaan maken*. Een zichtbare melding *"bewaard"* is wisselend (toast-voorstel in #113). | Grotendeels gedaan |
| 7 | Kopie mag geen uitvoering meenemen | **Gedaan:** bij kopiëren gaan de vastlegging en de uitgevoerde minuten eruit (Besluit 147, `public/app/training.js`). | Gedaan |
| 7 | Rechten in de database, niet alleen in het scherm | **Klopt al:** alle rijen gaan via RLS met `priv.cc_mag` (scopes). Een trainingsvoorbereiding staat in scope *eigen*: niemand anders kan hem lezen. | Gedaan |
| 7 | **De HJO alleen voor eigen teams** | **Terecht, en een echt punt.** Een HO of TC leest nu de dossiers van **alle** trainers van de club. In `priv.cc_begeleider()` (migratie 025) telt alleen de rol, niet aan wie hij is toegewezen. Het voorstel 032 (meekijken) maakt dit beperkter (alleen trainers met een traject dit seizoen, alleen als de club dat aanzet), maar nog steeds niet per begeleider. Bij Swift (HJO bovenbouw O14–O19) zou een andere HJO dan ook de bovenbouw zien. | **Maat L.** Apart voorstel, vóór 032 wordt toegepast |
| — | Offline | Bewuste keuze: de service worker haalt altijd eerst van het netwerk, en er worden geen gegevens op de telefoon bewaard (privacy). Printen is de offline route. Feeton zegt offline te werken. | Niet overnemen zonder privacyafweging |
| 6 | Testen op 320, 390, 768 en 1366 px | Tests bestaan op 390 px en voor de laptop (vanaf 1100 px). Met 320 px, vergrote tekst of landscape wordt niet getest. Er is geen automatische toegankelijkheidstest (zoals axe) en geen meting van de laadsnelheid. | Terecht; past bij de tests |
| — | Geen ranglijsten en beloningen | Komt overeen met de afgewezen ideeën *Ranglijsten* (Besluit 28, 29, 62) en *Leerplatform met cursussen* (Besluit 121). | Eens; niet opnieuw voorstellen |

**Over de standaarden (NN/g, Apple HIG, Material 3, WCAG 2.2, Core Web Vitals, OWASP ASVS).** Het rijtje is goed. Voor ClubComm zou ik **twee als harde norm** kiezen: **WCAG 2.2 AA** (deels al in `docs/app-controle.md`) en **OWASP ASVS** voor de rechten. NN/g en Apple HIG gebruik je als toetsvragen bij een voorbeeldscherm. **Material 3 niet overnemen:** dat is een compleet eigen componentsysteem, en een tweede systeem naast onze eigen CSS geeft juist weer ongelijkheid. *(Interpretatie.)*

---

## 3. Richting A of B

**Interpretatie.** Richting A (rustig, één hoofdactie) past bij Besluit 30, 34 en 149: actie eerst, kleur alleen voor aandacht, één duidelijke hoofdactie. Richting B (compacter) alleen waar iemand veel moet vergelijken: het overzicht van de HJO, de vormenbank op de laptop. Dat sluit aan bij het advies van het rapport.

Ik heb nog **geen voorbeeldschermen gemaakt**. Dat is de volgende stap: maat M, op 390 px.

---

## 4. Voorstel: ClubComm Design System & Product Quality Standards

Volgens Besluit 151 komt dit niet in een losse PDF, maar in GitHub:

1. **Ontwerpregels** in een nieuw document *docs/design-system.md*: de bestaande variabelen, en vaste waarden voor tekstgrootte (4–5 stappen), afronding (3 stappen) en ruimte. Eerst **meten en vastleggen wat er is**, dan pas opruimen.
2. **Kwaliteitsnormen:** `docs/app-controle.md` uitbreiden met WCAG 2.2 AA, de schermbreedtes 320, 390, 768 en 1100+, de toestanden leeg, gevuld en fout/ongedaan, en de rechten- en privacyvragen van maat L.
3. **Per pull request** een kort blok *Design en kwaliteit*, naast *Documentatie-impact*: welke componenten, welke toestanden getest, welke breedtes.
4. **Pas verplicht** nadat het voorbeeldscherm (A/B) is beoordeeld en de regels zijn vastgesteld in een besluit. Het eerstvolgende vrije nummer is nu 152.

---

## 5. Volgorde (eerst risico, dan waarde)

1. **Rechten van de HJO per toewijzing** (maat L): eerst een voorstel, en dat afstemmen met 032. Dit gaat vóór alles, omdat het over persoonsgegevens gaat.
2. **Klein en duidelijk:** het contrast van het rode label naar ≥ 4,5:1 (maat S).
3. **Inventaris van het design system:** de echte lettergroottes, kleuren en afrondingen per scherm, en welke tekst leestekst is. Alleen meten, niets veranderen.
4. **Voorbeeld A/B** op 390 px voor één scherm (*Mijn training*) (maat M).
5. **Test op 320 px en een automatische toegankelijkheidstest** in de bestaande Playwright-tests.
6. **Voorbeeldtrainingen per clubprofiel:** de inhoud komt van Spoor 1 en 2, eigen materiaal, niets van derden.

**Status:** alleen onderzoek; geen code aangepast.

## Bronnen (publieke claims)
- [feeton coach (App Store)](https://apps.apple.com/app/id1077046106)
- [feeton training ground (App Store)](https://apps.apple.com/nl/app/feeton-training-ground/id6451439196)
- [KNVB: online assistent-trainer Rinus populair](https://www.knvb.nl/nieuws/amateurvoetbal/uitgelicht/44931/online-assistent-trainer-rinus-populair-onder)
- [KNVB: hoe werkt het (Rinus)](https://www.knvb.nl/assist-trainers/training-wedstrijd-en-team/ondersteuning-rinus/de-basisprincipes-van-rinus/hoe-werkt-het)
- [KNVB: eigen trainingen maken](https://www.knvb.nl/nieuws/assist-trainers/assist-trainers/50187/circuittrainingen-eigen-trainingen-maken-de-nieuwe)
