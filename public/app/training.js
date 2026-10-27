// ClubComm — trainingsmodule, fase 1 (Besluit 128): eigen oefenvormen (tekening, aantallen, varianten) en trainingen
// per activiteit (vormen en spacing-blokken in volgorde, thema, leerdoelen uit het opleidingsprofiel, terugblik).
// Alles scope "eigen": alleen de trainer die het maakte ziet het. Aan/uit met de module "Trainingen (proef)".
(function () {
  const CC = window.CC; const D = CC.date, M = CC.m, h = CC.h, icon = CC.icon, esc = CC.esc;
  const SOORTEN = [['droog', 'Droog'], ['spacing', 'Spacing'], ['positie', 'Positiespel'], ['partij', 'Partijvorm']];
  const KLEUR = { droog: '#0869c2', spacing: '#f5b041', positie: '#137333', partij: '#0b4f7a' };
  const soortNaam = (k) => (SOORTEN.find((x) => x[0] === k) || [k, 'Vorm'])[1];

  CC.trainingAan = (S) => !!(S.club.modules || {}).training && (CC.rol() || {}).rol === 'trainer';
  const vormen = (S) => S.vormen || (S.vormen = []);
  const plannen = (S) => S.trainingsplannen || (S.trainingsplannen = []);
  const ik = () => (CC.me() || {}).id;
  const mijnVormen = (S) => vormen(S).filter((v) => v.eigenaar === ik() && !v.weg);
  const vorm = (S, id) => vormen(S).find((v) => v.id === id);
  const plan = (S, actId) => plannen(S).find((p) => p.actId === actId && p.eigenaar === ik());
  const nieuwId = (p) => `${p}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`;

  // Leerdoelen komen uit het opleidingsprofiel van de club (Besluit 123); zonder profiel: geen keuze
  const profiel = (S) => { const p = S.profielen || {}; return p[S.club.id] || p[S.club.profiel] || Object.values(p)[0] || null; };
  const leerdoelen = (S) => { const pr = profiel(S); const l = pr && pr.onderdelen && pr.onderdelen.leerlijnen; return l ? (l.items || []).filter((x) => x.naam) : []; };
  const ldNaam = (S, id) => { const x = leerdoelen(S).find((l) => l.id === id); return x ? `${x.naam}${x.kern ? ` – ${x.kern}` : ''}` : ''; };

  const tekening = (t) => (t && window.DrawTool ? window.DrawTool.staticSvg(t) : '');
  const mini = (v, spacing) => (spacing && !(v && v.tekening) ? '<span class="tr-mini sp">spacing</span>' : `<span class="tr-mini">${v && v.tekening ? tekening(v.tekening) : icon('pencil')}</span>`);
  const bereik = (a, b, woord) => (a == null && b == null ? '' : `${a != null ? a : '?'}${b != null && b !== a ? `–${b}` : ''} ${woord}`);
  const verwacht = (S, a) => M.spelers(S, a.teamId).filter((pl) => M.status(S, pl, a).code === 'verwacht').length;
  // Past de vorm bij dit aantal? En wat schreef de trainer voor precies dit aantal?
  const past = (v, n, k) => (v.spelersMin == null || n >= v.spelersMin) && (v.spelersMax == null || n <= v.spelersMax) && (k == null || v.keepersMax == null || k <= v.keepersMax);
  const voorAantal = (v, n, k) => (v.aantallen || []).find((x) => Number(x.spelers) === n && (x.keepers == null || k == null || Number(x.keepers) === k));

  // ---------- Blok bij een training (Planning → training) ----------
  CC.trainingBlok = (S, a) => {
    if (!a || a.soort !== 'training' || !CC.trainingAan(S)) return '';
    const p = plan(S, a.id);
    if (!p) return `${h.sectie('Training')}<button class="knop licht vol" data-act="tpNieuw" data-id="${a.id}">${icon('pencil')}Training voorbereiden of vastleggen</button>`;
    const min = (p.onderdelen || []).reduce((t, o) => t + (Number(o.min) || 0), 0);
    return `${h.sectie('Training')}${h.rij({ ic: 'list-checks', titel: esc(p.thema || 'Training'), sub: `${(p.onderdelen || []).length} onderdelen · ${min} min${p.gegeven ? ' · gegeven' : ''}`, act: 'open', attrs: `data-view="trainingsplan" data-id="${a.id}"` })}`;
  };
  CC.on('tpNieuw', (el) => {
    const S = CC.S(); const a = M.act(S, el.dataset.id); if (!a) return;
    if (!plan(S, a.id)) plannen(S).push({ id: nieuwId('tp'), actId: a.id, teamId: a.teamId, datum: a.datum, eigenaar: ik(), thema: '', leerdoelen: [], onderdelen: [], spelers: verwacht(S, a), keepers: null });
    CC.save(); CC.open('trainingsplan', { id: a.id });
  });

  // ---------- Training (pagina) ----------
  const balk = (S, p) => { const o = (p.onderdelen || []).filter((x) => Number(x.min) > 0); if (!o.length) return '';
    return `<div class="tr-balk" aria-hidden="true">${o.map((x) => { const v = x.vormId && vorm(S, x.vormId); const k = x.spacing ? 'spacing' : (v && v.soort) || 'droog'; return `<i style="flex:${Number(x.min)};background:${KLEUR[k] || KLEUR.droog}"></i>`; }).join('')}</div>`; };
  CC.views.trainingsplan = (S, prm) => {
    const a = M.act(S, prm.id); const p = a && plan(S, a.id);
    if (!a || !p) return { titel: 'Training', html: h.leeg('Deze training bestaat niet meer.') };
    const d = D.parse(a.datum); const n = Number(p.spelers) || 0, k = p.keepers == null || p.keepers === '' ? null : Number(p.keepers);
    const min = (p.onderdelen || []).reduce((t, o) => t + (Number(o.min) || 0), 0);
    const duur = a.eind && a.tijd ? Math.round((D.parse(`${a.datum}T${a.eind}`) - D.parse(`${a.datum}T${a.tijd}`)) / 60000) : null;
    const lds = leerdoelen(S);
    const rijen = (p.onderdelen || []).map((o, i) => {
      const v = o.vormId && vorm(S, o.vormId);
      const naam = v ? v.naam : o.naam || 'Spacing';
      const extra = v && n ? (voorAantal(v, n, k) ? esc(voorAantal(v, n, k).tekst) : (!past(v, n, k) ? `gemaakt voor ${bereik(v.spelersMin, v.spelersMax, 'spelers')}` : '')) : '';
      const sub = [o.spacing ? 'spacing' : v ? soortNaam(v.soort) : '', o.notitie ? esc(o.notitie) : '', extra].filter(Boolean).join(' · ');
      return `<button type="button" class="tr-rij" data-act="tpOnderdeel" data-id="${a.id}" data-i="${i}">${mini(v, o.spacing)}<span class="tr-t"><b>${esc(naam)}</b><small>${sub}</small></span><span class="tr-min">${Number(o.min) || 0} min${v && n && !past(v, n, k) && !voorAantal(v, n, k) ? '<span class="st o">aantal</span>' : ''}</span></button>`;
    }).join('');
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
        <div class="tr-kop"><b>Opbouw</b><span class="zacht klein"><b>${min}</b>${duur ? ` van ${duur}` : ''} min</span></div>
        ${balk(S, p)}
        ${rijen ? `<div class="tr-lijst">${rijen}</div>` : '<p class="zacht">Nog leeg. Voeg vormen en spacing toe in de volgorde van de training.</p>'}
        <div class="knoppen"><button class="knop" data-act="tpVormKiezen" data-id="${a.id}">${icon('plus')}Vorm</button><button class="knop licht" data-act="tpSpacing" data-id="${a.id}">${icon('plus')}Spacing</button><button class="knop licht" data-act="tpKopie" data-id="${a.id}">${icon('repeat')}Eerdere training</button></div>
      </div>
      </div>
      <div class="tr-kol">
      <form class="kaartje codeform" data-autosave="tpTerug" data-id="${a.id}">
        <label class="schakel"><span>Training is gegeven</span><input type="checkbox" name="gegeven" ${p.gegeven ? 'checked' : ''}><i></i></label>
        <label for="tp-an">Wat doe je de volgende keer anders?</label><textarea id="tp-an" name="anders" rows="4" placeholder="Bijv. de 10 en de 6 als neutrale speler">${esc(p.anders || '')}</textarea>
      </form>
      <button class="knop licht vol" data-act="tpWeg" data-id="${a.id}" style="color:var(--rood)">${icon('trash-2')}Training leegmaken</button>
      </div></div>` };
  };
  CC.autosave.tpKop = (f) => { const S = CC.S(); const p = plan(S, f.dataset.id); if (!p) return;
    p.thema = f.thema.value.trim(); p.leerdoelen = [...f.querySelectorAll('input[name="ld"]:checked')].map((x) => x.value);
    p.spelers = f.spelers.value === '' ? null : Number(f.spelers.value); p.keepers = f.keepers.value === '' ? null : Number(f.keepers.value); };
  CC.autosave.tpTerug = (f) => { const S = CC.S(); const p = plan(S, f.dataset.id); if (!p) return; p.gegeven = f.gegeven.checked; p.anders = f.anders.value.trim(); };
  CC.on('tpWeg', (el) => CC.sheet('Training leegmaken?', `<p>De opbouw, het thema en je terugblik van deze training worden verwijderd. Je vormen blijven bestaan.</p><div class="knoppen"><button class="knop rood" data-act="tpWegOk" data-id="${el.dataset.id}">Leegmaken</button><button class="knop licht" data-act="sluit">Annuleren</button></div>`));
  CC.on('tpWegOk', (el) => { const S = CC.S(); S.trainingsplannen = plannen(S).filter((p) => !(p.actId === el.dataset.id && p.eigenaar === ik())); CC.save(); CC.closeSheet(); CC.terug ? CC.terug() : CC.go('aanwezigheid'); });

  // Onderdeel: minuten, spacing, volgorde, verwijderen
  CC.on('tpOnderdeel', (el) => {
    const S = CC.S(); const p = plan(S, el.dataset.id); const i = Number(el.dataset.i); const o = p && p.onderdelen[i]; if (!o) return;
    const v = o.vormId && vorm(S, o.vormId);
    CC.sheet(v ? v.naam : 'Spacing', `<form data-submit="tpOnderdeelOk" data-id="${el.dataset.id}" data-i="${i}" class="codeform">
      ${v ? '' : `<label for="on-n">Wat doen ze?</label><input id="on-n" name="naam" value="${esc(o.naam || '')}" placeholder="Bijv. Hooghouden">`}
      <div class="twee"><div><label for="on-m">Minuten</label><input id="on-m" name="min" type="number" inputmode="numeric" min="0" max="90" value="${Number(o.min) || 0}"></div>
        <div><label for="on-t">Notitie</label><input id="on-t" name="notitie" value="${esc(o.notitie || '')}" placeholder="Bijv. herhaling"></div></div>
      ${v ? `<label class="schakel"><span>Gebruiken als spacing</span><input type="checkbox" name="spacing" ${o.spacing ? 'checked' : ''}><i></i></label>` : ''}
      <button class="knop vol">Klaar</button></form>
      <div class="knoppen">${i > 0 ? `<button class="knop licht" data-act="tpSchuif" data-id="${el.dataset.id}" data-i="${i}" data-r="-1">↑ Omhoog</button>` : ''}${i < p.onderdelen.length - 1 ? `<button class="knop licht" data-act="tpSchuif" data-id="${el.dataset.id}" data-i="${i}" data-r="1">↓ Omlaag</button>` : ''}
        ${v ? `<button class="knop licht" data-act="vormOpen" data-id="${v.id}">${icon('pencil')}Vorm openen</button>` : ''}<button class="knop licht" data-act="tpOnderdeelWeg" data-id="${el.dataset.id}" data-i="${i}" style="color:var(--rood)">${icon('trash-2')}Weghalen</button></div>`);
  });
  CC.on('tpOnderdeelOk', (f) => { const S = CC.S(); const p = plan(S, f.dataset.id); const o = p && p.onderdelen[Number(f.dataset.i)]; if (!o) return;
    o.min = Number(f.min.value) || 0; o.notitie = f.notitie.value.trim(); if (f.naam) o.naam = f.naam.value.trim() || 'Spacing'; if (f.spacing) o.spacing = f.spacing.checked;
    CC.save(); CC.closeSheet(); CC.render(); });
  CC.on('tpSchuif', (el) => { const S = CC.S(); const p = plan(S, el.dataset.id); const i = Number(el.dataset.i), j = i + Number(el.dataset.r); if (!p || j < 0 || j >= p.onderdelen.length) return;
    [p.onderdelen[i], p.onderdelen[j]] = [p.onderdelen[j], p.onderdelen[i]]; CC.save(); CC.closeSheet(); CC.render(); });
  CC.on('tpOnderdeelWeg', (el) => { const S = CC.S(); const p = plan(S, el.dataset.id); if (!p) return; p.onderdelen.splice(Number(el.dataset.i), 1); CC.save(); CC.closeSheet(); CC.render(); });
  CC.on('tpSpacing', (el) => { const S = CC.S(); const p = plan(S, el.dataset.id); if (!p) return; p.onderdelen.push({ id: nieuwId('o'), spacing: true, naam: 'Hooghouden', min: 2 }); CC.save(); CC.render(); });

  // Vorm kiezen: eerst wat past bij het aantal spelers en keepers van deze training
  CC.on('tpVormKiezen', (el) => {
    const S = CC.S(); const p = plan(S, el.dataset.id); if (!p) return;
    const n = Number(p.spelers) || 0, k = p.keepers == null ? null : Number(p.keepers);
    const lijst = mijnVormen(S).slice().sort((x, y) => x.naam.localeCompare(y.naam));
    const goed = n ? lijst.filter((v) => past(v, n, k) || voorAantal(v, n, k)) : lijst; const rest = n ? lijst.filter((v) => !goed.includes(v)) : [];
    const rij = (v) => `<button type="button" class="tr-rij" data-act="tpVormErbij" data-id="${el.dataset.id}" data-v="${v.id}">${mini(v)}<span class="tr-t"><b>${esc(v.naam)}</b><small>${[soortNaam(v.soort), bereik(v.spelersMin, v.spelersMax, 'spelers'), v.duur ? `${v.duur} min` : '', n && voorAantal(v, n, k) ? esc(voorAantal(v, n, k).tekst) : ''].filter(Boolean).join(' · ')}</small></span></button>`;
    CC.sheet('Vorm toevoegen', `${n ? `<p class="zacht klein">Passend bij <b>${n} spelers${k != null ? ` en ${k} keeper${k === 1 ? '' : 's'}` : ''}</b>.</p>` : ''}
      ${goed.length ? `<div class="tr-lijst">${goed.map(rij).join('')}</div>` : `<p class="zacht">${lijst.length ? 'Geen vorm voor dit aantal.' : 'Je hebt nog geen vormen.'}</p>`}
      ${rest.length ? `<details class="uitklap"><summary>Andere vormen (${rest.length})</summary><div class="tr-lijst">${rest.map(rij).join('')}</div></details>` : ''}
      <button class="knop licht vol" data-act="vormNieuw" data-plan="${el.dataset.id}">${icon('plus')}Nieuwe vorm maken</button>`, { groot: true });
  });
  CC.on('tpVormErbij', (el) => { const S = CC.S(); const p = plan(S, el.dataset.id); const v = vorm(S, el.dataset.v); if (!p || !v) return;
    p.onderdelen.push({ id: nieuwId('o'), vormId: v.id, min: Number(v.duur) || 0, spacing: v.soort === 'spacing' }); CC.save(); CC.closeSheet(); CC.render(); });
  // Eerdere training als basis: opbouw, thema en leerdoelen overnemen
  CC.on('tpKopie', (el) => {
    const S = CC.S(); const p = plan(S, el.dataset.id);
    const eerder = plannen(S).filter((x) => x.eigenaar === ik() && x !== p && (x.onderdelen || []).length).sort((x, y) => String(y.datum).localeCompare(String(x.datum)));
    CC.sheet('Eerdere training gebruiken', eerder.length ? `<p class="zacht klein">De opbouw komt in deze training; daarna pas je aan wat anders moet.</p><div class="tr-lijst">${eerder.map((x) => { const v = (x.onderdelen || []).map((o) => o.vormId && vorm(S, o.vormId)).find(Boolean);
      return `<button type="button" class="tr-rij" data-act="tpKopieOk" data-id="${el.dataset.id}" data-van="${x.id}">${mini(v)}<span class="tr-t"><b>${esc(x.thema || 'Training')}</b><small>${D.kort(x.datum)} · ${x.onderdelen.length} onderdelen${x.spelers ? ` · ${x.spelers} spelers` : ''}${x.anders ? ` · ${esc(x.anders)}` : ''}</small></span></button>`; }).join('')}</div>`
      : '<p class="zacht">Je hebt nog geen eerdere training met een opbouw.</p>');
  });
  CC.on('tpKopieOk', (el) => { const S = CC.S(); const p = plan(S, el.dataset.id); const van = plannen(S).find((x) => x.id === el.dataset.van); if (!p || !van) return;
    p.onderdelen = (p.onderdelen || []).concat(van.onderdelen.map((o) => ({ ...o, id: nieuwId('o') })));
    if (!p.thema) p.thema = van.thema; if (!(p.leerdoelen || []).length) p.leerdoelen = (van.leerdoelen || []).slice();
    CC.save(); CC.closeSheet(); CC.render(); CC.toast('Opbouw overgenomen'); });

  // ---------- Mijn vormen (Planning → Vormen) ----------
  CC.vormenLijst = (S) => {
    const f = h.segVal('vormSoort', 'alle'); const l = mijnVormen(S).filter((v) => f === 'alle' || v.soort === f).sort((x, y) => x.naam.localeCompare(y.naam));
    return `${h.seg('vormSoort', [['alle', 'Alle'], ...SOORTEN.filter(([k]) => k !== 'spacing')], 'alle')}
      <button class="knop vol" data-act="vormNieuw">${icon('plus')}Nieuwe vorm</button>
      ${l.length ? `<div class="tr-raster">${l.map((v) => `<button type="button" class="tr-kaart" data-act="vormOpen" data-id="${v.id}"><span class="tr-teken">${v.tekening ? tekening(v.tekening) : icon('pencil')}</span><span class="tr-t"><b>${esc(v.naam)}</b><small>${[soortNaam(v.soort), bereik(v.spelersMin, v.spelersMax, 'spelers'), v.duur ? `${v.duur} min` : ''].filter(Boolean).join(' · ')}</small>${(v.leerdoelen || []).length ? `<small class="tr-ld">${esc(ldNaam(S, v.leerdoelen[0]))}</small>` : ''}</span></button>`).join('')}</div>`
        : h.leeg('Nog geen vormen. Maak je eerste vorm, of voeg er een toe vanuit een training.', 'pencil')}`;
  };
  CC.on('vormNieuw', (el) => {
    const S = CC.S(); const v = { id: nieuwId('v'), eigenaar: ik(), teamId: CC.teamId ? CC.teamId() : null, naam: 'Nieuwe vorm', soort: 'droog', spelersMin: null, spelersMax: null, keepersMin: null, keepersMax: null, duur: 6, leerdoelen: [], organisatie: '', coach: '', anders: '', aantallen: [], varianten: [], tekening: null, gemaakt: new Date().toISOString() };
    vormen(S).push(v);
    // Vanuit een training: meteen in die training zetten
    if (el.dataset.plan){ const p = plan(S, el.dataset.plan); if (p) p.onderdelen.push({ id: nieuwId('o'), vormId: v.id, min: v.duur }); }
    CC.save(); CC.closeSheet(); CC.open('vorm', { id: v.id });
  });
  CC.on('vormOpen', (el) => { CC.closeSheet(); CC.open('vorm', { id: el.dataset.id }); });

  // ---------- Vorm (pagina): tekening links, gegevens rechts op de laptop ----------
  CC.views.vorm = (S, prm) => {
    const v = vorm(S, prm.id); if (!v || v.weg) return { titel: 'Vorm', html: h.leeg('Deze vorm bestaat niet meer.') };
    const lds = leerdoelen(S); const num = (n, w) => (w == null ? '' : w);
    return { titel: esc(v.naam), sub: 'Mijn vormen', breed: true, html: `
      <div class="tr-lay tr-vorm">
      <div class="tr-kol tr-a">
        <div class="tr-groot">${v.tekening ? tekening(v.tekening) : `<div class="leeg">${icon('pencil')}<p>Nog geen tekening</p></div>`}</div>
        <button class="knop" data-act="vormTeken" data-id="${v.id}">${icon('pencil')}${v.tekening ? 'Tekening aanpassen' : 'Tekening maken'}</button>
      </div>
      <div class="tr-kol tr-c">
        ${h.sectie('Varianten')}
        ${(v.varianten || []).map((x, i) => `<div class="kaartje tr-var"><div class="tr-kop"><b>${esc(x.naam || `Variant ${String.fromCharCode(65 + i)}`)}</b><span><button class="icoonknop" data-act="vormVariant" data-id="${v.id}" data-i="${i}" aria-label="Variant aanpassen">${icon('pencil')}</button></span></div>${x.tekst ? `<p class="klein">${esc(x.tekst)}</p>` : ''}${x.tekening ? `<div class="tr-groot klein">${tekening(x.tekening)}</div>` : ''}</div>`).join('') || '<p class="zacht klein">Bijv. A: de passer loopt om het doeltje, B: tot aan het doel (diepte).</p>'}
        <button class="knop licht vol" data-act="vormVariant" data-id="${v.id}" data-i="nieuw">${icon('plus')}Variant</button>
        ${h.sectie('Bij andere aantallen')}
        ${(v.aantallen || []).map((x, i) => `<div class="rij"><span class="rij-tekst"><b>${x.spelers} spelers${x.keepers != null && x.keepers !== '' ? ` + ${x.keepers} keeper${Number(x.keepers) === 1 ? '' : 's'}` : ''}</b><small>${esc(x.tekst)}</small></span><button class="icoonknop" data-act="vormAantal" data-id="${v.id}" data-i="${i}" aria-label="Aanpassen">${icon('pencil')}</button></div>`).join('') || '<p class="zacht klein">Schrijf per groepsgrootte hoe je de vorm opzet, bijv. 14 spelers + 2 keepers: 6 tegen 6 met keepers.</p>'}
        <button class="knop licht vol" data-act="vormAantal" data-id="${v.id}" data-i="nieuw">${icon('plus')}Aantal</button>
      </div>
      <div class="tr-kol tr-b">
        <form class="kaartje codeform" data-autosave="vorm" data-id="${v.id}">
          <label for="v-n">Naam</label><input id="v-n" name="naam" value="${esc(v.naam)}">
          <fieldset class="tr-chips"><legend>Soort</legend>${SOORTEN.map(([k, l]) => `<label class="tr-chip"><input type="radio" name="soort" value="${k}" ${v.soort === k ? 'checked' : ''}><span>${l}</span></label>`).join('')}</fieldset>
          <div class="drie"><div><label for="v-s1">Spelers van</label><input id="v-s1" name="s1" type="number" inputmode="numeric" min="0" max="40" value="${num(0, v.spelersMin)}"></div><div><label for="v-s2">tot</label><input id="v-s2" name="s2" type="number" inputmode="numeric" min="0" max="40" value="${num(0, v.spelersMax)}"></div><div><label for="v-d">Minuten</label><input id="v-d" name="duur" type="number" inputmode="numeric" min="0" max="90" value="${num(0, v.duur)}"></div></div>
          <div class="twee"><div><label for="v-k1">Keepers van</label><input id="v-k1" name="k1" type="number" inputmode="numeric" min="0" max="6" value="${num(0, v.keepersMin)}"></div><div><label for="v-k2">tot</label><input id="v-k2" name="k2" type="number" inputmode="numeric" min="0" max="6" value="${num(0, v.keepersMax)}"></div></div>
          ${lds.length ? `<fieldset class="tr-chips"><legend>Leerdoelen</legend>${lds.map((l) => `<label class="tr-chip"><input type="checkbox" name="ld" value="${esc(l.id)}" ${(v.leerdoelen || []).includes(l.id) ? 'checked' : ''}><span>${esc(l.naam)}${l.kern ? ` – ${esc(l.kern)}` : ''}</span></label>`).join('')}</fieldset>` : ''}
          <label for="v-o">Organisatie en regels</label><textarea id="v-o" name="organisatie" rows="4">${esc(v.organisatie || '')}</textarea>
          <label for="v-c">Coachpunten</label><textarea id="v-c" name="coach" rows="3">${esc(v.coach || '')}</textarea>
          <label for="v-a">Wat ik de volgende keer anders doe</label><textarea id="v-a" name="anders" rows="3">${esc(v.anders || '')}</textarea>
        </form>
        <div class="knoppen"><button class="knop licht" data-act="vormKopie" data-id="${v.id}">${icon('repeat')}Kopie maken</button><button class="knop licht" data-act="vormWeg" data-id="${v.id}" style="color:var(--rood)">${icon('trash-2')}Verwijderen</button></div>
      </div></div>` };
  };
  const getal = (x) => (x === '' || x == null ? null : Number(x));
  CC.autosave.vorm = (f) => { const S = CC.S(); const v = vorm(S, f.dataset.id); if (!v) return;
    Object.assign(v, { naam: f.naam.value.trim() || 'Vorm', soort: (f.querySelector('input[name="soort"]:checked') || {}).value || v.soort, spelersMin: getal(f.s1.value), spelersMax: getal(f.s2.value), keepersMin: getal(f.k1.value), keepersMax: getal(f.k2.value), duur: getal(f.duur.value),
      leerdoelen: [...f.querySelectorAll('input[name="ld"]:checked')].map((x) => x.value), organisatie: f.organisatie.value.trim(), coach: f.coach.value.trim(), anders: f.anders.value.trim() }); };
  CC.on('vormKopie', (el) => { const S = CC.S(); const v = vorm(S, el.dataset.id); if (!v) return; const c = JSON.parse(JSON.stringify(v)); c.id = nieuwId('v'); c.naam = `${v.naam} (kopie)`; c.gemaakt = new Date().toISOString(); vormen(S).push(c); CC.save(); CC.open('vorm', { id: c.id }); CC.toast('Kopie gemaakt'); });
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

  // Bij andere aantallen: per groepsgrootte een korte opzet
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
