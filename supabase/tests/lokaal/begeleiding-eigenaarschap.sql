-- ClubComm — regressietest begeleidingsdossier (hoort bij voorstel 033). Alleen lokaal (rechtentest-lokaal.sh), alles in
-- één transactie die wordt teruggedraaid; elke controle in een eigen subtransactie, zodat controles elkaar niet raken.
-- "verwacht" = het gewenste beleid (Spoor 2, 29-10): zonder 033 wijken controles af, met 033 moeten ze allemaal goed zijn.
-- Rollen: trainer (eigenaar), andere trainer, HO, HO met bouw (zoals de TC bij Swift), TC, HO+beheerder (zoals bij DCG
-- en Swift), clubbeheerder zonder begeleidersrol, coördinator, ouder, en de server (geen ingelogde gebruiker).
begin;
create temp table uitkomst (wie text, test text, verwacht text, uitkomst text);
insert into auth.users (id, email, aud, role) values
  ('00000000-0000-0000-0000-0000000000e1','be-tr@t.nl','authenticated','authenticated'),
  ('00000000-0000-0000-0000-0000000000e2','be-t2@t.nl','authenticated','authenticated'),
  ('00000000-0000-0000-0000-0000000000e3','be-ho@t.nl','authenticated','authenticated'),
  ('00000000-0000-0000-0000-0000000000e4','be-hb@t.nl','authenticated','authenticated'),
  ('00000000-0000-0000-0000-0000000000e5','be-tc@t.nl','authenticated','authenticated'),
  ('00000000-0000-0000-0000-0000000000e6','be-hobh@t.nl','authenticated','authenticated'),
  ('00000000-0000-0000-0000-0000000000e7','be-bh@t.nl','authenticated','authenticated'),
  ('00000000-0000-0000-0000-0000000000e8','be-co@t.nl','authenticated','authenticated'),
  ('00000000-0000-0000-0000-0000000000e9','be-ou@t.nl','authenticated','authenticated');
insert into public.lid (auth_uid, club_id, persoon_id) values
  ('00000000-0000-0000-0000-0000000000e1','be','TR'), ('00000000-0000-0000-0000-0000000000e2','be','T2'),
  ('00000000-0000-0000-0000-0000000000e3','be','HO'), ('00000000-0000-0000-0000-0000000000e4','be','HB'),
  ('00000000-0000-0000-0000-0000000000e5','be','TC'), ('00000000-0000-0000-0000-0000000000e6','be','HX'),
  ('00000000-0000-0000-0000-0000000000e7','be','BH'), ('00000000-0000-0000-0000-0000000000e8','be','CO'),
  ('00000000-0000-0000-0000-0000000000e9','be','OU');
insert into public.rij (club_id, soort, id, scope, team_id, speler_id, persoon_id, act_id, data) values
  ('be','club','club','club',null,null,null,null,'{"naam":"Club BE"}'),
  ('be','people','TR','persoon',null,null,'TR',null,'{"id":"TR","rollen":[{"rol":"trainer","teamId":"T1"}]}'),
  ('be','people','T2','persoon',null,null,'T2',null,'{"id":"T2","rollen":[{"rol":"trainer","teamId":"T2"}]}'),
  ('be','people','HO','persoon',null,null,'HO',null,'{"id":"HO","rollen":[{"rol":"hjo"}]}'),
  ('be','people','HB','persoon',null,null,'HB',null,'{"id":"HB","rollen":[{"rol":"hjo","bouwen":["Middenbouw"]}]}'),
  ('be','people','TC','persoon',null,null,'TC',null,'{"id":"TC","rollen":[{"rol":"tc"}]}'),
  ('be','people','HX','persoon',null,null,'HX',null,'{"id":"HX","rollen":[{"rol":"hjo"},{"rol":"beheerder"}]}'),
  ('be','people','BH','persoon',null,null,'BH',null,'{"id":"BH","rollen":[{"rol":"beheerder"}]}'),
  ('be','people','CO','persoon',null,null,'CO',null,'{"id":"CO","rollen":[{"rol":"coordinator"}]}'),
  ('be','people','OU','persoon',null,null,'OU',null,'{"id":"OU","rollen":[{"rol":"ouder"}]}'),
  ('be','begeleidZelf','M1','trainerzelf',null,null,'TR',null,'{"trainerId":"TR","v":{"v1":"Vooraf"},"reflectieOp":"2026-10-20T20:00:00Z","r":{"r1":"Eigen tekst"}}'),
  ('be','trainerKennis','TR','trainerzelf',null,null,'TR',null,'{"gevraagd":"2026-10-01","ingevuld":"2026-10-02","a":{"ervaring":"5 jaar"}}'),
  ('be','trainerDossier','TR','trainerdossier',null,null,'TR',null,'{"traject":{"actief":true,"ontwikkelpunt":"Vragen stellen"}}'),
  ('be','begeleidMomenten','BM1','trainerdossier','T1',null,'TR',null,'{"id":"BM1","trainerId":"TR","teamId":"T1","vakken":{"ontwikkelpunt":"Vragen stellen"}}'),
  ('be','trainerNotities','TR','hoprive',null,null,'TR',null,'{"bouwen":[],"tekst":"Werkaantekening HO"}');

