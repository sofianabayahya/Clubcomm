// ClubComm — verbinding met de database (Supabase). De publishable key is bedoeld om openbaar te zijn;
// wat iemand mag zien en wijzigen regelt de database zelf (RLS, zie supabase/migrations).
// Zonder deze instellingen, of met ?demo in de adresbalk, draait de app als demo met voorbeelddata.
window.CC_CONFIG = {
  url: 'https://pkvacwbdgumkffxnxnqk.supabase.co',
  key: 'sb_publishable_mi7Z6cjaG7k4kh2e3JbCfg_tTwmQIiE',
  club: 'dcg',
};
