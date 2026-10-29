-- ClubComm — AVV Swift: rooster JO16-2 ZO uit het trainingsschema 2026-2027 (v2.2): woensdag en vrijdag 18:15–19:30, veld 1.
-- Trainingen vanaf 30-10-2026 tot het eind van het seizoen (5-6-2027), vakanties uit de clubgegevens overgeslagen. Eenmalig uitgevoerd 29-10.
update public.rij set data = jsonb_set(data, '{rooster}', '[{"dag": 3, "tijd": "18:15", "eind": "19:30", "veld": "Veld 1"}, {"dag": 5, "tijd": "18:15", "eind": "19:30", "veld": "Veld 1"}]')
where club_id = 'swift' and soort = 'teams' and id = 'O16-2';
insert into public.rij (club_id, soort, id, scope, team_id, act_id, data)
select 'swift', 'acts', 'a-o16-' || to_char(d, 'YYYYMMDD'), 'team', 'O16-2', 'a-o16-' || to_char(d, 'YYYYMMDD'),
  jsonb_build_object('id', 'a-o16-' || to_char(d, 'YYYYMMDD'), 'teamId', 'O16-2', 'soort', 'training', 'datum', to_char(d, 'YYYY-MM-DD'),
    'tijd', '18:15', 'eind', '19:30', 'veld', 'Veld 1', 'afgelast', false, 'rooster', true)
from generate_series(date '2026-10-30', date '2027-06-05', interval '1 day') g(d)
where extract(isodow from d) in (3, 5)
  and not exists (select 1 from public.rij c, jsonb_array_elements(c.data->'vakanties') v
                  where c.club_id = 'swift' and c.soort = 'club' and not coalesce((v->>'trainen')::boolean, false)
                    and to_char(d, 'YYYY-MM-DD') between v->>'van' and v->>'tot')
on conflict do nothing;
