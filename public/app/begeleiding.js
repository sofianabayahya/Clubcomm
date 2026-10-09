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
  const VRAGEN = (soort) => { const w = soort === 'wedstrijd' ? 'wedstrijd' : 'training'; return [
    ['beginsituatie', 'Hoe zou je de huidige situatie van je team omschrijven? Wat gaat goed, wat minder?'],
    ['doel', `Waar wil je deze ${w} vooral voor gebruiken? Wat wil je testen, verbeteren of terugzien?`],
    ['probleem', 'Welk voetbalprobleem staat centraal? Wat moeten spelers beter herkennen of uitvoeren? (wie, wat, waar, wanneer)'],
    ['gedrag', `Aan welk zichtbaar gedrag van spelers merk je dat het doel wordt bereikt? Noem 2 of 3 signalen.`],
    ['coachnu', 'Hoe kijk je naar je eigen coaching op dit moment? Wat gaat goed, wat vind je lastig?'],
    ['leerdoel', `Wat wil jij in deze ${w} persoonlijk oefenen in je handelen als trainer?`],
    ['letop', 'Waar wil je dat de HO op let? Wat wil je na afloop graag terughoren?'],
    ['feedback', `Wanneer werkt feedback voor jou het best: tijdens de ${w}, ${w === 'wedstrijd' ? 'in de rust' : 'tussen de vormen'}, of achteraf?`],
    ['succes', `Wanneer is deze ${w} voor jou geslaagd, los van de uitslag? Wat wil je meenemen naar de volgende keer?`],
  ]; };
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
    return `${l.length ? `<div class="lijst compact">${l.map((m) => h.rij({ ic: m.klaar ? 'circle-check' : m.soort === 'wedstrijd' ? 'trophy' : 'dumbbell', titel: esc(titelM(S, m)), sub: faseRegel(S, m), act: 'open', attrs: `data-view="begelMoment" data-id="${m.id}"` })).join('')}</div>` : ''}
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
  CC.on('begelNieuwOk', (f) => {
    const S = CC.S(); const tr = M.persoon(S, f.dataset.id); const a = f.a.value ? M.act(S, f.a.value) : null; const t = dosT(S, tr.id) || {};
    const m = { id: 'bm' + Date.now(), trainerId: tr.id, teamId: a ? a.teamId : (tr.rollen.find((r) => r.rol === 'trainer') || {}).teamId, actId: a ? a.id : null, soort: a ? (M.isWed(a) ? 'wedstrijd' : 'training') : f.s.value, datum: a ? a.datum : f.d.value, door: CC.me().id,
      voor: { thema: '', doel: '', leerdoel: t.leerdoel || '', hoDoel: '' }, plan: { leerdoel: '', focus: '', feedback: '' }, obs: { punten: {}, notities: {}, klok: null, turf: {} }, vakken: {}, klaar: false };
    mom(S).push(m); CC.save(); CC.closeSheet(); CC.open('begelMoment', { id: m.id });
  });

  // ---------- De pagina van het moment ----------
  const veldT = (naam, label, waarde, ph = '', rijen = 2) => `<label>${label}</label><textarea name="${naam}" rows="${rijen}" placeholder="${esc(ph)}">${esc(waarde || '')}</textarea>`;
  CC.views.begelMoment = (S, p) => {
    const m = vind(S, p.id); if (!m) return { titel: 'Begeleidingsmoment', html: h.leeg('Niet gevonden') };
    const tr = M.persoon(S, m.trainerId) || { naam: '' }; const z = zelf(S)[m.id] || {}; const F = fasen(S, m); const huidig = F.findIndex(([, ok]) => !ok);
    const blok = (i, inhoud) => { const [n, ok, half] = F[i]; return `<details class="uitklap" ${i === (laatst[m.id] ?? huidig) ? 'open' : ''}><summary>${icon(ok ? 'circle-check' : 'clock')}<b>${i + 1}. ${n}</b> <small class="zacht">${ok ? 'klaar' : half ? 'bezig' : ''}</small></summary>${inhoud}</details>`; };
    const vragen = VRAGEN(m.soort);
    return { titel: titelM(S, m), sub: tr.naam, html: `
      ${m.klaar ? '' : `<button class="knop vol" data-act="open" data-view="begelObs" data-id="${m.id}">${icon('list-checks')}Observeren</button>`}
      <div class="knoppen"><button class="knop licht klein" data-act="begelPrint" data-id="${m.id}" data-leeg="1">${icon('printer')}A4 leeg</button><button class="knop licht klein" data-act="begelPrint" data-id="${m.id}">${icon('printer')}A4 ingevuld</button><button class="knop licht klein" data-act="begelVragenPrint" data-id="${m.id}">${icon('printer')}Vragenlijst</button></div>
      ${blok(0, `<form data-submit="begelVoorOk" data-id="${m.id}" class="codeform">
        <label>Thema</label><input name="thema" value="${esc(m.voor.thema)}" placeholder="Bijv. opbouwen onder druk">
        ${veldT('doel', m.soort === 'wedstrijd' ? 'Wedstrijddoel en voetbalprobleem' : 'Trainingsdoel en voetbalprobleem', m.voor.doel, 'Wat moeten spelers leren?')}
        ${veldT('leerdoel', 'Persoonlijk leerdoel trainer', m.voor.leerdoel)}
        ${veldT('hoDoel', 'Mijn eigen doel als HO (mag leeg)', m.voor.hoDoel)}
        <button class="knop licht klein">Opslaan</button></form>`)}
      ${blok(1, `${z.ingevuld ? `<details class="uitklap stil" open><summary>Vragenlijst van ${esc(tr.naam.split(' ')[0])} (ingevuld ${D.kort(z.ingevuld.slice(0, 10))})</summary><dl class="antwoorden">${vragen.filter(([k]) => (z.v || {})[k]).map(([k, t]) => `<dt>${esc(t)}</dt><dd>${esc(z.v[k])}</dd>`).join('')}</dl></details>`
          : m.gevraagd ? `<p class="zacht klein">Vragenlijst gestuurd op ${D.kort(m.gevraagd.slice(0, 10))}; nog niet ingevuld.</p>` : `<button class="knop licht klein" data-act="begelVragen" data-id="${m.id}">${icon('send')}Vragenlijst sturen aan ${esc(tr.naam.split(' ')[0])}</button><p class="zacht klein">De trainer vult de vragen vooraf zelf in. Zo begint het gesprek bij de trainer.</p>`}
        <form data-submit="begelPlanOk" data-id="${m.id}" class="codeform"><p class="klein"><b>Afspraken uit het gesprek</b></p>
        ${veldT('leerdoel', 'Leerdoel', m.plan.leerdoel || (z.v || {}).leerdoel || m.voor.leerdoel)}
        ${veldT('focus', 'Focus van de HO tijdens de observatie', m.plan.focus || (z.v || {}).letop)}
        <label>Feedbackmoment</label><input name="feedback" value="${esc(m.plan.feedback || (z.v || {}).feedback || '')}" placeholder="${m.soort === 'wedstrijd' ? 'Bijv. kort in de rust, uitgebreid na afloop' : 'Bijv. tussen de vormen, uitgebreid na afloop'}">
        <button class="knop licht klein">Opslaan</button></form>`)}
      ${blok(2, `<p class="klein">${Object.keys(m.obs.punten).length} van ${CC.OBS[m.soort].reduce((n, o) => n + o.p.length, 0)} punten bekeken${m.obs.klok && m.obs.klok.totaal ? ` · effectieve voetbaltijd ${pct(m.obs.klok, 'spelen')}%` : ''}</p>${m.klaar ? `<button class="knop licht klein" data-act="open" data-view="begelObs" data-id="${m.id}">Observatie bekijken</button>` : '<p class="zacht klein">Tik bovenaan op Observeren, op het veld.</p>'}`)}
      ${blok(3, `<form data-submit="begelVakkenOk" data-id="${m.id}" class="codeform"><p class="zacht klein">Samen met de trainer. Laat de trainer eerst vertellen (eerste gevoel, leerdoel), geef daarna wat jij zag.</p>
        ${VAKKEN.map(([k, t, v]) => veldT(k, `${t}${k === 'ontwikkelpunt' ? ' (verplicht)' : ''}`, (m.vakken || {})[k], v)).join('')}
        <button class="knop licht klein">Opslaan</button></form>`)}
      ${blok(4, `${m.gedeeld ? `<p class="klein">Gedeeld met ${esc(tr.naam.split(' ')[0])} op ${D.kort(m.gedeeld.slice(0, 10))}.</p>` : `<button class="knop licht klein" data-act="begelDeel" data-id="${m.id}">${icon('send')}Delen met de trainer</button><p class="zacht klein">De trainer ziet het voorblok en de vier vakken (niet je notities) en vult een korte reflectie in.</p>`}
        ${z.reflectieOp ? `<dl class="antwoorden">${REFLECTIE.map(([k, t]) => `<dt>${esc(t)}</dt><dd>${esc((z.r || {})[k] || '')}</dd>`).join('')}</dl>` : m.gedeeld ? '<p class="zacht klein">Reflectie van de trainer: nog niet ingevuld.</p>' : ''}
        <form data-submit="begelKlaarOk" data-id="${m.id}" class="codeform">${veldT('hoVerslag', 'Mijn verslag (mag leeg)', m.hoVerslag)}
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
  CC.on('begelKlaarOk', (f) => { const S = CC.S(); const m = vind(S, f.dataset.id); laatst[m.id] = 4; m.hoVerslag = f.hoVerslag.value.trim();
    if (!m.klaar) { if (!(m.vakken || {}).ontwikkelpunt) return CC.toast('Rond eerst het reflectiegesprek af (ontwikkelpunt)', 'fout'); m.klaar = true; m.klaarOp = D.vandaag(); }
    bewaar(S, 'Begeleidingsmoment afgerond'); });
  // Persoonlijk bericht aan de trainer (één keer; daarna een regel op zijn Home tot het gedaan is)
  const bericht = (S, m, onderwerp, tekst) => { const me = CC.me(); S.msgs.push({ id: 'b' + Date.now(), van: me.id, soort: 'persoonlijk', bereik: m.teamId, onderwerp, tekst, tijd: new Date().toISOString(), ontvangers: [m.trainerId], gelezen: [], antw: [], urgent: false, gepland: null }); };
  CC.on('begelVragen', (el) => { const S = CC.S(); const m = vind(S, el.dataset.id); const tr = M.persoon(S, m.trainerId); laatst[m.id] = 1; m.gevraagd = new Date().toISOString();
    bericht(S, m, `Bereid je begeleidingsmoment voor (${D.kort(m.datum)})`, `Hoi ${tr.naam.split(' ')[0]},\n\nOp ${D.lang(m.datum)} kijk ik mee bij de ${m.soort}. Wil je vooraf een korte vragenlijst invullen? Dan begint ons gesprek bij jou. Je vindt hem op je Home in ClubComm.\n\nGroet, ${CC.me().naam}`);
    bewaar(S, `${tr.naam.split(' ')[0]} krijgt de vragenlijst`); });
  CC.on('begelDeel', (el) => { const S = CC.S(); const m = vind(S, el.dataset.id); const tr = M.persoon(S, m.trainerId); laatst[m.id] = 4; m.gedeeld = new Date().toISOString();
    bericht(S, m, `Je verslag staat klaar (${D.kort(m.datum)})`, `Hoi ${tr.naam.split(' ')[0]},\n\nHet verslag van ons begeleidingsmoment staat klaar in ClubComm. Wil je je reflectie invullen (3 korte vragen)?\n\nOntwikkelpunt: ${(m.vakken || {}).ontwikkelpunt || ''}\n\nGroet, ${CC.me().naam}`);
    bewaar(S, 'Gedeeld met de trainer'); });

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
      <div class="pv-vakken">${VAKKEN.map(([kk, t, q]) => `<div class="pv-vak"><b>${t}</b><small>${q}</small>${leeg || !(m.vakken || {})[kk] ? lijnen(2) : `<p>${esc(m.vakken[kk])}</p>`}</div>`).join('')}</div>`);
  });
  CC.on('begelVragenPrint', (el) => { const S = CC.S(); const m = vind(S, el.dataset.id); const z = zelf(S)[m.id] || {}; const tr = M.persoon(S, m.trainerId) || { naam: '' };
    CC.printDoc(`Voorbereiding begeleidingsmoment · ${tr.naam}`, `<p>${esc(m.soort === 'wedstrijd' ? 'Wedstrijd' : 'Training')} ${esc(D.lang(m.datum))} · ${esc(CC.tn(m.teamId))}</p>${VRAGEN(m.soort).map(([k, t]) => `<div class="pv-blok"><p><b>${esc(t)}</b></p>${(z.v || {})[k] ? `<p>${esc(z.v[k])}</p>` : lijnen(2)}</div>`).join('')}
      <h2>Afspraken</h2><p><b>Leerdoel:</b> ${esc((m.plan || {}).leerdoel || '')}</p>${(m.plan || {}).leerdoel ? '' : lijnen(1)}<p><b>Focus HO:</b> ${esc((m.plan || {}).focus || '')}</p>${(m.plan || {}).focus ? '' : lijnen(1)}<p><b>Feedbackmoment:</b> ${esc((m.plan || {}).feedback || '')}</p>${(m.plan || {}).feedback ? '' : lijnen(1)}`); });

  // ---------- De trainer: vragenlijst vooraf en reflectie achteraf (op zijn Home) ----------
  CC.begelActies = (S) => { const me = CC.me(); const uit = [];
    mom(S).filter((m) => m.trainerId === me.id).forEach((m) => { const z = zelf(S)[m.id] || {};
      if (m.gevraagd && !z.ingevuld && !m.klaar) uit.push(h.rij({ ic: 'list-checks', titel: `Bereid je begeleidingsmoment voor (${D.kort(m.datum)})`, sub: 'Een paar vragen vooraf, zodat het gesprek bij jou begint', kleur: 'blauw', act: 'begelZelf', attrs: `data-id="${m.id}"` }));
      if (m.gedeeld && !z.reflectieOp) uit.push(h.rij({ ic: 'message-circle', titel: `Je verslag staat klaar (${D.kort(m.datum)})`, sub: 'Lees het en vul je reflectie in (3 vragen)', kleur: 'blauw', act: 'open', attrs: `data-view="begelVerslag" data-id="${m.id}"` })); });
    return uit; };
  CC.on('begelZelf', (el) => { const S = CC.S(); const m = vind(S, el.dataset.id); const z = zelf(S)[m.id] || {};
    CC.sheet('Voorbereiding begeleidingsmoment', `<form data-submit="begelZelfOk" data-id="${m.id}" class="codeform"><p class="zacht">${m.soort === 'wedstrijd' ? 'Wedstrijd' : 'Training'} ${D.lang(m.datum)}. Alles mag kort.</p>
      ${VRAGEN(m.soort).map(([k, t]) => veldT(k, esc(t), (z.v || {})[k])).join('')}<button class="knop">Opslaan</button></form>`, { groot: true }); });
  CC.on('begelZelfOk', (f) => { const S = CC.S(); const m = vind(S, f.dataset.id); const z = zelf(S)[m.id] || (zelf(S)[m.id] = { trainerId: m.trainerId });
    z.v = Object.fromEntries(VRAGEN(m.soort).map(([k]) => [k, f[k].value.trim()])); z.ingevuld = new Date().toISOString(); CC.save(); CC.closeSheet(); CC.render(); CC.toast('Dank je wel! De HO ziet je antwoorden'); });
  CC.views.begelVerslag = (S, p) => { const m = vind(S, p.id); const z = zelf(S)[m.id] || {};
    return { titel: `Verslag ${titelM(S, m)}`, html: `<div class="kaartje klein"><b>Doel:</b> ${esc((m.voor || {}).doel || '—')}<br><b>Leerdoel:</b> ${esc((m.plan || {}).leerdoel || (m.voor || {}).leerdoel || '—')}</div>
      ${VAKKEN.map(([k, t]) => `${h.sectie(t)}<p>${esc((m.vakken || {})[k] || '—')}</p>`).join('')}
      ${h.sectie('Jouw reflectie')}<form data-submit="begelReflectieOk" data-id="${m.id}" class="codeform">${REFLECTIE.map(([k, t]) => veldT(k, esc(t), (z.r || {})[k])).join('')}<button class="knop">Opslaan</button></form>
      <button class="knop licht klein" data-act="begelPrint" data-id="${m.id}">${icon('printer')}Printen</button>` }; };
  CC.on('begelReflectieOk', (f) => { const S = CC.S(); const m = vind(S, f.dataset.id); const z = zelf(S)[m.id] || (zelf(S)[m.id] = { trainerId: m.trainerId });
    z.r = Object.fromEntries(REFLECTIE.map(([k]) => [k, f[k].value.trim()])); z.reflectieOp = new Date().toISOString(); CC.save(); CC.render(); CC.toast('Reflectie opgeslagen'); });

  // ---------- Mijn ontwikkeling (trainers.js): wat de trainer van zijn momenten ziet ----------
  // Alleen gedeelde verslagen en zijn eigen vragenlijsten; een moment dat de HO nog voorbereidt toont alleen de datum.
  const vanTrainer = (S, pid) => mom(S).filter((m) => m.trainerId === pid).sort((a, b) => b.datum.localeCompare(a.datum));
  CC.begelMijn = (S, pid) => vanTrainer(S, pid).map((m) => { const z = zelf(S)[m.id] || {};
    if (m.gedeeld) return h.rij({ ic: 'clipboard-check', titel: esc(titelM(S, m)), sub: z.reflectieOp ? `Ontwikkelpunt: ${esc((m.vakken || {}).ontwikkelpunt || '')}` : 'Verslag staat klaar · reflectie nog invullen', kleur: z.reflectieOp ? '' : 'blauw', act: 'open', attrs: `data-view="begelVerslag" data-id="${m.id}"` });
    if (m.gevraagd && !m.klaar) return h.rij({ ic: 'list-checks', titel: esc(titelM(S, m)), sub: z.ingevuld ? 'Vragenlijst ingevuld · tik om aan te passen' : 'Vragenlijst nog invullen', kleur: z.ingevuld ? '' : 'blauw', act: 'begelZelf', attrs: `data-id="${m.id}"` });
    return h.rij({ ic: 'calendar-days', titel: esc(titelM(S, m)), sub: m.klaar ? 'Afgerond' : 'Gepland', chevron: false }); });
  CC.begelPrintMijn = (S, pid) => vanTrainer(S, pid).filter((m) => m.gedeeld).map((m) => { const z = zelf(S)[m.id] || {};
    return `<h2>${esc(titelM(S, m))}</h2>${VAKKEN.map(([k, t]) => `<p><b>${t}:</b> ${esc((m.vakken || {})[k] || '')}</p>`).join('')}${z.reflectieOp ? REFLECTIE.map(([k, t]) => `<p><b>${esc(t)}</b><br>${esc((z.r || {})[k] || '')}</p>`).join('') : ''}`; }).join('');
  // Home van de HO, Deze week: de begeleidingsmomenten die gepland staan
  CC.begelWeek = (S) => { const tot = D.addDays(D.vandaag(), 7);
    return mom(S).filter((m) => !m.klaar && m.datum >= D.vandaag() && m.datum <= tot).sort((a, b) => a.datum.localeCompare(b.datum)).map((m) => { const tr = M.persoon(S, m.trainerId) || { naam: '' };
      const a = m.actId && M.act(S, m.actId);
      return h.rij({ ic: 'user-check', titel: `${D.relatief(m.datum)}: begeleiding ${esc(tr.naam)}`, sub: `${m.soort === 'wedstrijd' ? 'Wedstrijd' : 'Training'} ${esc(CC.tn(m.teamId))}${a ? ` · ${a.tijd}` : ''} · ${faseRegel(S, m)}`, act: 'open', attrs: `data-view="begelMoment" data-id="${m.id}"` }); }); };

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
