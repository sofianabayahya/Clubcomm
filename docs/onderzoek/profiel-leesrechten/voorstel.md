# Voorstel Spoor 3 — Opleidingsprofiel lezen door trainers (29-10-2026)

*Voorstel, nog geen besluit. **Geen database- of rechtenwijziging uitgevoerd.** Alles hieronder is gecontroleerd tegen de echte regels in de database (alleen lezen).*

## 1. Wat de initiatiefnemer wil
1. Trainers kunnen het **gepubliceerde** opleidingsprofiel van **hun eigen club** lezen.
2. Trainers kunnen het profiel **niet** aanpassen.
3. Bevoegde HJO's, TC's en clubbeheerders kunnen wijzigingen **voorstellen of doorvoeren**, elk volgens hun rol.
4. Ouders en spelers krijgen **geen** toegang.
5. Een gebruiker van club A ziet **niets** van club B.
6. **Conceptonderdelen** zijn niet vanzelf zichtbaar voor alle trainers.

## 2. Hoe het nu werkt (gecontroleerd 29-10)
- Een profiel is een rij in `public.rij` met `soort = 'profiel'`, die van DCG met scope **`hjo`**.
- **Lezen** mag als `club_id = priv.cc_club()` (eigen club) **en** `priv.cc_mag(...)` ja zegt.
- `cc_mag` bij scope `hjo` geeft: `admin or coord`.
  - `cc_admin()` betekent rol *hjo* of *beheerder*.
  - `cc_coord()` betekent rol *coordinator*.
- **Gevolg:**
  - een trainer of teamleider leest het profiel **niet**;
  - een TC (rol `tc`) leest het **ook niet**.
- De app zet onderdelen met status *controleren* of *leeg* uit het zicht (`zichtbaar()` in `training.js`). Dat is **geen beveiliging**: wie de rij mag lezen, krijgt de hele rij.

## 3. Kan het met de bestaande scopes?
| Scope | Wie leest | Geschikt? |
|---|---|---|
| `club` | iedereen in de club, ook ouders | **Nee** (eis 4) |
| `hjo` | beheerder, HJO, coördinator | **Nee**: trainers en TC lezen niet (eis 1 en 3) |
| `teamstaf` | staf van één team (`team_id`) | **Nee**: een profiel geldt voor de hele club. Het zou per team gekopieerd moeten worden, en dan bestaat dezelfde inhoud dubbel. |
| `trainerzelf`, `hoprive` | de trainer zelf, of HO/TC | **Nee**: te smal, en voor iets anders bedoeld |
| `contact` | personen die staf zijn | **Nee**: gaat over persoonsgegevens, niet over clubinhoud |

**Conclusie:** met de bestaande scopes kan het niet zonder dubbele gegevens of zonder ouders toe te laten. Er is een **kleine, smalle** uitbreiding nodig, en geen brede scope `staf`.

## 4. Voorstel: twee smalle scopes, alleen voor profielen
| | **Gepubliceerd** (`profiel`) | **Werkversie / concept** (`profielconcept`) |
|---|---|---|
| Inhoud | De vastgestelde versie, die de app gebruikt | Wat nog in bewerking is |
| Rij-id | `dcg` (zoals nu) | `dcg-concept` |
| Lezen | iedereen met een staffunctie in de **eigen** club (`cardinality(staf) > 0`), beheerder, HJO, coördinator, TC (`cc_begeleider`) | beheerder, HJO, coördinator, TC |
| Schrijven | **alleen beheerder en HJO** (`cc_admin`): *publiceren* | beheerder, HJO en TC: *voorstellen* |
| Ouders en spelers | nee | nee |

**Aanvullende regels:**
- **Alleen profielen:** een databaseregel (trigger) staat `soort = 'profiel'` alleen toe met scope `profiel` of `profielconcept`. Daarmee sluiten we het gat dat een trainer nu een eigen profielrij kan aanmaken (scope `eigen`).
- **Publiceren** = de werkversie overzetten naar de gepubliceerde rij, met versienummer en controlesom (zoals bij v3). Eerst als script; later eventueel een knop voor de HJO (apart besluit).
- **Clubscheiding** blijft zoals hij is. De leesregel begint met `club_id = priv.cc_club()`, en dat verandert niet.
- **De app** gebruikt alleen de gepubliceerde rij (`S.profielen[club.id]`). Een conceptrij wordt nooit vanzelf de werkende methodiek.

