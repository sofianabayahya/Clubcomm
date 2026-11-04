// ClubComm — Besluit 146: de begeleider (HO, TC) bij het pakket Trainers begeleiden.
// Home = Actie nodig + de week van zijn trainers (dagknoppen, bouw, wedstrijden/trainingen, alleen thuis) met "Begeleiden" in 2 tikken.
// Trainers = compacte lijst (één regel per trainer) met een snelvenster; Teams = eigen tabblad (alleen HO).
// Geen nieuwe gegevens of rechten: de begeleider leest datum, tijd, tegenstander en thuis/uit al (Besluit 100), nooit spelers.
(function () {
  const CC = window.CC; const h = CC.h, esc = CC.esc, icon = CC.icon, D = CC.date, M = CC.m;
  const pakket = (S) => !!(CC.pakketTrainers && CC.pakketTrainers(S));
  const rol = () => (CC.rol() || {}).rol;
  const mom = (S) => (S.begeleidMomenten || []).filter((m) => !m.vervallen);
  const trainersVan = (S, tid) => S.people.filter((p) => p.rollen.some((r) => r.rol === 'trainer' && r.teamId === tid));
  const teamsVan = (S, p) => p.rollen.filter((r) => r.rol === 'trainer').map((r) => M.team(S, r.teamId)).filter(Boolean);
  const maandag = (d) => D.addDays(d, -((D.parse(d).getDay() + 6) % 7));
  const focus = (S) => (CC.hoFocus ? CC.hoFocus.focus(S) : 'alle');
  const inFocus = (S, f, tid) => (CC.hoFocus ? CC.hoFocus.inFocus(S, f, tid) : CC.inWerkgebied(S, tid));
  const kort = (d) => { const x = D.parse(d); return `${D.DAG_KORT[x.getDay()]} ${x.getDate()}`; };
  const chip = (key, val, tekst, aan, label) => `<button class="chipknop ${aan ? 'aan' : ''}" aria-pressed="${aan}" data-act="seg" data-key="${key}" data-val="${esc(val)}"${label ? ` aria-label="${esc(label)}"` : ''}>${tekst}</button>`;

  // ---------- De week van je trainers ----------
  // Alleen teams met een trainer in ClubComm (Besluit 136) en in je werkgebied/bouwfilter
  const weekActs = (S, van, f) => { const tot = D.addDays(van, 6);
    return S.acts.filter((a) => a.datum >= van && a.datum <= tot && (a.soort === 'training' || M.isWed(a)) && trainersVan(S, a.teamId).length && inFocus(S, f, a.teamId))
      .sort((a, b) => (a.datum + (a.tijd || '')).localeCompare(b.datum + (b.tijd || ''))); };
  const pastSoort = (a, soort, thuis) => (soort === 'wed' ? M.isWed(a) : soort === 'tr' ? a.soort === 'training' : true) && (!thuis || !M.isWed(a) || a.thuis !== false);
  CC.hoWeek = (S) => {
    const f = focus(S); const soort = h.segVal('hoSoort', 'wed'); const thuis = h.segVal('hoThuis', '') === '1';
    // Niet gekozen: deze week, of de volgende als er deze week vanaf vandaag niets meer is (bijv. op zondag)
    const nu = maandag(D.vandaag()); const rest = weekActs(S, nu, f).some((a) => a.datum >= D.vandaag() && pastSoort(a, soort, thuis));
    const n = CC.ui.seg.hoWk != null ? Number(CC.ui.seg.hoWk) || 0 : rest ? 0 : 1; const van = D.addDays(maandag(D.vandaag()), 7 * n); const dagen = Array.from({ length: 7 }, (_, i) => D.addDays(van, i));
    const alle = weekActs(S, van, f); const zicht = alle.filter((a) => pastSoort(a, soort, thuis));
    const losse = mom(S).filter((m) => !m.actId && m.datum >= van && m.datum <= dagen[6] && inFocus(S, f, m.teamId));
    const telDag = (d) => zicht.filter((a) => a.datum === d).length + losse.filter((m) => m.datum === d).length;
    // Gekozen dag: wat je tikte; anders vandaag (als er iets is), anders de eerste dag met iets in deze week
    const gekozen = (() => { const k = h.segVal('hoDag', ''); if (dagen.includes(k)) return k; const v = D.vandaag();
      if (dagen.includes(v) && telDag(v)) return v; return dagen.find((d) => d >= v && telDag(d)) || dagen.find(telDag) || (dagen.includes(v) ? v : dagen[0]); })();
    const momVan = (a) => mom(S).find((m) => m.actId === a.id);
    const regel = (a) => { const trs = trainersVan(S, a.teamId); const m = momVan(a); const wed = M.isWed(a);
      const waar = wed ? [a.thuis === false ? 'Uit' : 'Thuis', a.tegen ? `tegen ${esc(a.tegen)}` : '', a.veld ? esc(a.veld) : ''].filter(Boolean).join(' · ') : ['Training', a.veld ? esc(a.veld) : ''].filter(Boolean).join(' · ');
      const titel = `${esc(a.tijd || '')} · ${esc(CC.tn(a.teamId))} <span class="zacht">· ${esc(trs.map((p) => p.naam).join(', '))}</span>`;
      if (a.afgelast) return h.rij({ ic: wed ? 'trophy' : 'dumbbell', titel, sub: `${waar} · <b>afgelast</b>`, chevron: false });
      if (m) return h.rij({ ic: 'user-check', titel, sub: `${waar} · <b>${m.klaar ? 'begeleid' : 'begeleidingsmoment gepland'}</b>`, act: 'open', attrs: `data-view="begelMoment" data-id="${esc(m.id)}"`, kleur: m.klaar ? '' : 'blauw' });
      return h.rij({ ic: wed ? 'trophy' : 'dumbbell', titel, sub: waar, act: 'hoBegeleid', attrs: `data-a="${esc(a.id)}"`, rechts: '<span class="ho-begeleid">Begeleiden</span>', chevron: false }); };
    const losRegel = (m) => { const tr = M.persoon(S, m.trainerId) || { naam: '' }; return h.rij({ ic: 'user-check', titel: `${esc(CC.tn(m.teamId))} <span class="zacht">· ${esc(tr.naam)}</span>`, sub: `Begeleidingsmoment (${m.soort === 'wedstrijd' ? 'wedstrijd' : 'training'}, losse datum)`, act: 'open', attrs: `data-view="begelMoment" data-id="${esc(m.id)}"` }); };
    const vandaagRegels = [...zicht.filter((a) => a.datum === gekozen).map(regel), ...losse.filter((m) => m.datum === gekozen).map(losRegel)];
    const weekNaam = n === 0 ? 'Deze week' : n === 1 ? 'Volgende week' : n === -1 ? 'Vorige week' : `Week ${D.weeknr(van)}`;
    return `${h.sectie(`${weekNaam} <span class="zacht">· wk ${D.weeknr(van)}</span>`, `<span class="ho-weeknav"><button class="knop licht klein" data-act="seg" data-key="hoWk" data-val="${n - 1}" aria-label="Vorige week">${icon('chevron-left')}</button><button class="knop licht klein" data-act="seg" data-key="hoWk" data-val="${n + 1}" aria-label="Volgende week">${icon('chevron-right')}</button></span>`)}
      <div class="chips scroll ho-dagen">${dagen.map((d) => { const t = telDag(d); return chip('hoDag', d, `${kort(d)}${t ? ` <span class="ho-tel">${t}</span>` : ''}`, d === gekozen, `${D.lang(d)}: ${t} ${t === 1 ? 'activiteit' : 'activiteiten'}`); }).join('')}</div>
      ${CC.hoFocus ? CC.hoFocus.chips(S, f) : ''}
      <div class="chips scroll">${chip('hoSoort', 'wed', 'Wedstrijden', soort === 'wed')}${chip('hoSoort', 'tr', 'Trainingen', soort === 'tr')}${chip('hoSoort', 'alle', 'Beide', soort === 'alle')}${soort !== 'tr' ? chip('hoThuis', thuis ? '' : '1', 'Alleen thuis', thuis) : ''}</div>
      ${vandaagRegels.length ? `<div class="lijst">${vandaagRegels.join('')}</div>` : `<p class="zacht klein">${D.lang(gekozen)}: geen ${soort === 'wed' ? 'wedstrijden' : soort === 'tr' ? 'trainingen' : 'trainingen of wedstrijden'}${thuis && soort !== 'tr' ? ' thuis' : ''} van je trainers.</p>`}`;
  };
  // Begeleiden in 2 tikken: regel → bevestigen. De trainer krijgt meteen de vragenlijst (zoals bij plannen vanuit het traject).
  CC.on('hoBegeleid', (el) => { const S = CC.S(); const a = M.act(S, el.dataset.a); if (!a) return; const trs = trainersVan(S, a.teamId); if (!trs.length) return;
    const wed = M.isWed(a); const kies = trs.length > 1;
    CC.sheet(`Begeleiden · ${D.lang(a.datum)}`, `<p><b>${wed ? 'Wedstrijd' : 'Training'} ${esc(CC.tn(a.teamId))}</b> · ${esc(a.tijd || '')}${wed ? ` · ${a.thuis === false ? 'uit' : 'thuis'}${a.tegen ? ` tegen ${esc(a.tegen)}` : ''}` : ''}</p>
      <p class="zacht klein">De trainer krijgt meteen de vragenlijst om voor te bereiden. Daarna doorloop je de vijf fasen.</p>
      <div class="knoppen kolom">${trs.map((p) => `<button class="knop ${kies ? 'licht' : ''} vol" data-act="hoBegeleidOk" data-a="${esc(a.id)}" data-id="${esc(p.id)}">${icon('user-check')}${kies ? esc(p.naam) : `Begeleiden: ${esc(p.naam)}`}</button>`).join('')}</div>`); });
  CC.on('hoBegeleidOk', (el) => { const S = CC.S(); if (CC.begelPlanOpAct) CC.begelPlanOpAct(S, el.dataset.id, el.dataset.a); });

  // ---------- Trainers: compacte lijst en snelvenster ----------
  const dos = (S, pid) => ((S.trainerDossier || {})[pid] || {}).traject;
  const traject = (S, pid) => { const t = dos(S, pid); return t && t.actief ? t : null; };
  const gedaan = (S, pid) => mom(S).filter((m) => m.trainerId === pid && m.klaar).length;
  const plan = (t) => (t.plan.wedstrijd || 0) + (t.plan.training || 0);
  const volgende = (S, pid) => mom(S).filter((m) => m.trainerId === pid && !m.klaar && m.datum >= D.vandaag()).sort((a, b) => a.datum.localeCompare(b.datum))[0];
  const kennis = (S, pid) => { const k = (S.trainerKennis || {})[pid] || {}; return k.ingevuld ? 'kennismaking ingevuld' : k.gevraagd ? 'kennismaking gevraagd' : 'kennismaking nog niet gevraagd'; };
  const status = (S, p) => { const t = traject(S, p.id); if (!t) return esc(kennis(S, p.id)); const v = volgende(S, p.id);
    return `<b>traject ${gedaan(S, p.id)}/${plan(t)}</b> · ${v ? `volgend: ${D.kort(v.datum)}` : gedaan(S, p.id) >= plan(t) ? 'plan gehaald' : 'nog plannen'}`; };
  const bouwVan = (S, p) => (CC.bouwVan ? [...new Set(teamsVan(S, p).map((t) => CC.bouwVan(S, t).naam))].join(', ') : '');
  CC.hoTrainerRij = (S, p) => h.rij({ ic: h.avatar(p.naam), titel: `${esc(p.naam)} <span class="zacht">· ${esc(teamsVan(S, p).map((t) => t.naam).join(', '))}</span>`, sub: [esc(bouwVan(S, p)), status(S, p)].filter(Boolean).join(' · '), act: 'hoTrainerSnel', attrs: `data-id="${esc(p.id)}"` });
  CC.hoTrajectRegel = (S, lijst) => { const inT = lijst.filter((p) => traject(S, p.id)); if (!inT.length) return '';
    return `<p class="zacht klein">Traject: ${inT.reduce((n, p) => n + gedaan(S, p.id), 0)} van ${inT.reduce((n, p) => n + plan(traject(S, p.id)), 0)} momenten gedaan dit seizoen.</p>`; };
  CC.on('hoTrainerSnel', (el) => { const S = CC.S(); const p = M.persoon(S, el.dataset.id); if (!p) return; const t = traject(S, p.id);
    const lijst = mom(S).filter((m) => m.trainerId === p.id).sort((a, b) => b.datum.localeCompare(a.datum)); const kom = lijst.filter((m) => !m.klaar).reverse(); const laatst = lijst.filter((m) => m.klaar).slice(0, 1);
    const mRij = (m) => h.rij({ ic: m.klaar ? 'circle-check' : 'calendar-days', titel: `${D.kort(m.datum)} · ${m.soort === 'wedstrijd' ? 'wedstrijd' : 'training'}`, sub: m.klaar ? 'Afgerond' : 'Gepland', act: 'open', attrs: `data-view="begelMoment" data-id="${esc(m.id)}"` });
    CC.sheet(`${esc(p.naam)}`, `<p class="zacht klein">${esc(teamsVan(S, p).map((x) => x.naam).join(', '))}${bouwVan(S, p) ? ` · ${esc(bouwVan(S, p))}` : ''} · ${t ? `traject sinds ${D.kort(t.sinds)}${t.leerdoel ? ` · leerdoel: ${esc(t.leerdoel)}` : ''}` : esc(kennis(S, p.id))}</p>
      ${[...kom, ...laatst].length ? `<div class="lijst compact">${[...kom, ...laatst].map(mRij).join('')}</div>` : ''}
      <div class="knoppen kolom">${t ? `<button class="knop vol" data-act="begelNieuw" data-id="${esc(p.id)}">${icon('plus')}Begeleidingsmoment plannen</button>` : `<button class="knop vol" data-act="trajectSheet" data-id="${esc(p.id)}">${icon('play')}Traject starten</button>`}
        <button class="knop licht vol" data-act="open" data-view="trainerDetail" data-id="${esc(p.id)}">${icon('user')}Volledig dossier</button></div>`); });

  // ---------- Tabbladen: HO = Home · Trainers · Teams · Berichten; TC = Home · Trainers · Berichten ----------
  const wacht = () => {
    if (!CC.rollen || !CC.rollen.hjo || !CC.rollen.tc || !CC.views.teamsBeheer) return setTimeout(wacht, 0);
    const hjoTabs = CC.rollen.hjo.tabs;
    CC.rollen.hjo.tabs = (S) => { const t = hjoTabs(S); if (!pakket(S) || rol() !== 'hjo') return t;
      return [['home', 'Home', 'house'], ['trainers', 'Trainers', 'user-check'], ['teams', 'Teams', 'shield'], t.find((x) => x[0] === 'berichten')].filter(Boolean); };
    const hjoHome = CC.rollen.hjo.schermen.home;
    const home = (S) => `${CC.begelVandaag ? CC.begelVandaag(S) : ''}${CC.hoWeek(S)}`;
    CC.rollen.hjo.schermen.home = (S) => (pakket(S) && rol() === 'hjo' ? home(S) : hjoHome(S));
    const hjoTeams = CC.rollen.hjo.schermen.teams;
    CC.rollen.hjo.schermen.teams = (S) => (pakket(S) && rol() === 'hjo' ? CC.views.teamsBeheer(S).html : hjoTeams(S));
    const tcTabs = CC.rollen.tc.tabs;
    CC.rollen.tc.tabs = (S) => { const t = tcTabs(S); return [['home', 'Home', 'house'], ['trainers', 'Trainers', 'user-check'], t.find((x) => x[0] === 'berichten')].filter(Boolean); };
    CC.rollen.tc.schermen.home = home;
    CC.rollen.tc.schermen.trainers = (S) => CC.rollen.hjo.schermen.trainers(S);
  };
  wacht();
})();
