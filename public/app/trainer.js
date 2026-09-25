// ClubComm prototype — Trainer (Besluit 7): Home · Aanwezigheid · Berichten · Spelers · Speeltijd
(function () {
  const CC = window.CC; const D = CC.date, M = CC.m, h = CC.h, icon = CC.icon, esc = CC.esc;

  // ---------- Aanwezigheid opnemen (herbruikbaar: trainer, teamleider, wedstrijdbegeleider) ----------
  // Invullen kan vanaf de dag zelf tot een instelbaar aantal uur na de start (clubinstelling, standaard 48)
  const opnemenUur = () => CC.S().club.inst.opnemenUur || 48;
  CC.opnemenTot = (a) => new Date(D.start(a).getTime() + opnemenUur() * 3600e3);
  const kanOpnemen = (a) => !a.afgelast && a.datum <= D.vandaag() && new Date() < CC.opnemenTot(a);
  const volgende = { a: 'l', l: 'x', x: 'a' };
  CC.opnemenHtml = (S, a) => {
    const ui = CC.ui;
    const sp = M.spelers(S, a.teamId);
    const opgeslagen = S.pres[a.id];
    // Concept van de lijst. Bij elke weergave bijwerken: nieuwe spelers (net goedgekeurd) komen erbij en een afmelding
    // die intussen binnenkwam telt mee. Alleen wat de trainer zelf heeft aangetikt, blijft staan.
    const standaard = (pl) => { const st = M.status(S, pl, a); return opgeslagen && opgeslagen.s[pl.id] ? opgeslagen.s[pl.id] : ['afgemeld', 'langdurig', 'open'].includes(st.code) ? 'x' : 'a'; };
    if (!ui.draft || ui.draft.actId !== a.id) ui.draft = { actId: a.id, s: {}, getikt: {} };
    const ids = new Set(sp.map((pl) => pl.id));
    Object.keys(ui.draft.s).forEach((id) => { if (!ids.has(id)) delete ui.draft.s[id]; });
    sp.forEach((pl) => { if (!ui.draft.getikt[pl.id]) ui.draft.s[pl.id] = standaard(pl); });
    const d = ui.draft.s;
    const n = Object.values(d).filter((v) => v !== 'x').length;
    if (!kanOpnemen(a)) {
      const reden = a.afgelast ? 'Deze activiteit is afgelast.' : a.datum > D.vandaag() ? 'Aanwezigheid opnemen kan vanaf de dag zelf.' : `Invullen en corrigeren kon tot ${opnemenUur()} uur na de start.`;
      return `<div class="info">${icon('info')}<span>${reden}</span></div><div class="lijst compact">${sp.map((pl) => h.rij({ ic: h.avatar(pl.voornaam), titel: esc(M.naam(S, pl)), rechts: h.chip(M.status(S, pl, a)) })).join('')}</div>`;
    }
    return `<p class="zacht klein">Iedereen staat op aanwezig. Tik op een naam: aanwezig → te laat → afwezig.</p>
      <div class="opnemen">${sp.map((pl) => {
        const st = M.status(S, pl, a); const v = d[pl.id];
        const sub = st.code === 'afgemeld' ? `Afgemeld: ${esc(st.afm.reden)}` : st.code === 'langdurig' ? 'Langdurig afwezig' : '';
        return `<button class="speler ${v}" data-act="tikSpeler" data-id="${pl.id}" aria-label="${esc(pl.voornaam)}: ${v === 'a' ? 'aanwezig' : v === 'l' ? 'te laat' : 'afwezig'}">
          <span class="sp-ic">${icon(v === 'a' ? 'check' : v === 'l' ? 'clock' : 'x')}</span><span class="rij-tekst"><b>${esc(M.naam(S, pl))}</b>${sub ? `<small>${sub}</small>` : ''}</span><span class="sp-status">${v === 'a' ? 'Aanwezig' : v === 'l' ? 'Te laat' : 'Afwezig'}</span></button>`;
      }).join('')}</div>
      <div class="plakvoet"><span><b>${n}</b> van ${sp.length} aanwezig</span><button class="knop" data-act="opslaanAanwezigheid" data-id="${a.id}">${opgeslagen ? 'Wijziging opslaan' : 'Opslaan'}</button></div>`;
  };
  CC.on('tikSpeler', (el) => { const d = CC.ui.draft.s; d[el.dataset.id] = volgende[d[el.dataset.id]]; (CC.ui.draft.getikt || (CC.ui.draft.getikt = {}))[el.dataset.id] = true; CC.render(); });
  CC.on('opslaanAanwezigheid', (el) => {
    const S = CC.S(); const a = M.act(S, el.dataset.id); const me = CC.me(); const t = M.team(S, a.teamId);
    const voor = {}; M.spelers(S, a.teamId).forEach((pl) => { voor[pl.id] = M.kaarten(S, pl).ev.length; });
    S.pres[a.id] = { s: { ...CC.ui.draft.s }, door: me.id, tijd: new Date().toISOString() };
    let herinnering = 0, kaarten = 0;
    M.spelers(S, a.teamId).forEach((pl) => {
      const k = M.kaarten(S, pl); const nieuw = k.ev.filter((e) => e.act.id === a.id);
      if (k.ev.length <= voor[pl.id]) return;
      nieuw.forEach((e) => {
        const tl = M.persoon(S, t.teamleiderId || t.trainerId);
        const wanneer = `de ${M.isWed(a) ? 'wedstrijd' : a.soort === 'activiteit' ? 'activiteit' : 'training'} van ${D.lang(a.datum)}`;
        const tekst = e.kaart === 'herinnering'
          ? S.club.inst.waarschuwing.replace(/\[kind\]/g, pl.voornaam).replace('[team]', t.naam).replace('[deadline]', `${M.inst(S, t.id).deadlineTraining} uur`).replace('[teamleider]', tl ? tl.naam : 'de trainer') + (e.laatsteHerinnering ? '\n\nLet op: dit was de laatste vriendelijke herinnering van dit seizoen. Hierna volgt een kaart.' : '')
          : e.kaart === 'geel' ? `${pl.voornaam}: te laat afgemeld voor ${wanneer}. Dit is geregistreerd als gele kaart. Twee gele kaarten zijn samen een rode kaart. Een kaart is een registratie, geen straf; tik op de statusregel in de app voor uitleg.`
          : `${pl.voornaam}: ${e.tweedeGeel ? 'opnieuw te laat afgemeld' : 'niet afgemeld en niet gekomen'} bij ${wanneer}. Dit is ${e.tweedeGeel ? 'de tweede gele kaart, samen een rode kaart' : 'een rode kaart'}. De trainer of ${esc(S.club.labels.hjo)} neemt contact met je op: kunnen we ergens mee helpen?`;
        S.msgs.push({ id: 'b' + Date.now() + pl.id, van: 'systeem', soort: 'persoonlijk', bereik: `ouders van ${pl.voornaam}`, onderwerp: e.kaart === 'herinnering' ? 'Vriendelijke herinnering' : e.kaart === 'geel' ? 'Gele kaart' : 'Rode kaart', tekst, tijd: new Date().toISOString(), ontvangers: pl.ouders, gelezen: [], antw: [], urgent: false, gepland: null });
        if (e.kaart === 'herinnering') herinnering++; else kaarten++;
      });
    });
    CC.save(); CC.ui.draft = null; CC.render();
    CC.toast(`Opgeslagen${herinnering ? ` · ${herinnering} vriendelijke herinnering${herinnering > 1 ? 'en' : ''} verstuurd` : ''}${kaarten ? ` · ${kaarten} kaart${kaarten > 1 ? 'en' : ''}` : ''}`);
  });
  CC.views.opnemen = (S, p) => { const a = M.act(S, p.id); return { titel: 'Aanwezigheid', html: `<div class="kaart-kop los">${h.datumBlok(a)}<div><b>${h.actTitel(S, a)}</b><small>${D.lang(a.datum)} · ${a.tijd}</small></div></div>${CC.opnemenHtml(S, a)}` }; };

  // ---------- Speeltijd (gedeeld met teamleider, module) ----------
  // opties.alleenSchema: voor de timekeeper (ouder) alleen het wisselschema van deze wedstrijd, zonder seizoenscijfers
  CC.speeltijdHtml = (S, teamId, opties = {}) => {
    const wedstrijden = M.komend(S, teamId, 10).filter((a) => M.isWed(a) && !a.afgelast && (!opties.act || a.id === opties.act));
    const kies = h.segVal('stWed', wedstrijden[0] && wedstrijden[0].id);
    const a = wedstrijden.find((x) => x.id === kies) || wedstrijden[0];
    const t = M.team(S, teamId); const c = CC.categorie(t.cat);
    // Percentage van de mogelijke speeltijd in bijgewoonde wedstrijden (Besluit 33)
    const seizoen = M.spelers(S, teamId).map((pl) => ({ pl, x: M.speeltijdStand(S, pl) })).sort((a, b) => (a.x.pct ?? -1) - (b.x.pct ?? -1));
    const gemistTekst = (g) => Object.entries(g).map(([r, n]) => `${n}× ${r.toLowerCase()}`).join(', ');
    const tabel = `${h.sectie('Speeltijd dit seizoen')}<div class="balkjes">${seizoen.map(({ pl, x }) => `<div class="balkje"><span>${esc(pl.voornaam)}</span><i style="--w:${x.pct ?? 0}%"></i><b>${x.pct == null ? '–' : x.pct + '%'}</b></div>`).join('')}</div>
      <p class="zacht klein">Percentage van de mogelijke speeltijd in de wedstrijden waarbij het kind er was. Gemiste wedstrijden tellen niet mee${seizoen.some(({ x }) => Object.keys(x.gemist).length) ? `: ${seizoen.filter(({ x }) => Object.keys(x.gemist).length).map(({ pl, x }) => `${esc(pl.voornaam)} (${gemistTekst(x.gemist)})`).join(', ')}` : ''}.</p>`;
    if (!a) return h.leeg('Geen wedstrijden gepland') + (opties.alleenSchema ? '' : tabel);
    const sch = S.speeltijd.schema[a.id];
    const naam = (id) => (M.speler(S, id) || {}).voornaam;
    let body;
    if (!sch) {
      const n = M.spelers(S, teamId).filter((pl) => M.status(S, pl, a).code === 'verwacht').length;
      // Selectie (instelbaar): de trainer mag iemand een blok minder geven; de app laat de trainingen van deze week zien
      let minderBlok = '';
      if (!opties.alleenSchema && M.speeltijdAfwijken(S, teamId)) {
        const gekozen = (h.segVal(`minder_${a.id}`, '') || '').split(',').filter(Boolean);
        const week = S.acts.filter((x) => x.teamId === teamId && x.soort === 'training' && !x.afgelast && x.datum < D.vandaag() && x.datum >= D.addDays(D.vandaag(), -7) && S.pres[x.id]);
        const rij = (pl) => { const w = week.map((x) => M.status(S, pl, x)); const er = w.filter((st) => ['aanwezig', 'telaat'].includes(st.code)).length; const niet = w.filter((st) => st.code === 'nietafgemeld').length; const aan = gekozen.includes(pl.id);
          return h.rij({ ic: h.avatar(pl.voornaam), titel: esc(pl.voornaam), sub: `${er} van ${week.length} trainingen deze week${niet ? ` · ${niet}× niet afgemeld` : ''}`, rechts: `<button class="knop klein ${aan ? '' : 'licht'}" data-act="minderBlok" data-a="${a.id}" data-s="${pl.id}">${aan ? 'Blok minder ✓' : 'Blok minder'}</button>` }); };
        minderBlok = `<details class="uitklap" ${gekozen.length ? 'open' : ''}><summary>${icon('sliders-horizontal')}Iemand een blok minder geven${gekozen.length ? ` (${gekozen.length})` : ''}</summary><p class="zacht klein">Alleen als jij dat beslist, bijvoorbeeld na weinig trainen. Het wordt vastgelegd bij deze wedstrijd.</p><div class="lijst compact">${M.spelers(S, teamId).filter((pl) => M.status(S, pl, a).code === 'verwacht').map(rij).join('')}</div></details>`;
      }
      // Wisselen om de … minuten: clubinstelling, de trainer mag per wedstrijd afwijken (Besluit 39)
      const om = Number(h.segVal(`om_${a.id}`, '')) || M.wisselMin(S, teamId); const len = M.blokLengtes(c.duur, om);
      const omKeuze = opties.alleenSchema ? '' : `<label for="st-om">Wisselen om de … minuten</label><input id="st-om" type="number" inputmode="decimal" min="3" max="${c.duur}" step="0.5" value="${om}" data-change="stOm" data-a="${a.id}">
        <p class="zacht klein">${len.length} ${len.length === 1 ? 'blok' : 'wisselblokken'}: ${len.map(M.minTekst).join(' + ')} minuten. Advies: per blok wisselen, om de ${M.minTekst(c.blokMin)} minuten${M.wisselMin(S, teamId) !== c.blokMin ? ` (jullie club: ${M.minTekst(M.wisselMin(S, teamId))})` : ''}.</p>`;
      body = `<div class="kaartje"><p><b>${n} spelers</b> komen · ${c.vorm} · ${c.duur} minuten.</p>${omKeuze}<p class="zacht klein">De app verdeelt de speeltijd eerlijk: wie in de gespeelde wedstrijden het laagste percentage speeltijd had, krijgt voorrang. Gemiste wedstrijden tellen niet mee. De keeper staat de hele wedstrijd op doel en wisselt per week (clubbeleid).</p>${minderBlok}<button class="knop vol" data-act="maakSchema" data-id="${a.id}">${icon('sparkles')}Maak wisselschema</button></div>`;
    } else if (!sch.bevestigd) {
      const cur = sch.huidig;
      const inNu = sch.blokken[cur] || []; const vorig = cur > 0 ? sch.blokken[cur - 1] : [];
      const erin = inNu.filter((x) => !vorig.includes(x)), eruit = vorig.filter((x) => !inNu.includes(x));
      const bank = M.spelers(S, teamId).filter((pl) => M.status(S, pl, a).code === 'verwacht' && !inNu.includes(pl.id));
      const len = M.schemaLengtes(sch); const vanaf = (i) => Math.round(len.slice(0, i).reduce((s, x) => s + x, 0) * 10) / 10;
      // Zelf aanpassen (Besluit 39): tik per blok wie erin staat; de app laat de minuten en het aantal in het veld zien
      const ids = sch.spelers || [...new Set(sch.blokken.flat())]; const kp = sch.keepers[0]; const mins = M.schemaMinuten(sch);
      const doel = Math.min(sch.opVeld || c.opVeld, ids.length);
      const rijen = [kp, ...ids.filter((x) => x !== kp).sort((x, y) => String(naam(x)).localeCompare(String(naam(y))))].filter(Boolean);
      // Veranderd sinds het schema is gemaakt? (afmelding of een nieuw kind) Dan waarschuwen, niet stilletjes laten staan
      const nuKomen = M.spelers(S, teamId).filter((pl) => ['verwacht', 'aanwezig', 'telaat'].includes(M.status(S, pl, a).code)).map((pl) => pl.id);
      const weg = ids.filter((x) => !nuKomen.includes(x)), bij = nuKomen.filter((x) => !ids.includes(x));
      const veranderd = !sch.gestart && (weg.length || bij.length) ? `<div class="info oranje">${icon('triangle-alert')}<span>Sinds je het schema maakte ${[weg.length ? `${weg.map(naam).map(esc).join(', ')} ${weg.length === 1 ? 'komt' : 'komen'} niet meer` : '', bij.length ? `${bij.map(naam).map(esc).join(', ')} ${bij.length === 1 ? 'komt' : 'komen'} erbij` : ''].filter(Boolean).join(' en ')}. ${opties.alleenSchema ? 'Vraag de trainer het schema opnieuw te maken.' : ''}</span></div>${opties.alleenSchema ? '' : `<button class="knop vol" data-act="nieuwSchema" data-id="${a.id}">${icon('refresh-cw')}Maak het schema opnieuw</button>`}` : '';
      const aanpassen = opties.alleenSchema ? '' : `<details class="uitklap" ${sch.gestart ? '' : 'open'}><summary>${icon('sliders-horizontal')}Schema aanpassen</summary>
        <p class="zacht klein">Tik op een vakje om een speler in of uit dat blok te zetten. Rechts de minuten in deze wedstrijd. Het voorstel van de app is eerlijk verdeeld; jij beslist.</p>
        <div class="tabelvak"><table class="tabel wisselgrid"><thead><tr><th></th>${len.map((_, i) => `<th>${M.minTekst(vanaf(i))}'</th>`).join('')}<th>Min.</th></tr></thead><tbody>
        ${rijen.map((id) => `<tr><td>${esc(naam(id))}</td>${sch.blokken.map((b, i) => id === sch.keepers[i] ? '<td><span class="cel k" title="Keeper">K</span></td>' : `<td><button class="cel ${b.includes(id) ? 'aan' : ''}" data-act="stCel" data-a="${a.id}" data-s="${id}" data-b="${i}" ${i < cur ? 'disabled' : ''} aria-label="${esc(naam(id))} blok ${i + 1}: ${b.includes(id) ? 'in het veld' : 'wissel'}">${b.includes(id) ? '✓' : ''}</button></td>`).join('')}<td><b>${M.minTekst(mins[id] || 0)}</b></td></tr>`).join('')}
        <tr class="som"><td>In het veld</td>${sch.blokken.map((b) => `<td class="${b.length !== doel ? 'rood-tekst' : 'zacht'}">${b.length}/${doel}</td>`).join('')}<td></td></tr></tbody></table></div>
        ${sch.blokken.some((b) => b.length !== doel) ? `<p class="klein rood-tekst">Let op: niet in elk blok staan ${doel} spelers in het veld.</p>` : ''}
        <label for="st-kp">Keeper (de hele wedstrijd)</label><select id="st-kp" class="kies" data-change="stKeeper" data-a="${a.id}">${ids.map((x) => `<option value="${x}" ${x === kp ? 'selected' : ''}>${esc(naam(x))}</option>`).join('')}</select></details>`;
      body = `${veranderd}<div class="blokken">${sch.blokken.map((_, i) => `<span class="${i === cur ? 'aan' : i < cur ? 'klaar' : ''}">${i + 1}</span>`).join('')}</div>
        <div class="kaartje"><h4>Blok ${cur + 1} van ${sch.blokken.length} · minuut ${M.minTekst(vanaf(cur))}–${M.minTekst(vanaf(cur + 1))}</h4>
        ${cur > 0 ? `<div class="wissel"><div><small>Erin</small>${erin.map((x) => `<span class="chip groen">${esc(naam(x))}</span>`).join('') || '–'}</div><div><small>Eruit</small>${eruit.map((x) => `<span class="chip grijs">${esc(naam(x))}</span>`).join('') || '–'}</div></div>` : ''}
        ${(sch.minder || []).length ? `<p class="klein zacht">Blok minder (besluit trainer): ${sch.minder.map(naam).map(esc).join(', ')}</p>` : ''}<p><b>Keeper:</b> ${esc(naam(sch.keepers[cur]))}</p><p><b>In het veld:</b> ${inNu.filter((x) => x !== sch.keepers[cur]).map(naam).map(esc).join(', ')}</p><p class="zacht"><b>Wissel:</b> ${bank.map((p) => esc(p.voornaam)).join(', ') || 'niemand'}</p></div>
        ${cur < sch.blokken.length - 1 ? `<p class="klein zacht">Volgende wissel: minuut ${M.minTekst(vanaf(cur + 1))}</p>` : ''}${aanpassen}
        ${cur < sch.blokken.length - 1 ? `<button class="knop groot vol" data-act="volgendBlok" data-id="${a.id}">${icon('skip-forward')}Volgend blok</button>` : `<button class="knop groot vol" data-act="bevestigSchema" data-id="${a.id}">${icon('circle-check')}Wedstrijd klaar: bevestigen</button>`}
        <button class="linkknop" data-act="nieuwSchema" data-id="${a.id}">Schema opnieuw maken</button>`;
    } else body = `<div class="info groen">${icon('circle-check')}<span>Speeltijd van deze wedstrijd is verwerkt in de seizoenstotalen.</span></div>`;
    return `${wedstrijden.length > 1 ? `<label class="klein-kop" for="stw">Wedstrijd</label><select id="stw" class="kies" data-change="kiesStWed">${wedstrijden.map((w) => `<option value="${w.id}" ${w.id === a.id ? 'selected' : ''}>${D.kort(w.datum)} · ${h.actTitel(S, w)}</option>`).join('')}</select>` : ''}
      ${body}${opties.alleenSchema ? '' : tabel}`;
  };
  CC.on('kiesStWed', (el) => { CC.ui.seg.stWed = el.value; CC.render(); });
  CC.on('minderBlok', (el) => { const k = `minder_${el.dataset.a}`; const l = (CC.ui.seg[k] || '').split(',').filter(Boolean); const i = l.indexOf(el.dataset.s); if (i >= 0) l.splice(i, 1); else l.push(el.dataset.s); CC.ui.seg[k] = l.join(','); CC.render(); });
  CC.on('maakSchema', (el) => { const S = CC.S(); const a = M.act(S, el.dataset.id); const minder = M.speeltijdAfwijken(S, a.teamId) ? (CC.ui.seg[`minder_${a.id}`] || '').split(',').filter(Boolean) : []; S.speeltijd.schema[a.id] = M.maakSchema(S, a, minder, Number(CC.ui.seg[`om_${a.id}`]) || null); CC.save(); CC.render(); });
  CC.on('stOm', (el) => { const v = Number(String(el.value).replace(',', '.')); if (!(v >= 3)) return CC.toast('Kies minstens 3 minuten', 'fout'); CC.ui.seg[`om_${el.dataset.a}`] = String(v); CC.render(); });
  CC.on('stCel', (el) => { const S = CC.S(); const sch = S.speeltijd.schema[el.dataset.a]; const b = sch.blokken[Number(el.dataset.b)]; const i = b.indexOf(el.dataset.s); if (i >= 0) b.splice(i, 1); else b.push(el.dataset.s); sch.aangepast = true; CC.save(); CC.render(); });
  // Andere keeper: de twee spelers ruilen hun plek in het hele schema
  CC.on('stKeeper', (el) => { const S = CC.S(); const sch = S.speeltijd.schema[el.dataset.a]; const oud = sch.keepers[0]; const nw = el.value; if (!nw || nw === oud) return; const ruil = (x) => (x === oud ? nw : x === nw ? oud : x); sch.blokken = sch.blokken.map((b) => b.map(ruil)); sch.keepers = sch.keepers.map(() => nw); sch.aangepast = true; CC.save(); CC.render(); });
  CC.on('nieuwSchema', (el) => { const S = CC.S(); delete S.speeltijd.schema[el.dataset.id]; CC.save(); CC.render(); });
  CC.on('volgendBlok', (el) => { const S = CC.S(); const sch = S.speeltijd.schema[el.dataset.id]; sch.huidig++; sch.gestart = true; CC.save(); CC.render(); });
  CC.on('bevestigSchema', (el) => { const S = CC.S(); const sch = S.speeltijd.schema[el.dataset.id]; const kb = S.speeltijd.keeper || (S.speeltijd.keeper = {}); if (sch.keepers[0]) kb[sch.keepers[0]] = (kb[sch.keepers[0]] || 0) + 1; const len = M.schemaLengtes(sch); sch.blokken.forEach((b, i) => b.forEach((id) => { S.speeltijd.min[id] = (S.speeltijd.min[id] || 0) + len[i]; })); const mog = S.speeltijd.mogelijk || (S.speeltijd.mogelijk = {}); (sch.spelers || [...new Set(sch.blokken.flat())]).forEach((id) => { mog[id] = (mog[id] || 0) + (sch.wedMin || len.reduce((s, x) => s + x, 0)); }); sch.bevestigd = true; CC.save(); CC.render(); CC.toast('Speeltijd bijgewerkt'); });

  // Beoordelen: zie beoordeling.js (Besluit 23)

  // Spelers filteren en sorteren (trainer en teamleider)
  // Spelers sorteren (trainer en teamleider). Filters zijn weg (Besluit 50): bij ± 17 spelers staat alles al in de rij
  // (aanwezigheid, afgemeld/langdurig, kaarten, zone, beoordeeld); sorteren zet wie aandacht nodig heeft bovenaan.
  CC.spelerFilter = (S, tid, eenvoudig) => {
    const per = M.periode(S, 'blok'); const so = h.segVal('spSort', 'naam');
    const volg = M.komend(S, tid, 8).find((a) => !a.afgelast);
    const rijen = M.spelers(S, tid).map((pl) => { const st = M.stats(S, pl, per); const k = M.kaarten(S, pl); return { pl, st, k, z: M.zone(S, st.pct, tid), vs: volg ? M.status(S, pl, volg) : null, b: CC.beoordLaatste ? CC.beoordLaatste(S, pl.id) : null }; });
    const sorteer = { naam: (a, b) => M.naam(S, a.pl).localeCompare(M.naam(S, b.pl)), laag: (a, b) => (a.st.pct ?? 101) - (b.st.pct ?? 101), hoog: (a, b) => (b.st.pct ?? -1) - (a.st.pct ?? -1), kaarten: (a, b) => (b.k.geel + 2 * b.k.rood) - (a.k.geel + 2 * a.k.rood) }[so] || ((a, b) => M.naam(S, a.pl).localeCompare(M.naam(S, b.pl)));
    const lijst = rijen.sort(sorteer);
    const opties = eenvoudig ? [] : [['naam', 'Op naam'], ['laag', 'Aanwezigheid: laagste eerst'], ['hoog', 'Aanwezigheid: hoogste eerst'], ['kaarten', 'Meeste kaarten eerst']];
    const bar = opties.length ? `<label class="sorteer">${icon('sliders-horizontal')}<select data-change="spSort" aria-label="Sorteren">${opties.map(([k, l]) => `<option value="${k}" ${k === so ? 'selected' : ''}>${l}</option>`).join('')}</select><small class="zacht">${rijen.length} spelers</small></label>` : '';
    return { bar, lijst, volg };
  };
  CC.on('spSort', (el) => { CC.ui.seg.spSort = el.value; CC.render(); });
  CC.on('kiesBeoSp', (el) => { CC.ui.seg.beoSp = el.value; CC.render(); });

  // ---------- Trainer ----------
  // Opschalingsstap als rij; bij "bellen" direct bel- en WhatsApp-knop naar de ouder
  CC.stapRij = (S, s) => {
    const pl = M.speler(S, s.spelerId); const o = pl && M.persoon(S, pl.ouders[0]);
    // Bellen: 1) bel of app de ouder, 2) leg vast wat je afsprak (dan verdwijnt de stap)
    const knoppen = s.soort === 'bellen' && o && CC.mag('bellen', null, pl.teamId) ? `<div class="stap-knoppen">${o.tel ? `<a class="knop klein licht" href="tel:${esc(o.tel)}">${icon('phone')}Bel ${esc(o.naam.split(' ')[0])}</a><a class="knop klein licht" href="https://wa.me/${CC.waNummer(o.tel)}" target="_blank" rel="noopener">${icon('message-circle')}WhatsApp</a>` : `<button class="knop klein licht" data-act="geenTel" data-naam="${esc(o.naam)}">${icon('phone')}Nog geen nummer</button>`}<button class="knop klein" data-act="gesprekVastleggen" data-id="${s.spelerId}">${icon('check')}Contact vastleggen</button></div>` : '';
    const rij = h.rij({ ic: s.soort === 'bellen' ? 'phone' : 'users', titel: esc(s.tekst), sub: esc(s.sub), kleur: 'rood', act: 'open', attrs: `data-view="speler" data-id="${s.spelerId}"` });
    return knoppen ? `<div class="signaal">${rij}<div class="signaal-voet">${knoppen}</div></div>` : rij;
  };
  CC.signaalRijAfdoen = (S, s) => {
    const rij = signaalRij(S, s);
    if (!s.afdoenbaar || !CC.mag('afdoen')) return rij;
    const knop = `<button class="knop klein licht" data-act="signaalAfdoen" data-sleutel="${esc(s.sleutel)}">${icon('check')}${s.soort === 'telaat' ? 'Begrijpelijk' : 'Gezien'}</button>`;
    return `<div class="signaal">${rij}<div class="signaal-voet">${knop}<small class="zacht">${s.soort === 'telaat' ? 'geaccepteerd; komt terug als het vaker gebeurt' : 'geen actie nodig'}</small></div></div>`;
  };
  CC.on('snelGebeld', (el) => { const S = CC.S(); S.gesprekken.push({ id: 'g' + Date.now(), spelerId: el.dataset.id, soort: 'gebeld', datum: D.vandaag(), door: CC.me().id, notitie: 'Gebeld (notitie kan nog worden aangevuld)', afspraak: '' }); CC.save(); CC.render(); CC.toast('Vastgelegd als gebeld. Aanvullen kan bij de speler.'); });
  const signaalRij = (S, s) => h.rij({ ic: ['bellen'].includes(s.soort) ? 'phone' : ['gesprekHjo', 'clubbesluit'].includes(s.soort) ? 'users' : s.soort === 'gesprek' ? 'message-circle' : s.soort === 'lang' ? 'hospital' : s.soort === 'patroon' ? 'repeat' : s.soort === 'telaat' ? 'clock' : 'triangle-alert', titel: esc(s.tekst), sub: esc(s.sub || ''), kleur: s.niveau === 'info' ? '' : s.niveau, act: s.spelerId ? 'open' : '', attrs: s.spelerId ? `data-view="speler" data-id="${s.spelerId}"` : '' });
  CC.signaalRij = signaalRij;
  // Home toont alleen voorgestelde gesprekken los; overige signalen in één regel (weinig scrollen)
  CC.signaalRegels = (S, tid, zonderLang) => {
    const sig = M.signalen(S, [tid], false).filter((s) => !(zonderLang && s.soort === 'lang'));
    const stappen = ['bellen', 'gesprekHjo', 'clubbesluit'];
    const magStap = (s) => stappen.includes(s.soort) && CC.mag({ bellen: 'bellen', gesprekHjo: 'gesprek', clubbesluit: 'clubbesluit' }[s.soort], null, tid);
    const gesprek = sig.filter(magStap); const rest = sig.filter((s) => !magStap(s));
    const namen = [...new Set(rest.map((s) => s.tekst.split(':')[0].split(' ')[0]))];
    return [...gesprek.map((s) => CC.stapRij(S, s)), rest.length ? h.rij({ ic: 'triangle-alert', titel: `${namen.length} ${namen.length === 1 ? 'speler vraagt' : 'spelers vragen'} aandacht`, sub: namen.join(', '), kleur: 'oranje', act: 'open', attrs: `data-view="teamSignalen" data-team="${tid}"` }) : ''].filter(Boolean);
  };
  CC.views.teamSignalen = (S, p) => {
    const sig = M.signalen(S, [p.team], false);
    const af = M.afgedaanRecent(S, [p.team]);
    return { titel: 'Signalen', html: `<p class="zacht klein">ClubComm signaleert; jij en de ${M.team(S, p.team).teamleiderId ? 'teamleider' : 'trainer'} beslissen. Is er niets aan de hand? Tik op <b>Gezien</b>. Het signaal komt terug als het erger wordt.</p>
      <div class="lijst">${sig.map((s) => (s.afdoenbaar ? CC.signaalRijAfdoen(S, s) : CC.stapRij(S, s))).join('') || h.leeg('Geen signalen')}</div>
      ${af.length ? `<details class="uitklap"><summary>${icon('check')}Afgedaan (${af.length})</summary><div class="lijst compact">${af.map((x) => h.rij({ ic: 'check', titel: esc(x.tekst), sub: `${esc((M.persoon(S, x.door) || { naam: '' }).naam)} · ${D.tijdstip(x.tijd)}${x.notitie ? ' · ' + esc(x.notitie) : ''}` })).join('')}</div></details>` : ''}` };
  };
  CC.on('signaalAfdoen', (el) => {
    const S = CC.S(); const sleutel = el.dataset.sleutel;
    CC.sheet('Gezien, geen actie nodig', `<form data-submit="signaalAfdoenOk" data-sleutel="${esc(sleutel)}" class="codeform"><label for="sa-n">Korte notitie (mag leeg)</label><input id="sa-n" name="n" placeholder="Bijv. zwemles op vrijdag, besproken met ouder">
      <button class="knop vol">${icon('check')}Afdoen</button><p class="zacht klein">Het signaal verdwijnt. Wordt het erger (nieuwe afwezigheid of van oranje naar rood), dan komt het terug. De ${esc(S.club.labels.hjo)} ziet dat het is afgedaan.</p></form>`);
  });
  CC.on('signaalAfdoenOk', (f) => {
    const S = CC.S(); const alle = [...new Set(S.teams.map((t) => t.id))];
    const s = M.signalen(S, alle, true).find((x) => x.sleutel === f.dataset.sleutel) || M.signalen(S, alle, false).find((x) => x.sleutel === f.dataset.sleutel);
    if (s) (S.signaalAfgedaan || (S.signaalAfgedaan = [])).push({ sleutel: s.sleutel, teamId: s.teamId, spelerId: s.spelerId, soort: s.soort, niveau: s.niveau, ernst: s.ernst || 0, tekst: s.tekst, notitie: f.n.value, door: CC.me().id, tijd: new Date().toISOString() });
    CC.save(); CC.closeSheet(); CC.render(); CC.toast('Afgedaan');
  });

  CC.rollen.trainer = {
    context(S) { const t = M.team(S, CC.teamId()); return { titel: t.naam, sub: `Trainer · ${S.club.naam}` }; },
    tabs(S) { const me = CC.me(); return [['home', 'Home', 'house'], ['aanwezigheid', 'Aanwezigheid', 'clipboard-check'], ['berichten', 'Berichten', 'message-circle', M.ongelezen(S, me.id)], ['spelers', 'Spelers', 'users'], S.club.modules.speeltijd && ['speeltijd', 'Speeltijd', 'timer']]; },
    schermen: {
      home(S) {
        const tid = CC.teamId(); const t = M.team(S, tid); const me = CC.me();
        const volgendeT = M.komend(S, tid, 8).find((a) => !a.afgelast);
        if (!volgendeT) return h.leeg('Geen activiteiten gepland');
        const sp = M.spelers(S, tid).map((pl) => ({ pl, st: M.status(S, pl, volgendeT) }));
        const af = sp.filter((x) => ['afgemeld', 'langdurig'].includes(x.st.code));
        const vandaag = S.acts.find((a) => a.teamId === tid && a.datum === D.vandaag() && !a.afgelast);
        const acties = [];
        const n = M.ongelezen(S, me.id); if (n) acties.push(h.rij({ ic: 'message-circle', titel: `${n} ${n === 1 ? 'nieuw bericht' : 'nieuwe berichten'}`, act: 'tab', attrs: 'data-tab="berichten"', kleur: 'blauw' }));
        // Aanmeldingen: zonder teamleider keurt de trainer goed; met teamleider pas als het langer dan een dag blijft liggen (Besluit 47)
        { const open = S.aanm.filter((x) => x.teamId === tid && x.status === 'open'); const lang = open.filter((x) => Date.now() - new Date(x.tijd) > 24 * 3600e3);
          if (!t.teamleiderId && open.length) acties.push(h.rij({ ic: 'user-check', titel: `${open.length} aanmelding${open.length > 1 ? 'en' : ''} goedkeuren`, sub: 'Dit team heeft geen teamleider, dus jij keurt goed', act: 'open', attrs: 'data-view="aanmeldingen"', kleur: 'oranje' }));
          else if (lang.length) acties.push(h.rij({ ic: 'user-check', titel: `${lang.length} aanmelding${lang.length > 1 ? 'en wachten' : ' wacht'} al een dag`, sub: 'De teamleider heeft nog niet goedgekeurd. Jij kunt het ook doen.', act: 'open', attrs: 'data-view="aanmeldingen"', kleur: 'oranje' })); }
        acties.push(...CC.signaalRegels(S, tid, true));
        // Herinnering: training van een eerdere dag waarvan de aanwezigheid nog niet is ingevuld, zolang het nog kan
        S.acts.filter((a) => a.teamId === tid && !M.isWed(a) && a.datum < D.vandaag() && !a.afgelast && !a.vervangerId && !S.pres[a.id] && kanOpnemen(a)).forEach((a) => {
          const tot = CC.opnemenTot(a);
          acties.push(h.rij({ ic: 'clipboard-check', titel: 'Aanwezigheid nog niet ingevuld', sub: `${a.soort === 'activiteit' ? esc(a.naam || 'Activiteit') : 'Training'} ${D.kort(a.datum)} ${a.tijd} · kan nog tot ${D.kort(D.iso(tot))} ${String(tot.getHours()).padStart(2, '0')}:${String(tot.getMinutes()).padStart(2, '0')}`, kleur: 'oranje', act: 'open', attrs: `data-view="opnemen" data-id="${a.id}"` }));
        });
        const mat = CC.materiaalRij && CC.mag('materiaal') && CC.materiaalRij(S, tid); if (mat) acties.push(mat);
        if (CC.beoordRijTrainer) acties.push(...CC.beoordRijTrainer(S, tid));
        return `<article class="kaartje hoofd">
            <small>${D.relatief(volgendeT.datum)}${volgendeT.soort !== 'training' ? '' : ''}</small><h2>${h.actTitel(S, volgendeT)}</h2><p class="zacht">${h.actSub(S, volgendeT)}</p>
            <div class="verwacht"><b>${sp.length - af.length}</b><span>van ${sp.length} verwacht</span></div>
            ${af.length ? `<div class="lijst compact">${af.map((x) => h.rij({ ic: h.reden(x.st.afm ? x.st.afm.reden : 'Blessure'), titel: esc(M.naam(S, x.pl)), sub: x.st.code === 'langdurig' ? `Langdurig afwezig (${esc(x.st.lang.reden.toLowerCase())})` : `${esc(x.st.afm.reden)}${x.st.afm.opm ? ' · ' + esc(x.st.afm.opm) : ''}` })).join('')}</div>` : '<p class="zacht">Iedereen komt.</p>'}
            ${vandaag ? (S.pres[vandaag.id] ? `<button class="knop licht vol" data-act="open" data-view="opnemen" data-id="${vandaag.id}">${icon('circle-check')}Aanwezigheid opgeslagen · aanpassen</button>` : `<button class="knop groot vol" data-act="open" data-view="opnemen" data-id="${vandaag.id}">${icon('clipboard-check')}Aanwezigheid opnemen</button>`) : ''}
            ${CC.kanNietBlok ? CC.kanNietBlok(S, volgendeT, true) : ''}
          </article>
          ${h.actieBlok(acties, 'nieuwe berichten, aanmeldingen, aanwezigheid die nog open staat of spelers die vaak afwezig zijn')}`;
      },
      aanwezigheid(S) {
        const tid = CC.teamId(); const modus = h.segVal('aanwModus', 'opnemen');
        if (modus === 'overzicht') return h.seg('aanwModus', [['opnemen', 'Opnemen'], ['overzicht', 'Overzicht']], 'opnemen') + CC.overzichtHtml(S, tid);
        const ma = (() => { const d = D.parse(D.vandaag()); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return D.iso(d); })();
        const acts = M.acts(S, tid, D.addDays(ma, -7), D.addDays(ma, 13));
        const standaard = (acts.find((a) => a.datum === D.vandaag()) || acts.filter((a) => a.datum <= D.vandaag()).pop() || acts[0]);
        const kies = h.segVal('aanwAct', standaard && standaard.id);
        const a = acts.find((x) => x.id === kies) || standaard;
        return `${h.seg('aanwModus', [['opnemen', 'Opnemen'], ['overzicht', 'Overzicht']], 'opnemen')}
          <div class="weekstrook" role="tablist">${acts.map((x) => { const d = D.parse(x.datum); return `<button role="tab" aria-selected="${x.id === a.id}" class="${x.id === a.id ? 'aan' : ''} ${x.afgelast ? 'afg' : ''} ${x.datum === D.vandaag() ? 'vandaag' : ''} ${S.pres[x.id] ? 'gedaan' : ''}" data-act="seg" data-key="aanwAct" data-val="${x.id}"><small>${D.DAG_KORT[d.getDay()]}</small><b>${d.getDate()}</b><small>${x.soort === 'training' ? 'T' : 'W'}</small></button>`; }).join('')}</div>
          ${a ? `<div class="kaart-kop los">${h.datumBlok(a)}<div><b>${h.actTitel(S, a)}</b><small>${h.actSub(S, a)}</small></div></div>${CC.opnemenHtml(S, a)}${CC.kanNietBlok && D.start(a) > new Date() ? CC.kanNietBlok(S, a) : ''}` : ''}
          ${CC.mag('planning') ? `<button class="knop licht vol" data-act="planningAanpassen">${icon('calendar-plus')}Planning aanpassen of iets toevoegen (activiteit, oefenwedstrijd)</button>` : ''}`;
      },
      berichten: (S) => CC.berichtenScherm(S, { nieuw: true }),
      spelers(S) {
        const tid = CC.teamId(); const per = M.periode(S, 'blok');
        return `<div class="knoppen">${CC.mag('beoordelen') ? `<button class="knop" data-act="open" data-view="beoordelen">${icon('star')}Beoordelen</button>` : ''}<button class="knop licht" data-act="uitnodigSheet">${icon('user-plus')}Ouders uitnodigen</button></div>
          ${(() => { const open = S.aanm.filter((x) => x.teamId === tid && x.status === 'open').length; return open ? `<div class="lijst">${h.rij({ ic: 'user-check', titel: `${open} aanmelding${open > 1 ? 'en' : ''} om goed te keuren`, sub: M.team(S, tid).teamleiderId ? 'Meestal doet de teamleider dit; jij kunt het ook' : 'Jij keurt goed (dit team heeft geen teamleider)', act: 'open', attrs: 'data-view="aanmeldingen"' })}</div>` : ''; })()}
          ${(() => { const F = CC.spelerFilter(S, tid); return `${F.bar}<div class="lijst">${F.lijst.map(({ pl, st, k, z, vs, b }) => h.rij({ ic: h.avatar(pl.voornaam), titel: esc(M.naam(S, pl)), sub: `${st.pct == null ? '–' : st.pct + '%'} aanwezig${vs && vs.code !== 'verwacht' ? ` · ${h.chip(vs)}` : ''} · ${b ? `beoordeeld (${b.m.naam.toLowerCase()})` : 'nog niet beoordeeld'}`, rechts: h.let(S, pl, k) + h.stip(z), act: 'open', attrs: `data-view="speler" data-id="${pl.id}"` })).join('') || h.leeg('Nog geen spelers')}</div>`; })()}
          ${CC.materiaalStatus && S.club.modules.materiaal ? `${h.sectie('Team')}<div class="lijst">${CC.materiaalStatus(S, tid)}</div>` : ''}`;
      },
      speeltijd: (S) => CC.speeltijdHtml(S, CC.teamId()),
    },
  };
  CC.on('planningAanpassen', () => CC.wijzigingSheet());
  CC.on('uitnodigSheet', () => CC.sheet('Ouders uitnodigen', `<p class="zacht">Deel de uitnodiging van ${esc(CC.tn(CC.teamId()))}. Ouders vullen zelf hun e-mail en de naam van hun kind in; daarna keur je goed.</p>${CC.uitnodigBlok(CC.teamId())}`));

  // Overzicht per speler (trainer + teamleider)
  CC.overzichtHtml = (S, tid) => {
    const per = M.periode(S, h.segVal('ovPer', 'blok'));
    const rijen = M.spelers(S, tid).map((pl) => ({ pl, st: M.stats(S, pl, per), k: M.kaarten(S, pl) })).sort((a, b) => (a.st.pct ?? 101) - (b.st.pct ?? 101));
    const ts = M.teamStats(S, tid, per);
    return `${h.seg('ovPer', [['blok', 'Deze fase'], ['seizoen', 'Heel seizoen']], 'blok')}
      <p class="zacht klein">Team: <b>${ts.pct ?? '–'}%</b> aanwezig · ${M.team(S, tid).type} · laagste bovenaan</p>
      <div class="lijst">${rijen.map(({ pl, st, k }) => h.rij({ ic: h.stip(M.zone(S, st.pct, tid)), titel: esc(M.naam(S, pl)), sub: `${st.pct == null ? '–' : st.pct + '%'} aanwezig (${h.split(st).toLowerCase()})${st.telaat ? ` · ${st.telaat}× te laat` : ''}${st.lang ? ' · langdurig' : ''}`, rechts: h.let(S, pl, k), act: 'open', attrs: `data-view="speler" data-id="${pl.id}"` })).join('')}</div>`;
  };
})();
