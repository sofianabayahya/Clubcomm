-- ClubComm — Besluit 116: de timekeeper (en de trainer-coach) van een wedstrijd mag op de wedstrijddag opslaan wat hij
-- bijhoudt: klok, wissels, posities (wisselschema), doelpunten en de uitslag. Gevonden bij DCG op 24-10: de moeder die
-- timekeeper was, hield alles bij, maar de database weigerde het (alleen staf mag een wedstrijd wijzigen).
-- "Taak bij deze wedstrijd": een rij in taken met soort Timekeeper of Trainer-coach en personId = ik, van gisteren t/m morgen.

create or replace function priv.cc_wedtaak(p_act text) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.rij t join public.rij a on a.club_id = t.club_id and a.soort = 'acts' and a.id = t.act_id
    where t.club_id = priv.cc_club() and t.soort = 'taken' and t.act_id = p_act
      and t.data->>'personId' = priv.cc_ik() and t.data->>'soort' in ('Timekeeper', 'Trainer-coach')
      and (a.data->>'datum')::date between current_date - 1 and current_date + 1) $$;

-- Tijdelijke toegang tot een activiteit: vervanger, begeleider, of timekeeper/trainer-coach van die wedstrijd
create or replace function priv.cc_act_toegang(p_act text) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.rij a where a.club_id = priv.cc_club() and a.soort = 'acts' and a.id = p_act
    and (a.data->>'vervangerId' = priv.cc_ik() or a.data->>'begeleiderId' = priv.cc_ik())) or priv.cc_wedtaak(p_act) $$;

-- Teams waar je tijdelijk bij hoort (voor de speeltijd van de wedstrijd): ook als timekeeper of trainer-coach
create or replace function priv.cc_tijdelijk_teams() returns text[]
language sql stable security definer set search_path = public as $$
  select coalesce(array_agg(distinct x.team_id), '{}') from (
    select a.team_id from public.rij a
    where a.club_id = priv.cc_club() and a.soort = 'acts'
      and (a.data->>'vervangerId' = priv.cc_ik() or a.data->>'begeleiderId' = priv.cc_ik())
      and (a.data->>'datum')::date between current_date - 1 and current_date + 1
    union
    select a.team_id from public.rij t join public.rij a on a.club_id = t.club_id and a.soort = 'acts' and a.id = t.act_id
    where t.club_id = priv.cc_club() and t.soort = 'taken' and t.data->>'personId' = priv.cc_ik()
      and t.data->>'soort' in ('Timekeeper', 'Trainer-coach')
      and (a.data->>'datum')::date between current_date - 1 and current_date + 1) x $$;

-- Bewaking: wie geen staf is, mag aan een wedstrijd alleen vervanger en begeleider wijzigen;
-- de timekeeper of trainer-coach van die wedstrijd ook de doelpunten en de uitslag
create or replace function priv.cc_bewaak() returns trigger
language plpgsql security definer set search_path = public as $$
declare vrij text[]; ik text := priv.cc_ik(); staf boolean;
begin
  new.bijgewerkt := now(); new.door := auth.uid();
  if auth.uid() is null then return new; end if;
  if tg_op = 'UPDATE' and (new.scope <> old.scope or new.club_id <> old.club_id) and not priv.cc_admin() then
    raise exception 'Scope wijzigen mag niet';
  end if;
  if new.soort = 'people' then
    if not priv.cc_admin() and
       coalesce((select jsonb_agg(r order by r::text) from jsonb_array_elements(coalesce(new.data->'rollen','[]')) r where r->>'rol' <> 'ouder'), '[]')
       <> coalesce((select jsonb_agg(r order by r::text) from jsonb_array_elements(coalesce(case when tg_op = 'UPDATE' then old.data->'rollen' end,'[]')) r where r->>'rol' <> 'ouder'), '[]') then
      raise exception 'Alleen de HJO of clubbeheerder mag rollen toewijzen';
    end if;
  elsif new.soort = 'contact' and new.persoon_id is distinct from ik and not priv.cc_admin() then
    if tg_op = 'UPDATE' and lower(coalesce(new.data->>'email','')) <> lower(coalesce(old.data->>'email','')) then raise exception 'Alleen de persoon zelf of de HJO mag het e-mailadres wijzigen'; end if;
    if tg_op = 'INSERT' and priv.cc_is_staf(new.persoon_id) then raise exception 'Contactgegevens van stafleden legt de HJO vast'; end if;
  elsif new.soort = 'acts' and tg_op = 'INSERT' and not (new.team_id = any(priv.cc_staf_teams())) then
    raise exception 'Alleen staf kan activiteiten toevoegen';
  elsif new.soort = 'msgs' and tg_op = 'UPDATE' and old.data->>'van' is distinct from ik and not priv.cc_admin() then
    vrij := array['gelezen','antw'];
  elsif new.soort = 'acts' and tg_op = 'UPDATE' then
    staf := new.team_id = any(priv.cc_staf_teams());
    if not staf then
      vrij := array['vervangerId','begeleiderId'];
      if priv.cc_wedtaak(new.id) then vrij := vrij || array['goals','uitslag','uitslagKlaar','uitslagVerstuurd','uitslagAuto']; end if;
    end if;
  end if;
  if vrij is not null and (new.data - vrij) <> (old.data - vrij) then
    raise exception 'Je mag alleen % wijzigen', array_to_string(vrij, ', ');
  end if;
  return new;
end $$;
