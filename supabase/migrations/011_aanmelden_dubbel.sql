-- ClubComm — Besluit 51: geen dubbele aanmelding voor hetzelfde kind.
-- Meldt dezelfde ouder (zelfde e-mailadres) hetzelfde kind (zelfde voornaam, hoofdletters/spaties maken niet uit) nog eens aan
-- voor hetzelfde team, dan komt er geen tweede aanvraag:
--   * staat de eerste nog open: die wordt bijgewerkt (naam ouder, achternaam kind, telefoonnummer als dat nu is ingevuld);
--   * is de eerste al goedgekeurd: er gebeurt niets.
-- Een tweede kind (andere voornaam) met hetzelfde e-mailadres blijft gewoon mogelijk (broers/zussen, tweelingen).
create or replace function public.aanmelden(p_club text, p_team text, p_ouder text, p_voor text, p_achter text, p_akkoord boolean default false, p_tel text default null)
returns text language plpgsql security definer set search_path = public as $$
declare nid text := 'm' || floor(extract(epoch from clock_timestamp()) * 1000)::bigint;
        tel text := left(regexp_replace(coalesce(p_tel, ''), '[^0-9+]', '', 'g'), 16);
        bestaand record;
begin
  if auth.uid() is null then raise exception 'Log eerst in'; end if;
  if not coalesce(p_akkoord, false) then raise exception 'Ga eerst akkoord met de privacyverklaring'; end if;
  if not exists (select 1 from public.rij where club_id = p_club and soort = 'teams' and id = p_team) then raise exception 'Onbekend team'; end if;
  select id, data->>'status' as status into bestaand from public.rij
    where club_id = p_club and soort = 'aanm' and team_id = p_team
      and lower(data->>'email') = lower(auth.email())
      and lower(btrim(data->>'kindVoor')) = lower(btrim(left(p_voor, 40)))
      and data->>'status' in ('open', 'ok')
    order by (data->>'status' = 'ok') desc limit 1;
  if found then
    if bestaand.status = 'open' then
      update public.rij set data = data || jsonb_build_object('ouderNaam', left(p_ouder, 80), 'kindAchter', left(p_achter, 60))
          || case when tel <> '' then jsonb_build_object('tel', tel) else '{}'::jsonb end
        where club_id = p_club and soort = 'aanm' and id = bestaand.id;
    end if;
    return bestaand.id;
  end if;
  insert into public.rij (club_id, soort, id, scope, team_id, data) values (p_club, 'aanm', nid, 'aanm', p_team,
    jsonb_build_object('id', nid, 'teamId', p_team, 'email', auth.email(), 'ouderNaam', left(p_ouder, 80), 'kindVoor', left(p_voor, 40), 'kindAchter', left(p_achter, 60),
      'tel', tel, 'tijd', to_jsonb(now()), 'status', 'open', 'privacyAkkoord', to_jsonb(now())));
  return nid;
end $$;
revoke execute on function public.aanmelden(text, text, text, text, text, boolean, text) from public, anon;
grant execute on function public.aanmelden(text, text, text, text, text, boolean, text) to authenticated;
