-- ClubComm — Besluit 143: de rijen die de app werkelijk opslaat (vastgelegd door tests/eigen-reflectie.spec.js in
-- app-opslag.json) afspelen tegen de echte rechten, als de persoon die ze verstuurde, met upsert zoals PostgREST dat doet.
-- Alleen lokaal (rechtentest-lokaal.sh); alles in één transactie die wordt teruggedraaid.
\set app `cat supabase/tests/lokaal/app-opslag.json`
begin;
create temp table uitkomst (wie text, test text, verwacht text, uitkomst text);
create temp table app as select :'app'::jsonb as j;
create temp table uid as select p.value #>> '{}' as persoon, ('00000000-0000-0000-0000-0000000000f' || (p.ordinality))::uuid as id
  from app, jsonb_array_elements((select j->'personen' from app)) with ordinality p;
insert into auth.users (id, email, aud, role) select id, 'app-' || persoon || '@t.nl', 'authenticated', 'authenticated' from uid;
insert into public.lid (auth_uid, club_id, persoon_id) select id, (select j->>'club' from app), persoon from uid;
-- Beginstand van de database (zoals een beheerder hem klaarzet)
insert into public.rij (club_id, soort, id, scope, team_id, speler_id, persoon_id, act_id, data)
  select r->>'club_id', r->>'soort', r->>'id', r->>'scope', r->>'team_id', r->>'speler_id', r->>'persoon_id', r->>'act_id', r->'data'
  from app, jsonb_array_elements(j->'begin') r;

do $$
declare s jsonb; r jsonb; u text; wie uuid;
begin
  for s in select x from app, jsonb_array_elements(j->'stappen') x loop
    select id into wie from uid where persoon = s->>'wie';
    insert into uitkomst values (s->>'wie', s->>'wat' || ': geen verwijderingen', 'ja', case when jsonb_array_length(s->'weg') = 0 then 'ja' else 'nee' end);
    for r in select x from jsonb_array_elements(s->'rijen') x loop
      perform set_config('request.jwt.claims', json_build_object('sub', wie, 'role', 'authenticated')::text, true);
      begin
        execute 'set local role authenticated';
        insert into public.rij (club_id, soort, id, scope, team_id, speler_id, persoon_id, act_id, data)
          values (r->>'club_id', r->>'soort', r->>'id', r->>'scope', r->>'team_id', r->>'speler_id', r->>'persoon_id', r->>'act_id', r->'data')
          on conflict (club_id, soort, id) do update set scope = excluded.scope, team_id = excluded.team_id, speler_id = excluded.speler_id,
            persoon_id = excluded.persoon_id, act_id = excluded.act_id, data = excluded.data;
        u := 'mag';
        execute 'reset role';
      exception when others then execute 'reset role'; u := 'weigert';
      end;
      insert into uitkomst values (s->>'wie', format('%s (%s %s)', s->>'wat', r->>'soort', r->>'id'), s->>'verwacht', u);
    end loop;
  end loop;
end $$;

-- Eindstand: wat moet er in de database staan?
insert into uitkomst select 'Eindstand', 'reflectie is de aangepaste tekst van de trainer', 'ja',
  case when exists (select 1 from public.rij where soort = 'begeleidZelf' and data->'r'->>'r1' like 'Ik riep minder, en%') then 'ja' else 'nee' end;
insert into uitkomst select 'Eindstand', 'reflectie is laatst opgeslagen door de trainer zelf', 'ja',
  case when exists (select 1 from public.rij r join uid on uid.id = r.door where r.soort = 'begeleidZelf' and uid.persoon = r.persoon_id) then 'ja' else 'nee' end;
insert into uitkomst select 'Eindstand', 'tekst uit het evaluatieformulier staat als begeleiderstekst in het moment', 'ja',
  case when exists (select 1 from public.rij r, app where r.soort = 'begeleidMomenten' and r.data->'reflectieBegeleider'->>'door' = j->'personen'->>0) then 'ja' else 'nee' end;
insert into uitkomst select 'Eindstand', 'antwoorden kennismaking staan er nog na opnieuw uitnodigen', 'ja',
  case when exists (select 1 from public.rij where soort = 'trainerKennis' and data->'a'->>'ambitie' = 'Selectieteam') then 'ja' else 'nee' end;

select wie, test, verwacht, uitkomst, uitkomst = verwacht as ok from uitkomst;
rollback;
