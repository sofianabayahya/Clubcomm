# Voorstel Spoor 3 — Eigenaarschap zelfreflectie en toegang tot het begeleidingsdossier (risicoklasse L)

*Versie 2, 29-10-2026. Aangevraagd vanuit Spoor 2 (Swift). **Uitvoerbaar voorstel, nog niet uitgevoerd.** Productiedatabase, rechten, migraties en app zijn niet gewijzigd. Alle tests draaiden lokaal in een tijdelijke database zonder netwerk. In productie zijn alleen leesquery's uitgevoerd (aantallen, geen namen of teksten).*

## Inhoudelijk akkoord van de gebruiker (29-10)
- De trainer schrijft en past zijn eigen reflectie aan.
- De begeleider legt zijn eigen observaties en feedback vast.
- Tekst die de begeleider noteert, wordt niet automatisch op naam van de trainer opgeslagen.
- Een beheerder zonder begeleidingsbevoegdheid heeft geen toegang tot het begeleidingsdossier.

## 1. De precieze wijziging

### 1a. Database: `supabase/migrations/033_eigen_reflectie.sql.voorstel`

Het voorstel bestaat uit twee onderdelen.

1. **Een bewaker (trigger) op scope `trainerzelf`**, voor de kennismaking (`trainerKennis`), de vragenlijst vooraf en de reflectie (`begeleidZelf`):
   - **De trainer zelf** mag alles met zijn eigen rij. Hij mag de rij alleen niet op naam van een ander of in een andere scope zetten.
   - **Iemand anders** (HO/TC) mag alleen:
     - het veld `gevraagd` wijzigen;
     - een lege rij aanmaken, met alleen `trainerId` en `gevraagd`.
     Verwijderen of de inhoud wijzigen mag niet.
   - **De server** (geen ingelogde gebruiker, zoals automatische berichten) wordt niet tegengehouden.
2. **Een extra beperkende regel** (restrictive policy) op `trainerzelf` en `trainerdossier`. Alleen de persoon zelf of een begeleider (rol `hjo` of `tc`) komt erbij. Een clubbeheerder zonder begeleidersrol heeft dus geen toegang meer.

`priv.cc_mag` wordt **niet** aangepast. Daardoor gaat 033 ook samen met rechtenvoorstel 032, dat `cc_mag` opnieuw schrijft (getest).

**Terugdraaien** (als het in productie onverwacht iets blokkeert), in één keer:
```sql
drop trigger if exists rij_trainerzelf on public.rij; drop trigger if exists rij_trainerzelf_oud on public.rij;
drop trigger if exists rij_trainerzelf_weg on public.rij; drop policy if exists rij_begeleiding on public.rij;
drop function if exists priv.cc_bewaak_trainerzelf();
```

### 1b. App: één aanpassing nodig (nog niet gebouwd)

**Overnemen uit het evaluatieformulier** (`begeleiding.js`, `begelImportOk`) schrijft nu r1–r3 in de reflectierij van de trainer. Na 033 weigert de database dat. De begeleider zou dan de melding "niet opgeslagen" krijgen.

De nieuwe werking:
1. De begeleider slaat de tekst op **in het begeleidingsmoment**, als *genoteerd door de begeleider* (`m.reflectieBegeleider = { r, door, op }`, scope `trainerdossier`).
2. De trainer ziet in zijn verslag het kopje *"Genoteerd door je begeleider"*, met de knop **Neem over als mijn reflectie**. Hij kan de tekst ook zelf aanpassen of iets anders schrijven.
3. De begeleider ziet in het moment beide teksten, elk met wie het schreef.

Wat niet hoeft te veranderen:
- **Kennismaking uitnodigen** (`trainers.js`, `kennisUitnodigen`): de app zet alleen `gevraagd`, en dat blijft toegestaan.
- **Vragenlijst vooraf en reflectie door de trainer zelf**: blijven werken zoals nu.
- **Opslaan in de app** (`live.js`): de app stuurt alleen gewijzigde rijen. Een geweigerde rij geeft de bestaande melding en houdt de rest niet tegen.

**Volgorde van invoeren**
1. Eerst de app-aanpassing publiceren. Die is veilig zonder 033, want hij schrijft niet meer in de rij van de trainer.
2. Daarna 033 toepassen.
3. Daarna in productie de leescontrole van §3 opnieuw doen en de app met een testaccount nalopen.

## 2. Testresultaten (lokaal, herhaalbaar)

```
EXTRA_SQL="supabase/tests/lokaal/begeleiding-eigenaarschap.sql" npm run test:veilig            # nu
EXTRA_SQL="supabase/tests/lokaal/begeleiding-eigenaarschap.sql" npm run test:veilig -- 033     # met voorstel
EXTRA_SQL="supabase/tests/lokaal/begeleiding-eigenaarschap.sql" npm run test:veilig -- 032 033 # samen met 032
```

