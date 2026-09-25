// ClubComm — Edge Function "melding" (Besluit 35): mailt een nieuw bericht naar de ontvangers via Brevo.
// Wordt aangeroepen door de database: trigger cc_mail met { club, id } (nieuw bericht) en trigger cc_mail_antw met
// { club, id, antw } (nieuw antwoord). Wanneer een e-mail (Besluit 36): urgent, persoonlijk, kaarten/herinneringen,
// aankondigingen en nieuws; niet bij "alleen in de app" (mail: false) en niet bij meldingen ter informatie aan staf.
// Secrets (Supabase → Edge Functions → Secrets): BREVO_API_KEY, AFZENDER_EMAIL; optioneel APP_URL.
// Pushmeldingen (Besluit 53): naast de e-mail een pushmelding naar de telefoons van de ontvangers (tabel push_abonnement),
// per soort: nood (altijd, ook 's nachts), persoonlijk, aankondiging, herinnering, staf. Nachtrust 21:00–07:30: dan in de
// wachtrij, 's ochtends verstuurd ({ wachtrij: true }, via pg_cron). E-mail is het vangnet (Besluit 57): alleen naar wie
// geen pushmelding krijgt (noodberichten altijd), één e-mail per onderwerp, antwoorden nooit per e-mail.
// Verder: { club, soort: 'afm'|'aanm', rij } = seintje bij afmelding (trainer, alleen op de dag zelf) en aanmelding (staf);
// { sleutel: true } = sleutelpaar voor push maken (één keer; de geheime helft blijft hier).
import { createClient } from "jsr:@supabase/supabase-js@2";
import webpush from "npm:web-push@3.6.7";

const json = (x: unknown, status = 200) => new Response(JSON.stringify(x), { status, headers: { "Content-Type": "application/json" } });
const esc = (t: string) => String(t ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));

