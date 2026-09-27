-- ClubComm — Besluit 88: controlepunt voor de bewaking (UptimeRobot). Werkt de database, en heeft de automaat
-- (Besluit 77) het laatste half uur zonder fout gedraaid? Zo niet, dan een foutmelding (HTTP 400) en krijgt de beheerder een mail.
-- Tijdens de nachtrust (21:00–08:05 Nederlandse tijd, eerste ronde om 07:30) altijd goed. Geeft geen gegevens van mensen prijs.
-- Adres: GET https://<project>.supabase.co/rest/v1/rpc/gezondheid?apikey=<publishable key>
create or replace function public.gezondheid() returns text
language plpgsql stable security definer set search_path = public as $$
declare
  nl timestamp := now() at time zone 'Europe/Amsterdam';
  m int := extract(hour from nl)::int * 60 + extract(minute from nl)::int;
  laatst_ok timestamptz; laatste record;
begin
  if m < 8 * 60 + 5 or m >= 21 * 60 then return 'ok (nachtrust)'; end if;
  select max(tijd) into laatst_ok from automaat_log where ok;
  if laatst_ok is null or now() - laatst_ok > interval '35 minutes' then
    raise exception 'automaat draait niet: laatste goede ronde %', coalesce(to_char(laatst_ok at time zone 'Europe/Amsterdam', 'DD-MM HH24:MI'), 'nooit');
  end if;
  select ok, tijd into laatste from automaat_log order by tijd desc limit 1;
  if not laatste.ok then raise exception 'automaat gaf een fout om %', to_char(laatste.tijd at time zone 'Europe/Amsterdam', 'HH24:MI'); end if;
  return 'ok';
end $$;
revoke all on function public.gezondheid() from public;
grant execute on function public.gezondheid() to anon, authenticated;
