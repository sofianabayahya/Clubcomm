// ClubComm — Edge Function "melding" (Besluit 35): mailt een nieuw bericht naar de ontvangers via Brevo.
// Wordt aangeroepen door de database (trigger cc_mail) met { club, id }.
// Secrets (Supabase → Edge Functions → Secrets): BREVO_API_KEY, AFZENDER_EMAIL; optioneel APP_URL.
import { createClient } from "jsr:@supabase/supabase-js@2";

const json = (x: unknown, status = 200) => new Response(JSON.stringify(x), { status, headers: { "Content-Type": "application/json" } });
const esc = (t: string) => String(t ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));

Deno.serve(async (req) => {
  let body: { club?: string; id?: string };
  try { body = await req.json(); } catch { return json({ fout: "geen JSON" }, 400); }
  const { club, id } = body;
  if (!club || !id) return json({ fout: "club en id nodig" }, 400);

  const sleutel = Deno.env.get("BREVO_API_KEY"); const afzender = Deno.env.get("AFZENDER_EMAIL");
  const app = Deno.env.get("APP_URL") ?? "https://clubcomm-nine.vercel.app";
  if (!sleutel || !afzender) return json({ overgeslagen: "BREVO_API_KEY of AFZENDER_EMAIL ontbreekt" });

  const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const log = (notitie: string, aantal = 0) => sb.from("mail_log").update({ notitie, aantal }).eq("club_id", club).eq("msg_id", id);

  // Hooguit één keer per bericht
  const { error: al } = await sb.from("mail_log").insert({ club_id: club, msg_id: id });
  if (al) return json({ overgeslagen: "al verwerkt" });

  const { data: rij } = await sb.from("rij").select("data").eq("club_id", club).eq("soort", "msgs").eq("id", id).maybeSingle();
  const m = rij?.data;
  if (!m) { await log("niet gevonden"); return json({ overgeslagen: "bericht niet gevonden" }); }
  // Alleen nieuwe berichten (voorbeelddata en oude berichten niet), niet ingeplande, en geen niet-urgente meldingen aan staf
  if (Date.now() - new Date(m.tijd).getTime() > 15 * 60e3) { await log("oud bericht"); return json({ overgeslagen: "oud bericht" }); }
  if (m.gepland && new Date(m.gepland) > new Date()) { await log("ingepland"); return json({ overgeslagen: "ingepland" }); }
  if (m.soort === "melding" && !m.urgent) { await log("melding ter informatie"); return json({ overgeslagen: "melding ter informatie" }); }

  const ontvangers: string[] = (m.ontvangers ?? []).filter((x: string) => x && x !== m.van);
  if (!ontvangers.length) { await log("geen ontvangers"); return json({ overgeslagen: "geen ontvangers" }); }
  const { data: contacten } = await sb.from("rij").select("id, data").eq("club_id", club).eq("soort", "contact").in("id", ontvangers);
  const { data: c } = await sb.from("rij").select("data").eq("club_id", club).eq("soort", "club").eq("id", "club").maybeSingle();
  const clubnaam = c?.data?.naam ?? "ClubComm";
  let vanNaam = "ClubComm";
  if (m.van && m.van !== "systeem") { const { data: p } = await sb.from("rij").select("data").eq("club_id", club).eq("soort", "people").eq("id", m.van).maybeSingle(); vanNaam = p?.data?.naam ?? vanNaam; }

  const tekst = String(m.tekst ?? "");
  const html = `<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;color:#0b2545">
    <p style="color:#5b6b7f;font-size:13px;margin:0 0 8px">${esc(clubnaam)} · ${esc(vanNaam)}${m.urgent ? ' · <b style="color:#c62828">Urgent</b>' : ""}</p>
    <h2 style="font-size:20px;margin:0 0 12px">${esc(m.onderwerp)}</h2>
    <p style="font-size:15px;line-height:1.5;white-space:pre-line">${esc(tekst)}</p>
    <p style="margin:24px 0"><a href="${app}" style="background:#1e5ba8;color:#fff;text-decoration:none;padding:12px 18px;border-radius:8px;display:inline-block">Open ClubComm</a></p>
    <p style="color:#5b6b7f;font-size:12px">Je krijgt deze e-mail omdat je bij ${esc(clubnaam)} in ClubComm staat. Reageren of afmelden doe je in de app.</p></div>`;

  let n = 0; const fouten: string[] = [];
  for (const k of contacten ?? []) {
    const email = String(k.data?.email ?? "").trim();
    if (!email || /\.invalid$/i.test(email)) continue;
    const r = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST", headers: { "api-key": sleutel, "Content-Type": "application/json", accept: "application/json" },
      body: JSON.stringify({ sender: { name: `${clubnaam} via ClubComm`, email: afzender }, to: [{ email }], subject: `${m.urgent ? "Urgent: " : ""}${m.onderwerp}`, htmlContent: html, textContent: `${m.onderwerp}\n\n${tekst}\n\nOpen ClubComm: ${app}` }),
    });
    if (r.ok) n++; else fouten.push(`${r.status}`);
  }
  await log(fouten.length ? `fouten: ${fouten.join(",")}` : "verstuurd", n);
  return json({ verstuurd: n, fouten });
});
