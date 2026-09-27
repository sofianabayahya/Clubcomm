-- ClubComm — e-mailmeldingen (Besluit 35). Bij een nieuw bericht (rij met soort 'msgs') roept de database
-- de Edge Function "melding" aan; die verstuurt via Brevo een e-mail naar de ontvangers.
-- Elk bericht wordt hooguit één keer gemaild (tabel mail_log). De Brevo-sleutel staat als secret bij de Edge Function.

create extension if not exists pg_net;

create table if not exists public.mail_log (
  club_id text not null,
  msg_id  text not null,
  tijd    timestamptz not null default now(),
  aantal  int,
  notitie text,
  primary key (club_id, msg_id)
);
alter table public.mail_log enable row level security;   -- geen policies: alleen de server (service role) kan erbij
revoke all on public.mail_log from anon, authenticated;

create or replace function priv.cc_mail_seintje() returns trigger language plpgsql security definer set search_path = public as $$
begin
  perform net.http_post(
    url := 'https://pkvacwbdgumkffxnxnqk.supabase.co/functions/v1/melding',
    body := jsonb_build_object('club', new.club_id, 'id', new.id),
    headers := '{"Content-Type": "application/json"}'::jsonb
  );
  return null;
end $$;
revoke execute on function priv.cc_mail_seintje() from public, anon, authenticated;

drop trigger if exists cc_mail on public.rij;
create trigger cc_mail after insert on public.rij
  for each row when (new.soort = 'msgs') execute function priv.cc_mail_seintje();
