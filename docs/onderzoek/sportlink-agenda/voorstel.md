# Voorstel D — Wedstrijden elke nacht ophalen uit de Sportlink-agenda

*Spoor 3 · maat **L** (server haalt gegevens op en past wedstrijden aan; nieuwe opslag van een geheime link) · 13 november 2026 · nog geen besluit.*
Hoort bij `docs/onderzoek/wedstrijd-bijhouden/voorstel.md` (stap D).

> **Versie 2 (13-11, na vragen van de gebruiker):**
> - De link blijft het hele seizoen geldig. Er is geen knop *Vervangen*, alleen een klein linkje voor een nieuw seizoen of een ander team.
> - **Meer dan 7 dagen** voor de wedstrijd gewijzigd: stil bijwerken, met het label *Gewijzigd · was …* bij de wedstrijd.
> - **7 dagen of minder:** bijwerken **en vanzelf een bericht aan de ouders**, om 07:30 (nachtrust). Dat gaat als push, en per mail voor wie geen meldingen heeft. De teamleider krijgt een kopie.
> - **De teamleider waakt.** Bij *Actie nodig* ziet hij alleen *nieuw*, *verdwenen* en *ophalen lukt niet*.
> - **Eerst stap 1:** de teamleider kan zelf datum en aftrap aanpassen (verzamelen schuift mee), met *Opslaan en ouders inlichten* binnen 7 dagen. Voorbeeld `voorbeeld-stap1.html`. Dit is maat M, apart van D.
>
> **Versie 3 (13-11): één wedstrijd met drie standen**, getoetst aan de vertrekpunten.
> - **Zelfde dag, andere tijd:** de wedstrijd blijft, met afmeldingen en taken (het is dezelfde dag). Binnen 7 dagen gaat er een bericht naar de ouders.
> - **Andere dag:** dezelfde wedstrijd krijgt de nieuwe datum. Afmeldingen, taken en vervoer van de oude dag **vervallen**: ze worden bewaard als *vervallen*, niet gewist (gegevensintegriteit, Besluit 149). Er gaat **altijd** een bericht naar de ouders, en ze geven het opnieuw door. Er wordt dus niemand ongevraagd meegenomen naar een andere dag.
> - **Verplaatst, datum volgt:** dezelfde regel als bij een andere dag. Bij de ouder staat de oude datum doorgestreept met *Verplaatst · nieuwe datum volgt*. Dat is informatie, geen taak (Besluit 34): afmelden of een taak is dan niet nodig. Komt de datum, dan geldt *andere dag*.
> - **Afgelast:** zoals nu, maar via Teams en via de teamleider hetzelfde: een bericht aan de ouders, en taken en vervoer vervallen.
> - Geen tweede, dubbele wedstrijd (Principe 10). Het label *Verplaatst · was za 14 nov* vertelt wat er gebeurde.
> - **Uit Sportlink:** een andere tijd of datum en een uitdrukkelijk *afgelast* gaan vanzelf. Alleen een wedstrijd die zonder reden verdwijnt, wordt een vraag aan de teamleider: *Verplaatst, datum volgt* · *Afgelast* · *Gaat door*. De teamleider is vrijwilliger, dus hij krijgt alleen die echte beslissingen (Besluit 149, *Draaien* = 0 min extra).
> - **Gat dat nu al bestaat (gevonden 13-11):** *Aanpassen* via Teams (Besluit 168) neemt bij een andere dag afmeldingen, taken en vervoer mee, zonder bericht aan de ouders. Afgelast via Teams stuurt geen bericht, afgelast via de teamleider wel. Stap 1 lost beide op.
> - **Maat van stap 1 = L**, niet M. Het raakt afmeldingen van ouders (persoonsgegevens laten vervallen) en het recht van de teamleider om de datum te wijzigen. Daarom gelden de rechtentest en de controle op clubscheiding. Een migratie is naar verwachting niet nodig, maar dat controleer ik eerst lokaal.
>
> Waar hieronder iets anders staat, geldt versie 3.

