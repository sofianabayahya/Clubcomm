# Ontwikkelgebied F — Documentatie & Presentatie (voorstel, 4 november 2026)

*Spoor 3 — ClubComm. Alleen onderzoek en ontwerp: er is niets veranderd aan de app, de database, productie of aan bestaande PowerPoints en PDF's.*

**Over de plek van dit stuk.** Het voorstel voor de centrale ontwikkelagenda met de gebieden A–E staat niet in GitHub (gezocht op alle branches). Daarom staat gebied F hier als **los hoofdstuk** dat je in dat voorstel kunt invoegen. Het sluit aan op `docs/plan-van-aanpak.md`: daar staan al *B. Product beschrijven (de bron)* (handboek) en *E. Invoeren bij een club* (handleidingen per rol). Gebied F maakt daar één werkwijze van.

**Kort.**
- Wat er nu is, is **verouderd**. De vijf PowerPoints zijn voor het laatst inhoudelijk bijgewerkt op 9-10 (Besluit 98). De trainingsmodule, de vormenbank, de tekentool en het begeleiden van trainers komen er niet in voor.
- Er zijn maar twee PDF's (ouders en teamleider).
- Een handleiding voor de HJO, de clubbeheerder of een snelstart voor vrijwillige trainers bestaat nog niet.
- Voorstel: één bron in GitHub, namelijk **functiekaarten**: per functie één Markdown-bestand, met tekst per niveau. Daaruit maakt het bestaande script `docs/presentaties/maak.js` alle handleidingen, PDF's en dia's. Een instructie pas je dan op één plek aan.
- Elke pull request krijgt een vast blok **Documentatie-impact**.

---

## 1. Het zesde ontwikkelgebied

**F. Documentatie & Presentatie.** Alles waarmee mensen leren wat ClubComm doet en hoe je het gebruikt:
- snelstartgidsen voor vrijwillige trainers;
- uitgebreide gebruikershandleidingen;
- handleidingen voor de HJO en de clubbeheerder;
- PDF's over de werking;
- schermafbeeldingen met uitleg per functie;
- bestuursdemo's en presentaties.

**Doel:** wat iemand leest of in een demo ziet, klopt altijd met de app die in productie draait.

**Uitgangspunten**
1. **Documentatie hoort bij "afgerond".** Een wijziging is pas af als de documentatie is bijgewerkt (of als er uitdrukkelijk staat dat er geen documentatie-impact is).
2. **Productie is leidend.** Een functie op een onderzoeksbranch of in een open pull request staat nooit in gepubliceerde documentatie. In een bestuursdemo mag hij alleen op de dia *In ontwikkeling* staan.
3. **Eén bron.** Dezelfde instructie wordt nooit los in meerdere PDF's bijgewerkt.
4. **Vrijwilligersprincipe (Besluit 149) ook voor documentatie:**
   - kort waar het kan;
   - meer uitleg alleen wie dat zoekt;
   - geen dik boek.

**Wat er niet onder valt**
- Uitleg ín de app (knopteksten, lege toestanden, toasts). Dat blijft gewoon appwerk met een voorbeeldscherm (maat M).
- De methodiekdocumenten van Spoor 1 en 2. Die leveren alleen *inhoud per profiel* aan (zie § 8).

---

## 2. Overzicht van documentatie en demo (stand 4-11)

**Referentie:** `main` = d724bfd. Welke commit productie werkelijk draait, is voor dit stuk **niet nagegaan**. Bij elke publicatie gebeurt dat met `list_deployments` (§ 6).

**Hoe gecontroleerd:**
- **Gezien:** ik heb het bestand en de datum van de laatste wijziging bekeken.
- **Afgeleid:** ik heb in `maak.js` gezocht op woorden. De dia's zijn niet één voor één bekeken; dat volgt bij de eerste herziening.

