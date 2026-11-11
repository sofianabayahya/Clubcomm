# Voorstel: wedstrijd bijhouden zonder wegvallen, en basis en wissels terugzien (Spoor 3)

> 7 november 2026, branch `onderzoek/wedstrijd-bijhouden`. Alleen onderzoek: geen code, database of rechten gewijzigd. In productie is alleen **gelezen** (foutregistratie, publicaties, de wedstrijdrijen van vandaag).
> Namen van kinderen staan **niet** in dit document; voorbeelden gebruiken verzonnen namen.

## 1. Wat er vandaag gebeurde (feiten)

**Wedstrijd:** O13 talententeam – tegenstander, thuis, 12:30–13:45.

| Wat | Gevonden |
|---|---|
| Wie hield de score bij | een ouder die in de app **als Timekeeper** bij deze wedstrijd stond |
| Fouten in de app (tabel `fout`) | **geen** tijdens de wedstrijd |
| Nieuwe versie van de app tijdens de wedstrijd | **nee**: de laatste publicatie was om 00:33, de volgende om 15:25. Zelf herladen door een nieuwe versie verklaart het dus niet |
| Opgeslagen bij de wedstrijd | **geen doelpunten, geen wissels, geen schema**. De wedstrijd zelf is het laatst gewijzigd om 10:43 (door de staf) |
| Vangnet (Besluit 117) | om 13:55 een **voorstel** van de timekeeper aan de trainer met alleen *uitslag 0-0, klaar*, **zonder doelpunten** |
| Bericht aan de ouders | om 13:54 ging **"… : 0-0"** naar alle ouders van het team (pushmelding). **De echte uitslag was 7-2.** |

**Wat dit betekent:**
1. Een voorstel ontstaat alleen als de **database weigert** op te slaan (Besluit 117). Het wedstrijdgegeven van de timekeeper is dus geweigerd, terwijl Besluit 116 (migratie 029) dat juist toestaat.
2. De app vernieuwt elke 30 seconden en elke keer dat je terugkomt in de app (`live.js`, *ververs*). Wat de database weigerde, telt daarbij als "klaar" en wordt **overschreven met wat er op de server staat**. Doelpunten die net zijn ingevoerd, verdwijnen dan weer. Dat past bij "het viel de hele tijd weg".
3. Toen de uitslag werd afgesloten, waren de doelpunten al weg. Daardoor kreeg het voorstel 0-0, en ging ook het bericht aan de ouders met 0-0 de deur uit.

**Wat nog niet zeker is:** *waarom* de database de timekeeper weigerde. De taak staat goed (*Timekeeper*, juiste persoon, juiste datum). De regel in de database (`priv.cc_bewaak`) laat een niet-stafslid alleen doelpunten en uitslag wijzigen, en weigert de **hele** wedstrijd als ergens anders iets anders is dan op de server. De waarschijnlijkste oorzaak is dat de telefoon een **verouderde versie van de wedstrijd** had (de staf wijzigde de wedstrijd om 10:43). Dat wil ik eerst nabootsen in de lokale testdatabase voordat ik iets aanpas.

**Ook mogelijk, en makkelijk te voorkomen:** het scherm ging steeds op slot (er gebeurt minutenlang niets), en bij terugkomen vernieuwde de app (zie punt 2).

## 2. Voorstel A: nooit meer wedstrijdgegevens kwijt (maat **L**: opslag en rechten, gegevensverlies)

1. **Alleen opsturen wat de timekeeper wijzigt.** Doelpunten, uitslag en wissels gaan via een eigen databasefunctie die alleen die velden aanpast, niet als hele wedstrijd. Een verouderde wedstrijd op de telefoon kan het opslaan dan niet meer blokkeren.
2. **Niets overschrijven wat nog niet is opgeslagen.** Bij vernieuwen blijven doelpunten, uitslag en wissels die de server (nog) niet heeft op de telefoon staan. Ze worden opnieuw verstuurd, of gaan als voorstel naar de trainer.
3. **Reservekopie op de telefoon.** Elk doelpunt en elke wissel wordt ook op het toestel bewaard. Na herladen, een lege batterij of een vastgelopen app komt alles terug met de melding *"3 doelpunten van vandaag teruggezet"*.
4. **Zichtbaar of het is opgeslagen.** Op het scorebord staat *Opgeslagen ✓* of *Nog niet opgeslagen – staat veilig op deze telefoon*, in plaats van alleen een korte melding.
5. **Scherm blijft aan.** Zolang het scorebord of de klok open staat, gaat het scherm niet op slot (Wake Lock, standaard in Safari en Chrome). Het scherm wordt wel donkerder om de batterij te sparen.
6. **Geen verkeerde uitslag naar de ouders.** Het uitslagbericht gaat pas als de uitslag echt is opgeslagen. Gaat het als voorstel naar de trainer, dan stuurt de trainer het bericht bij *Overnemen*. Dit herziet Besluit 117 ("het uitslagbericht gaat zoals altijd meteen").
7. **Testen:** een Playwright-test met een timekeeper waarvan de database weigert, plus vernieuwen. De doelpunten moeten blijven staan. De rechtentest krijgt een geval "verouderde wedstrijd".

