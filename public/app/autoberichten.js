// ClubComm prototype — Besluit 26: vaste berichten bij de jaarplanning.
// Eén keer per seizoen instellen; de datums komen uit de jaarplanning (vakanties, fases, beoordelingen, seizoen).
// Standaard zet ClubComm het bericht klaar en verstuurt de HJO het met één tik ("mensen beslissen"); automatisch kan ook.
(function () {
  const CC = window.CC; const D = CC.date, M = CC.m, h = CC.h, icon = CC.icon, esc = CC.esc;

  const STANDAARD = [
    { id: 'vakantie', naam: 'Voor elke vakantie', wanneer: 'Eerste dag van de vakantie', dagen: 3, onderwerp: 'Geen training in de [vakantie]', tekst: 'Vanaf [datum] is het [vakantie] en is er geen training. We trainen weer vanaf [terug]. Fijne vakantie!' },
    { id: 'fase', naam: 'Nieuwe fase', wanneer: 'Start van fase 2, 3 en 4', dagen: 0, onderwerp: '[fase] begint', tekst: 'Vandaag begint [fase]. De kaarten beginnen weer op nul. Kan je kind een keer niet? Meld het op tijd af in ClubComm.' },
    { id: 'beoordeling', naam: 'Beoordelingen en ontwikkelgesprekken', wanneer: 'Start van het beoordelingsmoment', dagen: 7, onderwerp: 'Ontwikkelgesprekken [moment]', tekst: 'Van [datum] tot [tot] beoordelen de trainers de spelers en houden ze een ontwikkelgesprek met ouder en kind. Je krijgt van de trainer een bericht om een tijd te kiezen.' },
    { id: 'start', naam: 'Start van het seizoen', wanneer: 'Eerste dag van het seizoen', dagen: 7, onderwerp: 'Het seizoen begint op [datum]', tekst: 'Op [datum] beginnen we weer! In ClubComm zie je de trainingen, meld je af als je kind niet kan en regel je vervoer. Zet de trainingen in je eigen agenda via Planning.' },
    { id: 'eind', naam: 'Einde van het seizoen', wanneer: 'Laatste dag van het seizoen', dagen: 7, onderwerp: 'Laatste week van het seizoen', tekst: 'Op [datum] sluiten we het seizoen af. Bedankt voor alle hulp, het rijden en het meedenken dit jaar!' },
  ];
  const lijst = (S) => { const l = S.club.autoBerichten || (S.club.autoBerichten = STANDAARD.map((x) => ({ ...x, aan: true, auto: false }))); STANDAARD.forEach((x) => { if (!l.find((y) => y.id === x.id)) l.push({ ...x, aan: true, auto: false }); }); return l; };

  // Alle momenten dit seizoen, met de gegevens om de tekst in te vullen
  const momenten = (S) => {
    const c = S.club; const res = [];
    const eersteTraining = (na) => { const a = S.acts.filter((x) => x.soort === 'training' && !x.afgelast && x.datum > na).sort((x, y) => x.datum.localeCompare(y.datum))[0]; return a ? D.lang(a.datum) : D.lang(D.addDays(na, 1)); };
    c.vakanties.filter((v) => !v.trainen && v.van <= c.seizoen.eind && v.van >= c.seizoen.start).forEach((v) => res.push({ sjabloon: 'vakantie', id: 'vakantie-' + v.id, datum: v.van, titel: v.naam, vars: { vakantie: v.naam.toLowerCase(), datum: D.lang(v.van), terug: eersteTraining(v.tot) } }));
    M.blokken(S).slice(1).forEach((b) => res.push({ sjabloon: 'fase', id: 'fase-' + b.nr, datum: b.van, titel: b.naam, vars: { fase: b.naam, datum: D.lang(b.van) } }));
    (CC.momenten ? CC.momenten(S) : []).forEach((m) => res.push({ sjabloon: 'beoordeling', id: 'beoordeling-' + m.id, datum: m.van, titel: `Beoordeling ${m.naam.toLowerCase()}`, vars: { moment: m.naam.toLowerCase(), datum: D.lang(m.van), tot: D.lang(m.tot) } }));
    res.push({ sjabloon: 'start', id: 'start-' + c.seizoen.start, datum: c.seizoen.start, titel: 'Start seizoen', vars: { datum: D.lang(c.seizoen.start) } });
    res.push({ sjabloon: 'eind', id: 'eind-' + c.seizoen.eind, datum: c.seizoen.eind, titel: 'Einde seizoen', vars: { datum: D.lang(c.seizoen.eind) } });
    return res.map((m) => { const sj = lijst(S).find((x) => x.id === m.sjabloon); return { ...m, sj, klaar: D.addDays(m.datum, -sj.dagen) }; }).sort((a, b) => a.datum.localeCompare(b.datum));
  };
  const vul = (t, vars) => t.replace(/\[(\w+)\]/g, (x, k) => (vars[k] != null ? vars[k] : x));
  const status = (S) => S.autoVerstuurd || (S.autoVerstuurd = {});
  const aanDeBeurt = (S) => { const v = D.vandaag(); return momenten(S).filter((m) => m.sj.aan && !status(S)[m.id] && m.klaar <= v && m.datum >= v); };

  const verstuur = (S, m, onderwerp, tekst, van) => {
    S.msgs.push({ id: 'b' + Date.now() + Math.random().toString(36).slice(2, 5), van, soort: 'nieuws', bereik: 'Hele club', onderwerp, tekst, tijd: new Date().toISOString(), gepland: null, ontvangers: S.people.map((p) => p.id).filter((x) => x !== van), gelezen: [], antw: [], urgent: false, vastTot: null });
    status(S)[m.id] = { tijd: new Date().toISOString(), door: van };
  };

  // Te doen op Home van wie clubberichten stuurt
  CC.autoBerichtRijen = (S) => {
    if (!CC.mag('clubbericht')) return [];
    const nu = aanDeBeurt(S);
    const auto = nu.filter((m) => m.sj.auto); if (auto.length) { auto.forEach((m) => verstuur(S, m, vul(m.sj.onderwerp, m.vars), vul(m.sj.tekst, m.vars), CC.me().id)); CC.save(); }
    return nu.filter((m) => !m.sj.auto).map((m) => h.rij({ ic: 'megaphone', titel: `Bericht klaar: ${esc(m.titel)}`, sub: `${esc(vul(m.sj.onderwerp, m.vars))} · nakijken en versturen`, kleur: 'blauw', act: 'autoConcept', attrs: `data-id="${esc(m.id)}"` }));
  };
  CC.on('autoConcept', (el) => {
    const S = CC.S(); const m = momenten(S).find((x) => x.id === el.dataset.id);
    CC.sheet(`Bericht: ${m.titel}`, `<form data-submit="autoVerstuur" data-id="${esc(m.id)}" class="codeform">
      <p class="zacht klein">Klaargezet door ClubComm (${esc(m.sj.naam.toLowerCase())}). Klopt het nog? Pas het gerust aan.</p>
      <label for="ab-o">Onderwerp</label><input id="ab-o" name="o" value="${esc(vul(m.sj.onderwerp, m.vars))}" required>
      <label for="ab-t">Tekst</label><textarea id="ab-t" name="t" rows="6" required>${esc(vul(m.sj.tekst, m.vars))}</textarea>
      <button class="knop vol">${icon('send')}Versturen aan de hele club</button>
      <button type="button" class="knop licht vol" data-act="autoOverslaan" data-id="${esc(m.id)}">Deze keer overslaan</button></form>`, { groot: true });
  });
  CC.on('autoVerstuur', (f) => { const S = CC.S(); const m = momenten(S).find((x) => x.id === f.dataset.id); verstuur(S, m, f.o.value, f.t.value, CC.me().id); CC.save(); CC.closeSheet(); CC.render(); CC.toast('Verstuurd aan de hele club'); });
  CC.on('autoOverslaan', (el) => { const S = CC.S(); status(S)[el.dataset.id] = { overgeslagen: true, tijd: new Date().toISOString(), door: CC.me().id }; CC.save(); CC.closeSheet(); CC.render(); CC.toast('Overgeslagen'); });

  // Instellen: bij Planning
  CC.views.autoBerichten = (S) => {
    const v = D.vandaag(); const ms = momenten(S);
    return { titel: 'Vaste berichten', html: `<p class="zacht">Berichten die elk seizoen terugkomen. De datums komen uit de jaarplanning. Standaard zet ClubComm het bericht op de dag zelf <b>klaar</b> bij Te doen; jij kijkt het na en verstuurt het met één tik.</p>
      <div class="lijst">${lijst(S).map((x) => `<details class="uitklap"><summary><b>${esc(x.naam)}</b> <small class="zacht">${x.aan ? `${x.dagen ? `${x.dagen} ${x.dagen === 1 ? 'dag' : 'dagen'} voor` : 'op'} ${esc(x.wanneer.toLowerCase())} · ${x.auto ? 'automatisch' : 'klaarzetten'}` : 'uit'}</small></summary>
        <form data-submit="autoSjabloon" data-id="${x.id}" class="codeform">
          <label class="schakel"><span>Aan</span><input type="checkbox" name="aan" ${x.aan ? 'checked' : ''}><i></i></label>
          <div class="twee"><div><label for="as-d-${x.id}">Dagen van tevoren</label><input id="as-d-${x.id}" name="d" type="number" min="0" max="30" value="${x.dagen}"></div>
          <div><label for="as-m-${x.id}">Versturen</label><select id="as-m-${x.id}" name="m"><option value="0" ${x.auto ? '' : 'selected'}>Klaarzetten, ik verstuur</option><option value="1" ${x.auto ? 'selected' : ''}>Automatisch</option></select></div></div>
          <label for="as-o-${x.id}">Onderwerp</label><input id="as-o-${x.id}" name="o" value="${esc(x.onderwerp)}">
          <label for="as-t-${x.id}">Tekst</label><textarea id="as-t-${x.id}" name="t" rows="4">${esc(x.tekst)}</textarea>
          <p class="zacht klein">Woorden tussen [haken] vult ClubComm zelf in, zoals [vakantie], [datum] en [terug].</p>
          <button class="knop licht klein">Opslaan</button></form></details>`).join('')}</div>
      ${h.sectie('Dit seizoen')}<div class="lijst compact">${ms.filter((m) => m.sj.aan).map((m) => { const st = status(S)[m.id]; return h.rij({ ic: h.datumBlok({ datum: m.datum }), titel: esc(m.titel), sub: st ? (st.overgeslagen ? 'Overgeslagen' : `Verstuurd ${D.tijdstip(st.tijd)}`) : m.datum < v ? 'Voorbij' : `${m.sj.auto ? 'Gaat automatisch' : 'Klaar'} op ${D.kort(m.klaar)}`, rechts: !st && m.datum >= v && m.klaar > v ? `<button class="knop klein licht" data-act="autoConcept" data-id="${esc(m.id)}">Nu al</button>` : '' }); }).join('')}</div>` };
  };
  CC.on('autoSjabloon', (f) => { const S = CC.S(); const x = lijst(S).find((y) => y.id === f.dataset.id); Object.assign(x, { aan: f.aan.checked, dagen: Number(f.d.value), auto: f.m.value === '1', onderwerp: f.o.value, tekst: f.t.value }); CC.save(); CC.render(); CC.toast('Opgeslagen'); });

  const origPlanning = CC.rollen.hjo.schermen.planning;
  CC.rollen.hjo.schermen.planning = (S) => {
    const vol = momenten(S).find((m) => m.sj.aan && !status(S)[m.id] && m.datum >= D.vandaag());
    return (CC.mag('clubbericht') ? `<div class="lijst">${h.rij({ ic: 'megaphone', titel: 'Vaste berichten bij de jaarplanning', sub: vol ? `Volgende: ${esc(vol.titel)} (${D.kort(vol.klaar)})` : 'Vakanties, fases, beoordelingen, seizoen', act: 'open', attrs: 'data-view="autoBerichten"' })}</div>` : '') + origPlanning(S);
  };
})();