| Stuk | Waar | Laatst inhoudelijk | PDF | Status | Wat ontbreekt of niet klopt |
|---|---|---|---|---|---|
| Bestuur (PowerPoint) | `docs/presentaties/ClubComm-bestuur.pptx` | 9-10 (Besluit 98) | nee | **Verouderd** | Trainingen voorbereiden, trainers begeleiden, laptopweergave (113), teams zelf beheren (136) *(afgeleid)* |
| Trainer | `docs/presentaties/ClubComm-trainer.pptx` | 9-10 | nee | **Verouderd** | De hele trainingsmodule: Plannen, vormenbank, tekentool, Week, *Hoe wil je beginnen?* (150, nog niet in productie). In `maak.js` staan de woorden "oefenvorm", "vormenbank" en "tekentool" niet *(afgeleid)* |
| Teamleider | `docs/presentaties/ClubComm-teamleider.pptx` + `docs/presentaties/pdf/ClubComm-teamleider.pdf` | 9-10 | ja | **Nog te controleren** | Waarschijnlijk grotendeels goed; de schermafbeeldingen zijn van vóór de laptopweergave |
| Ouders | `docs/presentaties/ClubComm-ouders.pptx` + `docs/presentaties/pdf/ClubComm-ouders.pdf` | 9-10 | ja | **Nog te controleren** | Idem |
| Productoverzicht | `docs/presentaties/ClubComm-productoverzicht.pptx` | 9-10 | nee | **Verouderd** | De trainingsmodule en het begeleiden ontbreken |
| Kennismaking per club | gemaakt door `maak.js clubs <naam>` | okt. | nee | Concept per club | Staat vast op "oktober 2026" |
| Rondleiding bestuursdemo | `public/app/demo.js` (Besluit 89, 114) | 23-10 | — | **In productie, onvolledig** | 17 stappen: ouder, trainer (aanwezigheid, speeltijd), teamleider, wedstrijddag en club. **Geen stap** over een training voorbereiden en geen stap over hoe de HJO een trainer begeleidt |
| Demo Swift-trainer | branch `demo/swift-trainer` | — | — | Simulatie | Nooit samenvoegen; alleen intern |
| Handleiding HJO | — | — | — | **Ontbreekt** | Begeleiden, afspraken, rollen (plan van aanpak E) |
| Handleiding clubbeheerder | — | — | — | **Ontbreekt** | Inrichten, teams, regels, rechten |
| Handleiding coördinator | — | — | — | **Ontbreekt** | Vervanger regelen, signalen |
| Snelstart vrijwillige trainer | — | — | — | **Ontbreekt** | De eerste training in vijf handelingen |
| Handboek ClubComm-adviseur | plan van aanpak B | — | — | **Ontbreekt** | Volledige uitleg (10 hoofdstukken) |

**Bronnen die we hergebruiken in plaats van opnieuw te schrijven:**
- **Besluiten (`docs/besluiten.md`):** het *waarom* en de precieze regels. De handleiding verwijst ernaar en herhaalt ze niet.
- **De kaart (`docs/kaart.md`):** per onderwerp de code, besluiten en tests. Die wordt het register van de functiekaarten (één kolom erbij).
- **De schermafbeeldingsscripts (`docs/presentaties/shots.js` t/m `shots4.js`, `docs/presentaties/shots-clubs.js`):** die draaien al op de demo met verzonnen namen.
- **De bouwstenen van `maak.js`:** `stappen`, `kaarten`, `titelDia`, `slotDia` en de huisstijl.
- **De normen uit `docs/app-controle.md`:** voor de leesbaarheid van de PDF's (16 px leestekst, contrast 4,5:1).

---

## 3. Statussen

**Status van een document of demo-onderdeel.** Er zijn er drie, en een stuk heeft er altijd precies één.

| Status | Betekenis | Wie mag het zien |
|---|---|---|
| **Concept** | In de maak. Mag functies beschrijven die nog op een branch staan, met het label *in ontwikkeling*. | Alleen intern (Sofian, de sessies) |
| **Gereed voor publicatie** | Klopt met de pull request die klaarstaat. Is gecontroleerd met de checklist van § 6, deel A. | Intern; wacht op de release |
| **Gepubliceerd** | Klopt met wat **productie** draait. Er staat een versie op met de datum en de commit. | Iedereen voor wie het bedoeld is |