create function pg_temp.als(uid text, wie text, test text, verwacht text, q text) returns void language plpgsql as $f$
declare n int := 0; u text;
begin
  perform set_config('request.jwt.claims', json_build_object('sub','00000000-0000-0000-0000-0000000000'||uid,'email','be-'||uid||'@t.nl','role','authenticated')::text, true);
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

-- Zelfreflectie en vragenlijst vooraf (begeleidZelf, scope trainerzelf)
select pg_temp.als('e1','Trainer','leest eigen reflectie','mag',$$select 1 from public.rij where soort='begeleidZelf' and id='M1'$$);
select pg_temp.als('e1','Trainer','wijzigt eigen reflectie','mag',$$update public.rij set data = jsonb_set(data,'{r,r1}','"Nieuw"') where soort='begeleidZelf' and id='M1'$$);
select pg_temp.als('e1','Trainer','verwijdert eigen reflectie','mag',$$delete from public.rij where soort='begeleidZelf' and id='M1'$$);
select pg_temp.als('e1','Trainer','zet eigen reflectie op naam van een ander','weigert',$$update public.rij set persoon_id='T2' where soort='begeleidZelf' and id='M1'$$);
select pg_temp.als('e3','HO','leest reflectie','mag',$$select 1 from public.rij where soort='begeleidZelf' and id='M1'$$);
select pg_temp.als('e3','HO','wijzigt reflectietekst','weigert',$$update public.rij set data = jsonb_set(data,'{r,r1}','"Door HO"') where soort='begeleidZelf' and id='M1'$$);
select pg_temp.als('e3','HO','wijzigt vragenlijst vooraf','weigert',$$update public.rij set data = jsonb_set(data,'{v,v1}','"Door HO"') where soort='begeleidZelf' and id='M1'$$);
select pg_temp.als('e3','HO','verwijdert reflectie','weigert',$$delete from public.rij where soort='begeleidZelf' and id='M1'$$);
select pg_temp.als('e3','HO','maakt reflectie met tekst aan op naam van trainer','weigert',$$insert into public.rij (club_id,soort,id,scope,persoon_id,data) values ('be','begeleidZelf','M2','trainerzelf','TR','{"trainerId":"TR","r":{"r1":"Door HO"}}')$$);
select pg_temp.als('e3','HO','maakt lege rij aan (alleen trainerId en gevraagd)','mag',$$insert into public.rij (club_id,soort,id,scope,persoon_id,data) values ('be','begeleidZelf','M3','trainerzelf','TR','{"trainerId":"TR","gevraagd":"2026-10-29"}')$$);
select pg_temp.als('e3','HO','verplaatst reflectie naar een andere scope','weigert',$$update public.rij set scope='trainerdossier' where soort='begeleidZelf' and id='M1'$$);
select pg_temp.als('e4','HO met bouw','leest reflectie','mag',$$select 1 from public.rij where soort='begeleidZelf' and id='M1'$$);
select pg_temp.als('e4','HO met bouw','wijzigt reflectietekst','weigert',$$update public.rij set data = jsonb_set(data,'{r,r1}','"x"') where soort='begeleidZelf' and id='M1'$$);
select pg_temp.als('e5','TC','leest reflectie','mag',$$select 1 from public.rij where soort='begeleidZelf' and id='M1'$$);
select pg_temp.als('e5','TC','wijzigt reflectietekst','weigert',$$update public.rij set data = jsonb_set(data,'{r,r1}','"x"') where soort='begeleidZelf' and id='M1'$$);
select pg_temp.als('e6','HO + beheerder','leest reflectie','mag',$$select 1 from public.rij where soort='begeleidZelf' and id='M1'$$);
select pg_temp.als('e6','HO + beheerder','wijzigt reflectietekst','weigert',$$update public.rij set data = jsonb_set(data,'{r,r1}','"x"') where soort='begeleidZelf' and id='M1'$$);
select pg_temp.als('e7','Beheerder zonder begeleidersrol','leest reflectie','weigert',$$select 1 from public.rij where soort='begeleidZelf' and id='M1'$$);
select pg_temp.als('e7','Beheerder zonder begeleidersrol','wijzigt reflectie','weigert',$$update public.rij set data = jsonb_set(data,'{r,r1}','"x"') where soort='begeleidZelf' and id='M1'$$);
select pg_temp.als('e7','Beheerder zonder begeleidersrol','maakt reflectie aan','weigert',$$insert into public.rij (club_id,soort,id,scope,persoon_id,data) values ('be','begeleidZelf','M4','trainerzelf','TR','{"trainerId":"TR"}')$$);
select pg_temp.als('e2','Andere trainer','leest reflectie','weigert',$$select 1 from public.rij where soort='begeleidZelf' and id='M1'$$);
select pg_temp.als('e2','Andere trainer','wijzigt reflectie','weigert',$$update public.rij set data = jsonb_set(data,'{r,r1}','"x"') where soort='begeleidZelf' and id='M1'$$);
select pg_temp.als('e8','Coördinator','leest reflectie','weigert',$$select 1 from public.rij where soort='begeleidZelf' and id='M1'$$);
select pg_temp.als('e9','Ouder','leest reflectie','weigert',$$select 1 from public.rij where soort='begeleidZelf' and id='M1'$$);