| Situatie | Rechten per rol | Clubscheiding | Vaste regels | Regressietest begeleiding (47) |
|---|---|---|---|---|
| Nu (zonder voorstel) | 37/37 | 12/12 | 76/76 | **17 van 47 fout**: dit is het probleem |
| Met 033 | 37/37 | 12/12 | 78/78 | **47/47** |
| Met 032 + 033 | 56/56 | 12/12 | 82/82 | **47/47** |

De onderzoekstest van ronde 4 (`onderzoek-begeleiding.sql`) is met 033 ook helemaal goed: 23/23. Elke controle draait in een eigen subtransactie die wordt teruggedraaid.

**De regressietest dekt alle betrokken rollen:**
- de trainer zelf;
- een andere trainer;
- de HO;
- een HO met bouw (zoals de TC nu bij Swift is ingesteld);
- de TC;
- HO + beheerder (zoals bij DCG en Swift);
- een clubbeheerder zonder begeleidersrol;
- de coördinator;
- een ouder;
- de server.

**Wat getest wordt:** reflectie, vragenlijst vooraf, kennismaking, dossier, begeleidingsmomenten en werkaantekeningen.

**Wat nog niet getest is** (dus ook niet "gecontroleerd"):
- de app tegen de echte rechten: de Playwright-tests gebruiken een nagebootste database;
- het echte Supabase-platform: lokaal is een nabootsing.

Beide komen bij het bouwen aan bod: de app-aanpassing met een Playwright-test, en na het toepassen een controle in productie met een testaccount.

## 3. Wat je wilde laten nagaan

| Punt | Bevinding | Gevolg |
|---|---|---|
| **Kennismakingsvragenlijst** | De HO zet bij het uitnodigen alleen `gevraagd`; dat blijft mogen. Er is wel een tweede, nieuw gevonden risico: bij opnieuw uitnodigen stuurt de app de hele rij mee. Had de trainer intussen antwoorden opgeslagen die de HO nog niet had binnengekregen, dan werden die overschreven. 033 weigert zo'n verouderde versie (test *stuurt verouderde versie terug*). | Geen app-aanpassing nodig. Hooguit een duidelijkere melding als dat gebeurt. |
| **Overnemen uit het evaluatieformulier** | Schrijft nu in de reflectierij van de trainer, zonder dat dat zichtbaar is. | App-aanpassing 1b. |
| **Bestaande opgeslagen reflecties** (productie, alleen lezen) | Swift: 3 rijen `begeleidZelf`, alle drie alleen de vragenlijst vooraf, door de trainer zelf opgeslagen. Er is **nog geen enkele reflectie** opgeslagen. Van de 4 momenten komt er 1 uit het evaluatieformulier, maar daar is geen reflectie mee overgenomen. DCG: geen begeleidingsgegevens. | Er hoeven geen gegevens te worden omgezet of gecorrigeerd. |
| **Kennismakingen in productie** | Swift: 2. Eén is door de trainer zelf ingevuld. Bij de andere staan 9 antwoorden zonder "ingevuld", laatst opgeslagen door een ander dan de trainer. Waarschijnlijk vulde de trainer tussentijds in en nodigde de HO daarna opnieuw uit. De database laat niet zien wie de antwoorden schreef. | Advies: kort navragen bij de trainer of de antwoorden van hem zijn. 033 voorkomt dit voortaan. |
| **Werkaantekeningen van begeleiders** (`hoprive`) | Iedere HO/TC (binnen de bouw) leest en **wijzigt** ook de aantekeningen van een andere begeleider. Er wordt geen schrijver opgeslagen, behalve de laatste opslag (`door`). De trainer en de beheerder zonder begeleidersrol kunnen er niet bij (goed). | Niet in 033. Eerst besluit 07-E: zijn werkaantekeningen persoonlijk of van de functie? Daarna een eigen kleine wijziging. De huidige stand is in de test vastgelegd. |
| **Regressietests** | 47 controles, alle rollen; zie §2. | Worden een vast onderdeel van `npm run test:veilig`. |
| **Gevolgen Swift en DCG** (productie, alleen lezen) | Swift: 2 personen met de rol `hjo` (één met bouw), 1 beheerder die ook `hjo` is, 3 trainers (2 met account). Geen rol `tc`. DCG: 1 HJO, 1 beheerder (dezelfde persoon), 1 coördinator, 1 trainer. Een beheerder zonder begeleidersrol is er nergens. | Voor de huidige gebruikers verandert er **niets** aan wat ze zien. Alleen een begeleider kan de reflectie van een trainer niet meer wijzigen, en dat deed in de praktijk nog niemand (0 reflecties). |

## 4. Account in twee clubs

Dit is niet bevestigd (ronde 4, 10/10 goed). Eén account hoort bij precies één club, en dat dwingt de database af. Er is geen wijziging nodig. Die controles worden wel vast opgenomen.

## 5. Wat je moet goedkeuren
1. De databasewijziging 033 (§1a) en de testresultaten (§2).
2. De app-aanpassing bij *Overnemen uit het evaluatieformulier* (§1b), en de volgorde van invoeren.
3. Pas daarna: bouwen op een eigen branch, met een pull request en jouw akkoord. 033 toepassen in productie gebeurt pas na een apart akkoord.