**Status van een functie (staat op elke functiekaart).**
- **In productie:** de commit staat op `main` en draait in productie.
- **In open pull request:** met het nummer erbij.
- **Onderzoek:** alleen een voorstel of een branch.

**De regel:** een gepubliceerde handleiding bevat **alleen** functiekaarten met *In productie*. De bouwstap (§ 5) controleert dat vanzelf en stopt bij een fout.

---

## 4. Eén centrale bron en de PDF's

### 4.1 Functiekaarten

Voorstel: een nieuwe map docs/handleiding met per functie één kaart, bijvoorbeeld `afmelden.md`, `training-voorbereiden.md`, `vormenbank.md`, `begeleidingsmoment.md`, `teams-beheren.md`.

**Bovenaan elke kaart staan vaste gegevens.**
- **Status in de app:** in productie / in open pull request / onderzoek.
- **Commit:** de productiecommit.
- **Besluiten:** bijvoorbeeld 132, 139, 150.
- **Schermafbeeldingen:** de namen van de beelden in `docs/presentaties/beelden`.
- **Doelgroepen:** een of meer uit beginner, ervaren, HJO, beheerder, ouder en teamleider.

**Daaronder staan blokken per niveau. Je schrijft alleen de blokken die nodig zijn.**
- **Kort (beginner trainer):** wat je doet, in hoogstens vijf handelingen, met één schermafbeelding. Altijd aanwezig bij een functie voor trainers.
- **Meer (ervaren trainer):** de achtergrond bij methodiek, leerlijnen, periodisering en tekentool. Methodiek-inhoud komt per clubprofiel van Spoor 1 of 2 (§ 8).
- **HJO:** wat de HJO ziet en doet: begeleiden, afspraken, rollen.
- **Beheerder:** wat je moet inrichten of aanzetten.
- **Let op:** uitzonderingen en wat er níét gebeurt (bijvoorbeeld: "een lege oefenvorm wordt niet bewaard").

**Bundels.** Een klein bestand docs/handleiding/bundels (nieuw) zegt welke kaarten in welke uitgave komen.

| Uitgave | Kaarten (blok) | Vorm | Omvang |
|---|---|---|---|
| Snelstart vrijwillige trainer | Kort van 5–6 trainerskaarten | PDF, 2 A4 | ≤ 2 pagina's |
| Handleiding trainer | Kort + Meer | PDF en PowerPoint | per hoofdstuk los te lezen |
| Handleiding HJO | HJO + Kort van de trainerskaarten (om mee te kijken) | PDF | — |
| Handleiding clubbeheerder | Beheerder | PDF + inrichtingslijst | — |
| Ouders / teamleider | Kort van hun kaarten | PDF (bestaat, wordt hieruit opnieuw gemaakt) | — |
| Bestuursdemo / presentatie | Een keuze van de kaarten + de dia *Nu / In ontwikkeling* | PowerPoint + rondleiding | ± 15 dia's |

Zo pas je een instructie (bijvoorbeeld "Training kopiëren") **één keer** aan in `training-voorbereiden.md`. De snelstart, de trainershandleiding, de HJO-handleiding en de bestuursdemo worden daarna allemaal opnieuw gemaakt.

### 4.2 Hoe de PDF's en dia's ontstaan

Er komt geen nieuwe software bij; we gebruiken wat er al is.

