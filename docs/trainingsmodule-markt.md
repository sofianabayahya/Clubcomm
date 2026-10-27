# Trainingsmodule: marktanalyse vertaald naar ClubComm

*27 oktober 2026. Antwoord op "ClubComm – Marktanalyse vertalen naar ontwikkelplan" (KNVB Rinus, 360Player, coachbetter, The Coaching Manual, planet.training, YouCoach). Dit is een **voorstel, geen besluit**: er is niets gebouwd of gemigreerd. Het bouwt voort op `docs/trainingsmodule-2.md` (vormenbank, versies, uitvoering) en `docs/trainingsmodule-profielen.md` (profielen per club). Voorbeeldschermen staan in `docs/onderzoek/trainingsmodule-2/`: `o-bank-*` (vormenbank), `m-voorbereiden` (training voorbereiden) en `m-hjo` (HO-overzicht).*

**Toets voor elk idee:** past het bij ClubComm? Daarvoor lopen we langs:
- Principe 10: overzichtelijk, nooit een overkill;
- "ClubComm signaleert, mensen beslissen";
- "informatie is geen taak";
- de afgewezen ideeën;
- clubscheiding en de AVG.

Een idee overnemen omdat een ander platform het heeft, is geen reden.

---

## 1. Beoordeling van de tien uitbreidingen

Legenda complexiteit: **K** = klein, **M** = middel, **G** = groot.

| # | Uitbreiding | Meerwaarde trainer / HO | Al in ClubComm | Nieuwe gegevens | Complexiteit en afhankelijkheden | Rechten | Risico op verstoring | Fase |
|---|---|---|---|---|---|---|---|---|
| 1 | **Slimme trainingsassistent** (eigen databank + filters) | Hoog: "geef me een training voor 13 spelers, 75 min, thema vrijkomen". Werkt **zonder AI**: een regelset die filtert en ordent | Afmeldingen, rooster, team, leeftijd | Geen extra: gebruikt vorm, koppeling, evaluatie en profiel | M; nodig: vormenbank (2.0) + profielen + laden per soort | Geen nieuwe | Klein (alleen lezen) | **2** |
| 2 | **Profielen en leerdoelen per club** | Hoog: basis voor alles | Bouwen (Besluit 100), labels per club | `profiel`, `profielversie`, `vormkoppeling` | M; zie profielen-voorstel | Nieuwe scope `trainersclub` | Middel (rechtenmigratie, met de rechtentest) | **1** (als bestand) / **2** (database) |
| 3 | **Vereenvoudiging, basisvorm, verzwaring** | Hoog en goedkoop: één vorm, drie niveaus, in de training één tik | Niets | Drie velden in de vormversie (geen nieuwe soort) | K | Geen | Geen | **1** |
| 4 | **Organisatie aanpassen aan de opkomst** | Hoog en uniek: ClubComm **weet** wie zich afmeldde. Andere platforms weten dat niet | **Afmelden, aanwezigheid, rooster** (kern van de app) | Per vorm "spelers van–tot" en hoe op te schalen (velden in de vormversie) | M; signaal, géén automatische wijziging | Geen | Klein | **2** |
| 5 | **Periodiseringsoverzicht** voor trainer en HO | Middel tot hoog, maar pas als de club een periodisering heeft (Besluit 99: eerst de visie van de HO) | Fases van het seizoen (`M.blok`), bouwen | `periodisering` in het profiel + thema per trainingsplan | M | Lezen: staf. Schrijven: HO | Klein | **3** |
| 6 | **Video en media bij vormen** | Middel: een filmpje zegt meer dan tekst | Niets. ClubComm slaat **geen bestanden** op (bewuste keuze) | Alleen een **link** (YouTube, Vimeo, KNVB Rinus) in de vorm | K als link; **G** als upload (opslag, AVG: kinderen in beeld, kosten) | Geen (link) | Geen (link) / groot (upload) | **2** link · upload **niet doen** |
| 7 | **Goedkeuren van clubbrede oefenstof** | Hoog voor de HO: kwaliteit van de bank | Concept → publiceren bestaat al (kennismaking, traject) | Status in de vorm + wie keurde goed | K–M | HO schrijft de status (`trainersclub`) | Klein | **2** |
| 8 | **Korte leeromgeving voor trainersbegeleiding** | Middel: korte uitleg bij het leerdoel uit het traject | **Trainers begeleiden** (Besluit 99): traject, leerdoel, begeleidingsmoment, reflectie | Per leerdoel van een trainer een of twee **links** of korte teksten van de HO | K als "uitleg + links bij het leerdoel"; G als cursusplatform | Bestaande scopes (`trainerzelf`) | Klein | **3** (klein houden) |
| 9 | **Tactiekbord met fases en animaties** | Fases: hoog (start → vervolg). Animatie: laag voor jeugdtraining; kost veel | Tekentool uit ART (`/tekenen`), statisch | `tekening_json` met `fases[]` (al in het voorstel) | Fases M · animatie G | Geen | Klein (losse module) | Fases **1** · animatie **later** |
| 10 | **Individuele ontwikkeldoelen aan vormen koppelen** | Middel: "vorm voor het werkpunt van Jesse" | **Ontwikkelgesprekken**: per kind een wapen en een werkpunt (Besluit 67–72) | Alleen een verwijzing werkpunt → leerdoel-id in het profiel | M; privacy: alleen de trainer van het team ziet het | Bestaande scope `beoord`; **niet** naar HO of club | Middel (gevoelige gegevens van kinderen) | **3** |