## 1. Aanleiding
- De wedstrijd van za 14-11 (O13 talententeam, uit bij Sporting Martinus O13-4) is op voetbal.nl verplaatst: aftrap 12:45 → **11:35**. ClubComm wist dat niet. Op 13-11 met een eenmalig script aangepast (`supabase/scripts/2026-11-13_dcg_wedstrijd_1411_tijd.sql`, na akkoord). De ouders hebben daarvan nog geen bericht van ClubComm gekregen.
- De oorzaak is dat ClubComm geen koppeling heeft. De wedstrijden zijn op 17-10 **één keer** ingeladen uit de Sportlink-agenda (iCal) (`supabase/scripts/2026-10-17_dcg_wedstrijden_fase2.sql`). Elke wedstrijd bewaart wel het kenmerk uit die agenda (veld `sportlink`, bijv. `20261017T213937Z-1@sportlink.com`). Daarmee kunnen we later precies dezelfde wedstrijd terugvinden.

## 2. Wat er nu al kan (blijft)
- **Zelf aanpassen** (Besluit 168): Teams → team → wedstrijd → *Aanpassen*.
- **Opnieuw plakken** (Besluit 168): ClubComm toont *gelijk*, *gewijzigd* of *nieuw*. Dat moet je wel zelf doen, en je moet weten dat er iets veranderd is.

## 3. Drie mogelijke bronnen
| | Wat | Voor | Tegen |
|---|---|---|---|
| **A. Agenda-link (iCal) per team** | dezelfde agenda als op 17-10, één link per team | nu al beschikbaar, geen aanvraag bij de bond, alleen wedstrijdgegevens (geen persoonsgegevens) | per team één link; de link kan verlopen als het team verandert |
| **B. Sportlink Club.Dataservice** | sleutel van de club, alle teams in één keer | goed voor meer teams en meer clubs | sleutel aanvragen bij wie Sportlink beheert (staat al sinds 27-09 bij *Openstaand*), andere opbouw |
| **C. Alleen plakken** | wat nu kan | geen bouwwerk | vergeten = verkeerde tijd, zoals nu |

**Advies:** begin met **A** voor het O13 talententeam (pilot). Zodra de sleutel er is, voegen we **B** toe voor alle teams. Voor de app werkt het daarna hetzelfde.

## 4. Hoe het werkt (A)
1. **Eén keer instellen.** Een clubbeheerder plakt bij Teams → team → *Wedstrijdagenda* de agenda-link. Dat is dezelfde export die op 17-10 is gebruikt. In die link zit vaak een geheime code. Daarom ziet niemand de link daarna nog voluit, ook de beheerder niet: alleen *ingesteld op 13 nov · laatst gelukt 04:00*. Je kunt de link wel vervangen of weghalen. **Nooit via de chat.**
2. **Elke nacht om 04:00** haalt de server de agenda op. Op een wedstrijddag kijkt hij om **07:30** nog een keer. Het ophalen past bij de bestaande automaat (pg_cron + Edge Function, Besluit 77), maar als een eigen taak.
3. **Vergelijken** op het kenmerk `sportlink`. Is er geen kenmerk, bijvoorbeeld bij een zelf toegevoegde wedstrijd, dan wordt er vergeleken op datum en tegenstander.
4. **Wat ClubComm zelf aanpast** (feiten van de bond):
   - datum, aftrap, einde (aftrap + speelduur + 15);
   - thuis/uit, tegenstander en adres.
   - **De verzameltijd schuift mee** met hetzelfde aantal minuten als jij gekozen had. Voorbeeld: verzamelen 65 minuten vóór de aftrap blijft 65 minuten.
   - Het gaat via dezelfde weg als *Aanpassen* (Besluit 168): een begeleidingsmoment schuift mee, afmeldingen, taken en vervoer blijven staan.
5. **Wat ClubComm níet zelf doet** (*ClubComm signaleert, mensen beslissen*):
   - Een wedstrijd die uit de agenda verdwijnt of daar als afgelast staat, wordt **niet** vanzelf afgelast of weggehaald. De staf krijgt de regel *"Staat niet meer in Sportlink: za 21 nov AGB. Afgelasten?"*.
   - Een **nieuwe** wedstrijd (bijv. een beker- of inhaalwedstrijd) komt erbij als regel *"Nieuw in Sportlink: … Toevoegen?"*. Hij wordt niet vanzelf toegevoegd, want soms speelt een ander team van de club.
   - **De ouders krijgen geen automatisch bericht midden in de nacht.** De trainer en de teamleiders krijgen bij *Actie nodig* de regel *"Wedstrijd za 14 nov gewijzigd: aftrap 12:45 → 11:35 · verzamelen 10:30"*. Met één knop sturen ze een kant-en-klaar bericht naar de ouders: *Stuur de ouders een bericht*. Na het sturen verdwijnt de regel.
