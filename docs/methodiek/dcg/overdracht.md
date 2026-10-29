# Overdracht: chat DCG-methodiek

*Gemaakt op 29-10-2026. Vanaf nu is er een **aparte chat voor de DCG-methodiek**. De chat ClubComm (product) gaat over schermen, rechten, Swift, de KNVB-standaard en andere clubs. Lees ook `CLAUDE.md` en Besluit 133 tot en met 135 in `docs/besluiten.md`.*

## Startzin voor de nieuwe chat
> Dit is de chat voor de DCG-methodiek in ClubComm. Lees eerst `docs/methodiek/dcg/overdracht.md`, `CLAUDE.md` en Besluit 133 in `docs/besluiten.md`. Werk alleen aan de methodiek van DCG (profiel, periodisering, oefenvormen). Verander niets aan de app voor andere clubs zonder te vragen.

## Waar gaat deze chat over
- **Inhoud van DCG:** kerndocument, profiel v3, periodisering (Excel → CSV), straks oefenvormen en tekeningen.
- **Alleen DCG.** Andere clubs (zoals AVV Swift) volgen de KNVB-standaard; daar gaat de ClubComm-chat over.
- **Het kerndocument van 26-09-2026 is leidend** (`01-kerndocument-v1.0.md`). Excel blijft het inhoudelijke document (uitgewerkt met ChatGPT); CSV met puntkomma's is alleen het invoerformaat.

## Wat er al is
| Wat | Waar | Stand |
|---|---|---|
| Kerndocument en drie hoofdstukken | `01-…` t/m `04-…` in deze map | Leidend, alleen DCG |
| Audit van de database | `audit-2026-10-28.md` | Klaar |
| **Profiel v3** (6 gereedschappen incl. Afwerken – benutten, 8 voetbalproblemen, 5 leerniveaus, mengpaneel met 9 knoppen, weekformat met optioneel contrathema) | `supabase/profielen/dcg.json`; leesbare versie `profiel-v3-controle.md` | Klaar en nagekeken tegen het kerndocument; **nog niet in de database** |
| Script om v3 in de database te zetten | `supabase/scripts/2026-10-28_dcg_profiel_v3.sql` | Klaar, **niet uitgevoerd**. Werkt alleen als het huidige profiel nog exact v1 is (controlesom `c550bf9a49eb215082de42245515b02f`) |
| Reservekopie v1 en terugzetten | `supabase/backups/2026-10-28_dcg_profiel_v1.json`, `supabase/scripts/2026-10-28_dcg_profiel_v3_terug.sql` | Klaar |
| Oud script v2 | `supabase/scripts/2026-10-27_dcg_profiel_v2.sql` | **Vervallen, niet uitvoeren** |
| Leeg CSV-sjabloon met de echte data (29-10 t/m 18-12, 23 trainingen en 6 wedstrijden van het O13 talententeam) | `periodisering-sjabloon-o13.csv` | Klaar; kan ook in de app (Training → Lijn → Periodisering laden) |
| Overzicht voor productie | `productie-overzicht-2026-10-28.md` | Klaar |

**In de app (Besluit 133, staat online):** methodiekblok per training, leerniveau per blok, berekende status, evaluatie (4 kernvragen + verdiepend), periodisering laden met voorbeeld vooraf, terugdraaien, observatiepunten bij de wedstrijd, contrathema als optioneel weekveld. Dit werkt pas zodra profiel v3 in de database staat; tot die tijd merkt niemand er iets van.

**CSV-kolommen:** `datum;soort;fase;week;probleem;contrathema;gereedschapA;gereedschapB;keten;leerniveau;gedrag;informatie;leerroute;transfer;onderbouw;observatie;model`. Kolommen gaan op naam; observatiepunten bij een wedstrijd scheid je met `|` (maximaal 3); `model` = leeg (spacing) of *afwisselend*.

## Wat nog moet (op volgorde)
1. **Akkoord van de initiatiefnemer op de lijst van profiel v3**, daarna het script uitvoeren (met `execute_sql`), controleren dat versie 3 erin staat, en de app bekijken.
2. **Definitieve periodisering** in Excel (met ChatGPT) → opslaan als CSV → in de app laden. Eerst het voorbeeld laten zien; pas na *Toevoegen* verandert er iets.
3. **Oefenvormen en tekeningen**, later en alleen door de initiatiefnemer aangeleverd.

## Wat niet mag
- **Geen periodisering laden** zonder uitdrukkelijk akkoord.
- **Geen oefenvormen genereren en geen tekeningen verzinnen.**
- **Geen bestaande trainingen overschrijven.**
- **Niets in de database** (profiel, scripts) zonder akkoord op de definitieve lijst.
- **Geen rechtenwijziging.** Rechten horen bij de ClubComm-chat (zie het rechtenvoorstel van Besluit 134).
- **Niets veranderen dat andere clubs raakt.** Alles van de methodiek moet in het profiel staan (gegevens), niet in de code. Moet er toch code veranderen, overleg dan eerst met de ClubComm-chat; de test *Zoals Swift* moet groen blijven.

## Samenwerken met de ClubComm-chat
- **Eigen werkbranch per chat**, zodat de chats elkaars werk niet overschrijven. Voor het samenvoegen met `main`: eerst `main` binnenhalen.
- **`docs/besluiten.md` is gedeeld.** Een nieuw besluit krijgt het eerstvolgende vrije nummer; kijk vlak voor het opslaan welk nummer dat is.
- Werkwijze blijft gelijk: besluit → bouwen → `npm test` (alles groen) → pushen → publiceren → pull request naar `main`.
