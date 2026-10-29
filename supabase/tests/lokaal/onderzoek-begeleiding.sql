-- ClubComm — onderzoek (Voorstel Spoor 3, maat L): twee beveiligingsvragen rond de begeleidingsroute. Alleen lokaal
-- (rechtentest-lokaal.sh), alles in één transactie die wordt teruggedraaid. "verwacht" = het GEWENSTE beleid
-- (Spoor 2, 29-10): een uitkomst die afwijkt, bewijst dat het huidige systeem anders werkt dan gewenst.
--   A. De trainer is eigenaar van zijn zelfreflectie (scope trainerzelf): de begeleider leest, maar wijzigt niets.
--   B. Een account dat in twee clubs voorkomt (zelfde e-mail), werkt nooit in de verkeerde clubcontext.
begin;
create temp table uitkomst (wie text, test text, verwacht text, uitkomst text);
insert into auth.users (id, email, aud, role) values
  ('00000000-0000-0000-0000-0000000000d1','ob-trainer@t.nl','authenticated','authenticated'),
  ('00000000-0000-0000-0000-0000000000d2','ob-ho@t.nl','authenticated','authenticated'),
  ('00000000-0000-0000-0000-0000000000d3','ob-tc@t.nl','authenticated','authenticated'),
  ('00000000-0000-0000-0000-0000000000d4','ob-beheer@t.nl','authenticated','authenticated'),
  ('00000000-0000-0000-0000-0000000000d5','ob-trainer2@t.nl','authenticated','authenticated'),
  ('00000000-0000-0000-0000-0000000000d6','ob-twee@t.nl','authenticated','authenticated');
insert into public.lid (auth_uid, club_id, persoon_id) values
  ('00000000-0000-0000-0000-0000000000d1','obA','TR'), ('00000000-0000-0000-0000-0000000000d2','obA','HO'),
  ('00000000-0000-0000-0000-0000000000d3','obA','TC'), ('00000000-0000-0000-0000-0000000000d4','obA','BH'),
  ('00000000-0000-0000-0000-0000000000d5','obA','T2');
insert into public.rij (club_id, soort, id, scope, team_id, speler_id, persoon_id, act_id, data) values
  ('obA','club','club','club',null,null,null,null,'{"naam":"Club A"}'),
  ('obA','people','TR','persoon',null,null,'TR',null,'{"id":"TR","rollen":[{"rol":"trainer","teamId":"T1"}]}'),
  ('obA','people','T2','persoon',null,null,'T2',null,'{"id":"T2","rollen":[{"rol":"trainer","teamId":"T2"}]}'),
  ('obA','people','HO','persoon',null,null,'HO',null,'{"id":"HO","rollen":[{"rol":"hjo"}]}'),
  ('obA','people','TC','persoon',null,null,'TC',null,'{"id":"TC","rollen":[{"rol":"tc","bouwen":["Bovenbouw"]}]}'),
  ('obA','people','BH','persoon',null,null,'BH',null,'{"id":"BH","rollen":[{"rol":"beheerder"}]}'),
  ('obA','begeleidZelf','M1','trainerzelf',null,null,'TR',null,'{"trainerId":"TR","reflectieOp":"2026-10-20T20:00:00Z","r":{"r1":"Eigen tekst"}}'),
  ('obA','trainerDossier','TR','trainerdossier',null,null,'TR',null,'{"traject":{"actief":true}}'),
  -- B: dezelfde persoon (zelfde e-mail) als contact in twee clubs
  ('obA','contact','XA','contact',null,null,'XA',null,'{"email":"ob-twee@t.nl"}'),
  ('obA','people','XA','persoon',null,null,'XA',null,'{"id":"XA","rollen":[{"rol":"hjo"}]}'),
  ('obB','club','club','club',null,null,null,null,'{"naam":"Club B"}'),
  ('obB','contact','XB','contact',null,null,'XB',null,'{"email":"ob-twee@t.nl"}'),
  ('obB','people','XB','persoon',null,null,'XB',null,'{"id":"XB","rollen":[{"rol":"hjo"},{"rol":"beheerder"}]}'),
  ('obB','begeleidZelf','MB','trainerzelf',null,null,'YB',null,'{"trainerId":"YB","r":{"r1":"Club B"}}');
