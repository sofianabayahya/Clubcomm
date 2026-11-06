# Onderzoek: een eigen merkidentiteit voor ClubComm (Spoor 3)

> Onderzoek en ontwerp, 6 november 2026. **Niets in de app gewijzigd**: geen schermen, database, rechten of routes. Geen besluit; eerst kiest de gebruiker een richting.
> Alles staat in deze map: `nu/` (schermafbeeldingen van de huidige app, demo), `prototypes/` (vier losse HTML-prototypes, open `prototypes/index.html`), `beelden/` (schermafbeeldingen van de prototypes op 1366 en 390 px).

## 1. Wat er nu is

Bekeken (demo, 390 en 1366 px): Home van de HJO, Home van de HO, Home van de trainer, Trainers, trainersdossier, Teams, Training (Seizoen, Voorbereiden, Op het veld, Vormen) en de tekentool. Ontwerpbesluiten 30, 34 en 146–178 en `docs/app-controle.md` gelezen.

### Wat goed werkt en moet blijven
- **Actie eerst**: Home begint met wat je moet doen (*Te doen*, *Actie nodig*), informatie staat lager. Dat is de kern van Principe 10 en blijft in alle vier de richtingen.
- **Eén blok per onderwerp, elke actie één vaste plek** (Besluit 30/34).
- **Tikvlakken van 44 pt, leestekst van 16 px, contrast**: de huidige app haalt de normen; de prototypes ook (zie per richting).
- **Gewone woorden** (*Ik neem over*, *Afgelasten*, *③ traject starten*). Geen vakjargon in de bediening.
- **De tekentool**: het groene veld met spelers, hoedjes en schijfjes is het enige stuk ClubComm dat er nu echt "voetbal" uitziet. Hier zit de kiem van een eigen beeldtaal.
- **Laptop met lijst links en detail rechts** (Besluit 171) en de onderste menubalk op de telefoon.

