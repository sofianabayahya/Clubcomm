-- DCG O13 talententeam: wedstrijd za 21-11 uit bij AGB O13-1 is op voetbal.nl naar een andere tijd gezet.
-- Aftrap 12:30 → 10:30, verzamelen 11:30 → 09:30, einde 13:45 → 11:45. Uitgevoerd 20-11 na akkoord van de gebruiker.
-- Alleen deze ene wedstrijd; alleen als hij nog op de oude tijd staat (anders verandert er niets).
update public.rij
   set data = data || '{"tijd":"10:30","eind":"11:45","verzamel":"09:30"}'::jsonb
 where club_id = 'dcg' and soort = 'acts' and id = 'w-o12-20261121'
   and data->>'tijd' = '12:30' and data->>'datum' = '2026-11-21'
returning id, data->>'datum' as datum, data->>'tijd' as tijd, data->>'verzamel' as verzamel, data->>'eind' as eind;
