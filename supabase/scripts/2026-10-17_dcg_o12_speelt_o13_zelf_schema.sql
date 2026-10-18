-- Besluit 106: DCG O12 talententeam speelt in de O13-competitie (11 tegen 11, 2 x 30 min) en de trainer maakt het wisselschema zelf.
update rij set data = data || '{"speelCat":"O13"}'::jsonb, bijgewerkt = now() where club_id = 'dcg' and soort = 'teams' and id = 'O12-1';
insert into rij (club_id, soort, id, scope, team_id, data) values ('dcg', 'teamKeuze', 'O12-1', 'teamstaf', 'O12-1', '{"wisselwijze":"zelf"}')
on conflict (club_id, soort, id) do update set data = rij.data || excluded.data, bijgewerkt = now();
