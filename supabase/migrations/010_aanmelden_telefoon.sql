-- ClubComm — Besluit 46: de ouder vult bij het aanmelden (optioneel) zijn telefoonnummer in.
-- Nieuwe parameter p_tel (mag leeg). De oude versie zonder p_tel vervalt; oudere apps die zonder p_tel aanroepen
-- vallen vanzelf op de nieuwe versie (p_tel heeft een standaardwaarde).
drop function if exists public.aanmelden(text, text, text, text, text, boolean);
create or replace function public.aanmelden(p_club text, p_team text, p_ouder text, p_voor text, p_achter text, p_akkoord boolean default false, p_tel text default null)
returns text language plpgsql security definer set search_path = public as $$
declare nid text := 'm' || floor(extract(epoch from clock_timestamp()) * 1000)::bigint;
        tel text := left(regexp_replace(coalesce(p_tel, ''), '[^0-9+]', '', 'g'), 16);
begin
  if auth.uid() is null then raise exception 'Log eerst in'; end if;
  if not coalesce(p_akkoord, false) then raise exception 'Ga eerst akkoord met de privacyverklaring'; end if;
  if not exists (select 1 from public.rij where club_id = p_club and soort = 'teams' and id = p_team) then raise exception 'Onbekend team'; end if;
  insert into public.rij (club_id, soort, id, scope, team_id, data) values (p_club, 'aanm', nid, 'aanm', p_team,
    jsonb_build_object('id', nid, 'teamId', p_team, 'email', auth.email(), 'ouderNaam', left(p_ouder, 80), 'kindVoor', left(p_voor, 40), 'kindAchter', left(p_achter, 60),
      'tel', tel, 'tijd', to_jsonb(now()), 'status', 'open', 'privacyAkkoord', to_jsonb(now())));
  return nid;
end $$;
revoke execute on function public.aanmelden(text, text, text, text, text, boolean, text) from public, anon;
grant execute on function public.aanmelden(text, text, text, text, text, boolean, text) to authenticated;
