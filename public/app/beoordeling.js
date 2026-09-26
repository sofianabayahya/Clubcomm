// ClubComm — Besluit 23/65/67: twee gespreksmomenten + ontwikkelgesprekken.
// De trainer vult vooraf zijn eigen kijk in (alleen voor de staf), plant tijden na de training; ouders kiezen een tijd
// en vullen met hun kind de voorbereiding in. De ouder ziet alleen wat in het gesprek samen is afgesproken (gesprek.js).
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
  // Besluit 71: de gegevens van een gesprek horen bij een seizoen (id "2026-m1"), zodat ze volgend seizoen blijven
  // bestaan en de groei over de jaren zichtbaar is. basisId ("m1") is de instelling van de club.
  const seizoenJaar = (S) => String(S.club.seizoen.start).slice(0, 4);
  CC.momenten = (S) => { if (!S.club.momenten || (oudeStandaard(S.club.momenten) && !Object.keys(S.beoord || {}).length)) S.club.momenten = standaardMomenten(S); const jaar = seizoenJaar(S); return S.club.momenten.map((m) => {
    const van = D.addDays(m.tot, -(m.weken * 7) + 1);
    const vandaag = D.vandaag();
    return { ...m, basisId: m.id, id: `${jaar}-${m.id}`, seizoen: jaar, van, status: vandaag < van ? 'komt' : vandaag > m.tot ? 'voorbij' : 'open' };
  }); };
  // Naam van een moment, ook uit een eerder seizoen: "Start 2026/27"
  CC.momentNaam = (S, id, metSeizoen) => { const [j, b] = String(id).includes('-') ? String(id).split('-') : [seizoenJaar(S), id]; const m = (S.club.momenten || []).find((x) => x.id === b);
    const naam = m ? m.naam : b === 'm1' ? 'Start' : b === 'm2' ? 'Voorjaar' : b; return metSeizoen ? `${naam} ${j}/${String(Number(j) + 1).slice(2)}` : naam; };
  CC.actiefMoment = (S) => { const ms = CC.momenten(S); return ms.find((m) => m.status === 'open') || ms.find((m) => m.status === 'komt') || ms[ms.length - 1]; };
  const b = (S, plId, mid) => { const x = S.beoord[plId] || (S.beoord[plId] = {}); return x[mid] || (x[mid] = { scores: {}, goed: '', werken: '' }); };
  const heeft = (S, plId, mid) => { const x = S.beoord[plId] && S.beoord[plId][mid]; return !!(x && Object.keys(x.scores).length); };
  CC.beoordLaatste = (S, plId) => { const ms = CC.momenten(S).filter((m) => heeft(S, plId, m.id)); const m = ms[ms.length - 1]; return m ? { m, x: S.beoord[plId][m.id] } : null; };
  const voortgang = (S, tid, mid) => { const sp = M.spelers(S, tid); return { klaar: sp.filter((pl) => heeft(S, pl.id, mid)).length, totaal: sp.length }; };

  // ---------- Gesprekken (tijdsloten) ----------
  const slots = (S, tid, mid) => (S.ontwGesprek || []).filter((g) => g.teamId === tid && (!mid || g.moment === mid)).sort((a, b) => (a.datum + a.tijd).localeCompare(b.datum + b.tijd));
  const gesprekVan = (S, plId, mid) => (S.ontwGesprek || []).find((g) => g.spelerId === plId && (!mid || g.moment === mid));
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
    const opties = [3, 2, 1];
    const vaardig = CC.vaardigheden(S, tid);
    const knoppen = (plId, v) => {
      const cur = CC.niveau(b(S, plId, mid).scores[v]); const oud = CC.niveau(vorig && S.beoord[plId] && S.beoord[plId][vorig.id] && S.beoord[plId][vorig.id].scores[v]);
      const pijl = oud && cur ? (cur > oud ? '<span class="groen-tekst" title="beter dan vorig moment">▲</span>' : cur < oud ? '<span class="rood-tekst" title="lager dan vorig moment">▼</span>' : '<span class="zacht">=</span>') : '';
      return `<span class="niveaus">${opties.map((o) => `<button class="n${o} ${cur === o ? 'aan' : ''}" data-act="zetScore" data-id="${plId}" data-v="${esc(v)}" data-s="${o}" data-m="${mid}" aria-pressed="${cur === o}">${CC.NIVEAU_TRAINER[o]}</button>`).join('')}</span>${pijl}`;
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
        <label class="klein-kop" for="bo-g">Wat gaat goed (voor jezelf)</label><textarea id="bo-g" rows="2" data-input="beoTekst" data-id="${id}" data-m="${mid}" data-k="goed" placeholder="Bijv. durft de bal te vragen, helpt teamgenoten">${esc(x.goed)}</textarea>
        <label class="klein-kop" for="bo-w">Waar werken we aan (voor jezelf)</label><textarea id="bo-w" rows="2" data-input="beoTekst" data-id="${id}" data-m="${mid}" data-k="werken" placeholder="Bijv. aannemen met links">${esc(x.werken)}</textarea>
        ${vorig && S.beoord[id] && S.beoord[id][vorig.id] && (S.beoord[id][vorig.id].goed || S.beoord[id][vorig.id].werken) ? `<p class="zacht klein"><b>Vorig moment (${esc(vorig.naam.toLowerCase())}):</b> ${esc(S.beoord[id][vorig.id].goed)} · werkpunt: ${esc(S.beoord[id][vorig.id].werken)}</p>` : ''}
        ${CC.views.gesprekVerslag ? `<button class="knop licht klein" data-act="open" data-view="gesprekVerslag" data-id="${id}" data-m="${mid}">${icon('users')}Gesprekspagina</button>` : ''}`;
    }
    const vg = voortgang(S, tid, mid);
    return { titel: 'Jouw kijk vooraf', sub: 'Alleen voor de staf', html: `${h.seg('beoMoment', ms.map((x) => [x.id, x.naam]), CC.actiefMoment(S).id)}
      <div class="info">${icon('info')}<span><b>${esc(m.naam)}:</b> ${D.kort(m.van)} – ${D.kort(m.tot)}${m.status === 'komt' ? ' (nog niet begonnen; je mag al starten)' : m.status === 'voorbij' ? ' (voorbij)' : ''}. ${vg.klaar} van ${vg.totaal} spelers ingevuld. Dit is <b>jouw kijk</b>, uitgebreid per vaardigheid. Dit hoeft niet: bij het voorjaarsgesprek is een wapen en werkpunt per kind genoeg (op de gesprekspagina). Alleen de staf ziet het. <button class="linkknop" data-act="vaardigToevoegen">Vaardigheden aanpassen</button></span></div>
      ${CC.mag('ontwgesprek') ? '' : '<!--'}<div class="lijst">${h.rij({ ic: 'calendar-plus', titel: 'Ontwikkelgesprekken', sub: slots(S, tid, mid).length ? `${slots(S, tid, mid).filter((g) => g.spelerId).length} van ${slots(S, tid, mid).length} tijden gekozen` : 'Nog niet gepland: zet tijden klaar, ouders kiezen zelf', act: 'open', attrs: `data-view="gesprekken" data-m="${mid}"` })}</div>${CC.mag('ontwgesprek') ? '' : '-->'}
      ${h.seg('beoModus', [['vaardig', 'Per vaardigheid'], ['speler', 'Per speler + gesprekpunten']], 'vaardig')}${body}` };
  };
  CC.on('zetScoreKeuze', (el) => { const S = CC.S(); const x = b(S, el.dataset.id, el.dataset.m); if (el.value) x.scores[el.dataset.v] = Number(el.value); else delete x.scores[el.dataset.v]; CC.save(); CC.render(); });
  CC.on('zetScore', (el) => { const S = CC.S(); b(S, el.dataset.id, el.dataset.m || CC.actiefMoment(S).id).scores[el.dataset.v] = Number(el.dataset.s); el.parentNode.querySelectorAll('button').forEach((x) => { x.classList.toggle('aan', x === el); x.setAttribute('aria-pressed', String(x === el)); }); CC.save(); });
  CC.on('beoTekst', (el) => { const S = CC.S(); b(S, el.dataset.id, el.dataset.m)[el.dataset.k] = el.value; CC.save(); });

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
    // Besluit 70: de trainer is leidend. Per training kiest hij zelf: gesprekken vóór (klaar vóór het klaarzetten)
    // en/of na (na het opruimen). De app plant nooit zelf; tijden bijzetten kan per week of per twee weken.
    const trainingen = S.acts.filter((a) => a.teamId === tid && a.soort === 'training' && !a.afgelast && a.datum >= D.vandaag() && a.datum <= D.addDays(m.tot, 7)).sort((a, b) => (a.datum + a.tijd).localeCompare(b.datum + b.tijd)).slice(0, 12);
    const inst = planInst(); const gekozen = (h.segVal('ogTr', '') || '').split(',').filter((x) => trainingen.some((a) => x.startsWith(a.id + '|')));
    const nodig = zonder.length - vrij.length; const capaciteit = gekozen.reduce((n, x) => n + (x.endsWith('|v') ? inst.voor : inst.na), 0);
    const tijdenVan = (a, w) => (w === 'v' ? Array.from({ length: inst.voor }, (_, i) => CC.plusMin(a.tijd, -(inst.klaar + (inst.voor - i) * inst.u))) : Array.from({ length: inst.na }, (_, i) => CC.plusMin(a.eind, inst.opruim + i * inst.u)));
    const bereik = (a, w) => { const t = tijdenVan(a, w); return t.length ? `${t[0]}–${CC.plusMin(t[t.length - 1], inst.u)}` : ''; };
    const overzicht = lijst.length ? `${[...new Set(lijst.map((g) => g.datum))].map((d) => `${h.sectie(`${D.lang(d)}`)}<div class="lijst compact">${lijst.filter((g) => g.datum === d).map((g) => { const pl = g.spelerId && M.speler(S, g.spelerId);
        return h.rij({ ic: 'clock', titel: `${g.tijd}–${g.eind}`, sub: `${esc(g.plek)} · ${pl ? `${esc(M.naam(S, pl))}${CC.voorbKlaar && CC.voorbKlaar(S, pl.id, mid) ? ' · voorbereid ✓' : ''}${CC.momenten(S).slice(-1)[0].id === mid && CC.kijkKlaar && CC.kijkKlaar(S, pl.id, mid) ? ' · jouw kijk ✓' : ''}` : '<span class="oranje-tekst">nog vrij</span>'}`, ...(pl ? { act: 'open', attrs: `data-view="gesprekVerslag" data-id="${pl.id}" data-m="${mid}"` } : {}), rechts: pl ? '' : `<select class="kort" data-change="slotToewijzen" data-id="${g.id}" aria-label="Speler koppelen"><option value="">Koppel…</option>${zonder.map((x) => `<option value="${x.id}">${esc(x.voornaam)}</option>`).join('')}</select>` }); }).join('')}</div>`).join('')}` : '';
    const gekoppeld = lijst.filter((g) => g.spelerId && g.datum >= D.vandaag()); const nietVoorb = gekoppeld.filter((g) => !CC.voorbKlaar(S, g.spelerId, mid));
    const voorjaar = CC.momenten(S).slice(-1)[0].id === mid; const kijkNog = sp.filter((pl) => !(CC.kijkKlaar && CC.kijkKlaar(S, pl.id, mid))).length;
    const onderbouw = CC.categorie(M.team(S, tid).cat).geenGesprek ? `<div class="info">${icon('info')}<span>Ontwikkelgesprekken houden we vanaf O12: dan gaan kinderen van baas worden over de bal naar leren hoe te spelen, en worden ze zich bewuster van wat ze kunnen. Jongere kinderen leren vooral spelenderwijs. Jij beslist of je ze toch houdt.</span></div>` : '';
    const voorbereid = gekoppeld.length ? `<div class="lijst">${h.rij({ ic: 'pencil', titel: `${gekoppeld.length - nietVoorb.length} van ${gekoppeld.length} kinderen voorbereid`, sub: nietVoorb.length ? `Nog niet: ${nietVoorb.map((g) => esc((M.speler(S, g.spelerId) || {}).voornaam || '')).join(', ')}` : 'Iedereen heeft de opdracht ingevuld',
        rechts: nietVoorb.length ? `<button class="knop licht klein" data-act="ogHerinnerVoorb" data-m="${mid}">Herinner</button>` : '' })}${voorjaar ? h.rij({ ic: 'eye-off', titel: kijkNog ? `Jouw kijk (wapen en werkpunt): nog ${kijkNog} ${kijkNog === 1 ? 'kind' : 'kinderen'}` : 'Jouw kijk is klaar ✓', sub: 'Alleen voor de staf · tik op een naam hieronder', chevron: false }) : ''}</div>` : '';
    const status = lijst.length ? `<div class="info ${zonder.length ? 'oranje' : 'groen'}">${icon(zonder.length ? 'hourglass' : 'circle-check')}<span><b>${sp.length - zonder.length} van ${sp.length}</b> spelers hebben een tijd.${dl ? ` Ouders kiezen tot en met <b>${D.lang(dl)}</b>.` : ''}${zonder.length ? ` Nog niet: ${zonder.map((x) => esc(x.voornaam)).join(', ')}.` : ''}</span></div>
      <div class="knoppen">${zonder.length && vrij.length ? `<button class="knop ${dl && dl < D.vandaag() ? '' : 'licht'} klein" data-act="ogVerdeel" data-m="${mid}">${icon('users')}Verdeel de rest (${Math.min(zonder.length, vrij.length)})</button>` : ''}<button class="knop licht klein" data-act="ogAgendaTrainer" data-m="${mid}">${icon('calendar-plus')}In mijn agenda</button>${vrij.length && (!zonder.length || (dl && dl < D.vandaag())) ? `<button class="knop licht klein" data-act="ogVrijWeg" data-m="${mid}">${icon('trash-2')}Vrije tijden weghalen (${vrij.length})</button>` : ''}</div>` : '';
    const kiesTotStandaard = (() => { const d = gekozen.map((x) => (trainingen.find((a) => x.startsWith(a.id + '|')) || {}).datum).filter(Boolean).sort(); const laatste = d[d.length - 1];
      const w = D.addDays(D.vandaag(), 5); const max = laatste ? D.addDays(laatste, -3) : w; const min = D.addDays(D.vandaag(), 2); return w < max ? w : max < min ? min : max; })();
    const form = trainingen.length ? `<form data-submit="ogRondTraining" data-m="${mid}" class="kaartje codeform"><h4>${icon('calendar-plus')}${lijst.length ? 'Meer tijden rond de training' : 'Gesprekken rond de training'}</h4>
        <p class="zacht klein">Jij bepaalt wanneer. Tik per training aan: gesprekken <b>vóór</b> (klaar ${inst.klaar} min voor de start, dan zet je de training uit) en/of <b>na</b> (${inst.opruim} min na afloop, na het opruimen). Je kunt nu één of twee weken doen en later meer tijden bijzetten.</p>
        <div class="kaartje zelf plan">${trainingen.map((a) => `<div class="zelfrij"><span>${D.lang(a.datum)} <small class="zacht">training ${a.tijd}–${a.eind}</small></span><span class="niveaus">${[['v', `Vóór ${bereik(a, 'v')}`], ['n', `Na ${bereik(a, 'n')}`]].filter(([w]) => (w === 'v' ? inst.voor : inst.na) > 0).map(([w, l]) => `<button type="button" class="${gekozen.includes(`${a.id}|${w}`) ? 'aan' : ''}" data-act="ogTr" data-v="${a.id}|${w}" aria-pressed="${gekozen.includes(`${a.id}|${w}`)}">${l}</button>`).join('')}</span></div>`).join('')}</div>
        <details class="uitklap"><summary>Instellingen: ${inst.voor} vóór · ${inst.na} na · ${inst.u} min per gesprek</summary><div class="twee"><div><label for="og-v">Gesprekken vóór</label><input id="og-v" type="number" min="0" max="4" value="${inst.voor}" data-change="ogInst" data-k="voor"></div><div><label for="og-n">Gesprekken na</label><input id="og-n" type="number" min="0" max="4" value="${inst.na}" data-change="ogInst" data-k="na"></div></div>
          <div class="twee"><div><label for="og-kl">Klaarzetten (min)</label><input id="og-kl" type="number" min="0" max="90" value="${inst.klaar}" data-change="ogInst" data-k="klaar"></div><div><label for="og-op">Opruimen (min)</label><input id="og-op" type="number" min="0" max="60" value="${inst.opruim}" data-change="ogInst" data-k="opruim"></div></div>
          <label for="og-u">Minuten per gesprek</label><input id="og-u" type="number" min="5" max="30" value="${inst.u}" data-change="ogInst" data-k="u"></details>
        <label for="og-p">Waar</label><input id="og-p" name="p" value="${esc(h.segVal('ogPlek', 'Kantine'))}">
        <label for="og-k">Ouders kiezen tot en met</label><input id="og-k" name="k" type="date" required value="${kiesTotStandaard}"><p class="zacht klein">Tot die datum kiezen ouders zelf een vrije tijd. Wie dan nog niet koos, krijgt automatisch een vrije tijd (de ouders krijgen bericht en kunnen ruilen).</p>
        <p class="klein ${gekozen.length ? '' : 'zacht'}">${!gekozen.length ? `Nog ${Math.max(nodig, 0)} ${nodig === 1 ? 'kind' : 'kinderen'} zonder tijd. Tik trainingen aan.` : `<b>${capaciteit} tijden</b> voor ${Math.max(nodig, 0)} ${nodig === 1 ? 'kind' : 'kinderen'} zonder tijd.${capaciteit < nodig ? ` <span class="oranje-tekst">Nog ${nodig - capaciteit} te weinig; zet later meer tijden bij.</span>` : capaciteit > nodig ? ' Genoeg keuze voor de ouders.' : ''}`}</p>
        <button class="knop vol" ${gekozen.length ? '' : 'disabled'}>Klaarzetten en ouders vragen</button></form>` : '<p class="zacht klein">Er staan geen trainingen in deze periode. Kies hieronder een andere tijd.</p>';
    const anders = `<details class="uitklap"><summary>${icon('calendar')}Andere tijd (bijv. een aparte avond)</summary><form data-submit="slotsMaken" data-m="${mid}" class="codeform">
        <div class="twee"><div><label for="gs-d">Datum</label><input id="gs-d" name="d" type="date" required value="${D.addDays(D.vandaag(), 7)}"></div><div><label for="gs-t">Vanaf</label><input id="gs-t" name="t" type="time" required value="18:00"></div></div>
        <div class="twee"><div><label for="gs-u">Minuten per gesprek</label><input id="gs-u" name="u" type="number" min="5" max="30" value="15"></div><div><label for="gs-n">Aantal tijden</label><input id="gs-n" name="n" type="number" min="1" max="30" value="${Math.max(1, nodig)}"></div></div>
        <label for="gs-p">Waar</label><input id="gs-p" name="p" value="Kantine"><label for="gs-k">Ouders kiezen tot en met</label><input id="gs-k" name="k" type="date" value="${D.addDays(D.vandaag(), 5)}">
        <button class="knop licht">Klaarzetten en ouders vragen</button></form></details>`;
    return { titel: gNaam(m, true), sub: `${D.kort(m.van)} – ${D.kort(m.tot)} · ouder en kind samen`,
      html: `${onderbouw}${status}${voorbereid}${overzicht}${zonder.length ? form + anders : ''}` };
  };
  // Herinnering aan ouders die de opdracht nog niet invulden (de trainer beslist, Besluit 67)
  CC.on('ogHerinnerVoorb', (el) => { const S = CC.S(); const tid = CC.teamId(); const mid = el.dataset.m; const l = slots(S, tid, mid).filter((g) => g.spelerId && g.datum >= D.vandaag() && !CC.voorbKlaar(S, g.spelerId, mid));
    if (!l.length) return; const me = CC.me().id;
    l.forEach((g) => { const pl = M.speler(S, g.spelerId); if (!pl) return; S.msgs.push({ id: 'b' + Date.now() + pl.id, van: me, soort: 'persoonlijk', bereik: `${pl.voornaam} (${CC.tn(pl.teamId)})`, onderwerp: `Voorbereiding gesprek ${pl.voornaam}`, tekst: `Het gesprek over ${pl.voornaam} is ${D.lang(g.datum)} om ${g.tijd}. Willen jullie de korte opdracht in ClubComm nog samen invullen? Het duurt ongeveer 10 minuten (Home → Bereid het gesprek voor).`, tijd: new Date().toISOString(), ontvangers: pl.ouders, gelezen: [me], antw: [], urgent: false, gepland: null, herinnering: true }); });
    CC.save(); CC.render(); CC.toast(`Herinnering gestuurd aan ${l.length} ${l.length === 1 ? 'gezin' : 'gezinnen'}`); });
  // Instellingen voor het plannen: onthouden op deze telefoon (per trainer), standaard 2 vóór, 2 na, 15 min, 45 min klaarzetten, 15 min opruimen
  const PLAN = 'clubcomm-gesprekplan-v1';
  const planInst = () => { let x = {}; try { x = JSON.parse(localStorage.getItem(PLAN)) || {}; } catch (e) { /* */ } return { voor: 2, na: 2, u: 15, klaar: 45, opruim: 15, ...x }; };
  CC.on('ogInst', (el) => { const x = planInst(); const grens = { voor: [0, 4], na: [0, 4], u: [5, 30], klaar: [0, 90], opruim: [0, 60] }[el.dataset.k]; x[el.dataset.k] = Math.max(grens[0], Math.min(grens[1], Number(el.value) || 0)); if (el.dataset.k === 'u' && !x.u) x.u = 15;
    try { localStorage.setItem(PLAN, JSON.stringify(x)); } catch (e) { /* */ } const pl = document.getElementById('og-p'); if (pl) CC.ui.seg.ogPlek = pl.value; CC.render(); });
  CC.on('ogTr', (el) => { const l = (CC.ui.seg.ogTr || '').split(',').filter(Boolean); const i = l.indexOf(el.dataset.v); if (i < 0) l.push(el.dataset.v); else l.splice(i, 1); CC.ui.seg.ogTr = l.join(','); const pl = document.getElementById('og-p'); if (pl) CC.ui.seg.ogPlek = pl.value; CC.render(); });
  // Vrije tijden weghalen (na de kiesdatum, of als iedereen een tijd heeft)
  CC.on('ogVrijWeg', (el) => { const S = CC.S(); const tid = CC.teamId(); const mid = el.dataset.m; const weg = slots(S, tid, mid).filter((g) => !g.spelerId && g.datum >= D.vandaag());
    CC.sheet('Vrije tijden weghalen', `<p><b>${weg.length}</b> ${weg.length === 1 ? 'tijd is' : 'tijden zijn'} niet gekozen. Weghalen? Ouders kunnen ze dan niet meer kiezen.</p><div class="knoppen kolom"><button class="knop" data-act="ogVrijWegOk" data-m="${mid}">Weghalen</button><button class="knop licht" data-act="sluit">Annuleren</button></div>`); });
  CC.on('ogVrijWegOk', (el) => { const S = CC.S(); const tid = CC.teamId(); const mid = el.dataset.m; const voor = S.ontwGesprek.length;
    S.ontwGesprek = S.ontwGesprek.filter((g) => !(g.teamId === tid && g.moment === mid && !g.spelerId && g.datum >= D.vandaag())); const n = voor - S.ontwGesprek.length; CC.save(); CC.closeSheet(); CC.render(); CC.toast(`${n} vrije ${n === 1 ? 'tijd' : 'tijden'} weggehaald`); });
  const vraagOuders = (S, tid, mid, tekst) => {
    const m = CC.momenten(S).find((x) => x.id === mid);
    tekst += '\n\nDaarna staat er in ClubComm een korte opdracht voor je kind (10 minuten): waar ben je sterk in, wat is je wapen, wat wil je leren? Laat je kind zelf kiezen; jij helpt met lezen. In het gesprek leggen we het naast elkaar.';
    S.msgs.push({ id: 'b' + Date.now(), van: CC.me().id, soort: 'nieuws', bereik: tid, onderwerp: `Kies een tijd voor het ${gNaam(m).toLowerCase()}`, tekst, tijd: new Date().toISOString(), ontvangers: [...new Set(zonderTijd(S, tid, mid).flatMap((pl) => pl.ouders))], gelezen: [], antw: [], urgent: false, gepland: null });
  };
  CC.on('ogRondTraining', (f) => {
    const S = CC.S(); const tid = CC.teamId(); const mid = f.dataset.m; const lijst = S.ontwGesprek || (S.ontwGesprek = []); const inst = planInst(); const u = inst.u; const plek = f.p.value.trim() || 'Kantine';
    const keuzes = (CC.ui.seg.ogTr || '').split(',').filter(Boolean).map((x) => { const [id, w] = x.split('|'); return { a: M.act(S, id), w }; }).filter((x) => x.a).sort((x, y) => (x.a.datum + x.w).localeCompare(y.a.datum + y.w));
    if (!keuzes.length) return CC.toast('Tik minstens één training aan', 'fout');
    const zonderVooraf = zonderTijd(S, tid, mid).length; let n = 0; const bestaat = (d, t) => lijst.some((g) => g.teamId === tid && g.datum === d && g.tijd === t);
    keuzes.forEach(({ a, w }, j) => { const tijden = w === 'v' ? Array.from({ length: inst.voor }, (_, i) => CC.plusMin(a.tijd, -(inst.klaar + (inst.voor - i) * u))) : Array.from({ length: inst.na }, (_, i) => CC.plusMin(a.eind, inst.opruim + i * u));
      tijden.forEach((t, i) => { if (bestaat(a.datum, t)) return; lijst.push({ id: `og${Date.now()}${j}${i}`, teamId: tid, moment: mid, datum: a.datum, tijd: t, eind: CC.plusMin(t, u), plek, spelerId: null, actId: a.id, wanneer: w === 'v' ? 'voor' : 'na', kiesTot: f.k.value }); n++; }); });
    const dagen = [...new Set(keuzes.map((x) => x.a.datum))];
    if (n && zonderVooraf) vraagOuders(S, tid, mid, `Rond de training op ${dagen.map((d) => D.lang(d)).join(', ')} houden we korte gesprekken van ${u} minuten (${plek}) over hoe het gaat met je kind: vóór of na de training. Jij en je kind zijn er samen bij.\n\nKies vóór of op ${D.lang(f.k.value)} een tijd in ClubComm. Heb je dan nog niet gekozen, dan krijg je een tijd van ons.`);
    CC.ui.seg.ogTr = ''; CC.save(); CC.render(); CC.toast(n ? `${n} tijden klaargezet${zonderVooraf ? '; ouders zonder tijd krijgen bericht' : ''}` : 'Deze tijden stonden er al');
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
  const verdeel = (S, tid, mid, door) => { const z = zonderTijd(S, tid, mid); const v = slots(S, tid, mid).filter((g) => !g.spelerId && g.datum >= D.vandaag()); let n = 0;
    z.forEach((pl, i) => { const g = v[i]; if (!g) return; g.spelerId = pl.id; reservering(S, g, pl, door); n++; }); return n; };
  CC.on('ogVerdeelOk', (el) => { const S = CC.S(); const n = verdeel(S, CC.teamId(), el.dataset.m, CC.me().id);
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
    if (mijn && CC.voorbKlaar && !CC.voorbKlaar(S, pl.id, mijn.moment)) rijen.push(h.rij({ ic: 'pencil', titel: `Bereid het gesprek voor met ${esc(pl.voornaam)}`, sub: 'Opdracht: waar ben je sterk in, wat is je wapen? (10 minuten)', act: 'open', attrs: `data-view="gesprekVoorb" data-id="${pl.id}" data-m="${mijn.moment}"`, kleur: 'oranje' }));
    else if (slots(S, pl.teamId).some((g) => !g.spelerId && g.datum >= D.vandaag())) rijen.push(h.rij({ ic: 'calendar-plus', titel: 'Kies een tijd voor het ontwikkelgesprek', sub: `Met de trainer, samen met ${esc(pl.voornaam)}`, act: 'open', attrs: `data-view="gesprekKiezen" data-id="${pl.id}"`, kleur: 'oranje' }));
    CC.momenten(S).forEach((m) => { if (CC.ontwZichtbaar(S, pl.id, m.id) && !(S.beoordGezien || {})[pl.id + m.id]) rijen.push(h.rij({ ic: 'flag', titel: `Afspraken uit het gesprek over ${esc(pl.voornaam)}`, sub: 'Wapen, werkpunt en doelen', act: 'open', attrs: `data-view="beoordelingKind" data-id="${pl.id}"`, kleur: 'blauw' })); });
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
      ${!mijn ? `<p>Kies een tijd voor het gesprek met de trainer over hoe het gaat met ${esc(pl.voornaam)}. Jij en ${esc(pl.voornaam)} zijn er allebei bij.${(() => { const dl = vrij.map((g) => g.kiesTot).filter(Boolean).sort().pop(); return dl ? ` Kies vóór of op <b>${D.lang(dl)}</b>.` : ''; })()}</p><div class="lijst">${vrij.map((g) => h.rij({ ic: 'clock', titel: `${D.lang(g.datum)} ${g.tijd}`, sub: `${esc(g.plek)}${g.actId ? (g.wanneer === 'voor' ? ' · vóór de training' : ' · na de training') : ''}`, rechts: `<button class="knop klein" data-act="gesprekKies" data-id="${g.id}" data-s="${pl.id}">Kies</button>` })).join('') || h.leeg('Alle tijden zijn vergeven; de trainer neemt contact op.', 'calendar')}</div>` : ''}` };
  };
  CC.on('gesprekKies', (el) => { const S = CC.S(); const g = S.ontwGesprek.find((x) => x.id === el.dataset.id); if (g.spelerId) return CC.toast('Deze tijd is net vergeven', 'fout'); g.spelerId = el.dataset.s; CC.save(); CC.render(); CC.toast('Gekozen. Zet het meteen in je agenda met de knop.'); });
  // Ruilen (tot 24 uur vooraf): de tijd komt vrij en de trainer krijgt een melding
  CC.on('gesprekWijzig', (el) => { const S = CC.S(); const g = S.ontwGesprek.find((x) => x.id === el.dataset.id); const pl = M.speler(S, g.spelerId); g.spelerId = null;
    const trainers = M.stafVan(S, g.teamId, ['trainer']).filter((x) => x !== CC.me().id);
    if (pl && trainers.length) S.msgs.push({ id: 'b' + Date.now(), van: 'systeem', soort: 'melding', bereik: 'Ter informatie', onderwerp: `Gesprek ${D.kort(g.datum)} ${g.tijd} is weer vrij`, tekst: `De ouder van ${pl.voornaam} kiest een andere tijd. ${D.lang(g.datum)} om ${g.tijd} is weer vrij.`, tijd: new Date().toISOString(), ontvangers: trainers, gelezen: [], antw: [], urgent: false, gepland: null });
    CC.save(); CC.render(); CC.toast('Kies hieronder een andere tijd'); });
  // Ouder en kind: alleen wat samen is afgesproken, per gesprek (nooit de kijk van de trainer; Besluit 67)
  CC.views.beoordelingKind = (S, p) => {
    const pl = M.speler(S, p.id);
    const ms = CC.gesprekkenGehad(S, pl.id);
    ms.forEach((m) => { (S.beoordGezien || (S.beoordGezien = {}))[pl.id + m.id] = true; }); CC.save();
    if (!ms.length) return { titel: 'Ontwikkeling', html: h.leeg('Hier komen de afspraken uit het ontwikkelgesprek te staan.', 'flag') };
    return { titel: `Ontwikkeling ${pl.voornaam}`, html: `<p class="zacht klein">Wat ${esc(pl.voornaam)} en de trainer samen hebben afgesproken, ook uit eerdere seizoenen. Het is geen rapport, maar een plan om verder te groeien: waar kom je vandaan, waar sta je nu.</p>
      ${ms.map((m) => `<article class="kaartje"><h4>${icon('flag')}${esc(m.label)}</h4>${CC.verslagVoorOuder(S, pl, m.id)}</article>`).join('')}` };
  };

  // Trainer Home: herinnering in de periode van het moment
  CC.beoordRijTrainer = (S, tid) => {
    const m = CC.momenten(S).find((x) => x.status === 'open'); if (!m || !S.club.modules.beoordeling) return '';
    const verplaatst = CC.ogAfgelast(S); if (verplaatst) CC.toast(`${verplaatst} ${verplaatst === 1 ? 'gesprek gaat' : 'gesprekken gaan'} niet door (training afgelast); de ouders kiezen een nieuwe tijd`);
    const sl = slots(S, tid, m.id); const zonderNu = sl.length ? zonderTijd(S, tid, m.id) : []; const vrijNu = sl.filter((g) => !g.spelerId && g.datum >= D.vandaag());
    // Besluit 68: alleen vóór het voorjaarsgesprek vraagt de app om jouw kijk (wapen en werkpunt per kind)
    const voorjaar = CC.momenten(S).slice(-1)[0].id === m.id; const kijkNog = voorjaar ? M.spelers(S, tid).filter((pl) => !CC.kijkKlaar(S, pl.id, m.id)).length : 0;
    return [kijkNog && sl.some((g) => g.spelerId) && CC.mag('beoordelen') ? h.rij({ ic: 'eye-off', titel: `Jouw kijk vóór de voorjaarsgesprekken: nog ${kijkNog} ${kijkNog === 1 ? 'kind' : 'kinderen'}`, sub: 'Per kind een wapen en een werkpunt · alleen voor de staf', act: 'open', attrs: `data-view="gesprekken" data-m="${m.id}"`, kleur: 'oranje' }) : '',
      sl.length && zonderNu.length && !vrijNu.length && CC.mag('ontwgesprek') && m.status === 'open' ? h.rij({ ic: 'calendar-plus', titel: `${zonderNu.length} ${zonderNu.length === 1 ? 'kind heeft' : 'kinderen hebben'} geen gesprekstijd en er zijn geen vrije tijden`, sub: 'Zet nieuwe tijden klaar', act: 'open', attrs: `data-view="gesprekken" data-m="${m.id}"`, kleur: 'oranje' }) : '',
      !sl.length && CC.mag('ontwgesprek') ? h.rij({ ic: 'calendar-plus', titel: `Plan de ${gNaam(m, true).toLowerCase()}`, sub: 'Jij kiest de trainingen (vóór of na); ouders kiezen een tijd', act: 'open', attrs: `data-view="gesprekken" data-m="${m.id}"`, kleur: 'oranje' }) : '',
      (() => { const vandaag = sl.filter((g) => g.spelerId && g.datum === D.vandaag()); return vandaag.length ? h.rij({ ic: 'users', titel: `Vandaag: ${vandaag.length} ${vandaag.length === 1 ? 'gesprek' : 'gesprekken'}`, sub: `Vanaf ${vandaag[0].tijd} · tik op een naam voor de gesprekspagina`, act: 'open', attrs: `data-view="gesprekken" data-m="${m.id}"`, kleur: 'blauw' }) : ''; })(),
      (() => { if (!sl.length || !CC.mag('ontwgesprek')) return ''; CC.ogHerinnering(S, tid, m.id); const z = zonderTijd(S, tid, m.id); const dl = kiesTot(S, tid, m.id);
        return z.length && dl && dl < D.vandaag() ? h.rij({ ic: 'users', titel: `${z.length} ${z.length === 1 ? 'kind heeft' : 'kinderen hebben'} nog geen gesprekstijd`, sub: 'De kiestijd is voorbij: verdeel de rest met één tik', act: 'open', attrs: `data-view="gesprekken" data-m="${m.id}"`, kleur: 'oranje' }) : ''; })()].filter(Boolean);
  };
  // HJO (Besluit 71): per team hoeveel ontwikkelgesprekken zijn gevoerd (vanaf O12)
  const gehadTeam = (S, tid, mid) => { const sp = M.spelers(S, tid); return { gehad: sp.filter((pl) => CC.ontwZichtbaar(S, pl.id, mid)).length, gepland: sp.filter((pl) => slots(S, tid, mid).some((g) => g.spelerId === pl.id)).length, totaal: sp.length }; };
  const gespreksTeams = (S) => S.teams.filter((t) => !CC.categorie(t.cat).geenGesprek && M.spelers(S, t.id).length);
  CC.beoordInzicht = (S) => {
    const m = CC.actiefMoment(S); const teams = gespreksTeams(S); if (!teams.length) return '';
    return `${h.sectie(`Ontwikkelgesprekken · ${esc(m.naam.toLowerCase())} (${D.kort(m.van)} – ${D.kort(m.tot)})`)}<div class="staven">${teams.map((t) => { const x = gehadTeam(S, t.id, m.id); const pct = x.totaal ? Math.round((100 * x.gehad) / x.totaal) : 0;
      return `<div class="staaf"><span>${esc(t.naam)}</span><i class="${pct === 100 ? 'groen' : m.status === 'voorbij' ? 'rood' : 'oranje'}" style="--w:${pct}%"></i><b>${x.gehad}/${x.totaal}</b></div>`; }).join('')}</div><p class="zacht klein">Gevoerde gesprekken per team (vanaf O12). ${m.status === 'komt' ? 'De periode is nog niet begonnen.' : m.status === 'open' ? 'De periode loopt nog.' : ''}</p>`;
  };
  // HJO Home: na de periode een signaal bij teams waar niet alle gesprekken zijn gevoerd (tot 6 weken erna)
  CC.ogAandacht = (S) => {
    const m = CC.momenten(S).filter((x) => x.status === 'voorbij' && D.addDays(x.tot, 42) >= D.vandaag()).pop(); if (!m || !S.club.modules.beoordeling) return null;
    const achter = gespreksTeams(S).map((t) => ({ t, x: gehadTeam(S, t.id, m.id) })).filter(({ x }) => x.gehad < x.totaal); if (!achter.length) return null;
    return h.rij({ ic: 'users', titel: `${gNaam(m, true)}: ${achter.length} ${achter.length === 1 ? 'team' : 'teams'} niet helemaal gevoerd`, sub: achter.map(({ t, x }) => `${esc(t.naam)} ${x.gehad}/${x.totaal}`).join(' · '), act: 'tab', attrs: 'data-tab="inzicht"', kleur: 'oranje' });
  };
  // Besluit 76: zonder extra tik voor de trainer. Na de kiesdatum deelt de app de rest in; 2 dagen voor elk gesprek een
  // herinnering aan wie de opdracht nog niet invulde; na afloop telt een gesprek met ingevulde doelen als gehad (gesprek.js).
  CC.ogAuto = (S) => { const me = CC.me(); if (!me || !S.club.modules.beoordeling) return false; let veranderd = false; const v = D.vandaag();
    const teams = [...new Set((S.ontwGesprek || []).map((g) => g.teamId))].filter((tid) => M.stafVan(S, tid).includes(me.id));
    teams.forEach((tid) => CC.momenten(S).forEach((m) => {
      const sl = slots(S, tid, m.id); if (!sl.length) return; const dl = kiesTot(S, tid, m.id);
      if (dl && dl < v && !sl.some((g) => g.autoVerdeeld) && verdeel(S, tid, m.id, me.id)) { sl.forEach((g) => { g.autoVerdeeld = true; }); veranderd = true; }
      sl.filter((g) => g.spelerId && !g.voorbHerinnerd && g.datum >= v && D.addDays(g.datum, -2) <= v && !CC.voorbKlaar(S, g.spelerId, m.id)).forEach((g) => {
        const pl = M.speler(S, g.spelerId); if (!pl) return; g.voorbHerinnerd = new Date().toISOString(); veranderd = true;
        S.msgs.push({ id: 'b' + Date.now() + pl.id, van: me.id, soort: 'persoonlijk', bereik: `${pl.voornaam} (${CC.tn(pl.teamId)})`, onderwerp: `Voorbereiding gesprek ${pl.voornaam}`, tekst: `Het gesprek over ${pl.voornaam} is ${D.lang(g.datum)} om ${g.tijd}. Willen jullie de korte opdracht in ClubComm nog samen invullen? Het duurt ongeveer 10 minuten (Home → Bereid het gesprek voor).`, tijd: new Date().toISOString(), ontvangers: pl.ouders, gelezen: [me.id], antw: [], urgent: false, gepland: null, herinnering: true }); });
      if (CC.ogAutoGehad && CC.ogAutoGehad(S, sl)) veranderd = true;
    }));
    return veranderd; };
  // Afgelaste of verplaatste training (Besluit 71): de gesprekken eromheen gaan niet door. Ouders met een gesprek krijgen
  // bericht en kiezen een nieuwe tijd; de tijden verdwijnen. Alleen door de staf van het team (die mag de tijden wijzigen).
  CC.ogAfgelast = (S) => {
    const me = CC.me(); if (!me) return 0;
    const weg = (S.ontwGesprek || []).filter((g) => { if (!g.actId || g.datum < D.vandaag() || !M.stafVan(S, g.teamId).includes(me.id)) return false; const a = M.act(S, g.actId); return !a || a.afgelast || a.datum !== g.datum; });
    if (!weg.length) return 0;
    weg.filter((g) => g.spelerId).forEach((g) => { const pl = M.speler(S, g.spelerId); if (!pl) return;
      S.msgs.push({ id: 'b' + Date.now() + pl.id, van: me.id, soort: 'persoonlijk', bereik: `${pl.voornaam} (${CC.tn(pl.teamId)})`, onderwerp: `Gesprek over ${pl.voornaam} gaat niet door`, tekst: `De training van ${D.lang(g.datum)} gaat niet door of is verplaatst. Het gesprek over ${pl.voornaam} om ${g.tijd} gaat daarom ook niet door.\n\nKies in ClubComm een nieuwe tijd (Home). Zijn er geen tijden meer, dan zet de trainer er nieuwe klaar.`, tijd: new Date().toISOString(), ontvangers: pl.ouders, gelezen: [me.id], antw: [], urgent: false, gepland: null }); });
    S.ontwGesprek = S.ontwGesprek.filter((g) => !weg.includes(g)); CC.save();
    return weg.filter((g) => g.spelerId).length;
  };

  // Demo: gesprekpunten bij Jesse (moment 1, winter)
  const demo = (S) => {
    const jesse = S.players.find((p) => p.voornaam === 'Jesse' && p.teamId === 'O10-1');
    const m1 = CC.momenten(S)[0];
    if (jesse && S.beoord[jesse.id] && S.beoord[jesse.id][m1.id]) { S.beoord[jesse.id][m1.id].goed = 'Sterk aan de bal, durft de bal te vragen.'; S.beoord[jesse.id][m1.id].werken = 'Aannemen met links; vaker meedoen op vrijdag.'; }
    // O10-1 heeft de gesprekken voor de winter al klaargezet; twee ouders kozen al een tijd
    S.ontwGesprek = S.ontwGesprek || [];
    const sp = M.spelers(S, 'O10-1'); const dag = D.addDays(m1.tot, -9);
    for (let i = 0; i < sp.length; i++) S.ontwGesprek.push({ id: 'og-demo' + i, teamId: 'O10-1', moment: m1.id, datum: dag, tijd: CC.plusMin('18:00', i * 10), eind: CC.plusMin('18:00', (i + 1) * 10), plek: 'Kantine', spelerId: null });
    sp.filter((pl) => ['Sem', 'Finn'].includes(pl.voornaam)).forEach((pl, i) => { S.ontwGesprek[i * 3].spelerId = pl.id; });
    S.beoordDemo = true;
  };
  const orig = CC.generate;
  CC.generate = function () { const S = orig(); demo(S); return S; };
  const S0 = CC.S(); if (!S0.beoordDemo) { demo(S0); CC.save(); }
})();
