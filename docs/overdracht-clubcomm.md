# Overdracht Spoor 3 — ClubComm (product)

*Alleen Spoor 3 schrijft hier. Kort houden (hoogstens ongeveer 30 regels); aan het eind van elke ronde overschrijven. Spoor 1 en 2 hebben hun eigen overdracht (`docs/methodiek/persoonlijk/overdracht.md`, `docs/methodiek/swift/overdracht.md`).*

**Bijgewerkt:** 04-11-2026

## Stand
- `main` = #119 (**Besluit 155**: korte evaluatie en labels uit het profiel; DCG-profiel v4 alleen in `dcg.json`) op #112 (**Besluit 149**: vrijwilligersprincipe, algemene ontwerpstandaard; alleen documenten) op #118 (**Besluit 154**: begeleider ziet alleen trainers in zijn werkgebied, ook in de database; alleen het besluit, migratie 034 nog niet gebouwd) op #117 (**Besluit 152 en 153**, tekentool: een menu sluiten zet niets onbedoeld neer; penaltystip, halve maan, hoekschopboogjes en middenstip op 11×11 en Half veld) op #115 (**Besluit 151**: documentatie en presentatie, functiekaarten als enige bron) op `358a6ab` (#114, werkwijze: overdracht bijwerken vóór samenvoegen, in `CLAUDE.md`), daarvoor `33d9ebb` (#107, **Besluit 145**: vorm verplaatsen). Daarvoor op 04-11: #110 (Besluit 148), #111 (vaste datums in de tests), #109 (Besluit 147; productie gecontroleerd). **Migratie 033 is niet toegepast.** Het eerstvolgende vrije besluitnummer is **155** (146 en 150 zijn bezet door open PR's). Let op: de branch `demo/swift-trainer` gebruikt óók 146; vóór samenvoegen hernummeren.
- De drie gegeven DCG-trainingen (27/29/30-10) zijn onveranderd; ze hebben geen vastlegging. Er is geen herstelscript (akkoord 04-11). De onzekere koppelingen (6v6 27-10, A2 29-10) staan in `docs/onderzoek/methodiek-aansluiting/t1-bouwvoorstel-gereedschap-vastleggen.md`.
- Productiedatabase (29/30-10, alleen gelezen): functioneel gelijk aan `main` (de md5 van alle `priv`-functies is gelijk, zonder commentaarregels). Het migratielogboek mist 027–030 (via losse SQL toegepast; alle objecten bestaan). Niet aanpassen zonder apart akkoord.

## Open pull requests
| PR | Wat | Stand |
|---|---|---|
| #108, #113 | Besluiten 146, 150 (andere sessies; beide eerst `main` binnenhalen: conflict in `besluiten.md`, `kaart.md` en `app.css`) | open |

Eerstvolgende vrije besluitnummer: **156**.

- Samengevoegd 04-11: #119, **Besluit 155** (korte evaluatie en labels uit het profiel; DCG-profiel v4 alleen in `dcg.json`, de database wacht op akkoord). #112, Besluit 149 (vrijwilligersprincipe; alleen documenten). #118, Besluit 154 (rechten begeleider per werkgebied; alleen besluit en voorstel). #117, Besluit 152 en 153 (tekentool; onderzoek en voorstel in `docs/onderzoek/tekentool/menu-sluiten.md` en `veldlijnen.md`; volgende tekentool-stap: op de telefoon bedekt het menu *Spelers* het veld, prioriteit 6). #116, Openstaand bijgewerkt. #115, Besluit 151 (documentatie en presentatie; alleen werkwijze). #114, in de werkwijze de stap *overdracht bijwerken* vóór samenvoegen. #111, vaste datum in drie datumafhankelijke tests (nieuwe fase; twee roostertests die vanaf eind mei 2027 zouden falen). Proef op 7 datums t/m 20-09-2027. Idee *demoseizoen laten meeschuiven* staat in Openstaand.

## Analyse (geen PR)
- Branch `analyse/methodiek-aansluiting`: ontwikkelvoorstel, begrippenlijst v2.1 (Spoor 1 akkoord als uitgangspunt), technische punten T1–T9 (T1 gebouwd), oplevering 2 (KNVB-basisprofiel: opt-in, ClubComm-startset, nog toetsen aan KNVB-bronnen; `www.knvb.nl` is niet bereikbaar vanuit deze omgeving), oplevering 3 (praktijktoets week 46).

## Wacht op akkoord van de gebruiker (in deze volgorde)
0. Na het samenvoegen van Besluit 155 (#119), apart: DCG-profiel in de database naar v4, `supabase/scripts/2026-11-04_dcg_profiel_v4.sql.voorstel` (alleen als het nog exact v3 is; reservekopie en terugdraaiscript erbij; lokaal getest 6 van 6; **niet uitgevoerd**).
1. Correctie van de acht DCG-weekplannen, `supabase/scripts/2026-10-30_dcg_weekplannen_correctie.sql.voorstel` (gecontroleerd tegen de CSV, **niet uitgevoerd**).
2. Apart: 033 toepassen in productie (dan controleren met `priv.rechtentest()` en de app).
- Rechtenvoorstel 032 (begeleider kijkt mee, clubbank): lokaal getest; samen met 033 in beide volgordes goed (56/56).
- Bevinding: uitvoerrecht van drie `priv`-functies intrekken (onbereikbaar voor anon). Een account hoort bij precies één club (getest 10/10).

## Volgende technische stap
- Later, eigen besluit: vaardigheidsaccenten per trainingsplek (de vorm blijft herbruikbaar; de trainer kiest per training het accent). Wat ontbreekt: `docs/onderzoek/trainingskaart/README.md`. Nu niet bouwen.
- Gebied F (documentatie en presentatie): **Besluit 151** staat op `main` (#115). Volgende stap, elk apart na akkoord: sjabloon voor pull requests met het blok Documentatie-impact, dan de eerste 5–6 trainerskaarten + *Snelstart vrijwillige trainer* als Concept. Open vragen (PowerPoints naast PDF's; wie verstuurt) staan bij *Nog te bespreken*.
- **Besluit 154** (L) staat op `main` (#118): begeleider ziet alleen trainers in zijn werkgebied, ook in de database (richting A; `docs/onderzoek/hjo-werkgebied-rechten/voorstel.md`). Alleen het besluit; migratie 034 nog niet gebouwd, niets in de database. Volgende stap na akkoord: 034 als voorstel + lokale tests; vooraf alleen lezen welke bouwen DCG en Swift hebben.
- Voorstel (L): het opleidingsprofiel veilig leesbaar maken voor trainers (onderzoeksbranch `onderzoek/profiel-leesrechten`).