// ---------- Pushmeldingen ----------
// deno-lint-ignore no-explicit-any
type Sb = any;
type Push = { titel: string; tekst: string; url: string; tag: string; soort: string };
// Nachtrust in Nederlandse tijd: 21:00 tot 07:30
const nachtrust = () => {
  const [u, m] = new Intl.DateTimeFormat("nl-NL", { timeZone: "Europe/Amsterdam", hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date()).split(":").map(Number);
  const t = u * 60 + m; return t >= 21 * 60 || t < 7 * 60 + 30;
};
const vandaagNL = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Amsterdam" }).format(new Date());
const kort = (t: string, n = 170) => { const x = String(t ?? "").replace(/\s+/g, " ").trim(); return x.length > n ? x.slice(0, n - 1) + "…" : x; };

const sleutels = async (sb: Sb, maak: boolean) => {
  const { data } = await sb.from("push_sleutel").select("publiek, prive").eq("id", 1).maybeSingle();
  if (data || !maak) return data as { publiek: string; prive: string } | null;
  const k = webpush.generateVAPIDKeys();
  await sb.from("push_sleutel").insert({ id: 1, publiek: k.publicKey, prive: k.privateKey });
  return (await sb.from("push_sleutel").select("publiek, prive").eq("id", 1).maybeSingle()).data as { publiek: string; prive: string } | null;
};
let klaar = false;
const zetSleutels = async (sb: Sb, app: string) => {
  if (klaar) return true; const k = await sleutels(sb, false); if (!k) return false;
  webpush.setVapidDetails(app.startsWith("https://") ? app : "mailto:noreply@mijnclubcomm.nl", k.publiek, k.prive); klaar = true; return true;
};
// Eén pushmelding naar één telefoon; verlopen adressen (404/410) worden opgeruimd
const stuurEen = async (sb: Sb, ab: { endpoint: string; p256dh: string; auth: string }, p: Push) => {
  try {
    await webpush.sendNotification({ endpoint: ab.endpoint, keys: { p256dh: ab.p256dh, auth: ab.auth } }, JSON.stringify(p), { TTL: 24 * 3600, urgency: p.soort === "nood" ? "high" : "normal" });
    await sb.from("push_abonnement").update({ laatst: new Date().toISOString() }).eq("endpoint", ab.endpoint);
    return true;
  } catch (e) {
    const code = (e as { statusCode?: number }).statusCode;
    if (code === 404 || code === 410) await sb.from("push_abonnement").delete().eq("endpoint", ab.endpoint);
    return false;
  }
};
// Naar alle telefoons van deze personen, volgens hun keuzes en de nachtrust. Geeft terug wie een pushmelding krijgt.
const pushNaar = async (sb: Sb, app: string, club: string, personen: string[], p: Push) => {
  const bereikt = new Set<string>(); let n = 0;
  if (!personen.length || !(await zetSleutels(sb, app))) return { bereikt, n };
  const { data: abs } = await sb.from("push_abonnement").select("endpoint, persoon_id, p256dh, auth, voorkeur").eq("club_id", club).in("persoon_id", personen);
  const wacht = p.soort !== "nood" && nachtrust();
  for (const ab of abs ?? []) {
    if (p.soort !== "nood" && (ab.voorkeur ?? {})[p.soort] === false) continue;
    bereikt.add(ab.persoon_id);
    if (wacht) { await sb.from("push_wachtrij").insert({ endpoint: ab.endpoint, bericht: p }); continue; }
    if (await stuurEen(sb, ab, p)) n++;
  }
  return { bereikt, n };
};
// Staf van een team: trainers en/of teamleiders (rollen per persoon en de vaste trainer/teamleider van het team)
const stafVan = async (sb: Sb, club: string, teamId: string, rollen: string[]) => {
  const { data: mensen } = await sb.from("rij").select("id, data").eq("club_id", club).eq("soort", "people");
  const { data: t } = await sb.from("rij").select("data").eq("club_id", club).eq("soort", "teams").eq("id", teamId).maybeSingle();
  const ids = new Set<string>();
  for (const p of mensen ?? []) if ((p.data?.rollen ?? []).some((r: { rol: string; teamId?: string }) => rollen.includes(r.rol) && r.teamId === teamId)) ids.add(p.id);
  if (rollen.includes("trainer") && t?.data?.trainerId) ids.add(t.data.trainerId);
  if (rollen.includes("teamleider") && t?.data?.teamleiderId) ids.add(t.data.teamleiderId);
  return { ids: [...ids], teamnaam: String(t?.data?.naam ?? teamId) };
};

Deno.serve(async (req) => {
  let body: { club?: string; id?: string; antw?: number; soort?: string; rij?: string; wachtrij?: boolean; sleutel?: boolean };
  try { body = await req.json(); } catch { return json({ fout: "geen JSON" }, 400); }
  const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const app = Deno.env.get("APP_URL") ?? "https://mijnclubcomm.nl";

  // Sleutelpaar voor push (één keer maken; geeft alleen de publieke helft terug)
  if (body.sleutel) { const k = await sleutels(sb, true); return json({ publiek: k?.publiek ?? null }); }

  // Ochtend: de wachtrij van de nachtrust versturen
  if (body.wachtrij) {
    if (nachtrust()) return json({ overgeslagen: "nog nachtrust" });
    if (!(await zetSleutels(sb, app))) return json({ overgeslagen: "geen sleutels" });
    const { data: rij } = await sb.from("push_wachtrij").select("id, endpoint, bericht").order("id").limit(500);
    let n = 0; const tags = new Set<string>();
    for (const w of rij ?? []) {
      await sb.from("push_wachtrij").delete().eq("id", w.id);
      if (tags.has(w.endpoint + "|" + w.bericht.tag)) continue; tags.add(w.endpoint + "|" + w.bericht.tag);
      const { data: ab } = await sb.from("push_abonnement").select("endpoint, p256dh, auth").eq("endpoint", w.endpoint).maybeSingle();
      if (ab && await stuurEen(sb, ab, w.bericht)) n++;
    }
    return json({ verstuurd: n });
  }

  // Afmelding (op de dag zelf → trainer) of nieuwe aanmelding (→ teamleider en trainer)
  if (body.soort && body.rij && body.club) {
    const club = body.club; const sleutelId = `${body.soort}:${body.rij}`;
    const { error: al } = await sb.from("mail_log").insert({ club_id: club, msg_id: sleutelId });
    if (al) return json({ overgeslagen: "al verwerkt" });
    const log = (notitie: string, aantal = 0) => sb.from("mail_log").update({ notitie, aantal }).eq("club_id", club).eq("msg_id", sleutelId);
    const { data: r } = await sb.from("rij").select("data").eq("club_id", club).eq("soort", body.soort).eq("id", body.rij).maybeSingle();
    const d = r?.data; if (!d) { await log("niet gevonden"); return json({ overgeslagen: "niet gevonden" }); }
    if (body.soort === "afm") {
      const { data: a } = await sb.from("rij").select("data").eq("club_id", club).eq("soort", "acts").eq("id", d.actId).maybeSingle();
      if (!a?.data || a.data.afgelast || a.data.datum !== vandaagNL()) { await log("niet vandaag"); return json({ overgeslagen: "niet vandaag" }); }
      const { data: sp } = await sb.from("rij").select("data").eq("club_id", club).eq("soort", "players").eq("id", d.spelerId).maybeSingle();
      const { ids } = await stafVan(sb, club, a.data.teamId, ["trainer"]);
      const wat = a.data.soort === "training" ? "de training" : a.data.soort === "activiteit" ? String(a.data.naam ?? "de activiteit") : "de wedstrijd";
      const { n } = await pushNaar(sb, app, club, ids.filter((x) => x !== d.door), {
        soort: "staf", tag: `afm-${a.data.id ?? d.actId}-${d.spelerId}`, url: `${app}/`,
        titel: `${sp?.data?.voornaam ?? "Een speler"} komt vandaag niet`, tekst: kort(`Afgemeld voor ${wat} van ${a.data.tijd ?? ""}: ${d.reden ?? ""}${d.opm ? " · " + d.opm : ""}`),
      });
      await log("push afmelding", n); return json({ push: n });
    }
    if (body.soort === "aanm") {
      if (d.status !== "open") { await log("niet open"); return json({ overgeslagen: "niet open" }); }
      const { ids, teamnaam } = await stafVan(sb, club, d.teamId, ["teamleider", "trainer"]);
      const { n } = await pushNaar(sb, app, club, ids, {
        soort: "staf", tag: `aanm-${body.rij}`, url: `${app}/`,
        titel: "Nieuwe aanmelding", tekst: kort(`${d.kindVoor ?? ""} ${d.kindAchter ?? ""} (ouder: ${d.ouderNaam ?? "onbekend"}) wil bij ${teamnaam}. Keur goed in ClubComm.`),
      });
      await log("push aanmelding", n); return json({ push: n });
    }
    await log("onbekende soort"); return json({ overgeslagen: "onbekende soort" });
  }

  const { club, id } = body; const nr = Number(body.antw || 0);
  if (!club || !id) return json({ fout: "club en id nodig" }, 400);
  const sleutel = Deno.env.get("BREVO_API_KEY"); const afzender = Deno.env.get("AFZENDER_EMAIL");
  const sleutelId = nr ? `${id}#antw${nr}` : id;
  const log = (notitie: string, aantal = 0) => sb.from("mail_log").update({ notitie, aantal }).eq("club_id", club).eq("msg_id", sleutelId);

  // Hooguit één keer per bericht (en per antwoord)
  const { error: al } = await sb.from("mail_log").insert({ club_id: club, msg_id: sleutelId });
  if (al) return json({ overgeslagen: "al verwerkt" });

  const { data: rij } = await sb.from("rij").select("data").eq("club_id", club).eq("soort", "msgs").eq("id", id).maybeSingle();
  const m = rij?.data;
  if (!m) { await log("niet gevonden"); return json({ overgeslagen: "bericht niet gevonden" }); }
  // Een antwoord: naar de afzender en (bij persoonlijke berichten) de andere deelnemers, niet naar wie antwoordde
  const a = nr ? (m.antw ?? [])[nr - 1] : null;
  if (nr && !a) { await log("antwoord niet gevonden"); return json({ overgeslagen: "antwoord niet gevonden" }); }
  const tijd = a ? a.tijd : m.tijd;
  // Alleen nieuwe berichten (voorbeelddata en oude berichten niet), niet ingeplande, en geen niet-urgente meldingen aan staf
  if (Date.now() - new Date(tijd).getTime() > 15 * 60e3) { await log("oud bericht"); return json({ overgeslagen: "oud bericht" }); }
  if (!a && m.gepland && new Date(m.gepland) > new Date()) { await log("ingepland"); return json({ overgeslagen: "ingepland" }); }
  // Soort pushmelding (Besluit 53); null = geen pushmelding
  const pushSoort = a ? "persoonlijk" : m.urgent ? "nood" : m.soort === "persoonlijk" ? "persoonlijk"
    : m.soort === "melding" ? (m.push ? "staf" : null) : (m.herinnering || m.auto) ? "herinnering" : "aankondiging";
  // E-mail (Besluit 57): één e-mail per onderwerp. Antwoorden in een gesprek nooit per e-mail (alleen push); de ontvanger
  // weet dat het gesprek loopt en ziet het in de app. Niet bij meldingen ter informatie en niet bij "alleen in de app".
  let mailen = !!(sleutel && afzender) && !a;
  if (!a && m.soort === "melding" && !m.urgent) mailen = false;
  if (!a && m.mail === false && !m.urgent) mailen = false;
  if (!pushSoort && !mailen) { await log(m.soort === "melding" ? "melding ter informatie" : "alleen in de app"); return json({ overgeslagen: "geen mail of push" }); }

  const deelnemers: string[] = a ? (m.soort === "persoonlijk" ? [m.van, ...(m.ontvangers ?? [])] : [m.van]) : (m.ontvangers ?? []);
  const ontvangers: string[] = [...new Set(deelnemers)].filter((x: string) => x && x !== "systeem" && x !== (a ? a.van : m.van));
  if (!ontvangers.length) { await log("geen ontvangers"); return json({ overgeslagen: "geen ontvangers" }); }
  // Eerst de pushmelding
  let pushN = 0; let bereikt = new Set<string>();
  if (pushSoort) {
    let van = "ClubComm";
    const vid = a ? a.van : m.van;
    if (vid && vid !== "systeem") { const { data: p } = await sb.from("rij").select("data").eq("club_id", club).eq("soort", "people").eq("id", vid).maybeSingle(); van = p?.data?.naam ?? van; }
    const r = await pushNaar(sb, app, club, ontvangers, {
      soort: pushSoort, tag: id, url: `${app}/?bericht=${encodeURIComponent(id)}`,
      titel: a ? `${van} antwoordde: ${m.onderwerp}` : `${m.urgent ? "Urgent: " : ""}${m.onderwerp}`,
      tekst: kort(a ? a.tekst : m.tekst),
    });
    pushN = r.n; bereikt = r.bereikt;
  }
  // E-mail is het vangnet (Besluit 57): alleen naar wie geen pushmelding krijgt. Noodberichten altijd ook per e-mail.
  const mailNaar = pushSoort === "nood" ? ontvangers : ontvangers.filter((x) => !bereikt.has(x));
  if (!mailen || !mailNaar.length) { await log(`push ${pushN}${mailen ? ", mail niet nodig" : ", geen mail"}`, pushN); return json({ push: pushN, verstuurd: 0 }); }
  const { data: contacten } = await sb.from("rij").select("id, data").eq("club_id", club).eq("soort", "contact").in("id", mailNaar);
  const { data: c } = await sb.from("rij").select("data").eq("club_id", club).eq("soort", "club").eq("id", "club").maybeSingle();
  const clubnaam = c?.data?.naam ?? "ClubComm";
  let vanNaam = "ClubComm";
  const vanId = a ? a.van : m.van;
  if (vanId && vanId !== "systeem") { const { data: p } = await sb.from("rij").select("data").eq("club_id", club).eq("soort", "people").eq("id", vanId).maybeSingle(); vanNaam = p?.data?.naam ?? vanNaam; }

  const tekst = a ? `${vanNaam} antwoordde:\n\n${a.tekst}` : String(m.tekst ?? "");
  const onderwerp = `${a ? "Antwoord: " : m.urgent ? "Urgent: " : ""}${m.onderwerp}`;
  const html = `<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;color:#0b2545">
    <p style="color:#5b6b7f;font-size:13px;margin:0 0 8px">${esc(clubnaam)} · ${esc(vanNaam)}${m.urgent ? ' · <b style="color:#c62828">Urgent</b>' : ""}</p>
    <h2 style="font-size:20px;margin:0 0 12px">${esc(onderwerp)}</h2>
    <p style="font-size:15px;line-height:1.5;white-space:pre-line">${esc(tekst)}</p>
    <p style="margin:24px 0"><a href="${app}/?bericht=${encodeURIComponent(id)}" style="background:#1e5ba8;color:#fff;text-decoration:none;padding:12px 18px;border-radius:8px;display:inline-block">Open ClubComm</a></p>
    <p style="color:#5b6b7f;font-size:12px">Je krijgt deze e-mail omdat je bij ${esc(clubnaam)} in ClubComm staat. Reageren of afmelden doe je in de app.</p></div>`;

  let n = 0; const fouten: string[] = [];
  for (const k of contacten ?? []) {
    const email = String(k.data?.email ?? "").trim();
    if (!email || /\.invalid$/i.test(email)) continue;
    const r = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST", headers: { "api-key": sleutel!, "Content-Type": "application/json", accept: "application/json" },
      body: JSON.stringify({ sender: { name: `${clubnaam} via ClubComm`, email: afzender }, to: [{ email }], subject: onderwerp, htmlContent: html, textContent: `${onderwerp}\n\n${tekst}\n\nOpen ClubComm: ${app}` }),
    });
    if (r.ok) n++; else fouten.push(`${r.status}`);
  }
  await log(`${fouten.length ? `fouten: ${fouten.join(",")}` : "verstuurd"} · push ${pushN}`, n);
  return json({ verstuurd: n, push: pushN, fouten });
});