1. **Schermafbeeldingen:** de bestaande `shots*.js` draaien op de lokale demo. Elk beeld heet zoals op de kaart staat. De demo heeft alleen verzonnen namen.
2. **PowerPoint:** `maak.js` leest de kaarten en de bundels in plaats van teksten die in het script zelf staan. De bouwstenen en de huisstijl blijven gelijk.
3. **PDF:** van de kaarten maakt het script een eenvoudige HTML-pagina. De Chromium-browser die al bij de tests hoort, slaat die op als PDF. De PowerPoints blijven daarnaast bestaan voor wie wil presenteren.
4. **Versie op elk stuk:** onderaan elke pagina staat *"Versie 4-11-2026 · app d724bfd · status Gepubliceerd"*.
5. **Controle bij het bouwen** (zoals de bestaande verwijzingentest):
   - elke kaart in een gepubliceerde bundel heeft *In productie*;
   - elk genoemd besluit bestaat;
   - elke genoemde schermafbeelding bestaat;
   - geen beeld is ouder dan de laatste wijziging van de code van die functie (een waarschuwing, geen stop).
6. **Archief:** bij een nieuwe publicatie gaan de vorige PDF's naar een map *archief/datum* naast `docs/presentaties/pdf`. Git bewaart de rest.

**Overgang**
- De bestaande PowerPoints en PDF's blijven staan tot de nieuwe versie gepubliceerd is.
- Bestaande stukken worden **niet** aangepast zonder jouw akkoord.

---

## 5. Documentatie-impactcheck per wijziging

**Zes vragen.** Staat er ergens *ja*, dan vul je het blok in. Overal *nee*: schrijf **Geen documentatie-impact**.

1. Verandert er een **handeling** van een gebruiker (een stap erbij, eraf of anders)?
2. Verandert de **navigatie** (een tabblad, menu of plek van een knop)?
3. Verandert de **naam** van een knop, scherm of begrip?
4. Ziet een **scherm** er anders uit (dan klopt de schermafbeelding niet meer)?
5. Verandert wat een **trainer of HJO moet weten** (een regel, uitzondering of recht)?
6. Verandert wat de **bestuursdemo** laat zien (een rondleidingsstap, een demogegeven, *Nu / In ontwikkeling*)?

**Blok voor elke pull request.** Voorstel: dit als vast sjabloon in de repository zetten (een nieuw bestand pull_request_template.md in de map .github). Dat gebeurt pas na je akkoord. Tot die tijd neemt Spoor 3 het blok met de hand op.

```markdown
## Documentatie-impact
- Soort: alleen techniek / de taak van de gebruiker verandert
- Handleidingen die veranderen: (functiekaarten + niveau, bijv. training-voorbereiden · Kort)
- PDF's opnieuw maken: (bijv. Snelstart trainer, Handleiding trainer)
- Demo-onderdelen die veranderen: (rondleidingsstap / demogegevens / dia Nu-In ontwikkeling)
- Schermafbeeldingen vernieuwen: (namen)
- Status van de documentatie: Concept / Gereed voor publicatie
```

Of, als alle zes de vragen *nee* zijn:

```markdown
## Documentatie-impact
Geen documentatie-impact (zes vragen nagelopen: geen handeling, navigatie, knopnaam, scherm, kennis of demo verandert).
```

**Voorbeeld met pull request #113 (Besluit 150, nog niet samengevoegd).**
- Er verandert een taak voor de gebruiker: *Hoe wil je beginnen?* is nieuw (vraag 1, 2 en 4).
- De lege kiezer krijgt een uitleg (vraag 4 en 5).
- De welkomstmelding verdwijnt (vraag 6: de demo begint anders).
- Kaarten: training-voorbereiden en vormenbank (Kort).
- PDF's: Snelstart trainer en Handleiding trainer.
- Schermafbeeldingen: de start van een lege training en de lege kiezer.

---

## 6. Releasechecklist voor documentatie

**Werkwijze:** Inbox → Onderzoek → Besluit → Bouw → Controle → **Borging** → Afgerond.

Documentatie loopt mee:
- **Besluit:** de zes vragen van § 5 worden beantwoord.
- **Bouw:** de functiekaart wordt bijgewerkt op dezelfde branch, met status **Concept**.
- **Controle:** de kaart is **Gereed voor publicatie**.
- **Borging:** publiceren gebeurt pas ná de bevestigde release.

