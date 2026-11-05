// ClubComm — Besluit 169: lange beheerlijsten ingeklapt met zoeken (minder scrollen, minder klikken).
// Rollen: mensen per rol ingeklapt, zoeken op naam, team of rol, één regel als een team geen trainer of teamleider heeft.
// Seizoen (en Teams van de HO): teams per bouw ingeklapt (zoals het werkgebied, Besluit 154), zoeken op team of trainer.
// Alleen de indeling; geen nieuwe gegevens of rechten.
(function () {
  const CC = window.CC; const h = CC.h, esc = CC.esc, icon = CC.icon, M = CC.m;
  const onthoud = (k, standaard) => { const u = CC.ui.uitklap || {}; return k in u ? u[k] : standaard; };
  const pakket = (S) => !!(CC.pakketTrainers && CC.pakketTrainers(S));
  const zoekVeld = (doel, tekst) => `<div class="zoek">${icon('search')}<input type="search" placeholder="${esc(tekst)}" aria-label="${esc(tekst)}" data-filter="${doel}" autocomplete="off"></div>`;
  const groep = (sleutel, titel, aantal, extra, binnen, open) => `<details class="uitklap blok bl-groep" data-onthoud="${esc(sleutel)}" ${onthoud(sleutel, open) ? 'open' : ''}><summary>${esc(titel)} <span class="zacht">(${aantal}${extra ? ` · ${extra}` : ''})</span></summary><div class="lijst compact">${binnen}</div></details>`;

  // Zoeken zonder opnieuw te tekenen (de cursor blijft staan): regels met data-z filteren, groepen met een treffer openen
  document.addEventListener('input', (e) => { const el = e.target; if (!el.dataset || !el.dataset.filter) return;
    const bak = document.querySelector(`[data-filterbak="${el.dataset.filter}"]`); if (!bak) return; const q = el.value.trim().toLowerCase();
    bak.querySelectorAll('[data-z]').forEach((r) => { r.hidden = !!q && !r.dataset.z.includes(q); });
    bak.querySelectorAll('details.bl-groep').forEach((d) => { const raak = [...d.querySelectorAll('[data-z]')].some((r) => !r.hidden);
      d.hidden = !!q && !raak; if (q) { if (!d.dataset.was) d.dataset.was = d.open ? '1' : '0'; d.open = raak; } else if (d.dataset.was) { d.open = d.dataset.was === '1'; delete d.dataset.was; } });
    const leeg = bak.querySelector('.bl-leeg'); if (leeg) leeg.hidden = !q || [...bak.querySelectorAll('[data-z]')].some((r) => !r.hidden); });
  const z = (...x) => `data-z="${esc(x.filter(Boolean).join(' ').toLowerCase())}"`;

  // ---------- Rollen ----------
  const ROLLEN = ['trainer', 'teamleider', 'coordinator', 'tc', 'hjo', 'beheerder', 'ouder'];
  const meervoud = (S, r) => ({ trainer: 'Trainers', teamleider: 'Teamleiders', coordinator: `${S.club.labels.coordinator}en`, tc: 'Technisch coördinatoren', hjo: S.club.labels.hjo, beheerder: 'Clubbeheerders', ouder: 'Ouders' }[r]);
  // Teams zonder trainer of (buiten het pakket) zonder teamleider
  CC.teamsZonder = (S) => S.teams.map((t) => { const heeft = (rol) => S.people.some((p) => p.rollen.some((r) => r.rol === rol && r.teamId === t.id)) || (rol === 'trainer' && t.trainerId);
    return { t, mist: [!heeft('trainer') && 'trainer', !pakket(S) && !heeft('teamleider') && 'teamleider'].filter(Boolean) }; }).filter((x) => x.mist.length);
  const rolTekst = (r) => `${esc(CC.rolNaam(r))}${r.teamId ? ' ' + esc(CC.tn(r.teamId)) : r.groep ? ' ' + esc(r.groep) : (r.bouwen || []).length ? ' (' + esc(r.bouwen.join(', ')) + ')' : ''}`;
  CC.rollenLijst = (S) => {
    const zonder = CC.teamsZonder(S);
    const signaal = zonder.length ? `<div class="lijst compact">${h.rij({ ic: 'triangle-alert', titel: `${zonder.length} ${zonder.length === 1 ? 'team' : 'teams'} zonder ${[...new Set(zonder.flatMap((x) => x.mist))].join(' of ')}`, sub: `${esc(zonder.slice(0, 4).map((x) => x.t.naam).join(', '))}${zonder.length > 4 ? ` en nog ${zonder.length - 4}` : ''} · tik om iemand te kiezen`, act: 'teamsZonder', kleur: 'oranje' })}</div>` : '';
    const groepen = ROLLEN.map((rol) => ({ rol, mensen: S.people.filter((p) => p.rollen.some((r) => r.rol === rol)).sort((a, b) => a.naam.localeCompare(b.naam)) })).filter((g) => g.mensen.length);
    return `${zoekVeld('rollen', 'Zoek naam, team of rol')}${signaal}<div data-filterbak="rollen">
      ${groepen.map((g) => groep(`rollen:${g.rol}`, meervoud(S, g.rol), g.mensen.length, '', g.mensen.map((p) => { const rr = p.rollen.filter((r) => r.rol !== 'ouder' || g.rol === 'ouder');
        const sub = g.rol === 'ouder' ? `Ouder van ${esc(S.players.filter((pl) => (pl.ouders || []).includes(p.id)).map((pl) => pl.voornaam).join(', ') || '…')}` : rr.filter((r) => r.rol !== 'ouder').map(rolTekst).join(' · ');
        return `<div ${z(p.naam, rr.map((r) => `${CC.rolNaam(r)} ${r.teamId ? CC.tn(r.teamId) : ''}`).join(' '), meervoud(S, g.rol))}>${h.rij({ ic: h.avatar(p.naam), titel: esc(p.naam), sub, act: 'rollenPersoon', attrs: `data-id="${p.id}"` })}</div>`; }).join(''), false)).join('')}
      <p class="zacht klein bl-leeg" hidden>Niemand gevonden. Voeg iemand toe met <b>Persoon toevoegen</b>.</p></div>
      <p class="zacht klein">Tik op een naam om een rol te koppelen, weg te halen of het werkgebied te kiezen. Wie twee rollen heeft, staat in beide groepen.</p>`; };
  CC.on('teamsZonder', () => { const S = CC.S(); const zonder = CC.teamsZonder(S);
    CC.sheet('Teams zonder trainer of teamleider', `<p class="zacht klein">Kies per team iemand. Staat de persoon al in de club (bijvoorbeeld als ouder), dan komt de rol erbij.</p>
      <div class="lijst compact">${zonder.map(({ t, mist }) => mist.map((rol) => h.rij({ ic: 'shield', titel: `${esc(t.naam)} · geen ${rol}`, sub: `${rol === 'trainer' ? 'Trainer' : 'Teamleider'} toevoegen of kiezen`, act: 'stafNieuw', attrs: `data-team="${esc(t.id)}" data-rol="${rol}"` })).join('')).join('')}</div>`); });

  // ---------- Teams per bouw ----------
  CC.teamsGroepen = (S, rij) => { const bw = CC.bouwenMetTeams ? CC.bouwenMetTeams(S, S.teams) : [{ naam: 'Teams', teams: S.teams }];
    const een = bw.length === 1 || S.teams.length <= 6; // weinig teams: gewoon open, zonder zoekveld
    return `${S.teams.length > 6 ? zoekVeld('teams', 'Zoek team of trainer') : ''}<div data-filterbak="teams">${bw.map((b) => { const ts = b.teams.slice().sort((a, c) => a.naam.localeCompare(c.naam, 'nl', { numeric: true }));
      const zonder = ts.filter((t) => !t.trainerId).length;
      return groep(`teams:${b.naam}`, b.naam, `${ts.length} ${ts.length === 1 ? 'team' : 'teams'}`, zonder ? `<span class="tb-or">${zonder} zonder trainer</span>` : '', ts.map((t) => `<div ${z(t.naam, (M.persoon(S, t.trainerId) || {}).naam, b.naam)}>${rij(t)}</div>`).join(''), een); }).join('')}
      <p class="zacht klein bl-leeg" hidden>Geen team gevonden.</p></div>`; };
})();
