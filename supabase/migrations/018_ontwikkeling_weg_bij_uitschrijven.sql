-- ClubComm — Besluit 72: ontwikkelgegevens bewaren we zolang het kind lid is.
-- Wordt een kind uitgeschreven (team_id van de rij 'players' wordt leeg), dan verdwijnen de voorbereiding, het verslag,
-- de notitie en de kijk van de trainer meteen. Bij een ander team verhuizen ze mee (zoals in 017).
-- Let op: de wekelijkse back-up bewaart ze nog maximaal 8 weken (008).
create or replace function priv.cc_speler_verhuist() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.team_id is null and old.team_id is not null then
    delete from public.rij
     where club_id = new.club_id and speler_id = new.id
       and soort in ('ontwVoorb', 'ontwVerslag', 'ontwNotitie', 'beoord', 'beoordGezien');
  elsif new.team_id is distinct from old.team_id then
    update public.rij set team_id = new.team_id
     where club_id = new.club_id and speler_id = new.id
       and soort in ('ontwVoorb', 'ontwVerslag', 'ontwNotitie', 'beoord', 'beoordGezien');
  end if;
  return new;
end $$;
