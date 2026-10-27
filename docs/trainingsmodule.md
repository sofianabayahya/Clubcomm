# Trainingsmodule in ClubComm — audit en voorstel

*27 oktober 2026. Op basis van "trainingsmodule-voor-clubcomm.md" (uit de ART-app van de initiatiefnemer). Voorstel, nog geen besluit: de database wijzigt pas na akkoord, en elk scherm komt eerst als voorbeeld.*

## 1. Audit: wat ClubComm al heeft

| Onderdeel | Hoe het nu werkt | Hergebruiken? |
|---|---|---|
| **Stack** | Eén webapp voor de telefoon, gewone JavaScript zonder bouwstap (`public/app/*.js`), installeerbaar. Geen React. | De tekentool (ook gewone JavaScript + SVG) past er zonder ombouwen in. |
| **Database** | Supabase. Alles in **één tabel `rij`**: per rij een *soort*, een *scope* (wie mag erbij) en koppelvelden (team, speler, persoon, activiteit). De rechten (RLS = de database bepaalt per rij wie mag lezen en schrijven) staan in `priv.cc_mag`. | Geen nieuwe tabellen nodig: nieuwe *soorten* in `rij`. Bestaande scope **`teamstaf`** = trainer(s) en teamleider van het team. |
| **Rollen** | ouder, trainer (per team, meerdere mogelijk), teamleider, coördinator, HO (hoofd opleiding), TC, clubbeheerder. Per team één hoofdtrainer (`team.trainerId`). Geen aparte rol "assistent". | Hoofdtrainer = `team.trainerId`; andere trainers van het team = rol trainer bij dat team. |
| **Trainingen** | Elke training is een **activiteit** (`acts`, soort *training*) met team, datum, tijd, veld; vanzelf gemaakt uit het **rooster** per team (Besluit 87). Afgelast, vervanger, aanwezigheid zitten eraan vast. | **Koppel oefenvormen aan de activiteit (`act_id`)**, niet aan een losse lijst datums. |
| **Periodes** | Het seizoen heeft **fases** (bijv. fase 1: 19 aug – 30 okt), `M.blok`. Thema's en periodisering van de club: nog niet (Besluit 99, eerst de visie van de HO). | Weekstrook per fase. Thema per training: later, als de club haar periodisering heeft. |
| **Trainers begeleiden** | HO/TC begeleidt trainers: traject, **begeleidingsmoment** met observatie (A4, leertijd, "per voetbalvorm"), **reflectie van de trainer**, Mijn ontwikkeling (Besluit 99). | De **reflectie** bestaat al: niet dubbel bouwen. Later: bij een begeleidingsmoment de oefenvorm van die training erbij. |
| **Afdrukken** | `CC.printDoc` (A4, zwart op wit) voor dossier en observatie. | Hergebruiken voor "Training downloaden". |
| **Opslag van bestanden** | Geen. ClubComm slaat geen afbeeldingen op. | Advies: **alleen `tekening_json`** bewaren; het plaatje tekent de app zelf (`staticSvg`). Geen opslagbucket, geen JPEG's, geen risico van les 4. |
| **Testen** | `npm test` (50 tests) + nachtelijke **rechtentest** (Besluit 119). | Elke nieuwe soort krijgt controles in de rechtentest. |

## 2. Stap 3 gedaan: tekentool in een los testscherm
- `public/app/tekentool.js` = het `DrawTool`-blok uit ART, ongewijzigd, met twee kleine aansluitingen (`esc`, melding bij een fout).
- `public/app/tekentool.css` = de opmaak uit ART in ClubComm-kleuren, met de telefoonregel.
- **`/tekenen`** = testscherm: nieuwe tekening, tegels (getekend met `staticSvg`), opnieuw bewerken, verwijderen. Alleen op het eigen toestel, niets in de database.
- Getest: laptop (12 items met sneltoetsen, opslaan, tegel) en telefoon (390 px), geen fouten.

## 3. Voorstel: datamodel (nieuwe soorten in `rij`)
| Soort | Sleutel en koppeling | Inhoud | Scope (wie mag) |
|---|---|---|---|
| `trainingsplan` | id = activiteit; team, act | eigenaar per onderdeel, deadline, status, evaluatie van de training als geheel | `teamstaf`: staf van het team leest en schrijft |
| `oefenvorm` | eigen id; team, act (of leeg = alleen in de vormenbank) | onderdeel, volgnummer, eigenaar, vaardigheid, aantallen, duur, rondes, organisatie, regels, wedstrijdelement, aanpassing, "als het niet loopt", coachaccenten, `tekening_json`, status (concept/klaar), evaluatie | lezen: zie vraag 3 · schrijven: staf van het team |
| `vormfeedback` | eigen id; team, oefenvorm | tip of top, tekst, auteur | `teamstaf` |

- **Geen** `reflecties`, `reflectie_reactie` en `werkpunten`: die bestaan al in Trainers begeleiden (Besluit 99).
- **Clubbrede vormenbank** (vraag 3) vraagt één nieuwe scope, bijv. `trainers`: alle trainers, HO en TC van de club lezen; schrijven alleen de staf van het eigen team. Dat is een migratie (scope-lijst + `priv.cc_mag`) en controles in de rechtentest.
- Ouders zien niets van de trainingsmodule.

## 4. Voorstel: bouwvolgorde (deel 5 van het bestand)
1. ~~Audit~~ ✅ · 2. Datamodel (na akkoord) · 3. ~~Tekentool in testscherm~~ ✅
4. **Vormvenster** (velden + tekening), opslaan, tegels — eerst voorbeeld.
5. **Weekplan** per training (onderdelen, eigenaar, status, deadline), bij de training in *Aanwezigheid* of een eigen tab *Training* voor de trainer — eerst voorbeeld.
6. **Vormenbank**, daarna **evaluatie** en **afdrukken**.

## 5. Vragen (wat in ART specifiek ART is)
1. **Onderdelen A/B/C met vorm 1 en 2 (Ajax-opbouw)**: overnemen, of vrijer (een training = 1 tot 4 vormen in volgorde, bijv. warming-up · vorm 1 · vorm 2 · partij)?
2. **Rollen-rooster** (Trainer A/B/assistent schuiven per training door): nodig, of kiest de hoofdtrainer per vorm wie hem maakt?
3. **Vormenbank**: alleen eigen team, of clubbreed (alle trainers zien goede vormen van elkaar)?
4. **Evaluatie**: de ART-vragen (liep het, kwam de vaardigheid terug, uitdaging, tempo, aan welke knop) of de vijf KNVB-vragen (veel gevoetbald, veel herhaald, geleerd, plezier, afgestemd)? "Per groep" (lichtingen) valt weg: in ClubComm is een team één groep.
5. **Wie**: ook voor AVV Swift (pakket Trainers begeleiden: daar zijn trainingen nog niet in de planning), of eerst alleen DCG?
6. **Duur-maximum** (vorm 1: 6 min, vorm 2: 8 min) en **deadline vrijdagavond**: overnemen of per club instelbaar?
