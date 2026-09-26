-- Besluit 75: vaste clubberichten volledig automatisch (vakantie, ontwikkelgesprekken, start en einde seizoen).
update public.rij set data = jsonb_set(data, '{autoBerichten}', (
  select jsonb_agg(case when x->>'id' in ('vakantie','beoordeling','start','eind') then jsonb_set(x, '{auto}', 'true'::jsonb) else x end)
  from jsonb_array_elements(data->'autoBerichten') x))
where club_id = 'dcg' and soort = 'club';
