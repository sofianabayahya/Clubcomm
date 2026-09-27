-- ClubComm — e-mail bij een antwoord op een bericht (Besluit 36). Groeit de lijst antwoorden, dan krijgt de
-- Edge Function "melding" een seintje met het nummer van het nieuwe antwoord.
create or replace function priv.cc_mail_antwoord() returns trigger language plpgsql security definer set search_path = public as $$
declare n int := jsonb_array_length(coalesce(new.data->'antw', '[]'::jsonb));
begin
  if n > jsonb_array_length(coalesce(old.data->'antw', '[]'::jsonb)) then
    perform net.http_post(
      url := 'https://pkvacwbdgumkffxnxnqk.supabase.co/functions/v1/melding',
      body := jsonb_build_object('club', new.club_id, 'id', new.id, 'antw', n),
      headers := '{"Content-Type": "application/json"}'::jsonb
    );
  end if;
  return null;
end $$;
revoke execute on function priv.cc_mail_antwoord() from public, anon, authenticated;

drop trigger if exists cc_mail_antw on public.rij;
create trigger cc_mail_antw after update on public.rij
  for each row when (new.soort = 'msgs') execute function priv.cc_mail_antwoord();
