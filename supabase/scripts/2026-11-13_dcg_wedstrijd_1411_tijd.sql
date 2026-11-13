-- DCG O13 talententeam: wedstrijd za 14-11 uit bij Sporting Martinus O13-4 is op voetbal.nl verplaatst.
-- Aftrap 12:45 → 11:35, verzamelen 11:45 → 10:30, einde 14:00 → 12:50. Uitgevoerd 13-11 na akkoord van de gebruiker.
-- Alleen deze ene wedstrijd; alleen als hij nog op de oude tijd staat (anders verandert er niets).
update public.rij
   set data = data || '{"tijd":"11:35","eind":"12:50","verzamel":"10:30"}'::jsonb
 where club_id = 'dcg' and soort = 'acts' and id = 'w-o12-20261114'
   and data->>'tijd' = '12:45' and data->>'datum' = '2026-11-14'
returning id, data->>'datum' as datum, data->>'tijd' as tijd, data->>'verzamel' as verzamel, data->>'eind' as eind;