### Waarom het generiek overkomt (visueel)
1. **Geen eigen letter**: een standaard schreefloze systeemletter; niets aan de typografie zegt "ClubComm".
2. **Overal dezelfde witte, afgeronde kaart met zachte schaduw** op lichtgrijs. Elk blok weegt even zwaar.
3. **Standaardblauw (#0869C2)** voor knoppen, gekozen chips, linkjes én titels van taken, zonder merkreden. Blauw betekent tegelijk "klikbaar", "gekozen" en "belangrijk".
4. **Grijze labels in hoofdletters** (*TE DOEN (2)*, *DEZE WEEK*): het bekendste kenmerk van standaarddashboards.
5. **Tegels met kengetallen** (16 teams · 15 trainers · 93 % aanwezig) bovenaan de HJO-Home: netjes, maar je kunt er niets mee doen.
6. **Gekleurde streepjes links aan kaarten** (rood, oranje) als enige accent.
7. **Het logo** is een blauw app-icoon met een bal: inwisselbaar met elke sportapp.
8. **Iconen in de lijsten** (agenda-icoon voor elke dag) voegen geen informatie toe.

### Functionele UX-punten (geen merkprobleem, apart houden)
- Tekentool op de telefoon: de uitleg noemt *Shift+klik* en *Cmd/Ctrl+A* (bestaat niet op een telefoon) en het veld staat midden in veel leeg groen; de rij gereedschap loopt rechts uit beeld.
- HJO-Home: de week staat als losse rijen per dag; je moet scrollen om de weekstand te zien.
- Taken met twee knoppen (*Ik neem over* / *Afgelasten*) staan in dezelfde kaart als taken met een pijl: twee soorten bediening in één blok.

Dit lossen we niet op met een nieuwe huisstijl; het zijn losse voorstellen voor later (zie §7).

## 2. Ontwerpreferentie

- De **Frontend Design-skill van Anthropic** is in deze omgeving aanwezig als bestand en is als **leesreferentie** gebruikt. Hij is **niet geïnstalleerd** in het project; installeren kan alleen na akkoord. Er is niets geïnstalleerd.
- Daaruit gebruikt: de lijst met herkenbare "AI-standaardstijlen" om te vermijden (crème + schreefletter + terracotta, bijna-zwart + zuurgroen, krantenlijnen zonder afronding, identieke witte kaarten met schaduw, hoofdletterlabels, "→" op knoppen) en het advies om durf op één plek te zetten, typografie als persoonlijkheid te gebruiken en één beweegmoment te ontwerpen dat *Beperk beweging* respecteert.
- Gecombineerd met de projectskills *app-design-architect* en *app-workflow-optimizer* (taak eerst, behoud wat werkt) en de normen uit `docs/app-controle.md`.
- Referenties per richting staan in de moodboards; er is **geen interface of merk gekopieerd**. Alle letters zijn vrij (Google Fonts).

## 3. Merklagen: ClubComm, club, accent

| Laag | Van wie | Wat | Wat niet |
|---|---|---|---|
| **Merk ClubComm** | vast, voor alle clubs | letters, indeling, componenten, statuskleuren, merkkleur, beweging, logo | — |
| **Club** | per vereniging (beheer) | embleem, clubnaam, één clubkleur | knoppen, statuskleuren, letters, indeling |
| **Clubaccent** | afgeleid uit de clubkleur | embleem in het menu, markering *thuis* bij wedstrijden, kop van berichten/mails | hoofdknoppen, "let op", "nu" |

Regels: ClubComm controleert dat de clubkleur 4,5:1 contrast haalt en kiest anders zelf een donkere tint. Een club kan nooit de betekenis van een statuskleur veranderen. In elk prototype kun je bovenaan wisselen tussen drie verzonnen clubs (*VV De Voorbeeldclub*, *SV Blauwvoet*, *FC Zonnedorp*) om dat te zien. DCG-methodiek (Spoor 1) en Swift-beleid (Spoor 2) zijn **niet** gebruikt als ontwerpstandaard; de inhoud in de prototypes is algemeen en verzonnen.

## 4. De vier richtingen

Alle vier tonen dezelfde echte structuur: HJO-Home (*Actie nodig* met *2 trainers wachten op een stap van jou*, *Mijn trajecten*, *Deze week*), training *Voorbereiden* (Start, A1, A2, B1, Partij; 68 van 75 minuten; afspraak) en een componentenblad. Per richting: `prototypes/x-….html` → onderdelen Moodboard, Home HJO, Training, Componenten (met Beweging).

### A · Matchday (was: Performance) — krachtig en sportief
- **Visie:** het ritme van een wedstrijddag. Bovenaan een donker **scorebord** met drie tikbare tellers; daaronder een lichte werkvloer.
- **Letters:** Barlow Condensed 800 (koppen, cijfers, tabs) + Barlow (tekst). Gemaakt naar verkeersborden: leesbaar op afstand.
- **Kleur:** inkt #0E1A24, aftrap-oranje #FF5A1F alleen voor de hoofdactie en "nu", koel lichtgrijs veld.
- **Componenten:** rechte hoeken, harde scheidingen, hoofdknop met één schuine kant, voortgang in segmenten, training als **trainingsklok**.
- **Beweging:** tellers en weekstaven lopen één keer op.
- Beelden: `beelden/a-home-lap.jpg`, `a-home-tel.jpg`, `a-training-lap.jpg`, `a-training-tel.jpg`, `a-bord-lap.jpg`, `a-kit-lap.jpg`.

### B · Leerlijn (was: Academy) — toegankelijk en lerend
- **Visie:** elke trainer is onderweg. Trajecten, de stappen ① tot ④ en trainingsblokken zijn **lijnen met stations**; zon-geel = hier ben je. Hele zinnen: *Peter, drie dingen voor vandaag.*
- **Letters:** Bricolage Grotesque (koppen) + Atkinson Hyperlegible (tekst, 17 px; gemaakt voor slechtzienden).
- **Kleur:** groei-groen #0F6E5A, zon #FFC53D, koele lucht #EEF3F7 (bewust geen crème).
- **Componenten:** pilknoppen, taken met een rond nummer, menu bovenaan in plaats van links.
- **Beweging:** het spoor groeit, het gele station tikt één keer aan.
- Beelden: `beelden/b-…`.

### C · Krijtbord (was: Tactics) — tactisch en grafisch
- **Visie:** de taal van het tactiekbord. Home als veld met twee helften (links wat jij doet, rechts wie je begeleidt), trainers als **spelersrondjes** met initialen, **pionnen** als status, trajecten als **looplijnen** (stippel = nog te doen), training als **veldstrook** met vakken naar minuten. Sluit aan op de bestaande tekentool.
- **Letters:** één familie, Archivo met breedte-as: breed voor koppen, smal voor codes en minuten, normaal voor tekst.
- **Kleur:** diep gras #0F4D36, pion-oranje #F26B1D, hesje-blauw #2457C5 (alleen links en tweede ploeg), krijtwit.
- **Componenten:** smalle iconenrail, gestippelde krijtlijnen als scheiding, één vlak per blok.
- **Beweging:** looplijnen worden getekend, een nieuwe pion valt op zijn plek.
- Beelden: `beelden/c-…`.

### D · Clubhuis (was: Studio) — rustig en verfijnd
- **Visie:** stil, precies gereedschap; de **club kleurt het**. Grafiet en wit, groepen door ruimte in plaats van kaarten, een agenda-kolom rechts, de training als **rooster met begintijden** (17:00, 17:10, 17:22).
- **Letters:** Schibsted Grotesk voor alles; één grote kop als enige stem.
- **Kleur:** grafiet #17181A, vlak #F4F4F2, de clubkleur als enige accent.
- **Beweging:** de inhoud komt één keer in lagen binnen.
- Beelden: `beelden/d-…`, plus `d-home-club-blauwvoet.jpg` en `d-home-club-geel.jpg` (zelfde scherm, andere club).

## 5. Beoordeling per gebruiker

| | Beginnende oudertrainer | Ervaren breedtetrainer | Selectietrainer / HJO |
|---|---|---|---|
| **A Matchday** | Krachtig, maar hoofdletters in smalle letters lezen trager; het donkere scorebord voelt "zwaar". | Herkent de sfeer, snel overzicht. | Sterk: in één blik de stand van de dag. |
| **B Leerlijn** | Het makkelijkst: hele zinnen, groot, "hier ben je". | Kan wat schools/langzaam voelen. | Trajecten als lijn met stations passen bij begeleiden. |
| **C Krijtbord** | Herkent het veld en de pionnen; woorden als "zetten" en "opstelling" kunnen verwarren → gewone woorden houden. | Voelt als eigen taal. | Sterk: trainers als spelers, looplijnen, veldstrook. |
| **D Clubhuis** | Rustig en duidelijk, maar weinig houvast in kleur. | Prettig, onopvallend. | Fijn op de laptop (agenda rechts); weinig karakter. |

Alle vier: tikvlakken ≥ 44 px, tekst ≥ 16 px, contrast ≥ 4,5:1 (per kleur in het moodboard), focus zichtbaar, *Beperk beweging* zet alle beweging uit, telefoon met menubalk onderaan en safe area. Niet echt getest met gebruikers: dit is een expertbeoordeling.

## 6. Vergelijking

Schaal 1–5 (5 = best; bij risico en omvang: 5 = laagste risico / kleinste klus).

| Criterium | A Matchday | B Leerlijn | C Krijtbord | D Clubhuis |
|---|---|---|---|---|
| Onderscheidend vermogen | 4 | 3 | **5** | 2 |
| Past bij ClubComm (jeugdvoetbal, begeleiden) | 3 | 4 | **5** | 3 |
| Gebruiksgemak | 3 | **5** | 4 | 4 |
| Mobiel | 4 | 4 | 4 | 4 |
| Technische impact (klein = 5) | 3 | 4 | 4 | **5** |
| Onderhoudbaarheid | 4 | 4 | 4 | **5** |
| Risico op inconsistentie (laag = 5) | 3 | 4 | 3 | 4 |
| Omvang invoering (klein = 5) | 2 | 3 | 3 | **4** |

**Technische impact, voor alle vier gelijk van aard:** alleen CSS-variabelen (tokens), één of twee lettertypes (zelf hosten, niet via Google, voor snelheid en privacy), en per scherm kleine opmaakwijzigingen. Geen nieuwe functies, gegevens of rechten. A en C vragen het meeste herschrijven van lijsten (scorebord, veldstrook); D het minste.

### Advies
**Kies C · Krijtbord als basis**, met drie leningen:
1. **Gewone woorden uit de huidige app** (*Actie nodig*, *Mijn trajecten*), niet "zetten" en "opstelling": de beeldtaal mag tactisch zijn, de taal niet.
2. **Stations uit B** voor de stappen ① tot ④ en het seizoen (één voortgangsvorm voor "stappen"), naast de looplijn voor trajecten.
3. **De clubregel uit D**: de club zit in het embleem en de *thuis*-markering, nooit in knoppen of status.

**Waarom:** C is de enige richting die je niet bij een andere sector kunt neerzetten; de vormen (veld, spelers, pionnen, looplijnen) dragen informatie in plaats van te versieren, en sluiten aan op de tekentool die er al is. Eén lettertype en één groen houden het onderhoud klein. **Nadeel en risico:** het groen ligt dicht bij het tekenveld (daarom donkerder gras voor het merk, lichter veld voor tekeningen) en de grafische elementen kunnen gaan woekeren; daarom regels in DESIGN.md (maximaal één veldmotief per scherm).

**Wat niet combineren:** het donkere scorebord van A met het groen van C (twee "zware" vlakken), en de clubkleur als hoofdkleur (D) met een eigen merkkleur (dan verdwijnt ClubComm).

## 7. Voorstel: structuur van DESIGN.md (pas na de keuze)

1. **Merk in één alinea** — wat ClubComm is en hoe het voelt; drie ontwerpprincipes (Principe 10, actie eerst, vormen dragen informatie).
2. **Merklagen** — ClubComm, club, clubaccent; wat een club wel/niet mag; contrastcontrole van de clubkleur.
3. **Tokens** — kleur (merk, neutraal, status, club), letter, maat, ruimte (4-punts-schaal), afronding, schaduw (bij voorkeur geen), lijnen, z-lagen; als CSS-variabelen met naam en waarde.
4. **Typografie** — letterfamilie(s), schaal (tekst 16, klein 15, koppen), gewichten, cijfers, wanneer hoofdletters (nooit voor labels).
5. **Kleurgebruik** — betekenis per kleur, combinaties met contrastwaarden, wat nooit (kleur zonder woord).
6. **Indeling** — telefoon (menubalk, safe area), laptop (rail, lijst + detail, Besluit 171), breekpunten, vaste plek van de hoofdactie.
7. **Componenten** — knop, rij/lijst, blok, status, voortgang (station, looplijn, segment), venster, tabs, zoeken, leeg/laden/fout; per component: doel, varianten, staten, tikvlak, voorbeeldcode.
8. **Beeldtaal** — veld, spelers, pionnen: wanneer wel (met informatie) en niet (versiering); maximaal één veldmotief per scherm; iconen.
9. **Beweging** — het ene merkmoment, duur en curves, *Beperk beweging*, wat nooit beweegt.
10. **Toon en woorden** — korte zinnen, gewone woorden, woordenlijst (trainer, traject, moment, vorm).
11. **Toegankelijkheid** — de normen uit `docs/app-controle.md` als checklist.
12. **Invoeren en bijhouden** — volgorde van invoering per scherm, hoe een nieuw component wordt toegevoegd, wie beslist (besluit in `docs/besluiten.md`).

### Invoeren in stappen (voorstel na keuze)
1. Tokens en lettertype in `app.css` (alles ziet er meteen iets anders uit, niets aan de werking).
2. Componenten: knop, rij, status, voortgang.
3. Home (HJO, HO, trainer), dan Training, dan Trainers/Teams.
4. Elke stap een eigen pull request met voorbeeld op 390 px en de volledige test.

*Spoor 3 · onderzoek · geen besluit.*

## 8. Uitwerking C2 · Krijtbord in ClubComm-blauw (6 november, op verzoek)

Richting C in de kleuren die ClubComm nu al heeft (`public/app/app.css`): blauw #0869C2 (menu, hoofdknop), lichtblauw #0D88F9 (logo, lijnen, rondjes, "vandaag"), navy #0B2545 (tekst, weekband), oranje #F97316 (pion: wacht op jou). Groen alleen nog ín tekeningen. Gewone woorden (*Actie nodig*, *Mijn trajecten*), haltes ① tot ④ uit B, clubregel uit D.

Prototype: `prototypes/c2-krijtbord-blauw.html` met Moodboard, Home HJO, Home trainer, Trainers (lijst + detail), Teams, Training, Tekentool en Componenten. Beelden: `beelden/c2-*-lap.jpg` (1366 px) en `c2-*-tel.jpg` (390 px).

De tekentool laat ook de losse functionele verbeteringen zien (gereedschap in twee rijen, uitleg zonder Shift/Ctrl op de telefoon). Die horen niet bij het merk en vragen een eigen besluit.

Frontend Design-skill: op verzoek geïnstalleerd in `.claude/skills/frontend-design/` (met licentie), op deze branch.

## 9. Herkenningstest

`herkenningstest/index.html`: voorbeeldscherm (met logo), acht tegels zonder logo en clubnaam (wazig en scherp), antwoordformulier en een antwoordsleutel om pas na de test te openen. Vier tegels zijn Krijtbord-blauw, één is de huidige app, drie zijn de richtingen A, B en D. Beelden: `herkenningstest/blad-wazig.jpg` en `blad-scherp.jpg`.