update public.rij set bijgewerkt = now() - interval '1 day' where club_id = 'obA' and soort = 'contact' and id = 'XA';

-- Elke controle draait in een eigen subtransactie die daarna wordt teruggedraaid: een geslaagde wijziging of verwijdering
-- beïnvloedt de volgende controles niet. pg_temp.blijvend (zonder terugdraaien) alleen voor het koppelen bij inloggen.
create function pg_temp.als(uid text, email text, wie text, test text, verwacht text, q text) returns void language plpgsql as $f$
declare n int := 0; u text;
begin
  perform set_config('request.jwt.claims', json_build_object('sub','00000000-0000-0000-0000-0000000000'||uid,'email',email,'role','authenticated')::text, true);
  begin
    execute 'set local role authenticated';
    execute q; get diagnostics n = row_count;
    raise exception 'cc_terug';
  exception when others then
    u := case when sqlerrm = 'cc_terug' and n > 0 then 'mag' else 'weigert' end;
  end;
  execute 'reset role';
  insert into uitkomst values (wie, test, verwacht, u);
end $f$;
create function pg_temp.blijvend(uid text, email text, q text) returns void language plpgsql as $f$
begin
  perform set_config('request.jwt.claims', json_build_object('sub','00000000-0000-0000-0000-0000000000'||uid,'email',email,'role','authenticated')::text, true);
  execute 'set local role authenticated'; execute q; execute 'reset role';
end $f$;

-- A. Zelfreflectie (begeleidZelf, scope trainerzelf)
select pg_temp.als('d1','ob-trainer@t.nl','Trainer','leest eigen reflectie','mag',$$select 1 from public.rij where club_id='obA' and soort='begeleidZelf' and id='M1'$$);
select pg_temp.als('d1','ob-trainer@t.nl','Trainer','wijzigt eigen reflectie','mag',$$update public.rij set data = jsonb_set(data,'{r,r1}','"Nieuw"') where club_id='obA' and soort='begeleidZelf' and id='M1'$$);
select pg_temp.als('d2','ob-ho@t.nl','HO','leest reflectie trainer','mag',$$select 1 from public.rij where club_id='obA' and soort='begeleidZelf' and id='M1'$$);
select pg_temp.als('d2','ob-ho@t.nl','HO','wijzigt reflectietekst trainer','weigert',$$update public.rij set data = jsonb_set(data,'{r,r1}','"Door HO"') where club_id='obA' and soort='begeleidZelf' and id='M1'$$);
select pg_temp.als('d2','ob-ho@t.nl','HO','verwijdert reflectie trainer','weigert',$$delete from public.rij where club_id='obA' and soort='begeleidZelf' and id='M1'$$);
select pg_temp.als('d2','ob-ho@t.nl','HO','maakt reflectie aan op naam van trainer','weigert',$$insert into public.rij (club_id,soort,id,scope,persoon_id,data) values ('obA','begeleidZelf','M2','trainerzelf','TR','{"trainerId":"TR","r":{"r1":"Door HO"}}')$$);
select pg_temp.als('d3','ob-tc@t.nl','TC','leest reflectie trainer','mag',$$select 1 from public.rij where club_id='obA' and soort='begeleidZelf' and id='M1'$$);
select pg_temp.als('d3','ob-tc@t.nl','TC','wijzigt reflectietekst trainer','weigert',$$update public.rij set data = jsonb_set(data,'{r,r1}','"Door TC"') where club_id='obA' and soort='begeleidZelf' and id='M1'$$);
select pg_temp.als('d4','ob-beheer@t.nl','Clubbeheerder (geen begeleider)','leest reflectie trainer','weigert',$$select 1 from public.rij where club_id='obA' and soort='begeleidZelf' and id='M1'$$);
select pg_temp.als('d4','ob-beheer@t.nl','Clubbeheerder (geen begeleider)','wijzigt reflectie trainer','weigert',$$update public.rij set data = jsonb_set(data,'{r,r1}','"Door beheerder"') where club_id='obA' and soort='begeleidZelf' and id='M1'$$);
select pg_temp.als('d5','ob-trainer2@t.nl','Andere trainer','leest reflectie trainer','weigert',$$select 1 from public.rij where club_id='obA' and soort='begeleidZelf' and id='M1'$$);
select pg_temp.als('d5','ob-trainer2@t.nl','Andere trainer','wijzigt reflectie trainer','weigert',$$update public.rij set data = jsonb_set(data,'{r,r1}','"x"') where club_id='obA' and soort='begeleidZelf' and id='M1'$$);
select pg_temp.als('d4','ob-beheer@t.nl','Clubbeheerder (geen begeleider)','wijzigt dossier trainer','weigert',$$update public.rij set data = data || '{"x":1}' where club_id='obA' and soort='trainerDossier' and id='TR'$$);

