// ClubComm prototype — Besluit 23: twee beoordelingsmomenten + ontwikkelgesprekken.
// Moment 1 vóór de winterstop, moment 2 aan het einde van het seizoen. De trainer beoordeelt, plant tijdsloten;
// ouders kiezen een tijd (ouder + kind zijn erbij). De ouder ziet de beoordeling een dag na het gesprek.
(function () {
  const CC = window.CC; const D = CC.date, M = CC.m, h = CC.h, icon = CC.icon, esc = CC.esc;

  // ---------- Momenten ----------
  const standaardMomenten = (S) => {
    const kerst = S.club.vakanties.find((v) => v.id === 'kerst');
    return [
      { id: 'm1', naam: 'Winter', tot: kerst ? D.addDays(kerst.van, -1) : '2026-12-18', weken: 3 },
      { id: 'm2', naam: 'Einde seizoen', tot: D.addDays(S.club.seizoen.eind, -1), weken: 3 },
    ];
  };
  CC.momenten = (S) => (S.club.momenten || (S.club.momenten = standaardMomenten(S))).map((m) => {
    const van = D.addDays(m.tot, -(m.weken * 7) + 1);
    const vandaag = D.vandaag();
    return { ...m, van, status: vandaag < van ? 'komt' : vandaag > m.tot ? 'voorbij' : 'open' };
  });
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
    const opties = c.schaal === '1-5' ? [1, 2, 3, 4, 5] : [1, 2, 3];
    const knoppen = (plId, v) => {
      const cur = b(S, plId, mid).scores[v]; const oud = vorig && S.beoord[plId] && S.beoord[plId][vorig.id] && S.beoord[plId][vorig.id].scores[v];
      const pijl = oud && cur ? (cur > oud ? '<span class="groen-tekst" title="beter dan vorig moment">▲</span>' : cur < oud ? '<span class="rood-tekst" title="lager dan vorig moment">▼</span>' : '<span class="zacht">=</span>') : '';
      return `<span class="score">${opties.map((o) => `<button class="${cur === o ? 'aan' : ''}" data-act="zetScore" data-id="${plId}" data-v="${esc(v)}" data-s="${o}" data-m="${mid}" aria-label="${o}">${CC.scoreTekst(t, o)}</button>`).join('')}${pijl}</span>`;
    };
    let body;
    if (modus === 'vaardig') {
      const v = h.segVal('beoV', c.vaardig[0]);
      body = `<div class="chips">${c.vaardig.map((x) => `<button class="chipknop ${x === v ? 'aan' : ''}" data-act="seg" data-key="beoV" data-val="${esc(x)}">${esc(x)}</button>`).join('')}</div>
        <div class="lijst">${M.spelers(S, tid).map((pl) => `<div class="rij"><span class="rij-tekst"><b>${esc(pl.voornaam)}</b></span>${knoppen(pl.id, v)}</div>`).join('')}</div>`;
    } else {
      const sp = M.spelers(S, tid); const id = h.segVal('beoSp', sp[0].id); const x = b(S, id, mid);
      body = `<select class="kies" data-change="kiesBeoSp" aria-label="Speler">${sp.map((pl) => `<option value="${pl.id}" ${pl.id === id ? 'selected' : ''}>${esc(M.naam(S, pl))}${heeft(S, pl.id, mid) ? ' ✓' : ''}</option>`).join('')}</select>
        <div class="lijst">${c.vaardig.map((v) => `<div class="rij"><span class="rij-tekst"><b>${esc(v)}</b></span>${knoppen(id, v)}</div>`).join('')}</div>
        <label class="klein-kop" for="bo-g">Wat gaat goed</label><textarea id="bo-g" rows="2" data-input="beoTekst" data-id="${id}" data-m="${mid}" data-k="goed" placeholder="Bijv. durft de bal te vragen, helpt teamgenoten">${esc(x.goed)}</textarea>
        <label class="klein-kop" for="bo-w">Waar werken we aan</label><textarea id="bo-w" rows="2" data-input="beoTekst" data-id="${id}" data-m="${mid}" data-k="werken" placeholder="Bijv. aannemen met links">${esc(x.werken)}</textarea>
        ${vorig && S.beoord[id] && S.beoord[id][vorig.id] && (S.beoord[id][vorig.id].goed || S.beoord[id][vorig.id].werken) ? `<p class="zacht klein"><b>Vorig moment (${esc(vorig.naam.toLowerCase())}):</b> ${esc(S.beoord[id][vorig.id].goed)} · werkpunt: ${esc(S.beoord[id][vorig.id].werken)}</p>` : ''}
        ${heeft(S, id, mid) && !CC.beoordZichtbaar(S, id, mid) ? `<button class="linkknop" data-act="beoDelen" data-id="${id}" data-m="${mid}">Nu al delen met de ouders</button>` : heeft(S, id, mid) ? '<p class="zacht klein">De ouders kunnen deze beoordeling zien.</p>' : ''}`;
    }
    const vg = voortgang(S, tid, mid);
    return { titel: 'Beoordelen', html: `${h.seg('beoMoment', ms.map((x) => [x.id, x.naam]), CC.actiefMoment(S).id)}
      <div class="info">${icon('info')}<span><b>${esc(m.naam)}:</b> ${D.kort(m.van)} – ${D.kort(m.tot)}${m.status === 'komt' ? ' (nog niet begonnen; je mag al starten)' : m.status === 'voorbij' ? ' (voorbij)' : ''}. ${vg.klaar} van ${vg.totaal} spelers beoordeeld. ${esc(c.naam)}, ${esc(c.vorm)}, schaal ${c.schaal === '1-5' ? '1 tot 5' : 'drie smileys'}. De ouder ziet het een dag na het ontwikkelgesprek.</span></div>
      <div class="lijst">${h.rij({ ic: 'calendar-plus', titel: 'Ontwikkelgesprekken', sub: slots(S, tid, mid).length ? `${slots(S, tid, mid).filter((g) => g.spelerId).length} van ${slots(S, tid, mid).length} tijden gekozen` : 'Nog niet gepland: zet tijden klaar, ouders kiezen zelf', act: 'open', attrs: `data-view="gesprekken" data-m="${mid}"` })}</div>
      ${h.seg('beoModus', [['vaardig', 'Per vaardigheid'], ['speler', 'Per speler + gesprekpunten']], 'vaardig')}${body}` };
  };
  CC.on('zetScore', (el) => { const S = CC.S(); b(S, el.dataset.id, el.dataset.m || CC.actiefMoment(S).id).scores[el.dataset.v] = Number(el.dataset.s); CC.save(); CC.render(); });
  CC.on('beoTekst', (el) => { const S = CC.S(); b(S, el.dataset.id, el.dataset.m)[el.dataset.k] = el.value; CC.save(); });
  CC.on('beoDelen', (el) => { const S = CC.S(); (S.beoordGedeeld || (S.beoordGedeeld = {}))[el.dataset.id + el.dataset.m] = true; CC.save(); CC.render(); CC.toast('Gedeeld; de ouders zien de beoordeling'); });

  // ---------- Trainer: gesprekken plannen ----------
  CC.views.gesprekken = (S, p) => {
    const tid = CC.teamId(); const mid = p.m || CC.actiefMoment(S).id; const m = CC.momenten(S).find((x) => x.id === mid);
    const lijst = slots(S, tid, mid); const sp = M.spelers(S, tid);
    const zonder = sp.filter((pl) => !lijst.some((g) => g.spelerId === pl.id));
    return { titel: `Ontwikkelgesprekken ${m.naam.toLowerCase()}`, html: `<div class="info">${icon('info')}<span>Zet tijden klaar; ouders kiezen zelf een tijd. Ouder en kind zijn bij het gesprek. Het gesprek komt in de planning en de agenda van de ouder; de beoordeling wordt een dag later zichtbaar.</span></div>
      ${lijst.length ? `<div class="lijst">${lijst.map((g) => { const pl = g.spelerId && M.speler(S, g.spelerId); return h.rij({ ic: 'clock', titel: `${D.kort(g.datum)} ${g.tijd}`, sub: `${esc(g.plek)} · ${pl ? esc(M.naam(S, pl)) : '<span class="oranje-tekst">nog vrij</span>'}`, rechts: pl ? '' : `<select class="kort" data-change="slotToewijzen" data-id="${g.id}" aria-label="Speler toewijzen"><option value="">Toewijzen…</option>${zonder.map((x) => `<option value="${x.id}">${esc(x.voornaam)}</option>`).join('')}</select>` }); }).join('')}</div>
        <p class="zacht klein">${zonder.length ? `Nog geen tijd: ${zonder.map((x) => esc(x.voornaam)).join(', ')}.` : 'Iedereen heeft een tijd.'}</p>` : ''}
      <form data-submit="slotsMaken" data-m="${mid}" class="kaartje codeform"><h4>${icon('calendar-plus')}Tijden klaarzetten</h4>
        <div class="twee"><div><label for="gs-d">Datum</label><input id="gs-d" name="d" type="date" required value="${D.addDays(m.tot, -9)}"></div><div><label for="gs-t">Vanaf</label><input id="gs-t" name="t" type="time" required value="18:00"></div></div>
        <div class="twee"><div><label for="gs-u">Minuten per gesprek</label><input id="gs-u" name="u" type="number" min="5" max="30" value="10"></div><div><label for="gs-n">Aantal tijden</label><input id="gs-n" name="n" type="number" min="1" max="30" value="${Math.max(1, zonder.length)}"></div></div>
        <label for="gs-p">Waar</label><input id="gs-p" name="p" value="Kantine">
        <button class="knop">Klaarzetten en ouders vragen</button></form>` };
  };
  CC.on('slotsMaken', (f) => {
    const S = CC.S(); const tid = CC.teamId(); const lijst = S.ontwGesprek || (S.ontwGesprek = []);
    const n = Number(f.n.value), u = Number(f.u.value);
    for (let i = 0; i < n; i++) lijst.push({ id: 'og' + Date.now() + i, teamId: tid, moment: f.dataset.m, datum: f.d.value, tijd: CC.plusMin(f.t.value, i * u), eind: CC.plusMin(f.t.value, (i + 1) * u), plek: f.p.value, spelerId: null });
    S.msgs.push({ id: 'b' + Date.now(), van: CC.me().id, soort: 'nieuws', bereik: tid, onderwerp: 'Kies een tijd voor het ontwikkelgesprek', tekst: `Op ${D.lang(f.d.value)} vanaf ${f.t.value} houden we de ontwikkelgesprekken (${u} minuten, ${f.p.value}). Kies in ClubComm een tijd; ouder en kind zijn er samen bij.`, tijd: new Date().toISOString(), ontvangers: M.oudersVan(S, tid), gelezen: [], antw: [], urgent: false, gepland: null, vastTot: new Date(Date.now() + 7 * 864e5).toISOString() });
    CC.save(); CC.render(); CC.toast(`${n} tijden klaargezet; ouders krijgen bericht`);
  });
  CC.on('slotToewijzen', (el) => { const S = CC.S(); const g = S.ontwGesprek.find((x) => x.id === el.dataset.id); g.spelerId = el.value || null; CC.save(); CC.render(); CC.toast('Toegewezen; de ouder krijgt bericht'); });

  // ---------- Ouder: tijd kiezen en beoordeling bekijken ----------
  CC.ouderGesprekRijen = (S, pl) => {
    const rijen = [];
    const mijn = (S.ontwGesprek || []).find((g) => g.spelerId === pl.id && g.datum >= D.vandaag());
    if (mijn) rijen.push(h.rij({ ic: 'users', titel: `Ontwikkelgesprek ${D.relatief(mijn.datum).toLowerCase()} ${mijn.tijd}`, sub: `${esc(mijn.plek)} · met ${esc(pl.voornaam)} erbij`, act: 'open', attrs: `data-view="gesprekKiezen" data-id="${pl.id}"`, kleur: 'blauw' }));
    else if (slots(S, pl.teamId).some((g) => !g.spelerId && g.datum >= D.vandaag())) rijen.push(h.rij({ ic: 'calendar-plus', titel: 'Kies een tijd voor het ontwikkelgesprek', sub: `Met de trainer, samen met ${esc(pl.voornaam)}`, act: 'open', attrs: `data-view="gesprekKiezen" data-id="${pl.id}"`, kleur: 'oranje' }));
    CC.momenten(S).forEach((m) => { if (heeft(S, pl.id, m.id) && CC.beoordZichtbaar(S, pl.id, m.id) && !(S.beoordGezien || {})[pl.id + m.id]) rijen.push(h.rij({ ic: 'star', titel: `Beoordeling ${m.naam.toLowerCase()} van ${esc(pl.voornaam)}`, sub: 'Staat klaar', act: 'open', attrs: `data-view="beoordelingKind" data-id="${pl.id}"`, kleur: 'blauw' })); });
    return rijen;
  };
  CC.views.gesprekKiezen = (S, p) => {
    const pl = M.speler(S, p.id); const mijn = (S.ontwGesprek || []).find((g) => g.spelerId === pl.id && g.datum >= D.vandaag());
    const vrij = slots(S, pl.teamId).filter((g) => !g.spelerId && g.datum >= D.vandaag());
    return { titel: 'Ontwikkelgesprek', html: `${mijn ? `<div class="info groen">${icon('circle-check')}<span>Jullie gesprek: <b>${D.lang(mijn.datum)} om ${mijn.tijd}</b>, ${esc(mijn.plek)}. ${esc(pl.voornaam)} is er ook bij. Het staat in je planning en agenda.</span></div><button class="knop licht vol" data-act="gesprekWijzig" data-id="${mijn.id}">Andere tijd kiezen</button>` : ''}
      ${!mijn ? `<p>Kies een tijd voor het gesprek met de trainer over hoe het gaat met ${esc(pl.voornaam)}. Jij en ${esc(pl.voornaam)} zijn er allebei bij.</p><div class="lijst">${vrij.map((g) => h.rij({ ic: 'clock', titel: `${D.lang(g.datum)} ${g.tijd}`, sub: esc(g.plek), rechts: `<button class="knop klein" data-act="gesprekKies" data-id="${g.id}" data-s="${pl.id}">Kies</button>` })).join('') || h.leeg('Alle tijden zijn vergeven; de trainer neemt contact op.', 'calendar')}</div>` : ''}` };
  };
  CC.on('gesprekKies', (el) => { const S = CC.S(); const g = S.ontwGesprek.find((x) => x.id === el.dataset.id); if (g.spelerId) return CC.toast('Deze tijd is net vergeven', 'fout'); g.spelerId = el.dataset.s; CC.save(); CC.render(); CC.toast('Gekozen; het staat in je planning en agenda'); });
  CC.on('gesprekWijzig', (el) => { const S = CC.S(); const g = S.ontwGesprek.find((x) => x.id === el.dataset.id); g.spelerId = null; CC.save(); CC.render(); });
  CC.views.beoordelingKind = (S, p) => {
    const pl = M.speler(S, p.id); const t = M.team(S, pl.teamId); const c = CC.categorie(t.cat);
    const ms = CC.momenten(S).filter((m) => heeft(S, pl.id, m.id) && CC.beoordZichtbaar(S, pl.id, m.id));
    ms.forEach((m) => { (S.beoordGezien || (S.beoordGezien = {}))[pl.id + m.id] = true; }); CC.save();
    if (!ms.length) return { titel: 'Beoordeling', html: h.leeg(`Nog geen beoordeling. Die zie je een dag na het ontwikkelgesprek.`, 'star') };
    return { titel: `Beoordeling ${pl.voornaam}`, html: `<p class="zacht klein">${esc(c.naam)}, ${esc(c.vorm)}. Een beoordeling is een momentopname, bedoeld om ${esc(pl.voornaam)} verder te helpen.</p>
      ${ms.map((m, i) => { const x = S.beoord[pl.id][m.id]; const vorig = i > 0 ? S.beoord[pl.id][ms[i - 1].id] : null;
        return `<article class="kaartje"><h4>${icon('star')}${esc(m.naam)}</h4><div class="scores">${Object.entries(x.scores).map(([v, s]) => { const o = vorig && vorig.scores[v]; return `<span>${esc(v)} ${CC.scoreTekst(t, s)}${o ? (s > o ? ' <span class="groen-tekst">▲</span>' : s < o ? ' <span class="rood-tekst">▼</span>' : '') : ''}</span>`; }).join('')}</div>
          ${x.goed ? `<p><b>Wat gaat goed:</b> ${esc(x.goed)}</p>` : ''}${x.werken ? `<p><b>Waar werken we aan:</b> ${esc(x.werken)}</p>` : ''}</article>`; }).join('')}` };
  };

  // Trainer Home: herinnering in de periode van het moment
  CC.beoordRijTrainer = (S, tid) => {
    const m = CC.momenten(S).find((x) => x.status === 'open'); if (!m || !S.club.modules.beoordeling) return '';
    const vg = voortgang(S, tid, m.id); const sl = slots(S, tid, m.id);
    return [vg.klaar < vg.totaal ? h.rij({ ic: 'star', titel: `Beoordelingen ${m.naam.toLowerCase()}: ${vg.klaar} van ${vg.totaal}`, sub: `Graag klaar vóór ${D.kort(m.tot)}`, act: 'open', attrs: 'data-view="beoordelen"', kleur: 'oranje' }) : '',
      !sl.length ? h.rij({ ic: 'calendar-plus', titel: 'Plan de ontwikkelgesprekken', sub: 'Zet tijden klaar; ouders kiezen zelf', act: 'open', attrs: `data-view="gesprekken" data-m="${m.id}"`, kleur: 'oranje' }) : ''].filter(Boolean);
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
