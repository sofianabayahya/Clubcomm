# ClubComm

Communicatie en organisatie voor jeugdvoetbal (afmelden, planning, taken, vervoer, berichten, speeltijd, trainers begeleiden, trainingen).
**Pilot:** RKSV DCG, team **O13 talententeam** (interne code `O12-1`, 16 spelers; database sinds 25-09 leeg op dit team na, Besluit 38). **AVV Swift** (club-id `swift`): pakket Trainers begeleiden. De gebruiker (Sofian) is bij DCG trainer, ouder en clubbeheerder; bij Swift is zijn **functie HJO bovenbouw** (O14–O19), zijn technische rollen in de app (HO, clubbeheerder) zijn iets anders.

**Waar staat wat:** `docs/kaart.md` (onderwerp → code → besluiten → tests; ook de app, online en testen in het kort). Afspraken: `docs/besluiten.md` (enige bron van waarheid).

## Drie sporen (`docs/sporen.md`)
- **Herkennen:** het bericht begint met `SPOOR 1 — PERSOONLIJK`, `SPOOR 2 — SWIFT` of `SPOOR 3 — CLUBCOMM`. Geen spoor genoemd en je gaat iets wijzigen: eerst vragen.
- **Spoor 1 — Persoonlijk:** eigen voetbalmethodiek van de gebruiker (oefenomgeving DCG O13), `docs/methodiek/persoonlijk/`. Technisch via het DCG-clubprofiel; gaat **nooit vanzelf** naar een andere club.
- **Spoor 2 — Swift:** KNVB + jeugdbeleidsplan, `docs/methodiek/swift/`. Geen inhoud uit Spoor 1 zonder uitdrukkelijke toestemming.
- **Spoor 3 — ClubComm:** het platform voor alle clubs. Alleen Spoor 3 geeft besluitnummers, houdt het register bij, voegt samen met `main`, lost conflicten op en publiceert. Spoor 1 en 2 schrijven *"Voorstel Spoor X — …"*, werken op een eigen branch en publiceren nooit.
- **Inhoud en software apart:** raakt iets meer sporen, beschrijf dan (a) de inhoud voor dit profiel en (b) de algemene functie (altijd Spoor 3).
- **Overdracht per spoor; elk spoor schrijft alleen zijn eigen:** Spoor 1 `docs/methodiek/persoonlijk/overdracht.md`, Spoor 2 `docs/methodiek/swift/overdracht.md`, Spoor 3 `docs/overdracht-clubcomm.md`. Bijwerken aan het eind van elke ronde (kort: branch, pull requests, tests, wacht op akkoord, volgende stap).

## Maat van de opdracht (bepaal op risico en impact, niet op bestandslocatie)
| Maat | Wanneer | Wat nodig is |
|---|---|---|
| **S** | Kleine aanpassing zonder functionele of veiligheidsimpact (tekst, typfout, document, opmaak die niets verandert aan wat iemand kan of ziet) | Geen besluit, geen voorbeeldscherm. Snelle test van het onderwerp; vóór samenvoegen de volledige test. |
| **M** | Nieuwe of gewijzigde functie of scherm | Voorbeeld op 390 px vóór bouwen; besluit; gerichte tests tijdens bouwen; volledige test vóór samenvoegen. |
| **L** | Gevolgen voor database, beveiliging, autorisatie, persoonsgegevens of mogelijk gegevensverlies (ook een kleine codewijziging met gevolgen voor persoonsgegevens) | Als M, plus de zware controle: rechtentest, clubscheiding, privacy (welke gegevens, wie ziet ze, hoe lang). Eerst een voorstel; niets in de database of rechten zonder akkoord. Wat niet echt getest is, heet niet "gecontroleerd". |
Twijfel tussen twee maten: kies de grotere.

## Lezen: gericht, niet alles
1. Overdracht van je spoor → `docs/kaart.md` → alleen de bestanden en besluiten van het onderwerp (zoek in `docs/besluiten.md` op `## Besluit N` en op een zoekwoord).
2. **Altijd** op een zoekwoord zoeken in *Afgewezen ideeën* (onderaan `docs/besluiten.md`) vóór je een idee voorstelt; stel nooit een afgewezen idee voor zonder dat te zeggen.
3. **Breder lezen** (het hele Register en de besluiten die het raakt) bij: een nieuw besluit, nieuwe functionaliteit, of een wijziging die meer modules raakt. Bij tegenstrijdigheid geldt het nieuwste besluit.
4. Methodiekdocumenten alleen in Spoor 1 of 2. `docs/architectuur.md` bij profielen, modules of rechten.

