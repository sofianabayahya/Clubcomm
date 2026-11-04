# Voorstel (maat L): de begeleider ziet alleen trainers in zijn werkgebied, ook in de database

*Spoor 3 — ClubComm, 4 november 2026. **Alleen een voorstel**: er is niets veranderd aan de database, de rechten, de app of productie. Niets is uitgevoerd of getest tegen de echte database.*

## 1. Aanleiding

Bij de controle van het benchmarkrapport (docs/onderzoek/benchmark-design/README.md op de branch `onderzoek/benchmark-design`) kwam dit punt naar boven: een HJO of TC kan in de database de gegevens van **alle** trainers van de club lezen.

**Correctie op mijn eerste melding.** Er bestaat al een **werkgebied** per HO en TC (Besluit 100). De clubbeheerder kiest bij de rol welke bouwen erbij horen; niets gekozen betekent de hele club. Maar:
- **de app** houdt zich aan het werkgebied (de lijsten, signalen en het traject tonen alleen trainers in je werkgebied);
- **de database** dwingt het werkgebied alleen af bij de **notities** (scope `hoprive`), niet bij de andere gegevens.

Besluit 100 zegt: de TC begeleidt *"alleen trainers in zijn werkgebied"* en *"wat je ziet volgt je werkgebied"*. De database doet dat nu dus niet volledig. Iemand met de rol HO of TC die de gegevens rechtstreeks opvraagt (buiten de schermen om), krijgt ook de trainers van een andere bouw.

## 2. Wat er nu is (gecontroleerd in de code)

| Gegevens | Soort → scope | Wie mag lezen (database, `main`) | Werkgebied afgedwongen? |
|---|---|---|---|
| Kennismaking van de trainer | `trainerKennis` → `trainerzelf` | de trainer, elke HO/TC, de clubbeheerder ¹ | **nee** |
| Eigen reflectie en vragenlijst | `begeleidZelf` → `trainerzelf` | idem | **nee** |
| Dossier en traject | `trainerDossier` → `trainerdossier` | de trainer (lezen), elke HO/TC, de clubbeheerder ¹ | **nee** |
| Begeleidingsmomenten (observatie, gesprek, ontwikkelpunt) | `begeleidMomenten` → `trainerdossier` | idem | **nee** |
| Notities over de trainer | `trainerNotities` → `hoprive` | HO/TC van dezelfde bouw | **ja** (Besluit 100, migratie 025) |
| Eigen verslag van de begeleider | `begelHoVerslag` → `hoprive` | idem | **ja** |
| Activiteiten (datum, tijd, veld) | `act` | elke HO/TC | nee; geen persoonsgegevens over spelers (Besluit 100/026) |
| *Voorstel 032:* trainingen van de trainer | `trainerplan` (nieuw) | elke HO/TC, als de club het aanzet en de trainer een traject heeft | **nee** |

¹ Met migratie 033 (op `main`, **nog niet toegepast in productie**) valt de clubbeheerder zonder begeleidersrol hier af: alleen de trainer zelf en een HO/TC.

**Bronnen in de code:**
- `supabase/migrations/025_technisch_coordinator.sql`: `priv.cc_begeleider()` kijkt alleen of je de rol `hjo` of `tc` hebt; `hoprive` vergelijkt de bouwen.
- `supabase/migrations/033_eigen_reflectie.sql`: de beperkende regel op `trainerzelf` en `trainerdossier`.
- `public/app/opslag.js`: welke soort bij welke scope hoort.
- `public/app/hjo.js`: `CC.werkgebied`, `CC.bouwVan` (de bouw volgt de leeftijd in de teamnaam of -categorie en de bouwen van de club).

**Voorbeeld Swift.** Sofian is HJO bovenbouw (O14–O19). Krijgt Swift een tweede HJO of een TC voor de onderbouw, dan kan die nu in de database de kennismaking, reflecties en begeleidingsmomenten van de bovenbouwtrainers lezen. In de app ziet hij ze niet.

## 3. Drie mogelijke grenzen

