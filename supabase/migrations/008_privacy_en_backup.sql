-- ClubComm — akkoord met de privacyverklaring vastleggen bij het aanmelden, en een wekelijkse back-up (Besluit 37).

-- 1. Aanmelden: alleen met akkoord; het moment van akkoord gaat mee in de aanmelding
drop function if exists public.aanmelden(text, text, text, text, text);
create or replace function public.aanmelden(p_club text, p_team text, p_ouder text, p_voor text, p_achter text, p_akkoord boolean default false) returns text language plpgsql security definer set search_path = public as $$
declare nid text := 'm' || floor(extract(epoch from clock_timestamp()) * 1000)::bigint;
begin
  if auth.uid() is null then raise exception 'Log eerst in'; end if;
  if not coalesce(p_akkoord, false) then raise exception 'Ga eerst akkoord met de privacyverklaring'; end if;
  if not exists (select 1 from public.rij where club_id = p_club and soort = 'teams' and id = p_team) then raise exception 'Onbekend team'; end if;
  insert into public.rij (club_id, soort, id, scope, team_id, data) values (p_club, 'aanm', nid, 'aanm', p_team,
    jsonb_build_object('id', nid, 'teamId', p_team, 'email', auth.email(), 'ouderNaam', left(p_ouder, 80), 'kindVoor', left(p_voor, 40), 'kindAchter', left(p_achter, 60), 'tijd', to_jsonb(now()), 'status', 'open', 'privacyAkkoord', to_jsonb(now())));
  return nid;
end $$;
revoke execute on function public.aanmelden(text, text, text, text, text, boolean) from public, anon;
grant execute on function public.aanmelden(text, text, text, text, text, boolean) to authenticated;

-- 2. Wekelijkse back-up in een afgeschermd schema (alleen de server kan erbij); de laatste 8 weken blijven bewaard
create extension if not exists pg_cron;
create schema if not exists backup;
revoke all on schema backup from public, anon, authenticated;
create table if not exists backup.rij (gemaakt date not null, like public.rij);
create table if not exists backup.lid (gemaakt date not null, like public.lid);
create or replace function backup.maak() returns void language plpgsql security definer set search_path = public as $$
begin
  delete from backup.rij where gemaakt = current_date; delete from backup.lid where gemaakt = current_date;
  insert into backup.rij select current_date, r.* from public.rij r;
  insert into backup.lid select current_date, l.* from public.lid l;
  delete from backup.rij where gemaakt < current_date - 56; delete from backup.lid where gemaakt < current_date - 56;
end $$;
revoke execute on function backup.maak() from public, anon, authenticated;
select cron.unschedule(jobid) from cron.job where jobname = 'clubcomm-backup';
select cron.schedule('clubcomm-backup', '0 2 * * 0', 'select backup.maak()');   -- elke zondag 02:00 (UTC)
select backup.maak();                                                          -- meteen een eerste back-up
