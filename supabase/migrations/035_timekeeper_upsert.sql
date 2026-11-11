-- ClubComm — Besluit 181: de timekeeper (en trainer-coach, vervanger, begeleider) kan via de app echt opslaan.
-- Gevonden 07-11 (wedstrijd O13 talententeam): de app slaat op met upsert (insert ... on conflict do update). Bij een upsert
-- draait de bewaker eerst als INSERT, en die weigerde iedereen buiten de staf ("Alleen staf kan activiteiten toevoegen"),
-- ook als de wedstrijd al bestond. Daardoor werkte Besluit 116 in de app nooit; de rechtentest probeerde alleen een update.
-- Oplossing (zelfde aanpak als 033 voor de trainerteksten): bestaat de wedstrijd al, dan geen INSERT-controle; de
-- UPDATE-controle (alleen vervanger/begeleider, en voor de timekeeper doelpunten en uitslag) beslist. Extra: wie geen staf is,
-- mag het team van een activiteit niet wijzigen. Test: supabase/tests/lokaal/timekeeper-upsert.sql.
-- Toegepast in productie op 11-11-2026 na akkoord van de gebruiker (maat L).

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
  -- De app slaat op met upsert (insert ... on conflict do update): bestaat de wedstrijd al, dan beslist de controle bij UPDATE
  -- hieronder (alleen de vrije velden). Zonder deze uitzondering werd de timekeeper altijd geweigerd (gevonden 07-11).
  elsif new.soort = 'acts' and tg_op = 'INSERT' and not (new.team_id = any(priv.cc_staf_teams()))
        and not exists (select 1 from public.rij r where r.club_id = new.club_id and r.soort = 'acts' and r.id = new.id) then
    raise exception 'Alleen staf kan activiteiten toevoegen';
  elsif new.soort = 'msgs' and tg_op = 'UPDATE' and old.data->>'van' is distinct from ik and not priv.cc_admin() then
    vrij := array['gelezen','antw'];
  elsif new.soort = 'acts' and tg_op = 'UPDATE' then
    staf := new.team_id = any(priv.cc_staf_teams());
    if not staf then
      if new.team_id is distinct from old.team_id or new.act_id is distinct from old.act_id then raise exception 'Alleen staf mag het team van een activiteit wijzigen'; end if;
      vrij := array['vervangerId','begeleiderId'];
      if priv.cc_wedtaak(new.id) then vrij := vrij || array['goals','uitslag','uitslagKlaar','uitslagVerstuurd','uitslagAuto']; end if;
    end if;
  end if;
  if vrij is not null and (new.data - vrij) <> (old.data - vrij) then
    raise exception 'Je mag alleen % wijzigen', array_to_string(vrij, ', ');
  end if;
  return new;
end $$;