| | Grens | Voordeel | Nadeel |
|---|---|---|---|
| **A** | **Werkgebied (bouw), berekend in de database** uit het team van de trainer | Sluit precies aan op Besluit 100 en op wat de app al toont. Klopt altijd, ook na een teamwissel. Geen gegevens om te zetten. HO en TC van dezelfde bouw kunnen elkaar vervangen. | Iets meer rekenwerk per rij (klein bij clubgrootte); de leeftijdsregel van de app moet ook in SQL staan |
| B | Werkgebied, maar de bouw **opgeslagen bij elke rij** (zoals bij de notities) | Eenvoudige regel | Oude rijen hebben geen bouw (omzetten nodig); na een teamwissel klopt het niet meer; de trainer schrijft zijn eigen rijen en zou de bouw kunnen weglaten |
| C | **Per begeleider:** alleen wie het traject heeft gestart (`traject.door`) | Het strengst | Botst met Besluit 100 (HO en TC van dezelfde bouw werken samen; de HO is eindverantwoordelijk, Besluit 98). Een trainer zonder traject is voor niemand zichtbaar. Bij ziekte of wissel van begeleider is alles weg. |

**Advies: A.** Dat is wat Besluit 100 al bedoelde, nu ook in de database. C ("expliciete toewijzing" uit het rapport) zou ik niet doen. Het werkgebied ís de toewijzing, en de club kiest hoe klein het is: een HO kan ook maar één bouw hebben.

## 4. De regel (bij A)

Een HO of TC mag de gegevens van een trainer lezen en schrijven (de schrijfregels van Besluit 143 en migratie 033 blijven gelden) als:
- zijn werkgebied **leeg** is (= de hele club), **of**
- een bouw van zijn werkgebied gelijk is aan een bouw van **een team waar de persoon trainer is**.

**Randgevallen**
- **Trainer van twee teams in twee bouwen:** beide werkgebieden zien hem.
- **Trainer zonder team, of een team zonder leeftijd in de naam:** de bouw is *Overig*, en alleen een begeleider van de hele club ziet hem. Dat is gelijk aan de app.
- **De trainer wisselt van team:** het dossier verhuist mee naar de begeleider van de nieuwe bouw. De oude begeleider ziet het niet meer. *(Interpretatie: past bij "het dossier hoort bij de trainer". Wil je dat de oude begeleider het seizoen kan afmaken, dan kan dat met een extra regel voor `traject.door`. Mijn advies: niet doen, om het eenvoudig te houden.)*
- **De clubbeheerder** past de bouwen aan (Besluit 97): de zichtbaarheid verandert dan direct mee. Dat is bedoeld.
- **Swift:** de standaardbouwen zijn Middenbouw 13–15 en Bovenbouw 16–19. *HJO bovenbouw O14–O19* klopt pas als Swift zijn bouwen zo instelt. Dat moet vóór het invoeren nagekeken worden (alleen lezen).
- **De trainer zelf** blijft altijd zijn eigen gegevens zien.

## 5. De wijziging: migratie 034 (gebouwd als voorstel, alleen lokaal getest)

Het bestand is `supabase/migrations/034_begeleider_werkgebied.sql`. Het is **niet toegepast** in productie.

**Anders dan de eerste schets.** In de schets paste ik `priv.cc_mag` aan. Bij het bouwen bleek een veiligere weg mogelijk, op dezelfde manier als 033: `priv.cc_mag` blijft ongewijzigd en alleen de **beperkende regel** `rij_begeleiding` uit 033 wordt vervangen.
- **Oude voorwaarde:** de persoon zelf of *een* begeleider.
- **Nieuwe voorwaarde:** de persoon zelf of een *begeleider van deze persoon*.

Waarom dit beter is:
- **032 in elke volgorde:** 032 schrijft `priv.cc_mag` helemaal opnieuw. Een aanpassing daarin zou 032 dus overschrijven, of 032 die van 034. Met de beperkende regel kunnen 032 en 034 elkaar niet overschrijven; getest in beide volgordes.
- **`admin` telt niet meer** voor deze gegevens, zonder dat `priv.cc_mag` verandert. Een beperkende regel geldt namelijk bovenop alle andere toegang.
- **De scope `trainerplan` van 032** valt er ook onder, ook als 032 later komt.

