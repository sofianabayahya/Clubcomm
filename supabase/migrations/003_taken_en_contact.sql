-- ClubComm — rechten volgen de takenlijst van de club (Besluit 25) en contactgegevens van ouders alleen voor staf van het eigen team.
-- Nieuwe scopes: 'beoord' (beoordelingen: lezen met taak beoordelingZien of als ouder, schrijven met taak beoordelen)
--               'notitie' (gespreksnotities: lezen/schrijven met taak notities).

alter table public.rij drop constraint if exists rij_scope_check;
alter table public.rij add constraint rij_scope_check check (scope in ('club','persoon','contact','team','teamstaf','kind','speler','spelerlees','spelerstaf','act','speeltijd','eigen','hjo','bericht','aanm','beoord','notitie'));

-- Heb ik voor dit team een rol waarbij deze taak is aangevinkt? (HJO/beheerder altijd)
-- Standaard (als de club nog niets heeft ingesteld): trainer en coördinator wel, teamleider niet.
create or replace function priv.cc_taak(p_taak text, p_team text) returns boolean language sql stable security definer set search_path = public as $$
  with t as (select coalesce((select data->'taken'->p_taak from public.rij where club_id = priv.cc_club() and soort = 'club' and id = 'club'), '{}'::jsonb) as v),
       cat as (select data->>'cat' as c from public.rij where club_id = priv.cc_club() and soort = 'teams' and id = p_team)
  select priv.cc_admin() or exists (
    select 1 from priv.cc_rollen() r, t
    where (r->>'rol' in ('trainer','teamleider') and r->>'teamId' = p_team
           and coalesce((t.v->>(r->>'rol'))::boolean, r->>'rol' = 'trainer'))
       or (r->>'rol' = 'coordinator' and (r->'cats') ? (select c from cat)
           and coalesce((t.v->>'coordinator')::boolean, true)))
$$;

-- Ouders van kinderen in mijn staf-teams (voor contactgegevens)
create or replace function priv.cc_staf_ouders() returns text[] language sql stable security definer set search_path = public as $$
  select coalesce(array_agg(distinct o), '{}') from public.rij p, jsonb_array_elements_text(coalesce(p.data->'ouders','[]')) o
  where p.club_id = priv.cc_club() and p.soort = 'players' and p.team_id = any(priv.cc_staf_teams()) $$;

drop policy if exists rij_lezen on public.rij;
drop policy if exists rij_nieuw on public.rij;
drop policy if exists rij_wijzig on public.rij;
drop policy if exists rij_weg on public.rij;
drop function if exists priv.cc_mag(text,text,text,text,text,jsonb,boolean,text,text[],text[],text[],boolean,boolean,text[]);

create or replace function priv.cc_mag(p_scope text, p_team text, p_speler text, p_persoon text, p_act text, p_data jsonb, p_schrijven boolean,
  ik text, staf text[], kids text[], kidteams text[], admin boolean, coord boolean, tijdelijk text[], stafouders text[])
