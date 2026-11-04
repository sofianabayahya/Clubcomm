-- ClubComm — test Besluit 154 samen met voorstel 032 (meekijken, scope trainerplan). Alleen lokaal, alleen met 032 en 034:
--   EXTRA_SQL=supabase/tests/lokaal/begeleider-werkgebied-032.sql npm run test:veilig -- 032 034
-- De club zet meekijken aan; trainers O10 en O17 hebben een traject. Alles wordt teruggedraaid.
begin;
create temp table uitkomst (wie text, test text, verwacht text, uitkomst text);
insert into auth.users (id, email, aud, role) values
  ('00000000-0000-0000-0000-0000000000f1','wg-f1@t.nl','authenticated','authenticated'),
  ('00000000-0000-0000-0000-0000000000f2','wg-f2@t.nl','authenticated','authenticated'),
  ('00000000-0000-0000-0000-0000000000f3','wg-f3@t.nl','authenticated','authenticated'),
  ('00000000-0000-0000-0000-0000000000f4','wg-f4@t.nl','authenticated','authenticated'),
  ('00000000-0000-0000-0000-0000000000f5','wg-f5@t.nl','authenticated','authenticated'),
  ('00000000-0000-0000-0000-0000000000f6','wg-f6@t.nl','authenticated','authenticated'),
  ('00000000-0000-0000-0000-0000000000f7','wg-f7@t.nl','authenticated','authenticated'),
  ('00000000-0000-0000-0000-0000000000f8','wg-f8@t.nl','authenticated','authenticated');
insert into public.lid (auth_uid, club_id, persoon_id) values
  ('00000000-0000-0000-0000-0000000000f1','wg','HOB'),  -- HO, werkgebied Bovenbouw
  ('00000000-0000-0000-0000-0000000000f2','wg','TCO'),  -- TC, werkgebied Onderbouw
  ('00000000-0000-0000-0000-0000000000f3','wg','HOA'),  -- HO, hele club (zoals DCG)
  ('00000000-0000-0000-0000-0000000000f4','wg','HMB'),  -- HO, Middenbouw + Bovenbouw (zoals Swift)
  ('00000000-0000-0000-0000-0000000000f5','wg','HBX'),  -- HO Bovenbouw én clubbeheerder (admin)
  ('00000000-0000-0000-0000-0000000000f6','wg','BH'),   -- clubbeheerder zonder begeleidersrol
  ('00000000-0000-0000-0000-0000000000f7','wg','TB'),   -- trainer O17
  ('00000000-0000-0000-0000-0000000000f8','wx','HOW');  -- HO hele club van een andere club
