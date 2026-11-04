# Voorstel — besluitnummer pas vlak vóór samenvoegen (Spoor 3, 04-11-2026)

*Alleen een voorstel. CLAUDE.md, `docs/besluiten.md` en `scripts/check.mjs` zijn **niet** veranderd.*

**Maat: S.** Dit is een werkafspraak voor de sessies. De app verandert niet en niemand kan iets anders of ziet iets anders. Net als #114 (werkwijze: overdracht bijwerken) is er dus geen besluit en geen voorbeeldscherm nodig.

**Afgewezen ideeën:** ik heb gezocht op *nummer* en *register*. Er staat niets over dit onderwerp.

## Het probleem

Op dit moment kiest een sessie het nummer **bij het begin van het werk**. De regel zegt *"pas vlak voor het opslaan kiezen"*, en "opslaan" lezen sessies als: het besluit in het bestand zetten. Daarna kan het werk nog uren of dagen open staan. Een andere sessie ziet het nummer dan niet, of te laat.

Dit ging op 04-11 twee keer mis:

| Nummer | Gekozen door | Gevolg |
|---|---|---|
| **146** | `bouw/ho-week` (#108, 01-11) **en** `demo/swift-trainer` (04-11) | Opgelost doordat `demo/swift-trainer` het werk van #108 heeft binnengehaald. Het is nu één en hetzelfde Besluit 146 (zie de correctie hieronder). |
| **154** | #118 **en** #119 | #119 is hernummerd naar 155. Daarvoor moesten het Register, de kop, de codecommentaren, de tests, de scripts, de kaart en de overdracht worden aangepast, en daarna alles opnieuw getest. |

Ook nu bijna: #122 gebruikt 156. Een sessie die vandaag "het vrije nummer" uit de overdracht leest, ziet daar nog **156** staan.

**Al onderweg:** PR #120 voegt een test toe die een dubbel nummer **op `main`** rood maakt. Dat is een goed vangnet, maar het werkt pas aan het eind: het werk is dan al gedaan en moet worden hernummerd. Dit voorstel voorkomt het probleem aan het begin.

## De afspraak (voorstel)

1. **Tijdens het werk heeft een nieuw besluit geen nummer.** Overal waar het nummer zou staan, schrijf je **`Besluit NNN`**: in de kop (`## Besluit NNN — …`), in het Register, in codecommentaren, in tests, in de kaart en in de titel van de pull request.
   - Twee nieuwe besluiten in één pull request: `NNN-a` en `NNN-b`.
   - Verwijzen naar een besluit dat al op `main` staat, gaat gewoon met het echte nummer (*"◐ Deels herzien door Besluit NNN"*).
2. **Het nummer komt pas bij de stap "overdracht bijwerken"**, dus na jouw akkoord en vlak voor het samenvoegen. Die stap bestaat al (#114), dus er komt geen extra ronde bij:
   - `npm run check` geeft het eerstvolgende vrije nummer;
   - vervang `NNN` overal door dat nummer, in dezelfde commit als de overdracht;
   - `npm run check` toont daarna **0 keer `NNN`**, anders niet samenvoegen.
3. **Bij het praten** noem je het werk naar de pull request: *"#122 (tekentool-paneel)"*, niet *"Besluit 156"*. Voor jou verandert dat weinig, want je geeft je akkoord al per pull request.
4. **Spoor 1 en 2** veranderen niet. Zij geven nooit een nummer en schrijven al *"Voorstel Spoor X — …"*.

## Wat er precies verandert (na je akkoord)

| Bestand | Wijziging |
|---|---|
| `CLAUDE.md`, *Controle* | *"een nieuw besluit nodig: het eerstvolgende vrije nummer, ook kijkend naar open pull requests; pas vlak voor het opslaan kiezen"* wordt *"een nieuw besluit krijgt tijdens het werk `Besluit NNN`; het echte nummer pas bij **overdracht bijwerken** (`npm run check`), vlak vóór samenvoegen"*. |
| `CLAUDE.md`, *Werkwijze* | Bij **overdracht bijwerken**: *"… en `NNN` vervangen door het eerstvolgende vrije nummer"*. |
| `docs/besluiten.md`, regel *Drie sporen* | Dezelfde zin in het kort. Het is een afspraak over dit bestand en geen nieuw besluit. |
| `scripts/check.mjs` (± 6 regels) | (a) Telt waar nog `NNN` staat in jouw branch ("N bestand(en) met NNN, eerst nummeren"). (b) Meldt een nummer dat in twee open branches of in main én een branch staat. Dat had 146 en 154 op tijd laten zien. |
| `docs/overdracht-clubcomm.md` | Blijft het vrije nummer noemen, met de waarschuwing dat je het pas bij samenvoegen gebruikt. |

**Afstemmen met #120:** zijn test leest alleen koppen met cijfers (`## Besluit 123`). Een kop `## Besluit NNN` mag op een branch zijn test niet rood maken, anders is elke open pull request rood. Op `main` hoort `NNN` nooit te staan. Dat bewaakt `npm run check` bij het samenvoegen; de test kan dat niet, want die draait ook op branches. Wie #120 en deze wijziging als tweede samenvoegt, controleert dat het samen werkt.

## Wat er gebeurt met het werk dat al open staat

Ik stel voor: **open pull requests houden hun nummer**, zodat er niets opnieuw hoeft. Er is één uitzondering:

- **Correctie (bij het bouwen, 04-11):** 146 is **niet** dubbel. `demo/swift-trainer` heeft de commit van #108 (`2998aa3`) zelf binnengehaald, dus beide branches hebben hetzelfde Besluit 146. Die branch blijft daarom ongewijzigd. `npm run check` noemt een nummer daarom alleen dubbel als de titel anders is.
- #113 (150), #122 (156) en #123 (verwijst naar 154, dat al op `main` staat) zijn in orde.

## Voordelen en nadelen

**Voordelen**
- Twee sessies kunnen niet meer hetzelfde nummer kiezen, want niemand kiest vooraf.
- Er hoeft niet meer hernummerd te worden; bij 154 → 155 kostte dat een hele ronde.
- Het Register staat op `main` altijd op volgorde, ook als pull requests in een andere volgorde worden samengevoegd.
- Er komt geen extra stap of extra ronde bij. Het nummeren gaat mee in de commit van de overdracht, en de tests draaien daar toch al opnieuw.

**Nadelen**
- Tijdens het werk heeft een besluit geen vast nummer om naar te verwijzen. Je gebruikt dan het nummer van de pull request.
- Vlak vóór samenvoegen moet nog één keer zoeken-en-vervangen gebeuren. Vergeet je dat, dan komt `NNN` op `main`. `npm run check` vangt dat op, en de test van #120 ook als die geen `NNN` op `main` toestaat.
- Als twee pull requests vlak na elkaar worden samengevoegd, moet de tweede na het samenvoegen van de eerste opnieuw `npm run check` draaien. Dat moet nu ook al (*"vlak vóór samenvoegen: dezelfde controle opnieuw"*).

## Mijn advies

**Doen**, in één kleine pull request (maat S): CLAUDE.md, de regel in `docs/besluiten.md` en de kleine uitbreiding van `npm run check` (punten a en b). Het liefst **na #120**, zodat ik beide samen kan controleren.

## Wat ik van je nodig heb

1. Akkoord met de afspraak: `NNN` tijdens het werk en het nummer pas bij *overdracht bijwerken*.
2. Akkoord dat open pull requests hun nummer houden, en dat `demo/swift-trainer` `NNN` krijgt.
3. Akkoord dat ik `npm run check` uitbreid met de twee meldingen.
