-- Test van de rechten per rol (RLS). Ruimt de testgegevens aan het begin en eind op.
-- Club "test": teams T1 (O10) en T2 (O8). HJO, coördinator O10–O12, trainer en teamleider T1,
-- ouder P1 (kind K1 in T1), ouder P2 (kind K2 in T1), ouder P3 (kind K3 in T2).
-- opruimen van een eventuele vorige run
delete from public.lid where club_id = 'test';
delete from public.rij where club_id = 'test';
delete from auth.users where id::text like '00000000-0000-0000-0000-0000000000a_';
drop table if exists uit;
create temp table uit (wie text, test text, uitkomst text);
grant all on uit to authenticated;

insert into auth.users (id, email, aud, role, instance_id) values
 ('00000000-0000-0000-0000-0000000000a1','hjo@t.nl','authenticated','authenticated','00000000-0000-0000-0000-000000000000'),
 ('00000000-0000-0000-0000-0000000000a2','coord@t.nl','authenticated','authenticated','00000000-0000-0000-0000-000000000000'),
 ('00000000-0000-0000-0000-0000000000a3','trainer@t.nl','authenticated','authenticated','00000000-0000-0000-0000-000000000000'),
 ('00000000-0000-0000-0000-0000000000a4','tl@t.nl','authenticated','authenticated','00000000-0000-0000-0000-000000000000'),
 ('00000000-0000-0000-0000-0000000000a5','p1@t.nl','authenticated','authenticated','00000000-0000-0000-0000-000000000000'),
 ('00000000-0000-0000-0000-0000000000a6','p2@t.nl','authenticated','authenticated','00000000-0000-0000-0000-000000000000'),
 ('00000000-0000-0000-0000-0000000000a7','p3@t.nl','authenticated','authenticated','00000000-0000-0000-0000-000000000000'),
 ('00000000-0000-0000-0000-0000000000a8','nieuw@t.nl','authenticated','authenticated','00000000-0000-0000-0000-000000000000');

insert into public.rij (club_id, soort, id, scope, team_id, speler_id, persoon_id, act_id, data) values
 ('test','club','club','club',null,null,null,null,'{"naam":"Testclub"}'),
 ('test','teams','T1','club','T1',null,null,null,'{"id":"T1","cat":"O10"}'),
 ('test','teams','T2','club','T2',null,null,null,'{"id":"T2","cat":"O8"}'),
 ('test','people','H','persoon',null,null,'H',null,'{"id":"H","naam":"Hanna","rollen":[{"rol":"hjo"}]}'),
 ('test','people','C','persoon',null,null,'C',null,'{"id":"C","naam":"Cor","rollen":[{"rol":"coordinator","cats":["O10","O11","O12"]}]}'),
 ('test','people','TR','persoon',null,null,'TR',null,'{"id":"TR","naam":"Tim","rollen":[{"rol":"trainer","teamId":"T1"}]}'),
 ('test','people','TL','persoon',null,null,'TL',null,'{"id":"TL","naam":"Tess","rollen":[{"rol":"teamleider","teamId":"T1"}]}'),
 ('test','people','P1','persoon',null,null,'P1',null,'{"id":"P1","naam":"Piet","rollen":[{"rol":"ouder"}]}'),
 ('test','people','P2','persoon',null,null,'P2',null,'{"id":"P2","naam":"Paula","rollen":[{"rol":"ouder"}]}'),
 ('test','people','P3','persoon',null,null,'P3',null,'{"id":"P3","naam":"Pim","rollen":[{"rol":"ouder"}]}'),
 ('test','contact','H','contact',null,null,'H',null,'{"email":"hjo@t.nl","tel":"0600000001"}'),
 ('test','contact','C','contact',null,null,'C',null,'{"email":"coord@t.nl","tel":"0600000002"}'),
 ('test','contact','TR','contact',null,null,'TR',null,'{"email":"trainer@t.nl","tel":"0600000003"}'),
 ('test','contact','TL','contact',null,null,'TL',null,'{"email":"tl@t.nl","tel":"0600000004"}'),
 ('test','contact','P1','contact',null,null,'P1',null,'{"email":"p1@t.nl","tel":"0600000005"}'),
 ('test','contact','P2','contact',null,null,'P2',null,'{"email":"p2@t.nl","tel":"0600000006"}'),
 ('test','contact','P3','contact',null,null,'P3',null,'{"email":"p3@t.nl","tel":"0600000007"}'),
 ('test','players','K1','kind','T1','K1',null,null,'{"id":"K1","teamId":"T1","ouders":["P1"]}'),
 ('test','players','K2','kind','T1','K2',null,null,'{"id":"K2","teamId":"T1","ouders":["P2"]}'),
 ('test','players','K3','kind','T2','K3',null,null,'{"id":"K3","teamId":"T2","ouders":["P3"]}'),
 ('test','acts','A1','team','T1',null,null,'A1','{"id":"A1","teamId":"T1","datum":"2030-01-01"}'),
 ('test','acts','A2','team','T2',null,null,'A2','{"id":"A2","teamId":"T2","datum":"2030-01-01"}'),
 ('test','afm','F1','speler','T1','K1',null,'A1','{"reden":"Ziek","opm":"griep"}'),
 ('test','afm','F2','speler','T1','K2',null,'A1','{"reden":"Blessure","opm":"enkel"}'),
 ('test','afm','F3','speler','T2','K3',null,'A2','{"reden":"Vakantie"}'),
 ('test','pres','A1|K1','act','T1','K1',null,'A1','{"v":"a"}'),
 ('test','pres','A1|K2','act','T1','K2',null,'A1','{"v":"x"}'),
 ('test','beoord','K1','beoord','T1','K1',null,null,'{"m1":{}}'),
 ('test','beoord','K2','beoord','T1','K2',null,null,'{"m1":{}}'),
 ('test','gesprekken','G1','notitie','T1','K1',null,null,'{"notitie":"gebeld"}'),
 ('test','taken','TK1','team','T1',null,null,'A1','{"soort":"Wastas","personId":null}'),
 ('test','trainerLog','L1','teamstaf','T1',null,null,'A1','{"soort":"telaat"}'),
 ('test','trainerGesprekken','TG1','hjo',null,null,null,null,'{}'),
 ('test','msgs','M1','bericht',null,null,null,null,'{"van":"TR","soort":"persoonlijk","ontvangers":["P1"],"gelezen":[],"antw":[],"tekst":"hoi"}'),
 ('test','msgs','M2','bericht',null,null,null,null,'{"van":"H","soort":"nieuws","ontvangers":["P1","P2","P3"],"gelezen":[],"antw":[],"tekst":"club"}'),
 ('test','gezien','P1','eigen',null,null,'P1',null,'{}'),
 ('test','aanm','AN1','aanm','T1',null,null,null,'{"email":"nieuw@t.nl","status":"open"}');

