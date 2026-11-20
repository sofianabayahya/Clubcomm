// ClubComm — Besluit NNN: wedstrijd verplaatsen of afgelasten, met één wedstrijd en drie standen.
// 1. Zelfde dag, andere tijd: de wedstrijd blijft met afmeldingen en taken; verzamelen schuift mee; binnen 7 dagen een bericht aan de ouders.
// 2. Andere dag (of "verplaatst, datum volgt"): afmeldingen, taken en vervoer van de oude dag vervallen (bewaard als vervallen,
//    niet gewist, Besluit 149) en de ouders krijgen altijd een bericht. Niemand wordt ongevraagd meegenomen naar een andere dag.
// 3. Afgelast: zoals Besluit 85/117, maar via Teams en via de teamleider hetzelfde (met bericht).
// Gebruikt door het scherm van de teamleider (teamleider.js) en door Teams → wedstrijd (teamsbeheer.js, Besluit 168).
(function () {
  const CC = window.CC; if (!CC) return; const M = CC.m, D = CC.date;
  const BINNEN = 7; // dagen: binnen deze termijn hebben ouders de tijd misschien al gezien
  const minuten = (t) => { const [h, m] = String(t || '').split(':').map(Number); return h * 60 + m; };
  CC.wedBinnen = (datum) => datum >= D.vandaag() && datum <= D.addDays(D.vandaag(), BINNEN);
  const eindVan = (S, a, tijd) => { const t = M.team(S, a.teamId) || {}; return CC.plusMin(tijd, CC.categorie(t.speelCat || t.cat).duur + 15); };
  // Verzamelen schuift mee met hetzelfde aantal minuten vóór de aftrap
  CC.wedVerzamelMee = (oudTijd, oudVerzamel, nieuwTijd) => {
    if (!oudVerzamel || !oudTijd || !nieuwTijd) return oudVerzamel || '';
    return CC.plusMin(nieuwTijd, -(((minuten(oudTijd) - minuten(oudVerzamel)) % 1440 + 1440) % 1440)); };

  // Wat bij de oude dag hoorde, vervalt: bewaard met een kenmerk, niet gewist
  const vervallen = (S, a, datumWas) => { const op = new Date().toISOString(); const n = { afm: 0, taken: 0, vervoer: 0 };
    (S.afm || []).filter((f) => f.actId === a.id).forEach((f) => { f.vervallen = { actId: a.id, datum: datumWas, op }; f.actId = null; n.afm++; });
    (S.taken || []).filter((t) => t.actId === a.id && t.personId && t.soort !== CC.VERVANGER).forEach((t) => { t.vervallen = { personId: t.personId, datum: datumWas, op }; t.personId = null; n.taken++; });
    const v = (S.vervoer || {})[a.id];
    if (v && ((v.aanbod || []).length || Object.keys(v.plek || {}).length || Object.keys(v.vraag || {}).length)) {
      n.vervoer = (v.aanbod || []).length; (a.vervallenVervoer || (a.vervallenVervoer = [])).push({ datum: datumWas, op, vervoer: v }); delete S.vervoer[a.id]; }
    return n; };
  CC.wedVervallenTekst = (n) => [n.afm ? `${n.afm} ${n.afm === 1 ? 'afmelding' : 'afmeldingen'}` : '', n.taken ? `${n.taken} ${n.taken === 1 ? 'taak' : 'taken'}` : '', n.vervoer ? `${n.vervoer}× vervoer` : ''].filter(Boolean).join(', ');
  CC.wedTelVervallen = (S, a) => ({ afm: (S.afm || []).filter((f) => f.actId === a.id).length, taken: (S.taken || []).filter((t) => t.actId === a.id && t.personId && t.soort !== CC.VERVANGER).length,
    vervoer: (((S.vervoer || {})[a.id] || {}).aanbod || []).length });

  // Bericht aan de ouders (zoals bij afgelasten: nieuws, urgent, vervalt na de wedstrijd) en ter informatie aan de trainer
  const bericht = (S, a, onderwerp, tekst, al = []) => { const me = CC.me(); const nu = new Date().toISOString(); const t = M.team(S, a.teamId) || {};
    S.msgs.push({ id: `b${Date.now()}`, van: me.id, soort: 'nieuws', verloopt: a.datum, bereik: a.teamId, onderwerp, tekst, tijd: nu, ontvangers: M.oudersVan(S, a.teamId), gelezen: [], antw: [], urgent: true, gepland: null, actId: a.id });
    if (t.trainerId && t.trainerId !== me.id && !al.includes(t.trainerId)) S.msgs.push({ id: `b${Date.now()}t`, van: 'systeem', soort: 'melding', bereik: 'Ter informatie', onderwerp: `${CC.tn(a.teamId)}: ${onderwerp.toLowerCase()}`, tekst: `${me.naam}: ${tekst} Je hoeft niets te doen.`, tijd: nu, ontvangers: [t.trainerId], gelezen: [], antw: [], urgent: false, gepland: null });
    (S.wijzigingen || (S.wijzigingen = [])).push({ id: `w${Date.now()}`, teamId: a.teamId, door: me.id, tekst, tijd: nu }); };
  const wieTegen = (a) => `${a.thuis === false ? 'uit bij' : 'thuis tegen'} ${a.tegen || 'de tegenstander'}`;

  // Opslaan: nieuw = { datum, tijd, verzamel, adres, verzamelpunt, tegen, thuis, veld } (alleen wat het scherm heeft); opties.bericht = ouders inlichten
  // Geeft terug: { andereDag, vervallen, bericht } zodat het scherm de juiste melding toont.
  CC.wedOpslaan = (S, a, nieuw, opties = {}) => {
    const oud = { datum: a.datum, tijd: a.tijd, verzamel: a.verzamel || '', adres: a.adres || '', verplaatst: !!a.verplaatst };
    const datum = nieuw.datum || a.datum, tijd = nieuw.tijd || a.tijd;
    const andereDag = datum !== oud.datum || oud.verplaatst;
    // Datum, aftrap en een begeleidingsmoment via de bestaande weg (Besluit 168: moment schuift mee, bericht aan die trainer)
    const velden = { datum, tijd }; ['tegen', 'thuis', 'veld'].forEach((k) => { if (nieuw[k] !== undefined) velden[k] = nieuw[k]; });
    const voor = S.msgs.length; // wie al een bericht kreeg over het begeleidingsmoment, krijgt geen tweede (Principe 10)
    // Verzamelen: CC.wedWijzig laat het meeschuiven (en bij thuis/uit gewisseld de clubregel, #172); een zelf ingevulde tijd gaat voor
    if (CC.wedWijzig) CC.wedWijzig(S, a, velden); else { Object.assign(a, velden); a.verzamel = CC.wedVerzamelMee(oud.tijd, oud.verzamel, tijd); }
    if (!a.eind || tijd !== oud.tijd) a.eind = eindVan(S, a, tijd);
    if (nieuw.verzamel !== undefined && nieuw.verzamel !== oud.verzamel) a.verzamel = nieuw.verzamel;
    const tijdAnders = tijd !== oud.tijd || (a.verzamel || '') !== oud.verzamel;
    if (nieuw.adres !== undefined) a.adres = nieuw.adres; if (nieuw.verzamelpunt !== undefined) a.verzamelpunt = nieuw.verzamelpunt;
    let n = { afm: 0, taken: 0, vervoer: 0 };
    if (andereDag) { if (!oud.verplaatst) n = vervallen(S, a, oud.datum); if (oud.verplaatst) { a.afgelast = false; delete a.verplaatst; } }
    if (andereDag || tijdAnders) a.wijziging = { op: new Date().toISOString(), datumWas: andereDag ? (oud.verplaatst ? (a.wijziging || {}).datumWas || oud.datum : oud.datum) : null, tijdWas: oud.tijd, verzamelWas: oud.verzamel };
    // Bericht: bij een andere dag altijd; bij een andere tijd of plek alleen als gevraagd
    const plekAnders = nieuw.adres !== undefined && nieuw.adres !== oud.adres;
    const stuur = andereDag || (opties.bericht && (tijdAnders || plekAnders));
    if (stuur) {
      const regels = [`Verzamelen ${a.verzamel || '–'}${oud.verzamel && oud.verzamel !== a.verzamel ? ` (was ${oud.verzamel})` : ''}, aftrap ${a.tijd}${oud.tijd !== a.tijd ? ` (was ${oud.tijd})` : ''}.`];
      if (plekAnders && a.adres) regels.push(`Adres: ${a.adres}.`);
      if (andereDag) regels.push('Kan je kind niet op de nieuwe dag? Meld het opnieuw af in ClubComm. Taken en vervoer worden opnieuw gevraagd.');
      bericht(S, a, andereDag ? `Wedstrijd verplaatst naar ${D.kort(a.datum)}` : `Wedstrijd ${D.kort(a.datum)}: andere tijd`,
        `${andereDag ? `De wedstrijd ${wieTegen(a)} is verplaatst${oud.verplaatst ? '' : ` van ${D.lang(oud.datum)}`} naar ${D.lang(a.datum)}.` : `Gewijzigd: de wedstrijd van ${D.lang(a.datum)} (${wieTegen(a)}).`}\n${regels.join('\n')}`, S.msgs.slice(voor).flatMap((m) => m.ontvangers || []));
    }
    return { andereDag, vervallen: n, bericht: stuur };
  };

  // Verplaatst, nieuwe datum volgt: telt als niet gespeeld (zoals afgelast), wat bij de dag hoorde vervalt, ouders krijgen bericht
  CC.wedDatumVolgt = (S, a) => { const n = vervallen(S, a, a.datum);
    a.afgelast = true; a.verplaatst = { op: new Date().toISOString(), datumWas: a.datum }; a.wijziging = { op: a.verplaatst.op, datumWas: a.datum, tijdWas: a.tijd, verzamelWas: a.verzamel || '' };
    bericht(S, a, 'Wedstrijd verplaatst, datum volgt', `De wedstrijd van ${D.lang(a.datum)} (${wieTegen(a)}) gaat die dag niet door. De nieuwe datum volgt; je krijgt dan een bericht. Je hoeft nu niets te doen.`);
    return n; };
  // "Gaat toch door" na afgelast (via Teams): ouders weer inlichten
  CC.wedGaatDoor = (S, a) => { a.afgelast = false; delete a.verplaatst;
    bericht(S, a, 'Wedstrijd gaat toch door', `De wedstrijd van ${D.lang(a.datum)} (${wieTegen(a)}) gaat toch door. Verzamelen ${a.verzamel || '–'}, aftrap ${a.tijd}.`); };

  // Label voor de ouder: "Gewijzigd op 12 nov · was 12:45" of "Verplaatst · was za 14 nov" (tot na de wedstrijd)
  CC.wedLabel = (a) => { if (!a || !M.isWed(a)) return '';
    if (a.verplaatst) return '<span class="wed-label grijs">Verplaatst · nieuwe datum volgt</span>';
    const w = a.wijziging; if (!w || a.afgelast || a.datum < D.vandaag()) return '';
    if (w.datumWas && w.datumWas !== a.datum) return `<span class="wed-label">Verplaatst · was ${CC.esc(D.kort(w.datumWas))}</span>`;
    if (w.tijdWas && w.tijdWas !== a.tijd) return `<span class="wed-label">Gewijzigd op ${CC.esc(D.kort(w.op.slice(0, 10)))} · was ${CC.esc(w.tijdWas)}</span>`;
    return ''; };

  // ---------- Scherm van de teamleider: live de verzameltijd en wat er vervalt laten zien ----------
  CC.on('wiWijzig', (el) => { const f = el.form; if (!f) return; const S = CC.S(); const a = M.act(S, f.dataset.id); if (!a) return;
    const tijd = f.tijd && f.tijd.value; const datum = f.datum && f.datum.value; const hint = f.querySelector('[data-wi-hint]'); const knop = f.querySelector('[data-wi-knop]');
    if (el.name === 'tijd' && f.verzamel && tijd && (f.verzamel.dataset.oud || '') === (a.verzamel || '') && f.verzamel.value === (f.verzamel.dataset.vorig || a.verzamel || '')) {
      f.verzamel.value = CC.wedVerzamelMee(a.tijd, a.verzamel, tijd); f.verzamel.dataset.vorig = f.verzamel.value; }
    const andereDag = (datum && datum !== a.datum) || a.verplaatst; const n = CC.wedTelVervallen(S, a); const wat = CC.wedVervallenTekst(n);
    if (hint) hint.innerHTML = andereDag
      ? `<span><b>Andere dag.</b> ${wat ? `Wat bij ${CC.esc(D.kort(a.datum))} hoorde, vervalt: ${CC.esc(wat)}. ` : ''}De ouders krijgen een bericht en geven het opnieuw door.</span>`
      : tijd && tijd !== a.tijd ? `Was <b>${CC.esc(a.tijd)}</b>. Verzamelen schuift mee: <b>${CC.esc(f.verzamel ? f.verzamel.value : '')}</b>${a.verzamel ? ` (was ${CC.esc(a.verzamel)})` : ''}. Zelfde dag: afmeldingen en taken blijven staan.` : '';
    if (hint) hint.className = andereDag ? 'info oranje' : 'zacht klein';
    if (knop) knop.textContent = andereDag || CC.wedBinnen(datum || a.datum) ? 'Opslaan en ouders inlichten' : 'Opslaan';
    const stil = f.querySelector('[data-wi-stil]'); if (stil) stil.hidden = !!andereDag; });
})();
