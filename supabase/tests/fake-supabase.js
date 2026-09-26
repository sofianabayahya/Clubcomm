// Nagebootste Supabase (alleen voor tests): tabel rij in het geheugen (sessionStorage), OTP-code 123456, geen RLS.
(function () {
  const KEY = 'fake-sb-db';
  const db = JSON.parse(sessionStorage.getItem(KEY) || 'null') || { rows: {}, lid: {}, user: null };
  const bewaar = () => sessionStorage.setItem(KEY, JSON.stringify(db));
  window.__fakeDb = db; window.__fakeBewaar = bewaar;
  if (!Object.keys(db.rows).length) {
    const club = JSON.parse(sessionStorage.getItem('fake-club') || '{}');
    const zet = (r) => { db.rows[`${r.club_id}|${r.soort}|${r.id}`] = r; };
    zet({ club_id: 'dcg', soort: 'club', id: 'club', scope: 'club', data: club });
    zet({ club_id: 'dcg', soort: 'people', id: 'p-beheer', scope: 'persoon', persoon_id: 'p-beheer', data: { id: 'p-beheer', naam: 'Sofian Abayahya', rollen: [{ rol: 'hjo' }, { rol: 'beheerder' }] } });
    zet({ club_id: 'dcg', soort: 'contact', id: 'p-beheer', scope: 'contact', persoon_id: 'p-beheer', data: { email: 'admin@test.nl', tel: '' } });
    bewaar();
  }
  const luisteraars = [];
  const antw = (data, error) => Promise.resolve({ data, error: error || null });
  const auth = {
    getSession: () => antw({ session: db.user ? { user: db.user } : null }),
    signInWithOtp: ({ email }) => { db.pending = email; bewaar(); window.__laatsteMail = email; return antw({}); },
    verifyOtp: ({ email, token }) => { if (token !== '123456') return antw(null, { message: 'invalid' }); db.user = { id: 'u-' + email, email }; bewaar(); luisteraars.forEach((f) => f('SIGNED_IN')); return antw({ user: db.user }); },
    signOut: () => { db.user = null; bewaar(); luisteraars.forEach((f) => f('SIGNED_OUT')); return antw({}); },
    onAuthStateChange: (f) => { luisteraars.push(f); return { data: { subscription: { unsubscribe() {} } } }; },
  };
  const from = () => {
    const q = { filters: [], range: null, op: 'select', payload: null };
    const b = {
      select() { return b; }, order() { return b; },
      eq(k, v) { q.filters.push((r) => r[k] === v); return b; },
      in(k, vs) { q.filters.push((r) => vs.includes(r[k])); return b; },
      range(a, z) { q.range = [a, z]; return b; },
      upsert(rows) { q.op = 'upsert'; q.payload = Array.isArray(rows) ? rows : [rows]; return b; },
      delete() { q.op = 'delete'; return b; },
      then(ok, fail) {
        let res;
        if (q.op === 'upsert') { q.payload.forEach((r) => { db.rows[`${r.club_id}|${r.soort}|${r.id}`] = JSON.parse(JSON.stringify(r)); }); bewaar(); res = { data: null, error: null }; }
        else if (q.op === 'delete') { Object.entries(db.rows).forEach(([k, r]) => { if (q.filters.every((f) => f(r))) delete db.rows[k]; }); bewaar(); res = { data: null, error: null }; }
        else { let rs = Object.values(db.rows).filter((r) => q.filters.every((f) => f(r))); rs.sort((x, y) => (x.soort + x.id).localeCompare(y.soort + y.id)); if (q.range) rs = rs.slice(q.range[0], q.range[1] + 1); res = { data: JSON.parse(JSON.stringify(rs)), error: null }; }
        return Promise.resolve(res).then(ok, fail);
      },
    };
    return b;
  };
  const ik = () => db.user && db.lid[db.user.id];
  const rpc = (naam, a) => {
    if (naam === 'koppel_mij') {
      if (!db.user) return antw([]);
      if (!db.lid[db.user.id]) { const c = Object.values(db.rows).find((r) => r.soort === 'contact' && (r.data.email || '').toLowerCase() === db.user.email.toLowerCase() && !Object.values(db.lid).includes(r.persoon_id)); if (c) { db.lid[db.user.id] = c.persoon_id; bewaar(); } }
      return antw(db.lid[db.user.id] ? [{ club_id: 'dcg', persoon_id: db.lid[db.user.id] }] : []);
    }
    if (naam === 'uitnodiging_info') { const t = db.rows[`dcg|teams|${a.p_team}`]; const c = db.rows['dcg|club|club']; return antw({ club: c && c.data.naam, team: t && t.data.naam }); }
    if (naam === 'aanmelden') { const id = 'm' + Date.now(); db.rows[`dcg|aanm|${id}`] = { club_id: 'dcg', soort: 'aanm', id, scope: 'aanm', team_id: a.p_team, data: { id, teamId: a.p_team, email: db.user.email, ouderNaam: a.p_ouder, kindVoor: a.p_voor, kindAchter: a.p_achter, tel: (a.p_tel || '').replace(/[^0-9+]/g, ''), tijd: new Date().toISOString(), status: 'open' } }; bewaar(); return antw(id); }
    if (naam === 'bericht_bij') { const r = db.rows[`dcg|msgs|${a.p_id}`]; if (r) { const d = r.data; const nieuw = (a.p_antw || []).filter((x) => x.van === ik());
      d.antw = [...(d.antw || []), ...nieuw];
      if (nieuw.length) { d.gelezen = [ik()]; d.archief = []; } else if (a.p_gelezen && !d.gelezen.includes(ik())) d.gelezen.push(ik());
      if (!nieuw.length && a.p_archief === true) d.archief = [...new Set([...(d.archief || []), ik()])];
      if (!nieuw.length && a.p_archief === false) d.archief = (d.archief || []).filter((x) => x !== ik());
      bewaar(); } return antw(null); }
    if (naam === 'club_vullen') { a.p_rijen.forEach((r) => { if (r.soort === 'club' || (['people', 'contact'].includes(r.soort) && r.id === ik())) return; db.rows[`dcg|${r.soort}|${r.id}`] = { ...r, club_id: 'dcg' }; }); bewaar(); return antw(a.p_rijen.length); }
    if (naam === 'club_leegmaken') { let n = 0; Object.entries(db.rows).forEach(([k, r]) => { if (r.soort !== 'club' && !(['people', 'contact'].includes(r.soort) && r.id === ik())) { delete db.rows[k]; n++; } }); bewaar(); return antw(n); }
    if (naam === 'fout_melden') { (db.fouten = db.fouten || []).push(a.p_bericht); bewaar(); return antw(null); }
    if (naam === 'fouten_lijst') return antw((db.fouten || []).map((b) => ({ bericht: b, aantal: 1, tijd: new Date().toISOString() })));
    // Pushmeldingen (Besluit 53)
    if (naam === 'push_sleutel') return antw('BCVpzPwah6lIdVl0Iq-lNMovdQzhApVaNWu8EzOUtSOHot_OhnsSGGKbNlFuRGaPfXKNSQQBNoOBTgurba4HlFo');
    if (naam === 'push_aan') { db.push = db.push || {}; db.push[a.p_endpoint] = { persoon: db.lid[db.user && db.user.id], voorkeur: a.p_voorkeur, toestel: a.p_toestel }; bewaar(); return antw(true); }
    if (naam === 'push_uit') { if (db.push) delete db.push[a.p_endpoint]; bewaar(); return antw(true); }
    return antw(null, { message: 'onbekende rpc ' + naam });
  };
  window.supabase = { createClient: () => ({ auth, from, rpc }) };
})();