insert into public.lid (auth_uid, club_id, persoon_id) values
 ('00000000-0000-0000-0000-0000000000a1','test','H'), ('00000000-0000-0000-0000-0000000000a2','test','C'),
 ('00000000-0000-0000-0000-0000000000a3','test','TR'), ('00000000-0000-0000-0000-0000000000a4','test','TL'),
 ('00000000-0000-0000-0000-0000000000a5','test','P1'), ('00000000-0000-0000-0000-0000000000a6','test','P2'),
 ('00000000-0000-0000-0000-0000000000a7','test','P3');

-- Wie ziet wat: per gebruiker de zichtbare rijen (soort:id)
create or replace function pg_temp.als(uid text, email text) returns void language plpgsql as $$
begin perform set_config('request.jwt.claims', json_build_object('sub', uid, 'email', email, 'role', 'authenticated')::text, true); end $$;

do $$
declare u record; zicht text; r text;
begin
  for u in select * from (values ('HJO','a1','hjo@t.nl'),('Coord','a2','coord@t.nl'),('Trainer','a3','trainer@t.nl'),('Teamleider','a4','tl@t.nl'),('Ouder P1','a5','p1@t.nl'),('Ouder P3','a7','p3@t.nl'),('Nieuw','a8','nieuw@t.nl')) v(wie, uid, email) loop
    perform pg_temp.als('00000000-0000-0000-0000-0000000000' || u.uid, u.email);
    execute 'set local role authenticated';
    select string_agg(soort || ':' || id, ' ' order by soort, id) into zicht from public.rij
      where soort in ('afm','pres','beoord','gesprekken','contact','msgs','trainerLog','trainerGesprekken','gezien','aanm','taken','acts','players');
    execute 'reset role';
    insert into uit values (u.wie, 'ziet', coalesce(zicht, '(niets)'));
  end loop;
end $$;

