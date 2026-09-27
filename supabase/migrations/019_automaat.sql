-- ClubComm — Besluit 77: automatisch werk vanaf de server (Edge Function "automaat"), elk kwartier.
-- Geheim: alleen de database (pg_cron) mag de functie starten. De tabel heeft RLS aan en geen regels: alleen de server leest hem.
create table if not exists public.automaat_geheim (geheim text not null);
alter table public.automaat_geheim enable row level security;
insert into public.automaat_geheim (geheim) select encode(extensions.gen_random_bytes(24), 'hex') where not exists (select 1 from public.automaat_geheim);

-- Logboek: wanneer draaide de server en wat deed hij (14 dagen bewaard). Alleen de server schrijft en leest.
create table if not exists public.automaat_log (
  id bigserial primary key,
  club_id text not null,
  tijd timestamptz not null default now(),
  ok boolean not null default true,
  samenvatting text
);
alter table public.automaat_log enable row level security;
create index if not exists automaat_log_club_tijd on public.automaat_log (club_id, tijd desc);

-- Voor de app: draait de server? (laatste gelukte run voor mijn club). Dan doet de app het automatische werk niet zelf.
create or replace function public.automaat_laatst(p_club text) returns timestamptz
language sql stable security definer set search_path = public as $$
  select max(tijd) from public.automaat_log where club_id = p_club and ok
    and exists (select 1 from public.lid where auth_uid = auth.uid() and club_id = p_club);
$$;
revoke all on function public.automaat_laatst(text) from public, anon;
grant execute on function public.automaat_laatst(text) to authenticated;

-- Wekker: elk kwartier (de functie houdt zelf nachtrust 21:00–07:30 aan)
select cron.unschedule('clubcomm-automaat') where exists (select 1 from cron.job where jobname = 'clubcomm-automaat');
select cron.schedule('clubcomm-automaat', '*/15 * * * *', $$
  select net.http_post(
    url := 'https://pkvacwbdgumkffxnxnqk.supabase.co/functions/v1/automaat',
    body := '{}'::jsonb,
    headers := jsonb_build_object('Content-Type', 'application/json', 'x-cc-geheim', (select geheim from public.automaat_geheim limit 1)),
    timeout_milliseconds := 60000)
$$);
