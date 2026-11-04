-- ClubComm — Besluit 154: een begeleider (HO of TC) ziet alleen trainers in zijn werkgebied, ook in de database.
-- TOEGEPAST in productie op 4-11-2026 (na akkoord), na 033 en 032. Lokaal getest (npm run test:veilig).
--
-- Werkgebied leeg = de hele club; anders mag de begeleider alleen bij de gegevens van een persoon die trainer is van een team
-- in een bouw van zijn werkgebied. De bouw wordt hier berekend uit de categorie (of teamcode) van het team en de bouwen
-- van de club (standaard Mini's 6–7 · Onderbouw 8–12 · Middenbouw 13–15 · Bovenbouw 16–19), net als CC.bouwVan in de app.
-- Een trainer zonder team of zonder leeftijd in de teamnaam valt onder 'Overig' (alleen een begeleider van de hele club).
--
-- Raakt priv.cc_mag NIET (zoals 033), zodat dit samengaat met voorstel 032 in elke volgorde. Het vervangt alleen de
-- beperkende regel rij_begeleiding uit 033: voor de scopes trainerzelf, trainerdossier en (als 032 er is) trainerplan
-- geldt nu "de persoon zelf of een begeleider van deze persoon" in plaats van "de persoon zelf of een begeleider".
-- VOLGORDE: na 033 (033 opnieuw draaien na 034 zou de oude regel terugzetten).
-- Ongewijzigd: de bewaker van 033 (wie wat in trainerzelf mag schrijven), de notities (hoprive, werkte al per bouw),
-- de server (service_role valt niet onder deze regel), de clubscheiding.
--
-- Terugdraaien (terug naar 033):
--   drop policy if exists rij_begeleiding on public.rij;
--   create policy rij_begeleiding on public.rij as restrictive for all to authenticated
--     using (scope not in ('trainerzelf', 'trainerdossier') or persoon_id = (select priv.cc_ik()) or (select priv.cc_begeleider()))
--     with check (scope not in ('trainerzelf', 'trainerdossier') or persoon_id = (select priv.cc_ik()) or (select priv.cc_begeleider()));
--   drop function priv.cc_begeleider_van(text); drop function priv.cc_bouwen_van(text);

-- De bouwen van een persoon: uit de teams waar hij trainer is (geen team = 'Overig').
create or replace function priv.cc_bouwen_van(p_persoon text) returns text[] language sql stable security definer set search_path = public as $$
  with bw as (
    select coalesce(
      (select c.data->'bouwen' from public.rij c where c.club_id = priv.cc_club() and c.soort = 'club' and c.id = 'club'
         and jsonb_typeof(c.data->'bouwen') = 'array' and jsonb_array_length(c.data->'bouwen') > 0),
      '[{"naam":"Mini''s","van":6,"tot":7},{"naam":"Onderbouw","van":8,"tot":12},{"naam":"Middenbouw","van":13,"tot":15},{"naam":"Bovenbouw","van":16,"tot":19}]'::jsonb) as b),
  lft as (
    select coalesce(substring(coalesce(t.data->>'cat', t.id) from '(\d+)')::int, 0) as l
    from public.rij p
    cross join jsonb_array_elements(coalesce(p.data->'rollen', '[]'::jsonb)) r
    join public.rij t on t.club_id = p.club_id and t.soort = 'teams' and t.id = r->>'teamId'
    where p.club_id = priv.cc_club() and p.soort = 'people' and p.id = p_persoon and r->>'rol' = 'trainer')
  select coalesce(array_agg(distinct coalesce(
           (select x->>'naam' from bw, jsonb_array_elements(bw.b) x
             where lft.l between (x->>'van')::int and (x->>'tot')::int limit 1), 'Overig')),
         array['Overig'])
  from lft $$;

-- Ben ik begeleider van deze persoon? Rol hjo of tc, met een leeg werkgebied of een gedeelde bouw.
create or replace function priv.cc_begeleider_van(p_persoon text) returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from priv.cc_rollen() r where r->>'rol' in ('hjo', 'tc')
    and (jsonb_array_length(coalesce(r->'bouwen', '[]'::jsonb)) = 0
         or exists (select 1 from unnest(priv.cc_bouwen_van(p_persoon)) b where r->'bouwen' ? b))) $$;

revoke all on function priv.cc_bouwen_van(text) from public, anon;
revoke all on function priv.cc_begeleider_van(text) from public, anon;
grant execute on function priv.cc_bouwen_van(text) to authenticated;
grant execute on function priv.cc_begeleider_van(text) to authenticated;

drop policy if exists rij_begeleiding on public.rij;
create policy rij_begeleiding on public.rij as restrictive for all to authenticated
  using (scope not in ('trainerzelf', 'trainerdossier', 'trainerplan') or persoon_id = (select priv.cc_ik()) or priv.cc_begeleider_van(persoon_id))
  with check (scope not in ('trainerzelf', 'trainerdossier', 'trainerplan') or persoon_id = (select priv.cc_ik()) or priv.cc_begeleider_van(persoon_id));
