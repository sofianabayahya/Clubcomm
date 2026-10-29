# Overdracht: chat DCG-methodiek

*Gemaakt op 29-10-2026. Vanaf nu is er een **aparte chat voor de DCG-methodiek**. De chat ClubComm (product) gaat over schermen, rechten, Swift, de KNVB-standaard en andere clubs. Lees ook `CLAUDE.md` en Besluit 133 tot en met 135 in `docs/besluiten.md`.*

## Startzin voor de nieuwe chat
> Dit is de chat voor de DCG-methodiek in ClubComm. Lees eerst `docs/methodiek/persoonlijk/overdracht.md`, `CLAUDE.md` en Besluit 133 in `docs/besluiten.md`. Werk alleen aan de methodiek van DCG (profiel, periodisering, oefenvormen). Verander niets aan de app voor andere clubs zonder te vragen.

## Drie sporen (afspraak 29-10)
- **Spoor 1 – de persoonlijke voetbalmethodiek van de initiatiefnemer (DCG).** Daar gaat deze chat over: profiel, periodisering, vaardigheden, oefenvormen.
- **Voetbalinhoudelijke keuzes van DCG gaan nooit vanzelf naar AVV Swift** (of een andere club). Swift volgt zijn eigen methodiek (KNVB-standaard); overnemen kan alleen als de initiatiefnemer dat per onderdeel vraagt.
- **Spoor 3 – algemene verbeteringen aan ClubComm** (schermen, menu, rechten, delen) bespreken we apart en leggen we voor aan de ClubComm-chat.

## Waar gaat deze chat over
- **Inhoud van DCG:** kerndocument, profiel v3, periodisering (Excel → CSV), straks oefenvormen en tekeningen.
- **Alleen deze methodiek.** AVV Swift heeft een eigen spoor (Spoor 2: KNVB en het jeugdbeleidsplan); andere clubs kiezen de KNVB-standaard, de KNVB met eigen aanvullingen of een volledig eigen methodiek (Spoor 3). De persoonlijke methodiek wordt nooit automatisch overgenomen.
- **Het kerndocument van 26-09-2026 is leidend** (`01-kerndocument-v1.0.md`). Excel blijft het inhoudelijke document (uitgewerkt met ChatGPT); CSV met puntkomma's is alleen het invoerformaat.

## Wat er al is
| Wat | Waar | Stand |
|---|---|---|
| Kerndocument en drie hoofdstukken | `01-…` t/m `04-…` in deze map | Leidend, alleen DCG |
| Audit van de database | `audit-2026-10-28.md` | Klaar |
| **Profiel v3** (6 gereedschappen incl. Afwerken – benutten, 8 voetbalproblemen, 5 leerniveaus, mengpaneel met 9 knoppen, weekformat met optioneel contrathema) | `supabase/profielen/dcg.json`; leesbare versie `profiel-v3-controle.md` | **In de database sinds 29-10** (controlesom gelijk aan `dcg.json`; met 37 vaardigheden als concept) |
| Script om v3 in de database te zetten | `supabase/scripts/2026-10-28_dcg_profiel_v3.sql` | **Uitgevoerd op 29-10.** Terugzetten naar v1 kan met het terugdraaiscript |
| Reservekopie v1 en terugzetten | `supabase/backups/2026-10-28_dcg_profiel_v1.json`, `supabase/scripts/2026-10-28_dcg_profiel_v3_terug.sql` | Klaar |
| Oud script v2 | `supabase/scripts/2026-10-27_dcg_profiel_v2.sql` | **Vervallen, niet uitvoeren** |
| Leeg CSV-sjabloon met de echte data (29-10 t/m 18-12, 23 trainingen en 6 wedstrijden van het O13 talententeam) | `periodisering-sjabloon-o13.csv` | Klaar; kan ook in de app (Training → Lijn → Periodisering laden) |
| Overzicht voor productie | `productie-overzicht-2026-10-28.md` | Klaar |

**In de app (Besluit 133, staat online):** methodiekblok per training, leerniveau per blok, berekende status, evaluatie (4 kernvragen + verdiepend), periodisering laden met voorbeeld vooraf, terugdraaien, observatiepunten bij de wedstrijd, contrathema als optioneel weekveld. Dit werkt pas zodra profiel v3 in de database staat; tot die tijd merkt niemand er iets van.

**CSV-kolommen:** `datum;soort;fase;week;probleem;contrathema;gereedschapA;gereedschapB;keten;leerniveau;gedrag;informatie;leerroute;transfer;onderbouw;observatie;model`. Kolommen gaan op naam; observatiepunten bij een wedstrijd scheid je met `|` (maximaal 3); `model` = leeg (spacing) of *afwisselend*.

## Wat nog moet (op volgorde)
1. ~~Profiel v3 in de database~~ ✅ 29-10; app online ✅ 29-10 (Besluit 137 en 138).
2. ~~Periodisering O13 in de database~~ ✅ 29-10: 22 conceptrainingen + 8 weekplannen (6 wedstrijden met observatiepunten), met de code van de app gemaakt en per rij gecontroleerd (`supabase/scripts/2026-10-29_dcg_periodisering_o13.sql`). De trainingen van 27-10 en 29-10 (eigen voorbereiding) bleven zoals ze waren. Week 51: contraprobleem nog leeg (keuze 6 of 7).
2. **Definitieve periodisering** in Excel (met ChatGPT) → opslaan als CSV → in de app laden. Eerst het voorbeeld laten zien; pas na *Toevoegen* verandert er iets.
3. **Oefenvormen en tekeningen**, later en alleen door de initiatiefnemer aangeleverd.

## Wat niet mag
- **Geen periodisering laden** zonder uitdrukkelijk akkoord.
- **Geen oefenvormen genereren en geen tekeningen verzinnen.**
- **Geen bestaande trainingen overschrijven.**
- **Niets in de database** (profiel, scripts) zonder akkoord op de definitieve lijst.
- **Geen rechtenwijziging.** Rechten horen bij de ClubComm-chat (zie het rechtenvoorstel van Besluit 134).
- **Niets veranderen dat andere clubs raakt.** Alles van de methodiek moet in het profiel staan (gegevens), niet in de code. Moet er toch code veranderen, overleg dan eerst met de ClubComm-chat; de test *Zoals Swift* moet groen blijven.

## Samenwerken met de ClubComm-chat (Spoor 3)
*Bijgewerkt 29-10 na de afspraak over de drie sporen; zie `CLAUDE.md` en `docs/sporen.md`.*
- **Eigen werkbranch per chat**, zodat de chats elkaars werk niet overschrijven. Vóór elke wijziging de controle uit `CLAUDE.md` (nieuwste `main`, open pull requests, hoogste besluitnummer, conflicten).
- **Geen besluitnummers in dit spoor.** Een nieuwe afspraak heet hier *"Voorstel Spoor 1 — …"*. Spoor 3 geeft het definitieve nummer en zet het in het register.
- **Niet zelf publiceren en niet zelf samenvoegen met `main`.** Werk klaar → `npm test` (alles groen) → pushen naar de eigen branch → pull request → Spoor 3 controleert, voegt samen en publiceert vanaf `main`.
