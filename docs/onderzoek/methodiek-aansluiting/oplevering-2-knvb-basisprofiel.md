# Oplevering 2 — Minimaal bruikbaar KNVB-basisprofiel (analyse, 04-11-2026)

*Spoor 3. Alleen analyse: er is niets veranderd aan code, profielen, database of productie. Het bestand `supabase/profielen/knvb-2026.1.json` is niet aangeraakt.*

## Doel en toets

**Doel:** een beginnende trainer bij een club **zonder eigen methodiek** kan met dit profiel **één leerweek** voorbereiden, geven en evalueren. Oplevering 3 laat zien hoe dat in de praktijk gaat.

**Toets:** het profiel bevat alleen wat die leerweek nodig heeft. Al het andere kan later.

**Grenzen:**
- Geen inhoud uit Spoor 1 (DCG): geen zes gereedschappen, geen acht voetbalprobleemcategorieën, geen leerniveaus en geen DCG-hoofdcases.
- Geen inhoud uit Spoor 2 (Swift-jeugdbeleidsplan).
- De KNVB-standaard is algemene ClubComm-inhoud (Spoor 3).

## 1. Waar we nu staan

| Punt | Nu |
|---|---|
| Bestand | `knvb-2026.1.json`, status *concept*. De bron zegt letterlijk: *"Opzet op basis van eerdere kennis … tot dan ziet geen trainer het."* |
| Inhoud | Teamfuncties (5 namen, teamtaken en functies door elkaar), een visiezin, een methodiekzin en 4 evaluatievragen als platte tekst. De rest is *leeg*. |
| Geladen in de app? | **Nee.** `opslag.js` leest alleen profielen uit de database. |
| Wat een club zonder profiel ziet | Alleen het weekthema (vrije tekst). Zonder leerlijnen in een profiel zijn er geen A en B. |

## 2. Wat er minimaal in moet

Herkomst:
- **KNVB** = KNVB-begrip of KNVB-structuur, met de bron in §4;
- **ClubComm** = ons eigen voorstel, in eigen woorden;
- **Te controleren** = nog niet vergeleken met een officieel KNVB-document.

| # | Onderdeel | Inhoud (kort) | Herkomst | Belang |
|---|---|---|---|---|
| 1 | **Teamfuncties** | Aanvallen · Verdedigen | KNVB | noodzakelijk |
| 2 | **Teamtaken** met intentie | Opbouwen (scoringskans creëren) · Scoren (scoringskans benutten) · Verstoren van het opbouwen (scoringskans voorkomen) · Voorkomen van scoren (benutten van een scoringskans voorkomen) | KNVB (de sheet uit Matrix v3/Compact v1; zie §4) | noodzakelijk |
| 3 | **Overgangsmomenten** | Balverlies · balverovering | KNVB-begrip *omschakelen*; ClubComm-formulering als "moment" | optioneel |
| 4 | **Voetbalhandelingen** (= de leerlijnen, voor A en B en de minuten in Lijn) | Aannemen en meenemen · Passen · Dribbelen en passeren · Schieten · Vrijlopen · Bal afpakken (druk zetten en duel) | KNVB, te controleren. Vrijlopen is een ClubComm-aanvulling, ook te controleren. | noodzakelijk |
| 5 | **Voorbeeldsituaties** (2 per teamtaak, uitbreidbaar) | zie §3 | ClubComm | optioneel (de trainer kan altijd zelf formuleren) |
| 6 | **Trainingsopbouw** | Sjabloon *60 min*: Start (warming-up) 10 · A voetbalvorm 15 · B voetbalvorm 15 · Toepassing · partij 20. Sjabloon *75 min*: 10 · 20 · 20 · 25. | Volgorde: KNVB (warming-up → voetbalvormen → partijvorm), te controleren. Minuten: ClubComm. | noodzakelijk |
| 7 | **Methodiek, 3 uitgangspunten** | (a) Van wedstrijd naar training en weer terug naar de wedstrijd. (b) Leren in een echte voetbalsituatie, met tegenstander en medespelers. (c) Veel spelen, veel balcontacten, plezier. | KNVB, te controleren | noodzakelijk (als korte uitleg) |
| 8 | **Korte evaluatie** (4 vragen, met code en schaal) | Ontstond de bedoelde situatie vaak genoeg? · Was het gewenste gedrag zichtbaar? · Kwam het terug in de partij of wedstrijd? · Volgende stap: behouden / één ding aanpassen / iets anders proberen. Extra, ingeklapt: *Was er plezier en werd er veel gevoetbald?* | ClubComm (dezelfde 4 als DCG, maar algemeen verwoord). De vraag over plezier: KNVB-gedachte. | noodzakelijk |
| 9 | **Periodisering** (alleen uitleg, geen schema) | Kies een teamtaak en één uitdaging voor 2–4 weken. Na elke training: wat zag je, en wat is de volgende stap? Een voorbeeld van een opbouw (eerst uitvoeren, dan meer weerstand, dan wedstrijdecht), **geen ladder**. | ClubComm | optioneel |
| 10 | Leerdoelen per leeftijd | één zin per bouw | KNVB ("overzicht teamfuncties en doelstellingen"), te controleren | later |
| — | Leerniveaus, spacing, handelingsketens, themalessen | niet nodig voor één leerweek | — | later / niet in de standaard |

