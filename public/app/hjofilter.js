// ClubComm prototype — HJO: teams filteren en sorteren (Teams-tab) en Inzicht per groep (coördinator).
// Op teamniveau: spelerzaken lopen via trainer en coördinator (Besluit 26).
(function () {
  const CC = window.CC; const D = CC.date, M = CC.m, h = CC.h, icon = CC.icon, esc = CC.esc;
  const groepen = (S) => (S.club.coordinatorAan ? S.club.groepen || [] : []);
  const inGroep = (S, t, g) => (groepen(S).find((x) => x.naam === g) || { cats: [] }).cats.includes(t.cat);

  // ---- Teams-tab: filteren en sorteren ----
  const origTeams = CC.rollen.hjo.schermen.teams;
  CC.rollen.hjo.schermen.teams = (S) => {
    if (h.segVal('hjoTeams', 'teams') !== 'teams') return origTeams(S);
    const seg = h.seg('hjoTeams', [['teams', 'Teams'], ['spelers', 'Alle spelers'], ['mensen', 'Staf']], 'teams');
    const per = M.periode(S, 'blok'); const f = h.segVal('tmF', 'alle'); const so = h.segVal('tmSort', 'naam');
    const rijen = S.teams.map((t) => {
      const ts = M.teamStats(S, t.id, per); const z = M.zone(S, ts.pct, t.id);
      const open = S.aanm.filter((x) => x.teamId === t.id && x.status === 'open').length;
      const sig = M.signalen(S, [t.id], false).filter((s) => s.soort !== 'lang').length;
      const hulp = CC.hulpTeam ? CC.hulpTeam(S, t.id) : null;
      return { t, ts, z, open, sig, staf: !!(t.trainerId && t.teamleiderId), hulp: hulp && hulp.gezinnen ? Math.round((100 * hulp.helpen) / hulp.gezinnen) : null };
    });
    const filters = [['alle', 'Alle'], ['zone', 'Oranje/rood'], ['staf', 'Zonder staf'], ['aanm', 'Open aanmeldingen'], ...(CC.rol().rol === 'hjo' ? groepen(S).map((g) => ['g:' + g.naam, g.naam]) : []), ['selectie', 'Selectie']];
    const pas = (x) => f === 'alle' || (f === 'zone' && ['oranje', 'rood'].includes(x.z)) || (f === 'staf' && !x.staf) || (f === 'aanm' && x.open) || (f === 'selectie' && x.t.type === 'selectie') || (f.startsWith('g:') && inGroep(S, x.t, f.slice(2)));
    const sorteer = { naam: (a, b) => a.t.naam.localeCompare(b.t.naam, 'nl', { numeric: true }), laag: (a, b) => (a.ts.pct ?? 101) - (b.ts.pct ?? 101), signalen: (a, b) => b.sig - a.sig, hulp: (a, b) => (a.hulp ?? 101) - (b.hulp ?? 101) }[so];
    const lijst = rijen.filter(pas).sort(sorteer);
    const bar = `<div class="chips scroll">${filters.map(([k, l]) => `<button class="chipknop ${k === f ? 'aan' : ''}" data-act="seg" data-key="tmF" data-val="${esc(k)}">${esc(l)}</button>`).join('')}</div>
      <label class="sorteer">${icon('sliders-horizontal')}<select data-change="tmSort" aria-label="Sorteren">${[['naam', 'Op naam'], ['laag', 'Aanwezigheid: laagste eerst'], ['signalen', 'Meeste signalen eerst'], ['hulp', 'Minste gezinnen die meehelpen']].map(([k, l]) => `<option value="${k}" ${k === so ? 'selected' : ''}>${l}</option>`).join('')}</select><small class="zacht">${lijst.length} van ${rijen.length}</small></label>`;
    return `${seg}${bar}<div class="lijst">${lijst.map((x) => h.rij({ ic: h.stip(x.z), titel: `${esc(x.t.naam)} <span class="label">${x.t.type}</span>`,
      sub: `${x.ts.pct ?? '–'}% · ${M.spelers(S, x.t.id).length} spelers${x.sig ? ` · ${x.sig} ${x.sig === 1 ? 'signaal' : 'signalen'}` : ''}${so === 'hulp' && x.hulp != null ? ` · ${x.hulp}% van de gezinnen helpt` : ''}`,
      rechts: `${x.staf ? '' : `<span class="chip oranje mini">${icon('user-cog')}staf</span>`}${x.open ? `<span class="chip blauw mini">${x.open} aanm.</span>` : ''}`, act: 'open', attrs: `data-view="team" data-team="${x.t.id}"` })).join('') || h.leeg('Geen teams met dit filter')}</div>`;
  };
  CC.on('tmSort', (el) => { CC.ui.seg.tmSort = el.value; CC.render(); });

  // ---- Inzicht per groep ----
  const origInzicht = CC.rollen.hjo.schermen.inzicht;
  CC.rollen.hjo.schermen.inzicht = (S) => {
    const gs = CC.rol().rol === 'hjo' ? groepen(S) : [];
    if (!gs.length) return origInzicht(S);
    const g = h.segVal('inzGroep', 'alle'); const keuze = h.seg('inzGroep', [['alle', 'Hele club'], ...gs.map((x) => [x.naam, x.naam])], 'alle');
    const co = g !== 'alle' ? S.people.find((p) => p.rollen.some((r) => r.rol === 'coordinator' && r.groep === g)) : null;
    const kop = `${keuze}${g !== 'alle' ? `<p class="zacht klein">Alleen de teams ${esc(g)}${co ? ` · ${esc(S.club.labels.coordinator.toLowerCase())}: ${esc(co.naam)}` : ''}. Handig voor een overleg met de ${esc(S.club.labels.coordinator.toLowerCase())}.</p>` : ''}`;
    if (g === 'alle') return kop + origInzicht(S);
    const alle = S.teams; S.teams = alle.filter((t) => inGroep(S, t, g));
    try { return kop + origInzicht(S); } finally { S.teams = alle; }
  };
})();
