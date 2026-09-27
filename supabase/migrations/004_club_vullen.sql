-- ClubComm — beheer door HJO/clubbeheerder: club vullen met voorbeelddata (om te testen) en weer leegmaken.
-- De club-rij en de eigen persoon blijven altijd bestaan.

create or replace function public.club_vullen(p_rijen jsonb) returns int language plpgsql security definer set search_path = public as $$
declare c text := priv.cc_club(); ik text := priv.cc_ik(); n int;
begin
  if not priv.cc_admin() then raise exception 'Alleen de HJO of clubbeheerder mag dit'; end if;
  insert into public.rij (club_id, soort, id, scope, team_id, speler_id, persoon_id, act_id, data)
  select c, r->>'soort', r->>'id', r->>'scope', r->>'team_id', r->>'speler_id', r->>'persoon_id', r->>'act_id', r->'data'
  from jsonb_array_elements(p_rijen) r
  where not (r->>'soort' in ('contact','people') and r->>'id' = ik) and r->>'soort' <> 'club'
  on conflict (club_id, soort, id) do update set scope = excluded.scope, team_id = excluded.team_id, speler_id = excluded.speler_id,
    persoon_id = excluded.persoon_id, act_id = excluded.act_id, data = excluded.data;
  get diagnostics n = row_count;
  return n;
end $$;

create or replace function public.club_leegmaken() returns int language plpgsql security definer set search_path = public as $$
declare c text := priv.cc_club(); ik text := priv.cc_ik(); n int;
begin
  if not priv.cc_admin() then raise exception 'Alleen de HJO of clubbeheerder mag dit'; end if;
  delete from public.rij where club_id = c and soort <> 'club' and not (soort in ('people','contact') and id = ik);
  get diagnostics n = row_count;
  delete from public.lid where club_id = c and persoon_id <> ik;
  return n;
end $$;

revoke execute on function public.club_vullen(jsonb) from public, anon;
revoke execute on function public.club_leegmaken() from public, anon;
grant execute on function public.club_vullen(jsonb) to authenticated;
grant execute on function public.club_leegmaken() to authenticated;
