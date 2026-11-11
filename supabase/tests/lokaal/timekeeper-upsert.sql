-- ClubComm — wedstrijd bijhouden door de timekeeper (Besluit 116), zoals de app opslaat: met upsert (PostgREST
-- "insert … on conflict do update"), niet met een losse update. Gevonden 07-11: de rechtentest probeerde alleen
-- een update; de app gebruikt upsert, en dan draait de bewaker eerst als INSERT ("Alleen staf kan activiteiten toevoegen").
-- Alleen lokaal (rechtentest-lokaal.sh, EXTRA_SQL); alles in één transactie die wordt teruggedraaid.
begin;
create temp table uitkomst (wie text, test text, verwacht text, uitkomst text, fout text);
insert into auth.users (id, email, aud, role) values
  ('00000000-0000-0000-0000-0000000000d1', 'tk-trainer@t.nl', 'authenticated', 'authenticated'),
  ('00000000-0000-0000-0000-0000000000d2', 'tk-ouder@t.nl', 'authenticated', 'authenticated'),
  ('00000000-0000-0000-0000-0000000000d3', 'tk-andere-ouder@t.nl', 'authenticated', 'authenticated');
insert into public.lid (auth_uid, club_id, persoon_id) values
  ('00000000-0000-0000-0000-0000000000d1', 'tk', 'TR'), ('00000000-0000-0000-0000-0000000000d2', 'tk', 'P1'), ('00000000-0000-0000-0000-0000000000d3', 'tk', 'P2');
insert into public.rij (club_id, soort, id, scope, team_id, speler_id, persoon_id, act_id, data) values
  ('tk','club','club','club',null,null,null,null,'{"naam":"Testclub"}'),
  ('tk','teams','T1','club','T1',null,null,null,'{"id":"T1","cat":"O13","trainerId":"TR"}'),
  ('tk','people','TR','persoon',null,null,'TR',null,'{"id":"TR","naam":"Tim","rollen":[{"rol":"trainer","teamId":"T1"}]}'),
  ('tk','people','P1','persoon',null,null,'P1',null,'{"id":"P1","naam":"Paula","rollen":[{"rol":"ouder"}]}'),
  ('tk','people','P2','persoon',null,null,'P2',null,'{"id":"P2","naam":"Piet","rollen":[{"rol":"ouder"}]}'),
  ('tk','players','K1','kind','T1','K1',null,null,'{"id":"K1","teamId":"T1","ouders":["P1"]}'),
  ('tk','players','K2','kind','T1','K2',null,null,'{"id":"K2","teamId":"T1","ouders":["P2"]}'),
  ('tk','acts','W1','team','T1',null,null,'W1', jsonb_build_object('id','W1','teamId','T1','soort','wedstrijd','datum',to_char(current_date,'YYYY-MM-DD'),'tijd','12:30','uitslag',null)),
  ('tk','taken','TK','team','T1',null,null,'W1','{"id":"TK","actId":"W1","soort":"Timekeeper","personId":"P1"}');

create temp table poging (wie text, uid text, test text, verwacht text, sql text);
insert into poging values
  ('Timekeeper', 'd2', 'doelpunt opslaan met update', 'mag',
   $q$update public.rij set data = data || '{"goals":[{"id":"g1","wij":true}]}' where club_id='tk' and soort='acts' and id='W1'$q$),
  ('Timekeeper', 'd2', 'doelpunt opslaan met upsert (zoals de app)', 'mag',
   $q$insert into public.rij (club_id,soort,id,scope,team_id,speler_id,persoon_id,act_id,data)
      select club_id,soort,id,scope,team_id,speler_id,persoon_id,act_id, data || '{"goals":[{"id":"g2","wij":true}]}' from public.rij where club_id='tk' and soort='acts' and id='W1'
      on conflict (club_id,soort,id) do update set scope=excluded.scope, team_id=excluded.team_id, speler_id=excluded.speler_id,
        persoon_id=excluded.persoon_id, act_id=excluded.act_id, data=excluded.data$q$),
  ('Timekeeper', 'd2', 'uitslag opslaan met upsert (zoals de app)', 'mag',
   $q$insert into public.rij (club_id,soort,id,scope,team_id,speler_id,persoon_id,act_id,data)
      select club_id,soort,id,scope,team_id,speler_id,persoon_id,act_id, data || '{"uitslag":"7-2","uitslagKlaar":true}' from public.rij where club_id='tk' and soort='acts' and id='W1'
      on conflict (club_id,soort,id) do update set data=excluded.data$q$),
  ('Timekeeper', 'd2', 'aanvangstijd wijzigen met upsert', 'weigert',
   $q$insert into public.rij (club_id,soort,id,scope,team_id,act_id,data)
      select club_id,soort,id,scope,team_id,act_id, jsonb_set(data,'{tijd}','"11:00"') from public.rij where club_id='tk' and soort='acts' and id='W1'
      on conflict (club_id,soort,id) do update set data=excluded.data$q$),
  ('Ouder zonder taak', 'd3', 'doelpunt opslaan met upsert', 'weigert',
   $q$insert into public.rij (club_id,soort,id,scope,team_id,act_id,data)
      select club_id,soort,id,scope,team_id,act_id, data || '{"goals":[]}' from public.rij where club_id='tk' and soort='acts' and id='W1'
      on conflict (club_id,soort,id) do update set data=excluded.data$q$),
  ('Ouder', 'd3', 'team van de wedstrijd wijzigen met upsert', 'weigert',
   $q$insert into public.rij (club_id,soort,id,scope,team_id,act_id,data)
      select club_id,soort,id,scope,'T9',act_id,data from public.rij where club_id='tk' and soort='acts' and id='W1'
      on conflict (club_id,soort,id) do update set team_id=excluded.team_id$q$),
  ('Ouder', 'd3', 'nieuwe wedstrijd toevoegen', 'weigert',
   $q$insert into public.rij (club_id,soort,id,scope,team_id,act_id,data) values ('tk','acts','W9','team','T1','W9','{"id":"W9","soort":"wedstrijd"}')$q$),
  ('Trainer', 'd1', 'doelpunt opslaan met upsert', 'mag',
   $q$insert into public.rij (club_id,soort,id,scope,team_id,act_id,data)
      select club_id,soort,id,scope,team_id,act_id, data || '{"goals":[{"id":"g3","wij":true}]}' from public.rij where club_id='tk' and soort='acts' and id='W1'
      on conflict (club_id,soort,id) do update set data=excluded.data$q$);

do $$
declare t record; n int;
begin
  for t in select * from poging loop
    begin
      perform set_config('request.jwt.claims', json_build_object('sub', '00000000-0000-0000-0000-0000000000' || t.uid, 'role', 'authenticated')::text, true);
      execute 'set local role authenticated';
      execute t.sql; get diagnostics n = row_count;
      execute 'reset role';
      insert into uitkomst values (t.wie, t.test, t.verwacht, case when n > 0 then 'mag' else 'weigert' end, '');
    exception when others then
      execute 'reset role';
      insert into uitkomst values (t.wie, t.test, t.verwacht, 'weigert', sqlerrm);
    end;
  end loop;
end $$;

select wie, test || case when fout <> '' and uitkomst <> verwacht then ' — ' || fout else '' end, verwacht, uitkomst, uitkomst = verwacht from uitkomst;
rollback;
