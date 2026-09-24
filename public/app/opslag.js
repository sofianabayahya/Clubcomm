// ClubComm — vertaling tussen de app-gegevens (één object S) en de rijen in de database (tabel "rij").
// Elke rij krijgt een scope en koppelvelden (team, speler, persoon, activiteit); daarop controleert de
// database wie de rij mag lezen en schrijven (supabase/migrations). Werkt in de browser en in Node (tests).
(function (root) {
  const CC = root.CC || (root.CC = {});

  // Lege S met alle verzamelingen die de app kent
  const leeg = () => ({
    v: 8, gen: '', club: {}, teams: [], people: [], players: [], acts: [], afm: [], pres: {}, lang: [], gesprekken: [], msgs: [],
    vervoer: {}, taken: [], aanm: [], beoord: {}, notities: {}, speeltijd: { min: {}, schema: {}, keeper: {} }, wijzigingen: [],
    demo: {}, materiaal: {}, mails: [], trainerLog: [], trainerGesprekken: [], ontwGesprek: [], sigSinds: {}, signaalAfgedaan: [],
    gezienInfo: {}, mijlpaalGezien: {}, autoVerstuurd: {}, beoordGedeeld: {}, beoordGezien: {},
    // voorkomt dat de demo-onderdelen voorbeelddata toevoegen
    beoordDemo: true, hjoHomeDemo: true, hulpDemo: true, vervangDemo: true, live: true,
  });

  // Hulp: team van een speler en van een activiteit
  const index = (S) => {
    const sp = {}, act = {}; S.players.forEach((p) => { sp[p.id] = p.teamId || null; }); S.acts.forEach((a) => { act[a.id] = a.teamId || null; });
    return { teamVanSpeler: (id) => sp[id] || null, teamVanAct: (id) => act[id] || null };
  };

  // Eenvoudige lijsten: [soort, scope, velden(rec) → {team, speler, persoon, act}, id(rec)]
  const LIJSTEN = [
    ['teams', 'club', (r) => ({ team: r.id })],
    ['players', 'kind', (r) => ({ team: r.teamId, speler: r.id })],
    ['acts', 'team', (r) => ({ team: r.teamId, act: r.id })],
    ['afm', 'speler', (r, I) => ({ team: I.teamVanSpeler(r.spelerId), speler: r.spelerId, act: r.actId })],
    ['lang', 'speler', (r, I) => ({ team: I.teamVanSpeler(r.spelerId), speler: r.spelerId })],
    ['gesprekken', 'notitie', (r, I) => ({ team: I.teamVanSpeler(r.spelerId), speler: r.spelerId })],
    ['msgs', 'bericht', () => ({})],
    ['taken', 'team', (r, I) => ({ team: I.teamVanAct(r.actId), act: r.actId })],
    ['aanm', 'aanm', (r) => ({ team: r.teamId })],
    ['wijzigingen', 'teamstaf', (r) => ({ team: r.teamId })],
    ['mails', 'hjo', () => ({})],
    ['trainerLog', 'teamstaf', (r) => ({ team: r.teamId, act: r.actId })],
    ['trainerGesprekken', 'hjo', () => ({})],
    ['ontwGesprek', 'team', (r) => ({ team: r.teamId, speler: r.spelerId || null })],
    ['signaalAfgedaan', 'teamstaf', (r) => ({ team: r.teamId, speler: r.spelerId || null }), (r) => `${r.sleutel}|${r.tijd}`],
  ];
  // Objecten met één rij per sleutel: [soort, pad, scope, velden(sleutel, waarde) ]
  const MAPPEN = [
    ['beoord', 'beoord', 'beoord', (k, v, I) => ({ team: I.teamVanSpeler(k), speler: k })],
    ['notities', 'notities', 'notitie', (k, v, I) => ({ team: I.teamVanSpeler(k), speler: k })],
    ['materiaal', 'materiaal', 'teamstaf', (k) => ({ team: k })],
    ['gezienInfo', 'gezienInfo', 'eigen', (k) => ({ persoon: k })],
    ['mijlpaalGezien', 'mijlpaalGezien', 'eigen', (k) => ({ persoon: k.split('-')[0] })],
    ['beoordGedeeld', 'beoordGedeeld', 'beoord', (k, v, I) => { const s = k.replace(/m\d+$/, ''); return { team: I.teamVanSpeler(s), speler: s }; }],
    ['beoordGezien', 'beoordGezien', 'speler', (k, v, I) => { const s = k.replace(/m\d+$/, ''); return { team: I.teamVanSpeler(s), speler: s }; }],
    ['speeltijdMin', 'speeltijd.min', 'speeltijd', (k, v, I) => ({ team: I.teamVanSpeler(k), speler: k })],
    ['speeltijdKeeper', 'speeltijd.keeper', 'speeltijd', (k, v, I) => ({ team: I.teamVanSpeler(k), speler: k })],
    ['speeltijdSchema', 'speeltijd.schema', 'act', (k, v, I) => ({ team: I.teamVanAct(k), act: k })],
  ];
  // Losse objecten (één rij)
  const ENKEL = [['club', 'club', 'club'], ['sigSinds', 'sigSinds', 'hjo'], ['autoVerstuurd', 'autoVerstuurd', 'hjo']];

  const pad = (S, p) => p.split('.').reduce((o, k) => (o ? o[k] : undefined), S);
  const zetPad = (S, p, v) => { const d = p.split('.'); const last = d.pop(); d.reduce((o, k) => o[k] || (o[k] = {}), S)[last] = v; };
  const inpak = (v) => (v !== null && typeof v === 'object' && !Array.isArray(v) ? v : { __v: v });
  const uitpak = (d) => (d && Object.prototype.hasOwnProperty.call(d, '__v') ? d.__v : d);

  // S → rijen (Map van "soort|id" naar rij)
  CC.naarRijen = (S, club) => {
    const I = index(S); const uit = new Map();
    const zet = (soort, id, scope, v, data) => { if (id == null) return; uit.set(`${soort}|${id}`, { club_id: club, soort, id: String(id), scope, team_id: v.team || null, speler_id: v.speler || null, persoon_id: v.persoon || null, act_id: v.act || null, data }); };
    ENKEL.forEach(([soort, p, scope]) => { const o = pad(S, p); if (o && Object.keys(o).length) zet(soort, soort === 'club' ? 'club' : soort, scope, {}, o); });
    LIJSTEN.forEach(([soort, scope, velden, idf]) => (S[soort] || []).forEach((r) => zet(soort, idf ? idf(r) : r.id, scope, velden(r, I), r)));
    MAPPEN.forEach(([soort, p, scope, velden]) => Object.entries(pad(S, p) || {}).forEach(([k, v]) => zet(soort, k, scope, velden(k, v, I), inpak(v))));
    // Personen: naam en rollen voor iedereen in de club, e-mail en telefoon apart (strengere rechten)
    (S.people || []).forEach((p) => { const { email, tel, ...rest } = p; zet('people', p.id, 'persoon', { persoon: p.id }, rest); zet('contact', p.id, 'contact', { persoon: p.id }, { email: email || '', tel: tel || '' }); });
    // Aanwezigheid: één rij per speler per activiteit (ouders zien alleen hun eigen kind)
    Object.entries(S.pres || {}).forEach(([aid, p]) => {
      const team = I.teamVanAct(aid); const { s, ...kop } = p;
      zet('pres', `${aid}|_`, 'act', { team, act: aid }, kop);
      Object.entries(s || {}).forEach(([sid, w]) => zet('pres', `${aid}|${sid}`, 'act', { team, act: aid, speler: sid }, { v: w }));
    });
    // Vervoer: per aanbieder en per plek een eigen rij, zodat ouders elkaars wijzigingen niet overschrijven
    Object.entries(S.vervoer || {}).forEach(([aid, v]) => {
      const team = I.teamVanAct(aid); const { aanbod, plek, ouderMee, vraag, ...rest } = v;
      zet('vervoer', aid, 'team', { team, act: aid }, rest);
      (aanbod || []).forEach((x) => zet('vervoerAanbod', `${aid}|${x.personId}`, 'team', { team, act: aid, persoon: x.personId }, x));
      Object.entries(vraag || {}).forEach(([sid, x]) => zet('vervoerVraag', `${aid}|${sid}`, 'team', { team, act: aid, speler: sid }, x));
      Object.entries(plek || {}).forEach(([sid, ch]) => zet('vervoerPlek', `${aid}|${sid}`, 'team', { team, act: aid, speler: sid }, { chauffeur: ch, ouderMee: !!(ouderMee || {})[sid] }));
    });
    return uit;
  };

  // rijen → S
  CC.uitRijen = (rijen, vandaag) => {
    const S = leeg(); S.gen = vandaag || '';
    const per = {}; rijen.forEach((r) => { (per[r.soort] || (per[r.soort] = [])).push(r); });
    const lijst = (soort) => per[soort] || [];
    ENKEL.forEach(([soort, p]) => { const r = lijst(soort)[0]; if (r) zetPad(S, p, r.data); });
    LIJSTEN.forEach(([soort]) => { S[soort] = lijst(soort).map((r) => r.data); });
    MAPPEN.forEach(([soort, p]) => { const o = {}; lijst(soort).forEach((r) => { o[r.id] = uitpak(r.data); }); zetPad(S, p, o); });
    const contact = {}; lijst('contact').forEach((r) => { contact[r.id] = r.data; });
    S.people = lijst('people').map((r) => ({ email: '', tel: '', ...r.data, ...(contact[r.id] || {}) }));
    lijst('pres').forEach((r) => { const [aid, sid] = r.id.split('|'); const p = S.pres[aid] || (S.pres[aid] = { s: {} }); if (sid === '_') Object.assign(p, r.data, { s: p.s }); else p.s[sid] = r.data.v; });
    lijst('vervoer').forEach((r) => { S.vervoer[r.id] = { aanbod: [], plek: {}, vraag: {}, ...r.data }; });
    const vv = (aid) => S.vervoer[aid] || (S.vervoer[aid] = { aanbod: [], plek: {}, vraag: {} });
    lijst('vervoerAanbod').forEach((r) => vv(r.id.split('|')[0]).aanbod.push(r.data));
    lijst('vervoerVraag').forEach((r) => { const [aid, sid] = r.id.split('|'); vv(aid).vraag[sid] = r.data; });
    lijst('vervoerPlek').forEach((r) => { const [aid, sid] = r.id.split('|'); const v = vv(aid); v.plek[sid] = r.data.chauffeur; if (r.data.ouderMee) (v.ouderMee || (v.ouderMee = {}))[sid] = true; });
    // Volgorde zoals de app verwacht
    S.acts.sort((a, b) => (a.datum + (a.tijd || '')).localeCompare(b.datum + (b.tijd || '')));
    S.msgs.sort((a, b) => String(a.tijd).localeCompare(String(b.tijd)));
    S.teams.sort((a, b) => a.naam.localeCompare(b.naam, 'nl', { numeric: true }));
    return S;
  };
})(typeof window !== 'undefined' ? window : globalThis);