returns boolean language plpgsql stable security definer set search_path = public as $$
begin
  if ik is null then return false; end if;
  case p_scope
    when 'club' then return not p_schrijven or admin or (p_team is not null and coord and p_team = any(staf));
    when 'persoon' then return not p_schrijven or p_persoon = ik or admin or cardinality(staf) > 0;
    when 'contact' then return p_persoon = ik or admin or coord or p_persoon = any(stafouders) or (not p_schrijven and priv.cc_is_staf(p_persoon))
                               or (p_schrijven and cardinality(staf) > 0);
    when 'team' then return p_team = any(staf) or p_team = any(kidteams);
    when 'teamstaf' then return p_team = any(staf);
    when 'kind' then return p_team = any(staf) or p_speler = any(kids) or (not p_schrijven and p_team = any(kidteams));
    when 'speler' then return p_team = any(staf) or p_speler = any(kids);
    when 'spelerlees' then return p_team = any(staf) or (not p_schrijven and p_speler = any(kids));
    when 'spelerstaf' then return p_team = any(staf);
    when 'beoord' then
      if p_schrijven then return p_team = any(staf) and priv.cc_taak('beoordelen', p_team); end if;
      return p_speler = any(kids) or (p_team = any(staf) and priv.cc_taak('beoordelingZien', p_team));
    when 'notitie' then return p_team = any(staf) and priv.cc_taak('notities', p_team);
    when 'act' then return p_team = any(staf) or (p_team = any(tijdelijk) and p_act is not null and priv.cc_act_toegang(p_act)) or (not p_schrijven and p_speler = any(kids));
    when 'speeltijd' then return p_team = any(staf) or p_team = any(tijdelijk);
    when 'eigen' then return p_persoon = ik;
    when 'hjo' then return admin or coord;
    when 'bericht' then
      if p_schrijven then return p_data->>'van' in (ik, 'systeem') or (p_data->'ontvangers') ? ik; end if;
      return p_data->>'van' = ik or (p_data->'ontvangers') ? ik or (admin and p_data->>'soort' in ('nieuws','melding'));
    when 'aanm' then return p_team = any(staf) or (not p_schrijven and lower(p_data->>'email') = lower(auth.email()));
    else return false;
  end case;
end $$;

create policy rij_lezen on public.rij for select to authenticated
  using (club_id = (select priv.cc_club()) and priv.cc_mag(scope, team_id, speler_id, persoon_id, act_id, data, false,
    (select priv.cc_ik()), (select priv.cc_staf_teams()), (select priv.cc_kinderen()), (select priv.cc_kind_teams()), (select priv.cc_admin()), (select priv.cc_coord()), (select priv.cc_tijdelijk_teams()), (select priv.cc_staf_ouders())));
create policy rij_nieuw on public.rij for insert to authenticated
  with check (club_id = (select priv.cc_club()) and priv.cc_mag(scope, team_id, speler_id, persoon_id, act_id, data, true,
    (select priv.cc_ik()), (select priv.cc_staf_teams()), (select priv.cc_kinderen()), (select priv.cc_kind_teams()), (select priv.cc_admin()), (select priv.cc_coord()), (select priv.cc_tijdelijk_teams()), (select priv.cc_staf_ouders())));
create policy rij_wijzig on public.rij for update to authenticated
  using (club_id = (select priv.cc_club()) and priv.cc_mag(scope, team_id, speler_id, persoon_id, act_id, data, true,
    (select priv.cc_ik()), (select priv.cc_staf_teams()), (select priv.cc_kinderen()), (select priv.cc_kind_teams()), (select priv.cc_admin()), (select priv.cc_coord()), (select priv.cc_tijdelijk_teams()), (select priv.cc_staf_ouders())))
  with check (club_id = (select priv.cc_club()) and priv.cc_mag(scope, team_id, speler_id, persoon_id, act_id, data, true,
    (select priv.cc_ik()), (select priv.cc_staf_teams()), (select priv.cc_kinderen()), (select priv.cc_kind_teams()), (select priv.cc_admin()), (select priv.cc_coord()), (select priv.cc_tijdelijk_teams()), (select priv.cc_staf_ouders())));
create policy rij_weg on public.rij for delete to authenticated
  using (club_id = (select priv.cc_club()) and priv.cc_mag(scope, team_id, speler_id, persoon_id, act_id, data, true,
    (select priv.cc_ik()), (select priv.cc_staf_teams()), (select priv.cc_kinderen()), (select priv.cc_kind_teams()), (select priv.cc_admin()), (select priv.cc_coord()), (select priv.cc_tijdelijk_teams()), (select priv.cc_staf_ouders()))
    and (scope <> 'bericht' or data->>'van' = (select priv.cc_ik()) or (select priv.cc_admin())));

revoke execute on all functions in schema priv from public, anon;
grant execute on all functions in schema priv to authenticated;
