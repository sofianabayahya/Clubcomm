# Rechtenvoorstel: begeleider kijkt mee en clubbank (Besluit 134)

*Voorstel van 29-10-2026. **Nog niet uitgevoerd.** Het script staat klaar in `supabase/migrations/032_begeleider_kijkt_mee.sql.voorstel` en is getest op een lokale kopie van de database-opbouw (migraties 001–031): de rechtentest geeft **56 van 56 goed** (37 bestaande + 19 nieuwe controles).*

## Wie mag wat

| | Trainer zelf | HO / TC (begeleider) | Teamleider, coördinator, ouder |
|---|---|---|---|
| **Zijn trainingen** (ook weekthema) | lezen en schrijven | **lezen**, als de club het aanzet én de trainer dit seizoen een traject heeft of had | niets |
| **Vormen die in een training staan** | lezen en schrijven | **lezen** (zelfde voorwaarden) | niets |
| **De rest van zijn vormenbank** | lezen en schrijven | niets | niets |
| **Feedback van de begeleider** (bij een training) | lezen | lezen en schrijven | niets |
| **Clubbank** (vormen die een trainer zelf deelt) | lezen; eigen vorm delen en aanpassen | lezen; eigen vorm delen | niets |

- **Aan of uit:** de clubbeheerder zet in *Regels* het vinkje *Begeleider kijkt mee met trainingen*. Staat het uit, dan ziet de begeleider meteen niets meer (ook getest).
- **Seizoen:** vanaf 1 juli. Een traject dat dit seizoen is afgerond, telt nog mee (zo kan de HO de clublijn bewaken).
- **Wie is begeleider:** iedereen met de rol HO of TC, net als bij het dossier nu. *Keuze voor later:* een TC alleen voor trainers in zijn eigen bouw.
- **Aanpassen** doet alleen de trainer. De HO kan een training nooit wijzigen (ook getest).

## Wat de app daarna moet doen (pas bouwen na akkoord)
1. Trainingen opslaan met de nieuwe soort recht `trainerplan`; vormen ook, maar alleen als ze in een training staan.
2. Bij de begeleider: in het dossier en bij het begeleidingsmoment *Trainingen van [naam]* (alleen lezen), met per training een veld *Feedback*.
3. Bij de trainer: de feedback staat bij de training (geen melding, Besluit 134).
4. Clubregels: het vinkje *Begeleider kijkt mee* en de keuze *Training invoeren bij een begeleidingsmoment: verplicht / vrijwillig*.
5. Vormen: knop *Delen met de club*; in Vormen een filter *Clubbank*, met *Kopieer naar mijn vormen*.
6. Bestaande trainingen blijven onzichtbaar voor de begeleider tot de trainer ze opnieuw opslaat (of tot een eenmalig script ze omzet, ook na akkoord).

## Risico's en hoe we die afdekken
- **Te veel zichtbaar:** alleen lezen, alleen begeleiders, alleen met vinkje en traject; elke regel heeft een controle in de rechtentest, die elke nacht draait.
- **Terugdraaien:** vinkje uit = direct niets meer zichtbaar. Het script verwijdert niets.
