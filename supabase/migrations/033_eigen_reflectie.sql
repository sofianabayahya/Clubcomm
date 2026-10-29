-- ClubComm — Besluit 143: de trainer is eigenaar van zijn eigen teksten (kennismaking, vragenlijst vooraf, reflectie);
-- een clubbeheerder zonder begeleidersrol heeft geen toegang tot het begeleidingsdossier.
-- Raakt priv.cc_mag NIET (zodat dit samengaat met rechtenvoorstel 032, dat cc_mag opnieuw schrijft, in elke volgorde); werkt met
--   (1) een extra bewaker (trigger) op scope 'trainerzelf' en (2) een extra beperkende regel (restrictive policy).
--
-- (1) Scope 'trainerzelf' (soorten trainerKennis en begeleidZelf):
--     - de trainer zelf mag alles met zijn eigen rij, behalve hem op naam van een ander of in een andere scope zetten;
--     - iemand anders (HO/TC) mag alleen het veld 'gevraagd' zetten of wijzigen, en alleen een lege rij aanmaken
--       (velden 'trainerId' en 'gevraagd'); de inhoud blijft van de trainer; verwijderen mag niet. Een verouderde kopie
--       terugsturen (bijv. bij opnieuw uitnodigen) wordt daardoor geweigerd: bestaande antwoorden blijven staan;
--     - uitzondering alleen voor vertrouwde serverprocessen: databaserol service_role of de eigenaar (geen 'authenticated'
--       of 'anon'). Een gewone gebruiker valt daar nooit onder, ook niet zonder gebruikers-id in zijn sessie.
-- (2) Scopes 'trainerzelf' en 'trainerdossier': alleen de persoon zelf of een begeleider (rol hjo of tc).
--     Daarmee vervalt de toegang van een clubbeheerder zonder begeleidersrol (in productie op 29-10 nergens het geval).
--
-- Terugdraaien: drop trigger rij_trainerzelf, rij_trainerzelf_oud, rij_trainerzelf_weg on public.rij;
--               drop policy rij_begeleiding on public.rij; drop function priv.cc_bewaak_trainerzelf();

create or replace function priv.cc_bewaak_trainerzelf() returns trigger
language plpgsql security definer set search_path = public as $$
declare ik text := priv.cc_ik(); oud jsonb; nieuw jsonb; eigen boolean;
begin
  if coalesce(current_setting('role', true), 'none') not in ('authenticated', 'anon') then return coalesce(new, old); end if;
  if ik is null then raise exception 'Niet ingelogd'; end if;
  if tg_op = 'DELETE' then
    if old.persoon_id is distinct from ik then raise exception 'Alleen de trainer zelf mag dit verwijderen'; end if;
    return old;
  end if;
  if tg_op = 'UPDATE' and (new.persoon_id is distinct from old.persoon_id or new.scope is distinct from old.scope) then
    raise exception 'Eigenaar of scope wijzigen mag niet';
  end if;
  eigen := new.persoon_id is not distinct from ik;
  if eigen then return new; end if;
  if tg_op = 'INSERT' then
    -- De app slaat op met upsert (insert ... on conflict do update): bestaat de rij al, dan beslist de controle bij UPDATE
    if exists (select 1 from public.rij r where r.club_id = new.club_id and r.soort = new.soort and r.id = new.id) then return new; end if;
    if exists (select 1 from jsonb_object_keys(coalesce(new.data, '{}'::jsonb)) k where k not in ('trainerId', 'gevraagd')) then
      raise exception 'Alleen de trainer zelf mag dit invullen';
    end if;
    return new;
  end if;
  oud := coalesce(old.data, '{}'::jsonb) - 'gevraagd'; nieuw := coalesce(new.data, '{}'::jsonb) - 'gevraagd';
  if oud <> nieuw then raise exception 'Alleen de trainer zelf mag dit wijzigen (jij mag alleen gevraagd wijzigen)'; end if;
  return new;
end $$;
revoke all on function priv.cc_bewaak_trainerzelf() from public;

drop trigger if exists rij_trainerzelf on public.rij;
create trigger rij_trainerzelf before insert or update on public.rij for each row
  when (new.scope = 'trainerzelf') execute function priv.cc_bewaak_trainerzelf();
drop trigger if exists rij_trainerzelf_oud on public.rij;
create trigger rij_trainerzelf_oud before update on public.rij for each row
  when (old.scope = 'trainerzelf' and new.scope is distinct from 'trainerzelf') execute function priv.cc_bewaak_trainerzelf();
drop trigger if exists rij_trainerzelf_weg on public.rij;
create trigger rij_trainerzelf_weg before delete on public.rij for each row
  when (old.scope = 'trainerzelf') execute function priv.cc_bewaak_trainerzelf();

drop policy if exists rij_begeleiding on public.rij;
create policy rij_begeleiding on public.rij as restrictive for all to authenticated
  using (scope not in ('trainerzelf', 'trainerdossier') or persoon_id = (select priv.cc_ik()) or (select priv.cc_begeleider()))
  with check (scope not in ('trainerzelf', 'trainerdossier') or persoon_id = (select priv.cc_ik()) or (select priv.cc_begeleider()));
