-- DCG O12 talententeam: thuis en uit 60 minuten voor de aftrap verzamelen (vervangt thuis 45 uit 2026-10-18).
update rij set data = jsonb_set(data, '{afwijking}', coalesce(data->'afwijking', '{}'::jsonb) || '{"verzamelThuis":60,"verzamelUit":60}'::jsonb), bijgewerkt = now()
where club_id = 'dcg' and soort = 'teams' and id = 'O12-1';
update rij set data = data || '{"verzamel":"11:30"}'::jsonb, bijgewerkt = now() where club_id = 'dcg' and soort = 'acts' and id = 'w-o12-20261107';
update rij set data = data || '{"verzamel":"13:30"}'::jsonb, bijgewerkt = now() where club_id = 'dcg' and soort = 'acts' and id = 'w-o12-20261128';
