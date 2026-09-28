-- ClubComm — Besluit 89: de demo met rondleiding (/demo) is alleen op uitnodiging.
-- Toegangslijst met e-mailadressen; alleen de server en de beheerder van ClubComm (via Supabase) beheren hem.
-- demo_uitgenodigd: mag dit adres een code krijgen? (vóór inloggen) · demo_toegang: mag de ingelogde persoon de demo zien?
create table if not exists public.demo_toegang (
  email text primary key check (email = lower(trim(email))),
  naam text,
  sinds timestamptz not null default now()
);
alter table public.demo_toegang enable row level security; -- geen regels: niet leesbaar voor gebruikers

create or replace function public.demo_uitgenodigd(p_email text) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.demo_toegang where email = lower(trim(p_email)));
$$;
create or replace function public.demo_toegang() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.demo_toegang where email = lower(auth.jwt() ->> 'email'));
$$;
revoke all on function public.demo_uitgenodigd(text) from public;
revoke all on function public.demo_toegang() from public;
grant execute on function public.demo_uitgenodigd(text) to anon, authenticated;
grant execute on function public.demo_toegang() to authenticated;
