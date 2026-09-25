// ClubComm prototype — Besluit 21: afwezigheid van trainers signaleren, net als bij spelers.
// Gradaties: op tijd afgemeld (telt mee, 0 punten) · te laat afgemeld (1) · niet gekomen zonder bericht (2, door teamleider/HJO).
// Signaal alleen naar de HJO; de trainer ziet zijn eigen telling. Mensen beslissen.
(function () {
  const CC = window.CC; const D = CC.date, M = CC.m, h = CC.h, icon = CC.icon, esc = CC.esc;
  const PUNTEN = { optijd: 0, telaat: 1, niet: 2 };
  const LABEL = { optijd: 'Op tijd afgemeld', telaat: 'Te laat afgemeld', niet: 'Niet gekomen zonder bericht' };
  const inst = (S) => S.club.inst.trainer || (S.club.inst.trainer = { deadlineUur: 24, drempel: 3, maxSeizoen: 5 });
  const log = (S) => S.trainerLog || (S.trainerLog = []);

  // Registreren (aangeroepen vanuit "Ik kan zelf niet" en door de teamleider/HJO)
  CC.trainerRegistreer = (S, a, trainerId, soort, extra = {}) => {
    log(S).push({ id: 'tl' + Date.now() + Math.random().toString(36).slice(2, 5), trainerId, teamId: a.teamId, actId: a.id, datum: a.datum, soort, tijd: new Date().toISOString(), ...extra });
  };
  CC.trainerAfmeldSoort = (S, a) => (D.start(a) - new Date() < inst(S).deadlineUur * 3600e3 ? 'telaat' : 'optijd');

  // Telling per trainer: punten deze fase, afmeldingen dit seizoen
  CC.trainerTelling = (S, trainerId) => {
    const fase = M.blok(S, D.vandaag());
    const alles = log(S).filter((x) => x.trainerId === trainerId && x.datum >= S.club.seizoen.start);
    const fase_ = alles.filter((x) => x.datum >= fase.van);
    const punten = fase_.reduce((s, x) => s + PUNTEN[x.soort], 0);
    const afmeldingen = alles.filter((x) => x.soort !== 'niet').length;
    return { alles, fase: fase_, punten, afmeldingen, afgelast: alles.filter((x) => x.afgelast).length, niet: alles.filter((x) => x.soort === 'niet').length, telaat: alles.filter((x) => x.soort === 'telaat').length };
  };
  // Signaal voor de HJO (verdwijnt na vastgelegd contact, tenzij er daarna iets nieuws gebeurt)
  CC.trainerSignalen = (S) => S.people.filter((p) => p.rollen.some((r) => r.rol === 'trainer')).map((p) => {
    const t = CC.trainerTelling(S, p.id); const i = inst(S);
    const drempel = t.punten >= i.drempel || t.afmeldingen >= i.maxSeizoen;
    if (!drempel) return null;
    const contact = (S.trainerGesprekken || []).filter((g) => g.trainerId === p.id).sort((a, b) => a.datum.localeCompare(b.datum)).pop();
    if (contact && !t.alles.some((x) => x.tijd.slice(0, 10) > contact.datum)) return null;
    const team = p.rollen.filter((r) => r.rol === 'trainer').map((r) => r.teamId).join(', ');
    const delen = [t.niet && `${t.niet}× niet gekomen`, t.telaat && `${t.telaat}× te laat afgemeld`, t.afmeldingen && `${t.afmeldingen}× afgemeld dit seizoen`, t.afgelast && `${t.afgelast} ${t.afgelast === 1 ? 'training' : 'trainingen'} afgelast`].filter(Boolean);
    return { p, team, t, tekst: `${p.naam} (trainer ${team}): gesprek?`, sub: delen.join(' · ') + (contact ? ' · opnieuw na eerder contact' : '') };
  }).filter(Boolean);
  CC.trainerAandacht = (S) => CC.trainerSignalen(S).filter((s) => s.p.rollen.some((r) => r.rol === 'trainer' && S.teams.some((t) => t.id === r.teamId) && CC.mag('trainersVolgen', null, r.teamId))).map((s) => h.rij({ ic: 'user-cog', titel: esc(s.tekst), sub: esc(s.sub), kleur: 'oranje', act: 'open', attrs: `data-view="trainerDetail" data-id="${s.p.id}"` }));

  CC.views.trainerDetail = (S, p) => {
    const tr = M.persoon(S, p.id); const t = CC.trainerTelling(S, tr.id); const i = inst(S);
    const gespr = (S.trainerGesprekken || []).filter((g) => g.trainerId === tr.id);
    return { titel: tr.naam, html: `
      <div class="cijfers"><div class="cijfer ${t.punten >= i.drempel ? 'rood' : ''}"><b>${t.punten}</b><small>punten deze fase</small></div><div class="cijfer ${t.afmeldingen >= i.maxSeizoen ? 'rood' : ''}"><b>${t.afmeldingen}×</b><small>afgemeld (seizoen)</small></div><div class="cijfer"><b>${t.afgelast}</b><small>afgelast</small></div></div>
      <div class="info">${icon('info')}<span>Trainers zijn vrijwilligers. Begin het gesprek met een vraag: "Lukt het nog om te combineren? Kunnen we helpen, bijvoorbeeld met een assistent?" Alleen jij als ${esc(S.club.labels.hjo)} ziet dit.</span></div>
      ${h.sectie('Geschiedenis')}<div class="lijst compact">${t.alles.slice().reverse().map((x) => h.rij({ ic: x.soort === 'niet' ? 'ban' : x.soort === 'telaat' ? 'clock' : 'check', titel: `${D.kort(x.datum)} · ${LABEL[x.soort]}`, sub: `${esc(CC.tn(x.teamId))}${x.reden ? ' · ' + esc(x.reden) : ''}${x.afgelast ? ' · training afgelast' : x.vervanger ? ' · vervanger gevonden' : ''}`, rechts: PUNTEN[x.soort] ? `<span class="chip ${x.soort === 'niet' ? 'rood' : 'oranje'} mini">${PUNTEN[x.soort]} ${PUNTEN[x.soort] === 1 ? 'punt' : 'punten'}</span>` : '' })).join('') || '<p class="zacht klein">Niets geregistreerd.</p>'}</div>
      ${h.sectie('Contact')}${gespr.map((g) => h.rij({ ic: g.soort === 'gesprek' ? 'users' : 'phone', titel: `${D.kort(g.datum)} · ${g.soort === 'gesprek' ? 'Gesprek' : g.soort === 'geappt' ? 'Geappt' : 'Gebeld'}`, sub: esc(g.notitie) + (g.afspraak ? `<br><b>Afspraak:</b> ${esc(g.afspraak)}` : '') })).join('') || '<p class="zacht klein">Nog geen contact vastgelegd.</p>'}
      <button class="knop licht vol" data-act="trainerContact" data-id="${tr.id}">${icon('phone')}Contact vastleggen</button>` };
  };
  CC.on('trainerContact', (el) => CC.sheet('Contact met trainer', `<form data-submit="trainerContactOk" data-id="${el.dataset.id}" class="codeform">
    <label for="tc-s">Soort</label><select id="tc-s" name="s"><option value="gesprek">Gesprek</option><option value="gebeld">Gebeld</option><option value="geappt">Geappt</option></select>
    <label for="tc-d">Datum</label><input id="tc-d" name="d" type="date" value="${D.vandaag()}">
    <label for="tc-n">Wat speelt er?</label><textarea id="tc-n" name="n" rows="3" required placeholder="Bijv. nieuwe baan met late diensten"></textarea>
    <label for="tc-a">Afspraak (mag leeg)</label><input id="tc-a" name="a" placeholder="Bijv. assistent-trainer zoeken voor de vrijdag">
    <button class="knop">Opslaan</button></form>`));
  CC.on('trainerContactOk', (f) => { const S = CC.S(); (S.trainerGesprekken || (S.trainerGesprekken = [])).push({ id: 'tg' + Date.now(), trainerId: f.dataset.id, soort: f.s.value, datum: f.d.value, notitie: f.n.value, afspraak: f.a.value, door: CC.me().id }); CC.save(); CC.closeSheet(); CC.render(); CC.toast('Vastgelegd'); });

  // Teamleider/HJO: trainingen van de afgelopen week, met "trainer niet gekomen" registreren
  CC.recenteTrainingen = (S, tid) => {
    const acts = M.acts(S, tid, D.addDays(D.vandaag(), -7), D.vandaag()).filter((a) => a.soort === 'training' && !a.afgelast && D.start(a) < new Date());
    if (!acts.length) return '';
    const t = M.team(S, tid);
    return `${h.sectie('Trainingen afgelopen week')}<div class="lijst compact">${acts.reverse().map((a) => {
      const reg = log(S).find((x) => x.actId === a.id);
      const status = reg ? `<span class="chip ${reg.soort === 'niet' ? 'rood' : 'grijs'} mini">${reg.soort === 'niet' ? 'Trainer niet gekomen' : a.vervangerId ? 'Vervanger' : 'Trainer afgemeld'}</span>` : S.pres[a.id] ? '<span class="chip groen mini">Aanwezigheid opgenomen</span>' : '<span class="chip oranje mini">Geen aanwezigheid</span>';
      const knop = !reg && t.trainerId && !a.vervangerId && CC.mag('trainerNiet') ? `<button class="linkknop klein rood-tekst" data-act="trainerNiet" data-id="${a.id}">Trainer niet gekomen?</button>` : '';
      return h.rij({ ic: h.datumBlok(a), titel: `Training ${a.tijd}`, sub: `${status} ${knop}` });
    }).join('')}</div>`;
  };
  CC.on('trainerNiet', (el) => {
    const S = CC.S(); const a = M.act(S, el.dataset.id); const tr = M.persoon(S, M.team(S, a.teamId).trainerId);
    CC.sheet('Trainer niet gekomen', `<p><b>${esc(tr.naam)}</b> was niet bij de training van ${D.lang(a.datum)} om ${a.tijd}, en had zich niet afgemeld?</p>
      <form data-submit="trainerNietOk" data-id="${a.id}" class="codeform"><label for="tn-o">Toelichting (mag leeg)</label><input id="tn-o" name="o" placeholder="Bijv. kinderen stonden te wachten, ik heb het overgenomen">
      <button class="knop rood vol">Registreren</button><p class="zacht klein">Alleen de ${esc(S.club.labels.hjo)} ziet dit. De trainer ziet het in zijn eigen telling, zodat niemand verrast wordt.</p></form>`);
  });
  CC.on('trainerNietOk', (f) => {
    const S = CC.S(); const a = M.act(S, f.dataset.id); const t = M.team(S, a.teamId);
    CC.trainerRegistreer(S, a, t.trainerId, 'niet', { reden: f.o.value, door: CC.me().id });
    CC.save(); CC.closeSheet(); CC.render(); CC.toast('Geregistreerd; de HJO ziet het');
  });

  // Eigen telling voor de trainer (profiel)
  // Eigen telling voor de trainer, alleen op het moment van afmelden (Besluit 54; stond eerst in het profiel)
  CC.trainerEigenTekst = (S, id) => {
    const t = CC.trainerTelling(S, id);
    return `Dit seizoen ${t.afmeldingen}× afgemeld${t.telaat ? `, waarvan ${t.telaat}× te laat` : ''}${t.niet ? ` · ${t.niet}× niet gekomen` : ''}. Afmelden kan het best ${inst(S).deadlineUur} uur van tevoren.`;
  };

  // Demo: trainer O12-1 te laat afgemeld + niet gekomen (3 punten), trainer O8-1 vijf keer op tijd afgemeld
  const demo = (S) => {
    S.trainerLog = []; S.trainerGesprekken = []; inst(S);
    const verleden = (tid) => S.acts.filter((a) => a.teamId === tid && a.soort === 'training' && a.datum < D.vandaag() && !a.afgelast);
    const t12 = S.teams.find((x) => x.id === 'O12-1'); const v12 = verleden('O12-1');
    if (t12 && t12.trainerId && v12.length > 4) {
      CC.trainerRegistreer(S, v12[v12.length - 4], t12.trainerId, 'telaat', { reden: 'file', tijd: new Date(D.start(v12[v12.length - 4]) - 2 * 3600e3).toISOString(), vervanger: true });
      CC.trainerRegistreer(S, v12[v12.length - 2], t12.trainerId, 'niet', { reden: 'Kinderen stonden te wachten; teamleider heeft het overgenomen', door: t12.teamleiderId, tijd: D.start(v12[v12.length - 2]).toISOString() });
    }
    const t8 = S.teams.find((x) => x.id === 'O8-1'); const v8 = verleden('O8-1');
    if (t8 && t8.trainerId) v8.slice(-5).forEach((a, k) => CC.trainerRegistreer(S, a, t8.trainerId, 'optijd', { reden: 'werk', tijd: new Date(D.start(a) - 48 * 3600e3).toISOString(), afgelast: k === 2, vervanger: k !== 2 }));
  };
  const orig = CC.generate;
  CC.generate = function () { const S = orig(); demo(S); return S; };
  const S0 = CC.S(); if (!S0.trainerLog) { demo(S0); CC.save(); }
})();
