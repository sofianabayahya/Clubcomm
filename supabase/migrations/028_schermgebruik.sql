-- ClubComm — Besluit 112: anoniem tellen welke schermen gebruikt worden, per dag, rol en scherm (geen namen).
-- Doel: na de pilot weten wat trainers, teamleiders en ouders echt gebruiken (functie eerst). Bewaartermijn: één jaar.
create table if not exists public.schermgebruik (
  club_id text not null,
  dag date not null default current_date,
  rol text not null,
  scherm text not null,
  aantal integer not null default 0,
  primary key (club_id, dag, rol, scherm)
);
alter table public.schermgebruik enable row level security;
-- Geen directe toegang: alleen via de twee functies hieronder
revoke all on public.schermgebruik from anon, authenticated;

-- Eén keer tellen (de app roept dit aan als iemand een scherm opent). Club volgt uit het account, niet uit de app.
create or replace function public.tel_scherm(p_rol text, p_scherm text) returns void
language plpgsql security definer set search_path = public as $$
declare c text := priv.cc_club();
begin
  if c is null or coalesce(p_rol, '') = '' or coalesce(p_scherm, '') = '' or length(p_rol) > 30 or length(p_scherm) > 60 then return; end if;
  insert into public.schermgebruik (club_id, dag, rol, scherm, aantal) values (c, current_date, p_rol, p_scherm, 1)
  on conflict (club_id, dag, rol, scherm) do update set aantal = schermgebruik.aantal + 1;
end $$;
revoke all on function public.tel_scherm(text, text) from public, anon;
grant execute on function public.tel_scherm(text, text) to authenticated;

-- Overzicht voor de clubbeheerder of HJO: totaal per rol en scherm over de laatste p_dagen dagen
create or replace function public.schermgebruik_overzicht(p_dagen integer default 28)
returns table (rol text, scherm text, aantal bigint, dagen bigint)
language sql stable security definer set search_path = public as $$
  select g.rol, g.scherm, sum(g.aantal), count(distinct g.dag) from public.schermgebruik g
  where g.club_id = priv.cc_club() and priv.cc_admin() and g.dag >= current_date - greatest(1, least(coalesce(p_dagen, 28), 365))
  group by g.rol, g.scherm order by g.rol, sum(g.aantal) desc $$;
revoke all on function public.schermgebruik_overzicht(integer) from public, anon;
grant execute on function public.schermgebruik_overzicht(integer) to authenticated;

-- Bewaartermijn: elke zondagnacht gaat alles ouder dan een jaar weg (pg_cron)
select cron.schedule('schermgebruik-opruimen', '17 3 * * 0', $$delete from public.schermgebruik where dag < current_date - 365$$);