-- Kennismakingsvragenlijst (trainerKennis, scope trainerzelf)
select pg_temp.als('e1','Trainer','vult eigen kennismaking in','mag',$$update public.rij set data = jsonb_set(data,'{a,ambitie}','"Selectieteam"') where soort='trainerKennis' and id='TR'$$);
select pg_temp.als('e3','HO','nodigt opnieuw uit (alleen gevraagd)','mag',$$update public.rij set data = jsonb_set(data,'{gevraagd}','"2026-10-29"') where soort='trainerKennis' and id='TR'$$);
select pg_temp.als('e3','HO','wijzigt een antwoord','weigert',$$update public.rij set data = jsonb_set(data,'{a,ervaring}','"Door HO"') where soort='trainerKennis' and id='TR'$$);
select pg_temp.als('e3','HO','stuurt verouderde versie terug bij uitnodigen','weigert',$$update public.rij set data = '{"gevraagd":"2026-10-29"}' where soort='trainerKennis' and id='TR'$$);
select pg_temp.als('e3','HO','nodigt nieuwe trainer uit (lege rij)','mag',$$insert into public.rij (club_id,soort,id,scope,persoon_id,data) values ('be','trainerKennis','T2','trainerzelf','T2','{"gevraagd":"2026-10-29"}')$$);
select pg_temp.als('e7','Beheerder zonder begeleidersrol','leest kennismaking','weigert',$$select 1 from public.rij where soort='trainerKennis' and id='TR'$$);

