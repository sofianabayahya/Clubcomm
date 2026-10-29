# De drie sporen van ClubComm

*Vastgelegd 29-10-2026. Dit is een **routekaart**, geen tweede register: welke afspraken gelden, staat alleen in `docs/besluiten.md`. Hier staat per spoor waar het over gaat, wat je leest en wat de volgende stap is. Hoe de lagen technisch werken: `docs/architectuur.md`.*

| | Spoor 1 — Persoonlijk | Spoor 2 — Swift | Spoor 3 — ClubComm |
|---|---|---|---|
| Waarover | De eigen voetbalmethodiek van de initiatiefnemer | De jeugdmethodiek van AVV Swift | Het platform voor alle clubs |
| Oefenomgeving | DCG O13 talententeam | Swift O14–O19 (HJO bovenbouw) | Alle clubs |
| Mag besluitnummers geven | Nee (*"Voorstel Spoor 1 — …"*) | Nee (*"Voorstel Spoor 2 — …"*) | **Ja** |
| Mag samenvoegen met `main` en publiceren | Nee | Nee | **Ja** (na de controles) |

**Welk spoor is actief?** Het bericht van de gebruiker begint met `SPOOR 1 — PERSOONLIJK`, `SPOOR 2 — SWIFT` of `SPOOR 3 — CLUBCOMM`. Staat er niets, vraag het dan voordat je iets wijzigt.

**Raakt iets meer sporen?** Splits het in twee delen:
- de **inhoud**: wat het betekent voor deze methodiek;
- de **software**: welke algemene functie ervoor nodig is (altijd Spoor 3).

---

## Spoor 1 — Persoonlijk

**Doel en afbakening**
- De persoonlijke voetbalmethodiek van de initiatiefnemer: AZ, Ajax, KNVB, VC4/UEFA A Youth en eigen ervaring.
- DCG O13 is de huidige oefenomgeving.
- Deze inhoud gaat **nooit vanzelf** naar Swift of een andere club. Overnemen kan alleen per onderdeel, als de gebruiker het uitdrukkelijk vraagt.

**Leidende documentatie**
- `docs/methodiek/persoonlijk/` (tot 29-10 `docs/methodiek/dcg/`). Het kerndocument `01-kerndocument-v1.0.md` is leidend.
- Overdracht en werkregels: `docs/methodiek/persoonlijk/overdracht.md`.
- Het profiel: `supabase/profielen/dcg.json` (leesbaar: `profiel-v3-controle.md`).

**Vastgestelde uitgangspunten** (zie het register)
- Besluit 121 en 123: methodiek als gegevens in een opleidingsprofiel, niet in de code.
- Besluit 133, 137 en 138: profiel v3, periodisering, Mijn lijn en vaardigheden.
- Besluit 133 (uitleg 29-10): de methodiek is inhoudelijk persoonlijk, maar draait technisch via het **DCG-clubprofiel** (id `dcg`). Dat blijft zo tot een apart besluit over een persoonlijk trainersprofiel.

**Wat er gebouwd is**
- Profiel v3 staat in de database.
- Periodisering O13 is geladen (script van 29-10).
- In de app: methodiekblok, leerniveau per blok, evaluatie, observatiepunten, Mijn lijn, vaststellen, afgelaste training en *Vorm kiezen* vanuit de vaardigheid.

**Openstaande vragen**
- Wordt het later een **persoonlijk trainersprofiel** (los van de club DCG)? Dat is een apart besluit in Spoor 3.
- Hoe worden oefenvormen en tekeningen aangeleverd? Alleen door de initiatiefnemer, er wordt niets verzonnen.

**Volgende stap**
- Bepaalt de methodiekchat (Spoor 1).
- Software die daarvoor nodig is, gaat als *"Voorstel Spoor 1 — …"* naar Spoor 3.

---

## Spoor 2 — Swift

**Doel en afbakening**
- De jeugdmethodiek van AVV Swift: KNVB-visie plus het jeugdbeleidsplan van de club. Focus O14–O19.
- De gebruiker is daar **HJO bovenbouw** (inhoudelijke functie). Zijn technische rollen in ClubComm (HO, clubbeheerder) zijn iets anders.
- **Geen DCG-inhoud** gebruiken zonder uitdrukkelijke toestemming.

**Leidende documentatie**
- `docs/methodiek/swift/README.md` (structuur; de inhoud volgt).
- Het jeugdbeleidsplan van Swift moet nog worden aangeleverd.
- KNVB-standaard: `supabase/profielen/knvb-2026.1.json` (grotendeels nog leeg of *controleren*).

**Vastgestelde uitgangspunten** (zie het register)
- Besluit 99 en 100: pakket *Alleen Trainers begeleiden* (`club.pakket = 'trainers'`).
- Besluit 134: begeleiden vanuit de KNVB.
- Besluit 136: teams en trainingen zelf beheren.

**Wat er gebouwd is**
- Swift werkt met het pakket Trainers begeleiden.
- Teams O16-2 en O15-1 hebben wedstrijden; O16-2 heeft een rooster met trainingen.
- Swift heeft **nog geen opleidingsprofiel**. De KNVB-standaard wordt door de app nog niet geladen (zie `docs/architectuur.md`).

**Openstaande vragen**
- Het jeugdbeleidsplan aanleveren.
- Wie stelt de Swift-methodiek vast: TC, HJO of bestuur?
- Komt er een Swift-profiel *afgeleid* van de KNVB, of eerst de KNVB-standaard zoals hij is?

**Volgende stap**
- Het jeugdbeleidsplan aanleveren.
- Daarna in Spoor 2 de inhoud voorbereiden, als *"Voorstel Spoor 2 — …"*.

---

## Spoor 3 — ClubComm

**Doel en afbakening**
- Het algemene platform: schermen, rechten, pakketten, modules, database, publicatie.
- Werkt voor elke club en elk profiel. Er staat geen methodiek in de code.

**Leidende documentatie**
- `CLAUDE.md` (werkwijze en controles) en `docs/besluiten.md` (het register).
- `docs/architectuur.md` (lagen en voorwaarden) en `docs/productie-en-groei.md` (Openstaand).
- `docs/app-controle.md` en `docs/pilotlog.md`.

**Vastgestelde uitgangspunten**
- Alleen Spoor 3:
  - geeft definitieve besluitnummers;
  - houdt het register bij;
  - voegt samen met `main`;
  - lost conflicten op;
  - draait de integratietests;
  - publiceert.
- Alleen gecontroleerde commits op `main` gaan online.
- Samenvoegen met `main` publiceert vanzelf (Vercel); werkbranches krijgen alleen een afgeschermde voorbeeldversie. Daarom samenvoegen alleen na akkoord, en daarna controleren dat productie gelijk is aan die commit.

**Wat er gebouwd is**
- Zie het register; hoogste besluit nu: **139**.

**Openstaande vragen** (nog geen bouwopdracht)
- Eén algemene oefenvormkiezer: gebouwd als Besluit 139 (pull request ter beoordeling). Daarna wordt PR #92 gesloten.
- Profiel veilig leesbaar maken voor trainers (rechten en rechtentest).
- KNVB-standaardprofiel bruikbaar maken.
- Lijn en andere methodiekafhankelijke schermen gelijktrekken.
- Rechtenvoorstel 032 (begeleider kijkt mee, clubbank): wacht op akkoord.

**Volgende stap**
- Zie de volgorde in `docs/productie-en-groei.md` → **Openstaand**.
