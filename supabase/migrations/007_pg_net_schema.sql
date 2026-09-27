-- ClubComm — pg_net niet in het schema public (advies van de Supabase-beveiligingscontrole).
-- De functies blijven in het schema "net"; de triggers roepen net.http_post aan en blijven werken.
drop extension if exists pg_net;
create extension if not exists pg_net with schema extensions;
