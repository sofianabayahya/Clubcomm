// ClubComm — Edge Function "automaat" (Besluit 77). Elk kwartier aangeroepen door de database (pg_cron).
// Doet wat anders pas gebeurt als iemand van de staf de app opent: vaste clubberichten, herinneringen bij activiteiten,
// uitslag opslaan en versturen, ontwikkelgesprekken indelen/herinneren/afronden, gesprekken bij afgelaste trainingen.
// Gebruikt DEZELFDE regels als de app: de bestanden worden bij elke run van de website gehaald (één plek voor de regels).
// Nachtrust: tussen 21:00 en 07:30 (Nederlandse tijd) doet de functie niets; wat dan aan de beurt is, gaat om 07:30.
// { proef: true } = alleen uitrekenen en laten zien, niets opslaan; { altijd: true } = ook tijdens de nachtrust.
import { createClient } from "npm:@supabase/supabase-js@2";
import { maakMotor, draaiClub, BESTANDEN } from "./motor.mjs";

const SITE = "https://mijnclubcomm.nl/app/";
const json = (x: unknown, status = 200) => new Response(JSON.stringify(x), { status, headers: { "Content-Type": "application/json" } });

const nlUurMin = () => {
  const p = Object.fromEntries(new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Amsterdam", hourCycle: "h23", hour: "2-digit", minute: "2-digit" }).formatToParts(new Date()).map((x) => [x.type, x.value]));
  return Number(p.hour) * 60 + Number(p.minute);
};

Deno.serve(async (req) => {
  const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });
  // Alleen de database zelf mag deze functie starten (geheim uit een tabel die alleen de server kan lezen)
  const { data: g } = await sb.from("automaat_geheim").select("geheim").limit(1).maybeSingle();
  if (!g || req.headers.get("x-cc-geheim") !== g.geheim) return json({ fout: "geen toegang" }, 401);
  const body = await req.json().catch(() => ({}));
  const t = nlUurMin();
  if (!body.altijd && (t >= 21 * 60 || t < 7 * 60 + 30)) return json({ nachtrust: true });

  // Regels ophalen van de website (zelfde versie als de app)
  const bron: Record<string, string> = {};
  for (const b of BESTANDEN) {
    const r = await fetch(`${SITE}${b}?automaat=${Date.now()}`);
    if (!r.ok) return json({ fout: `kan ${b} niet laden (${r.status})` }, 500);
    bron[b] = await r.text();
  }

  const { data: clubs, error: ce } = await sb.from("rij").select("club_id").eq("soort", "club");
  if (ce) return json({ fout: ce.message }, 500);
  const uitkomst: Record<string, unknown> = {};
  for (const { club_id: club } of clubs || []) {
    let ok = true; let samenvatting = "";
    try {
      const rijen: any[] = [];
      for (let van = 0; ; van += 1000) {
        const { data, error } = await sb.from("rij").select("soort,id,scope,team_id,speler_id,persoon_id,act_id,data").eq("club_id", club).order("soort").order("id").range(van, van + 999);
        if (error) throw error;
        rijen.push(...data); if (data.length < 1000) break;
      }
      const CC = maakMotor(bron); // per club een schone motor
      const { opslaan, weg, verslag } = draaiClub(CC, rijen, club);
      // Proefrun: alleen laten zien wat er zou gebeuren, niets opslaan
      if (body.proef) { uitkomst[club] = { proef: true, opslaan: opslaan.map((r: any) => `${r.soort}|${r.id}${r.soort === "msgs" ? ` · ${r.data.onderwerp}` : ""}`), weg, verslag }; continue; }
      for (let i = 0; i < opslaan.length; i += 200) {
        const { error } = await sb.from("rij").upsert(opslaan.slice(i, i + 200), { onConflict: "club_id,soort,id" });
        if (error) throw error;
      }
      if (weg.length) { const { error } = await sb.from("rij").delete().eq("club_id", club).eq("soort", "ontwGesprek").in("id", weg); if (error) throw error; }
      samenvatting = `${opslaan.length} opgeslagen, ${weg.length} weg${verslag.length ? ` · ${verslag.join(", ")}` : ""}`;
      if (verslag.some((v) => v.startsWith("fout"))) ok = false;
    } catch (e) { ok = false; samenvatting = `fout: ${(e as Error).message}`; }
    await sb.from("automaat_log").insert({ club_id: club, ok, samenvatting });
    await sb.from("automaat_log").delete().eq("club_id", club).lt("tijd", new Date(Date.now() - 14 * 864e5).toISOString());
    uitkomst[club] = { ok, samenvatting };
  }
  return json(uitkomst);
});