-- Begeleidingsdossier (trainerDossier en begeleidMomenten, scope trainerdossier)
select pg_temp.als('e1','Trainer','leest eigen dossier','mag',$$select 1 from public.rij where soort='trainerDossier' and id='TR'$$);
select pg_temp.als('e1','Trainer','wijzigt eigen dossier','weigert',$$update public.rij set data = data || '{"x":1}' where soort='trainerDossier' and id='TR'$$);
select pg_temp.als('e1','Trainer','leest eigen begeleidingsmoment','mag',$$select 1 from public.rij where soort='begeleidMomenten' and id='BM1'$$);
select pg_temp.als('e3','HO','schrijft observatie in moment','mag',$$update public.rij set data = data || '{"obs":{}}' where soort='begeleidMomenten' and id='BM1'$$);
select pg_temp.als('e5','TC','schrijft observatie in moment','mag',$$update public.rij set data = data || '{"obs":{}}' where soort='begeleidMomenten' and id='BM1'$$);
select pg_temp.als('e6','HO + beheerder','wijzigt dossier','mag',$$update public.rij set data = data || '{"x":1}' where soort='trainerDossier' and id='TR'$$);
select pg_temp.als('e7','Beheerder zonder begeleidersrol','leest dossier','weigert',$$select 1 from public.rij where soort='trainerDossier' and id='TR'$$);
select pg_temp.als('e7','Beheerder zonder begeleidersrol','wijzigt dossier','weigert',$$update public.rij set data = data || '{"x":1}' where soort='trainerDossier' and id='TR'$$);
select pg_temp.als('e7','Beheerder zonder begeleidersrol','leest begeleidingsmoment','weigert',$$select 1 from public.rij where soort='begeleidMomenten' and id='BM1'$$);
select pg_temp.als('e2','Andere trainer','leest dossier','weigert',$$select 1 from public.rij where soort='trainerDossier' and id='TR'$$);
select pg_temp.als('e8','Coördinator','leest dossier','weigert',$$select 1 from public.rij where soort='trainerDossier' and id='TR'$$);
select pg_temp.als('e9','Ouder','leest begeleidingsmoment','weigert',$$select 1 from public.rij where soort='begeleidMomenten' and id='BM1'$$);

-- Werkaantekeningen begeleider (trainerNotities, scope hoprive). Huidige stand vastgelegd; of een andere begeleider
-- ze mag lezen, is besluit 07-E (nog open). 033 verandert hier niets.
select pg_temp.als('e1','Trainer','leest werkaantekeningen over zichzelf','weigert',$$select 1 from public.rij where soort='trainerNotities' and id='TR'$$);
select pg_temp.als('e7','Beheerder zonder begeleidersrol','leest werkaantekeningen','weigert',$$select 1 from public.rij where soort='trainerNotities' and id='TR'$$);
select pg_temp.als('e5','TC (huidig, besluit 07-E)','leest werkaantekeningen van HO','mag',$$select 1 from public.rij where soort='trainerNotities' and id='TR'$$);
select pg_temp.als('e5','TC (huidig, besluit 07-E)','wijzigt werkaantekeningen van HO','mag',$$update public.rij set data = jsonb_set(data,'{tekst}','"x"') where soort='trainerNotities' and id='TR'$$);

-- De server (geen ingelogde gebruiker, bijv. automatische berichten) wordt niet tegengehouden
do $$ declare n int; u text; begin
  perform set_config('request.jwt.claims', '', true);
  begin update public.rij set data = data || '{"herinnerd":true}' where soort='begeleidZelf' and id='M1'; get diagnostics n = row_count;
    u := case when n > 0 then 'mag' else 'weigert' end; exception when others then u := 'weigert'; end;
  insert into uitkomst values ('Server', 'wijzigt rij van trainer (automaat)', 'mag', u);
end $$;

select wie, test, verwacht, uitkomst, uitkomst = verwacht as ok from uitkomst;
rollback;
