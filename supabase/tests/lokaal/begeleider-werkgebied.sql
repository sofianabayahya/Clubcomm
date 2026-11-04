-- ClubComm — test Besluit 154 (voorstel 034): een begeleider ziet alleen trainers in zijn werkgebied. Alleen lokaal:
--   EXTRA_SQL=supabase/tests/lokaal/begeleider-werkgebied.sql npm run test:veilig -- 034
-- Alles in één transactie die wordt teruggedraaid; elke controle in een eigen subtransactie. "verwacht" = het beleid van
-- Besluit 154; zonder 034 wijken de controles met "weigert" voor een begeleider buiten zijn werkgebied af.
-- Club WG gebruikt de standaardbouwen (Onderbouw 8–12, Middenbouw 13–15, Bovenbouw 16–19), zoals DCG en Swift op 4-11.
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

-- 1–2. HO Bovenbouw: wel de O17-trainer, niet de O10-trainer
select pg_temp.als('f1','HO Bovenbouw','1 leest dossier trainer O17','mag', pg_temp.dossier('TB'));
select pg_temp.als('f1','HO Bovenbouw','2 leest dossier trainer O10','weigert', pg_temp.dossier('TA'));
select pg_temp.als('f1','HO Bovenbouw','2 leest begeleidingsmoment trainer O10','weigert',$$select 1 from public.rij where soort='begeleidMomenten' and id='BMA'$$);
select pg_temp.als('f1','HO Bovenbouw','2 leest reflectie trainer O10','weigert',$$select 1 from public.rij where soort='begeleidZelf' and id='RA'$$);
select pg_temp.als('f1','HO Bovenbouw','2 maakt moment aan voor trainer O10','weigert',$$insert into public.rij (club_id,soort,id,scope,team_id,persoon_id,data) values ('wg','begeleidMomenten','BMX','trainerdossier','O10-1','TA','{"trainerId":"TA"}')$$);
select pg_temp.als('f1','HO Bovenbouw','2 zet moment van O17 op naam van trainer O10','weigert',$$update public.rij set persoon_id='TA' where soort='begeleidMomenten' and id='BMB'$$);
-- 3. TC Onderbouw: niet schrijven bij de O17-trainer, wel lezen bij de O10-trainer
select pg_temp.als('f2','TC Onderbouw','3 schrijft observatie bij trainer O17','weigert',$$update public.rij set data = data || '{"obs":{}}' where soort='begeleidMomenten' and id='BMB'$$);
select pg_temp.als('f2','TC Onderbouw','3 schrijft observatie bij trainer O10','mag',$$update public.rij set data = data || '{"obs":{}}' where soort='begeleidMomenten' and id='BMA'$$);
select pg_temp.als('f2','TC Onderbouw','3 leest dossier trainer O10','mag', pg_temp.dossier('TA'));
-- 4. HO hele club (zoals DCG): alles
select pg_temp.als('f3','HO hele club','4 leest dossier trainer O10','mag', pg_temp.dossier('TA'));
select pg_temp.als('f3','HO hele club','4 leest dossier trainer O17','mag', pg_temp.dossier('TB'));
-- 5. Trainer van O10 én O17: beide werkgebieden
select pg_temp.als('f1','HO Bovenbouw','5 leest dossier trainer O10+O17','mag', pg_temp.dossier('TD'));
select pg_temp.als('f2','TC Onderbouw','5 leest dossier trainer O10+O17','mag', pg_temp.dossier('TD'));
-- 6. Persoon zonder trainersteam en team zonder leeftijd: alleen de hele club
select pg_temp.als('f1','HO Bovenbouw','6 leest dossier persoon zonder team','weigert', pg_temp.dossier('TZ'));
select pg_temp.als('f3','HO hele club','6 leest dossier persoon zonder team','mag', pg_temp.dossier('TZ'));
select pg_temp.als('f1','HO Bovenbouw','6 leest dossier trainer team zonder leeftijd','weigert', pg_temp.dossier('TO'));
select pg_temp.als('f3','HO hele club','6 leest dossier trainer team zonder leeftijd','mag', pg_temp.dossier('TO'));
-- Bouw uit de teamcode als er geen categorie is (JO17-2 → Bovenbouw)
select pg_temp.als('f1','HO Bovenbouw','bouw uit teamcode JO17-2','mag', pg_temp.dossier('TJ'));
-- Zoals DCG: categorie O12 ("O13 talententeam") telt als Onderbouw
select pg_temp.als('f2','TC Onderbouw','categorie O12 telt als Onderbouw','mag', pg_temp.dossier('TK'));
select pg_temp.als('f1','HO Bovenbouw','categorie O12 is geen Bovenbouw','weigert', pg_temp.dossier('TK'));
-- 7–8. De trainer zelf en de regels van 033 blijven gelden
select pg_temp.als('f7','Trainer O17','7 leest eigen dossier','mag', pg_temp.dossier('TB'));
select pg_temp.als('f7','Trainer O17','7 vult eigen kennismaking in','mag',$$update public.rij set data = jsonb_set(data,'{a,ambitie}','"Selectie"') where soort='trainerKennis' and id='TB'$$);
select pg_temp.als('f7','Trainer O17','7 leest dossier van een andere trainer','weigert', pg_temp.dossier('TA'));
select pg_temp.als('f1','HO Bovenbouw','8 wijzigt antwoord kennismaking (033)','weigert',$$update public.rij set data = jsonb_set(data,'{a,ervaring}','"Door HO"') where soort='trainerKennis' and id='TB'$$);
select pg_temp.als('f1','HO Bovenbouw','8 nodigt opnieuw uit (alleen gevraagd)','mag',$$update public.rij set data = jsonb_set(data,'{gevraagd}','"2026-11-04"') where soort='trainerKennis' and id='TB'$$);
-- 9. Clubbeheerder: zonder begeleidersrol niets; met een HO-rol Bovenbouw alleen zijn werkgebied (admin telt niet)
select pg_temp.als('f6','Beheerder zonder begeleidersrol','9 leest dossier trainer O17','weigert', pg_temp.dossier('TB'));
select pg_temp.als('f5','HO Bovenbouw + beheerder','9 leest dossier trainer O17','mag', pg_temp.dossier('TB'));
select pg_temp.als('f5','HO Bovenbouw + beheerder','9 leest dossier trainer O10','weigert', pg_temp.dossier('TA'));
-- 10. Clubscheiding
select pg_temp.als('f8','HO hele club, andere club','10 leest dossier trainer O17','weigert', pg_temp.dossier('TB'));
-- 12. Zoals Swift: HO Middenbouw + Bovenbouw
select pg_temp.als('f4','HO Midden+Bovenbouw (Swift)','12 leest dossier trainer O15','mag', pg_temp.dossier('TM'));
select pg_temp.als('f4','HO Midden+Bovenbouw (Swift)','12 leest dossier trainer O17','mag', pg_temp.dossier('TB'));
select pg_temp.als('f4','HO Midden+Bovenbouw (Swift)','12 leest dossier trainer O10','weigert', pg_temp.dossier('TA'));
select pg_temp.als('f1','HO Bovenbouw','12 leest dossier trainer O15 (standaardbouwen)','weigert', pg_temp.dossier('TM'));
-- 11. De club stelt eigen bouwen in (Bovenbouw vanaf 14): de zichtbaarheid volgt direct
update public.rij set data = data || '{"bouwen":[{"naam":"Onderbouw","van":8,"tot":12},{"naam":"Middenbouw","van":13,"tot":13},{"naam":"Bovenbouw","van":14,"tot":19}]}' where club_id='wg' and soort='club' and id='club';
select pg_temp.als('f1','HO Bovenbouw','11 eigen bouwen: leest dossier trainer O15','mag', pg_temp.dossier('TM'));
select pg_temp.als('f1','HO Bovenbouw','11 eigen bouwen: leest dossier trainer O10','weigert', pg_temp.dossier('TA'));
-- Niet ingelogd
do $$ declare n int := 0; u text; begin
  perform set_config('request.jwt.claims', '{"role":"anon"}', true);
  begin execute 'set local role anon'; execute 'select 1 from public.rij where soort=''trainerDossier'' and id=''TB'''; get diagnostics n = row_count; raise exception 'cc_terug';
  exception when others then u := case when sqlerrm = 'cc_terug' and n > 0 then 'mag' else 'weigert' end; end;
  execute 'reset role';
  insert into uitkomst values ('Niet ingelogd', 'leest dossier', 'weigert', u);
end $$;

select wie, test, verwacht, uitkomst, uitkomst = verwacht as ok from uitkomst;
rollback;
