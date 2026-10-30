// ClubComm — DEMO (simulatie) voor AVV Swift. Alleen op branch demo/swift-trainer; wordt NOOIT samengevoegd met main.
// Dit bestand staat op de plek van de Supabase-bibliotheek (app/vendor/supabase.js) en vervangt die: er is geen verbinding met een database of server, ook niet als terugval.
// Alles staat in de browser (localStorage, per stand een eigen sleutel) en is fictief: team Demo O15, Demo HJO, Demo Trainer.
// Rechten: de leesregels en schrijfregels volgen priv.cc_mag van de echte database (zoals productie: zonder migratie 033);
// tests/demo-swift.spec.js vergelijkt dit per rij met de echte regels in een tijdelijke lokale database.
(function () {
  const CLUB = 'swift-demo';
  const STANDEN = { nu: 'Swift nu', knvb: 'Swift KNVB — concept' };
  const opslag = (() => { try { const t = '__demo'; localStorage.setItem(t, t); localStorage.removeItem(t); return localStorage; } catch (e) { const m = {}; return { getItem: (k) => (k in m ? m[k] : null), setItem: (k, v) => { m[k] = String(v); }, removeItem: (k) => { delete m[k]; } }; } })();
  const vraag = new URLSearchParams(location.search).get('stand');
  if (vraag && STANDEN[vraag]) opslag.setItem('demo-swift-stand', vraag);
  const STAND = STANDEN[opslag.getItem('demo-swift-stand')] ? opslag.getItem('demo-swift-stand') : 'nu';
  const KEY = 'demo-swift-db-' + STAND;
  const db = (() => { try { return JSON.parse(opslag.getItem(KEY) || 'null'); } catch (e) { return null; } })() || { rows: {}, lid: {}, user: null };
  const bewaar = () => opslag.setItem(KEY, JSON.stringify(db));
  const sleutel = (r) => `${r.soort}|${r.id}`;
  const kopie = (x) => JSON.parse(JSON.stringify(x));
  window.DEMO_SWIFT = { stand: STAND, standNaam: STANDEN[STAND], club: CLUB, db, bewaar };

  // ---------- Fictieve gegevens (alleen verzonnen namen; geen adres of sportpark) ----------
  // Swift-instellingen: overgenomen uit de echte clubinstellingen (30-10-2026), zonder adres, sportpark en stops.
  const SWIFT = {
    pakket: 'trainers', labels: { hjo: 'HO', coordinator: 'Coördinator' }, coordinatorAan: false, groepen: [], momenten: [],
    modules: { taken: false, vervoer: false, training: true, materiaal: false, speeltijd: false, beloningen: false, beoordeling: false },
    seizoen: { start: '2026-08-19', eind: '2027-06-05' },
    fasen: [{ nr: 1, van: '2026-08-19' }, { nr: 2, van: '2026-10-31' }, { nr: 3, van: '2027-01-20' }, { nr: 4, van: '2027-04-02' }],
    vakanties: [{ id: 'herfst', naam: 'Herfstvakantie', van: '2026-10-11', tot: '2026-10-18', trainen: false }, { id: 'kerst', naam: 'Kerstvakantie', van: '2026-12-19', tot: '2027-01-03', trainen: false },
      { id: 'voorjaar', naam: 'Voorjaarsvakantie', van: '2027-02-21', tot: '2027-02-28', trainen: false }, { id: 'mei', naam: 'Meivakantie', van: '2027-04-26', tot: '2027-05-09', trainen: false }, { id: 'zomer', naam: 'Zomervakantie', van: '2027-07-10', tot: '2027-08-22', trainen: false }],
    ingericht: { regels: true, rollen: true, modules: true, seizoen: true, vakanties: true },
    inst: { geel: 3, zones: { breedte: { groen: 80, oranje: 75 }, selectie: { groen: 90, oranje: 85 } }, oranje: 5, ernstig: 50, trainer: { drempel: 3, maxSeizoen: 5, deadlineUur: 24 }, liggenDagen: 14, oproepDagen: 2, waarschuwing: '', deadlineTraining: 3, deadlineWedstrijd: 24 },
    materiaal: { wie: 'Secretaris', mail: '', lijst: [] }, autoBerichten: [], sportpark: '', regio: '', stops: [],
    taken: { staf: { hjo: true, trainer: false, teamleider: false, coordinator: false }, afdoen: { hjo: true, trainer: true, teamleider: false, coordinator: true }, bellen: { hjo: false, trainer: true, teamleider: false, coordinator: true }, gesprek: { hjo: false, trainer: false, teamleider: false, coordinator: true }, notities: { hjo: true, trainer: true, teamleider: false, coordinator: true }, planning: { hjo: true, trainer: true, teamleider: false, coordinator: false }, langdurig: { hjo: true, trainer: true, teamleider: false, coordinator: true }, materiaal: { hjo: false, trainer: true, teamleider: false, coordinator: false }, beoordelen: { hjo: false, trainer: true, teamleider: false, coordinator: false }, clubbericht: { hjo: true, trainer: false, teamleider: false, coordinator: false }, clubbesluit: { hjo: true, trainer: false, teamleider: false, coordinator: false }, ontwgesprek: { hjo: false, trainer: true, teamleider: false, coordinator: false }, toelichting: { hjo: true, trainer: true, teamleider: false, coordinator: true }, trainerNiet: { hjo: false, trainer: false, teamleider: false, coordinator: false }, aanmeldingen48: { hjo: false, trainer: false, teamleider: false, coordinator: true }, trainersVolgen: { hjo: false, trainer: false, teamleider: false, coordinator: true }, beoordelingZien: { hjo: true, trainer: true, teamleider: false, coordinator: true } },
  };
  // Stand "Swift KNVB — concept": niets is vastgesteld, dus alles heet concept. Teamfuncties volgens H06 (Spoor 2, voorlopig akkoord);
  // teamtaken wachten op besluit 06-B (controle in de officiële KNVB-bron). Leeftijdsdoelen en spelprincipes: nog leeg.
  const KNVB_CONCEPT = {
    id: 'swift-knvb-concept', naam: 'Swift KNVB — CONCEPT (simulatie, niet vastgesteld)', modus: 'afgeleid', basis: { bron: 'knvb', versie: '2026.1' }, versie: 'demo', status: 'concept',
    onderdelen: {
      teamfuncties: { status: 'eigen', items: [{ id: 'tf-aanvallen', naam: 'Aanvallen (concept)', kant: 'aanval' }, { id: 'tf-verdedigen', naam: 'Verdedigen (concept)', kant: 'verdediging' }] },
      leerlijnen: { status: 'eigen', items: [
        { id: 'tt-opbouwen', naam: 'Opbouwen (concept, 06-B open)', kant: 'aanval' }, { id: 'tt-scoren', naam: 'Scoren (concept, 06-B open)', kant: 'aanval' },
        { id: 'tt-storen', naam: 'Storen (concept, 06-B open)', kant: 'verdediging' }, { id: 'tt-voorkomen', naam: 'Doelpunten voorkomen (concept, 06-B open)', kant: 'verdediging' }] },
      evaluatie: { status: 'eigen', vragen: ['(concept) Werd er veel gevoetbald?', '(concept) Kwam het voetbalprobleem vaak terug?', '(concept) Was er weerstand?', '(concept) Was er plezier?'] },
      spelprincipes: { status: 'leeg', items: [] }, leerdoelenPerLeeftijd: { status: 'leeg', items: [] },
    },
  };
  const zaai = () => {
    if (Object.keys(db.rows).length || !window.CC || !CC.uitRijen) return;
    const D = CC.date; const S = CC.uitRijen([], D.vandaag());
    S.club = { ...S.club, ...SWIFT, id: CLUB, naam: 'AVV Swift — DEMO' };
    S.teams = [{ id: 'demo-o15', naam: 'Demo O15', cat: 'O15', type: 'selectie', rooster: [], afwijking: {}, trainerId: 'demo-trainer', teamleiderId: null }];
    const p = (id, naam, email, rollen) => ({ id, naam, email, tel: '', rollen });
    S.people = [p('demo-hjo', 'Demo HJO', 'hjo@demo.invalid', [{ rol: 'hjo' }, { rol: 'trainer', teamId: 'demo-o15' }]), p('demo-trainer', 'Demo Trainer', 'trainer@demo.invalid', [{ rol: 'trainer', teamId: 'demo-o15' }])];
    S.players = [];
    // Twee trainingen per week (di en do) en een wedstrijd (za): vorige week tot en met drie weken vooruit
    const v = D.vandaag(); const ma = D.addDays(v, -((D.parse(v).getDay() + 6) % 7));
    S.acts = [];
    for (let w = -1; w <= 3; w++) { const m = D.addDays(ma, 7 * w); const k = D.weeknr ? D.weeknr(m) : w;
      S.acts.push({ id: `demo-t-${m}-di`, teamId: 'demo-o15', soort: 'training', datum: D.addDays(m, 1), tijd: '18:30', eind: '19:45' },
        { id: `demo-t-${m}-do`, teamId: 'demo-o15', soort: 'training', datum: D.addDays(m, 3), tijd: '18:30', eind: '19:45' },
        { id: `demo-w-${m}`, teamId: 'demo-o15', soort: 'wedstrijd', datum: D.addDays(m, 5), tijd: '10:30', eind: '12:00', thuis: w % 2 === 0, tegen: `Demo FC O15-${(Math.abs(k) % 4) + 1}` }); }
    // Begeleiding: traject, één afgerond moment met feedback van de HJO (reflectie nog open) en één gepland moment
    S.trainerDossier = { 'demo-trainer': { traject: { actief: true, sinds: D.addDays(v, -21), door: 'demo-hjo', plan: { wedstrijd: 2, training: 2 }, leerdoel: 'Vaste coachmomenten', niveau: 'uitgebreid', ontwikkelpunt: 'Eerst kijken, dan coachen' } } };
    S.begeleidMomenten = [
      { id: 'demo-bm1', trainerId: 'demo-trainer', teamId: 'demo-o15', actId: `demo-t-${D.addDays(ma, -7)}-do`, soort: 'training', datum: D.addDays(ma, -4), door: 'demo-hjo', klaar: true, klaarOp: D.addDays(ma, -3), gedeeld: D.addDays(ma, -3) + 'T20:00:00.000Z',
        voor: { thema: 'Opbouwen onder druk', doel: 'Spelers spelen de vrije man aan', leerdoel: 'Vaste coachmomenten', hoDoel: '' },
        plan: { leerdoel: 'Vaste coachmomenten', focus: 'Wanneer stopt hij het spel, en wat leren de spelers daarvan?', feedback: 'Na afloop' },
        obs: { punten: {}, notities: {}, klok: null, turf: {} },
        vakken: { sterk: 'Duidelijke uitleg in het begin (fictief voorbeeld)', ontwikkelpunt: 'Eerst kijken, dan coachen', effect: 'Na twee vaste momenten speelden ze sneller de vrije man aan', afspraak: 'Bij elke vorm eerst 2 minuten alleen kijken' } },
      { id: 'demo-bm2', trainerId: 'demo-trainer', teamId: 'demo-o15', actId: null, soort: 'wedstrijd', datum: D.addDays(ma, 12), door: 'demo-hjo', klaar: false, gevraagd: D.addDays(v, -1) + 'T18:00:00.000Z',
        voor: { thema: 'Opbouwen onder druk', doel: 'Kort opbouwen als er een vrije man is', leerdoel: 'Eerst kijken, dan coachen', hoDoel: '' }, plan: {}, obs: { punten: {}, notities: {}, klok: null, turf: {} }, vakken: {} }];
    if (STAND === 'knvb') { S.profielen = { [KNVB_CONCEPT.id]: KNVB_CONCEPT }; S.club.profiel = KNVB_CONCEPT.id; }
    CC.naarRijen(S, CLUB).forEach((r) => { db.rows[sleutel(r)] = { ...r, club_id: CLUB }; });
    // CONCEPTFUNCTIONALITEIT: in de echte database heeft een profiel scope hjo (trainers lezen het nog niet; voorstel
    // onderzoek/profiel-leesrechten). In deze stand leest iedereen het (scope club), om te laten zien hoe het straks werkt.
    if (STAND === 'knvb' && !db.rows['profiel|' + KNVB_CONCEPT.id]) db.rows['profiel|' + KNVB_CONCEPT.id] = { club_id: CLUB, soort: 'profiel', id: KNVB_CONCEPT.id, scope: 'club', team_id: null, speler_id: null, persoon_id: null, act_id: null, data: KNVB_CONCEPT };
    bewaar();
  };

  // ---------- Rechten: spiegel van priv.cc_mag (supabase/migrations 002, 003, 016, 024–026), zoals in productie ----------
  const alle = () => Object.values(db.rows);
  const rollenVan = (pid) => { const p = db.rows['people|' + pid]; return (p && p.data && p.data.rollen) || []; };
  const context = () => {
    const ik = db.user && db.lid[db.user.id]; if (!ik) return null;
    const rol = rollenVan(ik); const heeft = (...x) => rol.some((r) => x.includes(r.rol));
    const admin = heeft('hjo', 'beheerder'), coord = heeft('coordinator'), begeleider = heeft('hjo', 'tc');
    const teams = alle().filter((r) => r.soort === 'teams');
    const staf = teams.filter((t) => admin || rol.some((r) => ['trainer', 'teamleider'].includes(r.rol) && r.teamId === t.id) || rol.some((r) => r.rol === 'coordinator' && (r.cats || []).includes((t.data || {}).cat))).map((t) => t.id);
    const spelers = alle().filter((r) => r.soort === 'players');
    const kids = spelers.filter((s) => ((s.data || {}).ouders || []).includes(ik)).map((s) => s.id);
    const kidteams = spelers.filter((s) => kids.includes(s.id)).map((s) => s.team_id);
    const stafouders = [...new Set(spelers.filter((s) => staf.includes(s.team_id)).flatMap((s) => (s.data || {}).ouders || []))];
    return { ik, rol, admin, coord, begeleider, staf, kids, kidteams, stafouders, tijdelijk: [], email: (db.user.email || '').toLowerCase() };
  };
  const isStaf = (pid) => rollenVan(pid).some((r) => r.rol !== 'ouder');
  const taak = (c, t, team) => { const club = db.rows['club|club']; const v = ((club && club.data.taken) || {})[t] || {}; const cat = ((db.rows['teams|' + team] || {}).data || {}).cat;
    return c.admin || c.rol.some((r) => (['trainer', 'teamleider'].includes(r.rol) && r.teamId === team && (v[r.rol] != null ? !!v[r.rol] : r.rol === 'trainer')) || (r.rol === 'coordinator' && (r.cats || []).includes(cat) && (v.coordinator != null ? !!v.coordinator : true))); };
  const mag = (r, schrijven, c) => {
    if (!c || r.club_id !== CLUB) return false;
    const d = r.data || {}; const inn = (x, l) => x != null && l.includes(x);
    switch (r.scope) {
      case 'club': return !schrijven || c.admin || (r.team_id != null && c.coord && inn(r.team_id, c.staf));
      case 'persoon': return !schrijven || r.persoon_id === c.ik || c.admin || c.staf.length > 0;
      case 'contact': return r.persoon_id === c.ik || c.admin || c.coord || inn(r.persoon_id, c.stafouders) || (!schrijven && isStaf(r.persoon_id)) || (schrijven && c.staf.length > 0);
      case 'team': return inn(r.team_id, c.staf) || inn(r.team_id, c.kidteams) || (!schrijven && r.act_id != null && r.speler_id == null && r.persoon_id == null && 'soort' in d && 'datum' in d && c.begeleider);
      case 'teamstaf': case 'spelerstaf': return inn(r.team_id, c.staf);
      case 'kind': return inn(r.team_id, c.staf) || inn(r.speler_id, c.kids) || (!schrijven && inn(r.team_id, c.kidteams));
      case 'speler': return inn(r.team_id, c.staf) || inn(r.speler_id, c.kids);
      case 'spelerlees': return inn(r.team_id, c.staf) || (!schrijven && inn(r.speler_id, c.kids));
      case 'beoord': return schrijven ? inn(r.team_id, c.staf) && taak(c, 'beoordelen', r.team_id) : inn(r.team_id, c.staf) && taak(c, 'beoordelingZien', r.team_id);
      case 'notitie': return inn(r.team_id, c.staf) && taak(c, 'notities', r.team_id);
      case 'act': return inn(r.team_id, c.staf) || (!schrijven && inn(r.speler_id, c.kids));
      case 'speeltijd': return inn(r.team_id, c.staf);
      case 'eigen': return r.persoon_id === c.ik;
      case 'hjo': return c.admin || c.coord;
      case 'bericht': if (schrijven) return ['systeem', c.ik].includes(d.van) || (d.ontvangers || []).includes(c.ik);
        return d.van === c.ik || (d.ontvangers || []).includes(c.ik) || (c.admin && ['nieuws', 'melding'].includes(d.soort))
          || (d.soort === 'nieuws' && (d.vastTot || '') > new Date().toISOString().slice(0, 19) && (d.bereik === 'Hele club' || String(d.bereik || '').split(', ').some((x) => c.kidteams.includes(x))));
      case 'aanm': return inn(r.team_id, c.staf) || (!schrijven && String(d.email || '').toLowerCase() === c.email);
      case 'trainerzelf': return r.persoon_id === c.ik || c.admin || c.begeleider;
      case 'trainerdossier': return (!schrijven && r.persoon_id === c.ik) || c.admin || c.begeleider;
      case 'hoprive': return c.rol.some((x) => ['hjo', 'tc'].includes(x.rol) && (!(x.bouwen || []).length || (d.bouwen || []).some((b) => (x.bouwen || []).includes(b))));
      default: return false;
    }
  };
  // Spiegel van de trigger priv.cc_bewaak (002, 029): scope niet omzetten, rollen alleen door HJO/beheerder, e-mail alleen door de persoon zelf of HJO
  const bewaak = (nieuw, oud, c) => {
    if (c.admin) return true;
    if (oud && (nieuw.scope !== oud.scope)) return false;
    const staf = (r) => JSON.stringify(((r && r.data && r.data.rollen) || []).filter((x) => x.rol !== 'ouder').map((x) => JSON.stringify(x)).sort());
    if (nieuw.soort === 'people' && staf(nieuw) !== staf(oud)) return false;
    if (nieuw.soort === 'contact' && nieuw.persoon_id !== c.ik) {
      if (oud && String((nieuw.data || {}).email || '').toLowerCase() !== String((oud.data || {}).email || '').toLowerCase()) return false;
      if (!oud && isStaf(nieuw.persoon_id)) return false;
    }
    if (nieuw.soort === 'acts' && !oud && !c.staf.includes(nieuw.team_id)) return false;
    return true;
  };
  window.DEMO_SWIFT.zicht = (pid) => { const oud = db.user; db.user = { id: 'zicht', email: '' }; db.lid.zicht = pid; const c = context(); const uit = alle().filter((r) => mag(r, false, c)).map(sleutel).sort(); delete db.lid.zicht; db.user = oud; return uit; };
  window.DEMO_SWIFT.magSchrijven = (pid, r) => { const oud = db.user; db.user = { id: 'zicht', email: '' }; db.lid.zicht = pid; const c = context(); const uit = mag({ club_id: CLUB, ...r }, true, c); delete db.lid.zicht; db.user = oud; return uit; };

  // ---------- Nagebootste client (zelfde vorm als supabase-js, alleen wat de app gebruikt) ----------
  const luisteraars = [];
  const antw = (data, error) => Promise.resolve({ data, error: error || null });
  const geweigerd = { message: 'new row violates row-level security policy for table "rij" (demo)', code: '42501' };
  const auth = {
    getSession: () => antw({ session: db.user ? { user: db.user } : null }),
    // Geen e-mail: de demo verstuurt niets. De code is altijd 123456 (staat op het inlogscherm in de banner).
    signInWithOtp: ({ email }) => { db.pending = email; bewaar(); return antw({}); },
    verifyOtp: ({ email, token }) => { if (token !== '123456') return antw(null, { message: 'invalid' }); zaai(); db.user = { id: 'demo-u-' + email.toLowerCase(), email: email.toLowerCase() }; bewaar(); luisteraars.forEach((f) => f('SIGNED_IN')); return antw({ user: db.user, session: { user: db.user } }); },
    signOut: () => { db.user = null; bewaar(); luisteraars.forEach((f) => f('SIGNED_OUT')); return antw({}); },
    onAuthStateChange: (f) => { luisteraars.push(f); return { data: { subscription: { unsubscribe() {} } } }; },
  };
  const from = (tabel) => {
    const q = { filters: [], range: null, op: 'select', payload: null };
    const b = {
      select() { return b; }, order() { return b; },
      eq(k, v) { q.filters.push((r) => r[k] === v); return b; },
      in(k, vs) { q.filters.push((r) => vs.includes(r[k])); return b; },
      range(a, z) { q.range = [a, z]; return b; },
      upsert(rows) { q.op = 'upsert'; q.payload = Array.isArray(rows) ? rows : [rows]; return b; },
      delete() { q.op = 'delete'; return b; },
      then(ok, fail) {
        let res; const c = context();
        if (tabel !== 'rij') res = { data: [], error: null };
        else if (q.op === 'upsert') {
          const fout = q.payload.find((r) => { const oud = db.rows[sleutel(r)]; return r.club_id !== CLUB || !mag(r, true, c) || (oud && !mag(oud, true, c)) || !bewaak(r, oud, c); });
          if (fout) res = { data: null, error: geweigerd };
          else { q.payload.forEach((r) => { db.rows[sleutel(r)] = kopie(r); }); bewaar(); res = { data: null, error: null }; }
        } else if (q.op === 'delete') {
          Object.entries(db.rows).forEach(([k, r]) => { if (q.filters.every((f) => f(r)) && mag(r, true, c) && (r.scope !== 'bericht' || (r.data || {}).van === c.ik || c.admin)) delete db.rows[k]; });
          bewaar(); res = { data: null, error: null };
        } else { let rs = alle().filter((r) => q.filters.every((f) => f(r)) && mag(r, false, c)); rs.sort((x, y) => (x.soort + x.id).localeCompare(y.soort + y.id)); if (q.range) rs = rs.slice(q.range[0], q.range[1] + 1); res = { data: kopie(rs), error: null }; }
        return Promise.resolve(res).then(ok, fail);
      },
    };
    return b;
  };
  const rpc = (naam, a) => {
    zaai();
    const ik = db.user && db.lid[db.user.id];
    if (naam === 'koppel_mij') {
      if (!db.user) return antw([]);
      if (!ik) { const c = alle().find((r) => r.soort === 'contact' && (r.data.email || '').toLowerCase() === db.user.email); if (c) { db.lid[db.user.id] = c.persoon_id; bewaar(); } }
      return antw(db.lid[db.user.id] ? [{ club_id: CLUB, persoon_id: db.lid[db.user.id] }] : []);
    }
    if (naam === 'bericht_bij') { const r = db.rows['msgs|' + a.p_id]; if (r && ik) { const d = r.data; const nieuw = (a.p_antw || []).filter((x) => x.van === ik);
      d.antw = [...(d.antw || []), ...nieuw]; if (nieuw.length) { d.gelezen = [ik]; d.archief = []; } else if (a.p_gelezen && !(d.gelezen || []).includes(ik)) d.gelezen = [...(d.gelezen || []), ik];
      if (!nieuw.length && a.p_archief === true) d.archief = [...new Set([...(d.archief || []), ik])]; if (!nieuw.length && a.p_archief === false) d.archief = (d.archief || []).filter((x) => x !== ik); bewaar(); } return antw(null); }
    if (naam === 'fout_melden') return antw(null);
    if (naam === 'automaat_laatst') return antw(null);
    // Geen pushmeldingen, geen e-mail, geen uitnodigingen, geen demo-toegangslijst: in de simulatie bestaat geen server
    return antw(null, { message: `demo: '${naam}' bestaat niet in de simulatie (geen server)` });
  };
  const functions = { invoke: (naam) => antw(null, { message: `demo: functie '${naam}' bestaat niet in de simulatie (geen server)` }) };
  window.supabase = { createClient: () => ({ auth, from, rpc, functions }) };

  // ---------- Altijd zichtbaar: dit is een simulatie ----------
  const banner = () => {
    if (document.getElementById('demo-banner')) return;
    const el = document.createElement('div'); el.id = 'demo-banner'; el.setAttribute('role', 'note');
    el.innerHTML = `<b>SIMULATIE</b> · ${STANDEN[STAND]} · fictieve gegevens, geen verbinding met ClubComm
      <span class="demo-knoppen"><a href="?stand=${STAND === 'nu' ? 'knvb' : 'nu'}">Naar ${STANDEN[STAND === 'nu' ? 'knvb' : 'nu']}</a>
      <button type="button" id="demo-wis">Alles wissen</button></span>
      <small>Inloggen: hjo@demo.invalid of trainer@demo.invalid · code 123456</small>`;
    document.body.prepend(el);
    el.querySelector('#demo-wis').addEventListener('click', () => {
      if (!window.confirm('Alle demo-gegevens op dit apparaat wissen (beide standen)?')) return;
      try { localStorage.clear(); sessionStorage.clear(); } catch (e) { /* leeg */ }
      try { if (window.caches) caches.keys().then((ks) => ks.forEach((k) => caches.delete(k))); } catch (e) { /* leeg */ }
      location.href = location.pathname;
    });
  };
  // Het inlogscherm zegt "We hebben een mail gestuurd": in de simulatie gaat er geen mail weg; dat zeggen we eerlijk
  const eerlijk = () => { document.querySelectorAll('#app p').forEach((el) => { if (/We hebben een mail gestuurd|Geen mail binnen/.test(el.textContent) && !el.dataset.demo) { el.dataset.demo = '1'; el.textContent = 'Simulatie: er is geen mail verstuurd. Typ de code 123456.'; } }); };
  const titel = () => { if (!/^SIMULATIE/.test(document.title)) document.title = 'SIMULATIE · ' + document.title; };
  const start = () => { banner(); titel(); const t = document.querySelector('title'); if (t) new MutationObserver(titel).observe(t, { childList: true, characterData: true, subtree: true }); const app = document.getElementById('app'); if (app) new MutationObserver(eerlijk).observe(app, { childList: true, subtree: true }); };
  if (document.body) start(); else document.addEventListener('DOMContentLoaded', start);
})();