insert into public.rij (club_id, soort, id, scope, team_id, speler_id, persoon_id, act_id, data) values
  ('wg','club','club','club',null,null,null,null,'{"naam":"Club WG"}'),
  ('wx','club','club','club',null,null,null,null,'{"naam":"Club WX"}'),
  ('wg','teams','O10-1','club','O10-1',null,null,null,'{"id":"O10-1","cat":"O10","naam":"JO10-1"}'),
  ('wg','teams','O15-1','club','O15-1',null,null,null,'{"id":"O15-1","cat":"O15","naam":"JO15-1"}'),
  ('wg','teams','O17-1','club','O17-1',null,null,null,'{"id":"O17-1","cat":"O17","naam":"JO17-1"}'),
  ('wg','teams','O12-1','club','O12-1',null,null,null,'{"id":"O12-1","cat":"O12","naam":"O13 talententeam"}'),
  ('wg','teams','JO17-2','club','JO17-2',null,null,null,'{"id":"JO17-2","naam":"JO17-2"}'),
  ('wg','teams','MO','club','MO',null,null,null,'{"id":"MO","naam":"Meiden"}'),
  ('wg','people','HOB','persoon',null,null,'HOB',null,'{"id":"HOB","rollen":[{"rol":"hjo","bouwen":["Bovenbouw"]}]}'),
  ('wg','people','TCO','persoon',null,null,'TCO',null,'{"id":"TCO","rollen":[{"rol":"tc","bouwen":["Onderbouw"]}]}'),
  ('wg','people','HOA','persoon',null,null,'HOA',null,'{"id":"HOA","rollen":[{"rol":"hjo"}]}'),
  ('wg','people','HMB','persoon',null,null,'HMB',null,'{"id":"HMB","rollen":[{"rol":"hjo","bouwen":["Middenbouw","Bovenbouw"]}]}'),
  ('wg','people','HBX','persoon',null,null,'HBX',null,'{"id":"HBX","rollen":[{"rol":"hjo","bouwen":["Bovenbouw"]},{"rol":"beheerder"}]}'),
  ('wg','people','BH','persoon',null,null,'BH',null,'{"id":"BH","rollen":[{"rol":"beheerder"}]}'),
  ('wg','people','TA','persoon',null,null,'TA',null,'{"id":"TA","rollen":[{"rol":"trainer","teamId":"O10-1"}]}'),
  ('wg','people','TM','persoon',null,null,'TM',null,'{"id":"TM","rollen":[{"rol":"trainer","teamId":"O15-1"}]}'),
  ('wg','people','TB','persoon',null,null,'TB',null,'{"id":"TB","rollen":[{"rol":"trainer","teamId":"O17-1"}]}'),
  ('wg','people','TD','persoon',null,null,'TD',null,'{"id":"TD","rollen":[{"rol":"trainer","teamId":"O10-1"},{"rol":"trainer","teamId":"O17-1"}]}'),
  ('wg','people','TZ','persoon',null,null,'TZ',null,'{"id":"TZ","rollen":[{"rol":"ouder"}]}'),
  ('wg','people','TK','persoon',null,null,'TK',null,'{"id":"TK","rollen":[{"rol":"trainer","teamId":"O12-1"}]}'),
  ('wg','people','TJ','persoon',null,null,'TJ',null,'{"id":"TJ","rollen":[{"rol":"trainer","teamId":"JO17-2"}]}'),
  ('wg','people','TO','persoon',null,null,'TO',null,'{"id":"TO","rollen":[{"rol":"trainer","teamId":"MO"}]}'),
  ('wx','people','HOW','persoon',null,null,'HOW',null,'{"id":"HOW","rollen":[{"rol":"hjo"}]}'),
  ('wg','trainerDossier','TA','trainerdossier',null,null,'TA',null,'{"traject":{"actief":true}}'),
  ('wg','trainerDossier','TM','trainerdossier',null,null,'TM',null,'{"traject":{"actief":true}}'),
  ('wg','trainerDossier','TB','trainerdossier',null,null,'TB',null,'{"traject":{"actief":true}}'),
  ('wg','trainerDossier','TD','trainerdossier',null,null,'TD',null,'{"traject":{"actief":true}}'),
  ('wg','trainerDossier','TZ','trainerdossier',null,null,'TZ',null,'{"traject":{"actief":true}}'),
  ('wg','trainerDossier','TK','trainerdossier',null,null,'TK',null,'{"traject":{"actief":true}}'),
  ('wg','trainerDossier','TJ','trainerdossier',null,null,'TJ',null,'{"traject":{"actief":true}}'),
  ('wg','trainerDossier','TO','trainerdossier',null,null,'TO',null,'{"traject":{"actief":true}}'),
  ('wg','begeleidMomenten','BMB','trainerdossier','O17-1',null,'TB',null,'{"id":"BMB","trainerId":"TB","teamId":"O17-1"}'),
  ('wg','begeleidMomenten','BMA','trainerdossier','O10-1',null,'TA',null,'{"id":"BMA","trainerId":"TA","teamId":"O10-1"}'),
  ('wg','trainerKennis','TB','trainerzelf',null,null,'TB',null,'{"gevraagd":"2026-10-01","ingevuld":"2026-10-02","a":{"ervaring":"3 jaar"}}'),
  ('wg','begeleidZelf','RA','trainerzelf',null,null,'TA',null,'{"trainerId":"TA","r":{"r1":"Eigen tekst"}}');

create function pg_temp.als(uid text, wie text, test text, verwacht text, q text) returns void language plpgsql as $f$
declare n int := 0; u text;
begin
  perform set_config('request.jwt.claims', json_build_object('sub','00000000-0000-0000-0000-0000000000'||uid,'email','wg-'||uid||'@t.nl','role','authenticated')::text, true);
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
create function pg_temp.dossier(p text) returns text language sql as $$ select format('select 1 from public.rij where soort=''trainerDossier'' and id=%L', p) $$;
update public.rij set data = data || '{"begeleiderKijktMee":true}' where club_id='wg' and soort='club' and id='club';
insert into public.rij (club_id, soort, id, scope, team_id, speler_id, persoon_id, act_id, data) values
  ('wg','trainingsplannen','PA','trainerplan','O10-1',null,'TA',null,'{"id":"PA","eigenaar":"TA"}'),
  ('wg','trainingsplannen','PB','trainerplan','O17-1',null,'TB',null,'{"id":"PB","eigenaar":"TB"}');
select pg_temp.als('f1','HO Bovenbouw','kijkt mee bij trainer O17','mag',$$select 1 from public.rij where soort='trainingsplannen' and id='PB'$$);
select pg_temp.als('f1','HO Bovenbouw','kijkt mee bij trainer O10','weigert',$$select 1 from public.rij where soort='trainingsplannen' and id='PA'$$);
select pg_temp.als('f2','TC Onderbouw','kijkt mee bij trainer O10','mag',$$select 1 from public.rij where soort='trainingsplannen' and id='PA'$$);
select pg_temp.als('f3','HO hele club','kijkt mee bij trainer O10','mag',$$select 1 from public.rij where soort='trainingsplannen' and id='PA'$$);
select pg_temp.als('f1','HO Bovenbouw','wijzigt training trainer O17','weigert',$$update public.rij set data = data || '{"x":1}' where soort='trainingsplannen' and id='PB'$$);
select pg_temp.als('f7','Trainer O17','wijzigt eigen training','mag',$$update public.rij set data = data || '{"x":1}' where soort='trainingsplannen' and id='PB'$$);
select pg_temp.als('f6','Beheerder zonder begeleidersrol','kijkt mee bij trainer O17','weigert',$$select 1 from public.rij where soort='trainingsplannen' and id='PB'$$);

select wie, test, verwacht, uitkomst, uitkomst = verwacht as ok from uitkomst;
rollback;
