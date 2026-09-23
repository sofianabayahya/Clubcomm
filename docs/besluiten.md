# ClubComm — Besluiten

Hier leggen we vast wat we samen besluiten over hoe ClubComm (versie 2) moet werken.
Dit is de bouwlijst: wat hier staat, bouwen we. Wijzigt een besluit, dan passen we het hier aan.

Laatst bijgewerkt: 23 september 2026

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
3. **Actie nodig** — verschijnt alleen als er iets te doen is (ongelezen persoonlijk bericht, geen vervoer voor uitwedstrijd, open taak).

### Afmelden
- Tik op Afmelden bij de activiteit → kies een **reden** → klaar.
- **Vaste redenen:** Ziek · Blessure · School/huiswerk · Vakantie · Familie · Andere sport · Overig (+ optionele opmerking). Vaste redenen zijn nodig om te kunnen tellen.
- De afmelding gaat direct naar **trainer en teamleider**.
- **Intrekken** kan zolang de afmelddeadline niet voorbij is (kind is toch beter).
- De afmelddeadline is **instelbaar** (zie Besluit 6), niet vast in de code.

### Planning
- **Komende 2 weken als lijst** + knop "Verder vooruit". **Geen maandkalender** (onleesbaar op de telefoon).
- Per activiteit: dag, tijd, veld; bij wedstrijden ook verzameltijd, thuis/uit, tegenstander, adres (link naar kaart) en eventueel tenue. Afmeldingen zijn direct zichtbaar.
- **Seizoensoverzicht** (ingeklapt): aanwezigheid %, aantal trainingen / wedstrijden / toernooien.
- **Afmeldgeschiedenis** (ingeklapt): datum, reden, te laat of niet.
- Later mogelijk: planning automatisch uit **voetbal.nl** (uitzoeken welke gegevens en in welke vorm). Tot dan voert teamleider/HJO de planning in.

### Vervoer
- Hangt aan een **uitwedstrijd**: vervoer aanbieden (aantal plekken) of een plek vragen.
- Teamleider ziet in één oogopslag welke kinderen nog geen vervoer hebben.
- Melding op Home alleen als voor jouw kind nog niets geregeld is.

### Berichten
- **Pushmeldingen** (webapp op het beginscherm), met **mail als reserve**. Zonder meldingen worden berichten niet gelezen.
- Twee tabbladen: **Persoonlijk** (trainer / teamleider / HJO → ouder) en **Nieuws** (team en club), elk met teller voor ongelezen.
- Volgorde: ongelezen en urgent bovenaan, daarna nieuwste eerst.
- **Reageren** alleen op persoonlijke berichten; nieuws is alleen-lezen.
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

| Gebeurtenis | Wie registreert | Kaart | Telt voor drempel |
|---|---|---|---|
| Te laat gekomen op de training | trainer | 🟧 oranje | 1 |
| Te laat afgemeld (na deadline) | systeem | 🟨 geel | 1 |
| Niet afgemeld én niet gekomen | trainer "afwezig" + geen afmelding | 🟨 geel | 2 |

### Kansen geven
- Het seizoen is verdeeld in **blokken** (bijv. seizoensstart, na herfststop, na winterstop — club stelt in).
- **Eerste keer per blok:** geen kaart, maar een **vriendelijke waarschuwing** (automatisch, push + mail).
- Vanaf de tweede keer: kaart, met melding en uitleg aan de ouder ("Wat betekent dit?").
- Bij een nieuw blok gaat de **teller terug naar nul**; de geschiedenis blijft zichtbaar.

### Escalatie
- Drempel bereikt (standaard **3 punten geel** of **5 oranje**) → signaal aan **teamleider en HJO**: *"Gesprek voorstellen?"*
- Teamleider/HJO beslist; het gesprek wordt vastgelegd (wie, wanneer, korte notitie).
- Toon: *"Kunnen we je ergens mee helpen?"*

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
- Past op één telefoonscherm; corrigeren kan tot 48 uur na de activiteit.
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
- Onderbouw: mogelijk **2 beoordelingsmomenten per seizoen** in plaats van 4.

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

## Besluit 8 — Vaste app-structuur en namen (alle rollen)

### Elke pagina, in elke rol, dezelfde structuur
- **Bovenaan:** waar ben ik (bijv. *"Jesse · O10-1"* voor een ouder, *"O10-1"* voor een trainer) + **profielknop [👤] rechtsboven**, op elke pagina.
- **Onderaan:** altijd **5 knoppen**; de eerste is altijd **Home**. De andere vier hangen af van de rol.
- **Achter het profiel** zit alles wat je zelden nodig hebt: gegevens, kinderen, meldingen, taal, rolwisselaar, privacy en **uitloggen**.
- **Uitloggen staat alleen in het profiel**, niet op elke pagina (ouders blijven ingelogd; voorkomt per ongeluk uitloggen).
- Geen "Terug"-links naar de inlogpagina.

### Namen
- De woorden **"dashboard" en "portaal" komen niet in de app** (dat zijn bouwerswoorden). De gebruiker opent gewoon "ClubComm".
- Eerste knop onderaan: **Home** (bekend, werkt in NL en EN).
- Paginatitels zeggen **waar het over gaat** (kind/team), niet "Ouder Dashboard".
- Rollen heten: **Ouder · Trainer · Teamleider · HJO**. Wisselen via de rolwisselaar in het profiel; de huidige rol/team staat altijd bovenaan.
- In onze eigen documenten gebruiken we "ouderportaal", "trainerportaal" enz. wel als werknamen.

---

## Later / ideeën

- **Beloningen** (punten, contributie terugverdienen) als optionele module die de HJO per club of team aanzet.
- **Planning uit voetbal.nl** koppelen.
- **Import uit Sportlink** (zie Besluit 2).

---

## Nog te bespreken

- Teamleiderportaal en HJO-portaal (rondleiding per pagina).
- App-kleuren afstemmen op het logo-blauw (lichter dan de huidige `#1e5ba8`).
