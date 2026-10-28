# Opleidingsprofielen (Besluit 121 en 123)

Een **opleidingsprofiel** beschrijft de methodiek van een club: visie, doelgroep, teamfuncties, spelprincipes, leerlijnen, leerdoelen per leeftijd, methodiek, trainingsopbouw, periodisering, themalessen, evaluatie en termen. De app programmeert géén methodiek vast in de code: alles staat in een profiel.

## Waar staat wat
- `knvb-<versie>.json`: de **standaard** voor nieuwe clubs (AVV Swift). Alleen ClubComm past hem aan, na controle met de officiële KNVB-documenten.
- **Eigen profiel van een club** (bijv. DCG): staat in de database van die club, tabel `rij`, soort `profiel`, id = profiel-id. Alleen die club ziet het (clubscheiding). `dcg.json` is de bron waarmee het DCG-profiel is ingevoerd (`supabase/scripts/2026-10-27_dcg_profiel.sql`); daarna is de database leidend.
- Rechten nu: scope `hjo` (HO/clubbeheerder en coördinator lezen en schrijven). Trainers lezen pas mee als de trainingsmodule er is (scope `trainersclub`, migratie + rechtentest, Besluit 121 fase 2).

## Opbouw (schema `clubcomm-profiel`, v1)
- Kop: `id`, `naam`, `modus` (`standaard` · `afgeleid` · `eigen`), `basis` ({bron, versie} of null), `versie`, `status` (`concept` · `gepubliceerd`), `bijgewerkt`, `bron`.
- `onderdelen`: elk onderdeel heeft een **`status`**:
  - `gecontroleerd`: vergeleken met een genoemd document (met datum);
  - `controleren`: nog niet nagelopen; trainers zien het niet;
  - `eigen`: door de club zelf vastgesteld;
  - `deels`: deels vastgesteld, met een lijst `open`;
  - `overgenomen`: komt uit de basis (bij een afgeleid profiel);
  - `leeg`: nog niet ingevuld.
- Lijsten (teamfuncties, leerlijnen, termen, …) bestaan uit items met een **vaste `id`**. Een id verandert nooit, ook niet als de naam verandert; oefenvormen koppelen aan die id (`vormkoppeling`), zodat een wijziging in het profiel niets kapotmaakt.
- Een onbekend onderdeel of veld negeert de app (dan kan een nieuwe versie van het schema velden toevoegen zonder het datamodel opnieuw te ontwerpen).

## Nieuwe onderdelen toevoegen
Een nieuw onderdeel = een nieuwe sleutel onder `onderdelen` met een `status`. Geen databasewijziging nodig.

## DCG-profiel versie 3 (28-10-2026)
Opgebouwd uit het kerndocument (`docs/methodiek/dcg/`, alleen DCG). Nieuwe onderdelen naast de bestaande: `technischeOnderbouw`, `voetbalproblemen` (8, met de matrix probleem × gereedschap), `leerniveaus` (5), `leeromgevingen` (5), `mengpaneel`, `handelingsketens`, `ontwerpprincipes`; `periodisering` met het weekformat, `evaluatie` met de evaluatiekaart, `trainingsopbouw` met twee sjablonen (spacing en afwisselend) en de definitie van spacing. Geen id is veranderd (`ll-6` = Afwerken).

Leesbare controleversie maken: `node supabase/profielen/leesbaar.js dcg > docs/methodiek/dcg/profiel-v3-controle.md`.
