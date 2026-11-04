# Technisch voorstel 2 — Rechten: delen per training, vastgelegde versie, werkgebied (maat L)

*4-11-2026. Spoor 3. **Rechtenvoorstel, niet gebouwd, niets toegepast.** Vervangt voorstel 032 (`supabase/migrations/032_begeleider_kijkt_mee.sql.voorstel`). Komt later als migratie **034** (voorstel), lokaal getest zoals 033, en pas na akkoord in productie.*

## Uitgangspunten (besluiten 4-11)
1. De trainer is eigenaar van zijn voorbereidingen en oefenvormen; die blijven **privé**.
2. De trainer deelt **expliciet één training** (ook zonder observatie) en kan vrijwillig delen intrekken.
3. De begeleider **leest** een gedeelde training en geeft **feedback**, maar wijzigt de voorbereiding **nooit**.
4. Bij een observatie hoort een **vastgelegde versie** die bij het verslag blijft zolang er een grondslag en bewaartermijn is (optie A).
5. Bevoegdheid via **expliciete toewijzing** begeleider ↔ trainer of team, **in de database** afgedwongen; niet alleen de bouw.
6. **Geen automatische inzage** voor een clubbeheerder zonder begeleidersrol. Clubscheiding blijft.

## Wat er nu niet klopt (productie, migraties t/m 031)
| Bevinding | Gevolg |
|---|---|
| `priv.cc_begeleider()` = elke HO of TC in de club | elke begeleider leest alle dossiers, reflecties en het hele rooster |
| `cc_admin` (HO **of** clubbeheerder) leest en schrijft `trainerdossier`/`trainerzelf` | clubbeheerder zonder begeleidersrol ziet dossiers (033 herstelt dit deels) |
| 032 `trainerplan` | alle trainingen van een trainer met traject zichtbaar; botst met `cc_bewaak` (*Scope wijzigen mag niet*) |
| Werkgebied (bouwen) alleen bij `hoprive` | TC met beperkt werkgebied ziet in de database toch alles |

## Ontwerp
### A. Toewijzing (nieuw)
Soort `begeleidingToewijzing`, één rij per toewijzing:
```
{ id, begeleiderId, trainerId | null, teamId | null, rol: 'hjo' | 'tc', van: 'YYYY-MM-DD', tot: null | 'YYYY-MM-DD', door, op }
```
- **Trainer of team:** toewijzing aan een trainer volgt hem over teams; aan een team geldt voor de trainers van dat team. Een trainer met meerdere teams kan meerdere begeleiders hebben.
- **Beheer:** alleen de clubbeheerder of een HO met de taak *toewijzen* maakt en beëindigt toewijzingen. Wijzigen = `tot` invullen + nieuwe rij (historie blijft).
- **Werkgebied als hulp, niet als grens:** de bouwen blijven een filter en een snelle manier om toewijzingen aan te maken (*alle teams van de bovenbouw*), maar de **database** kijkt naar de toewijzingsrijen.
- Nieuwe functie: `priv.cc_begeleidt(p_trainer text) returns boolean` = er is een lopende toewijzing van mij voor deze trainer, direct of via een team waarin hij trainer is.

### B. Afgeronde dossiers en wisselingen
| Situatie | Voorstel (beleidsvraag, niet automatisch gekozen) |
|---|---|
| Begeleider wisselt | de **nieuwe** begeleider ziet het lopende traject en de open afspraak; oudere afgeronde verslagen alleen als de club dat aanzet (**keuze**) |
| Vorige begeleider | leest de momenten die **hij zelf** heeft gemaakt (`door = ik`) tot het einde van de bewaartermijn; geen nieuwe gegevens meer |
| Trainer wisselt van team | toewijzing aan de **trainer** blijft; toewijzing via het **team** stopt |

### C. Delen per training
Soort `gedeeldeTraining`, id = id van de training (één actuele gedeelde versie per training):
```
{ planId, actId, trainerId, versie: n, gedeeldOp, doel: 'vrij' | 'observatie', momentId | null,
  inhoud: { probleem, teamfunctie, teamtaak, doel, onderdelen: [...], vormen: [{ naam, organisatie, coach, tekening, ... }] } }
```
- Nieuwe scope **`gedeeld`**: schrijven en verwijderen = alleen `persoon_id = ik` (de trainer); lezen = de trainer **of** `priv.cc_begeleidt(persoon_id)`.
- **Kopie, geen verwijzing:** de vormen gaan als inhoud mee. De vormenbank (`eigen`) en de training zelf (`eigen`) veranderen niet van scope → **geen botsing met `cc_bewaak`** (het gat uit 032).
- **Opnieuw delen** = dezelfde rij overschrijven met `versie + 1`. **Intrekken** = de rij verwijderen.
- **Feedback** van de begeleider komt **niet** in deze rij: voorfeedback in het begeleidingsmoment (bestaat), of bij vrijwillig delen in een eigen rij `trainingFeedback` (scope `trainerdossier`: begeleider schrijft, trainer leest), gekoppeld aan `planId` + `versie`.

### D. Vastgelegde versie bij een observatie
Soort `vastgelegdeTraining`, id = id van het begeleidingsmoment:
```
{ momentId, trainerId, planId, versie, vastgelegdOp, door, inhoud: { …kopie van de gedeelde versie… } }
```
- Aangemaakt door de begeleider **op het moment dat de observatie begint** (of bij *verslag delen*), als kopie van de gedeelde versie die bij dit moment hoort.
- **Onveranderlijk:** een trigger weigert elke `UPDATE`. Lezen: de trainer en de begeleiders met toewijzing (of `door = ik`, zie B). Verwijderen: alleen via de bewaar- of verwijderroutine (E).
- Intrekken van de gedeelde versie raakt deze kopie **niet** (optie A). De trainer ziet dit **vóór het delen**: *"Bij een observatie bewaren we een kopie bij het verslag, zolang dat volgens de afspraken van de club mag."*

