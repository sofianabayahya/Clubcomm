// ClubComm prototype — Besluit 26: Home van HJO en coördinator = "Te doen" en "Ter informatie".
// Spelerzaken lopen eerst via de coördinator (of de HJO als een team geen coördinator heeft).
// De HJO ziet ze pas als ze blijven liggen; echt ernstige zaken ziet hij wel, ter informatie.
(function () {
  const CC = window.CC; const D = CC.date, M = CC.m, h = CC.h, icon = CC.icon, esc = CC.esc;

  const inst = (S) => { const i = S.club.inst; if (i.liggenDagen == null) i.liggenDagen = 14; if (i.ernstig == null) i.ernstig = 50; return i; };
  // Wie volgt de spelers van dit team op (na trainer en teamleider)? De coördinator, anders de HJO.
  const eersteLijn = (S, tid, rol) => rol === 'coordinator' || (rol === 'hjo' && !CC.coordinatorVoor(S, tid));

  // Sinds wanneer staat een signaal open? (voor "blijft liggen")
  const sinds = (S, sig, teamIds) => {
    const z = S.sigSinds || (S.sigSinds = {}); const nu = new Date().toISOString(); const actief = new Set(sig.map((s) => s.sleutel));
    sig.forEach((s) => { if (!z[s.sleutel]) z[s.sleutel] = nu; });
    Object.keys(z).forEach((k) => { if (teamIds.includes(k.split('|')[1]) && !actief.has(k)) delete z[k]; });
    return z;
  };
  const opgepakt = (S, s, vanaf) => S.gesprekken.some((g) => g.spelerId === s.spelerId && g.datum >= vanaf.slice(0, 10));
  const dagenOpen = (iso) => Math.floor((Date.now() - new Date(iso)) / 864e5);

  // "Gezien": een informatieregel verdwijnt tot er iets verandert
  const gezien = (S) => { const me = CC.me(); const g = S.gezienInfo || (S.gezienInfo = {}); return g[me.id] || (g[me.id] = {}); };
  // Ter informatie: geen "Gezien"-knop meer; een regel verdwijnt vanzelf als het is opgelost (Besluit 34)
  const infoRij = (S, key, hash, rij) => rij;
  CC.on('infoGezien', (el) => { const S = CC.S(); gezien(S)[el.dataset.key] = el.dataset.hash; CC.save(); CC.render(); });

  const perTeam = (lijst) => { const t = {}; lijst.forEach((s) => { t[s.teamId] = (t[s.teamId] || 0) + 1; }); return Object.entries(t).sort((a, b) => b[1] - a[1]).map(([tid, n]) => `${esc(CC.tn(tid))} (${n})`).join(', '); };

  CC.hjoOverzicht = (S) => {
    const rol = CC.rol().rol; const i = inst(S); const tids = S.teams.map((t) => t.id);
    const sig = M.signalen(S, tids, true); const z = sinds(S, sig, tids);
    const eigen = (s) => eersteLijn(S, s.teamId, rol);
    const groep = (soort, f = () => true) => sig.filter((s) => s.soort === soort && f(s));
    const rood = groep('speler', (s) => s.niveau === 'rood');
    // Blijft liggen: rood of opschaling, langer dan X dagen open zonder vastgelegd contact, in een team van de coördinator
    const liggen = rol === 'hjo' ? sig.filter((s) => M.STAPPEN.includes(s.soort) && !eigen(s) && dagenOpen(z[s.sleutel]) >= i.liggenDagen && !opgepakt(S, s, z[s.sleutel])) : [];
    const ernstig = rol === 'hjo' ? rood.filter((s) => !eigen(s) && Number((s.tekst.match(/: (\d+)%/) || [])[1]) < i.ernstig) : [];
    return { sig, z, eigen, groep, rood, liggen, ernstig, rol, i };
  };

  // ---------- Besluit 95, stap 2: Home van de HO (voetballijn) ----------
  // De HO is mentor: op Home alleen wat over zijn trainers gaat. Organisatie alleen voor teams zonder coördinator (terugval),
  // in een eigen blok eronder. Ontworpen voor 50 teams: alles gebundeld, nooit een lange lijst (principe 10).
  const BUNDEL = 3; // vanaf zoveel regels van dezelfde soort: één regel met een teller
  const trainersVan = (S, tid) => S.people.filter((p) => p.rollen.some((r) => r.rol === 'trainer' && r.teamId === tid));
  const trainerSig = (S) => (CC.trainerSignalen ? CC.trainerSignalen(S) : []).filter((s) => s.p.rollen.some((r) => r.rol === 'trainer' && S.teams.some((t) => t.id === r.teamId) && CC.mag('trainersVolgen', null, r.teamId)));
  // Besluit 97: focus = welke bouwen je wilt zien (onthouden op deze telefoon); signalen volgen het werkgebied, niet de focus
  const FOCUS = 'clubcomm-focus';
  const focus = (S) => { if (!CC.ui.seg.hoFocus) { try { CC.ui.seg.hoFocus = localStorage.getItem(FOCUS) || 'alle'; } catch (e) { CC.ui.seg.hoFocus = 'alle'; } }
    const f = CC.ui.seg.hoFocus; try { localStorage.setItem(FOCUS, f); } catch (e) { /* */ }
    const w = CC.werkgebied(S); return CC.bouwenMetTeams(S).some((b) => b.naam === f && (!w || w.has(b.naam))) ? f : 'alle'; };
  const inFocus = (S, f, tid) => CC.inWerkgebied(S, tid) && (f === 'alle' || CC.bouwVan(S, M.team(S, tid) || { id: tid }).naam === f);
  const focusChips = (S, f) => { const w = CC.werkgebied(S); const bw = CC.bouwenMetTeams(S).filter((b) => !w || w.has(b.naam)); if (bw.length < 2) return '';
    return `<div class="chips scroll">${[['alle', 'Alles'], ...bw.map((b) => [b.naam, b.naam])].map(([k, l]) => `<button class="chipknop ${k === f ? 'aan' : ''}" data-act="seg" data-key="hoFocus" data-val="${esc(k)}">${esc(l)}</button>`).join('')}</div>`; };
  CC.hoFocus = { focus: (S) => focus(S), inFocus: (S, f, tid) => inFocus(S, f, tid), chips: (S, f) => focusChips(S, f) };
  const weekActs = (S) => { const v = D.vandaag(); const t = D.addDays(v, 6); return S.teams.flatMap((x) => M.acts(S, x.id, v, t)).filter((a) => !a.afgelast).sort((a, b) => (a.datum + a.tijd).localeCompare(b.datum + b.tijd)); };

  const hoHome = (S) => {
    const O = CC.hjoOverzicht(S); const { i, eigen, groep } = O; const L = S.club.labels;
    const per = M.periode(S, 'blok'); const stats = S.teams.map((t) => M.teamStats(S, t.id, per));
    const tot = stats.reduce((s, x) => s + x.spelers.reduce((a, y) => a + y.st.totaal, 0), 0);
    const aan = stats.reduce((s, x) => s + x.spelers.reduce((a, y) => a + y.st.aanwezig, 0), 0);
    // Te doen: alleen de trainers en jouw eigen stap (clubbesluit); spelerzaken die bij de coördinator blijven liggen gebundeld
    const doen = []; const f = focus(S);
    const tsAlle = trainerSig(S).filter((x) => CC.inWerkgebied(S, (x.p.rollen.find((r) => r.rol === 'trainer') || {}).teamId)); const teamVanTr = (x) => (x.p.rollen.find((r) => r.rol === 'trainer') || {}).teamId;
    const ts = tsAlle.filter((x) => inFocus(S, f, teamVanTr(x))); const buiten = tsAlle.length - ts.length;
    if (ts.length >= BUNDEL) doen.push(h.rij({ ic: 'user-cog', titel: `${ts.length} trainers vragen aandacht`, sub: ts.slice(0, 3).map((x) => esc(x.p.naam)).join(', ') + (ts.length > 3 ? '…' : ''), kleur: 'oranje', act: 'open', attrs: 'data-view="trainersRapport" data-filter="aandacht"' }));
    else doen.push(...ts.map((x) => h.rij({ ic: 'user-cog', titel: esc(x.tekst), sub: esc(x.sub), kleur: 'oranje', act: 'open', attrs: `data-view="trainerDetail" data-id="${x.p.id}"` })));
    if (buiten) doen.push(h.rij({ ic: 'filter', titel: `${buiten} ${buiten === 1 ? 'signaal' : 'signalen'} buiten je focus`, sub: 'Trainers in een andere bouw', act: 'open', attrs: 'data-view="trainersRapport" data-filter="aandacht" data-alle="1"' }));
    if (CC.geenAanwRijen) doen.push(...CC.geenAanwRijen(S, S.teams.filter((t) => inFocus(S, f, t.id)).map((t) => t.id)));
    groep('clubbesluit').filter((s) => CC.mag('clubbesluit', null, s.teamId)).forEach((s) => doen.push(CC.stapRij(S, s)));
    if (O.liggen.length) doen.push(h.rij({ ic: 'hourglass', titel: `${O.liggen.length} ${O.liggen.length === 1 ? 'spelerzaak blijft' : 'spelerzaken blijven'} liggen`, sub: `Langer dan ${i.liggenDagen} dagen zonder vastgelegd contact · ${esc(L.coordinator.toLowerCase())}`, kleur: 'oranje', act: 'open', attrs: 'data-view="signalen" data-soort="liggen"' }));
    // Deze week: wanneer kun je gaan kijken? Eén regel per dag
    const acts = weekActs(S).filter((a) => inFocus(S, f, a.teamId)); const dagen = [...new Set(acts.map((a) => a.datum))];
    const dagRij = (d) => { const op = acts.filter((a) => a.datum === d); const w = op.filter((a) => M.isWed(a)); const tr = op.filter((a) => a.soort === 'training');
      const delen = [w.length && `${w.length} ${w.length === 1 ? 'wedstrijd' : 'wedstrijden'}${w.some((a) => a.thuis) ? ` (${w.filter((a) => a.thuis).length} thuis)` : ''}`, tr.length && `${tr.length} ${tr.length === 1 ? 'training' : 'trainingen'}`, (op.length - w.length - tr.length) && `${op.length - w.length - tr.length} anders`].filter(Boolean);
      return h.rij({ ic: 'calendar-days', titel: `${D.relatief(d)}`, sub: delen.join(' · ') + (f !== 'alle' ? ` · ${esc(f.toLowerCase())}` : ''), act: 'open', attrs: `data-view="weekHO" data-dag="${d}"` }); };
    const bw = CC.begelWeek ? CC.begelWeek(S) : [];
    // Rapporten: zelf opzoeken
    const nTr = new Set(S.teams.flatMap((t) => trainersVan(S, t.id).map((p) => p.id))).size;
    // Organisatie: alleen voor teams zonder coördinator (de HO is daar de terugval)
    const eigenTeams = S.teams.filter((t) => eersteLijn(S, t.id, 'hjo'));
    const org = [];
    if (eigenTeams.length) {
      if (CC.vervangerRijen) org.push(...CC.mijnVervangingen(S), ...CC.vervangerRijen(S, eigenTeams.map((t) => t.id)));
      if (CC.autoBerichtRijen && CC.mag('clubbericht', 'hjo')) org.push(...CC.autoBerichtRijen(S));
      { const w = CC.wachtRij && CC.wachtRij(); if (w) org.push(w); }
      const gesprek = groep('gesprekHjo', eigen).filter((s) => CC.mag('gesprek', null, s.teamId));
      if (gesprek.length >= BUNDEL) org.push(h.rij({ ic: 'users', titel: `${gesprek.length} gesprekken met ouders`, sub: 'Stap 4 · teams zonder ' + esc(L.coordinator.toLowerCase()), kleur: 'rood', act: 'open', attrs: 'data-view="signalen" data-soort="gesprekHjo"' }));
      else gesprek.forEach((s) => org.push(CC.stapRij(S, s)));
      const bel = groep('bellen', eigen).filter((s) => CC.mag('bellen', null, s.teamId) && !CC.mag('bellen', 'trainer') && !CC.mag('bellen', 'teamleider'));
      if (bel.length) org.push(h.rij({ ic: 'phone', titel: `${bel.length} ${bel.length === 1 ? 'ouder' : 'ouders'} bellen of appen`, sub: `Drempel bereikt · ${perTeam(bel)}`, kleur: 'rood', act: 'open', attrs: 'data-view="signalen" data-soort="bellen"' }));
      const zonderStaf = CC.mag('staf') ? eigenTeams.filter((t) => !t.trainerId || !t.teamleiderId) : [];
      if (zonderStaf.length) org.push(h.rij({ ic: 'user-cog', titel: zonderStaf.length === 1 ? `${esc(zonderStaf[0].naam)} zonder ${!zonderStaf[0].trainerId ? 'trainer' : 'teamleider'}` : `${zonderStaf.length} teams zonder complete staf`, sub: zonderStaf.slice(0, 4).map((t) => esc(t.naam)).join(', ') + (zonderStaf.length > 4 ? '…' : ''), kleur: 'oranje', act: 'open', attrs: 'data-view="zonderStaf"' }));
      const laat = S.aanm.filter((x) => x.status === 'open' && Date.now() - new Date(x.tijd) > 48 * 3600e3 && eigenTeams.some((t) => t.id === x.teamId) && CC.mag('aanmeldingen48', null, x.teamId));
      if (laat.length) org.push(h.rij({ ic: 'hourglass', titel: `${laat.length} aanmelding${laat.length > 1 ? 'en' : ''} langer dan 48 uur open`, sub: laat.slice(0, 3).map((x) => `${esc(x.kindVoor)} (${esc(CC.tn(x.teamId))})`).join(', ') + (laat.length > 3 ? '…' : ''), kleur: 'oranje', act: 'open', attrs: 'data-view="aanmeldingenHjo"' }));
      const af = M.afgedaanRecent(S, eigenTeams.map((t) => t.id), 14).filter((x) => !x.akkoord);
      if (af.length) org.push(h.rij({ ic: 'check', titel: `${af.length} ${af.length === 1 ? 'signaal' : 'signalen'} afgedaan als "geen actie nodig"`, sub: 'Akkoord, of toch oppakken?', act: 'open', attrs: 'data-view="afgedaan"' }));
      const mat = CC.materiaalAandacht && CC.materiaalAandacht(S); if (mat) org.push(mat);
      if (CC.vogRijen && CC.mag('staf')) org.push(...CC.vogRijen(S, eigenTeams.map((t) => t.id)));
    }
    return `${focusChips(S, f)}<div class="clubregel"><span><b>${S.teams.length}</b> ${S.teams.length === 1 ? 'team' : 'teams'}</span><span><b>${nTr}</b> ${nTr === 1 ? 'trainer' : 'trainers'}</span><span><b>${tot ? Math.round((100 * aan) / tot) : '–'}%</b> aanwezig</span></div>
      ${h.sectie(`Te doen${doen.length ? ` (${doen.length})` : ''}`)}${doen.length ? `<div class="lijst">${doen.join('')}</div>` : h.leeg('Je trainers vragen nu geen aandacht 👍', 'circle-check')}
      ${h.sectie('Deze week')}${bw.length ? `<div class="lijst compact">${bw.join('')}</div>` : ''}${dagen.length ? `<div class="lijst compact">${dagen.map(dagRij).join('')}</div><p class="zacht klein">Wanneer kun je gaan kijken? Tik op een dag.</p>` : '<p class="zacht klein">Geen trainingen of wedstrijden de komende 7 dagen.</p>'}
      ${h.sectie('Rapporten')}<div class="lijst compact">
        ${h.rij({ ic: 'user-check', titel: 'Trainers', sub: `${nTr === 1 ? '1 trainer' : `${nTr} trainers`} per bouw en team: afmeldingen, aanwezigheid van het team${ts.length ? ` · ${ts.length} ${ts.length === 1 ? 'vraagt' : 'vragen'} aandacht` : ''}`, act: 'open', attrs: 'data-view="trainersRapport"' })}
        ${h.rij({ ic: 'chart-column', titel: 'Teams', sub: 'Aanwezigheid, redenen en verloop per team', act: 'tab', attrs: 'data-tab="inzicht"' })}</div>
      ${org.length ? `${h.sectie(`Organisatie · ${eigenTeams.length === S.teams.length ? 'je club heeft geen ' + esc(L.coordinator.toLowerCase()) : `${eigenTeams.length} teams zonder ${esc(L.coordinator.toLowerCase())}`}`)}<p class="zacht klein">Dit doe je omdat er voor deze teams geen ${esc(L.coordinator.toLowerCase())} is.</p><div class="lijst">${org.join('')}</div>` : ''}`;
  };

  // Rapport Trainers: per bouw en team, in- en uitklapbaar (Besluit 95, 97). Open: alleen waar iets speelt.
  CC.views.trainersRapport = (S, p) => {
    if (p.alle) { CC.ui.seg.hoFocus = 'alle'; delete p.alle; }
    const filter = h.segVal('trRap', p.filter || 'alle'); const sig = new Set(trainerSig(S).map((x) => x.p.id)); const f = focus(S);
    const regel = (tr) => { const t = CC.trainerTelling ? CC.trainerTelling(S, tr.id) : null; if (!t) return '';
      const delen = [t.afmeldingen && `${t.afmeldingen}× afgemeld`, t.telaat && `${t.telaat}× te laat`, t.niet && `${t.niet}× niet gekomen`, t.afgelast && `${t.afgelast} afgelast`].filter(Boolean);
      return delen.length ? delen.join(' · ') : 'geen afmeldingen dit seizoen'; };
    const per = M.periode(S, 'blok');
    const wg = CC.werkgebied(S); const bouwen = CC.bouwenMetTeams(S).filter((b) => (f === 'alle' || b.naam === f) && (!wg || wg.has(b.naam)));
    const extra = (tr) => (CC.trainerExtra ? CC.trainerExtra(S, tr) : '');
    const blokken = bouwen.map((b) => {
      const teams = b.teams.slice().sort((x, y) => x.naam.localeCompare(y.naam, 'nl', { numeric: true }));
      const rijen = teams.map((t) => { const trs = trainersVan(S, t.id); const pct = M.teamStats(S, t.id, per).pct; const z = M.zone(S, pct, t.id); const let_ = trs.some((x) => sig.has(x.id));
        if (filter === 'aandacht' && !let_) return '';
        return trs.length ? trs.filter((tr) => !p.zoek || tr.naam.toLowerCase().includes(p.zoek) || t.naam.toLowerCase().includes(p.zoek)).map((tr) => h.rij({ ic: h.stip(z), titel: `${esc(t.naam)} · ${esc(tr.naam)}${CC.trainerVolgt && CC.trainerVolgt(S, tr.id) ? ' ★' : ''}`, sub: `${regel(tr)} · team ${pct ?? '–'}%${extra(tr)}`, kleur: sig.has(tr.id) ? 'oranje' : '', act: 'open', attrs: `data-view="trainerDetail" data-id="${tr.id}"` })).join('')
          : h.rij({ ic: h.stip(z), titel: `${esc(t.naam)} · geen trainer`, sub: `team ${pct ?? '–'}%`, kleur: 'oranje' }); }).join('');
      if (!rijen) return '';
      const n = teams.filter((t) => trainersVan(S, t.id).some((x) => sig.has(x.id))).length;
      const nTr = new Set(teams.flatMap((t) => trainersVan(S, t.id).map((x) => x.id))).size;
      const pcts = teams.map((t) => M.teamStats(S, t.id, per).pct).filter((x) => x != null); const gem = pcts.length ? Math.round(pcts.reduce((a, c) => a + c, 0) / pcts.length) : null;
      return `<details class="uitklap" ${n || filter === 'aandacht' || bouwen.length === 1 ? 'open' : ''}><summary><b>${esc(b.naam)}</b> <small class="zacht">${teams.length} ${teams.length === 1 ? 'team' : 'teams'} · ${nTr} ${nTr === 1 ? 'trainer' : 'trainers'}${gem != null ? ` · ${gem}%` : ''}${n ? ` · ${n} ${n === 1 ? 'vraagt' : 'vragen'} aandacht` : ''}</small></summary><div class="lijst compact">${rijen}</div></details>`;
    }).join('');
    const gevolgd = CC.trainerVolgt ? S.people.filter((x) => CC.trainerVolgt(S, x.id) && x.rollen.some((r) => r.rol === 'trainer' && S.teams.some((t) => t.id === r.teamId && inFocus(S, f, t.id)))) : [];
    const volgBlok = gevolgd.length && filter !== 'aandacht' ? `<details class="uitklap" open><summary><b>★ Gevolgd</b> <small class="zacht">${gevolgd.length}</small></summary><div class="lijst compact">${gevolgd.map((tr) => h.rij({ ic: 'star', titel: esc(tr.naam), sub: `${esc((tr.rollen.filter((r) => r.rol === 'trainer').map((r) => CC.tn(r.teamId))).join(', '))} · ${regel(tr)}${extra(tr)}`, act: 'open', attrs: `data-view="trainerDetail" data-id="${tr.id}"` })).join('')}</div></details>` : '';
    if (p.alleenHtml) return { html: `${volgBlok}${blokken}` || h.leeg('Geen trainers gevonden') };
    return { titel: 'Rapport trainers', html: `${focusChips(S, f)}${h.seg('trRap', [['alle', 'Alle trainers'], ['aandacht', `Vraagt aandacht (${sig.size})`]], filter)}${volgBlok}
      <p class="zacht klein">Per bouw en team: afmeldingen van de trainer dit seizoen en de aanwezigheid van het team (${esc(h.faseLabel(S))}). Tik op een trainer voor de geschiedenis en om contact vast te leggen.</p>
      ${blokken || h.leeg(filter === 'aandacht' ? 'Geen trainers die aandacht vragen 👍' : 'Nog geen trainers', 'circle-check')}` };
  };

  // Deze week: per dag welke teams trainen of spelen, met de trainer (om te gaan kijken)
  CC.views.weekHO = (S, p) => {
    const f = focus(S); const acts = weekActs(S).filter((a) => a.datum === p.dag && inFocus(S, f, a.teamId));
    const rij = (a) => { const t = M.team(S, a.teamId); const tr = trainersVan(S, a.teamId).map((x) => x.naam).join(', ');
      const wat = M.isWed(a) ? `${a.soort === 'oefen' ? 'Oefenwedstrijd' : 'Wedstrijd'} ${a.thuis === false ? 'uit' : 'thuis'}${a.tegen ? ` tegen ${esc(a.tegen)}` : ''}` : a.soort === 'training' ? `Training${a.veld ? ` · ${esc(a.veld)}` : ''}` : esc(a.naam || 'Activiteit');
      return h.rij({ ic: M.isWed(a) ? 'trophy' : 'dumbbell', titel: `${esc(a.tijd)} · ${esc(t ? t.naam : a.teamId)}`, sub: `${wat}${tr ? ` · ${esc(tr)}` : ''}`, chevron: false }); };
    const wed = acts.filter((a) => M.isWed(a)); const rest = acts.filter((a) => !M.isWed(a));
    const thuis = wed.filter((a) => a.thuis !== false); const uit = wed.filter((a) => a.thuis === false);
    return { titel: D.relatief(p.dag), html: `${thuis.length ? `${h.sectie(`Thuiswedstrijden (${thuis.length})`)}<div class="lijst compact">${thuis.map(rij).join('')}</div>` : ''}
      ${uit.length ? `<details class="uitklap" ${thuis.length ? '' : 'open'}><summary><b>Uitwedstrijden</b> <small class="zacht">${uit.length}</small></summary><div class="lijst compact">${uit.map(rij).join('')}</div></details>` : ''}
      ${rest.length ? `<details class="uitklap" ${wed.length ? '' : 'open'}><summary><b>Trainingen en activiteiten</b> <small class="zacht">${rest.length}</small></summary><div class="lijst compact">${rest.map(rij).join('')}</div></details>` : ''}
      ${acts.length ? '' : h.leeg('Niets gepland')}` };
  };

  CC.rollen.hjo.schermen.home = (S) => {
    if (CC.rol().rol === 'hjo') return hoHome(S);
    const O = CC.hjoOverzicht(S); const { rol, i, eigen, groep } = O; const L = S.club.labels;
    const per = M.periode(S, 'blok');
    const stats = S.teams.map((t) => M.teamStats(S, t.id, per));
    const tot = stats.reduce((s, x) => s + x.spelers.reduce((a, y) => a + y.st.totaal, 0), 0);
    const aan = stats.reduce((s, x) => s + x.spelers.reduce((a, y) => a + y.st.aanwezig, 0), 0);
    const doen = []; const info = []; const verborgen = { n: 0 };

    // ---- Te doen ----
    if (CC.vervangerRijen) doen.push(...CC.mijnVervangingen(S), ...CC.vervangerRijen(S, S.teams.map((t) => t.id)));
    if (CC.autoBerichtRijen) doen.push(...CC.autoBerichtRijen(S));
    { const w = CC.wachtRij && CC.wachtRij(); if (w) doen.push(w); }
    const gesprek = [...groep('clubbesluit'), ...groep('gesprekHjo')];
    const magG = (s) => CC.mag(s.soort === 'clubbesluit' ? 'clubbesluit' : 'gesprek', null, s.teamId);
    gesprek.filter(magG).forEach((s) => doen.push(CC.stapRij(S, s)));
    const bellen = groep('bellen'); // Bellen is eerst van de trainer/teamleider als die de taak hebben; dan is het voor jou ter informatie
    const belEigen = bellen.filter((s) => CC.mag('bellen', null, s.teamId) && eigen(s) && !CC.mag('bellen', 'trainer') && !CC.mag('bellen', 'teamleider'));
    if (belEigen.length) doen.push(h.rij({ ic: 'phone', titel: `${belEigen.length} ${belEigen.length === 1 ? 'ouder' : 'ouders'} bellen of appen`, sub: `Drempel bereikt · ${perTeam(belEigen)}`, kleur: 'rood', act: 'open', attrs: 'data-view="signalen" data-soort="bellen"' }));
    // Losse spelers (rode zone, patronen, langdurig) staan niet op Home: dat volgt de trainer. Zichtbaar bij Inzicht en per team (Besluit 34).
    O.liggen.forEach((s) => doen.push(h.rij({ ic: 'hourglass', titel: `Blijft liggen: ${esc(s.tekst.split(':')[0])} (${esc(CC.tn(s.teamId))})`, sub: `${dagenOpen(O.z[s.sleutel])} dagen open, nog geen contact vastgelegd · ${esc(L.coordinator.toLowerCase())}: ${esc((CC.coordinatorVoor(S, s.teamId) || { naam: '–' }).naam)}`, kleur: 'rood', act: 'open', attrs: `data-view="speler" data-id="${s.spelerId}"` })));
    const zonderStaf = CC.mag('staf') ? S.teams.filter((t) => !t.trainerId || !t.teamleiderId) : [];
    if (zonderStaf.length) doen.push(h.rij({ ic: 'user-cog', titel: zonderStaf.length === 1 ? `${esc(zonderStaf[0].naam)} zonder ${!zonderStaf[0].trainerId ? 'trainer' : 'teamleider'}` : `${zonderStaf.length} teams zonder complete staf`, sub: zonderStaf.map((t) => `${esc(t.naam)} (${!t.trainerId && !t.teamleiderId ? 'trainer + teamleider' : !t.trainerId ? 'trainer' : 'teamleider'})`).join(', '), kleur: 'oranje', act: 'open', attrs: zonderStaf.length === 1 ? `data-view="team" data-team="${zonderStaf[0].id}"` : 'data-view="zonderStaf"' }));
    const laat = S.aanm.filter((x) => x.status === 'open' && Date.now() - new Date(x.tijd) > 48 * 3600e3 && S.teams.some((t) => t.id === x.teamId) && CC.mag('aanmeldingen48', null, x.teamId));
    if (laat.length) doen.push(h.rij({ ic: 'hourglass', titel: `${laat.length} aanmelding${laat.length > 1 ? 'en' : ''} langer dan 48 uur open`, sub: laat.map((x) => `${esc(x.kindVoor)} (${esc(CC.tn(x.teamId))})`).join(', '), kleur: 'oranje', act: 'open', attrs: 'data-view="aanmeldingenHjo"' }));
    if (CC.trainerAandacht) doen.push(...CC.trainerAandacht(S));
    if (CC.geenAanwRijen) doen.push(...CC.geenAanwRijen(S, S.teams.map((t) => t.id)));
    if (CC.vogRijen && CC.mag('staf')) doen.push(...CC.vogRijen(S, S.teams.map((t) => t.id)));

    // ---- Ter informatie ----
    const teams = groep('team');
    if (teams.length) { const r = teams.filter((s) => s.niveau === 'rood').length; info.push(infoRij(S, 'teams', teams.map((s) => s.teamId + s.niveau).join(), h.rij({ ic: 'shield', titel: `${teams.length} ${teams.length === 1 ? 'team' : 'teams'} in de ${r ? 'rode' : 'oranje'}${r && r < teams.length ? ' of oranje' : ''} zone`, sub: teams.map((s) => esc(s.tekst.split(':')[0]) + ' ' + s.tekst.match(/\d+%/)[0]).join(', '), kleur: r ? 'rood' : 'oranje', act: 'tab', attrs: 'data-tab="inzicht"' }), verborgen)); }
    const mat = CC.materiaalAandacht && CC.materiaalAandacht(S); if (mat) info.push(infoRij(S, 'materiaal', mat.replace(/<[^>]+>/g, '').slice(0, 80), mat, verborgen));
    const af = M.afgedaanRecent(S, S.teams.filter((t) => eersteLijn(S, t.id, rol)).map((t) => t.id), 14).filter((x) => !x.akkoord);
    if (af.length) info.push(h.rij({ ic: 'check', titel: `${af.length} ${af.length === 1 ? 'signaal' : 'signalen'} afgedaan als "geen actie nodig"`, sub: 'Door trainers en teamleiders. Akkoord, of toch oppakken?', act: 'open', attrs: 'data-view="afgedaan"' }));
    const wijz = S.wijzigingen.filter((w) => Date.now() - new Date(w.tijd) < 7 * 864e5 && (!w.teamId || S.teams.some((t) => t.id === w.teamId)));
    if (wijz.length) info.push(infoRij(S, 'wijz', wijz.map((w) => w.tijd).join(), h.rij({ ic: 'calendar-days', titel: `${wijz.length} planningswijziging${wijz.length > 1 ? 'en' : ''} door trainers`, sub: 'Je hoeft niets te doen', act: 'tab', attrs: 'data-tab="planning"' }), verborgen));

    const infoHtml = info.filter(Boolean);
    return `<div class="clubregel"><span><b>${S.teams.length}</b> teams</span><span><b>${S.players.filter((p) => p.teamId && S.teams.some((t) => t.id === p.teamId)).length}</b> spelers</span><span><b>${tot ? Math.round((100 * aan) / tot) : '–'}%</b> aanwezig</span></div>
      ${h.sectie(`Te doen${doen.length ? ` (${doen.length})` : ''}`)}${doen.length ? `<div class="lijst">${doen.join('')}</div>` : h.leeg('Niets te doen 👍', 'circle-check')}
      ${h.sectie('Ter informatie')}<p class="zacht klein">Om op de hoogte te zijn; je hoeft er niets mee. Het verdwijnt vanzelf als het is opgelost. Losse spelers volgt de trainer${S.club.coordinatorAan ? ` en daarna de ${esc(L.coordinator.toLowerCase())}` : ''}; je ziet ze hier pas als het jouw stap is of als het ${i.liggenDagen} dagen blijft liggen. Alles blijft zichtbaar bij Inzicht.</p>
      ${infoHtml.length ? `<div class="lijst">${infoHtml.join('')}</div>` : '<p class="zacht klein">Niets nieuws.</p>'}
      `;
  };

  // Signalenlijst: ook "ernstig", en alleen wat bij deze rol hoort
  const origSignalen = CC.views.signalen;
  CC.views.signalen = (S, p) => {
    if (!['ernstig', 'speler', 'lang', 'patroon', 'liggen', 'gesprekHjo'].includes(p.soort)) return origSignalen(S, p);
    const O = CC.hjoOverzicht(S);
    const lijst = p.soort === 'ernstig' ? O.ernstig : p.soort === 'speler' ? O.rood.filter(O.eigen) : p.soort === 'liggen' ? O.liggen : O.groep(p.soort, O.eigen);
    const titel = { ernstig: `Onder ${O.i.ernstig}% aanwezig`, speler: 'Spelers in de rode zone', lang: 'Langdurig afwezig', patroon: 'Opvallende patronen', liggen: 'Blijft liggen', gesprekHjo: 'Gesprekken met ouders' }[p.soort];
    const teams = [...new Set(lijst.map((s) => s.teamId))];
    return { titel, html: `<p class="zacht klein">ClubComm signaleert; de trainer of teamleider pakt het als eerste op. ${p.soort === 'ernstig' ? `De ${esc(S.club.labels.coordinator.toLowerCase())} volgt dit op; jij hoeft niets te doen.` : 'Jij kijkt of het gebeurt.'}</p>
      ${teams.map((tid) => `${h.sectie(`${esc(CC.tn(tid))} · trainer ${esc((M.persoon(S, M.team(S, tid).trainerId) || { naam: '–' }).naam)}`)}<div class="lijst">${lijst.filter((s) => s.teamId === tid).map((s) => { const d = dagenOpen(O.z[s.sleutel] || new Date().toISOString()); const op = opgepakt(S, s, O.z[s.sleutel] || new Date().toISOString()); return (s.afdoenbaar ? CC.signaalRijAfdoen(S, s) : CC.stapRij(S, s)).replace('</small>', ` · ${op ? 'opgepakt' : d ? `${d} ${d === 1 ? 'dag' : 'dagen'} open` : 'nieuw'}</small>`); }).join('')}</div>`).join('') || h.leeg('Niets')}` };
  };

  // Afgedane signalen: akkoord, of toch oppakken
  CC.views.afgedaan = (S) => {
    const rol = CC.rol().rol; const lijst = M.afgedaanRecent(S, S.teams.filter((t) => eersteLijn(S, t.id, rol)).map((t) => t.id), 60).slice().reverse();
    return { titel: 'Afgedane signalen', html: `<p class="zacht klein">Trainers en teamleiders hebben deze signalen afgedaan als "geen actie nodig". Klopt dat? Dan <b>Akkoord</b>. Twijfel je? Dan <b>Toch oppakken</b>.</p>
      <div class="lijst">${lijst.map((x) => `<div class="signaal">${h.rij({ ic: x.akkoord ? 'circle-check' : 'check', titel: esc(x.tekst), sub: `${esc(CC.tn(x.teamId))} · ${esc((M.persoon(S, x.door) || { naam: '' }).naam)} · ${D.tijdstip(x.tijd)}${x.notitie ? '<br>' + esc(x.notitie) : ''}`, act: x.spelerId ? 'open' : '', attrs: x.spelerId ? `data-view="speler" data-id="${x.spelerId}"` : '' })}
        <div class="signaal-voet">${x.akkoord ? '<small class="zacht">Akkoord</small>' : `<button class="knop klein licht" data-act="afgedaanAkkoord" data-tijd="${esc(x.tijd)}">${icon('check')}Akkoord</button><button class="knop klein licht" data-act="afgedaanOppakken" data-tijd="${esc(x.tijd)}">${icon('undo-2')}Toch oppakken</button>`}</div></div>`).join('') || h.leeg('Niets afgedaan')}</div>` };
  };
  const vind = (S, tijd) => (S.signaalAfgedaan || []).find((x) => x.tijd === tijd);
  CC.on('afgedaanAkkoord', (el) => { const S = CC.S(); vind(S, el.dataset.tijd).akkoord = true; CC.save(); CC.render(); });
  CC.on('afgedaanOppakken', (el) => {
    const S = CC.S(); const x = vind(S, el.dataset.tijd); const t = M.team(S, x.teamId); const tr = M.persoon(S, t.trainerId);
    CC.sheet('Toch oppakken', `<p>${esc(x.tekst)}</p><form data-submit="afgedaanOppakkenOk" data-tijd="${esc(x.tijd)}" class="codeform">
      <label for="to-w">Wie pakt het op?</label><select id="to-w" name="w">${tr ? `<option value="trainer">Terug naar de trainer (${esc(tr.naam)}) met een vraag</option>` : ''}<option value="zelf">Ik pak het zelf op</option></select>
      <label for="to-v">Vraag of opmerking</label><input id="to-v" name="v" placeholder="Bijv. kun je toch even bellen? Het is al de derde keer.">
      <button class="knop">Oppakken</button><p class="zacht klein">Het signaal komt terug in de lijst.</p></form>`);
  });
  CC.on('afgedaanOppakkenOk', (f) => {
    const S = CC.S(); const x = vind(S, f.dataset.tijd); const t = M.team(S, x.teamId); const me = CC.me();
    S.signaalAfgedaan = S.signaalAfgedaan.filter((y) => y !== x);
    if (f.w.value === 'trainer' && t.trainerId) S.msgs.push({ id: 'b' + Date.now(), van: me.id, soort: 'persoonlijk', bereik: t.id, onderwerp: `Toch oppakken: ${x.tekst.split(':')[0]}`, tekst: `Je had dit signaal afgedaan als "geen actie nodig": ${x.tekst}. ${f.v.value || 'Wil je het toch oppakken?'}`, tijd: new Date().toISOString(), ontvangers: [t.trainerId], gelezen: [], antw: [], urgent: false, gepland: null });
    CC.save(); CC.closeSheet(); CC.render(); CC.toast(f.w.value === 'trainer' ? 'De trainer krijgt je vraag; het signaal staat weer open' : 'Het signaal staat weer open');
  });

  // Regels: wanneer komt een spelerzaak bij de HJO?
  const origRegels = CC.rollen.beheerder.schermen.regels;
  CC.rollen.beheerder.schermen.regels = (S) => { const i = inst(S); return origRegels(S) + `${h.sectie('Wanneer ziet de ' + esc(S.club.labels.hjo) + ' spelerzaken?')}<form data-submit="escalatieOk" class="kaartje codeform"><p class="zacht klein">Spelerzaken gaan eerst naar trainer, teamleider en ${esc(S.club.labels.coordinator.toLowerCase())}. De ${esc(S.club.labels.hjo)} ziet ze pas als:</p><div class="twee"><div><label for="e-l">Ze … dagen blijven liggen</label><input id="e-l" name="l" type="number" min="3" max="60" value="${i.liggenDagen}"></div><div><label for="e-e">Of aanwezigheid onder … %</label><input id="e-e" name="e" type="number" min="10" max="90" value="${i.ernstig}"></div></div><button class="knop licht klein">Opslaan</button></form>`; };
  CC.on('escalatieOk', (f) => { const S = CC.S(); const i = inst(S); i.liggenDagen = Number(f.l.value); i.ernstig = Number(f.e.value); CC.save(); CC.render(); CC.toast('Opgeslagen'); });

  // Demo: één zaak bij de coördinator ligt al 20 dagen stil
  const demo = (S) => {
    inst(S); const tids = S.teams.map((t) => t.id); const sig = M.signalen(S, tids, true); const z = sinds(S, sig, tids);
    const oud = new Date(Date.now() - 20 * 864e5).toISOString();
    const s = sig.find((x) => x.soort === 'speler' && x.niveau === 'rood' && CC.coordinatorVoor(S, x.teamId) && x.teamId !== 'O10-1');
    if (s) z[s.sleutel] = oud;
    S.hjoHomeDemo = true;
  };
  const orig = CC.generate;
  CC.generate = function () { const S = orig(); demo(S); return S; };
  const S0 = CC.S(); if (!S0.hjoHomeDemo) { demo(S0); CC.save(); }
})();
