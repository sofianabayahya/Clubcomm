# T1 — Bouwvoorstel: het gereedschap vastleggen bij gegeven trainingen (Spoor 3, 04-11-2026)

*Alleen een voorstel. Er is niets gebouwd, er is geen script uitgevoerd en er is niets gepubliceerd. De database is alleen gelezen.*

**Maat: M.**
- Er verandert een functie: hoe minuten worden toegerekend.
- Er komt geen nieuw scherm; er komt alleen één zin bij in de Vormenbank (§6).
- Er is geen migratie en er zijn geen nieuwe rechten nodig.
- Het eenmalige script voor de 3 oude trainingen (§8) is een **apart besluit**: het raakt de database, dus alleen na jouw akkoord.

**Besluit:** bij het bouwen komt er een nieuw besluit. Het nummer kies ik vlak voor het opslaan. Nu staat 145 in PR #107, dus waarschijnlijk wordt het 146.

---

## 1. Het probleem (gecontroleerd in de code)

- Besluit 121 zegt: *"een uitvoering op een training is een momentopname met een verwijzing naar de bron"*.
- In werkelijkheid bewaart een plek op een training alleen `vormId`, minuten, variant, notitie, niveau, fase en spacing.
- Het gereedschap wordt **elke keer opnieuw** opgehaald uit de **huidige** koppeling van de vorm. Dat gebeurt op deze plekken:

| Waar | Code |
|---|---|
| Minuten per training | `CC.trMinuten`, `training.js:440–447` |
| Maandtelling | `CC.minutenPerLeerdoel`, `training.js:425–432` |
| Lijn-tabel (clubs zonder methodiek) | `training.js:619–623` |
| Weekdetail: "gereedschap in gekozen vormen" | `inVormen`, `periodisering.js:64–67` |
| A/B van een blok zonder eigen keuze ("uit gekozen vorm") | `blokDoel`, `training.js:138` |

- De Vormenbank overschrijft een koppeling direct (`vormKies`, `training.js:803–805`), zonder versie en zonder melding.

**Gevolg:** een koppeling aanpassen verandert ongemerkt de minuten van trainingen die **al gegeven** zijn.

## 2. Het voorstel in één zin

**Op het moment dat een training *gegeven* wordt, onthoudt elke plek met een vorm welk gereedschap die vorm op dat moment had. Daarna tellen de minuten van die training altijd op dat onthouden gereedschap.**

## 3. Wat er per plek wordt bewaard

```js
o.vast = {
  vormId: 'vmvu6cgmdb6n',      // voor welke vorm dit geldt (controle bij vervangen)
  pid: 'dcg',                   // het profiel van de koppeling
  gs: 'll-aannemen',            // hoofdgereedschap (primair) van dat moment, of null
  ook: [],                      // "ook geraakt" van dat moment
  vh: ['vh-open-draaien'],      // vaardigheden van dat moment (classificatie, telt niet mee)
  op: '2026-11-10',             // datum van vastleggen
  bron: 'gegeven'               // 'gegeven' · 'correctie' · 'achteraf'
}
```

Daarnaast, alleen als blok A of B zijn gereedschap **uit de vorm** haalde (dus geen eigen keuze en geen weekvoorstel), komt er op de training: `p.blokVast = { A: 'll-aannemen' }`.

Er is **geen databasemigratie** nodig: dit staat in `rij.data` (jsonb), net als de rest van de training.

## 4. De regels