## Controle (GitHub en branches)
**Vóór een wijziging** (code, centrale documenten, besluitnummer, publicatie) — een eerdere chatinstructie is nooit genoeg bewijs:
- nieuwste `main` (`git fetch origin main`), werkbranch bijgewerkt en zonder conflicten (samenvoegen, geen eigen werk kwijt), open pull requests, raakt een andere sessie dezelfde bestanden;
- een nieuw besluit nodig: het eerstvolgende vrije nummer, ook kijkend naar open pull requests; pas vlak voor het opslaan kiezen.

**Vlak vóór samenvoegen:** dezelfde controle opnieuw, volledige tests lokaal én groen op GitHub. Bij een conflict: stoppen, beschrijven, voorstel doen. Nooit nieuwere functionaliteit overschrijven.

## Publiceren
- **Samenvoegen met `main` publiceert vanzelf** naar productie (Vercel, gekoppeld aan GitHub; gecontroleerd 29-10). Een push naar een andere branch geeft alleen een afgeschermde voorbeeldversie. Dus samenvoegen alleen na **akkoord van de gebruiker**, en daarna met `list_deployments` nagaan dat productie de commit van `main` draait.
- Nooit een werkbranch naar productie (`create_deployment` alleen om `main` opnieuw te publiceren: project `clubcomm`, target production, gitSource github `sofianabayahya/Clubcomm`, ref `main`, zonder teamId).
- Database: migraties en eenmalige scripts alleen na akkoord (`supabase/migrations/` + `apply_migration`, `supabase/scripts/` + `execute_sql`).

## Werkafspraken met de gebruiker
- **Eenvoudig Nederlands**, één stap tegelijk, uitleg waar je klikt. De gebruiker is beginner.
- **Werkwijze:** besluit (bij M en L) → bouwen → testen → committen en pushen → pull request → akkoord → samenvoegen → productie nagaan → werkbranch opnieuw vanaf `main`.
- **Borgen bij een besluit:** nieuw besluit bovenaan `docs/besluiten.md` en in het Register; ouder besluit dat het raakt krijgt *"◐ Deels herzien door Besluit X"* of *"✖ Vervangen door …"*; wat bewust niet doorgaat bij *Afgewezen ideeën* (met reden); *Later / ideeën*, *Nog te bespreken* en **Openstaand** (`docs/productie-en-groei.md`) alleen bijwerken als ze echt veranderen. Andere documenten (`sporen.md`, `architectuur.md`, de kaart) alleen als hun inhoud niet meer klopt.
- **Eerst een voorbeeld** bij een nieuw of gewijzigd scherm: schermafbeelding op 390 px met voordelen, nadelen en een eerlijk advies. Bouwen na zijn ja. Normen uit `docs/app-controle.md` zelf nalopen (tikvlak 44 pt, contrast 4,5:1, leestekst 16 px, safe area, Beperk beweging, dubbel tikken).
- **Eigenaarschap:** zoek zelf verouderde teksten, gaten en fouten; leg ze voor, bouw na akkoord (kleine, duidelijke fouten mag je meenemen en melden). Stel na elke opdracht minstens één verbetering voor.
- **Principe 10:** overzichtelijk en precies, nooit een overkill. Vuistregels (Besluit 30 en 34): actie eerst, wat bij elkaar hoort in één blok, elke actie één vaste plek, kleur alleen voor aandacht, informatie is geen taak, "ClubComm signaleert, mensen beslissen".
- "Wat zijn de volgende stappen?": `docs/productie-en-groei.md` → **Openstaand**.

## Veiligheid
- Vraag nooit om geheime sleutels in de chat (Brevo, Supabase service key); de gebruiker zet ze zelf in het dashboard.
- Geen wijziging aan database, rechten, opleidingsprofielen of productie zonder akkoord. Tests en proeven nooit tegen de productiedatabase met schrijfacties.
- Demo: alleen verzonnen namen, geen echte clubs of adressen.
- Geen modelnamen in commits of pull requests.
