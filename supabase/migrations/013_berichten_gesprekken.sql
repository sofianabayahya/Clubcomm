-- ClubComm — Besluit 57: berichtenpagina met gesprekken, archief en intrekken.
-- bericht_bij (voor wie het bericht niet zelf stuurde) kan nu ook:
--   * archiveren of terugzetten voor jezelf (p_archief true/false; alleen jouw eigen id in data.archief);
--   * bij een nieuw antwoord: het gesprek weer "ongelezen" maken voor de anderen (gelezen = alleen jij) en uit ieders
--     archief halen (nieuw antwoord = het gesprek komt terug).
-- Extra veiligheid: een antwoord telt alleen als het van jou is (van = jij).
drop function if exists public.bericht_bij(text, boolean, jsonb);
create or replace function public.bericht_bij(p_id text, p_gelezen boolean, p_antw jsonb, p_archief boolean default null)
returns void language plpgsql security definer set search_path = public as $$
declare ik text := priv.cc_ik(); c text := priv.cc_club(); nieuw jsonb;
begin
  select coalesce(jsonb_agg(a), '[]'::jsonb) into nieuw from jsonb_array_elements(coalesce(p_antw, '[]'::jsonb)) a
    where a->>'van' = ik and not exists (select 1 from public.rij r where r.club_id = c and r.soort = 'msgs' and r.id = p_id and coalesce(r.data->'antw', '[]') @> jsonb_build_array(a));
  update public.rij set data = data
      || jsonb_build_object('antw', coalesce(data->'antw', '[]') || nieuw)
      || jsonb_build_object('gelezen', case
           when jsonb_array_length(nieuw) > 0 then jsonb_build_array(ik)
           when p_gelezen and not coalesce(data->'gelezen', '[]') ? ik then coalesce(data->'gelezen', '[]') || to_jsonb(ik)
           else coalesce(data->'gelezen', '[]') end)
      || jsonb_build_object('archief', case
           when jsonb_array_length(nieuw) > 0 then '[]'::jsonb
           when p_archief is true and not coalesce(data->'archief', '[]') ? ik then coalesce(data->'archief', '[]') || to_jsonb(ik)
           when p_archief is false then coalesce(data->'archief', '[]') - ik
           else coalesce(data->'archief', '[]') end)
  where club_id = c and soort = 'msgs' and id = p_id and (data->>'van' = ik or (data->'ontvangers') ? ik);
end $$;
revoke execute on function public.bericht_bij(text, boolean, jsonb, boolean) from public, anon;
grant execute on function public.bericht_bij(text, boolean, jsonb, boolean) to authenticated;
