-- ClubComm versie 2 — basis: één tabel met rijen per soort (collectie), rechten via RLS.
-- Elke rij hoort bij een club en heeft een "scope" die bepaalt wie hem mag lezen en schrijven (Besluit 8, 24, 25).
-- Rollen staan in de persoon-rij (data->'rollen'); een trigger voorkomt dat iemand zichzelf rollen geeft.

create table if not exists public.rij (
  club_id    text not null,
  soort      text not null,
  id         text not null,
  scope      text not null check (scope in ('club','persoon','contact','team','teamstaf','kind','speler','spelerlees','spelerstaf','act','speeltijd','eigen','hjo','bericht','aanm')),
  team_id    text,
  speler_id  text,
  persoon_id text,
  act_id     text,
  data       jsonb not null default '{}'::jsonb,
  bijgewerkt timestamptz not null default now(),
  door       uuid default auth.uid(),
  primary key (club_id, soort, id)
);
create index if not exists rij_team on public.rij (club_id, team_id);
create index if not exists rij_speler on public.rij (club_id, speler_id);
create index if not exists rij_persoon on public.rij (club_id, persoon_id);

-- Koppeling inlogaccount ↔ persoon in de club
create table if not exists public.lid (
  auth_uid   uuid primary key references auth.users (id) on delete cascade,
  club_id    text not null,
  persoon_id text not null,
  gekoppeld  timestamptz not null default now(),
  unique (club_id, persoon_id)
);

alter table public.rij enable row level security;
alter table public.lid enable row level security;

-- ---------- Hulpfuncties (security definer: lezen zonder RLS, alleen voor de ingelogde gebruiker) ----------
create or replace function public.cc_club() returns text language sql stable security definer set search_path = public as $$
  select club_id from public.lid where auth_uid = auth.uid() limit 1 $$;
create or replace function public.cc_ik() returns text language sql stable security definer set search_path = public as $$
  select persoon_id from public.lid where auth_uid = auth.uid() limit 1 $$;

create or replace function public.cc_rollen() returns setof jsonb language sql stable security definer set search_path = public as $$
  select r from public.rij p, jsonb_array_elements(coalesce(p.data->'rollen','[]'::jsonb)) r
  where p.club_id = public.cc_club() and p.soort = 'people' and p.id = public.cc_ik() $$;

create or replace function public.cc_admin() returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.cc_rollen() r where r->>'rol' in ('hjo','beheerder')) $$;
create or replace function public.cc_coord() returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.cc_rollen() r where r->>'rol' = 'coordinator') $$;

-- Teams waar ik staf ben: trainer/teamleider van het team, coördinator van de groep, of HJO/beheerder (alle teams)
create or replace function public.cc_staf_teams() returns text[] language sql stable security definer set search_path = public as $$
  select coalesce(array_agg(distinct t.id), '{}') from public.rij t
  where t.club_id = public.cc_club() and t.soort = 'teams' and (
    public.cc_admin()
    or exists (select 1 from public.cc_rollen() r where r->>'rol' in ('trainer','teamleider') and r->>'teamId' = t.id)
    or exists (select 1 from public.cc_rollen() r where r->>'rol' = 'coordinator' and (r->'cats') ? (t.data->>'cat'))
  ) $$;

-- Mijn kinderen en hun teams
create or replace function public.cc_kinderen() returns text[] language sql stable security definer set search_path = public as $$
  select coalesce(array_agg(p.id), '{}') from public.rij p
  where p.club_id = public.cc_club() and p.soort = 'players' and (p.data->'ouders') ? public.cc_ik() $$;
create or replace function public.cc_kind_teams() returns text[] language sql stable security definer set search_path = public as $$
  select coalesce(array_agg(distinct p.team_id), '{}') from public.rij p
  where p.club_id = public.cc_club() and p.soort = 'players' and (p.data->'ouders') ? public.cc_ik() and p.team_id is not null $$;

-- Tijdelijke toegang: ik ben vervanger of begeleider bij deze activiteit
create or replace function public.cc_act_toegang(p_act text) returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.rij a where a.club_id = public.cc_club() and a.soort = 'acts' and a.id = p_act
    and (a.data->>'vervangerId' = public.cc_ik() or a.data->>'begeleiderId' = public.cc_ik())) $$;
