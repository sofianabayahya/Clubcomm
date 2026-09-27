-- ClubComm — Besluit 67: de beoordeling (kijk) van de trainer is alleen voor de staf.
-- Tot nu toe mochten ouders de rijen van scope 'beoord' van hun eigen kind lezen (de app toonde ze een dag na het gesprek).
-- Nu ziet de ouder alleen wat in het ontwikkelgesprek samen is afgesproken (ontwVerslag, scope spelerlees).
-- Verder gelijk aan 009.

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
      -- Besluit 67: de kijk van de trainer is alleen voor de staf; ouders lezen het verslag (scope spelerlees)
      return p_team = any(staf) and priv.cc_taak('beoordelingZien', p_team);
    when 'notitie' then return p_team = any(staf) and priv.cc_taak('notities', p_team);
    when 'act' then return p_team = any(staf) or (p_team = any(tijdelijk) and p_act is not null and priv.cc_act_toegang(p_act)) or (not p_schrijven and p_speler = any(kids));
    when 'speeltijd' then return p_team = any(staf) or p_team = any(tijdelijk);
    when 'eigen' then return p_persoon = ik;
    when 'hjo' then return admin or coord;
    when 'bericht' then
      if p_schrijven then return p_data->>'van' in (ik, 'systeem') or (p_data->'ontvangers') ? ik; end if;
      return p_data->>'van' = ik or (p_data->'ontvangers') ? ik or (admin and p_data->>'soort' in ('nieuws','melding'))
        -- Vastgezet nieuws (Besluit 41): ook zichtbaar voor ouders die later instromen, zolang het vastgezet is
        or (p_data->>'soort' = 'nieuws' and coalesce(p_data->>'vastTot', '') > to_char(now() at time zone 'utc', 'YYYY-MM-DD"T"HH24:MI:SS')
            and (p_data->>'bereik' = 'Hele club' or string_to_array(p_data->>'bereik', ', ') && kidteams));
    when 'aanm' then return p_team = any(staf) or (not p_schrijven and lower(p_data->>'email') = lower(auth.email()));
    else return false;
  end case;
end $$;
