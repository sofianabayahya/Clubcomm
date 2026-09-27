-- Besluit 71: de vaste keepers van O12 talententeam (Xaverio en Rayan) als keeper markeren.
-- Later aan te passen door de trainer op de spelerspagina (Positie: Veldspeler / Keeper).
update public.rij set data = data || '{"positie":"keeper"}'::jsonb
 where club_id = 'dcg' and soort = 'players' and id in ('s1790339395981', 's1790343479337');
