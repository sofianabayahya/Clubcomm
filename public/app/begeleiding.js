// ClubComm — Besluit 99, deel 2: het begeleidingsmoment (KNVB-begeleidingscyclus voetbalcoach).
// Vijf fasen: voorbereiding → planningsgesprek (de trainer vult de vragenlijst vooraf in) → praktijk (één A4-observatie:
// ✓ / ~ / –, leertijd-klok bij een training, turven bij een wedstrijd) → reflectiegesprek (vier vakken, één ontwikkelpunt)
// → nazorg (delen met de trainer, zijn reflectie, afronden). Alles ook leeg en ingevuld te printen.
(function () {
  const CC = window.CC; const D = CC.date, M = CC.m, h = CC.h, icon = CC.icon, esc = CC.esc;
  const mom = (S) => S.begeleidMomenten || (S.begeleidMomenten = []);
  const zelf = (S) => S.begeleidZelf || (S.begeleidZelf = {});
  const vind = (S, id) => mom(S).find((m) => m.id === id);
  const laatst = {}; // welke fase open blijft na opslaan
  // Eigen terugblik van de begeleider: apart bewaard (scope hoprive, per bouw), de trainer kan hem niet lezen
  const hoV = (S) => S.begelHoVerslag || (S.begelHoVerslag = {});
  const hoTekst = (S, m) => ((hoV(S)[m.id] || {}).tekst) || m.hoVerslag || '';
  const zetHoTekst = (S, m, tekst) => { const tr = M.persoon(S, m.trainerId); const teams = tr ? tr.rollen.filter((r) => r.rol === 'trainer').map((r) => M.team(S, r.teamId)).filter(Boolean) : [];
    hoV(S)[m.id] = { trainerId: m.trainerId, tekst, bouwen: [...new Set(teams.map((t) => CC.bouwVan(S, t).naam))] }; delete m.hoVerslag; };
  const dosT = (S, pid) => ((S.trainerDossier || {})[pid] || {}).traject;

  // ---------- Inhoud van het formulier ----------
  CC.OBS = {
    training: [
      { k: 'doel', t: '1. Trainingsdoel', p: ['Is duidelijk welk voetbalprobleem centraal staat?', 'Is duidelijk wat spelers moeten leren?'] },
      { k: 'org', t: '2. Organisatie', p: ['Staat de organisatie snel en duidelijk?', 'Zijn overgangen tussen vormen kort?', 'Zijn spelers veel aan het voetballen en weinig aan het wachten?'] },
      { k: 'creeren', t: '3. Leersituatie creëren', p: ['Komt het gekozen voetbalprobleem vaak genoeg terug?', 'Krijgen spelers voldoende herhalingen en keuzes?', 'Past de weerstand bij niveau en trainingsdoel?'] },
      { k: 'beinvloeden', t: '4. Leersituatie beïnvloeden', p: ['Observeert de trainer voordat hij ingrijpt?', 'Coacht hij gericht op het trainingsdoel?', 'Stelt hij vragen of geeft hij vooral oplossingen?', 'Past hij ruimte, aantallen of regels aan als dat nodig is?'] },
      { k: 'pedagogisch', t: '5. Pedagogisch handelen', p: ['Is er een veilig leerklimaat waarin fouten gemaakt mogen worden?', 'Krijgen spelers ruimte om zelf oplossingen te vinden?', 'Is de trainer duidelijk, rustig en positief?'] },
    ],
    wedstrijd: [
      { k: 'doel', t: '1. Wedstrijddoel', p: ['Is duidelijk welk voetbalprobleem centraal staat?', 'Weten spelers welk gedrag we willen zien?'] },
      { k: 'leersituatie', t: '2. Leersituatie in de wedstrijd', p: ['Komt het voetbalprobleem in de wedstrijd terug?', 'Zie je het gewenste spelersgedrag terug?'] },
      { k: 'coach', t: '3. Coachgedrag', p: ['Observeert de coach voordat hij ingrijpt?', 'Coacht hij gericht op het wedstrijddoel?', 'Stelt hij vragen of geeft hij vooral oplossingen?', 'Gebruikt hij de rust gericht (één of twee punten)?'] },
      { k: 'pedagogisch', t: '4. Pedagogisch handelen', p: ['Is er een veilig leerklimaat waarin fouten gemaakt mogen worden?', 'Krijgen spelers ruimte om zelf oplossingen te vinden?', 'Is de coach duidelijk, rustig en positief?'] },
    ],
  };
  const TEKEN = [['v', '✓', 'zichtbaar'], ['d', '~', 'deels zichtbaar'], ['n', '–', 'niet zichtbaar']];
  const TURF = ['Vraag', 'Directief', 'Correctie', 'Compliment'];
  const DELEN = [['h1', '1e helft'], ['rust', 'Rust'], ['h2', '2e helft']];
  const VAKKEN = [['sterk', 'Sterk zichtbaar', 'Wat deed de trainer goed?'], ['ontwikkelpunt', 'Belangrijkste ontwikkelpunt', 'Waar zit op dit moment de meeste winst?'], ['effect', 'Effect op spelers', 'Wat zag ik veranderen in spelersgedrag door het handelen van de trainer?'], ['afspraak', 'Afspraak volgende keer', 'Wat gaat de trainer concreet opnieuw proberen of anders doen?']];
  // Vragenlijst planningsgesprek (de trainer vult vooraf in), naar het voorgesprek van de HO-A
  // Besluit 100: kort (standaard, starters) of uitgebreid (ervaren of in opleiding); de sleutels leerdoel en letop zijn gelijk
  // Besluit 101: het voorgesprek is een voormeting (hoe denkt de trainer?), geen reflectie. Een training vraagt andere
  // vragen dan een wedstrijd: opbouw, organisatie en bijsturen. Het derde veld = het onderdeel van het A4 waar het bij hoort.
  const VRAGEN = (soort, niveau) => {
    if (soort === 'wedstrijd') return niveau === 'uitgebreid' ? [
      ['beginsituatie', 'Hoe zou je de huidige situatie van je team omschrijven? Wat gaat goed, wat minder?'],
      ['doel', 'Waar wil je deze wedstrijd vooral voor gebruiken? Wat wil je testen, verbeteren of terugzien?', 'Wedstrijddoel'],
      ['probleem', 'Welk voetbalprobleem staat centraal? Wat moeten spelers beter herkennen of uitvoeren? (wie, wat, waar, wanneer)', 'Wedstrijddoel'],
      ['gedrag', 'Aan welk zichtbaar gedrag van spelers merk je dat het doel wordt bereikt? Noem 2 of 3 signalen.', 'Leersituatie in de wedstrijd'],
      ['coachnu', 'Hoe kijk je naar je eigen coaching op dit moment? Wat gaat goed, wat vind je lastig?', 'Coachgedrag'],
      ['leerdoel', 'Wat wil jij in deze wedstrijd persoonlijk oefenen in je handelen als trainer?', 'Persoonlijk leerdoel'],
      ['letop', 'Waar wil je dat ik op let? Wat wil je na afloop graag van mij terughoren?', 'Focus'],
      ['feedback', 'Wanneer werkt feedback voor jou het best: tijdens de wedstrijd, in de rust, of achteraf?', 'Feedbackmoment'],
      ['succes', 'Wanneer is deze wedstrijd voor jou geslaagd, los van de uitslag?', 'Wedstrijddoel'],
    ] : [
      ['doel', 'Wat wil je dat je spelers deze wedstrijd laten zien of beter gaan doen?', 'Wedstrijddoel'],
      ['beginsituatie', 'Wat gaat goed bij je team, en wat vind je nog lastig?'],
      ['leerdoel', 'Waar wil je zelf beter in worden als trainer?', 'Persoonlijk leerdoel'],
      ['letop', 'Waar wil je dat ik op let? En hoor je het liefst in de rust of na afloop wat ik zag?', 'Focus'],
    ];
    return niveau === 'uitgebreid' ? [
      ['wedstrijdZag', 'Wat zag je in de laatste wedstrijd(en)? Welk voetbalprobleem kwam je tegen?', 'Trainingsdoel'],
      ['doel', 'Welk voetbalprobleem train je, en waarom nu?', 'Trainingsdoel'],
      ['probleem', 'Wat moeten spelers beter herkennen en doen? (wie, wat, waar, wanneer)', 'Trainingsdoel'],
      ['opbouw', 'Hoe heb je de training opgebouwd? Welke vormen, en hoe komt het voetbalprobleem steeds terug, met genoeg herhaling en weerstand?', 'Leersituatie creëren'],
      ['organisatie', 'Hoe zorg je dat spelers veel voetballen en weinig wachten? Hoe snel ga je van vorm naar vorm?', 'Organisatie'],
      ['bijsturen', 'Wanneer grijp je in, en hoe? Wat doe je als het te makkelijk of te moeilijk is?', 'Leersituatie beïnvloeden'],
      ['leerdoel', 'Wat wil jij in deze training oefenen in je handelen als trainer?', 'Persoonlijk leerdoel'],
      ['letop', 'Waar wil je dat ik op let, en wanneer hoor je het graag: tussen de vormen of na afloop?', 'Focus en feedback'],
    ] : [
      ['doel', 'Wat wil je dat je spelers vandaag leren?', 'Trainingsdoel'],
      ['opbouw', 'Hoe heb je de training opgebouwd? Welke oefeningen doe je?', 'Leersituatie creëren'],
      ['leerdoel', 'Waar wil je zelf beter in worden als trainer?', 'Persoonlijk leerdoel'],
      ['letop', 'Waar wil je dat ik op let?', 'Focus'],
    ];
  };
  const REFLECTIE = [['r1', 'Wat heb ik geleerd over mijn eigen coachgedrag?'], ['r2', 'Welk effect had mijn handelen op de spelers?'], ['r3', 'In welke situatie ga ik mijn ontwikkelpunt de volgende keer toepassen?']];

  // ---------- Fasen ----------
  const fasen = (S, m) => { const z = zelf(S)[m.id] || {};
    return [
      ['Voorbereiding', !!(m.voor && (m.voor.doel || m.voor.leerdoel)), false],
      ['Planningsgesprek', !!(m.plan && m.plan.leerdoel), !!(z.ingevuld || m.gevraagd)],
      ['Praktijk', !!(m.obs && (Object.keys(m.obs.punten || {}).length || (m.obs.klok && m.obs.klok.totaal))), false],
      ['Reflectiegesprek', !!(m.vakken && m.vakken.ontwikkelpunt), false],
      ['Nazorg', !!m.klaar, !!m.gedeeld],
    ]; };
  const faseRegel = (S, m) => fasen(S, m).map(([n, ok, half]) => `${ok ? '✓' : half ? '◐' : '○'} ${n}`).join(' · ');
  const titelM = (S, m) => `${m.soort === 'wedstrijd' ? 'Wedstrijd' : 'Training'} ${D.kort(m.datum)} · ${CC.tn(m.teamId)}`;

  // In het dossier (trainers.js roept dit aan)
  CC.begelBlok = (S, pid) => { const l = mom(S).filter((m) => m.trainerId === pid).sort((a, b) => b.datum.localeCompare(a.datum));
    return `${l.length ? `<div class="lijst compact">${l.map((m) => h.rij({ ic: m.klaar ? 'circle-check' : m.soort === 'wedstrijd' ? 'trophy' : 'dumbbell', kleur: m.klaar ? 'groen' : '', titel: esc(titelM(S, m)), sub: faseRegel(S, m), act: 'open', attrs: `data-view="begelMoment" data-id="${m.id}"` })).join('')}</div>` : ''}
      <button class="knop klein" data-act="begelNieuw" data-id="${pid}">${icon('plus')}Nieuw begeleidingsmoment</button>`; };

  // ---------- Nieuw moment ----------
  CC.on('begelNieuw', (el) => {
    const S = CC.S(); const tr = M.persoon(S, el.dataset.id); const teams = tr.rollen.filter((r) => r.rol === 'trainer').map((r) => r.teamId);
    const acts = S.acts.filter((a) => teams.includes(a.teamId) && !a.afgelast && (a.soort === 'training' || M.isWed(a)) && a.datum >= D.addDays(D.vandaag(), -7) && a.datum <= D.addDays(D.vandaag(), 42)).sort((a, b) => (a.datum + a.tijd).localeCompare(b.datum + b.tijd)).slice(0, 30);
    CC.sheet('Nieuw begeleidingsmoment', `<form data-submit="begelNieuwOk" data-id="${tr.id}" class="codeform">
      <label for="bn-a">Welke training of wedstrijd?</label><select id="bn-a" name="a">${acts.map((a) => `<option value="${a.id}">${D.kort(a.datum)} · ${a.tijd} · ${M.isWed(a) ? 'wedstrijd' : 'training'} · ${esc(CC.tn(a.teamId))}</option>`).join('')}<option value="">Een andere datum…</option></select>
      <div class="twee"><div><label for="bn-s">Soort</label><select id="bn-s" name="s"><option value="training">Training</option><option value="wedstrijd">Wedstrijd</option></select></div><div><label for="bn-d">Datum (bij een andere datum)</label><input id="bn-d" name="d" type="date" value="${D.vandaag()}"></div></div>
      <button class="knop">Aanmaken</button><p class="zacht klein">Daarna doorloop je de vijf fasen: voorbereiding, planningsgesprek, praktijk, reflectiegesprek en nazorg.</p></form>`);
  });
  // Een moment aanmaken (gekoppeld aan een training of wedstrijd, of aan een losse datum)
  const maakMoment = (S, tr, a, soort, datum) => { const t = dosT(S, tr.id) || {};
    const m = { id: 'bm' + Date.now(), trainerId: tr.id, teamId: a ? a.teamId : (tr.rollen.find((r) => r.rol === 'trainer') || {}).teamId, actId: a ? a.id : null, soort: a ? (M.isWed(a) ? 'wedstrijd' : 'training') : soort, datum: a ? a.datum : datum, door: CC.me().id,
      niveau: t.niveau || 'kort', voor: { thema: '', doel: '', leerdoel: t.leerdoel || '', hoDoel: '' }, plan: { leerdoel: '', focus: '', feedback: '' }, obs: { punten: {}, notities: {}, klok: null, turf: {} }, vakken: {}, klaar: false };
    mom(S).push(m); return m; };
  CC.on('begelNieuwOk', (f) => {
    const S = CC.S(); const tr = M.persoon(S, f.dataset.id); const a = f.a.value ? M.act(S, f.a.value) : null;
    const m = maakMoment(S, tr, a, f.s.value, f.d.value); CC.save(); CC.closeSheet(); CC.open('begelMoment', { id: m.id });
  });
  // Vanaf de kaart in Trainers → Traject: kies de training (of wedstrijd) waar je gaat kijken; de trainer krijgt meteen de vragenlijst
  CC.on('begelInplannen', (el) => { const S = CC.S(); const tr = M.persoon(S, el.dataset.id); const soort = el.dataset.soort; const teams = tr.rollen.filter((r) => r.rol === 'trainer').map((r) => r.teamId);
    const bezet = new Set(mom(S).map((m) => m.actId).filter(Boolean));
    const acts = S.acts.filter((a) => teams.includes(a.teamId) && !a.afgelast && !bezet.has(a.id) && (soort === 'wedstrijd' ? M.isWed(a) : a.soort === 'training') && a.datum >= D.vandaag() && a.datum <= D.addDays(D.vandaag(), 42)).sort((a, b) => (a.datum + a.tijd).localeCompare(b.datum + b.tijd));
    const t = dosT(S, tr.id) || {}; const voor = tr.naam.split(' ')[0];
    CC.sheet(`${soort === 'wedstrijd' ? 'Wedstrijd' : 'Training'} kiezen`, `<p class="zacht">Waar ga je kijken? ${esc(voor)} krijgt meteen de ${t.niveau === 'uitgebreid' ? 'uitgebreide' : 'korte'} vragenlijst om voor te bereiden.</p>
      ${acts.length ? `<div class="lijst">${acts.map((a) => h.rij({ ic: soort === 'wedstrijd' ? 'trophy' : 'dumbbell', titel: `${D.lang(a.datum)} · ${a.tijd}`, sub: esc([CC.tn(a.teamId), a.veld].filter(Boolean).join(' · ')), act: 'begelInplannenOk', attrs: `data-id="${tr.id}" data-a="${a.id}"` })).join('')}</div>` : `<p class="zacht klein">Er staan de komende 6 weken geen ${soort === 'wedstrijd' ? 'wedstrijden' : 'trainingen'} van het team in ClubComm. Kies hieronder een datum.</p>`}
      <form data-submit="begelInplannenOk" data-id="${tr.id}" data-soort="${soort}" class="codeform"><label for="bp-d">Andere datum</label><input id="bp-d" name="d" type="date" min="${D.vandaag()}" required><button class="knop licht">Plannen</button></form>`); });
  CC.on('begelInplannenOk', (el) => { const S = CC.S(); const tr = M.persoon(S, el.dataset.id); const a = el.dataset.a ? M.act(S, el.dataset.a) : null;
    const datum = a ? a.datum : el.d.value; if (!datum) return CC.toast('Kies een datum', 'fout');
    const m = maakMoment(S, tr, a, el.dataset.soort, datum); stuurVragen(S, m); CC.save(); CC.closeSheet(); CC.render();
    CC.toast(`Gepland: ${m.soort} ${D.kort(m.datum)}. ${tr.naam.split(' ')[0]} krijgt de vragenlijst`); });

  // ---------- De pagina van het moment ----------
  const veldT = (naam, label, waarde, ph = '', rijen = 2) => `<label>${label}</label><textarea name="${naam}" rows="${rijen}" placeholder="${esc(ph)}">${esc(waarde || '')}</textarea>`;
  CC.views.begelMoment = (S, p) => {
    const m = vind(S, p.id); if (!m) return { titel: 'Begeleidingsmoment', html: h.leeg('Niet gevonden') };
    const tr = M.persoon(S, m.trainerId) || { naam: '' }; const z = zelf(S)[m.id] || {}; const F = fasen(S, m); const huidig = F.findIndex(([, ok]) => !ok);
    const blok = (i, inhoud) => { const [n, ok, half] = F[i]; return `<details class="uitklap" ${i === (laatst[m.id] ?? huidig) ? 'open' : ''}><summary class="fase ${ok ? 'ok' : half ? 'half' : ''}">${icon(ok ? 'circle-check' : 'clock')}<b>${i + 1}. ${n}</b> <small>${ok ? 'klaar' : half ? 'bezig' : ''}</small></summary>${inhoud}</details>`; };
    const vragen = VRAGEN(m.soort, m.niveau);
    return { titel: titelM(S, m), sub: tr.naam, html: `
      ${m.klaar ? '' : `<button class="knop vol" data-act="open" data-view="begelObs" data-id="${m.id}">${icon('list-checks')}Observeren</button>`}
      <div class="knoppen"><button class="knop licht klein" data-act="begelPrint" data-id="${m.id}" data-leeg="1">${icon('printer')}A4 leeg</button><button class="knop licht klein" data-act="begelPrint" data-id="${m.id}">${icon('printer')}A4 ingevuld</button><button class="knop licht klein" data-act="begelVragenPrint" data-id="${m.id}">${icon('printer')}Vragenlijst</button></div>
      ${blok(0, `<form data-submit="begelVoorOk" data-id="${m.id}" class="codeform">
        <label>Thema</label><input name="thema" value="${esc(m.voor.thema)}" placeholder="Bijv. opbouwen onder druk">
        ${veldT('doel', m.soort === 'wedstrijd' ? 'Wedstrijddoel en voetbalprobleem' : 'Trainingsdoel en voetbalprobleem', m.voor.doel, 'Wat moeten spelers leren?')}
        ${veldT('leerdoel', 'Persoonlijk leerdoel trainer', m.voor.leerdoel)}
        ${veldT('hoDoel', 'Mijn eigen doel als HO (mag leeg)', m.voor.hoDoel)}
        <button class="knop licht klein">Opslaan</button></form>`)}
      ${blok(1, `${z.ingevuld ? `<details class="uitklap stil" open><summary>Vragenlijst van ${esc(tr.naam.split(' ')[0])} (ingevuld ${D.kort(z.ingevuld.slice(0, 10))})</summary><dl class="antwoorden">${vragen.filter(([k]) => (z.v || {})[k]).map(([k, t, o]) => `<dt>${o ? `<span class="chip mini">${esc(o)}</span> ` : ''}${esc(t)}</dt><dd>${esc(z.v[k])}</dd>`).join('')}</dl></details>`
          : m.gevraagd ? `<p class="zacht klein">Vragenlijst gestuurd op ${D.kort(m.gevraagd.slice(0, 10))}; nog niet ingevuld.</p>` : `<div class="chips">${[['kort', 'Kort (4 vragen)'], ['uitgebreid', 'Uitgebreid (9 vragen)']].map(([k, l]) => `<button class="chipknop ${(m.niveau || 'kort') === k ? 'aan' : ''}" data-act="begelNiveau" data-id="${m.id}" data-n="${k}">${l}</button>`).join('')}</div>
          <button class="knop licht klein" data-act="begelVragen" data-id="${m.id}">${icon('send')}Vragenlijst sturen aan ${esc(tr.naam.split(' ')[0])}</button><p class="zacht klein">De trainer vult de vragen vooraf zelf in. Zo begint het gesprek bij de trainer.</p>`}
        <form data-submit="begelPlanOk" data-id="${m.id}" class="codeform"><p class="klein"><b>Afspraken uit het gesprek</b></p>
        ${veldT('leerdoel', 'Leerdoel', m.plan.leerdoel || (z.v || {}).leerdoel || m.voor.leerdoel)}
        ${veldT('focus', 'Focus van de HO tijdens de observatie', m.plan.focus || (z.v || {}).letop)}
        <label>Feedbackmoment</label><input name="feedback" value="${esc(m.plan.feedback || (z.v || {}).feedback || '')}" placeholder="${m.soort === 'wedstrijd' ? 'Bijv. kort in de rust, uitgebreid na afloop' : 'Bijv. tussen de vormen, uitgebreid na afloop'}">
        <button class="knop licht klein">Opslaan</button></form>`)}
      ${blok(2, `<p class="klein">${Object.keys(m.obs.punten).length} van ${CC.OBS[m.soort].reduce((n, o) => n + o.p.length, 0)} punten bekeken${m.obs.klok && m.obs.klok.totaal ? ` · effectieve voetbaltijd ${pct(m.obs.klok, 'spelen')}%` : ''}</p>${m.klaar ? `<button class="knop licht klein" data-act="open" data-view="begelObs" data-id="${m.id}">Observatie bekijken</button>` : '<p class="zacht klein">Tik bovenaan op Observeren, op het veld.</p>'}${!m.klaar && evaluaties().length ? `<button class="knop licht klein" data-act="begelImport" data-id="${m.id}">${icon('clipboard-check')}Overnemen uit het evaluatieformulier</button>` : ''}`)}
      ${blok(3, `<form data-submit="begelVakkenOk" data-id="${m.id}" class="codeform"><p class="zacht klein">Samen met de trainer. Laat de trainer eerst vertellen (eerste gevoel, leerdoel), geef daarna wat jij zag.</p>
        ${VAKKEN.map(([k, t, v]) => veldT(k, `${t}${k === 'ontwikkelpunt' ? ' (verplicht)' : ''}`, (m.vakken || {})[k], v)).join('')}
        <button class="knop licht klein">Opslaan</button></form>`)}
      ${blok(4, `<p class="klein"><b>a. Reflectieverslag van ${esc(tr.naam.split(' ')[0])}</b></p>
        ${m.gedeeld ? `<p class="zacht klein">Gedeeld op ${D.kort(m.gedeeld.slice(0, 10))}.</p>` : `<p class="zacht klein">Na het delen ziet de trainer het voorblok, je observatie (✓ / ~ / – met je korte observaties) en de vier vakken. Daarna beantwoordt de trainer drie vragen:</p>`}
        <dl class="antwoorden">${REFLECTIE.map(([k, t]) => `<dt>${esc(t)}</dt><dd>${z.reflectieOp ? esc((z.r || {})[k] || '') : '<span class="zacht">nog niet ingevuld</span>'}</dd>`).join('')}</dl>
        <div class="knoppen">${m.gedeeld ? '' : `<button class="knop licht klein" data-act="begelDeel" data-id="${m.id}">${icon('send')}Delen met de trainer</button>`}<button class="knop licht klein" data-act="begelVoorbeeld" data-id="${m.id}">${icon('eye')}Bekijk wat de trainer ziet</button></div>
        <form data-submit="begelKlaarOk" data-id="${m.id}" class="codeform"><p class="klein"><b>b. Mijn eigen terugblik als begeleider</b></p>${veldT('hoVerslag', 'Hoe ging mijn begeleiding? (mag leeg)', hoTekst(S, m), 'Wat deed ik goed als begeleider, wat doe ik de volgende keer anders? Handig voor je HO-opleiding. Alleen jij en de begeleiders van deze bouw zien dit; de trainer niet.', 4)}
        ${m.klaar ? `<p class="klein">${icon('circle-check')} Afgerond.</p><button class="knop licht klein" type="button" data-act="begelNieuw" data-id="${m.trainerId}">${icon('plus')}Volgend moment plannen</button>` : '<button class="knop">Afronden</button>'}</form>`)}` };
  };
  const bewaar = (S, toast) => { CC.save(); CC.render(); CC.toast(toast || 'Opgeslagen'); };
  CC.on('begelVoorOk', (f) => { const S = CC.S(); const m = vind(S, f.dataset.id); laatst[m.id] = 0; m.voor = { thema: f.thema.value.trim(), doel: f.doel.value.trim(), leerdoel: f.leerdoel.value.trim(), hoDoel: f.hoDoel.value.trim() }; bewaar(S); });
  CC.on('begelPlanOk', (f) => { const S = CC.S(); const m = vind(S, f.dataset.id); laatst[m.id] = 1; m.plan = { leerdoel: f.leerdoel.value.trim(), focus: f.focus.value.trim(), feedback: f.feedback.value.trim() }; bewaar(S); });
  CC.on('begelVakkenOk', (f) => { const S = CC.S(); const m = vind(S, f.dataset.id);
    if (!f.ontwikkelpunt.value.trim()) return CC.toast('Vul één concreet ontwikkelpunt in', 'fout');
    laatst[m.id] = 3; m.vakken = Object.fromEntries(VAKKEN.map(([k]) => [k, f[k].value.trim()]));
    const d = (S.trainerDossier || (S.trainerDossier = {}))[m.trainerId] || (S.trainerDossier[m.trainerId] = {}); if (d.traject && d.traject.actief) d.traject.ontwikkelpunt = m.vakken.ontwikkelpunt;
    bewaar(S, 'Opgeslagen; het ontwikkelpunt staat in het dossier'); });
  CC.on('begelKlaarOk', (f) => { const S = CC.S(); const m = vind(S, f.dataset.id); laatst[m.id] = 4; zetHoTekst(S, m, f.hoVerslag.value.trim());
    if (!m.klaar) { if (!(m.vakken || {}).ontwikkelpunt) return CC.toast('Rond eerst het reflectiegesprek af (ontwikkelpunt)', 'fout'); m.klaar = true; m.klaarOp = D.vandaag(); }
    bewaar(S, 'Begeleidingsmoment afgerond'); });
  // Persoonlijk bericht aan de trainer (één keer; daarna een regel op zijn Home tot het gedaan is)
  const bericht = (S, m, onderwerp, tekst) => { const me = CC.me(); S.msgs.push({ id: 'b' + Date.now(), van: me.id, soort: 'persoonlijk', bereik: m.teamId, onderwerp, tekst, tijd: new Date().toISOString(), ontvangers: [m.trainerId], gelezen: [], antw: [], urgent: false, gepland: null }); };
  CC.on('begelNiveau', (el) => { const S = CC.S(); const m = vind(S, el.dataset.id); m.niveau = el.dataset.n; laatst[m.id] = 1; CC.save(); CC.render(); });
  // Typ je je terugblik en tik je daarna op een knop, dan blijft de tekst bewaard
  const bewaarTerugblik = (S, m) => { const t = document.querySelector('form[data-submit="begelKlaarOk"] textarea[name="hoVerslag"]'); if (t && t.value.trim() !== hoTekst(S, m)) zetHoTekst(S, m, t.value.trim()); };
  CC.on('begelVoorbeeld', (el) => { const S = CC.S(); const m = vind(S, el.dataset.id); bewaarTerugblik(S, m); laatst[m.id] = 4; CC.save(); CC.open('begelVerslag', { id: m.id, voorbeeld: '1' }); });
  const stuurVragen = (S, m) => { const tr = M.persoon(S, m.trainerId); const a = m.actId && M.act(S, m.actId); m.gevraagd = new Date().toISOString();
    bericht(S, m, `Bereid je begeleidingsmoment voor (${D.kort(m.datum)})`, `Hoi ${tr.naam.split(' ')[0]},\n\nOp ${D.lang(m.datum)}${a ? ` om ${a.tijd}` : ''} kom ik kijken bij de ${m.soort}. Wil je vooraf een korte vragenlijst invullen? Dan begint ons gesprek bij jou. Je vindt hem op je Home in ClubComm.\n\nGroet, ${CC.me().naam}`); };
  CC.on('begelVragen', (el) => { const S = CC.S(); const m = vind(S, el.dataset.id); const tr = M.persoon(S, m.trainerId); laatst[m.id] = 1; stuurVragen(S, m);
    bewaar(S, `${tr.naam.split(' ')[0]} krijgt de vragenlijst`); });
  // Eén herinnering, de dag ervoor vanaf 17:00, als de vragenlijst nog niet is ingevuld (ook vanaf de server; Besluit 77)
  CC.begelHerinnering = (S) => { let veranderd = false; const morgen = D.addDays(D.vandaag(), 1);
    if (new Date().getHours() < 17) return false;
    mom(S).forEach((m) => { const z = zelf(S)[m.id] || {};
      if (m.klaar || !m.gevraagd || z.ingevuld || m.herinnerd || m.datum !== morgen || Date.now() - new Date(m.gevraagd).getTime() < 12 * 3600e3) return;
      const tr = M.persoon(S, m.trainerId); if (!tr) return; const a = m.actId && M.act(S, m.actId);
      m.herinnerd = new Date().toISOString(); veranderd = true;
      S.msgs.push({ id: 'b' + Date.now() + Math.random().toString(36).slice(2, 6), van: 'systeem', soort: 'persoonlijk', bereik: m.teamId, onderwerp: `Herinnering: bereid je begeleidingsmoment voor (morgen)`,
        tekst: `Hoi ${tr.naam.split(' ')[0]},\n\nMorgen${a ? ` om ${a.tijd}` : ''} komt er iemand kijken bij je ${m.soort}. Je vragenlijst is nog niet ingevuld. Het kost een paar minuten; je vindt hem op je Home in ClubComm.`,
        tijd: new Date().toISOString(), ontvangers: [m.trainerId], gelezen: [], antw: [], urgent: false, gepland: null }); });
    return veranderd; };
  const origClub = CC.automaatClub;
  if (origClub) CC.automaatClub = (S) => { const a = origClub(S); const b = CC.begelHerinnering(S); return a || b; };
  CC.on('begelDeel', (el) => { const S = CC.S(); const m = vind(S, el.dataset.id); const tr = M.persoon(S, m.trainerId); laatst[m.id] = 4; bewaarTerugblik(S, m); m.gedeeld = new Date().toISOString();
    bericht(S, m, `Je verslag staat klaar (${D.kort(m.datum)})`, `Hoi ${tr.naam.split(' ')[0]},\n\nHet verslag van ons begeleidingsmoment staat klaar in ClubComm. Wil je je reflectie invullen (3 korte vragen)?\n\nOntwikkelpunt: ${(m.vakken || {}).ontwikkelpunt || ''}\n\nGroet, ${CC.me().naam}`);
    bewaar(S, 'Gedeeld met de trainer'); });

  // ---------- Besluit 100: een evaluatie van /evaluatie overnemen (staat op dit toestel, zelfde website) ----------
  const EVAL = 'clubcomm-evaluaties-v1';
  const evaluaties = () => { try { return ((JSON.parse(localStorage.getItem(EVAL)) || {}).lijst || []).filter((e) => e.coach || e.leerdoel || (e.notities || []).length); } catch (e) { return []; } };
  const GESPREK = [['s1', 'Eerste gevoel'], ['s2', 'Leerdoel'], ['s3', 'Effect op spelers'], ['s4', 'Voetbalinhoud'], ['s5', 'Feedback HO'], ['s6', 'Volgende stap']];
  CC.on('begelImport', (el) => { const l = evaluaties();
    CC.sheet('Overnemen uit het evaluatieformulier', `<p class="zacht">Deze evaluaties staan op dit toestel (ingevuld op /evaluatie). Kies de juiste.</p><div class="lijst">${l.map((e) => h.rij({ ic: 'clipboard-check', titel: esc(`${e.coach || 'Zonder naam'} · ${e.datum ? D.kort(e.datum) : ''}`), sub: esc(`${e.team || ''}${e.tegenstander ? ` tegen ${e.tegenstander}` : ''} · ${(e.notities || []).length} momenten`), act: 'begelImportOk', attrs: `data-id="${el.dataset.id}" data-e="${esc(e.id)}"` })).join('')}</div>
      <p class="zacht klein">Wat al is ingevuld in dit begeleidingsmoment blijft staan; lege velden worden aangevuld.</p>`); });
  CC.on('begelImportOk', (el) => { const S = CC.S(); const m = vind(S, el.dataset.id); const e = evaluaties().find((x) => x.id === el.dataset.e); if (!m || !e) return;
    const vul = (o, k, v) => { if (v && !o[k]) o[k] = v; };
    m.soort = 'wedstrijd'; if (e.datum) m.datum = e.datum; m.bron = 'evaluatie';
    vul(m.voor, 'doel', [e.voetbalprobleem, e.signalen && `Gewenst spelersgedrag: ${e.signalen}`].filter(Boolean).join('\n')); vul(m.voor, 'leerdoel', e.leerdoel); vul(m.voor, 'thema', e.tegenstander && `Tegen ${e.tegenstander}`);
    vul(m.plan, 'leerdoel', e.leerdoel); vul(m.plan, 'focus', e.focus); vul(m.plan, 'feedback', e.feedbackmoment);
    const turf = {}; (e.notities || []).forEach((x) => { if (!x.soort || !x.fase) return; const d = turf[x.fase] || (turf[x.fase] = {}); d[x.soort] = (d[x.soort] || 0) + 1; });
    if (!Object.keys(m.obs.turf || {}).length) m.obs.turf = turf;
    if (!(m.obs.momenten || []).length) m.obs.momenten = (e.notities || []).map((x) => ({ fase: x.fase, min: x.min || x.tijd || '', soort: x.soort || '', coach: x.coach != null ? x.coach : x.tekst || '', spelers: x.spelers || '' }));
    m.vakken = m.vakken || {}; vul(m.vakken, 'ontwikkelpunt', e.punt); vul(m.vakken, 'effect', e.s3); vul(m.vakken, 'afspraak', e.s6);
    if (!hoTekst(S, m)) zetHoTekst(S, m, `Aantekeningen gesprek\n\n${GESPREK.filter(([k]) => e[k]).map(([k, t]) => `${t}: ${e[k]}`).join('\n\n')}`);
    if (e.r1 || e.r2 || e.r3) { const z = zelf(S)[m.id] || (zelf(S)[m.id] = { trainerId: m.trainerId }); if (!z.reflectieOp) { z.r = { r1: e.r1 || '', r2: e.r2 || '', r3: e.r3 || '' }; z.reflectieOp = new Date().toISOString(); } }
    if (m.vakken.ontwikkelpunt) { const d = (S.trainerDossier || (S.trainerDossier = {}))[m.trainerId] || (S.trainerDossier[m.trainerId] = {}); if (d.traject && d.traject.actief && !d.traject.ontwikkelpunt) d.traject.ontwikkelpunt = m.vakken.ontwikkelpunt; }
    CC.save(); CC.closeSheet(); CC.render(); CC.toast('Overgenomen uit het evaluatieformulier'); });
  const momentenHtml = (m) => ((m.obs || {}).momenten || []).length ? `<ol class="momenten">${m.obs.momenten.map((x) => `<li><b>${esc((DELEN.find((d) => d[0] === x.fase) || [, ''])[1])}${x.min ? ` ${esc(String(x.min))}${/^\d+$/.test(String(x.min)) ? "'" : ''}` : ''}</b> ${x.soort ? `[${esc(x.soort)}] ` : ''}${esc(x.coach)}${x.spelers ? ` → ${esc(x.spelers)}` : ''}</li>`).join('')}</ol>` : '';

  // ---------- Praktijk: het A4 op de telefoon ----------
  const pct = (k, s) => (k && k.totaal ? Math.round((100 * (k[s] || 0)) / k.totaal) : 0);
  const mmss = (ms) => { const t = Math.round((ms || 0) / 1000); return `${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`; };
  const klokStand = (k) => { if (!k) return null; const x = { ...k }; if (k.huidig && k.sinds) { const d = Date.now() - k.sinds; x[k.huidig] = (x[k.huidig] || 0) + d; x.totaal = (x.totaal || 0) + d; if (k.huidig === 'uitleg') x.langsteUitleg = Math.max(x.langsteUitleg || 0, (k.uitlegNu || 0) + d); } return x; };
  CC.views.begelObs = (S, p) => {
    const m = vind(S, p.id); const z = zelf(S)[m.id] || {}; const k = klokStand(m.obs.klok);
    const klokHtml = m.soort === 'training' ? `<div class="kaartje klok" data-klok="${m.id}"><p class="klein"><b>Leertijd-klok</b> <small class="zacht">tik aan wat er nu gebeurt</small></p>
        <div class="klokknoppen">${[['spelen', 'Spelen'], ['uitleg', 'Uitleg'], ['wissel', 'Wisselen']].map(([s, l]) => `<button class="knop ${m.obs.klok && m.obs.klok.huidig === s ? '' : 'licht'}" data-act="klokTik" data-id="${m.id}" data-s="${s}">${l}</button>`).join('')}<button class="knop licht" data-act="klokTik" data-id="${m.id}" data-s="">Stop</button></div>
        <p class="klein" data-klokstand>${klokTekst(k)}</p></div>` : '';
    const voor = m.voor || {}; const plan = m.plan || {};
    return { titel: `Observatie · ${titelM(S, m)}`, html: `
      <div class="kaartje klein"><b>Doel:</b> ${esc(voor.doel || '—')}<br><b>Leerdoel trainer:</b> ${esc(plan.leerdoel || voor.leerdoel || '—')}${plan.focus ? `<br><b>Jouw focus:</b> ${esc(plan.focus)}` : ''}</div>
      ${klokHtml}
      <p class="zacht klein">✓ zichtbaar · ~ deels zichtbaar · – niet zichtbaar · leeg = niet op gelet</p>
      ${CC.OBS[m.soort].map((o) => `${h.sectie(o.t)}<div class="obslijst">${o.p.map((v, i) => { const sl = `${o.k}${i}`; const w = m.obs.punten[sl];
        return `<div class="obspunt"><p>${esc(v)}</p><div class="tekens">${TEKEN.map(([c, t, l]) => `<button class="${w === c ? 'aan' : ''}" data-act="obsTeken" data-id="${m.id}" data-sl="${sl}" data-c="${c}" aria-label="${l}">${t}</button>`).join('')}</div>
          <input data-input="obsNotitie" data-id="${m.id}" data-sl="${sl}" value="${esc(m.obs.notities[sl] || '')}" placeholder="Korte observatie" aria-label="Korte observatie"></div>`; }).join('')}</div>`).join('')}
      ${m.soort === 'wedstrijd' ? `${h.sectie('Turven: wat zegt de coach?')}<div class="turf">${DELEN.map(([d, l]) => `<div><b>${l}</b>${TURF.map((t) => `<button data-act="obsTurf" data-id="${m.id}" data-d="${d}" data-t="${t}">${t} <span>${((m.obs.turf || {})[d] || {})[t] || 0}</span></button>`).join('')}</div>`).join('')}</div>` : ''}
      ${momentenHtml(m) ? `${h.sectie('Momenten (evaluatieformulier)')}${momentenHtml(m)}` : ''}
      <p class="zacht klein">Alles wordt meteen bewaard. De vier vakken (sterk, ontwikkelpunt, effect, afspraak) vul je in het reflectiegesprek in.</p>` };
  };
  const klokTekst = (k) => (k && k.totaal ? `Voetballen ${mmss(k.spelen)} (${pct(k, 'spelen')}%) · uitleg ${mmss(k.uitleg)} · wisselen ${mmss(k.wissel)} · langste uitleg ${mmss(k.langsteUitleg)} · ${k.overgangen || 0} overgangen${k.overgangen ? `, gemiddeld ${mmss((k.wissel || 0) / k.overgangen)}` : ''}` : 'Nog niet gestart.');
  // Klok: elke tik sluit het vorige stuk af
  CC.on('klokTik', (el) => { const S = CC.S(); const m = vind(S, el.dataset.id); const k = m.obs.klok || (m.obs.klok = { spelen: 0, uitleg: 0, wissel: 0, totaal: 0, langsteUitleg: 0, overgangen: 0, huidig: '', sinds: 0, uitlegNu: 0 });
    const nu = Date.now(); if (k.huidig && k.sinds) { const d = nu - k.sinds; k[k.huidig] += d; k.totaal += d; if (k.huidig === 'uitleg') { k.uitlegNu += d; k.langsteUitleg = Math.max(k.langsteUitleg, k.uitlegNu); } }
    const nieuw = el.dataset.s; if (nieuw !== 'uitleg') k.uitlegNu = 0; if (nieuw === 'wissel' && k.huidig !== 'wissel') k.overgangen += 1;
    k.huidig = nieuw; k.sinds = nieuw ? nu : 0; CC.save(); CC.render(); });
  setInterval(() => { const e = document.querySelector('[data-klok] [data-klokstand]'); if (!e) return; const S = CC.S(); const m = vind(S, e.closest('[data-klok]').dataset.klok); if (m && m.obs.klok && m.obs.klok.huidig) e.textContent = klokTekst(klokStand(m.obs.klok)); }, 1000);
  CC.on('obsTeken', (el) => { const S = CC.S(); const m = vind(S, el.dataset.id); const p = m.obs.punten; if (p[el.dataset.sl] === el.dataset.c) delete p[el.dataset.sl]; else p[el.dataset.sl] = el.dataset.c; CC.save(); CC.render(); });
  CC.on('obsNotitie', (el) => { const S = CC.S(); const m = vind(S, el.dataset.id); m.obs.notities[el.dataset.sl] = el.value; CC.save(); });
  CC.on('obsTurf', (el) => { const S = CC.S(); const m = vind(S, el.dataset.id); const t = m.obs.turf || (m.obs.turf = {}); const d = t[el.dataset.d] || (t[el.dataset.d] = {}); d[el.dataset.t] = (d[el.dataset.t] || 0) + 1; CC.save(); CC.render(); });

  // ---------- Printen: het A4 (leeg of ingevuld) en de vragenlijst ----------
  const lijnen = (n) => Array.from({ length: n }, () => '<div class="pv-lijn"></div>').join('');
  CC.on('begelPrint', (el) => {
    const S = CC.S(); const m = vind(S, el.dataset.id); const leeg = !!el.dataset.leeg; const tr = M.persoon(S, m.trainerId) || { naam: '' }; const v = m.voor || {}; const pl = m.plan || {}; const k = klokStand(m.obs.klok);
    const w = (x) => (leeg ? '' : esc(x || ''));
    const teken = (sl) => { const c = leeg ? '' : m.obs.punten[sl]; return (TEKEN.find((t) => t[0] === c) || [])[1] || ''; };
    const tijd = m.soort === 'training' ? `<table class="pv-tijd"><tr><td>Training</td><td>${leeg || !k || !k.totaal ? '___' : Math.round(k.totaal / 60000)} min</td></tr><tr><td>Effectieve voetbaltijd</td><td>${leeg || !k || !k.totaal ? '___ min' : `${Math.round(k.spelen / 60000)} min (${pct(k, 'spelen')}%)`}</td></tr><tr><td>Langste uitleg</td><td>${leeg || !k ? '___' : mmss(k.langsteUitleg)} min</td></tr><tr><td>Gemiddelde overgang</td><td>${leeg || !k || !k.overgangen ? '___' : mmss(k.wissel / k.overgangen)} min</td></tr></table>` : '';
    CC.printDoc(`Observatie ${m.soort} · ${tr.naam}`, `<div class="pv-kop"><table class="pv-voor"><tr><td>Trainer</td><td>${esc(tr.naam)}</td></tr><tr><td>Team</td><td>${esc(CC.tn(m.teamId))}</td></tr><tr><td>Datum</td><td>${esc(D.lang(m.datum))}</td></tr><tr><td>Thema</td><td>${w(v.thema)}</td></tr><tr><td>${m.soort === 'wedstrijd' ? 'Wedstrijddoel' : 'Trainingsdoel'}</td><td>${w(v.doel)}</td></tr><tr><td>Persoonlijk leerdoel trainer</td><td>${esc(pl.leerdoel || v.leerdoel || '')}</td></tr></table>${tijd}</div>
      <p class="pv-uitleg">✓ zichtbaar · ~ deels zichtbaar · – niet zichtbaar · leeg = niet op gelet</p>
      <table class="pv-obs"><tr><th>Onderdeel</th><th>Observatiepunt</th><th>✓/~/–</th><th>Korte observatie</th></tr>
      ${CC.OBS[m.soort].map((o) => o.p.map((q, i) => `<tr>${i === 0 ? `<td rowspan="${o.p.length}"><b>${esc(o.t)}</b></td>` : ''}<td>${esc(q)}</td><td class="pv-c">${teken(`${o.k}${i}`)}</td><td>${w(m.obs.notities[`${o.k}${i}`])}</td></tr>`).join('')).join('')}</table>
      ${m.soort === 'wedstrijd' ? `<table class="pv-obs"><tr><th></th>${TURF.map((t) => `<th>${t}</th>`).join('')}</tr>${DELEN.map(([d, l]) => `<tr><td>${l}</td>${TURF.map((t) => `<td class="pv-c">${leeg ? '' : (((m.obs.turf || {})[d] || {})[t] || '')}</td>`).join('')}</tr>`).join('')}</table>` : ''}
      ${!leeg && momentenHtml(m) ? `<p class="pv-uitleg"><b>Momenten</b></p>${momentenHtml(m)}` : ''}
      <div class="pv-vakken">${VAKKEN.map(([kk, t, q]) => `<div class="pv-vak"><b>${t}</b><small>${q}</small>${leeg || !(m.vakken || {})[kk] ? lijnen(2) : `<p>${esc(m.vakken[kk])}</p>`}</div>`).join('')}</div>`);
  });
  CC.on('begelVragenPrint', (el) => { const S = CC.S(); const m = vind(S, el.dataset.id); const z = zelf(S)[m.id] || {}; const tr = M.persoon(S, m.trainerId) || { naam: '' };
    CC.printDoc(`Voorbereiding begeleidingsmoment · ${tr.naam}`, `<p>${esc(m.soort === 'wedstrijd' ? 'Wedstrijd' : 'Training')} ${esc(D.lang(m.datum))} · ${esc(CC.tn(m.teamId))}</p>${VRAGEN(m.soort, m.niveau).map(([k, t, o]) => `<div class="pv-blok"><p><b>${esc(t)}</b>${o ? ` <small>(${esc(o)})</small>` : ''}</p>${(z.v || {})[k] ? `<p>${esc(z.v[k])}</p>` : lijnen(2)}</div>`).join('')}
      <h2>Afspraken</h2><p><b>Leerdoel:</b> ${esc((m.plan || {}).leerdoel || '')}</p>${(m.plan || {}).leerdoel ? '' : lijnen(1)}<p><b>Focus HO:</b> ${esc((m.plan || {}).focus || '')}</p>${(m.plan || {}).focus ? '' : lijnen(1)}<p><b>Feedbackmoment:</b> ${esc((m.plan || {}).feedback || '')}</p>${(m.plan || {}).feedback ? '' : lijnen(1)}`); });

  // ---------- De trainer: vragenlijst vooraf en reflectie achteraf (op zijn Home) ----------
  CC.begelActies = (S) => { const me = CC.me(); const uit = [];
    mom(S).filter((m) => m.trainerId === me.id).forEach((m) => { const z = zelf(S)[m.id] || {};
      if (m.gevraagd && !z.ingevuld && !m.klaar) uit.push(h.rij({ ic: 'list-checks', titel: `Bereid je begeleidingsmoment voor (${D.kort(m.datum)})`, sub: 'Een paar vragen vooraf, zodat het gesprek bij jou begint', kleur: 'blauw', act: 'begelZelf', attrs: `data-id="${m.id}"` }));
      if (m.gedeeld && !z.reflectieOp) uit.push(h.rij({ ic: 'message-circle', titel: `Je verslag staat klaar (${D.kort(m.datum)})`, sub: 'Lees het en vul je reflectie in (3 vragen)', kleur: 'blauw', act: 'open', attrs: `data-view="begelVerslag" data-id="${m.id}"` })); });
    return uit; };
  CC.on('begelZelf', (el) => { const S = CC.S(); const m = vind(S, el.dataset.id); const z = zelf(S)[m.id] || {};
    CC.sheet('Voorbereiding begeleidingsmoment', `<form data-submit="begelZelfOk" data-id="${m.id}" class="codeform"><p class="zacht">${m.soort === 'wedstrijd' ? 'Wedstrijd' : 'Training'} ${D.lang(m.datum)}. Alles mag kort.</p>
      ${VRAGEN(m.soort, m.niveau).map(([k, t]) => veldT(k, esc(t), (z.v || {})[k])).join('')}<button class="knop">Opslaan</button></form>`, { groot: true }); });
  CC.on('begelZelfOk', (f) => { const S = CC.S(); const m = vind(S, f.dataset.id); const z = zelf(S)[m.id] || (zelf(S)[m.id] = { trainerId: m.trainerId });
    z.v = Object.fromEntries(VRAGEN(m.soort, m.niveau).map(([k]) => [k, f[k].value.trim()])); z.ingevuld = new Date().toISOString(); CC.save(); CC.closeSheet(); CC.render(); CC.toast('Dank je wel! De HO ziet je antwoorden'); });
  // Wat de trainer ziet: voorblok, observatie, vier vakken en zijn reflectie. De begeleider kan het vooraf bekijken (voorbeeld).
  const obsGezien = (m) => CC.OBS[m.soort].flatMap((o) => o.p.map((q, i) => [o, q, `${o.k}${i}`])).filter(([, , sl]) => m.obs.punten[sl] || m.obs.notities[sl]);
  CC.views.begelVerslag = (S, p) => { const m = vind(S, p.id); const z = zelf(S)[m.id] || {}; const vb = !!p.voorbeeld; const tr = M.persoon(S, m.trainerId) || { naam: '' };
    const obs = obsGezien(m);
    return { titel: vb ? `Zo ziet ${tr.naam.split(' ')[0]} het` : `Verslag ${titelM(S, m)}`, sub: vb ? titelM(S, m) : null, html: `${vb ? `<div class="info">${icon('eye')}<span>Voorbeeld: dit ziet de trainer${m.gedeeld ? '' : ' zodra je het deelt'}. Je eigen terugblik staat er niet bij.</span></div>` : ''}
      <div class="kaartje klein"><b>Doel:</b> ${esc((m.voor || {}).doel || '—')}<br><b>Leerdoel:</b> ${esc((m.plan || {}).leerdoel || (m.voor || {}).leerdoel || '—')}</div>
      ${obs.length ? `${h.sectie('Wat er gezien is')}<div class="lijst compact">${obs.map(([o, q, sl]) => h.rij({ ic: '', titel: `${(TEKEN.find((t) => t[0] === m.obs.punten[sl]) || [, ''])[1]} ${esc(q)}`, sub: esc(m.obs.notities[sl] || ''), chevron: false })).join('')}</div>` : ''}
      ${VAKKEN.map(([k, t]) => `${h.sectie(t)}<p>${esc((m.vakken || {})[k] || '—')}</p>`).join('')}
      ${h.sectie(vb ? 'Reflectie van de trainer' : 'Jouw reflectie')}${vb ? `<dl class="antwoorden">${REFLECTIE.map(([k, t]) => `<dt>${esc(t)}</dt><dd>${z.reflectieOp ? esc((z.r || {})[k] || '') : '<span class="zacht">nog niet ingevuld</span>'}</dd>`).join('')}</dl>` : `<form data-submit="begelReflectieOk" data-id="${m.id}" class="codeform">${REFLECTIE.map(([k, t]) => veldT(k, esc(t), (z.r || {})[k])).join('')}<button class="knop">Opslaan</button></form>`}
      <button class="knop licht klein" data-act="begelPrint" data-id="${m.id}">${icon('printer')}Printen</button>` }; };
  CC.on('begelReflectieOk', (f) => { const S = CC.S(); const m = vind(S, f.dataset.id); const z = zelf(S)[m.id] || (zelf(S)[m.id] = { trainerId: m.trainerId });
    z.r = Object.fromEntries(REFLECTIE.map(([k]) => [k, f[k].value.trim()])); z.reflectieOp = new Date().toISOString(); CC.save(); CC.render(); CC.toast('Reflectie opgeslagen'); });

  // ---------- Mijn ontwikkeling (trainers.js): wat de trainer van zijn momenten ziet ----------
  // Alleen gedeelde verslagen en zijn eigen vragenlijsten; een moment dat de HO nog voorbereidt toont alleen de datum.
  const vanTrainer = (S, pid) => mom(S).filter((m) => m.trainerId === pid).sort((a, b) => b.datum.localeCompare(a.datum));
  CC.begelMijn = (S, pid, opHome) => vanTrainer(S, pid).map((m) => { const z = zelf(S)[m.id] || {};
    // Op de Home staat een open taak al bij Actie nodig (één vaste plek); hier dan alleen de regel zonder knop
    if (opHome && ((m.gedeeld && !z.reflectieOp) || (m.gevraagd && !m.klaar && !z.ingevuld))) return h.rij({ ic: 'calendar-days', titel: esc(titelM(S, m)), sub: 'Staat bovenaan bij Actie nodig', chevron: false });
    if (m.gedeeld) return h.rij({ ic: 'clipboard-check', titel: esc(titelM(S, m)), sub: z.reflectieOp ? `Ontwikkelpunt: ${esc((m.vakken || {}).ontwikkelpunt || '')}` : 'Verslag staat klaar · reflectie nog invullen', kleur: z.reflectieOp ? '' : 'blauw', act: 'open', attrs: `data-view="begelVerslag" data-id="${m.id}"` });
    if (m.gevraagd && !m.klaar) return h.rij({ ic: 'list-checks', titel: esc(titelM(S, m)), sub: z.ingevuld ? 'Vragenlijst ingevuld · tik om aan te passen' : 'Vragenlijst nog invullen', kleur: z.ingevuld ? '' : 'blauw', act: 'begelZelf', attrs: `data-id="${m.id}"` });
    return h.rij({ ic: 'calendar-days', titel: esc(titelM(S, m)), sub: m.klaar ? 'Afgerond' : 'Gepland', chevron: false }); });
  CC.begelPrintMijn = (S, pid) => vanTrainer(S, pid).filter((m) => m.gedeeld).map((m) => { const z = zelf(S)[m.id] || {};
    return `<h2>${esc(titelM(S, m))}</h2>${VAKKEN.map(([k, t]) => `<p><b>${t}:</b> ${esc((m.vakken || {})[k] || '')}</p>`).join('')}${z.reflectieOp ? REFLECTIE.map(([k, t]) => `<p><b>${esc(t)}</b><br>${esc((z.r || {})[k] || '')}</p>`).join('') : ''}`; }).join('');
  // Home van de HO, Deze week: de begeleidingsmomenten die gepland staan
  CC.begelWeek = (S) => { const tot = D.addDays(D.vandaag(), 7);
    return mom(S).filter((m) => !m.klaar && m.datum >= D.vandaag() && m.datum <= tot).sort((a, b) => a.datum.localeCompare(b.datum)).map((m) => { const tr = M.persoon(S, m.trainerId) || { naam: '' };
      const a = m.actId && M.act(S, m.actId);
      return h.rij({ ic: 'user-check', titel: `${D.relatief(m.datum)}: begeleiding ${esc(tr.naam)}`, sub: `${m.soort === 'wedstrijd' ? 'Wedstrijd' : 'Training'} ${esc(CC.tn(m.teamId))}${a ? ` · ${a.tijd}` : ''} · ${fasen(S, m)[0][1] ? faseRegel(S, m) : 'voorbereiding nog invullen'}`, kleur: fasen(S, m)[0][1] ? '' : 'blauw', act: 'open', attrs: `data-view="begelMoment" data-id="${m.id}"` }); }); };

  // ---------- Demo: Dennis heeft één afgerond trainingsmoment en een geplande wedstrijd ----------
  const demo = (S) => { const d = S.people.find((x) => x.naam === 'Dennis Peters'); if (!d) return; const team = (d.rollen.find((r) => r.rol === 'trainer') || {}).teamId;
    mom(S).push({ id: 'bm-demo1', trainerId: d.id, teamId: team, actId: null, soort: 'training', datum: D.addDays(D.vandaag(), -9), door: S.demo.peter, klaar: true, klaarOp: D.addDays(D.vandaag(), -8), gedeeld: D.addDays(D.vandaag(), -8) + 'T20:00:00.000Z',
      voor: { thema: 'Aannemen en meenemen', doel: 'Spelers nemen de bal aan in de looprichting, weg van de druk', leerdoel: 'Spelers vaker zelf laten oplossen door vragen te stellen', hoDoel: '' },
      plan: { leerdoel: 'Vragen stellen in plaats van voorzeggen', focus: 'Wanneer stelt hij een vraag, en wat doen de spelers daarna?', feedback: 'Na afloop' },
      obs: { punten: { doel0: 'v', doel1: 'd', org0: 'v', org1: 'n', org2: 'd', creeren0: 'v', beinvloeden2: 'd', pedagogisch0: 'v' }, notities: { org1: 'Drie overgangen samen bijna 10 minuten', beinvloeden2: 'Eerste helft vooral oplossingen, daarna 4 vragen' }, klok: { spelen: 2760000, uitleg: 900000, wissel: 840000, totaal: 4500000, langsteUitleg: 230000, overgangen: 3, huidig: '', sinds: 0, uitlegNu: 0 }, turf: {} },
      vakken: { sterk: 'Rustige, positieve toon; spelers durven fouten te maken', ontwikkelpunt: 'Eerst kijken, dan coachen', effect: 'Na zijn vragen keken spelers vaker over hun schouder', afspraak: 'Bij elke vorm eerst 2 minuten alleen observeren' } });
    mom(S).push({ id: 'bm-demo2', trainerId: d.id, teamId: team, actId: null, soort: 'wedstrijd', datum: D.addDays(D.vandaag(), 8), door: S.demo.peter, klaar: false, gevraagd: D.addDays(D.vandaag(), -1) + 'T18:00:00.000Z',
      voor: { thema: 'Opbouwen onder druk', doel: 'Kort opbouwen als er een vrije man is', leerdoel: 'Eerst kijken, dan coachen', hoDoel: '' }, plan: {}, obs: { punten: {}, notities: {}, klok: null, turf: {} }, vakken: {} });
    zelf(S)['bm-demo1'] = { trainerId: d.id, reflectieOp: D.addDays(D.vandaag(), -7) + 'T21:00:00.000Z', r: { r1: 'Ik geef snel de oplossing; als ik wacht, vinden ze hem vaak zelf', r2: 'Na mijn vragen keken ze vaker om zich heen', r3: 'In de partijvorm aan het eind, eerst twee minuten alleen kijken' } };
    S.begelDemo = true; };
  const orig = CC.generate;
  CC.generate = function () { const S = orig(); demo(S); return S; };
  const S0 = CC.S(); if (S0 && !S0.begelDemo && S0.demo && S0.demo.peter) { demo(S0); CC.save(); }
})();
