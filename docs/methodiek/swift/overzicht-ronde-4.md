# Overzicht ronde 4 — Swift trainersontwikkeling

*29-10-2026. Voorstel Spoor 2. Hoort bij de concepten `concept-h06-kwaliteitsstandaard.md` en `concept-h07-trainerskader.md`. Er is niets gewijzigd aan app, database, rollen, rechten of productie.*

## 1. Open bestuurlijke beslissingen

| # | Beslissing | Waar |
|---|---|---|
| 06-A | Zijn de gedragsbeschrijvingen per criterium juist? Eerst met de begeleiders toetsen (twee begeleiders, één training). | H06 |
| 06-B | De lijst met KNVB-teamtaken, gecontroleerd tegen de officiële KNVB-bron | H06 |
| 06-C | Concrete leeftijdsdoelen O14–O19 (apart uitwerken, nu niet) | H06 |
| 06-D | Zijn coachaccenten verplicht bij een observatie, of alleen aanbevolen? | H06 |
| 06-E | Worden de zes criteria en de minimale voorbereiding bij observatie formele verwachtingen? | H06 |
| 06-F | Opleidingseisen per team (BD 1.1 noemt ze, maar werkt ze niet uit) | H06 |
| 07-A | De beschrijving van de drie ondersteuningsniveaus | H07 |
| 07-B | Begeleidingsfrequentie per niveau (pas na overleg en pilot) | H07 |
| 07-C/D | Bestaat de functie TJC bovenbouw? Wie stelt hem aan, en wie wijst het werkgebied toe? | H07 |
| 07-E | Ziet een TJC de scan en het niveau in zijn werkgebied? | H07 |
| 07-F | Overdracht als een TJC stopt of van werkgebied wisselt | H07 |
| 07-G | Afspraken bij overdracht naar een formeel beoordelingstraject (toestemming of alleen inzage vooraf) | H07 |
| 07-H | Privacy: bewaartermijnen, en bestaat er al een Swift-privacybeleid? (zie §5) | H07 |
| — | Wie stelt H06 en H07 formeel vast (TC, jeugdcommissie, bestuur)? | beide |

## 2. Belangrijkste beveiligingsrisico's

Elk punt is onderbouwd met een lokale test die je kunt herhalen. Zie het **Voorstel Spoor 3** in `docs/onderzoek/beveiliging-begeleiding.md` (risicoklasse L).

1. **De zelfreflectie is niet van de trainer (bevestigd).** HO en TC kunnen de reflectie van een trainer wijzigen, verwijderen en op zijn naam aanmaken. Een clubbeheerder zonder begeleidersrol kan dat ook. 7 van de 23 controles wijken af van het gewenste beleid.
   - De app doet dit zelf bij *Overnemen uit het evaluatieformulier*, zonder dat de trainer dat kan zien.
   - In productie is er nu geen clubbeheerder zonder begeleidersrol (gecontroleerd, alleen lezen).
2. **Account in twee clubs (niet bevestigd).** Mijn eerdere melding klopte niet. Eén account hoort altijd bij precies één club; dat dwingt de database af. Alle 10 controles zijn goed. Wel kan iemand met één e-mailadres maar één club gebruiken. Dat is een functionele beperking, geen lek.
3. **Begeleider is iedere HO/TC van de club.** Er is nog geen werkgebied in de rechten. Een TJC zou nu alle trainers en dossiers zien. Dat is in strijd met jouw uitgangspunt, dus geen TJC-toegang geven voordat werkgebieden echt worden afgedwongen.
4. **Eigen werkaantekeningen van de begeleider** (scope `hoprive`) zijn leesbaar voor iedere HO/TC, gefilterd op bouw. Bij meer begeleiders is dat een privacyvraag: horen ze bij één begeleider of bij de functie?

## 3. Wat we als eerste veilig kunnen ontwikkelen

Volgorde (stap 3 en 4 van jouw lijst):

1. **Eerst het herstel van risico 1** (Spoor 3, L). Dat raakt de reflectie, en de reflectie is onderdeel van stap 3.
2. **Daarna zonder nieuwe toegang** (alleen bestaande gegevens en rechten):
   - de **zes criteria met de vierpuntsschaal** in de observatie, uit het profiel in plaats van de vragen in de code;
   - de **zelfreflectie op dezelfde zes criteria**, direct na de training, met één herinnering na 24 uur (keuze B);
   - het **gesprek met de twee perspectieven naast elkaar**;
   - **één ontwikkelafspraak die terugkomt** bij het volgende moment en op Home;
   - het volgende moment **zonder vast aantal**.
   Deze punten gebruiken alleen scopes die er al zijn (`trainerdossier`, en `trainerzelf` na het herstel).
3. **Pas later** (nieuwe toegang, eigen L-voorstel): één training delen, voorfeedback en TJC-werkgebieden.

## 4. Aanpassingen aan de oude ontwerpvoorbeelden

De schermen in `docs/onderzoek/swift-trainersontwikkeling/` (ronde 1 en 2) moeten op deze punten worden aangepast, in de volgende ontwerpronde:

| Scherm | Aanpassing |
|---|---|
| Alle schermen | Schaal ✓ / ~ / – wordt **Zichtbaar · Gedeeltelijk zichtbaar · Niet zichtbaar · Niet beoordeeld** |
| `6-observatie`, `s3-perspectieven` | Nieuwe namen van de zes criteria; de gedragsbeschrijving in te klappen per criterium; *Niet beoordeeld* als eigen keuze |
| `2-trainer-voorbereiden`, `s1-…` | Teamfunctie **Aanvallen · Omschakelen · Verdedigen** (omschakelen ontbrak); KNVB-teamtaken; Swift-spelprincipes als hulp; geen vaste *zes keuzes* maar de **minimale drie bij observatie** (+ coachaccenten) |
| `3-trainer-doelstelling` | De 5 W's als denksteun, hoofdrolspelers optioneel; geen leeftijdsdoel, wel de **fasetekst** van de leerlijn |
| `7-trainer-reflectie` | De zes criteria in plaats van drie vrije vragen; de trainer ziet de observatie pas **na** zijn eigen reflectie |
| `10-trainersscan` | Twee delen: **de trainer** vult in (zelfinschatting, ambitie, behoefte), **de HJO/TJC** vult aan; het niveau is **zichtbaar voor de trainer, met uitleg**; niveau *Zelfstandig/verdiepend* |
| `9-dashboard-laptop` | Geen frequentie-indicator per niveau (nog niet vastgesteld); TJC ziet alleen zijn werkgebied |
| `5-tjc-feedback-vooraf`, `s2-…`, `4-trainer-vormen-delen` | Blijven voor later (deelrechten); label *"na het rechtenvoorstel"* |
| `1-trainer-week` | Geen *probleem van de week* als vaste stap (geen verplichte periodisering); alleen het advies |
| `s4-afspraak-vervolg`, `8-gesprek-laptop` | Afspraak **gekoppeld aan één criterium**; het vervolg kiezen zonder voorgesteld vast interval |

## 5. Privacy: wat er nu wordt opgeslagen (inventaris)

Gecontroleerd in de app (`opslag.js`) en de rechten (migratie 026). De bewaartermijn is **nog niet vastgesteld**.

| Gegeven | Opslag (scope) | Waarom nodig | Wie heeft nu toegang | Na herstel en voorstel |
|---|---|---|---|---|
| Kennismaking (diploma, ervaring, ambitie) | `trainerKennis` (`trainerzelf`) | Scan deel A, passende begeleiding | trainer; HO, TC, clubbeheerder: lezen **en schrijven** | trainer schrijft; begeleider leest |
| Vragenlijst vooraf, zelfreflectie | `begeleidZelf` (`trainerzelf`) | Reflectie, gesprek | idem | idem |
| Traject, ontwikkelpunt, (straks) niveau + uitleg | `trainerDossier` (`trainerdossier`) | Begeleiding en opvolging | trainer leest; HO, TC, clubbeheerder schrijven | trainer leest; begeleider schrijft |
| Begeleidingsmomenten (voorbereiding, observatie, leertijd, vier vakken) | `begeleidMomenten` (`trainerdossier`) | Observatie en gesprek | idem | idem |
| VOG en diploma (organisatorisch) | `trainerAdmin` (`hjo`) | Beleid: VOG verplicht (BD 1.1) | HO, clubbeheerder, coördinator | ongewijzigd (buiten de begeleidingsroute) |
| Notities en eigen terugblik van de begeleider | `trainerNotities`, `begelHoVerslag` (`hoprive`) | Werkaantekeningen | iedere HO/TC (per bouw) | besluit nodig (risico 4) |

**Voorstel voor de afspraken** (ter bespreking, nog niet vastgesteld):
- **Doel:** uitsluitend de ontwikkeling van de trainer. De gegevens worden niet gebruikt voor beoordeling (H07.6).
- **Inzage:** de trainer ziet alles over zichzelf, behalve de werkaantekeningen van de begeleider. Of hij die ook mag zien, is een besluit.
- **Correctie:** de trainer past zijn eigen teksten aan. Over observaties van een begeleider kan hij een reactie toevoegen; ze worden niet stilzwijgend gewijzigd.
- **Verwijderen:** op verzoek van de trainer, behalve wat het beleid verplicht (VOG-registratie). Een account verwijderen gaat nu via de beheerder (Besluit 54).
- **Bewaartermijn:** keuzes om te bespreken:
  - a. tot het einde van het seizoen na het laatste begeleidingsmoment;
  - b. zolang de trainer actief is, plus één seizoen;
  - c. alleen de ontwikkelafspraken langer bewaren, met toestemming.
- **Voormalige trainers:**
  - de toegang stopt meteen bij vertrek;
  - de gegevens blijven tot het einde van de bewaartermijn;
  - daarna worden ze verwijderd of geanonimiseerd;
  - bij terugkeer begint de trainer opnieuw, of gaat hij verder met zijn toestemming.
- **Eerst uitzoeken:** heeft Swift een eigen privacybeleid of een privacyfunctionaris? Zo ja, dan sluiten deze afspraken daarop aan, en vult de club het contactadres in bij *Regels → Privacy* in ClubComm.