**Gegevens en rechten:** niets nieuws. De timekeeper mag niet meer dan nu (Besluit 116); alleen de manier van opslaan verandert. De reservekopie staat op de eigen telefoon van de timekeeper en wordt gewist na opslaan, of na 2 dagen.

## 3. Voorstel B: basis en wissels per wedstrijd terugzien (maat **M**)

**Wat er al is** (Besluit 106, `opstelling.js`):
- de trainer kiest zelf een basisopstelling op posities en zet wissels met een minuut, wie erin en wie eruit;
- vooraf of tijdens de wedstrijd;
- bij het kiezen staat per speler al *x van y trainingen deze week* en de minuten dit seizoen.

**Wat er mist:**
1. **Overzicht per wedstrijd: wie begon en wie wisselde.** In het tabblad Wedstrijd een blok **Vorige wedstrijden**: per wedstrijd de basis en de wissels met minuut, plus de uitslag. Daarnaast vandaag en de volgende wedstrijd (als de opstelling al is gemaakt). Je ziet het, je kopieert het niet: *Zoals vorige training* is afgewezen (geen vaste basis bij de O13), en hetzelfde geldt hier.
2. **Per speler:** *basis* / *in de 41e* / *uit in de rust* in de laatste drie wedstrijden, naast de minuten. Zo zie je wie vaak op de bank begon.
3. **Achteraf invullen en verbeteren.** Na de wedstrijd kan de trainer de basis, de wissels (minuut, erin, eruit) en de doelpunten nog aanpassen, ook als de timekeeper niets kon opslaan, zoals vandaag. De minuten rekenen dan opnieuw.
4. **Minuut bij een doelpunt.** Doelpunten hebben nu geen tijd. Met de klok aan vult de app de minuut zelf in; achteraf kun je hem typen.
5. **Duidelijk erin en eruit.** Bij een wissel staat altijd *erin ▲ … eruit ▼*. Een zin als "A voor B" kan beide kanten op gelezen worden (zie vraag 1).

**Voor alle teams en clubs** (Spoor 3, platform): het werkt bij elk team dat een eigen wisselschema gebruikt (Besluit 106). Teams met het eerlijke voorstel (Besluit 39) krijgen hetzelfde overzicht, gevuld uit de blokken.

**Wie ziet wat** (Besluit 116 blijft):
- de minuten alleen de trainer;
- de basis en de wissels de staf;
- ouders niets van andermans kind.

## 4. Voorstel C: reden bij minder speeltijd (maat **L**: gegevens over een kind)

Bij een speler die minder speelt, kan de trainer een korte reden vastleggen, bijvoorbeeld:
- **minder getraind (1 van 3)**, door de app al ingevuld uit de aanwezigheid;
- blessure;
- te laat;
- eigen keuze.

| | |
|---|---|
| **Wie ziet het** | alleen de trainer (en de HO bij een gesprek); nooit de ouders, nooit andere spelers |
| **Hoe lang** | dit seizoen; daarna gewist |
| **Waarom** | bij een vraag van een ouder ("waarom speelde mijn kind maar 15 minuten?") heb je het antwoord, en je ziet later of iemand vaak minder speelt door weinig trainen |

Er wordt niets automatisch beslist: ClubComm signaleert, de trainer beslist. Dit raakt *Eerlijke speeltijd* (Besluit 28, 39); daarom een eigen besluit.

## 5. Volgorde en omvang

