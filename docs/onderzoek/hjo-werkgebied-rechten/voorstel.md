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

## 5. Schets van de wijziging (niet uitgevoerd, niet getest)

Een nieuwe migratie (034, als `.sql.voorstel`). Die komt **na 033**, en past daarna de 032 aan vóór die wordt toegepast.

```sql
-- De bouwen van een persoon: uit de teams waar hij trainer is, met de bouwen van de club (anders de standaard).
create or replace function priv.cc_bouwen_van(p_persoon text) returns text[] language sql stable security definer set search_path = public as $$
  with bw as (
    select coalesce(nullif((select c.data->'bouwen' from public.rij c where c.club_id = priv.cc_club() and c.soort = 'club' and c.id = 'club'), '[]'::jsonb),
      '[{"naam":"Mini''s","van":6,"tot":7},{"naam":"Onderbouw","van":8,"tot":12},{"naam":"Middenbouw","van":13,"tot":15},{"naam":"Bovenbouw","van":16,"tot":19}]'::jsonb) b),
  lft as (
    select coalesce(substring(coalesce(t.data->>'cat', t.id) from '(\d+)')::int, 0) l
    from public.rij p cross join jsonb_array_elements(coalesce(p.data->'rollen','[]'::jsonb)) r
    join public.rij t on t.club_id = p.club_id and t.soort = 'teams' and t.id = r->>'teamId'
    where p.club_id = priv.cc_club() and p.soort = 'people' and p.id = p_persoon and r->>'rol' = 'trainer')
  select coalesce(array_agg(distinct coalesce(
           (select x->>'naam' from bw, jsonb_array_elements(bw.b) x where lft.l between (x->>'van')::int and (x->>'tot')::int limit 1), 'Overig')),
         array['Overig'])
  from lft $$;

-- Ben ik begeleider van deze persoon? (rol hjo of tc, en werkgebied leeg of een gedeelde bouw)
create or replace function priv.cc_begeleider_van(p_persoon text) returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from priv.cc_rollen() r where r->>'rol' in ('hjo','tc')
    and (jsonb_array_length(coalesce(r->'bouwen','[]'::jsonb)) = 0
         or exists (select 1 from unnest(priv.cc_bouwen_van(p_persoon)) b where r->'bouwen' ? b))) $$;
```

**In `priv.cc_mag`:**
- `trainerzelf`: `p_persoon = ik or priv.cc_begeleider_van(p_persoon)`
- `trainerdossier`: `(not p_schrijven and p_persoon = ik) or priv.cc_begeleider_van(p_persoon)`

**Verder:**
- **Beperkende regel van 033:** `priv.cc_begeleider()` vervangen door `priv.cc_begeleider_van(persoon_id)`.
- **In voorstel 032** (scope `trainerplan`) hetzelfde.
- **Rechten op de nieuwe functies:** `revoke all … from public`, zoals bij de andere `priv`-functies.
- **Terugdraaien:** de functies van 033 opnieuw zetten (staat in het bestand van 033).

**De `admin` valt weg** uit deze twee scopes. `admin` betekent nu "rol hjo of beheerder", zodat een HJO met een klein werkgebied via `admin` toch alles zou zien. Met 033 was de clubbeheerder zonder begeleidersrol er al uit.

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

## 8. Testplan (na akkoord, alleen lokaal)

Met de bestaande lokale rechtentest (`supabase/tests/rechtentest-lokaal.sh`, een tijdelijke database, nooit de echte):

| # | Wie | Wat | Verwacht |
|---|---|---|---|
| 1 | HO met werkgebied Bovenbouw | dossier van een O17-trainer lezen | mag |
| 2 | HO met werkgebied Bovenbouw | dossier van een O10-trainer lezen | **mag niet** |
| 3 | TC Onderbouw | begeleidingsmoment van een O17-trainer schrijven | **mag niet** |
| 4 | HO zonder werkgebied | alle dossiers | mag |
| 5 | Trainer van O10 én O17 | zichtbaar voor HO Onderbouw en HO Bovenbouw | mag (beide) |
| 6 | Trainer zonder team | HO Bovenbouw / HO hele club | mag niet / mag |
| 7 | De trainer zelf | eigen kennismaking lezen en schrijven | mag (033 blijft gelden) |
| 8 | HO Bovenbouw | kennismaking van een bovenbouwtrainer *wijzigen* | **mag niet** (033: alleen *gevraagd* zetten) |
| 9 | Clubbeheerder zonder begeleidersrol | dossier lezen | mag niet |
| 10 | HO van club A | dossier van club B | mag niet (clubscheiding) |
| 11 | Clubbeheerder past de bouwen aan | de zichtbaarheid volgt direct | ja |
| 12 | 032 + 033 + 034 | in beide volgordes toepassen; alle bestaande rechtentests blijven groen | ja |

Daarna: de app-tests (`npm test`) en de controle `priv.rechtentest()`.

## 9. Volgorde en akkoord

1. **Jouw akkoord op de richting** (A, zonder de extra regel voor `traject.door`). Dan Besluit 152 (Besluit 100 krijgt *"aangevuld door 152"*).
2. Bouwen als `034_….sql.voorstel` + de tests van § 8, alleen lokaal. Voorstel 032 erop aanpassen.
3. **Apart akkoord** op het toepassen in productie, samen met of na 033. Daarna `priv.rechtentest()` en de app controleren.

**Nog na te gaan, alleen lezen:**
- welke bouwen DCG en Swift in productie hebben;
- of er nu een HO of TC met een werkgebied is.

Als iedereen de hele club heeft, verandert er voor de pilot nu niets zichtbaar, maar het is wel goed geregeld vóór er een tweede begeleider komt.

**Extra bevinding (apart, niet in dit voorstel).**
- **Wat:** de rol `hjo` telt in de database als `admin` (`priv.cc_admin()`). Een HJO met werkgebied *Bovenbouw* heeft daardoor voor de **club**gegevens (regels, teams, signalen) nog steeds de rechten van de hele club.
- **Of dat klopt:** voor de HJO als eindverantwoordelijke (Besluit 98) is dat waarschijnlijk bedoeld. Voor een tweede HJO bij één bouw misschien niet.
- **Hoe verder:** eerst bespreken, dan eventueel een eigen voorstel.

**Status:** alleen een voorstel. Er is niets aangepast aan de database, de rechten, de app of productie.
