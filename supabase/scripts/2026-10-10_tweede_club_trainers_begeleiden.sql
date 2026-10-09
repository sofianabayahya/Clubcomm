-- ClubComm — tweede club inrichten met het pakket "Alleen Trainers begeleiden" (Besluit 100), 10 oktober 2026.
-- Eenmalig uitgevoerd met execute_sql (geen schemawijziging). Namen en e-mailadressen staan alleen in de database,
-- hier als <...>. Club-id 'swift'. Zo richt je ook een volgende club in tot de ClubComm-adviseur een eigen account heeft.

begin;
-- 1. Club: instellingen overgenomen van DCG (vakanties, regels), zonder DCG-eigen dingen; geen automatische berichten
insert into public.rij (club_id, soort, id, scope, data)
select 'swift', 'club', 'club', 'club',
  (data - 'sportpark' - 'groepen' - 'momenten')
  || jsonb_build_object('id', 'swift', 'naam', '<clubnaam>', 'pakket', 'trainers', 'coordinatorAan', false, 'sportpark', '', 'groepen', '[]'::jsonb, 'momenten', '[]'::jsonb, 'stops', '[]'::jsonb,
     'labels', jsonb_build_object('hjo', 'HO', 'coordinator', 'Coördinator'),
     'modules', jsonb_build_object('taken', false, 'vervoer', false, 'materiaal', false, 'speeltijd', false, 'beloningen', false, 'beoordeling', false),
     'autoBerichten', (select jsonb_agg(b || '{"aan": false}'::jsonb) from jsonb_array_elements(data->'autoBerichten') b),
     'ingericht', jsonb_build_object('regels', true, 'rollen', true, 'modules', true, 'seizoen', true, 'vakanties', true))
from public.rij where club_id = 'dcg' and soort = 'club';

-- 2. Team(s) van de trainers die meedoen
insert into public.rij (club_id, soort, id, scope, team_id, data) values ('swift', 'teams', 'O15-1', 'club', 'O15-1',
  '{"id": "O15-1", "naam": "<teamnaam>", "cat": "O15", "type": "selectie", "rooster": [], "afwijking": {}, "trainerId": "p-acevit", "teamleiderId": null}');

-- 3. Personen: HO + clubbeheerder, technisch coördinator, trainer (people = naam en rollen; contact = e-mail om in te loggen)
insert into public.rij (club_id, soort, id, scope, persoon_id, data) values
 ('swift', 'people', 'p-ho', 'persoon', 'p-ho', '{"id": "p-ho", "naam": "<naam HO>", "rollen": [{"rol": "hjo"}, {"rol": "beheerder"}]}'),
 ('swift', 'contact', 'p-ho', 'contact', 'p-ho', '{"email": "<e-mail HO>", "tel": ""}'),
 ('swift', 'people', 'p-tc', 'persoon', 'p-tc', '{"id": "p-tc", "naam": "<naam TC>", "rollen": [{"rol": "tc"}]}'),
 ('swift', 'contact', 'p-tc', 'contact', 'p-tc', '{"email": "<e-mail TC>", "tel": ""}'),
 ('swift', 'people', 'p-acevit', 'persoon', 'p-acevit', '{"id": "p-acevit", "naam": "<naam trainer>", "rollen": [{"rol": "trainer", "teamId": "O15-1"}]}'),
 ('swift', 'contact', 'p-acevit', 'contact', 'p-acevit', '{"email": "<e-mail trainer, mag later>", "tel": ""}');

-- 4. Traject van de trainer en het eerste begeleidingsmoment (wedstrijd 8 okt) met het voorgesprek als ingevulde
--    vragenlijst (soort begeleidZelf, scope trainerzelf). De observatie en het gesprek neemt de HO over uit /evaluatie.
--    (rijen trainerDossier, begeleidMomenten 'bm-swift-1', begeleidZelf 'bm-swift-1'; inhoud: zie de database)
commit;