**Wat erin staat:**
- `priv.cc_bouwen_van(persoon)`: de bouwen van de teams waar iemand trainer is. Dat zijn de bouwen van de club, of anders de standaard; zonder team is de uitkomst *Overig*.
- `priv.cc_begeleider_van(persoon)`: rol hjo of tc, met een leeg werkgebied of een gedeelde bouw.
- De nieuwe `rij_begeleiding` voor `trainerzelf`, `trainerdossier` en `trainerplan`.
- Uitvoerrecht alleen voor ingelogde gebruikers, niet voor *anon*; dat controleert de vaste test.
- Bovenin de manier om het terug te draaien: terug naar de regel van 033.

**Volgorde:** **na 033**. Draait iemand 033 later nog een keer, dan zet dat de oude regel terug; dat staat ook in het bestand. De volgorde ten opzichte van 032 maakt niet uit.

**Snelheid:** de regel rekent per rij. Bij een club van deze grootte (tientallen trainers) is dat verwaarloosbaar. Bij honderden trainers zou ik het opnieuw meten.

## 6. Privacy (welke gegevens, wie ziet ze, hoe lang)

- **Welke:** gegevens over de trainer (een volwassen vrijwilliger): kennismaking (ervaring, beschikbaarheid, wensen), reflecties, observaties van zijn coachgedrag, het ontwikkelpunt en de afspraken. **Geen** gegevens over spelers.
- **Wie, na de wijziging:** de trainer zelf, en de HO's en TC's van zijn bouw (of van de hele club).
  - Niet meer: begeleiders van een andere bouw.
  - Niet: de clubbeheerder zonder begeleidersrol (met 033).
  - Niet: ouders, teamleiders en coördinatoren (dat was al zo).
- **Hoe lang:** verandert niet met dit voorstel. Er is nog geen vaste bewaartermijn voor trainersdossiers. **Voorstel voor later (apart):** het dossier na afloop van het seizoen plus een jaar archiveren, en verwijderen als iemand geen trainer meer is.

## 7. Wat in de app verandert

- **Bijna niets:** de schermen filteren al op werkgebied. Een begeleider met een klein werkgebied krijgt de andere rijen gewoon niet meer binnen.
- **Na te gaan bij het bouwen:**
  - telt een signaal of teller in de app per ongeluk ook trainers buiten het werkgebied? Dan zou die na de wijziging lager worden;
  - de demo-rechtenfilter op `demo/swift-trainer` volgt dezelfde regel.

## 8. Tests (uitgevoerd op 4-11, alleen lokaal)

**Hoe:** met de bestaande lokale rechtentest (`supabase/tests/rechtentest-lokaal.sh`). Die gebruikt een tijdelijke database op deze computer, zonder netwerk en nooit de echte database.

**Twee nieuwe testbestanden:**
- `supabase/tests/lokaal/begeleider-werkgebied.sql`: 36 controles. Ze dekken de twaalf punten uit het eerste plan en de situaties die in productie voorkomen:
  - de HO met Middenbouw + Bovenbouw, zoals bij Swift;
  - categorie O12 bij *O13 talententeam*, zoals bij DCG;
  - een team zonder categorie (de bouw komt dan uit de teamcode);
  - een HO die ook clubbeheerder is;
  - de clubscheiding;
  - een niet-ingelogde gebruiker.
- `supabase/tests/lokaal/begeleider-werkgebied-032.sql`: 7 controles voor meekijken (`trainerplan`). Draait alleen samen met 032.

**Aangepast:** in de test van 033 (`supabase/tests/lokaal/begeleiding-eigenaarschap.sql`) staat nu één extra rij, het team van de trainer (O14). Zo blijft *HO met bouw (Middenbouw)* ook onder 034 zijn trainer zien. De controles zelf zijn niet veranderd.

| Opbouw | Uitkomst |
|---|---|
| Zonder 034 (zoals productie, met 033) | **13 van 36 fout**: een begeleider buiten zijn werkgebied mag lezen en schrijven. Dit is het lek. |
| Met 034 | alles goed: rechten per rol 37/37, clubscheiding 12/12, vaste regels 82/82, test 033 55/55, app-opslag 10/10, werkgebied 36/36 |
| 032 → 034 | alles goed: rechten per rol 56/56, vaste regels 86/86, werkgebied 36/36, meekijken 7/7 |
| 034 → 032 | alles goed: dezelfde cijfers |
| Alleen 032 (zonder 034) | meekijken 1 van 7 fout: de HO Bovenbouw kijkt mee bij een O10-trainer |