-- Is deze persoon staf (dan mag iedereen in de club zijn contactgegevens zien)?
create or replace function public.cc_is_staf(p_persoon text) returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.rij p, jsonb_array_elements(coalesce(p.data->'rollen','[]'::jsonb)) r
    where p.club_id = public.cc_club() and p.soort = 'people' and p.id = p_persoon and r->>'rol' <> 'ouder') $$;

-- ---------- Lezen en schrijven per scope ----------
-- De lijsten (mijn staf-teams, mijn kinderen, ...) worden één keer per query berekend en meegegeven.
create or replace function public.cc_mag(p_scope text, p_team text, p_speler text, p_persoon text, p_act text, p_data jsonb, p_schrijven boolean,
  ik text, staf text[], kids text[], kidteams text[], admin boolean, coord boolean, tijdelijk text[])
returns boolean language plpgsql stable security definer set search_path = public as $$
begin
  if ik is null then return false; end if;
  case p_scope
    when 'club' then return not p_schrijven or admin or (p_team is not null and coord and p_team = any(staf));
    when 'persoon' then return not p_schrijven or p_persoon = ik or admin or cardinality(staf) > 0;
    when 'contact' then return p_persoon = ik or admin or cardinality(staf) > 0 or (not p_schrijven and public.cc_is_staf(p_persoon));
    when 'team' then return p_team = any(staf) or p_team = any(kidteams);
    when 'teamstaf' then return p_team = any(staf);
    when 'kind' then return p_team = any(staf) or p_speler = any(kids) or (not p_schrijven and p_team = any(kidteams));
    when 'speler' then return p_team = any(staf) or p_speler = any(kids);
    when 'spelerlees' then return p_team = any(staf) or (not p_schrijven and p_speler = any(kids));
    when 'spelerstaf' then return p_team = any(staf);
    when 'act' then return p_team = any(staf) or (p_team = any(tijdelijk) and p_act is not null and public.cc_act_toegang(p_act)) or (not p_schrijven and p_speler = any(kids));
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

-- Tijdelijke teams: vervanger/begeleider rond vandaag (ook voor pres, via cc_act_toegang per activiteit)
create or replace function public.cc_tijdelijk_teams() returns text[] language sql stable security definer set search_path = public as $$
  select coalesce(array_agg(distinct a.team_id), '{}') from public.rij a
  where a.club_id = public.cc_club() and a.soort = 'acts'
    and (a.data->>'vervangerId' = public.cc_ik() or a.data->>'begeleiderId' = public.cc_ik())
    and (a.data->>'datum')::date between current_date - 1 and current_date + 1 $$;

drop policy if exists rij_lezen on public.rij;
drop policy if exists rij_nieuw on public.rij;
drop policy if exists rij_wijzig on public.rij;
drop policy if exists rij_weg on public.rij;
create policy rij_lezen on public.rij for select to authenticated
  using (club_id = (select public.cc_club()) and public.cc_mag(scope, team_id, speler_id, persoon_id, act_id, data, false,
    (select public.cc_ik()), (select public.cc_staf_teams()), (select public.cc_kinderen()), (select public.cc_kind_teams()), (select public.cc_admin()), (select public.cc_coord()), (select public.cc_tijdelijk_teams())));
create policy rij_nieuw on public.rij for insert to authenticated
  with check (club_id = (select public.cc_club()) and public.cc_mag(scope, team_id, speler_id, persoon_id, act_id, data, true,
    (select public.cc_ik()), (select public.cc_staf_teams()), (select public.cc_kinderen()), (select public.cc_kind_teams()), (select public.cc_admin()), (select public.cc_coord()), (select public.cc_tijdelijk_teams())));
