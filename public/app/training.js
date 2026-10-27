// ClubComm — trainingsmodule (Besluit 128, 130, 131): eigen oefenvormen (tekening, classificatie, varianten) en trainingen
// per activiteit of op datum (opbouw in blokken A · S · B · partij, sjabloon uit het opleidingsprofiel, fase, terugblik met
// gepland en uitgevoerd, minuten per hoofdleerdoel). Alles scope "eigen": alleen de trainer die het maakte ziet het.
// Aan/uit met de module "Trainingen (proef)". Oefenvormtypes: catalogus in vormtypes.js; methodiek: opleidingsprofiel.
(function () {
  const CC = window.CC; const D = CC.date, M = CC.m, h = CC.h, icon = CC.icon, esc = CC.esc;
  const VT = CC.VORMTYPES;
  const BLOKKLEUR = { start: '#94a3b8', A: '#0869c2', B: '#137333', S: '#f5b041', P: '#0b4f7a' };

  CC.trainingAan = (S) => !!(S.club.modules || {}).training && (CC.rol() || {}).rol === 'trainer';
  const vormen = (S) => S.vormen || (S.vormen = []);
  const plannen = (S) => S.trainingsplannen || (S.trainingsplannen = []);
  const ik = () => (CC.me() || {}).id;
  const mijnVormen = (S) => vormen(S).filter((v) => v.eigenaar === ik() && !v.weg);
  const vorm = (S, id) => vormen(S).find((v) => v.id === id);
  const plan = (S, actId) => plannen(S).find((p) => p.actId === actId && p.eigenaar === ik());
  const nieuwId = (p) => `${p}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`;

  // Een training hoort bij een activiteit uit de planning, of staat los op een datum (clubs zonder planning, bijv. pakket Trainers begeleiden)
  const actVan = (S, p) => M.act(S, p.actId) || { id: p.actId, teamId: p.teamId, datum: p.datum, soort: 'training', los: true, tijd: '', eind: '' };

  // ---------- Opleidingsprofiel (Besluit 123): leerdoelen, fasen en sjablonen; alleen wat de club heeft vastgesteld ----------
  const profiel = (S) => { const p = S.profielen || {}; return p[S.club.id] || p[S.club.profiel] || Object.values(p)[0] || null; };
  const zichtbaar = (x) => x && !['controleren', 'leeg'].includes(x.status);
  const ond = (S, k) => { const pr = profiel(S); const o = pr && pr.onderdelen && pr.onderdelen[k]; return zichtbaar(o) ? o : null; };
  // Leerdoelen = de leerlijnen, plus (later) leerdoelen als observeerbaar gedrag; elk met een kant (aanval of verdediging)
  const leerdoelen = (S) => {
    const ll = ((ond(S, 'leerlijnen') || {}).items || []).filter((x) => x.naam && zichtbaar({ status: x.status || 'eigen' }));
    const gedrag = ((ond(S, 'leerdoelenPerLeeftijd') || {}).items || []).filter((x) => x.gedrag && zichtbaar({ status: x.status || 'eigen' }))
      .map((x) => ({ id: x.id, naam: x.gedrag, kant: x.kant || ((ll.find((l) => l.id === x.leerlijn) || {}).kant) || null }));
    return ll.map((l) => ({ id: l.id, naam: l.naam, kern: l.kern, kant: l.kant || null })).concat(gedrag);
  };
  const ld = (S, id) => leerdoelen(S).find((l) => l.id === id) || null;
  const ldNaam = (S, id) => (ld(S, id) || {}).naam || '';
  const fasen = (S) => (ond(S, 'methodiek') || {}).fasen || [];
  const faseNaam = (S, id) => ((fasen(S).find((f) => f.id === id) || {}).naam || '').toLowerCase();
  const sjablonen = (S) => (ond(S, 'trainingsopbouw') || {}).sjablonen || [];
  const profielId = (S) => (profiel(S) || {}).id || 'club';

  // ---------- Classificatie van een vorm (Besluit 131) ----------
  // Oude vormen (Besluit 128: soort, leerdoelen) blijven geldig: ze worden gelezen alsof ze al een type en koppeling hebben.
  const typeVan = (v) => (v.type !== undefined ? v.type : (VT.vanSoort[v.soort] !== undefined ? VT.vanSoort[v.soort] : null));
  const typeNaam = (id) => (id ? (VT.types.find((t) => t.id === id) || { naam: 'Overig' }).naam : '');
  const typeKleur = (id) => (VT.types.find((t) => t.id === id) || {}).kleur || '#0869c2';
  const koppeling = (S, v) => { const k = (v.koppelingen || {})[profielId(S)]; if (k) return { primair: k.primair || null, ook: k.ook || [] };
    const l = v.leerdoelen || []; return { primair: l[0] || null, ook: l.slice(1) }; };
  // Weerstand: getallen uit de aantallen, perspectief uit het hoofdleerdoel. Neutralen spelen mee met de partij in balbezit.
  CC.weerstand = (S, v) => {
    const a = v.aantal; if (!a || (a.aanval == null && a.verdediging == null)) return null;
    const A = Number(a.aanval) || 0, V = Number(a.verdediging) || 0, N = Number(a.neutraal) || 0, K = Number(a.keepers) || 0;
    const keepers = K ? ` · ${K} keeper${K === 1 ? '' : 's'}` : '';
    const telt = `${A}${N ? `+${N}` : ''} tegen ${V}`;
    if (v.weerstandExtra) { const x = { passief: 'passieve weerstand', afleiding: 'met afleiding', wisselend: 'wisselende weerstand' }[v.weerstandExtra] || '';
      return { kort: `${V ? telt : `${A + N} spelers`} · ${x}${keepers}`, rel: null }; }
    if (!V) return { kort: `${A + N} spelers · zonder tegenstander${keepers}`, rel: 'zonder' };
    const kant = (ld(S, koppeling(S, v).primair) || {}).kant;
    if (!kant) return { kort: telt + keepers, rel: null };
    const wij = kant === 'verdediging' ? V : A + N, zij = kant === 'verdediging' ? A + N : V;
    const rel = wij > zij ? 'overtal' : wij < zij ? 'ondertal' : 'gelijk';
    return { kort: kant === 'verdediging' ? `vanuit verdedigers: ${V} tegen ${A + N} · ${rel}${keepers}` : `${telt} · ${rel}${keepers}`, rel, kant };
  };
  const context = (v) => [v.richting === 0 ? 'geen speelrichting' : v.richting === 1 ? 'één richting' : v.richting === 2 ? 'twee richtingen' : '',
    v.doelen === true ? 'doelen' : v.doelen === false ? 'zonder doelen' : '', ((VT.omschakeling.find((o) => o.id === v.omschakeling) || {}).kort) || ''].filter(Boolean).join(' · ');
  // Publiceren in de vormenbank (later): alleen deze minimale eisen; een concept mag onvolledig zijn
  CC.vormMist = (S, v) => { const k = koppeling(S, v); const a = v.aantal || {};
    return [!String(v.naam || '').trim() || v.naam === 'Nieuwe vorm' ? 'naam' : '', !v.tekening && !String(v.organisatie || '').trim() ? 'tekening of organisatie' : '', !typeVan(v) ? 'vormtype' : '',
      a.aanval == null && a.verdediging == null ? 'aantallen' : '', !k.primair ? 'hoofdleerdoel' : ''].filter(Boolean); };

  const tekening = (t) => (t && window.DrawTool ? window.DrawTool.staticSvg(t) : '');
  const mini = (v, spacing) => (spacing && !(v && v.tekening) ? '<span class="tr-mini sp">spacing</span>' : `<span class="tr-mini">${v && v.tekening ? tekening(v.tekening) : icon('pencil')}</span>`);
  const bereik = (a, b, woord) => (a == null && b == null ? '' : `${a != null ? a : '?'}${b != null && b !== a ? `–${b}` : ''} ${woord}`);
  const verwacht = (S, a) => (a.teamId ? M.spelers(S, a.teamId) : []).filter((pl) => M.status(S, pl, a).code === 'verwacht').length;
  // Past de vorm bij dit aantal? En wat schreef de trainer voor precies dit aantal?
  const past = (v, n, k) => (v.spelersMin == null || n >= v.spelersMin) && (v.spelersMax == null || n <= v.spelersMax) && (k == null || v.keepersMax == null || k <= v.keepersMax);
  const voorAantal = (v, n, k) => (v.aantallen || []).find((x) => Number(x.spelers) === n && (x.keepers == null || k == null || Number(x.keepers) === k));
  const vormSub = (S, v) => [typeNaam(typeVan(v)), (CC.weerstand(S, v) || {}).kort, bereik(v.spelersMin, v.spelersMax, 'sp'), v.duur ? `${v.duur} min` : ''].filter(Boolean).join(' · ');

  // ---------- Blok bij een training (Planning → training) ----------
  CC.trainingBlok = (S, a) => {
    if (!a || a.soort !== 'training' || !CC.trainingAan(S)) return '';
    const p = plan(S, a.id);
    if (!p) return `${h.sectie('Training')}<button class="knop licht vol" data-act="tpNieuw" data-id="${a.id}">${icon('pencil')}Training voorbereiden of vastleggen</button>`;
    return `${h.sectie('Training')}${h.rij({ ic: 'list-checks', titel: esc(p.thema || 'Training'), sub: `${(p.onderdelen || []).length} onderdelen · ${totaal(p)} min${p.gegeven ? ' · gegeven' : ''}`, act: 'open', attrs: `data-view="trainingsplan" data-id="${a.id}"` })}`;
  };
  CC.on('tpNieuw', (el) => {
    const S = CC.S(); const a = M.act(S, el.dataset.id); if (!a) return;
    if (!plan(S, a.id)) plannen(S).push({ id: nieuwId('tp'), actId: a.id, teamId: a.teamId, datum: a.datum, eigenaar: ik(), thema: '', leerdoelen: [], onderdelen: [], spelers: verwacht(S, a), keepers: null });
    // In het tabblad Training blijft de training op dezelfde plek staan (Besluit 130)
    CC.save(); if (el.dataset.inline) CC.render(); else CC.open('trainingsplan', { id: a.id });
  });

  // ---------- Training: opbouw in blokken ----------
  const totaal = (p) => (p.onderdelen || []).reduce((t, o) => t + (Number(o.min) || 0), 0) + (p.overig ? Number(p.overig.min) || 0 : 0);
  const blokSoort = (b) => (!b ? '' : b === 'start' || b === 'S' || b === 'P' ? b : b[0]);
  const code = (o) => (o.blok === 'start' ? 'Start' : o.blok || '');
  const leegSlot = (o) => !o.vormId && !o.spacing;
  // Fase hoort bij de uitvoering: vastgezet door de trainer, anders een voorstel (aanbevolen fase van de vorm, of van het sjabloon)
  const faseVan = (S, o) => { const v = o.vormId && vorm(S, o.vormId);
    if (o.fase) return { id: o.fase, vast: true }; const id = (v && v.faseAdvies) || o.sjabloonFase || null; return id ? { id, vast: false } : null; };
  const faseChip = (S, o) => { const f = faseVan(S, o); const n = f && faseNaam(S, f.id); return n ? ` <span class="tr-fase ${f.vast ? 'vast' : ''}">${esc(n)}${f.vast ? '' : ' · voorstel'}</span>` : ''; };
  const balk = (S, p) => { const o = (p.onderdelen || []).filter((x) => Number(x.min) > 0); if (!o.length) return '';
    const kleur = (x) => { const b = blokSoort(x.blok); if (x.spacing) return BLOKKLEUR.S; if (b && BLOKKLEUR[b]) return BLOKKLEUR[b]; const v = x.vormId && vorm(S, x.vormId); return v ? typeKleur(typeVan(v)) : '#cbd5e1'; };
    return `<div class="tr-balk" aria-hidden="true">${o.map((x) => `<i style="flex:${Number(x.min)};background:${kleur(x)}"></i>`).join('')}${p.overig && Number(p.overig.min) ? `<i style="flex:${Number(p.overig.min)};background:#e2e8f0"></i>` : ''}</div>`; };
  // A = ..., B = ...: het hoofdleerdoel van de eerste vorm in elk blok
  const blokDoelen = (S, p) => ['A', 'B'].map((b) => { const v = (p.onderdelen || []).filter((o) => blokSoort(o.blok) === b).map((o) => o.vormId && vorm(S, o.vormId)).find(Boolean);
    const n = v && ldNaam(S, koppeling(S, v).primair); return n ? `${b} = ${esc(n)}` : ''; }).filter(Boolean).join(' · ');
  CC.views.trainingsplan = (S, prm) => {
    const p = plan(S, prm.id); const a = p ? actVan(S, p) : null;
    if (!a || !p) return { titel: 'Training', html: h.leeg('Deze training bestaat niet meer.') };
    const d = D.parse(a.datum); const n = Number(p.spelers) || 0, k = p.keepers == null || p.keepers === '' ? null : Number(p.keepers);
    const duur = a.eind && a.tijd ? Math.round((D.parse(`${a.datum}T${a.eind}`) - D.parse(`${a.datum}T${a.tijd}`)) / 60000) : null;
    const lds = leerdoelen(S); const metCode = (p.onderdelen || []).some((o) => o.blok);
    const rijen = (p.onderdelen || []).map((o, i) => {
      const v = o.vormId && vorm(S, o.vormId);
      const naam = v ? v.naam : o.spacing ? o.naam || 'Spacing' : o.naam || 'Kies een vorm';
      const extra = v && n ? (voorAantal(v, n, k) ? esc(voorAantal(v, n, k).tekst) : (!past(v, n, k) ? `gemaakt voor ${bereik(v.spelersMin, v.spelersMax, 'spelers')}` : '')) : '';
      const variant = v && o.variant != null && (v.varianten || [])[o.variant] ? `variant ${esc(v.varianten[o.variant].naam || String.fromCharCode(65 + Number(o.variant)))}` : '';
      const sub = [o.spacing ? (o.naam ? 'spacing' : 'vrij in te vullen') : v ? typeNaam(typeVan(v)) : o.blok === 'start' ? 'warming-up · kies een vorm' : 'kies een vorm', variant, o.notitie ? esc(o.notitie) : '', extra].filter(Boolean).join(' · ');
      return `<button type="button" class="tr-rij" data-act="tpOnderdeel" data-id="${a.id}" data-i="${i}">${metCode ? `<span class="tr-code">${esc(code(o))}</span>` : ''}${leegSlot(o) ? `<span class="tr-mini leeg">${icon('plus')}</span>` : mini(v, o.spacing)}<span class="tr-t"><b>${esc(naam)}</b><small>${sub}${o.spacing || leegSlot(o) && o.blok === 'start' ? '' : faseChip(S, o)}</small></span><span class="tr-min">${Number(o.min) || 0} min${v && n && !past(v, n, k) && !voorAantal(v, n, k) ? '<span class="st o">aantal</span>' : ''}</span></button>`;
    }).join('') + (p.overig ? `<button type="button" class="tr-rij tr-overig" data-act="tpOverig" data-id="${a.id}">${metCode ? '<span class="tr-code">·</span>' : ''}<span class="tr-t"><small>${esc(p.overig.naam || 'Ombouw, wissels, afsluiting')}</small></span><span class="tr-min">${Number(p.overig.min) || 0} min</span></button>` : '');
    const sj = sjablonen(S); const uit = p.gegeven ? (p.onderdelen || []).filter((o) => o.vormId && !o.spacing) : [];
    return { titel: `Training ${D.DAG_KORT[d.getDay()]} ${d.getDate()} ${D.MAAND[d.getMonth()]}`, sub: `${a.tijd || ''}${a.eind ? `–${a.eind}` : ''} · ${esc(CC.tn(a.teamId))}`, breed: true, html: `
      <div class="tr-lay">
      <div class="tr-kol">
      <form class="kaartje codeform" data-autosave="tpKop" data-id="${a.id}">
        <label for="tp-th">Thema</label><input id="tp-th" name="thema" value="${esc(p.thema || '')}" placeholder="Bijv. Dreigen en passeren">
        ${lds.length ? `<fieldset class="tr-chips"><legend>Leerdoelen (${esc((profiel(S) || {}).naam || 'opleidingsprofiel')})</legend>${lds.map((l) => `<label class="tr-chip"><input type="checkbox" name="ld" value="${esc(l.id)}" ${(p.leerdoelen || []).includes(l.id) ? 'checked' : ''}><span>${esc(l.naam)}${l.kern ? ` – ${esc(l.kern)}` : ''}</span></label>`).join('')}</fieldset>` : ''}
        <div class="twee"><div><label for="tp-n">Spelers</label><input id="tp-n" name="spelers" type="number" inputmode="numeric" min="0" max="40" value="${n || ''}"></div>
          <div><label for="tp-k">Keepers</label><input id="tp-k" name="keepers" type="number" inputmode="numeric" min="0" max="6" value="${k == null ? '' : k}"></div></div>
      </form>
      <div class="kaartje">
        <div class="tr-kop"><b>Opbouw${p.sjabloon ? ` · ${esc((sj.find((x) => x.id === p.sjabloon) || { naam: 'sjabloon' }).naam)}` : ''}</b><span class="zacht klein"><b>${totaal(p)}</b>${duur ? ` van ${duur}` : ''} min</span></div>
        ${balk(S, p)}
        ${blokDoelen(S, p) ? `<small class="zacht">${blokDoelen(S, p)}</small>` : ''}
        ${rijen ? `<div class="tr-lijst">${rijen}</div>` : `<p class="zacht">Nog leeg. ${sj.length ? 'Begin met het sjabloon van de club, of zet' : 'Zet'} vormen en spacing in de volgorde van de training.</p>`}
        ${rijen ? '' : sj.map((s) => `<button class="knop vol" data-act="tpSjabloon" data-id="${a.id}" data-s="${esc(s.id)}">${icon('list-checks')}Sjabloon ${esc(s.naam)} (${(s.blokken || []).reduce((t, b) => t + (Number(b.min) || 0), 0) + ((s.overig || {}).min || 0)} min)</button>`).join('')}
        <div class="knoppen"><button class="knop ${rijen || !sj.length ? '' : 'licht'}" data-act="tpVormKiezen" data-id="${a.id}">${icon('plus')}Vorm</button><button class="knop licht" data-act="tpSpacing" data-id="${a.id}">${icon('plus')}Spacing</button><button class="knop licht" data-act="tpKopie" data-id="${a.id}">${icon('repeat')}Eerdere training</button></div>
        ${rijen && (p.onderdelen || []).some((o) => o.blok) ? '<small class="zacht">Gestippeld = voorstel. Tik op een regel voor minuten, fase en variant.</small>' : ''}
      </div>
      </div>
      <div class="tr-kol">
      <form class="kaartje codeform" data-autosave="tpTerug" data-id="${a.id}">
        <label class="schakel"><span>Training is gegeven</span><input type="checkbox" name="gegeven" ${p.gegeven ? 'checked' : ''}><i></i></label>
        ${uit.length ? `<b>Hoeveel minuten echt?</b><small class="zacht">Staat op gepland; pas aan wat anders liep. 0 = niet gedaan.</small>
          <div class="tr-lijst">${uit.map((o) => { const v = vorm(S, o.vormId); return `<div class="tr-rij tr-uit">${o.blok ? `<span class="tr-code">${esc(code(o))}</span>` : ''}<span class="tr-t"><b>${esc(v ? v.naam : 'Vorm')}</b><small>gepland ${Number(o.min) || 0} min</small></span><input name="uit-${esc(o.id)}" type="number" inputmode="numeric" min="0" max="120" aria-label="Minuten echt: ${esc(v ? v.naam : 'vorm')}" value="${o.minUit != null ? o.minUit : Number(o.min) || 0}"></div>`; }).join('')}</div>` : ''}
        <label for="tp-an">Wat doe je de volgende keer anders?</label><textarea id="tp-an" name="anders" rows="4" placeholder="Bijv. de 10 en de 6 als neutrale speler">${esc(p.anders || '')}</textarea>
      </form>
      <button class="knop licht vol" data-act="tpWeg" data-id="${a.id}" style="color:var(--rood)">${icon('trash-2')}Training leegmaken</button>
      </div></div>` };
  };
  CC.autosave.tpKop = (f) => { const S = CC.S(); const p = plan(S, f.dataset.id); if (!p) return;
    p.thema = f.thema.value.trim(); p.leerdoelen = [...f.querySelectorAll('input[name="ld"]:checked')].map((x) => x.value);
    p.spelers = f.spelers.value === '' ? null : Number(f.spelers.value); p.keepers = f.keepers.value === '' ? null : Number(f.keepers.value); };
  // Gepland ≠ uitgevoerd: na "Training is gegeven" de echte minuten per vorm (Besluit 131)
  CC.autosave.tpTerug = (f) => { const S = CC.S(); const p = plan(S, f.dataset.id); if (!p) return; const was = !!p.gegeven;
    p.gegeven = f.gegeven.checked; p.anders = f.anders.value.trim();
    (p.onderdelen || []).forEach((o) => { const x = f.elements[`uit-${o.id}`]; if (x) o.minUit = x.value === '' ? null : Number(x.value); });
    if (was !== p.gegeven) setTimeout(() => CC.render(), 0); };
  // Na het invullen (verlaten van het vak) de maandtelling bijwerken; tijdens het typen niet opnieuw tekenen
  document.addEventListener('change', (e) => { if (e.target.closest && e.target.closest('.tr-uit')) setTimeout(() => CC.render(), 0); });
  CC.on('tpWeg', (el) => CC.sheet('Training leegmaken?', `<p>De opbouw, het thema en je terugblik van deze training worden verwijderd. Je vormen blijven bestaan.</p><div class="knoppen"><button class="knop rood" data-act="tpWegOk" data-id="${el.dataset.id}">Leegmaken</button><button class="knop licht" data-act="sluit">Annuleren</button></div>`));
  CC.on('tpWegOk', (el) => { const S = CC.S(); S.trainingsplannen = plannen(S).filter((p) => !(p.actId === el.dataset.id && p.eigenaar === ik())); CC.save(); CC.closeSheet(); CC.terug ? CC.terug() : CC.go('aanwezigheid'); });

  // Sjabloon uit het opleidingsprofiel (bijv. DCG 75): lege plekken met minuten en een voorgestelde fase
  CC.on('tpSjabloon', (el) => { const S = CC.S(); const p = plan(S, el.dataset.id); const s = sjablonen(S).find((x) => x.id === el.dataset.s); if (!p || !s) return;
    p.sjabloon = s.id;
    p.onderdelen = (p.onderdelen || []).concat((s.blokken || []).map((b) => ({ id: nieuwId('o'), blok: b.blok, min: Number(b.min) || 0, spacing: b.blok === 'S', naam: b.blok === 'S' ? '' : b.naam || '', sjabloonFase: b.fase || null })));
    p.overig = s.overig ? { naam: s.overig.naam, min: Number(s.overig.min) || 0 } : null;
    CC.save(); CC.render(); });
  CC.on('tpOverig', (el) => { const p = plan(CC.S(), el.dataset.id); if (!p || !p.overig) return;
    CC.sheet(p.overig.naam || 'Ombouw', `<form data-submit="tpOverigOk" data-id="${el.dataset.id}" class="codeform"><label for="ov-m">Minuten</label><input id="ov-m" name="min" type="number" inputmode="numeric" min="0" max="60" value="${Number(p.overig.min) || 0}"><button class="knop vol">Klaar</button></form>`); });
  CC.on('tpOverigOk', (f) => { const p = plan(CC.S(), f.dataset.id); if (!p || !p.overig) return; p.overig.min = Number(f.min.value) || 0; CC.save(); CC.closeSheet(); CC.render(); });

  // Onderdeel: minuten, fase, variant, spacing, volgorde, dupliceren, verwijderen
  CC.on('tpOnderdeel', (el) => {
    const S = CC.S(); const p = plan(S, el.dataset.id); const i = Number(el.dataset.i); const o = p && p.onderdelen[i]; if (!o) return;
    const v = o.vormId && vorm(S, o.vormId); const fs = fasen(S); const f = faseVan(S, o);
    const titel = v ? v.naam : o.spacing ? 'Spacing' : `${code(o) ? `${code(o)} · ` : ''}${o.naam || 'Kies een vorm'}`;
    CC.sheet(titel, `${!v ? `<button class="knop vol" data-act="tpVormKiezen" data-id="${el.dataset.id}" data-i="${i}">${icon('plus')}${o.spacing ? 'Kies een vorm als spacing' : 'Kies een vorm'}</button>` : ''}
      <form data-submit="tpOnderdeelOk" data-id="${el.dataset.id}" data-i="${i}" class="codeform">
      ${o.spacing && !v ? `<label for="on-n">Wat doen ze?</label><input id="on-n" name="naam" value="${esc(o.naam || '')}" placeholder="Bijv. Hooghouden">` : ''}
      <div class="twee"><div><label for="on-m">Minuten (gepland)</label><input id="on-m" name="min" type="number" inputmode="numeric" min="0" max="90" value="${Number(o.min) || 0}"></div>
        <div><label for="on-t">Notitie</label><input id="on-t" name="notitie" value="${esc(o.notitie || '')}" placeholder="Bijv. herhaling"></div></div>
      ${v && (v.varianten || []).length ? `<fieldset class="tr-chips"><legend>Variant (context vorm)</legend><label class="tr-chip"><input type="radio" name="variant" value="" ${o.variant == null ? 'checked' : ''}><span>Basis</span></label>${v.varianten.map((x, j) => `<label class="tr-chip"><input type="radio" name="variant" value="${j}" ${Number(o.variant) === j && o.variant != null ? 'checked' : ''}><span>${esc(x.naam || `Variant ${String.fromCharCode(65 + j)}`)}</span></label>`).join('')}</fieldset>` : ''}
      ${!o.spacing && fs.length ? `<fieldset class="tr-chips"><legend>Fase${f && !f.vast ? ` (voorstel: ${esc(faseNaam(S, f.id))})` : ''}</legend><label class="tr-chip"><input type="radio" name="fase" value="" ${o.fase ? '' : 'checked'}><span>${f && !f.vast ? 'Voorstel' : 'Geen'}</span></label>${fs.map((x) => `<label class="tr-chip"><input type="radio" name="fase" value="${esc(x.id)}" ${o.fase === x.id ? 'checked' : ''}><span>${esc(x.naam)}</span></label>`).join('')}</fieldset>` : ''}
      ${v ? `<label class="schakel"><span>Gebruiken als spacing</span><input type="checkbox" name="spacing" ${o.spacing ? 'checked' : ''}><i></i></label>` : ''}
      <button class="knop vol">Klaar</button></form>
      <div class="knoppen">${i > 0 ? `<button class="knop licht" data-act="tpSchuif" data-id="${el.dataset.id}" data-i="${i}" data-r="-1">↑ Omhoog</button>` : ''}${i < p.onderdelen.length - 1 ? `<button class="knop licht" data-act="tpSchuif" data-id="${el.dataset.id}" data-i="${i}" data-r="1">↓ Omlaag</button>` : ''}
        ${v ? `<button class="knop licht" data-act="vormOpen" data-id="${v.id}">${icon('pencil')}Vorm bekijken</button>` : ''}<button class="knop licht" data-act="tpDupliceer" data-id="${el.dataset.id}" data-i="${i}">${icon('repeat')}Dupliceren</button><button class="knop licht" data-act="tpOnderdeelWeg" data-id="${el.dataset.id}" data-i="${i}" style="color:var(--rood)">${icon('trash-2')}Weghalen</button></div>`);
  });
  CC.on('tpOnderdeelOk', (f) => { const S = CC.S(); const p = plan(S, f.dataset.id); const o = p && p.onderdelen[Number(f.dataset.i)]; if (!o) return;
    o.min = Number(f.min.value) || 0; o.notitie = f.notitie.value.trim(); if (f.naam) o.naam = f.naam.value.trim(); if (f.spacing) o.spacing = f.spacing.checked;
    const fa = f.querySelector('input[name="fase"]:checked'); if (fa) o.fase = fa.value || null;
    const va = f.querySelector('input[name="variant"]:checked'); if (va) o.variant = va.value === '' ? null : Number(va.value);
    CC.save(); CC.closeSheet(); CC.render(); });
  CC.on('tpSchuif', (el) => { const S = CC.S(); const p = plan(S, el.dataset.id); const i = Number(el.dataset.i), j = i + Number(el.dataset.r); if (!p || j < 0 || j >= p.onderdelen.length) return;
    [p.onderdelen[i], p.onderdelen[j]] = [p.onderdelen[j], p.onderdelen[i]]; CC.save(); CC.closeSheet(); CC.render(); });
  // Dupliceren: hetzelfde onderdeel er direct onder (bijv. dezelfde vorm in variant B, of nog een keer spacing)
  CC.on('tpDupliceer', (el) => { const S = CC.S(); const p = plan(S, el.dataset.id); const i = Number(el.dataset.i); if (!p || !p.onderdelen[i]) return;
    p.onderdelen.splice(i + 1, 0, { ...JSON.parse(JSON.stringify(p.onderdelen[i])), id: nieuwId('o'), minUit: null }); CC.save(); CC.closeSheet(); CC.render(); CC.toast('Gedupliceerd'); });
  CC.on('tpOnderdeelWeg', (el) => { const S = CC.S(); const p = plan(S, el.dataset.id); if (!p) return; p.onderdelen.splice(Number(el.dataset.i), 1); CC.save(); CC.closeSheet(); CC.render(); });
  CC.on('tpSpacing', (el) => { const S = CC.S(); const p = plan(S, el.dataset.id); if (!p) return; p.onderdelen.push({ id: nieuwId('o'), spacing: true, naam: 'Hooghouden', min: 2 }); CC.save(); CC.render(); });

  // Vorm kiezen: eerst wat past bij het aantal spelers en keepers van deze training; met data-i vul je een lege plek
  CC.on('tpVormKiezen', (el) => {
    const S = CC.S(); const p = plan(S, el.dataset.id); if (!p) return; const slot = el.dataset.i != null ? `data-i="${el.dataset.i}"` : '';
    const n = Number(p.spelers) || 0, k = p.keepers == null ? null : Number(p.keepers);
    const lijst = mijnVormen(S).slice().sort((x, y) => x.naam.localeCompare(y.naam));
    const goed = n ? lijst.filter((v) => past(v, n, k) || voorAantal(v, n, k)) : lijst; const rest = n ? lijst.filter((v) => !goed.includes(v)) : [];
    const rij = (v) => `<button type="button" class="tr-rij" data-act="tpVormErbij" data-id="${el.dataset.id}" data-v="${v.id}" ${slot}>${mini(v)}<span class="tr-t"><b>${esc(v.naam)}</b><small>${[vormSub(S, v), ldNaam(S, koppeling(S, v).primair), n && voorAantal(v, n, k) ? esc(voorAantal(v, n, k).tekst) : ''].filter(Boolean).join(' · ')}</small></span></button>`;
    CC.sheet('Vorm kiezen', `${n ? `<p class="zacht klein">Passend bij <b>${n} spelers${k != null ? ` en ${k} keeper${k === 1 ? '' : 's'}` : ''}</b>.</p>` : ''}
      ${goed.length ? `<div class="tr-lijst">${goed.map(rij).join('')}</div>` : `<p class="zacht">${lijst.length ? 'Geen vorm voor dit aantal.' : 'Je hebt nog geen vormen.'}</p>`}
      ${rest.length ? `<details class="uitklap"><summary>Andere vormen (${rest.length})</summary><div class="tr-lijst">${rest.map(rij).join('')}</div></details>` : ''}
      <button class="knop licht vol" data-act="vormNieuw" data-plan="${el.dataset.id}" ${slot}>${icon('plus')}Nieuwe vorm maken</button>`, { groot: true });
  });
  const zetIn = (p, v, i) => { const o = i != null && p.onderdelen[Number(i)];
    if (o) { o.vormId = v.id; if (!o.min) o.min = Number(v.duur) || 0; return; }
    p.onderdelen.push({ id: nieuwId('o'), vormId: v.id, min: Number(v.duur) || 0, spacing: false }); };
  CC.on('tpVormErbij', (el) => { const S = CC.S(); const p = plan(S, el.dataset.id); const v = vorm(S, el.dataset.v); if (!p || !v) return;
    zetIn(p, v, el.dataset.i); CC.save(); CC.closeSheet(); CC.render(); });
  // Eerdere training als basis: opbouw, thema en leerdoelen overnemen
  CC.on('tpKopie', (el) => {
    const S = CC.S(); const p = plan(S, el.dataset.id);
    const eerder = plannen(S).filter((x) => x.eigenaar === ik() && x !== p && (x.onderdelen || []).length).sort((x, y) => String(y.datum).localeCompare(String(x.datum)));
    CC.sheet('Eerdere training gebruiken', eerder.length ? `<p class="zacht klein">De opbouw komt in deze training; daarna pas je aan wat anders moet.</p><div class="tr-lijst">${eerder.map((x) => { const v = (x.onderdelen || []).map((o) => o.vormId && vorm(S, o.vormId)).find(Boolean);
      return `<button type="button" class="tr-rij" data-act="tpKopieOk" data-id="${el.dataset.id}" data-van="${x.id}">${mini(v)}<span class="tr-t"><b>${esc(x.thema || 'Training')}</b><small>${D.kort(x.datum)} · ${x.onderdelen.length} onderdelen${x.spelers ? ` · ${x.spelers} spelers` : ''}${x.anders ? ` · ${esc(x.anders)}` : ''}</small></span></button>`; }).join('')}</div>`
      : '<p class="zacht">Je hebt nog geen eerdere training met een opbouw.</p>');
  });
  CC.on('tpKopieOk', (el) => { const S = CC.S(); const p = plan(S, el.dataset.id); const van = plannen(S).find((x) => x.id === el.dataset.van); if (!p || !van) return;
    p.onderdelen = (p.onderdelen || []).concat(van.onderdelen.map((o) => ({ ...o, id: nieuwId('o'), minUit: null })));
    if (!p.overig && van.overig) p.overig = { ...van.overig }; if (!p.sjabloon && van.sjabloon) p.sjabloon = van.sjabloon;
    if (!p.thema) p.thema = van.thema; if (!(p.leerdoelen || []).length) p.leerdoelen = (van.leerdoelen || []).slice();
    CC.save(); CC.closeSheet(); CC.render(); CC.toast('Opbouw overgenomen'); });

  // ---------- Periodisering (Besluit 131): minuten per hoofdleerdoel, uitgevoerd ----------
  // Alleen vormen (geen start, spacing of ombouw); het hoofdleerdoel van de vorm krijgt de minuten, secundaire tellen als "ook geraakt".
  CC.minutenPerLeerdoel = (S, maand) => {
    const r = { min: {}, ook: {}, gepland: 0, uit: 0, trainingen: 0 };
    plannen(S).filter((p) => p.eigenaar === ik() && p.gegeven && String(actVan(S, p).datum || '').slice(0, 7) === maand).forEach((p) => { r.trainingen++;
      (p.onderdelen || []).filter((o) => o.vormId && !o.spacing && o.blok !== 'start').forEach((o) => { const v = vorm(S, o.vormId); if (!v) return;
        const uit = o.minUit != null ? Number(o.minUit) : Number(o.min) || 0; r.gepland += Number(o.min) || 0; r.uit += uit;
        const k = koppeling(S, v); if (k.primair) r.min[k.primair] = (r.min[k.primair] || 0) + uit; if (uit) k.ook.forEach((x) => { r.ook[x] = (r.ook[x] || 0) + 1; }); }); });
    return r;
  };
  const maandBlok = (S) => {
    const nu = D.vandaag().slice(0, 7); const r = CC.minutenPerLeerdoel(S, nu); if (!r.trainingen) return '';
    const lds = leerdoelen(S).filter((l) => !String(l.id).startsWith('ld-')); const ids = [...new Set(lds.map((l) => l.id).concat(Object.keys(r.min)))];
    const max = Math.max(1, ...ids.map((x) => r.min[x] || 0)); const ook = Object.entries(r.ook);
    return `<details class="uitklap tr-maand"><summary>${D.MAAND[D.parse(`${nu}-01`).getMonth()]}: minuten per hoofdleerdoel</summary>
      <div class="tr-mlijst">${ids.sort((x, y) => (r.min[y] || 0) - (r.min[x] || 0)).map((x) => `<div><span>${esc(ldNaam(S, x) || 'Onbekend leerdoel')}</span><i style="width:${Math.max(2, Math.round(((r.min[x] || 0) / max) * 100))}%" class="${r.min[x] ? '' : 'nul'}"></i><b>${r.min[x] || 0} min</b></div>`).join('')}</div>
      <small class="zacht">${r.trainingen} training${r.trainingen === 1 ? '' : 'en'} gegeven · uitgevoerd ${r.uit} van ${r.gepland} min gepland${ook.length ? ` · ook geraakt: ${ook.map(([x, n]) => `${esc(ldNaam(S, x))} ${n}×`).join(', ')}` : ''}</small></details>`;
  };

  // ---------- Tabblad Training (Besluit 130): de week met de training bovenaan, aanwezigheid in een venster; Vormen ----------
  CC.trainingTab = (S) => {
    const tid = CC.teamId(); const kop = h.seg('trSeg', [['week', 'Week'], ['vormen', 'Vormen']], 'week');
    if (h.segVal('trSeg', 'week') === 'vormen') return kop + CC.vormenLijst(S);
    const acts = tid && CC.weekActs ? CC.weekActs(S, tid) : [];
    if (!acts.length) return kop + losLijst(S) + maandBlok(S);
    const standaard = acts.find((a) => a.datum === D.vandaag() && a.soort === 'training') || acts.find((a) => a.datum >= D.vandaag() && a.soort === 'training') || acts.find((a) => a.datum === D.vandaag()) || acts[0];
    const a = acts.find((x) => x.id === h.segVal('aanwAct', standaard.id)) || standaard;
    const sp = M.spelers(S, a.teamId); const pr = S.pres[a.id];
    const aanw = a.afgelast ? '' : pr ? `${Object.values(pr.s || {}).filter((v) => v === 'a' || v === 'l').length} van ${sp.length} aanwezig · aanpassen` : `${verwacht(S, a)} van ${sp.length} verwacht`;
    const p = a.soort === 'training' ? plan(S, a.id) : null;
    return `${kop}
      <div class="weekstrook" role="tablist">${acts.map((x) => { const d = D.parse(x.datum); return `<button role="tab" aria-selected="${x.id === a.id}" class="${x.id === a.id ? 'aan' : ''} ${x.afgelast ? 'afg' : ''} ${x.datum === D.vandaag() ? 'vandaag' : ''} ${plan(S, x.id) ? 'gedaan' : ''}" data-act="seg" data-key="aanwAct" data-val="${x.id}"><small>${D.DAG_KORT[d.getDay()]}</small><b>${d.getDate()}</b><small>${x.soort === 'training' ? 'T' : 'W'}</small></button>`; }).join('')}</div>
      <div class="kaart-kop los">${h.datumBlok(a)}<div><b>${h.actTitel(S, a)}</b><small>${h.actSub(S, a)}</small></div></div>${!a.afgelast && a.adres && (a.soort === 'activiteit' || (M.isWed(a) && !a.thuis)) ? `<div class="knoppen">${h.adresRegel(a.adres)}</div>` : ''}
      ${aanw ? `<button class="knop licht vol tr-aanw" data-act="aanwVenster" data-id="${a.id}">${icon('clipboard-check')}Aanwezigheid · ${aanw} ▾</button>` : ''}
      ${a.soort !== 'training' ? (S.club.modules.speeltijd && M.isWed(a) ? `<button class="knop vol" data-act="naarWedstrijd" data-id="${a.id}">${icon('trophy')}Naar de wedstrijd</button>` : '')
        : p ? CC.views.trainingsplan(S, { id: a.id }).html : `<button class="knop vol" data-act="tpNieuw" data-id="${a.id}" data-inline="1">${icon('pencil')}Training voorbereiden of vastleggen</button>`}
      ${CC.kanNietBlok && D.start(a) > new Date() ? CC.kanNietBlok(S, a) : ''}
      ${maandBlok(S)}
      ${CC.mag('planning') ? `<button class="knop licht vol" data-act="planningAanpassen">${icon('calendar-plus')}Planning aanpassen of iets toevoegen</button>` : ''}`;
  };
  // Aanwezigheid opnemen in een venster; het venster tekent mee als je een naam aantikt, en sluit na Opslaan
  CC.on('aanwVenster', (el) => { const S = CC.S(); const a = M.act(S, el.dataset.id); if (!a) return; const d = D.parse(a.datum);
    CC.sheet(`Aanwezigheid · ${D.DAG_KORT[d.getDay()]} ${d.getDate()} ${D.MAAND[d.getMonth()]}`, `<div data-aanw-venster="${a.id}">${CC.opnemenHtml(S, a)}</div>`, { groot: true }); });
  // Vensters die meetekenen na een render: aanwezigheid en het filtervenster van Mijn vormen
  const render0 = CC.render;
  CC.render = (...x) => { render0(...x); const S = CC.S();
    const v = document.querySelector('#sheet:not([hidden]) [data-aanw-venster]'); if (v) { const a = M.act(S, v.dataset.aanwVenster); if (a) v.innerHTML = CC.opnemenHtml(S, a); }
    const f = document.querySelector('#sheet:not([hidden]) [data-vf-venster]'); if (f) f.innerHTML = filterHtml(S); };
  document.addEventListener('click', (e) => { if (e.target.closest('#sheet [data-aanw-venster] [data-act="opslaanAanwezigheid"]')) setTimeout(() => { CC.closeSheet(); CC.render(); }, 0); }, true);

  // Zonder planning (bijv. pakket Trainers begeleiden): trainingen op datum
  const losLijst = (S) => { const l = plannen(S).filter((p) => p.eigenaar === ik()).sort((x, y) => String(y.datum).localeCompare(String(x.datum)));
    return `<button class="knop vol" data-act="tpLosNieuw">${icon('plus')}Nieuwe training</button>
      ${l.length ? `<div class="kaartje"><div class="tr-lijst">${l.map((p) => { const v = (p.onderdelen || []).map((o) => o.vormId && vorm(S, o.vormId)).find(Boolean);
        return `<button type="button" class="tr-rij" data-act="open" data-view="trainingsplan" data-id="${esc(p.actId)}">${mini(v)}<span class="tr-t"><b>${esc(p.thema || 'Training')}</b><small>${D.kort(p.datum)} · ${(p.onderdelen || []).length} onderdelen · ${totaal(p)} min</small></span></button>`; }).join('')}</div></div>`
        : h.leeg('Nog geen trainingen. Maak je eerste training: kies een datum en zet er vormen en spacing in.', 'list-checks')}`; };
  CC.on('tpLosNieuw', () => CC.sheet('Nieuwe training', `<form data-submit="tpLosOk" class="codeform"><label for="tl-d">Datum</label><input id="tl-d" name="datum" type="date" required value="${D.vandaag()}"><button class="knop vol">Maken</button></form>`));
  CC.on('tpLosOk', (f) => { const S = CC.S(); const id = nieuwId('tp'); plannen(S).push({ id, actId: id, los: true, teamId: CC.teamId ? CC.teamId() : null, datum: f.datum.value, eigenaar: ik(), thema: '', leerdoelen: [], onderdelen: [], spelers: null, keepers: null });
    CC.save(); CC.closeSheet(); CC.open('trainingsplan', { id }); });

  // ---------- Mijn vormen (Training → Vormen): zoeken en filters die je kunt combineren ----------
  const vf = () => CC.ui.vf || (CC.ui.vf = {});
  const teamGrootte = (S) => { const tid = CC.teamId && CC.teamId(); return tid ? M.spelers(S, tid).length : 0; };
  const FILTERS = (S) => [
    ['type', 'Vormtype', VT.types.map((t) => [t.id, t.naam])],
    ['weer', 'Weerstand', [['zonder', 'zonder'], ['ondertal', 'ondertal'], ['gelijk', 'gelijk'], ['overtal', 'overtal']]],
    ['ld', 'Leerdoel', leerdoelen(S).map((l) => [l.id, l.naam])],
    ['tijd', 'Spelers en tijd', [teamGrootte(S) ? ['past', `past bij ${teamGrootte(S)} spelers`] : null, ['kort', '≤ 10 min'], ['keepers', 'met keepers']].filter(Boolean)],
  ];
  const MEER = (S) => [['fase', 'Aanbevolen fase', fasen(S).map((f) => [f.id, f.naam])], ['richting', 'Speelrichting', [['0', 'geen'], ['1', 'één'], ['2', 'twee']]],
    ['omsch', 'Omschakeling', VT.omschakeling.filter((o) => o.id !== 'geen').map((o) => [o.id, o.naam])]];
  const filterNaam = (S, k, w) => { const g = FILTERS(S).concat(MEER(S)).find((x) => x[0] === k); return ((g && g[2].find((x) => x[0] === w)) || [w, w])[1]; };
  const zoekTreft = (S, v, q) => { if (!q) return true; const t = q.toLowerCase().trim(); const syn = VT.synoniemen[t];
    return (syn && typeVan(v) === syn) || [v.naam, v.organisatie, v.coach, typeNaam(typeVan(v)), (v.tags || []).join(' '), ldNaam(S, koppeling(S, v).primair)].join(' ').toLowerCase().includes(t); };
  const treft = (S, v, f, zonderPast) => {
    if (f.type && typeVan(v) !== f.type) return false;
    if (f.weer && (CC.weerstand(S, v) || {}).rel !== f.weer) return false;
    if (f.ld) { const k = koppeling(S, v); if (k.primair !== f.ld && !k.ook.includes(f.ld)) return false; }
    if (f.kort && !(Number(v.duur) > 0 && Number(v.duur) <= 10)) return false;
    if (f.keepers && !(Number(v.keepersMax) > 0 || Number((v.aantal || {}).keepers) > 0)) return false;
    if (f.fase && v.faseAdvies !== f.fase) return false;
    if (f.richting != null && f.richting !== '' && String(v.richting) !== String(f.richting)) return false;
    if (f.omsch && v.omschakeling !== f.omsch) return false;
    if (!zonderPast && f.past && !past(v, teamGrootte(S), null)) return false;
    return zoekTreft(S, v, f.q);
  };
  const kaart = (S, v) => `<button type="button" class="tr-kaart" data-act="vormOpen" data-id="${v.id}"><span class="tr-teken">${v.tekening ? tekening(v.tekening) : icon('pencil')}</span><span class="tr-t"><b>${esc(v.naam)}</b><small>${vormSub(S, v)}</small>${koppeling(S, v).primair ? `<small class="tr-ld">${esc(ldNaam(S, koppeling(S, v).primair))}</small>` : ''}</span></button>`;
  const resultaat = (S) => { const f = vf(); const alle = mijnVormen(S).slice().sort((x, y) => x.naam.localeCompare(y.naam));
    const l = alle.filter((v) => treft(S, v, f)); const niet = f.past ? alle.filter((v) => !l.includes(v) && treft(S, v, f, true)) : [];
    if (!alle.length) return h.leeg('Nog geen vormen. Maak je eerste vorm, of voeg er een toe vanuit een training.', 'pencil');
    return `${l.length ? `<div class="tr-raster">${l.map((v) => kaart(S, v)).join('')}</div>` : '<p class="zacht">Geen vorm met deze filters.</p>'}
      ${niet.length ? `<details class="uitklap"><summary>Past niet bij ${teamGrootte(S)} spelers (${niet.length})</summary><div class="tr-raster">${niet.map((v) => kaart(S, v)).join('')}</div></details>` : ''}`; };
  const actief = (S) => Object.entries(vf()).filter(([k, w]) => k !== 'q' && w != null && w !== '' && w !== false);
  CC.vormenLijst = (S) => `<input id="vormZoek" class="tr-zoek" type="search" placeholder="Zoek een vorm (naam, type, leerdoel)…" aria-label="Zoek een vorm" value="${esc(vf().q || '')}">
    <div class="chips tr-filters">${actief(S).map(([k, w]) => `<button class="chipknop aan" data-act="vfWeg" data-k="${k}" aria-label="Filter weghalen: ${esc(filterNaam(S, k, k === 'past' || k === 'kort' || k === 'keepers' ? k : w))}">${esc(filterNaam(S, k, k === 'past' || k === 'kort' || k === 'keepers' ? k : w))} ✕</button>`).join('')}
      <button class="chipknop" data-act="vfOpen">${icon('plus')}Filter</button>${actief(S).length ? '<button class="chipknop tr-wis" data-act="vfWis">Wis</button>' : ''}</div>
    <button class="knop vol" data-act="vormNieuw">${icon('plus')}Nieuwe vorm</button>
    <div id="vormResultaat">${resultaat(S)}</div>`;
  document.addEventListener('input', (e) => { if (e.target.id !== 'vormZoek') return; vf().q = e.target.value; const r = document.getElementById('vormResultaat'); if (r) r.innerHTML = resultaat(CC.S()); });
  // Filtervenster: chips werken meteen; de knop onderaan toont hoeveel vormen er overblijven
  const chipsVoor = (k, opties) => { const f = vf(); return opties.map(([w, n]) => { const aan = ['past', 'kort', 'keepers'].includes(w) ? !!f[w] : String(f[k]) === String(w);
    return `<button class="chipknop ${aan ? 'aan' : ''}" aria-pressed="${aan}" data-act="vfZet" data-k="${['past', 'kort', 'keepers'].includes(w) ? w : k}" data-w="${esc(w)}">${esc(n)}</button>`; }).join(''); };
  const filterHtml = (S) => { const n = mijnVormen(S).filter((v) => treft(S, v, vf())).length;
    return `${FILTERS(S).filter((g) => g[2].length).map(([k, t, o]) => `${h.sectie(t)}<div class="chips">${chipsVoor(k, o)}</div>`).join('')}
      <details class="uitklap" ${MEER(S).some(([k]) => vf()[k] != null && vf()[k] !== '') ? 'open' : ''}><summary>Meer: fase, speelrichting, omschakeling</summary>${MEER(S).filter((g) => g[2].length).map(([k, t, o]) => `${h.sectie(t)}<div class="chips">${chipsVoor(k, o)}</div>`).join('')}<p></p></details>
      <button class="knop vol" data-act="sluit">Toon ${n} vorm${n === 1 ? '' : 'en'}</button>`; };
  CC.on('vfOpen', () => CC.sheet('Filter', `<div data-vf-venster>${filterHtml(CC.S())}</div>`, { groot: true }));
  CC.on('vfZet', (el) => { const f = vf(); const k = el.dataset.k, w = el.dataset.w;
    if (['past', 'kort', 'keepers'].includes(k)) f[k] = !f[k]; else f[k] = String(f[k]) === String(w) ? null : w; CC.render(); });
  CC.on('vfWeg', (el) => { vf()[el.dataset.k] = null; CC.render(); });
  CC.on('vfWis', () => { CC.ui.vf = { q: vf().q }; CC.render(); });

  CC.on('vormNieuw', (el) => {
    const S = CC.S(); const v = { id: nieuwId('v'), eigenaar: ik(), teamId: CC.teamId ? CC.teamId() : null, naam: 'Nieuwe vorm', type: null, status: 'concept', spelersMin: null, spelersMax: null, keepersMin: null, keepersMax: null, duur: 6, koppelingen: {}, organisatie: '', coach: '', anders: '', aantallen: [], varianten: [], tekening: null, gemaakt: new Date().toISOString() };
    vormen(S).push(v);
    // Vanuit een training: meteen in die training zetten (of op de lege plek waar je vandaan kwam)
    if (el.dataset.plan) { const p = plan(S, el.dataset.plan); if (p) zetIn(p, v, el.dataset.i); }
    CC.save(); CC.closeSheet(); CC.open('vorm', { id: v.id });
  });

  // ---------- Vorm bekijken (venster): eerst lezen, bewerken alleen als je iets wijzigt ----------
  const kijkHtml = (S, v) => { const k = koppeling(S, v); const w = CC.weerstand(S, v); const c = context(v); const ty = typeVan(v);
    const aand = (v.aanduiding || []).map((x) => (VT.aanduidingen.find((a) => a.id === x) || {}).naam).filter(Boolean);
    return `<div class="tr-groot">${v.tekening ? tekening(v.tekening) : `<div class="leeg">${icon('pencil')}<p>Nog geen tekening</p></div>`}</div>
      <div class="chips tr-labels">${ty ? `<span class="chip blauw">${esc(typeNaam(ty))}${aand.length ? ` · ${esc(aand.join(', '))}` : ''}</span>` : ''}${w ? `<span class="chip groen">${esc(w.kort)}</span>` : ''}${c ? `<span class="chip grijs">${esc(c)}</span>` : ''}${v.afmeting ? `<span class="chip grijs">${esc(v.afmeting)}</span>` : ''}</div>
      ${k.primair || v.faseAdvies ? `<p class="klein">${k.primair ? `<b>Leerdoel:</b> ★ ${esc(ldNaam(S, k.primair))}${k.ook.length ? ` · ook: ${k.ook.map((x) => esc(ldNaam(S, x))).join(', ')}` : ''}` : ''}${v.faseAdvies ? `${k.primair ? ' · ' : ''}<b>advies:</b> ${esc(faseNaam(S, v.faseAdvies))}` : ''}</p>` : ''}
      <p class="zacht klein">${[bereik(v.spelersMin, v.spelersMax, 'spelers'), bereik(v.keepersMin, v.keepersMax, 'keepers'), v.duur ? `${v.duur} min` : ''].filter(Boolean).join(' · ')}</p>
      ${v.organisatie ? `${h.sectie('Organisatie en regels')}<p class="tr-tekst">${esc(v.organisatie)}</p>` : ''}
      ${v.coach ? `${h.sectie('Coachpunten')}<p class="tr-tekst">${esc(v.coach)}</p>` : ''}
      ${(v.varianten || []).length ? `<details class="uitklap"><summary>Varianten (${v.varianten.length})</summary>${v.varianten.map((x, i) => `<p class="klein"><b>${esc(x.naam || `Variant ${String.fromCharCode(65 + i)}`)}</b>${x.tekst ? ` · ${esc(x.tekst)}` : ''}</p>`).join('')}</details>` : ''}
      ${v.anders ? `<p class="zacht klein"><b>Volgende keer anders:</b> ${esc(v.anders)}</p>` : ''}
      <div class="knoppen"><button class="knop" data-act="vormBewerk" data-id="${v.id}">${icon('pencil')}Bewerken</button><button class="knop licht" data-act="vormKopie" data-id="${v.id}">${icon('repeat')}Dupliceren</button></div>`; };
  CC.on('vormOpen', (el) => { const S = CC.S(); const v = vorm(S, el.dataset.id); if (!v) return; CC.closeSheet(); CC.sheet(v.naam, kijkHtml(S, v), { groot: true }); });
  CC.on('vormBewerk', (el) => { CC.closeSheet(); CC.open('vorm', { id: el.dataset.id }); });

  // ---------- Vorm bewerken (pagina): tekening en varianten links, gegevens rechts op de laptop ----------
  const kies = (v, veld, w, naam, aan) => `<button type="button" class="chipknop ${aan ? 'aan' : ''}" aria-pressed="${!!aan}" data-act="vormKies" data-id="${v.id}" data-veld="${veld}" data-w="${esc(w)}">${naam}</button>`;
  const classificatie = (S, v) => { const lds = leerdoelen(S); const k = koppeling(S, v); const a = v.aantal || {}; const w = CC.weerstand(S, v); const ty = typeVan(v);
    const precies = VT.precies.filter((x) => x.type === ty); const num = (n, x) => `<input name="${n}" type="number" inputmode="numeric" min="0" max="30" aria-label="${n}" value="${x == null ? '' : x}">`;
    return `<div class="tr-cls"><b class="tr-cls-kop">Classificatie</b><small class="zacht">Alles mag leeg blijven.</small>
      ${lds.length ? `${h.sectie(`Leerdoel · ${esc((profiel(S) || {}).naam || 'opleidingsprofiel')}`)}<div class="chips">${lds.map((l) => kies(v, 'ld', l.id, `${k.primair === l.id ? '★ ' : k.ook.includes(l.id) ? '+ ' : ''}${esc(l.naam)}`, k.primair === l.id || k.ook.includes(l.id))).join('')}</div>
        <small class="zacht">Eerste tik = hoofdleerdoel (★): bepaalt de minuten en het perspectief. Daarna = ook (+).</small>` : ''}
      ${h.sectie('Aantallen per groepje')}<div class="tr-num"><span>aanval</span>${num('aan', a.aanval)}<span>verdediging</span>${num('ver', a.verdediging)}<span>neutraal</span>${num('neu', a.neutraal)}<span>keepers</span>${num('kee', a.keepers)}</div>
      <div class="tr-auto" aria-live="polite" ${w ? '' : 'hidden'}>${w ? esc(w.kort) : ''}</div>${w && !w.rel && !w.kant && !v.weerstandExtra && !koppeling(S, v).primair ? '<small class="zacht">Kies een hoofdleerdoel voor over- of ondertal.</small>' : ''}
      <div class="chips"><span class="zacht klein tr-lbl">Weerstand?</span>${VT.weerstandExtra.map((x) => kies(v, 'weerstandExtra', x.id, x.naam, v.weerstandExtra === x.id)).join('')}</div>
      ${h.sectie('Vormtype')}<div class="chips">${VT.types.map((t) => kies(v, 'type', t.id, esc(t.naam), ty === t.id)).join('')}</div>
      <div class="chips">${VT.aanduidingen.map((x) => kies(v, 'aanduiding', x.id, `${(v.aanduiding || []).includes(x.id) ? '✓' : '+'} ${esc(x.naam)}`, (v.aanduiding || []).includes(x.id))).join('')}</div>
      ${precies.length > 1 ? `<details class="uitklap tr-precies" ${(v.precies || []).length ? 'open' : ''}><summary>Meer precies (optioneel)</summary><div class="chips">${precies.map((x) => kies(v, 'precies', x.id, esc(x.naam), (v.precies || []).includes(x.id))).join('')}</div><p></p></details>` : ''}
      ${h.sectie('Speelrichting')}<div class="chips">${[[0, 'geen'], [1, 'één'], [2, 'twee']].map(([x, n]) => kies(v, 'richting', x, n, v.richting === x)).join('')}${kies(v, 'doelen', 'ja', `${v.doelen ? '✓ ' : ''}met doelen`, v.doelen === true)}</div>
      ${h.sectie('Omschakeling')}<div class="chips">${VT.omschakeling.map((o) => kies(v, 'omschakeling', o.id, esc(o.naam), v.omschakeling === o.id)).join('')}</div>
      ${fasen(S).length ? `${h.sectie('Aanbevolen fase (optioneel)')}<div class="chips">${fasen(S).map((f) => kies(v, 'faseAdvies', f.id, esc(f.naam), v.faseAdvies === f.id)).join('')}</div>` : ''}
      <label for="v-af">Afmeting</label><input id="v-af" name="afmeting" value="${esc(v.afmeting || '')}" placeholder="Bijv. 25 × 20 m">
      </div>`; };
  CC.views.vorm = (S, prm) => {
    const v = vorm(S, prm.id); if (!v || v.weg) return { titel: 'Vorm', html: h.leeg('Deze vorm bestaat niet meer.') };
    const num = (w) => (w == null ? '' : w);
    return { titel: esc(v.naam), sub: 'Mijn vormen', breed: true, html: `
      <div class="tr-lay tr-vorm">
      <div class="tr-kol tr-a">
        <div class="tr-groot">${v.tekening ? tekening(v.tekening) : `<div class="leeg">${icon('pencil')}<p>Nog geen tekening</p></div>`}</div>
        <button class="knop" data-act="vormTeken" data-id="${v.id}">${icon('pencil')}${v.tekening ? 'Tekening aanpassen' : 'Tekening maken'}</button>
      </div>
      <div class="tr-kol tr-c">
        ${h.sectie('Varianten (context vorm)')}
        ${(v.varianten || []).map((x, i) => `<div class="kaartje tr-var"><div class="tr-kop"><b>${esc(x.naam || `Variant ${String.fromCharCode(65 + i)}`)}</b><span><button class="icoonknop" data-act="vormVariant" data-id="${v.id}" data-i="${i}" aria-label="Variant aanpassen">${icon('pencil')}</button></span></div>${x.tekst ? `<p class="klein">${esc(x.tekst)}</p>` : ''}${x.tekening ? `<div class="tr-groot klein">${tekening(x.tekening)}</div>` : ''}</div>`).join('') || '<p class="zacht klein">Bijv. A: de passer loopt om het doeltje, B: tot aan het doel (diepte). Eén vorm met varianten in plaats van veel losse tekeningen.</p>'}
        <button class="knop licht vol" data-act="vormVariant" data-id="${v.id}" data-i="nieuw">${icon('plus')}Variant</button>
        ${h.sectie('Bij andere groepsgroottes')}
        ${(v.aantallen || []).map((x, i) => `<div class="rij"><span class="rij-tekst"><b>${x.spelers} spelers${x.keepers != null && x.keepers !== '' ? ` + ${x.keepers} keeper${Number(x.keepers) === 1 ? '' : 's'}` : ''}</b><small>${esc(x.tekst)}</small></span><button class="icoonknop" data-act="vormAantal" data-id="${v.id}" data-i="${i}" aria-label="Aanpassen">${icon('pencil')}</button></div>`).join('') || '<p class="zacht klein">Schrijf per groepsgrootte hoe je de vorm opzet, bijv. 14 spelers + 2 keepers: 6 tegen 6 met keepers.</p>'}
        <button class="knop licht vol" data-act="vormAantal" data-id="${v.id}" data-i="nieuw">${icon('plus')}Groepsgrootte</button>
      </div>
      <div class="tr-kol tr-b">
        <form class="kaartje codeform" data-autosave="vorm" data-id="${v.id}">
          <label for="v-n">Naam</label><input id="v-n" name="naam" value="${esc(v.naam)}">
          ${classificatie(S, v)}
          <div class="drie"><div><label for="v-s1">Spelers van</label><input id="v-s1" name="s1" type="number" inputmode="numeric" min="0" max="40" value="${num(v.spelersMin)}"></div><div><label for="v-s2">tot</label><input id="v-s2" name="s2" type="number" inputmode="numeric" min="0" max="40" value="${num(v.spelersMax)}"></div><div><label for="v-d">Minuten</label><input id="v-d" name="duur" type="number" inputmode="numeric" min="0" max="90" value="${num(v.duur)}"></div></div>
          <div class="twee"><div><label for="v-k1">Keepers van</label><input id="v-k1" name="k1" type="number" inputmode="numeric" min="0" max="6" value="${num(v.keepersMin)}"></div><div><label for="v-k2">tot</label><input id="v-k2" name="k2" type="number" inputmode="numeric" min="0" max="6" value="${num(v.keepersMax)}"></div></div>
          <label for="v-o">Organisatie en regels</label><textarea id="v-o" name="organisatie" rows="4">${esc(v.organisatie || '')}</textarea>
          <label for="v-c">Coachpunten (accenten)</label><textarea id="v-c" name="coach" rows="3">${esc(v.coach || '')}</textarea>
          <label for="v-a">Wat ik de volgende keer anders doe</label><textarea id="v-a" name="anders" rows="3">${esc(v.anders || '')}</textarea>
          <label for="v-t">Eigen woorden (tags)</label><input id="v-t" name="tags" value="${esc((v.tags || []).join(', '))}" placeholder="Bijv. dreigen, bowlen">
        </form>
        <div class="knoppen"><button class="knop licht" data-act="vormKopie" data-id="${v.id}">${icon('repeat')}Dupliceren</button><button class="knop licht" data-act="vormWeg" data-id="${v.id}" style="color:var(--rood)">${icon('trash-2')}Verwijderen</button></div>
      </div></div>` };
  };
  const getal = (x) => (x === '' || x == null ? null : Number(x));
  CC.autosave.vorm = (f) => { const S = CC.S(); const v = vorm(S, f.dataset.id); if (!v) return;
    Object.assign(v, { naam: f.naam.value.trim() || 'Vorm', spelersMin: getal(f.s1.value), spelersMax: getal(f.s2.value), keepersMin: getal(f.k1.value), keepersMax: getal(f.k2.value), duur: getal(f.duur.value),
      organisatie: f.organisatie.value.trim(), coach: f.coach.value.trim(), anders: f.anders.value.trim(), afmeting: f.afmeting.value.trim(),
      tags: f.tags.value.split(',').map((x) => x.trim()).filter(Boolean),
      aantal: { aanval: getal(f.aan.value), verdediging: getal(f.ver.value), neutraal: getal(f.neu.value), keepers: getal(f.kee.value) } });
    // De weerstand rekent mee: het vak eronder direct bijwerken, zonder het formulier opnieuw te tekenen
    const w = CC.weerstand(S, v); const box = f.querySelector('.tr-auto'); if (box) { box.textContent = w ? w.kort : ''; box.hidden = !w; } };
  // Keuzes in de classificatie: nog een tik = weer leeg (alles is optioneel)
  CC.on('vormKies', (el) => { const S = CC.S(); const v = vorm(S, el.dataset.id); if (!v) return; const veld = el.dataset.veld, w = el.dataset.w;
    if (veld === 'ld') { const pid = profielId(S); const k = koppeling(S, v); v.koppelingen = v.koppelingen || {};
      if (k.primair === w) k.primair = null; else if (k.ook.includes(w)) k.ook = k.ook.filter((x) => x !== w); else if (!k.primair) k.primair = w; else k.ook = k.ook.concat(w);
      v.koppelingen[pid] = { primair: k.primair, ook: k.ook }; v.leerdoelen = [k.primair, ...k.ook].filter(Boolean); }
    else if (veld === 'type') { const was = typeVan(v); v.type = was === w ? null : w; v.precies = (v.precies || []).filter((x) => (VT.precies.find((p) => p.id === x) || {}).type === v.type); }
    else if (veld === 'precies' || veld === 'aanduiding') { const l = v[veld] || []; v[veld] = l.includes(w) ? l.filter((x) => x !== w) : l.concat(w); }
    else if (veld === 'richting') v.richting = v.richting === Number(w) ? null : Number(w);
    else if (veld === 'doelen') v.doelen = v.doelen ? null : true;
    else v[veld] = v[veld] === w ? null : w;
    CC.save(); CC.render(); });
  CC.on('vormKopie', (el) => { const S = CC.S(); const v = vorm(S, el.dataset.id); if (!v) return; const c = JSON.parse(JSON.stringify(v)); c.id = nieuwId('v'); c.naam = `${v.naam} (kopie)`; c.status = 'concept'; c.gemaakt = new Date().toISOString(); vormen(S).push(c); CC.save(); CC.closeSheet(); CC.open('vorm', { id: c.id }); CC.toast('Gedupliceerd'); });
  CC.on('vormWeg', (el) => CC.sheet('Vorm verwijderen?', `<p>De vorm verdwijnt uit je lijst. Trainingen waarin hij stond, houden zijn naam en tekening.</p><div class="knoppen"><button class="knop rood" data-act="vormWegOk" data-id="${el.dataset.id}">Verwijderen</button><button class="knop licht" data-act="sluit">Annuleren</button></div>`));
  // Zacht verwijderen: trainingen die de vorm gebruikten blijven kloppen (momentopname, pilotlog)
  CC.on('vormWegOk', (el) => { const S = CC.S(); const v = vorm(S, el.dataset.id); if (v) v.weg = true; CC.save(); CC.closeSheet(); if (CC.terug) CC.terug(); else CC.render(); });

  // Tekening maken of aanpassen (hoofdtekening of variant) met de tekentool
  const tekenOpen = (t, klaar) => { if (!window.DrawTool) { CC.toast('De tekentool is niet geladen', 'fout'); return; } window.DrawTool.open(t || null, (blob, data) => { klaar(data); CC.save(); CC.render(); }); };
  // Na het tekenen de vorm opnieuw opzoeken: de app kan de gegevens intussen ververst hebben (anders gaat de tekening verloren)
  CC.on('vormTeken', (el) => { const id = el.dataset.id; const v = vorm(CC.S(), id); if (v) tekenOpen(v.tekening, (d) => { const nu = vorm(CC.S(), id); if (nu) nu.tekening = d; }); });

  // Variant: naam, tekst en eigen tekening
  CC.on('vormVariant', (el) => {
    const v = vorm(CC.S(), el.dataset.id); if (!v) return; const nieuw = el.dataset.i === 'nieuw'; const x = nieuw ? {} : v.varianten[Number(el.dataset.i)];
    CC.sheet(nieuw ? 'Variant toevoegen' : 'Variant', `<form data-submit="vormVariantOk" data-id="${v.id}" data-i="${el.dataset.i}" class="codeform">
      <label for="va-n">Naam</label><input id="va-n" name="naam" value="${esc(x.naam || '')}" placeholder="Bijv. B: tot aan het doel">
      <label for="va-t">Wat is anders?</label><textarea id="va-t" name="tekst" rows="3">${esc(x.tekst || '')}</textarea>
      <button class="knop vol">Klaar</button></form>
      ${nieuw ? '' : `<div class="knoppen"><button class="knop licht" data-act="vormVariantTeken" data-id="${v.id}" data-i="${el.dataset.i}">${icon('pencil')}${x.tekening ? 'Tekening aanpassen' : 'Tekening maken'}</button><button class="knop licht" data-act="vormVariantWeg" data-id="${v.id}" data-i="${el.dataset.i}" style="color:var(--rood)">${icon('trash-2')}Weghalen</button></div>`}`);
  });
  CC.on('vormVariantOk', (f) => { const v = vorm(CC.S(), f.dataset.id); if (!v) return; v.varianten = v.varianten || [];
    const x = { naam: f.naam.value.trim(), tekst: f.tekst.value.trim() };
    if (f.dataset.i === 'nieuw') v.varianten.push(x); else Object.assign(v.varianten[Number(f.dataset.i)], x);
    CC.save(); CC.closeSheet(); CC.render(); });
  CC.on('vormVariantTeken', (el) => { const v = vorm(CC.S(), el.dataset.id); const x = v && v.varianten[Number(el.dataset.i)]; if (!x) return; CC.closeSheet();
    // Een nieuwe variant begint met de hoofdtekening, zodat je alleen het verschil tekent
    const id = el.dataset.id, i = Number(el.dataset.i);
    tekenOpen(x.tekening || v.tekening, (d) => { const nu = vorm(CC.S(), id); if (nu && nu.varianten[i]) nu.varianten[i].tekening = d; }); });
  CC.on('vormVariantWeg', (el) => { const v = vorm(CC.S(), el.dataset.id); if (!v) return; v.varianten.splice(Number(el.dataset.i), 1); CC.save(); CC.closeSheet(); CC.render(); });

  // Bij andere groepsgroottes: per aantal een korte opzet
  CC.on('vormAantal', (el) => {
    const v = vorm(CC.S(), el.dataset.id); if (!v) return; const nieuw = el.dataset.i === 'nieuw'; const x = nieuw ? {} : v.aantallen[Number(el.dataset.i)];
    CC.sheet('Bij dit aantal', `<form data-submit="vormAantalOk" data-id="${v.id}" data-i="${el.dataset.i}" class="codeform">
      <div class="twee"><div><label for="aa-s">Spelers</label><input id="aa-s" name="spelers" type="number" inputmode="numeric" min="1" max="40" required value="${x.spelers || ''}"></div>
        <div><label for="aa-k">Keepers</label><input id="aa-k" name="keepers" type="number" inputmode="numeric" min="0" max="6" value="${x.keepers == null ? '' : x.keepers}"></div></div>
      <label for="aa-t">Zo zet je het op</label><textarea id="aa-t" name="tekst" rows="3" required placeholder="Bijv. 6 tegen 6 + keepers, de 10 en de 6 neutraal">${esc(x.tekst || '')}</textarea>
      <button class="knop vol">Klaar</button></form>${nieuw ? '' : `<button class="knop licht vol" data-act="vormAantalWeg" data-id="${v.id}" data-i="${el.dataset.i}" style="color:var(--rood)">${icon('trash-2')}Weghalen</button>`}`);
  });
  CC.on('vormAantalOk', (f) => { const v = vorm(CC.S(), f.dataset.id); if (!v) return; v.aantallen = v.aantallen || [];
    const x = { spelers: Number(f.spelers.value), keepers: getal(f.keepers.value), tekst: f.tekst.value.trim() };
    if (f.dataset.i === 'nieuw') v.aantallen.push(x); else v.aantallen[Number(f.dataset.i)] = x;
    v.aantallen.sort((a, b) => a.spelers - b.spelers); CC.save(); CC.closeSheet(); CC.render(); });
  CC.on('vormAantalWeg', (el) => { const v = vorm(CC.S(), el.dataset.id); if (!v) return; v.aantallen.splice(Number(el.dataset.i), 1); CC.save(); CC.closeSheet(); CC.render(); });
})();
