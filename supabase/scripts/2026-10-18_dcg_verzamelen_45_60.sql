-- Besluit 108: DCG O12 talententeam verzamelt thuis 45 en uit 60 minuten voor de aftrap.
-- Teaminstelling (geldt voor nieuwe wedstrijden) en de twee thuiswedstrijden uit Sportlink (uit stond al op 60 minuten).
update rij set data = jsonb_set(data, '{afwijking}', coalesce(data->'afwijking', '{}'::jsonb) || '{"verzamelThuis":45,"verzamelUit":60}'::jsonb), bijgewerkt = now()
where club_id = 'dcg' and soort = 'teams' and id = 'O12-1';
update rij set data = data || '{"verzamel":"11:45"}'::jsonb, bijgewerkt = now() where club_id = 'dcg' and soort = 'acts' and id = 'w-o12-20261107';
update rij set data = data || '{"verzamel":"13:45"}'::jsonb, bijgewerkt = now() where club_id = 'dcg' and soort = 'acts' and id = 'w-o12-20261128';
