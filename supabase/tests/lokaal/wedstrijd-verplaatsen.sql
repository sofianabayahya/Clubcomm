-- ClubComm — Besluit 184: wedstrijd naar een andere dag. De app laat afmeldingen, taken en vervoer van de oude dag vervallen,
-- precies zoals de app opslaat (upsert; vervoer: rij weghalen). Mag de teamleider dat voor zijn eigen team, en niet voor een ander team?
-- Mag een ouder het niet voor een ander gezin? Alleen lokaal (rechtentest-lokaal.sh); alles in één transactie die wordt teruggedraaid.
begin;
create temp table uitkomst (wie text, test text, verwacht text, uitkomst text, fout text);
insert into auth.users (id, email, aud, role) values
  ('00000000-0000-0000-0000-0000000000e1', 'wv-tl@t.nl', 'authenticated', 'authenticated'),
  ('00000000-0000-0000-0000-0000000000e2', 'wv-ouder1@t.nl', 'authenticated', 'authenticated'),
  ('00000000-0000-0000-0000-0000000000e3', 'wv-ouder2@t.nl', 'authenticated', 'authenticated'),
  ('00000000-0000-0000-0000-0000000000e4', 'wv-tl-ander@t.nl', 'authenticated', 'authenticated');
insert into public.lid (auth_uid, club_id, persoon_id) values
  ('00000000-0000-0000-0000-0000000000e1', 'wv', 'TL'), ('00000000-0000-0000-0000-0000000000e2', 'wv', 'P1'),
  ('00000000-0000-0000-0000-0000000000e3', 'wv', 'P2'), ('00000000-0000-0000-0000-0000000000e4', 'wv', 'TL2');
insert into public.rij (club_id, soort, id, scope, team_id, speler_id, persoon_id, act_id, data) values
  ('wv','club','club','club',null,null,null,null,'{"naam":"Testclub"}'),
  ('wv','teams','T1','club','T1',null,null,null,'{"id":"T1","cat":"O13"}'),
  ('wv','teams','T2','club','T2',null,null,null,'{"id":"T2","cat":"O11"}'),
  ('wv','people','TL','persoon',null,null,'TL',null,'{"id":"TL","naam":"Tess","rollen":[{"rol":"teamleider","teamId":"T1"}]}'),
  ('wv','people','TL2','persoon',null,null,'TL2',null,'{"id":"TL2","naam":"Bas","rollen":[{"rol":"teamleider","teamId":"T2"}]}'),
  ('wv','people','P1','persoon',null,null,'P1',null,'{"id":"P1","naam":"Paula","rollen":[{"rol":"ouder"}]}'),
  ('wv','people','P2','persoon',null,null,'P2',null,'{"id":"P2","naam":"Piet","rollen":[{"rol":"ouder"}]}'),
  ('wv','players','K1','kind','T1','K1',null,null,'{"id":"K1","teamId":"T1","ouders":["P1"]}'),
  ('wv','players','K2','kind','T1','K2',null,null,'{"id":"K2","teamId":"T1","ouders":["P2"]}'),
  ('wv','acts','W1','team','T1',null,null,'W1','{"id":"W1","teamId":"T1","soort":"wedstrijd","datum":"2026-11-14","tijd":"12:45"}'),
  ('wv','afm','F1','speler','T1','K1',null,'W1','{"id":"F1","spelerId":"K1","actId":"W1","reden":"Ziek"}'),
  ('wv','taken','TK1','team','T1',null,null,'W1','{"id":"TK1","actId":"W1","soort":"Vlagger","personId":"P2"}'),
  ('wv','vervoerAanbod','W1|P2','team','T1',null,'P2','W1','{"personId":"P2","plekken":3}');

create temp table poging (wie text, uid text, test text, verwacht text, sql text);
insert into poging values
  ('Teamleider T1', 'e1', 'wedstrijd naar andere dag (upsert)', 'mag',
   $q$insert into public.rij (club_id,soort,id,scope,team_id,act_id,data) select club_id,soort,id,scope,team_id,act_id, data || '{"datum":"2026-11-25"}' from public.rij where club_id='wv' and soort='acts' and id='W1'
      on conflict (club_id,soort,id) do update set data=excluded.data$q$),
  ('Teamleider T1', 'e1', 'afmelding van een ouder laten vervallen (upsert, act_id leeg)', 'mag',
   $q$insert into public.rij (club_id,soort,id,scope,team_id,speler_id,act_id,data) values ('wv','afm','F1','speler','T1','K1',null,'{"id":"F1","spelerId":"K1","actId":null,"reden":"Ziek","vervallen":{"actId":"W1","datum":"2026-11-14"}}')
      on conflict (club_id,soort,id) do update set act_id=excluded.act_id, data=excluded.data$q$),
  ('Teamleider T1', 'e1', 'taak vrijgeven (upsert)', 'mag',
   $q$insert into public.rij (club_id,soort,id,scope,team_id,act_id,data) values ('wv','taken','TK1','team','T1','W1','{"id":"TK1","actId":"W1","soort":"Vlagger","personId":null,"vervallen":{"personId":"P2"}}')
      on conflict (club_id,soort,id) do update set data=excluded.data$q$),
  ('Teamleider T1', 'e1', 'vervoer van een ouder weghalen', 'mag',
   $q$delete from public.rij where club_id='wv' and soort='vervoerAanbod' and id='W1|P2'$q$),
  ('Teamleider T2 (ander team)', 'e4', 'afmelding in T1 laten vervallen', 'weigert',
   $q$update public.rij set act_id=null, data = data || '{"vervallen":true}' where club_id='wv' and soort='afm' and id='F1'$q$),
  ('Teamleider T2 (ander team)', 'e4', 'taak in T1 vrijgeven', 'weigert',
   $q$update public.rij set data = jsonb_set(data,'{personId}','null') where club_id='wv' and soort='taken' and id='TK1'$q$),
  ('Ouder P1', 'e2', 'afmelding van ander kind laten vervallen', 'weigert',
   $q$insert into public.rij (club_id,soort,id,scope,team_id,speler_id,act_id,data) values ('wv','afm','F1','speler','T1','K2',null,'{"id":"F1"}')
      on conflict (club_id,soort,id) do update set act_id=excluded.act_id, data=excluded.data$q$),
  ('Ouder P1', 'e2', 'wedstrijd naar andere dag', 'weigert',
   $q$update public.rij set data = data || '{"datum":"2026-11-26"}' where club_id='wv' and soort='acts' and id='W1'$q$);

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