### E. Koppeling, bewaartermijn, verwijderverzoek, vertrek
- **Expliciete koppeling:** het moment krijgt `training: { planId, gedeeldeVersie }`. Die wordt **alleen** gevuld door een bewuste handeling: de trainer deelt *voor dit bezoek*, of de begeleider kiest uit de gedeelde trainingen van **deze trainer** voor **deze activiteit**. Er zijn meerdere trainers of voorbereidingen bij één activiteit mogelijk, dus ClubComm kiest nooit zelf.
- **Bewaartermijn:** nog **niet vastgesteld** (privacybeleid Swift). Technisch: een geplande taak verwijdert vastgelegde versies en verslagen ouder dan *N* na het einde van het traject; *N* is een clubinstelling zonder standaardwaarde.
- **Verwijderverzoek van de trainer:** een serverfunctie (security definer, gelogd) die de clubbeheerder start **zonder de inhoud te kunnen lezen**: verwijdert de gedeelde en vastgelegde versies, `begeleidZelf` en desgewenst de verslagen. Of iets moet blijven (grondslag), is een beslissing voor de club, niet voor de software.
- **Vertrek van een trainer:** toewijzingen krijgen een einddatum; gedeelde versies worden verwijderd; vastgelegde versies en verslagen volgen de bewaartermijn.

### F. Aanpassingen aan bestaande regels
| Regel | Nu | Voorstel |
|---|---|---|
| `team`-scope (rooster) leesrecht begeleider | `cc_begeleider()` (hele club) | `cc_begeleidt_team(team_id)` (toegewezen teams) |
| `trainerdossier` / `trainerzelf` (met 033) | `persoon_id = ik or cc_begeleider()` | `persoon_id = ik or cc_begeleidt(persoon_id) or (scope=trainerdossier and data->>'door' = ik)` |
| `cc_admin` op dossiers | clubbeheerder ja | **nee** (alleen via toewijzing) |
| `hoprive` (werkaantekening) | bouwen | toewijzing (bouwen als filter) |
| 032 `trainerplan`, `clubbank` | voorstel | **vervalt** (clubbank later apart, als de club dat wil) |

## Bestaande schermen die veranderen
| Rol | Scherm | Verandering |
|---|---|---|
| Clubbeheerder / HO | Rollen of Teams | *Begeleiders toewijzen* (per trainer of team, van/tot) |
| Trainer | Planner (en Home bij een bezoek) | *Training delen* met uitleg vooraf; status *Gedeeld · versie n*; *Delen intrekken* |
| HJO/TJC | Week (PR #108) | één hoofdstatus per training; tik → snelvenster of moment |
| HJO/TJC | Begeleidingsmoment | *Gedeelde training openen* (alleen lezen), voorfeedback, koppeling kiezen |
| HJO/TJC | Trainerslijst | alleen toegewezen trainers |

**Eén hoofdstatus per training in de week** (rangorde, de eerste die geldt):
1. *Voorfeedback van jou verwacht* · 2. *Observatie vandaag* · 3. *Reflectie trainer ontvangen* · 4. *Observatie gepland* · 5. *Training gedeeld* · 6. *Afgerond* · 7. (niets).
Details (open afspraak, versie, reflectie) in het snelvenster of het moment.

## Regressietests (lokaal, zoals 033)
- **Nieuw `begeleiding-toewijzing.sql` (nieuw, in `supabase/tests/lokaal/`)**, per rol × gegeven × handeling:
  - rollen: trainer, andere trainer, HJO met toewijzing (trainer), HJO met toewijzing (team), TJC met toewijzing op één team, HJO zonder toewijzing, vorige begeleider (`tot` verlopen), clubbeheerder zonder begeleidersrol, begeleider van een andere club, server;
  - gegevens: rooster, voorbereiding (`eigen`), vorm (`eigen`), gedeelde training, vastgelegde versie, moment, reflectie, werkaantekening, toewijzing;
  - handelingen: lezen, maken, wijzigen, verwijderen; delen, opnieuw delen, intrekken; vastleggen; **vastgelegde versie wijzigen = geweigerd**; scope wijzigen = geweigerd.
- **Volgorde:** 033 → 034 en 034 alleen (zoals de 032/033-tests); 034 twee keer toepassen.
- **Bestaand groen:** rechten per rol (`priv.rechtentest`), clubscheiding, vaste regels, `begeleiding-eigenaarschap.sql`, `app-opslag.sql`.
- **App:** delen → begeleider leest → intrekken → begeleider ziet niets; observatie legt versie vast → intrekken → verslag houdt de kopie; trainer met twee teams en twee begeleiders; wissel van begeleider.
- **Demo:** de nagebootste database spiegelt de nieuwe regels en wordt vergeleken met de lokale database (`demo-rechten.sh` op de demobranch).

## Afhankelijkheden
| | Wat |
|---|---|
| Eerst | **033** toegepast en gecontroleerd in productie |
| Vervalt | **032** (wordt niet toegepast; bestand houden als historie of verplaatsen naar *afgewezen*) |
| Beleid | bewaartermijn, inzage van oudere verslagen bij een nieuwe begeleider, verwijderverzoeken: **privacytoets Swift** (Spoor 2) |
| Schermen | PR #108 voor de week en de compacte trainerslijst |
| Daarna | voorstel 1 kan los hiervan; delen en voorfeedback in de app pas na deze migratie |

**Omvang:** migratie 034 (voorstel) + lokale tests in één pull request; de schermen voor delen en toewijzen in een volgende, aparte pull request.
