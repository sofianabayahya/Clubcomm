-- ClubComm — Besluit 107: per bericht legt de server (Edge Function "melding") vast wie een pushmelding en wie een e-mail
-- kreeg (rij soort "bezorgd", scope "bericht": lezen mogen de deelnemers van het bericht). Alleen de server mag deze rijen
-- maken, wijzigen of weghalen; zo kan niemand de afzender een verkeerd beeld geven.
create or replace function priv.cc_bezorgd_bewaak() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is not null then raise exception 'Alleen de server legt vast hoe een bericht is aangekomen'; end if;
  return case when tg_op = 'DELETE' then old else new end;
end $$;
revoke execute on function priv.cc_bezorgd_bewaak() from public, anon, authenticated;
drop trigger if exists cc_bezorgd on public.rij;
create trigger cc_bezorgd before insert or update on public.rij for each row when (new.soort = 'bezorgd') execute function priv.cc_bezorgd_bewaak();
drop trigger if exists cc_bezorgd_weg on public.rij;
create trigger cc_bezorgd_weg before delete on public.rij for each row when (old.soort = 'bezorgd') execute function priv.cc_bezorgd_bewaak();