create policy rij_wijzig on public.rij for update to authenticated
  using (club_id = (select public.cc_club()) and public.cc_mag(scope, team_id, speler_id, persoon_id, act_id, data, true,
    (select public.cc_ik()), (select public.cc_staf_teams()), (select public.cc_kinderen()), (select public.cc_kind_teams()), (select public.cc_admin()), (select public.cc_coord()), (select public.cc_tijdelijk_teams())))
  with check (club_id = (select public.cc_club()) and public.cc_mag(scope, team_id, speler_id, persoon_id, act_id, data, true,
    (select public.cc_ik()), (select public.cc_staf_teams()), (select public.cc_kinderen()), (select public.cc_kind_teams()), (select public.cc_admin()), (select public.cc_coord()), (select public.cc_tijdelijk_teams())));
create policy rij_weg on public.rij for delete to authenticated
  using (club_id = (select public.cc_club()) and public.cc_mag(scope, team_id, speler_id, persoon_id, act_id, data, true,
    (select public.cc_ik()), (select public.cc_staf_teams()), (select public.cc_kinderen()), (select public.cc_kind_teams()), (select public.cc_admin()), (select public.cc_coord()), (select public.cc_tijdelijk_teams()))
    and (scope <> 'bericht' or data->>'van' = (select public.cc_ik()) or (select public.cc_admin())));

drop policy if exists lid_eigen on public.lid;
create policy lid_eigen on public.lid for select to authenticated using (auth_uid = (select auth.uid()));

-- ---------- Beperkingen die RLS niet kan uitdrukken ----------
create or replace function public.cc_bewaak() returns trigger language plpgsql security definer set search_path = public as $$
declare vrij text[]; ik text := public.cc_ik(); staf boolean;
begin
  new.bijgewerkt := now(); new.door := auth.uid();
  if auth.uid() is null then return new; end if; -- beheer via SQL
  -- Scope en koppelvelden mogen niet worden omgezet naar een ruimere scope
  if tg_op = 'UPDATE' and (new.scope <> old.scope or new.club_id <> old.club_id) and not public.cc_admin() then
    raise exception 'Scope wijzigen mag niet';
  end if;
  if new.soort = 'people' then
    -- Alleen HJO/beheerder mag andere rollen dan "ouder" geven of afnemen
    if not public.cc_admin() and
       coalesce((select jsonb_agg(r order by r::text) from jsonb_array_elements(coalesce(new.data->'rollen','[]')) r where r->>'rol' <> 'ouder'), '[]')
       <> coalesce((select jsonb_agg(r order by r::text) from jsonb_array_elements(coalesce(case when tg_op = 'UPDATE' then old.data->'rollen' end,'[]')) r where r->>'rol' <> 'ouder'), '[]') then
      raise exception 'Alleen de HJO of clubbeheerder mag rollen toewijzen';
    end if;
  elsif new.soort = 'contact' and new.persoon_id is distinct from ik and not public.cc_admin() then
    -- E-mailadres bepaalt met welk account iemand inlogt: alleen de persoon zelf of HJO/beheerder mag het wijzigen,
    -- en contactgegevens van stafleden legt alleen HJO/beheerder vast
    if tg_op = 'UPDATE' and lower(coalesce(new.data->>'email','')) <> lower(coalesce(old.data->>'email','')) then raise exception 'Alleen de persoon zelf of de HJO mag het e-mailadres wijzigen'; end if;
    if tg_op = 'INSERT' and public.cc_is_staf(new.persoon_id) then raise exception 'Contactgegevens van stafleden legt de HJO vast'; end if;
  elsif new.soort = 'acts' and tg_op = 'INSERT' and not (new.team_id = any(public.cc_staf_teams())) then
    raise exception 'Alleen staf kan activiteiten toevoegen';
  elsif new.soort = 'msgs' and tg_op = 'UPDATE' and old.data->>'van' is distinct from ik and not public.cc_admin() then
    vrij := array['gelezen','antw'];
  elsif new.soort = 'acts' and tg_op = 'UPDATE' then
    staf := new.team_id = any(public.cc_staf_teams());
    if not staf then vrij := array['vervangerId','begeleiderId']; end if;
  end if;
  if vrij is not null and (new.data - vrij) <> (old.data - vrij) then
    raise exception 'Je mag alleen % wijzigen', array_to_string(vrij, ', ');
  end if;
  return new;
end $$;
drop trigger if exists rij_bewaak on public.rij;
create trigger rij_bewaak before insert or update on public.rij for each row execute function public.cc_bewaak();

