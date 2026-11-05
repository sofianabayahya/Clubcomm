// ClubComm — Besluit 166: de Home van de begeleider (HO, TC) en van de trainer bij het pakket Trainers begeleiden.
// Begeleider: Vandaag · Actie nodig (trainingen om te bekijken, momenten deze week, kennismaking) · Mijn trajecten · Deze week (één regel;
// de week van Besluit 146 staat erachter). Trainer: Actie nodig · Mijn volgende training · Van je begeleider (14 dagen) · Mijn traject.
// Geen nieuwe gegevens of rechten: alles bestaat al (trajecten, momenten, trainingen met scope trainerplan, feedback).
(function () {
  const CC = window.CC; const h = CC.h, esc = CC.esc, icon = CC.icon, D = CC.date, M = CC.m;
  const voornaam = (p) => esc(String((p || {}).naam || '').split(' ')[0]);
  const traject = (S, pid) => { const t = ((S.trainerDossier || {})[pid] || {}).traject; return t && t.actief ? t : null; };
  const mom = (S) => (S.begeleidMomenten || []).filter((m) => !m.vervallen);
  const gedaan = (S, pid) => mom(S).filter((m) => m.trainerId === pid && m.klaar).length;
  const planN = (t) => (t.plan.wedstrijd || 0) + (t.plan.training || 0);
  const volgende = (S, pid) => mom(S).filter((m) => m.trainerId === pid && !m.klaar && m.datum >= D.vandaag()).sort((a, b) => a.datum.localeCompare(b.datum))[0];
  const teams = (S, p) => p.rollen.filter((r) => r.rol === 'trainer').map((r) => r.teamId);
  const balk = (n, van) => `<span class="vg-balk" aria-hidden="true"><i style="width:${van ? Math.max(3, Math.round((100 * Math.min(n, van)) / van)) : 0}%"></i></span>`;
  const stand = (S, pid, t, woord = '') => { const v = volgende(S, pid); const n = gedaan(S, pid); const tot = planN(t);
    return `${n} van ${tot}${woord}${v ? ` · volgend: ${D.kort(v.datum)}` : n >= tot ? ' · plan gehaald' : ''}`; };
  const TERMIJN = 7; // dagen: een gegeven training zonder feedback staat nog zo lang bij Actie nodig

  // ---------- Begeleider ----------
  const trainersVan = (S) => S.people.filter((p) => p.id !== (CC.me() || {}).id && teams(S, p).some((tid) => S.teams.some((t) => t.id === tid) && CC.inWerkgebied(S, tid)));
  // Trainingen die de trainer heeft uitgewerkt en die je nog niet hebt bekeken met feedback (alleen als de club meekijken aan heeft)
  CC.hoTeBekijken = (S) => { if (!CC.mk || !CC.mk.aan(S)) return [];
    const grens = D.addDays(D.vandaag(), -TERMIJN);
    return trainersVan(S).filter((p) => CC.mk.trajectSeizoen(S, p.id)).flatMap((p) => CC.mk.plannenVan(S, p.id).map((x) => ({ p, x, d: CC.mk.datumVan(S, x) })))
      .filter(({ x, d }) => !CC.mk.fbVan(S, x.id).length && (!d || d >= grens)).sort((a, b) => String(a.d).localeCompare(String(b.d))); };
  CC.hoHome = (S) => {
    const bekijk = CC.hoTeBekijken(S);
    const bRij = ({ p, x, d }) => h.rij({ ic: 'list-checks', titel: `Training van ${esc(p.naam)} bekijken`, sub: `${esc(CC.tn(x.teamId))} · ${d ? D.kort(d) : 'zonder datum'}${x.thema ? ` · ${esc(x.thema)}` : ''}`, act: 'mkTraining', attrs: `data-id="${esc(x.id)}"`, kleur: 'blauw' });
    const week = CC.begelWeek ? CC.begelWeek(S) : [];
    const f = CC.hoFocus ? CC.hoFocus.focus(S) : 'alle';
    const zonder = trainersVan(S).filter((p) => !((S.trainerKennis || {})[p.id] || {}).gevraagd && !((S.trainerKennis || {})[p.id] || {}).ingevuld && (!CC.hoFocus || teams(S, p).some((tid) => CC.hoFocus.inFocus(S, f, tid))));
    const acties = [...week, ...bekijk.slice(0, 3).map(bRij),
      ...(bekijk.length > 3 ? [h.rij({ ic: 'list-checks', titel: `Nog ${bekijk.length - 3} ${bekijk.length - 3 === 1 ? 'training' : 'trainingen'} om te bekijken`, sub: 'Staan in het dossier van de trainer, blok Trainingen', act: 'tab', attrs: 'data-tab="trainers"' })] : []),
      ...(zonder.length ? [h.rij({ ic: 'send', titel: `${zonder.length} ${zonder.length === 1 ? 'trainer' : 'trainers'} zonder kennismaking`, sub: 'Nodig ze uit voor de korte vragenlijst', act: 'hoKennisVraag' })] : [])];
    const inT = trainersVan(S).filter((p) => traject(S, p.id)).sort((a, b) => ((volgende(S, a.id) || {}).datum || '9').localeCompare((volgende(S, b.id) || {}).datum || '9') || a.naam.localeCompare(b.naam));
    const tRij = (p) => { const t = traject(S, p.id); const leeg = !volgende(S, p.id) && gedaan(S, p.id) < planN(t);
      return h.rij({ ic: h.avatar(p.naam), titel: `${esc(p.naam)} <span class="zacht">· ${esc(teams(S, p).map((tid) => CC.tn(tid)).join(', '))}</span>`, sub: `${stand(S, p.id, t)}${balk(gedaan(S, p.id), planN(t))}`,
        rechts: leeg ? '<span class="label oranje">plannen</span>' : '', act: 'open', attrs: `data-view="trainerDetail" data-id="${esc(p.id)}"` }); };
    const tot = D.addDays(D.vandaag(), 6);
    const acts = S.acts.filter((a) => a.datum >= D.vandaag() && a.datum <= tot && !a.afgelast && (a.soort === 'training' || M.isWed(a)) && trainersVan(S).some((p) => teams(S, p).includes(a.teamId)));
    const nW = acts.filter((a) => M.isWed(a)).length; const nT = acts.length - nW; const thuis = acts.filter((a) => M.isWed(a) && a.thuis !== false).length;
    return `${CC.begelVandaag ? CC.begelVandaag(S) : ''}
      ${h.actieBlok(acties, 'een training van een trainer om te bekijken of een begeleidingsmoment deze week')}
      ${h.sectie(`Mijn trajecten${inT.length ? ` · ${inT.length}` : ''}`)}${inT.length ? `<div class="lijst compact">${inT.map(tRij).join('')}</div>` : '<p class="zacht klein">Nog geen trainer in een traject. Start er een bij Trainers.</p>'}
      ${h.sectie('Deze week')}<div class="lijst">${h.rij({ ic: 'calendar-days', titel: `${nW} ${nW === 1 ? 'wedstrijd' : 'wedstrijden'} · ${nT} ${nT === 1 ? 'training' : 'trainingen'}`, sub: `De komende 7 dagen${nW ? ` · ${thuis} thuis` : ''} · kies wat je bezoekt`, rechts: '<span class="knop licht klein">Week</span>', act: 'open', attrs: 'data-view="hoWeek"', chevron: false })}</div>`; };
  CC.views.hoWeek = (S) => ({ titel: 'Week van je trainers', html: CC.hoWeek(S) });
  CC.on('hoKennisVraag', () => { const S = CC.S(); const f = CC.hoFocus ? CC.hoFocus.focus(S) : 'alle';
    const zonder = trainersVan(S).filter((p) => !((S.trainerKennis || {})[p.id] || {}).gevraagd && !((S.trainerKennis || {})[p.id] || {}).ingevuld && (!CC.hoFocus || teams(S, p).some((tid) => CC.hoFocus.inFocus(S, f, tid))));
    CC.sheet('Kennismaking', `<p>${zonder.length} ${zonder.length === 1 ? 'trainer heeft' : 'trainers hebben'} nog geen uitnodiging: ${esc(zonder.map((p) => p.naam).join(', '))}.</p>
      <p class="zacht klein">Elke trainer krijgt één bericht en ziet de korte vragenlijst op zijn Home.</p>
      <div class="knoppen kolom"><button class="knop vol" data-act="kennisUitnodigen">${icon('send')}Uitnodigen (${zonder.length})</button><button class="knop licht vol" data-act="sluit">Niet nu</button></div>`); });

  // ---------- Trainer ----------
  CC.trainerStart = (S, acties) => { const me = CC.me(); const t = traject(S, me.id); const tid = CC.teamId();
    let training = '';
    if (CC.trainingAan && CC.trainingAan(S)) {
      const a = tid ? S.acts.filter((x) => x.teamId === tid && x.soort === 'training' && !x.afgelast && x.datum >= D.vandaag()).sort((x, y) => (x.datum + (x.tijd || '')).localeCompare(y.datum + (y.tijd || '')))[0] : null;
      const p = a && (S.trainingsplannen || []).find((x) => x.actId === a.id && x.eigenaar === me.id); const vol = p && (p.onderdelen || []).length;
      const kijkt = CC.mk && CC.mk.aan(S) && CC.mk.trajectSeizoen(S, me.id);
      training = `${h.sectie('Mijn volgende training')}<div class="kaartje">${a ? `<p><b>${esc(D.lang(a.datum))}${a.tijd ? ` · ${esc(a.tijd)}` : ''}</b> <span class="zacht">· ${esc(CC.tn(a.teamId))}</span></p>
        <p class="zacht klein">${vol ? `${esc(p.thema || 'Training')} · ${p.onderdelen.length} ${p.onderdelen.length === 1 ? 'onderdeel' : 'onderdelen'}` : 'Nog leeg'}${kijkt ? ` · je begeleider kan meekijken${vol ? '' : ' als je hem uitwerkt'}` : ''}</p>` : '<p class="zacht klein">Geen training gepland.</p>'}
        <div class="knoppen">${a ? (p ? `<button class="knop" data-act="open" data-view="trainingsplan" data-id="${esc(a.id)}">${icon('list-checks')}Training openen</button>` : `<button class="knop" data-act="tpNieuw" data-id="${esc(a.id)}">${icon('pencil')}Training maken</button>`) : ''}
        <button class="knop licht" data-act="vormNieuw">${icon('plus')}Nieuwe oefenvorm</button></div></div>`;
    }
    // Van je begeleider: de laatste feedback, 14 dagen op Home; daarna staat hij alleen nog bij de training
    const fb = (S.trainingFeedback || []).filter((f) => f.trainerId === me.id && String(f.op).slice(0, 10) >= D.addDays(D.vandaag(), -14)).sort((a, b) => String(b.op).localeCompare(String(a.op)))[0];
    const fbPlan = fb && (S.trainingsplannen || []).find((x) => x.id === fb.planId);
    const fbHtml = fb ? `${h.sectie('Van je begeleider')}<div class="kaartje mk-fb"><p class="zacht klein">${voornaam(M.persoon(S, fb.door))} · over je training${fbPlan && CC.mk ? ` van ${D.kort(CC.mk.datumVan(S, fbPlan))}` : ''}</p><p>${esc(fb.tekst)}</p>
      ${fbPlan && fbPlan.actId ? `<button class="linkknop" data-act="open" data-view="trainingsplan" data-id="${esc(fbPlan.actId)}">Training openen</button>` : ''}</div>` : '';
    const ontw = CC.heeftOntw ? CC.heeftOntw(S, me) : !!t;
    const trHtml = `${h.sectie('Mijn traject')}${t ? `<div class="kaartje"><p><b>${stand(S, me.id, t, ' momenten')}</b>${balk(gedaan(S, me.id), planN(t))}</p>
        <p><b>Leerdoel:</b> ${esc(t.leerdoel || 'nog niet afgesproken')}</p></div>` : ''}
      ${ontw ? `<div class="lijst compact">${h.rij({ ic: 'graduation-cap', titel: 'Alles over mijn begeleiding', sub: 'Momenten, reflecties en kennismaking', act: 'open', attrs: 'data-view="mijnOntw"' })}</div>` : '<p class="zacht klein">Hier komt je begeleiding te staan zodra de club die met je afspreekt.</p>'}`;
    return `${acties.length ? `${h.sectie('Actie nodig')}<div class="lijst">${acties.join('')}</div>` : ''}${training}${fbHtml}${trHtml}`; };
})();