### Hoe de KNVB-standaard in hetzelfde model past als DCG
- **Teamtaak** = de bovenste laag. Waar werken we aan? (Bij DCG straks hetzelfde veld, T6.)
- **Leerlijnen** = de **voetbalhandelingen** van de KNVB. Bij DCG zijn de leerlijnen de zes gereedschappen. Lijn, A/B, de Vormenbank en de minuten werken dus **zonder nieuwe code**.
- **Voetbaluitdaging** = het thema van de week. Dat is een vrije tekst, of een voorbeeld dat de trainer aanpast.
- Door dezelfde opbouw ziet een trainer **dezelfde schermen**. Alleen de woorden komen uit een ander profiel.

## 3. Voorbeeldsituaties (ClubComm-voorstel, eigen woorden)

Bewust **niet** overgenomen uit de DCG-hoofdcases (Spoor 1).

| Teamtaak | Voorbeeldsituatie | Gewenst gedrag (voorbeeld) |
|---|---|---|
| Opbouwen | De bal komt niet voorbij de eerste druk: hij gaat terug of lang naar voren. | Een medespeler biedt zich aan naast of achter de druk; de balbezitter kijkt eerst vooruit. |
| Opbouwen | Niemand is aanspeelbaar voor de balbezitter. | Op tijd vrijlopen, weg van de tegenstander. |
| Scoren | Kansen gaan verloren door te haastig of te laat schieten. | Het moment om te schieten herkennen en de hoek kiezen. |
| Scoren | Rond het doel blijft de bal te lang bij één speler. | Kiezen tussen zelf schieten en de vrije medespeler. |
| Verstoren van het opbouwen | Er staat geen druk op de bal, de tegenstander speelt rustig in. | De dichtstbijzijnde speler zet druk; de anderen sluiten aan. |
| Verstoren van het opbouwen | Na balverlies kijken spelers toe. *(overgangsmoment)* | Direct reageren: druk op de bal of terug naar een veilige plek. |
| Voorkomen van scoren | Een aanvaller komt vrij voor het doel na een pass in de rug. | Zien waar de diepte is en die op tijd afdekken. |
| Voorkomen van scoren | Bij een voorzet staat niemand bij de tweede paal. | Taken verdelen bij een voorzet. |

**Een voorbeeld is nooit vanzelf een diagnose:** de trainer kiest het en past het aan. In het weekplan staat het als *"uit voorbeeld"* of *"eigen"*.

## 4. Bronverantwoording

