# Overdracht Spoor 2 — AVV Swift

*Alleen Spoor 2 schrijft hier. Kort houden; aan het eind van elke ronde overschrijven. Besluiten heten hier "Voorstel Spoor 2 — …"; een besluitnummer geeft alleen Spoor 3.*

**Bijgewerkt:** 29-10-2026 (ronde 5 trainersontwikkeling)

## Stand
- **Branch:** `onderzoek/swift-trainersontwikkeling`. Gepusht, geen pull request, niets samengevoegd of gepubliceerd. Geen rechten gewijzigd.
- **Voorlopig akkoord (als concept):**
  - de zes criteria;
  - de drie ondersteuningsniveaus;
  - de besluiten 06-A t/m 07-H (zie de hoofdstukken).
- **H06 en H07, versie 2:**
  - KNVB-teamfuncties Aanvallen en Verdedigen, met omschakelen als overgang; los van de Swift-ordening;
  - de trainersaantallen met de afbakening als open punt (07-I);
  - een korte reflectie met drie vragen, de criteria optioneel;
  - de overdrachtsregels naar beoordeling uitgewerkt, te toetsen op privacy en juridische aspecten.
- **Voorbeeld:** één begeleidingsmoment in 7 stappen, `docs/onderzoek/swift-trainersontwikkeling/ronde-5/`. Per blok staat erbij wat bestaat, wat deels bestaat en wat nieuw is. Het kan zonder nieuwe deelrechten, via de vragenlijst vooraf en het moment.
- **Pilot:** `pilot-twee-begeleiders.md`.
- **Beveiliging (Spoor 3, L):**
  - uitvoerbaar voorstel `docs/onderzoek/beveiliging-begeleiding.md` + `supabase/migrations/033_eigen_reflectie.sql.voorstel`;
  - regressietest `begeleiding-eigenaarschap.sql`: nu 17 van 47 fout; met 033 en met 032 + 033 alle 47 goed;
  - productie (alleen gelezen): 0 reflecties, dus geen gegevens om te zetten.

## Wacht op (de gebruiker)
1. Goedkeuring van voorstel 033 en de app-aanpassing bij *Overnemen uit het evaluatieformulier*.
2. Bevestiging van de afbakening van de trainersaantallen (07-I).
3. Controle van de teamtaken in het officiële KNVB-document (06-B). knvb.nl was vanuit de sessie niet bereikbaar.
4. Een privacy- en juridische toets van de overdrachtsregels (07-G).
5. Een akkoord om de pilot te starten, en wie de tweede begeleider is.

## Volgende stap
- Na akkoord op 033: bouwen op een eigen branch (app-aanpassing eerst, daarna 033), met een pull request en jouw akkoord.
- Daarna fase 3: de begeleidingsmodule verbeteren volgens het voorbeeld van ronde 5.
