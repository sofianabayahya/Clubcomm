// ClubComm — Besluit 134 en Besluit NNN: de begeleider (HO of TC) kijkt mee met de trainingen van een trainer en geeft feedback.
// Alleen lezen. De database (migratie 032 en 034) bepaalt wie het ziet: de trainer zelf, en een HO of TC van zijn bouw als de club
// meekijken aanzet en de trainer dit seizoen een traject heeft (gehad). Alleen trainingen en de oefenvormen die erin staan; de rest
// van de vormenbank blijft privé (scope 'eigen', zie opslag.js).
(function () {
  const CC = window.CC; const esc = CC.esc, icon = CC.icon, h = CC.h, D = CC.date, M = CC.m;
  const BLOK = { start: 'Start', A: 'Blok A', B: 'Blok B', S: 'Spacing', P: 'Partij' };
  const aan = (S) => !!(S.club && S.club.begeleiderKijktMee);
  const rol = () => (CC.rol() || {}).rol;
  const isBegeleider = () => ['hjo', 'tc'].includes(rol());
  const actVan = (S, p) => S.acts.find((a) => a.id === p.actId) || { datum: p.datum || '', tijd: '' };
  const datumVan = (S, p) => actVan(S, p).datum || p.datum || '';
  const vorm = (S, id) => (S.vormen || []).find((v) => v.id === id);
  const minuten = (p) => (p.onderdelen || []).reduce((t, o) => t + (Number(o.min) || 0), 0);
  const plannenVan = (S, pid) => (S.trainingsplannen || []).filter((p) => p.eigenaar === pid && !p.week && (p.onderdelen || []).length)
    .sort((x, y) => String(datumVan(S, y)).localeCompare(String(datumVan(S, x))));
  const feedback = (S) => S.trainingFeedback || (S.trainingFeedback = []);
  const fbVan = (S, planId) => (S.trainingFeedback || []).filter((f) => f.planId === planId).sort((a, b) => String(a.op).localeCompare(String(b.op)));
  // Zelfde regel als priv.cc_traject_seizoen (032): traject loopt, of is afgerond sinds 1 juli van dit seizoen
  const seizoenStart = () => { const d = new Date(); const j = d.getMonth() < 6 ? d.getFullYear() - 1 : d.getFullYear(); return `${j}-07-01`; };
  const trajectSeizoen = (S, pid) => { const d = (S.trainerDossier || {})[pid] || {}; return !!((d.traject && d.traject.actief) || (d.oud || []).some((o) => String(o.afgerond || '') >= seizoenStart())); };
  const tekening = (t) => (t && window.DrawTool ? window.DrawTool.staticSvg(t) : '');

  // ---------- Begeleider: blok "Trainingen" in het dossier van de trainer ----------
  const origDetail = CC.views.trainerDetail;
  CC.views.trainerDetail = (S, p) => {
    const basis = origDetail(S, p); if (!isBegeleider() || !basis || typeof basis.html !== 'string') return basis;
    const tr = M.persoon(S, p.id); if (!tr) return basis; const voor = esc(tr.naam.split(' ')[0]);
    let inhoud;
    if (!aan(S)) inhoud = `<p class="zacht klein">Meekijken met trainingen staat uit voor de club. De clubbeheerder zet het aan bij Regels → Meekijken.</p>`;
    else if (!trajectSeizoen(S, tr.id)) inhoud = `<p class="zacht klein">Je kijkt mee bij trainers met een traject dit seizoen. Start een traject om de trainingen van ${voor} te zien.</p>`;
    else {
      const lijst = plannenVan(S, tr.id);
      inhoud = lijst.length ? `<div class="lijst compact">${lijst.slice(0, 12).map((x) => { const d = datumVan(S, x); const n = fbVan(S, x.id).length;
        const namen = (x.onderdelen || []).filter((o) => o.vormId && !o.spacing).map((o) => (vorm(S, o.vormId) || {}).naam).filter(Boolean);
        return h.rij({ ic: 'list-checks', titel: `${esc(d ? D.kort(d) : 'Zonder datum')} · ${esc(x.thema || 'Training')}`,
          sub: `${minuten(x)} min · ${namen.length ? esc(namen.join(', ')) : 'nog geen oefenvormen'}${x.gegeven ? ' · gegeven' : ''}${n ? ` · <b>${n} feedback</b>` : ''}`, act: 'mkTraining', attrs: `data-id="${esc(x.id)}"` }); }).join('')}</div>
        <p class="zacht klein">Alleen lezen. Alleen ${voor} kan zijn trainingen wijzigen.</p>`
        : `<p class="zacht klein">${voor} heeft nog geen training voorbereid in ClubComm.</p>`;
    }
    return { ...basis, html: basis.html + h.sectie('Trainingen') + `<div class="kaartje">${inhoud}</div>` };
  };

  const onderdeel = (S, o) => { const v = o.vormId ? vorm(S, o.vormId) : null; const naam = o.spacing ? (v ? `Spacing · ${v.naam}` : 'Spacing') : v ? v.naam : (o.naam || 'Lege plek');
    const teken = v && v.tekening ? `<div class="mk-tekening">${tekening(v.tekening)}</div>` : '';
    const uitleg = v ? [v.organisatie && `<p class="klein"><b>Organisatie:</b> ${esc(v.organisatie)}</p>`, v.coach && `<p class="klein"><b>Coachen:</b> ${esc(v.coach)}</p>`].filter(Boolean).join('') : '';
    const kop = [BLOK[o.blok], naam].filter((x, i, l) => x && l.indexOf(x) === i).join(' · ');
    return `<div class="mk-ond"><p><b>${esc(kop)}</b> <span class="zacht">· ${Number(o.min) || 0} min</span></p>${teken}${uitleg}</div>`; };

  CC.on('mkTraining', (el) => { const S = CC.S(); const x = (S.trainingsplannen || []).find((p) => p.id === el.dataset.id); if (!x) return;
    const tr = M.persoon(S, x.eigenaar) || { naam: '' }; const a = actVan(S, x); const d = datumVan(S, x);
    const fb = fbVan(S, x.id);
    CC.sheet(`${esc(x.thema || 'Training')} · ${esc(tr.naam.split(' ')[0])}`, `
      <p class="klein">${esc(d ? D.lang(d) : 'Zonder datum')}${a.tijd ? ` · ${esc(a.tijd)}${a.eind ? `–${esc(a.eind)}` : ''}` : ''} · ${esc(CC.tn(x.teamId || a.teamId))} · ${minuten(x)} min${x.gegeven ? ' · gegeven' : ''}</p>
      ${(x.onderdelen || []).map((o) => onderdeel(S, o)).join('')}
      ${x.anders ? `<p class="klein"><b>Na de training (notitie van de trainer):</b> ${esc(x.anders)}</p>` : ''}
      ${h.sectie('Feedback')}
      ${fb.length ? fb.map((f) => `<div class="kaartje"><p class="klein">${esc(f.tekst)}</p><small class="zacht">${esc((M.persoon(S, f.door) || { naam: 'Begeleider' }).naam)} · ${D.kort(String(f.op).slice(0, 10))}</small></div>`).join('') : ''}
      <form data-submit="mkFeedback" data-id="${esc(x.id)}" class="codeform">
        <label for="mk-fb">Jouw feedback aan ${esc(tr.naam.split(' ')[0])}</label>
        <textarea id="mk-fb" name="tekst" rows="4" required placeholder="Bijv. Mooie opbouw. Probeer in de partij de ruimte groter te maken."></textarea>
        <small class="zacht">${esc(tr.naam.split(' ')[0])} ziet je feedback bij deze training en krijgt een bericht.</small>
        <button class="knop vol">${icon('send')}Feedback sturen</button></form>`); });

  CC.on('mkFeedback', (f) => { const S = CC.S(); const x = (S.trainingsplannen || []).find((p) => p.id === f.dataset.id); const tekst = f.tekst.value.trim(); if (!x || !tekst) return;
    const me = CC.me(); const tr = M.persoon(S, x.eigenaar) || { naam: '' }; const d = datumVan(S, x); const nu = new Date().toISOString();
    feedback(S).push({ id: 'fb' + Date.now(), trainerId: x.eigenaar, planId: x.id, actId: x.actId || null, door: me.id, op: nu, tekst });
    S.msgs.push({ id: 'b' + Date.now(), van: me.id, soort: 'persoonlijk', bereik: x.teamId || null, onderwerp: `Feedback op je training${d ? ` van ${D.kort(d)}` : ''}`,
      tekst: `Hoi ${tr.naam.split(' ')[0]},\n\n${tekst}\n\nJe vindt dit ook bij de training in Plannen.`, tijd: nu, ontvangers: [x.eigenaar], gelezen: [], antw: [], urgent: false, gepland: null });
    CC.save(); CC.closeSheet(); CC.render(); CC.toast(`Feedback gestuurd aan ${tr.naam.split(' ')[0]}`); });

  // ---------- Trainer: feedback bij zijn training, en eerlijk zeggen dat de begeleider meekijkt ----------
  CC.trFeedback = (S, p) => { const me = CC.me(); if (!p || !me || p.eigenaar !== me.id) return '';
    const fb = fbVan(S, p.id); const kijkt = aan(S) && trajectSeizoen(S, me.id);
    if (!fb.length && !kijkt) return '';
    return `${fb.length ? `<div class="kaartje mk-fb"><p><b>${icon('message-circle')} Feedback van je begeleider</b></p>${fb.map((f) => `<p class="klein">${esc(f.tekst)}</p><small class="zacht">${esc((M.persoon(S, f.door) || { naam: 'Begeleider' }).naam)} · ${D.kort(String(f.op).slice(0, 10))}</small>`).join('')}</div>` : ''}
      ${kijkt ? '<p class="zacht klein">Je begeleider kan deze training lezen (de club heeft meekijken aangezet). Alleen jij kunt hem wijzigen.</p>' : ''}`; };

  // ---------- Regels: meekijken aan of uit (clubbeheerder) ----------
  const wacht = () => {
    if (!CC.rollen || !CC.rollen.beheerder || !CC.rollen.beheerder.schermen.regels) return setTimeout(wacht, 0);
    const origRegels = CC.rollen.beheerder.schermen.regels;
    CC.rollen.beheerder.schermen.regels = (S) => origRegels(S) + `${h.sectie('Meekijken')}<form data-submit="mkRegel" class="kaartje codeform">
      <label class="vink"><input type="checkbox" name="aan" ${aan(S) ? 'checked' : ''}> ${esc(S.club.labels.hjo)} en technisch coördinator kijken mee met de trainingen van trainers met een traject</label>
      <small class="zacht">Alleen lezen, alleen trainingen en de oefenvormen die erin staan, alleen in hun eigen bouw. De trainer ziet dat zijn begeleider meekijkt. De rest van zijn vormenbank blijft privé.</small>
      <button class="knop licht klein">Opslaan</button></form>`;
  };
  wacht();
  CC.on('mkRegel', (f) => { const S = CC.S(); S.club.begeleiderKijktMee = f.aan.checked; CC.save(); CC.render(); CC.toast(f.aan.checked ? 'Meekijken staat aan' : 'Meekijken staat uit'); });
})();
