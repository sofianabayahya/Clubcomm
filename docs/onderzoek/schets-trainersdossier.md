# Schets: trainersdossier en Trainers begeleiden (10 oktober 2026)

*Schets, nog niet gebouwd. Hoort bij Besluit 97, stap 4. Volgt principe 10 (overzichtelijk, nooit een overkill) en Besluit 98 (de HO is eindverantwoordelijk voor de voetballijn).*

## Het idee in één zin
Per trainer één dossier waarin de begeleiding van het seizoen **vanzelf** wordt bijgehouden. De HO (of TC) werkt erin, de trainer kijkt mee voor zijn eigen ontwikkeling.

## De seizoenscyclus (wat de app bijhoudt)
```
1 Kennismaking     2 Observaties                     3 Voortgangsgesprek   4 Terugblik
  leerdoel           2× training + 2× wedstrijd         februari: doorgaan?    einde seizoen
  afspreken          elk met nagesprek en                                      volgend seizoen
                     één ontwikkelpunt
```
De aantallen stelt de clubbeheerder in (Regels → Trainers begeleiden). Standaard 2 + 2, voortgangsgesprek in februari.

---

## Scherm 1 · Rapport Trainers (bestaat, krijgt erbij)
```
┌──────────────────────────────────────┐
│ ← Rapport trainers                   │
│ [Alles] [Mini's] [Onderbouw] …       │
│ 22 trainers · 88 observaties · 14 ✓  │  ← werkdruk (nieuw)
│ [Alle trainers] [Vraagt aandacht (2)]│
│                                      │
│ ★ Gevolgd (3)                    ⌃   │  ← volglijst bovenaan (nieuw)
│   O9-1 · Dennis Peters               │
│   1/4 observaties · nieuw sinds sep  │
│                                      │
│ Onderbouw · 13 teams · 91%       ⌃   │
│ ▌O8-1 · Samira Brouwer               │
│   5× afgemeld · 0/4 observaties      │  ← stand begeleiding (nieuw)
│   O8-2 · Peter Hendriks              │
│   2/4 observaties                    │
└──────────────────────────────────────┘
```
Tik op een trainer → zijn dossier.

## Scherm 2 · Trainersdossier (HO of TC)
```
┌──────────────────────────────────────┐
│ ← Dennis Peters               ☆ Volg │
│ Trainer O9-1 · Onderbouw · sinds sep │
│ KNVB: Pupillentrainer (UEFA C)  ✓    │
│ VOG: geldig tot 03-2028         ✓    │
│                                      │
│ BEGELEIDING 2026/27                  │
│ Leerdoel: spelers vaker zelf laten   │
│   oplossen door vragen te stellen    │
│ Ontwikkelpunt: eerst kijken, dan     │
│   coachen (sinds 8 okt)              │
│ ✓ Kennismaking · 12 sep              │
│ ◐ Training     1 van 2               │
│ ○ Wedstrijd    0 van 2               │
│ ○ Voortgangsgesprek · februari       │
│ [ Observatie starten ]               │  ← één knop, op de vaste plek
│                                      │
│ TIJDLIJN                             │
│ 8 okt  Observatie training ·  Verslag│
│ 2 okt  Te laat afgemeld (ziek)       │
│ 12 sep Kennismaking · leerdoel       │
│ Toon alles (7)                       │
│                                      │
│ ▸ Afmeldingen dit seizoen (2)        │  ← ingeklapt
│ ▸ Notities (alleen jij)              │  ← ingeklapt, trainer ziet dit niet
│ [ Contact vastleggen ]               │
└──────────────────────────────────────┘
```
- **Kop:** KNVB-diploma en VOG vult de clubbeheerder of de HO één keer in. Een VOG die binnenkort verloopt, wordt oranje. Dat is organisatie, dus het signaal gaat naar de coördinator, niet naar de HO.
- **Begeleiding:** de stand rekent de app zelf uit uit de tijdlijn. Niemand hoeft iets bij te houden.
- **Eén knop "Observatie starten"** op een vaste plek (Besluit 30). Hij kiest vanzelf de eerstvolgende training of wedstrijd van het team.

