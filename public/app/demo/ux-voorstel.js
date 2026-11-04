// ClubComm — DEMO (simulatie), branch demo/swift-trainer. ONTWERPVOORSTEL voor de trainer (4-11-2026), om te vergelijken met
// het huidige scherm: schakel in de oranje balk tussen "Huidig" en "Voorstel". Niet in de echte app; geen besluit.
// - Home van de trainer: Nu te doen (alleen als er iets openstaat) · Mijn volgende training · Mijn ontwikkeling (ontwikkelpunt eerst).
// - Verslag: eerst Mijn eigen reflectie (3 vragen, zonder voorbeeldantwoorden), daarna pas Feedback van je begeleider en
//   Samen afgesproken; de volledige observatie als verdieping. Afzender alleen uit opgeslagen gegevens.
// - Opslag (CONCEPT, apart technisch besluit nodig): nieuwe vragen onder eigen sleutels (g1–g3, vragenVersie 2), zodat oude
//   antwoorden (r1–r3) bij hun eigen vragen blijven staan. Openen schrijft niets; bewaren pas bij typen; Klaar = vastgelegd.
(function () {
  const CC = window.CC; const h = CC.h, esc = CC.esc, icon = CC.icon, D = CC.date, M = CC.m;
  const KEY = 'demo-ux';
  const voorstel = () => { try { return localStorage.getItem(KEY) === 'voorstel'; } catch (e) { return false; } };
  window.DEMO_UX = { voorstel, zet: (v) => { try { localStorage.setItem(KEY, v); } catch (e) { /* */ } CC.render(); } };
  const zelf = (S) => S.begeleidZelf || (S.begeleidZelf = {});
  const vind = (S, id) => (S.begeleidMomenten || []).find((m) => m.id === id);
  const OUD = [['r1', 'Wat heb ik geleerd over mijn eigen coachgedrag?'], ['r2', 'Welk effect had mijn handelen op de spelers?'], ['r3', 'In welke situatie ga ik mijn ontwikkelpunt de volgende keer toepassen?']];
  const NIEUW = [['g1', 'Wat ging volgens jou goed?'], ['g2', 'Wat lukte nog niet zoals bedoeld?'], ['g3', 'Wat ga je de volgende keer anders doen?']];
  const TEKEN = { v: '✓ zichtbaar', d: '~ deels zichtbaar', n: '– niet zichtbaar' };
  const persoonNaam = (S, id) => { const p = id && M.persoon(S, id); return p ? p.naam : ''; };
  const datum = (iso) => (iso ? D.kort(String(iso).slice(0, 10)) : '');
  const titelM = (S, m) => `${m.soort === 'wedstrijd' ? 'Wedstrijd' : 'Training'} ${D.kort(m.datum)} · ${CC.tn(m.teamId)}`;

  // ---------- Verslag ----------
  const blok = (titel, tag, inhoud, extra = '') => `<section class="ux-blok"${extra}><h2 class="ux-h">${titel}</h2>${tag ? `<p class="ux-tag">${tag}</p>` : ''}${inhoud}</section>`;
  const regel = (ic, kop, tekst) => (tekst ? `<div class="ux-r">${icon(ic)}<div><b>${kop}</b><span>${esc(tekst)}</span></div></div>` : '');
  const reflectieForm = (S, m, z) => { const a = z.g || {}; const n = NIEUW.filter(([k]) => (a[k] || '').trim()).length;
    return `<form data-submit="uxReflectieOk" data-autosave="uxReflectie" data-id="${esc(m.id)}" class="ux-form">
      <p class="ux-tag"><span class="ux-status" data-ux-teller>${n} van 3 ingevuld</span> · alleen jij en je begeleider zien dit · er zijn geen goede of foute antwoorden</p>
      ${NIEUW.map(([k, t], i) => `<label class="ux-q" for="ux-${k}"><span>${i + 1}. ${esc(t)}</span><span class="ux-chip ${(a[k] || '').trim() ? 'ok' : ''}" data-ux-chip="${k}">${(a[k] || '').trim() ? '✓ bewaard' : 'open'}</span></label>
        <textarea id="ux-${k}" name="${k}" rows="2" class="ux-ta" data-ux-groei>${esc(a[k] || '')}</textarea>`).join('')}
      <p class="ux-tag" data-ux-bewaard>${z.gBewaard ? `Concept bewaard om ${new Date(z.gBewaard).toTimeString().slice(0, 5)}` : 'Wordt bewaard terwijl je typt'}</p>
      <button class="knop vol">Reflectie vastleggen</button></form>`; };
  const eigenReflectieGelezen = (z) => { const oud = !z.g && z.r; const vr = oud ? OUD : NIEUW; const a = (oud ? z.r : z.g) || {};
    return `<dl class="ux-dl">${vr.map(([k, t]) => `<dt>${esc(t)}</dt><dd>${esc(a[k] || '—')}</dd>`).join('')}</dl>${oud ? '<p class="ux-tag">Ingevuld met de vragen van toen.</p>' : ''}`; };
  const volledigeObs = (m) => { const l = (CC.OBS[m.soort] || []).flatMap((o) => o.p.map((q, i) => [o, q, `${o.k}${i}`])).filter(([, , sl]) => (m.obs || {}).punten && (m.obs.punten[sl] || (m.obs.notities || {})[sl]));
    if (!l.length) return '';
    return `<details class="ux-meer"><summary>Bekijk de volledige observatie</summary><ul class="ux-obs">${l.map(([o, q, sl]) => `<li><span class="ux-z">${esc(o.t)}</span><br>${esc(q)} <b>${TEKEN[m.obs.punten[sl]] || ''}</b>${m.obs.notities[sl] ? `<br><span class="ux-z">${esc(m.obs.notities[sl])}</span>` : ''}</li>`).join('')}</ul></details>`; };
  const verslag = (S, m) => { const z = zelf(S)[m.id] || {}; const vast = !!z.reflectieOp; const v = m.vakken || {}; const naam = persoonNaam(S, m.door);
    const aanpassen = (CC.ui.seg || {}).uxAanpassen === m.id;
    const doel = blok('Doel van de training', 'Vooraf vastgelegd bij de voorbereiding van dit bezoek', `${(m.voor || {}).doel ? `<p class="ux-groot">${esc(m.voor.doel)}</p>` : '<p class="ux-z">Geen doel vastgelegd.</p>'}${((m.plan || {}).leerdoel || (m.voor || {}).leerdoel) ? `<p class="ux-z">Jouw leerdoel: ${esc(m.plan.leerdoel || m.voor.leerdoel)}</p>` : ''}`);
    const eigen = blok('Mijn eigen reflectie', vast && !aanpassen ? `Vastgelegd op ${datum(z.reflectieOp)} · door jou` : '',
      vast && !aanpassen ? `${eigenReflectieGelezen(z)}${z.g || !z.r ? `<button class="linkknop" data-act="seg" data-key="uxAanpassen" data-val="${esc(m.id)}">Aanpassen</button>` : ''}` : reflectieForm(S, m, z));
    const vanBeg = naam ? `Begeleider: ${esc(naam)}${m.gedeeld ? ` · gedeeld op ${datum(m.gedeeld)}` : ''}` : `Van je begeleider${m.gedeeld ? ` · gedeeld op ${datum(m.gedeeld)}` : ''}`;
    const feedback = vast ? blok('Feedback van je begeleider', vanBeg, `${regel('circle-check', 'Wat goed ging', v.sterk)}${regel('users', 'Wat je spelers deden', v.effect)}${!v.sterk && !v.effect ? '<p class="ux-z">Je begeleider heeft hier niets ingevuld.</p>' : ''}${volledigeObs(m)}`)
      : blok('Feedback van je begeleider', '', `<p class="ux-dicht">${icon('lock')} Je ziet de feedback zodra je je eigen reflectie hebt vastgelegd. Zo kijk je eerst zelf terug.</p>`);
    const samen = vast && (v.ontwikkelpunt || v.afspraak) ? blok('Samen afgesproken', `Na jullie gesprek vastgelegd${naam ? ` door ${esc(naam)}` : ''}${m.klaarOp ? ` op ${datum(m.klaarOp)}` : ''}`, `${regel('user-check', 'Je ontwikkelpunt', v.ontwikkelpunt)}${regel('flag', 'Volgende keer', v.afspraak)}`) : '';
    const begTekst = vast && m.reflectieBegeleider ? blok('Ook genoteerd door je begeleider', `Door ${esc(persoonNaam(S, m.reflectieBegeleider.door) || 'je begeleider')} · niet door jou`, `<dl class="ux-dl">${OUD.map(([k, t]) => (m.reflectieBegeleider.r || {})[k] ? `<dt>${esc(t)}</dt><dd>${esc(m.reflectieBegeleider.r[k])}</dd>` : '').join('')}</dl>`) : '';
    return { titel: 'Terugblik na je begeleiding', sub: titelM(S, m), html: `<div class="ux"><p class="ux-concept">ONTWERPVOORSTEL · simulatie</p><div class="ux-2"><div>${doel}${eigen}</div><div>${feedback}${samen}${begTekst}</div></div>
      <div class="knoppen"><button class="knop licht klein" data-act="begelPrint" data-id="${esc(m.id)}">${icon('printer')}Printen</button></div></div>` }; };
  const origVerslag = CC.views.begelVerslag;
  CC.views.begelVerslag = (S, p) => { const m = vind(S, p.id); if (!voorstel() || p.voorbeeld || !m || (CC.rol() || {}).rol !== 'trainer') return origVerslag(S, p); return verslag(S, m); };
  CC.autosave.uxReflectie = (f) => { const S = CC.S(); const m = vind(S, f.dataset.id); if (!m) return; const z = zelf(S)[m.id] || (zelf(S)[m.id] = { trainerId: m.trainerId });
    z.g = Object.fromEntries(NIEUW.map(([k]) => [k, f[k].value.trim()])); z.vragenVersie = 2; z.gBewaard = new Date().toISOString();
    NIEUW.forEach(([k]) => { const c = f.querySelector(`[data-ux-chip="${k}"]`); if (c) { const ok = !!z.g[k]; c.textContent = ok ? '✓ bewaard' : 'open'; c.classList.toggle('ok', ok); } });
    const t = f.querySelector('[data-ux-teller]'); if (t) t.textContent = `${NIEUW.filter(([k]) => z.g[k]).length} van 3 ingevuld`;
    const b = f.querySelector('[data-ux-bewaard]'); if (b) b.textContent = `Concept bewaard om ${new Date().toTimeString().slice(0, 5)}`; };
  CC.on('uxReflectieOk', (f) => { const S = CC.S(); const m = vind(S, f.dataset.id); const z = zelf(S)[m.id] || (zelf(S)[m.id] = { trainerId: m.trainerId });
    z.g = Object.fromEntries(NIEUW.map(([k]) => [k, f[k].value.trim()])); z.vragenVersie = 2;
    if (!NIEUW.some(([k]) => z.g[k])) return CC.toast('Vul minstens één vraag in', 'fout');
    z.reflectieOp = new Date().toISOString(); delete CC.ui.seg.uxAanpassen; CC.save(); CC.render(); CC.toast('Reflectie vastgelegd. Je ziet nu de feedback van je begeleider.'); });
  document.addEventListener('input', (e) => { if (e.target.matches && e.target.matches('[data-ux-groei]')) { e.target.style.height = 'auto'; e.target.style.height = `${e.target.scrollHeight + 2}px`; } });

  // ---------- Home van de trainer ----------
  const volgende = (S, me) => { const teams = me.rollen.filter((r) => r.rol === 'trainer').map((r) => r.teamId); const nu = `${D.vandaag()}`;
    return S.acts.filter((a) => teams.includes(a.teamId) && a.soort === 'training' && !a.afgelast && a.datum >= nu).sort((a, b) => (a.datum + a.tijd).localeCompare(b.datum + b.tijd))[0]; };
  // Eenvoudige taal voor de bestaande acties (alleen de woorden; dezelfde acties en dezelfde plek om naartoe te gaan)
  const TAAL = [[/Je verslag staat klaar \(([^)]*)\)/, 'Kijk terug op je training van $1'], [/Lees het en vul je reflectie in \(3 vragen\)/, 'Eerst 3 korte vragen, daarna de feedback van je begeleider'],
    [/Bereid je begeleidingsmoment voor \(([^)]*)\)/, 'Bereid het bezoek van je begeleider voor ($1)'], [/Een paar vragen vooraf, zodat het gesprek bij jou begint/, 'Een paar vragen vooraf · ongeveer 5 minuten']];
  const eenvoudig = (html) => TAAL.reduce((x, [a, b]) => x.replace(a, b), html);
  const home = (S) => { const me = CC.me(); const acties = (CC.trainerActiesExtra ? CC.trainerActiesExtra(S) : []).map(eenvoudig);
    const a = volgende(S, me); const p = a && (S.trainingsplannen || []).find((x) => x.actId === a.id && x.eigenaar === me.id);
    const t = ((S.trainerDossier || {})[me.id] || {}).traject; const actief = t && t.actief;
    const mom = (S.begeleidMomenten || []).filter((m) => m.trainerId === me.id && !m.vervallen);
    const laatsteAfspraak = mom.filter((m) => m.gedeeld && (m.vakken || {}).ontwikkelpunt).sort((x, y) => y.datum.localeCompare(x.datum))[0];
    const punt = (actief && t.ontwikkelpunt) || (laatsteAfspraak && laatsteAfspraak.vakken.ontwikkelpunt) || '';
    const gedaan = mom.filter((m) => m.klaar).length; const plan = actief ? (t.plan.wedstrijd || 0) + (t.plan.training || 0) : 0;
    const vlg = mom.filter((m) => !m.klaar && m.datum >= D.vandaag()).sort((x, y) => x.datum.localeCompare(y.datum))[0];
    const nuTeDoen = acties.length ? `<h2 class="ux-h">Nu te doen</h2><div class="lijst">${acties.join('')}</div>` : '';
    const training = `<h2 class="ux-h">Mijn volgende training</h2><div class="ux-blok">${a ? `<p class="ux-groot">${esc(D.lang(a.datum).replace(/^./, (c) => c.toUpperCase()))} · ${esc(a.tijd || '')}</p>
        <p class="ux-z">${esc(CC.tn(a.teamId))} · ${p ? `voorbereid${p.thema ? `: ${esc(p.thema)}` : ''}` : 'nog niet voorbereid'}</p>
        <button class="knop vol" data-act="uxVoorbereiden" data-id="${esc(a.id)}">${icon('pencil')}${p ? 'Training bekijken' : 'Training voorbereiden'}</button>` : '<p class="ux-z">Er staat geen training gepland.</p>'}
        <button class="ux-link" data-act="uxTrainingen"><span>Mijn trainingen <span class="ux-z">· week, plannen, vormenbank, lijn</span></span>${icon('chevron-right')}</button></div>`;
    const ontw = `<h2 class="ux-h">Mijn ontwikkeling</h2><div class="ux-blok">${punt ? `<p class="ux-tag">Mijn ontwikkelpunt</p><p class="ux-groot">${esc(punt)}</p>` : '<p class="ux-z">Hier komt je ontwikkelpunt te staan zodra je begeleiding hebt.</p>'}
        ${actief ? `<p class="ux-z">${t.leerdoel ? `Leerdoel: ${esc(t.leerdoel)} · ` : ''}${gedaan} van ${plan} begeleidingsmomenten gedaan${vlg ? ` · volgend: ${D.kort(vlg.datum)}` : ''}</p>` : ''}
        <button class="ux-link" data-act="open" data-view="mijnOntw"><span>Alle begeleiding, feedback en kennismaking</span>${icon('chevron-right')}</button></div>`;
    return `<div class="ux"><p class="ux-concept">ONTWERPVOORSTEL · simulatie</p><div class="ux-2"><div>${nuTeDoen}${training}</div><div>${ontw}</div></div></div>`; };
  const wacht = () => { if (!CC.rollen || !CC.rollen.trainer || !CC.pakketTrainers) return setTimeout(wacht, 0);
    const orig = CC.rollen.trainer.schermen.home;
    CC.rollen.trainer.schermen.home = (S) => (voorstel() && CC.pakketTrainers(S) ? home(S) : orig(S)); };
  wacht();
  CC.on('uxVoorbereiden', (el) => { const g = (CC.ui.seg = CC.ui.seg || {}); g.trSeg = 'plannen'; g.aanwAct = el.dataset.id; CC.go('aanwezigheid'); });
  CC.on('uxTrainingen', () => { const g = (CC.ui.seg = CC.ui.seg || {}); g.trSeg = 'week'; CC.go('aanwezigheid'); });
})();
