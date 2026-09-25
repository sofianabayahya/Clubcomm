# ClubComm — Besluiten

Hier leggen we vast wat we samen besluiten over hoe ClubComm (versie 2) moet werken.
Dit is de bouwlijst: wat hier staat, bouwen we. Wijzigt een besluit, dan passen we het hier aan.

Laatst bijgewerkt: 25 september 2026 (Besluit 30 t/m 40 toegevoegd)

---

## Ontwerpprincipes (gelden voor elke pagina)

1. **Telefoon eerst.** Bijna iedereen gebruikt ClubComm op de telefoon. Elke pagina ontwerpen we eerst voor een telefoonscherm (± 400 px breed), daarna pas voor de computer.
2. **Simpel en weinig scrollen.** Het belangrijkste staat bovenaan en is in één oogopslag te zien. Minder knoppen, minder tekst, grote aanraakvlakken.
3. **Geen dubbel werk.** Gegevens worden één keer ingevoerd, door degene die ze het beste kent. Niemand typt iets over.
4. **ClubComm detecteert, communiceert en documenteert. Mensen beslissen.** Geen automatische straffen.
5. **Zo min mogelijk gegevens.** We vragen alleen wat we echt nodig hebben (AVG, gegevens van kinderen).
6. **Tweetalig voorbereid.** Alle teksten staan vanaf het begin in een taalbestand (zie Besluit 3).
7. **Er is altijd een vervanger.** Bij een amateurvereniging ontbreekt soms een teamleider of trainer, of traint een trainer alleen en gaat hij niet mee naar wedstrijden. Elke taak heeft daarom een vaste volgorde van wie het overneemt, en rollen kunnen tijdelijk (bijv. per wedstrijd) aan iemand worden toegewezen.
8. **Iedereen ziet alleen wat van hem is.** Ouders zien alleen gegevens van hun eigen kind (aanwezigheid, kaarten, beoordelingen) — nooit van andere kinderen. Trainers en teamleiders zien hun eigen team. De HJO ziet alles. Dit wordt server-side afgedwongen.
9. **Elke taak heeft een eigenaar: één duidelijke lijn.** De club bepaalt welke rol welke taak heeft (Besluit 25). Een taak die aan een rol hangt, moet ook aan een persoon zijn toegewezen, zodat hij wordt opgepakt. ClubComm laat zien waar een taak geen eigenaar heeft. Ook de communicatie volgt die lijn: een signaal gaat naar wie de taak heeft, niet naar iedereen.

---

## Besluit 1 — Inloggen

**Voor iedereen: geen wachtwoorden.**

- Je vult je e-mailadres in en krijgt één mail met:
  - een **magische link** (klikken = ingelogd), én
  - een **code van 6 cijfers** om over te typen.
  De code is nodig omdat een link soms op het verkeerde apparaat opent (mail op de laptop, app op de telefoon) of al "gebruikt" is door een virusscanner.
- **Ouders blijven ingelogd** tot ze zelf uitloggen, met vangnetten:
  - na **6 maanden** niets doen moet je opnieuw inloggen;
  - knop **"Uitloggen op alle apparaten"** in het profiel (telefoon kwijt);
  - teamleider, trainer of HJO kan de toegang van een account **intrekken**.
- **Trainers en teamleiders:** zelfde als ouders.
- **HJO:** ziet gegevens van alle kinderen, daarom opnieuw inloggen na **30 dagen**.
- **Eén account per persoon**, rollen zijn toewijzingen. Een ouder die ook trainer is, heeft één account met een rolwisselaar.

---

## Besluit 2 — Aanmelden van ouders en kinderen

### Wie is verantwoordelijk voor een team?

Eén vaste volgorde voor **delen** en **goedkeuren**:

> **Teamleider → Trainer → HJO**

- Alle drie kunnen de team-uitnodiging altijd delen.
- Goedkeuren ligt bij de eerste in de rij die er is. Heeft een team geen teamleider, dan de trainer; heeft het ook geen trainer, dan de HJO.
- Ligt een aanmelding **48 uur** stil, dan krijgt de volgende in de rij een melding.
- De "coördinator" uit eerdere plannen = de **teamleider**.

### Pilot (nu, zonder Sportlink)

1. De teamleider (of trainer/HJO) deelt de **team-uitnodiging**.
2. De ouder opent de link of scant de QR-code en vult in: **eigen e-mailadres + voor- en achternaam van het kind**.
3. De ouder krijgt de inlogmail (link + code).
4. De teamleider krijgt een melding en tikt op **Goedkeuren** (of past een typfout aan / wijst af met reden).
5. Pas na goedkeuring ziet de ouder gegevens van het kind en het team.

De coördinator hoeft vooraf **geen spelerslijst** te maken: ouders voeren hun kind zelf in, de teamleider keurt alleen goed. Goedkeuren blijft nodig, zodat niemand zich aan een willekeurig kind kan koppelen.

### Uitnodiging delen — drie knoppen

In het teamleider-, trainer- én HJO-portaal, bij **"Ouders uitnodigen"**:

| Knop | Wat het doet | Wanneer handig |
|---|---|---|
| **Delen** | Opent het deelmenu van de telefoon (WhatsApp, mail, sms…) met tekst + link | Teamapp/WhatsApp-groep |
| **QR tonen** | Grote QR-code op het scherm | Langs de lijn bij de training: ouders scannen ter plekke |
| **QR printen** | A4 met QR, teamnaam en korte uitleg | Kantine, kleedkamer |

- In WhatsApp delen we de **link**, niet het plaatje van de QR (een ouder kan geen QR scannen die op zijn eigen scherm staat).
- De uitnodiging bevat een onraadbare code, **verloopt na 14 dagen** en kan met één klik **vernieuwd** worden.

### Gezinnen en bijzondere situaties

- **Meerdere kinderen:** één account; "Kind toevoegen" in het profiel of de QR van het andere team scannen.
- **Twee ouders (ook gescheiden):** ieder een eigen account, beide gekoppeld en goedgekeurd. Ze zien elkaars e-mailadres niet.
- **Dubbele aanmelding** van hetzelfde kind (net anders gespeld): bij goedkeuren vraagt de app "Is dit hetzelfde kind?".
- **Kind hangt aan de ouder, niet aan het team.** Nieuw seizoen = alleen de teamindeling verandert; opnieuw aanmelden is niet nodig.
- **Na goedkeuring:** welkomstmail ("Je bent gekoppeld aan Jesse, O10-1") met uitleg hoe je de app op je beginscherm zet.
- **Toestemming:** één zin bij het aanmelden + link naar de privacyverklaring. Foto-toestemming pas als er een fotofunctie komt.

### Later: import uit Sportlink

Een Sportlink-export bevat: voornaam, achternaam, geboortedatum, **bondsnummer** en **e-mailadressen van ouders**.

- De HJO importeert de export één keer per seizoen. Teamindeling komt dan rechtstreeks uit Sportlink.
- ClubComm stuurt elke ouder automatisch een uitnodiging per mail. Omdat het e-mailadres uit Sportlink komt, is **goedkeuren niet meer nodig**.
- Spelers uit de pilot worden **herkend** (op naam + team) en krijgen alsnog hun bondsnummer; bij twijfel toont de app een lijstje "Is dit dezelfde speler?" voor de HJO. Zo ontstaan er geen dubbele spelers.
- Daarom heeft elke speler in de database vanaf het begin een (in de pilot nog leeg) veld **bondsnummer**.
- Voordat we Sportlink-gegevens gebruiken: afspraken met de club over het delen van ledengegevens (AVG).

---

## Besluit 3 — Taal