| Stap | Wat | Maat | Afhankelijk van |
|---|---|---|---|
| 1 | **A** oorzaak nabootsen + niets meer kwijt + scherm aan + geen verkeerde uitslag | L | akkoord, migratie (databasefunctie), rechtentest |
| 2 | **B3/B4** achteraf invullen en verbeteren, minuut bij een doelpunt | M | voorbeeld op 390 px |
| 3 | **B1/B2** overzicht basis en wissels | M | voorbeeld op 390 px |
| 4 | **C** reden bij minder speeltijd | L | privacykeuze |

Stap 1 eerst: zonder betrouwbaar opslaan heeft een overzicht geen zin.

## 6. Vragen aan de gebruiker
1. **Wie ging erin en wie eruit?** "Jack voor Imran in de rust", terwijl Jack in de eerste helft scoorde. Bedoel je **Jack eruit, Imran erin**? Geldt dat voor alle wissels (de eerste naam eruit)?
2. De laatste regel **"13:41 7-2 Jack"** staat twee keer. Was de eindstand **7-2**?
3. **Rust:** hoe laat begon de rust, en hoe laat de tweede helft?
4. **Bericht aan de ouders:** zij kregen vandaag **0-0**. Wil je een correctie sturen? Dat kan nu al via Berichten. Of doe ik dat voor je na jouw akkoord?
5. **"Voor alle spoorlijnen":** bedoel je voor alle teams en clubs (het platform)? Zo heb ik het opgevat.
6. **Gia:** bedoel je *1 van de 3* of *2 van de 3* trainingen?
7. **De wedstrijd van vandaag invullen:**
   - Zelf, zodra *achteraf invullen* er is (stap 2).
   - Of eerder met een eenmalig script, na jouw akkoord. Dat is een schrijfactie in productie; daar is je uitdrukkelijke ja voor nodig.

---

## 7. Vervolg 10–11 november

**Oorzaak bevestigd.** De app slaat op met *upsert*. Bij een upsert draait de databasebewaker eerst als *invoegen*, en die weigerde iedereen buiten de staf (*"Alleen staf kan activiteiten toevoegen"*), ook als de wedstrijd al bestond. Nagebootst in de lokale testdatabase: een gewone update door de timekeeper mag, een upsert niet. Besluit 116 werkte in de app daardoor nooit. Een "verouderde wedstrijd op de telefoon" was dus **niet** de oorzaak; de rondgang door de app gaf geen enkel verschil.

**Stap A gebouwd** (Besluit NNN): migratie 035 (voorstel, toepassen na akkoord), reservekopie en terugzetten, *Opgeslagen* op het scorebord, scherm aan, en geen uitslagbericht zonder recht.

**Sportlink.** ClubComm heeft **geen koppeling met Sportlink**. De wedstrijden van de O13 zijn op 17-10 één keer ingeladen uit de Sportlink-agenda (iCal), met het script `supabase/scripts/2026-10-17_dcg_wedstrijden_fase2.sql`. Een wijziging in Sportlink komt daarom nooit vanzelf in ClubComm. Nu kan het zo:
- **Teams → het team → de wedstrijd → Aanpassen** (Besluit 168): het begeleidingsmoment schuift mee en de trainer krijgt bericht;
- **of opnieuw plakken** (Besluit 136/168): ClubComm toont per wedstrijd *gelijk*, *gewijzigd* of *nieuw*.

**Voorstel D (later, eigen besluit, maat L):** ClubComm haalt elke nacht de Sportlink-agenda (iCal) van het team op. Het vergelijkt op het Sportlink-kenmerk dat al bij elke wedstrijd staat, en past datum, tijd en adres aan via dezelfde weg als *Aanpassen*: het moment schuift mee en de trainer krijgt één bericht. Nodig: de iCal-link per team. Die bevat vaak een geheime code, dus die zet de clubbeheerder zelf in de instellingen, nooit in de chat. Het alternatief is Sportlink Club.Dataservice (`docs/productie-en-groei.md`, *Koppelingen*).

**Wissels van 7-11.** Uit de doelpunten volgt dat bij "A > B" **A eruit gaat en B erin komt**. Bijvoorbeeld: een speler die in de eerste helft scoorde, gaat in de rust *eruit*, en scoort in de tweede helft weer nadat hij *erin* kwam. Dat klopt voor alle wissels. In de app staat straks altijd *erin ▲ / eruit ▼*, zodat dit niet meer uitgelegd hoeft te worden.
