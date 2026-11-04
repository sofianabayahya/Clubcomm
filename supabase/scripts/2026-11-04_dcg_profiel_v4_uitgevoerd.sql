-- Besluit 155: DCG-profiel v3 -> v4. UITGEVOERD op 4-11-2026 om 18:38 UTC in productie (Supabase), na akkoord van de initiatiefnemer.
-- Gerichte variant van 2026-11-04_dcg_profiel_v4.sql.voorstel: vier jsonb_set-aanpassingen op het bestaande profiel, met hetzelfde resultaat.
-- Veilig: alleen als het profiel exact v3 was (07838a2c...); na afloop moet de controlesom 3f17480db4927f60088501cefa3471b0 zijn (= supabase/profielen/dcg.json), anders wordt alles teruggedraaid.
-- Vooraf lokaal getest (npm run test:veilig met dit bestand op een kopie van v3). Achteraf in productie gecontroleerd: versie 4, controlesom gelijk, scope hjo ongewijzigd, gegeven trainingen 27/29/30-10 byte-gelijk.
-- Terugdraaien: 2026-11-04_dcg_profiel_v4_terug.sql.voorstel (reservekopie supabase/backups/2026-11-04_dcg_profiel_v3.json).
do $$
declare n int; h text;
begin
  update public.rij set data =
    jsonb_set(jsonb_set(jsonb_set(jsonb_set(jsonb_set(data,
      '{versie}', '4'),
      '{bijgewerkt}', '"2026-11-04"'),
      '{onderdelen,leerlijnen,items,3,vaardigheden,1,naam}', '"Loskomen uit de dekkingsschaduw"'),
      '{onderdelen,leerlijnen,items,4,vaardigheden,2,naam}', '"Afremmen"'),
      '{onderdelen,evaluatie,kort}', '["ev-probleem","ev-gedrag","ev-transfer","ev-volgende"]')
  where club_id = 'dcg' and soort = 'profiel' and id = 'dcg' and data->>'versie' = '3'
    and md5(data::text) = '07838a2c6d6c8de1c8808054b05a7599'
    and data#>>'{onderdelen,leerlijnen,items,3,vaardigheden,1,id}' = 'vh-vrijmaken-uit-de-dekkingsschaduw'
    and data#>>'{onderdelen,leerlijnen,items,4,vaardigheden,2,id}' = 'vh-vertragen';
  get diagnostics n = row_count;
  if n <> 1 then raise exception 'Profiel is niet exact v3: niets gewijzigd (% rijen)', n; end if;
  select md5(data::text) into h from public.rij where club_id = 'dcg' and soort = 'profiel' and id = 'dcg';
  if h <> '3f17480db4927f60088501cefa3471b0' then raise exception 'Controlesom na wijziging klopt niet (%): teruggedraaid', h; end if;
end $$;
