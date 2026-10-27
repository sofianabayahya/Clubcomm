-- ClubComm — Besluit 128: de rechtentest (Besluit 119, migratie 030) krijgt controles voor eigen oefenvormen en trainingen.
-- Geen wijziging aan de rechten zelf: vormen en trainingsplannen gebruiken de bestaande scope 'eigen' (alleen de maker).
-- De functie is gelijk aan die van migratie 030, met 2 extra testrijen en 5 extra controles.

create or replace function priv.rechtentest()
returns table (wie text, test text, verwacht text, uitkomst text, ok boolean)
language plpgsql set search_path = public as $fn$
declare
  res text[] := '{}'; t record; n int; fout text; vandaag text := to_char(current_date, 'YYYY-MM-DD');
  later text := to_char(current_date + 10, 'YYYY-MM-DD');
begin
  begin
    insert into auth.users (id, email, aud, role, instance_id) values
      ('00000000-0000-0000-0000-0000000000b1','rt-hjo@t.nl','authenticated','authenticated','00000000-0000-0000-0000-000000000000'),
      ('00000000-0000-0000-0000-0000000000b2','rt-coord@t.nl','authenticated','authenticated','00000000-0000-0000-0000-000000000000'),
      ('00000000-0000-0000-0000-0000000000b3','rt-trainer@t.nl','authenticated','authenticated','00000000-0000-0000-0000-000000000000'),
      ('00000000-0000-0000-0000-0000000000b4','rt-tl@t.nl','authenticated','authenticated','00000000-0000-0000-0000-000000000000'),
      ('00000000-0000-0000-0000-0000000000b5','rt-p1@t.nl','authenticated','authenticated','00000000-0000-0000-0000-000000000000'),
      ('00000000-0000-0000-0000-0000000000b6','rt-p2@t.nl','authenticated','authenticated','00000000-0000-0000-0000-000000000000'),
      ('00000000-0000-0000-0000-0000000000b7','rt-p3@t.nl','authenticated','authenticated','00000000-0000-0000-0000-000000000000');
    insert into public.lid (auth_uid, club_id, persoon_id) values
      ('00000000-0000-0000-0000-0000000000b1','rt','H'), ('00000000-0000-0000-0000-0000000000b2','rt','C'),
      ('00000000-0000-0000-0000-0000000000b3','rt','TR'), ('00000000-0000-0000-0000-0000000000b4','rt','TL'),
      ('00000000-0000-0000-0000-0000000000b5','rt','P1'), ('00000000-0000-0000-0000-0000000000b6','rt','P2'),
      ('00000000-0000-0000-0000-0000000000b7','rt','P3');
    insert into public.rij (club_id, soort, id, scope, team_id, speler_id, persoon_id, act_id, data) values
      ('rt','club','club','club',null,null,null,null,'{"naam":"Testclub","coordinatorAan":true}'),
      ('rt','teams','T1','club','T1',null,null,null,'{"id":"T1","cat":"O10","trainerId":"TR","teamleiderId":"TL"}'),
      ('rt','teams','T2','club','T2',null,null,null,'{"id":"T2","cat":"O8"}'),
      ('rt','people','H','persoon',null,null,'H',null,'{"id":"H","naam":"Hanna","rollen":[{"rol":"hjo"}]}'),
      ('rt','people','C','persoon',null,null,'C',null,'{"id":"C","naam":"Cor","rollen":[{"rol":"coordinator","cats":["O10","O11","O12"]}]}'),
      ('rt','people','TR','persoon',null,null,'TR',null,'{"id":"TR","naam":"Tim","rollen":[{"rol":"trainer","teamId":"T1"}]}'),
      ('rt','people','TL','persoon',null,null,'TL',null,'{"id":"TL","naam":"Tess","rollen":[{"rol":"teamleider","teamId":"T1"}]}'),
      ('rt','people','P1','persoon',null,null,'P1',null,'{"id":"P1","naam":"Piet","rollen":[{"rol":"ouder"}]}'),
      ('rt','people','P2','persoon',null,null,'P2',null,'{"id":"P2","naam":"Paula","rollen":[{"rol":"ouder"}]}'),
      ('rt','people','P3','persoon',null,null,'P3',null,'{"id":"P3","naam":"Pim","rollen":[{"rol":"ouder"}]}'),
      ('rt','contact','H','contact',null,null,'H',null,'{"email":"rt-hjo@t.nl","tel":""}'),
      ('rt','players','K1','kind','T1','K1',null,null,'{"id":"K1","teamId":"T1","ouders":["P1"]}'),
      ('rt','players','K2','kind','T1','K2',null,null,'{"id":"K2","teamId":"T1","ouders":["P2"]}'),
      ('rt','players','K3','kind','T2','K3',null,null,'{"id":"K3","teamId":"T2","ouders":["P3"]}'),
      ('rt','acts','A1','team','T1',null,null,'A1','{"id":"A1","teamId":"T1","soort":"training","datum":"2030-01-01"}'),
      ('rt','acts','A2','team','T2',null,null,'A2','{"id":"A2","teamId":"T2","soort":"training","datum":"2030-01-01"}'),
      ('rt','acts','A3','team','T1',null,null,'A3', jsonb_build_object('id','A3','teamId','T1','soort','wedstrijd','datum',vandaag,'tijd','10:00')),
      ('rt','acts','A4','team','T1',null,null,'A4', jsonb_build_object('id','A4','teamId','T1','soort','wedstrijd','datum',later,'tijd','10:00')),
      ('rt','taken','TK1','team','T1',null,null,'A1','{"id":"TK1","actId":"A1","soort":"Wastas","personId":null}'),
      ('rt','taken','TK3','team','T1',null,null,'A3','{"id":"TK3","actId":"A3","soort":"Timekeeper","personId":"P2"}'),
      ('rt','taken','TK4','team','T1',null,null,'A4','{"id":"TK4","actId":"A4","soort":"Timekeeper","personId":"P2"}'),
      ('rt','afm','F2','speler','T1','K2',null,'A1','{"reden":"Blessure","opm":"enkel"}'),
      ('rt','pres','A1|K1','act','T1','K1',null,'A1','{"v":"a"}'),
      ('rt','pres','A1|K2','act','T1','K2',null,'A1','{"v":"x"}'),
      ('rt','speeltijdSchema','A3','act','T1',null,null,'A3','{"zelf":true,"wissels":[]}'),
      ('rt','beoord','K1','beoord','T1','K1',null,null,'{"m1":{}}'),
      ('rt','beoord','K2','beoord','T1','K2',null,null,'{"m1":{}}'),
      ('rt','msgs','M1','bericht',null,null,null,null,'{"van":"TR","soort":"persoonlijk","ontvangers":["P1"],"gelezen":[],"antw":[],"tekst":"hoi"}'),
      ('rt','vormen','V1','eigen','T1',null,'TR',null,'{"id":"V1","eigenaar":"TR","naam":"Rondo"}'),
      ('rt','trainingsplannen','TP1','eigen','T1',null,'TR','A1','{"id":"TP1","eigenaar":"TR","actId":"A1"}');

    for t in select * from (values
      -- Ouder P1 (kind K1 in T1)
      ('Ouder','b5','rt-p1@t.nl','geeft zichzelf de rol HJO','weigert', $q$update public.rij set data = jsonb_set(data,'{rollen}','[{"rol":"hjo"}]') where club_id='rt' and soort='people' and id='P1'$q$),
      ('Ouder','b5','rt-p1@t.nl','wijzigt beoordeling eigen kind','weigert', $q$update public.rij set data = '{"m1":{"x":3}}' where club_id='rt' and soort='beoord' and id='K1'$q$),
      ('Ouder','b5','rt-p1@t.nl','wijzigt aanwezigheid ander kind','weigert', $q$update public.rij set data = '{"v":"a"}' where club_id='rt' and soort='pres' and id='A1|K2'$q$),
      ('Ouder','b5','rt-p1@t.nl','meldt eigen kind af','mag', $q$insert into public.rij (club_id,soort,id,scope,team_id,speler_id,act_id,data) values ('rt','afm','F9','speler','T1','K1','A1','{"reden":"Ziek"}')$q$),
      ('Ouder','b5','rt-p1@t.nl','meldt ander kind af','weigert', $q$insert into public.rij (club_id,soort,id,scope,team_id,speler_id,act_id,data) values ('rt','afm','F8','speler','T1','K2','A1','{"reden":"Ziek"}')$q$),
      ('Ouder','b5','rt-p1@t.nl','ziet afmelding van ander kind','weigert', $q$select 1 from public.rij where club_id='rt' and soort='afm' and id='F2'$q$),
      ('Ouder','b5','rt-p1@t.nl','verandert tekst van bericht trainer','weigert', $q$update public.rij set data = jsonb_set(data,'{tekst}','"x"') where club_id='rt' and soort='msgs' and id='M1'$q$),
      ('Ouder','b5','rt-p1@t.nl','neemt een taak','mag', $q$update public.rij set data = jsonb_set(data,'{personId}','"P1"') where club_id='rt' and soort='taken' and id='TK1'$q$),
      ('Ouder','b5','rt-p1@t.nl','verplaatst een training','weigert', $q$update public.rij set data = jsonb_set(data,'{datum}','"2030-02-02"') where club_id='rt' and soort='acts' and id='A1'$q$),
      ('Ouder','b5','rt-p1@t.nl','wordt vervanger bij training','mag', $q$update public.rij set data = jsonb_set(data,'{vervangerId}','"P1"') where club_id='rt' and soort='acts' and id='A1'$q$),
      ('Ouder','b5','rt-p1@t.nl','zet uitslag zonder taak (B116)','weigert', $q$update public.rij set data = data || '{"uitslag":"1-0"}' where club_id='rt' and soort='acts' and id='A3'$q$),
      ('Ouder','b5','rt-p1@t.nl','stuurt voorstel aan trainer (B117)','mag', $q$insert into public.rij (club_id,soort,id,scope,team_id,act_id,data) values ('rt','wedVoorstel','A3','team','T1','A3','{"actId":"A3"}')$q$),
      ('Ouder','b5','rt-p1@t.nl','stuurt rit-bericht aan andere ouder (B114)','mag', $q$insert into public.rij (club_id,soort,id,scope,data) values ('rt','msgs','M9','bericht','{"van":"P1","rit":true,"soort":"persoonlijk","ontvangers":["P2"],"gelezen":[],"antw":[],"tekst":"rijdt niet mee"}')$q$),
      ('Ouder','b5','rt-p1@t.nl','schrijft hoe een bericht aankwam (B107)','weigert', $q$insert into public.rij (club_id,soort,id,scope,data) values ('rt','bezorgd','M1','bericht','{"van":"TR","ontvangers":["P1"]}')$q$),
      -- Timekeeper P2 (ouder, taak Timekeeper bij A3 vandaag en A4 over 10 dagen)
      ('Timekeeper','b6','rt-p2@t.nl','slaat uitslag en doelpunten op (B116)','mag', $q$update public.rij set data = data || '{"uitslag":"2-1","uitslagKlaar":true,"goals":[{"id":"g","wij":true}]}' where club_id='rt' and soort='acts' and id='A3'$q$),
      ('Timekeeper','b6','rt-p2@t.nl','verandert de aanvangstijd','weigert', $q$update public.rij set data = jsonb_set(data,'{tijd}','"11:00"') where club_id='rt' and soort='acts' and id='A3'$q$),
      ('Timekeeper','b6','rt-p2@t.nl','slaat wisselschema op (B116)','mag', $q$update public.rij set data = '{"zelf":true,"wissels":[{"id":"w","min":30}]}' where club_id='rt' and soort='speeltijdSchema' and id='A3'$q$),
      ('Timekeeper','b6','rt-p2@t.nl','slaat aanwezigheid wedstrijd op (B116)','mag', $q$insert into public.rij (club_id,soort,id,scope,team_id,speler_id,act_id,data) values ('rt','pres','A3|K1','act','T1','K1','A3','{"v":"a"}')$q$),
      ('Timekeeper','b6','rt-p2@t.nl','zet uitslag van wedstrijd over 10 dagen','weigert', $q$update public.rij set data = data || '{"uitslag":"1-0"}' where club_id='rt' and soort='acts' and id='A4'$q$),
      -- Ouder P3 (kind in T2)
      ('Ouder ander team','b7','rt-p3@t.nl','stuurt voorstel voor ander team','weigert', $q$insert into public.rij (club_id,soort,id,scope,team_id,act_id,data) values ('rt','wedVoorstel','A3-p3','team','T1','A3','{"actId":"A3"}')$q$),
      ('Ouder ander team','b7','rt-p3@t.nl','ziet aanwezigheid in ander team','weigert', $q$select 1 from public.rij where club_id='rt' and soort='pres' and id='A1|K1'$q$),
      -- Teamleider T1
      ('Teamleider','b4','rt-tl@t.nl','wijzigt e-mail van de HJO','weigert', $q$update public.rij set data = jsonb_set(data,'{email}','"x@t.nl"') where club_id='rt' and soort='contact' and id='H'$q$),
      ('Teamleider','b4','rt-tl@t.nl','voegt een ouder toe','mag', $q$insert into public.rij (club_id,soort,id,scope,persoon_id,data) values ('rt','people','P9','persoon','P9','{"id":"P9","rollen":[{"rol":"ouder"}]}')$q$),
      ('Teamleider','b4','rt-tl@t.nl','maakt iemand trainer','weigert', $q$insert into public.rij (club_id,soort,id,scope,persoon_id,data) values ('rt','people','P8','persoon','P8','{"id":"P8","rollen":[{"rol":"trainer","teamId":"T1"}]}')$q$),
      ('Teamleider','b4','rt-tl@t.nl','beoordeelt een speler','weigert', $q$update public.rij set data = '{"m1":{"x":1}}' where club_id='rt' and soort='beoord' and id='K2'$q$),
      -- Trainer T1
      ('Trainer','b3','rt-trainer@t.nl','neemt aanwezigheid op','mag', $q$update public.rij set data = '{"v":"t"}' where club_id='rt' and soort='pres' and id='A1|K1'$q$),
      ('Trainer','b3','rt-trainer@t.nl','schrijft in ander team','weigert', $q$insert into public.rij (club_id,soort,id,scope,team_id,speler_id,act_id,data) values ('rt','afm','F7','speler','T2','K3','A2','{}')$q$),
      ('Trainer','b3','rt-trainer@t.nl','beoordeelt een speler','mag', $q$update public.rij set data = '{"m1":{"x":2}}' where club_id='rt' and soort='beoord' and id='K1'$q$),
      -- Besluit 128: eigen oefenvormen en trainingen (scope eigen): alleen de maker
      ('Trainer','b3','rt-trainer@t.nl','ziet zijn eigen vorm (B128)','mag', $q$select 1 from public.rij where club_id='rt' and soort='vormen' and id='V1'$q$),
      ('Trainer','b3','rt-trainer@t.nl','maakt een eigen vorm (B128)','mag', $q$insert into public.rij (club_id,soort,id,scope,team_id,persoon_id,data) values ('rt','vormen','V2','eigen','T1','TR','{"id":"V2","eigenaar":"TR"}')$q$),
      ('Trainer','b3','rt-trainer@t.nl','zet een vorm op naam van een ander (B128)','weigert', $q$insert into public.rij (club_id,soort,id,scope,team_id,persoon_id,data) values ('rt','vormen','V3','eigen','T1','TL','{"id":"V3","eigenaar":"TL"}')$q$),
      ('Teamleider','b4','rt-tl@t.nl','ziet vorm van de trainer (B128)','weigert', $q$select 1 from public.rij where club_id='rt' and soort='vormen' and id='V1'$q$),
      ('HJO','b1','rt-hjo@t.nl','ziet training van de trainer (B128)','weigert', $q$select 1 from public.rij where club_id='rt' and soort='trainingsplannen' and id='TP1'$q$),
      ('Trainer','b3','rt-trainer@t.nl','beheert voorstellen van de timekeeper (B117)','mag', $q$insert into public.rij (club_id,soort,id,scope,team_id,act_id,data) values ('rt','wedVoorstel','A4','team','T1','A4','{"actId":"A4"}')$q$),
      -- Coördinator O10–O12
      ('Coördinator','b2','rt-coord@t.nl','wijzigt de clubregels','weigert', $q$update public.rij set data = jsonb_set(data,'{naam}','"x"') where club_id='rt' and soort='club' and id='club'$q$),
      -- HJO
      ('HJO','b1','rt-hjo@t.nl','maakt iemand coördinator','mag', $q$update public.rij set data = jsonb_set(data,'{rollen}','[{"rol":"coordinator","cats":["O8"]}]') where club_id='rt' and soort='people' and id='P3'$q$),
      ('HJO','b1','rt-hjo@t.nl','wijzigt de clubregels','mag', $q$update public.rij set data = jsonb_set(data,'{naam}','"Testclub 2"') where club_id='rt' and soort='club' and id='club'$q$)
    ) v(wie, uid, email, test, verwacht, sql) loop
      begin
        perform set_config('request.jwt.claims', json_build_object('sub', '00000000-0000-0000-0000-0000000000' || t.uid, 'email', t.email, 'role', 'authenticated')::text, true);
        execute 'set local role authenticated';
        execute t.sql; get diagnostics n = row_count;
        execute 'reset role';
        res := res || array[t.wie, t.test, t.verwacht, case when n > 0 then 'mag' else 'weigert' end, case when n > 0 then '' else '0 rijen' end];
      exception when others then
        fout := sqlerrm; execute 'reset role';
        res := res || array[t.wie, t.test, t.verwacht, 'weigert', fout];
      end;
    end loop;
    raise exception 'rechtentest-klaar';
  exception when others then
    if sqlerrm <> 'rechtentest-klaar' then res := res || array['(opzet)', 'testclub klaarzetten', 'mag', 'weigert', sqlerrm]; end if;
  end;
  perform set_config('request.jwt.claims', '', true);
  for i in 1 .. coalesce(array_length(res, 1), 0) / 5 loop
    wie := res[i*5-4]; test := res[i*5-3]; verwacht := res[i*5-2];
    uitkomst := res[i*5-1] || case when res[i*5] <> '' and res[i*5-1] <> res[i*5-2] then ' (' || res[i*5] || ')' else '' end;
    ok := res[i*5-1] = res[i*5-2];
    return next;
  end loop;
end $fn$;
revoke all on function priv.rechtentest() from public, anon, authenticated;
