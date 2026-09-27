-- ClubComm — pushmeldingen (Besluit 53).
-- * push_abonnement: per telefoon/browser het "brievenbus-adres" voor pushmeldingen, met de keuzes per soort melding.
-- * push_sleutel: het sleutelpaar (VAPID) om pushmeldingen te mogen sturen. Wordt één keer door de Edge Function
--   "melding" gemaakt en verlaat de server nooit; de app krijgt alleen de publieke helft (push_sleutel()).
-- * push_wachtrij: pushmeldingen tijdens de nachtrust (21:00–07:30), 's ochtends verstuurd door pg_cron.
-- * Seintjes naar "melding" bij een nieuwe afmelding (trainer, alleen op de dag zelf) en een nieuwe aanmelding (staf).
-- Alle tabellen: RLS aan en geen policies = alleen de server (service role) kan erbij; de app gebruikt de functies hieronder.

create table if not exists public.push_abonnement (
  endpoint   text primary key,
  club_id    text not null,
  persoon_id text not null,
  auth_uid   uuid not null references auth.users (id) on delete cascade,
  p256dh     text not null,
  auth       text not null,
  voorkeur   jsonb not null default '{}'::jsonb,   -- {persoonlijk, aankondiging, herinnering, staf}: false = uit; noodberichten altijd
  toestel    text,
  gemaakt    timestamptz not null default now(),
  laatst     timestamptz
);
create index if not exists push_abonnement_persoon on public.push_abonnement (club_id, persoon_id);
alter table public.push_abonnement enable row level security;
revoke all on public.push_abonnement from anon, authenticated;

create table if not exists public.push_sleutel (
  id      int primary key default 1 check (id = 1),
  publiek text not null,
  prive   text not null,
  gemaakt timestamptz not null default now()
);
alter table public.push_sleutel enable row level security;
revoke all on public.push_sleutel from anon, authenticated;

create table if not exists public.push_wachtrij (
  id       bigserial primary key,
  endpoint text not null,
  bericht  jsonb not null,
  tijd     timestamptz not null default now()
);
alter table public.push_wachtrij enable row level security;
revoke all on public.push_wachtrij from anon, authenticated;

-- Publieke sleutel voor de app (niet geheim)
create or replace function public.push_sleutel() returns text language sql stable security definer set search_path = public as $$
  select publiek from public.push_sleutel where id = 1
$$;
revoke execute on function public.push_sleutel() from public, anon;
grant execute on function public.push_sleutel() to authenticated;

-- Deze telefoon aanmelden (of keuzes bijwerken). Alleen voor wie aan een persoon in de club gekoppeld is.
create or replace function public.push_aan(p_club text, p_endpoint text, p_p256dh text, p_auth text, p_voorkeur jsonb default '{}'::jsonb, p_toestel text default null)
returns boolean language plpgsql security definer set search_path = public as $$
declare pid text;
begin
  if auth.uid() is null then raise exception 'Log eerst in'; end if;
  select persoon_id into pid from public.lid where auth_uid = auth.uid() and club_id = p_club;
  if pid is null then raise exception 'Je bent nog niet gekoppeld aan de club'; end if;
  if p_endpoint !~ '^https://' or length(p_endpoint) > 1000 then raise exception 'Ongeldig adres'; end if;
  insert into public.push_abonnement (endpoint, club_id, persoon_id, auth_uid, p256dh, auth, voorkeur, toestel)
    values (p_endpoint, p_club, pid, auth.uid(), left(p_p256dh, 200), left(p_auth, 100), coalesce(p_voorkeur, '{}'::jsonb), left(p_toestel, 120))
  on conflict (endpoint) do update set club_id = excluded.club_id, persoon_id = excluded.persoon_id, auth_uid = excluded.auth_uid,
    p256dh = excluded.p256dh, auth = excluded.auth, voorkeur = excluded.voorkeur, toestel = excluded.toestel;
  return true;
end $$;
revoke execute on function public.push_aan(text, text, text, text, jsonb, text) from public, anon;
grant execute on function public.push_aan(text, text, text, text, jsonb, text) to authenticated;

-- Deze telefoon afmelden
create or replace function public.push_uit(p_endpoint text) returns boolean language sql security definer set search_path = public as $$
  with weg as (delete from public.push_abonnement where endpoint = p_endpoint and auth_uid = auth.uid() returning 1) select exists (select 1 from weg)
$$;
revoke execute on function public.push_uit(text) from public, anon;
grant execute on function public.push_uit(text) to authenticated;

-- Seintje naar de Edge Function bij een nieuwe afmelding of aanmelding
create or replace function priv.cc_push_seintje() returns trigger language plpgsql security definer set search_path = public as $$
begin
  perform net.http_post(
    url := 'https://pkvacwbdgumkffxnxnqk.supabase.co/functions/v1/melding',
    body := jsonb_build_object('club', new.club_id, 'soort', new.soort, 'rij', new.id),
    headers := '{"Content-Type": "application/json"}'::jsonb
  );
  return null;
end $$;
revoke execute on function priv.cc_push_seintje() from public, anon, authenticated;
drop trigger if exists cc_push on public.rij;
create trigger cc_push after insert on public.rij
  for each row when (new.soort in ('afm', 'aanm')) execute function priv.cc_push_seintje();

-- Nachtrust: 's ochtends de wachtrij versturen. Elke 15 minuten tussen 05:00 en 07:59 UTC (07:30 Amsterdam valt daar
-- zowel in zomer- als wintertijd in); de Edge Function verstuurt pas als het in Amsterdam 07:30 of later is.
select cron.unschedule('clubcomm-push-ochtend') where exists (select 1 from cron.job where jobname = 'clubcomm-push-ochtend');
select cron.schedule('clubcomm-push-ochtend', '*/15 5-7 * * *',
  $$select net.http_post(url := 'https://pkvacwbdgumkffxnxnqk.supabase.co/functions/v1/melding', body := '{"wachtrij": true}'::jsonb, headers := '{"Content-Type": "application/json"}'::jsonb)$$);
