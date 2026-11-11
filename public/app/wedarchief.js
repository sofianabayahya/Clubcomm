// ClubComm — Besluit NNN: wedstrijdarchief. Het tabblad Wedstrijd heeft Vandaag · Gespeeld · Seizoen.
// Gespeeld: per gespeelde wedstrijd de uitslag (doelpunten met minuut), de basis op positie, de wissels (▲ erin, ▼ eruit)
// en, alleen voor de trainer, de minuten (Besluit 116). Staf kan alles achteraf aanpassen; de seizoensminuten worden dan
// opnieuw uitgerekend zonder dubbel tellen (eerst de oude minuten eraf, dan de nieuwe erbij, zoals bij overnemen).
(function () {
  const CC = window.CC; if (!CC) return; const M = CC.m, D = CC.date, h = CC.h, esc = CC.esc, icon = CC.icon;
  const naam = (S, id) => (M.speler(S, id) || {}).voornaam || 'onbekend';
  const kopie = (x) => JSON.parse(JSON.stringify(x));
  const nieuwId = (p) => `${p}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

  // Gespeeld: niet afgelast en voorbij (vandaag telt mee zodra de uitslag is opgeslagen)
  const gespeeld = (S, teamId) => S.acts.filter((a) => a.teamId === teamId && M.isWed(a) && !a.afgelast
    && (a.datum < D.vandaag() || (a.datum === D.vandaag() && a.uitslagKlaar))).sort((x, y) => y.datum.localeCompare(x.datum) || String(y.tijd).localeCompare(String(x.tijd)));
  const plekTekst = (a) => (a.soort === 'oefen' ? 'oefen' : a.thuis === false ? 'uit' : 'thuis');
  const uitslagVan = (a) => { if (a.uitslag) return a.uitslag; if (!(a.goals || []).length) return ''; const st = M.stand(a); return `${st.thuis}-${st.uit}`; };
  const posVolgorde = (sch) => (M.POSITIES[sch.systeem] || []).map(([p]) => p).sort((x, y) => Number(x) - Number(y));

  // Basis en wissels uit het schema; een eigen schema (Besluit 106) heeft ze al, het eerlijke schema leiden we af uit de blokken
  const verloop = (sch) => {
    if (!sch) return null;
    if (sch.zelf) {
      const pos = posVolgorde(sch); const extra = Object.keys(sch.opstelling || {}).filter((p) => !pos.includes(p));
      return { basis: [...pos, ...extra].map((p) => ({ pos: p, id: (sch.opstelling || {})[p] || null })),
        wissels: (sch.wissels || []).slice().sort((x, y) => x.min - y.min) };
    }
    const len = M.schemaLengtes(sch); const vanaf = (i) => Math.round(len.slice(0, i).reduce((s, x) => s + x, 0) * 10) / 10;
    const b0 = sch.blokken[0] || []; const kp = sch.keepers && sch.keepers[0];
    const basis = [kp, ...b0.filter((x) => x !== kp)].filter(Boolean).map((id, i) => ({ pos: String(i + 1), id }));
    const wissels = [];
    sch.blokken.forEach((b, i) => { if (!i) return; const vorig = sch.blokken[i - 1]; const erin = b.filter((x) => !vorig.includes(x)); const eruit = vorig.filter((x) => !b.includes(x));
      erin.forEach((id, j) => wissels.push({ id: `b${i}-${j}`, min: vanaf(i), in: id, uit: eruit[j] || null })); });
    return { basis, wissels };
  };
  const minuten = (sch) => { if (!sch) return {}; const c = kopie(sch); if (c.zelf) M.zelfAfleiden(c); return M.schemaMinuten(c); };
  const minTekst = (sch, m) => (sch && m === (sch.helft || sch.wedMin / 2) ? 'rust' : `${M.minTekst(m)}'`);
  const magAanpassen = (S, a) => !!CC.me() && M.stafVan(S, a.teamId).includes(CC.me().id) && (CC.rol() || {}).rol !== 'ouder';

  // ---------- Lijst Gespeeld ----------
  const lijst = (S, teamId) => {
    const w = gespeeld(S, teamId);
    const groepen = []; w.forEach((a) => { const d = D.parse(a.datum); const k = `${d.getFullYear()}-${d.getMonth()}`; let g = groepen.find((x) => x.k === k);
      if (!g) { g = { k, naam: d.toLocaleDateString('nl-NL', { month: 'long' }), r: [] }; groepen.push(g); } g.r.push(a); });
    const rij = (a) => { const sch = S.speeltijd.schema[a.id]; const v = verloop(sch);
      const sub = [esc(a.tegen || 'Tegenstander onbekend'), v ? `${v.basis.filter((x) => x.id).length} in de basis` : 'geen opstelling', v ? `${v.wissels.length} ${v.wissels.length === 1 ? 'wissel' : 'wissels'}` : ''].filter(Boolean).join(' · ');
      return h.rij({ titel: `${D.kort(a.datum)} · ${plekTekst(a)}`, sub, rechts: uitslagVan(a) ? `<b class="arch-uitslag">${esc(uitslagVan(a))}</b>` : '', act: 'open', attrs: `data-view="wedArchief" data-id="${a.id}"` }); };
    const volg = M.komend(S, teamId, 10).find((a) => M.isWed(a) && !a.afgelast && a.datum >= D.vandaag());
    const komend = volg ? `${h.sectie('Komend')}<div class="lijst">${h.rij({ titel: `${D.kort(volg.datum)} · ${plekTekst(volg)}`, sub: S.speeltijd.schema[volg.id] ? 'Opstelling gemaakt' : 'Opstelling nog niet gemaakt', act: 'wedNaarVandaag', attrs: `data-id="${volg.id}"` })}</div>` : '';
    if (!w.length) return `${h.leeg('Nog geen gespeelde wedstrijden', 'timer')}${komend}`;
    return `<p class="zacht klein">Tik een wedstrijd: wie begon, wie wisselde${CC.zietMinuten() ? ' en de minuten' : ''}. Na de wedstrijd kun je alles nog aanpassen.</p>
      ${groepen.map((g) => `${h.sectie(esc(g.naam.charAt(0).toUpperCase() + g.naam.slice(1)))}<div class="lijst">${g.r.map(rij).join('')}</div>`).join('')}${komend}`;
  };
  CC.on('wedNaarVandaag', (el) => { CC.ui.seg.wedDeel = 'vandaag'; CC.ui.seg.stWed = el.dataset.id; CC.render(); });

  // Het tabblad: Vandaag (zoals altijd, zonder seizoen) · Gespeeld · Seizoen
  CC.wedTab = (S, teamId) => { const deel = h.segVal('wedDeel', 'vandaag');
    const inhoud = deel === 'gespeeld' ? lijst(S, teamId) : deel === 'seizoen' ? CC.speeltijdHtml(S, teamId, { deel: 'seizoen' }) : CC.speeltijdHtml(S, teamId, { deel: 'wed' });
    return `${h.seg('wedDeel', [['vandaag', 'Vandaag'], ['gespeeld', 'Gespeeld'], ['seizoen', 'Seizoen']], 'vandaag')}${inhoud}`; };
  if (CC.rollen.trainer && CC.rollen.trainer.schermen) CC.rollen.trainer.schermen.speeltijd = (S) => CC.wedTab(S, CC.teamId());
  CC.views.speeltijd = (S, p) => ({ titel: 'Speeltijd', html: CC.wedTab(S, p.team) });

  // ---------- Eén wedstrijd ----------
  const goalChips = (S, a, goals) => goals.map((g, i) => { const tus = goals.slice(0, i + 1); const w = tus.filter((y) => y.wij).length, z = tus.length - w; const ts = a.thuis === false ? `${z}-${w}` : `${w}-${z}`;
    const wie = g.wij ? (g.spelerId ? naam(S, g.spelerId) : g.eigen ? 'eigen doelpunt tegenstander' : '') : '';
    return `<span class="chip ${g.wij ? 'groen' : 'grijs'}">${g.min != null ? `${esc(String(g.min))}' ` : ''}${ts}${wie ? ` ${esc(wie)}` : ''}</span>`; }).join('');
  CC.views.wedArchief = (S, p) => { const a = M.act(S, p.id); if (!a) return { titel: 'Wedstrijd', html: h.leeg('Deze wedstrijd bestaat niet meer') };
    const sch = S.speeltijd.schema[a.id]; const v = verloop(sch); const mins = CC.zietMinuten() ? minuten(sch) : null; const goals = a.goals || [];
    const kop = `<div class="kaart-kop los">${h.datumBlok(a)}<div><b>${D.kort(a.datum)} · ${plekTekst(a)}</b><small>tegen ${esc(a.tegen || 'onbekend')}</small></div></div>`;
    const u = uitslagVan(a);
    const stand = `<div class="kaartje arch-stand"><p class="groot-cijfer">${u ? esc(u.replace('-', ' – ')) : '–'}</p><p class="zacht klein midden">${a.uitslagKlaar ? `uitslag opgeslagen · ${a.uitslagVerstuurd ? 'naar de ouders gestuurd' : 'niet naar de ouders gestuurd'}` : 'uitslag nog niet opgeslagen'}</p>${goals.length ? `<div class="sb-goals">${goalChips(S, a, goals)}</div>` : ''}</div>`;
    const m = (id) => (mins && id && mins[id] != null ? `<b>${M.minTekst(mins[id])}'</b>` : '');
    const basis = v ? `${h.sectie('Basis')}<div class="lijst compact">${v.basis.filter((x) => x.id).map((x) => h.rij({ ic: `<span class="arch-nr">${esc(x.pos)}</span>`, titel: `${esc(naam(S, x.id))}${x.pos === '1' ? ' <span class="zacht">(keeper)</span>' : ''}`, sub: sch.zelf && sch.systeem && x.pos !== '1' ? esc(M.posNaam(sch.systeem, x.pos)) : '', rechts: m(x.id) })).join('')}</div>` : '';
    const basisIds = v ? v.basis.map((x) => x.id) : [];
    const wissels = v ? `${h.sectie('Wissels')}${v.wissels.length ? `<div class="lijst compact">${v.wissels.map((w) => h.rij({ ic: `<span class="arch-min">${minTekst(sch, w.min)}</span>`,
      titel: `<span class="arch-in">▲ ${esc(naam(S, w.in))}</span> erin · <span class="arch-uit">▼ ${esc(w.uit ? naam(S, w.uit) : '–')}</span> eruit`, rechts: basisIds.includes(w.in) ? '' : m(w.in) })).join('')}</div>` : '<p class="zacht klein">Geen wissels.</p>'}` : '';
    const leeg = v ? '' : `<p class="zacht klein">Voor deze wedstrijd is geen opstelling vastgelegd.${magAanpassen(S, a) ? ' Met Aanpassen leg je de basis en de wissels alsnog vast.' : ''}</p>`;
    const knop = magAanpassen(S, a) ? `<button class="knop vol" data-act="wedAanpassen" data-id="${a.id}">${icon('pencil')}Aanpassen</button>` : '';
    return { titel: 'Wedstrijd', html: `${kop}${stand}${basis}${wissels}${leeg}${knop}` }; };

  // ---------- Aanpassen (staf) ----------
  // Werkkopie in CC.ui.wedEdit; pas bij Opslaan gaat het naar de wedstrijd en het schema
  const sjabloon = (S, a) => { const c = CC.categorie(M.wedCat(S, a.teamId)); return { zelf: true, systeem: '1-4-3-3', opstelling: {}, wissels: [], klok: {}, wedMin: c.duur, helft: c.helft, vorm: c.vorm, opVeld: c.opVeld, bevestigd: false }; };
  const naarZelf = (S, a, sch) => { if (!sch) return sjabloon(S, a); if (sch.zelf) return kopie(sch);
    // Eerlijk schema: omzetten naar basis + wissels (posities op volgorde, keeper op 1)
    const v = verloop(sch); const nw = Object.assign(sjabloon(S, a), { wedMin: sch.wedMin || M.schemaLengtes(sch).reduce((x, y) => x + y, 0), systeem: null });
    v.basis.forEach((x) => { nw.opstelling[x.pos] = x.id; }); nw.wissels = v.wissels.filter((w) => w.uit).map((w) => ({ id: nieuwId('w'), min: w.min, in: w.in, uit: w.uit })); nw.spelers = sch.spelers; return nw; };
  const editor = () => { const S = CC.S(); const e = CC.ui.wedEdit; const a = M.act(S, e.actId); if (!a) return;
    const spelers = M.spelers(S, a.teamId).slice().sort((x, y) => x.voornaam.localeCompare(y.voornaam));
    const opt = (gekozen, leegLabel) => `<option value="">${leegLabel}</option>${spelers.map((pl) => `<option value="${pl.id}" ${pl.id === gekozen ? 'selected' : ''}>${esc(pl.voornaam)}</option>`).join('')}`;
    const posities = e.sch.systeem ? posVolgorde(e.sch) : Array.from({ length: e.sch.opVeld || 11 }, (_, i) => String(i + 1));
    const minOpt = (m) => Array.from({ length: Math.max(1, (e.sch.wedMin || 60) - 1) }, (_, i) => i + 1).map((x) => `<option value="${x}" ${x === m ? 'selected' : ''}>${x === (e.sch.helft || e.sch.wedMin / 2) ? 'rust' : x}</option>`).join('');
    let body;
    if (e.deel === 'basis') body = `<div class="arch-velden">${posities.map((p) => `<label class="arch-veld"><span class="arch-nr">${esc(p)}</span><span class="arch-lab">${esc(e.sch.systeem ? M.posNaam(e.sch.systeem, p) : p === '1' ? 'Keeper' : `Plek ${p}`)}</span>
      <select class="kies" data-change="wedEdBasis" data-pos="${esc(p)}" aria-label="Positie ${esc(p)}">${opt(e.sch.opstelling[p], 'Kies speler')}</select></label>`).join('')}</div>`;
    else if (e.deel === 'goals') body = `${e.goals.map((g, i) => { const waarde = !g.wij ? 'tegen' : g.spelerId ? g.spelerId : g.eigen ? 'eigen' : 'wij';
      return `<div class="arch-rij"><input class="kies" type="number" inputmode="numeric" min="0" max="${e.sch.wedMin || 90}" value="${g.min ?? ''}" placeholder="min" aria-label="Minuut doelpunt ${i + 1}" data-change="wedEdGoalMin" data-i="${i}">
        <select class="kies" data-change="wedEdGoalWie" data-i="${i}" aria-label="Doelpunt ${i + 1}"><option value="tegen" ${waarde === 'tegen' ? 'selected' : ''}>Tegen</option><option value="wij" ${waarde === 'wij' ? 'selected' : ''}>Wij (maker onbekend)</option><option value="eigen" ${waarde === 'eigen' ? 'selected' : ''}>Eigen doelpunt tegenstander</option>${spelers.map((pl) => `<option value="${pl.id}" ${pl.id === waarde ? 'selected' : ''}>${esc(pl.voornaam)}</option>`).join('')}</select>
        <button class="icoonknop" data-act="wedEdWeg" data-soort="goals" data-i="${i}" aria-label="Doelpunt ${i + 1} weghalen">${icon('x')}</button></div>`; }).join('') || '<p class="zacht klein">Nog geen doelpunten.</p>'}
      <button class="knop licht vol" data-act="wedEdBij" data-soort="goals">${icon('plus')}Doelpunt toevoegen</button>`;
    else body = `${e.sch.wissels.length ? `<div class="arch-rij arch-kop"><span>Minuut</span><span>▲ Erin</span><span>▼ Eruit</span><span></span></div>` : ''}${e.sch.wissels.map((w, i) => `<div class="arch-rij">
        <select class="kies" data-change="wedEdWisMin" data-i="${i}" aria-label="Minuut wissel ${i + 1}">${minOpt(w.min)}</select>
        <select class="kies" data-change="wedEdWisIn" data-i="${i}" aria-label="Erin bij wissel ${i + 1}">${opt(w.in, 'Erin')}</select>
        <select class="kies" data-change="wedEdWisUit" data-i="${i}" aria-label="Eruit bij wissel ${i + 1}">${opt(w.uit, 'Eruit')}</select>
        <button class="icoonknop" data-act="wedEdWeg" data-soort="wissels" data-i="${i}" aria-label="Wissel ${i + 1} weghalen">${icon('x')}</button></div>`).join('') || '<p class="zacht klein">Nog geen wissels.</p>'}
      <button class="knop licht vol" data-act="wedEdBij" data-soort="wissels">${icon('plus')}Wissel toevoegen</button>`;
    CC.sheet('Wedstrijd aanpassen', `<p class="zacht klein kaart-sub">${D.kort(a.datum)} · ${h.actTitel(S, a)}</p>
      ${h.seg('wedEdDeel', [['basis', 'Basis'], ['wissels', 'Wissels'], ['goals', 'Doelpunten']], e.deel)}
      ${body}<p class="zacht klein">Na opslaan rekent ClubComm de minuten van deze wedstrijd en van het seizoen opnieuw uit. Een wissel of doelpunt weghalen: tik op het kruisje.</p>
      <button class="knop vol" data-act="wedEdOpslaan">${icon('circle-check')}Opslaan</button>`, { groot: true }); };
  CC.wedEditor = editor;
  CC.on('wedAanpassen', (el) => { const S = CC.S(); const a = M.act(S, el.dataset.id); if (!a || !magAanpassen(S, a)) return;
    CC.ui.wedEdit = { actId: a.id, deel: 'wissels', sch: naarZelf(S, a, S.speeltijd.schema[a.id]), goals: kopie(a.goals || []) };
    CC.ui.seg.wedEdDeel = 'wissels'; editor(); });
  // De segmentknop in het venster: ui.seg wordt gezet door 'seg' (core.js), daarna tekent render het scherm; het venster volgt hier
  const render0 = CC.render;
  CC.render = (...x) => { const uit = render0(...x); const e = CC.ui.wedEdit; const open = document.querySelector('#sheet [aria-label="Wedstrijd aanpassen"]');
    if (e && open && CC.ui.seg.wedEdDeel && CC.ui.seg.wedEdDeel !== e.deel) { e.deel = CC.ui.seg.wedEdDeel; editor(); } return uit; };
  const wijzig = (fn) => (el) => { const e = CC.ui.wedEdit; if (!e) return; fn(e, el, Number(el.dataset.i)); editor(); };
  CC.on('wedEdBasis', wijzig((e, el) => { const p = el.dataset.pos; const oud = e.sch.opstelling[p];
    // Dezelfde speler op een andere plek: de twee ruilen, zodat niemand twee keer in de basis staat
    const ander = Object.keys(e.sch.opstelling).find((q) => q !== p && el.value && e.sch.opstelling[q] === el.value); if (ander) e.sch.opstelling[ander] = oud || null;
    e.sch.opstelling[p] = el.value || null; }));
  CC.on('wedEdWisMin', wijzig((e, el, i) => { e.sch.wissels[i].min = Number(el.value); }));
  CC.on('wedEdWisIn', wijzig((e, el, i) => { e.sch.wissels[i].in = el.value || null; }));
  CC.on('wedEdWisUit', wijzig((e, el, i) => { e.sch.wissels[i].uit = el.value || null; }));
  CC.on('wedEdGoalMin', wijzig((e, el, i) => { const v = String(el.value).trim(); if (v === '') delete e.goals[i].min; else e.goals[i].min = Math.max(0, Math.round(Number(v))); }));
  CC.on('wedEdGoalWie', wijzig((e, el, i) => { const g = e.goals[i]; const v = el.value; g.wij = v !== 'tegen'; g.eigen = v === 'eigen'; g.spelerId = ['tegen', 'wij', 'eigen'].includes(v) ? null : v; }));
  CC.on('wedEdWeg', wijzig((e, el, i) => { (el.dataset.soort === 'goals' ? e.goals : e.sch.wissels).splice(i, 1); }));
  CC.on('wedEdBij', wijzig((e, el) => { if (el.dataset.soort === 'goals') e.goals.push({ id: nieuwId('g'), wij: true, spelerId: null });
    else { const laatste = e.sch.wissels[e.sch.wissels.length - 1]; e.sch.wissels.push({ id: nieuwId('w'), min: laatste ? laatste.min : (e.sch.helft || 30), in: null, uit: null }); } }));

  // Controle vóór opslaan: wissels in volgorde afspelen vanaf de basis
  const controle = (S, sch) => { const ids = Object.values(sch.opstelling).filter(Boolean);
    if (new Set(ids).size !== ids.length) return 'Iemand staat twee keer in de basis';
    const st = { ...sch.opstelling };
    for (const w of sch.wissels.slice().sort((x, y) => x.min - y.min)) {
      if (!w.in || !w.uit) return `Kies bij de wissel van minuut ${w.min} wie erin en wie eruit gaat`;
      const pos = Object.keys(st).find((p) => st[p] === w.uit);
      if (!pos) return `${naam(S, w.uit)} staat op minuut ${w.min} niet in het veld`;
      if (Object.values(st).includes(w.in)) return `${naam(S, w.in)} staat op minuut ${w.min} al in het veld`;
      st[pos] = w.in; }
    return ''; };
  CC.on('wedEdOpslaan', () => { const S = CC.S(); const e = CC.ui.wedEdit; if (!e) return; const a = M.act(S, e.actId); if (!a || !magAanpassen(S, a)) return;
    const fout = controle(S, e.sch); if (fout) return CC.toast(fout, 'fout');
    const oud = S.speeltijd.schema[a.id];
    // Besluit NNN: eerst de oude minuten van het seizoen af, dan de nieuwe erbij (niet dubbel tellen)
    if (oud && oud.bevestigd) CC.speeltijdTerug(S, a, oud);
    const nw = kopie(e.sch); nw.wissels = nw.wissels.slice().sort((x, y) => x.min - y.min); nw.bevestigd = false; nw.aangepastNa = new Date().toISOString();
    nw.spelers = [...new Set([...((oud && oud.spelers) || []), ...Object.values(nw.opstelling).filter(Boolean), ...nw.wissels.map((w) => w.in)])];
    M.zelfAfleiden(nw); S.speeltijd.schema[a.id] = nw;
    if (Object.values(nw.opstelling).some(Boolean)) CC.wedstrijdVastleggen(S, a, CC.me().id);
    const goals = e.goals.slice(); if (goals.every((g) => g.min != null)) goals.sort((x, y) => x.min - y.min);
    a.goals = goals; if (a.uitslagKlaar || a.uitslag) { const st = M.stand(a); a.uitslag = `${st.thuis}-${st.uit}`; }
    delete CC.ui.wedEdit; CC.save(); CC.closeSheet(); CC.render(); CC.toast('Opgeslagen. Minuten opnieuw uitgerekend.'); });
})();
