-- ClubComm — Besluit 63: "Club leegmaken" en "Voorbeelddata laden" alleen bij een nieuwe club.
-- Zodra er meer dan 3 accounts aan de club gekoppeld zijn (echte ouders en staf), weigert de database dit,
-- ook als iemand de knop op een andere manier aanroept. Terug naar een lege club kan dan alleen via de ontwikkelaar
-- (script in supabase/scripts/ met back-up vooraf), niet met één tik in de app.
create or replace function public.club_leegmaken() returns integer language plpgsql security definer set search_path = public as $$
declare c text := priv.cc_club(); ik text := priv.cc_ik(); n int;
begin
  if not priv.cc_admin() then raise exception 'Alleen de HJO of clubbeheerder mag dit'; end if;
  if (select count(*) from public.lid where club_id = c) > 3 then raise exception 'Deze club is in gebruik: leegmaken kan niet meer vanuit de app'; end if;
  delete from public.rij where club_id = c and soort <> 'club' and not (soort in ('people','contact') and id = ik);
  get diagnostics n = row_count;
  delete from public.lid where club_id = c and persoon_id <> ik;
  return n;
end $$;
create or replace function public.club_vullen(p_rijen jsonb) returns integer language plpgsql security definer set search_path = public as $$
declare c text := priv.cc_club(); ik text := priv.cc_ik(); n int;
begin
  if not priv.cc_admin() then raise exception 'Alleen de HJO of clubbeheerder mag dit'; end if;
  if (select count(*) from public.lid where club_id = c) > 3 then raise exception 'Deze club is in gebruik: voorbeelddata laden kan niet meer'; end if;
  insert into public.rij (club_id, soort, id, scope, team_id, speler_id, persoon_id, act_id, data)
  select c, r->>'soort', r->>'id', r->>'scope', r->>'team_id', r->>'speler_id', r->>'persoon_id', r->>'act_id', r->'data'
  from jsonb_array_elements(p_rijen) r
  where not (r->>'soort' in ('contact','people') and r->>'id' = ik) and r->>'soort' <> 'club'
  on conflict (club_id, soort, id) do update set scope = excluded.scope, team_id = excluded.team_id, speler_id = excluded.speler_id,
    persoon_id = excluded.persoon_id, act_id = excluded.act_id, data = excluded.data;
  get diagnostics n = row_count;
  return n;
end $$;
