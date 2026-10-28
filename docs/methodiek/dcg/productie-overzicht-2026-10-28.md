# Wat er in productie verandert (stap 3 → 4), ter goedkeuring

*Gebouwd en getest: 63 automatische tests groen (waarvan één nieuwe voor het laden, terugdraaien, de evaluatie en de observatiepunten). Er is **nog niets** online gezet en **niets** in de database gewijzigd.*

## A. Kalendercontrole: de echte trainingen van DCG O13 Talententeam (team `O12-1`)
Gelezen uit de database op 28-10. Alle trainingen zijn van 17:15 tot 18:30.

| Week | Trainingen | Wedstrijd |
|---|---|---|
| 44 | do 29-10, vr 30-10 | za 31-10 Atletico Club Amsterdam O13-5 |
| 45 | di 3-11, do 5-11, vr 6-11 | za 7-11 vv Zwanenburg O13-1 |
| 46 | di 10-11, do 12-11, vr 13-11 | za 14-11 Sporting Martinus O13-4 |
| 47 | di 17-11, do 19-11, vr 20-11 | za 21-11 AGB O13-1 |
| 48 | di 24-11, do 26-11, vr 27-11 | za 28-11 Buitenveldert sc. O13-2 |
| 49 | di 1-12, do 3-12, vr 4-12 | za 5-12 SCPB'22 O13-5 |
| 50 | di 8-12, do 10-12, vr 11-12 | — |
| 51 | di 15-12, do 17-12, vr 18-12 | — |

**Totaal: 23 trainingen en 6 wedstrijden.** Geen enkele is afgelast, en geen enkele heeft al een voorbereiding. De enige bestaande training is die van 27-10, buiten deze periode.

Het lege sjabloon met precies deze data staat in `periodisering-sjabloon-o13.csv`. Open het in Excel, laat ChatGPT en jezelf de kolommen invullen, en sla het op als **CSV (puntkomma)**.

> De schermafbeeldingen van de vorige ronde kwamen uit de **demo** (verzonnen team O10-1, andere dagen). Het laden werkt altijd met het **gekozen team** in de echte app. In de demo zie je precies die controle: *"geen training van O10-1 op deze dag"* (`docs/onderzoek/periodisering-o13/gebouwd-laden-kalendercontrole.png`).

## B. Productiewijziging 1: de nieuwe app-versie (Vercel)
- Code: `training.js`, `periodisering.js` (nieuw), `app.css`, `index.html`.
- **Zolang het profiel v1 is, zien DCG-trainers bijna niets nieuws.** Het methodiekblok, de leerniveaus, de status, de evaluatiekaart, het laden en de observatiepunten verschijnen pas met profiel v3. Wel nieuw: het ingeklapte *Uitgebreid (optioneel)* bij een vorm.
- Swift en andere clubs: niets verandert.
- Terugdraaien: de vorige versie opnieuw publiceren (één klik in Vercel).

## C. Productiewijziging 2: DCG-profiel v1 → v3 (Supabase)
- Script `supabase/scripts/2026-10-28_dcg_profiel_v3.sql`. Het werkt **alleen** als het profiel nog exact gelijk is aan de reservekopie (controlesom `c550bf9a…`); anders gebeurt er niets.
- **Nieuw** (7): technischeOnderbouw, voetbalproblemen, leerniveaus, leeromgevingen, mengpaneel, handelingsketens, ontwerpprincipes.
- **Aangevuld of aangepast** (10): visie (+ cyclus), doelgroep (+ leeftijdsfase), leerlijnen (+ principe/spelersvraag/kant; `ll-6` = Afwerken), spelprincipes (8 lege plekken), leerdoelenPerLeeftijd (structuur), methodiek (+ noot over de fasen), trainingsopbouw (2 sjablonen + spacing), periodisering (model en weekformat uit het kerndocument), evaluatie (kaart), termen (*lokken* volgens het kerndocument).
- **Ongewijzigd** (2): teamfuncties, themalessen. **Verwijderd:** niets.
- **Geen id verandert.** De bestaande vormen en de training van 27-10 blijven geldig.
- Terugdraaien: `2026-10-28_dcg_profiel_v3_terug.sql` (zet de reservekopie terug).

## D. Daarna door jou, in de app (geen productiewijziging door Claude)
1. **Training → Lijn → Periodisering laden…** → kies je CSV.
2. Lees het voorbeeld: welke echte training krijgt een concept, wat wordt overgeslagen en waarom.
3. **Toevoegen** (of Annuleren). Terugdraaien kan via **Terugdraaien…**: alleen concepten die je niet hebt aangepast en die niet gegeven zijn.

## Volgorde (voorstel)
1. Akkoord op **B** → ik publiceer de nieuwe versie.
2. Akkoord op **C** → ik voer het script uit. Jij tikt in Supabase op **Toestaan** (binnen een minuut).
3. Jij laadt de periodisering (D) zodra de CSV klaar is.
