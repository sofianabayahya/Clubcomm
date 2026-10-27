-- 27-10-2026 (Besluit 130): module Trainingen (proef) aan voor AVV Swift (pakket Trainers begeleiden): trainingen op datum.
update public.rij set data = jsonb_set(coalesce(data, '{}'::jsonb), '{modules}', coalesce(data->'modules', '{}'::jsonb) || '{"training": true}'::jsonb)
where club_id = 'swift' and soort = 'club' and id = 'club';
