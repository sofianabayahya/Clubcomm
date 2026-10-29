-- ClubComm — vaste beveiligingsregels van de database-opbouw (alleen lokaal, rechtentest-lokaal.sh). Leest alleen.
-- 1. Elke tabel in public heeft rijbeveiliging (RLS) aan
select 'RLS aan' as regel, c.relname as wat, c.relrowsecurity as ok from pg_class c join pg_namespace n on n.oid = c.relnamespace
 where n.nspname = 'public' and c.relkind = 'r'
union all
-- 2. Elke security-definer-functie in public en priv heeft een vast search_path
select 'search_path vast', n.nspname || '.' || p.proname, coalesce(array_to_string(p.proconfig, ',') like '%search_path%', false)
  from pg_proc p join pg_namespace n on n.oid = p.pronamespace where n.nspname in ('public','priv') and p.prosecdef
union all
-- 3. Niet ingelogd (anon) kan geen functie in priv bereiken (daarvoor zijn toegang tot het schema én uitvoerrecht nodig)
select 'anon niet in priv', n.nspname || '.' || p.proname, not (has_schema_privilege('anon', 'priv', 'usage') and has_function_privilege('anon', p.oid, 'execute'))
  from pg_proc p join pg_namespace n on n.oid = p.pronamespace where n.nspname = 'priv'
union all
-- 4. anon heeft geen toegang tot het schema priv
select 'anon geen toegang tot schema priv', 'priv', not has_schema_privilege('anon', 'priv', 'usage')
order by 3, 1, 2;
