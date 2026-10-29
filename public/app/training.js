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
    // DCG (mengpaneel): geen · gestuurd · beperkt · volledig; alleen volledig geeft over- of ondertal
    if (v.weerstandNiveau && v.weerstandNiveau !== 'volledig') return v.weerstandNiveau === 'geen' ? { kort: `${A + N} spelers · geen weerstand${keepers}`, rel: 'zonder' } : { kort: `${V ? telt : `${A + N} spelers`} · ${v.weerstandNiveau === 'gestuurd' ? 'gestuurde' : 'beperkte'} weerstand${keepers}`, rel: null };
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
  // Leerniveau per blok (Besluit 133): uit het profiel; vastgezet of een voorstel. Zonder leerniveaus in het profiel: de fase zoals voorheen
  const niveaus = (S) => (ond(S, 'leerniveaus') || {}).items || [];
  const niveauNaam = (S, id) => (niveaus(S).find((x) => x.id === id) || {}).naam || '';
  const niveauChip = (S, o) => { const id = o.niveau || o.niveauVoorstel; const n = id && niveauNaam(S, id); return n ? ` <span class="tr-niv ${o.niveau ? '' : 'vs'}">${esc(n)}${o.niveau ? '' : ' · voorstel'}</span>` : ''; };
  const blokChip = (S, o) => (niveaus(S).length ? niveauChip(S, o) : faseChip(S, o));
  const balk = (S, p) => { const o = (p.onderdelen || []).filter((x) => Number(x.min) > 0); if (!o.length) return '';
    const kleur = (x) => { const b = blokSoort(x.blok); if (x.spacing) return BLOKKLEUR.S; if (b && BLOKKLEUR[b]) return BLOKKLEUR[b]; const v = x.vormId && vorm(S, x.vormId); return v ? typeKleur(typeVan(v)) : '#cbd5e1'; };
    return `<div class="tr-balk" aria-hidden="true">${o.map((x) => `<i style="flex:${Number(x.min)};background:${kleur(x)}"></i>`).join('')}${p.overig && Number(p.overig.min) ? `<i style="flex:${Number(p.overig.min)};background:#e2e8f0"></i>` : ''}</div>`; };
  // A = ..., B = ...: het hoofdleerdoel van de eerste vorm in elk blok
  const blokDoelen = (S, p) => ['A', 'B'].map((b) => { const n = ldNaam(S, blokDoel(S, p, b)); return n ? `${b} = ${esc(n)}` : ''; }).filter(Boolean).join(' · ');
  // Leerdoel per blok: zelf gekozen, anders het hoofdleerdoel van de eerste vorm in dat blok
  const blokDoel = (S, p, b) => (p.blokDoel || {})[b] || (() => { const v = (p.onderdelen || []).filter((o) => blokSoort(o.blok) === b).map((o) => o.vormId && vorm(S, o.vormId)).find(Boolean); return v ? koppeling(S, v).primair : (p.blokDoel || {})[b] === null ? null : CC.trWeekDoel ? CC.trWeekDoel(S, p, b) : null; })();
  // Na afloop pas de terugblik (Principe 10: op het juiste moment)
  const opTijd = (datum, tijd) => { const d = D.parse(datum); const [u, m] = String(tijd).split(':').map(Number); d.setHours(u || 0, m || 0, 0, 0); return d; };
  const afgelopen = (a) => { if (!a || !a.datum) return false; if (a.datum < D.vandaag()) return true; if (a.datum > D.vandaag()) return false; return a.eind ? new Date() >= opTijd(a.datum, a.eind) : true; };
  // Aantal spelers: zelf ingevuld, anders uit de aanwezigheid (opgenomen of verwacht)
  const aantalSp = (S, p, a) => { if (p.spelers != null && p.spelers !== '') return Number(p.spelers); const pr = S.pres[a.id]; if (pr) return Object.values(pr.s || {}).filter((x) => x === 'a' || x === 'l').length; return a.teamId && M.act(S, a.id) ? verwacht(S, a) : 0; };
  const dagNaam = (a) => { const d = D.parse(a.datum); return `${D.DAG_KORT[d.getDay()]} ${d.getDate()} ${D.MAAND[d.getMonth()]}`; };
  // Opbouw in groepen: Start · A · B · Partij (spacing hoort bij het blok ervoor); zonder blokken één groep
  const groepen = (p) => { const g = []; (p.onderdelen || []).forEach((o, i) => { let k = blokSoort(o.blok); if (k === 'S') k = g.length ? g[g.length - 1].k : ''; if (!g.length || g[g.length - 1].k !== k) g.push({ k, items: [] }); g[g.length - 1].items.push(i); }); return g; };
  const rijHtml = (S, p, a, o, i, n, k, metCode) => {
    const v = o.vormId && vorm(S, o.vormId);
    const naam = v ? v.naam : o.spacing ? o.naam || 'Spacing' : o.naam || 'Kies oefenvorm';
    const extra = v && n ? (voorAantal(v, n, k) ? esc(voorAantal(v, n, k).tekst) : (!past(v, n, k) ? `gemaakt voor ${bereik(v.spelersMin, v.spelersMax, 'spelers')}` : '')) : '';
    const variant = v && o.variant != null && (v.varianten || [])[o.variant] ? `variant ${esc(v.varianten[o.variant].naam || String.fromCharCode(65 + Number(o.variant)))}` : '';
    const sub = [o.spacing ? (o.naam ? 'spacing' : 'vrij in te vullen') : v ? [typeNaam(typeVan(v)), (CC.weerstand(S, v) || {}).kort].filter(Boolean).join(' · ') : o.blok === 'start' ? 'warming-up · kies een vorm' : 'kies een vorm', variant, o.notitie ? esc(o.notitie) : '', extra].filter(Boolean).join(' · ');
    const sel = leegSlot(o) && (pf().slot || {}).id === a.id && pf().slot.i === i;
    return `<button type="button" class="tr-rij ${sel ? 'kv-sel' : ''}" data-act="${leegSlot(o) ? 'tpLeeg' : 'tpOnderdeel'}" data-id="${a.id}" data-i="${i}" data-drop-i="${i}" ${sel ? 'aria-pressed="true"' : ''}>${metCode ? `<span class="tr-code">${esc(code(o))}</span>` : ''}${leegSlot(o) ? `<span class="tr-mini leeg">${icon('plus')}</span>` : mini(v, o.spacing)}<span class="tr-t"><b>${esc(naam)}</b><small>${sub}${o.spacing || leegSlot(o) && o.blok === 'start' ? '' : blokChip(S, o)}</small></span><span class="tr-min">${Number(o.min) || 0} min${v && n && !past(v, n, k) && !voorAantal(v, n, k) ? '<span class="st o">aantal</span>' : ''}</span></button>`;
  };
  const GROEPNAAM = { start: 'Start', P: 'Partij', '': 'Opbouw' };
  // Het midden van Plannen (en de trainingspagina): kop in één regel, opbouw in blokken
  const planMidden = (S, p, a) => {
    const n = aantalSp(S, p, a), k = p.keepers == null || p.keepers === '' ? null : Number(p.keepers); const metCode = (p.onderdelen || []).some((o) => o.blok); const sj = sjablonen(S);
    const duur = a.eind && a.tijd ? Math.round((opTijd(a.datum, a.eind) - opTijd(a.datum, a.tijd)) / 60000) : null;
    const gezien = {};
    const gr = groepen(p).map((g) => { const min = g.items.reduce((t, i) => t + (Number(p.onderdelen[i].min) || 0), 0); const terug = gezien[g.k]; gezien[g.k] = true;
      const kop = g.k === 'A' || g.k === 'B' ? `<button type="button" class="tr-gkop tr-${g.k}" data-act="tpBlokDoel" data-id="${a.id}" data-b="${g.k}">${g.k}${terug ? ' · terugkeer' : ` · ${blokDoel(S, p, g.k) ? esc(ldNaam(S, blokDoel(S, p, g.k))) : 'kies een leerdoel'} ▾`}</button>` : `<b class="tr-gkop tr-${g.k || 'x'}">${GROEPNAAM[g.k] || 'Opbouw'}</b>`;
      return `<div class="tr-groep"><div class="tr-kop">${kop}<small class="zacht">${min} min</small></div><div class="tr-lijst">${g.items.map((i) => rijHtml(S, p, a, p.onderdelen[i], i, n, k, metCode)).join('')}</div></div>`; }).join('');
    return `<div class="kaartje tr-midden" data-drop-plan="${a.id}">
      <div class="tr-plankop"><div><h2>${esc(dagNaam(a))} · ${esc(p.thema || 'Training')} <button class="icoonknop" data-act="tpKopBewerk" data-id="${a.id}" aria-label="Thema en aantallen aanpassen">${icon('pencil')}</button>${CC.trStatus ? CC.trStatus(S, p) : ''}</h2>
        <small class="zacht">${[a.tijd ? `${a.tijd}${a.eind ? `–${a.eind}` : ''}` : '', n ? `${n} spelers${p.spelers == null || p.spelers === '' ? (S.pres[a.id] ? ' aanwezig' : ' verwacht') : ''}` : '', k ? `${k} keeper${k === 1 ? '' : 's'}` : '', p.sjabloon ? `sjabloon ${esc((sj.find((x) => x.id === p.sjabloon) || { naam: '' }).naam)}` : ''].filter(Boolean).join(' · ')}</small></div>
        <div class="knoppen"><button class="knop licht" data-act="tpKopieNaar" data-id="${a.id}" ${(p.onderdelen || []).length ? '' : 'disabled'}>${icon('repeat')}Kopiëren naar…</button><button class="knop licht" data-act="tpPrint" data-id="${a.id}" ${(p.onderdelen || []).length ? '' : 'disabled'}>${icon('printer')}Printen</button><button class="knop licht" data-act="tpMeer" data-id="${a.id}" aria-label="Meer">⋯</button></div></div>
      ${CC.trMethodiek ? CC.trMethodiek(S, p, a) : ''}
      ${balk(S, p)}
      ${gr || `<p class="zacht">Nog leeg. ${sj.length ? 'Begin met het sjabloon van de club, een eerdere training, of zet' : 'Zet'} vormen en spacing in de volgorde van de training.</p>`}
      ${(p.onderdelen || []).length ? '' : `${sj.map((s) => `<button class="knop vol" data-act="tpSjabloon" data-id="${a.id}" data-s="${esc(s.id)}">${icon('list-checks')}Sjabloon ${esc(s.naam)} (${(s.blokken || []).reduce((t, b) => t + (Number(b.min) || 0), 0) + ((s.overig || {}).min || 0)} min)</button>`).join('')}<button class="knop licht vol" data-act="tpKopie" data-id="${a.id}">${icon('repeat')}Eerdere training overnemen</button>`}
      ${p.overig ? `<button type="button" class="tr-rij tr-overig" data-act="tpOverig" data-id="${a.id}">${metCode ? '<span class="tr-code">·</span>' : ''}<span class="tr-t"><small>${esc(p.overig.naam || 'Ombouw, wissels, afsluiting')}</small></span><span class="tr-min">${Number(p.overig.min) || 0} min</span></button>` : ''}
      <div class="tr-kop"><div class="knoppen"><button class="knop licht" data-act="tpVormKiezen" data-id="${a.id}">${icon('plus')}Vorm</button><button class="knop licht" data-act="tpSpacing" data-id="${a.id}">${icon('plus')}Spacing</button></div><span class="zacht klein"><b>${totaal(p)}</b>${duur ? ` van ${duur}` : ''} min</span></div>
      ${(p.onderdelen || []).some((o) => o.blok) ? `<small class="zacht">Gestippeld = voorstel. Tik op een regel voor minuten, ${niveaus(S).length ? 'leerniveau' : 'fase'} en variant.</small>` : ''}
    </div>`; };
  // Terugblik: pas na afloop (gegeven, echte minuten, wat anders)
  const terugblik = (S, p, a) => { const uit = p.gegeven ? (p.onderdelen || []).filter((o) => o.vormId && !o.spacing) : [];
    if (!afgelopen(a)) return `<div class="kaartje"><b>Na de training</b><small class="zacht">Hier vul je na afloop in of de training is gegeven, de echte minuten en wat je de volgende keer anders doet${a.eind ? ` (vanaf ${a.eind})` : ''}.</small></div>`;
    return `<form class="kaartje codeform" data-autosave="tpTerug" data-id="${a.id}">
      <label class="schakel"><span>Training is gegeven</span><input type="checkbox" name="gegeven" ${p.gegeven ? 'checked' : ''}><i></i></label>
      ${uit.length ? `<b>Hoeveel minuten echt?</b><small class="zacht">Staat op gepland; pas aan wat anders liep. 0 = niet gedaan.</small>
        <div class="tr-lijst">${uit.map((o) => { const v = vorm(S, o.vormId); return `<div class="tr-rij tr-uit">${o.blok ? `<span class="tr-code">${esc(code(o))}</span>` : ''}<span class="tr-t"><b>${esc(v ? v.naam : 'Vorm')}</b><small>gepland ${Number(o.min) || 0} min</small></span><input name="uit-${esc(o.id)}" type="number" inputmode="numeric" min="0" max="120" aria-label="Minuten echt: ${esc(v ? v.naam : 'vorm')}" value="${o.minUit != null ? o.minUit : Number(o.min) || 0}"></div>`; }).join('')}</div>` : ''}
      ${evalKaart(S, p, a)}
      <label for="tp-an">${evVragen(S).length ? 'Wat doen we de volgende keer anders?' : 'Wat doe je de volgende keer anders?'}</label><textarea id="tp-an" name="anders" rows="3" placeholder="${evVragen(S).length ? 'Eén concrete wijziging, bijv. verdediger mag direct druk zetten' : 'Bijv. de 10 en de 6 als neutrale speler'}">${esc(p.anders || '')}</textarea>
      ${evVragen(S).length ? '<small class="zacht">Komt bij de volgende training met hetzelfde probleem als voorstel te staan (niet automatisch doorgevoerd).</small>' : ''}
      ${evalDiep(S, p, a)}
    </form>`; };
  // Evaluatiekaart uit het profiel (kerndocument §14): drie vragen open, de rest onder Verdiepende analyse; alles optioneel
  const evVragen = (S) => (ond(S, 'evaluatie') || {}).vragen || [];
  const EV_OPEN = ['ev-probleem', 'ev-gedrag', 'ev-weerstand'];
  const terugkeer = (p) => ['A', 'B'].some((b) => (p.onderdelen || []).filter((o) => blokSoort(o.blok) === b && !o.spacing).length > 1);
  const evRij = (p, a, q) => { const w = (p.evaluatie || {})[q.id];
    return `<div class="tr-ev"><b>${esc(q.vraag)}</b><div class="chips">${q.schaal.map((x) => `<button type="button" class="chipknop ${w === x ? 'aan' : ''}" aria-pressed="${w === x}" data-act="tpEval" data-id="${esc(a.id)}" data-q="${esc(q.id)}" data-w="${esc(x)}">${esc(x)}</button>`).join('')}</div></div>`; };
  const evalKaart = (S, p, a) => (p.gegeven ? evVragen(S).filter((q) => EV_OPEN.includes(q.id)).map((q) => evRij(p, a, q)).join('') : '');
  const evalDiep = (S, p, a) => { if (!p.gegeven) return ''; const l = evVragen(S).filter((q) => !EV_OPEN.includes(q.id) && (!q.alleenBijTerugkeer || terugkeer(p)));
    const ingevuld = l.filter((q) => (p.evaluatie || {})[q.id]).length;
    return l.length ? `<details class="uitklap tr-diep" ${ingevuld ? 'open' : ''}><summary>Verdiepende analyse${ingevuld ? ` (${ingevuld})` : ''}</summary>${l.map((q) => evRij(p, a, q)).join('')}<p></p></details>` : ''; };
  CC.on('tpEval', (el) => { const p = plan(CC.S(), el.dataset.id); if (!p) return; p.evaluatie = p.evaluatie || {}; const q = el.dataset.q;
    p.evaluatie[q] = p.evaluatie[q] === el.dataset.w ? null : el.dataset.w; CC.save(); CC.render(); });
  // Trainingspagina (telefoon via ✎, en trainingen op datum): het midden en de terugblik
  CC.views.trainingsplan = (S, prm) => {
    const p = plan(S, prm.id); const a = p ? actVan(S, p) : null;
    if (!a || !p) return { titel: 'Training', html: h.leeg('Deze training bestaat niet meer.') };
    return { titel: `Training ${dagNaam(a)}`, sub: `${a.tijd || ''}${a.eind ? `–${a.eind}` : ''} · ${esc(CC.tn(a.teamId))}`, breed: true,
      html: `<div class="tr-lay"><div class="tr-kol">${planMidden(S, p, a)}</div><div class="tr-kol">${terugblik(S, p, a)}</div></div>` };
  };
  // Thema en aantallen in een venster (de kop blijft één regel)
  CC.on('tpKopBewerk', (el) => { const S = CC.S(); const p = plan(S, el.dataset.id); if (!p) return;
    CC.sheet('Thema en aantallen', `<form class="codeform" data-autosave="tpKop" data-id="${el.dataset.id}">
      <label for="tp-th">Thema</label><input id="tp-th" name="thema" value="${esc(p.thema || '')}" placeholder="Bijv. Dreigen en passeren">
      <div class="twee"><div><label for="tp-n">Spelers</label><input id="tp-n" name="spelers" type="number" inputmode="numeric" min="0" max="40" value="${p.spelers == null ? '' : p.spelers}" placeholder="uit aanwezigheid"></div>
        <div><label for="tp-k">Keepers</label><input id="tp-k" name="keepers" type="number" inputmode="numeric" min="0" max="6" value="${p.keepers == null ? '' : p.keepers}"></div></div>
      <small class="zacht">Spelers leeg = ClubComm neemt het aantal uit de aanwezigheid.</small>
      <button type="button" class="knop vol" data-act="sluitRender">Klaar</button></form>`); });
  CC.on('sluitRender', () => { CC.closeSheet(); CC.render(); });
  // Leerdoel van blok A of B
  CC.on('tpBlokDoel', (el) => { const S = CC.S(); const p = plan(S, el.dataset.id); if (!p) return; const b = el.dataset.b; const nu = blokDoel(S, p, b);
    CC.sheet(`Blok ${b}: leerdoel`, `<div class="chips">${leerdoelen(S).map((l) => `<button class="chipknop ${nu === l.id ? 'aan' : ''}" aria-pressed="${nu === l.id}" data-act="tpBlokDoelOk" data-id="${el.dataset.id}" data-b="${b}" data-ld="${esc(l.id)}">${esc(l.naam)}</button>`).join('')}</div>
      <small class="zacht">Zonder keuze neemt ClubComm het hoofdleerdoel van de eerste vorm in het blok.</small>`); });
  CC.on('tpBlokDoelOk', (el) => { const p = plan(CC.S(), el.dataset.id); if (!p) return; p.blokDoel = p.blokDoel || {};
    p.blokDoel[el.dataset.b] = p.blokDoel[el.dataset.b] === el.dataset.ld ? null : el.dataset.ld; CC.save(); CC.closeSheet(); CC.render(); });
  // ⋯ Meer: wat je zelden doet
  CC.on('tpMeer', (el) => CC.sheet('Training', `<div class="knoppen kolom"><button class="knop licht vol" data-act="tpKopie" data-id="${el.dataset.id}">${icon('repeat')}Eerdere training overnemen</button>
    <button class="knop licht vol" data-act="tpWeg" data-id="${el.dataset.id}" style="color:var(--rood)">${icon('trash-2')}Training leegmaken</button></div>`));
  CC.autosave.tpKop = (f) => { const S = CC.S(); const p = plan(S, f.dataset.id); if (!p) return;
    p.thema = f.thema.value.trim(); if (f.querySelector('input[name="ld"]')) p.leerdoelen = [...f.querySelectorAll('input[name="ld"]:checked')].map((x) => x.value);
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
      ${!o.spacing && niveaus(S).length ? `<fieldset class="tr-chips"><legend>Leerniveau${!o.niveau && o.niveauVoorstel ? ` (voorstel: ${esc(niveauNaam(S, o.niveauVoorstel))})` : ''}</legend><label class="tr-chip"><input type="radio" name="niveau" value="" ${o.niveau ? '' : 'checked'}><span>${o.niveauVoorstel ? 'Voorstel' : 'Geen'}</span></label>${niveaus(S).map((x) => `<label class="tr-chip"><input type="radio" name="niveau" value="${esc(x.id)}" ${o.niveau === x.id ? 'checked' : ''}><span>${esc(x.naam)}</span></label>`).join('')}</fieldset>` : ''}
      ${!o.spacing && fs.length && niveaus(S).length ? '<details class="uitklap tr-precies"><summary>Fase (optioneel)</summary>' : ''}${!o.spacing && fs.length ? `<fieldset class="tr-chips"><legend>Fase${f && !f.vast ? ` (voorstel: ${esc(faseNaam(S, f.id))})` : ''}</legend><label class="tr-chip"><input type="radio" name="fase" value="" ${o.fase ? '' : 'checked'}><span>${f && !f.vast ? 'Voorstel' : 'Geen'}</span></label>${fs.map((x) => `<label class="tr-chip"><input type="radio" name="fase" value="${esc(x.id)}" ${o.fase === x.id ? 'checked' : ''}><span>${esc(x.naam)}</span></label>`).join('')}</fieldset>` : ''}${!o.spacing && fs.length && niveaus(S).length ? '</details>' : ''}
      ${v ? `<label class="schakel"><span>Gebruiken als spacing</span><input type="checkbox" name="spacing" ${o.spacing ? 'checked' : ''}><i></i></label>` : ''}
      <button class="knop vol">Klaar</button></form>
      <div class="knoppen">${i > 0 ? `<button class="knop licht" data-act="tpSchuif" data-id="${el.dataset.id}" data-i="${i}" data-r="-1">↑ Omhoog</button>` : ''}${i < p.onderdelen.length - 1 ? `<button class="knop licht" data-act="tpSchuif" data-id="${el.dataset.id}" data-i="${i}" data-r="1">↓ Omlaag</button>` : ''}
        ${v ? `<button class="knop licht" data-act="vormOpen" data-id="${v.id}">${icon('pencil')}Vorm bekijken</button>` : ''}<button class="knop licht" data-act="tpDupliceer" data-id="${el.dataset.id}" data-i="${i}">${icon('repeat')}Dupliceren</button><button class="knop licht" data-act="tpOnderdeelWeg" data-id="${el.dataset.id}" data-i="${i}" style="color:var(--rood)">${icon('trash-2')}Weghalen</button></div>`);
  });
  CC.on('tpOnderdeelOk', (f) => { const S = CC.S(); const p = plan(S, f.dataset.id); const o = p && p.onderdelen[Number(f.dataset.i)]; if (!o) return;
    o.min = Number(f.min.value) || 0; o.notitie = f.notitie.value.trim(); if (f.naam) o.naam = f.naam.value.trim(); if (f.spacing) o.spacing = f.spacing.checked;
    const fa = f.querySelector('input[name="fase"]:checked'); if (fa) o.fase = fa.value || null;
    const ni = f.querySelector('input[name="niveau"]:checked'); if (ni) o.niveau = ni.value || null;
    const va = f.querySelector('input[name="variant"]:checked'); if (va) o.variant = va.value === '' ? null : Number(va.value);
    CC.save(); CC.closeSheet(); CC.render(); });
  CC.on('tpSchuif', (el) => { const S = CC.S(); const p = plan(S, el.dataset.id); const i = Number(el.dataset.i), j = i + Number(el.dataset.r); if (!p || j < 0 || j >= p.onderdelen.length) return;
    [p.onderdelen[i], p.onderdelen[j]] = [p.onderdelen[j], p.onderdelen[i]]; CC.save(); CC.closeSheet(); CC.render(); });
  // Dupliceren: hetzelfde onderdeel er direct onder (bijv. dezelfde vorm in variant B, of nog een keer spacing)
  CC.on('tpDupliceer', (el) => { const S = CC.S(); const p = plan(S, el.dataset.id); const i = Number(el.dataset.i); if (!p || !p.onderdelen[i]) return;
    p.onderdelen.splice(i + 1, 0, { ...JSON.parse(JSON.stringify(p.onderdelen[i])), id: nieuwId('o'), minUit: null }); CC.save(); CC.closeSheet(); CC.render(); CC.toast('Gedupliceerd'); });
  CC.on('tpOnderdeelWeg', (el) => { const S = CC.S(); const p = plan(S, el.dataset.id); if (!p) return; p.onderdelen.splice(Number(el.dataset.i), 1); CC.save(); CC.closeSheet(); CC.render(); });
  CC.on('tpSpacing', (el) => { const S = CC.S(); const p = plan(S, el.dataset.id); if (!p) return; p.onderdelen.push({ id: nieuwId('o'), spacing: true, naam: 'Hooghouden', min: 2 }); CC.save(); CC.render(); });

  const zetIn = (p, v, i) => { const o = i != null && p.onderdelen[Number(i)];
    if (o) { o.vormId = v.id; if (!o.min) o.min = Number(v.duur) || 0; return; }
    p.onderdelen.push({ id: nieuwId('o'), vormId: v.id, min: Number(v.duur) || 0, spacing: false }); };
  // ---------- Besluit 137: oefenvorm kiezen vanuit een plek in twee tikken ----------
  // Alleen je eigen vormen. Past het best = leerdoel van het blok (bij Start en Partij: het passende type) én het aantal spelers;
  // per vorm de redenen (✓ of oranje). ClubComm stelt voor, de trainer kiest (Besluit 121); niets gaat vanzelf.
  const TYPE_BLOK = { start: ['droog', 'rondo', 'duel'], P: ['partij'] };
  const plekNaam = (o) => (o ? (o.blok === 'P' ? 'Partij' : code(o) || 'deze plek') : 'de training');
  const vorigeWeek = (S, p, v) => { const d = actVan(S, p).datum; if (!d) return false; const van = D.addDays(d, -13);
    return plannen(S).some((x) => x !== p && !x.week && x.eigenaar === ik() && (x.onderdelen || []).some((o) => o.vormId === v.id) && (() => { const e = actVan(S, x).datum; return e && e >= van && e < d; })()); };
  const aanbevolen = (S, p, i) => { const a = actVan(S, p); const o = i != null && i !== '' ? p.onderdelen[Number(i)] : null; const n = aantalSp(S, p, a); const k = p.keepers == null || p.keepers === '' ? null : Number(p.keepers);
    const soort = o ? blokSoort(o.blok) : ''; const doel = soort === 'A' || soort === 'B' ? blokDoel(S, p, soort) : null; const f = o ? faseVan(S, o) : null; const types = o && !doel ? TYPE_BLOK[o.blok] || null : null;
    const nv = o && !o.spacing ? o.niveau || o.niveauVoorstel || null : null; // Besluit 137: leerniveau van de plek
    const ctx = { o, n, k, soort, doel, f, nv, types, label: plekNaam(o) };
    const kaarten = mijnVormen(S).map((v) => { const kp = koppeling(S, v); const ld = !!doel && (kp.primair === doel || kp.ook.includes(doel)); const tp = !!types && types.includes(typeVan(v));
      const va = n ? voorAantal(v, n, k) : null; const aantalOk = !n || past(v, n, k) || !!va; const vf = f && v.faseAdvies;
      const r = [];
      if (ld) r.push([`${soort} · ${ldNaam(S, doel)} ✓`]); if (tp) r.push([`${typeNaam(typeVan(v))} ✓`]);
      if (n) r.push(aantalOk ? [va ? `bij ${n}: eigen opzet ✓` : `${n} spelers ✓`] : [`gemaakt voor ${bereik(v.spelersMin, v.spelersMax, 'spelers')}`, true]);
      const vn = nv && v.niveauAdvies && niveauNaam(S, v.niveauAdvies);
      if (vn) r.push(v.niveauAdvies === nv ? [`${niveauNaam(S, nv)} ✓`] : [`${niveauNaam(S, v.niveauAdvies)} (${ctx.label} = ${niveauNaam(S, nv)})`, true]);
      if (vf) r.push(v.faseAdvies === f.id ? [`${faseNaam(S, f.id)} ✓`] : [`${faseNaam(S, v.faseAdvies)} (${ctx.label} = ${faseNaam(S, f.id)})`, true]);
      if (vorigeWeek(S, p, v)) r.push(['vorige week ook gedaan']);
      const noot = aantalOk ? '' : `Je hebt er vandaag ${n}.${v.minVariant && (v.aantalMin == null || n >= Number(v.aantalMin)) ? ` Bij ${n}: <b>${esc(v.minVariant)}</b> (minimumvariant van deze vorm).` : ' Pas het aantal of de ruimte aan, of kies een andere vorm.'}`;
      return { v, r, noot, relevant: doel ? ld : types ? tp : true, aantalOk, niveauOk: !vn || v.niveauAdvies === nv, faseOk: !vf || v.faseAdvies === f.id, duurAfstand: Math.abs((Number(v.duur) || 0) - (Number(o && o.min) || Number(v.duur) || 0)) }; });
    const volg = (x, y) => (y.niveauOk - x.niveauOk) || (y.faseOk - x.faseOk) || (x.duurAfstand - y.duurAfstand) || x.v.naam.localeCompare(y.v.naam);
    return { ctx, top: kaarten.filter((x) => x.relevant && x.aantalOk).sort(volg), ander: kaarten.filter((x) => x.relevant && !x.aantalOk).sort(volg), rest: kaarten.filter((x) => !x.relevant).sort(volg) }; };
  const kvKaart = (S, a, i, x, ctx) => { const or = !x.aantalOk;
    return `<div class="kv-kaart ${or ? 'or' : ''}" data-naam="${esc(x.v.naam.toLowerCase())}"><button type="button" class="kv-kop" data-act="vormOpen" data-id="${x.v.id}">${mini(x.v)}<span class="tr-t"><b>${esc(x.v.naam)}</b><small>${vormSub(S, x.v)}</small></span></button>
      ${x.r.length ? `<div class="kv-waarom">${x.r.map(([t, o]) => `<span class="${o ? 'o' : ''}">${esc(t)}</span>`).join('')}</div>` : ''}${x.noot ? `<p class="kv-noot">${x.noot}</p>` : ''}
      <button type="button" class="knop ${or ? 'licht' : ''} kv-knop" data-act="tpVormErbij" data-id="${esc(a.id)}" data-v="${x.v.id}" ${i != null && i !== '' ? `data-i="${i}"` : ''}>${or ? `Toch in ${esc(ctx.label)} zetten` : `Zet in ${esc(ctx.label)}`}</button></div>`; };
  const kvCtx = (S, ctx) => [ctx.doel ? `<b>${esc(ctx.soort)} · ${esc(ldNaam(S, ctx.doel))}</b>` : ctx.types ? `<b>${esc(ctx.label)}</b>` : '', ctx.nv ? esc(niveauNaam(S, ctx.nv)) : '', ctx.f ? esc(faseNaam(S, ctx.f.id)) : '', ctx.n ? `${ctx.n} spelers${ctx.k != null ? `, ${ctx.k} keeper${ctx.k === 1 ? '' : 's'}` : ''}` : '', ctx.o ? `${Number(ctx.o.min) || 0} min` : ''].filter(Boolean).join(' · ');
  const kvLijst = (S, p, a, i) => { const r = aanbevolen(S, p, i); const c = r.ctx; const kop = c.doel || c.types ? 'Past het best' : c.n ? `Passend bij ${c.n} spelers` : 'Je vormen';
    return `${kvCtx(S, c) ? `<p class="kv-ctx">${kvCtx(S, c)}</p>` : ''}<p class="zacht klein" style="margin:0">Uit je eigen vormen, op leerdoel, aantal, leerniveau en fase. Jij kiest.</p>
      <h4 class="kv-groep">${kop} (${r.top.length})</h4>${r.top.length ? r.top.map((x) => kvKaart(S, a, i, x, c)).join('') : `<p class="zacht klein">${c.doel ? `Nog geen vorm voor ${esc(c.soort)} · ${esc(ldNaam(S, c.doel))}${c.n ? ` bij ${c.n} spelers` : ''}.` : 'Nog geen passende vorm.'}</p>`}
      ${r.ander.length ? `<h4 class="kv-groep">Ander aantal spelers (${r.ander.length})</h4>${r.ander.map((x) => kvKaart(S, a, i, x, c)).join('')}` : ''}
      ${r.rest.length ? `<details class="uitklap"><summary>Alle andere vormen (${r.rest.length}) · zoeken</summary><input type="search" class="tr-zoek kv-zoek" placeholder="Zoek een vorm…" aria-label="Zoek een vorm"><div class="kv-alle">${r.rest.map((x) => kvKaart(S, a, i, x, c)).join('')}</div></details>` : ''}
      <div class="knoppen"><button class="knop licht" data-act="vormNieuw" data-plan="${esc(a.id)}" ${i != null && i !== '' ? `data-i="${i}"` : ''}>${icon('plus')}Nieuwe vorm</button>${c.o ? `<button class="knop licht" data-act="tpOnderdeel" data-id="${esc(a.id)}" data-i="${i}">Minuten en notitie van ${esc(c.label)}</button>` : ''}</div>`; };
  document.addEventListener('input', (e) => { if (!e.target.classList || !e.target.classList.contains('kv-zoek')) return; const q = e.target.value.trim().toLowerCase();
    e.target.parentElement.querySelectorAll('.kv-alle .kv-kaart').forEach((k) => { k.hidden = !!q && !k.dataset.naam.includes(q); }); });
  const kiezen = (id, i) => { const S = CC.S(); const p = plan(S, id); if (!p) return; const o = i != null && i !== '' ? p.onderdelen[Number(i)] : null;
    CC.sheet(`Kies oefenvorm${o ? ` · ${plekNaam(o)}` : ''}`, kvLijst(S, p, actVan(S, p), i), { groot: true }); };
  CC.on('tpVormKiezen', (el) => kiezen(el.dataset.id, el.dataset.i));
  // Lege plek: telefoon = meteen kiezen; laptop (Plannen) = plek kiezen, links staat wat daar past
  CC.on('tpLeeg', (el) => { const i = Number(el.dataset.i);
    if (groot() && document.querySelector('.tr-pbank')) { const f = pf(); f.slot = f.slot && f.slot.id === el.dataset.id && f.slot.i === i ? null : { id: el.dataset.id, i }; return CC.render(); }
    kiezen(el.dataset.id, i); });
  CC.on('tpSlotWeg', () => { pf().slot = null; CC.render(); });
  // Zet in …: direct opgeslagen; 8 seconden Ongedaan maken
  CC.on('tpVormErbij', (el) => { const S = CC.S(); const p = plan(S, el.dataset.id); const v = vorm(S, el.dataset.v); if (!p || !v) return;
    const i = el.dataset.i != null && el.dataset.i !== '' ? Number(el.dataset.i) : null; const o = i != null ? p.onderdelen[i] : null;
    CC.ui.kvTerug = { id: el.dataset.id, i, v: v.id, oud: o ? { vormId: o.vormId || null, min: o.min } : null, lengte: (p.onderdelen || []).length };
    zetIn(p, v, i); const label = plekNaam(i != null ? p.onderdelen[i] : null); pf().slot = null;
    CC.save(); CC.closeSheet(); CC.render(); CC.toast(`In ${label} gezet`, '', { knop: 'Ongedaan maken', act: 'tpOngedaan' }); });
  CC.on('tpOngedaan', () => { const u = CC.ui.kvTerug; const S = CC.S(); const p = u && plan(S, u.id); CC.ui.kvTerug = null; if (!p) return;
    if (u.oud && p.onderdelen[u.i] && p.onderdelen[u.i].vormId === u.v) { p.onderdelen[u.i].vormId = u.oud.vormId || undefined; if (!u.oud.vormId) delete p.onderdelen[u.i].vormId; p.onderdelen[u.i].min = u.oud.min; }
    else if (!u.oud && p.onderdelen.length === u.lengte + 1 && p.onderdelen[u.lengte].vormId === u.v) p.onderdelen.splice(u.lengte, 1);
    CC.save(); CC.render(); CC.toast('Ongedaan gemaakt'); });
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
  const maandBlok = (S, open) => {
    const nu = D.vandaag().slice(0, 7); const r = CC.minutenPerLeerdoel(S, nu); if (!r.trainingen) return '';
    const lds = leerdoelen(S).filter((l) => !String(l.id).startsWith('ld-')); const ids = [...new Set(lds.map((l) => l.id).concat(Object.keys(r.min)))];
    const max = Math.max(1, ...ids.map((x) => r.min[x] || 0)); const ook = Object.entries(r.ook);
    return `<details class="uitklap tr-maand" ${open ? 'open' : ''}><summary>${D.MAAND[D.parse(`${nu}-01`).getMonth()]}: minuten per hoofdleerdoel</summary>
      <div class="tr-mlijst">${ids.sort((x, y) => (r.min[y] || 0) - (r.min[x] || 0)).map((x) => `<div><span>${esc(ldNaam(S, x) || 'Onbekend leerdoel')}</span><i style="width:${Math.max(2, Math.round(((r.min[x] || 0) / max) * 100))}%" class="${r.min[x] ? '' : 'nul'}"></i><b>${r.min[x] || 0} min</b></div>`).join('')}</div>
      <small class="zacht">${r.trainingen} training${r.trainingen === 1 ? '' : 'en'} gegeven · uitgevoerd ${r.uit} van ${r.gepland} min gepland${ook.length ? ` · ook geraakt: ${ook.map(([x, n]) => `${esc(ldNaam(S, x))} ${n}×`).join(', ')}` : ''}</small></details>`;
  };

  // ---------- Tabblad Training (Besluit 130, 132): Week (controleren) · Plannen (laptop) · Vormen · Lijn ----------
  const groot = () => window.matchMedia && window.matchMedia('(min-width: 900px)').matches;
  CC.trainingTab = (S) => {
    const tid = CC.teamId(); const seg = h.segVal('trSeg', groot() ? 'plannen' : 'week');
    // Besluit 135: op de laptop in de volgorde van het werk (Lijn → Plannen → Week; Vormen = de bibliotheek); de telefoon begint bij Week
    const kop = h.seg('trSeg', groot() ? [['lijn', 'Lijn'], ['plannen', 'Plannen'], ['week', 'Week'], ['vormen', 'Vormen']] : [['week', 'Week'], ['plannen', 'Plannen'], ['vormen', 'Vormen'], ['lijn', 'Lijn']], groot() ? 'plannen' : 'week');
    if (seg === 'vormen') return kop + CC.vormenLijst(S);
    if (seg === 'lijn') return kop + lijnHtml(S);
    const acts = tid && CC.weekActs ? CC.weekActs(S, tid) : [];
    if (seg === 'plannen') return kop + (acts.length ? plannenHtml(S, acts) : losPlannen(S));
    if (!acts.length) return kop + losLijst(S);
    const standaard = acts.find((a) => a.datum === D.vandaag() && a.soort === 'training') || acts.find((a) => a.datum >= D.vandaag() && a.soort === 'training') || acts.find((a) => a.datum === D.vandaag()) || acts[0];
    const a = acts.find((x) => x.id === h.segVal('aanwAct', standaard.id)) || standaard;
    const sp = M.spelers(S, a.teamId); const pr = S.pres[a.id];
    const aanw = a.afgelast || !sp.length ? '' : pr ? `${Object.values(pr.s || {}).filter((v) => v === 'a' || v === 'l').length} van ${sp.length} aanwezig · aanpassen` : `${verwacht(S, a)} van ${sp.length} verwacht`;
    const p = a.soort === 'training' ? plan(S, a.id) : null;
    return `${kop}${strook(S, acts, a)}${CC.trJeZitIn ? CC.trJeZitIn(S, a) : ''}
      <div class="kaart-kop los">${h.datumBlok(a)}<div><b>${h.actTitel(S, a)}</b><small>${h.actSub(S, a)}</small></div></div>${!a.afgelast && a.adres && (a.soort === 'activiteit' || (M.isWed(a) && !a.thuis)) ? `<div class="knoppen">${h.adresRegel(a.adres)}</div>` : ''}
      ${aanw ? `<button class="knop licht vol tr-aanw" data-act="aanwVenster" data-id="${a.id}">${icon('clipboard-check')}Aanwezigheid · ${aanw} ▾</button>` : ''}
      ${a.soort !== 'training' ? (S.club.modules.speeltijd && M.isWed(a) ? `<button class="knop vol" data-act="naarWedstrijd" data-id="${a.id}">${icon('trophy')}Naar de wedstrijd</button>` : '') + (M.isWed(a) && CC.trObservatie ? CC.trObservatie(S, a) : '')
        : p ? weekKaart(S, p, a) + (afgelopen(a) ? terugblik(S, p, a) : '') : `<button class="knop vol" data-act="tpNieuw" data-id="${a.id}">${icon('pencil')}Training voorbereiden of vastleggen</button>`}
      ${CC.kanNietBlok && D.start(a) > new Date() ? CC.kanNietBlok(S, a) : ''}
      ${CC.mag('planning') ? `<button class="knop licht vol" data-act="planningAanpassen">${icon('calendar-plus')}Planning aanpassen of iets toevoegen</button>` : ''}`;
  };
  const strook = (S, acts, a) => `<div class="weekstrook" role="tablist">${acts.map((x) => { const d = D.parse(x.datum); return `<button role="tab" aria-selected="${x.id === a.id}" class="${x.id === a.id ? 'aan' : ''} ${x.afgelast ? 'afg' : ''} ${x.datum === D.vandaag() ? 'vandaag' : ''} ${plan(S, x.id) ? 'gedaan' : ''}" data-act="seg" data-key="aanwAct" data-val="${x.id}"><small>${D.DAG_KORT[d.getDay()]}</small><b>${d.getDate()}</b><small>${x.soort === 'training' ? 'T' : 'W'}</small></button>`; }).join('')}</div>`;
  // Week: de training om te controleren (code, tekening, naam, minuten); tik = de vorm groot
  const weekKaart = (S, p, a) => { const doelen = blokDoelen(S, p);
    return `<div class="kaartje tr-weekkaart"><div class="tr-kop"><b>${esc(p.thema || 'Training')} · ${totaal(p)} min</b>${CC.trStatus ? CC.trStatus(S, p) : doelen ? `<small class="zacht">${doelen}</small>` : ''}</div>${CC.trMethodiek ? CC.trMethodiek(S, p, a, true) : ''}${balk(S, p)}
      ${(p.onderdelen || []).length ? `<div class="tr-lijst">${p.onderdelen.map((o, i) => { const v = o.vormId && vorm(S, o.vormId); const var_ = v && o.variant != null && (v.varianten || [])[o.variant] ? ` · ${esc(v.varianten[o.variant].naam || String.fromCharCode(65 + Number(o.variant)))}` : '';
        return `<button type="button" class="tr-rij tr-wrij" ${v ? `data-act="vormOpen" data-id="${v.id}"` : `data-act="tpOnderdeel" data-id="${a.id}" data-i="${i}"`}>${o.blok ? `<span class="tr-code">${esc(code(o))}</span>` : ''}${leegSlot(o) ? `<span class="tr-mini leeg">${icon('plus')}</span>` : mini(v, o.spacing)}<span class="tr-t"><b>${esc(v ? v.naam : o.spacing ? o.naam || 'Spacing' : o.naam || 'Nog leeg')}${var_}</b></span><span class="tr-min">${Number(o.min) || 0}′</span></button>`; }).join('')}</div>` : '<p class="zacht">Nog geen opbouw.</p>'}
      <div class="knoppen"><button class="knop licht" data-act="open" data-view="trainingsplan" data-id="${esc(a.id)}">${icon('pencil')}Aanpassen</button><button class="knop licht" data-act="tpPrint" data-id="${esc(a.id)}" ${(p.onderdelen || []).length ? '' : 'disabled'}>${icon('printer')}Printen</button></div></div>`; };
  // Plannen (laptop): links je vormen, in het midden de training in blokken, rechts de week en de maand
  const plannenHtml = (S, acts) => {
    const tr = acts.filter((x) => x.soort === 'training' && !x.afgelast); if (!tr.length) return h.leeg('Geen trainingen in deze periode.', 'list-checks');
    const standaard = tr.find((a) => a.datum >= D.vandaag()) || tr[tr.length - 1];
    const a = tr.find((x) => x.id === h.segVal('aanwAct', standaard.id)) || standaard; const p = plan(S, a.id);
    return `${strook(S, tr, a)}${CC.trJeZitIn ? CC.trJeZitIn(S, a) : ''}${planDrie(S, p, a, null)}`; };
  const planDrie = (S, p, a, lijst) => `<div class="tr-plan">
      <div class="tr-pmid">${p ? planMidden(S, p, a) : `<div class="kaartje"><b>${esc(dagNaam(a))}</b><small class="zacht">${a.tijd ? `${a.tijd}${a.eind ? `–${a.eind}` : ''}` : ''}</small><button class="knop vol" data-act="tpNieuw" data-id="${a.id}" data-inline="1">${icon('pencil')}Training voorbereiden</button></div>`}</div>
      <div class="tr-pzij">${zijKolom(S, p, a, lijst)}</div>
      <div class="tr-pbank">${p ? bankKolom(S, p, a) : ''}</div></div>`;
  // Besluit 135: geen dubbelingen. De weekstrook staat al bovenaan (alleen bij trainingen op datum hier een lijst); het maandoverzicht staat in Lijn;
  // evalueren gebeurt in Week (alleen een losse training zonder kalender evalueer je hier)
  const zijKolom = (S, p, a, lijst) => `${lijst ? `<div class="kaartje"><b>Trainingen</b><div class="tr-lijst">${lijst.map((x) => { const q = plan(S, x.id || x.actId); const xa = x.datum ? x : actVan(S, x);
      return `<button type="button" class="tr-rij tr-dag ${xa.id === a.id ? 'aan' : ''}" data-act="seg" data-key="${x.los ? 'losPlan' : 'aanwAct'}" data-val="${esc(xa.id)}"><span class="tr-t"><b>${esc(dagNaam(xa))}</b><small>${q ? `${esc(q.thema || 'Training')} · ${totaal(q)} min` : 'nog niet voorbereid'}${q && CC.trStatus ? CC.trStatus(S, q) : q && q.gegeven ? ' · gegeven' : ''}</small></span>${q && q.gegeven ? icon('check') : ''}</button>`; }).join('')}</div></div>` : ''}
    ${CC.trBespreek ? CC.trBespreek(S, a) : ''}${p && (lijst || p.los) ? terugblik(S, p, a) : p && afgelopen(a) ? `<button class="knop licht vol" data-act="trNaarWeek" data-id="${esc(a.id)}">${icon('clipboard-check')}${p.gegeven ? 'Evaluatie bekijken' : 'Evalueren'} (Week)</button>` : ''}`;
  CC.on('trNaarWeek', (el) => { const g = (CC.ui.seg = CC.ui.seg || {}); g.trSeg = 'week'; g.aanwAct = el.dataset.id; CC.render(); window.scrollTo(0, 0); });
  // Mijn vormen naast de training: zoeken, slepen of + (komt op de eerste passende lege plek)
  const pf = () => CC.ui.pf || (CC.ui.pf = {});
  const bankLijst = (S, p, a) => { const f = pf(); const n = aantalSp(S, p, a); const doel = f.doel ? blokDoel(S, p, f.doel) : null;
    const l = mijnVormen(S).filter((v) => zoekTreft(S, v, f.q) && (!f.past || !n || past(v, n, null)) && (!doel || koppeling(S, v).primair === doel || koppeling(S, v).ook.includes(doel))).sort((x, y) => x.naam.localeCompare(y.naam));
    return l.length ? l.map((v) => `<div class="tr-bk" draggable="true" data-drag-v="${v.id}"><button type="button" class="tr-bk-t" data-act="vormOpen" data-id="${v.id}">${mini(v)}<span class="tr-t"><b>${esc(v.naam)}</b><small>${[v.duur ? `${v.duur} min` : '', bereik(v.spelersMin, v.spelersMax, 'sp'), ldNaam(S, koppeling(S, v).primair)].filter(Boolean).join(' · ')}</small></span></button><button class="icoonknop" data-act="tpPlaats" data-id="${a.id}" data-v="${v.id}" aria-label="${esc(v.naam)} in de training zetten">${icon('plus')}</button></div>`).join('') : '<p class="zacht klein">Geen vorm gevonden.</p>'; };
  const bankKolom = (S, p, a) => { const f = pf(); const n = aantalSp(S, p, a);
    const sl = f.slot && f.slot.id === a.id && p.onderdelen[f.slot.i] && leegSlot(p.onderdelen[f.slot.i]) ? f.slot : null;
    if (sl) return `<div class="kaartje kv-bank"><div class="tr-kop"><b>Aanbevolen voor ${esc(plekNaam(p.onderdelen[sl.i]))}</b><button class="icoonknop" data-act="tpSlotWeg" aria-label="Terug naar Mijn vormen">${icon('x')}</button></div>${kvLijst(S, p, a, sl.i)}<small class="zacht">Of sleep een vorm naar een plek.</small></div>`;
    return `<div class="kaartje"><b>Mijn vormen</b><input id="planZoek" class="tr-zoek" type="search" placeholder="Zoek een vorm…" aria-label="Zoek een vorm" value="${esc(f.q || '')}">
      <div class="chips">${n ? `<button class="chipknop ${f.past ? 'aan' : ''}" aria-pressed="${!!f.past}" data-act="pfZet" data-k="past">past bij ${n}</button>` : ''}${['A', 'B'].filter((b) => blokDoel(S, p, b)).map((b) => `<button class="chipknop ${f.doel === b ? 'aan' : ''}" aria-pressed="${f.doel === b}" data-act="pfZet" data-k="doel" data-w="${b}">${b} = ${esc(ldNaam(S, blokDoel(S, p, b)))}</button>`).join('')}</div>
      <div id="planBank" data-id="${a.id}">${bankLijst(S, p, a)}</div><small class="zacht">${groot() ? 'Sleep een vorm naar een plek, of tik op +' : 'Tik op +'} (komt op de eerste passende lege plek).</small>
      <button class="knop licht vol" data-act="vormNieuw" data-plan="${a.id}">${icon('plus')}Nieuwe vorm</button></div>`; };
  CC.on('pfZet', (el) => { const f = pf(); if (el.dataset.k === 'past') f.past = !f.past; else f.doel = f.doel === el.dataset.w ? null : el.dataset.w; CC.render(); });
  document.addEventListener('input', (e) => { if (e.target.id !== 'planZoek') return; pf().q = e.target.value; const b = document.getElementById('planBank'); const S = CC.S(); const p = b && plan(S, b.dataset.id); if (p) b.innerHTML = bankLijst(S, p, actVan(S, p)); });
  // Plek voor een vorm: lege plek in het blok met hetzelfde leerdoel, anders de eerste lege plek (niet spacing of start), anders erachter
  const plekVoor = (S, p, v) => { const pr = koppeling(S, v).primair; const idx = (f) => (p.onderdelen || []).findIndex((o) => leegSlot(o) && f(o));
    let i = -1; ['A', 'B'].forEach((b) => { if (i < 0 && pr && blokDoel(S, p, b) === pr) i = idx((o) => blokSoort(o.blok) === b); });
    if (i < 0) i = idx((o) => o.blok !== 'start'); if (i < 0) i = idx(() => true); return i < 0 ? null : i; };
  const plaats = (S, p, v, i) => { const j = i != null ? i : plekVoor(S, p, v); zetIn(p, v, j); const o = j != null ? p.onderdelen[j] : p.onderdelen[p.onderdelen.length - 1]; return code(o) || 'de training'; };
  CC.on('tpPlaats', (el) => { const S = CC.S(); const p = plan(S, el.dataset.id); const v = vorm(S, el.dataset.v); if (!p || !v) return; const c = plaats(S, p, v); CC.save(); CC.render(); CC.toast(`In ${c} gezet`); });
  // Slepen (laptop): op een lege plek = invullen; op een gevulde regel = erna; elders in de training = achteraan
  document.addEventListener('dragstart', (e) => { const d = e.target.closest && e.target.closest('[data-drag-v]'); if (d) { e.dataTransfer.setData('text/plain', d.dataset.dragV); e.dataTransfer.effectAllowed = 'copy'; } });
  document.addEventListener('dragover', (e) => { const z = e.target.closest && e.target.closest('[data-drop-plan]'); if (z) { e.preventDefault(); document.querySelectorAll('.tr-drop').forEach((x) => x.classList.remove('tr-drop')); (e.target.closest('[data-drop-i]') || z).classList.add('tr-drop'); } });
  document.addEventListener('drop', (e) => { const z = e.target.closest && e.target.closest('[data-drop-plan]'); if (!z) return; e.preventDefault(); document.querySelectorAll('.tr-drop').forEach((x) => x.classList.remove('tr-drop'));
    const S = CC.S(); const p = plan(S, z.dataset.dropPlan); const v = vorm(S, e.dataTransfer.getData('text/plain')); if (!p || !v) return;
    const r = e.target.closest('[data-drop-i]'); const i = r ? Number(r.dataset.dropI) : null;
    if (i != null && leegSlot(p.onderdelen[i])) zetIn(p, v, i);
    else if (i != null) p.onderdelen.splice(i + 1, 0, { id: nieuwId('o'), vormId: v.id, min: Number(v.duur) || 0, spacing: false, blok: p.onderdelen[i].blok && p.onderdelen[i].blok !== 'S' ? p.onderdelen[i].blok : undefined });
    else zetIn(p, v, null);
    CC.save(); CC.render(); });
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
  const losLijst = (S) => { const l = plannen(S).filter((p) => p.eigenaar === ik() && !p.week).sort((x, y) => String(y.datum).localeCompare(String(x.datum)));
    return `<button class="knop vol" data-act="tpLosNieuw">${icon('plus')}Nieuwe training</button>
      ${l.length ? `<div class="kaartje"><div class="tr-lijst">${l.map((p) => { const v = (p.onderdelen || []).map((o) => o.vormId && vorm(S, o.vormId)).find(Boolean);
        return `<button type="button" class="tr-rij" data-act="open" data-view="trainingsplan" data-id="${esc(p.actId)}">${mini(v)}<span class="tr-t"><b>${esc(p.thema || 'Training')}</b><small>${D.kort(p.datum)} · ${(p.onderdelen || []).length} onderdelen · ${totaal(p)} min</small></span></button>`; }).join('')}</div></div>`
        : h.leeg('Nog geen trainingen. Maak je eerste training: kies een datum en zet er vormen en spacing in.', 'list-checks')}`; };
  const losPlannen = (S) => { const l = plannen(S).filter((p) => p.eigenaar === ik() && p.los).sort((x, y) => String(x.datum).localeCompare(String(y.datum)));
    if (!l.length) return losLijst(S);
    const standaard = l.find((p) => p.datum >= D.vandaag()) || l[l.length - 1]; const p = l.find((x) => x.id === h.segVal('losPlan', standaard.id)) || standaard; const a = actVan(S, p);
    return `<div class="knoppen"><button class="knop licht" data-act="tpLosNieuw">${icon('plus')}Nieuwe training</button></div>${CC.trJeZitIn ? CC.trJeZitIn(S, a) : ''}${planDrie(S, p, a, l.slice(-8).map((x) => ({ ...actVan(S, x), los: true, actId: x.actId })))}`; };
  CC.on('tpLosNieuw', () => CC.sheet('Nieuwe training', `<form data-submit="tpLosOk" class="codeform"><label for="tl-d">Datum</label><input id="tl-d" name="datum" type="date" required value="${D.vandaag()}"><button class="knop vol">Maken</button></form>`));
  const nieuwLos = (S, datum) => { const id = nieuwId('tp'); plannen(S).push({ id, actId: id, los: true, teamId: CC.teamId ? CC.teamId() : null, datum, eigenaar: ik(), thema: '', leerdoelen: [], onderdelen: [], spelers: null, keepers: null }); return id; };
  CC.on('tpLosOk', (f) => { const S = CC.S(); const id = nieuwLos(S, f.datum.value);
    CC.save(); CC.closeSheet(); if (h.segVal('trSeg', groot() ? 'plannen' : 'week') === 'plannen' && CC.ui.seg) { CC.ui.seg.losPlan = id; CC.render(); } else CC.open('trainingsplan', { id }); });

  // ---------- Kopiëren naar een andere dag, en een vorm in een training zetten (Besluit 132) ----------
  // Trainingen waar iets in kan: de komende vier weken uit de planning, of je trainingen op datum
  const doelTrainingen = (S, behalve) => { const tid = CC.teamId && CC.teamId();
    const uit = tid ? M.acts(S, tid, D.vandaag(), D.addDays(D.vandaag(), 28)).filter((a) => a.soort === 'training' && !a.afgelast && a.id !== behalve) : [];
    return uit.length ? uit : plannen(S).filter((p) => p.eigenaar === ik() && p.los && p.datum >= D.vandaag() && p.actId !== behalve).map((p) => actVan(S, p)); };
  const dagKnoppen = (S, lijst, act, extra) => `<div class="tr-lijst">${lijst.map((a) => { const q = plan(S, a.id); return `<button type="button" class="tr-rij" data-act="${act}" data-naar="${esc(a.id)}" ${extra}><span class="tr-t"><b>${esc(dagNaam(a))}${a.tijd ? ` · ${a.tijd}` : ''}</b><small>${q && (q.onderdelen || []).length ? `${esc(q.thema || 'Training')} · ${(q.onderdelen || []).length} onderdelen` : 'nog leeg'}</small></span></button>`; }).join('')}</div>`;
  const planVoor = (S, id) => { let p = plan(S, id); if (p) return p; const a = M.act(S, id); if (!a) return null;
    p = { id: nieuwId('tp'), actId: a.id, teamId: a.teamId, datum: a.datum, eigenaar: ik(), thema: '', leerdoelen: [], onderdelen: [], spelers: null, keepers: null }; plannen(S).push(p); return p; };
  CC.on('tpKopieNaar', (el) => { const S = CC.S(); const lijst = doelTrainingen(S, el.dataset.id);
    CC.sheet('Kopiëren naar…', `${lijst.length ? dagKnoppen(S, lijst, 'tpKopieNaarOk', `data-van="${esc(el.dataset.id)}"`) : '<p class="zacht">Geen komende trainingen in de planning.</p>'}
      <form data-submit="tpKopieNaarDatum" data-van="${esc(el.dataset.id)}" class="codeform"><label for="kn-d">Of op een datum (los)</label><input id="kn-d" name="datum" type="date" required value="${D.addDays(D.vandaag(), 7)}"><button class="knop licht vol">Kopiëren naar deze datum</button></form>`); });
  const kopieer = (van, naar) => { naar.onderdelen = van.onderdelen.map((o) => ({ ...JSON.parse(JSON.stringify(o)), id: nieuwId('o'), minUit: null }));
    Object.assign(naar, { thema: van.thema, sjabloon: van.sjabloon || null, overig: van.overig ? { ...van.overig } : null, blokDoel: van.blokDoel ? { ...van.blokDoel } : undefined, leerdoelen: (van.leerdoelen || []).slice(), gegeven: false, anders: '' }); };
  CC.on('tpKopieNaarOk', (el) => { const S = CC.S(); const van = plan(S, el.dataset.van); const doel = plan(S, el.dataset.naar); if (!van) return;
    if (doel && (doel.onderdelen || []).length && !el.dataset.vervang) { CC.sheet('Die training is al gevuld', `<p>${esc(dagNaam(actVan(S, doel)))} heeft al ${doel.onderdelen.length} onderdelen. Vervangen door deze training?</p><div class="knoppen"><button class="knop rood" data-act="tpKopieNaarOk" data-van="${esc(el.dataset.van)}" data-naar="${esc(el.dataset.naar)}" data-vervang="1">Vervangen</button><button class="knop licht" data-act="sluit">Annuleren</button></div>`); return; }
    const naar = planVoor(S, el.dataset.naar); if (!naar) return; kopieer(van, naar); CC.save(); CC.closeSheet(); CC.render(); CC.toast(`Gekopieerd naar ${dagNaam(actVan(S, naar))}`); });
  CC.on('tpKopieNaarDatum', (f) => { const S = CC.S(); const van = plan(S, f.dataset.van); if (!van) return; const id = nieuwLos(S, f.datum.value); kopieer(van, plan(S, id)); CC.save(); CC.closeSheet(); CC.render(); CC.toast(`Gekopieerd naar ${D.kort(f.datum.value)}`); });
  // Vorm → training: kies een dag; een lege training krijgt eerst het sjabloon van de club, de vorm komt op de eerste passende plek
  CC.on('vormNaarTraining', (el) => { const S = CC.S(); const lijst = doelTrainingen(S, null);
    CC.sheet('Zet in een training…', lijst.length ? dagKnoppen(S, lijst, 'vormNaarTrainingOk', `data-v="${esc(el.dataset.id)}"`) : `<p class="zacht">Geen komende trainingen. Maak eerst een training.</p><button class="knop vol" data-act="tpLosNieuw">${icon('plus')}Nieuwe training</button>`); });
  CC.on('vormNaarTrainingOk', (el) => { const S = CC.S(); const v = vorm(S, el.dataset.v); const p = planVoor(S, el.dataset.naar); if (!v || !p) return;
    if (!(p.onderdelen || []).length && sjablonen(S)[0]) { const s = sjablonen(S)[0]; p.sjabloon = s.id;
      p.onderdelen = (s.blokken || []).map((b) => ({ id: nieuwId('o'), blok: b.blok, min: Number(b.min) || 0, spacing: b.blok === 'S', naam: b.blok === 'S' ? '' : b.naam || '', sjabloonFase: b.fase || null })); p.overig = s.overig ? { ...s.overig } : null; }
    const c = plaats(S, p, v); CC.save(); CC.closeSheet(); CC.render(); CC.toast(`In ${dagNaam(actVan(S, p))} · ${c} gezet`); });

  // ---------- Printen (Besluit 132): een A4 per training en per vorm ----------
  // Materiaal uit de tekening: ballen, hoedjes, schijfjes, doelen, hesjes (spelers die niet rood, trainer of keeper zijn)
  CC.materiaal = (t) => { const it = (t && t.items) || []; const n = (f) => it.filter(f).length;
    return [['bal', 'ballen', n((x) => x.t === 'ball')], ['hoedje', 'hoedjes', n((x) => x.t === 'cone') + 4 * n((x) => x.t === 'hatzone')], ['schijfje', 'schijfjes', n((x) => x.t === 'dish')],
      ['pupillendoel', 'pupillendoelen', n((x) => x.t === 'goal' && x.s === 'M')], ['minidoel', 'minidoelen', n((x) => x.t === 'goal' && x.s !== 'M')], ['kaatsbord', 'kaatsborden', n((x) => x.t === 'board')],
      ['hesje', 'hesjes', n((x) => x.t === 'p' && x.c && !['rood', 'trainer', 'keeper'].includes(x.c))]].filter((x) => x[2] > 0); };
  const matTekst = (m) => m.map(([e, mv, n]) => `${n} ${n === 1 ? e : mv}`).join(' · ');
  const matHtml = (m) => (m.length ? `<div class="tr-mat">${m.map(([e, mv, n]) => `<div><b>${n}</b><small>${n === 1 ? e : mv}</small></div>`).join('')}</div>` : '');
  const PIJL = { run: 'loopactie zonder bal (stippel)', dribble: 'dribbelen met bal (golf)', pass: 'pass (lijn)', shot: 'schot (dik)' };
  const legenda = (t) => { const it = (t && t.items) || []; const k = [...new Set(it.filter((x) => x.t === 'arrow').map((x) => x.k))].filter((x) => PIJL[x]);
    return k.length ? `<p class="tr-legenda">${k.map((x) => PIJL[x]).join(' · ')}</p>` : ''; };
  const punten = (txt) => { const l = String(txt || '').split(/\n+/).map((x) => x.replace(/^[-•*]\s*/, '').trim()).filter(Boolean); return l.length > 1 ? `<ul>${l.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>` : l.length ? `<p>${esc(l[0])}</p>` : ''; };
  const vormPrint = (S, v, o) => { const k = koppeling(S, v); const w = CC.weerstand(S, v); const va = o && o.variant != null ? (v.varianten || [])[o.variant] : null;
    return `<div class="pv-ond"><div class="pv-tek">${v.tekening ? tekening(v.tekening) : ''}${legenda(v.tekening)}</div><div>
      <p><b>${o ? `${esc(code(o))} · ` : ''}${esc(v.naam)}</b>${o ? ` · ${Number(o.min) || 0} min` : v.duur ? ` · ${v.duur} min` : ''}${va ? ` · variant ${esc(va.naam || '')}` : ''}</p>
      <p class="pv-meta">${[typeNaam(typeVan(v)), w && w.kort, context(v), v.afmeting, bereik(v.spelersMin, v.spelersMax, 'spelers')].filter(Boolean).map(esc).join(' · ')}</p>
      ${k.primair || v.doel ? `<p><b>Doel:</b> ${k.primair ? esc(ldNaam(S, k.primair)) : ''}${v.doel ? `${k.primair ? ' – ' : ''}${esc(v.doel)}` : ''}</p>` : ''}
      ${v.organisatie ? `<p><b>Organisatie en spelregels</b></p>${punten(v.organisatie)}` : ''}${va && va.tekst ? `<p><b>Variant:</b> ${esc(va.tekst)}</p>` : ''}
      ${v.coach ? `<p><b>Coachpunten</b></p>${punten(v.coach)}` : ''}${CC.materiaal(v.tekening).length ? `<p><b>Materiaal:</b> ${matTekst(CC.materiaal(v.tekening))}</p>` : ''}</div></div>`; };
  CC.on('tpPrint', (el) => { const S = CC.S(); const p = plan(S, el.dataset.id); if (!p) return; const a = actVan(S, p);
    // Materiaal: per soort het meeste dat tegelijk nodig is (spullen gaan mee van vorm naar vorm)
    const max = {}; (p.onderdelen || []).forEach((o) => { const v = o.vormId && vorm(S, o.vormId); if (v) CC.materiaal(v.tekening).forEach(([e, mv, n]) => { max[e] = Math.max(max[e] ? max[e][2] : 0, n) === n ? [e, mv, n] : max[e]; }); });
    CC.printDoc(`Training ${dagNaam(a)}${p.thema ? ` · ${p.thema}` : ''}`, `<p>${[a.tijd ? `${a.tijd}${a.eind ? `–${a.eind}` : ''}` : '', CC.tn(a.teamId), aantalSp(S, p, a) ? `${aantalSp(S, p, a)} spelers` : '', `${totaal(p)} min`, blokDoelen(S, p).replace(/<[^>]+>/g, '')].filter(Boolean).map(esc).join(' · ')}</p>
      ${Object.keys(max).length ? `<p><b>Materiaal (het meeste tegelijk):</b> ${matTekst(Object.values(max))}</p>` : ''}
      ${(p.onderdelen || []).map((o) => { const v = o.vormId && vorm(S, o.vormId); return v ? vormPrint(S, v, o) : `<p class="pv-sp"><b>${esc(code(o) || '')}</b> ${esc(o.spacing ? o.naam || 'Spacing' : o.naam || 'Nog leeg')} · ${Number(o.min) || 0} min${o.notitie ? ` · ${esc(o.notitie)}` : ''}</p>`; }).join('')}
      ${p.overig ? `<p class="pv-sp">${esc(p.overig.naam || 'Ombouw')} · ${Number(p.overig.min) || 0} min</p>` : ''}`); });
  CC.on('vormPrint', (el) => { const S = CC.S(); const v = vorm(S, el.dataset.id); if (!v) return; CC.printDoc(v.naam, vormPrint(S, v, null) + ((v.varianten || []).length ? `<h2>Varianten</h2>${v.varianten.map((x) => `<p><b>${esc(x.naam || '')}</b>${x.richting ? ` (${x.richting})` : ''} ${esc(x.tekst || '')}</p>`).join('')}` : '')); });

  // ---------- Lijn (Besluit 132): de opleidingslijn per week, gepland en uitgevoerd per hoofdleerdoel ----------
  const lijnHtml = (S) => {
    const ma = (d) => { const x = D.parse(d); const w = (x.getDay() + 6) % 7; return D.addDays(d, -w); };
    const nu = ma(D.vandaag()); const weken = Array.from({ length: 8 }, (_, i) => D.addDays(nu, (i - 6) * 7));
    const lds = leerdoelen(S).filter((l) => !String(l.id).startsWith('ld-'));
    const cel = {}; const tel = (w, ld, g, u) => { const c = (cel[`${w}|${ld}`] = cel[`${w}|${ld}`] || { g: 0, u: 0, uit: false }); c.g += g; if (u != null) { c.u += u; c.uit = true; } };
    const perWeek = {};
    plannen(S).filter((p) => p.eigenaar === ik() && !p.week).forEach((p) => { const a = actVan(S, p); if (!a.datum) return; const w = ma(a.datum); if (!weken.includes(w)) return;
      (perWeek[w] = perWeek[w] || []).push(p);
      (p.onderdelen || []).filter((o) => o.vormId && !o.spacing && o.blok !== 'start').forEach((o) => { const v = vorm(S, o.vormId); const pr = v && koppeling(S, v).primair; if (!pr) return;
        tel(w, pr, Number(o.min) || 0, p.gegeven ? (o.minUit != null ? Number(o.minUit) : Number(o.min) || 0) : null); }); });
    if (!lds.length) return `${CC.trWeekthema ? CC.trWeekthema(S) : ''}${h.leeg('Er staan nog geen leerdoelen in het opleidingsprofiel van de club. Daarom zie je hier nog geen minuten per leerdoel; het weekthema kun je al gebruiken.', 'list-checks')}`;
    return `${CC.trFase ? CC.trFase(S) : ''}${CC.trWeekthema ? CC.trWeekthema(S) : ''}<div class="kaartje tr-lijn"><b>Opleidingslijn · minuten per hoofdleerdoel</b><small class="zacht">Vet = uitgevoerd (training gegeven), grijs = alleen gepland. Rood = dit leerdoel kwam de afgelopen 4 weken niet aan bod.</small>
      <div class="tr-tabel"><table><thead><tr><th>Leerdoel</th>${weken.map((w) => `<th class="${w === nu ? 'nu' : ''}">wk ${D.weeknr(w)}</th>`).join('')}</tr></thead><tbody>
      ${lds.map((l) => { const vier = weken.slice(3, 7).some((w) => (cel[`${w}|${l.id}`] || {}).u || (cel[`${w}|${l.id}`] || {}).g);
        return `<tr><th class="${vier ? '' : 'rood'}">${esc(l.naam)}</th>${weken.map((w) => { const c = cel[`${w}|${l.id}`]; return `<td class="${w === nu ? 'nu' : ''}">${c ? (c.uit ? `<b>${c.u}</b>` : `<span class="zacht">${c.g}</span>`) : ''}</td>`; }).join('')}</tr>`; }).join('')}
      </tbody></table></div></div>
      <div class="kaartje"><b>Per week</b><div class="tr-lijst">${weken.slice().reverse().filter((w) => perWeek[w]).map((w) => `<div class="tr-rij tr-uit"><span class="tr-t"><b>Week ${D.weeknr(w)}</b><small>${perWeek[w].sort((x, y) => String(actVan(S, x).datum).localeCompare(String(actVan(S, y).datum))).map((p) => `${esc(dagNaam(actVan(S, p)))}: ${esc(p.thema || 'training')}${blokDoelen(S, p) ? ` (${blokDoelen(S, p)})` : ''}${p.gegeven ? ' ✓' : ''}`).join(' · ')}</small></span></div>`).join('') || '<p class="zacht">Nog geen trainingen in deze weken.</p>'}</div></div>
      ${maandBlok(S, true)}`; };

  // ---------- Mijn vormen (Training → Vormen): zoeken en filters die je kunt combineren ----------
  const vf = () => CC.ui.vf || (CC.ui.vf = {});
  const teamGrootte = (S) => { const tid = CC.teamId && CC.teamId(); return tid ? M.spelers(S, tid).length : 0; };
  const FILTERS = (S) => [
    ['type', 'Vormtype', VT.types.map((t) => [t.id, t.naam])],
    ['weer', 'Weerstand', [['zonder', 'zonder'], ['ondertal', 'ondertal'], ['gelijk', 'gelijk'], ['overtal', 'overtal']]],
    ['ld', 'Leerdoel', leerdoelen(S).map((l) => [l.id, l.naam])],
    // Besluit 137: aanbevolen leerniveau, met 'nog geen' om je vormen snel aan te vullen (alleen als het profiel leerniveaus heeft)
    ...(niveaus(S).length ? [['niveau', 'Leerniveau', [['zonder', 'nog geen leerniveau'], ...niveaus(S).map((x) => [x.id, x.naam])]]] : []),
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
    if (f.niveau && (f.niveau === 'zonder' ? !!v.niveauAdvies : v.niveauAdvies !== f.niveau)) return false;
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
    ${(() => { // Besluit 137: één rustige regel zolang vormen nog geen aanbevolen leerniveau hebben (alleen met leerniveaus in het profiel)
      const z = niveaus(S).length && !vf().niveau ? mijnVormen(S).filter((v) => !v.niveauAdvies).length : 0;
      return z ? `<button type="button" class="tr-rij tr-aanvul" data-act="vfZet" data-k="niveau" data-w="zonder"><span class="tr-t"><b>${z} vorm${z === 1 ? '' : 'en'} zonder leerniveau</b><small>Aanvullen: dan weet ClubComm welke vorm bij welke plek past</small></span>${icon('chevron-right')}</button>` : ''; })()}
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

  // ---------- Vorm bekijken (venster, Rinus-stijl): tekening links, de kaart rechts; eerst lezen, bewerken als je iets wijzigt ----------
  const kijkHtml = (S, v) => { const k = koppeling(S, v); const w = CC.weerstand(S, v); const c = context(v); const ty = typeVan(v); const mat = CC.materiaal(v.tekening);
    const aand = (v.aanduiding || []).map((x) => (VT.aanduidingen.find((a) => a.id === x) || {}).naam).filter(Boolean);
    const lo = (leeromgevingen(S).find((x) => x.id === v.leeromgeving) || {}).naam; if (lo) aand.unshift(lo);
    const vl = v.alsVastloopt || {}; const aant = [v.aantalIdeaal != null ? `ideaal ${v.aantalIdeaal}` : '', v.aantalMin != null ? `minimaal ${v.aantalMin}` : '', v.minVariant ? `minimumvariant: ${v.minVariant}` : ''].filter(Boolean).join(' · ');
    const vars = v.varianten || []; const mk = vars.filter((x) => x.richting === 'makkelijker'), mh = vars.filter((x) => x.richting === 'moeilijker'), rest = vars.filter((x) => !x.richting);
    const varLijst = (l) => `<ul>${l.map((x) => `<li><b>${esc(x.naam || 'Variant')}</b>${x.tekst ? ` · ${esc(x.tekst)}` : ''}</li>`).join('')}</ul>`;
    const ook = k.primair ? mijnVormen(S).filter((x) => x.id !== v.id && koppeling(S, x).primair === k.primair).slice(0, 4) : [];
    return `<div class="tr-rv"><div class="tr-rv-l"><div class="tr-groot">${v.tekening ? tekening(v.tekening) : `<div class="leeg">${icon('pencil')}<p>Nog geen tekening</p></div>`}</div>${legenda(v.tekening)}</div>
      <div class="tr-rv-r">${ty || aand.length ? `<small class="tr-soort">${esc([typeNaam(ty), ...aand].filter(Boolean).join(' · '))}</small>` : ''}
      <div class="tr-meta">${[v.afmeting, bereik(v.spelersMin, v.spelersMax, 'spelers'), v.duur ? `${v.duur} min` : '', w && w.kort, c].filter(Boolean).map((x) => `<span>${esc(x)}</span>`).join('')}</div>
      <div class="knoppen"><button class="knop" data-act="vormNaarTraining" data-id="${v.id}">${icon('plus')}Zet in een training…</button><button class="knop licht" data-act="vormKopie" data-id="${v.id}">${icon('repeat')}Dupliceren</button><button class="knop licht" data-act="vormPrint" data-id="${v.id}">${icon('printer')}Printen</button><button class="knop licht" data-act="vormBewerk" data-id="${v.id}">${icon('pencil')}Bewerken</button></div>
      ${k.primair || v.doel || v.faseAdvies || v.niveauAdvies ? `${h.sectie('Doel')}<p>${k.primair ? `★ ${esc(ldNaam(S, k.primair))}${k.ook.length ? ` · ook: ${k.ook.map((x) => esc(ldNaam(S, x))).join(', ')}` : ''}` : ''}${v.doel ? `${k.primair ? '<br>' : ''}${esc(v.doel)}` : ''}${v.niveauAdvies && niveauNaam(S, v.niveauAdvies) ? `<br><small class="zacht">Aanbevolen leerniveau: ${esc(niveauNaam(S, v.niveauAdvies))}</small>` : ''}${v.faseAdvies ? `<br><small class="zacht">Aanbevolen fase: ${esc(faseNaam(S, v.faseAdvies))}</small>` : ''}</p>` : ''}
      ${v.organisatie ? `${h.sectie('Organisatie en spelregels')}${punten(v.organisatie)}` : ''}
      ${v.coach ? `${h.sectie('Coachpunten')}${punten(v.coach)}` : ''}
      ${mk.length || mh.length ? `<div class="twee">${mk.length ? `<div>${h.sectie('Makkelijker')}${varLijst(mk)}</div>` : ''}${mh.length ? `<div>${h.sectie('Moeilijker')}${varLijst(mh)}</div>` : ''}</div>` : ''}
      ${rest.length ? `${h.sectie(`Varianten (${rest.length})`)}${varLijst(rest)}` : ''}
      ${vl.probleem || vl.interventie ? `${h.sectie('Als de vorm vastloopt')}<p>${esc(vl.probleem || '?')} → ${esc(vl.interventie || '?')}</p>` : ''}
      ${aant ? `<p class="zacht klein"><b>Aantallen:</b> ${esc(aant)}</p>` : ''}
      ${mat.length ? `${h.sectie('Materiaal (uit de tekening)')}${matHtml(mat)}` : ''}
      ${v.anders ? `<p class="zacht klein"><b>Volgende keer anders:</b> ${esc(v.anders)}</p>` : ''}
      ${ook.length ? `${h.sectie(`Ook voor ${esc(ldNaam(S, k.primair))}`)}<div class="tr-ook">${ook.map((x) => `<button type="button" class="tr-kaart" data-act="vormOpen" data-id="${x.id}"><span class="tr-teken">${x.tekening ? tekening(x.tekening) : icon('pencil')}</span><span class="tr-t"><b>${esc(x.naam)}</b></span></button>`).join('')}</div>` : ''}
      </div></div>`; };
  CC.on('vormOpen', (el) => { const S = CC.S(); const v = vorm(S, el.dataset.id); if (!v) return; CC.closeSheet(); CC.sheet(v.naam, kijkHtml(S, v), { groot: true });
    const sh = document.querySelector('#sheet .sheet'); if (sh) sh.classList.add('xl'); });
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
      ${mpWeerstand(S).length ? `<div class="chips"><span class="zacht klein tr-lbl">Weerstand</span>${mpWeerstand(S).map((x) => kies(v, 'weerstandNiveau', x, x, v.weerstandNiveau === x)).join('')}</div>`
        : `<div class="chips"><span class="zacht klein tr-lbl">Weerstand?</span>${VT.weerstandExtra.map((x) => kies(v, 'weerstandExtra', x.id, x.naam, v.weerstandExtra === x.id)).join('')}</div>`}
      ${h.sectie('Vormtype')}<div class="chips">${VT.types.map((t) => kies(v, 'type', t.id, esc(t.naam), ty === t.id)).join('')}</div>
      <div class="chips">${VT.aanduidingen.map((x) => kies(v, 'aanduiding', x.id, `${(v.aanduiding || []).includes(x.id) ? '✓' : '+'} ${esc(x.naam)}`, (v.aanduiding || []).includes(x.id))).join('')}</div>
      ${precies.length > 1 ? `<details class="uitklap tr-precies" ${(v.precies || []).length ? 'open' : ''}><summary>Meer precies (optioneel)</summary><div class="chips">${precies.map((x) => kies(v, 'precies', x.id, esc(x.naam), (v.precies || []).includes(x.id))).join('')}</div><p></p></details>` : ''}
      ${h.sectie('Speelrichting')}<div class="chips">${[[0, 'geen'], [1, 'één'], [2, 'twee']].map(([x, n]) => kies(v, 'richting', x, n, v.richting === x)).join('')}${kies(v, 'doelen', 'ja', `${v.doelen ? '✓ ' : ''}met doelen`, v.doelen === true)}</div>
      ${h.sectie('Omschakeling')}<div class="chips">${VT.omschakeling.map((o) => kies(v, 'omschakeling', o.id, esc(o.naam), v.omschakeling === o.id)).join('')}</div>
      ${niveaus(S).length ? `${h.sectie('Aanbevolen leerniveau (optioneel)')}<div class="chips">${niveaus(S).map((x) => kies(v, 'niveauAdvies', x.id, esc(x.naam), v.niveauAdvies === x.id)).join('')}</div>` : ''}
      ${fasen(S).length ? `${h.sectie('Aanbevolen fase (optioneel)')}<div class="chips">${fasen(S).map((f) => kies(v, 'faseAdvies', f.id, esc(f.naam), v.faseAdvies === f.id)).join('')}</div>` : ''}
      <label for="v-af">Afmeting</label><input id="v-af" name="afmeting" value="${esc(v.afmeting || '')}" placeholder="Bijv. 25 × 20 m">
      ${uitgebreid(S, v)}
      </div>`; };
  // Besluit 133: uitgebreide velden uit het profiel (DCG), ingeklapt zodat een nieuwe vorm kort blijft
  const mpWeerstand = (S) => ((((ond(S, 'mengpaneel') || {}).knoppen || []).find((k) => k.id === 'mp-weerstand') || {}).opties || []);
  const leeromgevingen = (S) => (ond(S, 'leeromgevingen') || {}).items || [];
  const uitgebreid = (S, v) => { const lo = leeromgevingen(S); const vl = v.alsVastloopt || {}; const n = [v.leeromgeving, vl.probleem, vl.interventie, v.aantalIdeaal, v.aantalMin, v.minVariant].filter((x) => x != null && x !== '').length;
    return `<details class="uitklap tr-precies" ${n ? 'open' : ''}><summary>Uitgebreid (optioneel)${n ? ` · ${n} ingevuld` : ''}</summary>
      ${lo.length ? `${h.sectie('Leeromgeving')}<div class="chips">${lo.map((x) => kies(v, 'leeromgeving', x.id, esc(x.naam.replace('/technische vorm', '').replace(' spelvorm', '')), v.leeromgeving === x.id)).join('')}</div>` : ''}
      <label>Als de vorm vastloopt</label><div class="twee"><div><label for="v-vp" class="klein">Waarschijnlijk probleem</label><input id="v-vp" name="vastProbleem" value="${esc(vl.probleem || '')}" placeholder="Bijv. ontvanger draait niet open"></div><div><label for="v-vi" class="klein">Eerste interventie</label><input id="v-vi" name="vastInterventie" value="${esc(vl.interventie || '')}" placeholder="Bijv. verdediger start later"></div></div>
      <div class="drie"><div><label for="v-ai">Ideaal aantal</label><input id="v-ai" name="aantalIdeaal" type="number" inputmode="numeric" min="0" max="40" value="${v.aantalIdeaal == null ? '' : v.aantalIdeaal}"></div><div><label for="v-am">Minimum</label><input id="v-am" name="aantalMin" type="number" inputmode="numeric" min="0" max="40" value="${v.aantalMin == null ? '' : v.aantalMin}"></div><div><label for="v-mv">Minimumvariant</label><input id="v-mv" name="minVariant" value="${esc(v.minVariant || '')}" placeholder="Bijv. 1v1 + kaatser"></div></div>
      <p></p></details>`; };
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
          <label for="v-dl">Doel (één zin)</label><input id="v-dl" name="doel" value="${esc(v.doel || '')}" placeholder="Bijv. uitspelen van een 1 tegen 1 situatie">
          <label for="v-o">Organisatie en spelregels (één per regel)</label><textarea id="v-o" name="organisatie" rows="4">${esc(v.organisatie || '')}</textarea>
          <label for="v-c">Coachpunten (één per regel)</label><textarea id="v-c" name="coach" rows="3">${esc(v.coach || '')}</textarea>
          <label for="v-a">Wat ik de volgende keer anders doe</label><textarea id="v-a" name="anders" rows="3">${esc(v.anders || '')}</textarea>
          <label for="v-t">Eigen woorden (tags)</label><input id="v-t" name="tags" value="${esc((v.tags || []).join(', '))}" placeholder="Bijv. dreigen, bowlen">
        </form>
        <div class="knoppen"><button class="knop licht" data-act="vormKopie" data-id="${v.id}">${icon('repeat')}Dupliceren</button><button class="knop licht" data-act="vormWeg" data-id="${v.id}" style="color:var(--rood)">${icon('trash-2')}Verwijderen</button></div>
      </div></div>` };
  };
  const getal = (x) => (x === '' || x == null ? null : Number(x));
  CC.autosave.vorm = (f) => { const S = CC.S(); const v = vorm(S, f.dataset.id); if (!v) return;
    Object.assign(v, { naam: f.naam.value.trim() || 'Vorm', spelersMin: getal(f.s1.value), spelersMax: getal(f.s2.value), keepersMin: getal(f.k1.value), keepersMax: getal(f.k2.value), duur: getal(f.duur.value),
      doel: f.doel.value.trim(), organisatie: f.organisatie.value.trim(), coach: f.coach.value.trim(), anders: f.anders.value.trim(), afmeting: f.afmeting.value.trim(),
      tags: f.tags.value.split(',').map((x) => x.trim()).filter(Boolean),
      alsVastloopt: f.vastProbleem ? { probleem: f.vastProbleem.value.trim(), interventie: f.vastInterventie.value.trim() } : v.alsVastloopt,
      aantalIdeaal: f.aantalIdeaal ? getal(f.aantalIdeaal.value) : v.aantalIdeaal, aantalMin: f.aantalMin ? getal(f.aantalMin.value) : v.aantalMin, minVariant: f.minVariant ? f.minVariant.value.trim() : v.minVariant,
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

  // Gedeelde hulpjes voor periodisering.js (Besluit 133)
  CC.tr = { plan, plannen, vorm, ik, actVan, ond, leerdoelen, ldNaam, sjablonen, blokDoel, nieuwId, afgelopen, dagNaam, totaal, leegSlot, code, blokSoort, niveaus, niveauNaam, profielId, leeromgevingen };
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
      <fieldset class="tr-chips"><legend>Richting</legend>${[['', 'Variant'], ['makkelijker', 'Makkelijker'], ['moeilijker', 'Moeilijker']].map(([w, n]) => `<label class="tr-chip"><input type="radio" name="richting" value="${w}" ${(x.richting || '') === w ? 'checked' : ''}><span>${n}</span></label>`).join('')}</fieldset>
      <button class="knop vol">Klaar</button></form>
      ${nieuw ? '' : `<div class="knoppen"><button class="knop licht" data-act="vormVariantTeken" data-id="${v.id}" data-i="${el.dataset.i}">${icon('pencil')}${x.tekening ? 'Tekening aanpassen' : 'Tekening maken'}</button><button class="knop licht" data-act="vormVariantWeg" data-id="${v.id}" data-i="${el.dataset.i}" style="color:var(--rood)">${icon('trash-2')}Weghalen</button></div>`}`);
  });
  CC.on('vormVariantOk', (f) => { const v = vorm(CC.S(), f.dataset.id); if (!v) return; v.varianten = v.varianten || [];
    const x = { naam: f.naam.value.trim(), tekst: f.tekst.value.trim(), richting: (f.querySelector('input[name="richting"]:checked') || {}).value || null };
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
