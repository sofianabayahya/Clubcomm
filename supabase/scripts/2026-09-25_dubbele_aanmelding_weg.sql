-- Dubbele open aanmelding van Tahsin (zelfde ouder, zelfde kind; de tweede aanvraag is al goedgekeurd). Open duplicaat verwijderen.
delete from public.rij where club_id = 'dcg' and soort = 'aanm' and id = 'm1790357994571' and data->>'status' = 'open'
  and exists (select 1 from public.rij r where r.club_id = 'dcg' and r.soort = 'aanm' and r.id = 'm1790358855742' and r.data->>'status' = 'ok');
