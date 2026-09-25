// ClubComm prototype — Besluit 20: (1) ouder meldt een hele periode af, (2) trainer kan zelf niet → vervanger of afgelasten.
(function () {
  const CC = window.CC; const D = CC.date, M = CC.m, h = CC.h, icon = CC.icon, esc = CC.esc;
  const hjoIds = (S) => S.people.filter((p) => p.rollen.some((r) => r.rol === 'hjo')).map((p) => p.id);
  const melding = (S, ontv, onderwerp, tekst, urgent) => S.msgs.push({ id: 'b' + Date.now() + Math.random().toString(36).slice(2, 6), van: 'systeem', soort: 'melding', bereik: 'Ter informatie', onderwerp, tekst, tijd: new Date().toISOString(), ontvangers: [...new Set(ontv.filter(Boolean))], gelezen: [], antw: [], urgent: !!urgent, gepland: null });
  CC.VERVANGER = 'Vervangende trainer';

  // ---------- 1. Een periode afmelden (ouder) ----------
  CC.on('periodeSheet', (el) => {
    const S = CC.S(); const pl = M.speler(S, el.dataset.id);
    CC.sheet(`${pl.voornaam} afmelden voor een periode`, `<form data-submit="periodeOk" data-id="${pl.id}" class="codeform">
      <div class="twee"><div><label for="p-van">Van</label><input id="p-van" name="van" type="date" required value="${D.addDays(D.vandaag(), 7)}"></div><div><label for="p-tot">Tot en met</label><input id="p-tot" name="tot" type="date" required value="${D.addDays(D.vandaag(), 13)}"></div></div>
      <label for="p-r">Reden</label><select id="p-r" name="reden">${CC.REDENEN.map(([r]) => `<option ${r === 'Vakantie' ? 'selected' : ''}>${r}</option>`).join('')}</select>
      <label for="p-o">Opmerking (mag leeg)</label><input id="p-o" name="opm" placeholder="Bijv. familiebezoek in het buitenland">
      <button class="knop vol">Afmelden voor deze periode</button>
      <p class="zacht klein">Alle trainingen en wedstrijden in deze periode worden afgemeld. Intrekken kan per activiteit. Langer ziek of geblesseerd? Gebruik dan <b>Langdurig afwezig</b>.</p></form>`);
  });
  CC.on('periodeOk', (f) => {
    const S = CC.S(); const pl = M.speler(S, f.dataset.id); const van = f.van.value, tot = f.tot.value;
    if (tot < van) return CC.toast('De einddatum ligt voor de begindatum', 'fout');
    const acts = M.acts(S, pl.teamId, van, tot).filter((a) => !a.afgelast && new Date() < D.start(a) && !M.afm(S, pl.id, a.id));
    if (!acts.length) return CC.toast('In deze periode staat niets gepland', 'fout');
    const nu = new Date().toISOString();
    acts.forEach((a) => { S.afm.push({ id: 'f' + Date.now() + a.id, spelerId: pl.id, actId: a.id, reden: f.reden.value, opm: f.opm.value, tijd: nu, door: CC.me().id, periode: { van, tot } }); const v = S.vervoer[a.id]; if (v) delete v.plek[pl.id]; });
    const laat = acts.filter((a) => new Date() > M.deadline(S, a)).length;
    const t = M.team(S, pl.teamId);
    const basis = `${M.naam(S, pl)} is afgemeld van ${D.lang(van)} tot en met ${D.lang(tot)} (${f.reden.value.toLowerCase()}): ${acts.length} ${acts.length === 1 ? 'activiteit' : 'activiteiten'}.`;
    const v = CC.metToelichting([t.trainerId, t.teamleiderId], (id) => (id === t.teamleiderId ? 'teamleider' : 'trainer'));
    if (v.met.length) melding(S, v.met, `${pl.voornaam} afwezig ${D.kort(van)} – ${D.kort(tot)}`, basis + (f.opm.value ? ' ' + f.opm.value : ''));
    if (v.zonder.length) melding(S, v.zonder, `${pl.voornaam} afwezig ${D.kort(van)} – ${D.kort(tot)}`, basis);
    CC.save(); CC.closeSheet(); CC.render();
    CC.toast(`${acts.length} ${acts.length === 1 ? 'activiteit' : 'activiteiten'} afgemeld${laat ? ` (${laat} na de afmeldtermijn)` : ''}`);
  });

  // ---------- 2. Trainer kan zelf niet ----------
  const openVraag = (S, a) => a.trainerAfwezig && !a.vervangerId && !a.afgelast && a.datum >= D.vandaag();
  CC.vervangerRijen = (S, teamIds) => S.acts.filter((a) => teamIds.includes(a.teamId) && openVraag(S, a)).map((a) => {
    const tr = M.persoon(S, a.trainerAfwezig.door);
    return h.rij({ ic: 'user-cog', titel: `Trainer kan niet: ${a.teamId} ${D.relatief(a.datum).toLowerCase()} ${a.tijd}`, sub: `${esc(tr ? tr.naam : 'Trainer')}${a.trainerAfwezig.reden ? ' · ' + esc(a.trainerAfwezig.reden) : ''} · nog geen vervanger`, kleur: 'rood vraag',
      rechts: `<button class="knop klein" data-act="neemOver" data-id="${a.id}">Ik neem over</button><button class="knop klein licht rood-tekst" data-act="trainingAfgelasten" data-id="${a.id}">Afgelasten</button>` });
  });
  // Blok onder de trainingskaart van de trainer
  // Niet op Home (zou uitnodigen tot makkelijk afmelden); alleen ingeklapt bij de training zelf. Op Home alleen de status.
  CC.kanNietBlok = (S, a, alleenStatus) => {
    if (!a || a.soort !== 'training' || a.afgelast) return '';
    const me = CC.me(); const t = M.team(S, a.teamId);
    if (t.trainerId !== me.id) return '';
    if (!a.trainerAfwezig) return alleenStatus ? '' : `<details class="uitklap stil"><summary>Kun je zelf echt niet?</summary><p class="zacht klein">Het team rekent op je. Meld je alleen af als het niet anders kan: dit wordt vastgelegd${CC.trainerAfmeldSoort && CC.trainerAfmeldSoort(S, a) === 'telaat' ? ', en omdat de training binnen een dag begint, telt het als <b>te laat afgemeld</b>' : ''}.</p><button class="linkknop" data-act="kanNiet" data-id="${a.id}">Afmelden als trainer</button></details>`;
    const v = a.vervangerId && M.persoon(S, a.vervangerId);
    return `<div class="info ${v ? 'groen' : 'oranje'}">${icon(v ? 'circle-check' : 'hourglass')}<span>Je bent afgemeld als trainer. ${v ? `<b>${esc(v.naam)}</b> neemt de training over.` : 'Teamleider en HJO zijn gevraagd; nog geen vervanger.'} <button class="linkknop" data-act="kanToch" data-id="${a.id}">Ik kan toch</button>${v ? '' : ` · <button class="linkknop rood-tekst" data-act="trainingAfgelasten" data-id="${a.id}">Afgelasten</button>`}</span></div>`;
  };
  CC.on('kanNiet', (el) => {
    const S = CC.S(); const a = M.act(S, el.dataset.id);
    CC.sheet('Ik kan zelf niet', `<p class="zacht">${h.actTitel(S, a)} · ${D.lang(a.datum)} ${a.tijd} · ${esc(a.veld || '')}</p>
      <form data-submit="kanNietOk" data-id="${a.id}" class="codeform">
        <fieldset class="redenen"><legend>Wat wil je doen?</legend>
          <label class="reden"><input type="radio" name="k" value="vervanger" checked>${icon('user-cog')}<span>Vervanger zoeken</span></label>
          <label class="reden"><input type="radio" name="k" value="afgelast">${icon('ban')}<span>Training afgelasten</span></label></fieldset>
        <label for="kn-r">Reden</label><input id="kn-r" name="r" required placeholder="Bijv. werk, ziek">
        ${CC.trainerAfmeldSoort && CC.trainerAfmeldSoort(S, a) === 'telaat' ? `<div class="info oranje">${icon('clock')}<span>De training begint binnen een dag. Dit telt als <b>te laat afgemeld</b>.</span></div>` : ''}
        <button class="knop vol">Doorgeven</button>
        <p class="zacht klein">Vervanger zoeken: de teamleider en de ${esc(S.club.labels.hjo)} krijgen direct een melding, en ouders kunnen zich aanmelden via Taken. Lukt het niet, dan kun je later alsnog afgelasten; ouders krijgen dan een pushmelding.</p></form>`);
  });
  CC.on('kanNietOk', (f) => {
    const S = CC.S(); const a = M.act(S, f.dataset.id); const me = CC.me(); const t = M.team(S, a.teamId);
    // Besluit 21: afmelding van de trainer telt mee (op tijd of te laat)
    if (CC.trainerRegistreer && t.trainerId === me.id) CC.trainerRegistreer(S, a, me.id, CC.trainerAfmeldSoort(S, a), { reden: f.r.value, afgelast: f.k.value === 'afgelast' });
    if (f.k.value === 'afgelast') return afgelasten(S, a, f.r.value || 'trainer afwezig');
    a.trainerAfwezig = { door: me.id, reden: f.r.value, tijd: new Date().toISOString() }; a.vervangerId = null;
    S.taken.push({ id: 't' + Date.now(), actId: a.id, soort: CC.VERVANGER, personId: null });
    melding(S, [...M.stafVan(S, a.teamId, ['teamleider']), ...hjoIds(S)], `Vervanger nodig: ${a.teamId} ${D.kort(a.datum)}`, `${me.naam} kan de training van ${D.lang(a.datum)} om ${a.tijd} niet geven${f.r.value ? ' (' + f.r.value + ')' : ''}. Kun jij het overnemen? Open ClubComm en tik op "Ik neem over".`, true);
    CC.save(); CC.closeSheet(); CC.render(); CC.toast('Doorgegeven; teamleider en HJO zijn gevraagd');
  });
  const neemOver = (S, a, p) => {
    a.vervangerId = p.id; (S.trainerLog || []).filter((x) => x.actId === a.id).forEach((x) => { x.vervanger = true; });
    const taak = S.taken.find((x) => x.actId === a.id && x.soort === CC.VERVANGER); if (taak) taak.personId = p.id;
    melding(S, [a.trainerAfwezig && a.trainerAfwezig.door, M.team(S, a.teamId).teamleiderId], `${p.naam} neemt de training over`, `De training van ${a.teamId} op ${D.lang(a.datum)} om ${a.tijd} wordt gegeven door ${p.naam}.`);
  };
  CC.vervangerNeemOver = neemOver;
  // Voor staf die een training overneemt: rij op Home naar aanwezigheid opnemen
  CC.mijnVervangingen = (S) => { const me = CC.me(); return S.acts.filter((a) => a.vervangerId === me.id && a.datum >= D.vandaag() && !a.afgelast).map((a) => h.rij({ ic: 'user-cog', titel: `Jij geeft de training van ${a.teamId} ${D.relatief(a.datum).toLowerCase()} ${a.tijd}`, sub: `${esc(a.veld || '')} · aanwezigheid opnemen`, act: 'open', attrs: `data-view="opnemen" data-id="${a.id}"`, kleur: 'blauw' })); };
  CC.on('neemOver', (el) => { const S = CC.S(); neemOver(S, M.act(S, el.dataset.id), CC.me()); CC.save(); CC.render(); CC.toast('Top! Jij geeft deze training'); });
  CC.on('kanToch', (el) => {
    const S = CC.S(); const a = M.act(S, el.dataset.id); const v = a.vervangerId;
    a.trainerAfwezig = null; a.vervangerId = null; S.taken = S.taken.filter((x) => !(x.actId === a.id && x.soort === CC.VERVANGER));
    if (S.trainerLog) S.trainerLog = S.trainerLog.filter((x) => !(x.actId === a.id && x.soort !== 'niet'));
    if (v) melding(S, [v], 'Trainer kan toch', `De trainer geeft de training van ${a.teamId} op ${D.lang(a.datum)} toch zelf. Bedankt voor je hulp!`);
    CC.save(); CC.render(); CC.toast('Fijn! Je staat weer als trainer genoteerd');
  });
  const afgelasten = (S, a, reden) => {
    const t = M.team(S, a.teamId); const me = CC.me();
    a.afgelast = true; S.taken = S.taken.filter((x) => !(x.actId === a.id && x.soort === CC.VERVANGER && !x.personId));
    S.msgs.push({ id: 'b' + Date.now(), van: me.id, soort: 'nieuws', bereik: a.teamId, onderwerp: `Training ${D.kort(a.datum)} gaat niet door`, tekst: `De training van ${D.lang(a.datum)} om ${a.tijd} gaat niet door (${reden}). Excuses voor het ongemak.`, tijd: new Date().toISOString(), ontvangers: M.oudersVan(S, a.teamId), gelezen: [], antw: [], urgent: true, gepland: null, vastTot: null });
    melding(S, [...M.stafVan(S, a.teamId), ...hjoIds(S)].filter((x) => x !== me.id), `Afgelast: ${a.teamId} ${D.kort(a.datum)}`, `${me.naam} heeft de training van ${D.lang(a.datum)} afgelast (${reden}).`);
    S.wijzigingen.push({ id: 'w' + Date.now(), teamId: a.teamId, door: me.id, tekst: `Training ${D.kort(a.datum)} afgelast (${reden})`, tijd: new Date().toISOString() });
    CC.save(); CC.closeSheet(); CC.render(); CC.toast('Afgelast; ouders krijgen een pushmelding');
  };
  CC.on('trainingAfgelasten', (el) => { const S = CC.S(); const a = M.act(S, el.dataset.id); (S.trainerLog || []).filter((x) => x.actId === a.id).forEach((x) => { x.afgelast = true; }); afgelasten(S, a, 'geen trainer beschikbaar'); });

  // Demo: bij O9-1 kan de trainer overmorgen niet en is er nog geen vervanger (zichtbaar voor de HJO)
  const orig = CC.generate;
  const demo = (S) => {
    const a = S.acts.find((x) => x.teamId === 'O9-1' && x.soort === 'training' && x.datum > D.addDays(D.vandaag(), 0) && !x.afgelast);
    const t = S.teams.find((x) => x.id === 'O9-1');
    if (a && t && t.trainerId) { a.trainerAfwezig = { door: t.trainerId, reden: 'werk', tijd: new Date(Date.now() - 5 * 3600e3).toISOString() }; a.vervangerId = null; S.taken.push({ id: 'tv1', actId: a.id, soort: CC.VERVANGER, personId: null }); }
  };
  CC.generate = function () { const S = orig(); demo(S); S.vervangDemo = true; return S; };
  const S0 = CC.S(); if (!S0.vervangDemo) { demo(S0); S0.vervangDemo = true; CC.save(); }
})();
