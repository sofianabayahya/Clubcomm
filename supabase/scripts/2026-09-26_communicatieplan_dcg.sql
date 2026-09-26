-- Besluit 74: vakantie-herinnering 7 dagen vooraf; tekst ontwikkelgesprekken bijwerken.
update public.rij set data = jsonb_set(data, '{autoBerichten}', (
  select jsonb_agg(case
    when x->>'id' = 'vakantie' then jsonb_set(x, '{schema}', '[7]'::jsonb)
    when x->>'id' = 'beoordeling' then x || jsonb_build_object('naam', 'Ontwikkelgesprekken', 'tekst', 'Van [datum] tot [tot] houden de trainers een kort ontwikkelgesprek met ouder en kind (15 minuten, rond de training). Je krijgt een bericht om een tijd te kiezen, en daarna een korte opdracht voor je kind: waar ben je sterk in, wat is je wapen, wat wil je leren?')
    else x end)
  from jsonb_array_elements(data->'autoBerichten') x))
where club_id = 'dcg' and soort = 'club';
