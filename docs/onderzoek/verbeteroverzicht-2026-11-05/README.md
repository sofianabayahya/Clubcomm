# Verbeteroverzicht ClubComm (Spoor 3, 05-11-2026)

*Alleen analyse. Er is niets gebouwd, samengevoegd, gemigreerd of in productie aangepast. De database is alleen gelezen.*

## Hoe dit is gecontroleerd

De overdracht is **niet** als enige bron gebruikt. Gecontroleerd is:

| Bron | Stand |
|---|---|
| `main` | `c830b72` (#131). 9 node-tests en 129 browsertests. |
| Productie | Vercel draait `c830b72`. |
| Uitgevoerde migraties (Supabase-logboek) | 001–026, 031, **033, 032, 032b en 034 (alle op 04-11)**. 027–030 staan niet in het logboek; ze zijn via losse SQL toegepast (bekend sinds 29-10). |
| Productiegegevens (alleen gelezen, aantallen) | **DCG:** 24 trainingen, waarvan 4 gegeven. De training van 03-11 heeft een vastlegging (`vastOp`). Verder 23 vormen, profiel v4 en 8 weekplannen. **Swift:** 4 trainingen (1 gegeven), 7 vormen en 1 feedback van de begeleider (Besluit 159). |
| Open pull requests | Alleen **#132**: tekentool, tikvlak van 44 px (andere sessie). |
| Onderzoeksbranches | 26 branches, elk vergeleken met de besluiten op `main`. |

**Fout gevonden in de overdracht:** onder *Wacht op akkoord* staat nog *"033 toepassen in productie"*. Die migratie is op 04-11 al toegepast; dat staat ook in de regel *Stand* erboven. Dat moet bij de volgende overdracht weg.

**Maatstaf (jouw prioriteit):**
- **B** = een beginnende trainer bereidt zelfstandig een goede training voor;
- **E** = een ervaren trainer werkt efficiënt volgens zijn eigen opleidingsmethodiek.

---

## De route Training → Plannen → Vormenbank → Week → Lijn

| Stap | Beginner zonder clubprofiel (zoals Swift) | Ervaren trainer met profiel (DCG) |
|---|---|---|
| **Plannen** | ✅ *Hoe wil je beginnen?*: een eerdere training gebruiken of zelf samenstellen (150). Tijdsbalk (142). | ✅ Sjabloon, trainingskaart met herkomst (144), weekvoorstel, plek kiezen. |
| **Vormenbank** | ◐ Een lege bank is netjes uitgelegd (150), maar er is **niets om uit te kiezen**: geen startaanbod en geen voorbeeldtrainingen. **Dit is het grootste gat voor B.** | ✅ Eén kiezer met gereedschap en redenen (139), verplaatsen (145). |
| **Week** | ◐ Evalueren werkt, maar zonder profiel staan *Toepassing · Probleem · Gedrag · Weerstand* open: vaktaal zonder uitleg. | ✅ Korte evaluatie met 4 vragen uit het profiel (155). Gereedschap vastleggen bij *gegeven* (147; in productie gebruikt op 03-11). |
| **Lijn** | ◐ Leeg, met teksten als *"Nog leeg"* (er ligt al een goedgekeurd ontwerp voor een lege toestand). | ◐ Werkt, maar de **8 weekplannen bevatten nog dagwaarden van één training**. Het correctiescript ligt klaar (punt 3.1). Teamtaak en trainingsaccent ontbreken nog (T6/T7). |
| **Tweede trainer bij dezelfde club** | n.v.t. | ✖ Ziet de methodiek niet: alleen beheerder, HJO en coördinator lezen het profiel (T2). |

**Conclusie:**
- Voor **E** is de route bij DCG compleet en in gebruik. Wat er nog ontbreekt, is inhoud (teamtaak, accent) en de juistheid van de weekplannen.
- Voor **B** werkt de bediening, maar hij heeft nog **geen inhoud om mee te beginnen**. Een beginner kan nu geen leerweek voorbereiden zonder zelf vormen te maken. Dat stond ook al als *erkende beperking* in oplevering 2.

---

## 1. Afgerond en aantoonbaar werkend

*In productie, getest, en in echt gebruik gezien (of technisch bewezen met de rechtentest).*

| Onderdeel | Besluit / PR | Bewijs |
|---|---|---|
| Training: Lijn · Plannen · Week · Vormenbank | 141 | 4 gegeven DCG-trainingen |
| Tijdsbalk (veldtijd − organisatie = oefentijd) | 142 | in gebruik bij DCG |
| Trainingskaart met herkomst | 144 | in gebruik bij DCG |
| Gereedschap vastleggen bij een gegeven training | 147 | de training van 03-11 is echt vastgelegd |
| Trainer eigenaar van eigen tekst (033), werkgebied in de database (034), meekijken (032 + 159) | 143, 154, 159 | rechtentest 56/56; Swift heeft al 1 feedback van de begeleider |
| Werkproces: `Besluit NNN`, `npm run check`, Vercel alleen `main` | #125, #128, #130, #131 | gebruikt in #132; geen voorbeeldversies meer |

## 2. Gebouwd, maar nog te toetsen in de praktijk

*Online en getest, maar nog niet door echte trainers of begeleiders gebruikt.*

| Onderdeel | Besluit / PR | Wat te toetsen | Hoe |
|---|---|---|---|
| Eerste keuzes bij een lege training, lege kiezer, meldingen | 150 (online 04-11 23:27) | Kiest een beginner zonder hulp de juiste route? | praktijktoets: 1 oudertrainer bij Swift |
| Korte evaluatie (4 vragen) en de labels *Loskomen* en *Afremmen* | 155 | Zijn 4 vragen genoeg? Mist de trainer *Weerstand*? | praktijktoets week 46 (oplevering 3) |
| Vorm verplaatsen | 145 | Gebruikt de trainer het? | praktijktoets week 46 (opdracht: één vorm verplaatsen) |
| Week van de begeleider op Home | 146 | Plant de HO in 2 tikken? | jij als HO bij Swift |
| Tekentool: nummers, menu's, veldlijnen, paneel, gekanteld, Kopie en Weg | 148, 152, 153, 156–158 | Werkt het op de telefoon langs het veld? | gebruik tijdens een training |
| Tekentool: tikvlak van 44 px | **#132 (open, andere sessie)** | — | wacht op jouw akkoord om samen te voegen |

## 3. Inhoudelijk goedgekeurd, maar nog niet gebouwd

| # | Voorstel | Status | Waarde | Risico | Omvang | Afhankelijk van |
|---|---|---|---|---|---|---|
| 3.1 | **Correctie van de 8 DCG-weekplannen** (`supabase/scripts/2026-10-30_dcg_weekplannen_correctie.sql.voorstel`) | Script klaar en gecontroleerd tegen de CSV. **Vandaag gecontroleerd: alle 8 weekplannen zijn nog precies zoals bij de controle** (stempels gelijk, laatst gewijzigd 29-10). Het script werkt dus nog. | **E**: de gegevens kloppen weer met de huidige import. Zichtbaar: de *wedstrijdsituatie* in week 44–49, en de informatieregel bij do 29-10. *(Gecorrigeerd 05-11: de trainingskaart negeert de dagvelden al sinds Besluit 144; zie `1-weekplannen-vergelijking.md`.)* | Laag tot middel: het verandert gegevens, maar alles-of-niets en met een stempelcontrole. Trainingen worden niet aangeraakt. | S (script) | alleen jouw akkoord (maat L: database) |
| 3.2 | **Lijn zonder profiel: rustige lege toestand** (bijlage A van de UX-audit) | Akkoord *als ontwerp*. Er is nog geen besluit. | **B**: geen *"Nog leeg"* × 7 en geen schijn van achterstand. | Laag (alleen scherm) | S–M | besluit (`NNN`); voorbeeld bestaat al |
| 3.3 | **Vorige-afspraaklus en reflectie direct na de training** (begeleidingsproces, voorstel 1) | Besluiten van 04-11 genomen; technisch voorstel klaar. De voorwaarde (033) is **nu vervuld**. | HJO en trainer: de afspraak komt terug; reflecteren in de goede volgorde (KNVB-cyclus). | Laag: nieuwe velden in bestaande rijen, geen nieuw recht | M | besluit; voorbeeld op 390 px |
| 3.4 | **Inrichten: startlijst voor de clubbeheerder op de laptop** (*Klaar voor gebruik?*) | Besluit 120 geldt, maar is niet gebouwd. Het voorbeeld (`docs/onderzoek/inrichten/`) is niet goedgekeurd als scherm. | Een tweede club kan zichzelf inrichten. | Laag | M | voorbeeld akkoord; samen met 4.7 (Rollen) |

## 4. Nog te onderzoeken of inhoudelijk te beslissen

| # | Voorstel | Wat er nog moet gebeuren | Waarde | Risico | Omvang | Afhankelijk van |
|---|---|---|---|---|---|---|
| 4.1 | **Startaanbod voor een nieuwe club** (een paar eigen ClubComm-vormen en voorbeeldtrainingen) | Inhoud maken (eigen woorden, geen Rinus- of DCG-kopieën). Kiezen: meeleveren als bestand (zoals het KNVB-profiel), dus zonder rechtenwijziging, óf als clubbibliotheek in de database (L). | **B: het grootste gat.** Zonder dit kan een beginner niet zelfstandig starten. | Laag als bestand; middel als bibliotheek | M (bestand) of L | inhoud Spoor 3 (algemeen); past bij 4.2 |
| 4.2 | **KNVB-basisprofiel** (oplevering 2) | Opt-in en de ClubComm-startset zijn akkoord (04-11). Nog open: (a) de bron van de teamtaken (KNVB-sheet: titel, datum, versie); (b) `www.knvb.nl` toestaan in de netwerkinstellingen om te controleren; (c) een bouwvoorstel om het profiel te laden: `opslag.js`, evaluatie als objecten, het weekthema met teamtaak. | **B** krijgt structuur (teamtaak, 6 handelingen, sjabloon, 4 vragen) via dezelfde schermen als DCG. Geen nieuwe schermen. | Middel: verandert wat een club ziet, maar alleen als de club ervoor kiest | inhoud S/M, laden M | jouw bron; netwerktoegang; kiezen per club (Swift: Spoor 2) |
| 4.3 | **T2: opleidingsprofiel leesbaar voor trainers** (`onderzoek/profiel-leesrechten`, 29-10) | Het voorstel is klaar (twee smalle scopes, `profiel` en `profielconcept`). Er is nog geen akkoord en er is nog niet lokaal getest. Na 034 moet het voorstel opnieuw tegen `priv.cc_mag` worden gelegd, omdat `cc_begeleider` en de werkgebieden zijn veranderd. | **E** voor elke tweede trainer bij een club met eigen methodiek. | Middel (rechten, L), maar zonder persoonsgegevens | L | jouw akkoord; nodig vóór een tweede DCG-trainer. **Niet nodig voor het KNVB-profiel als dat een meegeleverd bestand is.** |
| 4.4 | **T6/T7: teamtaken en trainingsaccent per plek** | Inhoudelijk eerst Spoor 1: begrippenlijst v2.1 vaststellen, plus de open vragen in de accentenmatrix (`spoor1/accenten`, 29-10). Daarna T6 (profielvelden, geen migratie) en T7 (`accent` per plek, ook bij verplaatsen en vastleggen). *Afgewezen ideeën* gecontroleerd: het accent wordt **niet** afgeleid uit de vormen (Besluit 144). | **E**: precies werken volgens de eigen methodiek. Het KNVB-profiel (4.2) gebruikt dezelfde teamtaak. | Laag (optionele velden) | M + M | Spoor 1; voorbeeld op 390 px; samen ontwerpen met 4.2 zodat de teamtaak één veld is |
| 4.5 | **Praktijktoets week 46** (oplevering 3) | Uitvoeren: 4 korte vragen, één vorm verplaatsen, observatiepunten zaterdag. | Bewijs voor categorie 2 | geen | — | jij als trainer (9–15 nov) |
| 4.6 | **Vaktaal zonder profiel** (*Weerstand, Spacing, Toepassing*) | Nalopen welke woorden een club zonder profiel ziet, en ze vervangen door gewone woorden of één zin uitleg (UX-audit #8, regel 5 van Besluit 149). | **B** | Laag | S | samen met 3.2 |
| 4.7 | **Rollen, Regels en Inzicht overzichtelijk** (*Layout naar een 9*) | Er is nog geen voorbeeld. Rollen heeft 138 bedieningselementen, waarvan 73 kleiner dan 44 px. | Clubbeheerder (vooral op de laptop) | Laag | M | voorbeeld; samen met 3.4 |
| 4.8 | **Toegankelijkheid**: leestekst 16 px (146 CSS-regels van 12–14 px, deels bijschrift), contrast `.chip.rood` 4,17 : 1 | Per element nalopen welke tekst echte leestekst is. | iedereen | Laag | M | geen |
| 4.9 | **Scherm *Opleidingsprofiel* voor de HO** | Het voorbeeld is gemaakt, maar niet goedgekeurd. **Voorkom dubbel werk:** maak één leesweergave voor de trainer (na T2), met *bewerken* voor HO en beheerder. Geen twee schermen. | **E** en HJO | Laag | M | T2 (4.3) |
| 4.10 | **Lege nieuwe oefenvorm opruimen** | Genoemd in Besluit 150, er is nog geen voorstel. | **B** (geen lege vormen in de bank) | Laag | S | geen |
| 4.11 | **Veiligheid**: uitvoerrecht van drie `priv`-functies intrekken; 027–030 in het migratielogboek | Bevinding uit de rechtentest; nog geen voorstel. | betrouwbaarheid | Laag | S (L-controle) | akkoord |
| 4.12 | **Swift: trainingsschema laden vanaf O14** | Excel plakken werkt; met PDF maar deels. | Swift (HJO bovenbouw) | Laag | — (gebruik, geen bouw) | jij of de clubbeheerder van Swift |

## 5. Verouderde voorstellen die inmiddels zijn ingehaald

| Voorstel of tekst | Ingehaald door | Wat ermee te doen |
|---|---|---|
| Overdracht: *"033 toepassen"* onder *Wacht op akkoord* | 033 toegepast op 04-11 | bij de volgende overdracht weghalen |
| UX-audit P0 #1 (033) en #2 (werkgebied; *"032 niet toepassen"*) | 033 en 034 toegepast; 032 toegepast met Besluit 159 (meekijken per club, standaard uit) | afgedaan |
| UX-audit #3 (tekentool-nummers), #4 (vastleggen), #5 (startkeuze), #6 (week van de begeleider) | 148, 147, 150, 146 | afgedaan |
| Begeleidingsproces voorstel 2 (*delen per training, vervangt 032*) | grotendeels Besluit 159 (meekijken met `trainerplan`, feedback per training) | **controleren:** is *alleen wat de trainer expliciet deelt* nog een wens, of is meekijken per club genoeg? |
| `onderzoek/verplaatsen`, `onderzoek/tijdsplanning`, `onderzoek/stap3-labels`, `onderzoek/trainingsmodule-herontwerp`, `onderzoek/trainingsweergave`, `onderzoek/ho-ziet-training` | 145, 142, 155, 141, 144 (+ het correctiescript, 3.1), 159 | branches kunnen weg (eerst jouw akkoord) |
| Tekentool-onderzoeken (prioriteit-1, menu-sluiten, veldlijnen, spelers-mobiel, gekanteld, balk-paneel, gebruik) | 148, 152, 153, 156, 157, 158; tikvlak → #132 | branches kunnen weg na #132 |
| T1, T3, T4 en T5 uit *technische punten* | 147 en 155 | afgedaan |
| `onderzoek/vaardigheidsaccent` (29-10) | deels door begrippenlijst v2.1 (*accent* is een keuze per plek) | bewaren als bron voor T7, niet meer als voorstel |
| Benchmark-advies 6 (*overal "oefenvorm"*) | 150 | afgedaan |
| Openstaand: *"(3) kleine bouwstap T3/T4/T5"* en *"fase 1: training voorbereiden met kopie van vorige week"* | 155 en 150 (*Eerdere training gebruiken*) | Openstaand bijwerken |
| Branches `claude/serene-cerf-7qbgjb` en `claude/verouderde-teksten` (van vóór 19-10) | alle inhoud staat al in `main` (#130) | kunnen weg |
| Branches `bouw/trainingsmodule-stap1`, `bouw/tijdsbalk`, `claude/intelligent-cannon-t4430r` | hebben alleen nog een losse overdrachtcommit | kunnen weg |

---

## Advies: volgorde

Dit volgt jouw prioriteit, en eerst wat al klaarligt.

| Volgorde | Wat | Waarom nu | Maat |
|---|---|---|---|
| 1 | **3.1 Correctie weekplannen uitvoeren** | Ligt klaar en is vandaag gecontroleerd. Klein zichtbaar effect (wedstrijdsituatie), maar daarna zijn de gegevens schoon voordat er nieuwe functies op bouwen. | L (script, akkoord) |
| 2 | **4.5 Praktijktoets week 46** | Dan heeft categorie 2 echt bewijs, voordat we meer bouwen. | — |
| 3 | **3.2 + 4.6 Lijn en vaktaal zonder profiel** | Snelle winst voor **B**, met een goedgekeurd ontwerp. Geen nieuw scherm. | S–M, 1 besluit |
| 4 | **4.1 + 4.2 Startaanbod en KNVB-basisprofiel, als één bouwvoorstel** | Het grootste gat voor **B**. Allebei als meegeleverd bestand en opt-in, dus zonder nieuwe rechten en met dezelfde schermen als DCG. | M (bouwvoorstel eerst) |
| 5 | **4.4 T6/T7 teamtaak en accent** | **E**, zodra Spoor 1 de begrippen vaststelt. De teamtaak meteen samen met 4.2 ontwerpen: één veld voor beide profielen. | M + M |
| 6 | **4.3 T2 + 4.9 één profielweergave** | Nodig vóór er een tweede trainer met een eigen methodiek komt. Eerst opnieuw toetsen tegen de rechten na 034. | L + M |
| 7 | **3.3 Vorige-afspraaklus** | HJO en trainer; de voorwaarde (033) is nu vervuld. | M |
| 8 | **3.4 + 4.7 Inrichten en Rollen**, daarna **4.8** | Vóór een tweede club; vooral laptop. | M |

**Geen nieuwe schermen nodig voor 1 t/m 5.** Alles gebeurt in de bestaande schermen Plannen, Vormenbank, Week en Lijn, of in het profielbestand.

## Wat ik van je nodig heb

1. **Akkoord op de volgorde**, of een andere keuze.
2. Voor punt 1: akkoord om het correctiescript van de weekplannen uit te voeren. Dat is een aparte stap: ik laat je eerst per week zien wat er verandert.
3. Voor punt 4: de KNVB-sheet (titel, datum, versie), en of je `www.knvb.nl` wilt toestaan in de netwerkinstellingen.
4. Mogen de verouderde branches uit §5 weg? Dat is opruimen; het verandert niets aan de app.
