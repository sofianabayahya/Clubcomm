# Overdracht Spoor 3 — ClubComm (product)

*Alleen Spoor 3 schrijft hier. Kort houden (hoogstens ongeveer 30 regels); aan het eind van elke ronde overschrijven. Spoor 1 en 2 hebben hun eigen overdracht (`docs/methodiek/persoonlijk/overdracht.md`, `docs/methodiek/swift/overdracht.md`).*

**Bijgewerkt:** 4-11-2026 (chat *Ontwikkeling Tekentool*)

## Stand
- `main` = `eb4dcd0` (#106 samengevoegd). **Migratie 033 is niet toegepast.** Het eerstvolgende vrije besluitnummer is **149** (145–148 staan in open pull requests).
- Productiedatabase: zie de vorige stand (29/30-10). Niet aanpassen zonder apart akkoord.
- `npm test` op `main` (4-11): *nieuwe fase: pas een kleur vanaf 6 keer gemeten* (`@afmelden`) faalt 3 van 3 keer. Die test hangt af van de datum (demo); hij heeft niets met de tekentool te maken. Nog te onderzoeken.

## Open pull requests
| PR | Wat | Stand |
|---|---|---|
| #107 · #108 · #109 | Besluiten 145, 146, 147 (andere sessies) | zie de pull requests |
| #110 | **Besluit 148**: tekentool, rugnummers voorspelbaar (voorstel A), branch `bouw/tekentool-nummering` | 13/13 `@tekentool`; `npm test` 88/89 (de datumtest hierboven); **wacht op akkoord om samen te voegen** |

## Wacht op akkoord van de gebruiker
1. Samenvoegen van #110 (= publiceren). Daarna met `list_deployments` nagaan dat productie de commit van `main` draait.
2. Ongewijzigd uit de vorige ronde: correctie van de DCG-weekplannen (script `.sql.voorstel`, niet uitgevoerd); migratie 033 in productie.

## Tekentool (chat Ontwikkeling Tekentool)
- Onderzoek prioriteit 1: `docs/onderzoek/tekentool/prioriteit-1-spelers-en-nummers.md` (branch `onderzoek/tekentool-prioriteit-1`, alleen documenten).
- Open buiten de nummering (gemeten): het menu *Spelers* zet een speler neer bij een klik op het veld; op de telefoon bedekt dat menu het hele veld; spelers zijn 9 px op 390 px; *Opstelling* twee keer stapelt spelers; veld wisselen zet spelers buiten de lijnen; op *Half veld* staat de keeper bij de middenlijn.

## Volgende stap
- Advies: als eerstvolgende kleine reparatie het menu *Spelers* het gereedschap niet meer vanzelf laten aanzetten (een voorstel volgt eerst). Daarna het ontwerp voor veldcoördinaten, de middenlijn, verhoudingen en mobiel in de tekentool-chat.
