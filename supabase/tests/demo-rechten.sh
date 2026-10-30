#!/usr/bin/env bash
# ClubComm — DEMO Swift: vergelijkt de rechten van de nagebootste database (app/vendor/supabase.js op deze branch) met de echte
# rechtenregels, in een TIJDELIJKE lokale database (rechtentest-lokaal.sh; nooit de echte database).
# Twee keer, beide met voorstel 032 (meekijken, in de demo als concept): zoals productie nu (zonder 033) en met 033.
set -euo pipefail
cd "$(dirname "$0")/../.."
T=$(mktemp -d); trap 'rm -rf "$T"' EXIT
DEMO_RECHTEN_UIT="$T/demo.json" npx playwright test tests/demo-swift.spec.js -g "rechten: uitvoer" --reporter=line >/dev/null
node supabase/tests/demo-rechten.js "$T/demo.json" > "$T/demo-rechten.sql"; chmod 644 "$T/demo-rechten.sql"; chmod 755 "$T"
# Alleen de regel van de demovergelijking telt hier (de 033-tests horen zonder 033 af te wijken; die staan in npm run test:veilig)
toon() { awk '/extra: demo-rechten/{p=1; print; next} p && /^      /{print; next} {p=0}'; }
echo "== Zoals productie nu (zonder 033) plus het CONCEPT voorstel 032 (meekijken)"; uit=$(ZONDER=033 EXTRA_SQL="$T/demo-rechten.sql" bash supabase/tests/rechtentest-lokaal.sh 032 || true); printf '%s\n' "$uit" | toon
printf '%s\n' "$uit" | grep -q "goed  extra: demo-rechten" || { echo "FOUT: de demo wijkt af van de echte rechten (zie hierboven)"; exit 1; }
echo "== Met migratie 033 (ter informatie: verschillen horen alleen bij wijzigen in het begeleidingsdossier)"; EXTRA_SQL="$T/demo-rechten.sql" bash supabase/tests/rechtentest-lokaal.sh 032 | toon || true