6. **Valt het ophalen twee nachten achter elkaar uit** (link verlopen, site onbereikbaar), dan krijgt de clubbeheerder één regel: *"Wedstrijdagenda O13 werkt niet meer. Link vervangen?"*. De wedstrijden blijven dan zoals ze waren.

## 5. Gegevens, rechten en privacy (zware controle bij maat L)
- **Welke gegevens:** alleen het wedstrijdprogramma (datum, tijd, tegenstander, adres van het sportpark, kenmerk). Er zitten geen namen van kinderen of ouders in. De agenda-link zelf is geheim.
- **Waar en wie:** de link komt in een aparte tabel aan de serverkant. RLS staat aan en er zijn geen leesregels, net als `automaat_geheim`. Alleen de server leest de link.
  - Een clubbeheerder kan hem zetten of weghalen via een databasefunctie die eerst controleert of je beheerder van díe club bent (clubscheiding).
  - Ouders, trainers en teamleiders kunnen de link niet lezen of zetten.
- **Hoe lang:** de link blijft tot de beheerder hem weghaalt of tot het seizoen afloopt (dan opnieuw zetten). Een logboek met wat er per nacht veranderde (oud → nieuw) blijft 30 dagen bewaard, voor als iemand vraagt *"waarom staat dit zo?"*.
- **Database:** migratie **036** met de tabel, twee functies (zetten/weghalen) en de nachtelijke taak. Daarbij hoort een lokale rechtentest:
  - ouder, trainer en beheerder van een andere club worden geweigerd;
  - de beheerder van de eigen club mag zetten, maar leest nooit de volledige link terug.
- **Productie:** niets in de database of de rechten zonder apart akkoord. Eerst lokaal testen met een nagemaakte agenda (een bestand met dezelfde opbouw als de echte, met verzonnen gegevens). Wat niet echt getest is, heet niet *gecontroleerd*.

## 6. Afgewezen ideeën nagekeken
Er staat geen afgewezen idee over Sportlink of de wedstrijdagenda. Wel bekeken:
- *Automatisch posten in WhatsApp-groepen* (Besluit 9) blijft afgewezen. Het bericht gaat via ClubComm.
- *Automatisch taken toewijzen of vervoer indelen* (Besluit 76) blijft afgewezen. Taken en vervoer blijven staan en worden niet opnieuw ingedeeld.

## 7. Stappen (elk met een eigen akkoord)
1. **D1 — voorbeeld op 390 px:** het instelscherm *Wedstrijdagenda* en de regel *Wedstrijd gewijzigd* met de knop voor de ouders. Daarna een besluit.
2. **D2 — bouwen en lokaal testen:** migratie 036 + Edge Function `agenda` + rechtentest + Playwright-tests (gewijzigd, nieuw, verdwenen, link kapot, verzameltijd schuift mee). Pull request.
3. **D3 — toepassen:** migratie en functie in productie na akkoord. Jij zet de link van het O13 talententeam (zelf, in de app). Daarna draait het één week mee en kijken we elke ochtend of het klopt.
4. **Later — B:** de Club.Dataservice-sleutel, zodra DCG die heeft. Dan werkt het voor alle teams zonder een link per team.

## Voorbeelden (13-11, versie 2)
- `voorbeeld-stap1.html` / `.jpg` (stap 1, versie 3):
  1. zelfde dag, andere tijd;
  2. andere dag (afmeldingen en taken vervallen);
  3. de ouder ziet *Verplaatst · nieuwe datum volgt*;
  4. de nieuwe datum, met afmelden en taken opnieuw.
- `voorbeeld.html` / `.jpg` (voorstel D, versie 3: de vraag bij een verdwenen wedstrijd heeft drie knoppen):
  1. één keer per seizoen instellen;
  2. binnen 7 dagen: vanzelf een bericht om 07:30;
  3. meer dan 7 dagen: stil bijgewerkt, met label;
  4. de teamleider waakt (nieuw, verdwenen, ophalen lukt niet).
- Beide zijn nog niet akkoord. Verzonnen club en namen.

## 8. Wat ik van jou nodig heb
- **Akkoord op het advies** (A nu, B later) en op het principe in punt 5: tijden worden vanzelf bijgewerkt, ouders krijgen pas een bericht als de staf op de knop tikt.
- Weet je nog waar je op 17-10 de agenda-export vandaan haalde (voetbal.nl of de Sportlink-app)? Dan schrijf ik dat precies in het instelscherm. **Plak de link zelf niet in de chat.**
