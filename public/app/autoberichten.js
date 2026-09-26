// ClubComm — Communicatieplan (Besluit 26, herzien in Besluit 36).
// Drie soorten berichten: aankondigingen (nieuw, door een mens), herinneringen (bekend, uit de jaarplanning; automatisch)
// en noodberichten (nu, met één tik). Eén keer per seizoen instellen; eigen vaste berichten kun je gedurende het jaar toevoegen.
// Automatische berichten komen niet in het berichtencentrum of op Home van de HJO; ze staan in het Communicatieplan.
(function () {
  const CC = window.CC; const D = CC.date, M = CC.m, h = CC.h, icon = CC.icon, esc = CC.esc;
  const KEUZE = [14, 7, 3, 2, 1, 0];

  const STANDAARD = [
    { id: 'start', naam: 'Start van het seizoen', wanneer: 'de eerste training', schema: [14, 2], onderwerp: 'Het seizoen begint op [datum]', tekst: 'Op [datum] beginnen we weer! In ClubComm zie je de trainingen en meld je af als je kind niet kan. Zet de trainingen in je eigen agenda via Planning.\n\nAfmelden gaat altijd via de app, op tijd. Vergeten? De eerste keren krijg je een vriendelijke herinnering. Daarna geldt, net als op het veld: te laat afgemeld is geel, twee keer geel is rood, en niet afgemeld is rood. Bij rood neemt de trainer even contact op. Kan je zelf een keer niet rijden naar een uitwedstrijd? Vraag dan vervoer bij Vervoer.' },
    { id: 'vakantie', naam: 'Vakantie: geen training', wanneer: 'de eerste vakantiedag', schema: [7], onderwerp: 'Geen training in de [vakantie]', tekst: 'Van [datum] tot en met [tot] is het [vakantie]. Er is dan geen training. We trainen weer vanaf [terug]. Fijne vakantie!' },
    { id: 'terug', naam: 'Na de vakantie: we trainen weer', wanneer: 'de eerste training na een vakantie', schema: [2], onderwerp: 'We trainen weer vanaf [datum]', tekst: 'De [vakantie] is voorbij: vanaf [datum] trainen we weer. Kan je kind nog niet? Meld het even af in ClubComm.' },
    { id: 'vrijedag', naam: 'Vrije dag of club dicht', wanneer: 'de vrije dag (bijv. Goede Vrijdag)', schema: [7], onderwerp: '[naam]: geen training', tekst: 'Op [datum] is er geen training ([naam]).' },
    { id: 'wedstrijden', naam: 'De wedstrijden beginnen', wanneer: 'de eerste wedstrijd van een fase', schema: [7], onderwerp: 'De wedstrijden beginnen weer', tekst: 'Vanaf [datum] spelen we weer wedstrijden. Het programma staat in ClubComm bij Planning. Kan je kind een keer niet? Meld het op tijd af.' },
    { id: 'beoordeling', naam: 'Ontwikkelgesprekken', wanneer: 'de start van het beoordelingsmoment', schema: [7], onderwerp: 'Ontwikkelgesprekken [moment]', tekst: 'Van [datum] tot [tot] houden de trainers een kort ontwikkelgesprek met ouder en kind (15 minuten, rond de training). Je krijgt een bericht om een tijd te kiezen, en daarna een korte opdracht voor je kind: waar ben je sterk in, wat is je wapen, wat wil je leren?' },
    { id: 'eind', naam: 'Einde van het seizoen', wanneer: 'de laatste dag van het seizoen', schema: [14], onderwerp: 'Het seizoen loopt af', tekst: 'Op [datum] sluiten we het seizoen af. Bedankt voor alle hulp, het rijden en het meedenken dit jaar!' },
  ];
  // Noodberichten: altijd urgent; waar nodig worden de activiteiten van die dag afgelast
  CC.NOOD = [
    { id: 'rood', naam: 'Code rood: alles afgelast', afgelast: 'alles', onderwerp: 'Code rood: alles gaat niet door', tekst: 'Vanwege code rood gaan op [datum] alle trainingen en wedstrijden niet door. Blijf veilig thuis.' },
    { id: 'oranje', naam: 'Code oranje: mogelijk afgelast', afgelast: '', onderwerp: 'Code oranje: let op je berichten', tekst: 'Er geldt code oranje. Uiterlijk om [tijd] laten we weten of de trainingen van [datum] doorgaan.' },
    { id: 'velden', naam: 'Velden afgekeurd', afgelast: 'thuis', onderwerp: 'Velden afgekeurd: geen training', tekst: 'De velden zijn afgekeurd. Op [datum] gaan de trainingen en thuiswedstrijden niet door.' },
    { id: 'dicht', naam: 'Club onverwacht dicht', afgelast: 'thuis', onderwerp: 'De club is dicht op [datum]', tekst: 'Door [reden] is de club op [datum] dicht. Alle trainingen en thuiswedstrijden gaan niet door.' },
  ];

  const lijst = (S) => {
    const l = S.club.autoBerichten || (S.club.autoBerichten = []);
    // oude opslag (één termijn, 'fase') omzetten
    l.forEach((x) => { if (!x.schema) x.schema = x.dagen != null ? [x.dagen] : [7]; });
    const weg = l.findIndex((x) => x.id === 'fase'); if (weg >= 0) l.splice(weg, 1);
    STANDAARD.forEach((x) => { if (!l.find((y) => y.id === x.id)) l.push({ ...x, schema: [...x.schema], aan: true, auto: true, mail: true }); });
    l.forEach((x) => { if (x.mail == null) x.mail = true; });
    // Besluit 74: verouderde standaardtekst over ontwikkelgesprekken bijwerken (alleen als de club hem niet zelf veranderde)
    l.forEach((x) => { if (x.id === 'beoordeling' && /beoordelen de trainers de spelers/.test(x.tekst || '')) { const st = STANDAARD.find((y) => y.id === 'beoordeling'); x.tekst = st.tekst; x.naam = st.naam; } });
    return l;
  };
  const status = (S) => S.autoVerstuurd || (S.autoVerstuurd = {});
  const vul = (t, vars) => String(t).replace(/\[(\w+)\]/g, (x, k) => (vars[k] != null ? vars[k] : x));
  const schemaTekst = (s) => (s || []).length ? [...s].sort((a, b) => b - a).map((d) => (d ? `${d} ${d === 1 ? 'dag' : 'dagen'}` : 'op de dag')).join(' en ') : 'geen';

  // Alle momenten van dit seizoen, en per moment één zending per gekozen termijn
  const zendingen = (S) => {
    const c = S.club; const res = [];
    const eersteTraining = (na) => S.acts.filter((x) => x.soort === 'training' && !x.afgelast && x.datum > na).sort((x, y) => x.datum.localeCompare(y.datum))[0];
    [...(c.vakanties || []), ...(c.stops || [])].filter((v) => !v.trainen && v.van >= c.seizoen.start && v.van <= c.seizoen.eind).forEach((v) => {
      if (D.dagen(v.van, v.tot) >= 3) {
        const t = eersteTraining(v.tot);
        res.push({ sjabloon: 'vakantie', id: 'vakantie-' + v.id, datum: v.van, titel: v.naam, vars: { vakantie: v.naam.toLowerCase(), datum: D.lang(v.van), tot: D.lang(v.tot), terug: D.lang(t ? t.datum : D.addDays(v.tot, 1)) } });
        if (t) res.push({ sjabloon: 'terug', id: 'terug-' + v.id, datum: t.datum, titel: `Terug na de ${v.naam.toLowerCase()}`, vars: { vakantie: v.naam.toLowerCase(), datum: D.lang(t.datum) } });
      } else res.push({ sjabloon: 'vrijedag', id: 'vrij-' + v.id, datum: v.van, titel: v.naam, vars: { naam: v.naam, datum: D.lang(v.van) } });
    });
    M.blokken(S).forEach((b) => { const w = S.acts.filter((a) => M.isWed(a) && !a.afgelast && a.datum >= b.van && a.datum <= b.tot).sort((x, y) => x.datum.localeCompare(y.datum))[0]; if (w) res.push({ sjabloon: 'wedstrijden', id: 'wed-' + b.nr, datum: w.datum, titel: `Wedstrijden ${b.naam.toLowerCase()}`, vars: { datum: D.lang(w.datum), fase: b.naam } }); });
    (CC.momenten ? CC.momenten(S) : []).forEach((m) => res.push({ sjabloon: 'beoordeling', id: 'beoordeling-' + (m.basisId || m.id), datum: m.van, titel: `Beoordeling ${m.naam.toLowerCase()}`, vars: { moment: m.naam.toLowerCase(), datum: D.lang(m.van), tot: D.lang(m.tot) } }));
    // Eerste training van het seizoen; ligt die veel later (club halverwege het seizoen ingericht), dan geldt de startdatum en gaat er geen startbericht meer uit
    const t0 = eersteTraining(D.addDays(c.seizoen.start, -1)); const start = t0 && D.dagen(c.seizoen.start, t0.datum) <= 14 ? t0.datum : c.seizoen.start;
    res.push({ sjabloon: 'start', id: 'start-' + c.seizoen.start, datum: start, titel: 'Start seizoen', vars: { datum: D.lang(start) } });
    res.push({ sjabloon: 'eind', id: 'eind-' + c.seizoen.eind, datum: c.seizoen.eind, titel: 'Einde seizoen', vars: { datum: D.lang(c.seizoen.eind) } });
    lijst(S).filter((x) => x.eigen && x.datum).forEach((x) => res.push({ sjabloon: x.id, id: 'eigen-' + x.id, datum: x.datum, titel: x.naam, vars: { datum: D.lang(x.datum) } }));
    return res.flatMap((m) => { const sj = lijst(S).find((x) => x.id === m.sjabloon); return sj ? (sj.schema || []).map((d) => ({ ...m, sj, dagen: d, zid: `${m.id}@${d}`, klaar: D.addDays(m.datum, -d) })) : []; })
      .sort((a, b) => a.klaar.localeCompare(b.klaar));
  };
  // Aan de beurt: per moment alleen de laatste (dichtstbijzijnde) termijn, de eerdere worden overgeslagen
  const aanDeBeurt = (S) => {
    const v = D.vandaag(); const nu = zendingen(S).filter((z) => z.sj.aan && !status(S)[z.zid] && z.klaar <= v && z.datum >= v);
    const per = {}; nu.forEach((z) => { if (!per[z.id] || z.dagen < per[z.id].dagen) per[z.id] = z; });
    nu.filter((z) => per[z.id] !== z).forEach((z) => { status(S)[z.zid] = { overgeslagen: true, tijd: new Date().toISOString(), door: 'systeem' }; });
    return Object.values(per);
  };
  const clubOntvangers = (S, van) => S.people.map((p) => p.id).filter((x) => x !== van);
  const verstuur = (S, zs, onderwerp, tekst, van, urgent) => {
    S.msgs.push({ id: 'b' + Date.now() + Math.random().toString(36).slice(2, 6), van, soort: 'nieuws', bereik: 'Hele club', onderwerp, tekst, tijd: new Date().toISOString(), gepland: null, ontvangers: clubOntvangers(S, van), gelezen: [], antw: [], urgent: !!urgent, vastTot: null, auto: van === 'systeem', herinnering: true, mail: zs.some((z) => z.sj.mail !== false) });
    zs.forEach((z) => { status(S)[z.zid] = { tijd: new Date().toISOString(), door: van }; });
  };
  const magClub = () => (CC.me() && CC.me().rollen || []).some((r) => r.rol === 'beheerder' || CC.mag('clubbericht', r.rol));
  CC.magClubberichten = magClub;

  // Automatisch versturen, zodra iemand met clubrechten de app opent (in versie 2 doet de server dit elke ochtend).
  // Vallen er meerdere tegelijk, dan worden ze gebundeld tot één bericht.
  let laatst = 0;
  const autoRun = () => {
    const S = CC.S(); if (!S || !CC.me() || Date.now() - laatst < 60e3) return; laatst = Date.now();
    let veranderd = false;
    if (magClub()) {
      const auto = aanDeBeurt(S).filter((z) => z.sj.auto);
      if (auto.length === 1) { const z = auto[0]; verstuur(S, auto, vul(z.sj.onderwerp, z.vars), vul(z.sj.tekst, z.vars), 'systeem'); veranderd = true; }
      else if (auto.length > 1) { verstuur(S, auto, 'Goed om te weten', auto.map((z) => `${vul(z.sj.onderwerp, z.vars)}\n${vul(z.sj.tekst, z.vars)}`).join('\n\n'), 'systeem'); veranderd = true; }
    }
    if (CC.activiteitHerinneringen && CC.activiteitHerinneringen(S)) veranderd = true;
    if (veranderd) CC.save();
  };
  const origRender = CC.render;
  CC.render = () => { try { autoRun(); } catch (e) { console.error(e); } return origRender(); };

  // Home van de HJO: hooguit één regel, alleen voor berichten die op "klaarzetten" staan
  CC.autoBerichtRijen = (S) => {
    if (!magClub()) return [];
    const nu = aanDeBeurt(S).filter((z) => !z.sj.auto);
    return nu.length ? [h.rij({ ic: 'megaphone', titel: `${nu.length} ${nu.length === 1 ? 'bericht' : 'berichten'} klaar om te versturen`, sub: nu.map((z) => esc(z.titel)).join(', '), act: 'open', attrs: 'data-view="autoKlaar"' })] : [];
  };
  CC.views.autoKlaar = (S) => ({ titel: 'Klaar om te versturen', html: `<p class="zacht klein">Deze berichten staan op "klaarzetten": kijk ze na en verstuur ze met één tik.</p><div class="lijst">${aanDeBeurt(S).filter((z) => !z.sj.auto).map((z) => h.rij({ ic: 'megaphone', titel: esc(vul(z.sj.onderwerp, z.vars)), sub: `${esc(z.titel)} · ${D.kort(z.datum)}`, act: 'autoConcept', attrs: `data-id="${esc(z.zid)}"` })).join('') || h.leeg('Niets klaar')}</div>` });
  CC.on('autoConcept', (el) => {
    const S = CC.S(); const z = zendingen(S).find((x) => x.zid === el.dataset.id);
    CC.sheet(`Bericht: ${z.titel}`, `<form data-submit="autoVerstuur" data-id="${esc(z.zid)}" class="codeform">
      <label for="ab-o">Onderwerp</label><input id="ab-o" name="o" value="${esc(vul(z.sj.onderwerp, z.vars))}" required>
      <label for="ab-t">Tekst</label><textarea id="ab-t" name="t" rows="6" required>${esc(vul(z.sj.tekst, z.vars))}</textarea>
      <button class="knop vol">${icon('send')}Versturen aan de hele club</button>
      <button type="button" class="knop licht vol" data-act="autoOverslaan" data-id="${esc(z.zid)}">Deze keer overslaan</button></form>`, { groot: true });
  });
  CC.on('autoVerstuur', (f) => { const S = CC.S(); const z = zendingen(S).find((x) => x.zid === f.dataset.id); verstuur(S, [z], f.o.value, f.t.value, CC.me().id); CC.save(); CC.closeSheet(); CC.render(); CC.toast('Verstuurd aan de hele club'); });
  CC.on('autoOverslaan', (el) => { const S = CC.S(); status(S)[el.dataset.id] = { overgeslagen: true, tijd: new Date().toISOString(), door: CC.me().id }; CC.save(); CC.closeSheet(); CC.render(); CC.toast('Overgeslagen'); });

  // ---------- Herinneringen bij activiteiten (Besluit 36) ----------
  // Per activiteit gekozen (standaard 7 en 2 dagen). Bij opgave tellen de dagen tot de uiterste datum en gaat de herinnering
  // alleen naar ouders van wie het kind nog niet is opgegeven. Verstuurd door de beheerder/HJO of de staf van het team.
  CC.activiteitHerinneringen = (S) => {
    const me = CC.me(); if (!me) return false; const v = D.vandaag(); let veranderd = false;
    S.acts.filter((a) => a.soort === 'activiteit' && !a.afgelast && (a.herinneringen || []).length && a.datum >= v).forEach((a) => {
      const t = M.team(S, a.teamId); if (!t) return;
      const admin = magClub(); if (!admin && t.trainerId !== me.id && t.teamleiderId !== me.id) return;
      const doel = a.opgave ? a.opgaveTot || a.datum : a.datum; if (doel < v) return;
      const gedaan = a.herinnerd || (a.herinnerd = []);
      const nu = a.herinneringen.filter((d) => !gedaan.includes(d) && D.addDays(doel, -d) <= v); if (!nu.length) return;
      gedaan.push(...nu); veranderd = true;
      const spelers = M.spelers(S, a.teamId).filter((pl) => (a.opgave ? M.status(S, pl, a).code === 'open' : true));
      const ontv = [...new Set(spelers.flatMap((pl) => pl.ouders))].filter((x) => x !== me.id);
      if (!ontv.length) return;
      const tekst = a.opgave ? `Denk je aan de opgave voor ${a.naam} op ${D.lang(a.datum)}? Geef in ClubComm vóór ${D.lang(doel)} door of je kind komt (ja of nee).` : `Herinnering: ${a.naam} op ${D.lang(a.datum)} van ${a.tijd} tot ${a.eind}${a.plaats ? ` bij ${a.plaats}` : ''}.${a.verzamel ? ` Verzamelen om ${a.verzamel}.` : ''}${a.toelichting ? ` ${a.toelichting}` : ''} Kan je kind niet? Meld af in ClubComm.`;
      S.msgs.push({ id: 'b' + Date.now() + Math.random().toString(36).slice(2, 6), van: admin ? 'systeem' : me.id, soort: 'nieuws', bereik: a.teamId, onderwerp: a.opgave ? `Opgave ${a.naam}: nog even doorgeven` : `Herinnering: ${a.naam}`, tekst, tijd: new Date().toISOString(), gepland: null, ontvangers: ontv, gelezen: [], antw: [], urgent: false, vastTot: null, auto: true, herinnering: true, mail: true });
    });
    return veranderd;
  };

  // ---------- Het Communicatieplan (instellen aan het begin van het seizoen) ----------
  const schemaVinkjes = (naam, schema) => `<fieldset class="vinkjes rij-vinkjes"><legend>Versturen</legend>${KEUZE.map((d) => `<label><input type="checkbox" name="${naam}" value="${d}" ${(schema || []).includes(d) ? 'checked' : ''}> ${d ? `${d} ${d === 1 ? 'dag' : 'dagen'} voor` : 'op de dag'}</label>`).join('')}</fieldset>`;
  const sjabloonForm = (x) => `<form data-submit="autoSjabloon" data-id="${x.id}" class="codeform">
      <label class="schakel"><span>Aan</span><input type="checkbox" name="aan" ${x.aan ? 'checked' : ''}><i></i></label>
      ${x.eigen ? `<div class="twee"><div><label for="as-n-${x.id}">Naam</label><input id="as-n-${x.id}" name="n" value="${esc(x.naam)}"></div><div><label for="as-dt-${x.id}">Datum</label><input id="as-dt-${x.id}" name="dt" type="date" value="${x.datum || ''}"></div></div>` : ''}
      ${schemaVinkjes('s', x.schema)}
      <div class="twee"><div><label for="as-m-${x.id}">Hoe</label><select id="as-m-${x.id}" name="m"><option value="1" ${x.auto ? 'selected' : ''}>Automatisch versturen</option><option value="0" ${x.auto ? '' : 'selected'}>Klaarzetten, ik kijk het eerst na</option></select></div>
      <div><label for="as-k-${x.id}">Waar</label><select id="as-k-${x.id}" name="k"><option value="1" ${x.mail !== false ? 'selected' : ''}>App en e-mail</option><option value="0" ${x.mail === false ? 'selected' : ''}>Alleen in de app</option></select></div></div>
      <label for="as-o-${x.id}">Onderwerp</label><input id="as-o-${x.id}" name="o" value="${esc(x.onderwerp)}">
      <label for="as-t-${x.id}">Tekst</label><textarea id="as-t-${x.id}" name="t" rows="4">${esc(x.tekst)}</textarea>
      <p class="zacht klein">Woorden tussen [haken] vult ClubComm zelf in, zoals [datum], [vakantie] en [terug].</p>
      <div class="knoppen"><button class="knop licht klein">Opslaan</button>${x.eigen ? `<button type="button" class="knop licht klein rood-tekst" data-act="autoEigenWeg" data-id="${x.id}">${icon('trash-2')}Verwijderen</button>` : ''}</div></form>`;
  const rij = (x) => `<details class="uitklap"><summary><b>${esc(x.naam)}</b> <small class="zacht">${x.aan ? `${schemaTekst(x.schema)} voor ${esc(x.eigen ? D.kort(x.datum || D.vandaag()) : x.wanneer)} · ${x.auto ? 'automatisch' : 'klaarzetten'} · ${x.mail !== false ? 'app + e-mail' : 'alleen app'}` : 'uit'}</small></summary>${sjabloonForm(x)}</details>`;
  const maand = (d) => { const x = D.parse(d); return `${['januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september', 'oktober', 'november', 'december'][x.getMonth()]} ${x.getFullYear()}`; };
  CC.views.autoBerichten = (S) => {
    const v = D.vandaag(); const zs = zendingen(S).filter((z) => z.sj.aan && z.datum >= S.club.seizoen.start);
    const groepen = {}; zs.forEach((z) => { (groepen[maand(z.klaar)] = groepen[maand(z.klaar)] || []).push(z); });
    const nuMaand = maand(v); const volgende = maand(D.addDays(v, 31));
    const l = lijst(S);
    return { titel: 'Communicatieplan', html: `<p class="zacht">Eén keer instellen aan het begin van het seizoen. Herinneringen gaan <b>automatisch</b> en komen niet in je berichtencentrum; hier zie je wat er wanneer uitgaat. Aankondigingen (zoals een uitje) en noodberichten doe je zelf.</p>
      ${h.sectie('Vaste berichten')}<div class="lijst">${l.filter((x) => !x.eigen).map(rij).join('')}</div>
      ${h.sectie('Eigen berichten')}<p class="zacht klein">Krijg je vaak dezelfde vraag van ouders? Maak er een vast bericht van, dan hoeven ze het niet meer te vragen.</p>
      <div class="lijst">${l.filter((x) => x.eigen).map(rij).join('') || ''}</div>
      <button class="knop licht vol" data-act="autoEigenNieuw">${icon('plus')}Eigen bericht toevoegen</button>
      ${h.sectie('Dit seizoen')}${Object.entries(groepen).map(([mnd, lijstje]) => `<details class="uitklap" ${mnd === nuMaand || mnd === volgende ? 'open' : ''}><summary><b>${esc(mnd.replace(/^./, (c) => c.toUpperCase()))}</b> <small class="zacht">${lijstje.length} ${lijstje.length === 1 ? 'bericht' : 'berichten'}</small></summary><div class="lijst compact">${lijstje.map((z) => { const st = status(S)[z.zid]; return h.rij({ ic: h.datumBlok({ datum: z.klaar }), titel: esc(vul(z.sj.onderwerp, z.vars)), sub: `${esc(z.titel)} · ${z.dagen ? `${z.dagen} ${z.dagen === 1 ? 'dag' : 'dagen'} voor` : 'op de dag'} · ${st ? (st.overgeslagen ? 'overgeslagen' : `verstuurd ${D.tijdstip(st.tijd)}`) : z.datum < v ? 'voorbij' : z.sj.auto ? 'gaat automatisch' : 'wordt klaargezet'}` }); }).join('')}</div></details>`).join('') || h.leeg('Nog niets gepland')}
      ${h.sectie('Noodberichten')}<p class="zacht klein">Klaar voor als het nodig is: bij Planning → <b>Noodbericht of afgelasten</b>. Altijd urgent, ook per e-mail.</p><div class="lijst">${CC.NOOD.map((n) => h.rij({ ic: 'triangle-alert', titel: esc(n.naam), sub: esc(n.tekst) })).join('')}</div>` };
  };
  const leesSchema = (f) => [...f.querySelectorAll('[name=s]:checked')].map((x) => Number(x.value));
  CC.on('autoSjabloon', (f) => { const S = CC.S(); const x = lijst(S).find((y) => y.id === f.dataset.id); Object.assign(x, { aan: f.aan.checked, schema: leesSchema(f), auto: f.m.value === '1', mail: f.k.value === '1', onderwerp: f.o.value, tekst: f.t.value }); if (x.eigen) Object.assign(x, { naam: f.n.value, datum: f.dt.value }); CC.save(); CC.render(); CC.toast('Opgeslagen'); });
  CC.on('autoEigenNieuw', () => CC.sheet('Eigen bericht', `<form data-submit="autoEigenOk" class="codeform">
      <label for="ae-n">Naam (voor jezelf)</label><input id="ae-n" name="n" required placeholder="Bijv. Teamfoto">
      <label for="ae-d">Datum waar het om gaat</label><input id="ae-d" name="dt" type="date" required value="${D.addDays(D.vandaag(), 14)}">
      ${schemaVinkjes('s', [7])}
      <div class="twee"><div><label for="ae-m">Hoe</label><select id="ae-m" name="m"><option value="1">Automatisch versturen</option><option value="0">Klaarzetten, ik kijk het eerst na</option></select></div><div><label for="ae-k">Waar</label><select id="ae-k" name="k"><option value="1">App en e-mail</option><option value="0">Alleen in de app</option></select></div></div>
      <label for="ae-o">Onderwerp</label><input id="ae-o" name="o" required placeholder="Bijv. Teamfoto op [datum]">
      <label for="ae-t">Tekst</label><textarea id="ae-t" name="t" rows="4" required placeholder="Bijv. Op [datum] maken we de teamfoto. Kom in het wedstrijdtenue."></textarea>
      <button class="knop vol">Opslaan</button></form>`));
  CC.on('autoEigenOk', (f) => { const S = CC.S(); lijst(S).push({ id: 'e' + Date.now(), eigen: true, aan: true, naam: f.n.value, datum: f.dt.value, schema: leesSchema(f), auto: f.m.value === '1', mail: f.k.value === '1', onderwerp: f.o.value, tekst: f.t.value, wanneer: '' }); CC.save(); CC.closeSheet(); CC.render(); CC.toast('Eigen bericht toegevoegd'); });
  CC.on('autoEigenWeg', (el) => { const S = CC.S(); const l = lijst(S); l.splice(l.findIndex((x) => x.id === el.dataset.id), 1); CC.save(); CC.render(); CC.toast('Verwijderd'); });

  // ---------- Noodbericht of afgelasten ----------
  CC.on('noodbericht', () => {
    const S = CC.S();
    CC.sheet('Noodbericht of afgelasten', `<form data-submit="noodOk" class="codeform">
      <label for="nb-s">Wat is er aan de hand?</label><select id="nb-s" name="s" data-change="noodKies">${CC.NOOD.map((n) => `<option value="${n.id}">${esc(n.naam)}</option>`).join('')}</select>
      <div class="twee"><div><label for="nb-d">Datum</label><input id="nb-d" name="d" type="date" value="${D.vandaag()}" required data-change="noodKies"></div><div id="nb-tijdvak"><label for="nb-tijd">Uiterlijk bericht om</label><input id="nb-tijd" name="tijd" type="time" value="14:00" data-change="noodKies"></div></div>
      <div id="nb-redenvak" hidden><label for="nb-r">Reden</label><input id="nb-r" name="r" value="een storing" data-change="noodKies"></div>
      <fieldset class="vinkjes"><legend>Teams</legend><label><input type="checkbox" name="alle" checked data-change="alleTeams"> Alle teams</label>${S.teams.map((t) => `<label><input type="checkbox" name="teams" value="${t.id}" checked> ${esc(t.naam)}</label>`).join('')}</fieldset>
      <label for="nb-o">Onderwerp</label><input id="nb-o" name="o" required>
      <label for="nb-t">Tekst</label><textarea id="nb-t" name="t" rows="4" required></textarea>
      <p class="zacht klein" id="nb-uitleg"></p>
      <button class="knop rood vol">${icon('send')}Versturen (urgent)</button></form>`);
    noodVul(document.querySelector('form[data-submit="noodOk"]'));
  });
  const noodVul = (f) => {
    if (!f) return; const n = CC.NOOD.find((x) => x.id === f.s.value); const vars = { datum: D.lang(f.d.value), tijd: f.tijd.value, reden: f.r.value };
    f.o.value = vul(n.onderwerp, vars); f.t.value = vul(n.tekst, vars);
    f.querySelector('#nb-tijdvak').hidden = n.id !== 'oranje'; f.querySelector('#nb-redenvak').hidden = n.id !== 'dicht';
    f.querySelector('#nb-uitleg').textContent = n.afgelast === 'alles' ? 'Alle trainingen en wedstrijden van die dag worden afgelast.' : n.afgelast === 'thuis' ? 'Alle trainingen en thuiswedstrijden van die dag worden afgelast.' : 'Er wordt nog niets afgelast; stuur later een tweede bericht als het niet doorgaat.';
  };
  CC.on('noodKies', (el) => noodVul(el.form));
  CC.on('noodOk', (f) => {
    const S = CC.S(); const n = CC.NOOD.find((x) => x.id === f.s.value); const teams = [...f.querySelectorAll('[name=teams]:checked')].map((x) => x.value);
    const acts = n.afgelast ? S.acts.filter((a) => a.datum === f.d.value && teams.includes(a.teamId) && !a.afgelast && (n.afgelast === 'alles' || !M.isWed(a) || a.thuis)) : [];
    acts.forEach((a) => { a.afgelast = true; });
    const ontv = [...new Set(teams.flatMap((t) => [...M.oudersVan(S, t), ...M.stafVan(S, t)]).concat(S.people.filter((p) => p.rollen.some((r) => ['hjo', 'coordinator'].includes(r.rol))).map((p) => p.id)).filter((x) => x && x !== CC.me().id))];
    S.msgs.push({ id: 'b' + Date.now(), van: CC.me().id, soort: 'nieuws', bereik: teams.length === S.teams.length ? 'Hele club' : teams.join(', '), onderwerp: f.o.value, tekst: f.t.value, tijd: new Date().toISOString(), ontvangers: ontv, gelezen: [], antw: [], urgent: true, gepland: null });
    CC.save(); CC.closeSheet(); CC.render(); CC.toast(`${acts.length ? `${acts.length} activiteiten afgelast · ` : ''}${ontv.length} mensen ingelicht`);
  });

  // ---------- Ingangen ----------
  const origPlanning = CC.rollen.hjo.schermen.planning;
  CC.rollen.hjo.schermen.planning = (S) => {
    if (!CC.mag('clubbericht')) return origPlanning(S);
    const vol = zendingen(S).find((z) => z.sj.aan && !status(S)[z.zid] && z.klaar >= D.vandaag());
    return `<div class="lijst">${h.rij({ ic: 'megaphone', titel: 'Communicatieplan', sub: vol ? `Volgende: ${esc(vul(vol.sj.onderwerp, vol.vars))} (${D.kort(vol.klaar)})` : 'Vaste en eigen berichten dit seizoen', act: 'open', attrs: 'data-view="autoBerichten"' })}</div>` + origPlanning(S);
  };
  if (CC.rollen.beheerder && CC.rollen.beheerder.schermen.seizoen) {
    const origSz = CC.rollen.beheerder.schermen.seizoen;
    CC.rollen.beheerder.schermen.seizoen = (S) => `<div class="lijst">${h.rij({ ic: 'megaphone', titel: 'Communicatieplan', sub: 'Welke berichten wanneer automatisch uitgaan', act: 'open', attrs: 'data-view="autoBerichten"' })}</div>` + origSz(S);
  }
})();
