-- DCG O12 talententeam (in de competitie: DCG Rksv O13-8): competitiewedstrijden fase 2 uit de Sportlink-agenda (iCal), 17-10-2026.
-- Aftrap = begintijd uit Sportlink. Verzamelen: thuis 30 minuten, uit 60 minuten voor de aftrap (zelfde regel als "Wedstrijd toevoegen").
-- Einde = aftrap + 2 x 30 minuten + 15. Veilig om opnieuw te draaien (bestaande rijen worden bijgewerkt, afmeldingen blijven staan).
insert into rij (club_id, soort, id, scope, team_id, act_id, data)
select 'dcg', 'acts', w.id, 'team', 'O12-1', w.id, jsonb_build_object(
  'id', w.id, 'teamId', 'O12-1', 'soort', 'wedstrijd', 'datum', w.datum, 'tijd', w.tijd, 'eind', w.eind, 'thuis', w.thuis,
  'tegen', w.tegen, 'veld', '', 'adres', w.adres, 'verzamel', w.verzamel, 'tenue', case when w.thuis then 'Thuistenue' else 'Uittenue' end,
  'begeleiderId', 'p1790340767432', 'uitslag', null, 'afgelast', false, 'competitie', '2e klasse (2e fase) 07', 'sportlink', w.uid)
from (values
  ('w-o12-20261031', '2026-10-31', '11:00', '12:15', false, 'Atletico Club Amsterdam O13-5', 'Sportpark De Eendracht, Bok de Korverweg 12, 1067 HR Amsterdam', '10:00', '20261017T213936Z-1@sportlink.com'),
  ('w-o12-20261107', '2026-11-07', '12:30', '13:45', true,  'vv Zwanenburg O13-1',           'Sportpark Ookmeer, Herman Bonpad 7, 1067 SN Amsterdam',            '12:00', '20261017T213934Z-1@sportlink.com'),
  ('w-o12-20261114', '2026-11-14', '12:45', '14:00', false, 'Sporting Martinus O13-4',       'Sportpark Overburg, Amsterdamseweg 247, 1182 GZ Amstelveen',       '11:45', '20261017T213937Z-1@sportlink.com'),
  ('w-o12-20261121', '2026-11-21', '12:30', '13:45', false, 'AGB O13-1',                     'Sportpark Ookmeer, Abe Lenstralaan 6, 1067 MV Amsterdam',          '11:30', '20261017T213938Z-1@sportlink.com'),
  ('w-o12-20261128', '2026-11-28', '14:30', '15:45', true,  'Buitenveldert sc. O13-2',       'Sportpark Ookmeer, Herman Bonpad 7, 1067 SN Amsterdam',            '14:00', '20261017T213935Z-1@sportlink.com'),
  ('w-o12-20261205', '2026-12-05', '09:00', '10:15', false, 'SCPB''22 O13-5',                'Sportpark De Veldpost, Veldpostpark 3, 1171 LM Badhoevedorp',      '08:00', '20261017T213939Z-1@sportlink.com')
) as w(id, datum, tijd, eind, thuis, tegen, adres, verzamel, uid)
on conflict (club_id, soort, id) do update set bijgewerkt = now(), data = rij.data || (excluded.data - 'uitslag' - 'afgelast');
