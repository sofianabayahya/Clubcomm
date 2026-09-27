-- ClubComm — Besluit 63: fouten automatisch vastleggen. Gaat er bij iemand iets mis in de app (een scherm dat niet
-- laadt, een fout in de code), dan komt dat hier binnen, zonder dat de gebruiker het hoeft te melden.
-- Alleen technische gegevens: foutmelding, plek in de app, soort toestel en versie; geen inhoud van berichten.
-- Lezen alleen voor HJO/clubbeheerder (fouten_lijst). Bewaard 60 dagen.
create table if not exists public.fout (
  id        bigserial primary key,
  tijd      timestamptz not null default now(),
  club_id   text,
  persoon_id text,
  bericht   text not null,
  stack     text,
  plek      text,
  toestel   text,
  versie    text
);
create index if not exists fout_tijd on public.fout (club_id, tijd desc);
alter table public.fout enable row level security;
revoke all on public.fout from anon, authenticated;

create or replace function public.fout_melden(p_club text, p_bericht text, p_stack text default null, p_plek text default null, p_toestel text default null, p_versie text default null)
returns void language plpgsql security definer set search_path = public as $$
declare pid text;
begin
  -- Rem tegen een stortvloed: maximaal 300 meldingen per uur in totaal
  if (select count(*) from public.fout where tijd > now() - interval '1 hour') >= 300 then return; end if;
  if auth.uid() is not null then select persoon_id into pid from public.lid where auth_uid = auth.uid() and club_id = p_club; end if;
  insert into public.fout (club_id, persoon_id, bericht, stack, plek, toestel, versie)
  values (left(p_club, 40), pid, left(coalesce(p_bericht, '?'), 500), left(p_stack, 2000), left(p_plek, 200), left(p_toestel, 200), left(p_versie, 60));
  delete from public.fout where tijd < now() - interval '60 days';
end $$;
revoke execute on function public.fout_melden(text, text, text, text, text, text) from public;
grant execute on function public.fout_melden(text, text, text, text, text, text) to anon, authenticated;

create or replace function public.fouten_lijst() returns table (tijd timestamptz, persoon_id text, bericht text, plek text, toestel text, versie text, aantal bigint)
language plpgsql stable security definer set search_path = public as $$
begin
  if not priv.cc_admin() then raise exception 'Alleen de HJO of clubbeheerder mag dit'; end if;
  return query select max(f.tijd), max(f.persoon_id), f.bericht, max(f.plek), max(f.toestel), max(f.versie), count(*)
    from public.fout f where f.club_id = priv.cc_club() and f.tijd > now() - interval '30 days'
    group by f.bericht order by max(f.tijd) desc limit 50;
end $$;
revoke execute on function public.fouten_lijst() from public, anon;
grant execute on function public.fouten_lijst() to authenticated;
