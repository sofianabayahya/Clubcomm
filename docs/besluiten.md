# ClubComm — Besluiten

Hier leggen we vast wat we samen besluiten over hoe ClubComm (versie 2) moet werken.
Dit is de bouwlijst: wat hier staat, bouwen we. Wijzigt een besluit, dan passen we het hier aan.

Laatst bijgewerkt: 23 september 2026 (Besluit 14 t/m 18 toegevoegd)

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
- **Rode bolletjes met aantal** op de knop Berichten en op andere knoppen waar iets nieuws is (bijv. "2 aanmeldingen" bij Team). Pushmelding op de telefoon en het aantal ook op het **app-icoon** op het beginscherm. Geldt voor alle rollen.

### Namen
- De woorden **"dashboard" en "portaal" komen niet in de app** (dat zijn bouwerswoorden). De gebruiker opent gewoon "ClubComm".
- Eerste knop onderaan: **Home** (bekend, werkt in NL en EN).
- Paginatitels zeggen **waar het over gaat** (kind/team), niet "Ouder Dashboard".
- Rollen heten: **Ouder · Trainer · Teamleider · HJO**. Wisselen via de rolwisselaar in het profiel; de huidige rol/team staat altijd bovenaan.
- In onze eigen documenten gebruiken we "ouderportaal", "trainerportaal" enz. wel als werknamen.

---

## Besluit 9 — Teamleiderportaal

**Rol:** de regelaar rond wedstrijden (genoeg spelers, vervoer, taken, begeleiding) en de beheerder van het team (wie hoort erbij, welke ouders, wie is nog niet aangemeld).

### Navigatie
**Home · Wedstrijd · Regelen · Berichten · Team**

### Home — één overzicht, elke regel klikbaar
- Eerstvolgende wedstrijd: datum, tegenstander, thuis/uit, verzameltijd.
- Vier regels, elk klikbaar naar de juiste plek:
  - **Spelers** — 10 van 12 (wie komt / afgemeld)
  - **Vervoer** — aantal kinderen zonder vervoer
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

### Regelen (Vervoer + Taken samen)
- Per wedstrijd: wie rijdt, welke kinderen nog geen plek hebben, welke taken open staan.
- Overzicht wie vaak en wie nooit helpt.
- **Herinneringen gaan automatisch** (oproep voor open taken, melding bij kinderen zonder vervoer), volgens de clubinstellingen (Besluit 6). Geen herinneringsknop nodig.

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

## Besluit 12 — Rollen en clubbeheerder

### Rollen
**Ouder · Trainer · Teamleider · Coördinator (optioneel) · HJO · Clubbeheerder**

- **Vaste rollen met een bereik**, geen zelf te verzinnen rollen (houdt de app eenvoudig).
- **Coördinator:** zelfde rechten als de HJO, maar alleen voor een **groep teams** (bijv. O8–O12). Optioneel; de clubbeheerder bepaalt of de club deze rol gebruikt.
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

Gebaseerd op de jaarplanning onderbouw 2026/27 van SC Buitenveldert en de verdieping in `docs/verdieping-consequenties.md`.

### Fases
- Het seizoen volgt de **4 competitiefases**: fase 1 vanaf wo 19 aug 2026, fase 2 vanaf za 31 okt, fase 3 vanaf wo 20 jan 2027, fase 4 vanaf vr 2 apr (laatste training 4 jun, laatste wedstrijd 5 jun 2027).
- Kaarten en de aanwezigheidszones tellen **per fase**; bij een nieuwe fase begint de teller opnieuw.
- De clubbeheerder stelt de startdatum per fase in (vervangt de "blokken" uit Besluit 5).
- Jaarplanning 2026/27 in de app: seizoen 19 aug – 5 jun; geen training in herfst-, kerst-, voorjaars- en meivakantie; Goede Vrijdag (26 mrt 2027) club dicht; onderbouw traint woensdag en vrijdag.

### Opschaling
| Stap | Wie | Wanneer | Wat |
|---|---|---|---|
| 1. Herinneren | app | eerste keer per fase | vriendelijke herinnering, geen kaart |
| 2. Waarschuwen | app | daarna | gele (of oranje) kaart met uitleg |
| 3. Bellen of appen | **trainer of HJO** | drempel: 3 punten geel of 5× oranje | kort persoonlijk contact, vastleggen (gebeld/geappt, afspraak) |
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