-- Schrijfpogingen die moeten mislukken of lukken
do $$
declare t record; ok boolean; fout text;
begin
  for t in select * from (values
    ('Ouder P1','a5','p1@t.nl','geeft zichzelf rol HJO',            $q$update public.rij set data = jsonb_set(data,'{rollen}','[{"rol":"hjo"}]') where club_id='test' and soort='people' and id='P1'$q$),
    ('Ouder P1','a5','p1@t.nl','wijzigt beoordeling eigen kind',    $q$update public.rij set data = '{"m1":{"scores":{"x":3}}}' where club_id='test' and soort='beoord' and id='K1'$q$),
    ('Ouder P1','a5','p1@t.nl','wijzigt aanwezigheid eigen kind',   $q$update public.rij set data = '{"v":"a"}' where club_id='test' and soort='pres' and id='A1|K2'$q$),
    ('Ouder P1','a5','p1@t.nl','meldt eigen kind af',               $q$insert into public.rij (club_id,soort,id,scope,team_id,speler_id,act_id,data) values ('test','afm','F9','speler','T1','K1','A1','{"reden":"Ziek"}')$q$),
    ('Ouder P1','a5','p1@t.nl','meldt ander kind af',               $q$insert into public.rij (club_id,soort,id,scope,team_id,speler_id,act_id,data) values ('test','afm','F8','speler','T1','K2','A1','{"reden":"Ziek"}')$q$),
    ('Ouder P1','a5','p1@t.nl','verandert tekst van bericht trainer',$q$update public.rij set data = jsonb_set(data,'{tekst}','"gehackt"') where club_id='test' and soort='msgs' and id='M1'$q$),
    ('Ouder P1','a5','p1@t.nl','neemt taak',                        $q$update public.rij set data = jsonb_set(data,'{personId}','"P1"') where club_id='test' and soort='taken' and id='TK1'$q$),
    ('Ouder P1','a5','p1@t.nl','verplaatst training',               $q$update public.rij set data = jsonb_set(data,'{datum}','"2030-02-02"') where club_id='test' and soort='acts' and id='A1'$q$),
    ('Ouder P1','a5','p1@t.nl','wordt vervanger bij training',      $q$update public.rij set data = jsonb_set(data,'{vervangerId}','"P1"') where club_id='test' and soort='acts' and id='A1'$q$),
    ('Teamleider','a4','tl@t.nl','wijzigt e-mail van de HJO',       $q$update public.rij set data = jsonb_set(data,'{email}','"tl@t.nl"') where club_id='test' and soort='contact' and id='H'$q$),
    ('Teamleider','a4','tl@t.nl','maakt nieuwe ouder aan',          $q$insert into public.rij (club_id,soort,id,scope,persoon_id,data) values ('test','people','P9','persoon','P9','{"id":"P9","rollen":[{"rol":"ouder"}]}')$q$),
    ('Teamleider','a4','tl@t.nl','maakt nieuwe trainer aan',        $q$insert into public.rij (club_id,soort,id,scope,persoon_id,data) values ('test','people','P8','persoon','P8','{"id":"P8","rollen":[{"rol":"trainer","teamId":"T1"}]}')$q$),
    ('Trainer','a3','trainer@t.nl','neemt aanwezigheid op T1',      $q$update public.rij set data = '{"v":"t"}' where club_id='test' and soort='pres' and id='A1|K1'$q$),
    ('Trainer','a3','trainer@t.nl','schrijft in team T2',           $q$insert into public.rij (club_id,soort,id,scope,team_id,speler_id,act_id,data) values ('test','afm','F7','speler','T2','K3','A2','{}')$q$),
    ('Trainer','a3','trainer@t.nl','beoordeelt speler T1',          $q$update public.rij set data = '{"m1":{"scores":{"x":2}}}' where club_id='test' and soort='beoord' and id='K1'$q$),
    ('Teamleider','a4','tl@t.nl','beoordeelt speler T1',            $q$update public.rij set data = '{"m1":{"scores":{"x":1}}}' where club_id='test' and soort='beoord' and id='K2'$q$),
    ('HJO','a1','hjo@t.nl','maakt coördinator',                     $q$update public.rij set data = jsonb_set(data,'{rollen}','[{"rol":"coordinator","cats":["O8"]}]') where club_id='test' and soort='people' and id='P3'$q$)
  ) v(wie, uid, email, test, sql) loop
    begin
      perform pg_temp.als('00000000-0000-0000-0000-0000000000' || t.uid, t.email);
      execute 'set local role authenticated';
      execute t.sql;
      get diagnostics ok = row_count;
      execute 'reset role';
      insert into uit values (t.wie, t.test, case when ok then 'GELUKT' else 'geweigerd (0 rijen)' end);
    exception when others then
      execute 'reset role';
      insert into uit values (t.wie, t.test, 'geweigerd: ' || sqlerrm);
    end;
  end loop;
end $$;

-- Gelezen markeren via de functie (ontvanger)
do $$ begin
  perform pg_temp.als('00000000-0000-0000-0000-0000000000a5','p1@t.nl'); execute 'set local role authenticated';
  perform public.bericht_bij('M1', true, '[]'); execute 'reset role';
  insert into uit select 'Ouder P1','bericht gelezen', (data->'gelezen')::text from public.rij where club_id='test' and soort='msgs' and id='M1';
end $$;

-- Nieuwe ouder: koppelen lukt niet (geen contact), aanmelden wel
do $$ declare n int; begin
  perform pg_temp.als('00000000-0000-0000-0000-0000000000a8','nieuw@t.nl'); execute 'set local role authenticated';
  select count(*) into n from public.koppel_mij(); execute 'reset role';
  insert into uit values ('Nieuw','koppel_mij', n || ' koppelingen');
end $$;

delete from public.lid where club_id = 'test';
delete from public.rij where club_id = 'test';
delete from auth.users where id::text like '00000000-0000-0000-0000-0000000000a_';
select * from uit;
