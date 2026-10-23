-- Besluit 110: verzamelen is clubbeleid per leeftijd. De verzameltijd per team (Besluit 108) vervalt bij DCG O12-1;
-- het team speelt O13 en valt onder "vanaf O13: thuis en uit 60 minuten" (standaard).
update rij set data = jsonb_set(data, '{afwijking}', coalesce(data->'afwijking', '{}'::jsonb) - 'verzamelThuis' - 'verzamelUit'), bijgewerkt = now()
where club_id = 'dcg' and soort = 'teams' and id = 'O12-1';
