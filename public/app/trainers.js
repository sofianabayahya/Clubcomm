// ClubComm — Besluit 99, deel 1: trainers begeleiden (HO).
// Tabblad Trainers (Traject · Alle trainers), trainersdossier, traject per trainer, kennismaking trainer (vragenlijst),
// VOG en diploma bij de coördinator (organisatie), printen. Begeleidingsmomenten (vijf fasen) volgen in deel 2.
(function () {
  const CC = window.CC; const D = CC.date, M = CC.m, h = CC.h, icon = CC.icon, esc = CC.esc;
  const dos = (S) => S.trainerDossier || (S.trainerDossier = {});
  const ken = (S) => S.trainerKennis || (S.trainerKennis = {});
  const adm = (S) => S.trainerAdmin || (S.trainerAdmin = {});
  const notities = (S) => S.trainerNotities || (S.trainerNotities = {});

  // ---------- Kennismaking trainer: de standaardvragen (de clubbeheerder kan ze aanpassen) ----------
  CC.VRAGEN_STD = [
    { k: 'geboortejaar', t: 'Geboortejaar', soort: 'jaar' },
    { k: 'sinds', t: 'Sinds welk jaar geef je training?', soort: 'jaar' },
    { k: 'ervaring', t: 'Welke leeftijden of teams heb je eerder getraind? Breedte of selectie?', soort: 'tekst' },
    { k: 'diploma', t: "Welke KNVB-diploma's of cursussen heb je?", soort: 'tekst' },
    { k: 'tijd', t: 'Hoeveel tijd heb je voor het trainerschap?', soort: 'keuze', opties: ['Alleen de trainingen en wedstrijden', 'Af en toe iets extra, zoals een bijeenkomst', 'Ruim tijd, ook voor scholing'] },
    { k: 'wisselend', t: 'Is je beschikbaarheid wisselend, bijvoorbeeld door studie, werk of gezin? Wil je er iets over vertellen?', soort: 'tekst', mag: true },
    { k: 'ambitie', t: 'Wat past het best bij jou?', soort: 'keuze', opties: ['Ik train vooral voor mijn plezier', 'Ik wil me verder ontwikkelen', 'Ik wil een opleiding volgen', 'Ik wil doorgroeien, bijvoorbeeld naar een selectie of oudere jeugd'] },
    { k: 'beter', t: 'Waar wil je beter in worden?', soort: 'tekst', mag: true },
    { k: 'nodig', t: 'Wat heb je van de club nodig?', soort: 'tekst', mag: true },
  ];
  CC.trainerVragen = (S, alle) => (Array.isArray(S.club.trainerVragen) && S.club.trainerVragen.length ? S.club.trainerVragen : CC.VRAGEN_STD).filter((v) => alle || !v.uit);

  const isTrainer = (p) => p && p.rollen.some((r) => r.rol === 'trainer');
  const teamsVan = (S, p) => p.rollen.filter((r) => r.rol === 'trainer').map((r) => M.team(S, r.teamId)).filter(Boolean);
  const trainersIn = (S, f) => S.people.filter((p) => p.rollen.some((r) => r.rol === 'trainer' && S.teams.some((t) => t.id === r.teamId && (!CC.hoFocus || CC.hoFocus.inFocus(S, f, t.id)))));
  const ambitie = (S, pid) => ((ken(S)[pid] || {}).a || {}).ambitie || '';
  const plezier = (S, pid) => /plezier/i.test(ambitie(S, pid));
  CC.trainerVolgt = (S, pid) => !!(dos(S)[pid] || {}).volg;
  const traject = (S, pid) => { const t = (dos(S)[pid] || {}).traject; return t && t.actief ? t : null; };
  // Begeleidingsmomenten komen in deel 2; tot dan telt de app er nul
  const gedaan = (S, pid, soort) => (S.begeleidMomenten || []).filter((m) => m.trainerId === pid && m.klaar && (!soort || m.soort === soort)).length;
  const planTekst = (t) => [t.plan.wedstrijd && `${t.plan.wedstrijd} ${t.plan.wedstrijd === 1 ? 'wedstrijd' : 'wedstrijden'}`, t.plan.training && `${t.plan.training} ${t.plan.training === 1 ? 'training' : 'trainingen'}`].filter(Boolean).join(' + ') || 'nog geen momenten gepland';
  const standTekst = (S, pid, t) => `${gedaan(S, pid)}/${(t.plan.wedstrijd || 0) + (t.plan.training || 0)} gedaan`;
  const kennisStatus = (S, pid) => { const k = ken(S)[pid] || {}; return k.ingevuld ? 'ingevuld' : k.gevraagd ? 'gevraagd' : ''; };
  // Extra regel in het rapport Trainers (hjohome.js)
  CC.trainerExtra = (S, tr) => { const t = traject(S, tr.id); const k = kennisStatus(S, tr.id);
    return `${t ? ` · traject ${standTekst(S, tr.id, t)}` : plezier(S, tr.id) ? ' · traint vooral voor het plezier' : ''}${!k ? ' · kennismaking nog niet gevraagd' : k === 'gevraagd' ? ' · kennismaking gevraagd' : ''}`; };

  // ---------- Tabbladen: de HO krijgt Trainers, Planning hoort bij de coördinator (Besluit 99) ----------
  const origTabs = CC.rollen.hjo.tabs;
  CC.rollen.hjo.tabs = (S) => { const t = origTabs(S); if ((CC.rol() || {}).rol !== 'hjo') return t;
    return t.map((x) => (x[0] === 'planning' ? ['trainers', 'Trainers', 'user-check'] : x)).sort((a, b) => ['home', 'trainers', 'teams', 'inzicht', 'berichten'].indexOf(a[0]) - ['home', 'trainers', 'teams', 'inzicht', 'berichten'].indexOf(b[0])); };
  // Planning blijft bereikbaar voor de HO als hij organisatiewerk doet (teams zonder coördinator): als knop bovenaan Teams
  const origTeams = CC.rollen.hjo.schermen.teams;
  CC.rollen.hjo.schermen.teams = (S) => { const html = origTeams(S); if ((CC.rol() || {}).rol !== 'hjo') return html;
    const terugval = S.teams.some((t) => !CC.coordinatorVoor || !CC.coordinatorVoor(S, t.id));
    return terugval ? `<div class="lijst compact">${h.rij({ ic: 'calendar-days', titel: 'Planning en rooster', sub: `Weekrooster, veldindeling, afgelasten (geen ${esc(S.club.labels.coordinator.toLowerCase())} voor ${S.teams.every((t) => !CC.coordinatorVoor || !CC.coordinatorVoor(S, t.id)) ? 'de club' : 'een deel van de teams'})`, act: 'tab', attrs: 'data-tab="planning"' })}</div>${html}` : html; };

  // ---------- Tabblad Trainers ----------
  CC.rollen.hjo.schermen.trainers = (S) => {
    const f = CC.hoFocus ? CC.hoFocus.focus(S) : 'alle'; const deel = h.segVal('trDeel', 'traject');
    const kop = `${CC.hoFocus ? CC.hoFocus.chips(S, f) : ''}${h.seg('trDeel', [['traject', 'Traject'], ['alle', 'Alle trainers']], 'traject')}`;
    const alle = trainersIn(S, f);
    if (deel === 'alle') {
      const zoek = (h.segVal('trZoek', '') || '').toLowerCase();
      const nGevraagd = alle.filter((p) => !kennisStatus(S, p.id)).length; const nIn = alle.filter((p) => kennisStatus(S, p.id) === 'ingevuld').length;
      const rapport = CC.views.trainersRapport(S, { alleenHtml: true, zoek }).html;
      return `${kop}<div class="zoek">${icon('search')}<input type="search" placeholder="Zoek trainer of team" value="${esc(h.segVal('trZoek', ''))}" data-input="zoekTrainer" aria-label="Zoek trainer of team"></div>
        <div class="kaartje"><p class="klein"><b>Kennismaking:</b> ${nIn} van ${alle.length} trainers ingevuld.</p>
          <div class="knoppen">${nGevraagd ? `<button class="knop licht klein" data-act="kennisUitnodigen">${icon('send')}Uitnodigen (${nGevraagd})</button>` : ''}<button class="knop licht klein" data-act="kennisPrintLeeg">${icon('printer')}Lege vragenlijst printen</button></div>
          <p class="zacht klein">Elke trainer krijgt één uitnodiging: "We willen je graag beter leren kennen." Geen herinneringen.</p></div>
        ${rapport}`;
    }
    const inTraject = alle.filter((p) => traject(S, p.id));
    const totaal = inTraject.reduce((n, p) => { const t = traject(S, p.id); return n + (t.plan.wedstrijd || 0) + (t.plan.training || 0); }, 0);
    const klaar = inTraject.reduce((n, p) => n + gedaan(S, p.id), 0);
    return `${kop}<div class="clubregel"><span><b>${inTraject.length}</b> in traject</span><span><b>${totaal}</b> momenten</span><span><b>${klaar}</b> gedaan</span></div>
      ${inTraject.length ? `<div class="lijst">${inTraject.map((p) => { const t = traject(S, p.id);
        return h.rij({ ic: CC.trainerVolgt(S, p.id) ? 'star' : 'user-check', titel: `${esc(p.naam)} · ${esc(teamsVan(S, p).map((x) => x.naam).join(', '))}`, sub: `${planTekst(t)} · ${standTekst(S, p.id, t)}${t.ontwikkelpunt ? ` · ontwikkelpunt: ${esc(t.ontwikkelpunt)}` : ''}`, act: 'open', attrs: `data-view="trainerDetail" data-id="${p.id}"` }); }).join('')}</div>`
        : h.leeg('Nog niemand in een traject', 'user-check')}
      <p class="zacht klein">Begeleiden is voor trainers die zich willen ontwikkelen. Zet iemand in een traject via <b>Alle trainers</b> → trainer → <b>Traject starten</b>. Trainers zonder traject geven geen signalen over begeleiding.</p>`;
  };
  CC.on('zoekTrainer', (el) => { CC.ui.seg.trZoek = el.value; const pos = el.selectionStart; CC.render(); const n = document.querySelector('[data-input="zoekTrainer"]'); if (n) { n.focus(); n.setSelectionRange(pos, pos); } });

  // ---------- Trainersdossier (vervangt de detailpagina van trainerafw.js; die blijft eronder als "Afmeldingen en contact") ----------
  const origDetail = CC.views.trainerDetail;
  CC.views.trainerDetail = (S, p) => {
    const tr = M.persoon(S, p.id); const basis = origDetail(S, p); const rol = (CC.rol() || {}).rol;
    if (rol !== 'hjo' && rol !== 'beheerder') return basis;
    const t = traject(S, tr.id); const a = adm(S)[tr.id] || {}; const k = ken(S)[tr.id] || {};
    const teams = teamsVan(S, tr); const bouw = teams.length && CC.bouwVan ? [...new Set(teams.map((x) => CC.bouwVan(S, x).naam))].join(', ') : '';
    const vog = a.vog ? (a.vog < D.vandaag() ? `<span class="chip rood mini">VOG verlopen ${D.kort(a.vog)}</span>` : a.vog < D.addDays(D.vandaag(), 60) ? `<span class="chip oranje mini">VOG tot ${D.kort(a.vog)}</span>` : `VOG tot ${D.kort(a.vog)}`) : 'VOG: onbekend';
    const vragen = CC.trainerVragen(S, true);
    const stap = (ok, half, tekst) => `<li class="${ok ? 'ok' : half ? 'half' : ''}">${icon(ok ? 'circle-check' : 'clock')}<span>${tekst}</span></li>`;
    const trajectBlok = t ? `<div class="kaartje">
        <p class="klein"><b>Plan:</b> ${planTekst(t)} · sinds ${D.kort(t.sinds)}</p>
        ${t.leerdoel ? `<p class="klein"><b>Leerdoel:</b> ${esc(t.leerdoel)}</p>` : ''}
        ${t.ontwikkelpunt ? `<p class="klein"><b>Ontwikkelpunt:</b> ${esc(t.ontwikkelpunt)}</p>` : ''}
        <ul class="stappenlijst">${stap(k.ingevuld || (S.trainerGesprekken || []).some((g) => g.trainerId === tr.id && g.soort === 'gesprek'), false, 'Kennismaking')}
          ${t.plan.training ? stap(gedaan(S, tr.id, 'training') >= t.plan.training, gedaan(S, tr.id, 'training') > 0, `Training ${gedaan(S, tr.id, 'training')} van ${t.plan.training}`) : ''}
          ${t.plan.wedstrijd ? stap(gedaan(S, tr.id, 'wedstrijd') >= t.plan.wedstrijd, gedaan(S, tr.id, 'wedstrijd') > 0, `Wedstrijd ${gedaan(S, tr.id, 'wedstrijd')} van ${t.plan.wedstrijd}`) : ''}</ul>
        ${CC.begelBlok ? CC.begelBlok(S, tr.id) : ''}
        <div class="knoppen"><button class="knop licht klein" data-act="trajectSheet" data-id="${tr.id}">${icon('pencil')}Traject aanpassen</button><button class="knop licht klein" data-act="trajectStop" data-id="${tr.id}">Traject afronden</button></div></div>`
      : `<div class="kaartje"><p class="klein">${plezier(S, tr.id) ? `${esc(tr.naam.split(' ')[0])} traint vooral voor het plezier (kennismaking). Dat is prima: geen traject, geen signalen.` : `${esc(tr.naam.split(' ')[0])} heeft geen traject. Begeleiden doe je als de trainer zich wil ontwikkelen.`}</p>
        <button class="knop ${plezier(S, tr.id) ? 'licht' : ''} klein" data-act="trajectSheet" data-id="${tr.id}">${icon('play')}Traject starten</button></div>`;
    const kennisBlok = k.ingevuld ? `<details class="uitklap"><summary><b>Kennismaking</b> <small class="zacht">ingevuld ${D.kort(k.ingevuld.slice(0, 10))}</small></summary>
        <dl class="antwoorden">${vragen.filter((v) => (k.a || {})[v.k]).map((v) => `<dt>${esc(v.t)}</dt><dd>${esc(k.a[v.k])}</dd>`).join('')}</dl></details>`
      : `<div class="kaartje"><p class="klein"><b>Kennismaking:</b> ${k.gevraagd ? `gevraagd op ${D.kort(k.gevraagd.slice(0, 10))}, nog niet ingevuld` : 'nog niet gevraagd'}.</p>${k.gevraagd ? '' : `<button class="knop licht klein" data-act="kennisUitnodigen" data-id="${tr.id}">${icon('send')}Uitnodigen</button>`}</div>`;
    return { titel: tr.naam, html: `
      <div class="knoppen"><button class="knop licht klein" data-act="trainerVolg" data-id="${tr.id}">${icon('star')}${CC.trainerVolgt(S, tr.id) ? 'Niet meer volgen' : 'Volgen'}</button><button class="knop licht klein" data-act="dossierPrint" data-id="${tr.id}">${icon('printer')}Printen</button></div>
      <p class="klein">${esc(teams.map((x) => x.naam).join(', ') || 'Geen team')}${bouw ? ` · ${esc(bouw)}` : ''}<br>KNVB: ${esc(a.diploma || ((k.a || {}).diploma ? `${k.a.diploma} (zelf opgegeven)` : 'onbekend'))} · ${vog}</p>
      ${h.sectie('Traject')}${trajectBlok}
      ${h.sectie('Kennismaking')}${kennisBlok}
      ${h.sectie('Afmeldingen en contact')}<details class="uitklap"><summary><b>Afmeldingen, geschiedenis en contact</b></summary>${basis.html}</details>
      ${rol === 'hjo' ? `${h.sectie('Notities (alleen jij)')}<form data-submit="hoNotitieOk" data-id="${tr.id}" class="codeform"><textarea name="n" rows="3" placeholder="Alleen voor jou als ${esc(S.club.labels.hjo)}; de trainer ziet dit niet.">${esc(notities(S)[tr.id] || '')}</textarea><button class="knop licht klein">Opslaan</button></form>` : ''}` };
  };
  CC.on('trainerVolg', (el) => { const S = CC.S(); const d = dos(S)[el.dataset.id] || (dos(S)[el.dataset.id] = {}); d.volg = !d.volg; CC.save(); CC.render(); CC.toast(d.volg ? 'Je volgt deze trainer' : 'Niet meer gevolgd'); });
  CC.on('hoNotitieOk', (f) => { const S = CC.S(); notities(S)[f.dataset.id] = f.n.value; CC.save(); CC.toast('Notitie opgeslagen'); });

  // Traject starten, aanpassen, afronden
  CC.on('trajectSheet', (el) => {
    const S = CC.S(); const tr = M.persoon(S, el.dataset.id); const t = traject(S, tr.id); const sel = (team) => (team || []).some((x) => (M.team(S, x.id) || {}).type === 'selectie');
    const std = t ? t.plan : sel(teamsVan(S, tr)) ? { wedstrijd: 2, training: 2 } : { wedstrijd: 1, training: 1 };
    const kies = (n, v) => `<select name="${n}">${[0, 1, 2, 3, 4].map((i) => `<option value="${i}" ${i === v ? 'selected' : ''}>${i}</option>`).join('')}</select>`;
    const k = (ken(S)[tr.id] || {}).a || {};
    CC.sheet(t ? 'Traject aanpassen' : 'Traject starten', `<form data-submit="trajectOk" data-id="${tr.id}" class="codeform">
      <p class="zacht klein">Een traject is voor ${esc(tr.naam.split(' ')[0])}${k.ambitie ? ` (kennismaking: "${esc(k.ambitie)}")` : ''}. Spreek het samen af.</p>
      <div class="twee"><div><label>Wedstrijden begeleiden</label>${kies('w', std.wedstrijd || 0)}</div><div><label>Trainingen begeleiden</label>${kies('t', std.training || 0)}</div></div>
      <label for="tj-l">Leerdoel voor dit seizoen (mag later)</label><textarea id="tj-l" name="l" rows="2" placeholder="${esc(k.beter || 'Bijv. spelers vaker zelf laten oplossen door vragen te stellen')}">${esc(t ? t.leerdoel || '' : k.beter || '')}</textarea>
      ${t ? `<label for="tj-o">Ontwikkelpunt nu</label><input id="tj-o" name="o" value="${esc(t.ontwikkelpunt || '')}">` : ''}
      <button class="knop">${t ? 'Opslaan' : 'Traject starten'}</button>
      <p class="zacht klein">Standaard: selectie 2 + 2, breedte 1 + 1. Het plan bepaalt de werkdruk en wanneer de app signaleert.</p></form>`);
  });
  CC.on('trajectOk', (f) => {
    const S = CC.S(); const d = dos(S)[f.dataset.id] || (dos(S)[f.dataset.id] = {}); const oud = d.traject && d.traject.actief ? d.traject : null;
    d.traject = { actief: true, sinds: oud ? oud.sinds : D.vandaag(), door: CC.me().id, plan: { wedstrijd: Number(f.w.value), training: Number(f.t.value) }, leerdoel: f.l.value.trim(), ontwikkelpunt: f.o ? f.o.value.trim() : (oud ? oud.ontwikkelpunt || '' : '') };
    CC.save(); CC.closeSheet(); CC.render(); CC.toast(oud ? 'Traject opgeslagen' : 'Traject gestart');
  });
  CC.on('trajectStop', (el) => { if (!confirm('Traject afronden? Het dossier blijft bewaard.')) return; const S = CC.S(); const d = dos(S)[el.dataset.id]; if (d && d.traject) { d.traject.actief = false; d.traject.afgerond = D.vandaag(); (d.oud || (d.oud = [])).push(d.traject); d.traject = null; } CC.save(); CC.render(); CC.toast('Traject afgerond'); });

  // ---------- Kennismaking: uitnodigen (één keer), invullen door de trainer, printen ----------
  CC.on('kennisUitnodigen', (el) => {
    const S = CC.S(); const me = CC.me(); const f = CC.hoFocus ? CC.hoFocus.focus(S) : 'alle';
    const wie = el.dataset.id ? [M.persoon(S, el.dataset.id)] : trainersIn(S, f).filter((p) => !kennisStatus(S, p.id) && p.id !== me.id);
    if (!wie.length) return CC.toast('Iedereen is al uitgenodigd');
    const nu = new Date().toISOString();
    wie.forEach((p, i) => { const k = ken(S)[p.id] || (ken(S)[p.id] = {}); k.gevraagd = nu;
      S.msgs.push({ id: 'b' + Date.now() + i, van: me.id, soort: 'persoonlijk', bereik: (p.rollen.find((r) => r.rol === 'trainer') || {}).teamId || '', onderwerp: 'Kennismaking: we willen je graag beter leren kennen',
        tekst: `Hoi ${p.naam.split(' ')[0]},\n\nWe willen je graag beter leren kennen, zodat we je als club goed kunnen ondersteunen. Wil je een korte vragenlijst invullen? Het kost een paar minuten. Je vindt hem op je Home in ClubComm.\n\nGroet, ${me.naam}`,
        tijd: nu, ontvangers: [p.id], gelezen: [], antw: [], urgent: false, gepland: null }); });
    CC.save(); CC.render(); CC.toast(wie.length === 1 ? `${wie[0].naam.split(' ')[0]} is uitgenodigd` : `${wie.length} trainers uitgenodigd`);
  });
  // Op de Home van de trainer: één regel tot hij het invult (of "Later": 30 dagen weg op deze telefoon)
  const LATER = 'cc-kennis-later';
  CC.trainerActiesExtra = (S) => [...kennisActie(S), ...(CC.begelActies ? CC.begelActies(S) : [])];
  const kennisActie = (S) => { const me = CC.me(); const k = ken(S)[me.id];
    if (!k || !k.gevraagd || k.ingevuld) return [];
    try { const l = Number(localStorage.getItem(LATER)); if (l && Date.now() - l < 30 * 864e5) return []; } catch (e) { /* */ }
    return [h.rij({ ic: 'user-check', titel: 'Kennismaking: we willen je graag beter leren kennen', sub: 'Een korte vragenlijst, een paar minuten', kleur: 'blauw', act: 'kennisForm' })]; };
  const veld = (v, w) => v.soort === 'keuze' ? `<fieldset class="vinkjes"><legend>${esc(v.t)}</legend>${v.opties.map((o) => `<label><input type="radio" name="${v.k}" value="${esc(o)}" ${w === o ? 'checked' : ''}> ${esc(o)}</label>`).join('')}</fieldset>`
    : v.soort === 'jaar' ? `<label for="kn-${v.k}">${esc(v.t)}</label><input id="kn-${v.k}" name="${v.k}" type="number" inputmode="numeric" min="1940" max="${new Date().getFullYear()}" value="${esc(w || '')}">`
    : `<label for="kn-${v.k}">${esc(v.t)}${v.mag ? ' <small class="zacht">(mag leeg)</small>' : ''}</label><textarea id="kn-${v.k}" name="${v.k}" rows="2">${esc(w || '')}</textarea>`;
  CC.on('kennisForm', () => {
    const S = CC.S(); const me = CC.me(); const a = ((ken(S)[me.id] || {}).a) || {};
    CC.sheet('Kennismaking', `<form data-submit="kennisOk" class="codeform"><p class="zacht">We willen je graag beter leren kennen, zodat we je als club goed kunnen ondersteunen. Alles mag kort. Alleen de ${esc(S.club.labels.hjo)} en jij zien je antwoorden.</p>
      ${CC.trainerVragen(S).map((v) => veld(v, a[v.k])).join('')}
      <button class="knop">Opslaan</button><button type="button" class="knop licht" data-act="kennisLater">Later</button></form>`, { groot: true });
  });
  CC.on('kennisLater', () => { try { localStorage.setItem(LATER, String(Date.now())); } catch (e) { /* */ } CC.closeSheet(); CC.render(); });
  CC.on('kennisOk', (f) => { const S = CC.S(); const me = CC.me(); const k = ken(S)[me.id] || (ken(S)[me.id] = {});
    k.a = Object.fromEntries(CC.trainerVragen(S).map((v) => [v.k, (f[v.k] && f[v.k].value != null ? f[v.k].value : '').trim()]));
    k.ingevuld = new Date().toISOString(); CC.save(); CC.closeSheet(); CC.render(); CC.toast('Dank je wel!'); });

  // ---------- Clubbeheerder: de vragen aanpassen (Regels) ----------
  const origRegels = CC.rollen.beheerder.schermen.regels;
  CC.rollen.beheerder.schermen.regels = (S) => origRegels(S) + `${h.sectie('Kennismaking trainer')}<form data-submit="vragenOk" class="kaartje codeform"><p class="zacht klein">De vragenlijst die trainers één keer invullen. Zet vragen uit of pas de tekst aan.</p>
    ${CC.trainerVragen(S, true).map((v, i) => `<label class="vink"><input type="checkbox" name="aan${i}" ${v.uit ? '' : 'checked'}> <input name="t${i}" value="${esc(v.t)}" aria-label="Vraag ${i + 1}" style="flex:1"></label>`).join('')}
    <label for="vr-nieuw">Eigen vraag erbij (mag leeg)</label><input id="vr-nieuw" name="nieuw" placeholder="Bijv. Welke positie speelde je zelf?">
    <div class="knoppen"><button class="knop">Opslaan</button><button type="button" class="knop licht" data-act="vragenStd">Terug naar de standaard</button><button type="button" class="knop licht" data-act="kennisPrintLeeg">${icon('printer')}Printen</button></div></form>`;
  CC.on('vragenOk', (f) => { const S = CC.S(); const lijst = CC.trainerVragen(S, true).map((v, i) => ({ ...v, t: f['t' + i].value.trim() || v.t, uit: !f['aan' + i].checked }));
    if (f.nieuw.value.trim()) lijst.push({ k: 'eigen' + Date.now(), t: f.nieuw.value.trim(), soort: 'tekst', mag: true });
    S.club.trainerVragen = lijst; CC.save(); CC.render(); CC.toast('Vragenlijst opgeslagen'); });
  CC.on('vragenStd', () => { const S = CC.S(); delete S.club.trainerVragen; CC.save(); CC.render(); CC.toast('Standaard teruggezet'); });

  // ---------- VOG en diploma: organisatie (coördinator; Besluit 99) ----------
  CC.on('trainerAdminSheet', (el) => { const S = CC.S(); const p = M.persoon(S, el.dataset.id); const a = adm(S)[p.id] || {};
    CC.sheet(`VOG en diploma · ${p.naam}`, `<form data-submit="trainerAdminOk" data-id="${p.id}" class="codeform">
      <label for="ta-v">VOG geldig tot</label><input id="ta-v" name="v" type="date" value="${esc(a.vog || '')}">
      <label for="ta-d">KNVB-diploma (zoals gecontroleerd)</label><input id="ta-d" name="d" value="${esc(a.diploma || '')}" placeholder="${esc(((ken(S)[p.id] || {}).a || {}).diploma || 'Bijv. UEFA C (Pupillentrainer)')}">
      <button class="knop">Opslaan</button><p class="zacht klein">Organisatie: de ${esc(S.club.labels.coordinator.toLowerCase())} houdt dit bij; de ${esc(S.club.labels.hjo)} ziet het in het dossier.</p></form>`); });
  CC.on('trainerAdminOk', (f) => { const S = CC.S(); adm(S)[f.dataset.id] = { vog: f.v.value, diploma: f.d.value.trim() }; CC.save(); CC.closeSheet(); CC.render(); CC.toast('Opgeslagen'); });
  // Knop in het personen-venster (Teams → Staf → naam), voor wie de staf regelt
  const origRollenP = CC.handlers && CC.handlers.rollenPersoon;
  document.addEventListener('click', (ev) => { const b = ev.target.closest('[data-act="rollenPersoon"]'); if (!b) return;
    setTimeout(() => { const S = CC.S(); const p = M.persoon(S, b.dataset.id); const body = document.querySelector('#sheet .sheet-body');
      if (!p || !body || !isTrainer(p) || !(CC.mag('staf') || (CC.rol() || {}).rol === 'beheerder') || body.querySelector('[data-act="trainerAdminSheet"]')) return;
      const a = adm(S)[p.id] || {}; body.insertAdjacentHTML('afterbegin', `<button class="knop licht klein" data-act="trainerAdminSheet" data-id="${p.id}">${icon('shield-check')}VOG en diploma${a.vog ? ` · VOG tot ${D.kort(a.vog)}` : ''}</button>`); }, 0); }, true);
  void origRollenP;
  // Signaal voor wie de organisatie doet: VOG verloopt binnen 2 maanden of is verlopen (niet: onbekend; geen overkill)
  CC.vogRijen = (S, teamIds) => { const l = S.people.filter((p) => p.rollen.some((r) => r.rol === 'trainer' && teamIds.includes(r.teamId))).filter((p) => { const v = (adm(S)[p.id] || {}).vog; return v && v < D.addDays(D.vandaag(), 60); });
    if (!l.length) return [];
    return [h.rij({ ic: 'shield-check', titel: l.length === 1 ? `VOG van ${esc(l[0].naam)} ${adm(S)[l[0].id].vog < D.vandaag() ? 'is verlopen' : 'verloopt binnenkort'}` : `${l.length} VOG's verlopen (binnenkort)`, sub: l.slice(0, 3).map((p) => `${esc(p.naam.split(' ')[0])} · ${D.kort(adm(S)[p.id].vog)}`).join(', '), kleur: 'oranje', act: 'trainerAdminSheet', attrs: `data-id="${l[0].id}"` })]; };

  // ---------- Printen: een los A4-blad (Besluit 99: alles moet ook op papier kunnen) ----------
  CC.printDoc = (titel, html) => {
    let vak = document.getElementById('printvak'); if (!vak) { vak = document.createElement('div'); vak.id = 'printvak'; document.body.appendChild(vak); }
    vak.innerHTML = `<h1>${esc(titel)}</h1>${html}<p class="pv-voet">ClubComm · ${esc(CC.S().club.naam || '')} · ${esc(new Date().toLocaleDateString('nl-NL'))}</p>`;
    const oud = document.title; document.title = titel; document.body.classList.add('print-doc');
    const klaar = () => { document.body.classList.remove('print-doc'); document.title = oud; window.removeEventListener('afterprint', klaar); };
    window.addEventListener('afterprint', klaar); window.print(); setTimeout(klaar, 1500);
  };
  const lijnen = (n) => Array.from({ length: n }, () => '<div class="pv-lijn"></div>').join('');
  CC.on('kennisPrintLeeg', () => { const S = CC.S();
    CC.printDoc('Kennismaking trainer', `<p>We willen je graag beter leren kennen, zodat we je als club goed kunnen ondersteunen. Alles mag kort.</p><p><b>Naam:</b></p>${lijnen(1)}
      ${CC.trainerVragen(S).map((v) => `<div class="pv-blok"><p><b>${esc(v.t)}</b></p>${v.soort === 'keuze' ? `<ul class="pv-keuze">${v.opties.map((o) => `<li>☐ ${esc(o)}</li>`).join('')}</ul>` : lijnen(v.soort === 'jaar' ? 1 : 2)}</div>`).join('')}`); });
  CC.on('dossierPrint', (el) => { const S = CC.S(); const tr = M.persoon(S, el.dataset.id); const t = traject(S, tr.id); const k = ken(S)[tr.id] || {}; const a = adm(S)[tr.id] || {}; const tl = CC.trainerTelling ? CC.trainerTelling(S, tr.id) : null;
    CC.printDoc(`Trainersdossier ${tr.naam}`, `<p>${esc(teamsVan(S, tr).map((x) => x.naam).join(', '))} · KNVB: ${esc(a.diploma || (k.a || {}).diploma || 'onbekend')} · VOG ${a.vog ? `tot ${D.kort(a.vog)}` : 'onbekend'}</p>
      <h2>Traject</h2>${t ? `<p>Plan: ${planTekst(t)} · ${standTekst(S, tr.id, t)}</p><p><b>Leerdoel:</b> ${esc(t.leerdoel || '')}</p>${lijnen(t.leerdoel ? 0 : 2)}<p><b>Ontwikkelpunt:</b> ${esc(t.ontwikkelpunt || '')}</p>${lijnen(t.ontwikkelpunt ? 0 : 2)}` : '<p>Geen traject.</p>'}
      <h2>Kennismaking</h2>${k.ingevuld ? `<dl>${CC.trainerVragen(S, true).filter((v) => (k.a || {})[v.k]).map((v) => `<dt>${esc(v.t)}</dt><dd>${esc(k.a[v.k])}</dd>`).join('')}</dl>` : '<p>Nog niet ingevuld.</p>'}
      ${tl ? `<h2>Afmeldingen dit seizoen</h2><p>${tl.afmeldingen}× afgemeld · ${tl.telaat}× te laat · ${tl.niet}× niet gekomen · ${tl.afgelast} afgelast</p>` : ''}
      <h2>Aantekeningen</h2>${lijnen(5)}`); });

  // ---------- De trainer zelf: Mijn ontwikkeling (Besluit 99 deel 3), in het profiel ----------
  // Alles uit zijn dossier behalve de notities van de HO; geen extra tabblad en geen melding (die staan al op zijn Home).
  const heeftOntw = (S, me) => isTrainer(me) && (traject(S, me.id) || (ken(S)[me.id] || {}).ingevuld || (CC.begelMijn && CC.begelMijn(S, me.id).length));
  CC.profielExtra = (S) => { const me = CC.me(); return heeftOntw(S, me) ? h.rij({ ic: 'graduation-cap', titel: 'Mijn ontwikkeling', sub: 'Je leerdoel, je begeleidingsmomenten en je reflecties', act: 'open', attrs: 'data-view="mijnOntw"' }) : ''; };
  CC.views.mijnOntw = (S) => { const me = CC.me(); const t = traject(S, me.id); const k = ken(S)[me.id] || {}; const l = CC.begelMijn ? CC.begelMijn(S, me.id) : [];
    return { titel: 'Mijn ontwikkeling', html: `
      ${t ? `<div class="kaartje"><p class="klein"><b>Begeleiding dit seizoen</b> · ${planTekst(t)} · ${standTekst(S, me.id, t)}</p>
        <p><b>Leerdoel:</b> ${esc(t.leerdoel || 'nog niet afgesproken')}</p>${t.ontwikkelpunt ? `<p><b>Ontwikkelpunt:</b> ${esc(t.ontwikkelpunt)}</p>` : ''}</div>`
        : `<p class="zacht klein">Je hebt geen begeleidingstraject. Wil je graag begeleid worden? Zeg het tegen de ${esc(S.club.labels.hjo)}.</p>`}
      ${l.length ? `${h.sectie('Begeleidingsmomenten')}<div class="lijst compact">${l.join('')}</div>` : ''}
      ${h.sectie('Kennismaking')}${k.ingevuld ? `<details class="uitklap"><summary>Mijn antwoorden (${D.kort(k.ingevuld.slice(0, 10))})</summary><dl class="antwoorden">${CC.trainerVragen(S, true).filter((v) => (k.a || {})[v.k]).map((v) => `<dt>${esc(v.t)}</dt><dd>${esc(k.a[v.k])}</dd>`).join('')}</dl></details>` : ''}
      ${h.rij({ ic: 'pencil', titel: k.ingevuld ? 'Antwoorden aanpassen' : 'Kennismaking invullen', act: 'kennisForm' })}
      <button class="knop licht klein" data-act="mijnOntwPrint">${icon('printer')}Printen</button>
      <p class="zacht klein">Alleen jij en de ${esc(S.club.labels.hjo)} zien dit. De persoonlijke notities van de ${esc(S.club.labels.hjo)} staan hier niet in.</p>` }; };
  CC.on('mijnOntwPrint', () => { const S = CC.S(); const me = CC.me(); const t = traject(S, me.id);
    CC.printDoc(`Mijn ontwikkeling · ${me.naam}`, `${t ? `<p>Plan: ${planTekst(t)} · ${standTekst(S, me.id, t)}</p><p><b>Leerdoel:</b> ${esc(t.leerdoel || '')}</p><p><b>Ontwikkelpunt:</b> ${esc(t.ontwikkelpunt || '')}</p>` : '<p>Geen traject.</p>'}
      ${CC.begelPrintMijn ? CC.begelPrintMijn(S, me.id) : ''}`); });

  // ---------- Demo: één trainer in traject, kennismakingen ----------
  const demo = (S) => {
    const p = (naam) => S.people.find((x) => x.naam === naam);
    const dennis = p('Dennis Peters'), samira = p('Samira Brouwer'), anouk = p('Anouk van Vliet');
    if (dennis) { ken(S)[dennis.id] = { gevraagd: D.addDays(D.vandaag(), -20) + 'T10:00:00.000Z', ingevuld: D.addDays(D.vandaag(), -18) + 'T19:00:00.000Z', a: { geboortejaar: '1998', sinds: '2023', ervaring: 'O8 en O9, breedte', diploma: 'Pupillentrainer (UEFA C) bezig', tijd: 'Af en toe iets extra, zoals een bijeenkomst', wisselend: '', ambitie: 'Ik wil me verder ontwikkelen', beter: 'Spelers zelf laten nadenken in plaats van alles voorzeggen', nodig: 'Iemand die meekijkt bij een training' } };
      dos(S)[dennis.id] = { volg: true, traject: { actief: true, sinds: D.addDays(D.vandaag(), -14), door: S.demo.peter, plan: { wedstrijd: 1, training: 1 }, leerdoel: 'Spelers vaker zelf laten oplossen door vragen te stellen', ontwikkelpunt: 'Eerst kijken, dan coachen' } };
      adm(S)[dennis.id] = { vog: D.addDays(D.vandaag(), 40), diploma: '' }; }
    if (samira) ken(S)[samira.id] = { gevraagd: D.addDays(D.vandaag(), -20) + 'T10:00:00.000Z', ingevuld: D.addDays(D.vandaag(), -19) + 'T20:00:00.000Z', a: { geboortejaar: '1979', sinds: '2015', ervaring: 'Al jaren onderbouw', diploma: '', tijd: 'Alleen de trainingen en wedstrijden', ambitie: 'Ik train vooral voor mijn plezier', beter: '', nodig: '' } };
    if (anouk) ken(S)[anouk.id] = { gevraagd: D.addDays(D.vandaag(), -5) + 'T10:00:00.000Z' };
    S.trainerDemo = true;
  };
  const orig = CC.generate;
  CC.generate = function () { const S = orig(); demo(S); return S; };
  const S0 = CC.S(); if (S0 && !S0.trainerDemo && S0.demo && S0.demo.peter) { demo(S0); CC.save(); }
})();