**Opnieuw draaien:**
- `EXTRA_SQL=supabase/tests/lokaal/begeleider-werkgebied.sql npm run test:veilig -- 034`
- met 032: `EXTRA_SQL="supabase/tests/lokaal/begeleider-werkgebied.sql supabase/tests/lokaal/begeleider-werkgebied-032.sql" npm run test:veilig -- 032 034`

**Niet getest:**
- de echte productiedatabase;
- de app tegen een database met 034. De app filtert al zelf op werkgebied; dat is gezien in de code, niet in een proef.

## 9. Volgorde en akkoord

1. ~~Akkoord op richting A~~ ✅ Besluit 154 (4-11, #118).
2. ~~Stand in productie lezen~~ ✅ § 10 (alleen gelezen).
3. ~~034 als voorstel + lokale tests~~ ✅ § 5 en § 8. **Voorstel 032 hoeft niet te worden aangepast:** 034 werkt via de beperkende regel en geldt ook voor `trainerplan`.
4. **Nog te doen, apart akkoord:** 034 toepassen in productie, **na 033** (033 is ook nog niet toegepast). Daarna:
   - `priv.rechtentest()` draaien;
   - in de app nalopen als HO (DCG) en als beide HO's (Swift): ziet ieder nog alle trainers? Volgens § 10 hoort dat zo.

**Extra bevinding (apart, niet in dit voorstel).**
- **Wat:** de rol `hjo` telt in de database als `admin` (`priv.cc_admin()`). Een HJO met werkgebied *Bovenbouw* heeft daardoor voor de **club**gegevens (regels, teams, signalen) nog steeds de rechten van de hele club.
- **Of dat klopt:** voor de HJO als eindverantwoordelijke (Besluit 98) is dat waarschijnlijk bedoeld. Voor een tweede HJO bij één bouw misschien niet.
- **Hoe verder:** eerst bespreken, dan eventueel een eigen voorstel.

**Status:** alleen een voorstel. Er is niets aangepast aan de database, de rechten, de app of productie.

## 10. Stand in productie (4-11, alleen gelezen)

*Gelezen met vijf leesopdrachten op de productiedatabase: geen namen, niets gewijzigd.*

| | DCG | Swift |
|---|---|---|
| Eigen bouwen ingesteld | nee → standaard (Mini's 6–7 · Onderbouw 8–12 · Middenbouw 13–15 · Bovenbouw 16–19) | nee → standaard |
| HO's (rol `hjo`) en werkgebied | 1 · hele club | 2 · één met **Middenbouw + Bovenbouw**, één met de hele club |
| TC's | geen | geen |
| Teams (categorie → bouw) met trainer | O12-1, categorie O12 → Onderbouw (1 trainer) | JO15-1 ZO en JO15-1 ZA, O15 → Middenbouw (elk 1 trainer); JO16-2 ZO, O16 → Bovenbouw (1); JO19-1 ZA, O19 → Bovenbouw (geen trainer) |
| Trainers zonder team of met een onbekend team | 0 | 0 |
| Rijen met trainersgegevens (`trainerzelf`, `trainerdossier`, `hoprive`) | 0 | 15 |

**Wat Besluit 154 hier nu zou veranderen: niets zichtbaar.** Bij DCG heeft de enige HO de hele club. Bij Swift valt elk team met een trainer in Middenbouw of Bovenbouw, dus beide HO's blijven alle trainers zien. De regel gaat pas iets doen als er een team onder de 13 jaar bijkomt, of als iemand een kleiner werkgebied krijgt.

**Om op te letten:**
- **Swift:** *HJO bovenbouw O14–O19* is ingesteld als Middenbouw + Bovenbouw, dus 13–19 jaar. Een O13-team zou daar ook onder vallen. Wil Swift precies O14–O19, dan moet de clubbeheerder eigen bouwen instellen (bijvoorbeeld Middenbouw 14–15). Dat is een keuze van de club, en het verandert niets aan dit voorstel.
- **DCG:** het team heet *O13 talententeam*, maar de categorie is O12. De database rekent daarom met Onderbouw, net als de app. Zolang de HO de hele club heeft, maakt dat niet uit.
