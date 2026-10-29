# Voorstel Spoor 3 — Beveiliging begeleidingsroute (risicoklasse L)

*Onderzoek, 29-10-2026. Aangevraagd vanuit Spoor 2 (Swift). **Geen besluit, niets uitgevoerd.** De productiedatabase, de rechten, de migraties en de app zijn niet gewijzigd. Alle tests draaiden lokaal in een tijdelijke database zonder netwerk.*

## Hoe je het zelf herhaalt

```
EXTRA_SQL="supabase/tests/lokaal/onderzoek-begeleiding.sql" npm run test:veilig
```

- **Wat er gebeurt:** het script bouwt een tijdelijke database op met alle 31 migraties van `main`. Daarna draait het de gewone controles (37 + 12 + 76, alle goed) en het onderzoeksbestand.
- **Hoe de controles werken:** elke controle draait in een eigen subtransactie die daarna wordt teruggedraaid, zodat de controles elkaar niet beïnvloeden.
- **Wat "verwacht" betekent:** het **gewenste** beleid. Een afwijking laat dus zien dat het huidige systeem anders werkt.
- **Zonder de optie `EXTRA_SQL`** werkt het script precies als vroeger.

## Bevinding 1 — De zelfreflectie van de trainer is niet van de trainer

**Uitkomst: bevestigd, en groter dan eerst gemeld. 7 van de 23 controles wijken af.**

| Wie | Handeling | Gewenst | Nu |
|---|---|---|---|
| HO | wijzigt de reflectietekst van een trainer | weigert | **mag** |
| HO | verwijdert de reflectie van een trainer | weigert | **mag** |
| HO | maakt een reflectie aan op naam van een trainer | weigert | **mag** |
| TC | wijzigt de reflectietekst van een trainer | weigert | **mag** |
| Clubbeheerder (zonder begeleidersrol) | leest de reflectie van een trainer | weigert | **mag** |
| Clubbeheerder (zonder begeleidersrol) | wijzigt de reflectie van een trainer | weigert | **mag** |
| Clubbeheerder (zonder begeleidersrol) | wijzigt het dossier van een trainer | weigert | **mag** |

Wat wel goed gaat:
- de trainer leest en wijzigt zijn eigen reflectie;
- HO en TC lezen de reflectie;
- een andere trainer kan de reflectie niet lezen of wijzigen.

**Oorzaak.** In `priv.cc_mag` (laatst gezet in migratie 026) staat:
- `trainerzelf` → `p_persoon = ik or admin or priv.cc_begeleider()`. Deze regel geldt zowel voor lezen als voor schrijven.
- `trainerdossier` → `(not p_schrijven and p_persoon = ik) or admin or priv.cc_begeleider()`.
- `admin` = de rol `hjo` **of** `beheerder`. Een clubbeheerder telt dus als begeleider.

**De app schrijft hier zelf ook, op twee plekken, en dat is bedoeld.** Een oplossing moet daar rekening mee houden:
1. `trainers.js` (kennismaking vragen): de HO zet `gevraagd` in de kennismakingsrij van de trainer (`trainerKennis`).
2. `begeleiding.js` (*Overnemen uit het evaluatieformulier*): de begeleider zet de reflectie (r1–r3) in de rij van de trainer (`begeleidZelf`), maar alleen als die nog leeg is. Voor de trainer is dan niet te zien dat iemand anders het schreef.

Daarnaast slaat het formulier van de begeleider ook de vragenlijst vooraf (`begelZelf`) in de rij van de trainer op. Dat moet bij het bouwen worden nagelopen.

**Voorgestelde oplossing (nog niet gebouwd).**
1. **Schrijven in `trainerzelf` alleen door de trainer zelf.** HO en TC mogen alleen lezen.
   - Voor de twee bedoelde gevallen gebruiken we het bestaande mechanisme in `priv.cc_bewaak`: velden die anderen mogen wijzigen (`vrij`), zoals dat nu al bij activiteiten gebeurt.
   - Een begeleider mag dan alleen `gevraagd` zetten, en een lege rij aanmaken met alleen `trainerId` en `gevraagd`. De inhoud blijft van de trainer.
