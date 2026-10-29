-- ClubComm — alleen voor de lokale beveiligingstest (rechtentest-lokaal.sh). Bootst het deel van Supabase na dat de migraties
-- nodig hebben: rollen, auth (uid/email uit de JWT-claims), extensions, en lege versies van net, cron en vault.
-- Draait nooit tegen de echte database: het script maakt een tijdelijke database zonder netwerk.
do $$ begin
  if not exists (select 1 from pg_roles where rolname = 'anon') then create role anon nologin noinherit; end if;
  if not exists (select 1 from pg_roles where rolname = 'authenticated') then create role authenticated nologin noinherit; end if;
  if not exists (select 1 from pg_roles where rolname = 'service_role') then create role service_role nologin noinherit bypassrls; end if;
end $$;
create schema auth; create schema extensions;
create table auth.users (id uuid primary key, email text, aud text, role text, instance_id uuid, raw_user_meta_data jsonb default '{}', created_at timestamptz default now());
create function auth.jwt() returns jsonb language sql stable as $$ select coalesce(nullif(current_setting('request.jwt.claims', true), ''), '{}')::jsonb $$;
create function auth.uid() returns uuid language sql stable as $$ select nullif(auth.jwt()->>'sub','')::uuid $$;
create function auth.email() returns text language sql stable as $$ select auth.jwt()->>'email' $$;
create function auth.role() returns text language sql stable as $$ select auth.jwt()->>'role' $$;
grant usage on schema auth to anon, authenticated; grant usage on schema public to anon, authenticated, service_role;
create extension if not exists pgcrypto schema extensions;
-- pg_net, pg_cron en vault: alleen de functies die de migraties aanroepen; ze doen niets (geen netwerk, geen planning)
create schema net; create function net.http_post(url text, body jsonb default '{}', params jsonb default '{}', headers jsonb default '{}', timeout_milliseconds int default 5000) returns bigint language sql as $$ select 1::bigint $$;
create schema cron; create table cron.job (jobid bigserial, jobname text, schedule text, command text);
create function cron.schedule(n text, s text, c text) returns bigint language sql as $$ insert into cron.job(jobname,schedule,command) values (n,s,c) returning jobid $$;
create function cron.unschedule(n text) returns boolean language sql as $$ delete from cron.job where jobname = n returning true $$;
create function cron.unschedule(n bigint) returns boolean language sql as $$ delete from cron.job where jobid = n returning true $$;
create schema vault; create function vault.create_secret(a text, b text default null, c text default null) returns uuid language sql as $$ select gen_random_uuid() $$;
create view vault.decrypted_secrets as select ''::text as name, ''::text as decrypted_secret;
