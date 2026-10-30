# Demo Swift — trainer en HJO (simulatie)

*Branch `demo/swift-trainer`. Wordt **nooit** samengevoegd met `main` en nooit naar productie gepubliceerd. Spoor 3, 30-10-2026.*

## Wat het is
De echte ClubComm-app, maar zonder database: `public/app/vendor/supabase.js` is op deze branch een **nagebootste database in de browser**. Alles is fictief: team **Demo O15** (trainingen di en do 18:30–19:45, wedstrijd za, vorige week tot drie weken vooruit), **Demo HJO** (HO + trainer van Demo O15) en **Demo Trainer** (alleen trainer). De clubinstellingen zijn die van AVV Swift (pakket Trainers begeleiden, module Training, seizoen, fasen, vakanties, taken, label HO), **zonder** adres, sportpark en stops.

## Isolatie (waarom er geen verbinding met de echte database kan zijn)
1. **Geen adres en geen sleutel**: `config.js` wijst naar `https://demo.invalid` (bestaat nooit). De echte Supabase-bibliotheek staat niet op deze branch.
2. **Browser-blokkade (CSP)**: `connect-src 'self'` in `index.html` én als header in `vercel.json`. De browser weigert elk verzoek naar een andere site, ook als code het zou proberen.
3. **Geen server**: geen e-mail, geen pushmelding, geen uitnodiging, geen geplande taak. Het inlogscherm zegt dat eerlijk ("er is geen mail verstuurd").
4. **Geen preview zonder akkoord**: `vercel.json` → `git.deploymentEnabled["demo/swift-trainer"] = false`.

Vercel-toegangsbeveiliging is dus **geen** onderdeel van de isolatie; die komt er alleen bovenop.

## Openen (na akkoord op een preview)
- Adres van de preview, daarna inloggen met `hjo@demo.invalid` of `trainer@demo.invalid`, code **123456**.
- **Stand** kiezen in de oranje balk: *Swift nu* (zoals Swift nu echt is: geen opleidingsprofiel) of *Swift KNVB — concept* (simulatie; alles gelabeld als concept). Elke stand heeft zijn eigen opslag.
- **Rol wisselen**: als Demo HJO via de rolwisselaar (HO ↔ Trainer). Let op: dat verandert alleen de schermen, niet de rechten. Wat een echte trainer ziet: uitloggen en inloggen als Demo Trainer.
- **Wissen**: *Alles wissen* in de balk (beide standen, sessie, cache). Of de sitegegevens van de browser wissen.

## Opslag in de browser
- `localStorage`, per stand een sleutel (`demo-swift-db-nu`, `demo-swift-db-knvb`) en `demo-swift-stand`. Blijft bewaard na verversen en sluiten, alleen op dat apparaat en in die browser.
- De app zelf bewaart een sessie en een cache (`clubcomm-sessie-v1`, `clubcomm-demo-v1`). Na *Alles wissen* zet de app die leeg terug; er staat dan geen demo-inhoud meer in (getest).

## Tests
- `npx playwright test tests/demo-swift.spec.js`: code bevat geen productieadres of -sleutel; CSP blokkeert een eigen verzoek naar de productie-API; de hele route (trainer en HJO, verversen, uitloggen, wisselen, andere stand, wissen) maakt **alleen** verzoeken naar de eigen site; de simulatie is op elk scherm herkenbaar; bouwindeling vanaf O14.
- `bash supabase/tests/demo-rechten.sh`: de rechten van de demo per identiteit per rij (lezen en wijzigen) vergeleken met de **echte** rechtenregels in een tijdelijke lokale database, zoals productie nu (zonder 033) en met 033. Een opzettelijke fout in de demo wordt gevangen (getest).
- Bekend: één bestaande test (`oefenwedstrijd uit; ouder ziet adres`) faalt op deze branch omdat de CSP het adres zoeken bij PDOK (externe dienst) blokkeert. Dat is de isolatie zelf.

## Bestaand of concept
| Onderdeel | Stand |
|---|---|
| Alles in *Swift nu* | Bestaande functionaliteit, zoals Swift die nu heeft |
| Opleidingsprofiel in *Swift KNVB — concept* (teamfuncties Aanvallen/Verdedigen volgens H06, teamtaken met 06-B open, evaluatievragen) | **Concept**, niet vastgesteld |
| Trainer leest het profiel (in de stand KNVB) | **Concept**: in de echte database leest alleen HO/beheerder/coördinator het profiel (voorstel `onderzoek/profiel-leesrechten`) |
| HO ziet de trainingen en vormen van de trainer | **Niet gebouwd** (wacht op rechtenvoorstel 032) |
