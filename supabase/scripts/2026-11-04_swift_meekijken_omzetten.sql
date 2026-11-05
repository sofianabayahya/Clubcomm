-- ClubComm — Besluit 159: eenmalig de bestaande trainingen van één Swift-trainer (met traject) omzetten naar 'trainerplan',
-- precies volgens de regel van de app (opslag.js): trainingen die geen weekplan zijn, en de vormen die in zo'n training staan.
-- UITGEVOERD in productie op 4-11-2026 na akkoord van de initiatiefnemer ("Akkoord, zet Rubens trainingen om").
-- De app van de trainer zou dit zelf doen bij de eerstvolgende keer inloggen (live.js); dit haalt dat alleen naar voren.
-- Raakt alleen de kolom scope; geen inhoud. Terugdraaien: dezelfde updates met scope 'eigen' (de app zet ze dan bij inloggen weer terug).
begin;
update public.rij set scope = 'trainerplan'
 where club_id = 'swift' and soort = 'trainingsplannen' and persoon_id = 'p1793213239679' and scope = 'eigen' and coalesce(data->>'week', '') = '';
update public.rij v set scope = 'trainerplan'
 where v.club_id = 'swift' and v.soort = 'vormen' and v.persoon_id = 'p1793213239679' and v.scope = 'eigen'
   and exists (select 1 from public.rij p cross join jsonb_array_elements(coalesce(p.data->'onderdelen', '[]'::jsonb)) o
               where p.club_id = 'swift' and p.soort = 'trainingsplannen' and p.persoon_id = v.persoon_id and coalesce(p.data->>'week', '') = '' and o->>'vormId' = v.id);
commit;