-- ---------- Functies voor de app ----------
-- Na het inloggen: koppel mijn account aan de persoon met hetzelfde e-mailadres
create or replace function public.koppel_mij() returns table (club_id text, persoon_id text) language plpgsql security definer set search_path = public as $$
#variable_conflict use_column
begin
  if auth.uid() is null then return; end if;
  if not exists (select 1 from public.lid l where l.auth_uid = auth.uid()) then
    insert into public.lid (auth_uid, club_id, persoon_id)
    select auth.uid(), c.club_id, c.persoon_id from public.rij c
    where c.soort = 'contact' and lower(c.data->>'email') = lower(auth.email())
      and not exists (select 1 from public.lid l2 where l2.club_id = c.club_id and l2.persoon_id = c.persoon_id)
    order by c.bijgewerkt limit 1;
  end if;
  return query select l.club_id, l.persoon_id from public.lid l where l.auth_uid = auth.uid();
end $$;

-- Uitnodiging: clubnaam en teamnaam tonen, ook voordat iemand lid is
create or replace function public.uitnodiging_info(p_club text, p_team text) returns jsonb language sql stable security definer set search_path = public as $$
  select jsonb_build_object('club', (select data->>'naam' from public.rij where club_id = p_club and soort = 'club' and id = 'club'),
                            'team', (select data->>'naam' from public.rij where club_id = p_club and soort = 'teams' and id = p_team)) $$;

-- Aanmelden van een nieuwe ouder (nog geen lid): komt bij de teamleider ter goedkeuring
create or replace function public.aanmelden(p_club text, p_team text, p_ouder text, p_voor text, p_achter text) returns text language plpgsql security definer set search_path = public as $$
declare nid text := 'm' || floor(extract(epoch from clock_timestamp()) * 1000)::bigint;
begin
  if auth.uid() is null then raise exception 'Log eerst in'; end if;
  if not exists (select 1 from public.rij where club_id = p_club and soort = 'teams' and id = p_team) then raise exception 'Onbekend team'; end if;
  insert into public.rij (club_id, soort, id, scope, team_id, data) values (p_club, 'aanm', nid, 'aanm', p_team,
    jsonb_build_object('id', nid, 'teamId', p_team, 'email', auth.email(), 'ouderNaam', left(p_ouder, 80), 'kindVoor', left(p_voor, 40), 'kindAchter', left(p_achter, 60), 'tijd', to_jsonb(now()), 'status', 'open'));
  return nid;
end $$;

-- Bericht gelezen of beantwoord (ook door ontvangers): veilig samenvoegen, zodat niets verloren gaat
create or replace function public.bericht_bij(p_id text, p_gelezen boolean, p_antw jsonb) returns void language plpgsql security definer set search_path = public as $$
declare ik text := public.cc_ik(); c text := public.cc_club();
begin
  update public.rij set data = jsonb_set(jsonb_set(data, '{gelezen}',
      case when p_gelezen and not coalesce(data->'gelezen','[]') ? ik then coalesce(data->'gelezen','[]') || to_jsonb(ik) else coalesce(data->'gelezen','[]') end),
      '{antw}', coalesce(data->'antw','[]') || coalesce((select jsonb_agg(a) from jsonb_array_elements(coalesce(p_antw,'[]')) a where not coalesce(data->'antw','[]') @> jsonb_build_array(a)), '[]'))
  where club_id = c and soort = 'msgs' and id = p_id and (data->>'van' = ik or (data->'ontvangers') ? ik);
end $$;

revoke all on function public.cc_mag(text,text,text,text,text,jsonb,boolean,text,text[],text[],text[],boolean,boolean,text[]) from public, anon;
grant execute on function public.cc_mag(text,text,text,text,text,jsonb,boolean,text,text[],text[],text[],boolean,boolean,text[]) to authenticated;
grant execute on function public.koppel_mij() to authenticated;
grant execute on function public.aanmelden(text,text,text,text,text) to authenticated;
grant execute on function public.bericht_bij(text,boolean,jsonb) to authenticated;
grant execute on function public.uitnodiging_info(text,text) to anon, authenticated;
grant select, insert, update, delete on public.rij to authenticated;
grant select on public.lid to authenticated;
