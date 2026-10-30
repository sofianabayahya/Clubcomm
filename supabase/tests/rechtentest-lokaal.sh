#!/usr/bin/env bash
# ClubComm — zware beveiligingscontrole (maat L), volledig lokaal. Gebruik: npm run test:veilig [-- 032]
# Bouwt een TIJDELIJKE Postgres-database op deze computer (geen netwerk: alleen een socket in een tijdelijke map),
# zet de Supabase-nabootsing en alle migraties uit supabase/migrations/ erin (een voorstel zoals 032 alleen als je het noemt),
# en draait: priv.rechtentest() (rechten per rol), clubscheiding.sql (niets van een andere club), statisch.sql (RLS,
# search_path, anon), begeleiding-eigenaarschap.sql en app-opslag.sql (Besluit 143).
# Daarna wordt alles weggegooid. Er is geen verbinding met de echte database mogelijk:
# alle PG*-variabelen en databaseadressen worden gewist en psql praat alleen met de socket in de tijdelijke map.
set -euo pipefail
cd "$(dirname "$0")/../.."
unset PGHOST PGHOSTADDR PGPORT PGUSER PGPASSWORD PGDATABASE PGSERVICE PGSERVICEFILE PGPASSFILE DATABASE_URL SUPABASE_DB_URL SUPABASE_ACCESS_TOKEN || true

BIN="${PG_BIN:-$(ls -d /usr/lib/postgresql/*/bin 2>/dev/null | sort -V | tail -1)}"
[ -x "$BIN/initdb" ] || { echo "FOUT: Postgres (initdb) niet gevonden; zet PG_BIN of installeer PostgreSQL 15/16."; exit 2; }
ALS=(); [ "$(id -u)" = 0 ] && ALS=(runuser -u postgres --)   # initdb weigert als root
DIR="$(mktemp -d /tmp/cc-rechten-XXXXXX)"; chmod 777 "$DIR"
stop() { "${ALS[@]}" "$BIN/pg_ctl" -D "$DIR/data" -m immediate stop >/dev/null 2>&1 || true; rm -rf "$DIR"; }
trap stop EXIT
"${ALS[@]}" "$BIN/initdb" -D "$DIR/data" -U postgres -A trust --no-locale -E UTF8 >/dev/null
"${ALS[@]}" "$BIN/pg_ctl" -D "$DIR/data" -l "$DIR/log" -w -o "-c listen_addresses='' -c unix_socket_directories=$DIR -p 5499" start >/dev/null
PSQL=("${ALS[@]}" "$BIN/psql" -h "$DIR" -p 5499 -U postgres -d postgres -v ON_ERROR_STOP=1 -q -X)
case "$("${PSQL[@]}" -tAc "select inet_server_addr() is null")" in t) ;; *) echo "FOUT: geen lokale socketverbinding; gestopt."; exit 2;; esac

"${PSQL[@]}" -f supabase/tests/lokaal/supabase-nabootsing.sql >/dev/null
# pg_net en pg_cron bestaan lokaal niet: alleen die regels worden overgeslagen (de nabootsing levert hun functies); verder ongewijzigd
migreer() { sed -E 's/^[[:space:]]*(create|drop) extension( if (not )?exists)? (pg_net|pg_cron).*$/-- (lokaal overgeslagen) &/I' "$1" > "$DIR/m.sql"
  chmod 644 "$DIR/m.sql"; "${PSQL[@]}" -f "$DIR/m.sql" >/dev/null 2>"$DIR/fout" || { echo "FOUT in migratie $1:"; cat "$DIR/fout"; exit 1; }; }
# ZONDER="033": die migratie(s) eerst overslaan; noem ze daarna als argument om de volgorde te testen (bijv. -- 032 033)
zonder() { for z in ${ZONDER:-}; do case "$(basename "$1")" in ${z}_*) return 0;; esac; done; return 1; }
for f in supabase/migrations/*.sql; do zonder "$f" && { echo "Overgeslagen (ZONDER): $f"; continue; }; migreer "$f"; done
for v in "$@"; do f=$( (ls supabase/migrations/${v}_*.sql.voorstel 2>/dev/null || true) | head -1); [ -n "$f" ] || f=$( (ls supabase/migrations/${v}_*.sql 2>/dev/null || true) | head -1)
  [ -n "$f" ] || { echo "FOUT: voorstel of migratie $v niet gevonden"; exit 1; }
  echo "Daarna meegenomen: $f"; migreer "$f"; done
echo "Database opgebouwd: $(ls supabase/migrations/*.sql | wc -l) migraties ($("$BIN/postgres" --version | awk '{print $3}'), tijdelijk, geen netwerk)"

fout=0
rapport() { local naam="$1"; local uit="$2"; local n; n=$(printf '%s\n' "$uit" | grep -c . || true); local m; m=$(printf '%s\n' "$uit" | awk -F'|' '$NF=="f"' | grep -c . || true)
  if [ "$n" -eq 0 ]; then echo "FOUT  $naam: geen controles uitgevoerd"; fout=1
  elif [ "$m" -eq 0 ]; then echo "goed  $naam: $n van $n"
  else echo "FOUT  $naam: $m van $n fout"; printf '%s\n' "$uit" | awk -F'|' '$NF=="f"' | sed 's/^/      /'; fout=1; fi; }
rapport "rechten per rol (priv.rechtentest)" "$("${PSQL[@]}" -tAF'|' -c "select wie, test, verwacht, uitkomst, ok from priv.rechtentest()")"
rapport "clubscheiding" "$("${PSQL[@]}" -tAF'|' -f supabase/tests/lokaal/clubscheiding.sql | grep '|')"
rapport "vaste regels (RLS, search_path, anon)" "$("${PSQL[@]}" -tAF'|' -f supabase/tests/lokaal/statisch.sql)"
rapport "begeleidingsdossier (Besluit 143)" "$("${PSQL[@]}" -tAF'|' -f supabase/tests/lokaal/begeleiding-eigenaarschap.sql | grep '|')"
rapport "app-opslag begeleiding (Besluit 143)" "$("${PSQL[@]}" -tAF'|' -f supabase/tests/lokaal/app-opslag.sql | grep '|')"
# Extra controles (bijv. een onderzoek): EXTRA_SQL="pad/naar/bestand.sql" npm run test:veilig
for x in ${EXTRA_SQL:-}; do rapport "extra: $(basename "$x")" "$("${PSQL[@]}" -tAF'|' -f "$x" | grep '|')"; done
[ "$fout" -eq 0 ] && echo "Alle automatische beveiligingscontroles goed. Privacy (welke gegevens, wie ziet ze, hoe lang) blijft een handmatige stap: zie docs/kaart.md." || echo "Er zijn afwijkingen: niet samenvoegen."
exit "$fout"
