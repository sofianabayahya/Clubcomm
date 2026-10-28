// ClubComm — periodisering en methodiek bij trainingen (Besluit 133). Alleen actief als het opleidingsprofiel van de club
// voetbalproblemen en leerniveaus heeft (DCG); andere clubs (KNVB-standaard) merken er niets van.
// - Methodiekblok per training (weekformat uit het kerndocument), compact met uitklap; status Gepland/Uitgewerkt/Gegeven (berekend).
// - Periodisering laden uit een CSV (Excel) met voorbeeld vooraf: alleen echte trainingen van het team, niets overschrijven,
//   terugdraaien alleen voor concepten die niet zijn aangepast.
// - Observatiepunten bij de wedstrijd (max. 3), uitkomst Gezien/Deels/Niet gezien/Niet beoordeeld, als bespreekpunt in de week erna.
(function () {
  const CC = window.CC; const D = CC.date, M = CC.m, h = CC.h, icon = CC.icon, esc = CC.esc;
  const T = () => CC.tr;
  const actief = (S) => { const t = T(); return !!(t && t.ond(S, 'voetbalproblemen') && t.niveaus(S).length); };
  const problemen = (S) => (T().ond(S, 'voetbalproblemen') || {}).items || [];
  const ketens = (S) => (T().ond(S, 'handelingsketens') || {}).items || [];
  const probleem = (S, id) => problemen(S).find((x) => x.id === id) || null;
  const maandag = (datum) => { const x = D.parse(datum); return D.addDays(datum, -((x.getDay() + 6) % 7)); };
  const weekId = (tid, datum) => `wk-${tid || 'los'}-${maandag(datum)}`;
  const weekPlan = (S, tid, datum) => T().plannen(S).find((p) => p.week && p.id === weekId(tid, datum) && p.eigenaar === T().ik()) || null;
  const nieuwWeek = (S, tid, datum, bron) => { const p = { id: weekId(tid, datum), week: true, teamId: tid, datum: maandag(datum), eigenaar: T().ik(), methodiek: {}, wedstrijd: null, ...(bron ? { bron } : {}) }; T().plannen(S).push(p); return p; };
  // Methodiek van een training: eerst wat bij de training zelf staat, aangevuld met het weekplan
  const methodiek = (S, p) => { if (!p) return {}; const a = T().actVan(S, p); const w = a.datum ? weekPlan(S, p.teamId || a.teamId, a.datum) : null; const wm = (w && w.methodiek) || {}, pm = p.methodiek || {}; const m = { ...wm, ...pm };
    // Contrathema (optioneel): hoort bij de week en verschijnt als voorstel, tenzij bij deze training zelf gekozen
    if (!pm.contraGekozen && !pm.contra && !pm.contraTekst) { m.contra = wm.contra || null; m.contraTekst = wm.contraTekst || ''; }
    return m; };

  // ---------- Status: berekend, nooit ingevuld ----------
  // Gegeven = training is gegeven; Uitgewerkt = elke plek heeft een vorm (spacing: een naam of vorm) en elke vorm een tekening of organisatie; anders Gepland
  CC.trStatusVan = (S, p) => { if (!p || p.week) return null; if (p.gegeven) return 'gegeven';
    const o = p.onderdelen || []; const vol = o.length && o.every((x) => { if (x.spacing && !x.vormId) return !!String(x.naam || '').trim(); const v = x.vormId && T().vorm(S, x.vormId); return v && (v.tekening || String(v.organisatie || '').trim()); });
    return vol ? 'uitgewerkt' : 'gepland'; };
  const STAT = { gepland: ['Gepland', 'g'], uitgewerkt: ['Uitgewerkt', 'u'], gegeven: ['Gegeven', 'v'] };
  CC.trStatus = (S, p) => { if (!actief(S)) return ''; const s = CC.trStatusVan(S, p); return s ? ` <span class="tr-stat ${STAT[s][1]}">${STAT[s][0]}</span>` : ''; };

  // ---------- Methodiekblok (compact; de rest van het weekformat klapt uit) ----------
  const nv = (S, ids) => (ids || []).map((x) => T().niveauNaam(S, x)).filter(Boolean).join(' → ');
  const vorigeAanpassing = (S, p, m) => { const a = T().actVan(S, p); const pr = m.probleem || null; const A = T().blokDoel(S, p, 'A');
    return T().plannen(S).filter((x) => x !== p && !x.week && x.eigenaar === T().ik() && x.anders && String(T().actVan(S, x).datum) < String(a.datum) && (pr ? methodiek(S, x).probleem === pr : A && T().blokDoel(S, x, 'A') === A))
      .sort((x, y) => String(T().actVan(S, y).datum).localeCompare(String(T().actVan(S, x).datum)))[0] || null; };
  CC.trMethodiek = (S, p, a, tel) => { if (!actief(S) || !p || p.week) return '';
    const m = methodiek(S, p); const pr = probleem(S, m.probleem); const A = T().blokDoel(S, p, 'A'), B = T().blokDoel(S, p, 'B');
    const leeg = !pr && !m.probleemTekst && !A && !B && !(m.niveaus || []).length && !m.gedrag;
    if (leeg) return tel ? '' : `<button class="knop licht vol tr-methknop" data-act="tpMethodiek" data-id="${esc(a.id)}">${icon('list-checks')}Methodiek toevoegen (probleem, gereedschappen, leerniveau, gedrag)</button>`;
    const vorig = vorigeAanpassing(S, p, m); const w = a.datum ? weekPlan(S, p.teamId || a.teamId, a.datum) : null;
    const rij = (n, x) => (x ? `<span>${n}</span><b>${esc(x)}</b>` : '');
    const ketenN = (ketens(S).find((k) => k.id === m.keten) || {}).naam || m.ketenTekst;
    const rest = [rij('Handelingsketen', ketenN), rij('Relevante informatie', m.informatie), rij('Leerroute', m.route), rij('Transfermoment', m.transfer), rij('Technische onderbouw', m.onderbouw), rij('Observatie', m.observatie), rij('Fase', m.fase)].join('');
    return `<div class="tr-meth">
      <div class="tr-meth-kop"><b>${pr ? `${esc(pr.id.slice(3))} · ${esc(pr.naam)}` : esc(m.probleemTekst || 'Voetbalprobleem nog kiezen')}</b>${tel ? '' : `<button class="icoonknop" data-act="tpMethodiek" data-id="${esc(a.id)}" aria-label="Methodiek aanpassen">${icon('pencil')}</button>`}</div>
      <small>${[A ? `A ${esc(T().ldNaam(S, A))}` : '', B ? `B ${esc(T().ldNaam(S, B))}` : ''].filter(Boolean).join(' · ')}${(m.niveaus || []).length ? ` <span class="tr-niv">${esc(nv(S, m.niveaus))}</span>` : ''}</small>
      ${m.gedrag ? `<p class="tr-gedrag"><b>Gedrag:</b> ${esc(m.gedrag)}</p>` : ''}
      ${m.contra || m.contraTekst ? `<small class="tr-contra">Contrathema (andere partij): ${esc((probleem(S, m.contra) || {}).naam || m.contraTekst)}${m.contraGekozen ? '' : ' · <i>voorstel</i>'}</small>` : ''}
      ${vorig ? `<p class="tr-vorig"><b>Voorstel van ${esc(T().dagNaam(T().actVan(S, vorig)))}:</b> ${esc(vorig.anders)} <small>(niet automatisch doorgevoerd)</small></p>` : ''}
      ${rest || (w && w.methodiek && w.methodiek.week) ? `<details class="tr-meth-meer"><summary>Onderbouwing (weekformat)</summary><div class="tr-meth-r">${w && w.methodiek && w.methodiek.week ? rij('Fase · week', `${w.methodiek.fase || ''} ${w.methodiek.week}`.trim()) : ''}${rest}</div></details>` : ''}
    </div>`; };
  // Venster om de methodiek van deze training aan te passen (blijft bij deze training; het weekplan blijft zoals het is)
  const sel = (naam, opties, w, leegTekst) => `<select name="${naam}"><option value="">${leegTekst || '—'}</option>${opties.map(([v, n]) => `<option value="${esc(v)}" ${v === w ? 'selected' : ''}>${esc(n)}</option>`).join('')}</select>`;
  CC.on('tpMethodiek', (el) => { const S = CC.S(); const p = T().plan(S, el.dataset.id); if (!p) return; const m = methodiek(S, p);
    const lds = T().leerdoelen(S).map((l) => [l.id, l.naam]);
    CC.sheet('Methodiek van deze training', `<form class="codeform" data-autosave="tpMeth" data-id="${esc(el.dataset.id)}">
      <label>Centraal voetbalprobleem</label>${sel('probleem', problemen(S).map((x) => [x.id, `${x.id.slice(3)} · ${x.naam}`]), m.probleem)}
      <label>Contrathema (optioneel, voor de andere partij)</label>${sel('contra', problemen(S).map((x) => [x.id, `${x.id.slice(3)} · ${x.naam}`]), m.contra, 'Geen')}
      <div class="twee"><div><label>Hoofdgereedschap A</label>${sel('hg1', lds, T().blokDoel(S, p, 'A'))}</div><div><label>Hoofdgereedschap B</label>${sel('hg2', lds, T().blokDoel(S, p, 'B'))}</div></div>
      <fieldset class="tr-chips"><legend>Beoogd leerniveau (één of twee)</legend>${T().niveaus(S).map((x) => `<label class="tr-chip"><input type="checkbox" name="niv" value="${esc(x.id)}" ${(m.niveaus || []).includes(x.id) ? 'checked' : ''}><span>${esc(x.naam)}</span></label>`).join('')}</fieldset>
      <label for="pm-g">Gewenst gedrag (één zin)</label><textarea id="pm-g" name="gedrag" rows="2">${esc(m.gedrag || '')}</textarea>
      <details class="uitklap tr-precies"><summary>Onderbouwing (weekformat)</summary>
        <label>Handelingsketen</label>${sel('keten', ketens(S).map((k) => [k.id, k.naam]), m.keten)}
        <label for="pm-i">Relevante informatie</label><input id="pm-i" name="informatie" value="${esc(m.informatie || '')}">
        <label for="pm-r">Leerroute</label><input id="pm-r" name="route" value="${esc(m.route || '')}" placeholder="Bijv. gerichte vorm → 3v2 → SSG">
        <label for="pm-t">Transfermoment</label><input id="pm-t" name="transfer" value="${esc(m.transfer || '')}">
        <label for="pm-o">Technische onderbouw</label><input id="pm-o" name="onderbouw" value="${esc(m.onderbouw || '')}">
        <label for="pm-b">Observatiecriteria</label><input id="pm-b" name="observatie" value="${esc(m.observatie || '')}"><p></p></details>
      <button type="button" class="knop vol" data-act="sluitRender">Klaar</button></form>`, { groot: true }); });
  CC.autosave.tpMeth = (f) => { const S = CC.S(); const p = T().plan(S, f.dataset.id); if (!p) return;
    const m = p.methodiek = { ...(p.methodiek || {}) };
    ['probleem', 'keten'].forEach((k) => { m[k] = f.elements[k].value || null; });
    const c = f.elements.contra.value || null; if (c !== (methodiek(S, p).contra || null) || m.contraGekozen) { m.contra = c; m.contraGekozen = true; }
    ['gedrag', 'informatie', 'route', 'transfer', 'onderbouw', 'observatie'].forEach((k) => { m[k] = f.elements[k].value.trim(); });
    m.niveaus = [...f.querySelectorAll('input[name="niv"]:checked')].map((x) => x.value);
    p.blokDoel = { ...(p.blokDoel || {}), A: f.elements.hg1.value || null, B: f.elements.hg2.value || null };
    const pr = probleem(S, m.probleem); if (pr && (!p.thema || p.thema === (p.importThema || ''))) { p.thema = pr.naam; p.importThema = pr.naam; } };

  // ---------- Observatiepunten bij de wedstrijd (max. 3) en bespreekpunten in de week erna ----------
  const UITKOMST = ['Gezien', 'Deels', 'Niet gezien', 'Niet beoordeeld'];
  CC.trObservatie = (S, a) => { if (!actief(S)) return ''; const w = weekPlan(S, a.teamId, a.datum); const wd = w && w.wedstrijd && w.wedstrijd.actId === a.id ? w.wedstrijd : null; const pun = (wd && wd.punten) || [];
    const pr = probleem(S, (w && w.methodiek && w.methodiek.probleem) || null);
    return `<div class="kaartje tr-obsw"><b>Observatiepunten${pr ? ` · ${esc(pr.naam)}` : ''}</b><small class="zacht">Concept, gekoppeld aan het weekprobleem. Geen conclusie over beheersing; bespreekpunt voor de week erna.</small>
      ${pun.map((x, i) => `<div class="tr-ev"><b>${esc(x.tekst)}</b><div class="chips">${UITKOMST.map((u) => `<button type="button" class="chipknop ${x.uitkomst === u ? 'aan' : ''}" aria-pressed="${x.uitkomst === u}" data-act="obsUitkomst" data-id="${esc(a.id)}" data-i="${i}" data-w="${u}">${u}</button>`).join('')}<button type="button" class="icoonknop" data-act="obsPuntWeg" data-id="${esc(a.id)}" data-i="${i}" aria-label="Weghalen">${icon('trash-2')}</button></div></div>`).join('')}
      ${pun.length < 3 ? `<button class="knop licht vol" data-act="obsPuntNieuw" data-id="${esc(a.id)}">${icon('plus')}Observatiepunt (${pun.length} van max. 3)</button>` : ''}</div>`; };
  const wedVan = (S, a, maken) => { let w = weekPlan(S, a.teamId, a.datum); if (!w && maken) w = nieuwWeek(S, a.teamId, a.datum); if (!w) return null; if (!w.wedstrijd || w.wedstrijd.actId !== a.id) { if (!maken) return null; w.wedstrijd = { actId: a.id, punten: [] }; } return w.wedstrijd; };
  CC.on('obsPuntNieuw', (el) => { const S = CC.S(); const a = M.act(S, el.dataset.id); if (!a) return; const w = weekPlan(S, a.teamId, a.datum); const pr = probleem(S, (w && w.methodiek && w.methodiek.probleem) || null);
    CC.sheet('Observatiepunt', `<form data-submit="obsPuntOk" data-id="${esc(a.id)}" class="codeform"><label for="ob-t">Wat wil je zien?</label><input id="ob-t" name="tekst" required maxlength="120" placeholder="${esc(pr ? pr.centraleVraag : 'Bijv. speelt na de aanname vooruit')}">${pr ? `<small class="zacht">Weekprobleem: ${esc(pr.naam)}</small>` : ''}<button class="knop vol">Toevoegen</button></form>`); });
  CC.on('obsPuntOk', (f) => { const S = CC.S(); const a = M.act(S, f.dataset.id); if (!a) return; const wd = wedVan(S, a, true); if (wd.punten.length >= 3) return;
    wd.punten.push({ id: T().nieuwId('ob'), tekst: f.tekst.value.trim(), uitkomst: null }); CC.save(); CC.closeSheet(); CC.render(); });
  CC.on('obsUitkomst', (el) => { const S = CC.S(); const a = M.act(S, el.dataset.id); const wd = a && wedVan(S, a, false); const x = wd && wd.punten[Number(el.dataset.i)]; if (!x) return;
    x.uitkomst = x.uitkomst === el.dataset.w ? null : el.dataset.w; CC.save(); CC.render(); });
  CC.on('obsPuntWeg', (el) => { const S = CC.S(); const a = M.act(S, el.dataset.id); const wd = a && wedVan(S, a, false); if (!wd) return; wd.punten.splice(Number(el.dataset.i), 1); CC.save(); CC.render(); });
  // Bespreekpunten: de uitkomsten van de laatste wedstrijd vóór deze training (de week ervoor of deze week)
  CC.trBespreek = (S, a) => { if (!actief(S) || !a || !a.datum) return '';
    const w = T().plannen(S).filter((p) => p.week && p.eigenaar === T().ik() && p.wedstrijd && (p.wedstrijd.punten || []).some((x) => x.uitkomst)).map((p) => ({ p, wa: M.act(S, p.wedstrijd.actId) }))
      .filter((x) => x.wa && x.wa.datum < a.datum && x.wa.datum >= D.addDays(a.datum, -9)).sort((x, y) => y.wa.datum.localeCompare(x.wa.datum))[0];
    if (!w) return ''; const d = D.parse(w.wa.datum);
    return `<div class="kaartje tr-bespreek"><b>Bespreekpunten van ${D.DAG_KORT[d.getDay()]} ${d.getDate()} ${D.MAAND[d.getMonth()]}</b>${w.p.wedstrijd.punten.filter((x) => x.uitkomst).map((x) => `<p class="klein">${esc(x.tekst)} — <b>${esc(x.uitkomst)}</b></p>`).join('')}<small class="zacht">Om te bespreken; ClubComm trekt hier geen conclusie uit.</small></div>`; };

  // ---------- Lijn: fase-overzicht per week, periodisering laden en terugdraaien ----------
  CC.trFase = (S) => { if (!actief(S)) return ''; const tid = CC.teamId && CC.teamId();
    const weken = T().plannen(S).filter((p) => p.week && p.eigenaar === T().ik() && (!tid || p.teamId === tid)).sort((x, y) => String(x.datum).localeCompare(String(y.datum)));
    const geladen = T().plannen(S).filter((p) => p.bron && p.eigenaar === T().ik()).length;
    const rijen = weken.map((w) => { const m = w.methodiek || {}; const pr = probleem(S, m.probleem); const tr = T().plannen(S).filter((p) => !p.week && p.eigenaar === T().ik() && (p.teamId || '') === (w.teamId || '') && T().actVan(S, p).datum && maandag(T().actVan(S, p).datum) === w.datum);
      const wd = w.wedstrijd && (w.wedstrijd.punten || []); const d = D.parse(w.datum);
      return `<tr><th>wk ${D.weeknr(w.datum)}<br><small>${d.getDate()} ${D.MAAND[d.getMonth()]}</small></th><td>${pr ? esc(pr.naam) : esc(m.probleemTekst || '—')}${m.contra || m.contraTekst ? `<br><small class="zacht">contra: ${esc((probleem(S, m.contra) || {}).naam || m.contraTekst)}</small>` : ''}</td><td>${[m.hg1, m.hg2].filter(Boolean).map((x) => esc(T().ldNaam(S, x) || x)).join(' · ') || '—'}</td><td>${(m.niveaus || []).length ? `<span class="tr-niv">${esc(nv(S, m.niveaus))}</span>` : ''}</td><td>${tr.map((p) => CC.trStatus(S, p)).join('')}</td><td>${wd && wd.length ? `${wd.filter((x) => x.uitkomst).length}/${wd.length} beoordeeld` : ''}</td></tr>`; }).join('');
    return `<div class="kaartje tr-fase"><div class="tr-kop"><b>Periodisering${weken.length ? ` · ${weken.length} weken` : ''}</b><div class="knoppen"><button class="knop" data-act="perLaden">${icon('list-checks')}Periodisering laden…</button>${geladen ? `<button class="knop licht" data-act="perTerug">Terugdraaien…</button>` : ''}</div></div>
      ${rijen ? `<div class="tr-tabel"><table><thead><tr><th>Week</th><th>Centraal probleem</th><th>Hoofdgereedschappen</th><th>Leerniveau</th><th>Trainingen</th><th>Wedstrijd</th></tr></thead><tbody>${rijen}</tbody></table></div>`
        : '<small class="zacht">Nog geen periodisering. Laad je planning uit Excel (opslaan als CSV), of vul per training de methodiek in.</small>'}</div>`; };

  // ---------- Besluit 135: "Je zit in" en het weekthema (voor elke club; met periodisering komt de week uit Excel) ----------
  const weekVoorstel = (S, tid, datum) => { const w = datum ? weekPlan(S, tid, datum) : null; return (w && w.methodiek) || {}; };
  CC.trWeekDoel = (S, p, b) => { if (!p || p.week) return null; const a = T().actVan(S, p); const m = weekVoorstel(S, p.teamId || a.teamId, a.datum); return (b === 'A' ? m.hg1 : m.hg2) || null; };
  CC.trJeZitIn = (S, a) => { if (!a || !a.datum) return ''; const m = weekVoorstel(S, a.teamId || (CC.teamId && CC.teamId()), a.datum);
    const pr = probleem(S, m.probleem); const thema = pr ? pr.naam : m.probleemTekst || m.thema || '';
    const ab = [m.hg1 && `A ${T().ldNaam(S, m.hg1) || ''}`, m.hg2 && `B ${T().ldNaam(S, m.hg2) || ''}`].filter(Boolean).join(' · ');
    return `<button type="button" class="tr-zitin" data-act="trNaarLijn">${icon('flag')}<span><b>Week ${D.weeknr(a.datum)}${m.fase ? ` · ${esc(m.fase)}` : ''}</b> · ${thema || ab ? `${esc(thema)}${thema && ab ? ' · ' : ''}${esc(ab)}` : '<i>nog geen weekthema</i>'}</span><small>Lijn ›</small></button>`; };
  CC.on('trNaarLijn', () => { (CC.ui.seg = CC.ui.seg || {}).trSeg = 'lijn'; CC.render(); window.scrollTo(0, 0); });
  // Weekthema met A en B (clubs zonder periodisering): niet verplicht; komt als voorstel bij de trainingen van die week
  CC.trWeekthema = (S) => { if (actief(S)) return ''; const tid = CC.teamId && CC.teamId(); const nu = maandag(D.vandaag());
    const weken = Array.from({ length: 7 }, (_, i) => D.addDays(nu, (i - 1) * 7));
    const rijen = weken.map((w) => { const m = weekVoorstel(S, tid, w); const d = D.parse(w); const ab = [m.hg1, m.hg2].filter(Boolean).map((x) => esc(T().ldNaam(S, x) || '')).join(' · ');
      return `<button type="button" class="tr-rij ${w === nu ? 'aan' : ''}" data-act="trWeekBewerk" data-w="${w}"><span class="tr-code">wk ${D.weeknr(w)}</span><span class="tr-t"><b>${esc(m.thema || (ab ? 'Geen thema' : 'Nog leeg'))}</b><small>${d.getDate()} ${D.MAAND[d.getMonth()]}${ab ? ` · ${ab}` : ''}</small></span>${icon('pencil')}</button>`; }).join('');
    return `<div class="kaartje tr-weken"><b>Weekthema</b><small class="zacht">Niet verplicht. Wat je hier per week kiest, staat bovenaan bij Plannen en Week${T().leerdoelen(S).length ? '; A en B komen als voorstel bij de trainingen van die week' : ''}.</small><div class="tr-lijst">${rijen}</div></div>`; };
  CC.on('trWeekBewerk', (el) => { const S = CC.S(); const w = el.dataset.w; const tid = CC.teamId && CC.teamId(); const m = weekVoorstel(S, tid, w); const lds = T().leerdoelen(S).map((l) => [l.id, l.naam]);
    CC.sheet(`Week ${D.weeknr(w)}`, `<form class="codeform" data-autosave="trWeek" data-w="${w}">
      <label for="tw-t">Thema van de week</label><input id="tw-t" name="thema" value="${esc(m.thema || '')}" placeholder="Bijv. opbouwen onder druk">
      ${lds.length ? `<div class="twee"><div><label>Hoofdleerdoel A</label>${sel('hg1', lds, m.hg1)}</div><div><label>Hoofdleerdoel B</label>${sel('hg2', lds, m.hg2)}</div></div>
      <p class="zacht klein">Een training die zelf al A of B heeft, houdt die.</p>` : ''}<button type="button" class="knop vol" data-act="sluitRender">Klaar</button></form>`); });
  CC.autosave.trWeek = (f) => { const S = CC.S(); const tid = CC.teamId && CC.teamId(); const w = weekPlan(S, tid, f.dataset.w) || nieuwWeek(S, tid, f.dataset.w);
    w.methodiek = { ...(w.methodiek || {}), thema: f.elements.thema.value.trim(), hg1: f.elements.hg1 ? f.elements.hg1.value || null : null, hg2: f.elements.hg2 ? f.elements.hg2.value || null : null }; };

  // CSV (Excel: Opslaan als → CSV, puntkomma of komma). Eén regel per training of wedstrijd.
  const KOLOMMEN = ['datum', 'soort', 'fase', 'week', 'probleem', 'contrathema', 'gereedschapA', 'gereedschapB', 'keten', 'leerniveau', 'gedrag', 'informatie', 'leerroute', 'transfer', 'onderbouw', 'observatie', 'model'];
  const csvLezen = (txt) => { txt = txt.replace(/^﻿/, ''); const eerste = txt.split(/\r?\n/)[0] || ''; const sep = (eerste.match(/;/g) || []).length >= (eerste.match(/,/g) || []).length ? ';' : ',';
    const rijen = []; let r = [], v = '', q = false;
    for (let i = 0; i < txt.length; i++) { const c = txt[i];
      if (q) { if (c === '"' && txt[i + 1] === '"') { v += '"'; i++; } else if (c === '"') q = false; else v += c; }
      else if (c === '"') q = true; else if (c === sep) { r.push(v); v = ''; } else if (c === '\n' || c === '\r') { if (c === '\r' && txt[i + 1] === '\n') i++; r.push(v); rijen.push(r); r = []; v = ''; } else v += c; }
    if (v !== '' || r.length) { r.push(v); rijen.push(r); }
    const kop = (rijen.shift() || []).map((x) => x.trim().toLowerCase().replace(/[^a-z]/g, ''));
    return rijen.filter((x) => x.some((y) => String(y).trim())).map((x) => Object.fromEntries(KOLOMMEN.map((k) => [k, String(x[kop.indexOf(k.toLowerCase())] || '').trim()]))); };
  const datumVan = (s) => { s = String(s || '').trim(); let m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/); if (m) return `${m[1]}-${m[2].padStart(2, '0')}-${m[3].padStart(2, '0')}`;
    m = s.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/); return m ? `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}` : null; };
  const norm = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '');
  const zoekProbleem = (S, s) => { const n = norm(s); if (!n) return null; const nr = n.match(/^(\d)/); if (nr && problemen(S).find((x) => x.id === `vp-${nr[1]}`) && n.length <= 2) return `vp-${nr[1]}`;
    const x = problemen(S).find((p) => norm(p.naam) === n || norm(p.naam).includes(n.replace(/^\d+/, '')) && n.replace(/^\d+/, '').length > 5); return x ? x.id : (nr ? `vp-${nr[1]}` : null); };
  const zoekLd = (S, s) => { const n = norm(s); if (!n) return null; const l = T().leerdoelen(S).find((x) => norm(x.naam) === n || norm(x.naam).startsWith(n) || n.startsWith(norm(x.naam).slice(0, 8)) || (x.kern && norm(x.kern) === n)); return l ? l.id : null; };
  const zoekNiveaus = (S, s) => String(s || '').split(/[-–→>,/]+/).map((x) => (T().niveaus(S).find((n) => norm(n.naam) === norm(x)) || {}).id).filter(Boolean);
  const zoekKeten = (S, s) => { const n = norm(s); return n ? ((ketens(S).find((k) => norm(k.naam) === n || norm(k.naam).includes(n)) || {}).id || null) : null; };

  // Voorbeeld: welke echte activiteit van het team krijgt wat? Alleen trainingen zonder voorbereiding krijgen een concept.
  const voorbeeld = (S, rows, bestand) => { const tid = CC.teamId && CC.teamId(); const uit = [];
    rows.forEach((r, i) => { const datum = datumVan(r.datum); const soort = /wed/i.test(r.soort) ? 'wedstrijd' : 'training'; const fout = [];
      if (!datum) { uit.push({ i, r, actie: 'fout', reden: `onbekende datum "${r.datum}"` }); return; }
      const acts = M.acts(S, tid, datum, datum).filter((a) => !a.afgelast && (soort === 'wedstrijd' ? M.isWed(a) : a.soort === 'training'));
      if (!acts.length) { uit.push({ i, r, datum, soort, actie: 'overslaan', reden: `geen ${soort} van ${CC.tn(tid)} op deze dag in de kalender` }); return; }
      const a = acts[0];
      const pr = zoekProbleem(S, r.probleem), contra = zoekProbleem(S, r.contrathema), A = zoekLd(S, r.gereedschapA), B = zoekLd(S, r.gereedschapB), niv = zoekNiveaus(S, r.leerniveau), keten = zoekKeten(S, r.keten);
      if (r.probleem && !pr) fout.push(`probleem "${r.probleem}" onbekend (tekst blijft staan)`); if (r.contrathema && !contra) fout.push(`contrathema "${r.contrathema}" onbekend (tekst blijft staan)`); if (r.gereedschapA && !A) fout.push(`gereedschap A "${r.gereedschapA}" onbekend`); if (r.gereedschapB && !B) fout.push(`gereedschap B "${r.gereedschapB}" onbekend`);
      if (r.leerniveau && !niv.length) fout.push(`leerniveau "${r.leerniveau}" onbekend`);
      const m = { probleem: pr, probleemTekst: r.probleem, contra, contraTekst: r.contrathema, hg1: A, hg2: B, keten, ketenTekst: r.keten, niveaus: niv, gedrag: r.gedrag, informatie: r.informatie, route: r.leerroute, transfer: r.transfer, onderbouw: r.onderbouw, observatie: soort === 'training' ? r.observatie : '', fase: r.fase, week: r.week };
      if (soort === 'wedstrijd') { const punten = String(r.observatie || '').split('|').map((x) => x.trim()).filter(Boolean).slice(0, 3); const w = weekPlan(S, tid, datum);
        const al = w && w.wedstrijd && w.wedstrijd.actId === a.id && (w.wedstrijd.punten || []).length;
        uit.push({ i, r, datum, soort, a, m, punten, actie: al ? 'overslaan' : punten.length ? 'observatie' : 'niets', reden: al ? 'heeft al observatiepunten' : punten.length ? `${punten.length} observatiepunt${punten.length === 1 ? '' : 'en'}` : 'geen observatiepunten', fout }); return; }
      const p = T().plan(S, a.id);
      if (!r.probleem && !r.gereedschapA && !r.gereedschapB && !r.leerniveau && !r.gedrag) { uit.push({ i, r, datum, soort, a, m, actie: 'niets', reden: 'regel is nog leeg', fout }); return; }
      uit.push({ i, r, datum, soort, a, m, actie: p ? 'overslaan' : 'concept', reden: p ? (p.bron === bestand ? 'al geladen' : 'heeft al een voorbereiding (blijft zoals hij is)') : 'krijgt een concept', fout }); });
    // dubbel in het bestand: alleen de eerste regel per activiteit
    const gezien = {}; uit.forEach((x) => { if (!x.a) return; const k = x.a.id; if (gezien[k] && x.actie !== 'fout') { x.actie = 'overslaan'; x.reden = 'staat dubbel in het bestand'; } gezien[k] = true; });
    return uit; };
  // Stempel: zo kunnen we later zien of je een concept hebt aangepast (dan wordt het nooit verwijderd)
  const stempel = (p) => JSON.stringify([p.thema, p.onderdelen, p.methodiek, p.blokDoel, p.overig, p.sjabloon, !!p.gegeven, p.anders || '', p.evaluatie || null]);
  const toevoegen = (S, lijst, bestand) => { const tid = CC.teamId && CC.teamId(); const sj = T().sjablonen(S); let n = 0, wk = 0, ob = 0;
    lijst.forEach((x) => { if (!x.a) return;
      let w = weekPlan(S, tid, x.datum); if (!w) { w = nieuwWeek(S, tid, x.datum, bestand); w.methodiek = { ...x.m, observatie: '' }; w.stempel = stempel(w); wk++; }
      if (x.actie === 'observatie') { w.wedstrijd = { actId: x.a.id, punten: x.punten.map((t) => ({ id: T().nieuwId('ob'), tekst: t, uitkomst: null })), bron: bestand }; ob++; return; }
      if (x.actie !== 'concept' || T().plan(S, x.a.id)) return;
      const s = sj.find((y) => /afwissel|interleav/i.test(x.r.model) ? y.model === 'interleaving' : y.model !== 'interleaving') || sj[0];
      const nv1 = x.m.niveaus[0] || null, nv2 = x.m.niveaus[1] || nv1;
      const p = { id: `tp-${x.a.id}`, actId: x.a.id, teamId: x.a.teamId, datum: x.a.datum, eigenaar: T().ik(), thema: (probleem(S, x.m.probleem) || {}).naam || x.m.probleemTekst || '', leerdoelen: [], spelers: null, keepers: null,
        sjabloon: s ? s.id : null, overig: s && s.overig ? { ...s.overig } : null, blokDoel: { A: x.m.hg1, B: x.m.hg2 }, methodiek: { ...x.m }, bron: bestand, concept: true,
        onderdelen: s ? (s.blokken || []).map((b) => ({ id: T().nieuwId('o'), blok: b.blok, min: Number(b.min) || 0, spacing: b.blok === 'S', naam: b.blok === 'S' ? '' : b.naam || '', sjabloonFase: b.fase || null,
          niveauVoorstel: /1$/.test(b.blok) ? nv1 : /2$/.test(b.blok) ? nv2 : null })) : [] };
      p.importThema = p.thema; p.stempel = stempel(p); T().plannen(S).push(p); n++; });
    return { n, wk, ob }; };
  const PV = () => CC.ui.per || (CC.ui.per = {});
  const voorbeeldHtml = (S) => { const pv = PV(); if (!pv.rows) return '';
    const l = voorbeeld(S, pv.rows, pv.bestand); const c = (a) => l.filter((x) => x.actie === a).length; const fouten = l.filter((x) => (x.fout || []).length);
    return `<div class="kaartje"><b>Wat er gebeurt (${esc(pv.bestand)})</b>
      <p>✓ <b>${c('concept')} training${c('concept') === 1 ? '' : 'en'}</b> krijgen een concept (probleem, gereedschappen, leerniveau, gedrag; plekken leeg)</p>
      <p>✓ <b>${c('observatie')} wedstrijd${c('observatie') === 1 ? '' : 'en'}</b> krijgen observatiepunten</p>
      <p>– <b>0 bestaande trainingen</b> worden gewijzigd of verwijderd · <b>${c('overslaan')}</b> overgeslagen · <b>geen</b> oefenvormen of tekeningen</p>
      ${c('fout') ? `<p style="color:var(--rood)">⚠ ${c('fout')} regel(s) met een fout worden niet geladen.</p>` : ''}${fouten.length ? `<p style="color:#8a4b00">⚠ ${fouten.length} regel(s) met onbekende waarden (de tekst blijft staan): ${esc(fouten.slice(0, 3).map((x) => x.fout[0]).join('; '))}${fouten.length > 3 ? ' …' : ''}</p>` : ''}</div>
      <div class="tr-tabel"><table class="tr-pv"><thead><tr><th>Datum</th><th>Activiteit in de kalender</th><th>Probleem</th><th>Wat</th></tr></thead><tbody>
      ${l.map((x) => `<tr class="${x.actie}"><td>${x.datum ? esc(D.kort(x.datum)) : esc(x.r.datum)}</td><td>${x.a ? `${esc(x.a.soort === 'training' ? 'Training' : 'Wedstrijd')} ${esc(x.a.tijd || '')}${x.a.eind ? `–${esc(x.a.eind)}` : ''}` : '—'}</td><td>${esc(x.m ? (probleem(S, x.m.probleem) || {}).naam || x.m.probleemTekst || '' : '')}</td><td>${esc(x.reden)}</td></tr>`).join('')}</tbody></table></div>
      <div class="knoppen"><button class="knop" data-act="perToevoegen" ${c('concept') + c('observatie') ? '' : 'disabled'}>Toevoegen</button><button class="knop licht" data-act="sluit">Annuleren</button></div>`; };
  CC.on('perLaden', () => { const pv = PV(); pv.rows = null; pv.bestand = '';
    CC.sheet('Periodisering laden', `<p>Kies de planning uit Excel, <b>opgeslagen als CSV</b>. Je ziet eerst wat er gebeurt; pas na <b>Toevoegen</b> verandert er iets.</p>
      <input type="file" id="perBestand" accept=".csv,text/csv" aria-label="CSV-bestand kiezen">
      <button class="knop licht" data-act="perSjabloon">${icon('list-checks')}Leeg sjabloon met de echte data (CSV)</button>
      <div data-per-voorbeeld></div>`, { groot: true }); });
  document.addEventListener('change', (e) => { if (e.target.id !== 'perBestand' || !e.target.files[0]) return; const f = e.target.files[0]; const r = new FileReader();
    r.onload = () => { const pv = PV(); pv.rows = csvLezen(String(r.result)); pv.bestand = f.name.replace(/\.[^.]+$/, ''); const v = document.querySelector('[data-per-voorbeeld]'); if (v) v.innerHTML = voorbeeldHtml(CC.S()); }; r.readAsText(f); });
  CC.on('perToevoegen', () => { const S = CC.S(); const pv = PV(); if (!pv.rows) return; const r = toevoegen(S, voorbeeld(S, pv.rows, pv.bestand), pv.bestand);
    CC.save(); CC.closeSheet(); CC.render(); CC.toast(`${r.n} concepttraining${r.n === 1 ? '' : 'en'}, ${r.wk} weekplan${r.wk === 1 ? '' : 'nen'} en ${r.ob} wedstrijd${r.ob === 1 ? '' : 'en'} toegevoegd`); });
  // Leeg sjabloon: de echte trainingen en wedstrijden van het team (vanaf vandaag, 12 weken), om in Excel in te vullen
  CC.on('perSjabloon', () => { const S = CC.S(); const tid = CC.teamId && CC.teamId(); const acts = M.acts(S, tid, D.vandaag(), D.addDays(D.vandaag(), 84)).filter((a) => !a.afgelast && (a.soort === 'training' || M.isWed(a)));
    const csv = [KOLOMMEN.join(';'), ...acts.map((a) => [a.datum, a.soort === 'training' ? 'training' : 'wedstrijd', '', `wk ${D.weeknr(a.datum)}`, ...Array(KOLOMMEN.length - 4).fill('')].join(';'))].join('\r\n');
    const url = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' })); const l = document.createElement('a'); l.href = url; l.download = `periodisering-${CC.tn(tid) || 'team'}.csv`; document.body.appendChild(l); l.click(); l.remove(); setTimeout(() => URL.revokeObjectURL(url), 2000); });
  // Terugdraaien: alleen concepten die niet zijn aangepast (stempel gelijk, niet gegeven); de rest blijft en wordt gemeld
  const terugLijst = (S) => { const l = T().plannen(S).filter((p) => p.bron && p.eigenaar === T().ik()); return { weg: l.filter((p) => p.stempel && p.stempel === stempel(p) && !p.gegeven && !(p.week && p.wedstrijd && (p.wedstrijd.punten || []).some((x) => x.uitkomst))), blijft: l.filter((p) => !(p.stempel && p.stempel === stempel(p)) || p.gegeven) }; };
  CC.on('perTerug', () => { const S = CC.S(); const t = terugLijst(S);
    CC.sheet('Periodisering terugdraaien', `<p><b>${t.weg.length}</b> concept(en) worden verwijderd: niet aangepast en niet gegeven.</p><p><b>${t.blijft.length}</b> blijven staan, omdat je ze hebt aangepast of gegeven.</p>
      <div class="knoppen"><button class="knop rood" data-act="perTerugOk" ${t.weg.length ? '' : 'disabled'}>Verwijderen</button><button class="knop licht" data-act="sluit">Annuleren</button></div>`); });
  CC.on('perTerugOk', () => { const S = CC.S(); const weg = new Set(terugLijst(S).weg); S.trainingsplannen = T().plannen(S).filter((p) => !weg.has(p)); CC.save(); CC.closeSheet(); CC.render(); CC.toast(`${weg.size} concept(en) verwijderd`); });
  CC.periodisering = { csvLezen, voorbeeld, toevoegen, stempel, weekId };
})();