**Wijziging in `priv.cc_mag`** (schets, niet uitgevoerd):
```sql
when 'profiel' then
  return (not p_schrijven and (cardinality(staf) > 0 or admin or coord or priv.cc_begeleider()))
      or (p_schrijven and admin);
when 'profielconcept' then
  return admin or coord or priv.cc_begeleider();
```
**Trigger (schets):**
```sql
if new.soort = 'profiel' and new.scope not in ('profiel','profielconcept') then
  raise exception 'Een opleidingsprofiel heeft scope profiel of profielconcept';
end if;
```

## 5. Rechtenmatrix
**Legenda:**
- **L** = lezen
- **S** = schrijven (wijzigen, toevoegen of verwijderen)
- — = niets

| Wie (club A) | Gepubliceerd profiel A | Concept A | Profiel of concept van club B |
|---|---|---|---|
| Clubbeheerder | L S | L S | — |
| HJO (rol `hjo`) | L S | L S | — |
| TC (rol `tc`) | L | L S | — |
| Coördinator | L | L | — |
| Trainer (eigen team) | **L** | — | — |
| Teamleider (eigen team) | **L** | — | — |
| Ouder | — | — | — |
| Speler (account van een kind) | — | — | — |
| Niet ingelogd | — | — | — |

*Open vraag (Spoor 3):* moet een **teamleider** het profiel lezen? Een teamleider is staf, maar regelt vooral de organisatie. Advies: ja, alleen lezen; het is geen persoonsgegeven. De initiatiefnemer beslist.

## 6. Volledige rechtentest (vóór elke publicatie)
Uitbreiding van `priv.rechtentest()` (echte database, alles wordt teruggedraaid) en van de lokale test met twee clubs uit PR #99.

**Lezen**
1. Trainer A leest gepubliceerd A: **ja**.
2. Teamleider A leest gepubliceerd A: **ja**.
3. TC A leest gepubliceerd A: **ja**.
4. Coördinator A leest gepubliceerd A: **ja**.
5. Ouder A leest gepubliceerd A: **nee**.
6. Ouder A leest concept A: **nee**.
7. Trainer A leest concept A: **nee**.
8. TC A leest concept A: **ja**.
9. Niet ingelogd leest gepubliceerd A: **nee**.
10. Trainer A leest gepubliceerd B: **nee**.
11. Beheerder A leest gepubliceerd B: **nee**.
12. Beheerder A leest concept B: **nee**.

**Schrijven**
13. Trainer A wijzigt gepubliceerd A: **nee**.
14. Trainer A verwijdert gepubliceerd A: **nee**.
15. TC A wijzigt gepubliceerd A: **nee**.
16. TC A wijzigt concept A: **ja**.
17. HJO A wijzigt gepubliceerd A: **ja**.
18. Coördinator A wijzigt concept A: **nee**.
19. Beheerder A wijzigt gepubliceerd B: **nee**.

**Omzeilen**
20. Trainer A maakt een rij `soort profiel` met scope `eigen`: **nee** (trigger).
21. Trainer A maakt een rij `soort profiel` met scope `profiel`: **nee**.
22. Trainer A zet een bestaande profielrij om naar scope `eigen`: **nee**.
23. Trainer A maakt een profielrij met `club_id` B: **nee**.
24. Ouder A maakt een rij met scope `profielconcept`: **nee**.

**Bestaand blijft gelijk**
25. Alle huidige 37 controles blijven groen.
26. De 12 clubscheidingscontroles blijven groen.
27. De 76 vaste regels blijven groen (PR #99).

## 7. Gevolgen en stappen (na akkoord, maat L)
1. **Migratie:** twee takken in `cc_mag` en de trigger. Bestand in `supabase/migrations/` en toepassen met `apply_migration`.
2. **Data:**
   - het DCG-profiel van scope `hjo` naar `profiel`;
   - nog geen conceptrij (die komt pas als er iets in bewerking is).

   Swift heeft geen profiel en verandert dus niet.
3. **App:** `opslag.js` zet de juiste scope bij een profielrij. De app schrijft profielen nu nooit, dus er verandert bijna niets. Een conceptrij wordt niet als werkende methodiek geladen.
4. **Tests:** de 24 controles hierboven, eerst lokaal (PR #99), dan in de echte rechtentest.
5. **Terugdraaien:** de migratie heeft een terugweg (de oude takken, scope terug naar `hjo`).
6. **Privacy:** het profiel bevat geen persoonsgegevens. Het register van verwerkingen hoeft niet te veranderen.

## 8. Wat de initiatiefnemer nog beslist
1. Mag een teamleider het gepubliceerde profiel lezen?
2. Mag de TC concepten schrijven, of alleen lezen en commentaar geven?
3. Wie publiceert: alleen de HJO en de clubbeheerder? Dat is het voorstel.