2. **Overnemen uit het evaluatieformulier.** De reflectie gaat niet meer in de rij van de trainer. Ze wordt in het begeleidingsmoment bewaard als *"genoteerd door de begeleider"*. De trainer ziet die tekst en kan hem met één tik **als eigen reflectie overnemen**, of zelf iets anders schrijven.
3. **Clubbeheerder.** Bij `trainerzelf` en `trainerdossier` vervalt `beheerder`. Alleen `hjo` en `tc` blijven over, en later de begeleider binnen zijn werkgebied (TJC, als Swift dat besluit).
   - Gevolg: een clubbeheerder zonder begeleidersrol ziet geen begeleidingsgegevens meer.
   - Nagegaan op 29-10 in productie, met een query die alleen leest: DCG en Swift hebben elk één clubbeheerder, en die heeft ook een begeleidersrol. Er is nu dus **niemand** die via alleen de beheerdersrol bij begeleidingsgegevens komt, en voor hen verandert er niets. Het risico geldt voor een toekomstige beheerder zonder begeleidersrol.
4. **Tests.** De 23 controles worden onderdeel van `priv.rechtentest()` of een vast lokaal bestand. Na de oplossing moeten ze allemaal goed zijn. De bestaande 37 + 12 + 76 blijven goed.
5. **Risico bij het bouwen.** Als de app een volledige rij opnieuw opslaat (ook een ongewijzigde of verouderde), kan de nieuwe regel die opslag weigeren. Daarom eerst de opslaglogica controleren en testen met de app (Playwright), niet alleen in de database.

## Bevinding 2 — Account in twee clubs

**Uitkomst: niet bevestigd. Mijn eerdere melding klopte niet. Alle 10 controles zijn goed.**
- In `public.lid` is `auth_uid` de **primaire sleutel**. Eén account hoort dus altijd bij **precies één club**. Een tweede lidmaatschap weigert de database zelf, ook voor de eigenaar.
- `priv.cc_club()` gebruikt `limit 1`, maar er is nooit meer dan één rij. De clubcontext is dus **vast, niet willekeurig**.
- Staat hetzelfde e-mailadres in twee clubs, dan koppelt `koppel_mij()` het account bij de eerste inlog aan **één** club: die van de oudste contactregel. Het account leest, wijzigt en schrijft niets in de andere club.

**Wat er wel speelt (functioneel, geen lek).** Iemand met hetzelfde e-mailadres in twee clubs kan met dat account maar **één** club gebruiken. Welke club dat wordt, hangt af van de volgorde, en de persoon kan niet zelf kiezen. Daarom gebruik je nu voor DCG en Swift waarschijnlijk twee verschillende accounts. *Meerdere clubs per persoon* staat al als later werk in `docs/productie-en-groei.md`.

**Voorstel.**
- Nu: geen wijziging in de database. De tien controles worden wel vaste controles, zodat dit zo blijft.
- Pas als *meerdere clubs per persoon* wordt gebouwd: een expliciete clubkeuze (de actieve club per sessie), met dezelfde controles op die keuze. Dat is een eigen besluit met risicoklasse L.

## Volgorde

| Stap | Wat | Voorwaarde |
|---|---|---|
| 1 | Oplossing bevinding 1 (punt 1–3) + tests (punt 4) | akkoord op dit voorstel |
| 2 | Pas daarna: verbeteringen in de begeleidingsmodule die de reflectie raken (Swift-volgorde stap 3) | stap 1 goed, lokaal én op GitHub |
| 3 | Pas daarna: nieuwe deelrechten (één training delen, voorfeedback) | stap 1 goed + een eigen rechtenvoorstel |
