-- ClubComm — clubscheiding (alleen lokaal, rechtentest-lokaal.sh): niemand ziet of wijzigt gegevens van een andere club,
-- ook niet als beheerder. Twee testclubs; alles in één transactie die aan het eind wordt teruggedraaid.
begin;
create temp table uitkomst (wie text, test text, verwacht text, uitkomst text);
insert into auth.users (id, email, aud, role) values
  ('00000000-0000-0000-0000-0000000000c1','cs-a-hjo@t.nl','authenticated','authenticated'),
  ('00000000-0000-0000-0000-0000000000c2','cs-a-ouder@t.nl','authenticated','authenticated'),
  ('00000000-0000-0000-0000-0000000000c3','cs-b-hjo@t.nl','authenticated','authenticated');
insert into public.lid (auth_uid, club_id, persoon_id) values
  ('00000000-0000-0000-0000-0000000000c1','csA','HA'), ('00000000-0000-0000-0000-0000000000c2','csA','PA'),
  ('00000000-0000-0000-0000-0000000000c3','csB','HB');
insert into public.rij (club_id, soort, id, scope, team_id, speler_id, persoon_id, act_id, data) values
  ('csA','club','club','club',null,null,null,null,'{"naam":"Club A"}'),
  ('csA','teams','TA','club','TA',null,null,null,'{"id":"TA","cat":"O10"}'),
  ('csA','people','HA','persoon',null,null,'HA',null,'{"id":"HA","rollen":[{"rol":"hjo"},{"rol":"beheerder"}]}'),
  ('csA','people','PA','persoon',null,null,'PA',null,'{"id":"PA","rollen":[{"rol":"ouder"}]}'),
  ('csA','contact','PA','contact',null,null,'PA',null,'{"email":"cs-a-ouder@t.nl","tel":"0600000000"}'),
  ('csA','players','KA','kind','TA','KA',null,null,'{"id":"KA","teamId":"TA","ouders":["PA"]}'),
  ('csA','beoord','KA','beoord','TA','KA',null,null,'{"m1":{}}'),
  ('csA','profiel','csA','hjo',null,null,null,null,'{"id":"csA"}'),
  ('csB','club','club','club',null,null,null,null,'{"naam":"Club B"}'),
  ('csB','people','HB','persoon',null,null,'HB',null,'{"id":"HB","rollen":[{"rol":"hjo"},{"rol":"beheerder"}]}');

create function pg_temp.als(uid text, email text, wie text, test text, verwacht text, q text) returns void language plpgsql as $f$
declare n int; u text;
begin
  perform set_config('request.jwt.claims', json_build_object('sub','00000000-0000-0000-0000-0000000000'||uid,'email',email,'role','authenticated')::text, true);
  begin
    execute 'set local role authenticated';
    execute q; get diagnostics n = row_count; u := case when n > 0 then 'mag' else 'weigert' end;
    execute 'reset role';
  exception when others then execute 'reset role'; u := 'weigert';
  end;
  insert into uitkomst values (wie, test, verwacht, u);
end $f$;

-- Beheerder van club B probeert club A
select pg_temp.als('c3','cs-b-hjo@t.nl','Beheerder club B','leest rijen van club A','weigert',$$select 1 from public.rij where club_id='csA'$$);
select pg_temp.als('c3','cs-b-hjo@t.nl','Beheerder club B','leest contactgegevens club A','weigert',$$select 1 from public.rij where club_id='csA' and soort='contact'$$);
select pg_temp.als('c3','cs-b-hjo@t.nl','Beheerder club B','leest beoordeling kind club A','weigert',$$select 1 from public.rij where club_id='csA' and soort='beoord'$$);
select pg_temp.als('c3','cs-b-hjo@t.nl','Beheerder club B','wijzigt club A','weigert',$$update public.rij set data = data || '{"x":1}' where club_id='csA'$$);
select pg_temp.als('c3','cs-b-hjo@t.nl','Beheerder club B','verwijdert in club A','weigert',$$delete from public.rij where club_id='csA'$$);
select pg_temp.als('c3','cs-b-hjo@t.nl','Beheerder club B','voegt rij toe in club A','weigert',$$insert into public.rij (club_id,soort,id,scope,data) values ('csA','teams','TX','club','{}')$$);
select pg_temp.als('c3','cs-b-hjo@t.nl','Beheerder club B','ziet leden van club A','weigert',$$select 1 from public.lid where club_id='csA'$$);
select pg_temp.als('c3','cs-b-hjo@t.nl','Beheerder club B','maakt zich lid van club A','weigert',$$insert into public.lid (auth_uid, club_id, persoon_id) values ('00000000-0000-0000-0000-0000000000c3','csA','HB')$$);
-- Ouder van club A probeert club B
select pg_temp.als('c2','cs-a-ouder@t.nl','Ouder club A','leest rijen van club B','weigert',$$select 1 from public.rij where club_id='csB'$$);
-- Beheerder van club A in de eigen club (controle dat de test zelf werkt) en in club B
select pg_temp.als('c1','cs-a-hjo@t.nl','Beheerder club A','leest eigen club (controle)','mag',$$select 1 from public.rij where club_id='csA'$$);
select pg_temp.als('c1','cs-a-hjo@t.nl','Beheerder club A','leest rijen van club B','weigert',$$select 1 from public.rij where club_id='csB'$$);
-- Niet ingelogd (anon)
do $$ declare n int; u text; begin
  perform set_config('request.jwt.claims', '{"role":"anon"}', true);
  begin execute 'set local role anon'; execute 'select 1 from public.rij'; get diagnostics n = row_count; u := case when n > 0 then 'mag' else 'weigert' end; execute 'reset role';
  exception when others then execute 'reset role'; u := 'weigert'; end;
  insert into uitkomst values ('Niet ingelogd', 'leest rijen', 'weigert', u);
end $$;

select wie, test, verwacht, uitkomst, uitkomst = verwacht as ok from uitkomst;
rollback;