| Bron | Wat eruit komt | Status |
|---|---|---|
| **De KNVB-sheet die jij hebt gedeeld** (Matrix v3: "volgt letterlijk de gedeelde eerste KNVB-sheet"; Compact v1: "twee aangeleverde KNVB VC4-sheets") | teamfuncties, teamtaken, intenties | **Het origineel staat niet in de repository.** Nodig: de titel, de datum en de versie van de sheet. Zet hem zelf in een bronnenmap of noem hem, dan kan de status *gecontroleerd* worden. |
| KNVB-website, gevonden via zoeken: [overzicht teamfuncties en doelstellingen](https://www.knvb.nl/downloads/bestand/19003/overzicht-teamfuncties-en-doelstellingen) | de opbouw per leeftijd (onderdeel 10) | **Niet geopend.** `www.knvb.nl` is vanuit deze bouwomgeving niet bereikbaar. Te controleren. |
| KNVB-website: [de inhoud van de training](https://www.knvb.nl/assist/trainersdashboard/kennisbank/18/de-inhoud-van-de-training), [een voetbalhandeling met bal verbeteren](https://www.knvb.nl/assist/trainersdashboard/kennisbank/100/een-voetbalhandeling-met-bal-verbeteren) | volgorde van de training, voetbalhandelingen, leren in een echte voetbalsituatie (onderdelen 4, 6 en 7) | Alleen het zoekresultaat gezien, niet geopend. Te controleren. |
| [Rinus: hoe werkt het](https://www.knvb.nl/assist-trainers/training-wedstrijd-en-team/ondersteuning-rinus/de-basisprincipes-van-rinus/hoe-werkt-het) | in Rinus kun je zoeken op voetbalhandeling | Zoekresultaat. Te controleren. |
| ClubComm | voorbeeldsituaties, minuten in het sjabloon, de evaluatievragen, de uitleg over periodisering | eigen voorstel, door jou vast te stellen |

**Afspraken over de bronnen:**
- **Geen teksten van de KNVB overnemen.** We vatten kort samen in eigen woorden, met de bron erbij. Voor oefeningen verwijzen we naar Rinus met een link (Besluit 121; video's en cursussen staan bij de Afgewezen ideeën).
- **Status per onderdeel** (Besluit 121):
  - *te controleren* → *gecontroleerd*, met de datum en het document;
  - trainers zien alleen *gecontroleerd* en *eigen*.
- **Nieuw voorstel:** naast de status een veld `herkomst: 'knvb' | 'clubcomm'`. Dan ziet de trainer bijvoorbeeld *"KNVB"* of *"ClubComm-voorbeeld"*, en blijft voor iedereen duidelijk wat officieel is.
- **Wie controleert:** jij, met de KNVB-documenten die je als HO hebt (zoals bij Besluit 99). Wil je dat ik de webpagina's zelf lees, dan moet `www.knvb.nl` in de netwerkinstellingen van deze omgeving worden toegestaan (omgevingsmenu → Edit → Network access → Allowed domains).

## 5. Rechten, clubscheiding en privacy

| Vraag | Voorstel |
|---|---|
| **Waar staat de standaard?** | Als **bestand dat met de app wordt meegeleverd** (bijvoorbeeld `public/profielen/knvb-2026.1.json`), niet in de database. Er zijn geen gegevens per club en er is geen migratie nodig. |
| **Wie leest?** | Iedereen die de app opent, want het is algemene inhoud zonder persoonsgegevens. In de app tonen we het alleen in Training (staf). |
| **Wie schrijft?** | Alleen ClubComm (Spoor 3), via de repository en een pull request, na jouw akkoord. Een club kan de standaard **niet** aanpassen. |
| **Wil een club iets anders?** | Dan maakt de club een **afgeleid profiel**: een eigen rij in de database met `basis: knvb 2026.1` en alleen de eigen onderdelen (Besluit 121/123, modus *afgeleid*). Schrijven mogen HO/TC en de clubbeheerder. Lezen voor andere trainers: zie T2. |
| **Welke club krijgt de standaard?** | **Alleen als de club ervoor kiest** (de clubbeheerder zet het clubprofiel op *KNVB-standaard*). Niet vanzelf voor elke club zonder profiel: dat zou zonder waarschuwing veranderen wat een club in productie ziet. Voor Swift beslist Spoor 2 / de HJO. |
| **Clubscheiding** | De standaard bevat geen clubgegevens. Keuzes van trainers (thema, vormen, evaluatie) blijven in de trainingsplannen van de eigen club, zoals nu. |
| **Privacy** | Er staan geen persoonsgegevens in het profiel. Er verandert niets aan wat er over spelers of trainers wordt bewaard. |
| **Nieuwe versie** | Bijvoorbeeld `2026.2`. De codes blijven. Clubs met een afgeleid profiel krijgen een melding *"Nieuwe KNVB-versie: overnemen?"* (Besluit 121). Er verandert niets vanzelf in lopende trainingen. |

**Maat:** de inhoud is S/M. Het **laden en tonen** is L (het raakt wat clubs zien en wie wat leest). Daarvoor komt eerst een apart bouwvoorstel met een rechtentest.

## 6. Wat er in de app nodig is om dit te gebruiken

| Onderdeel | Bestaat? | Belang | Opmerking |
|---|---|---|---|
| De standaard laden als de club ervoor kiest | ✖ | noodzakelijk | `opslag.js` / `profiel(S)` |
| Evaluatievragen als objecten met code en schaal | ✖ (nu tekst) | noodzakelijk | alleen inhoud |
| Korte evaluatie uit het profiel (`evaluatie.kort`) | ✖ | noodzakelijk | T5 |
| **Weekthema met teamtaak en uitdaging** | ◐ (alleen thema + A/B) | noodzakelijk | Een profiel met teamtaken maar zonder voetbalprobleemcategorieën krijgt nu alleen het eenvoudige weekthema. Het venster moet ook de teamtaak tonen, en optioneel een voorbeeld en het gewenste gedrag. Dus geen volledig DCG-weekplan. |
| Sjabloon uit het profiel | ✅ (werkt al voor DCG) | — | |
| A/B, Vormenbank, minuten in Lijn | ✅ | — | De voetbalhandelingen worden de leerlijnen. |
| Herkomstlabel *KNVB* / *ClubComm-voorbeeld* | ✖ | optioneel | |
| Een paar basisvormen voor een nieuwe club | ✖ | later | Tot die tijd: een eigen vorm of een link naar Rinus |
| Eén Lijn-scherm voor iedereen | ◐ | optioneel | |

## 7. Wat jij moet beslissen

1. **Voetbalhandelingen als leerlijnen:** akkoord met deze 6, waarvan vrijlopen een aanvulling van ons is? Of wil je minder?
2. **Opt-in:** de club kiest zelf voor de standaard en krijgt hem niet vanzelf. Akkoord?
3. **KNVB-sheet:** wil je de bron (titel, datum, versie) aanleveren, zodat de teamtaken de status *gecontroleerd* kunnen krijgen?