### A. Vóór samenvoegen (klaarzetten)
- [ ] Het blok Documentatie-impact staat in de pull request en is ingevuld (of er staat uitdrukkelijk "Geen documentatie-impact").
- [ ] De functiekaarten zijn bijgewerkt, met de status van de functie *In open pull request #…*.
- [ ] De nieuwe schermafbeeldingen zijn gemaakt van de demo op deze branch: 390 px, verzonnen namen.
- [ ] De PDF's zijn als **Concept** gemaakt en bekeken (leesbaar, niets valt weg, 16 px).
- [ ] Is de demo geraakt? Dan is de rondleiding doorgeklikt en zijn de tests van de demo groen.
- [ ] Er is niets gepubliceerd of verstuurd.

### B. Na de release (pas als productie bevestigd is)
- [ ] Met `list_deployments` nagaan dat productie de commit van `main` draait.
- [ ] De status op de kaarten wordt *In productie* met die commit.
- [ ] De instructies kloppen met productie: één keer doorklikken op de echte app, alleen kijken, geen schrijfacties met echte gegevens.
- [ ] De PDF's en dia's opnieuw maken, met de status **Gepubliceerd** en de versieregel.
- [ ] De vorige versies naar het archief.
- [ ] De bestuursdemo nalopen met het scenario van § 9. Klopt *Nu / In ontwikkeling* nog?
- [ ] De overdracht (`docs/overdracht-clubcomm.md`) noemt welke uitgaven er nieuw zijn.
- [ ] Versturen naar trainers, HJO of bestuur alleen na akkoord van Sofian.

### C. Teruggedraaid of uitgesteld
- Wordt een release teruggedraaid, dan blijft de vorige gepubliceerde versie gelden.
- De conceptversie gaat terug naar **Concept**.

---

## 7. Verantwoordelijkheden

| Wie | Doet | Beslist |
|---|---|---|
| **Spoor 3 (ClubComm-sessie)** | Houdt de functiekaarten, de bundels, `maak.js` en de controles bij; vult het impactblok in; zet uitgaven klaar als Concept / Gereed; houdt de statussen in de kaart bij | Niets publiceren of versturen zonder akkoord |
| **Sofian (initiatiefnemer)** | Leest de concepten vanuit de praktijk (begrijpt een vrijwilliger dit?); geeft akkoord op publicatie en versturen | **Publicatie, versturen, de keuze van de demo-hoofdstukken** |
| **Spoor 1 (persoonlijk)** | Levert het *Meer*-blok aan voor het DCG-profiel (methodiek, leerlijnen), als *"Voorstel Spoor 1 — …"* | — |
| **Spoor 2 (Swift)** | Levert het *Meer*-blok en het HJO-blok aan voor het Swift-profiel (KNVB, jeugdbeleidsplan) | — |
| **HJO / clubbeheerder van een club** | Later: geven terug wat onduidelijk is (via Sofian) | — |

Inhoud van Spoor 1 komt nooit in een uitgave voor een andere club (CLAUDE.md, *Drie sporen*).

---

## 8. Het vrijwilligersprincipe voor documentatie

De niveaus volgen de drie lagen van Besluit 149 (Draaien, Trainen, Ontwikkelen). Lagen zijn geen rollen: een HJO kan prima de snelstart willen.

| Lezer | Laag | Wat | Omvang | Toon |
|---|---|---|---|---|
| **Beginnende trainer** | Draaien | "Je eerste training in vijf handelingen", afmeldingen zien, aanwezigheid | 2 A4, veel beeld | Doe-taal: "Tik op …" |
| **Ervaren trainer** | Trainen, Ontwikkelen | Extra: methodiek, leerlijnen, periodisering, tekentool, vormenbank | per onderwerp 1–2 pagina's, los te lezen | Waarom en hoe |
| **HJO** | — (rol) | Begeleiden, begeleidingsmoment, afspraken, wie wat doet | apart document | Werkwijze, geen klikles |
| **Clubbeheerder** | — (rol) | Inrichten, teams, regels, rechten | apart + inrichtingslijst | Stap voor stap |

