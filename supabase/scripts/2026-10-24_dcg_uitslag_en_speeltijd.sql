-- DCG O12-1, wedstrijd 24-10-2026 tegen DCG O13-3 (a1792340130134). Besluit 116.
-- 1. De timekeeper (een ouder) hield doelpunten en uitslag bij, maar de database weigerde die (nu opgelost met migratie 029).
--    Uitslag en makers komen uit het uitslagbericht dat wel verstuurd is (6-2; 2×, 2×, 1×, 1×; 2 tegendoelpunten).
-- 2. De tegenstander speelde met onze spelers: iedereen heeft even lang gespeeld. Speeltijd voor alle 16 spelers 60 minuten
--    (op verzoek van de trainer, eenmalig; dit was de eerste wedstrijd die meetelt).
update public.rij set data = data || jsonb_build_object(
  'uitslag', '6-2', 'uitslagKlaar', true, 'uitslagVerstuurd', '2026-10-24T09:47:59.794Z',
  'goals', jsonb_build_array(
    jsonb_build_object('id', 'g-24-1', 'wij', true, 'spelerId', 's1790339394096', 'eigen', false),
    jsonb_build_object('id', 'g-24-2', 'wij', true, 'spelerId', 's1790339394096', 'eigen', false),
    jsonb_build_object('id', 'g-24-3', 'wij', true, 'spelerId', 's1790350142198', 'eigen', false),
    jsonb_build_object('id', 'g-24-4', 'wij', true, 'spelerId', 's1790350142198', 'eigen', false),
    jsonb_build_object('id', 'g-24-5', 'wij', true, 'spelerId', 's1790343480020', 'eigen', false),
    jsonb_build_object('id', 'g-24-6', 'wij', true, 'spelerId', 's1790430411848', 'eigen', false),
    jsonb_build_object('id', 'g-24-7', 'wij', false),
    jsonb_build_object('id', 'g-24-8', 'wij', false)))
where club_id = 'dcg' and soort = 'acts' and id = 'a1792340130134';

update public.rij set data = '{"__v": 60}'::jsonb
where club_id = 'dcg' and soort = 'speeltijdMin' and team_id = 'O12-1' and (data->>'__v')::int = 30;