### Wat ik bewust anders doe dan de andere platforms
- **Geen automatische trainingen die "vanzelf" klaarstaan** (#1, #4): ClubComm stelt voor, de trainer kiest. Dat past bij "ClubComm signaleert, mensen beslissen" en bij het afgewezen idee *"Automatisch taken toewijzen, vervoer indelen"* (Besluit 76).
- **Geen video-upload** (#6): opslag kost geld, en beelden met kinderen vallen onder de AVG. Alleen links.
- **Geen ranglijst van trainers** in het HO-overzicht (#5, #7): afgewezen in Besluit 28/29/62 (*"vergelijken ontmoedigt"*). Per trainer alleen ondersteuning, via de bestaande trainerkaart.
- **Trainingsregistratie is geen bewijs van ontwikkeling:** het HO-overzicht noemt het **aangeboden**, nooit "geleerd". Wat een speler laat zien, staat alleen in het ontwikkelgesprek (bij de trainer). Dit past ook bij het afgewezen idee *"Clubbrede lijst van rode spelers"*.
- **Geen leerplatform met cursussen en certificaten** (#8): KNVB Rinus en de KNVB-opleidingen doen dat al. ClubComm verwijst ernaar met links.
- **Geen animaties** (#9) in de eerste fases: veel werk, weinig winst voor een training op het veld. Twee of drie fases als losse plaatjes zeggen hetzelfde.

---

## 2. Ontwerpvereisten: hoe ze terugkomen

| Vereiste | Waar opgelost |
|---|---|
| Bibliotheekvorm tegenover uitvoering | `vorm`/`vormversie` tegenover `uitvoering` (momentopname) — `trainingsmodule-2.md` §2 |
| Gecombineerde filters (leeftijd, teamfunctie, spelprincipe, leerdoel, spelers, ruimte, materiaal, duur, evaluatie) | Vormenbank, filterpaneel op de laptop en chips op de telefoon (`o-bank-*`). De filters komen uit het profiel van de club |
| Versiebeheer en historisch hergebruik | Versies worden nooit meer gewijzigd. *"Eerder met deze vorm"* in het vormvenster. Een training kopiëren van vorige week |
| HO: gepland, uitgevoerd, geëvalueerd — niet als bewijs | `m-hjo`: drie tellingen per leerdoel met de zin *"aangeboden, niet wat spelers beheersen"* |
| In enkele handelingen een training vinden, aanpassen, voorbereiden | Zie hieronder |

**De trainer in vier tikken:**
1. Training openen (Week).
2. *+ Vorm uit de vormenbank*: filters staan al goed (leeftijd, opkomst, thema van de week).
3. *Gebruik in training*.
4. *Klaar, deel met de staf*.

De opkomst en het materiaal rekent ClubComm zelf uit.

---

## 3. Schermvoorstellen

1. **Vormenbank** (`o-bank-tel.png`, `o-bank-lap.png`): zoeken met synoniemen, filterchips (telefoon) of filterpaneel (laptop, nu met ruimte en materiaal), vormkaart met tekening, leerdoel, herkomst en evaluatie, en favorieten via ★.
2. **Training voorbereiden** (`m-voorbereiden.png`, telefoon):
   - thema en leerdoel van de week;
   - signaal over de opkomst ("13 van de 16, vorm 2 is voor 14", met *Voorstel bekijken* of *Laat zo*);
   - tijdlijn met de duur per onderdeel, een tekening per vorm, eigenaar, of het aantal spelers past, en de status;
   - materiaal opgeteld en vergeleken met de materiaallijst van het team (module Materiaal, Besluit 17);
   - knoppen *Klaar, deel met de staf* en *Printen*.
3. **HO-overzicht "Opleiding"** (`m-hjo.png`, laptop):
   - periodisering per bouw (weken met thema en contrathema);
   - leerdoelen in de trainingen (gepland, uitgevoerd, geëvalueerd, laatst);
   - *Wat vraagt aandacht* (teams zonder plan, vormen die op goedkeuring wachten, een leerdoel dat nog niet is aangeboden);
   - *Trainers ondersteunen*: per trainer, gekoppeld aan het traject en de trainerkaart, zonder ranglijst.

---

## 4. Prioritering (sluit aan op `trainingsmodule-2.md` §6)

| Fase | Wat | Waarom eerst |
|---|---|---|
| **0** (na 31 okt) | Laden per soort | Voorwaarde: anders wordt de app traag |
| **1** | Vormen met tekening en **fases** (#9), **makkelijker / basis / moeilijker** (#3), Mijn vormen + Team, training voorbereiden (tijdlijn, materiaal), profiel KNVB als bestand (#2) | Direct bruikbaar voor de trainer, geen rechtenmigratie |
| **2** | Clubbrede bank + **goedkeuren** (#7), **opkomst-signaal** (#4), **trainingsassistent zonder AI** (#1), media als **link** (#6), profiel in de database met een eigen DCG-profiel (#2) | Vraagt de scope `trainersclub` (migratie + rechtentest) |
| **3** | **HO-overzicht met periodisering** (#5), **leeromgeving klein** (#8), **werkpunt ↔ leerdoel** (#10) | Hangt af van de visie en periodisering van de HO, en van gevoelige gegevens |
| **Later / niet** | Animaties (#9), video-upload (#6), AI-assistent bovenop de regelset | Weinig winst of te veel risico. De databank werkt altijd zonder AI |

---

## 5. Wat ClubComm sterker maakt dan de andere platforms
Die platforms zijn **losse trainingsapps**. ClubComm heeft de club al in huis:
- wie er komt (afmelden);
- welk team, welke leeftijd en welk veld;
- wie de trainer begeleidt (HO-traject);
- wat het kind wil leren (ontwikkelgesprek);
- welk materiaal het team heeft.

De meerwaarde zit dus niet in méér oefeningen, maar in **de juiste oefening voor déze training met déze spelers**. Daarom staan #3 en #4 hoog, en video en animatie laag.