- ClubComm wordt **Nederlands en Engels** (veel expat-ouders rond Buitenveldert).
- **Taalknop op de inlogpagina** en een taalinstelling in het profiel.
- **Niet in het huidige prototype** (te veel werk in pagina's die we opnieuw bouwen), **wel vanaf dag één in versie 2**: alle teksten in een apart taalbestand.

---

## Besluit 4 — Ouderportaal

**Doel:** de ouder meldt af en ziet wat er komt. Alles wat de ouder invoert (afmeldingen, redenen, vervoer, taken) wordt informatie voor trainer, teamleider en HJO.

### Navigatie
- Onderaan vijf knoppen: **Home · Planning · Vervoer · Berichten · Taken**.
- **Profiel altijd rechtsboven** op elke pagina (niet alleen op Home).

### Home — alles in één scherm, zonder scrollen
1. **Komende 3 activiteiten**, elk met een eigen knop **Afmelden** (afmelden gebeurt altijd direct bij de activiteit, geen aparte datumkeuze).
2. **Statusregel:** aanwezigheid in % en kaarten, op één regel. Positieve bevestiging blijft ("Betrouwbare speler!").
3. **Actie nodig** — verschijnt alleen als er iets te doen is (ongelezen persoonlijk bericht, een ander kind zoekt vervoer voor de uitwedstrijd, open taak).

### Afmelden
- Tik op Afmelden bij de activiteit → kies een **reden** → klaar.
- **Vaste redenen:** Ziek · Blessure · School/huiswerk · Vakantie · Familie · Andere sport · Overig (+ optionele opmerking). Vaste redenen zijn nodig om te kunnen tellen.
- De afmelding gaat direct naar **trainer en teamleider**.
- **Intrekken** kan zolang de afmelddeadline niet voorbij is (kind is toch beter).
- De afmelddeadline is **instelbaar** (zie Besluit 6), niet vast in de code.

### Aanwezigheid en kaarten (overzicht voor de ouder)
- Eén scherm, bereikbaar via de **statusregel op Home** en via **Planning**; keuze **deze fase / heel seizoen**.
- Toont: aanwezigheid %, trainingen en wedstrijden die geweest zijn, en per soort: **te laat gekomen** (oranje), **te laat afgemeld** (geel, 1 punt), **niet afgemeld en niet gekomen** (geel, 2 punten), met hoeveel daarvan alleen een herinnering waren.
- Plus de stand deze fase, de **volgende stap** in de opschaling (Besluit 15) en de **afmeldgeschiedenis** met reden.
- Dezelfde cijfers als de HJO ziet (transparant, geen verrassingen).

### Planning
- **Komende 2 weken als lijst** + knop "Verder vooruit". **Geen maandkalender** (onleesbaar op de telefoon).
- Per activiteit: dag, tijd, veld; bij wedstrijden ook verzameltijd, thuis/uit, tegenstander, adres (link naar kaart) en eventueel tenue. Afmeldingen zijn direct zichtbaar.
- **Seizoensoverzicht** (ingeklapt): aanwezigheid %, aantal trainingen / wedstrijden / toernooien.
- **Afmeldgeschiedenis** (ingeklapt): datum, reden, te laat of niet.
- Later mogelijk: planning automatisch uit **voetbal.nl** (uitzoeken welke gegevens en in welke vorm). Tot dan voert teamleider/HJO de planning in.

### Vervoer
*Herzien in Besluit 31: iedereen brengt zijn eigen kind, tenzij de ouder om een plek vraagt.*
- Hangt aan een **uitwedstrijd**. De ouder kan **vervoer vragen**; andere ouders reageren met **"Kan met mij mee"** en spreken daarna samen af.
- Melding op Home alleen als een ander kind vervoer zoekt (en jouw kind ook gaat). De teamleider heeft hier geen taak in.

### Berichten
- **Pushmeldingen** (webapp op het beginscherm), met **mail als reserve**. Zonder meldingen worden berichten niet gelezen.
- Twee tabbladen: **Persoonlijk** (trainer / teamleider / HJO → ouder) en **Nieuws** (team en club), elk met teller voor ongelezen.
- Volgorde: ongelezen en urgent bovenaan, daarna nieuwste eerst.
- **Reageren** alleen op persoonlijke berichten; nieuws is alleen-lezen.
- **Vraag aan trainer of teamleider** (aanvulling 24 september 2026): een ouder kan zelf een vraag stellen aan de trainer en teamleider van het eigen team (niet aan andere ouders, geen groepschat). Het gesprek staat bij Persoonlijk; afmelden blijft via de knop Afmelden.
- **Geplande berichten:** HJO schrijft één keer en kiest wanneer het verstuurd wordt (bijv. aftellen naar de zomervakantie).
- Afzender ziet **wie het gelezen heeft** ("gelezen door 11 van 12").

### Taken
- Taken per wedstrijd/training: spelbegeleider, coach, fotograaf, barmedewerker, wastas, enz.
- Ouder meldt zich aan met één tik; **teamleider beheert** en ziet wie vaak en wie nooit helpt.
- **Automatische oproep** als een taak open staat, bijv. 2 dagen van tevoren: *"Nog geen spelbegeleider voor zaterdag. Kun jij?"* met knop "Ik doe het" (push, mail als reserve).

### Profiel
- Eigen gegevens (naam, e-mail, telefoon)
- Mijn kinderen + **Kind toevoegen**
- **Tweede ouder uitnodigen**
- Meldingen (wat, via push of mail)
- Taal (Nederlands / Engels)
- Rolwisselaar (als je ook trainer/teamleider bent)
- Privacy en toestemming
- Uitloggen / uitloggen op alle apparaten

Weg uit het profiel: nep-statistieken en "Training geschiedenis" (staat al bij Planning).

### Koppelingen

| Van → naar | Wat |
|---|---|
| Ouder → trainer en teamleider | afmelding + reden, vervoer, taken |
| Trainer → ouder | aanwezigheid, te laat, kaarten, persoonlijke berichten |
| Teamleider → ouder | wedstrijdinformatie, taken, vervoer, berichten |
| HJO → ouder | clubnieuws, geplande berichten, instellingen (deadline, drempels) |
| Alles → HJO | aanwezigheid + redenen per kind, team en seizoen |

---

## Besluit 5 — Aanwezigheid, stiptheid en kaarten

### Kaart = registratie van een feit, geen straf
Het systeem legt feiten vast. Een **gevolg** (zoals een gesprek) besluit altijd een mens. Ouders reageren niet op kaarten: het zijn feitelijke registraties.

### Aanwezigheid registreren
- **Ouder:** afmelden met reden.
- **Trainer:** bevestigt aanwezigheid met één tik per training ("iedereen aanwezig, behalve…") en markeert **te laat** of **afwezig**.
- **Systeem:** berekent het percentage. Afgelaste activiteiten tellen niet mee.
- **Aanwezigheid en stiptheid zijn twee aparte cijfers.** Te laat gekomen telt als aanwezig (het kind heeft getraind), maar wordt apart geteld: *"Aanwezigheid 92% · 4× te laat dit blok"*.
- Ouders zien **dezelfde cijfers** van hun kind als de HJO (geen verrassingen in een gesprek). De HJO ziet ook de **redenen**, zodat 80% door blessure iets anders is dan 80% door andere sport.

### Soorten gebeurtenissen
*Herzien in Besluit 32 (geel/rood zoals op het veld, te laat komen geen kaart, telling per seizoen). De tabel en "Kansen geven" hieronder zijn vervangen.*

| Gebeurtenis | Wie registreert | Kaart | Telt voor drempel |
|---|---|---|---|
| Te laat gekomen op de training | trainer | 🟧 oranje | 1 |
| Te laat afgemeld (na deadline) | systeem | 🟨 geel | 1 |
| Niet afgemeld én niet gekomen | trainer "afwezig" + geen afmelding | 🟨 geel | 2 |

### Kansen geven
- Het seizoen is verdeeld in **4 fases**, gelijk aan de competitie-indeling in de jaarplanning (zie Besluit 15).
- **Eerste keer per fase:** geen kaart, maar een **vriendelijke herinnering** (automatisch, push + mail).
- Vanaf de tweede keer: kaart, met melding en uitleg aan de ouder ("Wat betekent dit?").
- Bij een nieuwe fase gaat de **teller terug naar nul**; de geschiedenis blijft zichtbaar.

### Escalatie
- Vervangen door de **opschaling in Besluit 15** (herinneren → waarschuwen → bellen/appen → gesprek HJO → clubbesluit).
- Toon blijft: *"Kunnen we je ergens mee helpen?"*

### Tekst eerste waarschuwing (concept, club kan aanpassen)
> Beste ouder van [kind],
> [Kind] was vandaag niet bij de training van [team], en we hadden geen afmelding ontvangen. Geen probleem, het kan iedereen gebeuren! Wil je in het vervolg [kind] via ClubComm afmelden als hij/zij niet kan? Dat helpt de trainer enorm bij de voorbereiding. Afmelden kan tot [deadline] voor de training.
> Sportieve groet, [teamleider]

---

## Besluit 6 — Instellingen per club en per team

ClubComm moet later aan meerdere clubs aangeboden kunnen worden; elke club heeft eigen regels.

- **Club** stelt de **standaard** in; de **HJO kan per team afwijken** (bijv. selectieteam strenger dan breedteteam).
- Instelbaar: afmelddeadline, drempels voor kaarten, blokken, waarschuwingsteksten, wanneer automatische oproepen voor taken uitgaan.
- Alle gegevens hebben een `club_id`.
- **Modules** die een club aan/uit kan zetten (voor later): bijv. Vervoer, Beloningen.

---

## Besluit 7 — Trainerportaal

### Navigatie
- Onderaan: **Home · Aanwezigheid · Berichten · Spelers · Speeltijd** (Speeltijd alleen als de module aan staat).
- Instellingen zitten in het **profiel rechtsboven**.

### Home
1. **Teamnaam + eerstvolgende training** (dag, tijd, veld).
2. **Verwacht: 10 van 12**, met daaronder **wie zich heeft afgemeld + reden**.
3. Knop **Aanwezigheid opnemen** — alleen zichtbaar op de dag van de training.
4. **Actie nodig** (bijv. nieuwe berichten) — alleen als er iets is.

Niet op Home: snelknoppen, aantallen te laat, uitgedeelde kaarten.

### Aanwezigheid
Bovenaan een **weekstrook** met de trainingen/wedstrijden van deze en volgende week; tik op een dag.

**A. Aanwezigheid opnemen (per activiteit)**
- Lijst van alle spelers, standaard **aanwezig**.
- **Tik op een naam** om te wisselen: ✓ aanwezig → ⏰ te laat → ✗ afwezig.
- Afgemelde spelers staan al grijs met reden; komt een afgemeld kind toch, dan tikt de trainer het aan als aanwezig.
- Eén knop **Opslaan** → systeem verwerkt waarschuwingen, kaarten en percentages (Besluit 5).
- Past op één telefoonscherm. **Invullen en corrigeren kan vanaf de dag zelf tot 48 uur na de start** (clubinstelling bij Regels, standaard 48 uur). Daarna staat de lijst vast, zodat ouders niet achteraf nog een kaart krijgen.
- Is de aanwezigheid van een eerdere training nog niet ingevuld, dan ziet de trainer op Home **"Aanwezigheid nog niet ingevuld"** met tot wanneer het nog kan (24 sep 2026).
- Bij **wedstrijden** neemt de **wedstrijdbegeleider** de aanwezigheid op (zie Speeltijd), niet per se de trainer.

**B. Overzicht per speler**
- Per speler één regel: naam · aanwezigheid % · aantal te laat · kaarten, met kleurbolletje (groen/oranje/rood).
- Gesorteerd van laagste naar hoogste aanwezigheid.
- Periode: dit blok / heel seizoen.
- Tik op een speler → geschiedenis met datums, redenen en kaarten.

### Berichten
- **Inbox bovenaan**, ongelezen eerst.
- Eén knop **+ Nieuw bericht** → kies: groep · individueel · trainingswijziging · herinnering (met ingevuld sjabloon).
- Een **trainingswijziging** past ook echt de **planning** aan en stuurt ouders een pushmelding.

### Planning wijzigen
- De **trainer mag de planning wijzigen** en **oefenwedstrijden inplannen**.
- **HJO en teamleider** krijgen daarvan een **niet-urgente melding** in hun berichtenbox, zodat ze op de hoogte zijn.

### Spelers (beoordeling + ontwikkeling samengevoegd)
- Per speler: aanwezigheid, beoordelingen en notities van de trainer.
- Beoordelen in **seizoensfasen**; per speler óf **per vaardigheid voor het hele team** (sneller en eerlijker).
- **Zichtbaarheid:** ouders zien alleen de beoordeling van hun eigen kind; de HJO ziet alles.
- **Niveau hangt af van de leeftijdscategorie** (club kan de indeling aanpassen). Indeling volgens de KNVB:

| Categorie | Teams | Speelvorm | Beoordeling (voorstel) |
|---|---|---|---|
| Mini's | O6–O7 | — | eenvoudig: plezier, balgevoel (of geen beoordeling) |
| Onderbouw | O8–O10 | 6 tegen 6 | basistechniek (passen, aannemen, dribbelen, schieten) + inzet; 3 smileys |
| Onderbouw | O11–O12 | 8 tegen 8 | + positie kiezen, overzicht, samenwerken; schaal 1–5 |
| Middenbouw | vanaf O13 | 11 tegen 11 | alle categorieën (techniek, tactiek, fysiek, mentaal, sociaal); uitgebreider |

- De inhoud per niveau baseren we op de **KNVB-leerlijnen** (uitzoeken bij de bouw).
- Onderbouw: **2 beoordelingsmomenten per seizoen** met een ontwikkelgesprek (zie Besluit 23).

### Speeltijd (module)
- Doel: **eerlijke speeltijd** bij wedstrijden.
- **Voor de wedstrijd:** app weet wie er komt (afmeldingen) en maakt automatisch een **wisselschema per blok**, inclusief roulerende keepers; spelers met minder speeltijd dit seizoen krijgen voorrang. De speelvorm (6 tegen 6, 8 tegen 8) volgt uit de leeftijdscategorie.
- **Tijdens de wedstrijd:** grote knop "Volgend blok" → wie erin, wie eruit.
- **Na de wedstrijd:** bevestigen wat er echt gebeurde → seizoenstotalen bijgewerkt.
- **Eén gedeelde pagina** voor trainer en teamleider (nu bestaat hij dubbel).

### Wedstrijdbegeleider (tijdelijke rol per wedstrijd)
Niet elke trainer gaat mee naar wedstrijden. Per wedstrijd is er daarom een **wedstrijdbegeleider**, die aanwezigheid en speeltijd voor die wedstrijd doet:

> **Teamleider → Trainer → ouder die zich via Taken als "Coach" heeft aangemeld**

- De ouder met de taak "Coach" krijgt **alleen voor die wedstrijd** toegang tot aanwezigheid en speeltijd; daarna vervalt die toegang automatisch.
- Is er twee dagen voor de wedstrijd nog niemand, dan gaat de automatische oproep uit (Besluit 4, Taken).

### Rollen koppelen
- Veel ouders zijn ook trainer of teamleider. De **HJO koppelt rollen** aan een bestaand account (ouder + trainer), met rolwisselaar in de app. (Uitwerken bij het HJO-portaal.)

---

- **Aanvulling (23 september 2026): spelers filteren en sorteren** (tabblad Spelers bij trainer, Team bij teamleider). Filters: alle · komt / afgemeld voor de volgende activiteit · oranje/rood · kaarten · langdurig · niet beoordeeld (alleen voor wie beoordelingen mag zien). Sorteren: op naam, aanwezigheid laagste of hoogste eerst, meeste kaarten eerst. Het aantal staat erbij ("3 van 12").

## Besluit 8 — Vaste app-structuur en namen (alle rollen)

### Elke pagina, in elke rol, dezelfde structuur
- **Bovenaan:** waar ben ik (bijv. *"Jesse · O10-1"* voor een ouder, *"O10-1"* voor een trainer) + **profielknop [👤] rechtsboven**, op elke pagina.
- **Onderaan:** altijd **5 knoppen**; de eerste is altijd **Home**. De andere vier hangen af van de rol.
- **Achter het profiel** zit alles wat je zelden nodig hebt: gegevens, kinderen, meldingen, taal, rolwisselaar, privacy en **uitloggen**.
- **Uitloggen staat alleen in het profiel**, niet op elke pagina (ouders blijven ingelogd; voorkomt per ongeluk uitloggen).
- Geen "Terug"-links naar de inlogpagina.
- **Rode bolletjes met aantal** op de knop Berichten en op andere knoppen waar iets nieuws is (bijv. "2 aanmeldingen" bij Team). Pushmelding op de telefoon en het aantal ook op het **app-icoon** op het beginscherm. Geldt voor alle rollen.

### Namen
- De woorden **"dashboard" en "portaal" komen niet in de app** (dat zijn bouwerswoorden). De gebruiker opent gewoon "ClubComm".
- Eerste knop onderaan: **Home** (bekend, werkt in NL en EN).
- Paginatitels zeggen **waar het over gaat** (kind/team), niet "Ouder Dashboard".
- Rollen heten: **Ouder · Trainer · Teamleider · HJO**. Wisselen via de rolwisselaar in het profiel; de huidige rol/team staat altijd bovenaan.
- In onze eigen documenten gebruiken we "ouderportaal", "trainerportaal" enz. wel als werknamen.

---

## Besluit 9 — Teamleiderportaal
*Deels herzien in Besluit 33 (vier knoppen, Regelen opgegaan in Wedstrijd).*

**Rol:** de regelaar rond wedstrijden (genoeg spelers, vervoer, taken, begeleiding) en de beheerder van het team (wie hoort erbij, welke ouders, wie is nog niet aangemeld).

### Navigatie
**Home · Wedstrijd · Regelen · Berichten · Team**

### Home — één overzicht, elke regel klikbaar
- Eerstvolgende wedstrijd: datum, tegenstander, thuis/uit, verzameltijd.
- Vier regels, elk klikbaar naar de juiste plek:
  - **Spelers** — 10 van 12 (wie komt / afgemeld)
  - **Taken** — 3 van 5 bezet
  - **Begeleider** — wie is wedstrijdbegeleider
- **Actie nodig** (bijv. "2 aanmeldingen goedkeuren") — alleen als er iets is.
- Geen snelknoppen (die verwezen naar dezelfde plekken als de balk onderaan → dubbel).
- Kleur alleen bij een probleem (oranje als er iets ontbreekt).

### Wedstrijd
- Wedstrijdinfo: verzameltijd, adres, tenue (teamleider vult aan).
- Wie komt / wie is afgemeld (met reden).
- Wedstrijdbegeleider (Besluit 7).
- **Speeltijd** (module) — één gedeelde pagina met de trainer.
- Na afloop: uitslag.

### Regelen (taken)
- Per wedstrijd: welke taken open staan. Vervoer regelen ouders onderling (Besluit 31).
- Overzicht wie vaak en wie nooit helpt.
- **Herinneringen gaan automatisch** (oproep voor open taken), volgens de clubinstellingen (Besluit 6). Geen herinneringsknop nodig.

### Berichten
- Zoals bij de trainer: inbox bovenaan, "+ Nieuw bericht" met sjablonen.

### Team
- Spelers met hun ouders.
- **Aanmeldingen goedkeuren** (Besluit 2).
- **Ouders uitnodigen**: Delen / QR tonen / QR printen.
- Overzicht wie nog niet is aangemeld (tweede ouder, ontbrekende spelers).
- **Van team wisselen** is een clubbeslissing → blijft bij de HJO.

### WhatsApp — ClubComm is de bron, WhatsApp de megafoon
- **Delen-knop** bij wedstrijdinfo, uitnodigingen en open taken: maakt een net bericht met link om in de teamgroep te plakken.
- **"WhatsApp ouder"** bij een speler: opent direct een chat met die ouder (alleen teamleider en trainer zien telefoonnummers).
- **Niet:** automatisch in WhatsApp-groepen posten (WhatsApp staat dat voor groepen niet toe; zakelijke koppeling kost geld en compliceert privacy).

---

## Besluit 10 — Aanwezigheidsnorm en zones

### Iedereen komt, tenzij afgemeld
- Geldt voor **alle teams** (breedte én selectie), bij **trainingen én wedstrijden**.
- Ouders hoeven nooit actief aan te melden. Norm: je kind speelt bij een club; kan het niet, dan meld je af. (Aanmelden zou vrijblijvendheid uitstralen.)
- Het verschil tussen breedte en selectie zit in de **drempels**, niet in de werkwijze.

### Teamtype
- De HJO geeft elk team een **teamtype**: *breedte* of *selectie*.
- Per teamtype gelden eigen zones en drempels (instelbaar per club, Besluit 6).

### Zones (voorbeeldwaarden, club stelt in)

| Zone | Breedte | Selectie |
|---|---|---|
| 🟢 Groen | ≥ 80% | ≥ 90% |
| 🟠 Oranje (let op) | 75–80% | 85–90% |
| 🔴 Rood | < 75% | < 85% |

De oranje zone geeft een seintje vóórdat het rood wordt, zodat een gesprek preventief kan zijn.

### Speler of team?
Het systeem vergelijkt de **speler met zijn eigen team**:
- **Eén speler in rood, team groen** → individueel signaal aan **teamleider en trainer** (HJO ziet het ook). Mogelijk gevolg: gesprek met de ouders.
- **Teamgemiddelde in oranje/rood** → signaal aan de **HJO**: waarschijnlijk iets in het team (trainingstijd, trainer, onvrede).
- Signalen tonen ook **patronen**, bijv. *"Jesse: 70% (team: 88%) — vooral afwezig op vrijdag."*
- Het systeem signaleert; een mens beslist.

### Ziekte en blessure — alles telt mee, alles valt op
- **Alle afwezigheid telt mee** in het percentage, ook ziek en blessure. Anders verdwijnt het uit beeld en wordt het een uitweg.
- **Het signaal noemt de reden**, bijv. *"Jesse: 4× afwezig in 3 weken, waarvan 3× blessure."* Zo weet de teamleider/trainer of eerst een vraag past ("hoe gaat het?") of een gesprek over aanwezigheid.
- **Langdurige blessure of ziekte wordt gemeld** als *"langdurig afwezig"* met verwachte terugkeerdatum (door de ouder, of door de teamleider na een gesprek):
  - melding gaat naar **trainer, teamleider en HJO** (zo ontstaat het gesprek);
  - in die periode hoeft de ouder niet per training af te melden en komen er **geen kaarten**;
  - het blijft zichtbaar: *"Aanwezigheid 70%, waarvan 6 weken langdurig geblesseerd."*
- **Patronen vallen op:** een reeks korte ziek-/blessuremeldingen (bijv. steeds op vrijdag, of vlak voor uitwedstrijden) geeft een signaal aan de teamleider. Een mens beslist over een eventueel gesprek.
- Doel: het systeem houdt de **communicatielijn** tussen trainer, teamleider en HJO open en maakt overzichtelijk wat er speelt.

---

## Besluit 11 — HJO-portaal

**Rol:** de HJO **bewaakt en stuurt**, maar voert niet uit. Teamleiders en trainers doen het dagelijkse werk; de HJO ziet signalen, grijpt in waar nodig en maakt clubbrede keuzes.

### Navigatie
**Home · Teams · Planning · Inzicht · Berichten**

### Home — "wat vraagt vandaag mijn aandacht?"
- Club in één regel: aantal teams · aantal spelers · clubbrede aanwezigheid.
- **Aandacht nodig** (vervangt "Recente meldingen"): de signalen uit de andere rollen, elk klikbaar:
  - teams in oranje/rode zone (Besluit 10)
  - spelers in rode zone
  - voorgestelde gesprekken (kaartendrempel, Besluit 5)
  - teams zonder teamleider of trainer
  - aanmeldingen die langer dan 48 uur openstaan (Besluit 2)
  - planningswijzigingen door trainers (niet-urgent, Besluit 7)
  - meldingen langdurig afwezig (Besluit 10)
- Niets aan de hand → *"Niets bijzonders 👍"*.
- **Twee snelle acties** (clubbreed en tijdgevoelig): **Bericht aan club** en **Afgelasten** (vorst, veld afgekeurd: één tik → alle betrokken teams krijgen direct een pushmelding).

### Teams
- Lijst van alle teams met stipjes: aanwezigheid (zone), staf compleet, openstaande aanmeldingen.
- **Tik op een team** → alles van dat team op één plek: staf toewijzen (trainer, teamleider — uit bestaande ouders of extern), spelers, rooster, statistieken, teamtype (breedte/selectie), afwijkende instellingen.
- **Alle spelers:** zoeken in de hele club, speler naar ander team verplaatsen, speler handmatig toevoegen.
- **Rollen koppelen** (bijv. ouder + trainer op één account) vanaf de persoon.
- Vervangt de losse knoppen uit het prototype (teams beheren, spelersdatabase, ouderrollen, teamschema's).

### Inzicht (was "Analytics Hub")
Drie vragen, van club → team → speler:
1. **Waar gaat het goed of mis?** Teams per zone, slechtste bovenaan.
2. **Waarom?** Verdeling van afmeldredenen per team.
3. **Hoe ontwikkelt het zich?** Trend per blok.
- Tik op team → spelers; tik op speler → volledige geschiedenis.
- **Export naar PDF** (onderbouwing bij teamindeling, gesprek met ouders, bestuur).
- Extra: **percentage gelezen berichten** per team.
- Weg: financiën, winstpercentages en andere grafieken die niet bij het doel passen.

### Berichten
- Zoals bij de andere rollen; daarnaast **clubbrede berichten** en **geplande berichten** (Besluit 4).

---

- **Aanvulling (23 september 2026): teams filteren en sorteren, Inzicht per groep.** Teams-tab: filters alle · oranje/rood · zonder staf · open aanmeldingen · per groep van de coördinator (O6–O9, O10–O12) · selectie; sorteren op naam, aanwezigheid laagste eerst, meeste signalen, minste gezinnen die meehelpen. Inzicht: bovenaan een keuze "Hele club" of een groep, zodat de HJO met de coördinator naar diens teams kan kijken. Op teamniveau; een clubbrede lijst van rode spelers komt er bewust niet (Besluit 26).

## Besluit 12 — Rollen en clubbeheerder

### Rollen
**Ouder · Trainer · Teamleider · Coördinator (optioneel) · HJO · Clubbeheerder**

- **Vaste rollen met een bereik**, geen zelf te verzinnen rollen (houdt de app eenvoudig).
- **Coördinator:** laag tussen trainer en HJO voor een **groep teams** (bijv. O10–O12). Optioneel; de clubbeheerder bepaalt of de club deze rol gebruikt. Welke taken hij heeft, bepaalt de club (Besluit 25).
- **Naam van de rol aanpasbaar per club:** de ene club zegt "coördinator", de andere "HJO". De rechten blijven gelijk, alleen het label verschilt.
- Eén account kan meerdere rollen hebben (rolwisselaar in het profiel).

### Clubbeheerder vs HJO

| | Clubbeheerder | HJO |
|---|---|---|
| Soort werk | systeem inrichten (± 1× per seizoen) | jeugd sturen (wekelijks) |
| Wat | rollen in gebruik, modules aan/uit, clubstandaarden (deadlines, drempels, blokken), seizoen en vakanties, logo, Sportlink-import | teams, staf, signalen, planning, clubberichten |
| Wie | vaak bestuurslid/secretaris | technisch jeugdcoördinator |

- Bij een kleine club is dit **dezelfde persoon** (één account, twee rollen).
- Bij aanbieden aan meerdere clubs is de clubbeheerder het aanspreekpunt van de club.

---

## Besluit 13 — Planning: weekrooster in plaats van losse trainingen

Doel: de HJO voert niet elke training in; het werk ligt waar het hoort.

1. **Clubbeheerder (1× per seizoen):** seizoensstart en -einde. **Schoolvakanties worden automatisch opgehaald** (open data van de Rijksoverheid, per regio; Amsterdam = regio Noord). Per vakantie kiest de club: wel of niet trainen. Ook eigen stops (bijv. winterstop) toe te voegen.
2. **HJO (1× per seizoen): veldindeling / weekrooster per team.**
   - **In bulk** in de app: teams selecteren → dagen kiezen (bijv. wo + vr) → per team tijd en veld.
   - Of via een **Excel-importsjabloon** als de veldindeling al klaarligt.
3. **Systeem** maakt alle trainingen van het seizoen aan (vakanties en stops overgeslagen).
4. **Trainers/teamleiders** doen alleen **uitzonderingen**: verplaatsen, extra training, oefenwedstrijd → niet-urgente melding aan HJO (Besluit 7).
5. **Wedstrijden:** later automatisch via Sportlink/voetbal.nl; in de pilot voert de teamleider ze in.
6. **Clubbrede afgelasting** door de HJO met één knop (Besluit 11).

---

## Besluit 16 — Pilot: de onderbouw

- De pilot draait voor de **onderbouw: mini's (O6–O7) tot en met O12**. Daar spelen ouders de grootste rol en zijn ze nieuw bij de club; zij moeten begeleid worden.
- Punten die alleen voor O13 en ouder gelden (speler zelf bij het gesprek, dalingssignaal O13+) zijn geparkeerd tot na de pilot.
- Later kan ClubComm uitgroeien tot een **volledige clubapp** (middenbouw, bovenbouw, senioren).
- De demo in het prototype bevat alleen onderbouwteams.

### Vuistregel voor nieuwe ideeën
Een idee komt in de app als het (1) helpt bij monitoren, signaleren of oplossen, (2) duidelijk maakt wie het doet, (3) de ouder geen extra werk kost en (4) klein is of als module aan/uit kan. Anders gaat het naar "Later / ideeën".

---

## Besluit 40 — Telefoonnummer vult de ouder zelf in
*Besloten 25 september 2026.*

- Bij goedkeuren van een aanmelding (of speler handmatig toevoegen) krijgt de ouder **geen** telefoonnummer meer (eerder een voorbeeldnummer, waardoor de belknop naar een verkeerd nummer ging).
- De ouder vult zijn nummer zelf in: **Profiel → Telefoonnummer toevoegen**. Alleen trainer, teamleider en jeugdleiding zien het (zoals alle contactgegevens); andere ouders niet.
- Bellen en WhatsApp staan altijd bij de ouder (contactkaart, spelerslijst, bel-signaal, staf). Zonder nummer zijn ze grijs; een tik legt uit dat de ouder het nummer zelf invult bij Profiel. SMS niet (weinig gebruikt). WhatsApp-links werken ook met +31/0031-nummers.
- Aandachtspunt: de app mailt de staf niet bij een nieuwe aanmelding; die staat op Home van trainer (zonder teamleider) of teamleider.

## Besluit 39 — Wisselschema: de club kiest om de hoeveel minuten, de trainer past zelf aan
*Besloten 25 september 2026. Vult Besluit 33 (eerlijke speeltijd) aan.*

- **Om de hoeveel minuten wisselen bepaalt de club**, per speelvorm (Regels → Speeltijd). ClubComm geeft het advies: **per blok wisselen** (4 tegen 4: 10 min, 6 tegen 6: 12,5 min, 8 tegen 8: 15 min, 11 tegen 11: 17,5 min). Elke waarde vanaf 3 minuten mag, ook bijv. 5 of 7.
- **De trainer mag per wedstrijd afwijken**, vóór hij het schema maakt. Het laatste blok is de rest; een heel korte rest (minder dan een half blok) gaat bij het laatste blok (7 min bij 50 minuten: 7+7+7+7+7+7+8).
- **Speelduur per speelvorm:** 4 tegen 4 40 min, 6 tegen 6 50 min, 8 tegen 8 60 min, 11 tegen 11 70 min.
- **Zelf aanpassen:** de app maakt een eerlijk voorstel; daarna tikt de trainer per blok wie erin staat (een tabel met spelers en wisselmomenten). De app toont de **minuten per speler** en waarschuwt als er in een blok niet genoeg of te veel spelers in het veld staan. De keeper is te kiezen (ruilt zijn plek in het schema met de vorige keeper). Blokken die al gespeeld zijn, liggen vast.
- **Ook bij oefenwedstrijden** (trainer: Planning aanpassen → Oefenwedstrijd toevoegen); die tellen mee voor de eerlijke speeltijd.
- **Timekeeper** ziet alleen wie erin en eruit gaat en bij welke minuut de volgende wissel is; geen seizoenscijfers en geen aanpasscherm.
- Eerlijke verdeling rekent in minuten (niet in blokken), zodat een korter laatste blok eerlijk meetelt. "Een blok minder" (selectie) = één wisselmoment minder dan gelijk verdeeld.

## Besluit 38 — Start pilot: het O12 talententeam
*Besloten 25 september 2026.*

- **Club leeggemaakt:** alle voorbeelddata en testaccounts zijn weg. Een vaste kopie van daarvoor staat in de database (`backup.rij_voor_pilot`, `backup.lid_voor_pilot`). De clubinstellingen (seizoen, fasen, vakanties, regels, taken per rol, communicatieplan) zijn gebleven.
- **Eén team:** *O12 talententeam* (code `O12-1`, selectie). Trainingen di en do op veld 1, vr op veld 2, 17:15–18:30, van 25 september tot het einde van het seizoen, zonder vakanties en Goede Vrijdag.
- **Rollen van de initiatiefnemer:** trainer van het O12 talententeam, coördinator O10–O12, HJO en clubbeheerder. De rol ouder komt erbij zodra zijn kind in het team staat.
- **Teamleiders:** profiel Basis (was al de clubinstelling). Ze krijgen hun rol via Rollen zodra ze een account hebben.
- **Speler toevoegen door de beheerder** bij een ouder die al in de club staat (bijv. een staflid) geeft die persoon nu ook de rol ouder.
- **Lege club moet kloppen:** een team zonder gegevens is geen "team in de rode zone", een nieuw team zonder cijfer van vorig seizoen toont alleen het huidige percentage, en een club die halverwege het seizoen begint krijgt geen bericht "het seizoen begint".

## Besluit 37 — Klaar voor de ouders: privacy, installeren, feedback en back-up
*Besloten 25 september 2026.*

- **Privacyverklaring** in de app (profiel en bij het aanmelden), in gewone taal: wie verantwoordelijk is (de club), welke gegevens, waarvoor, wie wat ziet, waar (EU), hoe lang, cookies, rechten. Het contactadres stelt de club in bij Regels → Privacy.
- **Aanmelden alleen met akkoord** op de privacyverklaring; het moment van akkoord wordt vastgelegd bij de aanmelding.
- **Installeerbaar:** app-icoon, manifest en service worker (altijd eerst het netwerk, zodat iedereen de nieuwste versie heeft; gegevens worden niet op de telefoon bewaard). Op Android een knop "ClubComm installeren", op iPhone de uitleg via Delen → Zet op beginscherm.
- **Feedbackknop** (Profiel → Feedback of een probleem melden): komt als persoonlijk bericht en e-mail bij de clubbeheerder, met rol, scherm en telefoon erbij.
- **Back-up:** elke zondag een volledige kopie in een afgeschermd deel van de database (8 weken bewaard) en een knop "Back-up downloaden" voor de beheerder.
- **Eerlijk profiel:** knoppen die in de echte app niets deden zijn aangepast: "Tweede ouder uitnodigen" deelt nu de teamuitnodiging, "Meldingen" legt uit wanneer er een e-mail komt, "Taal" alleen in de demo.
- **Bewust later:** foutmeldingen automatisch vastleggen en een Content-Security-Policy (zie `docs/productie-en-groei.md`, Openstaand).

## Besluit 36 — Communicatieplan: aankondigen, herinneren, noodberichten en wanneer een e-mail
*Besloten 25 september 2026. Herziet Besluit 26 (vaste berichten).*

**Drie soorten berichten**
| Soort | Weten ouders het al? | Voorbeeld | Hoe |
|---|---|---|---|
| **Aankondiging** | nee, het is nieuw | bowlen, extra training, toernooi | door een mens, meteen bij het aanmaken |
| **Herinnering** | ja (jaarplanning of app) | vakantie, Goede Vrijdag, start seizoen | automatisch, volgens het schema |
| **Noodbericht** | nee, en het is nu | code rood, velden afgekeurd | één tik met een klaargezette tekst, altijd urgent |

**Standaard herinneringsschema** (per onderwerp aan te passen: meerdere momenten, automatisch of klaarzetten, app en e-mail of alleen app):
- Start seizoen: 14 en 2 dagen voor de eerste training · Einde seizoen: 14 dagen.
- Vakantie: 7 dagen voor de eerste vakantiedag · Na de vakantie "we trainen weer": 2 dagen voor de eerste training.
- Vrije dag / club dicht (korter dan 3 dagen, bijv. Goede Vrijdag): 7 dagen.
- De wedstrijden beginnen (per fase): 7 dagen voor de eerste wedstrijd. ("Nieuwe fase" vervalt: dat zegt ouders niets.)
- Beoordelingen en ontwikkelgesprekken: 7 dagen.
- Gewone trainingen en wedstrijden: geen herinnering (routine).

**Vuistregels:** hooguit 3 berichten per onderwerp; een herinnering alleen aan wie hem nodig heeft; vallen meerdere herinneringen tegelijk, dan één gebundeld bericht ("Goed om te weten"); per moment gaat alleen de laatste termijn uit als er een is gemist.

**Eigen berichten:** krijgt de club vaak dezelfde vraag van ouders, dan maakt de HJO/beheerder er een vast bericht van (datum, termijnen, tekst).

**Activiteiten:** bij het aanmaken kies je de herinneringen (standaard 7 en 2 dagen). **Opgave nodig** (bijv. bowlen): ouders geven ja of nee door vóór een uiterste datum; herinneringen tellen tot die datum en gaan alleen naar wie nog niet reageerde; de trainer ziet "x komen · y niet · z nog geen antwoord". Activiteiten met opgave tellen niet mee voor aanwezigheid en kaarten (vrijwillig).

**Noodberichten:** code rood (alles afgelast), code oranje (mogelijk afgelast, bericht uiterlijk om ...), velden afgekeurd, club onverwacht dicht. Bij HJO → Planning → *Noodbericht of afgelasten*.

**Waar:** alles staat in het **Communicatieplan** (HJO → Planning, en clubbeheerder → Seizoen), met een tijdlijn per maand (ingeklapt). Automatische berichten komen **niet** op Home of in het berichtencentrum van de HJO; alleen berichten op "klaarzetten" geven één regel "x berichten klaar om te versturen".

**Wanneer ook een e-mail** (naast het bericht in de app):
| E-mail | Geen e-mail |
|---|---|
| urgent (noodbericht, afgelast, planningswijziging) | meldingen ter informatie aan staf |
| persoonlijk (bericht, vraag, **antwoord**, kaart, vriendelijke herinnering) | herinneringen die op "alleen in de app" staan |
| aankondigingen en herinneringen van activiteiten (opgave) | ingeplande berichten (nog niet) |
| vaste herinneringen (standaard, zolang er geen pushmeldingen zijn) | oude berichten en voorbeelddata |
| nieuws van team of club (de afzender kan "ook per e-mail" uitzetten) | |
Zodra er pushmeldingen zijn, gaan vaste herinneringen standaard alleen nog als pushmelding.

**Nog te doen (versie 2):** automatisch versturen vanaf de server (nu gebeurt het zodra de beheerder/HJO of de staf van het team de app opent); ingeplande berichten ook per e-mail; weekbericht als optie.

## Besluit 35 — Pilot RKSV DCG: activiteiten, taken per leeftijd en e-mailmeldingen
*Besloten 24 september 2026.*

**Pilot:** één team, **O12-1 (talententeam, selectie)** van RKSV DCG, 17 spelers. Geen HJO of coördinator: de initiatiefnemer is trainer én beheerder, met twee teamleiders. Trainingen di en do 17:15–18:30 op veld 1, vr op veld 2. Wedstrijden vanaf fase 2 (za 31 okt, na de herfstvakantie). Nu al starten met de trainingen zodat iedereen went. Spelers en ouders melden zich zelf aan via de uitnodiging; de teamleiders keuren goed (de koppeling e-mail ↔ kind ontstaat zo bij de bron).

**Activiteit** (naast training, wedstrijd en oefenwedstrijd): voor zaalvoetbal, pleintjesvoetbal, toernooi of teamuitje. Met naam, datum en tijd, verzamelen, waar (met routeknop), toelichting. Afmelden zoals bij een training (zelfde termijn); telt bij de trainingen voor de aanwezigheid; geen wedstrijdtaken. De trainer zet het erin via *Planning aanpassen*; ouders krijgen een bericht.

**Vaste taken per leeftijd:** t/m O12 trainer-coach, timekeeper en spelbegeleider (thuis). Vanaf O13 trainer-coach, **vlagger** (elke wedstrijd) en **scheidsrechter** (thuis). Vlagger en scheidsrechter zijn ook los toe te voegen.

**E-mailmeldingen:** bij een nieuw bericht krijgen de ontvangers een e-mail (via Brevo): persoonlijke berichten, herinneringen en kaarten, nieuws en nieuwe activiteiten, afgelastingen en wijzigingen (urgent). Niet: meldingen ter informatie aan staf, ingeplande berichten (nog niet), oude berichten en voorbeelddata. Elk bericht hooguit één e-mail. Pushmeldingen op de telefoon volgen later.

## Besluit 34 — Informatie is geen taak; profielen per rol
*Besloten 24 september 2026.*

**Vuistregel (geldt voor elk nieuw idee):** informatie gaat van de bron (meestal de ouder) rechtstreeks de app in. We maken er nooit een taak van voor iemand anders, tenzij er echt iets besloten of gedaan moet worden. Afmelden is communicatie van de ouder, geen taak voor de teamleider ("afmelden namens de ouder" bouwen we dus niet).

**Profielen per rol** (zoals abonnementen: elk profiel is het vorige plus iets erbij). De clubbeheerder kiest bij **Rollen** een profiel en kan daarna losse taken aan- of uitzetten.
| Rol | Basis | Plus | Coördinerend / Compleet |
|---|---|---|---|
| Teamleider | wedstrijden en taken, wie helpt mee, uitnodigen en aanmelden, berichten, contact met ouders | + spelers opvolgen (aanwezigheid, kaarten, signalen), bellen bij rood, langdurig afwezig | + planning aanpassen, persoonlijke gesprekken, notities, trainer registreren |
| Trainer | aanwezigheid, spelers opvolgen, bellen bij rood, materiaal | + beoordelen en ontwikkelgesprekken | + planning aanpassen |
Standaard: teamleider **Basis**, trainer **Compleet**.

**Contactkaart:** tik op een speler → de ouders met bellen, WhatsApp en mail, of het kind bij de volgende activiteit komt, en alleen de knoppen die bij het profiel horen.

**Aanwezigheid apart:** naast het totaal altijd *trainingen %* en *wedstrijden %*. Geen weging: het belang van een wedstrijd zit al in de langere afmeldtermijn en de rode kaart bij niet afmelden. De zones blijven op het totaal.

**HJO pas als het op zijn bordje komt:** op de Home van de HJO (en coördinator) geen losse spelers meer (rode zone, onder 50%, patronen, langdurig). Die volgt de trainer; daarna de coördinator. De HJO ziet een speler pas bij zijn eigen stap (gesprek als er geen coördinator is, clubbesluit) of als een stap blijft liggen. Alles blijft zichtbaar bij Inzicht en per team.

**Ter informatie zonder "Gezien"-knoppen:** een regel verdwijnt vanzelf als het is opgelost; wegklikken is geen werk meer.

## Besluit 33 — Teamleider: alles over de wedstrijd op één plek, en eerlijke speeltijd
*Besloten 24 september 2026. Herziet de teamleider-app (Besluit 9), de wedstrijdbegeleider (Besluit 7) en de speeltijd.*

**Teamleider**
- **Vier knoppen:** Home · Wedstrijd · Berichten · Team. Het tabblad Regelen is opgegaan in Wedstrijd; "Wie helpt er mee?" staat bij Team.
- **Wedstrijd** toont per wedstrijd, in de volgorde van de dag: gegevens (verzamelen, adres, **Route**, delen) → wie komen → taken → op de dag zelf (aanwezigheid, wisselschema) → uitslag. Met een knop **Afgelast** (reden kiezen; ouders krijgen direct bericht, trainer en HJO ter informatie).
- **Tenue** is weggehaald (bijna altijd hetzelfde).
- **Routeknop** overal waar een adres staat (ook bij de ouder): opent de route in kaarten. Later vullen adressen zich via voetbal.nl.
- De teamleider **volgt spelers standaard niet op**: geen percentages, kaarten of signalen, alleen spelers, ouders (appen) en wie er komt. De club kan het aanzetten via Taken per rol ("Spelers opvolgen en signalen afdoen").
- **Registreren of de trainer kwam** staat standaard uit (voor alle rollen); de club kan het aanzetten.

**Vaste taken bij elke wedstrijd** (instelbaar door de club)
- **Trainer-coach** (standaard de trainer): vult op de wedstrijddag de aanwezigheid in.
- **Timekeeper:** doet de wissels met het wisselschema.
- **Spelbegeleider:** alleen bij thuiswedstrijden.
- Fotograaf, bardienst en wastas voegt de teamleider toe als de club erom vraagt.
- De teamleider kan elke taak **verwijderen** (kruisje); wie de taak had, krijgt bericht. Een verwijderde vaste taak komt bij die wedstrijd niet vanzelf terug. Een taak die er al staat, kan niet nog een keer worden toegevoegd.
- De losse "wedstrijdbegeleider" is vervallen: een ouder met de taak trainer-coach of timekeeper ziet het op Home en krijgt alleen voor die wedstrijd tijdelijk toegang (de timekeeper alleen het wisselschema, geen seizoenscijfers van andere kinderen).

**Eerlijke speeltijd**
- Het wisselschema kijkt naar het **percentage van de mogelijke speeltijd in de wedstrijden waarbij het kind er was**. Gemiste wedstrijden (ziek, blessure, andere reden) tellen niet mee: geen achterstand en geen inhaalvoorrang.
- Binnen één wedstrijd eerst gelijk verdelen; wie het laagste seizoenspercentage heeft, krijgt het extra blok.
- **Breedte:** iedereen evenveel, geen koppeling aan trainen (afwezigheid gaat via kaarten en gesprek, niet via de speeltijd van het kind).
- **Selectie:** de trainer mag iemand **een blok minder** geven; de app laat de trainingen van die week zien en legt het vast bij de wedstrijd. Instelbaar per soort team (Regels → Speeltijd).

## Besluit 32 — Kaarten: afmelden zoals op het veld, te laat komen apart
*Besloten 24 september 2026. Herziet de kaarten uit Besluit 5 en de telling per fase uit Besluit 15.*

**Uitgangspunt:** signaleren, communiceren en vastleggen, zonder dat het als straf voelt. Wie echt niet anders kan, wordt begrepen; wie misbruik maakt, valt op. Altijd beslist een mens (trainer of HJO). Het gaat over het afmelden door de ouder, niet over het kind.

**Afmeldgedrag (kaarten)**
- **Vriendelijke herinneringen:** de eerste keren per seizoen geen kaart. **Breedte 2, selectie 1** (instelbaar door de club). Bij de laatste herinnering staat erbij dat hierna een kaart volgt.
- **Te laat afgemeld = geel.** Twee keer geel = **rood**.
- **Niet afgemeld en niet gekomen = direct rood.**
- **Ziek geworden op de dag zelf** (reden "Ziek") telt niet als te laat afgemeld. Misbruik valt op via de bestaande patronen.
- Geen punten meer, geen oranje kaart.

**Rood = signaal voor de trainer (📞)**
- De trainer (of HJO) belt of appt de ouder en legt vast: **gebeld/geappt met afspraak**, of **"Begrijpelijk, geaccepteerd"** (goede reden). Een geaccepteerde kaart blijft zichtbaar, maar telt niet voor de volgende stap.
- **Geheugen over het hele seizoen** (niet meer terug naar nul per fase): opnieuw rood na het contact → persoonlijk gesprek HJO; opnieuw na het gesprek → clubbesluit (mensen, met het bestuur).

**Te laat komen (geen kaart, wel een signaal ⚠️)**
- Twee signalen: **kort en vaak** (breedte 3× binnen 4 weken, selectie 2×) en **structureel** (breedte 8× per seizoen, selectie 5×). Instelbaar door de club.
- De trainer praat erover en kan kiezen: **"Begrijpelijk"** (bijv. werk of vervoer van de ouders). Het signaal komt terug als het vaker gebeurt.

**Wie ziet wat**
- **Ouder:** gele en rode kaarten met uitleg ("Wat betekenen de kaarten?"), hoeveel herinneringen er nog zijn, en de volgende stap.
- **Trainer, teamleider en HJO:** in lijsten geen kaartjes maar alleen **📞** (actie nodig) of **⚠️** (let op). Details bij de speler.
- **Seizoensoverzicht** per speler (aanwezigheid, te laat, kaarten, geaccepteerd, gesprekken) voor de teamindeling, altijd met redenen.

**Nog te doen / afspraken**
- Privacy: details na de teamindeling van het volgende seizoen verwijderen; alleen percentages bewaren (bewaartermijn vastleggen in de echte versie).
- De HJO ziet bij afgedane signalen ook hoe vaak trainers kaarten accepteren (gelijke behandeling tussen trainers).
- Het vaste startbericht van het seizoen legt afmelden, herinneringen en kaarten kort uit.

## Besluit 31 — Vervoer: iedereen brengt zijn eigen kind
*Besloten 24 september 2026. Herziet het onderdeel Vervoer van de ouder-app.*

- **Uitgangspunt:** elke ouder is verantwoordelijk voor het vervoer van het eigen kind. De app gaat ervan uit dat het geregeld is; niemand hoeft iets te doen.
- **Lukt het een keer niet?** De ouder tikt bij de uitwedstrijd op **"Ik zoek vervoer voor …"**. De andere ouders van het team zien dat bij Vervoer en, vanaf 7 dagen van tevoren, op Home ("Daan zoekt vervoer").
- Een andere ouder reageert met **"Kan met mij mee"**. Vervoer aanbieden zonder vraag bestaat niet (niet nodig).
- **Daarna lossen de ouders het onderling op:** waar ophalen, hoe laat, terug. De app regelt dat bewust niet; menselijk contact blijft belangrijk.
- **De teamleider heeft geen taak in vervoer** en ziet het niet op Home of bij Regelen.
- Afmelden voor de wedstrijd haalt de vraag automatisch weg. Rijden telt mee bij "Wie helpt er mee?" (Besluit 28).

## Besluit 30 — Volgorde en rust op elk scherm
*Besloten 24 september 2026.*

Uitgangspunt: **informeren, en clean**. Dat vertalen we naar zes vuistregels voor elk scherm en elke rol:

1. **Volgorde:** eerst wat jij nu moet doen, dan wat er speelt, dan de rest.
2. **Wat bij elkaar hoort, staat in één blok met één kop.** Geen losse blokjes die over hetzelfde gaan.
3. **Elke actie heeft één vaste plek.** Niets dubbel; op Home alleen als er iets te doen is.
4. **Kleur alleen voor aandacht** (oranje, rood). Gewone regels hebben geen gekleurde streep.
5. **Uitleg één keer en klein**, niet bij elk item.
6. **Tabbladen en filters staan altijd bovenaan**, bij elke rol op dezelfde plek.

Toegepast (24 sep 2026):
- **Ouder, Home:** eerst "Actie nodig" (alleen als er iets is), dan **Programma · week 39** (de eerstvolgende activiteiten in één blok), dan de aanwezigheid. Vastgezette clubuitleg staat niet meer op Home maar bij Berichten; urgente berichten wel (aanpassing van Besluit 19).
- **Weeknummers:** een voetbalweek loopt van maandag tot en met zondag. Planning: "Deze week · week 39", "Volgende week · week 40", "Week 41 · 5–11 okt". Het nummer volgt automatisch uit de datum.
- **Ouder, Planning:** "Verder vooruit kijken" is de laatste regel van het laatste weekblok; "Over Jesse" (aanwezigheid, ontwikkelgesprek) en "Langer afwezig" (periode, langer geblesseerd) zijn elk één blok. Het label "Komt" staat er alleen als het afwijkt (bijv. "Afgemeld").
- **Ouder, Berichten:** tabbladen Persoonlijk/Nieuws bovenaan; vastgezette berichten onder het tabblad waar ze bij horen.
- **Ouder, Taken:** korte koppen ("za 26 sep · uit"), geen oranje streep bij open taken, uitleg over de automatische oproep één keer onderaan.
- **Trainer, Spelers:** Materiaal onderaan onder "Team" (op Home alleen zolang er iets te doen is).
- **HJO, Home:** de knoppen "Bericht aan club" en "Afgelasten" weg (staan bij Berichten en Planning); "Te doen" direct onder de cijfers; bij "Ter informatie" de uitleg over "Gezien" één keer.
- Nog open: horen de tabbladen Wedstrijd en Regelen van de teamleider samen?

## Besluit 29 — Waardering voor trainers en teamleiders
*Besloten 23 september 2026.*

- **Aanwezig zijn belonen in plaats van afmelden makkelijk maken.** Waardering werkt beter dan controle, zeker bij vrijwilligers.
- **Op Home van trainer en teamleider staat altijd één vriendelijke regel**, die per dag wisselt, bijvoorbeeld:
  - trainer: "Je gaf dit seizoen al 11 trainingen. Fantastisch!" · "Je team was deze fase 91% aanwezig" · "Je nam al 15× de aanwezigheid op" · "Alle 12 spelers beoordeeld";
  - teamleider: "Je regelde al 5 wedstrijden: taken, begeleiding, alles" · "Dankzij jou zijn er al 10 taken ingevuld" · "Je hielp 3 nieuwe gezinnen op weg".
- **Mijlpalen** bij 10, 25, 50, 100 (en 200) trainingen of wedstrijden: een felicitatie op Home ("10 trainingen gegeven dit seizoen! De club is je dankbaar"), weg te tikken met "Dank je!".
- **Coördinator en HJO** (Inzicht → Mijlpalen): wie een mijlpaal haalde, met een knop **Bedank** (persoonlijk bericht, tekst al klaar).
- **Alleen positief, nooit vergelijken:** geen ranglijst, geen "trainer van de maand". De telling van afmeldingen blijft in het profiel en bij de HJO (Besluit 21), niet in deze regel.
- ClubComm telt alleen wat er al gebeurt; geen extra werk. Dit is iets anders dan de module Beloningen (punten voor ouders, later).

## Besluit 28 — Wie helpt er mee? (taken en rijden)
*Besloten 23 september 2026.*

- **Meehelpen = taken én rijden.** Rijden bij uitwedstrijden telt mee; het is vaak de grootste hulp.
- **Nooit een ranglijst voor ouders.** Vergelijken ontmoedigt vrijwilligers.
- **Ouder** (tabblad Taken): alleen de eigen bijdrage, positief ("Dit seizoen: 2× gereden, 2× spelbegeleider. Dank je wel!"), plus één regel voor het hele team ("Samen hebben de ouders van O10-1 al 16× geholpen"). Ouders zien nooit wie niet helpt.
- **Teamleider** (Regelen → Wie helpt er mee?): per gezin (de ouders van een kind samen) wat ze deden, hoe vaak "kan niet", en wie nog niet heeft geholpen, met de tip om die ouders persoonlijk te vragen. Alleen de teamleider ziet dit; hij verdeelt de taken.
- **Coördinator en HJO** (Inzicht → Meehelpen per team): per team, niet per ouder: hoeveel gezinnen helpen, hoe vaak er geholpen is en welk deel van de taken is ingevuld. **Signaal "scheef"** als 3 gezinnen 70% of meer van het werk doen (bij 5 of meer keer helpen): risico op overbelasting.
- Later mogelijk: verplichte vrijwilligerstaken per gezin en de module Beloningen (zie Later / ideeën).

## Besluit 27 — Wanneer verdwijnt een actie?
*Besloten 23 september 2026.*

- **Een actie verdwijnt pas als hij gedaan is, of als hij niet meer kan of hoeft.** Echte acties kun je niet wegklikken (anders valt iets tussen wal en schip). Alleen regels ter informatie hebben "Gezien" (Besluit 26).
- **Vervoer** ("… zoekt vervoer", Besluit 31) verdwijnt als het kind een plek heeft, is afgemeld, de wedstrijd is afgelast of voorbij is (anderhalf uur na de aftrap). Op Home staat het pas **7 dagen van tevoren**; verder vooruit alleen op het tabblad Vervoer.
- **Taken** staan op Home voor de komende **7 dagen**; verder vooruit op het tabblad Taken. Een taak verdwijnt als iemand hem oppakt of de datum voorbij is.
- **"Kan niet"** bij een open taak: de taak verdwijnt alleen bij jou en blijft open voor de andere ouders en de teamleider ("Toch wel?" zet hem terug).
- De 7 dagen stelt de clubbeheerder in bij Regels (naast "automatische oproepen").

## Besluit 26 — Home van HJO en coördinator: te doen en ter informatie
*Herzien in Besluit 36 (Communicatieplan).*
*Besloten 23 september 2026. Vult Besluit 11 aan.*

- **Home heeft twee delen:**
  - **Te doen:** alleen wat volgens de takenlijst (Besluit 25) bij jou ligt, bijvoorbeeld vervanger regelen, bericht klaar, persoonlijk gesprek, teams zonder staf, aanmeldingen die blijven liggen, trainers opvolgen, en zaken die blijven liggen.
  - **Ter informatie:** om op de hoogte te zijn; je hoeft er niets mee. Elke regel heeft een knop **Gezien**: de regel verdwijnt tot er iets verandert. "Toon ook wat je al gezien hebt" haalt ze terug.
- **Spelerzaken lopen eerst via de coördinator.** Trainer en teamleider pakken het als eerste op; de coördinator kijkt of dat gebeurt. Heeft een team geen coördinator, dan doet de HJO dat.
- **De HJO ziet spelerzaken van teams met een coördinator pas:**
  - als ze **blijven liggen**: rood of opschaling, langer dan 14 dagen open zonder vastgelegd contact (dan bij *Te doen*, met de naam van de coördinator);
  - of als het **ernstig** is: aanwezigheid onder 50% (bij *Ter informatie*).
  - Beide getallen stelt de clubbeheerder in (Regels).
- Rode spelers staan **per team** ("O11-1 (4), O12-3 (4)"), zodat je ziet of het één team is of de hele club. In de lijst staat per speler of het is opgepakt of hoeveel dagen het open staat.
- **Afgedane signalen** ("geen actie nodig" door trainer of teamleider): per signaal **Akkoord**, of **Toch oppakken**: terug naar de trainer met een vraag, of zelf oppakken. Het signaal staat dan weer open.
- **Teams → Staf** (was "Mensen"): iedereen met een rol, met bellen, WhatsApp en mail met één tik, filters per rol en "zonder team". Tik op een naam om rollen te koppelen.
- **Vaste berichten bij de jaarplanning** (Planning → Vaste berichten): vóór elke vakantie, bij een nieuwe fase, bij de beoordelingsmomenten, bij de start en het einde van het seizoen. De datums komen uit de jaarplanning. Standaard zet ClubComm het bericht **klaar** bij *Te doen*; de HJO kijkt het na en verstuurt het met één tik, of slaat het over. Per bericht kan ook "automatisch". Het gaat om zo'n 8–10 berichten per seizoen (geen ochtendbericht of weekoverzicht).

## Besluit 25 — Taken per rol (de club bepaalt)
*Besloten 23 september 2026. Vervangt Besluit 24 (wie ziet wat) en vult Besluit 12 aan.*

- **Rollen zijn vaste bouwstenen met een bereik:** trainer en teamleider (één team), **coördinator** (een groep teams, bijv. O10–O12), HJO (hele club), clubbeheerder (inrichten). Ouders zien altijd alleen hun eigen kind.
- **Taken hangen niet vast aan een rol.** Bij de ene club voert de HJO de gesprekken, bij de andere doet de coördinator dat en denkt de HJO vooral over beleid. **Het bestuur van de club bepaalt welke rol welke taak heeft**; de clubbeheerder vinkt dat aan in *Rollen → Taken per rol* en kan het **altijd aanpassen**.
- Werkwijze bij een nieuwe club (verkoop): samen de lijst doorlopen. "Wat mag de trainer? Wat de teamleider? Wat de coördinator? Wat de HJO?" en aanvinken.
- De takenlijst (per taak één vinkje per rol):
  - *Planning en team:* planning aanpassen · bericht aan de hele club en afgelasten · teams zonder staf oplossen · aanmeldingen die langer dan 48 uur blijven liggen
  - *Spelers opvolgen:* signalen afdoen · langdurig afwezig melden · bellen/appen bij de drempel (stap 3) · persoonlijk gesprek met ouders (stap 4) · clubbesluit voorbereiden met het bestuur (stap 5)
  - *Ontwikkeling:* beoordelen · ontwikkelgesprekken plannen en voeren
  - *Trainers:* registreren dat de trainer niet kwam · trainers begeleiden en opvolgen
  - *Materiaal:* materiaal controleren
  - *Wat zie je:* toelichting bij afmelden · beoordelingen · gespreksnotities
  - *Altijd (niet uit te zetten):* aanwezigheid, afmeldingen, kaarten en signalen van de eigen teams zien
- **Signalen en teksten volgen de taakverdeling.** Een voorgesteld gesprek komt bij wie die taak heeft; in de uitleg aan ouders staat wie contact opneemt ("de trainer of coördinator").
- **Er valt nooit iets tussen wal en schip:** heeft een team geen coördinator (of gebruikt de club geen coördinatoren), dan gaan de taken van de coördinator vanzelf naar de HJO. Heeft een taak geen enkele rol, dan waarschuwt het scherm.
- **Pilot:** de pilotclub (SC Buitenveldert) levert haar eigen basis aan; dat wordt de beginstand. Tot die tijd staat er een voorstel in (terug te zetten met "Terug naar het voorstel").
- In versie 2 dwingt de server de rechten af (Supabase RLS).

## Besluit 24 — Wie ziet wat (per rol)
*Opgenomen in Besluit 25 ("Wat zie je" in de takenlijst).*

*Besloten 23 september 2026.*

- **Iedereen ziet wat hij nodig heeft voor zijn taak, niet meer.** In de onderbouw is de teamleider meestal een ouder van een teamgenoot. Ziekte en blessures zijn gezondheidsgegevens (AVG: alleen wie het nodig heeft).
- Standaard:

| Wat | Teamleider | Trainer | HJO |
|---|---|---|---|
| Aanwezig, afgemeld, te laat + soort reden | ✅ | ✅ | ✅ |
| Kaarten en signalen, langdurig afwezig melden | ✅ | ✅ | ✅ |
| Toelichting die de ouder bij het afmelden typt | ❌ | ✅ | ✅ |
| Beoordelingen | ❌ | ✅ (vast) | ✅ |
| Gespreksnotities en afspraken | ❌ | ✅ | ✅ |
| Contact vastleggen | ❌ | ✅ (vast) | ✅ |

- **De clubbeheerder kan dit per club aanpassen** (Rollen → Wie ziet wat). Wat de trainer voor zijn taak nodig heeft (beoordelen, bellen) staat vast aan. De HJO ziet alles; ouders zien altijd alleen hun eigen kind.
- Ook meldingen volgen dit: wie de toelichting niet mag zien, krijgt de melding zonder toelichting.
- In versie 2 dwingt de server dit af (Supabase RLS), niet alleen het scherm.

## Besluit 23 — Beoordelingsmomenten en ontwikkelgesprekken
*Besloten 23 september 2026.*

- **Twee momenten per seizoen:** *Winter* (eind fase 2, vóór de kerstvakantie) en *Einde seizoen* (eind fase 4). Elk moment heeft een periode van 3 weken waarin de trainer beoordeelt. De trainer mag eerder beginnen.
- **De trainer beoordeelt** per vaardigheid of per speler, op de schaal van de KNVB-leeftijdscategorie (smileys in de onderbouw). Per speler schrijft hij twee korte gesprekpunten op: *wat gaat goed* en *waar werken we aan*.
- Bij het tweede moment ziet de trainer de score van de winter ernaast (▲ beter, ▼ lager, = gelijk), zodat de groei zichtbaar is.
- **Ontwikkelgesprek:** de trainer voert het gesprek. **Ouder en kind zijn er altijd samen bij.** De trainer zet tijden klaar (datum, begintijd, minuten per gesprek, plek) en de ouders krijgen een bericht. Ouders kiezen zelf een tijd; de trainer kan ook zelf een speler aan een tijd koppelen.
- Het gesprek staat in de planning van de ouder en komt **automatisch in de eigen agenda** (agenda-abonnement, Besluit 18), bij de ouder en bij de trainer.
- **De ouder ziet de beoordeling een dag na het gesprek.** Zo hoort het kind het eerst in het gesprek en niet via een scherm. Is er geen gesprek, dan kan de trainer de beoordeling handmatig delen.
- **Toon:** een beoordeling is een momentopname, voor de speler zelf. Er worden geen cijfers vergeleken met andere kinderen, er is geen gemiddelde en geen ranglijst. Ouders zien alleen hun eigen kind.
- **Herinnering:** tijdens de periode ziet de trainer op Home "Beoordelingen winter: x van y" en "Plan de ontwikkelgesprekken". De HJO ziet per team hoeveel spelers al beoordeeld zijn (Inzicht).
- De datums volgen uit de jaarplanning; de clubbeheerder kan ze aanpassen (in de demo nog vast).

## Besluit 22 — Signalen afdoen

- **Signalen ter informatie** (patroon, oranje/rode zone, reeks ziek/blessure, langdurig afwezig, team in zone) kan de trainer, teamleider of HJO afdoen met **"Gezien, geen actie nodig"**, met een optionele notitie.
  - Het signaal verdwijnt, maar **komt terug als het erger wordt**: meer afwezigheid of een zwaardere zone (oranje → rood).
  - De **HJO ziet** wat er is afgedaan, door wie en met welke notitie ("Aandacht nodig" → afgedane signalen), zodat niets stilletjes verdwijnt.
- **Signalen voor de opschaling** (bel of app, gesprek HJO, clubbesluit; Besluit 15) kun je **niet** afdoen; ze verdwijnen alleen door de actie zelf.
  - Snelknop **"Gebeld ✓"** naast de bel- en WhatsApp-knop legt het contact met één tik vast; de notitie kan later worden aangevuld.
- Langdurig afwezig verdwijnt ook vanzelf als de periode voorbij is.

---

## Besluit 21 — Afwezigheid van trainers signaleren

Net als bij spelers: ClubComm registreert en signaleert, de HJO beslist.

| Gebeurtenis | Wie registreert | Punten |
|---|---|---|
| Op tijd afgemeld via "Ik kan zelf niet" (standaard ≥ 24 uur van tevoren) | app | 0 (telt wel mee in het aantal) |
| Te laat afgemeld (< 24 uur) | app | 1 |
| Niet gekomen zonder bericht | **teamleider** (of HJO), bij "Trainingen afgelopen week" in Team | 2 (het zwaarst) |

- **Signaal alleen naar de HJO** ("Aandacht nodig"): bij **3 punten per fase** of **5 afmeldingen per seizoen**. Clubbeheerder stelt de grenzen en de "op tijd"-termijn in.
- De HJO ziet de geschiedenis (met reden, vervanger gevonden of afgelast) en **legt contact vast** (gesprek, gebeld, geappt + afspraak). Daarna verdwijnt het signaal, tenzij er opnieuw iets gebeurt.
- Toon: trainers zijn vrijwilligers. Het gesprek begint met een vraag ("Lukt het nog? Kunnen we helpen, bijv. met een assistent?").
- **De trainer ziet zijn eigen telling** in zijn profiel (geen verrassingen). Ouders en andere trainers zien niets.
- De teamleider ziet per training van de afgelopen week of de aanwezigheid is opgenomen; "geen aanwezigheid" is vaak het eerste teken dat de trainer er niet was.

---

## Besluit 20 — Periode afmelden en "trainer kan niet"

### Een periode afmelden (ouder)
- In Planning (en vanuit het afmeldscherm): **"Afwezig voor een periode"** met van, tot en met, reden (standaard Vakantie) en opmerking.
- Alle trainingen en wedstrijden in die periode worden in één keer afgemeld; intrekken kan per activiteit. Trainer en teamleider krijgen één melding.
- Telt als gewone afmelding (voor kortere afwezigheid). Voor langdurige blessure of ziekte blijft **Langdurig afwezig** (Besluit 10).

### Trainer kan zelf niet
- Bij zijn training tikt de trainer **"Ik kan zelf niet"** en kiest: **vervanger zoeken** of **training afgelasten**.
- Vervanger zoeken: **teamleider en HJO** krijgen direct een melding met **"Ik neem over"** of **"Afgelasten"**; ouders kunnen zich melden via Taken ("Vervangende trainer").
- Wie overneemt, krijgt de training op Home en kan de aanwezigheid opnemen (een ouder tijdelijk, alleen voor die training).
- Afgelasten: ouders krijgen een urgente pushmelding; teamleider en HJO een melding.
- De trainer kan altijd nog "Ik kan toch" kiezen.
- Principe 7 ("er is altijd een vervanger") geldt zo ook voor de trainer zelf.

### Bewust niet
- **Ochtendbericht voor de trainer** en **weekoverzicht voor ouders**: te veel berichten, en de inhoud kan tot het laatste moment veranderen (zeker bij breedteteams waar spelers niet afmelden of te laat komen). De actuele stand staat in de app.

---

- **Aanvulling (23 september 2026): "ik kan niet" is bewust niet zichtbaar op Home.** Een opvallende knop nodigt uit tot makkelijk afmelden. De trainer vindt het ingeklapt onder de training (Aanwezigheid → kies de training → "Kun je zelf echt niet?"), met de uitleg dat het wordt vastgelegd en, binnen een dag voor de training, als te laat telt. Een reden is verplicht. Op Home staat alleen de status als de trainer al is afgemeld (vervanger gevonden of niet).
- **Bellen bij de drempel (stap 3):** de rij heeft drie knoppen met tekst: **Bel [ouder]**, **WhatsApp**, en **Contact vastleggen** (gebeld of geappt + afspraak). Pas na het vastleggen verdwijnt de stap.
## Besluit 19 — Clubberichten, urgent en vastzetten

- **Clubberichten herkenbaar:** berichten van de HJO of clubbeheerder krijgen het club-icoon en het label **"Club"**. Ze vallen op zonder dat ze urgent zijn.
- **Urgent alleen voor tijdgevoelige zaken** (vandaag of morgen, bijv. afgelasting): rood label, bovenaan, pushmelding met geluid en op Home tot het gelezen is. Afgelasten is altijd urgent. Niet alle HJO-berichten worden urgent (anders verliest "urgent" zijn waarde).
- **Vastzetten:** HJO, teamleider én trainer kunnen een bericht **1 of 2 weken** vastzetten (bij versturen of later, bij het eigen bericht). Het staat dan met een speldje bovenaan Berichten, ook als het gelezen is, en zakt daarna vanzelf weg. De afzender kan het eerder losmaken.
- Een vastgezet bericht staat bovenaan bij **Berichten** (sinds Besluit 30 niet meer op Home; urgente berichten wel).
- **Maximaal 2 vastgezette berichten per bereik** (per team, en voor de hele club); bij een derde wordt het oudste losgemaakt.

---

## Besluit 18 — Agenda-abonnement

- Ouders (en trainers en teamleiders voor hun team) kunnen **alle trainingen en wedstrijden in hun eigen agenda** zetten: Google Agenda, iPhone/Mac en Outlook.
- Werkt met de **open standaard iCalendar** (een abonnementslink). Geen abonnement of add-on nodig; het is een klein onderdeel van de server in versie 2.
- **Eén keer abonneren**, daarna loopt het het hele seizoen. Wijzigingen (verplaatst, afgelast) komen vanzelf in de agenda.
- De agenda ververst zelf (meestal binnen een uur, bij Google soms langer). Spoed blijft daarom via **pushmelding**.
- **Alleen lezen:** afmelden gaat altijd via ClubComm; in elke afspraak staat de link "Kan je kind niet? Meld af in ClubComm".
- Keuze: trainingen en/of wedstrijden. Bij meerdere kinderen staan alle teams erin.
- **Privacy:** persoonlijke, geheime link per persoon; in de agenda staat alleen bijv. "Training O10-1", geen gegevens van andere kinderen. Link te vernieuwen in het profiel (oude werkt dan niet meer).
- Te vinden in het profiel en (tot er geabonneerd is) bovenaan de Planning van de ouder.

---

## Besluit 17 — Module Materiaal

- **Checklist per team bij de start van het seizoen**, in te vullen door de trainer (± 1 minuut).
- Per item: **In orde** of **Niet ontvangen**, met een knop "Alles in orde" om snel te beginnen, plus een opmerking.
- De app rekent mee: ballen en hesjes = **1 per speler** van het team; ballen maat 3 (mini's) of maat 4 (O8–O12).
- Standaardlijst: ballen, 40 hoedjes, hesjes (2 kleuren), minidoeltjes (t/m O10), ballentas, ballenpomp, EHBO-tas, keepershandschoenen (vanaf O8), trainingspak trainer. De **clubbeheerder** past de lijst aan.
- **Niet ontvangen** → automatisch een **mail naar de secretaris** (adres instelbaar; die persoon heeft geen account nodig) en een melding bij de HJO ("Aandacht nodig").
- De HJO (of secretaris) vinkt **"Geleverd"** aan; de trainer krijgt dan bericht.
- Het is geen voorraadsysteem: geen uitleenregistratie en geen kleding bestellen.
- **Wordt herzien (nog open, zie "Nog te bespreken"):** het doel is *verantwoordelijkheid*: de trainer tekent bij de start van het seizoen voor wat hij ontvangt en levert het aan het einde weer in. Alleen bij de start van het seizoen, niet per fase.

---

## Besluit 15 — Fases en opschaling

Gebaseerd op de jaarplanning onderbouw 2026/27 (toen nog van SC Buitenveldert; de pilotclub is nu RKSV DCG).

### Fases
- Het seizoen volgt de **4 competitiefases**: fase 1 vanaf wo 19 aug 2026, fase 2 vanaf za 31 okt, fase 3 vanaf wo 20 jan 2027, fase 4 vanaf vr 2 apr (laatste training 4 jun, laatste wedstrijd 5 jun 2027).
- De aanwezigheidszones tellen **per fase**; bij een nieuwe fase begint de teller opnieuw.
- De clubbeheerder stelt de startdatum per fase in (vervangt de "blokken" uit Besluit 5).
- *Sinds Besluit 32 tellen kaarten en opschaling over het **hele seizoen**; de fases gelden nog voor de aanwezigheidszones.*
- Jaarplanning 2026/27 in de app: seizoen 19 aug – 5 jun; geen training in herfst-, kerst-, voorjaars- en meivakantie; Goede Vrijdag (26 mrt 2027) club dicht; onderbouw traint woensdag en vrijdag.

### Opschaling
| Stap | Wie | Wanneer | Wat |
|---|---|---|---|
| 1. Herinneren | app | eerste keer per fase | vriendelijke herinnering, geen kaart |
| 2. Waarschuwen | app | daarna | gele of rode kaart met uitleg (Besluit 32) |
| 3. Bellen of appen | **trainer of HJO** | bij een rode kaart | kort persoonlijk contact, vastleggen (gebeld/geappt, afspraak) of "begrijpelijk, geaccepteerd" |
| 4. Persoonlijk gesprek | **HJO** | opnieuw na het contact | gesprek met ouders, afspraak vastleggen |
| 5. Clubbesluit | **HJO + bestuur** | opnieuw na het gesprek | tweede gele kaart; club kan afscheid nemen (huidig clubbeleid) |

- De app **stelt de volgende stap voor**, maar neemt nooit zelf een besluit.
- Bij het signaal "bel of app de ouders" staan een bel- en een WhatsApp-knop.
- De stappen staan vooraf uitgelegd in de app (bij de kaarten), zodat ouders weten wat er gebeurt.
- Langdurig afwezig (gemeld): geen opschaling. Ernstige zaken (veiligheid, gedrag, thuissituatie): direct HJO + vertrouwenscontactpersoon, nooit via kaarten.

### Speeltijd (uit de jaarplanning)
- Geen vaste keeper: **elke week een andere speler de hele wedstrijd op doel**; het wisselschema kiest de speler die het minst keeper is geweest.

---

## Besluit 14 — Uitschrijven en account verwijderen

Een ouder regelt dit **zelf** in het profiel, zonder tussenkomst van de club.

- **Kind uitschrijven** (stopt, andere club, verhuisd): kind verdwijnt uit het team en uit ClubComm. Trainer, teamleider en HJO krijgen een melding.
- **Account verwijderen:** naam, e-mail, telefoon en koppelingen worden gewist; daarna kan de ouder niet meer inloggen.
  - Kinderen zonder andere ouder in ClubComm worden daarbij ook uitgeschreven; heeft een kind nog een andere ouder, dan blijft het gekoppeld aan die ouder.
  - Is de ouder ook trainer of teamleider, dan krijgt de HJO een melding om een vervanger te zoeken.
- Altijd met een **bevestigingsstap** ("Weet je het zeker?") en uitleg wat er gebeurt.
- Aanwezigheid blijft alleen als **anonieme telling** in de teamcijfers bewaard (geen naam).
- Het **lidmaatschap** zegt de ouder apart op bij de ledenadministratie, **vóór 31 mei** per mail; de contributie loopt tot het einde van het seizoen (jaarplanning). De app zegt dat erbij.
- Nog uitwerken in versie 2: bewaartermijn van gegevens van oud-leden (AVG).

---

## Wie doet wat (overzicht)

| Taak | Wie | Vervanger |
|---|---|---|
| Afmelden (met reden) | Ouder | — |
| Langdurig afwezig melden | Ouder | Teamleider |
| Aanwezigheid opnemen — training | Trainer | Teamleider |
| Aanwezigheid opnemen — wedstrijd | Wedstrijdbegeleider | Teamleider → trainer → ouder-coach |
| Ouders uitnodigen | Teamleider, trainer, HJO | — |
| Aanmeldingen goedkeuren | Teamleider | Trainer → HJO (na 48 uur) |
| Vervoer en taken | Teamleider (met automatische oproepen) | Trainer |
| Speeltijd (module) | Wedstrijdbegeleider | — |
| Beoordelingen | Trainer | — |
| Uitzonderingen in planning | Trainer / teamleider | HJO |
| Weekrooster en veldindeling | HJO | Coördinator |
| Staf en teams indelen, van team wisselen | HJO | Coördinator |
| Signaal speler opvolgen (gesprek) | Teamleider / trainer | HJO |
| Signaal team opvolgen | HJO | Coördinator |
| Clubberichten, afgelasten | HJO | Coördinator |
| Clubinstellingen, modules, seizoen, rollen | Clubbeheerder | HJO |

---

## Handleidingen

De oude handleidingen per rol (23 sep) zijn verwijderd: ze klopten niet meer met Besluit 30–37. Nieuwe handleidingen maken we na de start van de pilot (zie `docs/productie-en-groei.md`, Openstaand).

---

## Later / ideeën

- **Huiswerk en filmpjes** (idee 24 sep 2026): de trainer deelt oefeningen voor thuis (een filmpje of een link) per team of per speler, gekoppeld aan de vaardigheden uit de beoordeling ("werken aan: aannemen"). Kind of ouder kan aangeven "gedaan". Eerst met links naar YouTube/Vimeo (geen eigen opslag). Filmpjes waarin kinderen te zien zijn alleen met toestemming van de ouders (AVG).
- **Fondsenwerving en teamkas** (idee 24 sep 2026, zoals bij Spond): acties voor het team of de club (bijv. een toernooi, nieuwe trainingspakken), bijdragen via een betaallink (bijv. Tikkie of Mollie), met een teller "zoveel opgehaald". Alleen via de penningmeester of het bestuur; eerst uitzoeken wat de club wil en mag. Mogelijk ook een verdienmodel voor ClubComm.
- **Beloningen** (punten, contributie terugverdienen) als optionele module die de HJO per club of team aanzet.
- **Planning uit voetbal.nl** koppelen.
- **Import uit Sportlink** (zie Besluit 2).
- **Uit de vergelijking met Teamy** (`docs/onderzoek/concurrent-teamy.md`): eerlijk clubrooster voor vrijwilligerstaken, meelezer (bijv. opa/oma die brengt), rollen en tags voor vrijwilligers.
- **Uit de vergelijking met VeldPlanner** (`docs/onderzoek/concurrent-veldplanner.md`): veldkaart bij een training (plattegrond met het veld van het team), veldindeling importeren uit Sportlink Club i.p.v. dubbel invoeren, infoscherm in de kantine, uitslag delen als nette post voor WhatsApp.
- **Club inrichten bij de start (onboarding):** bij de verkoop samen met een bestuurslid de taakverdeling instellen: welke taak ligt bij welke rol (HJO, coördinator, clubbeheerder, secretaris…). De tabel "Wie doet wat" wordt dan per club instelbaar.
- **Handleiding bij de verkoop:** per rol en voor de clubbeheerder (opnieuw te maken).
- **Online hulp met AI:** een assistent die de app volledig kent en stap voor stap uitlegt, bijvoorbeeld "hoe zet ik de taken van X uit?" of "hoe zet ik deze module uit?". Scheelt telefoontjes.
- **Evaluatieformulier aan het einde van het seizoen** (ouders, trainers, teamleiders), zodat we per seizoen een rapport kunnen maken van wat beter kan.
- **Checklist rollen en taken bij de club:** per rol aankruisen "hebben wij", "wie doet het" en "in de pilot ja/nee" (o.a. vertrouwenscontactpersoon, ledenadministratie, wedstrijdsecretaris, VOG-controle, technisch jeugdcoördinator, kantine, vrijwilligers). Voor nu blijven de rollen: ouder, trainer, teamleider, coördinator, HJO, clubbeheerder.
- **Meer taken voor de takenlijst (Besluit 25)**, later stap voor stap uitbouwen. Alleen toevoegen wat de app ook echt ondersteunt:
  - *Nu vast bij trainer/teamleider, later instelbaar:* aanwezigheid opnemen · aanmeldingen van het eigen team goedkeuren · berichten aan het team sturen · wedstrijdinfo invullen (verzameltijd, tenue, adres)
  - *Seizoensstart en -einde:* teamindeling en doorstroom naar volgend seizoen · trainers en teamleiders werven · teamgegevens bijwerken · ouderavond/kennismaking
  - *Wedstrijden:* wedstrijdformulier en uitslag doorgeven · oefenwedstrijd of toernooi regelen · vervoer en taken bewaken
  - *Veiligheid en welzijn:* VOG-controle van trainers en teamleiders (signaal "trainer zonder VOG"; niet in de pilot) · doorverwijzen naar de vertrouwenscontactpersoon · blessure of ongeval vastleggen
  - *Trainers ondersteunen:* nieuwe trainers inwerken · trainingen bezoeken en feedback geven · trainersoverleg · trainingsstof of jaarplan delen
  - *Communicatie:* clubbrede agenda bijhouden (toernooien, clubdagen, stops)

---

## Nog te bespreken

- **Materiaal: uitgeven en inleveren** (herziening van Besluit 17). Richting:
  - Trainer **tekent digitaal** bij de start van het seizoen voor het ontvangen materiaal (aantallen per item) en **levert het in** aan het einde; bij een trainerswissel volgt een overdracht.
  - Standaard alleen de **basis**: ballen, hoedjes, ballenzak, trainingspak. De rest kan erbij.
  - Verschilt per club, dus **instelbaar door de clubbeheerder**: welke spullen, hoeveel (clubbeleid, bijv. aantal ballen per team), per teamgroep (nu onderbouw, later bovenbouw).
  - **Wie is verantwoordelijk, verschilt per soort en per club:** trainingsmateriaal hoort bij de trainer; tenues kunnen in bruikleen zijn (bijv. selectieteams) en vallen dan vaak onder de teamleider; bij andere clubs kopen spelers hun eigen tenue. De clubbeheerder moet per soort materiaal kunnen kiezen wie tekent.
  - Nog uitzoeken: wie geeft uit en neemt terug (secretaris of materiaalbeheerder), trainingspak terug of niet, wie tekent bij een team zonder trainer, en of de trainer zelf extra spullen mag toevoegen.
- **Consequenties, nog open:** speler O13+ bij het gesprek betrekken; compliment bij verbetering; een dalingssignaal bij O13+. (De kaarten zelf zijn besloten in Besluit 32.)
- **Jaarplanning importeren:** de jaarplanning (trainingen, wedstrijden, oefenwedstrijden "zelf organiseren", teamuitje, zaalvoetbal, vrije dagen) kan het startpunt zijn voor de planning in ClubComm.
- **Analyse clubproblemen** (`docs/onderzoek/analyse-clubproblemen.md`): voorstellen voor wat ontbreekt (o.a. afmelden namens ouder, bereikbaarheid per ouder, VCP/gedragscode, "mijn kind twijfelt"). Nog niet besloten. Adoptie door ouders ziet de gebruiker niet als risico (mail + push, uitleg, coulante start).

- **Presentatie** voor het bestuur van RKSV DCG (de oude presentatie voor SC Buitenveldert is verwijderd) en eventueel een rollenbeschrijving.
- **Huisstijl:** één set icoontjes in één stijl (Lucide, in het prototype); kleur alleen met betekenis (groen = goed, oranje = aandacht, rood = probleem); verder rustig met het logo-blauw `#0D88F9` als hoofdkleur. **Besloten:** de app is altijd licht (witte achtergrond), ook als de telefoon op donkere modus staat.
