// ClubComm prototype — Besluit 23: twee beoordelingsmomenten + ontwikkelgesprekken.
// Moment 1 vóór de winterstop, moment 2 aan het einde van het seizoen. De trainer beoordeelt, plant tijdsloten;
// ouders kiezen een tijd (ouder + kind zijn erbij). De ouder ziet de beoordeling een dag na het gesprek.
(function () {
  const CC = window.CC; const D = CC.date, M = CC.m, h = CC.h, icon = CC.icon, esc = CC.esc;

  // ---------- Momenten ----------
  // Besluit 65: twee gespreksmomenten. Start = binnen 8 weken na de start van het seizoen (en vóór de herfstvakantie),
  // Voorjaar = maart (vóór de indeling voor volgend seizoen). Elk met een periode waarin de trainer beoordeelt en spreekt.
  const standaardMomenten = (S) => {
    const start = S.club.seizoen.start; const herfst = (S.club.vakanties || []).find((v) => v.id === 'herfst');
    const acht = D.addDays(start, 55); const tot1 = herfst && herfst.van > start && herfst.van <= acht ? D.addDays(herfst.van, -1) : acht;
    const jaar = String(S.club.seizoen.eind).slice(0, 4);
    return [{ id: 'm1', naam: 'Start', tot: tot1, weken: 3 }, { id: 'm2', naam: 'Voorjaar', tot: `${jaar}-03-31`, weken: 4 }];
  };
  // Oude standaard (Winter / Einde seizoen) vervangen door de nieuwe, zolang er nog niets mee gedaan is
  const oudeStandaard = (l) => Array.isArray(l) && l.length === 2 && l[0].naam === 'Winter' && l[1].naam === 'Einde seizoen';
  CC.momenten = (S) => { if (!S.club.momenten || (oudeStandaard(S.club.momenten) && !Object.keys(S.beoord || {}).length)) S.club.momenten = standaardMomenten(S); return S.club.momenten.map((m) => {
    const van = D.addDays(m.tot, -(m.weken * 7) + 1);
    const vandaag = D.vandaag();
    return { ...m, van, status: vandaag < van ? 'komt' : vandaag > m.tot ? 'voorbij' : 'open' };
  }); };
  CC.actiefMoment = (S) => { const ms = CC.momenten(S); return ms.find((m) => m.status === 'open') || ms.find((m) => m.status === 'komt') || ms[ms.length - 1]; };
  const b = (S, plId, mid) => { const x = S.beoord[plId] || (S.beoord[plId] = {}); return x[mid] || (x[mid] = { scores: {}, goed: '', werken: '' }); };
  const heeft = (S, plId, mid) => { const x = S.beoord[plId] && S.beoord[plId][mid]; return !!(x && Object.keys(x.scores).length); };
  CC.beoordLaatste = (S, plId) => { const ms = CC.momenten(S).filter((m) => heeft(S, plId, m.id)); const m = ms[ms.length - 1]; return m ? { m, x: S.beoord[plId][m.id] } : null; };
  const voortgang = (S, tid, mid) => { const sp = M.spelers(S, tid); return { klaar: sp.filter((pl) => heeft(S, pl.id, mid)).length, totaal: sp.length }; };

  // ---------- Gesprekken (tijdsloten) ----------
  const slots = (S, tid, mid) => (S.ontwGesprek || []).filter((g) => g.teamId === tid && (!mid || g.moment === mid)).sort((a, b) => (a.datum + a.tijd).localeCompare(b.datum + b.tijd));
  const gesprekVan = (S, plId, mid) => (S.ontwGesprek || []).find((g) => g.spelerId === plId && (!mid || g.moment === mid));
  // Zichtbaar voor de ouder: een dag na het gesprek, of als de trainer het handmatig deelt
  CC.beoordZichtbaar = (S, plId, mid) => { const g = gesprekVan(S, plId, mid); return !!((S.beoordGedeeld || {})[plId + mid] || (g && D.addDays(g.datum, 1) <= D.vandaag())); };
  // Voor de agenda (Besluit 18): gesprekken als afspraak
  CC.gesprekkenVoor = (S, p) => {
    const kids = S.players.filter((x) => x.teamId && x.ouders.includes(p.id)).map((x) => x.id);
    const staf = p.rollen.filter((r) => r.rol === 'trainer').map((r) => r.teamId);
    return (S.ontwGesprek || []).filter((g) => g.datum >= D.vandaag() && g.spelerId && (kids.includes(g.spelerId) || staf.includes(g.teamId)));
  };

  // ---------- Trainer: beoordelen ----------
  CC.views.beoordelen = (S, p) => {
    const tid = CC.teamId(); const t = M.team(S, tid); const c = CC.categorie(t.cat);
    const ms = CC.momenten(S); const mid = h.segVal('beoMoment', CC.actiefMoment(S).id); const m = ms.find((x) => x.id === mid);
    const vorig = ms[ms.findIndex((x) => x.id === mid) - 1];
    const modus = h.segVal('beoModus', 'vaardig');
    const opties = c.schaal === '1-10' ? [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] : c.schaal === '1-5' ? [1, 2, 3, 4, 5] : [1, 2, 3];
    const vaardig = CC.vaardigheden(S, tid);
    const knoppen = (plId, v) => {
      const cur = b(S, plId, mid).scores[v]; const oud = vorig && S.beoord[plId] && S.beoord[plId][vorig.id] && S.beoord[plId][vorig.id].scores[v];
      const pijl = oud && cur ? (cur > oud ? '<span class="groen-tekst" title="beter dan vorig moment">▲</span>' : cur < oud ? '<span class="rood-tekst" title="lager dan vorig moment">▼</span>' : '<span class="zacht">=</span>') : '';
      if (opties.length > 5) return `<span class="score"><select class="kort" data-change="zetScoreKeuze" data-id="${plId}" data-v="${esc(v)}" data-m="${mid}" aria-label="Score ${esc(v)}"><option value="">–</option>${opties.map((o) => `<option value="${o}" ${cur === o ? 'selected' : ''}>${o}</option>`).join('')}</select>${pijl}</span>`;
      return `<span class="score">${opties.map((o) => `<button class="${cur === o ? 'aan' : ''}" data-act="zetScore" data-id="${plId}" data-v="${esc(v)}" data-s="${o}" data-m="${mid}" aria-label="${o}">${CC.scoreTekst(t, o)}</button>`).join('')}${pijl}</span>`;
    };
    let body;
    if (modus === 'vaardig') {
      const v = h.segVal('beoV', vaardig[0]);
      body = `<div class="chips">${vaardig.map((x) => `<button class="chipknop ${x === v ? 'aan' : ''}" data-act="seg" data-key="beoV" data-val="${esc(x)}">${esc(x)}</button>`).join('')}</div>
        <div class="lijst">${M.spelers(S, tid).map((pl) => `<div class="rij"><span class="rij-tekst"><b>${esc(pl.voornaam)}</b></span>${knoppen(pl.id, v)}</div>`).join('')}</div>`;
    } else {
      const sp = M.spelers(S, tid); const id = h.segVal('beoSp', sp[0].id); const x = b(S, id, mid);
      body = `<select class="kies" data-change="kiesBeoSp" aria-label="Speler">${sp.map((pl) => `<option value="${pl.id}" ${pl.id === id ? 'selected' : ''}>${esc(M.naam(S, pl))}${heeft(S, pl.id, mid) ? ' ✓' : ''}</option>`).join('')}</select>
        <div class="lijst">${vaardig.map((v) => `<div class="rij"><span class="rij-tekst"><b>${esc(v)}</b></span>${knoppen(id, v)}</div>`).join('')}</div>
        <label class="klein-kop" for="bo-g">Wat gaat goed</label><textarea id="bo-g" rows="2" data-input="beoTekst" data-id="${id}" data-m="${mid}" data-k="goed" placeholder="Bijv. durft de bal te vragen, helpt teamgenoten">${esc(x.goed)}</textarea>
        <label class="klein-kop" for="bo-w">Waar werken we aan</label><textarea id="bo-w" rows="2" data-input="beoTekst" data-id="${id}" data-m="${mid}" data-k="werken" placeholder="Bijv. aannemen met links">${esc(x.werken)}</textarea>
        ${vorig && S.beoord[id] && S.beoord[id][vorig.id] && (S.beoord[id][vorig.id].goed || S.beoord[id][vorig.id].werken) ? `<p class="zacht klein"><b>Vorig moment (${esc(vorig.naam.toLowerCase())}):</b> ${esc(S.beoord[id][vorig.id].goed)} · werkpunt: ${esc(S.beoord[id][vorig.id].werken)}</p>` : ''}
        ${heeft(S, id, mid) && !CC.beoordZichtbaar(S, id, mid) ? `<button class="linkknop" data-act="beoDelen" data-id="${id}" data-m="${mid}">Nu al delen met de ouders</button>` : heeft(S, id, mid) ? '<p class="zacht klein">De ouders kunnen deze beoordeling zien.</p>' : ''}`;
    }
    const vg = voortgang(S, tid, mid);
    return { titel: 'Beoordelen', html: `${h.seg('beoMoment', ms.map((x) => [x.id, x.naam]), CC.actiefMoment(S).id)}
      <div class="info">${icon('info')}<span><b>${esc(m.naam)}:</b> ${D.kort(m.van)} – ${D.kort(m.tot)}${m.status === 'komt' ? ' (nog niet begonnen; je mag al starten)' : m.status === 'voorbij' ? ' (voorbij)' : ''}. ${vg.klaar} van ${vg.totaal} spelers beoordeeld. ${esc(c.naam)}, ${esc(c.vorm)}, schaal ${c.schaal === '1-10' ? '1 tot 10' : c.schaal === '1-5' ? '1 tot 5' : 'drie smileys'}. <button class="linkknop" data-act="vaardigToevoegen">Vaardigheden aanpassen</button> De ouder ziet het een dag na het ontwikkelgesprek.</span></div>
      ${CC.mag('ontwgesprek') ? '' : '<!--'}<div class="lijst">${h.rij({ ic: 'calendar-plus', titel: 'Ontwikkelgesprekken', sub: slots(S, tid, mid).length ? `${slots(S, tid, mid).filter((g) => g.spelerId).length} van ${slots(S, tid, mid).length} tijden gekozen` : 'Nog niet gepland: zet tijden klaar, ouders kiezen zelf', act: 'open', attrs: `data-view="gesprekken" data-m="${mid}"` })}</div>${CC.mag('ontwgesprek') ? '' : '-->'}
      ${h.seg('beoModus', [['vaardig', 'Per vaardigheid'], ['speler', 'Per speler + gesprekpunten']], 'vaardig')}${body}` };
  };
  CC.on('zetScoreKeuze', (el) => { const S = CC.S(); const x = b(S, el.dataset.id, el.dataset.m); if (el.value) x.scores[el.dataset.v] = Number(el.value); else delete x.scores[el.dataset.v]; CC.save(); CC.render(); });
  CC.on('zetScore', (el) => { const S = CC.S(); b(S, el.dataset.id, el.dataset.m || CC.actiefMoment(S).id).scores[el.dataset.v] = Number(el.dataset.s); CC.save(); CC.render(); });
  CC.on('beoTekst', (el) => { const S = CC.S(); b(S, el.dataset.id, el.dataset.m)[el.dataset.k] = el.value; CC.save(); });
  CC.on('beoDelen', (el) => { const S = CC.S(); (S.beoordGedeeld || (S.beoordGedeeld = {}))[el.dataset.id + el.dataset.m] = true; CC.save(); CC.render(); CC.toast('Gedeeld; de ouders zien de beoordeling'); });

  // ---------- Trainer: gesprekken plannen ----------
  // Besluit 65: plannen "na de training". De trainer tikt trainingen aan; de app zet na elke training genoeg gesprekken
  // klaar en rekent mee. Ouders kiezen vóór een uiterste datum; herinnering 2 dagen ervoor; daarna verdeelt de trainer
  // de rest met één tik. Ruilen kan tot 24 uur vooraf. "Zet in je agenda" maakt een agenda-afspraak (.ics).
  // Naam van de gesprekken: Startgesprek, Voorjaarsgesprek, of Ontwikkelgesprek (eigen naam van de club)
  const gNaam = (m, mv) => ({ Start: 'Startgesprek', Voorjaar: 'Voorjaarsgesprek' }[m.naam] || `Ontwikkelgesprek ${m.naam.toLowerCase()}`) + (mv ? 'ken' : '');
  const zonderTijd = (S, tid, mid) => M.spelers(S, tid).filter((pl) => !slots(S, tid, mid).some((g) => g.spelerId === pl.id));
  const kiesTot = (S, tid, mid) => { const l = slots(S, tid, mid).map((g) => g.kiesTot).filter(Boolean).sort(); return l[l.length - 1] || null; };
  CC.views.gesprekken = (S, p) => {
    const tid = CC.teamId(); const mid = p.m || CC.actiefMoment(S).id; const m = CC.momenten(S).find((x) => x.id === mid);
    const lijst = slots(S, tid, mid); const sp = M.spelers(S, tid); const zonder = zonderTijd(S, tid, mid);
    const vrij = lijst.filter((g) => !g.spelerId && g.datum >= D.vandaag()); const dl = kiesTot(S, tid, mid);
    // Trainingen die in aanmerking komen: vanaf vandaag tot een week na het einde van de periode
    const trainingen = S.acts.filter((a) => a.teamId === tid && a.soort === 'training' && !a.afgelast && a.datum >= D.vandaag() && a.datum <= D.addDays(m.tot, 7)).sort((a, b) => (a.datum + a.tijd).localeCompare(b.datum + b.tijd)).slice(0, 12);
    const gekozen = (h.segVal('ogTr', '') || '').split(',').filter((x) => trainingen.some((a) => a.id === x));
    const min = Number(h.segVal('ogMin', 10)) || 10; const nodig = zonder.length - vrij.length;
    const perTraining = gekozen.length ? Math.ceil(Math.max(nodig, 0) / gekozen.length) : 0;
    const overzicht = lijst.length ? `${[...new Set(lijst.map((g) => g.datum))].map((d) => `${h.sectie(`${D.lang(d)}`)}<div class="lijst compact">${lijst.filter((g) => g.datum === d).map((g) => { const pl = g.spelerId && M.speler(S, g.spelerId);
        return h.rij({ ic: 'clock', titel: `${g.tijd}–${g.eind}`, sub: `${esc(g.plek)} · ${pl ? `${esc(M.naam(S, pl))}${CC.voorbKlaar && CC.voorbKlaar(S, pl.id, mid) ? ' · voorbereid ✓' : ''}` : '<span class="oranje-tekst">nog vrij</span>'}`, ...(pl ? { act: 'open', attrs: `data-view="gesprekVerslag" data-id="${pl.id}" data-m="${mid}"` } : {}), rechts: pl ? '' : `<select class="kort" data-change="slotToewijzen" data-id="${g.id}" aria-label="Speler koppelen"><option value="">Koppel…</option>${zonder.map((x) => `<option value="${x.id}">${esc(x.voornaam)}</option>`).join('')}</select>` }); }).join('')}</div>`).join('')}` : '';
    const status = lijst.length ? `<div class="info ${zonder.length ? 'oranje' : 'groen'}">${icon(zonder.length ? 'hourglass' : 'circle-check')}<span><b>${sp.length - zonder.length} van ${sp.length}</b> spelers hebben een tijd.${dl ? ` Ouders kiezen tot en met <b>${D.lang(dl)}</b>.` : ''}${zonder.length ? ` Nog niet: ${zonder.map((x) => esc(x.voornaam)).join(', ')}.` : ''}</span></div>
      <div class="knoppen">${zonder.length && vrij.length ? `<button class="knop ${dl && dl < D.vandaag() ? '' : 'licht'} klein" data-act="ogVerdeel" data-m="${mid}">${icon('users')}Verdeel de rest (${Math.min(zonder.length, vrij.length)})</button>` : ''}<button class="knop licht klein" data-act="ogAgendaTrainer" data-m="${mid}">${icon('calendar-plus')}In mijn agenda</button></div>` : '';
    const form = trainingen.length ? `<form data-submit="ogNaTraining" data-m="${mid}" class="kaartje codeform"><h4>${icon('calendar-plus')}${lijst.length ? 'Meer tijden: na de training' : 'Gesprekken na de training'}</h4>
        <p class="zacht klein">Tik de trainingen aan waarna je gesprekken wilt voeren. Kinderen en ouders zijn er dan toch al.</p>
        <div class="vinkjes enkel">${trainingen.map((a) => `<label><input type="checkbox" data-change="ogTr" value="${a.id}" ${gekozen.includes(a.id) ? 'checked' : ''}> ${D.lang(a.datum)} · na ${a.eind}</label>`).join('')}</div>
        <div class="twee"><div><label for="og-u">Minuten per gesprek</label><input id="og-u" name="u" type="number" min="5" max="30" value="${min}" data-change="ogMin"></div><div><label for="og-p">Waar</label><input id="og-p" name="p" value="${esc(h.segVal('ogPlek', 'Kantine'))}"></div></div>
        <label for="og-k">Ouders kiezen tot en met</label><input id="og-k" name="k" type="date" required value="${(() => { const eerste = gekozen.map((id) => trainingen.find((a) => a.id === id).datum).sort()[0]; const max = eerste ? D.addDays(eerste, -1) : D.addDays(D.vandaag(), 5); const w = D.addDays(D.vandaag(), 5); return w < max ? w : max; })()}">
        <p class="klein ${gekozen.length && nodig > 0 ? '' : 'zacht'}">${!gekozen.length ? `Nog ${Math.max(nodig, 0)} ${nodig === 1 ? 'tijd' : 'tijden'} nodig. Kies een of meer trainingen.` : nodig <= 0 ? 'Er zijn al genoeg tijden.' : `${nodig} tijden nodig: <b>${perTraining} gesprekken na elke gekozen training</b> (${perTraining * min} minuten).`}</p>
        <button class="knop vol" ${gekozen.length && nodig > 0 ? '' : 'disabled'}>Klaarzetten en ouders vragen</button></form>` : '<p class="zacht klein">Er staan geen trainingen in deze periode. Kies hieronder een andere tijd.</p>';
    const anders = `<details class="uitklap"><summary>${icon('calendar')}Andere tijd (bijv. een aparte avond)</summary><form data-submit="slotsMaken" data-m="${mid}" class="codeform">
        <div class="twee"><div><label for="gs-d">Datum</label><input id="gs-d" name="d" type="date" required value="${D.addDays(D.vandaag(), 7)}"></div><div><label for="gs-t">Vanaf</label><input id="gs-t" name="t" type="time" required value="18:00"></div></div>
        <div class="twee"><div><label for="gs-u">Minuten per gesprek</label><input id="gs-u" name="u" type="number" min="5" max="30" value="10"></div><div><label for="gs-n">Aantal tijden</label><input id="gs-n" name="n" type="number" min="1" max="30" value="${Math.max(1, nodig)}"></div></div>
        <label for="gs-p">Waar</label><input id="gs-p" name="p" value="Kantine"><label for="gs-k">Ouders kiezen tot en met</label><input id="gs-k" name="k" type="date" value="${D.addDays(D.vandaag(), 5)}">
        <button class="knop licht">Klaarzetten en ouders vragen</button></form></details>`;
    return { titel: gNaam(m, true), sub: `${D.kort(m.van)} – ${D.kort(m.tot)} · ouder en kind samen`,
      html: `${status}${overzicht}${zonder.length ? form + anders : ''}` };
  };
  CC.on('ogTr', (el) => { const l = (CC.ui.seg.ogTr || '').split(',').filter(Boolean); const i = l.indexOf(el.value); if (el.checked && i < 0) l.push(el.value); if (!el.checked && i >= 0) l.splice(i, 1); CC.ui.seg.ogTr = l.join(','); const pl = document.getElementById('og-p'); if (pl) CC.ui.seg.ogPlek = pl.value; CC.render(); });
  CC.on('ogMin', (el) => { CC.ui.seg.ogMin = String(Math.max(5, Math.min(30, Number(el.value) || 10))); CC.render(); });
  const vraagOuders = (S, tid, mid, tekst) => {
    const m = CC.momenten(S).find((x) => x.id === mid);
    S.msgs.push({ id: 'b' + Date.now(), van: CC.me().id, soort: 'nieuws', bereik: tid, onderwerp: `Kies een tijd voor het ${gNaam(m).toLowerCase()}`, tekst, tijd: new Date().toISOString(), ontvangers: M.oudersVan(S, tid), gelezen: [], antw: [], urgent: false, gepland: null });
  };
  CC.on('ogNaTraining', (f) => {
    const S = CC.S(); const tid = CC.teamId(); const mid = f.dataset.m; const lijst = S.ontwGesprek || (S.ontwGesprek = []);
    const gekozen = (CC.ui.seg.ogTr || '').split(',').filter(Boolean).map((id) => M.act(S, id)).filter(Boolean).sort((a, b) => a.datum.localeCompare(b.datum));
    const u = Number(f.u.value) || 10; const nodig = zonderTijd(S, tid, mid).length - slots(S, tid, mid).filter((g) => !g.spelerId && g.datum >= D.vandaag()).length;
    if (!gekozen.length || nodig <= 0) return CC.toast('Kies minstens één training', 'fout');
    const per = Math.ceil(nodig / gekozen.length); let n = 0;
    gekozen.forEach((a, j) => { const aantal = Math.min(per, nodig - n); for (let i = 0; i < aantal; i++, n++) lijst.push({ id: `og${Date.now()}${j}${i}`, teamId: tid, moment: mid, datum: a.datum, tijd: CC.plusMin(a.eind, i * u), eind: CC.plusMin(a.eind, (i + 1) * u), plek: f.p.value.trim() || 'Kantine', spelerId: null, actId: a.id, kiesTot: f.k.value }); });
    vraagOuders(S, tid, mid, `Na de training op ${gekozen.map((a) => D.lang(a.datum)).join(' en ')} houden we korte gesprekken van ${u} minuten (${f.p.value.trim() || 'Kantine'}) over hoe het gaat met je kind. Jij en je kind zijn er samen bij.\n\nKies vóór of op ${D.lang(f.k.value)} een tijd in ClubComm. Heb je dan nog niet gekozen, dan krijg je een tijd van ons.`);
    CC.ui.seg.ogTr = ''; CC.save(); CC.render(); CC.toast(`${n} tijden klaargezet; ouders krijgen bericht`);
  });
  CC.on('slotsMaken', (f) => {
    const S = CC.S(); const tid = CC.teamId(); const lijst = S.ontwGesprek || (S.ontwGesprek = []);
    const n = Number(f.n.value), u = Number(f.u.value);
    for (let i = 0; i < n; i++) lijst.push({ id: 'og' + Date.now() + i, teamId: tid, moment: f.dataset.m, datum: f.d.value, tijd: CC.plusMin(f.t.value, i * u), eind: CC.plusMin(f.t.value, (i + 1) * u), plek: f.p.value, spelerId: null, kiesTot: f.k.value || null });
    vraagOuders(S, tid, f.dataset.m, `Op ${D.lang(f.d.value)} vanaf ${f.t.value} houden we korte gesprekken van ${u} minuten (${f.p.value}) over hoe het gaat met je kind. Jij en je kind zijn er samen bij.${f.k.value ? `\n\nKies vóór of op ${D.lang(f.k.value)} een tijd in ClubComm. Heb je dan nog niet gekozen, dan krijg je een tijd van ons.` : ' Kies een tijd in ClubComm.'}`);
    CC.save(); CC.render(); CC.toast(`${n} tijden klaargezet; ouders krijgen bericht`);
  });
  const reservering = (S, g, pl, door) => {
    S.msgs.push({ id: 'b' + Date.now() + pl.id, van: door, soort: 'persoonlijk', bereik: `${pl.voornaam} (${CC.tn(pl.teamId)})`, onderwerp: `Gesprek over ${pl.voornaam}: ${D.lang(g.datum)} ${g.tijd}`, tekst: `We hebben ${D.lang(g.datum)} om ${g.tijd} (${g.plek}) voor jullie gereserveerd voor het gesprek over ${pl.voornaam}. Jij en ${pl.voornaam} zijn er samen bij.\n\nPast het niet? Kies in ClubComm een andere tijd (kan tot 24 uur van tevoren).`, tijd: new Date().toISOString(), ontvangers: pl.ouders, gelezen: [door], antw: [], urgent: false, gepland: null });
  };
  CC.on('slotToewijzen', (el) => { const S = CC.S(); const g = S.ontwGesprek.find((x) => x.id === el.dataset.id); g.spelerId = el.value || null; const pl = g.spelerId && M.speler(S, g.spelerId); if (pl) reservering(S, g, pl, CC.me().id); CC.save(); CC.render(); CC.toast('Gekoppeld; de ouder krijgt bericht'); });
  // De rest verdelen: wie nog geen tijd heeft, krijgt een vrije tijd (op volgorde)
  CC.on('ogVerdeel', (el) => { const S = CC.S(); const tid = CC.teamId(); const mid = el.dataset.m; const z = zonderTijd(S, tid, mid); const v = slots(S, tid, mid).filter((g) => !g.spelerId && g.datum >= D.vandaag());
    CC.sheet('De rest verdelen', `<p><b>${Math.min(z.length, v.length)}</b> ${z.length === 1 ? 'kind krijgt' : 'kinderen krijgen'} een vrije tijd. De ouders krijgen een bericht en kunnen tot 24 uur vooraf ruilen.</p>${z.length > v.length ? `<p class="klein oranje-tekst">Er zijn ${z.length - v.length} tijden te weinig. Zet daarna nog tijden klaar.</p>` : ''}
      <div class="knoppen kolom"><button class="knop" data-act="ogVerdeelOk" data-m="${mid}">Verdelen</button><button class="knop licht" data-act="sluit">Annuleren</button></div>`); });
  CC.on('ogVerdeelOk', (el) => { const S = CC.S(); const tid = CC.teamId(); const mid = el.dataset.m; const z = zonderTijd(S, tid, mid); const v = slots(S, tid, mid).filter((g) => !g.spelerId && g.datum >= D.vandaag()); let n = 0;
    z.forEach((pl, i) => { const g = v[i]; if (!g) return; g.spelerId = pl.id; reservering(S, g, pl, CC.me().id); n++; });
    CC.save(); CC.closeSheet(); CC.render(); CC.toast(`${n} ${n === 1 ? 'kind' : 'kinderen'} ingedeeld; de ouders krijgen bericht`); });
  // Herinnering 2 dagen voor de uiterste datum, aan ouders die nog niet kozen (gaat uit als de trainer de app opent)
  CC.ogHerinnering = (S, tid, mid) => {
    const dl = kiesTot(S, tid, mid); if (!dl) return; const v = D.vandaag(); if (v < D.addDays(dl, -2) || v > dl) return;
    const l = slots(S, tid, mid); if (l.some((g) => g.herinnerd)) return;
    const z = zonderTijd(S, tid, mid); const nu = new Date().toISOString(); l.forEach((g) => { g.herinnerd = nu; }); if (!z.length) { CC.save(); return; }
    S.msgs.push({ id: 'b' + Date.now() + 'h', van: CC.me().id, soort: 'persoonlijk', bereik: 'Ouders zonder tijd', onderwerp: 'Nog even een tijd kiezen voor het gesprek', tekst: `Je hebt nog geen tijd gekozen voor het gesprek met de trainer. Kies vóór of op ${D.lang(dl)} een tijd in ClubComm; daarna krijg je een tijd van ons.`, tijd: new Date().toISOString(), ontvangers: [...new Set(z.flatMap((pl) => pl.ouders))], gelezen: [CC.me().id], antw: [], urgent: false, gepland: null, herinnering: true });
    CC.save();
  };

  // ---------- Agenda-afspraak (.ics) ----------
  const icsTekst = (t) => String(t || '').replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/[,;]/g, (c) => '\\' + c);
  const icsTijd = (d, t) => `${d.replace(/-/g, '')}T${t.replace(':', '')}00`;
  CC.icsBestand = (naam, afspraken) => {
    const r = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//ClubComm//NL', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH'];
    afspraken.forEach((x) => r.push('BEGIN:VEVENT', `UID:${x.uid}@mijnclubcomm.nl`, `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').slice(0, 15)}Z`, `DTSTART;TZID=Europe/Amsterdam:${icsTijd(x.datum, x.tijd)}`, `DTEND;TZID=Europe/Amsterdam:${icsTijd(x.datum, x.eind)}`, `SUMMARY:${icsTekst(x.titel)}`, `LOCATION:${icsTekst(x.plek)}`, `DESCRIPTION:${icsTekst(x.uitleg || '')}`, 'BEGIN:VALARM', 'TRIGGER:-PT2H', 'ACTION:DISPLAY', `DESCRIPTION:${icsTekst(x.titel)}`, 'END:VALARM', 'END:VEVENT'));
    r.push('END:VCALENDAR');
    const tekst = r.join('\r\n'); const ios = /iPhone|iPad|iPod/.test(navigator.userAgent);
    // iPhone: de agenda opent het bestand direct ("Voeg toe"); elders downloaden
    if (ios) { location.href = 'data:text/calendar;charset=utf-8,' + encodeURIComponent(tekst); return; }
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([tekst], { type: 'text/calendar' })); a.download = `${naam}.ics`; document.body.appendChild(a); a.click(); a.remove();
  };
  const plekTekst = (S, g) => `${g.plek}${S.club.sportpark ? `, ${S.club.sportpark}` : ''}`;
  CC.on('ogAgendaOuder', (el) => { const S = CC.S(); const g = S.ontwGesprek.find((x) => x.id === el.dataset.id); const pl = M.speler(S, g.spelerId);
    CC.icsBestand(`gesprek-${pl.voornaam}`, [{ uid: g.id, datum: g.datum, tijd: g.tijd, eind: g.eind, titel: `Gesprek met de trainer over ${pl.voornaam}`, plek: plekTekst(S, g), uitleg: `Ontwikkelgesprek ${CC.tn(pl.teamId)}. Jij en ${pl.voornaam} zijn er samen bij.` }]); });
  CC.on('ogAgendaTrainer', (el) => { const S = CC.S(); const tid = CC.teamId(); const l = slots(S, tid, el.dataset.m).filter((g) => g.datum >= D.vandaag());
    if (!l.length) return CC.toast('Geen gesprekken om toe te voegen', 'fout');
    // Eén afspraak per avond (van eerste tot laatste gesprek), met de namen erin
    const perDag = {}; l.forEach((g) => { (perDag[g.datum] || (perDag[g.datum] = [])).push(g); });
    CC.icsBestand('ontwikkelgesprekken', Object.entries(perDag).map(([d, gs]) => ({ uid: `ogdag-${tid}-${d}`, datum: d, tijd: gs[0].tijd, eind: gs[gs.length - 1].eind, titel: `Ontwikkelgesprekken ${CC.tn(tid)}`, plek: plekTekst(S, gs[0]), uitleg: gs.map((g) => `${g.tijd} ${g.spelerId ? (M.speler(S, g.spelerId) || {}).voornaam || '' : 'vrij'}`).join('\n') }))); });

  // ---------- Ouder: tijd kiezen en beoordeling bekijken ----------
  CC.ouderGesprekRijen = (S, pl) => {
    const rijen = [];
    const mijn = (S.ontwGesprek || []).find((g) => g.spelerId === pl.id && g.datum >= D.vandaag());
    if (mijn) rijen.push(h.rij({ ic: 'users', titel: `Ontwikkelgesprek ${D.relatief(mijn.datum).toLowerCase()} ${mijn.tijd}`, sub: `${esc(mijn.plek)} · met ${esc(pl.voornaam)} erbij`, act: 'open', attrs: `data-view="gesprekKiezen" data-id="${pl.id}"`, kleur: 'blauw' }));
    if (mijn && CC.voorbKlaar && !CC.voorbKlaar(S, pl.id, mijn.moment)) rijen.push(h.rij({ ic: 'pencil', titel: `Bereid het gesprek voor met ${esc(pl.voornaam)}`, sub: 'Hoe goed ben je in…, wat is je droom? (5 minuten)', act: 'open', attrs: `data-view="gesprekVoorb" data-id="${pl.id}" data-m="${mijn.moment}"`, kleur: 'oranje' }));
    else if (slots(S, pl.teamId).some((g) => !g.spelerId && g.datum >= D.vandaag())) rijen.push(h.rij({ ic: 'calendar-plus', titel: 'Kies een tijd voor het ontwikkelgesprek', sub: `Met de trainer, samen met ${esc(pl.voornaam)}`, act: 'open', attrs: `data-view="gesprekKiezen" data-id="${pl.id}"`, kleur: 'oranje' }));
    CC.momenten(S).forEach((m) => { if (heeft(S, pl.id, m.id) && CC.beoordZichtbaar(S, pl.id, m.id) && !(S.beoordGezien || {})[pl.id + m.id]) rijen.push(h.rij({ ic: 'star', titel: `Beoordeling ${m.naam.toLowerCase()} van ${esc(pl.voornaam)}`, sub: 'Staat klaar', act: 'open', attrs: `data-view="beoordelingKind" data-id="${pl.id}"`, kleur: 'blauw' })); });
    return rijen;
  };
  CC.views.gesprekKiezen = (S, p) => {
    const pl = M.speler(S, p.id); const mijn = (S.ontwGesprek || []).find((g) => g.spelerId === pl.id && g.datum >= D.vandaag());
    const vrij = slots(S, pl.teamId).filter((g) => !g.spelerId && g.datum >= D.vandaag());
    const ruilen = mijn && new Date(`${mijn.datum}T${mijn.tijd}`) - new Date() > 24 * 3600e3;
    return { titel: 'Ontwikkelgesprek', html: `${mijn ? `<div class="info groen">${icon('circle-check')}<span>Jullie gesprek: <b>${D.lang(mijn.datum)} om ${mijn.tijd}</b>, ${esc(mijn.plek)}. ${esc(pl.voornaam)} is er ook bij. Het staat in je planning.</span></div>
      <button class="knop vol" data-act="open" data-view="gesprekVoorb" data-id="${pl.id}" data-m="${mijn.moment}">${icon('pencil')}${CC.voorbKlaar && CC.voorbKlaar(S, pl.id, mijn.moment) ? 'Voorbereiding bekijken' : `Bereid het gesprek voor met ${esc(pl.voornaam)}`}</button>
      <button class="knop licht vol" data-act="ogAgendaOuder" data-id="${mijn.id}">${icon('calendar-plus')}Zet in je agenda</button>
      ${ruilen ? `<button class="knop licht vol" data-act="gesprekWijzig" data-id="${mijn.id}">Andere tijd kiezen</button>` : '<p class="zacht klein">Ruilen kan tot 24 uur van tevoren. Kun je echt niet? Stuur de trainer een bericht.</p>'}` : ''}
      ${!mijn ? `<p>Kies een tijd voor het gesprek met de trainer over hoe het gaat met ${esc(pl.voornaam)}. Jij en ${esc(pl.voornaam)} zijn er allebei bij.${(() => { const dl = vrij.map((g) => g.kiesTot).filter(Boolean).sort().pop(); return dl ? ` Kies vóór of op <b>${D.lang(dl)}</b>.` : ''; })()}</p><div class="lijst">${vrij.map((g) => h.rij({ ic: 'clock', titel: `${D.lang(g.datum)} ${g.tijd}`, sub: `${esc(g.plek)}${g.actId ? ' · na de training' : ''}`, rechts: `<button class="knop klein" data-act="gesprekKies" data-id="${g.id}" data-s="${pl.id}">Kies</button>` })).join('') || h.leeg('Alle tijden zijn vergeven; de trainer neemt contact op.', 'calendar')}</div>` : ''}` };
  };
  CC.on('gesprekKies', (el) => { const S = CC.S(); const g = S.ontwGesprek.find((x) => x.id === el.dataset.id); if (g.spelerId) return CC.toast('Deze tijd is net vergeven', 'fout'); g.spelerId = el.dataset.s; CC.save(); CC.render(); CC.toast('Gekozen. Zet het meteen in je agenda met de knop.'); });
  // Ruilen (tot 24 uur vooraf): de tijd komt vrij en de trainer krijgt een melding
  CC.on('gesprekWijzig', (el) => { const S = CC.S(); const g = S.ontwGesprek.find((x) => x.id === el.dataset.id); const pl = M.speler(S, g.spelerId); g.spelerId = null;
    const trainers = M.stafVan(S, g.teamId, ['trainer']).filter((x) => x !== CC.me().id);
    if (pl && trainers.length) S.msgs.push({ id: 'b' + Date.now(), van: 'systeem', soort: 'melding', bereik: 'Ter informatie', onderwerp: `Gesprek ${D.kort(g.datum)} ${g.tijd} is weer vrij`, tekst: `De ouder van ${pl.voornaam} kiest een andere tijd. ${D.lang(g.datum)} om ${g.tijd} is weer vrij.`, tijd: new Date().toISOString(), ontvangers: trainers, gelezen: [], antw: [], urgent: false, gepland: null });
    CC.save(); CC.render(); CC.toast('Kies hieronder een andere tijd'); });
  CC.views.beoordelingKind = (S, p) => {
    const pl = M.speler(S, p.id); const t = M.team(S, pl.teamId); const c = CC.categorie(t.cat);
    const ms = CC.momenten(S).filter((m) => heeft(S, pl.id, m.id) && CC.beoordZichtbaar(S, pl.id, m.id));
    ms.forEach((m) => { (S.beoordGezien || (S.beoordGezien = {}))[pl.id + m.id] = true; }); CC.save();
    if (!ms.length) return { titel: 'Beoordeling', html: h.leeg(`Nog geen beoordeling. Die zie je een dag na het ontwikkelgesprek.`, 'star') };
    return { titel: `Beoordeling ${pl.voornaam}`, html: `<p class="zacht klein">${esc(c.naam)}, ${esc(c.vorm)}. Een beoordeling is een momentopname, bedoeld om ${esc(pl.voornaam)} verder te helpen.</p>
      ${ms.map((m, i) => { const x = S.beoord[pl.id][m.id]; const vorig = i > 0 ? S.beoord[pl.id][ms[i - 1].id] : null;
        return `<article class="kaartje"><h4>${icon('star')}${esc(m.naam)}</h4><div class="scores">${Object.entries(x.scores).map(([v, s]) => { const o = vorig && vorig.scores[v]; return `<span>${esc(v)} ${CC.scoreTekst(t, s)}${o ? (s > o ? ' <span class="groen-tekst">▲</span>' : s < o ? ' <span class="rood-tekst">▼</span>' : '') : ''}</span>`; }).join('')}</div>
          ${x.goed ? `<p><b>Wat gaat goed:</b> ${esc(x.goed)}</p>` : ''}${x.werken ? `<p><b>Waar werken we aan:</b> ${esc(x.werken)}</p>` : ''}${CC.verslagVoorOuder ? CC.verslagVoorOuder(S, pl, m.id) : ''}</article>`; }).join('')}` };
  };

  // Trainer Home: herinnering in de periode van het moment
  CC.beoordRijTrainer = (S, tid) => {
    const m = CC.momenten(S).find((x) => x.status === 'open'); if (!m || !S.club.modules.beoordeling) return '';
    const vg = voortgang(S, tid, m.id); const sl = slots(S, tid, m.id);
    return [vg.klaar < vg.totaal && CC.mag('beoordelen') ? h.rij({ ic: 'star', titel: `Beoordelingen ${m.naam.toLowerCase()}: ${vg.klaar} van ${vg.totaal}`, sub: `Graag klaar vóór ${D.kort(m.tot)}`, act: 'open', attrs: 'data-view="beoordelen"', kleur: 'oranje' }) : '',
      !sl.length && CC.mag('ontwgesprek') ? h.rij({ ic: 'calendar-plus', titel: `Plan de ${gNaam(m, true).toLowerCase()}`, sub: 'Na de training; ouders kiezen zelf een tijd', act: 'open', attrs: `data-view="gesprekken" data-m="${m.id}"`, kleur: 'oranje' }) : '',
      (() => { const vandaag = sl.filter((g) => g.spelerId && g.datum === D.vandaag()); return vandaag.length ? h.rij({ ic: 'users', titel: `Vandaag: ${vandaag.length} ${vandaag.length === 1 ? 'gesprek' : 'gesprekken'}`, sub: `Vanaf ${vandaag[0].tijd} · tik op een naam voor de gesprekspagina`, act: 'open', attrs: `data-view="gesprekken" data-m="${m.id}"`, kleur: 'blauw' }) : ''; })(),
      (() => { if (!sl.length || !CC.mag('ontwgesprek')) return ''; CC.ogHerinnering(S, tid, m.id); const z = zonderTijd(S, tid, m.id); const dl = kiesTot(S, tid, m.id);
        return z.length && dl && dl < D.vandaag() ? h.rij({ ic: 'users', titel: `${z.length} ${z.length === 1 ? 'kind heeft' : 'kinderen hebben'} nog geen gesprekstijd`, sub: 'De kiestijd is voorbij: verdeel de rest met één tik', act: 'open', attrs: `data-view="gesprekken" data-m="${m.id}"`, kleur: 'oranje' }) : ''; })()].filter(Boolean);
  };
  // HJO: voortgang per team
  CC.beoordInzicht = (S) => {
    const m = CC.actiefMoment(S);
    return `${h.sectie(`Beoordelingen · ${esc(m.naam.toLowerCase())} (${D.kort(m.van)} – ${D.kort(m.tot)})`)}<div class="staven">${S.teams.map((t) => { const vg = voortgang(S, t.id, m.id); const pct = vg.totaal ? Math.round((100 * vg.klaar) / vg.totaal) : 0; const g = slots(S, t.id, m.id); return `<div class="staaf"><span>${esc(t.naam)}</span><i class="${pct === 100 ? 'groen' : pct ? 'oranje' : 'rood'}" style="--w:${pct}%"></i><b>${vg.klaar}/${vg.totaal}</b></div>${g.length ? '' : ''}`; }).join('')}</div><p class="zacht klein">Aantal spelers beoordeeld per team. ${m.status === 'komt' ? 'Het moment is nog niet begonnen.' : ''}</p>`;
  };

  // Demo: gesprekpunten bij Jesse (moment 1, winter)
  const demo = (S) => {
    const jesse = S.players.find((p) => p.voornaam === 'Jesse' && p.teamId === 'O10-1');
    if (jesse && S.beoord[jesse.id]) { S.beoord[jesse.id].m1.goed = 'Sterk aan de bal, durft de bal te vragen.'; S.beoord[jesse.id].m1.werken = 'Aannemen met links; vaker meedoen op vrijdag.'; }
    // O10-1 heeft de gesprekken voor de winter al klaargezet; twee ouders kozen al een tijd
    S.ontwGesprek = S.ontwGesprek || [];
    const m1 = CC.momenten(S)[0]; const sp = M.spelers(S, 'O10-1'); const dag = D.addDays(m1.tot, -9);
    for (let i = 0; i < sp.length; i++) S.ontwGesprek.push({ id: 'og-demo' + i, teamId: 'O10-1', moment: 'm1', datum: dag, tijd: CC.plusMin('18:00', i * 10), eind: CC.plusMin('18:00', (i + 1) * 10), plek: 'Kantine', spelerId: null });
    sp.filter((pl) => ['Sem', 'Finn'].includes(pl.voornaam)).forEach((pl, i) => { S.ontwGesprek[i * 3].spelerId = pl.id; });
    S.beoordDemo = true;
  };
  const orig = CC.generate;
  CC.generate = function () { const S = orig(); demo(S); return S; };
  const S0 = CC.S(); if (!S0.beoordDemo) { demo(S0); CC.save(); }
})();
