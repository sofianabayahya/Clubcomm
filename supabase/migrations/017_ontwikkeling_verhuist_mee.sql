-- ClubComm — Besluit 71: de ontwikkeling van een kind gaat mee naar een nieuw team en een nieuw seizoen.
-- Rechten hangen aan team_id. Verhuist een speler (team_id van de rij 'players' verandert), dan krijgen zijn
-- ontwikkelgegevens hetzelfde team, zodat de nieuwe trainer de eerdere gesprekken ziet en de oude trainer niet meer.
create or replace function priv.cc_speler_verhuist() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.team_id is distinct from old.team_id and new.team_id is not null then
    update public.rij set team_id = new.team_id
     where club_id = new.club_id and speler_id = new.id
       and soort in ('ontwVoorb', 'ontwVerslag', 'ontwNotitie', 'beoord', 'beoordGezien');
  end if;
  return new;
end $$;

drop trigger if exists cc_speler_verhuist on public.rij;
create trigger cc_speler_verhuist after update of team_id on public.rij
  for each row when (new.soort = 'players') execute function priv.cc_speler_verhuist();
