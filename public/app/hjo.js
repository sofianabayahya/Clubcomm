// ClubComm prototype — HJO (Besluit 11): Home · Teams · Planning · Inzicht · Berichten
// en Clubbeheerder (Besluit 12 en 13): Home · Seizoen · Regels · Rollen · Modules
(function () {
  const CC = window.CC; const D = CC.date, M = CC.m, h = CC.h, icon = CC.icon, esc = CC.esc;
  const alleTeams = (S) => S.teams.map((t) => t.id);
  const hjoIds = (S) => S.people.filter((p) => p.rollen.some((r) => r.rol === 'hjo')).map((p) => p.id);

  const aandacht = (S) => {
    const sig = M.signalen(S, alleTeams(S), true);
    const groep = (soort) => sig.filter((s) => s.soort === soort);
    const zonderStaf = S.teams.filter((t) => !t.trainerId || !t.teamleiderId);
    const laat = S.aanm.filter((x) => x.status === 'open' && Date.now() - new Date(x.tijd) > 48 * 3600e3);
    const wijz = S.wijzigingen.filter((w) => Date.now() - new Date(w.tijd) < 7 * 864e5);
    return { sig, teams: groep('team'), spelers: sig.filter((s) => s.soort === 'speler' && s.niveau === 'rood'), bellen: groep('bellen'), gesprek: [...groep('clubbesluit'), ...groep('gesprekHjo')], patroon: groep('patroon'), lang: groep('lang'), zonderStaf, laat, wijz };
  };

  CC.rollen.hjo = {
    context(S) { return { titel: S.club.naam, sub: `${S.club.labels.hjo} · seizoen 2026/2027` }; },
    tabs(S) { const me = CC.me(); return [['home', 'Home', 'house'], ['teams', 'Teams', 'shield'], ['planning', 'Planning', 'calendar-days'], ['inzicht', 'Inzicht', 'chart-column'], ['berichten', 'Berichten', 'message-circle', M.ongelezen(S, me.id)]]; },
    schermen: {
      home(S) {
        const per = M.periode(S, 'blok');
        const stats = S.teams.map((t) => M.teamStats(S, t.id, per));
        const tot = stats.reduce((s, x) => s + x.spelers.reduce((a, y) => a + y.st.totaal, 0), 0);
        const aan = stats.reduce((s, x) => s + x.spelers.reduce((a, y) => a + y.st.aanwezig, 0), 0);
        const A = aandacht(S);
        const rijen = CC.vervangerRijen ? [...CC.mijnVervangingen(S), ...CC.vervangerRijen(S, S.teams.map((t) => t.id))] : [];
        if (A.teams.length) { const rood = A.teams.filter((s) => s.niveau === 'rood').length; rijen.push(h.rij({ ic: 'shield', titel: `${A.teams.length} teams in de ${rood ? 'rode' : 'oranje'}${rood && rood < A.teams.length ? ' of oranje' : ''} zone`, sub: A.teams.sort((a) => (a.niveau === 'rood' ? -1 : 1)).map((s) => esc(s.tekst.split(':')[0]) + ' ' + s.tekst.match(/\d+%/)[0]).join(', '), kleur: rood ? 'rood' : 'oranje', act: 'tab', attrs: 'data-tab="inzicht"' })); }
        if (A.spelers.length) rijen.push(h.rij({ ic: 'triangle-alert', titel: `${A.spelers.length} spelers in de rode zone`, sub: A.spelers.slice(0, 3).map((s) => esc(s.tekst.split(':')[0])).join(', ') + (A.spelers.length > 3 ? '…' : ''), kleur: 'rood', act: 'open', attrs: 'data-view="signalen" data-soort="speler"' }));
        const magG = (s) => CC.mag(s.soort === 'clubbesluit' ? 'clubbesluit' : 'gesprek', null, s.teamId);
        A.gesprek.filter(magG).forEach((s) => rijen.unshift(CC.stapRij(S, s)));
        const anders = A.gesprek.filter((s) => !magG(s));
        if (anders.length) rijen.push(h.rij({ ic: 'users', titel: `${anders.length} ${anders.length === 1 ? 'gesprek' : 'gesprekken'} met ouders lopen`, sub: `Ter informatie: dit doet de ${esc(CC.wie('gesprek', anders[0].teamId))}`, act: 'open', attrs: 'data-view="signalen" data-soort="gesprekHjo"' }));
        if (A.bellen.length) rijen.push(h.rij({ ic: 'phone', titel: `${A.bellen.length} ${A.bellen.length === 1 ? 'ouder' : 'ouders'} bellen of appen`, sub: `Drempel bereikt; ${esc(CC.wie('bellen'))} neemt contact op`, kleur: 'oranje', act: 'open', attrs: 'data-view="signalen" data-soort="bellen"' }));
        if (!CC.mag('staf')) A.zonderStaf = [];
        if (A.zonderStaf.length === 1) { const t = A.zonderStaf[0]; rijen.push(h.rij({ ic: 'user-cog', titel: `${t.naam} zonder ${!t.trainerId && !t.teamleiderId ? 'trainer en teamleider' : !t.trainerId ? 'trainer' : 'teamleider'}`, sub: 'Staf toewijzen', kleur: 'oranje', act: 'open', attrs: `data-view="team" data-team="${t.id}"` })); }
        else if (A.zonderStaf.length) rijen.push(h.rij({ ic: 'user-cog', titel: `${A.zonderStaf.length} teams zonder complete staf`, sub: A.zonderStaf.map((t) => `${t.naam} (${!t.trainerId && !t.teamleiderId ? 'trainer + teamleider' : !t.trainerId ? 'trainer' : 'teamleider'})`).join(', '), kleur: 'oranje', act: 'open', attrs: 'data-view="zonderStaf"' }));
        A.laat = A.laat.filter((x) => CC.mag('aanmeldingen48', null, x.teamId));
        if (A.laat.length) rijen.push(h.rij({ ic: 'hourglass', titel: `${A.laat.length} aanmelding${A.laat.length > 1 ? 'en' : ''} langer dan 48 uur open`, sub: A.laat.map((x) => `${esc(x.kindVoor)} (${esc(x.teamId)})`).join(', '), kleur: 'oranje', act: 'open', attrs: 'data-view="aanmeldingenHjo"' }));
        if (A.lang.length) rijen.push(h.rij({ ic: 'hospital', titel: `${A.lang.length} speler${A.lang.length > 1 ? 's' : ''} langdurig afwezig`, sub: A.lang.map((s) => esc(s.tekst.split(':')[0])).join(', '), act: 'open', attrs: 'data-view="signalen" data-soort="lang"' }));
        if (A.patroon.length) rijen.push(h.rij({ ic: 'repeat', titel: `${A.patroon.length} opvallende patronen`, sub: 'Bijv. steeds op dezelfde dag afwezig', act: 'open', attrs: 'data-view="signalen" data-soort="patroon"' }));
        if (CC.trainerAandacht) rijen.push(...CC.trainerAandacht(S));
        const mat = CC.materiaalAandacht && CC.materiaalAandacht(S); if (mat) rijen.push(mat);
        const af = M.afgedaanRecent(S, S.teams.map((t) => t.id), 7);
        if (af.length) rijen.push(h.rij({ ic: 'check', titel: `${af.length} ${af.length === 1 ? 'signaal' : 'signalen'} afgedaan als "geen actie nodig"`, sub: 'Afgelopen week, door trainers en teamleiders. Ter controle.', act: 'open', attrs: 'data-view="afgedaan"' }));
        if (A.wijz.length) rijen.push(h.rij({ ic: 'calendar-days', titel: `${A.wijz.length} planningswijziging${A.wijz.length > 1 ? 'en' : ''} door trainers`, sub: 'Ter informatie', act: 'tab', attrs: 'data-tab="planning"' }));
        return `<div class="clubregel"><span><b>${S.teams.length}</b> teams</span><span><b>${S.players.filter((p) => p.teamId).length}</b> spelers</span><span><b>${tot ? Math.round((100 * aan) / tot) : '–'}%</b> aanwezig</span></div>
              ${h.sectie('Aandacht nodig')}${rijen.length ? `<div class="lijst">${rijen.join('')}</div>` : h.leeg('Niets bijzonders 👍')}`;
      },
      teams(S) {
        const modus = h.segVal('hjoTeams', 'teams');
        const seg = h.seg('hjoTeams', [['teams', 'Teams'], ['spelers', 'Alle spelers'], ['mensen', 'Staf']], 'teams');
        const per = M.periode(S, 'blok');
        if (modus === 'spelers') {
          const q = (h.segVal('zoekSp', '') || '').toLowerCase();
          const res = S.players.filter((p) => p.teamId).filter((p) => !q || M.naam(S, p).toLowerCase().includes(q) || p.teamId.toLowerCase().includes(q)).slice(0, 40);
          return `${seg}<div class="zoek">${icon('search')}<input type="search" placeholder="Zoek speler of team" value="${esc(q)}" data-input="zoekSp" aria-label="Zoek speler"></div>
            <button class="knop licht vol" data-act="spelerToevoegen">${icon('user-plus')}Speler handmatig toevoegen</button>
            <div class="lijst" id="zoekres">${res.map((pl) => h.rij({ ic: h.avatar(pl.voornaam), titel: esc(M.naam(S, pl)), sub: esc(pl.teamId), act: 'spelerActies', attrs: `data-id="${pl.id}"` })).join('')}</div><p class="zacht klein">${S.players.filter((p) => p.teamId).length} spelers in de club${res.length === 40 ? ', eerste 40 getoond' : ''}.</p>`;
        }
        if (modus === 'mensen') {
          const q = (h.segVal('zoekMens', '') || '').toLowerCase(); const f = h.segVal('stafRol', 'alle');
          const filters = [['alle', 'Alle staf'], ['trainer', 'Trainers'], ['teamleider', 'Teamleiders'], ...(S.club.coordinatorAan ? [['coordinator', S.club.labels.coordinator + 'en']] : []), ['hjo', S.club.labels.hjo], ['geen', 'Zonder team']];
          const staf = (p) => p.rollen.some((r) => r.rol !== 'ouder');
          const res = S.people.filter((p) => (q ? p.naam.toLowerCase().includes(q) : staf(p)))
            .filter((p) => q || f === 'alle' || (f === 'geen' ? p.rollen.some((r) => ['trainer', 'teamleider'].includes(r.rol) && !r.teamId) || (staf(p) && !p.rollen.some((r) => r.teamId || r.groep || ['hjo', 'beheerder'].includes(r.rol))) : p.rollen.some((r) => r.rol === f)))
            .filter((p) => !CC.coordinatorVoor || CC.rol().rol !== 'coordinator' || q || p.rollen.some((r) => !r.teamId || S.teams.some((t) => t.id === r.teamId)))
            .sort((a, b) => a.naam.localeCompare(b.naam)).slice(0, 60);
          const contact = (p) => `${CC.belKnoppen(p)}<a class="icoonknop" href="mailto:${esc(p.email)}" aria-label="Mail ${esc(p.naam)}">${icon('mail')}</a>`;
          return `${seg}<div class="zoek">${icon('search')}<input type="search" placeholder="Zoek persoon (ook ouders)" value="${esc(q)}" data-input="zoekMens" aria-label="Zoek persoon"></div>
            ${q ? '' : `<div class="chips">${filters.map(([k, l]) => `<button class="chipknop ${k === f ? 'aan' : ''}" data-act="seg" data-key="stafRol" data-val="${k}">${esc(l)}</button>`).join('')}</div>`}
            ${CC.mag('staf') || CC.rol().rol === 'beheerder' ? `<button class="knop licht vol" data-act="stafNieuw">${icon('user-plus')}Staflid toevoegen</button>` : ''}
            <p class="zacht klein">Iedereen met een rol in de club: bellen, appen of mailen met één tik. Tik op een naam om rollen te koppelen of te wijzigen (bijv. een ouder ook trainer maken).</p>
            <div class="lijst">${res.map((p) => h.rij({ ic: h.avatar(p.naam), titel: esc(p.naam), sub: p.rollen.filter((r) => r.rol !== 'ouder' || !staf(p)).map((r) => `${esc(CC.rolNaam(r))}${r.teamId ? ' ' + esc(r.teamId) : r.groep ? ' ' + esc(r.groep) : ''}`).join(' · ') || 'Ouder', rechts: contact(p), act: 'rollenPersoon', attrs: `data-id="${p.id}"` })).join('') || h.leeg('Niemand gevonden')}</div>`;
        }
        return `${seg}<div class="lijst">${S.teams.map((t) => {
          const ts = M.teamStats(S, t.id, per); const z = M.zone(S, ts.pct, t.id);
          const staf = t.trainerId && t.teamleiderId; const open = S.aanm.filter((x) => x.teamId === t.id && x.status === 'open').length;
          return h.rij({ ic: h.stip(z), titel: `${esc(t.naam)} <span class="label">${t.type}</span>`, sub: `${ts.pct ?? '–'}% · ${M.spelers(S, t.id).length} spelers`, rechts: `${staf ? '' : `<span class="chip oranje mini">${icon('user-cog')}staf</span>`}${open ? `<span class="chip blauw mini">${open} aanm.</span>` : ''}`, act: 'open', attrs: `data-view="team" data-team="${t.id}"` });
        }).join('')}</div>`;
      },
      planning(S) {
        const c = S.club;
        const zonder = c.vakanties.filter((v) => !v.trainen);
        return `<div class="kaartje"><h4>${icon('calendar')}Seizoen ${D.kort(c.seizoen.start)} – ${D.kort(c.seizoen.eind)}</h4>
            <p class="klein">Geen training in: ${zonder.map((v) => esc(v.naam.toLowerCase())).join(', ')}. ${c.vakanties.filter((v) => v.trainen).map((v) => `Wel in de ${esc(v.naam.toLowerCase())}.`).join(' ')}</p>
            <p class="zacht klein">Seizoen en vakanties stelt de clubbeheerder in. Het systeem maakt alle trainingen aan en slaat vakanties over.</p></div>
          <div class="twee-knoppen"><button class="tegel" data-act="bulkRooster">${icon('calendar-plus')}<span>Rooster voor meerdere teams</span></button><button class="tegel" data-act="excelImport">${icon('upload')}<span>Importeren uit Excel</span></button></div>
          <button class="knop licht vol rood-tekst" data-act="noodbericht">${icon('triangle-alert')}Noodbericht of afgelasten</button>
          ${h.sectie('Weekrooster en veldindeling')}
          <div class="lijst compact">${S.teams.map((t) => h.rij({ ic: 'shield', titel: esc(t.naam), sub: t.rooster.map((r) => `${D.DAG_KORT[r.dag]} ${r.tijd} ${esc(r.veld)}`).join(' · ') || 'Nog geen rooster', act: 'roosterTeam', attrs: `data-team="${t.id}"` })).join('')}</div>
          ${h.sectie('Uitzonderingen door trainers')}
          <div class="lijst compact">${S.wijzigingen.slice().reverse().map((w) => h.rij({ ic: 'calendar-x', titel: `${esc(w.teamId)} · ${esc(w.tekst)}`, sub: `${esc((M.persoon(S, w.door) || {}).naam || '')} · ${D.tijdstip(w.tijd)}` })).join('') || '<p class="zacht klein">Geen wijzigingen.</p>'}</div>`;
      },
      inzicht(S) {
        const perSoort = h.segVal('inzPer', 'blok'); const per = M.periode(S, perSoort);
        const rij = S.teams.map((t) => ({ t, s: M.teamStats(S, t.id, per) })).sort((a, b) => (a.s.pct ?? 101) - (b.s.pct ?? 101));
        const kleuren = { Ziek: '#8B5CF6', Blessure: '#EF4444', 'School/huiswerk': '#0EA5E9', Vakantie: '#14B8A6', Familie: '#F59E0B', 'Andere sport': '#EC4899', Overig: '#94A3B8', 'Niet afgemeld': '#111827' };
        const kleur = (r) => kleuren[r] || '#64748B';
        const berichten = S.teams.map((t) => { const ms = S.msgs.filter((m) => m.soort === 'nieuws' && m.ontvangers.length && (!m.gepland || new Date(m.gepland) <= new Date()) && (m.bereik === t.id || m.bereik === 'Hele club')); const o = new Set(M.oudersVan(S, t.id)); let tot = 0, gel = 0; ms.forEach((m) => { m.ontvangers.forEach((p) => { if (o.has(p)) { tot++; if (m.gelezen.includes(p)) gel++; } }); }); return { t, pct: tot ? Math.round((100 * gel) / tot) : null }; });
        return `${h.seg('inzPer', [['blok', 'Deze fase'], ['seizoen', 'Heel seizoen']], 'blok')}
          ${h.sectie('1. Waar gaat het goed of mis?')}
          <div class="staven">${rij.map(({ t, s }) => { const z = M.zone(S, s.pct, t.id); return `<button class="staaf" data-act="open" data-view="team" data-team="${t.id}"><span>${esc(t.naam)}</span><i class="${z}" style="--w:${s.pct || 0}%"></i><b>${s.pct ?? '–'}%</b></button>`; }).join('')}</div>
          <p class="zacht klein">Laagste bovenaan. Groen/oranje/rood volgens de zones per teamtype (breedte ${S.club.inst.zones.breedte.groen}/${S.club.inst.zones.breedte.oranje}, selectie ${S.club.inst.zones.selectie.groen}/${S.club.inst.zones.selectie.oranje}).</p>
          ${h.sectie('2. Waarom?')}
          <div class="legenda">${Object.keys(kleuren).map((k) => `<span><i style="background:${kleuren[k]}"></i>${k}</span>`).join('')}</div>
          <div class="staven">${rij.slice(0, 10).map(({ t, s }) => { const tot = Object.values(s.redenen).reduce((a, b) => a + b, 0) || 1; const del = Object.entries(s.redenen).map(([r, n]) => `${r}: ${n}`).join(', ') || 'geen afwezigheid'; return `<div class="staaf gestapeld" role="img" aria-label="${esc(t.naam)}: ${esc(del)}"><span>${esc(t.naam)}</span><span class="stapel">${Object.entries(s.redenen).map(([r, n]) => `<i style="width:${(100 * n) / tot}%;background:${kleur(r.startsWith('Langdurig') ? 'Blessure' : r)}" title="${esc(r)}: ${n}"></i>`).join('')}</span><b>${Object.values(s.redenen).reduce((a, b) => a + b, 0)}×</b></div>`; }).join('')}</div>
          <p class="zacht klein">Aantal keer afwezig per reden, voor de 10 teams met de laagste aanwezigheid. Zo zie je of 80% komt door blessures of door andere sporten.</p>
          ${h.sectie('3. Hoe ontwikkelt het zich?')}
          <div class="lijst compact">${rij.slice(0, 8).map(({ t, s }) => { if (t.vorig == null || s.pct == null) return h.rij({ ic: h.stip(M.zone(S, s.pct, t.id)), titel: esc(t.naam), sub: `Nu ${s.pct ?? '–'}%${t.vorig == null ? ' · nog geen cijfer van vorig seizoen' : ''}` }); const d = s.pct - t.vorig; return h.rij({ ic: h.stip(M.zone(S, s.pct, t.id)), titel: esc(t.naam), sub: `Vorig seizoen ${t.vorig}% → nu ${s.pct}%`, rechts: `<b class="${d < -3 ? 'rood-tekst' : d > 3 ? 'groen-tekst' : 'zacht'}">${d > 0 ? '▲' : d < 0 ? '▼' : '='} ${Math.abs(d)}</b>` }); }).join('')}</div>
          <p class="zacht klein">Na elke fase komt er een punt bij, zodat je de trend per fase ziet.</p>
          ${CC.beoordInzicht && S.club.modules.beoordeling ? CC.beoordInzicht(S) : ''}
          ${h.sectie('Gelezen berichten per team')}
          <div class="staven">${berichten.sort((a, b) => (a.pct ?? 101) - (b.pct ?? 101)).slice(0, 6).map(({ t, pct }) => `<div class="staaf"><span>${esc(t.naam)}</span><i class="${pct >= 75 ? 'groen' : pct >= 50 ? 'oranje' : 'rood'}" style="--w:${pct || 0}%"></i><b>${pct ?? '–'}%</b></div>`).join('')}</div>
          <button class="knop vol" data-act="exportPdf">${icon('file-down')}Exporteren naar PDF</button>`;
      },
      berichten: (S) => CC.berichtenScherm(S, { nieuw: true }),
    },
  };

  // HJO-acties
  CC.on('berichtAanClub', () => CC.berichtForm('club'));
  CC.on('afgelasten', () => {
    const S = CC.S();
    CC.sheet('Afgelasten', `<form data-submit="afgelastenOk" class="codeform">
      <label for="ag-d">Datum</label><input id="ag-d" name="d" type="date" value="${D.vandaag()}" required>
      <label for="ag-w">Wat?</label><select id="ag-w" name="w"><option value="alles">Alle trainingen en thuiswedstrijden</option><option value="training">Alleen trainingen</option></select>
      <label for="ag-r">Reden</label><select id="ag-r" name="r"><option>Velden afgekeurd (vorst)</option><option>Velden afgekeurd (regen)</option><option>Onweer</option><option>Overig</option></select>
      <fieldset class="vinkjes"><legend>Teams</legend><label><input type="checkbox" name="alle" checked data-change="alleTeams"> Alle teams</label>${S.teams.map((t) => `<label><input type="checkbox" name="teams" value="${t.id}" checked> ${t.naam}</label>`).join('')}</fieldset>
      <button class="knop rood vol">${icon('ban')}Afgelasten en iedereen inlichten</button>
      <p class="zacht klein">Alle betrokken ouders, trainers en teamleiders krijgen direct een pushmelding.</p></form>`);
  });
  CC.on('alleTeams', (el) => el.form.querySelectorAll('[name=teams]').forEach((c) => { c.checked = el.checked; }));
  CC.on('afgelastenOk', (f) => {
    const S = CC.S(); const teams = [...f.querySelectorAll('[name=teams]:checked')].map((x) => x.value);
    const acts = S.acts.filter((a) => a.datum === f.d.value && teams.includes(a.teamId) && !a.afgelast && (f.w.value === 'alles' ? (a.soort === 'training' || a.thuis) : a.soort === 'training'));
    acts.forEach((a) => { a.afgelast = true; });
    const tIds = [...new Set(acts.map((a) => a.teamId))];
    const ontv = [...new Set(tIds.flatMap((t) => { const tm = M.team(S, t); return [...M.oudersVan(S, t), tm.trainerId, tm.teamleiderId]; }).filter(Boolean))];
    S.msgs.push({ id: 'b' + Date.now(), van: CC.me().id, soort: 'nieuws', bereik: tIds.length === S.teams.length ? 'Hele club' : tIds.join(', '), onderwerp: `Afgelast: ${D.lang(f.d.value)}`, tekst: `${f.r.value}. ${f.w.value === 'alles' ? 'Alle trainingen en thuiswedstrijden' : 'Alle trainingen'} van ${D.lang(f.d.value)} gaan niet door.`, tijd: new Date().toISOString(), ontvangers: ontv, gelezen: [], antw: [], urgent: true, gepland: null });
    CC.save(); CC.closeSheet(); CC.render(); CC.toast(acts.length ? `${acts.length} activiteiten afgelast · ${ontv.length} mensen ingelicht` : 'Op die dag stond niets gepland');
  });
  CC.on('zoekSp', (el) => { CC.ui.seg.zoekSp = el.value; const pos = el.selectionStart; CC.render(); const n = document.querySelector('[data-input="zoekSp"]'); n.focus(); n.setSelectionRange(pos, pos); });
  CC.on('zoekMens', (el) => { CC.ui.seg.zoekMens = el.value; const pos = el.selectionStart; CC.render(); const n = document.querySelector('[data-input="zoekMens"]'); n.focus(); n.setSelectionRange(pos, pos); });
  CC.on('spelerActies', (el) => {
    const S = CC.S(); const pl = M.speler(S, el.dataset.id);
    CC.sheet(M.naam(S, pl), `${h.rij({ ic: 'eye', titel: 'Bekijken', sub: 'Aanwezigheid, kaarten, ouders', act: 'open', attrs: `data-view="speler" data-id="${pl.id}"` })}
      <form data-submit="verplaats" data-id="${pl.id}" class="codeform"><label for="vp">Naar ander team</label><select id="vp" name="t">${S.teams.map((t) => `<option ${t.id === pl.teamId ? 'selected' : ''}>${t.id}</option>`).join('')}</select><button class="knop licht">${icon('arrow-left-right')}Verplaatsen</button><p class="zacht klein">Ouders, trainer en teamleider van beide teams krijgen een melding. De geschiedenis gaat mee.</p></form>`);
  });
  CC.on('verplaats', (f) => { const S = CC.S(); const pl = M.speler(S, f.dataset.id); const oud = pl.teamId; pl.teamId = f.t.value; CC.save(); CC.closeSheet(); CC.render(); CC.toast(`${pl.voornaam} verplaatst van ${oud} naar ${pl.teamId}`); });
  CC.on('spelerToevoegen', () => { const S = CC.S(); CC.sheet('Speler toevoegen', `<form data-submit="spelerToevoegenOk" class="codeform"><div class="twee"><div><label for="st-v">Voornaam</label><input id="st-v" name="v" required></div><div><label for="st-a">Achternaam</label><input id="st-a" name="a" required></div></div><label for="st-t">Team</label><select id="st-t" name="t">${S.teams.map((t) => `<option>${t.id}</option>`).join('')}</select><label for="st-e">E-mail van een ouder</label><input id="st-e" name="e" type="email" required><button class="knop">Toevoegen en ouder uitnodigen</button></form>`); });
  CC.on('spelerToevoegenOk', (f) => {
    const S = CC.S(); const mail = f.e.value.trim(); let o = S.people.find((p) => (p.email || '').toLowerCase() === mail.toLowerCase());
    if (!o) { o = { id: 'p' + Date.now(), naam: `Ouder van ${f.v.value.trim()}`, email: mail, tel: '', rollen: [{ rol: 'ouder' }] }; S.people.push(o); }
    else if (!o.rollen.some((r) => r.rol === 'ouder')) o.rollen.push({ rol: 'ouder' });
    S.players.push({ id: 's' + Date.now(), voornaam: f.v.value.trim(), achternaam: f.a.value.trim(), teamId: f.t.value, ouders: [o.id], bondsnummer: null });
    CC.save(); CC.closeSheet(); CC.render(); CC.toast('Toegevoegd; de ouder krijgt een uitnodiging');
  });
  CC.on('rollenPersoon', (el) => {
    const S = CC.S(); const p = M.persoon(S, el.dataset.id);
    CC.sheet(p.naam, `<p class="zacht">${esc(p.email)}</p><div class="lijst">${p.rollen.map((r, i) => h.rij({ ic: 'user-cog', titel: CC.rolNaam(r) + (r.teamId ? ` · ${r.teamId}` : ''), rechts: `<button class="icoonknop" data-act="rolWeg" data-id="${p.id}" data-i="${i}" aria-label="Rol verwijderen">${icon('trash-2')}</button>` })).join('')}</div>
      <form data-submit="rolErbij" data-id="${p.id}" class="codeform"><div class="twee"><div><label for="rb-r">Rol</label><select id="rb-r" name="r"><option value="trainer">Trainer</option><option value="teamleider">Teamleider</option><option value="ouder">Ouder</option><option value="hjo">${esc(S.club.labels.hjo)}</option>${S.club.coordinatorAan ? `<option value="coordinator">${esc(S.club.labels.coordinator)}</option>` : ''}</select></div><div><label for="rb-t">Team</label><select id="rb-t" name="t"><option value="">–</option>${S.teams.map((t) => `<option>${t.id}</option>`).join('')}${S.club.coordinatorAan ? `<optgroup label="Groep (voor ${esc(S.club.labels.coordinator.toLowerCase())})">${(S.club.groepen || []).map((g) => `<option value="groep:${esc(g.naam)}">${esc(g.naam)}</option>`).join('')}</optgroup>` : ''}</select></div></div><button class="knop">${icon('plus')}Rol koppelen</button><p class="zacht klein">Eén account per persoon. Met meerdere rollen verschijnt de rolwisselaar in het profiel.</p></form>`);
  });
  CC.on('rolErbij', (f) => {
    const S = CC.S(); const p = M.persoon(S, f.dataset.id); const r = f.r.value; const t = f.t.value;
    if (['trainer', 'teamleider'].includes(r) && (!t || t.startsWith('groep:'))) return CC.toast('Kies een team', 'fout');
    if (r === 'coordinator') { const g = (S.club.groepen || []).find((x) => 'groep:' + x.naam === t); if (!g) return CC.toast('Kies een groep teams', 'fout'); p.rollen.push({ rol: r, groep: g.naam, cats: g.cats }); CC.save(); CC.closeSheet(); CC.render(); return CC.toast(`${p.naam.split(' ')[0]} is nu ${S.club.labels.coordinator.toLowerCase()} ${g.naam}`); }
    p.rollen.push(t && r !== 'ouder' && r !== 'hjo' ? { rol: r, teamId: t } : { rol: r });
    if (r === 'trainer') M.team(S, t).trainerId = p.id; if (r === 'teamleider') M.team(S, t).teamleiderId = p.id;
    CC.save(); CC.closeSheet(); CC.render(); CC.toast(`${p.naam.split(' ')[0]} is nu ook ${CC.rolNaam({ rol: r }).toLowerCase()}`);
  });
  // Staflid toevoegen (Besluit 42): de club legt trainer of teamleider vast; die logt in met dit e-mailadres en is meteen gekoppeld
  CC.on('stafNieuw', () => { const S = CC.S(); CC.sheet('Staflid toevoegen', `<form data-submit="stafNieuwOk" class="codeform">
      <label for="sn-n">Naam</label><input id="sn-n" name="n" required autocomplete="off" placeholder="Voor- en achternaam">
      <label for="sn-e">E-mailadres</label><input id="sn-e" name="e" type="email" required autocomplete="off" placeholder="Hiermee logt hij of zij in">
      <label for="sn-t">Telefoonnummer (mag leeg)</label><input id="sn-t" name="tel" type="tel" inputmode="tel" autocomplete="off" placeholder="06 12345678">
      <div class="twee"><div><label for="sn-r">Rol</label><select id="sn-r" name="r"><option value="trainer">Trainer</option><option value="teamleider">Teamleider</option>${S.club.coordinatorAan ? `<option value="coordinator">${esc(S.club.labels.coordinator)}</option>` : ''}<option value="hjo">${esc(S.club.labels.hjo)}</option></select></div>
      <div><label for="sn-team">Team of groep</label><select id="sn-team" name="team">${S.teams.map((t) => `<option value="${t.id}">${esc(t.naam)}</option>`).join('')}${S.club.coordinatorAan ? `<optgroup label="Groep (voor ${esc(S.club.labels.coordinator.toLowerCase())})">${(S.club.groepen || []).map((g) => `<option value="groep:${esc(g.naam)}">${esc(g.naam)}</option>`).join('')}</optgroup>` : ''}</select></div></div>
      <button class="knop">Toevoegen en uitnodigen</button>
      <p class="zacht klein">Hij of zij krijgt een welkomstmail met hoe je inlogt. Staat dit e-mailadres al in de club (bijv. als ouder), dan komt de rol erbij.</p></form>`); });
  CC.on('stafNieuwOk', (f) => {
    const S = CC.S(); const me = CC.me(); const naam = f.n.value.trim(); const email = f.e.value.trim().toLowerCase(); const r = f.r.value; const t = f.team.value;
    const tel = f.tel.value.replace(/[^0-9+]/g, ''); if (tel && !/^(\+\d{10,14}|0\d{9})$/.test(tel)) return CC.toast('Vul een geldig telefoonnummer in, of laat het leeg', 'fout');
    let rol;
    if (r === 'coordinator') { const g = (S.club.groepen || []).find((x) => 'groep:' + x.naam === t); if (!g) return CC.toast('Kies een groep teams', 'fout'); rol = { rol: r, groep: g.naam, cats: g.cats }; }
    else if (r === 'hjo') rol = { rol: 'hjo' };
    else { if (!t || t.startsWith('groep:')) return CC.toast('Kies een team', 'fout'); rol = { rol: r, teamId: t }; }
    let p = S.people.find((x) => (x.email || '').toLowerCase() === email); const bestond = !!p;
    if (!p) { p = { id: 'p' + Date.now(), naam, email, tel, rollen: [] }; S.people.push(p); } else if (tel && !p.tel) p.tel = tel;
    if (p.rollen.some((x) => x.rol === rol.rol && (x.teamId || x.groep || '') === (rol.teamId || rol.groep || ''))) return CC.toast(`${p.naam.split(' ')[0]} heeft deze rol al`, 'fout');
    p.rollen.push(rol);
    const team = rol.teamId && M.team(S, rol.teamId);
    if (team && r === 'trainer' && !team.trainerId) team.trainerId = p.id; if (team && r === 'teamleider' && !team.teamleiderId) team.teamleiderId = p.id;
    const wat = `${CC.rolNaam(rol).toLowerCase()}${team ? ` van ${team.naam}` : rol.groep ? ` ${rol.groep}` : ''}`;
    S.msgs.push({ id: 'b' + Date.now(), van: me.id, soort: 'persoonlijk', bereik: p.naam, onderwerp: `Welkom bij ClubComm`, tekst: `Hoi ${p.naam.split(' ')[0]}! Je bent in ClubComm van ${S.club.naam} toegevoegd als ${wat}.\n\nInloggen: ga naar ${location.host}, vul ${email} in en typ de code van 6 cijfers uit de mail over. Je hoeft je niet aan te melden.\n\nTip: zet ClubComm op je beginscherm (iPhone: Delen → Zet op beginscherm).`, tijd: new Date().toISOString(), ontvangers: [p.id], gelezen: [], antw: [], urgent: false, gepland: null });
    CC.save(); CC.closeSheet(); CC.render();
    CC.sheet('Toegevoegd', `<p><b>${esc(p.naam)}</b> is nu ${esc(wat)}${bestond ? ' (stond al in de club; de rol is erbij gekomen)' : ''}.</p><p class="zacht">Er gaat een welkomstmail naar ${esc(email)} met hoe je inlogt. Wil je het ook zelf even laten weten?</p>
      <button class="knop vol" data-act="stafDeel" data-naam="${esc(p.naam.split(' ')[0])}" data-wat="${esc(wat)}" data-email="${esc(email)}">${icon('share-2')}Deel de inloglink</button>`);
  });
  CC.on('stafDeel', (el) => CC.deel(`Hoi ${el.dataset.naam}! Je bent in ClubComm toegevoegd als ${el.dataset.wat}. Log in op ${location.origin} met ${el.dataset.email}: je krijgt een code van 6 cijfers per mail.`, 'ClubComm'));
  CC.on('rolWeg', (el) => { const S = CC.S(); const p = M.persoon(S, el.dataset.id); const r = p.rollen.splice(Number(el.dataset.i), 1)[0]; if (r && r.teamId) { const t = M.team(S, r.teamId); if (t.trainerId === p.id && r.rol === 'trainer') t.trainerId = null; if (t.teamleiderId === p.id && r.rol === 'teamleider') t.teamleiderId = null; } CC.save(); CC.closeSheet(); CC.render(); CC.toast('Rol verwijderd'); });
  CC.on('exportPdf', () => { CC.toast('Printvenster: kies "Opslaan als PDF"'); setTimeout(() => window.print(), 300); });

  // Rooster
  const dagKnoppen = (gekozen = []) => `<fieldset class="dagen"><legend>Dagen</legend>${[1, 2, 3, 4, 5, 6].map((d) => `<label><input type="checkbox" name="dag" value="${d}" ${gekozen.includes(d) ? 'checked' : ''}><span>${D.DAG_KORT[d]}</span></label>`).join('')}</fieldset>`;
  CC.on('bulkRooster', () => { const S = CC.S(); CC.sheet('Rooster voor meerdere teams', `<form data-submit="bulkRoosterOk" class="codeform"><fieldset class="vinkjes"><legend>Teams</legend>${S.teams.map((t) => `<label><input type="checkbox" name="teams" value="${t.id}"> ${t.naam}</label>`).join('')}</fieldset>${dagKnoppen([3, 5])}<div class="twee"><div><label for="br-t">Van</label><input id="br-t" name="tijd" type="time" value="17:30"></div><div><label for="br-e">Tot</label><input id="br-e" name="eind" type="time" value="18:45"></div></div><label for="br-v">Veld</label><select id="br-v" name="veld">${[1, 2, 3, 4].map((v) => `<option>Veld ${v}</option>`).join('')}<option>Halve veld 1A</option><option>Halve veld 1B</option></select><button class="knop">Toepassen</button><p class="zacht klein">Het systeem maakt alle trainingen tot het einde van het seizoen aan en slaat de vakanties over.</p></form>`, { groot: true }); });
  const hergenereer = (S, t) => {
    const vandaag = D.vandaag();
    S.acts = S.acts.filter((a) => !(a.teamId === t.id && a.soort === 'training' && a.datum >= vandaag && !S.pres[a.id]));
    const inVak = (d) => [...S.club.vakanties, ...S.club.stops].find((v) => d >= v.van && d <= v.tot && !v.trainen);
    for (let d = vandaag; d <= D.addDays(vandaag, 56); d = D.addDays(d, 1)) {
      const dow = D.parse(d).getDay();
      t.rooster.forEach((r) => { if (r.dag === dow && !inVak(d)) S.acts.push({ id: 'a' + Math.random().toString(36).slice(2), teamId: t.id, soort: 'training', datum: d, tijd: r.tijd, eind: r.eind, veld: r.veld, afgelast: false }); });
    }
    S.acts.sort((a, b) => (a.datum + a.tijd).localeCompare(b.datum + b.tijd));
  };
  CC.on('bulkRoosterOk', (f) => {
    const S = CC.S(); const teams = [...f.querySelectorAll('[name=teams]:checked')].map((x) => x.value); const dagen = [...f.querySelectorAll('[name=dag]:checked')].map((x) => Number(x.value));
    if (!teams.length || !dagen.length) return CC.toast('Kies teams en dagen', 'fout');
    teams.forEach((id) => { const t = M.team(S, id); t.rooster = dagen.map((d) => ({ dag: d, tijd: f.tijd.value, eind: f.eind.value, veld: f.veld.value })); hergenereer(S, t); });
    CC.save(); CC.closeSheet(); CC.render(); CC.toast(`Rooster ingesteld voor ${teams.length} teams; trainingen aangemaakt`);
  });
  CC.on('roosterTeam', (el) => { const S = CC.S(); const t = M.team(S, el.dataset.team); const r = t.rooster[0] || { tijd: '17:30', eind: '18:45', veld: 'Veld 1' }; CC.sheet(`Rooster ${t.naam}`, `<form data-submit="roosterTeamOk" data-team="${t.id}" class="codeform">${dagKnoppen(t.rooster.map((x) => x.dag))}<div class="twee"><div><label for="rt-t">Van</label><input id="rt-t" name="tijd" type="time" value="${r.tijd}"></div><div><label for="rt-e">Tot</label><input id="rt-e" name="eind" type="time" value="${r.eind}"></div></div><label for="rt-v">Veld</label><input id="rt-v" name="veld" value="${esc(r.veld)}"><button class="knop">Opslaan</button></form>`); });
  CC.on('roosterTeamOk', (f) => { const S = CC.S(); const t = M.team(S, f.dataset.team); t.rooster = [...f.querySelectorAll('[name=dag]:checked')].map((x) => ({ dag: Number(x.value), tijd: f.tijd.value, eind: f.eind.value, veld: f.veld.value })); hergenereer(S, t); CC.save(); CC.closeSheet(); CC.render(); CC.toast('Rooster opgeslagen'); });
  CC.on('excelImport', () => CC.sheet('Importeren uit Excel', `<p>Heb je de veldindeling al in Excel? Sla het blad op als <b>CSV</b> met deze kolommen:</p>
    <pre class="code">team;dag;van;tot;veld\nO10-1;woensdag;17:30;18:45;Veld 2\nO10-1;vrijdag;17:30;18:45;Veld 2\nO12-2;dinsdag;18:00;19:15;Veld 3</pre>
    <label class="knop licht vol bestand">${icon('upload')}CSV-bestand kiezen<input type="file" accept=".csv,text/csv" data-change="csvGekozen" hidden></label>
    <p class="zacht klein">In versie 2 kan ook een .xlsx-bestand direct.</p>`));
  CC.on('csvGekozen', (el) => {
    const file = el.files[0]; if (!file) return; const r = new FileReader();
    r.onload = () => {
      const S = CC.S(); const dagen = D.DAG; const per = {}; let fout = 0;
      r.result.split(/\r?\n/).slice(1).filter((l) => l.trim()).forEach((l) => { const [team, dag, van, tot, veld] = l.split(/[;,]/).map((x) => x.trim()); const d = dagen.indexOf((dag || '').toLowerCase()); if (!M.team(S, team) || d < 0) { fout++; return; } (per[team] = per[team] || []).push({ dag: d, tijd: van, eind: tot, veld }); });
      Object.entries(per).forEach(([team, rooster]) => { const t = M.team(S, team); t.rooster = rooster; hergenereer(S, t); });
      CC.save(); CC.closeSheet(); CC.render(); CC.toast(`${Object.keys(per).length} teams geïmporteerd${fout ? `, ${fout} regels overgeslagen` : ''}`, fout ? 'fout' : '');
    };
    r.readAsText(file);
  });

  // Team-detail (HJO)
  CC.views.team = (S, p) => {
    const t = M.team(S, p.team); const per = M.periode(S, 'blok'); const ts = M.teamStats(S, t.id, per); const z = M.zone(S, ts.pct, t.id);
    const kandidaten = S.people.filter((x) => x.rollen.some((r) => r.rol !== 'ouder') || M.oudersVan(S, t.id).includes(x.id));
    const kies = (veld, cur) => `<select class="kies" data-change="zetStaf" data-team="${t.id}" data-veld="${veld}" aria-label="${veld}"><option value="">– Niemand –</option>${kandidaten.map((x) => `<option value="${x.id}" ${x.id === cur ? 'selected' : ''}>${esc(x.naam)}</option>`).join('')}</select>`;
    const top = Object.entries(ts.redenen).sort((a, b) => b[1] - a[1]).slice(0, 3);
    const afw = t.afwijking || {};
    return {
      titel: t.naam,
      html: `<div class="cijfers"><div class="cijfer ${z}"><b>${ts.pct ?? '–'}%</b><small>aanwezig</small></div><div class="cijfer"><b>${M.spelers(S, t.id).length}</b><small>spelers</small></div><div class="cijfer"><b>${ts.telaat}×</b><small>te laat</small></div></div>
        ${top.length ? `<p class="klein">Meest genoemde redenen: ${top.map(([r, n]) => `${esc(r.toLowerCase())} (${n})`).join(', ')}</p>` : ''}
        ${h.sectie('Staf')}<div class="kaartje"><label class="klein-kop">Trainer</label>${kies('trainerId', t.trainerId)}<label class="klein-kop">Teamleider</label>${kies('teamleiderId', t.teamleiderId)}<p class="zacht klein">Kies uit bestaande ouders of staf. Iemand van buiten? Voeg de persoon toe via Teams → Mensen.</p></div>
        ${h.sectie('Teamtype en regels')}<div class="kaartje"><div class="seg">${['breedte', 'selectie'].map((x) => `<button class="${t.type === x ? 'aan' : ''}" data-act="zetType" data-team="${t.id}" data-val="${x}">${x[0].toUpperCase() + x.slice(1)}</button>`).join('')}</div>
          <form data-submit="afwijkingOk" data-team="${t.id}" class="codeform"><label for="af-d">Afmelden training tot … uur van tevoren</label><input id="af-d" name="dt" type="number" min="0" max="48" value="${afw.deadlineTraining ?? ''}" placeholder="Clubstandaard: ${S.club.inst.deadlineTraining}"><button class="knop licht klein">Afwijking opslaan</button><p class="zacht klein">Leeg = clubstandaard. Zo kan een selectieteam strenger zijn dan een breedteteam.</p></form></div>
        ${CC.materiaalStatus && S.club.modules.materiaal ? `<div class="lijst">${CC.materiaalStatus(S, t.id)}</div>` : ''}
        ${CC.recenteTrainingen ? CC.recenteTrainingen(S, t.id) : ''}
        ${h.sectie('Rooster')}<p class="klein">${t.rooster.map((r) => `${D.DAG[r.dag]} ${r.tijd}–${r.eind}, ${esc(r.veld)}`).join('<br>') || 'Nog geen rooster'} <button class="linkknop" data-act="roosterTeam" data-team="${t.id}">Wijzigen</button></p>
        ${h.sectie('Spelers')}${CC.overzichtHtml(S, t.id)}
        ${h.sectie('Ouders uitnodigen')}${CC.uitnodigBlok(t.id)}`,
    };
  };
  CC.on('zetStaf', (el) => {
    const S = CC.S(); const t = M.team(S, el.dataset.team); const veld = el.dataset.veld; const rol = veld === 'trainerId' ? 'trainer' : 'teamleider';
    const oud = t[veld] && M.persoon(S, t[veld]); if (oud) oud.rollen = oud.rollen.filter((r) => !(r.rol === rol && r.teamId === t.id));
    t[veld] = el.value || null;
    if (el.value) { const p = M.persoon(S, el.value); if (!p.rollen.some((r) => r.rol === rol && r.teamId === t.id)) p.rollen.push({ rol, teamId: t.id }); }
    CC.save(); CC.render(); CC.toast(el.value ? `${M.persoon(S, el.value).naam} is ${rol} van ${t.naam}` : `${t.naam} heeft geen ${rol} meer`);
  });
  CC.on('zetType', (el) => { const S = CC.S(); M.team(S, el.dataset.team).type = el.dataset.val; CC.save(); CC.render(); });
  CC.on('afwijkingOk', (f) => { const S = CC.S(); const t = M.team(S, f.dataset.team); if (f.dt.value === '') delete t.afwijking.deadlineTraining; else t.afwijking.deadlineTraining = Number(f.dt.value); CC.save(); CC.render(); CC.toast('Opgeslagen'); });

  CC.views.signalen = (S, p) => {
    const A = aandacht(S); const lijst = { speler: A.spelers, gesprek: A.gesprek, bellen: A.bellen, lang: A.lang, patroon: A.patroon }[p.soort] || [];
    const titel = { speler: 'Spelers in de rode zone', gesprek: 'Gesprekken', bellen: 'Bellen of appen', lang: 'Langdurig afwezig', patroon: 'Opvallende patronen' }[p.soort];
    return { titel, html: `<p class="zacht klein">ClubComm signaleert; de teamleider of trainer beslist over een gesprek. Jij kunt meekijken en helpen.</p><div class="lijst">${lijst.map((s) => (s.afdoenbaar ? CC.signaalRijAfdoen(S, s) : CC.stapRij(S, s))).join('') || h.leeg('Niets')}</div>` };
  };
  CC.views.afgedaan = (S) => ({ titel: 'Afgedane signalen', html: `<p class="zacht klein">Signalen die trainers of teamleiders hebben afgedaan als "geen actie nodig". Ze komen vanzelf terug als het erger wordt.</p>
    <div class="lijst">${M.afgedaanRecent(S, S.teams.map((t) => t.id), 60).slice().reverse().map((x) => h.rij({ ic: 'check', titel: esc(x.tekst), sub: `${esc(x.teamId)} · ${esc((M.persoon(S, x.door) || { naam: '' }).naam)} · ${D.tijdstip(x.tijd)}${x.notitie ? '<br>' + esc(x.notitie) : ''}`, act: x.spelerId ? 'open' : '', attrs: x.spelerId ? `data-view="speler" data-id="${x.spelerId}"` : '' })).join('') || h.leeg('Niets afgedaan')}</div>` });
  CC.views.zonderStaf = (S) => ({ titel: 'Teams zonder complete staf', html: `<div class="lijst">${S.teams.filter((t) => !t.trainerId || !t.teamleiderId).map((t) => h.rij({ ic: 'user-cog', titel: esc(t.naam), sub: `Ontbreekt: ${!t.trainerId && !t.teamleiderId ? 'trainer en teamleider' : !t.trainerId ? 'trainer' : 'teamleider'}`, act: 'open', attrs: `data-view="team" data-team="${t.id}"` })).join('') || h.leeg('Alle teams zijn compleet')}</div><p class="zacht klein">Zonder teamleider neemt de trainer het over (goedkeuren, regelen). Zonder beide komt het bij jou (Ontwerpprincipe 7).</p>` });
  CC.views.aanmeldingenHjo = (S) => ({ titel: 'Openstaande aanmeldingen', html: `<p class="zacht klein">Na 48 uur zonder reactie komen aanmeldingen bij jou terecht. Je kunt ze zelf goedkeuren.</p><div class="lijst">${S.aanm.filter((x) => x.status === 'open').map((x) => `<small class="klein-kop">${esc(x.teamId)}</small>${CC.aanmRij(S, x)}`).join('') || h.leeg('Alles is goedgekeurd')}</div>` });

  // ---------- Clubbeheerder ----------
  CC.rollen.beheerder = {
    context(S) { return { titel: S.club.naam, sub: 'Clubbeheerder' }; },
    tabs(S) { return [['home', 'Home', 'house'], ['seizoen', 'Seizoen', 'calendar'], ['regels', 'Regels', 'sliders-horizontal'], ['rollen', 'Rollen', 'user-cog'], ['modules', 'Modules', 'puzzle']]; },
    schermen: {
      home(S) {
        const i = S.club.ingericht;
        const stap = (ok, titel, sub, tab) => h.rij({ ic: ok ? 'circle-check' : 'circle-alert', titel, sub, kleur: ok ? 'groen' : 'oranje', act: 'tab', attrs: `data-tab="${tab}"` });
        return `<div class="info">${icon('info')}<span>Als clubbeheerder richt je ClubComm in, ongeveer één keer per seizoen. Het dagelijkse werk doen de ${esc(S.club.labels.hjo)}, trainers en teamleiders.</span></div>
          ${h.sectie('Klaar voor het seizoen?')}<div class="lijst">
            ${stap(i.seizoen, 'Seizoen', `${D.kort(S.club.seizoen.start)} – ${D.kort(S.club.seizoen.eind)}`, 'seizoen')}
            ${stap(i.vakanties, 'Schoolvakanties', `Regio ${S.club.regio} · ${S.club.vakanties.length} vakanties`, 'seizoen')}
            ${stap(i.regels, 'Regels', `Afmelden ${S.club.inst.deadlineTraining} uur voor training · ${(S.club.inst.waarschuwingen || M.KAART_STD.waarschuwingen).breedte} herinneringen, daarna geel/rood`, 'regels')}
            ${stap(i.rollen, 'Rollen', `${S.club.labels.hjo}${S.club.coordinatorAan ? ' + ' + S.club.labels.coordinator : ''}`, 'rollen')}
            ${stap(i.modules, 'Modules', Object.entries(S.club.modules).filter(([, v]) => v).map(([k]) => k).join(', '), 'modules')}
          </div>
          ${h.sectie('Later')}<div class="lijst">${h.rij({ ic: 'upload', titel: 'Import uit Sportlink', sub: 'Eén keer per seizoen; ouders krijgen dan automatisch een uitnodiging', kleur: '', act: 'demoMelding', attrs: 'data-tekst="Komt na de pilot (Besluit 2)"' })}</div>`;
      },
      seizoen(S) {
        const c = S.club; const blokken = M.blokken(S);
        return `<form data-submit="seizoenOk" class="kaartje codeform"><div class="twee"><div><label for="sz-s">Start</label><input id="sz-s" name="s" type="date" value="${c.seizoen.start}"></div><div><label for="sz-e">Einde</label><input id="sz-e" name="e" type="date" value="${c.seizoen.eind}"></div></div>
            <label for="sz-r">Regio schoolvakanties</label><select id="sz-r" name="r">${['Noord', 'Midden', 'Zuid'].map((r) => `<option ${c.regio === r ? 'selected' : ''}>${r}</option>`).join('')}</select><button class="knop licht klein">Opslaan</button></form>
          ${h.sectie('Schoolvakanties 2026/2027 · regio ' + esc(c.regio))}
          <p class="zacht klein">Automatisch opgehaald uit de open data van de Rijksoverheid (in deze demo: vaste data regio Noord, adviesdata voor herfst, voorjaar en mei). Per vakantie kies je of er getraind wordt.</p>
          <div class="lijst">${c.vakanties.map((v) => `<label class="rij schakel"><span class="rij-tekst"><b>${esc(v.naam)}</b><small>${D.kort(v.van)} – ${D.kort(v.tot)}</small></span><span class="klein zacht">${v.trainen ? 'wel trainen' : 'geen training'}</span><input type="checkbox" ${v.trainen ? 'checked' : ''} data-change="vakTrainen" data-id="${v.id}"><i></i></label>`).join('')}</div>
          ${h.sectie('Eigen stops')}<div class="lijst">${c.stops.map((v) => h.rij({ ic: 'calendar-x', titel: esc(v.naam), sub: `${D.kort(v.van)} – ${D.kort(v.tot)} · ${v.trainen ? 'wel trainen, geen wedstrijden' : 'geen training'}` })).join('')}</div>
          <button class="knop licht vol" data-act="stopToevoegen">${icon('plus')}Stop toevoegen (bijv. clubtoernooi)</button>
          ${h.sectie('Fases')}<p class="zacht klein">Het seizoen is verdeeld in fases, zoals de competitie. Bij elke nieuwe fase begint de kaartenteller opnieuw (Besluit 15).</p>
          <div class="lijst">${blokken.map((b, k) => `<div class="rij"><span class="rij-tekst"><b>${esc(b.naam)}</b><small>tot ${D.kort(b.tot)} · ${Math.round((D.dagen(b.van, b.tot) + 1) / 7)} weken</small></span><input type="date" class="kort" value="${b.van}" data-change="faseDatum" data-k="${k}" aria-label="Start ${esc(b.naam)}" ${k === 0 ? 'disabled' : ''}></div>`).join('')}</div>`;
      },
      regels(S) {
        const i = S.club.inst;
        return `<form data-submit="regelsOk" class="codeform">
          ${h.sectie('Privacy')}<div class="kaartje"><label for="r-pc">Contact voor privacyvragen (e-mailadres, staat in de privacyverklaring)</label><input id="r-pc" name="pc" type="email" value="${esc(S.club.privacyContact || '')}" placeholder="bijv. secretaris@club.nl"></div>
          ${h.sectie('Afmelden')}<div class="kaartje"><div class="twee"><div><label for="r-dt">Training: uur van tevoren</label><input id="r-dt" name="dt" type="number" min="0" max="48" value="${i.deadlineTraining}"></div><div><label for="r-dw">Wedstrijd: uur van tevoren</label><input id="r-dw" name="dw" type="number" min="0" max="96" value="${i.deadlineWedstrijd}"></div></div></div>
          ${(() => { const w = i.waarschuwingen || M.KAART_STD.waarschuwingen; const tl = i.telaat || M.KAART_STD.telaat; const veld = (id, naam, lab, v, max) => `<div><label for="${id}">${lab}</label><input id="${id}" name="${naam}" type="number" min="0" max="${max}" value="${v}"></div>`; return `${h.sectie('Kaarten (afmelden)')}<div class="kaartje"><p class="klein">Te laat afgemeld = geel · twee keer geel = rood · niet afgemeld = direct rood. Rood: de trainer of ${esc(S.club.labels.hjo)} neemt contact op en kan de kaart accepteren.</p><p class="klein"><b>Vriendelijke herinneringen per seizoen</b> (daarna kaarten)</p><div class="twee">${veld('r-wb', 'wb', 'Breedte', w.breedte, 5)}${veld('r-ws', 'ws', 'Selectie', w.selectie, 5)}</div></div>
          ${h.sectie('Te laat komen (geen kaart, wel een signaal)')}<div class="kaartje"><p class="klein"><b>Breedte</b></p><div class="twee">${veld('r-tkb', 'tkb', '… keer binnen 4 weken', tl.breedte.kort, 10)}${veld('r-tsb', 'tsb', '… keer per seizoen', tl.breedte.seizoen, 30)}</div><p class="klein"><b>Selectie</b></p><div class="twee">${veld('r-tks', 'tks', '… keer binnen 4 weken', tl.selectie.kort, 10)}${veld('r-tss', 'tss', '… keer per seizoen', tl.selectie.seizoen, 30)}</div></div>`; })()}
          ${h.sectie('Zones aanwezigheid')}<div class="kaartje"><p class="klein"><b>Breedte</b></p><div class="twee"><div><label for="r-bg">Groen vanaf %</label><input id="r-bg" name="bg" type="number" value="${i.zones.breedte.groen}"></div><div><label for="r-bo">Oranje vanaf %</label><input id="r-bo" name="bo" type="number" value="${i.zones.breedte.oranje}"></div></div>
            <p class="klein"><b>Selectie</b></p><div class="twee"><div><label for="r-sg">Groen vanaf %</label><input id="r-sg" name="sg" type="number" value="${i.zones.selectie.groen}"></div><div><label for="r-so">Oranje vanaf %</label><input id="r-so" name="so" type="number" value="${i.zones.selectie.oranje}"></div></div></div>
          ${h.sectie('Afmelden door trainers')}<div class="kaartje"><div class="twee"><div><label for="r-tu">Op tijd = … uur van tevoren</label><input id="r-tu" name="tu" type="number" min="1" max="72" value="${(i.trainer || {}).deadlineUur || 24}"></div><div><label for="r-tp">Signaal bij … punten per fase</label><input id="r-tp" name="tp" type="number" min="1" max="10" value="${(i.trainer || {}).drempel || 3}"></div></div><label for="r-ts">Of bij … afmeldingen per seizoen</label><input id="r-ts" name="ts" type="number" min="1" max="20" value="${(i.trainer || {}).maxSeizoen || 5}"><p class="zacht klein">Te laat afgemeld = 1 punt, niet gekomen zonder bericht = 2 punten (registreert de teamleider). Het signaal gaat alleen naar de ${esc(S.club.labels.hjo)}.</p></div>
          ${(() => { const sa = i.speeltijdAfwijken || { breedte: false, selectie: true }; return `${h.sectie('Speeltijd')}<div class="kaartje"><p class="klein">Iedereen krijgt eerlijk speeltijd (percentage in bijgewoonde wedstrijden). Mag de trainer iemand een blok minder geven, bijvoorbeeld na weinig trainen?</p><label class="schakel"><span>Breedteteams</span><input type="checkbox" name="sab" ${sa.breedte ? 'checked' : ''}><i></i></label><label class="schakel"><span>Selectieteams</span><input type="checkbox" name="sas" ${sa.selectie ? 'checked' : ''}><i></i></label>
            <p class="klein">Wisselen om de … minuten (per speelvorm). Advies: per blok. De trainer kan per wedstrijd afwijken.</p>
            ${CC.SPEELVORMEN.map(([k, naam, advies, duur]) => `<label for="r-w${k}">${naam} (${duur} min)</label><input id="r-w${k}" name="w${k}" type="number" inputmode="decimal" min="3" max="${duur}" step="0.5" value="${(i.wissel || {})[k] || advies}">`).join('')}</div>`; })()}
          ${h.sectie('Aanwezigheid opnemen')}<div class="kaartje"><label for="r-ou">Invullen of corrigeren tot … uur na de start</label><input id="r-ou" name="ou" type="number" min="12" max="168" value="${i.opnemenUur || 48}"><p class="zacht klein">Daarna staat de lijst vast, zodat ouders niet achteraf nog een kaart krijgen. Zolang het nog kan, ziet de trainer een herinnering op Home.</p></div>
          ${h.sectie('Automatische oproepen')}<div class="kaartje"><label for="r-op">Oproep voor open taken: … dagen van tevoren</label><input id="r-op" name="op" type="number" min="1" max="7" value="${i.oproepDagen}"><label for="r-hd">Vervoer en taken op Home van ouders: … dagen vooruit</label><input id="r-hd" name="hd" type="number" min="1" max="28" value="${i.homeDagen || 7}"><p class="zacht klein">Verder vooruit staat het alleen op de tabbladen Vervoer en Taken.</p></div>
          ${h.sectie('Tekst eerste herinnering')}<textarea name="w" rows="8" aria-label="Tekst eerste herinnering">${esc(i.waarschuwing)}</textarea><p class="zacht klein">[kind], [team], [deadline] en [teamleider] worden automatisch ingevuld.</p>
          <button class="knop vol">Opslaan</button><p class="zacht klein">Dit is de clubstandaard. De ${esc(S.club.labels.hjo)} kan per team afwijken.</p></form>`;
      },
      rollen(S) {
        const c = S.club; const tel = (r) => S.people.filter((p) => p.rollen.some((x) => x.rol === r)).length;
        return `<form data-submit="labelsOk" class="kaartje codeform"><p class="klein">Hoe noemt jullie club deze rollen?</p><div class="twee"><div><label for="lb-h">Hoofd jeugd</label><input id="lb-h" name="h" value="${esc(c.labels.hjo)}"></div><div><label for="lb-c">Coördinator</label><input id="lb-c" name="c" value="${esc(c.labels.coordinator)}"></div></div><label class="schakel"><span>${esc(c.labels.coordinator)} gebruiken (${esc(c.labels.hjo)}-rechten voor een groep teams)</span><input type="checkbox" name="ca" ${c.coordinatorAan ? 'checked' : ''}><i></i></label><button class="knop licht klein">Opslaan</button></form>
          ${h.sectie('Rollen in gebruik')}<div class="lijst compact">${[['ouder', 'Ouder'], ['trainer', 'Trainer'], ['teamleider', 'Teamleider'], ['hjo', c.labels.hjo], ...(c.coordinatorAan ? [['coordinator', c.labels.coordinator]] : []), ['beheerder', 'Clubbeheerder']].map(([r, l]) => h.rij({ ic: 'user-cog', titel: esc(l), rechts: `<b>${tel(r)}</b>` })).join('')}</div>
          <table class="tabel"><thead><tr><th></th><th>Clubbeheerder</th><th>${esc(c.labels.hjo)}</th></tr></thead><tbody><tr><td>Soort werk</td><td>inrichten (± 1× per seizoen)</td><td>jeugd sturen (wekelijks)</td></tr><tr><td>Wat</td><td>rollen, modules, regels, seizoen, vakanties</td><td>teams, staf, signalen, planning, berichten</td></tr></tbody></table>
          <p class="zacht klein">Rollen per persoon koppel je als ${esc(c.labels.hjo)} bij Teams → Mensen.</p>`;
      },
      modules(S) {
        const m = S.club.modules;
        const rij = (k, titel, sub, uit) => `<label class="rij schakel ${uit ? 'uit' : ''}"><span class="rij-tekst"><b>${titel}</b><small>${sub}</small></span><input type="checkbox" ${m[k] ? 'checked' : ''} ${uit ? 'disabled' : ''} data-change="module" data-k="${k}"><i></i></label>`;
        return `<p class="zacht">Zet onderdelen aan of uit voor de hele club. Knoppen van uitgezette modules verdwijnen uit de app.</p><div class="lijst">
          ${rij('vervoer', 'Vervoer', 'Rijden en meerijden bij uitwedstrijden')}${rij('taken', 'Taken', 'Spelbegeleider, coach, bardienst, wastas')}${rij('speeltijd', 'Speeltijd', 'Eerlijk wisselschema bij wedstrijden')}${rij('beoordeling', 'Beoordelingen', 'Volgens KNVB-leeftijdscategorie')}${rij('materiaal', 'Materiaal', 'Checklist per team bij de start van het seizoen')}${rij('beloningen', 'Beloningen', 'Later: punten voor meehelpen', true)}</div>
          ${m.materiaal ? h.rij({ ic: 'sliders-horizontal', titel: 'Materiaal instellen', sub: 'Checklist en wie de meldingen krijgt', act: 'open', attrs: 'data-view="materiaalInst"' }) : ''}`;
      },
    },
  };
  CC.on('seizoenOk', (f) => { const S = CC.S(); S.club.seizoen = { start: f.s.value, eind: f.e.value }; S.club.regio = f.r.value; S.club.ingericht.seizoen = true; CC.save(); CC.render(); CC.toast(f.r.value !== 'Noord' ? 'Opgeslagen. In versie 2 worden de vakanties van deze regio opgehaald.' : 'Opgeslagen'); });
  CC.on('vakTrainen', (el) => { const S = CC.S(); S.club.vakanties.find((v) => v.id === el.dataset.id).trainen = el.checked; S.club.ingericht.vakanties = true; CC.save(); CC.render(); });
  CC.on('faseDatum', (el) => { const S = CC.S(); const f = [...S.club.fasen].sort((a, b) => a.van.localeCompare(b.van)); f[Number(el.dataset.k)].van = el.value; S.club.fasen = f; CC.save(); CC.render(); CC.toast('Fase aangepast'); });
  CC.on('stopToevoegen', () => CC.sheet('Stop toevoegen', `<form data-submit="stopOk" class="codeform"><label for="so-n">Naam</label><input id="so-n" name="n" required placeholder="Bijv. Clubtoernooi"><div class="twee"><div><label for="so-v">Van</label><input id="so-v" name="v" type="date" required></div><div><label for="so-t">Tot</label><input id="so-t" name="t" type="date" required></div></div><label class="vink"><input type="checkbox" name="tr"> Wel trainen</label><button class="knop">Toevoegen</button></form>`));
  CC.on('stopOk', (f) => { const S = CC.S(); S.club.stops.push({ id: 's' + Date.now(), naam: f.n.value, van: f.v.value, tot: f.t.value, trainen: f.tr.checked }); CC.save(); CC.closeSheet(); CC.render(); });
  CC.on('regelsOk', (f) => {
    const S = CC.S(); const i = S.club.inst; const n = (x) => Number(f[x].value);
    S.club.privacyContact = f.pc.value.trim();
    Object.assign(i, { deadlineTraining: n('dt'), deadlineWedstrijd: n('dw'), waarschuwingen: { breedte: n('wb'), selectie: n('ws') }, telaat: { breedte: { kort: n('tkb'), seizoen: n('tsb') }, selectie: { kort: n('tks'), seizoen: n('tss') } }, oproepDagen: n('op'), homeDagen: n('hd'), opnemenUur: n('ou'), speeltijdAfwijken: { breedte: f.sab.checked, selectie: f.sas.checked }, wissel: Object.fromEntries(CC.SPEELVORMEN.map(([k, , advies, duur]) => { const v = Number(String(f['w' + k].value).replace(',', '.')); return [k, v >= 3 && v <= duur ? v : advies]; })), waarschuwing: f.w.value, trainer: { deadlineUur: n('tu'), drempel: n('tp'), maxSeizoen: n('ts') }, zones: { breedte: { groen: n('bg'), oranje: n('bo') }, selectie: { groen: n('sg'), oranje: n('so') } } });
    S.club.ingericht.regels = true; CC.save(); CC.render(); CC.toast('Regels opgeslagen voor de hele club');
  });
  CC.on('labelsOk', (f) => { const S = CC.S(); S.club.labels = { hjo: f.h.value || 'HJO', coordinator: f.c.value || 'Coördinator' }; S.club.coordinatorAan = f.ca.checked; S.club.ingericht.rollen = true; CC.save(); CC.render(); CC.toast('Opgeslagen'); });
  CC.on('module', (el) => { const S = CC.S(); S.club.modules[el.dataset.k] = el.checked; S.club.ingericht.modules = true; CC.save(); CC.render(); CC.toast(`${el.dataset.k[0].toUpperCase() + el.dataset.k.slice(1)} ${el.checked ? 'aan' : 'uit'}`); });
})();