-- B. Eén account, zelfde e-mail in twee clubs
select pg_temp.blijvend('d6','ob-twee@t.nl',$$select * from public.koppel_mij()$$);
insert into uitkomst select 'Account in twee clubs', 'aantal clubs na koppelen', '1', count(*)::text from public.lid where auth_uid = '00000000-0000-0000-0000-0000000000d6';
insert into uitkomst select 'Account in twee clubs', 'gekoppelde club is de oudste contactregel (vast, niet willekeurig)', 'obA', coalesce(max(club_id),'geen') from public.lid where auth_uid = '00000000-0000-0000-0000-0000000000d6';
select pg_temp.als('d6','ob-twee@t.nl','Account in twee clubs','koppelt opnieuw (geen tweede club)','mag',$$select * from public.koppel_mij() where club_id = 'obA'$$);
select pg_temp.als('d6','ob-twee@t.nl','Account in twee clubs','leest eigen (gekoppelde) club (controle)','mag',$$select 1 from public.rij where club_id='obA'$$);
select pg_temp.als('d6','ob-twee@t.nl','Account in twee clubs','leest rijen van de andere club','weigert',$$select 1 from public.rij where club_id='obB'$$);
select pg_temp.als('d6','ob-twee@t.nl','Account in twee clubs','leest reflectie in de andere club','weigert',$$select 1 from public.rij where club_id='obB' and soort='begeleidZelf'$$);
select pg_temp.als('d6','ob-twee@t.nl','Account in twee clubs','wijzigt in de andere club','weigert',$$update public.rij set data = data || '{"x":1}' where club_id='obB'$$);
select pg_temp.als('d6','ob-twee@t.nl','Account in twee clubs','schrijft rij met club-id van de andere club','weigert',$$insert into public.rij (club_id,soort,id,scope,data) values ('obB','teams','TX','club','{}')$$);
select pg_temp.als('d6','ob-twee@t.nl','Account in twee clubs','maakt zichzelf lid van de andere club','weigert',$$insert into public.lid (auth_uid, club_id, persoon_id) values ('00000000-0000-0000-0000-0000000000d6','obB','XB')$$);
do $$ declare u text; begin
  begin insert into public.lid (auth_uid, club_id, persoon_id) values ('00000000-0000-0000-0000-0000000000d6','obB','XB'); u := 'mag';
  exception when unique_violation then u := 'weigert'; end;
  insert into uitkomst values ('Database zelf', 'tweede lidmaatschap voor hetzelfde account (ook als eigenaar)', 'weigert', u);
end $$;

select wie, test, verwacht, uitkomst, uitkomst = verwacht as ok from uitkomst;
rollback;
