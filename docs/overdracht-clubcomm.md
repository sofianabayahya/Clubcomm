# Overdracht Spoor 3 — ClubComm (product)

*Alleen Spoor 3 schrijft hier. Kort houden (hoogstens ongeveer 30 regels); aan het eind van elke ronde overschrijven. Spoor 1 en 2 hebben hun eigen overdracht (`docs/methodiek/persoonlijk/overdracht.md`, `docs/methodiek/swift/overdracht.md`).*

**Bijgewerkt:** 04-11-2026

## Stand
- `main` = #114 (werkwijze: overdracht bijwerken vóór samenvoegen, in `CLAUDE.md`) op `33d9ebb` (#107, **Besluit 145**: vorm verplaatsen). Daarvoor op 04-11: #110 (Besluit 148), #111 (vaste datums in de tests), #109 (Besluit 147; productie gecontroleerd). **Migratie 033 is niet toegepast.** Het eerstvolgende vrije besluitnummer is **152** (146, 149, 150 en 151 zijn bezet door open PR's). Let op: de branch `demo/swift-trainer` gebruikt óók 146; vóór samenvoegen hernummeren.
- De drie gegeven DCG-trainingen (27/29/30-10) zijn onveranderd; ze hebben geen vastlegging. Er is geen herstelscript (akkoord 04-11). De onzekere koppelingen (6v6 27-10, A2 29-10) staan in `docs/onderzoek/methodiek-aansluiting/t1-bouwvoorstel-gereedschap-vastleggen.md`.
- Productiedatabase (29/30-10, alleen gelezen): functioneel gelijk aan `main` (de md5 van alle `priv`-functies is gelijk, zonder commentaarregels). Het migratielogboek mist 027–030 (via losse SQL toegepast; alle objecten bestaan). Niet aanpassen zonder apart akkoord.

## Open pull requests
| PR | Wat | Stand |
|---|---|---|
| #108, #112, #113, #115 | Besluiten 146, 149, 150, 151 (andere sessies) | open |
| #116 | Openstaand bijgewerkt (trainingsmodule, volgende stappen; geen besluitnummer, andere sessie) | open |

- Samengevoegd 04-11: #114, in de werkwijze de stap *overdracht bijwerken* vóór samenvoegen. #111, vaste datum in drie datumafhankelijke tests (nieuwe fase; twee roostertests die vanaf eind mei 2027 zouden falen). Proef op 7 datums t/m 20-09-2027. Idee *demoseizoen laten meeschuiven* staat in Openstaand.

## Analyse (geen PR)
- Branch `analyse/methodiek-aansluiting`: ontwikkelvoorstel, begrippenlijst v2.1 (Spoor 1 akkoord als uitgangspunt), technische punten T1–T9 (T1 gebouwd), oplevering 2 (KNVB-basisprofiel: opt-in, ClubComm-startset, nog toetsen aan KNVB-bronnen; `www.knvb.nl` is niet bereikbaar vanuit deze omgeving), oplevering 3 (praktijktoets week 46).

## Wacht op akkoord van de gebruiker (in deze volgorde)
1. Correctie van de acht DCG-weekplannen, `supabase/scripts/2026-10-30_dcg_weekplannen_correctie.sql.voorstel` (gecontroleerd tegen de CSV, **niet uitgevoerd**).
2. Apart: 033 toepassen in productie (dan controleren met `priv.rechtentest()` en de app).
- Rechtenvoorstel 032 (begeleider kijkt mee, clubbank): lokaal getest; samen met 033 in beide volgordes goed (56/56).
- Bevinding: uitvoerrecht van drie `priv`-functies intrekken (onbereikbaar voor anon). Een account hoort bij precies één club (getest 10/10).

## Volgende technische stap
- Later, eigen besluit: vaardigheidsaccenten per trainingsplek (de vorm blijft herbruikbaar; de trainer kiest per training het accent). Wat ontbreekt: `docs/onderzoek/trainingskaart/README.md`. Nu niet bouwen.
- Voorstel (L): het opleidingsprofiel veilig leesbaar maken voor trainers (onderzoeksbranch `onderzoek/profiel-leesrechten`).