## Scherm 3 · Observatie (het evaluatieformulier, nu in de app)
Dezelfde opbouw als `/evaluatie` (Besluit 93), maar gekoppeld aan de trainer en de activiteit:
```
1 Voorgesprek     leerdoel · voetbalprobleem · gewenst spelersgedrag (2–3) · focus HO · feedbackmoment
                  (het leerdoel en het open ontwikkelpunt staan al ingevuld)
2 Observatie      wedstrijd: 1e helft laatste 20 min · rust · 2e helft eerste 20 min
                  training:  begin · middendeel · slot
                  per moment: minuut · Vraag/Directief/Correctie/Compliment · coach zegt/doet · spelers doen daarna
3 Nagesprek       6 stappen (eerste gevoel → leerdoel → effect op spelers → voetbalinhoud → feedback HO → volgende stap)
                  → één concreet ontwikkelpunt (verplicht)
4 Afronden        "Delen met de trainer" → de trainer ziet het verslag en vult zijn reflectie in
```
- **Op het veld:** werkt op de telefoon. Het papieren formulier (Besluit 93) blijft: invullen op papier en daarna overtikken mag ook.
- **PDF:** zoals nu, voor de HO-opleiding of het archief.
- **`/evaluatie` blijft bestaan** voor wie ClubComm niet gebruikt, zoals een medecursist.

## Scherm 4 · De trainer zelf: "Mijn ontwikkeling"
In het profiel van de trainer (geen extra tabblad, geen melding behalve bij een gedeeld verslag):
```
┌──────────────────────────────────────┐
│ ← Mijn ontwikkeling                  │
│ Leerdoel: spelers vaker zelf laten … │
│ Ontwikkelpunt: eerst kijken, dan …   │
│ Begeleiding: 1 van 4 observaties ·   │
│   voortgangsgesprek in februari      │
│                                      │
│ 8 okt  Observatie training  · Nieuw  │
│        [ Reflectie invullen ]        │  ← 3 korte vragen
│ 12 sep Kennismaking                  │
│ Afmeldingen dit seizoen: 2           │
└──────────────────────────────────────┘
```
De trainer ziet **alles uit zijn dossier**, behalve de notities van de HO. Bij een gedeeld verslag krijgt hij **één** pushmelding: *"Je verslag van de observatie staat klaar"*.

## Scherm 5 · Home van de HO (bestaat, krijgt erbij)
- **Deze week:** observaties die je hebt gepland staan bij de dag (*"Za: observatie Dennis Peters, O9-1 thuis 10:30"*).
- **Te doen**, alleen als het ertoe doet (Besluit 97):
  - *"Begeleiding loopt achter: 3 trainers"* (halverwege het seizoen nog geen observatie);
  - *"Nieuwe trainer: Dennis Peters, nog geen kennismaking"* (na 4 weken);
  - *"Ontwikkelpunt open sinds 6 weken: …"*.
  Vanaf 3 in één regel.
- **Februari:** *"Voortgangsgesprekken: nog 5 trainers"*, tot het gedaan is.

---

## Privacy (Besluit 97)
- **Wie ziet het dossier:** de HO, de TC van die bouw en de trainer zelf (behalve de notities van de HO). Geen coördinator, geen teamleider.
- **Wat het niet bevat:** geen beoordeling met cijfers en geen ranglijst van trainers (zie Afgewezen ideeën: ranglijsten).
- **Bewaartermijn:** het dossier blijft bewaard zolang de trainer bij de club is. Na vertrek wordt het gewist; de termijn is nog te kiezen.

## Wat ik nodig heb voordat ik bouw
1. **Observatie bij een training:** zijn de drie delen goed (begin, middendeel, slot)? Of wil je bij een training een andere indeling?
2. **Wie vult het KNVB-diploma en de VOG in:** de clubbeheerder (administratief) of de HO?
3. **Een VOG die verloopt:** signaal naar de coördinator (organisatie)? Of liever naar de clubbeheerder?
4. **Bewaartermijn na vertrek** van een trainer: bijvoorbeeld 1 jaar, of meteen wissen?
5. **Bouwen in twee delen?**
   - **4a:** dossier, cyclus, volglijst, werkdruk en "Mijn ontwikkeling";
   - **4b:** de observatie in de app (het formulier verhuist).

   Zo kun je 4a al gebruiken terwijl ik 4b bouw.
