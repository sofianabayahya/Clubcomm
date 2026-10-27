-- 27-10-2026: het team heet nu "O13 talententeam" (speelt al in de O13-competitie, speelCat O13).
-- Alleen de naam; de interne code O12-1 en de leeftijdscategorie (O12, geboortejaar 2015) blijven.
update public.rij set data = jsonb_set(data, '{naam}', '"O13 talententeam"')
where club_id = 'dcg' and soort = 'teams' and id = 'O12-1' and data->>'naam' = 'O12 talententeam';
