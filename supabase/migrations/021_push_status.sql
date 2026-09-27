-- ClubComm — Besluit 83: wie krijgt pushmeldingen? Alleen aan/uit per ouder, alleen voor de staf van het team
-- (trainer, teamleider, coördinator van de groep; HJO/beheerder alle teams). Geen toestel, adres of keuzes.
create or replace function public.push_status() returns text[]
language sql stable security definer set search_path = public as $$
  select coalesce(array_agg(distinct a.persoon_id), '{}') from public.push_abonnement a
  where a.club_id = priv.cc_club()
    and exists (select 1 from public.rij p where p.club_id = a.club_id and p.soort = 'players'
                and p.team_id = any(priv.cc_staf_teams()) and coalesce(p.data->'ouders', '[]') ? a.persoon_id);
$$;
revoke all on function public.push_status() from public, anon;
grant execute on function public.push_status() to authenticated;