Eén A4-pagina per rol (Ouder, Trainer, Teamleider, HJO) in `docs/handleidingen/`. Ze volgen de besluiten hierboven.
Verandert er een besluit, pas dan de tekst aan in `maak-handleidingen.js` en maak ze opnieuw (instructie bovenin het script).

---

## Later / ideeën

- **Beloningen** (punten, contributie terugverdienen) als optionele module die de HJO per club of team aanzet.
- **Planning uit voetbal.nl** koppelen.
- **Import uit Sportlink** (zie Besluit 2).
- **Uit de vergelijking met Teamy** (`docs/concurrent-teamy.md`): eerlijk clubrooster voor vrijwilligerstaken, meelezer (bijv. opa/oma die brengt), rollen en tags voor vrijwilligers.
- **Club inrichten bij de start (onboarding):** bij de verkoop samen met een bestuurslid de taakverdeling instellen: welke taak ligt bij welke rol (HJO, coördinator, clubbeheerder, secretaris…). De tabel "Wie doet wat" wordt dan per club instelbaar.
- **Handleiding bij de verkoop:** per rol (bestaat al in `docs/handleidingen/`) en voor de clubbeheerder.
- **Online hulp met AI:** een assistent die de app volledig kent en stap voor stap uitlegt, bijvoorbeeld "hoe zet ik de taken van X uit?" of "hoe zet ik deze module uit?". Scheelt telefoontjes.
- **Evaluatieformulier aan het einde van het seizoen** (ouders, trainers, teamleiders), zodat we per seizoen een rapport kunnen maken van wat beter kan.

---

## Nog te bespreken

- **Materiaal: uitgeven en inleveren** (herziening van Besluit 17). Richting:
  - Trainer **tekent digitaal** bij de start van het seizoen voor het ontvangen materiaal (aantallen per item) en **levert het in** aan het einde; bij een trainerswissel volgt een overdracht.
  - Standaard alleen de **basis**: ballen, hoedjes, ballenzak, trainingspak. De rest kan erbij.
  - Verschilt per club, dus **instelbaar door de clubbeheerder**: welke spullen, hoeveel (clubbeleid, bijv. aantal ballen per team), per teamgroep (nu onderbouw, later bovenbouw).
  - **Wie is verantwoordelijk, verschilt per soort en per club:** trainingsmateriaal hoort bij de trainer; tenues kunnen in bruikleen zijn (bijv. selectieteams) en vallen dan vaak onder de teamleider; bij andere clubs kopen spelers hun eigen tenue. De clubbeheerder moet per soort materiaal kunnen kiezen wie tekent.
  - Nog uitzoeken: wie geeft uit en neemt terug (secretaris of materiaalbeheerder), trainingspak terug of niet, wie tekent bij een team zonder trainer, en of de trainer zelf extra spullen mag toevoegen.
- **Consequenties, nog open** (`docs/verdieping-consequenties.md`): speler O13+ bij gesprek; zones pas na 6 activiteiten; gemiste wedstrijd 3 punten; gerichte herinnering vooraf + sociale norm; compliment bij verbetering; dalingssignaal O13+; minder speeltijd bij te laat/gemiste training (jaarplanning vraag 3).
- **Jaarplanning importeren:** de jaarplanning (trainingen, wedstrijden, oefenwedstrijden "zelf organiseren", teamuitje, zaalvoetbal, vrije dagen) kan het startpunt zijn voor de planning in ClubComm.
- **Analyse clubproblemen** (`docs/analyse-clubproblemen.md`): voorstellen voor wat ontbreekt (o.a. afmelden namens ouder, bereikbaarheid per ouder, VCP/gedragscode, "mijn kind twijfelt"). Nog niet besloten. Adoptie door ouders ziet de gebruiker niet als risico (mail + push, uitleg, coulante start).

- **Presentatie** voor bestuur/trainersavond en eventueel een rollenbeschrijving.
- **Huisstijl:** één set icoontjes in één stijl (Lucide, in het prototype); kleur alleen met betekenis (groen = goed, oranje = aandacht, rood = probleem); verder rustig met het logo-blauw `#0D88F9` als hoofdkleur. **Besloten:** de app is altijd licht (witte achtergrond), ook als de telefoon op donkere modus staat.
