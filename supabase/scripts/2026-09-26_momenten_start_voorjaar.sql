-- Besluit 65: gespreksmomenten DCG naar Start (20 sep – 10 okt, vóór de herfstvakantie) en Voorjaar (4 – 31 maart).
-- Alleen als de oude standaard (Winter / Einde seizoen) er nog staat en er nog geen beoordelingen zijn.
update public.rij set data = jsonb_set(data, '{momenten}', '[{"id":"m1","naam":"Start","tot":"2026-10-10","weken":3},{"id":"m2","naam":"Voorjaar","tot":"2027-03-31","weken":4}]'::jsonb)
where club_id = 'dcg' and soort = 'club' and data->'momenten'->0->>'naam' = 'Winter'
  and not exists (select 1 from public.rij b where b.club_id = 'dcg' and b.soort like 'beoord%');
