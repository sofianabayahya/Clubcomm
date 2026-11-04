# Overdracht Spoor 3 — ClubComm (product)

*Alleen Spoor 3 schrijft hier. Kort houden (hoogstens ongeveer 30 regels); aan het eind van elke ronde overschrijven. Spoor 1 en 2 hebben hun eigen overdracht (`docs/methodiek/persoonlijk/overdracht.md`, `docs/methodiek/swift/overdracht.md`).*

**Bijgewerkt:** 4-11-2026 (chat *Ontwikkeling Tekentool*)

## Stand
- `main` = `4bf2e97` (#109, Besluit 147, samengevoegd). **Migratie 033 is niet toegepast.** Het eerstvolgende vrije besluitnummer is **149** (145, 146 en 148 staan in open pull requests).
- Productiedatabase: zie de vorige stand (29/30-10). Niet aanpassen zonder apart akkoord.
- Datumtest *nieuwe fase: pas een kleur vanaf 6 keer gemeten*: faalde op `eb4dcd0` (3/3), slaagt op `4bf2e97` (3/3), want #109 gaf hem een vaste datum. PR #111 (andere sessie) pakt de overige datumafhankelijke tests aan.

## Open pull requests
| PR | Wat | Stand |
|---|---|---|
| #107 · #108 · #111 | Besluiten 145, 146; vaste datum in tests (andere sessies) | zie de pull requests |
| #110 | **Besluit 148**: tekentool, rugnummers voorspelbaar (voorstel A), branch `bouw/tekentool-nummering` | controles 1 en 2 gedaan (6 bevestigde fouten hersteld); `main` erin; 16/16 `@tekentool`, `npm test` 100/100; **wacht op akkoord om samen te voegen** |

## Wacht op akkoord van de gebruiker
1. Samenvoegen van #110 (= publiceren). Daarna met `list_deployments` nagaan dat productie de commit van `main` draait.
2. Ongewijzigd uit de vorige ronde: correctie van de DCG-weekplannen (script `.sql.voorstel`, niet uitgevoerd); migratie 033 in productie.

## Tekentool (chat Ontwikkeling Tekentool)
- Onderzoek prioriteit 1: `docs/onderzoek/tekentool/prioriteit-1-spelers-en-nummers.md` (branch `onderzoek/tekentool-prioriteit-1`, alleen documenten).
- Open buiten de nummering (gemeten): het menu *Spelers* zet een speler neer bij een klik op het veld; op de telefoon bedekt dat menu het hele veld; spelers zijn 9 px op 390 px; *Opstelling* twee keer stapelt spelers; veld wisselen zet spelers buiten de lijnen; op *Half veld* staat de keeper bij de middenlijn.

## Volgende stap
- Advies: als eerstvolgende kleine reparatie het menu *Spelers* het gereedschap niet meer vanzelf laten aanzetten (een voorstel volgt eerst). Daarna het ontwerp voor veldcoördinaten, de middenlijn, verhoudingen en mobiel in de tekentool-chat.
