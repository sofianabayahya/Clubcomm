-- ClubComm — AVV Swift: team JO16-2 ZO (zondag) aanmaken, trainer Fabian koppelen en 6 competitiewedstrijden invoeren (29-10-2026).
-- Eenmalig uitgevoerd met execute_sql. Trainingsdagen volgen zodra bekend (rooster nu leeg). Dubbele regels uit de lijst één keer.
begin;
insert into public.rij (club_id, soort, id, scope, team_id, data) values ('swift', 'teams', 'O16-2', 'club', 'O16-2',
  '{"id": "O16-2", "naam": "JO16-2 ZO", "cat": "O16", "type": "breedte", "rooster": [], "afwijking": {}, "trainerId": "p1793213239679", "teamleiderId": null}')
on conflict do nothing;
update public.rij set data = jsonb_set(data, '{rollen}', '[{"rol": "trainer", "teamId": "O16-2"}]')
where club_id = 'swift' and soort = 'people' and id = 'p1793213239679';
insert into public.rij (club_id, soort, id, scope, team_id, act_id, data)
select 'swift', 'acts', w.id, 'team', 'O16-2', w.id, jsonb_build_object('id', w.id, 'teamId', 'O16-2', 'soort', 'wedstrijd', 'datum', w.datum, 'tijd', w.tijd, 'eind', w.eind,
  'tegen', w.tegen, 'thuis', w.thuis, 'veld', '', 'afgelast', false, 'uitslag', null, 'competitie', 'Zondag O16')
from (values
  ('w-o16-20261101', '2026-11-01', '10:30', '12:05', 'Kon. HFC O16-1', true),
  ('w-o16-20261115', '2026-11-15', '11:00', '12:35', 'AFC O16-2', true),
  ('w-o16-20261122', '2026-11-22', '10:00', '11:35', 'RODA ''23 Rksv O16-1', false),
  ('w-o16-20261129', '2026-11-29', '13:00', '14:35', 'Sporting Martinus O16-3', false),
  ('w-o16-20261206', '2026-12-06', '11:00', '12:35', 'Waterwijk asc O16-1', true),
  ('w-o16-20261213', '2026-12-13', '13:00', '14:35', 'SCPB''22 O16-2', false)
) w(id, datum, tijd, eind, tegen, thuis)
on conflict do nothing;
commit;

-- Aanvulling (29-10): 6 competitiewedstrijden van JO15-1 ZA (zaterdag). JO16-1 bewust niet ingevoerd (vergissing in de lijst).
insert into public.rij (club_id, soort, id, scope, team_id, act_id, data)
select 'swift', 'acts', w.id, 'team', 'O15-1', w.id, jsonb_build_object('id', w.id, 'teamId', 'O15-1', 'soort', 'wedstrijd', 'datum', w.datum, 'tijd', w.tijd, 'eind', w.eind,
  'tegen', w.tegen, 'thuis', w.thuis, 'veld', '', 'afgelast', false, 'uitslag', null, 'competitie', 'Zaterdag O15')
from (values
  ('w-o15-20261031', '2026-10-31', '10:15', '11:40', 'AFC 34 O15-1', false),
  ('w-o15-20261107', '2026-11-07', '11:45', '13:10', 'VVC fc O15-1', true),
  ('w-o15-20261114', '2026-11-14', '10:15', '11:40', 'ARC O15-1', false),
  ('w-o15-20261121', '2026-11-21', '11:45', '13:10', 'Telstar 1963 O15-1', true),
  ('w-o15-20261128', '2026-11-28', '10:30', '11:55', 'DCG Rksv O15-1', false),
  ('w-o15-20261205', '2026-12-05', '12:30', '13:55', 'SDZ O15-1', false)
) w(id, datum, tijd, eind, tegen, thuis)
on conflict do nothing;