**Regels**
- Er komt geen één groot handboek voor iedereen.
- Elk stuk begint met *"Wat je hieraan hebt"* in één zin.
- Alles wat niet hoeft, staat erbij als **"mag"**, niet als **"moet"**.

---

## 9. Vast scenario voor de bestuursdemo

Eén verhaal van ± 15 minuten. Het sluit aan bij de bestaande rondleiding (Besluit 114: "Een week bij VV De Voorbeeldclub") en heeft alleen verzonnen gegevens.

| # | Laat zien | Nu in de rondleiding? | Wie in de demo |
|---|---|---|---|
| 1 | **Het probleem:** alles via WhatsApp, niet afgemeld, steeds dezelfde ouders, kennis zit in hoofden | Ja (proloog, kennismakingsdia) | Sanne |
| 2 | **Tijdwinst voor vrijwilligers:** afmelden springt over, aanwezigheid in één minuut, de chauffeur hoort het vanzelf | Ja | Sanne, Linda, Mark |
| 3 | **Een training voorbereiden:** de training van vorige week gebruiken, een oefenvorm uit de bank, printen | **Nee: ontbreekt** | Mark |
| 4 | **De HJO begeleidt een trainer:** meekijken, begeleidingsmoment, afspraak | **Nee: ontbreekt** (alleen *De club in één oogopslag*, *Inzicht*) | Peter |
| 5 | **Kennis blijft in de club:** vormen en trainingen blijven bewaard en worden gedeeld | **Nee**; de clubbibliotheek is nog in ontwerp, dus komt die op de dia *In ontwikkeling* | Peter |
| 6 | **Nu / In ontwikkeling:** één dia met twee kolommen. Links alleen *In productie* (uit de functiekaarten). Rechts wat in onderzoek of een open pull request zit, met het label *in ontwikkeling* | Nee (nieuw) | — |

**Controle na elke relevante release:** dit is vraag 6 van de impactcheck en checklist B.

**Om de punten 3 en 4 in de rondleiding te krijgen** zijn nieuwe stappen in `public/app/demo.js` nodig. Dat is een appwijziging (maat M: voorbeeld, besluit, tests) en gebeurt **pas na apart akkoord**. Tot die tijd laten we 3 en 4 zien met de PowerPoint.

---

## 10. Voorgestelde volgorde (na je akkoord, steeds apart)

1. **Besluit vastleggen** (het eerstvolgende vrije nummer is nu 151; pas vlak voor het opslaan kiezen). Dit is maat S of M (proces, geen app), en vult *Handleidingen* in `docs/besluiten.md` aan.
2. **Het sjabloon voor pull requests** met het blok Documentatie-impact (maat S).
3. **De eerste functiekaarten** voor de trainer (5–6 kaarten) + de **Snelstart vrijwillige trainer** als Concept. Dat laat zien of de opzet werkt, voordat `maak.js` wordt omgebouwd.
4. **`maak.js` laten lezen uit de kaarten** + PDF via Chromium + de controle bij het bouwen.
5. **Handleiding HJO en clubbeheerder** (met aanlevering door Spoor 2 voor Swift).
6. **Rondleiding aanvullen** met de punten 3 en 4 (maat M, voorbeeld eerst).

**Beslispunten voor jou**
- Is de indeling in functiekaarten met blokken per niveau goed, of wil je liever één bestand per uitgave? (Advies: kaarten; anders werk je dezelfde tekst dubbel bij.)
- Moeten de PowerPoints blijven naast de PDF's? (Advies: ja voor het bestuur en de presentatie; voor trainers alleen PDF.)
- Wie mag een uitgave versturen: alleen jij, of ook een HJO van een club?

**Extra verbetering.** Voorstel: een **datum op elke bestaande PDF en PowerPoint** ("versie 9-10-2026"), zodat iemand die een oude versie doorstuurt dat ziet. Dat raakt de bestaande stukken, dus alleen met je akkoord.

**Status:** alleen onderzoek en ontwerp. Er is geen code, database, productie of bestaande PDF aangepast.
