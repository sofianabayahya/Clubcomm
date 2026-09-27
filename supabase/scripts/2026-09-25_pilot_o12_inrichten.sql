-- ClubComm — start pilot RKSV DCG (25 september 2026): club leegmaken en het O12 talententeam inrichten.
-- Eenmalig uitgevoerd met execute_sql (geen schemawijziging, dus geen migratie).
-- Vooraf: backup.maak() gedraaid; daarnaast een vaste kopie in backup.rij_voor_pilot / backup.lid_voor_pilot.

begin;

-- 1. Vaste kopie van alles (de wekelijkse back-up overschrijft dezelfde datum en ruimt na 8 weken op)
create table if not exists backup.rij_voor_pilot as select * from public.rij;
create table if not exists backup.lid_voor_pilot as select * from public.lid;
alter table backup.rij_voor_pilot enable row level security;
alter table backup.lid_voor_pilot enable row level security;

-- 2. Leegmaken: alles weg behalve de clubinstellingen en het account van de beheerder (p-beheer)
delete from public.rij where club_id = 'dcg' and soort <> 'club' and not (soort in ('people', 'contact') and id = 'p-beheer');
delete from public.lid where club_id = 'dcg' and persoon_id <> 'p-beheer';

-- 3. Rollen van de initiatiefnemer: trainer O12-1, coördinator O10–O12, HJO, clubbeheerder
update public.rij set data = jsonb_set(data, '{rollen}', '[
  {"rol": "trainer", "teamId": "O12-1"},
  {"rol": "coordinator", "groep": "O10–O12", "cats": ["O10", "O11", "O12"]},
  {"rol": "hjo"},
  {"rol": "beheerder"}
]'::jsonb)
where club_id = 'dcg' and soort = 'people' and id = 'p-beheer';

-- 4. Het team (selectie). Trainingen di en do veld 1, vr veld 2, 17:15–18:30.
insert into public.rij (club_id, soort, id, scope, team_id, data) values ('dcg', 'teams', 'O12-1', 'club', 'O12-1', '{
  "id": "O12-1", "naam": "O12 talententeam", "cat": "O12", "type": "selectie",
  "rooster": [
    {"dag": 2, "tijd": "17:15", "eind": "18:30", "veld": "Veld 1"},
    {"dag": 4, "tijd": "17:15", "eind": "18:30", "veld": "Veld 1"},
    {"dag": 5, "tijd": "17:15", "eind": "18:30", "veld": "Veld 2"}
  ],
  "afwijking": {}, "trainerId": "p-beheer", "teamleiderId": null
}'::jsonb);

-- 5. Trainingen van vandaag tot het einde van het seizoen, zonder vakanties en clubstops
with club as (select data from public.rij where club_id = 'dcg' and soort = 'club'),
vrij as (
  select (v->>'van')::date van, (v->>'tot')::date tot
  from club, jsonb_array_elements(coalesce(data->'vakanties', '[]') || coalesce(data->'stops', '[]')) v
  where not coalesce((v->>'trainen')::boolean, false)
),
dagen as (
  select d::date datum, r
  from club, generate_series(date '2026-09-25', (select (data->'seizoen'->>'eind')::date from club), interval '1 day') d,
       jsonb_array_elements((select data->'rooster' from public.rij where club_id = 'dcg' and soort = 'teams' and id = 'O12-1')) r
  where extract(dow from d) = (r->>'dag')::int
    and not exists (select 1 from vrij where d::date between vrij.van and vrij.tot)
)
insert into public.rij (club_id, soort, id, scope, team_id, act_id, data)
select 'dcg', 'acts', 'a-o12-' || to_char(datum, 'YYYYMMDD'), 'team', 'O12-1', 'a-o12-' || to_char(datum, 'YYYYMMDD'),
  jsonb_build_object('id', 'a-o12-' || to_char(datum, 'YYYYMMDD'), 'teamId', 'O12-1', 'soort', 'training', 'datum', datum::text,
    'tijd', r->>'tijd', 'eind', r->>'eind', 'veld', r->>'veld', 'afgelast', false)
from dagen;

commit;