| # | Situatie | Wat er gebeurt |
|---|---|---|
| R1 | **Training wordt *gegeven*** (vinkje aan, `tpTerug`) | Elke plek met een vorm **zonder** geldige `vast` krijgt een `vast`, met `bron: 'gegeven'`. Plekken die al een geldige `vast` hebben, houden die. |
| R2 | **Lezen** (alle tellingen uit §1) | Eén hulpfunctie, `gsVan(S, p, o)`. Is de training gegeven, is er een `vast`, en horen `vast.vormId` en `vast.pid` bij de plek en het profiel? Dan telt `vast`. Anders telt de huidige koppeling, precies zoals nu. |
| R3 | **Correctie op een gegeven training: minuten, niveau, fase, notitie** | `vast` blijft zoals het is. |
| R4 | **Correctie: een andere vorm kiezen op een plek, of achteraf een vorm toevoegen** | Die plek krijgt meteen een nieuwe `vast` van de nieuwe vorm, met `bron: 'correctie'`. Een oude `vast` met een andere `vormId` telt niet meer (R2), dus er telt nooit een gereedschap van een vorm die er niet meer staat. |
| R5 | **Correctie: een vorm weghalen** | `vast` verdwijnt met de vorm. |
| R6 | **Terugzetten** (vinkje *gegeven* uit) | `vast` **blijft bewaard**, maar telt niet, want alleen gegeven trainingen tellen mee. Gaat het vinkje weer aan, dan blijft de eerste vastlegging staan (R1). Zo raakt een per ongeluk weggehaald vinkje geen geschiedenis kwijt. |
| R7 | **Verplaatsen tussen plekken** (PR #107) | `vast` gaat mee met de vorm: `'vast'` komt in de lijst `MEE`. Bij wisselen wisselt `vast` mee, en *Ongedaan maken* zet het terug. Een vorm naar Start of naar spacing verplaatsen is een echte correctie: die minuten tellen dan niet meer, zoals nu. |
| R8 | **Kopiëren naar een andere training** (`kopieer`) | `vast` en `blokVast` gaan **niet** mee. De kopie is een nieuwe planning. |
| R9 | **Periodisering terugdraaien** (CSV) | Gegeven trainingen worden al nooit aangeraakt (`periodisering.js:412`). Een teruggezette training met `vast` geldt als *bewerkt* en blijft dus staan. Dat is de veilige kant. |
| R10 | **Oude gegeven trainingen zonder `vast`** | Daar verandert **niets**. Ze volgen de vorm, zoals nu. Ze krijgen **niet** stilletjes een `vast` als je iets bewerkt, want dan zou de koppeling van vandaag als "toen" worden vastgelegd. Alleen het script uit §8 kan dat, na jouw akkoord. |
| R11 | **Club zonder profiel** (bijvoorbeeld Swift nu) | Er is geen koppeling, dus er komt geen `vast` (alleen als er een profiel-id is). Het gedrag blijft precies gelijk. |
| R12 | **Classificaties** (`vh`, `ook`) | Ze worden bewaard, zodat later te zien is hoe een vorm toen geclassificeerd was. Bijvoorbeeld de derde man als gezamenlijke oplossing (T6): de **soort** komt uit het profiel van toen, de **code** blijft. |

**Bewust níet in deze stap:**
- echte versies van vormen (Besluit 121, fase 2);
- de naam en tekening van een vorm vastleggen;
- `vast` tonen in het scherm (je hoeft het niet te zien, het moet alleen kloppen).

## 5. Omvang van de code (schatting)

| Plek | Wijziging |
|---|---|
| `training.js` | `gsVan()` en `legVast()` (± 15 regels); de tellingen in §1 lezen via `gsVan` (5 plekken); `tpTerug` roept bij de overgang naar *gegeven* `legVast` aan; het plaatsen van een vorm (`training.js:397`) roept op een gegeven training `legVast` aan voor die plek; `kopieer` haalt `vast` en `blokVast` weg; de melding in `vormKies` |
| `periodisering.js` | `inVormen` via `gsVan` |
| PR #107 | `'vast'` toevoegen aan `MEE`. Wie als tweede wordt samengevoegd, neemt dit mee. |
| Tests | zie §7 |

Totaal ongeveer 40 regels code.

## 6. De enige zichtbare wijziging (tekst, geen nieuw scherm)

In de Vormenbank, onder de keuze van het hoofdgereedschap, verschijnt alleen als die vorm in gegeven trainingen staat:

> *Staat in 2 gegeven trainingen. Die houden het gereedschap van toen; een wijziging geldt voor nieuwe en geplande trainingen.*

- Het is informatie en geen vraag; er hoeft niets aangeklikt te worden (vuistregel "informatie is geen taak").
- Kleine grijze tekst van 16 px, zonder extra knop.
- Voorbeeld op 390 px: ik lever een schermafbeelding vóór het bouwen, als je dat wilt. Het is één regel tekst in een bestaand venster.

## 7. Testcriteria

Ze worden toegevoegd aan `tests/trainingskaart.spec.js` / `tests/app.spec.js`, met demogegevens (verzonnen namen), **nooit tegen de productiedatabase**.

| # | Test | Verwacht |
|---|---|---|
| 1 | Training met 3 vormen → vinkje *gegeven* aan | 3 plekken hebben `vast`, met `gs` gelijk aan de koppeling en `bron: 'gegeven'` |
| 2 | Daarna de koppeling van een vorm wijzigen (Aannemen → Vrijkomen) | De minuten van die training, de maandtelling, Lijn en het weekdetail blijven **exact** gelijk |
| 3 | Dezelfde vorm in een **niet** gegeven training | Volgt de nieuwe koppeling |
| 4 | Vinkje uit → aan | `vast` en `op` zijn onveranderd; tussendoor telt de training niet mee |
| 5 | Gegeven training: echte minuten corrigeren | `vast` blijft gelijk; de minuten zijn de nieuwe minuten, op hetzelfde gereedschap |
| 6 | Gegeven training: een plek krijgt een andere vorm | Nieuwe `vast` van de nieuwe vorm, met `bron: 'correctie'` |
| 7 | Verplaatsen en wisselen (#107), en daarna *Ongedaan maken* | `vast` gaat mee en komt terug |
| 8 | Kopiëren naar een andere datum | De kopie heeft geen `vast` of `blokVast` |
| 9 | Bestaande gegevens zonder `vast` (zoals de 3 DCG-trainingen) | Precies **dezelfde** getallen als vóór de wijziging (vergelijking voor en na) |
| 10 | Club zonder profiel (Swift-demo) | Er wordt geen `vast` geschreven en alles werkt zoals nu |
| 11 | Blok A zonder eigen keuze, gereedschap uit de vorm | Na *gegeven* staat het in `blokVast`; een koppeling wijzigen verandert de blokkop van die training niet |
| 12 | Melding in de Vormenbank | Alleen zichtbaar bij een vorm in ≥ 1 gegeven training, met het juiste aantal |
| 13 | De volledige test (`npm test`), lokaal en op GitHub | groen |

## 8. De 3 trainingen die al gegeven zijn: wat er te achterhalen is

### Bronnen die ik heb nagelopen
1. **Wijzigingstijd per rij** (`rij.bijgewerkt`). Is een vorm daarna niet meer veranderd, dan is de koppeling van nu bewijsbaar dezelfde als toen.
2. **Het inrichtscript van 27-10** (`supabase/scripts/2026-10-27_dcg_training_eerste.sql`): de oorspronkelijke vormen van 27-10.
3. **Back-ups in de repository** (`supabase/backups/`): alleen het profiel v1, geen vormen.
4. **De trainingen zelf:** alleen 30-10 heeft een eigen A/B (Aannemen/Passen).
5. **Dagelijkse back-ups van Supabase** (Pro-abonnement): zie hieronder.

### Uitkomst per vorm

"Laatste opslag van de training" = 27-10: 28-10 22:12 · 29-10: 29-10 18:58 · 30-10: 31-10 20:27.

| Training | Vorm | Gereedschap nu | Vorm laatst gewijzigd | Conclusie |
|---|---|---|---|---|
| 27-10 | Skills passeren in kruisvorm (2×) | 1v1 aanvallend (oude lijst) | 27-10 21:26 | ✅ **bewijsbaar gelijk** |
| 27-10 | Dreigen tegenover elkaar | 1v1 aanvallend | 27-10 21:19 | ✅ bewijsbaar gelijk |
| 27-10 | Naar elkaar toe dribbelen en passeren | 1v1 aanvallend | 28-10 22:11 | ✅ bewijsbaar gelijk (net vóór 22:12) |
| 27-10 | 2 tegen 1 overtal (2×, 20 min) | 1v1 aanvallend, zonder "ook" | 29-10 21:05 (na) | ◐ **Hoofdgereedschap waarschijnlijk gelijk**: het script van 27-10 gaf `[1v1 aanvallend, Passen]`. Toen telde Passen als "ook". Het hoofdgereedschap, en dus de minuten, is niet veranderd. |
| 27-10 | Eerste druk uitspelen 6v6 (25 min) | **Passen** (+ Vrijkomen, Aannemen) | 31-10 20:25 (na) | ✖ **Niet zeker.** Het script van 27-10 gaf **geen** gereedschap (`leerdoelen: []`). Op 27-10 telden die 25 minuten dus waarschijnlijk **nergens**; nu tellen ze bij Passen. *Let op:* de echte minuten van 27-10 zijn niet ingevuld (*niet gecontroleerd*). |
| 29-10 | Ballmastery | geen | 29-10 18:51 | ✅ gelijk (geen gereedschap) |
| 29-10 | A1 – Open aannemen (2×) | Aannemen | 29-10 18:55 | ✅ bewijsbaar gelijk |
| 29-10 | B2 – Slootspel | Passen | 29-10 18:51 | ✅ bewijsbaar gelijk |
| 29-10 | A2 – Eerste contact van de druk af (2×, 20 min) | Aannemen | 29-10 19:50 (na) | ◐ **Niet bewijsbaar, wel waarschijnlijk:** de vorm is die dag in de app gemaakt, en naam en gereedschap passen bij elkaar. Er is geen andere bron. |
| 30-10 | Druk volgen (2×) · Derde man · Vier vakkenspel · 6v6 | Aannemen · Passen · Passen · Passen | allemaal 31-10, vóór 20:27 | ✅ bewijsbaar gelijk aan de laatste opslag van de training |

*"Bewijsbaar gelijk" betekent: gelijk aan de stand bij de **laatste opslag** van die training. Dat moment lag na het geven, dus dat is het beste bewijs dat er is.*

**Samengevat:** 15 van de 18 plekken zijn bewijsbaar of als hoofdgereedschap gelijk. **Twee vormen zijn onzeker:** 6v6 op 27-10 (25 min) en A2 op 29-10 (20 min).

### Dagelijkse back-ups
- Het project zit op het **Pro**-abonnement. Supabase maakt dan dagelijks een back-up en bewaart die **7 dagen**.
- De back-ups van **28 en 29 oktober verdwijnen dus vandaag of morgen**; die van 30 en 31 oktober rond 6 en 7 november.
- Alleen daarin zou de koppeling van 6v6 (28-10) en A2 (29-10) nog te vinden kunnen zijn, als de back-up van vóór het wijzigingsmoment is.
- **Mijn eerlijke advies: niet doen.** Zo'n back-up is de **hele database, met persoonsgegevens van alle clubs**. Downloaden en doorzoeken kost privacyrisico, en het gaat om 45 minuten in 2 trainingen waarvan de minuten deels toch al *niet gecontroleerd* zijn. Als je het toch wilt: alleen jij, in het Supabase-dashboard (Database → Backups), lokaal, en daarna verwijderen. Nooit terugzetten in productie.

### Voorstel voor het script (nog niet maken of uitvoeren; apart akkoord)
1. De **15 zekere plekken** krijgen een `vast` van de huidige koppeling, met `bron: 'achteraf'`.
2. Voor de **2 onzekere vormen** kies jij uit je herinnering:
   - (a) zoals nu: 6v6 telt bij Passen, A2 bij Aannemen;
   - (b) 6v6 op 27-10 telt nergens (zoals in het script van 27-10);
   - (c) geen `vast`: ze blijven de vorm volgen.

   Advies: (a) voor A2, en voor 6v6 jouw herinnering. Anders (c).
3. Eerst een back-up van precies deze 3 rijen in `supabase/backups/`. Daarna `execute_sql`, en dan controleren: Lijn moet dezelfde getallen tonen als vóór het script.

## 9. Kleine en controleerbare ontwikkelstap

1. **Stap 1 (deze PR):**
   - `gsVan` + `legVast` + de regels R1–R12 + de melding + tests 1–13;
   - een besluit in `docs/besluiten.md`;
   - werkt alleen vanaf nu. **Er wordt niets aan bestaande gegevens veranderd.**
2. **Stap 2 (los, met akkoord):** het script uit §8.
3. **Daarna:** pas PR #107 aan (`'vast'` in `MEE`). Of, als #107 eerder wordt samengevoegd, neemt deze PR dat mee.

## 10. Wat ik van je nodig heb
1. **R6:** akkoord dat het vastgelegde gereedschap **bewaard blijft** als je *gegeven* uitzet? Het andere kan ook: wissen en opnieuw vastleggen. Dat is eenvoudiger, maar dan kan een per ongeluk weggehaald vinkje geschiedenis wijzigen.
2. **Melding in de Vormenbank:** wil je eerst een schermafbeelding op 390 px, of is de tekst genoeg?
3. **Back-ups:** akkoord met mijn advies om ze niet te doorzoeken?
4. **Bouwen:** mag ik stap 1 bouwen op een eigen branch, met een pull request en zonder samenvoegen?
